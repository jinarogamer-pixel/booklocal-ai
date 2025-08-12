// sendEmail.ts - transactional email utility (SendGrid example)
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendTransactionalEmail({
  to,
  subject,
  html
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL!, // Verified sender
    subject,
    html,
  };
  await sgMail.send(msg);
}
