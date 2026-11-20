/**
 * Sức bền tim mạch: hướng dẫn WHO 2020, Zone 2 và liều vận động.
 *
 * Nguồn: WHO Guidelines on physical activity and sedentary behaviour
 * (2020 — URL đã kiểm chứng), bài Tim mạch & VO2max của app.
 */
export default {
  slug: 'fit-3-1',
  module: 'fit',
  chapter: 3,
  chapterTitle: 'Sức bền tim mạch',
  order: 1,
  title: 'Sức bền tim mạch: liều WHO, nền Zone 2 và một buổi gắt',
  subtitle:
    '150–300 phút vừa/tuần + 2 buổi kháng lực là "toa sức khỏe" toàn dân — phần lớn nên là Zone 2, còn lại là gắt có chủ đích.',
  minutes: 11,
  objectives: [
    'Phát biểu khuyến nghị WHO 2020 cho người lớn: 150–300 phút vừa (hoặc 75–150 mạnh) + kháng lực ≥ 2 ngày/tuần.',
    'Xây nền Zone 2 đúng dấu hiệu (nói trọn câu, HR ổn định) và hiểu vì sao nền đứng trước HIIT.',
    'Đặt 1–2 buổi gắt (ngưỡng/VO2max) khi nền đã có, theo thứ tự ưu tiên 3 tầng.',
    'Chuyển "mục tiêu cardio mơ hồ" thành kế hoạch số: phút/tuần, vùng nào, test nào.',
  ],
  sections: [
    {
      heading: 'Toa sức khỏe của WHO: con số tối thiểu',
      body: `Hướng dẫn WHO 2020 (đã kiểm chứng) cho người lớn tóm lại:

- **Aerobic**: 150–300 phút cường độ vừa **hoặc** 75–150 phút mạnh mỗi tuần (hoặc tổ hợp tương đương).
- **Kháng lực**: các nhóm cơ lớn **≥ 2 ngày/tuần**.
- **Người lớn tuổi**: thêm bài **thăng bằng** ≥ 3 ngày/tuần chống té.
- **Mọi người**: giảm ngồi lâu — bất kỳ vận động nào vẫn tốt hơn không.

Đây là **mặt sàn sức khỏe**, không phải trần vận động viên. Điểm đáng chú ý cho PT: một khách "đi bộ 30 phút sáng" mới đạt ~210 phút/tuần nếu đi cả 7 ngày — đa số khách phổ thông thiếu **một nửa toa**, và phần thiếu thường là kháng lực.`,
    },
    {
      heading: 'Zone 2: nền trước, đỉnh sau',
      body: `Ba tầng cardio đã dựng ở module Sinh lý, giờ xếp thành thứ tự:

1. **Nền Zone 2** (60–70% HRmax — nói trọn câu): chiếm **80%+ thời lượng cardio**; xây SV, mitochondria, hồi phục (bài Thích ứng aerobe).
2. **Ngưỡng** (tempo/4×4 — bài Ngưỡng lactate): nâng tốc độ "gắng được lâu".
3. **Đỉnh** (HIIT ngắn, sprint từng đoạn): thêm khi 1–2 đã có — không thay nền.

Lỗi phổ biến nhất phòng gym: nhảy thẳng vào HIIT "cho hiệu quả" — kết quả là vùng xám Vùng 3 kéo dài (bài Vùng nhịp tim): đủ mệt để hạn hạn khối lượng, không đủ gắt để đẩy ngưỡng. Khách mới nên **4 tuần nền** trước khi thêm tầng gắt.`,
    },
    {
      heading: 'Đặt buổi gắt đúng chỗ',
      body: `Khi nền đã có, 1–2 buổi gắt/tuần là đủ liều cho khách phổ thông:

- **Tempo 20–30 phút** quanh ngưỡng (nói câu ngắn) — buổi "đắt nhất" cho chạy/đạp phổ thông.
- **4×4 phút Vùng 4–5, nghỉ 3–4 phút** — nâng ngưỡng và VO2max (bài VO2max).
- **Sprint từng đoạn** (8–10 × 10–20 giây) — chỉ khi gân và nền có (bài ACWR: spike là thủ phạm).

Quy tắc xếp lịch: buổi gắt **không cạnh** buổi tạ nặng nhất tuần (bài Thích ứng aerobe); buổi trước đó nhẹ hoặc nghỉ. Coi "gắt" là gia vị — nền là bữa chính.`,
    },
    {
      heading: 'Từ mơ hồ sang số: kế hoạch 12 tuần mẫu',
      body: `Khách phổ thông, mục tiêu "sức khỏe + nhẹ người":

- **Tuần 1–4 (nền)**: 3 × 30–40 phút Zone 2 (đi nhanh/đạp) + 2 buổi tạ.
- **Tuần 5–8 (thêm ngưỡng)**: giữ 2–3 nền + 1 tempo 20 phút.
- **Tuần 9–12 (đủ sức)**: giữ nền + 1 buổi 4×4 hoặc sprint đoạn.
- **Đo**: HR nghỉ MA7 mỗi sáng; test 1 dặm đi (bài Battery test) tuần 0 và tuần 12 — hai con số này kể toàn bộ câu chuyện.

Tổng cuối kỳ ~180–240 phút/tuần — nằm gọn trong khung WHO với 2 buổi tạ, và chính là "toa" cụ thể hoá cho một con người thật (bài Ứng dụng sẽ dựng các ca trọn gói).`,
    },
  ],
  applyBox: `**Gian tập thực hành — khoá 12 tuần cho khách "muốn khỏe lại":**
1. Tuần 0: đo HR nghỉ MA7 + test 1 dặm đi + khai hồ sơ trong app (máy tính HR zones).
2. Tuần 1–4: 3 nền × 35 phút nói trọn câu + 2 buổi tạ toàn thân — KHÔNG gắt.
3. Tuần 5–8: giữ nền, thay 1 nền thành tempo 20 phút (HR không nhích sau phút 10).
4. Tuần 9–12: giữ, thêm 1 buổi 4×4 hoặc sprint đoạn; buổi gắt xa buổi chân nặng.
5. Tuần 12: test lại 1 dặm + HR nghỉ — so cùng điều kiện, báo khách bằng hai con số.`,
  terms: [
    {
      en: 'WHO 2020 activity guidelines',
      vi: 'Hướng dẫn WHO 2020',
      def: '150–300 phút vừa hoặc 75–150 mạnh/tuần + kháng lực ≥ 2 ngày — mặt sàn sức khỏe cho người lớn.',
    },
    {
      en: 'Zone 2 base',
      vi: 'Nền Zone 2',
      def: '60–70% HRmax nói trọn câu — tầng chiếm phần lớn thời lượng, nuôi SV/mitochondria và hồi phục.',
    },
    {
      en: 'Threshold session',
      vi: 'Buổi ngưỡng',
      def: 'Tempo/4×4 quanh ngưỡng lactate — tầng "đắt nhất" cho thành tích phổ thông.',
    },
    {
      en: 'Grey zone avoidance',
      vi: 'Tránh vùng xám',
      def: 'Vùng 3 kéo dài: đủ mệt để hạ khối lượng, chưa đủ gắt để đẩy ngưỡng — nhầm lẫn phổ biến của khách mới.',
    },
    {
      en: 'Weekly cardio dose',
      vi: 'Liều cardio tuần',
      def: 'Tổng phút/tuần theo vùng — con số đặt mục tiêu và đọc tiến bộ, thay cho "tập cardio nhiều vào".',
    },
  ],
  images: [],
  quiz: [
    {
      q: 'Khuyến nghị WHO 2020 cho người lớn (aerobic + kháng lực) là gì?',
      choices: [
        '30 phút/tuần là đủ',
        '150–300 phút cường độ vừa (hoặc 75–150 mạnh) + kháng lực ≥ 2 ngày/tuần',
        'Chỉ cần HIIT 2 buổi',
        '500 phút mạnh mỗi tuần',
      ],
      answer: 1,
      explain:
        'Đây là mặt sàn sức khỏe toàn dân; đa số khách phổ thông thiếu một nửa toa — và phần thiếu hay là kháng lực.',
    },
    {
      q: 'Khách mới muốn "cardio hiệu quả" và đòi HIIT ngay tuần 1. Điều chỉnh theo bằng chứng là gì?',
      choices: [
        'Cho HIIT tối đa vì khách muốn',
        '4 tuần nền Zone 2 trước khi thêm tầng gắt — tránh vùng xám và rủi ro spike tải',
        'Cấm cardio vĩnh viễn',
        'Chỉ giãn tĩnh',
      ],
      answer: 1,
      explain:
        'Nền nuôi cả ngưỡng lẫn hồi phục; HIIT sớm thường đẩy khách vào Vùng 3 kéo dài — mệt mà không tiến.',
    },
    {
      q: 'Tỉ lệ thời lượng gợi ý giữa nền Zone 2 và các tầng gắt cho khách phổ thông?',
      choices: [
        '50/50',
        'Nền chiếm phần lớn (~80%+ thời gian cardio), 1–2 buổi gắt/tuần khi đã có nền',
        'Chỉ gắt, không nền',
        'Không có khái niệm tỉ lệ',
      ],
      answer: 1,
      explain:
        'Mô hình phân cực (pyramid-distribution): nền là bữa chính, gắt là gia vị — đúng cách các VĐV bền và khách phổ thông cùng dùng.',
    },
    {
      q: 'Buổi gắt nên xếp lịch thế nào với buổi tạ nặng nhất tuần?',
      choices: [
        'Sát nhau cho quen mệt',
        'Xa nhau (buổi trước nhẹ/nghỉ) — hai loại gắng tranh cùng ngân sách phục hồi',
        'Cùng buổi luôn luôn',
        'Không quan trọng',
      ],
      answer: 1,
      explain:
        'Bài Thích ứng aerobe đã ghép logic này: tách lịch để cả tạ lẫn cardio tiến đều thay vì tranh nhau.',
    },
    {
      q: 'Cặp số nào kể trọn câu chuyện tiến bộ cardio của khách phổ thông?',
      choices: [
        'Cân nặng và vòng bụng',
        'HR nghỉ MA7 (xu hướng) + test 1 dặm đi lại cùng điều kiện',
        'Số like video tập',
        'Số đôi giày đã mua',
      ],
      answer: 1,
      explain:
        'HR nghỉ theo dõi tầng trung ương; test thực địa đo toàn hệ thống — hai con số miễn phí này là báo cáo chuẩn của khoá 12 tuần.',
    },
  ],
  related: {
    muscles: ['soleus', 'quadriceps'],
    exercises: [],
    calculators: ['hr-zones', 'tdee'],
    conditions: ['hypertension'],
    evidence: [],
  },
  sources: [
    {
      label: 'WHO — Guidelines on physical activity and sedentary behaviour (2020, URL đã kiểm chứng)',
      url: 'https://www.who.int/publications/i/item/9789240015128',
      license: 'cite-only (tóm tắt khuyến nghị)',
    },
    {
      label: 'OpenStax Anatomy & Physiology — Cardiac physiology (cite-only)',
      url: 'https://openstax.org/books/anatomy-and-physiology/pages/19-4-cardiac-physiology',
      license: 'CC BY-NC-SA 4.0 (cite-only)',
    },
  ],
};
