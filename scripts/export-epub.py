"""Build a reflowable EPUB 3 from the same ordered chapters as the reader/PDFs."""
import datetime, hashlib, html, io, json, pathlib, posixpath, re, sys, uuid, zipfile
import xml.etree.ElementTree as ET
from PIL import Image

root = pathlib.Path(__file__).resolve().parents[1]
out = root / 'dist/books'
out.mkdir(parents=True, exist_ok=True)
read = lambda p: json.loads((root / p).read_text(encoding='utf-8'))
book = read('content/books/origins/book.json')
cover = read('print/cover.json')
images = read('image-manifest.json')
configs = [read(str(p.relative_to(root))) for p in (root / 'print').glob('*.json')
           if p.name == 'sample.json' or re.fullmatch(r'chapter\d+\.json', p.name)]
configs.sort(key=lambda c: c['displayChapterNumber'])
assert [c['displayChapterNumber'] for c in configs] == list(range(1, 19))
sample = '--sample' in sys.argv
if sample:
    configs = configs[:3]
esc = html.escape
title = 'Defenders of the Land: Book One - Origins'
if sample:
    title += ' - Three-chapter sample'
identifier = 'urn:uuid:' + str(uuid.uuid5(uuid.NAMESPACE_URL, cover['readerUrl'] + 'books/origins'))
if sample:
    identifier = 'urn:uuid:' + str(uuid.uuid5(uuid.NAMESPACE_URL, cover['readerUrl'] + 'books/origins/sample'))
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

cover_bytes = jpeg(root / 'public/assets' / cover['frontArtwork'], quality=94)
cover_file = 'origins-ebook-cover.jpg'
(out / cover_file).write_bytes(cover_bytes)
resource('images/cover.jpg', cover_bytes, 'image/jpeg', 'cover-image', 'cover-image')
resource('styles.css', '''body { font-family: serif; line-height: 1.5; margin: 5%; }
h1, h2 { line-height: 1.2; text-align: center; }
p { margin: 0 0 .85em; orphans: 2; widows: 2; }
figure { margin: 1.25em 0; break-inside: avoid; page-break-inside: avoid; text-align: center; }
img { width: 100%; max-width: 100%; height: auto; }
.cover { margin: 0; text-align: center; }
.cover img { width: auto; max-width: 100%; max-height: 95vh; }
.title-page { text-align: center; margin-top: 15%; }
.kicker, .ending { text-align: center; }
nav li { margin-bottom: .75em; }
''', 'text/css', 'styles')
document('cover.xhtml', title + ' - Cover', '<section epub:type="cover" class="cover"><img src="images/cover.jpg" alt="Defenders of the Land, Book One: Origins, by Jay Jones. Illustrated front cover."/></section>', 'cover')
document('title.xhtml', title, f'<section epub:type="titlepage" class="title-page"><h1>Defenders of the Land</h1><h2>Book One: Origins</h2><p>{esc(book["author"])}</p></section>', 'title')
if sample:
    files['EPUB/title.xhtml'] = files['EPUB/title.xhtml'].replace(b'</section>', b'<p>Free sample: Chapters 1-3</p></section>')
document('copyright.xhtml', 'Copyright', f'<section epub:type="copyright-page"><h1>Copyright</h1><p>Copyright © {cover["copyrightYear"]} {esc(book["author"])}.</p><p>All rights reserved.</p><p>A work of fiction.</p></section>', 'copyright')

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
    chapter = read('content/books/origins/' + config['sourceChapter'])
    number = config['displayChapterNumber']
    name = f'chapter-{number:02}.xhtml'
    item_id = f'chapter-{number}'
    paragraphs = []
    body = f'<section epub:type="chapter" id="chapter-{number}"><p class="kicker">CHAPTER {number}</p><h1>{esc(chapter["title"])}</h1>'
    opening = next((b for b in chapter['blocks'] if b.get('art') == config['openingArtwork']), None)
    if opening and config['illustrations'].get(opening['art'], {}).get('print') is not False:
        body += artwork(opening)
    for block in chapter['blocks']:
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
document('nav.xhtml', 'Contents', '<nav epub:type="toc" id="toc"><h1>Contents</h1><ol>' + links + '</ol></nav><nav epub:type="landmarks" hidden="hidden"><h2>Guide</h2><ol><li><a epub:type="cover" href="cover.xhtml">Cover</a></li><li><a epub:type="toc" href="nav.xhtml">Contents</a></li><li><a epub:type="bodymatter" href="chapter-01.xhtml">Start reading</a></li></ol></nav>', 'nav', 'nav')
for args in chapter_documents:
    document(*args)
