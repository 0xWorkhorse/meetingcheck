import { useEffect, useRef, useState } from 'react';
import { ThemeToggle } from './ThemeToggle.js';
import { LocaleSwitcher } from './i18n/LocaleSwitcher.js';
import { useLocale } from './i18n/LocaleContext.js';

export function TopNav() {
  const { t } = useLocale();
  const navLinks: Array<[string, string]> = [
    ['#checker',  t.nav.checkALink],
    ['#how',      t.nav.howItWorks],
    ['#verdicts', t.nav.verdicts],
  ];

  return (
    <nav className="grid grid-cols-[auto_1fr_auto] items-center gap-5 py-[18px] px-7 max-w-[1320px] mx-auto border-b border-ink">
      <a href="#top" className="flex items-center gap-2.5 no-underline hover:bg-transparent hover:text-ink">
        <span className="w-[34px] h-[34px] border-[1.5px] border-ink bg-ink text-paper grid place-items-center font-mono font-bold text-[18px] rounded-full leading-none">
          ✓
        </span>
        <span className="flex flex-col leading-[1.05]">
          <span className="font-display font-bold text-[22px] tracking-[-0.02em]">MEETINGCHECK</span>
          <span className="font-mono text-[10px] tracking-[0.12em] text-muted -mt-[3px] uppercase font-medium">
            {t.nav.tagline}
          </span>
        </span>
      </a>

      <ul className="flex gap-[22px] list-none m-0 p-0 justify-center flex-wrap">
        {navLinks.map(([href, label]) => (
          <li key={href}>
            <a
              href={href}
              className="font-mono text-[12px] uppercase tracking-[0.08em] no-underline"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>

      <div className="flex gap-2.5 items-center">
        <LocaleSwitcher />
        <ThemeToggle />
        <ExtensionButton label={t.nav.extension} popoverMessage={t.nav.extensionPopover} />
        <a href="#checker" className="mc-btn mc-btn-solid">{t.nav.pasteALink}</a>
      </div>
    </nav>
  );
}

/**
 * Not-yet-shipped extension CTA. Clicking reveals a small serif popover
 * announcing the work-in-progress status; clicking again (or waiting 3.5s,
 * or clicking outside) dismisses it.
 */
function ExtensionButton({ label, popoverMessage }: { label: string; popoverMessage: string }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const autoClose = window.setTimeout(() => setOpen(false), 3500);
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(autoClose);
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        className="mc-btn"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {label}
      </button>
      {open && (
        <div
          role="status"
          className="absolute right-0 top-[calc(100%+8px)] border-[1.5px] border-ink bg-paper text-ink px-4 py-3 font-serif italic text-[16px] whitespace-nowrap shadow-[4px_4px_0_rgb(var(--ink))] z-20"
        >
          {popoverMessage}
        </div>
      )}
    </div>
  );
}
