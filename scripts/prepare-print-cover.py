"""Resample the approved front for its physical print placement; add no new detail."""
import json, pathlib
from PIL import Image

root = pathlib.Path(__file__).resolve().parents[1]
config = json.loads((root / 'print/cover.json').read_text(encoding='utf-8'))
if config.get('printFrontDpi'):
    source = root / 'public/assets' / config['frontArtwork']
    target = root / 'public/assets' / config['printFrontArtwork']
    assert source.resolve() != target.resolve(), 'Preserve the original artwork'
    dpi = config['printFrontDpi']
    width = config['trimWidthInches'] - .5
    height = config['trimHeightInches'] - .75
    with Image.open(source) as image:
        scale = min(width / image.width, height / image.height)
        pixels = (round(image.width * scale * dpi), round(image.height * scale * dpi))
        image.resize(pixels, Image.Resampling.LANCZOS).save(target, dpi=(dpi, dpi))
    print(f'Prepared print cover: {pixels[0]} x {pixels[1]} pixels at {dpi} DPI; original artwork preserved.')
