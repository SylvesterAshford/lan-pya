# Lan Pya (လမ်းပြ) Product Plan

Date: 2026-08-11  
Status: Draft for team review  
Selected strategy: Focused proof loop  
Tagline: **From Map to Proof**

## 1. Executive Summary

Lan Pya helps a young person answer four questions:

1. What career direction fits me now?
2. What should I do next?
3. How can I prove that I can do the work?
4. Which real opportunities am I ready to pursue?

The long-term vision is a career-navigation and verified-talent platform for Myanmar youth. The first product should be narrower: a complete path from assessment to credible proof for one reachable cohort and one career track.

The recommended first cohort is Myanmar university students, recent graduates, and self-learners pursuing entry-level digital work. The working assumption for the first track is **Frontend Developer** because the source material is deepest there, missions can produce observable work, automated checks are practical, portfolios matter to employers, and relevant communities are reachable for a pilot. The team still needs to confirm that assumption with learner demand and employer-partner commitment.

Lan Pya should not begin as a broad learning platform, public job board, mentor marketplace, or all-career super-app. Its initial advantage is the closed loop:

> **Choose → Build → Prove → Connect**

The central product promise is not “AI knows your career.” It is:

> **Lan Pya gives you the next useful action, helps you complete real work, and turns that work into evidence another person can trust.**

## 2. Product Thesis

### The problem

Career information and opportunities are scattered. Young people receive conflicting advice, learn skills without sequence, miss deadlines, and reach employers without credible evidence of ability. Employers, in turn, cannot easily distinguish claimed skills from demonstrated skills.

The source documents correctly identify several pain points, but they currently combine too many businesses:

- career assessment;
- learning management;
- project verification;
- portfolio creation;
- opportunity aggregation;
- job marketplace;
- mentoring;
- university analytics;
- employer recruiting software;
- paid career services.

Building all of these simultaneously would create content, trust, supply, demand, and marketplace cold-start problems at the same time.

### The wedge

Start with the smallest complete version of the distinctive loop:

```text
Learner context
      ↓
Short diagnostic
      ↓
Personal starting point
      ↓
One recommended next mission
      ↓
Work artifact + reflection
      ↓
Transparent evaluation
      ↓
Evidence-backed proof profile
      ↓
Relevant opportunities + readiness gaps
```

### What makes Lan Pya different

| Alternative | What it primarily provides | Lan Pya's difference |
|---|---|---|
| Course platform | Content and certificates | A sequenced path tied to real proof |
| Roadmap site | A generic list of skills | A personal starting point and next action |
| Job board | Vacancies | Readiness context before application |
| Portfolio site | Self-presented work | Evidence, rubric, and verification history |
| Assessment tool | A score at one moment | A repeatable build-and-prove progression |

The moat is not the number of courses or jobs. It is a growing graph of career requirements, real missions, evidence, verification rubrics, learner progress, and employer-calibrated signals.

## 3. Initial Target User

### Primary persona

**The directionless builder**

- Age: approximately 18–27
- Situation: university student, recent graduate, or self-learner
- Goal: first internship, freelance project, or entry-level digital job
- Current behavior: learns from Facebook, Telegram, YouTube, courses, and friends
- Pain: does not know what to learn next or whether current work is good enough
- Constraint: mobile-first usage, irregular connectivity, limited budget, mixed English ability
- Success moment: can show a credible project and understand the next realistic opportunity

### Jobs to be done

- “Help me choose a direction without pretending one quiz can decide my life.”
- “Tell me the next useful thing to do, not a list of 100 topics.”
- “Show me whether my work meets a real standard and how to improve it.”
- “Help me present proof, even if I have no formal work experience.”
- “Show me opportunities I can pursue and what I am missing for the others.”

### Not the initial target

Lan Pya should design for future inclusion but should not claim to serve these groups in the first release:

- every STEM discipline;
- skilled trades and field-based work;
- rural or conflict-affected youth requiring offline partner distribution;
- overseas labor migration guidance;
- senior professionals;
- a general employer applicant-tracking market.

These groups need different acquisition, evidence, safety, and partnership models. Treating them as simple extra “tracks” would be misleading.

## 4. Product Principles

1. **One useful next action beats a giant roadmap.** Show the whole journey, but emphasize what to do now.
2. **Proof beats claims.** Every trusted signal must link to evidence and an understandable rubric.
3. **AI assists judgment; it does not manufacture trust.** Automated feedback must be transparent, revisable, and clearly labeled.
4. **Show readiness, not artificial scarcity.** Do not hide relevant opportunities. Explain whether the learner is ready and how to close gaps.
5. **Progress must survive real life.** Prefer weekly momentum and restart-friendly goals over punitive daily streaks.
6. **Mobile and bandwidth constraints are product requirements.** Pages should be light, resumable, and useful on intermittent connections.
7. **Burmese-first comprehension, bilingual career vocabulary.** Users should not need professional English to understand the path, while still learning the English terms employers use.
8. **Public proof is opt-in.** Learners control what becomes visible to employers and the public.
9. **Tracks are content, not hard-coded products.** New disciplines should use a shared model with discipline-specific evidence and verification rules.
10. **No pay-to-win trust.** Payment must never make a weak submission appear more credible or move a learner unfairly ahead of others.

## 5. MVP Scope

### P0A: Concierge pilot minimum

The first cohort should validate the operating model before Lan Pya builds the scalable platform described below.

- Invite-only cohort of 30–40 learners
- One authentication method: email magic link or one-time invitation
- One fixed career track with no generalized authoring system
- Three placement branches: foundations, intermediate, and capstone-ready
- Three missions: two foundations plus one employer-reviewed capstone
- Structured content files or one restricted internal form
- Manual rubric review supported by deterministic link and file checks
- A shadow AI evaluator whose output is compared with reviewers but is not yet a trust badge
- One proof-sharing format, selected after testing a web proof page against a lightweight PDF
- 15–25 manually tagged, recently checked opportunities
- One visible support channel with named triage ownership
- Essential funnel, quality, consent, and error events

Google sign-in, generalized AI placement, public employer search, a full content-management system, automated readiness extraction, and multiple export formats are not part of the concierge pilot.

### P0B: Scalable proof-loop MVP

Build this scope only after the concierge pilot demonstrates that learners complete the loop and employers find the resulting proof useful.

The scope below uses Frontend Developer as a working assumption, not a silent final decision. If discovery selects a different first track, the product loop remains the same but the missions, evidence types, rubrics, and partner requirements must be replaced deliberately.

#### 5.1 Account and learner profile

