/**
 * Ngưỡng lactate & OBLA: ứng dụng chọn bài, khoảng nghỉ.
 *
 * Nguồn: Kenney/Wilmore — Physiology of Sport and Exercise (cite-only),
 * Midgley et al. 2007 (cite-only), bài Hệ năng lượng & HR zones của app.
 */
export default {
  slug: 'phys-2-2',
  module: 'phys',
  chapter: 2,
  chapterTitle: 'Hệ năng lượng',
  order: 2,
  title: 'Ngưỡng lactate: "van xả" quyết định bạn gắng được bao lâu',
  subtitle:
    'Lactate được sản xuất và dọn liên tục — ngưỡng là điểm cân bằng bị phá vỡ; nâng được van này là cách chạy nhanh hơn ở cùng mức gắng.',
  minutes: 11,
  objectives: [
    'Mô tả cân bằng sản xuất–dọn lactate và ý nghĩa của ngưỡng lactate/OBLA.',
    'Giải thích vì sao ngưỡng lactate quan trọng với thành tích hơn cả VO2max ở nhóm đã tập.',
    'Áp dụng hai dạng bài nâng ngưỡng: tempo quanh ngưỡng và interval vượt ngưỡng.',
    'Đọc tín hiệu thực địa (talk test, nhịp tim ổn định) để ước lượng vùng ngưỡng không cần phòng lab.',
  ],
  sections: [
    {
      heading: 'Cân bằng lactate: sản xuất so với dọn dẹp',
      body: `Nhắc lại bài Hệ năng lượng: lactate là **nhiễn liệu** — cơ, tim đốt nó, gan tái tạo thành glucose (vòng Cori). Ngay lúc nghỉ, cơ thể cũng sản xuất và dọn lactate liên tục với nồng độ máu ổn định (~1–2 mmol/L).

Khi cường độ tăng, sản xuất tăng theo. Miễn còn **dọn kịp** — nồng độ chỉ nhích nhẹ, bạn vẫn ở trạng thái ổn định (steady state): giữ tốc độ đó được lâu. Ở một mức nào đó, sản xuất **vượt tay dọn**: lactate tích tụ nhanh, môi trường cơ chua, nhịp thở phình to (thở gấp bù pH) — đây là **ngưỡng lactate**. OBLA (mốc 4 mmol/L thường dùng trong lab) là một cách đánh dấu "tràn van" đó bằng số.`,
    },
    {
      heading: 'Vì sao ngưỡng quan trọng hơn VO2max với người đã tập',
      body: `VO2max (bài kế tiếp) là "dung tích động cơ", nhưng thành tích cự ly trung bình–dài phụ thuộc **một phần lớn vào tốc độ bạn duy trì được trước khi van tràn** — tức % VO2max tại ngưỡng. Người tập có kinh nghiệm thường có VO2max gần nhau nhưng ngưỡng khác nhau rõ, và đó là lý do cùng một bài test, hai người "dung tích" ngang nhau lại về đích xa nhau.

Tin tốt cho khách phổ thông: **ngưỡng lactate cải thiện nhanh và rõ** bằng luyện tập đúng vùng — nhanh hơn nhiều so với kéo VO2max ở người mới.`,
    },
    {
      heading: 'Hai dạng bài nâng van',
      body: `**1. Tempo quanh ngưỡng ("ngưỡng — ngưỡng")**: duy trì tốc độ ngay dưới mức tràn van, thân nhiệt quen, 15–25 phút liên tục. Cảm giác chuẩn: "chịu được nhưng không muốn nói chuyện", nhịp tim ổn định ở Vùng 4 dưới (~80–90% HRmax) và **không dồn lên** sau 10 phút — nếu HR nhích liên tục thì đang vượt ngưỡng, chậm lại chút.

**2. Interval vượt ngưỡng (HIIT kiểu 4×4)**: 4 phút ở trên ngưỡng (Vùng 4–5), nghỉ 3–4 phút, lặp 4 lần. Kiểu "uống ngụm mặn" ép cơ thể thích ứng dọn lactate tốt hơn.

Phân bổ mẫu cho khách phổ thông: 2 buổi Zone 2 (nền — bài Tim mạch) + 1 buổi trong đó có 20–30 phút tempo hoặc 4×4 interval. Trước buổi gắng: đã ngủ đủ, không luyện ngay sau buổi tạ nặng nhất tuần.`,
    },
    {
      heading: 'Đo ngưỡng không cần lab',
      body: `Ba dấu hiệu thực địa dùng được hôm nay:

1. **Talk test ba mức**: nói trọn câu = dưới ngưỡng (Zone 2); chỉ nói được câu ngắn = quanh ngưỡng; vài từ = vượt ngưỡng (Vùng 4–5).
2. **Nhịp tim ổn định 10 phút**: giữ tốc độ, HR sau phút 10 gần bằng phút 3 → quanh steady state; HR leo dần không phanh → đã vượt.
3. **Test 20 phút tempo**: tốc độ trung bình đều nhất trong 20 phút ≈ rất gần tốc độ ngưỡng; dùng nó đặt mốc HIIT (test lại mỗi 6–8 tuần — link bài Battery test).`,
    },
  ],
  applyBox: `**Gian tập thực hành — buổi nâng ngưỡng cho khách chạy bộ phổ thông:**
1. Khởi động 10 phút Zone 2 tăng dần.
2. 20 phút tempo "talk test câu ngắn": chỉnh tốc độ để HR không nhích sau phút 10.
3. Hạ nhiệt 5–10 phút.
4. Tuần sau đó: 4×4 (4 phút Vùng 4–5, nghỉ 3 phút) thay cho tempo.
Ghi lại tốc độ + HR trung bình mỗi buổi vào Sổ tay tag "tempo" — so 6 tuần sau cùng điều kiện.`,
  terms: [
    {
      en: 'Lactate threshold',
      vi: 'Ngưỡng lactate',
      def: 'Cường độ mà lactate tích tụ nhanh hơn khả năng dọn — "van tràn" giới hạn tốc độ duy trì.',
    },
    {
      en: 'OBLA',
      vi: 'OBLA (mốc 4 mmol/L)',
      def: 'Onset of blood lactate accumulation — cách đánh dấu ngưỡng bằng nồng độ lactate máu trong lab.',
    },
    {
      en: 'Steady state',
      vi: 'Trạng thái ổn định',
      def: 'Mức gắng mà sản xuất ≈ dọn dẹp: nồng độ ổn định, giữ được lâu (Zone 2 / dưới ngưỡng).',
    },
    {
      en: 'Tempo run',
      vi: 'Chạy tempo',
      def: 'Buổi duy trì quanh ngưỡng 15–25 phút — cảm giác "chịu được, không muốn nói chuyện".',
    },
    {
      en: 'Lactate shuttle / Cori cycle',
      vi: 'Vòng luân chuyển lactate / vòng Cori',
      def: 'Lactate chảy từ cơ đang co sang cơ khác/tim đốt và gan tái tạo glucose — lý do "học dọn lactate" được bằng luyện tập.',
    },
  ],
  images: [],
  quiz: [
    {
      q: 'Ngưỡng lactate là điểm nào?',
      choices: [
        'Lactate biến mất hoàn toàn khỏi máu',
        'Sản xuất lactate bắt đầu vượt khả năng dọn — nồng độ tích tụ nhanh, cơ chua dần',
        'VO2max chạm đỉnh',
        'Nhịp tim ngừng tăng',
      ],
      answer: 1,
      explain:
        'Trước ngưỡng, sản xuất và dọn cân bằng (steady state); qua ngưỡng, cân bằng vỡ — thở gấp và mệt tăng vọt.',
    },
    {
      q: 'Vì sao ngưỡng lactate được coi là "cục vàng" của khách đã có nền tảng?',
      choices: [
        'Vì VO2max không quan trọng gì',
        'Vì thành tích trung bình-dài phụ thuộc %VO2max tại ngưỡng — và ngưỡng nâng nhanh bằng luyện tập đúng vùng',
        'Vì ngưỡng di truyền hoàn toàn',
        'Vì đo được bằng mắt thường',
      ],
      answer: 1,
      explain:
        'Hai người cùng VO2max nhưng ngưỡng khác nhau thì tốc độ duy trì khác nhau — và ngưỡng đáp ứng luyện tập tốt hơn VO2max ở người đã tập.',
    },
    {
      q: 'Cảm giác chuẩn của buổi tempo quanh ngưỡng là gì?',
      choices: [
        'Nói trọn câu thoải mái',
        '"Chịu được nhưng không muốn nói chuyện", HR ổn định sau phút 10 không nhích dồn',
        'Không nói được gì và chóng mặt',
        'Ngủ được trên máy chạy',
      ],
      answer: 1,
      explain:
        'Quanh ngưỡng = nói được câu ngắn và nhịp tim "phanh" ở mức ổn định; HR leo dần không phanh nghĩa là đã vượt — chậm lại chút.',
    },
    {
      q: 'Interval 4×4 (4 phút Vùng 4–5, nghỉ 3–4 phút) có tác dụng gì với van lactate?',
      choices: [
        'Làm ngưỡng hạ xuống',
        'Ép hệ thống "dọn" lactate hoạt động mạnh — một trong các dạng bài nâng ngưỡng hiệu quả',
        'Chỉ đốt calo, không nâng ngưỡng',
        'Thay thế hoàn toàn Zone 2',
      ],
      answer: 1,
      explain:
        'Tập trên ngưỡng theo lặp = huấn luyện chính quá trình dọn và đốt lactate; Zone 2 vẫn giữ vai nền móng bên dưới.',
    },
    {
      q: 'Test 20 phút tempo dùng để làm gì trong thực địa?',
      choices: [
        'Đo VO2max tuyệt đối',
        'Ước tốc độ ngưỡng — mốc để đặt interval và so sánh lại mỗi 6–8 tuần',
        'Xem ai chịu đựng giỏi hơn',
        'Thay thế bài tập tạ',
      ],
      answer: 1,
      explain:
        'Tốc độ giữ đều 20 phút nằm rất gần ngưỡng — con số rẻ tiền nhưng tin cậy để đặt vùng và đo tiến bộ.',
    },
  ],
  related: {
    muscles: [],
    exercises: [],
    calculators: ['hr-zones'],
    conditions: [],
    evidence: [],
  },
  sources: [
    {
      label: 'Kenney, Wilmore & Costill — Physiology of Sport and Exercise (lactate threshold)',
      url: 'https://us.human-kinetics.com/products/physiology-of-sport-and-exercise',
      license: 'cite-only',
    },
    {
      label: 'Midgley et al. 2007 — Training to enhance lactate threshold (Sports Med)',
      url: 'https://doi.org/10.2165/00007256-200737040-00003',
      license: 'cite-only',
    },
  ],
};
