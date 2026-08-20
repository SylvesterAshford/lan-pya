# Lovable Prompts for Rebuilding Lan Pya

These prompts are designed to be pasted into Lovable in sequence. Do not start with “make the whole app.” Establish the product rules, data model, and one complete vertical slice first, then add surfaces without letting later prompts restyle earlier work.

Before starting, upload this file together with [PRD.md](./PRD.md), [DESIGN.md](./DESIGN.md), and the production assets listed in the design specification.

## How to use this prompt pack

1. Start a new Lovable project connected to GitHub and Supabase.
2. Paste Prompt 0 as the permanent project brief.
3. Run Prompts 1–10 in order.
4. After each prompt, test the changed flow before continuing.
5. Paste Prompt 11 after every visual drift or broad refactor.
6. Use Prompt 12 for the final parity audit.

If Lovable proposes replacing the stack or weakening a trust boundary, reject that proposal and point it back to the PRD.

---

## Prompt 0 — Permanent project brief

```text
Build Lan Pya, a bilingual, proof-first career platform for Myanmar learners. Its promise is “From Map to Proof.” A learner chooses a direction, follows a connected roadmap, completes practical missions, receives human-reviewed evidence, owns private proof, and sees relevant opportunities with readiness gaps.

Read the attached PRD.md and DESIGN.md before changing code. Treat them as requirements. Ask before changing product scope, trust boundaries, navigation, brand tokens, or responsive trade-offs.

Use:
- Next.js App Router with TypeScript
- React
- Supabase Auth and Postgres
- Supabase row-level security for private data
- English and Burmese locale routes
- Lucide outline icons
- CSS design tokens from DESIGN.md

Do not turn this into a course marketplace, generic job board, quiz result, game dashboard, or decorative portfolio. Do not use gradients, glassmorphism, glow, stock photography in the app, confetti, public leaderboards, opaque scores, or unverifiable claims.

Trust rules:
- Automated feedback never creates verified proof.
- Submission, automated evaluation, human review, and proof are separate states and records.
- Proof is private by default; public sharing is opt-in and revocable.
- Seeded demo data is always labelled and excluded from live metrics.
- Never expose service-role secrets to the browser.
- Never cache authenticated pages, API responses, staff screens, or proof views in the service worker.

Experience rules:
- One useful next action comes before secondary information.
- English and Burmese have identical functional coverage.
- Mobile and low-bandwidth use are first-class.
- Desktop uses a collapsible sidebar; phones use five bottom destinations.
- Tablet and desktop use the full branching roadmap. Slight horizontal scrolling inside the tablet map is accepted so labels stay legible. Do not shrink roadmap text to remove it.

Before implementing a prompt, summarize which routes, components, tables, policies, and tests you will touch. After implementing, report what works, what remains mocked, and any requirement you could not verify.
```

## Prompt 1 — Foundation, localization, and visual tokens

```text
Set up the Lan Pya foundation without building feature pages yet.

Implement:
- Next.js App Router and TypeScript
- Locale routing for /en and /my
- One selected language per page
- Plus Jakarta Sans for English and Padauk for Burmese, self-hosted with swap behavior
- All typography, color, spacing, radius, shadow, and motion tokens from DESIGN.md
- Global focus treatment, reduced-motion support, safe-area variables, and semantic surface classes
- Root error, loading, not-found, and offline-aware states in both languages
- A lightweight PWA manifest and service worker that caches public shell assets only

Create a typed translation structure. Do not hard-code visible strings in components. Burmese must be Unicode, use zero letter spacing, and receive the optical size adjustments in DESIGN.md.

Add a visual token reference route available only in development. It should display every type step, semantic color, button state, status pill, field state, focus ring, and Burmese/English comparison.

Acceptance:
- No font below 11px
- No unapproved colors, gradients, glass, or card shadows
- Keyboard focus is visible
- The dev token page has no horizontal page scroll at 320px
- English and Burmese hierarchy feels equivalent
```

## Prompt 2 — Supabase schema, authentication, and security

