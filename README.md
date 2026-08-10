# Lan Pya — From Map to Proof

Lan Pya is a hackathon-ready career-guidance prototype for Myanmar youth. It turns a broad career goal into one clear next action, a real mission, transparent developmental feedback, portable proof, and readiness-tagged opportunities.

The working prototype is built around one complete loop:

1. **Choose** an honest starting point.
2. **Build** a real-world mission.
3. **Prove** skills with inspectable evidence and a published rubric.
4. **Connect** to opportunities with visible readiness gaps.

## Prototype flows

- Three-step learner onboarding and explainable placement
- “Today” dashboard with one recommended next action
- Seven-milestone Frontend Developer roadmap
- Responsive profile-card mission with private evidence submission
- Clearly labeled deterministic prototype review
- Private Proof Profile with evidence and sharing controls
- Opportunities filtered by Ready now, Build toward, and Explore
- Device-local persistence and one-click ready-made demo
- Responsive desktop and mobile layouts

This is intentionally a frontend prototype. It does not upload files, create production accounts, perform expert verification, or send applications to real organizers. Those boundaries are labeled in the interface.

## Run locally

Prerequisite: Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For the fastest pitch walkthrough, choose **Open ready-made demo** on the welcome screen.

## Verify

```bash
npm run lint
npm test
```

`npm test` creates the production build, renders the worker output, checks launch metadata and project assets, and verifies that the core proof loop and prototype trust labels remain present.

## Product and design sources

- [PRODUCT_PLAN.md](./PRODUCT_PLAN.md) — product strategy, pilot operating model, metrics, risks, and Aug 20 hackathon plan
- [DESIGN.md](./DESIGN.md) — approved visual system, exact palette, type, spacing, layout, and motion guidance
- [CLAUDE.md](./CLAUDE.md) — implementation guardrails for future contributors

## Brand system

- Deep Navy `#0F172A` — trust, professionalism, career
- Teal `#0F766E` — growth, learning, technology
- Warm Yellow `#F59E0B` — direction, achievement, opportunity
- Soft White `#F8FAFC` — clean application canvas
- Slate `#334155` — readable body text

Typography uses Plus Jakarta Sans with Padauk for Myanmar script support.
