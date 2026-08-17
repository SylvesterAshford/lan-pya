# Changelog

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
