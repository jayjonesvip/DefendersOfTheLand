# Defenders of the Land — public website

The website publishes Chapter 1 of each of the four books and Book One’s approved three-chapter PDF/EPUB samples. Each Chapter 1 ends with an Amazon continuation link, preferring Kindle and falling back to the series listing when a book’s edition link is not yet supplied.

Complete manuscripts, artwork originals, editorial/canon records and all EPUB/KDP production are maintained in the private [DefendersOfTheLandBook](https://github.com/jayjonesvip/DefendersOfTheLandBook) repository. This website build has no credentials for it and does not generate full books or KDP files.

## Build

Run `npm ci`, `npm run build` and `npm test`. Browser checks require Chromium: `npx playwright install chromium`, or set `BOOK_CHROMIUM` to a system Chromium executable. Run `npm run preview` for a local server. Pushes to main deploy the tested `dist` directory to GitHub Pages.

## Update approved previews and links

Run the private repository’s `scripts/export-public-preview.cjs` after its publishing build. Review its `output/public-preview/` export, then replace this repository’s content, public assets, image manifest and public-preview-inventory.json from that export. The export permits only four first chapters, two Book One samples, covers, character portraits, geographic descriptions, fonts/vendor files and the previously approved 1990 archive.

Update Amazon URLs in the private source and re-export so the inventory stays accurate. Current links are in `content/site.json` and the four book metadata files. The public build and tests reject extra source files, unapproved assets, later chapters, stale samples and private publishing directories. Generated output is rebuilt from an empty directory so old chapters cannot survive a rebuild.

Moving files out of the current tree does not erase previous public Git history or copies already downloaded. Repository-history exposure needs a separate visibility or history decision.

## Website-exclusive comic

`flaming-head-origin.cjs` renders **Flaming Head: The One Who Fell**, the author-approved website-exclusive six-panel origin comic. It is linked from the homepage and Flaming Head’s character card, with a text transcript and an optional keyboard-accessible enlarged view. The books and KDP sources are unchanged.

`website-originals.json` separately inventories the approved public comic WebP. Its lossless encoding preserves the approved proof pixels. When importing a private preview export, preserve these website-only asset files and their inventory; they are not part of the book-preview export. The public source checks validate both inventories and still reject later chapters, full books and private production material.
