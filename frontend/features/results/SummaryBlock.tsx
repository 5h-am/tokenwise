import styles from './results.module.css'

interface SummaryBlockProps {
  summary: string | null
}

export function SummaryBlock({ summary }: SummaryBlockProps) {
  return (
    <section className={styles.summary}>
      <h3 className={styles.summaryTitle}>
        <span className="material-symbols-outlined" aria-hidden="true">
          psychology
        </span>
        Your personalized audit summary
      </h3>
      <p className={styles.summaryText}>{summary ?? 'Summary is generating.'}</p>
    </section>
  )
}

