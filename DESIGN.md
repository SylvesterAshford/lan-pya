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

- **Five primary destinations:** Home, Roadmaps, Missions, Opportunities, Me. Missions were contextual under Roadmaps until 2026-08-17; learners could not find the work, so it earned a destination. Portfolio, privacy, language, and account controls still live under Me.
- **A real node graph, not a card grid.** Connected SVG nodes with a dotted spine carry the core experience. No percentage bar substitutes for it.
- **Two palettes that never touch.** Canvas amber is a node fill on the graph. Chrome amber is a small urgency pill. Mixing them destroys both meanings.

## Information Architecture

### Primary navigation

1. **Home:** resume work, current progress, next milestones, nearby deadlines,
   and the tutor. Its Continue mission action opens Missions at the learner's
   current position; the current stop then owns entry into the mission runner.
2. **Roadmaps:** active path first, browse all paths on demand, then the connected roadmap canvas.
3. **Missions:** the work. Active mission tagged with the stage it belongs to, and completed missions with their verification date.
4. **Opportunities:** deadline-led feed with compact provenance and readiness detail.
5. **Me:** career profile, personalization, portfolio proof, language, privacy, account controls.

### Path tabs

A path is not one page. Opening a path from the catalog lands on three tabs, matching the split roadmap.sh uses on every one of its path pages:

| Tab | Contains | Count badge |
|---|---|---|
| **Map** | The roadmap canvas | Stage count |
| **Missions** | The work: brief, build, submit, review, proof | Authored mission count |
| **Tutor** | Roadmap questions and answers | None |

Missions previously lived inside Roadmaps at `/app/build`, which is why learners could not find them. The count badges are load-bearing honesty: `Missions 1` states that the controlled pilot has one authored mission before the learner clicks, rather than after.

### Contextual flows

- A roadmap milestone opens its mission in the Missions tab.
- Mission brief, deliverables, proof requirements, submission, status, feedback, and revision form one linear workflow, presented as the mission runner below.
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

| Token | Size | Line height | Tracking | Weight | Use |
|---|---|---|---|---|---|
| `--t-display` | 32px | 1.05 | −0.8px | 700 | Page hero, roadmap title |
| `--t-h1` | 24px | 1.15 | −0.6px | 700 | Screen title |
| `--t-h2` | 20px | 1.30 | −0.4px | 700 | Section title |
| `--t-title` | 17px | 1.35 | −0.2px | 600 | Card and list title |
| `--t-body` | 16px | 1.60 | 0 | 400 | Body copy, **and button labels at 600** |
| `--t-meta` | 14px | 1.50 | 0 | 400 | Supporting text, maintainer line |
| `--t-label` | 12px | 1.40 | +0.08em | 600 | Uppercase label, chip, eyebrow |
| `--t-node` | 13px | 1.35 | 0 | 600 | Roadmap node label |

Proportions are taken from Zapier: tight display leading, negative tracking on headings, and a display weight of 700 rather than 800, which at 32px reads confident instead of loud. The ladder sits one step below Zapier's own numbers because that is a desktop marketing site and this is a dense app read on budget phones.

**Buttons take the body size at 600 weight.** Zapier's `button-md` is 18/600 against a body of 18/400: same size, heavier weight. This keeps the eight-token rule instead of inventing a ninth size for controls, and pairs with a 44px minimum control height.

**Node labels stay 13px** in every context. The roadmap SVG geometry is built around that number.

Body is 16px, per Design Spec §5 which asks for 15–16px. The reference `.dc.html` uses 14px throughout, but it is a desktop mockup; this product is read on budget Android phones, frequently outdoors. Burmese carries more fine detail per character than Latin and suffers more at small sizes.

Letter spacing is part of the scale, not an afterthought: negative on every heading step, positive on labels. **Burmese sets all heading tracking to 0** — negative tracking damages Myanmar letterforms.

**Stage node labels** use 14px/700 — one step above `--t-node` — because they sit on the spine and lead the reading order.

### Bilingual rules

- Burmese body runs 17px/1.7 and Burmese meta 15px, one step larger than English for optical balance. This is the only permitted deviation from the scale.
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

### Emblem palette — stage emblems and level insignia only

A third bounded palette, scoped exactly the way the canvas palette is. It exists because teal was the only expressive colour in the system and teal is also every button and link, which left the app no way to look like anything in particular.

| Token | Hex | Use |
|---|---|---|
| `--em-1` | `#1D7F6E` | Foundations emblem |
| `--em-2` | `#2F6EA8` | Build emblem |
| `--em-3` | `#8A5FBF` | Review emblem |
| `--em-4` | `#C2603F` | Capstone emblem |
| `--em-5` | `#B4922A` | Verified emblem |
| `--em-ink` | `#22201C` | Emblem outline |

These five hues never appear in chrome: not on a button, chip, border, background, or icon. They appear inside an emblem silhouette or a level insignia and nowhere else. Breaking that scope destroys the teal/amber/purple meanings the same way mixing canvas and chrome amber would.

