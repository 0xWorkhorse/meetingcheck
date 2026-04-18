import type { UiMessages } from '../types.js';

export const es: UiMessages = {
  nav: {
    checkALink: 'Verificar enlace',
    theProblem: 'El problema',
    howItWorks: 'Cómo funciona',
    verdicts: 'Veredictos',
    extension: 'Extensión',
    pasteALink: 'Pega un enlace →',
    tagline: 'v3.2 — verificador de enlaces',
  },

  hero: {
    kicker: 'Alerta de reuniones falsas activa — Ref. 2026/02 OLA ZOOM-CLONE',
    kickerMeta: 'Construido tras el drenaje de febrero 2026',
    headlineLine1: '{paste} primero{period}',
    headlineLine2: '{click} después.',
    headlinePaste: 'Verifica',
    headlineClick: 'Haz click',
    subBody:
      'Un veredicto binario y estricto sobre cada invitación de reunión que recibes — {safe}, {dangerous} o {unrecognized} — en menos de tres segundos, antes de que nada abra una ventana en tu máquina.',
    statLinksChecked: 'enlaces verificados hoy',
    statScamsFlagged: 'estafas marcadas hoy',
    statConfirmed: 'dominios de estafa confirmados',
    statUpdated: 'Actualizado {value}',
    statJustNow: 'justo ahora',
  },

  checker: {
    shellTitle: 'MEETINGCHECK // VERIFIER SHELL',
    sessionLabel: 'sesión',
    pasteMeetingUrl: '▌ Pega la URL de la reunión',
    verifyBtn: 'VERIFICAR ↵',
    checkingBtn: 'VERIFICANDO…',
    tryLabel: 'Prueba:',
    verdictStamp: 'VEREDICTO',
    idleStamp: '— INACTIVO —',
    verifiedAt: 'VERIFICADO {time}',
    inFlight: 'EN CURSO',
    awaiting: 'EN ESPERA',
    checking: 'VERIFICANDO…',
    idleMessage:
      'Pega un enlace de reunión a la izquierda. Lo compararemos con dominios oficiales, registros de certificados y nuestro feed de amenazas en vivo.',
    loadingMessage:
      'Ejecutando comprobaciones contra listas permitidas oficiales y el feed de la comunidad.',
    reportThisLink: 'Reportar este enlace →',
    errorPrefix: 'Error:',
    signals: {
      urlFormat: 'Formato de URL',
      officialDomain: 'Dominio oficial',
      certTransparency: 'Transparencia de cert.',
      communityFeed: 'Feed de la comunidad',
    },
    values: {
      valid: 'VÁLIDO',
      malformed: 'MAL FORMADO',
      allowlisted: 'EN LISTA PERMITIDA',
      notAllowlisted: 'FUERA DE LISTA',
      lookalike: 'IMITACIÓN / NO OFICIAL',
      unknown: 'DESCONOCIDO',
      notChecked: 'NO COMPROBADO',
      clean: 'LIMPIO',
      noReports: 'SIN DENUNCIAS',
      flagged: 'MARCADO {n}×',
      checking: 'VERIFICANDO…',
    },
    sampleTags: {
      safe:    'SEGURO',
      danger:  'PELIGRO',
      unrecog: '???',
    },
    advice: {
      safe: 'Continúa. Aun así: nunca pegues una frase de recuperación en una ventana de reunión.',
      dangerous:
        'Cierra la pestaña. Reporta al remitente. No pegues ninguna frase de recuperación en ningún sitio, hoy.',
      unrecognized:
        'Verifica por otro medio. Pregunta al remitente por otro canal antes de hacer click.',
      invalid: 'Ignora. Pide al remitente que lo reenvíe por un canal que confíes.',
    },
  },

  verdictWords: {
    safe: 'SEGURO',
    dangerous: 'PELIGROSO',
    unrecognized: 'NO RECONOCIDO',
    invalid: 'INVÁLIDO',
  },

  problem: {
    sectionTag: 'EL PROBLEMA',
    heading: 'Tu calendario es un {weapon} ahora.',
    headingWeapon: 'arma',
    lede:
      'En febrero de 2026, miles de poseedores de cripto hicieron click en una "invitación de Zoom" que no lo era. Instaló un secuestrador de portapapeles en el tiempo que tardó en girar el spinner. Las wallets se vaciaron. Las llamadas nunca existieron.',
    bodyP1:
      'Los enlaces reales y los falsos se ven idénticos al ojo humano. {zoomUs} vs {zoomInvite}. {meetGoogle} vs {meetCiom}. {oneLetter} y la wallet está vacía.',
    bodyP1OneLetter: 'una letra',
    bodyP2:
      'Peor — subdominios que parecen legítimos (rooms.zoom-partner.xyz) ahora conviven con las estafas en la misma infraestructura. La barra de direcciones no ayuda. La vista previa de Slack no ayuda. El antivirus no ayuda, porque nada se ha descargado aún.',
    bodyP3:
      'Lo que ayuda es un {ruleChecker}: listas permitidas de dominios oficiales, transparencia de certificados y una lista de bloqueo comunitaria actualizada cada dos minutos. Eso es todo esto.',
    bodyP3RuleChecker: 'comprobador por reglas',
    ledger: {
      ariaLabel: 'Pérdidas recientes',
      date: 'FECHA',
      incident: 'INCIDENTE',
      estLoss: 'PÉRDIDA EST.',
      totalLabel: 'TOTAL REPORTADO — FEB ➜ ABR 2026',
    },
  },

  howItWorks: {
    sectionTag: 'CÓMO FUNCIONA',
    heading: 'Tres segundos. {three} comprobaciones. Una respuesta.',
    headingThree: 'Tres',
    step1: {
      title: 'Pega el enlace',
      body:
        'Suelta la URL de tu bandeja, Slack, Farcaster, Telegram — donde sea que apareció. Sin cuenta, sin extensión requerida.',
      miniLabel: 'ENTRADA',
    },
    step2: {
      title: 'Comprobamos tres cosas',
      body:
        'Contra el registro de dominios oficiales de Zoom / Meet / Teams / Calendly. Contra registros en vivo de transparencia de certificados. Contra el feed comunitario de amenazas — actualizado continuamente.',
      miniLabel: 'PRUEBAS',
    },
    step3: {
      title: 'Veredicto binario',
      body:
        'No "puntuación de riesgo 7/10." No "procede con precaución." Una de tres palabras, elegidas a propósito: {safe}, {dangerous} o {unrecognized}. Y tú decides.',
      miniLabel: 'SALIDA',
      miniOutput: '◆ PELIGROSO — no abrir',
    },
  },

  verdictsExplainer: {
    safeLab: 'Veredicto A',
    dangerousLab: 'Veredicto B',
    unrecognizedLab: 'Veredicto C',
    safeBody:
      'En la lista oficial permitida. Certificado válido de un proveedor conocido emitido hace más de 60 días. Sin denuncias comunitarias. Procede.',
    dangerousBody:
      'Homógrafo, typosquat, certificado reciente en un TLD extraño, o actualmente en la lista de bloqueo. Cierra la pestaña. Repórtalo. Avisa a tus amigos.',
    unrecognizedBody:
      'Podría ser un proveedor más pequeño que aún no conocemos. No vamos a mentir y decir que es seguro. Verifica por otro canal antes de hacer click.',
  },

  report: {
    url: 'URL sospechosa',
    source: '¿Dónde lo recibiste?',
    sourceTelegram: 'Telegram',
    sourceEmail: 'Correo',
    sourceDm: 'DM de X / Twitter',
    sourceCalendar: 'Invitación de calendario',
    sourceOther: 'Otro',
    context: 'Contexto (opcional)',
    contextPlaceholder:
      'Lo recibí de alguien que dijo ser un VC. Me pidió unirme a una llamada.',
    urlPlaceholder: 'https://enlace-zoom-sospechoso.click/...',
    submit: 'Enviar denuncia',
    submitting: 'Enviando…',
    queued: 'Gracias — denuncia en cola para revisión.',
    needsChallenge: 'Completa el desafío, por favor.',
    failed: 'Error al enviar. Inténtalo de nuevo.',
  },

  footer: {
    tagline: 'Verifica primero. {click} después.',
    taglineClick: 'Haz click',
    body:
      'Una utilidad pública gratuita. Sin registro. Sin tracking. Tu URL pegada nunca sale de nuestro verificador en una forma que te identifique.',
    cta: 'Verifica un enlace ahora →',
    productHeading: 'Producto',
    communityHeading: 'Comunidad',
    webChecker: 'Verificador web',
    browserExtension: 'Extensión del navegador',
    reportALink: 'Reportar un enlace',
    credit: '© 2026 {team} — una utilidad pública construida por {author}',
  },

  theme: {
    switchToDark: 'Cambiar a modo oscuro',
    switchToLight: 'Cambiar a modo claro',
  },

  localeLabel: 'Idioma',
};
