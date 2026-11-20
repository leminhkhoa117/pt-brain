/**
 * Tăng cơ thực hành (bulking): surplus khiêm tốn, đo đúng nhịp.
 *
 * Nguồn: Schoenfeld 2017 (E1), Morton 2018 (E3), Refalo 2023 (E4) —
 * đều đã kiểm chứng trong evidence base.
 */
export default {
  slug: 'nutr-6-2',
  module: 'nutr',
  chapter: 6,
  chapterTitle: 'Chiến lược thay đổi cơ thể',
  order: 2,
  title: 'Tăng cơ thực hành: surplus khiêm tốn thắng dirty bulk',
  subtitle:
    'Ăn dư 5–15%, theo nhịp cân 0,25–0,5%/tuần và đọc tín hiệu "mỡ lên nhanh hơn cơ" để biết khi nào dừng.',
  minutes: 11,
  objectives: [
    'Đặt surplus 5–15% và tốc độ tăng cân mục tiêu theo trình độ khách.',
    'Phối hợp surplus với các biến số tập có bằng chứng (volume E1, RIR E4, protein E3).',
    'Đọc tín hiệu cho biết gaining phase đang đổi thành "mỡ phase".',
    'So sánh hai chiến lược bulk dài/ngắn và chọn theo hoàn cảnh khách.',
  ],
  sections: [
    {
      heading: 'Surplus khiêm tốn: vừa đủ nguyên liệu',
      body: `Tăng cơ cần nguyên liệu nhưng **không cần núi calo**: nghiên cứu cho thấy phì đại gần như tối ưu với mức dư khiêm tốn — phần dư xa hơn chủ yếu thành **mỡ dự trữ**, rồi khách phải cắt dài để trả.

Khung thực hành:

- **Surplus +5–15%** so TDEE (máy tính Mục tiêu calo).
- **Tốc độ tăng cân**: khách mới tập có thể ~0,5–1%/tuần (cơ còn "dễ"); trung cấp **0,25–0,5%/tuần**; lâu năm càng chậm.
- **Protein 1,6–2,2 g/kg** như mọi giai đoạn (E3).

"Dirty bulk" (+30–50%) là cách mua 5 kg mỡ để rồi bán 4 kg — và phí cut dài hơn phần cơ thật thu được.`,
    },
    {
      heading: 'Ghép với biến số tập có bằng chứng',
      body: `Surplus chỉ là nguyên liệu; tín hiệu xây vẫn phải từ tạ:

- **Volume 10–20 set/nhóm/tuần** và tăng dần (E1) — surplus không cứu được volume thấp.
- **RIR 1–3 đa số set** (E4) — tập failure mọi set không "ăn vào surplus" mà chỉ thêm mệt.
- **Tần suất 2 lần/nhóm** (E2) chia volume hợp lý.
- **Ngủ 7–9 giờ** (bài DOMS & Hormone): surplus không thay được chỗ ngủ của khách.

Điểm đặc thù của gaining: **rep tăng đều + tạ tăng đều** là bằng tiến bộ tốt nhất — máy Log buổi tập của app cho bạn hai đường số này ra trend rõ hơn cảm giác "hình như ổn".`,
    },
    {
      heading: 'Đọc tín hiệu đổi phase',
      body: `Ba thước đo song song (giống cut — chỉ đổi ngược hướng):

- **Cân MA7**: tăng đúng nhịp mục tiêu?
- **Vòng bụng**: nhích chậm hơn vòng tay/đùi → phần lớn tăng là mô nạc; nhích cùng tốc độ cân → đang "béo lên".
- **Sức mạnh**: tăng cùng kỳ là chỉ báo mạnh nhất (cơ thật đi kèm lực thật).

Tín hiệu dừng gaining phase: vòng bụng tăng nhanh hơn sức mạnh **2 tuần liên tiếp**, hoặc vượt ngưỡng mỡ cá nhân khách chấp nhận — dừng, maintain 2–3 tuần, rồi cut ngắn nếu muốn.`,
    },
    {
      heading: 'Chiến lược dài hay ngắn?',
      body: `**Bulk dài (4–6 tháng+)**: hợp khách gầy khó tăng, lịch ổn định, chấp nhận thêm chút mỡ tạm thời để tối ưu môi trường tăng cơ. Khó khăn: tâm lý thấy "mềm" ở giữa chừng.

**Lean-gain xen kẽ (8–12 tuần gain → 4–6 tuần maintain/cut nhẹ)**: hợp khách dễ mỡ, khách đã có nền, hoặc có mốc sự kiện (hè, chụp ảnh). Đổi hướng thường xuyên hơn nhưng luôn "dáng gọn".

Không có lựa chọn đúng duy nhất — chọn theo **loại khách + hoàn cảnh sống**, và đổi chiến lược khi dữ liệu (vòng + lực) ra lệnh, không phải khi mạng xã hội ra trend.`,
    },
  ],
  applyBox: `**Gian tập thực hành — gaining phase 10 tuần mẫu (khách trung cấp 65 kg):**
1. Đặt: surplus +10% (~2.600 kcal), protein 130 g, mục tiêu cân +0,3–0,4 kg/tuần.
2. Tuần 1–10: giữ nguyên; Chủ nhật đọc MA7 + đo vòng bụng + vòng tay mỗi 2 tuần.
3. Cân tăng < 0,2 kg 2 tuần liền → +100–150 kcal (hoặc +1.000 bước NGƯỢC: giảm NEAT bớt).
4. Vòng bụng nhích nhanh hơn lực 2 tuần → chuyển maintain 3 tuần, đánh giá lại hướng.
5. Sau 10 tuần: battery test + ảnh so — quyết định tiếp gain/ maintain/ cut bằng dữ liệu.`,
  terms: [
    {
      en: 'Lean surplus',
      vi: 'Surplus khiêm tốn',
      def: '+5–15% so TDEE: đủ nguyên liệu cho phì đại mà không đội nhanh phần mỡ hoàn trả.',
    },
    {
      en: 'Rate of gain',
      vi: 'Tốc độ tăng cân',
      def: 'Mục tiêu 0,25–0,5%/tuần (trung cấp); mới tập nhanh hơn, lâu năm chậm dần.',
    },
    {
      en: 'Dirty bulk',
      vi: 'Bulk bẩn',
      def: 'Dư năng lượng lớn (+30–50%) — phần dư xa ngưỡng hầu như thành mỡ, phí cut dài.',
    },
    {
      en: 'Gain-maintain cycle',
      vi: 'Vòng tăng-giữ',
      def: 'Gain 8–12 tuần → maintain/cut nhẹ: giữ dáng gọn cho khách dễ mỡ, đổi hướng theo dữ liệu.',
    },
    {
      en: 'Strength-to-waist signal',
      vi: 'Tín hiệu lực-vòng bụng',
      def: 'Lực tăng nhanh hơn vòng bụng = phần lớn gain là nạc; ngược lại = đang đổi thành "mỡ phase".',
    },
  ],
  images: [],
  quiz: [
    {
      q: 'Surplus khiêm tốn cho gaining phase khoảng bao nhiêu?',
      choices: ['+5–15% so TDEE', '+30–50%', '+100%', '0% — giảm mỡ mới tăng cơ'],
      answer: 0,
      explain:
        'Phì đại cần nguyên liệu vừa đủ; phần dư lớn thêm chủ yếu vào kho mỡ — rồi trả bằng cut dài.',
    },
    {
      q: 'Khách trung cấp nên nhắm tốc độ tăng cân bao nhiêu?',
      choices: ['2 kg/tuần', '0,25–0,5%/tuần cân nặng', '0 kg — giữ mãi', '5%/tuần'],
      answer: 1,
      explain:
        'Nhịp này cân bằng giữa đủ nguyên liệu và giới hạn mỡ lên; mới tập có thể nhanh hơn, lâu năm chậm hơn.',
    },
    {
      q: 'Tín hiệu mạnh cho biết gain đang chở mỡ thay vì cơ?',
      choices: [
        'Cân tăng mà lực đứng yên, vòng bụng nhích nhanh — 2 tuần liên tiếp',
        'Ăn ngon miệng',
        'Tập không đau cơ',
        'Ngủ sâu',
      ],
      answer: 0,
      explain:
        'Lực + vòng là bộ chỉ báo nạc/mỡ rẻ nhất; khi lực phẳng mà bụng mở nhanh, phase đang sai hướng — dừng và maintain.',
    },
    {
      q: 'Vì sao surplus không cứu được giáo án volume thấp?',
      choices: [
        'Vì calo không tác dụng khi volume thấp... thực ra tác dụng: thành mỡ',
        'Tín hiệu xây cơ đến từ tải cơ học (E1) — thiếu volume thì nguyên liệu dư chỉ vào kho mỡ',
        'Vì protein không hấp thu',
        'Không có lý do',
      ],
      answer: 1,
      explain:
        'Surplus là nguyên liệu, volume/RIR là bản vẽ: thiếu bản vẽ thì nguyên liệu xếp thành đống (mỡ), không thành nhà (cơ).',
    },
    {
      q: 'Khách dễ lên mỡ, muốn vẫn "dáng gọn" trong gaining. Chiến lược hợp lý?',
      choices: [
        'Dirty bulk cho nhanh xong cut dài',
        'Gain-maintain xen kẽ (8–12 tuần gain → maintain/cut nhẹ), đổi hướng theo dữ liệu',
        'Không bao giờ tăng calo',
        'Chỉ tăng calo cuối tuần',
      ],
      answer: 1,
      explain:
        'Vòng ngắn giữ cả hai mục tiêu: môi trường tăng cơ và dáng gọn — chọn chiến lược theo loại khách chứ không theo trend.',
    },
  ],
  related: {
    muscles: [],
    exercises: ['barbell-back-squat', 'barbell-bench-press', 'pull-up', 'overhead-press'],
    calculators: ['tdee', 'calories', 'macro', 'one-rm'],
    conditions: [],
    evidence: ['E1', 'E2', 'E3', 'E4'],
  },
  sources: [
    {
      label: 'Schoenfeld et al. 2017 — Volume dose-response (E1, đã kiểm chứng)',
      url: 'https://doi.org/10.1080/02640414.2016.1210197',
      license: 'cite-only',
    },
    {
      label: 'Morton et al. 2018 — Protein (E3, đã kiểm chứng)',
      url: 'https://doi.org/10.1136/bjsports-2017-097608',
      license: 'CC BY 4.0',
    },
    {
      label: 'Refalo et al. 2023 — Proximity to failure (E4, đã kiểm chứng)',
      url: 'https://doi.org/10.1007/s40279-022-01784-y',
      license: 'cite-only',
    },
  ],
};
