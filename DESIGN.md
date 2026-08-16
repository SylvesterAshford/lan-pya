# Design System — Lan Pya

**Source of truth.** This file governs every visual and UI decision in the app. It reconciles three founder-supplied documents:

- `Lan Pya Web.dc.html` — the binding interaction and layout reference.
- `Design Specification v1.1` — screen inventory, component library, and the roadmap.sh canvas language (§3.3, §5).
- `Lan Pya — Brand & Presentation Design System v1.0` — brand tokens and semantic color rules (§2, §7).

Where this file and those documents disagree, this file wins and the disagreement is recorded in the Decisions Log.

## Product Context

- **What this is:** A bilingual career-navigation and evidence web app that turns one career goal into a clear next action, practical work, trusted proof, and relevant opportunities.
- **Who it is for:** Myanmar university students, recent graduates, and self-learners pursuing their first credible digital-career proof. Budget Android phones, mobile data, English or Burmese.
- **Project type:** Responsive web app with learner, reviewer, and administrator workspaces.
- **Memorable idea:** **From Map to Proof.** Every engineering student in Myanmar deserves a map. The map is the product; the roadmap canvas is the screen people remember.
- **Core metaphor:** The map — trails, trunks, forks, paths, direction. Never "courses" or "school."

## Aesthetic Direction

- **Direction:** Quiet Guidance with a roadmap.sh canvas.
- **Decoration level:** Minimal. Typography and the node graph do the work.
- **Mood:** Calm, capable, local, honest. A maintained map, not a course marketplace or a game dashboard.
- **Light-first.** Soft White application canvas. The dark reference screenshots inform composition and density; the shipped theme is light. Amber nodes on a light canvas is roadmap.sh's own default and the more faithful reference.
- **Voice:** Plain, factual, unhurried. Numbers with sources. No hype adjectives, no exclamation marks, no emoji anywhere in UI chrome.

### Safe choices

- Compact 60px top navigation on desktop, four-item bottom navigation on mobile.
- Left-aligned content, persistent labels, concise lists, one dominant action per screen.
- Teal for navigation, progress, links, and active learning states.
- Text labels for seeded, live, verified, pending, and preview states.

### Deliberate risks

- **Four primary destinations only:** Home, Roadmaps, Opportunities, Me. Missions open from roadmap milestones; portfolio, privacy, language, and account controls live under Me.
- **A real node graph, not a card grid.** Connected SVG nodes with a dotted spine carry the core experience. No percentage bar substitutes for it.
- **Two palettes that never touch.** Canvas amber is a node fill on the graph. Chrome amber is a small urgency pill. Mixing them destroys both meanings.

## Information Architecture

### Primary navigation

1. **Home:** resume work, current progress, next milestones, nearby deadlines.
2. **Roadmaps:** active path first, browse all paths on demand, then the connected roadmap canvas.
3. **Opportunities:** deadline-led feed with compact provenance and readiness detail.
4. **Me:** career profile, personalization, portfolio proof, language, privacy, account controls.

### Contextual flows

- A roadmap milestone opens its mission brief.
- Mission brief, deliverables, proof requirements, submission, status, feedback, and revision form one linear workflow.
- Verified missions become portfolio records automatically; sharing and revocation live under Me.
- Reviewer and administrator links appear as compact role-specific utilities, not learner destinations.

## Typography

- **English display, body, UI:** Plus Jakarta Sans, 400/500/600/700/800.
- **Burmese display, body, UI:** Padauk, 400/700.
- **Data and figures:** Plus Jakarta Sans with `font-variant-numeric: tabular-nums`.
- **Code and URLs:** `ui-monospace` system stack.
- **Loading:** `next/font` with Latin and Myanmar subsets, self-hosted, `display: swap`.

### The scale — eight steps, nothing else

Every size in the app resolves to one of these tokens. A hardcoded `font-size` that is not one of these eight is a defect.

