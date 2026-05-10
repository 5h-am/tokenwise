import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { SAMPLE_PUBLIC_AUDIT_REPORT } from '@/lib/sampleReport'
import { ResultsPage } from '@/features/results/ResultsPage'

export async function generateMetadata(): Promise<Metadata> {
  return {
  title: 'Sample audit report — Tokenwise',
    description:
      'Example AI spend audit with savings estimate, grade, token efficiency breakdown, and tool-level actions.',
    openGraph: {
    title: 'Sample audit report — Tokenwise',
      description:
        'Example AI spend audit with savings estimate, grade, token efficiency breakdown, and tool-level actions.',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Sample audit report — Tokenwise',
      description:
        'Example AI spend audit with savings estimate, grade, token efficiency breakdown, and tool-level actions.',
    },
  }
}

export default async function SampleResultsPage() {
  const headerList = await headers()
  const xfHost = headerList.get('x-forwarded-host')
  const host = xfHost ?? headerList.get('host') ?? ''
  const protoRaw = headerList.get('x-forwarded-proto') ?? 'https'
  const proto = protoRaw.split(',')[0]?.trim() ?? 'https'
  const derivedBase = host ? `${proto}://${host}` : ''
  const envBase = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? ''
  const shareBase = envBase || derivedBase
  const shareUrl = shareBase ? `${shareBase}/results/sample` : ''

  return <ResultsPage report={SAMPLE_PUBLIC_AUDIT_REPORT} shareUrl={shareUrl} demoMode />
}
