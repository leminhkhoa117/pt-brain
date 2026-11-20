/**
 * Thời điểm dinh dưỡng quanh buổi tập.
 *
 * Nguồn: Aragon & Schoenfeld 2013 (cite-only), Kerksick et al. 2017
 * ISSN nutrient timing (CC BY), bài Protein của app.
 */
export default {
  slug: 'nutr-4-1',
  module: 'nutr',
  chapter: 4,
  chapterTitle: 'Thời điểm dinh dưỡng',
  order: 1,
  title: 'Ăn quanh buổi tập: cửa sổ thật rộng, đừng bấm đồng hồ 30 phút',
  subtitle:
    'Tổng ngày vẫn là "vua", nhưng khách tập sáng chưa ăn hay tập 2 lần/ngày thì pre/post không còn là chi tiết nhỏ.',
  minutes: 10,
  objectives: [
    'Đặt đúng trọng số: tổng năng lượng/protein ngày trước, timing là tối ưu phần còn lại.',
    'Ghép bữa pre-workout theo khoảng cách thời gian tới buổi tập (2–3 giờ vs gần giờ).',
    'Đặt bữa post-workout hợp lý và bỏ "cửa sổ 30 phút ma thuật".',
    'Quyết định khi nào cần carb + electrolyte TRONG buổi (> 60–90 phút, nóng).',
  ],
  sections: [
    {
      heading: 'Trọng số đúng: tổng trước, timing sau',
      body: `Phân tích lớn (Aragon & Schoenfeld 2013) tóm gọn: với người tập 1 lần/ngày ăn đủ tổng protein và năng lượng, **khoảng vài tiếng quanh buổi tập** đều hỗ trợ tổng hợp protein cơ như nhau — không có "cửa sổ 30 phút đóng sầm" như truyền thuyết phòng gym.

Timing trở nên QUAN TRỌNG thật sự trong 3 tình huống:

1. **Tập sáng sớm khi bụng rỗng** — bữa post là bữa "mở cửa" đầu tiên của ngày.
2. **Tập 2 lần/ngày hoặc cách nhau < 6 tiếng** — hồi glycogen và MPS kịp giữa các buổi.
3. **Buổi dài > 90 phút** — nhiên liệu + dịch trong buổi quyết định chất lượng nửa sau.

Nghĩ thế này cho nhanh: timing là **thu xếp lịch cho khách bận**, không phải phép màu tăng cơ.`,
    },
    {
      heading: 'Trước buổi: theo đồng hồ tới giờ tập',
      body: `**2–3 giờ trước** (bữa chính): carb + protein + ít fat, ví dụ cơm + ức gà + rau; đầy glycogen mà nhẹ bụng.

**30–60 phút trước** (nếu chưa kịp bữa chính): carb nhẹ dễ tiêu + chút protein: chuối + trứng luộc, yến mạch nhỏ, bánh mì với thịt nguội; tránh bữa nhiều fat/chất xơ lớn lúc này — nằm nặng bụng trên ghế bench không ai muốn.

**Caffeine** nếu khách quen dùng: 3–6 mg/kg trước 30–60 phút (bài Supplement hạng A) — nhớ ngưỡng ngủ: nửa đời 4–6 giờ.`,
    },
    {
      heading: 'Sau buổi: rộng, nhưng đừng để "lúc nào cũng được"',
      body: `Mẫu số chung khuyến nghị: **0,4 g/kg protein chất lượng cao trong vài giờ sau tập** (khách 70 kg → ~25–30 g), kèm carb nếu buổi nặng hoặc đói. Ba kiểu khách ba cách xếp:

- **Khách ăn bữa đầy đủ 1–2 giờ TRƯỚC tập**: bữa sau tập 1–2 tiếng sau là đủ — không cần shake ngay giữa phòng.
- **Khách tập sáng bụng rỗng**: bữa sau tập là ưu tiên số 1 của ngày — protein + carb thật, không chỉ cà phê.
- **Khách tập 2 buổi/ngày**: sau buổi 1 nên có carb + protein trong 1–2 tiếng để buổi 2 còn "xăng".

Whey sau tập là **tiện lợi**, không phải bắt buộc — bữa cơm với trứng/cá ngay sau cũng làm tròn nhiệm vụ.`,
    },
    {
      heading: 'Trong buổi: chỉ khi dài hoặc nóng',
      body: `- **Dưới 60 phút**: nước theo khát (bài Hydration) — không cần calo trong buổi.
- **60–90 phút trở lên / nóng / volume lớn**: **30–60 g carb/giờ** (nước trái cây pha, gel, chuối) + natri nếu mồ hôi nhiều.
- **Hai buổi cách < 6 tiếng**: carb sau buổi 1 là "bình xăng" của buổi 2.

Cá nhân hoá theo kinh nghiệm bụng: bắt đầu 20–30 g/giờ dạng lỏng dễ tiêu, chỉnh dần — không ai chạy HIIT tốt với cái bụng đầy gel.`,
    },
  ],
  applyBox: `**Gian tập thực hành — ghép bữa cho 3 kiểu khách:**
1. **Tập 18h, ăn trưa 12h**: ăn nhẹ 16h30 (chuối + trứng); sau tập bữa tối 19h45 đủ protein — không cần thêm shake nếu tối đủ đạm.
2. **Tập 6h sáng**: bữa sau tập 7h15 là "hoàng đạo" — 30 g protein + carb thật + cà phê nếu quen; ghi nhớ mục tiêu protein cả ngày.
3. **Bóng rổ 2 buổi/tuần cách 4 tiếng**: sau buổi 1 uống 40–50 g carb dạng lỏng + 20 g whey, buổi 2 chất lượng giữ được.`,
  terms: [
    {
      en: 'Peri-workout nutrition',
      vi: 'Dinh dưỡng quanh buổi tập',
      def: 'Bữa trước/trong/sau tập — tối ưu phần còn lại sau khi tổng ngày đã đúng, không thay thế tổng.',
    },
    {
      en: 'Pre-workout meal',
      vi: 'Bữa trước tập',
      def: 'Bữa chính 2–3 giờ hoặc nhẹ 30–60 phút trước: carb dễ tiêu + protein, hạn chế fat/chất xơ lớn gần giờ.',
    },
    {
      en: '"Anabolic window"',
      vi: '"Cửa sổ đồng hóa"',
      def: 'Thực tế rộng vài tiếng quanh buổi tập; chỉ hẹp thật sự với khách bụng rỗng hoặc tập 2 lần/ngày.',
    },
    {
      en: 'Intra-workout carbs',
      vi: 'Carb trong buổi',
      def: '30–60 g/giờ cho buổi > 60–90 phút hoặc nóng — giữ chất lượng nửa sau buổi và hồi glycogen.',
    },
    {
      en: 'Post-workout protein',
      vi: 'Protein sau tập',
      def: '~0,4 g/kg chất lượng cao trong vài giờ sau buổi — bữa thật cũng trọn nhiệm vụ như whey.',
    },
  ],
  images: [],
  quiz: [
    {
      q: 'Phát biểu đúng về "cửa sổ 30 phút sau tập"?',
      choices: [
        'Sai lệch hoàn toàn — quá 30 phút là mất toàn bộ buổi tập',
        'Cửa sổ thực tế rộng vài tiếng quanh buổi; chỉ hẹp thật sự khi khách tập bụng rỗng hoặc 2 buổi gần nhau',
        'Chỉ đúng với whey',
        'Chưa có nghiên cứu nào về chủ đề này',
      ],
      answer: 1,
      explain:
        'Tổng ngày là yếu tố chính; phân tích lớn cho thấy vài tiếng quanh buổi hỗ trợ MPS như nhau ở người tập 1 lần/ngày ăn đủ.',
    },
    {
      q: 'Khách tập 6h sáng chưa ăn gì. Bữa nào trở thành ưu tiên số 1?',
      choices: [
        'Bữa tối hôm trước thôi là đủ',
        'Bữa sau tập lúc ~7h15 — protein + carb thật, vì đây là lần nạp "mở cửa" đầu ngày',
        'Chỉ cần cà phê đen',
        'Bỏ ăn để đốt mỡ thêm',
      ],
      answer: 1,
      explain:
        'Tập bụng rỗng là tình huống timing quan trọng thật — bữa sau tập mang đủ protein/carb sẽ không bỏ lỡ cửa sổ đồng hóa đầu ngày.',
    },
    {
      q: 'Bữa 30–60 phút trước buổi nên tránh gì?',
      choices: [
        'Tránh mọi calo',
        'Tránh bữa nhiều fat/chất xơ lớn — nằm nặng bụng khi gắng',
        'Tránh nước',
        'Tránh protein hoàn toàn',
      ],
      answer: 1,
      explain:
        'Gần giờ tập cần thứ nhẹ dễ tiêu (chuối + trứng, yến mạch nhỏ); fat/chất xơ lớn làm việc tiêu hoá tranh máu với cơ.',
    },
    {
      q: 'Buổi tập 2 tiếng dưới nắng. Nên bổ gì trong buổi?',
      choices: [
        'Chỉ nước lọc càng nhiều càng tốt',
        'Carb 30–60 g/giờ + dịch có natri theo tốc độ mồ hôi',
        'Không cần gì, uống sau buổi',
        ' Whey protein mỗi 15 phút',
      ],
      answer: 1,
      explain:
        'Hai tiếng là mốc cần cả nhiên liệu (chất lượng nửa sau) lẫn dịch + muối (bài Hydration & Điều hòa nhiệt).',
    },
    {
      q: 'Hai buổi tập cách 4 tiếng. Hàng loạt việc cần làm sau buổi 1 gồm gì?',
      choices: [
        'Nghỉ tuyệt đối tới buổi 2',
        'Carb + protein trong 1–2 tiếng sau buổi 1 để glycogen và MPS kịp hồi cho buổi 2',
        'Chỉ ngủ 20 phút',
        'Chỉ tập lại bắp tay cho nhẹ',
      ],
      answer: 1,
      explain:
        'Khoảng cách ngắn là một trong 3 tình huống timing "quyết định thật" — bữa giữa hai buổi là xăng của buổi sau.',
    },
  ],
  related: {
    muscles: [],
    exercises: [],
    calculators: ['macro', 'calories'],
    conditions: [],
    evidence: ['E3'],
  },
  sources: [
    {
      label: 'Aragon & Schoenfeld 2013 — Nutrient timing revisited (JISSN)',
      url: 'https://doi.org/10.1186/1550-2783-10-5',
      license: 'CC BY 4.0',
    },
    {
      label: 'Kerksick et al. 2017 — ISSN position stand: nutrient timing',
      url: 'https://doi.org/10.1186/s12970-017-0189-4',
      license: 'CC BY 4.0',
    },
    {
      label: 'Morton et al. 2018 — Protein meta-analysis (E3, đã kiểm chứng)',
      url: 'https://doi.org/10.1136/bjsports-2017-097608',
      license: 'CC BY 4.0',
    },
  ],
};
