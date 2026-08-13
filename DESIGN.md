# Design System — Lan Pya

## Product Context

- **What this is:** A bilingual career-navigation and evidence web app that turns one career goal into a clear next action, practical work, trusted proof, and relevant opportunities.
- **Who it is for:** Myanmar university students, recent graduates, and self-learners pursuing their first credible digital-career proof.
- **Project type:** Responsive web app with learner, reviewer, and administrator workspaces.
- **Memorable idea:** **From Map to Proof.** A learner should remember one visible path and the next step on it.

## Aesthetic Direction

- **Direction:** Quiet Guidance.
- **Decoration level:** Minimal.
- **Mood:** Calm, capable, local, and honest. The interface should feel like a maintained map rather than a course marketplace or a game dashboard.
- **Primary reference:** The founder-supplied `Lan Pya Web.dc.html` and its screenshots. Use its compact navigation, focused dashboard, simple roadmap catalog, connected node canvas, concise opportunity feed, and profile-owned preferences.
- **Light-first:** Preserve the approved Soft White application canvas. The reference's dark surfaces inform composition and density, not the shipped theme.

### Safe choices

- A compact 60px top navigation on desktop and four-item bottom navigation on mobile.
- Familiar left-aligned content, persistent labels, concise lists, and one dominant action per screen.
- Teal for navigation, progress, links, and active learning states.
- Strong text labels for seeded, live, verified, pending, and preview states.

### Deliberate risks

- **Four primary destinations only:** Home, Roadmaps, Opportunities, and Me. Missions open from roadmap milestones; portfolio, privacy, language, and account controls live under Me. The extra contextual click is worth the lower cognitive load.
- **Less information above the fold:** The home screen shows the current path, one next mission, three upcoming milestones, and deadlines. Secondary explanation moves behind the relevant action.
- **A real roadmap canvas:** Connected nodes and forks carry the core experience instead of card grids or a generic percentage bar.

## Information Architecture

### Primary navigation

1. **Home:** resume work, current progress, next milestones, and nearby deadlines.
2. **Roadmaps:** active path first, browse all paths on demand, then open the connected roadmap canvas.
3. **Opportunities:** deadline-led feed with compact provenance and readiness detail.
4. **Me:** career profile, personalization, portfolio proof, language, privacy, and account controls.

### Contextual flows

- A roadmap milestone opens its mission brief.
- Mission brief, deliverables, proof requirements, submission, status, feedback, and revision form one linear workflow.
- Verified missions become portfolio records automatically; sharing and revocation live under Me.
- Reviewer and administrator links appear as compact role-specific utilities, not learner destinations.

## Typography

- **English display, body, and UI:** Plus Jakarta Sans, 400–800.
- **Burmese display, body, and UI:** Padauk, 400–700.
- **Data:** Plus Jakarta Sans with tabular numerals.
- **Code and URLs:** Geist Mono or JetBrains Mono.
- **Loading:** Use `next/font` for production font delivery.

### Product type scale

- Page title: 24px / 1.25 desktop, 22px / 1.35 mobile.
- Section title: 18px / 1.35.
- Card or list title: 15–16px / 1.4.
- Body: 14px / 1.6 English; 15px / 1.7 Burmese.
- Supporting text: 12.5–13px / 1.55.
- Metadata: 11–12px / 1.45.
- Compact label: 11px / 1.35; uppercase Latin only.
- Marketing pages may use larger display sizes. Marketing typography must not leak into the authenticated app.

English and Burmese must preserve equivalent hierarchy and perceived size. Burmese may use one additional pixel and increased line height, never a different structural scale.

## Color

