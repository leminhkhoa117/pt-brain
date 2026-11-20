/**
 * Tổng hợp bằng chứng tập luyện: volume, tần suất, RIR, nghỉ, deload.
 *
 * Nguồn: evidence base E1–E8 của PT Brain (đã kiểm chứng metadata qua
 * Europe PMC) — Schoenfeld 2017/2016, Refalo 2023, Grgic 2018, McLeod 2024,
 * Pancar 2026.
 */
export default {
  slug: 'phys-6-1',
  module: 'phys',
  chapter: 6,
  chapterTitle: 'Bằng chứng tập luyện',
  order: 1,
  title: 'Ghép toàn bộ bằng chứng: bài học tổng kết của module Sinh lý',
  subtitle:
    'Volume, tần suất, mức tới thất bại, nghỉ giữa set và deload — bốn biến số + một phanh, mỗi thứ có bằng chứng riêng đã được app kiểm chứng DOI.',
  minutes: 13,
  objectives: [
    'Tóm tắt khoảng thực hành có bằng chứng của 4 biến số: volume (E1), tần suất (E2), RIR (E4), nghỉ (E5).',
    'Giải thích vì sao cá nhân hoá (E6) đứng trên mọi công thức, và deload (E8) là phanh của cả hệ thống.',
    'Đọc đúng thanh volume và gợi ý progression của app (10–20 set/nhóm cơ/tuần, tăng tạ theo RIR).',
    'Dựng một chu kỳ 8 tuần hoàn chỉnh cho khách trung cấp bằng các biến số này.',
  ],
  sections: [
    {
      heading: 'Bảng tổng kết: biến số → khoảng thực hành → nguồn',
      body: `| Biến số | Khoang thực hành | Bằng chứng |
| --- | --- | --- |
| **Volume** (set/nhóm cơ/tuần) | 10–20 với người có nền tảng; mới tập 8–12 tăng dần | E1 — Schoenfeld 2017 (liều–đáp) |
| **Tần suất** (lần/nhóm cơ/tuần) | 2 lần là nền vững; 3 khi volume cao & hồi phục tốt | E2 — Schoenfeld 2016 |
| **Mức tới thất bại (RIR)** | Phần lớn set RIR 1–3; chỉ set cuối bài chạm 0–1 | E4 — Refalo 2023 |
| **Nghỉ giữa set** | Compound 2–3 phút; isolation 60–90 giây | E5 — Grgic 2018 |
| **Phanh deload** | Giảm 40–50% volume 1 tuần sau chuỗi tăng hoặc khi có tín hiệu quá tải | E8 — Pancar 2026 |

Ghi nhớ cách đọc bảng: mỗi khoảng là **mặt sàn tin cậy**, không phải trần duy nhất — và các biến số **nhân lên** chứ không cộng: volume đúng + tần suất sai vẫn mệt hoá; RIR đúng + nghỉ 45 giây vẫn làm chất lượng set rơi.`,
    },
    {
      heading: 'Cá nhân hoá là biến số thứ sáu (E6)',
      body: `Umbrella review của McLeod 2024 (E6) tổng hợp toàn bộ meta-analysis và kết luận thẳng: **không có một giáo án tối ưu cho tất cả**. Cùng một công thức, hai khách khác giấc ngủ, khác nghề, khác ROM cho kết quả khác nhau.

Ba câu cá nhân hoá nhanh khi dựng giáo án:

1. *Khách có bao nhiêu giờ mỗi tuần?* — volume phải vừa cái balô đó, không phải vừa công thức.
2. *Hồi phục của khách ra sao?* (ngủ, nghề, stress — bài DOMS & Hormone) — đây là trần volume thật.
3. *Thế mạnh nào của khách muốn ưu tiên?* (bùng nổ rep thấp hay lì đòn rep cao — bài Motor unit) — chọn rep range ưu tiên.

App đã nhúng logic này: wizard phân volume theo mục tiêu/trình độ, cảnh báo thiếu/quá set theo nhóm, và **chấm điểm giáo án 0–100 với 7 subscore** (volume, tần suất, cân bằng, RIR, hồi phục, đặc hiệu, tiến bộ) — subscore thấp chính là biến số bạn cần chỉnh tiếp theo.`,
    },
    {
      heading: 'Bốn giai đoạn của một chu kỳ 8 tuần',
      body: `Mẫu ghép cho khách trung cấp (đủ ngủ, 4 buổi/tuần):

- **Tuần 1–2 (nền)**: volume ở cận dưới (10–12 set/nhóm), đa số set RIR 2–3, tạ giữ nguyên — làm quen tải sau chu kỳ cũ.
- **Tuần 3–5 (xây)**: tăng volume +1–2 set/nhóm mỗi tuần tới 16–18; tạ tăng theo quy tắc "đạt cận trên + RIR ≥ 2"; giữ nghỉ compound 2–3 phút thật sự.
- **Tuần 6–7 (đỉnh)**: volume giữ, cho phép set cuối 1–2 bài chạm RIR 0–1; theo dõi 5 tín hiệu quá tải (bài Hormone).
- **Tuần 8 (deload)**: volume −40–50%, tạ giữ mức trung — rồi quay lại tuần 1 với nền cao hơn chút.

Đây chính là nhịp "tải tăng dần → phanh → tải lại" mà hệ thống progression của app theo dõi giúp bạn: log buổi tập là dữ liệu, gợi ý tăng tạ là quy tắc, deload là mục trong giáo án.`,
    },
    {
      heading: 'Nối các bài của module thành một bức tranh',
      body: `- **Cơ học là tín hiệu gốc** (Sarcomere, Tăng cơ): tải + biên độ + kiểm soát mới ra mồ hôi thật.
- **Năng lượng quyết định thời gian còn lại** (Hệ năng lượng): chọn rep range và nghỉ theo hệ nào gánh.
- **Tim mạch + ngưỡng lactate** là điều kiện phục hồi và thành tích cardio (Tim mạch, Ngưỡng, VO2max).
- **Thần kinh tăng trước, cơ theo sau** (Motor unit, Thích ứng thần kinh): đọc tiến bộ đúng giai đoạn, khách không bỏ cuộc ở tuần 6.
- **Mệt mỏi là chi phí** (DOMS, Hormone): volume phải vừa ngân sách phục hồi của chính khách đó.

Mọi "mẹo viral" trên mạng đều sụp hoặc đứng tùy việc nó vi phạm hay đúng bảng biến số này — giờ bạn có khung để tự phán xét, không cần tin ai cả.`,
    },
  ],
  applyBox: `**Gian tập thực hành — dựng chu kỳ 8 tuần trong app (20 phút):**
1. Mở tab Giáo án → wizard: chọn mục tiêu, 4 buổi/tuần → app chia volume theo nhóm cơ.
2. Rà từng ngày bằng thanh volume của app: mỗi nhóm nằm 10–20 set (trẻ/mới → cận dưới).
3. Đặt RIR mục tiêu 1–3 trong mô tả ngày tập; đánh dấu tuần 8 là deload ngay từ đầu.
4. Chấm điểm giáo án (nút đánh giá): subscore nào < 60 → đó là biến số chỉnh tiếp.
5. Sau tuần 8: so 1RM ước lượng + số đo, rồi copy giáo án sang chu kỳ mới tăng 5–10% volume.`,
  terms: [
    {
      en: 'Dose-response (volume)',
      vi: 'Quan hệ liều–đáp',
      def: 'Nhiều set hơn cho kết quả hơn tới một điểm — E1; mặt sàn 10–20 set/nhóm/tuần cho người có nền tảng.',
    },
    {
      en: 'Individualization (E6)',
      vi: 'Cá nhân hoá',
      def: 'Biến số thứ sáu đứng trên công thức: lịch phải vừa giờ ngủ, nghề và thế mạnh của từng khách.',
    },
    {
      en: 'Periodization (nhịp đơn giản)',
      vi: 'Phân kỳ chu kỳ',
      def: 'Tải tăng dần có chủ đích, chèn deload như phanh — nhịp nền → xây → đỉnh → giảm.',
    },
    {
      en: 'Progressive overload (quy tắc)',
      vi: 'Tăng tải dần',
      def: '"Đạt cận trên + đúng RIR → tăng tạ nhỏ" — quy tắc app theo dõi giúp bạn thực thi đều đặn.',
    },
    {
      en: 'Subscore giáo án',
      vi: 'Điểm thành phần giáo án',
      def: '7 thành phần 0–100 của app (volume, tần suất, RIR, hồi phục...) — điểm thấp chỉ đúng biến số cần chỉnh.',
    },
  ],
  images: [],
  quiz: [
    {
      q: 'Khoảng volume có bằng chứng (E1) cho người đã có nền tảng là bao nhiêu?',
      choices: ['2–5 set/nhóm cơ/tuần', '10–20 set/nhóm cơ/tuần', '30–40 set/nhóm cơ/tuần', 'Chỉ đếm số buổi'],
      answer: 1,
      explain:
        'E1 cho thấy quan hệ liều–đáp: 10–20 set/nhóm/tuần là mặt sàn cân bằng lợi ích và hồi phục cho người có nền tảng; mới tập bắt đầu thấp hơn.',
    },
    {
      q: 'Vì sao nói các biến số NHÂN lên chứ không cộng?',
      choices: [
        'Vì chỉ volume quan trọng',
        'Volume đúng + nghỉ 45 giây vẫn làm chất lượng set rơi; RIR đúng + tần suất dồn 1 buổi vẫn mệt hoá — mỗi biến sai kéo cả hệ',
        'Vì công thức toán học của app',
        'Không có ý nghĩa gì',
      ],
      answer: 1,
      explain:
        'Kết quả = tích của các biến số, nên subscore thấp nhất của app là nơi đáng ưu tiên chỉnh trước.',
    },
    {
      q: 'Theo E2, khi volume đã cân bằng, tần suất nền vững cho mỗi nhóm cơ là?',
      choices: ['1 lần/tuần', '2 lần/tuần', '6 lần/tuần', 'Chỉ tính theo tháng'],
      answer: 1,
      explain:
        'Tần suất 2 lần tận dụng hai cửa sổ MPS mỗi tuần và chia nhỏ volume; 3 lần chỉ khi volume cao và hồi phục tốt.',
    },
    {
      q: 'Umbrella review E6 (McLeod 2024) nhấn mạnh điều gì khi so các giáo án "tối ưu"?',
      choices: [
        'Có duy nhất một giáo án tối ưu cho mọi người',
        'Không có giáo án vạn năng — cá nhân hoá theo thời gian, trình độ, hồi phục mới là biến quyết định',
        'Chỉ tần suất là quan trọng',
        'Nghỉ giữa set càng ngắn càng tốt',
      ],
      answer: 1,
      explain:
        'E6 tổng hợp các meta-analysis: mọi biến số đều đóng góp, nhưng cách ghép phải vừa hoàn cảnh riêng của khách.',
    },
    {
      q: 'Trong chu kỳ 8 tuần mẫu, tuần 8 làm gì?',
      choices: [
        'Tăng volume tối đa để kết thúc hoành tráng',
        'Deload: giảm 40–50% volume, giữ cường độ trung — phanh để chu kỳ sau bắt đầu nền cao hơn',
        'Nghỉ hoàn toàn không vận động',
        'Đổi toàn bộ bài mới',
      ],
      answer: 1,
      explain:
        'Phanh có chủ đích (E8) giữ kỹ thuật và hồi mô mềm — sau đó tuần 1 của chu kỳ mới bắt đầu với nền tốt hơn.',
    },
    {
      q: 'Subscore "RIR" của app chấm giáo án chỉ 55/100. Điều chỉnh nào đúng hướng?',
      choices: [
        'Thêm 5 set mỗi nhóm',
        'Xem mô tả các ngày: phần lớn set nên ở RIR 1–3 và chỉ set cuối 1–2 bài chạm 0–1',
        'Đổi cardio thành chủ đạo',
        'Không cần điều chỉnh',
      ],
      answer: 1,
      explain:
        'Subscore trỏ đúng biến số: chỉnh mức nỗ của các set theo E4 thay vì tự phát thêm volume hay đổi kiểu giáo án.',
    },
  ],
  related: {
    muscles: ['quadriceps', 'pectoralis-major', 'latissimus-dorsi', 'gluteus-maximus'],
    exercises: ['barbell-back-squat', 'barbell-bench-press', 'pull-up', 'overhead-press'],
    calculators: ['one-rm', 'volume', 'tonnage'],
    conditions: [],
    evidence: ['E1', 'E2', 'E4', 'E5', 'E6', 'E8'],
  },
  sources: [
    {
      label: 'Schoenfeld et al. 2017 — Volume dose-response (E1, đã kiểm chứng)',
      url: 'https://doi.org/10.1080/02640414.2016.1210197',
      license: 'cite-only',
    },
    {
      label: 'Refalo et al. 2023 — Proximity to failure (E4, đã kiểm chứng)',
      url: 'https://doi.org/10.1007/s40279-022-01784-y',
      license: 'cite-only',
    },
    {
      label: 'McLeod et al. 2024 — Umbrella review (E6, đã kiểm chứng)',
      url: 'https://doi.org/10.1016/j.jshs.2023.06.005',
      license: 'CC BY-NC-ND (cite-only)',
    },
    {
      label: 'Pancar et al. 2026 — Deload (E8, đã kiểm chứng)',
      url: 'https://doi.org/10.1038/s41598-026-40612-5',
      license: 'cite-only',
    },
  ],
};
