/**
 * Visual-homograph resolution.
 *
 * Two-stage: (1) decode any punycode label (xn--...) back to its Unicode form so
 * we can see what the attacker actually rendered in the address bar, then (2)
 * fold look-alike characters from Cyrillic / Greek / full-width Latin back to
 * plain ASCII so the resulting "skeleton" can be compared to the official
 * allowlist and brand tokens.
 *
 * This is intentionally narrow: only the high-value confusables that have shown
 * up in phishing corpora. Full Unicode confusables coverage is a bigger project
 * (see Unicode TR-39); this table handles the realistic adversarial cases.
 */

// Userland punycode package — works in browsers and Node. Importing the
// explicit file path avoids Node's bare-specifier resolution preferring the
// deprecated built-in `punycode` module over our node_modules install.
import punycode from 'punycode/punycode.es6.js';

/**
 * Map of visually-confusable code points to their ASCII equivalents.
 * Covers Cyrillic, Greek, and a handful of full-width Latin characters.
 */
const CONFUSABLE: Record<string, string> = {
  // Cyrillic lowercase
  'а': 'a', 'б': '6', 'в': 'b', 'г': 'r', 'д': 'd', 'е': 'e', 'ё': 'e',
  'з': '3', 'и': 'u', 'й': 'u', 'к': 'k', 'л': 'n', 'м': 'm', 'н': 'h',
  'о': 'o', 'п': 'n', 'р': 'p', 'с': 'c', 'т': 't', 'у': 'y', 'х': 'x',
  'ч': '4',
  // Cyrillic uppercase (we fold to lowercase before lookup, but keep for completeness)
  'А': 'a', 'В': 'b', 'Е': 'e', 'К': 'k', 'М': 'm', 'Н': 'h', 'О': 'o',
  'Р': 'p', 'С': 'c', 'Т': 't', 'У': 'y', 'Х': 'x',
  // Greek
  'α': 'a', 'β': 'b', 'ε': 'e', 'η': 'n', 'ι': 'i', 'κ': 'k', 'μ': 'u',
  'ν': 'v', 'ο': 'o', 'ρ': 'p', 'τ': 't', 'υ': 'u', 'χ': 'x',
  'Α': 'a', 'Β': 'b', 'Ε': 'e', 'Η': 'h', 'Ι': 'i', 'Κ': 'k', 'Μ': 'm',
  'Ν': 'n', 'Ο': 'o', 'Ρ': 'p', 'Τ': 't', 'Υ': 'y', 'Χ': 'x',
  // Full-width Latin (rare but present)
  'ａ': 'a', 'ｂ': 'b', 'ｃ': 'c', 'ｄ': 'd', 'ｅ': 'e', 'ｆ': 'f', 'ｇ': 'g',
  'ｈ': 'h', 'ｉ': 'i', 'ｊ': 'j', 'ｋ': 'k', 'ｌ': 'l', 'ｍ': 'm', 'ｎ': 'n',
  'ｏ': 'o', 'ｐ': 'p', 'ｑ': 'q', 'ｒ': 'r', 'ｓ': 's', 'ｔ': 't', 'ｕ': 'u',
  'ｖ': 'v', 'ｗ': 'w', 'ｘ': 'x', 'ｙ': 'y', 'ｚ': 'z',
  // Misc single-character homographs
  'ℓ': 'l', '∟': 'l',
};

/**
 * Decode IDN (xn--) labels back to their Unicode representation. If the input
 * has no punycode labels it's returned unchanged.
 */
export function decodeIdn(hostname: string): string {
  if (!hostname.includes('xn--')) return hostname;
  try {
    return punycode.toUnicode(hostname);
  } catch {
    return hostname;
  }
}

/**
 * Produce an ASCII "skeleton" for a hostname: folded lowercase, Cyrillic/Greek
 * look-alikes swapped to their Latin equivalents. Safe to run on any string.
 */
export function asciiSkeleton(s: string): string {
  const lower = s.toLowerCase();
  let out = '';
  for (const ch of lower) {
    out += CONFUSABLE[ch] ?? ch;
  }
  return out;
}

/**
 * One-shot: decode punycode, then produce the ASCII skeleton. If the resulting
 * skeleton differs from the input's ASCII-lowercase form, the hostname used at
 * least one look-alike character (regardless of whether it targeted a brand).
 */
export function decodeAndSkeleton(hostname: string): { decoded: string; skeleton: string; used: boolean } {
  const decoded = decodeIdn(hostname);
  const skeleton = asciiSkeleton(decoded);
  const used = skeleton !== hostname.toLowerCase();
  return { decoded, skeleton, used };
}
