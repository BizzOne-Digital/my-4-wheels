
import nodemailer from "nodemailer";

export type EmailResult = "sent" | "failed" | "not_configured";

export const emailConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);

export async function sendEmail(to: string, subject: string, text: string): Promise<EmailResult> {
  if (!emailConfigured() || !to) return "not_configured";
  try {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
    await transport.sendMail({ from: process.env.SMTP_FROM, to, subject, text });
    return "sent";
  } catch (e) {
    console.error("[email]", e);
    return "failed";
  }
}

export function staffAddress(settingsEmail?: string) {
  return process.env.NOTIFY_EMAIL || settingsEmail || "";
}
