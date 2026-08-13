# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Lan Pya serves Myanmar university students, recent graduates, and self-learners who are trying to choose a credible digital-career direction, build practical skills, and become ready for real work. Many use phones, have limited access to paid learning, and need guidance that works in either English or Burmese.

## Product Purpose

Lan Pya turns career uncertainty into a visible sequence of actions: choose a direction, follow a maintained roadmap, complete practical missions, collect reviewable proof, and act on relevant opportunities. Success means a learner can always identify the next useful step and can show what they can do rather than relying on self-reported skills.

## Positioning

Lan Pya connects career direction, practical work, evidence, human feedback, and opportunity readiness in one Myanmar-focused product. Its proof-first model and locally relevant bilingual guidance distinguish it from generic course catalogs and opaque career-matching tools.

## Operating Context

Learners enter through onboarding or a prepared demo account, select or change a career path, continue roadmap milestones, complete mission briefs, submit links and evidence, receive automated checks and human review, manage proof visibility, and explore opportunities. Reviewers and administrators use protected workspaces for evaluation and operations.

## Capabilities and Constraints

- Next.js web app deployed on Vercel with Supabase authentication, Postgres, row-level security, queues, cron, and Edge Functions.
- English and Burmese routes render one selected language at a time.
- Google OAuth and email/password authentication are handled through Supabase.
- One fully operational Frontend Developer path is supported today; other digital-career paths may be preview, pilot, or future content and must be labeled honestly.
- Seeded demonstration records must behave like a prepared account and remain visibly distinct from live learner evidence.
- Proof is private by default. Shared proof must remain revocable and traceable to its review method.
- The interface must remain usable on small phones, slow connections, keyboard navigation, and 200% zoom.

## Brand Commitments

- Product name: Lan Pya.
- Brand promise: From Map to Proof.
- Approved core palette: Deep Navy `#0F172A`, Teal `#0F766E`, Warm Yellow `#F59E0B`, Soft White `#F8FAFC`, and Slate `#334155`.
- The supplied Lan Pya logo remains the primary identity asset.
- The supplied `Lan Pya Web.dc.html` is the binding interaction and layout reference for the learner workspace: compact navigation, focused home, simple roadmap catalog, connected node canvas, concise opportunity feed, and profile-owned preferences.
- Voice is direct, encouraging, concrete, and honest about what is verified, seeded, incomplete, or still growing.

## Evidence on Hand

- Product research, business model, requirements, and survey context supplied by the founder.
- Myanmar learner survey workbook supplied by the founder.
- Lan Pya logo and application screen references supplied by the founder.
- Working authenticated prototype with seeded and live data flows.
- No employer outcome claims, placement rates, salaries, or testimonials may be invented.

## Product Principles

1. Show one useful next step before secondary information.
2. Practical evidence outranks self-reported confidence or decorative scores.
3. Personalization narrows choices without locking the learner in.
4. Career content and opportunity provenance must be explicit and maintainable.
5. Every language, device, and account mode receives the same complete product flow.

## Accessibility & Inclusion

Target WCAG 2.2 AA for learner, reviewer, and proof-sharing flows. English and Burmese typography should have equivalent hierarchy and perceived size. Controls need visible focus, text labels, non-color status cues, and a minimum 44px touch target where practical.
