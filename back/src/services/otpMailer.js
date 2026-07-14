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
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
      <p>${htmlGreeting}</p>
      <p>Tu codigo OTP es:</p>
      <p style="font-size:24px;font-weight:700;letter-spacing:4px">${code}</p>
      <p>Vence en ${minutes} minutos.</p>
      <p style="color:#6b7280">Si no pediste este codigo, ignora este mensaje.</p>
    </div>
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
