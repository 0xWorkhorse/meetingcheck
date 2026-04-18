# i18n

The UI is fully localized via a typed message dictionary. The English
file (`locales/en.ts`) is the source of truth.

## Architecture

```
i18n/
  types.ts              UiMessages interface, Locale union
  format.tsx            format() helper — splices {tokens} with strings or React nodes
  LocaleContext.tsx     <LocaleProvider> + useLocale() hook; syncs <html lang> and <html dir>
  LocaleSwitcher.tsx    dropdown picker (renders native language names)
  locales/
    en.ts               English — source of truth
    es.ts               Spanish
    index.ts            registry: LOCALES, LOCALE_INFO, LOCALE_LIST, DEFAULT_LOCALE
```

Every user-facing string lives in a locale file. Components call
`useLocale()` to get the typed `t` object, then read e.g. `t.hero.kicker`.
TypeScript enforces the shape — a missing key in a new locale file
fails the build.

## Add a new language

1. **Copy the source.**
   ```sh
   cp src/i18n/locales/en.ts src/i18n/locales/pt.ts
   ```

2. **Translate every string** in `pt.ts`. Keep all `{token}` placeholders
   intact — they're spliced at render time with strings or React nodes.

3. **Register it** in three spots:

   `src/i18n/types.ts`
   ```ts
   export type Locale = 'en' | 'es' | 'pt';
   ```

   `src/i18n/locales/index.ts`
   ```ts
   import { pt } from './pt.js';

   export const LOCALES: Record<Locale, UiMessages> = { en, es, pt };
   export const LOCALE_INFO: Record<Locale, LocaleInfo> = {
     en: { code: 'en', name: 'English',    dir: 'ltr' },
     es: { code: 'es', name: 'Español',    dir: 'ltr' },
     pt: { code: 'pt', name: 'Português',  dir: 'ltr' },
   };
   export const LOCALE_LIST: Locale[] = ['en', 'es', 'pt'];
   ```

4. **Build.** `npm --workspace web run build` will fail loudly if any key
   is missing from the new file. Fix the errors and you're done — the
   language appears in the picker, `<html lang>` updates on selection,
   and the whole UI translates.

## RTL

For right-to-left languages (Arabic, Hebrew, Persian, Urdu), set
`dir: 'rtl'` on the `LocaleInfo`. The context applies it to `<html>`
and the browser handles bidi automatically. Layout classes that use
physical L/R (`pl-*`, `ml-*`, etc.) may need a visual audit when the
first RTL locale lands — replacing with logical properties (`ps-*`,
`ms-*`) is the cleanest fix.

## Interpolation

The `format()` helper splices `{tokens}`. Values can be strings,
numbers, or React nodes — useful for inline emphasis without
breaking up the translation string:

```tsx
// locale file
headlineLine1: '{paste} first{period}',

// component
format(t.hero.headlineLine1, {
  paste:  'Paste',
  period: <span className="text-danger">.</span>,
})
```

Unknown tokens render as literal `{name}` so missing values surface
loudly during development.

## Numbers

`formatNumber(n, locale)` wraps `Intl.NumberFormat`. Use it for every
displayed count so "1,234" becomes "1.234" in German, etc.

## Pluralization

Not implemented. The current corpus has no plural-sensitive strings.
If one appears, wire it through `Intl.PluralRules` per-locale rather
than hand-rolling English assumptions (many languages have 3+ plural
forms).

## What's *not* translated

- Brand marks (`MEETINGCHECK`, terminal shell title).
- URLs and domain names (`zoom.us`, `zoom-invite.app`).
- Session IDs and timestamps (generated).
- Decorative ASCII art (`0101 0111 1100`).
- Ledger placeholder content (tagged for replacement with real data).
