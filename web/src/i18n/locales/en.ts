import type { UiMessages } from '../types.js';

export const en: UiMessages = {
  nav: {
    checkALink: 'Check a link',
    howItWorks: 'How it works',
    verdicts: 'Verdicts',
    extension: 'Extension',
    pasteALink: 'Paste a link →',
    tagline: 'v3.2 — link verifier',
  },

  hero: {
    kicker: 'Fake-meeting advisory active — Ref. 2026/02 ZOOM-CLONE WAVE',
    kickerMeta: 'Built after the Feb 2026 drain',
    headlineLine1: '{paste} first{period}',
    headlineLine2: '{click} second.',
    headlinePaste: 'Check',
    headlineClick: 'Click',
    subBody:
      'A strict, binary verdict on every meeting invite you get — {safe}, {dangerous}, or {unrecognized} — in under three seconds, before anything opens a window on your machine.',
    statLinksChecked: 'links checked',
    statScamsFlagged: 'scams flagged',
    statConfirmed: 'confirmed scam domains',
    statUpdated: 'Updated {value}',
    statJustNow: 'just now',
  },

  checker: {
    shellTitle: 'MEETINGCHECK // VERIFIER SHELL',
    sessionLabel: 'session',
    pasteMeetingUrl: '▌ Paste meeting URL',
    verifyBtn: 'VERIFY ↵',
    checkingBtn: 'CHECKING…',
    tryLabel: 'Try:',
    verdictStamp: 'VERDICT',
    idleStamp: '— IDLE —',
    verifiedAt: 'VERIFIED {time}',
    inFlight: 'IN FLIGHT',
    awaiting: 'AWAITING',
    checking: 'CHECKING…',
    idleMessage:
      "Paste a meeting link on the left. We'll check it against official domains, certificate records, and our live community threat feed.",
    loadingMessage: 'Running checks against official allowlists and the community feed.',
    reportThisLink: 'Report this link →',
    errorPrefix: 'Error:',
    signals: {
      urlFormat: 'URL format',
      officialDomain: 'Official domain',
      certTransparency: 'Cert transparency',
      communityFeed: 'Community feed',
    },
    values: {
      valid: 'VALID',
      malformed: 'MALFORMED',
      allowlisted: 'ALLOWLISTED',
      notAllowlisted: 'NOT ALLOWLISTED',
      lookalike: 'LOOKALIKE / NOT OFFICIAL',
      unknown: 'UNKNOWN',
      notChecked: 'NOT CHECKED',
      clean: 'CLEAN',
      noReports: 'NO REPORTS',
      flagged: 'FLAGGED {n}×',
      checking: 'CHECKING…',
    },
    sampleTags: {
      safe:    'SAFE',
      danger:  'DANGER',
      unrecog: '???',
    },
    advice: {
      safe: 'Proceed. Still: never paste a recovery phrase into a meeting window.',
      dangerous:
        'Close the tab. Report the sender. Do not paste any recovery phrase anywhere, today.',
      unrecognized:
        'Verify out-of-band. Ask the sender on a different channel before clicking.',
      invalid: 'Ignore. Ask the sender to re-send via a channel you trust.',
    },
  },

  verdictWords: {
    safe: 'SAFE',
    dangerous: 'DANGEROUS',
    unrecognized: 'UNRECOGNIZED',
    invalid: 'INVALID',
  },

  howItWorks: {
    sectionTag: 'HOW IT WORKS',
    heading: 'Three seconds. {three} checks. One answer.',
    headingThree: 'Three',
    step1: {
      title: 'Paste the link',
      body:
        'Drop the URL from your inbox, Slack, Farcaster, Telegram — wherever it showed up. No account, no extension required.',
      miniLabel: 'INPUT',
    },
    step2: {
      title: 'We check three things',
      body:
        'Against the official domain registry for Zoom / Meet / Teams / Calendly. Against live certificate transparency logs. Against the community threat feed — updated continuously.',
      miniLabel: 'TESTS',
    },
    step3: {
      title: 'Binary verdict',
      body:
        "Not \"risk score 7/10.\" Not \"proceed with caution.\" One of three words, picked on purpose: {safe}, {dangerous}, or {unrecognized}. Then you decide.",
      miniLabel: 'OUTPUT',
      miniOutput: '◆ DANGEROUS — do not open',
    },
  },

  verdictsExplainer: {
    safeLab: 'Verdict A',
    dangerousLab: 'Verdict B',
    unrecognizedLab: 'Verdict C',
    safeBody:
      'On the official allowlist. Certificate matches a known provider issued > 60 days ago. No community reports. Proceed.',
    dangerousBody:
      'Homoglyph, typosquat, fresh cert on an off-brand TLD, or currently in the blocklist. Close the tab. Report it. Tell your friends.',
    unrecognizedBody:
      "Could be a smaller provider we don't know yet. We won't lie and say it's safe. Verify out-of-band before you click.",
  },

  report: {
    url: 'Suspicious URL',
    source: 'Where did you get it?',
    sourceTelegram: 'Telegram',
    sourceEmail: 'Email',
    sourceDm: 'X / Twitter DM',
    sourceCalendar: 'Calendar invite',
    sourceOther: 'Other',
    context: 'Context (optional)',
    contextPlaceholder:
      'Received from someone claiming to be a VC. Asked me to join a call.',
    urlPlaceholder: 'https://suspicious-zoom-link.click/...',
    submit: 'Submit report',
    submitting: 'Submitting…',
    queued: 'Thanks — report queued for review.',
    needsChallenge: 'Please complete the challenge.',
    failed: 'Submission failed. Try again.',
  },

  footer: {
    tagline: 'Check first. {click} second.',
    taglineClick: 'Click',
    body:
      'A free public utility. No sign-up. No tracking. Your pasted URL never leaves our checker in a form that identifies you.',
    cta: 'Check a link now →',
    productHeading: 'Product',
    communityHeading: 'Community',
    webChecker: 'Web checker',
    browserExtension: 'Browser extension',
    reportALink: 'Report a link',
    credit: '© 2026 {team} — a public utility built by {author}',
  },

  theme: {
    switchToDark: 'Switch to dark mode',
    switchToLight: 'Switch to light mode',
  },

  localeLabel: 'Language',
};
