"""Preflight the final Book Four paperback interior; never publish or upload it."""
import hashlib
import json
import pathlib
import re

import pymupdf as fitz
from print_resolution import inspect_image_resolution

root = pathlib.Path(__file__).resolve().parents[1]
out = root / 'output/publishing'
settings = json.loads((root / 'print/book-four-interior.json').read_text())
report = json.loads((out / 'book-four-pdf-build.json').read_text())
file = out / settings['interiorPdf']
digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
normalize = lambda s: re.sub(r'\s+', '', s).replace('\u00ad', '')
book_dir = root / 'content/books/book-four'
book = json.loads((book_dir / 'book.json').read_text())
chapters = [json.loads((book_dir / f).read_text()) for f in book['chapters']]
chapters = [c for c in chapters if c['available']]
art = [b['art'] for c in chapters for b in c['blocks'] if b.get('art')]
assert report['sha256'] == digest(file), 'Stale print build report'
assert report['paperbackInterior'] and report['chapters'] == len(chapters) == 13
assert report['interiorIllustrations'] == len(art) == 70
assert report['contentsPageNumbersChecked'] == len(chapters)
assert file.stat().st_size < 650 * 1024 * 1024
assert settings['paper'] == 'standard-color-white' and not settings['bleed']
inventory = {str(p.relative_to(root)): digest(p) for p in
             [book_dir / 'book.json', *[book_dir / f for f in book['chapters']],
              *[root / 'public/assets' / a for a in art]]}
with fitz.open(file) as doc:
    assert not doc.is_encrypted
    assert len(doc) == report['pages'] and 72 <= len(doc) <= 600 and len(doc) % 2 == 0
    assert not doc.get_toc(), 'Print PDF has interactive bookmarks'
    resolution = inspect_image_resolution(doc, settings['minimumImageDpi'])
    assert len(resolution['placements']) == len(art)
    assert not doc[0].get_image_info(), 'Cover image included in interior'
    body_text = []
    fonts = set()
    for number, page in enumerate(doc, 1):
        assert abs(page.rect.width - 432) < .1 and abs(page.rect.height - 648) < .1
        assert not (page.get_links() or list(page.annots() or []) or list(page.widgets() or [])), 'Interactive objects in print PDF'
        inside = settings['insideMarginInches'] * 72
        outside = settings['outsideMarginInches'] * 72
        left, right = (inside, outside) if number % 2 else (outside, inside)
        # Font ink can overhang its CSS line box by a fraction of a point.
        # A one-point tolerance remains well inside KDP's minimum safe area.
        safe = fitz.Rect(left - 1, settings['topMarginInches'] * 72 - 1,
                         432 - right + 1, 648 - settings['bottomMarginInches'] * 72 + 1)
        images = [fitz.Rect(i['bbox']) for i in page.get_image_info()]
        for image in images:
            assert safe.contains(image), ('Image outside print margins', number)
        words = []
        for block in page.get_text('dict')['blocks']:
            if block['type'] != 0:
                continue
            for line in block['lines']:
                for span in line['spans']:
                    box = fitz.Rect(span['bbox'])
                    # Running header and folio deliberately occupy the margin boxes.
                    if box.y1 < 40 or box.y0 > 610:
                        continue
                    assert safe.contains(box), ('Text outside print margins', number, span['text'], tuple(box))
                    assert not any(box.intersects(i) for i in images), ('Text overlaps art', number)
                    words.append(span['text'])
        if number <= report['contentPages']:
            assert words or images, ('Unintended blank content page', number)
        else:
            assert not page.get_text().strip() and not images, 'End padding is not blank'
        body_text.extend(words)
        fonts.update(f[0] for f in page.get_fonts())
    for xref in fonts:
        assert doc.extract_font(xref)[3], ('Unembedded font', xref)
    text = normalize(''.join(body_text))
    cursor = 0
    passages = 0
    for chapter in chapters:
        for passage in [*[b.get('text', '') for b in chapter['blocks']], chapter.get('ending', '')]:
            if not passage:
                continue
            needle = normalize(passage)
            position = text.find(needle, cursor)
            assert position >= 0, ('Missing or reordered source prose', chapter['number'], passage)
            cursor = position + len(needle)
            passages += 1

result = {'bookId': 'book-four', 'passed': True, 'file': file.name,
          'sha256': digest(file), 'pages': report['pages'], 'chapters': len(chapters),
          'interiorIllustrations': len(art), 'passagesCheckedInOrder': passages,
          'embeddedFonts': len(fonts), 'minimumPlacedImageDpi': resolution['minimumPlacedImageDpi'],
          'settings': settings, 'sourceSha256': inventory,
          'checks': ['6 × 9 inch trim, no bleed', 'mirrored safe margins',
                     'all source prose in order', 'all 70 illustrations at 300 DPI or higher',
                     'printed contents page numbers', 'embedded fonts', 'no text/art overlaps or unexpected blank pages',
                     'even page count', 'no cover, links, annotations, forms or bookmarks'],
          'publicationStatus': 'Interior prepared; KDP Print Previewer and physical proof still required'}
(out / 'book-four-preflight.json').write_text(json.dumps(result, indent=2) + '\n')
(out / 'book-four-upload-guide.txt').write_text(
    'Defenders of the Land, Book Four: Clash in Cleveland\n'
    f'Paperback manuscript: {file.name}\nSHA-256: {result["sha256"]}\n'
    f'Pages: {result["pages"]} (includes front matter and any blank end padding; excludes cover)\n'
    'KDP settings: Standard color interior with white paper; 6 × 9 inches; No bleed.\n'
    'Do not upload the review PDF or a front-cover image as the manuscript.\n'
    'The paperback cover is a separate upload and must use this exact page count.\n'
    'Review every page in KDP Print Previewer and order a physical proof before publication.\n'
    'This build does not upload to KDP or publish the book.\n')
print(f'Book Four interior preflight passed: {result["pages"]} pages, 70 images, '
      f'{result["minimumPlacedImageDpi"]:.1f} minimum placed DPI; all prose preserved.')
