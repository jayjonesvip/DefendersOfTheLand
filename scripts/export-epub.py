"""Build a reflowable EPUB 3 from the same ordered chapters as the reader/PDFs."""
import argparse, datetime, hashlib, html, io, json, pathlib, posixpath, re, shutil, uuid, zipfile
import xml.etree.ElementTree as ET
from PIL import Image

root = pathlib.Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--book', default='origins', help='Directory name under content/books')
parser.add_argument('--sample', action='store_true', help='Book One three-chapter sample only')
args = parser.parse_args()
assert re.fullmatch(r'[a-z0-9-]+', args.book), 'Invalid book directory'
assert not args.sample or args.book == 'origins', 'Only Book One has downloadable samples'
read = lambda p: json.loads((root / p).read_text(encoding='utf-8'))
book = read(f'content/books/{args.book}/book.json')
assert book['id'] == args.book, 'Book ID must match its directory'
cover = read('print/cover.json')
site = read('content/site.json')
images = read('image-manifest.json')
sample = args.sample
is_origins = args.book == 'origins'
out = root / ('dist/books' if is_origins else 'output/publishing')
out.mkdir(parents=True, exist_ok=True)
if is_origins:
    configs = [read(str(p.relative_to(root))) for p in (root / 'print').glob('*.json')
               if p.name == 'sample.json' or re.fullmatch(r'chapter\d+\.json', p.name)]
    configs = [c for c in configs if c['book'] == book['id']]
    configs.sort(key=lambda c: c['displayChapterNumber'])
else:
    configs = []
    for filename in book['chapters']:
        chapter = read(f'content/books/{book["id"]}/{filename}')
        if chapter.get('available'):
            configs.append({'sourceChapter': filename, 'displayChapterNumber': chapter['number'],
                            'openingArtwork': None, 'illustrations': {}})
assert configs, 'No available chapters to export'
numbers = [c['displayChapterNumber'] for c in configs]
if is_origins:
    assert numbers == list(range(1, len(configs) + 1)), 'Invalid chapter order'
else:
    assert all(type(n) is int and n > 0 for n in numbers), 'Invalid chapter number'
    assert all(a < b for a, b in zip(numbers, numbers[1:])), 'Invalid chapter order'
if sample:
    configs = configs[:3]
    assert len(configs) == 3, 'Book One sample needs three chapters'
esc = html.escape
series = site['name']
volume = 'Book One: Origins' if is_origins else (book.get('epubTitle') or book['title'])
title = 'Defenders of the Land: Book One - Origins' if is_origins else f'{series}: {volume}'
if sample:
    title += ' - Three-chapter sample'
# Preserve the existing Book One identifier, independent of the current web domain.
identity_url = cover['readerUrl'] + 'books/' + book['id'] + ('/sample' if sample else '')
identifier = book.get('epubIdentifier') if not sample else None
identifier = identifier or 'urn:uuid:' + str(uuid.uuid5(uuid.NAMESPACE_URL, identity_url))
reader_url = site['url'].rstrip('/') + '/'
copyright_year = book.get('copyrightYear', cover['copyrightYear'])
cover_art = cover['frontArtwork'] if is_origins else book.get('ebookCover', book.get('cover'))
files = {}
items = []
spine = []
expected = []
chapters = []
art_names = {}
art_placements = []

def resource(name, data, media, item_id, properties=''):
    files['EPUB/' + name] = data.encode('utf-8') if isinstance(data, str) else data
    items.append(f'<item id="{item_id}" href="{esc(name)}" media-type="{media}"' +
                 (f' properties="{properties}"' if properties else '') + '/>')

def document(name, heading, body, item_id, properties=''):
    resource(name, f'''<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en">
<head><title>{esc(heading)}</title><link rel="stylesheet" type="text/css" href="styles.css"/></head>
<body>{body}</body></html>''', 'application/xhtml+xml', item_id, properties)
    spine.append(item_id)

