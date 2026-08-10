# Design System — Lan Pya

## Product Context

- **What this is:** A career-navigation and evidence platform that turns one career goal into a clear next action, real work, transparent feedback, and opportunity readiness.
- **Who it is for:** Myanmar university students, recent graduates, and self-learners pursuing their first credible career proof.
- **Space/industry:** Career guidance, skills development, portfolio evidence, and early-career opportunity discovery.
- **Project type:** Responsive web app and dashboard with a concise marketing entry screen.
- **Memorable idea:** **From Map to Proof.** The interface should feel like direction becoming evidence.

## Aesthetic Direction

- **Direction:** Guided Momentum
- **Decoration level:** Intentional
- **Mood:** Professional enough for employers, encouraging enough for a learner who feels lost, and concrete enough that progress never feels imaginary.
- **Reference sources:** The user-provided Lan Pya screen board, logo, and `Lan Pya Web.dc.html` wireframe.
- **Visual motif:** Directional paths, milestone nodes, and arrow movement taken from the Lan Pya logo. Use these sparingly where a journey or transition is being explained.

### Safe choices

- Clean Soft White work surfaces with a Deep Navy navigation rail
- Familiar cards, clear labels, left-aligned content, and compact dashboard summaries
- Teal for active navigation, progress, and learning states
- Strong visual distinction between learner work, trust evidence, and opportunity listings

### Deliberate risks

- Warm Yellow is reserved for the one most useful action or time-sensitive opportunity, so the eye always knows where to go next.
- Bilingual Burmese/English microcopy appears inside the real interface hierarchy rather than in a separate language layer.
- Roadmap views use directional composition and milestone rhythm rather than reducing the journey to a generic progress bar.

## Typography

- **Display/Hero:** Plus Jakarta Sans, 700–800 — contemporary and confident without feeling like institutional software.
- **Body:** Plus Jakarta Sans, 400–600 — keeps product copy and dashboard density visually coherent.
- **Burmese:** Padauk, 400–700 — designed for Burmese forms and already present in the supplied HTML reference.
- **UI/Labels:** Plus Jakarta Sans, 600–700 with modest letter spacing for small uppercase labels.
- **Data/Tables:** DM Sans with tabular numerals when dense numeric comparison is needed; Plus Jakarta Sans is acceptable for the prototype.
- **Code/URLs:** Geist Mono or JetBrains Mono.
- **Loading:** Google Fonts during the prototype, with `sans-serif` and local Burmese fallbacks for offline resilience. Self-host before production.

### Type scale

- Display: 56px / 1.05 desktop, 40px mobile
- H1: 38px / 1.12 desktop, 30px mobile
- H2: 26px / 1.2
- H3: 18px / 1.3
- Body large: 17px / 1.65
- Body: 15px / 1.6
- Small: 13px / 1.45
- Label: 11px / 1.3, uppercase Latin only

## Color

- **Approach:** Balanced. Navy establishes trust, teal carries learning and progress, and yellow is rare directional energy.
- **Primary / Deep Navy:** `#0F172A` — navigation, hero background, high-trust headings.
- **Secondary / Teal:** `#0F766E` — active navigation, progress, links, learning state.
- **Accent / Warm Yellow:** `#F59E0B` — primary next action, opportunity urgency, and directional highlights only.
- **Background / Soft White:** `#F8FAFC` — app canvas.
- **Surface:** `#FFFFFF` — cards, forms, proof packets.
- **Text / Slate:** `#334155` — body and secondary headings.
- **Text strong:** `#0F172A` — titles and data.
- **Muted:** `#64748B` — metadata and supporting copy.
- **Line:** `#E2E8F0` — card and control borders.
- **Teal tint:** `#E6F4F2` — active navigation and progress backgrounds.
- **Yellow tint:** `#FFF7DF` — next-action and deadline context.
- **Success:** `#16A34A` — completed, passed, verified state only.
- **Error:** `#DC2626` — destructive or failed state only.
- **Info:** `#2563EB` — neutral system information.

### Color rules

- Never use yellow for every button. One primary yellow action per major viewport is the maximum.
- Teal is not a success color. It means active, learning, or in progress.
- A trust tier always includes text and an icon/initial; color alone never communicates verification.
- Sponsored opportunities use an explicit label, not a special trust color.
- The prototype is light-first. A dark theme can be designed later rather than mechanically inverting the palette.

## Spacing

- **Base unit:** 4px
- **Density:** Comfortable dashboard density
- **Scale:** 2xs 4px, xs 8px, sm 12px, md 16px, lg 24px, xl 32px, 2xl 48px, 3xl 64px, 4xl 96px
- **Card padding:** 20–28px desktop, 16–20px mobile
- **Page gutters:** 40px desktop, 24px tablet, 16px mobile

## Layout

- **Approach:** Hybrid. Marketing entry may use a strong asymmetric hero; the app uses a disciplined dashboard grid.
- **App shell:** 232–256px navy sidebar on desktop, compact top bar, bottom navigation on mobile.
- **Grid:** 12 columns desktop, 8 tablet, 4 mobile.
- **Max content width:** 1240px for app content, 1160px for marketing content.
- **Border radius:** controls 8px, cards 10–12px, large feature surfaces 16px, pills 999px.
- **Borders:** 1px cool-slate line. Use shadows lightly and only to clarify layer or focus.
- **Information hierarchy:** current action first, path second, opportunity third, achievement/gamification last.

## Components

- **Primary action:** Warm Yellow background, Deep Navy text, 8px radius, strong label.
- **Secondary action:** Teal background, white text.
- **Tertiary action:** White/transparent with slate border; teal label on hover.
- **Cards:** White surface, slate border, minimal shadow, left-aligned copy.
- **Progress:** Teal track; green only after completion.
- **Readiness labels:** Ready now = green; Build toward = warm yellow; Explore = slate/blue.
- **Evidence record:** evaluator tier, date, rubric version, and evidence link remain visually grouped.
- **Forms:** 44–48px controls, persistent labels, clear error below the field, visible keyboard focus.

## Motion

- **Approach:** Minimal-functional
- **Easing:** enter `ease-out`, exit `ease-in`, movement `ease-in-out`
- **Duration:** micro 80ms, short 160ms, medium 240ms, long 400ms
- **Use:** assessment progression, mission evaluation status, drawer/card expansion, toast confirmation.
- **Avoid:** scroll choreography, bouncing rewards, ambient motion, and celebratory animation that competes with the learner’s work.
- Respect `prefers-reduced-motion`.

## Accessibility

- Target WCAG 2.2 AA for primary learner and proof-sharing flows.
- Use visible focus, semantic landmarks, heading order, and 44px minimum touch targets.
- Pair every status color with text.
- Test Burmese line height and wrapping on 360px screens.
- Keep core tasks usable at 200% zoom.

## Decisions Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-08-11 | Deep Navy + Teal + Warm Yellow approved | User supplied this exact brand palette and rationale. |
| 2026-08-11 | Guided Momentum aesthetic | Connects the logo’s directional path to the product’s map-to-proof promise. |
| 2026-08-11 | Light-first app with navy navigation | Matches the approved screen board and improves dashboard readability. |
| 2026-08-11 | Plus Jakarta Sans + Padauk | Adds typographic intention while supporting Burmese clearly. |
| 2026-08-11 | Yellow reserved for the next action | Makes direction visible and prevents accent-color noise. |

