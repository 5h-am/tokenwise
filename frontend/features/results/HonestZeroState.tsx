import styles from './results.module.css'

export function HonestZeroState() {
  return (
    <section className={styles.card}>
      <h3 className={styles.sectionTitle}>You're spending well</h3>
      <p className={styles.pageSub}>
        No meaningful savings were detected. Keep monitoring utilization and sign up below to be notified when new
        optimizations apply to your stack.
      </p>
    </section>
  )
}
