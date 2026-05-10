import type { PublicAuditReport } from './types'

export const SAMPLE_SHARE_ID = '11111111-1111-4111-8111-111111111111'

export const SAMPLE_PUBLIC_AUDIT_REPORT: PublicAuditReport = {
  shareId: SAMPLE_SHARE_ID,
  toolResults: [
    {
      toolId: 'chatgpt',
      planId: 'team',
      currentMonthlySpend: 3550,
      optimizedMonthlySpend: 3302,
      monthlySavings: 248,
      flags: ['redundant_tool'],
      opportunities: [
        {
          category: 'redundant_tool',
          toolId: 'chatgpt',
          currentMonthlySpend: 3550,
          optimizedMonthlySpend: 3302,
          monthlySavings: 248,
          annualSavings: 2976,
          reason: 'Overlap with adjacent tooling for similar workloads.',
          action: 'Consolidate',
        },
      ],
      isWellConfigured: false,
    },
    {
      toolId: 'github_copilot',
      planId: 'business',
      currentMonthlySpend: 1615,
      optimizedMonthlySpend: 1326,
      monthlySavings: 289,
      flags: ['wrong_plan'],
      opportunities: [
        {
          category: 'wrong_plan',
          toolId: 'github_copilot',
          currentMonthlySpend: 1615,
          optimizedMonthlySpend: 1326,
          monthlySavings: 289,
          annualSavings: 3468,
          reason: 'Seat utilization is below optimal fit for enterprise pricing.',
          action: 'Downgrade',
        },
      ],
      isWellConfigured: false,
    },
  ],
  tokenWaste: {
    naiveMonthlyTokens: 4_200_000,
    optimisedMonthlyTokens: 2_800_000,
    wastedTokensPerMonth: 1_400_000,
    wastedCostPerMonth: 0,
    quadraticOverheadFactor: 1.5,
    primaryWasteDriver: 'context_accumulation',
  },
  tokenRecs: [
    {
      technique: 'sliding_window',
      estimatedMonthlySavings: 120,
      description: 'Limit retained context turns per thread.',
    },
    {
      technique: 'prompt_caching',
      estimatedMonthlySavings: 220,
      description: 'Cache stable system prompts on supported providers.',
    },
  ],
  healthScore: {
    rawScore: 0.72,
    letterGrade: 'B-',
    percentile: 64,
    improvementPriority: ['wasteRatio', 'planFitness', 'toolRedundancy', 'tokenEfficiency', 'governanceHealth'],
  },
  currentMonthlySpend: 5165,
  optimizedMonthlySpend: 4628,
  totalMonthlySavings: 537,
  totalAnnualSavings: 6444,
  unitEconomics: {
    costPerSeat: 42.5,
    costPerSession: 0.12,
    wastePerSeat: 6.85,
    annualisedBurn: 61980,
    annualisedOptimised: 55536,
  },
  topOpportunities: [
    {
      category: 'wrong_plan',
      toolId: 'github_copilot',
      currentMonthlySpend: 1615,
      optimizedMonthlySpend: 1326,
      monthlySavings: 289,
      annualSavings: 3468,
      reason: 'Plan tier exceeds observed utilization.',
      action: 'Downgrade',
    },
    {
      category: 'redundant_tool',
      toolId: 'chatgpt',
      currentMonthlySpend: 3550,
      optimizedMonthlySpend: 3302,
      monthlySavings: 248,
      annualSavings: 2976,
      reason: 'Overlapping tooling for similar collaborators.',
      action: 'Consolidate',
    },
  ],
  credexRecommended: true,
  summary:
    'The current infrastructure exhibits moderate redundancy across productivity suites. Primarily, there is an overlap between active Notion-style and Jira-style licenses where consolidation could yield savings on overlapping collaborator seats. Additionally, dormant seats were identified across paid developer assistants. Optimizing allocations presents the fastest path to immediate cost reduction without disrupting active workflows.',
}
