import { useLocale } from './LocaleContext.js';
import { LOCALE_INFO, LOCALE_LIST } from './locales/index.js';
import type { Locale } from './types.js';

export function LocaleSwitcher() {
  const { locale, setLocale, t } = useLocale();
  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      className="mc-select"
      aria-label={t.localeLabel}
    >
      {LOCALE_LIST.map((code) => (
        <option key={code} value={code}>
          {LOCALE_INFO[code].name}
        </option>
      ))}
    </select>
  );
}
