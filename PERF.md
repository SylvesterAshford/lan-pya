# Performance ledger

Read this before proposing a speed change. Every attempt is logged, kept or
reverted, with the numbers that decided it, so a dead idea is not tried twice.

## How it is measured

`scripts/perf.mjs` (Playwright, Chromium) against production, signed in as the demo
account:

- **LCP**: five hard loads per page, median, no throttling, static assets cached.
- **Click**: tap the sidebar link from Today until the new page has loaded,
  median of three.
- **Fast 3G**: one cold load per page in a fresh browser (empty cache, no
  service worker), 562 ms round trip, 1.44 Mb/s down, CPU slowed 4×, phone
  viewport. Reports FCP, LCP and bytes.

Run-to-run spread is about ±50 ms unthrottled and ±150 ms on Fast 3G; a change
inside that is noise and is reverted. The runner is in London, so it reaches
the Vercel edge in London and functions in Mumbai; learners in Myanmar are
closer to Mumbai and see more of every server-side gain.

## Where the time went (2026-10-16 baseline, v0.38.0.0)

- Signed-in pages reached LCP in 1.5–2.2 s while the static landing page took
  0.37 s. The difference was server time, almost all of it waiting on network
  round trips, not on Postgres.
- Postgres is fast: `pg_stat_statements` shows `get_active_path_dashboard` at
  9 ms mean, `get_opportunity_readiness` 8 ms, every table read under 1 ms.
  All RPCs are `SECURITY DEFINER` and every direct table read filters by
  `user_id` through an index.
- Functions ran in **iad1** (Washington) and Supabase in **ap-south-1**
  (Mumbai): ~190 ms per call, three or four calls in a row per page (layout:
  `auth.getUser()` → profile, roles, dashboard; page: `auth.getUser()` again →
  its data → the roadmap).
- A cold signed-in page on Fast 3G downloads ~400 KB: 165–200 KB JS, 62 KB CSS,
  108 KB fonts.

## Attempts

