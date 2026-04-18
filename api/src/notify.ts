import { env } from './env.js';

/**
 * Send a Telegram notification for a new report. No-op when
 * TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is unset. Swallows errors —
 * a failing notifier must never break the report flow.
 */
export async function notifyNewReport(payload: {
  reportId: string;
  url: string;
  hostname: string;
  registrableDomain: string;
  brand: string | null;
  receivedFrom: string | null;
  context: string | null;
}): Promise<void> {
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const lines = [
    '🚩 <b>New report</b>',
    `<b>Domain:</b> ${escapeHtml(payload.registrableDomain)}`,
    `<b>Hostname:</b> ${escapeHtml(payload.hostname)}`,
    `<b>URL:</b> <code>${escapeHtml(payload.url)}</code>`,
  ];
  if (payload.brand) lines.push(`<b>Brand:</b> ${escapeHtml(payload.brand)}`);
  if (payload.receivedFrom) lines.push(`<b>Source:</b> ${escapeHtml(payload.receivedFrom)}`);
  if (payload.context) {
    const trimmed = payload.context.length > 500 ? payload.context.slice(0, 500) + '…' : payload.context;
    lines.push(`<b>Context:</b> ${escapeHtml(trimmed)}`);
  }
  lines.push(`<b>ID:</b> <code>${escapeHtml(payload.reportId)}</code>`);

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join('\n'),
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
  } catch (err) {
    console.error('[notify] telegram send failed', err);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
