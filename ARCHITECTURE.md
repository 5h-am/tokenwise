# Architecture

This repo is split on purpose: a **Next.js** app for the UI and a small **Express** API for validation, the audit engine, the database, and side effects like email. In production I host the **frontend on Vercel**, the **API on Render**, and the **database on Supabase** (managed PostgreSQL). They only talk over HTTPS using env-configured URLs and CORS.

## System diagram (ASCII)

```
                                    ┌─────────────────────────┐
                                    │     Google Gemini       │
                                    │  (AI summary text only) │
                                    └───────────▲─────────────┘
                                                │ HTTPS
                                                │
┌──────────────┐         HTTPS          ┌──────┴──────────────┐
│   Browser    │◄──────────────────────►│  Next.js (Vercel) │
│              │   HTML / RSC / assets  │  App Router pages │
└──────┬───────┘                        └──────────┬────────┘
       │                                           │
       │ fetch /api/*   (NEXT_PUBLIC_API_URL)      │ Server Components
       │                                           │ also call same API
       ▼                                           ▼
┌──────────────────────────────────────────────────────────────┐
│              Express API (Render)                             │
│  ┌─────────────┐  ┌──────────┐  ┌─────────┐  ┌────────────┐ │
│  │ rate limit  │→│ Zod valid │→│ normalize│→│ handlers   │ │
│  └─────────────┘  └──────────┘  └─────────┘  └─────┬──────┘ │
│                                                      │        │
│  audit: runAudit → score → persist → Gemini summary │        │
│  leads: honeypot check → insert → optional email     │        │
└──────────────────────────────┬───────────────────────┘        │
                               │ pg (DATABASE_URL, SSL prod)
                               ▼
                    ┌──────────────────────┐
                    │ Supabase PostgreSQL  │
                    │  audits  |  leads    │
                    └──────────────────────┘

Optional path: lead flow may attach a base64 screenshot via Nodemailer (Gmail SMTP),
if env is set and the client sends it — same Render service, not a separate worker.
```

The diagram is the mental model: **the browser hits Vercel for pages** and **Render for JSON**. Supabase never sees the browser directly; only the backend connects with the connection string.

## Repo layout

- **`frontend/`** — Next.js (App Router): `app/` routes, `features/` for landing, audit form, and results UI, `lib/api.ts` for calling the API, shared UI under `components/`.
- **`backend/`** — Express + TypeScript: `src/routes` wires URLs, `src/handlers` are thin, `src/services` orchestrate, `src/engine` is the deterministic audit math, `src/repositories` talk to Postgres, `migrations/` are plain SQL applied by `npm run migrate`.

## Request path: run an audit

1. The user fills the audit on Vercel (`/audit`). The form lives in React; submit calls **`POST {API}/api/audit`** from the browser with JSON (team size, tools, plans, spend, optional token fields).

2. On Render, Express hits **CORS** first (`ALLOWED_ORIGIN` must match the Vercel origin or local dev). Then a **stricter rate limit** applies to writes on `/api/audit`. Body size is capped at 10mb for JSON.

3. **Zod** (`auditInputSchema`) checks shape and types. **Normalize** middleware trims strings so the engine gets consistent input.

4. **`auditService.processAudit`** runs **`runAudit()`** in `engine/auditEngine.ts`. That file pulls **`pricingDatabase.ts`** for tool and plan metadata, finds cheaper plans and overlapping tools in the same category, flags seat waste, and optionally runs **`tokenWasteCalculator`** when API-style tools need it. **`scoringEngine`** turns the outcome into a health grade.

5. The handler returns **`shareId` plus the public report fields**. In parallel logic inside the service, the row is **`INSERT`ed** into **`audits`** via `auditRepo` — full input and report as **JSONB**, plus flat columns (savings, grade, Credex flag, counts) for easy queries.

6. **`generateAndPersistAuditSummary`** calls **Gemini** (`lib/gemini.ts`). If the call fails or the key is missing, a **fallback paragraph** is built from the numbers so the UI never depends on the model being up.

7. The user lands on **`/results/:shareId`** on Vercel. That route’s Server Component calls **`GET {API}/api/audit/:shareId`**, which reads one row and strips sensitive contact fields before JSON goes to the client. **`processAudit`** already waits for the summary step before the create response returns, so the stored report usually includes copy; **`SummaryPoller`** is still there to refresh the view if a client ever sees a missing summary (for example an older row or a failed update path).

## Request path: lead capture

1. From the results page, **`POST {API}/api/leads`** sends email (and optional company fields, share id, optional screenshot payload).

2. If the **honeypot** `website` field is filled, the handler **returns quietly** — spam bots get a no-op.

3. **`insertLead`** uses **`ON CONFLICT DO NOTHING`** on `(audit_share_id, email)` so double submits do not duplicate.

4. On first insert, **`sendAuditEmail`** may run through **Nodemailer + Gmail** if `GMAIL_USER` / `GMAIL_APP_PASSWORD` are set. The backend package still lists **Resend** for experiments, but the live path in `lib/email.ts` is Gmail transport, with **IPv4-first DNS** to reduce timeouts on Render’s network.

## Why I split it this way

**Next on Vercel** — Few routes, mostly static marketing feel plus two important flows (form + shareable results). App Router keeps boundaries clean, and server-side `getReport` avoids exposing the API URL logic only to the client.

**Express on Render** — All cross-cutting concerns sit in one place: rate limits, validation, errors, DB, and LLM calls. The engine stays **unit-testable** without importing React.

**Postgres on Supabase** — Audits are half structured, half nested JSON. **JSONB** for `input_json` and `report_json` avoids designing twelve relational tables before the product stabilises, while indexed columns still support “show me high-savings audits” style queries.

**Gemini for summaries** — The summary **explains** the deterministic report; it does not invent savings. The call is isolated so the provider can change later without rewriting `auditEngine`.

## Environment variables that matter

**Frontend:** `NEXT_PUBLIC_API_URL` (Render service URL), `NEXT_PUBLIC_SITE_URL` (canonical links where used).

**Backend:** `DATABASE_URL` (Supabase connection string), `ALLOWED_ORIGIN` (Vercel preview or production origin), `GEMINI_API_KEY` / `GEMINI_MODEL`, optional `GMAIL_*` for mail, optional rate limit tuning.

If any of these drift between deploys (especially **CORS origin** vs the real Vercel URL), the app looks broken in the browser even when the API is healthy — that is worth documenting in onboarding, not only here.

## What I would change at serious scale

Right now summaries and email run **in the request path** (or immediately after persist). That is fine for a class-sized or early-traffic product.

If audits spiked, I would **queue** summary generation and outbound email so **`POST /api/audit`** only writes the row and returns. Workers would retry Gemini failures without blocking the user.

Supabase would need **pooling** tuned for multiple Render instances (`pg` pool max is 10 per process today). I would watch connection counts and slow queries on `audits` and `leads`.

For analytics-heavy funnels I would still avoid logging PII into random tools; product events could go to a separate store while **Supabase stays the source of truth** for reports and leads.
