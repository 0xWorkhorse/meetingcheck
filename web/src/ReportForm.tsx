import { useState } from 'react';
import { reportUrl } from './api.js';

export function ReportForm({ initialUrl = '' }: { initialUrl?: string }) {
  const [url, setUrl] = useState(initialUrl);
  const [context, setContext] = useState('');
  const [receivedFrom, setReceivedFrom] = useState('other');
  const [honeypot, setHoneypot] = useState(''); // bots fill this
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (honeypot) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await reportUrl({ url, context, received_from: receivedFrom });
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
        Thanks — report <code className="font-mono">{done}</code> queued for review.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="text-sm text-neutral-400">Suspicious URL</span>
        <input
          type="url"
          required
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://suspicious-zoom-link.click/..."
          className="mt-1 w-full rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2 font-mono text-sm focus:border-neutral-600 outline-none"
        />
      </label>
      <label className="block">
        <span className="text-sm text-neutral-400">Where did you get it?</span>
        <select
          value={receivedFrom}
          onChange={e => setReceivedFrom(e.target.value)}
          className="mt-1 w-full rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2"
        >
          <option value="telegram">Telegram</option>
          <option value="email">Email</option>
          <option value="dm">X / Twitter DM</option>
          <option value="calendar">Calendar invite</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label className="block">
        <span className="text-sm text-neutral-400">Context (optional)</span>
        <textarea
          value={context}
          onChange={e => setContext(e.target.value)}
          rows={3}
          placeholder="Received from someone claiming to be a VC. Asked me to join a call."
          className="mt-1 w-full rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm"
        />
      </label>
      {/* Honeypot — hidden from users */}
      <label className="sr-only" aria-hidden="true">
        Don't fill this
        <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} />
      </label>
      {error && <div className="text-danger text-sm">{error}</div>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-danger/90 hover:bg-danger px-4 py-2 text-white font-medium disabled:opacity-50"
      >
        {submitting ? 'Submitting…' : 'Submit report'}
      </button>
    </form>
  );
}