- Email and Google sign-in
- Mobile-friendly onboarding
- Education stage, current skills, language comfort, available weekly time, device/connectivity constraints, and career intent
- Consent controls for AI processing and public profile visibility
- Ability to revise answers later

#### 5.2 Lightweight diagnostic

Use three inputs instead of a chatbot-only assessment:

1. self-reported experience;
2. a small set of deterministic knowledge checks;
3. one optional practical micro-task.

The system recommends a starting point and explains why. “I’m not sure” and “skip” must be valid answers. The diagnostic is placement guidance, not a permanent identity or employability score.

#### 5.3 Frontend career track

Recommended initial structure:

```text
Orientation
  ↓
HTML foundations
  ↓
CSS and responsive design
  ↓
JavaScript foundations
  ↓
Working with APIs
  ↓
React foundations
  ↓
Portfolio-quality capstone
  ↓
Application readiness
```

Each milestone contains:

- outcome and why it matters;
- prerequisite skills;
- a small curated resource set;
- practice activities;
- one proof-producing mission;
- evaluation rubric;
- relevant opportunity tags.

Do not build a full course library. Curate existing resources and invest Lan Pya effort in sequencing, missions, feedback, and proof.

#### 5.4 Today view

The home screen should answer one question: **What should I do next?**

It contains:

- current milestone;
- one recommended next action;
- estimated effort;
- resume point if the learner left mid-task;
- upcoming relevant deadline;
- weekly progress, without punishment for a broken streak.

#### 5.5 Mission and submission system

A mission includes a real-world brief, acceptance criteria, examples, estimated effort, and an explicit rubric.

Supported evidence for the first track:

- repository URL;
- deployed URL;
- screenshots;
- short project explanation;
- learner reflection on decisions, difficulties, and AI/tool use.

Submission must be resumable and idempotent. Repeated taps or weak connectivity must not create duplicate submissions.

#### 5.6 Evaluation and verification

Use four clearly separated states:

| State | Meaning | Trust level |
|---|---|---|
| Submitted | Evidence received, not evaluated | None yet |
| Automated review | Rules and AI produced feedback | Developmental signal |
| Expert reviewed | A named qualified reviewer applied the rubric | Stronger signal |
| Employer endorsed | A partner reviewed the work in a hiring context | Context-specific signal |

This table is the target trust taxonomy, not a claim that every state is productized in the concierge pilot. During P0A, expert review and employer endorsement are recorded manually by Lan Pya staff, while shadow-AI results remain internal. P0A provides a support-based factual-correction channel; the scalable appeal and re-review workflow belongs to P1.

Automated review should combine deterministic checks with AI-assisted feedback:

- repository and link validity;
- required files and features;
- accessibility and performance checks where practical;
- rubric-level feedback;
- evidence citations showing what caused each finding;
- confidence and limitations;
- re-submission after improvement.

Avoid a single opaque percentage and an undifferentiated “Verified” badge. A user and employer must be able to inspect the evidence, rubric, evaluator type, date, version, and feedback history.

#### 5.7 Proof profile

Each learner gets a private-by-default proof profile containing:

- selected projects;
- skill evidence linked to project artifacts;
- evaluation tier and rubric results;
- roadmap progress;
- short learner narrative;
- public share link when enabled;
- downloadable compact proof packet for low-bandwidth sharing.

Call this a **Proof Profile** in the product. “Portfolio” can remain familiar supporting language, but the stronger concept is evidence rather than decoration.

For measurement, keep these events separate:

- `proof_added_private`: evaluated evidence was added to the learner’s private profile;
- `share_enabled`: the learner explicitly enabled a share token;
- `proof_shared`: the share link or file was actually used.

Successful proof-cycle completion requires only `proof_added_private`. Public sharing is always optional.

The first Proof Packet contains the learner’s chosen name, project title, short context, selected artifacts, rubric version, criterion-level result, evaluator tier, evaluation date, and a verification URL or ID. It omits contact details, demographic fields, private drafts, raw diagnostic answers, and unrelated projects by default. The learner previews and consents before generation. Revoking the share token disables live verification; downloaded files display their generation date and may become stale.

#### 5.8 Opportunity readiness

Relevant opportunities should not disappear behind progress locks. Use three states:

- **Ready now**: the learner appears to meet the published requirements.
- **Build toward**: relevant, with named gaps and a route to close them.
- **Explore**: useful for awareness but not yet a near-term match.

Every listing needs:

- source organization;
- original source link;
- deadline and timezone;
- eligibility;
- location/remote status;
- cost or compensation;
- last checked timestamp;
- report-a-problem action;
- clear sponsored label when applicable.

The initial opportunity supply should be curated manually with partner submissions. Do not depend on uncontrolled scraping for the pilot.

Opportunity lifecycle:

```text
Draft → Source checked → Published → Updated → Expired/Cancelled/Removed
                              │
                              └→ Saved → External application recorded
                                             ↓
                                Outcome claimed → Verified/Disputed/Closed
```

- A listing remains in a learner’s history after expiry, clearly labeled with its final state.
- Learners record an application or other action manually in P0A; Lan Pya does not claim the external application was completed unless verified.
- Interview and hire outcomes require learner confirmation and, when reported as platform outcomes, partner or documentary confirmation.
- Corrections preserve an audit history. Safety concerns can remove a listing immediately while review is pending.
- P0A readiness uses manually assigned requirement tags and simple rules only. Generalized job-post parsing and reverse gap mapping are later work.

#### 5.9 Internal operations

The team needs simple tools to:

- author and version tracks, milestones, missions, and rubrics;
- review submissions and resolve P0A factual-correction requests through support;
- publish, expire, and correct opportunities;
- manage pilot cohorts and partner access;
- inspect funnel and quality metrics;
- suspend fraudulent or harmful content;
- export and delete user data when requested.

This operational surface is part of the MVP. Without it, the team cannot keep trust signals current.

#### 5.10 Roles and permissions

| Role | Can view | Can change | Cannot do |
|---|---|---|---|
| Learner | Own profile, submissions, feedback, relevant opportunities | Own drafts, consent, sharing, correction requests | Edit evaluations, rubrics, or opportunity truth |
| Reviewer | Assigned evidence and rubric, limited learner context | Criterion results, feedback, conflict declaration | Browse unrelated learners or publish opportunities |
| Employer partner | Explicitly shared proof packets and partner mission results | Contextual endorsement, feedback, invitation | Search private learners or change expert evaluations |
| Content editor | Track content, resources, mission and rubric drafts | Create versions and propose publication | Review own content as final approver when separation is required |
| Opportunity editor | Listing sources and reports | Publish, correct, expire, or remove listings | View private learner evidence without separate permission |
| Cohort manager | Enrolled learners, operational status, support history | Invite, waitlist, mark withdrawal/completion, escalate support | Change evaluation outcomes without reviewer authority |
| Administrator | Operational records needed for support and safety | Role assignment, suspension, exports, deletion execution | Use access without audit logging or bypass consent for employer sharing |

