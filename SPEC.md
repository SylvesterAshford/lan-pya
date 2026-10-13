# SPEC: Mission review that actually finishes

Status: approved and built · 2026-10-13 · v0.28.0.0
Source: `/plan-ceo-review` (HOLD SCOPE) + `/agent-skills:spec`, decisions D1 to D8 below.

## 1. Objective

A learner submits mission work and then waits forever. The human review pipeline exists end to end in the database, but **no account holds a reviewer role** (production on 2026-10-13: 8 learners, 0 reviewers, 0 admins). All three real submissions have been stuck for more than a day (2 `human_review_queued`, 1 `automated_inconclusive`). The only verified missions are the two seeded demo ones.

The goal is that every submission reaches an honest end state, without breaking the product rule that **automated checks never create verified proof** (`docs/product/LAN_PYA_CAREER_QUEST_PLAN.md` lines 380 to 383).

**Users**
- *Learner (Myanmar student, often on a phone):* submits two links and a reflection. They need to see progress straight away and to know exactly what happens next.
- *Reviewer (the founder for now):* needs a queue, a real rubric and a single decision.
- *Employer viewing proof:* must be able to trust that "Verified" means a person applied the rubric.

**Success looks like**
- Submitting with working links moves the trail map forward within a minute, with the label **Completed · awaiting review**.
- A broken link sends the learner back to Submit, naming the failing link, and never reaches a reviewer.
- The founder signs in and sees a Review link. They score the same criteria the learner saw in step 2 and choose Verify, Request changes or Reject.
- Verify creates the proof and the 100 XP, exactly as today. Nothing else creates proof or XP.
- The Submit card follows DESIGN.md: one heading, a consistent type scale, inline validation, and the shared footer.

## 2. Decisions (from the review)

| # | Decision | Choice |
|---|----------|--------|
| D1 | Manual or automatic review | **Two honest tiers.** The link check gives *Completed*; a human review gives *Verified*. |
| D2 | Review posture | Hold scope. Extras go to TODOS.md. |
| D3 | Which check results count as Completed | `pass`, `inconclusive` and `error` count as **Completed**. `feedback` (a broken link) sends the learner **back to step 3**. |
| D4 | What Completed unlocks | The trail map advances (`milestone_progress` gets source `checked`). **No XP, proof, level or readiness change.** |
| D5 | Reviewer outcomes after Completed | Request changes **keeps** the map position and reopens step 3 with notes. Reject **reverts only a `checked` milestone** and reopens step 3 with notes. |
| D6 | Who reviews | The founder's main account gets `reviewer_lead` + `admin` through a one-off SQL command run with approval. It is **never committed**, because the repo is public. |
| D7 | Fixes folded in | One shared rubric; a "Start review" button instead of claim-on-view; reviewer notes shown to the learner; backfill of the 3 stuck live submissions. |
| D8 | Submit card layout | A single column, with Back and Submit in the shared runner footer and a navy primary button. |

## 3. Behaviour

### 3.1 State machine

```
                         ┌────────── feedback (broken link) ──────────┐
                         ▼                                            │
 draft ─▶ submitted ─▶ deterministic_running ──▶ automated_feedback_ready ─┘ (learner resubmits)
                         │
                         │ pass │ inconclusive │ error
                         ▼
          human_review_queued / automated_inconclusive      ◀── milestone: complete, source=checked
                         │ reviewer presses "Start review"
                         ▼
                human_review_in_progress
            ┌────────────┼──────────────────┐
         verify    request_changes        reject
            ▼            ▼                  ▼
        verified   changes_requested     rejected
   proof + 100 XP   map kept, step 3     checked milestone reverted,
   source=proof     shows notes          step 3 shows notes, new attempt
```

Invalid transitions, and what prevents them:
- **A learner sets their own state:** prevented because only the service role runs `complete_evaluation`, and only reviewers run `record_review_decision`.
- **Self-review:** prevented by the existing `submission.user_id <> auth.uid()` check.
- **Verify without a claim:** prevented by the existing `submission not claimed` check.
- **Resubmitting while a submission is active:** `submit_mission` allows resubmission only from `changes_requested` and `automated_feedback_ready` (the second is new).
- **A checker downgrading a `proof` or `placement` milestone:** prevented by an upsert guard: `where milestone_progress.source = 'checked'`.

### 3.2 What the learner sees (one mapping, one place)

`learnerStatus(state)` in `lib/domain/mission-status.ts` replaces `stepFromSubmission`, and the runner, Today and Portfolio all read it.

