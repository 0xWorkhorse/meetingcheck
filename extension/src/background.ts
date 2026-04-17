/**
 * Background service worker.
 * - Registers context menu items ("Check with isthislinksafe", "Report this link").
 * - Opens the popup with the selected link pre-filled.
 * - Handles messages from the popup to run checks via the API with a local fallback.
 */
import { checkUrlRemote, checkUrlLocal, reportScam, type CheckResponse } from './api.js';

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
        let res: CheckResponse;
        try {
          res = await checkUrlRemote(msg.url);
        } catch {
          res = checkUrlLocal(msg.url);
        }
        updateBadge(res.verdict);
        sendResponse({ ok: true, result: res });
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

function updateBadge(verdict: CheckResponse['verdict']) {
  const style: Record<CheckResponse['verdict'], { text: string; color: string }> = {
    SAFE:         { text: '✓',   color: '#10b981' },
    DANGEROUS:    { text: '!',   color: '#ef4444' },
    UNRECOGNIZED: { text: '?',   color: '#f59e0b' },
    INVALID:      { text: '',    color: '#525252' },
  };
  const s = style[verdict];
  chrome.action.setBadgeText({ text: s.text });
  chrome.action.setBadgeBackgroundColor({ color: s.color });
  // Clear after 30s so the badge doesn't follow the user around forever.
  setTimeout(() => chrome.action.setBadgeText({ text: '' }), 30_000);
}
