/**
 * Special populations & red flags dinh dưỡng: khi nào PT phải chuyển hướng.
 *
 * Nguồn: ACSM/AND position stand (cite-only), RDA & hướng dẫn lâm sàng
 * (cite-only), health conditions của PT Brain, NEDA (cite-only).
 */
export default {
  slug: 'nutr-7-1',
  module: 'nutr',
  chapter: 7,
  chapterTitle: 'Special populations',
  order: 1,
  title: 'Dinh dưỡng cho đối tượng đặc biệt và red flags buộc chuyển hướng',
  subtitle:
    'Tăng huyết áp, đái tháo đường, mang thai, dấu hiệu rối loạn ăn — nơi "plan đẹp" phải nhường chỗ cho an toàn và phối hợp chuyên gia.',
  minutes: 12,
  objectives: [
    'Định nghĩa phạm vi đúng của PT dinh dưỡng: hướng dẫn chung theo bằng chứng, không kê đơn hay trị liệu.',
    'Đưa điều chỉnh dinh dưỡng chung cho khách tăng huyết áp và đái tháo đường typ 2 (phối hợp y tế).',
    'Nêu điều chỉnh cho khách mang thai (không giảm calo mạnh; tuân thủ quy tắc tập của app).',
    'Ghi nhớ red flags rối loạn ăn và RED-S để chuyển hướng đúng lúc.',
  ],
  sections: [
    {
      heading: 'Phạm vi của PT dinh dưỡng — nói rõ từ buổi đầu',
      body: `PT đủ khả năng: **hướng dẫn chung** theo bằng chứng (energy balance, protein, chất lượng thực phẩm, hydration, timing), và **giữ kế hoạch ăn khớp kế hoạch tập**.

PT KHÔNG làm: kê đơn dinh dưỡng trị liệu, xử bệnh nền bằng chế độ ăn, cai thuốc, hay can thiệp rối loạn ăn. Câu cửa miệng chuyên nghiệp: *"Mình ghép ăn với tập theo bằng chứng; phần bệnh nền của bạn do bác sĩ duyệt — mình phối hợp theo phiếu của họ."*

Trong app, bước này đã được hỗ trợ: khách khai **bệnh nền** trong hồ sơ → AI và wizard loại bài chống chỉ định, thêm cảnh báo và yêu cầu duyệt y tế (bài Health conditions). Phần ăn uống đi cùng tinh thần đó.`,
    },
    {
      heading: 'Tăng huyết áp: natri, mô hình đĩa và tránh nín thở',
      body: `Với khách tăng huyết áp (kể cả đang dùng thuốc), ba điều chỉnh ăn có bằng chứng rõ nhất:

1. **Hạ natri**: hạn chế đồ chế biến sẵn, nước sốt đóng chai, đồ mặn — phần lớn natri đến từ thực phẩm công nghiệp chứ không phải muỗng muối trên bàn.
2. **Mô hình đĩa DASH-like**: nhiều rau quả, ngũ cốc toàn phần, protein nạc, hạn chế đồ ngọt/đồ chiên — chính là "đĩa mặc định" của bài Carb.
3. **Tránh nín thở gắng sức** (Valsalva) và set 1RM — đúng quy tắc đã có sẵn trong app khi chọn bệnh nền này (bài Vai trò của hơi thở).

Mọi thay đổi lớn về ăn khi đang dùng thuốc huyết áp → khách báo bác sĩ; "cắt muối triệt để đột ngột" cũng không phải mục tiêu — giảm dần đồ chế biến là bền.`,
    },
    {
      heading: 'Đái tháo đường typ 2: carb phân bổ và theo dõi',
      body: `Ba nguyên tắc phối hợp (khách vẫn cần bác sĩ/điều dưỡng dinh dưỡng duyệt):

1. **Carb phân bổ đều** các bữa thay vì dồn một bữa lớn — cùng tổng lượng, đường máu phẳng hơn.
2. **Ưu tiên carb toàn phần + chất xơ + protein trong bữa** — làm chậm tốc độ hấp thu (bài Carb).
3. **Vận động đều là "thuốc"**: đi bộ 10–15 phút sau bữa chính là can thiệp đơn giản, dễ làm, có bằng chứng hỗ trợ kiểm soát đường sau ăn.

Red flags trong buổi tập cần dừng và hướng khách báo bác sĩ: run, vã mồ hôi lạnh, lú lẫn (hạ đường huyết — khách dùng insulin/tiên cứu hạ đường cần mang theo nguồn đường nhanh và biết cách xử; hỏi buổi đầu).`,
    },
    {
      heading: 'Mang thai: không phải "ăn cho hai" và không cắt calo',
      body: `Ba điểm dinh dưỡng then chốt:

1. **Không giảm calo mạnh** trong thai kỳ — mục tiêu hình thể đặt sau sức khỏe mẹ và thai nhi.
2. Tăng năng lượng **vừa phải** theo ba tháng (theo hướng dẫn bác sĩ sản khoa), nhấn protein và **axit folic/sắt** theo chỉ định — phần bổ sung thuộc y tế.
3. **Tập theo quy tắc app đã có** với bệnh nền "Mang thai": tránh nằm ngửa kéo dài (sau 3 tháng đầu), tránh nín thở gắng sức, giảm tải trục thân, máy/ghế tựa ưu tiên — kèm khám duyệt trước khi tập.

Điểm PT hay bị hỏi: "tập được không?" — với thai kỳ khỏe mạnh, hầu hết hình thức vận động nhẹ–vừa **được khuyến khích**; câu trả lời đúng luôn kèm điều kiện: *bác sĩ sản khoa duyệt + theo dõi mọi dấu hiệu bất thường (chóng mặt, ra máu, đau, giảm cử động thai)*.`,
    },
    {
      heading: 'Red flags buộc chuyển hướng ngay',
      body: `**Rối loạn ăn / hành vi ăn lệch** — chuyển hướng chuyên gia tâm lý/điều dưỡng dinh dưỡng khi thấy:

- Loại cả NHÓM thực phẩm với quy tắc cứng không y tế ("carb là độc", "sạch-bẩn tuyệt đối") kèm sợ ăn ngoài kiểm soát.
- Quan hệ lệch lạc với cân/số calo: cân mỗi ngày nhiều lần, ăn bù–nôn, tập "trả nợ" compulsive.
- Với nữ: **mất kinh nguyệt** trong giai đoạn ăn ít (đã gặp ở bài Micronutrients — RED-S).

**Suy dinh dưỡng năng lượng kéo dài (RED-S)**: lạnh cấu trúc, tóc gãy, hồi phục chậm, hiệu suất rơi — việc đầu tiên là **tăng năng lượng**, không phải "thêm supplement".

PT ở đây giữ vai trò **người tin cậy + chuyển hướng sớm** — nói thẳng, không phán xét, và không "kéo plan đẹp hơn" đè lên dấu hiệu sức khỏe.`,
    },
  ],
  applyBox: `**Gian tập thực hành — bộ câu buổi đầu cho khách có bệnh nền:**
1. "Bạn đang dùng thuốc gì và bác sĩ đã nói gì về ăn/tập?" — câu mở đầu thẳng thắn: mọi plan đi sau câu trả lời.
2. Khai đúng bệnh nền trong app Settings để wizard tự loại bài chống chỉ định + cảnh báo.
3. Ba bệnh nền phổ biến → ba quy tắc ăn đi kèm: huyết áp (natri + đĩa rau quả), đái tháo đường (carb phân bổ + đi bộ sau bữa), mang thai (không cắt calo + duyệt sản khoa).
4. Ghi lại mọi thay đổi thuốc/bệnh mới vào Sổ tay — plan ăn-tập được duyệt lại mỗi khi có thay đổi y tế.`,
  safetyBox:
    'Bài học là hướng dẫn chung theo bằng chứng, không thay thế ý kiến y tế. Mọi khách có bệnh nền đang điều trị: thay đổi chế độ ăn/tập đáng kể cần được bác sĩ điều trị biết và duyệt; red flags trong bài là ngưỡng bắt buộc chuyển hướng, không phải gợi ý.',
  terms: [
    {
      en: 'Scope of practice (nutrition)',
      vi: 'Phạm vi hành nghề (dinh dưỡng)',
      def: 'PT hướng dẫn chung theo bằng chứng; trị liệu dinh dưỡng, kê đơn, can thiệp rối loạn ăn thuộc chuyên gia y tế.',
    },
    {
      en: 'DASH-style eating',
      vi: 'Ăn kiểu DASH',
      def: 'Nhiều rau quả + ngũ cốc toàn phần + protein nạc, hạ natri từ đồ chế biến — mô hình ăn có bằng chứng cho huyết áp.',
    },
    {
      en: 'Hypoglycemia during exercise',
      vi: 'Hạ đường huyết khi tập',
      def: 'Run, vã mồ hôi lạnh, lú lẫn — dừng, xử nguồn đường nhanh theo hướng dẫn y tế của khách; hỏi sẵn từ buổi đầu.',
    },
    {
      en: 'Disordered eating red flags',
      vi: 'Dấu hiệu hành vi ăn lệch',
      def: 'Quy tắc cứng loại nhóm thực phẩm, cân/calo chiếm ưu tiên suy nghĩ, ăn bù–nôn, tập trả nợ — chuyển hướng chuyên gia.',
    },
    {
      en: 'Pregnancy (exercise/nutrition)',
      vi: 'Mang thai: ăn & tập',
      def: 'Không cắt calo mạnh; vận động nhẹ-vừa được khuyến khích khi sản khoa duyệt; quy tắc tập của app tự áp khi khai bệnh nền.',
    },
  ],
  images: [],
  quiz: [
    {
      q: 'Phạm vi đúng của PT về dinh dưỡng là gì?',
      choices: [
        'Kê chế độ trị bệnh nền',
        'Hướng dẫn chung theo bằng chứng và ghép ăn với tập; trị liệu dinh dưỡng thuộc y tế',
        'Thay thế bác sĩ khi khách tiết kiệm chi phí',
        'Cai thuốc cho khách bằng diet',
      ],
      answer: 1,
      explain:
        'Câu chuyên nghiệp không làm mất khách: "mình ghép ăn-tập theo bằng chứng; bệnh nền do bác sĩ duyệt, mình phối hợp".',
    },
    {
      q: 'Khách tăng huyết áp hỏi nên bắt đầu từ đâu với ăn uống. Điều chỉnh "đắt" nhất?',
      choices: [
        'Cắt muỗng muối trên bàn ăn',
        'Hạ natri từ đồ chế biến sẵn + đĩa nhiều rau quả, ngũ cốc toàn phần, protein nạc',
        'Ăn mặn bù kali',
        'Bỏ ăn tối',
      ],
      answer: 1,
      explain:
        'Phần lớn natri ẩn trong thực phẩm công nghiệp; mô hình đĩa mạnh mẽ hơn "cấm muỗng muối" và dễ bền.',
    },
    {
      q: 'Với khách đái tháo đường typ 2, cách phân bổ carb có bằng chứng là gì?',
      choices: [
        'Dồn carb vào một bữa cho tiện',
        'Phân bổ đều các bữa + carb toàn phần có chất xơ + đi bộ 10–15 phút sau bữa chính',
        'Không ăn carb vĩnh viễn',
        'Chỉ ăn carb trước tập nặng',
      ],
      answer: 1,
      explain:
        'Cùng tổng lượng nhưng trải đều + chậm hấp thu giúp đường máu phẳng; vận động sau bữa hỗ trợ kiểm soát đường sau ăn.',
    },
    {
      q: 'Khách mang thai khỏe mạnh hỏi "có tập được không?". Khung trả lời đúng?',
      choices: [
        'Không tập gì cho an toàn tuyệt đối',
        'Vận động nhẹ-vừa thường được khuyến khích — kèm điều kiện: sản khoa duyệt + theo dõi dấu hiệu bất thường',
        'Tập như trước vô điều kiện',
        'Chỉ cardio cường độ tối đa',
      ],
      answer: 1,
      explain:
        'Thai kỳ khỏe mạnh ≠ ngừng vận động; điều kiện duyệt y tế + quy tắc tập của app (không nằm ngửa kéo dài, không nín thở...) là phần bắt buộc.',
    },
    {
      q: 'Dấu hiệu nào là red flags buộc chuyển hướng chuyên gia tâm lý/dinh dưỡng lâm sàng?',
      choices: [
        'Khách thích ăn bánh',
        'Quy tắc cứng loại nhóm thực phẩm kèm sợ mất kiểm soát, cân mỗi ngày nhiều lần, ăn bù-nôn, mất kinh nguyệt',
        'Khách ăn chay',
        'Khách bỏ bữa sáng',
      ],
      answer: 1,
      explain:
        'Hành vi ăn lệch và RED-S là ngưỡng chuyển hướng — PT nói thẳng không phán xét, không kéo "plan đẹp" đè lên sức khỏe.',
    },
  ],
  related: {
    muscles: [],
    exercises: ['plank', 'walking-lunge', 'seated-cable-row'],
    calculators: ['tdee', 'calories', 'macro'],
    conditions: ['hypertension', 'pregnancy'],
    evidence: [],
  },
  sources: [
    {
      label: 'ACSM / Academy of Nutrition and Dietetics — Position stand: nutrition & chronic conditions',
      url: 'https://www.acsm.org/education-resources/books-and-multimedia-resources',
      license: 'cite-only',
    },
    {
      label: 'Mountjoy et al. 2018 — IOC consensus: RED-S',
      url: 'https://doi.org/10.1136/bjsports-2018-099193',
      license: 'cite-only',
    },
    {
      label: 'National Eating Disorders Association — red flags (cite-only)',
      url: 'https://www.nationaleatingdisorders.org/',
      license: 'cite-only',
    },
  ],
};
