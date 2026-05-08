import type { ToolId, PlanTier, UseCase } from './types.js';

export interface PlanSpec {
  id: PlanTier;
  label: string;
  monthlyUsd: number;
  isPerSeat: boolean;
  minSeats: number;
  maxSeats: number | null;
  supportedUseCases: UseCase[];
}

export interface ToolSpec {
  id: ToolId;
  name: string;
  vendor: string;
  functionalCategory: string;
  plans: PlanSpec[];
  pricingUrl: string;
  verifiedAt: string;
  hasTokenCosts: boolean;
}

export const TOOL_SPECS: Record<ToolId, ToolSpec> = {
  cursor: {
    id: 'cursor',
    name: 'Cursor',
    vendor: 'Anysphere',
    functionalCategory: 'ai_code_editor',
    pricingUrl: 'https://cursor.com/pricing',
    verifiedAt: '2026-05-07',
    hasTokenCosts: false,
    plans: [
      { id: 'free', label: 'Hobby (Free)', monthlyUsd: 0, isPerSeat: false, minSeats: 1, maxSeats: 1, supportedUseCases: ['code_generation'] },
      { id: 'pro', label: 'Pro', monthlyUsd: 20, isPerSeat: false, minSeats: 1, maxSeats: 1, supportedUseCases: ['code_generation'] },
      { id: 'pro_plus', label: 'Pro+', monthlyUsd: 60, isPerSeat: false, minSeats: 1, maxSeats: 1, supportedUseCases: ['code_generation'] },
      { id: 'ultra', label: 'Ultra', monthlyUsd: 200, isPerSeat: false, minSeats: 1, maxSeats: 1, supportedUseCases: ['code_generation'] },
      { id: 'business', label: 'Business', monthlyUsd: 40, isPerSeat: true, minSeats: 1, maxSeats: null, supportedUseCases: ['code_generation'] },
      { id: 'enterprise', label: 'Enterprise', monthlyUsd: 40, isPerSeat: true, minSeats: 20, maxSeats: null, supportedUseCases: ['code_generation'] },
    ],
  },
  github_copilot: {
    id: 'github_copilot',
    name: 'GitHub Copilot',
    vendor: 'GitHub / Microsoft',
    functionalCategory: 'ai_code_editor',
    pricingUrl: 'https://github.com/features/copilot/plans',
    verifiedAt: '2026-05-07',
    hasTokenCosts: false,
    plans: [
      { id: 'free', label: 'Free', monthlyUsd: 0, isPerSeat: false, minSeats: 1, maxSeats: 1, supportedUseCases: ['code_generation'] },
      { id: 'individual', label: 'Pro / Individual', monthlyUsd: 10, isPerSeat: false, minSeats: 1, maxSeats: 1, supportedUseCases: ['code_generation'] },
      { id: 'pro_plus', label: 'Pro+', monthlyUsd: 39, isPerSeat: false, minSeats: 1, maxSeats: 1, supportedUseCases: ['code_generation'] },
      { id: 'business', label: 'Business', monthlyUsd: 19, isPerSeat: true, minSeats: 1, maxSeats: null, supportedUseCases: ['code_generation'] },
      { id: 'enterprise', label: 'Enterprise', monthlyUsd: 39, isPerSeat: true, minSeats: 1, maxSeats: null, supportedUseCases: ['code_generation'] },
    ],
  },
  claude: {
    id: 'claude',
    name: 'Claude (claude.ai)',
    vendor: 'Anthropic',
    functionalCategory: 'ai_chat_assistant',
    pricingUrl: 'https://claude.com/pricing',
    verifiedAt: '2026-05-07',
    hasTokenCosts: false,
    plans: [
      { id: 'free', label: 'Free', monthlyUsd: 0, isPerSeat: false, minSeats: 1, maxSeats: 1, supportedUseCases: ['general_assistant', 'content_writing', 'research', 'code_generation'] },
      { id: 'pro', label: 'Pro', monthlyUsd: 20, isPerSeat: false, minSeats: 1, maxSeats: 1, supportedUseCases: ['general_assistant', 'content_writing', 'research', 'code_generation'] },
      { id: 'max', label: 'Max', monthlyUsd: 100, isPerSeat: false, minSeats: 1, maxSeats: 1, supportedUseCases: ['general_assistant', 'content_writing', 'research', 'code_generation'] },
      { id: 'team', label: 'Team', monthlyUsd: 30, isPerSeat: true, minSeats: 2, maxSeats: null, supportedUseCases: ['general_assistant', 'content_writing', 'research', 'code_generation'] },
      { id: 'enterprise', label: 'Enterprise', monthlyUsd: 30, isPerSeat: true, minSeats: 10, maxSeats: null, supportedUseCases: ['general_assistant', 'content_writing', 'research', 'code_generation'] },
    ],
  },
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    vendor: 'OpenAI',
    functionalCategory: 'ai_chat_assistant',
    pricingUrl: 'https://openai.com/chatgpt/pricing',
    verifiedAt: '2026-05-07',
    hasTokenCosts: false,
    plans: [
      { id: 'free', label: 'Free', monthlyUsd: 0, isPerSeat: false, minSeats: 1, maxSeats: 1, supportedUseCases: ['general_assistant', 'content_writing', 'research', 'code_generation'] },
      { id: 'pro', label: 'Plus', monthlyUsd: 20, isPerSeat: false, minSeats: 1, maxSeats: 1, supportedUseCases: ['general_assistant', 'content_writing', 'research', 'code_generation'] },
      { id: 'team', label: 'Team', monthlyUsd: 30, isPerSeat: true, minSeats: 2, maxSeats: null, supportedUseCases: ['general_assistant', 'content_writing', 'research', 'code_generation'] },
      { id: 'enterprise', label: 'Enterprise', monthlyUsd: 30, isPerSeat: true, minSeats: 10, maxSeats: null, supportedUseCases: ['general_assistant', 'content_writing', 'research', 'code_generation'] },
    ],
  },
  anthropic_api: {
    id: 'anthropic_api',
    name: 'Anthropic API',
    vendor: 'Anthropic',
    functionalCategory: 'ai_api',
    pricingUrl: 'https://www.anthropic.com/pricing#anthropic-api',
    verifiedAt: '2026-05-07',
    hasTokenCosts: true,
    plans: [
      { id: 'pay_as_you_go', label: 'Pay-as-you-go', monthlyUsd: 0, isPerSeat: false, minSeats: 1, maxSeats: null, supportedUseCases: ['code_generation', 'content_writing', 'data_analysis', 'customer_support', 'research', 'general_assistant', 'api_integration'] },
    ],
  },
  openai_api: {
    id: 'openai_api',
    name: 'OpenAI API',
    vendor: 'OpenAI',
    functionalCategory: 'ai_api',
    pricingUrl: 'https://openai.com/api/pricing',
    verifiedAt: '2026-05-07',
    hasTokenCosts: true,
    plans: [
      { id: 'pay_as_you_go', label: 'Pay-as-you-go', monthlyUsd: 0, isPerSeat: false, minSeats: 1, maxSeats: null, supportedUseCases: ['code_generation', 'content_writing', 'data_analysis', 'customer_support', 'research', 'general_assistant', 'api_integration'] },
    ],
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    vendor: 'Google',
    functionalCategory: 'ai_chat_assistant',
    pricingUrl: 'https://one.google.com/about/google-ai-plans/',
    verifiedAt: '2026-05-07',
    hasTokenCosts: false,
    plans: [
      { id: 'free', label: 'Free', monthlyUsd: 0, isPerSeat: false, minSeats: 1, maxSeats: 1, supportedUseCases: ['general_assistant', 'content_writing', 'research'] },
      { id: 'pro', label: 'Gemini Pro (Google One AI Premium)', monthlyUsd: 20, isPerSeat: false, minSeats: 1, maxSeats: 1, supportedUseCases: ['general_assistant', 'content_writing', 'research'] },
      { id: 'ultra', label: 'Gemini Ultra (Google One AI Ultra)', monthlyUsd: 250, isPerSeat: false, minSeats: 1, maxSeats: 1, supportedUseCases: ['general_assistant', 'content_writing', 'research', 'data_analysis'] },
    ],
  },
  windsurf: {
    id: 'windsurf',
    name: 'Windsurf',
    vendor: 'Codeium',
    functionalCategory: 'ai_code_editor',
    pricingUrl: 'https://windsurf.com/pricing',
    verifiedAt: '2026-05-07',
    hasTokenCosts: false,
    plans: [
      { id: 'free', label: 'Free', monthlyUsd: 0, isPerSeat: false, minSeats: 1, maxSeats: 1, supportedUseCases: ['code_generation'] },
      { id: 'pro', label: 'Pro', monthlyUsd: 15, isPerSeat: false, minSeats: 1, maxSeats: 1, supportedUseCases: ['code_generation'] },
      { id: 'team', label: 'Teams', monthlyUsd: 30, isPerSeat: true, minSeats: 2, maxSeats: null, supportedUseCases: ['code_generation'] },
      { id: 'enterprise', label: 'Enterprise', monthlyUsd: 30, isPerSeat: true, minSeats: 10, maxSeats: null, supportedUseCases: ['code_generation'] },
    ],
  },
  v0: {
    id: 'v0',
    name: 'v0 by Vercel',
    vendor: 'Vercel',
    functionalCategory: 'ai_ui_generator',
    pricingUrl: 'https://v0.dev/pricing',
    verifiedAt: '2026-05-07',
    hasTokenCosts: false,
    plans: [
      { id: 'free', label: 'Free', monthlyUsd: 0, isPerSeat: false, minSeats: 1, maxSeats: 1, supportedUseCases: ['code_generation'] },
      { id: 'pro', label: 'Premium', monthlyUsd: 20, isPerSeat: false, minSeats: 1, maxSeats: 1, supportedUseCases: ['code_generation'] },
      { id: 'team', label: 'Team', monthlyUsd: 30, isPerSeat: true, minSeats: 2, maxSeats: null, supportedUseCases: ['code_generation'] },
    ],
  },
  other: {
    id: 'other',
    name: 'Other Tool',
    vendor: 'Unknown',
    functionalCategory: 'other',
    pricingUrl: '',
    verifiedAt: '2026-05-07',
    hasTokenCosts: false,
    plans: [
      { id: 'pay_as_you_go', label: 'Custom', monthlyUsd: 0, isPerSeat: false, minSeats: 1, maxSeats: null, supportedUseCases: ['code_generation', 'content_writing', 'data_analysis', 'customer_support', 'research', 'general_assistant', 'image_generation', 'api_integration'] },
    ],
  },
};

