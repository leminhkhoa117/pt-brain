/**
 * Giảm mỡ thực hành: deficit bền, giữ cơ, giữ sức mạnh.
 *
 * Nguồn: Helms et al. 2014 (E7 — đã kiểm chứng), bài Năng lượng & Protein
 * của app, evidence base PT Brain.
 */
export default {
  slug: 'nutr-6-1',
  module: 'nutr',
  chapter: 6,
  chapterTitle: 'Chiến lược thay đổi cơ thể',
  order: 1,
  title: 'Giảm mỡ thực hành: giữ cơ, giữ sức mạnh, giữ khách với plan dài hơi',
  subtitle:
    'Từ con số deficit tới mốc 5–10%, xử lý plateau và sai lầm làm đổ adherence — quy trình giảm mỡ mà khách bám được cả 12 tuần.',
  minutes: 14,
  objectives: [
    'Đặt deficit, tốc độ và protein chuẩn cho một chu kỳ giảm (0,5–1%/tuần, E7).',
    'Chia mục tiêu thành mốc 5% và 10% cân nặng, kèm timeline thực tế theo kg.',
    'Thiết kế phần tập để GIỮ cơ trong deficit: tạ giữ ưu tiên, cardio làm công cụ phụ.',
    'Nhận diện 4 sai lầm phá adherence phổ biến và cách thay thế.',
    'Xử lý plateau đúng thứ tự: kiểm tra dữ liệu → NEAT → calo → hồi phục, mỗi lần một biến.',
    'Biết khi nào kết thúc cut và chuyển sang maintain/diet break.',
  ],
  sections: [
    {
      heading: 'Ba con số mở đầu chu kỳ',
      body: `Trước khi đụng tới bất kỳ "mẹo" nào, ba con số (đã có bài riêng — bài này ghép chúng thành quy trình):

1. **Deficit 10–25%** so TDEE (máy tính Mục tiêu calo của app) — mức sâu hơn dành cho khách mỡ cao.
2. **Tốc độ 0,5–1%/tuần cân nặng** (E7 — Helms 2014); khách càng gầy càng ở cận dưới.
3. **Protein nửa trên 1,6–2,2 g/kg** — giữ cơ khi năng lượng thiếu (bài Protein).

Mọi thứ khác (carb/fat phân bổ, bữa mấy giờ, foods "sạch") là **phong cách** — chỉ cần khách làm được bền. Quy trình thắng mẹo.`,
    },
    {
      heading: 'Mốc 5–10%: mục tiêu nhỏ, timeline thật',
      body: `Đừng bán "giảm 10 kg" ngay từ buổi đầu. Với phần lớn khách, chia mục tiêu thành **5% rồi 10% cân nặng** dễ giữ adherence và có mốc sức khỏe rõ hơn:

| Cân nặng | Mốc 5% | Mốc 10% | Thời gian ở 0,5–1%/tuần |
| --- | --- | --- | --- |
| 60 kg | 3 kg | 6 kg | 5–10 tuần / 10–20 tuần |
| 80 kg | 4 kg | 8 kg | 5–10 tuần / 10–20 tuần |
| 100 kg | 5 kg | 10 kg | 5–10 tuần / 10–20 tuần |

Cách đọc bảng: cột thời gian là **khoảng**, không phải deadline. Tuần đầu có thể rơi nhanh hơn do nước/glycogen; từ tuần 2–3 mới đọc MA7. Mốc 5% thường đã đủ để quần áo khác đi, huyết áp/đường huyết nhích theo hướng tốt; đạt 5% rồi mới quyết định có đi tiếp 10% hay chuyển sang maintain.

Ví dụ 80 kg, mục tiêu 8 kg (10%): 0,4–0,8 kg/tuần → **10–16 tuần** là thực tế; mốc 12 tuần đầu nên là **−4–5 kg**, không phải −8 kg. Kế hoạch tổng thể nên tính **3–6 tháng** cho mốc 5–10%, vì còn plateau, du lịch, lễ và tuần giữ cân. Đặt mốc nhỏ đúng giúp khách thấy thắng ở tuần 6 thay vì thấy mình "thất bại" ở tuần 8.`,
    },
    {
      heading: 'Phần tập: tạ là "thuốc giữ cơ"',
      body: `Nguyên tắc số một của cut: **cơ giữ lại bằng tín hiệu "còn cần cơ"** — tín hiệu đó là tạ nặng, không phải cardio.

- **Tạ**: giữ volume hiệu quả (~10–15 set/nhóm/tuần) và **tăng độ nặng tương đối** — sức mạnh giữ được là chỉ báo quan trọng nhất rằng cơ đang được bảo toàn. Rep giảm nhẹ khi sâu vào cut là bình thường; **rơi nhanh 2 tuần liền** = deficit quá gắt hoặc hồi phục thiếu.
- **Cardio**: làm công cụ "đóng cửa deficit" — ưu tiên NEAT (bước chân) và Zone 2; HIIT 1 buổi khi khách khỏe và thích, không phải mặc định.
- Sai lầm kinh điển: giữ nguyên tạ cho "lửa đốt" cardio — cơ mất tín hiệu cần thiết thì trả giá bằng kg nạc.`,
    },
    {
      heading: 'Bốn sai lầm phá adherence',
      body: `1. **Deficit quá gắt đầu tiên** ("cắt 40% cho nhanh"): mệt, đói, tập đổ — adherence chết tuần 3. Bắt đầu 15–20% là đủ để thấy MA7 đi xuống.
2. **Phạt cardio sau khi ăn quá** ("được ăn thêm phải trả"): biến gym thành hình phạt — khách bỏ. Thay bằng: bước chân nền + 1–2 buổi Zone 2 cố định.
3. **Cheat DAY thay cheat meal**: một ngày 3.000 kcal dư xoá gần cả tuần deficit về mặt toán. Bữa tự do 1 bữa/tuần giữ được hành vi mà không phá số.
4. **Đổi mọi thứ cùng lúc** (tập + ăn + ngủ + supplement): không biết thứ nào có công. Đổi 1–2 biến số mỗi 2 tuần, đọc MA7 rồi quyết định.`,
    },
    {
      heading: 'Plateau: kiểm tra gì trước khi cắt calo',
      body: `**Định nghĩa làm việc:** MA7 không giảm (hoặc giảm dưới ~0,2%/tuần) trong **3 tuần liên tiếp**, sau khi đã có ít nhất 10–14 ngày log ăn uống đáng tin. Một tuần phẳng không phải plateau; nếu log thiếu hoặc khách giảm rất chậm, chờ thêm 1 tuần trước khi kết luận.

Năm nguyên nhân thường gặp — kiểm tra theo thứ tự, đừng mặc định "do chuyển hoá":

1. **Adherence/logging:** bữa cuối tuần, dầu sốt, đồ ăn ngoài, "cắn thử" khi nấu. Kiểm tra 7 ngày log đầy đủ, kể cả cuối tuần.
2. **Nước/glycogen/chu kỳ:** muối, carb, du lịch, chu kỳ kinh, táo bón. Nhìn vòng bụng + ảnh 2–3 tuần thay vì một buổi sáng.
3. **NEAT giảm:** khách đi ít hơn, nghỉ trưa ít vận động, nghề thay đổi. Đếm bước chân trung bình 7 ngày.
4. **Deficit thực đã nhỏ đi:** TDEE giảm sau khi cân nặng giảm; tính lại TDEE mỗi 4–6 kg.
5. **Hồi phục/ngủ/stress:** ngủ < 6,5 giờ, stress công việc, volume tập tăng. Sửa hồi phục trước khi cắt sâu.

**Thứ tự chỉnh — mỗi lần MỘT biến, chờ 10–14 ngày:**

- **Bước 0:** audit adherence + log 7 ngày; giữ nguyên calo.
- **Bước 1:** nếu adherence tốt → thêm **2.000–3.000 bước/ngày** hoặc 1 buổi Zone 2 20–30 phút.
- **Bước 2:** nếu vẫn phẳng → giảm **200–300 kcal** (không cắt quá 300 kcal/lần; khách gầy/giảm chậm dùng cận dưới), giữ protein 1,6–2,2 g/kg.
- **Bước 3:** nếu mệt, ngủ kém, RPE tăng → **diet break 5–7 ngày** thay vì cắt sâu.
- **Bước 4:** sau 2 lần chỉnh không hiệu quả → xem lại TDEE/measurement, đổi cách đo hoặc chuyển hướng chuyên gia; đừng cắt thêm.

Không có "calo ma thuật" nào thay được bước 0: phần lớn plateau là **dữ liệu ăn uống chưa đủ tốt**, không phải cơ thể hỏng.`,
    },
    {
      heading: 'Đo, dừng và chuyển',
      body: `**Đo bằng ba thước, cùng điều kiện:**

- **Cân:** 5–7 ngày/tuần, sáng sau vệ sinh, trước ăn; dùng **MA7**, không đọc một buổi.
- **Vòng bụng:** ngang rốn, thở ra hết, cùng giờ mỗi 2 tuần; sai số thực tế ~1 cm nên chỉ so xu hướng 4 tuần.
- **Ảnh:** 4 tuần/lần, cùng góc/ánh sáng/quần áo.
- **Sức mạnh:** giữ một bài compound chuẩn, so e1RM cùng kỹ thuật; dao động 2–3% là nhiễu, không phải mất cơ.

**Khi nào kết thúc cut**:

- Đạt mốc 5% hoặc 10% đã đặt — kết thúc có chủ đích, không "cắt tới chán".
- Sức mạnh rơi liên tục, ngủ/mood xuống, HR nghỉ tăng (bài Hormone) — tín hiệu cắt quá gắt.
- Đã dưới ngưỡng mỡ hợp lý vì sức khỏe — tiếp tục deep cut không còn lợi ròng.

Kết thúc đúng cách: chuyển về **maintain 2–4 tuần** (ăn bằng TDEE hiện tại, protein giữ) trước khi nghĩ tiếp — nhảy từ cut thẳng sang bulk là cách tạo vòng yo-yo kinh điển.`,
    },
  ],
  applyBox: `**Gian tập thực hành — chu trình cut 12 tuần mẫu:**
1. Tuần 0: chốt **mốc 5% trước** (ví dụ 80 kg → −4 kg), rồi mới bàn 10%; đặt deficit 15–20%, protein 2 g/kg, tốc độ mục tiêu 0,5–0,8%/tuần.
2. Tuần 0: chụp ảnh + vòng bụng + battery cơ bản; dặn khách cân 5–7 ngày/tuần và chỉ đọc MA7.
3. Tuần 1–6: giữ nguyên; mỗi Chủ nhật đọc MA7. Nếu **3 tuần phẳng**: kiểm tra log 7 ngày trước, rồi chỉ đổi MỘT biến (+2.000–3.000 bước hoặc −200–300 kcal) và chờ 10–14 ngày.
4. Nếu mệt/ngủ kém/RPE tăng: diet break 5–7 ngày ăn maintain thay vì cắt sâu.
5. Tuần 7–12: tiếp tục nếu sức mạnh giữ; đạt 5% → quyết định maintain 2–3 tuần hay đi tiếp 10%.
6. Tuần 12: so bộ ba số (cân/vòng/ảnh) + battery; chuyển maintain 3 tuần rồi mới bàn "kế tiếp làm gì".`,
  terms: [
    {
      en: 'Deficit (sustainable)',
      vi: 'Thiếu hụt bền',
      def: 'Deficit vừa đủ để MA7 đi xuống đều — thắng deficit sâu mà khách bỏ sau 3 tuần.',
    },
    {
      en: 'Lean mass preservation',
      vi: 'Bảo toàn khối nạc',
      def: 'Tạ nặng + protein cao là hai công cụ chính; sức mạnh giữ được là chỉ báo quan trọng nhất.',
    },
    {
      en: 'NEAT-first cardio',
      vi: 'Cardio ưu tiên NEAT',
      def: 'Bước chân và Zone 2 làm "đóng cửa deficit" trước khi thêm HIIT — chi phí hồi phục thấp.',
    },
    {
      en: 'Cheat meal vs cheat day',
      vi: 'Bữa tự do vs ngày tự do',
      def: 'Một bữa/tuần giữ tinh thần mà không xoá cả tuần deficit; cả NGÀY tự do là con số phá plan.',
    },
    {
      en: 'Diet exit strategy',
      vi: 'Chiến lược thoát cut',
      def: 'Kết thúc có chủ đích + maintain 2–4 tuần trước khi đổi hướng — chống yo-yo.',
    },
    {
      en: 'Weight-loss plateau',
      vi: 'Điểm phẳng cân',
      def: 'MA7 không giảm trong 3 tuần liên tiếp sau khi đã kiểm tra log/nước/chu kỳ — không phải cứ phẳng là do chuyển hoá hỏng.',
    },
    {
      en: 'Adherence audit',
      vi: 'Kiểm tra tuân thủ',
      def: 'Rà 7 ngày log đầy đủ (kể cả cuối tuần, dầu sốt, đồ ăn ngoài) trước khi cắt calo — bước 0 của mọi plateau.',
    },
    {
      en: 'Measurement noise',
      vi: 'Nhiễu đo lường',
      def: 'Dao động nước/muối/glycogen làm cân nhảy ~1 kg/ngày, vòng bụng ~1 cm; chỉ xu hướng 2–4 tuần mới đáng ra quyết định.',
    },
  ],
  images: [],
  quiz: [
    {
      q: 'Theo E7, tốc độ giảm an toàn cho người tập là khoảng nào?',
      choices: ['0,5–1% cân nặng/tuần', '3–5%/tuần', '1 kg mỗi ngày', 'Không giới hạn'],
      answer: 0,
      explain:
        'Giảm chậm giữ được khối nạc và sức mạnh; khách càng gầy càng nên ở cận dưới của khoảng (Helms 2014).',
    },
    {
      q: 'Trong cut, phần TẠ giữ vai trò gì?',
      choices: [
        'Đốt calo chính',
        'Tín hiệu "còn cần cơ" để bảo toàn khối nạc — cardio chỉ là công cụ phụ',
        'Không quan trọng khi đang ăn ít',
        'Chỉ để giữ thói quen',
      ],
      answer: 1,
      explain:
        'Cơ giữ lại bằng tín hiệu sử dụng: giảm tạ để "đốt thêm" cardio là đổi kg nạc lấy vài trăm kcal.',
    },
    {
      q: 'Chỉ báo quan trọng nhất cho biết khách đang mất cơ trong cut?',
      choices: [
        'Cân giảm nhanh là mất cơ chắc chắn',
        'Sức mạnh tạ rơi nhanh 2 tuần liền + ngủ/mood xuống — tín hiệu deficit quá gắt',
        'Đau cơ sau buổi',
        'Đi ngoài nhiều',
      ],
      answer: 1,
      explain:
        'Rep giảm nhẹ là bình thường sâu trong cut; RƠI NHANH liên tục mới là còi cảnh báo cần chỉnh deficit hoặc hồi phục.',
    },
    {
      q: 'Vì sao cheat DAY nguy hiểm hơn cheat meal về mặt số học?',
      choices: [
        'Không khác gì',
        'Một ngày dư ~2.000–3.000 kcal xoá gần cả tuần deficit — còn một bữa chỉ lắc nhẹ trung bình',
        'Vì ngày có 24 giờ',
        'Chỉ nguy hiểm với khách gầy',
      ],
      answer: 1,
      explain:
        'Adherence là bài toán trung bình dài hạn: một bữa tự do giữ được hành vi mà không phá trục MA7.',
    },
    {
      q: 'Kết thúc cut đúng cách là gì?',
      choices: [
        'Nhảy thẳng sang bulk cho "lấp liếm"',
        'Chuyển maintain 2–4 tuần với protein giữ nguyên rồi mới bàn hướng tiếp theo',
        'Cắt calo tiếp tới khi khách chán',
        'Bỏ tập một tháng',
      ],
      answer: 1,
      explain:
        'Vòng cut → maintain → quyết định là cách chống yo-yo; nhảy đột ngột hướng sinh ra cú tăng mỡ hoàn trả.',
    },
    {
      q: 'Khách 80 kg đặt mốc giảm 10%. Mốc 5% đầu tiên là bao nhiêu và mất khoảng bao lâu ở 0,5–1%/tuần?',
      choices: [
        '2 kg trong 2–4 tuần',
        '4 kg trong khoảng 5–10 tuần',
        '8 kg trong 2 tuần',
        '10 kg trong 1 tuần',
      ],
      answer: 1,
      explain:
        '5% của 80 kg là 4 kg; ở 0,5–1%/tuần (0,4–0,8 kg/tuần) mốc này thường mất 5–10 tuần. Kế hoạch tổng thể nên tính 3–6 tháng cho mốc 5–10%, vì còn plateau và tuần giữ cân.',
    },
    {
      q: 'MA7 phẳng 3 tuần, khách ăn đúng và log đầy đủ. Bước đầu tiên nên làm gì?',
      choices: [
        'Cắt ngay 500 kcal',
        'Kiểm tra adherence/nước/chu kỳ, rồi thêm 2.000–3.000 bước hoặc −200–300 kcal — mỗi lần một biến, chờ 10–14 ngày',
        'Bỏ cardio và tăng calo',
        'Đổi toàn bộ giáo án',
      ],
      answer: 1,
      explain:
        'Plateau là bài toán chẩn đoán trước khi chỉnh. Thêm NEAT thường rẻ hơn cắt calo sâu; mỗi lần một biến để biết cái gì có công.',
    },
    {
      q: 'Khách đang cut, MA7 phẳng nhưng ngủ kém, RPE mọi bài tăng, mood xuống. Ưu tiên nào đúng?',
      choices: [
        'Cắt thêm 300 kcal',
        'Diet break 5–7 ngày ăn maintain rồi đánh giá lại — đừng cắt sâu thêm',
        'Tăng volume tập gấp đôi',
        'Bỏ protein để giảm calo',
      ],
      answer: 1,
      explain:
        'Khi có tín hiệu quá tải, cắt sâu thêm chỉ làm adherence và hiệu suất xấu hơn; diet break là công cụ đúng để hồi NEAT và đầu óc.',
    },
  ],
  related: {
    muscles: [],
    exercises: ['barbell-back-squat', 'barbell-bench-press', 'pull-up'],
    calculators: ['tdee', 'calories', 'macro', 'one-rm'],
    conditions: [],
    evidence: ['E7'],
  },
  sources: [
    {
      label: 'Helms et al. 2014 — Contest preparation (E7, đã kiểm chứng)',
      url: 'https://doi.org/10.1186/1550-2783-11-20',
      license: 'CC BY 4.0',
    },
    {
      label: 'Morton et al. 2018 — Protein (E3, đã kiểm chứng)',
      url: 'https://doi.org/10.1136/bjsports-2017-097608',
      license: 'CC BY 4.0',
    },
    {
      label: 'NHS 2026 — Overweight and obesity in adults (0,5–1 kg/tuần, mốc 5–10%)',
      url: 'https://www.nhs.uk/conditions/obesity/treatment/',
      license: 'cite-only',
    },
    {
      label: 'Fogarasi et al. 2022 — Rate of weight loss, body composition and metabolism',
      url: 'https://doi.org/10.1007/s13679-022-00470-4',
      license: 'cite-only',
    },
    {
      label: 'Steinberg et al. 2013 — Daily self-weighing intervention (–6,55% at 6 months)',
      url: 'https://doi.org/10.1002/oby.20396',
      license: 'cite-only',
    },
    {
      label: 'Burke et al. 2011 — Self-monitoring in weight loss (systematic review)',
      url: 'https://doi.org/10.1016/j.jada.2010.10.008',
      license: 'cite-only',
    },
  ],
};
