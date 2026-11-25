/**
 * Ca 1: nam 32 văn phòng, mới tập, mục tiêu giảm 8 kg.
 * Ghép bài Năng lượng/Protein/Giảm mỡ/WHO/Capstone với số liệu cụ thể.
 *
 * Nguồn (đã kiểm chứng ở các module trước): Helms 2014 (E7), Morton 2018
 * (E3), Schoenfeld 2017 (E1), WHO 2020.
 */
export default {
  slug: 'case-2-1',
  module: 'case',
  chapter: 2,
  chapterTitle: 'Ca cụ thể',
  order: 1,
  title: 'Ca 1 — Nam 32 tuổi văn phòng: giảm 8 kg mà không mất sức mạnh',
  subtitle:
    'Hồ sơ, phân tích con số, giáo án 3 buổi và thực đơn 2.100 kcal — bản demo đầy đủ của quy trình 6 bước cho archetype phổ biến nhất.',
  minutes: 13,
  objectives: [
    'Chạy quy trình 6 bước trên một hồ sơ giảm mỡ điển hình với số liệu cụ thể.',
    'Đặt deficit, protein và tốc độ giảm hợp lý theo E7 (0,5–1%/tuần).',
    'Thiết kế giáo án full-body 3 buổi giữ sức mạnh + NEAT/cardio làm công cụ phụ.',
    'Biết chính xác cái gì chỉnh ở tuần 4 và tuần 8 theo dữ liệu MA7/rep.',
  ],
  sections: [
    {
      heading: 'Hồ sơ khách',
      body: `**Minh, 32 tuổi, kỹ sư phần mềm. 175 cm, 82 kg. Ngồi 9 tiếng/ngày, đi bộ < 3.000 bước. Chưa từng tập có hệ thống; từng chạy 2 tuần rồi bỏ. Không bệnh nền, không thuốc. Ngủ 6–6,5 tiếng (đang cố cải thiện). Ăn ngoài 5 bữa/tuần, uống 2 lon bia thứ Sáu.**

**Battery buổi đầu:** push-up 6 (form vỡ ở rep 7), plank 32 giây, sit-and-reach −5 cm, đi 1 dặm 14:20 với HR đích 168, vòng bụng 96 cm.

**Mục tiêu khách nói:** "Giảm 8 kg cho sang năm, không được 'ốm' đi."

Phân tích archetype: **giảm mỡ + người mới** → ưu tiên số một là deficit bền (không gắt) + giữ sức mạnh; lợi thế lớn của Minh là *con số mới bắt đầu thấp — mọi thứ nhích nhanh* (bài Thích ứng thần kinh).`,
    },
    {
      heading: 'Phân tích số (bước 3)',
      body: `- **TDEE điểm bắt đầu**: BMR Mifflin ~1.760 kcal; hệ số 1,4 (ngồi nhiều + sắp tập) → **TDEE ~2.450** (ghi rõ: giả thuyết ±10–20% — bài Năng lượng).
- **Mục tiêu calo**: deficit 15% → **~2.050–2.100 kcal/ngày**.
- **Protein**: 1,8 g/kg → **~148 g/ngày** (bài Protein — giữ cơ trong cut).
- **Tốc độ E7**: 0,5–0,75%/tuần × 82 kg = **0,4–0,6 kg/tuần** → 8 kg là hành trình ~14–16 tuần; hẹn mốc 12 tuần −5–6 kg kèm diet break.
- **Vùng HR**: max ≈ 186 (Tanaka) → Zone 2 ~112–130 (máy tính HR zones của app).

Lịch sử "tập 2 tuần rồi bỏ" hai lần = tín hiệu adherence; thiết kế phải **đóng gói quanh cuộc sống thật** (bài Quy trình 6 bước): 3 buổi 45–55 phút sáng thứ 3/5/7 — giờ duy nhất Minh chắc chắn trống.`,
    },
    {
      heading: 'Giáo án tập (bước 5) — full body 3 buổi',
      body: `Nguyên tắc: mới tập → volume cận dưới (E1), full body tần suất 2–3 lần/nhóm (E2), RIR 1–3 (E4), nghỉ compound 2–3 phút (E5).

| Ngày | Nội dung (45–55 phút) |
| --- | --- |
| T3 | Leg press 3×8–10 · Bench press máy 3×8–10 · Seated cable row 3×10 · Plank 3×30s · Push-up tập nấc 2×max form |
| T5 | Goblet squat 3×10 · Landmine press 3×8 mỗi bên · One-arm dumbbell row 3×10 mỗi bên · Dead bug 3×8 mỗi bên |
| T7 | RDL tạ đơn nhẹ 3×10 · Dumbbell shoulder press 3×8–10 · Lat pulldown 3×10 · Side plank 2×20s mỗi bên |

- **Cardio**: nền NEAT — mục tiêu **8.000 bước/ngày** (lên từ 3.000; đi bộ vòng công viên lúc nghỉ trưa); 1 buổi Zone 2 30 phút cuối tuần khi đã quen 4 tuần.
- **Progression**: tạ +2,5 kg khi 2 lần liên tiếp đạt cận trên + RIR ≥ 2 (quy tắc app).
- **Tuần 13 (nếu tiếp)**: deload volume −40% rồi đánh giá (E8).`,
    },
    {
      heading: 'Kế hoạch ăn (bước 5) — 2.100 kcal mẫu',
      body: `| Bữa | Món | ~kcal | Protein |
| --- | --- | --- | --- |
| Sáng | 3 trứng + 2 lát bánh mì đen + cà phê sữa ít đường | ~480 | ~26 g |
| Trưa (văn phòng) | Cơm 1 chén + gà 180 g + rau xào ít dầu | ~620 | ~50 g |
| Sau buổi tập | Whey 1 scoop + chuối | ~260 | ~26 g |
| Tối | Cơm 1 chén + cá/thịt nạc 150 g + rau + canh | ~560 | ~35 g |
| Thêm | Sữa chua không đường + hạt | ~180 | ~12 g |

Tổng ≈ **2.100 kcal, ~150 g protein** — bám khung bữa Minh **đã có** (bài Quy trình: thay món, không thêm bữa mới). Hai lon bia thứ Sáu: không cấm — tính vào tuần như ~300 kcal và bỏ một món phụ hôm đó; "cấm đêm bia" từng làm Minh bỏ tập (adherence!).

Ghi mọi thứ bằng **module Dinh dưỡng của app** (nhập tay hoặc chụp ảnh): tuần đầu cần số liệu, sau đó ước lượng đã hiệu chuẩn.`,
    },
    {
      heading: 'Theo dõi & quyết định (bước 6)',
      body: `- **Mỗi sáng**: cân (MA7 tự tính trong app) — quyết định chỉ đọc MA7 Chủ nhật.
- **Chủ nhật tuần 4**: MA7 giảm 1,6–2,4 kg? → đúng kịch bản, giữ nguyên. Phẳng **3 tuần**? → **chỉ MỘT thay đổi**: −200–300 kcal HOẶC +2.000–3.000 bước (bài Năng lượng).
- **Tuần 4–5**: nếu mệt rõ (ngủ kém, RPE mọi bài tăng — bài Hormone) → 5 ngày ăn maintain (bài Refeed) rồi tiếp.
- **Tuần 8**: re-test battery mini — push-up, plank, 1 dặm. Kỳ vọng hợp lý: push-up 6→12, plank 32→60s, dặm nhanh hơn 40–60 giây **và** rep tạ tăng — bộ ba bằng chứng "giảm mỡ không mất sức".
- **Tuần 12**: vòng bụng −4–6 cm, ảnh tiến độ, quyết định hướng tiếp (maintain 3 tuần → chu kỳ 2 — bài Thoát cut).

Ba tín hiệu cần khách báo ngay (không đợi Chủ nhật): đau lan chân, đau đêm, hoặc mệt bất thường — khung red flags của bài Khoa học về đau.`,
    },
  ],
  applyBox: `**Checklist chuyển thể cho ca "Minh" của chính bạn:**
1. Đổi con số (TDEE/protein/bước chân) theo hồ sơ thật — KHÔNG giữ nguyên 2.100 kcal cho mọi khách 80 kg.
2. Giữ nguyên khung: 3 buổi full body + NEAT trước, Zone 2 sau; deficit 15% + protein 1,8 g/kg.
3. Copy quyết định tuần 4/8: một thay đổi mỗi lần; diet break chỉ theo tín hiệu mệt.
4. Buổi giao giáo án: mở app cùng khách, đi từng ngày + bữa — adherence thắng nửa trận từ hôm đó.`,
  terms: [
    {
      en: 'Deficit-first archetype',
      vi: 'Archetype ưu tiên deficit',
      def: 'Ca giảm mỡ phổ thông: deficit vừa + protein cao + tạ giữ sức — cardio là công cụ phụ đóng cửa calo.',
    },
    {
      en: 'Newbie window',
      vi: 'Cửa sổ người mới',
      def: 'Số mới bắt đầu thấp → neural + mọi battery nhích nhanh — dùng làm động lực tuần đầu (bài Thích ứng thần kinh).',
    },
    {
      en: 'NEAT ramp',
      vi: 'Tăng NEAT theo bậc',
      def: 'Bước chân 3.000 → 8.000 trước khi thêm buổi Zone 2 — chi phí hồi phục gần zero, đóng cửa deficit bền.',
    },
    {
      en: 'Week-4 fork',
      vi: 'Ngã rẽ tuần 4',
      def: 'MA7 phẳng 3 tuần → đúng MỘT thay đổi (−200–300 kcal hoặc +2.000–3.000 bước) — không "phạt" bằng cắt đôi calo.',
    },
    {
      en: 'Strength-retention test',
      vi: 'Test giữ sức mạnh',
      def: 'Re-test push-up/plank/1RM ước lượng giữa cut: rep giữ hoặc tăng = giảm mỡ không mất cơ — báo cáo mạnh nhất với khách.',
    },
  ],
  images: [],
  quiz: [
    {
      q: 'Với Minh (82 kg, TDEE ước 2.450), đặt calo + protein hợp lý theo các bài đã học?',
      choices: [
        '1.200 kcal, protein 60 g cho giảm nhanh',
        '~2.050–2.100 kcal (deficit 15%) + protein ~148 g (1,8 g/kg)',
        '3.000 kcal, ăn thoải mái rồi tập nhiều bù',
        'Chỉ whey mỗi ngày',
      ],
      answer: 1,
      explain:
        'Deficit vừa giữ adherence + sức mạnh; protein 1,6–2,2 g/kg (E3) là chốt giữ cơ — con số của ca này rơi vào 1,8 g/kg.',
    },
    {
      q: 'Tại sao NEAT (bước chân) được xếp TRƯỚC buổi Zone 2 trong kế hoạch cardio?',
      choices: [
        'Vì đi bộ hay hơn chạy',
        'Chi phí hồi phục gần zero, dễ bám theo lịch văn phòng — và NEAT rơi âm thầm là lý do deficit "tự biến mất" (bài Năng lượng)',
        'Vì Zone 2 vô dụng',
        'Vì máy chạy hư',
      ],
      answer: 1,
      explain:
        '8.000 bước xây nền đóng cửa calo mà không tranh ngân sách phục hồi với 3 buổi tạ; Zone 2 thêm sau khi thói quen ổn.',
    },
    {
      q: 'Chủ nhật tuần 4: MA7 chỉ giảm 0,3 kg trong 3 tuần. Hành động đúng?',
      choices: [
        'Cắt còn 1.400 kcal ngay',
        'Đúng MỘT thay đổi: −200–300 kcal HOẶC +2.000–3.000 bước, rồi chờ 2 tuần dữ liệu tiếp',
        'Bỏ luôn giảm mỡ',
        'Thêm 3 buổi HIIT mỗi ngày',
      ],
      answer: 1,
      explain:
        'Mỗi lần đổi một biến số thì tín hiệu sau đó đọc được nguyên nhân — cắt mạnh đột ngột thường làm NEAT rơi tiếp, phản tác dụng.',
    },
    {
      q: '"Hai lon bia thứ Sáu" của Minh xử lý thế nào cho adherence?',
      choices: [
        'Cấm tuyệt đối vì bia có calo',
        'Tính vào tuần (~300 kcal, bỏ món phụ hôm đó) — giữ đời sống xã hội của khách, thứ từng làm anh bỏ tập',
        'Uống bù bằng chạy 10 km',
        'Đổi sang 6 lon light',
      ],
      answer: 1,
      explain:
        'Kế hoạch thắng là kế hoạch khách sống được cùng: tính toán thay vì cấm đoán — chi tiết nhỏ này giữ được cả 12 tuần.',
    },
    {
      q: 'Bằng chứng nào ở tuần 8 trả lời câu "giảm mỡ có mất sức không"?',
      choices: [
        'Cân giảm là đủ',
        'Push-up 6→12 + plank 32→60s + rep tạ giữ/tăng cùng vòng bụng giảm',
        'Ảnh mạng xã hội đẹp',
        'Số buổi bỏ tập',
      ],
      answer: 1,
      explain:
        'Bộ ba rep-tạ/battery/vòng bụng là test giữ sức mạnh (E7: protein + tạ + tốc độ chậm) — mạnh hơn mọi lời hứa.',
    },
  ],
  related: {
    muscles: ['quadriceps', 'pectoralis-major', 'latissimus-dorsi'],
    exercises: ['leg-press', 'machine-chest-press', 'seated-cable-row', 'push-up', 'romanian-deadlift'],
    calculators: ['bmr', 'tdee', 'calories', 'macro', 'hr-zones', 'one-rm'],
    conditions: [],
    evidence: ['E1', 'E2', 'E3', 'E4', 'E7'],
  },
  sources: [
    {
      label: 'Helms et al. 2014 — Fat loss prescription (E7, đã kiểm chứng)',
      url: 'https://doi.org/10.1186/1550-2783-11-20',
      license: 'CC BY 4.0',
    },
    {
      label: 'Morton et al. 2018 — Protein (E3, đã kiểm chứng)',
      url: 'https://doi.org/10.1136/bjsports-2017-097608',
      license: 'CC BY 4.0',
    },
    {
      label: 'WHO — Guidelines on physical activity (2020, URL đã kiểm chứng)',
      url: 'https://www.who.int/publications/i/item/9789240015128',
      license: 'cite-only',
    },
  ],
};
