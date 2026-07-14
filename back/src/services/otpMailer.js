const nodemailer = require('nodemailer');

const smtpUrl = process.env.SMTP_URL || '';
const smtpHost = process.env.SMTP_HOST || '';
const smtpPort = Number.parseInt(process.env.SMTP_PORT || '', 10) || 587;
const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASS || '';
const smtpSecure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || smtpPort === 465;
const fromAddress = process.env.SMTP_FROM || smtpUser || 'UConfess <no-reply@uconfess.local>';
const isProduction = process.env.NODE_ENV === 'production';
const hasRealSmtp = Boolean(smtpUrl || smtpHost);

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createTransporter() {
  if (smtpUrl) {
    return nodemailer.createTransport(smtpUrl);
  }

  if (smtpHost) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: smtpUser ? { user: smtpUser, pass: smtpPass } : undefined,
    });
  }

  return nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  });
}

const transporter = createTransporter();

function formatMinutes(expiresAt) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(1, Math.ceil(diff / 60000));
}

async function sendOtpEmail({ to, displayName, code, purpose, expiresAt }) {
  if (isProduction && !hasRealSmtp) {
    throw new Error('SMTP no configurado para enviar OTP por correo.');
  }

  const minutes = formatMinutes(expiresAt);
  const subject = purpose === 'register'
    ? 'Verifica tu cuenta en UConfess'
    : 'Tu codigo de acceso a UConfess';
  const textGreeting = displayName ? `Hola ${displayName},` : 'Hola,';
  const htmlGreeting = displayName ? `Hola ${escapeHtml(displayName)},` : 'Hola,';
  const bodyText = [
    textGreeting,
    '',
    `Tu codigo OTP es: ${code}`,
    `Vence en ${minutes} minutos.`,
    '',
    'Si no pediste este codigo, puedes ignorar este correo.',
  ].join('\n');
  const bodyHtml = `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#1a1a1a;padding:40px 10px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:500px;background-color:#111111;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.4);border:2px solid #d22630;">
            <tr>
              <td align="center" style="background-color:#1a1a1a;padding:28px 24px;border-bottom:4px solid #d22630;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="background-color:#d22630;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:24px;font-weight:900;width:44px;height:44px;border-radius:8px;text-align:center;line-height:44px;">
                      U
                    </td>
                    <td style="padding-left:14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:1px;">
                      CONFESS
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                <p style="font-size:14px;line-height:1.6;color:#d1d5db;margin-top:0;margin-bottom:24px;">
                  ${htmlGreeting} Gracias por unirte a nuestra comunidad. Para completar el acceso, ingresa este codigo de seguridad:
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#000000;border:2px solid #d22630;border-radius:8px;margin-bottom:24px;">
                  <tr>
                    <td style="padding:22px;text-align:center;">
                      <span style="display:block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#d22630;margin-bottom:10px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                        CODIGO DE VERIFICACION
                      </span>
                      <span style="display:inline-block;font-family:'Courier New',Courier,monospace;font-size:38px;font-weight:800;letter-spacing:10px;color:#ffffff;padding-left:10px;line-height:1.2;">
                        ${code}
                      </span>
                    </td>
                  </tr>
                </table>
                <p style="font-size:13px;color:#9ca3af;text-align:center;margin:0;">
                  El codigo vencera en <strong style="color:#d22630;">${minutes} minutos</strong>.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color:#000000;padding:24px 32px;border-top:3px solid #d22630;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                <p style="font-size:12px;line-height:1.6;color:#6b7280;margin:0 0 12px 0;">
                  Si no solicitaste este codigo, puedes descartar este mensaje de forma segura. Nadie puede acceder sin el.
                </p>
                <p style="font-size:11px;font-weight:900;color:#d22630;margin:0;text-transform:uppercase;letter-spacing:2px;">
                  UCONFESS &copy; 2026 &bull; CORREO SEGURO
                </p>
                <div style="height:2px;background:#d22630;margin-top:12px;"></div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  const info = await transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    text: bodyText,
    html: bodyHtml,
  });

  if (!hasRealSmtp && !isProduction) {
    console.log(`[OTP ${purpose}] ${to}: ${code}`);
  }

  return info;
}

function isSmtpConfigured() {
  return hasRealSmtp;
}

module.exports = { sendOtpEmail, isSmtpConfigured };
