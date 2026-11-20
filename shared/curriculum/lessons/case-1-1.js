/**
 * Quy trình cá nhân hoá 6 bước: từ buổi đầu tới re-test.
 *
 * Bài khung của module Ứng dụng — tổng hợp toàn bộ giáo trình: các nguồn
 * được cite đều đã kiểm chứng ở các module trước (E1–E8, WHO 2020,
 * Brinjikji 2015, Crossley 2016, Kongsgaard 2009, Gabbett 2016, IASP 2020).
 */
export default {
  slug: 'case-1-1',
  module: 'case',
  chapter: 1,
  chapterTitle: 'Quy trình cá nhân hoá',
  order: 1,
  title: 'Quy trình 6 bước: từ "khách mới" tới giáo án + kế hoạch ăn cá nhân',
  subtitle:
    'Bài khung của module Ứng dụng — nơi mọi mảnh của 5 module trước ghép thành một quy trình lặp lại được cho BẤT KỲ khách nào.',
  minutes: 12,
  objectives: [
    'Chạy đủ 6 bước quy trình: anamnesis → screen y tế → battery test → mục tiêu SMART → giáo án + ăn → theo dõi & re-test.',
    'Biết mỗi bước dùng công cụ nào của app và bài học nào của giáo trình.',
    'Xác định "điểm rơi dữ liệu" ở từng bước — quyết định nào cần con số nào.',
    'Hiểu quy trình là vòng lặp 6–8 tuần, không phải đường một chiều.',
  ],
  sections: [
    {
      heading: 'Sơ đồ tổng: 6 bước và công cụ đi kèm',
      body: `| Bước | Làm gì | Công cụ app | Bài nền tảng |
| --- | --- | --- | --- |
| 1. **Anamnesis** | Hỏi tiền sử, bệnh nền, thuốc, giờ giấc, nghề, ăn uống hiện tại | Hồ sơ + khai báo bệnh nền (auto cảnh báo khi lập giáo án) | Bài Special populations |
| 2. **Screen y tế & vận động** | Duyệt an toàn + screen 5 test + battery test | Movement screen, Battery test | Bài Red flags, Movement screen, Battery test |
| 3. **Phân tích số** | TDEE, protein mục tiêu, volume, vùng HR | BMR/TDEE, Calo & macro, HR zones, thanh volume | Bài Năng lượng, Protein, Capstone bằng chứng |
| 4. **Mục tiêu SMART** | MỘT ưu tiên chính + 2 chỉ số phụ | Bài đọc assessment | Bài Assessment → giáo án |
| 5. **Giáo án + kế hoạch ăn** | 8–12 tuần cụ thể, có điểm nhấn theo ca | Wizard giáo án, đánh giá giáo án, meal plan | Bài Giảm mỡ/Tăng cơ/Refeed |
| 6. **Theo dõi & re-test** | MA7, HR nghỉ, log buổi, re-test 6–8 tuần | BodyLog MA7, log buổi tập, Sổ tay | Bài Hormone & quá tải, DOMS |

Sáu ca kế tiếp của module này đi đúng một đường ray — chỉ khác "hành khách". Nắm khung, bạn tự viết ca thứ bảy, thứ tám của riêng mình.`,
    },
    {
      heading: 'Bước 1–2: hỏi đúng và đo đúng',
      body: `**Anamnesis là buổi đầu giá trị nhất** — năm câu không được bỏ:

1. Bệnh nền/thuốc? (mở quyền cảnh báo của app — bài Special populations).
2. Ngủ mấy tiếng, nghề đứng hay ngồi, tuần có bao nhiêu giờ thật?
3. Đau đang có nào? (khung red flags — bài Khoa học về đau).
4. Đã từng tập kiểu gì, vì sao dừng?
5. Ăn ngày thường thế nào — 24 giờ triệu chứng (bữa nào, món nào, uống gì)?

**Screen + battery là buổi đầu thứ hai** (hoặc cuối buổi đầu nếu khách khỏe): movement screen 5 test + push-up/plank/dặm/vòng bụng — mỗi con số là điểm khởi cho mục tiêu SMART (bài Assessment → giáo án).

Điểm rơi dữ liệu: **bệnh nền + con số battery** — hai thứ này quyết định ca rơi vào "archetype" nào của module này.`,
    },
    {
      heading: 'Bước 3–4: phân tích số và chọn MỘT ưu tiên',
      body: `Phân tích số có công thức ngắn (đã học riêng từng mảnh):

- **Ăn**: TDEE từ máy tính (điểm bắt đầu, ±10–20% sai số) → mục tiêu calo theo đích (−15–20% giảm mỡ / +5–10% tăng cơ) → protein 1,6–2,2 g/kg → phần còn lại chia carb/fat theo sở thích (bài Năng lượng, Carb, Chất béo).
- **Tập**: volume 8–20 set/nhóm/tuần theo trình độ (E1), tần suất 2 lần/nhóm (E2), RIR 1–3 (E4), nghỉ compound 2–3 phút (E5).
- **Cardio**: khung WHO + cấu trúc 3 tầng nền-ngưỡng-đỉnh (bài Sức bền tim mạch).

Rồi **chọn MỘT ưu tiên** (bài Assessment): ca giảm mỡ → ưu tiên deficit bền; ca gầy → surplus + volume; ca bệnh nền → an toàn trước, số đẹp sau. Mục tiêu phụ không mất — chỉ xếp hàng sau.`,
    },
    {
      heading: 'Bước 5: viết 8–12 tuần mà khách "cầm được"',
      body: `Giáo án + kế hoạch ăn chỉ tốt khi **khách thực hiện được** — ba quy tắc đóng gói:

1. **Khớp lịch thật**: 3 buổi hay 4 buổi là do lịch khách, không do template đẹp; 2 buổi/tuần làm đều thắng 4 buổi bỏ dở.
2. **Chọn trước điểm nhấn của mỗi tuần**: tuần nào battery nào, tuần nào deload — in sẵn để khách nhìn thấy đường (bài Capstone: chu kỳ 8 tuần).
3. **Kế hoạch ăn theo thói quen sẵn**: ghép bữa vào khung khách đã có (link meal plan editor của app), thay thế món theo tủ lạnh thật — không viết thực đơn "đầu bếp săng".

Buổi giao giáo án: mở app cùng khách, đi qua từng ngày + thanh volume + bữa mẫu — khách thấy nó **tồn tại trong cuộc sống mình** thì adherence đã thắng một nửa.`,
    },
    {
      heading: 'Bước 6: vòng lặp và ba lý do phải re-test',
      body: `Vòng 6–8 tuần đóng bằng bộ ba số liệu (bài Assessment): mục tiêu trước–sau + chỉ số liên quan + hành vi. Ba lý do re-test không bỏ được:

1. **Khách cần bằng chứng** — "cảm giác chắc khoẻ" không giữ ai qua tháng thứ ba; ba con số giữ được.
2. **Bạn cần điều chỉnh** — MA7 phẳng, HR nghỉ tăng, rep không nhích: mỗi tín hiệu chỉ đúng một biến số (bài Hormone, Refeed, Deload).
3. **Quy trình lặp lại được** — ca tiếp theo của bạn viết nhanh hơn vì đúng khung này. Đó là khác biệt giữa PT có hệ thống và PT "cứ hứa thử".

Vòng sau khác vòng trước ở MỘT chỗ: ưu tiên mới — phần còn lại là bản sao đã được kiểm chứng. Cá nhân hoá không phải viết lại từ đầu mỗi khách; nó là **chạy đúng quy trình trên dữ liệu của riêng khách**.`,
    },
  ],
  applyBox: `**Gian tập thực hành — chạy thử quy trình trên chính bạn (tuần này):**
1. Bước 1: tự trả lời 5 câu anamnesis cho hồ sơ của mình trong app.
2. Bước 2: tự làm movement screen + battery; ghi 5 con số vào Sổ tay tag "battery".
3. Bước 3: chấm máy tính TDEE/protein; bước 4: viết 1 mục tiêu SMART 8 tuần.
4. Bước 5: dùng wizard tạo giáo án thật + 1 meal plan tuần; bước 6: đặt lịch re-test.
Trải nghiệm vai khách một vòng giúp bạn viết ca trong module này chân thật hơn nhiều.`,
  terms: [
    {
      en: 'Anamnesis (first session)',
      vi: 'Khám hỏi buổi đầu',
      def: '5 câu không bỏ: bệnh nền/thuốc, ngủ-nghề-giờ, đau hiện có, lịch sử tập, ăn 24 giờ — mở mọi quyền cảnh báo của app.',
    },
    {
      en: 'Data decision points',
      vi: 'Điểm rơi dữ liệu',
      def: 'Mỗi bước quy trình có con số quyết định riêng: bệnh nền + battery → archetype; TDEE/protein → kế hoạch ăn; battery → SMART.',
    },
    {
      en: 'Adherence-first packaging',
      vi: 'Đóng gói ưu tiên tuân thủ',
      def: 'Giáo án khớp lịch thật + bữa ăn ghép thói quen sẵn — kế hoạch đẹp mà không thực hiện được là giấy, không phải plan.',
    },
    {
      en: 'Re-test loop',
      vi: 'Vòng re-test',
      def: '6–8 tuần đóng bằng 3 con số (mục tiêu, liên quan, hành vi) — bằng chứng giữ khách và dữ liệu chỉnh biến số kế tiếp.',
    },
    {
      en: 'One-new-priority iteration',
      vi: 'Lặp với một ưu tiên mới',
      def: 'Vòng sau giữ khung đã kiểm chứng, đổi đúng MỘT ưu tiên — cá nhân hoá là quy trình lặp trên dữ liệu riêng, không phải viết lại từ đầu.',
    },
  ],
  images: [],
  quiz: [
    {
      q: 'Thứ tự đúng của quy trình 6 bước là gì?',
      choices: [
        'Giáo án → hỏi → test → ăn → mục tiêu → nghỉ',
        'Anamnesis → screen y tế + battery → phân tích số → SMART → giáo án + ăn → theo dõi & re-test',
        'Test → hỏi → mục tiêu → bỏ qua số liệu',
        'Ngẫu nhiên mỗi khách',
      ],
      answer: 1,
      explain:
        'Mỗi bước có công cụ và bài học riêng; thứ tự bảo đảm dữ liệu (bệnh nền, con số) đến TRƯỚC quyết định (giáo án, ăn).',
    },
    {
      q: 'Câu nào KHÔNG được bỏ ở bước anamnesis?',
      choices: [
        'Món ăn yêu thích',
        'Bệnh nền/thuốc — vì nó mở quyền cảnh báo và loại bài khi lập giáo án trong app',
        'Sở thích màu áo tập',
        'Nghề nghiệp',
      ],
      answer: 1,
      explain:
        'Bệnh nền tự động cảnh báo khi lập giáo án (bài Special populations); bỏ câu này là bỏ cả tầng an toàn của cả quy trình.',
    },
    {
      q: '"Điểm rơi dữ liệu" của bước phân tích là gì?',
      choices: [
        'Cảm giác của PT hôm đó',
        'Bộ con số cụ thể: TDEE điểm bắt đầu, protein g/kg, volume/nhóm/tuần, vùng HR',
        'Số like bài đăng',
        'Tên phòng gym',
      ],
      answer: 1,
      explain:
        'Con số của bước 3 (máy tính) + SMART của bước 4 là nơi giáo án và ăn "neo" vào — không phỏng đoán.',
    },
    {
      q: 'Vì sao kế hoạch phải "khách cầm được" là quy tắc, không phải gợi ý?',
      choices: [
        'Vì app bắt buộc',
        'Giáo án 4 buổi đẹp nhưng khách chỉ làm được 2 → adherence chết; 2 buổi làm đều thắng — cá nhân hoá nghĩa là khớp cuộc sống thật',
        'Vì khách thích đơn giản',
        'Không có lý do',
      ],
      answer: 1,
      explain:
        'Adherence là biến số quyết định lớn nhất kết quả dài hạn — thiết kế quanh lịch/thói quen thật là một phần của chuyên môn, không phải hạ chuẩn.',
    },
    {
      q: 'Vòng re-test tiếp theo khác vòng trước ở đâu?',
      choices: [
        'Viết lại hoàn toàn từ đầu',
        'Giữ khung đã kiểm chứng, đổi MỘT ưu tiên theo dữ liệu mới',
        'Đổi toàn bộ mục tiêu sống',
        'Bỏ re-test vì khách quen rồi',
      ],
      answer: 1,
      explain:
        'Quy trình lặp: mỗi vòng đổi một ưu tiên, phần còn lại là phần đã chứng minh hiệu quả — như thế khách mới tiến đều mà không mất nền đã xây.',
    },
  ],
  related: {
    muscles: [],
    exercises: [],
    calculators: ['bmr', 'tdee', 'calories', 'macro', 'hr-zones', 'one-rm'],
    conditions: [],
    evidence: ['E1', 'E2', 'E4', 'E6', 'E8'],
  },
  sources: [
    {
      label: 'McLeod et al. 2024 — Umbrella review: cá nhân hoá giáo án (E6, đã kiểm chứng)',
      url: 'https://doi.org/10.1016/j.jshs.2023.06.005',
      license: 'CC BY-NC-ND (cite-only)',
    },
    {
      label: 'WHO — Guidelines on physical activity and sedentary behaviour (2020, URL đã kiểm chứng)',
      url: 'https://www.who.int/publications/i/item/9789240015128',
      license: 'cite-only',
    },
    {
      label: 'Helms et al. 2014 — Fat loss prescription (E7, đã kiểm chứng)',
      url: 'https://doi.org/10.1186/1550-2783-11-20',
      license: 'CC BY 4.0',
    },
  ],
};
