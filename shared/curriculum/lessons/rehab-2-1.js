/**
 * Đau lưng dưới & thoát vị đĩa đệm: sự thật trấn an và đường rèn lại lực.
 *
 * Nguồn: Brinjikji et al. 2015 (DOI đã kiểm chứng 10.3174/ajnr.a4173),
 * health conditions `low_back_pain` & `herniated_disc` của PT Brain.
 */
export default {
  slug: 'rehab-2-1',
  module: 'rehab',
  chapter: 2,
  chapterTitle: 'Vùng lưng',
  order: 1,
  title: 'Đau lưng dưới và thoát vị đĩa đệm: MRI không phải bản án',
  subtitle:
    'Người KHÔNG đau cũng đầy thoát vị trên phim — đa số đau lưng cải thiện bằng vận động đúng liều, và PT giữ vai trò giáo dục + rèn lại lực.',
  minutes: 12,
  objectives: [
    'Trình bày phát hiện then chốt: hình ảnh MRI thoát vị rất phổ biến ở người không đau (Brinjikji 2015).',
    'Áp dụng hướng "giữ active" cho khách thoát vị: loại nén–gập–xoay có tải, giữ và rèn lại lực theo tiêu chí.',
    'Dựng thang rèn lại lực lưng: brace → hinge nhẹ → RDL nhẹ → máy/trap bar theo phản ứng 24h.',
    'Nhận biết red flags buộc ngừng và chuyển hướng y tế (bài Khoa học về đau).',
  ],
  sections: [
    {
      heading: 'Sự thật trấn an số một: phim ≠ cơn đau',
      body: `Tổng quan hệ thống nổi tiếng (Brinjikji 2015) soi MRI của người **không hề đau lưng** và tìm thấy đầy "phát hiện": thoát vị đĩa đệm, thoái hoá, lồi đĩa — tỉ lệ **tăng theo tuổi** và ở người lớn tuổi gần như là norm. Nghiên cứu khác ghi nhận nhiều thoát vị **tự nhỏ lại theo thời gian**.

Hệ quả thực hành: một khách cầm phim "thoát vị L4-L5" với nỗi sợ tương đương bản án là một **vấn đề giáo dục trước khi là vấn đề mô**. Câu chuyện "đĩa đệm hỏng rồi, không được cúi nữa" từng khiến hàng triệu người tránh vận động — và tránh vận động làm mọi thứ tệ hơn (bài Khoa học về đau).

Việc của PT không phải đọc phim: là **đặt câu đúng** — "phim nói gì bác sĩ của bạn diễn giải thế nào, và bạn đang đau ra sao khi làm gì?" Rồi cùng bác sĩ/physio giữ khách vận động trong khung an toàn.`,
    },
    {
      heading: 'Giữ active với thoát vị: quy tắc của app đã có sẵn',
      body: `Hướng chung của y học hiện đại: **vận động có kiểm soát là một phần điều trị**, không phải kẻ thù. Điều kiện "herniated_disc" và "low_back_pain" trong PT Brain đã mã hoá quy tắc mà AI/wizard dùng khi lập giáo án:

- **Tránh**: nén dọc cột sống nặng, gập/xoay cột sống có tải — barbell back squat, deadlift tạ đòn, barbell row, good morning... (bài học Vai trò của hơi thở & Cột sống đã giải thích vì sao nén + xoay là tổ hợp xấu).
- **Giữ**: hip hinge nhẹ, máy có tựa, core isometric (plank, dead bug — bài Core), giảm ~30–40% volume các bài trục thân.
- **Dừng và chuyển hướng**: đau lan xuống chân tăng, tê yếu tiến triển, rối loạn tiểu — red flags của bài Khoa học về đau.

Khung này không phải "đời tàn gym" — là giai đoạn tải chọn lọc cho tới khi sức chịu tải trở lại.`,
    },
    {
      heading: 'Rèn lại sức mạnh lưng theo thang tiêu chí',
      body: `Áp khung criteria-based (bài Tiến trình phục hồi) cho vùng lưng:

| Bước | Bài | Cửa bước tiếp |
| --- | --- | --- |
| 1 | Dead bug, bird dog, plank ngắn — brace đúng | 2 buổi liền: đau ≤ 3, 24h sạch |
| 2 | Hinge gậy gỗ (broomstick) không tải | Thanh vẫn "dán" hai điểm lưng |
| 3 | RDL tạ đơn nhẹ / cable pull-through | Đau ≤ 3, không dồn sáng sau |
| 4 | Deadlift máy / trap bar tải vừa | 2 buổi ổn, sức giữ giữa các set tốt |
| 5 | Tự do dần theo mục tiêu khách | Theo phản ứng 24h từng vòng tăng |

Kết hợp **cardio không kích ứng** (đi bộ, đạp xe tay-lên) suốt tiến trình: máu nuôi + giảm fear-avoidance (bài Cột sống & tư thế).`,
    },
    {
      heading: 'Ngôn ngữ làm khách bớt sợ — vì sợ cũng là "tải"',
      body: `Ba câu đáng nói với khách cầm phim thoát vị:

1. *"Phim của người không đau cũng đầy hình như thế này — hình ảnh không quyết định cơn đau của bạn."* (Brinjikji 2015)
2. *"Đĩa đệm không phải 'đĩa mềm dễ tuột' — cột sống của bạn khỏe hơn nhiều so với sự sợ của nó."*
3. *"Việc chúng ta làm là tăng tải từ từ theo phản ứng của cơ thể bạn — có tiêu chí rõ, không đo mò."*

Fear-avoidance (tránh vận động vì sợ) là chất tăng âm lượng của đau (bài Khoa học về đau); mỗi lần bạn cho khách một trải nghiệm vận động an toàn **thành công**, bạn đang hạ âm lượng đó thật.`,
    },
  ],
  applyBox: `**Gian tập thực hành — kế hoạch 6 tuần cho khách thoát vị ổn định (đã duyệt y tế):**
1. Tuần 1–2: core isometric 3 buổi/tuần (dead bug, bird dog, side plank ngắn) + đi bộ 20–30 phút/ngày.
2. Tuần 3–4: thêm hinge gậy gỗ + RDL tạ đơn nhẹ; theo dõi phản ứng 24h sau mỗi buổi (Sổ tay tag "rehab").
3. Tuần 5–6: deadlift máy/trap bar tải vừa theo tiêu chí; cardio giữ đều.
4. Xét mỗi bước bằng cặp: đau ≤ 3 + 24h sạch. Phản ứng xấu → lùi đúng một nấc.
5. Duyệt lại với bác sĩ/physio ở các mốc đổi bước lớn — một cuốn phim chung, hai người đọc.`,
  safetyBox:
    'Thoát vị có red flags (đau lan chân tăng, tê yếu tiến triển, rối loạn tiểu/bàng quang, sốt) là việc của bác sĩ ngay — không phải "tập thêm xem sao". Mọi kế hoạch tải mới với chẩn đoán cột sống nên có duyệt y tế.',
  terms: [
    {
      en: 'Asymptomatic imaging findings',
      vi: 'Phát hiện ảnh ở người không đau',
      def: 'MRI người khỏe không đau cũng phổ biến thoát vị/thoái hoá tăng theo tuổi — hình ảnh không tự kết luận cơn đau (Brinjikji 2015).',
    },
    {
      en: 'Disc herniation',
      vi: 'Thoát vị đĩa đệm',
      def: 'Phần nhân đĩa nhô ra ngoài vòng sợi — thường gặp trên phim; nhiều trường hợp tự nhỏ lại theo thời gian.',
    },
    {
      en: 'Fear-avoidance',
      vi: 'Né tránh vì sợ',
      def: 'Tránh vận động do sợ hư hại — chính là chất khuyếch đại đau; trải nghiệm vận động thành công là "liều" hạ âm lượng.',
    },
    {
      en: 'Flexion–rotation under load',
      vi: 'Gập–xoay thân có tải',
      def: 'Tổ hợp chuyển động cần tránh với cột sống đang tổn thương (quy tắc app tự loại khi khai bệnh nền).',
    },
    {
      en: 'Neutral-spine hinge progression',
      vi: 'Thang hinge giữ lưng trung tính',
      def: 'Chuỗi brace → gậy gỗ → RDL nhẹ → máy/trap bar: rèn lại sức chịu tải lưng theo tiêu chí 24 giờ.',
    },
  ],
  images: [],
  quiz: [
    {
      q: 'Tổng quan Brinjikji 2015 cho thấy điều gì về MRI người KHÔNG đau?',
      choices: [
        'Người không đau không bao giờ có bất thường',
        'Thoát vị/thoái hoá rất phổ biến và tăng theo tuổi — hình ảnh không tự kết luận cơn đau',
        'MRI chỉ đúng với người trên 60',
        'Phim MRI luôn khớp mức đau',
      ],
      answer: 1,
      explain:
        'Đây là nền cho câu chuyện giáo dục: khách cầm phim đầy "phát hiện" cần nghe rằng phim không phải bản án.',
    },
    {
      q: 'Với khách thoát vị ổn định, hướng chung của y học hiện đại là gì?',
      choices: [
        'Nghỉ tuyệt đối tới khi phim sạch',
        'Giữ vận động có kiểm soát như một phần điều trị — loại nén-gập-xoay có tải, rèn lại lực theo tiêu chí',
        'Chỉ tập tay, không bao giờ đụng lưng nữa',
        'Phẫu thuật sớm cho mọi trường hợp',
      ],
      answer: 1,
      explain:
        'Quy tắc `herniated_disc` của app chính là hoá thân của hướng này: loại bài rủi ro, giữ core isometric và hinge nhẹ, giảm volume trục thân.',
    },
    {
      q: 'Bước 3 trong thang rèn lại lực lưng thường là gì?',
      choices: [
        'Deadlift tạ đòn tối đa',
        'RDL tạ đơn nhẹ / cable pull-through sau khi hinge gậy gỗ đã "dán" đúng hình lưng',
        'Sit-up 100 rep',
        'Người sóng tư thế tối đa',
      ],
      answer: 1,
      explain:
        'Thang tăng theo phản ứng: isometric → hinge không tải → hinge nhẹ có tải → máy/trap bar; mỗi cửa mở bằng tiêu chí, không bằng cảm hứng.',
    },
    {
      q: 'Red flag nào với khách thoát vị đòi hỏi chuyển hướng NGAY?',
      choices: [
        'Mỏi lưng sau buổi tập',
        'Đau lan xuống chân tăng dần, tê yếu tiến triển, hoặc rối loạn tiểu/bàng quang',
        'Cứng lưng buổi sáng thoáng qua',
        'Khéo khéo khi xoay người',
      ],
      answer: 1,
      explain:
        'Bộ ba này nằm trong bảng red flags của bài Khoa học về đau — dừng tăng tải và khám, không "tập thêm xem sao".',
    },
    {
      q: 'Vì sao nói "sợ cũng là tải" với khách đau lưng?',
      choices: [
        'Vì sợ giúp tập nặng hơn',
        'Fear-avoidance khuyếch đại trải nghiệm đau và gây né vận động — mỗi lần vận động an toàn thành công là một liều hạ âm lượng',
        'Vì sợ đốt calo',
        'Không có lý do',
      ],
      answer: 1,
      explain:
        'Mô hình sinh-tâm-xã: niềm tin và trải nghiệm đổi "âm lượng báo động" — vai trò giáo dục của PT ở đây là y học thật.',
    },
  ],
  related: {
    muscles: ['erector-spinae', 'multifidus', 'rectus-abdominis', 'transversus-abdominis'],
    exercises: ['plank', 'side-plank', 'romanian-deadlift', 'seated-cable-row', 'cable-pull-through'],
    calculators: [],
    conditions: ['low_back_pain', 'herniated_disc'],
    evidence: [],
  },
  sources: [
    {
      label: 'Brinjikji et al. 2015 — Imaging features of spinal degeneration in asymptomatic populations (DOI đã kiểm chứng)',
      url: 'https://doi.org/10.3174/ajnr.a4173',
      license: 'cite-only',
    },
    {
      label: 'Dubois & Esculier 2020 — PEACE & LOVE (DOI đã kiểm chứng)',
      url: 'https://doi.org/10.1136/bjsports-2019-101253',
      license: 'cite-only',
    },
    {
      label: 'OpenStax Anatomy & Physiology — The vertebral column (cite-only)',
      url: 'https://openstax.org/books/anatomy-and-physiology/pages/7-3-the-vertebral-column',
      license: 'CC BY-NC-SA 4.0 (cite-only)',
    },
  ],
};