`--em-5` on white is roughly 2.6:1, below the WCAG 2.2 floor of 3:1 for graphical objects. Every emblem therefore carries a 2.2px `--em-ink` outline, and **that outline is structural, not decoration** — it is what carries the contrast. Removing it breaks accessibility, not just the look.

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
- **Desktop shell:** Sticky 60px top navigation. **The header inner width uses the same token as the content column below it.** A header on a wider track than its content leaves the brand mark floating left of everything it labels; at 1440px the 1100px header put the logo 116px left of an 820px content column.
- **Header layout is flex, not a fixed track:** brand at natural width, navigation `flex: 1`, account actions pushed right with `margin-left: auto`. Link spacing then holds as the window narrows instead of the whole bar drifting. Below 860px the links hand off to the bottom navigation and the top row keeps only brand and account.
- **Primary screen content column: fluid, `clamp(820px, 78vw, 1280px)`.** A fixed 820px cap reads well at 1440px but strands the content in the middle of a wide monitor. It resolves to 820 at 1024px, 1123 at 1440px, and 1280 from 1920px up. The header shares the token, so brand and content stay aligned at every width. Originally specified as a flat 820px maximum: Home, Opportunities, Paths, and Portfolio are short-content screens. A 1100px column holding three list rows reads as abandoned; an 820px column reads as composed and gives a better line length. Only the roadmap canvas and reviewer/admin tables may exceed it.
- **Pages end honestly.** Never pad a short screen with filler cards to fill the viewport.
- **Mobile shell:** Compact top brand row plus fixed four-item bottom navigation; content reserves safe-area space.
- **Dashboard:** Two columns only when secondary content stays scannable; stack at 760px.
- **Roadmap canvas:** 780px SVG canvas centered on desktop. **Mobile renders a narrower single-column geometry, not a scaled or scrolling copy of the desktop canvas.** Design Spec §3.3: "No pinch-zoom or free panning is ever required on mobile." Scaling the desktop viewBox down would render 13px node labels at roughly 6px, so the mobile canvas drops the left/right branches and shows stage nodes on the spine only, inside their phase bands; branch topics move into the step brief. The phase bands stay because they cost one line of vertical space and carry the most meaning per pixel on a phone. Vertical scroll only. The page body never scrolls horizontally at any width.
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

- A **vertical spine** runs down the centre of the canvas. It is **solid `--node-done-border` at 3.5px up to the current stage and dotted `2 7` at 2px beyond it**: ground already covered is drawn differently from the road ahead, so distance travelled is stated rather than inferred by counting green boxes.
- **Stage nodes** sit on the spine in order. **Width is measured from the title, not fixed** (min 206px, roughly `title.length × 7.6 + 54`); height 58, 7px radius. Label 14.5px/700, with a 10.5px/700 `STEP n` line above it. A fixed 272px box across every stage is what made the canvas read as a grid.
- **Topic nodes** branch off each stage, at most one level left and one level right: height 32, width measured from the label, 1.5px border, `--t-node` label. **Counts vary from one to three per side** and are authored per stage in `career-tracks.ts` by real subject weight. A uniform two-per-side shape renders as a mirrored grid however it is drawn.
- **Row height follows density**: `74 + max(left, right) × 42`. A light stage occupies less of the page than a heavy one.
- **Phase bands** group consecutive stages that share a `Milestone.phase` into one rounded band with a 10.5px/700 label. The band containing the current stage is lit (`--phase-band-now`); the rest recede. Bands survive on the narrow geometry; topic nodes do not.
- **Cluster headings** draw `leftLabel` / `rightLabel` above each topic column at 9.5px/700.
- **Connectors** are curved cubic-bezier paths, 1.5px. Cleared stages use solid `--node-done-border`; everything else is dotted `2 5`.
- Reading order is top-to-bottom, left-before-right within a stage. **DOM order must match** for screen readers.

### Node states

**Progress runs on the saturation axis.** Cleared stages are muted teal, the current stage is the only fully saturated thing on the canvas, and everything ahead drains to parchment. That ordering is what makes position readable at a glance and in greyscale.

| State | Fill | Border | Extra |
|---|---|---|---|
| Not started | `--node-future-fill` | `--node-future-line` 1.5px | Drained parchment, `--node-future-ink` label |
| Next | `--node-next-fill` | `--node-next-line` 2px | Its own tint. The one stage to start next must not look like the eleven after it |
| In progress | `--node-stage` | `--node-border` **3px** | Full saturation, drop shadow, a full-width row wash (`--row-now`), and a **"You are here" marker** centred above the node |
| Done | `--node-done-fill` | `--node-done-border` 2px | Earned emblem, top-right corner |
| Coming soon | `--node-soon-fill` | `--node-soon-border` dashed `5 4` | Label at 55% opacity, non-interactive, tooltip "New resources every Friday" |

State must survive grayscale. Fill, border weight, dash pattern, and the emblem each carry it independently.

**A ring is not a state.** The in-progress stage previously shared `--node-stage` with every untouched stage and was separated only by an `--amber-500` ring at 55% opacity. Two things were wrong with it: at equal fill and equal lightness the ring vanished in greyscale, and it asked one hairline to carry the single most important fact on the screen. Position is now carried by fill, border weight, elevation, row wash and an explicit marker together — remove any one and it still reads.

**Every label ink is checked at 4.5:1** against the fill it sits on. Canvas labels run 9.5–14.5px, so none of them qualify for the large-text exemption. The muted greys that look right in a mockup routinely land near 2.5:1; check, do not eyeball.

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

The step brief is **a dialog, not a column.** Nothing is open when the canvas loads; clicking a stage node opens it, and closing it returns the reader to the map. It shipped as a persistent 320px sticky column beside the canvas, which squeezed both: the graph could not breathe and the brief wrapped to two-word columns. The brief answers a click, so it behaves like one.

**One component, two presentations,** switching at the app's 860px breakpoint:

- **Desktop — centred modal.** `min(460px, 100%)` wide, `min(760px, 88vh)` tall, scrim `rgb(4 52 44 / 0.42)`, 160ms veil and 200ms rise.
- **Phone — bottom sheet.** Full width, `88vh` cap, top corners rounded, entering from the bottom edge, which is the reachable half of a one-handed phone.

