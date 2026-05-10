import Link from 'next/link'
import { LANDING_SAMPLE_RESULT } from '@/lib/constants'
import styles from './landing.module.css'

export function SampleSavingsCard() {
  return (
    <section className={styles.sample}>
      <div className={styles.container}>
        <article className={styles.sampleCard}>
          <div className={styles.sampleTop}>
            <div>
              <p className={styles.statLabel}>Sample audit result</p>
              <h3 className={styles.sectionTitle}>{LANDING_SAMPLE_RESULT.title}</h3>
              <p className={styles.sampleMeta}>{LANDING_SAMPLE_RESULT.subtitle}</p>
              <div className={styles.sampleSavings}>Potential savings {LANDING_SAMPLE_RESULT.savings}</div>
            </div>
            <div className={styles.grade}>{LANDING_SAMPLE_RESULT.grade}</div>
          </div>
          <Link href="/results/sample" className={styles.sampleLink}>
            See full sample report
          </Link>
        </article>
      </div>
    </section>
  )
}
