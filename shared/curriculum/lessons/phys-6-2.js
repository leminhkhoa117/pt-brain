/**
 * Volume landmarks & autoregulation — bài nối tiếp phys-6-1.
 *
 * Khung MV/MEV/MAV/MRV là mô hình huấn luyện thực hành (expert framework),
 * không phải định luật sinh lý; bằng chứng nền cho volume/RIR/deload lấy từ
 * evidence base E1/E4/E6/E8 của PT Brain.
 */
export default {
  slug: 'phys-6-2',
  module: 'phys',
  chapter: 6,
  chapterTitle: 'Bằng chứng tập luyện',
  order: 2,
  title: 'Volume landmarks & tự điều chỉnh: MEV, MAV, MRV và RPE/RIR',
  subtitle:
    '10–20 set là khung khởi đầu, không phải điểm dừng. Bài này dạy cách tìm ngưỡng volume của từng khách bằng dữ liệu buổi tập, RPE/RIR và tín hiệu hồi phục.',
  minutes: 15,
  objectives: [
    'Phân biệt MV, MEV, MAV, MRV và biết đây là khung tham khảo, không phải số cố định.',
    'Dùng RPE/RIR để điều chỉnh tạ và volume thay vì chỉ nhìn %1RM.',
    'Tìm MEV/MAV/MRV cho một khách trong 4–6 tuần bằng log buổi tập.',
    'Ra quyết định tăng volume, giữ nguyên hay deload khi hiệu suất thay đổi.',
    'Nhận diện tín hiệu vượt MRV và thời điểm cần chuyển hướng/refer.',
  ],
  sections: [
    {
      heading: '10–20 set chỉ là khung, không phải chìa khoá',
      body: `Bài tổng kết E1 cho thấy volume có quan hệ liều–đáp với phì đại: nhiều set hơn (trong khoảng hợp lý) thường tốt hơn, nhưng lợi ích tăng chậm dần và **ngưỡng của mỗi người khác nhau**. Cùng 16 set/tuần, người ngủ 8 giờ và người ngủ 5 giờ không hồi phục như nhau.

Con số cụ thể từ meta-analysis: mỗi set/tuần thêm vào tương ứng khoảng **+0,37% phì đại**, và nhóm volume cao so với thấp hơn khoảng **+3,9%**; **≥10 set/nhóm/tuần** là mốc thực hành cho hypertrophy. Nhưng đây là **trung bình nhóm**, không phải ngưỡng của từng khách.

Vì vậy "10–20 set" là **khoảng khởi đầu để tìm**, không phải đích đến. Ngôn ngữ để tìm là bốn mốc volume (volume landmarks) — một mô hình thực hành phổ biến của giới coaching, cần dùng như **giả thuyết cá nhân hoá**, không phải bằng chứng sinh lý cứng:

- **MV — Maintenance Volume:** lượng set tối thiểu để giữ cơ/lực khi không thể tăng.
- **MEV — Minimum Effective Volume:** lượng set tối thiểu bắt đầu tạo tiến bộ rõ.
- **MAV — Maximum Adaptive Volume:** vùng volume cho lợi ích lớn nhất mà vẫn hồi phục được.
- **MRV — Maximum Recoverable Volume:** trần mà vượt qua sẽ tích mệt, hiệu suất đi xuống.

Một "set" ở đây là **working set gần failure (RIR 1–3)**, không tính khởi động. Nếu set nào cũng RIR 5–6, số set không cùng nghĩa với bảng.`,
    },
    {
      heading: 'Bốn mốc volume — khung tham khảo',
      body: `| Mốc | Khung tham khảo (set/nhóm/tuần) | Cách dùng |
| --- | --- | --- |
| **MV** | 4–8 | Tuần bận/duy trì; giữ tạ, không cần tăng |
| **MEV** | 8–12 | Điểm bắt đầu block tăng cơ với người có nền |
| **MAV** | 12–20 | Vùng "nhiều việc" nhất; theo dõi hiệu suất từng tuần |
| **MRV** | 18–25 | Trần cá nhân; chỉ chạm ngắn hạn, có deload sau |

Con số này là **điểm khởi đầu để hiệu chỉnh**, không phải chẩn đoán. Người mới thường ở cận dưới (8–12); người tập lâu, ngủ tốt, ít stress có thể lên 18–20; người đang cut hoặc nghề nặng có thể thấp hơn.

Cách đọc: nếu khách tăng từ 10 → 14 set mà rep/tạ vẫn tăng, ngủ ổn, đau khớp không tăng — có thể còn dưới MAV. Nếu tăng 2 set mà hiệu suất rơi 2 tuần, đau khớp xuất hiện — đã chạm/vượt MRV.`,
    },
    {
      heading: 'Tìm MEV/MAV/MRV trong 4–6 tuần',
      body: `**Tuần 0:** chọn mức khởi đầu theo trình độ (beginner 8–10, intermediate 10–14, advanced 12–16 set/nhóm/tuần), chia 2–3 buổi/nhóm.

**Mỗi tuần:** thêm **1–2 set/nhóm** (không thêm tất cả nhóm cùng lúc) và ghi 4 dữ kiện:

1. **e1RM/rep PR** của 1–2 bài chính mỗi nhóm.
2. **RPE trung bình** của các set (1–10).
3. **Đau khớp/đau cơ** 0–10 và thời gian hồi.
4. **Ngủ, mood, HR nghỉ** nếu có.

**Quy tắc đọc:**

- Hiệu suất tăng + hồi phục ổn → tiếp tục tăng 1–2 set/tuần.
- Hiệu suất phẳng 2 tuần dù ngủ/ăn ổn → giữ volume, kiểm tra kỹ thuật/nghỉ; đừng tự động thêm set.
- Hiệu suất giảm + đau khớp/mệt tăng → đã vượt MRV: deload 1 tuần (giảm 40–50% volume, giữ tạ trung bình), rồi quay lại ở 80–90% volume cũ.
- Đau > 3/10 hoặc kéo dài > 24 giờ → giảm tải/đổi bài, đánh giá theo bài rehab; không "tăng volume cho quen".

Sau 4–6 tuần, bạn có **một dải cá nhân** thay vì con số chung: ví dụ "MEV ~10, MAV ~16–18, MRV ~20" cho khách đó. Ghi vào log/giáo án để block sau không phải mò lại.`,
    },
    {
      heading: 'RPE/RIR — ngôn ngữ tự điều chỉnh',
      body: `**RIR (repetitions in reserve)** là số rep còn có thể làm trước failure kỹ thuật; **RPE** là mức nỗ 1–10. Hai thang ánh xạ đơn giản:

| RPE | RIR | Cảm giác |
| --- | --- | --- |
| 10 | 0 | Không thể thêm rep đúng form |
| 9 | 1 | Còn đúng 1 rep |
| 8 | 2 | Còn 2 rep |
| 7 | 3 | Còn 3 rep |
| 6 | 4 | Còn 4 rep, dễ chịu |

Cách dùng thực tế:

- **Set đầu:** ước RPE/RIR sau khi xong, không cần đo chính xác tuyệt đối.
- **Set sau:** nếu RPE cao hơn dự kiến 1 bậc, giảm 2,5–5% tạ hoặc bỏ 1 rep; nếu thấp hơn, giữ hoặc tăng nhẹ.
- **Progression:** đạt cận trên rep range với RIR ≥ 2 ở 2 buổi liên tiếp → tăng tạ nhỏ (2,5–5% compound, 1–2,5% isolation).
- **Không dùng RPE cho người mới trong 2–4 tuần đầu:** dạy họ cảm giác gần failure trước, vì người mới thường ước RIR cao hơn thực tế.

RPE/RIR không thay thế log tạ/rep; nó là **lớp điều chỉnh** khi thân nhiệt, giấc ngủ, stress thay đổi.`,
    },
    {
      heading: 'Quyết định: thêm volume, giữ hay deload?',
      body: `Cây quyết định 1 phút sau buổi tập:

1. **Rep/tạ tăng so với tuần trước?** → giữ hoặc +1 set/nhóm; chưa cần deload.
2. **Rep/tạ phẳng 2 tuần?** → kiểm tra ngủ, calo/protein, số buổi, kỹ thuật; nếu ổn, thử +1 set/nhóm hoặc đổi bài cùng pattern.
3. **Rep/tạ giảm + RPE tăng + đau khớp?** → giảm 40–50% volume 1 tuần (deload), giữ tạ trung bình; sau đó quay lại 80–90% volume. Deload dùng khi có tín hiệu mệt, không theo lịch cứng; một số RCT cho thấy deload đầy đủ có thể làm chậm tăng sức mạnh, nên đừng lạm dụng.
4. **Đau > 3/10 hoặc đau tăng sau 24h?** → giảm tải/đổi bài, kiểm tra theo module rehab; không tăng volume.
5. **Mệt kéo dài + HR nghỉ tăng + ngủ xấu?** → xem bài Hormone/quá tải; có thể cần nghỉ dài và kiểm tra y tế nếu không hồi.

Nguyên tắc: **mỗi lần một biến, chờ 2 tuần mới kết luận.** Tăng volume, tăng tạ, đổi bài và cắt calo cùng lúc sẽ không cho bạn biết cái nào có công.`,
    },
  ],
  applyBox: `**Gian tập thực hành — block 7 tuần tìm volume cho khách intermediate:**
1. Tuần 1: đặt 10–12 set/nhóm/tuần, RIR 2–3; log e1RM 2 bài chính + RPE + đau khớp.
2. Tuần 2–5: mỗi tuần +1–2 set cho **một nhóm ưu tiên**, giữ nhóm khác; theo dõi 4 dữ kiện.
3. Tuần 6: nếu hiệu suất còn tăng → giữ mức cao nhất; nếu phẳng → giữ, kiểm tra ngủ/ăn; nếu giảm → deload sớm.
4. Tuần 7: deload 1 tuần (volume −40–50%, tạ trung bình) nếu đã chạm trần; ghi lại "MEV/MAV/MRV ước tính" vào log.
5. Block sau bắt đầu ở 80–90% volume đỉnh, không quay lại mò từ 10 set.`,
  safetyBox:
    'Volume landmark là khung huấn luyện, không phải chỉ định y tế. Khách có đau khớp tăng, đau đêm, tê/yếu chi, bệnh tim mạch hoặc đang mang thai cần giảm tải và hỏi chuyên gia trước khi đẩy volume. PT không chẩn đoán chấn thương — dừng và chuyển hướng khi có red flag.',
  terms: [
    {
      en: 'MV (Maintenance Volume)',
      vi: 'Volume duy trì',
      def: 'Lượng set tối thiểu để giữ cơ/lực khi không thể tăng — thường thấp hơn MEV.',
    },
    {
      en: 'MEV (Minimum Effective Volume)',
      vi: 'Volume hiệu quả tối thiểu',
      def: 'Ngưỡng set bắt đầu tạo tiến bộ rõ; điểm khởi đầu của một block tăng cơ.',
    },
    {
      en: 'MAV (Maximum Adaptive Volume)',
      vi: 'Volume thích ứng tối đa',
      def: 'Vùng volume cho lợi ích lớn nhất mà vẫn hồi phục; cần theo dõi hiệu suất từng tuần.',
    },
    {
      en: 'MRV (Maximum Recoverable Volume)',
      vi: 'Volume hồi phục tối đa',
      def: 'Trần cá nhân; vượt qua sẽ tích mệt, hiệu suất giảm, đau khớp tăng — cần deload.',
    },
    {
      en: 'RPE (Rating of Perceived Exertion)',
      vi: 'Mức nỗ cảm nhận',
      def: 'Thang 1–10 cho biết set khó đến đâu; RPE 10 = không còn rep đúng form.',
    },
    {
      en: 'RIR (Repetitions in Reserve)',
      vi: 'Số rep còn dư',
      def: 'Số rep có thể làm thêm trước failure; RIR 1–3 là vùng làm việc chính cho hypertrophy.',
    },
  ],
  images: [],
  quiz: [
    {
      q: 'MV, MEV, MAV, MRV khác nhau ở điểm cốt lõi nào?',
      choices: [
        'Là bốn tên gọi của cùng một mức volume',
        'Là bốn mốc từ duy trì → bắt đầu tiến bộ → vùng tối ưu → trần hồi phục của từng cá nhân',
        'Chỉ dùng cho vận động viên chuyên nghiệp',
        'Là số set cố định cho mọi người',
      ],
      answer: 1,
      explain:
        'Đây là khung thực hành để cá nhân hoá volume, không phải số cố định; mỗi người có dải MEV/MAV/MRV riêng.',
    },
    {
      q: 'Khách tăng từ 14 lên 16 set/nhóm, sau 2 tuần rep giảm, RPE tăng, đau khớp xuất hiện. Đọc thế nào?',
      choices: [
        'Còn dưới MEV, tăng tiếp 4 set',
        'Có thể đã chạm/vượt MRV — deload 1 tuần, giảm 40–50% volume rồi quay lại 80–90%',
        'Đổi sang tập failure mọi set',
        'Bỏ hết bài compound',
      ],
      answer: 1,
      explain:
        'Hiệu suất giảm + RPE/đau khớp tăng là tín hiệu vượt trần hồi phục; deload là phanh, không phải thất bại.',
    },
    {
      q: 'RPE 8 tương ứng với bao nhiêu RIR?',
      choices: ['0 rep', '1 rep', '2 rep', '4 rep'],
      answer: 2,
      explain:
        'RPE 8 = còn 2 rep trước failure kỹ thuật. Đây là vùng làm việc phổ biến cho phần lớn set hypertrophy.',
    },
    {
      q: 'Khi nào nên tăng tạ theo RIR?',
      choices: [
        'Mỗi buổi, bất kể cảm giác',
        'Đạt cận trên rep range với RIR ≥ 2 ở 2 buổi liên tiếp',
        'Khi RPE 10 ở set đầu',
        'Khi đau cơ nhiều',
      ],
      answer: 1,
      explain:
        'Progression dựa trên hiệu suất lặp lại: đạt rep mục tiêu mà vẫn còn dư 2 rep trong 2 buổi là tín hiệu tăng tải.',
    },
    {
      q: 'Khách mới tập 2 tuần, bạn có nên dùng RPE/RIR làm công cụ chính?',
      choices: [
        'Có, ngay lập tức',
        'Không vội — dạy cảm giác gần failure trước, vì người mới thường ước RIR cao hơn thực tế',
        'Chỉ dùng RPE 10',
        'Không cần log gì',
      ],
      answer: 1,
      explain:
        'Người mới chưa hiệu chuẩn được cảm giác nỗ lực; 2–4 tuần đầu nên dùng tạ/rep và video form làm chính.',
    },
    {
      q: 'Sau deload, nên quay lại volume thế nào?',
      choices: [
        'Quay lại 100% ngay lập tức',
        'Khoảng 80–90% volume đỉnh trước deload, rồi tăng dần lại',
        'Bắt đầu lại từ 2 set',
        'Bỏ volume, chỉ tập 1RM',
      ],
      answer: 1,
      explain:
        'Deload giữ nền; quay lại 80–90% giúp tiếp tục tiến bộ mà không rơi ngay vào quá tải.',
    },
  ],
  related: {
    muscles: ['quadriceps', 'pectoralis-major', 'latissimus-dorsi', 'gluteus-maximus'],
    exercises: ['barbell-back-squat', 'barbell-bench-press', 'pull-up', 'romanian-deadlift'],
    calculators: ['volume', 'tonnage', 'one-rm'],
    conditions: [],
    evidence: ['E1', 'E4', 'E6', 'E8'],
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
    {
      label: 'Currier et al. 2026 — ACSM position stand resistance training (S5)',
      url: 'https://doi.org/10.1249/MSS.0000000000003897',
      license: 'cite-only',
    },
    {
      label: 'Zourdos et al. 2016 — RPE/RIR scale validation (S39)',
      url: 'https://doi.org/10.1519/JSC.0000000000001049',
      license: 'cite-only',
    },
  ],
};
