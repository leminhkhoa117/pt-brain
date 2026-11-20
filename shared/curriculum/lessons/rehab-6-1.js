/**
 * Khoa học về đau và red flags — ranh giới chuyển hướng khách.
 *
 * Nguồn: Raja et al. 2020 — Revised IASP definition of pain (Pain
 * 161(9):1976-82, PMC7680716, đã kiểm chứng nguyên văn), Moseley &
 * Butler — Explain Pain (cite-only).
 */
export default {
  slug: 'rehab-6-1',
  module: 'rehab',
  chapter: 6,
  chapterTitle: 'Khoa học về đau & red flags',
  order: 1,
  title: 'Khoa học về đau và red flags: khi nào PT phải dừng và chuyển hướng',
  subtitle:
    'Đau là trải nghiệm cá nhân, không phải thước đo tổn thương — nhưng có những dấu hiệu mà bạn bắt buộc gửi khách đi khám.',
  minutes: 12,
  objectives: [
    'Phát biểu định nghĩa đau của IASP 2020 và giải thích pain ≠ nociception.',
    'Mô tả mô hình sinh-tâm-xã (biopsychosocial) ảnh hưởng cường độ đau thế nào.',
    'Phân biệt đau cấp, đau mạn và nociplastic pain ở góc độ ứng xử PT.',
    'Ghi nhớ bảng red flags buộc dừng và chuyển hướng khách tới bác sĩ/physio.',
    'Dùng ngôn ngữ giảm sợ hãi (hurt ≠ harm) khi hướng dẫn khách đang đau nhẹ.',
  ],
  sections: [
    {
      heading: 'Định nghĩa đau hiện đại (IASP 2020)',
      body: `Hiệp hội Nghiên cứu Đau quốc tế (IASP) sửa định nghĩa năm 2020:

> "Pain is an unpleasant sensory and emotional experience associated with, or resembling that associated with, actual or potential tissue damage."
> *Đau là một trải nghiệm giác quan và cảm xúc khó chịu, gắn liền với tổn thương mô thực sự hoặc tiềm năng, hoặc giống với trải nghiệm gắn liền với tổn thương đó.*

Ba hệ quả thực hành rút ra từ định nghĩa (kèm ghi chú chính thức của IASP):

1. **Đau luôn là trải nghiệm cá nhân** — chịu ảnh hưởng các yếu tố sinh học, tâm lý và xã hội ở mức khác nhau. Khách "đau 8/10" không phóng đại; con số đó là thật với họ.
2. **Đau và nociception là hai hiện tượng khác nhau** — không thể suy ra đau chỉ từ hoạt động thần kinh cảm giác; cũng không thể suy ra tổn thương chỉ từ mức đau.
3. **Lời khách tự nhận là đau cần được tôn trọng** — kể cả khi mọi máy móc "bình thường".`,
    },
    {
      heading: 'Sinh – tâm – xã hội: ba lớp điều khiển "âm lượng" đau',
      body: `Tư duy cũ (Cartesian): *mô hỏng bao nhiêu → đau bấy nhiêu*. Thực tế đau giống một **hệ báo động**: cảm biến (nociceptor) → tủy sống → não; và **não quyết định "đáng báo động không"** dựa trên bối cảnh:

- **Sinh học**: mức tổn thương, viêm, mệt cơ.
- **Tâm lý**: stress, ngủ kém, lo lắng "chắc mình teo đĩa đệm", từng trải nghiệm đau xấu.
- **Xã hội**: công việc, tiền bạc, người xung quanh phản ứng thế nào với cơn đau.

Vì sao điều này quan trọng với PT: khách đọc MRI "thoát vị đĩa đệm" rồi sợ cử động, có khi đau nhiều hơn khách cùng MRI nhưng chưa biết kết quả. Ngôn ngữ của bạn ("đĩa đệm hỏng rồi, đừng cúi nữa!") có thể trực tiếp **tăng** âm lượng báo động. Giải thích đúng ngược lại ("cột sống khỏe mạnh, cử động an toàn và là thuốc") giảm sợ hãi, tăng vận động, thường giảm đau thật.`,
    },
    {
      heading: 'Cấp vs mạn vs nociplastic',
      body: `**Đau cấp** (dưới ~3 tháng, thường rõ nguyên nhân): vai trò bảo vệ — xử như bài PEACE & LOVE: bảo vệ ngắn, tải lại sớm.

**Đau mạn** (quá ~3 tháng): hệ báo động trở nên **nhạy hóa** — ngưỡng báo động hạ, đau xuất hiện với kích thích ngày càng nhỏ. Lúc này tia trọng tâm chuyển từ "tìm và sửa mô hỏng" sang **chức năng**: ngủ, đi lại, sức mạnh dần dần, giảm sợ vận động. Tập luồng (graded exposure) và xây lại sức mạnh là "thuốc chính", không phải nghỉ.

**Nociplastic pain** (IASP): đau khi không có bằng chứng tổn thương mô rõ hoặc bệnh thần kinh — phổ biến trong đau lưng mạn, đau lan kiểu xơ hóa. Đặc điểm gợi ý: đau lan không theo rễ thần kinh, nhạy với nhiều kích thích nhỏ, mệt mỏi/khó tập trung kèm theo.

PT không chẩn đoán các thể này — nhưng **hiểu chúng tồn tại** giúp bạn không nói sai hai câu nguy hiểm: *"ảnh không có gì hỏng, chắc là tưởng tượng"* và *"MRI xấu thế này thôi tập vĩnh viễn đi".*`,
    },
    {
      heading: 'Red flags: dấu hiệu buộc chuyển hướng ngay',
      body: `Danh sách "dừng và gửi khách đi khám" mà mọi PT phải thuộc. Xuất hiện **một** dấu hiệu là đủ:

- **Đau về đêm không đổi tư thế** hoặc đau thức dậy vì cơn đau (không phải do nằm đè).
- **Sốt, gầy sút không rõ nguyên nhân** kèm đau cơ-xương.
- **Tê/yếu tiến triển** một chi; mất thăng bằng mới xuất hiện.
- **Rối loạn tiêu tiểu/bàng quang** kèm đau lưng (hội chứng đuôi ngựa — cấp cứu, đi khám NGAY).
- Đau ngực khi gắng, khó thở bất thường, ngất — dừng tập ngay, gọi hỗ trợ y tế.
- Chấn thương mạnh (té, va chạm) kèm không mang vác được hoặc biến dạng.
- Đau dữ dội khởi phát đột ngột không liên quan vận động (đặc biệt người lớn tuổi).

Với khách có red flags tiềm ẩn (đau lưng + tiểu đường, ung thư tiền sử, loãng xương): chuẩn bị sẵn câu chuyển hướng, *"Mình muốn chắc chắn với bài tập nặng hơn — bạn đi kiểm tra trước rồi mình tập tiếp nhé"*. Chuyển hướng sớm là dịch vụ chuyên nghiệp, không phải mất khách.`,
    },
    {
      heading: 'Ngôn ngữ PT dùng khi khách đau nhẹ',
      body: `Khi đau 2–3/10, không red flags, có phiếu của physio hoặc tổn thương cũ đã ổn: nguyên tắc **hurt ≠ harm** (đau thoáng qua ≠ đang phá hoại):

- Nói: *"Cảm giác căng nhẹ khi vận động là bình thường trong giai đoạn này — chúng ta theo dõi sau buổi 24 giờ."*
- Đo bằng **phản ứng 24 giờ**, không đo trong buổi: đau dồn sáng hôm sau → giảm một nấc; ổn → giữ hoặc tăng 5–10%.
- Dùng thang 0–10 thống nhất với khách: "đau cho phép" 0–3; trên 5 dừng.
- Tránh hai cực: "cắn răng đi" (bỏ qua tín hiệu) và "đau chút là nghỉ cả tháng" (mất thích ứng).

Ghi chuỗi này vào Sổ tay cho mỗi khách đang phục hồi — đó là dữ liệu quý khi làm việc cùng physio.`,
    },
  ],
  applyBox: `**Gian tập thực hành — checklist buổi đầu với khách "đau lưng mạn":**
1. Hỏi lịch sử + red flags từng dòng (đêm? sốt? tè? chấn thương mới?) — một dấu hiệu là dừng, chuyển hướng.
2. Không đau mới tiếp: giữ vùng khác của giáo án; cho khách vận động ngạt đau (đi bộ, đạp xe tay).
3. Đặt thang đau chung: cho phép 0–3/10 trong và sau buổi; trên 5 dừng; đo phản ứng 24 giờ.
4. Bắt đầu luồng từ mức thấp (ví dụ 5 phút đi nhanh) và tăng 5–10% khi 2 buổi liên tiếp ổn định.
5. Ghi lại: bài, mức đau trong/sau/24h — tạo tag "pain-log" trong Sổ tay để tra cứu nhanh.`,
  safetyBox:
    'Bài học này không cho phép PT chẩn đoán nguyên nhân đau. Mọi khách đau mạn nên được bác sĩ/physio đánh giá trước khi bạn thiết kế giáo án; red flags trong bài là ngưỡng bắt buộc chuyển hướng, không phải gợi ý tùy chọn.',
  terms: [
    {
      en: 'IASP definition of pain (2020)',
      vi: 'Định nghĩa đau IASP 2020',
      def: '"Trải nghiệm giác quan và cảm xúc khó chịu gắn với tổn thương thực/tiềm năng" — đau là cá nhân, tôn trọng lời khách tự nhận.',
    },
    {
      en: 'Nociception',
      vi: 'Dẫn truyền kích thích gây đau',
      def: 'Hoạt động thần kinh cảm giác từ mô tới não; là đầu vào, không phải trải nghiệm đau.',
    },
    {
      en: 'Biopsychosocial model',
      vi: 'Mô hình sinh – tâm – xã hội',
      def: 'Đau chịu điều chỉnh bởi sinh học + tâm lý + bối cảnh xã hội — mô hình chuẩn thay cho tư duy "hỏng bao nhiêu đau bấy nhiêu".',
    },
    {
      en: 'Nociplastic pain',
      vi: 'Đau do nhạy hóa',
      def: 'Đau khi không có tổn thương mô rõ — hệ báo động nhạy hóa; thường gặp trong đau lưng mạn.',
    },
    {
      en: 'Graded exposure',
      vi: 'Tiếp xúc tăng dần',
      def: 'Quay lại vận động từng bước nhỏ theo phản ứng 24 giờ — công cụ chính với đau mạn không red flags.',
    },
    {
      en: 'Red flags',
      vi: 'Dấu hiệu cảnh báo',
      def: 'Triệu chứng buộc dừng và chuyển hướng y tế: đau đêm, sốt/gầy sút, tè yếu tiến triển, rối loạn bàng quang, chấn thương mạnh.',
    },
    {
      en: 'Hurt ≠ harm',
      vi: 'Đau thoáng qua ≠ phá hoại',
      def: 'Nguyên tắc giao tiếp: đau nhẹ cho phép khi phục hồi không đồng nghĩa đang làm hỏng mô — đo bằng phản ứng 24 giờ.',
    },
  ],
  images: [],
  quiz: [
    {
      q: 'Điểm nào là phần lõi của định nghĩa đau IASP 2020?',
      choices: [
        'Đau luôn tỷ lệ thuận với mức tổn thương trên MRI',
        'Đau là trải nghiệm cá nhân, tách biệt với nociception, và lời khách tự nhận cần được tôn trọng',
        'Đau chỉ tồn tại khi có bệnh lý',
        'Đau là phản xạ không qua não',
      ],
      answer: 1,
      explain:
        'Raja et al. 2020 nhấn mạnh: đau luôn cá nhân, chịu ảnh hưởng sinh–tâm–xã hội; pain ≠ nociception; không thể suy tổn thương chỉ từ mức đau.',
    },
    {
      q: 'Khách đau lưng mạn nói "mình chắc là đĩa đệm hỏng tới mức không tập được nữa". Câu trả lời của PT đúng hướng nhất?',
      choices: [
        '"Đúng, MRI xấu thì thôi tập vĩnh viễn"',
        '"Cảm giác căng nhẹ khi vận động an toàn là bình thường; mình tăng từng bước theo phản ứng 24 giờ của bạn"',
        '"Đau là do tưởng tượng"',
        '"Chườm đá rồi tập hết mình"',
      ],
      answer: 1,
      explain:
        'Giảm sợ hãi + graded exposure là hướng có bằng chứng; hai cực "phóng đại tổn thương" và "bỏ qua đau" đều làm khách tệ hơn.',
    },
    {
      q: 'Dấu hiệu nào là red flag buộc chuyển hướng NGAY trong tình huống đau lưng?',
      choices: [
        'Đau 2/10 khi squat sâu',
        'Đau lưng kèm rối loạn tiểu/bàng quang mới xuất hiện',
        'Mỏi cơ sau buổi tập',
        'Đau vai khi nâng tay ngang 90 độ',
      ],
      answer: 1,
      explain:
        'Đau lưng + rối loạn bàng quang/tiểu là hội chứng đuôi ngựa — cấp cứu y tế, không phải bài tập.',
    },
    {
      q: 'Đau mạn (> 3 tháng) khác đau cấp ở điểm thực hành quan trọng nào?',
      choices: [
        'Không còn cần vận động nữa',
        'Hệ báo động nhạy hóa — trọng tâm chuyển sang chức năng, ngủ, sức mạnh tăng dần thay vì "tìm mô hỏng để sửa"',
        'Phải nghỉ tuyệt đối đến khi hết đau',
        'Chỉ dùng thuốc mới có tác dụng',
      ],
      answer: 1,
      explain:
        'Với đau mạn, vận động luồng + xây lại sức mạnh + ngủ/stress là "thuốc chính"; nghỉ dài làm nhạy hóa nặng hơn.',
    },
    {
      q: 'Nguyên tắc đo "đau cho phép" khi phục hồi là gì?',
      choices: [
        'Đo ngay trong buổi là đủ',
        'Thang 0–3/10 trong và sau buổi, kèm phản ứng 24 giờ hôm sau; trên 5 dừng',
        'Càng đau càng tốt chứng tỏ hiệu quả',
        'Khách tự quyết, không cần theo dõi',
      ],
      answer: 1,
      explain:
        'Phản ứng 24 giờ mới là tín hiệu tăng/giữ/giảm tải; đau trong buổi đơn lẻ nói lên ít điều.',
    },
    {
      q: 'PT phát hiện khách có red flags (sốt + đau đêm + gầy sút). Hành xử chuyên nghiệp nhất?',
      choices: [
        'Bơ đi, chắc chỉ mệt',
        'Dừng lập kế hoạch tập mới, khuyên khách đi khám trước rồi mới tiếp tục',
        'Tự kê thuốc giảm đau cho khách',
        'Tăng volume để khách "quên đau"',
      ],
      answer: 1,
      explain:
        'Red flags = ngưỡng chuyển hướng bắt buộc. Nói thẳng và kiên định là dịch vụ chuyên nghiệp — bạn giữ an toàn cho khách và uy tín cho nghề.',
    },
  ],
  related: {
    muscles: ['erector-spinae', 'multifidus', 'rectus-abdominis'],
    exercises: ['plank', 'side-plank', 'romanian-deadlift'],
    calculators: [],
    conditions: ['low_back_pain', 'herniated_disc', 'shoulder_pain', 'knee_pain'],
    evidence: [],
  },
  sources: [
    {
      label: 'Raja et al. 2020 — The revised IASP definition of pain (Pain 161(9):1976-82, PMC7680716, kiểm chứng nguyên văn)',
      url: 'https://doi.org/10.1097/j.pain.0000000000001939',
      license: 'cite-only (trích dẫn định nghĩa chính thức)',
    },
    {
      label: 'Moseley & Butler — Explain Pain (Noigroup)',
      url: 'https://www.noigroup.com/explain-pain/',
      license: 'cite-only',
    },
    {
      label: 'OpenStax Anatomy & Physiology — Nervous system & nociception',
      url: 'https://openstax.org/books/anatomy-and-physiology/pages/14-2-central-processing',
      license: 'CC BY-NC-SA 4.0 (cite-only)',
    },
  ],
};
