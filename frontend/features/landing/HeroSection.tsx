import Link from 'next/link'
import styles from './landing.module.css'

export function HeroSection() {
  return (
    <section className={styles.hero}>
      <h1 className={styles.heroTitle}>Find out exactly where your AI spend is wasted.</h1>
      <p className={styles.heroSub}>A free audit for startups to identify overspending in their AI stack.</p>
      <div className={styles.heroActions}>
        <Link href="/audit" className={styles.heroPrimary}>
          Run My Free Audit
        </Link>
        <Link href="/results/sample" className={styles.heroSecondary}>
          See a sample report
        </Link>
      </div>
    </section>
  )
}
