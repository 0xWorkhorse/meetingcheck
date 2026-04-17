import type { CheckResponse } from './api.js';

const form = document.getElementById('check-form') as HTMLFormElement;
const input = document.getElementById('url-input') as HTMLInputElement;
const btn = document.getElementById('check-btn') as HTMLButtonElement;
const result = document.getElementById('result') as HTMLDivElement;
const actions = document.getElementById('actions') as HTMLDivElement;
const reportBtn = document.getElementById('report-btn') as HTMLButtonElement;

let currentUrl: string | null = null;

init();

async function init() {
  // Pre-fill from context-menu click if pending.
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

// Paste-trap: auto-check on paste.
input.addEventListener('paste', (e) => {
  const text = e.clipboardData?.getData('text');
  if (text) {
    setTimeout(() => runCheck(text.trim()), 0);
  }
});

reportBtn.addEventListener('click', async () => {
  if (!currentUrl) return;
  reportBtn.disabled = true;
  reportBtn.textContent = 'Reporting…';
  const res = await chrome.runtime.sendMessage({ type: 'report', url: currentUrl });
  if (res?.ok) {
    reportBtn.textContent = 'Reported. Thank you.';
  } else {
    reportBtn.textContent = 'Failed — try again';
    reportBtn.disabled = false;
  }
});

async function runCheck(url: string) {
  if (!url) return;
  currentUrl = url;
  btn.disabled = true;
  btn.textContent = 'Checking…';
  result.className = '';
  result.classList.add('hidden');
  actions.classList.add('hidden');

  const res = await chrome.runtime.sendMessage({ type: 'check', url });

  btn.disabled = false;
  btn.textContent = 'Check';

  if (!res?.ok) {
    result.className = 'invalid';
    result.classList.remove('hidden');
    result.innerHTML = `<div class="verdict-title invalid">Couldn't check that link</div><div class="verdict-reason">${escape(res?.error ?? 'unknown error')}</div>`;
    return;
  }

  render(res.result as CheckResponse);
}

function render(r: CheckResponse) {
  const cls = r.verdict === 'SAFE' ? 'safe' : r.verdict === 'DANGEROUS' ? 'danger' : r.verdict === 'UNRECOGNIZED' ? 'unknown' : 'invalid';
  result.className = cls;
  result.classList.remove('hidden');
  result.innerHTML = `
    <div class="verdict-title ${cls}">${escape(r.title)}</div>
    <div class="verdict-reason">${escape(r.reason)}</div>
    ${r.hostname ? `<div class="verdict-host">${escape(r.hostname)}</div>` : ''}
    <ul class="signals">
      ${r.signals.map(s => `
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
    reportBtn.textContent = r.verdict === 'DANGEROUS' ? 'Confirm and report' : 'Report as scam';
  }
}

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
