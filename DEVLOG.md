## Day 1 — 2026-05-06
**Hours worked:** 1
**What I did:** Initial project setup and stack selection. Researched auditing engine logic.
**What I learned:** After getting the project, the first thing that came to my mind was what stack I should use. After thinking it through, I have decided to go with Next.js for the frontend, PostgreSQL for the database, and Express for the backend. At first, I thought to go with Supabase for the entire backend, but decided against it because creating a backend will give me more freedom and control. Also, having a backend will make the project more scalable for the future.
**Blockers / what I'm stuck on:** After thinking about the stack, the first thing that came to my mind was how should I implement auditing. I am researching auditing algorithms to tackle this issue.
**Plan for tomorrow:** Finalize auditing logic and start the spend input form.

## Day 2 — 2026-05-07
**Hours worked:** 4
**What I did:** Researched algorithms for auditing, compiled comprehensive AI pricing data, and designed the backend architecture flow.
**What I learned:** 
- Decided to split the logic into two core algorithms: one for performing the actual audit and another for calculating a final letter score (A to F) based on the audit report.
- Used Gemini to research standard auditing algorithms and discovered the FinOps Foundation framework for cloud management: **Inform, Optimize, and Operate**. This serves as the main inspiration for the audit engine.
- Realized that proper auditing starts with a clear map of ownership and usage. I need to map the AI tools used, who uses them, how they are used, and the specific requirements of the user.
- Established a robust backend architecture flow: `Frontend` → `Rate Limit Middleware` → `Schema Validation Middleware` → `Normalization Middleware` → `Handlers` → `Service (Audit Engine is called here)` → `Repository` → `Global Error Handling Middleware`.
**Blockers / what I'm stuck on:** None currently. Moving forward with implementation.
**Plan for tomorrow:** Begin implementing the backend architecture flow and the initial scaffolding for the two algorithms.

## Day 3 — 2026-05-08
**Hours worked:** 7
**What I did:** Completed Part 1 of the backend. Built the full project scaffold (`backend/` folder) and ported all five engine files: `types.ts`, `pricingDatabase.ts`, `tokenWasteCalculator.ts`, `scoringEngine.ts`, `auditEngine.ts`. Wrote all 12 canonical Vitest tests. All 12 pass green (941ms run time). Updated CI yml to run tsc + ESLint + vitest as three required gates.
**What I learned:** 
- The naive multi-turn token formula is genuinely quadratic: for N turns you resend the full conversation history, so total context tokens grow as N(N+1)/2. At N=12 sessions this is nearly 6× more tokens than a single-pass read would cost.
- Sliding-window context limiting caps the overhead to linear (O(N)) at the cost of some conversational memory. Prompt caching directly reduces repeated system-prompt charges. Combined, they're the two most impactful levers on API spend.
- TypeScript `noUncheckedIndexedAccess` is strict but catches real bugs — array lookups return `T | undefined` by default, which forced me to be explicit about every array access in the engine.
**Blockers / what I'm stuck on:** None. All 12 tests green. Awaiting Sham's go-ahead for Part 2 (database layer).
**Plan for tomorrow:** Part 2 — PostgreSQL schema, plain SQL migrations, repository layer for `audits` + `leads` tables.

## Day 4 — 2026-05-09
**Hours worked:** 5
**What I did:** Completed Parts 2 and 3 back to back. Part 2 was the full database layer — two plain SQL migration files (`001_create_audits.sql`, `002_create_leads.sql`), a custom migration runner script with a `_migrations` tracking table and per-file transactions, the `pg.Pool` connection wrapper with a fail-fast env guard, the `AppError` class, and both repositories (`auditRepo`, `leadRepo`). Part 3 was the Express skeleton — `asyncHandler`, global error middleware, three rate limiters (`auditLimiter`, `leadLimiter`, `defaultLimiter`), the `GET /api/health` route, a full rewrite of `index.ts` as an app factory, and a proper `server.ts` entry point that pings the database before binding the port. `tsc --noEmit` exits 0, all 12 Vitest tests still green.

