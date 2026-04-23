/**
 * Meetingcheck popup — compressed vertical verifier shell.
 *
 * State machine (single source of truth, re-render on transition):
 *   idle              — empty input, all signals '—', verdict AWAITING
 *   checking          — VERIFY disabled, all signals CHECKING, verdict CHECKING
 *   verdict           — API responded; render 8 signal rows + verdict block
 *   offline-partial   — API unreachable; local detector ran URL-only checks,
 *                       network-only rows show OFFLINE, verdict is conservative
 *                       (SAFE → UNRECOGNIZED; DANGEROUS from URL patterns stays;
 *                       otherwise UNRECOGNIZED).
 *   error             — API reachable but returned a non-200 we can't fall
 *                       back from cleanly (e.g. rate limited); shown as
 *                       INVALID with the error message.
 *
 * Entry points handled:
 *   1. Toolbar click with empty pending → idle.
 *   2. Context-menu click ('Check with meetingcheck') → pending stored in
 *      chrome.storage.session; we pull it and auto-run.
 *   3. In-popup paste / submit.
 */
import type { CheckOutcome, CheckResponse } from './api.js';

// ---------- State ----------

type VerdictState = 'idle' | 'checking' | 'safe' | 'danger' | 'unrecog' | 'invalid';
type SignalState  = 'pending' | 'ok' | 'warn' | 'bad' | 'offline' | 'idle';

const SIGNAL_IDS = [
  'urlFormat',
  'redirects',
  'character',
  'official',
  'hosting',
  'domainAge',
  'cert',
  'community',
] as const;
type SignalId = typeof SIGNAL_IDS[number];

interface SignalRow {
  label: string;
  state: SignalState;
  value: string;
}

// ---------- Element refs ----------

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

const els = {
  session:       $('session'),
  offlineBanner: $('offline-banner'),
  form:          $<HTMLFormElement>('check-form'),
  input:         $<HTMLInputElement>('url-input'),
  checkBtn:      $<HTMLButtonElement>('check-btn'),
  signals:       $<HTMLUListElement>('signals'),
  verdict:       $('verdict'),
  verdictIcon:   $('verdict-icon'),
  verdictWord:   $('verdict-word'),
  verdictReason: $('verdict-reason'),
  verdictAdvice: $('verdict-advice'),
  checkedAs:     $('checked-as'),
  reconnectHint: $('reconnect-hint'),
  reportBtn:     $<HTMLButtonElement>('report-btn'),
};

let currentUrl: string | null = null;
let busy = false;

// ---------- i18n helpers ----------

function msg(key: string, subs?: string[]): string {
  return chrome.i18n.getMessage(key, subs) || key;
}

function applyI18n() {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const m = msg(el.dataset.i18n!);
    if (m) el.textContent = m;
  });
  document.querySelectorAll<HTMLElement>('[data-i18n-attr]').forEach((el) => {
    for (const pair of el.dataset.i18nAttr!.split(',')) {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      const m = msg(key);
      if (m) el.setAttribute(attr, m);
    }
  });
  document.documentElement.lang = chrome.i18n.getUILanguage();
}

// ---------- Session id (decorative) ----------

function makeSession(): string {
  const hex = '0123456789ABCDEF';
  let s = '0x';
  for (let i = 0; i < 4; i++) s += hex[Math.floor(Math.random() * 16)];
  return s;
}

// ---------- Signal row builders ----------

/**
 * Build an 8-row display from a CheckResponse. When a network-only field is
 * undefined (set by the offline-local path) we mark the row OFFLINE instead
 * of inventing a value.
 */
