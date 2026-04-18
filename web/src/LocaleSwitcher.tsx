import { useLocale } from './LocaleContext.js';
import { UI_LOCALE_NAMES, type UiLocale } from './i18n.js';

export function LocaleSwitcher() {
  const { locale, setLocale, t } = useLocale();
  return (
    <label className="inline-flex items-center gap-1.5 text-[10px] text-muted font-mono uppercase tracking-[0.1em]">
      <span className="sr-only">{t.localeLabel}</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as UiLocale)}
        className="bg-paper border border-ink px-1.5 py-0.5 text-ink font-mono text-[10px] uppercase"
        aria-label={t.localeLabel}
      >
        {Object.entries(UI_LOCALE_NAMES).map(([code, name]) => (
          <option key={code} value={code}>{name}</option>
        ))}
      </select>
    </label>
  );
}
