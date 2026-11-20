/**
 * Khớp & hành động khớp: vì sao kỹ thuật đúng bắt đầu từ giải phẫu.
 *
 * Nguồn: Gray's Anatomy (public domain), OpenStax A&P (cite-only).
 */
export default {
  slug: 'anat-4-1',
  module: 'anat',
  chapter: 4,
  chapterTitle: 'Khớp & vận động học',
  order: 1,
  title: 'Khớp và hành động khớp',
  subtitle:
    'Ba loại khớp, cấu trúc một khớp trượt, và bảng hành động khớp bạn gặp mỗi ngày trong phòng tập.',
  minutes: 11,
  objectives: [
    'Phân biệt ba loại khớp: xơ, sụn và khớp trượt (synovial) — loại nào liên quan trực tiếp tới tập luyện.',
    'Mô tả cấu trúc một khớp trượt: sụn khớp, bao khớp, dịch khớp, dây chằng, meniscus/labrum.',
    'Dùng bảng hành động khớp để gọi tên chuyển động trong một bài tập bất kỳ.',
    'Phân biệt ROM chủ động và bị động, và vì sao ROM hạn chế làm hỏng kỹ thuật trước khi tạ làm hỏng khách.',
  ],
  sections: [
    {
      heading: 'Ba loại khớp',
      body: `Cơ thể có 3 nhóm khớp chính theo chất liệu nối giữa hai đầu xương:

1. **Khớp xơ (fibrous)**: xương nối bằng mô xơ dày, gần như không di động — ví dụ đường khớp giữa các xương sọ.
2. **Khớp sụn (cartilaginous)**: nối bằng sụn, di động rất ít — ví dụ đĩa đệm giữa các đốt sống, khớp mu. Đây là lý do cột sống "uốn" được từng chút ở từng đốt, chứ không gập như bản lề tại một điểm.
3. **Khớp trượt (synovial)**: hai đầu xương **không dính vào nhau**, đầu xương bọc sụn, lơ lửng trong bao khớp chứa dịch — di động tự do. Vai, hông, gối, khuỷu, cổ tay... gần như toàn bộ khớp bạn tác động khi tập đều thuộc nhóm này.

Điểm quan trọng với PT: khớp trượt **ăn bằng dịch và ăn bằng chuyển động**. Dịch khớp nuôi sụn theo cơ chế "bơm" khi khớp vận động — một lý do sinh học cho nguyên tắc "khởi động trước khi tải nặng" và khách nên vận động nhẹ mỗi ngày.`,
    },
    {
      heading: 'Mổ một khớp trượt',
      body: `Một khớp trượt điển hình gồm:

- **Sụn khớp (articular cartilage)**: lớp mỏng trơn phủ đầu xương, giảm ma sát gần như bằng băng đá — không có mạch máu, hỏng rất chậm lành.
- **Bao khớp (joint capsule)**: túi bao quanh, giữ dịch và giới hạn tầm vận động.
- **Dịch khớp (synovial fluid)**: "dầu bôi trơn" nuôi sụn, được bơm tuần hoàn khi khớp vận động.
- **Dây chằng (ligament)**: dải xơ nối xương với xương, giữ khớp không lệch — giãn thì gọi là "sprain" (dập dây chằng).
- **Cấu trúc phụ**: meniscus ở gối, labrum ở vai — tấm đệm sụn tăng diện tích tiếp xúc.

Vì sao chấn thương khớp khó lành hơn cơ? Cơ có máu nuôi dồi dào còn sụn và dây chằng gần như không có — tiến độ phục hồi tính bằng tháng chứ không bằng ngày (chi tiết trong module Phục hồi chức năng).`,
      image: 'anat-4-1-synovial.jpg',
    },
    {
      heading: 'Bảng hành động khớp cho PT',
      body: `| Hành động | Nghĩa | Ví dụ trong phòng tập |
| --- | --- | --- |
| Flexion / Extension | Gấp / duỗi | Hạ người squat = flexion hông + gối |
| Abduction / Adduction | Khép-ra / khép-vào | Lateral raise / cable crossover |
| Internal / External rotation | Xoay trong / xoay ngoài | Xoay hông trong squat rộng |
| Pronation / Supination | Sấp / ngửa cẳng tay | Đổi tay cầm khi row |
| Dorsiflexion / Plantarflexion | Gập mu / gập gan cổ chân | Gót chìm khi squat / nhón gót |
| Protraction / Retraction | Đẩy / kéo xương bả vai | Push-up đẩy hết / row giữ lưng |
| Elevation / Depression | Nhún / hạ vai | Shrug / pulling thân dưới kéo xà |
| Circumduction | Chi vẽ hình nón | Vòng vai trước khi đẩy overhead |

Mẹo dùng bảng: khi xem một bài mới, tự đặt 2 câu hỏi — *(1) khớp nào chuyển động? (2) hành động gì ở khớp đó?* Trả lời được hai câu này là bạn đã "đọc hiểu" 80% kỹ thuật của bài, phần còn lại là nhịp thở và tầm tạ.`,
    },
    {
      heading: 'ROM: biên độ vận động và kỹ thuật',
      body: `**ROM (range of motion)** là biên độ mà khớp di động được. Phân biệt:

- **ROM chủ động**: khách tự di chuyển tới đó bằng cơ của mình — con số quan trọng nhất với PT, vì nó quyết định kỹ thuật an toàn (squat sâu tới đâu, tay nâng được bao xa).
- **ROM bị động**: có lực ngoài đẩy (PT đỡ, máy kéo) — luôn lớn hơn chủ động; kéo quá mức bị động là công thức chấn thương.

ROM chủ động hạn chế thường do **do hạn chế mô mềm (cơ, bao khớp) hoặc kiểm soát thần kinh cơ**, hiếm khi do "xương cản". Ví dụ kinh điển: khách squat không sâu được vì **dorsiflexion cổ chân kém** — gót không chạm nổi khi sâu — nên bù bằng lưng võng. Giải pháp không phải "chịu đau xuống sâu hơn" mà là: cải thiện mobility cổ chân, tạm dùng gót nâng (heel wedge), hoặc hạ chuẩn độ sâu phù hợp ROM hiện tại.

Nguyên tắc: **kỹ thuật bám theo ROM của khách** — không ép khách bám theo kỹ thuật của người bán video.`,
    },
  ],
  applyBox: `**Gian tập thực hành — "đọc khớp" một bài trong 60 giây:**
1. Chọn bất kỳ bài nào trong giáo án (ví dụ: leg press).
2. Gọi tên khớp chuyển động chính: hông, gối, cổ chân.
3. Gọi hành động: flexion hông + gối, dorsiflexion cổ chân khi hạ; extension + plantarflexion khi đẩy.
4. Hỏi ngược: khách nào sẽ làm bài này khó? → người thiếu dorsiflexion hoặc hông đã thay khớp — chỉnh chân cao hơn trên đế máy.
Lặp lại vài lần, bạn sẽ đọc mọi mô tả kỹ thuật bằng "mắt PT" thay vì copy theo cảm tính.`,
  terms: [
    {
      en: 'Synovial joint',
      vi: 'Khớp trượt',
      def: 'Khớp di động tự do: hai đầu xương bọc sụn, lơ lửng trong bao khớp chứa dịch khớp — vai, hông, gối, khuỷu.',
    },
    {
      en: 'Articular cartilage',
      vi: 'Sụn khớp',
      def: 'Lớp sụn trơn phủ đầu xương; không có mạch máu nên tổn thương lành rất chậm.',
    },
    {
      en: 'Range of motion (ROM)',
      vi: 'Biên độ vận động',
      def: 'Mức khớp di chuyển được; ROM chủ động (tự làm) quan trọng hơn ROM bị động khi quyết định kỹ thuật.',
    },
    {
      en: 'Dorsiflexion',
      vi: 'Gập mu cổ chân',
      def: 'Xương bàn chân gập về phía cẳng chân; hạn chế dorsiflexion là nguyên nhân phổ biến khiến squat không sâu được.',
    },
    {
      en: 'Ligament',
      vi: 'Dây chằng',
      def: 'Dải mô xơ nối xương với xương, giữ khớp không lệch; giãn/dập gọi là sprain.',
    },
    {
      en: 'Meniscus / Labrum',
      vi: 'Meniscus / Labrum',
      def: 'Tấm đệm sụn tăng diện tích khớp: meniscus ở gối, labrum quanh ổ vai — thiếu máu nuôi nên hỏng chậm lành.',
    },
  ],
  images: [
    {
      file: 'anat-4-1-synovial.jpg',
      caption: 'Sơ đồ cấu trúc một khớp trượt (minh hoạ y khoa public domain).',
      source: 'Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Illu_synovial_joint.jpg',
      license: 'Public domain',
    },
  ],
  quiz: [
    {
      q: 'Gần như toàn bộ khớp bạn tác động khi tập (vai, hông, gối, khuỷu) thuộc nhóm nào?',
      choices: ['Khớp xơ (fibrous)', 'Khớp sụn (cartilaginous)', 'Khớp trượt (synovial)', 'Khớp giả (pseudoarthrosis)'],
      answer: 2,
      explain:
        'Các khớp di động tự do đều là khớp trượt: có bao khớp, dịch khớp và di chuyển được trên nhiều mặt phẳng.',
    },
    {
      q: 'Sụn khớp tổn thương lành rất chậm chủ yếu vì điều gì?',
      choices: [
        'Sụn bị bao phủ bởi da dày',
        'Sụn không có mạch máu nuôi trực tiếp — sống nhờ dịch khớp bơm khi vận động',
        'Sụn chỉ tồn tại ở người trẻ',
        'Sụn có quá nhiều thần kinh gây co thắt',
      ],
      answer: 1,
      explain:
        'Sụn khớp vô mạch (avascular), nhận dinh dưỡng từ dịch khớp tuần hoàn khi khớp vận động — đây cũng là lý do vận động nhẹ tốt cho khớp.',
    },
    {
      q: 'Nhón gót ở tư thế squat đáy là hành động khớp nào?',
      choices: ['Plantarflexion', 'Dorsiflexion', 'Elevation vai', 'Pronation'],
      answer: 1,
      explain:
        'Để gối tiến qua mũi chân khi squat sâu, cổ chân phải dorsiflex (gập mu). Thiếu dorsiflexion thì gót bay lên — dấu hiệu chỉnh kỹ thuật kinh điển.',
    },
    {
      q: 'Khách squat không sâu, gót chân bốc lên. Nguyên nhân phổ biến nhất cần kiểm tra đầu tiên?',
      choices: [
        'Tạ quá nhẹ',
        'Dorsiflexion cổ chân hạn chế',
        'Cơ delta yếu',
        'Bàn chân quá rộng',
      ],
      answer: 1,
      explain:
        'ROM cổ chân hạn chế khiến khách không giữ gót chạm sàn ở độ sâu đó; kiểm tra knee-to-wall test trước khi kết luận "kỹ thuật xấu".',
    },
    {
      q: 'ROM chủ động và ROM bị động khác nhau thế nào?',
      choices: [
        'Giống nhau, chỉ khác tên gọi',
        'Chủ động do cơ tự di chuyển; bị động có lực ngoài đẩy — luôn lớn hơn và kéo quá mức dễ chấn thương',
        'Bị động nhỏ hơn chủ động',
        'Chủ động chỉ đo được bằng máy',
      ],
      answer: 1,
      explain:
        'ROM chủ động là con số quyết định kỹ thuật; kéo bị động (do người khác đè, máy đẩy) vượt mức ROM chủ động là kịch bản tổn thương điển hình.',
    },
    {
      q: 'Vì sao nói "khớp trượt ăn bằng chuyển động"?',
      choices: [
        'Vì khớp cần cảm nhận tạ để mạnh lên',
        'Vì dịch khớp chỉ được bơm tuần hoàn nuôi sụn khi khớp vận động',
        'Vì xương mọc thêm khi tập nặng',
        'Vì dây chằng co lại khi đứng yên',
      ],
      answer: 1,
      explain:
        'Dịch khớp nuôi sụn theo cơ chế bơm khi vận động — nền tảng sinh lý cho nguyên tắc khởi động và vận động nhẹ hằng ngày, kể cả ngày nghỉ.',
    },
  ],
  related: {
    muscles: ['quadriceps', 'biceps-femoris', 'gastrocnemius', 'soleus'],
    exercises: ['barbell-back-squat', 'leg-press', 'nordic-curl'],
    calculators: [],
    conditions: ['knee_pain'],
    evidence: [],
  },
  sources: [
    {
      label: 'Illu synovial joint — minh hoạ y khoa public domain (Wikimedia Commons)',
      url: 'https://commons.wikimedia.org/wiki/File:Illu_synovial_joint.jpg',
      license: 'Public domain',
    },
    {
      label: 'OpenStax Anatomy & Physiology — Joints and skeletal movement',
      url: 'https://openstax.org/books/anatomy-and-physiology/pages/9-1-classification-of-joints',
      license: 'CC BY-NC-SA 4.0 (cite-only)',
    },
  ],
};