export interface ModelTier {
  id: string;
  vendor: 'anthropic' | 'openai' | 'google';
  inputPricePerMTok: number;
  outputPricePerMTok: number;
  cachedInputPricePerMTok: number;
  pricingUrl: string;
  verifiedAt: string;
}

export const MODEL_TIERS: ModelTier[] = [
  { id: 'claude-opus-4-6', vendor: 'anthropic', inputPricePerMTok: 5.0, outputPricePerMTok: 25.0, cachedInputPricePerMTok: 0.5, pricingUrl: 'https://www.anthropic.com/pricing#anthropic-api', verifiedAt: '2026-05-07' },
  { id: 'claude-sonnet-4-6', vendor: 'anthropic', inputPricePerMTok: 3.0, outputPricePerMTok: 15.0, cachedInputPricePerMTok: 0.3, pricingUrl: 'https://www.anthropic.com/pricing#anthropic-api', verifiedAt: '2026-05-07' },
  { id: 'claude-haiku-4-5', vendor: 'anthropic', inputPricePerMTok: 1.0, outputPricePerMTok: 5.0, cachedInputPricePerMTok: 0.1, pricingUrl: 'https://www.anthropic.com/pricing#anthropic-api', verifiedAt: '2026-05-07' },
  { id: 'gpt-4o', vendor: 'openai', inputPricePerMTok: 2.5, outputPricePerMTok: 10.0, cachedInputPricePerMTok: 1.25, pricingUrl: 'https://openai.com/api/pricing', verifiedAt: '2026-05-07' },
  { id: 'gpt-4o-mini', vendor: 'openai', inputPricePerMTok: 0.15, outputPricePerMTok: 0.6, cachedInputPricePerMTok: 0.075, pricingUrl: 'https://openai.com/api/pricing', verifiedAt: '2026-05-07' },
];

