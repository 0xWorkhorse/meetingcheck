import type { UiMessages } from '../types.js';

export const id: UiMessages = {
  nav: {
    checkALink: 'Cek link',
    howItWorks: 'Cara kerja',
    verdicts: 'Keputusan',
    extension: 'Ekstensi',
    pasteALink: 'Tempel link →',
    tagline: 'v3.2 — verifikator link',
  },

  hero: {
    kicker: 'Peringatan meeting palsu aktif — Ref. 2026/02 GELOMBANG ZOOM-CLONE',
    kickerMeta: 'Dibangun setelah drain Februari 2026',
    headlineLine1: '{paste} dulu{period}',
    headlineLine2: '{click} kemudian.',
    headlinePaste: 'Cek',
    headlineClick: 'Klik',
    subBody:
      'Keputusan biner yang tegas untuk setiap undangan meeting yang kamu terima — {safe}, {dangerous}, atau {unrecognized} — dalam kurang dari tiga detik, sebelum ada yang membuka jendela di mesin kamu.',
    statLinksChecked: 'link dicek',
    statScamsFlagged: 'penipuan ditandai',
    statConfirmed: 'domain penipuan terkonfirmasi',
    statUpdated: 'Diperbarui {value}',
    statJustNow: 'barusan',
  },

  checker: {
    shellTitle: 'MEETINGCHECK // VERIFIER SHELL',
    sessionLabel: 'sesi',
    pasteMeetingUrl: '▌ Tempel URL meeting',
    verifyBtn: 'VERIFIKASI ↵',
    checkingBtn: 'MENGECEK…',
    verdictStamp: 'KEPUTUSAN',
    idleStamp: '— DIAM —',
    verifiedAt: 'DIVERIFIKASI {time}',
    inFlight: 'SEDANG BERJALAN',
    awaiting: 'MENUNGGU',
    checking: 'MENGECEK…',
    idleMessage:
      'Tempel link meeting di sebelah kiri. Kami akan mengeceknya terhadap domain resmi, catatan sertifikat, dan feed ancaman komunitas live kami.',
    loadingMessage:
      'Menjalankan pengecekan terhadap allowlist resmi dan feed komunitas.',
    reportThisLink: 'Laporkan link ini →',
    errorPrefix: 'Error:',
    signals: {
      urlFormat: 'Format URL',
      officialDomain: 'Domain resmi',
      certTransparency: 'Transparansi sert.',
      communityFeed: 'Feed komunitas',
    },
    values: {
      valid: 'VALID',
      malformed: 'RUSAK',
      allowlisted: 'DIIZINKAN',
      notAllowlisted: 'TIDAK DIIZINKAN',
      lookalike: 'MIRIP / TIDAK RESMI',
      unknown: 'TIDAK DIKENAL',
      notChecked: 'BELUM DICEK',
      clean: 'BERSIH',
      noReports: 'TIDAK ADA LAPORAN',
      flagged: 'DITANDAI {n}×',
      checking: 'MENGECEK…',
    },
    advice: {
      safe: 'Lanjutkan. Tapi: jangan pernah menempel seed phrase ke jendela meeting.',
      dangerous:
        'Tutup tab. Laporkan pengirim. Jangan menempel seed phrase di mana pun, hari ini.',
      unrecognized:
        'Verifikasi lewat saluran lain. Tanya pengirim di saluran berbeda sebelum klik.',
      invalid: 'Abaikan. Minta pengirim mengirim ulang lewat saluran yang kamu percaya.',
    },
    support: {
      heading: 'Dukungan',
      copy: 'salin',
      copied: 'tersalin',
    },
  },

  verdictWords: {
    safe: 'AMAN',
    dangerous: 'BERBAHAYA',
    unrecognized: 'TIDAK DIKENAL',
    invalid: 'TIDAK VALID',
  },

  howItWorks: {
    sectionTag: 'CARA KERJA',
    heading: 'Tiga detik. {three} pengecekan. Satu jawaban.',
    headingThree: 'Tiga',
    step1: {
      title: 'Tempel link',
      body:
        'Lempar URL dari inbox, Slack, Farcaster, Telegram — di mana pun muncul. Tidak perlu akun, tidak perlu ekstensi.',
      miniLabel: 'INPUT',
    },
    step2: {
      title: 'Kami mengecek tiga hal',
      body:
        'Terhadap registri domain resmi Zoom / Meet / Teams / Calendly. Terhadap log transparansi sertifikat live. Terhadap feed ancaman komunitas — diperbarui terus-menerus.',
      miniLabel: 'TES',
    },
    step3: {
      title: 'Keputusan biner',
      body:
        'Bukan "skor risiko 7/10." Bukan "lanjutkan dengan hati-hati." Salah satu dari tiga kata, dipilih sengaja: {safe}, {dangerous}, atau {unrecognized}. Lalu kamu yang putuskan.',
      miniLabel: 'OUTPUT',
      miniOutput: '◆ BERBAHAYA — jangan buka',
    },
  },

  verdictsExplainer: {
    safeLab: 'Keputusan A',
    dangerousLab: 'Keputusan B',
    unrecognizedLab: 'Keputusan C',
    safeBody:
      'Di allowlist resmi. Sertifikat valid dari penyedia yang dikenal, diterbitkan lebih dari 60 hari lalu. Tidak ada laporan komunitas. Lanjutkan.',
    dangerousBody:
      'Homograf, typosquat, sertifikat baru di TLD aneh, atau saat ini ada di blocklist. Tutup tab. Laporkan. Kasih tahu teman-temanmu.',
    unrecognizedBody:
      'Bisa jadi penyedia kecil yang belum kami kenal. Kami tidak akan bohong dan bilang itu aman. Verifikasi lewat saluran lain sebelum klik.',
  },

  report: {
    url: 'URL mencurigakan',
    source: 'Dapat dari mana?',
    sourceTelegram: 'Telegram',
    sourceEmail: 'Email',
    sourceDm: 'DM X / Twitter',
    sourceCalendar: 'Undangan kalender',
    sourceOther: 'Lainnya',
    context: 'Konteks (opsional)',
    contextPlaceholder:
      'Dapat dari orang yang mengaku sebagai VC. Minta saya bergabung ke call.',
    urlPlaceholder: 'https://link-zoom-mencurigakan.click/...',
    submit: 'Kirim laporan',
    submitting: 'Mengirim…',
    queued: 'Makasih — laporan dalam antrian untuk ditinjau.',
    needsChallenge: 'Mohon selesaikan tantangan.',
    failed: 'Pengiriman gagal. Coba lagi.',
  },

  footer: {
    tagline: 'Cek dulu. {click} kemudian.',
    taglineClick: 'Klik',
    body:
      'Utilitas publik gratis. Tanpa pendaftaran. Tanpa pelacakan. URL yang kamu tempel tidak pernah meninggalkan checker kami dalam bentuk yang mengidentifikasi kamu.',
    cta: 'Cek link sekarang →',
    productHeading: 'Produk',
    communityHeading: 'Komunitas',
    webChecker: 'Checker web',
    browserExtension: 'Ekstensi browser',
    reportALink: 'Laporkan link',
    credit: '© 2026 {team} — utilitas publik dibangun oleh {author}',
  },

  theme: {
    switchToDark: 'Ganti ke mode gelap',
    switchToLight: 'Ganti ke mode terang',
  },

  localeLabel: 'Bahasa',
};