function buildSignals(r: CheckResponse, isOffline: boolean): Record<SignalId, SignalRow> {
  const urlFmt: SignalRow = r.verdict === 'INVALID'
    ? { label: msg('popupSignalUrlFormat'),  state: 'bad', value: msg('popupStatusMalformed') }
    : { label: msg('popupSignalUrlFormat'),  state: 'ok',  value: msg('popupStatusValid') };

  // --- Network-only rows. If the field is undefined (offline path) show OFFLINE. ---
  const redirects: SignalRow = (() => {
    if (isOffline) return { label: msg('popupSignalRedirects'), state: 'offline', value: msg('popupStatusOffline') };
    if (r.expansion_timed_out) return { label: msg('popupSignalRedirects'), state: 'warn', value: msg('popupStatusExpansionFailed') };
    const hops = Math.max(0, r.redirect_chain.length - 1);
    return hops === 0
      ? { label: msg('popupSignalRedirects'), state: 'ok',   value: msg('popupStatusDirect') }
      : { label: msg('popupSignalRedirects'), state: 'warn', value: msg('popupStatusHops', [String(hops)]) };
  })();

  // Character check — local, available in both modes.
  const character: SignalRow = (() => {
    const homoglyphHit = r.signals.some((s) => s.id === 'homoglyph');
    if (!r.homoglyph_non_ascii) {
      return { label: msg('popupSignalCharacter'), state: 'ok', value: msg('popupStatusAsciiClean') };
    }
    if (homoglyphHit) {
      return { label: msg('popupSignalCharacter'), state: 'bad',
        value: msg('popupStatusSpoof', [r.homoglyph_decoded ?? '']) };
    }
    if (r.homoglyph_punycode) {
      return { label: msg('popupSignalCharacter'), state: 'warn',
        value: msg('popupStatusPunycode', [r.homoglyph_decoded ?? '']) };
    }
    return { label: msg('popupSignalCharacter'), state: 'warn', value: msg('popupStatusNonAscii') };
  })();

  // Official domain — local, available in both modes. We read from r.signals
  // because the detector already computed it and formatted it for us.
  const officialHit = r.signals.find((s) => s.id === 'official');
  const lookalikeHit = r.signals.find((s) => s.id === 'subdomain_trick' || s.id === 'typosquat' || s.id === 'homoglyph');
  const official: SignalRow = (() => {
    if (r.verdict === 'SAFE' || officialHit) {
      const brand = officialHit?.brand ?? '';
      return { label: msg('popupSignalOfficial'), state: 'ok',
        value: brand ? brand.toUpperCase() : msg('popupStatusAllowlisted') };
    }
    if (r.verdict === 'DANGEROUS') {
      return { label: msg('popupSignalOfficial'), state: 'bad',
        value: lookalikeHit ? msg('popupStatusLookalike') : msg('popupStatusNotAllowlisted') };
    }
    if (r.verdict === 'UNRECOGNIZED') {
      return { label: msg('popupSignalOfficial'), state: 'warn', value: msg('popupStatusUnknown') };
    }
    return { label: msg('popupSignalOfficial'), state: 'bad', value: msg('popupStatusUnknown') };
  })();

  const hosting: SignalRow = isOffline
    ? { label: msg('popupSignalHosting'), state: 'offline', value: msg('popupStatusOffline') }
    : r.hosting_country
      ? { label: msg('popupSignalHosting'), state: 'ok', value: r.hosting_country }
      : { label: msg('popupSignalHosting'), state: 'warn',
          value: r.hosting_checked ? msg('popupStatusUnknown') : msg('popupStatusUnavailable') };

  const domainAge: SignalRow = isOffline
    ? { label: msg('popupSignalDomainAge'), state: 'offline', value: msg('popupStatusOffline') }
    : r.whois_age_days == null
      ? { label: msg('popupSignalDomainAge'), state: 'warn',
          value: r.whois_checked ? msg('popupStatusPrivate') : msg('popupStatusUnavailable') }
      : r.whois_age_days < 30
        ? { label: msg('popupSignalDomainAge'), state: 'bad',  value: msg('popupStatusFresh',   [String(r.whois_age_days)]) }
        : r.whois_age_days < 365
          ? { label: msg('popupSignalDomainAge'), state: 'warn', value: msg('popupStatusYoungDays', [String(r.whois_age_days)]) }
          : { label: msg('popupSignalDomainAge'), state: 'ok',   value: msg('popupStatusMature') };

  const cert: SignalRow = isOffline
    ? { label: msg('popupSignalCert'), state: 'offline', value: msg('popupStatusOffline') }
    : r.cert_age_days == null
      ? { label: msg('popupSignalCert'), state: r.cert_checked ? 'bad' : 'warn',
          value: r.cert_checked ? msg('popupStatusNewDomain') : msg('popupStatusUnavailable') }
      : r.cert_age_days < 14
        ? { label: msg('popupSignalCert'), state: 'bad',  value: msg('popupStatusFresh',     [String(r.cert_age_days)]) }
        : r.cert_age_days < 60
          ? { label: msg('popupSignalCert'), state: 'warn', value: msg('popupStatusYoungDays', [String(r.cert_age_days)]) }
          : { label: msg('popupSignalCert'), state: 'ok',   value: msg('popupStatusCertValidOld') };

  const community: SignalRow = isOffline
    ? { label: msg('popupSignalCommunity'), state: 'offline', value: msg('popupStatusOffline') }
    : (r.community_status === 'confirmed' || (r.community_report_count ?? 0) > 0)
      ? { label: msg('popupSignalCommunity'), state: 'bad', value: msg('popupStatusFlagged', [String(r.community_report_count ?? 0)]) }
      : r.verdict === 'SAFE' || r.verdict === 'UNRECOGNIZED'
        ? { label: msg('popupSignalCommunity'), state: 'ok',  value: msg('popupStatusClean') }
        : { label: msg('popupSignalCommunity'), state: 'warn', value: msg('popupStatusNoReports') };

  return { urlFormat: urlFmt, redirects, character, official, hosting, domainAge, cert, community };
}

