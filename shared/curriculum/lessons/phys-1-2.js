/**
 * Cơ chế co cơ: excitation-contraction coupling và cơn co tetanus.
 *
 * Nguồn: OpenStax A&P (cite-only), Gray's Anatomy (cite-only).
 */
export default {
  slug: 'phys-1-2',
  module: 'phys',
  chapter: 1,
  chapterTitle: 'Cơ & kích hoạt',
  order: 2,
  title: 'Cơ chế co cơ: từ tín hiệu thần kinh tới cơn co tetanus',
  subtitle:
    'Calcium mở cửa cầu bám, xung dày cộng dồn lực thành tetanus — vì sao cơ "gồng" được liên tục chứ không rung từng nhịp.',
  minutes: 10,
  objectives: [
    'Mô tả chuỗi kích hoạt–co (excitation-contraction coupling): từ xung thần kinh tới calcium giải phóng.',
    'Giải thích vai trò của calcium với troponin/tropomyosin trong việc mở cầu bám.',
    'Phân biệt twitch đơn, cộng dồn lực (summation) và tetanus.',
    'Rút ra 2 hệ quả thực hành cho kỹ thuật giữ tải và tempo tập.',
  ],
  sections: [
    {
      heading: 'Xung đến đâu, calcium đến đó',
      body: `Chuỗi sự kiện khi não ra lệnh co cơ (đơn giản hoá đúng trình tự):

1. **Neuron vận động** phát xung, chất dẫn truyền tại điểm nối thần kinh–cơ kích hoạt màng sợi cơ.
2. Tín hiệu lan dọc màng sợi và **xuống ống ngang (T-tubule)** — "đường hầm" chạm tới kho chứa calcium trong cơ.
3. **Calcium (Ca²⁺)** tràn ra khỏi mạng cơ tương (sarcoplasmic reticulum) quanh các myofibril.
4. Ca²⁺ gắn vào **troponin** → đẩy **tropomyosin** hở vị trí bám trên actin → đầu myosin bám-vào-kéo (bài Sarcomere đã dựng kiến trúc).
5. Hết xung, bơm đưa Ca²⁺ về kho — cầu bám đóng lại, cơ giãn.

Toàn chuỗi diễn ra trong **mili-giây**. Đây là lý do "khởi động thần kinh" có thật: vài rep nhẹ trước bài nặng chạy thử trọn đường ống tín hiệu–calcium, các lần sau trơn hơn.`,
      image: 'phys-1-2-sliding.webp',
    },
    {
      heading: 'Twitch đơn: một xung, một nhịp co',
      body: `Một xung duy nhất tạo một **twitch** — sợi co rồi giãn. Twitch của cơ nhanh chỉ ~50 ms; cơ chậm dài hơn.

Vấn đề: lực của twitch đơn quá nhỏ so với nhu cầu thật. Hệ thần kinh xử bằng hai cách (nối tiếp bài Motor unit):

- **Tuyển thêm unit** (nhiều gói cùng co).
- **Tăng tần số xung tới cùng một unit** — xung sau đến *trước khi sợi kịp giãn hết*: các cơn co chồng lên nhau, lực cộng dồn.`,
    },
    {
      heading: 'Summation và tetanus: vì sao cơ "gồng" được',
      body: `Khi tần số xung đủ dày:

- **Summation (cộng dồn)**: sợi chưa giãn hết đã nhận xung mới — lực nhích dần lên, rung nhẹ nếu tần số chưa đủ đều.
- **Tetanus**: tần số tới mức sợi **không kịp giãn giữa các xung** — co trơn, lực tối đa và giữ ổn định.

Mọi lần bạn "gồng giữ" plank, siết bám tạ, giữ hàng phục vụ đều là **tetanus chức năng** — không phải từng nhịp rung. Ba hệ quả cho giáo án:

1. **Tempo có mục đích**: giữ đỉnh 1–2 giây (ví dụ đỉnh hip thrust, đỉnh row) khai thác pha tetanus tần số cao — bạn đang "đôn thêm xung" một cách có chủ đích.
2. **Pha giãn cũng kiểm soát được**: nhịp buông nhanh = calcium về kho nhanh; nhịp hạ 3 giây = cầu bám làm việc trong khi giãn (eccentric — liên hệ bài DOMS).
3. **Chuột rút là tetanus ngoài ý muốn**: mất cân bằng điện giải/mệt khiến xung tự phát dồn dập — xử lý nghỉ + nước/electrolyte, không phải "co thêm cho hết".`,
    },
  ],
  applyBox: `**Gian tập thực hành — dùng tempo có chủ đích theo cơ chế co:**
1. Bài row/hip thrust: giữ đỉnh 1 giây, cue "bóp 1 nhịp" — tăng thời gian tetanus với tải.
2. Bài hạ (RDL, squat): hạ 2–3 giây kiểm soát — eccentric có tải, đồng thời tập nhịp giãn chủ động.
3. Set "rèn tín hiệu" đầu buổi: 1 set nhẹ, rep chậm đều 2-0-2 — chạy trọn đường calcium, mượt hệ thần kinh trước khi vào tải.`,
  terms: [
    {
      en: 'Excitation-contraction coupling',
      vi: 'Ghép cặp kích hoạt–co',
      def: 'Chuỗi từ xung thần kinh → T-tubule → giải phóng calcium → mở cầu bám → co cơ, trong vài mili-giây.',
    },
    {
      en: 'Sarcoplasmic reticulum',
      vi: 'Mạng cơ tương',
      def: 'Kho chứa calcium quanh myofibril; giải phóng Ca²⁺ khi có xung, thu hồi khi hết — công tắc của từng nhịp co.',
    },
    {
      en: 'Troponin / Tropomyosin',
      vi: 'Troponin / Tropomyosin',
      def: 'Bộ khóa trên actin: Ca²⁺ gắn troponin làm tropomyosin hở vị trí bám cho myosin.',
    },
    {
      en: 'Twitch',
      vi: 'Cơn co đơn',
      def: 'Một xung → một nhịp co-giãn; lực đơn quá nhỏ so với nhu cầu thực tế.',
    },
    {
      en: 'Summation / Tetanus',
      vi: 'Cộng dồn / Tetanus',
      def: 'Xung dày khiến cơn co chồng nhau; tần số đủ → co trơn liên tục với lực tối đa (gồng giữ tư thế).',
    },
    {
      en: 'Cramp',
      vi: 'Chuột rút',
      def: 'Tetanus ngoài ý muốn do xung tự phát dồn dập khi mệt/mất cân bằng điện giải — nghỉ và bù nước/electrolyte.',
    },
  ],
  images: [
    {
      file: 'phys-1-2-sliding.webp',
      caption: 'Mô hình trượt sợi: đầu myosin bám vào actin và kéo, làm sarcomere ngắn lại.',
      source: 'OpenStax / Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:1006_Sliding_Filament_Model_of_Muscle_Contraction.jpg',
      license: 'CC BY 4.0',
    },
  ],
  quiz: [
    {
      q: 'Calcium đóng vai trò gì trong co cơ?',
      choices: [
        'Cung cấp ATP trực tiếp',
        'Gắn vào troponin, mở tropomyosin để myosin bám actin được',
        'Thay thế myosin',
        'Làm lạnh sợi cơ',
      ],
      answer: 1,
      explain:
        'Ca²⁺ là "chìa khóa" mở vị trí bám: hết calcium về kho thì cầu bám đóng, cơ giãn — công tắc của từng nhịp.',
    },
    {
      q: 'Tetanus xảy ra khi nào?',
      choices: [
        'Một xung duy nhất tới sợi',
        'Tần số xung dày tới mức sợi không kịp giãn giữa các xung — co trơn, lực tối đa',
        'Sợi mất calcium hoàn toàn',
        'Neuron ngừng phát',
      ],
      answer: 1,
      explain:
        'Tetanus là cộng dồn tới giới hạn: mọi cơn co chồng khít nhau — chính là trạng thái "gồng" của plank hay giữ tạ.',
    },
    {
      q: 'Vì sao giữ đỉnh bài row 1 giây có tác dụng thật về mặt cơ chế?',
      choices: [
        'Chỉ để chụp ảnh đẹp',
        'Kéo dài pha tetanus tần số cao — thêm thời gian sợi ở lực trơn với cùng một tải',
        'Giảm lưu thông máu tới 0',
        'Làm calcium tự sinh',
      ],
      answer: 1,
      explain:
        'Giữ đỉnh = duy trì dòng xung dồn dập: thời gian dưới căng tăng mà không cần thêm tạ — một biến số miễn phí.',
    },
    {
      q: 'Khách bị chuột rút giữa buổi tập nóng. Hướng xử lý đúng?',
      choices: [
        'Tập tiếp để "co hết cơn"',
        'Nghỉ nhẹ nhàng, duỗi cơ nhẹ và bù nước/electrolyte — rút là tetanus ngoài ý muốn khi mệt/mất cân bằng',
        'Chườm đá lên mặt toàn thân',
        'Uống nước lọc thật nhiều ngay lập tức',
      ],
      answer: 1,
      explain:
        'Rút do xung tự phát khi mệt/thiếu điện giải: nghỉ, duỗi nhẹ, bù dịch có điện giải nếu đổ mồ hôi nhiều; lặp lại nhiều lần thì xem lại volume và uống.',
    },
    {
      q: 'Nhịp hạ 3 giây (eccentric chậm) có liên quan gì tới calcium?',
      choices: [
        'Không liên quan gì',
        'Nhịp giãn bị kéo dài trong khi cầu bám vẫn làm việc — tải đặt vào pha "đang đóng dần" của cơ',
        'Làm calcium tăng vọt không kiểm soát',
        'Ngừng hoàn toàn giải phóng calcium',
      ],
      answer: 1,
      explain:
        'Eccentric kiểm soát = giãn chủ động: myosin vẫn "phanh" trong lúc calcium rút dần — một trong các cơ chế làm DOMS (bài kế tiếp module Mệt mỏi).',
    },
  ],
  related: {
    muscles: ['biceps-brachii', 'rectus-abdominis', 'gastrocnemius'],
    exercises: ['plank', 'seated-cable-row', 'hip-thrust', 'romanian-deadlift'],
    calculators: [],
    conditions: [],
    evidence: [],
  },
  sources: [
    {
      label: 'OpenStax Anatomy & Physiology — Muscle fiber excitation, contraction & calcium control',
      url: 'https://openstax.org/books/anatomy-and-physiology/pages/10-3-muscle-fiber-excitationcontraction-coupling',
      license: 'CC BY-NC-SA 4.0 (cite-only)',
    },
    {
      label: "Gray's Anatomy of the Human Body, 20th ed. (1918) — cấu trúc sợi cơ",
      url: 'https://www.bartleby.com/lit-hub/grays-anatomy-of-the-human-body/',
      license: 'Public domain (cite-only)',
    },
  ],
};
