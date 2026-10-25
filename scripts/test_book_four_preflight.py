"""Run after npm run build: exercise final-file preflight rejection paths."""
import hashlib
import json
import pathlib
import shutil
import subprocess
import sys
import tempfile
import unittest

import pymupdf as fitz

ROOT = pathlib.Path(__file__).resolve().parents[1]


class BookFourPreflightTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = pathlib.Path(self.temp.name)
        for folder in ('scripts', 'print', 'output/publishing', 'content/books'):
            (self.root / folder).mkdir(parents=True)
        for name in ('preflight-book-four.py', 'print_resolution.py'):
            shutil.copy2(ROOT / 'scripts' / name, self.root / 'scripts' / name)
        shutil.copy2(ROOT / 'print/book-four-interior.json', self.root / 'print')
        shutil.copytree(ROOT / 'content/books/book-four', self.root / 'content/books/book-four')
        (self.root / 'public').symlink_to(ROOT / 'public', target_is_directory=True)
        for name in ('book-four-kdp-interior.pdf', 'book-four-pdf-build.json'):
            shutil.copy2(ROOT / 'output/publishing' / name, self.root / 'output/publishing')

    def run_preflight(self):
        return subprocess.run([sys.executable, str(self.root / 'scripts/preflight-book-four.py')],
                              text=True, capture_output=True)

    def test_current_interior_passes(self):
        result = self.run_preflight()
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_stale_build_report_is_rejected(self):
        report = self.root / 'output/publishing/book-four-pdf-build.json'
        data = json.loads(report.read_text())
        data['sha256'] = '0' * 64
        report.write_text(json.dumps(data))
        result = self.run_preflight()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Stale print build report', result.stderr)

    def test_print_navigation_is_rejected_even_with_updated_checksum(self):
        pdf = self.root / 'output/publishing/book-four-kdp-interior.pdf'
        with fitz.open(pdf) as doc:
            doc[0].insert_link({'kind': fitz.LINK_URI, 'from': fitz.Rect(100, 100, 120, 120),
                                'uri': 'https://example.com'})
            doc.saveIncr()
        report = self.root / 'output/publishing/book-four-pdf-build.json'
        data = json.loads(report.read_text())
        data['sha256'] = hashlib.sha256(pdf.read_bytes()).hexdigest()
        report.write_text(json.dumps(data))
        result = self.run_preflight()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Interactive objects in print PDF', result.stderr)

    def test_missing_source_prose_is_rejected(self):
        chapter = self.root / 'content/books/book-four/chapter-01.json'
        data = json.loads(chapter.read_text())
        block = next(b for b in data['blocks'] if b.get('text'))
        block['text'] = 'A deliberately missing passage for the preflight rejection test.'
        chapter.write_text(json.dumps(data))
        result = self.run_preflight()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Missing or reordered source prose', result.stderr)


if __name__ == '__main__':
    unittest.main()
