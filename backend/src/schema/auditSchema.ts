import { z } from 'zod';

export const toolEntrySchema = z.object({
  toolId: z.enum([
    'cursor',
    'github_copilot',
    'claude',
    'chatgpt',
    'anthropic_api',
    'openai_api',
    'gemini',
    'windsurf',
    'v0',
    'other',
  ]),
  planId: z.enum([
    'free',
    'individual',
    'pro',
    'pro_plus',
    'team',
    'business',
    'enterprise',
    'ultra',
    'max',
    'pay_as_you_go',
  ]),
  monthlySpend: z.number().min(0),
  seats: z.number().min(1),
  useCase: z.enum([
    'code_generation',
    'content_writing',
    'data_analysis',
    'customer_support',
    'research',
    'general_assistant',
    'image_generation',
    'api_integration',
  ]),
});

export const auditInputSchema = z.object({
  tools: z.array(toolEntrySchema).min(1),
  teamSize: z.number().min(1),
  avgSessionTurns: z.number().optional(),
  avgSystemPromptTokens: z.number().optional(),
  avgInputTokensPerTurn: z.number().optional(),
  avgOutputTokensPerTurn: z.number().optional(),
  monthlyAISessions: z.number().optional(),
  hasPromptCaching: z.boolean().optional(),
  hasContextSummarization: z.boolean().optional(),
  shadowITSpendPercent: z.number().optional(),
  surpriseRenewals: z.number().optional(),
});
