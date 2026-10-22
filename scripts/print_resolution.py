"""Measure native raster pixels against actual PDF placement, never DPI metadata."""
import math

MINIMUM_DPI = 300


def inspect_image_resolution(doc, minimum_dpi=MINIMUM_DPI):
    """Check every occurrence (including reused/inline images) on both axes.

    PDF transform basis lengths preserve the measurement for rotated images;
    an axis-aligned bounding box would incorrectly penalize rotated artwork.
    Call on the saved final PDF, after any raster encoding/replacement.
    """
    placements = []
    for number, page in enumerate(doc, 1):
        for image in page.get_image_info():
            a, b, c, d, _, _ = image['transform']
            width, height = math.hypot(a, b), math.hypot(c, d)
            if not all(math.isfinite(v) and v > 0 for v in (width, height)):
                raise ValueError(f'Invalid image placement on page {number}')
            dpi = (image['width'] * 72 / width, image['height'] * 72 / height)
            if not all(math.isfinite(v) and v >= minimum_dpi for v in dpi):
                raise ValueError(
                    f'Low-resolution image on page {number}: '
                    f'{image["width"]} x {image["height"]} pixels at '
                    f'{width / 72:.4f} x {height / 72:.4f} inches; '
                    f'{dpi[0]:.3f} x {dpi[1]:.3f} DPI (minimum {minimum_dpi})')
            placements.append({'page': number, 'pixels': [image['width'], image['height']],
                               'placedInches': [width / 72, height / 72],
                               'dpi': list(dpi)})
    if not placements:
        raise ValueError('Print PDF contains no image placements')
    return {'minimumRequiredDpi': minimum_dpi,
            'minimumPlacedImageDpi': min(min(p['dpi']) for p in placements),
            'placements': placements}
