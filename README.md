# Defenders of the Land

Book Two has its own contents page (`book-two.html`) and Chapters 1–14 in `content/books/book-two/`. Chapter 4, **More to Carry**, is a short award-and-promotion chapter with one illustration. Chapter 5, **Words and Actions**, introduces Grandpa Larry Jenkins, the retired Defender editor; his advice only hints that he knows Jenny is the pink blur. Jenny wears civilian reporter clothes throughout Chapter 5, including her reporting rounds and shoe purchase. Chapter 6, **Where the Water Leads**, sends Perch from Lake Erie toward Lake Superior after his food runs low. Chapter 7, **The Rent Is Due**, follows Billy to Daniel's landlord, whose itemized invoice names Eleanor as the lab's payer; Jenny interviews Eleanor as she launches her mayoral campaign, and Eleanor denies paying. Chapter 8, **A Private Arrangement**, follows Billy’s private conversation with Eleanor after the campaign launch; she admits paying laboratory bills and reveals that Daniel told her Billy works with the Defenders. Eleanor threatens to jail them if he keeps interfering; the editor’s call and police interference remain unresolved. One sitting-room illustration shows Eleanor threatening Billy, with the rent invoice and campaign papers between them. Chapter 9, **Cash Only**, shows Eleanor visiting Daniel’s filthy laboratory, refusing to hear what happened to Luke, urging him to accelerate Project Skyfall, and giving him cash for rent. Project Skyfall is a provisional name; its purpose remains unspecified. Three illustrations show the arrival, Luke’s appearance, and the cash handoff. Chapter 10, **Free Electricity**, follows Eleanor’s campaign promise at a neighborhood meeting and Jenny’s questions about the undisclosed energy source, costs and testing. Two illustrations show the announcement and Jenny questioning Eleanor. Chapter 11, **The Greater Source**, is a short laboratory conversation: Daniel plans to extract Flaming Head’s energy for Skyfall, and Luke assumes it will supply the power to restore his body. Daniel gives no firm promise and has not revealed a donor. One illustration shows their conversation over a collector sketch. Chapter 12, **Unless…**, follows Billy and Jenny’s suspicion that Eleanor’s electricity promise involves Daniel and Flaming Head. Seth and Fist want to confront Daniel, but Billy urges restraint without proof; the chapter ends with the afternoon training appointment. One office illustration shows Billy stopping them. Chapter 13, **Fair Warning**, keeps the rooftop training appointment: Seth and Jenny warn Flaming Head that Daniel may want his energy, then practice staying focused. Two illustrations show Jenny in side profile and Seth pointing toward Flaming Head’s arrival, followed by the three talking with Flaming Head looking pensive. The arrival illustration was revised to reduce rear-view emphasis while keeping Jenny’s established adult identity and full uniform. Chapter 14, **The Only One**, shows Daniel identifying Seth’s altered body as the one he believes can survive Luke’s transfer. Luke is tempted by the promise of combining his iron jaws with a super body but knows capturing Zerdo will be difficult. One illustration shows Daniel and Luke reviewing a newspaper photograph and notes. Only written, available chapters are published. Book One retains its print-controlled order; additional books use their `book.json` chapter lists. Completion, saved positions and resume links are kept separately for each book. Chapter artwork is in `public/assets/book-two-chapter-*.webp`; original PNGs remain in the author's Book Two art folder. Book Two has no assigned subtitle yet, and its future rescue chapter remains unwritten.

The illustrated web reader for **Book One: Origins**, by Jay Jones.

