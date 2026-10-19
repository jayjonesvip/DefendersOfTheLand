# Defenders of the Land

Book Two’s narrative is complete through Chapter 21, **Tomorrow**, in `content/books/book-two/`. Jenny’s checked reporting exposes the limits of Daniel’s electricity demonstration; the remaining campaign unravels, Eleanor loses and publicly coins “Doc Dork,” and she ends Daniel’s support. Daniel and Luke’s whereabouts remain unknown. The book closes with the Defenders together in Billy’s office and Seth expected back tomorrow.

All 21 available chapters appear in `book.json` order in the web reader and private EPUB export. Manuscript completion is separate from publication: Book Two is **unpublished**, with no Kindle or paperback purchase link. Its iris-corrected cover v5-green remains a review candidate (v4 is preserved); v3 is the approved character/style reference. The paperback wrap’s dimensions and 72-page assumption remain provisional until a Book Two interior build establishes the final page count.

Chapter 21 has six separate illustrations, preserved original PNGs, optimized WebPs, exact production prompts and descriptive alt text. See [the final continuity sweep](docs/editorial/book-two-final-sweep.md), [continuity notes](docs/editorial/book-two-continuity.md) and [art provenance](docs/art/book-two-chapter-21-prompts.json). Chapter 20’s detached ankle cuff is now explicitly opened and removed from Seth’s boot before he stands. Book One remains finished and locked; its sources and artwork are unchanged.

Book Two has no assigned subtitle. Per-book completion, saved positions and resume links stay separate. Historical audit and deferred-draft documents retain their original scope and are superseded by the current manuscript and final sweep where indicated.

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

`npm run build` generates and validates the 24 Book One PDFs, Book Two’s illustrated review PDF, Book Three’s measured paperback interior and wrap, and all three books’ EPUBs, creates the combined three-chapter samples, moves complete editions to `output/publishing/`, then builds the site in `dist/`. Only the sample PDF and EPUB are deployed. `npm test` checks download hashes, local links, exact chapter prose, navigation, image loading, reading progress, and desktop/mobile layouts, including EPUB chapters at large text sizes. PDF validation checks every manuscript passage, page bounds, missing illustrations, and text overlapping artwork. GitHub builds also require EPUBCheck 5.4.0 to pass before deploying.

Optional environment variables: `PDF_PYTHON` selects a Python executable; `BOOK_CHROMIUM` selects a Chromium browser executable; `SITE_URL` overrides the canonical site URL; the default is `https://clevelandsuperheroes.com` from `content/site.json`. Every site build generates the sitemap, robots.txt, metadata and custom-domain CNAME. Windows builds also detect installed Chrome or Edge. `npm run build:site` rebuilds HTML using previously generated PDFs; `npm run build:pdfs` regenerates the publishing editions and public samples.

## From the Vault: 1990

The archive is at `1990-vault.html`, a subpage of `author.html`. The author biography is rendered by `author.cjs`, with a replaceable SVG portrait silhouette in `public/assets/author-silhouette.svg`. The shared navigation links to Author, and the author page links to the Vault; the Vault breadcrumb links back. On screens up to 800px, `site-nav.js` progressively enhances the navigation with a hamburger menu, keyboard/Escape support and appropriate focus handling. Without JavaScript, the navigation stays visible. It presents the supplied retrospective and nine restored childhood comic pages in their original sequence. The source article is preserved byte-for-byte in `content/vault/1990Vault.md`; the original PNGs are in `public/vault/1990/originals/`. Responsive WebP copies in `public/vault/1990/previews/` are display assets only, with no cropping, recoloring or redrawing. Full-resolution originals load when the viewer opens a page.

`content/vault/gallery.json` contains captions, alt text, dimensions, image paths and original SHA-256 hashes. `vault.cjs` renders the article and gallery through the existing site shell, `vault.css` scopes the archive styling, and `vault-gallery.js` provides a native dialog with keyboard navigation, contained focus, swipe support and focus restoration. Without JavaScript, the gallery links still open the original images. SEO metadata and structured data are generated by `seo.cjs` using the existing conventions.

Preview: run `npm run build:site`, then `npm run preview`, and open `http://localhost:4175/1990-vault.html`. Run `npm run test:vault` for artwork integrity and desktop/mobile interaction checks; these checks also run as part of `npm test`. Screenshots are written to `tmp/qa/vault-*.png`. No additional runtime dependencies are required.

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

