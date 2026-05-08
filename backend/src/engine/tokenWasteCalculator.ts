import type { AuditInput, TokenWasteAnalysis, TokenOptimizationRec } from './types.js';
import { USE_CASE_TOKEN_PROFILES, MODEL_TIERS, TOOL_SPECS } from './pricingDatabase.js';

const DEFAULT_INPUT_PRICE_PER_MTOK = 3.0;
const DEFAULT_OUTPUT_PRICE_PER_MTOK = 15.0;
const DEFAULT_CACHED_PRICE_PER_MTOK = 0.3;

export function naiveSessionTokens(N: number, S: number, u: number, r: number): number {
  if (N <= 0) return 0;
  const systemTokens = N * S;
  const userTokens = (N * (N + 1)) / 2 * u;
  const assistantTokens = (N * (N - 1)) / 2 * r;
  return systemTokens + userTokens + assistantTokens;
}

export function optimisedSessionTokens(
  N: number,
  S: number,
  u: number,
  r: number,
  options: {
    technique: 'sliding_window' | 'prompt_caching' | 'combined';
    windowSize?: number;
    cachedFraction?: number;
  },
): number {
  if (N <= 0) return 0;

  const windowSize = options.windowSize ?? Math.min(3, N);
  const cachedFraction = options.cachedFraction ?? 0.9;

  if (options.technique === 'sliding_window') {
    let total = 0;
    for (let turn = 1; turn <= N; turn++) {
      const historyTurns = Math.min(turn - 1, windowSize);
      total += S + u + historyTurns * (u + r);
    }
    return total;
  }

  if (options.technique === 'prompt_caching') {
    const systemCost = S + (N - 1) * S * (1 - cachedFraction);
    const userTokens = (N * (N + 1)) / 2 * u;
    const assistantTokens = (N * (N - 1)) / 2 * r;
    return systemCost + userTokens + assistantTokens;
  }

  let total = 0;
  total += S + u;
  for (let turn = 2; turn <= N; turn++) {
    const historyTurns = Math.min(turn - 1, windowSize);
    total += S * (1 - cachedFraction) + u + historyTurns * (u + r);
  }
  return total;
}

export function quadraticOverheadFactor(N: number, S: number, u: number, r: number): number {
  if (N <= 0) return 1;
  const naive = naiveSessionTokens(N, S, u, r);
  const linear = N * (S + u + r);
  if (linear === 0) return 1;
  return naive / linear;
}

export function analyseTokenWaste(input: AuditInput): TokenWasteAnalysis | null {
  const hasAiApiTools = input.tools.some((t) => {
    const spec = TOOL_SPECS[t.toolId];
    return spec?.hasTokenCosts === true;
  });

  if (!hasAiApiTools) return null;

  const apiTool = input.tools.find((t) => TOOL_SPECS[t.toolId]?.hasTokenCosts);
  const useCase = apiTool?.useCase ?? 'general_assistant';
  const profile = USE_CASE_TOKEN_PROFILES[useCase];

  const N = input.avgSessionTurns ?? profile.avgSessionTurns;
  const S = input.avgSystemPromptTokens ?? profile.avgSystemPromptTokens;
  const u = input.avgInputTokensPerTurn ?? profile.avgInputTokensPerTurn;
  const r = input.avgOutputTokensPerTurn ?? profile.avgOutputTokensPerTurn;

  const seats = input.tools.reduce((sum, t) => sum + t.seats, 0);
  const sessionsPerMonth = input.monthlyAISessions ?? seats * profile.monthlySessionsPerSeat;

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
      : naivePerSession;

  const naiveMonthlyTokens = naivePerSession * sessionsPerMonth;
  const optimisedMonthlyTokens = optimisedPerSession * sessionsPerMonth;
  const wastedTokensPerMonth = Math.max(0, naiveMonthlyTokens - optimisedMonthlyTokens);

  const inputPricePer1 = DEFAULT_INPUT_PRICE_PER_MTOK / 1_000_000;
  const wastedCostPerMonth = wastedTokensPerMonth * inputPricePer1;

  const overhead = quadraticOverheadFactor(N, S, u, r);

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

export { MODEL_TIERS, DEFAULT_INPUT_PRICE_PER_MTOK, DEFAULT_OUTPUT_PRICE_PER_MTOK, DEFAULT_CACHED_PRICE_PER_MTOK };
