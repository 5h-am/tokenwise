# Tokenwise AI Spend Audit

Tokenwise is an AI spend audit tool for founders, finance leads, and engineering managers who want to know whether their team is overpaying for AI tools. A user enters their tools, plans, seat counts, and usage context; the audit engine returns savings opportunities, a health grade, token-waste analysis for API usage, and a plain-English summary of what to fix first.

It is built as a two-service app: a Next.js frontend for the audit flow and results pages, and an Express backend for validation, audit logic, persistence, lead capture, email, and AI summaries.

## Screenshots

<!-- SHAM: Add 3+ screenshots here or replace this section with a 30-second Loom/YouTube link. -->
<!-- Screenshot 1: Landing page hero -->
<!-- Screenshot 2: Audit form with 2-3 tools filled in -->
<!-- Screenshot 3: Results page showing savings breakdown -->

## Deployed URL

https://tokenwise-aiig.vercel.app/

## Quick Start

Clone the repo and install dependencies:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Create backend environment variables:

```bash
cd backend
cp .env.example .env
```

Create frontend environment variables:

```bash
cd ../frontend
cp .env.example .env.local
```

For a local database, set `DATABASE_URL` in `backend/.env`. For Supabase:

```bash
# 1. Create a Supabase project at supabase.com
# 2. Go to Settings -> Database -> Connection string -> URI
# 3. Copy the URI into backend/.env as DATABASE_URL
# 4. Run migrations:
psql $DATABASE_URL -f ../supabase/migrations/001_initial_schema.sql
psql $DATABASE_URL -f ../supabase/migrations/002_add_summary_index.sql
```

Run the backend:

```bash
cd backend
npm run dev
```

Run the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

Open `http://localhost:3000`. The frontend expects the API at `http://localhost:3001`, which is already in `frontend/.env.example`.

Run the checks:

```bash
cd backend
npm run build
npx tsc --noEmit
npx eslint .
npx vitest run

cd ../frontend
npx tsc --noEmit
npx eslint .
npm run build
```

Deploy the backend on Render:

```text
1. Push the repo to GitHub.
2. Create a new Web Service on render.com and connect the repo.
3. Use the root render.yaml in this repo.
4. Add DATABASE_URL, GEMINI_API_KEY, RESEND_API_KEY, RESEND_FROM_EMAIL, and ALLOWED_ORIGIN in Render.
5. Deploy. Render will build from backend/ and start node dist/server.js.
```

Deploy the frontend on Vercel:

```text
1. Import the frontend project on vercel.com.
2. Framework preset: Next.js.
3. Add NEXT_PUBLIC_API_URL with the Render service URL.
4. Add NEXT_PUBLIC_SITE_URL with the Vercel deployment URL.
5. Deploy. Vercel will run npm run build.
```

## Decisions

**Separate Next.js and Express instead of putting everything in Next API routes**  
The frontend handles routing, rendering, form state, and report pages. The backend owns validation, rate limiting, the audit engine, database writes, lead capture, and AI summaries. I chose the split because the audit logic is business logic, not page logic, and keeping it in Express makes it easier to test and deploy separately. The trade-off is more deployment setup: CORS, two env files, and two CI jobs. If this were a weekend prototype with no backend depth, I would probably keep it all inside Next.js.

**JSONB report storage plus denormalized columns**  
An audit report is nested: tools contain opportunities, opportunities contain savings and reasoning, and token analysis has its own shape. Storing the full input and report as JSONB keeps retrieval simple. I still pulled out fields like `total_monthly_savings`, `health_grade`, `credex_recommended`, `tool_count`, and `team_size` as real columns so analytics queries do not have to dig through JSONB. The trade-off is duplicated data at write time. If the product grew into a full analytics platform, I would add normalized reporting tables or materialized views.

**Deterministic audit math before AI summaries**  
The savings, flags, grades, and token calculations are all computed in TypeScript before the LLM is involved. The AI summary only explains the result. That keeps the product honest: if Gemini fails, the audit still works and falls back to a deterministic summary. The alternative was to ask an LLM to reason over raw tool data, but that would make the core recommendation engine harder to test. If this became a mature product, I would use the LLM for richer explanation, not for the source of truth.

**Plain SQL migrations instead of an ORM migration layer**  
The schema is small enough that SQL is clearer than hiding it behind an ORM. The app only needs two core tables, `audits` and `leads`, plus indexes, so the SQL files are easy to review and run directly against Supabase. The trade-off is less convenience when the schema changes. If the backend started adding many relational models, I would consider Prisma or Drizzle, but I would still keep a close eye on the generated SQL.

**System fonts instead of build-time Google font fetching**  
The original frontend used `next/font/google`, but production builds can fail in restricted CI environments if the build cannot reach Google Fonts. I switched to local system font fallbacks so the build is repeatable. The trade-off is that the typography is a little less custom. If the visual brand mattered more, I would self-host the font files in the repo so the design and build reliability both hold.
