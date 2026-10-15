# Book Two final sweep — Chapters 1–21

Initial sweep (historical, as committed in `8f313c8`): base `397856d` (main including merged Chapter 20). Book One is locked. This review reads the current Book Two prose in order, the continuity ledger, prior audit and Chapter 20 review; archived deferred prose is not used as current canon.

## Findings and corrections

- Chapter 15: removed the dangling reply “It might.” after Jenny explains why she is investigating the basement. No event, invitation or check-in changes.
- Chapter 20: after tearing one ankle mounting free, Seth explicitly bends the detached cuff open and removes it from his boot before opening the other cuff and standing. All restraint states now reach the described free departure.
- Chapter 21: new final chapter, “Tomorrow,” approximately 1,900 words, six scenes with art. Narrative complete; publication remains unpublished. No Book One, cover or print specification changes.

## End-to-end review

| Concern | Evidence and ending |
| --- | --- |
| Knowledge and identities | Daniel knows Seth’s identity from Book One; Daniel/Luke never discover Jenny’s. Chapter 14’s indistinct pink newspaper image does not identify her. Chapter 20 screens her plasma from both villains. Chapter 21 reports Jenny’s captivity and Super Zerdo’s help without his civilian name or her hero identity. |
| Reporting | Chapters 7–10 distinguish invoices and suspicions from knowing robot funding or police orders. Chapters 15–16 establish the invitation, four bulbs, storage unit and unfinished source. Chapter 21 checks these, attributes Daniel’s claims, checks the landlord’s record and includes a requested campaign response. No fabricated full article appears in art. |
| First public nickname | No “Doc Dork” in Chapter 1–20 narrative or captions. First in Chapter 21 is Eleanor’s concession quotation; the illustrated newspaper repeating it follows the speech. Existing profile/art-guide labels are outside the story. |
| Time and election | Study takes weeks before graduation; later campaign events keep their relative sequence. Remaining campaign weeks separate the exposé from election night. Coverage, private call and later permitted basement visit follow defeat. No new calendar date, opponent or vote total. |
| Routes and doors | Daniel’s secret sewer return is separate from visitors’ service-yard route. Jenny and Seth enter via service door/front room/workshop. Chapter 17 reopens the high window for Luke, with no subsequent closing before Fist’s Chapter 20 exit into the yard and up. Billy remains outside during rescue; Daniel falls across the same service threshold. Chapter 21 revisits via the established ordinary route; landlord locks the service door afterward. |
| Gas and recovery | Jenny is exposed twice, Seth once; Chapters 17–18 acknowledge symptoms. Ventilation precedes Daniel’s approach, and strength/focus improve gradually through 19–20. Final chapter introduces no gas immunity, medical cure or immediate recovery for Fist. He remains scuffed and rests comfortably on support. |
| Restraints and powers | All original cuffs stay closed through Chapter 18; Chapter 19 only bows Seth’s right wrist cuff. Jenny’s short foot-generated plasma taps free ankles, then an aimed kick opens cage; Seth bends wrists and ankles using concentration. Detached ankle cuff removal is explicit. No transfer or completed collector. |
| Communication | Flaming Head’s messages reach Seth/Jenny/Perch, never Billy/Fist/Daniel/Luke. Final scene has Seth interpret. Flaming Head has no new spoken exchange with Billy/Fist and stays safely clear of window fabric and papers. |
| Police and evidence | Chapter 17 missing-person report and Chapter 20 medical/police requests stand. Chapter 21 states accounts were given, including Billy’s punch. Police document workshop and collect collector/papers/cage/restraints before permitting access; team touches no fixtures. No evidence disappears or is secretly retrieved. |
| Eleanor and Claude | Defeat ends Eleanor’s immediate mayoral prospect, not her wealth/influence. She cuts off Daniel privately. Heroes report established connections but do not invent proof she orchestrated all crimes. Claude remains uninvolved; his earlier ride offer remains sincere. |
| Family and belonging | Chapter 1’s father at steel mill, mother leaving when Seth was fourteen, birthday cards and Christmas calls remain unchanged. Ending echoes lamplight, desk and chair through occupied places, listening, tomorrow’s appointment and Seth choosing to linger. No family reunion or new history is invented. |

