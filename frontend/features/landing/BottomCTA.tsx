import Link from 'next/link'
import styles from './landing.module.css'

export function BottomCTA() {
  return (
    <section className={styles.bottomCta}>
      <div className={styles.container}>
        <h2 className={styles.bottomTitle}>Audit My AI Stack — It&apos;s Free</h2>
        <div className={styles.heroActions}>
          <Link href="/audit" className={styles.bottomCtaButton}>
            Start Free Audit Now
          </Link>
        </div>
        <p className={styles.bottomMeta}>No login. No credit card. Results in 60 seconds.</p>
      </div>
    </section>
  )
}
