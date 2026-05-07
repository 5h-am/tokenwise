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
