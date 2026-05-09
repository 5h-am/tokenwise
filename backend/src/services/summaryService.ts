import type { AuditReport } from '../engine/types.js';
import { requestGeminiSummary } from '../lib/gemini.js';
import { updateAuditSummary } from '../repositories/auditRepo.js';

export async function generateAndPersistAuditSummary(
  shareId: string,
  report: AuditReport
): Promise<void> {
  const summary = await generateAuditSummary(report);
  await updateAuditSummary(shareId, summary);
}

export async function generateAuditSummary(report: AuditReport): Promise<string> {
  try {
    return await requestGeminiSummary(report);
  } catch {
    return buildFallbackSummary(report);
  }
}

function buildFallbackSummary(report: AuditReport): string {
  const savings = report.totalMonthlySavings;
  const grade = report.healthScore.letterGrade;
  const annualSavings = report.totalAnnualSavings;

  if (savings > 500) {
    return `Your AI stack is graded ${grade} and shows $${savings} in monthly savings, or $${annualSavings} per year. The biggest opportunities are in the top recommendations above, and the savings level is high enough that Credex should review the stack with you.`;
  }

  if (savings > 0) {
    return `Your AI stack is graded ${grade} and shows $${savings} in monthly savings, or $${annualSavings} per year. The current setup has some optimization room, but the recommendations should be prioritized by business impact rather than treated as urgent cuts.`;
  }

  return `Your AI stack is graded ${grade} and does not show measurable monthly savings from the current audit inputs. Keep the current configuration under review, especially as seat counts, plans, and AI usage change.`;
}
