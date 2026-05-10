import type { PlanTier, ToolId, UseCase } from './types'

export interface ToolCatalogEntry {
  id: ToolId
  label: string
  plans: PlanTier[]
}

export const TOOL_CATALOG: ToolCatalogEntry[] = [
  { id: 'cursor', label: 'Cursor', plans: ['free', 'pro', 'business'] },
  { id: 'github_copilot', label: 'GitHub Copilot', plans: ['free', 'pro', 'business', 'enterprise'] },
  { id: 'claude', label: 'Claude', plans: ['free', 'pro', 'team', 'enterprise'] },
  { id: 'chatgpt', label: 'ChatGPT', plans: ['free', 'pro', 'team', 'enterprise'] },
  { id: 'gemini', label: 'Gemini', plans: ['free', 'pro', 'team', 'business', 'enterprise'] },
  { id: 'openai_api', label: 'OpenAI API', plans: ['pay_as_you_go'] },
  { id: 'windsurf', label: 'Windsurf', plans: ['free', 'pro', 'team'] },
  { id: 'v0', label: 'v0', plans: ['free', 'pro', 'team'] },
  { id: 'other', label: 'Other', plans: ['free', 'pro', 'team', 'enterprise'] },
]

export const USE_CASE_OPTIONS: Array<{ id: UseCase; label: string }> = [
  { id: 'code_generation', label: 'Coding' },
  { id: 'content_writing', label: 'Writing' },
  { id: 'data_analysis', label: 'Data' },
  { id: 'research', label: 'Research' },
  { id: 'general_assistant', label: 'Mixed' },
]

export const LANDING_SOCIAL_STATS = [
  { label: 'Audited', value: '$2.4M' },
  { label: 'Stacks analyzed', value: '340+' },
  { label: 'Avg savings found', value: '34%' },
]

export const LANDING_STEPS = [
  {
    title: 'Step 1: Input Stack',
    description: 'Enter the tools and APIs your team currently uses.',
    icon: 'input',
  },
  {
    title: 'Step 2: Instant Audit',
    description: 'Our engine cross-references usage against optimal pricing tiers.',
    icon: 'analytics',
  },
  {
    title: 'Step 3: See Savings',
    description: 'Discover exact dollar amounts you can save immediately.',
    icon: 'savings',
  },
]

export const LANDING_TOOL_LOGOS = [
  'Cursor',
  'GitHub Copilot',
  'Claude',
  'ChatGPT',
  'Gemini',
  'Windsurf',
  'Gemini API',
  'OpenAI API',
]

export const LANDING_SAMPLE_RESULT = {
  title: 'Engineering Team Profile',
  subtitle: 'Team of 4 · $860/mo current spend',
  savings: '$290/mo',
  grade: 'B+',
}

export const LEAD_ROLE_OPTIONS = ['Finance / CFO', 'Engineering / CTO', 'Operations', 'Other'] as const
