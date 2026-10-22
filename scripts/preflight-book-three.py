"""Read-only checks of the generated Book Three KDP upload files."""
import datetime, hashlib, json, pathlib, zoneinfo
import pymupdf as fitz
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/publishing'
spec = json.loads((OUT / 'book-three-print-specifications.json').read_text())
build = json.loads((OUT / 'book-three-pdf-build.json').read_text())
book = json.loads((ROOT / 'content/books/book-three/book.json').read_text())
assert book['status'] == 'Manuscript complete'
assert build['manuscriptStatus'] == 'Manuscript complete'
assert build['contentsPageNumbersChecked'] == len(book['chapters'])
expected_images = sum(bool(block.get('art')) for name in book['chapters']
                      for block in json.loads((ROOT / 'content/books/book-three' / name).read_text())['blocks'])

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def inspect_pdf(name, width, height, *, interior=False):
    path = OUT / name
    assert path.stat().st_size < 650 * 1024 * 1024, 'File exceeds 650 MiB'
    with fitz.open(path) as doc:
        assert not doc.is_encrypted
        assert not doc.get_toc(), 'Print PDF contains bookmarks'
        fonts, dpi, image_count = set(), [], 0
        inner_margin = 27 if len(doc) <= 150 else 36 if len(doc) <= 300 else 45 if len(doc) <= 500 else 54
        for page in doc:
            assert abs(page.rect.width - width * 72) < .1
            assert abs(page.rect.height - height * 72) < .1
            assert not page.get_links(), 'Print PDF contains links'
            assert not list(page.annots() or []) and not list(page.widgets() or [])
            fonts.update(font[0] for font in page.get_fonts())
            for image in page.get_image_info():
                box = fitz.Rect(image['bbox'])
                assert page.rect.contains(box)
                dpi.append(min(image['width'] / (box.width / 72), image['height'] / (box.height / 72)))
                image_count += 1
            if interior:
                for block in page.get_text('dict')['blocks']:
                    if block['type'] != 0:
                        continue
                    for line in block['lines']:
                        for span in line['spans']:
                            box = fitz.Rect(span['bbox'])
                            assert box.x0 >= 18 and box.x1 <= 432 - 18
                            assert box.y0 >= 18 and box.y1 <= 648 - 18
                            assert span['size'] >= 6.99  # PDF rounding of a nominal 7 pt header.
                            # The inner edge alternates between right and left.
                            assert (432 - box.x1 if page.number % 2 else box.x0) >= inner_margin
        assert all(doc.extract_font(xref)[3] for xref in fonts), 'Font is not embedded'
        assert min(dpi) >= 299.9
        return {'file': name, 'pages': len(doc), 'images': image_count,
                'minimumPlacedImageDpi': round(min(dpi), 2),
                'embeddedFonts': len(fonts), 'bytes': path.stat().st_size,
                'sha256': digest(path), 'interactiveObjects': 0}

interior = inspect_pdf('book-three-kdp-interior.pdf', 6, 9, interior=True)
assert interior['pages'] == spec['interiorPages'] == build['pages']
assert 72 <= interior['pages'] <= 600 and interior['pages'] % 2 == 0
assert interior['images'] == expected_images == build['interiorIllustrations']
assert interior['sha256'] == spec['interiorSha256'] == build['sha256']
assert abs(spec['spineInches'] - interior['pages'] * .002252) < 1e-9
assert abs(spec['wrapInches'][0] - (12.25 + spec['spineInches'])) < 1e-9
assert spec['wrapInches'][1] == 9.25 and spec['bleedInches'] == .125
assert spec['barcodeBoxInches'] == [2, 1.2]
cover = inspect_pdf('book-three-kdp-cover.pdf', *spec['wrapInches'])
assert cover['pages'] == 1 and cover['sha256'] == spec['sha256']
with fitz.open(OUT / 'book-three-kdp-cover.pdf') as doc:
    spine_left, spine_right = 6.125 * 72, (6.125 + spec['spineInches']) * 72
    for block in doc[0].get_text('dict')['blocks']:
        if block['type'] == 0:
            for line in block['lines']:
                for span in line['spans']:
                    box = fitz.Rect(span['bbox'])
                    assert doc[0].rect.contains(box)
                    if line['dir'] == (0., 1.):
                        assert box.x0 >= spine_left + 4.5 and box.x1 <= spine_right - 4.5
                    else:
                        # Back-cover typography must clear trim edges and fold.
                        assert box.x0 >= 27 and box.x1 <= spine_left - 18
                        assert box.y0 >= 27 and box.y1 <= 639
