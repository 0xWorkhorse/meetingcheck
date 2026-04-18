import type { UiMessages } from '../types.js';

export const fr: UiMessages = {
  nav: {
    checkALink: 'Vérifier un lien',
    theProblem: 'Le problème',
    howItWorks: 'Comment ça marche',
    verdicts: 'Verdicts',
    extension: 'Extension',
    pasteALink: 'Colle un lien →',
    tagline: 'v3.2 — vérificateur de liens',
  },

  hero: {
    kicker: 'Alerte réunion factice active — Réf. 2026/02 VAGUE ZOOM-CLONE',
    kickerMeta: 'Construit après le drain de février 2026',
    headlineLine1: '{paste} d\'abord{period}',
    headlineLine2: '{click} ensuite.',
    headlinePaste: 'Vérifie',
    headlineClick: 'Clique',
    subBody:
      'Un verdict binaire et strict sur chaque invitation de réunion que tu reçois — {safe}, {dangerous} ou {unrecognized} — en moins de trois secondes, avant que quoi que ce soit n\'ouvre une fenêtre sur ta machine.',
    statLinksChecked: 'liens vérifiés aujourd\'hui',
    statScamsFlagged: 'arnaques signalées aujourd\'hui',
    statConfirmed: 'domaines d\'arnaque confirmés',
    statUpdated: 'Mis à jour {value}',
    statJustNow: 'à l\'instant',
  },

  checker: {
    shellTitle: 'MEETINGCHECK // VERIFIER SHELL',
    sessionLabel: 'session',
    pasteMeetingUrl: '▌ Colle l\'URL de la réunion',
    verifyBtn: 'VÉRIFIER ↵',
    checkingBtn: 'VÉRIFICATION…',
    tryLabel: 'Essaye :',
    verdictStamp: 'VERDICT',
    idleStamp: '— INACTIF —',
    verifiedAt: 'VÉRIFIÉ {time}',
    inFlight: 'EN COURS',
    awaiting: 'EN ATTENTE',
    checking: 'VÉRIFICATION…',
    idleMessage:
      'Colle un lien de réunion à gauche. On va le vérifier contre les domaines officiels, les registres de certificats, et notre fil de menaces communautaire en direct.',
    loadingMessage:
      'Vérifications en cours contre les listes blanches officielles et le fil communautaire.',
    reportThisLink: 'Signaler ce lien →',
    errorPrefix: 'Erreur :',
    signals: {
      urlFormat: 'Format de l\'URL',
      officialDomain: 'Domaine officiel',
      certTransparency: 'Transparence du cert.',
      communityFeed: 'Fil communautaire',
    },
    values: {
      valid: 'VALIDE',
      malformed: 'MALFORMÉ',
      allowlisted: 'EN LISTE BLANCHE',
      notAllowlisted: 'HORS LISTE',
      lookalike: 'IMITATION / NON OFFICIEL',
      unknown: 'INCONNU',
      notChecked: 'NON VÉRIFIÉ',
      clean: 'PROPRE',
      noReports: 'AUCUN SIGNAL.',
      flagged: 'SIGNALÉ {n}×',
      checking: 'VÉRIFICATION…',
    },
    sampleTags: {
      safe:    'OK',
      danger:  'DANGER',
      unrecog: '???',
    },
    advice: {
      safe: 'Vas-y. Mais : ne colle jamais une seed phrase dans une fenêtre de réunion.',
      dangerous:
        'Ferme l\'onglet. Signale l\'expéditeur. Ne colle aucune seed phrase nulle part, aujourd\'hui.',
      unrecognized:
        'Vérifie par un autre canal. Demande à l\'expéditeur avant de cliquer.',
      invalid: 'Ignore. Demande à l\'expéditeur de renvoyer via un canal fiable.',
    },
  },

  verdictWords: {
    safe: 'SÛR',
    dangerous: 'DANGEREUX',
    unrecognized: 'NON RECONNU',
    invalid: 'INVALIDE',
  },

  problem: {
    sectionTag: 'LE PROBLÈME',
    heading: 'Ton agenda est une {weapon} maintenant.',
    headingWeapon: 'arme',
    lede:
      'En février 2026, des milliers de détenteurs de crypto ont cliqué sur une "invitation Zoom" qui n\'en était pas une. Elle a installé un détourneur de presse-papiers le temps que le spinner tourne. Les wallets se sont vidées. Les appels n\'ont jamais existé.',
    bodyP1:
      'Les vrais liens et les faux paraissent identiques à l\'œil humain. {zoomUs} vs {zoomInvite}. {meetGoogle} vs {meetCiom}. {oneLetter} et une wallet est vide.',
    bodyP1OneLetter: 'une lettre',
    bodyP2:
      'Pire — des sous-domaines d\'apparence légitime (rooms.zoom-partner.xyz) cohabitent maintenant avec les arnaques sur la même infrastructure. La barre d\'adresse du navigateur n\'aide pas. L\'aperçu Slack n\'aide pas. L\'antivirus n\'aide pas, parce que rien n\'a encore été téléchargé.',
    bodyP3:
      'Ce qui aide, c\'est un {ruleChecker} : listes blanches de domaines officiels, transparence des certificats, et une blocklist communautaire mise à jour toutes les deux minutes. C\'est tout ce que c\'est.',
    bodyP3RuleChecker: 'vérificateur par règles',
    ledger: {
      ariaLabel: 'Pertes récentes',
      date: 'DATE',
      incident: 'INCIDENT',
      estLoss: 'PERTE EST.',
      totalLabel: 'TOTAL SIGNALÉ — FÉV ➜ AVR 2026',
    },
  },

  howItWorks: {
    sectionTag: 'COMMENT ÇA MARCHE',
    heading: 'Trois secondes. {three} vérifications. Une réponse.',
    headingThree: 'Trois',
    step1: {
      title: 'Colle le lien',
      body:
        'Balance l\'URL depuis ta boîte mail, Slack, Farcaster, Telegram — peu importe où elle est apparue. Pas de compte, pas d\'extension requise.',
      miniLabel: 'ENTRÉE',
    },
    step2: {
      title: 'On vérifie trois choses',
      body:
        'Contre le registre officiel des domaines de Zoom / Meet / Teams / Calendly. Contre les logs de transparence de certificats en direct. Contre le fil communautaire de menaces — mis à jour en continu.',
      miniLabel: 'TESTS',
    },
    step3: {
      title: 'Verdict binaire',
      body:
        'Pas de "score de risque 7/10." Pas de "procède avec prudence." Un de trois mots, choisis exprès : {safe}, {dangerous} ou {unrecognized}. Ensuite c\'est toi qui décides.',
      miniLabel: 'SORTIE',
      miniOutput: '◆ DANGEREUX — n\'ouvre pas',
    },
  },

  verdictsExplainer: {
    safeLab: 'Verdict A',
    dangerousLab: 'Verdict B',
    unrecognizedLab: 'Verdict C',
    safeBody:
      'Sur la liste blanche officielle. Certificat valide d\'un fournisseur connu émis il y a plus de 60 jours. Aucun signalement communautaire. Vas-y.',
    dangerousBody:
      'Homographe, typosquat, cert. récent sur un TLD louche, ou actuellement dans la blocklist. Ferme l\'onglet. Signale-le. Préviens tes potes.',
    unrecognizedBody:
      'Possiblement un fournisseur plus petit qu\'on ne connaît pas encore. On ne va pas mentir en disant que c\'est sûr. Vérifie par un autre canal avant de cliquer.',
  },

  report: {
    url: 'URL suspecte',
    source: 'Où l\'as-tu reçue ?',
    sourceTelegram: 'Telegram',
    sourceEmail: 'E-mail',
    sourceDm: 'DM X / Twitter',
    sourceCalendar: 'Invitation calendrier',
    sourceOther: 'Autre',
    context: 'Contexte (facultatif)',
    contextPlaceholder:
      'Reçu de quelqu\'un se faisant passer pour un VC. M\'a demandé de rejoindre un call.',
    urlPlaceholder: 'https://lien-zoom-suspect.click/...',
    submit: 'Envoyer le signalement',
    submitting: 'Envoi…',
    queued: 'Merci — signalement en file d\'attente pour examen.',
    needsChallenge: 'Complète le challenge, s\'il te plaît.',
    failed: 'Échec de l\'envoi. Réessaie.',
  },

  footer: {
    tagline: 'Vérifie d\'abord. {click} ensuite.',
    taglineClick: 'Clique',
    body:
      'Utilité publique gratuite. Pas d\'inscription. Pas de tracking. Ton URL collée ne quitte jamais notre vérificateur sous une forme qui t\'identifie.',
    cta: 'Vérifier un lien maintenant →',
    productHeading: 'Produit',
    communityHeading: 'Communauté',
    webChecker: 'Vérificateur web',
    browserExtension: 'Extension du navigateur',
    reportALink: 'Signaler un lien',
    credit: '© 2026 {team} — utilité publique construite par {author}',
  },

  theme: {
    switchToDark: 'Passer en mode sombre',
    switchToLight: 'Passer en mode clair',
  },

  localeLabel: 'Langue',
};
