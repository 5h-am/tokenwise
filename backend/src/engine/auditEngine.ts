import type {
  AuditInput,
  ToolEntry,
  ToolAuditResult,
  SavingsOpportunity,
  WasteCategory,
  UnitEconomics,
  AuditReport,
} from './types.js';
import { TOOL_SPECS } from './pricingDatabase.js';
import type { ToolSpec, PlanSpec } from './pricingDatabase.js';
import { analyseTokenWaste, buildTokenOptimizationRecs } from './tokenWasteCalculator.js';
import { buildScoringCriteria, computeHealthScore } from './scoringEngine.js';

function findPlan(spec: ToolSpec, planId: string): PlanSpec | undefined {
  return spec.plans.find((p) => p.id === planId);
}

function findCheaperPlan(spec: ToolSpec, entry: ToolEntry): PlanSpec | undefined {
  const currentPlan = findPlan(spec, entry.planId);
  if (!currentPlan) return undefined;

  const currentCost = currentPlan.isPerSeat
    ? currentPlan.monthlyUsd * entry.seats
    : currentPlan.monthlyUsd;

  const viableCheaperPlans = spec.plans
    .filter((p) => {
      if (p.id === currentPlan.id) return false;
      if (!p.supportedUseCases.includes(entry.useCase)) return false;
      if (entry.seats < p.minSeats) return false;
      if (p.maxSeats !== null && entry.seats > p.maxSeats) return false;
      const planCost = p.isPerSeat ? p.monthlyUsd * entry.seats : p.monthlyUsd;
      return planCost < currentCost;
    })
    .sort((a, b) => {
      const costA = a.isPerSeat ? a.monthlyUsd * entry.seats : a.monthlyUsd;
      const costB = b.isPerSeat ? b.monthlyUsd * entry.seats : b.monthlyUsd;
      return costA - costB;
    });

  return viableCheaperPlans[0];
}

function findRedundantTools(entry: ToolEntry, allTools: ToolEntry[]): ToolEntry[] {
  const spec = TOOL_SPECS[entry.toolId];
  if (!spec) return [];
  return allTools.filter((t) => {
    if (t.toolId === entry.toolId) return false;
    const tSpec = TOOL_SPECS[t.toolId];
    return tSpec?.functionalCategory === spec.functionalCategory;
  });
}

function hasSpendAnomaly(spec: ToolSpec, entry: ToolEntry): boolean {
  const plan = findPlan(spec, entry.planId);
  if (!plan) return false;
  if (entry.monthlySpend === 0) return false;

  const listPrice = plan.isPerSeat
    ? plan.monthlyUsd * entry.seats
    : plan.monthlyUsd;

  if (listPrice === 0) return false;

  const ratio = entry.monthlySpend / listPrice;
  return ratio > 1.25 || ratio < 0.75;
}

