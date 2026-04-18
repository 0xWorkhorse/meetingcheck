const ITEMS = [
  { kind: 'red',  text: '● LIVE THREAT FEED' },
  { kind: null,   text: '47 fake zoom domains reported in the last 24h' },
  { kind: 'sep',  text: '▲' },
  { kind: null,   text: 'wallet drained via spoofed meet.google.ciom — 14 min ago' },
  { kind: 'sep',  text: '▲' },
  { kind: 'y',    text: '⚠ new pattern: calendly-meeting[.]app' },
  { kind: 'sep',  text: '▲' },
  { kind: null,   text: '3,481 links checked today' },
  { kind: 'sep',  text: '▲' },
  { kind: 'red',  text: '● LIVE THREAT FEED' },
  { kind: null,   text: "don't click on it. paste it here." },
  { kind: 'sep',  text: '▲' },
  { kind: null,   text: 'community blocklist updated 00:02 UTC' },
  { kind: 'sep',  text: '▲' },
];

export function Ticker() {
  return (
    <div
      aria-hidden
      className="bg-ink text-paper font-mono text-[12px] tracking-[0.08em] uppercase py-2 overflow-hidden whitespace-nowrap border-b border-ink"
    >
      <div className="ticker-track">
        {ITEMS.concat(ITEMS).map((item, i) => (
          <span
            key={i}
            className={
              'mx-7 ' +
              (item.kind === 'red' ? 'text-[#ff6a58]' : item.kind === 'y' ? 'text-[#ffd347]' : '')
            }
          >
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}
