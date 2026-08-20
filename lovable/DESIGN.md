# Lan Pya Design Specification for Lovable

Status: implementation brief
Source of truth: the repository's root `DESIGN.md`, with the product owner's v0.25 responsive notes added as an explicit target
Core idea: **From Map to Proof**

## 1. Design intent

Lan Pya should feel like a maintained map: calm, capable, local, and honest. It is not a course marketplace, game dashboard, neon AI product, or corporate recruiting portal.

The memorable screen is a connected roadmap that visibly leads from direction to work and proof. Typography and graph structure do most of the visual work. Decoration stays quiet.

### Desired qualities

- Light-first, spacious without feeling empty
- Dense enough to be useful on a phone
- Plain and reassuring rather than celebratory
- Bilingual without making Burmese look secondary
- Evidence-led, with provenance and trust states always visible

### Never use

- Gradients, glow, glassmorphism, or tinted shadows
- Equal three-card grids as the first content on a primary screen
- Stock photography in the authenticated app
- Emoji in UI chrome
- Confetti, bouncing rewards, ambient animation, or fake gamification
- Opaque scores or unsupported “verified” claims
- Tiny roadmap text created by scaling down a desktop graph

## 2. Brand and voice

- Product: **Lan Pya**
- Promise: **From Map to Proof**
- English voice: direct, factual, encouraging, unhurried
- Burmese voice: natural Unicode Burmese with equivalent hierarchy
- Name verified, seeded, live, pending, incomplete, and preview states directly
- No hype adjectives, invented statistics, exclamation marks, or employer-outcome claims

Use the supplied logo and mascot assets. Do not redraw partner marks or recolor them onto a shared background.

## 3. Typography

### Fonts

- English display/body/UI: Plus Jakarta Sans, weights 400, 500, 600, 700, 800
- Burmese display/body/UI: Padauk, weights 400 and 700
- Figures: Plus Jakarta Sans with tabular numerals
- Code and URLs: system monospace
- Load with self-hosted web fonts and `font-display: swap`

### Type scale

| Token | Size | Line height | Weight | Use |
|---|---:|---:|---:|---|
| `display` | 32px | 1.05 | 700 | Page hero and roadmap title |
| `h1` | 24px | 1.15 | 700 | Screen title |
| `h2` | 20px | 1.30 | 700 | Section title |
| `title` | 17px | 1.35 | 600 | Card/list title |
| `body` | 16px | 1.60 | 400 | Body; buttons use 600 |
| `meta` | 14px | 1.50 | 400 | Supporting text |
| `label` | 12px | 1.40 | 600 | Eyebrow, chip, uppercase label |
| `node` | 13px | 1.35 | 600 | Roadmap node label |

English headings use slightly negative tracking; labels use `0.08em`. Burmese uses zero tracking everywhere, 17px body, and 15px meta for optical balance. Never use Zawgyi, all-caps Burmese, or letter-spaced Burmese.

## 4. Color system

### Application chrome

| Token | Hex | Use |
|---|---|---|
| Canvas | `#F8FAFC` | App background |
| Surface | `#FFFFFF` | Panels, cards, navigation |
| Surface sunk | `#F3F6F5` | Toolbars and progress tracks |
| Teal 900 | `#04342C` | Dark text on teal tints |
| Teal 700 | `#0F6E56` | Primary action, links, active navigation |
| Teal 500 | `#1D9E75` | Progress and verified states |
| Teal 100 | `#E1F5EE` | Active/tinted panels |
| Teal 050 | `#F3FAF7` | Soft local note and selected path fill |
| Ink | `#1E2B28` | Main text |
| Muted | `#5F6E6A` | Secondary text |
| Hairline | `#D8E4E0` | Dividers and borders |
| Amber 500 | `#EF9F27` | Urgency only |
| Amber 800 | `#854F0B` | Text on amber tints |
| Amber 100 | `#FAEEDA` | Urgency surface |
| Purple 500 | `#7A6FDE` | Global track only |
| Purple 900 | `#26215C` | Text on purple tint |
| Purple 100 | `#EEEDFE` | Global track tint |
| Error | `#B42318` | Failure and destructive action |
| Error soft | `#FDF2F2` | Error surface |