| # | Idea | Before → after | Verdict | Why |
|---|---|---|---|---|
| 1 | Run functions in `bom1`, next to the database (v0.38.1.0) | LCP Today 2,168 → 868 ms, Roadmap 1,512 → 808, Missions 2,112 → 880, Portfolio 1,816 → 784, Community 2,008 → 976, Profile 1,708 → 756. Click Roadmap 1,727 → 722, Portfolio 2,160 → 751. Fast 3G LCP Today 6.7 → 4.5 s, Profile 6.1 → 4.5 s | **kept** | Each database call went from ~190 ms to a few ms. The first attempt replaced `vercel.json` and dropped `"framework": "nextjs"`, which 404'd every route for ~10 minutes; edit that file, never replace it. |
| 2 | Verify the session locally with `getClaims()` instead of `getUser()`, and `React.cache()` the data readers so the layout and page share one call (v0.38.2.0) | LCP Today 868 → 840 ms, Roadmap 808 → 780, Missions 880 → 716, Portfolio 784 → 712, Opportunities 808 → 752, Profile 756 → 700. Click Opportunities 658 → 541, Profile 722 → 626, Portfolio 751 → 686. Fast 3G unchanged. `get_active_path_dashboard`: 12 calls for 11 Today loads (was 2 per load) | **kept** | Small but consistent: all 13 paired numbers moved down (median −56 ms), three past noise, and the dashboard RPC load halved. It also fixed reviewers and admins seeing every learner's proof as their own. |
| 3 | One `loading.tsx` for the app area: the page heading's outline, a panel and two rows, sidebar kept (v0.38.4.0) | Fast 3G sidebar tap, first response: Roadmap 765 → 92 ms, Missions 731 → 75, Portfolio 785 → 85, Opportunities 700 → 90, Profile 750 → 90. Finished page: 766 → 804, 736 → 747, 786 → 826, 702 → 694, 751 → 835 | **kept** | The tap now answers about 10× sooner. Time to the finished page is within the ±150 ms Fast 3G spread; it was not the target. Measured with `scripts/perf-tap.mjs` (one Fast 3G tap per page after prefetch settles, median of 3). |
| 4 | Keep the bilingual dictionary (`lib/i18n/app-copy.ts`, 111 KB raw, 28 KB brotli) out of client bundles: labels passed from the server to `RoadmapTree`, `SubmissionForm` (via `MissionRunner`) and `PathSwitchButton`; `formatAppDate`/`localizeReadiness` moved to `lib/i18n/format.ts` (v0.38.5.0) | JS per cold load: Roadmap 201.6 → 171.7 KB, Opportunities 198.8 → 169.1 KB; other routes unchanged. `next build` references the dictionary chunk only from `/onboarding` | **kept** | 30 KB less to download and parse on two of the most used screens. Timing on Fast 3G could not be separated from noise in the same run (see #5); the byte saving is deterministic. |
| 5 | Replace the route-level `loading.tsx` from #3 with a pending outline driven by the sidebar links (`useLinkStatus` in `components/app/nav-pending.tsx`) (v0.38.6.0) | Warm LCP before #3 / with #3 / now: Today 840 / 980 / 760, Roadmap 780 / 968 / 804, Missions 716 / 980 / 736, Portfolio 712 / 1,220 / 708, Opportunities 752 / 1,064 / 768, Profile 700 / 1,104 / 764 ms. Fast 3G tap → outline 73–84 ms, finished page 760–846 ms | **kept** | Full loads are back to their pre-#3 speed and taps keep #3's instant response. A route `loading.tsx` makes React stream every full load as a hidden block revealed after ~300 ms of batching (trace: in DOM hidden at 2,789 ms, visible at 3,121 ms); #3 had been measured on taps only. Community's own `loading.tsx` (since v0.36) has the same cost and is left for its own measurement. |
| 6 | Preload Padauk on Burmese pages only: the same Myanmar-subset files, self-hosted in `public/fonts` with the same unicode-range and `swap`, instead of `next/font`, which preloaded them on every page (v0.38.7.0) | Interleaved A/B on prod after deploy (Fast 3G + 4× CPU, old arm injects the two preloads, median of 5 each): FCP `/en` 3,908 → 2,760, Today 4,484 → 3,328, Profile 3,388 → 2,780, Roadmap 3,528 → 3,012 ms; render-blocking CSS done earlier by the same margins. Burmese pages preload the same three fonts as before (checked in the Link header and `<head>`) | **kept** | English pages fetched 80 KB of Burmese font at high priority next to the render-blocking CSS. A plain before/after across two time windows was inconclusive: the network drifted (CSS on unchanged Burmese pages finished 0.3–1 s later in the second window), so the decision rests on the interleaved run, which agrees with the earlier abort experiment (−0.4 to −0.8 s). English pages still fetch the 400 weight lazily for the little Burmese they show. |
| 7 | Remove Community's own `loading.tsx` (since v0.36): the path picker wraps `router.push` in `useTransition` and reports to the shell outline, the back link carries a `PendingMark` (v0.38.8.0) | Before: warm LCP 972 ms against 708–804 for the other screens. Local production build: full load has no hidden Suspense block; path change → outline 7 ms | pending | Same cause as #5. |
| – | Rewrite the 17 RLS policies the advisor flags to `(select auth.uid())` | not tried | skipped | RPCs bypass RLS and every direct read filters by an indexed `user_id`, so the per-row policy cost covers a handful of rows. No measured query would move. Revisit if a read without a `user_id` filter appears. |
| – | Add the 26 foreign-key indexes the advisor lists | not tried | skipped | None is on a measured hot query; tables hold tens of rows; each index taxes every write. |
| – | Change the once-a-minute `dequeue_evaluation_jobs` cron | not tried | skipped | It is the largest total database time (94k calls, 2.9 ms each) but runs in the background; no learner waits on it. |