```text
Connect the project to Supabase and implement the secure data foundation described in PRD.md.

Create migrations for:
- learner_profiles, memberships, consent_records, career_preferences
- career_tracks, roadmap_milestones, milestone_progress, learner_path_history
- mission_definitions, learner_mission_work, submissions, submission_versions
- evaluation_jobs, automated_evaluations, review_assignments, human_reviews, appeals
- competencies, proof_items, proof_competencies, proof_shares, proof_share_sessions
- opportunities, opportunity_requirements
- reviewer_invites, audit_events, deletion_requests

Add enums for data provenance, roles, availability, and submission states. Use foreign keys, unique constraints, checks, timestamps, and indexes. Keep submission versions immutable.

Enable row-level security on every private or operational table. Learners may read only their own private records. Reviewers may read submissions only through their role and workflow. Admin access must be explicit. Anonymous users may not query proof tables directly.

Implement email/password and Google OAuth through Supabase Auth. Add callback and sign-out routes. Never put the service-role key in a public environment variable.

Create security-definer RPCs only where a transaction or privileged workflow genuinely requires one. Validate every API payload with Zod.

Provide seed data for a prepared demo account, career tracks, roadmap milestones, one real mission, proof, and opportunities. Mark all seeded records as seeded_demo.

Add database tests proving cross-user access is blocked, direct proof creation is blocked, review workflows are role-gated, and seeded/live provenance remains intact.
```

## Prompt 3 — Landing, login, and demo entry

```text
Build the public entry flow in English and Burmese.

Landing page:
- Explain the problem in plain language
- Headline communicates “Stop collecting advice. Start building proof.”
- Primary CTA starts the learner path
- Secondary CTA opens the prepared demo
- Show one connected preview from roadmap to mission to proof, not three generic cards
- Add the three trust statements: private by default, no opaque career score, free for learners

Login page:
- Email/password sign in and account creation
- Google sign in
- Prepared demo-account helper
- Real roadmap/promise panel beside the form on wide screens
- Form first with the supporting panel below it on tablets
- Form only with a compact Lan Pya lockup on phones; do not stack the full supporting panel above or below the task
- Keep the privacy helper left-aligned on narrow screens and align its lock icon to the first line when the copy wraps
- Specific recoverable errors for credentials, provider outage, confirmation email, and generic service failure

Keep the page light, quiet, and fast. Use uploaded production assets where appropriate. Do not use stock photos or invent testimonials and metrics.

Test keyboard order, labels, error association, 320px wrapping, Burmese copy, and OAuth fallback behavior.
```

## Prompt 4 — App shell and Career Compass

```text
Build the authenticated shell and onboarding.

Shell:
- Desktop collapsible sidebar with Home, Roadmaps, Missions, Opportunities, Me
- Phone slim top brand row plus fixed five-item bottom navigation
- Role-gated Review and Admin utilities outside the learner destination group
- Account, language, and sign-out controls
- Active navigation derived from the current route
- Do not render a hidden duplicate navigation tree
- Floating tutor launcher labelled Preview

Career Compass onboarding:
- Ask interests, preferred work, immediate goal, device access, connectivity, prior experience, weekly time, and locale
- “Not sure” and skip are valid
- Calculate an explainable recommendation from deterministic rules
- Show why each recommendation fits and where confidence is limited
- Let the learner select another path
- Save answers privately and make them editable later
- Set one active path while preserving old path progress

Redirect incomplete accounts to onboarding. Redirect complete accounts to Home. Add route guards for reviewer/admin areas.

Test phone navigation, keyboard navigation, long Burmese labels, route active states, role visibility, and returning users.
```

## Prompt 5 — Home and progress

```text
Build Home to answer one question: “What should I do next?”

Place the active mission or next milestone first with one dominant CTA. Then include:
- Current path and current stage
- Resume point for interrupted work
- A Continue mission action that opens the Missions climb centered on the learner's current position; the current stop then enters the runner
- Weekly progress without punitive streak language
- Full path-scoped level meter with XP and evidence gates
- Nearby opportunity deadline
- Compact proof summary
- “New this week” release rail

Use the five-level ladder in PRD.md. A learner reaches a level only when both XP and its evidence gate pass. Do not trust a database formula that derives level from XP alone. Do not skip blocked rungs.

Every full meter must say: “Levels describe progress inside Lan Pya. They do not claim you are employable.”

Avoid an equal-card dashboard mosaic. The next action must own the initial viewport and all secondary modules should read as supporting information.

Add tests for level boundaries, evidence gates, zero progress, seeded proof, localized dates, expired deadlines, and resume-state display.
```

## Prompt 6 — Roadmap catalog and branching canvas

