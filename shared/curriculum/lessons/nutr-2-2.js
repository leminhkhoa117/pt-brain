/**
 * Carbohydrate: nhiên liệu của cường độ.
 *
 * Nguồn: ACSM/AND position stand nutrition (cite-only),
 * ISSN nutrient timing (cite-only), bài Năng lượng & Protein của app.
 */
export default {
  slug: 'nutr-2-2',
  module: 'nutr',
  chapter: 2,
  chapterTitle: 'Macronutrient',
  order: 2,
  title: 'Carbohydrate: bình xăng của cường độ cao',
  subtitle:
    'Glycogen cơ là nhiên liệu của các set nặng và cữ sprint — biết nhu cầu theo loại khách và bỏ được hai myth phổ biến.',
  minutes: 11,
  objectives: [
    'Mô tả vai trò của carbohydrate: năng lượng 4 kcal/g, dự trữ glycogen cơ và gan, nhiên liệu ưu tiên khi gắng.',
    'Nêu khoảng nhu cầu carb theo mức vận động: 3–5 g/kg cho khách phổ thông tới 5–8+ g/kg cho tập nặng/đài.',
    'Phân biệt carb "nhanh quanh buổi tập" và carb toàn phần giàu chất xơ cho ngày thường.',
    'Đập bỏ hai myth: "carb ban đêm tự béo" và "cắt carb là cách giảm mỡ duy nhất".',
  ],
  sections: [
    {
      heading: 'Carb làm gì trong cơ thể người tập',
      body: `Carbohydrate mang **4 kcal/g** và tồn tại dưới hai dạng chính: đường trong máu (glucose — "tiền mặt") và **glycogen** — dạng dự trữ nhồi trong cơ (~300–500 g) và gan (~100 g).

Với người tập, glycogen cơ chính là **bình xăng của cường độ**: các set nặng, cữ HIIT, sprint đều rút glycogen trước (bài Hệ năng lượng). Hệ thần kinh trung ương cũng chạy chủ yếu trên glucose — vì vậy "keto flu" và tập nặng thường đi kèm cảm giác uể oải ở giai đoạn đầu cắt carb mạnh.

Điểm đáng nhớ khi đọc giáo án: **khi glycogen cạn, chất lượng set giảm trước khi ý chí giảm** — khách bench press rep 6-7 tụt dù "vẫn còn sức" thường là câu chuyện nhiên liệu, không phải "lười".`,
    },
    {
      heading: 'Nhu cầu theo loại khách',
      body: `Khung tham chiếu phổ biến (theo cân nặng mỗi ngày):

| Loại hoạt động | Khoảng carb |
| --- | --- |
| Khách văn phòng, cardio nhẹ, giảm mỡ ưu tiên | 2–4 g/kg |
| Tạ 3–5 buổi/tuần, mục tiêu hình thể | 3–5 g/kg |
| Tập nặng volume cao / HIIT nhiều / thể thao phức tạp | 5–8+ g/kg |

Con số đầu chỉ là **điểm bắt đầu**: carb là biến số "đàn hồi" — sau khi protein và chất béo đã đặt đúng chỗ, carb điều chỉnh theo năng lượng còn lại của mục tiêu (deficit/surplus — bài Năng lượng). Máy tính **Calo & macro** của app tự chia phần này khi bạn đặt mục tiêu.`,
    },
    {
      heading: 'Chọn carb nào, lúc nào',
      body: `Nguyên tắc thực dụng, không cần bảng chỉ số GI thuộc lòng:

- **Quanh buổi tập** (1–2 giờ trước, trong, ngay sau với buổi dài): carb **nhanh, dễ tiêu** — chuối, cơm gạo trắng, bánh mì, nước trái cây pha loãng. Mục tiêu: đầy bình mà không nặng bụng.
- **Ngày thường**: carb **toàn phần + chất xơ** — cơm gạo lứt, khoai, yến mạch, đậu, trái cây nguyên vỏ. Chất xơ làm no lâu, tốt đường ruột và đường máu.
- **Đo độ "đúng nguồn"**: nhìn đĩa của khách — 1/2 rau-trái cây, 1/4 protein, 1/4 carb toàn phần là khung mặc định lành mạnh cho bữa ngày thường.`,
      image: 'nutr-2-2-myplate.webp',
    },
    {
      heading: 'Hai myth đáng bỏ ngay',
      body: `**Myth 1 — "Ăn carb sau 18h tự béo."** Cân nặng theo **tổng năng lượng** (bài Năng lượng), không theo đồng hồ. Carb ban đêm thậm chí tiện cho khách tập tối: nạp lại glycogen cho buổi hôm sau và giúp ngủ dễ hơn với nhiều người. Phân bổ carb quanh buổi tập là tối ưu về tiện dụng, không phải bắt buộc giờ cụ thể.

**Myth 2 — "Muốn giảm mỡ phải cắt carb."** Deficit tạo bằng cách nào cũng giảm cân; cắt carb chỉ là MỘT cách (bỏ được nhóm thực phẩm dễ ăn thừa). Khách chạy HIIT/tạ nặng mà cắt carb quá mức sẽ mất chất lượng tập trước khi mất mỡ — deficit vừa + carb đủ cho các buổi gắng là kế hoạch bền hơn.`,
    },
  ],
  applyBox: `**Gian tập thực hành — đặt carb cho khách tạ 4 buổi/tuần (70 kg):**
1. Protein 1,6–2,2 g/kg trước (bài Protein) → ~120–150 g.
2. Chất béo ~0,8–1 g/kg → ~60 g.
3. Carb lấy phần calo còn lại của mục tiêu — ví dụ maintain ~2.400 kcal → carb ~250 g (~3,5 g/kg).
4. Phân bổ: 60% quanh buổi (trước/sau), 40% các bữa chính dạng toàn phần.
5. Buổi nặng nhất để ý rep cuối mỗi set: tụt 2 rep liền 2 buổi → thử +30–50 g carb hôm trước và so.`,
  terms: [
    {
      en: 'Glycogen',
      vi: 'Glycogen',
      def: 'Dạng dự trữ carb trong cơ (300–500 g) và gan (~100 g); nhiên liệu chính của cường độ cao.',
    },
    {
      en: 'Glucose',
      vi: 'Glucose',
      def: 'Đường trong máu — năng lượng tức thì cho cơ và hệ thần kinh; quá mức được đóng thành glycogen.',
    },
    {
      en: 'Dietary fiber',
      vi: 'Chất xơ',
      def: 'Phần carb không tiêu hoá; làm no lâu, tốt đường máu và đường ruột — ưu tiên ở bữa ngày thường.',
    },
    {
      en: 'Carb periodization',
      vi: 'Phân bổ carb',
      def: 'Đặt nhiều carb quanh buổi tập và ngày nặng, ít hơn ngày nghỉ — điều chỉnh tiện lợi, không phải luật cứng.',
    },
    {
      en: 'Glycogen depletion',
      vi: 'Cạn glycogen',
      def: 'Bình xăng rỗng làm chất lượng set/cữ tụt — thường bị đọc nhầm thành "khách lười".',
    },
  ],
  images: [
    {
      file: 'nutr-2-2-myplate.webp',
      caption:
        'Một bữa tối mẫu theo mô hình MyPlate: 5 nhóm thực phẩm — ngũ cốc, protein, sữa, rau, trái cây.',
      source: 'USDA Food and Nutrition Service',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dinner_meal_-_MyPlate_20210810-FNS-UNC-0017.jpg',
      license: 'Public domain (US Gov)',
    },
  ],
  quiz: [
    {
      q: 'Carbohydrate mang bao nhiêu năng lượng và dự trữ chủ yếu ở đâu?',
      choices: [
        '9 kcal/g, dự trữ trong mỡ',
        '4 kcal/g; dự trữ dạng glycogen trong cơ và gan',
        '7 kcal/g, dự trữ trong xương',
        'Không có năng lượng',
      ],
      answer: 1,
      explain:
        '4 kcal/g; glycogen cơ ~300–500 g là "bình xăng" cho các set nặng và cữ gắng sức.',
    },
    {
      q: 'Khách tập tạ nặng 5 buổi/tuần + HIIT. Khoảng carb tham chiếu ban đầu hợp lý?',
      choices: ['0 g/kg — keto bắt buộc', '1–2 g/kg', '5–8+ g/kg', 'Chỉ ăn carb cuối tuần'],
      answer: 2,
      explain:
        'Volume càng cao, glycogen cần càng nhiều: 5–8+ g/kg là khung bắt đầu cho nhóm này, chỉnh theo dữ liệu rep/quality set.',
    },
    {
      q: '"Ăn cơm tối 20h khiến béo" — phát biểu đúng là gì?',
      choices: [
        'Đúng, cơ thể sau 18h đóng cửa đốt carb',
        'Sai: cân nặng theo tổng năng lượng; carb buổi tối tiện cho khách tập tối và nạp glycogen buổi sau',
        'Đúng nếu cơm trắng, sai nếu cơm gạo lứt',
        'Chỉ đúng với phở',
      ],
      answer: 1,
      explain:
        'Không có "giờ đóng cửa" chuyển hoá — phân bổ quanh buổi tập là tối ưu tiện dụng, không phải phép màu giờ giấc.',
    },
    {
      q: 'Khách bench set nặng tụt 2 rep cuối trong 2 buổi liền dù ngủ ổn. Khả năng đáng kiểm tra đầu tiên?',
      choices: [
        'Khách lười',
        'Nhiên liệu: glycogen thấp do carb quanh buổi cắt giảm — thử tăng carb hôm trước rồi so',
        'Cần đổi bài ngực',
        'Phải tăng RIR',
      ],
      answer: 1,
      explain:
        'Chất lượng set tụt trước khi ý chí tụt là dấu hiệu bình xăng: điều chỉnh nhiên liệu rồi đánh giá lại, không kết luận "không nỗ lực".',
    },
    {
      q: 'Chọn carb cho bữa ngày thường (không gần buổi tập) ưu tiên gì?',
      choices: [
        'Nước ngọt cho nhanh',
        'Carb toàn phần giàu chất xơ: gạo lứt, khoai, yến mạch, đậu, trái cây',
        'Không ăn carb ngày thường',
        'Chỉ bánh mì trắng',
      ],
      answer: 1,
      explain:
        'Chất xơ làm no lâu và đường máu ổn hơn — carb nhanh để dành cho quanh buổi tập khi cần đầy bình nhẹ bụng.',
    },
  ],
  related: {
    muscles: [],
    exercises: [],
    calculators: ['macro', 'calories', 'tdee'],
    conditions: [],
    evidence: [],
  },
  sources: [
    {
      label: 'ACSM / Academy of Nutrition and Dietetics — Nutrition for exercise position stand',
      url: 'https://www.acsm.org/education-resources/books-and-multimedia-resources',
      license: 'cite-only',
    },
    {
      label: 'Kerksick et al. 2017 — ISSN position stand: nutrient timing',
      url: 'https://doi.org/10.1186/s12970-017-0189-4',
      license: 'CC BY 4.0',
    },
  ],
};
