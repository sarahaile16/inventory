const nodemailer = require('nodemailer');

const companyName = () => process.env.COMPANY_NAME || 'Our Company';
const companyEmail = () => process.env.COMPANY_EMAIL || process.env.SMTP_USER || 'orders@company.com';

let cachedTransporter = null;
let usingTestAccount = false;

async function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    cachedTransporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: String(SMTP_PORT) === '465',
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
    usingTestAccount = false;
    console.log('📧 Email: using configured SMTP');
    return cachedTransporter;
  }

  // Dev fallback: Ethereal captures mail so you can preview without real SMTP
  const testAccount = await nodemailer.createTestAccount();
  cachedTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass }
  });
  usingTestAccount = true;
  console.log('📧 Email: SMTP not set — using Ethereal test inbox (preview only)');
  return cachedTransporter;
}

function formatMoney(amount) {
  return Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function buildOrderConfirmationHtml(customer) {
  const name = customer.fullName || 'Customer';
  const order = customer.orderDescription || 'Your order';
  const deadline = customer.orderDeadline || customer.deadline || 'To be confirmed';
  const status = customer.orderStatus || 'pending';
  const whole = formatMoney(customer.wholePayment);
  const first = formatMoney(customer.firstPayment);
  const rest = formatMoney(customer.restPayment);
  const method = customer.paymentMethod || '—';
  const phone = customer.phoneNumber || '—';
  const txn = customer.purchaseHistory?.[0]?.transactionId || `ORD-${customer._id || ''}`;

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
                Your order has been <strong>successfully accepted</strong> by <strong>${companyName()}</strong>.
                We will contact you if anything else is needed.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;padding:4px;">
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
                <a href="mailto:${companyEmail()}" style="color:#0f766e;">${companyEmail()}</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 24px;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;">
              ${companyName()} · Order confirmation
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Send order-accepted confirmation to the customer email.
 * Returns { sent, skipped, previewUrl?, error? }
 */
async function sendOrderConfirmation(customer) {
  const to = (customer.email || '').trim();
  if (!to) {
    return { sent: false, skipped: true, reason: 'No email provided' };
  }

  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: `"${companyName()}" <${process.env.SMTP_FROM || companyEmail()}>`,
      to,
      subject: `Order accepted — ${customer.orderDescription || 'Your order'} | ${companyName()}`,
      text: [
        `Hello ${customer.fullName || 'Customer'},`,
        '',
        `Your order has been successfully accepted by ${companyName()}.`,
        `Order: ${customer.orderDescription || 'N/A'}`,
        `Deadline: ${customer.orderDeadline || customer.deadline || 'TBD'}`,
        `Whole: ETB ${formatMoney(customer.wholePayment)}`,
        `First payment: ETB ${formatMoney(customer.firstPayment)}`,
        `Rest due: ETB ${formatMoney(customer.restPayment)}`,
        '',
        'Thank you for choosing us.'
      ].join('\n'),
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
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Failed to send order confirmation:', error.message);
    return {
      sent: false,
      skipped: false,
      to,
      error: error.message
    };
  }
}

module.exports = {
  sendOrderConfirmation,
  companyName
};
