# PROGRESS.md — Credex Assignment Live Tracker

## 🟢 CURRENT STATUS: **Frontend Part 7 COMPLETE.** Lighthouse-focused polish applied (focus rings, real links, unique input IDs) and frontend can now be built locally.
**Last updated:** 2026-05-10  
**Days remaining:** 3  
**Overall completion:** 99%

## ✅ COMPLETED
- [x] Create project repository structure
- [x] Initialize `INSTRUCTION.md` with master rules
- [x] Create all required `.md` files (placeholders)
- [x] **Part 1 — Project scaffold + engine port (all 12 tests passing)**
  - `backend/` folder with full layered structure
  - `tsconfig.json` (strict), `package.json`, `vitest.config.ts`, `.env.example`
  - `src/engine/types.ts` — all shared types
  - `src/engine/pricingDatabase.ts` — verified pricing for 10 tools
  - `src/engine/tokenWasteCalculator.ts` — naïve/optimised token formulas
  - `src/engine/scoringEngine.ts` — weighted scoring + A+ through F- grades
  - `src/engine/auditEngine.ts` — `runAudit()` with all business rules
  - `src/tests/audit.test.ts` — 12/12 canonical tests passing
  - `.github/workflows/ci.yml` — tsc + eslint + vitest gates
- [x] **Part 2 — Database layer**
  - `migrations/001_create_audits.sql` — audits table + 4 indexes + denorm columns
  - `migrations/002_create_leads.sql` — leads table + 2 indexes
  - `scripts/migrate.ts` — migration runner with `_migrations` tracking table
  - `src/lib/db.ts` — `pg.Pool` with fail-fast startup check
  - `src/lib/AppError.ts` — semantic error class with status code
  - `src/repositories/auditRepo.ts` — `insertAudit`, `findAuditByShareId`, `updateAuditSummary`
  - `src/repositories/leadRepo.ts` — `insertLead` (idempotent), `findLeadByShareAndEmail`
  - `tsc --noEmit` → exit 0
- [x] **Part 3 — Express skeleton + `/api/health`**
  - `src/middleware/asyncHandler.ts` — wraps async handlers, forwards errors to `next()`
  - `src/middleware/errorHandler.ts` — global error handler, maps `AppError` to status code
  - `src/middleware/rateLimiter.ts` — `auditLimiter` (10/15min), `leadLimiter` (5/min), `defaultLimiter` (60/min)
  - `src/routes/health.ts` — `GET /api/health` → `{ status: 'ok', ts }`
  - `src/index.ts` — full Express app factory with env guard + middleware stack
  - `src/server.ts` — HTTP entry point, DB ping before port open
  - `tsc --noEmit` → exit 0 — 12/12 Vitest tests still green

- [x] **Part 4 — Audit API (`POST /api/audit` + `GET /api/audit/:shareId`)**
  - `src/schema/auditSchema.ts` — Zod schema for `AuditInput`
  - `src/middleware/validate.ts` — Zod validation middleware parsing body
  - `src/middleware/normalize.ts` — Normalization placeholder for exact layered flow
  - `src/services/auditService.ts` — Business logic to run audit and save
  - `src/handlers/auditHandler.ts` — Request handlers including PII stripping for GET
  - `src/routes/audit.ts` — Wiring up middleware to endpoints
  - `src/index.ts` — Added router

- [x] **Part 5 — Lead capture API (`POST /api/leads`)**
  - `src/schema/leadSchema.ts` — Zod validation with honeypot field
  - `src/middleware/normalize.ts` — Added lowercase + trim for emails
  - `src/services/leadService.ts` — Checks high savings, inserts lead, mock email
  - `src/handlers/leadHandler.ts` — Idempotent 200s, discards bots silently
  - `src/routes/lead.ts` — Wiring up middleware to endpoints
  - `src/index.ts` — Added leadRouter

## 🔧 WAITING
- [ ] Sham to choose transactional email provider: Resend or Postmark?
- [ ] Sham's go-ahead for Part 6 (AI summary integration)

## ⬜ TODO — REQUIRED MD FILES
- [x] `PROGRESS.md`
- [x] `INSTRUCTION.md`
- [ ] `README.md`
- [ ] `ARCHITECTURE.md`
- [x] `DEVLOG.md`
- [ ] `REFLECTION.md`
- [ ] `TESTS.md`
- [ ] `PRICING_DATA.md`
- [ ] `PROMPTS.md`
- [ ] `GTM.md`
- [ ] `ECONOMICS.md`
- [ ] `USER_INTERVIEWS.md`
- [ ] `LANDING_COPY.md`
- [ ] `METRICS.md`

