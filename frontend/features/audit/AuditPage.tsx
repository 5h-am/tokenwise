import Link from 'next/link'
import { AuditForm } from './AuditForm'
import styles from './audit.module.css'

export function AuditPage() {
  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <Link className={styles.topbarBrand} href="/">Tokenwise</Link>
        <Link className={styles.topbarHome} href="/">
          <span className="material-symbols-outlined" aria-hidden="true">
            home
          </span>
          Home
        </Link>
      </header>

      <main className={styles.content}>
        <section className={styles.card}>
          <div className={styles.progressRow}>
            <h2 className={styles.progressTitle}>Audit Setup</h2>
            <div className={styles.progressMeta}>
              <span className={styles.progressLabel}>Step 1 of 2</span>
              <div className={styles.progressBars} aria-hidden="true">
                <span className={styles.barOn} />
                <span className={styles.barOff} />
              </div>
            </div>
          </div>
          <AuditForm />
        </section>
      </main>
    </div>
  )
}
