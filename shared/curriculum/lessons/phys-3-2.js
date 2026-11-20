/**
 * VO2max, hấp thụ oxy và điều hòa nhiệt khi vận động.
 *
 * Nguồn: Gray493 (public domain — "view from the front into the heart",
 * đã verify mô tả), ACSM Guidelines (cite-only), OpenStax (cite-only).
 */
export default {
  slug: 'phys-3-2',
  module: 'phys',
  chapter: 3,
  chapterTitle: 'Tim mạch & hô hấp',
  order: 2,
  title: 'VO2max, hấp thụ oxy và điều hòa nhiệt',
  subtitle:
    'VO2max là tích của cung lượng tim và hiệu số oxy động-mạch; cải thiện được, đo ước được ngoài lab — và vận động nóng là bài thi riêng về nước.',
  minutes: 12,
  objectives: [
    'Phát biểu phương trình Fick: VO2 = cung lượng tim × hiệu số oxy động–tĩnh mạch.',
    'Giải thích vì sao cung lượng tim (đặc biệt lượng mỗi nhát bơm) là giới hạn lớn nhất ở người chưa tập.',
    'Nêu hai cách ước lượng VO2max thực địa và mốc cải thiện hợp lý (10–20% trong 8–12 tuần với người mới).',
    'Mô tả cơ chế điều hòa nhiệt khi vận động và quy tắc uống nước/electrolyte khi nóng.',
  ],
  sections: [
    {
      heading: 'Phương trình Fick: hai đường oxy vào cơ',
      body: `Lượng oxy cơ thể tiêu thụ mỗi phút (**VO2**) bằng:

**VO2 = cung lượng tim (Q) × hiệu số oxy động–tĩnh mạch (a-vO2 diff)**

- **Q = HR × SV** (nhịp tim × lượng máu mỗi nhát — bài Tim mạch đã dựng).
- **a-vO2 diff** = cơ "rút" oxy khỏi máu triệt để tới đâu — sợi cơ và mitochondria càng giỏi, con số càng cao.

VO2max là trần của phép nhân này: dù cố gắng thêm, oxy tiêu thụ không tăng nữa. Với người chưa tập, **Q (chủ yếu SV)** là chốt chặn lớn; luyện tập đều đặn nâng SV, kéo cả trần lên — người mới có thể cải thiện VO2max **10–20% trong 8–12 tuần**, sau đó tiến độ chậm dần.`,
      image: 'phys-3-2-heart.png',
    },
    {
      heading: 'Đo VO2max ngoài phòng lab',
      body: `Lab đo trực tiếp bằng mặt nạ khí trên băng chạy tăng dốc — chuẩn vàng nhưng không cần cho 99% khách phòng gym. Hai lựa chọn thực địa:

1. **Test đi bộ 1 dặm (Rockport)** — đã có trong bài Battery test: thời gian + HR ngay lúc đích → ước lượng VO2max. Chuẩn hơn: khách đi nhanh nhất có thể, không chạy.
2. **Test thăng dần có mốc tự nhận**: chạy/đạp tới mức "chỉ nói được vài từ", HR gần max cá nhân — dùng như mốc so sánh nội bộ, không phải số tuyệt đối.

Cách dùng đúng với PT: **so tiến bộ cùng một test mỗi 6–8 tuần** thay vì cãi nhau về con số tuyệt đối. VO2max ước lượng sai số ±10% là bình thường; hướng thay đổi qua các lần test mới là dữ liệu thật.`,
    },
    {
      heading: 'Vận động nóng: bài thi về nước, không phải ý chí',
      body: `Cơ bắp chỉ chuyển ~20–25% năng lượng ATP thành công cơ học — phần còn lại là **nhiệt**. Vận động là lò sưởi di động: cơ thể làm mát chủ yếu bằng **mồ hôi bay hơi** (mất ~580 kcal cho mỗi lít bay hơi).

Ở nóng ẩm, mồ hôi đổ ra nhưng không kịp bay hơi → nóng tích lại. Mốc mất nước và hệ quả:

- Mất ~2% cân nặng nước → hiệu suất cardio giảm rõ, RPE tăng.
- Mồ hôi 1–1,5 L/giờ ở nóng là thường — tập 60 phút có thể mất cả lít kèm muối.

Quy tắc thực hành: **uống theo cơn khát trong buổi dưới 60–75 phút** (cơ thể tự điều khiển khá tốt khi có nước sẵn); buổi dài/nóng hơn thì có kế hoạch ~0,5–1 L/giờ kèm điện giải, và phục hồi sau buổi bằng nước + bữa ăn muối bình thường. Khách tập ngoài nắng đầu mùa hè: 10–14 ngày quen nhiệt (acclimatization) — cùng tốc độ sẽ thấy nhẹ hơn sau 2 tuần.`,
    },
    {
      heading: 'Đặt VO2max vào giáo án đúng vị trí',
      body: `Ba lớp ưu tiên cho khách phổ thông:

1. **Nền Zone 2** (bài Tim mạch & vùng nhịp tim) — nâng "đáy" và phục hồi.
2. **Nâng ngưỡng** (tempo, 4×4 — bài Ngưỡng lactate) — áp dụng trực tiếp vào thành tích.
3. **HIIT ngắn gọn đã có đủ hai lớp trên** — thêm đỉnh, không thay nền.

Thứ tự này giải thích vì sao khách mới "chạy bộ đều mỗi ngày 3 tuần chưa thấy nhẹ": họ có nền nhưng chưa nâng ngưỡng, hoặc tập ở "vùng xám" Vùng 3 kéo dài. Điều chỉnh bằng dữ liệu HR + talk test của app, không bằng cảm giác mệt chung chung.`,
    },
  ],
  applyBox: `**Gian tập thực hành — buổi đo mốc VO2max thực địa:**
1. Sáng mát mẻ, khách nghỉ ngơi 1 ngày trước test.
2. Test 1 dặm đi nhanh nhất + HR đích → ghi vào Sổ tay tag "battery".
3. Xếp tuần tới: 2 × Zone 2 (30–45 phút nói trọn câu) + 1 × tempo 20 phút.
4. Test lại 1 dặm sau 8 tuần cùng điều kiện — so thời gian + HR đích; HR đích thấp hơn cùng thời gian = tiến bộ thật của cả VO2max và ngưỡng.`,
  safetyBox:
    'Dấu hiệu dừng ngay khi nóng: đau đầu, buồn nôn, ngừng ra mồ hôi dù nóng, lú lẫn — đó là cảnh báo bệnh nhiệt, không phải "vượt qua được": vào chỗ mát, hạ nhiệt, uống và tìm hỗ trợ y tế.',
  terms: [
    {
      en: 'VO2max',
      vi: 'Tiêu thụ oxy tối đa',
      def: 'Trần oxy cơ thể tiêu thụ mỗi phút khi gắng hết sức; tích của cung lượng tim × hiệu số oxy động–tĩnh mạch.',
    },
    {
      en: 'Fick equation',
      vi: 'Phương trình Fick',
      def: 'VO2 = Q × (a-vO2 diff) — khung phân tích mọi chuyện "tại sao cardio tiến bộ".',
    },
    {
      en: 'a-vO2 difference',
      vi: 'Hiệu số oxy động–tĩnh mạch',
      def: 'Lượng oxy cơ rút khỏi máu mỗi lít đi qua; tăng bằng luyện tập (mitochondria, enzyme oxy hoá).',
    },
    {
      en: 'Sweat rate',
      vi: 'Tốc độ mất mồ hôi',
      def: 'Có thể 1–1,5 L/giờ khi nóng; mỗi lít bay hơi mang ~580 kcal nhiệt ra ngoài.',
    },
    {
      en: 'Heat acclimatization',
      vi: 'Thích nghi nóng',
      def: '10–14 ngày tập dần ngoài nắng giúp mồ hôi ra sớm và loãng hơn, cùng tốc độ thấy nhẹ hơn.',
    },
    {
      en: 'Dehydration 2%',
      vi: 'Mất nước 2%',
      def: 'Mốc mất ~2% cân nặng nước đã làm giảm hiệu suất cardio và tăng cảm giác gắng rõ rệt.',
    },
  ],
  images: [
    {
      file: 'phys-3-2-heart.png',
      caption: 'Buồng tim nhìn từ phía trước (bản khắc Gray\u2019s Anatomy, Plate 493).',
      source: "Gray's Anatomy / Wikimedia Commons",
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gray493.png',
      license: 'Public domain',
    },
  ],
  quiz: [
    {
      q: 'Theo phương trình Fick, VO2max bằng tích của gì?',
      choices: [
        'Cân nặng × chiều cao',
        'Cung lượng tim (Q) × hiệu số oxy động–tĩnh mạch (a-vO2 diff)',
        'Nhịp tim × nhịp thở',
        'Số bước × khối cơ',
      ],
      answer: 1,
      explain:
        'Fick là khung chung: nâng được Q (chủ yếu SV ở người chưa tập) hoặc khả năng rút oxy của cơ thì trần oxy tăng.',
    },
    {
      q: 'Với người mới tập, VO2max có thể cải thiện khoảng bao nhiêu trong 8–12 tuần?',
      choices: ['0%', 'Khoảng 10–20%, sau đó tiến độ chậm dần', '100%', 'Chỉ giảm'],
      answer: 1,
      explain:
        'SV và khả năng rút oxy phản ứng nhanh với luyện tập đều đặn — window "dễ ăn" lớn nhất ở giai đoạn đầu.',
    },
    {
      q: 'Mỗi lít mồ hôi bay hơi mang bao nhiêu nhiệt ra khỏi cơ thể?',
      choices: ['~5 kcal', '~58 kcal', '~580 kcal', 'Không mất nhiệt'],
      answer: 2,
      explain:
        'Bay hơi là cơ chế làm mát chính (~580 kcal/lít) — vì sao nóng ẩm (mồ hôi không bay được) nguy hiểm hơn nóng khô.',
    },
    {
      q: 'Buổi dưới 60 phút, quy tắc uống nước thực dụng là gì?',
      choices: [
        'Không uống gì cho "khổ luyện"',
        'Uống theo cơn khát khi có nước sẵn — cơ thể tự điều khiển khá tốt ở khung thời gian này',
        'Uống 3 lít trước buổi',
        'Chỉ uống sau khi chóng mặt',
      ],
      answer: 1,
      explain:
        'Dưới ~60–75 phút với nước sẵn sàng, khát là chỉ dẫn đủ tốt; buổi dài/nóng mới cần kế hoạch 0,5–1 L/giờ kèm điện giải.',
    },
    {
      q: 'Khách nói "chạy đều 3 tuần chưa thấy nhẹ hơn". Khả năng cao nhất về cấu trúc tập?',
      choices: [
        'Chỉ có nền Zone 2, chưa có bài nâng ngưỡng — hoặc toàn bộ nằm "vùng xám" Vùng 3',
        'Chạy quá nhanh',
        'Giày không đúng',
        'Cần nghỉ 1 tháng',
      ],
      answer: 0,
      explain:
        'Thiếu lớp nâng ngưỡng (tempo/interval) hoặc lượn Vùng 3 kéo dài là hai lỗi cấu trúc phổ biến nhất — sửa bằng dữ liệu HR + talk test.',
    },
    {
      q: 'Dấu hiệu nào khi tập nóng là cảnh báo bệnh nhiệt, phải dừng ngay?',
      choices: [
        'Mồ hôi ra nhiều',
        'Ngừng ra mồ hôi dù nóng kèm đau đầu/buồn nôn/lú lẫn',
        'Da hồng hào',
        'Thở nhanh khi sprint',
      ],
      answer: 1,
      explain:
        'Ngừng đổ mồ hôi + triệu chứng thần kinh là tín hiệu nguy hiểm: vào chỗ mát, hạ thân nhiệt và tìm hỗ trợ y tế — không phải "gắng thêm".',
    },
  ],
  related: {
    muscles: [],
    exercises: [],
    calculators: ['hr-zones', 'tdee'],
    conditions: ['hypertension'],
    evidence: [],
  },
  sources: [
    {
      label: "Gray's Anatomy of the Human Body (Plate 493 — heart seen from the front, đã verify mô tả)",
      url: 'https://commons.wikimedia.org/wiki/File:Gray493.png',
      license: 'Public domain',
    },
    {
      label: "ACSM's Guidelines for Exercise Testing and Prescription — VO2max testing & heat",
      url: 'https://www.acsm.org/education-resources/books-and-multimedia-resources',
      license: 'cite-only',
    },
    {
      label: 'OpenStax Anatomy & Physiology — Cardiac output & thermoregulation',
      url: 'https://openstax.org/books/anatomy-and-physiology/pages/22-4-transport-of-gases-in-human-body-fluids',
      license: 'CC BY-NC-SA 4.0 (cite-only)',
    },
  ],
};
