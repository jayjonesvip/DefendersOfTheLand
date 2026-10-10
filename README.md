# Defenders of the Land

The illustrated web reader for **Book One: Origins**, by Jay Jones.

[Read the book](https://jayjonesvip.github.io/DefendersOfTheLand/) · [Download PDFs](https://jayjonesvip.github.io/DefendersOfTheLand/downloads.html)

All 18 chapters, saved reading progress, character profiles, dark mode, and mobile layouts. Downloads include the complete illustrated book, a smaller text-only edition, and an illustrated PDF for every chapter.

## Build locally

Use Node.js 22 or newer and Python 3.12 or newer:

```sh
npm ci
python -m pip install -r requirements.txt
npx playwright install chromium
npm run build
npm test
npm run preview
```

Open http://localhost:4175. On Linux, use `npx playwright install --with-deps chromium` to install browser system dependencies too.

`npm run build` generates and validates all 20 PDFs, then builds the site in `dist/`. `npm test` checks download hashes, local links, exact chapter prose, navigation, image loading, reading progress, and desktop/mobile layouts. PDF validation checks every manuscript passage, page bounds, missing illustrations, and text overlapping artwork.

Optional environment variables: `PDF_PYTHON` selects a Python executable; `BOOK_CHROMIUM` selects a Chromium browser executable; `SITE_URL` sets the canonical site URL and sitemap. Windows builds also detect installed Chrome or Edge. `npm run build:site` rebuilds HTML using previously generated PDFs; `npm run build:pdfs` regenerates only PDFs.

## Edit the book

Manuscript files live in `content/books/origins/`. Chapter order and illustrations come from `print/sample.json` and `print/chapter2.json` through `print/chapter18.json`; display chapter numbers can differ from source filenames. `image-manifest.json` maps manuscript artwork names to the optimized images in `public/assets/`. The print templates and bundled fonts live in `print/`.

Edit source files, build, test, and push to `main`. Do not edit generated HTML or PDFs: the next build replaces them. Chapter PDFs use the same pages as the complete illustrated edition and retain its printed page numbers. PDFs are reading editions; commercial print preparation is a separate step.

## GitHub Pages

The Pages workflow builds and tests pull requests. Pushes to `main` and manual runs also deploy the site, including freshly generated PDFs. In repository **Settings → Pages**, the build source must be **GitHub Actions**.

Generated PDFs, HTML, temporary render files, and dependencies are excluded from Git. The workflow publishes `dist/` as a Pages artifact, so large PDFs do not increase repository history. Original high-resolution art and private authoring notes remain outside this public repository.

Deployment also checks the public reader and downloads all 20 hosted PDFs to verify their size and SHA-256 checksum. Run `npm run test:hosted` to repeat this check. Bundled fonts retain their SIL Open Font License notices in `print/fonts/` and the deployed font directory.

© Jay Jones. Story, characters, and illustrations are not licensed for redistribution.