[Read the book](https://clevelandsuperheroes.com/) · [Buy the paperback](https://www.amazon.com/dp/B0HMWW1LWL) · [Download a free sample](https://clevelandsuperheroes.com/downloads.html)

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

Optional environment variables: `PDF_PYTHON` selects a Python executable; `BOOK_CHROMIUM` selects a Chromium browser executable; `SITE_URL` overrides the canonical site URL; the default is `https://clevelandsuperheroes.com` from `content/site.json`. Every site build generates the sitemap, robots.txt, metadata and custom-domain CNAME. Windows builds also detect installed Chrome or Edge. `npm run build:site` rebuilds HTML using previously generated PDFs; `npm run build:pdfs` regenerates the publishing editions and public samples.

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

`scripts/export-epub.py` reads the same manuscript, chapter configuration and image manifest as the reader and PDFs. Every full build discovers all books with available chapters and generates a full EPUB for each, plus Book One’s three-chapter EPUB sample. Archived prose, illustration order and resources are validated for every export. `npm run build:epub` regenerates all full EPUBs, any assigned ebook covers, and Book One’s samples using the previously built Book One PDF; run `npm run build:site` afterward to update download links and sizes. EPUBCheck validates the final archive in GitHub Actions. Review the uploaded ebook in KDP's Kindle preview before publishing.

## GitHub Pages

The Pages workflow builds and tests pull requests. Pushes to `main` and manual runs also deploy the site, including freshly generated combined samples. In repository **Settings → Pages**, the build source must be **GitHub Actions**.

Generated publishing files, PDFs, HTML, temporary render files, and dependencies are excluded from Git. The workflow publishes `dist/` as a Pages artifact, so large PDFs do not increase repository history. Original high-resolution art and private authoring notes remain outside this public repository.

Deployment checks all 18 public reading chapters and both sample downloads, verifies their size and SHA-256 checksum, and confirms the previous full-book and individual chapter download URLs return 404. Run `npm run test:hosted` to repeat this check. Bundled fonts retain their SIL Open Font License notices in `print/fonts/` and the deployed font directory.

© Jay Jones. Story, characters, and illustrations are not licensed for redistribution.

## Getting the complete KDP files

Full PDF/EPUB editions and print specifications are generated in `output/publishing/`, which is excluded from Git and GitHub Pages. Each successful workflow saves every full EPUB, assigned ebook cover JPEGs, `epub-builds.json`, and Book One’s paperback interior, wrap and specifications as a separate `kdp-publishing-files` GitHub Actions artifact (retained for 90 days). Sign in to GitHub, open the completed run under Actions, and download that artifact for KDP uploads. The paperback purchase link is https://www.amazon.com/dp/B0HMWW1LWL and is configured in `content/site.json`. The Kindle ebook is https://www.amazon.com/dp/B0HMXK83HK, also configured in `content/site.json`. Both editions have purchase buttons and structured metadata.


## Website SEO and paperback purchasing

`content/site.json` is the source for the canonical domain, author, optimized web cover and Amazon paperback URL/ASIN. The original print cover remains unchanged. `paperback.html` includes the synopsis, edition details, Amazon purchase link and links to free samples and the complete web edition. Purchase links also appear on the home page, Book One contents, book library and downloads page. Every page links to the paperback page in its footer.

`seo.cjs` generates distinct titles and descriptions, author metadata, canonical URLs, Open Graph and Twitter previews, and JSON-LD for the website, author, books, paperback edition, chapters and breadcrumbs. Paperback data identifies the supplied ASIN and Amazon purchase URL without inventing ISBNs, prices, stock levels or reviews. The home URL is canonicalized to `/`. Chapter text stays server-rendered and directly linked from the contents.

Every build writes `sitemap.xml` with all published indexable pages and `robots.txt` pointing to it. The error page has `noindex` and is excluded from the sitemap. Modification dates are omitted rather than replaced with inaccurate build timestamps. The workflow defaults to the custom domain; repository variable `SITE_URL` can override it. The build writes `CNAME` for a custom host and removes it for a GitHub Pages host.

`node verify-seo.cjs` checks unique metadata, canonical and social URLs, valid JSON-LD, the Amazon link, sitemap coverage, robots.txt and the custom-domain file. It also runs in `npm test`. Reader checks cover the paperback page at 320, 390 and 1200 pixels. The hosted check reads the sitemap to cover all currently published chapters rather than a fixed Book Two chapter list.

After deployment, verify `https://clevelandsuperheroes.com` as a domain property in Google Search Console and submit `https://clevelandsuperheroes.com/sitemap.xml`; use Bing Webmaster Tools for Bing. Verification and submission require the domain owner's accounts. Search engines control indexing, snippets and rankings. The site code contains no fabricated verification tokens. After a future domain change, update the site configuration and workflow override together, preserve redirects, and resubmit the sitemap.


## EPUBs for future books

Both `npm run build` and `npm run build:epub` use `scripts/export-all-epubs.cjs` to discover `content/books/*/book.json`. Book One retains its print-controlled chapter order. Other books use their metadata chapter list and include only chapters with `available: true`, in the same order as the online reader. A book with no available chapters is skipped. All available chapters remain freely readable online for every book.

Full EPUBs are private publishing outputs: Book One keeps `output/publishing/defenders-of-the-land-origins.epub`; Book Two is `output/publishing/defenders-of-the-land-book-two.epub`; future files follow `defenders-of-the-land-<book-id>.epub`. `output/publishing/epub-builds.json` records chapter counts, cover presence, file sizes and checksums for the current books. Books marked `In progress` have a work-in-progress notice on the title page; their EPUB is the complete current available manuscript, not a finished-publication claim.

Only Book One has downloadable samples: `origins-sample-chapters-01-03.pdf` and `origins-sample-chapters-01-03.epub`. Future full EPUBs are written directly outside `dist/`, and both the site build and sample publisher enforce the two-file sample list. No Book Two sample or full-book download link is added to the website.

For a future book, add a numbered `book.json`, its ordered chapter files and artwork, using the existing Book Two format. Optional fields are `ebookCover` (an image name in `public/assets/` or `image-manifest.json`), `epubTitle`, `copyrightYear`, and a stable `epubIdentifier`. Without a cover image the EPUB starts with a title page; it does not reuse Book One’s cover. Book Two uses the approved laboratory cover in `public/assets/book-two-cover-v1.png`. Assign its approved cover and finish the manuscript before treating that draft as a KDP edition.

Every full EPUB and Book One’s sample passes EPUBCheck in GitHub Actions. `npm test` verifies all current full-book previews, linked contents, image loading and small-screen layouts at large text sizes; previews are served over localhost rather than requiring browser access to `file://`. EPUB-only rebuilding refreshes private publishing metadata while retaining existing PDF metadata. Samples link to the configured website and the supplied Amazon paperback listing. Amazon editions still require a manual KDP upload.


## Book Two approved cover and paperback wrap

For the final chapters' illustrations, use the approved cover as the canonical laboratory and character reference. Read `docs/art/book-two-finale-reference.md` before creating capture, Skyfall or rescue artwork.

The approved front is `public/assets/book-two-cover-v1.png`; an optimized WebP is used on the website. Book Two metadata assigns the original to both `cover` and `ebookCover`, so its full EPUB includes the official cover. The original PNG is retained for print and ebook export. Book Two’s contents, book-library card, home-page continuation section and social previews display this cover.

`print/book-two-cover.json` holds the approved front, back-cover copy, back illustration, trim, paper and spine assumptions. Full EPUB builds regenerate `book-two-kdp-cover.pdf`, separate front/back PDFs, a PNG wrap preview and `book-two-print-specifications.json` in `output/publishing/`; these are included in `kdp-publishing-files`, not the public website.

The current wrap is **provisional**: 6 × 9 inches, standard color on white paper, 0.125-inch exterior bleed, and an explicit 72-page assumption. Its spine is 0.162144 inches and the complete wrap is 12.412144 × 9.25 inches. Book Two is unfinished; this is not a final interior page count. No spine lettering is used at this width. A 2 × 1.2-inch blank barcode area is reserved on the back. Text is vector-based and the front remains uncropped within safe margins.

Run `python scripts/build-paperback-cover.py --book book-two` to recreate the current wrap. Once the final interior is paginated, update `interiorPageCount` in its configuration and set `pageCountIsProvisional` to `false`. For a one-off final-count export, use `--pages ACTUAL_EVEN_COUNT --final`; update the configuration too so subsequent builds keep that count. The current standard-color configuration requires at least 72 pages.

The approved source is 1024 × 1536 pixels, about 186 DPI at its 5.5 × 8.25-inch placement. The print copy is resampled to 1650 × 2475 pixels for 300-DPI placement; resampling preserves the approved composition but does not recover detail. Inspect KDP Print Previewer and order a physical proof before publication. The generated print copy is excluded from Git and rebuilt from the approved original.
