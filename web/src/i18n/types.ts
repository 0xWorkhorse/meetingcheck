/**
 * Schema for every user-facing string on the site. One flat interface
 * per section. Types are `string` for plain copy and `string` templates
 * (e.g. "FLAGGED {n}×") when interpolation is needed.
 *
 * Template tokens use {name} syntax; `format()` in ./format.tsx splices
 * values (strings or React nodes) and returns a ReactNode.
 *
 * Missing keys are compile errors — this is the whole point of rolling
 * a typed schema instead of a stringly-typed library.
 */
export interface UiMessages {
  nav: {
    checkALink: string;
    howItWorks: string;
    verdicts: string;
    extension: string;
    pasteALink: string;
    tagline: string; // under MEETINGCHECK logo
  };
  hero: {
    kicker: string;
    kickerMeta: string;
    /** Template: "{paste} first{period}" */
    headlineLine1: string;
    /** Template: "{click} second." */
    headlineLine2: string;
    headlinePaste: string;
    headlineClick: string;
    /** Template: "A strict, binary verdict on every meeting invite you get — {safe}, {dangerous}, or {unrecognized} — in under three seconds, before anything opens a window on your machine." */
    subBody: string;
    statLinksChecked: string;
    statScamsFlagged: string;
    statConfirmed: string;
    statUpdated: string; // "Updated {value}"
    statJustNow: string; // "just now"
  };
  checker: {
    shellTitle: string; // "MEETINGCHECK // VERIFIER SHELL" — brand, typically not translated
    sessionLabel: string; // "session"
    pasteMeetingUrl: string; // "▌ Paste meeting URL"
    verifyBtn: string;
    checkingBtn: string;
    verdictStamp: string; // "VERDICT"
    idleStamp: string; // "— IDLE —"
    /** Template: "VERIFIED {time}" */
    verifiedAt: string;
    inFlight: string;
    awaiting: string;
    checking: string;
    idleMessage: string;
    loadingMessage: string;
    reportThisLink: string;
    errorPrefix: string; // "Error: "
    signals: {
      urlFormat: string;
      officialDomain: string;
      certTransparency: string;
      communityFeed: string;
    };
    values: {
      valid: string;
      malformed: string;
      allowlisted: string;
      notAllowlisted: string;
      lookalike: string;
      unknown: string;
      notChecked: string;
      clean: string;
      noReports: string;
      /** Template: "FLAGGED {n}×" */
      flagged: string;
      checking: string; // row value when pending
      /** Cert transparency row values */
      certUnavailable: string;         // lookup failed — neutral warn
      certNewDomain: string;           // no CT entries — suspicious bad
      /** Template: "FRESH CERT ({n}D)" */
      certFresh: string;               // cert issued <14d ago — bad
      /** Template: "VALID ({n}D)" */
      certValidDays: string;           // 14–60 days — warn
      certValidOld: string;            // >60 days — ok
    };
    advice: {
      safe: string;
      dangerous: string;
      unrecognized: string;
      invalid: string;
    };
    /** Donation block under the signal rows. Addresses themselves are not translated. */
    support: {
      heading: string; // e.g. "Support"
      copy: string;    // button label
      copied: string;  // feedback after click
    };
  };
  verdictWords: {
    safe: string;
    dangerous: string;
    unrecognized: string;
    invalid: string;
  };
  howItWorks: {
    sectionTag: string;
    /** Template: "Three seconds. {three} checks. One answer." */
    heading: string;
    headingThree: string;
    step1: { title: string; body: string; miniLabel: string };
    step2: { title: string; body: string; miniLabel: string };
    step3: {
      title: string;
      /** Template: "Not 'risk score 7/10.' Not 'proceed with caution.' One of three words, picked on purpose: {safe}, {dangerous}, or {unrecognized}. Then you decide." */
      body: string;
      miniLabel: string;
      miniOutput: string;
    };
  };
  verdictsExplainer: {
    safeLab: string;
    dangerousLab: string;
    unrecognizedLab: string;
    safeBody: string;
    dangerousBody: string;
    unrecognizedBody: string;
  };
  report: {
    url: string;
    source: string;
    sourceTelegram: string;
    sourceEmail: string;
    sourceDm: string;
    sourceCalendar: string;
    sourceOther: string;
    context: string;
    contextPlaceholder: string;
    urlPlaceholder: string;
    submit: string;
    submitting: string;
    /** Template: "Thanks — report queued for review. {id}" — or keep id rendered separately */
    queued: string;
    needsChallenge: string;
    failed: string;
  };
  footer: {
    /** Template: "Paste first. {click} second." */
    tagline: string;
    taglineClick: string;
    body: string;
    cta: string;
    productHeading: string;
    communityHeading: string;
    webChecker: string;
    browserExtension: string;
    reportALink: string;
    /** Template: "© 2026 {team} — a public utility built by {author}" */
    credit: string;
  };
  theme: {
    switchToDark: string;
    switchToLight: string;
  };
  localeLabel: string;
}

/** Locale code. Extend as new locales are registered. */
export type Locale =
  | 'en'
  | 'de'
  | 'es'
  | 'fr'
  | 'id'
  | 'ja'
  | 'ko'
  | 'pt'
  | 'ru'
  | 'tr'
  | 'vi'
  | 'zh';

/** Human-readable name for the locale picker (native spelling). */
export interface LocaleInfo {
  code: Locale;
  name: string;
  dir: 'ltr' | 'rtl';
}
