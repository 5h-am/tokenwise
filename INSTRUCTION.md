# INSTRUCTION.md — Master Reference for Antigravity

## ⚠️ ABSOLUTE RULES — NEVER BREAK THESE
1. **ALWAYS update `PROGRESS.md` at the end of every single response.** No exceptions. Even if the task was a one-line fix, a question, or a brainstorm — update PROGRESS.md. Treat it like a heartbeat.
2. **ALWAYS update `INSTRUCTION.md`** whenever a decision is made, context changes, or anything new is discovered about the project.
3. **ALWAYS append** session logs in `PROGRESS.md` and key decisions in `INSTRUCTION.md`. Never overwrite or replace previous entries.
4. **NEVER touch any other `.md` file** unless Sham explicitly says the word **"show"** or directly instructs you to edit that specific file.
5. **NEVER write comments in any code file.** No `//` comments, no `/* */` block comments, no JSDoc `/** */`. Code must be self-explanatory through naming. This rule has zero exceptions.

---

## REQUIRED FILES (14 TOTAL)

### Meta Files (2)
- [ ] `PROGRESS.md` — Live tracker (Update every turn)
- [ ] `INSTRUCTION.md` — Master reference (Update on decisions)

### Engineering Files (7)
- [ ] `README.md` — Summary, screenshots, quick start, 5 trade-off decisions, deployed URL
- [ ] `ARCHITECTURE.md` — Mermaid/ASCII system diagram, data flow, stack justification, 10k audits/day scaling
- [ ] `DEVLOG.md` — One entry per day for all 7 days, strict format
- [ ] `REFLECTION.md` — 5 questions, 150–400 words each
- [ ] `TESTS.md` — All automated tests listed, min 5 covering audit engine
- [ ] `PRICING_DATA.md` — Every tool price with official vendor URL + verification date
- [ ] `PROMPTS.md` — Full LLM prompts used, reasoning, what failed

### Entrepreneurial Files (5)
- [ ] `GTM.md` — 300–700 words: Target user, Google searches, first 100 users, unfair channel, traction
- [ ] `ECONOMICS.md` — 300–700 words: Lead value, CAC, conversion rates, $1M ARR math
- [ ] `USER_INTERVIEWS.md` — 3 real conversations (names/initials, roles, quotes, findings)
- [ ] `LANDING_COPY.md` — Hero headline, subheadline, CTA, social proof, 5 FAQs
- [ ] `METRICS.md` — 200–500 words: North Star metric, 3 input metrics, instruments, pivot trigger

### Infrastructure (Non-MD)
- [ ] `.github/workflows/ci.yml` — Lint + tests on push to main

---

## MVP FEATURE SPECS (ALL 6 REQUIRED)
1. **Spend input form** — 8 tools (Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, + one of Windsurf/v0), per-tool fields (plan, monthly spend, seats), team size, use case, localStorage persistence.
2. **Audit engine** — Hardcoded rules (no AI), defensible to a finance person, covers: right plan?, cheaper same-vendor plan?, cheaper alternative?, retail vs credits?
3. **Audit results page** — Per-tool breakdown, hero savings (monthly + annual), Credex CTA if >$500/mo, honest "you're spending well" if <$100/mo.
4. **AI-generated summary** — ~100 words via Anthropic API, graceful fallback to template, full prompt in PROMPTS.md.
5. **Lead capture** — Email + optional fields, real backend, transactional email, abuse protection (document choice).
6. **Shareable URL** — Unique per audit, PII stripped, Open Graph + Twitter Card tags.

---

## CONSTRAINTS & REQUIREMENTS
- **No website builders** (Wix, Webflow, Framer, Bubble, admin templates).
- **TypeScript strongly preferred** — if plain JS, justify it.
- **No secrets in the repo** — environment variables only.
- **Lighthouse mobile on deployed URL**: Performance ≥ 85, Accessibility ≥ 90, Best Practices ≥ 90.
- **Git history**: Commits on ≥5 distinct calendar days; Conventional Commits format (`feat:`, `fix:`, etc.).

---

## DEVLOG FORMAT
```md
## Day N — YYYY-MM-DD
**Hours worked:** X
**What I did:** ...
**What I learned:** ...
**Blockers / what I'm stuck on:** ...
**Plan for tomorrow:** ...
```

---

## REFLECTION QUESTIONS (150–400 words each)
1. What was the most difficult technical challenge and how did you solve it?
2. If you had 30 more days, what would you prioritize building?
3. How would you scale this to handle 100,000 audits per month?
4. What was the most surprising thing you learned from user interviews?
5. Why did you choose your specific tech stack?

---

## EVALUATION RUBRIC (100 POINTS)
- [Details TBD by user or as discovered]

---

## KEY DECISIONS LOG
| Date | Decision | Reason |
|------|----------|--------|
| 2026-05-06 | Initial project setup | Creating file structure as per assignment requirements. |
| 2026-05-06 | Tech Stack Selection | Next.js (Frontend), PostgreSQL (Database), Express (Backend) for maximum control and scalability. |
| 2026-05-08 | AI summary via dedicated GET endpoint | `GET /api/audit/:shareId/summary` polls for the summary separately. Keeps POST /api/audit fast, gives the frontend a clean polling target, and avoids blocking the response on an LLM call. |
| 2026-05-08 | No code comments ever | Self-explanatory naming over inline documentation. Zero exceptions.
