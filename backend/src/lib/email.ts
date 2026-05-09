import { Resend } from 'resend';

const resendApiKey = process.env['RESEND_API_KEY'];
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendAuditEmail(email: string, isHighSavings: boolean): Promise<void> {
  if (!resend) {
    return;
  }

  const subject = 'Your Credex AI Spend Audit Results';
  let html = '<p>Thank you for using the Credex AI Spend Audit.</p><p>Your results are ready.</p>';

  if (isHighSavings) {
    html += '<p>Since your savings potential is high, our team will reach out shortly to help you optimize.</p>';
  }

  try {
    await resend.emails.send({
      from: 'Credex <audit@credex.co>',
      to: email,
      subject,
      html,
    });
  } catch {
    return;
  }
}