All privileged access is least-privilege, time-bounded where practical, and written to an audit log. A person holding multiple roles must declare conflicts and cannot expert-review work they authored, coached substantially, or would directly hire without the contextual employer label.

#### 5.11 Content governance

- A named Track Owner approves the outcome map, milestone order, mission versions, and reviewer rubric.
- A Language Owner approves Burmese meaning and bilingual terminology; machine translation alone is not publishable.
- Mission briefs, acceptance criteria, core rubric feedback templates, privacy notices, and key navigation are available in Burmese and English. English-only external resources are labeled clearly.
- Each external resource records owner/source, usage or licensing basis, language, expected bandwidth, last check, and a lightweight alternative when possible.
- Links are checked monthly during an active cohort and within two business days after a learner report.
- Published missions are immutable versions. Learners may finish the version they started unless it has a safety or factual defect; urgent retirement triggers a migration notice and a Track Owner decision.
- Rubric changes require a change note and a decision on whether existing evidence must be re-evaluated.

### P1: After the scalable proof loop works

- Self-service employer proof-packet view and candidate invitation
- Expert-review workflow with reviewer calibration
- In-product appeal, correction, and re-review workflow
- Partner-authored missions based on real entry-level work
- Application intent tracking and interview outcome collection
- University/NGO cohort dashboard
- Second track using the shared track and evidence model
- Opportunity reminders through user-chosen channels
- Proof-profile themes, without changing evidence prominence

### P2: Explicitly later

- Public job marketplace
- Mentor marketplace
- Community forum
- Team matching
- Native mobile applications
- Voice mock interviews
- Broad AI career coach
- Freelance marketplace
- Public candidate search at scale
- Automated ranking of candidates for employers
- TVET, agriculture, healthcare, or migration products without qualified partners

## 6. First Pilot

### Cohort design

- 30–40 learners
- 1 Frontend Developer track
- 3 proof-producing missions: 2 foundations and 1 capstone
- 2 university or developer-community distribution partners
- 3–5 employer design partners
- 3–4 qualified reviewers
- 8–10 weeks from invitation through outcome review
- Reliable laptop access as an eligibility requirement, or a partner-provided lab/device arrangement

The pilot should operate as a managed cohort, not an open marketplace. Learners may navigate and read on mobile, but Frontend production work requires reliable access to a computer. Lan Pya staff curate opportunities, observe support questions, audit evaluations, and send selected proof packets to partner employers manually. The self-service employer product is P1.

### Cohort lifecycle and support

```text
Draft → Recruiting → Invited → Active → Completed
                    │          │   ├→ At risk → Active
                    │          │   ├→ Withdrawn
                    │          │   └→ Removed for safety/integrity reason
                    └→ Waitlisted/Declined

Completed/Withdrawn/Removed → Cohort closed → Retention policy applied
```

- Admission uses published criteria: target-user fit, weekly availability, laptop access, basic connectivity, consent, and cohort capacity. It does not use protected traits or ability to pay.
- Invitations expire after seven days unless extended. Waitlisted learners receive a clear date by which a place may open.
- Learning deadlines are restart-friendly. A missed learning deadline does not erase progress; partner capstone deadlines are labeled separately.
- Seven days without activity triggers an automated check-in. Fourteen days triggers optional human outreach. Learners can pause or withdraw without losing already-earned private proof.
- Cohort completion means the learner completed the capstone proof cycle. Participation and foundation-mission completion are recorded separately.
- Support has a named cohort manager and one visible channel. Requests are acknowledged within one business day; mission-blocking issues target two business days; privacy or safety incidents are triaged the same day.
- The cohort manager may intervene manually when onboarding, tools, uploads, feedback, or opportunity records block progress. Every intervention is tagged so recurring friction becomes product work.

### Employer design-partner commitment

Each partner should agree to:

- review the proposed mission rubric;
- identify skills that matter for a real entry-level role;
- name the person responsible for reviewing at least five anonymized proof packets;
- record whether each signal helped a hiring decision;
- return structured feedback within five business days;
- run at least one real or simulated screening exercise during the pilot;
- interview qualified consenting candidates when a suitable opening exists;
- explain false positives and false negatives.

These commitments should be recorded in a signed pilot letter before learner recruitment. An employer logo without these behaviors is sponsorship, not product validation.

### Reviewer operations and capacity

For planning, assume 40 learners × 3 missions × 1.3 attempts × 20 review minutes, or roughly 52 review hours, plus calibration and support. Three reviewers over eight weeks can cover this only if each reserves about three hours per week and the reviewer lead carries escalation capacity.

- Foundation feedback target: three business days
- Capstone feedback target: five business days
- Maximum assigned backlog: ten pending attempts per reviewer
- Backlog breach: reassign work or pause new submission deadlines; never silently extend turnaround
- Conflict rule: reviewers cannot evaluate work they authored, substantially coached, or will assess as an employer without switching to the contextual employer label
- Calibration: reviewer lead samples at least 20% of early reviews, then at least 10% after agreement stabilizes
- Calibration meeting: weekly or every 20 completed reviews, whichever comes first
- Shadow AI: run on the same evidence, compare by rubric criterion, and keep results internal until a bilingual gold-set threshold is met
- Unsupported, unsafe, or inconclusive automated checks route to human review with a named failure reason

### Pilot success gates

These are initial hypotheses and should be calibrated after the first cohort:

| Area | Suggested gate |
|---|---|
| Activation | At least 60% of accepted learners reach a personalized Today view |
| First value | Median time to first useful next action under 15 minutes |
| Mission engagement | At least 40% start a proof-producing mission |
| Proof completion | At least 25% of accepted learners complete the capstone proof cycle |
| Feedback usefulness | At least 70% say feedback told them what to improve next |
| Trust | At least 3 employer partners complete structured ratings and at least 5 proof packets receive employer review |
| Opportunity quality | At least 95% of displayed deadlines and eligibility details remain accurate |
| Safety | Zero public exposure of private learner evidence without explicit consent |

Do not use hiring count as the only pilot verdict. Open roles and macroeconomic conditions are outside the product’s control. Measure whether Lan Pya creates better evidence and better decisions, then track interviews and hires as outcome signals.

## 7. Metrics

### North-star metric

**Successful Proof Cycles per month**

