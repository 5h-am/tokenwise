import { getReport } from '@/lib/api'
import { SummaryBlock } from './SummaryBlock'
import { SummarySkeleton } from './SummarySkeleton'

export async function AISummary({ shareId }: { shareId: string }) {
  const report = await getReport(shareId)
  if (!report.summary) {
    return <SummarySkeleton />
  }
  return <SummaryBlock summary={report.summary} />
}

