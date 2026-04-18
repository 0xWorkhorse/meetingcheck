import type { UiMessages } from '../types.js';

export const vi: UiMessages = {
  nav: {
    checkALink: 'Kiểm tra liên kết',
    howItWorks: 'Cách hoạt động',
    verdicts: 'Phán quyết',
    extension: 'Tiện ích',
    pasteALink: 'Dán liên kết →',
    tagline: 'v3.2 — trình xác minh liên kết',
  },

  hero: {
    kicker: 'Cảnh báo họp giả đang hoạt động — Ref. 2026/02 ĐỢT SÓNG ZOOM-CLONE',
    kickerMeta: 'Xây dựng sau vụ drain tháng 2/2026',
    headlineLine1: '{paste} trước{period}',
    headlineLine2: '{click} sau.',
    headlinePaste: 'Kiểm tra',
    headlineClick: 'Bấm',
    subBody:
      'Một phán quyết nhị phân nghiêm ngặt cho mỗi lời mời họp bạn nhận được — {safe}, {dangerous} hoặc {unrecognized} — dưới ba giây, trước khi bất cứ thứ gì mở cửa sổ trên máy bạn.',
    statLinksChecked: 'liên kết được kiểm tra',
    statScamsFlagged: 'vụ lừa đảo được gắn cờ',
    statConfirmed: 'tên miền lừa đảo đã xác nhận',
    statUpdated: 'Cập nhật {value}',
    statJustNow: 'vừa xong',
  },

  checker: {
    shellTitle: 'MEETINGCHECK // VERIFIER SHELL',
    sessionLabel: 'phiên',
    pasteMeetingUrl: '▌ Dán URL cuộc họp',
    verifyBtn: 'XÁC MINH ↵',
    checkingBtn: 'ĐANG KIỂM TRA…',
    verdictStamp: 'PHÁN QUYẾT',
    idleStamp: '— CHỜ —',
    verifiedAt: 'ĐÃ XÁC MINH {time}',
    inFlight: 'ĐANG XỬ LÝ',
    awaiting: 'ĐANG CHỜ',
    checking: 'ĐANG KIỂM TRA…',
    idleMessage:
      'Dán liên kết họp vào bên trái. Chúng tôi sẽ kiểm tra nó với các tên miền chính thức, hồ sơ chứng chỉ và nguồn cấp dữ liệu đe dọa cộng đồng trực tiếp của chúng tôi.',
    loadingMessage:
      'Đang chạy kiểm tra với danh sách cho phép chính thức và nguồn cấp cộng đồng.',
    reportThisLink: 'Báo cáo liên kết này →',
    errorPrefix: 'Lỗi:',
    signals: {
      urlFormat: 'Định dạng URL',
      officialDomain: 'Tên miền chính thức',
      certTransparency: 'Minh bạch chứng chỉ',
      communityFeed: 'Nguồn cấp cộng đồng',
    },
    values: {
      valid: 'HỢP LỆ',
      malformed: 'SAI ĐỊNH DẠNG',
      allowlisted: 'ĐÃ CHO PHÉP',
      notAllowlisted: 'KHÔNG CHO PHÉP',
      lookalike: 'GIẢ MẠO / KHÔNG CHÍNH THỨC',
      unknown: 'KHÔNG RÕ',
      notChecked: 'CHƯA KIỂM TRA',
      clean: 'SẠCH',
      noReports: 'KHÔNG CÓ BÁO CÁO',
      flagged: 'GẮN CỜ {n}×',
      certUnavailable: 'KHÔNG CÓ DỮ LIỆU',
      certNewDomain: 'TÊN MIỀN MỚI',
      certFresh: 'MỚI ({n}N)',
      certValidDays: 'HỢP LỆ ({n}N)',
      certValidOld: 'HỢP LỆ > 60N',
      checking: 'ĐANG KIỂM TRA…',
    },
    advice: {
      safe: 'Tiếp tục được. Nhưng: không bao giờ dán seed phrase vào cửa sổ họp.',
      dangerous:
        'Đóng tab. Báo cáo người gửi. Không dán seed phrase ở bất kỳ đâu, ngay hôm nay.',
      unrecognized:
        'Xác minh qua kênh khác. Hỏi người gửi ở kênh khác trước khi bấm.',
      invalid: 'Bỏ qua. Yêu cầu người gửi gửi lại qua kênh bạn tin tưởng.',
    },
    support: {
      heading: 'Hỗ trợ',
      copy: 'sao chép',
      copied: 'đã sao chép',
    },
  },

  verdictWords: {
    safe: 'AN TOÀN',
    dangerous: 'NGUY HIỂM',
    unrecognized: 'KHÔNG RÕ',
    invalid: 'KHÔNG HỢP LỆ',
  },

  howItWorks: {
    sectionTag: 'CÁCH HOẠT ĐỘNG',
    heading: 'Ba giây. {three} kiểm tra. Một câu trả lời.',
    headingThree: 'Ba',
    step1: {
      title: 'Dán liên kết',
      body:
        'Thả URL từ hộp thư, Slack, Farcaster, Telegram — bất cứ đâu nó xuất hiện. Không cần tài khoản, không cần tiện ích.',
      miniLabel: 'ĐẦU VÀO',
    },
    step2: {
      title: 'Chúng tôi kiểm tra ba thứ',
      body:
        'So với sổ đăng ký tên miền chính thức của Zoom / Meet / Teams / Calendly. So với nhật ký minh bạch chứng chỉ trực tiếp. So với nguồn cấp đe dọa cộng đồng — cập nhật liên tục.',
      miniLabel: 'KIỂM TRA',
    },
    step3: {
      title: 'Phán quyết nhị phân',
      body:
        'Không phải "điểm rủi ro 7/10." Không phải "tiếp tục cẩn thận." Một trong ba từ, được chọn có chủ đích: {safe}, {dangerous} hoặc {unrecognized}. Rồi bạn quyết định.',
      miniLabel: 'ĐẦU RA',
      miniOutput: '◆ NGUY HIỂM — không mở',
    },
  },

  verdictsExplainer: {
    safeLab: 'Phán quyết A',
    dangerousLab: 'Phán quyết B',
    unrecognizedLab: 'Phán quyết C',
    safeBody:
      'Trong danh sách cho phép chính thức. Chứng chỉ hợp lệ của một nhà cung cấp đã biết, cấp hơn 60 ngày trước. Không có báo cáo cộng đồng. Tiếp tục.',
    dangerousBody:
      'Homograph, typosquat, chứng chỉ mới trên TLD lạ, hoặc đang trong danh sách chặn. Đóng tab. Báo cáo. Nói với bạn bè.',
    unrecognizedBody:
      'Có thể là một nhà cung cấp nhỏ mà chúng tôi chưa biết. Chúng tôi sẽ không nói dối rằng nó an toàn. Xác minh qua kênh khác trước khi bấm.',
  },

  report: {
    url: 'URL đáng ngờ',
    source: 'Bạn nhận được ở đâu?',
    sourceTelegram: 'Telegram',
    sourceEmail: 'Email',
    sourceDm: 'DM X / Twitter',
    sourceCalendar: 'Lời mời lịch',
    sourceOther: 'Khác',
    context: 'Bối cảnh (không bắt buộc)',
    contextPlaceholder:
      'Nhận từ một người tự xưng là VC. Yêu cầu tôi tham gia cuộc gọi.',
    urlPlaceholder: 'https://lien-ket-zoom-dang-ngo.click/...',
    submit: 'Gửi báo cáo',
    submitting: 'Đang gửi…',
    queued: 'Cảm ơn — báo cáo đang chờ xem xét.',
    needsChallenge: 'Vui lòng hoàn thành thử thách.',
    failed: 'Gửi thất bại. Hãy thử lại.',
  },

  footer: {
    tagline: 'Kiểm tra trước. {click} sau.',
    taglineClick: 'Bấm',
    body:
      'Một tiện ích công cộng miễn phí. Không đăng ký. Không theo dõi. URL bạn dán không bao giờ rời khỏi trình kiểm tra của chúng tôi dưới dạng có thể nhận dạng bạn.',
    cta: 'Kiểm tra liên kết ngay →',
    productHeading: 'Sản phẩm',
    communityHeading: 'Cộng đồng',
    webChecker: 'Trình kiểm tra web',
    browserExtension: 'Tiện ích trình duyệt',
    reportALink: 'Báo cáo liên kết',
    credit: '© 2026 {team} — tiện ích công cộng được xây dựng bởi {author}',
  },

  theme: {
    switchToDark: 'Chuyển sang chế độ tối',
    switchToLight: 'Chuyển sang chế độ sáng',
  },

  localeLabel: 'Ngôn ngữ',
};