function auditSingleTool(
  entry: ToolEntry,
  allTools: ToolEntry[],
  teamSize: number,
): ToolAuditResult {
  const spec = TOOL_SPECS[entry.toolId];
  const flags: WasteCategory[] = [];
  const opportunities: SavingsOpportunity[] = [];

  if (entry.monthlySpend === 0) {
    return {
      toolId: entry.toolId,
      planId: entry.planId,
      currentMonthlySpend: 0,
      optimizedMonthlySpend: 0,
      monthlySavings: 0,
      flags: [],
      opportunities: [],
      isWellConfigured: true,
    };
  }

  if (!spec) {
    return {
      toolId: entry.toolId,
      planId: entry.planId,
      currentMonthlySpend: entry.monthlySpend,
      optimizedMonthlySpend: entry.monthlySpend,
      monthlySavings: 0,
      flags: [],
      opportunities: [],
      isWellConfigured: true,
    };
  }

  let optimizedSpend = entry.monthlySpend;

  const isSoloUser = teamSize === 1 || entry.seats === 1;
  const isTeamPlan =
    entry.planId === 'team' ||
    entry.planId === 'business' ||
    entry.planId === 'enterprise';

  const cheaperPlan = findCheaperPlan(spec, entry);

  if (isSoloUser && isTeamPlan && cheaperPlan) {
    const cheaperCost = cheaperPlan.isPerSeat
      ? cheaperPlan.monthlyUsd * entry.seats
      : cheaperPlan.monthlyUsd;

    flags.push('wrong_plan');
    const savings = entry.monthlySpend - cheaperCost;
    if (savings > 0) {
      opportunities.push({
        category: 'wrong_plan',
        toolId: entry.toolId,
        currentMonthlySpend: entry.monthlySpend,
        optimizedMonthlySpend: cheaperCost,
        monthlySavings: savings,
        annualSavings: savings * 12,
        reason: `As a solo user you're paying $${entry.monthlySpend}/mo for a team plan. Downgrading to ${cheaperPlan.label} ($${cheaperCost}/mo) saves $${savings.toFixed(2)}/mo.`,
        action: `Downgrade to ${cheaperPlan.label} ($${cheaperCost}/mo)`,
      });
      optimizedSpend = Math.min(optimizedSpend, cheaperCost);
    }
  } else if (cheaperPlan && !isSoloUser) {
    const cheaperCost = cheaperPlan.isPerSeat
      ? cheaperPlan.monthlyUsd * entry.seats
      : cheaperPlan.monthlyUsd;

    flags.push('wrong_plan');
    const savings = entry.monthlySpend - cheaperCost;
    if (savings > 0) {
      opportunities.push({
        category: 'wrong_plan',
        toolId: entry.toolId,
        currentMonthlySpend: entry.monthlySpend,
        optimizedMonthlySpend: cheaperCost,
        monthlySavings: savings,
        annualSavings: savings * 12,
        reason: `A cheaper plan (${cheaperPlan.label} at $${cheaperCost}/mo) meets your team's needs. Switching saves $${savings.toFixed(2)}/mo.`,
        action: `Switch to ${cheaperPlan.label} ($${cheaperCost}/mo)`,
      });
      optimizedSpend = Math.min(optimizedSpend, cheaperCost);
    }
  }

  const redundant = findRedundantTools(entry, allTools);
  if (redundant.length > 0) {
    flags.push('redundant_tool');
    const potentialSavings = entry.monthlySpend * 0.5;
    opportunities.push({
      category: 'redundant_tool',
      toolId: entry.toolId,
      currentMonthlySpend: entry.monthlySpend,
      optimizedMonthlySpend: entry.monthlySpend - potentialSavings,
      monthlySavings: potentialSavings,
      annualSavings: potentialSavings * 12,
      reason: `You have ${redundant.length + 1} tools in the same category (${spec.functionalCategory}). Consolidating to one saves approximately $${potentialSavings.toFixed(2)}/mo.`,
      action: `Consolidate overlapping ${spec.functionalCategory.replace(/_/g, ' ')} tools`,
    });
    optimizedSpend = Math.min(optimizedSpend, entry.monthlySpend - potentialSavings);
  }

  if (hasSpendAnomaly(spec, entry)) {
    flags.push('spend_anomaly');
    const plan = findPlan(spec, entry.planId);
    if (plan) {
      const listPrice = plan.isPerSeat
        ? plan.monthlyUsd * entry.seats
        : plan.monthlyUsd;
      opportunities.push({
        category: 'spend_anomaly',
        toolId: entry.toolId,
        currentMonthlySpend: entry.monthlySpend,
        optimizedMonthlySpend: listPrice,
        monthlySavings: Math.max(0, entry.monthlySpend - listPrice),
        annualSavings: Math.max(0, (entry.monthlySpend - listPrice) * 12),
        reason: `Your reported spend ($${entry.monthlySpend}/mo) is significantly different from list price ($${listPrice}/mo). Review billing for errors or negotiate a discount.`,
        action: `Audit billing vs list price ($${listPrice}/mo)`,
      });
      if (entry.monthlySpend > listPrice) {
        optimizedSpend = Math.min(optimizedSpend, listPrice);
      }
    }
  }

  const finalOptimized = Math.max(0, Math.min(entry.monthlySpend, optimizedSpend));
  const monthlySavings = entry.monthlySpend - finalOptimized;

  return {
    toolId: entry.toolId,
    planId: entry.planId,
    currentMonthlySpend: entry.monthlySpend,
    optimizedMonthlySpend: finalOptimized,
    monthlySavings,
    flags,
    opportunities,
    isWellConfigured: flags.length === 0,
  };
}

