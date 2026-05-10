import { Suspense } from 'react'
import { AISummary } from './AISummary'
import { SummaryPoller } from './SummaryPoller'
import { SummarySkeleton } from './SummarySkeleton'

export function SummarySection({ shareId, shouldPoll }: { shareId: string; shouldPoll: boolean }) {
  return (
    <section>
      <SummaryPoller shouldPoll={shouldPoll} />
      <Suspense fallback={<SummarySkeleton />}>
        <AISummary shareId={shareId} />
      </Suspense>
    </section>
  )
}

