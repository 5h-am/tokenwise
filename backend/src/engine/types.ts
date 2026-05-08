// ─── Primitive IDs ────────────────────────────────────────────────────────────

export type ToolId =
  | 'cursor'
  | 'github_copilot'
  | 'claude'
  | 'chatgpt'
  | 'anthropic_api'
  | 'openai_api'
  | 'gemini'
  | 'windsurf'
  | 'v0'
  | 'other';

export type UseCase =
  | 'code_generation'
  | 'content_writing'
  | 'data_analysis'
  | 'customer_support'
  | 'research'
  | 'general_assistant'
  | 'image_generation'
  | 'api_integration';

export type PlanTier =
  | 'free'
  | 'individual'
  | 'pro'
  | 'pro_plus'
  | 'team'
  | 'business'
  | 'enterprise'
  | 'ultra'
  | 'max'
  | 'pay_as_you_go';

// ─── Input structures ─────────────────────────────────────────────────────────

/**
 * A single tool entry provided by the user in the audit form.
 */
export interface ToolEntry {
  toolId: ToolId;
  planId: PlanTier;
  monthlySpend: number;   // USD — what the user actually pays
  seats: number;          // number of licences / seats
  useCase: UseCase;
}

/**
 * The full audit request payload.
 * Token-related fields are optional — the engine falls back to use-case defaults.
 */
export interface AuditInput {
  tools: ToolEntry[];
  teamSize: number;

  // AI token usage (optional — engine uses use-case defaults when absent)
  avgSessionTurns?: number;
  avgSystemPromptTokens?: number;
  avgInputTokensPerTurn?: number;
  avgOutputTokensPerTurn?: number;
  monthlyAISessions?: number;

  // Optimisation flags
  hasPromptCaching?: boolean;
  hasContextSummarization?: boolean;

  // Spend context
  shadowITSpendPercent?: number;  // 0-100
  surpriseRenewals?: number;      // count of renewals the team didn't know about
}

// ─── Waste & opportunity types ────────────────────────────────────────────────

export type WasteCategory =
  | 'wrong_plan'
  | 'redundant_tool'
  | 'underutilised_seats'
  | 'token_waste'
  | 'spend_anomaly';

export interface SavingsOpportunity {
  category: WasteCategory;
  toolId: ToolId;
  currentMonthlySpend: number;
  optimizedMonthlySpend: number;
  monthlySavings: number;
  annualSavings: number;
  /** One-sentence plain-English reason including dollar amounts. */
  reason: string;
  /** Concrete action — e.g. "Downgrade to Pro ($20/mo)" */
  action: string;
}

export interface ToolAuditResult {
  toolId: ToolId;
  planId: PlanTier;
  currentMonthlySpend: number;
  optimizedMonthlySpend: number;
  monthlySavings: number;
  flags: WasteCategory[];
  opportunities: SavingsOpportunity[];
  isWellConfigured: boolean;
}

// ─── Token waste types ────────────────────────────────────────────────────────

export interface TokenWasteAnalysis {
  naiveMonthlyTokens: number;
  optimisedMonthlyTokens: number;
  wastedTokensPerMonth: number;
  wastedCostPerMonth: number;      // USD
  quadraticOverheadFactor: number; // > 1.0 means multi-turn inflation
  primaryWasteDriver: 'context_accumulation' | 'no_caching' | 'long_system_prompt' | 'none';
}

export interface TokenOptimizationRec {
  technique: 'sliding_window' | 'prompt_caching' | 'context_summarization' | 'combined';
  estimatedMonthlySavings: number; // USD
  description: string;
}

// ─── Scoring types ────────────────────────────────────────────────────────────

export interface ScoringCriteria {
  /** Fraction of spend that is waste (inverted — lower waste = higher score) */
  wasteRatio: number;        // [0, 1]
  /** Are tools on the right plans? */
  planFitness: number;       // [0, 1]
  /** No redundant tools in the same functional category */
  toolRedundancy: number;    // [0, 1]
  /** Token efficiency (1 = no waste, 0 = maximum waste) */
  tokenEfficiency: number;   // [0, 1]
  /** Shadow IT / renewal surprise penalty */
  governanceHealth: number;  // [0, 1]
}

export type LetterGrade =
  | 'A+' | 'A' | 'A-'
  | 'B+' | 'B' | 'B-'
  | 'C+' | 'C' | 'C-'
  | 'D+' | 'D' | 'D-'
  | 'F+' | 'F' | 'F-';

export interface HealthScore {
  rawScore: number;        // [0, 1]
  letterGrade: LetterGrade;
  percentile: number;      // [0, 100] — estimated vs industry
  /** Criteria sorted worst-first so the user knows what to fix first */
  improvementPriority: Array<keyof ScoringCriteria>;
}

// ─── Unit economics ───────────────────────────────────────────────────────────

export interface UnitEconomics {
  costPerSeat: number;           // USD/mo
  costPerSession: number | null; // USD/session — null if no session data
  wastePerSeat: number;          // USD/mo wasted per seat
  annualisedBurn: number;        // current yearly spend
  annualisedOptimised: number;   // yearly spend after all savings
}

// ─── Top-level report ─────────────────────────────────────────────────────────

export interface AuditReport {
  toolResults: ToolAuditResult[];
  tokenWaste: TokenWasteAnalysis | null;   // null when no AI API tools present
  tokenRecs: TokenOptimizationRec[];
  healthScore: HealthScore;
  currentMonthlySpend: number;
  optimizedMonthlySpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  unitEconomics: UnitEconomics;
  topOpportunities: SavingsOpportunity[];  // top 3, de-duped by category
  credexRecommended: boolean;              // true when savings > $500/mo
  /** AI-generated ~100-word plain-English summary. Null until async job completes. */
  summary: string | null;
}