def jpeg(source, quality=85):
    with Image.open(source) as image:
        buffer = io.BytesIO()
        image.convert('RGB').save(buffer, 'JPEG', quality=quality, optimize=True)
        return buffer.getvalue()

cover_file = None
if cover_art:
    asset = cover_art if (root / 'public/assets' / cover_art).exists() else images.get(cover_art, {}).get('file', cover_art)
    cover_bytes = jpeg(root / 'public/assets' / asset, quality=94)
    cover_file = 'origins-ebook-cover.jpg' if is_origins else f'{book["id"]}-ebook-cover.jpg'
    (out / cover_file).write_bytes(cover_bytes)
    resource('images/cover.jpg', cover_bytes, 'image/jpeg', 'cover-image', 'cover-image')
resource('styles.css', '''body { font-family: serif; line-height: 1.5; margin: 5%; overflow-wrap: break-word; }
h1, h2 { line-height: 1.2; text-align: center; overflow-wrap: anywhere; }
p { margin: 0 0 .85em; orphans: 2; widows: 2; }
figure { margin: 1.25em 0; break-inside: avoid; page-break-inside: avoid; text-align: center; }
img { width: 100%; max-width: 100%; height: auto; }
.cover { margin: 0; text-align: center; }
.cover img { width: auto; max-width: 100%; max-height: 95vh; }
.title-page { text-align: center; margin-top: 15%; }
.kicker, .ending { text-align: center; }
nav li { margin-bottom: .75em; }
''', 'text/css', 'styles')
if cover_art:
    document('cover.xhtml', title + ' - Cover', f'<section epub:type="cover" class="cover"><img src="images/cover.jpg" alt="{esc(title)} by {esc(book["author"])}. Illustrated front cover."/></section>', 'cover')
document('title.xhtml', title, f'<section epub:type="titlepage" class="title-page"><h1>{esc(series)}</h1><h2>{esc(volume)}</h2><p>{esc(book["author"])}</p></section>', 'title')
if not sample and book.get('status', '').lower() == 'in progress':
    files['EPUB/title.xhtml'] = files['EPUB/title.xhtml'].replace(b'</section>', f'<p>Work in progress: {len(configs)} {"chapter" if len(configs) == 1 else "chapters"} available.</p></section>'.encode('utf-8'))
if sample:
    files['EPUB/title.xhtml'] = files['EPUB/title.xhtml'].replace(b'</section>', b'<p>Free sample: Chapters 1-3</p></section>')
document('copyright.xhtml', 'Copyright', f'<section epub:type="copyright-page"><h1>Copyright</h1><p>Copyright © {copyright_year} {esc(book["author"])}.</p><p>All rights reserved.</p><p>A work of fiction.</p></section>', 'copyright')

def artwork(block):
    source_name = block['art']
    art_placements.append(source_name)
    if source_name not in art_names:
        asset = images.get(source_name, {}).get('file', source_name)
        name = f'images/illustration-{len(art_names)+1:02}.jpg'
        resource(name, jpeg(root / 'public/assets' / asset), 'image/jpeg', f'art-{len(art_names)+1}')
        art_names[source_name] = name
    return f'<figure><img src="{art_names[source_name]}" alt="{esc(block.get("alt", "Illustration from " + title))}"/></figure>'

