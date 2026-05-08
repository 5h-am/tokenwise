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

export interface ToolEntry {
  toolId: ToolId;
  planId: PlanTier;
  monthlySpend: number;
  seats: number;
  useCase: UseCase;
}

export interface AuditInput {
  tools: ToolEntry[];
  teamSize: number;
  avgSessionTurns?: number;
  avgSystemPromptTokens?: number;
  avgInputTokensPerTurn?: number;
  avgOutputTokensPerTurn?: number;
  monthlyAISessions?: number;
  hasPromptCaching?: boolean;
  hasContextSummarization?: boolean;
  shadowITSpendPercent?: number;
  surpriseRenewals?: number;
}

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
  reason: string;
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

export interface TokenWasteAnalysis {
  naiveMonthlyTokens: number;
  optimisedMonthlyTokens: number;
  wastedTokensPerMonth: number;
  wastedCostPerMonth: number;
  quadraticOverheadFactor: number;
  primaryWasteDriver: 'context_accumulation' | 'no_caching' | 'long_system_prompt' | 'none';
}

export interface TokenOptimizationRec {
  technique: 'sliding_window' | 'prompt_caching' | 'context_summarization' | 'combined';
  estimatedMonthlySavings: number;
  description: string;
}

export interface ScoringCriteria {
  wasteRatio: number;
  planFitness: number;
  toolRedundancy: number;
  tokenEfficiency: number;
  governanceHealth: number;
}

export type LetterGrade =
  | 'A+' | 'A' | 'A-'
  | 'B+' | 'B' | 'B-'
  | 'C+' | 'C' | 'C-'
  | 'D+' | 'D' | 'D-'
  | 'F+' | 'F' | 'F-';

export interface HealthScore {
  rawScore: number;
  letterGrade: LetterGrade;
  percentile: number;
  improvementPriority: Array<keyof ScoringCriteria>;
}

export interface UnitEconomics {
  costPerSeat: number;
  costPerSession: number | null;
  wastePerSeat: number;
  annualisedBurn: number;
  annualisedOptimised: number;
}

export interface AuditReport {
  toolResults: ToolAuditResult[];
  tokenWaste: TokenWasteAnalysis | null;
  tokenRecs: TokenOptimizationRec[];
  healthScore: HealthScore;
  currentMonthlySpend: number;
  optimizedMonthlySpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  unitEconomics: UnitEconomics;
  topOpportunities: SavingsOpportunity[];
  credexRecommended: boolean;
  summary: string | null;
}
