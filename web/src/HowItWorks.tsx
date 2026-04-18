export function HowItWorks() {
  return (
    <section className="wrap py-[76px]" id="how">
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-10 pb-7 border-b border-ink mb-10 items-end">
        <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted">
          § 02<br />
          <b className="text-ink font-semibold">HOW IT WORKS</b>
        </div>
        <h2 className="font-display font-bold tracking-[-0.035em] leading-[0.95] m-0 text-ink"
            style={{ fontSize: 'clamp(40px, 6vw, 82px)' }}>
          Three seconds. <em className="font-serif italic font-normal">Three</em> checks. One answer.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 rule-double border-b-[3px] border-double border-ink">
        <Step
          num="0"
          numEm="1"
          heading="Paste the link"
          body="Drop the URL from your inbox, Slack, Farcaster, Telegram — wherever it showed up. No account, no extension required."
          mini={{ label: 'INPUT', body: <code className="block break-all">https://zoom-invite.app/j/8472910</code> }}
          isLast={false}
        />
        <Step
          num="0"
          numEm="2"
          heading="We check three things"
          body="Against the official domain registry for Zoom / Meet / Teams / Calendly. Against live certificate transparency logs. Against the community threat feed — updated continuously."
          mini={{
            label: 'TESTS',
            body: (
              <code className="block whitespace-pre">{`▌ official domain ……… ✗ not allowlisted
▌ cert transparency … ✗ issued 2d ago
▌ community feed …… ✗ reported 23×`}</code>
            ),
          }}
          isLast={false}
        />
        <Step
          num="0"
          numEm="3"
          heading="Binary verdict"
          body={
            <>
              Not "risk score 7/10." Not "proceed with caution." One of three words, picked on purpose:{' '}
              <b className="text-safe">SAFE</b>, <b className="text-danger">DANGEROUS</b>, or <b className="text-warn">UNRECOGNIZED</b>.
              Then you decide.
            </>
          }
          mini={{
            label: 'OUTPUT',
            body: (
              <>
                <div className="text-muted text-center my-2">↓</div>
                <div className="font-bold tracking-[0.04em] text-danger">◆ DANGEROUS — do not open</div>
              </>
            ),
          }}
          isLast
        />
      </div>
    </section>
  );
}

function Step({
  num, numEm, heading, body, mini, isLast,
}: {
  num: string;
  numEm: string;
  heading: string;
  body: React.ReactNode;
  mini: { label: string; body: React.ReactNode };
  isLast: boolean;
}) {
  return (
    <div className={'p-9 px-7 relative ' + (isLast ? '' : 'md:border-r md:border-ink border-b md:border-b-0 border-ink')}>
      <div className="font-display font-bold leading-[0.8] tracking-[-0.06em] text-ink mb-5" style={{ fontSize: '96px' }}>
        {num}<em className="font-serif italic font-normal text-danger">{numEm}</em>
      </div>
      <h3 className="font-display font-bold text-[26px] tracking-[-0.02em] m-0 mb-2">{heading}</h3>
      <p className="font-mono text-[13px] leading-[1.6] text-ink-2 m-0 max-w-[34ch]">{body}</p>
      <div className="mt-5 p-3 border border-dashed border-ink bg-paper font-mono text-[11px] leading-[1.55]">
        <span className="block text-[9px] tracking-[0.16em] uppercase text-muted mb-1.5">{mini.label}</span>
        {mini.body}
      </div>
    </div>
  );
}
