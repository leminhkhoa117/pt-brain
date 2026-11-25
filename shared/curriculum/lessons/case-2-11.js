/**
 * Ca 11: không tiến bộ 2–4 tuần — cây quyết định chỉnh giáo án.
 *
 * Tổng hợp các rule đã có ở nutr-1-1, nutr-6-1, nutr-6-2, phys-5-2, phys-6-1,
 * phys-6-2, rehab-1-2; bằng chứng E1/E4/E6/E7/E8 của PT Brain.
 */
export default {
  slug: 'case-2-11',
  module: 'case',
  chapter: 2,
  chapterTitle: 'Ca cụ thể',
  order: 11,
  title: 'Ca 11 — Không tiến bộ 2–4 tuần: kiểm tra gì, đổi gì trước?',
  subtitle:
    'Ba khách cùng "kẹt" nhưng ba nguyên nhân khác nhau. Bài này dạy quy trình chẩn đoán trước khi đổi giáo án, kèm ví dụ số và if-then rule.',
  minutes: 15,
  objectives: [
    'Phân biệt plateau thật với nhiễu đo lường, adherence kém và quá tải.',
    'Chạy cây quyết định 4 bước cho giảm mỡ, tăng cơ và sức mạnh.',
    'Chọn đúng MỘT biến để đổi và biết chờ bao lâu trước khi kết luận.',
    'Nhận diện khi nào cần deload, đổi chương trình hoặc chuyển hướng chuyên gia.',
  ],
  sections: [
    {
      heading: 'Ba ca cùng kẹt, ba nguyên nhân khác nhau',
      body: `**Ca A — Minh, 80 kg, cut 6 tuần:** giảm 3 kg rồi MA7 phẳng 3 tuần. Khách nói "em ăn đúng lắm". Log cuối tuần cho thấy +600–900 kcal thứ Bảy/Chủ nhật; số bước trung bình 6.000, trước đó 9.000.

**Ca B — Tú, 60 kg, beginner, gaining 3 tuần:** cân phẳng, nhưng log chỉ ~2.300 kcal so mục tiêu 2.600; NEAT tăng vì đổi ca làm. Rep tạ vẫn tăng nhẹ.

**Ca C — Hùng, 100 kg, squat 100 kg × 5:** 3 tuần không thêm rep, RPE 9–10, ngủ 5,5 giờ, đau gối 3/10 sau buổi. Khách đòi "đổi giáo án".

Ba ca này **không cùng một plateau**. Nếu xử lý giống nhau — cắt calo/đổi bài/tăng volume — cả ba đều dễ xấu hơn. Việc đầu tiên luôn là **chẩn đoán dữ liệu**, không phải đổi plan.`,
    },
    {
      heading: 'Bước 1 — kiểm tra dữ liệu trước khi đổi bất cứ thứ gì',
      body: `Trước khi gọi là "không tiến bộ", kiểm tra 6 ô:

| Ô | Câu hỏi | Ngưỡng làm việc |
| --- | --- | --- |
| **Thời gian** | Đã đủ 3 tuần (giảm cân) hoặc 3–4 tuần (tăng cơ/sức mạnh) chưa? | Chưa đủ → chờ, đừng đổi |
| **Log** | Có 7 ngày ăn uống/buổi tập đầy đủ, kể cả cuối tuần? | Thiếu → bổ sung trước |
| **Đo** | MA7, vòng bụng, e1RM có cùng điều kiện? | Lệch điều kiện → đo lại |
| **Adherence** | Bao nhiêu % buổi tập, % ngày log, % bước chân mục tiêu? | < 80% → sửa adherence trước |
| **Hồi phục** | Ngủ, đau khớp, RPE, HR nghỉ? | 2–3 tín hiệu xấu → ưu tiên hồi phục |
| **Kỳ vọng** | Tốc độ mục tiêu có thực tế với training age/nền mỡ? | Sai kỳ vọng → đặt lại mốc |

Nếu 2 ô đầu chưa đạt, "plateau" chỉ là **dữ liệu chưa đủ**. Đây là lý do nhiều khách bị đổi plan quá sớm: tuần đầu giảm nước, tuần sau giữ nước, tuần thứ ba mới là trend.`,
    },
    {
      heading: 'Bước 2 — cây quyết định theo mục tiêu',
      body: `**Giảm mỡ (3 tuần MA7 phẳng, log đủ):**

1. Adherence < 80% hoặc cuối tuần vượt nhiều → sửa log/bữa cuối tuần, giữ calo.
2. Adherence tốt, ngủ ổn → +2.000–3.000 bước/ngày hoặc 1 buổi Zone 2 20–30 phút.
3. Vẫn phẳng sau 10–14 ngày → −200–300 kcal; giữ protein 1,6–2,2 g/kg.
4. Mệt/ngủ kém/RPE tăng → diet break 5–7 ngày, không cắt sâu.

**Tăng cơ (3–4 tuần cân phẳng):**

1. Log thiếu hoặc NEAT tăng → +200–300 kcal hoặc giảm 1 buổi cardio.
2. Rep/e1RM tăng, eo ổn → có thể đang recomp; **không thêm calo**, tiếp tục 2 tuần.
3. Rep phẳng, eo tăng nhanh hơn lực → dừng surplus, maintain 2–3 tuần rồi đánh giá.
4. Ngủ < 6,5 giờ hoặc volume quá cao → sửa hồi phục trước khi thêm calo.

**Sức mạnh (3 tuần không thêm rep):**

1. Ngủ/ăn/calo kém → sửa nền trước; không đổi bài.
2. RPE 9–10, đau khớp, HR nghỉ tăng → deload 1 tuần (volume −40–50%, tạ trung bình).
3. RPE bình thường, kỹ thuật ổn → +1 set/nhóm hoặc đổi bài cùng pattern.
4. Đau > 3/10 hoặc đau > 24 giờ → giảm tải/đổi bài theo module rehab.

**Đau/rehab (4–6 tuần không tiến):**

- Đau flare > 24 giờ → giảm 20–30% tải hoặc lùi 1 bước.
- Đúng bài, đúng liều 4–6 tuần vẫn không tiến → chuyển hướng chuyên gia.`,
    },
    {
      heading: 'Bước 3 — chọn một biến, chờ 10–14 ngày, đánh giá',
      body: `**Ca A — Minh:** không cắt calo. Tuần 1: sửa bữa cuối tuần + đặt mục tiêu 8.000 bước/ngày; tuần 2–3: đọc MA7. Nếu vẫn phẳng mới −100 kcal. Kỳ vọng: 0,4–0,6 kg/tuần.

**Ca B — Tú:** tăng +150 kcal (ưu tiên carb) và giữ volume; kiểm tra lại sau 2–3 tuần. Nếu rep vẫn tăng, cân phẳng, eo ổn → recomp, không cần surplus lớn.

**Ca C — Hùng:** deload 1 tuần (3 set/bài thay vì 5, tạ −10–20%), ngủ 7–8 giờ; tuần sau quay lại 80–90% volume. Nếu đau gối vẫn > 3/10 → đổi bài/đánh giá rehab, không thêm volume.

**Quy tắc chung:** mỗi lần **một biến**, chờ **10–14 ngày** (giảm cân) hoặc **2–3 tuần** (tăng cơ/sức mạnh), rồi mới kết luận. Đổi 3 thứ cùng lúc = không biết thứ nào có công, và nếu xấu đi cũng không biết lùi cái nào.`,
    },
    {
      heading: 'Khi nào deload, đổi chương trình hay chuyển hướng?',
      body: `**Deload khi:** hiệu suất giảm 2 tuần + RPE tăng + đau khớp/ngủ xấu; hoặc sau 4–8 tuần tăng tải liên tục. Cách làm: volume −40–50%, giữ tạ trung bình, 1 tuần.

**Đổi chương trình khi:** đã deload và quay lại 2–3 tuần vẫn phẳng; hoặc bài hiện tại không còn phù hợp mục tiêu/thiết bị/đau. Đổi **pattern/bài**, không đổi toàn bộ cùng lúc.

**Chuyển hướng chuyên gia khi:**

- Đau > 3/10 kéo dài, đau đêm, tê/yếu chi, sưng nóng đỏ.
- Sụt cân không chủ ý, rối loạn kinh nguyệt, rụng tóc, ớn lạnh kéo dài.
- Huyết áp ≥ 160/100, đau ngực, ngất khi gắng.
- Rối loạn ăn/hành vi ăn lệch.

PT giỏi không phải người "chỉnh mãi không thôi" — mà là người biết **khi nào không chỉnh**, khi nào deload, và khi nào chuyển.`,
    },
  ],
  applyBox: `**Gian tập thực hành — audit 4 tuần cho một khách đang kẹt:**
1. Tuần 0: thu 7 ngày log ăn/tập, MA7, vòng bụng, e1RM, số bước, giấc ngủ; tính % adherence.
2. Tuần 0: chọn mục tiêu chính (giảm mỡ/tăng cơ/sức mạnh/rehab) và viết "nếu–thì" theo cây quyết định.
3. Tuần 1: chỉ đổi MỘT biến (adherence, bước chân, calo, volume hoặc deload).
4. Tuần 2–3: giữ nguyên, đọc lại 4 dữ kiện; không đổi thêm vì một buổi xấu.
5. Tuần 4: kết luận bằng dữ liệu — giữ, đổi biến tiếp theo, deload hay chuyển hướng.`,
  safetyBox:
    'Bài này là quy trình huấn luyện, không phải chẩn đoán y tế. Đau tăng, tê/yếu chi, đau ngực/ngất, huyết áp rất cao, sụt cân không chủ ý hoặc dấu hiệu rối loạn ăn là red flag — dừng và chuyển hướng chuyên gia thay vì tự chỉnh tiếp.',
  terms: [
    {
      en: 'Plateau (training)',
      vi: 'Điểm phẳng',
      def: 'Không tiến bộ trong 3 tuần (giảm cân) hoặc 3–4 tuần (tăng cơ/sức mạnh) sau khi đã kiểm tra dữ liệu và adherence.',
    },
    {
      en: 'Adherence audit',
      vi: 'Kiểm tra tuân thủ',
      def: 'Đo % buổi tập, % ngày log, % bước chân/protein đạt mục tiêu — bước 0 trước khi đổi giáo án.',
    },
    {
      en: 'e1RM',
      vi: '1RM ước lượng',
      def: 'Sức mạnh ước tính từ set 3–8 rep; dùng cùng bài/kỹ thuật, dao động 2–3% là nhiễu.',
    },
    {
      en: 'Deload',
      vi: 'Tuần giảm tải',
      def: 'Giảm 40–50% volume, giữ tạ trung bình 1 tuần khi có tín hiệu quá tải — phanh có chủ đích.',
    },
    {
      en: 'Minimum detectable change',
      vi: 'Ngưỡng thay đổi đáng kể',
      def: 'Mức thay đổi vượt nhiễu đo lường mới đáng kết luận; với cân là trend 2–4 tuần, với e1RM ~2–3%.',
    },
    {
      en: 'Recomp',
      vi: 'Tái bố cục cơ thể',
      def: 'Tăng cơ/giảm mỡ cùng lúc ở beginner hoặc nền mỡ cao; cân có thể phẳng nhưng lực/eo vẫn cải thiện.',
    },
  ],
  images: [],
  quiz: [
    {
      q: 'Khách cut 3 tuần MA7 phẳng, log ăn thiếu cuối tuần, bước chân giảm. Việc đầu tiên?',
      choices: [
        'Cắt 500 kcal',
        'Sửa log/bữa cuối tuần và tăng bước chân, chưa cắt calo',
        'Đổi sang bulk',
        'Bỏ theo dõi',
      ],
      answer: 1,
      explain:
        'Adherence là tầng đầu của plateau; cắt calo khi log thiếu chỉ làm khách mệt hơn mà không biết nguyên nhân.',
    },
    {
      q: 'Khách gaining 3–4 tuần cân phẳng, rep tăng đều, eo ổn. Nên làm gì?',
      choices: [
        'Tăng ngay 500 kcal',
        'Có thể đang recomp — giữ calo, tiếp tục 2 tuần và theo dõi e1RM/eo',
        'Cắt 300 kcal',
        'Đổi toàn bộ bài',
      ],
      answer: 1,
      explain:
        'Cân phẳng nhưng lực tăng/eo ổn là tín hiệu recomp; thêm calo lúc này chỉ tăng mỡ.',
    },
    {
      q: 'Squat 3 tuần không thêm rep, RPE 9–10, ngủ 5,5 giờ, đau gối 3/10. Ưu tiên nào đúng?',
      choices: [
        'Thêm 4 set squat',
        'Deload 1 tuần, sửa ngủ, rồi quay lại 80–90% volume; đau kéo dài thì đánh giá rehab',
        'Đổi sang tập failure mọi set',
        'Tăng 10 kg để "phá kỷ lục"',
      ],
      answer: 1,
      explain:
        'Hiệu suất giảm + RPE/đau tăng là tín hiệu vượt trần hồi phục; thêm volume lúc này chỉ sâu hơn.',
    },
    {
      q: 'Sau khi deload và quay lại 2–3 tuần vẫn phẳng, bước tiếp theo hợp lý?',
      choices: [
        'Deload tiếp 4 tuần',
        'Đổi một biến chương trình (bài/pattern/volume) và đánh giá lại, không đổi tất cả cùng lúc',
        'Bỏ tập',
        'Cắt calo 50%',
      ],
      answer: 1,
      explain:
        'Deload không chữa được chương trình sai; sau khi hồi phục, đổi một biến có mục tiêu rồi đo lại.',
    },
    {
      q: 'Dấu hiệu nào buộc chuyển hướng chuyên gia thay vì tự chỉnh?',
      choices: [
        'Cân phẳng 2 tuần',
        'Đau tăng > 24 giờ, tê/yếu chi, đau ngực/ngất, huyết áp ≥ 160/100',
        'Khách chưa thích bài mới',
        'Rep không tăng tuần này',
      ],
      answer: 1,
      explain:
        'Đây là red flags cần y tế; PT không chẩn đoán và không nên "thử thêm một block" khi có dấu hiệu này.',
    },
    {
      q: 'Vì sao chỉ nên đổi một biến mỗi 10–14 ngày?',
      choices: [
        'Để khách khỏi phàn nàn',
        'Để biết biến nào có công và có thể lùi đúng cái gây hại; đổi nhiều thứ cùng lúc làm mất dữ liệu',
        'Vì app không cho đổi nhiều',
        'Vì volume không quan trọng',
      ],
      answer: 1,
      explain:
        'Đây là nguyên tắc chẩn đoán: một biến, một khoảng chờ, một kết luận. Đổi cả plan là cách che mất nguyên nhân.',
    },
  ],
  related: {
    muscles: ['quadriceps', 'gluteus-maximus', 'pectoralis-major', 'latissimus-dorsi'],
    exercises: ['barbell-back-squat', 'barbell-bench-press', 'romanian-deadlift'],
    calculators: ['tdee', 'calories', 'one-rm', 'volume'],
    conditions: [],
    evidence: ['E1', 'E4', 'E6', 'E7', 'E8'],
  },
  sources: [
    {
      label: 'Helms et al. 2014 — Contest preparation (E7, đã kiểm chứng)',
      url: 'https://doi.org/10.1186/1550-2783-11-20',
      license: 'CC BY 4.0',
    },
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
      label: 'Burke et al. 2011 — Self-monitoring in weight loss (systematic review)',
      url: 'https://doi.org/10.1016/j.jada.2010.10.008',
      license: 'cite-only',
    },
    {
      label: 'Coleman et al. 2024 — One-week deload during supervised resistance training (RCT)',
      url: 'https://doi.org/10.7717/peerj.16777',
      license: 'CC BY 4.0',
    },
  ],
};
