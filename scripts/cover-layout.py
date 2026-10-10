"""Reusable vector cover typography; source illustrations retain their proportions."""
import io,json,pathlib
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from xml.sax.saxutils import escape
ROOT=pathlib.Path(__file__).resolve().parents[1]
CONFIG=json.loads((ROOT/'print/cover.json').read_text(encoding='utf-8'))
assert (CONFIG['trimWidthInches'],CONFIG['trimHeightInches'])==(6,9),'The interior template currently supports 6 x 9 inches.'
for name,file in [('CoverDisplay','Bangers-Regular.ttf'),('CoverSerif','LibreBaskerville-Regular.ttf')]:
    if name not in pdfmetrics.getRegisteredFontNames():
        pdfmetrics.registerFont(TTFont(name,str(ROOT/'print/fonts'/file)))
NAVY=HexColor('#08283F');GOLD=HexColor('#F3C34E');CREAM=HexColor('#F5E9CC')
WIDTH=CONFIG['trimWidthInches']*72;HEIGHT=CONFIG['trimHeightInches']*72

def artwork(c,file,x,y,w,h):
    image=ImageReader(str(ROOT/'public/assets'/file))
    iw,ih=image.getSize();scale=min(w/iw,h/ih);dw,dh=iw*scale,ih*scale
    c.drawImage(image,x+(w-dw)/2,y+(h-dh)/2,width=dw,height=dh,mask='auto')

def back(c,x=0,y=0,*,illustrated=True,barcode=False):
    c.saveState();c.translate(x,y);c.setFillColor(NAVY if illustrated else HexColor('#FFFFFF'));c.rect(0,0,WIDTH,HEIGHT,fill=1,stroke=0)
    ink=CREAM if illustrated else NAVY
    c.setFillColor(GOLD if illustrated else NAVY);c.setFont('CoverDisplay',13);c.drawString(32,HEIGHT-40,CONFIG['volume'])
    c.setStrokeColor(GOLD);c.setLineWidth(1);c.line(32,HEIGHT-54,WIDTH-32,HEIGHT-54)
    hook=Paragraph(escape(CONFIG['hook']).replace('\n','<br/>'),ParagraphStyle('Hook',fontName='CoverDisplay',fontSize=23,leading=27,textColor=GOLD if illustrated else NAVY))
    _,hh=hook.wrap(WIDTH-64,HEIGHT);hook.drawOn(c,32,HEIGHT-76-hh)
    top=HEIGHT-96-hh
    style=ParagraphStyle('BackCopy',fontName='CoverSerif',fontSize=10,leading=15,textColor=ink)
    for text in CONFIG['blurb']:
        p=Paragraph(escape(text),style);_,h=p.wrap(WIDTH-64,HEIGHT);p.drawOn(c,32,top-h);top-=h+11
    assert top>=240, 'Back-cover blurb is too long for its layout'
    if illustrated:
        if barcode:
            artwork(c,CONFIG['backArtwork'],32,54,203,136)
            c.setFillColor(HexColor('#FFFFFF'));c.rect(WIDTH-162,18,144,86.4,fill=1,stroke=0)
        else:artwork(c,CONFIG['backArtwork'],32,64,WIDTH-64,min(HEIGHT/2.8,top-114))
    c.setFillColor(GOLD if illustrated else NAVY);c.setFont('CoverDisplay',11);c.drawString(32,top-18,CONFIG['tagline'].upper())
    c.setFillColor(ink);c.setFont('CoverSerif',7.4);label=CONFIG['readerUrl'].removeprefix('https://').rstrip('/')
    c.drawString(32,26,label);c.linkURL(CONFIG['readerUrl'],(32,22,WIDTH-32,38),relative=1,thickness=0)
    c.restoreState()

def page_bytes(*,illustrated=True):
    stream=io.BytesIO();c=canvas.Canvas(stream,pagesize=(WIDTH,HEIGHT),initialFontName='CoverSerif');c.setTitle('Defenders of the Land - Back cover');c.setAuthor('Jay Jones');back(c,illustrated=illustrated);c.showPage();c.save();return stream.getvalue()

def export_covers(out,page_count):
    out.mkdir(parents=True,exist_ok=True)
    (out/'origins-back-cover.pdf').write_bytes(page_bytes())
    c=canvas.Canvas(str(out/'origins-front-cover.pdf'),pagesize=(WIDTH,HEIGHT),initialFontName='CoverSerif');c.setTitle('Defenders of the Land - Front cover');c.setAuthor('Jay Jones');artwork(c,CONFIG['frontArtwork'],0,0,WIDTH,HEIGHT);c.showPage();c.save()
    assert CONFIG['printer']=='amazon-kdp'
    factors={'standard-color-white':.002252,'premium-color-white':.002347}
    spine=page_count*factors[CONFIG['paper']]*72
    assert spine>0
    bleed=CONFIG['bleedInches']*72;wrap_width=WIDTH*2+spine+bleed*2;wrap_height=HEIGHT+bleed*2;name='origins-kdp-cover.pdf'
    c=canvas.Canvas(str(out/name),pagesize=(wrap_width,wrap_height),initialFontName='CoverSerif');c.setTitle('Defenders of the Land - Paperback cover');c.setAuthor('Jay Jones');c.setSubject(f"Amazon KDP, {CONFIG['paper']}, {page_count} interior pages")
    c.setFillColor(NAVY);c.rect(0,0,wrap_width,wrap_height,fill=1,stroke=0);c.translate(bleed,bleed)
    back(c,barcode=True)
    front=CONFIG.get('printFrontArtwork',CONFIG['frontArtwork'])
    artwork(c,front,WIDTH+spine+18,27,WIDTH-36,HEIGHT-54)
    c.setFillColor(GOLD);font_size=min(10,(spine-9-.2)/.790)
    if page_count>=80 and font_size>=7:
        c.setFont('CoverDisplay',font_size)
        # Bounds of the actual uppercase Bangers glyphs: [-24,766] / 1000 em.
        c.saveState();c.translate(WIDTH+spine/2,HEIGHT-48);c.rotate(-90);baseline=-.371*font_size;c.drawString(0,baseline,CONFIG['series']+' | ORIGINS');c.drawString(HEIGHT-160,baseline,CONFIG['author']);c.restoreState()
    c.setStrokeColor(GOLD);c.setLineWidth(.75)
    for yy in [26,HEIGHT-26]:c.line(WIDTH+3,yy,WIDTH+spine-3,yy)
    c.showPage();c.save()
    return {'files':['origins-front-cover.pdf','origins-back-cover.pdf',name],'interiorPages':page_count,'paper':CONFIG['paper'],'trimInches':[WIDTH/72,HEIGHT/72],'spineInches':spine/72,'wrapInches':[wrap_width/72,wrap_height/72],'bleedInches':bleed/72,'frontArtwork':front}
