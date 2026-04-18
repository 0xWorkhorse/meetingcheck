export function TopNav() {
  return (
    <nav className="grid grid-cols-[auto_1fr_auto] items-center gap-5 py-[18px] px-7 max-w-[1320px] mx-auto border-b border-ink">
      <a href="#top" className="flex items-center gap-2.5 no-underline hover:bg-transparent hover:text-ink">
        <span className="w-[34px] h-[34px] border-[1.5px] border-ink bg-ink text-paper grid place-items-center font-mono font-bold text-[18px] rounded-full leading-none">
          ✓
        </span>
        <span className="flex flex-col leading-[1.05]">
          <span className="font-display font-bold text-[22px] tracking-[-0.02em]">MEETINGCHECK</span>
          <span className="font-mono text-[10px] tracking-[0.12em] text-muted -mt-[3px] uppercase font-medium">
            v3.2 — link verifier
          </span>
        </span>
      </a>

      <ul className="flex gap-[22px] list-none m-0 p-0 justify-center flex-wrap">
        {[
          ['#checker',  'Check a link'],
          ['#problem',  'The problem'],
          ['#how',      'How it works'],
          ['#verdicts', 'Verdicts'],
        ].map(([href, label]) => (
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
        <a href="#checker" className="mc-btn">Extension</a>
        <a href="#checker" className="mc-btn mc-btn-solid">Paste a link →</a>
      </div>
    </nav>
  );
}