Deployment checks every sitemap page and its referenced images/scripts, checks both sample downloads against their size and SHA-256 checksum, and confirms the previous full-book and individual chapter download URLs return 404. Asset URLs come from the generated pages, including every responsive `srcset` candidate and fallback `src`, rather than a fixed list of artwork versions. Run `npm run test:hosted` to repeat this check. `npm test` also exercises the hosted checker against the local build under a URL prefix and verifies that a missing current illustration or srcset-only Vault image fails it. Bundled fonts retain their SIL Open Font License notices in `print/fonts/` and the deployed font directory.

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

For a future book, add a numbered `book.json`, its ordered chapter files and artwork, using the existing Book Two format. Optional fields are `ebookCover` (an image name in `public/assets/` or `image-manifest.json`), `epubTitle`, `copyrightYear`, and a stable `epubIdentifier`. Without a cover image the EPUB starts with a title page; it does not reuse Book One’s cover. Book Two currently uses the iris-corrected basement review candidate in `public/assets/book-two-cover-v5-green.png`; the previously approved v3 remains preserved. Obtain cover approval and build the final print interior before treating that review export as a KDP edition.

Every full EPUB and Book One’s sample passes EPUBCheck in GitHub Actions. `npm test` verifies all current full-book previews, linked contents, image loading and small-screen layouts at large text sizes; previews are served over localhost rather than requiring browser access to `file://`. EPUB-only rebuilding refreshes private publishing metadata while retaining existing PDF metadata. Samples link to the configured website and the supplied Amazon paperback listing. Amazon editions still require a manual KDP upload.


## Book Two cover review and paperback wrap

For the final chapters' illustrations, use the previously approved v3 cover for character/style reference and the basement continuity guide for laboratory geometry. Read `docs/art/book-two-finale-reference.md` before creating capture, Skyfall or rescue artwork.

The current review candidate is `public/assets/book-two-cover-v5-green.png`, an iris-only correction to the preserved v4; an optimized WebP is used on the website. The previously author-approved v3 originals remain preserved. Book Two metadata assigns v5-green to both `cover` and `ebookCover` for review exports in PR #5; author approval is pending. The original PNG is retained for print and ebook export. Book Two’s contents, book-library card, home-page continuation section and social previews display this cover.

`print/book-two-cover.json` holds the current review front, back-cover copy, back illustration, trim, paper and spine assumptions. Full EPUB builds regenerate `book-two-kdp-cover.pdf`, separate front/back PDFs, a PNG wrap preview and `book-two-print-specifications.json` in `output/publishing/`; these are included in `kdp-publishing-files`, not the public website.

The current wrap is **provisional**: 6 × 9 inches, standard color on white paper, 0.125-inch exterior bleed, and an explicit 72-page assumption. Its spine is 0.162144 inches and the complete wrap is 12.412144 × 9.25 inches. Book Two’s narrative is complete; its interior has not been paginated for a final print edition, so this is not a final interior page count. No spine lettering is used at this width. A 2 × 1.2-inch blank barcode area is reserved on the back. Text is vector-based and the front remains uncropped within safe margins.

Run `python scripts/build-paperback-cover.py --book book-two` to recreate the current wrap. Once the final interior is paginated, update `interiorPageCount` in its configuration and set `pageCountIsProvisional` to `false`. For a one-off final-count export, use `--pages ACTUAL_EVEN_COUNT --final`; update the configuration too so subsequent builds keep that count. The current standard-color configuration requires at least 72 pages.

The approved source is 1024 × 1536 pixels, about 186 DPI at its 5.5 × 8.25-inch placement. The print copy is resampled to 1650 × 2475 pixels for 300-DPI placement; resampling preserves the approved composition but does not recover detail. Inspect KDP Print Previewer and order a physical proof before publication. The generated print copy is excluded from Git and rebuilt from the approved original.

Book Two secret-identity constraints are recorded in [the continuity notes](docs/editorial/book-two-continuity.md). As of Chapter 15, Daniel and Luke do not know Jenny is Pink Blur; Daniel expects Billy to summon the Defenders for a missing reporter.

