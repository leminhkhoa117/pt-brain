/**
 * Thoái hoá khớp (osteoarthritis) gối & hông: kháng lực an toàn là thuốc.
 *
 * Nguồn: ACSM Guidelines (cite-only), OARSI guidelines (cite-only),
 * health condition `knee_pain` của PT Brain.
 */
export default {
  slug: 'rehab-4-2',
  module: 'rehab',
  chapter: 4,
  chapterTitle: 'Vùng gối & thoái hoá khớp',
  order: 2,
  title: 'Thoái hoá khớp (osteoarthritis): vận động là thuốc, nghỉ là phản tác dụng',
  subtitle:
    'OA gối/hông là nguyên nhân đau mạn phổ biến nhất tuổi trung-nhiều — và bằng chứng nói thẳng: kháng lực đúng liều là điều trị đầu tiên, trước cả thuốc giảm đau.',
  minutes: 12,
  objectives: [
    'Giải thích vì sao vận động kháng lực là điều trị đầu tiên cho OA (theo hướng dẫn quốc tế).',
    'Chọn bài an toàn cho OA gối/hông: máy có tựa, biên độ kiểm soát, tăng tải từ từ.',
    'Phân biệt đau OA "bình thường khi tập" với tín hiệu cần điều chỉnh.',
    'Ghép giảm mỡ nhẹ + kháng lực cho khách OA thừa cân: 1 kg giảm = 4 kg tải off khớp gối.',
  ],
  sections: [
    {
      heading: 'Paradox OA: khớp "mòn" nhưng cần vận động MORE, không phải LESS',
      body: `Thoái hoá khớp (osteoarthritis) là bệnh khớp phổ biến nhất: sụn mòn, khoảng khớp hẹp, xương cạnh mọc gai, mô viêm nhẹ. Logic thường nói "khớp mòn rồi, đừng vận động nữa" — nhưng bằng chứng từ hàng chục RCT và hướng dẫn quốc tế (OARSI, ACR) nói điều **ngược lại**:

- **Kháng lực đúng liều** cải thiện đau, chức năng và chất lượng sống của OA gối rõ rệt — thường ngang hoặc hơn thuốc giảm đau đơn thuần.
- Cơ quanh khớp mạnh = **giảm tải trực tiếp lên mặt khớp**: quad mạnh "hút" một phần lực mỗi bước đi.
- Sụn không có mạch nuôi nhưng **vận động bơm dịch khớp** nuôi sụn (bài Khớp & hành động khớp) — bất động làm sụn teo nhanh hơn.

Điều kiện "Đau gối / chấn thương gối" trong app đã mã hoá quy tắc: giới hạn gập gối sâu, ưu tiên box squat/leg press biên độ an toàn, tăng tải chậm.`,
    },
    {
      heading: 'Chọn bài cho OA gối',
      body: `| Bài | Vì sao an toàn | Chỉ dẫn |
| --- | --- | --- |
| **Leg press** (máy) | Tựa lưng, kiểm soát biên độ tốt | Bắt đầu nông → sâu dần theo tiêu chí 24h |
| **Box squat cao** | Hạn chế gập sâu, ghế "chặn" an toàn | Xuống ngang ghế, không sâu hơn |
| **Leg extension nhẹ** | Không nén dọc, chỉ quad | Tải vừa, rep 12–15, đau ≤ 3 |
| **Hip thrust** | Không tải nén gối | An toàn tuyệt đối cho OA gối |
| **Đi bộ mặt phẳng** | Dịch khớp nhẹ, bơm nuôi sụn | Bắt đầu 10–15 phút, tăng dần |

**Tránh tạm**: squat sâu, nhảy tiếp đất, chạy dài trên mặt cứng — ba việc đặt tải nén/lặp lớn nhất lên mặt khớp đang hẹp.`,
    },
    {
      heading: 'OA hông: mở ROM trước, tải sau',
      body: `OA hông thường hạn chế **khép vào và xoay trong** trước khi hạn chế gập. Khách squat "chân rộng cho dễ" đôi khi là bản năng tránh ROM hông đang hẹp — không phải lựa chọn kỹ thuật.

Chuỗi cho OA hông:

1. **Mobility không tải**: 90/90 hip switch, hình chữ nhật kéo dãn hông, xoay hông nằm — mỗi buổi 3–5 phút.
2. **Tải trong ROM có sẵn**: leg press với biên độ khách đạt được, hip thrust, kéo cáp qua hông (bài Hông & mông).
3. **Tiến dần**: mỗi 2–4 tuần thử mở biên độ thêm 5–10° khi 24h sạch (bài Tiến trình phục hồi).

OA hông nặng (ROM < 50% bình thường + đêm đau + khập khiễng) → tham khảo bác sĩ về khớp thay; PT vẫn giữ khách mạnh CHỜ đợi và hỗ trợ SAU mổ.`,
    },
    {
      heading: 'Cặp đôi: giảm mỡ + kháng lực cho OA thừa cân',
      body: `Con số đáng nói với khách OA gối thừa cân: **mỗi 1 kg cân giảm = ~4 kg tải off khớp gối mỗi bước đi** (nghiên cứu đo lực khớp). Giảm 5 kg = nhẹ hơn 20 kg cho gối.

Ghép hai việc:

- **Deficit nhẹ** (~10–15%, không gắt — bài Giảm mỡ thực hành) + protein đủ để cơ không mất.
- **2 buổi kháng lực cho quad/glute** (bảng trên) + đi bộ ngắn tăng dần — cardio vừa phải, không chạy.

Kỳ vọng thực tế 12 tuần: đau giảm 30–50%, đi xa hơn, đứng lên ghế nhẹ hơn — báo cáo bằng **bộ ba số**: bước chân, thời gian đi bộ, điểm đau 0–10.`,
    },
  ],
  applyBox: `**Gian tập thực hành — buổi chân cho khách OA gối ổn định:**
1. Leg press nông 3 × 12 (RIR 2–3, đau ≤ 3/10) — sâu dần theo tiêu chí.
2. Hip thrust 3 × 10 — mông gánh, gối không nén.
3. Leg extension nhẹ 2 × 15 — quad co, sụn không nén.
4. Box squat cao (ngang ghế) 2 × 8 khi leg press đã đạt 2 tuần sạch.
5. Đi bộ 15–20 phút mặt phẳng — tăng 5 phút mỗi tuần.`,
  safetyBox:
    'OA có flare-up (đau tăng đột ngột, sưng nóng): giảm tải về mức chỉ đi bộ + isometric quad 5–7 ngày, rồi quay lại từ nấc trước. Đêm đau tăng, locking (khớp kẹt không duỗi được), hoặc sưng to — khám bác sĩ trước khi tiếp tục.',
  terms: [
    {
      en: 'Osteoarthritis (OA)',
      vi: 'Thoái hoá khớp',
      def: 'Bệnh khớp mạn: sụn mòn, khoảng khớp hẹp, xương cạnh mọc gai — phổ biến nhất gối và hông.',
    },
    {
      en: 'Quad strengthening for OA',
      vi: 'Rèn quad cho OA',
      def: 'Cơ đùi trước mạnh "hút" tải off mặt khớp — bằng chứng xếp kháng lực là điều trị đầu tiên.',
    },
    {
      en: 'Joint offloading (1kg = 4kg)',
      vi: 'Giảm tải khớp (1kg = 4kg)',
      def: 'Mỗi 1 kg cân giảm bớt ~4 kg lực trên khớp gối mỗi bước — lý do giảm mỡ là thuốc cho OA.',
    },
    {
      en: 'Flare-up management',
      vi: 'Xử lý đợt đau tăng',
      def: 'OA có đợt tăng đột ngột: giảm về đi bộ + isometric 5–7 ngày, không nghỉ zero, quay từ nấc trước.',
    },
    {
      en: 'ROM-first approach (hip OA)',
      vi: 'Ưu tiên ROM (OA hông)',
      def: 'OA hông hạn chế khép/xoay trước: mở mobility không tải, rồi tải trong ROM có sẵn, tiến dần.',
    },
  ],
  images: [],
  quiz: [
    {
      q: 'Vì sao kháng lực là điều trị ĐẦU TIÊN cho OA gối (trước cả thuốc giảm đau)?',
      choices: [
        'Vì thuốc không có tác dụng',
        'Cơ quad mạnh "hút" tải off mặt khớp + vận động bơm dịch khớp nuôi sụn — bằng chứng RCT rõ rệt',
        'Vì PT không kê được thuốc',
        'Vì kháng lực đốt calo',
      ],
      answer: 1,
      explain:
        'Hướng dẫn quốc tế (OARSI, ACR) xếp exercise therapy là điều trị nền — cơ mạnh giảm tải trực tiếp, dịch khớp nuôi sụn qua vận động.',
    },
    {
      q: 'Mỗi 1 kg cân giảm = bao nhiêu kg lực off khớp gối mỗi bước?',
      choices: ['1 kg', '2 kg', '~4 kg', '10 kg'],
      answer: 2,
      explain:
        'Nghiên cứu đo lực khớp gối cho thấy tỷ lệ ~4:1 — giảm 5 kg = nhẹ hơn ~20 kg cho gối mỗi bước đi cả ngày.',
    },
    {
      q: 'Bài nào AN TOÀN NHẤT cho OA gối đang hơi đau?',
      choices: [
        'Squat sâu tạ đòn',
        'Chạy bộ đường dài',
        'Hip thrust — không nén gối, mông gánh',
        'Nhảy hộp',
      ],
      answer: 2,
      explain:
        'Hip thrust không đặt nén dọc lên mặt khớp gối đang hẹp — vẫn rèn được mông và chuỗi sau cho đi đứng mạnh hơn.',
    },
    {
      q: 'OA gối có "flare-up" (đau tăng, sưng). Xử lý đúng?',
      choices: [
        'Nghỉ tuyệt đối 2 tuần',
        'Giảm về đi bộ + isometric quad 5–7 ngày, rồi quay lại từ nấc trước — không nghỉ zero',
        'Tăng tạ để "vượt qua"',
        'Chỉ dùng thuốc',
      ],
      answer: 1,
      explain:
        'Flare-up là tín hiệu tạm, không phải hỏng thêm — giảm về mức chịu được giữ mô quen vận động, quay lại từ nấc trước khi sạch 24h.',
    },
    {
      q: 'OA hông thường hạn chế hướng ROM nào TRƯỚC?',
      choices: [
        'Gập hông (đưa đùi lên)',
        'Khép vào và xoay trong — khách squat "rộng cho dễ" là đang tránh đúng hướng này',
        'Duỗi hông (đẩy về sau)',
        'Không hạn chế',
      ],
      answer: 1,
      explain:
        'OA hông thu hẹp khép/xoay trước — mở mobility không tải trước, rồi tải trong ROM có sẵn (bài Khớp & hành động khớp).',
    },
  ],
  related: {
    muscles: ['quadriceps', 'gluteus-maximus', 'gluteus-medius', 'adductor-magnus'],
    exercises: ['leg-press', 'hip-thrust', 'leg-extension', 'walking-lunge'],
    calculators: ['tdee', 'calories'],
    conditions: ['knee_pain'],
    evidence: [],
  },
  sources: [
    {
      label: "ACSM's Guidelines — Exercise & osteoarthritis (cite-only)",
      url: 'https://www.acsm.org/education-resources/books-and-multimedia-resources',
      license: 'cite-only',
    },
    {
      label: 'OpenStax Anatomy & Physiology — Synovial joints (cite-only)',
      url: 'https://openstax.org/books/anatomy-and-physiology/pages/9-1-classification-of-joints',
      license: 'CC BY-NC-SA 4.0 (cite-only)',
    },
  ],
};
