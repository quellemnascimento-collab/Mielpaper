const nodemailer = require('nodemailer');

function isConfigured() {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
}

let transporter;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 465,
      secure: process.env.EMAIL_SECURE ? process.env.EMAIL_SECURE === 'true' : true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
}

// Sends the current text of a diary day to the configured backup inbox.
// Best-effort: failures never block saving the entry itself.
async function backupEntryByEmail(date, content) {
  if (!isConfigured()) {
    return { ok: false, skipped: true, error: 'Backup por e-mail não configurado (variáveis de ambiente ausentes).' };
  }

  const to = process.env.EMAIL_TO || process.env.EMAIL_USER;

  try {
    await getTransporter().sendMail({
      from: `"Meu Diário" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Diário — backup de ${date}`,
      text: content && content.trim() ? content : '(entrada vazia)',
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = { backupEntryByEmail, isConfigured };
