# Lan Pya — From Map to Proof

Lan Pya (လမ်းပြ, "the one who shows the way") is a bilingual, proof-first career platform for Myanmar learners. A learner picks a career path, climbs its roadmap stage by stage, builds real work for each stage's mission, gets it checked and reviewed, and turns verified work into a portfolio and a résumé they can show employers.

**Live:** https://lan-pya-rust.vercel.app · English and Burmese (မြန်မာ), one language per screen.

The stack is Next.js 16 (App Router, next-intl) on Vercel, with Supabase Auth, Postgres, RLS, Queues, Cron and Edge Functions. Every Supabase call runs on the server, so the app works in Myanmar without a VPN (see below).

## What works

**Learning**

- **Career Compass** onboarding: private questions that recommend a path and explain why.
- **Six career paths:**
  - Frontend Developer: operational, 12 stages.
  - Content Creator and Video Editor: controlled pilots.
  - Full-Stack Developer, AI & Data Analyst, Brand & Visual Designer: previews.

  Availability is always labelled. One path is active at a time, and switching keeps earlier work.
- **Roadmaps:** a connected stage map for every path, with free lessons (232 topics, 555 checked links, some in Burmese) on each stage.
- **Missions:**
  - A trail map with the learner's traveller standing on their current stage.
  - Four authored missions so far: Responsive Profile Card, Interactive opportunity tracker, Three-piece awareness campaign and Vertical story edit.
  - Each mission runs brief → plan → build → submit → result, with offline drafts.

**Review, in two tiers**

- **Completed:** an automatic link check passes (PGMQ job queue, allowlisted hosts; anything it cannot judge is marked inconclusive). The stage moves on the map.
- **Verified:** a human reviewer scores the rubric. Only this creates proof and points (100 per verified mission).

**Proof and careers**

- **Portfolio (Evidence Studio):**
  - A proof passport showing what has been verified.
  - Completed work named by path and stage, the same way Missions and the roadmap name it.
  - A **Proof-to-Resume Builder**: pick verified work, choose a template (Modern, Classic or Trail) and watch a live A4 preview. Edit the role, profile and every line, then print or save as PDF on the device. Every line names the mission and the review it came from; nothing is generated.
- **Private proof sharing:** proof is private by default. A share link's secret travels in the URL fragment and is exchanged once for a short-lived viewing session; links can be revoked.
- **Opportunities:** a deadline-led feed. Each card shows what the learner's proof supports, what is still missing and what is unknown.

**Community** (v0.36)

- Learners who opt in are listed by path:
  - **Your stage:** a mini trail of the path, plus who is at your stage, one ahead and one behind.
  - **Leaderboard:** a podium on the summit and ranked rows. Each avatar wears its stage emblem, and a line says how many points you are behind the next person.
- Contact links (Telegram, Facebook, LinkedIn) reach only learners who are listed themselves.
- Report hides a person from the reporter at once.
- All visibility rules are enforced in SQL (`get_community`).

**Plans and pricing** (v0.37)

- `/pricing` shows Free, Pro Student and Career+, plus a Business tab (employer fees, university and corporate partnerships).
- There is no payment provider yet: paid plans take a waitlist, the Business tab takes inquiries, and unbuilt features are tagged "Coming soon".

**Operations**

- Reviewer and admin roles, and an audit trail.
- The Admin page shows review backlog, community reports, waitlist counts and partner inquiries.
- Seeded demonstration records carry `data_origin = seeded_demo` and are kept out of every live metric.

## Local setup

Requirements: Node.js 22+, Docker Desktop and the Supabase CLI.

```bash
npm install
cp .env.example .env.local
npx supabase start
npx supabase db reset      # every migration, then supabase/seed.sql
npm run dev
```

Copy the local Supabase URL and publishable key printed by `supabase start` into `.env.local`, then open `http://localhost:3000/en`.

## Demo account

Use the shared demo for pitches and testing: open `/en/login?demo=1`, or sign in with **`demo@lanpya.app`** / **`LanPya-Demo-2026!`**.

