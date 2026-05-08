/**
 * auditEngine.ts
 *
 * Main audit engine. Exports a single public function: runAudit(input).
 *
 * All internal helpers are private (not exported) and follow the
 * business rules defined in the assignment document.
 */

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

// ─── Private helpers ──────────────────────────────────────────────────────────

/**
 * findPlan — look up a plan by planId within a ToolSpec.
 */
function findPlan(spec: ToolSpec, planId: string): PlanSpec | undefined {
  return spec.plans.find((p) => p.id === planId);
}

/**
 * findCheaperPlan — cheapest plan that still fits seat count + use case.
 * Returns undefined if current plan is already cheapest valid option.
 */
function findCheaperPlan(spec: ToolSpec, entry: ToolEntry): PlanSpec | undefined {
  const currentPlan = findPlan(spec, entry.planId);
  if (!currentPlan) return undefined;

  // Filter to plans that:
  // 1. Are cheaper than the current plan (cost per user-scenario)
  // 2. Support the use case
  // 3. Fit the seat count
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

/**
 * findRedundantTools — tools in the same functionalCategory as `entry`.
 */
function findRedundantTools(entry: ToolEntry, allTools: ToolEntry[]): ToolEntry[] {
  const spec = TOOL_SPECS[entry.toolId];
  if (!spec) return [];
  return allTools.filter((t) => {
    if (t.toolId === entry.toolId) return false; // exclude self
    const tSpec = TOOL_SPECS[t.toolId];
    return tSpec?.functionalCategory === spec.functionalCategory;
  });
}

/**
 * isPlanOversized — true if a cheaper viable plan exists.
 */
function isPlanOversized(spec: ToolSpec, entry: ToolEntry): boolean {
  return findCheaperPlan(spec, entry) !== undefined;
}

/**
 * hasSpendAnomaly — true if reported spend is outside 75–125% of list price.
 */
function hasSpendAnomaly(spec: ToolSpec, entry: ToolEntry): boolean {
  const plan = findPlan(spec, entry.planId);
  if (!plan) return false;
  if (entry.monthlySpend === 0) return false; // $0 tools are exempt

  const listPrice = plan.isPerSeat
    ? plan.monthlyUsd * entry.seats
    : plan.monthlyUsd;

  if (listPrice === 0) return false; // free plans: no anomaly check

  const ratio = entry.monthlySpend / listPrice;
  return ratio > 1.25 || ratio < 0.75;
}

/**
 * auditSingleTool — produces ToolAuditResult for one tool entry.
 *
 * Business rules enforced:
 * - Solo user on Business/Team plan → wrong_plan + downgrade opportunity
 * - Two tools in same functionalCategory → redundant_tool flag
 * - $0 spend tool → $0 savings
 * - optimizedMonthlySpend can never exceed currentMonthlySpend
 */
function auditSingleTool(
  entry: ToolEntry,
  allTools: ToolEntry[],
  teamSize: number,
): ToolAuditResult {
  const spec = TOOL_SPECS[entry.toolId];
  const flags: WasteCategory[] = [];
  const opportunities: SavingsOpportunity[] = [];

  // Base case: $0 spend → no savings possible
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
    // Unknown tool — no analysis possible
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

  // ── Rule 1: Wrong plan (solo user on team/business plan) ──────────────────
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
    // Non-solo but still has a cheaper valid plan available → wrong_plan
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

  // ── Rule 2: Redundant tools ───────────────────────────────────────────────
  const redundant = findRedundantTools(entry, allTools);
  if (redundant.length > 0) {
    flags.push('redundant_tool');
    // The more expensive tool in the pair should be the one flagged for removal.
    // We flag it here; the pairing tool will also be flagged in its own audit.
    const potentialSavings = entry.monthlySpend * 0.5; // conservative: save half
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

  // ── Rule 3: Spend anomaly ─────────────────────────────────────────────────
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

  // ── Final: clamp optimizedSpend ───────────────────────────────────────────
  // Invariant: optimizedMonthlySpend can NEVER exceed currentMonthlySpend
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

/**
 * computeUnitEconomics — derives per-seat and per-session economics.
 */
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
    // Estimate sessions from token data if available
    const avgTurns =
      input.avgSessionTurns ??
      (() => {
        // Can't import profile here without circular dep; use a reasonable default
        return 6;
      })();
    if (avgTurns > 0) {
      // rough sessions = naive tokens / tokens per session
      const tokensPerSession = tokenAnalysis.naiveMonthlyTokens / 100; // proxy
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

/**
 * selectTopOpportunities — top 3, de-duplicated by category.
 */
function selectTopOpportunities(toolResults: ToolAuditResult[]): SavingsOpportunity[] {
  const all: SavingsOpportunity[] = toolResults.flatMap((t) => t.opportunities);

  // Sort by savings descending
  all.sort((a, b) => b.monthlySavings - a.monthlySavings);

  // De-duplicate by category — keep only the biggest saving per category
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

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * runAudit — the main entry point.
 *
 * Takes an AuditInput, runs all engine logic, and returns a full AuditReport.
 * The `summary` field is always null here — it is filled by an async job.
 */
export function runAudit(input: AuditInput): AuditReport {
  // 1. Audit each tool
  const toolResults: ToolAuditResult[] = input.tools.map((entry) =>
    auditSingleTool(entry, input.tools, input.teamSize),
  );

  // 2. Token waste analysis
  const tokenWaste = analyseTokenWaste(input);
  const tokenRecs =
    tokenWaste !== null ? buildTokenOptimizationRecs(input, tokenWaste) : [];

  // 3. Totals
  const currentMonthlySpend = toolResults.reduce(
    (s, t) => s + t.currentMonthlySpend,
    0,
  );
  const optimizedMonthlySpend = toolResults.reduce(
    (s, t) => s + t.optimizedMonthlySpend,
    0,
  );
  const totalMonthlySavings = Math.max(
    0,
    currentMonthlySpend - optimizedMonthlySpend,
  );
  const totalAnnualSavings = totalMonthlySavings * 12;

  // 4. Scoring
  const criteria = buildScoringCriteria(input, toolResults, tokenWaste);
  const healthScore = computeHealthScore(criteria);

  // 5. Unit economics
  const unitEconomics = computeUnitEconomics(
    input,
    currentMonthlySpend,
    optimizedMonthlySpend,
    tokenWaste,
  );

  // 6. Top opportunities
  const topOpportunities = selectTopOpportunities(toolResults);

  // 7. Credex recommended
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
