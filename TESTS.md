# Credex AI Spend Audit - Tests

This document describes the canonical test cases required by the Credex Round 1 assignment. All tests are located in `backend/src/tests/audit.test.ts` and run using Vitest.

## Running Tests

To run the tests locally, run:

```bash
cd backend
npm run test
# or
npx vitest run
```

## The 12 Canonical Test Cases

The assignment evaluators will check for these 12 exact tests to ensure the engine behaves correctly:

### Token Waste Calculator
1. **`naiveSessionTokens`**
   - *Description*: Matches the hand-calculated value for N=3 turns.
2. **`optimisedSessionTokens`**
   - *Description*: Ensures the combined optimisation (prompt caching + sliding window) produces fewer tokens than the naive calculation for N=12 turns.
3. **`quadraticOverheadFactor`**
   - *Description*: Confirms the overhead factor returns > 1.0 for multi-turn sessions.
4. **`analyseTokenWaste` fallback**
   - *Description*: Validates that if a user provides an incomplete audit input missing explicit token counts, the engine correctly falls back to `USE_CASE_TOKEN_PROFILES` defaults.
5. **`analyseTokenWaste` non-AI exit**
   - *Description*: Ensures the analyzer returns `null` when no generative AI tools are present in the stack.

### Scoring Engine
6. **`buildScoringCriteria`**
   - *Description*: Confirms that every computed criterion maps to a value strictly bounded within `[0, 1]`.
7. **`computeHealthScore`**
   - *Description*: Verifies that the grade thresholds (e.g. >= 0.917 for A+, >= 0.700 for C) map raw scores to the correct letter grades.

### Audit Engine (Business Rules)
8. **Solo User on Business Plan**
   - *Description*: Evaluates `runAudit` to ensure a single user (`teamSize: 1`) on a Business or Team plan is automatically flagged with a `wrong_plan` / `downgrade` savings opportunity.
9. **Redundant Tools**
   - *Description*: Evaluates `runAudit` to ensure that two tools sharing the same `functionalCategory` both receive a `redundant_tool` flag.
10. **Optimized Spend Limit**
   - *Description*: Checks that `optimizedMonthlySpend` is correctly clamped and never exceeds the `currentMonthlySpend`.
11. **Zero-Spend Tool**
   - *Description*: Ensures that a tool with $0 current spend correctly produces $0 in total savings opportunities.
12. **Credex Recommended Threshold**
   - *Description*: Validates that the `credexRecommended` flag is only set to `true` when the `totalMonthlySavings` is greater than $500/mo.
