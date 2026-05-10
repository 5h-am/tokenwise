import { formatCompactNumber, formatCurrency } from '@/lib/formatters'
import type { UnitEconomics } from '@/lib/types'
import styles from './results.module.css'

interface UnitEconomicsStripProps {
  economics: UnitEconomics
}

export function UnitEconomicsStrip({ economics }: UnitEconomicsStripProps) {
  return (
    <section>
      <h3 className={styles.sectionTitle}>Unit Economics</h3>
      <div className={styles.unitStrip}>
        <div className={styles.unitItem}>
          <span className={styles.tileLabel}>Avg cost / seat</span>
          <span className={styles.unitValue}>{formatCurrency(economics.costPerSeat)}</span>
        </div>
        <div className={styles.unitItem}>
          <span className={styles.tileLabel}>Avg cost / session</span>
          <span className={styles.unitValue}>
            {economics.costPerSession === null ? '—' : formatCurrency(economics.costPerSession)}
          </span>
        </div>
        <div className={styles.unitItem}>
          <span className={styles.tileLabel}>Waste / seat</span>
          <span className={styles.unitValue}>{formatCurrency(economics.wastePerSeat)}</span>
        </div>
        <div className={styles.unitItem}>
          <span className={styles.tileLabel}>Annual burn</span>
          <span className={styles.unitValue}>{formatCompactNumber(economics.annualisedBurn)}</span>
        </div>
      </div>
    </section>
  )
}