if sample:
    document('continue.xhtml', 'Continue reading', f'<section><h1>Continue Book One</h1><p>This sample contains the first three chapters.</p><p><a href="{esc(cover["readerUrl"])}origins-chapter-4.html">Continue reading the complete book free on the website.</a></p><p>The complete Kindle edition offers convenient offline reading.</p></section>', 'continue')

points = ''.join(f'<navPoint id="nav-{n}" playOrder="{n}"><navLabel><text>Chapter {n}: {esc(heading)}</text></navLabel><content src="{name}"/></navPoint>' for n, heading, name in chapters)
resource('toc.ncx', f'<?xml version="1.0" encoding="utf-8"?><ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="{identifier}"/><meta name="dtb:depth" content="1"/><meta name="dtb:totalPageCount" content="0"/><meta name="dtb:maxPageNumber" content="0"/></head><docTitle><text>{esc(title)}</text></docTitle><navMap>{points}</navMap></ncx>', 'application/x-dtbncx+xml', 'ncx')
modified = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
files['EPUB/package.opf'] = f'''<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:identifier id="book-id">{identifier}</dc:identifier><dc:title>{esc(title)}</dc:title><dc:language>en</dc:language><dc:creator>{esc(book['author'])}</dc:creator><dc:description>{esc(book['description'])}</dc:description><dc:rights>Copyright © {cover['copyrightYear']} {esc(book['author'])}. All rights reserved.</dc:rights><meta property="dcterms:modified">{modified}</meta><meta property="rendition:layout">reflowable</meta><meta name="cover" content="cover-image"/>
</metadata><manifest>{''.join(items)}</manifest><spine toc="ncx">{''.join(f'<itemref idref="{i}"/>' for i in spine)}</spine><guide><reference type="cover" title="Cover" href="cover.xhtml"/><reference type="toc" title="Contents" href="nav.xhtml"/><reference type="text" title="Start reading" href="chapter-01.xhtml"/></guide></package>'''.encode('utf-8')
container = '<?xml version="1.0" encoding="utf-8"?><container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'
target = out / ('origins-sample-chapters-01-03.epub' if sample else 'defenders-of-the-land-origins.epub')
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
report = {'chapters': len(chapters), 'paragraphsChecked': len(expected), 'interiorIllustrations': art_count,
          'layout': 'reflowable', 'missingResources': 0}
manifest_path = out / 'downloads.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8')) if manifest_path.exists() else {}
if sample:
    manifest['samples'] = [d for d in manifest.get('samples', []) if d['file'] != target.name] + [download(target, 'First three chapters — EPUB', 'application/epub+zip')]
    manifest['sampleEpub'] = report
else:
    manifest['ebooks'] = [download(target, 'Kindle / EPUB — full illustrated book', 'application/epub+zip')]
    manifest['ebookCovers'] = [download(out / cover_file, 'Kindle front cover — JPEG', 'image/jpeg')]
    manifest['epub'] = report
manifest_path.write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
qa = root / ('tmp/epub-sample' if sample else 'tmp/epub')
qa.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(target) as archive:
    archive.extractall(qa / 'preview')
(qa / 'quality-report.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(f'Verified EPUB: {len(chapters)} chapters, {len(expected)} manuscript passages, {art_count} interior illustrations, cover and linked contents.')
