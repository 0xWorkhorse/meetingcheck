import { useState } from 'react';
import { VerdictCard } from './VerdictCard.js';
import { ReportForm } from './ReportForm.js';
import { Stats } from './Stats.js';
import { LocaleSwitcher } from './LocaleSwitcher.js';
import { checkUrl, type CheckResponse } from './api.js';
import { useLocale } from './LocaleContext.js';

export function App() {
  const { t, locale } = useLocale();
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
      const res = await checkUrl(input, locale);
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
          <a href="/" className="font-mono text-lg font-semibold">meetingcheck</a>
          <nav className="text-sm text-neutral-400 space-x-4 flex items-center">
            <a href="#extension" className="hover:text-neutral-200">{t.nav.extension}</a>
            <LocaleSwitcher />
          </nav>
        </div>
      </header>

      <main className="px-6 py-12">
        <section className="max-w-2xl mx-auto space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{t.hero.title}</h1>
            <p className="text-neutral-400">{t.hero.sub}</p>
          </div>

          <form onSubmit={onCheck} className="flex gap-2">
            <input
              type="url"
              required
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t.hero.placeholder}
              className="flex-1 rounded-md bg-neutral-900 border border-neutral-800 px-4 py-3 font-mono text-sm focus:border-neutral-600 outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-neutral-100 text-neutral-900 px-6 py-3 font-medium hover:bg-white disabled:opacity-50"
            >
              {loading ? t.hero.checking : t.hero.check}
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
                  {t.report.prompt}
                </button>
              )}
              {showReport && <ReportForm initialUrl={result.redirect_chain[0] ?? input} />}
            </div>
          )}
        </section>

        <section className="max-w-3xl mx-auto mt-16 space-y-4">
          <h2 className="text-lg font-semibold">{t.sections.activity}</h2>
          <Stats />
        </section>

        <section className="max-w-3xl mx-auto mt-16 space-y-4">
          <h2 className="text-lg font-semibold">{t.sections.verdicts}</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="rounded-lg border border-safe/30 bg-safe/10 p-4">
              <div className="text-safe font-mono text-xs uppercase">{t.sections.verdictSafe}</div>
              <p className="mt-2 text-neutral-300">{t.sections.verdictSafeBody}</p>
            </div>
            <div className="rounded-lg border border-danger/30 bg-danger/10 p-4">
              <div className="text-danger font-mono text-xs uppercase">{t.sections.verdictDanger}</div>
              <p className="mt-2 text-neutral-300">{t.sections.verdictDangerBody}</p>
            </div>
            <div className="rounded-lg border border-unknown/30 bg-unknown/10 p-4">
              <div className="text-unknown font-mono text-xs uppercase">{t.sections.verdictUnknown}</div>
              <p className="mt-2 text-neutral-300">{t.sections.verdictUnknownBody}</p>
            </div>
          </div>
        </section>

        <section id="extension" className="max-w-3xl mx-auto mt-16 space-y-3">
          <h2 className="text-lg font-semibold">{t.sections.extensionTitle}</h2>
          <p className="text-neutral-400 text-sm">{t.sections.extensionBody}</p>
          <div className="text-neutral-500 text-sm italic">Coming soon.</div>
        </section>

        <section className="max-w-3xl mx-auto mt-16 space-y-3">
          <h2 className="text-lg font-semibold">{t.sections.whyTitle}</h2>
          <p className="text-neutral-400 text-sm">{t.sections.whyBody}</p>
        </section>
      </main>

      <footer className="border-t border-neutral-900 mt-20 py-8 px-6 text-sm text-neutral-500">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-4 justify-between">
          <span>{t.footer.copyright}</span>
          <div className="space-x-4">
            <a href="https://github.com/0xworkhorse/meetingverification" className="hover:text-neutral-300">{t.footer.github}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
