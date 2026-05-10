import Link from 'next/link'
import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.brandName}>Tokenwise</span>
          <span className={styles.brandSub}>Forensic Spend Audit</span>
        </div>
        <div className={styles.links}>
          <Link href="/" className={styles.link}>
            About
          </Link>
          <Link href="/" className={styles.link}>
            Privacy
          </Link>
          <Link href="/" className={styles.link}>
            Terms
          </Link>
        </div>
        <div className={styles.powered}>Powered by Gemini API</div>
      </div>
    </footer>
  )
}