| Token | Desktop | Mobile | Line height | Weight | Use |
|---|---|---|---|---|---|
| `--t-display` | 28px | 24px | 1.2 | 800 | Page hero, roadmap title |
| `--t-h1` | 22px | 20px | 1.25 | 700 | Screen title |
| `--t-h2` | 18px | 17px | 1.35 | 700 | Section title |
| `--t-title` | 16px | 16px | 1.4 | 600 | Card and list title |
| `--t-body` | 15px | 15px | 1.6 | 400 | Body copy |
| `--t-meta` | 13px | 13px | 1.5 | 400 | Supporting text, maintainer line |
| `--t-label` | 11px | 11px | 1.4 | 600 | Uppercase label, chip, eyebrow. Tracking 0.04em |
| `--t-node` | 13px | 13px | 1.35 | 600 | Roadmap node label |

Body is 15px, not 14px, per Design Spec §5. The reference `.dc.html` uses 14px throughout, but it is a desktop mockup; this product is read on budget Android phones, frequently outdoors. Burmese carries more fine detail per character than Latin and suffers more at small sizes.

Letter spacing: `-0.4px` on display, `-0.2px` on h1, `0` elsewhere except labels.

**Stage node labels** use 14px/700 — one step above `--t-node` — because they sit on the spine and lead the reading order.

### Bilingual rules

- Burmese body runs 16px/1.7 and Burmese meta 14px, one step larger than English for optical balance. This is the only permitted deviation from the scale.
- English and Burmese preserve equivalent hierarchy and perceived size. Burmese never uses a different structural scale.
- Burmese must be Unicode, never Zawgyi.
- Never expose duplicate English and Burmese labels in one hierarchy.
- Never letterspace Burmese. Never all-caps a Burmese string.

### Prohibitions

- No font size below 11px anywhere in the product.
- No size outside the eight tokens.
- Marketing pages may use larger display sizes; marketing typography must never leak into the authenticated app.

## Color

Two palettes. They serve different surfaces and must not appear in the same component.

### Chrome palette — app shell, cards, chips, actions

| Token | Hex | Use |
|---|---|---|
| `--canvas` | `#F8FAFC` | Application background |
| `--surface` | `#FFFFFF` | Cards, panels, top navigation |
| `--surface-sunk` | `#F3F6F5` | Toolbars, inset rows, progress tracks |
| `--teal-900` | `#04342C` | Headline text on tinted panels |
| `--teal-700` | `#0F6E56` | Primary action, links, active nav, current position |
| `--teal-500` | `#1D9E75` | Progress fills, verified states |
| `--teal-100` | `#E1F5EE` | Tinted panels, active nav background, chips |
| `--teal-050` | `#F3FAF7` | Card fills, Myanmar-note background |
| `--ink` | `#1E2B28` | Body headlines |
| `--muted` | `#5F6E6A` | Body text, secondary labels |
| `--hairline` | `#D8E4E0` | Card and divider borders |
| `--amber-500` | `#EF9F27` | Urgency only |
| `--amber-800` | `#854F0B` | Text on amber tints |
| `--amber-100` | `#FAEEDA` | Amber chip and panel fills |
| `--purple-500` | `#7A6FDE` | Global track only |
| `--purple-900` | `#26215C` | Text on purple tints |
| `--purple-100` | `#EEEDFE` | Purple chip and panel fills |
| `--error` | `#B42318` | Destructive, failed |
| `--error-soft` | `#FDF2F2` | Error surfaces |

### Canvas palette — roadmap graph only

| Token | Hex | Use |
|---|---|---|
| `--node-stage` | `#FEE075` | Stage node fill, on the spine |
| `--node-milestone` | `#FFF3C4` | Milestone node fill, branching |
| `--node-border` | `#2B2A22` | Node border ink |
| `--node-done-fill` | `#E1F5EE` | Verified node fill |
| `--node-done-border` | `#1D9E75` | Verified node border |
| `--node-soon-fill` | `#FDFBF3` | Coming-soon node fill |
| `--node-soon-border` | `#C9C3AE` | Coming-soon dashed border |
| `--connector` | `#B6C4C0` | Dotted connector paths |

