/**
 * Tiến trình phục hồi & return-to-play: điều khiển bằng tiêu chí.
 *
 * Nguồn: Dubois & Esculier 2020 (PEACE & LOVE — DOI đã kiểm chứng),
 * ACSM Guidelines (cite-only), bài Lành thương & Khoa học về đau của app.
 */
export default {
  slug: 'rehab-1-2',
  module: 'rehab',
  chapter: 1,
  chapterTitle: 'Nguyên tắc phục hồi',
  order: 2,
  title: 'Tiến trình phục hồi theo tiêu chí: bỏ lịch cứng, dùng "cửa nữa"',
  subtitle:
    '"Bao lâu thì khỏi?" là câu sai — đúng là "tiêu chí nào mở cửa bước tiếp": đau cho phép, phản ứng 24 giờ, và một biến số tăng mỗi lần.',
  minutes: 11,
  objectives: [
    'Thay tư duy "ngày-cứng" bằng tiến trình theo tiêu chí (criteria-based) cho mọi ca phục hồi.',
    'Vận hành thang theo dõi đau đơn giản: ≤ 3/10, ổn trong buổi, không dồn 24 giờ.',
    'Áp dụng luật "một biến số mỗi lần" khi tăng tải: tải, volume, tốc độ, độ phức tạp.',
    'Xác định vai trò phối hợp PT – physio trong cùng một kế hoạch khách.',
  ],
  sections: [
    {
      heading: 'Vì sao lịch cứng hay sai',
      body: `Hai khách cùng "bong gân nhẹ cổ chân" có thể cần số tuần khác nhau tới vài lần — khác tuổi, khác nền lực, khác công việc đứng/đi, khác mức sợ vận động. Kế hoạch "tuần 3 được chạy" viết sẵn từ ngày 1 là predicts-by-magic, không phải y học.

**Tiêu chí (criteria)** giải quyết vấn đề này: mỗi bước lên có "cửa" riêng — khi khách chạm đủ điều kiện, cửa mở; chưa chạm, cửa đóng thêm chút nữa không sao. Tiến độ do **dữ liệu của chính khách** quyết định, không phải ngày trên lịch.

Nền của khung này đã dựng ở bài PEACE & LOVE: mô lành theo mốc sinh học (floor), còn **chức năng** lên theo tín hiệu tải (driver).`,
    },
    {
      heading: 'Thang theo dõi đau: bản duy nhất cần',
      body: `Đơn giản hóa từ các mô hình theo dõi đau trong y học thể thao cho PT dùng hàng ngày:

| Tín hiệu | Đọc | Hành động |
| --- | --- | --- |
| Đau TRONG buổi ≤ 3/10, không leo dần | Cho phép | Giữ nguyên hoặc +1 bước khi 2 buổi liền ổn |
| Đau sau buổi nhích rồi về trong 24h | Phản ứng nhẹ | Giữ nguyên bước, theo dõi tiếp |
| Đau dồn sáng hôm sau / leo qua 24h | Vượt tải | Lùi 1 nấc (giảm 20–30% tải hoặc 1 cấp) |
| Đau đêm, sưng, nóng đỏ tăng | Red flag | Dừng tăng tải — phối hợp physio/bác sĩ (bài Red flags) |

Điểm mấu chốt: đo bằng **phản ứng 24 giờ**, không đo bằng "đau thoáng lúc làm" — một chút khó chịu khi vận động sau tổn thương là bình thường, còn phản ứng dồn hôm sau mới là ngôn ngữ của mô.`,
    },
    {
      heading: 'Thang bước tải và luật một biến số',
      body: `Chuỗi tải mẫu cho phần mềm (tùy vùng mà tên bài đổi, thứ tự giữ nguyên):

1. **Isometric nhẹ** (co giữ không biên độ): wake up mô, giảm sợ, ít kích ứng.
2. **Isometric nặng dần** (tăng thời gian giữ/tải).
3. **Eccentric chậm** (hạ có kiểm soát 3 giây — phần "việc nhà" của gân).
4. **Concentric + tải toàn biên độ** (đẩy lên và hạ đều).
5. **Tốc độ** (nhanh dần, rồi nhảy/sprint khi vùng đã có nền).
6. **Đa hướng + hoàn cảnh thật** (đổi hướng, bền, quay lại môn).

Luật **một biến số mỗi lần**: chỉ tăng tải HOẶC volume HOẶC tốc độ — tăng cả ba cùng lúc thì khi phản ứng xấu, bạn không biết thủ phạm. Mỗi bước giữ 2–4 buổi trước khi xét cửa tiếp.`,
    },
    {
      heading: 'PT và physio: hai vai trong cùng một kế hoạch',
      body: `Phân công gọn và không chồng chéo:

- **Physio/bác sĩ**: đánh giá chẩn đoán, điều trị vùng tổn thương, điều chỉnh giao thức vùng đó.
- **PT (bạn)**: giữ phần còn lại của khách mạnh (tay/lưng/không tổn thương), ghép bài vùng đó vào giáo án tổng, giáo dục vận động, theo dõi phản ứng 24h giữa các buổi hẹn.

Ba câu phối hợp cần thống nhất ngay: *giao thức vùng đang ở bước mấy? — mức đau cho phép là bao nhiêu? — ai đọc tín hiệu nào thì báo ai?* Ghi ba câu trả lời vào Sổ tay tag "rehab" của khách — mọi thay đổi có dấu vết.`,
    },
  ],
  applyBox: `**Gian tập thực hành — chạy "cuốn tiến trình" cho một khách đang phục hồi:**
1. Lập bảng 3 cột: buổi — mức đau trong/sau — phản ứng 24h (0–10). Khách tự ghi, bạn đọc cuối buổi.
2. Mỗi buổi chỉ MỘT thay đổi từ menu: +tải, +rep, +tốc độ, +độ phức tạp.
3. Cửa +1 bước mở khi: 2 buổi liên tiếp đau ≤ 3/10 và 24h sạch.
4. Cửa đóng khi phản ứng dồn: lùi đúng 1 nấc, không lùi về zero.
5. Mỗi 2 tuần gửi 5 dòng cập nhật cho physio — hai bên luôn nhìn cùng một cuốn phim.`,
  terms: [
    {
      en: 'Criteria-based progression',
      vi: 'Tiến trình theo tiêu chí',
      def: 'Mỗi bước tăng tải có "cửa" riêng: đau cho phép + phản ứng 24h sạch — thay cho lịch ngày cứng.',
    },
    {
      en: 'Pain monitoring (24h rule)',
      vi: 'Theo dõi đau (quy tắc 24 giờ)',
      def: 'Đau cho phép ≤ 3/10 trong buổi, không dồn sáng hôm sau — đo phản ứng chậm hơn đo đau tức thì.',
    },
    {
      en: 'One-variable rule',
      vi: 'Luật một biến số',
      def: 'Mỗi lần tăng chỉ đổi MỘT thứ (tải/volume/tốc độ/độ phức tạp) để tìm đúng thủ phạm nếu phản ứng xấu.',
    },
    {
      en: 'Isometric → eccentric loading',
      vi: 'Tải isometric → eccentric',
      def: 'Chuỗi mở màn phục hồi: co giữ đánh thức mô, sau đó hạ chậm có tải là "việc nhà" của gân.',
    },
    {
      en: 'PT–physio handoff',
      vi: 'Bàn giao PT–physio',
      def: 'Physio điều trị vùng; PT giữ phần thân còn mạnh + giáo dục + theo dõi 24h — ba câu thống nhất từ đầu.',
    },
  ],
  images: [],
  quiz: [
    {
      q: 'Vì sao kế hoạch "tuần 3 được chạy lại" viết từ ngày 1 dễ sai?',
      choices: [
        'Vì bác sĩ không bao giờ cho chạy',
        'Vì tiến độ phục hồi phụ thuộc cá nhân khách — tiêu chí của chính khách quyết định cửa mở, không phải ngày lịch',
        'Vì chạy không tốt cho ai',
        'Vì khách quên lịch',
      ],
      answer: 1,
      explain:
        'Criteria-based thay predicts-by-magic: dữ liệu (đau, phản ứng 24h, chức năng) mở từng bước, dù nhanh hơn hay chậm hơn lịch dự kiến.',
    },
    {
      q: 'Tín hiệu nào cho phép mở cửa bước tiếp theo?',
      choices: [
        'Khách nói "khỏi rồi đó"',
        '2 buổi liên tiếp đau ≤ 3/10 và phản ứng 24 giờ sạch',
        'Đau trong buổi 7/10 nhưng khách chịu được',
        'Hết sưng là được',
      ],
      answer: 1,
      explain:
        'Một buổi đẹp chưa đủ — cần sự ổn định liên tiếp: đau cho phép + không dồn hôm sau là cặp tín hiệu tin được.',
    },
    {
      q: 'Khách báo đau dồn sáng hôm sau khi tăng tạ. Hành động đúng?',
      choices: [
        'Tăng tiếp để "vượt cửa"',
        'Lùi đúng MỘT nấc (giảm 20–30% hoặc 1 cấp) — không lùi về zero',
        'Nghỉ tuyệt đối 2 tuần',
        'Đổi hẳn môn thể thao',
      ],
      answer: 1,
      explain:
        'Phản ứng 24h là ngôn ngữ của mô: lùi một nấc giữ tiến trình đã xây, về zero là mất thích ứng và làm lại từ đầu.',
    },
    {
      q: 'Luật "một biến số mỗi lần" tồn tại vì lý do gì?',
      choices: [
        'Để khách chán từ từ',
        'Tăng cả tải + volume + tốc độ cùng lúc thì phản ứng xấu không rõ thủ phạm — không học được gì',
        'Vì thiết bị gym giới hạn',
        'Không có lý do cụ thể',
      ],
      answer: 1,
      explain:
        'Phục hồi là thí nghiệm n=1: mỗi thay đổi phải đo được tác dụng riêng để biết bước nào có công, bước nào chưa.',
    },
    {
      q: 'Phân công đúng giữa PT và physio trong cùng kế hoạch khách?',
      choices: [
        'PT thay thế physio để khách tiết kiệm',
        'Physio điều trị vùng + giao thức; PT giữ phần thân còn mạnh, ghép vào giáo án tổng và theo dõi 24h',
        'Hai bên tự làm, không cần trao đổi',
        'PT chỉ làm massage',
      ],
      answer: 1,
      explain:
        'Hai vai không chồng chéo: khách giữ được toàn diện (không mất lực phần còn lại) và vùng tổn thương có người chuyên trách.',
    },
  ],
  related: {
    muscles: ['multifidus', 'gluteus-medius', 'gastrocnemius'],
    exercises: ['plank', 'side-plank', 'copenhagen-plank', 'nordic-curl', 'seated-calf-raise'],
    calculators: [],
    conditions: ['low_back_pain', 'shoulder_pain', 'knee_pain'],
    evidence: [],
  },
  sources: [
    {
      label: 'Dubois & Esculier 2020 — PEACE & LOVE (BJSM, DOI đã kiểm chứng 10.1136/bjsports-2019-101253)',
      url: 'https://doi.org/10.1136/bjsports-2019-101253',
      license: 'cite-only',
    },
    {
      label: "ACSM's Guidelines for Exercise Testing and Prescription — return to activity",
      url: 'https://www.acsm.org/education-resources/books-and-multimedia-resources',
      license: 'cite-only',
    },
  ],
};