A successful proof cycle means a learner submits real work, receives an evaluation, improves or accepts the result, and adds the evidence to their Proof Profile.

### Outcome metric

**Proof-to-opportunity conversion**

The percentage of learners with relevant proof who receive an interview, challenge invitation, internship, freelance engagement, scholarship step, or other verified opportunity outcome.

### Funnel

```text
Visited
  → Completed onboarding
  → Received starting point
  → Started first mission
  → Submitted evidence
  → Received useful evaluation
  → Added proof privately
  → Optionally enabled sharing
  → Viewed relevant opportunity
  → Took opportunity action
  → Received real-world outcome
```

### Guardrails

- evaluation cost per submission;
- evaluation turnaround time;
- automated-review disagreement rate against expert review;
- false-positive trust signals;
- opportunity correction and expiry rate;
- appeal rate and resolution time;
- learner data deletion/export completion;
- performance on low-end mobile devices;
- page weight and failed upload rate;
- completion gaps by language, gender, device, and connectivity context.

### Metric dictionary

| Metric | Population and window | Numerator | Denominator / exclusions |
|---|---|---|---|
| Accepted learners | One named cohort | Learners who accept, consent, and reach active status by cohort start | Excludes declined and waitlisted people |
| Activation rate | Accepted learners, first 7 days | Reached a valid starting point and saw the Today recommendation | All accepted learners; report withdrawals separately |
| Mission-start rate | Accepted learners, full cohort | Created or opened an editable first-mission draft | All accepted learners |
| Successful proof cycle | Active learners, calendar month and cohort-to-date | Submission received valid evaluation and evidence was added privately | Excludes withdrawn submissions and invalid/test accounts |
| Feedback usefulness | Learners receiving feedback, within 48 hours of response | Rated feedback useful or identified a concrete next improvement | All feedback recipients who were shown the prompt; non-response reported |
| Proof-to-opportunity conversion | Learners with criterion-relevant proof, within 90 days | Received a verified interview, challenge, placement, scholarship step, or paid engagement | All eligible proof holders; self-claimed outcomes reported separately |
| Opportunity accuracy | Listings displayed during active cohort | Listings whose deadline, eligibility, source, and status pass re-check | All displayed listings; inaccessible sources count as unverified, not accurate |
| Review turnaround | Each submitted attempt | Time from valid submission to feedback-ready | Excludes time paused for learner-supplied missing evidence, reported separately |

Metric events use stable cohort, learner, mission-version, submission-version, rubric-version, opportunity, and partner identifiers. Dashboard labels must show the date window and denominator rather than presenting context-free percentages.

Avoid optimizing MAU, streak length, badge count, or time spent in the app without evidence that those metrics produce proof or opportunity outcomes.

## 8. Business Model Recommendation

### Pilot principle

The core learner journey should be free during validation. Introducing payment before proving outcomes would make access and product-value signals harder to interpret.

### Recommended revenue order

1. **Employer design partnerships and hiring access**: employers pay for structured access to evidence-backed candidates, partner missions, and hiring support.
2. **Sponsored cohorts**: NGOs, companies, universities, and development organizations fund learner seats, reviewers, and track operation.
3. **Institution dashboards**: cohort progress and aggregate outcome reporting, with strong privacy limits.
4. **Clearly labeled sponsored opportunities**: payment affects placement visibility, never eligibility or trust score.
5. **Expert-review services**: funded by a sponsor or employer by default; optional learner-paid review can be tested only if it does not create pay-to-win verification.
6. **Assessment and proof infrastructure**: later API or enterprise product after employer trust has been demonstrated.

### What not to launch yet

- 10% salary success fees charged ambiguously at hire;
- paid “priority applications” that undermine fairness;
- a Career+ subscription dependent on scarce mentor time;
- unlimited AI usage without cost controls;
- data-insight sales before privacy governance and sufficient scale;
- fixed annual forecasts based on untested conversion assumptions.

The prices in the business-model source should be treated as interview hypotheses. The current forecast mixes revenue assumptions that do not yet have validated demand or consistent unit economics.

### Monetization decision still required

The source pack contains an unresolved conflict between student subscriptions and a “students never pay” principle. The recommended interim policy is:

> **Core navigation, missions, feedback, proof, and opportunity access remain free to learners during the pilot. Long-term optional services are tested only after B2B and sponsored-cohort willingness to pay is measured.**

## 9. Go-to-Market

### Wedge strategy

Recruit cohorts through communities that already contain the initial user:

- university computer-science clubs;
- GDG and developer communities;
- bootcamps and training centers;
- hackathon organizers;
- youth-focused NGOs;
- employers hiring interns and junior developers.

### Launch motion

1. Recruit employer design partners before recruiting the full learner cohort.
2. Co-design one capstone and its rubric with those employers.
3. Recruit learners through two trusted communities.
4. Run a visible “Proof Sprint” cohort around the capstone.
5. Publish anonymized before-and-after work and outcome stories with consent.
6. Convert successful partners into sponsored cohorts or hiring subscriptions.

### Why cohort-first

A cohort provides deadlines, support, observation, and concentrated proof supply. It also lets the team manually solve opportunity and review gaps before encoding the wrong workflow in software.

### Distribution principle

Build sharing into the output, not just the marketing page. A learner should be able to share a small Proof Packet through messaging apps, as a link, and as a lightweight PDF. The recipient should understand the project and evidence without creating an account.

## 10. Experience Architecture

### Learner navigation

```text
Today       Roadmap       Proof       Opportunities       Profile
  │            │            │               │                │
next action  full path   evidence       ready/gaps       preferences
resume task  milestones  share/export   deadlines        privacy
```

### Emotional journey

```text
“I am lost”
   ↓ clarity
“I know where I am”
   ↓ focus
“I know what to do next”
   ↓ effort
“I made something real”
   ↓ feedback
“I know what is good and what to fix”
   ↓ proof
“I can show this to another person”
   ↓ connection
“I have a realistic next opportunity”
```

### Required interface states

Every primary feature must define:

- loading;
- empty;
- partial or interrupted;
- error;
- success;
- stale information;
- offline or reconnecting;
- first-time and returning-user states.

### Recommendation decision rules

Starting-point placement uses this precedence:

1. reviewed practical evidence;
2. practical micro-task result;
3. deterministic knowledge check;
4. self-reported experience.

If signals disagree, use the lower supported placement and offer a visible “test into the next level” action. A skipped, failed, timed-out, or inconclusive diagnostic defaults to foundations without presenting the result as failure. The explanation names the evidence used, the missing evidence, and how the learner can change placement.

The Today recommendation uses this order:

