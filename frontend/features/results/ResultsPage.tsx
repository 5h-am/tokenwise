import Link from 'next/link'
import type { PublicAuditReport } from '@/lib/types'
import styles from './results.module.css'
import { SavingsHero } from './SavingsHero'
import { TokenAnalysisBlock } from './TokenAnalysisBlock'
import { ToolResultCard } from './ToolResultCard'
import { HonestZeroState } from './HonestZeroState'
import { UnitEconomicsStrip } from './UnitEconomicsStrip'
import { SummarySection } from './SummarySection'
import { SummaryBlock } from './SummaryBlock'
import { LeadCaptureForm } from './LeadCaptureForm'
import { ShareBlock } from './ShareBlock'
import { RecommendationsBlock } from './RecommendationsBlock'

interface ResultsPageProps {
  report: PublicAuditReport
  shareUrl: string
  demoMode?: boolean
}

export function ResultsPage({ report, shareUrl, demoMode = false }: ResultsPageProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <Link className={styles.topbarBrand} href="/">
          Tokenwise
        </Link>
        <Link className={styles.backBtn} href="/audit">
          <span className="material-symbols-outlined" aria-hidden="true">
            arrow_back
          </span>
          New Audit
        </Link>
      </header>

      <main className={styles.content}>
        <div className={styles.canvas}>
          <header>
            <h2 className={styles.pageTitle}>Audit Results</h2>
            <p className={styles.pageSub}>Analysis complete for your AI workspace infrastructure.</p>
          </header>

          <SavingsHero report={report} />
          <RecommendationsBlock report={report} />

          {report.totalMonthlySavings < 100 ? <HonestZeroState /> : null}

          {demoMode && report.summary ? (
            <SummaryBlock summary={report.summary} />
          ) : (
            <SummarySection shareId={report.shareId} shouldPoll={report.summary === null} />
          )}

          {report.tokenWaste ? (
            <TokenAnalysisBlock tokenWaste={report.tokenWaste} tokenRecs={report.tokenRecs} />
          ) : null}

          <section>
            <h3 className={styles.sectionTitle}>Tool Spend Breakdown</h3>
            <div className={styles.toolList}>
              {report.toolResults.map((tr) => (
                <ToolResultCard key={tr.toolId} result={tr} />
              ))}
            </div>
          </section>

          <UnitEconomicsStrip economics={report.unitEconomics} />

          <div className={styles.footerGrid}>
            {demoMode ? (
              <div className={styles.shareLeadCard}>
                <h3 className={styles.footerCardTitle}>Export Full Report</h3>
                <p className={styles.footerCardSub}>
                  Report delivery is tied to a live audit. Run your stack through the auditor to unlock email delivery.
                </p>
                <Link className={styles.submitPdf} href="/audit">
                  Run my audit
                  <span className="material-symbols-outlined" aria-hidden="true">
                    arrow_forward
                  </span>
                </Link>
              </div>
            ) : (
              {/* <LeadCaptureForm shareId={report.shareId} isHighSavings={report.credexRecommended} /> */}
              null
            )}
            <ShareBlock shareId={report.shareId} shareUrlFromServer={shareUrl} />
          </div>

          <div className={styles.backRow}>
            <Link className={styles.backBtnLarge} href="/audit">
              <span className="material-symbols-outlined" aria-hidden="true">
                arrow_back
              </span>
              Run Another Audit
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