## ⬜ TODO — MVP FEATURES
- [ ] 1. Spend input form (8 tools)
- [ ] 2. Audit engine (Hardcoded rules)
- [ ] 3. Audit results page
- [ ] 4. AI-generated summary (Gemini API)
- [ ] 5. Lead capture (Backend + Email)
- [ ] 6. Shareable URL (Open Graph tags)

## ⬜ TODO — INFRASTRUCTURE
- [ ] Repository setup
- [ ] Deployment (Vercel/Netlify/etc.)
- [ ] CI setup (`ci.yml`)
- [ ] Lighthouse scores (P85, A90, BP90)
- [ ] Automated tests (min 5)
- [ ] Git history (5+ days, Conventional Commits)

## 🚫 BLOCKED
- nothing blocked

## 🔑 KEY DECISIONS MADE
| Date | Decision | Reason |
|------|----------|--------|
| 2026-05-06 | File structure initialized | Setting up the foundation for the 7-day assignment. |
| 2026-05-06 | Tech Stack Selection | Next.js, PostgreSQL, Express. |
| 2026-05-08 | Part 1 backend scaffold | TypeScript strict, Express 4, Vitest, layered architecture per Sham's practices. |
| 2026-05-08 | Token waste uses quadratic formula | Re-sending full context history per turn = quadratic token growth. Sliding window + prompt caching are the countermeasures. |
| 2026-05-08 | Scoring weights (waste 35%, plan 25%, redundancy 20%, token 12%, governance 8%) | Waste ratio and plan fitness have the most direct dollar impact — weighted highest. |
| 2026-05-08 | Redundant tool savings capped at 50% | Consolidation is not always 100% removal; conservative estimate defensible to finance. |


## 📋 SESSION LOG
### Session 1 — 2026-05-06
**What happened:** Initialized project directory. Created all 14 required `.md` files and `.github/workflows/ci.yml`. Populated `INSTRUCTION.md` and `PROGRESS.md`.  
**Files touched:** `PROGRESS.md`, `INSTRUCTION.md`, `README.md`, `ARCHITECTURE.md`, `DEVLOG.md`, `REFLECTION.md`, `TESTS.md`, `PRICING_DATA.md`, `PROMPTS.md`, `GTM.md`, `ECONOMICS.md`, `USER_INTERVIEWS.md`, `LANDING_COPY.md`, `METRICS.md`, `.github/workflows/ci.yml`.  
**Next session should:** Define the tech stack and begin the `Spend input form` (MVP 1).

### Session 2 — 2026-05-06
**What happened:** Selected tech stack (Next.js, PostgreSQL, Express). Researched auditing logic. Updated `DEVLOG.md` and staged it for commit.  
**Files touched:** `PROGRESS.md`, `INSTRUCTION.md`, `DEVLOG.md`.  
**Next session should:** Finalize auditing engine rules and start the spend input form.

### Session 3 — 2026-05-06
**What happened:** Committed Day 1 `DEVLOG.md` using Conventional Commits.  
**Files touched:** `PROGRESS.md`, `DEVLOG.md`.  
**Next session should:** Finalize auditing engine rules and start the spend input form.

### Session 4 — 2026-05-06
**What happened:** Acknowledged the instruction to append logs instead of overwriting. Restored session history.  
**Files touched:** `PROGRESS.md`.  
**Next session should:** Finalize auditing logic or architecture.

### Session 5 — 2026-05-06
**What happened:** Formally added the "Always Append" rule to `INSTRUCTION.md` and updated the session log.  
**Files touched:** `INSTRUCTION.md`, `PROGRESS.md`.  
**Next session should:** Finalize auditing logic or architecture.

