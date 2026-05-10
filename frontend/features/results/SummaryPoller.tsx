'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function SummaryPoller({ shouldPoll }: { shouldPoll: boolean }) {
  const router = useRouter()

  useEffect(() => {
    if (!shouldPoll) return
    const id = window.setInterval(() => router.refresh(), 3000)
    const stopId = window.setTimeout(() => window.clearInterval(id), 60000)
    return () => {
      window.clearInterval(id)
      window.clearTimeout(stopId)
    }
  }, [router, shouldPoll])

  return null
}

