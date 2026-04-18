import { LocaleSwitcher } from './i18n/LocaleSwitcher.js';
import { useLocale } from './i18n/LocaleContext.js';
import { format } from './i18n/format.js';

export function Footer() {
  const { t } = useLocale();

  return (
    <footer className="wrap mt-15 pt-10 pb-7 border-t-[3px] border-double border-ink" id="feed">
      <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-10">
        <div>
          <div className="font-display font-bold tracking-[-0.03em] leading-[0.95] text-[46px]">
            {format(t.footer.tagline, {
              click: <em className="font-serif italic font-normal">{t.footer.taglineClick}</em>,
            })}
          </div>
          <p className="font-mono text-[12px] leading-[1.7] mt-4 max-w-[36ch] text-ink-2">
            {t.footer.body}
          </p>
          <a href="#checker" className="mc-btn mc-btn-solid mt-2">{t.footer.cta}</a>
        </div>
        <FooterCol
          heading={t.footer.productHeading}
          links={[
            ['#checker', t.footer.webChecker],
            ['#',        t.footer.browserExtension],
          ]}
        />
        <FooterCol
          heading={t.footer.communityHeading}
          links={[
            ['#checker', t.footer.reportALink],
          ]}
        />
      </div>

      <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-muted mt-7 flex flex-col md:flex-row md:justify-between gap-3 pt-[18px] border-t border-ink">
        <span>
          {format(t.footer.credit, {
            team: <a href="https://themathteam.io" target="_blank" rel="noopener noreferrer">The Math Team</a>,
            author: <a href="https://x.com/0xWorkhorse" target="_blank" rel="noopener noreferrer">@0xWorkhorse</a>,
          })}
        </span>
        <LocaleSwitcher />
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
