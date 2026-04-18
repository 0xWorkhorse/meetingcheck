import type { SignalRow, SignalState } from './logic.js';
import type { UiMessages } from '../../i18n/types.js';

/**
 * Idle-state placeholder rows. Must stay in the same order as the array
 * returned by deriveSignals() so the layout is stable when the result
 * replaces the placeholders.
 */
const PLACEHOLDER_LABEL_KEYS: Array<keyof UiMessages['checker']['signals']> = [
  'urlFormat',
  'redirects',
  'characterCheck',
  'officialDomain',
  'hosting',
  'domainAge',
  'certTransparency',
  'communityFeed',
];

const ICON: Record<SignalState, string> = {
  ok:      '✓',
  bad:     '✗',
  warn:    '⚠',
  pending: '…',
};

const ICON_COLOR: Record<SignalState, string> = {
  ok:      'text-safe',
  bad:     'text-danger',
  warn:    'text-warn',
  pending: 'text-muted',
};

interface Props {
  rows: SignalRow[] | null;
  revealedIndex: number;
  t: UiMessages;
}

export function SignalsPanel({ rows, revealedIndex, t }: Props) {
  if (!rows) {
    return (
      <div className="mt-2 grid gap-1" aria-live="polite">
        {PLACEHOLDER_LABEL_KEYS.map((k) => (
          <Row
            key={k}
            label={t.checker.signals[k]}
            state="pending"
            value="—"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-2 grid gap-1" aria-live="polite">
      {rows.map((row, i) => {
        const pending = i > revealedIndex;
        const state: SignalState = pending ? 'pending' : row.state;
        return (
          <Row
            key={row.label}
            label={row.label}
            state={state}
            value={pending ? t.checker.values.checking : row.value}
          />
        );
      })}
    </div>
  );
}

function Row({
  label, state, value,
}: {
  label: string;
  state: SignalState;
  value: React.ReactNode;
}) {
  const muted = state === 'pending' ? 'text-muted' : '';
  return (
    <div className="grid grid-cols-[18px_1fr_auto] items-center gap-2.5 font-mono text-[12px] py-1.5 check-row">
      <span className={'font-bold ' + ICON_COLOR[state]}>{ICON[state]}</span>
      <span className="text-muted uppercase tracking-[0.1em] text-[10px]">{label}</span>
      <span className={'justify-self-end text-[11px] uppercase tracking-[0.1em] ' + muted}>
        {value}
      </span>
    </div>
  );
}
