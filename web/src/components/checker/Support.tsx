import { useState } from 'react';
import type { UiMessages } from '../../i18n/types.js';

/**
 * Donation addresses are intentionally hardcoded — they're not translated,
 * they're not env-configurable (user-controlled wallets, not per-deploy),
 * and they're public. If they ever need to rotate, edit this file.
 */
const ADDRESSES: ReadonlyArray<{ label: string; address: string }> = [
  {
    label: 'ZEC (shielded)',
    address:
      'u19hykqgkjqemsu65mggyxezdcsyzvtd23rj0e20rmsggmdy2244zk427gj7krjk0w8ltt3lxpjvpelzdl7ct97l637tx55gl9kvxe2l94tvpe9a5rnz48l52hkgr7x23jq5strs5w4rn823caykvaaktcgd9hd2p5xawh6n7aesnjamjn',
  },
  {
    label: 'USDC (EVM)',
    address: '0xC3E9883e8A50519aAF82ac8914cae82aB08A421B',
  },
];

function truncate(addr: string, front = 10, back = 6): string {
  if (addr.length <= front + back + 3) return addr;
  return `${addr.slice(0, front)}…${addr.slice(-back)}`;
}

export function Support({ t }: { t: UiMessages }) {
  return (
    <div className="mt-3 pt-3 border-t border-dotted border-ink/20 flex flex-col gap-2">
      <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted">
        {t.checker.support.heading}
      </div>
      {ADDRESSES.map((a) => (
        <AddressRow key={a.label} label={a.label} address={a.address} t={t} />
      ))}
    </div>
  );
}

function AddressRow({
  label,
  address,
  t,
}: {
  label: string;
  address: string;
  t: UiMessages;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!navigator.clipboard) return;
    navigator.clipboard
      .writeText(address)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => { /* clipboard permission denied; silently ignore */ });
  }

  return (
    <div className="grid grid-cols-[auto_1fr_auto] gap-3 items-center font-mono text-[11px]">
      <span className="text-muted uppercase tracking-[0.1em] text-[10px]">{label}</span>
      <code className="text-ink truncate" title={address}>
        {truncate(address)}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        className="text-[10px] tracking-[0.1em] uppercase py-0.5 px-2 border border-ink hover:bg-ink hover:text-paper cursor-pointer"
        aria-label={`${t.checker.support.copy} ${label}`}
      >
        {copied ? `✓ ${t.checker.support.copied}` : t.checker.support.copy}
      </button>
    </div>
  );
}
