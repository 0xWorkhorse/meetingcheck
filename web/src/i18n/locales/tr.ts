import type { UiMessages } from '../types.js';

export const tr: UiMessages = {
  nav: {
    checkALink: 'Link kontrol et',
    howItWorks: 'Nasıl çalışır',
    verdicts: 'Kararlar',
    extension: 'Uzantı',
    pasteALink: 'Bir link yapıştır →',
    tagline: 'v3.2 — link doğrulayıcı',
  },

  hero: {
    headlineLine1: 'Önce {paste}{period}',
    headlineLine2: 'Sonra {click}.',
    headlinePaste: 'kontrol et',
    headlineClick: 'tıkla',
    subBody:
      'Aldığın her toplantı davetine dair katı ve ikili bir karar — {safe}, {dangerous} ya da {unrecognized} — üç saniyenin altında, makinende herhangi bir şey pencere açmadan önce.',
    statLinksChecked: 'kontrol edilen link',
    statScamsFlagged: 'işaretlenen dolandırıcılık',
    statConfirmed: 'doğrulanmış dolandırıcılık domaini',
    statUpdated: 'Güncellendi {value}',
    statJustNow: 'az önce',
  },

  checker: {
    shellTitle: 'MEETINGCHECK // VERIFIER SHELL',
    sessionLabel: 'oturum',
    pasteMeetingUrl: '▌ Toplantı URL\'sini yapıştır',
    verifyBtn: 'DOĞRULA ↵',
    checkingBtn: 'KONTROL EDİLİYOR…',
    verdictStamp: 'KARAR',
    idleStamp: '— BOŞTA —',
    verifiedAt: 'DOĞRULANDI {time}',
    inFlight: 'İŞLENİYOR',
    awaiting: 'BEKLİYOR',
    checking: 'KONTROL EDİLİYOR…',
    idleMessage:
      'Sol tarafa bir toplantı linki yapıştır. Onu resmi domainlere, sertifika kayıtlarına ve canlı topluluk tehdit feed\'imize karşı kontrol edeceğiz.',
    loadingMessage:
      'Resmi izin listelerine ve topluluk feed\'ine karşı kontroller yapılıyor.',
    reportThisLink: 'Bu linki bildir →',
    errorPrefix: 'Hata:',
    signals: {
      urlFormat: "URL formatı",
      redirects: "Yönlendirmeler",
      characterCheck: "Karakter kontrolü",
      officialDomain: "Resmi domain",
      hosting: "Barındırma",
      domainAge: "Domain yaşı",
      certTransparency: "Sert. şeffaflığı",
      communityFeed: "Topluluk feed'i",
    },
    values: {
      valid: 'GEÇERLİ',
      malformed: 'BOZUK',
      allowlisted: 'İZİN LİSTESİNDE',
      notAllowlisted: 'LİSTEDE DEĞİL',
      lookalike: 'BENZERİ / RESMİ DEĞİL',
      unknown: 'BİLİNMİYOR',
      notChecked: 'KONTROL EDİLMEDİ',
      clean: 'TEMİZ',
      noReports: 'BİLDİRİM YOK',
      flagged: 'İŞARETLENDİ {n}×',
      redirectsDirect: "DOĞRUDAN",
      redirectsHops: "{n} ATLAMA",
      redirectsFailed: "ÇÖZÜMLEME BAŞARISIZ",
      charAsciiClean: "ASCII TEMİZ",
      charNonAscii: "ASCII-DIŞI",
      charPunycode: "PUNYCODE: {decoded}",
      charSpoof: "SAHTECİLİK: {decoded}",
      hostingKnown: "{cc}",
      hostingUnknown: "BİLİNMİYOR",
      hostingUnavailable: "ERİŞİLEMİYOR",
      whoisUnavailable: "ERİŞİLEMİYOR",
      whoisPrivate: "ÖZEL",
      whoisFresh: "YENİ ({n}G)",
      whoisYoung: "{n}G",
      whoisMature: "> 1Y",
      certUnavailable: 'ERİŞİLEMİYOR',
      certNewDomain: 'YENİ DOMAIN',
      certFresh: 'YENİ ({n}G)',
      certValidDays: 'GEÇERLİ ({n}G)',
      certValidOld: 'GEÇERLİ > 60G',
      checking: 'KONTROL EDİLİYOR…',
    },
    advice: {
      safe: 'Devam edebilirsin. Yine de: toplantı penceresine asla kurtarma ifadesi yapıştırma.',
      dangerous:
        'Sekmeyi kapat. Göndereni bildir. Bugün hiçbir yere kurtarma ifadesi yapıştırma.',
      unrecognized:
        'Başka bir kanaldan doğrula. Tıklamadan önce göndereni farklı bir kanaldan sor.',
      invalid: 'Görmezden gel. Göndereni güvendiğin bir kanaldan tekrar göndermesini iste.',
    },
    support: {
      heading: 'Destek',
      copy: 'kopyala',
      copied: 'kopyalandı',
    },
  },

  verdictWords: {
    safe: 'GÜVENLİ',
    dangerous: 'TEHLİKELİ',
    unrecognized: 'TANINMIYOR',
    invalid: 'GEÇERSİZ',
  },

  howItWorks: {
    sectionTag: 'NASIL ÇALIŞIR',
    heading: 'Üç saniye. {three} kontrol. Tek cevap.',
    headingThree: 'Üç',
    step1: {
      title: 'Linki yapıştır',
      body:
        'URL\'yi gelen kutundan, Slack\'ten, Farcaster\'dan, Telegram\'dan — nereden çıktıysa — at. Hesap yok, uzantı gerekmiyor.',
      miniLabel: 'GİRDİ',
    },
    step2: {
      title: 'Üç şeyi kontrol ediyoruz',
      body:
        'Zoom / Meet / Teams / Calendly resmi domain kayıtlarına karşı. Canlı sertifika şeffaflığı loglarına karşı. Topluluk tehdit feed\'ine karşı — sürekli güncelleniyor.',
      miniLabel: 'TESTLER',
    },
    step3: {
      title: 'İkili karar',
      body:
        '"Risk puanı 7/10" değil. "Dikkatli devam et" değil. Özellikle seçilmiş üç kelimeden biri: {safe}, {dangerous} ya da {unrecognized}. Sonra karar senin.',
      miniLabel: 'ÇIKTI',
      miniOutput: '◆ TEHLİKELİ — açma',
    },
  },

  verdictsExplainer: {
    safeLab: 'Karar A',
    dangerousLab: 'Karar B',
    unrecognizedLab: 'Karar C',
    safeBody:
      'Resmi izin listesinde. 60 günden önce verilmiş bilinen bir sağlayıcıya ait geçerli sertifika. Topluluk bildirimi yok. Devam edebilirsin.',
    dangerousBody:
      'Homograf, typosquat, garip bir TLD\'de yeni sertifika, ya da şu anda engel listesinde. Sekmeyi kapat. Bildir. Arkadaşlarını uyar.',
    unrecognizedBody:
      'Henüz bilmediğimiz küçük bir sağlayıcı olabilir. Güvenli olduğunu söyleyerek yalan atmayacağız. Tıklamadan önce başka bir kanaldan doğrula.',
  },

  report: {
    url: 'Şüpheli URL',
    source: 'Nereden aldın?',
    sourceTelegram: 'Telegram',
    sourceEmail: 'E-posta',
    sourceDm: 'X / Twitter DM',
    sourceCalendar: 'Takvim daveti',
    sourceOther: 'Diğer',
    context: 'Bağlam (opsiyonel)',
    contextPlaceholder:
      'VC olduğunu söyleyen birinden geldi. Bir çağrıya katılmamı istedi.',
    urlPlaceholder: 'https://supheli-zoom-link.click/...',
    submit: 'Bildirimi gönder',
    submitting: 'Gönderiliyor…',
    queued: 'Sağ ol — bildirim inceleme için sıraya alındı.',
    needsChallenge: 'Lütfen doğrulamayı tamamla.',
    failed: 'Gönderim başarısız. Tekrar dene.',
  },

  footer: {
    tagline: 'Önce kontrol et. Sonra {click}.',
    taglineClick: 'tıkla',
    body:
      'Ücretsiz bir kamu aracı. Kayıt yok. Takip yok. Yapıştırdığın URL, seni tanımlayacak bir biçimde asla doğrulayıcımızdan çıkmaz.',
    cta: 'Şimdi bir link kontrol et →',
    productHeading: 'Ürün',
    communityHeading: 'Topluluk',
    webChecker: 'Web doğrulayıcı',
    browserExtension: 'Tarayıcı uzantısı',
    reportALink: 'Bir link bildir',
    credit: '© 2026 {team} — {author} tarafından yapılmış bir kamu aracı',
  },

  theme: {
    switchToDark: 'Koyu moda geç',
    switchToLight: 'Açık moda geç',
  },

  localeLabel: 'Dil',
};