```text
Build Roadmaps as the signature Map-to-Proof experience.

Catalog:
- Pinned “Your path” block with progress
- Arena headings with counts and compact path rows
- Preview paths behind one disclosure
- Availability labels must distinguish Operational, Controlled pilot, No missions yet, and Preview
- Do not use a uniform card gallery

Canvas:
- Connected SVG graph with a dotted central spine
- Stage nodes on the spine and milestones branching one level left/right
- Curved dotted connectors
- Explicit not-started, in-progress, done, and coming-soon states
- Yangon/local and Global fork using teal and purple respectively
- Every node is a focusable button and DOM order matches visual reading order

Responsive behavior:
- Phone uses compact geometry and keeps labels readable
- Tablet and desktop use the full branching graph
- Tablet may scroll slightly inside the map container
- The page itself must not horizontally scroll
- Do not add a third tablet layout or shrink 13px labels unless explicitly approved

Node detail:
- Shared dialog component
- Centered modal on larger screens and bottom sheet on phones
- Includes status, title, description, estimate, placement, skills, proof target, and correct action
- Focus enters and returns correctly; Escape, scrim, and close button work; background scroll locks

Add tests for graph order, connectors, states, keyboard access, focus return, reduced motion, phone geometry, tablet contained scrolling, and long Burmese labels.
```

## Prompt 7 — Mission map, runner, drafts, and submission

```text
Build Missions as a climb tied to the same underlying progress as Roadmaps.

Mission map:
- Portrait mountain/trail scene
- Current stage is lit and carries the traveller
- Completed stages carry a check or earned stage emblem
- Locked stages remain inert
- Stage cards stay readable on iPhone and do not wrap to four lines
- Wide and narrow geometry may differ, but both read the same progress source

Mission runner:
- Five steps: Brief, Build, Submit, Review, Proof
- One step on screen at a time
- Brief remains reachable
- Deliverables are a real checklist and the only in-mission progress mechanic
- Save drafts per user and mission in IndexedDB with a 30-day expiry
- Show draft-saved, offline, restoring, validation, submitting, submitted, reviewing, changes-requested, approved, and failed states

Submission:
- Repository URL, deployment URL, screenshot URL, explanation, reflection, and AI/tool-use disclosure
- Validate and normalize inputs
- Make submission idempotent so repeated taps do not duplicate records
- Create an immutable submission version and queue deterministic evaluation
- Do not automatically fetch arbitrary custom domains; mark them inconclusive

Test refresh recovery, user separation, expiry, offline resume, duplicate clicks, invalid URLs, custom domains, stale submissions, and localized errors.
```

## Prompt 8 — Review and proof trust loop

```text
Implement the trust loop from queued evaluation through human review to proof.

Automated evaluation:
- Durable queued job with retry/recovery behavior
- Deterministic repository/deployment checks where safe
- Store observations, evaluator version, limitations, and summary
- Never create proof or mark a mission human-verified

Reviewer workspace:
- Role-gated queue
- Atomic claim action
- Submission version, learner reflection, evidence, automated observations, and rubric
- Criterion-level scores and notes
- Approve, request changes, or reject
- Audit every state transition

Proof creation:
- Approval through the protected review workflow creates one proof item transactionally
- Store evidence snapshot, competencies, rubric version, reviewer tier, verification date, and provenance
- Repeated review requests must not create duplicate proof
- Invalidation and deletion remain visible as states

Make trust boundaries visible in UI copy. “Automated review” and “Human reviewed” must never look interchangeable.

Add RLS tests, concurrency tests for claiming, idempotency tests, audit tests, and end-to-end tests from submission through verified private proof.
```

## Prompt 9 — Portfolio, resume builder, and proof sharing

```text
Build the Me/Portfolio evidence experience.

Portfolio:
- Verified work list with title, date, rubric, reviewer tier, competencies, repository, deployment, and provenance
- Filters or sections for active, invalidated, and seeded demo proof
- Empty state points back to the next mission

Resume builder:
- Learner selects eligible active proof
- Generate editable resume bullets grounded only in selected evidence
- Deduplicate competency names while preserving learner-selected proof order
- Never include invalidated/deleted proof
- Never invent impact, metrics, employers, or responsibilities

Proof sharing:
- Private by default
- Learner previews exactly what will be public
- Create revocable, expiring share links
- Put the secret in the URL fragment, exchange it once, then use a 15-minute HttpOnly SameSite=Strict cookie
- Anonymous viewers access only the approved proof snapshot
- Revocation stops future sessions
- Distinguish invalid/revoked/expired links from temporary service failure
- Never cache proof pages or APIs

Test token leakage, cookie scope, expiration, revocation, service failure messaging, invalid proof IDs, seeded labels, and resume output.
```

