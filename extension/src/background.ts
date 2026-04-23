/**
 * Background service worker.
 * - Registers context menu items ("Check with meetingcheck", "Report this link").
 * - Opens the popup with the selected link pre-filled.
 * - Handles messages from the popup: runs checks via the API with a local
 *   detector fallback, handles scam reports.
 */
import { checkUrl, reportScam, type CheckOutcome } from './api.js';

const MENU_CHECK = 'itls-check';
const MENU_REPORT = 'itls-report';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_CHECK,
    title: chrome.i18n.getMessage('menuCheck'),
    contexts: ['link'],
  });
  chrome.contextMenus.create({
    id: MENU_REPORT,
    title: chrome.i18n.getMessage('menuReport'),
    contexts: ['link'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (!info.linkUrl) return;
  if (info.menuItemId === MENU_CHECK) {
    await chrome.storage.session.set({ pending: { action: 'check', url: info.linkUrl } });
    chrome.action.openPopup?.().catch(() => { /* Firefox may not support openPopup; user clicks the icon */ });
  } else if (info.menuItemId === MENU_REPORT) {
    await chrome.storage.session.set({ pending: { action: 'report', url: info.linkUrl } });
    chrome.action.openPopup?.().catch(() => {});
  }
});

interface CheckMessage { type: 'check'; url: string }
interface ReportMessage { type: 'report'; url: string; context?: string }
type Message = CheckMessage | ReportMessage;

chrome.runtime.onMessage.addListener((msg: Message, _sender, sendResponse) => {
  (async () => {
    try {
      if (msg.type === 'check') {
        const outcome: CheckOutcome = await checkUrl(msg.url);
        updateBadge(outcome.result.verdict);
        sendResponse({ ok: true, outcome });
      } else if (msg.type === 'report') {
        const r = await reportScam(msg.url, msg.context);
        sendResponse({ ok: true, result: r });
      }
    } catch (err) {
      sendResponse({ ok: false, error: err instanceof Error ? err.message : 'failed' });
    }
  })();
  return true; // async response
});

function updateBadge(verdict: CheckOutcome['result']['verdict']) {
  const style: Record<CheckOutcome['result']['verdict'], { text: string; color: string }> = {
    SAFE:         { text: '✓',   color: '#4fa66a' },
    DANGEROUS:    { text: '!',   color: '#ef4a34' },
    UNRECOGNIZED: { text: '?',   color: '#d6a130' },
    INVALID:      { text: '',    color: '#525252' },
  };
  const s = style[verdict];
  chrome.action.setBadgeText({ text: s.text });
  chrome.action.setBadgeBackgroundColor({ color: s.color });
  // Clear after 30s so the badge doesn't follow the user around forever.
  setTimeout(() => chrome.action.setBadgeText({ text: '' }), 30_000);
}