### Color rules — non-negotiable

1. **Teal means us, direction, progress.** Primary actions, the local track, active learning, completion.
2. **Amber means attention and honesty.** Deadlines closing within 7 days, `Growing` status, heavy-data warnings. Amber never means good.
3. **Purple means the global track.** Reserved. It appears only where the fork's global branch appears.
4. **One accent per surface.** A screen is teal-led or amber-led, never both competing. The only exception is the fork, which requires teal and purple side by side.
5. **Canvas amber and chrome amber never appear in the same component.** Node fills live only on the graph.
6. **Category chips** use muted single-hue tints with same-family dark text, never saturated fills.
7. **Color never carries meaning alone.** Every status has a text label and, where useful, an icon or shape difference.
8. Never place `--muted` on `--teal-100`; use `--teal-700` or `--teal-900`. Never place white text on `--amber-500`; use `--amber-800`.
9. No gradients, glow, glass, or tinted shadows anywhere in the authenticated workspace.

## Spacing

- **Base unit:** 4px.
- **Density:** Compact-comfortable.
- **Scale:** `2xs` 2, `xs` 4, `sm` 8, `md` 16, `lg` 24, `xl` 32, `2xl` 48, `3xl` 64.
- **Page gutters:** 24px desktop and tablet, 16px mobile.
- **Section rhythm:** 24–32px.
- **Card and list padding:** 16–24px desktop, 14–16px mobile.

## Layout

- **Approach:** Grid-disciplined application workspace.
- **Desktop shell:** Sticky 60px top navigation, centered 1100px maximum shell.
- **Primary screen content column: 820px maximum.** Home, Opportunities, Paths, and Portfolio are short-content screens. A 1100px column holding three list rows reads as abandoned; an 820px column reads as composed and gives a better line length. Only the roadmap canvas and reviewer/admin tables may exceed it.
- **Pages end honestly.** Never pad a short screen with filler cards to fill the viewport.
- **Mobile shell:** Compact top brand row plus fixed four-item bottom navigation; content reserves safe-area space.
- **Dashboard:** Two columns only when secondary content stays scannable; stack at 760px.
- **Roadmap canvas:** 780px SVG canvas centered on desktop. **Mobile renders a narrower single-column geometry, not a scaled or scrolling copy of the desktop canvas.** Design Spec §3.3: "No pinch-zoom or free panning is ever required on mobile." Scaling the desktop viewBox down would render 13px node labels at roughly 6px, so the mobile canvas drops the left/right branches and shows stage nodes on the spine only; branch skills move into the detail panel. Vertical scroll only. The page body never scrolls horizontally at any width.
- **Opportunities:** Single concise feed ordered by deadline. Filters scroll horizontally on mobile.

### Radius

| Element | Radius |
|---|---|
| Roadmap node | **6px** |
| Controls, buttons, inputs | 8px |
| Cards, panels | 12px |
| Chips, pills, filter chips | full |

The 6px node radius against 12px cards is deliberate and load-bearing. It is what makes the canvas read as a graph rather than a stack of cards.

### Elevation

**Borders first. No shadows on the canvas or on cards.** A single small offset shadow is permitted only for overlays, bottom sheets, and the mobile bottom navigation.

## The Roadmap Canvas

The core screen. Specified in `Design Specification v1.1` §3.3 and implemented as SVG.

### Structure

- A **dotted vertical spine** runs down the centre of the canvas.
- **Stage nodes** sit on the spine in order: 272×54, saturated `--node-stage`, 2px `--node-border`, 6px radius. Label 14px/700, with a 10px/700 `STAGE n` line above it.
- **Milestone nodes** branch off each stage, at most one level left and one level right: 200×36, `--node-milestone`, 1.5px border, `--t-node` label.
- **Connectors** are curved dotted cubic-bezier paths, 1.5px, `--connector`, `stroke-dasharray: 2 5`. The spine uses `2 6` at 2px.
- Reading order is top-to-bottom, left-before-right within a stage. **DOM order must match** for screen readers.

