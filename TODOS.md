# TODOS

Design debt deferred from the 2026-08-16 design review. Everything here was found, scoped, and consciously deferred past the 20 August pitch. Nothing here is unknown work.

---

## P2 — should land shortly after the pitch

### Real fork schema

**What:** Give the Yangon/Global track fork a database representation so a learner's track choice persists.

**Why:** The fork ships for the pitch as static configuration in `lib/domain/career-tracks.ts`. It renders and it is clickable, but it stores nothing. It is labelled as a preview, which is honest, but it cannot stay that way — the fork is the most distinctive idea in the design and it currently cannot remember an answer.

**Pros:** Unlocks the track-scoped roadmap filtering that Design Spec §3.3 describes, where the chosen branch renders full-colour and the other dims. Makes the Career Compass "help me choose" link functional.
**Cons:** Migration plus RLS policies plus seed content for both branches on at least one path. Not a small change.
**Context:** `Milestone` in `lib/domain/types.ts` has no branch concept. Needs a `track_branches` table, a `learner_track_choice` record, RLS, and an API route.
**Depends on:** Roadmap canvas rebuild landing first.

### XP weighting table is not implemented

**What:** Award the founder plan's per-action XP values rather than a flat 100 for every verified mission.

**Why:** `LAN_PYA_CAREER_QUEST_PLAN.md` specifies sampler 25, foundation 60, verified core 100, meaningful revision 20, verified capstone 250, weekly goal 10. `record_review_decision` awards a flat 100 regardless. Every mission is currently worth the same, so the ladder cannot distinguish a sampler from a capstone, and the 1,200 XP Trailblazer threshold is reachable only through twelve identical awards.

**Pros:** Makes the level thresholds mean what the plan says they mean. The numbers are already written down.
**Cons:** Needs a mission-type column (`sampler | foundation | core | capstone`) on `mission_definitions`, plus a migration to the award path and a backfill decision for existing rows.
**Context:** The ladder itself is already correct in `lib/domain/progress.ts`. This is purely about what feeds it.
**Depends on:** Nothing. Safe to do after the pitch.

### Capstone is not a distinct mission type

**What:** Give the Trailblazer gate a real capstone check instead of the current approximation.

**Why:** The plan gates Trailblazer on "one Partner Verified or Human Reviewed capstone plus four other Human Reviewed core missions". There is no capstone concept in the schema, so `progress.ts` approximates it as five verified proofs and says so in a comment. Honest, but it is not the documented rule.
**Depends on:** The mission-type column above. The two should land together.

### Weekly goals are specified but unbuilt

**What:** The optional weekly goal with a grace week, from the plan's "Weekly goals" section.

**Why:** It is the one part of the progress system that supports autonomy — the learner chooses the goal — and it is the only sanctioned use of a streak in the product (weekly rhythm, grace week, never coercive daily pressure). The design sketch included it; the implementation did not.
**Pros:** Small surface. One choice, one weekly reset, no leaderboard.
**Cons:** Needs a `learner_weekly_goal` table and a week-boundary rule that respects Asia/Yangon, which `lib/domain/deadlines.ts` already knows how to do.

### Demo XP counts but demo proof does not

**What:** Decide whether `career_quest_xp` should carry a `data_origin`, the way `proof_items` does.

**Why:** `verified_count` deliberately counts only `data_origin = 'live'` proof, so a demo account can never pass an evidence gate. But XP has no such distinction, so demo XP accumulates as real XP. The demo learner therefore climbs the XP axis and is frozen on the evidence axis. That is arguably the right behaviour, but it is currently an accident of two tables disagreeing rather than a decision anyone made.
**Pros:** Makes the live/demo boundary consistent across the whole progress system.
**Cons:** Requires deciding what a demo account's level should mean at all. Worth a conversation, not a quick fix.

---

### Email the learner when a review is decided

**What:** Send a short email when a reviewer verifies, requests changes on, or rejects a submission.

**Why:** Since v0.28 a learner sees "Completed · awaiting review" and is told they can close the page. Nothing brings them back when the decision lands, so verified proof and change requests sit unseen until the next visit.

**Pros:** Closes the loop the two-tier review opened. One template, three variants.
**Cons:** Blocked on custom SMTP. Supabase's built-in sender cannot use custom templates, and its links point at `supabase.co`, which is unreachable from Myanmar without a VPN.
**Context:** Hook the send into `record_review_decision` through a queued job (the same pgmq pattern as `evaluation_jobs`), not inline in the RPC. Links must go to Lan Pya's own domain.
**Depends on:** Custom SMTP, and ideally a custom domain.

### Reviewer calibration set

**What:** Fail, revise, and pass example submissions for each mission rubric, which reviewers score before their first real review.

**Why:** The Career Quest plan requires "named reviewers trained on calibration examples". The rubric now drives real scores (v0.28), but there is nothing to calibrate against, so two reviewers could score the same work differently.

**Pros:** Makes "Trained human reviewer" on a proof record literally true. Gives a second reviewer an onboarding path.
**Cons:** Content work: three examples times two missions, plus a small "calibration" mode on the review page.
**Context:** Rubric criteria live in `lib/domain/mission-briefs.ts` (`deliverables`). Store the examples as seeded `data_origin = 'seeded_demo'` submissions that never enter the live queue.
**Depends on:** Nothing.

### Learning resources editable without a deploy

**What:** Move the catalogue in `lib/domain/learning-resources.ts` into a `learning_resources` table (stage key, topic position, title, URL, source, kind, language, minutes, last checked), readable by signed-in learners, writable by admins, with an editor on the admin screens.

