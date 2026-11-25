/**
 * Battery test tiêu chuẩn: đo thể chất khách bằng test trường.
 *
 * Nguồn: ACSM Guidelines (cite-only), Rockport 1-mile walk (Kline et al.
 * 1987, cite-only), YMCA/Y's Way to Physical Fitness (cite-only).
 */
export default {
  slug: 'fit-6-1',
  module: 'fit',
  chapter: 6,
  chapterTitle: 'Đánh giá thể chất',
  order: 1,
  title: 'Battery test tiêu chuẩn: đo trước, rồi mới lên giáo án',
  subtitle:
    'Bộ test trường không cần phòng lab: push-up, plank, sit-and-reach, đi bộ 1 dặm, HR recovery — chạy đúng chuẩn và biến số liệu thành mục tiêu.',
  minutes: 12,
  objectives: [
    'Chạy đúng protocol 5 test trường: push-up, plank, sit-and-reach, đi bộ 1 dặm, nhịp tim hồi phục.',
    'Giữ điều kiện test lặp lại được (giờ, mặt sàn, khởi động) để so sánh giữa các lần.',
    'Đọc kết quả theo thang tham chiếu và đặt mục tiêu 6–8 tuần cụ thể cho từng yếu tố.',
    'Biết khi nào không nên test (đau cấp, bệnh nền chưa duyệt) và khi nào cần bài thay thế.',
  ],
  sections: [
    {
      heading: 'Nguyên tắc của một battery test',
      body: `Một battery test tốt phải **an toàn, lặp lại được, và đo đúng thứ bạn muốn cải thiện**:

- **An toàn**: khách đau cấp, bệnh nền chưa được duyệt y tế (bài Health conditions của app tự cảnh báo khi lập giáo án) → đổi bài hoặc hoãn test.
- **Lặp lại được**: cùng giờ trong ngày, cùng mặt sàn, cùng quy trình khởi động 5 phút. Con số chỉ có nghĩa khi điều kiện "giống hệt" lần sau.
- **Đo đúng thứ**: muốn cải thiện sức bền cơ thì test sức bền cơ; đừng đo cân rồi tuyên bố "khách yếu hơn".

Lịch gợi ý: buổi đầu tiên (khách mới) làm 20–30 phút battery; test lại **6–8 tuần** một lần, không phải mỗi tuần — biến số thật cần thời gian vượt qua nhiễu.`,
    },
    {
      heading: 'Sức mạnh & sức bền cơ',
      body: `**Push-up test (theo chuẩn YMCA):** chống tay chuẩn — thân thẳng, ngực chạm nắm tay của bạn đặt cạnh vai khách; đếm số rep **li tục tới khi mất form** (khi hông võng hoặc không hạ đủ). Phụ nữ/chưa đủ lực: dạng modified chống bằng đầu gối — ghi rõ dạng nào để lần sau so cùng dạng.

**Plank hold:** đo thời gian giữ chuẩn (hông không võng, không nhô cao lên). Dừng khi form vỡ — thời gian form-vỡ quan trọng hơn thời gian "gồng chết".

**Sức mạnh (1RM ước lượng):** với khách đã tập: dùng bài compound an toàn (leg press, chest press máy) ấm rồi làm 1 set 5–10 rep tới gần cạn → máy tính **1RM** của app ước lượng từ số rep (Epley/Brzycki). Không test 1RM thật ở người mới.`,
    },
    {
      heading: 'Uốn dẻo và tim mạch',
      body: `**Sit-and-reach:** ngồi duỗi chân, từ từ với tay về phía bàn chân dọc thước; đo khoảng cách fingertips vượt/kém mốc bàn chân (cm). Ghi cả hai bên lệch nhau nhiều là tín hiệu cần xem thêm — chứ không phán "bị gì đó".

**Đi bộ 1 dặm (Rockport, ~1,6 km):** mặt phẳng, đi nhanh nhất có thể; ghi **thời gian** + **nhịp tim ngay lúc đích**. Máy chính thức tính VO2max ước lượng từ công thức Rockport; với PT, bảng đơn giản sau đủ dùng để xếp nhóm:

| Kết quả | Nhóm |
| --- | --- |
| Dặm < 12 phút, HR đích < 110 | Tim mạch tốt |
| 12–15 phút | Trung bình — cần cải thiện |
| > 15 phút hoặc đau ngực/chóng mặt khi đi nhanh | Bắt đầu chậm + kiểm tra y tế nếu có yếu tố nguy cơ |

**Nhịp tim hồi phục (HR recovery):** sau cữ nhanh nhất của bài đi/chạy, ngồi xuống đếm 60 giây — mức rơi từ đỉnh càng nhiều càng tốt (rơi > 20–25 bpm trong 1 phút là base tốt). Lưu lại trong app để so sánh dài hạn.`,
    },
    {
      heading: 'Thành phần cơ thể — không cần máy đắt',
      body: `Bộ đo miễn phí nhưng tin cậy về **xu hướng**:

- **Cân mỗi sáng** (cùng điều kiện, 5–7 ngày/tuần) → MA7 trong tab Theo dõi cơ thể làm mượt nhiễu.
- **Vòng bụng** ngang rốn hoặc điểm giữa xương sườn dưới–cánh chậu (chọn một, giữ nhất quán) mỗi 2 tuần; nam > 94 cm, nữ > 80 cm là ngưỡng cảnh báo sức khỏe trao đổi thường được nhắc.
- **Máy tính % mỡ Navy** của app từ vòng cổ/vòng bụng/vòng mông — sai số cá nhân ổn định nên hợp lý để theo xu hướng.
- **Ảnh tiến độ** 4 tuần/lần cùng góc, ánh sáng — cái "thước" khách tin nhất.

Ghi rõ cùng một buổi: đo buổi sáng sau vệ sinh cá nhân, trước ăn uống — mọi chỉ số body composition đều nhạy theo bữa tối hôm trước và muối.`,
    },
    {
      heading: 'Từ số liệu thành mục tiêu giáo án',
      body: `Bảng chuyển kết quả → ưu tiên:

| Test yếu nhất | Ưu tiên 6–8 tuần tới |
| --- | --- |
| Push-up thấp | Thêm 2 buổi upper body, bắt đầu từ modified |
| Plank vỡ sớm | Core anti-movement cuối mỗi buổi |
| Sit-and-reach kém | Mobility 5 phút/quan trọng mỗi buổi + chỉnh kỹ thuật theo ROM |
| Dặm chậm, HR đích cao | Zone 2 2 buổi/tuần + HIIT sau khi có base |
| HR recovery rơi ít | Giảm mật độ HIIT, thêm ngày nghỉ — base chưa đủ |
| Vòng bụng cao | Lên plan calo deficit theo module Dinh dưỡng |

Chỉ đổi **một ưu tiên chính** mỗi cycle; test lại cùng điều kiện sau 6–8 tuần; so cùng dạng test (modified với modified, plank với plank).`,
    },
  ],
  applyBox: `**Gian tập thực hành — chạy battery 25 phút chuẩn:**
1. Khởi động chung 5 phút (đi bộ + vài động tác đa khớp nhẹ).
2. Push-up test 1 phút → nghỉ 2 phút → Plank hold.
3. Nghỉ 3 phút → Sit-and-reach (2 lần lấy lần tốt hơn).
4. Đi bộ 1 dặm nhanh nhất + HR đích ngay sau đó + HR sau 60 giây.
5. Cân + vòng bụng (sáng hôm đó). Ghi cả 5 số vào Sổ tay trong tab Học tập với tag "battery" kèm ngày; đặt lịch test lại 6–8 tuần sau trong app lịch cá nhân.`,
  safetyBox:
    'Không test khi khách đang đau cấp, sốt, mới phẫu thuật, hoặc có yếu tố nguy cơ tim mạch chưa được duyệt y tế (đau/ngất khi gắng, huyết áp rất cao). Khách có bệnh nền: dùng phiên bản bài thang thấp và hỏi bác sĩ về ngưỡng an toàn trước.',
  terms: [
    {
      en: 'Field test',
      vi: 'Test trường',
      def: 'Bài đo thể chất ngoài phòng lab, cần ít dụng cụ; đổi độ chính xác lấy tính khả thi và lặp lại được.',
    },
    {
      en: 'Modified push-up',
      vi: 'Push-up chỉnh (chống gối)',
      def: 'Phiên bản hỗ trợ cho khách chưa đủ lực; chỉ so sánh kết quả cùng một phiên bản.',
    },
    {
      en: 'Rockport 1-mile walk test',
      vi: 'Test đi bộ 1 dặm Rockport',
      def: 'Đi 1,6 km nhanh nhất, ghi thời gian + HR đích để ước lượng VO2max và nhóm tim mạch.',
    },
    {
      en: 'HR recovery',
      vi: 'Nhịp tim hồi phục',
      def: 'Mức nhịp giảm sau gắng; rơi nhanh là base aerobic tốt, rơi chậm dần là tín hiệu quá tải.',
    },
    {
      en: 'Sit-and-reach',
      vi: 'Test với tay về bàn chân',
      def: 'Đo uốn dẻo lưng—khớp háng bằng khoảng cách fingertips vượt/kém mốc bàn chân (cm).',
    },
    {
      en: 'Test-retest reliability',
      vi: 'Độ tin cậy giữa các lần test',
      def: 'Điều kiện giống hệt nhau (giờ, sàn, khởi động, dạng bài) mới cho phép so sánh kết quả.',
    },
  ],
  images: [],
  quiz: [
    {
      q: 'Vì sao nên test lại mỗi 6–8 tuần thay vì mỗi tuần?',
      choices: [
        'Để khách quên cách làm bài',
        'Vì thay đổi thật cần thời gian vượt qua nhiễu ngày; test dày chỉ đo nhiễu và làm mất động lực',
        'Vì mỗi lần test tốn tiền',
        'Không có lý do cụ thể',
      ],
      answer: 1,
      explain:
        'Nhiễu nước/giấc ngủ/mood dao động hàng ngày; 6–8 tuần là khoảng tối thiểu để tiến bộ thật vượt lên nhiễu của cùng một điều kiện test.',
    },
    {
      q: 'Test push-up chuẩn cần điều kiện nào để rep được tính?',
      choices: [
        'Chỉ cần chạm sàn bằng bất kỳ cách nào',
        'Thân thẳng, ngực chạm nắm tay đặt cạnh vai, dừng khi form vỡ',
        'Mỗi 2 giây một rep bất chấp form',
        'Chống bằng đầu gối với mọi khách',
      ],
      answer: 1,
      explain:
        'Rep chỉ tính khi đủ biên độ và giữ thân thẳng; "số rep form-vỡ" mới là số có nghĩa so sánh được giữa các lần.',
    },
    {
      q: 'Test đi bộ 1 dặm cần ghi lại những con số nào?',
      choices: [
        'Chỉ thời gian',
        'Thời gian + nhịp tim ngay tại đích (từ đó ước lượng nhóm tim mạch + HR recovery)',
        'Chỉ cảm giác',
        'Số bước chân',
      ],
      answer: 1,
      explain:
        'Rockport dùng thời gian + HR đích để ước lượng VO2max; đo thêm HR sau 60 giây cho base hồi phục — hai thông tin miễn phí từ một bài test.',
    },
    {
      q: 'Khách test push-up chống gối (modified) lần đầu. Lần test lại nên thế nào?',
      choices: [
        'Ép chuyển sang chống thẳng để "thử thách"',
        'So sánh cùng dạng modified trước khi đổi; chuyển dạng chỉ khi đã đạt ngưỡng mục tiêu',
        'Bỏ luôn push-up',
        'Đổi sang sit-up',
      ],
      answer: 1,
      explain:
        'So sánh khác dạng là so "táo với cam"; đạt ngưỡng modified trước rồi nâng chuẩn — con số mới có ý nghĩa.',
    },
    {
      q: 'Vòng bụng của khách nam đo tại rốn là 102 cm. Điều này gợi ý ưu tiên gì?',
      choices: [
        'Chỉ cần tập bụng nhiều hơn',
        'Vượt ngưỡng cảnh báo sức khỏe thường nhắc (> 94 cm nam) — ưu tiên plan deficit + cardio + theo dõi MA7',
        'Không quan trọng nếu BMI thường',
        'Ngưng tập tạ',
      ],
      answer: 1,
      explain:
        'Vòng bụng là chỉ số mỡ nội tạng liên quan sức khỏe trao đổi; ưu tiên giảm mỡ qua deficit + vận động, không phải "bài tập bụng".',
    },
    {
      q: 'Yếu tố nào làm một battery test "lặp lại được"?',
      choices: [
        'Dụng cụ đắt tiền',
        'Cùng giờ, cùng mặt sàn, cùng khởi động, cùng dạng bài giữa các lần',
        'Test càng lâu càng tốt',
        'Thay bài mỗi lần cho đỡ nhàm',
      ],
      answer: 1,
      explain:
        'Muốn so sánh tiến bộ, mọi điều kiện ngoại trừ "khách tiến bộ" phải giữ nguyên — nếu không khác biệt chỉ là phương pháp đo.',
    },
  ],
  related: {
    muscles: [],
    exercises: ['plank', 'push-up', 'side-plank'],
    calculators: ['one-rm', 'navy-body-fat', 'hr-zones', 'bmi'],
    conditions: ['hypertension'],
    evidence: [],
  },
  sources: [
    {
      label: "ACSM's Guidelines for Exercise Testing and Prescription — Field tests & norms",
      url: 'https://www.acsm.org/education-resources/books-and-multimedia-resources',
      license: 'cite-only',
    },
    {
      label: 'Kline et al. 1987 — Rockport 1-mile walk test',
      url: 'https://doi.org/10.1249/00005768-198710000-00003',
      license: 'cite-only',
    },
    {
      label: 'YMCA — Y\u2019s Way to Physical Fitness (push-up protocol)',
      url: 'https://www.ymca.org/',
      license: 'cite-only',
    },
  ],
};
