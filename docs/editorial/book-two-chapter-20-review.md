# Chapter 20 review — One Good Punch

Base: `b1151b4` (main, including published Chapter 19, The Empty Steps). New chapter: approximately 1,900 words in existing JSON block format, ordered after Chapter 19. No missing-chapter fallback is needed. Book One, earlier chapters, covers and print configuration are unchanged.

## Continuation and movement

- Chapter 19 leaves Billy on the flat landing outside the partly open service entrance, Daniel holding the door, Flaming Head outside beside the high window jamb, both humans still secured and injured Fist locked in one cage. Seth has only bowed one closed cuff. Chapter 20 starts with Luke watching that hand, then hearing the doorway conversation and drifting to listen. No archived escape or re-gassing is assumed.
- Shelving at the inner doorway screens Jenny's feet and upper cage target from Luke while he faces outward. Daniel faces Billy beyond the front room. Jenny checks a clear path to the upper cage corner. Nobody sees her use plasma except her allies.
- The high window was opened to admit Luke/Fist in Chapter 17 and not subsequently closed. Its pane is explicitly clear before Fist exits. Window → sunken yard → railing → roofs is distinct from the human route through workshop door → front room → service landing → yard steps → street.
- Flaming Head leaves his exterior jamb position to intercept Luke above the roofs. He never enters the laboratory. Luke must descend below the railing to see his uncle at the open threshold; he does not see through the roof. The chase ends with Luke carrying Daniel away by lab-coat fabric, not flesh.

## Restraint ledger

| Character/object | Initial state | Release | State on departure |
| --- | --- | --- | --- |
| Jenny ankles | Two original closed steel cuffs | Small foot-generated plasma balls heat outer fastenings in short taps, with cooling pauses | Both open, left behind |
| Jenny wrists | Both secured to chair | Seth braces steel clear of skin and bends each open | Both free |
| Seth right wrist | Slightly bowed, still closed | Sustained thumb/hand pressure completes bend | Free |
| Seth left wrist | Closed | Freed right hand peels cuff away | Free |
| Seth ankles | Both closed | One mounting torn free; other cuff bent open | Both free |
| Fist cage | One locked cage, one injured glove | Jenny kicks plasma to upper corner, away from glove; bars soften/sag | One empty damaged cage remains |

## Knowledge, powers and consequences

Billy buys time with questions without receiving or understanding energy messages. He sees the escape through the aligned doorways before stopping Daniel. His single punch is ordinary and non-graphic; Daniel remains unconscious, Billy checks breathing and calls for an ambulance, and a shopkeeper makes the call. No claim is made that unconsciousness is harmless. Billy relays the laboratory address and injuries and asks for police assistance without claiming police powers.

Daniel already knows Seth is Zerdo; neither villain learns Jenny is Pink Blur. Fist follows visible aerial movements and has no intelligible conversation with Flaming Head. Perch remains away. Seth uses existing strength as gas/dizziness ease, rather than regaining a lost power. Jenny's plasma positioning always follows small foot movements/taps or an aimed kick; her skin and ordinary shoes require heat management.

Fist's punch succeeds through surprise; his leather/cuff remain damaged through every turn, loss of height, failed pursuit and supported street departure. Luke's rescue is not a declaration of loyalty or forgiveness. Daniel has no departing speech. His nephew's original body remains missing; no transfer occurs. The unfinished empty collector, loose wiring and laboratory evidence remain.

On the street, gratitude is mutual before Jenny kisses Seth's cheek. His blush and lid clatter are affectionate; Jenny steadies him and he replaces the lid. Billy carries injured Fist nearby as they walk toward a shop chair to await help; Flaming Head remains close outside.

## Six illustrations

All six generated images were visually inspected at full composition size; optimized WebP versions are integrated with image dimensions and descriptive alt text. PNG sources and generation/revision instructions are preserved in the chapter art manifest. These are review candidates for the author, not a claim of new author approval.

1. **A Small, Steady Light:** both humans restrained, tiny plasma against outer ankle fastening. Corrected an invented mechanical torch; no villain watches.
2. **An Opening for Fist:** Jenny's legs free and wrists cuffed, one controlled kick to upper cage corner, one injured glove low inside. Corrected a cuff left around her lower ankle. The dotted trajectory indicates the kick; it is not a new beam power.
3. **The Surprise Punch:** scuffed red glove/torn empty cuff hits Luke's iron jaw beside one damaged cage. The high window's pane is open.
4. **Two Against One:** corrected an erroneous indoor background to open Cleveland sky/roofs; Flaming Head ahead, Luke between, injured Fist lower behind. No speech or energy-link beam. A recessed stair area is visible below; the prose establishes the exact service-yard route.
5. **One Good Punch:** corrected interior staging to the sunken yard landing at the open threshold and Daniel's thinning hair. One ordinary blow; plaid cap/high collar, round glasses/lab coat, no gore or extra limbs.
6. **The Kiss and the Clatter:** two panels; corrected yard location to street sidewalk/shopfront and emphasized blush. Consistent clothes, cheek kiss, steadying arm and lid clatter; Billy supports battered Fist nearby in both panels.

The optional seventh image of Luke rescuing Daniel is suggested separately in the art manifest, not included in the required six. No required artwork is pending generation.

## Validation

- All content JSON parses; Book Two ordering is sequential through 20.
- Reader verification includes exact Chapter 20 prose, six decoded images, preceding/next chapter links, completion/resume preservation and 320/390/1200 px layouts.
- `git diff --check` passes. Comparison against main confirms Book One and Chapter 19 source unchanged.
- Build/test outcomes are recorded in the PR description after completion.

Completed checks: `BOOK_CHROMIUM=/usr/bin/chromium npm run build`, followed by the EPUB/site refresh for final alt text and artwork, and `BOOK_CHROMIUM=/usr/bin/chromium npm test` all passed. The complete test run verified 49 pages, 928 links/assets, both books' full EPUBs, public-sample restrictions, image loading, navigation, saved progress and desktop/mobile layouts. The Book Two EPUB contains 20 chapters and 51 interior illustrations. Final mobile reader screenshot was visually checked after the street-scene correction. Generated build outputs remain excluded from Git.