| Submission state | Runner step | Learner sees |
|---|---|---|
| none, `draft` | 1 to 3 (free) | The normal brief, build and submit steps |
| `submitted`, `deterministic_running` | 4 | **Checking your links.** "Usually under a minute." After 10 minutes: "Taking longer than usual. You can close this page." |
| `automated_feedback_ready` | 3 | A warning block naming each failed check (for example "Live site returned 404"), with the form prefilled from the draft |
| `automated_inconclusive`, `human_review_queued`, `human_review_in_progress` | 4 | **Completed · awaiting review.** A check list (Repository ✓ reachable / Live site: needs a human look), "A reviewer will score it against the 4 criteria from step 2. XP and Proof come with verification.", and a button: **Back to your trail map** |
| `changes_requested` | 3 | "Changes requested", with the reviewer's notes and per-criterion scores. The map is unchanged |
| `rejected` | 3 | "Not accepted", with the reviewer's notes. "Your map step was returned; start a new attempt when ready." |
| `verified` | 5 | As today: Verified, plus the View proof button |

After a successful submit, the form calls `router.refresh()` and the runner moves to step 4. Today it stays on step 3 until you reload.

### 3.3 Reviewer flow

1. The sidebar shows **Review · N** for `reviewer` and `reviewer_lead` (the link exists; the count is new).
2. The queue lists the mission, the learner's alias, the time it has waited, and the check outcome. Opening an item **does not claim it**.
3. The detail page shows the evidence, the reflection and the check observations, plus a **Start review** button (`POST /api/review/[id]/claim`).
4. Once claimed, the rubric shows **the mission's own step-2 deliverables** (title, weight, hint), each scored 0 to 4 with a visible legend (0 missing · 1 attempted · 2 partial · 3 meets · 4 exceeds). Notes are at least 20 characters. The decision is Verify, Request changes or Reject. Every decision needs all criteria scored; a missing score is named inline instead of a silently disabled button.
5. After the decision, the reviewer sees a confirmation and returns to the queue.

## 4. Data changes (one migration: `20261013170859_mission_completed_tier.sql`)

- **`milestone_progress.source` check:** add `'checked'`.
- **`complete_evaluation`:**
  - `feedback` maps to `automated_feedback_ready`, with no milestone change.
  - `pass` and `error` map to `human_review_queued`; `inconclusive` maps to `automated_inconclusive`. Each of these also upserts the mission's milestone as `complete` with `checked`, updating only an existing row whose source is `checked`.
  - Writes the audit event `submission.checked` or `submission.needs_fix`.
  - Applies only while the submission is `submitted` or `deterministic_running`, so a redelivered queue message can never pull reviewed work back into waiting (found while writing the tests).
- **`submit_mission`:** also accepts resubmission from `automated_feedback_ready`.
- **`claim_submission`:** unchanged in SQL. It is now called only from `POST /api/review/[id]/claim`, never on page render.
- **`get_review_submission`:** readable by any reviewer before claiming (RLS already allowed it), and also returns `state`, `claimed_by_me`, `claimed_by_other`, `screenshot_url`, `version` and the latest `observations`. It already returned `mission_key`; the Content Creator bug was the page's own criteria names not matching the brief.
- **`record_review_decision`:**
  - On `reject`: the mission's milestone goes back to `active` / `placement`, only if its source is `checked`. Some learners had an `active` placement row before Completed and some had none; `active` is correct for both, because it is the stage they are on.
  - On `request_changes`: no milestone change.
  - Rubric version text comes from the mission key, as today.
- **`get_reviewer_queue`:** adds `mission_key`, `waiting_since`, `check_outcome` and `claimed_by_me`, and keeps an item this reviewer has claimed (it used to vanish once claimed).
- **Learner read of feedback:** existing RLS already allows the owner to read `human_reviews` and `automated_evaluations`. New `getMissionFeedback(missionKey)` in `lib/data/app-data.ts` reads the latest of each.
- **Backfill:** the 3 live submissions in `human_review_queued` or `automated_inconclusive` get a `checked` milestone (D7). Idempotent, with `on conflict do nothing`.
- **No new enum values.** The migration is safe with the old app running: the old runner maps every new combination to step 4.

**Ops, not committed:** grant the founder's account `reviewer_lead` + `admin` with `insert into memberships ... select id from auth.users where email = $1`, run once through the Supabase connector after approval.

## 5. Commands

```
npm run dev                      # local, Turbopack (use port 3100 in worktrees)
npm run test:fast                # lint + typecheck + vitest
npm run test:db                  # pgTAP: supabase/tests/*.sql (needs local Supabase)
npm run test:functions           # deno tests for process-evaluations
npx playwright test --grep @critical   # throwaway config on :3100
```

## 6. Project structure (files this touches)

