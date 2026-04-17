/**
 * UI strings for the site chrome. Detector verdicts are localized server-side
 * via /v1/check (see api.ts); these strings cover the non-detector UI.
 */
export type UiLocale = 'en' | 'es';

export interface UiMessages {
  nav: { threatFeed: string; extension: string };
  hero: { title: string; sub: string; placeholder: string; check: string; checking: string };
  sections: {
    activity: string;
    verdicts: string;
    verdictSafe: string; verdictDanger: string; verdictUnknown: string;
    verdictSafeBody: string; verdictDangerBody: string; verdictUnknownBody: string;
    extensionTitle: string; extensionBody: string;
    whyTitle: string; whyBody: string;
  };
  stats: {
    linksChecked: string;
    scamsFlagged: string;
    reports: string;
    confirmed: string;
  };
  report: {
    prompt: string;
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
    queued: string;
  };
  footer: { copyright: string; privacy: string; github: string; threatFeed: string };
  localeLabel: string;
}

const en: UiMessages = {
  nav: { threatFeed: 'Threat feed', extension: 'Extension' },
  hero: {
    title: 'Is this meeting link actually real?',
    sub: 'Strict binary verdict on Zoom, Google Meet, Teams, Calendly impersonation. Paste the link — 3 seconds.',
    placeholder: 'https://…',
    check: 'Check',
    checking: 'Checking…',
  },
  sections: {
    activity: "Today's activity",
    verdicts: 'What the three verdicts mean',
    verdictSafe: 'Safe',
    verdictDanger: 'Dangerous',
    verdictUnknown: 'Unrecognized',
    verdictSafeBody: 'Hostname is on our official meeting-service list (zoom.us, meet.google.com, calendly.com, etc.).',
    verdictDangerBody: 'Subdomain spoof, brand impersonation, typosquat, or confirmed community report.',
    verdictUnknownBody: 'Not on the official list, no clear impersonation. Do not trust as a meeting link without verifying.',
    extensionTitle: 'Install the browser extension',
    extensionBody: 'Right-click any link → "Check with isthislinksafe". Works in Chrome and Firefox. Minimal permissions.',
    whyTitle: 'Why this exists',
    whyBody: 'In Feb 2026, attackers ran a coordinated fake-Zoom campaign against web3 professionals: impersonation domains, meeting-join pages that loaded wallet drainers, all delivered through Telegram and X DMs. Generic URL scanners missed most of them. This tool answers one question strictly: is this actually Zoom / Meet / Calendly?',
  },
  stats: {
    linksChecked: 'Links checked (24h)',
    scamsFlagged: 'Scams flagged (24h)',
    reports: 'Community reports',
    confirmed: 'Confirmed scam domains',
  },
  report: {
    prompt: 'Report this link with more context →',
    url: 'Suspicious URL',
    source: 'Where did you get it?',
    sourceTelegram: 'Telegram',
    sourceEmail: 'Email',
    sourceDm: 'X / Twitter DM',
    sourceCalendar: 'Calendar invite',
    sourceOther: 'Other',
    context: 'Context (optional)',
    contextPlaceholder: 'Received from someone claiming to be a VC. Asked me to join a call.',
    urlPlaceholder: 'https://suspicious-zoom-link.click/...',
    submit: 'Submit report',
    submitting: 'Submitting…',
    queued: 'Thanks — report queued for review.',
  },
  footer: {
    copyright: '© 2026 isthislinksafe',
    privacy: 'Privacy',
    github: 'GitHub',
    threatFeed: 'Threat feed',
  },
  localeLabel: 'Language',
};

const es: UiMessages = {
  nav: { threatFeed: 'Feed de amenazas', extension: 'Extensión' },
  hero: {
    title: '¿Este enlace de reunión es real?',
    sub: 'Veredicto binario estricto sobre suplantación de Zoom, Google Meet, Teams, Calendly. Pega el enlace — 3 segundos.',
    placeholder: 'https://…',
    check: 'Verificar',
    checking: 'Verificando…',
  },
  sections: {
    activity: 'Actividad de hoy',
    verdicts: 'Qué significan los tres veredictos',
    verdictSafe: 'Seguro',
    verdictDanger: 'Peligroso',
    verdictUnknown: 'No reconocido',
    verdictSafeBody: 'El dominio está en nuestra lista oficial de servicios de reuniones (zoom.us, meet.google.com, calendly.com, etc.).',
    verdictDangerBody: 'Suplantación de subdominio, suplantación de marca, typosquat o denuncia comunitaria confirmada.',
    verdictUnknownBody: 'No está en la lista oficial y no hay suplantación clara. No confíes como enlace de reunión sin verificar.',
    extensionTitle: 'Instala la extensión del navegador',
    extensionBody: 'Click derecho en cualquier enlace → "Verificar con isthislinksafe". Funciona en Chrome y Firefox. Permisos mínimos.',
    whyTitle: 'Por qué existe',
    whyBody: 'En febrero de 2026, atacantes ejecutaron una campaña coordinada de Zoom falso contra profesionales de web3: dominios de suplantación, páginas de unión a reuniones que cargaban drenadores de wallets, todo distribuido por Telegram y DMs de X. Los escáneres de URLs genéricos no los detectaban. Esta herramienta responde una pregunta estricta: ¿esto es realmente Zoom / Meet / Calendly?',
  },
  stats: {
    linksChecked: 'Enlaces verificados (24h)',
    scamsFlagged: 'Estafas marcadas (24h)',
    reports: 'Denuncias de la comunidad',
    confirmed: 'Dominios de estafa confirmados',
  },
  report: {
    prompt: 'Reportar este enlace con más contexto →',
    url: 'URL sospechosa',
    source: '¿Dónde lo recibiste?',
    sourceTelegram: 'Telegram',
    sourceEmail: 'Correo',
    sourceDm: 'DM en X / Twitter',
    sourceCalendar: 'Invitación de calendario',
    sourceOther: 'Otro',
    context: 'Contexto (opcional)',
    contextPlaceholder: 'Lo recibí de alguien que dijo ser un VC. Me pidió unirme a una llamada.',
    urlPlaceholder: 'https://enlace-zoom-sospechoso.click/...',
    submit: 'Enviar denuncia',
    submitting: 'Enviando…',
    queued: 'Gracias — denuncia en cola para revisión.',
  },
  footer: {
    copyright: '© 2026 isthislinksafe',
    privacy: 'Privacidad',
    github: 'GitHub',
    threatFeed: 'Feed de amenazas',
  },
  localeLabel: 'Idioma',
};

export const UI_LOCALES: Record<UiLocale, UiMessages> = { en, es };
export const UI_LOCALE_NAMES: Record<UiLocale, string> = { en: 'English', es: 'Español' };

const STORAGE_KEY = 'itls_locale';

export function detectLocale(): UiLocale {
  const stored = (localStorage.getItem(STORAGE_KEY) as UiLocale | null);
  if (stored && stored in UI_LOCALES) return stored;
  const nav = navigator.language.split('-')[0].toLowerCase() as UiLocale;
  return nav in UI_LOCALES ? nav : 'en';
}

export function persistLocale(locale: UiLocale) {
  localStorage.setItem(STORAGE_KEY, locale);
}
