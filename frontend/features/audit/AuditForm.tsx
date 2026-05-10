'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { runAudit } from '@/lib/api'
import type { AuditInput, PlanTier, ToolId, UseCase } from '@/lib/types'
import { useFormPersist } from '@/hooks/useFormPersist'
import { TOOL_CATALOG } from '@/lib/constants'
import styles from './audit.module.css'
import { TeamContextBar } from './TeamContextBar'
import { AdvancedParams, type AdvancedParamsState } from './AdvancedParams'
import { ToolCard, type ToolCardState } from './ToolCard'

interface AuditFormState {
  teamSize: number
  useCase: UseCase
  tools: ToolCardState[]
  advanced: AdvancedParamsState
}

function defaultTool(): ToolCardState {
  const base = TOOL_CATALOG.find((t) => t.id === 'chatgpt') ?? TOOL_CATALOG[0]
  return {
    toolId: base.id as ToolId,
    planId: base.plans[0] as PlanTier,
    monthlySpend: 600,
    seats: 20,
  }
}

const INITIAL: AuditFormState = {
  teamSize: 12,
  useCase: 'code_generation',
  tools: [
    defaultTool(),
    {
      toolId: 'github_copilot',
      planId: 'business',
      monthlySpend: 228,
      seats: 12,
    },
  ],
  advanced: {
    hasPromptCaching: true,
    hasContextSummarization: false,
  },
}

function buildInput(state: AuditFormState): AuditInput {
  return {
    teamSize: state.teamSize,
    tools: state.tools.map((t) => ({
      toolId: t.toolId,
      planId: t.planId,
      monthlySpend: t.monthlySpend,
      seats: t.seats,
      useCase: state.useCase,
    })),
    avgSessionTurns: state.advanced.avgSessionTurns,
    avgSystemPromptTokens: state.advanced.avgSystemPromptTokens,
    avgInputTokensPerTurn: state.advanced.avgInputTokensPerTurn,
    avgOutputTokensPerTurn: state.advanced.avgOutputTokensPerTurn,
    monthlyAISessions: state.advanced.monthlyAISessions,
    hasPromptCaching: state.advanced.hasPromptCaching,
    hasContextSummarization: state.advanced.hasContextSummarization,
    shadowITSpendPercent: state.advanced.shadowITSpendPercent,
  }
}

export function AuditForm() {
  const router = useRouter()
  const [state, setState] = useFormPersist<AuditFormState>('tokenwise-audit-form', INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canRemoveTool = useMemo(() => state.tools.length > 1, [state.tools.length])

  const updateTool = (idx: number, next: ToolCardState) => {
    setState({
      ...state,
      tools: state.tools.map((t, i) => (i === idx ? next : t)),
    })
  }

  const addTool = () => {
    setState({ ...state, tools: [...state.tools, defaultTool()] })
  }

  const removeTool = (idx: number) => {
    if (state.tools.length <= 1) return
    setState({ ...state, tools: state.tools.filter((_, i) => i !== idx) })
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const input = buildInput(state)
      const result = await runAudit(input)
      router.push(`/results/${result.shareId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Audit failed. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <TeamContextBar
        teamSize={state.teamSize}
        useCase={state.useCase}
        onTeamSizeChange={(teamSize) => setState({ ...state, teamSize })}
        onUseCaseChange={(useCase) => setState({ ...state, useCase })}
      />

      <div className={styles.toolsHeader}>
        <h4 className={styles.sectionTitle}>Which AI tools are you paying for?</h4>
        <button type="button" className={styles.addToolBtn} onClick={addTool}>
          <span className="material-symbols-outlined" aria-hidden="true">
            add
          </span>
          Add a tool
        </button>
      </div>

      <div className={styles.toolList}>
        {state.tools.map((tool, idx) => (
          <ToolCard
            key={`${tool.toolId}-${idx}`}
            idBase={`tool-${idx}`}
            value={tool}
            canRemove={canRemoveTool}
            onChange={(next) => updateTool(idx, next)}
            onRemove={() => removeTool(idx)}
          />
        ))}
      </div>

      <AdvancedParams value={state.advanced} onChange={(advanced) => setState({ ...state, advanced })} />

      <div className={styles.submitArea}>
        <button className={styles.submitBtn} type="submit" disabled={submitting}>
          {submitting ? 'Running audit' : 'Run My Audit'}
          <span className="material-symbols-outlined" aria-hidden="true">
            arrow_forward
          </span>
        </button>
        <div className={styles.savedNote}>
          <span className="material-symbols-outlined" aria-hidden="true">
            check_circle
          </span>
          Your inputs are saved automatically
        </div>
      </div>

      {error ? (
        <div className={styles.toast} role="status" aria-live="polite">
          {error}
        </div>
      ) : null}
    </form>
  )
}