Surface in both: `--surface` background, `--hairline` border, `--shadow-overlay`, 3px `--teal-700` accent on the leading edge — the left edge as a modal, the top edge as a sheet — and `--teal-050` fill on the proof-target block. **It is a light surface.** The shipped app used dark navy `#0f172a` here, an undocumented third surface inside a light application; that is removed. There is no dark inspector surface in this system.

Content is unchanged and stays complete at every width: the `Selected path · NN` eyebrow, status pill, title, description, estimate and placement, `What you will cover`, the proof target, and the state's call to action. `What you will cover` is load-bearing on a phone, not supplementary: the narrow canvas geometry drops the left/right branch skills so that no pinch-zoom is ever required, and this list is then the only place those skills exist.

Dialog behaviour, all required:

- `role="dialog"`, `aria-modal="true"`, named by the step title via `aria-labelledby`.
- Focus moves into the dialog on open and returns to the node that opened it on close. The stage node reports `aria-haspopup="dialog"` and `aria-expanded`.
- Escape closes. A scrim click closes. A visible close control sits in the pinned heading, labelled from copy in both languages.
- Tab is trapped inside; the page behind does not scroll; the dialog is unmounted while closed, so it is never in the tab order or the accessibility tree.
- No `aria-live` region. The old panel needed one because content swapped in place; a dialog announces itself, and both together would say it twice.
- Both animations are dropped under `prefers-reduced-motion`.

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

## The Roadmap Catalog

**No cards.** roadmap.sh presents 94 roadmaps as category headings with counts and plain rows underneath, and it is the most legible catalog in this category. Equal bordered cards are the pattern that makes a page read as generated, and DESIGN.md already forbids opening a primary screen with an equal card grid.

Structure, top to bottom:

1. **Your path** — one pinned block, tinted `--teal-050` with a 3px `--teal-700` left edge, showing title, current stage, percentage, and a progress bar. This is the only element on the screen that is allowed to look like a card.
2. **Arena groups** — an uppercase `--t-label` heading with a count (`Technology & Data · 3`), a hairline rule, then compact rows.
3. **Preview paths collapsed** — behind a single disclosure control. Nothing is hidden that a learner needs to act on; only paths they cannot start yet.

A catalog row is a grid of `title + one line of substance | availability | chevron`. The substance line carries stage count and first mission, not marketing description.

### Availability labels

| Label | Meaning |
|---|---|
| `Controlled pilot` | Roadmap and at least one mission exist, capacity-limited |
| `No missions yet` | Roadmap is complete; no mission authored |
| `Preview` | Roadmap itself is not built yet |

`No missions yet` and `Preview` are different claims and must not be collapsed. Labelling a finished 14-stage roadmap as `Preview` understates real work.

## The Mission Runner

A mission is five steps with a progress rail, not one long page. The previous single page stacked a brief, a deliverables list, a pilot note, and a submission form, which on a phone is a wall of text with the form buried at the bottom and no sense of position.

| Step | Contains |
|---|---|
| 1 Brief | What you are making, for whom, and why it counts |
| 2 Build | Deliverables as a live checklist, drafts saved locally |
| 3 Submit | Links and reflection |
| 4 Review | Status timeline and reviewer feedback |
| 5 Proof | The verified artifact |

**One step on screen at a time.** The brief stays reachable from every later step.

**Deliverables are the progress mechanic.** Ticking a real deliverable is progress a learner can defend in an interview. This is the only in-mission progress signal, and it is deliberately not points: the founder research note records that gamification works on meaningful progress rather than attendance, and that unclear game rules are a recurring failure mode.

Rail states use the canvas vocabulary: complete steps take `--teal-500`, the current step takes `--node-stage` with a `--node-border` ring, future steps stay `--hairline`.

## The AI Tutor

Answers questions about the active roadmap. Modeled on the founder reference: assistant messages in `--amber-100` on the left, learner messages in `--teal-700` on the right, suggested questions as full-width `--teal-050` buttons, and a persistent footer reading "Answers use your roadmap context · verify links before applying".

**Current status: scripted preview.** Suggested questions map to pre-written answers per roadmap. There is no model behind it. It must carry a `Preview` label wherever it appears until there is one and a process for checking Burmese answers.

**Boundaries, regardless of implementation.** The tutor explains a roadmap. It never marks a milestone complete, never reviews submitted work, never creates or influences proof, and never claims a verification tier. PRODUCT.md: automated feedback never creates verified proof.

## Path Progress

Levels are **path-scoped**: XP never transfers between careers, so a learner viewing someone else's roadmap sees no level on it.

### The ladder

| Level | Name | XP minimum | Evidence gate |
|---|---|---:|---|
| 1 | Explorer | 0 | Account and path exploration complete |
| 2 | Starter | 100 | At least one completed mission |
| 3 | Maker | 300 | At least one human-reviewed mission |
| 4 | Practitioner | 700 | Three human-reviewed missions across two stages |
| 5 | Trailblazer | 1,200 | A verified capstone plus four reviewed missions |

A level is reached only when **both** its XP minimum and its evidence gate pass, and the ladder does not skip: failing one rung stops the climb even when XP would allow a higher one. This is what prevents activity farming, and it is why the meter always shows the gates rather than only the number.

Capstone is not yet a distinct mission type in the schema, so the Trailblazer gate approximates it as five verified proofs. Documented here rather than claimed as the full rule.

The shipped `get_active_path_dashboard` RPC returns its own `level` computed as `floor(xp / 100) + 1` — uncapped and ungated. **That value is ignored.** Only the raw `xp` is consumed; the ladder is resolved in `lib/domain/progress.ts`.

### The meter

