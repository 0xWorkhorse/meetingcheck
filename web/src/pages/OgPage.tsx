import { useEffect } from 'react';
import type { CheckResponse } from '../api.js';
import { useLocale } from '../i18n/LocaleContext.js';
import { SignalsPanel } from '../components/checker/SignalsPanel.js';
import { VerdictPanel } from '../components/checker/VerdictPanel.js';
import { deriveSignals } from '../components/checker/logic.js';

/**
 * Dedicated Open Graph page. Renders the verifier shell at exactly 1200×630
 * in an "after-verdict" state for https://uswebzoomus.com/zoom so the OG
 * image stays in sync with the actual UI on every build.
 *
 * Playwright navigates here during `npm run generate:og`, waits for
 * `data-og-ready="true"` on the outer frame, and screenshots at 1200×630.
 * This page is never linked anywhere user-facing; a noindex meta is added
 * at mount time as belt-and-suspenders.
 *
 * Fixed mock CheckResponse — matches the real /v1/check response shape so
 * the same components (SignalsPanel, VerdictPanel, deriveSignals) can render
 * it identically to a live verdict.
 */

const MOCK_RESULT: CheckResponse = {
  verdict: 'DANGEROUS',
  confidence: 0.98,
  titleKey: 'title.dangerous.impersonation',
  reasonKey: 'reason.dangerous.impersonation',
  hostname: 'uswebzoomus.com',
  registrableDomain: 'uswebzoomus.com',
  title: 'Almost certainly a scam',
  reason:
    "This domain is trying to look like a real meeting service but is not on the official list. This matches the exact pattern used in the Feb 2026 fake-Zoom campaigns. Do not open this link.",
  locale: 'en',
  signals: [
    { id: 'hostname', level: 'info', params: { host: 'uswebzoomus.com' }, label: 'Domain', detail: 'uswebzoomus.com' },
    { id: 'brand_impersonation', level: 'critical', brand: 'zoom', params: { token: 'zoom', brand: 'zoom' }, label: 'Impersonation', detail: 'contains "zoom" but is not on the official zoom domain list' },
  ],
  resolved_hostname: 'uswebzoomus.com',
  redirect_chain: ['https://uswebzoomus.com/zoom'],
  expansion_timed_out: false,
  scanned_at: '2026-04-18T02:53:49Z',
  community_report_count: 47,
  community_status: 'confirmed',
  cert_age_days: 3,
  cert_checked: true,
  homoglyph_non_ascii: false,
  homoglyph_punycode: false,
  homoglyph_decoded: 'uswebzoomus.com',
  hosting_country: 'RU',
  hosting_ip: '185.220.101.42',
  hosting_checked: true,
  whois_age_days: 5,
  whois_checked: true,
};

const SESSION = '0x2026';

export function OgPage() {
  const { t } = useLocale();

  // Inject noindex for this route without affecting the marketing head.
  useEffect(() => {
    const existing = document.querySelector('meta[name="robots"]');
    if (existing) existing.setAttribute('content', 'noindex, nofollow');
    else {
      const m = document.createElement('meta');
      m.name = 'robots';
      m.content = 'noindex, nofollow';
      document.head.appendChild(m);
    }
    document.title = 'Meetingcheck · OG preview';
  }, []);

  const rows = deriveSignals(MOCK_RESULT, t);

  return (
    <div
      data-og-ready="true"
      style={{ width: 1200, height: 630 }}
      className="bg-paper text-ink relative flex items-center justify-center overflow-hidden"
    >
      {/* Wordmark — bottom-right corner, subtle but branded */}
      <div className="absolute bottom-5 right-6 font-display font-bold text-[18px] tracking-[-0.02em] text-ink">
        meetingcheck.io
      </div>

      {/* Shell — narrower than real site so the 1200×630 frame has breathing room */}
      <div className="w-[1100px] border-[1.5px] border-ink bg-paper-2">
        {/* Terminal bar */}
        <div className="flex items-center justify-between py-2 px-3.5 bg-ink text-paper font-mono text-[11px] tracking-[0.1em] uppercase">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-danger border border-danger" />
            <span className="w-2.5 h-2.5 rounded-full bg-warn   border border-warn" />
            <span className="w-2.5 h-2.5 rounded-full bg-safe   border border-safe" />
          </div>
          <div>{t.checker.shellTitle}</div>
          <div>{t.checker.sessionLabel}&nbsp;&nbsp;{SESSION}</div>
        </div>

        {/* Two-column body */}
        <div className="grid grid-cols-[1fr_440px]">
          {/* Left: url display + signals (all revealed) */}
          <div className="p-6 border-r-[1.5px] border-ink flex flex-col gap-3">
            <label className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted">
              {t.checker.pasteMeetingUrl}
            </label>
            <div className="border-[1.5px] border-ink bg-paper px-[18px] py-3 font-mono text-[15px] text-ink">
              https://uswebzoomus.com/zoom
            </div>
            <SignalsPanel rows={rows} revealedIndex={rows.length - 1} t={t} />
          </div>

          {/* Right: verdict */}
          <VerdictPanel
            result={MOCK_RESULT}
            loading={false}
            revealed={rows.length}
            showReport={false}
            onOpenReport={() => { /* no-op in OG capture */ }}
            initialReportUrl="https://uswebzoomus.com/zoom"
            t={t}
          />
        </div>
      </div>
    </div>
  );
}
