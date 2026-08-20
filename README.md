# Lan Pya — From Map to Proof

Lan Pya is a bilingual, proof-first career platform for Myanmar learners. The alpha ships one operational Frontend Developer path: placement, seven visible milestones, a real responsive-profile-card mission, deterministic checks, human review, revocable proof sharing, and explainable opportunity readiness.

The production stack is Next.js 16 on Vercel and Supabase Auth/Postgres/RLS/Queues/Cron/Edge Functions. Google OAuth is handled only through Supabase Auth.

## What works

- English/Myanmar locale routing, one language at a time, and a responsive PWA shell
- Google OAuth plus email/password signup and login through Supabase Auth
- Private Career Compass onboarding with explained path recommendations
- One active career path at a time, with switching that preserves prior work and proof
- Connected roadmaps for Frontend, Full-Stack, AI/Data, and the Content Creator controlled pilot, with availability labeled explicitly
- Offline, per-user mission drafts in IndexedDB with 30-day expiry
- Transactional submission plus durable PGMQ evaluation jobs
- Allowlisted URL checks; custom domains are explicitly inconclusive
- Human reviewer claim, rubric decision, feedback, and proof creation
- Private proof by default; fragment-token exchange to a short-lived HttpOnly viewing session
- Readiness cards showing supported evidence, gaps, and unknowns
- Reviewer/admin roles, audit events, deletion intake, and seeded/live provenance
- Clearly labeled seeded content that is excluded from live verification metrics

## Local setup

Requirements: Node.js 22+, Docker Desktop, and the Supabase CLI included in this project.

```bash
npm install
cp .env.example .env.local
npx supabase start
npx supabase db reset
npm run dev
```

Copy the local Supabase URL and publishable key printed by `supabase start` into `.env.local`. Open `http://localhost:3000/en`; `/en/demo` works without authentication.

## Google OAuth

In Google Cloud, create a Web OAuth client and use this authorized redirect URI:

```text
https://<project-ref>.supabase.co/auth/v1/callback
```

In Supabase Dashboard → Authentication → Providers, enable Google and add the client ID/secret. Under URL Configuration set:

- Site URL: the production Vercel URL
- Redirect URLs: `http://localhost:3000/auth/callback` and `https://<vercel-domain>/auth/callback`

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
- `SUPABASE_SECRET_KEY` (server only; legacy `SUPABASE_SERVICE_ROLE_KEY` also works)
- `CRON_SECRET` (server only)
- `AI_FEEDBACK_ENABLED=false`

Then deploy normally. The service-role and cron secrets must never use the `NEXT_PUBLIC_` prefix.

## Verification

```bash
npm run test:fast       # lint, TypeScript, unit tests
npm run test:critical   # fast checks + critical Chromium journeys
npm run test:db         # pgTAP RLS/workflow checks against local Supabase
npm run test:functions  # Deno URL-policy tests
npm run test:e2e        # Chromium, Firefox, WebKit + axe
npm run build
```

The Google OAuth path requires a manual staging check because browser automation should not own a real Google account.

## Trust boundaries

- Automated feedback never creates verified proof.
- Reviewers use explicit security-definer workflow functions; direct mutations remain blocked by RLS.
- Arbitrary deployment hosts are not fetched automatically, preventing the checker from becoming an SSRF proxy.
- Public proof secrets live in URL fragments, which are not sent in request paths. They are exchanged once for a 15-minute HttpOnly cookie.
- The service worker never caches authenticated pages, API responses, review/admin screens, or proof views.
- Seeded demonstration records carry `data_origin = seeded_demo` and are excluded from live human-verification metrics.

## Key paths

- `app/[locale]` — localized App Router UI
- `app/api` — validated workflow endpoints
- `supabase/migrations` — schema, RLS, RPCs, queue, cron, audit pipeline
- `supabase/functions/process-evaluations` — deterministic evidence checker
- `supabase/seed.sql` — versioned curriculum and labeled example opportunities
- `tests` and `supabase/tests` — unit, E2E, accessibility, and RLS coverage
- `CHANGELOG.md` — learner-facing release history and known issues
- `PRODUCT.md` — product purpose, constraints, principles, and brand commitments
- `PRODUCT_PLAN.md` — product strategy, MVP scope, trust model, and rollout plan
- `DESIGN.md` — learner information architecture, visual system, and accessibility rules
- `TODOS.md` — prioritized product and design debt with completion history
- `lovable/` — rebuild handoff with the PRD, design specification, and staged Lovable prompts
- `docs/product/LAN_PYA_CAREER_QUEST_PLAN.md` — detailed personalization and career-path architecture
