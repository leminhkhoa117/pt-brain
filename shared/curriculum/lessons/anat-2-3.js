/**
 * Cơ vai và rotator cuff.
 *
 * Nguồn: Gray's Anatomy (public domain), OpenStax A&P (cite-only),
 * health conditions `shoulder_pain` của PT Brain.
 */
export default {
  slug: 'anat-2-3',
  module: 'anat',
  chapter: 2,
  chapterTitle: 'Hệ cơ theo vùng',
  order: 3,
  title: 'Cơ vai và rotator cuff',
  subtitle:
    'Deltoid ba bó, bốn cơ chỏm xoay giữ chỏm khớp — vì sao vai là khớp linh hoạt nhất và cũng dễ tổn thương nhất.',
  minutes: 12,
  objectives: [
    'Gọi tên 3 bó của deltoid và hành động khớp tương ứng của mỗi bó.',
    'Liệt kê 4 cơ rotator cuff (SITS) và vai trò "giữ chỏm xương cánh tay vào ổ khớp" của chúng.',
    'Giải thích vì sao khớp vai đánh đổi độ ổn định để lấy tầm vận động — và hệ quả khi tập overhead.',
    'Chọn và điều chỉnh bài tập an toàn cho khách có tiền sử đau vai.',
  ],
  sections: [
    {
      heading: 'Deltoid: động cơ chính của vai',
      body: `Cơ delta (deltoid) bao quanh khớp vai như một cái khiên, chia làm **3 bó** theo ba hướng sợi:

- **Bó trước (anterior)**: gấp vai (đưa tay ra trước lên) và khép-vào theo phương ngang — làm việc nhiều trong bench press, đẩy ngực nghiêng.
- **Bó giữa (middle)**: khép-ra (abduction) — "đặc sản" của lateral raise.
- **Bó sau (posterior)**: duỗi vai và khép-ra theo phương ngang (đưa tay ra sau, kéo) — hoạt động trong face pull, rear delt fly, và các động tác rowing.

Với PT, ba bó này giải thích vì sao "vai to" cần nhiều hơn một bài: đẩy overhead thiên bó trước, lateral raise thiên bó giữa, kéo/row thiên bó sau. Lịch tập lệch hẳn về đẩy (press-heavy) mà thiếu kéo thường tạo khách "bó trước căng, bó sau yếu" — một trong những mẫu tư thế phổ biến nhất phòng gym.`,
      image: 'anat-2-3-deltoid.png',
    },
    {
      heading: 'Rotator cuff: bốn "người gác cổng"',
      body: `Chỏm xương cánh tay (head of humerus) nằm trong một ổ khớp rất nông — người ta ví như quả bóng tenis đặt trên một cái đĩa lệch. Bốn cơ nhỏ giữ nó không rơi khỏi "đĩa" đó, gọi chung là **rotator cuff (chỏm xoay)**, nhớ theo bộ tứ **SITS**:

- **S**upraspinatus (trên gai): giúp khép-ra tay ở góc đầu và **nén chỏm vào ổ khớp** trong mọi động tác nâng tay.
- **I**nfraspinatus (dưới gai): xoay ngoài vai (external rotation).
- **T**eres minor (cơ tròn bé): xoay ngoài và khép-vào nhẹ.
- **S**ubscapularis (dưới bả vai): xoay trong vai (internal rotation).

Điểm mấu chốt PT cần nhớ: rotator cuff **không sinh ra lực lớn** — nó ổn định. Khi khách đẩy tạ trên đầu, cả bốn cơ phải "siết" đúng nhịp để chỏm không cọ xát vào vòm vai. Đó là lý do tập overhead với tạ quá nặng + kỹ thuật xấu là kịch bản chấn thương vai kinh điển.`,
    },
    {
      heading: 'Vì sao vai dễ "impingement"',      body: `Khớp vai (glenohumeral) là khớp có **tầm vận động lớn nhất cơ thể**, đổi lại bằng một ổ khớp rất nông và hệ dây chằng khá lỏng. Giữa chỏm xương và vòm xương (mỏm cùng vai — acromion) có một khoảng hẹp mà gân supraspinatus và túi hoạt dịch phải chui qua.

**Impingement (chèn ép)** xảy ra khi khoảng hẹp đó bị "đè bẹp" lặp lại: nâng tay quá đầu kèm xoay trong, đẩy overhead lệch trục, hoặc tư thế vai bị kéo trước (anterior tilt) làm gân cọ xát vào xương. Dấu hiệu thường gặp: đau khi nâng tay ngang 60–120 độ, khó mặc áo, đau khi nằm đè lên vai.

PT không chẩn đoán — nhưng nhận ra mẫu chuyển động nguy cơ này giúp bạn chọn bài an toàn hơn: đổi thanh tạ đòn sang **tay cầm trung tính (neutral grip)**, đẩy **landmine press** thay overhead thẳng, thêm **face pull** để cân bằng kéo–đẩy.`,
    },
    {
      heading: 'Điều chỉnh cho khách đau vai',
      body: `Quy tắc thực hành khi khách có tiền sử đau vai (kèm quy tắc an toàn đã có trong PT Brain khi lập giáo án):

1. **Giữ cẳng tay trung tính hoặc hơi xoay trong** khi đẩy — giảm xoay ngoài tại vị trí vòm vai thấp.
2. Ưu tiên bài đẩy có tựa (máy, ghế) trong giai đoạn còn đau; tạ tự do khi đã ổn định.
3. Không bỏ qua bó sau: 2–3 bài kéo mỗi tuần (face pull, rear delt fly, row).
4. Vẫn giữ tập kháng lực cho vùng khác — "đau vai" không có nghĩa "nghỉ toàn thân".
5. Đau tăng khi tập hoặc đau về đêm kéo dài → dừng tăng tải và hướng khách đi bác sĩ/physio.`,
    },
  ],
  applyBox: `**Gian tập thực hành — đánh giá nhanh động tác overhead của khách:**
- Đứng nghiêng quan sát: khi khách đẩy overhead, xương sườn có bùng ra trước không (rib flare)? Nếu có → core chưa khóa, trước tiên fix brace + giảm tầm nâng xuống 80–90%.
- Nghe tiếng "cọ xát" hoặc thấy khách né nâng tay ngang → thay bằng landmine press 2 tuần, thêm face pull 3 set × 15.
- Chương trình cân bằng tối thiểu: số set kéo ≥ 2/3 số set đẩy mỗi tuần cho khách văn phòng ngồi nhiều.
- Dùng nút "Xem trong 3D" bên dưới để chỉ cho khách vị trí deltoid/rotator cuff — khách hiểu nhanh hơn khi thấy hình.`,
  safetyBox:
    'Bài học nói về giải phẫu, không phải chẩn đoán. Đau vai kèm tê tay, yếu rõ rệt (không nâng được tay ngang), đau về đêm không giảm sau 2–4 tuần hoặc có chấn thương mạnh (té chống tay) cần được bác sĩ/physio thăm khám trước khi tiếp tục tải.',
  terms: [
    {
      en: 'Deltoid',
      vi: 'Cơ delta',
      def: 'Cơ bao quanh vai chia 3 bó: trước (gấp vai), giữa (khép-ra), sau (duỗi và khép-ra ngang).',
    },
    {
      en: 'Rotator cuff (SITS)',
      vi: 'Chỏm xoay',
      def: 'Bốn cơ supraspinatus, infraspinatus, teres minor, subscapularis giữ chỏm xương cánh tay ổn định trong ổ khớp.',
    },
    {
      en: 'Impingement',
      vi: 'Chèn ép vai',
      def: 'Gân supraspinatus/túi hoạt dịch bị đè giữa chỏm xương và vòm vai khi nâng tay lặp lại; đau điển hình 60–120 độ.',
    },
    {
      en: 'Glenohumeral joint',
      vi: 'Khớp vai chính',
      def: 'Khớp cầu giữa chỏm xương cánh tay và ổ vai rất nông — linh hoạt nhất nhưng kém ổn định nhất cơ thể.',
    },
    {
      en: 'Neutral grip',
      vi: 'Tay cầm trung tính',
      def: 'Bàn tay quay vào giữa (lòng bàn tay đối diện nhau) — giảm xoay ngoài vai và áp lực lên vòm khi đẩy.',
    },
    {
      en: 'Scapulohumeral rhythm',
      vi: 'Nhịp bả vai–cánh tay',
      def: 'Sự phối hợp giữa khớp vai và xương bả vai khi nâng tay; mất nhịp này là nguồn đau vai thường gặp.',
    },
  ],
  images: [
    {
      file: 'anat-2-3-deltoid.png',
      caption: 'Cơ vùng mặt sau vai và cơ tam đầu cánh tay (bản khắc Gray\u2019s Anatomy, Plate 412).',
      source: "Gray's Anatomy / Wikimedia Commons",
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gray412.png',
      license: 'Public domain',
    },
  ],
  quiz: [
    {
      q: 'Bó giữa (middle deltoid) chịu trách nhiệm chính cho hành động khớp nào?',
      choices: ['Gấp vai ra trước', 'Khép-ra (abduction) vai', 'Xoay trong vai', 'Duỗi khuỷu'],
      answer: 1,
      explain:
        'Bó giữa delta là động lực chính khi khép-ra tay ngang — lý do lateral raise nhắm vào bó này.',
    },
    {
      q: 'Cơ nào trong rotator cuff chủ yếu làm xoay TRONG vai (internal rotation)?',
      choices: ['Supraspinatus', 'Infraspinatus', 'Subscapularis', 'Teres minor'],
      answer: 2,
      explain:
        'Subscapularis nằm trước khớp vai và là cơ xoay trong duy nhất của chỏm xoay; ba cơ còn lại thiên xoay ngoài/trợ khép-ra.',
    },
    {
      q: 'Vì sao vai dễ bị chấn thương hơn so với hông?',
      choices: [
        'Rotator cuff quá mạnh nên kéo lệch xương',
        'Ổ khớp nông và dây chằng lỏng — đổi ổn định lấy tầm vận động',
        'Không có sụn khớp',
        'Deltoid yếu hơn mọi cơ chi dưới',
      ],
      answer: 1,
      explain:
        'Vai tối ưu cho tầm vận động: ổ glenoid rất nông, phần lớn ổn định dựa vào cơ chỏm xoay — nên khi cơ này mệt hoặc lệch nhịp, chỏm dễ cọ vào vòm.',
    },
    {
      q: 'Khách đau vai kiểu impingement. Điều chỉnh nào hợp lý nhất trong giai đoạn còn đau?',
      choices: [
        'Tăng tạ overhead để "vượt qua" cơn đau',
        'Chuyển sang landmine press với tay cầm trung tính, giữ volume kéo như face pull',
        'Nghỉ hoàn toàn toàn thân 4 tuần',
        'Chỉ tập bench press thẳng với tạ tối đa',
      ],
      answer: 1,
      explain:
        'Landmine press giữ hướng đẩy xiên, giảm vị trí chèn ép; face pull duyền bó sau và xoay ngoài giúp cân bằng. Nghỉ tuyệt đối làm mất thích ứng, còn đẩy đau thì tăng kích thích tổn thương.',
    },
    {
      q: 'Supraspinatus làm gì khi bạn nâng tay ngang?',
      choices: [
        'Chỉ xoay ngoài',
        'Nén chỏm xương cánh tay vào ổ khớp và trợ khép-ra ở góc đầu',
        'Gấp khuỷu',
        'Kéo bả vai ra trước',
      ],
      answer: 1,
      explain:
        'Ngoài vai trò trợ khép-ra 0–15 độ, supraspinatus siết để "hút" chỏm vào ổ khớp trong mọi lần nâng tay — gánh nặng này cũng là lý do gân nó dễ bị chèn ép.',
    },
    {
      q: 'Chương trình nghiêng đẩy (press-heavy), thiếu kéo thường tạo hệ quả gì ở khách văn phòng?',
      choices: [
        'Bó sau delta và xoay ngoài yếu, vai bị kéo trước — mẫu tư thế phổ biến',
        'Chân to hơn tay',
        'Cơ tim phát triển bất thường',
        'Không có hệ quả gì đáng kể',
      ],
      answer: 0,
      explain:
        'Đẩy lặp lại co ngực/bó trước + ngồi nhiều làm bó sau và cơ lưng dưới vai yếu → bả vai tiến trước, tăng nguy cơ chèn ép khi nâng tay.',
    },
  ],
  related: {
    muscles: ['deltoid', 'supraspinatus', 'infraspinatus', 'teres-minor', 'subscapularis', 'trapezius'],
    exercises: ['overhead-press', 'dumbbell-shoulder-press', 'lateral-raise', 'rear-delt-fly', 'face-pull'],
    calculators: [],
    conditions: ['shoulder_pain'],
    evidence: [],
  },
  sources: [
    {
      label: "Gray's Anatomy of the Human Body (Plate 412 — dorsal muscles of the shoulder)",
      url: 'https://commons.wikimedia.org/wiki/File:Gray412.png',
      license: 'Public domain',
    },
    {
      label: 'OpenStax Anatomy & Physiology — Axial muscles & shoulder complex',
      url: 'https://openstax.org/books/anatomy-and-physiology/pages/11-3-axial-muscles-of-the-head-neck-and-back',
      license: 'CC BY-NC-SA 4.0 (cite-only)',
    },
  ],
};
