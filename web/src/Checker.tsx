import { useEffect, useMemo, useRef, useState } from 'react';
import { checkUrl, type CheckResponse } from './api.js';
import { useLocale } from './LocaleContext.js';
import { ReportForm } from './ReportForm.js';

type State = 'ok' | 'bad' | 'warn' | 'pending';
type CheckRow = [label: string, state: State, value: string];

const SAMPLES: Array<{ klass: 's' | 'd' | 'u'; tag: string; url: string; label: string }> = [
  { klass: 's', tag: 'SAFE',   url: 'https://us06web.zoom.us/j/82910481?pwd=aGbXm',     label: 'us06web.zoom.us/j/82910481' },
  { klass: 'd', tag: 'DANGER', url: 'https://zoom-invite.app/j/8472910',                label: 'zoom-invite.app/j/8472910' },
  { klass: 'd', tag: 'DANGER', url: 'https://meet.google.ciom/xky-rjqm-dvo',            label: 'meet.google.ciom/xky-rjqm-dvo' },
  { klass: 's', tag: 'SAFE',   url: 'https://calendly.com/mathteam/30min',              label: 'calendly.com/mathteam/30min' },
  { klass: 'u', tag: '???',    url: 'https://rooms.hopin.biz/j/9912',                   label: 'rooms.hopin.biz/j/9912' },
  { klass: 'd', tag: 'DANGER', url: 'https://teams.microsof-t.live/l/meetup/aZ92',      label: 'teams.microsof-t.live/l/meetup/aZ92' },
];

const SESSION = '0x' + Array.from({ length: 4 }, () => Math.floor(Math.random() * 16).toString(16).toUpperCase()).join('');

function deriveChecks(res: CheckResponse): CheckRow[] {
  const urlFmt: CheckRow = res.verdict === 'INVALID'
    ? ['URL format',   'bad', 'MALFORMED']
    : ['URL format',   'ok',  'VALID'];

  let official: CheckRow;
  if (res.verdict === 'SAFE') {
    const brandSig = res.signals.find((s) => s.id === 'official_domain');
    const brand = brandSig?.brand ?? '';
    official = ['Official domain', 'ok', brand ? brand.toUpperCase() : 'ALLOWLISTED'];
  } else if (res.verdict === 'DANGEROUS') {
    const look = res.signals.find((s) => s.id === 'subdomain_trick' || s.id === 'typosquat' || s.id === 'homoglyph');
    official = ['Official domain', 'bad', look ? 'LOOKALIKE / NOT OFFICIAL' : 'NOT ALLOWLISTED'];
  } else if (res.verdict === 'UNRECOGNIZED') {
    official = ['Official domain', 'warn', 'UNKNOWN'];
  } else {
    official = ['Official domain', 'bad', 'N/A'];
  }

  // Cert transparency placeholder — not yet wired to real CT logs.
  const cert: CheckRow = ['Cert transparency', 'warn', 'NOT CHECKED'];

  let community: CheckRow;
  if (res.community_status === 'confirmed' || res.community_report_count > 0) {
    community = ['Community feed', 'bad', `FLAGGED ${res.community_report_count}×`];
  } else if (res.verdict === 'SAFE') {
    community = ['Community feed', 'ok', 'CLEAN'];
  } else if (res.verdict === 'UNRECOGNIZED') {
    community = ['Community feed', 'ok', 'NO REPORTS'];
  } else {
    community = ['Community feed', 'warn', 'NO REPORTS'];
  }

  return [urlFmt, official, cert, community];
}

function verdictMeta(v: CheckResponse['verdict']) {
  switch (v) {
    case 'SAFE':         return { cls: 'verdict-bg-safe',    color: 'text-safe',   label: 'SAFE',         icon: '✓' };
    case 'DANGEROUS':    return { cls: 'verdict-bg-danger',  color: 'text-danger', label: 'DANGEROUS',    icon: '◆' };
    case 'UNRECOGNIZED': return { cls: 'verdict-bg-unrecog', color: 'text-warn',   label: 'UNRECOGNIZED', icon: '?' };
    default:             return { cls: '',                   color: 'text-ink',    label: 'INVALID',      icon: '—' };
  }
}

