import styles from './results.module.css'

export function CredexCTABlock() {
  return (
    <section className={styles.ctaBlock}>
      <div>
        <h3 className={styles.ctaTitle}>Significant savings detected</h3>
        <p className={styles.ctaText}>
          You have over $500 in immediate monthly savings available. Tokenwise can help you implement these changes.
        </p>
      </div>
      <a className={styles.ctaBtn} href="/audit">
        Talk to Tokenwise
        <span className="material-symbols-outlined" aria-hidden="true">
          arrow_forward
        </span>
      </a>
    </section>
  )
}
