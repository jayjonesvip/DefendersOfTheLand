"""Check the generated Aftershock interior, measured cover and ebook upload files."""
import hashlib
import json
import pathlib

import pymupdf as fitz
from PIL import Image
from print_resolution import inspect_image_resolution

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/publishing'
book = json.loads((ROOT / 'content/books/book-two/book.json').read_text())
build = json.loads((OUT / 'book-two-pdf-build.json').read_text())
spec = json.loads((OUT / 'book-two-print-specifications.json').read_text())
expected_images = sum(bool(block.get('art')) for chapter in book['chapters']
                      for block in json.loads((ROOT / 'content/books/book-two' / chapter).read_text())['blocks'])


def inspect_pdf(name, width, height, interior=False):
    path = OUT / name
    fonts, image_dpi = set(), []
    with fitz.open(path) as doc:
        resolution = inspect_image_resolution(doc) if interior else None
        assert not doc.is_encrypted and not doc.get_toc()
        for page in doc:
            assert abs(page.rect.width - width * 72) < .1
            assert abs(page.rect.height - height * 72) < .1
            assert not page.get_links(), 'Print PDF contains links'
            assert not list(page.annots() or []) and not list(page.widgets() or [])
            fonts.update(font[0] for font in page.get_fonts())
            pictures = [fitz.Rect(image['bbox']) for image in page.get_image_info()]
            for image, box in zip(page.get_image_info(), pictures):
                assert page.rect.contains(box)
                image_dpi.append(min(image['width'] * 72 / box.width, image['height'] * 72 / box.height))
            if interior:
                for block in page.get_text('dict')['blocks']:
                    if block['type'] != 0:
                        continue
                    for line in block['lines']:
                        for span in line['spans']:
                            box = fitz.Rect(span['bbox'])
                            assert box.x0 >= 27 and box.x1 <= 405
                            assert box.y0 >= 18 and box.y1 <= 630
                            assert not any(box.intersects(picture) for picture in pictures)
        assert all(doc.extract_font(xref)[3] for xref in fonts), 'Font is not embedded'
        return {'file': name, 'pages': len(doc), 'images': len(image_dpi),
                'minimumPlacedImageDpi': resolution['minimumPlacedImageDpi'] if interior else min(image_dpi),
                'minimumRequiredDpi': 300 if interior else None,
                'embeddedFonts': len(fonts), 'interactiveObjects': 0,
                'bytes': path.stat().st_size, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}


interior = inspect_pdf('book-two-kdp-interior.pdf', 6, 9, interior=True)
assert book['status'] == build['manuscriptStatus'] == 'Manuscript complete'
assert build['paperbackInterior'] and build['printPdfNavigationRemoved']
assert build['chapters'] == build['contentsPageNumbersChecked'] == len(book['chapters']) == 21
assert interior['images'] == build['interiorIllustrations'] == expected_images == 57
assert interior['pages'] == build['pages'] == spec['interiorPages']
assert 72 <= interior['pages'] <= 600 and interior['pages'] % 2 == 0
assert interior['sha256'] == build['sha256'] == spec['interiorSha256']
assert spec['interiorFile'] == interior['file'] and not spec['provisional']
assert abs(spec['spineInches'] - interior['pages'] * .002252) < 1e-9
assert abs(spec['wrapInches'][0] - (12.25 + spec['spineInches'])) < 1e-9
assert spec['wrapInches'][1] == 9.25 and spec['bleedInches'] == .125
assert spec['barcodeBoxInches'] == [2, 1.2]
cover = inspect_pdf('book-two-kdp-cover.pdf', *spec['wrapInches'])
assert cover['pages'] == 1 and cover['sha256'] == spec['sha256']
with fitz.open(OUT / cover['file']) as doc:
    spine_left, spine_right = 6.125 * 72, (6.125 + spec['spineInches']) * 72
    for block in doc[0].get_text('dict')['blocks']:
        if block['type'] != 0:
            continue
        for line in block['lines']:
            for span in line['spans']:
                box = fitz.Rect(span['bbox'])
                if line['dir'] == (0., 1.):
                    assert box.x0 >= spine_left + 4.5 and box.x1 <= spine_right - 4.5
                else:
                    assert box.x0 >= 27 and box.x1 <= spine_left - 18
                    assert box.y0 >= 27 and box.y1 <= 639
assert spec['printFrontEffectiveDpi'] >= 300
with Image.open(OUT / 'book-two-ebook-cover.jpg') as image:
    assert image.mode == 'RGB' and image.width >= 625 and image.height >= 1000
    ebook_cover = {'file': 'book-two-ebook-cover.jpg', 'pixels': list(image.size)}

report = {'book': 'Book Two: Aftershock', 'result': 'File checks passed; physical proof pending',
          'interior': interior, 'cover': cover, 'ebookCover': ebook_cover,
          'paperbackSettings': {'trim': '6 x 9 inches', 'paper': 'standard-color-white',
                               'interiorBleed': False, 'pages': interior['pages'],
                               'spineInches': spec['spineInches'], 'wrapInches': spec['wrapInches']},
          'sourceFrontEffectiveDpi': spec['originalFrontEffectiveDpi'],
          'printFrontEffectiveDpi': spec['printFrontEffectiveDpi'],
          'coverTextMarginsChecked': True}
(OUT / 'book-two-preflight.json').write_text(json.dumps(report, indent=2) + '\n')
(OUT / 'book-two-upload-guide.txt').write_text(
    'BOOK TWO: AFTERSHOCK — UPLOAD FILES\n\n'
    'Paperback interior: book-two-kdp-interior.pdf\n'
    'Paperback cover: book-two-kdp-cover.pdf (complete back/spine/front wrap)\n'
    'Settings: 6 x 9 inches; standard color; white paper; no-bleed interior.\n'
    f'Interior pages: {interior["pages"]}. Measured spine: {spec["spineInches"]:.6f} inches.\n'
    'Cover includes 0.125-inch outer bleed and a reserved barcode area.\n\n'
    'Kindle manuscript: defenders-of-the-land-book-two.epub\n'
    'Kindle cover: book-two-ebook-cover.jpg\n\n'
    'Review copy: defenders-of-the-land-book-two-illustrated.pdf\n'
    'Use the KDP interior file for print; the review copy includes its own front cover.\n'
    'File checks passed. Inspect the KDP preview and physical proof before publication.\n')
print(f'PASS: Book Two KDP preflight; {interior["pages"]} pages, 57 images, embedded fonts, '
      'measured spine, matching checksums and no interactive print objects.')