1. unresolved upload, evaluation, privacy, or correction blocker;
2. resume an in-progress mission;
3. act on a `Ready now` opportunity closing within seven days;
4. complete the next required mission criterion;
5. start the next milestone mission;
6. review feedback or choose a new weekly goal.

The learner may dismiss or replace a recommendation. The system records the reason and must not repeatedly force a dismissed item unless its deadline or safety status materially changes.

Opportunity readiness is rule-based in P0A:

- `Ready now`: all published mandatory skill tags are supported by current evidence and all known non-skill eligibility requirements match learner-confirmed data.
- `Build toward`: the opportunity is career-relevant and at least one missing mandatory skill maps to an available mission.
- `Explore`: relevance exists but eligibility is unknown, distant, or cannot yet map to a Lan Pya action.
- Unknown information remains visible as **Unknown**. The system does not infer sensitive traits or silently treat unknown as ineligible.

### Mission and submission state machine

```text
Available → Draft → Uploading → Submitted → Validating → In review
              │        │            │            │          │
              └→ Withdrawn    Upload failed  Invalid     Feedback ready
                                                          │          │
                                                  Meets standard   Revise
                                                          │          │
                                                    Proof added  New version
                                                          │          │
                                                          └────┬─────┘
                                                               └→ Correction/appeal
```

- A submission version becomes immutable when submitted. Link or artifact changes create a new version.
- Validation failures name the missing or unsafe input and preserve the draft.
- Repeated submit actions return the existing submission rather than creating duplicates.
- Rubric changes never mutate an evaluation already issued; re-evaluation names the new rubric version.
- Learners may withdraw before employer sharing. Audit records remain according to the retention policy.

### Evaluation semantics

Each rubric criterion has one result: `Met`, `Partially met`, `Not yet met`, or `Not evaluated`. Required and optional criteria are labeled in the published mission.

- `Meets standard` requires every required criterion to be `Met` under the stated evaluator tier.
- `Partially met` evidence may appear privately as developmental work but cannot carry a “meets standard” claim.
- Low-confidence, unsupported, unsafe, or technically inconclusive automated results become `Not evaluated` and route to a reviewer.
- Every non-deterministic finding cites the artifact location or observable behavior that supports it.
- Confidence helps route review; it never compensates for a failed required criterion.

An **Employer endorsement** means: “This named employer reviewed this evidence for a named role or mission context on this date and found the listed criteria relevant or satisfied.” It is not a general employment guarantee. The display includes context, issuer, date, criteria, expiry if any, and revocation state.

### Accessibility and language

- Burmese and English labels for career vocabulary
- Plain-language explanations before technical terms
- Keyboard navigation and visible focus
- Screen-reader labels and semantic headings
- Text/icon labels in addition to color
- Minimum comfortable touch targets
- Captions or transcripts for video resources
- No required long-form typing on mobile

### Non-functional acceptance targets

| Area | P0A/P0B target |
|---|---|
| Core page weight | Under 750 KB transferred on first load, excluding learner artifacts and optional media |
| Performance | Primary content visible within 3 seconds on a mid-range Android device under simulated Fast 3G |
| Resilience | Draft text saved locally; uploads over 5 MB resumable; retries use the same submission identifier |
| Uploads | Documented type allowlist and 25 MB pilot limit per file; larger needs explicit support path |
| Browser support | Current and previous major Chrome, Firefox, Safari, and Android Chrome releases |
| Accessibility | WCAG 2.2 AA for primary learner and sharing flows |
| Availability | 99.5% monthly target during an active cohort, excluding announced maintenance |
| Evaluation | Deterministic result under 5 minutes when supported; human feedback follows Section 6 SLA |
| Recovery | A failed background evaluation is visible to operations and the learner; it never remains indefinitely “in progress” |
| Language | Mission briefs, required criteria, key feedback, consent, and primary navigation available in Burmese and English |

## 11. Verification Trust Model

### Evidence registry

Each trust claim should resolve to:

```text
Learner
  → Mission version
  → Submitted artifacts
  → Automated checks
  → Rubric criteria
  → Evaluation result
  → Evaluator type and identity policy
  → Timestamp
  → Revision history
  → Appeal or re-review state
```

### Non-negotiable safeguards

- Never label unevaluated completion as verified.
- Never hide the evaluator type.
- Never show only an aggregate score when criterion-level results exist.
- Never let payment increase a trust result.
- Never make learner artifacts public by default.
- Never allow AI feedback to make final high-stakes hiring decisions.
- Record model and rubric versions so past evaluations can be understood.
- Sample automated reviews for expert calibration.
- Let learners contest factual evaluation errors.

### Fraud and AI-assisted work

Do not pretend AI use can be eliminated. Ask learners to disclose how tools were used, include short decision reflections, and use follow-up questions to test understanding. Evaluate whether the learner can explain, modify, and defend the work, not whether every character was typed without assistance.

For sampled capstones or higher-trust claims, add version history and a short live or recorded defense using a randomized follow-up change. Plagiarism or similarity checks may inform review where lawful, but never produce an automatic fraud verdict. Claims state their limits explicitly.

### Artifact and AI safety

- Never execute learner code inside the web application, API process, or a privileged shared worker.
- Fetch repositories and websites through isolated, disposable workers with CPU, memory, time, file-size, and network-egress limits.
- Allowlist supported repository hosts, frameworks, file types, and automated checks for P0A.
- Scan uploaded files and URLs before preview; render risky content as text or a safe image rather than active HTML.
- Block private-network destinations, redirect loops, oversized downloads, trackers in previews, and known-malicious URLs.
- Treat repository text, webpages, comments, and files as untrusted data. They cannot override system instructions or evaluation rubrics.
- Separate tool outputs from AI instructions, require structured responses, validate every field, and fail closed to human review.
- Moderate public text and imagery, provide reporting, and preserve safety evidence with restricted access.
- Name failures such as `UnsupportedRepository`, `ArtifactFetchTimeout`, `MalwareDetected`, `UnsafeURL`, `EvaluationSchemaInvalid`, and `EvaluationInconclusive` so none are swallowed as generic review failure.

Before learner-visible AI evaluation, build a bilingual gold set of at least 30 representative submissions. Recommended release gates are at least 85% expert agreement at criterion level, no high-confidence false pass on a safety-critical required criterion in the gold set, and reviewer approval of Burmese factual meaning and actionability. Until the gate passes, AI remains shadow or developmental feedback.

### Privacy and retention baseline