with Image.open(OUT / 'book-three-ebook-cover.jpg') as image:
    assert image.mode == 'RGB' and image.width >= 625 and image.height >= 1000
    assert max(image.size) <= 10000
    ebook_cover = {'file': 'book-three-ebook-cover.jpg', 'pixels': list(image.size), 'mode': image.mode}

report = {
    'date': str(datetime.datetime.now(zoneinfo.ZoneInfo('America/New_York')).date()),
    'result': 'File preflight passed; KDP Print Previewer and physical proof still required',
    'interior': interior, 'cover': cover, 'ebookCover': ebook_cover,
    'paperbackSettings': {'trim': '6 x 9 inches', 'inkAndPaper': 'Standard color, white paper',
                          'interiorBleed': 'No bleed', 'coverBleedInches': .125,
                          'pages': interior['pages'], 'spineInches': spec['spineInches'],
                          'wrapInches': spec['wrapInches']},
    'coverQuality': {'nativeFrontEffectiveDpi': spec['originalFrontEffectiveDpi'],
                     'placedPrintFileDpi': spec['printFrontEffectiveDpi'],
                     'note': 'The approved front is resampled to 300 DPI from approximately 186-DPI source art. Resampling adds no genuine detail. Inspect small lettering and faces in a physical proof.'},
    'uploadChecks': ['Upload the interior PDF and the single full-wrap KDP cover PDF; individual front/back PDFs are review assets.',
                     'Match title Lava Lips, series Defenders of the Land, volume 3, and author Jay Jones in the listing.',
                     'Choose or supply the paperback ISBN; leave the reserved white barcode area for KDP.',
                     'Complete KDP AI-generated-content disclosure accurately for generated text and illustrations.',
                     'Review KDP Print Previewer and order a physical proof before approving publication.'],
    'verificationLimits': 'Official KDP help pages were attempted but network access was blocked. This checks known production specifications, not a live KDP acceptance decision.'}
(OUT / 'book-three-preflight.json').write_text(json.dumps(report, indent=2) + '\n')
(OUT / 'book-three-upload-guide.txt').write_text(
    'BOOK THREE: LAVA LIPS — KDP UPLOAD GUIDE\n\n'
    'Paperback interior: book-three-kdp-interior.pdf\n'
    'Paperback cover: book-three-kdp-cover.pdf (one complete back/spine/front wrap)\n'
    'Settings: 6 x 9 inches; standard color; white paper; NO BLEED interior.\n'
    f'Page count: {interior["pages"]}. Spine: {spec["spineInches"]:.6f} inches.\n'
    'The cover already includes its separate 0.125-inch outer bleed.\n'
    'Suggested finish: glossy for the bright comic artwork; matte is also available.\n\n'
    'Kindle manuscript: defenders-of-the-land-book-three.epub\n'
    'Kindle cover: book-three-ebook-cover.jpg (not the paperback wrap)\n\n'
    + '\n'.join('- ' + item for item in report['uploadChecks']) + '\n\n'
    + report['coverQuality']['note'] + '\n'
    'Local file checks do not guarantee Amazon acceptance.\n')
print(f'PASS: Book Three KDP file preflight; {interior["pages"]} pages, {expected_images} images, embedded fonts, safe margins, correct wrap/spine and no print navigation.')
print('PROOF CHECK: cover source art is approximately 186 DPI before resampling; inspect physical proof.')
