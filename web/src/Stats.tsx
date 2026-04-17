import { useEffect, useState } from 'react';
import { getStats, type Stats as StatsT } from './api.js';
import { useLocale } from './LocaleContext.js';

const FALLBACK: StatsT = {
  links_checked_24h: 0,
  scams_flagged_24h: 0,
  community_reports_total: 0,
  confirmed_scam_domains: 0,
};

export function Stats() {
  const { t, locale } = useLocale();
  const [stats, setStats] = useState<StatsT>(FALLBACK);

  useEffect(() => {
    getStats().then(setStats).catch(() => { /* fallback stays */ });
  }, []);

  const items: Array<[string, number]> = [
    [t.stats.linksChecked, stats.links_checked_24h],
    [t.stats.scamsFlagged, stats.scams_flagged_24h],
    [t.stats.reports, stats.community_reports_total],
    [t.stats.confirmed, stats.confirmed_scam_domains],
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="text-2xl font-semibold">{value.toLocaleString(locale)}</div>
          <div className="text-xs text-neutral-400 mt-1">{label}</div>
        </div>
      ))}
    </div>
  );
}