chapter_documents = []
for config in configs:
    chapter = read(f'content/books/{book["id"]}/' + config['sourceChapter'])
    number = config['displayChapterNumber']
    name = f'chapter-{number:02}.xhtml'
    item_id = f'chapter-{number}'
    paragraphs = []
    body = f'<section epub:type="chapter" id="chapter-{number}"><p class="kicker">CHAPTER {number}</p><h1>{esc(chapter["title"])}</h1>'
    opening = next((b for b in chapter['blocks'] if b.get('art') == config['openingArtwork']), None) if config['openingArtwork'] else None
    if opening and config['illustrations'].get(opening['art'], {}).get('print') is not False:
        body += artwork(opening)
    for block in chapter['blocks']:
        if block.get('type') == 'heading':
            body += '<h2>' + esc(block['title']) + '</h2>'
        if block.get('art') and block['art'] != config['openingArtwork'] and config['illustrations'].get(block['art'], {}).get('print') is not False:
            body += artwork(block)
        for value in [('“' + block['dialogue'] + '”') if block.get('dialogue') else '', block.get('text', '')]:
            if value:
                paragraphs.append(value)
                body += '<p>' + esc(value).replace('\n', '<br/>') + '</p>'
    if chapter.get('ending'):
        paragraphs.append(chapter['ending'])
        body += '<p class="ending">' + esc(chapter['ending']) + '</p>'
    body += '</section>'
    expected.extend(paragraphs)
    chapters.append((number, chapter['title'], name))
    chapter_documents.append((name, chapter['title'], body, item_id))

links = ''.join(f'<li><a href="{name}">Chapter {number}: {esc(heading)}</a></li>' for number, heading, name in chapters)
cover_landmark = '<li><a epub:type="cover" href="cover.xhtml">Cover</a></li>' if cover_art else '<li><a epub:type="titlepage" href="title.xhtml">Title page</a></li>'
cover_guide = '<reference type="cover" title="Cover" href="cover.xhtml"/>' if cover_art else ''
cover_metadata = '<meta name="cover" content="cover-image"/>' if cover_art else ''
document('nav.xhtml', 'Contents', '<nav epub:type="toc" id="toc"><h1>Contents</h1><ol>' + links + '</ol></nav><nav epub:type="landmarks" hidden="hidden"><h2>Guide</h2><ol>' + cover_landmark + '<li><a epub:type="toc" href="nav.xhtml">Contents</a></li><li><a epub:type="bodymatter" href="chapter-01.xhtml">Start reading</a></li></ol></nav>', 'nav', 'nav')
for args in chapter_documents:
    document(*args)
if sample:
    document('continue.xhtml', 'Continue reading', f'<section><h1>Continue Book One</h1><p>This sample contains the first three chapters.</p><p><a href="{esc(reader_url)}origins-chapter-4.html">Continue reading the complete book free on the website.</a></p><p><a href="{esc(site["paperback"]["url"])}">Buy Book One: Origins in paperback on Amazon.</a></p><p><a href="{esc(site["ebook"]["url"])}">Buy Book One: Origins on Kindle.</a></p></section>', 'continue')

points = ''.join(f'<navPoint id="nav-{n}" playOrder="{n}"><navLabel><text>Chapter {n}: {esc(heading)}</text></navLabel><content src="{name}"/></navPoint>' for n, heading, name in chapters)
resource('toc.ncx', f'<?xml version="1.0" encoding="utf-8"?><ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="{identifier}"/><meta name="dtb:depth" content="1"/><meta name="dtb:totalPageCount" content="0"/><meta name="dtb:maxPageNumber" content="0"/></head><docTitle><text>{esc(title)}</text></docTitle><navMap>{points}</navMap></ncx>', 'application/x-dtbncx+xml', 'ncx')
modified = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
files['EPUB/package.opf'] = f'''<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:identifier id="book-id">{identifier}</dc:identifier><dc:title>{esc(title)}</dc:title><dc:language>en</dc:language><dc:creator>{esc(book['author'])}</dc:creator><dc:description>{esc(book['description'])}</dc:description><dc:rights>Copyright © {copyright_year} {esc(book['author'])}. All rights reserved.</dc:rights><meta property="dcterms:modified">{modified}</meta><meta property="rendition:layout">reflowable</meta>{cover_metadata}
</metadata><manifest>{''.join(items)}</manifest><spine toc="ncx">{''.join(f'<itemref idref="{i}"/>' for i in spine)}</spine><guide>{cover_guide}<reference type="toc" title="Contents" href="nav.xhtml"/><reference type="text" title="Start reading" href="chapter-01.xhtml"/></guide></package>'''.encode('utf-8')
container = '<?xml version="1.0" encoding="utf-8"?><container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'
target = out / ('origins-sample-chapters-01-03.epub' if sample else ('defenders-of-the-land-origins.epub' if is_origins else f'defenders-of-the-land-{book["id"]}.epub'))
with zipfile.ZipFile(target, 'w') as archive:
    archive.writestr('mimetype', 'application/epub+zip', compress_type=zipfile.ZIP_STORED)
    archive.writestr('META-INF/container.xml', container, compress_type=zipfile.ZIP_DEFLATED)
    for name, data in files.items():
        archive.writestr(name, data, compress_type=zipfile.ZIP_DEFLATED)

