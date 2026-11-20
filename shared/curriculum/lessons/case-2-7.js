/**
 * Ca 7: nam 41 tuổi, thoát vị đĩa đệm L4-L5 có MRI, đau lan chân.
 * Case study đầy đủ: hồ sơ → MRI → thang phục hồi → giáo án ghép.
 *
 * Nguồn (đã kiểm chứng): Brinjikji 2015, Dubois & Esculier 2020,
 * health condition `herniated_disc` của PT Brain.
 */
export default {
  slug: 'case-2-7',
  module: 'case',
  chapter: 2,
  chapterTitle: 'Ca cụ thể',
  order: 7,
  title: 'Ca 7 — Thoát vị đĩa đệm L4-L5: đọc MRI đúng, tập đúng, hết sợ đúng',
  subtitle:
    'Hồ sơ đầy đủ từ MRI đến thang phục hồi 12 tuần — bản demo "phim không phải bản án" cho ca cột sống phổ biến nhất PT gặp.',
  minutes: 14,
  objectives: [
    'Đọc đúng báo cáo MRI thoát vị: cấp độ, hướng, chèn rễ nào — và biết cái nào cần gấp.',
    'Áp thang phục hồi lưng 5 bước theo tiêu chí 24h cho khách thoát vị đang duyệt y tế.',
    'Ghép giáo án gym "mọi thứ trừ nén–gập–xoay có tải" + duy trì phần thân còn mạnh.',
    'Đóng phiên báo cáo 12 tuần bằng 3 con số + 1 câu chuyện vận động đời sống.',
  ],
  sections: [
    {
      heading: 'Hồ sơ khách',
      body: `**Hùng, 41 tuổi, quản lý kho. 178 cm, 84 kg. Đau lưng dưới + lan xuống NGOÀI mặt sau chân trái tới bắp chân, tê nhẹ mu bàn chân trái. MRI 2 tháng trước: "Thoát vị đĩa đệm L4-L5, đè rễ trái, 6mm, không chèn tủy." Bác sĩ thần kinh: "Thuốc giảm đau + vật lý trị liệu, chưa cần mổ." Đang physio 1 lần/tuần (McKenzie extension + core). Đau hiện 2–3/10, lên 4–5 khi ngồi > 2 tiếng hoặc bê > 15 kg. Chưa từng tập gym bài bản; từng bê hàng nặng hàng ngày.**

**Battery điều chỉnh:** plank 40 giây, dead bug tốt, hinge gậy gỗ "vỡ" nhẹ ở 60°, push-up 10, sit-to-stand 12/5. Không test squat/deadlift tối đa.

**Mục tiêu khách nói:** "Bác sĩ nói không mổ được thì tập. Em muốn trở lại bê hàng như hồi 35 tuổi — và không muốn đỡ con bằng lưng nữa."

**Điểm mấu chốt cần giải thích ngay từ đầu:**
1. **6mm không phải con số lớn** — Brinjikji 2015 cho thấy MRI người KHÔNG đau cũng đầy thoát vị tương tự (bài rehab-2-1).
2. **"Đè rễ trái"** giải thích tê chân — và tê sẽ giảm dần khi rễ hết viêm, không phải "chữa vĩnh viễn ngày mai".
3. **"Không chèn tủy"** = không có red flag thần kinh — mức an toàn để vận động có kiểm soát.`,
    },
    {
      heading: 'Phân tích: ba lớp việc phải làm',
      body: `**Lớp 1 — Giáo dục (ngay buổi đầu):**
- Phim không quyết định cơn đau (Brinjikji 2015) — nhiều thoát vị tự nhỏ lại.
- "Đĩa đệm không phải đĩa mềm dễ tuột" (bài Cột sống & tư thế).
- Con đường: vận động theo tiêu chí, không phải "tránh vĩnh viễn".

**Lớp 2 — Giáo án gym quanh điều kiện herniated_disc:**

| Ngày | Bài (50 phút) | Vì sao |
| --- | --- | --- |
| T2 | Chest press máy 3×10 · Lat pulldown 3×10 · Leg press 3×12 · Dead bug 3×8 · Push-up 3×max | Không nén cột sống, chân qua máy |
| T4 | Incline DB press 3×8 · Seated cable row (tựa ngực) 3×10 · Hip thrust 3×10 · Side plank 2×25s | Chân/mông qua bài không nén |
| T6 | Shoulder press máy 3×8 · One-arm DB row (tựa ghế) 3×10 · RDL tạ đơn nhẹ 3×10 · Hinge gậy gỗ 3×10 · Bird dog 3×8 | Hinge là bài "kiểm tra hàng tuần" |

**Loại** (đúng rules app): barbell back squat, conventional deadlift, barbell row, good morning, cable crunch — mọi bài nén/gập/xoay có tải.

**Lớp 3 — Cardio + đời sống:**
- Đạp xe tay 20–30 phút × 3/tuần (không chạy lúc nền còn yếu).
- Standing desk + đứng lên mỗi 45 phút (Hùng ngồi nhiều cho nghề).
- Bê hàng: dùng hinge, không dùng lưng (bài Cột sống & tư thế).`,
    },
    {
      heading: 'Kế hoạch ăn: đủ để sửa mô',
      body: `Hùng 84 kg — không cần deficit sâu lúc đang phục hồi (bài case-2-6 cùng logic):

- **Calo maintain** ~2.450 (BMR 1.780 × 1.4) — không cắt, nguyên liệu sửa mô cần đủ.
- **Protein ~1,8 g/kg** = ~150 g (bài Protein) — hiện tại Hùng ăn ~90 g; đây là khoảng trống lớn nhất.
- **Nước 2–2,5 L** — đĩa đệm là mô nước; thiếu nước cả ngày làm đĩa kém "đệm".
- **Không bia nặng giai đoạn này** — giấc ngủ + viêm mô là hai điểm ảnh hưởng thật.

Bữa sáng (bỏ hiện tại) + whey sau buổi = 2 thay đổi dễ nhất, +50 g protein ngay.`,
    },
    {
      heading: 'Đường 12 tuần và câu chuyện kết',
      body: `| Tuần | Mốc | Hướng dẫn |
| --- | --- | --- |
| 1–4 | Core + hinge học lại, mọi bài theo tiêu chí 24h | Ghi cột đau 0–10 sau mỗi buổi |
| 5–8 | Hinge gậy gỗ "dán" ổn + RDL nhẹ đạt → thêm **deadlift máy/trap bar nhẹ** (theo physio đồng thuận) | Tăng dần theo RIR 2–3 |
| 9–12 | Deadlift máy đạt mức "vừa"; đo battery mini: plank, push-up, hinge form | Báo cáo 3 con số |

**Báo cáo 12 tuần (dự kiến):**
- Pain chung: 2–3/10 → 1/10 (tê chân gần hết, chỉ còn thoáng khi ngồi lâu).
- Plank: 40 → 75 giây; push-up: 10 → 18.
- **Câu chuyện vận động**: "Bê con 15 kg bằng hinge không đau, đứng lên khỏi ghế không cần tay vịn" — đây là sản phẩm thật của ca thoát vị.

Nếu mốc 5–8 không đạt (hinge chưa dán, deadlift máy chưa thể thêm) → bàn giao sâu hơn với physio, không phải thất bại của ai (bài rehab-2-1: làm đúng mà không tiến = tín hiệu chuyên gia).`,
    },
  ],
  applyBox: `**Checklist chuyển thể cho ca "Hùng" của bạn:**
1. Đọc MRI cùng khách một lần: đây là hình, không phải bản án — giải thích từng thuật ngữ (Brinjikji 2015).
2. Chọn quy tắc herniated_disc trong app để wizard tự loại bài nén/gập/xoay.
3. 3 câu chốt với physio: giao thức ở bước mấy, đau cho phép bao nhiêu, tránh gì — ghi Sổ tay.
4. Bữa sáng + whey = 2 thay đổi ăn đầu tiên, trước mọi "chế độ".
5. Hẹn mốc 12 tuần với 3 con số + 1 câu chuyện — không hứa "hết đau 100%".`,
  safetyBox:
    'Nếu tê chân tăng dần, yếu rõ (nhấc bàn chân không lên), rối loạn tiểu → khám NGAY (bài Red flags). Mọi kế hoạch tải cho cột sống đang tổn thương cần duyệt y tế — ca này minh hoạ quy trình phối hợp, không tự điều trị.',
  terms: [
    {
      en: 'Disc extrusion (6mm)',
      vi: 'Thoát vị đĩa (6mm)',
      def: 'Phần nhân đĩa nhô qua vòng sợi ra ngoài — 6mm thuộc mức vừa; nhiều trường hợp tự nhỏ lại theo thời gian.',
    },
    {
      en: 'Nerve root compression (L5)',
      vi: 'Đè rễ thần kinh (L5)',
      def: 'Rễ L5 bị đè → tê ngoài mặt sau chân trái + mu bàn chân; tê giảm dần khi rễ hết viêm, không "chữa một buổi".',
    },
    {
      en: 'Hinge re-education',
      vi: 'Học lại hinge',
      def: 'Thang brace → gậy gỗ → RDL nhẹ → máy/trap bar — mỗi nấc mở bằng phản ứng 24h sạch.',
    },
    {
      en: 'Tissue-repair calorie floor',
      vi: 'Mức calo tối thiểu để sửa mô',
      def: 'Không deficit sâu khi đang phục hồi: mô cần nguyên liệu, cắt sâu làm mọi thứ chậm lại.',
    },
    {
      en: 'Life-transfer win (disc case)',
      vi: 'Thắng chuyển vào đời sống (ca đĩa)',
      def: '"Bê con bằng hinge không đau" — chỉ số quý nhất của ca thoát vị, hơn mọi con số tạ.',
    },
  ],
  images: [],
  quiz: [
    {
      q: '"MRI ghi thoát vị L4-L5, 6mm" — cách nói đúng với Hùng là gì?',
      choices: [
        '"6mm là to lắm, cẩn thận tuyệt đối"',
        '"MRI người không đau cũng đầy hình như thế — 6mm vừa, nhiều trường hợp tự nhỏ lại; hình ảnh không quyết định cơn đau"',
        '"Phải mổ ngay"',
        '"Không bao giờ được bê gì nữa"',
      ],
      answer: 1,
      explain:
        'Brinjikji 2015: hàng nghìn người khỏe mạnh có thoát vị trên MRI — giáo dục là 50% đơn của ca cột sống.',
    },
    {
      q: 'Vì sao tê mặt ngoài chân trái + mu bàn chân của Hùng không biến mất ngay?',
      choices: [
        'Vì đĩa không lành được',
        'Rễ L5 bị đè đang viêm — tê giảm dần khi rẹ hết viêm theo tuần, không phải "chữa một buổi"',
        'Vì tập sai',
        'Vì di truyền',
      ],
      answer: 1,
      explain:
        'Rễ thần kinh hồi chậm hơn mô mềm — nói trước cho khách để không thất vọng tuần 3 khi tê còn "khóg kháng".',
    },
    {
      q: 'Vì sao calo maintain (không deficit) cho Hùng đang phục hồi?',
      choices: [
        'Vì Hùng thích ăn',
        'Mô đang sửa cần nguyên liệu đầy — deficit sâu làm nguyên liệu thiếu, mọi thứ chậm lại',
        'Vì muốn tăng cơ',
        'Không có lý do',
      ],
      answer: 1,
      explain:
        'Bài Năng lượng + Hormone: calo đủ là môi trường sửa mô; nếu khách thừa mỡ, chỉ deficit RẤT nhẹ sau khi lưng ổn.',
    },
    {
      q: 'Deadlift máy/trap bar được thêm vào giáo án của Hùng ở tuần nào?',
      choices: [
        'Buổi đầu tiên để "test"',
        'Tuần 5–8, khi hinge gậy gỗ đã "dán" hai điểm ổn định + RDL nhẹ đạt tiêu chí + physio đồng thuận',
        'Không bao giờ',
        'Chỉ sau mổ',
      ],
      answer: 1,
      explain:
        'Thang có thứ tự: isometric → hinge học → hinge nhẹ có tải → máy/trap bar — nhảy cóc là tự phá tiến trình.',
    },
    {
      q: 'Câu chuyện kết 12 tuần đáng giá nhất cho ca thoát vị là gì?',
      choices: [
        '"Hùng tạ 100 kg deadlift"',
        '"Hùng bê con 15 kg bằng hinge không đau, đứng lên ghế không cần tay vịn" — vận động đời sống',
        '"MRI sạch hoàn toàn"',
        '"Hùng giảm 5 kg"',
      ],
      answer: 1,
      explain:
        'Chỉ số thật của ca cột sống là sự tự chủ vận động, không phải con số tạ hay MRI sạch — đó là thứ khách mua.',
    },
  ],
  related: {
    muscles: ['erector-spinae', 'multifidus', 'rectus-abdominis', 'transversus-abdominis', 'gluteus-maximus'],
    exercises: ['plank', 'side-plank', 'seated-cable-row', 'hip-thrust', 'leg-press', 'romanian-deadlift'],
    calculators: ['bmr', 'tdee', 'macro'],
    conditions: ['low_back_pain', 'herniated_disc', 'neck_pain'],
    evidence: [],
  },
  sources: [
    {
      label: 'Brinjikji et al. 2015 — Asymptomatic imaging findings (DOI đã kiểm chứng)',
      url: 'https://doi.org/10.3174/ajnr.a4173',
      license: 'cite-only',
    },
    {
      label: 'Dubois & Esculier 2020 — PEACE & LOVE (DOI đã kiểm chứng)',
      url: 'https://doi.org/10.1136/bjsports-2019-101253',
      license: 'cite-only',
    },
    {
      label: 'Raja et al. 2020 — IASP definition of pain (đã kiểm chứng)',
      url: 'https://doi.org/10.1097/j.pain.0000000000001939',
      license: 'cite-only',
    },
  ],
};