- **Approach:** Restrained. Navy establishes trust, Teal carries learning, and Yellow marks the one most useful action or urgent deadline.
- **Primary / Deep Navy:** `#0F172A`.
- **Secondary / Teal:** `#0F766E`.
- **Accent / Warm Yellow:** `#F59E0B`.
- **Background / Soft White:** `#F8FAFC`.
- **Surface:** `#FFFFFF`.
- **Text / Slate:** `#334155`.
- **Muted:** `#64748B`.
- **Line:** `#E2E8F0`.
- **Line strong:** `#CBD5E1`.
- **Teal tint:** `#E6F4F2`.
- **Yellow tint:** `#FFF7DF`.
- **Success:** `#16A34A`.
- **Error:** `#DC2626`.
- **Info:** `#2563EB`.

### Color rules

- Maximum one Yellow primary action in a major viewport.
- Teal means active, selected, learning, or in progress. Green means completed or verified.
- Every status includes text and, where useful, an icon. Color never carries meaning alone.
- No gradients, decorative glow, glass, or tinted shadows in the authenticated workspace.

## Spacing

- **Base unit:** 4px.
- **Density:** Compact-comfortable.
- **Scale:** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px.
- **Page gutters:** 24px desktop and tablet, 16px mobile.
- **Section rhythm:** 24–32px.
- **Card/list padding:** 16–20px desktop, 14–16px mobile.

## Layout

- **Approach:** Grid-disciplined application workspace.
- **Desktop shell:** Sticky 60px top navigation, centered 1100px maximum workspace.
- **Mobile shell:** Compact top brand row plus fixed four-item bottom navigation; content reserves safe-area space.
- **Dashboard:** Two columns only when secondary content remains scannable; stack at 760px.
- **Roadmap:** 860px content canvas with a node graph; mobile converts the graph to one vertical spine without losing branches or status.
- **Opportunities:** Single concise feed ordered by deadline. Filters scroll horizontally on mobile.
- **Border radius:** 8px controls, 10–12px cards and panels, full radius only for compact status/filter chips.
- **Elevation:** Borders first. Use a small offset shadow only for overlays, selected floating details, and mobile bottom navigation.

## Components

- **Primary action:** Teal background with white text. Yellow is reserved for the single urgent or directional action.
- **Secondary action:** White surface, Slate text, and a strong line border.
- **Cards:** Use only where grouping needs a boundary. Prefer rows, sections, and whitespace over grids of equal cards.
- **Progress:** A thin Teal track. Green only after verified completion.
- **Roadmap node:** Stage and milestone rectangles connected by visible paths. Completed nodes are green-tinted, active nodes use Yellow tint, future nodes stay neutral.
- **Forms:** 44–48px controls, persistent labels, inline recovery text, visible keyboard focus.
- **Icons:** Lucide outlined icons at 16, 18, 20, or 24px with consistent stroke weight. No emoji or generic decorative icon tiles.

## Motion

- **Approach:** Minimal-functional.
- **Easing:** enter `ease-out`, exit `ease-in`, movement `ease-in-out`.
- **Duration:** micro 80ms, short 160ms, medium 240ms.
- **Use:** navigation state, roadmap selection, drawers, submission status, and confirmation.
- **Avoid:** ambient animation, bouncing rewards, repeated entrance effects, and motion that competes with the learner's work.
- Respect `prefers-reduced-motion`.

## Accessibility

- Target WCAG 2.2 AA.
- Use landmarks, logical headings, persistent labels, visible focus, and 44px touch targets where practical.
- Test English and Burmese at 360px, 200% zoom, and long-content wrapping.
- Keep primary workflows keyboard-operable and screen-reader labelled.
- Do not expose duplicate English and Burmese labels in one hierarchy.

## Decisions Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-08-11 | Deep Navy + Teal + Warm Yellow | Founder-approved brand palette. |
| 2026-08-13 | One language per screen | Prevents duplicate labels and reduces hierarchy noise. |
| 2026-08-13 | Connected roadmap canvas | Makes the Map-to-Proof promise structural. |
| 2026-08-13 | Quiet Guidance redesign | Replaces the dense sidebar and card-heavy learner UI with the supplied HTML's compact, focused interaction model. |
| 2026-08-13 | Four primary learner destinations | Home, Roadmaps, Opportunities, and Me make missions and proof contextual rather than competing tabs. |
