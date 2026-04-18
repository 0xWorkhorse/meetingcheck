const CARDS = [
  {
    key: 'safe',
    color: 'text-safe',
    lab: 'Verdict A',
    icon: '✓',
    name: 'SAFE',
    body: 'On the official allowlist. Certificate matches a known provider issued > 60 days ago. No community reports. Proceed.',
  },
  {
    key: 'danger',
    color: 'text-danger',
    lab: 'Verdict B',
    icon: '◆',
    name: 'DANGEROUS',
    body: 'Homoglyph, typosquat, fresh cert on an off-brand TLD, or currently in the blocklist. Close the tab. Report it. Tell your friends.',
  },
  {
    key: 'unrec',
    color: 'text-warn',
    lab: 'Verdict C',
    icon: '?',
    name: 'UNRECOGNIZED',
    body: "Could be a smaller provider we don't know yet. We won't lie and say it's safe. Verify out-of-band before you click.",
  },
];

export function VerdictsExplainer() {
  return (
    <section className="wrap pb-[76px]" id="verdicts">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-9">
        {CARDS.map((c) => (
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
