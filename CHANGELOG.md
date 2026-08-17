# Changelog

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
