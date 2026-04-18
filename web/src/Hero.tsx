import { useEffect, useState } from 'react';
import { getStats, type Stats as StatsT } from './api.js';
import { useLocale } from './i18n/LocaleContext.js';
import { format, formatNumber } from './i18n/format.js';

const FALLBACK: StatsT = {
  links_checked_24h: 0,
  scams_flagged_24h: 0,
  links_checked_total: 0,
  scams_flagged_total: 0,
  community_reports_total: 0,
  confirmed_scam_domains: 0,
};

export function Hero() {
  const { t, locale } = useLocale();
  const [stats, setStats] = useState<StatsT>(FALLBACK);

  useEffect(() => {
    getStats().then(setStats).catch(() => { /* keep fallback */ });
  }, []);

  return (
    <section className="wrap pt-10 pb-6 relative" id="top">
      <h1 className="font-display font-bold tracking-[-0.045em] leading-[0.9] m-0 text-ink"
          style={{ fontSize: 'clamp(56px, 11vw, 184px)' }}>
        {format(t.hero.headlineLine1, {
          paste: t.hero.headlinePaste,
          period: <span className="text-danger">.</span>,
        })}
        <br />
        {format(t.hero.headlineLine2, {
          click: <em className="font-serif italic font-normal tracking-[-0.02em]">{t.hero.headlineClick}</em>,
        })}
      </h1>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-10 items-end pt-[22px] border-t border-ink">
        <p className="font-serif m-0 max-w-[60ch] text-ink leading-[1.2]"
           style={{ fontSize: 'clamp(22px, 2.4vw, 34px)' }}>
          {format(t.hero.subBody, {
            safe:         <em className="text-danger italic">{t.verdictWords.safe}</em>,
            dangerous:    <em className="text-danger italic">{t.verdictWords.dangerous}</em>,
            unrecognized: <em className="text-danger italic">{t.verdictWords.unrecognized}</em>,
          })}
        </p>
        <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted flex flex-col gap-1.5 md:text-right">
          <div><b className="text-ink font-medium">{formatNumber(stats.links_checked_total, locale)}</b> {t.hero.statLinksChecked}</div>
          <div><b className="text-ink font-medium">{formatNumber(stats.scams_flagged_total, locale)}</b> {t.hero.statScamsFlagged}</div>
          <div><b className="text-ink font-medium">{formatNumber(stats.confirmed_scam_domains, locale)}</b> {t.hero.statConfirmed}</div>
          <div>
            {format(t.hero.statUpdated, {
              value: <b className="text-ink font-medium">{t.hero.statJustNow}</b>,
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
