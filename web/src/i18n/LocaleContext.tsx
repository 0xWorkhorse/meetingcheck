import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Locale, UiMessages } from './types.js';
import { DEFAULT_LOCALE, LOCALES, LOCALE_INFO, isLocale } from './locales/index.js';

interface LocaleCtx {
  locale: Locale;
  t: UiMessages;
  setLocale: (l: Locale) => void;
}

const LocaleContext = createContext<LocaleCtx | null>(null);

const STORAGE_KEY = 'mc-locale';

function detectInitial(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && isLocale(stored)) return stored;
  const navLang = navigator.language.split('-')[0].toLowerCase();
  return isLocale(navLang) ? navLang : DEFAULT_LOCALE;
}

/**
 * Syncs `<html lang>` and `<html dir>` to the active locale.
 * Browsers handle bidi text direction from the `dir` attribute; RTL-
 * specific layout tweaks live in CSS via `[dir='rtl'] ...` selectors.
 */
function syncDocumentLang(locale: Locale) {
  if (typeof document === 'undefined') return;
  const info = LOCALE_INFO[locale];
  document.documentElement.setAttribute('lang', locale);
  document.documentElement.setAttribute('dir', info.dir);
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => detectInitial());

  useEffect(() => {
    syncDocumentLang(locale);
    try { localStorage.setItem(STORAGE_KEY, locale); } catch { /* ignore */ }
  }, [locale]);

  const value = useMemo<LocaleCtx>(() => ({
    locale,
    t: LOCALES[locale],
    setLocale: (l: Locale) => setLocaleState(l),
  }), [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleCtx {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used inside <LocaleProvider>');
  return ctx;
}