### Roadmap canvas

| Token | Hex | Use |
|---|---|---|
| Stage node | `#FEE075` | Main stage on spine |
| Milestone node | `#FFF3C4` | Branch milestone |
| Node border | `#2B2A22` | Graph ink |
| Done fill | `#E1F5EE` | Verified node |
| Done border | `#1D9E75` | Verified border |
| Soon fill | `#FDFBF3` | Coming soon |
| Soon border | `#C9C3AE` | Dashed future border |
| Connector | `#B6C4C0` | Dotted paths |

Rules:

- Teal means Lan Pya, direction, progress, and verified completion.
- Amber means urgency or attention. It never means success.
- Purple is reserved for the global branch.
- Canvas amber never becomes a button or status color.
- One accent leads each surface.
- Color never carries status alone.

## 5. Spacing, radius, and elevation

- Base unit: 4px
- Scale: 2, 4, 8, 16, 24, 32, 48, 64px
- Page gutters: 24px desktop/tablet, 16px phone
- Section rhythm: 24–32px
- Panel padding: 16–24px desktop, 14–16px phone
- Roadmap node radius: 6px
- Inputs/buttons: 8px
- Cards/panels: 12px
- Chips: pill radius
- Cards use borders, not shadows
- Shadows are limited to overlays, sheets, and mobile navigation

## 6. Responsive shell

### Desktop

- Collapsible left sidebar
- Five learner destinations: Home, Roadmaps, Missions, Opportunities, Me
- Role utilities below the learner navigation
- Account and language controls at the bottom
- Main content uses `clamp(820px, 78vw, 1280px)` where the screen benefits from width

### Phone

- Slim top row with brand and account/update utility
- Fixed five-item bottom navigation with safe-area padding
- Content reserves room for bottom navigation and tutor launcher
- No hidden desktop navigation in the accessibility tree

### Tablet and roadmap exception

The owner-selected v0.25 approach uses two roadmap geometries, not a third tablet-only layout:

- Phone gets compact geometry that keeps mission-map cards readable.
- Tablet and desktop get the full branching roadmap.
- On tablet, slight horizontal scrolling is accepted to preserve fixed, legible labels.
- Do not shrink labels to eliminate that scroll unless the owner deliberately reverses the trade-off.

The owner reports that layout breakpoints moved from 17 ad hoc values to 8 documented values. The retained exceptions are 560px, 640px, and 1080px. The checked-out stylesheet predates that report, so inspect the live v0.25 CSS before encoding the exact eight values in a rebuild.

## 7. Roadmap canvas

### Structure

- Central dotted vertical spine
- Stage nodes on the spine: about 272×54, 2px dark border, 6px radius
- Milestones branch one level left or right: about 200×36, 1.5px border
- Curved dotted connectors
- Top-to-bottom reading order, left before right within each stage
- Every interactive node is a real focusable button

### States

| State | Treatment |
|---|---|
| Not started | pale amber milestone, solid border |
| Stage | saturated amber, heavier border |
| In progress | stage treatment plus amber ring |
| Done | teal-tinted fill, green border, check bubble |
| Coming soon | off-white fill, dashed border, reduced label opacity, disabled |

Status must survive grayscale through border, dash, weight, shape, and text.

### Fork

After the fork gate, split the path into:

- Yangon/local: teal tint, Burmese-first and local opportunity context
- Global: purple tint, English-first and remote/abroad context

Keep both branches visible and interactive. If selection is not persisted, label the fork Preview.

### Step detail

Opening a node launches one shared detail component:

- Desktop/tablet: centered modal, approximately 460px wide and at most 88vh
- Phone: full-width bottom sheet, at most 88vh

It includes status, title, description, estimate, placement, covered skills, proof target, and the correct state action.

Required behavior:

- `role="dialog"`, `aria-modal="true"`, and title association
- Focus enters on open and returns to the triggering node on close
- Escape, scrim, and visible close button close it
- Focus trap and background scroll lock
- Unmount while closed
- No duplicate live-region announcement
- Remove movement under reduced-motion preferences