### Node states

| State | Fill | Border | Extra |
|---|---|---|---|
| Not started | `--node-milestone` | `--node-border` 1.5px | — |
| Stage | `--node-stage` | `--node-border` 2px | Bold label, on spine |
| In progress | `--node-stage` | `--node-border` 2px | `--amber-500` ring, 2px, offset 4px, 55% opacity |
| Done | `--node-done-fill` | `--node-done-border` | Green check bubble, top-right corner |
| Coming soon | `--node-soon-fill` | `--node-soon-border` dashed `5 4` | Label at 55% opacity, non-interactive, tooltip "New resources every Friday" |

State must survive grayscale. Fill, border weight, dash pattern, and the check bubble each carry it independently.

### The fork

After the fork-gate stage the spine splits into two dotted paths ending in two track nodes: **Yangon track** (`--teal-100` fill, `--teal-700` border, local jobs, Burmese-first) and **Global track** (`--purple-100` fill, `--purple-500` border, remote and abroad, English-first). The label between them reads "The path splits here — both stay open."

The chosen track renders downstream nodes at full colour; the unchosen track renders at reduced opacity but stays fully interactive. Undecided learners see both at full colour plus a link to the Career Compass.

**Current status: display-only.** The fork renders from static path configuration. It does not persist a track choice and must be labelled honestly as a preview until the schema lands.

### Canvas chrome

- Header: roadmap title, `Growing`/`Complete` badge, maintainer line with credential, last-updated date.
- Legend row under the header: Stage / Milestone / Done / Path. Dismissible, shown on first visit.
- Progress indicator: percentage, tabular numerals, `--teal-700`.
- Tapping any node opens the milestone detail. No hover state is load-bearing.
- Every node is a focusable button with an accessible label. Focus ring: `--teal-700`, 3px.

### Detail panel

`--surface` background, `--hairline` border, 3px `--teal-700` left edge, `--teal-050` fill on the proof-target block. **It is a light surface.** The shipped app used dark navy `#0f172a` here, an undocumented third surface inside a light application; that is removed. There is no dark inspector surface in this system.

## Deadlines

The countdown is the product's daily-return mechanic (Design Spec §2), not decoration. Every opportunity carries one, and the feed sorts soonest first.

| Remaining | Label | Chip |
|---|---|---|
| 8 days or more | Absolute date | Neutral |
| 7 days or fewer | "Closes in N days" | `--amber-100` / `--amber-800` |
| 2 days or fewer | "Closes tomorrow" | `--amber-100` / `--amber-800` |
| Today | "Closes today" | `--amber-100` / `--amber-800` |
| Past | "Closed" | Muted, archived treatment |

This is the one place amber escalation is required rather than permitted. Countdowns appear on both the Opportunities feed and the Home deadline rail, in English and Burmese.

## Components

- **Primary action:** `--teal-700` background, white text, 8px radius. One per viewport.
- **Secondary action:** `--surface` background, `--ink` text, `--hairline` border.
- **Cards:** Only where grouping needs a boundary. Prefer rows, sections, and whitespace over grids of equal cards. Never begin a primary screen with an equal three-column card grid.
- **Chips:** `--t-label`, tinted background with same-family dark text. Variants: category, status, cost, data weight, language, deadline.
- **Progress:** Thin `--surface-sunk` track with a `--teal-500` fill. Green only after verified completion.
- **Myanmar note:** 3px `--teal-700` left border, `--teal-050` background, uppercase label, map-pin icon. This callout is the differentiator and must never look like ordinary body text.
- **Forms:** 44–48px controls, persistent labels, inline recovery text, visible keyboard focus.
- **Icons:** Lucide outlined, 16/18/20/24px, consistent stroke weight. Never mix icon families. No emoji.
- **Imagery:** None on core screens. The app's speed is the brand.

## Motion