# Validate the actual archive, not only the in-memory inputs.
ns = {'h': 'http://www.w3.org/1999/xhtml', 'o': 'http://www.idpf.org/2007/opf'}
with zipfile.ZipFile(target) as archive:
    assert archive.infolist()[0].filename == 'mimetype'
    assert archive.infolist()[0].compress_type == zipfile.ZIP_STORED
    assert archive.read('mimetype') == b'application/epub+zip'
    assert archive.testzip() is None
    actual = []
    art_count = 0
    for number, heading, name in chapters:
        tree = ET.fromstring(archive.read('EPUB/' + name))
        actual.extend(''.join(p.itertext()) for p in tree.findall('.//h:p', ns) if p.get('class') != 'kicker')
        art_count += len(tree.findall('.//h:img', ns))
    assert [re.sub(r'\s+', '', p) for p in actual] == [re.sub(r'\s+', '', p) for p in expected], 'Prose mismatch'
    assert art_count == len(art_placements), 'Illustration count mismatch'
    for name in archive.namelist():
        if name.endswith(('.xml', '.opf', '.ncx', '.xhtml')):
            tree = ET.fromstring(archive.read(name))
            for element in tree.iter():
                for attr in ['href', 'src', 'full-path']:
                    ref = element.get(attr)
                    if ref and not ref.startswith(('http:', 'https:', '#')):
                        dest = ref.split('#')[0]
                        path = dest if attr == 'full-path' else posixpath.normpath(posixpath.join(posixpath.dirname(name), dest))
                        assert path in archive.namelist(), (name, ref)

def download(path, label, media):
    return {'file': path.name, 'label': label, 'bytes': path.stat().st_size,
            'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'mediaType': media}
report = {'bookId': book['id'], 'title': title, 'status': book.get('status', ''), 'coverIncluded': bool(cover_art), 'file': target.name, 'sha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'bytes': target.stat().st_size, 'chapters': len(chapters), 'paragraphsChecked': len(expected), 'interiorIllustrations': art_count,
          'layout': 'reflowable', 'missingResources': 0}
if is_origins:
    manifest_path = out / 'downloads.json'
    manifest = json.loads(manifest_path.read_text(encoding='utf-8')) if manifest_path.exists() else {}
    if sample:
        manifest['samples'] = [d for d in manifest.get('samples', []) if d['file'] != target.name] + [download(target, 'First three chapters — EPUB', 'application/epub+zip')]
        manifest['sampleEpub'] = report
    else:
        manifest['ebooks'] = [download(target, 'Kindle / EPUB — full illustrated book', 'application/epub+zip')]
        manifest['ebookCovers'] = [download(out / cover_file, 'Kindle front cover — JPEG', 'image/jpeg')] if cover_file else []
        manifest['epub'] = report
    manifest_path.write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
qa = root / ('tmp/epub-sample' if sample else ('tmp/epub' if is_origins else f'tmp/epub-{book["id"]}'))
qa.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(target) as archive:
    shutil.rmtree(qa / 'preview', ignore_errors=True)
    archive.extractall(qa / 'preview')
(qa / 'quality-report.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(f'Verified EPUB {book["id"]}{" sample" if sample else ""}: {len(chapters)} chapters, {len(expected)} manuscript passages, {art_count} interior illustrations, {"cover" if cover_art else "title page"} and linked contents.')
