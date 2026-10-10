# Defenders of the Land

The illustrated web reader for **Book One: Origins**, by Jay Jones.

[Read the book](https://jayjonesvip.github.io/DefendersOfTheLand/) · [Download a free sample](https://jayjonesvip.github.io/DefendersOfTheLand/downloads.html)

All 18 chapters, saved reading progress, character profiles, dark mode, and mobile layouts. Readers can read all 18 chapters free online and download a combined three-chapter sample as an illustrated PDF or reflowable EPUB. Full editions and individual chapter downloads are not hosted on the public site.

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

`npm run build` generates and validates all 24 PDFs and the illustrated EPUB, creates the combined three-chapter samples, moves complete editions to `output/publishing/`, then builds the site in `dist/`. Only the sample PDF and EPUB are deployed. `npm test` checks download hashes, local links, exact chapter prose, navigation, image loading, reading progress, and desktop/mobile layouts, including EPUB chapters at large text sizes. PDF validation checks every manuscript passage, page bounds, missing illustrations, and text overlapping artwork. GitHub builds also require EPUBCheck 5.4.0 to pass before deploying.

Optional environment variables: `PDF_PYTHON` selects a Python executable; `BOOK_CHROMIUM` selects a Chromium browser executable; `SITE_URL` sets the canonical site URL and sitemap. Windows builds also detect installed Chrome or Edge. `npm run build:site` rebuilds HTML using previously generated PDFs; `npm run build:pdfs` regenerates the publishing editions and public samples.

## Edit the book

Manuscript files live in `content/books/origins/`. Chapter order and illustrations come from `print/sample.json` and `print/chapter2.json` through `print/chapter18.json`; display chapter numbers can differ from source filenames. `image-manifest.json` maps manuscript artwork names to the optimized images in `public/assets/`. The print templates and bundled fonts live in `print/`.

Edit source files, build, test, and push to `main`. Do not edit generated HTML or PDFs: the next build replaces them. The sample PDF retains the complete illustrated edition’s page numbers for Chapters 1-3. Publishing exports, including chapter PDFs, remain outside the deployed site.

## Cover and Amazon paperback

Edit the back-cover hook, blurb, artwork references and printing settings in `print/cover.json`. The original illustrated front cover remains unchanged. Full author editions include a closing back cover; the text-only edition uses a white text-only version.

The paperback uses **6 × 9 inches, standard color on white paper, and no interior bleed**. Upload `origins-kdp-interior.pdf` as the manuscript and `origins-kdp-cover.pdf` as the cover. The manuscript excludes the outside covers, includes a copyright page, starts Chapter One on a right-hand page, and ends on an even page count. The cover has 0.125-inch outer bleed and an empty white area for Amazon's barcode.

Every build recalculates the spine from the actual print manuscript's page count using [KDP's cover specifications](https://kdp.amazon.com/en_US/help/topic/G201953020). It does not use the downloadable reading PDF's page count. `output/publishing/print-specifications.json` records dimensions and artwork resolution. `scripts/prepare-print-cover.py` regenerates a 1650 × 2475 print version from the approved original on every build, providing 300 DPI at its 5.5 × 8.25-inch placement. This preserves the design and adds pixels without restoring detail; the source remains about 186 DPI at that placement. The digital cover continues to use the untouched original. Check KDP Print Previewer and review a physical proof before publishing.

Font and blurb text are embedded as vectors. Standalone front and back cover PDFs and a wrap preview are retained in `output/publishing/`. The generated preview is a PNG; the Amazon cover is a single-page PDF without crop marks or guide text.

## Kindle / EPUB

Upload `defenders-of-the-land-origins.epub` as the Kindle manuscript and `origins-ebook-cover.jpg` as the separate cover. The EPUB is reflowable, with all 18 chapters, the same illustrations in story order, selectable text, image descriptions, an EPUB navigation document and a legacy NCX table of contents. It has no print headers, page numbers, spine or barcode. JPEG artwork is packaged inside the book so it works offline. The original front is converted to JPEG without changing its proportions or adding detail.

`scripts/export-epub.py` reads the same manuscript, chapter configuration and image manifest as the reader and PDFs. Every full build regenerates the full EPUB for KDP and a separate three-chapter EPUB for the public site, checking archived prose and resources in both. `npm run build:epub` regenerates the full EPUB, its cover, and the samples using the previously built PDF; run `npm run build:site` afterward to update download links and sizes. EPUBCheck validates the final archive in GitHub Actions. Review the uploaded ebook in KDP's Kindle preview before publishing.

## GitHub Pages

The Pages workflow builds and tests pull requests. Pushes to `main` and manual runs also deploy the site, including freshly generated combined samples. In repository **Settings → Pages**, the build source must be **GitHub Actions**.

Generated publishing files, PDFs, HTML, temporary render files, and dependencies are excluded from Git. The workflow publishes `dist/` as a Pages artifact, so large PDFs do not increase repository history. Original high-resolution art and private authoring notes remain outside this public repository.

Deployment checks all 18 public reading chapters and both sample downloads, verifies their size and SHA-256 checksum, and confirms the previous full-book and individual chapter download URLs return 404. Run `npm run test:hosted` to repeat this check. Bundled fonts retain their SIL Open Font License notices in `print/fonts/` and the deployed font directory.

© Jay Jones. Story, characters, and illustrations are not licensed for redistribution.

## Getting the complete KDP files

Full PDF/EPUB editions and print specifications are generated in `output/publishing/`, which is excluded from Git and GitHub Pages. Each successful workflow saves the Kindle EPUB, Kindle front JPEG, paperback interior, paperback wrap and specifications as a separate `kdp-publishing-files` GitHub Actions artifact (retained for 90 days). Sign in to GitHub, open the completed run under Actions, and download that artifact for KDP uploads. The Kindle purchase link can be added to the companion site when the book is published; no listing URL has been invented.
