/** Build WhatsApp / Telegram share links that prefer installed mobile apps. */

export function normalizePhoneForWhatsApp(phone) {
  if (!phone) return '';
  let digits = String(phone).replace(/\D/g, '');
  if (!digits) return '';
  // Ethiopia local 09xxxxxxxx → 2519xxxxxxxx
  if (digits.length === 10 && digits.startsWith('0')) {
    digits = `251${digits.slice(1)}`;
  }
  return digits;
}

/** HTTPS links — on phones these open the WhatsApp / Telegram apps if installed. */
export function whatsappShareUrl(phone, text) {
  const digits = normalizePhoneForWhatsApp(phone);
  const encoded = encodeURIComponent(text || '');
  if (digits) {
    return `https://wa.me/${digits}?text=${encoded}`;
  }
  return `https://wa.me/?text=${encoded}`;
}

/**
 * Telegram share links REQUIRE a non-empty `url` param.
 * Desktop rejects empty url (share simply does nothing / “not available”).
 * Receipt body goes in `text`; url is a harmless placeholder Telegram needs.
 */
export function telegramShareUrl(text) {
  const encodedUrl = encodeURIComponent('https://t.me');
  const encodedText = encodeURIComponent(text || '');
  return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
}

/**
 * Native app schemes (stronger “open app” on mobile / Desktop).
 * Fall back to https if the app is not installed.
 */
export function whatsappAppUrl(phone, text) {
  const digits = normalizePhoneForWhatsApp(phone);
  const encoded = encodeURIComponent(text || '');
  if (digits) {
    return `whatsapp://send?phone=${digits}&text=${encoded}`;
  }
  return `whatsapp://send?text=${encoded}`;
}

export function telegramAppUrl(text) {
  const encodedUrl = encodeURIComponent('https://t.me');
  const encodedText = encodeURIComponent(text || '');
  return `tg://msg_url?url=${encodedUrl}&text=${encodedText}`;
}

function isMobileDevice() {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
}

/**
 * Open chat / share in the installed app.
 * Does NOT auto-send — user must tap Send in WhatsApp / Telegram.
 * Prefer https (wa.me / t.me) so phones hand off to the app reliably.
 */
export function openInAppOrWeb(appUrl, webUrl) {
  const target = webUrl || appUrl;
  if (!target) return;

  if (isMobileDevice()) {
    // Same-tab handoff avoids popup blockers and opens the app
    try {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = appUrl;
      document.body.appendChild(iframe);
      window.setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch {
          /* ignore */
        }
        window.location.href = target;
      }, 400);
    } catch {
      window.location.href = target;
    }
    return;
  }

  // Desktop: try native protocol first (Telegram Desktop / WhatsApp Desktop),
  // then open https so the OS can hand off if the protocol click was blocked.
  try {
    const anchor = document.createElement('a');
    anchor.href = appUrl;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } catch {
    /* ignore */
  }

  window.setTimeout(() => {
    const win = window.open(target, '_blank', 'noopener,noreferrer');
    if (!win) {
      window.location.href = target;
    }
  }, 500);
}

/** Phone share sheet — lists WhatsApp, Telegram, SMS, etc. from installed apps. */
export async function shareViaDeviceApps({ title, text }) {
  if (!navigator.share) {
    return { ok: false, reason: 'unsupported' };
  }
  try {
    await navigator.share({
      title: title || 'Order receipt',
      text: text || ''
    });
    return { ok: true };
  } catch (error) {
    // User cancelled share sheet
    if (error?.name === 'AbortError') {
      return { ok: false, reason: 'cancelled' };
    }
    return { ok: false, reason: error?.message || 'failed' };
  }
}

export function canUseDeviceShare() {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

export function buildReceiptFromOrder(data = {}) {
  const company = data.companyName || 'Our Company';
  const money = (n) =>
    Number(n || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  return [
    `Hello ${data.fullName || 'Customer'},`,
    '',
    `Your order has been successfully accepted by ${company}.`,
    '',
    `Order: ${data.orderDescription || 'N/A'}`,
    `Deadline: ${data.orderDeadline || data.deadline || 'TBD'}`,
    `Status: ${data.orderStatus || 'pending'}`,
    `Whole: ETB ${money(data.wholePayment)}`,
    `First payment: ETB ${money(data.firstPayment)}`,
    `Rest due: ETB ${money(data.restPayment)}`,
    `Payment method: ${data.paymentMethod || '—'}`,
    '',
    'Thank you for choosing us.'
  ].join('\n');
}
