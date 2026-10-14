# Book Two continuity revision: October 14, 2026

Base: `2458228` on `main`. This review is limited to Book Two and its editorial descriptions. Book One is locked canon. Its manuscript is unchanged, including the upstairs construction of the robot. Chapter titles, ending fields and final blocks are preserved for all eighteen Book Two chapters. No Chapter 19 manuscript or publication entry is created.

## Chapters changed

| Chapter | Focused change |
| --- | --- |
| 7 — The Rent Is Due | Establish the post-attack police search of the empty original upstairs laboratory without giving Billy knowledge of the basement. |
| 9 — Cash Only | Establish Daniel’s dry concealed basement, Luke’s disused-drain/masonry sewer route, Eleanor’s service-yard entrance and the rent/access motive. |
| 11 — The Greater Source | Locate Luke’s watch at the basement service door. |
| 12 — Unless… | The heroes know the building, not a confirmed new workshop; Billy recalls that police found the old one empty. |
| 14 — The Only One | Keep Luke’s broken-jaw memory in the original upstairs lab, distinct from the present basement cot. His body’s fate and transfer feasibility remain unknown. |
| 15 — A Few Questions | Invitation specifies the basement/service-yard route; Jenny and Billy recognize the building and knowingly pursue Daniel. The one-hour check-in stays intact. |
| 16 — The Demonstration | Show Jenny taking the service-yard steps and Daniel opening the shelf-concealed workshop. The service door locks; the glass booth protects Daniel and Luke. |
| 17 — The Open Door | Connect the basement window, yard, roofs, service threshold and inner doorway. Show Jenny reacting to the second gas dose, both humans passing out, ventilation before Luke enters, and Jenny waking before Seth. Show deliberate effort interrupted by fear/gas without a freed cuff. |
| 18 — Not Yet | Keep both humans recovering and fully cuffed, with Jenny explicitly acknowledging both gas exposures. Ground the room in the high yard-facing window and shut service door, and Seth’s memory in the top-of-steps rendezvous. Seed the sincere limo offer, Eleanor’s explicit request for the campaign-office stop and Billy’s restrained accusations/urgency. Preserve the final turn onto the laboratory’s street. |

Chapters 8, 10 and 13 were reviewed and did not need manuscript changes. Chapters 1–6 and the book’s publication list are unchanged.

## Sequence and geography review

| Beat | Route/state | Timing and sightline check |
| --- | --- | --- |
| Daniel returns after Book One | Sewer → disused drain → masonry opening → dry hidden basement. | Police found the upstairs lab empty. This is a later return, not a relocated Book One scene. |
| Eleanor and Jenny visit | Street/alley → steps → sunken yard → ordinary service door. | Neither uses the sewer. Jenny knows whose building she is entering. |
| Luke scouts | Rear high window → yard → roof. | Daniel closes the window after Luke leaves; the ordinary door is then opened as bait. |
| Fist is ambushed | Chimney/roof edge → railing → sign supports. | He looks down toward the yard without claiming to see through the basement wall. The sign blocks Seth’s view of the fight. |
| Seth enters | Street → alley → yard steps → service threshold → front room → open workshop doorway. | He sees Jenny only after descending, with the shelf moved and inner door open. Their partial view past the bench is reciprocal. |
| Gas captures both humans | Service door closed, high window closed, gas in work area. | Jenny coughs and sags; Seth loses focus and consciousness. Neither frees a cuff. Daniel is protected by glass. |
| Luke brings injured Fist inside | Waits outside high window, then enters after Daniel ventilates and opens it. | No airborne arrival through a sealed window and no ordinary gas used to incapacitate Fist. |
| Humans awaken | Jenny wakes as Seth’s ankle restraints are checked; Seth wakes later. | Civilian clothes and Jenny’s original four cuffs remain intact; the existing conversation still occurs. |
| Billy approaches | Police report → departure → reluctant limo ride → campaign-office delay → exit two streets short → walk. | He expects Seth/Fist outside, asks to move on twice and remains unaware of the captures. Fight, gas, ventilation and waking occur while he is delayed; no fixed durations are invented. |

## Character knowledge and power review

- Daniel knows Seth is Super Zerdo; nobody newly learns Jenny is Pink Blur. Jenny is never visibly fast during captivity and is not immune to gas.
- Only Seth, Jenny, Perch and Flaming Head share intelligible energy-linked communication. Billy and Fist still need interpretation. No such new message is introduced here.
- Luke’s reluctance remains in Chapter 14, with his hope for a body motivating the later fight; his original body’s fate and any transfer’s feasibility remain unestablished.
- Eleanor’s knowledge in the limo is limited to Billy’s investigation of Daniel; Billy says only that he has an appointment. Claude sincerely offers a ride and apologizes for the delay. Neither is told about Jenny’s kidnapping or the others’ captures.
- Rent payments are evidence of payments, not proof of knowing robot funding, the newspaper call or police interference. Billy avoids accusing Eleanor of those deeper acts in front of Claude.
- Seth can bend ordinary steel through deliberate effort and sustained focus. Gas, dizziness and concern for Jenny interrupt it; strength is neither lost nor newly unlocked. No wrist or ankle cuff opens through Chapter 18.
- Perch remains away. Injured Fist remains in one locked cage with damaged red leather and a torn white cuff. The collector stays unfinished/empty and Flaming Head absent/uncaptured.
- Chapter 13’s promise not to go to the laboratory alone is unchanged and remains a constraint on any deferred rescue.

## Deferred Chapter 19 and artwork

The archived draft is marked as needing basement-layout, limo-timing and restraint-state adaptation. An expanded limousine exchange may appear only in a clearly marked “minutes earlier” scene when Chapter 19 is actually written. No continuation is written or published in this revision.

Fifteen current lab illustrations require replacement for the basement geography; the approved cover also needs geometry review. Their original pixels and literal alt text are preserved. The rooftop fight, invitation-office image and Billy’s walking approach remain compatible. See [the image-by-image art review](book-two-basement-art-review.md).

## Validation

- `npm run build` passed on the basement revision, using the repository’s pinned Python requirements in an isolated environment. It built the 47-page web site, validated 24 publishing PDFs, and exported/validated both full EPUBs and the Book One sample. After the focused Chapter 18 pass, `npm run build:epub` and `npm run build:site` also passed; the final Book Two export contains 18 chapters, 829 manuscript passages and 41 interior illustrations. Book One PDF sources were unchanged by that final pass.
- `npm test` passed: 886 local links/assets, unique SEO metadata, checksums and publishing/download separation, the Vault and navigation interactions, both web readers, per-book progress and 320/390/1200px layouts, and EPUB images/contents/large-text layouts.
- JSON validation parsed 80 files under `content/`, `print/` and `docs/`. All eighteen Book Two chapters retain their number, title, availability, ending field, exact final block and original illustration/alt-text order.
- A comparison with base `2458228` found no changes to `content/books/origins/`, `print/`, the Chapter 2 strength rule, Chapter 13’s promise, `content/books/book-two/book.json` or public artwork. No `chapter-19.json` exists in the published manuscript directory.
- `git diff --check` passed. Manual sequence review above checked geography, overlapping timing, gas exposure, knowledge limits and deliberate strength use. Artwork mismatches remain explicitly flagged for replacement, rather than being presented as solved by metadata.
