# Lan Pya Product Requirements Document

Status: Lovable rebuild handoff
Prepared: 2026-08-20
Product promise: **From Map to Proof**

> Version note: the product owner reports v0.25.0.0 as live. The checked-out repository currently reports v0.19.1.0 in `VERSION` and `CHANGELOG.md`. Treat the owner's v0.25.0.0 behavior notes in this document as the target and verify the live app before declaring parity.

## 1. Product summary

Lan Pya is a bilingual, proof-first career platform for Myanmar learners. It turns an uncertain career goal into a maintained roadmap, a practical mission, human-reviewed evidence, and relevant opportunities.

The core loop is:

```text
Choose a direction → Follow the map → Build real work → Receive review → Own proof → Act on opportunities
```

Lan Pya is not a course marketplace, generic job board, personality test, or decorative portfolio builder. Its value is connecting direction, work, verification, and opportunity readiness in one trustworthy flow.

## 2. Target users

### Primary learner

- Myanmar university student, recent graduate, or self-learner
- Approximately 18–27 years old
- Pursuing a first internship, freelance project, or entry-level digital role
- Often uses a budget Android phone and mobile data
- May prefer English or Burmese
- Has learned from scattered sources but lacks sequence and credible proof

### Supporting roles

- **Reviewer:** claims submissions, applies a rubric, writes feedback, and creates verified proof.
- **Reviewer lead:** handles escalations and quality control.
- **Administrator:** manages reviewer invites, opportunity records, audit visibility, and operational health.
- **Proof viewer:** opens a learner-approved public proof link without entering the private learner workspace.

## 3. User problems

1. Learners receive conflicting career advice and cannot identify the next useful action.
2. Generic roadmaps show topics but do not connect them to practical work.
3. Certificates and self-reported skills do not give employers inspectable evidence.
4. Opportunity listings rarely explain whether a learner is ready or what is missing.
5. English-only, desktop-first products exclude many Myanmar learners.

## 4. Product principles

1. Show one useful next action before secondary information.
2. Proof beats claims. Trusted signals must link to work and a review method.
3. Personalization narrows choices without permanently locking the learner in.
4. Automated feedback may guide improvement but never creates verified proof.
5. Proof is private by default and sharing is revocable.
6. Availability, seeded data, preview features, and uncertainty are labelled honestly.
7. Mobile, low bandwidth, keyboard access, and Burmese comprehension are product requirements.
8. Progress reflects meaningful work. Do not reward attendance or fabricate employability scores.

## 5. Product scope

### 5.1 Public entry and authentication

The public landing page explains the Map-to-Proof loop and offers two primary paths: start a real account or use a prepared demo.

Authentication requirements:

- Email/password sign-up and sign-in through Supabase Auth
- Google OAuth through Supabase Auth only
- Localized English and Burmese routes
- Recoverable errors that distinguish bad credentials, unavailable providers, and service faults
- Email addresses never appear in shared proof by default

### 5.2 Career Compass onboarding

Collect enough context to recommend a path without pretending to determine a learner's identity.

Inputs:

- Interests
- Preferred kind of work
- Immediate goal
- Device access
- Connectivity
- Prior experience
- Weekly time
- Preferred locale

Requirements:

- Allow “not sure” and skipped answers.
- Explain why a path is recommended.
- Let the learner choose a different path.
- Keep answers private and editable from the profile.
- Maintain exactly one active path while preserving progress from previous paths.

### 5.3 Home

Home answers: **What should I do next?**

Show:

- Active path and current stage
- One dominant next action
- Current mission or resume point
- Weekly progress without punitive streak language
- Path-scoped level and evidence gates
- Nearby opportunity deadline
- Proof summary
- A concise “New this week” release rail
- Tutor launcher, clearly labelled Preview while scripted

### 5.4 Roadmaps

The roadmap is the product's signature screen.

Requirements:

- Show the active path first and make other paths browsable.
- Label each path as Operational, Controlled pilot, No missions yet, or Preview.
- Render a connected branching graph with a central dotted spine, stage nodes, milestone nodes, and explicit states.
- A node opens a complete step brief in a dialog on larger screens and a bottom sheet on phones.
- The graph and its accessible DOM reading order must agree.
- The local/global fork stays visibly open; an unselected branch is not hidden.

