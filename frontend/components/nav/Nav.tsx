import Link from 'next/link'
import styles from './Nav.module.css'

export function Nav() {
  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          Tokenwise
        </Link>
        <Link href="/audit" className={styles.cta}>
          Start Free Audit
        </Link>
      </div>
    </nav>
  )
}
