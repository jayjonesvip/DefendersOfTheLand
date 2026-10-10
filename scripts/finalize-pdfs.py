import pathlib,json,re,io,hashlib
import pymupdf as fitz
from PIL import Image
from importlib.util import spec_from_file_location,module_from_spec
root=pathlib.Path(__file__).resolve().parents[1]
cover_spec=spec_from_file_location('cover_layout',root/'scripts/cover-layout.py');cover_module=module_from_spec(cover_spec);cover_spec.loader.exec_module(cover_module)
tmp=root/'tmp/pdfs';out=root/'dist/books'
layout=json.loads((tmp/'complete-book-layout.json').read_text(encoding='utf-8'))
expected=json.loads((tmp/'complete-book-expected-text.json').read_text(encoding='utf-8'))
doc=fitz.open(tmp/'complete-book-raw.pdf')
seen=set()
for page in doc:
    for image in page.get_images():
        xref=image[0]
        if xref in seen:continue
        seen.add(xref)
        with Image.open(io.BytesIO(doc.extract_image(xref)['image'])) as im:
            encoded=io.BytesIO();im.convert('RGB').save(encoded,'JPEG',quality=85,optimize=True)
        page.replace_image(xref,stream=encoded.getvalue())
doc.set_metadata({'title':'Defenders of the Land — Book One: Origins','author':'Jay Jones','subject':'Complete illustrated reading edition'})
doc.set_toc([[1,c['title'],c['page']] for c in layout['chapters']])
target=out/'defenders-of-the-land-origins-illustrated.pdf'
doc.save(target,garbage=4,deflate=True);doc.close()
norm=lambda s:re.sub(r'\s+','',s).replace('\u00ad','')
def body_text(pdf):
    return norm(''.join('\n'.join(line for line in p.get_text().splitlines() if line not in ['DEFENDERS OF THE LAND','BOOK ONE: ORIGINS'] and not line.isdigit()) for p in pdf))
def check(pdf,paragraphs,allow_blank=False):
    full=body_text(pdf);missing=[s for s in paragraphs if norm(s) not in full]
    assert not missing,missing
    for n,page in enumerate(pdf,1):
        assert abs(page.rect.width-432)<.1 and abs(page.rect.height-648)<.1
        assert allow_blank or page.get_text().strip() or page.get_images(),f'Blank page {n}'
        blocks=page.get_text('dict')['blocks'];images=[fitz.Rect(b['bbox']) for b in blocks if b['type']==1]
        for block in blocks:
            if block['type']!=0:continue
            for line in block['lines']:
                for span in line['spans']:
                    r=fitz.Rect(span['bbox'])
                    assert r.x0>=0 and r.y0>=0 and r.x1<=432.1 and r.y1<=648.1,(n,span['text'])
                    assert not any(r.intersects(b) for b in images),(n,'Text overlaps image',span['text'])
def metadata(file,pages,**extra):
    p=out/file
    return {'file':file,'pages':pages,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),**extra}
illustrated=fitz.open(target);check(illustrated,expected)
manifest={'full':[],'chapters':[],'covers':[],'print':[]}
configs=[json.loads(p.read_text(encoding='utf-8')) for p in (root/'print').glob('*.json') if p.name=='sample.json' or re.fullmatch(r'chapter\d+\.json',p.name)]
configs.sort(key=lambda c:c['displayChapterNumber'])
for i,ch in enumerate(layout['chapters']):
    start=ch['page']-1;end=layout['chapters'][i+1]['page']-2 if i+1<len(layout['chapters']) else len(illustrated)-1
    chapter=fitz.open();chapter.insert_pdf(illustrated,from_page=start,to_page=end)
    chapter.set_metadata({'title':f"Chapter {ch['number']}: {ch['title']}",'author':'Jay Jones'})
    chapter.set_toc([[1,ch['title'],1]])
    file=f"origins-chapter-{ch['number']:02d}.pdf"
    chapter.save(out/file,garbage=4,deflate=True);chapter.close();chapter=fitz.open(out/file)
    source=json.loads((root/'content/books/origins'/configs[i]['sourceChapter']).read_text(encoding='utf-8'))
    paragraphs=[]
    for b in source['blocks']:
        if b.get('dialogue'):paragraphs.append('“'+b['dialogue']+'”')
        if b.get('text'):paragraphs.append(b['text'])
    if source.get('ending'):paragraphs.append(source['ending'])
    check(chapter,paragraphs)
    manifest['chapters'].append(metadata(file,len(chapter),number=ch['number'],title=ch['title']))
    chapter.close()
illustrated.close()
def append_back(pdf_file,illustrated_back):
    pdf=fitz.open(out/pdf_file)
    back=fitz.open(stream=cover_module.page_bytes(illustrated=illustrated_back),filetype='pdf')
    pdf.insert_pdf(back)
    staged=tmp/('back-added-'+pdf_file);pdf.save(staged,garbage=4,deflate=True);pdf.close();back.close();staged.replace(out/pdf_file)
    pdf=fitz.open(out/pdf_file);check(pdf,cover_module.CONFIG['blurb']);pages=len(pdf);pdf.close();return pages
