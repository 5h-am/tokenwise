/**
 * scoringEngine.ts
 *
 * Converts raw audit data into a normalised health score ([0,1])
 * and maps it to a letter grade (A+ through F-).
 *
 * All criteria values are in [0, 1] where 1 = perfectly healthy.
 * Weights are chosen to reflect what actually saves money fastest.
 */

import type {
  AuditInput,
  ToolAuditResult,
  TokenWasteAnalysis,
  ScoringCriteria,
  HealthScore,
  LetterGrade,
} from './types.js';
import { INDUSTRY_BENCHMARKS } from './pricingDatabase.js';

// ─── Weights (must sum to 1.0) ────────────────────────────────────────────────

const WEIGHTS: Record<keyof ScoringCriteria, number> = {
  wasteRatio: 0.35,
  planFitness: 0.25,
  toolRedundancy: 0.20,
  tokenEfficiency: 0.12,
  governanceHealth: 0.08,
};

// ─── Grade thresholds ─────────────────────────────────────────────────────────

const GRADE_THRESHOLDS: Array<[number, LetterGrade]> = [
  [0.917, 'A+'],
  [0.900, 'A'],
  [0.867, 'A-'],
  [0.833, 'B+'],
  [0.800, 'B'],
  [0.767, 'B-'],
  [0.733, 'C+'],
  [0.700, 'C'],
  [0.667, 'C-'],
  [0.633, 'D+'],
  [0.600, 'D'],
  [0.567, 'D-'],
  [0.533, 'F+'],
  [0.500, 'F'],
  [0.000, 'F-'],
];

function toLetterGrade(rawScore: number): LetterGrade {
  for (const [threshold, grade] of GRADE_THRESHOLDS) {
    if (rawScore >= threshold) return grade;
  }
  return 'F-';
}

// ─── Criteria builders ────────────────────────────────────────────────────────

/**
 * wasteRatio: 1 − (totalWaste / totalSpend)
 * Clamped to [0, 1]. Lower waste = higher score.
 */
function calcWasteRatio(toolResults: ToolAuditResult[]): number {
  const totalSpend = toolResults.reduce((s, t) => s + t.currentMonthlySpend, 0);
  if (totalSpend === 0) return 1; // Nothing spent = no waste
  const totalSavings = toolResults.reduce((s, t) => s + t.monthlySavings, 0);
  const ratio = totalSavings / totalSpend;
  return Math.max(0, Math.min(1, 1 - ratio));
}

/**
 * planFitness: fraction of tools that are NOT flagged with wrong_plan.
 */
function calcPlanFitness(toolResults: ToolAuditResult[]): number {
  if (toolResults.length === 0) return 1;
  const wellFitted = toolResults.filter(
    (t) => !t.flags.includes('wrong_plan'),
  ).length;
  return wellFitted / toolResults.length;
}

/**
 * toolRedundancy: 1 − (fraction of tools flagged as redundant).
 */
function calcToolRedundancy(toolResults: ToolAuditResult[]): number {
  if (toolResults.length === 0) return 1;
  const redundant = toolResults.filter((t) => t.flags.includes('redundant_tool')).length;
  return Math.max(0, 1 - redundant / toolResults.length);
}

/**
 * tokenEfficiency: ratio of optimised tokens to naive tokens (inverted waste).
 * If no AI API tools, defaults to 1.0 (no token waste possible).
 */
function calcTokenEfficiency(tokenAnalysis: TokenWasteAnalysis | null): number {
  if (tokenAnalysis === null) return 1;
  if (tokenAnalysis.naiveMonthlyTokens === 0) return 1;
  const efficiency =
    tokenAnalysis.optimisedMonthlyTokens / tokenAnalysis.naiveMonthlyTokens;
  return Math.max(0, Math.min(1, efficiency));
}

/**
 * governanceHealth: penalises shadow IT spend and surprise renewals.
 * Each shadow IT point and each renewal surprise reduces the score.
 */
function calcGovernanceHealth(input: AuditInput): number {
  let score = 1.0;

  // Shadow IT: 0–100% band → subtract up to 0.5 points
  const shadowIt = input.shadowITSpendPercent ?? 0;
  score -= (shadowIt / 100) * 0.5;

  // Surprise renewals: each one costs 0.1 points, up to 0.5 max
  const renewals = input.surpriseRenewals ?? 0;
  score -= Math.min(0.5, renewals * 0.1);

  return Math.max(0, Math.min(1, score));
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * buildScoringCriteria
 *
 * All returned values are in [0, 1].
 */
export function buildScoringCriteria(
  input: AuditInput,
  toolResults: ToolAuditResult[],
  tokenAnalysis: TokenWasteAnalysis | null,
): ScoringCriteria {
  return {
    wasteRatio: calcWasteRatio(toolResults),
    planFitness: calcPlanFitness(toolResults),
    toolRedundancy: calcToolRedundancy(toolResults),
    tokenEfficiency: calcTokenEfficiency(tokenAnalysis),
    governanceHealth: calcGovernanceHealth(input),
  };
}

/**
 * computeHealthScore
 *
 * Applies weighted sum, maps to letter grade, estimates percentile.
 * improvementPriority is sorted worst criteria first.
 */
export function computeHealthScore(criteria: ScoringCriteria): HealthScore {
  const rawScore =
    criteria.wasteRatio * WEIGHTS.wasteRatio +
    criteria.planFitness * WEIGHTS.planFitness +
    criteria.toolRedundancy * WEIGHTS.toolRedundancy +
    criteria.tokenEfficiency * WEIGHTS.tokenEfficiency +
    criteria.governanceHealth * WEIGHTS.governanceHealth;

  const clampedScore = Math.max(0, Math.min(1, rawScore));
  const letterGrade = toLetterGrade(clampedScore);

  // Estimate percentile: linear interpolation relative to top-quartile threshold
  const topQ = INDUSTRY_BENCHMARKS.topQuartileRawScore;
  let percentile: number;
  if (clampedScore >= topQ) {
    // Top 25% of teams
    percentile = 75 + ((clampedScore - topQ) / (1 - topQ)) * 25;
  } else {
    percentile = (clampedScore / topQ) * 75;
  }
  percentile = Math.round(Math.max(0, Math.min(100, percentile)));

  // Sort criteria worst-first for improvementPriority
  const criteriaKeys = Object.keys(criteria) as Array<keyof ScoringCriteria>;
  const improvementPriority = criteriaKeys.sort((a, b) => criteria[a] - criteria[b]);

  return {
    rawScore: clampedScore,
    letterGrade,
    percentile,
    improvementPriority,
  };
}
