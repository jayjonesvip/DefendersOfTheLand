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

`flaming-head-origin.cjs` renders **Flaming Head: The One Who Fell**, the author-approved website-exclusive two-page origin comic. It is linked from the homepage and Flaming Head’s character card, with a text transcript and an optional keyboard-accessible enlarged view. The books and KDP sources are unchanged.

`website-originals.json` separately inventories the approved public comic WebP. Its lossless encoding preserves the approved proof pixels. When importing a private preview export, preserve these website-only asset files and their inventory; they are not part of the book-preview export. The public source checks validate both inventories and still reject later chapters, full books and private production material.

The comic page has its own 1200 × 630 JPEG sharing image, also listed in `website-originals.json`. Open Graph and Twitter use this wide preview; the comic itself keeps its full portrait artwork.

`why-so-evil.cjs` renders **WHY SO EVIL?**, a three-page schooldays prequel for Billy Warrner and Daniel Orkleson, linked from both character cards. All three approved pages use lossless WebP and the same accessible image viewer, with a complete eighteen-panel transcript. Its artwork is separately inventoried as website-only material.

WHY SO EVIL? also has its own 1200 × 630 JPEG sharing image, featuring the young characters and Daniel’s invention. Its Open Graph and Twitter tags use this wide image.

The latest comic editions use five and six panels for Flaming Head and six panels on each WHY SO EVIL? page. Their transcripts follow the art panel by panel, including the wave washing over Seth and Billy’s final warning. The scorched clue stays palm-sized and pocketed during the rescue.

## Additional vault photographs

The 1990 Vault also includes four author-supplied archive photographs added on October 27, 2026: character sketches, The Flaming Head origin issue, an unfinished Inspector Billy strip, and The New Farts cover. The supplied JPEG originals, cleaned lossless WebP artwork and responsive WebP previews are listed in `website-originals.json`; preserve these website-only archive assets and the expanded gallery when importing a private preview export. The gallery displays cleaned versions matched to the existing warm-paper archive, with corrected perspective and reduced shadows. These historical concepts are distinct from current book canon.

The October 28 batch adds ten distinct restored sheets from thirteen photographs, bringing the gallery to 23 pieces. Covers and origins, character studies, and action pages have separate browsing sections. The original nine-page reading order is preserved. Bouncin’ Bob’s confrontation with Doc Dork uses Jay’s identification; the two Flaming Head origins remain distinct historical concepts. Source photographs, including duplicate shots, and all cleaned/preview WebPs are inventoried as website-only archive assets. Preserve the expanded gallery and archive assets when importing preview exports.