function renderIdleSignals() {
  const rows: Array<[SignalId, string]> = [
    ['urlFormat',  msg('popupSignalUrlFormat')],
    ['redirects',  msg('popupSignalRedirects')],
    ['character',  msg('popupSignalCharacter')],
    ['official',   msg('popupSignalOfficial')],
    ['hosting',    msg('popupSignalHosting')],
    ['domainAge',  msg('popupSignalDomainAge')],
    ['cert',       msg('popupSignalCert')],
    ['community',  msg('popupSignalCommunity')],
  ];
  els.signals.replaceChildren(
    ...rows.map(([id, label]) => rowEl(id, label, '—', 'idle', '—')),
  );
}

function renderCheckingSignals() {
  const labels = [
    msg('popupSignalUrlFormat'),  msg('popupSignalRedirects'),
    msg('popupSignalCharacter'),  msg('popupSignalOfficial'),
    msg('popupSignalHosting'),    msg('popupSignalDomainAge'),
    msg('popupSignalCert'),       msg('popupSignalCommunity'),
  ];
  els.signals.replaceChildren(
    ...labels.map((label, i) => rowEl(SIGNAL_IDS[i], label, '', 'pending', '…')),
  );
}

function renderSignals(s: Record<SignalId, SignalRow>) {
  els.signals.replaceChildren(
    ...SIGNAL_IDS.map((id) => {
      const row = s[id];
      const icon = row.state === 'ok' ? '✓'
        : row.state === 'bad'     ? '✗'
        : row.state === 'warn'    ? '⚠'
        : row.state === 'offline' ? '·'
        :                           '…';
      return rowEl(id, row.label, row.value, row.state, icon);
    }),
  );
}

function rowEl(id: string, label: string, value: string, state: SignalState, icon: string): HTMLLIElement {
  const li = document.createElement('li');
  li.className = 'signal';
  li.dataset.row = id;
  const iconCls = state === 'ok' ? 'ok' : state === 'bad' ? 'bad' : state === 'warn' ? 'warn' : '';
  li.innerHTML = `
    <span class="signal-icon ${iconCls}"></span>
    <span class="signal-label"></span>
    <span class="signal-value ${state}"></span>
  `;
  (li.querySelector('.signal-icon') as HTMLElement).textContent = icon;
  (li.querySelector('.signal-label') as HTMLElement).textContent = label;
  (li.querySelector('.signal-value') as HTMLElement).textContent = state === 'pending' ? '' : value;
  return li;
}

// ---------- Verdict block ----------

function setVerdict(state: VerdictState, word: string, reason: string, advice?: string) {
  els.verdict.className = 'verdict state-' + state;
  els.verdictIcon.textContent =
    state === 'safe'    ? '✓'
    : state === 'danger'  ? '◆'
    : state === 'unrecog' ? '?'
    : state === 'invalid' ? '—'
    :                       '—';
  els.verdictWord.textContent = word;
  els.verdictReason.textContent = reason;
  if (advice) {
    els.verdictAdvice.textContent = advice;
    els.verdictAdvice.classList.remove('hidden');
  } else {
    els.verdictAdvice.classList.add('hidden');
  }
}

function verdictStateFromCheck(v: CheckResponse['verdict']): VerdictState {
  return v === 'SAFE' ? 'safe'
    : v === 'DANGEROUS'    ? 'danger'
    : v === 'UNRECOGNIZED' ? 'unrecog'
    :                        'invalid';
}

function verdictWordFor(v: CheckResponse['verdict']): string {
  return v === 'SAFE'         ? msg('popupVerdictSafe')
    : v === 'DANGEROUS'    ? msg('popupVerdictDangerous')
    : v === 'UNRECOGNIZED' ? msg('popupVerdictUnrecognized')
    :                        msg('popupVerdictInvalid');
}

function adviceFor(v: CheckResponse['verdict']): string | undefined {
  if (v === 'SAFE')          return msg('popupAdviceSafe');
  if (v === 'DANGEROUS')     return msg('popupAdviceDangerous');
  if (v === 'UNRECOGNIZED')  return msg('popupAdviceUnrecognized');
  return undefined;
}

// ---------- State transitions ----------

function goIdle() {
  els.offlineBanner.classList.add('hidden');
  els.checkedAs.classList.add('hidden');
  els.reconnectHint.classList.add('hidden');
  els.reportBtn.classList.add('hidden');
  els.checkBtn.disabled = els.input.value.trim() === '';
  renderIdleSignals();
  setVerdict('idle', msg('popupVerdictAwaiting'), msg('popupIdleMessage'));
}

