# Defenders of the Land

The illustrated web reader for **Book One: Origins**, by Jay Jones.

[Read the book](https://jayjonesvip.github.io/DefendersOfTheLand/) · [Download PDFs](https://jayjonesvip.github.io/DefendersOfTheLand/downloads.html)

All 18 chapters, saved reading progress, character profiles, dark mode, and mobile layouts. Downloads include an illustrated EPUB, its separate Kindle cover JPEG, the complete illustrated PDF, a smaller text-only edition, and an illustrated PDF for every chapter.

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

`npm run build` generates and validates all 24 PDFs and the illustrated EPUB, then builds the site in `dist/`. `npm test` checks download hashes, local links, exact chapter prose, navigation, image loading, reading progress, and desktop/mobile layouts, including EPUB chapters at large text sizes. PDF validation checks every manuscript passage, page bounds, missing illustrations, and text overlapping artwork. GitHub builds also require EPUBCheck 5.4.0 to pass before deploying.

Optional environment variables: `PDF_PYTHON` selects a Python executable; `BOOK_CHROMIUM` selects a Chromium browser executable; `SITE_URL` sets the canonical site URL and sitemap. Windows builds also detect installed Chrome or Edge. `npm run build:site` rebuilds HTML using previously generated PDFs; `npm run build:pdfs` regenerates only PDFs.

## Edit the book

Manuscript files live in `content/books/origins/`. Chapter order and illustrations come from `print/sample.json` and `print/chapter2.json` through `print/chapter18.json`; display chapter numbers can differ from source filenames. `image-manifest.json` maps manuscript artwork names to the optimized images in `public/assets/`. The print templates and bundled fonts live in `print/`.

Edit source files, build, test, and push to `main`. Do not edit generated HTML or PDFs: the next build replaces them. Chapter PDFs use the same pages as the complete illustrated reading edition and retain its printed page numbers.

## Cover and Amazon paperback

Edit the back-cover hook, blurb, artwork references and printing settings in `print/cover.json`. The original illustrated front cover remains unchanged. Full downloadable editions include a closing back cover; the text-only edition uses a white text-only version.

The paperback uses **6 × 9 inches, standard color on white paper, and no interior bleed**. Upload `origins-kdp-interior.pdf` as the manuscript and `origins-kdp-cover.pdf` as the cover. The manuscript excludes the outside covers, includes a copyright page, starts Chapter One on a right-hand page, and ends on an even page count. The cover has 0.125-inch outer bleed and an empty white area for Amazon's barcode.

Every build recalculates the spine from the actual print manuscript's page count using [KDP's cover specifications](https://kdp.amazon.com/en_US/help/topic/G201953020). It does not use the downloadable reading PDF's page count. `dist/books/print-specifications.json` records dimensions and artwork resolution. `scripts/prepare-print-cover.py` regenerates a 1650 × 2475 print version from the approved original on every build, providing 300 DPI at its 5.5 × 8.25-inch placement. This preserves the design and adds pixels without restoring detail; the source remains about 186 DPI at that placement. The digital cover continues to use the untouched original. Check KDP Print Previewer and review a physical proof before publishing.

Font and blurb text are embedded as vectors. Standalone front and back cover PDFs and a wrap preview are available on the Downloads page. The generated preview is a PNG; the Amazon cover is a single-page PDF without crop marks or guide text.

## Kindle / EPUB

Upload `defenders-of-the-land-origins.epub` as the Kindle manuscript and `origins-ebook-cover.jpg` as the separate cover. The EPUB is reflowable, with all 18 chapters, the same illustrations in story order, selectable text, image descriptions, an EPUB navigation document and a legacy NCX table of contents. It has no print headers, page numbers, spine or barcode. JPEG artwork is packaged inside the book so it works offline. The original front is converted to JPEG without changing its proportions or adding detail.

`scripts/export-epub.py` reads the same manuscript, chapter configuration and image manifest as the reader and PDFs. Every full build regenerates the EPUB, checks its archived prose and resources, and publishes it with the site. `npm run build:epub` regenerates only the EPUB and its cover; run `npm run build:site` afterward to update download links and sizes. EPUBCheck validates the final archive in GitHub Actions. Review the uploaded ebook in KDP's Kindle preview before publishing.

## GitHub Pages

The Pages workflow builds and tests pull requests. Pushes to `main` and manual runs also deploy the site, including freshly generated PDFs. In repository **Settings → Pages**, the build source must be **GitHub Actions**.

Generated PDFs, HTML, temporary render files, and dependencies are excluded from Git. The workflow publishes `dist/` as a Pages artifact, so large PDFs do not increase repository history. Original high-resolution art and private authoring notes remain outside this public repository.

Deployment also checks the public reader and downloads all 24 hosted PDFs to verify their size and SHA-256 checksum. Run `npm run test:hosted` to repeat this check. Bundled fonts retain their SIL Open Font License notices in `print/fonts/` and the deployed font directory.

© Jay Jones. Story, characters, and illustrations are not licensed for redistribution.
