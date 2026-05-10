'use client'

import { useEffect, useState } from 'react'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import styles from './results.module.css'

interface ShareBlockProps {
  shareId: string
  shareUrlFromServer: string
}

export function ShareBlock({ shareId, shareUrlFromServer }: ShareBlockProps) {
  const { copied, copy } = useCopyToClipboard()
  const [href, setHref] = useState(shareUrlFromServer)

  useEffect(() => {
    if (!shareUrlFromServer) {
      setHref(`${window.location.origin}/results/${shareId}`)
    }
  }, [shareId, shareUrlFromServer])

  return (
    <div className={styles.shareLeadCard}>
      <h3 className={styles.footerCardTitle}>Share your audit</h3>
      <p className={styles.footerCardSub}>
        Generate a secure, read-only link to share these results with your team.
      </p>
      <div className={styles.shareRow}>
        <input
          className={styles.shareInput}
          readOnly
          aria-label="Share link"
          value={href || `…/results/${shareId}`}
        />
        <button
          type="button"
          className={styles.copyBtn}
          onClick={() => copy(href)}
          disabled={!href}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            content_copy
          </span>
          {copied ? 'Copied ✓' : 'Copy link'}
        </button>
      </div>
    </div>
  )
}
