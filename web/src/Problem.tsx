const LEDGER: Array<[string, string, string]> = [
  ['FEB 04', '"Zoom" invite, spoofed domain — seed phrase keylogger',     '$1.2M'],
  ['FEB 11', 'Calendly-styled phish, DeFi founder group',                  '$840K'],
  ['FEB 18', 'Google Meet lookalike, IDN homoglyph attack',                '$3.6M'],
  ['MAR 02', '"Teams recording" download → clipboard hijack',              '$410K'],
  ['MAR 14', 'Fake VC pitch meeting, screen-share RAT',                    '$2.1M'],
  ['APR 01', 'Spoofed Zoom SDK page in Farcaster DMs',                     '$190K'],
];

export function Problem() {
  return (
    <section className="wrap py-[76px]" id="problem">
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-10 pb-7 border-b border-ink mb-10 items-end">
        <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted">
          § 01<br />
          <b className="text-ink font-semibold">THE PROBLEM</b>
        </div>
        <h2 className="font-display font-bold tracking-[-0.035em] leading-[0.95] m-0 text-ink max-w-[16ch]"
            style={{ fontSize: 'clamp(40px, 6vw, 82px)' }}>
          Your calendar is a <em className="font-serif italic font-normal">weapon</em> now.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-[60px] items-start">
        <div>
          <p className="font-serif leading-[1.18] m-0 mb-6"
             style={{ fontSize: 'clamp(26px, 2.8vw, 40px)' }}>
            In February 2026, thousands of crypto holders clicked a "Zoom invite" that wasn't.
            It installed a clipboard hijacker in the time it took the loading spinner to spin.
            The wallets drained. The calls never existed.
          </p>
          <div className="font-mono text-[14px] leading-[1.7] text-ink-2 max-w-[62ch] space-y-3">
            <p className="m-0">
              Real meeting links and fake ones look identical to human eyes.{' '}
              <span className="inline-block py-px px-1.5 border border-ink font-mono text-[10px] tracking-[0.12em] uppercase align-middle">zoom.us</span>{' '}
              vs{' '}
              <span className="inline-block py-px px-1.5 border border-ink font-mono text-[10px] tracking-[0.12em] uppercase align-middle">zoom-invite.app</span>.{' '}
              <span className="inline-block py-px px-1.5 border border-ink font-mono text-[10px] tracking-[0.12em] uppercase align-middle">meet.google.com</span>{' '}
              vs{' '}
              <span className="inline-block py-px px-1.5 border border-ink font-mono text-[10px] tracking-[0.12em] uppercase align-middle">meet.google.ciom</span>.{' '}
              <span className="inline-block py-0.5 px-2 bg-highlight font-mono text-[11px] tracking-[0.12em] uppercase">one letter</span>{' '}
              and a wallet is gone.
            </p>
            <p className="m-0">
              Worse — legitimate-looking subdomains (<code>rooms.zoom-partner.xyz</code>) now live on the same infrastructure
              as the scams. Browser address bars don't help. Slack previews don't help. Antivirus doesn't help, because nothing
              has been downloaded yet.
            </p>
            <p className="m-0">
              What helps is a <b>rule-checker</b>: official-domain allowlists, certificate transparency, and a community
              blocklist refreshed every two minutes. That's all this is.
            </p>
          </div>
        </div>

        <div className="border-[1.5px] border-ink bg-paper-2" aria-label="Recent losses">
          <div className="grid grid-cols-[70px_1fr_110px] gap-2.5 py-2.5 px-3.5 bg-ink text-paper font-mono text-[10px] tracking-[0.14em] uppercase">
            <div>DATE</div>
            <div>INCIDENT</div>
            <div>EST. LOSS</div>
          </div>
          {LEDGER.map(([date, desc, amt], i) => (
            <div
              key={i}
              className={
                'grid grid-cols-[70px_1fr_110px] gap-2.5 py-3 px-3.5 font-mono text-[12px] items-center ' +
                (i < LEDGER.length - 1 ? 'border-b border-dotted border-ink/20' : '')
              }
            >
              <div className="text-muted text-[11px]">{date}</div>
              <div className="text-ink">{desc}</div>
              <div className="text-right font-bold text-danger">{amt}</div>
            </div>
          ))}
          <div className="grid grid-cols-[1fr_auto] py-3 px-3.5 border-t-[1.5px] border-ink font-mono text-[12px]" style={{ background: 'rgba(11,11,11,0.06)' }}>
            <span>TOTAL REPORTED — FEB ➜ APR 2026</span>
            <b className="font-bold text-danger">$8.3M+</b>
          </div>
        </div>
      </div>
    </section>
  );
}