- **Approach:** Minimal-functional.
- **Easing:** enter `ease-out`, exit `ease-in`, movement `ease-in-out`.
- **Duration:** micro 80ms, short 160ms, medium 240ms.
- **Use:** navigation state, roadmap node selection, the fill transition when a node turns green, drawers, submission status, confirmation.
- **Avoid:** ambient animation, bouncing rewards, repeated entrance effects, motion that competes with the learner's work.
- Respect `prefers-reduced-motion`.

## Accessibility

- Target WCAG 2.2 AA across learner, reviewer, and proof-sharing flows.
- Landmarks, logical headings, persistent labels, visible focus, 44px touch targets where practical — node boxes included.
- Test English and Burmese at 320px and 360px, 200% zoom, and long-content wrapping.
- Canvas DOM order matches visual reading order.
- Keep primary workflows keyboard-operable and screen-reader labelled.
- Every status carries a text label; color is never the only cue.

## Decisions Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-08-11 | Deep Navy + Teal + Warm Yellow | Founder-approved brand palette, as recorded in PRODUCT.md. |
| 2026-08-13 | One language per screen | Prevents duplicate labels and reduces hierarchy noise. |
| 2026-08-13 | Connected roadmap canvas | Makes the Map-to-Proof promise structural. |
| 2026-08-13 | Quiet Guidance redesign | Replaces the dense sidebar and card-heavy learner UI. |
| 2026-08-13 | Four primary learner destinations | Makes missions and proof contextual rather than competing tabs. |
| 2026-08-16 | **Eight-step type scale replaces ad-hoc sizing** | `globals.css` had 31 distinct hardcoded sizes from 8px to 30px, `9px` used 42 times. No scale meant nothing aligned. This was the root cause of the app reading as unresolved. |
| 2026-08-16 | **Palette corrected to the brand system doc** | Teal `#0F766E` → `#0F6E56`, amber `#F59E0B` → `#EF9F27`. Adds `--purple-500 #7A6FDE` for the global track. **Conflict: PRODUCT.md "Brand Commitments" still lists the old values and needs updating.** |
| 2026-08-16 | **roadmap.sh canvas language adopted in full** | Design Spec §3.3 specified amber node fills, dotted connectors, and a central spine from the start; the shipped app implemented white outlined boxes with straight connectors. This closed the gap. |
| 2026-08-16 | **Canvas palette separated from chrome palette** | Brand doc §2.2 rule 6. Amber as a node fill and amber as an urgency pill are different meanings; sharing a component destroys both. |
| 2026-08-16 | **6px node radius against 12px card radius** | Design Spec §5. What makes the canvas read as a graph rather than stacked cards. |
| 2026-08-16 | **Shadows removed from cards and canvas** | Brand doc §5.3 and Design Spec §5 both specify hairline borders and no shadows. Shipped app used three shadow tokens. |
| 2026-08-16 | Light canvas retained over the dark reference | The dark `.dc.html` reference and screenshots informed composition and density. Amber nodes on light is roadmap.sh's own default and the more faithful reference. |
| 2026-08-16 | Fork ships display-only for the 20 August pitch | The track-branch concept has no schema. Static configuration delivers the demo without an untested migration. Must be labelled as preview. |
| 2026-08-16 | Body 15px, not 14px | Design Spec §5 is mobile-first; the reference `.dc.html` 14px was a desktop decision. Burmese suffers more than Latin at small sizes. |
| 2026-08-16 | Primary content column 820px | Home/Opportunities/Paths/Portfolio all ended at ~45% of a 900px viewport in a 1100px column. Narrower column reads as composed rather than abandoned. |
| 2026-08-16 | Detail panel converted to a light surface | The shipped panel was dark navy `#0f172a`, an undocumented third surface in a light app. No dark inspector surface exists in this system. |
| 2026-08-16 | Deadline countdown promoted to a system rule | Design Spec §2 names it the daily-return mechanic. It was unbuilt; opportunities showed flat dates at 9px. The one place amber escalation is required. |
| 2026-08-16 | Landing four-column card grid removed | Most recognizable AI-generated layout, and it repeated what the hero mockup already shows as a connected progress line. |
