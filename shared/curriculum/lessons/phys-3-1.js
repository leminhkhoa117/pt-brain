/**
 * Tim mạch khi vận động & 5 vùng nhịp tim.
 *
 * Nguồn: ACSM Guidelines (cite-only), Tanaka 2001 (cite-only),
 * calculator hr-zones của PT Brain (Tanaka 208 − 0.7 × tuổi).
 */
export default {
  slug: 'phys-3-1',
  module: 'phys',
  chapter: 3,
  chapterTitle: 'Tim mạch & hô hấp',
  order: 1,
  title: 'Tim mạch khi vận động và 5 vùng nhịp tim',
  subtitle:
    'Nhịp tim tăng theo cường độ — vì sao đó là "đồng hồ đo công suất" rẻ nhất, và cách dùng đúng công thức Tanaka/Karvonen.',
  minutes: 11,
  objectives: [
    'Mô tả phản ứng tim mạch khi vận động: nhịp tim, cung lượng tim, huyết áp và phân bổ máu đến cơ.',
    'Dùng công thức Tanaka (HRmax = 208 − 0,7 × tuổi) và hiểu sai số của mọi công thức ước lượng.',
    'Áp dụng 5 vùng nhịp tim (đúng như máy tính trong PT Brain) để đặt cường độ cardio cho từng mục tiêu.',
    'Phân biệt đo theo %HRmax và theo %HRR (Karvonen) — và khi nào nên chọn cách nào.',
  ],
  sections: [
    {
      heading: 'Chuyện gì xảy ra khi bạn khởi động',
      body: `Trong vài giây đầu của vận động, hệ thần kinh giao cảm "bơm adrenaline": tim đập nhanh hơn, co mạnh hơn; mạch nhỏ ở da và nội tạng co lại, mạch cơ giãn ra; máu dồn về cơ đang làm việc. Tổng hiệu ứng là **cung lượng tim (cardiac output — Q) tăng từ ~5 lên tới 20–25 lít/phút** ở người tập lâu năm.

Ba biến số quyết định Q:

- **HR** (nhịp tim): nhịp nhanh nhất tăng theo tuổi, không theo trình độ tập.
- **SV** (lượng máu mỗi nhát bơm): tăng khi tập aerobe đều đặn — lý do tim người tập lâu năm có HR nghỉ thấp hơn.
- Với khách thường, HR là biến số **duy nhất đo được giá rẻ ngay tại chỗ** — vì vậy nó là "đồng hồ công suất" trong thực hành.

Huyết áp khi vận động: **tâm thu tăng dần theo cường độ** (140–200 mmHg khi gắng hết sức là bình thường), **tâm hở thay đổi ít**. Con số bất thường (tâm thu > 250, tụt, ngất) là tín hiệu dừng ngay.`,
      image: 'phys-3-1-conduction.jpg',
    },
    {
      heading: 'HRmax: công thức và sai số cần nhớ',
      body: `Công thức phổ biến trong app PT Brain (bài **Nhịp tim** của máy tính chỉ số):

- **Tanaka**: HRmax ≈ **208 − 0,7 × tuổi** — chính xác hơn công thức "220 − tuổi" từng phổ cập.
- **Karvonen (%HRR)**: tính theo **trừ HR nghỉ**: bpm mục tiêu = (HRmax − HRnghỉ) × % + HRnghỉ — phản ánh mức "gắng" thực sự tốt hơn cho người HR nghỉ cao/thấp bất thường.

Điều quan trọng hơn công thức: **mọi công thức ước lượng đều có sai số ±10–12 bpm**. Hai khách cùng tuổi có thể có HRmax chênh nhau 15 nhịp. Vì vậy:

1. Dùng công thức làm điểm khởi đầu, không dùng làm "khóa cứng".
2. Nếu khách dùng thiết bị đo HRmax thật (test đồng bộ bước tăng dần), ghi đè công thức — app cho nhập tay maxHr.
3. Khi mô tả cường độ bằng "nói được câu" (talk test) mâu thuẫn với con số bpm, **tin dấu hiệu cơ thể trước, chỉnh vùng sau**.`,
    },
    {
      heading: '5 vùng nhịp tim — đúng như máy tính của bạn',
      body: `PT Brain chia 5 vùng theo %HRmax (Tanaka). Bảng dưới khớp 100% với máy tính **Nhịp tim** trong app — khách 30 tuổi, HRmax ≈ 187:

| Vùng | %HRmax | Cảm giác | Dùng để |
| --- | --- | --- | --- |
| 1 — Rất nhẹ | 50–60% (~94–112) | Đi bộ nhanh, nói thoải mái | Hồi phục, ngày đầu trở lại |
| 2 — Nhẹ | 60–70% (~112–131) | Nói trọn câu được | Xây base aerobic (Zone 2) |
| 3 — Vừa | 70–80% (~131–150) | Nói được câu ngắn | Tim mạch cho sức bền chung |
| 4 — Nặng | 80–90% (~150–168) | Chỉ nói được vài từ | Ngưỡng lactate, hiệp HIIT |
| 5 — Tối đa | 90–100% (~168–187) | Không nói được | Sprint ngắn, đỉnh thi đấu |

Phân bổ thực dụng cho khách phổ thông: đa số thời gian ở **Vùng 2** (nền), 10–20% tổng khối lượng ở **Vùng 4** (kích thích ngưỡng). Cái bẫy phổ biến nhất là "vùng xám" Vùng 3 kéo dài — đủ mệt để hạn chế khối lượng, không đủ gắt để tiến ngưỡng.`,
    },
    {
      heading: 'HR nghỉ và HR hồi phục — hai con số miễn phí',
      body: `**HR nghỉ** đo sáng mới dậy (trước xuống giường): 60–100 bpm bình thường; người tập aerobe lâu năm 40–60. Xu hướng quan trọng hơn con số: HR nghỉ tăng dần cả tuần thường là tín hiệu **hồi phục chưa đủ** (hoặc sắp ốm) — cân nhắc giảm tải.

**HR hồi phục**: sau cữ gắt, đợi 60 giây — HR rơi nhanh (ví dụ > 20–25 bpm trong 1 phút) là dấu hiệu base aerobic tốt. Rơi chậm dần qua các tuần = tín hiệu quá tải (overreaching) — giảm volume hoặc thêm ngày nghỉ.

Hai con số này miễn phí, không cần thiết bị đắt — và thường "nói thật" hơn khách tự đánh giá mức mệt.`,
    },
  ],
  applyBox: `**Gian tập thực hành — phiên cardio 45 phút cho khách phổ thông:**
1. Khởi động 5 phút Vùng 1 tăng dần lên Vùng 2.
2. 30 phút Vùng 2 thật (nói được câu trọn vẹn; nếu khách thở dốc → chậm lại).
3. 5×(1 phút Vùng 4 + 2 phút Vùng 2) — sau khi khách có base ≥ 4 tuần.
4. Hạ nhiệt 5 phút Vùng 1 + kéo nhẹ.
Ghi lại HR nghỉ mỗi sáng trong tab Theo dõi cơ thể; nếu tăng > 5–7 bpm trên trung bình tuần — đổi buổi Vùng 4 thành Vùng 2 trong tuần đó.`,
  safetyBox:
    'Khách có bệnh tim, huyết áp không kiểm soát, hoặc dùng thuốc chặn beta (giữ HR thấp nhân tạo): vùng bpm theo công thức không còn đáng tin — hỏi bác sĩ mức cường độ an toàn và điều chỉnh theo mức RPE (cảm giác gắng) thay vì bpm.',
  terms: [
    {
      en: 'Cardiac output (Q)',
      vi: 'Cung lượng tim',
      def: 'Lít máu tim bơm mỗi phút = HR × SV; tăng từ ~5 lên 20–25 lít/phút khi gắng hết sức.',
    },
    {
      en: 'HRmax — Tanaka formula',
      vi: 'Nhịp tối đa theo Tanaka',
      def: 'HRmax ≈ 208 − 0,7 × tuổi; chính xác hơn "220 − tuổi" nhưng vẫn có sai số ±10–12 bpm.',
    },
    {
      en: 'Karvonen (%HRR)',
      vi: 'Phương pháp Karvonen',
      def: 'Tính bpm mục tiêu theo trừ nhịp nghỉ: (HRmax − HRnghỉ) × % + HRnghỉ — phản ánh mức gắng thực sự.',
    },
    {
      en: 'Stroke volume (SV)',
      vi: 'Lượng máu mỗi nhát bơm',
      def: 'Máu tim tống ra mỗi nhịp; tăng nhờ tập aerobe đều — lý do người tập lâu năm HR nghỉ thấp.',
    },
    {
      en: 'HR recovery',
      vi: 'Nhịp tim hồi phục',
      def: 'Mức HR rơi sau cữ gắt; rơi nhanh là base tốt, rơi chậm dần là tín hiệu quá tải.',
    },
    {
      en: 'Talk test',
      vi: 'Kiểm tra bằng nói',
      def: 'Thang đo cường độ không thiết bị: nói trọn câu = Vùng 2; chỉ nói được vài từ = Vùng 4 trở lên.',
    },
  ],
  images: [
    {
      file: 'phys-3-1-conduction.jpg',
      caption: 'Hệ dẫn truyền tim: nút xoang phát nhịp, lan qua tâm nhĩ xuống nút AV và các nhánh tới tâm thất.',
      source: 'Cypressvine / Wikimedia Commons (dựa trên Gray\u2019s Anatomy)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Cardiac_Conduction_System.jpg',
      license: 'CC BY-SA 4.0',
    },
  ],
  quiz: [
    {
      q: 'Khách 30 tuổi. Theo công thức Tanaka, HRmax ước lượng gần đúng?',
      choices: ['190 bpm', '187 bpm (208 − 0,7 × 30)', '220 bpm', '150 bpm'],
      answer: 1,
      explain:
        'Tanaka: 208 − 0,7 × tuổi. Với 30 tuổi ≈ 187 bpm. Máy tính Nhịp tim của PT Brain dùng đúng công thức này.',
    },
    {
      q: 'Vì sao %HRR (Karvonen) đôi khi phù hợp hơn %HRmax?',
      choices: [
        'Vì Karvonen dễ tính nhẩm hơn',
        'Vì nó trừ HR nghỉ, phản ánh mức gắng thực sự cho người HR nghỉ cao/thấp bất thường',
        'Vì HRmax không thể đo được',
        'Vì %HRR luôn cho vùng thấp hơn an toàn hơn',
      ],
      answer: 1,
      explain:
        'HRR = HRmax − HRnghỉ là "khoảng gắng" của chính khách đó; tính theo HRR sát thực tế hơn khi HR nghỉ lệch chuẩn.',
    },
    {
      q: 'Khách tập cardio nhưng luôn lượn Vùng 3 suốt buổi dài. Vấn đề kiểu gì?',
      choices: [
        'Hoàn hảo — Vùng 3 là vùng tốt nhất cho mọi mục tiêu',
        'Vùng xám: đủ mệt để hạn chế khối lượng, chưa đủ gắt để đẩy ngưỡng — nên tách rõ Vùng 2 hoặc Vùng 4',
        'Chỉ thiếu nước',
        'Nên tăng lên Vùng 5 ngay lập tức',
      ],
      answer: 1,
      explain:
        'Vùng 3 kéo dài là "nỗ lực trung bình vô định hướng": tốt cho sức bền chung của VĐV, nhưng với khách phổ thông nên phân cực — base ở Vùng 2, kích thích ở Vùng 4.',
    },
    {
      q: 'HR nghỉ của khách tăng đều 5 sáng liên tiếp. Hành động hợp lý?',
      choices: [
        'Tăng volume ngay',
        'Coi là dấu hiệu hồi phục chưa đủ/ sắp ốm — giảm hoặc đổi buổi gắt thành nhẹ trong tuần đó',
        'Bỏ qua vì HR nghỉ không liên quan tập',
        'Cắt toàn bộ cardio vĩnh viễn',
      ],
      answer: 1,
      explain:
        'HR nghỉ tăng bền là tín hiệu stress/hồi phục thiếu; giảm tải sớm giúp khách tiến bộ nhanh hơn là "cắn răng" theo lịch cũ.',
    },
    {
      q: 'Huyết áp khi khách gắng hết sức bình thường sẽ thế nào?',
      choices: [
        'Tâm thu và tâm hở đều giảm mạnh',
        'Tâm thu tăng dần theo cường độ (140–200 mmHg là phổ biến), tâm hở thay đổi ít',
        'Không thay đổi',
        'Tâm hở tăng lên 200',
      ],
      answer: 1,
      explain:
        'Tâm thu tăng để đẩy máu tới cơ; giá trị bất thường (vượt 250, tụt đột ngột, ngất) là tín hiệu dừng và kiểm tra y tế.',
    },
    {
      q: 'Khách dùng thuốc chặn beta (làm HR thấp hơn thực). Chỉ dẫn đúng là gì?',
      choices: [
        'Vẫn dùng vùng bpm theo Tanaka',
        'Chuyển sang hướng dẫn theo mức RPE (cảm giác gắng) và hỏi bác sĩ mức an toàn',
        'Tập tới khi khách đạt 220 − tuổi',
        'Bỏ thuốc và tập như bình thường',
      ],
      answer: 1,
      explain:
        'Thuốc chặn beta kìm HR — bpm không còn phản ánh mức gắng; RPE và nói thử là thang đáng tin, kèm xác nhận y tế trước khi tăng tải.',
    },
  ],
  related: {
    muscles: [],
    exercises: [],
    calculators: ['hr-zones', 'tdee'],
    conditions: ['hypertension'],
    evidence: [],
  },
  sources: [
    {
      label: 'ACSM Guidelines for Exercise Testing and Prescription (11th ed.) — HR & RPE',
      url: 'https://www.acsm.org/education-resources/books-and-multimedia-resources',
      license: 'cite-only',
    },
    {
      label: 'Tanaka et al. 2001 — Age-predicted maximal heart rate',
      url: 'https://doi.org/10.1097/00005768-200101000-00012',
      license: 'cite-only',
    },
    {
      label: 'OpenStax Anatomy & Physiology — Cardiac physiology',
      url: 'https://openstax.org/books/anatomy-and-physiology/pages/19-4-cardiac-physiology',
      license: 'CC BY-NC-SA 4.0 (cite-only)',
    },
  ],
};