```
supabase/migrations/20261013170859_mission_completed_tier.sql   NEW
supabase/tests/mission_review_test.sql                          NEW pgTAP
lib/domain/mission-status.ts                                    NEW  learnerStatus(): one mapping
lib/domain/mission-briefs.ts                                    rubric = deliverables (single source)
lib/data/app-data.ts                                            getMissionFeedback, queue fields
lib/i18n/app-copy.ts                                            en + my copy for every new string
components/missions/mission-runner.tsx                          uses learnerStatus, step 4 states
components/missions/submission-form.tsx                         redesign, inline validation, refresh
components/review/review-action-form.tsx                        real rubric scoring
components/review/start-review-button.tsx                       NEW
app/api/review/[submissionId]/claim/route.ts                    NEW POST
app/api/review/[submissionId]/route.ts                          validate rubric keys against brief
app/[locale]/app/review/page.tsx, [submissionId]/page.tsx        copy to app-copy, no claim on GET
components/app/app-shell.tsx                                    Review · N count
app/[locale]/app/proof/page.tsx, components/proof/case-study-card.tsx   "Completed · awaiting review" label
app/globals.css                                                 .submit-* styles; drop .submission-note/gold use
tests/mission-status.test.ts, tests/submission-form.test.tsx, tests/review-action-form.test.tsx   NEW
DESIGN.md, CHANGELOG.md, VERSION, package.json                  decision rows + release
```

## 7. Submit card redesign (D8, DESIGN.md tokens only)

What changes, mapped to each problem in the screenshot:

| Problem | Fix |
|---|---|
| Three stacked headers ("STEP 3 OF 5 · SUBMIT", "SUBMIT REAL WORK", "Responsive Profile Card"), and the title repeated from the page h1 | One eyebrow (`STEP 3 OF 5 · SUBMIT`), one h2 "Send your work for review" (`--t-h2`), and one muted line of help (`--t-meta`) |
| Placeholders bigger and bolder than labels | Labels `--t-meta`/600; inputs `--t-body`/400; placeholders `--muted-ink`/400 |
| "(optional)" wraps onto its own bold line | A muted "Optional" on the same row as the label, aligned right |
| No help per field | A hint line under each label from the mission brief (`--t-label`, muted) |
| Native "Please fill out this field" tooltips | `noValidate`; inline errors under the field, `aria-invalid` + `aria-describedby`, focus on the first invalid field, and an error summary announced via `role="alert"` |
| The reflection's 40-character minimum is hidden | A live counter "12 / 40 min", with an error "Add 28 more characters." |
| Heavy grey "Before you submit" box | One muted line above the footer: "Link checks run first. A trained reviewer gives the final result." |
| "Draft saved on this device" floats mid-header | Moves to the footer's `.runner-saved` slot, as on step 2 |
| Full-width gold button with Back below a divider | The shared `.runner-foot`: `[← Back]` on the left, `[Submit for review →]` (navy, `button primary compact`) on the right |
| Burmese | The same hierarchy, `letter-spacing: 0` on headings, no truncation at 320px |

States: idle, typing (draft saves after 600ms), invalid (inline), submitting (button disabled, "Submitting…"), server error (`role="alert"` above the footer, draft kept), success (refresh to step 4).

## 8. Code style

- Match the surrounding code: server components fetch data and client components only handle interaction; `getAppCopy(locale)` for every string (no inline `my ? … : …` ternaries in new code); CSS tokens from DESIGN.md, never raw pixel or hex values.
- One mapping function per concept: `learnerStatus()` for states, and `brief.deliverables` for the rubric. If two places need the same table, they import it.
- SQL is `security definer` with `set search_path`, an explicit `revoke ... from public, anon` / `grant ... to authenticated|service_role`, and an audit event for every state change.
- Comments explain *why*, in the voice the repo already uses.

## 9. Testing strategy

| Layer | Test | Covers |
|---|---|---|
| Unit | `mission-status.test.ts` | Every `submission_state` maps to the step and copy key in 3.2; unknown states fall back to step 4 |
| Unit | `submission-form.test.tsx` | Inline errors, counter, focus on first invalid field, server error keeps the draft, success calls refresh |
| Unit | `review-action-form.test.tsx` | Renders the mission's own deliverables; Verify disabled until all are scored; sends the exact keys |
| API | the review route test | Rejects score keys that aren't in the brief (400); the claim route returns 403 for learners |
| DB (pgTAP) | `mission_review_test.sql` | `pass` makes the milestone `checked`; `feedback` doesn't; a checked milestone never overwrites `proof`; verify sets source `proof` + XP; reject deletes only `checked`; request_changes keeps it; a learner can't call `complete_evaluation`; Completed doesn't change `verified_count` or readiness; resubmit from `automated_feedback_ready` works |
| Function | `process-evaluations` deno test | The existing outcome mapping is unchanged |
| E2E `@critical` | Submit-step render plus inline validation, without submitting | No Supabase calls from the browser (an existing guard). It **never submits from the shared demo account** |
| Live, after deploy | Founder: claim and decide one demo-account submission | The full loop on production, done by hand once |

