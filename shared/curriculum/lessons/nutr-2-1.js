/**
 * Protein cho người tập — nhu cầu, chất lượng và phân bổ.
 *
 * Nguồn: Morton 2018 (BJSM, CC BY), ISSN position stand (Jäger 2017),
 * Schoenfeld & Aragon 2018 (JISSN), evidence base E3 của PT Brain.
 */
export default {
  slug: 'nutr-2-1',
  module: 'nutr',
  chapter: 2,
  chapterTitle: 'Macronutrient',
  order: 1,
  title: 'Protein cho người tập: nhu cầu, chất lượng và phân bổ',
  subtitle:
    'Từ 0,8 g/kg của dân số chung tới 1,6–2,2 g/kg cho người tập — con số nào đến từ đâu và áp dụng thế nào.',
  minutes: 12,
  objectives: [
    'Nêu nhu cầu protein khuyến nghị cho người tập kháng lực và nguồn gốc con số 1,6–2,2 g/kg/ngày.',
    'Giải thích khái niệm tổng hợp protein cơ (MPS) và vì sao phân bổ theo bữa quan trọng hơn "ăn nhiều một bữa".',
    'Đánh giá chất lượng một nguồn protein qua amino acid thiết yếu và hàm lượng leucine.',
    'Tinh chỉnh protein khi khách đang giảm calo để giữ khối cơ.',
  ],
  sections: [
    {
      heading: 'Protein làm gì trong cơ thể',
      body: `Protein không chỉ là "vật liệu xây cơ". Cấu trúc của cơ, gân, da, enzyme, hormone vận chuyển và hệ miễn dịch đều là protein. Cơ thể liên tục **phân giải** protein cũ và **tổng hợp** protein mới — hai quá trình này tạo thành một cán cân liên tục.

Với người tập, mục tiêu dinh dưỡng là để cán cân này nghiêng về phía **tổng hợp protein cơ (muscle protein synthesis — MPS)**. Ba công cụ chính để làm điều đó: (1) tập kháng lực tạo tín hiệu, (2) ăn đủ protein cung ứng nguyên liệu, (3) đủ năng lượng tổng để cơ thể không phải "đốt" protein làm năng lượng.`,
    },
    {
      heading: 'Bao nhiêu là đủ: từ RDA tới con số của người tập',
      body: `Khuyến nghị RDA 0,8 g/kg/ngày dành cho **dân số chung** — mức đủ để không bị thiếu hụt, không phải mức tối ưu cho người tập. Hai tài liệu lớn đưa ra con số cho người tập:

- **Morton và cộng sự (2018)** — meta-analysis 49 nghiên cứu trên BJSM: lợi ích của protein lên khối cơ và sức mạnh đạt điểm gãy quanh **1,6 g/kg/ngày**; khoảng tin cậy trên tới ~2,2 g/kg. Trên mức này, lợi ích thêm rất nhỏ ở người khỏe mạnh (đây là nguồn E3 trong thư viện bằng chứng của PT Brain).
- **ISSN Position Stand (2017)**: khuyến nghị **1,4–2,0 g/kg/ngày** cho người tập xây cơ.

Khoang thực hành cho PT: đa số khách dùng tốt trong **1,6–2,2 g/kg/ngày** (1,4–2,0 là mức tối thiểu theo ISSN; 1,6–2,2 là khoang thực hành rộng hơn cho người tập đều). Khi khách **đang giảm calo sâu**, nhu cầu tăng lên để giữ cơ — Helms 2014 gợi ý người tập gầy, có nền tảng, đang cắt calo dùng tới **2,3–3,1 g/kg khối cơ (FFM)**. Lưu ý đơn vị: 2,5 g/kg *cân nặng* của người 30% mỡ là khác với 2,5 g/kg *khối cơ* của vận động viên 10% mỡ.

Ví dụ nhanh: khách 70 kg, cân nặng ổn định, tập 4 buổi/tuần → 112–154 g protein/ngày.`,
    },
    {
      heading: 'Chất lượng protein: amino acid và leucine',
      body: `20 amino acid tạo nên protein; 9 loại cơ thể **không tự tổng hợp được** (thiết yếu — essential). Nguồn protein **đầy đủ (complete)** chứa đủ 9 loại: thịt, cá, trứng, sữa, đậu nành. Ngũ cốc và đậu đỗ thường thiếu lysine hoặc methionine — ăn kết hợp (cơm + đậu) vẫn bù được.

**Leucine** là amino acid then chốt: khoảng **2,5–3 g leucine mỗi bữa** là tín hiệu "bật" MPS. Whey giàu leucine (~10–12%), nên 25–30 g whey đã đủ ngưỡng; cơ gà 150 g cũng đạt tương đương. Đây là lý do bữa sau tập ~25–40 g protein chất lượng cao là mẫu số chung của mọi hướng dẫn.

| Nguồn | Protein / 100 g | Điểm đáng chú ý |
| --- | --- | --- |
| Ức gà nấu | ~31 g | Đầy đủ, dễ ăn hằng ngày |
| Trứng | ~13 g | Lysine + leucine cao, kèm micronutrient |
| Whey (bột) | ~70–80 g | Hấp thu nhanh, leucine cao |
| Cá hồi | ~25 g | Kèm omega-3 |
| Đậu hũ | ~8–15 g | Đầy đủ, kèm chất xơ |
| Gạo + đậu | ~7 g (kết hợp) | Kết hợp tạo profile đầy đủ |`,
      image: 'nutr-2-1-aminoacid.svg',
    },
    {
      heading: 'Phân bổ trong ngày và "cửa sổ giao thoa"',
      body: `Tổng lượng trong ngày vẫn là yếu tố số một; phân bổ chỉ tối ưu phần còn lại. Nguyên tắc phân bổ từ Schoenfeld & Aragon (2018):

- Chia thành **3–5 bữa**, mỗi bữa khoảng **0,4 g/kg** (4 bữa) hoặc **0,55 g/kg** (3 bữa).
- Khách 70 kg → mỗi bữa ~28 g (4 bữa) hoặc ~38 g (3 bữa).

Về "cửa sổ 30 phút sau tập": nghiên cứu cho thấy cửa sổ thực tế rộng hơn nhiều — một bữa protein **trước hoặc sau tập trong vài tiếng** đều hỗ trợ MPS như nhau, miễn là tổng ngày đủ. Khách tập sáng chưa ăn gì thì bữa sau tập mới quan trọng thật; khách đã ăn bữa đầy đủ 1–2 tiếng trước tập thì không cần vội vàng.

Buổi tối: casein (phô mai tươi, sữa) hấp thu chậm, hay được dùng trước khi ngủ; bằng chứng lợi ích thêm ở người tập vừa phải còn khiêm tốn — giữ nguyên tắc "đủ tổng lượng, chia đều" là đủ.`,
    },
    {
      heading: 'Protein khi giảm mỡ',
      body: `Giảm calo là trạng thái **phân giải tăng**: cơ thể ưu tiên giữ năng lượng hơn là giữ cơ bắp. Protein cao trong deficit làm ba việc:

1. **Giữ khối cơ** khi kết hợp với tập kháng lực — lý do protein chiếm tỷ trọng cao hơn trong mọi giao thức cắt calo nghiêm túc.
2. **No lâu hơn** — protein là macronutrient no nhất, giúp khách bám diet.
3. **Tốn năng lượng tiêu hoá cao hơn** (TEF ~20–30% calo của protein, so với 5–10% carb và 0–3% fat).

Với khách giảm mỡ thông thường: giữ protein ở **nửa trên của khoảng 1,6–2,2 g/kg**. Với khách đã gầy muốn "cắt nét": suy nghĩ theo g/kg FFM (Helms 2014) và theo dõi sức mạnh + vòng cơ thay vì chỉ cân.`,
    },
  ],
  applyBox: `**Áp dụng với khách — checklist buổi tư vấn dinh dưỡng:**
1. Tính target: 1,6–2,2 g/kg cân nặng (nếu béo, cân nhắc theo FFM).
2. Chia bữa: 3–5 bữa × ~0,4 g/kg; gắn vào bữa khách ăn sẵn thay vì thêm bữa mới.
3. Kiểm tra ít nhất 2 nguồn complete/ngày; khách ăn chay thì ghép ngũ cốc + đậu và cân nhắc whey thực vật/đậu nành.
4. Trong deficit: protein nửa trên khoảng + giữ volume tập; theo dõi 1RM/số rep để phát hiện mất cơ.
5. Dùng máy tính **Calo & macro** của PT Brain để set con số cụ thể cho từng khách.`,
  terms: [
    {
      en: 'Muscle protein synthesis (MPS)',
      vi: 'Tổng hợp protein cơ',
      def: 'Quá trình tạo protein cơ mới; được kích thích bởi tập kháng lực và bữa ăn giàu protein.',
    },
    {
      en: 'Leucine',
      vi: 'Leucine',
      def: 'Amino acid thiết yếu đóng vai trò tín hiệu chính để bật MPS; ngưỡng thường nhắc ~2,5–3 g mỗi bữa.',
    },
    {
      en: 'Complete protein',
      vi: 'Protein đầy đủ',
      def: 'Nguồn protein chứa đủ 9 amino acid thiết yếu với tỷ lệ hợp lý: thịt, cá, trứng, sữa, đậu nành.',
    },
    {
      en: 'RDA',
      vi: 'Khuyến nghị dinh dưỡng dân số chung',
      def: 'Mức 0,8 g/kg/ngày đủ để phòng thiếu hụt ở người ít vận động, không phải mức tối ưu cho người tập.',
    },
    {
      en: 'Whey / Casein',
      vi: 'Whey / Casein',
      def: 'Hai protein chính của sữa: whey hấp thu nhanh giàu leucine; casein hấp thu chậm, no lâu.',
    },
    {
      en: 'TEF (thermic effect of food)',
      vi: 'Hiệu ứng sinh nhiệt của thức ăn',
      def: 'Năng lượng tiêu tốn để tiêu hoá chất dinh dưỡng; protein cao nhất (~20–30% calo của nó).',
    },
  ],
  images: [
    {
      file: 'nutr-2-1-aminoacid.svg',
      caption: 'Cấu trúc chung của một amino acid: nhóm amine (−NH₂), nhóm carboxyl (−COOH) và nhóm R quyết định loại amino acid.',
      source: 'YassineMrabet / Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:AminoAcidball.svg',
      license: 'Public domain',
    },
  ],
  quiz: [
    {
      q: 'Meta-analysis của Morton 2018 tìm thấy lợi ích của protein lên khối cơ đạt điểm gãy khoảng bao nhiêu?',
      choices: ['0,8 g/kg/ngày', '1,2 g/kg/ngày', '1,6 g/kg/ngày', '3,0 g/kg/ngày'],
      answer: 2,
      explain:
        'Điểm gãy ~1,6 g/kg/ngày, khoảng tin cậy trên tới ~2,2 g/kg. Trên mức này lợi ích thêm ở người khỏe mạnh rất nhỏ.',
    },
    {
      q: 'RDA 0,8 g/kg/ngày dùng để làm gì?',
      choices: [
        'Mức tối ưu cho vận động viên tập kháng lực',
        'Mức đủ để người ít vận động không bị thiếu hụt',
        'Mốc bắt đầu tăng cơ cho người mới tập',
        'Giới hạn an toàn trên cho thận khỏe',
      ],
      answer: 1,
      explain:
        'RDA là mức phòng thiếu hụt cho dân số chung, không thiết kế cho người tập — nên không dùng nó làm target cho khách phòng gym.',
    },
    {
      q: 'Khách 70 kg ăn 3 bữa chính. Theo Schoenfeld & Aragon 2018, mỗi bữa nên khoảng bao nhiêu protein?',
      choices: ['~10 g', '~38 g (0,55 g/kg)', '~70 g', 'Không quan trọng'],
      answer: 1,
      explain:
        'Với 3 bữa, ~0,55 g/kg/bữa ≈ 38 g cho người 70 kg. Nếu ăn 4 bữa thì ~0,4 g/kg ≈ 28 g/bữa.',
    },
    {
      q: 'Amino acid đóng vai trò "tín hiệu bật" tổng hợp protein cơ là gì?',
      choices: ['Glycine', 'Leucine', 'Alanine', 'Cysteine'],
      answer: 1,
      explain:
        'Leucine (~2,5–3 g mỗi bữa) kích hoạt con đường mTOR, tín hiệu chính để bắt đầu MPS.',
    },
    {
      q: 'Khách gầy có nền tảng đang cắt calo sâu. Điều chỉnh protein thế nào?',
      choices: [
        'Giữ 0,8 g/kg vì đang ăn ít',
        'Hạ protein xuống để nhường calo cho carb',
        'Nâng lên theo g/kg khối cơ (FFM), có thể tới 2,3–3,1 g/kg FFM',
        'Chỉ đắp whey sau buổi tập',
      ],
      answer: 2,
      explain:
        'Trong deficit sâu, người có nền tảng cần protein cao hơn (Helms 2014 gợi ý 2,3–3,1 g/kg FFM) kèm tập kháng lực để giữ cơ.',
    },
    {
      q: '"Cửa sổ giao thoa 30 phút" sau tập — bằng chứng hiện nay nói gì?',
      choices: [
        'Bắt buộc ăn trong đúng 30 phút, không thì mất cơ',
        'Cửa sổ thực tế rộng nhiều: bữa protein trước/sau tập trong vài tiếng đều hỗ trợ MPS nếu tổng ngày đủ',
        'Chỉ đúng với whey, không đúng với thức ăn',
        'Chưa có nghiên cứu nào về chủ đề này',
      ],
      answer: 1,
      explain:
        'Tổng protein trong ngày là yếu tố chính; khoảng vài tiếng quanh buổi tập là đủ, không cần bấm đồng hồ 30 phút.',
    },
  ],
  related: {
    muscles: [],
    exercises: [],
    calculators: ['macro', 'tdee', 'calories'],
    conditions: [],
    evidence: ['E3'],
  },
  sources: [
    {
      label: 'Morton et al. 2018, BJSM — meta-analysis protein & tập kháng lực (E3)',
      url: 'https://doi.org/10.1136/bjsports-2017-097608',
      license: 'CC BY 4.0',
    },
    {
      label: 'Jäger et al. 2017, ISSN Position Stand: protein & exercise',
      url: 'https://doi.org/10.1186/s12970-017-0177-8',
      license: 'CC BY 4.0',
    },
    {
      label: 'Schoenfeld & Aragon 2018, JISSN — phân bổ protein trong ngày',
      url: 'https://doi.org/10.1186/s12970-018-0215-1',
      license: 'CC BY 4.0',
    },
    {
      label: 'Helms et al. 2014, JISSN — dinh dưỡng giảm mỡ cho người tập',
      url: 'https://doi.org/10.1186/1550-2783-11-20',
      license: 'CC BY 4.0',
    },
  ],
};
