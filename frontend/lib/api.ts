import type { AuditInput, LeadInput, PublicAuditReport, RunAuditResponse } from './types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

function getBaseUrl(): string {
  if (!BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured')
  }
  return BASE_URL
}

function parseJsonOrEmpty(text: string): unknown {
  if (!text.trim()) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}

function errorMessageFromPayload(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null
  const o = payload as { error?: { message?: string } }
  const m = o.error?.message
  return typeof m === 'string' && m.trim() ? m : null
}

function normalizePublicAuditReport(payload: unknown): PublicAuditReport | null {
  if (!payload || typeof payload !== 'object') return null
  const o = payload as Record<string, unknown>
  if (typeof o.shareId === 'string' && Array.isArray(o.toolResults)) {
    return payload as PublicAuditReport
  }
  const nested = o.report
  if (nested && typeof nested === 'object' && nested !== null && !Array.isArray(nested)) {
    const r = nested as Record<string, unknown>
    if (Array.isArray(r.toolResults) && typeof o.shareId === 'string') {
      return { shareId: o.shareId, ...(nested as Omit<PublicAuditReport, 'shareId'>) }
    }
  }
  return null
}

export async function runAudit(input: AuditInput): Promise<RunAuditResponse> {
  const res = await fetch(`${getBaseUrl()}/api/audit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  const text = await res.text()
  const parsed = parseJsonOrEmpty(text)

  if (!res.ok) {
    const msg = errorMessageFromPayload(parsed) ?? 'Audit failed'
    throw new Error(msg)
  }

  const flat = normalizePublicAuditReport(parsed)
  if (flat) {
    return flat as RunAuditResponse
  }

  throw new Error('Invalid audit response')
}

export async function getReport(shareId: string): Promise<PublicAuditReport> {
  const res = await fetch(`${getBaseUrl()}/api/audit/${shareId}`, {
    next: { revalidate: 60 },
  })

  const text = await res.text()
  const parsed = parseJsonOrEmpty(text)

  if (!res.ok) {
    const msg = errorMessageFromPayload(parsed) ?? 'Report not found'
    throw new Error(msg)
  }

  const report = normalizePublicAuditReport(parsed)
  if (report) {
    return report
  }

  throw new Error('Invalid report response')
}

export async function submitLead(data: LeadInput): Promise<void> {
  const res = await fetch(`${getBaseUrl()}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const text = await res.text()
    const parsed = parseJsonOrEmpty(text)
    const msg = errorMessageFromPayload(parsed) ?? 'Lead submission failed'
    throw new Error(msg)
  }
}