## Prompt 10 — Opportunities, profile, privacy, and operations

```text
Complete the remaining product surfaces.

Opportunities:
- Search title and organization
- For you / All switch
- Category filters
- Sort nearest deadline first in application code as well as database output
- Group closing soon, evidence-supported, and build-toward opportunities
- Show organization, deadline, original source, last verified date, provenance, supported evidence, gaps, and unknowns
- Expired listings remain in history with a final state
- Do not hide listings merely because readiness is low

Profile:
- Alias, headline, avatar, active path, path start date, mission/step/proof counts
- Editable Career Compass answers
- Path switching with prior work preserved
- Language control
- Do not falsely activate Portfolio navigation on profile/career/privacy routes

Privacy:
- Explain private-by-default behavior
- Consent history
- Share-link management
- Account deletion request with explicit confirmation

Admin:
- Reviewer invites
- Opportunity creation and maintenance
- Operational summary and audit visibility

Test deadline boundaries, timezone behavior, readiness explanation, path switching, route active states, permissions, and destructive confirmations.
```

## Prompt 11 — Design drift correction

```text
Audit the current implementation against DESIGN.md and correct drift without changing product scope.

Check every route for:
- Typography token compliance
- Approved colors and semantic color use
- 4px spacing scale
- 6px graph nodes, 8px controls, 12px panels
- Borders instead of card shadows
- One dominant action per viewport
- No equal-card opening grids
- No gradients, glow, glass, stock app photography, emoji, or mixed icon families
- Equivalent English/Burmese hierarchy
- 44px controls, visible focus, reduced motion, and non-color status cues
- Correct sidebar/bottom navigation handoff
- No duplicate hidden navigation
- Correct phone, tablet, and desktop roadmap behavior

Preserve the accepted tablet-map trade-off: a small amount of contained horizontal scrolling is preferable to smaller labels. Report every remaining exception with its route and reason.
```

## Prompt 12 — Final parity and release audit

```text
Run a release audit against PRD.md and DESIGN.md. Do not claim completion from screenshots alone.

Verify these journeys end to end in English and Burmese:
1. Public landing → account creation/sign-in → onboarding → recommended path
2. Home → roadmap node → mission start → offline draft restore → submission
3. Evaluation queue → reviewer claim → feedback/approval → private proof
4. Portfolio → resume bullet generation → share creation → anonymous view → revocation
5. Opportunity discovery → readiness detail → source link
6. Profile edit → path switch → prior work preserved
7. Reviewer/admin authorization failures for ordinary learners
8. Account deletion request

Verify at 320px, 360px, common phone widths, iPad portrait/landscape, laptop, desktop, keyboard-only, 200% zoom, reduced motion, and slow/offline network conditions.

Run and report:
- lint
- TypeScript checking
- unit tests
- database/RLS tests
- critical Chromium journeys
- cross-browser end-to-end tests
- automated accessibility scan plus manual keyboard check
- production build
- client-bundle secret scan

Produce a table with Requirement, Evidence, Status, and Remaining risk. Mark anything mocked, seeded, preview, inconclusive, or unverified honestly. Do not infer parity from screenshots: compare the implementation against the deployed app and the repository's current `VERSION` and `CHANGELOG.md`.
```

## Repair prompt — when Lovable over-designs a screen

```text
This screen has drifted into a generic AI-generated dashboard. Simplify it using Lan Pya's Quiet Guidance rules.

Keep the underlying functionality. Remove decorative gradients, glass, oversized rounded cards, unnecessary shadows, repeated icons, invented metrics, and equal-priority card grids. Restore one clear next action, left-aligned hierarchy, compact rows, hairline borders, approved design tokens, and honest status labels. Use whitespace to group information. Do not hide evidence, provenance, limitations, or recovery actions for visual cleanliness.

Show the revised hierarchy in words before editing, then implement it and verify phone and Burmese layouts.
```

## Repair prompt — when trust states blur

```text
Audit this flow for trust-state confusion. Submission received, automated review, human review, and verified proof are different states. They must use different records, labels, permissions, and UI language.

Automated output may provide developmental feedback only. It cannot mark work verified, award proof, impersonate a reviewer, or silently change rubric history. Proof can be created only by the protected human-review workflow. Show provenance, method, version, date, and limitations wherever a trust claim appears.

Identify the exact data and UI locations where these states are currently blurred, then fix them and add regression tests.
```

## Related handoff files

- [PRD.md](./PRD.md)
- [DESIGN.md](./DESIGN.md)
