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

function planMonthlyCost(plan: PlanSpec, seats: number): number {
  return plan.isPerSeat ? plan.monthlyUsd * seats : plan.monthlyUsd;
}

function findCheaperPlan(spec: ToolSpec, entry: ToolEntry): PlanSpec | undefined {
  const currentPlan = findPlan(spec, entry.planId);
  if (!currentPlan) return undefined;

  const currentCost = planMonthlyCost(currentPlan, entry.seats);

  const viableCheaperPlans = spec.plans
    .filter((p) => {
      if (p.id === currentPlan.id) return false;
      if (p.monthlyUsd === 0) return false;
      if (!p.supportedUseCases.includes(entry.useCase)) return false;
      if (entry.seats < p.minSeats) return false;
      if (p.maxSeats !== null && entry.seats > p.maxSeats) return false;
      return planMonthlyCost(p, entry.seats) < currentCost;
    })
    .sort((a, b) => {
      return planMonthlyCost(a, entry.seats) - planMonthlyCost(b, entry.seats);
    });

  return viableCheaperPlans[0];
}

function findCheaperAlternative(entry: ToolEntry): { spec: ToolSpec; plan: PlanSpec; monthlyCost: number } | undefined {
  const currentSpec = TOOL_SPECS[entry.toolId];
  if (!currentSpec) return undefined;

  const viableAlternatives = Object.values(TOOL_SPECS)
    .filter((spec) => spec.id !== entry.toolId)
    .filter((spec) => spec.functionalCategory === currentSpec.functionalCategory)
    .flatMap((spec) =>
      spec.plans
        .filter((plan) => plan.monthlyUsd > 0)
        .filter((plan) => plan.supportedUseCases.includes(entry.useCase))
        .filter((plan) => entry.seats >= plan.minSeats)
        .filter((plan) => plan.maxSeats === null || entry.seats <= plan.maxSeats)
        .map((plan) => ({
          spec,
          plan,
          monthlyCost: planMonthlyCost(plan, entry.seats),
        })),
    )
    .filter((candidate) => candidate.monthlyCost < entry.monthlySpend)
    .sort((a, b) => a.monthlyCost - b.monthlyCost);

  const best = viableAlternatives[0];
  if (!best) return undefined;

  const monthlySavings = entry.monthlySpend - best.monthlyCost;
  if (monthlySavings < Math.max(10, entry.monthlySpend * 0.25)) return undefined;

  return best;
}

function findCreditOpportunity(
  spec: ToolSpec,
  entry: ToolEntry,
  input: AuditInput,
): { freePlan: PlanSpec; threshold: number } | undefined {
  const freePlan = spec.plans.find(
    (plan) =>
      plan.monthlyUsd === 0 &&
      plan.supportedUseCases.includes(entry.useCase) &&
      entry.seats >= plan.minSeats &&
      (plan.maxSeats === null || entry.seats <= plan.maxSeats),
  );

  if (!freePlan || !spec.creditNote || entry.seats !== 1 || input.monthlyAISessions == null) {
    return undefined;
  }

  const threshold = entry.toolId === 'github_copilot' ? 50 : 25;
  if (input.monthlyAISessions > threshold) return undefined;

  return { freePlan, threshold };
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

  const listPrice = planMonthlyCost(plan, entry.seats);

  if (listPrice === 0) return false;

  const ratio = entry.monthlySpend / listPrice;
  return ratio > 1.25 || ratio < 0.75;
}

function auditSingleTool(
  entry: ToolEntry,
  allTools: ToolEntry[],
  input: AuditInput,
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

  const teamSize = input.teamSize;
  const isSoloUser = teamSize === 1 || entry.seats === 1;
  const isTeamPlan =
    entry.planId === 'team' ||
    entry.planId === 'business' ||
    entry.planId === 'enterprise';

  const cheaperPlan = findCheaperPlan(spec, entry);
  const currentPlan = findPlan(spec, entry.planId);

  if (currentPlan && entry.seats > teamSize) {
    const optimizedSeatCount = Math.max(1, teamSize);
    const activeSeatCost = currentPlan.isPerSeat
      ? currentPlan.monthlyUsd * optimizedSeatCount
      : entry.monthlySpend;
    const savings = entry.monthlySpend - activeSeatCost;
    if (savings > 0) {
      flags.push('underutilised_seats');
      opportunities.push({
        category: 'underutilised_seats',
        toolId: entry.toolId,
        currentMonthlySpend: entry.monthlySpend,
        optimizedMonthlySpend: activeSeatCost,
        monthlySavings: savings,
        annualSavings: savings * 12,
        reason: `You are paying for ${entry.seats} seat${entry.seats === 1 ? '' : 's'} while the team size is ${teamSize}. Reducing billing to ${optimizedSeatCount} active seat${optimizedSeatCount === 1 ? '' : 's'} brings this line item to $${activeSeatCost}/mo and saves $${savings.toFixed(2)}/mo.`,
        action: `Remove ${entry.seats - optimizedSeatCount} unused seat${entry.seats - optimizedSeatCount === 1 ? '' : 's'}`,
      });
      optimizedSpend = Math.min(optimizedSpend, activeSeatCost);
    }
  }

  if (isSoloUser && isTeamPlan && cheaperPlan) {
    const cheaperCost = planMonthlyCost(cheaperPlan, entry.seats);

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
    const cheaperCost = planMonthlyCost(cheaperPlan, entry.seats);

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

  const alternative = findCheaperAlternative(entry);
  if (alternative) {
    const savings = entry.monthlySpend - alternative.monthlyCost;
    flags.push('alternative_tool');
    opportunities.push({
      category: 'alternative_tool',
      toolId: entry.toolId,
      currentMonthlySpend: entry.monthlySpend,
      optimizedMonthlySpend: alternative.monthlyCost,
      monthlySavings: savings,
      annualSavings: savings * 12,
      reason: `${alternative.spec.name} ${alternative.plan.label} supports ${entry.useCase.replace(/_/g, ' ')} for ${entry.seats} seat${entry.seats === 1 ? '' : 's'} at $${alternative.monthlyCost}/mo versus your reported $${entry.monthlySpend}/mo, saving $${savings.toFixed(2)}/mo if the team accepts a same-category replacement.`,
      action: `Evaluate ${alternative.spec.name} ${alternative.plan.label} ($${alternative.monthlyCost}/mo)`,
    });
    optimizedSpend = Math.min(optimizedSpend, alternative.monthlyCost);
  }

  const creditOpportunity = findCreditOpportunity(spec, entry, input);
  if (creditOpportunity) {
    const savings = entry.monthlySpend;
    flags.push('credits_opportunity');
    opportunities.push({
      category: 'credits_opportunity',
      toolId: entry.toolId,
      currentMonthlySpend: entry.monthlySpend,
      optimizedMonthlySpend: 0,
      monthlySavings: savings,
      annualSavings: savings * 12,
      reason: `You reported ${input.monthlyAISessions} AI sessions/month for one seat, which is within the ${creditOpportunity.threshold}/month light-use threshold. ${spec.creditNote} Move this user to ${creditOpportunity.freePlan.label} until usage exceeds the free allocation.`,
      action: `Use ${creditOpportunity.freePlan.label} credits/free tier ($0/mo)`,
    });
    optimizedSpend = Math.min(optimizedSpend, 0);
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
      const listPrice = planMonthlyCost(plan, entry.seats);
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
    auditSingleTool(entry, input.tools, input),
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
