# Week 1 Reflection

## 1. The hardest bug

If someone else cloned this repo or tried to deploy it without reading every env line, the thing that would waste their afternoon is not really a single line of application logic. It is the split between the Next.js frontend and the Express API.

The backend wires CORS so it only trusts `ALLOWED_ORIGIN`, and if that variable is missing it quietly falls back to `http://localhost:3000` (see `backend/src/index.ts`). The frontend always talks to the API through `NEXT_PUBLIC_API_URL` in `frontend/lib/api.ts`. So you can have both servers running and still get failed audits in the browser, with the kind of vague network error that does not point you at CORS until you remember to check the Network tab for a blocked preflight.

What I assumed first was that the audit payload or the database was wrong, because the same request shape worked in tools like curl or Postman. What actually mattered was the browser origin versus what the API was willing to accept, plus making sure the public API URL in the build really pointed at the deployed backend and not an old localhost value.

The lesson I would pass on is: when the stack is split like this, treat env and CORS as part of the feature, not deployment trivia. If I were onboarding someone tomorrow, I would tell them to verify those two variables before they touch any React or scoring code.

## 2. A decision I reversed mid-week

There were two reversals this week, both for honest reasons.

**LLM provider.** I started on Anthropic’s API, then switched to Gemini mid-week because cost and speed looked better on paper. After the switch, the output shape and behaviour diverged enough from what I had already tuned the prompts around that it started breaking assumptions in the prompt logic. I ended up spending more time patching that than I would have spent just staying on Anthropic. I switched back. The lesson was blunt: do not swap the foundation mid-build unless the reason is overwhelming, because everything upstream is coupled to how that model answers.

**Emailing a screenshot of the report.** I wanted a flow where, after the audit report is generated, a screenshot of the report page gets emailed to the user. I tried Resend first, but it wants a verified domain, which I do not have right now. I moved to Nodemailer and it worked fine locally. On deploy, I kept hitting connection timeouts. I tried a few angles, but the deadline was close and I did not want to destabilise the rest of the app chasing SMTP through a hosting provider’s network rules. So I hid the feature in the frontend. The code is still there, it is just not exposed. If I come back to it, the wiring is mostly in place and turning it back on should be a contained piece of work.

## 3. What I would build in week 2

Right now the audit is still something the user has to start. If I had a second week, I would push toward an audit product that hooks into the tools or agents people already use, and runs after each session or focused work block without a manual trigger.

The picture in my head is: you finish a Cursor session or a long Claude thread, the system notices that block is done, pulls the relevant data in the background, and by the time you open the dashboard the report is already sitting there. Each session gets its own report, and you can scan across sessions for patterns — whether you are getting faster, whether the same mistakes repeat, where time actually goes.

The user’s job becomes reviewing, not creating. That matters because the hardest part of any reflection or analytics product is consistent usage. If generation is automatic, that whole motivation problem gets much smaller.

What I would still avoid in week two is scope creep on nice-to-have polish before that ingestion path is credible. The riskiest assumption to test next is whether people trust an automated pass over their work enough to act on it, or whether they will always want a human confirmation step.

## 4. How I used AI tools

My main tools were Cursor and Claude. Most of the frontend came out of that partnership — repetitive structure like forms, cards, and basic page layouts. That is where AI actually saves clock time, because there is no craft in writing the fifth near-identical input wrapper.

I also used Claude as a sounding board for the audit scoring logic. I already had the idea in my head; talking it through helped me structure it into something maintainable.

What I kept away from AI was the overall project layout. I have seen what happens when you let a model scaffold a Next.js tree: it runs, but it does not match how you navigate code in your own head, and you fight it for the rest of the project. Same for core components — I prefer writing those myself so they follow patterns I will actually reuse instead of one-off styles that technically work.

I did use AI for CSS, but I stayed on top of it. Responsiveness in particular needed manual passes; things that looked fine on one breakpoint would fall apart on another, and the model rarely catches that with the same rigour a human eye does.

One concrete mistake from AI that stuck with me: I asked for help on an API route and got an example using `req.body` in a Next.js App Router handler. In App Router you need `await request.json()`. It was confidently wrong, and if I had pasted it without thinking I would have been debugging a silent or confusing failure. That is the category of error you have to stay alert for — the model optimises for “looks like Express” unless you constrain it.

## 5. Self-ratings

**Discipline — 9/10**  
I am in the middle of exams and still shipped this without letting either side collapse completely.

**Code quality — 7/10**  
Structure and practices are in a good place and the codebase should scale, but I can point to a few deadline-adjacent corners I would refactor if I had another quiet day.

**Design sense — 7/10**  
The UI had AI assistance, but information hierarchy and flow were decisions I owned, and I pushed back on default layouts when they felt clunky. I think the overall UX reads as intentional rather than generic.

**Problem solving — 8/10**  
Most blockers I worked through — including getting the results page and async summary path to behave reliably, the provider switch, and the email fallback strategy. I dock one point because the Nodemailer production issue is not fully solved; it is managed, not closed.

**Entrepreneurial thinking — 9/10**  
I did not only build. I ran validation through a Google Form, pushed it through WhatsApp groups and Reddit, and iterated the idea until the version I shipped felt closer to real demand than what I sketched on day one.
