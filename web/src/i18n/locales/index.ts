import type { Locale, LocaleInfo, UiMessages } from '../types.js';
import { en } from './en.js';
import { es } from './es.js';

/**
 * Registered locales. To add a new language:
 *   1. Copy en.ts to locales/<code>.ts and translate every string.
 *   2. Import it here and add it to both maps.
 *   3. Add the code to `Locale` in ../types.ts.
 *
 * LocaleInfo.name uses the language's *native* spelling (per W3C
 * accessibility guidance) so the picker reads naturally to speakers.
 */
export const LOCALES: Record<Locale, UiMessages> = { en, es };

export const LOCALE_INFO: Record<Locale, LocaleInfo> = {
  en: { code: 'en', name: 'English',  dir: 'ltr' },
  es: { code: 'es', name: 'Español',  dir: 'ltr' },
};

export const LOCALE_LIST: Locale[] = ['en', 'es'];

export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(x: unknown): x is Locale {
  return typeof x === 'string' && x in LOCALES;
}
