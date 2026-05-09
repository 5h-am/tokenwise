import { runAudit } from '../engine/auditEngine.js';
import { insertAudit, findAuditByShareId } from '../repositories/auditRepo.js';
import type { AuditInput, AuditReport } from '../engine/types.js';
import { AppError } from '../lib/AppError.js';

export async function processAudit(input: AuditInput): Promise<{ shareId: string; report: AuditReport }> {
  const report = runAudit(input);
  const { shareId } = await insertAudit(input, report);

  return { shareId, report };
}

export async function getPublicAudit(shareId: string): Promise<{ shareId: string; report: AuditReport }> {
  const auditRow = await findAuditByShareId(shareId);
  if (!auditRow) {
    throw new AppError('Audit not found', 404, true);
  }

  return {
    shareId: auditRow.share_id,
    report: auditRow.report_json,
  };
}
