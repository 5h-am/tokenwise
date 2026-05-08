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
