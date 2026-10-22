"""Build a KDP paperback cover from a book's approved art and explicit page count."""
import argparse,hashlib,importlib.util,json,pathlib,re,subprocess,sys
import pymupdf as fitz
from PIL import Image

root=pathlib.Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--book',required=True)
parser.add_argument('--pages',type=int,help='Actual final interior page count, or an explicit draft assumption')
parser.add_argument('--final',action='store_true',help='Require an explicit final interior page count')
args=parser.parse_args()
assert re.fullmatch(r'[a-z0-9-]+',args.book),'Invalid book ID'
config_path=pathlib.Path('print')/f'{args.book}-cover.json'
config=json.loads((root/config_path).read_text(encoding='utf-8'))
assert config['book']==args.book
interior=None
if config.get('interiorPdf'):
    assert args.pages is None,'This cover derives its page count from the built interior PDF'
    interior=root/'output/publishing'/config['interiorPdf']
    assert interior.exists(),'Build the paperback interior before the cover'
    with fitz.open(interior) as doc:
        pages=len(doc)
        assert all(abs(p.rect.width-432)<.1 and abs(p.rect.height-648)<.1 for p in doc),'Interior trim must match the cover'
else:
    pages=args.pages if args.pages is not None else config['interiorPageCount']
assert pages%2==0 and pages>=72,'Standard-color paperback needs an even count of at least 72 pages'
assert config['paper']=='standard-color-white','This cover configuration uses standard color on white paper'
assert not args.final or args.pages is not None or interior,'Final covers require an actual interior page count'
provisional=False if args.final else config.get('pageCountIsProvisional',True)
subprocess.run([sys.executable,'scripts/prepare-print-cover.py','--config',str(config_path)],cwd=root,check=True)
spec=importlib.util.spec_from_file_location('cover_layout',root/'scripts/cover-layout.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);module.configure(config)
out=root/'output/publishing';out.mkdir(parents=True,exist_ok=True)
report=module.export_covers(out,pages,stem=args.book)
report.update({'bookId':args.book,'provisional':provisional,'pageCountBasis':'provisional assumption; final interior pagination required' if provisional else 'explicit final interior page count','barcodeBoxInches':[2,1.2],'interiorBleed':False})
if interior:
    report.update({'pageCountBasis':'measured from generated paperback interior PDF','interiorFile':interior.name,'interiorSha256':hashlib.sha256(interior.read_bytes()).hexdigest()})
with Image.open(root/'public/assets'/config['frontArtwork']) as image:
    report['originalFrontPixels']=list(image.size)
    report['originalFrontEffectiveDpi']=min(image.width/5.5,image.height/8.25)
with Image.open(root/'public/assets'/config['printFrontArtwork']) as image:
    report['printFrontPixels']=list(image.size)
    report['printFrontEffectiveDpi']=min(image.width/5.5,image.height/8.25)
report['notes']=['Spine width must match the final interior PDF before KDP upload.','The approved front was resampled for its 300-DPI placement without restoring new detail. Review KDP Print Previewer and a physical proof.','Amazon barcode space is reserved on the back.']
pdf=out/f'{args.book}-kdp-cover.pdf'
with fitz.open(pdf) as doc:
    assert len(doc)==1
    assert all(abs(a-b*72)<.1 for a,b in zip([doc[0].rect.width,doc[0].rect.height],report['wrapInches']))
    text=doc[0].get_text()
    normalize=lambda s: re.sub(r'\s+','',s)
    for paragraph in config['blurb']:assert normalize(paragraph) in normalize(text),'Back-cover text missing'
    for block in doc[0].get_text('dict')['blocks']:
        if block['type']==0:
            for line in block['lines']:
                for span in line['spans']:
                    assert doc[0].rect.contains(fitz.Rect(span['bbox'])),'Cover text outside page'
    preview=out/f'{args.book}-kdp-cover-preview.png';doc[0].get_pixmap(matrix=fitz.Matrix(1.8,1.8)).save(preview)
report['preview']=preview.name
report['sha256']=hashlib.sha256(pdf.read_bytes()).hexdigest()
(out/f'{args.book}-print-specifications.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(f'Built {pdf.name}: {pages} pages, spine {report["spineInches"]:.6f} in, '+('PROVISIONAL' if provisional else 'final page count supplied'))