| Data | Access | Pilot retention/default |
|---|---|---|
| Account and profile | Learner and authorized support | While active; deletion completed within 30 days of verified request |
| Raw diagnostic responses | Learner and restricted product operations | 12 months or earlier deletion; derived placement stored separately |
| Private artifacts and evaluations | Learner, assigned reviewers, restricted support | While account is active or until learner deletes; partner access requires explicit share |
| Employer share token | Named or link-authorized recipient | Expires after 30 days by default; learner can revoke immediately |
| AI request/response | Restricted evaluation operations | Minimum feasible vendor and application retention; no provider training where contract controls allow |
| Consent history | Restricted privacy/audit access | Three years after account closure, subject to legal review |
| Privileged audit logs | Security and designated administrators | 12 months |
| Encrypted backups | Infrastructure operators only | Rolling maximum of 90 days; logically deleted data is not restored to active use |

Consent withdrawal stops future optional processing and sharing. Public-link revocation takes effect immediately. Employer access is time-bounded and logged. The subprocessor list, transfer locations, breach contacts, and any legally required notices must be published before open launch. A privacy or security incident triggers same-day triage, containment of shares and credentials, evidence preservation, impact assessment, and notification according to applicable obligations.

## 12. Track Expansion Model

New tracks should fit a shared structure:

```text
Career track
  → outcomes
  → milestones
  → skills
  → missions
  → evidence types
  → rubrics
  → verification methods
  → opportunity requirements
```

The evidence and verification methods must vary by discipline:

| Discipline type | Likely evidence | Likely verification |
|---|---|---|
| Software | Repositories, deployed work, tests | Automated checks + expert review |
| Creative/media | Images, video, campaign artifacts | Rubric + expert/client review |
| Business | Cases, spreadsheets, campaign results | Rubric + expert/employer review |
| Civil/architecture | Drawings, models, project documentation | Maintainer/expert review |
| Skilled trades | Photo/video, practical observation, supervisor sign-off | Qualified partner assessment |
| Healthcare | Credentials, supervised hours, regulated assessment | Authorized institution only |

### Recommended expansion sequence

1. Frontend Developer
2. Creative & Media or Digital Marketing, selected using demand and partner readiness
3. Civil Engineering or Architecture, using existing team research and qualified reviewers
4. Digital & Gig Economy
5. TVET pilot with an institutional partner

Do not expand based only on user interest. A track is ready when Lan Pya has credible outcomes, mission content, verification capacity, and relevant opportunity supply.

## 13. Roadmap

### Required team and capacity

The schedule assumes at least:

- Product/operations lead: 1.0 FTE through pilot
- Product engineer: 1.0–2.0 FTE after Phase 0 readiness
- Track/content owner: 0.75–1.0 FTE through mission validation and cohort
- Burmese language owner: 0.25–0.5 FTE
- Reviewer lead: 0.25–0.5 FTE plus three reserved reviewers
- Employer/partner lead: 0.5 FTE until signed commitments and feedback are complete
- Privacy/security owner: named accountable person, with specialist review before open launch

One person may hold multiple compatible roles, but the plan cannot assume that partnership recruitment, localization, content design, learner support, reviews, and engineering all happen “for free” beside coding. If these roles or reviewer hours are unavailable, reduce cohort size or extend the schedule.

### Phase 0: Partner and pilot readiness, weeks 0–3

- Confirm initial cohort and Frontend track
- Interview 10–15 learners
- Secure signed letters from 3–5 employer design partners with named reviewers and feedback dates
- Validate three mission rubrics, including one partner-authored or partner-approved capstone
- Curate and re-check 15–25 opportunities
- Test one web Proof Packet and one lightweight PDF with learners and employers, then select one
- Confirm team capability and technology choice
- Confirm laptop access, reviewer capacity, support ownership, privacy baseline, and artifact-safety approach

**Go/no-go gate:** accountable owners and reviewer hours are assigned; at least three employer letters are signed; three rubrics pass learner and employer review; the chosen proof format is understandable without a Lan Pya account; and no unresolved privacy or artifact-execution blocker remains.

### Phase 1: Concierge proof-loop pilot, weeks 4–10

- Invite-only authentication and consent
- Fixed Frontend path with three placement branches
- Today recommendation using explicit P0A rules
- Three versioned missions and resumable submission
- Manual rubric evaluation plus deterministic checks
- Internal shadow-AI comparison on the bilingual gold set
- Private Proof Profile and one selected sharing format
- Fifteen to twenty-five manually tagged opportunities with simple readiness states
- Structured-file or minimal-form content operations
- Named learner support, reviewer operations, and essential event tracking

**Exit gate:** at least 25% of accepted learners complete the capstone proof cycle; at least five proof packets receive employer review; three partners return structured trust feedback; and the team can name the largest learner, review, safety, and opportunity failure modes from operational data.

### Phase 2: Scalable proof-loop MVP, months 3–5

- Build the P0B account, diagnostic, roadmap, Today, submission, proof, opportunity, and internal-operations surfaces
- Productize versioning, audit logs, privacy controls, safe artifact workers, and failed-evaluation recovery
- Release learner-visible AI feedback only if the gold-set gate passes
- Add scalable factual correction, appeal, and re-review
- Run a second managed cohort on the same track
- Measure automated-versus-expert agreement and reviewer capacity

**Exit gate:** the second cohort runs without spreadsheet-only recovery for core flows, trust gaps are visible and recoverable, and quality does not decline as manual effort falls.

### Phase 3: Trust and revenue repeatability, months 6–8

- Productize employer proof-packet review and candidate invitation
- Add partner-authored missions and contextual employer endorsements
- Track applications, interviews, and verified outcomes
- Improve opportunity intake, re-checking, correction, and expiry operations
- Run the first paid employer or sponsored-cohort experiment
- Validate direct cohort costs, reviewer load, partner effort, and repeat willingness to pay

**Exit gate:** multiple employers use proof in real or simulated screening decisions, explain false positives and false negatives, and at least one repeatable revenue channel shows credible willingness to cover direct cohort costs.

### Phase 4: Second track and inclusion preparation, months 9–12

- Launch one second track through the shared model only after its readiness checklist passes
- Add the minimum institution cohort reporting needed by a paying sponsor
- Low-bandwidth and partner-facilitated improvements
- Pilot one non-code evidence type with qualified reviewers
- Explore sponsored access for caregiving and rural youth
- Prepare, but do not publicly launch, a TVET or field-evidence pilot without a qualified institution
- Decide whether migration safety guidance warrants a separate product and duty-of-care program

**Exit gate:** the second track launches without bespoke product reconstruction, and any inclusion expansion has a credible verification and distribution partner, not only content.

## 14. Product Experiments

