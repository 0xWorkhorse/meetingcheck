import { useCallback, useState } from 'react';
import { reportUrl } from './api.js';
import { useLocale } from './i18n/LocaleContext.js';
import { Turnstile } from './Turnstile.js';

export function ReportForm({ initialUrl = '' }: { initialUrl?: string }) {
  const { t, locale } = useLocale();
  const [url, setUrl] = useState(initialUrl);
  const [context, setContext] = useState('');
  const [receivedFrom, setReceivedFrom] = useState('other');
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState('');

  const turnstileRequired = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY);
  const handleToken = useCallback((token: string) => setTurnstileToken(token), []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (honeypot) return;
    if (turnstileRequired && !turnstileToken) {
      setError(t.report.needsChallenge);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await reportUrl(
        {
          url,
          context,
          received_from: receivedFrom,
          ...(turnstileToken ? { turnstile_token: turnstileToken } : {}),
        },
        locale,
      );
      setDone(res.report_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.report.failed);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="border-[1.5px] border-safe bg-safe/10 text-safe p-3 font-mono text-[12px] uppercase tracking-[0.08em]">
        {t.report.queued} <code className="font-mono">{done}</code>
      </div>
    );
  }

  const labelCls = 'block font-mono text-[10px] tracking-[0.14em] uppercase text-muted mb-1';
  const inputCls =
    'w-full bg-paper border-[1.5px] border-ink px-3 py-2 font-mono text-[13px] text-ink outline-none focus:bg-paper-2';

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className={labelCls} htmlFor="rpt-url">{t.report.url}</label>
        <input
          id="rpt-url"
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t.report.urlPlaceholder}
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls} htmlFor="rpt-source">{t.report.source}</label>
        <select
          id="rpt-source"
          value={receivedFrom}
          onChange={(e) => setReceivedFrom(e.target.value)}
          className={inputCls}
        >
          <option value="telegram">{t.report.sourceTelegram}</option>
          <option value="email">{t.report.sourceEmail}</option>
          <option value="dm">{t.report.sourceDm}</option>
          <option value="calendar">{t.report.sourceCalendar}</option>
          <option value="other">{t.report.sourceOther}</option>
        </select>
      </div>
      <div>
        <label className={labelCls} htmlFor="rpt-ctx">{t.report.context}</label>
        <textarea
          id="rpt-ctx"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          rows={3}
          placeholder={t.report.contextPlaceholder}
          className={inputCls}
        />
      </div>
      <label className="sr-only" aria-hidden="true">
        Don't fill this
        <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </label>
      <Turnstile onToken={handleToken} />
      {error && <div className="font-mono text-[11px] text-danger uppercase tracking-[0.1em]">{error}</div>}
      <button
        type="submit"
        disabled={submitting}
        className="mc-btn mc-btn-danger disabled:opacity-60"
      >
        {submitting ? t.report.submitting : t.report.submit}
      </button>
    </form>
  );
}
