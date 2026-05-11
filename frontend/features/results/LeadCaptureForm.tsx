'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { submitLead } from '@/lib/api'
import { LEAD_ROLE_OPTIONS } from '@/lib/constants'
import styles from './results.module.css'

interface LeadCaptureFormProps {
  shareId: string
  isHighSavings: boolean
}

export function LeadCaptureForm({ shareId, isHighSavings }: LeadCaptureFormProps) {
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [website, setWebsite] = useState('')
  const [busy, setBusy] = useState(false)
  const [statusText, setStatusText] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  // Check if we already submitted a lead for this shareId recently
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem(`lead_sent_${shareId}`)) {
        setDone(true)
      }
    }
  }, [shareId])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setStatusText(null)
    if (website.trim() !== '') {
      setDone(true)
      return
    }
    setBusy(true)
    try {
      let screenshot: string | undefined = undefined;
      try {
        setStatusText('Preparing report preview...')
        const html2canvas = (await import('html2canvas')).default
        const canvasElement = document.querySelector('main') || document.body
        const canvas = await html2canvas(canvasElement as HTMLElement, {
          scale: 1.5,
          useCORS: true,
          logging: false
        })
        screenshot = canvas.toDataURL('image/png')
      } catch (screenshotError) {
        console.error('Failed to capture screenshot', screenshotError)
      }

      setStatusText('Sending report...')
      await submitLead({
        shareId,
        email: email.trim(),
        companyName: company.trim() || undefined,
        role: role || undefined,
        screenshot
      })
      if (typeof window !== 'undefined') {
        localStorage.setItem(`lead_sent_${shareId}`, 'true')
      }
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit. Please try again.')
    } finally {
      setBusy(false)
      setStatusText(null)
    }
  }

  if (done) {
    return (
      <div
        className={`${styles.shareLeadCard} ${isHighSavings ? styles.shareLeadHighlight : ''}`}
        aria-live="polite"
      >
        <p className={styles.formSuccess}>Report request received. Check your inbox.</p>
      </div>
    )
  }

  return (
    <div className={`${styles.shareLeadCard} ${isHighSavings ? styles.shareLeadHighlight : ''}`}>
      <h3 className={styles.footerCardTitle}>Export Full Report</h3>
      <p className={styles.footerCardSub}>Get the detailed 15-page PDF breakdown sent to your inbox.</p>
      <form className={styles.formFields} onSubmit={handleSubmit}>
        <div>
          <label className={styles.fieldLabel} htmlFor="lead-email">
            Work email
          </label>
          <input
            id="lead-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            className={styles.formInput}
            placeholder="name@company.com"
          />
        </div>
        <div className={styles.formRow}>
          <div>
            <label className={styles.fieldLabel} htmlFor="lead-company">
              Company
            </label>
            <input
              id="lead-company"
              name="companyName"
              type="text"
              autoComplete="organization"
              value={company}
              onChange={(ev) => setCompany(ev.target.value)}
              className={styles.formInput}
              placeholder="Acme Corp"
            />
          </div>
          <div>
            <label className={styles.fieldLabel} htmlFor="lead-role">
              Role
            </label>
            <select
              id="lead-role"
              name="role"
              value={role}
              onChange={(ev) => setRole(ev.target.value)}
              className={styles.formSelect}
            >
              <option value="">Select role</option>
              {LEAD_ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
        <input
          id="lead-website"
          name="website"
          tabIndex={-1}
          aria-hidden="true"
          value={website}
          onChange={(ev) => setWebsite(ev.target.value)}
          autoComplete="off"
          className={styles.honeypot}
        />
        <button className={styles.submitPdf} type="submit" disabled={busy}>
          {busy ? statusText ?? 'Sending...' : 'Send My Report'}
          <span className="material-symbols-outlined" aria-hidden="true">
            {busy ? 'progress_activity' : 'arrow_forward'}
          </span>
        </button>
        {busy && statusText ? (
          <div className={styles.formStatus} role="status" aria-live="polite">
            {statusText}
          </div>
        ) : null}
        {error ? (
          <div className={styles.formError} role="status">
            {error}
          </div>
        ) : null}
      </form>
    </div>
  )
}
