/**
 * Vai: subacromial pain & đường rèn lại cuff theo tiêu chí.
 *
 * Nguồn: điều kiện `shoulder_pain` của PT Brain, ACSM Guidelines
 * (cite-only), bài Cơ vai & Khoa học về đau của app.
 */
export default {
  slug: 'rehab-3-1',
  module: 'rehab',
  chapter: 3,
  chapterTitle: 'Vùng vai',
  order: 1,
  title: 'Đau vai kiểu chèn ép: rèn lại cuff thay vì né mọi động tác nâng tay',
  subtitle:
    '"Impingement" mô tả chỗ đau chứ không phải nguyên nhân gốc — chương trình rèn cuff + điều chỉnh góc bài theo phản ứng 24 giờ là đường đi chuẩn.',
  minutes: 11,
  objectives: [
    'Giải thích vì sao "impingement" nên hiểu là đau vùng dưới vòm vai (mô tả, không phải chẩn đoán nguyên nhân).',
    'Dựng chuỗi rèn cuff theo tiêu chí: isometric → band → kiểm soát bả vai → đẩy overhead tiến dần.',
    'Điều chỉnh bài bằng ba núm vặn: tay cầm, biên độ, góc — thay vì bỏ hẳn nhóm vai.',
    'Nhận biết khi nào khách cần physio/bác sĩ (đau đêm kéo dài, yếu rõ, không tiến bộ 4–6 tuần).',
  ],
  sections: [
    {
      heading: 'Đặt lại tên: "mô tả" không phải "bản án xơ cứng"',
      body: `Khách hay nghe "vai bị chèn ép, đừng nâng tay nữa". Cách hiểu hiện đại: **subacromial pain** là *mô tả vùng đau* (trước/trên vai khi nâng tay 60–120°, đúng "painful arc" đã học ở bài Cơ vai) — còn **vì sao** gân/túi hoạt dịch bị đè thì là câu chuyện từng cá nhân: lực cuff, nhịp bả vai, volume đột ngột, ROM hạn chế.

Hệ quả: điều trị không phải "cấm vĩnh viễn động tác nâng tay" — mà là **rèn lại sức chịu tải của vai** theo tiêu chí, kèm chọn bài không phản ứng trong giai đoạn đầu.`,
    },
    {
      heading: 'Chuỗi rèn cuff: bốn cửa tiêu chí',
      body: `Áp khung criteria-based (bài Tiến trình phục hồi):

| Cửa | Việc | Tiêu chí mở cửa tiếp |
| --- | --- | --- |
| 1 | **Isometric xoay ngoài/trong** (ép tay vào tường 5–10 giây × 5) | Đau ≤ 3, 24h sạch |
| 2 | **Band xoay ngoài** 2–3 set nhẹ + face pull | 2 buổi liền ổn |
| 3 | **Kiểm soát bả vai**: row tựa ngực, wall slide + ép bả, push-up plus | Form giữ, đau ≤ 3 |
| 4 | **Overhead tiến dần**: landmine → dumbbell neutral grip → tầm đầy đủ | Mỗi nấc 2 buổi ổn |

Cửa 4 chính là nơi khách muốn nhảy tới ngay — giữ nhịp: mỗi nấc tăng tầm 10–15° hoặc đổi 1 biến số (bài Tiến trình phục hồi: một biến mỗi lần).`,
    },
    {
      heading: 'Ba núm vặn điều chỉnh bài cho vùng vai',
      body: `Khi một bài vẫn phản ứng (đau dồn 24h), xoay theo thứ tự trước khi bỏ nhóm:

1. **Tay cầm**: thanh thẳng → dumbbell neutral (lòng bàn tay đối diện) — giảm xoay ngoài ở đáy vòm (bài Cơ vai & Cẳng tay).
2. **Biên độ**: dừng ở 80–90% tầm, đẩy "trong vùng không đau với cảm giác căng nhẹ".
3. **Góc/đường đi**: overhead thẳng → landmine nghiêng; bench phẳng → nghiêng nhẹ; dips → bỏ tạm.

Nguyên tắc viết trên giấy: **một núm mỗi lần, test 2 buổi**. Ba núm đều xoay mà vẫn phản ứng → lùi về cửa trước của chuỗi rèn, không "phạt" bằng cách nghỉ zero (bài PEACE & LOVE).`,
    },
    {
      heading: 'Khi nào bàn giao và khi nào dừng',
      body: `Bàn giao physio/bác sĩ khi có một trong các dấu sau:

- **Đau đêm kéo dài** không liên quan tư thế nằm (bài Red flags).
- **Yếu rõ rệt**: nâng tay ngang phải "dùng đà", hoặc không giữ được tay ở vị trí người ta đặt (nguy cơ đứt cuff — khám).
- **Không tiến bộ gì sau 4–6 tuần** làm đúng tiêu chí — cần đánh giá chuyên sâu hơn là tiếp tục mò.

Trong lúc phối hợp, phần còn lại của khách vẫn tập bình thường: chân, core, tay khác — "đau vai" không có nghĩa "nghỉ toàn thân" (bài Vai & rotator cuff đã nói).`,
    },
  ],
  applyBox: `**Gian tập thực hành — khối 10 phút cho khách đau vai đang duyệt y tế:**
1. Isometric xoay ngoài tường: 5 × 10 giây mỗi bên (cửa 1).
2. Face pull 2 × 15 tải nhẹ, thêm 1 giây ép bả ở đỉnh.
3. Wall slide 2 × 8 với nhịp ép bả cuối đường.
4. Toàn bộ phần thân-không-vai giữ nguyên như giáo án cũ — mất vai không mất người.
5. Ghi cột phản ứng 24h trong Sổ tay; mở cửa 2 khi hai buổi liền sạch.`,
  terms: [
    {
      en: 'Subacromial pain',
      vi: 'Đau dưới vòm vai',
      def: 'Mô tả vùng đau trước/trên vai khi nâng 60–120°; nguyên nhân từng cá nhân cần đánh giá, không phải một chẩn đoán đơn.',
    },
    {
      en: 'Painful arc',
      vi: 'Cung đau',
      def: 'Khoảng nâng tay 60–120° nơi đau xuất hiện rồi giảm — dấu hiệu vùng dưới vòm vai quen thuộc của PT.',
    },
    {
      en: 'Rotator cuff loading',
      vi: 'Tải rèn chỏm xoay',
      def: 'Chuỗi isometric → band → kiểm soát bả → overhead; mô học đòi tải đúng liều để củng cố, nghỉ zero làm yếu hơn.',
    },
    {
      en: 'Grip–ROM–angle knobs',
      vi: 'Ba núm tay cầm–biên độ–góc',
      def: 'Thứ tự điều chỉnh bài trước khi bỏ nhóm vai: neutral grip → giảm biên độ → đổi đường đi/khuynh hướng đẩy.',
    },
    {
      en: 'Night pain (red flag)',
      vi: 'Đau đêm (red flag)',
      def: 'Đau vai đêm kéo dài không liên quan nằm đè — một trong các tín hiệu cần đánh giá y tế, không phải "tập tiếp xem sao".',
    },
  ],
  images: [],
  quiz: [
    {
      q: '"Impingement" nên được hiểu đúng là gì?',
      choices: [
        'Một chẩn đoán nguyên nhân duy nhất và vĩnh viễn',
        'Mô tả vùng đau dưới vòm vai — còn "vì sao" là chuyện từng cá nhân (lực, nhịp bả, volume, ROM)',
        'Tên gọi khác của đứt gân',
        'Bệnh chỉ gặp ở VĐV',
      ],
      answer: 1,
      explain:
        'Hiểu như mô tả thì con đường điều trị hiện ra: rèn lại sức chịu tải + điều chỉnh bài — thay vì cấm vận động trọn đời.',
    },
    {
      q: 'Cửa đầu tiên của chuỗi rèn cuff thường là gì?',
      choices: [
        'Đẩy overhead tạ nặng',
        'Isometric xoay ngoài/trên ép tường 5–10 giây',
        'Kéo xà 20 rep',
        'Nghỉ 2 tuần rồi thử lại',
      ],
      answer: 1,
      explain:
        'Isometric cho tín hiệu tải với kích ứng thấp nhất — cửa mở khi đau ≤ 3 và phản ứng 24h sạch, rồi mới sang band.',
    },
    {
      q: 'Bài đẩy overhead vẫn phản ứng đau sau khi đã xoay núm "tay cầm" và "biên độ". Bước tiếp theo đúng?',
      choices: [
        'Bỏ hẳn mọi bài vai vĩnh viễn',
        'Xoay núm thứ ba: đổi góc/đường đi (landmine) hoặc lùi về cửa trước của chuỗi rèn',
        'Tăng tạ để vượt qua',
        'Chỉ tập bên khoẻ',
      ],
      answer: 1,
      explain:
        'Ba núm xoay hết mà vẫn phản ứng thì lùi một cấp — giữ tiến trình đã xây, không phạt bằng nghỉ zero.',
    },
    {
      q: 'Dấu hiệu nào của khách vai đáng chuyển hướng khám ngay?',
      choices: [
        'Đau thoáng khi thay đổi bài',
        'Đau đêm kéo dài không liên quan tư thế, hoặc yếu rõ phải "dùng đà" để nâng tay',
        'Thích tập chân hơn',
        'Căng nhẹ sau buổi face pull',
      ],
      answer: 1,
      explain:
        'Đau đêm + yếu rõ là cặp tín hiệu cần đánh giá chuyên sâu (kể cả chẩn đoán hình ảnh của bác sĩ) — ngoài phạm vi PT.',
    },
    {
      q: 'Vì sao "đau vai" không nên thành "nghỉ toàn thân"?',
      choices: [
        'Vì khách muốn thế',
        'Giữ phần thân còn lại mạnh bảo vệ cả thể chất lẫn tâm lý vận động — mất vai không có nghĩa mất người',
        'Vì mất calo là xấu',
        'Không có lý do',
      ],
      answer: 1,
      explain:
        'Mọi bài không chạm vai vẫn chạy bình thường: khách giữ thói quen, giữ lực, và giảm fear-avoidance khi trở lại nhóm vai.',
    },
  ],
  related: {
    muscles: ['deltoid', 'supraspinatus', 'infraspinatus', 'subscapularis', 'teres-minor', 'trapezius', 'serratus-anterior'],
    exercises: ['face-pull', 'landmine-press', 'rear-delt-fly', 'seated-cable-row', 'push-up'],
    calculators: [],
    conditions: ['shoulder_pain'],
    evidence: [],
  },
  sources: [
    {
      label: "ACSM's Guidelines — Musculoskeletal injury & return to activity (cite-only)",
      url: 'https://www.acsm.org/education-resources/books-and-multimedia-resources',
      license: 'cite-only',
    },
    {
      label: 'OpenStax Anatomy & Physiology — Muscles of the pectoral girdle (cite-only)',
      url: 'https://openstax.org/books/anatomy-and-physiology/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs',
      license: 'CC BY-NC-SA 4.0 (cite-only)',
    },
    {
      label: 'Dubois & Esculier 2020 — PEACE & LOVE (DOI đã kiểm chứng)',
      url: 'https://doi.org/10.1136/bjsports-2019-101253',
      license: 'cite-only',
    },
  ],
};
