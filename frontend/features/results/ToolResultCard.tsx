import { formatCurrency, formatMoneyPerMonth } from '@/lib/formatters'
import type { ToolAuditResult } from '@/lib/types'
import styles from './results.module.css'

interface ToolResultCardProps {
  result: ToolAuditResult
}

function toolLabel(toolId: string): string {
  if (toolId === 'github_copilot') return 'GitHub Copilot'
  if (toolId === 'openai_api') return 'OpenAI API'
  if (toolId === 'anthropic_api') return 'AI API'
  if (toolId === 'chatgpt') return 'ChatGPT'
  if (toolId === 'windsurf') return 'Windsurf'
  if (toolId === 'gemini') return 'Gemini'
  if (toolId === 'cursor') return 'Cursor'
  if (toolId === 'claude') return 'Claude'
  if (toolId === 'v0') return 'v0'
  return 'Other'
}

function actionLabel(result: ToolAuditResult): string {
  const top = result.opportunities.slice().sort((a, b) => b.monthlySavings - a.monthlySavings)[0]
  return top?.action ?? (result.isWellConfigured ? 'Optimal' : 'Review')
}

export function ToolResultCard({ result }: ToolResultCardProps) {
  const label = toolLabel(result.toolId)
  const icon = label.slice(0, 1).toUpperCase()
  const topOpportunity = result.opportunities.slice().sort((a, b) => b.monthlySavings - a.monthlySavings)[0]

  return (
    <article className={`${styles.card} ${styles.toolRow}`}>
      <div className={styles.toolLeft}>
        <div className={styles.toolIcon} aria-hidden="true">
          {icon}
        </div>
        <div>
          <h4 className={styles.toolName}>{label}</h4>
          <p className={styles.toolMeta}>
            {result.planId}
            {result.flags.length > 0 ? ` · ${result.flags.join(', ')}` : ' · well configured'}
          </p>
          {topOpportunity ? <p className={styles.toolReason}>{topOpportunity.reason}</p> : null}
        </div>
      </div>
      <div className={styles.toolRight}>
        <div className={styles.toolSpend}>
          <span className={styles.toolSpendValue}>{formatMoneyPerMonth(result.currentMonthlySpend)}</span>
          <span className={styles.toolSpendLabel}>Current spend</span>
        </div>
        <span className={styles.actionBadge}>{actionLabel(result)}</span>
        <div className={styles.toolSavings}>
          <span className={styles.toolSavingsValue}>{`-${formatCurrency(result.monthlySavings)}`}</span>
          <span className={styles.toolSpendLabel}>Savings</span>
        </div>
      </div>
    </article>
  )
}
