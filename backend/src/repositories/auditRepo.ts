import { pool } from '../lib/db.js';
import { AppError } from '../lib/AppError.js';
import type { AuditInput, AuditReport } from '../engine/types.js';

export interface AuditRow {
  id: string;
  share_id: string;
  input_json: AuditInput;
  report_json: AuditReport;
  total_monthly_savings: string;
  total_annual_savings: string;
  health_grade: string;
  health_raw_score: string;
  credex_recommended: boolean;
  tool_count: number;
  team_size: number;
  created_at: string;
}

export async function insertAudit(
  input: AuditInput,
  report: AuditReport
): Promise<{ id: string; shareId: string }> {
  const result = await pool.query<{ id: string; share_id: string }>(
    `INSERT INTO audits
       (input_json, report_json,
        total_monthly_savings, total_annual_savings,
        health_grade, health_raw_score,
        credex_recommended, tool_count, team_size)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, share_id`,
    [
      JSON.stringify(input),
      JSON.stringify(report),
      report.totalMonthlySavings,
      report.totalAnnualSavings,
      report.healthScore.letterGrade,
      report.healthScore.rawScore,
      report.credexRecommended,
      report.toolResults.length,
      input.teamSize,
    ]
  );

  const row = result.rows[0];
  if (!row) throw new AppError('Failed to persist audit', 500, false);
  return { id: row.id, shareId: row.share_id };
}

export async function findAuditByShareId(
  shareId: string
): Promise<AuditRow | null> {
  const result = await pool.query<AuditRow>(
    `SELECT * FROM audits WHERE share_id = $1 LIMIT 1`,
    [shareId]
  );
  return result.rows[0] ?? null;
}

export async function updateAuditSummary(
  shareId: string,
  summary: string
): Promise<void> {
  await pool.query(
    `UPDATE audits
     SET report_json = jsonb_set(report_json, '{summary}', $1::jsonb)
     WHERE share_id = $2`,
    [JSON.stringify(summary), shareId]
  );
}