- **Full card, Home only.** Insignia, level name, band progress, every gate, and the honesty line.
- **Compact strip, Roadmap and Missions.** Insignia, name, bar, `xp / next`. Repeating the full panel on every screen is how an app becomes a dashboard mosaic.
- Fill measures distance **across the current band**, not the absolute total. 340 XP in the 300–700 band reads as 10%, not 48%.
- Progress tracks carry an inset hairline. `--surface-sunk` on `--surface` is nearly no contrast, and at 0% the bar would otherwise vanish at exactly the moment it matters most.
- Every meter is followed by: *"Levels describe progress inside Lan Pya. They do not claim you are employable."* Non-negotiable.

### Emblems

Five marks, each with **its own silhouette** — a wide pentagon, a cut-corner block, a diamond, a tall tower, a rosette. Shape carries identity; colour reinforces it. Five icons in five coloured circles is the most recognisable AI-generated layout there is, and it would also leave hue as the only differentiator, breaking colour rule 7.

- A completed **stage** node carries its earned emblem. A completed **milestone** keeps the plain check: milestones are 36px sub-items, and an emblem there would double-claim the stage's achievement.
- Emblems map to stage position, so a 5-stage and a 14-stage roadmap both span the full set. Adjacent stages on a long path may share a mark; inventing a sixth shape would produce marks nobody can tell apart.
- Unearned emblems keep their silhouette at 30% opacity and greyscale, so an empty path still has shape.
- **No standalone emblem shelf.** The founder plan excludes badge-collection visuals from the hackathon because they compete with proof. Emblems appear only next to the work that earned them.

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

## Breakpoints

Before this list existed the stylesheet switched layout at seventeen different
widths — 400, 420, 480, 520, 560, 620, 639, 640, 650, 720, 760, 780, 859, 860,
900, 920, 1080 — several of them the same intent picked twice, so two similar
cards stacked at different widths for no reason anybody could state. They are
now eight, and these five carry the structure:

| Name | Width | What changes here |
|---|---|---|
| Phone | **480px** | One column. Cards give up their side-by-side arrangement. |
| Wide phone / small tablet | **700px** | Content that needs two dimensions gets them. The roadmap draws topic nodes either side of the spine from here up, and the mission map's stop cards stop being sized for a tablet. |
| App shell | **860px** | Chrome, not content: the sidebar hands off to the bottom bar and dialogs become bottom sheets. Load-bearing and long-standing; do not move it to tidy the list. |
| Wide | **920px** | Panels that hold two columns of their own. |
| Desktop | **1300px** | The mission map takes its landscape geometry. |

Three component-level widths survive because merging them would have moved
layouts this pass could not verify: **560**, **640** and **1080**. Prefer the
five above for anything new, and fold a straggler in when you are already
working on the component that owns it.

**These are a convention, not tokens.** A CSS custom property cannot be used
inside a media query, so nothing enforces this list except the person editing
the file. That is exactly why it is written down.

**860 is about chrome, 700 is about content, and they are not the same
question.** The roadmap used 860 to decide whether it had room to draw
branches, which meant every iPad in portrait was handed the phone drawing: a
328px strip with roughly 250px of empty white down each side and no topics on
it at all.

## Marketing surfaces

Everything above governs **the app**: the eight-step type scale, the
minimal-functional motion rule, the borders-not-shadows rule. Those rules exist
for a dense workspace read on budget phones, often outdoors, by someone trying
to get work done. The scale's own rationale says so: it sits below Zapier's
because "that is a desktop marketing site and this is a dense app".

The landing page is the desktop marketing site. It has one job the app never
has: convincing somebody who has never heard of Lan Pya to stay for ten more
seconds. It gets a larger scale and one piece of ambient motion. Nothing here
applies to any screen behind `/app`.

| Token | Size | Line height | Tracking | Weight | Use |
|---|---|---|---|---|---|
| `--t-hero` | clamp(40px, 7vw, 72px) | 1.02 | −2px | 800 | Landing hero headline only |
| `--t-hero-sub` | clamp(17px, 1.4vw, 20px) | 1.55 | 0 | 400 | The paragraph under it |

**Ambient motion is allowed once, in the hero, and nowhere else.** The final
word of the headline cycles through what proof is actually for. It is permitted
because it carries meaning rather than decorating: a reader who watches it
learns the product's argument. It is not permitted to spread. A second looping
thing on this page, or any looping thing inside the app, is a defect.

Every rule that is about honesty rather than density still holds on this page:
the palette does not change, contrast minimums do not change, controls keep
their 44px target, and `prefers-reduced-motion` stops the cycle on its first
word rather than reducing its speed.

