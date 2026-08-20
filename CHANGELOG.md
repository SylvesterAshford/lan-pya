# Changelog

## [0.25.0.2] - 2026-08-20

### Added

- A Lovable handoff pack with the product requirements, design specification, and staged build prompts for recreating Lan Pya without losing its product logic.

### Fixed

- Phones now open sign-in with the form and a compact Lan Pya identity instead of stacking the full promise panel above the task. Tablets put the form first and retain the supporting panel afterward; desktop keeps its two-panel composition.
- The privacy lock now stays aligned with the first line of its explanatory copy on narrow sign-in screens.
- “Continue mission” on Home now opens the mission map at the learner’s current position instead of bypassing it for the mission runner.

## [0.25.0.0] - 2026-08-20

### Changed

- iPads show the real roadmap. Held upright, an iPad was being given the phone drawing: a narrow strip down the middle of the screen with most of the glass empty and none of the topic boxes on it. It now draws the full branching map from tablet width up.
- The climb reads properly on a phone. Each stop's card was sized as a share of a tablet-width drawing, which on a phone left it about a third of the screen wide, so titles broke across four lines and the cards sat on top of the trail. They are wider and shorter now, and clear of the path.
- The roadmap no longer leaves a band of blank above and below itself on a tablet.

### Fixed

- Layout switched at seventeen different screen widths, several of them the same intent picked twice. Eight remain, five of which are named in DESIGN.md with what each one is for.

## [0.24.0.0] - 2026-08-19

### Changed

- The résumé draft opens in a window of its own. Pressing Build used to add a screen and a half to the page, which on a phone buried everything under it.
- The passport keeps its own size now and never stretches to match the builder beside it. On a phone it also stops following you down the page, which was covering the work underneath it.
- The passport is drawn on ground: contour lines across it and a ridge along its foot, so the empty space at its top and bottom is gone.

### Fixed

- "Research" on the evidence trail was breaking across two lines mid-word.

## [0.23.2.0] - 2026-08-19

### Changed

- The sign-in panel is drawn on ground now: contour lines, the way a map draws elevation, with a light where the summit sits. It had a dead band between the last promise and the scenery.
- The passport on Portfolio no longer stretches to match the résumé builder once a draft is built. It keeps its own size and follows you down the page instead, and its contents sit centred with more room around them.
- The step brief on the roadmap is wider and about half as tall. The topics it lists sit in two columns rather than one long stack, so the card no longer has to scroll to reach its own button.

### Fixed

- Two rules were being drawn across the foot of the landing page where one belongs.

## [0.23.1.0] - 2026-08-19

### Changed

- The two halves of the sign-in screen are equal. One side had been given roughly 60% of the width, which made the split look accidental rather than chosen.
- The sign-in screen fits on one screen. Reaching the button that signs you in required scrolling, which is a poor thing to ask of the page whose only job is that button. Nothing was removed to achieve it: the same fields, the same demo account details, the same words, with the spacing between them tightened.

### Removed

- The links band in the footer. The language choice it held moves down to the last line, so a Burmese reader on an English page still has a way across.

## [0.23.0.0] - 2026-08-19

### Changed

- The mountains on the landing page are redrawn. They were flat rows of identical peaks that stopped dead at the edge of the picture, with the trail floating above them. There are four ranges now, each paler than the one in front, the snow follows the shape of the summit down both ridges, the ridge facing the sunrise catches the light, and the trail starts on the valley floor and climbs.
- The sign-in page is rebuilt as one screen: the climb and what stays private on the left, the form on the right. Signing in with Google now comes first, before the email fields.

### Added

- A footer, carrying the two verified program partners with the date their information was last checked.

### Removed

- The second "Let's start" button at the foot of the landing page. The top of the page already asks.
- The roadmap diagram from the sign-in page. It asked somebody at a sign-in screen to read a chart.

## [0.22.0.0] - 2026-08-19

### Changed

- The landing page is rebuilt. It opens on a summit at first light, with the trail you would actually climb drawing itself towards the top, and the headline finishes itself: "Start building" becomes proof, then a portfolio, then an interview, then a job.
- Three cards sit on the trail where the work happens, so the first thing a stranger sees is the whole promise in order: finish a mission, have it checked by a person, be able to show it to somebody hiring.
- The page closes on the climb said plainly, four stops on light ground, with a rule under each one to say they are a sequence and not a feature list.
- "Start my path" is now "Let's start".

