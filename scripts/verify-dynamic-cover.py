"""Exercise Book Three wrap growth, spine clearance and back copy at several sizes."""
import importlib.util,json,pathlib,re,tempfile
import pymupdf as fitz

root=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('cover_layout',root/'scripts/cover-layout.py')
layout=importlib.util.module_from_spec(spec);spec.loader.exec_module(layout)
config=json.loads((root/'print/book-three-cover.json').read_text())
layout.configure(config)
normalize=lambda text:re.sub(r'\s+','',text)
widths=[]
with tempfile.TemporaryDirectory() as folder:
    for pages in (72,80,160,320):
        report=layout.export_covers(pathlib.Path(folder),pages,stem='test')
        with fitz.open(pathlib.Path(folder)/'test-kdp-cover.pdf') as doc:
            page=doc[0];widths.append(page.rect.width)
            assert abs(page.rect.width-(12+.25+pages*.002252)*72)<.01
            assert abs(page.rect.height-9.25*72)<.01
            text=page.get_text()
            for paragraph in config['blurb']:assert normalize(paragraph) in normalize(text)
            spine_left=(6+.125)*72;spine_right=spine_left+pages*.002252*72
            for block in page.get_text('dict')['blocks']:
                if block['type']!=0:continue
                for line in block['lines']:
                    for span in line['spans']:
                        box=fitz.Rect(span['bbox']);assert page.rect.contains(box)
                        if line['dir']==(0.,1.):
                            assert box.x0>=spine_left+4.5 and box.x1<=spine_right-4.5
            if pages==72:assert config['spineTitle'] not in text
            if pages>=160:assert config['spineTitle'] in text
assert all(b>a for a,b in zip(widths,widths[1:]))
print('PASS: Book Three wrap grows at 72/80/160/320 pages, with safe spine text and complete back copy.')
