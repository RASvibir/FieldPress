import { logger } from "./logger";

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || "FieldPress <noreply@fieldpress.studio>";
  if (!key) {
    logger.warn({ to }, "RESEND_API_KEY missing; password reset email not sent");
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Reset your FieldPress password",
      text: `Reset your FieldPress password:\n\n${resetUrl}\n\nThis link expires in 1 hour. If you did not request it, ignore this email.`,
    }),
  });
  if (!res.ok) {
    logger.error({ status: res.status }, "Resend password reset failed");
    return false;
  }
  return true;
}