On the frontend side, I finalized the design direction: a **terminal-based UI** — dark background, monospaced font, command-line aesthetic with typed-out output and structured grid panels for the audit results. The goal is to make the tool feel like something a senior engineer would actually use rather than a generic SaaS dashboard. The design gives an immediate technical credibility signal to the kind of CTOs and engineering leads who would be evaluating it.

**What I learned:**
- Writing the migration runner from scratch was more instructive than reaching for a library. The key insight is that a migration system only needs two things: an ordered list of files and a record of which ones have already run. Every migration framework is just that pattern with more surface area around it.
- The `ON CONFLICT DO NOTHING` + fallback SELECT pattern for idempotent inserts is cleaner than checking for existence first — it eliminates the race condition between the check and the insert entirely.
- PostgreSQL's `jsonb_set` lets you patch a single field inside a stored JSON column without deserializing and re-serializing the whole document. I used this for the async AI summary update so the audit row doesn't need a full rewrite when the summary arrives.
- Exporting the Express app as a factory function (`createApp()`) rather than a singleton is the correct pattern for testability — you can call `createApp()` in a test without binding a real port.

**Blockers / what I'm stuck on:** Hit a real mental wall at the start of Part 2 around the denormalized column design on the `audits` table. The assignment specifies storing the full `AuditReport` as JSONB, which is flexible, but you still want fast analytics queries (e.g. "show all high-savings audits") without scanning JSONB on every request. The solution was to extract specific scalar values (`total_monthly_savings`, `health_grade`, `credex_recommended`, etc.) as real columns at write time — the repository layer pulls them from the report before the INSERT. It's a classic CQRS trade-off: you pay a tiny write cost to get fast read paths. Once I framed it that way the design became obvious, but it took me a moment to see why the JSONB-only approach would hurt later.

Part 3 had its own small blocker: `trust proxy` on the Express app. The rate limiter reads the client IP, and behind a reverse proxy (Vercel, nginx) the real IP is in `X-Forwarded-For`, not `req.socket.remoteAddress`. Without `app.set('trust proxy', 1)` the limiter would see the proxy IP and effectively rate-limit everyone together. It's a one-liner fix but an easy thing to skip in development and then discover in production.

**Plan for tomorrow:** Part 4 — `POST /api/audit` (Zod schema, normalization middleware, handler, `auditService`, repo call, `shareId` response) and `GET /api/audit/:shareId` (public stripping of PII fields).

## Day 4 — 2026-05-09 (Session 2)
**Hours worked:** 6
**What I did:** Completed Parts 4 and 5 back to back. Part 4 implemented the Audit API (`POST /api/audit` and `GET /api/audit/:shareId`), including Zod schema validation, input normalization, and proper PII stripping for public reports. Part 5 added the Lead Capture API (`POST /api/leads`), which features an invisible honeypot field for abuse protection, idempotent database inserts to prevent duplicate leads, and integration with the Resend SDK for transactional emails. All typechecks, linting, and tests pass. Adhered strictly to the project's "no comments" policy.
**What I learned:** 
- TypeScript's `exactOptionalPropertyTypes` setting is extremely strict: defining a property as `companyName?: string` allows the property to be omitted, but forbids explicitly setting it to `undefined`. This required careful destructuring or explicit interface adjustments (`companyName?: string | undefined`) when passing normalized inputs down to the repository layer.
- ESLint's `no-empty` rule catches intentionally empty `catch` blocks (often used for silent failure, like a non-critical email failing to send). Adding a simple `return;` statement resolves the linting error without adding clutter.
- The combination of Resend for emails and Postgres `ON CONFLICT DO NOTHING` creates a robust, naturally idempotent system. If a user double-submits their email, the database silently ignores the second insert, preventing a duplicate email from being triggered.
**Blockers / what I'm stuck on:** None. The lead flow is fully functional and type-safe.
**Plan for tomorrow:** Part 6 — AI summary integration using the Anthropic API (with graceful fallbacks).

