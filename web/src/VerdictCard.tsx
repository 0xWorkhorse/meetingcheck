import type { CheckResponse } from './api.js';
import type { FormattedSignal, Verdict } from '@isthislinksafe/detector';
import { useLocale } from './LocaleContext.js';

const VERDICT_STYLE: Record<Verdict, { bg: string; fg: string; border: string }> = {
  SAFE:         { bg: 'bg-safe/10',     fg: 'text-safe',    border: 'border-safe/30' },
  DANGEROUS:    { bg: 'bg-danger/10',   fg: 'text-danger',  border: 'border-danger/30' },
  UNRECOGNIZED: { bg: 'bg-unknown/10',  fg: 'text-unknown', border: 'border-unknown/30' },
  INVALID:      { bg: 'bg-neutral-800', fg: 'text-neutral-400', border: 'border-neutral-700' },
};

const LEVEL_STYLE: Record<FormattedSignal['level'], string> = {
  ok:       'text-safe',
  warning:  'text-unknown',
  critical: 'text-danger',
  info:     'text-neutral-400',
};

export function VerdictCard({ result }: { result: CheckResponse }) {
  const { t } = useLocale();
  const s = VERDICT_STYLE[result.verdict];
  const label =
    result.verdict === 'SAFE' ? t.sections.verdictSafe :
    result.verdict === 'DANGEROUS' ? t.sections.verdictDanger :
    result.verdict === 'UNRECOGNIZED' ? t.sections.verdictUnknown :
    'Invalid';

  return (
    <div className={`rounded-xl border ${s.border} ${s.bg} p-6 space-y-4`}>
      <div className="flex items-baseline justify-between">
        <h2 className={`text-2xl font-semibold ${s.fg}`}>{result.title}</h2>
        <span className={`text-xs font-mono uppercase tracking-wider ${s.fg}`}>{label}</span>
      </div>

      <p className="text-neutral-200">{result.reason}</p>

      {result.hostname && (
        <div className="text-sm font-mono text-neutral-400 break-all">
          <span className="text-neutral-200">{result.hostname}</span>
        </div>
      )}

      {result.redirect_chain.length > 1 && (
        <div className="text-sm text-neutral-400">
          {result.redirect_chain.length - 1}
        </div>
      )}

      <ul className="space-y-2 pt-2 border-t border-neutral-800">
        {result.signals.map((sig, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className={`font-mono uppercase text-xs w-20 shrink-0 pt-0.5 ${LEVEL_STYLE[sig.level]}`}>
              {sig.level}
            </span>
            <span>
              <span className="text-neutral-200 font-medium">{sig.label}</span>
              <span className="text-neutral-400"> — {sig.detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