export const FUNCTIONAL_CATEGORIES: Record<string, string> = {
  ai_code_editor: 'AI Code Editor',
  ai_chat_assistant: 'AI Chat Assistant',
  ai_api: 'AI API / Infrastructure',
  ai_ui_generator: 'AI UI Generator',
  other: 'Other',
};

export const INDUSTRY_BENCHMARKS = {
  medianCostPerSeat: 45,
  lowWasteThreshold: 0.15,
  medianWasteRatio: 0.35,
  topQuartileRawScore: 0.80,
};

export interface UseCaseTokenProfile {
  avgSystemPromptTokens: number;
  avgInputTokensPerTurn: number;
  avgOutputTokensPerTurn: number;
  avgSessionTurns: number;
  monthlySessionsPerSeat: number;
}

export const USE_CASE_TOKEN_PROFILES: Record<UseCase, UseCaseTokenProfile> = {
  code_generation:   { avgSystemPromptTokens: 2000, avgInputTokensPerTurn: 500, avgOutputTokensPerTurn: 800, avgSessionTurns: 8, monthlySessionsPerSeat: 80 },
  content_writing:   { avgSystemPromptTokens: 800,  avgInputTokensPerTurn: 200, avgOutputTokensPerTurn: 600, avgSessionTurns: 5, monthlySessionsPerSeat: 60 },
  data_analysis:     { avgSystemPromptTokens: 1500, avgInputTokensPerTurn: 1000, avgOutputTokensPerTurn: 500, avgSessionTurns: 6, monthlySessionsPerSeat: 40 },
  customer_support:  { avgSystemPromptTokens: 3000, avgInputTokensPerTurn: 150, avgOutputTokensPerTurn: 200, avgSessionTurns: 4, monthlySessionsPerSeat: 200 },
  research:          { avgSystemPromptTokens: 1000, avgInputTokensPerTurn: 400, avgOutputTokensPerTurn: 700, avgSessionTurns: 10, monthlySessionsPerSeat: 50 },
  general_assistant: { avgSystemPromptTokens: 500,  avgInputTokensPerTurn: 200, avgOutputTokensPerTurn: 350, avgSessionTurns: 5, monthlySessionsPerSeat: 60 },
  image_generation:  { avgSystemPromptTokens: 200,  avgInputTokensPerTurn: 100, avgOutputTokensPerTurn: 50,  avgSessionTurns: 3, monthlySessionsPerSeat: 30 },
  api_integration:   { avgSystemPromptTokens: 2500, avgInputTokensPerTurn: 800, avgOutputTokensPerTurn: 600, avgSessionTurns: 6, monthlySessionsPerSeat: 100 },
};
