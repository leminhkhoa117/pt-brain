/**
 * Khớp chính chuyên sâu: vai, hông, gối, khuỷu và cột sống.
 *
 * Nguồn: Gray349 (public domain — "Head of right tibia seen from above,
 * showing menisci and attachments of ligaments", đã verify mô tả),
 * OpenStax A&P (cite-only).
 */
export default {
  slug: 'anat-4-2',
  module: 'anat',
  chapter: 4,
  chapterTitle: 'Khớp & vận động học',
  order: 2,
  title: 'Khớp chính chuyên sâu: vai, hông, gối, khuỷu, cột sống',
  subtitle:
    'Mỗi khớp lớn có một "thỏa thuận" riêng giữa tầm vận động và ổn định — đọc đúng thỏa thuận đó là cách chọn bài an toàn.',
  minutes: 12,
  objectives: [
    'So sánh cấu trúc ổ khớp của vai và hông và hệ quả an toàn của sự khác biệt đó.',
    'Mô tả cấu trúc gối: meniscus, dây chằng chéo và cơ chế đau quanh xương bánh chè.',
    'Giải thích cột sống là "hàng chục khớp nhỏ" chứ không phải một bản lề, và vì sao nén-xoay có tải là tư thế rủi ro.',
    'Chọn điều chỉnh kỹ thuật cụ thể cho từng khớp khi khách có giới hạn.',
  ],
  sections: [
    {
      heading: 'Vai vs Hông: hai kiểu "cầu ổ" hai thỏa thuận',
      body: `Cả vai và hông đều là khớp **cầu-ổ (ball and socket)**, nhưng thỏa thuận trái ngược:

- **Vai**: chỏm xương to đặt trên **ổ glenoid rất nông** — đổi ổn định lấy tầm vận động lớn nhất cơ thể; phần lớn ổn định dựa vào cơ chỏm xoay (bài Cơ vai).
- **Hông**: chỏm xương đùi **chìm sâu vào acetabulum**, viền thêm **labrum** sụn — ổ sâu giữ chỏm chắc, tầm vận động nhỏ hơn nhưng tải được lớn (hông chịu vài lần trọng lượng cơ thể mỗi bước chạy).

Hệ quả thực hành: hông "tin được" ở tải lớn nếu ROM đủ và tư thế đúng; vai cần sự **tôn trọng biên độ** hơn — đẩy overhead lệch trục hoặc dồn tải khi thiếu ROM sẽ đè vào phần mềm quanh khớp trước khi cơ kịp thích ứng.`,
    },
    {
      heading: 'Gối: bản lề có "tay vịn"',
      body: `Gối về cơ bản là khớp **bản lề** (gấp/duỗi) với chút xoay khi gập — độ ổn định phụ thuộc rất nhiều vào cấu trúc phần mềm:

- **Hai meniscus**: tấm đệm sụn hình chữ C giữ phân bố lực giữa đùi và chày (ảnh dưới).
- **Dây chằng chéo trước/sau (ACL/PCL)**: giữ chỏm không trượt tới/lui.
- **Dây chằng bên**: giữ gối không gập ngang ra hai bên.

**Đau quanh xương bánh chè (patellofemoral pain)** — dạng đau gối phổ biến nhất ở phòng gym: bánh chè trượt không đều trong rãnh khi tải lặp (squat sâu, leo cầu thang, chạy). Nguồn thường nằm **ngoài bản thân gối**: hông yếu (gối chụm), ROM cổ chân hạn chế, hoặc tăng volume đột ngột. Vì vậy điều chỉnh đầu tiên thường là: giảm tải tạm, sửa hướng gối theo ngón chân, nuôi mông giữa (bài Hông & mông) — trước khi đổ lỗi "gối yếu".`,
      image: 'anat-4-2-knee.png',
    },
    {
      heading: 'Khuỷu: bản lề + một "khớp xoay"',
      body: `Khuỷu gấp/duỗi như bản lề **thật thà**: góc tối đa của nó phụ thuộc trục xương — vì vậy khách hạ tạ sau gáy không sâu bằng nhau là chuyện bình thường, không phải "kỹ thuật lười".

Phần "xoay" của cẳng tay không nằm ở khuỷu: **xương quay (radius) xoay quanh xương trụ (ulna)** tại khớp trên-dưới cẳng tay — sinh ra sấp/ngửa. Ứng dụng: đổi tay cầm thẳng/zúc/neutral là đổi tư thế xoay của cẳng tay, chuyển việc giữa biceps-brachialis hoặc giảm duỗi tối đa cổ tay (bài Tay & cẳng tay).`,
    },
    {
      heading: 'Cột sống: hàng chục khớp nhỏ, cộng dồn thành lớn',
      body: `Cột sống không phải một đĩa lượn đơn — mỗi cặp đốt kề nhau là **ba khớp nhỏ**: khớp thân (có đĩa đệm ở giữa) và hai khớp mảnh sau (facet). Mỗi cấp vài độ; tổng 24 đốt cộng lại mới ra biên độ lớn.

Hai hệ quả quan trọng:

1. **Chuyển động phân bố đều**: gập người "từ một điểm" (ví dụ tư thế round-back chết người khi vác tạ) dồn tải vào vài đốt giữa — phân bố đều theo tư thế trung tính là cách chia tải lành mạnh.
2. **Nén + xoay cùng lúc là tổ hợp rủi ro**: đĩa đệm chịu nén tốt, chịu xoay dưới nén kém. "Xoay người vác tạ" là tư thế cần loại khỏi giáo án — mọi biến thể xoay thân nên đứng thẳng hoặc đặt tải xuống trước.`,
    },
    {
      heading: 'Bảng điều chỉnh nhanh theo khớp',
      body: `| Tình huống khách | Điều chỉnh trước tiên |
| --- | --- |
| Đẩy overhead kẹt vai | Landmine press / dumbbell neutral grip, giảm tầm ~10% |
| Squat sâu kẹt hông trước | Chân rộng hơn + gót nâng nhẹ; check hip hinge trước |
| Đau quanh bánh chè khi squat | Giảm độ sâu tạm, gối theo ngón chân, thêm bài mông giữa |
| Cẳng tay/khuỷu khó chịu khi đẩy | Thanh zúc xách, neutral grip, giảm biên độ hạ sau |
| Mỏi lưng khi row đứng | Chuyển sang chest-supported row — giữ phân bố tải, bỏ gánh erector |`,
    },
  ],
  applyBox: `**Gian tập thực hành — "đọc khớp" trong 90 giây mỗi buổi:**
1. Vai: ngón tay khách có hướng theo ngón chân khi đẩy? (gối valgus là dấu hiệu hông, không phải gối).
2. Hông: đáy squat có "pinch" trước háng? → thử chân rộng + gót wedge trước khi chẩn "thiếu mông".
3. Gối: đau quanh bánh chè tăng theo số rep hay theo tải? (rep-dependent → giảm volume; load-dependent → giảm tải).
4. Cột sống: mọi bài vác tạ có giữ trung tính? nếu khách rút ra khi mệt → hạ tạ, không hạ chuẩn.`,
  terms: [
    {
      en: 'Acetabulum / Labrum',
      vi: 'Ổ chậu / vành sụn',
      def: 'Ổ hông sâu viền sụn giữ chỏm đùi chắc — cho phép tải lớn hơn vai nhiều lần.',
    },
    {
      en: 'Meniscus',
      vi: 'Meniscus',
      def: 'Hai tấm sụn chữ C giữa đùi-chày, phân bố lực gối; rách thường chậm lành vì ít mạch.',
    },
    {
      en: 'ACL / PCL',
      vi: 'Dây chằng chéo trước/sau',
      def: 'Hai dây chằng bắt chéo giữa giữ chỏm đùi không trượt tới-lui trên chày.',
    },
    {
      en: 'Patellofemoral pain',
      vi: 'Đau quanh xương bánh chè',
      def: 'Bánh chè trượt không đều trong rãnh dưới tải lặp; nguồn gốc thường ở hông/ROM cổ chân/volume.',
    },
    {
      en: 'Facet joint',
      vi: 'Khớp mảnh sau',
      def: 'Cặp khớp nhỏ sau mỗi đốt sống; hành lang đóng khi gập lưng quá — nguồn đau cột sống thường gặp.',
    },
    {
      en: 'Radioulnar joint',
      vi: 'Khớp trên-dưới cẳng tay',
      def: 'Xương quay xoay quanh xương trụ tạo sấp/ngửa — đổi tay cầm là đổi tư thế khớp này.',
    },
  ],
  images: [
    {
      file: 'anat-4-2-knee.png',
      caption:
        'Mặt trên xương chày nhìn từ trên: hai meniscus và điểm bám dây chằng (bản khắc Gray\u2019s Anatomy, Plate 349).',
      source: "Gray's Anatomy / Wikimedia Commons",
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gray349.png',
      license: 'Public domain',
    },
  ],
  quiz: [
    {
      q: 'Điểm khác thỏa thuận giữa vai và hông là gì?',
      choices: [
        'Hông có ổ nông hơn vai',
        'Vai đổi ổn định lấy tầm vận động (ổ nông); hông ổ sâu + labrum chịu tải lớn',
        'Cả hai như nhau hoàn toàn',
        'Hông không phải khớp cầu-ổ',
      ],
      answer: 1,
      explain:
        'Vai linh hoạt nhất nhưng dựa vào cơ giữ; hông chìm sâu trong acetabulum nên tin được ở tải lớn nếu tư thế đúng.',
    },
    {
      q: 'Đau quanh xương bánh chè của khách tăng khi squat nhiều rep. Điều chỉnh hợp lý đầu tiên?',
      choices: [
        'Tăng tạ để mạnh gối lên',
        'Giảm volume tạm, giữ gối theo hướng ngón chân, nuôi mông giữa (nguồn gốc thường ở hông)',
        'Bỏ tập chân hẳn',
        'Quấn đầu gối chặt tối đa là đủ',
      ],
      answer: 1,
      explain:
        'Patellofemoral pain thường đến từ chuỗi trên (hông yếu/valgus) hoặc volume; sửa chuỗi trước, không phạt bản thân khớp.',
    },
    {
      q: 'Vì sao "vác tạ xoay người" bị loại khỏi giáo án an toàn?',
      choices: [
        'Xoay làm mất thẩm mỹ',
        'Đĩa đệm chịu nén tốt nhưng chịu nén + xoay cùng lúc rất kém',
        'Chỉ dành cho VĐV',
        'Xoay làm tạ nặng hơn',
      ],
      answer: 1,
      explain:
        'Nén kết hợp xoay là tổ hợp lực xấu nhất cho đĩa đệm và khớp mảnh sau; xoay đứng thẳng hoặc đặt tải xuống trước khi xoay.',
    },
    {
      q: 'Khách hạ tạ sau gáy không sâu như người bên cạnh. Lý do chính đáng?',
      choices: [
        'Khách lười',
        'Trục xương khuỷu mỗi người khác — biên độ bản lề tự nhiên khác nhau, không phải lỗi kỹ thuật',
        'Khuỷu bị gãy',
        'Cần tập nhiều hơn tới khi đau',
      ],
      answer: 1,
      explain:
        'Khuỷu là bản lề thật; ép biên độ quá trục tự nhiên chỉ đè phần mềm. Điều chỉnh chọn tay cầm/bài thay vì ép.',
    },
    {
      q: 'Phần "xoay" cẳng tay (sấp/ngửa) thực ra diễn ra ở đâu?',
      choices: [
        'Trong khớp khuỷu thuần túy',
        'Xương quay xoay quanh xương trụ tại khớp trên-dưới cẳng tay',
        'Ở cổ tay',
        'Ở ngón tay',
      ],
      answer: 1,
      explain:
        'Khuỷu chỉ gấp/duỗi; xoay là việc của khớp trên-dưới cẳng tay — vì đổi tay cầm đổi được "cơ nào gánh chính".',
    },
    {
      q: 'Meniscus rách lành chậm chủ yếu vì?',
      choices: [
        'Meniscus gần như không có mạch máu nuôi bên trong',
        'Meniscus bị đốt calo mỗi ngày',
        'Nó là mô cơ',
        'Vì nằm ngoài khớp',
      ],
      answer: 0,
      explain:
        'Vùng trong meniscus vô mạch — dinh dưỡng nhờ dịch khớp — cùng cơ chế như sụn khớp đã học ở bài Khớp & hành động khớp.',
    },
  ],
  related: {
    muscles: ['deltoid', 'supraspinatus', 'gluteus-maximus', 'quadriceps', 'biceps-femoris'],
    exercises: [
      'barbell-back-squat',
      'leg-press',
      'romanian-deadlift',
      'landmine-press',
      'seated-cable-row',
      'overhead-press',
    ],
    calculators: [],
    conditions: ['knee_pain', 'shoulder_pain', 'herniated_disc', 'low_back_pain'],
    evidence: [],
  },
  sources: [
    {
      label: "Gray's Anatomy of the Human Body (Plate 349 — menisci and ligament attachments, đã verify mô tả)",
      url: 'https://commons.wikimedia.org/wiki/File:Gray349.png',
      license: 'Public domain',
    },
    {
      label: 'OpenStax Anatomy & Physiology — Joints of the vertebral column, hip, knee',
      url: 'https://openstax.org/books/anatomy-and-physiology/pages/9-6-types-of-body-movements',
      license: 'CC BY-NC-SA 4.0 (cite-only)',
    },
  ],
};
