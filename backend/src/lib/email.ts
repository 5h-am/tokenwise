import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import type { AuditReport } from '../engine/types.js';

const resend = process.env['RESEND_API_KEY'] ? new Resend(process.env['RESEND_API_KEY']) : null;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  connectionTimeout: 15_000,
  greetingTimeout: 15_000,
  socketTimeout: 20_000,
  auth: {
    user: process.env['GMAIL_USER'],
    pass: process.env['GMAIL_APP_PASSWORD'],
  },
});

export async function sendAuditEmail(email: string, isHighSavings: boolean, report: AuditReport, screenshot?: string): Promise<void> {
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
    if (resend) {
      const attachments = [];
      if (screenshot && screenshot.includes('base64,')) {
        attachments.push({
          filename: 'Audit_Report.png',
          content: screenshot.split('base64,')[1],
        });
      }
      
      // Use Resend when RESEND_API_KEY is available (solves Render SMTP blocking)
      await resend.emails.send({
        from: 'Credex AI <onboarding@resend.dev>', // Update with your verified domain in production
        to: email,
        subject,
        html,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      console.log(`[email] Sent audit result to ${email} via Resend`);
    } else {
      if (!process.env['GMAIL_USER'] || !process.env['GMAIL_APP_PASSWORD']) {
        console.error('Neither RESEND_API_KEY nor GMAIL credentials are fully configured');
        return;
      }
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
      console.log(`[email] Sent audit result to ${email} via Nodemailer`);
    }
  } catch (error) {
    console.error(`[email] Failed to send email to ${email}:`, error);
  }
}
