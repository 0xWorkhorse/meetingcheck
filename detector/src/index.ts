export { check } from './detector.js';
export type {
  Verdict,
  SignalLevel,
  Signal,
  CheckResult,
  CheckOptions,
  ParamMap,
} from './detector.js';
export { OFFICIAL_DOMAINS } from './domains.js';
export { getRegistrableDomain, normalizeHostname } from './domain-utils.js';

// i18n
export {
  format,
  pickLocale,
  LOCALES,
  DEFAULT_LOCALE,
  AVAILABLE_LOCALES,
  en,
  es,
} from './i18n/index.js';
export type {
  FormattedCheckResult,
  FormattedSignal,
  Locale,
  Messages,
} from './i18n/index.js';