## Unresolved questions preserved

- Daniel and Luke’s new whereabouts, and whether Daniel’s proposed transfer could ever work.
- The disposition of Luke’s original body.
- The full extent of Eleanor’s knowledge, the earlier editor’s call and the police interference.
- Perch’s future return; he remains away, with no invented homecoming.
- Book Two subtitle, approval of cover v4, final print interior pagination/dimensions and publication. The existing 72-page wrap assumption remains provisional.

## Artwork and validation

Six separately generated compositions are integrated in narrative order: street newspaper, concession, next newspaper, private call, processed basement, office belonging. Full PNG originals and optimized reader WebPs are preserved; exact prompts/references and visual review are in `docs/art/book-two-chapter-21-prompts.json`. Generated artwork is for author review, not a claim of author approval.

Initial local validation at `8f313c8` (historical; this did not establish CI success):

- All 89 JSON files under content/docs/print parse; metadata lists exactly Chapters 1–21. `node --check verify-book-two.cjs` and `git diff --check` pass.
- Full `npm run build` passes with the pinned Python environment and Chromium: 24 PDF outputs validated, 50 site pages built, Book Two EPUB has 21 chapters, 1,140 manuscript passages and 57 interior illustrations, with zero missing resources. Book Two cover wrap is still explicitly PROVISIONAL at the unchanged 72-page assumption; no final interior/page-count claim is made.
- Full `npm test` passes: 950 links/assets, source-exact chapter prose, six final images decoded in order, Chapter 20→21 navigation, finish/resume and per-book progress preservation, 320/390/1200 px layouts, EPUB contents/images/large-text layouts, SEO, Vault and public-sample restrictions.
- EPUBCheck 5.4.0 passes both full EPUBs and the Book One sample with zero errors or warnings.
- Final mobile/desktop Chapter 21 reader screenshots visually inspected. All six illustrations individually reviewed; two revised before final integration. No artwork pending generation.
- 205 existing Book One/source, print and artwork files compared byte-for-byte against `397856d`; no changes. Final diff likewise contains no Book One or print source changes. Generated publishing outputs and QA screenshots stay outside Git.


## Independently reviewed correction pass — PR #5

The remote PR head was checked before editing and remained exactly `8f313c891736adcce982d1507fa4bc1552b4b3ad`. The initial local tests above passed, but the actual GitHub build run `38680756937` **failed** in `verify-vault.cjs` at the mobile Enter/ARIA assertion. This correction pass does not attribute that failure to manuscript prose.

Focused corrections:

- Chapters 1 and 19 clarify the appointment-book name and Billy’s head shake.
- Chapter 16 moves Luke’s first appearance/waiting place to the front-room cabinet before the shelf-concealed workshop opens.
- Chapter 19 receives the strengthened seven-paragraph captive exchange; Chapter 20 removes the repeated version and retains its doorway distraction, sightline and explicit cuff removal.
- Chapter 21 lets Jenny hear/reply to Flaming Head directly, with Seth interpreting for Billy/Fist only; removes the author-facing wall explanation and trims duplicate evidence exposition without changing the reporting, police cooperation, Eleanor’s influence or unresolved questions. The final sentence is untouched.
- Art review covers all 57 active Book Two chapter illustrations and current cover. Twenty chapter illustrations plus the cover have confirmed blue irises corrected in local masks; two additional Chapter 3 scenes receive local high-wall/plasma edits and green eyes. The cover changes only 111 iris pixels, preserving text, faces, anatomy and composition. Previous assets and originals remain. Lossless eye-only masters have **zero pixel differences outside the reviewed iris masks**; Seth’s eyes, Chapter 17’s wrist cuffs and Chapter 21’s grayscale masked newspaper portrait are preserved. The audit/provenance manifest records each changed asset and masks; no claim of recovered original resolution is made for WebP-only sources.

Navigation investigation:

