"""Regression tests use saved PDFs with actual raster placements."""
import io
import pathlib
import tempfile
import unittest

import pymupdf as fitz
from PIL import Image

from print_resolution import inspect_image_resolution as inspect


class PrintResolutionTests(unittest.TestCase):
    def image(self, size=(1024, 1536), dpi=300, format='PNG'):
        stream = io.BytesIO()
        Image.new('RGB', size, '#7392ab').save(stream, format, dpi=(dpi, dpi))
        return stream.getvalue()

    def check_saved(self, doc):
        with tempfile.TemporaryDirectory() as directory:
            path = pathlib.Path(directory) / 'final.pdf'
            doc.save(path)
            with fitz.open(path) as final:
                return inspect(final)

    def test_original_6_6_inch_portrait_fails_even_with_600_dpi_metadata(self):
        with fitz.open() as doc:
            doc.new_page(width=432, height=648).insert_image(
                fitz.Rect(40, 50, 40 + 4.4 * 72, 50 + 6.6 * 72),
                stream=self.image(dpi=600))
            with self.assertRaisesRegex(ValueError, r'page 1.*232\.727'):
                self.check_saved(doc)

    def test_302_dpi_native_portrait_and_landscape_pass_after_jpeg_encoding(self):
        with fitz.open() as doc:
            for w, h in [(1024, 1536), (1536, 1024)]:
                doc.new_page(width=432, height=648).insert_image(
                    fitz.Rect(40, 50, 40 + w / 302 * 72, 50 + h / 302 * 72),
                    stream=self.image((w, h), format='JPEG'))
            result = self.check_saved(doc)
            self.assertEqual(len(result['placements']), 2)
            self.assertGreater(result['minimumPlacedImageDpi'], 301.99)

    def test_reused_image_checked_at_every_occurrence(self):
        with fitz.open() as doc:
            xref = doc.new_page().insert_image(fitz.Rect(0, 0, 144, 216), stream=self.image())
            doc.new_page().insert_image(fitz.Rect(0, 0, 316.8, 475.2), xref=xref)
            with self.assertRaisesRegex(ValueError, 'page 2'):
                self.check_saved(doc)

    def test_both_axes_checked_for_distorted_images(self):
        with fitz.open() as doc:
            doc.new_page().insert_image(fitz.Rect(0, 0, 200, 500),
                                       stream=self.image(), keep_proportion=False)
            with self.assertRaisesRegex(ValueError, 'Low-resolution'):
                self.check_saved(doc)

    def test_rotated_native_image_uses_transform_axes(self):
        with fitz.open() as doc:
            doc.new_page().insert_image(fitz.Rect(0, 0, 360, 240),
                                       stream=self.image(), rotate=90)
            self.assertAlmostEqual(self.check_saved(doc)['minimumPlacedImageDpi'], 307.2, places=2)

    def test_empty_pdf_cannot_claim_resolution_pass(self):
        with fitz.open() as doc:
            doc.new_page()
            with self.assertRaisesRegex(ValueError, 'no image placements'):
                self.check_saved(doc)

    def test_below_threshold_is_not_rounded_up(self):
        with fitz.open() as doc:
            doc.new_page().insert_image(fitz.Rect(0, 0, 1024 / 299.99 * 72, 1536 / 299.99 * 72),
                                       stream=self.image())
            with self.assertRaisesRegex(ValueError, 'minimum 300'):
                self.check_saved(doc)


if __name__ == '__main__':
    unittest.main()
