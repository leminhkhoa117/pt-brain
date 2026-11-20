/**
 * Hormone, quá tải và deload: dấu hiệu cảnh báo trong thực hành.
 *
 * Nguồn: Kreher & Schwartz 2012 (cite-only), Morton et al. (E3 đã kiểm
 * chứng), evidence base E8 (deload) của PT Brain.
 */
export default {
  slug: 'phys-5-2',
  module: 'phys',
  chapter: 5,
  chapterTitle: 'Mệt mỏi & phục hồi',
  order: 2,
  title: 'Hormone và dấu hiệu quá tải: đọc đúng, đừng hóa đơn máu',
  subtitle:
    'Các spike hormone quanh buổi tập không phải "đòn bẩy tăng cơ" như quảng cáo; còn quá tải thì nhìn được bằng mắt — nếu bạn biết đọc 5 tín hiệu.',
  minutes: 11,
  objectives: [
    'Giải thích vì sao các phản ứng hormone cấp (testosterone, cortisol tăng thoáng) không phải động cơ chính của tăng cơ.',
    'Liệt kê 5 tín hiệu quá tải quan sát được: hiệu suất giảm kéo dài, HR nghỉ tăng, ngủ xấu, mood xuống, đau nhức dai dẳng.',
    'Phân biệt quá tải chức năng (định kỳ được) với hội chứng quá tập cần nghỉ dài.',
    'Áp dụng deload đúng bằng chứng (E8): khi nào, giảm bao nhiêu.',
  ],
  sections: [
    {
      heading: 'Bỏ qua "đòn bẩy hormone" trên nhãn supplement',
      body: `Tập nặng làm testosterone, growth hormone, cortisol tăng **thoáng qua** trong máu. Quảng cáo từ đó suy "spike = cơ to" — bằng chứng hiện đại không ủng hộ cách suy này: các spike cấp nhỏ lẻ so với tổng môi trường nội tiết 24 giờ, và các phân tích lớn cho thấy mức tăng tạm thời sau buổi **không phải yếu tố quyết định** phì đại (bài Tăng cơ — quyết định nằm ở cơ học + dinh dưỡng + tích lũy).

Hệ quả thực hành: đừng mua "test booster" vì câu chuyện spike; đừng thiết kế giáo án "maximize hormone" kiểu tập failure mọi set — chi phí mệt lớn hơn lợi ích (E4). Hormone là môi trường, không phải cái chìa: môi trường đó được nuôi tốt nhất bởi **ngủ, calo đủ, stress quản lý được**.`,
    },
    {
      heading: 'Năm tín hiệu quá tải quan sát được',
      body: `Bạn không cần hóa đơn máu để phát hiện khách đang tập quá mức. Năm tín hiệu này quan sát được ngay:

1. **Hiệu suất đi xuống > 1–2 tuần** dù ngủ/ăn ổn: số rep, tạ, tốc độ cardio cùng dạng đều giảm.
2. **HR nghỉ tăng bền** (so trung bình MA7 — tăng > 5–7 bpm giữ nguyên điều kiện đo).
3. **Ngủ xấu mới xuất hiện**: khó vào giấc, đêm tỉnh giấc dù mệt thể chất.
4. **Mood và động lực xuống**: ca mà khách từng hào hứng giờ "lết" vào phòng.
5. **Đau nhức dai dẳng**, vết sưng nhỏ lâu lành, hoặc ốm vặt nối nhau.

Ba tín hiệu đầu xuất hiện **cùng lúc** → nghi ngờ quá tải; kiểm tra nhanh: giảm volume 40–50% một tuần, ngủ bù — nếu chỉ số nhích lại, chẩn đoán đúng hướng.`,
    },
    {
      heading: 'Quá tải chức năng và lúc nào phải dừng hẳn',
      body: `**Overreaching có chủ đích** (functional overreaching): dồn tải 1–2 tuần có kế hoạch rồi giảm — đủ để thích ứng sau khi hồi; đây là công cụ của VĐV có hỗ trợ, không phải chế độ mặc định cho khách phổ thông.

**Hội chứng quá tập**: hiệu suất giảm hàng tuần lễ, tâm sinh lý xuống rõ, và **không hồi phục chỉ bằng vài ngày nghỉ**. Ranh giới với PT: nếu sau 1–2 tuần giảm tải mà năm tín hiệu chưa đỡ, việc của bạn không phải "thêm deload nữa" mà là **nghỉ dài + kiểm tra y tế** (loại trừ giáp, thiếu máu, nhiễm trùng... — bạn không chẩn đoán, chỉ chuyển hướng đúng lúc).`,
    },
    {
      heading: 'Deload đúng bằng chứng (E8)',
      body: `Bằng chứng về deload còn khiêm tốn (E8 đánh giá mức thấp-trung bình), nhưng khuyến nghị thực hành rõ ràng:

- **Khi nào**: sau 4–8 tuần tải tăng liên tục, hoặc khi xuất hiện 2–3 tín hiệu quá tải ở trên.
- **Bao nhiêu**: giảm **40–50% volume** (số set), giữ **cường độ** (tạ) ở mức trung bình — không cần giảm mọi thứ xuống zero.
- **Một tuần là đủ** cho khách phổ thông; kế deload định kỳ chỉ cần khi thấy tín hiệu, không cần "mỗi tuần 4 là deload" máy móc.

Trong app, khi lập giáo án có mục **deload** — hãy dùng nó như phanh có chủ đích: báo trước cho khách "tuần này lót đà cho tuần sau tăng tải", deload không phải thất bại.`,
    },
  ],
  applyBox: `**Gian tập thực hành — bảng theo dõi quá tải 60 giây mỗi sáng:**
1. Khách ghi mỗi sáng: HR nghỉ (hoặc wearables), giờ ngủ, mood 1–5.
2. Cuối mỗi buổi, ghi 1 con số: RPE trung bình của buổi.
3. Mỗi chủ nhật soi 3 đường: HR nghỉ MA7 tăng + ngủ giảm + RPE mọi bài tăng = giảm volume 40–50% tuần sau.
4. Sau tuần giảm tải: đủ 2 tín hiệu đỡ → quay lại kế hoạch; không đỡ → nghỉ dài + hướng khám.`,
  safetyBox:
    'Hormone và "quá tập" là đề tài lớn; PT không chẩn đoán rối loạn nội tiết. Khách có hiệu suất giảm kéo dài kèm sụt cân, rối loạn kinh nguyệt, rụng tóc, ớn lạnh kéo dài: chuyển hướng bác sĩ thay vì tự "deload chữa mọi thứ".',
  terms: [
    {
      en: 'Acute hormonal response',
      vi: 'Phản ứng hormone cấp',
      def: 'Testosterone/GH/cortisol tăng thoáng quanh buổi tập; không phải động cơ chính của phì đại theo bằng chứng hiện đại.',
    },
    {
      en: 'Overreaching',
      vi: 'Quá tải chức năng',
      def: 'Dồn tải 1–2 tuần có chủ đích rồi giảm; chỉ phù hợp với kế hoạch có giám sát, không phải mặc định.',
    },
    {
      en: 'Overtraining syndrome',
      vi: 'Hội chứng quá tập',
      def: 'Hiệu suất + tâm sinh lý giảm hàng tuần và không hồi chỉ bằng vài ngày nghỉ — cần nghỉ dài và kiểm tra y tế.',
    },
    {
      en: 'Deload',
      vi: 'Tuần giảm tải',
      def: 'Giảm 40–50% volume, giữ cường độ vừa, 1 tuần sau chuỗi tăng hoặc khi có tín hiệu quá tải (E8).',
    },
    {
      en: 'Resting HR trend',
      vi: 'Xu hướng HR nghỉ',
      def: 'MA7 HR nghỉ tăng bền > 5–7 bpm là tín hiệu quá tải sớm nhất quan sát miễn phí được.',
    },
  ],
  images: [],
  quiz: [
    {
      q: 'Quảng cáo nói "tập kiểu X làm testosterone vọt lên = cơ to nhanh". Bằng chứng hiện đại nói gì?',
      choices: [
        'Hoàn toàn đúng theo mọi nghiên cứu',
        'Spike hormone cấp nhỏ so với môi trường 24h và không phải yếu tố quyết định phì đại',
        'Chỉ đúng với phụ nữ',
        'Testosterone không liên quan gì tới cơ thể',
      ],
      answer: 1,
      explain:
        'Tăng tạm thời sau buổi không "gánh" kết quả; môi trường nội tiết được nuôi tốt nhất bằng ngủ + calo đủ + stress quản lý được.',
    },
    {
      q: 'Ba tín hiệu cùng xuất hiện: HR nghỉ MA7 tăng, ngủ xấu mới, RPE mọi bài tăng. Bước tiếp theo hợp lý?',
      choices: [
        'Tăng volume để "phá đỉnh"',
        'Giảm volume 40–50% một tuần, ngủ bù, rồi đánh giá lại',
        'Đổi toàn bộ giáo án sang failure mọi set',
        'Bỏ luôn việc theo dõi',
      ],
      answer: 1,
      explain:
        'Bộ ba này là dấu quá tải điển hình; giảm tải một tuần là "thử nghiệm điều trị" rẻ nhất trước khi nghĩ xa hơn.',
    },
    {
      q: 'Sau 2 tuần giảm tải mà tín hiệu chưa đỡ. Việc của PT là gì?',
      choices: [
        'Thêm deload thứ hai, thứ ba vô hạn',
        'Nghỉ dài + chuyển hướng khách đi kiểm tra y tế loại trừ nguyên nhân khác — PT không chẩn đoán nội tiết',
        'Bắt đầu failure training',
        'Khách cần cố gắng hơn',
      ],
      answer: 1,
      explain:
        'Không hồi sau giảm tải hợp lý là ranh giới chuyển hướng: thiếu máu, giáp, nhiễm... cần được loại trừ bởi bác sĩ.',
    },
    {
      q: 'Deload theo khuyến nghị thực hành (E8) giảm như thế nào?',
      choices: [
        'Giảm 40–50% volume, giữ cường độ trung bình, 1 tuần',
        'Nghỉ hoàn toàn 1 tháng',
        'Tăng 20% volume cho quen mệt',
        'Chỉ giảm 1 set mỗi bài là đủ mọi trường hợp',
      ],
      answer: 0,
      explain:
        'Giữ tạ vừa để "nhớ kỹ thuật", cắt volume cho hệ thần kinh và mô mềm hồi; 1 tuần là khung chuẩn cho khách phổ thông.',
    },
    {
      q: 'Vì sao "tuần deload" không phải thất bại trong mắt khách?',
      choices: [
        'Vì nó đúng bằng chứng: là phanh có chủ đích để tuần sau tăng tải — báo trước như một phần kế hoạch',
        'Vì khách được nghỉ không lương',
        'Vì deload là hình phạt',
        'Không có lý do, cứ tập tiếp',
      ],
      answer: 0,
      explain:
        'Đóng khung deload là công cụ lên kế hoạch (app có sẵn mục này khi lập giáo án) — khách hiểu nó là đầu tư, không phải lùi bước.',
    },
  ],
  related: {
    muscles: [],
    exercises: [],
    calculators: [],
    conditions: [],
    evidence: ['E4', 'E8'],
  },
  sources: [
    {
      label: 'Kreher & Schwartz 2012 — Overtraining syndrome (Phys Sportsmed)',
      url: 'https://doi.org/10.3810/psm.2012.05.1962',
      license: 'cite-only',
    },
    {
      label: 'Pancar et al. 2026 — Deload periods (E8, đã kiểm chứng trong evidence base)',
      url: 'https://doi.org/10.1038/s41598-026-40612-5',
      license: 'cite-only',
    },
    {
      label: 'Morton et al. 2018 — Protein & hormonal context (E3, đã kiểm chứng)',
      url: 'https://doi.org/10.1136/bjsports-2017-097608',
      license: 'CC BY 4.0',
    },
  ],
};
