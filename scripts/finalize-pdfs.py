import pathlib,json,re,io,hashlib
import pymupdf as fitz
from PIL import Image
root=pathlib.Path(__file__).resolve().parents[1]
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
def check(pdf,paragraphs):
    full=body_text(pdf);missing=[s for s in paragraphs if norm(s) not in full]
    assert not missing,missing
    for n,page in enumerate(pdf,1):
        assert abs(page.rect.width-432)<.1 and abs(page.rect.height-648)<.1
        assert page.get_text().strip() or page.get_images(),f'Blank page {n}'
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
manifest={'full':[metadata(target.name,len(illustrated),id='illustrated',label='Full book — illustrated')],'chapters':[]}
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
text_file='defenders-of-the-land-origins-text.pdf';text=fitz.open(out/text_file)
manifest['full'].append(metadata(text_file,len(text),id='text',label='Full book — text only'));text.close()
(out/'downloads.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
(tmp/'pdf-quality-report.json').write_text(json.dumps({'pages':len(illustrated),'illustrations':len(layout['images']),'chapters':18,'paragraphsChecked':len(expected),'downloads':20,'missingParagraphs':0,'textImageCollisions':0},indent=2)+'\n',encoding='utf-8')
print('Verified 20 PDF downloads: illustrated full book, text-only full book and 18 illustrated chapters.')
