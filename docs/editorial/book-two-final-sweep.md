# Book Two final sweep — Chapters 1–21

Base: `397856d` (main including merged Chapter 20). Book One is locked. This review reads the current Book Two prose in order, the continuity ledger, prior audit and Chapter 20 review; archived deferred prose is not used as current canon.

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

Validation completed:

- All 89 JSON files under content/docs/print parse; metadata lists exactly Chapters 1–21. `node --check verify-book-two.cjs` and `git diff --check` pass.
- Full `npm run build` passes with the pinned Python environment and Chromium: 24 PDF outputs validated, 50 site pages built, Book Two EPUB has 21 chapters, 1,140 manuscript passages and 57 interior illustrations, with zero missing resources. Book Two cover wrap is still explicitly PROVISIONAL at the unchanged 72-page assumption; no final interior/page-count claim is made.
- Full `npm test` passes: 950 links/assets, source-exact chapter prose, six final images decoded in order, Chapter 20→21 navigation, finish/resume and per-book progress preservation, 320/390/1200 px layouts, EPUB contents/images/large-text layouts, SEO, Vault and public-sample restrictions.
- EPUBCheck 5.4.0 passes both full EPUBs and the Book One sample with zero errors or warnings.
- Final mobile/desktop Chapter 21 reader screenshots visually inspected. All six illustrations individually reviewed; two revised before final integration. No artwork pending generation.
- 205 existing Book One/source, print and artwork files compared byte-for-byte against `397856d`; no changes. Final diff likewise contains no Book One or print source changes. Generated publishing outputs and QA screenshots stay outside Git.

