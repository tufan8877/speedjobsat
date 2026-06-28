import nodemailer from "nodemailer";

function getAppUrl() {
  return (process.env.APP_URL || process.env.PUBLIC_APP_URL || "https://speedjobs.at").replace(/\/$/, "");
}

function getMailerConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || "SpeedJobs.at <no-reply@speedjobs.at>";

  if (!host || !user || !pass) {
    return null;
  }

  return { host, port, user, pass, from };
}

export function buildVerificationUrl(token: string) {
  return `${getAppUrl()}/api/verify-email?token=${encodeURIComponent(token)}`;
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = buildVerificationUrl(token);
  const config = getMailerConfig();

  if (!config) {
    console.warn("SMTP ist nicht konfiguriert. Verifizierungslink:", verificationUrl);
    return { sent: false, verificationUrl };
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transporter.sendMail({
    from: config.from,
    to: email,
    subject: "E-Mail-Adresse bei SpeedJobs.at bestätigen",
    text: `Willkommen bei SpeedJobs.at!\n\nBitte bestätigen Sie Ihre E-Mail-Adresse über diesen Link:\n${verificationUrl}\n\nWenn Sie sich nicht bei SpeedJobs.at registriert haben, können Sie diese E-Mail ignorieren.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:560px;margin:0 auto;padding:24px;">
        <h2 style="color:#1f4fa3;margin-bottom:12px;">E-Mail-Adresse bestätigen</h2>
        <p>Willkommen bei <strong>SpeedJobs.at</strong>.</p>
        <p>Bitte bestätigen Sie Ihre E-Mail-Adresse, damit Sie Profile, Aufträge und Bewertungen nutzen können.</p>
        <p style="margin:24px 0;">
          <a href="${verificationUrl}" style="background:#1f4fa3;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;display:inline-block;font-weight:bold;">
            E-Mail bestätigen
          </a>
        </p>
        <p style="font-size:13px;color:#6b7280;">Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:</p>
        <p style="font-size:13px;word-break:break-all;color:#374151;">${verificationUrl}</p>
        <p style="font-size:13px;color:#6b7280;">Wenn Sie sich nicht bei SpeedJobs.at registriert haben, können Sie diese E-Mail ignorieren.</p>
      </div>
    `,
  });

  return { sent: true, verificationUrl };
}
