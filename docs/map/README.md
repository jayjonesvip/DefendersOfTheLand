# Cleveland story map

`content/map/locations.json` contains the four landmark coordinates, descriptions, chapter links, and story connections. Edit this file to update map copy. Story connections unlock using the reader’s existing chapter completion state. `content/map/downtown.geojson` is the bundled street and waterfront geometry; `story-map.js` renders it with vendored D3 7.9.0. No live map service or API key is required.

Geometry source: [OpenStreetMap API](https://api.openstreetmap.org/api/0.6/map?bbox=-81.702,41.495,-81.685,41.512), retrieved October 10, 2026. Converted OSM ways into GeoJSON LineStrings, retaining primary, secondary, tertiary, residential, unclassified, trunk and motorway roads; natural water ways and available Lake Erie multipolygon member ways. Coordinates rounded to six decimals. Library, square, and terminal markers are the mean coordinates of their OSM building/park ways. The lakefront marker represents the general waterfront, not a fictional site’s address.

The map uses present-day geography as a locator, not a reconstruction of Cleveland in 1987. On-page attribution links to [OpenStreetMap contributors and ODbL terms](https://www.openstreetmap.org/copyright). D3 is distributed under its ISC license in `public/vendor/D3-LICENSE.txt`, copied alongside the browser asset during the build.

Build with `npm run build:site`. The map is `dist/map.html`, linked from the shared navigation. No manuscript, PDF, EPUB, or download policy changes are needed for map edits.
