import { ReportForm } from '../../ReportForm.js';
import type { CheckResponse } from '../../api.js';
import type { UiMessages } from '../../i18n/types.js';
import { format } from '../../i18n/format.js';
import { adviceFor, verdictMeta } from './logic.js';

interface Props {
  result: CheckResponse | null;
  loading: boolean;
  revealed: number;
  showReport: boolean;
  onOpenReport: () => void;
  initialReportUrl: string;
  t: UiMessages;
}

export function VerdictPanel({
  result, loading, revealed, showReport, onOpenReport, initialReportUrl, t,
}: Props) {
  const meta = result ? verdictMeta(result.verdict, t) : null;
  const stampTime = result
    ? new Date(result.scanned_at).toISOString().split('T')[1].slice(0, 8) + 'Z'
    : null;

  const bigLabel = loading
    ? t.checker.checking
    : meta?.label ?? t.checker.awaiting;

  const stamp = loading
    ? t.checker.inFlight
    : stampTime
      ? format(t.checker.verifiedAt, { time: stampTime })
      : t.checker.idleStamp;

  const body = loading
    ? t.checker.loadingMessage
    : result?.reason ?? t.checker.idleMessage;

  const verdictFontSize =
    result?.verdict === 'UNRECOGNIZED'
      ? 'clamp(36px, 4vw, 60px)'
      : 'clamp(40px, 5vw, 76px)';

  const canReport = result && !loading && (result.verdict === 'DANGEROUS' || result.verdict === 'UNRECOGNIZED');
  const showAdvice = result && !loading && revealed >= 3;

  return (
    <div
      className={
        'p-7 flex flex-col justify-between bg-paper-2 relative overflow-hidden ' +
        (meta ? meta.cls : '')
      }
    >
      <div className="flex justify-between font-mono text-[10px] tracking-[0.18em] uppercase text-muted">
        <span>{t.checker.verdictStamp}</span>
        <span>{stamp}</span>
      </div>

      <div
        className={
          'font-display font-bold tracking-[-0.04em] leading-[0.9] my-4 ' +
          (meta ? meta.color : 'text-ink')
        }
        style={{ fontSize: verdictFontSize }}
      >
        <span className="inline-block mr-2">{meta?.icon ?? '—'}</span>
        <span>{bigLabel}</span>
      </div>

      <p className="font-serif text-[22px] leading-[1.2] max-w-[40ch] m-0">{body}</p>

      {showAdvice && (
        <div
          className={
            'mt-3.5 font-mono text-[11px] tracking-[0.08em] uppercase py-2.5 px-3 border-[1.5px] inline-block self-start ' +
            (meta?.color ?? 'text-ink')
          }
          style={{ borderColor: 'currentColor' }}
        >
          {adviceFor(result.verdict, t)}
        </div>
      )}

      {canReport && (
        <div className="mt-4">
          {!showReport ? (
            <button
              type="button"
              onClick={onOpenReport}
              className="font-mono text-[11px] tracking-[0.08em] uppercase underline underline-offset-2 hover:no-underline bg-transparent border-0 p-0 cursor-pointer text-ink"
            >
              {t.checker.reportThisLink}
            </button>
          ) : (
            <div className="mt-2 border-t border-ink/20 pt-4">
              <ReportForm initialUrl={initialReportUrl} />
            </div>
          )}
        </div>
      )}

      <div
        className="absolute right-[-20px] top-[-10px] font-mono text-[11px] leading-[1.4] pointer-events-none select-none text-right whitespace-pre text-ink/10"
      >
        {`0101 0111 1100\n1001 1011 0010\n0110 1110 0011\n. . .`}
      </div>
    </div>
  );
}
