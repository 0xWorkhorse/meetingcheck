import type { UiMessages } from '../types.js';

export const de: UiMessages = {
  nav: {
    checkALink: 'Link prüfen',
    howItWorks: 'So funktioniert\'s',
    verdicts: 'Urteile',
    extension: 'Extension',
    pasteALink: 'Link einfügen →',
    tagline: 'v3.2 — Link-Verifier',
  },

  hero: {
    headlineLine1: '{paste} zuerst{period}',
    headlineLine2: 'Dann {click}.',
    headlinePaste: 'Prüf',
    headlineClick: 'klick',
    subBody:
      'Ein striktes, binäres Urteil zu jeder Meeting-Einladung, die du kriegst — {safe}, {dangerous} oder {unrecognized} — in unter drei Sekunden, bevor irgendwas ein Fenster auf deiner Maschine öffnet.',
    statLinksChecked: 'Links geprüft',
    statScamsFlagged: 'Betrüge markiert',
    statConfirmed: 'bestätigte Betrugs-Domains',
    statUpdated: 'Aktualisiert {value}',
    statJustNow: 'gerade eben',
  },

  checker: {
    shellTitle: 'MEETINGCHECK // VERIFIER SHELL',
    sessionLabel: 'Sitzung',
    pasteMeetingUrl: '▌ Meeting-URL einfügen',
    verifyBtn: 'PRÜFEN ↵',
    checkingBtn: 'PRÜFUNG…',
    verdictStamp: 'URTEIL',
    idleStamp: '— LEERLAUF —',
    verifiedAt: 'GEPRÜFT {time}',
    inFlight: 'LÄUFT',
    awaiting: 'WARTET',
    checking: 'PRÜFUNG…',
    idleMessage:
      'Füg links einen Meeting-Link ein. Wir prüfen ihn gegen offizielle Domains, Zertifikatsregister und unseren Live-Community-Threat-Feed.',
    loadingMessage:
      'Prüfungen laufen gegen offizielle Allowlists und den Community-Feed.',
    reportThisLink: 'Diesen Link melden →',
    errorPrefix: 'Fehler:',
    signals: {
      urlFormat: "URL-Format",
      redirects: "Weiterleitungen",
      characterCheck: "Zeichen-Check",
      officialDomain: "Offizielle Domain",
      hosting: "Hosting",
      domainAge: "Domain-Alter",
      certTransparency: "Zert.-Transparenz",
      communityFeed: "Community-Feed",
    },
    values: {
      valid: 'GÜLTIG',
      malformed: 'UNGÜLTIG',
      allowlisted: 'ZUGELASSEN',
      notAllowlisted: 'NICHT ZUGELASSEN',
      lookalike: 'NACHAHMUNG / NICHT OFFIZIELL',
      unknown: 'UNBEKANNT',
      notChecked: 'NICHT GEPRÜFT',
      clean: 'SAUBER',
      noReports: 'KEINE MELDUNGEN',
      flagged: 'GEMELDET {n}×',
      redirectsDirect: "DIREKT",
      redirectsHops: "{n} HOPS",
      redirectsFailed: "AUFLÖSUNG FEHLGESCHLAGEN",
      charAsciiClean: "ASCII SAUBER",
      charNonAscii: "NICHT-ASCII",
      charPunycode: "PUNYCODE: {decoded}",
      charSpoof: "SPOOFING: {decoded}",
      hostingKnown: "{cc}",
      hostingUnknown: "UNBEKANNT",
      hostingUnavailable: "NICHT VERFÜGBAR",
      whoisUnavailable: "NICHT VERFÜGBAR",
      whoisPrivate: "PRIVAT",
      whoisFresh: "NEU ({n}T)",
      whoisYoung: "{n}T",
      whoisMature: "> 1J",
      certUnavailable: 'NICHT VERFÜGBAR',
      certNewDomain: 'NEUE DOMAIN',
      certFresh: 'FRISCH ({n}T)',
      certValidDays: 'GÜLTIG ({n}T)',
      certValidOld: 'GÜLTIG > 60T',
      checking: 'PRÜFUNG…',
    },
    advice: {
      safe: 'Weiter. Aber: nie eine Seed-Phrase in ein Meeting-Fenster einfügen.',
      dangerous:
        'Tab zu. Absender melden. Keine Seed-Phrase irgendwo einfügen, heute nicht.',
      unrecognized:
        'Out-of-Band prüfen. Absender auf einem anderen Kanal fragen, bevor du klickst.',
      invalid: 'Ignorieren. Absender soll den Link über einen vertrauenswürdigen Kanal erneut schicken.',
    },
    support: {
      heading: 'Unterstützung',
      copy: 'kopieren',
      copied: 'kopiert',
    },
  },

  verdictWords: {
    safe: 'SICHER',
    dangerous: 'GEFÄHRLICH',
    unrecognized: 'UNBEKANNT',
    invalid: 'UNGÜLTIG',
  },

  howItWorks: {
    sectionTag: 'SO FUNKTIONIERT\'S',
    heading: 'Drei Sekunden. {three} Prüfungen. Eine Antwort.',
    headingThree: 'Drei',
    step1: {
      title: 'Link einfügen',
      body:
        'Wirf die URL aus deinem Posteingang, Slack, Farcaster, Telegram rein — egal woher. Kein Konto, keine Extension nötig.',
      miniLabel: 'EINGABE',
    },
    step2: {
      title: 'Wir prüfen drei Dinge',
      body:
        'Gegen das offizielle Domain-Register von Zoom / Meet / Teams / Calendly. Gegen Live-Logs der Zertifikatstransparenz. Gegen den Community-Threat-Feed — laufend aktualisiert.',
      miniLabel: 'TESTS',
    },
    step3: {
      title: 'Binäres Urteil',
      body:
        'Kein "Risikoscore 7/10." Kein "mit Vorsicht fortfahren." Eines von drei Wörtern, bewusst gewählt: {safe}, {dangerous} oder {unrecognized}. Dann entscheidest du.',
      miniLabel: 'AUSGABE',
      miniOutput: '◆ GEFÄHRLICH — nicht öffnen',
    },
  },

  verdictsExplainer: {
    safeLab: 'Urteil A',
    dangerousLab: 'Urteil B',
    unrecognizedLab: 'Urteil C',
    safeBody:
      'Auf der offiziellen Allowlist. Zertifikat von einem bekannten Anbieter, vor über 60 Tagen ausgestellt. Keine Community-Meldungen. Weiter geht\'s.',
    dangerousBody:
      'Homoglyph, Typosquat, frisches Zertifikat auf einer obskuren TLD, oder derzeit in der Blocklist. Tab zu. Melden. Leute warnen.',
    unrecognizedBody:
      'Könnte ein kleinerer Anbieter sein, den wir noch nicht kennen. Wir lügen nicht und sagen, es sei sicher. Prüf es auf einem anderen Kanal, bevor du klickst.',
  },

  report: {
    url: 'Verdächtige URL',
    source: 'Woher hast du sie?',
    sourceTelegram: 'Telegram',
    sourceEmail: 'E-Mail',
    sourceDm: 'X- / Twitter-DM',
    sourceCalendar: 'Kalendereinladung',
    sourceOther: 'Andere',
    context: 'Kontext (optional)',
    contextPlaceholder:
      'Von jemandem bekommen, der vorgab, ein VC zu sein. Bat mich, einem Call beizutreten.',
    urlPlaceholder: 'https://verdaechtiger-zoom-link.click/...',
    submit: 'Meldung senden',
    submitting: 'Wird gesendet…',
    queued: 'Danke — Meldung in der Warteschlange zur Prüfung.',
    needsChallenge: 'Bitte das Challenge abschließen.',
    failed: 'Senden fehlgeschlagen. Nochmal versuchen.',
  },

  footer: {
    tagline: 'Erst prüfen. Dann {click}.',
    taglineClick: 'klicken',
    body:
      'Ein freier öffentlicher Dienst. Keine Anmeldung. Kein Tracking. Deine eingefügte URL verlässt unseren Checker nie in einer Form, die dich identifiziert.',
    cta: 'Jetzt einen Link prüfen →',
    productHeading: 'Produkt',
    communityHeading: 'Community',
    webChecker: 'Web-Checker',
    browserExtension: 'Browser-Extension',
    reportALink: 'Link melden',
    credit: '© 2026 {team} — öffentlicher Dienst, gebaut von {author}',
  },

  theme: {
    switchToDark: 'Zu dunklem Modus wechseln',
    switchToLight: 'Zu hellem Modus wechseln',
  },

  localeLabel: 'Sprache',
};
