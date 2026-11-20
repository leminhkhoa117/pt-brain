/**
 * Nước & hydration cho người tập.
 *
 * Nguồn: ACSM position stand — Exercise and fluid replacement (cite-only),
 * bài Điều hòa nhiệt của module Sinh lý.
 */
export default {
  slug: 'nutr-3-1',
  module: 'nutr',
  chapter: 3,
  chapterTitle: 'Nước & micronutrients',
  order: 1,
  title: 'Nước và hydration: chỉ dẫn "theo khát" và ranh giới hai phía',
  subtitle:
    'Mất ~2% cân nặng nước đã giảm hiệu suất — nhưng uống "càng nhiều càng tốt" cũng có rủi ro riêng; bài này dựng kế hoạch theo độ dài buổi tập.',
  minutes: 10,
  objectives: [
    'Nêu hậu quả của mất nước ~2% cân nặng lên hiệu suất và cảm giác gắng.',
    'Dựng kế hoạch uống cho 3 độ dài buổi: dưới 60 phút, 60–90 phút, và dài/nóng.',
    'Giải thích vai trò natri và khi nào cần đồ uống điện giải thay vì nước lọc.',
    'Nhận biết cảnh báo bệnh nhiệt và cảnh báo uống quá mức (hyponatremia).',
  ],
  sections: [
    {
      heading: 'Vì sao nước là "vấn đề" của người tập',
      body: `Mồ hôi là cơ chế làm mát chính (bài Điều hòa nhiệt): mỗi lít bay hơi mang ~580 kcal nhiệt ra ngoài. Chi phí của việc mát là **mất nước + muối**:

- Mất ~**2% cân nặng** nước: hiệu suất cardio giảm, RPE tăng, tập nặng thấy vất hơn.
- Mất 3%+: rõ rệt về sức mạnh, chú ý, và cảm giác nóng nực.

Điểm dễ bỏ qua: khách "không thấy khát" vẫn có thể đang mất 1–2% — cảm giác khát trễ so với nhu cầu trong vận động mạnh, nên **chủ động có nước bên cạnh** là quy tắc số không.`,
    },
    {
      heading: 'Kế hoạch theo độ dài buổi tập',
      body: `**Buổi dưới ~60 phút (đa số khách phòng gym)**: uống **theo cơn khát** với nước sẵn sàng bên cạnh — cơ thể tự điều khá tốt ở khung này. Chỉ cần xuất phát **euhydrated**: uống nước đều trong ngày (~2–3 lít tổng cho người phổ thông, thêm nếu nóng).

**Buổi 60–90 phút hoặc nóng**: chủ động ~**0,4–0,8 L/giờ** (theo mồ hôi), chia từng hớp. Nếu đổ mồ hôi mặn (vết muối khô trên áo) hoặc ăn nhạt — thêm **natri** trong đồ uống (viên điện giải pha, hoặc nước + chút muối + chanh).

**Buổi > 90 phút / thi đấu dài**: carbohydrate **30–60 g/giờ** cùng dịch + natri (đồ uống thể thao đúng nồng độ, không phải nước có đường 15%) — kết hợp nhu cầu nhiên liệu của bài Carb.

**Sau buổi**: bù ~**150% lượng giảm cân** trong vài giờ (giảm 0,7 kg → uống ~1 L dần). Kiểm tra màu nước tiểu nhạt vàng là chỉ báo rẻ nhất.`,
    },
    {
      heading: 'Hai phía rủi ro ít ai nói đủ',
      body: `**Bệnh nhiệt** (mất nước + nóng): đau đầu, buồn nôn, ngừng đổ mồ hôi, lú lẫn — dừng ngay, vào chỗ mát, làm mát cơ thể (bài Điều hòa nhiệt đã có red flags).

**Uống quá mức (hyponatremia)**: uống nhiều nước lọc hơn mồ hôi mất làm natri máu pha loãng — đau đầu, buồn nôn, lú lẫn trông giống say nóng, nhưng điều trị ngược lại. Kịch bản thường gặp: chạy đường dài uống "chừng mỗi km một ly lọc" mà không có muối.

Cả hai đỉnh có cùng một giải pháp ở giữa: **uống theo khát + chất điện giải khi buổi dài**, và quan sát khách thay vì cào cào một con số cứng cho mọi người.`,
    },
  ],
  applyBox: `**Gian tập thực hành — "thử mồ hôi" cho khách (một buổi):**
1. Cân nhẹ đồ trước buổi (không giày, cùng trang phục) và sau buổi — chênh lệch = mồ hôi.
2. Ghi: loại buổi, nhiệt độ, thời gian, lượng đã uống. Mồ hôi/giờ = (chênh lệch + nước uống) / giờ.
3. Đặt kế hoạch buổi tương tự: uống ~80–100% tốc độ mồ hôi, kèm natri nếu > 1 L/giờ hoặc vết muối trên áo.
4. Kiểm báo cáo: nước tiểu nhạt sáng hôm sau = phục hồi dịch đủ`,
  safetyBox:
    'Khách có bệnh thận, tim, đang dùng thuốc lợi tiểu, hoặc các dermatologic/trời nóng đặc biệt: hỏi bác sĩ về mức dịch và natri phù hợp trước khi áp kế hoạch uống chuẩn.',
  terms: [
    {
      en: 'Euhydration',
      vi: 'Trạng thái nước cân',
      def: 'Mức nước cơ thể "đủ dùng" — xuất phát điểm mong muốn trước buổi tập, chứ không phải đích "uống thật nhiều".',
    },
    {
      en: 'Sweat rate',
      vi: 'Tốc độ mồ hôi',
      def: 'Lít mồ hôi mỗi giờ, đo bằng cân trước/sau buổi — con số cá nhân hoá mọi kế hoạch uống.',
    },
    {
      en: 'Sodium (electrolyte)',
      vi: 'Natri (điện giải)',
      def: 'Muối chính mất theo mồ hôi; cần bù khi buổi dài/nóng hoặc mồ hôi mặn — kịch bản nước lọc thuần có thể pha loãng natri máu.',
    },
    {
      en: 'Hyponatremia',
      vi: 'Thiếu natri máu',
      def: 'Uống nước lọc vượt quá mức mất → natri máu loãng: đau đầu, buồn nôn, lú lẫn — nguy hiểm và dễ nhầm với say nóng.',
    },
    {
      en: 'Fluid replacement 150%',
      vi: 'Bù dịch 150%',
      def: 'Sau buổi, uống dần ~1,5 lần lượng cân nặng đã mất để hồi trọn trạng thái nước.',
    },
  ],
  images: [],
  quiz: [
    {
      q: 'Mất ~2% cân nặng nước ảnh hưởng thế nào tới hiệu suất?',
      choices: [
        'Không ảnh hưởng gì',
        'Cardio giảm hiệu suất, RPE tăng, tập nặng thấy vất hơn rõ',
        'Chỉ ảnh hưởng khách chuyên nghiệp',
        'Giúp chạy nhanh hơn',
      ],
      answer: 1,
      explain:
        'Ngưỡng 2% là mốc được nhiều nghiên cứu ghi nhận — với khách phổ thông, nó biểu hiện là "buổi tập nặng hơn hẳn" mà không rõ vì sao.',
    },
    {
      q: 'Buổi dưới 60 phút, chiến lược uống hợp lý nhất là gì?',
      choices: [
        'Không uống gì để "rèn ý chí"',
        'Uống theo cơn khát với nước sẵn bên cạnh, xuất phát đủ nước từ trong ngày',
        'Uống 3 lít trước 30 phút',
        'Chỉ uống nếu chóng mặt',
      ],
      answer: 1,
 explain:
        'Khung ngắn này cơ thể tự điều tốt qua khát — điều kiện duy nhất là nước phải "sẵn tay", không phải "đi tìm".',
    },
    {
      q: 'Vì sao buổi > 90 phút cần natri cùng nước?',
      choices: [
        'Cho vị ngon hơn',
        'Mồ hôi mất muối — thay bằng nước lọc thuần có thể pha loãng natri máu (hyponatremia)',
        'Natri đốt mỡ',
        'Chỉ cần với khách ăn mặn',
      ],
      answer: 1,
      explain:
        'Hyponatremia là rủi ro thật của "uống càng nhiều càng tốt" ở buổi dài — bù muối giữ nồng độ máu ổn.',
    },
    {
      q: 'Cách "đo thử mồ hôi" của khách đo bằng gì?',
      choices: [
        'Nhìn áo ướt chỗ nào',
        'Cân cùng trang phục trước và sau buổi; chênh lệch (+ nước đã uống) chia giờ = tốc độ mồ hôi',
        'Đếm số lần lau mặt',
        'Không đo được',
      ],
      answer: 1,
      explain:
        'Một lần cân trước/sau cho con số cá nhân hoá — kế hoạch uống từ đó không còn là phỏng đoán.',
    },
    {
      q: 'Chỉ báo phục hồi dịch rẻ nhất sau buổi dài là gì?',
      choices: [
        'Cân nặng đúng bằng hôm trước',
        'Màu nước tiểu nhạt vàng + cân về gần mức xuất phát',
        'Không khát là đủ mọi trường hợp',
        'Da khô ráo',
      ],
      answer: 1,
      explain:
        'Nước tiểu nhạt + cân phục hồi là bộ đôi chỉ báo miễn phí tin được cho đa số khách.',
    },
  ],
  related: {
    muscles: [],
    exercises: [],
    calculators: ['tdee'],
    conditions: ['hypertension'],
    evidence: [],
  },
  sources: [
    {
      label: 'Sawka et al. 2007 — ACSM position stand: Exercise and fluid replacement',
      url: 'https://doi.org/10.1249/mss.0b013e31812ca597',
      license: 'cite-only',
    },
    {
      label: 'OpenStax Anatomy & Physiology — Water balance & electrolytes',
      url: 'https://openstax.org/books/anatomy-and-physiology/pages/26-3-water-balance',
      license: 'CC BY-NC-SA 4.0 (cite-only)',
    },
  ],
};
