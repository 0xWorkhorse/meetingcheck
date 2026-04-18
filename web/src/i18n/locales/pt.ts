import type { UiMessages } from '../types.js';

export const pt: UiMessages = {
  nav: {
    checkALink: 'Verificar link',
    theProblem: 'O problema',
    howItWorks: 'Como funciona',
    verdicts: 'Veredictos',
    extension: 'Extensão',
    pasteALink: 'Cole um link →',
    tagline: 'v3.2 — verificador de links',
  },

  hero: {
    kicker: 'Alerta de reunião falsa ativo — Ref. 2026/02 ONDA ZOOM-CLONE',
    kickerMeta: 'Construído após o drenagem de fevereiro de 2026',
    headlineLine1: '{paste} primeiro{period}',
    headlineLine2: '{click} depois.',
    headlinePaste: 'Confere',
    headlineClick: 'Clica',
    subBody:
      'Um veredicto binário e rigoroso sobre cada convite de reunião que você recebe — {safe}, {dangerous} ou {unrecognized} — em menos de três segundos, antes que qualquer coisa abra uma janela na sua máquina.',
    statLinksChecked: 'links verificados hoje',
    statScamsFlagged: 'golpes sinalizados hoje',
    statConfirmed: 'domínios de golpe confirmados',
    statUpdated: 'Atualizado {value}',
    statJustNow: 'agora mesmo',
  },

  checker: {
    shellTitle: 'MEETINGCHECK // VERIFIER SHELL',
    sessionLabel: 'sessão',
    pasteMeetingUrl: '▌ Cole a URL da reunião',
    verifyBtn: 'VERIFICAR ↵',
    checkingBtn: 'VERIFICANDO…',
    tryLabel: 'Tente:',
    verdictStamp: 'VEREDICTO',
    idleStamp: '— OCIOSO —',
    verifiedAt: 'VERIFICADO {time}',
    inFlight: 'EM ANDAMENTO',
    awaiting: 'AGUARDANDO',
    checking: 'VERIFICANDO…',
    idleMessage:
      'Cole um link de reunião à esquerda. Vamos verificá-lo contra domínios oficiais, registros de certificados e nosso feed de ameaças da comunidade ao vivo.',
    loadingMessage:
      'Executando verificações contra listas oficiais permitidas e o feed da comunidade.',
    reportThisLink: 'Denunciar este link →',
    errorPrefix: 'Erro:',
    signals: {
      urlFormat: 'Formato da URL',
      officialDomain: 'Domínio oficial',
      certTransparency: 'Transparência do cert.',
      communityFeed: 'Feed da comunidade',
    },
    values: {
      valid: 'VÁLIDO',
      malformed: 'MALFORMADO',
      allowlisted: 'NA LISTA PERMITIDA',
      notAllowlisted: 'FORA DA LISTA',
      lookalike: 'IMITAÇÃO / NÃO OFICIAL',
      unknown: 'DESCONHECIDO',
      notChecked: 'NÃO VERIFICADO',
      clean: 'LIMPO',
      noReports: 'SEM DENÚNCIAS',
      flagged: 'SINALIZADO {n}×',
      checking: 'VERIFICANDO…',
    },
    sampleTags: {
      safe:    'SEGURO',
      danger:  'PERIGO',
      unrecog: '???',
    },
    advice: {
      safe: 'Pode seguir. Mas: nunca cole uma frase de recuperação numa janela de reunião.',
      dangerous:
        'Feche a aba. Denuncie o remetente. Não cole nenhuma frase de recuperação em lugar nenhum, hoje.',
      unrecognized:
        'Verifique por fora. Pergunte ao remetente por outro canal antes de clicar.',
      invalid: 'Ignore. Peça ao remetente para reenviar por um canal confiável.',
    },
  },

  verdictWords: {
    safe: 'SEGURO',
    dangerous: 'PERIGOSO',
    unrecognized: 'DESCONHECIDO',
    invalid: 'INVÁLIDO',
  },

  problem: {
    sectionTag: 'O PROBLEMA',
    heading: 'Sua agenda virou uma {weapon} agora.',
    headingWeapon: 'arma',
    lede:
      'Em fevereiro de 2026, milhares de holders de cripto clicaram num "convite do Zoom" que não era. Instalou um sequestrador de área de transferência no tempo que o spinner levou pra girar. As wallets esvaziaram. As calls nunca existiram.',
    bodyP1:
      'Links reais e falsos parecem idênticos ao olho humano. {zoomUs} vs {zoomInvite}. {meetGoogle} vs {meetCiom}. {oneLetter} e a wallet foi.',
    bodyP1OneLetter: 'uma letra',
    bodyP2:
      'Pior — subdomínios que parecem legítimos (rooms.zoom-partner.xyz) agora vivem na mesma infraestrutura que os golpes. A barra de endereço do navegador não ajuda. A prévia do Slack não ajuda. Antivírus não ajuda, porque nada foi baixado ainda.',
    bodyP3:
      'O que ajuda é um {ruleChecker}: listas permitidas de domínios oficiais, transparência de certificados e uma lista de bloqueio da comunidade atualizada a cada dois minutos. É só isso.',
    bodyP3RuleChecker: 'verificador por regras',
    ledger: {
      ariaLabel: 'Perdas recentes',
      date: 'DATA',
      incident: 'INCIDENTE',
      estLoss: 'PERDA EST.',
      totalLabel: 'TOTAL RELATADO — FEV ➜ ABR 2026',
    },
  },

  howItWorks: {
    sectionTag: 'COMO FUNCIONA',
    heading: 'Três segundos. {three} verificações. Uma resposta.',
    headingThree: 'Três',
    step1: {
      title: 'Cola o link',
      body:
        'Jogue a URL do seu e-mail, Slack, Farcaster, Telegram — onde quer que tenha aparecido. Sem conta, sem extensão necessária.',
      miniLabel: 'ENTRADA',
    },
    step2: {
      title: 'A gente verifica três coisas',
      body:
        'Contra o registro de domínios oficiais do Zoom / Meet / Teams / Calendly. Contra logs de transparência de certificados ao vivo. Contra o feed de ameaças da comunidade — atualizado continuamente.',
      miniLabel: 'TESTES',
    },
    step3: {
      title: 'Veredicto binário',
      body:
        'Não "pontuação de risco 7/10." Não "proceda com cautela." Uma de três palavras, escolhidas de propósito: {safe}, {dangerous} ou {unrecognized}. Aí você decide.',
      miniLabel: 'SAÍDA',
      miniOutput: '◆ PERIGOSO — não abra',
    },
  },

  verdictsExplainer: {
    safeLab: 'Veredicto A',
    dangerousLab: 'Veredicto B',
    unrecognizedLab: 'Veredicto C',
    safeBody:
      'Na lista oficial permitida. Certificado válido de um provedor conhecido emitido há mais de 60 dias. Sem denúncias da comunidade. Pode seguir.',
    dangerousBody:
      'Homógrafo, typosquat, cert. recente num TLD fora do padrão, ou atualmente na lista de bloqueio. Feche a aba. Denuncie. Avise seus amigos.',
    unrecognizedBody:
      'Pode ser um provedor menor que ainda não conhecemos. Não vamos mentir dizendo que é seguro. Verifique por outro canal antes de clicar.',
  },

  report: {
    url: 'URL suspeita',
    source: 'Onde você recebeu?',
    sourceTelegram: 'Telegram',
    sourceEmail: 'E-mail',
    sourceDm: 'DM no X / Twitter',
    sourceCalendar: 'Convite de calendário',
    sourceOther: 'Outro',
    context: 'Contexto (opcional)',
    contextPlaceholder:
      'Recebi de alguém se passando por um VC. Pediu pra entrar numa call.',
    urlPlaceholder: 'https://link-zoom-suspeito.click/...',
    submit: 'Enviar denúncia',
    submitting: 'Enviando…',
    queued: 'Valeu — denúncia na fila pra revisão.',
    needsChallenge: 'Complete o desafio, por favor.',
    failed: 'Falha no envio. Tente de novo.',
  },

  footer: {
    tagline: 'Confere primeiro. {click} depois.',
    taglineClick: 'Clica',
    body:
      'Utilidade pública gratuita. Sem cadastro. Sem rastreamento. Sua URL colada nunca sai do nosso verificador de um jeito que te identifique.',
    cta: 'Verificar um link agora →',
    productHeading: 'Produto',
    communityHeading: 'Comunidade',
    webChecker: 'Verificador web',
    browserExtension: 'Extensão do navegador',
    reportALink: 'Denunciar um link',
    credit: '© 2026 {team} — utilidade pública construída por {author}',
  },

  theme: {
    switchToDark: 'Mudar para modo escuro',
    switchToLight: 'Mudar para modo claro',
  },

  localeLabel: 'Idioma',
};
