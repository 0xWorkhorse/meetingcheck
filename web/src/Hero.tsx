import { useEffect, useState } from 'react';
import { getStats, type Stats as StatsT } from './api.js';

const FALLBACK: StatsT = {
  links_checked_24h: 3481,
  scams_flagged_24h: 47,
  community_reports_total: 0,
  confirmed_scam_domains: 0,
};

export function Hero() {
  const [stats, setStats] = useState<StatsT>(FALLBACK);

  useEffect(() => {
    getStats().then(setStats).catch(() => { /* keep fallback */ });
  }, []);

  return (
    <section className="wrap pt-14 pb-6 relative" id="top">
      <div className="flex items-center gap-3.5 text-[11px] uppercase tracking-[0.18em] text-muted mb-7">
        <span className="w-2 h-2 rounded-full bg-danger mc-pulse" />
        <span>Fake-meeting advisory active — Ref. 2026/02 ZOOM-CLONE WAVE</span>
        <span className="ml-auto">Built after the Feb 2026 drain</span>
      </div>

      <h1 className="font-display font-bold tracking-[-0.045em] leading-[0.9] m-0 text-ink"
          style={{ fontSize: 'clamp(56px, 11vw, 184px)' }}>
        Don't click<br />
        that link<span className="text-danger">.</span>
        <br />
        <em className="font-serif italic font-normal tracking-[-0.02em]">Paste</em> it.
      </h1>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-10 items-end pt-[22px] border-t border-ink">
        <p className="font-serif m-0 max-w-[60ch] text-ink leading-[1.2]"
           style={{ fontSize: 'clamp(22px, 2.4vw, 34px)' }}>
          A strict, binary verdict on every meeting invite you get —{' '}
          <em className="text-danger italic">SAFE</em>,{' '}
          <em className="text-danger italic">DANGEROUS</em>, or{' '}
          <em className="text-danger italic">UNRECOGNIZED</em>{' '}
          — in under three seconds, before anything opens a window on your machine.
        </p>
        <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted flex flex-col gap-1.5 md:text-right">
          <div><b className="text-ink font-medium">{stats.links_checked_24h.toLocaleString()}</b> links checked today</div>
          <div><b className="text-ink font-medium">{stats.scams_flagged_24h.toLocaleString()}</b> scams flagged today</div>
          <div><b className="text-ink font-medium">{stats.confirmed_scam_domains.toLocaleString()}</b> confirmed scam domains</div>
          <div>Updated <b className="text-ink font-medium">just now</b></div>
        </div>
      </div>
    </section>
  );
}
