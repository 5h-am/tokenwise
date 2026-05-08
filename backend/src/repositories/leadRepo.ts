import { pool } from '../lib/db.js';
import { AppError } from '../lib/AppError.js';

export interface LeadRow {
  id: string;
  audit_share_id: string;
  email: string;
  company_name: string | null;
  role: string | null;
  team_size: number | null;
  is_high_savings: boolean;
  created_at: string;
}

export interface InsertLeadParams {
  auditShareId: string;
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  isHighSavings: boolean;
}

export async function insertLead(
  params: InsertLeadParams
): Promise<{ id: string; created: boolean }> {
  const result = await pool.query<{ id: string }>(
    `INSERT INTO leads
       (audit_share_id, email, company_name, role, team_size, is_high_savings)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (audit_share_id, email) DO NOTHING
     RETURNING id`,
    [
      params.auditShareId,
      params.email,
      params.companyName ?? null,
      params.role ?? null,
      params.teamSize ?? null,
      params.isHighSavings,
    ]
  );

  if (result.rows.length === 0) {
    const existing = await pool.query<{ id: string }>(
      `SELECT id FROM leads WHERE audit_share_id = $1 AND email = $2`,
      [params.auditShareId, params.email]
    );
    const row = existing.rows[0];
    if (!row) throw new AppError('Failed to resolve lead', 500, false);
    return { id: row.id, created: false };
  }

  const row = result.rows[0];
  if (!row) throw new AppError('Failed to persist lead', 500, false);
  return { id: row.id, created: true };
}

export async function findLeadByShareAndEmail(
  auditShareId: string,
  email: string
): Promise<LeadRow | null> {
  const result = await pool.query<LeadRow>(
    `SELECT * FROM leads WHERE audit_share_id = $1 AND email = $2 LIMIT 1`,
    [auditShareId, email]
  );
  return result.rows[0] ?? null;
}