## 10. Boundaries

- **Always:** keep `tests/e2e/no-supabase-in-browser.spec.ts` green (all new calls go through `app/api/**`); write en and my copy together; take screenshots at 375px and 1280px in both locales before shipping.
- **Ask first:** running the reviewer-grant SQL on production; any data change beyond the 3-submission backfill; changing XP amounts.
- **Never:** let automated checks create proof, XP or a `proof` milestone; commit an email address or user id to the public repo; make the shared demo account a reviewer; submit work from the demo account in automated tests.

## 11. Error and rescue registry

| Codepath | What can go wrong | Handled by | User sees |
|---|---|---|---|
| `POST /api/submissions` | Invalid body | zod, then 400 | Inline field errors (the client validates first) |
| | Active submission exists | RPC exception, then 409 | "You already have an active review for this mission." |
| | Edge function ping fails | `.catch(null)`; the pg_cron recovery job runs every minute (confirmed active in prod) | Nothing. The check starts within about a minute |
| `process-evaluations` | URL timeout or redirect | `inconclusive` | Completed · a human will check that link |
| | URL 4xx/5xx | `feedback` | Step 3: "Live site returned 404" |
| | `complete_evaluation` fails | The message isn't archived; the queue redelivers it | Step 4 "Checking"; after 10 minutes, "Taking longer than usual" |
| `POST /api/review/[id]/claim` | Not a reviewer | 403 | Not reachable (the page is already a 404 for non-reviewers) |
| | Already claimed by someone else | `false`, then 409 | "Someone else is reviewing this." |
| `POST /api/review/[id]` | Score keys don't match the brief | 400 before the RPC | "Score every criterion." |
| | Not claimed or already decided | RPC exception, then 409 | "Already decided or not claimed by you." |
| Learner feedback read | No review yet | `null` | The step's default copy |

There are no critical gaps; every failure is either visible to the user or retried.

## 12. Deploy and rollback

1. Apply the migration (Supabase connector `apply_migration`). It's backward compatible, so the old app keeps working.
2. Merge the PR; Vercel deploys from master.
3. With approval, run the reviewer grant.
4. Verify on production: the demo learner sees "Completed · awaiting review" on a fresh submission (founder-driven); the founder sees Review · N, claims and decides; the 3 backfilled learners' maps advanced by one milestone; still 0 browser Supabase requests.

**Rollback:** use Vercel instant rollback to v0.27.3.0. The migration can stay (it's compatible); to remove it fully, a down-migration restores the old `complete_evaluation` and deletes the `checked` rows.

## 13. Not in scope (to TODOS.md if approved)

- **Email or push when a review finishes:** blocked; Supabase's built-in sender can't be customised and SMTP isn't set up.
- **A "play the reviewer" demo mode for pitches.**
- **Reviewer calibration examples** (fail / revise / pass) from the Career Quest plan.
- **XP ladder by mission type** (sampler 25, foundation 60, capstone 250): already in TODOS.md.
- **Appeals UI:** the `appeal_requested` state exists, but there's no flow for it.

## 14. Already exists (reused, not rebuilt)

The pgmq queue, the `process-evaluations` URL checker, the pg_cron recovery job, `claim_submission`, `record_review_decision` (proof, competencies, milestone and XP on verify), the review queue and detail pages, role-gated sidebar links, RLS for learners reading their own reviews and evaluations, the `in_review` Portfolio card state, and the runner's footer and `.runner-saved` slot.

## 15. Implementation tasks

- [ ] **T1 (P1, human ~4h / CC ~20m)** Migration + pgTAP: completed tier, reject rollback, resubmit from feedback, queue fields, backfill
- [ ] **T2 (P1, ~2h / ~10m)** `learnerStatus()` + runner step 4/3 states + refresh after submit
- [ ] **T3 (P1, ~3h / ~15m)** Submit card redesign (section 7) + inline validation + tests
- [ ] **T4 (P1, ~3h / ~15m)** Reviewer: Start review POST, rubric from the brief, key validation, Review · N, copy to app-copy
- [ ] **T5 (P2, ~1h / ~5m)** Portfolio "Completed · awaiting review" label; Today next-mission copy
- [ ] **T6 (P1, ops)** Reviewer grant for the founder (approval needed), then the live loop check
- [ ] **T7 (P2, ~30m / ~5m)** DESIGN.md decision rows, CHANGELOG, VERSION 0.28.0.0

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 1 | CLEAR | mode: HOLD_SCOPE, 0 critical gaps, 8 decisions |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 0 | — | — |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | — |

- **UNRESOLVED:** 0
- **VERDICT:** CEO CLEARED. The eng review is the remaining gate before shipping.
