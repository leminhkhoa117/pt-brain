/**
 * Cấu trúc cơ vân: sợi cơ, sarcomere, gân.
 *
 * Nguồn: OpenStax A&P (cite-only), Gray's Anatomy (cite-only),
 * ảnh Sarcomere.svg của David Richfield (CC BY-SA 3.0, đã kiểm tra license).
 */
export default {
  slug: 'anat-1-2',
  module: 'anat',
  chapter: 1,
  chapterTitle: 'Nền tảng giải phẫu',
  order: 2,
  title: 'Cấu trúc cơ vân: sợi cơ, sarcomere và gân',
  subtitle:
    'Từ cả bó cơ tới từng đơn vị co nhỏ nhất — hiểu kiến trúc này là chìa khóa đọc mọi lý thuyết tập luyện sau này.',
  minutes: 11,
  objectives: [
    'Mô tả cấu trúc phân tầng của cơ: bó cơ → sợi cơ → myofibril → sarcomere cùng các lớp màng bọc.',
    'Giải thích cơ chế trượt sợi (sliding filament) trong sarcomere tạo ra sự co cơ.',
    'Phân biệt gân (nối cơ–xương) với dây chằng (nối xương–xương) và vì sao gân thích ứng chậm hơn cơ.',
    'Nêu 3 hệ quả thực hành trong phòng tập từ kiến trúc này.',
  ],
  sections: [
    {
      heading: 'Cơ được đóng gói thành nhiều tầng',
      body: `Một bắp cơ không phải một khối đồng nhất — nó là **bó sợi xếp lớp** như dây cáp nhiều sợi nhỏ:

- Toàn bộ bắp cơ bọc trong **epimysium** (màng ngoài).
- Bên trong chia thành **bó cơ (fascicle)**, mỗi bó bọc trong **perimysium**.
- Mỗi bó chứa hàng trăm **sợi cơ (muscle fiber)** — mỗi sợi là MỘT tế bào dài (có thể tới hàng chục cm), bọc trong **endomysium**.
- Bên trong một sợi cơ là hàng nghìn **myofibril** — chuỗi đơn vị co xếp nối tiếp nhau.

Sự phân tầng này giải thích vì sao một cơ "lớn" vẫn co được chính xác: hệ thần kinh tuyển chọn **bó sợi** theo nguyên tắc kích thước (size principle) — nhiệm vụ nhẹ gọi ít sợi nhỏ, nhiệm vụ nặng mới gọi sợi to. Kỹ thuật "rèn path thần kinh" của PT thực chất là luyện việc tuyển chọn này.`,
    },
    {
      heading: 'Sarcomere: đơn vị co nhỏ nhất',
      body: `Mỗi myofibril là chuỗi các **sarcomere** nối nhau tại đĩa Z. Sarcomere là "động cơ" thu nhỏ gồm hai loại sợi protein:

- **Sợi mảnh (actin)** gắn vào đĩa Z hai đầu.
- **Sợi dày (myosin)** nằm giữa, có những "đầu cầu" (cross-bridge) nhô ra.

Khi cơ co, đầu myosin bám vào actin, xoay kéo actin **trượt vào giữa** — hai đĩa Z tiến lại gần nhau, sarcomere ngắn lại. Hàng nghìn sarcomere ngắn cùng lúc cộng gộp thành chuyển động thấy được. Cơ **không tự dài ra đẩy** — nó chỉ kéo; duỗi là do lực đối diện (trọng lực, cơ đối kháng).

Hai chi tiết có hậu quả lớn với PT:

1. **Sức mạnh phụ thuộc số lượng cross-bridge đang bám** — tại biên độ quá ngắn hoặc quá giãn, ít cầu bám được → lực yếu nhất. Đó là lý do "phần giữa biên độ" là điểm lực tối ưu, và cũng là lý do nên tập **đủ biên độ**: luyện được cả hai đầu sarcomere kéo giãn (một trong những cơ sở của "tập ở vị trí dài cơ").`,
      image: 'anat-1-2-sarcomere.svg',
    },
    {
      heading: 'Gân: dây truyền lực từ cơ tới xương',
      body: `Sợi cơ chuyển lực sang xương qua **gân (tendon)** — dải collagen gần như không co giãn, đan trực tiếp vào màng xương (periosteum). Điểm nối cơ–gân (**myotendinous junction**) là chỗ thường bị rách khi bật lực quá mạnh khi cơ đang co tối đa (ví dụ sprint rupture gân Achilles).

Điểm PT cần khắc cốt ghi tâm — **gân có máu nuôi kém hơn cơ nhiều**, thích ứng chậm hơn:

- Cơ thích ứng volume mới trong vài tuần; gân cần **hàng tuần tới hàng tháng** củng cố collagen.
- Đổi lịch tập đột ngột (volume nhảy vọt, nghỉ lâu rồi quay lại "yêu như xưa") là kịch bản **tendonopathy** kinh điển — gân chưa kịp lên cấu trúc thì đã phải chịu tải mới.
- Cách nuôi gân bền: **tăng tải từ từ, đều đặn**, ưu tiên tiết tấu chậm có tải (điều này có mặt ở bài Phục hồi chức năng).

**Dây chằng** thì khác gân: nối **xương với xương** giữ khớp; không co, chỉ giới hạn tầm. Cơ/gân chủ động sinh lực — dây chằng bị động giữ khớp.`,
    },
    {
      heading: 'Ba hệ quả trực tiếp cho giáo án của bạn',
      body: `1. **"Cơ ngu ý" là thật**: lỗi kỹ thuật nhiều khi do tuyển chọn sợi chưa hiệu quả — giải pháp là tập nhẹ-nhẹ-nhiều-rep để "tập làm quen đường dây" (motor learning), không phải thêm tạ.
2. **Đừng đổi volume đột ngột**: khi khách quay lại sau 4 tuần nghỉ, giảm 40–50% volume tuần đầu — cơ hồi nhanh, gân chưa.
3. **Kéo giãn có tải tốt hơn buông lỏng**: vị trí sarcomere kéo dài + tải vừa là tín hiệu để cơ và gân thích ứng cấu trúc tốt hơn kiểu chỉ giãn tĩnh thuần.`,
    },
  ],
  applyBox: `**Gian tập thực hành — 3 "kỹ thuật từ sarcomere":**
1. Set "thần kinh" đầu buổi: 2 set × 5 rep tạ 40–50% của bài chính, tốc độ chậm có dừng 2 giây ở vị trí dài cơ — luyện tuyến động + nuôi gân.
2. Hạn chế "che biên độ": ghế hỗ trợ/máy chỉ dùng giai đoạn học; chuyển sang tự do khi kiểm soát được để cả hai đầu sarcomere được làm việc.
3. Khách quay lại sau nghỉ dài: giảm nửa volume tuần 1, giảm 30% tuần 2; theo dõi đau 24 giờ sau mỗi buổi (bài Khoa học về đau).`,
  terms: [
    {
      en: 'Muscle fiber (myocyte)',
      vi: 'Sợi cơ',
      def: 'Một tế bào cơ dài chứa hàng nghìn myofibril; được tuyển chọn theo bó bởi hệ thần kinh.',
    },
    {
      en: 'Sarcomere',
      vi: 'Sarcomere',
      def: 'Đơn vị co nhỏ nhất giữa hai đĩa Z, gồm actin và myosin trượt lên nhau để tạo độ co.',
    },
    {
      en: 'Sliding filament',
      vi: 'Cơ chế trượt sợi',
      def: 'Đầu myosin bám-vào-kéo actin tiến vào giữa; đĩa Z lại gần, sarcomere ngắn lại.',
    },
    {
      en: 'Myotendinous junction',
      vi: 'Điểm nối cơ–gân',
      def: 'Chuyển tiếp sợi cơ sang collagen gân — điểm thường rách khi co tối đại + bật lực đột ngột.',
    },
    {
      en: 'Endomysium / Perimysium / Epimysium',
      vi: 'Màng bọc sợi / bó / bắp cơ',
      def: 'Ba lớp mô liên kết đóng gói sợi → bó → cả bắp; sợi collagen xếp dọc truyền lực ra gân.',
    },
    {
      en: 'Cross-bridge',
      vi: 'Cầu bám myosin',
      def: 'Đầu myosin bám vào actin để kéo; số cầu đang bám quyết định lực tại từng vị trí biên độ.',
    },
  ],
  images: [
    {
      file: 'anat-1-2-sarcomere.svg',
      caption: 'Sơ đồ một sarcomere: sợi actin (mảnh) và myosin (dày) giữa hai đĩa Z.',
      source: 'David Richfield / Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Sarcomere.svg',
      license: 'CC BY-SA 3.0',
    },
  ],
  quiz: [
    {
      q: 'Thứ tự đóng gói đúng của cơ từ nhỏ tới lớn là gì?',
      choices: [
        'Sarcomere → myofibril → sợi cơ → bó cơ → cả bắp',
        'Bắp → sợi cơ → sarcomere → myofibril',
        'Myofibril → sarcomere → bó cơ → sợi cơ',
        'Sợi cơ → sarcomere → bắp → bó cơ',
      ],
      answer: 0,
      explain:
        'Sarcomere nằm trong myofibril; myofibril nằm trong một sợi cơ (một tế bào); nhiều sợi thành bó (fascicle); nhiều bó thành cả bắp cơ.',
    },
    {
      q: 'Cơ duỗi ra ở cuối mỗi rep nhờ cơ chế nào?',
      choices: [
        'Myosin đẩy actin ra ngoài',
        'Lực đối diện (trọng lực, cơ đối kháng) kéo sarcomere dài lại — cơ chỉ biết kéo, không đẩy',
        'Gân co lại đẩy xương',
        'Sarcomere tự nảy như lò xo độc lập với ngoài',
      ],
      answer: 1,
      explain:
        'Sarcomere chỉ co bằng trượt sợi; pha "duỗi" là passive nhờ trọng lực/cơ đối kháng — vì vậy kiểm soát pha hạ (eccentric) là kỹ thuật quan trọng.',
    },
    {
      q: 'Vì sao lực cơ yếu nhất ở biên độ quá ngắn hoặc quá giãn?',
      choices: [
        'Vì lúc đó ít cross-bridge myosin bám được vào actin',
        'Vì gân bị teo',
        'Vì mất máu nuôi cơ',
        'Vì đĩa Z cứng lại',
      ],
      answer: 0,
      explain:
        'Số cầu bám đang hoạt động quyết định lực; hai đầu biên độ làm giảm chồng lấp actin–myosin → ít cầu hơn, lực kém hơn.',
    },
    {
      q: 'Khách nghỉ 4 tuần rồi quay lại tập như xưa. Rủi ro lớn nhất nằm ở đâu?',
      choices: [
        'Cơ teo lại hoàn toàn không hồi phục',
        'Gân chưa kịp củng cố cấu trúc theo volume cũ — nguy cơ phản ứng gân/tổn thương cơ–gân',
        'Dây chằng tự chảy',
        'Xương dài ra bất thường',
      ],
      answer: 1,
      explain:
        'Cơ hồi sức mạnh khá nhanh (thích ứng thần kinh + MPS), gân thì chậm — giảm volume 40–50% tuần đầu là quy tắc an toàn.',
    },
    {
      q: 'Điểm khác biệt căn bản giữa gân và dây chằng là gì?',
      choices: [
        'Gân nối cơ–xương; dây chằng nối xương–xương',
        'Gân co giãn được như cơ; dây chằng không',
        'Cả hai đều nối cơ với cơ',
        'Dây chằng có máu nuôi tốt hơn gân',
      ],
      answer: 0,
      explain:
        'Gân truyền lực chủ động từ cơ sang xương; dây chằng giữ khớp bị động. Cả hai đều kém máu nuôi và lành chậm.',
    },
    {
      q: 'Kỹ thuật "set nhẹ đầu buổi, tạ 40–50%, tốc độ chậm" phục vụ mục tiêu gì?',
      choices: [
        'Đốt calo tối đa',
        'Luyện tuyển chọn sợi (đường dây thần kinh) và nuôi gân trước khi vào tải nặng',
        'Giảm cân nặng cơ thể',
        'Thay thế bài chính trong giáo án',
      ],
      answer: 1,
      explain:
        'Set "rèn đường dây" giúp tuyến động trơn tru và chuẩn bị mô mềm — đặc biệt quý khi học bài mới hoặc quay lại sau nghỉ.',
    },
  ],
  related: {
    muscles: ['biceps-brachii', 'quadriceps', 'gastrocnemius'],
    exercises: [],
    calculators: [],
    conditions: [],
    evidence: [],
  },
  sources: [
    {
      label: 'OpenStax Anatomy & Physiology — Muscle fibers, sarcomere & sliding filament',
      url: 'https://openstax.org/books/anatomy-and-physiology/pages/10-2-skeletal-muscle',
      license: 'CC BY-NC-SA 4.0 (cite-only)',
    },
    {
      label: "Gray's Anatomy of the Human Body, 20th ed. (1918) — Myology",
      url: 'https://www.bartleby.com/lit-hub/grays-anatomy-of-the-human-body/',
      license: 'Public domain (cite-only)',
    },
    {
      label: 'Sarcomere diagram — David Richfield (ảnh minh hoạ)',
      url: 'https://commons.wikimedia.org/wiki/File:Sarcomere.svg',
      license: 'CC BY-SA 3.0',
    },
  ],
};
