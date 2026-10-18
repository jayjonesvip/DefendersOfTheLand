"""Validate private illustrated PDFs and measured paperback interiors."""
import argparse,hashlib,io,json,os,pathlib,re
from PIL import Image
import pymupdf as fitz
root=pathlib.Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--book',default='book-two');args=parser.parse_args()
assert re.fullmatch(r'book-[a-z]+',args.book),'Invalid book ID'
book=json.loads((root/'content/books'/args.book/'book.json').read_text())
tmp=root/f'tmp/{args.book}-pdf';out=root/'output/publishing';out.mkdir(parents=True,exist_ok=True)
layout=json.loads((tmp/'layout.json').read_text());expected=json.loads((tmp/'expected.json').read_text())
normalize=lambda text:re.sub(r'\s+','',text).replace('\u00ad','')
doc=fitz.open(tmp/'raw.pdf')
assert len(doc)==layout['pages']
text=normalize(''.join(p.get_text() for p in doc))
for paragraph in expected:assert normalize(paragraph) in text,paragraph
placements=0
for n,page in enumerate(doc,1):
    assert abs(page.rect.width-432)<.1 and abs(page.rect.height-648)<.1
    assert page.get_text().strip() or page.get_images(),f'Blank page {n}'
    images=[fitz.Rect(i['bbox']) for i in page.get_image_info()];placements+=len(images)
    for image in images:assert page.rect.contains(image),f'Image outside page {n}'
    for block in page.get_text('dict')['blocks']:
        if block['type']!=0:continue
        for line in block['lines']:
            for span in line['spans']:
                box=fitz.Rect(span['bbox'])
                assert page.rect.contains(box),(n,'Text outside page',span['text'])
                assert not any(box.intersects(image) for image in images),(n,'Text overlaps image',span['text'])
assert placements==len(layout['images'])
# Replace Chromium's large raster streams with JPEGs (higher quality for print) while
# retaining vector text, page geometry and the original artwork sources.
seen=set()
for page in doc:
    for image in page.get_images():
        xref=image[0]
        if xref in seen:continue
        seen.add(xref)
        with Image.open(io.BytesIO(doc.extract_image(xref)['image'])) as picture:
            encoded=io.BytesIO();picture.convert('RGB').save(encoded,'JPEG',quality=95 if layout.get('paperback') else 85,optimize=True)
        page.replace_image(xref,stream=encoded.getvalue())
# Paged.js's source fragment links can become localhost URLs in Chromium PDFs.
# Bind contents entries to measured PDF destinations instead.
# Review front/title and paperback title/copyright both precede contents.
contents_pages=list(range(2,layout['chapters'][0]['page']-1))
for number in contents_pages:
    for link in doc[number].get_links():doc[number].delete_link(link)
for chapter in layout['chapters']:
    found=False
    for number in contents_pages:
        for box in doc[number].search_for(f"{chapter['number']}. {chapter['title']}"):
            doc[number].insert_link({'kind':fitz.LINK_GOTO,'from':box,'page':chapter['page']-1});found=True
    assert found,('Missing contents entry',chapter['title'])
doc.set_metadata({'title':'Defenders of the Land: '+book['title'],'author':book['author'],'subject':'Unpublished illustrated manuscript'})
doc.set_toc([[1,c['title'],c['page']] for c in layout['chapters']])
content_pages=len(doc)
if layout.get('paperback'):
    if len(doc)%2:doc.new_page(width=432,height=648)
    assert len(doc)>=72,'Standard-color KDP interior requires at least 72 pages'
file=out/(f'{args.book}-kdp-interior.pdf' if layout.get('paperback') else f'defenders-of-the-land-{args.book}-illustrated.pdf');doc.save(file,garbage=4,deflate=True)
report={'bookId':args.book,'file':file.name,'pages':len(doc),'pageCountIncludes':'title, copyright, contents, all available chapters and end padding; no cover' if layout.get('paperback') else 'front cover, title, contents and all available chapters','chapters':len(layout['chapters']),'interiorIllustrations':placements if layout.get('paperback') else placements-1,'passagesChecked':len(expected),'bytes':file.stat().st_size,'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'status':'Unpublished illustrated review PDF; not an approved print interior','pageSizeInches':[6,9],'printLayoutIsProvisional':True,'chapterStarts':layout['chapters']}
with fitz.open(file) as final:
    destinations=[link['page'] for page in final for link in page.get_links() if link['kind']==fitz.LINK_GOTO]
    assert set(destinations)=={c['page']-1 for c in layout['chapters']}
    assert len(final.get_toc())==len(layout['chapters'])
    assert not any(link.get('uri','').startswith(('http://127.0.0.1','http://localhost')) for page in final for link in page.get_links())
    report['contentsLinksChecked']=len(destinations)
report.update({'paperbackInterior':bool(layout.get('paperback')),'contentPages':content_pages,'paddingPages':len(doc)-content_pages})
if layout.get('paperback'):
    report['status']='Current illustrated paperback manuscript; book still in progress'
(out/f'{args.book}-pdf-build.json').write_text(json.dumps(report,indent=2)+'\n')
print(f"Verified {args.book} illustrated PDF: {len(doc)} pages, {report['chapters']} chapters, {report['interiorIllustrations']} illustrations; complete text, page bounds and image/text separation.")
if os.environ.get('GITHUB_ACTIONS'):
    print(f"::notice title={args.book} PDF::Verified {len(doc)} pages; {report['chapters']} chapters and {report['interiorIllustrations']} interior illustrations. Private publishing artifact: {file.name}")
# Visual review artifacts are deliberately excluded from Git/public downloads.
for number in [0,layout['chapters'][0]['page']-1,layout['chapters'][-1]['page']-1,len(doc)-1]:doc[number].get_pixmap(matrix=fitz.Matrix(1.2,1.2)).save(tmp/f'page-{number+1}.png')
doc.close()
