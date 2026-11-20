/**
 * Cơ cẳng chân: gastrocnemius, soleus và nhóm trước.
 *
 * Nguồn: Gastrocnemius.png (CC BY-SA 3.0, đã kiểm tra license),
 * OpenStax A&P (cite-only).
 */
export default {
  slug: 'anat-2-8',
  module: 'anat',
  chapter: 2,
  chapterTitle: 'Hệ cơ theo vùng',
  order: 8,
  title: 'Cơ cẳng chân: đôi động cơ "lò xo" của mỗi bước chạy',
  subtitle:
    'Gastrocnemius hai khớp và soleus một khớp — hai cơ quyết định vì sao đứng nhón khác ngồi nhón, và vì sao Achilles là gân dễ phản ứng nhất phòng gym.',
  minutes: 10,
  objectives: [
    'Phân biệt gastrocnemius và soleus về điểm bám và tư thế hoạt động tối ưu.',
    'Giải thích vì sao standing calf raise và seated calf raise nhắm hai cơ khác nhau.',
    'Mô tả vai trò của nhóm cơ trước cẳng chân (tibialis anterior) và liên hệ với shin splints.',
    'Áp dụng nguyên tắc tăng tải chậm cho gân Achilles khi thêm plyometric/sprint.',
  ],
  sections: [
    {
      heading: 'Gastrocnemius: cơ hai khớp của đứng nhón',
      body: `Cơ bụng chân (**gastrocnemius**) có hai đầu bám từ trên dưới lồi cầu xương đùi — chạy **qua cả khớp gối** xuống gân Achilles vào gót. Chức năng: **duỗi gan cổ chân (plantarflexion)** và trợ gấp gối.

Vì bám qua gối, nó chỉ co hiệu quả khi **gối đang duỗi** (đứng nhón) — khi gối gập, cơ đã bị ngắn hóa từ đầu trên. Đây là lý do kinh điển: **standing calf raise (gối thẳng) nhắm gastrocnemius**.`,
      image: 'anat-2-8-calf.png',
    },
    {
      heading: 'Soleus: động cơ "chạy marathon" nằm dưới',
      body: `**Soleus** nằm dưới gastrocnemius, bám từ xương chày/má tới gân Achilles — **chỉ qua khớp cổ chân**. Nó giàu sợi chậm, hoạt động mọi tư thế gối: đứng, ngồi, và gần như **mỗi bước đi/chạy** để đẩy thân về trước.

Hệ quả chọn bài: **seated calf raise (gối gập ~90°) tắt bớt gastrocnemius, nhắm soleus**. Với khách chạy bộ/đi bộ nhiều, soleus là "bạn đồng hành" cần volume đều đặn.

Điểm hay bị bỏ quên: soleus còn là **bơ cơ học ("peripheral heart")** — mỗi lần co, nó đẩy máu tĩnh mạch từ chân về tim. Đi đứng lâu mỏi chân một phần vì bơ này lười vận động.`,
    },
    {
      heading: 'Nhóm trước cẳng chân và shin splints',
      body: `Mặt trước ngoài cẳng chân có **tibialis anterior** (gập mu cổ chân — nâng bàn chân khi bước) cùng nhóm duỗi ngón. Nhóm này đối kháng với bộ đôi sau: mỗi bước chạy là một vòng co–giãn liên tục.

**Shin splints** (đau mặt trước trong cẳng chân khi chạy) thường xuất hiện khi volume bước/độ cứng đột ngột tăng (chạy mới, đổi giày, chạy đường dốc). Bản chất phần lớn là phản ứng mô mềm quanh xương chày do tải lặp — xử lý bằng: giảm volume, mặt phẳng mềm hơn, tăng dần như mọi gân khác, và tăng cường nhóm sau (calf raise) để chia sẻ việc hấp thu lực.

Dấu hiệu cần khám y tế thay vì "chạy cho quen": đau nhói điểm cố định trên một chỗ xương, đau tăng dần từng buổi, hoặc tê bàn chân.`,
    },
    {
      heading: 'Achilles: gân "kén chọn" nhịp độ tăng tải',
      body: `Gân Achilles là gân to nhất cơ thể nhưng cũng là nơi **phản ứng tải đột ngột** rõ nhất: sprint/plyometric/bốc shoe đột ngột sau thời gian chỉ tập tạ chậm là kịch bản tendinopathy kinh điển.

Nguyên tắc thêm công việc mới cho Achilles:

1. Tuần 1–2: nhón thân không tải, chú ý kiểm soát pha hạ (eccentric chậm).
2. Tuần 3–4: calf raise có tải, 2 buổi/tuần, tăng 5–10% khi không khó chịu kéo dài.
3. Chỉ thêm sprint/nhảy sau khi calf raise đã đạt tải thân ×1.5 mà không phản ứng đau 24 giờ.

Pha hạ (đưa gót xuống chậm 3 giây) là "việc nhà" nuôi gân — hãy đặt nó trong giáo án như một mục tiêu thật, không phải phần bỏ đi.`,
    },
  ],
  applyBox: `**Gian tập thực hành — 10 phút cẳng chân hoàn chỉnh (cuối buổi chân):**
1. Standing calf raise 3 × 10–12, gối thẳng, hạ chậm 3 giây — gastrocnemius.
2. Seated calf raise 3 × 12–15, gối gập — soleus.
3. Tibialis raise (đứng, nhấc mu chân) 2 × 15 — nhóm trước cân bằng.
4. Khách mới quay lại chạy: tuần đầu giảm 50% số bước so với trước nghỉ, tăng lại 10%/tuần.`,
  terms: [
    {
      en: 'Gastrocnemius',
      vi: 'Cơ bụng chân',
      def: 'Hai đầu bám từ xương đùi qua gối: duỗi gan cổ chân hiệu quả khi gối duỗi — bài standing calf raise.',
    },
    {
      en: 'Soleus',
      vi: 'Cơ gan chân',
      def: 'Một khớp, giàu sợi chậm, hoạt động mọi tư thế gối và mỗi bước; bài seated calf raise; còn là "bơ máu" tĩnh mạch chân.',
    },
    {
      en: 'Achilles tendon',
      vi: 'Gân gót',
      def: 'Gân to nhất cơ thể, gộp gân của gastrocnemius và soleus; kén nhịp độ tăng tải sprint/nhảy.',
    },
    {
      en: 'Shin splints',
      vi: 'Đau mặt trước cẳng chân',
      def: 'Phản ứng mô mềm quanh xương chày khi volume bước tăng đột ngột; giảm tải + tăng dần là hướng xử lý chính.',
    },
    {
      en: 'Tibialis anterior',
      vi: 'Cơ chày trước',
      def: 'Gập mu cổ chân, đối kháng nhóm sau; yếu mất cân bằng khi chỉ tập calf mà bỏ nhóm trước.',
    },
    {
      en: 'Eccentric calf raise',
      vi: 'Nhón có hạ chậm',
      def: 'Pha hạ gót 3 giây dưới kiểm soát — "việc nhà" nuôi gân Achilles có bằng chứng.',
    },
  ],
  images: [
    {
      file: 'anat-2-8-calf.png',
      caption: 'Cơ bụng chân và đường gân Achilles (ảnh minh hoạ giải phẫu).',
      source: 'Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gastrocnemius.png',
      license: 'CC BY-SA 3.0',
    },
  ],
  quiz: [
    {
      q: 'Vì sao seated calf raise (gối gập) "tắt bớt" gastrocnemius?',
      choices: [
        'Gối gập chặn máu tới cơ',
        'Gối gập làm gastrocnemius bị ngắn hóa từ đầu trên (bám vào xương đùi) nên không co tối ưu — soleus gánh chính',
        'Gastrocnemius không bám vào gân Achilles',
        'Seated calf raise chỉ tác động tới đùi',
      ],
      answer: 1,
      explain:
        'Cơ hai khớp như gastrocnemius mất biên độ co khi một khớp (gối) đã gập — soleus một khớp vẫn co tốt mọi tư thế.',
    },
    {
      q: 'Nhóm cơ nào được ví như "bơ tim ngoại vi" đẩy máu tĩnh mạch chân về tim?',
      choices: ['Tibialis anterior', 'Soleus', 'Cơ delta', 'Cơ ngực lớn'],
      answer: 1,
      explain:
        'Mỗi lần soleus co khi bước đi, nó ép máu tĩnh mạch từ chân lên — lý do đứng yên lâu chân nặng trĩu, đi lại lại nhẹ hơn.',
    },
    {
      q: 'Khách chỉ tập tạ chậm, muốn thêm sprint. Lịch chuyển nào an toàn cho Achilles?',
      choices: [
        'Sprint tối đa ngay buổi đầu',
        'Vài tuần nhón có tải + hạ chậm trước, sau đó thêm sprint từng bước khi không khó chịu 24 giờ',
        'Không bao giờ chạy được nếu đã tập tạ',
        'Chỉ cần giãn gót trước khi chạy',
      ],
      answer: 1,
      explain:
        'Gân cần thời gian củng cố cấu trúc theo loại tải mới (co nhanh + hấp thu lực) — nguyên tắc giống mọi gân: tăng từ từ, theo dõi phản ứng 24 giờ.',
    },
    {
      q: 'Đau "shin splints" khi khách mới chạy nên xử lý đầu tiên bằng gì?',
      choices: [
        'Chạy tiếp cho quen đau',
        'Giảm volume bước, mặt phẳng mềm hơn, quay lại tăng dần; dolor cố định một điểm trên xương thì đi khám',
        'Bóp voi chân mỗi tối là đủ',
        'Đổi sang chỉ tập tay',
      ],
      answer: 1,
      explain:
        'Phần lớn là phản ứng tải lặp: hạ tải về mức chịu được rồi tăng lại dần; đau điểm cố định trên xương là dấu hiệu cần khám (loại trừ stress reaction).',
    },
    {
      q: 'Vì sao pha hạ gót chậm (eccentric) được coi là "việc nhà" của gân?',
      choices: [
        'Vì đốt nhiều calo',
        'Vì tải có kiểm soát ở tư thế dài cơ là tín hiệu thúc collagen gân sắp xếp lại và chịu tải tốt hơn',
        'Vì làm cơ to ngay lập tức',
        'Vì thay thế hoàn toàn bài calf raise',
      ],
      answer: 1,
      explain:
        'Gân "ăn" tải chậm có kiểm soát; eccentric chính là cách đưa tải vào gân an toàn — nền của các giao thức phục hồi gân ở module Phục hồi.',
    },
  ],
  related: {
    muscles: [
      'gastrocnemius',
      'soleus',
      'tibialis-anterior',
      'tibialis-posterior',
      'fibularis-longus',
      'extensor-digitorum-longus',
    ],
    exercises: ['standing-calf-raise', 'seated-calf-raise'],
    calculators: [],
    conditions: [],
    evidence: [],
  },
  sources: [
    {
      label: 'Gastrocnemius — minh hoạ giải phẫu (đã kiểm tra license CC BY-SA 3.0)',
      url: 'https://commons.wikimedia.org/wiki/File:Gastrocnemius.png',
      license: 'CC BY-SA 3.0',
    },
    {
      label: 'OpenStax Anatomy & Physiology — Muscles of the leg',
      url: 'https://openstax.org/books/anatomy-and-physiology/pages/11-7-muscles-of-the-leg',
      license: 'CC BY-NC-SA 4.0 (cite-only)',
    },
  ],
};