function goChecking() {
  els.checkedAs.classList.add('hidden');
  els.reconnectHint.classList.add('hidden');
  els.reportBtn.classList.add('hidden');
  els.checkBtn.disabled = true;
  els.checkBtn.textContent = msg('popupChecking');
  renderCheckingSignals();
  setVerdict('checking', msg('popupVerdictChecking'), msg('popupLoadingMessage'));
}

function goResult(outcome: CheckOutcome) {
  const r = outcome.result;
  const isOffline = outcome.offline;

  els.offlineBanner.classList.toggle('hidden', !isOffline);
  els.reconnectHint.classList.toggle('hidden', !isOffline);
  els.checkBtn.disabled = false;
  els.checkBtn.textContent = msg('popupCheck');

  const signals = buildSignals(r, isOffline);
  renderSignals(signals);

  const vState = verdictStateFromCheck(r.verdict);
  const vWord  = verdictWordFor(r.verdict);
  setVerdict(vState, vWord, r.reason, adviceFor(r.verdict));

  // "Checked: <url>" — only when normalizer extracted from richer input.
  if (r.extractedFrom) {
    els.checkedAs.innerHTML = '';
    const prefix = document.createElement('span');
    prefix.textContent = msg('popupCheckedAs') + ' ';
    const code = document.createElement('code');
    code.textContent = r.resolved_hostname || r.hostname || r.redirect_chain[0] || '';
    els.checkedAs.append(prefix, code);
    els.checkedAs.classList.remove('hidden');
  } else {
    els.checkedAs.classList.add('hidden');
  }

  // Report button appears for DANGEROUS / UNRECOGNIZED (same as site).
  if (r.verdict === 'DANGEROUS' || r.verdict === 'UNRECOGNIZED') {
    els.reportBtn.classList.remove('hidden');
    els.reportBtn.disabled = false;
    els.reportBtn.textContent = msg(
      r.verdict === 'DANGEROUS' ? 'popupConfirmReport' : 'popupReportScam',
    );
  } else {
    els.reportBtn.classList.add('hidden');
  }
}

function goError(message: string) {
  els.offlineBanner.classList.add('hidden');
  els.checkedAs.classList.add('hidden');
  els.reconnectHint.classList.add('hidden');
  els.reportBtn.classList.add('hidden');
  els.checkBtn.disabled = false;
  els.checkBtn.textContent = msg('popupCheck');
  renderIdleSignals();
  setVerdict('invalid', msg('popupCouldntCheck'), message);
}

// ---------- Run check ----------

async function runCheck(url: string) {
  if (busy) return;
  const trimmed = url.trim();
  if (!trimmed) return;

  currentUrl = trimmed;
  busy = true;
  goChecking();

  try {
    const res = await chrome.runtime.sendMessage({ type: 'check', url: trimmed });
    if (res?.ok && res.outcome) {
      goResult(res.outcome as CheckOutcome);
    } else {
      goError(res?.error ?? 'unknown error');
    }
  } catch (err) {
    goError(err instanceof Error ? err.message : String(err));
  } finally {
    busy = false;
  }
}

// ---------- Report flow ----------

async function runReport() {
  if (!currentUrl) return;
  els.reportBtn.disabled = true;
  els.reportBtn.textContent = msg('popupReporting');
  const res = await chrome.runtime.sendMessage({ type: 'report', url: currentUrl });
  if (res?.ok) {
    els.reportBtn.textContent = msg('popupReported');
  } else {
    els.reportBtn.textContent = msg('popupReportFailed');
    els.reportBtn.disabled = false;
  }
}

// ---------- Boot ----------

function wireEvents() {
  els.form.addEventListener('submit', (e) => {
    e.preventDefault();
    runCheck(els.input.value);
  });
  els.input.addEventListener('input', () => {
    els.checkBtn.disabled = els.input.value.trim() === '';
  });
  els.input.addEventListener('paste', (e) => {
    const text = e.clipboardData?.getData('text');
    // Let the paste land in the input first, then kick off a check.
    if (text) setTimeout(() => runCheck(els.input.value || text), 0);
  });
  els.reportBtn.addEventListener('click', runReport);
}

async function boot() {
  applyI18n();
  els.session.textContent = makeSession();
  wireEvents();
  goIdle();

  // Context-menu → session-storage hand-off. Clear after reading so a toolbar
  // click after a context-menu flow starts clean.
  const stored = await chrome.storage.session.get('pending');
  const pending = stored.pending as { action: 'check' | 'report'; url: string } | undefined;
  if (pending) {
    await chrome.storage.session.remove('pending');
    els.input.value = pending.url;
    els.checkBtn.disabled = false;
    if (pending.action === 'check') await runCheck(pending.url);
  }
}

boot().catch((err) => {
  console.error('[popup] boot failed', err);
  goError(err instanceof Error ? err.message : String(err));
});
