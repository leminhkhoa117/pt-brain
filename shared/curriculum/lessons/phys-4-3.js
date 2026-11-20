/**
 * Thích ứng sức bền aerobe: tim, mao mạch, mitochondria.
 *
 * Nguồn: Animal mitochondrion diagram en.svg (public domain, Mariana Ruiz
 * Villarreal — đã kiểm tra license), OpenStax (cite-only), ACSM (cite-only).
 */
export default {
  slug: 'phys-4-3',
  module: 'phys',
  chapter: 4,
  chapterTitle: 'Thích ứng khi tập luyện',
  order: 3,
  title: 'Thích ứng sức bền aerobe: tim to bơm, mao mạch dày, mitochondria đông',
  subtitle:
    'Zone 2 đều đặn đổi hình dạng cả hệ thống: SV lên, HR nghỉ xuống, sợi cơ làm việc trong "nhà máy oxy" dày hơn.',
  minutes: 11,
  objectives: [
    'Mô tả thích ứng trung ương: SV tăng, HR nghỉ giảm, Q tối đa tăng.',
    'Mô tả thích ứng ngoại vi: mật độ mao mạch, myoglobin, mitochondria và enzyme oxy hoá.',
    'Giải thích vì sao người tập lâu đốt mỡ tốt hơn ở cùng cường độ (dịch chuyển sử dụng nhiên liệu).',
    'Dùng ba con số theo dõi trong app để xác nhận thích ứng đang diễn ra: HR nghỉ, HR hồi phục, tốc độ cùng Zone.',
  ],
  sections: [
    {
      heading: 'Trung ương: quả tim bơm sâu hơn',
      body: `Tập aerobe đều đặn 8–12 tuần thay đổi trái tim theo hướng **bơm ít lần, sâu hơn**:

- **Lượng mỗi nhát (SV) tăng** — buồng tim đầy hơn và co hiệu quả hơn.
- **HR nghỉ giảm** (người tập lâu năm thường 40–60 bpm): cùng một công việc, tim dùng ít nhịp hơn vì mỗi nhát bơm nhiều hơn.
- **Q tối đa tăng** nhờ SV: phần lớn "dung tích động cơ" VO2max của người mới nằm ở chỗ này (bài VO2max & Fick).

Đây là lý do số **HR nghỉ** là chỉ số theo dõi miễn phí trong tab Theo dõi cơ thể của app — xu hướng giảm dần theo các tuần Zone 2 là bằng thích ứng thật.`,
    },
    {
      heading: 'Ngoại vi: xây "nhà máy oxy" trong sợi cơ',
      body: `Bên trong sợi cơ, tập aerobe làm:

- **Mao mạch quanh sợi dày thêm** (capillarization): đường vận chuyển oxy vào cơ rộng hơn.
- **Myoglobin tăng**: kho oxy tại chỗ của sợi sâu hơn.
- **Mitochondria nhân lên và to thêm** (mitochondrial biogenesis): "lò đốt oxy" trong mỗi sợi nhiều hơn — mỗi lò đốt được cả carb lẫn mỡ.
- **Enzyme oxy hoá tăng**: dây chuyền chuyển hoá chạy trơn hơn.

Kết quả net: cùng một tốc độ chạy, cơ của người tập chuyển sang **dùng mỡ nhiều hơn, tiết kiệm glycogen** — "tiết kiệm nhiên liệu" là thích ứng thật, không phải thần thoại.`,
      image: 'phys-4-3-mitochondrion.svg',
    },
    {
      heading: 'Ba con số xác nhận thích ứng đang diễn ra',
      body: `Không cần máy đắt — ba con số miễn phí, mỗi cái ở một tầng của hệ thống:

| Con số | Tầng phản ánh | Cách đo trong app |
| --- | --- | --- |
| HR nghỉ | Trung ương (SV) | Mỗi sáng trước xuống giường, ghi theo dõi cơ thể |
| HR hồi phục 60s | Trung ương + ngoại vi | Sau cữ gắt, đo mức rơi (bài Tim mạch) |
| Tốc độ cùng Zone 2 | Toàn hệ thống | Cùng tuyến đường/hiện tượng, HR tương đương — tốc nhích lên là tiến bộ |

Mốc kỳ vọng: **HR nghỉ giảm dần theo tuần**; HR hồi phục rơi sâu hơn; cùng HR, tốc/đạp nhanh hơn sau 6–8 tuần Zone 2 + 1 buổi ngưỡng (bài Ngưỡng lactate).`,
    },
    {
      heading: 'Đặt vào giáo án đúng liều',
      body: `Chuỗi nhân quả: **thể tích Zone 2 → mitochondrial + SV → cùng tốc độ "nhẹ hơn" → chạy nhanh hơn không mệt hơn**. Liều cho khách phổ thông:

- 2–3 buổi Zone 2/tuần, 30–45 phút (nói trọn câu — bài Vùng nhịp tim).
- 1 buổi có tempo/4×4 nâng ngưỡng khi đã có ≥ 4 tuần nền.
- Không "ăn hết tiến bộ trong 1 tuần": thích ứng mito cần số buổi tích lũy, như MPS cần bữa ăn tích lũy.

Lưu ý tạ nặng: cardio cường độ lớn sát buổi tạ nặng nhất tuần làm hai bên tranh khôi phục — xếp Zone 2 xa buổi chân nặng hoặc sau buổi tay.`,
    },
  ],
  applyBox: `**Gian tập thực hành — "đếm hạt" thích ứng aerobe trong 8 tuần:**
1. Tuần 0: đo HR nghỉ 5 sáng + 1 buổi chạy tuyến quen ghi tốc độ & HR trung bình Zone 2.
2. Tuần 1–8: giữ nguyên 2 buổi Zone 2 tuyến quen + 1 buổi tempo/4×4.
3. Tuần 8: đo lại y hệt điều kiện — so 3 con số: HR nghỉ (MA7), tốc độ cùng HR, HR hồi phục.
4. Báo cáo khách bằng 1 câu hình ảnh: "trái tim bơm mỗi nhát sâu hơn, mỗi sợi cơ có thêm lò đốt".`,
  terms: [
    {
      en: 'Stroke volume adaptation',
      vi: 'Thích ứng lượng mỗi nhát',
      def: 'Tập aerobe làm SV tăng — HR nghỉ hạ và Q tối đa lên; phần lớn đỉnh VO2max người mới nằm ở đây.',
    },
    {
      en: 'Mitochondrial biogenesis',
      vi: 'Sinh tạo mitochondria',
      def: 'Số lượng và kích thước "lò đốt oxy" trong sợi cơ tăng sau các tuần tích lũy Zone 2.',
    },
    {
      en: 'Capillarization',
      vi: 'Mao mạch hoá',
      def: 'Mật độ mao mạch quanh sợi tăng — đường oxy vào cơ rộng hơn.',
    },
    {
      en: 'Resting bradycardia',
      vi: 'Nhịp tim nghỉ thấp',
      def: 'HR nghỉ 40–60 bpm ở người tập aerobe lâu năm — dấu hiệu SV sâu, không phải bệnh khi khỏe mạnh.',
    },
    {
      en: 'Fuel shift (fat oxidation)',
      vi: 'Dịch chuyển nhiên liệu',
      def: 'Ở cùng cường độ, người tập dùng mỡ nhiều hơn và giữ glycogen — "tiết kiệm nhiên liệu" thật.',
    },
  ],
  images: [
    {
      file: 'phys-4-3-mitochondrion.svg',
      caption: 'Sơ đồ một mitochondrion — "lò đốt oxy" mà tập aerobe nhân lên trong sợi cơ.',
      source: 'Mariana Ruiz Villarreal (LadyofHats) / Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Animal_mitochondrion_diagram_en.svg',
      license: 'Public domain',
    },
  ],
  quiz: [
    {
      q: 'Vì sao HR nghỉ của người tập aerobe lâu năm thấp (40–60 bpm)?',
      choices: [
        'Tim yếu nên đập ít',
        'SV mỗi nhát sâu hơn — cùng công việc cần ít nhịp hơn',
        'Họ ngừng tim lúc ngủ',
        'Do thuốc hạ nhịp',
      ],
      answer: 1,
      explain:
        'Đây là thích ứng lành mạnh: bơm ít lần, sâu hơn — cùng một cung lượng, tim tiết kiệm nhịp.',
    },
    {
      q: 'Mitochondrial biogenesis nghĩa là gì và đến từ đâu?',
      choices: [
        'Mitochondria biến mất khi tập',
        'Số lượng/kích thước lò đốt oxy trong sợi tăng nhờ số buổi Zone 2 tích lũy',
        'Chỉ có ở cơ tim',
        'Xảy ra sau một buổi duy nhất',
      ],
      answer: 1,
      explain:
        'Thích ứng ngoại vi cần số buổi dồn tích — như phì đại cần số bữa ăn tích lũy; không "ăn xong ngay".',
    },
    {
      q: '"Cùng HR, tốc độ chạy nhích lên sau 6–8 tuần" phản ánh điều gì?',
      choices: [
        'Máy đo HR hỏng',
        'Toàn hệ thống hiệu quả hơn: cùng gắng cũ cho công nhanh hơn — tiến bộ thật',
        'Khách chạy sai tuyến',
        'Thời tiết đổi',
      ],
      answer: 1,
      explain:
        'Đây là cách đo tiến bộ cardio tốt nhất không cần lab: giữ điều kiện, so tốc độ tại cùng vùng HR.',
    },
    {
      q: 'Vì sao nói người tập "tiết kiệm glycogen" ở cùng tốc độ?',
      choices: [
        'Họ không còn glycogen',
        'Mao mạch + mitochondria + enzyme tốt hơn khiến cơ dùng mỡ nhiều hơn ở cùng cường độ',
        'Vì ăn nhiều carb hơn',
        'Vì chạy chậm lại',
      ],
      answer: 1,
      explain:
        'Dịch chuyển nhiên liệu: lò đốt oxy giỏi hơn lựa chọn mỡ nhiều hơn, để dành glycogen cho lúc cần gắng cao.',
    },
    {
      q: 'Xếp cardio cường độ lớn như thế nào cho khách cũng tập tạ nặng?',
      choices: [
        'Cạnh ngay buổi tạ nặng nhất tuần',
        'Xếp Zone 2 xa buổi chân nặng, và buổi gắt (tempo/4×4) không sát buổi tạ nặng nhất',
        'Mỗi ngày 2 buổi gắt liên tục',
        'Không bao giờ cardio',
      ],
      answer: 1,
      explain:
        'Hai loại gắng tranh cùng "ngân sách" phục hồi — tách lịch là cách giữ cả hai phía tiến đều.',
    },
  ],
  related: {
    muscles: ['soleus', 'quadriceps'],
    exercises: [],
    calculators: ['hr-zones'],
    conditions: ['hypertension'],
    evidence: [],
  },
  sources: [
    {
      label: 'Animal mitochondrion diagram — Mariana Ruiz Villarreal (đã kiểm tra license: Public domain)',
      url: 'https://commons.wikimedia.org/wiki/File:Animal_mitochondrion_diagram_en.svg',
      license: 'Public domain',
    },
    {
      label: "ACSM's Guidelines — Adaptations to aerobic training",
      url: 'https://www.acsm.org/education-resources/books-and-multimedia-resources',
      license: 'cite-only',
    },
    {
      label: 'OpenStax Anatomy & Physiology — Muscle performance & fiber adaptation',
      url: 'https://openstax.org/books/anatomy-and-physiology/pages/10-6-exercise-and-muscle-performance',
      license: 'CC BY-NC-SA 4.0 (cite-only)',
    },
  ],
};