### Removed

- The fake browser window showing a mission, and the roadmap diagram beneath it. Both showed the product's furniture to somebody who had not yet been given a reason to care about it.

## [0.21.3.0] - 2026-08-19

### Fixed

- The mission map fills its card again. When the map grew to show every stage, the frame around it was still described as the old fixed shape, so the scene shrank to a narrow strip down the middle with empty margins either side. Every track now sizes its frame from its own length, so a 5-stage and a 14-stage map are equally wide.

### Added

- The passport carries the ridge line from the mission map across its middle, so the record of the climb and the climb itself share one piece of visual language.

## [0.21.2.0] - 2026-08-19

### Fixed

- Selected work in the résumé builder now looks selected. The tick box was drawn with a colour that does not exist in the palette, so it never filled in, and the chosen row was tinted two steps off white. Selection now carries a teal ground, a teal edge, and a filled tick.
- The row under the résumé picks lines up. "Select all" and "Clear" were arriving with the browser's own grey button chrome and sitting below the line everything else sat on.
- The passport has room inside it, so its contents no longer sit against the edges of the card.

## [0.21.1.0] - 2026-08-19

### Changed

- The climb shows the whole track. It used to open at stage 2 and quietly leave stage 1 off the bottom, because it drew a window of five stops around you rather than the path. The map now grows with the track instead, so it agrees with the roadmap about how long the journey is.
- Your passport and the résumé builder beside it now end on the same line.
- The partner mark on an opportunity sits on the centre line of the listing rather than hanging off the title.

### Removed

- The bare "12 stages" line above the roadmap. The map's own header already reports progress as verified-of-total, which is the same number said usefully.
- The "Updated every Friday" chip from the sidebar and the top bar.

## [0.21.0.0] - 2026-08-19

### Changed

- The roadmap says where you are. The stage you are on is the only fully saturated thing on the map, carries a "You are here" marker and a lit row, and everything ahead fades back. Before this, the stage you were on was drawn the same as the nine you had not reached.
- The track no longer looks machine-made. Stages carry between one and three topics a side depending on how heavy the subject is, boxes are as wide as their titles need, and rows are as tall as their contents. It was twelve identical mirrored rows.
- Stages are grouped into named parts of the journey, so the map says whether you are in the foundations or on the way to hiring, not only which numbered step you are on. The part you are in is lit; the rest sit back.
- The trail behind you is drawn solid and the road ahead dotted, so how far you have come is something the map states rather than something you count.
- Each column of topics is now headed by what it is for, using labels the tracks already carried.
- "Continue current mission" opens the climb at your position. It used to open one of two fixed mission pages, whichever track or stage you were on.
- Portfolio is laid out as the Evidence Studio concept draws it: your passport sits beside the résumé builder instead of a screen above it, the page opens with the two things you can do with your record, and completed work runs three across.

### Fixed

- Every label on the roadmap now meets the contrast floor. Nine did not, some as low as 2.2 to 1 against a required 4.5.

## [0.20.0.0] - 2026-08-19

### Added

- A roadmap stop now opens a step brief. Clicking a stage on the map brings up its detail over the map rather than beside it, and closes on Escape, on the scrim, or from the close control.

### Changed

- The roadmap tab no longer carries the level strip, and the blank band above the map is gone. The roadmap says what the path is and where you are on it; the level belongs on Today and on Me, where the points are the subject.
- The Evidence Studio counts only work that has been reviewed and still stands. Unreviewed work never reaches the passport figures, the skills list or the resume builder, and a mission with no written summary says so rather than having one written for it.
- The completed mission list closes with a rule before the level strip, so the last badge and the strip no longer run together.

## [0.19.1.0] - 2026-08-19

### Fixed

- The profile no longer lights up the Portfolio tab in the sidebar. Portfolio marks the portfolio; the profile, careers and privacy pages are reached from the account row and leave the navigation unmarked.

## [0.19.0.0] - 2026-08-18

### Added

