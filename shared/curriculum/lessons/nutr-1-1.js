/**
 * Năng lượng & energy balance — nền móng của mọi giao thức dinh dưỡng.
 *
 * Nguồn: Mifflin-St Jeor (cite-only), Helms 2014 (E7, đã kiểm chứng),
 * calculator BMR/TDEE/Calo của PT Brain.
 */
export default {
  slug: 'nutr-1-1',
  module: 'nutr',
  chapter: 1,
  chapterTitle: 'Năng lượng',
  order: 1,
  title: 'Năng lượng và energy balance: con số điều khiển cân nặng',
  subtitle:
    'Calo vào − calo ra quyết định hướng cân nặng; BMR, NEAT, TEF và bài tập là bốn "vòi" bạn biết cách đọc để điều chỉnh.',
  minutes: 12,
  objectives: [
    'Định nghĩa kcal và energy balance; giải thích vì sao mọi giao thức giảm/tăng cân đều quy về cán cân này.',
    'Phân tích TDEE qua 4 thành phần: BMR, NEAT, TEF và vận động (EAT).',
    'Đặt mức calo mục tiêu cho giảm mỡ/tăng cơ/maintain theo % so với TDEE.',
    'Chọn tốc độ thay đổi cân nặng an toàn (0,5–1%/tuần khi giảm) và đọc tín hiệu cần điều chỉnh.',
  ],
  sections: [
    {
      heading: 'Calo là gì, cân nặng về đâu',
      body: `Một **kilocalorie (kcal)** là nhiệt lượng nâng 1 lít nước lên 1 °C; với cơ thể, nó là năng lượng chiết xuất từ thức ăn. Ba macronutrient mang năng lượng: **carb và protein ~4 kcal/g, chất béo ~9 kcal/g**, cồn 7 kcal/g.

**Energy balance** = năng lượng vào − năng lượng ra:

- **Thiếu hụt (deficit)** kéo dài → cơ thể rút kho (mỡ, một phần cơ) → cân giảm.
- **Dư (surplus)** kéo dài → tích trữ → cân tăng.
- **Cân bằng** → cân ổn định.

Mọi "bí kíp" giảm cân đều là cách tạo deficit; mọi "bí kíp" tăng cơ đều là cách tạo surplus khiêm tốn + tập kháng lực. Giao thức nào né nguyên tắc này đều đang đánh lừa một trong hai đầu cán cân.`,
    },
    {
      heading: 'Mở hộp TDEE: 4 vòi năng lượng ra',
      body: `**TDEE** (total daily energy expenditure) gồm:

| Thành phần | Tỉ lệ điển hình | Ghi chú cho PT |
| --- | --- | --- |
| **BMR** — chuyển hoá cơ bản | ~60–70% | Giữ tim, não, thân nhiệt sống; giảm khi giảm cân → TDEE tự hạ |
| **NEAT** — vận động ngoài tập | Biến động lớn nhất | Đi bộ, đứng lên ngồi xuống, cử chỉ tay; khách "hardgainer" thường NEAT cao |
| **TEF** — tiêu hoá thức ăn | ~10% | Protein "đắt" nhất (~20–30% calo của nó để tiêu hoá) |
| **EAT** — vận động tập luyện | Thường 5–15% | Buổi tập 500 kcal hiếm và nhỏ hơn khách tưởng |

Điểm thực hành quan trọng nhất: **NEAT thay đổi âm thầm theo diet** — khi deficit, khách vô tình đi ít hơn, đứng ít hơn; TDEE rơi và deficit "tự biến mất". Đây là lý do theo dõi bước chân/hoạt động quan trọng ngang theo dõi đồ ăn.

PT Brain tính BMR theo **Mifflin-St Jeor** (công thức được ưa chuộng hiện nay cho dân số chung), TDEE = BMR × hệ số hoạt động — đúng hai máy tính trong app.`,
    },
    {
      heading: 'Đặt mức calo mục tiêu',
      body: `Công thức thực hành (máy tính **Mục tiêu calo** trong app tự làm):

- **Giảm mỡ**: TDEE **− 10% đến − 25%**. Mức −10–15% cho khách cần giữ sức mạnh/đấu; −20–25% cho khách mỡ cao, chấp nhận mệt hơn.
- **Tăng cơ (khách mới/trung cấp)**: TDEE **+5% đến +15%** khởi đầu (có thể lên **+10–20%** nếu 3–4 tuần cân phẳng, eo ổn) — "bulking khiêm tốn" hạn chế mỡ tích.
- **Maintain/recomp**: ăn bằng TDEE, ưu tiên protein + tập kháng lực đều.

Sai số của mọi tính toán là **±10–20%** (công thức BMR có sai số, đếm kcal có sai số). Vì vậy con số đầu tiên chỉ là **giả thuyết**: đo kết quả bằng xu hướng cân nặng 2–4 tuần (tab Theo dõi cơ thể có MA7) rồi chỉnh.

Ví dụ: khách nữ 60 kg, TDEE tính ra 2.000 kcal, mục tiêu giảm 10% → 1.800 kcal. Sau 3 tuần MA7 không nhích → không vội hạ 500 kcal; hạ thêm 200–300 kcal hoặc thêm 2.000–3.000 bước/ngày rồi chờ tiếp.`,
    },
    {
      heading: 'Tốc độ an toàn và tín hiệu chỉnh',
      body: `Theo bằng chứng giảm mỡ cho người tập (E7 — Helms 2014): giảm **khoảng 0,5–1% cân nặng/tuần**; người càng gầy càng nên ở cận dưới để giữ cơ. Tín hiệu đang đi đúng:

- Cân giảm đều theo MA7, sức mạnh giữ hoặc giảm ít.
- Ngủ, mood, libido ổn.

Tín hiệu cần chỉnh:

- MA7 phẳng **3 tuần** sau khi đã kiểm tra log ăn, nước/muối và chu kỳ kinh → giảm **200–300 kcal** hoặc tăng **2.000–3.000 bước/ngày**; mỗi lần một biến. Nếu dữ liệu ăn uống thiếu, sửa log trước khi cắt calo.
- Sức mạnh rơi nhanh, ngủ kém, dễ cáu → đang cut quá gắt: ăn 1–2 ngày ở mức maintain (mini-diet break), giảm mức deficit.
- Cân rơi > 1,5%/tuần ở khách gầy → mất cơ nhiều: hạ tốc.

**Refeed/diet break**: 1 ngày/tuần ăn ở maintain (ưu tiên carb) giúp NEAT và mood hồi; theo dõi dài hạn quan trọng hơn "cân một buổi sáng đẹp".`,
    },
    {
      heading: 'Đếm calo trong thực tế mà không phát điên',
      body: `Đếm kcal luôn có sai số — mục tiêu là **đủ chuẩn để ra quyết định**, không phải chuẩn phòng lab:

1. **Khối lượng là vua**: cân thức ăn 2 tuần đầu để "hiệu chuẩn mắt"; sau đó ước lượng đã chính xác hơn nhiều.
2. **Ưu tiên món đơn giản**: nguyên liệu tách rời dễ ước lượng hơn món hầm nước sốt phức tạp.
3. **Dùng module Dinh dưỡng của app**: nhập tay từng món hoặc chụp ảnh để AI ước lượng — xem như con số tham chiếu, không phải phán quyết.
4. **Đọc xu hướng, bỏ qua nhiễu ngày**: nước, muối, glycogen làm cân nhảy ±1 kg mỗi ngày. MA7 mới là con số ra quyết định.
5. **Ăn ngoài** → ước lượng rồi thêm 10–20% "phí nước sốt".`,
    },
  ],
  applyBox: `**Gian tập thực hành — đặt plan năng lượng cho khách mới:**
1. Tính BMR + TDEE bằng máy tính (đúng hồ sơ khách đã nhập trong Cài đặt).
2. Chọn mục tiêu → để máy tính Calo & macro đề xuất mức kcal; protein đặt theo bài Protein (1,6–2,2 g/kg), phần calo còn lại chia carb và chất béo theo sở thích khách.
3. Ghi cân mỗi sáng 5–7 ngày/tuần vào Theo dõi cơ thể; sau 2–3 tuần đọc MA7.
4. Chỉnh từng bước nhỏ (±100–150 kcal hoặc ±2.000 bước) — không "phạt" khách bằng cách cắt một nửa calo.
5. Cứ 6–8 tuần đánh giá: vòng bụng, ảnh tiến độ, sức mạnh — cân chỉ là một trong ba con số.`,
  terms: [
    {
      en: 'Kilocalorie (kcal)',
      vi: 'Kilocalorie',
      def: 'Đơn vị năng lượng thức ăn; carb/protein ~4 kcal/g, chất béo ~9 kcal/g.',
    },
    {
      en: 'BMR',
      vi: 'Chuyển hoá cơ bản',
      def: 'Năng lượng tối thiểu giữ sự sống lúc nghỉ hoàn toàn; chiếm ~60–70% TDEE; PT Brain dùng Mifflin-St Jeor.',
    },
    {
      en: 'TDEE',
      vi: 'Tổng chi tiêu năng lượng/ngày',
      def: 'BMR × hệ số hoạt động cộng thêm vận động; con số "đường cơ sở" để đặt mục tiêu calo.',
    },
    {
      en: 'NEAT',
      vi: 'Vận động ngoài tập luyện',
      def: 'Đi bộ, đứng, việc nhà... — biến số âm thầm thay đổi theo diet và làm bùng TDEE nếu không theo dõi.',
    },
    {
      en: 'TEF',
      vi: 'Chi phí tiêu hoá thức ăn',
      def: '~10% TDEE; protein "đắt" nhất (~20–30% calo của nó bị đốt để tiêu hoá).',
    },
    {
      en: 'Diet break / Refeed',
      vi: 'Nghỉ diet / ngày nạp lại',
      def: '1+ ngày ăn ở mức maintain trong giai đoạn deficit dài để hồi NEAT, mood và adherence.',
    },
  ],
  images: [],
  quiz: [
    {
      q: 'Thành phần nào của TDEE thay đổi âm thầm và phá vỡ deficit khi khách ăn ít?',
      choices: ['BMR tăng vọt', 'NEAT giảm vô thức', 'TEF tăng gấp đôi', 'EAT tự tăng'],
      answer: 1,
      explain:
        'Khi deficit, khách vô tình đi/đứng ít hơn — NEAT rơi làm TDEE hạ, deficit thực nhỏ hơn trên giấy. Theo dõi hoạt động ngang theo dõi đồ ăn.',
    },
    {
      q: 'Khách muốn giảm 10% calo so với TDEE 2.200 kcal. Mục tiêu gần đúng?',
      choices: ['1.400 kcal', '1.980 kcal', '2.500 kcal', '0 kcal'],
      answer: 1,
      explain:
        '2.200 − 10% = 1.980 kcal. Máy tính Mục tiêu calo của PT Brain tự tính mức này theo mục tiêu chọn.',
    },
    {
      q: 'Tốc độ giảm cân an toàn theo E7 (Helms 2014) cho người tập là khoảng?',
      choices: ['0,5–1% cân nặng/tuần', '3–5%/tuần', '1 kg/ngày', 'Không giới hạn nếu khách chịu được'],
      answer: 0,
      explain:
        'Giảm chậm giữ được khối cơ và sức mạnh; người càng gầy càng nên ở cận dưới của khoảng.',
    },
    {
      q: 'TEF của protein cao hơn carb/chất béo nghĩa là gì khi lên plan?',
      choices: [
        'Protein "tốn" ~20–30% calo của nó để tiêu hoá — góp phần nhỏ vào deficit',
        'Protein không có calo',
        'Ăn protein không cần đếm',
        'Carb có TEF cao nhất',
      ],
      answer: 0,
      explain:
        'Protein vừa no vừa có TEF cao — một trong những lý do mọi giao thức giảm mỡ đều ưu tiên nó.',
    },
    {
      q: 'MA7 của khách phẳng 3 tuần dù ăn đúng mức deficit, log ăn đầy đủ. Bước tiếp theo hợp lý?',
      choices: [
        'Cắt một nửa calo ngay',
        'Hạ 200–300 kcal hoặc thêm 2.000–3.000 bước/ngày rồi theo dõi tiếp',
        'Bỏ luôn việc theo dõi',
        'Tăng calo lên 50%',
      ],
      answer: 1,
      explain:
        'Điều chỉnh nhỏ từng bước giữ được adherence và sức mạnh; cắt mạnh thường phản tác dụng vì NEAT lại rơi tiếp.',
    },
    {
      q: 'Sai số của mọi tính toán BMR/TDEE vào khoảng bao nhiêu — và hệ quả thực hành?',
      choices: [
        '±0% — công thức chính xác tuyệt đối',
        '±10–20% — con số đầu chỉ là giả thuyết, phải đối chiếu xu hướng cân 2–4 tuần',
        '±80% — không bao giờ dùng công thức',
        '±5 kcal/ngày',
      ],
      answer: 1,
      explain:
        'Công thức có sai số và việc đếm kcal cũng vậy; "đo — theo dõi — chỉnh" là chu trình đúng, không phải "tính một lần dùng mãi".',
    },
  ],
  related: {
    muscles: [],
    exercises: [],
    calculators: ['bmr', 'tdee', 'calories', 'macro'],
    conditions: [],
    evidence: ['E7'],
  },
  sources: [
    {
      label: 'Mifflin et al. 1990 — Mifflin-St Jeor equation (AJCN)',
      url: 'https://doi.org/10.1093/ajcn/51.2.241',
      license: 'cite-only',
    },
    {
      label: 'Helms et al. 2014 — Giảm mỡ cho người tập (E7, đã kiểm chứng)',
      url: 'https://doi.org/10.1186/1550-2783-11-20',
      license: 'CC BY 4.0',
    },
    {
      label: 'PT Brain — máy tính BMR/TDEE/Calo & macro (Mifflin-St Jeor)',
      url: 'https://openstax.org/books/anatomy-and-physiology/pages/24-1-overview-of-metabolic-reactions',
      license: 'cite-only (tham chiếu chuyển hoá năng lượng)',
    },
  ],
};
