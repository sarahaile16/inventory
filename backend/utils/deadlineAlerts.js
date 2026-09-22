const { sales } = require('../data/store');

const daysUntil = (deadline) => {
  if (!deadline) return null;
  const due = new Date(deadline);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.round((due - today) / 86400000);
};

const formatMoney = (value) =>
  Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

/** Track which deadline alerts were already emailed (in-memory) */
const emailedKeys = new Set();

function adminInbox() {
  return (
    process.env.ADMIN_EMAIL ||
    process.env.COMPANY_EMAIL ||
    process.env.SMTP_USER ||
    ''
  ).trim();
}

/**
 * Find unpaid orders with deadline within `withinDays` (default 3),
 * including overdue, and email the admin once per order.
 */
async function checkAndNotifyDeadlineAlerts(withinDays = 3) {
  const { sendMailSafe, hasRealSmtpConfig } = require('./emailService');
  if (!hasRealSmtpConfig() && String(process.env.EMAIL_TEST_MODE || '').toLowerCase() !== 'true') {
    return { checked: sales.length, emailed: 0, skipped: 'smtp_not_configured' };
  }

  const to = adminInbox();
  if (!to) {
    return { checked: sales.length, emailed: 0, skipped: 'no_admin_email' };
  }

  let emailed = 0;
  const alerts = [];

  for (const sale of sales) {
    const rest = Number(sale.restPaid ? 0 : sale.restPayment || 0);
    const days = daysUntil(sale.deadline);
    if (rest <= 0 || days === null || days > withinDays) continue;

    const key = `deadline-${sale._id}-${String(sale.deadline).slice(0, 10)}`;
    if (emailedKeys.has(key)) continue;

    const when = days < 0
      ? `OVERDUE by ${Math.abs(days)} day(s)`
      : days === 0
        ? 'DUE TODAY'
        : `due in ${days} day(s)`;

    const subject = `Deadline alert: ${sale.customerName || 'Customer'} · ${when}`;
    const text = [
      'Admin deadline notification',
      '',
      `Customer: ${sale.customerName || 'N/A'}`,
      `Order / txn: ${sale.transactionId || sale._id}`,
      `Deadline: ${sale.deadline}`,
      `Status: ${when}`,
      `Whole payment: ETB ${formatMoney(sale.totalAmount)}`,
      `First payment: ETB ${formatMoney(sale.firstPayment)}`,
      `Rest still due: ETB ${formatMoney(rest)}`,
      '',
      'Open Orders in the inventory app to follow up.'
    ].join('\n');

    const html = `
      <div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;">
        <h2 style="color:#b45309;">Work deadline ${when}</h2>
        <p>An unpaid rest balance has a deadline that is close or overdue.</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px;border-top:1px solid #e2e8f0;">Customer</td><td style="padding:8px;border-top:1px solid #e2e8f0;font-weight:600;">${sale.customerName || 'N/A'}</td></tr>
          <tr><td style="padding:8px;border-top:1px solid #e2e8f0;">Reference</td><td style="padding:8px;border-top:1px solid #e2e8f0;font-weight:600;">${sale.transactionId || sale._id}</td></tr>
          <tr><td style="padding:8px;border-top:1px solid #e2e8f0;">Deadline</td><td style="padding:8px;border-top:1px solid #e2e8f0;font-weight:600;">${sale.deadline}</td></tr>
          <tr><td style="padding:8px;border-top:1px solid #e2e8f0;">Rest due</td><td style="padding:8px;border-top:1px solid #e2e8f0;font-weight:600;color:#b45309;">ETB ${formatMoney(rest)}</td></tr>
        </table>
      </div>`;

    const result = await sendMailSafe({ to, subject, text, html });
    if (result.sent) {
      emailedKeys.add(key);
      emailed += 1;
      alerts.push({ key, to, when });
    }
  }

  if (emailed > 0) {
    console.log(`📧 Deadline alerts emailed to admin: ${emailed}`);
  }

  return { checked: sales.length, emailed, alerts };
}

module.exports = {
  checkAndNotifyDeadlineAlerts,
  daysUntil,
  emailedKeys
};