**The demo's story** is defined once, in SQL `public.reset_demo_account()`:
- Frontend Developer is the active path, with stages 1–3 complete and the learner standing on stage 4 (JavaScript programming).
- Content Creator is the previous path.
- There are two seeded verified proofs, and the alias is Thura.

**What the demo can do in a pitch:**
- **Submit a mission:** the link check always completes for the demo, and a simulated review verifies it a few seconds later.
- **Walk on:** "Back to your trail map" walks the traveller to the next stop.
- **Reset:** "Reset the demo story" at the foot of Missions puts everything back. A nightly job also resets it.
- **Community:** the demo sees labelled **sample learners** (`community_sample_peers`), never real people, and real learners never see the demo.
- **Pricing:** the demo can press "Join the waitlist", but nothing is recorded.

To create or refresh the demo account in a Supabase project:

```bash
npm run demo:provision    # needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY
```

## Sign-in works without a VPN in Myanmar

`*.supabase.co` is not reachable from Myanmar without a VPN, so **the browser never contacts Supabase**. Every auth step and every database call runs on the server (Vercel → Supabase). The browser only talks to this site and to `accounts.google.com`. `tests/e2e/no-supabase-in-browser.spec.ts` blocks Supabase in the browser and checks that sign-in, the workspace and profile editing still work. Keep it passing: never add a browser-side Supabase client back.

| Flow | Browser talks to | Server route |
|---|---|---|
| Email sign-in / sign-up | this site | `POST /api/auth/login`, `POST /api/auth/signup` |
| Confirmation email link | this site | `GET /auth/confirm` |
| Google sign-in | `accounts.google.com`, this site | `POST /api/auth/google` (ID token, `signInWithIdToken`) |
| Profile editor | this site | `POST /api/profile/update` |
| Community settings and reports | this site | `POST /api/profile/community`, `POST /api/community/report` |
| Pricing waitlist and partner inquiries | this site | `POST /api/plans/waitlist`, `POST /api/partners/inquiry` |

### Google sign-in setup

Google sign-in uses Google Identity Services (Google's own button). It returns an ID token, which the server exchanges with Supabase. There is no redirect through Supabase.

1. **Google Cloud → APIs & Services → Credentials → your Web OAuth client.** Add every origin the app is served from under *Authorized JavaScript origins*, for example `https://lan-pya-rust.vercel.app` and `http://localhost:3000`. Google only shows its button on listed origins, so random preview URLs will show an error there.
2. **Supabase → Authentication → Providers → Google.** Enable it, and make sure the same Web client ID is in *Client IDs*. Leave *Skip nonce checks* off.
3. **Vercel → Settings → Environment Variables.** Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to that Web client ID, then redeploy. Until it is set, the Google button explains that Google sign-in is not available yet.

### Email confirmation setup

The default confirmation email links to `*.supabase.co`, which cannot be opened in Myanmar without a VPN. On Supabase's built-in email sender the template cannot be edited, so choose one:

- **No confirmation email (the current pilot setting).** Turn off *Confirm email* in Supabase → Authentication → Sign In / Providers → Email. `/api/auth/signup` then signs the new account straight in. Email addresses are not proven, but Google sign-in still gives verified identities.
- **Your own sender (custom SMTP).** Set it up in Supabase → Authentication → Emails (Gmail with an app password works without a domain), then use the template below.

1. **Supabase → Authentication → URL Configuration.** Set *Site URL* to the production URL (`https://lan-pya-rust.vercel.app`). Add `https://lan-pya-rust.vercel.app/**` and `http://localhost:3000/**` to *Redirect URLs*.
2. **Supabase → Authentication → Email Templates → Confirm signup.** Point the link at this site rather than Supabase:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}">Confirm your email</a>
```

The old `/auth/callback` route still works, so links sent before this change keep working.

## Supabase production setup

Link the free Supabase project, apply schema plus seeded examples, deploy the evaluator, then add the recovery secrets:

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push --include-seed
npx supabase functions deploy process-evaluations --no-verify-jwt
npx supabase secrets set CRON_SECRET=<long-random-secret>
```

