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

const GEMINI_MODEL = process.env['GEMINI_MODEL'] ?? 'gemini-2.5-flash';
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
      systemInstruction: {
        parts: [
          {
            text: 'You are an AI spend analyst. Be direct. No filler.',
          },
        ],
      },
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
        temperature: 0.2,
        maxOutputTokens: 180,
      },
    }),
  });

  if (!response.ok) {
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
    'Write a plain-English audit summary of about 100 words for a finance leader.',
    'Use the data below. Mention the most important savings and risk signals. Do not invent facts.',
    `Current monthly spend: $${report.currentMonthlySpend}`,
    `Optimized monthly spend: $${report.optimizedMonthlySpend}`,
    `Monthly savings: $${report.totalMonthlySavings}`,
    `Annual savings: $${report.totalAnnualSavings}`,
    `Health grade: ${report.healthScore.letterGrade}`,
    `Credex recommended: ${report.credexRecommended}`,
    `Tools:\n${tools || 'none'}`,
    `Top opportunities:\n${opportunities || 'none'}`,
  ].join('\n\n');
}