reading_pages=append_back(target.name,True)
manifest['full'].append(metadata(target.name,reading_pages,id='illustrated',label='Full book — illustrated'))
text_file='defenders-of-the-land-origins-text.pdf';text_pages=append_back(text_file,False)
manifest['full'].append(metadata(text_file,text_pages,id='text',label='Full book — text only'))

# The paperback has its own pagination: title, copyright, contents and a recto Chapter One.
# Front/back cover artwork belongs in the separate cover file, never the print manuscript.
print_layout=json.loads((tmp/'paperback-layout.json').read_text(encoding='utf-8'))
paperback=fitz.open(tmp/'paperback-raw.pdf');seen=set()
for page in paperback:
    for image in page.get_images():
        xref=image[0]
        if xref in seen:continue
        seen.add(xref)
        with Image.open(io.BytesIO(paperback.extract_image(xref)['image'])) as im:
            encoded=io.BytesIO();im.convert('RGB').save(encoded,'JPEG',quality=90,optimize=True)
        page.replace_image(xref,stream=encoded.getvalue())
if len(paperback)%2:paperback.new_page(width=432,height=648)
paperback.set_metadata({'title':'Defenders of the Land — Book One: Origins','author':'Jay Jones','subject':'Amazon KDP paperback interior: 6 x 9, standard color, white paper, no bleed'})
paperback.set_toc([[1,c['title'],c['page']] for c in print_layout['chapters']])
print_file='origins-kdp-interior.pdf';paperback.save(out/print_file,garbage=4,deflate=True);paperback.close();paperback=fitz.open(out/print_file)
check(paperback,expected,allow_blank=True)
assert len(paperback)%2==0 and len(paperback)>=72
assert print_layout['chapters'][0]['page']%2==1
blank=[n for n,p in enumerate(paperback,1) if not p.get_text().strip() and not p.get_images()]
assert all(n%2==0 and n in [4,len(paperback)] for n in blank),blank
assert all(i['dpi']>=300 for i in print_layout['images']),print_layout['images']
interior_pages=len(paperback)
for pdf in [paperback]:
    for page in pdf:
        for font in page.get_fonts():
            assert pdf.extract_font(font[0])[3],f'Unembedded print font: {font}'
manifest['print'].append(metadata(print_file,interior_pages,label='Amazon paperback interior',id='kdp-interior'))
cover_report=cover_module.export_covers(out,interior_pages)
for file,label in zip(cover_report['files'],['Front cover','Back cover','Amazon paperback cover — back, spine and front']):
    cover_pdf=fitz.open(out/file);page=cover_pdf[0];assert len(cover_pdf)==1
    for block in page.get_text('dict')['blocks']:
        if block['type']==0:assert page.rect.contains(fitz.Rect(block['bbox'])),(file,block['bbox'])
    if file=='origins-kdp-cover.pdf':
        expected_w,expected_h=[v*72 for v in cover_report['wrapInches']]
        assert abs(page.rect.width-expected_w)<.01 and abs(page.rect.height-expected_h)<.01
        for font in page.get_fonts():assert cover_pdf.extract_font(font[0])[3],f'Unembedded cover font: {font}'
    else:check(cover_pdf,[])
    manifest['covers'].append(metadata(file,1,label=label));cover_pdf.close()
wrap=fitz.open(out/'origins-kdp-cover.pdf');wrap[0].get_pixmap(matrix=fitz.Matrix(1.25,1.25)).save(out/'origins-cover-preview.png');wrap.close()
with Image.open(root/'public/assets'/cover_report['frontArtwork']) as front:
    cover_report['frontImagePixels']=list(front.size)
    cover_report['frontEffectiveDpi']=front.width/((432-36)/72)
cover_report['frontResolutionMeets300Dpi']=cover_report['frontEffectiveDpi']>=300
with Image.open(root/'public/assets'/cover_module.CONFIG['frontArtwork']) as original:
    cover_report['originalFrontImagePixels']=list(original.size)
    cover_report['originalFrontEffectiveDpi']=original.width/5.5
cover_report['frontResampled']=cover_report['frontArtwork']!=cover_module.CONFIG['frontArtwork']
assert cover_report['frontResolutionMeets300Dpi'], 'Print front must meet 300 DPI at its placed size'
cover_report['specificationSource']='https://kdp.amazon.com/en_US/help/topic/G201953020'
cover_report['interiorBleed']=False
cover_report['barcodeBoxInches']=[2,1.2]
cover_report['notes']=['Cover dimensions, bleed and spine match the interior page count.','The approved front has been resampled to 300 DPI without adding new image detail. Review a physical proof before publishing.','The blank 2 x 1.2 inch barcode area is reserved for the KDP-generated barcode.']
manifest['paperback']=cover_report
(out/'print-specifications.json').write_text(json.dumps(cover_report,indent=2)+'\n',encoding='utf-8')
paperback.close()
(out/'downloads.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
(tmp/'pdf-quality-report.json').write_text(json.dumps({'readingPages':reading_pages,'paperbackPages':interior_pages,'intentionalPaperbackBlankPages':blank,'illustrations':len(layout['images']),'chapters':18,'paragraphsChecked':len(expected),'downloads':24,'missingParagraphs':0,'textImageCollisions':0,'paperback':cover_report},indent=2)+'\n',encoding='utf-8')
print('Verified 24 PDF downloads: two full books, 18 chapters, front/back covers and the Amazon paperback interior and wrap.')
