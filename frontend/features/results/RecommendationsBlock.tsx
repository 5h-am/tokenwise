import { formatCurrency, formatMoneyPerMonth } from '@/lib/formatters'
import type { PublicAuditReport, SavingsOpportunity } from '@/lib/types'
import styles from './results.module.css'

interface RecommendationsBlockProps {
  report: PublicAuditReport
}

function categoryLabel(category: SavingsOpportunity['category']): string {
  if (category === 'wrong_plan') return 'Plan mismatch'
  if (category === 'redundant_tool') return 'Redundant tool'
  if (category === 'underutilised_seats') return 'Unused seats'
  if (category === 'token_waste') return 'Token waste'
  if (category === 'alternative_tool') return 'Cheaper alternative'
  if (category === 'credits_opportunity') return 'Credits/free tier'
  return 'Spend anomaly'
}

function priorityLabel(index: number): string {
  return `Priority ${index + 1}`
}

export function RecommendationsBlock({ report }: RecommendationsBlockProps) {
  const opportunities = report.toolResults
    .flatMap((tool) => tool.opportunities)
    .sort((a, b) => b.monthlySavings - a.monthlySavings)
  const score = report.healthScore.rawScore <= 1 ? report.healthScore.rawScore * 100 : report.healthScore.rawScore

  return (
    <section className={styles.recommendations}>
      <div className={styles.sectionHeader}>
        <div>
          <h3 className={styles.sectionTitle}>Recommended Improvements</h3>
          <p className={styles.sectionSub}>
            Practical actions ranked by monthly savings, usage fit, same-vendor plan fit, alternative tools, and
            credit/free-tier opportunities.
          </p>
        </div>
        <div className={styles.scorePill}>
          {Math.round(score)}
          <span>/100</span>
        </div>
      </div>

      {opportunities.length > 0 ? (
        <div className={styles.recommendationGrid}>
          {opportunities.map((opportunity, index) => (
            <article className={styles.recommendationCard} key={`${opportunity.category}-${opportunity.toolId}`}>
              <div className={styles.recommendationTop}>
                <span className={styles.priorityBadge}>{priorityLabel(index)}</span>
                <span className={styles.categoryBadge}>{categoryLabel(opportunity.category)}</span>
              </div>
              <div className={styles.recommendationImpact}>
                <span>{formatMoneyPerMonth(opportunity.monthlySavings)}</span>
                <small>{formatCurrency(opportunity.annualSavings)} per year</small>
              </div>
              <h4 className={styles.recommendationAction}>{opportunity.action}</h4>
              <p className={styles.recommendationReason}>{opportunity.reason}</p>
              <dl className={styles.recommendationNumbers}>
                <div>
                  <dt>Current</dt>
                  <dd>{formatMoneyPerMonth(opportunity.currentMonthlySpend)}</dd>
                </div>
                <div>
                  <dt>Optimized</dt>
                  <dd>{formatMoneyPerMonth(opportunity.optimizedMonthlySpend)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      ) : (
        <article className={styles.recommendationEmpty}>
          <h4>No high-confidence savings actions found</h4>
          <p>
            Tokenwise did not identify a clear downgrade, duplicate tool, seat waste, or spend anomaly from the
            submitted stack.
          </p>
        </article>
      )}

      <div className={styles.priorityStrip}>
        <span className={styles.tileLabel}>Health priorities</span>
        <div className={styles.priorityList}>
          {report.healthScore.improvementPriority.map((priority) => (
            <span className={styles.actionBadge} key={priority}>
              {priority.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
