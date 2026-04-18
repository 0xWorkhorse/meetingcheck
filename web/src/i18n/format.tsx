import { Fragment, type ReactNode } from 'react';

/**
 * Splice a template like "Hello {name}, you have {n} messages" with a
 * values map. Values can be strings, numbers, or ReactNodes. The return
 * is ReactNode[] (plain string if no tokens found), ready to render.
 *
 * Unknown tokens are preserved as-is (`{unknown}`) so a missing value
 * surfaces loudly during development instead of silently blanking.
 *
 * Usage:
 *   format('Hello {who}', { who: <strong>world</strong> })
 *   format('FLAGGED {n}×', { n: 23 })
 *   format('© 2026 {team} — built by {author}', {
 *     team: <a href="...">The Math Team</a>,
 *     author: <a href="...">@0xWorkhorse</a>,
 *   })
 */
export function format(template: string, values: Record<string, ReactNode | number> = {}): ReactNode {
  const parts = template.split(/\{(\w+)\}/g);
  // parts alternates: [literal, token, literal, token, ...]
  // If no tokens are present, return the original string so consumers
  // don't get unnecessary Fragments in the tree.
  if (parts.length === 1) return template;

  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 0) {
          return part ? <Fragment key={i}>{part}</Fragment> : null;
        }
        const value = values[part];
        if (value === undefined) return <Fragment key={i}>{`{${part}}`}</Fragment>;
        return <Fragment key={i}>{value}</Fragment>;
      })}
    </>
  );
}

/**
 * Format a number using the current locale.
 * Pass `locale` from useLocale().
 */
export function formatNumber(n: number, locale: string): string {
  try {
    return new Intl.NumberFormat(locale).format(n);
  } catch {
    return String(n);
  }
}