export function Checker() {
  const { locale } = useLocale();
  const [url, setUrl] = useState('https://zoom-invite.app/j/8472910');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [revealed, setRevealed] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const timers = useRef<number[]>([]);

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  async function run(target: string) {
    clearTimers();
    setError(null);
    setShowReport(false);
    setLoading(true);
    setResult(null);
    setRevealed(-1);
    try {
      const res = await checkUrl(target, locale);
      setResult(res);
      const checks = deriveChecks(res);
      checks.forEach((_, i) => {
        const id = window.setTimeout(() => setRevealed(i), 260 * (i + 1));
        timers.current.push(id);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => () => clearTimers(), []);

  const checks = useMemo(() => (result ? deriveChecks(result) : null), [result]);
  const meta = result ? verdictMeta(result.verdict) : null;
  const stampTime = result ? new Date(result.scanned_at).toISOString().split('T')[1].slice(0, 8) + 'Z' : null;

  return (
    <div id="checker" className="mt-12 border-[1.5px] border-ink bg-paper-2 relative">
      {/* terminal title bar */}
      <div className="flex items-center justify-between py-2 px-3.5 bg-ink text-paper font-mono text-[11px] tracking-[0.1em] uppercase">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-danger border border-danger" />
          <span className="w-2.5 h-2.5 rounded-full bg-warn   border border-warn" />
          <span className="w-2.5 h-2.5 rounded-full bg-safe   border border-safe" />
        </div>
        <div>MEETINGCHECK // VERIFIER SHELL</div>
        <div>session&nbsp;&nbsp;{SESSION}</div>
      </div>

      {/* body */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_520px] min-h-[360px]">
        {/* input column */}
        <div className="p-7 pb-5 md:border-r-[1.5px] md:border-ink border-b-[1.5px] md:border-b-0 border-ink flex flex-col gap-3.5">
          <label htmlFor="urlin" className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted">
            ▌ Paste meeting URL
          </label>
          <div className="flex border-[1.5px] border-ink bg-paper">
            <input
              id="urlin"
              type="text"
              value={url}
              spellCheck={false}
              autoComplete="off"
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') run(url); }}
              className="flex-1 bg-transparent border-0 px-[18px] py-4 font-mono text-[16px] text-ink outline-none placeholder:text-[#a89f8c]"
              placeholder="https://…"
            />
            <button
              onClick={() => run(url)}
              disabled={loading}
              className="border-0 border-l-[1.5px] border-ink bg-ink text-paper px-[22px] font-mono text-[12px] tracking-[0.12em] uppercase cursor-pointer font-bold hover:bg-danger disabled:opacity-60"
            >
              {loading ? 'CHECKING…' : 'VERIFY ↵'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-1">
            <span className="text-[10px] tracking-[0.14em] uppercase text-muted self-center mr-0.5">Try:</span>
            {SAMPLES.map((s) => (
              <button
                key={s.url}
                onClick={() => { setUrl(s.url); run(s.url); }}
                className={
                  'font-mono text-[11px] py-1.5 px-2.5 border border-dashed border-ink bg-paper cursor-pointer normal-case tracking-normal inline-flex items-center gap-1.5 hover:bg-ink hover:text-paper'
                }
              >
                <span
                  className={
                    'text-[9px] tracking-[0.1em] uppercase py-0.5 px-1.5 border border-current ' +
                    (s.klass === 'd' ? 'text-danger' : s.klass === 's' ? 'text-safe' : 'text-warn')
                  }
                >
                  {s.tag}
                </span>
                {s.label}
              </button>
            ))}
          </div>

          {/* check rows */}
          <div className="mt-2 grid gap-1" aria-live="polite">
            {checks
              ? checks.map(([k, state, val], i) => {
                  const pending = i > revealed;
                  const st: State = pending ? 'pending' : state;
                  const icon = pending ? '…' : st === 'ok' ? '✓' : st === 'bad' ? '✗' : st === 'warn' ? '⚠' : '…';
                  const iconColor =
                    st === 'ok' ? 'text-safe' :
                    st === 'bad' ? 'text-danger' :
                    st === 'warn' ? 'text-warn' :
                    'text-muted';
                  return (
                    <div key={k} className="grid grid-cols-[18px_1fr_auto] items-center gap-2.5 font-mono text-[12px] py-1.5 check-row">
                      <span className={'font-bold ' + iconColor}>{icon}</span>
                      <span className="text-muted uppercase tracking-[0.1em] text-[10px]">{k}</span>
                      <span className={'justify-self-end text-[11px] uppercase tracking-[0.1em] ' + (pending ? 'text-muted' : '')}>
                        {pending ? 'CHECKING…' : val}
                      </span>
                    </div>
                  );
                })
              : PLACEHOLDER_ROWS.map(([k]) => (
                  <div key={k} className="grid grid-cols-[18px_1fr_auto] items-center gap-2.5 font-mono text-[12px] py-1.5 check-row">
                    <span className="text-muted font-bold">…</span>
                    <span className="text-muted uppercase tracking-[0.1em] text-[10px]">{k}</span>
                    <span className="justify-self-end text-[11px] uppercase tracking-[0.1em] text-muted">—</span>
                  </div>
                ))}
          </div>

          {error && (
            <div className="font-mono text-[11px] text-danger uppercase tracking-[0.1em] mt-2">
              Error: {error}
            </div>
          )}
        </div>

        {/* verdict panel */}
        <div
          className={
            'p-7 flex flex-col justify-between bg-paper-2 relative overflow-hidden ' +
            (meta ? meta.cls : '')
          }
        >
          <div className="flex justify-between font-mono text-[10px] tracking-[0.18em] uppercase text-muted">
            <span>VERDICT</span>
            <span>{loading ? 'IN FLIGHT' : stampTime ? `VERIFIED ${stampTime}` : '— IDLE —'}</span>
          </div>

          <div
            className={'font-display font-bold tracking-[-0.04em] leading-[0.9] my-4 ' + (meta ? meta.color : 'text-ink')}
            style={{ fontSize: 'clamp(40px, 5vw, 76px)' }}
          >
            <span className="inline-block mr-2">{meta?.icon ?? '—'}</span>
            <span>{loading ? 'CHECKING…' : meta?.label ?? 'AWAITING'}</span>
          </div>

          <p className="font-serif text-[22px] leading-[1.2] max-w-[40ch] m-0">
            {loading
              ? 'Running checks against official allowlists and the community feed.'
              : result?.reason ??
                "Paste a meeting link on the left. We'll check it against official domains, certificate records, and our live community threat feed."}
          </p>

          {result && !loading && revealed >= 3 && (
            <div
              className={
                'mt-3.5 font-mono text-[11px] tracking-[0.08em] uppercase py-2.5 px-3 border-[1.5px] inline-block self-start ' +
                (meta?.color ?? 'text-ink')
              }
              style={{ borderColor: 'currentColor' }}
            >
              {adviceFor(result.verdict)}
            </div>
          )}

          {result && !loading && (result.verdict === 'DANGEROUS' || result.verdict === 'UNRECOGNIZED') && (
            <div className="mt-4">
              {!showReport ? (
                <button
                  onClick={() => setShowReport(true)}
                  className="font-mono text-[11px] tracking-[0.08em] uppercase underline underline-offset-2 hover:no-underline"
                >
                  Report this link →
                </button>
              ) : (
                <div className="mt-2 border-t border-ink/20 pt-4">
                  <ReportForm initialUrl={result.redirect_chain[0] ?? url} />
                </div>
              )}
            </div>
          )}

          <div className="absolute right-[-20px] top-[-10px] font-mono text-[11px] leading-[1.4] pointer-events-none select-none text-right whitespace-pre" style={{ color: 'rgba(11,11,11,0.08)' }}>
            {`0101 0111 1100\n1001 1011 0010\n0110 1110 0011\n. . .`}
          </div>
        </div>
      </div>
    </div>
  );
}

const PLACEHOLDER_ROWS: ReadonlyArray<[string]> = [
  ['URL format'],
  ['Official domain'],
  ['Cert transparency'],
  ['Community feed'],
];

function adviceFor(verdict: CheckResponse['verdict']): string {
  switch (verdict) {
    case 'SAFE':         return 'Proceed. Still: never paste a recovery phrase into a meeting window.';
    case 'DANGEROUS':    return 'Close the tab. Report the sender. Do not paste any recovery phrase anywhere, today.';
    case 'UNRECOGNIZED': return 'Verify out-of-band. Ask the sender on a different channel before clicking.';
    default:             return 'Ignore. Ask the sender to re-send via a channel you trust.';
  }
}
