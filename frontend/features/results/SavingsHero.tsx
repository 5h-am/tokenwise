import { formatCurrency } from '@/lib/formatters'
import type { PublicAuditReport } from '@/lib/types'
import styles from './results.module.css'

interface SavingsHeroProps {
  report: PublicAuditReport
}

export function SavingsHero({ report }: SavingsHeroProps) {
  return (
    <section className={styles.heroGrid}>
      <article className={styles.card}>
        <h3 className={styles.heroKicker}>Identified waste mitigation</h3>
        <div className={styles.heroValueRow}>
          <span className={styles.heroValue}>{formatCurrency(report.totalAnnualSavings)}</span>
          <span className={styles.heroUnit}>/ yr projected</span>
        </div>
        <div className={styles.heroTrend}>
          <span className="material-symbols-outlined" aria-hidden="true">
            trending_down
          </span>
          {formatCurrency(report.totalMonthlySavings)} / mo immediate savings
        </div>
      </article>
      <article className={styles.card}>
        <div className={styles.gradeRing} aria-label={`Infrastructure health grade ${report.healthScore.letterGrade}`}>
          <span className={styles.gradeText}>{report.healthScore.letterGrade}</span>
          <span className={styles.gradeOverlay} aria-hidden="true" />
        </div>
        <div className={styles.gradeLabel}>Infrastructure health</div>
        <p className={styles.pageSub}>Action required to optimize spend efficiency.</p>
      </article>
    </section>
  )
}

