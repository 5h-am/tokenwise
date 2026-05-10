import { LANDING_STEPS } from '@/lib/constants'
import styles from './landing.module.css'

export function HowItWorks() {
  return (
    <section className={styles.howSection}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>The Forensic Process</h2>
        <div className={styles.stepsGrid}>
          {LANDING_STEPS.map((step) => (
            <article key={step.title} className={styles.stepCard}>
              <div className={styles.stepIcon}>{step.icon.slice(0, 2).toUpperCase()}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDescription}>{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