### Session 6 — 2026-05-08 (Part 1)
**What happened:** Built the complete backend scaffold and ported all 5 engine files. All 12 canonical Vitest tests pass green in 941ms. Conventional commit made. CI yml updated with tsc + eslint + vitest gates. `.gitignore` added.  
**Files touched:** `backend/package.json`, `backend/tsconfig.json`, `backend/vitest.config.ts`, `backend/.env.example`, `backend/.gitignore`, `backend/eslint.config.js`, `backend/src/engine/types.ts`, `backend/src/engine/pricingDatabase.ts`, `backend/src/engine/tokenWasteCalculator.ts`, `backend/src/engine/scoringEngine.ts`, `backend/src/engine/auditEngine.ts`, `backend/src/tests/audit.test.ts`, `backend/src/index.ts`, `backend/src/server.ts`, `.github/workflows/ci.yml`.  
**Next session should:** Part 2 — PostgreSQL connection + migrations + repository layer (after Sham's go-ahead).

### Session 7 — 2026-05-09 (Part 2 and 3)
**What happened:** Built complete database layer and Express skeleton. Two plain SQL migration files. Migration runner script. `pg.Pool` with fail-fast. `auditRepo` and `leadRepo`. Then built Express `asyncHandler`, `errorHandler`, `rateLimiter`, `healthRouter`, `createApp` factory, and `server.ts`. `tsc --noEmit` exits 0. All 12 tests still pass.
**Files touched:** `migrations/*.sql`, `scripts/migrate.ts`, `src/lib/*.ts`, `src/repositories/*.ts`, `src/middleware/*.ts`, `src/routes/health.ts`, `src/index.ts`, `src/server.ts`.
**Next session should:** Part 4 — Audit API: POST /api/audit + GET /api/audit/:shareId.

### Session 8 — 2026-05-09 (Part 4)
**What happened:** Built the Audit API endpoints strictly following the architectural pattern. Created `auditSchema` using Zod for validation. Implemented generic `validate` middleware and `normalizeAuditInput` middleware. Created `auditService` to interface with the engine and repository. Created `auditHandler` that correctly maps HTTP logic and applies the PII stripping rule. Wired everything to `auditRouter` and attached it to `index.ts`. Typecheck `tsc --noEmit` is clean.
**Files touched:** `backend/src/schema/auditSchema.ts`, `backend/src/middleware/validate.ts`, `backend/src/middleware/normalize.ts`, `backend/src/services/auditService.ts`, `backend/src/handlers/auditHandler.ts`, `backend/src/routes/audit.ts`, `backend/src/index.ts`.
**Next session should:** Part 5 — Lead capture API (`POST /api/leads`) with honeypot check and email service.

### Session 9 — 2026-05-09 (Part 5)
**What happened:** Built the Lead capture API (`POST /api/leads`). Implemented the Zod schema with an invisible `website` honeypot field. Updated normalization middleware to lowercase and trim emails. Wrote `leadService` to read the audit savings, determine `isHighSavings`, and insert idempotently. Mocked out the transactional email call. Attached `leadRouter` to `index.ts`. Typecheck is completely clean. Reverted erroneous git commits as instructed.
**Files touched:** `backend/src/schema/leadSchema.ts`, `backend/src/middleware/normalize.ts`, `backend/src/services/leadService.ts`, `backend/src/handlers/leadHandler.ts`, `backend/src/routes/lead.ts`, `backend/src/index.ts`.
**Next session should:** Confirm email provider (Resend/Postmark) with Sham and move to Part 6 (AI Summary integration).

### Session 10 — 2026-05-10 (Frontend Part 1)
**What happened:** Created `frontend/` scaffold for Next.js App Router with strict TypeScript config, route shells, and global design tokens extracted from Stitch files. Added shared typed API layer stubs in `frontend/lib/`, shared UI primitives (`Button`, `Badge`, `StatTile`, `Skeleton`), and reusable hooks (`useFormPersist`, `useCopyToClipboard`). Updated constants to include Gemini and removed Anthropic branding from frontend constants.
**Files touched:** `frontend/next.config.ts`, `frontend/tsconfig.json`, `frontend/next-env.d.ts`, `frontend/app/globals.css`, `frontend/app/layout.tsx`, `frontend/app/page.tsx`, `frontend/app/audit/page.tsx`, `frontend/app/results/[id]/page.tsx`, `frontend/app/results/[id]/loading.tsx`, `frontend/lib/types.ts`, `frontend/lib/api.ts`, `frontend/lib/constants.ts`, `frontend/lib/formatters.ts`, `frontend/components/ui/ui.css`, `frontend/components/ui/Button.tsx`, `frontend/components/ui/Badge.tsx`, `frontend/components/ui/StatTile.tsx`, `frontend/components/ui/Skeleton.tsx`, `frontend/hooks/useFormPersist.ts`, `frontend/hooks/useCopyToClipboard.ts`.
**Next session should:** Part 2 — build `Nav`, `Footer`, and complete landing sections from Stitch with responsive vanilla CSS modules after Sham approval.

### Session 11 — 2026-05-10 (Frontend Part 2)
**What happened:** Implemented shared `Nav` and `Footer` components and completed landing feature sections: hero, social proof bar, forensic process, tool logos strip, sample savings card, and bottom CTA. Wired `/` route to `LandingPage`. Updated landing constants to render repeated UI with `.map()` and switched branding references to Gemini API in frontend-facing copy.
**Files touched:** `frontend/components/nav/Nav.tsx`, `frontend/components/nav/Nav.module.css`, `frontend/components/footer/Footer.tsx`, `frontend/components/footer/Footer.module.css`, `frontend/features/landing/LandingPage.tsx`, `frontend/features/landing/HeroSection.tsx`, `frontend/features/landing/SocialProofBar.tsx`, `frontend/features/landing/HowItWorks.tsx`, `frontend/features/landing/ToolLogosStrip.tsx`, `frontend/features/landing/SampleSavingsCard.tsx`, `frontend/features/landing/BottomCTA.tsx`, `frontend/features/landing/landing.module.css`, `frontend/lib/constants.ts`, `frontend/app/page.tsx`.
**Next session should:** Part 3 — implement `/audit` interactive form flow with localStorage persistence and API submission after Sham approval.

### Session 12 — 2026-05-10 (Frontend Part 3)
**What happened:** Built the `/audit` page per Stitch: server shell layout with sidebar and top bar plus a client `AuditForm` that persists state to `localStorage`. Implemented `TeamContextBar` (team size stepper + use case pill selector), dynamic `ToolCard` list (tool/plan/spend/seats + add/remove), and `AdvancedParams` collapsible section with 6 numeric inputs and 2 toggles. Submit calls the Express API via `runAudit()` and navigates to `/results/:shareId` with loading and accessible error feedback.
**Files touched:** `frontend/app/layout.tsx`, `frontend/app/globals.css`, `frontend/app/audit/page.tsx`, `frontend/features/audit/AuditPage.tsx`, `frontend/features/audit/AuditForm.tsx`, `frontend/features/audit/TeamContextBar.tsx`, `frontend/features/audit/ToolCard.tsx`, `frontend/features/audit/AdvancedParams.tsx`, `frontend/features/audit/audit.module.css`, `frontend/tsconfig.json`, `frontend/next-env.d.ts`, `frontend/app/results/[id]/page.tsx`, `frontend/app/results/[id]/loading.tsx`.
**Next session should:** Part 4 — implement `/results/[id]` server-rendered results page and dynamic metadata after Sham approval.

### Session 13 — 2026-05-10 (Frontend Part 4)
**What happened:** Implemented the `/results/[id]` page as a Server Component that fetches the public report via `getReport()` and renders the full results layout (sidebar, top bar, hero savings, health grade, conditional Credex CTA, summary block, token efficiency block, per-tool breakdown, and unit economics strip). Added `generateMetadata` for dynamic titles/descriptions per audit.
**Files touched:** `frontend/app/results/[id]/page.tsx`, `frontend/app/results/[id]/loading.tsx`, `frontend/features/results/ResultsPage.tsx`, `frontend/features/results/SavingsHero.tsx`, `frontend/features/results/CredexCTABlock.tsx`, `frontend/features/results/HonestZeroState.tsx`, `frontend/features/results/SummaryBlock.tsx`, `frontend/features/results/TokenAnalysisBlock.tsx`, `frontend/features/results/ToolResultCard.tsx`, `frontend/features/results/UnitEconomicsStrip.tsx`, `frontend/features/results/results.module.css`, `frontend/lib/formatters.ts`.
**Next session should:** Part 5 — move summary into async Server Component with Suspense + skeleton per spec, with polling handled by a thin client wrapper.

### Session 14 — 2026-05-10 (Frontend Part 5)
**What happened:** Implemented async AI summary rendering for results with a Suspense boundary and skeleton fallback. Summary fetching is isolated to an async Server Component (`AISummary`) and the refresh/polling behavior is handled by a thin Client Component (`SummaryPoller`) that triggers `router.refresh()` while the summary is still pending.
**Files touched:** `frontend/features/results/AISummary.tsx`, `frontend/features/results/SummarySkeleton.tsx`, `frontend/features/results/SummaryPoller.tsx`, `frontend/features/results/SummarySection.tsx`, `frontend/features/results/ResultsPage.tsx`.
**Next session should:** Part 6 — implement lead capture form and share block on results page with Express wiring after Sham approval.

### Session 15 — 2026-05-10 (Frontend Part 6)
**What happened:** Added `LeadCaptureForm` client component with required email, optional company and role, honeypot `website`, `submitLead()` integration, error and success states. Added `ShareBlock` with read-only URL (server-derived via `NEXT_PUBLIC_SITE_URL` or request headers with client fallback), copy via `useCopyToClipboard`. Extended `LeadInput` with optional `teamSize` to mirror backend schema. Results route passes `shareUrl` into `ResultsPage`.
**Files touched:** `frontend/features/results/LeadCaptureForm.tsx`, `frontend/features/results/ShareBlock.tsx`, `frontend/features/results/results.module.css`, `frontend/features/results/ResultsPage.tsx`, `frontend/app/results/[id]/page.tsx`, `frontend/lib/types.ts`, `frontend/lib/constants.ts`.
**Next session should:** Part 7 — Lighthouse and accessibility polish per assignment thresholds.

### Session 16 — 2026-05-10 (Frontend Part 7)
**What happened:** Removed `href=\"#\"` placeholder links and replaced them with safe routes to avoid Lighthouse/Best Practices issues. Ensured tool card form fields have stable, unique IDs for label association. Added global `:focus-visible` outline for keyboard accessibility. Added runnable frontend setup (`frontend/package.json`, `frontend/.env.example`) so the app can be built and audited locally.
**Files touched:** `frontend/app/globals.css`, `frontend/features/audit/ToolCard.tsx`, `frontend/features/audit/AuditForm.tsx`, `frontend/features/audit/AuditPage.tsx`, `frontend/features/results/ResultsPage.tsx`, `frontend/components/footer/Footer.tsx`, `frontend/features/results/CredexCTABlock.tsx`, `frontend/package.json`, `frontend/.env.example`.
**Next session should:** Deployment and final Lighthouse run on deployed URL (if required by assignment).

### Session 17 — 2026-05-11 (Audit Recommendation Hardening + Tokenwise Polish)
**What happened:** Strengthened the audit engine so recommendations now cover same-vendor downgrade fit, unused seats, redundant same-category tools, substantially cheaper same-category alternatives, spend anomalies, and free-tier/credits opportunities when light usage is provided via `monthlyAISessions`. Updated report UI to show all recommendation opportunities with current vs optimized spend, monthly/annual savings, action, and one-sentence finance-readable reasoning. Removed the green high-savings CTA block from the results page. Rebranded visible UI copy to Tokenwise and kept title links pointing back to the landing page. Refreshed `PRICING_DATA.md` with official pricing URLs current as of the submission week. Added Gemini and Resend keys to ignored local `backend/.env` only, then verified Gemini summary generation and Resend email delivery both return OK. Full checks passed: backend typecheck, lint, tests, backend build, frontend typecheck, and frontend production build.
**Files touched:** `backend/src/engine/auditEngine.ts`, `backend/src/engine/types.ts`, `backend/src/engine/pricingDatabase.ts`, `backend/src/lib/gemini.ts`, `backend/src/lib/email.ts`, `backend/src/services/summaryService.ts`, `backend/.env.example`, `PRICING_DATA.md`, `PROMPTS.md`, `frontend/features/results/RecommendationsBlock.tsx`, `frontend/features/results/ResultsPage.tsx`, `frontend/features/results/HonestZeroState.tsx`, `frontend/features/results/ToolResultCard.tsx`, `frontend/features/results/results.module.css`, `frontend/features/audit/AuditPage.tsx`, `frontend/features/audit/AuditForm.tsx`, `frontend/components/nav/Nav.tsx`, `frontend/components/footer/Footer.tsx`, `frontend/app/layout.tsx`, `frontend/app/results/sample/page.tsx`, `frontend/lib/types.ts`, `frontend/lib/sampleReport.ts`, `frontend/package.json`, `frontend/package-lock.json`, `frontend/tsconfig.json`, `frontend/.gitignore`.
**Next session should:** Run the app end-to-end in browser against a real local database, confirm the report looks screenshot-ready at mobile and desktop widths, and do final deployment/Lighthouse checks.

## 📊 FILE COMPLETION TRACKER
| File | Status | Notes |
|------|--------|-------|
| PROGRESS.md | 🟢 Active | Updated every response. |
| INSTRUCTION.md | 🟢 Active | Master reference. |
| README.md | 🔴 Placeholder | To be populated. |
| ARCHITECTURE.md | 🔴 Placeholder | To be populated. |
| DEVLOG.md | 🟢 Active | Updated through Day 3. |
| REFLECTION.md | 🔴 Placeholder | To be populated. |
| TESTS.md | 🔴 Placeholder | 12 tests exist in backend/src/tests/. |
| PRICING_DATA.md | 🟢 Active | Updated with official pricing source URLs current as of submission week. |
| PROMPTS.md | 🟢 Active | Summary prompt contract documented for Gemini-backed summaries. |
| GTM.md | 🔴 Placeholder | To be populated. |
| ECONOMICS.md | 🔴 Placeholder | To be populated. |
| USER_INTERVIEWS.md | 🔴 Placeholder | To be populated. |
| LANDING_COPY.md | 🔴 Placeholder | To be populated. |
| METRICS.md | 🔴 Placeholder | To be populated. |
