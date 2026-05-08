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

describe('tokenWasteCalculator', () => {
  it('1. naiveSessionTokens matches hand-calculated value for N=3', () => {
    const N = 3, S = 1000, u = 200, r = 300;
    const result = naiveSessionTokens(N, S, u, r);
    expect(result).toBe(5100);
  });

  it('2. optimisedSessionTokens (combined) < naive for N=12', () => {
    const N = 12, S = 2000, u = 500, r = 800;
    const naive = naiveSessionTokens(N, S, u, r);
    const optimised = optimisedSessionTokens(N, S, u, r, { technique: 'combined' });
    expect(optimised).toBeLessThan(naive);
  });

  it('3. quadraticOverheadFactor returns > 1.0 for multi-turn sessions', () => {
    const factor = quadraticOverheadFactor(5, 1000, 300, 400);
    expect(factor).toBeGreaterThan(1.0);
  });

  it('4. analyseTokenWaste falls back to use-case defaults when no token params given', () => {
    const input = makeInput({
      tools: [makeTool({ toolId: 'anthropic_api', planId: 'pay_as_you_go', monthlySpend: 200, useCase: 'code_generation' })],
      teamSize: 3,
    });
    const result = analyseTokenWaste(input);
    expect(result).not.toBeNull();
    expect(result?.naiveMonthlyTokens).toBeGreaterThan(0);
  });

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

  it('7. computeHealthScore maps grades correctly', () => {
    const criteriaForAPlus = {
      wasteRatio: 1,
      planFitness: 1,
      toolRedundancy: 1,
      tokenEfficiency: 1,
      governanceHealth: 1,
    };
    const perfect = computeHealthScore(criteriaForAPlus);
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
    const downgradeOpp = cursorResult.opportunities.find(
      (o) => o.category === 'wrong_plan',
    );
    expect(downgradeOpp).toBeDefined();
    expect(downgradeOpp?.monthlySavings).toBeGreaterThan(0);
  });

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

  it('12. credexRecommended is true when savings > $500/mo', () => {
    const input = makeInput({
      tools: [
        makeTool({ toolId: 'cursor', planId: 'business', monthlySpend: 400, seats: 1, useCase: 'code_generation' }),
        makeTool({ toolId: 'github_copilot', planId: 'business', monthlySpend: 400, seats: 1, useCase: 'code_generation' }),
        makeTool({ toolId: 'claude', planId: 'team', monthlySpend: 300, seats: 1, useCase: 'content_writing' }),
        makeTool({ toolId: 'chatgpt', planId: 'team', monthlySpend: 300, seats: 1, useCase: 'content_writing' }),
      ],
      teamSize: 1,
    });

    const report = runAudit(input);

    expect(report.totalMonthlySavings).toBeGreaterThan(500);
    expect(report.credexRecommended).toBe(true);
  });
});
