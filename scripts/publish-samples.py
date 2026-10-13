"""Publish only combined samples; retain complete editions outside the Pages tree."""
import hashlib, importlib.util, io, json, pathlib, re
import pymupdf as fitz
from reportlab.pdfgen import canvas

root = pathlib.Path(__file__).resolve().parents[1]
public = root / 'dist/books'
author = root / 'output/publishing'
author.mkdir(parents=True, exist_ok=True)
manifest = json.loads((public / 'downloads.json').read_text(encoding='utf-8'))
source = public / 'defenders-of-the-land-origins-illustrated.pdf'
if not source.exists():
    source = author / source.name
assert source.exists(), 'Build the complete PDFs before making the sample'
layout = json.loads((root / 'tmp/pdfs/complete-book-layout.json').read_text(encoding='utf-8'))
spec = importlib.util.spec_from_file_location('cover_layout', root / 'scripts/cover-layout.py')
cover = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cover)

def frontmatter():
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=(432,648), initialFontName='CoverSerif')
    c.setTitle('Defenders of the Land - First three chapters')
    c.setAuthor('Jay Jones')
    c.setFont('CoverDisplay',35)
    c.drawCentredString(216,470,'DEFENDERS OF THE LAND')
    c.setFont('CoverDisplay',24)
    c.drawCentredString(216,422,'BOOK ONE: ORIGINS')
    c.setFont('CoverSerif',12)
    c.drawCentredString(216,365,'Jay Jones')
    c.drawCentredString(216,300,'FREE SAMPLE: CHAPTERS 1-3')
    c.setFont('CoverSerif',8)
    c.drawCentredString(216,110,f'Copyright {cover.CONFIG["copyrightYear"]} Jay Jones. All rights reserved.')
    c.showPage()
    c.setFont('CoverDisplay',28)
    c.drawString(42,574,'SAMPLE CONTENTS')
    for n, chapter in enumerate(layout['chapters'][:3]):
        c.setFont('CoverSerif',10)
        c.drawString(42,505-n*48,f'{chapter["number"]}. {chapter["title"]}')
        c.drawRightString(390,505-n*48,str(chapter['page']))
    c.setFont('CoverSerif',10)
    c.drawString(42,270,'Read the complete book free on the website.')
    c.setFont('CoverSerif',8)
    c.drawString(42,245,cover.CONFIG['readerUrl'].removeprefix('https://'))
    c.linkURL(cover.CONFIG['readerUrl'],(42,238,390,260),thickness=0)
    c.showPage(); c.save()
    return fitz.open(stream=buffer.getvalue(),filetype='pdf')

full = fitz.open(source)
sample = fitz.open()
sample.insert_pdf(full,from_page=0,to_page=0)
matter = frontmatter(); sample.insert_pdf(matter); matter.close()
start = layout['chapters'][0]['page']-1
end = layout['chapters'][3]['page']-2
sample.insert_pdf(full,from_page=start,to_page=end)
# The two replacement front-matter pages preserve the original sample's page numbers.
assert start == 3
sample.set_toc([[1,c['title'],c['page']] for c in layout['chapters'][:3]])
sample.set_metadata({'title':'Defenders of the Land - First three chapters','author':'Jay Jones','subject':'Illustrated sample: chapters 1-3. Read Book One free online.'})
path = public / 'origins-sample-chapters-01-03.pdf'
sample.save(path,garbage=4,deflate=True); sample.close(); full.close()
sample = fitz.open(path)
normalize = lambda s: re.sub(r'\s+','',s).replace('\u00ad','')
actual = normalize(''.join('\n'.join(line for line in p.get_text().splitlines() if line not in ['DEFENDERS OF THE LAND','BOOK ONE: ORIGINS'] and not line.isdigit()) for p in sample))
expected = []
for n in range(1,4):
    config = json.loads((root / 'print' / ('sample.json' if n==1 else f'chapter{n}.json')).read_text(encoding='utf-8'))
    chapter = json.loads((root / 'content/books/origins' / config['sourceChapter']).read_text(encoding='utf-8'))
    for block in chapter['blocks']:
        expected.extend([v for v in [('“'+block['dialogue']+'”') if block.get('dialogue') else '', block.get('text','')] if v])
    if chapter.get('ending'): expected.append(chapter['ending'])
assert all(normalize(p) in actual for p in expected), 'Sample PDF missing prose'
assert len(sample.get_toc()) == 3
assert len(sample) == layout['chapters'][3]['page']-1
pages = len(sample); sample.close()
pdf = {'file':path.name,'label':'First three chapters — illustrated PDF','mediaType':'application/pdf','pages':pages,'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
samples = [pdf] + [d for d in manifest['samples'] if d['file'].endswith('.epub')]
assert len(samples) == 2
assert {d['file'] for d in samples} == {'origins-sample-chapters-01-03.pdf', 'origins-sample-chapters-01-03.epub'}, 'Only Book One samples may be public'
# Keep author metadata and files available for publishing, without deploying them to Pages.
if manifest.get('full'):
    (author / 'downloads.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
elif (author / 'downloads.json').exists():
    # EPUB-only builds retain PDF metadata while refreshing replaced EPUB files.
    private_manifest = json.loads((author / 'downloads.json').read_text(encoding='utf-8'))
    for key in ['ebooks', 'ebookCovers', 'epub', 'sampleEpub']:
        if key in manifest:
            private_manifest[key] = manifest[key]
    private_manifest['samples'] = samples
    (author / 'downloads.json').write_text(json.dumps(private_manifest,indent=2)+'\n',encoding='utf-8')
allowed = {d['file'] for d in samples} | {'downloads.json'}
for file in public.iterdir():
    assert file.resolve().parent == public.resolve()
    if file.is_file() and file.name not in allowed:
        destination = author / file.name
        assert destination.resolve().parent == author.resolve()
        file.replace(destination)
public_manifest = {'samples':samples,'sampleEpub':manifest['sampleEpub'],'chapters':[{'number':c['number'],'title':c['title']} for c in layout['chapters']]}
(public / 'downloads.json').write_text(json.dumps(public_manifest,indent=2)+'\n',encoding='utf-8')
print(f'Published only the combined three-chapter PDF ({pages} pages) and EPUB; complete editions retained in output/publishing.')
