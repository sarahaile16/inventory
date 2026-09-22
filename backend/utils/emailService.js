const nodemailer = require('nodemailer');

const companyName = () => process.env.COMPANY_NAME || 'Our Company';
const companyEmail = () =>
  (process.env.COMPANY_EMAIL || process.env.SMTP_USER || 'orders@company.com').trim();

let cachedTransporter = null;
let usingTestAccount = false;
let transportMode = 'none';

function stripQuotes(value = '') {
  return String(value).trim().replace(/^["']|["']$/g, '');
}

function isPlaceholder(value = '') {
  const v = String(value).trim().toLowerCase();
  if (!v) return true;
  return (
    v.includes('your@gmail') ||
    v.includes('your_app_password') ||
    v.includes('paste_the_brevo') ||
    v.includes('change_me') ||
    v === 'orders@company.com'
  );
}

function fromAddress() {
  if (process.env.SMTP_FROM && !isPlaceholder(process.env.SMTP_FROM)) {
    return stripQuotes(process.env.SMTP_FROM);
  }
  const user = stripQuotes(process.env.SMTP_USER || companyEmail());
  return `"${companyName()}" <${user}>`;
}

function hasRealSmtpConfig() {
  const host = stripQuotes(process.env.SMTP_HOST || '');
  const user = stripQuotes(process.env.SMTP_USER || '');
  const pass = stripQuotes(process.env.SMTP_PASS || '');
  return Boolean(
    host &&
    user &&
    pass &&
    !isPlaceholder(user) &&
    !isPlaceholder(pass) &&
    !isPlaceholder(host)
  );
}

async function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  if (hasRealSmtpConfig()) {
    const port = Number(process.env.SMTP_PORT || 587);
    const rejectUnauthorized =
      String(process.env.SMTP_TLS_REJECT_UNAUTHORIZED || 'true').toLowerCase() !== 'false';
    cachedTransporter = nodemailer.createTransport({
      host: stripQuotes(process.env.SMTP_HOST),
      port,
      secure: port === 465,
      auth: {
        user: stripQuotes(process.env.SMTP_USER),
        // App passwords / Brevo keys sometimes get pasted with spaces
        pass: stripQuotes(process.env.SMTP_PASS).replace(/\s+/g, '')
      },
      tls: { rejectUnauthorized }
    });
    usingTestAccount = false;
    transportMode = 'smtp';
    console.log('📧 Email: using SMTP', stripQuotes(process.env.SMTP_HOST));
    return cachedTransporter;
  }

  // Only use Ethereal when explicitly enabled (preview inbox — not real customers)
  if (String(process.env.EMAIL_TEST_MODE || '').toLowerCase() === 'true') {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
    usingTestAccount = true;
    transportMode = 'ethereal';
    console.log('📧 Email: EMAIL_TEST_MODE=true — Ethereal preview only');
    return cachedTransporter;
  }

  transportMode = 'none';
  const err = new Error(
    'Email is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in backend/.env (Brevo or Gmail), then restart the backend.'
  );
  err.code = 'SMTP_NOT_CONFIGURED';
  throw err;
}

function resetTransporter() {
  cachedTransporter = null;
  usingTestAccount = false;
  transportMode = 'none';
}

function formatMoney(amount) {
  return Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildOrderConfirmationHtml(customer) {
  const name = escapeHtml(customer.fullName || 'Customer');
  const order = escapeHtml(customer.orderDescription || 'Your order');
  const deadline = escapeHtml(customer.orderDeadline || customer.deadline || 'To be confirmed');
  const status = escapeHtml(customer.orderStatus || 'pending');
  const whole = formatMoney(customer.wholePayment);
  const first = formatMoney(customer.firstPayment);
  const rest = formatMoney(customer.restPayment);
  const method = escapeHtml(customer.paymentMethod || '—');
  const phone = escapeHtml(customer.phoneNumber || '—');
  const txn = escapeHtml(customer.purchaseHistory?.[0]?.transactionId || `ORD-${customer._id || ''}`);
  const company = escapeHtml(companyName());
  const support = escapeHtml(companyEmail());

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Order confirmation</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f3;font-family:Segoe UI,Arial,sans-serif;color:#0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(15,23,42,0.12);">
          <tr>
            <td style="background:linear-gradient(135deg,#0f766e,#059669);padding:28px 32px;color:#fff;">
              <p style="margin:0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.85;">Order accepted</p>
              <h1 style="margin:8px 0 0;font-size:24px;">Thank you, ${name}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
                Your order has been <strong>successfully accepted</strong> by <strong>${company}</strong>.
                We will contact you if anything else is needed.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;">
                <tr><td style="padding:12px 16px;font-size:13px;color:#64748b;">Reference</td>
                    <td style="padding:12px 16px;font-size:14px;font-weight:600;text-align:right;">${txn}</td></tr>
                <tr><td style="padding:12px 16px;font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;">Order</td>
                    <td style="padding:12px 16px;font-size:14px;font-weight:600;text-align:right;">${order}</td></tr>
                <tr><td style="padding:12px 16px;font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;">Deadline</td>
                    <td style="padding:12px 16px;font-size:14px;font-weight:600;text-align:right;">${deadline}</td></tr>
                <tr><td style="padding:12px 16px;font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;">Status</td>
                    <td style="padding:12px 16px;font-size:14px;font-weight:600;text-align:right;text-transform:capitalize;">${status}</td></tr>
                <tr><td style="padding:12px 16px;font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;">Whole payment</td>
                    <td style="padding:12px 16px;font-size:14px;font-weight:600;text-align:right;">ETB ${whole}</td></tr>
                <tr><td style="padding:12px 16px;font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;">First payment received</td>
                    <td style="padding:12px 16px;font-size:14px;font-weight:600;text-align:right;">ETB ${first}</td></tr>
                <tr><td style="padding:12px 16px;font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;">Rest due on delivery</td>
                    <td style="padding:12px 16px;font-size:14px;font-weight:600;text-align:right;color:#b45309;">ETB ${rest}</td></tr>
                <tr><td style="padding:12px 16px;font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;">Payment method</td>
                    <td style="padding:12px 16px;font-size:14px;font-weight:600;text-align:right;">${method}</td></tr>
                <tr><td style="padding:12px 16px;font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;">Phone on file</td>
                    <td style="padding:12px 16px;font-size:14px;font-weight:600;text-align:right;">${phone}</td></tr>
              </table>
              <p style="margin:20px 0 0;font-size:13px;color:#64748b;line-height:1.5;">
                If you did not place this order, please contact us at
                <a href="mailto:${support}" style="color:#0f766e;">${support}</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 24px;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;">
              ${company} · Order confirmation
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function getEmailStatus() {
  return {
    configured: hasRealSmtpConfig(),
    mode: hasRealSmtpConfig() ? 'smtp' : (String(process.env.EMAIL_TEST_MODE || '').toLowerCase() === 'true' ? 'ethereal' : 'none'),
    host: hasRealSmtpConfig() ? stripQuotes(process.env.SMTP_HOST) : null,
    from: hasRealSmtpConfig() ? fromAddress() : null,
    company: companyName()
  };
}

function buildOrderConfirmationText(customer) {
  const company = companyName();
  return [
    `Hello ${customer.fullName || 'Customer'},`,
    '',
    `Your order has been successfully accepted by ${company}.`,
    '',
    `Order: ${customer.orderDescription || 'N/A'}`,
    `Deadline: ${customer.orderDeadline || customer.deadline || 'TBD'}`,
    `Status: ${customer.orderStatus || 'pending'}`,
    `Whole: ETB ${formatMoney(customer.wholePayment)}`,
    `First payment: ETB ${formatMoney(customer.firstPayment)}`,
    `Rest due: ETB ${formatMoney(customer.restPayment)}`,
    `Payment method: ${customer.paymentMethod || '—'}`,
    '',
    'Thank you for choosing us.'
  ].join('\n');
}

/**
 * Send order-accepted confirmation to the customer email.
 * Returns { sent, skipped, previewUrl?, error?, receiptText }
 */
async function sendOrderConfirmation(customer) {
  const receiptText = buildOrderConfirmationText(customer);
  const to = (customer.email || '').trim();
  if (!to) {
    return { sent: false, skipped: true, reason: 'No email provided', receiptText };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return { sent: false, skipped: false, to, error: 'Customer email looks invalid', receiptText };
  }

  try {
    const transporter = await getTransporter();

    try {
      await transporter.verify();
    } catch (verifyError) {
      resetTransporter();
      throw new Error(`SMTP login failed: ${verifyError.message}`);
    }

    const info = await transporter.sendMail({
      from: fromAddress(),
      to,
      replyTo: companyEmail(),
      subject: `Order accepted — ${customer.orderDescription || 'Your order'} | ${companyName()}`,
      text: receiptText,
      html: buildOrderConfirmationHtml(customer)
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || null;
    if (previewUrl) {
      console.log('📧 Order confirmation preview:', previewUrl);
    } else {
      console.log('📧 Order confirmation sent to', to, info.messageId);
    }

    return {
      sent: true,
      skipped: false,
      to,
      previewUrl,
      testMode: usingTestAccount,
      mode: transportMode,
      messageId: info.messageId,
      receiptText
    };
  } catch (error) {
    resetTransporter();
    console.error('❌ Failed to send order confirmation:', error.message);
    return {
      sent: false,
      skipped: false,
      to,
      error: error.message,
      configured: hasRealSmtpConfig(),
      receiptText
    };
  }
}

async function sendTestEmail(toAddress) {
  return sendOrderConfirmation({
    fullName: 'Test Customer',
    email: toAddress,
    phoneNumber: '0000000000',
    orderDescription: 'Email setup test',
    orderDeadline: new Date().toISOString().slice(0, 10),
    orderStatus: 'pending',
    wholePayment: 1000,
    firstPayment: 300,
    restPayment: 700,
    paymentMethod: 'Bank Transfer',
    purchaseHistory: [{ transactionId: 'TEST-EMAIL' }]
  });
}

/** Low-level send helper for admin alerts etc. */
async function sendMailSafe({ to, subject, text, html }) {
  const destination = (to || '').trim();
  if (!destination) {
    return { sent: false, error: 'No recipient' };
  }
  try {
    const transporter = await getTransporter();
    try {
      await transporter.verify();
    } catch (verifyError) {
      resetTransporter();
      throw new Error(`SMTP login failed: ${verifyError.message}`);
    }
    const info = await transporter.sendMail({
      from: fromAddress(),
      to: destination,
      replyTo: companyEmail(),
      subject,
      text,
      html
    });
    return {
      sent: true,
      to: destination,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info) || null,
      testMode: usingTestAccount
    };
  } catch (error) {
    resetTransporter();
    console.error('❌ sendMailSafe failed:', error.message);
    return { sent: false, to: destination, error: error.message };
  }
}

async function sendPasswordResetCode({ to, fullName, code, username }) {
  const brand = companyName();
  const subject = `Password reset code — ${brand}`;
  const text = [
    `Hello ${fullName || username || 'there'},`,
    '',
    `Your ${brand} password reset code is: ${code}`,
    '',
    'This code expires in 15 minutes.',
    'If you did not request a reset, you can ignore this email.',
    '',
    `— ${brand}`
  ].join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#0f172a">
      <h2 style="color:#0f766e;margin:0 0 12px">${escapeHtml(brand)}</h2>
      <p>Hello ${escapeHtml(fullName || username || 'there')},</p>
      <p>Use this code to reset your password:</p>
      <p style="font-size:28px;letter-spacing:0.2em;font-weight:700;background:#f0fdfa;border:1px solid #99f6e4;border-radius:12px;padding:16px;text-align:center;color:#115e59">${escapeHtml(String(code))}</p>
      <p style="color:#64748b;font-size:14px">Expires in 15 minutes. If you did not request this, ignore this email.</p>
    </div>
  `;

  return sendMailSafe({ to, subject, text, html });
}

module.exports = {
  sendOrderConfirmation,
  sendTestEmail,
  sendMailSafe,
  sendPasswordResetCode,
  getEmailStatus,
  companyName,
  hasRealSmtpConfig,
  resetTransporter,
  buildOrderConfirmationText
};
