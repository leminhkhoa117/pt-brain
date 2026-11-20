/**
 * Refeed, diet break và reverse diet: công cụ "thở" giữa các giai đoạn.
 *
 * Nguồn: Helms et al. 2014 (E7 — đã kiểm chứng), ACSM/AND position stand
 * (cite-only), bài Năng lượng & Hormone của app.
 */
export default {
  slug: 'nutr-6-3',
  module: 'nutr',
  chapter: 6,
  chapterTitle: 'Chiến lược thay đổi cơ thể',
  order: 3,
  title: 'Refeed, diet break và reverse diet: ba nhịp thở của giảm mỡ dài',
  subtitle:
    'Deficit kéo dài hạ NEAT và làm mòn adherence — ba công cụ này cho phép "lấy hơi" mà không mất toàn bộ tiến độ.',
  minutes: 10,
  objectives: [
    'Phân biệt ba công cụ: refeed 1 ngày, diet break 1–2 tuần, reverse diet khi kết thúc cut.',
    'Nêu 3 tín hiệu cho thấy khách đang cần "lấy hơi" (NEAT rơi, adherence mệt, tín hiệu quá tải).',
    'Thiết kế một ngày refeed đúng: ăn maintain, ưu tiên carb, giữ protein.',
    'Áp reverse diet khi thoát cut: tăng dần 50–100 kcal/tuần về maintain.',
  ],
  sections: [
    {
      heading: 'Vì sao deficit cần "nhịp thở"',
      body: `Deficit càng dài, cơ thể càng "bóp chi tiêu" lặng lẽ: **NEAT rơi** (khách vô tình đi ít hơn), hormone đói lên, mood xuống (bài Năng lượng & Hormone). Kết quả: deficit **trên giấy** vẫn như cũ nhưng deficit **thật** nhỏ dần — MA7 phẳng và adherence chảy máu.

Ba công cụ "lấy hơi" xếp theo độ lớn:

| Công cụ | Độ lớn | Khi nào dùng |
| --- | --- | --- |
| **Refeed** | 1 ngày | Cut dài, mệt nhẹ, cần mốc tâm lý |
| **Diet break** | 5–14 ngày | Cut ≥ 8–10 tuần, mệt rõ, mùa sự kiện |
| **Reverse diet** | Vài tuần | Kết thúc cut, trở về maintain có chủ đích |`,
    },
    {
      heading: 'Refeed 1 ngày: ăn maintain, ưu tiên carb',
      body: `Refeed ≠ cheat day (bài Giảm mỡ thực hành): nó **có cấu trúc** —

- Ăn **bằng TDEE maintain** (không vượt dư).
- Phần calo tăng thêm lấy chủ yếu từ **carb** (bù glycogen, hỗ trợ leptin/mood); giữ protein; giữ fat ổn định.
- Mục tiêu: NEAT và tinh thần "hồi sức" trong 24 giờ mà MA7 chỉ nhích nhẹ.

Cách xếp trong tuần: 1 ngày refeed thường rơi vào ngày tập nặng nhất hoặc ngày khách hay ăn ngoài — trùng nhu cầu xã hội với nhu cầu sinh lý là refeed bền nhất.`,
    },
    {
      heading: 'Diet break 5–14 ngày: về maintain thật',
      body: `Khi mệt tích luỹ (2–3 tín hiệu của bài Hormone: HR nghỉ lên, ngủ xấu, RPE mọi bài tăng), một **tuần ăn maintain** làm ba việc: hồi NEAT, hồi đầu óc, và kiểm chứng "cân mới là maintain thật".

Lưu ý tâm lý quan trọng: khách thường sợ cân **nhảy lên** 0,5–1 kg trong break — nói trước rằng phần lớn là **nước + glycogen** (mỗi gram glycogen giữ ~3 g nước), không phải mỡ hoàn trả. MA7 sau break ổn định ở mức mới là điều mong đợi, không phải thất bại.

Sau break, khách thường cut **hiệu quả hơn** ở lại chu kỳ tiếp: NEAT đã hồi, adherence được sạc.`,
    },
    {
      heading: 'Reverse diet: thoát cut không "nổ" mỡ',
      body: `Vấn đề kinh điển sau cut: appetite và "tự do ăn" dẫn tới nhảy từ deficit −20% thẳng sang dư +20% — cân trả nhanh và tinh thần đổ. Reverse diet xử bằng **bậc thang**:

1. Từ calo cut hiện tại, tăng **+50–100 kcal/tuần** (phần lớn carb) tới chạm mức maintain mới.
2. Giữ protein, giữ tạ; theo dõi MA7 — chấp nhận +0,3–0,5 kg nước đầu tiên, không chấp nhận trend tăng đều hàng tuần.
3. Chạm maintain → giữ 2–4 tuần → rồi mới quyết định hướng tiếp (maintain dài / gaining / cut vòng mới).

Reverse diet là **công cụ hành vi** nhiều hơn "thần dược chuyển hoá" — nó đổi cú nhảy hố thành dốc thoai thoải, và khách học được cách ăn ở mức mới.`,
    },
  ],
  applyBox: `**Gian tập thực hành — cài 3 nhịp vào chu kỳ 12 tuần:**
1. Tuần 1–6: cut sạch, 1 refeed/tuần đặt vào ngày tập chân.
2. Tuần 7: diet break 7 ngày ăn maintain (nói trước về nước/glycogen +0,5 kg).
3. Tuần 8–11: cut tiếp với hiệu suất đã hồi; tuần 12: kết thúc → reverse diet +80 kcal/tuần tới maintain mới.
4. Đọc ba con số mỗi Chủ nhật (MA7, vòng bụng, mood 1–5) — công cụ nào được "kích hoạt" theo tín hiệu, không theo lịch cứng.`,
  terms: [
    {
      en: 'Refeed day',
      vi: 'Ngày refeed',
      def: 'Ăn bằng maintain 1 ngày, ưu tiên carb, giữ protein — hồi NEAT/mood mà không xoá tiến độ.',
    },
    {
      en: 'Diet break',
      vi: 'Nghỉ diet',
      def: '5–14 ngày ăn maintain giữa cut dài: hồi adherence và kiểm chứng mức maintain mới; +0,5–1 kg là nước + glycogen.',
    },
    {
      en: 'Reverse diet',
      vi: 'Reverse diet',
      def: 'Tăng +50–100 kcal/tuần từ mức cut lên maintain — chống cú "nổ" mỡ sau diet bằng bậc thang hành vi.',
    },
    {
      en: 'Glycogen-water weight',
      vi: 'Cân nước glycogen',
      def: 'Mỗi gram glycogen giữ ~3 g nước — lý do cân nhảy khi ăn lại carb, không phải mỡ hoàn trả.',
    },
    {
      en: 'Adherence fatigue',
      vi: 'Mệt tuân thủ',
      def: 'Sự mòn của chế độ ăn kéo dài — ba công cụ refeed/break/reverse là "nhịp thở" chữa đúng loại mệt này.',
    },
  ],
  images: [],
  quiz: [
    {
      q: 'Refeed khác cheat day ở điểm nào?',
      choices: [
        'Giống nhau hoàn toàn',
        'Refeed có cấu trúc: ăn bằng maintain, phần tăng chủ yếu từ carb, giữ protein — không dư năng lượng',
        'Refeed ăn gấp đôi',
        'Refeed chỉ dành cho VĐV',
      ],
      answer: 1,
      explain:
        'Cheat day dư calo tự do (xoá cả tuần deficit); refeed "lấy hơi" có chủ đích — MA7 chỉ nhích nhẹ.',
    },
    {
      q: 'Khách diet break 1 tuần, cân lên 0,8 kg. Diễn giải đúng?',
      choices: [
        'Mỡ hoàn trả ngay lập tức',
        'Phần lớn là nước + glycogen (mỗi g glycogen giữ ~3 g nước) — mong đợi, không phải thất bại',
        'Diet break thất bại',
        'Phải cut lại sâu hơn gấp đôi',
      ],
      answer: 1,
      explain:
        'Nói TRƯỚC cho khách về cú nhảy nước này — không nói thì break biến thành cú sốc tâm lý phản tác dụng.',
    },
    {
      q: 'Ba tín hiệu cho thấy khách cut cần "lấy hơi" là gì?',
      choices: [
        'Ăn ngon, ngủ ngon, tập khoẻ',
        'NEAT rơi (đi ít hẳn), adherence mệt rõ, 2–3 tín hiệu quá tải (HR nghỉ lên, ngủ xấu, RPE tăng)',
        'Cân giảm nhanh',
        'Thích ăn bánh',
      ],
      answer: 1,
      explain:
        'Đây là điểm giao của bài Hormone và bài Năng lượng: khi cơ thể "bóp chi tiêu", công cụ lấy hơi mới là đúng đơn.',
    },
    {
      q: 'Reverse diet thực thi thế nào?',
      choices: [
        'Tăng +500 kcal ngay sau cut',
        'Tăng +50–100 kcal/tuần (phần lớn carb) từ mức cut lên maintain, theo dõi MA7 từng bước',
        'Ăn không kiểm soát rồi cut lại',
        'Giữ mãi calo cut vĩnh viễn',
      ],
      answer: 1,
      explain:
        'Bậc thang nhỏ giữ kiểm soát và học cách ăn ở mức mới — đổi "hố" thành "dốc thoải" về hành vi.',
    },
    {
      q: 'Sau diet break, cut vòng tiếp thường thế nào?',
      choices: [
        'Kém hiệu quả hơn vì "lười đi rồi"',
        'Hiệu quả hơn: NEAT và adherence đã được sạc lại',
        'Không thể cut nữa',
        'Phải đổi toàn bộ giáo án',
      ],
      answer: 1,
      explain:
        'Break không phải lùi bước — nó hồi phần "chất đốt" (NEAT, tinh thần) khiến phần còn lại của chu kỳ chạy được bền.',
    },
  ],
  related: {
    muscles: [],
    exercises: [],
    calculators: ['tdee', 'calories', 'macro'],
    conditions: [],
    evidence: ['E7'],
  },
  sources: [
    {
      label: 'Helms et al. 2014 — Contest preparation (E7, đã kiểm chứng)',
      url: 'https://doi.org/10.1186/1550-2783-11-20',
      license: 'CC BY 4.0',
    },
    {
      label: 'ACSM / Academy of Nutrition and Dietetics — Position stand nutrition',
      url: 'https://www.acsm.org/education-resources/books-and-multimedia-resources',
      license: 'cite-only',
    },
  ],
};
