"""Validate Book Four's complete KDP wrap against the actual interior PDF."""
import hashlib
import json
import pathlib
import re

import pymupdf as fitz
from PIL import Image
from print_resolution import inspect_image_resolution

root = pathlib.Path(__file__).resolve().parents[1]
out = root / 'output/publishing'
config = json.loads((root / 'print/book-four-cover.json').read_text())
settings = json.loads((root / 'print/book-four-interior.json').read_text())
spec = json.loads((out / 'book-four-print-specifications.json').read_text())
digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
normalize = lambda s: re.sub(r'\s+', '', s)
interior = out / config['interiorPdf']
cover = out / 'book-four-kdp-cover.pdf'
assert config['paper'] == settings['paper'] == spec['paper'] == 'standard-color-white'
assert spec['trimInches'] == [settings['trimWidthInches'], settings['trimHeightInches']] == [6, 9]
assert spec['bleedInches'] == config['bleedInches'] == .125
assert spec['provisional'] is False and not spec['interiorBleed']
assert spec['interiorSha256'] == digest(interior), 'Cover is stale: interior checksum changed'
assert spec['sha256'] == digest(cover), 'Cover checksum mismatch'
with fitz.open(interior) as doc:
    pages = len(doc)
assert spec['interiorPages'] == pages and pages % 2 == 0 and pages >= 72
spine = pages * .002252
assert abs(spec['spineInches'] - spine) < 1e-9
assert all(abs(a - b) < 1e-9 for a, b in zip(spec['wrapInches'], [12.25 + spine, 9.25]))
assert spec['barcodeBoxInches'] == [2, 1.2]
assert cover.stat().st_size < 650 * 1024 * 1024
with fitz.open(cover) as doc:
    assert len(doc) == 1 and not doc.is_encrypted and not doc.get_toc()
    page = doc[0]
    assert abs(page.rect.width - (12.25 + spine) * 72) < .1
    assert abs(page.rect.height - 9.25 * 72) < .1
    assert not (page.get_links() or list(page.annots() or []) or list(page.widgets() or []))
    for font in page.get_fonts():
        assert doc.extract_font(font[0])[3], ('Unembedded cover font', font)
    text = normalize(page.get_text())
    for passage in [config['volume'], *config['hook'].splitlines(), *config['blurb'], config['tagline'].upper()]:
        assert normalize(passage) in text, ('Missing cover copy', passage)
    # All coordinates below use PDF top-left coordinates, including outer bleed.
    back_safe = fitz.Rect(27, 27, 423, 639)
    front_left = 441 + spine * 72
    front_safe = fitz.Rect(front_left + 18, 27, front_left + 414, 639)
    spine_safe = fitz.Rect(441 + 4.5, 27, front_left - 4.5, 639)
    barcode = fitz.Rect(279, 552.6, 423, 639)
    for block in page.get_text('dict')['blocks']:
        if block['type'] != 0:
            continue
        for line in block['lines']:
            for span in line['spans']:
                box = fitz.Rect(span['bbox'])
                assert any(s.contains(box) for s in [back_safe, front_safe, spine_safe]), ('Unsafe cover text', span['text'])
                assert not box.intersects(barcode), 'Text intrudes into barcode space'
    images = page.get_image_info()
    assert len(images) == 2, 'Expected approved front and back illustrations only'
    for image in images:
        box = fitz.Rect(image['bbox'])
        assert any((s + (-.1, -.1, .1, .1)).contains(box) for s in [back_safe, front_safe]), 'Unsafe cover image'
        assert not box.intersects(barcode), 'Artwork intrudes into barcode space'
    expected_pixels = []
    for name in [config['printFrontArtwork'], config['backArtwork']]:
        with Image.open(root / 'public/assets' / name) as picture:
            expected_pixels.append(picture.size)
    assert sorted((i['width'], i['height']) for i in images) == sorted(expected_pixels)
    resolution = inspect_image_resolution(doc)
    # Check the actual rendered interior of the reserved white barcode rectangle.
    inset = fitz.Rect(barcode.x0 + 1, barcode.y0 + 1, barcode.x1 - 1, barcode.y1 - 1)
    pixels = page.get_pixmap(clip=inset, colorspace=fitz.csRGB, alpha=False)
    assert all(channel == 255 for channel in pixels.samples), 'Barcode area is not blank white'

result = {'bookId': 'book-four', 'passed': True, 'file': cover.name,
          'sha256': digest(cover), 'interiorFile': interior.name,
          'interiorSha256': digest(interior), 'interiorPages': pages,
          'trimInches': [6, 9], 'wrapInches': spec['wrapInches'],
          'spineInches': spine, 'bleedInches': .125,
          'minimumPlacedImageDpi': resolution['minimumPlacedImageDpi'],
          'originalFrontEffectiveDpi': spec['originalFrontEffectiveDpi'],
          'frontSourceSha256': digest(root / 'public/assets' / config['frontArtwork']),
          'backSourceSha256': digest(root / 'public/assets' / config['backArtwork']),
          'spineTextIncluded': normalize(config['spineTitle']) in text,
          'checks': ['measured interior checksum and page count', 'correct wrap and spine dimensions',
                     'complete back-cover copy', 'embedded fonts', 'safe text and image margins',
                     'blank 2 × 1.2 inch barcode space', 'no interactive objects',
                     'approved art with 300-DPI print placement'],
          'proofNote': 'The approved front source is resampled; this adds no original detail. Review KDP Print Previewer and a physical proof.'}
(out / 'book-four-cover-preflight.json').write_text(json.dumps(result, indent=2) + '\n')
guide = out / 'book-four-upload-guide.txt'
spine_note = '' if result['spineTextIncluded'] else 'Spine lettering is omitted because the safe lettering size is too small at this page count.\n'
guide.write_text(
    'Defenders of the Land, Book Four: Clash in Cleveland\n'
    f'Paperback manuscript: {interior.name}\nInterior SHA-256: {digest(interior)}\n'
    f'Paperback cover: {cover.name}\nCover SHA-256: {digest(cover)}\n'
    f'Pages: {pages}, excluding cover. Spine: {spine:.6f} inches.\n'
    f'Cover PDF size including bleed: {12.25 + spine:.6f} × 9.25 inches.\n'
    'KDP settings: Standard color interior with white paper; 6 × 9 inches; No bleed for the interior.\n'
    'The cover includes its required 0.125-inch outer bleed and blank Amazon barcode space.\n'
    'Let KDP add its barcode in the reserved white box; no ISBN barcode is printed in this file.\n'
    'Upload the complete book-four-kdp-cover.pdf as the paperback cover, without resizing.\n'
    f'{spine_note}'
    'Do not upload the review PDF or the separate front-cover PDF as the manuscript or wrap.\n'
    'The approved front source is resampled for print placement; no new source detail is added.\n'
    'Review KDP Print Previewer and order a physical proof before publication.\n'
    'This build does not upload to KDP or publish the book.\n')
print(f'Book Four cover preflight passed: {pages} pages; {12.25 + spine:.6f} × 9.25 inch wrap; '
      f'{spine:.6f} inch spine; embedded fonts and clear barcode space.')
