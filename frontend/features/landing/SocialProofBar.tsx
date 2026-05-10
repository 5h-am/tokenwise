import { LANDING_SOCIAL_STATS } from '@/lib/constants'
import styles from './landing.module.css'

export function SocialProofBar() {
  return (
    <section className={styles.stats}>
      <div className={`${styles.container} ${styles.statsGrid}`}>
        {LANDING_SOCIAL_STATS.map((stat) => (
          <article key={stat.label} className={styles.statBlock}>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </article>
        ))}
      </div>
    </section>
  )
}