| Experiment | Question | Minimum evidence |
|---|---|---|
| Manual starting-point review | Does personalization improve first-mission starts? | Compare starts against a generic beginner path |
| Today view | Does one recommendation reduce roadmap paralysis? | Higher next-action completion than full-roadmap entry |
| Proof packet test | Do employers find evidence more useful than a CV alone? | Structured ratings from at least three employers |
| Readiness gaps | Does showing gaps motivate action without discouraging users? | Opportunity saves and related mission starts |
| Automated/expert calibration | Can automated review support, rather than fake, trust? | Agreement by rubric criterion and documented failure cases |
| Weekly momentum | Is flexible progress more sustainable than daily streaks? | Return and completion without shame-driven drop-off |
| Sponsored cohort | Will an institution fund learner outcomes? | One paid or signed pilot commitment |

## 15. Risks and Mitigations

| Risk | Why it matters | Mitigation |
|---|---|---|
| AI verification is not trusted | The central promise collapses | Transparent evidence, rubric, tiers, expert calibration |
| Too many tracks | Content and verification quality decay | Track readiness gate and one-track pilot |
| Opportunity data becomes stale | Users miss deadlines and lose trust | Source links, last-checked state, expiry workflow, reporting |
| Employer cold start | Proof has no audience | Recruit design partners before learner cohort |
| Learner cold start | Empty opportunities and weak support hurt retention | Managed cohort and curated supply |
| High AI cost | Free access becomes unsustainable | Deterministic checks first, bounded models, caching, quotas |
| Weak connectivity | Core users cannot complete work | Lightweight pages, resumable uploads, compressed proof packets |
| English barrier | Users misunderstand career requirements | Burmese-first explanations with bilingual vocabulary |
| Gamification becomes manipulative | Activity replaces outcomes | Reward proof and improvement, not app time |
| Pay-to-win perception | Trust and equity are damaged | Separate payment from verification outcomes and opportunity access |
| Privacy exposure | Young people may reveal sensitive evidence | Private defaults, granular sharing, export/delete, audit logs |
| Marketplace scope creep | Team builds recruiting software before trust | Partner proof-packet workflow before public marketplace |

## 16. Better-Way Brainstorm

These ideas strengthen the strategy but should be added only when their phase is ready.

### Strong additions

1. **Reverse opportunity mapping**: open an opportunity and see the exact missing proof plus the missions that can close the gap.
2. **Employer-authored missions**: employers contribute realistic entry-level briefs, then inspect submissions from consenting learners.
3. **Proof Sprint cohorts**: time-boxed community events where learners complete one strong project instead of collecting more certificates.
4. **Comeback mode**: after inactivity, show a gentle restart plan instead of a broken streak and accumulated shame.
5. **Evidence portability**: lightweight PDF and public link that work without a Lan Pya account.
6. **Bilingual skill dictionary**: explain the relationship between Burmese descriptions, English job-post terms, and concrete evidence.
7. **Trust calibration dashboard**: internal comparison of automated and expert judgments by rubric criterion.
8. **Opportunity health score**: internal freshness and completeness score, never confused with learner eligibility.
9. **Sponsor-a-cohort model**: organizations fund a defined learner group, track, reviewer pool, and outcome report.
10. **Track readiness checklist**: prevents marketing a discipline before evidence, reviewers, and opportunity supply exist.

### Ideas to defer deliberately

- AI chatbot as the main interface
- social feed
- follower counts
- public leaderboards
- daily-streak pressure
- certificates without evidence
- generic course marketplace
- resume keyword scoring as a core product
- automated candidate rejection
- global expansion before repeatable Myanmar cohorts

## 17. Key Product Decisions

### Settled for this plan

- Strategy: focused proof loop
- Initial product loop: Choose → Build → Prove → Connect
- Initial audience: reachable Myanmar students, graduates, and self-learners seeking entry-level digital work
- Initial scope: one complete career track, rather than many partial tracks
- Working track recommendation: Frontend Developer, pending Phase 0 confirmation
- Opportunities: visible with readiness states, not hidden behind locks
- Verification: evidence-backed tiers, not one opaque AI badge
- Launch: managed cohort with employer design partners
- Expansion: shared track model, discipline-specific evidence adapters

### Recommended defaults requiring team confirmation

- Core learner journey is free during the pilot
- Frontend is the first track
- Student premium subscriptions are deferred until value and access effects are measured
- Employer/sponsor revenue is tested first
- Navy and teal form the brand base; verification states use explicit labels and icons, not color alone
- React + Laravel + MySQL remains the baseline only if it matches team expertise

### Still open

1. Who owns track content quality and rubric approval?
2. Which employers will commit to the design-partner behaviors?
3. What qualifications are required for an expert reviewer?
4. Which second track has both demand and verification capacity?
5. Will the long-term learner model be always-free or freemium?
6. Does the team have enough Laravel expertise to justify the specified split stack?
7. Which brand semantic system will be authoritative?

## 18. Technology Guidance

The source PRD specifies React, Tailwind, Laravel, MySQL, Sanctum, object storage, OpenAI/Gemini, Vercel, and Railway/Render. This is workable, but the product plan does not depend on it.

Use the specified stack if the team already operates React and Laravel confidently. If the implementation team is small and stronger in one language, evaluate a consolidated stack before coding. The correct choice minimizes deployment surfaces and operational burden while preserving:

- versioned track content;
- flexible evidence types;
- asynchronous evaluation;
- resumable uploads;
- explicit verification history;
- permissioned proof sharing;
- opportunity freshness;
- auditability and deletion.

Do not let a framework decision delay learner, employer, rubric, and content validation.

## 19. What Already Exists

This plan starts from substantial work rather than a blank slate:

- The project requirements define the broad user journey, functional modules, and proposed technology stack.
- The business-model document defines customer groups, initial pricing hypotheses, partner routes, costs, and risks.
- The design notes define onboarding, roadmap, submission, progress, opportunity, portfolio, employer, and admin surfaces, plus two competing color systems.
- The research context documents the scattered-information problem, student stages, opportunity sources, and early Civil Engineering and Architecture work.
- The career-track brainstorm maps expansion paths, underserved groups, verification fit, and the distinction between professional-track expansion and deeper inclusion.
- Established job platforms already aggregate employer demand. Lan Pya does not need to recreate listing volume before proving its evidence model.

The plan reuses these assets while narrowing their first release into one complete loop. The largest missing assets are validated missions, employer-calibrated rubrics, committed reviewers, fresh opportunity operations, and evidence that a partner will pay.

## 20. Source Synthesis and Strategic Corrections

