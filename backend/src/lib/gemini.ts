import type { AuditReport } from '../engine/types.js';

interface GeminiPart {
  text?: string;
}

interface GeminiCandidate {
  content?: {
    parts?: GeminiPart[];
  };
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
}

const GEMINI_MODEL = process.env['GEMINI_MODEL'] ?? 'gemini-1.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export async function requestGeminiSummary(report: AuditReport): Promise<string> {
  const apiKey = process.env['GEMINI_API_KEY'];
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: buildSummaryPrompt(report),
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.5,
      },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    console.error('[gemini] API error', response.status, errBody);
    throw new Error(`Gemini summary request failed with ${response.status}`);
  }

  const data = (await response.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? '')
    .join('')
    .trim();

  if (!text) {
    throw new Error('Gemini summary response did not include text');
  }

  return text;
}

function buildSummaryPrompt(report: AuditReport): string {
  const tools = report.toolResults
    .map((tool) => `${tool.toolId}: $${tool.currentMonthlySpend}/mo current, $${tool.monthlySavings}/mo savings, flags ${tool.flags.join(', ') || 'none'}`)
    .join('\n');

  const opportunities = report.topOpportunities
    .map((opportunity) => `${opportunity.category} on ${opportunity.toolId}: save $${opportunity.monthlySavings}/mo by ${opportunity.action}. Reason: ${opportunity.reason}`)
    .join('\n');

  return [
    'You are an expert AI spend analyst. Please provide a highly detailed and analytical summary of the audit findings below.',
    'Write a comprehensive, professional summary in plain English for a finance leader. Explain exactly where the waste is and the financial impact of the recommended changes. The output MUST be a complete paragraph of at least 100 words. Do not use bullet points.',
    'Use the data below. Mention the most important savings and risk signals. Do not invent facts.',
    `Current monthly spend: $${report.currentMonthlySpend}`,
    `Optimized monthly spend: $${report.optimizedMonthlySpend}`,
    `Monthly savings: $${report.totalMonthlySavings}`,
    `Annual savings: $${report.totalAnnualSavings}`,
    `Health grade: ${report.healthScore.letterGrade}`,
    `Tokenwise recommended: ${report.credexRecommended}`,
    `Tools:\n${tools || 'none'}`,
    `Top opportunities:\n${opportunities || 'none'}`,
  ].join('\n\n');
}
