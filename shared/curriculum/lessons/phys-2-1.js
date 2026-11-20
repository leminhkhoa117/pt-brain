/**
 * Ba hệ năng lượng: vì sao sprint khác marathon.
 *
 * Nguồn: OpenStax A&P (cite-only), Kenney/Wilmore — Physiology of Sport and
 * Exercise (cite-only), ISSN creatine position stand (đã kiểm chứng).
 */
export default {
  slug: 'phys-2-1',
  module: 'phys',
  chapter: 2,
  chapterTitle: 'Hệ năng lượng',
  order: 1,
  title: 'Ba hệ năng lượng: đọc đúng "đồng hồ đốt nhiên liệu" của cơ thể',
  subtitle:
    'Phosphagen cho cú nổ 10 giây, glycolytic cho cữ 2 phút, oxidative cho mọi thứ dài hơn — và cả ba luôn chạy cùng nhau.',
  minutes: 12,
  objectives: [
    'Giải thích ATP là "đồng tiền năng lượng" duy nhất cơ co sử dụng và vì sao dự trữ trong cơ chỉ đủ vài giây.',
    'Gọi tên 3 hệ năng lượng kèm thời gian chủ đạo và đặc điểm công suất của mỗi hệ.',
    'Hiểu lactate là nhiên liệu được tái sử dụng, không phải "chất độc gây mệt" — và ngưỡng lactate nghĩa là gì.',
    'Chọn thời gian nghỉ giữa set và cấu trúc cardio dựa trên hệ năng lượng mục tiêu.',
  ],
  sections: [
    {
      heading: 'ATP: đồng tiền duy nhất của cơ',
      body: `Mọi chuyển động — từ nhấc ly cà phê tới cú snatch tối đa — cơ đều phải **nạp năng lượng bằng ATP (adenosine triphosphate)**. Cắt đứt một nhóm phosphate của ATP giải phóng năng lượng cho đầu cơ (myosin) kéo sợi actin; ATP còn cần để **thả** đầu cơ ra nữa.

Vấn đề: lượng ATP trong cơ tại một thời điểm chỉ đủ cho **vài giây** công suất tối đa. Cơ thể không thể tích trữ nhiều ATP, nên nó phải **tái tạo ATP liên tục** từ 3 đường, mỗi đường có tốc độ và "dung tích bình xăng" khác nhau. Sức mạnh = tốc độ tái tạo ATP; sức bền = khả năng duy trì tốc độ đó.`,
      image: 'phys-2-1-atp.svg',
    },
    {
      heading: 'Hệ 1 — Phosphagen (ATP–PCr): cú nổ 10 giây',
      body: `Trong cơ còn lưu **phosphocreatine (PCr)** — một "pin dự phòng" phosphate gắn sẵn. Khi ATP cạn, enzyme creatine kinase chuyển phosphate từ PCr sang ADP để tạo ATP ngay lập tức, **không cần oxy, chỉ một bước phản ứng**.

Đặc tính: công suất **cao nhất** của cả 3 hệ nhưng bình rất nhỏ — tối đa cho cữ **~10 giây** hết sức (sprint 100 m, cú jump, set 1–3 rep tạ tối đa). Sau đó cần phút để "nạp lại PCr".

Đây là hệ mà supplement **creatine** tác động vào: tăng dự trữ PCr ~20–40% giúp cữ tốc-độ-lực lặp lại nhiều hơn (chi tiết trong bài Supplement của module Dinh dưỡng).`,
    },
    {
      heading: 'Hệ 2 — Glycolytic: cữ 10 giây đến 2 phút',
      body: `Khi cữ kéo dài hơn PCr gánh được, cơ bẻ gãy **glucose/glycogen** (carb dự trữ trong cơ) qua đường phân giải (glycolysis) để tạo ATP nhanh, **không cần oxy**.

Đặc tính: công suất cao hơn một chút và bình to hơn phosphagen, nhưng sản phẩm phụ **lactate + proton tích luỹ** làm môi trường cơ chua dần — bạn cảm giác nóng rát, giảm lực. Cữ điển hình: **~10 giây tới ~2 phút** (sprint 400 m, set 8–15 rep tới cạn, HIIT 30 giây/tiếng).

**Sửa một hiểu lầm lớn:** lactate không phải "chất độc". Lactate là **nhiên liệu**: cơ và tim đốt nó làm năng lượng, gan tái tạo nó thành glucose (vòng Cori). Vấn đề của mệt mỏi là môi trường acid đi kèm sự tích luỹ và tín hiệu não-trung ương, không phải bản thân lactate. "Ngưỡng lactate" (lactate threshold) là mức cường độ mà lactate bắt đầu dồn nhanh hơn cơ thể dọn — mốc vàng để chia vùng tập cardio.`,
    },
    {
      heading: 'Hệ 3 — Oxidative: mọi thứ dài hơn 2 phút',
      body: `Từ ~2 phút trở lên, phần năng lượng lớn nhất đến từ **phân giải oxy hóa (oxidative system)**: đốt carb và chất béo **cùng oxy** trong ty thể. Công suất thấp nhất nhưng bình "vô tận" (chất béo dự trữ hàng chục nghìn kcal) và không tích phế độc chua.

Đặc tính: duy trì mãi được ở cường độ vừa — đi bộ, chạy dài, đạp xe bền. Đây là **nền móng của mọi hệ**: cả khách tập tạ lẫn vận động viên sprint vẫn cần base aerobic để hồi phục giữa set, giữa buổi và để "tống" lactate đi đốt.

Ba hệ **không bật/tắt rời rạc** — cả ba luôn chạy đồng thời, chỉ **tỷ lệ đóng góp** thay đổi theo cường độ và thời gian. Sprint 6 giây vẫn có chút oxidative; marathon vẫn đốt chút phosphagen mỗi lúc băng đường đông người.`,
    },
    {
      heading: 'Hệ quả trực tiếp lên giáo án của bạn',
      body: `**Nghỉ giữa set theo mục tiêu:**

| Mục tiêu | Hệ chịu tải chính | Nghỉ gợi ý |
| --- | --- | --- |
| Sức mạnh tối đa (1–3 rep) | Phosphagen | 2–5 phút để nạp lại PCr |
| Tăng cơ (6–12 rep gần cạn) | Phosphagen + glycolytic | 1–3 phút |
| Sức bền cơ (15+ rep) | Glycolytic + oxidative | 30 giây–1 phút |

**Chọn cardio:** HIIT 20–40 giây/cữ đánh mạnh glycolytic + ngưỡng lactate; steady state Zone 2 xây base oxidative. Khách mới nên ưu tiên base trước — nền oxy hóa tốt giúp mọi bài khác mệt ít hơn.

**Giải thích cho khách bằng hình ảnh đơn giản:** phosphagen là "tiền mặt trong túi", glycolytic là "thẻ tín dụng trả nhanh", oxidative là "lương chuyển khoản" — chậm nhưng không bao giờ cạn.`,
    },
  ],
  applyBox: `**Gian tập thực hành — thiết kế nghỉ theo hệ năng lượng:**
1. Buổi sức mạnh 1–3 rep: đồng hồ nghỉ 3 phút thật sự (khách hay đọc mạng 90 giây rồi vào — thưa hết công suất phosphagen).
2. Buổi tăng cơ: nghỉ 90 giây–2 phút; quan sát rep cuối mỗi set không rơi quá 1–2 rep so với set đầu.
3. Cardio cho khách giảm mỡ: 2 buổi Zone 2 (nói được câu trọn vẹn khi chạy) + 1 buổi HIIT sau khi có base ≥ 4 tuần.
4. Test nhanh với máy đo nhịp tim: sau cữ glycolytic, HR hồi về Zone 2 trong < 2 phút là dấu hiệu base aerobic ổn.`,
  terms: [
    {
      en: 'ATP',
      vi: 'Adenosine triphosphate',
      def: 'Đơn vị năng lượng duy nhất cơ sử dụng; dự trữ tại chỗ chỉ đủ vài giây nên phải tái tạo liên tục.',
    },
    {
      en: 'Phosphocreatine (PCr)',
      vi: 'Phosphocreatine',
      def: '"Pin phosphate" dự phòng trong cơ; tái tạo ATP cực nhanh cho cữ ~10 giây — đích tác động của supplement creatine.',
    },
    {
      en: 'Glycolysis',
      vi: 'Phân giải đường',
      def: 'Đường bẻ glucose/glycogen tạo ATP không cần oxy; gánh cữ ~10 giây đến 2 phút.',
    },
    {
      en: 'Lactate threshold',
      vi: 'Ngưỡng lactate',
      def: 'Cường độ mà lactate tích tụ nhanh hơn khả năng dọn; mốc chia vùng tập cardio hiệu quả.',
    },
    {
      en: 'Oxidative system',
      vi: 'Hệ oxy hóa',
      def: 'Đốt carb và chất béo bằng oxy trong ty thể; công suất thấp nhưng duy trì được rất lâu.',
    },
    {
      en: 'Phosphagen system',
      vi: 'Hệ phosphagen',
      def: 'Đường ATP–PCr: công suất cao nhất, dung tích nhỏ nhất (~10 giây hết sức).',
    },
  ],
  images: [
    {
      file: 'phys-2-1-atp.svg',
      caption: 'Cấu trúc hóa học của ATP — adenosin gắn 3 nhóm phosphate; cắt một phosphate giải phóng năng lượng cho cơ co.',
      source: 'Mysid / Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:ATP_structure.svg',
      license: 'Public domain',
    },
  ],
  quiz: [
    {
      q: 'Vì sao cơ thể không thể "tích trữ sẵn" một cục ATP lớn?',
      choices: [
        'ATP bị mất qua mồ hôi',
        'ATP chỉ dùng được trong não',
        'Lượng ATP lưu tại cơ chỉ đủ vài giây và cơ thể ưu tiên tái tạo liên tục thay vì tích trữ',
        'ATP chỉ tồn tại ở thực vật',
      ],
      answer: 2,
      explain:
        'Cơ không dự trữ ATP nhiều — cơ chế sinh tồn của nó là 3 đường tái tạo nhanh/chậm khác nhau, mở ra toàn bộ khoa học huấn luyện.',
    },
    {
      q: 'Sprint 100 m và set 1–3 rep tạ tối đa chủ yếu rút hệ nào?',
      choices: ['Oxidative', 'Phosphagen (ATP–PCr)', 'Glycolytic', 'Không dùng ATP'],
      answer: 1,
      explain:
        'Cố sức ~10 giây là đúng "bình" của phosphagen — công suất cực đại, tái tạo chỉ một bước từ PCr.',
    },
    {
      q: 'Phát biểu nào về lactate là ĐÚNG?',
      choices: [
        'Lactate là chất độc gây mệt và nên bị loại hoàn toàn',
        'Lactate là nguyên nhân trực tiếp của DOMS',
        'Lactate là nhiên liệu được cơ, tim đốt và gan tái tạo thành glucose',
        'Lactate chỉ xuất hiện khi cơ bị chấn thương',
      ],
      answer: 2,
      explain:
        'Lactate được tái sử dụng làm năng lượng (vòng Cori). Mệt mỏi đến từ môi trường acid kèm theo và tín hiệu trung ương, không phải lactate.',
    },
    {
      q: 'Set 12 rep tới cạn (khoảng 40 giây) thuộc vùng chuyển tiếp nào?',
      choices: ['Chỉ phosphagen', 'Chỉ oxidative', 'Phosphagen + glycolytic là chính', 'Chỉ glycolytic thuần túy'],
      answer: 2,
      explain:
        'Cữ ~40 giây gần hết sức do glycolytic gánh chính, phosphagen trợ lực đầu cữ — nhiệt rát cuối set chính là môi trường acid tích luỹ.',
    },
    {
      q: 'Muốn khách nâng được số rep không rơi giữa các set sức mạnh tối đa, PT nên để nghỉ bao lâu?',
      choices: ['30 giây', '45 giây', '2–5 phút để nạp lại PCr', 'Không nghỉ, liên tục'],
      answer: 2,
      explain:
        'PCr cần khoảng 2–5 phút để nạp lại phần lớn; cắt nghỉ khiến công suất phosphagen chưa hồi, rep rơi nhanh.',
    },
    {
      q: 'Creatine supplement cải thiện hiệu quả tập chủ yếu qua cơ chế nào?',
      choices: [
        'Đốt mỡ trực tiếp',
        'Tăng dự trữ PCr trong cơ, cho cữ tốc-độ-lực lặp lại nhiều hơn',
        'Thay thế protein xây cơ',
        'Tăng số lượng sợi cơ tức thì',
      ],
      answer: 1,
      explain:
        'ISSN position stand: creatine tăng creatine nội cơ ~20–40%, củng cố hệ phosphagen — giúp tập chất lượng hơn, từ đó thích ứng tốt hơn.',
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
      label: 'OpenStax Anatomy & Physiology — Overview of Metabolic Reactions',
      url: 'https://openstax.org/books/anatomy-and-physiology/pages/24-1-overview-of-metabolic-reactions',
      license: 'CC BY-NC-SA 4.0 (cite-only)',
    },
    {
      label: 'Kenney, Wilmore & Costill — Physiology of Sport and Exercise (ch. Energy systems)',
      url: 'https://us.human-kinetics.com/products/physiology-of-sport-and-exercise',
      license: 'cite-only',
    },
    {
      label: 'Kreider et al. 2017 — ISSN position stand: creatine (đã kiểm chứng)',
      url: 'https://doi.org/10.1186/s12970-017-0173-z',
      license: 'CC BY 4.0',
    },
  ],
};