## 8. Screen specifications

### Landing

- Lead with the career uncertainty problem and the Map-to-Proof promise
- One dominant CTA: Start my path
- Secondary CTA: Use the demo account
- Show one connected product preview, not a grid of generic feature claims
- Trust strip: private by default, no opaque score, free for learners

### Login

- Two-column composition on wide screens; stacked on phone
- Authentication form plus a real roadmap preview
- Email/password and Google
- Prepared demo-account affordance
- Persistent labels and specific recovery messages

### Home

- Put today's next action first
- Show current climb/mission, path level, opportunity signal, proof, and recent change
- Avoid a mosaic of equally important cards
- Use one primary action in the initial viewport

### Roadmap catalog

- Pinned “Your path” panel with progress
- Arena headings with counts and compact rows
- Preview paths behind a disclosure
- Do not use a uniform card gallery
- Distinguish Operational, Controlled pilot, No missions yet, and Preview

### Mission map and runner

- Mission destination opens on a mountain/trail metaphor tied to the same progress source as the roadmap
- Current stage carries the traveller
- Completed stops carry checks/emblems; locked stops remain inert
- The mission runner uses five visible steps: Brief, Build, Submit, Review, Proof
- Show one runner step at a time
- Deliverables, not points, are the in-mission progress mechanic

### Opportunities

- Search by title or organization
- For you / All switch
- Category filters may scroll horizontally on phone
- Group by closing soon, evidence-supported, and build-toward relevance
- Show organization and last verification without requiring expansion
- Detail reveals supported evidence, gaps, unknowns, source, and deadline

### Me and proof

- Profile leads with learner identity, path, start date, and evidence-backed counts
- Career Compass answers are editable
- Portfolio lists verified work and provenance
- Resume builder lets the learner select proof and generates editable, evidence-grounded bullets
- Sharing is optional, previewed, revocable, and clearly separate from private proof ownership

### Reviewer and admin

- Functional, compact, table/list-led layouts
- Trust state and audit context take priority over brand decoration
- Destructive and irreversible actions require explicit confirmation

## 9. Core components

- Primary button: teal 700, white text, 8px radius, 44px minimum height
- Secondary button: white, ink, hairline border
- Status pill: text plus semantic tint; never color alone
- Deadline chip: amber only at seven days or fewer
- Myanmar note: teal 050 fill, 3px teal left edge, label and map-pin icon
- Progress track: sunk background plus teal fill and inset border
- Forms: persistent labels, inline recovery, visible focus
- Icons: Lucide outline family only, consistent stroke
- Emblems: five distinct silhouettes with dark outlines; never a detached badge shelf

## 10. Motion

- Micro: 80ms
- Short: 160ms
- Medium: 240ms
- Enter with ease-out, exit with ease-in, movement with ease-in-out
- Use motion only for state changes, navigation, graph selection, drawers, and confirmation
- Respect `prefers-reduced-motion`

## 11. Accessibility checklist

- WCAG 2.2 AA target
- 44px touch targets where practical
- Visible 2–3px focus rings
- Logical heading order and landmarks
- Every icon-only control has a localized accessible name
- Every status has text
- Roadmap visual order matches DOM order
- English and Burmese tested for long wrapping
- 320px and 360px phone widths, tablet widths, desktop, and 200% zoom
- Dialog focus trap and focus return verified
- Tablet roadmap scroll remains contained to the map, not the whole page

## 12. Assets to upload to Lovable

From the repository's `public` directory, upload:

- Lan Pya logo and favicon
- Traveller/mascot assets
- Five stage emblem assets
- Partner logos, keeping each logo's original background treatment
- Opportunity category SVG art
- Landing, login, home, mission map, opportunities, and evidence-studio reference images

Tell Lovable which files are references and which are production assets. Reference screenshots guide composition; they are not meant to be rendered inside the shipped UI.

## Related handoff files

- [PRD.md](./PRD.md)
- [PROMPTS.md](./PROMPTS.md)
