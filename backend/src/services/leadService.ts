import { insertLead } from '../repositories/leadRepo.js';
import { getPublicAudit } from './auditService.js';
import { sendAuditEmail } from '../lib/email.js';
import type { LeadInput } from '../schema/leadSchema.js';

export async function processLead(input: LeadInput): Promise<void> {
  if (input.website) {
    return;
  }

  const audit = await getPublicAudit(input.shareId);
  const isHighSavings = audit.report.totalMonthlySavings > 500;

  const result = await insertLead({
    auditShareId: input.shareId,
    email: input.email,
    ...(input.companyName !== undefined && { companyName: input.companyName }),
    ...(input.role !== undefined && { role: input.role }),
    ...(input.teamSize !== undefined && { teamSize: input.teamSize }),
    isHighSavings,
  });

  if (result.created) {
    await sendAuditEmail(input.email, isHighSavings, audit.report, input.screenshot);
  }
}
