/**
 * Micronutrients cho người tập: vitamin, khoáng chất và tín hiệu thiếu hụt.
 *
 * Nguồn: ACSM/AND nutrition position stand (cite-only),
 * bài VO2max & Hệ năng lượng của app.
 */
export default {
  slug: 'nutr-3-2',
  module: 'nutr',
  chapter: 3,
  chapterTitle: 'Nước & micronutrients',
  order: 2,
  title: 'Micronutrients: năm cái tên PT cần biết và quy tắc "thực phẩm trước"',
  subtitle:
    'Vitamin D, sắt, canxi, magie, kẽm — ai hay thiếu, dấu hiệu là gì, và vì sao multivitamin không phải vé số trúng thưởng.',
  minutes: 11,
  objectives: [
    'Nêu vai trò và nguồn của 5 micronutrients liên quan trực tiếp tới người tập: vitamin D, sắt, canxi, magie, kẽm.',
    'Giải thích quy tắc "thực phẩm đa dạng trước, bổ sung chọn lọc sau".',
    'Nhận diện dấu hiệu thiếu thường gặp và khi nào cần xét nghiệm thay vì tự bổ liều cao.',
    'Nhận biết tín hiệu năng lượng thấp kéo dài (RED-S nhẹ) và chuyển hướng đúng.',
  ],
  sections: [
    {
      heading: 'Năm cái tên đáng học thuộc',
      body: `| Chất | Vai trò với người tập | Nguồn tiêu biểu | Ai hay thiếu |
| --- | --- | --- | --- |
| **Vitamin D** | Xương, chức năng cơ, miễn dịch | Nắng, cá béo, trứng, bổ sung khi ít nắng | Nội trợ, ít ra ngoài |
| **Sắt** | Vận chuyển oxy (hemoglobin), năng lượng aerobic | Thịt đỏ, gan, đậu, rau xanh đậm | Nữ chạy bộ, ăn chay, mất kinh nguyệt nhiều |
| **Canxi** | Xương, co cơ | Sữa, đậu hũ, cá nhỏ ăn xương | Không uống sữa, cắt dairy |
| **Magie** | Chuyển hoá năng lượng, giấc ngủ, cramp | Hạt, rau xanh, chocolate đen | Ăn chế độ tinh luyện nhiều |
| **Kẽm** | Miễn dịch, hồi phục | Hải sản, thịt, hạt | Ăn chay, calo cắt sâu |

Bảng này không để "học thuộc liều" — để bạn **hỏi đúng câu**: khách không uống sữa → canxi từ đâu? Nữ chạy bộ mệt xanh → đã kiểm tra sắt chưa?`,
    },
    {
      heading: 'Quy tắc "thực phẩm trước"',
      body: `Multivitamin trông như "bảo hiểm" rẻ, nhưng bằng chứng cho thấy nó **không thay được chế độ ăn đa dạng**: các nghiên cứu trên quần thể ăn đủ calo hầu như không thấy lợi ích rõ, và một số antioxidant liều cao (C, E) thậm chí có thể **làm mờ thích ứng** của tập luyện.

Thứ tự ưu tiên đúng:

1. **Đa dạng thực phẩm**: đĩa nhiều màu, protein đổi nguồn mỗi tuần, cá 2 bữa — phủ phần lớn bảng trên tự nhiên.
2. **Chỉ bổ chọn lọc cái thiếu**: vitamin D nếu ít nắng (rất phổ biến); sắt CHỈ khi xét nghiệm xác nhận thiếu — tự bổ sắt liều cao khi không thiếu vừa vô ích vừa hại dạ dày.
3. **Creatine là ngoại lệ** về "chọn lọc" — bằng chứng mạnh riêng (bài Supplement hạng A).`,
    },
    {
      heading: 'Dấu hiệu nên kiểm tra, không nên đoán',
      body: `Điều PT ghi nhận được (không chẩn đoán — nhưng đủ để gợi ý khách đi xét nghiệm):

- **Mệt aerobic kéo dài** dù ngủ/ăn ổn + da xanh, dễ hoa mắt: gợi ý thiếu sắt — xét nghiệm máu chứ không tự uống viên.
- **Đau nhức xương/khó chịu cơ kéo dài** mùa ít nắng: kiểm tra vitamin D.
- **Chuột rút lặp lại** nhiều buổi + ăn chế độ tinh luyện: xem magie + tổng trạng thái nước (bài Nước & hydration).
- **Ăn chay dài hạn**: B12 (không có trong thực phẩm thực vật) + sắt + kẽm — nên có kế hoạch hoặc kiểm tra định kỳ.

Vị trí của bạn: **người thấy pattern và hướng khách đi đo** — kết quả số mới quyết định có bổ hay không, và bổ bao nhiêu.`,
    },
    {
      heading: 'Khi năng lượng thấp thành "bệnh của deficit"',
      body: `Một dạng thiếu "vô hình" không nằm trong viên thuốc: **năng lượng vào quá thấp so với chi tiêu kéo dài** — có tên RED-S (relative energy deficiency in sport). Chuỗi hệ quả: nội tiết rối (mất kinh nguyệt là dấu hiệu phổ biến nhất), xương yếu, miễn dịch xuống, hiệu suất rơi dù khách "ăn rất sạch".

Ba tín hiệu cảnh báo ở khách đang giảm mỡ hoặc ăn kéo dài thiếu calo:

1. Mất kinh nguyệt ≥ 3 tháng (nữ) — red flag nội tiết, không phải "bình thường khi ăn kiêng".
2. Nhiệt độ cảm nhận lạnh cấu trúc (luôn rét), tóc gãy rụng nhiều, hồi phục chậm bất thường.
3. Hiệu suất giảm liên tục dù volume ổn.

Việc đúng: tăng năng lượng về mức cân bằng tạm thời (diet break — bài Refeed) và phối hợp bác sĩ nếu dấu hiệu kéo dài. Giáo án đẹp mà năng lượng thiếu thì mọi module trước của khoá này đều mất tác dụng.`,
    },
  ],
  applyBox: `**Gian tập thực hành — checklist 5 câu cho mọi khách mới:**
1. Uống sữa/ăn dairy không? (canxi) — không → gợi ý nguồn thay (đậu hũ, cá nhỏ, sữa hạt có bổ sung).
2. Ra nắng bao lâu mỗi ngày? (vitamin D) — nội trợ/nắng ít → gợi ý kiểm tra hoặc bổ theo hướng dẫn y tế.
3. Nữ + chạy bộ + mệt kéo dài? → gợi ý xét nghiệm sắt trước mọi "thêm bài cardio".
4. Ăn chay? → bàn B12 + sắt + kẽm có kế hoạch (hoặc kiểm tra).
5. Mất kinh nguyệt nếu đang cắt calo? → tăng năng lượng tạm + bác sĩ — dừng giảm deeper.`,
  safetyBox:
    'PT không kê vitamin/mineral liều cao. Mọi dấu hiệu thiếu kéo dài nên được xác nhận bằng xét nghiệm trước khi bổ sung — đặc biệt sắt và vitamin D.',
  terms: [
    {
      en: 'Micronutrient',
      vi: 'Vi lượng',
      def: 'Vitamin và khoáng chất cần lượng nhỏ nhưng điều khiển các bước chuyển hoá then chốt.',
    },
    {
      en: 'Iron deficiency',
      vi: 'Thiếu sắt',
      def: 'Hemoglobin thấp → oxy vận chuyển kém: mệt aerobic, hoa mắt — phổ biến ở nữ chạy bộ; xác nhận bằng xét nghiệm.',
    },
    {
      en: 'Vitamin D',
      vi: 'Vitamin D',
      def: 'Tổng hợp qua da dưới nắng; liên quan xương và chức năng cơ — nhóm ít nắng thường cần kiểm tra/bổ chọn lọc.',
    },
    {
      en: 'RED-S',
      vi: 'Thiếu năng lượng tương đối trong thể thao',
      def: 'Năng lượng vào quá thấp kéo dài: nội tiết rối (mất kinh nguyệt), xương yếu, miễn dịch và hiệu suất giảm.',
    },
    {
      en: 'Food-first principle',
      vi: 'Nguyên tắc thực phẩm trước',
      def: 'Đa dạng thực phẩm phủ nhu cầu trước; supplement chỉ chọn lọc cái thiếu đã xác nhận.',
    },
  ],
  images: [],
  quiz: [
    {
      q: 'Vitamin D liên quan trực tiếp tới điều gì của người tập?',
      choices: [
        'Chỉ màu da',
        'Xương, chức năng cơ và miễn dịch — nhóm ít nắng thường cần kiểm tra',
        'Đốt mỡ ban đêm',
        'Chỉ liên quan thị lực',
      ],
      answer: 1,
      explain:
        'Ít nắng là "dễ thiếu" phổ biến nhất ở khách nội trợ; kiểm tra rồi mới quyết định bổ liều.',
    },
    {
      q: 'Vì sao multivitamin không phải "vé bảo hiểm" như quảng cáo?',
      choices: [
        'Vì quá đắt',
        'Vì quần thể ăn đủ calo đa dạng hầu như không rõ lợi ích, và antioxidant liều cao có thể làm mờ thích ứng tập luyện',
        'Vì cơ thể không hấp thu gì',
        'Vì chỉ dành cho trẻ em',
      ],
      answer: 1,
      explain:
        'Bằng chứng ủng hộ "food-first": đa dạng thực phẩm là nền; bổ sung chọn lọc cái thiếu đã xác nhận.',
    },
    {
      q: 'Nữ khách chạy bộ, mệt aerobic kéo dài, da xanh. Hướng hành động đúng của PT?',
      choices: [
        'Thêm 3 buổi cardio nữa',
        'Gợi ý xét nghiệm sắt trước khi tăng tải hoặc tự bổ liều cao',
        'Bỏ cardio vĩnh viễn',
        'Uống viên sắt ngay theo kinh nghiệm',
      ],
      answer: 1,
      explain:
        'Pattern gợi thiếu sắt nhưng cần số xét nghiệm quyết định — vừa đúng chuyên môn vừa an toàn dạ dày.',
    },
    {
      q: 'Mất kinh nguyệt ≥ 3 tháng trong giai đoạn khách cắt calo. Diễn giải đúng?',
      choices: [
        'Bình thường khi ăn kiêng, cứ tiếp tục',
        'Red flag nội tiết — tăng năng lượng về cân bằng tạm và phối hợp bác sĩ, không "cắt sâu hơn"',
        'Do tập tạ',
        'Chỉ thiếu vitamin C',
      ],
      answer: 1,
      explain:
        'Là dấu hiệu RED-S phổ biến nhất: năng lượng vào thiếu kéo dài đã chạm nội tiết — việc đầu tiên là ăn đủ lại, không phải thêm supplement.',
    },
    {
      q: 'Khách ăn chay dài hạn cần bàn tới nhóm nào trước?',
      choices: [
        'Không cần bàn gì',
        'B12 (không có trong thực phẩm thực vật) + sắt + kẽm — có kế hoạch nguồn hoặc kiểm tra định kỳ',
        'Chỉ đạm',
        'Chỉ nước',
      ],
      answer: 1,
      explain:
        'Ba vi lượng này là chỗ "hụt" phổ biến nhất của chế độ thuần thực vật — bàn sớm khỏi mỏi mệt không rõ nguyên nhân.',
    },
  ],
  related: {
    muscles: [],
    exercises: [],
    calculators: ['tdee', 'calories'],
    conditions: [],
    evidence: [],
  },
  sources: [
    {
      label: 'ACSM / Academy of Nutrition and Dietetics — Micronutrients & training',
      url: 'https://www.acsm.org/education-resources/books-and-multimedia-resources',
      license: 'cite-only',
    },
    {
      label: 'Mountjoy et al. 2018 — IOC consensus: RED-S',
      url: 'https://doi.org/10.1136/bjsports-2018-099193',
      license: 'cite-only',
    },
  ],
};
