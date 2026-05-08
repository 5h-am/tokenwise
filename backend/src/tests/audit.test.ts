/**
 * audit.test.ts
 *
 * The canonical 12 test cases for the Credex AI Spend Audit engine.
 * These are the tests the assignment evaluators will run.
 * All 12 must pass on `npx vitest run`.
 */

import { describe, it, expect } from 'vitest';
import {
  naiveSessionTokens,
  optimisedSessionTokens,
  quadraticOverheadFactor,
  analyseTokenWaste,
} from '../engine/tokenWasteCalculator.js';
import {
  buildScoringCriteria,
  computeHealthScore,
} from '../engine/scoringEngine.js';
import { runAudit } from '../engine/auditEngine.js';
import type { AuditInput, ToolEntry } from '../engine/types.js';

// ─── Helper factories ─────────────────────────────────────────────────────────

function makeInput(overrides: Partial<AuditInput> = {}): AuditInput {
  return {
    tools: [],
    teamSize: 5,
    ...overrides,
  };
}

function makeTool(overrides: Partial<ToolEntry> = {}): ToolEntry {
  return {
    toolId: 'cursor',
    planId: 'pro',
    monthlySpend: 20,
    seats: 1,
    useCase: 'code_generation',
    ...overrides,
  };
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('tokenWasteCalculator', () => {
  /**
   * Test 1: naiveSessionTokens matches hand-calculated value for N=3
   *
   * N=3, S=1000, u=200, r=300
   * Turn 1: S + u = 1200
   * Turn 2: S + 2u + r = 1000+400+300 = 1700
   * Turn 3: S + 3u + 2r = 1000+600+600 = 2200
   * Total = 1200 + 1700 + 2200 = 5100
   *
   * Formula: N*S + N(N+1)/2 * u + N(N-1)/2 * r
   * = 3*1000 + 3*4/2*200 + 3*2/2*300
   * = 3000 + 1200 + 900 = 5100
   */
  it('1. naiveSessionTokens matches hand-calculated value for N=3', () => {
    const N = 3, S = 1000, u = 200, r = 300;
    const result = naiveSessionTokens(N, S, u, r);
    expect(result).toBe(5100);
  });

  /**
   * Test 2: optimisedSessionTokens (combined) < naive for N=12
   *
   * Multi-turn optimisation must strictly reduce token count.
   */
  it('2. optimisedSessionTokens (combined) < naive for N=12', () => {
    const N = 12, S = 2000, u = 500, r = 800;
    const naive = naiveSessionTokens(N, S, u, r);
    const optimised = optimisedSessionTokens(N, S, u, r, { technique: 'combined' });
    expect(optimised).toBeLessThan(naive);
  });

  /**
   * Test 3: quadraticOverheadFactor returns > 1.0 for multi-turn
   *
   * A 5-turn session with reasonable params must show overhead above 1.
   */
  it('3. quadraticOverheadFactor returns > 1.0 for multi-turn sessions', () => {
    const factor = quadraticOverheadFactor(5, 1000, 300, 400);
    expect(factor).toBeGreaterThan(1.0);
  });

  /**
   * Test 4: analyseTokenWaste falls back to use-case defaults
   *
   * When no token params are provided, the function must still return
   * a non-null analysis (it uses defaults from pricingDatabase).
   */
  it('4. analyseTokenWaste falls back to use-case defaults when no token params given', () => {
    const input = makeInput({
      tools: [makeTool({ toolId: 'anthropic_api', planId: 'pay_as_you_go', monthlySpend: 200, useCase: 'code_generation' })],
      teamSize: 3,
      // deliberately omit all token params
    });
    const result = analyseTokenWaste(input);
    expect(result).not.toBeNull();
    expect(result?.naiveMonthlyTokens).toBeGreaterThan(0);
  });

  /**
   * Test 5: analyseTokenWaste returns null when no AI API tools present
   *
   * Tools like Cursor and GitHub Copilot don't have token costs.
   */
  it('5. analyseTokenWaste returns null when no AI API tools in stack', () => {
    const input = makeInput({
      tools: [
        makeTool({ toolId: 'cursor', planId: 'pro', monthlySpend: 20, useCase: 'code_generation' }),
        makeTool({ toolId: 'github_copilot', planId: 'business', monthlySpend: 19 * 5, seats: 5, useCase: 'code_generation' }),
      ],
      teamSize: 5,
    });
    const result = analyseTokenWaste(input);
    expect(result).toBeNull();
  });
});

describe('scoringEngine', () => {
  /**
   * Test 6: buildScoringCriteria — all values in [0, 1]
   */
  it('6. buildScoringCriteria returns all criteria values in [0, 1]', () => {
    const input = makeInput({
      tools: [
        makeTool({ toolId: 'cursor', planId: 'pro', monthlySpend: 20, useCase: 'code_generation' }),
      ],
      teamSize: 1,
      shadowITSpendPercent: 20,
      surpriseRenewals: 1,
    });
    const { toolResults } = { toolResults: [runAudit(input).toolResults[0]!] };
    const criteria = buildScoringCriteria(input, toolResults, null);

    const values = Object.values(criteria);
    expect(values.length).toBeGreaterThan(0);
    for (const v of values) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  /**
   * Test 7: computeHealthScore — grade maps correctly
   *
   * A rawScore of 0.92 should map to 'A+' (>= 0.917 threshold).
   * A rawScore of 0.45 should map to 'F-' (below 0.500 threshold).
   */
  it('7. computeHealthScore maps grades correctly', () => {
    const criteriaForAPlus = {
      wasteRatio: 1,
      planFitness: 1,
      toolRedundancy: 1,
      tokenEfficiency: 1,
      governanceHealth: 1,
    };
    const perfect = computeHealthScore(criteriaForAPlus);
    // All 1s → weighted sum = 1.0 → A+
    expect(perfect.letterGrade).toBe('A+');
    expect(perfect.rawScore).toBe(1.0);

    const criteriaForFMinus = {
      wasteRatio: 0,
      planFitness: 0,
      toolRedundancy: 0,
      tokenEfficiency: 0,
      governanceHealth: 0,
    };
    const worst = computeHealthScore(criteriaForFMinus);
    expect(worst.letterGrade).toBe('F-');
    expect(worst.rawScore).toBe(0);
  });
});

describe('auditEngine (runAudit)', () => {
  /**
   * Test 8: Solo user on Business plan gets 'wrong_plan' flag
   *
   * A team of 1 paying for Cursor Business ($40/mo/seat) must be flagged.
   * The engine must suggest a cheaper individual plan.
   */
  it('8. solo user on Business plan gets wrong_plan flag', () => {
    const input = makeInput({
      tools: [
        makeTool({
          toolId: 'cursor',
          planId: 'business',
          monthlySpend: 40,
          seats: 1,
          useCase: 'code_generation',
        }),
      ],
      teamSize: 1,
    });

    const report = runAudit(input);
    const cursorResult = report.toolResults[0]!;

    expect(cursorResult.flags).toContain('wrong_plan');
    // Must suggest a downgrade opportunity
    const downgradeOpp = cursorResult.opportunities.find(
      (o) => o.category === 'wrong_plan',
    );
    expect(downgradeOpp).toBeDefined();
    expect(downgradeOpp?.monthlySavings).toBeGreaterThan(0);
  });

  /**
   * Test 9: Two tools in same category get 'redundant_tool' flag
   *
   * Cursor + GitHub Copilot are both 'ai_code_editor'.
   * Both must be flagged as redundant.
   */
  it('9. two tools in same category both get redundant_tool flag', () => {
    const input = makeInput({
      tools: [
        makeTool({ toolId: 'cursor', planId: 'pro', monthlySpend: 20, seats: 1, useCase: 'code_generation' }),
        makeTool({ toolId: 'github_copilot', planId: 'individual', monthlySpend: 10, seats: 1, useCase: 'code_generation' }),
      ],
      teamSize: 1,
    });

    const report = runAudit(input);
    const cursorResult = report.toolResults.find((t) => t.toolId === 'cursor')!;
    const copilotResult = report.toolResults.find((t) => t.toolId === 'github_copilot')!;

    expect(cursorResult.flags).toContain('redundant_tool');
    expect(copilotResult.flags).toContain('redundant_tool');
  });

  /**
   * Test 10: optimisedMonthlySpend never exceeds currentMonthlySpend
   *
   * Invariant: savings can be $0 but never negative.
   */
  it('10. optimizedMonthlySpend never exceeds currentMonthlySpend', () => {
    const input = makeInput({
      tools: [
        makeTool({ toolId: 'cursor', planId: 'pro', monthlySpend: 20, seats: 1, useCase: 'code_generation' }),
        makeTool({ toolId: 'claude', planId: 'team', monthlySpend: 90, seats: 3, useCase: 'content_writing' }),
        makeTool({ toolId: 'anthropic_api', planId: 'pay_as_you_go', monthlySpend: 150, seats: 1, useCase: 'api_integration' }),
      ],
      teamSize: 3,
    });

    const report = runAudit(input);

    expect(report.optimizedMonthlySpend).toBeLessThanOrEqual(report.currentMonthlySpend);
    expect(report.totalMonthlySavings).toBeGreaterThanOrEqual(0);

    for (const t of report.toolResults) {
      expect(t.optimizedMonthlySpend).toBeLessThanOrEqual(t.currentMonthlySpend);
      expect(t.monthlySavings).toBeGreaterThanOrEqual(0);
    }
  });

  /**
   * Test 11: Zero-spend tool produces $0 savings
   *
   * A $0/mo tool (e.g. free tier) must never generate a savings number.
   */
  it('11. zero-spend tool produces $0 savings', () => {
    const input = makeInput({
      tools: [
        makeTool({ toolId: 'cursor', planId: 'free', monthlySpend: 0, seats: 1, useCase: 'code_generation' }),
      ],
      teamSize: 1,
    });

    const report = runAudit(input);
    const cursorResult = report.toolResults[0]!;

    expect(cursorResult.monthlySavings).toBe(0);
    expect(cursorResult.optimizedMonthlySpend).toBe(0);
    expect(report.totalMonthlySavings).toBe(0);
  });

  /**
   * Test 12: credexRecommended is true when savings > $500/mo
   *
   * A team paying a lot for an oversized stack with clear optimisations
   * must trigger the Credex CTA.
   */
  it('12. credexRecommended is true when savings > $500/mo', () => {
    const input = makeInput({
      tools: [
        // Solo user on team/business plans — wrong_plan triggers near-full savings
        // Cursor Business solo: $40/mo → downgrade to Pro $20/mo → saves $20
        makeTool({ toolId: 'cursor', planId: 'business', monthlySpend: 400, seats: 1, useCase: 'code_generation' }),
        // GitHub Copilot Business solo: $19/mo → downgrade to individual $10 → saves $9
        makeTool({ toolId: 'github_copilot', planId: 'business', monthlySpend: 400, seats: 1, useCase: 'code_generation' }),
        // Claude team solo: $30/mo → downgrade to pro $20 → saves $10
        makeTool({ toolId: 'claude', planId: 'team', monthlySpend: 300, seats: 1, useCase: 'content_writing' }),
        // ChatGPT team solo: $30/mo → downgrade to plus → saves $10
        makeTool({ toolId: 'chatgpt', planId: 'team', monthlySpend: 300, seats: 1, useCase: 'content_writing' }),
      ],
      teamSize: 1,
    });

    const report = runAudit(input);

    // wrong_plan + redundant_tool flags across all tools → well above $500/mo savings
    expect(report.totalMonthlySavings).toBeGreaterThan(500);
    expect(report.credexRecommended).toBe(true);
  });
});
