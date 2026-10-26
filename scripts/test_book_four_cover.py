"""Run after building: check wrap growth and reject mismatched upload files."""
import hashlib
import importlib.util
import json
import pathlib
import shutil
import subprocess
import sys
import tempfile
import unittest

import pymupdf as fitz

ROOT = pathlib.Path(__file__).resolve().parents[1]


class BookFourCoverTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = pathlib.Path(self.temp.name)
        for folder in ('scripts', 'print', 'output/publishing'):
            (self.root / folder).mkdir(parents=True)
        for name in ('preflight-book-four-cover.py', 'print_resolution.py'):
            shutil.copy2(ROOT / 'scripts' / name, self.root / 'scripts' / name)
        for name in ('book-four-interior.json', 'book-four-cover.json'):
            shutil.copy2(ROOT / 'print' / name, self.root / 'print' / name)
        (self.root / 'public').symlink_to(ROOT / 'public', target_is_directory=True)
        for name in ('book-four-kdp-interior.pdf', 'book-four-kdp-cover.pdf',
                     'book-four-print-specifications.json'):
            shutil.copy2(ROOT / 'output/publishing' / name, self.root / 'output/publishing' / name)

    def run_preflight(self):
        return subprocess.run([sys.executable, str(self.root / 'scripts/preflight-book-four-cover.py')],
                              text=True, capture_output=True)

    def test_current_wrap_passes(self):
        result = self.run_preflight()
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_changed_interior_is_rejected(self):
        interior = self.root / 'output/publishing/book-four-kdp-interior.pdf'
        with interior.open('ab') as stream:
            stream.write(b'\n% changed interior checksum\n')
        result = self.run_preflight()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('interior checksum changed', result.stderr)

    def test_barcode_ink_is_rejected_even_with_updated_checksum(self):
        cover = self.root / 'output/publishing/book-four-kdp-cover.pdf'
        with fitz.open(cover) as doc:
            doc[0].draw_rect(fitz.Rect(300, 580, 320, 600), fill=(1, 0, 0), color=None)
            doc.saveIncr()
        spec = self.root / 'output/publishing/book-four-print-specifications.json'
        data = json.loads(spec.read_text())
        data['sha256'] = hashlib.sha256(cover.read_bytes()).hexdigest()
        spec.write_text(json.dumps(data))
        result = self.run_preflight()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Barcode area is not blank white', result.stderr)

    def test_wrap_grows_and_spine_lettering_stays_safe(self):
        module_spec = importlib.util.spec_from_file_location('book_four_layout', ROOT / 'scripts/cover-layout.py')
        layout = importlib.util.module_from_spec(module_spec)
        module_spec.loader.exec_module(layout)
        config = json.loads((ROOT / 'print/book-four-cover.json').read_text())
        layout.configure(config)
        widths = []
        for pages in (72, 104, 160, 320):
            layout.export_covers(self.root, pages, stem='sample')
            with fitz.open(self.root / 'sample-kdp-cover.pdf') as doc:
                page = doc[0]
                widths.append(page.rect.width)
                self.assertAlmostEqual(page.rect.width, (12.25 + pages * .002252) * 72, places=3)
                left = 6.125 * 72
                right = left + pages * .002252 * 72
                for block in page.get_text('dict')['blocks']:
                    if block['type'] != 0:
                        continue
                    for line in block['lines']:
                        if line['dir'] != (0., 1.):
                            continue
                        for span in line['spans']:
                            self.assertGreaterEqual(span['bbox'][0], left + 4.5)
                            self.assertLessEqual(span['bbox'][2], right - 4.5)
                if pages >= 160:
                    self.assertIn(config['spineTitle'], page.get_text())
                if pages == 72:
                    self.assertNotIn(config['spineTitle'], page.get_text())
        self.assertTrue(all(b > a for a, b in zip(widths, widths[1:])))


if __name__ == '__main__':
    unittest.main()
