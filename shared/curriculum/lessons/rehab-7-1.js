/**
 * Phòng chấn thương: warm-up RAMP và quản lý tải ACWR.
 *
 * Nguồn: Gabbett 2016 (DOI đã kiểm chứng 10.1136/bjsports-2015-095788,
 * open access), Pancar et al. 2026 (E8 — đã kiểm chứng), ACSM (cite-only).
 */
export default {
  slug: 'rehab-7-1',
  module: 'rehab',
  chapter: 7,
  chapterTitle: 'Phòng chấn thương',
  order: 1,
  title: 'Phòng chấn thương: khởi động RAMP và luật "tải không nhảy vọt"',
  subtitle:
    'Hai công cụ rẻ nhất chống chấn thương: khởi động 4 bước chuẩn và quản lý tỉ số tải cấp/tải nền (ACWR) để không bao giờ để volume "spike".',
  minutes: 11,
  objectives: [
    'Chạy khung khởi động RAMP 4 bước: Raise – Activate – Mobilise – Potentiate.',
    'Giải thích mô hình ACWR: tải tuần này so với nền 4 tuần, và vì sao spike là thủ phạm quen thuộc.',
    'Áp ba luật tăng tải an toàn cho gym: quay lại sau nghỉ, bài mới, và thêm sprint/plyometric.',
    'Nối phòng chấn thương với ngủ + dinh dưỡng như "nền" của toàn bộ hệ thống.',
  ],
  sections: [
    {
      heading: 'RAMP: khởi động có cấu trúc, không phải 5 phút xoay tay',
      body: `Khung RAMP chia khởi động thành 4 việc có thứ tự:

- **R — Raise (nâng nhiệt)**: 3–5 phút làm nâng nhịp tim và nhiệt cơ thể nhẹ — xe đạp, dây kháng lực kéo nhẹ, nhảy dây chậm.
- **A — Activate (kích hoạt)**: nhóm cơ sắp làm việc chính — band walk trước buổi chân, face pull trước buổi đẩy.
- **M — Mobilise (mở khớp)**: mở ROM cho động tác chính — squat không tải, hinge gậy gỗ, xoay hông có kiểm soát.
- **P — Potentiate (gài công suất)**: 1–2 set tiến tới tải của bài đầu — 40% → 60% → 80% (đúng bản chất "ramp" của tuyển chọn motor unit — bài Motor unit).

10–15 phút là đủ cho đa số khách — dài hơn là ngại, ngại là bỏ, bỏ là mất công cụ.`,
    },
    {
      heading: 'ACWR: tải tuần này so với nền của chính khách',
      body: `Mô hình của Gabbett (2016) gom hai con số:

- **Acute**: khối lượng tải 1 tuần gần nhất (tonnage, số bước, km chạy).
- **Chronic**: trung bình 4 tuần trước đó — chính là **nền sức chịu tải**.

Tỉ số Acute/Chronic cho biết tuần này đang "gánh" bao nhiêu so với nền:

| ACWR | Đọc |
| --- | --- |
| ~0,8–1,3 | Vùng tốt: tải mới bám sát nền |
| > 1,5 | **Spike**: tuần này đột ngột gấp rỡ nền — vùng rủi ro chấn thương rõ |
| < 0,8 | Đang "lao xuống": nền sẽ tụt nếu kéo dài (và khi quay lại dễ spike) |

Con số không phải phán thần — là **đèn cảnh báo sớm**: khách nghỉ 3 tuần rồi quay lại "yêu như xưa" chính là ACWR ~2-3, kịch bản gân/mô mềm phản ứng kinh điển (bài Tendinopathy).`,
    },
    {
      heading: 'Ba luật tăng tải cho phòng gym',
      body: `1. **Quay lại sau nghỉ dài**: tuần đầu volume −40–50% (đúng logic deload E8 — bài Hormone & quá tải), tuần hai −30%, rồi mới về nền.
2. **Bài mới / kiểu mới**: volume nhỏ trước — lần đầu gặp một mẫu lực mới, mô chưa có "hàng rào" (repeat bout effect — bài DOMS).
3. **Thêm sprint/nhảy**: chỉ khi nền có — calf raise và hamstring eccentric đã có tải ổn; tăng từng đoạn (10 phút run-walk) thay vì "chạy 5 km mở màn".

Cả ba luật cùng một bản chất: **tăng tải bám nền, không nhảy vọt** — quy tắc app đã hỗ trợ qua gợi ý progression và deload khi lập giáo án.`,
    },
    {
      heading: 'Nền của phòng chấn thương nằm ngoài phòng gym',
      body: `Ba trụ quen thuộc (từ module Sinh lý) quyết định "nền" chịu tải thật:

- **Ngủ 7–9 giờ** (bài DOMS): thiếu ngủ làm RPE mọi mức tăng và phục hồi chậm.
- **Ăn đủ năng lượng + protein** (module Dinh dưỡng): RED-S làm xương, gân, nội tiết cùng yếu đi.
- **Stress quản lý được** (bài Khoa học về đau): stress là tải — kể cả khi không chạy bước nào.

PT hay săn "bài warm-up hoàn hảo" mà quên nền — nhưng khách ngủ 5 tiếng thì warm-up đẹp đến mấy cũng chỉ là hoá đơn trang trí trên móng nhà mục.`,
    },
  ],
  applyBox: `**Gian tập thực hành — đặt RAMP + ACWR vào buổi:**
1. In/ghi khung RAMP 10 phút vào đầu giáo án mỗi buổi — Raise 4', Activate 3', Mobilise 2', Potentiate 1–2 set.
2. Chủ nhật tính nhanh ACWR cardio: km hoặc bước tuần này ÷ trung bình 4 tuần — vượt 1,5 → cắt bớt tuần tới.
3. Mọi lần quay lại sau nghỉ ≥ 2 tuần: tự động volume −40–50% (đánh dấu ngay trong giáo án).
4. Thêm sprint/nhảy: chỉ sau khi khách có 4 tuần nền calf + hamstring eccentric đều đặn.`,
  terms: [
    {
      en: 'RAMP warm-up',
      vi: 'Khởi động RAMP',
      def: 'Raise – Activate – Mobilise – Potentiate: bốn bước có thứ tự, 10–15 phút, gắn với bài chính của buổi.',
    },
    {
      en: 'ACWR (acute:chronic workload ratio)',
      vi: 'Tỉ số tải cấp/nền',
      def: 'Tải tuần này so với trung bình 4 tuần: ~0,8–1,3 là vùng tốt; > 1,5 là spike rủi ro (Gabbett 2016).',
    },
    {
      en: 'Workload spike',
      vi: 'Tải nhảy vọt',
      def: 'Tuần này đột ngột gấp rỡ nền — thủ nhân quen thuộc của phản ứng gân/mô mềm và chấn thương.',
    },
    {
      en: 'Potentiation',
      vi: 'Gài công suất',
      def: '1–2 set tiến dần tới tải bài đầu (40→60→80%) — chạy đúng trật tự tuyển chọn motor unit.',
    },
    {
      en: 'Return-to-training ramp',
      vi: 'Nhịp quay lại sau nghỉ',
      def: 'Tuần 1: −40–50% volume; tuần 2: −30%; rồi về nền — chống spike ACWR bằng bậc thang.',
    },
  ],
  images: [],
  quiz: [
    {
      q: 'Thứ tự đúng của khung RAMP là gì?',
      choices: [
        'Potentiate – Mobilise – Activate – Raise',
        'Raise – Activate – Mobilise – Potentiate',
        'Mobilise – Raise – Potentiate – Activate',
        'Ngẫu nhiên tuỳ cảm xúc',
      ],
      answer: 1,
      explain:
        'Nâng nhiệt → kích hoạt nhóm chính → mở khớp → gài công suất: mỗi bước chuẩn bị cho bước sau, kết bằng set ramp tới tải thật.',
    },
    {
      q: 'ACWR được tính bằng cách nào?',
      choices: [
        'Tải tối đa 1 rep chia cân nặng',
        'Tải tuần này (km, bước, tonnage) chia trung bình 4 tuần nền',
        'Nhịp tim chia nhịp thở',
        'Số buổi chia số bài',
      ],
      answer: 1,
      explain:
        'Acute = 1 tuần gần nhất; Chronic = nền 4 tuần — tỉ số cho biết tuần này bám nền hay đang nhảy vọt.',
    },
    {
      q: 'Khách nghỉ tập 3 tuần rồi quay lại "yêu như xưa". ACWR của tuần này xấp xỉ bao nhiêu và nghĩa là gì?',
      choices: [
        '~0,3 — an toàn tuyệt đối',
        '~2–3 — spike: rủi ro phản ứng gân/mô mềm; cần volume −40–50% tuần đầu',
        '~1,0 — hoàn hảo không cần chỉnh',
        'Không tính được',
      ],
      answer: 1,
      explain:
        'Nền tụt khi nghỉ, tải về mức cũ tạo tỉ số cao — đúng lý do luật quay lại sau nghỉ nằm trong mọi hướng dẫn (và E8 deload).',
    },
    {
      q: 'Muốn thêm sprint/nhảy cho khách, điều kiện nền hợp lý là gì?',
      choices: [
        'Cứ thêm ngay cho lạc quan',
        'Đã có ~4 tuần nền calf raise + hamstring eccentric ổn định, rồi tăng từng đoạn walk-run',
        'Chỉ cần giày tốt',
        'Sau khi sprint một lần thử để "biết mình"',
      ],
      answer: 1,
      explain:
        'Achilles và hamstring là hai nơi "đốt" nhất khi spike — nền eccentric (Nordic, calf raise) là hàng rào trước khi thêm tốc độ.',
    },
    {
      q: 'Vì sao nói nền phòng chấn thương nằm NGOÀI phòng gym?',
      choices: [
        'Vì warm-up không quan trọng',
        'Ngủ, năng lượng/protein đủ và stress quản lý được quyết định sức chịu tải thật — thiếu nền thì mọi warm-up chỉ là trang trí',
        'Vì gym chỉ để làm đẹp',
        'Không có lý do',
      ],
      answer: 1,
      explain:
        'Ba trụ (ngủ, ăn, stress) đã có bài riêng ở module Sinh lý — khách thiếu nền thì chỉnh warm-up là sửa móng mục bằng sơn.',
    },
  ],
  related: {
    muscles: ['gastrocnemius', 'soleus', 'biceps-femoris', 'gluteus-medius'],
    exercises: ['barbell-back-squat', 'nordic-curl', 'standing-calf-raise', 'hip-thrust'],
    calculators: ['volume', 'tonnage'],
    conditions: [],
    evidence: ['E8'],
  },
  sources: [
    {
      label: 'Gabbett 2016 — The training-injury prevention paradox (BJSM, open access, DOI đã kiểm chứng 10.1136/bjsports-2015-095788)',
      url: 'https://doi.org/10.1136/bjsports-2015-095788',
      license: 'CC BY 4.0',
    },
    {
      label: 'Pancar et al. 2026 — Deload (E8, đã kiểm chứng)',
      url: 'https://doi.org/10.1038/s41598-026-40612-5',
      license: 'cite-only',
    },
    {
      label: "ACSM's Guidelines — Warm-up & progression (cite-only)",
      url: 'https://www.acsm.org/education-resources/books-and-multimedia-resources',
      license: 'cite-only',
    },
  ],
};
