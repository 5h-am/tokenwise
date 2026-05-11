# Environment Variable Setup

## Backend (set in Render dashboard)

| Variable | Where to get it |
| --- | --- |
| `DATABASE_URL` | Supabase -> Settings -> Database -> Connection string -> URI |
| `ANTHROPIC_API_KEY` | Anthropic Console -> API Keys, if the summary service is switched to Anthropic |
| `GEMINI_API_KEY` | Google AI Studio -> API Keys, used by the current summary service |
| `GEMINI_MODEL` | Keep `gemini-2.5-flash` unless the code changes |
| `RESEND_API_KEY` | Resend -> API Keys |
| `RESEND_FROM_EMAIL` | Verified sender in Resend |
| `ALLOWED_ORIGIN` | Your Vercel frontend URL |
| `NODE_ENV` | Set to `production` |
| `PORT` | Set to `3001`; Render also provides a port automatically |

## Frontend (set in Vercel dashboard)

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Your Render service URL |
| `NEXT_PUBLIC_SITE_URL` | Your Vercel deployment URL |
