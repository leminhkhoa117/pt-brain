/**
 * Cơ đùi trước & sau: quadriceps và hamstrings.
 *
 * Nguồn: Gray432 color (public domain, ảnh quadriceps đã verify qua bài
 * Wikipedia), OpenStax A&P (cite-only).
 */
export default {
  slug: 'anat-2-7',
  module: 'anat',
  chapter: 2,
  chapterTitle: 'Hệ cơ theo vùng',
  order: 7,
  title: 'Cơ đùi trước và đùi sau: cỗ máy hai đầu của squat',
  subtitle:
    'Quadriceps bốn đầu với ba đầu thuần gối, hamstrings ba cơ hai khớp — hiểu "cơ hai khớp" là chìa khóa chọn bài cho đùi.',
  minutes: 11,
  objectives: [
    'Gọi tên 4 đầu của quadriceps và phân biệt đầu chạy qua hông (rectus femoris) với ba đầu thuần gối.',
    'Liệt kê 3 cơ hamstring và nhóm chức năng kép: gấp gối + duỗi hông.',
    'Giải thích vì sao RDL và leg curl huấn luyện hamstring ở hai tư thế dài/ngắn khác nhau.',
    'Áp dụng mô hình "cơ hai khớp" để chọn và điều chỉnh bài cho đùi.',
  ],
  sections: [
    {
      heading: 'Quadriceps: bốn đầu, hai loại bám',
      body: `Nhóm cơ đùi trước gồm **bốn đầu** hội tụ về một gân chung bám vào xương bánh chè rồi xuống **gờ chày**:

- **Rectus femoris**: bắt đầu từ gai chậu trước (xương chậu) — chạy **qua cả khớp hông lẫn khớp gối**: gấp hông + duỗi gối. Vì bám qua hông, nó chỉ duỗi gối tốt khi hông đang gập (đó là lý do leg press/squat "gọi" đầu này nhiều hơn leg extension ngồi thẳng).
- **Vastus lateralis / medialis / intermedius**: bám từ thân xương đùi, **chỉ qua khớp gối** — chuyên duỗi gối, hoạt động mọi tư thế hông.

Lưu ý thực hành: quan niệm "tập VMO riêng để chữa đau gối" hiện không được ủng hộ mạnh — các vastus cùng gân chung, không thể tuyển chọn tách bạch bằng một tư thế; nhắm cả nhóm + kiểm soát bánh chè theo đường rãnh là hướng có bằng chứng.`,
      image: 'anat-2-7-quads.png',
    },
    {
      heading: 'Hamstrings: ba cơ hai khớp',
      body: `Nhóm đùi sau gồm **ba cơ**: biceps femoris (ngoài), semitendinosus, semimembranosus (trong). Tất cả bám gốc từ **mỏm ngồi xương chậu**, chạy qua hai khớp: **gấp gối + duỗi hông**.

Đặc tính "hai khớp" tạo ra hai tư thế huấn luyện khác nhau:

- **Hông gập (đùi ở tư thế dài)** — RDL, deadlift: hamstring vừa duỗi hông vừa bị kéo dài → tải lớn ở **tư thế dài cơ**; đây là vị trí thường bị rách khi sprint.
- **Gối gập (đùi ở tư thế ngắn)** — leg curl, Nordic curl: tải vào chức năng **gấp gối**.

Nordic curl (đã có trong thư viện app) là bài **eccentric** — giai đoạn mà nghiên cứu cho giảm rõ rủi ro chấn thương hamstring cho người chạy nước rút; nhóm này cũng giúp gánh điều khiển tốc độ hạ người trong squat.`,
    },
    {
      heading: 'Sức mạnh trên tư thế dài cơ: vì sao squat đáy "nặng gấp"',
      body: `Ở đáy squat, mọi cơ hai khớp đều ở thế khó:

- Hamstrings **không thể dài thêm nữa** vì gối gập đồng thời hông gập — chúng "đứng yên" làm cố định, không hỗ trợ duỗi đáng kể.
- Gánh duỗi hông chuyển sang **gluteus maximus** và adductor magnus (đã gặp ở bài Hông & mông).

Hệ quả khi đọc kỹ thuật khách:

- "Squat đáy mông yếu → lưng thấp/toại ra trước" — thường đúng hơn "quadriceps yếu".
- Khách than "đùi sau căng khi squat sâu dù không gập gối" — bình thường: chúng đang bị kéo dài qua hông.
- Nhảy sau chạy nước rút đau đùi sau: đó chính là lúc hamstring tối dài + co tối đại — nơi rủi ro rách cao nhất; warm-up + bài eccentric (Nordic) là phòng ngừa chuẩn.`,
    },
  ],
  applyBox: `**Gian tập thực hành — phân bổ 1 buổi đùi cân bằng:**
1. Squat hoặc leg press 4 set (compound): toàn nhóm quad + mông cùng làm việc.
2. Leg extension 2–3 set cuối: cô lập duỗi gối mọi tư thế hông.
3. RDL 3 set: hamstring ở tư thế dài — kiểm soát pha hạ 3 giây.
4. Leg curl hoặc Nordic curl 2–3 set: gấp gối + eccentric bảo vệ sprint.
5. Ghi chú: khách chạy bộ/chơi bóng → Nordic 1–2 set mỗi tuần quanh năm, không đợi tới mùa.`,
  terms: [
    {
      en: 'Rectus femoris',
      vi: 'Cơ thẳng đùi',
      def: 'Đầu quad bám qua hông: gấp hông + duỗi gối; hoạt động mạnh khi hông gập (leg press/squat).',
    },
    {
      en: 'Vastus lateralis / medialis / intermedius',
      vi: 'Cơ rộng ngoài / trong / giữa',
      def: 'Ba đầu vastus bám từ xương đùi, chỉ qua khớp gối — chuyên duỗi gối mọi tư thế.',
    },
    {
      en: 'Hamstrings (3 cơ)',
      vi: 'Nhóm đùi sau',
      def: 'Biceps femoris + semitendinosus + semimembranosus: gấp gối và duỗi hông, bám từ mỏm ngồi.',
    },
    {
      en: 'Two-joint muscle',
      vi: 'Cơ hai khớp',
      def: 'Cơ chạy qua hai khớp: chức năng và độ dài thay đổi theo tư thế — quyết định chọn bài (RDL vs leg curl).',
    },
    {
      en: 'Nordic curl (eccentric)',
      vi: 'Nordic curl pha hạ',
      def: 'Bài eccentric hamstring điển hình — công cụ giảm rủi ro chấn thương sprint có bằng chứng.',
    },
  ],
  images: [
    {
      file: 'anat-2-7-quads.png',
      caption: 'Nhóm cơ đùi trước — quadriceps (bản khắc Gray\u2019s Anatomy, Plate 432, bản tô màu).',
      source: "Gray's Anatomy (H.V. Carter) / Wikimedia Commons",
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gray432_color.png',
      license: 'Public domain',
    },
  ],
  quiz: [
    {
      q: 'Đầu quadriceps nào hoạt động mạnh hơn khi hông đang gập (leg press, squat)?',
      choices: [
        'Vastus medialis',
        'Rectus femoris — vì bám qua khớp hông',
        'Vastus intermedius',
        'Không đầu nào khác biệt',
      ],
      answer: 1,
      explain:
        'Rectus femoris là đầu duy nhất bám từ xương chậu: gập hông càng nhiều, nó càng vào "đúng hướng sợi" để duỗi gối.',
    },
    {
      q: 'RDL và leg curl cùng nhắm hamstrings nhưng khác nhau ở đâu?',
      choices: [
        'Hoàn toàn giống nhau',
        'RDL tải vào tư thế dài cơ (duỗi hông + kéo dài), leg curl tải vào chức năng gấp gối với cơ ngắn hơn',
        'RDL là bài gấp gối, leg curl là bài duỗi hông',
        'Leg curl không tác động tới hamstrings',
      ],
      answer: 1,
      explain:
        'Cơ hai khớp cần được huấn luyện ở nhiều tư thế dài/ngắn — RDL cho đường dài (nơi rách sprint), leg curl cho gấp gối.',
    },
    {
      q: 'Vì sao hamstring ít hỗ trợ duỗi hông ở đáy squat sâu?',
      choices: [
        'Chúng không bám vào hông',
        'Gối gập + hông gập khiến chúng đã tối dài — "đứng yên" làm cố định, không còn biên độ co thêm',
        'Chúng chỉ hoạt động khi đứng một chân',
        'Squat không cần duỗi hông',
      ],
      answer: 1,
      explain:
        'Ở đáy squat, hamstrings ngắn hóa vì hai đầu bám lại gần nhau; gánh duỗi hông chuyển sang mông và adductor magnus — lý do "đáy squat là bài mông".',
    },
    {
      q: 'Khách chạy nước rút muốn giảm rủi ro rách đùi sau. Bài nào là tiêu chuẩn phòng ngừa?',
      choices: [
        'Leg extension nặng',
        'Nordic curl (eccentric hamstring) đều đặn quanh năm',
        'Sit-up mỗi ngày',
        'Chỉ giãn tĩnh trước buổi',
      ],
      answer: 1,
      explain:
        'Eccentric hamstring training (Nordic) là một trong số ít can thiệp có bằng chứng mạnh giảm tỉ lệ chấn thương sprint.',
    },
    {
      q: 'Quan niệm "tập VMO riêng để chữa đau quanh xương bánh chè" hiện được đánh giá thế nào?',
      choices: [
        'Được ủng hộ tuyệt đối',
        'Các vastus dùng chung gân, khó tuyển chọn tách bạch — hướng có bằng chứng là tập cả nhóm + kiểm soát đường rãnh bánh chè',
        'VMO không tồn tại',
        'Chỉ chữa được bằng phẫu thuật',
      ],
      answer: 1,
      explain:
        'Không có tư thế nào "đóng" hoàn toàn các đầu vastus khác; cải thiện lực toàn nhóm và giảm tải đột ngột là hướng thực tế.',
    },
  ],
  related: {
    muscles: [
      'quadriceps',
      'biceps-femoris',
      'semimembranosus',
      'semitendinosus',
      'gluteus-maximus',
      'adductor-magnus',
    ],
    exercises: [
      'barbell-back-squat',
      'leg-press',
      'leg-extension',
      'leg-curl',
      'nordic-curl',
      'romanian-deadlift',
    ],
    calculators: [],
    conditions: ['knee_pain'],
    evidence: [],
  },
  sources: [
    {
      label: "Gray's Anatomy of the Human Body (Plate 432 — quadriceps, đã verify qua bài Wikipedia 'Quadriceps')",
      url: 'https://commons.wikimedia.org/wiki/File:Gray432_color.png',
      license: 'Public domain',
    },
    {
      label: 'OpenStax Anatomy & Physiology — Muscles of the hip and thigh',
      url: 'https://openstax.org/books/anatomy-and-physiology/pages/11-6-muscles-of-the-hip-and-thigh',
      license: 'CC BY-NC-SA 4.0 (cite-only)',
    },
  ],
};