- Opportunities opens with the verified program partners, naming the programme and the date the partner information was last checked.
- Every listing now shows which organisation is behind it and when it was last verified, without opening the row.

### Changed

- The mission map is a portrait panel again, with smaller stops and labels so the landscape reads rather than the badges.

## [0.18.1.0] - 2026-08-18

### Changed

- The mission map is a proper mountain now: a dark summit lit from behind, ridges receding into haze, a treeline, drifting snow and a foreground of rocks and shoots. It runs the full length of the concept rather than being compressed into one screen.

## [0.18.0.0] - 2026-08-18

### Changed

- The traveller on the mission map is now the real illustration rather than a drawing of it.
- The whole climb fits on screen without scrolling, and the stops are spread so no two labels overlap.
- The level indicator above the map is a compact pill with space beneath it, instead of a full-width bar pressed against the map's own header.

## [0.17.0.0] - 2026-08-18

### Changed

- Missions is a climb. Your path winds up a mountain, with the stage you are on lit and carrying the traveller, finished stages filled and ticked, and the ones above locked until you reach them. Each stop names itself on a card beside it.
- The traveller now faces you instead of walking away.

## [0.16.0.0] - 2026-08-17

### Changed

- Navy is now the colour that leads: navigation, buttons, links and selection. Teal keeps every meaning it had as the secondary accent, on progress, verified work and completed roadmap stages.

### Fixed

- The app is light again. The previous release turned every surface dark, which was not what was asked for.

## [0.15.0.0] - 2026-08-17

### Changed

- Lan Pya is dark. Navy is the primary surface and teal is now the accent that rides on it, with panels rendered as lit glass. Every screen was checked for surfaces that stayed light.

## [0.14.0.0] - 2026-08-17

### Changed

- Progress is measured in steps, not XP. The score is now a ring of trail dots that fills toward your next level, with the level name and your step count inside it. The ladder and its evidence gates are unchanged.
- Profile leads with your character, your level, the path you are on and when you started it, and three counts you can check: missions, steps and proofs.

## [0.13.1.0] - 2026-08-17

### Changed

- The mission trail now fills the screen instead of sitting in a narrow strip, with larger stops and full stage names on a desktop.
- Trail stops are clickable. The stage you are on opens its mission, a finished stage opens its proof, and a locked stage stays inert.

### Fixed

- The in-progress mission row wrapped its arrow onto a second line.

## [0.13.0.0] - 2026-08-17

### Added

- Missions opens on a trail. Your path winds through soft terrain with a traveller standing on the stage you are on, finished stages carrying their earned emblem, and the ones ahead locked until you reach them. It reads the same progress the roadmap does, so the two can never disagree.

## [0.12.1.0] - 2026-08-17

### Changed

- The sign-in page shows an example roadmap instead of three claims about the product. Anyone arriving for the first time can see what Lan Pya does before they have an account: stages connect, work gets verified, and you are somewhere on a line that continues.

## [0.12.0.0] - 2026-08-17

### Changed

- Opportunities is a board instead of a carousel. Search by name or organisation, switch between For you and All, filter by category, and open any listing in place to read what your evidence supports and what is still missing. Listings are grouped by what matters first: closing this week, then what your proof already covers, then what you could build toward.

## [0.11.0.0] - 2026-08-17

### Changed

- Navigation is a sidebar again on desktop, with the five destinations, staff links, and your account in one column that can collapse to icons. Phones keep the bottom tab bar, which stays reachable with a thumb, and gain a slim bar carrying the Lan Pya mark.

## [0.10.0.1] - 2026-08-17

### Fixed

- A "New this week" entry ran to a full paragraph when its next sentence began with a quotation mark, instead of showing one line.

## [0.10.0.0] - 2026-08-17

### Added

- Home now shows what changed. "New this week" lists the most recent release in plain language, including anything still known to be broken, so the "Updated every Friday" promise in the header finally has somewhere to point.

## [0.9.1.0] - 2026-08-17

### Fixed

