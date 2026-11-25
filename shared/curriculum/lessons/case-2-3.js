/**
 * Ca 3: nam 46 tuổi, tăng huyết áp đang điều trị, ít vận động.
 * Ghép điều kiện `hypertension` của app (tránh Valsalva/1RM) + WHO + DASH-style.
 *
 * Nguồn (đã kiểm chứng): health condition hypertension của PT Brain,
 * WHO 2020, ACSM Guidelines (cite-only).
 */
export default {
  slug: 'case-2-3',
  module: 'case',
  chapter: 2,
  chapterTitle: 'Ca cụ thể',
  order: 3,
  title: 'Ca 3 — Nam 46 tuổi tăng huyết áp: tập thế nào cho "toa" thứ hai thật sự',
  subtitle:
    'Bệnh nền không phải dấu chấm hết — quy tắc app đã viết sẵn: không nín thở gắng sức, không set 1RM, RIR 2–3, thở đều; ăn theo hướng natri thấp.',
  minutes: 12,
  objectives: [
    'Áp đúng quy tắc hypertension của app: tránh Valsalva/set tối đa, RIR 2–3, thở đều khi gắng.',
    'Xây kế hoạch "vận động là thuốc": đi bộ nền → kháng lực máy → tăng dần theo phản ứng.',
    'Điều chỉnh ăn theo hướng huyết áp: hạ natri từ thực phẩm chế biến, mô hình đĩa nhiều rau quả.',
    'Xác định ranh giới phối hợp bác sĩ: duyệt trước khi tăng, báo thay đổi thuốc, đo huyết áp định kỳ.',
  ],
  sections: [
    {
      heading: 'Hồ sơ khách',
      body: `**Hoà, 46 tuổi, kế toán. 170 cm, 88 kg. Tăng huyết áp chẩn đoán 8 tháng, đang dùng thuốc (đã ổn định, bác sĩ duyệt "tập nhẹ-vừa được"). Ngồi cả ngày, chưa từng có thói quen vận động. Vòng bụng 102 cm. Ngủ khá. Ăn nhiều đồ chế biến sẵn/tiếp khách 3 bữa/tuần.**

**Battery (điều chỉnh cho bệnh nền):** push-up 5 (bậc nghiêng), plank 24 giây, dặm đi 15:50/HR đích 160 (nói được câu ngắn — dừng đúng quy tắc), không test 1RM.

**Mục tiêu khách nói:** "Bác sĩ bảo phải vận động. Em muốn bớt bụng, đỡ mệt leo cầu thang."

Phân tích archetype: **bệnh nền tim mạch + hoàn toàn mới** — an toàn là tầng 1 (mọi bài theo quy tắc app đã mã hoá), tiến bộ thể chất là tầng 2. Hồi bắt đầu không phải "kế hoạch đẹp" mà là **danh sách rủi ro đã gỡ**.`,
    },
    {
      heading: 'Ba quy tắc an toàn đắt giá nhất',
      body: `Điều kiện "hypertension" của PT Brain tự động nhắc khi lập giáo án — nhưng PT phải hiểu vì sao để giám sát bằng mắt:

1. **Không nín thở gắng sức (Valsalva)** — tăng áp lực lồng ngực/ổ bụng và huyết áp đột ngột (bài Vai trò của hơi thở). Thay vào đó: **thở ra khi phát lực**, hít vào pha hạ.
2. **Không set 1RM / RIR 0** — quy tắc RIR 2–3: mọi set "còn 2–3 rep trong túi".
3. **Máy có tựa trước tạ tự do nặng** — kiểm soát tốt hơn khi kỹ thuật chưa có; deadlift máy/leg press/row tựa ngực.

Kèm quy tắc vận hành: đo huyết áp buổi sáng các ngày tập (khách có máy nhà); **sáng nào ≥ 180/110 → không tập, liên hệ bác sĩ; 140–159/90–99 → chỉ tập nhẹ, tránh Valsalva/1RM và báo bác sĩ điều trị** — số này là hợp đồng với bác sĩ của Hoà, không phải ý kiến của PT.`,
    },
    {
      heading: 'Giáo án "bắt đầu từ bậc thang thấp nhất"',
      body: `Tuần 1–4 (mỗi bước nhỏ hơn kế hoạch "đẹp" nhưng Hoà sẽ còn ở lại tháng 12):

- **Đi bộ**: 10 phút sau bữa tối × 5 ngày → 20 phút vào tuần 3 (sau bữa tối còn giúp đường máu — đúng mô hình WHO).
- **2 buổi kháng lực máy** (T3/T7 buổi 30 phút): leg press nhẹ 2×12 · chest press máy 2×12 · row tựa ngực 2×12 · đạp xe 5 phút — RIR 3, thở ra khi đẩy.
- Không bài gập–xoay thân có tải; không hít sâu nín giữ.

Tuần 5–12: tăng dần theo quy tắc app (rep/tạ khi RIR ≥ 2 giữ form), thêm buổi thứ 3 khi 4 tuần liền không bỏ > 1 buổi; cardio lên 30 phút Zone 1–2 khi HR đích < 150.

**Kỳ vọng 12 tuần nói trước với khách + bác sĩ:** vòng bụng −4–6 cm, dặm đi nhanh hơn 60–90 giây, push-up 5→10 bậc nghiêng, **đo huyết áp theo dõi của bác sĩ** — mọi thay đổi thuốc là quyết định y tế.`,
    },
    {
      heading: 'Ăn theo hướng huyết áp (không "chế độ ăn kiêng")',
      body: `Hướng ăn của ca này trùng với giảm mỡ nhưng **điểm nhấn là natri và mô hình đĩa** (bài Special populations):

- **Natri xuống từ đồ chế biến**: đồ ăn nhanh, mì gói, xúc xích/hộp, nước sốt — đây là nguồn natri chính, không phải muỗng muối.
- **Đĩa kiểu DASH**: 1/2 rau-trái cây, 1/4 protein nạc, 1/4 carb toàn phần — mô hình đã có bằng chứng cho huyết áp.
- **Calo**: deficit nhẹ ~10–15% (TDEE ~2.300 → ~2.000 kcal) + protein ~1,6 g/kg (~140 g) — tốc độ chậm an toàn cho bệnh nền.
- **Rượu tiếp khách 3 bữa/tuần**: giảm còn 1 bữa + tính vào tuần — trao đổi thẳng như một mục tiêu SMART, không phải "cấm".

Mỗi thay đổi lớn (calo, lượng muối, thêm buổi 3) → **khách báo bác sĩ ở cuộc hẹn định kỳ** — bạn là người ghi số liệu để bác sĩ đọc: huyết áp sáng, số buổi, vòng bụng.`,
    },
  ],
  applyBox: `**Checklist chuyển thể cho ca "Hoà" của bạn:**
1. Khai đúng bệnh nền trong app Settings để mọi wizard/planner tự cảnh báo (rồi bạn vẫn phải giám sát bằng mắt: hơi thở, mặt đỏ, chóng mặt).
2. Ba quy tắc không thương lượng: không Valsalva, RIR 2–3, máy trước tạ tự do nặng.
3. Hợp đồng huyết áp với bác sĩ: số nào bỏ buổi, khi nào liên hệ — viết ra, không nhớ miệng.
4. Kỳ vọng 12 tuần gửi bác sĩ trước khi gửi khách — ca bệnh nền có hai khách hàng: Hoà và bác sĩ của Hoà.`,
  safetyBox:
    'Mọi ca bệnh nền đang dùng thuốc: khởi đầu và tăng tải phải có duyệt y tế; thay đổi thuốc hoặc huyết áp không ổn → tất cả kế hoạch dừng chờ điều chỉnh. Bài học là minh hoạ quy trình, không thay thế y tế.',
  terms: [
    {
      en: 'Conditioned safety layer',
      vi: 'Tầng an toàn theo bệnh nền',
      def: 'Bệnh nền là tầng 1 của kế hoạch: quy tắc app (không Valsalva/1RM, RIR 2–3, máy trước) gỡ rủi ro trước khi nói tiến bộ.',
    },
    {
      en: 'Exhale-on-effort rule',
      vi: 'Quy tắc thở ra khi phát lực',
      def: 'Thở ra khi đẩy, hít vào khi hạ — thay Valsalva cho khách huyết áp; mặt đỏ/chóng mặt = dừng set.',
    },
    {
      en: 'Staircase start',
      vi: 'Bắt đầu từ bậc thấp nhất',
      def: 'Kế hoạch nhỏ hơn kế hoạch "đẹp" (đi bộ 10′, 2 buổi máy) — khách còn ở lại tháng 12 mới là chỉ số thật.',
    },
    {
      en: 'Physician data contract',
      vi: 'Hợp đồng số liệu với bác sĩ',
      def: 'Số huyết áp bỏ buổi, báo thay đổi thuốc, kỳ vọng 12 tuần gửi bác sĩ — PT ghi số liệu để bác sĩ quyết định.',
    },
    {
      en: 'Sodium-first eating',
      vi: 'Ăn ưu tiên hạ natri',
      def: 'Điểm nhấn ăn của ca huyết áp: hạ nguồn chế biến sẵn + mô hình đĩa DASH-style; calo nhẹ nhàng ở tầng sau.',
    },
  ],
  images: [],
  quiz: [
    {
      q: 'Vì sao tạ 1RM/nín thở bị loại khỏi giáo án của Hoà?',
      choices: [
        'Vì anh ấy yếu',
        'Valsalva + set tối đa làm huyết áp nhảy đột ngột — đúng rủi ro của bệnh nền; RIR 2–3 và thở ra khi đẩy là thay thế an toàn',
        'Vì máy tốt hơn tạ mãi mãi',
        'Vì khách không muốn',
      ],
      answer: 1,
      explain:
        'Điều kiện hypertension trong app mã hoá đúng nguyên lý này; PT giám sát thêm bằng mắt: mặt đỏ, nín thở, chóng mặt là dừng set.',
    },
    {
      q: 'Sáng hôm buổi tập, Hoà đo huyết áp 165/102. Hành động đúng?',
      choices: [
        'Tập bình thường, "nóng rồi sẽ hạ"',
        'Bỏ buổi nặng hôm đó → đi bộ nhẹ; nếu lặp lại, liên hệ bác sĩ — theo hợp đồng số liệu đã chốt từ đầu',
        'Tăng gấp đôi thuốc của anh ấy',
        'Cho tập 1RM để "vượt qua cơn"',
      ],
      answer: 1,
      explain:
        'Ngưỡng bỏ buổi là hợp đồng với bác sĩ điều trị — PT không tự phán về thuốc nhưng phải tự phán về buổi hôm đó: an toàn trước.',
    },
    {
      q: 'Điểm nhấn Ăn số một của ca huyết áp này là gì?',
      choices: [
        'Ăn kiêng detox',
        'Hạ natri từ thực phẩm chế biến sẵn + mô hình đĩa nhiều rau quả (DASH-style); calo nhẹ ở tầng sau',
        'Bỏ hoàn toàn muối khỏi mọi món',
        'Chỉ ăn trái cây',
      ],
      answer: 1,
      explain:
        'Natri "ẩn" đến từ đồ hộp/đồ nhanh/nước sốt — hạ từ nguồn đó + đĩa rau quả là hai thay đổi lớn nhất theo bằng chứng huyết áp.',
    },
    {
      q: 'Vì sao kế hoạch 4 tuần đầu "nhỏ hơn kế hoạch đẹp"?',
      choices: [
        'Vì Hoà khó tính',
        'Vì adherence là chỉ số thật: đi bộ 10 phút + 2 buổi máy mà khách còn ở lại tháng 12 thắng mọi template to mà bỏ giữa chừng',
        'Vì bệnh nền cấm vận động mạnh vĩnh viễn',
        'Vì phòng gym không có máy',
      ],
      answer: 1,
      explain:
        'Vị khách hoàn toàn mới + bệnh nền cần chuỗi thành công nhỏ để xây thói quen — bậc thang thấp rồi nâng theo dữ liệu, không phải hạ chuẩn.',
    },
    {
      q: '"Ca bệnh nền có hai khách hàng" nghĩa là gì?',
      choices: [
        'PT phục vụ cả vợ Hoà',
        'Hoà và bác sĩ điều trị của Hoà — kỳ vọng, số liệu và thay đổi đều qua bác sĩ; PT ghi số liệu cho bác sĩ quyết định',
        'Phòng gym và hãng tạ',
        'Không có nghĩa gì',
      ],
      answer: 1,
      explain:
        'Phạm vi hành nghề rõ: PT hướng dẫn vận động theo bằng chứng + tổ chức số liệu; thuốc và mức an toàn là của y tế — phối hợp đúng chỗ thì khách thắng.',
    },
  ],
  related: {
    muscles: ['quadriceps', 'pectoralis-major', 'latissimus-dorsi'],
    exercises: ['leg-press', 'machine-chest-press', 'seated-cable-row', 'walking-lunge'],
    calculators: ['bmr', 'tdee', 'hr-zones'],
    conditions: ['hypertension'],
    evidence: [],
  },
  sources: [
    {
      label: 'WHO — Guidelines on physical activity and sedentary behaviour (2020, adults with chronic conditions, URL đã kiểm chứng)',
      url: 'https://www.who.int/publications/i/item/9789240015128',
      license: 'cite-only',
    },
    {
      label: "ACSM's Guidelines — Exercise with hypertension (cite-only)",
      url: 'https://www.acsm.org/education-resources/books-and-multimedia-resources',
      license: 'cite-only',
    },
  ],
};
