/**
 * tokenWasteCalculator.ts
 *
 * Calculates how many tokens a team burns in multi-turn AI sessions and
 * how much they could save with sliding-window / prompt-caching optimisations.
 *
 * Key insight: In a naïve multi-turn session, the full conversation history is
 * re-sent with every turn. For N turns, turn k sends k context messages.
 * Total tokens ∝ N(N+1)/2 — quadratic growth.
 */

import type { AuditInput, TokenWasteAnalysis, TokenOptimizationRec } from './types.js';
import { USE_CASE_TOKEN_PROFILES, MODEL_TIERS, TOOL_SPECS } from './pricingDatabase.js';

// Default model tier used when tool is an AI API (Anthropic Sonnet as baseline)
const DEFAULT_INPUT_PRICE_PER_MTOK = 3.0;
const DEFAULT_OUTPUT_PRICE_PER_MTOK = 15.0;
const DEFAULT_CACHED_PRICE_PER_MTOK = 0.3;

// ─── Core formulas ─────────────────────────────────────────────────────────────

/**
 * naiveSessionTokens
 *
 * Tokens consumed in a single session with NO optimisation.
 * Each turn k re-sends: system prompt (S) + all k user messages (u each)
 * + all k-1 assistant messages (r each) + current user message.
 *
 * Simplified closed form for N turns:
 *   total = N·S  +  N(N+1)/2 · u  +  N(N-1)/2 · r
 *
 * @param N  Number of turns in the session
 * @param S  System prompt tokens (constant, re-sent every turn)
 * @param u  Average user input tokens per turn
 * @param r  Average assistant output tokens per turn
 */
export function naiveSessionTokens(N: number, S: number, u: number, r: number): number {
  if (N <= 0) return 0;
  const systemTokens = N * S;
  const userTokens = (N * (N + 1)) / 2 * u;
  const assistantTokens = (N * (N - 1)) / 2 * r;
  return systemTokens + userTokens + assistantTokens;
}

/**
 * optimisedSessionTokens
 *
 * Tokens consumed with one or more optimisations applied.
 *
 * - sliding_window: Only the last W turns of history are kept in context.
 *   W defaults to min(3, N). Reduces quadratic growth to linear.
 * - prompt_caching: System prompt is cached — first turn pays full price,
 *   subsequent turns pay cachedFraction of system prompt cost.
 * - combined: Both optimisations applied together.
 *
 * @param N  Number of turns
 * @param S  System prompt tokens
 * @param u  User input tokens per turn
 * @param r  Assistant output tokens per turn
 * @param options  Which optimisations to apply
 */
export function optimisedSessionTokens(
  N: number,
  S: number,
  u: number,
  r: number,
  options: {
    technique: 'sliding_window' | 'prompt_caching' | 'combined';
    windowSize?: number;    // default = min(3, N)
    cachedFraction?: number; // fraction of cache hits; default = 0.9
  },
): number {
  if (N <= 0) return 0;

  const windowSize = options.windowSize ?? Math.min(3, N);
  const cachedFraction = options.cachedFraction ?? 0.9;

  if (options.technique === 'sliding_window') {
    // Turns 1...(N - windowSize) each send windowSize turns of history.
    // Last windowSize turns send growing (1..windowSize) history.
    let total = 0;
    for (let turn = 1; turn <= N; turn++) {
      const historyTurns = Math.min(turn - 1, windowSize);
      total += S + u + historyTurns * (u + r);
    }
    return total;
  }

  if (options.technique === 'prompt_caching') {
    // System prompt is cached — only the first turn pays full S.
    // Remaining (N-1) turns pay cachedFraction * S.
    const systemCost = S + (N - 1) * S * (1 - cachedFraction);
    const userTokens = (N * (N + 1)) / 2 * u;
    const assistantTokens = (N * (N - 1)) / 2 * r;
    return systemCost + userTokens + assistantTokens;
  }

  // combined: sliding_window + prompt_caching
  let total = 0;
  // First turn: pay full system prompt
  total += S + u;
  for (let turn = 2; turn <= N; turn++) {
    const historyTurns = Math.min(turn - 1, windowSize);
    // Subsequent turns: cached system prompt
    total += S * (1 - cachedFraction) + u + historyTurns * (u + r);
  }
  return total;
}

/**
 * quadraticOverheadFactor
 *
 * Returns the ratio of naïve tokens to what a perfectly linear single-pass
 * would cost (N * (S + u + r)). A value > 1.0 means the multi-turn history
 * accumulation is adding overhead.
 */
export function quadraticOverheadFactor(N: number, S: number, u: number, r: number): number {
  if (N <= 0) return 1;
  const naive = naiveSessionTokens(N, S, u, r);
  const linear = N * (S + u + r);
  if (linear === 0) return 1;
  return naive / linear;
}

// ─── Full analysis ─────────────────────────────────────────────────────────────

/**
 * analyseTokenWaste
 *
 * Produces a full TokenWasteAnalysis for the given audit input.
 * Returns null when the tool stack has no AI API tools (no token costs).
 *
 * Falls back to use-case defaults for any missing token parameters.
 */