- Thirty original-order trials under local Chromium 154 with CPU throttling did not randomly reproduce the failure. A controlled deferred-media-event check (now retained as `verify-navigation-race.cjs` and invoked by the CI accessibility suite) then reproduced the same observable sequence: menu visible after Enter, then `aria-expanded=false` when the queued breakpoint listener runs. The callback intentionally closes the menu on viewport changes; this establishes a test/event synchronization race consistent with the reviewed failure; no application-state defect was found.
- The keyboard test now establishes its mobile viewport **before navigating** into each tested page, so no resize callback from the old desktop document races with Enter. It additionally waits for the intended visible/ARIA state before asserting. Escape, focus restoration, outside click, resize behavior and no-JavaScript accessibility checks all remain; no sleeps or skipped assertions.
- Downloading the exact CI-pinned local browser was denied by the environment’s outbound policy (`cdn.playwright.dev`). Local checks use installed Chromium; the final GitHub job uses the unchanged Playwright browser-install step. Final-head CI result is reported in the PR validation summary after completion.

Current local validation is recorded below; the final GitHub head and run conclusion are recorded in the PR validation summary after the push. No new story questions were introduced; the unresolved story/publication questions listed above remain deliberately open.

Reader inspection also found the additional-book contents template still hardcoded “IN PROGRESS” despite complete manuscript metadata. Its label now renders the escaped metadata status (“MANUSCRIPT COMPLETE”), with an assertion in the existing Book Two reader check. This preserves the unpublished publication status and does not touch Book One’s contents template.

### Correction-pass local validation

- All 90 content/docs/print JSON files parse. JavaScript syntax and whitespace checks pass. Prose comparisons restrict changes to Chapters 1, 16 and 19–21; other chapter differences are asset references/alt text only. The final sentence, Chapter 20 cuff removal and first public nickname line are unchanged.
- Full production build passes: 24 PDF outputs validated; 50 reader pages; rebuilt cover WebP, ebook cover and provisional print wrap use v5-green. Final EPUB/site refresh includes the final dialogue wording. Book Two EPUB contains 21 chapters, 1,139 passages, 57 illustrations and zero missing resources.
- Full `npm test` passes under installed Chromium 154, including the deterministic breakpoint-race reproduction, retained keyboard/accessibility assertions, 950 links/assets, both readers, completion/resume, all six final-chapter image loads in order, 320/390/1200 px layouts and EPUB large-text layouts. EPUBCheck 5.4.0 passes both complete EPUBs and Book One’s sample with zero errors or warnings.
- Full-resolution mask details and full training/gas/office/cover compositions inspected. Reader-rendered captures of all 22 changed chapter images, the cover and mobile training/captivity/ending scenes inspected. All earlier assets stay preserved. Each eye-only lossless master differs only within its listed local mask.
- 210 existing Book One/art/print files compared by Git blob hash against `8f313c8` and are unchanged. The only print configuration edit selects the iris-corrected Book Two cover; trim/page-count assumptions are untouched. Publication remains unpublished, cover approval pending, and the existing wrap remains provisional.

## Automated illustrated PDF follow-up

The existing GitHub job successfully built Book Two’s EPUB and cover, but its full interior PDF exporter was hardcoded to Book One. A separate Book Two illustrated review exporter now runs in `npm run build` and writes `output/publishing/defenders-of-the-land-book-two-illustrated.pdf` plus `book-two-pdf-build.json`; both are included in GitHub’s private `kdp-publishing-files` artifact. Book One’s exporter, manuscript, template and print CSS are unchanged.

Local pagination produces **122 pages including the front cover, title and contents**, with all 21 chapters, 57 interior illustrations and 1,139 passages validated. Every page is checked for missing text/art, bounds and text/image collisions; contents links and PDF bookmarks point to measured chapter starts. Image streams are optimized without changing the source artwork. This is a provisional illustrated review layout, not a finalized paperback interior or a change to the existing provisional cover-wrap count. CI emits the measured count as a build notice so its actual output can be verified independently. The final PR validation summary records the follow-up head’s CI result.