Current path portfolio:

- Frontend Developer: operational
- Content Creator: controlled pilot
- Full-Stack Developer: roadmap available, mission coverage may be incomplete
- AI/Data: roadmap available, mission coverage may be incomplete
- Other careers: preview only unless content and operations are genuinely ready

### 5.5 Missions

Missions convert roadmap knowledge into inspectable work.

The mission runner has five steps:

1. **Brief:** what to make, for whom, and why it matters
2. **Build:** deliverables and locally saved checklist/draft
3. **Submit:** repository, deployment, screenshot, explanation, and reflection
4. **Review:** evaluation state, reviewer feedback, and revision path
5. **Proof:** verified artifact and next action

Requirements:

- One step on screen at a time
- Brief reachable from every later step
- Drafts stored per user and mission in IndexedDB, with 30-day expiry
- Submission is idempotent and resists duplicate taps
- Automated checks are deterministic where possible
- Custom deployment domains are treated as inconclusive rather than unsafe assumptions
- Human review is required before verified proof is created

### 5.6 Progress

Progress is path-scoped and evidence-gated.

| Level | Name | XP minimum | Evidence gate |
|---|---|---:|---|
| 1 | Explorer | 0 | Account and path exploration complete |
| 2 | Starter | 100 | At least one completed mission |
| 3 | Maker | 300 | At least one human-reviewed mission |
| 4 | Practitioner | 700 | Three human-reviewed missions across two stages |
| 5 | Trailblazer | 1,200 | Verified capstone plus four reviewed missions |

Both XP and the evidence gate must pass. Never show a level as a general employability claim. Every full meter includes: “Levels describe progress inside Lan Pya. They do not claim you are employable.”

### 5.7 Proof and portfolio

Verified missions automatically become private proof records.

Requirements:

- List proof with title, verification date, rubric version, reviewer tier, competencies, repository, and deployment
- Distinguish active, invalidated, and deleted proof
- Distinguish seeded demonstration proof from live learner proof
- Let learners select proof and generate resume-ready bullets
- Let learners create and revoke share links
- Place share secrets in URL fragments, exchange once, then use a short-lived HttpOnly cookie
- Never cache proof views or authenticated/API content in the service worker
- If the service is unavailable, do not tell the viewer that valid proof was revoked

### 5.8 Opportunities

Show opportunities by what matters first: urgency and evidence readiness.

Each listing includes:

- Title, organization, type, location, and deadline
- Original source link
- Last verified date
- Seeded/live provenance
- Readiness: Ready now, Build toward, or Explore
- Evidence-supported requirements, gaps, and unknowns
- Honest expiration or cancellation state

Default ordering is nearest deadline first. Deadlines within seven days use explicit urgency language. Opportunity readiness is explanatory and never hides a relevant listing.

### 5.9 Reviewer workspace

- Role-gated queue
- Claim a submission before review
- Inspect current submission version and automated observations
- Apply criterion-level rubric decisions
- Approve, request changes, or reject with notes
- Create proof only through the protected review workflow
- Preserve review and audit history

### 5.10 Administrator workspace

- Create reviewer/admin invites
- Create and maintain opportunities
- Inspect operational summaries and audit events
- Keep administrative utilities outside primary learner navigation

### 5.11 Privacy and deletion

- Private data protected with Supabase row-level security
- Public sharing opt-in and revocable
- Account deletion request flow
- Clear consent records
- No private drafts, diagnostic answers, contact details, or unrelated work in public proof by default

## 6. Information architecture

### Public

- `/[locale]` landing
- `/[locale]/login`
- `/[locale]/demo`
- `/[locale]/proof/view/[shareId]`

### Learner workspace

- Home
- Roadmaps
- Missions
- Opportunities
- Me
  - Profile and Career Compass answers
  - Careers and path switching
  - Portfolio/proof
  - Privacy and deletion

### Staff utilities

- Review queue and review detail
- Admin operations

## 7. Navigation rules

