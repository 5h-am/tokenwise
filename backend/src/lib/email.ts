import nodemailer from 'nodemailer';
import type { AuditReport } from '../engine/types.js';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  connectionTimeout: 15_000,
  greetingTimeout: 15_000,
  socketTimeout: 20_000,
  auth: {
    user: process.env['GMAIL_USER'],
    pass: process.env['GMAIL_APP_PASSWORD'],
  },
});

export async function sendAuditEmail(email: string, isHighSavings: boolean, report: AuditReport, screenshot?: string): Promise<void> {
  if (!process.env['GMAIL_USER'] || !process.env['GMAIL_APP_PASSWORD']) {
    console.error('GMAIL_USER or GMAIL_APP_PASSWORD is not configured');
    return;
  }

  const subject = 'Your Credex AI Spend Audit Results';
  let html = `
    <h2>Your AI Spend Audit Results</h2>
    <p>Thank you for using Credex. Here is a summary of your AI infrastructure analysis:</p>
    <ul>
      <li><strong>Health Grade:</strong> ${report.healthScore.letterGrade}</li>
      <li><strong>Current Monthly Spend:</strong> $${report.currentMonthlySpend}</li>
      <li><strong>Identified Monthly Savings:</strong> $${report.totalMonthlySavings}</li>
      <li><strong>Projected Annual Savings:</strong> $${report.totalAnnualSavings}</li>
    </ul>
    <h3>Top Recommendations</h3>
    <ul>
      ${report.topOpportunities.length > 0 
        ? report.topOpportunities.map(opp => `<li><strong>${opp.toolId}:</strong> Save $${opp.monthlySavings}/mo. ${opp.reason}</li>`).join('')
        : '<li>No major savings opportunities identified at this time.</li>'}
    </ul>
    <h3>Summary</h3>
    <p>${report.summary || 'Your AI stack has been analyzed. Please log in to see full optimization details.'}</p>
  `;

  if (isHighSavings) {
    html += '<p><strong>Note:</strong> Your savings potential is high, so your report has been flagged for a specialist follow-up.</p>';
  }

  try {
    const mailOptions: any = {
      from: `"Credex AI" <${process.env['GMAIL_USER']}>`,
      to: email,
      subject,
      html,
    };

    if (screenshot && screenshot.includes('base64,')) {
      mailOptions.attachments = [
        {
          filename: 'Audit_Report.png',
          content: screenshot.split('base64,')[1],
          encoding: 'base64',
        },
      ];
    }

    await transporter.sendMail(mailOptions);
    console.log(`[email] Sent audit result to ${email}`);
  } catch (error) {
    console.error(`[email] Failed to send email to ${email}:`, error);
  }
}