- Sharing proof did not work. Every proof the demo account holds was rejected as an invalid identifier, so the Share proof button failed silently for all of it. The check was stricter than the database it was guarding.
- An employer opening a valid proof link could be told the link was "expired, revoked, or invalid" when the real problem was on our side. Lan Pya now says it is temporarily unavailable, states plainly that nothing is wrong with the link, and offers to try again. A service fault must never read as a learner withdrawing their evidence.

### Known issue

- Public proof viewing is currently unavailable and returns a retryable error. The server's Supabase secret key is being rejected as invalid and has to be replaced by hand. Creating and revoking share links works; only opening a shared link is affected.

## [0.9.0.0] - 2026-08-17

### Added

- Your path now has a level. Home shows where you are on a five-step ladder — Explorer, Starter, Maker, Practitioner, Trailblazer — with the exact requirements for the next one listed underneath, met and unmet. Levels are per career path and never transfer between them.
- Reaching a new level is acknowledged once, with what you actually satisfied to get there. No confetti: levels describe progress inside Lan Pya and say so, because they do not claim you are employable.
- Completed roadmap stages now carry an earned emblem, and missions show the emblem of the stage they belong to. Five marks with five different shapes, so they are still readable at a glance, in greyscale, and on a small screen.
- Roadmaps and Missions carry a one-line version of the level meter.

### Fixed

- Verified work that was seeded rather than reviewed in the app never received its XP, so the demo account showed no progress despite holding verified proof. Those submissions have been credited with the XP they had already earned.
- The level shown is no longer the one the database calculated. That formula counted XP alone with no ceiling, which would have called a learner "Level 51" for accumulating points without finishing anything. Every level now requires evidence as well as XP.
- An empty progress bar was invisible against the card behind it, which is exactly when a learner most needs to see that a meter exists.

## [0.8.1.0] - 2026-08-17

### Changed

- Opportunity cards are larger and now carry artwork for their category, so a challenge, an internship and a scholarship are recognisable before you read the label. Each card also shows its deadline.

## [0.8.0.0] - 2026-08-17

### Changed

- Opportunities is now a focus carousel. Move through listings with arrows, keyboard, drag, or trackpad; the one you land on stands forward and its full detail — deadline, what your evidence supports, what is missing — reads above the rail.

## [0.7.0.0] - 2026-08-17

### Added

- Missions is now its own destination in the main navigation, showing the mission you are on tagged with its roadmap stage, and every mission you have already had verified.
- Ask the AI Tutor from Home. It opens as a popup with a compass mascot, answers questions about the roadmap you are following, and is clearly marked as a preview.

### Changed

- Roadmaps is the map again. Missions and the tutor moved out of tabs, because burying the work one level down was the problem in the first place.
- The mobile bar carries five destinations without wrapping.

## [0.6.0.0] - 2026-08-17

### Added

- Work through a mission in five clear steps — Brief, Build, Submit, Review, Proof — instead of one long page, with your position visible throughout.
- Tick off each deliverable as you finish it. Progress saves privately on your device and shows the rubric weight your reviewer will use.

### Changed

- Review and Proof are reached by submitting work, not by clicking. You cannot navigate your way into a verified state.
- Profile now says once that the Career Compass has not been answered, instead of repeating "Not sure yet" for every question, and reads as one page rather than five stacked cards.

## [0.5.0.0] - 2026-08-17

### Added

- Open any career path on three tabs: the Map, its Missions, and a Tutor that answers questions about that roadmap. Tab counts state how many stages and missions exist before you click.
- Ask about a roadmap in English or Burmese. The tutor is a clearly labelled preview that answers from prepared notes, never marks work complete, and never creates proof.

### Changed

- Missions moved out of Roadmaps into their own tab, so the work is where you would look for it.
- The content column now grows with the window instead of staying a fixed width, so a wide monitor is used rather than leaving the page stranded in the middle.

## [0.4.0.0] - 2026-08-17

### Added

- Browse careers by arena, with counts and honest availability, instead of a wall of identical cards. Preview paths stay collapsed until you ask for them.

### Changed

- Rebuilt typography on larger, tighter proportions: bigger body and supporting text, tighter heading leading, negative tracking on headings, and a lighter display weight that reads confident rather than loud. Colours are unchanged.
- Buttons now use the body text size on a 44px control, up from small labels on a target below the touch minimum.
- Long titles in compact lists wrap to two lines instead of being cut off mid-word.