export function analyseTokenWaste(input: AuditInput): TokenWasteAnalysis | null {
  // Check if any tool has token costs
  const hasAiApiTools = input.tools.some((t) => {
    const spec = TOOL_SPECS[t.toolId];
    return spec?.hasTokenCosts === true;
  });

  if (!hasAiApiTools) return null;

  // Pick the dominant use case (first AI API tool's use case)
  const apiTool = input.tools.find((t) => TOOL_SPECS[t.toolId]?.hasTokenCosts);
  const useCase = apiTool?.useCase ?? 'general_assistant';
  const profile = USE_CASE_TOKEN_PROFILES[useCase];

  // Resolve token params — user values override defaults
  const N = input.avgSessionTurns ?? profile.avgSessionTurns;
  const S = input.avgSystemPromptTokens ?? profile.avgSystemPromptTokens;
  const u = input.avgInputTokensPerTurn ?? profile.avgInputTokensPerTurn;
  const r = input.avgOutputTokensPerTurn ?? profile.avgOutputTokensPerTurn;

  // Total sessions per month = user-provided or (seats * profile default)
  const seats = input.tools.reduce((sum, t) => sum + t.seats, 0);
  const sessionsPerMonth =
    input.monthlyAISessions ?? seats * profile.monthlySessionsPerSeat;

  // Choose optimisation based on flags
  const hasCaching = input.hasPromptCaching ?? false;
  const hasSummarisation = input.hasContextSummarization ?? false;

  let technique: 'sliding_window' | 'prompt_caching' | 'combined' | null = null;
  if (hasCaching && hasSummarisation) technique = 'combined';
  else if (hasCaching) technique = 'prompt_caching';
  else if (hasSummarisation) technique = 'sliding_window';

  const naivePerSession = naiveSessionTokens(N, S, u, r);
  const optimisedPerSession =
    technique != null
      ? optimisedSessionTokens(N, S, u, r, { technique })
      : naivePerSession; // no optimisation applied

  const naiveMonthlyTokens = naivePerSession * sessionsPerMonth;
  const optimisedMonthlyTokens = optimisedPerSession * sessionsPerMonth;
  const wastedTokensPerMonth = Math.max(0, naiveMonthlyTokens - optimisedMonthlyTokens);

  // Estimate cost using default model pricing (Anthropic Sonnet baseline)
  // Waste is predominantly input tokens (context re-sends)
  const inputPricePer1 = DEFAULT_INPUT_PRICE_PER_MTOK / 1_000_000;
  const wastedCostPerMonth = wastedTokensPerMonth * inputPricePer1;

  const overhead = quadraticOverheadFactor(N, S, u, r);

  // Identify primary waste driver
  let primaryWasteDriver: TokenWasteAnalysis['primaryWasteDriver'];
  if (!hasCaching && S > 1000) {
    primaryWasteDriver = 'long_system_prompt';
  } else if (!hasCaching) {
    primaryWasteDriver = 'no_caching';
  } else if (overhead > 1.5) {
    primaryWasteDriver = 'context_accumulation';
  } else {
    primaryWasteDriver = 'none';
  }

  return {
    naiveMonthlyTokens,
    optimisedMonthlyTokens,
    wastedTokensPerMonth,
    wastedCostPerMonth,
    quadraticOverheadFactor: overhead,
    primaryWasteDriver,
  };
}

// ─── Optimisation recommendations ─────────────────────────────────────────────

export function buildTokenOptimizationRecs(
  input: AuditInput,
  analysis: TokenWasteAnalysis,
): TokenOptimizationRec[] {
  if (analysis.wastedCostPerMonth === 0) return [];

  const recs: TokenOptimizationRec[] = [];

  const hasCaching = input.hasPromptCaching ?? false;
  const hasSummarisation = input.hasContextSummarization ?? false;

  if (!hasCaching) {
    const savingsEstimate = analysis.wastedCostPerMonth * 0.4;
    recs.push({
      technique: 'prompt_caching',
      estimatedMonthlySavings: parseFloat(savingsEstimate.toFixed(2)),
      description:
        `Enable prompt caching so your system prompt is not re-processed on every turn. ` +
        `Estimated saving: $${savingsEstimate.toFixed(2)}/mo.`,
    });
  }

  if (!hasSummarisation) {
    const savingsEstimate = analysis.wastedCostPerMonth * 0.3;
    recs.push({
      technique: 'sliding_window',
      estimatedMonthlySavings: parseFloat(savingsEstimate.toFixed(2)),
      description:
        `Use a sliding-window context strategy to cap history at the last 3 turns. ` +
        `Estimated saving: $${savingsEstimate.toFixed(2)}/mo.`,
    });
  }

  if (!hasCaching && !hasSummarisation) {
    const savingsEstimate = analysis.wastedCostPerMonth * 0.65;
    recs.push({
      technique: 'combined',
      estimatedMonthlySavings: parseFloat(savingsEstimate.toFixed(2)),
      description:
        `Combine prompt caching and sliding-window context to maximise efficiency. ` +
        `Estimated combined saving: $${savingsEstimate.toFixed(2)}/mo.`,
    });
  }

  return recs;
}

// Expose model tiers for other engine modules if needed
export { MODEL_TIERS, DEFAULT_INPUT_PRICE_PER_MTOK, DEFAULT_OUTPUT_PRICE_PER_MTOK, DEFAULT_CACHED_PRICE_PER_MTOK };
