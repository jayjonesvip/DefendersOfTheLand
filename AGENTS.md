# Public website boundary

This repository may contain only Chapter 1 of each book, the approved Book One three-chapter PDF/EPUB samples, and public marketing/archive assets. Complete books, later chapter sources, original production artwork, editorial records, print layouts, EPUB/KDP exporters and publishing artifacts belong in the private jayjonesvip/DefendersOfTheLandBook repository.

Update previews by reviewing an explicit export from that private repository. The public-preview-inventory.json checksums identify the approved source files. Do not add client-side locks, hidden later chapters, private repository credentials, full-book artifacts or private-source checkout steps to the public build.

The next action after each preview goes to its Amazon edition, preferring Kindle. When an edition URL is not supplied, use the supplied Amazon series URL. Preserve the complete-reader local-storage key; preview progress uses its own key. Run npm run build and npm test before deployment.
