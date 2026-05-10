import { Skeleton } from '@/components/ui/Skeleton'
import styles from './results.module.css'

export function SummarySkeleton() {
  return (
    <section className={styles.summary} aria-label="Loading summary">
      <div className={styles.summaryTitle}>
        <span className="material-symbols-outlined" aria-hidden="true">
          psychology
        </span>
        Your personalized audit summary
      </div>
      <div style={{ display: 'grid', gap: 'var(--space-xs)' }}>
        <Skeleton height="1.25rem" />
        <Skeleton height="1.25rem" />
        <Skeleton height="1.25rem" width="70%" />
      </div>
    </section>
  )
}