- Desktop uses a collapsible sidebar with five learner destinations.
- Phone uses a five-item bottom navigation and a compact top brand row.
- Reviewer/admin links are visually secondary and role-gated.
- The active state must match the current destination. Profile, Careers, and Privacy do not falsely highlight Portfolio.
- Do not render hidden duplicate navigation that enters the keyboard or screen-reader order.

## 8. Data model

Use Supabase Postgres with row-level security. Core entities:

- learner profiles and career preferences
- memberships and roles
- consent records
- career tracks and roadmap milestones
- active/previous path history
- mission definitions and per-user mission work
- submissions and immutable submission versions
- queued evaluation jobs and automated evaluation results
- review assignments and human reviews
- competencies, proof items, and proof-competency links
- proof shares and short-lived share sessions
- opportunities and opportunity requirements
- reviewer invites, audit events, and deletion requests

Important boundaries:

- Client code never receives service-role credentials.
- Direct sensitive mutations remain blocked by row-level security.
- Workflow changes happen through validated server endpoints and security-definer database functions.
- Submission, automated evaluation, human review, and proof are separate records and trust states.

## 9. Non-functional requirements

### Accessibility

- Target WCAG 2.2 AA
- Keyboard-operable core workflows
- Visible focus
- Logical landmarks and headings
- Persistent form labels and recovery text
- Text or shape in addition to color for every status
- 44px touch targets where practical
- English and Burmese tested at 320px, 360px, and 200% zoom
- Respect reduced motion and reduced transparency

### Responsive behavior

- Phone: compact geometry and bottom navigation
- Tablet: full branching roadmap; slight horizontal map scrolling is accepted to keep labels legible under the owner-selected two-layout approach
- Desktop: full graph and collapsible sidebar
- Do not shrink roadmap labels below their fixed legible size
- Owner-reported v0.25 breakpoint consolidation: 17 ad hoc values reduced to 8 documented values, with 560px, 640px, and 1080px retained as named exceptions. Verify against the live stylesheet before claiming exact parity.

### Performance and offline behavior

- Optimize for mobile data and budget devices
- Prefer SVG/category geometry to heavy stock photography
- Self-host fonts with swap behavior
- Store only mission drafts offline
- Never cache authenticated pages, API responses, review/admin screens, or proof views

### Localization

- English and Burmese have equivalent information and interaction coverage
- One selected language per screen
- Unicode Burmese only, never Zawgyi
- Never letter-space or uppercase Burmese
- Do not hard-code visible copy inside components

## 10. Out of scope

- Full course library or learning management system
- Opaque AI career scoring
- AI-created verified proof
- General employer applicant-tracking system
- Mentor marketplace
- Social feed, public leaderboard, or badge shelf
- Pay-to-win review or trust
- Unsupported claims about salaries, placements, outcomes, or partner endorsement
- Uncontrolled scraping as the primary opportunity supply

## 11. Success measures

### Activation

- Learner completes onboarding
- Learner understands why a path was recommended
- Learner starts a mission

### Evidence loop

- Mission draft resumed successfully
- Submission completed without duplicates
- Review completed with understandable feedback
- Verified proof added privately
- Optional share link created and successfully viewed

### Comprehension and trust

- Learners can identify their next action
- Learners understand seeded vs live, automated vs human-reviewed, and preview vs operational
- Proof viewers can inspect what was reviewed, by which method, and when

## 12. Release acceptance criteria

A Lovable rebuild is not complete until:

- English and Burmese cover the same routes and states.
- Authentication, onboarding, active-path switching, mission submission, review, proof, sharing, and opportunities work end to end.
- The roadmap remains understandable with keyboard, screen reader, phone, tablet, and desktop input.
- Seeded demonstration records are visibly labelled and excluded from live verification metrics.
- Automated feedback cannot create proof.
- Share links can be revoked and expired sessions fail safely.
- No secret key appears in client bundles or `NEXT_PUBLIC_*` variables.
- Lint, type checking, unit tests, critical browser journeys, accessibility checks, database policy tests, and production build pass.

## Related handoff files

- [DESIGN.md](./DESIGN.md)
- [PROMPTS.md](./PROMPTS.md)
