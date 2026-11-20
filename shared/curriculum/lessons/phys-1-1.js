/**
 * Motor unit, loại sợi cơ và nguyên tắc all-or-none.
 *
 * Nguồn: OpenStax A&P 10.4-10.5 (cite-only — SO/FO/FG đã kiểm chứng khi
 * cào đợt 1), Enoka — Neuromechanics of Human Movement (cite-only).
 */
export default {
  slug: 'phys-1-1',
  module: 'phys',
  chapter: 1,
  chapterTitle: 'Cơ & kích hoạt',
  order: 1,
  title: 'Motor unit, loại sợi cơ và nguyên tắc all-or-none',
  subtitle:
    'Một neuron điều khiển bao nhiêu sợi cơ, vì sao não gọi "sợi nhỏ trước sợi to sau", và tại sao bạn không thể "co một nửa sợi cơ".',
  minutes: 11,
  objectives: [
    'Định nghĩa motor unit và vì sao số sợi mỗi unit khác nhau giữa mắt và đùi.',
    'Giải thích nguyên tắc kích thước (size principle) và lợi ích tiết kiệm của nó.',
    'Phân biệt loại sợi I, IIa, IIx (SO/FO/FG) theo tốc độ và cách tạo ATP.',
    'Giải thích all-or-none và hai cách hệ thần kinh điều chỉnh lực: số unit và tần số xung.',
  ],
  sections: [
    {
      heading: 'Motor unit: đơn vị tuyển chọn nhỏ nhất',
      body: `Hệ thần kinh không điều khiển từng sợi cơ rời rạc — nó điều khiển theo **gói**: một **motor unit** = một neuron vận động + toàn bộ sợi cơ mà neuron đó chi phối. Khi neuron phát xung, **mọi sợi trong unit co cùng lúc**.

Số sợi mỗi unit chênh nhau lớn theo nhiệm vụ:

- Cơ điều khiển mắt: ~10 sợi/unit — cần độ chính xác từng độ.
- Cơ đùi, cơ mông: tới **hàng trăm–hàng nghìn** sợi/unit — cần lực, không cần tinh.

Đây là lý do "tuyển chọn" có độ phân giải khác nhau: nhiệm vụ nhẹ chỉ gọi vài unit nhỏ của nhóm cơ (chính xác, ít tốn), nhiệm vụ nặng gọi thêm các unit to dần.`,
    },
    {
      heading: 'Size principle: gọi nhỏ trước, to sau',
      body: `Các unit được tuyển theo thứ tự kích thước gần như cố định (**size principle**, Henneman): unit nhỏ (sợi chậm, bền) được gọi trước; khi yêu cầu lực tăng, các unit lớn dần lần lượt "thức giấc" — sợi nhanh, mạnh, tốn kém chỉ vào việc khi thật sự cần.

Hệ quả thực hành:

- Set nhiều rep: unit nhỏ mệt dần, unit lớn được gọi vào **theo tiến trình** — một phần lý do set 10–20 rep vẫn hiệu quả cho sức mạnh lẫn phì đại.
- Ngày "đi bộ 10.000 bước" chỉ dùng sợi chậm — không cướp việc phục hồi của sợi nhanh dùng cho tạ nặng; cardio nhẹ và tạ có thể xếp cạnh nhau.
- Khởi động "ramp" (nhẹ → nặng) đúng bản chất sinh học của tuyển chọn — không phải nghi lễ.`,
      image: 'phys-1-1-neurojunction.svg',
    },
    {
      heading: 'All-or-none: sợi co hết hay không co',
      body: `Một sợi cơ nhận xung đủ mạnh thì **co hết sức của nó tại thời điểm đó** — không có "co nửa". Vậy lực được điều chỉnh ở đâu? Hai nút vặn:

1. **Số unit được gọi** (recruitment): thêm bớt "gói".
2. **Tần số xung** (rate coding): cùng một unit, xung dày hơn → sợi co mạnh hơn (cộng dồn lực — bài sau nói kỹ).

Vì vậy "nhẹ tay" không phải co 30% mỗi sợi, mà là **ít sợi co 100%**. Điểm này hoá giải một hiểu lầm phòng gym: set tạ nặng 1–3 rep không "chỉ đốt sợi to" mà gần như gọi mọi unit từ nhỏ tới to — tạ nặng là bài kiểm tra tuyển chọn đầy đủ nhất.`,
    },
    {
      heading: 'Ba loại sợi: I, IIa, IIx',
      body: `Phân loại theo tốc độ co và cách tạo ATP (đã kiểm chứng trong OpenStax — bản SO/FO/FG):

| Loại | Tên chức năng | Tạo ATP | Đặc điểm | Nơi nhiều |
| --- | --- | --- | --- | --- |
| **I** | Slow oxidative (SO) | Oxy hoá | Bền nhất, lực thấp, đỏ (myoglobin) | Cơ gan chân, cơ giữ tư thế |
| **IIa** | Fast oxidative (FO) | Oxy hoá + đường | Nhanh, khá bền | Đùi, bắp chân — loại "đa năng" |
| **IIx** | Fast glycolytic (FG) | Đường (không oxy) | Mạnh nhất, mệt nhanh, trắng | Đầu cơ động cơ nhanh |

Hai điểm đáng nhớ với PT:

- **Tỉ lệ loại sợi chủ yếu do di truyền** và khác nhau giữa cơ (gan chân giàu sợi I; cơ delta giàu sợi nhanh). Tập luyện **cải thiện tính chất** của sợi (IIx chuyển giống IIa về mặt chuyển hoá) chứ không biến sợi chậm thành nhanh.
- Không ai nhìn cơ bắp mà đo được tỉ lệ — nhưng bạn có thể **đo hành vi**: khách "bùng nổ" tốt ở rep thấp thường giàu sợi nhanh; khách lì đòn rep cao thường giàu sợi chậm. Chọn mục tiêu theo thế mạnh của khách là cá nhân hoá đầu tiên, trước cả mọi công thức.`,
    },
  ],
  applyBox: `**Gian tập thực hành — 3 dùng ngay từ motor unit:**
1. Khởi động theo nấc ramp thật: 40% → 60% → 80% của bài chính (2-3 rep mỗi nấc) — đi đúng trật tự tuyển chọn tự nhiên.
2. Đặt bài nặng nhất đầu buổi (khi hệ thần kinh tươi) — đủ "điện" gọi trọn các unit lớn.
3. Quan sát hành vi sợi của khách qua 2 set thử: set 5 rep nặng và set 20 rep nhẹ — ai "lì" ở rep cao, ai "bùng" ở rep thấp, ghi vào Sổ tay để chọn rep range ưu tiên.`,
  terms: [
    {
      en: 'Motor unit',
      vi: 'Đơn vị vận động',
      def: 'Một neuron vận động cùng toàn bộ sợi cơ nó chi phối; co theo gói, không theo từng sợi lẻ.',
    },
    {
      en: 'Size principle',
      vi: 'Nguyên tắc kích thước',
      def: 'Tuyển chọn theo thứ tự: unit nhỏ (chậm, bền) trước, unit lớn (nhanh, mạnh) chỉ vào khi lực yêu cầu tăng.',
    },
    {
      en: 'All-or-none',
      vi: 'Nguyên tắc tất cả hoặc không',
      def: 'Sợi nhận xung đủ mạnh thì co tối đa tại trạng thái đó; lực điều chỉnh bằng số unit và tần số xung.',
    },
    {
      en: 'Rate coding',
      vi: 'Mã hoá tần số',
      def: 'Tăng tần số xung tới cùng một unit để cộng dồn lực — nút vặn lực thứ hai sau tuyển chọn.',
    },
    {
      en: 'Type I / IIa / IIx fibers',
      vi: 'Sợi loại I / IIa / IIx',
      def: 'Chậm-bền (I), nhanh-khá bền (IIa), nhanh-mạnh-mệt nhanh (IIx); tỉ lệ chủ yếu di truyền, tính chất cải thiện được.',
    },
    {
      en: 'Myoglobin',
      vi: 'Myoglobin',
      def: 'Protein dự trữ oxy trong sợi chậm, cho màu đỏ và độ bền của sợi loại I.',
    },
  ],
  images: [
    {
      file: 'phys-1-1-neurojunction.svg',
      caption: 'Điểm nối thần kinh–cơ: xung thần kinh chuyển thành tín hiệu hóa học kích hoạt sợi cơ.',
      source: 'Paul Hege / Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Neuromuscular_junction.svg',
      license: 'CC BY-SA 4.0',
    },
  ],
  quiz: [
    {
      q: 'Một motor unit gồm những gì?',
      choices: [
        'Một sợi cơ duy nhất',
        'Một neuron vận động + toàn bộ sợi cơ mà neuron đó chi phối',
        'Toàn bộ cơ đùi',
        'Một bó gân',
      ],
      answer: 1,
      explain:
        'Neuron phát xung thì mọi sợi trong unit co cùng lúc; số sợi mỗi unit phụ thuộc độ chính xác nhiệm vụ (mắt ~10, đùi cả nghìn).',
    },
    {
      q: 'Theo size principle, đơn vị nào được gọi trước khi lực yêu cầu tăng dần?',
      choices: [
        'Unit lớn (sợi nhanh) trước',
        'Unit nhỏ (sợi chậm, bền) trước, unit lớn chỉ vào khi thật cần',
        'Ngẫu nhiên hoàn toàn',
        'Cùng lúc tất cả',
      ],
      answer: 1,
      explain:
        'Trật tự nhỏ → to tiết kiệm năng lượng và bảo vệ: sợi nhanh "đắt đỏ" chỉ tiêu khi nhiệm vụ xứng đáng.',
    },
    {
      q: '"Hít đất nhẹ" của khách không phải là co 30% mỗi sợi cơ. Thực chất là gì?',
      choices: [
        'Mỗi sợi co nhẹ hơn một chút',
        'Ít unit hơn co hết sức tại trạng thái đó — all-or-none từng sợi',
        'Sợi co ngược chiều',
        'Toàn bộ sợi co 30%',
      ],
      answer: 1,
      explain:
        'Sợi không có "co nửa": lực thấp = ít gói co trọn vẹn; tăng lực = thêm gói và/hoặc tăng tần số xung.',
    },
    {
      q: 'Loại sợi nào mạnh nhất nhưng mệt nhanh nhất?',
      choices: ['Type I (SO)', 'Type IIa (FO)', 'Type IIx (FG)', 'Cả ba như nhau'],
      answer: 2,
      explain:
        'IIx tạo ATP bằng đường không cần oxy: công suất cao, bình nhỏ — chuốc lực tối đa trong thời gian ngắn.',
    },
    {
      q: 'Tập luyện thay đổi điều gì ở loại sợi cơ?',
      choices: [
        'Biến sợi I thành sợi IIx',
        'Cải thiện tính chất (ví dụ IIx có chuyển hoá giống IIa hơn) chứ không đổi loại; tỉ lệ gốc chủ yếu di truyền',
        'Xoá toàn bộ sợi chậm',
        'Không tác động gì',
      ],
      answer: 1,
      explain:
        'Bạn không "chọn gene lại" cho khách; bạn tối ưu hành vi và tính chất của sợi họ đang có — và chọn rep range theo thế mạnh tự nhiên.',
    },
    {
      q: 'Vì sao bài tạ nặng 1–3 rep được coi là "kiểm tra tuyển chọn đầy đủ"?',
      choices: [
        'Vì chỉ dùng sợi chậm',
        'Vì yêu cầu lực tối đa gọi gần như trọn mọi unit từ nhỏ tới to, kèm tần số xung cao',
        'Vì không cần kỹ thuật',
        'Vì loại bỏ hệ thần kinh',
      ],
      answer: 1,
      explain:
        'Tải gần tối đa buộc hệ thần kinh huy động toàn bộ nút vặn: số unit tối đa + rate coding mạnh — bài đo sức mạnh "thật" nhất.',
    },
  ],
  related: {
    muscles: ['soleus', 'gastrocnemius', 'quadriceps', 'gluteus-maximus'],
    exercises: [],
    calculators: [],
    conditions: [],
    evidence: [],
  },
  sources: [
    {
      label: 'OpenStax Anatomy & Physiology — Nervous system control of muscle tension & Types of muscle fibers (đã cào kiểm chứng)',
      url: 'https://openstax.org/books/anatomy-and-physiology/pages/10-5-types-of-muscle-fibers',
      license: 'CC BY-NC-SA 4.0 (cite-only)',
    },
    {
      label: 'Enoka — Neuromechanics of Human Movement (motor unit & rate coding)',
      url: 'https://www.humankinetics.com/products/neuromechanics-of-human-movement-5th-edition',
      license: 'cite-only',
    },
  ],
};
