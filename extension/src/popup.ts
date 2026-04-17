import type { FormattedCheckResult } from '@meetingcheck/detector';

type CheckResponse = FormattedCheckResult & {
  resolved_hostname: string;
  redirect_chain: string[];
  expansion_timed_out: boolean;
  scanned_at: string;
};

const form = document.getElementById('check-form') as HTMLFormElement;
const input = document.getElementById('url-input') as HTMLInputElement;
const btn = document.getElementById('check-btn') as HTMLButtonElement;
const result = document.getElementById('result') as HTMLDivElement;
const actions = document.getElementById('actions') as HTMLDivElement;
const reportBtn = document.getElementById('report-btn') as HTMLButtonElement;

let currentUrl: string | null = null;

applyI18n();
init();

/**
 * Replace data-i18n / data-i18n-attr markers with localized messages.
 * Keeps all static strings out of the built JS.
 */
function applyI18n() {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n!;
    const msg = chrome.i18n.getMessage(key);
    if (msg) el.textContent = msg;
  });
  document.querySelectorAll<HTMLElement>('[data-i18n-attr]').forEach((el) => {
    for (const pair of el.dataset.i18nAttr!.split(',')) {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      const msg = chrome.i18n.getMessage(key);
      if (msg) el.setAttribute(attr, msg);
    }
  });
  document.documentElement.lang = chrome.i18n.getUILanguage();
}

async function init() {
  const stored = await chrome.storage.session.get('pending');
  const pending = stored.pending as { action: 'check' | 'report'; url: string } | undefined;
  if (pending) {
    await chrome.storage.session.remove('pending');
    input.value = pending.url;
    if (pending.action === 'check') await runCheck(pending.url);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  await runCheck(input.value.trim());
});

input.addEventListener('paste', (e) => {
  const text = e.clipboardData?.getData('text');
  if (text) setTimeout(() => runCheck(text.trim()), 0);
});

reportBtn.addEventListener('click', async () => {
  if (!currentUrl) return;
  reportBtn.disabled = true;
  reportBtn.textContent = chrome.i18n.getMessage('popupReporting');
  const res = await chrome.runtime.sendMessage({ type: 'report', url: currentUrl });
  if (res?.ok) {
    reportBtn.textContent = chrome.i18n.getMessage('popupReported');
  } else {
    reportBtn.textContent = chrome.i18n.getMessage('popupReportFailed');
    reportBtn.disabled = false;
  }
});

async function runCheck(url: string) {
  if (!url) return;
  currentUrl = url;
  btn.disabled = true;
  btn.textContent = chrome.i18n.getMessage('popupChecking');
  result.className = '';
  result.classList.add('hidden');
  actions.classList.add('hidden');

  const res = await chrome.runtime.sendMessage({ type: 'check', url });

  btn.disabled = false;
  btn.textContent = chrome.i18n.getMessage('popupCheck');

  if (!res?.ok) {
    result.className = 'invalid';
    result.classList.remove('hidden');
    result.innerHTML = `<div class="verdict-title invalid">${escape(chrome.i18n.getMessage('popupCouldntCheck'))}</div><div class="verdict-reason">${escape(res?.error ?? 'unknown error')}</div>`;
    return;
  }

  render(res.result as CheckResponse);
}

function render(r: CheckResponse) {
  const cls = r.verdict === 'SAFE' ? 'safe'
    : r.verdict === 'DANGEROUS' ? 'danger'
    : r.verdict === 'UNRECOGNIZED' ? 'unknown'
    : 'invalid';
  result.className = cls;
  result.classList.remove('hidden');
  // Verdict strings come pre-localized from the API (which reads Accept-Language /
  // or we can send x-locale from chrome.i18n.getUILanguage()).
  result.innerHTML = `
    <div class="verdict-title ${cls}">${escape(r.title)}</div>
    <div class="verdict-reason">${escape(r.reason)}</div>
    ${r.hostname ? `<div class="verdict-host">${escape(r.hostname)}</div>` : ''}
    <ul class="signals">
      ${r.signals.map((s) => `
        <li>
          <span class="level ${s.level}">${s.level}</span>
          <span><span class="label">${escape(s.label)}</span> <span class="detail">— ${escape(s.detail)}</span></span>
        </li>
      `).join('')}
    </ul>
  `;

  if (r.verdict === 'DANGEROUS' || r.verdict === 'UNRECOGNIZED') {
    actions.classList.remove('hidden');
    reportBtn.disabled = false;
    reportBtn.textContent = chrome.i18n.getMessage(
      r.verdict === 'DANGEROUS' ? 'popupConfirmReport' : 'popupReportScam'
    );
  }
}

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
