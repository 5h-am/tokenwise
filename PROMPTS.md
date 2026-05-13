# Prompts

## Audit Summary Prompt

The app currently uses Gemini for the audit summary. The audit result itself is deterministic TypeScript; the model only writes a human-readable explanation after the engine has already produced the numbers.

### System Prompt

There is no separate system prompt in the current Gemini request. The instruction is sent as one user prompt through `contents[0].parts[0].text`.

### User Prompt Template

```text
You are an expert AI spend analyst. Please provide a highly detailed and analytical summary of the audit findings below.

Write a comprehensive, professional summary in plain English for a finance leader. Explain exactly where the waste is and the financial impact of the recommended changes. The output MUST be a complete paragraph of at least 100 words. Do not use bullet points.

Use the data below. Mention the most important savings and risk signals. Do not invent facts.

Current monthly spend: ${report.currentMonthlySpend}

Optimized monthly spend: ${report.optimizedMonthlySpend}

Monthly savings: ${report.totalMonthlySavings}

Annual savings: ${report.totalAnnualSavings}

Health grade: ${report.healthScore.letterGrade}

Tokenwise recommended: ${report.credexRecommended}

Tools:
${tool.toolId}: ${tool.currentMonthlySpend}/mo current, ${tool.monthlySavings}/mo savings, flags ${tool.flags.join(', ') || 'none'}

Top opportunities:
${opportunity.category} on ${opportunity.toolId}: save ${opportunity.monthlySavings}/mo by ${opportunity.action}. Reason: ${opportunity.reason}
```

### Why This Prompt

The prompt is direct because the summary lives on a results page where users have already given the app their numbers. It should not open with filler like "Based on your audit results." The important job is to name the waste, give the financial impact, and explain the next move in language a finance leader can understand.

The prompt includes only the fields the model needs: spend totals, savings totals, health grade, recommendation status, tool-level flags, and top opportunities. I avoided sending the full raw input because that encourages the model to summarize everything instead of prioritizing the few items that matter.

The "Do not invent facts" line is important. Pricing and savings are sensitive. If the model is unsure, it should stay inside the report data rather than making up context about the company.

### What Did Not Work

The early direction was too short: "Be direct. No filler." That helped tone, but it did not give enough structure, and short prompts can produce summaries that sound generic. Adding the exact report totals and opportunity strings made the model's answer more grounded.

Strict token caps also caused trouble. Gemini sometimes stopped mid-sentence when the output limit was too tight. The current version relies on prompt constraints and leaves enough room for a complete paragraph.

### Fallback Template

If the API call fails, the backend writes a deterministic fallback summary. For high-savings audits:

```text
Your AI stack is graded ${grade} and shows ${savings} in monthly savings, or ${annualSavings} per year. The biggest opportunities are in the top recommendations above, and the savings level is high enough that Tokenwise should review the stack with you.
```

For smaller savings, the fallback says there is optimization room but frames the recommendations by business impact. If there are no measurable savings, it tells the user to keep the stack under review as seats and usage change.
