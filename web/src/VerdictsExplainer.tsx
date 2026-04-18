import { useLocale } from './i18n/LocaleContext.js';

export function VerdictsExplainer() {
  const { t } = useLocale();

  const cards = [
    {
      key: 'safe',
      color: 'text-safe',
      lab: t.verdictsExplainer.safeLab,
      icon: '✓',
      name: t.verdictWords.safe,
      body: t.verdictsExplainer.safeBody,
    },
    {
      key: 'danger',
      color: 'text-danger',
      lab: t.verdictsExplainer.dangerousLab,
      icon: '◆',
      name: t.verdictWords.dangerous,
      body: t.verdictsExplainer.dangerousBody,
    },
    {
      key: 'unrec',
      color: 'text-warn',
      lab: t.verdictsExplainer.unrecognizedLab,
      icon: '?',
      name: t.verdictWords.unrecognized,
      body: t.verdictsExplainer.unrecognizedBody,
    },
  ];

  return (
    <section className="wrap pb-[76px]" id="verdicts">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-9">
        {cards.map((c) => (
          <div key={c.key} className="border-[1.5px] border-ink p-[22px] bg-paper-2 flex flex-col gap-2.5 min-h-[200px]">
            <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted">{c.lab}</div>
            <div className={'font-mono font-bold leading-none text-[30px] ' + c.color}>{c.icon}</div>
            <div className={'font-display font-bold text-[30px] tracking-[-0.02em] ' + c.color}>{c.name}</div>
            <p className="font-mono text-[12px] leading-[1.6] m-0 text-ink-2">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
