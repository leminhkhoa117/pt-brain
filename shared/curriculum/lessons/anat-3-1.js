/**
 * Hệ xương: phân loại, hệ trục/phần phụ và các xương liên quan phòng tập.
 *
 * Nguồn: Vesalius Fabrica p163 (public domain, 1543, đã kiểm tra license),
 * OpenStax A&P (cite-only).
 */
export default {
  slug: 'anat-3-1',
  module: 'anat',
  chapter: 3,
  chapterTitle: 'Hệ xương',
  order: 1,
  title: 'Hệ xương: khung chống mà bạn đang đặt tải lên mỗi buổi',
  subtitle:
    '206 xương chia hai hệ trục/phần phụ — và lý do vì sao tạ nặng là một trong những "thuốc" tốt nhất cho mật độ xương.',
  minutes: 10,
  objectives: [
    'Phân biệt hệ trục (axial) và hệ phần phụ (appendicular) cùng vai trò riêng của mỗi hệ.',
    'Nhận diện các xương liên quan trực tiếp tới kỹ thuật phòng tập: cột sống, xương đùi, xương chày, xương bả vai, xương bàn chân.',
    'Giải thích cơ chế xương thích ứng tải (remodeling) và vì sao kháng lực tốt cho mật độ xương.',
    'Nêu hai nguyên tắc an toàn đặt tải lên hệ xương của khách lớn tuổi hoặc loãng xương.',
  ],
  sections: [
    {
      heading: 'Xương là mô sống, không phải "cột bê tông"',
      body: `Người lớn có **206 xương** — mỗi cái là một cơ quan sống: có màng bao (periosteum) giàu thần kinh, mạch máu nuôi, và đội tế bào hằng ngày vừa **dọn (osteoclast)** vừa **đắp (osteoblast)**. Xương bạn nhìn trên ảnh hôm nay không còn nguyên xi như năm ngoái — nó đã được thay thế từng phần.

Điều này tạo ra nguyên tắc vàng cho PT: **xương thích ứng theo tải bạn đặt lên nó**. Tải cơ học hợp lý (nhất là kháng lực + tác động gánh trọng lực) là tín hiệu đắp xương; nằm ngồi lười lâu ngày là tín hiệu dọn. Đây là lý do các hướng dẫn y tế xếp **tập kháng lực đều đặn** vào danh sách biện pháp duy trì mật độ xương.`,
      image: 'anat-3-1-skeleton.webp',
    },
    {
      heading: 'Hai hệ: trục và phần phụ',
      body: `**Hệ trục (axial)** — trục giữa của thân:

- Xương sọ bảo vệ não.
- **Cột sống**: 24 đốt di động (cổ 7, ngực 12, thắt lưng 5) + xương cùng và cụt ở đáy.
- Lồng ngực (xương ức + 12 cặp sườn) bọc tim phổi.

**Hệ phần phụ (appendicular)** — chi và "đai gắn chi":

- **Đai vai**: xương bả vai + xương đòn — bả vai "trôi nổi" trên lồng ngực bằng cơ, nhờ vậy vai linh hoạt (và dễ lệch như đã học ở bài Vai).
- **Đai chậu**: hai xương hông + xương cùng khớp kín thành vòng chậu — truyền lực từ chân lên thân trong mỗi bước.
- Xương chi: xương đùi (dài và mạnh nhất cơ thể), xương chày, xương bàn chân…

Với PT: đai vai là **cấu trúc cơ giữ** (chuyển động ưu tiên), đai chậu là **cấu trúc khớp kín** (ổn định ưu tiên). Vì vậy lỗi kỹ thuật vai thường chữa bằng "cơ ổn định", còn lỗi hông-chậu thường chữa bằng "mở ROM + lực".`,
    },
    {
      heading: 'Những xương bạn "chạm" mỗi buổi tập',
      body: `- **Cột sống thắt lưng (L1–L5)**: chịu tải nén trong squat/deadlift — kỹ thuật trung tính giữ đĩa đệm phần sau không bị dồn.
- **Xương đùi + mỏm chuyển lớn**: điểm bám của mông lớn — đòn bẩy chính khi đẩy thân lên từ đáy squat.
- **Xương chày + mặt khớp trên**: khớp gối trượt trên nền này — chân lệch trục lâu dài là tải lệch mặt khớp.
- **Xương bả vai**: "tấm bệ di động" cho khớp vai — retraction/depression giữ bệ này phẳng khi đẩy.
- **Xương bàn chân (3 vòm)**: hấp thu lực mỗi bước chạy; giày cứng/mặt phẳng thay đổi cách vòm làm việc.`,
    },
    {
      heading: 'Đặt tải an toàn cho xương "đang mỏng"',
      body: `Với khách lớn tuổi, phụ nữ sau mãn kinh, hoặc có chẩn đoán **loãng xương** — kháng lực vẫn là "thuốc", nhưng liều lượng thay đổi:

1. **Tăng từ từ như mọi mô khác**: xương thích ứng chậm hơn cơ nhiều (theo tháng), tăng tải 5–10% chỉ khi buổi trước không khó chịu kéo dài.
2. **Tránh mô-men nén + xoay cột sống cùng lúc**: gập-xoay thân có tải (ví dụ một số biến thể Russian twist nặng) là tư thế rủi ro nhất với cột sống yếu.
3. Ưu tiên: máy có tỳ đỡ và bài đứng đối trọng hai chân giai đoạn đầu; bài gánh tải dốc (walking lunge nhẹ, step-up thấp) khi đã ổn.
4. **Vết nứt nhỏ xương (stress fracture)** nghi ngờ: đau điểm cố định trên xương khi bước/nhảy — dừng tăng tải và khám, không phải "chạy cho quen".`,
    },
  ],
  applyBox: `**Gian tập thực hành — "audit tải xương" trong giáo án khách 55+:**
1. Đếm số buổi có bài gánh trọng lực đứng (squat máy, step-up nhẹ) — mục tiêu tối thiểu 2 buổi/tuần.
2. Kiểm tra mọi bài gập-xoay thân có tải: giữ hoặc bỏ — thay bằng anti-rotation (Pallof) an toàn hơn.
3. Cân đối: mỗi tuần có ít nhất 3 × 10 phút đi bộ nhanh (tác động nhịp vừa đủ cho xương).
4. Ghi tiến trình bằng bài test chứ không phải cảm giác: bước lên ghế 20 cm × 8 mỗi chân so sánh mỗi 8 tuần.`,
  terms: [
    {
      en: 'Axial / Appendicular skeleton',
      vi: 'Hệ xương trục / phần phụ',
      def: 'Trục giữa (sọ-cột sống-lồng ngực) và phần chi kèm hai đai vai/chậu — hai hệ hai ưu tiên khác nhau.',
    },
    {
      en: 'Periosteum',
      vi: 'Màng xương',
      def: 'Lớp bao ngoài xương giàu mạch và thần kinh — nơi bám gân và "cảm nhận" tải.',
    },
    {
      en: 'Bone remodeling',
      vi: 'Tái tạo xương',
      def: 'Cân bằng đắp (osteoblast) và dọn (osteoclast) theo tín hiệu tải cơ học — xương luôn được thay mới.',
    },
    {
      en: 'Pelvic girdle',
      vi: 'Đai chậu',
      def: 'Vòng khớp kín hai xương hông + xương cùng — truyền lực chân lên thân mỗi bước đứng.',
    },
    {
      en: 'Wolff\u2019s law (concept)',
      vi: 'Định luật Wolff (khái niệm)',
      def: 'Xương thích ứng với tải đặt lên: tải hợp lý làm đặc xương, không tải làm mỏng dần.',
    },
    {
      en: 'Stress fracture',
      vi: 'Nứt ứng suất xương',
      def: 'Vết nứt nhỏ do tải lặp vượt khả năng tái tạo; đau điểm cố định trên xương — cần giảm tải và thăm khám.',
    },
  ],
  images: [
    {
      file: 'anat-3-1-skeleton.webp',
      caption: 'Bộ xương người — bản khắc kinh điển của Vesalius (1543).',
      source: 'Andreas Vesalius / Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Vesalius_Fabrica_p163.jpg',
      license: 'Public domain',
    },
  ],
  quiz: [
    {
      q: 'Xương được mô tả chính xác nhất là gì?',
      choices: [
        'Vật liệu cứng bất biến từ khi sinh',
        'Mô sống liên tục dọn-đắp theo tín hiệu tải cơ học',
        'Chỉ gồm canaki vô mạch',
        'Một dạng sụn đặc',
      ],
      answer: 1,
      explain:
        'Xương có màng giàu mạch thần kinh và đội tế bào remodeling hằng ngày — tải hợp lý là tín hiệu "đắp", không tải là tín hiệu "dọn".',
    },
    {
      q: 'Đai vai và đai chậu khác nhau ở ưu tiên nào?',
      choices: [
        'Giống nhau hoàn toàn',
        'Đai vai là cấu trúc cơ giữ ưu tiên linh hoạt; đai chậu là vòng khớp kín ưu tiên ổn định truyền lực',
        'Đai chậu có thể tháo rời khi chạy',
        'Đai vai không gắn với chi trên',
      ],
      answer: 1,
      explain:
        'Bả vai "trôi nổi" nhờ cơ nên linh hoạt dễ lệch; vòng chậu khớp kín nên ổn định — hai cấu trúc, hai hướng xử lý kỹ thuật.',
    },
    {
      q: 'Vì sao kháng lực đều đặn được khuyến nghị cho mật độ xương?',
      choices: [
        'Vì đốt calo nhiều',
        'Vì tải cơ học hợp lý là tín hiệu chính thúc osteoblast đắp xương — nguyên tắc hoạt động của Wolff',
        'Vì làm da căng',
        'Vì thay thế estrogen',
      ],
      answer: 1,
      explain:
        'Xương thích ứng theo tải: gánh trọng lực + kháng lực là "liều" kích thích duy trì mật độ — đặc biệt quan trọng từ tuổi trung niên, và khách loãng xương vẫn tập được, chỉ cần tăng từ từ.',
    },
    {
      q: 'Với khách loãng xương, kiểu chuyển động nào cần loại/giảm đầu tiên?',
      choices: [
        'Máy đẩy chân',
        'Gập-xoay thân có tải (nén + xoay cột sống cùng lúc)',
        'Đi bộ nhanh',
        'Pallof press chống xoay',
      ],
      answer: 1,
      explain:
        'Nén kết hợp xoay là tổ hợp lực rủi ro nhất cho thân xương yếu; anti-rotation giữ kiểm soát mà không thêm mô-men xoay.',
    },
    {
      q: 'Khách chạy bộ đau điểm cố định một chỗ trên xương chày, đau tăng từng buổi. Việc đúng?',
      choices: [
        'Tăng volume chạy để vượt qua',
        'Dừng tăng tải và thăm khám — nghi nứt ứng suất xương',
        'Chườm đá rồi chạy tiếp',
        'Đổi giày là hết chuyện',
      ],
      answer: 1,
      explain:
        'Đau điểm cố định trên xương tăng dần là dấu hiệu kinh điển của stress reaction/fracture — cần hình ảnh y tế, không phải "chạy cho quen".',
    },
  ],
  related: {
    muscles: ['gluteus-maximus', 'quadriceps', 'erector-spinae'],
    exercises: ['barbell-back-squat', 'leg-press', 'walking-lunge', 'overhead-press'],
    calculators: [],
    conditions: [],
    evidence: [],
  },
  sources: [
    {
      label: 'OpenStax Anatomy & Physiology — Bone structure & remodeling',
      url: 'https://openstax.org/books/anatomy-and-physiology/pages/6-4-bone-structure',
      license: 'CC BY-NC-SA 4.0 (cite-only)',
    },
    {
      label: 'Andreas Vesalius — De humani corporis fabrica (1543), ảnh bộ xương (đã kiểm tra license)',
      url: 'https://commons.wikimedia.org/wiki/File:Vesalius_Fabrica_p163.jpg',
      license: 'Public domain',
    },
  ],
};
