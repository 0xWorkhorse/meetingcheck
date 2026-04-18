import type { Locale, LocaleInfo, UiMessages } from '../types.js';
import { en } from './en.js';
import { de } from './de.js';
import { es } from './es.js';
import { fr } from './fr.js';
import { id } from './id.js';
import { ja } from './ja.js';
import { ko } from './ko.js';
import { pt } from './pt.js';
import { ru } from './ru.js';
import { tr } from './tr.js';
import { vi } from './vi.js';
import { zh } from './zh.js';

/**
 * Registered locales. To add a new language:
 *   1. Copy en.ts to locales/<code>.ts and translate every string.
 *   2. Import it here and add it to all three maps/lists.
 *   3. Add the code to `Locale` in ../types.ts.
 *
 * LocaleInfo.name uses the language's *native* spelling (per W3C
 * accessibility guidance) so the picker reads naturally to speakers.
 */
export const LOCALES: Record<Locale, UiMessages> = { en, de, es, fr, id, ja, ko, pt, ru, tr, vi, zh };

export const LOCALE_INFO: Record<Locale, LocaleInfo> = {
  en: { code: 'en', name: 'English',          dir: 'ltr' },
  de: { code: 'de', name: 'Deutsch',          dir: 'ltr' },
  es: { code: 'es', name: 'Español',          dir: 'ltr' },
  fr: { code: 'fr', name: 'Français',         dir: 'ltr' },
  id: { code: 'id', name: 'Bahasa Indonesia', dir: 'ltr' },
  ja: { code: 'ja', name: '日本語',            dir: 'ltr' },
  ko: { code: 'ko', name: '한국어',            dir: 'ltr' },
  pt: { code: 'pt', name: 'Português',        dir: 'ltr' },
  ru: { code: 'ru', name: 'Русский',          dir: 'ltr' },
  tr: { code: 'tr', name: 'Türkçe',           dir: 'ltr' },
  vi: { code: 'vi', name: 'Tiếng Việt',       dir: 'ltr' },
  zh: { code: 'zh', name: '中文',              dir: 'ltr' },
};

/** Dropdown order: English first, then alphabetical by native name. */
export const LOCALE_LIST: Locale[] = [
  'en',
  'id',   // Bahasa Indonesia
  'de',   // Deutsch
  'es',   // Español
  'fr',   // Français
  'pt',   // Português
  'tr',   // Türkçe
  'vi',   // Tiếng Việt
  'ru',   // Русский
  'ja',   // 日本語
  'ko',   // 한국어
  'zh',   // 中文
];

export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(x: unknown): x is Locale {
  return typeof x === 'string' && x in LOCALES;
}
