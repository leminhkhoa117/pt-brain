/**
 * Đọc kết quả assessment & chuyển thành mục tiêu giáo án.
 *
 * Nguồn: ACSM Guidelines (cite-only), bài Battery test & 10 yếu tố thể chất
 * của app, khung SMART goals.
 */
export default {
  slug: 'fit-6-2',
  module: 'fit',
  chapter: 6,
  chapterTitle: 'Đánh giá thể chất',
  order: 2,
  title: 'Từ assessment tới giáo án: đọc số, đặt mục tiêu SMART, chọn một ưu tiên',
  subtitle:
    'Bộ test chỉ đáng giá khi số biến thành quyết định: yếu nhất thành ưu tiên, mục tiêu SMART thành kế hoạch 8 tuần, re-test thành báo cáo.',
  minutes: 11,
  objectives: [
    'Đọc bảng kết quả battery test theo trục: yếu nhất – liên quan mục tiêu – có thể cải thiện nhanh.',
    'Chuyển mỗi mục tiêu thành SMART: con số + thời hạn + test đo lại nào.',
    'Chọn MỘT ưu tiên chính mỗi chu kỳ 6–8 tuần thay vì "cải thiện mọi thứ".',
    'Đóng vòng bằng re-test cùng điều kiện và báo cáo khách bằng 3 con số.',
  ],
  sections: [
    {
      heading: 'Ba câu đọc kết quả assessment',
      body: `Sau battery test (bài Battery test) với 5 con số: push-up, plank, sit-and-reach, dặm + HR, vòng bụng — hỏi đúng thứ tự:

1. **Cái nào yếu nhất so với chính mục tiêu khách?** "Yếu nhất" không phải so với VĐV — so với việc khách muốn làm (leo núi cuối năm, theo con chạy bộ, không đau lưng khi làm việc).
2. **Cái nào liên quan nhất mục tiêu?** Khách muốn chạy 5 km → dặm/HR quyết định; muốn mặc đồ đẹp → vòng bụng + push-up quan trọng hơn sit-and-reach.
3. **Cái nào sẽ nhích nhanh nhất với ít phí?** Mục tiêu "điểm mượt" tạo động lực sớm — phù hợp cho khách mới.

Câu trả lời cho **một ưu tiên chính** — giáo án là cái balô thời gian: một ưu tiên làm được đều đặn thắng năm ưu tiên bỏ dở.`,
    },
    {
      heading: 'SMART: mục tiêu có thể chấm điểm',
      body: `Mục tiêu mơ hồ ("khỏe hơn", "săn chắc") không điều khiển được giáo án. Mục tiêu SMART biến thành lịch:

| Mục tiêu mơ hồ | Phiên bản SMART |
| --- | --- |
| "Nâng sức bền" | Push-up từ 8 → 15 rep form chuẩn trong 8 tuần (test lại cùng điều kiện) |
| "Cardio tốt hơn" | Dặm đi từ 15:30 → 14:00, HR đích 145 → 135, trong 12 tuần |
| "Giảm bụng" | Vòng bụng −4 cm và MA7 −2 kg trong 12 tuần, giữ được 1RM |
| "Không té" | Đứng một chân từ 10 giây → 30 giây mỗi bên trong 8 tuần |

Mỗi dòng đều có **con số + thời hạn + test đo lại** — ba thứ này là hợp đồng giữa bạn và khách.`,
    },
    {
      heading: 'Bản dịch sang 8 tuần giáo án',
      body: `Ví dụ ghép đầy đủ: khách nữ 34, mục tiêu SMART = push-up 8 → 15 + dặm 16:00 → 14:30, 12 tuần.

- **Ưu tiên 1 (sức bền cơ trên)**: full body 3 buổi/tuần, mỗi buổi kết push-up tập theo nấc (bậc nghiêng → chuẩn → tăng rep).
- **Ưu tiên 2 (cardio nền)**: 2 × Zone 2 35 phút + 1 tempo khi đã có 4 tuần nền.
- **Giữ ổn định**: leg strength 2 buổi/tuần (squat/step-up) — chân không phải ưu tiên nhưng không được bỏ.
- **Không thêm** block thứ năm dù khách hào hứng — thêm khi ưu tiên 1 đạt.

Đây chính là logic wizard của app: volume theo mục tiêu, thanh so với 10–20 set, cảnh báo thiếu/cân bằng — bạn chỉ việc **dịch bảng assessment vào đúng các ô đó** (bài Ứng dụng sẽ làm trọn ca trọn gói).`,
    },
    {
      heading: 'Đóng vòng: re-test là sản phẩm của PT',
      body: `Re-test cùng điều kiện (ngày/tươi/bàn tập — bài Battery test) sau 6–8 tuần, và báo cáo khách bằng **ba con số**:

1. Con số mục tiêu trước → sau (push-up 8 → 14).
2. Con số không mục tiêu nhưng có liên quan (HR đích dặm −10 bpm).
3. Con số hành vi (số buổi hoàn thành/tuần).

Ba dòng này là cuộc họp kết quả 60 giây mà khách hiểu ngay — và là thứ giữ khách ở lại: **khách không mua bài tập, khách mua bằng chứng tiến bộ.**`,
    },
  ],
  applyBox: `**Gian tập thực hành — phiên "đọc assessment" 20 phút với khách mới:**
1. Đặt 5 con số battery xuống bàn, đọc theo 3 câu (yếu nhất → liên quan mục tiêu → nhích nhanh).
2. Chọn MỘT ưu tiên chính + viết mục tiêu SMART đầy đủ (con số + 8–12 tuần + test lại).
3. Mở wizard giáo án của app: đặt volume ưu tiên vào giữa khung, các nhóm khác giữ mức ổn.
4. Đặt lịch re-test ngay hôm nay (kèm lời nhắc); hẹn "cuộc họp 3 con số" ở tuần 8.`,
  terms: [
    {
      en: 'Assessment triage',
      vi: 'Sàng lọc kết quả assessment',
      def: 'Ba câu: yếu nhất – liên quan mục tiêu nhất – nhích nhanh nhất → chọn MỘT ưu tiên mỗi chu kỳ.',
    },
    {
      en: 'SMART goal',
      vi: 'Mục tiêu SMART',
      def: 'Con số + thời hạn + test đo lại — hợp đồng chấm điểm được giữa PT và khách.',
    },
    {
      en: 'Priority budgeting',
      vi: 'Ngân sách ưu tiên',
      def: 'Giáo án là balô thời gian: một ưu tiên làm đều thắng năm ưu tiên bỏ dở.',
    },
    {
      en: 'Retest report (3 numbers)',
      vi: 'Báo cáo re-test (3 con số)',
      def: 'Mục tiêu trước–sau + chỉ số liên quan + hành vi hoàn thành — cuộc họp kết quả 60 giây khách hiểu ngay.',
    },
    {
      en: 'Behavior metric',
      vi: 'Chỉ số hành vi',
      def: 'Số buổi hoàn thành/tuần — con số thứ ba của báo cáo, phản ánh adherence thật.',
    },
  ],
  images: [],
  quiz: [
    {
      q: 'Sau battery test, thứ tự ba câu đọc kết quả đúng là gì?',
      choices: [
        'So với VĐV → chê trách khách → bỏ qua mục tiêu',
        'Yếu nhất (so mục tiêu khách) → liên quan mục tiêu nhất → nhích nhanh nhất với ít phí',
        'Chọn hết năm thứ để "cải thiện toàn diện"',
        'Chỉ nhìn cân nặng',
      ],
      answer: 1,
      explain:
        'Ba câu lọc từ năm con số xuống MỘT ưu tiên — so với chính mục tiêu của khách, không phải với bảng VĐV.',
    },
    {
      q: '"Nâng sức bền" viết thành SMART hợp lệ là gì?',
      choices: [
        'Nâng sức bền thật nhiều năm nay',
        'Push-up 8 → 15 rep form chuẩn trong 8 tuần, test lại cùng điều kiện',
        'Cảm thấy khỏe hơn',
        'Tập đều... bao giờ cũng được',
      ],
      answer: 1,
      explain:
        'SMART cần con số + thời hạn + cách đo lại — ba thứ đó biến mục tiêu thành lịch và thành hợp đồng chấm điểm.',
    },
    {
      q: 'Vì sao chỉ MỘT ưu tiên chính mỗi chu kỳ?',
      choices: [
        'Vì khách lười',
        'Giáo án là balô thời gian: một ưu tiên làm đều đặn thắng năm ưu tiên bỏ dở giữa chừng',
        'Vì app giới hạn số bài',
        'Không có lý do',
      ],
      answer: 1,
      explain:
        'Adherence là biến số quyết định kết quả thật — chọn ít làm trọn, thêm ưu tiên khi ưu tiên trước đã đạt.',
    },
    {
      q: 'Báo cáo re-test "3 con số" gồm những gì?',
      choices: [
        'Cân, chiều cao, tuổi',
        'Mục tiêu trước–sau + chỉ số liên quan (HR, vòng...) + hành vi (buổi hoàn thành/tuần)',
        'Số tạ đã mua + số giày + số găng',
        'Chỉ con số mục tiêu',
      ],
      answer: 1,
      explain:
        'Ba dòng kể trọn câu chuyện: kết quả + cơ chế + sự bền của hành vi — cuộc họp 60 giây giữ khách bằng bằng chứng.',
    },
    {
      q: 'Khách hào hứng đòi thêm block thứ năm ngay tuần 2. Câu trả lời đúng hướng là gì?',
      choices: [
        'Thêm ngay vì khách muốn',
        'Giữ khung: thêm khi ưu tiên 1 đạt — giáo án vội vàng đầy là giáo án đầu tuần bỏ',
        'Cấm mọi thứ khác vĩnh viễn',
        'Đổi hết mục tiêu',
      ],
      answer: 1,
      explain:
        'Hào hứng tuần 2 là nhiên liệu quý — dùng nó để hoàn thành ưu tiên 1, mở rộng khi có bằng chứng xử lý được tải.',
    },
  ],
  related: {
    muscles: [],
    exercises: ['push-up', 'plank', 'walking-lunge'],
    calculators: ['one-rm', 'hr-zones', 'navy-body-fat'],
    conditions: [],
    evidence: ['E6'],
  },
  sources: [
    {
      label: "ACSM's Guidelines — Fitness assessment & goal setting (cite-only)",
      url: 'https://www.acsm.org/education-resources/books-and-multimedia-resources',
      license: 'cite-only',
    },
    {
      label: 'McLeod et al. 2024 — Umbrella review prescription (E6, cá nhân hoá — đã kiểm chứng)',
      url: 'https://doi.org/10.1016/j.jshs.2023.06.005',
      license: 'CC BY-NC-ND (cite-only)',
    },
  ],
};
