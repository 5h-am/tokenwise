import { formatCompactNumber, formatPercent } from '@/lib/formatters'
import type { TokenOptimizationRec, TokenWasteAnalysis } from '@/lib/types'
import styles from './results.module.css'

interface TokenAnalysisBlockProps {
  tokenWaste: TokenWasteAnalysis
  tokenRecs: TokenOptimizationRec[]
}

function pickPrimaryAction(recs: TokenOptimizationRec[]): string {
  const first = recs.slice().sort((a, b) => b.estimatedMonthlySavings - a.estimatedMonthlySavings)[0]
  if (!first) return 'Review prompts'
  const t = first.technique
  if (t === 'prompt_caching') return 'Enable caching'
  if (t === 'context_summarization') return 'Summarize context'
  if (t === 'sliding_window') return 'Use sliding window'
  return 'Refactor prompts'
}

export function TokenAnalysisBlock({ tokenWaste, tokenRecs }: TokenAnalysisBlockProps) {
  const wastePercent =
    tokenWaste.naiveMonthlyTokens > 0
      ? ((tokenWaste.naiveMonthlyTokens - tokenWaste.optimisedMonthlyTokens) / tokenWaste.naiveMonthlyTokens) * 100
      : 0

  return (
    <section>
      <h3 className={styles.sectionTitle}>API &amp; Token Efficiency</h3>
      <div className={styles.tokenGrid}>
        <article className={styles.card}>
          <span className={styles.tileLabel}>Naive tokens</span>
          <span className={styles.tileValue}>{formatCompactNumber(tokenWaste.naiveMonthlyTokens)}</span>
          <span className={styles.tileMeta}>Last 30 days</span>
        </article>
        <article className={styles.card}>
          <span className={styles.tileLabel}>Optimized tokens</span>
          <span className={styles.tileValue}>{formatCompactNumber(tokenWaste.optimisedMonthlyTokens)}</span>
          <span className={styles.tileMeta}>Projected usage</span>
        </article>
        <article className={`${styles.card} ${styles.wasteTile}`}>
          <span className={styles.tileLabel}>Waste %</span>
          <span className={styles.tileValue}>{formatPercent(wastePercent)}</span>
          <span className={styles.tileMeta}>Token inefficiency</span>
        </article>
        <article className={styles.card}>
          <span className={styles.tileLabel}>Action</span>
          <span className={styles.actionBadge}>{pickPrimaryAction(tokenRecs)}</span>
          <span className={styles.tileMeta}>Highest impact</span>
        </article>
      </div>
    </section>
  )
}