The [Book Two continuity and dialogue audit](docs/editorial/book-two-continuity-dialogue-audit-2026-10-13.json) covers Chapters 1–17 against the published Book One manuscript, with recorded corrections and unresolved story constraints.


Chapter 20, **One Good Punch**, continues the published Chapter 19 ending with Jenny’s controlled plasma escape, injured Fist’s surprise attack, the exterior aerial fight, Seth opening the remaining restraints, Billy stopping Daniel at the service threshold, Luke carrying his unconscious uncle away, and Jenny’s cheek kiss on the street. Six separate illustrations include a two-panel kiss/clatter scene. The basement, restraint, knowledge and injury review is recorded in `docs/editorial/book-two-chapter-20-review.md`; generation prompts and art provenance are in `docs/art/book-two-chapter-20-prompts.json`. Book One remains locked.

PR #5’s focused correction pass moves the captive exchange into Chapter 19, fixes concealed-door staging and Jenny’s direct understanding of Flaming Head, and makes small clarity edits without changing the ending. Jenny’s green-eye corrections and Chapter 3’s high training wall are documented in [the art correction manifest](docs/art/book-two-pr5-review-fixes.json). Previous assets are preserved. The final-sweep report distinguishes the original local success from the actual failed GitHub navigation test and the subsequent synchronization correction; current PR validation records the final head’s CI outcome.

## Automated Book Two PDF

The PDF follows `book.json` order and includes only available chapters, retaining their original numbers when unavailable entries leave gaps. The site builder applies the same ordering validation; neither requires the filtered chapters to be numbered consecutively.

`npm run build` now also produces the full illustrated review PDF at `output/publishing/defenders-of-the-land-book-two-illustrated.pdf`. GitHub Actions includes it and `book-two-pdf-build.json` in the existing **kdp-publishing-files** artifact on each PR/main build. The report records the actual rendered page count, chapter starts, 57 interior illustrations, validated passages and SHA-256. The PDF includes its front cover, title and contents pages; this count is distinct from an approved paperback interior count. Its 6 × 9 review layout and the existing cover-wrap assumptions remain provisional. The full PDF is private and adds no public download or purchase link. Book One’s PDF exporter is unchanged.

## Book Three paperback build

Flaming Head’s author-approved identity is the isolated `public/assets/character-flaming-head-v1.png` portrait. Use it as the primary reference for new art, including concerned or frightened expressions. See `docs/art/flaming-head-approved-identity.json`; later scene illustrations do not replace this reference.

`npm run build` (or `npm run build:pdfs`) paginates every available Book Three chapter, validates its text and illustrations, and then builds the cover against that exact interior PDF. Adding a chapter to the book metadata automatically changes pagination and spine width; there is no page-count setting to maintain.

Edit `print/book-three-cover.json` for the back-cover hook, blurb, illustration, paper and spine title. The front uses the **Lava Lips** rooftop cover; the earlier #3 tank cover remains preserved as an original. The tank scene moves to planned Book Four, **Clash in Cleveland**, with Laura and Flaming Head removed from that cover. Current printing settings are 6 × 9 inches, standard color on white paper, a non-bleed interior and 0.125-inch cover bleed. Spine width is the measured interior page count × 0.002252 inches. The paperback interior excludes the cover and receives one blank end page when needed for an even count. Spine lettering appears only when its width permits safe text.

Every build retains these files in `output/publishing/` and the private **kdp-publishing-files** GitHub Actions artifact:

- `book-three-kdp-interior.pdf` and `book-three-pdf-build.json`
- `book-three-kdp-cover.pdf` (full back, spine and front wrap)
- `book-three-front-cover.pdf` and `book-three-back-cover.pdf`
- `book-three-kdp-cover-preview.png` and `book-three-print-specifications.json`
- The full EPUB and its JPEG ebook cover

The specifications record the interior filename, checksum, measured pages, spine and wrap dimensions, and reserved barcode area. Builds check those against the interior and exercise cover growth at 72, 80, 160 and 320 pages. Full publishing PDFs remain separate from public samples. `npm run build:site` rebuilds only the website; it does not repaginate publishing files.

The fourteen-chapter Book Three manuscript is complete. Print dimensions track each current build; review the generated files and KDP proof before publication. The 1024 × 1536 front source is preserved and resampled to 300-DPI placement without adding original detail.
