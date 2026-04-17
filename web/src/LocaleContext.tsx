import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { detectLocale, persistLocale, UI_LOCALES, type UiLocale, type UiMessages } from './i18n.js';

interface Ctx {
  locale: UiLocale;
  t: UiMessages;
  setLocale: (l: UiLocale) => void;
}

const LocaleContext = createContext<Ctx | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<UiLocale>(() => detectLocale());

  const value = useMemo<Ctx>(() => ({
    locale,
    t: UI_LOCALES[locale],
    setLocale: (l) => {
      persistLocale(l);
      setLocaleState(l);
      document.documentElement.lang = l;
    },
  }), [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Ctx {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
