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
    'Ăn dư 10–20% hoặc +300–500 kcal (cận dưới nếu dễ mỡ), tăng theo bảng tốc độ của training age và đọc tín hiệu "mỡ lên nhanh hơn cơ" để biết khi nào dừng.',
  minutes: 13,
  objectives: [
    'Đặt surplus 10–20% (cận dưới cho người dễ mỡ) và tốc độ tăng cân mục tiêu theo training age.',
    'Đọc bảng tốc độ tăng cân theo %/tuần và kg/tháng cho beginner/intermediate/advanced.',
    'Phối hợp surplus với các biến số tập có bằng chứng (volume E1, RIR E4, protein E3).',
    'Xử lý plateau tăng cân: kiểm tra log, surplus, volume, ngủ trước khi đổi chương trình.',
    'Đọc tín hiệu cho biết gaining phase đang đổi thành "mỡ phase".',
    'So sánh recomp, bulk dài và gain-maintain để chọn theo hoàn cảnh khách.',
  ],
  sections: [
    {
      heading: 'Surplus khiêm tốn: vừa đủ nguyên liệu',
      body: `Tăng cơ cần nguyên liệu nhưng **không cần núi calo**: nghiên cứu cho thấy phì đại gần như tối ưu với mức dư khiêm tốn — phần dư xa hơn chủ yếu thành **mỡ dự trữ**, rồi khách phải cắt dài để trả.

Khung thực hành:

- **Surplus +10–20%** so TDEE (máy tính Mục tiêu calo), tương đương khoảng **+300–500 kcal/ngày** với đa số khách. Người dễ mỡ/ít vận động bắt đầu cận dưới **+5–10% (+200–300 kcal)** rồi tăng nếu 3–4 tuần cân phẳng.
- **Tốc độ tăng cân** theo training age: **beginner 0,25–0,5%/tuần**, **intermediate 0,1–0,25%/tuần**, **advanced 0–0,1%/tuần**. Không có chuyện beginner tăng 1%/tuần mà phần lớn là cơ.
- **Protein 1,6–2,2 g/kg** như mọi giai đoạn (E3).

Ví dụ tuyệt đối: 60 kg beginner → **0,15–0,3 kg/tuần**, tức ~0,6–1,2 kg/tháng; 80 kg intermediate → **0,08–0,2 kg/tuần**, tức ~0,3–0,8 kg/tháng. Con số nhỏ hơn cảm giác "phải lên nhanh" — nhưng đó là giá của việc giữ eo.

"Dirty bulk" (+30–50%) là cách mua 5 kg mỡ để rồi bán 4 kg — và phí cut dài hơn phần cơ thật thu được.`,
    },
    {
      heading: 'Bảng tốc độ theo training age — đừng so với người tập 10 năm',
      body: `Trước khi chọn tốc độ, định nghĩa "trình độ" bằng **khả năng tăng lực**, không chỉ số năm:

| Training age | Dấu hiệu thực tế | Tăng cân mục tiêu | Ví dụ 60 kg | Ví dụ 80 kg |
| --- | --- | --- | --- | --- |
| **Beginner** (< 1 năm, hoặc chưa từng tập bài bản) | Lực tăng gần như mỗi tuần; kỹ thuật còn học | 0,25–0,5%/tuần | 0,15–0,3 kg/tuần | 0,2–0,4 kg/tuần |
| **Intermediate** (1–3 năm, lực tăng chậm dần) | PR tháng, không phải tuần; cần lập trình | 0,1–0,25%/tuần | 0,06–0,15 kg/tuần | 0,08–0,2 kg/tuần |
| **Advanced** (> 3 năm, gần trần tiềm năng) | PR theo chu kỳ; cần chuyên biệt hoá | 0–0,1%/tuần | 0–0,06 kg/tuần | 0–0,08 kg/tuần |

Đọc bảng theo **tháng** dễ hơn: beginner 60 kg tăng ~0,6–1,2 kg/tháng; intermediate 80 kg ~0,3–0,8 kg/tháng. Đây là **mục tiêu scale thực hành** — nghiên cứu thường báo "tổng tăng" gồm cả mỡ/nước; phần nạc thật nhỏ hơn, đặc biệt ở intermediate/advanced. Nếu khách tăng nhanh hơn nhiều so với bậc của mình trong 2–4 tuần, phần dư gần như chắc chắn là mỡ + nước — không phải "gen tốt".

Training age không cố định: nghỉ tập dài, chấn thương hoặc quay lại sau nhiều năm có thể tạm thời "trẻ hoá" 1 bậc, nhưng đừng giả định beginner mãi.`,
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

**Mốc thời gian để không kết luận sớm:** sức mạnh thường nhích trong **2–4 tuần**; phì đại đo được thường cần **8–12 tuần** (tối thiểu 4–6 tuần mới có tín hiệu). Đừng đổi chương trình vì 3 tuần cân phẳng nếu lực vẫn lên và eo ổn.

Tín hiệu dừng gaining phase: vòng bụng tăng nhanh hơn sức mạnh **2 tuần liên tiếp**, hoặc vượt ngưỡng mỡ cá nhân khách chấp nhận — dừng, maintain 2–3 tuần, rồi cut ngắn nếu muốn.`,
    },
    {
      heading: 'Không tăng cân 3–4 tuần: kiểm tra gì trước khi đổi chương trình',
      body: `Cân phẳng trong gaining phase thường không phải "cần thêm bài tập" — mà là ăn ít hơn tưởng hoặc chi nhiều hơn tưởng. Kiểm tra theo thứ tự:

1. **Log 7 ngày đầy đủ:** bữa phụ, đồ uống, dầu sốt, cuối tuần; so với mục tiêu +200–300 kcal.
2. **NEAT thay đổi:** khách đi bộ nhiều hơn, đổi ca làm, tăng cardio — surplus thực bị ăn mất.
3. **Số đo & xu hướng:** cân 5–7 ngày/tuần, MA7 3 tuần; một tuần phẳng chưa phải plateau.
4. **Sức mạnh/rep:** nếu rep tăng đều mà cân phẳng, có thể đang recomp tốt — chưa cần thêm calo.
5. **Ngủ/stress:** thiếu ngủ làm giảm hiệu suất và tăng mỡ khi thêm calo; sửa trước.

**Thứ tự chỉnh (mỗi lần một biến, chờ 3–4 tuần):**

- Log đủ + NEAT ổn → **+200–300 kcal** (ưu tiên carb) hoặc giảm 1 buổi cardio.
- Rep/strength đi xuống → kiểm tra hồi phục, volume, ngủ trước khi thêm calo.
- Vòng bụng tăng nhanh hơn lực 2 tuần → **không thêm calo**; giữ 1 tuần rồi −200–300 kcal nếu trend tiếp tục.
- Sau 3–4 tuần không nhích dù đã +200–300 kcal và log tốt → xem lại TDEE/measurement, đổi bài test hoặc chuyển hướng.

Đừng đổi cả giáo án vì 2 tuần cân phẳng: đó là cách mất dữ liệu và không biết cái gì có công.`,
    },
    {
      heading: 'Recomp hay surplus? Chọn theo nền mỡ và tiềm năng',
      body: `Không phải ai cũng nên bulk. **Recomp** (ăn quanh maintain, protein cao, tập tạ tiến bộ) hợp khi:

- Beginner hoặc quay lại sau nghỉ dài — vừa tăng cơ vừa giảm mỡ được trong 6–12 tháng đầu.
- Nền mỡ còn cao (nam > ~20%, nữ > ~30% ước lượng) — surplus chỉ làm eo xấu thêm.
- Khách sợ tăng cân, adherence kém, ngủ < 6,5 giờ.

**Surplus** hợp khi khách gầy/tương đối lean, đã có nền tập, muốn tối đa hoá cơ và chấp nhận thêm một ít mỡ tạm thời. Nếu chưa chắc: chạy recomp 8–12 tuần; nếu lực tăng, eo ổn, cân gần như phẳng — đó là recomp thành công, không cần bulk.

Recomp không có nghĩa "ăn gì cũng được": vẫn cần protein 1,6–2,2 g/kg, tập đủ volume và theo dõi e1RM. Tốc độ thay đổi hình thể sẽ chậm hơn bulk — đừng bán cho khách kỳ vọng 5 kg cơ trong 8 tuần.`,
    },
    {
      heading: 'Chiến lược dài hay ngắn?',
      body: `**Bulk dài (4–6 tháng+)**: hợp khách gầy khó tăng, lịch ổn định, chấp nhận thêm chút mỡ tạm thời để tối ưu môi trường tăng cơ. Khó khăn: tâm lý thấy "mềm" ở giữa chừng.

**Lean-gain xen kẽ (8–12 tuần gain → 4–6 tuần maintain/cut nhẹ)**: hợp khách dễ mỡ, khách đã có nền, hoặc có mốc sự kiện (hè, chụp ảnh). Đổi hướng thường xuyên hơn nhưng luôn "dáng gọn".

Không có lựa chọn đúng duy nhất — chọn theo **loại khách + hoàn cảnh sống**, và đổi chiến lược khi dữ liệu (vòng + lực) ra lệnh, không phải khi mạng xã hội ra trend.`,
    },
  ],
  applyBox: `**Gian tập thực hành — gaining phase 10 tuần mẫu (khách trung cấp 65 kg):**
1. Đặt: surplus +10% (~2.600 kcal), protein 130 g, mục tiêu cân **+0,1–0,25%/tuần** (~0,1–0,16 kg/tuần); nếu là beginner, dùng 0,25–0,5%/tuần.
2. Tuần 1–10: giữ nguyên; Chủ nhật đọc MA7 + đo vòng bụng + vòng tay mỗi 2 tuần.
3. Cân tăng < 0,1 kg trong 3 tuần → +200–300 kcal (hoặc giảm 1 buổi cardio); không đổi cả giáo án.
4. Vòng bụng nhích nhanh hơn lực 2 tuần → không thêm calo; giữ 1 tuần rồi −200–300 kcal nếu trend tiếp tục.
5. Sau 10 tuần: battery test + ảnh so — quyết định tiếp gain/maintain/cut bằng dữ liệu; nếu eo đã cao, chuyển recomp/maintain thay vì bulk tiếp.`,
  terms: [
    {
      en: 'Lean surplus',
      vi: 'Surplus khiêm tốn',
      def: '+10–20% so TDEE (cận dưới +5–10% nếu dễ mỡ): đủ nguyên liệu cho phì đại mà không đội nhanh phần mỡ hoàn trả.',
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
    {
      en: 'Training age',
      vi: 'Tuổi tập',
      def: 'Trình độ thích ứng thực tế (beginner <1 năm, intermediate 1–3 năm, advanced >3 năm) — quyết định tốc độ tăng cân khả thi.',
    },
    {
      en: 'Recomp',
      vi: 'Tái bố cục cơ thể',
      def: 'Ăn quanh maintain + protein cao + tập tạ tiến bộ: tăng cơ/giảm mỡ chậm nhưng bền, hợp beginner/nền mỡ cao/quay lại sau nghỉ.',
    },
    {
      en: 'Gain plateau',
      vi: 'Điểm phẳng tăng cân',
      def: 'MA7 không nhích 3–4 tuần dù log đủ: kiểm tra surplus thực/NEAT/ngủ trước khi đổi chương trình; mỗi lần một biến.',
    },
  ],
  images: [],
  quiz: [
    {
      q: 'Surplus khiêm tốn cho gaining phase khoảng bao nhiêu?',
      choices: ['+10–20% so TDEE (cận dưới nếu dễ mỡ)', '+30–50%', '+100%', '0% — giảm mỡ mới tăng cơ'],
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
    {
      q: 'Nam 60 kg, beginner < 1 năm. Tốc độ tăng cân hợp lý là khoảng bao nhiêu?',
      choices: [
        '0,6–1,2 kg/tháng',
        '3–5 kg/tháng',
        '10 kg/tháng',
        'Càng nhanh càng tốt',
      ],
      answer: 0,
      explain:
        'Beginner 0,25–0,5%/tuần × 60 kg = 0,15–0,3 kg/tuần, tức ~0,6–1,2 kg/tháng. Nhanh hơn phần lớn là mỡ/nước.',
    },
    {
      q: 'Khách intermediate 80 kg, cân phẳng 3 tuần, log ăn đầy đủ, rep tăng đều, eo ổn. Việc đầu tiên?',
      choices: [
        'Đổi toàn bộ giáo án',
        'Có thể đang recomp tốt — chưa cần thêm calo; tiếp tục 2 tuần và theo dõi e1RM/eo',
        'Cắt 500 kcal',
        'Tăng 1.000 kcal',
      ],
      answer: 1,
      explain:
        'Cân phẳng mà lực tăng/eo ổn là recomp, không phải thất bại. Chỉ thêm calo khi lực cũng phẳng và log/NEAT đã kiểm tra.',
    },
    {
      q: 'Ai là ứng viên recomp hợp lý nhất?',
      choices: [
        'Nam 30 tuổi, 12% mỡ, tập 5 năm, muốn tối đa cơ',
        'Nữ 28 tuổi, mới tập, nền mỡ còn cao, sợ tăng cân',
        'VĐV chuẩn bị thi physique',
        'Người chỉ chạy bộ',
      ],
      answer: 1,
      explain:
        'Beginner + nền mỡ cao + sợ tăng cân là bộ ba recomp kinh điển: vẫn tăng cơ, giảm mỡ chậm, không cần surplus.',
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
    {
      label: 'Iraki et al. 2019 — Off-season nutrition for bodybuilders (10–20% surplus, 0,25–0,5%/tuần)',
      url: 'https://doi.org/10.3390/sports7070154',
      license: 'CC BY 4.0',
    },
    {
      label: 'Garthe et al. 2011 — Long-term nutritional counselling and lean gain (+506 kcal/d)',
      url: 'https://doi.org/10.1139/h11-051',
      license: 'cite-only',
    },
    {
      label: 'Slater et al. 2019 — Is an energy surplus required for hypertrophy?',
      url: 'https://doi.org/10.3389/fnut.2019.00131',
      license: 'CC BY 4.0',
    },
  ],
};