In the Supabase SQL editor, store the same dispatch values in Vault:

```sql
select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
select vault.create_secret('<same-long-random-secret>', 'cron_secret');
```

The app triggers evaluation immediately after submission. Supabase Cron recovers and dispatches queued/failed jobs every minute. Vercel Cron is not used.

To promote an existing account for testing, use its Auth user UUID:

```sql
insert into public.memberships(user_id, role)
values ('<auth-user-uuid>', 'reviewer')
on conflict (user_id, role) do update set status = 'active';
```

Use `admin` instead of `reviewer` for the operations console.

## Vercel deployment

Import the repository into Vercel and set these environment variables for Production and Preview:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (Google sign-in; see above)
- `SUPABASE_SECRET_KEY` (server only; legacy `SUPABASE_SERVICE_ROLE_KEY` also works)
- `CRON_SECRET` (server only)
- `AI_FEEDBACK_ENABLED=false`

Then deploy normally. The service-role and cron secrets must never use the `NEXT_PUBLIC_` prefix.

## Verification

```bash
npm run test:fast       # lint, TypeScript, unit tests (Vitest)
npm run test:critical   # fast checks + critical Chromium journeys
npm run test:db         # pgTAP: RLS, review workflow, Community privacy, waitlist
npm run test:functions  # Deno URL-policy tests
npm run test:e2e        # Chromium, Firefox, WebKit + axe
npm run check:resources # re-check every free-lesson link (slow; pass stage keys to narrow)
npm run build
```

For the database tests, a local Postgres is enough: `npx supabase db start`, `npx supabase db reset --local`, then `npm run test:db`.

The Google OAuth path needs a manual staging check, because browser automation should not own a real Google account.

## Releasing

A push to `master` is a production deploy (Vercel Git integration). Database changes ship first: apply the migration to the production project, rename the file in `supabase/migrations` to the version Supabase recorded, then merge. Every release bumps `VERSION` and `package.json` and adds a learner-facing `CHANGELOG.md` entry.

## Trust boundaries

- Automated feedback never creates verified proof.
- Reviewers use explicit security-definer workflow functions; direct mutations remain blocked by RLS.
- Arbitrary deployment hosts are not fetched automatically, preventing the checker from becoming an SSRF proxy.
- Public proof secrets live in URL fragments, which are not sent in request paths. They are exchanged once for a 15-minute HttpOnly cookie.
- The service worker never caches authenticated pages, API responses, review/admin screens, or proof views.
- Seeded demonstration records carry `data_origin = seeded_demo` and are excluded from live human-verification metrics.

## Key paths

- `app/[locale]` — localized App Router UI (`/pricing` is public; `/app/*` needs sign-in)
- `app/api` — validated workflow endpoints; the browser never calls Supabase
- `lib/domain` — pure product rules: career tracks, missions and their places, progress and levels, community ranking, plans, résumé assembly
- `lib/i18n/app-copy.ts` — every English and Burmese string in the app
- `supabase/migrations` — schema, RLS, RPCs, queue, cron, audit pipeline
- `supabase/functions/process-evaluations` — deterministic evidence checker
- `supabase/seed.sql` — versioned curriculum and labeled example opportunities
- `tests` and `supabase/tests` — unit, E2E, accessibility, RLS and privacy coverage
- `CHANGELOG.md` — learner-facing release history and known issues
- `PRODUCT.md` — product purpose, constraints, principles, and brand commitments
- `PRODUCT_PLAN.md` — product strategy, MVP scope, trust model, and rollout plan
- `DESIGN.md` — learner information architecture, visual system, and accessibility rules
- `TODOS.md` — prioritized product and design debt with completion history
- `lovable/` — rebuild handoff with the PRD, design specification, and staged Lovable prompts
- `docs/product/LAN_PYA_CAREER_QUEST_PLAN.md` — detailed personalization and career-path architecture
