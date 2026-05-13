# Metrics

## North star

The north star metric is **how many users send their audit report to email**.

I picked this on purpose. Someone will only email the report if they think it is **actually useful** — not if they are just clicking through out of curiosity. It also usually means they want to **keep it for later** (finance, a co-founder, renewal season, or their own notes). So it is a stronger signal than a raw page view or even “audit completed,” because it combines **perceived value** and **intent to reuse**.

Daily active users would still be the wrong primary metric for this product. A founder might run an audit once before a renewal or after hiring, not every day. The north star should reflect **depth of engagement**, not habit frequency.

## Supporting metrics

**Audit completion rate** — how many people who start the form actually finish. If this is low, the form is asking too much too early or the tool list does not match how people describe their stack. The lever is simpler steps, clearer defaults, and honest “I don’t know” options.

**Share of audits with meaningful savings** — for example completed audits where potential savings pass a sensible threshold (the exact number can move as the engine improves). This tells you if traffic is reaching people where the audit has something real to say.

**Email capture on the results page** — still useful as a step before “send full report to email” exists or is visible everywhere. If savings look strong but nobody leaves an email, the results page may not feel trustworthy yet.

**Instrumentation to start with:** audit form started, audit submitted, results viewed, report emailed (when the feature is live), lead or follow-up submitted if you have one. Keep events anonymous where possible; do not dump raw emails into analytics tools.

## When to rethink the product

If lots of audits finish but almost nobody tries to **email or export** the report once that path is stable, the engine might be fine but the **results story** is weak — fix clarity and trust before rewriting scoring.

If completion rate is high but **savings-heavy** audits are rare, the issue is more likely **who finds the product** (distribution and positioning) than the form UX alone.
