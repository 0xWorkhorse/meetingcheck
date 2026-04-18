/**
 * Ambient declaration for the userland `punycode` package's ES module subpath.
 * The shipping @types/punycode only covers the bare specifier; we import the
 * subpath explicitly to force Node to pick node_modules over its deprecated
 * built-in `punycode` module.
 */
declare module 'punycode/punycode.es6.js' {
  export function toUnicode(input: string): string;
  export function toASCII(input: string): string;
  const _default: { toUnicode: (s: string) => string; toASCII: (s: string) => string };
  export default _default;
}