**Why:** v0.30.0.0 shipped the resources as a typed data file so every link could be reviewed in a pull request. Changing one link now needs a deploy.
**Pros:** Reviewers or the founder can swap a dead link the day it dies. Per-link "last checked" dates instead of one for the whole catalogue.
**Cons:** Migration, RLS, an admin form, and moving the coverage test to the database. Not worth it until links start dying or non-developers need to edit.
**Context:** `npm run check:resources` re-checks every link (YouTube through oEmbed, pages by loading them). Running it on a schedule (GitHub Actions, weekly) would find dead links before learners do.
**Depends on:** Nothing.

## P3 — worth doing, no urgency

### Logo as SVG

**What:** `public/lan-pya-logo.jpg` is a 1280×698 JPEG used as a brand mark at roughly 27px.

**Why:** Lossy format, no alpha channel. Visible artifacts on any non-white surface, and it cannot be recoloured for dark contexts.
**Pros:** Sharp at every size, tiny, themeable.
**Cons:** Needs the original vector artwork from the founder.

### 200% zoom pass

**What:** Verify every learner screen at 200% browser zoom in both languages.

**Why:** `PRODUCT.md` commits to it under WCAG 2.2 AA. It has never been tested. The 320px and 360px widths were verified clean on 2026-08-16; zoom was not.
**Depends on:** Type scale landing first — testing the current 31-size mess would be wasted work.

### Full interaction state coverage

**What:** Specify and build loading, empty, error, and partial states for Home, Opportunities, Paths, Portfolio, and mission submission.

**Why:** Design review Pass 2 scored 3/10, the lowest of seven passes. Empty states are currently unspecified, which means whatever the implementer typed is what ships.
**Context:** Empty states should be invitations, not apologies. "No saved opportunities yet — bookmark ones you like from the feed", not "No items found."

### Reviewer and admin workspace review

**What:** `/app/review` and `/app/admin` were out of scope on 2026-08-16 and have never had a design pass.

**Why:** They inherit the new token layer automatically, so they will improve for free, but nobody has checked whether their layouts survive the change.

### PRODUCT.md palette correction

**What:** `PRODUCT.md` "Brand Commitments" lists Teal `#0F766E` and Warm Yellow `#F59E0B`. The brand system document and DESIGN.md both say `#0F6E56` and `#EF9F27`.

**Why:** Two checked-in files now disagree about the approved palette. DESIGN.md records the conflict, but the source should be reconciled so the next person does not have to rediscover it.
**Pros:** Ten-minute fix.
**Cons:** Requires the founder to confirm which values are actually approved.

---

### Reviewer demo mode for pitches

**What:** Let a pitch audience see the reviewer side (queue, rubric, decision) without granting real reviewer access.

**Why:** The shared demo account must never be a reviewer, because it could then verify anyone's work. That leaves half the product invisible in a demo.

**Pros:** Shows the human-review promise instead of describing it.
**Cons:** Needs a read-only or sandboxed review over seeded submissions that cannot write `human_reviews` for live data.
**Context:** Simplest shape: a `/app/review/demo` page rendering the real review components over a seeded submission, with the decision buttons replaced by an explanation.
**Depends on:** The v0.28 rubric form.

### Appeals flow

**What:** Let a learner appeal a rejection or change request, and let a reviewer lead resolve it.

**Why:** `appeal_requested` exists in `submission_state`, and an `appeals` table with RLS exists, but no screen or route uses either.

**Pros:** A fairness valve that the plan's reviewer-lead role assumes.
**Cons:** A new learner action, a lead queue, and decision rules for what an upheld appeal does to proof and XP.
**Context:** See the `appeals` table in `supabase/migrations/20260811160000_lan_pya_alpha.sql` and the reviewer lead row in the Career Quest plan's roles table.
**Depends on:** More than one reviewer existing.

## Completed

### Learning resources on roadmap topics

**What:** Attach YouTube videos and blog posts to each roadmap topic (the chips beside a stage, such as "Flexbox & Grid"), shown when a learner opens a stage.

**Why:** The founder asked for it on 2026-10-14. Learners can see what to learn, but not where to learn it.

**Pros:** Turns the roadmap from a map into a study plan, using free material that already exists.
**Cons:** Content curation for six tracks, plus link rot. Every link needs a title, source, language (English/Burmese), and a "last checked" date, so stale links can be found.
**Context (as planned):** Topics live in `lib/domain/career-tracks.ts` (`left` and `right` arrays per stage). A `learning_resources` table keyed by track key, stage key and topic, with RLS read for authenticated users and admin-only writes, keeps it out of code. Render it in `components/app/roadmap-detail-dialog.tsx`.

**Completed:** v0.30.0.0 (2026-10-15). 232 topics across the six paths, 555 links (290 videos), each one checked, 25 of them lessons taught in Burmese. Stored as a typed file rather than a table (see "Learning resources editable without a deploy").

### Opportunity filter chips

**What:** Horizontal filter row — All / Scholarships / Fellowships / Hackathons / Events / Webinars / Jobs — per Design Spec §3.5.

**Why:** The feed currently shows every opportunity with no way to narrow. Works at three listings; breaks at thirty.
**Pros:** Specified, straightforward, fills Opportunities dead space with function.
**Cons:** Pointless until the opportunity count grows.

**Completed:** v0.12.0.0 (2026-08-17)

### Milestone detail as a bottom sheet

**What:** Replace the persistent side panel with the bottom sheet Design Spec §3.4 specifies.

**Why:** One pattern on mobile and desktop instead of two. The current desktop side panel and mobile stacked panel are different components solving the same problem.
**Pros:** Removes a component. Matches the spec.
**Cons:** Loses the always-visible detail that makes the desktop canvas feel like a workspace. Genuinely arguable — the current side panel may be better than the spec on desktop.

**Completed:** v0.20.0.0 (2026-08-19)
