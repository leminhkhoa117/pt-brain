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
    'Từ con số deficit tới cách xử "điểm dừng" và sai lầm làm đổ adherence — quy trình giảm mỡ mà khách bám được cả 12 tuần.',
  minutes: 12,
  objectives: [
    'Đặt deficit, tốc độ và protein chuẩn cho một chu kỳ giảm (0,5–1%/tuần, E7).',
    'Thiết kế phần tập để GIỮ cơ trong deficit: tạ giữ ưu tiên, cardio làm công cụ phụ.',
    'Nhận diện 4 sai lầm phá adherence phổ biến và cách thay thế.',
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
      heading: 'Đo, dừng và chuyển',
      body: `**Đo**: MA7 cân (bài Năng lượng) + vòng bụng 2 tuần/lần + ảnh 4 tuần/lần — ba thước này dùng suốt chu kỳ.

**Khi nào kết thúc cut**:

- Đạt mục tiêu hình thể/bàiv test — kết thúc có chủ đích, không "cắt tới chán".
- Sức mạnh rơi liên tục, ngủ/mood xuống, HR nghỉ tăng (bài Hormone) — tín hiệu cắt quá gắt.
- Đã dưới ngưỡng mỡ hợp lý vì sức khỏe — tiếp tục deep cut không còn lợi ròng.

Kết thúc đúng cách: chuyển về **maintain 2–4 tuần** (ăn bằng TDEE hiện tại, protein giữ) trước khi nghĩ tiếp — nhảy từ cut thẳng sang bulk là cách tạo vòng yo-yo kinh điển.`,
    },
  ],
  applyBox: `**Gian tập thực hành — chu trình cut 12 tuần mẫu:**
1. Tuần 0: chốt 3 con số (deficit 15–20%, protein 2 g/kg, tốc độ mục tiêu 0,7%/tuần); chụp ảnh + vòng bụng + battery cơ bản.
2. Tuần 1–6: giữ nguyên; chỉ đọc MA7 mỗi sáng Chủ nhật — điều chỉnh MỘT biến (−100 kcal hoặc +2.000 bước) nếu 2 tuần phẳng.
3. Tuần 7: diet break 5–7 ngày ăn maintain (bài Refeed) nếu mệt rõ — sau đó tiếp tục.
4. Tuần 12: so bộ ba số (cân/vòng/ảnh) + battery; chuyển maintain 3 tuần rồi mới bàn "kế tiếp làm gì".`,
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
  ],
};
