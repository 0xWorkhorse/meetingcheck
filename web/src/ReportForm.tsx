import { useCallback, useState } from 'react';
import { reportUrl } from './api.js';
import { useLocale } from './LocaleContext.js';
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
      setError('Please complete the challenge.');
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
      setError(err instanceof Error ? err.message : 'failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-safe/30 bg-safe/10 p-4 text-safe">
        {t.report.queued} <code className="font-mono">{done}</code>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="text-sm text-neutral-400">{t.report.url}</span>
        <input
          type="url"
          required
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder={t.report.urlPlaceholder}
          className="mt-1 w-full rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2 font-mono text-sm focus:border-neutral-600 outline-none"
        />
      </label>
      <label className="block">
        <span className="text-sm text-neutral-400">{t.report.source}</span>
        <select
          value={receivedFrom}
          onChange={e => setReceivedFrom(e.target.value)}
          className="mt-1 w-full rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2"
        >
          <option value="telegram">{t.report.sourceTelegram}</option>
          <option value="email">{t.report.sourceEmail}</option>
          <option value="dm">{t.report.sourceDm}</option>
          <option value="calendar">{t.report.sourceCalendar}</option>
          <option value="other">{t.report.sourceOther}</option>
        </select>
      </label>
      <label className="block">
        <span className="text-sm text-neutral-400">{t.report.context}</span>
        <textarea
          value={context}
          onChange={e => setContext(e.target.value)}
          rows={3}
          placeholder={t.report.contextPlaceholder}
          className="mt-1 w-full rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm"
        />
      </label>
      <label className="sr-only" aria-hidden="true">
        Don't fill this
        <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} />
      </label>
      <Turnstile onToken={handleToken} />
      {error && <div className="text-danger text-sm">{error}</div>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-danger/90 hover:bg-danger px-4 py-2 text-white font-medium disabled:opacity-50"
      >
        {submitting ? t.report.submitting : t.report.submit}
      </button>
    </form>
  );
}
