import type { UiMessages } from '../types.js';

export const ru: UiMessages = {
  nav: {
    checkALink: 'Проверить ссылку',
    howItWorks: 'Как это работает',
    verdicts: 'Вердикты',
    extension: 'Расширение',
    pasteALink: 'Вставь ссылку →',
    tagline: 'v3.2 — верификатор ссылок',
  },

  hero: {
    kicker: 'Оповещение о поддельных встречах активно — Ref. 2026/02 ВОЛНА ZOOM-КЛОНОВ',
    kickerMeta: 'Собрано после слива в феврале 2026',
    headlineLine1: 'Сначала {paste}{period}',
    headlineLine2: 'Потом {click}.',
    headlinePaste: 'проверь',
    headlineClick: 'кликай',
    subBody:
      'Строгий бинарный вердикт по каждой входящей ссылке на встречу — {safe}, {dangerous} или {unrecognized} — меньше чем за три секунды, до того как что-либо откроет окно у тебя на машине.',
    statLinksChecked: 'ссылок проверено сегодня',
    statScamsFlagged: 'мошенничеств помечено сегодня',
    statConfirmed: 'подтверждённых мошеннических доменов',
    statUpdated: 'Обновлено {value}',
    statJustNow: 'только что',
  },

  checker: {
    shellTitle: 'MEETINGCHECK // VERIFIER SHELL',
    sessionLabel: 'сессия',
    pasteMeetingUrl: '▌ Вставь URL встречи',
    verifyBtn: 'ПРОВЕРИТЬ ↵',
    checkingBtn: 'ПРОВЕРКА…',
    tryLabel: 'Попробуй:',
    verdictStamp: 'ВЕРДИКТ',
    idleStamp: '— ОЖИДАНИЕ —',
    verifiedAt: 'ПРОВЕРЕНО {time}',
    inFlight: 'В ПРОЦЕССЕ',
    awaiting: 'ОЖИДАНИЕ',
    checking: 'ПРОВЕРКА…',
    idleMessage:
      'Вставь ссылку на встречу слева. Мы сверим её с официальными доменами, записями сертификатов и нашим живым фидом угроз от сообщества.',
    loadingMessage:
      'Запускаем проверки по официальным спискам и фиду сообщества.',
    reportThisLink: 'Пожаловаться на ссылку →',
    errorPrefix: 'Ошибка:',
    signals: {
      urlFormat: 'Формат URL',
      officialDomain: 'Официальный домен',
      certTransparency: 'Прозрачность серт.',
      communityFeed: 'Фид сообщества',
    },
    values: {
      valid: 'ВАЛИДНЫЙ',
      malformed: 'НЕКОРРЕКТНЫЙ',
      allowlisted: 'В СПИСКЕ',
      notAllowlisted: 'ВНЕ СПИСКА',
      lookalike: 'ИМИТАЦИЯ / НЕ ОФИЦИАЛЬНЫЙ',
      unknown: 'НЕИЗВЕСТНЫЙ',
      notChecked: 'НЕ ПРОВЕРЕНО',
      clean: 'ЧИСТО',
      noReports: 'БЕЗ ЖАЛОБ',
      flagged: 'ПОМЕЧЕН {n}×',
      checking: 'ПРОВЕРКА…',
    },
    sampleTags: {
      safe:    'OK',
      danger:  'ОПАСНО',
      unrecog: '???',
    },
    advice: {
      safe: 'Можно. Но: никогда не вставляй seed-фразу в окно встречи.',
      dangerous:
        'Закрой вкладку. Сообщи о отправителе. Сегодня никуда не вставляй seed-фразу.',
      unrecognized:
        'Проверь через другой канал. Спроси отправителя перед кликом.',
      invalid: 'Игнорируй. Попроси отправителя переслать по надёжному каналу.',
    },
  },

  verdictWords: {
    safe: 'БЕЗОПАСНО',
    dangerous: 'ОПАСНО',
    unrecognized: 'НЕИЗВЕСТНО',
    invalid: 'НЕВЕРНО',
  },

  howItWorks: {
    sectionTag: 'КАК ЭТО РАБОТАЕТ',
    heading: 'Три секунды. {three} проверки. Один ответ.',
    headingThree: 'Три',
    step1: {
      title: 'Вставь ссылку',
      body:
        'Кидай URL из почты, Slack, Farcaster, Telegram — откуда бы он ни пришёл. Без аккаунта, без расширения.',
      miniLabel: 'ВВОД',
    },
    step2: {
      title: 'Мы проверяем три вещи',
      body:
        'По реестру официальных доменов Zoom / Meet / Teams / Calendly. По живым логам прозрачности сертификатов. По фиду угроз сообщества — обновляется непрерывно.',
      miniLabel: 'ТЕСТЫ',
    },
    step3: {
      title: 'Бинарный вердикт',
      body:
        'Не "риск 7/10." Не "действуй с осторожностью." Одно из трёх слов, выбранных специально: {safe}, {dangerous} или {unrecognized}. Дальше решаешь ты.',
      miniLabel: 'ВЫВОД',
      miniOutput: '◆ ОПАСНО — не открывай',
    },
  },

  verdictsExplainer: {
    safeLab: 'Вердикт A',
    dangerousLab: 'Вердикт B',
    unrecognizedLab: 'Вердикт C',
    safeBody:
      'В официальном списке. Сертификат от известного провайдера, выпущен более 60 дней назад. Жалоб от сообщества нет. Можно продолжать.',
    dangerousBody:
      'Гомограф, тайпосквот, свежий сертификат на странном TLD или уже в блоклисте. Закрой вкладку. Пожалуйся. Предупреди друзей.',
    unrecognizedBody:
      'Может быть небольшой провайдер, которого мы пока не знаем. Мы не будем врать, что это безопасно. Проверь через другой канал перед кликом.',
  },

  report: {
    url: 'Подозрительный URL',
    source: 'Откуда получил?',
    sourceTelegram: 'Telegram',
    sourceEmail: 'E-mail',
    sourceDm: 'DM в X / Twitter',
    sourceCalendar: 'Приглашение в календарь',
    sourceOther: 'Другое',
    context: 'Контекст (необязательно)',
    contextPlaceholder:
      'Получил от того, кто представился VC. Попросил присоединиться к звонку.',
    urlPlaceholder: 'https://подозрительный-zoom-link.click/...',
    submit: 'Отправить жалобу',
    submitting: 'Отправка…',
    queued: 'Спасибо — жалоба в очереди на проверку.',
    needsChallenge: 'Пройди челлендж, пожалуйста.',
    failed: 'Ошибка отправки. Попробуй ещё раз.',
  },

  footer: {
    tagline: 'Сначала проверь. Потом {click}.',
    taglineClick: 'кликай',
    body:
      'Бесплатная публичная утилита. Без регистрации. Без трекинга. Твой вставленный URL никогда не покидает наш чекер в идентифицирующем виде.',
    cta: 'Проверить ссылку сейчас →',
    productHeading: 'Продукт',
    communityHeading: 'Сообщество',
    webChecker: 'Веб-чекер',
    browserExtension: 'Расширение браузера',
    reportALink: 'Пожаловаться на ссылку',
    credit: '© 2026 {team} — публичная утилита от {author}',
  },

  theme: {
    switchToDark: 'Переключить на тёмный режим',
    switchToLight: 'Переключить на светлый режим',
  },

  localeLabel: 'Язык',
};
