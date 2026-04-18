import { LocaleSwitcher } from './LocaleSwitcher.js';

export function Footer() {
  return (
    <footer className="wrap mt-15 pt-10 pb-7 border-t-[3px] border-double border-ink" id="feed">
      <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-10">
        <div>
          <div className="font-display font-bold tracking-[-0.03em] leading-[0.95] text-[46px]">
            Paste first. <em className="font-serif italic font-normal">Click</em> second.
          </div>
          <p className="font-mono text-[12px] leading-[1.7] mt-4 max-w-[36ch] text-ink-2">
            A free public utility. No sign-up. No tracking. Your pasted URL never leaves our checker in a form that
            identifies you.
          </p>
          <a href="#checker" className="mc-btn mc-btn-solid mt-2">Check a link now →</a>
        </div>
        <FooterCol
          heading="Product"
          links={[
            ['#checker', 'Web checker'],
            ['#',        'Browser extension'],
          ]}
        />
        <FooterCol
          heading="Community"
          links={[
            ['#checker', 'Report a link'],
          ]}
        />
      </div>

      <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-muted mt-7 flex flex-col md:flex-row md:justify-between gap-3 pt-[18px] border-t border-ink">
        <span>© 2026 MEETINGCHECK.IO — a public utility</span>
        <span>▲ set in Space Grotesk / Instrument Serif / JetBrains Mono</span>
        <div className="flex items-center gap-3">
          <span>built in a weekend, updated hourly</span>
          <LocaleSwitcher />
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ heading, links }: { heading: string; links: Array<[string, string]> }) {
  return (
    <div>
      <h4 className="font-mono text-[11px] tracking-[0.14em] uppercase m-0 mb-3 text-muted">{heading}</h4>
      <ul className="list-none p-0 m-0 grid gap-2">
        {links.map(([href, label]) => (
          <li key={label}>
            <a href={href} className="font-mono text-[12px] uppercase tracking-[0.04em]">{label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