| Source theme | Retained | Changed |
|---|---|---|
| Personalized roadmaps | Personal starting point and sequenced milestones | Today view emphasizes one next action |
| Missions | Real work and project submissions | Every mission has versioned evidence and rubric requirements |
| AI verification | Automated feedback remains important | Reframed as one transparent tier, not final truth |
| Portfolio | Shareable body of work | Reframed as an evidence-first Proof Profile |
| Opportunity unlocks | Progress informs relevance | Relevant opportunities stay visible with readiness gaps |
| Gamification | Progress and milestone recognition | Daily pressure and feature gating are removed from the core |
| Employer marketplace | Employer feedback and hiring outcomes | Public marketplace deferred until proof signal works |
| Broad career vision | Architecture supports varied tracks | Each expansion requires evidence, reviewer, and opportunity readiness |
| Student subscriptions | Kept as an unresolved hypothesis | Core pilot remains free; B2B/sponsor demand tested first |
| Brand concepts | Trust, direction, and semantic clarity retained | One accessible semantic system must replace conflicting color rules |

## 21. External Context

- UNDP’s 2025 Myanmar youth findings show that the long-term need extends far beyond university STEM users, especially toward rural, caregiving, vocational, and excluded youth. This supports the broad mission but also makes a partner-led inclusion strategy necessary: <https://www.undp.org/asia-pacific/press-releases/myanmars-youth-on-hold-education-and-employment-crisis-deepens-warns-undp>
- The World Bank reported that only 44% of Myanmar’s population was online in January 2025 and highlighted affordability, power, and access constraints. This makes low-bandwidth, resumable, mobile-first behavior a core requirement: <https://documents1.worldbank.org/curated/en/099120625204042781/pdf/P507203-7c4662b6-c1d8-4c3c-9b0c-d4835f2763cb.pdf>
- JobNet already operates an established Myanmar job and recruitment platform. Lan Pya should integrate with or complement job supply rather than competing first on listing volume: <https://www.jobnet.com.mm/my/about-us>
- Current proof-of-work hiring products emphasize real execution evidence rather than resume keywords and static assessment. Lan Pya’s opportunity is to adapt this principle to entry-level Myanmar talent with transparent, developmental progression: <https://www.skillsproject.ai/>

## 22. Immediate Next Actions

1. Confirm the recommended defaults in Section 17.
2. Recruit three employer design partners and two learner-distribution partners.
3. Conduct 10–15 learner interviews and 5 employer interviews.
4. Write and test the first six Frontend missions and rubrics.
5. Prototype the Today view, mission submission, evaluation result, Proof Profile, and readiness-tagged opportunity flow.
6. Run a manual Proof Packet test before implementing the full employer dashboard.
7. Lock the verification vocabulary, public/private defaults, and appeal policy.
8. Review architecture and implementation sequencing only after the operating model passes these tests.

## 23. NOT in Scope

- Building all career tracks at launch
- Public social networking
- Mentor and freelance marketplaces
- Native mobile applications
- Automated high-stakes hiring decisions
- Migration guidance without legal and safety partners
- Selling individual learner data
- Pay-to-win verification or application priority
- A full learning-content library
- Replacing established job boards as the initial strategy

## 24. Dream State Delta

```text
CURRENT
Scattered guidance, generic learning, self-claimed skills, missed opportunities
   ↓
THIS PLAN
One complete Frontend proof loop with transparent evidence and partner calibration
   ↓
12-MONTH IDEAL
A reusable career-path and evidence platform supporting multiple disciplines,
trusted by learners, reviewers, institutions, and employers
```

## 25. Hackathon Prototype Plan — 20 August 2026

### Pitch objective

Demonstrate one complete transformation in under four minutes: a Myanmar learner moves from uncertainty to a clear next step, submits real work, receives transparent developmental feedback, creates portable proof, and understands which opportunity is ready now versus what must be built toward.

### Prototype boundary

- One working track: Frontend Developer.
- One primary persona: a Myanmar university student or self-learner.
- One complete mission: a responsive student profile card.
- One deterministic prototype evaluation with an explicit “not expert verification” label.
- One private Proof Profile with evidence, rubric version, evaluator type, and sharing control.
- Five realistic demo opportunities across Ready now, Build toward, and Explore.
- Device-local persistence only; no production identity, upload, messaging, or employer backend.

### Four-minute demo script

1. **Problem — 25 seconds:** Career advice, courses, proof, and opportunities are scattered. Young people can stay busy without knowing the next useful move.
2. **Choose — 35 seconds:** Complete the short starting-point flow or open the ready-made Thiri demo. Show why placement is explainable and challengeable.
3. **Build — 45 seconds:** Open the current mission. Highlight the real scenario, outcome requirements, public rubric, private evidence controls, and human fallback.
4. **Prove — 75 seconds:** Submit a live link and reflection. Run the clearly labeled prototype review, inspect criterion-level feedback, and add the result privately to the Proof Profile.
5. **Connect — 45 seconds:** Open opportunities. Compare Ready now with Build toward, show visible gaps, and route the learner to the nearest mission instead of hiding the opportunity.
6. **Close — 15 seconds:** “Lan Pya does not promise a job from a score. It helps a learner build proof that makes the next opportunity more credible.”

### Demo readiness checklist

- Production build and lint pass without errors.
- Desktop path tested end to end.
- 390px mobile layout has no page-level horizontal overflow.
- Ready-made demo can be restored in one click.
- All primary buttons either complete a real local action or clearly explain their prototype boundary.
- Evaluation, privacy, opportunity freshness, and demo-data trust labels remain visible.
- A hosted URL and offline backup are available before pitch day.

### Aug 11–20 execution sequence

| Date | Focus | Exit condition |
|---|---|---|
| Aug 11–12 | Lock product story and interactive flow | One coherent Choose → Build → Prove → Connect prototype |
| Aug 13 | Mobile and accessibility pass | No critical responsive or keyboard blockers |
| Aug 14 | Opportunity and proof content polish | Demo content feels locally plausible and honestly sourced |
| Aug 15 | Pitch narrative and screenshots | Four-minute script plus backup visual walkthrough |
| Aug 16 | First timed rehearsal | Demo consistently finishes under four minutes |
| Aug 17 | External feedback | At least three learners/builders identify the core value without prompting |
| Aug 18 | Freeze features | Only reliability, copy, and layout fixes after this point |
| Aug 19 | Venue rehearsal and backups | Hosted app, local app, screen recording, and static deck all ready |
| Aug 20 | Hackathon pitch | Lead with learner transformation; close with partner-pilot ask |

### Pitch ask

Ask for three partners rather than generic applause: one youth-distribution partner, one frontend reviewer or training partner, and one employer willing to calibrate a mission and review the resulting proof packets.
