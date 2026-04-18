import type { UiMessages } from '../types.js';

export const ja: UiMessages = {
  nav: {
    checkALink: 'リンクを確認',
    howItWorks: '仕組み',
    verdicts: '判定',
    extension: '拡張機能',
    pasteALink: 'リンクを貼る →',
    tagline: 'v3.2 — リンク検証器',
  },

  hero: {
    kicker: '偽ミーティング警報 発令中 — Ref. 2026/02 ZOOM クローン波',
    kickerMeta: '2026年2月のドレイン事件を受けて構築',
    headlineLine1: 'まず{paste}{period}',
    headlineLine2: '次に{click}。',
    headlinePaste: '確認',
    headlineClick: 'クリック',
    subBody:
      '受け取ったミーティング招待すべてに厳格な二者択一の判定を — {safe}、{dangerous}、または {unrecognized} — マシンに何かがウィンドウを開く前に、3秒以内で。',
    statLinksChecked: '確認されたリンク',
    statScamsFlagged: 'フラグ付けされた詐欺',
    statConfirmed: '確認済み詐欺ドメイン',
    statUpdated: '{value} に更新',
    statJustNow: 'たった今',
  },

  checker: {
    shellTitle: 'MEETINGCHECK // VERIFIER SHELL',
    sessionLabel: 'セッション',
    pasteMeetingUrl: '▌ ミーティングURLを貼り付け',
    verifyBtn: '検証 ↵',
    checkingBtn: '確認中…',
    verdictStamp: '判定',
    idleStamp: '— 待機中 —',
    verifiedAt: '検証済 {time}',
    inFlight: '処理中',
    awaiting: '待機中',
    checking: '確認中…',
    idleMessage:
      '左側にミーティングリンクを貼り付けてください。公式ドメイン、証明書記録、そしてライブのコミュニティ脅威フィードに対して確認します。',
    loadingMessage:
      '公式許可リストとコミュニティフィードに対して確認を実行中。',
    reportThisLink: 'このリンクを報告 →',
    errorPrefix: 'エラー:',
    signals: {
      urlFormat: 'URL形式',
      officialDomain: '公式ドメイン',
      certTransparency: '証明書の透明性',
      communityFeed: 'コミュニティフィード',
    },
    values: {
      valid: '有効',
      malformed: '不正形式',
      allowlisted: '許可リスト掲載',
      notAllowlisted: '許可リスト外',
      lookalike: '偽装 / 非公式',
      unknown: '不明',
      notChecked: '未確認',
      clean: 'クリーン',
      noReports: '報告なし',
      flagged: 'フラグ {n}×',
      certUnavailable: '取得不可',
      certNewDomain: '新規ドメイン',
      certFresh: '新発行 ({n}日)',
      certValidDays: '有効 ({n}日)',
      certValidOld: '有効 > 60日',
      checking: '確認中…',
    },
    advice: {
      safe: '進んで大丈夫。ただし、ミーティングウィンドウにリカバリーフレーズを絶対に貼り付けないこと。',
      dangerous:
        'タブを閉じてください。送信者を報告してください。今日、リカバリーフレーズをどこにも貼り付けないでください。',
      unrecognized:
        '別の経路で確認を。クリックする前に、送信者に別のチャンネルで聞いてください。',
      invalid: '無視してください。信頼できる経路で再送信するよう送信者に頼んでください。',
    },
    support: {
      heading: 'サポート',
      copy: 'コピー',
      copied: 'コピー済み',
    },
  },

  verdictWords: {
    safe: '安全',
    dangerous: '危険',
    unrecognized: '未確認',
    invalid: '無効',
  },

  howItWorks: {
    sectionTag: '仕組み',
    heading: '3秒。{three}つのチェック。1つの答え。',
    headingThree: '3',
    step1: {
      title: 'リンクを貼る',
      body:
        'メール、Slack、Farcaster、Telegram — どこから来たURLでも放り込んでください。アカウントも拡張機能も不要です。',
      miniLabel: '入力',
    },
    step2: {
      title: '3つのことをチェック',
      body:
        'Zoom / Meet / Teams / Calendlyの公式ドメイン登録に対して。ライブの証明書透明性ログに対して。コミュニティ脅威フィードに対して — 継続的に更新されます。',
      miniLabel: 'テスト',
    },
    step3: {
      title: '二者択一の判定',
      body:
        '「リスクスコア7/10」ではなく。「注意して進む」でもなく。意図的に選ばれた3つの言葉のひとつ：{safe}、{dangerous}、または {unrecognized}。あとはあなたが決めます。',
      miniLabel: '出力',
      miniOutput: '◆ 危険 — 開かないでください',
    },
  },

  verdictsExplainer: {
    safeLab: '判定 A',
    dangerousLab: '判定 B',
    unrecognizedLab: '判定 C',
    safeBody:
      '公式許可リストに掲載。60日以上前に発行された既知のプロバイダーの証明書。コミュニティ報告なし。進んで大丈夫。',
    dangerousBody:
      '同形文字、タイポスクワット、怪しいTLDでの新しい証明書、または現在ブロックリスト中。タブを閉じて。報告して。友達に知らせて。',
    unrecognizedBody:
      'まだ私たちが知らない小さなプロバイダーかもしれません。安全と嘘はつきません。クリックする前に、別の経路で確認してください。',
  },

  report: {
    url: '疑わしいURL',
    source: 'どこで受け取りましたか？',
    sourceTelegram: 'Telegram',
    sourceEmail: 'メール',
    sourceDm: 'X / Twitter DM',
    sourceCalendar: 'カレンダー招待',
    sourceOther: 'その他',
    context: '文脈（任意）',
    contextPlaceholder:
      'VCを名乗る人から受け取りました。通話に参加するよう頼まれました。',
    urlPlaceholder: 'https://suspicious-zoom-link.click/...',
    submit: '報告を送信',
    submitting: '送信中…',
    queued: 'ありがとうございます — 報告はレビュー待ちです。',
    needsChallenge: 'チャレンジを完了してください。',
    failed: '送信失敗。もう一度お試しください。',
  },

  footer: {
    tagline: 'まず確認。次に{click}。',
    taglineClick: 'クリック',
    body:
      '無料の公共ユーティリティ。サインアップなし。トラッキングなし。貼り付けたURLは、あなたを特定できる形で私たちの検証器を離れることはありません。',
    cta: '今すぐリンクを確認 →',
    productHeading: 'プロダクト',
    communityHeading: 'コミュニティ',
    webChecker: 'Webチェッカー',
    browserExtension: 'ブラウザ拡張機能',
    reportALink: 'リンクを報告',
    credit: '© 2026 {team} — {author} が構築した公共ユーティリティ',
  },

  theme: {
    switchToDark: 'ダークモードに切替',
    switchToLight: 'ライトモードに切替',
  },

  localeLabel: '言語',
};