The sign-in page keeps its two-panel composition on desktop. At tablet widths,
the form comes first and the supporting promise panel follows it. On phones,
the promise panel is removed and a compact Lan Pya lockup stays with the form,
so signing in remains the first task and the first viewport does not become a
stacked marketing screen. The privacy helper stays left-aligned on narrow
screens, with its lock aligned to the first line of copy rather than the
vertical centre of a wrapped paragraph.

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
| 2026-08-17 | **Missions moved out of Roadmaps into their own tab** | Learners could not find the work. roadmap.sh splits every path into Roadmap / Projects / AI Tutor; Lan Pya uses Map / Missions / Tutor. Tab counts state authored-mission scope before the click. |
| 2026-08-17 | **Catalog cards removed entirely** | roadmap.sh presents 94 roadmaps with category headings, counts, and plain rows. Equal bordered cards are what made the page read as generated. The `catalogByArena` grouping already existed in the page and was unused. |
| 2026-08-17 | **`No missions yet` separated from `Preview`** | Full-Stack and AI & Data have complete 14 and 13 stage roadmaps but rendered as `Preview`, because `career-recommendations.ts` falls back to preview without a `DIGITAL_PATH_PREVIEWS` entry. Two different claims; collapsing them understates finished work. |
| 2026-08-17 | **Mission page becomes a five-step runner** | The single page stacked brief, deliverables, pilot note and form, which on a phone buried the form under a wall of text with no sense of position. Deliverables become the in-mission progress signal. |
| 2026-08-17 | **In-mission progress is a deliverables checklist, not points** | Founder research note: gamification works on meaningful progress, not attendance; unclear rules are a recurring failure mode. A ticked deliverable is defensible in an interview. |
| 2026-08-17 | **AI Tutor added as a scripted preview** | Taken from the founder reference. No model behind it, labelled Preview, and bounded so it never marks work done or influences proof, per PRODUCT.md. |
| 2026-08-17 | **Header width bound to the content token** | Regression from the 820px content column change on 2026-08-16, which left the header at 1100px. |
| 2026-08-17 | **Type scale rebuilt on Zapier proportions** | Sizes up one step (body 15→16, meta 13→14, label 11→12), display 28→32 at 1.05 leading and 700 weight, negative tracking added at every heading step. Colours deliberately untouched. |
| 2026-08-17 | **Buttons take body size at 600, control height 44px** | They were 14px on a 40px target, which is timid for a primary action and below the touch minimum. Follows Zapier's own button = body-size-at-semibold rule rather than adding a ninth token. |
| 2026-08-17 | **Compact list titles wrap to two lines instead of truncating** | At the larger scale, `text-overflow: ellipsis` was cutting opportunity names mid-word. Losing the end of "Junior Frontend Build Challenge" is worse than a taller row. |
| 2026-08-17 | Rejected General Sans as a display face | Measured 283px against Plus Jakarta Sans' 284px on the same string. A third font download for an invisible difference. |
| 2026-08-17 | **Content column made fluid** | A flat 820px cap left ~590px of dead margin each side on a 2000px monitor. `clamp(820px, 78vw, 1280px)` serves both a laptop and a large display; the header shares the token so alignment holds. |
| 2026-08-17 | **Map / Missions / Tutor shipped as a query parameter, not a route move** | Mission pages keep their own URLs and the submission flow that creates proof is untouched. Structural tidiness was not worth risking the one path that produces verified evidence three days before a pitch. |
| 2026-08-17 | **Tutor free-text answers state that it is scripted** | Rather than improvising a reply, unmatched input returns the preview disclaimer. Inventing an answer is the exact failure this preview exists to avoid. |
| 2026-08-17 | **Mission runner shipped; deliverables persist in the existing draft record** | The checklist rides in the same IndexedDB draft, so it inherits private on-device storage and the 30-day expiry rather than introducing a second store. |
| 2026-08-17 | **Rubric weights shown on each deliverable** | A learner should see what their work is scored against before starting, not after a review. The weights are the reviewer's actual rubric. |
| 2026-08-17 | **Steps 4 and 5 are owned by submission state** | Review and Proof cannot be reached by clicking. You cannot navigate your way into "verified". |
| 2026-08-17 | **Profile shows one Compass prompt instead of four "Not sure yet" rows** | Repeating the same empty value four times reads as broken rather than honest. Profile sections also drop card chrome for rules, matching the catalog. |
| 2026-08-17 | **Missions promoted to a primary destination; four became five** | Reverses the "four destinations only" risk recorded on 2026-08-13. Missions were contextual under Roadmaps and learners could not find them. The mobile bar was hardcoded to four columns and wrapped "Me" onto a second row until fixed. |
| 2026-08-17 | **Path tabs removed the same day they shipped** | A tab inside Roadmaps still buries the work one level down, which was the original complaint. Missions became a destination and the tutor a popup instead. |
| 2026-08-17 | **Missions carry their stage as a tag in canvas amber** | A mission should visibly belong to a place on the map. Completed missions stay listed with their verification date rather than vanishing. |
| 2026-08-17 | **Tutor is a mascot launcher plus a modal, per the founder reference** | A compass rose on an amber tile: the product's metaphor is the map, so the guide is a compass, not a generic robot. Escape closes, focus enters the dialog and returns to the launcher. |
| 2026-08-17 | **Career catalog moved from Roadmaps to Me > Careers** | Roadmaps answers "where am I"; the catalog answers "what else is there". Three browsing sections on the screen a learner opens to find their next step is noise. Roadmaps now shows your path, your recommendations, and one link out. |
| 2026-08-17 | **Me gains a fourth tab and per-tab accents** | Teal for you and your evidence, amber for exploring, purple for the private surface. Existing palette tokens used semantically for wayfinding, not decorative colour invented for variety. Spends the decoration budget on recognition. |
| 2026-08-17 | **Tutor became a floating launcher in the shell** | It was a banner on Home only. The moment a learner needs help is the moment they are stuck on some other screen, so it rides the shell. Shrinks to the mascot alone on mobile and clears the bottom bar. |
| 2026-08-17 | **Opportunities became a focus carousel** | Modelled on the ciko-energy 3D arc: focused item upright and lit, neighbours rotated and receding, scrub rail below. Built from CSS transforms rather than WebGL — the reference is a brand showcase, this is read on budget Android phones and Design Spec §8 says the app's speed is the brand. |
| 2026-08-17 | **Carousel detail sits above the arc** | The thing being decided about is read first; the carousel is the control, not the content. |
| 2026-08-17 | **Reduced motion gets a plain list, not a stilled arc** | Motion is the component's whole mechanism. Freezing a 3D arc leaves overlapping cards a learner cannot parse, so the fallback drops to a stacked list. |
| 2026-08-17 | **Opportunity cards carry generated category artwork, not photography** | Design Spec §8 forbids stock imagery on core screens: it reads generic, risks depicting identifiable people, and costs mobile data this audience pays for. Each category gets geometry instead — a few hundred bytes, sharp at any zoom, recognisable before the label is read. |
| 2026-08-17 | **Category art stays inside the teal family** | Amber means urgency and purple means the global track; neither is free for decoration. Categories differ by composition rather than hue. |
| 2026-08-17 | **Third bounded palette added for emblems** | Teal was the only expressive colour in the system and teal is also every button and link, so the app had no way to look like anything. Five emblem hues, scoped exactly like the canvas palette: inside an emblem or insignia, never in chrome. This is the fix for "feels like AI slop", not more decoration. |
| 2026-08-17 | **Each emblem gets its own silhouette, not a shared circle** | The first sketch was five glyphs in five coloured circles — the single most recognisable AI-generated layout, and it left hue as the only differentiator, breaking colour rule 7. A built-in greyscale test at 26px then caught a pentagon and a regular hexagon reading as the same blob, so Capstone became a tall narrow tower. |
| 2026-08-17 | **Emblem outlines are structural, not decorative** | `--em-5` on white is ~2.6:1, under the 3:1 WCAG 2.2 floor for graphical objects. The 2.2px `--em-ink` boundary is what carries contrast, which frees the fill to be a colour that reads well. Removing the outline breaks accessibility. |
| 2026-08-17 | **The level ladder is computed in TypeScript; the RPC's `level` is ignored** | `get_active_path_dashboard` returns `floor(xp / 100) + 1` — uncapped, ungated, and would call a learner "Level 51" for 5,000 XP with nothing completed. The founder plan requires both an XP minimum and an evidence gate at every rung. Only the raw `xp` is consumed. No migration. |
| 2026-08-17 | **Meter fill measures the current band, not the absolute total** | 340 XP inside the 300–700 Maker band is 10% of the way to Practitioner, not 48% of 700. The bar answers "how far to the next level", which is the only question it is asked. |
| 2026-08-17 | **No standalone emblem shelf on Home** | The founder plan excludes badge-collection visuals from the hackathon because they compete with proof. Emblems appear on the roadmap spine, on mission rows, and in the level-up moment — always attached to the work that earned them, never in a trophy case. |
| 2026-08-17 | **Progress tracks carry an inset hairline** | `--surface-sunk` on `--surface` is nearly no contrast. At 0% the meter vanished entirely, which is exactly the moment a new learner most needs to see that a meter exists. |
| 2026-08-17 | **Stages carry emblems; milestones keep the plain check** | Milestones are 36px sub-items hanging off a stage. An emblem there would be too large for the node and would double-claim the stage's own achievement. |
| 2026-08-17 | **Seeded verified submissions backfilled with the XP they had already earned** | `record_review_decision` awards XP on verification, but seeded demo submissions were inserted as `verified` directly by migrations and bypassed the RPC, so they held proof with no XP. The demo learner's verified Frontend mission read as 0 XP. Backfill is anchored to submissions that are already verified *and* already have a proof item; it invents nothing. |
| 2026-08-17 | **The demo account cannot pass an evidence gate, and that is kept** | `verified_count` counts only `data_origin = 'live'` proof, so demo proof never satisfies a gate and the demo account stops at Starter. A meter showing one gate met and one unmet demonstrates that levels cannot be bought with points, which a maxed account would hide. Note the asymmetry: demo XP counts, demo proof does not. |
| 2026-08-17 | **"New this week" rail sourced from CHANGELOG.md** | The top navigation has promised "Updated every Friday" on every screen since launch with nowhere to see what changed. TODOS deferred the rail for lack of a content pipeline, but CHANGELOG.md is maintained every release and already written in learner-facing language, so it *is* the pipeline. Sourcing from it means the rail cannot claim work that did not ship. |
| 2026-08-17 | **The rail shows one sentence per entry** | Changelog entries are paragraphs, which is right for the file and wrong for Home: rendered whole they became a wall of text that unbalanced the grid against "Your path ahead". Design Spec §2 asks for dated rows, one line each. Splitting only on a period followed by a capital keeps `v0.9.1.0` and `z.guid()` intact. |
| 2026-08-17 | **Known issues appear in the rail, sorted last** | Hiding them would make the rail marketing. Amber carries them, because amber means attention and honesty and an unresolved problem is exactly that. |
| 2026-08-17 | **Sidebar returns on desktop; bottom bar stays on phones** | Reverses the 2026-08-13 replacement of the sidebar with a 60px top navigation. The information architecture does NOT revert with the chrome: the old sidebar listed six destinations including `build` and a separate `paths` catalog, both since moved at the founder's request. Below 860px the sidebar is not rendered at all rather than hidden with CSS, because rendering both would put five duplicate links in the tab order and read every destination twice. |
| 2026-08-17 | **Collapsed sidebar keeps its icons** | A 68px rail you cannot read is still a rail you can navigate. Collapsing to zero would make the control a hide button, which the bottom bar already does better on the screens that need it. |
| 2026-08-17 | **Opportunities carousel replaced by a Contra-style board** | The 3D focus carousel shipped the same morning read well at three listings and showed one at a time; this page is built for thirty. Contra's discover and jobs pages answer it with search, a For you / All toggle, category chips, and shelves. Rows expand in place because the evidence readout is the reason to open a listing and must not cost a navigation. |
| 2026-08-17 | **Contra's structure adopted, its visual style rejected** | Contra's visual weight is entirely borrowed from user-uploaded portfolio thumbnails. Lan Pya has none, Design Spec §8 rules out stock photography, and their violet plus iridescent glass would reverse the no-gradient and no-glass rules. Copying the look without the imagery would produce empty rectangles; copying the information architecture fixes real problems. Teal stays primary. |
| 2026-08-17 | **Shelves are computed, never authored** | A listing cannot be filed into the wrong shelf, and urgency outranks readiness: something closing in three days leads regardless of how well the learner's evidence matches it. |
| 2026-08-17 | **Login brand panel shows a roadmap, not feature pills** | Contra fills this slot with a logo wall ("Trusted by 1M+ creatives"). Lan Pya has no partner logos and aspirational ones on a login screen are the exact unearned claim this product argues against. The three pills it replaces had the same problem in smaller form: "Free forever", "Transparent", "Private by default" are adjectives asserting quality rather than anything a visitor can check. The roadmap shows the product instead, and DESIGN.md already calls the canvas the screen people remember. Labelled "Example roadmap" so it cannot be read as a live account. |
| 2026-08-17 | **Missions opens on a trail map** | Founder reference: a lesson-unit trail with a character, footprint path, and stops that unlock one after another. Missions was a list; the trail gives the same information a shape a learner can read at a glance. |
| 2026-08-17 | **The trail and the roadmap read the same `Milestone.status`** | Two maps of one journey would drift. Both views derive done / current / next / locked from the same field, so a stop cannot be lit on one screen and dark on the other. The roadmap is the overview at full density; the trail is the same path at walking pace, windowed to five stops around the learner. |
| 2026-08-17 | **Locked means the database says upcoming** | "One mission unlocked after another" is a data claim, not a visual effect. A padlock appears because the stage is `upcoming`, never because three greyed circles looked good. |
| 2026-08-17 | **The traveller is flat SVG, not the pitch artwork** | The reference character is an AI-generated raster from the deck. At 30px on a phone it would smear, and it costs real bytes on mobile data. Redrawn as flat paths sharing the compass mascot's construction. |
| 2026-08-17 | **Scenery is held back and never sits under a label** | Two hill bands and one sun, all flat SVG worth a few hundred bytes. Labels always take the side opposite their stop. The sun sat at y=54 and ran straight through the first label; it moved to clear it. |
| 2026-08-17 | **Trail gets two geometries, like the roadmap canvas** | The first version shipped one phone-width layout at a 456px cap, which on a desktop stranded a narrow strip in the middle of the screen. A reference screenshot taken on a phone is not a desktop design; reproducing its width was copying rather than designing. WIDE spreads stops to 880 units with larger nodes and full stage names; NARROW keeps the phone layout and truncates at 22 characters, because SVG text does not wrap. |
| 2026-08-17 | **Trail stops are interactive where there is somewhere to go** | The stage you are on opens its mission, a completed stage opens its proof, and a locked stage is inert rather than a link that explains a refusal after the click. The hit area spans the label too, since a 36px circle is a poor target on a phone. |
| 2026-08-17 | **XP becomes Steps, and the graphic becomes the score** | The old meter was a hexagon holding a digit beside an 8px bar. It failed because the number and the graphic were unrelated: the hexagon carried no information the text did not already state. Duolingo's flame works because picture and number are one idea. The ring IS the score — each dot is a segment of the journey to the next level. "XP" is borrowed from games; steps belong to a map walked by a traveller. Ladder thresholds and evidence gates are unchanged, and the database column stays `xp` because renaming a shipped column days before a pitch buys nothing. |
| 2026-08-17 | **Profile follows the reference layout, minus the leaderboard** | Character, level pill, name, identity line, stat tiles. The reference puts "Leaderboard Rank #200+" under the name and the founder plan rules it out, so that slot carries the path and when the learner started it. The third tile is proofs rather than the reference's "Bounty", because bounties do not exist here and a zero would be filling space with a promise. |
| 2026-08-17 | **REVERSED: the dark conversion was not what was asked for** | "Change the teal to navy" was read as needing a dark ground, on the reasoning that glass only refracts on dark. The founder wanted the accent swapped and the app kept light. Reverted to the tokenised light theme; the two-pass approach made this one checkout rather than 145 edits. Glass is retired with it. |
| 2026-08-17 | **Navy leads, teal is secondary, app stays light** | Navy carries navigation, primary actions, links and selection. Teal keeps every meaning it had — progress fills, verified proof, done nodes — as the secondary accent. The swap works through the `--teal` alias, which ~200 rules consume as "the primary accent", so repointing one token moved the accent without editing those rules. |
| 2026-08-17 | ~~Navy becomes primary; teal becomes the accent~~ (superseded) | Founder direction. Navy is the surface family, teal keeps its meaning (us, direction, progress) but is lifted to `#34C98F` because the `#0F6E56` that read well on white is too dark on navy. |
| 2026-08-17 | **Dark and glass are one decision** | A translucent panel over a white canvas is a grey rectangle. Glass only refracts once the ground is dark, so "make navy primary" and "make it liquid glass" could not be done separately. |
| 2026-08-17 | **Reverses "no gradients, glow, glass" for the authenticated app** | Colour rule 9 forbade glass outright. The founder asked for it directly and repeatedly, so the rule is retired rather than silently broken. Gradients remain banned as *decoration*; the glass fill is structural. |
| 2026-08-17 | **Glass is simulated, not `backdrop-filter`** | `backdrop-filter: blur()` recomposites everything behind an element every frame and drops scroll frames on the budget Android phones this product is read on, against Design Spec §8 "the app's speed is the brand". Layered translucency plus a lit top edge gives the same picture at no cost. Real blur is kept only on the two full-screen overlays, which are momentary and do not scroll. |
| 2026-08-17 | **The theme was tokenised before it was flipped** | `globals.css` held 145 hardcoded whites against 37 uses of the surface token, so a direct flip meant 145 hand edits with no way to verify coverage. Pass 1 tokenised them and changed nothing visually; Pass 2 flipped one token block. An automated sweep for near-white computed backgrounds then found the survivors, rather than a judge finding them. |
| 2026-08-17 | **`--navy` was ink, not a fill** | The token documented as marketing-only was used 120 times, 102 of them as heading and body colour. Flipping the ground without splitting it shipped invisible headings. Text now follows `--ink`; fills use `--brand-fill`. |
| 2026-08-17 | **Node ink and node border are separate tokens** | `--node-border` lightened so stops read against navy, which turned stage labels pale on their amber fills. Ink printed ON a node fill stays dark; the border is for strokes against the ground. |
| 2026-08-18 | **Mission map becomes a mountain climb** | Founder reference. The path winds from the foreground to a lit peak, numbered stops sit on the path, labelled cards take the side with room, and the traveller stands beside the stop you are on. Replaces the flatter trail. |
| 2026-08-18 | **Terrain and badges are SVG; the labelled cards are HTML over them** | Cards carry real links, real buttons, and text that has to wrap and translate, all of which SVG does badly. Both layers derive their positions from one geometry function so they cannot drift. |
| 2026-08-18 | **Cards take the side with room, not alternating sides** | Alternating by index put three of five cards off-screen at 360px, where `overflow: hidden` clipped them rather than wrapping. Placement now follows the stop's x position. |
| 2026-08-18 | **The map shows steps and no streak** | The reference header carries "240 XP" and a "7 day streak". This product measures steps, and the founder plan rules out coercive daily streaks in favour of a weekly rhythm with a grace week; a streak counter would contradict the research the plan cites. |
| 2026-08-18 | **The traveller faces forward** | On a map the character stands beside the stop you are on, and a back view reads as walking away from the thing it marks. Straps moved in front of the hoodie, where the reference has them: drawn behind, they were hidden entirely and took the character's teal with them. |
| 2026-08-18 | **The mascot is the founder's artwork, not a redrawing of it** | Two attempts at hand-authored bezier paths produced a pictogram beside the reference. The source is prepared instead: a flood fill inward from the borders removes the baked checkerboard (a lightness threshold would have punched out the white shoe soles inside the figure), trimmed to the figure, resampled to 420px and encoded WebP. 20KB against the 964KB original. Hand-drawing is the wrong tool at this fidelity. |
| 2026-08-18 | **The map fits the viewport** | The scene was 900x1180 and had to be scrolled to be understood, which defeats a map. Now 1120x620 with the stage capped to `calc(100svh - 300px)`, so the whole climb reads at once. |
| 2026-08-18 | **Stops ascend on an even diagonal** | Two stops sat at x 0.34 and 0.30, close enough that their cards stacked. An even spread guarantees horizontal separation between neighbours, which is what keeps the labels apart. |
| 2026-08-18 | **The current stop's card carries its own affordance** | A separate floating "Continue mission" button collided with the card beneath it, and the card was already a link to the same mission. One target, not two competing for the same space. |
| 2026-08-18 | **The level strip is a pill, not a bar** | Full-width and directly above the map's dark header, it read as a second header competing with the first. It now claims only the width it needs and has real space beneath it. |
| 2026-08-18 | **Map terrain rebuilt at the concept's proportions** | The compressed 1120x620 scene was three flat triangles and read nothing like the reference. Now 923x1704, matching the concept exactly: a two-tone summit with a snowcap, flanking peaks, two haze-graded ridges, a 26-tree conifer belt, a contour-lined snowfield and a foreground of rocks and shoots. The height cap is gone; the climb is meant to be walked, not squeezed into one screen. |
| 2026-08-18 | **Scenery scatter is seeded, never random** | Trees and rocks place from an index-derived pattern rather than `Math.random`, so the server and the client draw the same scene and hydration does not mismatch. |
| 2026-08-18 | **Opportunities leads with named, dated partners** | Real institutional marks, so the band states what it claims and when it was last checked rather than showing a logo wall captioned "trusted by". The founder confirmed both relationships are documented before this shipped. If a partnership lapses its entry is removed, because an out-of-date partner logo is a false claim rather than a stale one. |
| 2026-08-18 | **Each partner mark keeps its own ground** | The embassy seal is drawn on white and the college wordmark is white on navy. Each sits on a tile matching its own ground rather than being recoloured onto a shared one, which would mean altering somebody's official mark. |
| 2026-08-18 | **Organisation and verification read without expanding a row** | Who is behind a listing and when it was last checked are the two facts that decide whether it is worth trusting, so neither should cost a click. |
| 2026-08-18 | **Map furniture scaled to the terrain** | Badges, cards and the traveller were sized for a compressed scene and dominated the full-length one. The panel is capped to 660px, which scales the whole scene rather than stretching the terrain. |
| 2026-08-19 | **Roadmap step brief became a dialog** | The canvas and the brief shared one row, and neither fitted: a 780px graph and a 320px column of two-word lines. The brief is a response to a click, not ambient context. As a dialog it frees the full content width for the map, and the page cap drops from 1200px to 920px because there is no second column to reserve. Modal on desktop, bottom sheet on phones — the same component, since the brief is the only place a phone can read the branch skills the narrow canvas geometry omits. |
| 2026-08-20 | **Sign-in leads with the form on narrow screens** | Stacking the desktop promise panel above the form turned a focused authentication page into a full marketing screen on mobile. Tablets now put the form first and retain the supporting panel afterward; phones hide the panel and keep a compact Lan Pya lockup beside the task. |