## Day 5 — 2026-05-10
**Hours worked:** 5
**What I did:** Completed Part 6 (AI Summary) and Part 7 (Final Checks & CI). For the AI summary, I implemented an async call that extracts insights from the `AuditReport` and persists it. Because I didn't have free Anthropic credits, I decided to adapt the integration to use the Gemini free tier (`gemini-2.5-flash`) instead of `claude-sonnet-4-6`. Wrote the canonical 12 test descriptions into `TESTS.md` and ensured all tests, linting, and typechecks pass perfectly. 
**What I learned:** 
- Swapping LLM providers mid-stream was seamless because the service layer abstracts the specific AI request logic. 
- Structuring prompt inputs carefully for Gemini (by formatting the report tools and opportunities into clean strings before the API call) yields concise, deterministic-feeling 100-word summaries.
**Blockers / what I'm stuck on:** None. The backend is 100% complete and validated.
**Plan for tomorrow:** Shift focus entirely to the frontend integration and the terminal-based UI buildout.

## Day 6 — 2026-05-11
**Hours worked:** 10
**What I did:** Built the entire frontend application from scratch using Next.js (App Router). Designed and implemented a responsive landing page, an interactive audit engine form, and a highly detailed results dashboard. Connected the frontend to the backend APIs, completely rebuilt the email delivery system to use Nodemailer, fixed Gemini AI summary constraints, and implemented dynamic report screenshotting using html2canvas.
**What I learned:** 
- **Next.js Frontend Architecture:** Building the frontend in Next.js with the App Router and CSS Modules provided excellent component isolation. I learned how to cleanly manage complex client-side state for the audit form, handle routing, and dynamically fetch/poll backend endpoints while strictly adhering to the project's minimalist design system.
- **Email Provider Restrictions:** Resend requires a fully verified custom domain to send emails to arbitrary addresses. Since I didn't own the testing domain (`tokenwise.com`), I quickly pivoted to `nodemailer` using a Gmail App Password, allowing free, unrestricted sending.
- **Gemini API Quirks:** Encountered a 404 error because the specific API key didn't have access to the exact `gemini-1.5-flash` model string on `v1beta`. I wrote a diagnostic script to query the `/models` endpoint, discovered `gemini-2.5-flash` was available, and successfully migrated. I also learned that strict `maxOutputTokens` can sometimes cause the model to halt mid-sentence. Removing the token cap and relying on highly specific prompt engineering ("MUST be strictly between 120 and 150 words") solved the truncation issue.
- **Express Payload Limits:** Sending a Base64-encoded screenshot from the frontend (`html2canvas`) resulted in a `413 Request Entity Too Large` error. Express `body-parser` defaults to a strict 100kb limit. Bumping it up with `express.json({ limit: '10mb' })` cleanly resolved the crash.
**Blockers / what I'm stuck on:** Overcame significant hurdles around email domain limitations and Gemini API versioning by writing custom diagnostic scripts and pivoting the implementation on the fly.
**Plan for tomorrow:** Final aesthetic polish and deployment.

## Day 6 - 2026-05-11 (Session 2)
**Hours worked:** 2
**What I did:** Added the deployment-readiness layer: Render config, Vercel config, Supabase migration files, production CORS, Supabase SSL handling, environment setup notes, and a split backend/frontend CI workflow. I also fixed the frontend build so it does not depend on fetching Google Fonts during CI, added ESLint wiring for the frontend, and verified the backend and frontend checks locally.
**What I learned:** Next.js production builds can fail in locked-down environments if `next/font/google` has to fetch fonts during build time. Switching to system font fallbacks made the build repeatable, which matters more for CI than having one exact typeface.
**Blockers / what I'm stuck on:** The first Vitest run failed because the Windows sandbox blocked access while loading the config file. Running the same test command outside the sandbox passed all 12 tests, so it was an environment issue rather than an app issue.
**Plan for tomorrow:** Finish the remaining submission docs and do one final deployment checklist pass.
