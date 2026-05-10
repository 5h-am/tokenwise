import { LANDING_TOOL_LOGOS } from '@/lib/constants'
import styles from './landing.module.css'

export function ToolLogosStrip() {
  return (
    <section className={styles.logos}>
      <div className={`${styles.container} ${styles.logosRow}`}>
        {LANDING_TOOL_LOGOS.map((tool) => (
          <span key={tool}>{tool}</span>
        ))}
      </div>
    </section>
  )
}
