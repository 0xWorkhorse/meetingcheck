import { useEffect, useMemo, useRef, useState } from 'react';
import { checkUrl, type CheckResponse } from '../../api.js';
import { useLocale } from '../../i18n/LocaleContext.js';
import { SampleChips } from './SampleChips.js';
import { SignalsPanel } from './SignalsPanel.js';
import { VerdictPanel } from './VerdictPanel.js';
import { deriveSignals, makeSessionId } from './logic.js';

const SESSION = makeSessionId();
const REVEAL_STEP_MS = 260;
const DEFAULT_URL = 'https://zoom-invite.app/j/8472910';

export function Checker() {
  const { t, locale } = useLocale();
  const [url, setUrl] = useState(DEFAULT_URL);
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
      const rowCount = 4; // keep in sync with deriveSignals
      for (let i = 0; i < rowCount; i++) {
        const id = window.setTimeout(() => setRevealed(i), REVEAL_STEP_MS * (i + 1));
        timers.current.push(id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.report.failed);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => () => clearTimers(), []);

  const rows = useMemo(() => (result ? deriveSignals(result, t) : null), [result, t]);

  return (
    <div id="checker" className="mt-12 border-[1.5px] border-ink bg-paper-2 relative">
      <TerminalBar title={t.checker.shellTitle} sessionLabel={t.checker.sessionLabel} session={SESSION} />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_520px] min-h-[360px]">
        <div className="p-7 pb-5 md:border-r-[1.5px] md:border-ink border-b-[1.5px] md:border-b-0 border-ink flex flex-col gap-3.5">
          <label htmlFor="urlin" className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted">
            {t.checker.pasteMeetingUrl}
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
              className="flex-1 bg-transparent border-0 px-[18px] py-4 font-mono text-[16px] text-ink outline-none placeholder:text-muted"
              placeholder="https://…"
            />
            <button
              type="button"
              onClick={() => run(url)}
              disabled={loading}
              className="border-0 border-l-[1.5px] border-ink bg-ink text-paper px-[22px] font-mono text-[12px] tracking-[0.12em] uppercase cursor-pointer font-bold hover:bg-danger disabled:opacity-60"
            >
              {loading ? t.checker.checkingBtn : t.checker.verifyBtn}
            </button>
          </div>

          <SampleChips onPick={(u) => { setUrl(u); run(u); }} t={t} />

          <SignalsPanel rows={rows} revealedIndex={revealed} t={t} />

          {error && (
            <div className="font-mono text-[11px] text-danger uppercase tracking-[0.1em] mt-2">
              {t.checker.errorPrefix} {error}
            </div>
          )}
        </div>

        <VerdictPanel
          result={result}
          loading={loading}
          revealed={revealed}
          showReport={showReport}
          onOpenReport={() => setShowReport(true)}
          initialReportUrl={result?.redirect_chain[0] ?? url}
          t={t}
        />
      </div>
    </div>
  );
}

function TerminalBar({
  title, sessionLabel, session,
}: {
  title: string;
  sessionLabel: string;
  session: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 px-3.5 bg-ink text-paper font-mono text-[11px] tracking-[0.1em] uppercase">
      <div className="flex gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-danger border border-danger" />
        <span className="w-2.5 h-2.5 rounded-full bg-warn   border border-warn" />
        <span className="w-2.5 h-2.5 rounded-full bg-safe   border border-safe" />
      </div>
      <div>{title}</div>
      <div>{sessionLabel}&nbsp;&nbsp;{session}</div>
    </div>
  );
}
