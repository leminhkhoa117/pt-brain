/**
 * Ca 9: nam 52 tuổi tiểu đường type 2 + thừa cân, dùng metformin.
 *
 * Nguồn: WHO 2020, ACSM Guidelines (cite-only),
 * bài Special populations + Năng lượng của app.
 */
export default {
  slug: 'case-2-9',
  module: 'case',
  chapter: 2,
  chapterTitle: 'Ca cụ thể',
  order: 9,
  title: 'Ca 9 — Nam 52 tuổi tiểu đường type 2: vận động là "tiêm insulin tự nhiên"',
  subtitle:
    'Metformin + HB1AC 7,8% + 92 kg — kế hoạch 12 tuần ghép kháng lực + Zone 2 để đường huyết và cân cùng giảm, theo dõi bằng số liệu khách tự đo.',
  minutes: 13,
  objectives: [
    'Thiết kế giáo án cho khách T2D: 2 buổi kháng lực + Zone 2, tăng dần theo tín hiệu đường huyết.',
    'Điều chỉnh ăn: carb phân bổ đều, không cắt sâu đột ngột khi đang dùng thuốc.',
    'Nắm 3 tín hiệu cần báo bác sĩ: hạ đường huyết khi tập, HB1AC không nhích, vết thương không lành.',
    'Giải thích cơ chế: cơ mạnh = "hút" glucose không cần insulin — kháng lực là thuốc thật.',
  ],
  sections: [
    {
      heading: 'Hồ sơ khách',
      body: `**Tâm, 52 tuổi, kinh doanh nhỏ. 170 cm, 92 kg (BMI 31,8). Tiểu đường type 2 chẩn đoán 2 năm, dùng Metformin 1000mg × 2/ngày. HB1AC 7,8% (mục tiêu bác sĩ: < 7%). Huyết áp ổn định 135/85. Chưa từng tập; đi bộ 10 phút/tuần. Ngủ 6 tiếng. Đo đường huyết sáng: 8,5–9,5 mmol/L.**

**Battery điều chỉnh:** push-up 4 (bậc nghiêng), plank 20 giây, dặm đi 16:20/HR 162, vòng bụng 108 cm. Không test tạ tối đa (huyết áp + chưa có nền).

**Mục tiêu khách nói:** "Bác sĩ nói phải vận động, HbA1c không giảm được bằng thuốc một mình. Em muốn xuống dưới 85 kg và ngừng tăng thuốc."

**Sự thật cần nói trước:**
1. **Cơ là "bể chứa glucose" lớn nhất cơ thể** — cơ mạnh hút đường máu không cần insulin thêm.
2. **Tập xong 24–48h**, nhạy insulin tăng — buổi thứ 3/tuần tốt hơn 1 buổi dài.
3. **Metformin + tập** có thể gây hạ đường huyết nếu chưa ăn — cần quy tắc an toàn.`,
    },
    {
      heading: 'Quy tắc an toàn trước khi vào gym',
      body: `Ba quy tắc "không thương lượng":

1. **Đo đường huyết trước buổi tập**: nếu < 5 mmol/L → ăn snack carb (chuối, bánh quy) trước khi tập; nếu > 15 mmol/L → hoãn buổi, đo ketone nếu có máy.
2. **Mang theo nguồn đường nhanh** trong túi khi tập (kẹo, glucose tablets) — hạ đường huyết giữa buổi là tin nhắn muốn gặp ngay.
3. **Giày kiểm tra chân mỗi tuần** — tiểu đường làm giảm cảm giác bàn chân; vết xước nhỏ có thể không thấy, cần soi và chăm sớm.

**Tránh**: Valsalva (nín thở) và set 1RM — huyết áp nhân với tiểu đường là cặp cần tôn trọng (bài Special populations). RIR 2–3 mọi set.`,
    },
    {
      heading: 'Giáo án 12 tuần — 3 lớp việc',
      body: `**Kháng lực (2 buổi × 40 phút, T3 + T7):**

| Ngày | Bài | Ghi chú |
| --- | --- | --- |
| T3 | Leg press 3×12 · Chest press máy 3×12 · Seated row 3×12 · Plank 3×20s · Đạp xe 10' | RIR 2–3, thở ra khi đẩy |
| T7 | Goblet squat nhẹ 3×10 · Lat pulldown 3×12 · Hip thrust 3×10 · Dead bug 3×8 · Đi bộ 10' | Tăng dần theo quy tắc app |

**Zone 2 cardio (tích luỹ dần):**
- Tuần 1–4: 3 × 15 phút đi nhanh (nói trọn câu) sau bữa tối — giúp đường sau ăn.
- Tuần 5–12: tăng lên 3 × 25–30 phút; thêm 1 buổi đạp xe nhẹ nếu thích.

**Ăn (không "kiêng" — điều chỉnh):**
- Carb **phân bổ đều** các bữa (không dồn 1 bữa lớn) — đường máu phẳng hơn (bài Special populations).
- Protein ~1,5 g/kg = ~140 g — hiện Tâm ăn ~80 g; thêm bữa sáng đạm là việc dễ nhất.
- Deficit nhẹ ~10% (~2.200 kcal): tốc độ −0,4–0,5 kg/tuần, không gắt.

**Đo:** đường huyết sáng mỗi ngày (khách có máy) + HB1AC 3 tháng sau ở bác sĩ.`,
    },
    {
      heading: 'Đường 12 tuần và kýêu kỳ vọng',
      body: `| Tuần | Kỳ vọng đường huyết | Kỳ vọng cân | Ghi chú |
| --- | --- | --- | --- |
| 4 | Nhạy hơn: sau tập giảm rõ so với trước | −1–1,5 kg | Nếu có hạ đường huyết → báo bác sĩ chỉnh thuốc |
| 8 | Sáng giảm dần về 7,5–8,5 mmol/L | −2,5–3 kg | Thêm buổi 3 nếu ổn 4 tuần liền |
| 12 | HB1AC gần 7% (đo bác sĩ) | −4–5 kg (≈ 87 kg) | Bác sĩ có thể giảm liều metformin |

**Tín hiệu cần báo bác sĩ NGAY:**
- Đường huyết < 4 mmol/L khi tập (thuốc đang thừa so với mức vận động mới)
- Vết thương bàn chân không lành > 3 ngày
- Đau ngực hoặc chóng mặt khi tập

**Câu chuyện kết 12 tuần:** "Tâm xuống 87 kg, HB1AC 6,9%, bác sĩ giảm Metformin xuống 500mg × 2 — cơ bắp là 'thuốc' thứ hai."`,
    },
  ],
  applyBox: `**Checklist chuyển thể cho ca "Tâm" của bạn:**
1. Ba quy tắc an toàn đều: đo trước buổi, mang đường nhanh, giày kiểm tra chân hàng tuần.
2. 2 buổi kháng lực máy (RIR 2–3, không Valsalva) + Zone 2 tích luỹ sau bữa tối.
3. Carb phân bổ đều + protein lên +150 g; deficit nhẹ 10%.
4. Đo bằng đường huyết sáng (hàng ngày) + HB1AC (bác sĩ, 3 tháng).
5. Mọi thay đổi thuốc là việc của bác sĩ — PT cung cấp dữ liệu và tuân thủ phiếu.`,
  safetyBox:
    'Tiểu đường đang dùng thuốc: mọi thay đổi vận động/ăn cần bác sĩ biết và duyệt. Hạ đường huyết khi tập là tín hiệu báo ngay. Vết thương chân không lành → khám. Bài học minh hoạ quy trình, không thay thế y tế.',
  terms: [
    {
      en: 'Insulin sensitivity (exercise)',
      vi: 'Nhạy insulin qua vận động',
      def: 'Cơ co hut glucose không cần insulin thêm — hiệu ứng kéo dài 24–48h sau buổi, lý do 3 buổi/tuần tốt hơn 1 buổi dài.',
    },
    {
      en: 'HbA1c',
      vi: 'HbA1c',
      def: 'Đường huyết trung bình 3 tháng — con số bác sĩ dùng để điều chỉnh thuốc; vận động + giảm cân kéo nó xuống.',
    },
    {
      en: 'Exercise hypoglycemia risk',
      vi: 'Rủi ro hạ đường huyết khi tập',
      def: 'Metformin + vận động mới có thể gây hạ — đo trước buổi, mang đường nhanh, báo bác sĩ nếu xảy ra.',
    },
    {
      en: 'Carb distribution (T2D)',
      vi: 'Phân bổ carb (T2D)',
      def: 'Trải carb đều các bữa thay vì dồn 1 bữa — đường máu phẳng hơn cùng tổng lượng.',
    },
    {
      en: 'Diabetic foot care',
      vi: 'Chăm chân tiểu đường',
      def: 'Giảm cảm giác bàn chân → soi chân hàng tuần, vết xước chăm sớm, giày vừa — không chờ tới khi đau.',
    },
  ],
  images: [],
  quiz: [
    {
      q: 'Vì sao kháng lực là "thuốc thật" cho tiểu đường type 2?',
      choices: [
        'Vì đốt nhiều calo',
        'Cơ là bể chứa glucose lớn nhất — cơ mạnh hút đường máu KHÔNG cần insulin thêm, hiệu ứng 24–48h',
        'Vì làm đẹp',
        'Vì thay metformin được',
      ],
      answer: 1,
      explain:
        'Cơ mạnh = bể chứa lớn + nhạy insulin tăng sau mỗi buổi — 3 buổi/tuần đều đặn thắng 1 buổi dài quên hàng tháng.',
    },
    {
      q: 'Tâm đo đường huyết 4,2 mmol/L trước buổi tập. Hành động đúng?',
      choices: [
        'Tập tiếp cho "vượt qua"',
        'Ăn snack carb (chuối, bánh quy) trước khi tập — hoặc hoãn nếu quá thấp',
        'Tăng gấp đôi metformin',
        'Bỏ đo',
      ],
      answer: 1,
      explain:
        'Hạ đường huyết khi tập là tín hiệu an toàn thật: ăn trước, mang đường nhanh, và báo bác sĩ nếu lặp lại để chỉnh liều.',
    },
    {
      q: 'Vì sao carb PHÂN BỔ ĐỀU tốt hơn dồn 1 bữa lớn cho khách T2D?',
      choices: [
        'Vì ngon hơn',
        'Cùng tổng lượng nhưng đường máu phẳng hơn — không "đỉnh" spike sau bữa lớn',
        'Vì tiết kiệm tiền',
        'Không có khác biệt',
      ],
      answer: 1,
      explain:
        'Bài Special populations: phân bổ là cách "miễn phí" kiểm soát đường — không cần cắt carb hoàn toàn, chỉ trải đều.',
    },
    {
      q: 'Ba tín hiệu cần báo bác sĩ NGAY trong kế hoạch của Tâm?',
      choices: [
        'Mệt bình thường, đói sau tập, muốn ăn kem',
        'Đường huyết < 4 mmol/L khi tập, vết thương chân > 3 ngày không lành, đau ngực khi tập',
        'Không giảm cân tuần 1, da khô, thích ăn ngọt',
        'Không có tín hiệu nào',
      ],
      answer: 1,
      explain:
        'Hạ đường = thuốc thừa so với vận động mới; vết chân không lành = biến chứng thần kinh; đau ngực = tim mạch — cả ba đều cần y tế, không phải "gắng thêm".',
    },
    {
      q: 'Kỳ vọng HỢP LÝ cho HB1AC sau 12 tuần (7,8% ban đầu)?',
      choices: [
        'Xuống 5% ngay lập tức',
        'Gần 7% — giảm 0,5–1 điểm qua vận động + giảm cân là tiến bộ lớn và bền',
        'Không thay đổi gì',
        'Phải 5,5% mới tính',
      ],
      answer: 1,
      explain:
        'HB1AC là trung bình 3 tháng — 12 tuần giảm 0,5–1 điểm là chiến thắng có nghĩa về mặt y tế, và bác sĩ sẽ dựa vào đó để điều chỉnh thuốc.',
    },
  ],
  related: {
    muscles: ['quadriceps', 'gluteus-maximus', 'pectoralis-major', 'latissimus-dorsi'],
    exercises: ['leg-press', 'machine-chest-press', 'seated-cable-row', 'goblet-squat', 'hip-thrust'],
    calculators: ['bmr', 'tdee', 'calories', 'macro', 'hr-zones'],
    conditions: [],
    evidence: [],
  },
  sources: [
    {
      label: 'WHO — Guidelines on physical activity (2020, chronic conditions, URL đã kiểm chứng)',
      url: 'https://www.who.int/publications/i/item/9789240015128',
      license: 'cite-only',
    },
    {
      label: "ACSM's Guidelines — Exercise & Type 2 Diabetes (cite-only)",
      url: 'https://www.acsm.org/education-resources/books-and-multimedia-resources',
      license: 'cite-only',
    },
  ],
};
