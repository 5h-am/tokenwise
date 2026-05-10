import 'dotenv/config';
import nodemailer from 'nodemailer';

async function testEmail() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.error('Missing GMAIL_USER or GMAIL_APP_PASSWORD');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Credex Test" <${user}>`,
      to: user, // Send to self
      subject: 'Test Email',
      text: 'This is a test email to verify credentials.',
    });
    console.log('Success! Email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

testEmail();
