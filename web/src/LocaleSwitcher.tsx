import { useLocale } from './LocaleContext.js';
import { UI_LOCALE_NAMES, type UiLocale } from './i18n.js';

export function LocaleSwitcher() {
  const { locale, setLocale, t } = useLocale();
  return (
    <label className="inline-flex items-center gap-2 text-xs text-neutral-400">
      <span className="sr-only">{t.localeLabel}</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as UiLocale)}
        className="bg-neutral-900 border border-neutral-800 rounded-md px-2 py-1 text-neutral-300"
        aria-label={t.localeLabel}
      >
        {Object.entries(UI_LOCALE_NAMES).map(([code, name]) => (
          <option key={code} value={code}>{name}</option>
        ))}
      </select>
    </label>
  );
}