function computeUnitEconomics(
  input: AuditInput,
  currentMonthlySpend: number,
  optimizedMonthlySpend: number,
  tokenAnalysis: ReturnType<typeof analyseTokenWaste>,
): UnitEconomics {
  const seats = Math.max(1, input.teamSize);
  const costPerSeat = currentMonthlySpend / seats;
  const wastePerSeat = (currentMonthlySpend - optimizedMonthlySpend) / seats;

  let costPerSession: number | null = null;
  if (input.monthlyAISessions != null && input.monthlyAISessions > 0) {
    costPerSession = currentMonthlySpend / input.monthlyAISessions;
  } else if (tokenAnalysis?.naiveMonthlyTokens && tokenAnalysis.naiveMonthlyTokens > 0) {
    const avgTurns = input.avgSessionTurns ?? 6;
    if (avgTurns > 0) {
      const tokensPerSession = tokenAnalysis.naiveMonthlyTokens / 100;
      if (tokensPerSession > 0) {
        costPerSession = currentMonthlySpend / tokensPerSession;
      }
    }
  }

  return {
    costPerSeat: parseFloat(costPerSeat.toFixed(2)),
    costPerSession: costPerSession !== null ? parseFloat(costPerSession.toFixed(4)) : null,
    wastePerSeat: parseFloat(wastePerSeat.toFixed(2)),
    annualisedBurn: parseFloat((currentMonthlySpend * 12).toFixed(2)),
    annualisedOptimised: parseFloat((optimizedMonthlySpend * 12).toFixed(2)),
  };
}

function selectTopOpportunities(toolResults: ToolAuditResult[]): SavingsOpportunity[] {
  const all: SavingsOpportunity[] = toolResults.flatMap((t) => t.opportunities);

  all.sort((a, b) => b.monthlySavings - a.monthlySavings);

  const seen = new Set<WasteCategory>();
  const deduped: SavingsOpportunity[] = [];
  for (const opp of all) {
    if (!seen.has(opp.category)) {
      seen.add(opp.category);
      deduped.push(opp);
    }
    if (deduped.length >= 3) break;
  }

  return deduped;
}

export function runAudit(input: AuditInput): AuditReport {
  const toolResults: ToolAuditResult[] = input.tools.map((entry) =>
    auditSingleTool(entry, input.tools, input.teamSize),
  );

  const tokenWaste = analyseTokenWaste(input);
  const tokenRecs =
    tokenWaste !== null ? buildTokenOptimizationRecs(input, tokenWaste) : [];

  const currentMonthlySpend = toolResults.reduce(
    (s, t) => s + t.currentMonthlySpend,
    0,
  );
  const optimizedMonthlySpend = toolResults.reduce(
    (s, t) => s + t.optimizedMonthlySpend,
    0,
  );
  const totalMonthlySavings = Math.max(0, currentMonthlySpend - optimizedMonthlySpend);
  const totalAnnualSavings = totalMonthlySavings * 12;

  const criteria = buildScoringCriteria(input, toolResults, tokenWaste);
  const healthScore = computeHealthScore(criteria);

  const unitEconomics = computeUnitEconomics(
    input,
    currentMonthlySpend,
    optimizedMonthlySpend,
    tokenWaste,
  );

  const topOpportunities = selectTopOpportunities(toolResults);
  const credexRecommended = totalMonthlySavings > 500;

  return {
    toolResults,
    tokenWaste,
    tokenRecs,
    healthScore,
    currentMonthlySpend: parseFloat(currentMonthlySpend.toFixed(2)),
    optimizedMonthlySpend: parseFloat(optimizedMonthlySpend.toFixed(2)),
    totalMonthlySavings: parseFloat(totalMonthlySavings.toFixed(2)),
    totalAnnualSavings: parseFloat(totalAnnualSavings.toFixed(2)),
    unitEconomics,
    topOpportunities,
    credexRecommended,
    summary: null,
  };
}
