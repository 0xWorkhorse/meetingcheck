import { useLocale } from './LocaleContext.js';
import { LOCALE_INFO, LOCALE_LIST } from './locales/index.js';
import type { Locale } from './types.js';

export function LocaleSwitcher() {
  const { locale, setLocale, t } = useLocale();
  return (
    <label className="inline-flex items-center gap-1.5 text-[10px] text-muted font-mono uppercase tracking-[0.1em]">
      <span className="sr-only">{t.localeLabel}</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="bg-paper border border-ink px-1.5 py-0.5 text-ink font-mono text-[10px] uppercase"
        aria-label={t.localeLabel}
      >
        {LOCALE_LIST.map((code) => (
          <option key={code} value={code}>
            {LOCALE_INFO[code].name}
          </option>
        ))}
      </select>
    </label>
  );
}
