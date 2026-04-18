import { useEffect, useState } from 'react';
import { useLocale } from './i18n/LocaleContext.js';

type Theme = 'light' | 'dark';

function initialTheme(): Theme {
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'dark' || attr === 'light') return attr;
  return 'dark';
}

export function ThemeToggle() {
  const { t } = useLocale();
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('mc-theme', theme); } catch { /* ignore quota/privacy errors */ }
  }, [theme]);

  const next: Theme = theme === 'dark' ? 'light' : 'dark';
  const label = theme === 'dark' ? t.theme.switchToLight : t.theme.switchToDark;

  return (
    <button
      type="button"
      className="mc-icon-btn"
      aria-label={label}
      title={label}
      onClick={() => setTheme(next)}
    >
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  );
}
