import { useState } from 'react';
import { VerdictCard } from './VerdictCard.js';
import { ReportForm } from './ReportForm.js';
import { Stats } from './Stats.js';
import { checkUrl, type CheckResponse } from './api.js';

export function App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  async function onCheck(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setShowReport(false);
    try {
      const res = await checkUrl(input);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-900 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <a href="/" className="font-mono text-lg font-semibold">isthislinksafe</a>
          <nav className="text-sm text-neutral-400 space-x-4">
            <a href="/threat-feed" className="hover:text-neutral-200">Threat feed</a>
            <a href="#extension" className="hover:text-neutral-200">Extension</a>
          </nav>
        </div>
      </header>

      <main className="px-6 py-12">
        <section className="max-w-2xl mx-auto space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Is this meeting link actually real?
            </h1>
            <p className="text-neutral-400">
              Strict binary verdict on <span className="text-neutral-200">Zoom, Google Meet, Teams, Calendly</span> impersonation.
              Paste the link — 3 seconds.
            </p>
          </div>

          <form onSubmit={onCheck} className="flex gap-2">
            <input
              type="url"
              required
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="https://…"
              className="flex-1 rounded-md bg-neutral-900 border border-neutral-800 px-4 py-3 font-mono text-sm focus:border-neutral-600 outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-neutral-100 text-neutral-900 px-6 py-3 font-medium hover:bg-white disabled:opacity-50"
            >
              {loading ? 'Checking…' : 'Check'}
            </button>
          </form>

          {error && <div className="rounded-md border border-danger/30 bg-danger/10 p-3 text-danger text-sm">{error}</div>}

          {result && (
            <div className="space-y-4">
              <VerdictCard result={result} />
              {(result.verdict === 'DANGEROUS' || result.verdict === 'UNRECOGNIZED') && !showReport && (
                <button
                  onClick={() => setShowReport(true)}
                  className="text-sm text-neutral-400 hover:text-neutral-200 underline"
                >
                  Report this link with more context →
                </button>
              )}
              {showReport && <ReportForm initialUrl={result.resolved_hostname ? result.redirect_chain[0] : input} />}
            </div>
          )}
        </section>

        <section className="max-w-3xl mx-auto mt-16 space-y-4">
          <h2 className="text-lg font-semibold">Today's activity</h2>
          <Stats />
        </section>

        <section className="max-w-3xl mx-auto mt-16 space-y-4">
          <h2 className="text-lg font-semibold">What the three verdicts mean</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="rounded-lg border border-safe/30 bg-safe/10 p-4">
              <div className="text-safe font-mono text-xs uppercase">Safe</div>
              <p className="mt-2 text-neutral-300">Hostname is on our official meeting-service list (zoom.us, meet.google.com, calendly.com, etc.).</p>
            </div>
            <div className="rounded-lg border border-danger/30 bg-danger/10 p-4">
              <div className="text-danger font-mono text-xs uppercase">Dangerous</div>
              <p className="mt-2 text-neutral-300">Subdomain spoof, brand impersonation, typosquat, or confirmed community report.</p>
            </div>
            <div className="rounded-lg border border-unknown/30 bg-unknown/10 p-4">
              <div className="text-unknown font-mono text-xs uppercase">Unrecognized</div>
              <p className="mt-2 text-neutral-300">Not on the official list, no clear impersonation. Do not trust as a meeting link without verifying.</p>
            </div>
          </div>
        </section>

        <section id="extension" className="max-w-3xl mx-auto mt-16 space-y-3">
          <h2 className="text-lg font-semibold">Install the browser extension</h2>
          <p className="text-neutral-400 text-sm">
            Right-click any link → "Check with isthislinksafe". Works in Chrome and Firefox. Minimal permissions.
          </p>
          <div className="flex gap-2">
            <a href="#" className="rounded-md border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm hover:bg-neutral-800">Chrome</a>
            <a href="#" className="rounded-md border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm hover:bg-neutral-800">Firefox</a>
          </div>
        </section>

        <section className="max-w-3xl mx-auto mt-16 space-y-3">
          <h2 className="text-lg font-semibold">Why this exists</h2>
          <p className="text-neutral-400 text-sm">
            In Feb 2026, attackers ran a coordinated fake-Zoom campaign against web3 professionals:
            impersonation domains, meeting-join pages that loaded wallet drainers, all delivered through Telegram and X DMs.
            Generic URL scanners missed most of them. This tool answers one question strictly:
            <span className="text-neutral-200"> is this actually Zoom / Meet / Calendly?</span>
          </p>
        </section>
      </main>

      <footer className="border-t border-neutral-900 mt-20 py-8 px-6 text-sm text-neutral-500">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-4 justify-between">
          <span>© 2026 isthislinksafe</span>
          <div className="space-x-4">
            <a href="https://github.com/0xworkhorse/meetingverification" className="hover:text-neutral-300">GitHub</a>
            <a href="/privacy" className="hover:text-neutral-300">Privacy</a>
            <a href="/threat-feed" className="hover:text-neutral-300">Threat feed</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
