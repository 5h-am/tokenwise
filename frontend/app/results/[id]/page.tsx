import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getReport } from '@/lib/api'
import { formatCurrency } from '@/lib/formatters'
import { ResultsPage } from '@/features/results/ResultsPage'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const report = await getReport(id)
  return {
    title: `AI Audit — ${formatCurrency(report.totalMonthlySavings)}/mo savings found`,
    description: `Health grade: ${report.healthScore.letterGrade}. ${formatCurrency(report.totalAnnualSavings)} projected annually.`,
    openGraph: {
      title: `AI Audit — ${formatCurrency(report.totalMonthlySavings)}/mo savings found`,
      description: `Health grade: ${report.healthScore.letterGrade}. ${formatCurrency(report.totalAnnualSavings)} projected annually.`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `AI Audit — ${formatCurrency(report.totalMonthlySavings)}/mo savings found`,
      description: `Health grade: ${report.healthScore.letterGrade}. ${formatCurrency(report.totalAnnualSavings)} projected annually.`,
    },
  }
}

export default async function ResultRoutePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const report = await getReport(id)
  const headerList = await headers()
  const xfHost = headerList.get('x-forwarded-host')
  const host = xfHost ?? headerList.get('host') ?? ''
  const protoRaw = headerList.get('x-forwarded-proto') ?? 'https'
  const proto = protoRaw.split(',')[0]?.trim() ?? 'https'
  const derivedBase = host ? `${proto}://${host}` : ''
  const envBase = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? ''
  const shareBase = envBase || derivedBase
  const shareUrl = shareBase ? `${shareBase}/results/${report.shareId}` : ''

  return <ResultsPage report={report} shareUrl={shareUrl} />
}
