import type { CheckResult } from '../detector.js';
import type { FormattedCheckResult, FormattedSignal, Locale, Messages } from './types.js';
import { en } from './en.js';
import { es } from './es.js';

export const LOCALES: Record<string, Locale> = {
  en: { code: 'en', name: 'English', messages: en },
  es: { code: 'es', name: 'Español', messages: es },
};

export const DEFAULT_LOCALE = 'en';

function interp(template: string | undefined, params?: Record<string, string>): string {
  if (template == null) return '';
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`);
}

function message(messages: Messages, key: string, fallback: Messages): string {
  return messages[key] ?? fallback[key] ?? key;
}

export function format(
  result: CheckResult,
  locale: string | Messages = DEFAULT_LOCALE,
): FormattedCheckResult {
  const { messages, code } = resolveMessages(locale);
  const fallback = LOCALES[DEFAULT_LOCALE].messages;

  const signals: FormattedSignal[] = result.signals.map((s) => ({
    ...s,
    label:  interp(message(messages, `signal.${s.id}.label`,  fallback), s.params),
    detail: interp(message(messages, `signal.${s.id}.detail`, fallback), s.params),
  }));

  return {
    ...result,
    signals,
    title:  interp(message(messages, result.titleKey,  fallback), result.reasonParams),
    reason: interp(message(messages, result.reasonKey, fallback), result.reasonParams),
    locale: code,
  };
}

function resolveMessages(locale: string | Messages): { messages: Messages; code: string } {
  if (typeof locale === 'string') {
    const loc = LOCALES[locale] ?? LOCALES[DEFAULT_LOCALE];
    return { messages: loc.messages, code: loc.code };
  }
  return { messages: locale, code: 'custom' };
}

/**
 * Pick the best available locale from a `preferred` string.
 * Accepts either a plain code (`"es"`) or an HTTP Accept-Language header
 * (`"es-MX,es;q=0.9,en;q=0.8"`).
 */
export function pickLocale(preferred: string | undefined | null, fallback = DEFAULT_LOCALE): string {
  if (!preferred) return fallback;
  const candidates = preferred
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';');
      const quality = q && q.startsWith('q=') ? parseFloat(q.slice(2)) : 1;
      return { tag: tag.toLowerCase(), quality: Number.isFinite(quality) ? quality : 1 };
    })
    .filter((c) => c.tag)
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of candidates) {
    if (LOCALES[tag]) return tag;
    const base = tag.split('-')[0];
    if (LOCALES[base]) return base;
  }
  return fallback;
}

export const AVAILABLE_LOCALES = Object.keys(LOCALES);
