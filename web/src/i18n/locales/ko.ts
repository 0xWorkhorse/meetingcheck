import type { UiMessages } from '../types.js';

export const ko: UiMessages = {
  nav: {
    checkALink: '링크 확인',
    howItWorks: '작동 방식',
    verdicts: '판정',
    extension: '확장 프로그램',
    pasteALink: '링크 붙여넣기 →',
    tagline: 'v3.2 — 링크 검증기',
  },

  hero: {
    kicker: '가짜 미팅 경보 활성 — Ref. 2026/02 ZOOM 클론 파동',
    kickerMeta: '2026년 2월 드레인 사태 이후 제작',
    headlineLine1: '먼저 {paste}{period}',
    headlineLine2: '그다음 {click}.',
    headlinePaste: '확인',
    headlineClick: '클릭',
    subBody:
      '받은 모든 미팅 초대에 대한 엄격한 이분법 판정을 — {safe}, {dangerous}, 또는 {unrecognized} — 기기에 창이 열리기 전에, 3초 이내로.',
    statLinksChecked: '확인한 링크',
    statScamsFlagged: '표시된 사기',
    statConfirmed: '확인된 사기 도메인',
    statUpdated: '{value} 업데이트',
    statJustNow: '방금 전',
  },

  checker: {
    shellTitle: 'MEETINGCHECK // VERIFIER SHELL',
    sessionLabel: '세션',
    pasteMeetingUrl: '▌ 미팅 URL 붙여넣기',
    verifyBtn: '검증 ↵',
    checkingBtn: '확인 중…',
    verdictStamp: '판정',
    idleStamp: '— 대기 —',
    verifiedAt: '검증됨 {time}',
    inFlight: '처리 중',
    awaiting: '대기 중',
    checking: '확인 중…',
    idleMessage:
      '왼쪽에 미팅 링크를 붙여넣으세요. 공식 도메인, 인증서 기록, 그리고 실시간 커뮤니티 위협 피드와 대조하여 확인합니다.',
    loadingMessage:
      '공식 허용 목록과 커뮤니티 피드에 대해 확인 실행 중.',
    reportThisLink: '이 링크 신고 →',
    errorPrefix: '오류:',
    signals: {
      urlFormat: "URL 형식",
      redirects: "리다이렉트",
      characterCheck: "문자 검사",
      officialDomain: "공식 도메인",
      hosting: "호스팅",
      domainAge: "도메인 나이",
      certTransparency: "인증서 투명성",
      communityFeed: "커뮤니티 피드",
    },
    values: {
      valid: '유효',
      malformed: '형식 오류',
      allowlisted: '허용 목록',
      notAllowlisted: '허용 목록 외',
      lookalike: '유사 / 비공식',
      unknown: '알 수 없음',
      notChecked: '미확인',
      clean: '깨끗함',
      noReports: '신고 없음',
      flagged: '표시됨 {n}×',
      redirectsDirect: "직접",
      redirectsHops: "{n} 홉",
      redirectsFailed: "확장 실패",
      charAsciiClean: "ASCII 클린",
      charNonAscii: "비-ASCII",
      charPunycode: "PUNYCODE: {decoded}",
      charSpoof: "스푸핑: {decoded}",
      hostingKnown: "{cc}",
      hostingUnknown: "알 수 없음",
      hostingUnavailable: "조회 불가",
      whoisUnavailable: "조회 불가",
      whoisPrivate: "비공개",
      whoisFresh: "신규 ({n}일)",
      whoisYoung: "{n}일",
      whoisMature: "> 1년",
      certUnavailable: '조회 불가',
      certNewDomain: '신규 도메인',
      certFresh: '최근 발급 ({n}일)',
      certValidDays: '유효 ({n}일)',
      certValidOld: '유효 > 60일',
      checking: '확인 중…',
    },
    advice: {
      safe: '진행해도 좋습니다. 다만: 미팅 창에 복구 구문을 절대 붙여넣지 마세요.',
      dangerous:
        '탭을 닫으세요. 발신자를 신고하세요. 오늘, 복구 구문을 어디에도 붙여넣지 마세요.',
      unrecognized:
        '다른 경로로 확인하세요. 클릭하기 전에 다른 채널로 발신자에게 물어보세요.',
      invalid: '무시하세요. 신뢰하는 채널로 다시 보내달라고 발신자에게 요청하세요.',
    },
    support: {
      heading: '후원',
      copy: '복사',
      copied: '복사됨',
    },
  },

  verdictWords: {
    safe: '안전',
    dangerous: '위험',
    unrecognized: '미확인',
    invalid: '무효',
  },

  howItWorks: {
    sectionTag: '작동 방식',
    heading: '3초. {three}번의 확인. 하나의 답.',
    headingThree: '세',
    step1: {
      title: '링크 붙여넣기',
      body:
        '받은 편지함, Slack, Farcaster, Telegram — 어디에서 온 URL이든 넣으세요. 계정도, 확장 프로그램도 필요 없습니다.',
      miniLabel: '입력',
    },
    step2: {
      title: '세 가지를 확인합니다',
      body:
        'Zoom / Meet / Teams / Calendly의 공식 도메인 등록부에 대해. 실시간 인증서 투명성 로그에 대해. 커뮤니티 위협 피드에 대해 — 지속적으로 업데이트됩니다.',
      miniLabel: '테스트',
    },
    step3: {
      title: '이분법 판정',
      body:
        '"위험 점수 7/10"이 아닙니다. "주의하여 진행"도 아닙니다. 의도적으로 선택된 세 단어 중 하나: {safe}, {dangerous}, 또는 {unrecognized}. 그 다음은 당신이 결정합니다.',
      miniLabel: '출력',
      miniOutput: '◆ 위험 — 열지 마세요',
    },
  },

  verdictsExplainer: {
    safeLab: '판정 A',
    dangerousLab: '판정 B',
    unrecognizedLab: '판정 C',
    safeBody:
      '공식 허용 목록에 있음. 60일 이전에 발급된 알려진 공급자의 유효한 인증서. 커뮤니티 신고 없음. 진행하세요.',
    dangerousBody:
      '동형문자, 타이포스쿼트, 이상한 TLD의 새로운 인증서, 또는 현재 차단 목록에 있음. 탭을 닫으세요. 신고하세요. 친구들에게 알리세요.',
    unrecognizedBody:
      '우리가 아직 모르는 작은 공급자일 수 있습니다. 안전하다고 거짓말하지 않겠습니다. 클릭하기 전에 다른 경로로 확인하세요.',
  },

  report: {
    url: '의심스러운 URL',
    source: '어디서 받으셨나요?',
    sourceTelegram: 'Telegram',
    sourceEmail: '이메일',
    sourceDm: 'X / Twitter DM',
    sourceCalendar: '캘린더 초대',
    sourceOther: '기타',
    context: '상황 (선택)',
    contextPlaceholder:
      'VC라고 주장하는 사람에게서 받음. 통화에 참여해달라고 함.',
    urlPlaceholder: 'https://suspicious-zoom-link.click/...',
    submit: '신고 제출',
    submitting: '제출 중…',
    queued: '감사합니다 — 신고가 검토 대기열에 있습니다.',
    needsChallenge: '챌린지를 완료해주세요.',
    failed: '제출 실패. 다시 시도해주세요.',
  },

  footer: {
    tagline: '먼저 확인. 그다음 {click}.',
    taglineClick: '클릭',
    body:
      '무료 공공 유틸리티. 가입 없음. 추적 없음. 붙여넣은 URL은 당신을 식별할 수 있는 형태로 우리 검증기를 떠나지 않습니다.',
    cta: '지금 링크 확인 →',
    productHeading: '제품',
    communityHeading: '커뮤니티',
    webChecker: '웹 검증기',
    browserExtension: '브라우저 확장 프로그램',
    reportALink: '링크 신고',
    credit: '© 2026 {team} — {author}가 만든 공공 유틸리티',
  },

  theme: {
    switchToDark: '다크 모드로 전환',
    switchToLight: '라이트 모드로 전환',
  },

  localeLabel: '언어',
};
