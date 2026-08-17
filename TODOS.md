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

### Opportunity filter chips

**What:** Horizontal filter row — All / Scholarships / Fellowships / Hackathons / Events / Webinars / Jobs — per Design Spec §3.5.

**Why:** The feed currently shows every opportunity with no way to narrow. Works at three listings; breaks at thirty.
**Pros:** Specified, straightforward, fills Opportunities dead space with function.
**Cons:** Pointless until the opportunity count grows.

### Milestone detail as a bottom sheet

**What:** Replace the persistent side panel with the bottom sheet Design Spec §3.4 specifies.

**Why:** One pattern on mobile and desktop instead of two. The current desktop side panel and mobile stacked panel are different components solving the same problem.
**Pros:** Removes a component. Matches the spec.
**Cons:** Loses the always-visible detail that makes the desktop canvas feel like a workspace. Genuinely arguable — the current side panel may be better than the spec on desktop.

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
