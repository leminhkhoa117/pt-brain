/**
 * DOMS, mệt mỏi trung ương/ngoại vi và giấc ngủ.
 *
 * Nguồn: Cheung et al. 2003 (cite-only), OpenStax (cite-only),
 * bài Hệ năng lượng & Tăng cơ của PT Brain.
 */
export default {
  slug: 'phys-5-1',
  module: 'phys',
  chapter: 5,
  chapterTitle: 'Mệt mỏi & phục hồi',
  order: 1,
  title: 'DOMS, mệt mỏi và giấc ngủ: tách sự thật khỏi thước đo anh hùng',
  subtitle:
    'Đau cơ muộn không phải lactate và không phải thước tiến bộ; mệt có hai loại; còn giấc ngủ là "steroid hợp pháp" rẻ nhất.',
  minutes: 11,
  objectives: [
    'Mô tả DOMS đúng cơ chế: peak 24–72 giờ, nghiêng về pha eccentric, thuyên giảm khi lặp lại (repeat bout effect).',
    'Đập bỏ hai hiểu lầm: DOMS do lactate; DOMS càng to càng tốt.',
    'Phân biệt mệt mỏi trung ương và ngoại vi cùng cách đọc của PT trong buổi tập.',
    'Nêu 3 công cụ phục hồi có bằng chứng mạnh nhất theo thứ tự tác động: ngủ, vận động nhẹ, dinh dưỡng đủ.',
  ],
  sections: [
    {
      heading: 'DOMS là gì — và không phải là gì',
      body: `**DOMS (delayed onset muscle soreness)** — đau cơ muộn: xuất hiện sau 12–24 giờ, **đỉnh 24–72 giờ**, rồi tự giảm. Nó đến nhiều nhất sau:

- **Pha hạ tải (eccentric)**: hạ người, phanh downhill, xuống cầu thang.
- **Động tác lạ với cơ** hoặc quay lại sau nghỉ dài.

Cơ chế hiện được chấp nhận: **tổn thương vi mô + phản ứng viêm nhẹ** trong cơ và mô quanh cơ, làm đầu thần kinh cảm giác nhạy lên — chứ **không phải lactate**: lactate trở về bình thường trong ~1 giờ sau buổi (bài Hệ năng lượng), còn DOMS thì hôm sau mới xuất hiện. Hai mốc thời gian này đủ để loại trừ nhau.

**Repeat bout effect**: một buổi eccentric giống đó lần sau đau ít đi nhiều — cơ và gân "được dạy" chịu mẫu lực này. Đây là lý do buổi tập eccentric có kiểm soát là "vắc-xin DOMS" tốt hơn né tránh.`,
    },
    {
      heading: 'DOMS không phải thước tiến bộ',
      body: `Nghi ngờ ngay khi nghe "đau nhiều chứng tỏ hiệu quả":

- Bài tập quen, load lên từng tuần: có tiến bộ mà ít đau hơn tuần đầu.
- Đau "đẹp" 1–2/10 thoáng qua: ổn. Đau gây đi khập khiễng, ngủ không yên, mất sức 2 buổi liền: bạn đã vượt tải và đang trả lãi.

Quy tắc đọc DOMS: **mức + thời gian hồi**. DOMS nặng kéo dài > 72 giờ hoặc làm giảm chất lượng set buổi sau → giảm volume hoặc kéo dài khoảng nghỉ giữa các buổi tấn công cùng nhóm. Ghi DOMS (0–10) sau mỗi buổi trong Sổ tay là dữ liệu điều chỉnh volume tốt hơn mọi cảm tính.`,
    },
    {
      heading: 'Hai loại mệt trong cùng một buổi',
      body: `**Mệt ngoại vi (peripheral)**: nằm tại cơ — glycogen cạn, tích phế chuyển hoá, calcium rút chậm; biểu hiện: tạ "nặng hơn" ở nhóm đó, burn rõ, nghỉ 2–3 phút hồi được.

**Mệt trung ương (central)**: não giảm "lệnh" xuống cơ — cơ chế bảo vệ; biểu hiện: RPE của MỌI bài đều lên, kỹ thuật xấu ở tạ quen, mood xuống, "không muốn vào set tiếp". Nghỉ giữa set không đủ — cần nghỉ ngày, ăn, ngủ.

PT đọc trong buổi: cùng một set, nếu form vỡ mà nhóm cơ chưa burn → mệt trung ương đang chủ trì → dừng buổi sớm, hạ volume ngày hôm sau; nếu chỉ một nhóm cháy → điều chỉnh nghỉ/volume nhóm đó thôi.`,
    },
    {
      heading: 'Ba công cụ phục hồi theo thứ tự tác động',
      body: `1. **Giấc ngủ 7–9 giờ**: nơi xảy ra phần lớn phục hồi nội tiết + thần kinh; thiếu ngủ làm giảm hiệu suất và tăng cảm giác gắng ở MỌI mức. Đây là biến số phục hồi duy nhất khách phải làm mỗi ngày — ưu tiên trước mọi "thiết bị hồi phục".
2. **Vận động nhẹ (active recovery)**: đi bộ, đạp xe rất nhẹ, bơi nhàn — tăng máu tới cơ, giảm cảm giác đau DOMS thoáng qua; không cần "đẩy axit ra" (lactate đã tự dọn xong).
3. **Dinh dưỡng + nước đủ** (bài Protein & Năng lượng): tổng protein 1,6–2,2 g/kg, calo không cắt quá sâu trong tuần nặng.

Các "công cụ thêm" (massage, foam roll, lạnh): cảm giác dễ chịu thật, tác động thành tích mờ nhạt hơn 3 trụ cột — dùng khi thích, đừng thay trụ cột.`,
    },
  ],
  applyBox: `**Gian tập thực hành — tuần có bài mới:**
1. Bài mới (hoặc eccentric nặng): volume chỉ 2–3 set buổi đầu, để repeat bout effect "đề kháng hoá" buổi sau.
2. Ghi DOMS 0–10 vào Sổ tay 24h + 48h sau buổi; dòng dữ liệu 2 tuần cho bạn volume tối ưu của từng khách.
3. Buổi sau DOMS nặng: đổi thành active recovery 20–30 phút (đi bộ/đạp nhẹ) + các nhóm cơ không dính.
4. Hai buổi liên tiếp "trung ương mệt" (RPE mọi bài đều tăng, form vỡ tạ quen) → chèn 2 ngày nghỉ, ngủ bù, rồi quay lại volume -30%.`,
  terms: [
    {
      en: 'DOMS',
      vi: 'Đau cơ muộn',
      def: 'Đau 12–72 giờ sau vận động eccentric/lạ; do vi tổn thương + viêm nhẹ, không phải lactate.',
    },
    {
      en: 'Eccentric (phasis)',
      vi: 'Pha hạ có tải',
      def: 'Cơ đang dài ra vẫn phải phanh — nguồn DOMS chính và cũng là "vắc-xin" qua repeat bout effect.',
    },
    {
      en: 'Repeat bout effect',
      vi: 'Hiệu ứng lần lặp',
      def: 'Cùng một bài eccentric, lần sau đau ít hơn nhiều — mô đã được "dạy" chịu mẫu lực đó.',
    },
    {
      en: 'Central fatigue',
      vi: 'Mệt trung ương',
      def: 'Não giảm lệnh xuống cơ (bảo vệ): mọi bài đều thấy nặng, form tạ quen xấu — cần nghỉ/ngủ, không chỉ nghỉ set.',
    },
    {
      en: 'Active recovery',
      vi: 'Phục hồi chủ động',
      def: 'Vận động rất nhẹ tăng máu tới cơ, giảm đau DOMS thoáng qua; không "đẩy lactate ra" vì lactate đã dọn xong.',
    },
    {
      en: 'Sleep 7–9h',
      vi: 'Ngủ 7–9 giờ',
      def: 'Trụ phục hồi số một: nội tiết + thần kinh hồi ở đây; thiếu ngủ làm tăng RPE ở mọi mức gắng.',
    },
  ],
  images: [],
  quiz: [
    {
      q: 'DOMS đạt đỉnh khoảng khi nào so với buổi tập?',
      choices: ['Ngay khi kết thúc buổi', '1 giờ sau', '24–72 giờ sau', 'Hai tuần sau'],
      answer: 2,
      explain:
        'Đau muộn đúng nghĩa: 12–24 giờ khởi phát, đỉnh 24–72 giờ — mốc thời gian loại trừ luôn giả thuyết lactate (hết trong ~1 giờ).',
    },
    {
      q: 'Vì sao DOMS KHÔNG thể do lactate?',
      choices: [
        'Lactate ở trong máu không bao giờ',
        'Lactate về bình thường trong ~1 giờ sau buổi, còn DOMS mới xuất hiện hôm sau — hai mốc không trùng',
        'Lactate là protein',
        'DOMS chỉ có ở người không tập',
      ],
      answer: 1,
      explain:
        'Dòng thời gian là bằng chứng: lactate dọn nhanh (và là nhiên liệu — bài Hệ năng lượng), DOMS đến từ vi tổn thương + viêm nhẹ.',
    },
    {
      q: 'Vì sao buổi eccentric có kiểm soát được ví là "vắc-xin DOMS"?',
      choices: [
        'Vì nó làm hết đau vĩnh viễn ngay một lần',
        'Repeat bout effect: lần gặp lại mẫu lực đó, cơ đau ít hơn nhiều',
        'Vì nó đốt lactate trước',
        'Vì làm mất cảm giác đau thần kinh',
      ],
      answer: 1,
      explain:
        'Mô "học" chịu mẫu lực qua từng lần lặp — vì vậy không né bài mới, chỉ nạp volume từ từ.',
    },
    {
      q: 'Set quen thuộc bỗng form vỡ dù nhóm cơ chưa burn. Đọc tín hiệu nào?',
      choices: [
        'Mệt ngoại vi của nhóm đó — nghỉ thêm 2 phút là đủ',
        'Mệt trung ương đang chủ trì: cân nhắc dừng buổi sớm và hạ volume hôm sau',
        'Chỉ thiếu nhạc',
        'Cần tăng tạ ngay',
      ],
      answer: 1,
      explain:
        'Mệt trung ương làm mọi bài nặng lên cùng lúc; nghỉ set không sửa được — nghỉ ngày, ngủ, ăn là đúng đơn.',
    },
    {
      q: 'Thứ tự công cụ phục hồi theo tác động mạnh nhất?',
      choices: [
        'Máy massage đắt → foam roll → nước đá',
        'Ngủ 7–9 giờ → vận động nhẹ → dinh dưỡng + nước đủ; thiết bị là phần phụ',
        'Cafein → tập tiếp',
        'Nằm bất động 3 ngày',
      ],
      answer: 1,
      explain:
        'Ba trụ cột có bằng chứng mạnh và miễn phí hoặc rất rẻ; massage, lạnh, foam roll dễ chịu thật nhưng không thay được trụ.',
    },
  ],
  related: {
    muscles: [],
    exercises: ['romanian-deadlift', 'nordic-curl', 'walking-lunge'],
    calculators: [],
    conditions: [],
    evidence: [],
  },
  sources: [
    {
      label: 'Cheung, Hume & Maxwell 2003 — Delayed onset muscle soreness (Sports Med)',
      url: 'https://doi.org/10.2165/00007256-200333030-00002',
      license: 'cite-only',
    },
    {
      label: 'OpenStax Anatomy & Physiology — ATP & metabolic recovery',
      url: 'https://openstax.org/books/anatomy-and-physiology/pages/10-3-muscle-fiber-excitationcontraction-coupling',
      license: 'CC BY-NC-SA 4.0 (cite-only)',
    },
  ],
};
