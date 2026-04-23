import type { UiMessages } from '../types.js';

export const zh: UiMessages = {
  nav: {
    checkALink: '检查链接',
    howItWorks: '工作原理',
    verdicts: '判定',
    extension: '扩展',
    extensionPopover: "正在烹饪中，敬请期待 ;)",
    pasteALink: '粘贴链接 →',
    tagline: 'v3.2 — 链接核查器',
  },

  hero: {
    headlineLine1: '先{paste}{period}',
    headlineLine2: '再{click}。',
    headlinePaste: '核查',
    headlineClick: '点击',
    subBody:
      '对每一个会议邀请给出严格的二元判定 —— {safe}、{dangerous} 或 {unrecognized} —— 在任何窗口在你机器上打开之前，不到三秒就完成。',
    statLinksChecked: '已核查链接',
    statScamsFlagged: '已标记诈骗',
    statConfirmed: '已确认的诈骗域名',
    statUpdated: '更新于 {value}',
    statJustNow: '刚刚',
  },

  checker: {
    shellTitle: 'MEETINGCHECK // VERIFIER SHELL',
    sessionLabel: '会话',
    pasteMeetingUrl: '▌ 粘贴会议 URL',
    verifyBtn: '核查 ↵',
    checkingBtn: '核查中…',
    verdictStamp: '判定',
    idleStamp: '— 待机 —',
    verifiedAt: '已核查 {time}',
    inFlight: '进行中',
    awaiting: '等待中',
    checking: '核查中…',
    checkedAs: "已检查：{url}",
    idleMessage:
      '在左侧粘贴一个会议链接。我们会将其与官方域名、证书记录以及实时社区威胁源进行对比。',
    loadingMessage:
      '正在根据官方允许列表和社区威胁源运行核查。',
    reportThisLink: '举报此链接 →',
    errorPrefix: '错误：',
    signals: {
      urlFormat: "URL 格式",
      redirects: "跳转",
      characterCheck: "字符检查",
      officialDomain: "官方域名",
      hosting: "托管地",
      domainAge: "域名年龄",
      certTransparency: "证书透明度",
      communityFeed: "社区威胁源",
    },
    values: {
      valid: '有效',
      malformed: '格式错误',
      allowlisted: '在允许列表中',
      notAllowlisted: '不在允许列表',
      lookalike: '仿冒 / 非官方',
      unknown: '未知',
      notChecked: '未核查',
      clean: '干净',
      noReports: '无举报',
      flagged: '已标记 {n}×',
      redirectsDirect: "直达",
      redirectsHops: "{n} 跳",
      redirectsFailed: "展开失败",
      charAsciiClean: "ASCII 正常",
      charNonAscii: "非-ASCII",
      charPunycode: "PUNYCODE：{decoded}",
      charSpoof: "仿冒：{decoded}",
      hostingKnown: "{cc}",
      hostingUnknown: "未知",
      hostingUnavailable: "不可用",
      whoisUnavailable: "不可用",
      whoisPrivate: "隐私保护",
      whoisFresh: "新 ({n}天)",
      whoisYoung: "{n}天",
      whoisMature: "> 1年",
      certUnavailable: '不可用',
      certNewDomain: '新域名',
      certFresh: '新发 ({n}天)',
      certValidDays: '有效 ({n}天)',
      certValidOld: '有效 > 60天',
      checking: '核查中…',
    },
    advice: {
      safe: '可以继续。但切记：绝不要在任何会议窗口中粘贴助记词。',
      dangerous:
        '关闭标签页。举报发送者。今天不要在任何地方粘贴助记词。',
      unrecognized:
        '请通过其他渠道核实。点击之前，通过另一个渠道询问发送者。',
      invalid: '忽略它。请发送者通过你信任的渠道重新发送。',
    },
    support: {
      heading: '支持',
      copy: '复制',
      copied: '已复制',
    },
  },

  verdictWords: {
    safe: '安全',
    dangerous: '危险',
    unrecognized: '未识别',
    invalid: '无效',
  },

  howItWorks: {
    sectionTag: '工作原理',
    heading: '三秒。{three}项核查。一个答案。',
    headingThree: '三',
    step1: {
      title: '粘贴链接',
      body:
        '把来自邮箱、Slack、Farcaster、Telegram —— 不管从哪里冒出来的 URL —— 放进来。无需账号，无需扩展。',
      miniLabel: '输入',
    },
    step2: {
      title: '我们核查三件事',
      body:
        '对比 Zoom / Meet / Teams / Calendly 的官方域名注册。对比实时证书透明度日志。对比社区威胁源 —— 持续更新。',
      miniLabel: '测试',
    },
    step3: {
      title: '二元判定',
      body:
        '不是"风险评分 7/10"。不是"请谨慎进行"。特意挑选的三个词之一：{safe}、{dangerous} 或 {unrecognized}。然后由你决定。',
      miniLabel: '输出',
      miniOutput: '◆ 危险 — 请勿打开',
    },
  },

  verdictsExplainer: {
    safeLab: '判定 A',
    dangerousLab: '判定 B',
    unrecognizedLab: '判定 C',
    safeBody:
      '在官方允许列表中。证书来自已知提供商，签发于 60 天以上之前。无社区举报。可以继续。',
    dangerousBody:
      '同形字、拼写仿冒、非主流 TLD 上的新鲜证书，或当前在屏蔽列表中。关闭标签页。举报它。告诉你的朋友。',
    unrecognizedBody:
      '可能是我们还不认识的小型提供商。我们不会撒谎说它是安全的。点击之前，请通过其他渠道核实。',
  },

  report: {
    url: '可疑 URL',
    source: '你从哪里收到的？',
    sourceTelegram: 'Telegram',
    sourceEmail: '电子邮件',
    sourceDm: 'X / Twitter 私信',
    sourceCalendar: '日历邀请',
    sourceOther: '其他',
    context: '背景（可选）',
    contextPlaceholder:
      '来自一个自称 VC 的人。让我加入一个通话。',
    urlPlaceholder: 'https://suspicious-zoom-link.click/...',
    submit: '提交举报',
    submitting: '提交中…',
    queued: '谢谢 —— 举报已排队等待审核。',
    needsChallenge: '请完成验证。',
    failed: '提交失败。请重试。',
  },

  footer: {
    tagline: '先核查。再{click}。',
    taglineClick: '点击',
    body:
      '一个免费的公共工具。无需注册。不做追踪。你粘贴的 URL 不会以识别你身份的形式离开我们的核查器。',
    cta: '现在核查一个链接 →',
    productHeading: '产品',
    communityHeading: '社区',
    webChecker: '网页核查器',
    browserExtension: '浏览器扩展',
    reportALink: '举报链接',
    credit: '© 2026 {team} —— 由 {author} 构建的公共工具',
  },

  theme: {
    switchToDark: '切换到深色模式',
    switchToLight: '切换到浅色模式',
  },

  localeLabel: '语言',
};
