import json, pathlib, re, html
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, PageBreak
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
import pymupdf as fitz
from PIL import Image, ImageDraw

workspace=pathlib.Path(__file__).resolve().parents[1]
root=workspace
out=workspace/'dist/books'; out.mkdir(parents=True,exist_ok=True)
tmp=workspace/'tmp/pdfs/text-book'; tmp.mkdir(parents=True,exist_ok=True)
pdfmetrics.registerFont(TTFont('BookSerif',str(root/'print/fonts/LibreBaskerville-Regular.ttf')))
pdfmetrics.registerFont(TTFont('BookDisplay',str(root/'print/fonts/Bangers-Regular.ttf')))
configs=[json.loads(p.read_text(encoding='utf-8')) for p in (root/'print').glob('*.json') if p.name=='sample.json' or re.fullmatch(r'chapter\d+\.json',p.name)]
configs.sort(key=lambda c:c['displayChapterNumber'])
assert [c['displayChapterNumber'] for c in configs]==list(range(1,19))
book=json.loads((root/'content/books/origins/book.json').read_text(encoding='utf-8'))
clean=lambda s:s.replace('\u2011','-').replace('\u2013','-').replace('\u2014',' - ')
body_style=ParagraphStyle('Body',fontName='BookSerif',fontSize=10.5,leading=15,alignment=TA_JUSTIFY,spaceAfter=5,allowWidows=0,allowOrphans=0)
dialogue_style=ParagraphStyle('Dialogue',parent=body_style,alignment=0)
chapter_style=ParagraphStyle('ChapterTitle',fontName='BookDisplay',fontSize=25,leading=29,spaceAfter=22)
kicker_style=ParagraphStyle('Kicker',fontName='BookSerif',fontSize=8,leading=12,textColor='#a52622',spaceAfter=9,keepWithNext=True)
title_style=ParagraphStyle('Title',fontName='BookDisplay',fontSize=44,leading=48,alignment=TA_CENTER,spaceAfter=32)
subtitle_style=ParagraphStyle('Subtitle',fontName='BookSerif',fontSize=15,leading=23,alignment=TA_CENTER,spaceAfter=28)
author_style=ParagraphStyle('Author',parent=subtitle_style,fontSize=12)
toc_style=ParagraphStyle('TOCItem',fontName='BookSerif',fontSize=9.5,leading=14,leftIndent=0,firstLineIndent=0,spaceBefore=0)
ending_style=ParagraphStyle('Ending',parent=body_style,alignment=TA_CENTER,spaceBefore=12)

class BookDocument(BaseDocTemplate):
    def __init__(self,path):
        super().__init__(str(path),pagesize=(432,648),leftMargin=49,rightMargin=43,topMargin=49,bottomMargin=49,title='Defenders of the Land - Book One: Origins',author=book['author'])
        self.addPageTemplates(PageTemplate(id='Book',frames=[Frame(49,49,340,550,id='body',leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0)],onPage=self.page_footer))
    def page_footer(self,c,doc):
        c.saveState(); c.setFont('BookSerif',8); c.setFillColorRGB(.36,.36,.36)
        if doc.page>2:
            c.drawCentredString(216,620,'BOOK ONE: ORIGINS' if doc.page%2==0 else 'DEFENDERS OF THE LAND')
            c.drawCentredString(216,25,str(doc.page))
        c.restoreState()
    def afterFlowable(self,f):
        if isinstance(f,Paragraph) and f.style.name=='ChapterTitle':
            key=f._bookmark; title=f.getPlainText()
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(title,key,level=0,closed=False)
            self.notify('TOCEntry',(0,title,self.page,key))

story=[Spacer(1,90),Paragraph('DEFENDERS<br/>OF THE LAND',title_style),Paragraph('BOOK ONE: ORIGINS',subtitle_style),Paragraph(html.escape(book['author']),author_style),PageBreak(),Paragraph('Contents',ParagraphStyle('ContentsTitle',parent=chapter_style,spaceAfter=26))]
toc=TableOfContents(); toc.levelStyles=[toc_style]; story +=[toc,PageBreak()]
expected=[]
for index,config in enumerate(configs):
    chapter=json.loads((root/'content/books/origins'/config['sourceChapter']).read_text(encoding='utf-8'))
    number=config['displayChapterNumber']
    story.append(Paragraph(f'CHAPTER {number:02}',kicker_style))
    title=Paragraph(html.escape(clean(chapter['title'])),chapter_style); title._bookmark=f'chapter-{number}'; story.append(title)
    for b in chapter['blocks']:
        if b.get('dialogue'):
            text=clean('“'+b['dialogue']+'”'); expected.append(text); story.append(Paragraph(html.escape(text),dialogue_style))
        if b.get('text'):
            text=clean(b['text']); expected.append(text); story.append(Paragraph(html.escape(text).replace('\n','<br/>'),body_style))
    if chapter.get('ending'):
        text=clean(chapter['ending']); expected.append(text); story.append(Paragraph(html.escape(text),ending_style))
    if index<len(configs)-1:story.append(PageBreak())

target=out/'defenders-of-the-land-origins-text.pdf'
doc=BookDocument(target); doc.multiBuild(story)
pdf=fitz.open(target)
norm=lambda s:re.sub(r'\s+','',s).replace('\u00ad','')
full=norm(''.join('\n'.join(line for line in p.get_text().splitlines() if line not in ['BOOK ONE: ORIGINS','DEFENDERS OF THE LAND',str(n)]) for n,p in enumerate(pdf,1)))
missing=[p for p in expected if norm(p) not in full]; assert not missing,missing
overflow=[]; empty=[]
for n,p in enumerate(pdf,1):
    if not p.get_text().strip():empty.append(n)
    assert abs(p.rect.width-432)<.1 and abs(p.rect.height-648)<.1
    for b in p.get_text('dict')['blocks']:
        if b['type']!=0:continue
        for line in b['lines']:
            for span in line['spans']:
                x0,y0,x1,y1=span['bbox']
                if x0<0 or y0<0 or x1>432.1 or y1>648.1:overflow.append({'page':n,'text':span['text']})
assert not overflow,overflow; assert not empty,empty
assert len(pdf.get_toc())==18
page_count=len(pdf)
report={'pages':page_count,'chapters':18,'paragraphsChecked':len(expected),'missingParagraphs':len(missing),'outOfPageText':overflow,'blankPages':empty,'bookmarks':pdf.get_toc(),'bytes':target.stat().st_size,'source':'Current author-approved manuscript; text only.'}
(tmp/'quality-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
(tmp/'expected-text.json').write_text(json.dumps(expected,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))