### Fixed

- The header sat up to 116px left of the content it labelled on wide screens, because it never moved when the content column narrowed.
- Full-Stack Developer and AI & Data Analyst were labelled "Preview" despite having complete 14 and 13 stage roadmaps. They now read "No missions yet", which is the accurate claim.
- Career rows advertised a first mission even where none had been authored.
- The alternatives heading promised two options while showing one in a half-empty row.

## [0.3.0.0] - 2026-08-17

### Added

- Follow a roadmap.sh-style track canvas with a dotted spine, amber stage nodes, branching milestones, verified check marks, and a preview of the Yangon and Global track fork.
- See how long is left to apply with deadline countdowns that escalate to amber inside a week, in English and Burmese, on both Opportunities and Home.
- Follow the complete five-stage Content Creator journey. The database previously held only the first stage while the app promised five.

### Changed

- Rebuilt typography on an eight-step scale. The stylesheet had carried 31 hardcoded sizes between 8px and 30px, 123 of them below a legible minimum, which is why nothing on the page aligned.
- Corrected the palette to the founder brand system, added the purple global track, and separated the roadmap canvas palette from application chrome so amber means one thing in each place.
- Narrowed primary screens to an 820px reading column so a short page reads as composed rather than unfinished.
- Replaced the roadmap's dark inspector panel with a light surface, removing an undocumented third surface colour from a light application.
- Removed decorative elevation from cards, buttons, and nodes in favour of hairline borders, keeping only the mobile drawer and bottom navigation shadows.

### Fixed

- The prepared demo account opened on zero milestones, zero percent, and zero XP because progress was seeded on a path the learner was not active on.
- Home, the roadmap, and the portfolio disagreed about how much work was complete.
- Home named a stage-one mission while the learner was on stage three, and numbered upcoming stages by their position in a list rather than on the roadmap.
- Opportunity deadlines were computed in the server's timezone rather than Myanmar's, and date-only values were read as UTC, so a countdown could be a day out.
- The opportunities feed claimed to be sorted by deadline without sorting.
- Several small, low-contrast labels failed WCAG AA, including deadline dates at 9px and category chips at 8px.
- Removed a 1.5MB decorative image from the landing page, replacing it with an inline roadmap that shows the actual product.

## [0.2.0.0] - 2026-08-13

### Added

- Build a private career profile through a bilingual Career Compass and receive explained path recommendations based on interests, work style, time, and device access.
- Choose one active career path, change direction without losing prior work, and continue a focused next mission from the Home and Roadmaps screens.
- Follow complete connected roadmaps for Frontend, Full-Stack, AI/Data, and the Content Creator controlled pilot.
- Use a dedicated Me area for career preferences, previous paths, portfolio proof, language, privacy, and account controls.

### Changed

- Replaced the dense sidebar and card-heavy learner workspace with a compact four-destination navigation, calm type scale, concise lists, and a phone-friendly bottom bar.
- Simplified Home, Roadmaps, Opportunities, missions, proof, and profile around one clear next action while preserving reviewer and administrator utilities.
- Switched the authenticated application to one language at a time, with consistent English and Myanmar hierarchy and localized roadmap and opportunity content.
- Clarified seeded demo records, live account data, preview paths, controlled pilots, verification states, and opportunity provenance.

### Fixed

- Prevented Content Creator from appearing twice in the career catalog while preserving its controlled-pilot availability and complete roadmap.
- Restored roadmap navigation and mission links across active path states.

## [0.1.0.0] - 2026-08-13

### Added

- Explore digital career arenas and distinguish operational paths, controlled pilots, and previews.
- Resume work from a Build hub with clear quest, mission, and portfolio actions.
- Start the Content Creator controlled-pilot mission with private local drafts and trusted-link submissions.
- Award XP and levels only after a reviewer verifies a Content Creator mission.

### Changed

- Reframed Proof as Portfolio and simplified primary navigation to Home, Paths, Build, Opportunities, and Portfolio.
- Added mission-specific reviewer rubrics and revision support after requested changes.
- Kept Frontend, Full-Stack, and AI/Data roadmaps operational through the existing compatibility layer.
