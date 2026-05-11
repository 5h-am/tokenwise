# Tests

Run all automated tests from the backend directory:

```bash
cd backend
npx vitest run
```

The current automated test suite lives in `backend/src/tests/audit.test.ts`. It contains 12 Vitest tests, including more than five tests that directly cover the audit engine and the surrounding token/scoring rules it depends on.

### `backend/src/tests/audit.test.ts`

**Run:** `cd backend && npx vitest run src/tests/audit.test.ts`

This file covers the core audit math and business rules. It matters because the product's credibility depends on deterministic recommendations: a user should not get a different savings estimate because an LLM phrased something differently.

The token waste tests verify that `naiveSessionTokens` matches a hand-calculated N=3 example, that the combined optimization strategy costs less than naive multi-turn context, and that the quadratic overhead factor rises above 1 for multi-turn sessions. They also check that `analyseTokenWaste` falls back to use-case defaults when the user does not provide token details, and returns `null` when the stack has no API-priced AI tools.

The scoring tests verify that `buildScoringCriteria` keeps every criterion between 0 and 1, and that `computeHealthScore` maps perfect and worst-case scores to the expected letter grades. This protects the results page from showing grades that do not match the underlying audit.

The audit engine tests check the business rules users will notice first. A solo user on a team/business plan gets a `wrong_plan` downgrade opportunity. Two tools in the same functional category both get a `redundant_tool` flag. Optimized spend is clamped so it never exceeds current spend. A zero-spend tool produces zero savings. A high-savings stack sets `credexRecommended` only when monthly savings are above the $500 threshold.

## Test List

1. **`naiveSessionTokens`**  
   Matches the hand-calculated N=3 token total. This catches arithmetic mistakes in the context-growth formula.

2. **`optimisedSessionTokens`**  
   Confirms combined prompt caching plus sliding-window context costs less than the naive N=12 session.

3. **`quadraticOverheadFactor`**  
   Confirms multi-turn sessions show overhead above a simple linear baseline.

4. **`analyseTokenWaste` fallback**  
   Verifies missing token details fall back to `USE_CASE_TOKEN_PROFILES`, so the audit still works with incomplete input.

5. **`analyseTokenWaste` non-AI exit**  
   Ensures token analysis does not appear when there are no API-priced AI tools.

6. **`buildScoringCriteria`**  
   Checks every scoring criterion stays inside `[0, 1]`.

7. **`computeHealthScore`**  
   Checks that raw scores map to the expected grade endpoints.

8. **Solo user on Business plan**  
   Verifies a one-person team on a team/business plan gets a downgrade opportunity.

9. **Redundant tools**  
   Verifies overlapping tools in the same functional category both get flagged.

10. **Optimized spend limit**  
   Ensures recommendations never make optimized spend higher than current spend.

11. **Zero-spend tool**  
   Ensures free tools do not produce fake savings.

12. **Credex recommended threshold**  
   Verifies the consultation recommendation only appears for high-savings audits.
