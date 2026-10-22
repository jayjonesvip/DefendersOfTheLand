"""Validate private illustrated PDFs and measured paperback interiors."""
import argparse,hashlib,io,json,os,pathlib,re
from PIL import Image
import pymupdf as fitz
from print_resolution import inspect_image_resolution
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
contents_numbers=0
for chapter in layout['chapters']:
    found=False
    for number in contents_pages:
        for box in doc[number].search_for(f"{chapter['number']}. {chapter['title']}"):
            if layout.get('paperback'):
                assert any(w[4]==str(chapter['page']) and w[0]>box.x1 and abs(w[1]-box.y0)<2 for w in doc[number].get_text('words')),('Incorrect printed contents page',chapter['title'])
                contents_numbers+=1
            else:
                doc[number].insert_link({'kind':fitz.LINK_GOTO,'from':box,'page':chapter['page']-1})
            found=True
    assert found,('Missing contents entry',chapter['title'])
doc.set_metadata({'title':'Defenders of the Land: '+book['title'],'author':book['author'],'subject':'Unpublished illustrated manuscript'})
doc.set_toc([] if layout.get('paperback') else [[1,c['title'],c['page']] for c in layout['chapters']])
content_pages=len(doc)
if layout.get('paperback'):
    # Upload a print PDF without interactive navigation or annotation objects.
    for page in doc:
        for link in page.get_links():page.delete_link(link)
        for annot in list(page.annots() or []):page.delete_annot(annot)
        for widget in list(page.widgets() or []):page.delete_widget(widget)
    if len(doc)%2:doc.new_page(width=432,height=648)
    assert len(doc)>=72,'Standard-color KDP interior requires at least 72 pages'
file=out/(f'{args.book}-kdp-interior.pdf' if layout.get('paperback') else f'defenders-of-the-land-{args.book}-illustrated.pdf');doc.save(file,garbage=4,deflate=True)
report={'bookId':args.book,'file':file.name,'pages':len(doc),'pageCountIncludes':'title, copyright, contents, all available chapters and end padding; no cover' if layout.get('paperback') else 'front cover, title, contents and all available chapters','chapters':len(layout['chapters']),'interiorIllustrations':placements if layout.get('paperback') else placements-1,'passagesChecked':len(expected),'bytes':file.stat().st_size,'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'status':'Unpublished illustrated review PDF; not an approved print interior','pageSizeInches':[6,9],'printLayoutIsProvisional':True,'chapterStarts':layout['chapters']}
with fitz.open(file) as final:
    if args.book=='book-two' and layout.get('paperback'):
        resolution=inspect_image_resolution(final)
        resolution.update({'file':file.name,'pages':len(final),'sha256':report['sha256']})
        report['minimumPlacedImageDpi']=resolution['minimumPlacedImageDpi']
        (out/'book-two-interior-resolution.json').write_text(json.dumps(resolution,indent=2)+'\n')
    destinations=[link['page'] for page in final for link in page.get_links() if link['kind']==fitz.LINK_GOTO]
    assert set(destinations)==(set() if layout.get('paperback') else {c['page']-1 for c in layout['chapters']})
    assert len(final.get_toc())==(0 if layout.get('paperback') else len(layout['chapters']))
    if layout.get('paperback'):
        assert not any(page.get_links() or list(page.annots() or []) or list(page.widgets() or []) for page in final),'Interactive objects in print PDF'
        report['contentsPageNumbersChecked']=contents_numbers
    assert not any(link.get('uri','').startswith(('http://127.0.0.1','http://localhost')) for page in final for link in page.get_links())
    report['contentsLinksChecked']=len(destinations)
report.update({'paperbackInterior':bool(layout.get('paperback')),'contentPages':content_pages,'paddingPages':len(doc)-content_pages})
if layout.get('paperback'):
    report['manuscriptStatus']=book['status']
    report['status']='Complete illustrated paperback manuscript; print proof pending' if book['status']=='Manuscript complete' else 'Current illustrated paperback manuscript; book still in progress'
    report['printPdfNavigationRemoved']=True
cover_config=root/'print'/f'{args.book}-cover.json'
has_print_interior=cover_config.exists() and bool(json.loads(cover_config.read_text()).get('interiorPdf'))
report_name=f'{args.book}-review-pdf-build.json' if has_print_interior and not layout.get('paperback') else f'{args.book}-pdf-build.json'
(out/report_name).write_text(json.dumps(report,indent=2)+'\n')
print(f"Verified {args.book} illustrated PDF: {len(doc)} pages, {report['chapters']} chapters, {report['interiorIllustrations']} illustrations; complete text, page bounds and image/text separation.")
if os.environ.get('GITHUB_ACTIONS'):
    print(f"::notice title={args.book} PDF::Verified {len(doc)} pages; {report['chapters']} chapters and {report['interiorIllustrations']} interior illustrations. Private publishing artifact: {file.name}")
# Visual review artifacts are deliberately excluded from Git/public downloads.
for number in [0,layout['chapters'][0]['page']-1,layout['chapters'][-1]['page']-1,len(doc)-1]:doc[number].get_pixmap(matrix=fitz.Matrix(1.2,1.2)).save(tmp/f'page-{number+1}.png')
doc.close()
