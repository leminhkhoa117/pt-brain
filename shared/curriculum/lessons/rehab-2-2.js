/**
 * Đau cổ & thoát vị đĩa đệm cổ (cervical disc).
 *
 * Nguồn: health condition `neck_pain` của PT Brain, OpenStax (cite-only),
 * ACSM Guidelines (cite-only), bài Cột sống & PEACE&LOVE của app.
 */
export default {
  slug: 'rehab-2-2',
  module: 'rehab',
  chapter: 2,
  chapterTitle: 'Cột sống — lưng & cổ',
  order: 2,
  title: 'Đau cổ và thoát vị đĩa đệm cổ: khách "làm laptop" phổ biến nhất',
  subtitle:
    'Đau lan xuống vai, tê ngón tay, gập cứng buổi sáng — thoát vị cổ khác lưng ở chỗ triệu chứng đi theo TAY, và nghề nghiệp thường là thủ phạm.',
  minutes: 12,
  objectives: [
    'Nhận diện dấu hiệu thoát vị đĩa đệm cổ: đau lan một bên vai/tay, tê ngón tay theo rễ thần kinh.',
    'Áp quy tắc neck_pain của app: tránh đòn tạ đè vai/cổ và ép vai quá mức, giữ cổ trung tính.',
    'Dựng thang rèn lại sức chịu tải cổ: isometric → ROM chủ động → kéo/đẩy nhẹ → đầy đủ.',
    'Điều chỉnh tư thế làm việc laptop là 50% đơn thuốc — đây là bài "văn phòng" đúng nghĩa.',
  ],
  sections: [
    {
      heading: 'Vì sao cổ khác lưng: triệu chứng đi theo TAY',
      body: `Cột sống cổ (C1–C7) có 8 cặp rễ thần kinh chi phối **vai, tay, ngón tay**. Khi đĩa đệm cổ thoát vị (thường ở C5-C6 hoặc C6-C7), nó đè rễ thần kinh và triệu chứng **không dừng ở cổ** — lan xuống theo "bản đồ" của rễ đó:

| Rễ bị đè | Đau/tê chạy tới | Yếu thường thấy |
| --- | --- | --- |
| C5 | Vai ngoài, xuống mặt trước cánh tay | Nhấc vai sang ngang |
| C6 | Cánh tay trước, ngón cái + trỏ | Gấp khuỷu, sấp ngửa |
| C7 | Mặt sau cánh tay, ngón giữa | Duỗi khuỷu, nắm tay |

**Điểm phân biệt với đau cơ cổ thông thường**: đau cơ căng (tension) thường hai bên, không tê, tăng khi stress. Thoát vị cổ thường **một bên**, có tê/ngứa chạy xuống tay theo một "dải" rõ ràng, có thể yếu cầm nắm.

Khách "làm laptop 8 tiếng" là archetype kinh điển: đầu nhô tới trước 15° = tải lên cổ tăng ~12 kg so với tư thế trung tính — ngày này qua ngày khác, đĩa sau cổ chịu một lực nén kéo dài mà nó không được thiết kế để gánh.`,
    },
    {
      heading: 'Quy tắc an toàn của app cho neck_pain',
      body: `Điều kiện "Đau cổ / thoát vị cổ" trong PT Brain đã mã hoá quy tắc AI dùng khi lập giáo án:

- **Tránh**: đòn tạ đặt lên vai/cổ (barbell back squat với thanh đè C7), nhún vai nặng, overhead press với thanh đòn khi cổ đang đau cấp.
- **Giữ**: máy có tựa, dumbbell neutral grip, bài kéo ngồi/đứng giữ cổ trung tính.
- **Dừng tăng tải**: đau tăng hoặc tê tay tiến triển.

Ba thay đổi lớn nhất cho khách văn phòng đang đau cổ:

1. **Đổi thanh đòn → dumbbell/máy** cho upper body (barbell trên vai = tải trực tiếp lên đốt C7).
2. **Overhead press → landmine press** giai đoạn đầu (hướng đẩy xiên, cổ không phải ngửa tối đa).
3. **Coremỗi buổi** vẫn giữ nguyên — cổ yếu nhưng thân không nên yếu theo.`,
    },
    {
      heading: 'Thang rèn lại sức chịu tải cổ',
      body: `Áp khung criteria-based (bài Tiến trình phục hồi) cho vùng cổ:

| Bước | Bài | Cửa bước tiếp |
| --- | --- | --- |
| 1 | **Isometric cổ**: đẩy nhẹ vào tay theo 6 hướng (trước/sau/trái/phải/nghiêng) × 5 giây × 5, không đau vượt 3/10 | 2 buổi sạch |
| 2 | **ROM chủ động**: chin tuck 10 × 2, xoay cổ chậm từng bên 10 × 2, nghiêng bên 10 × 2 | Form ổn, đau ≤ 2 |
| 3 | **Kéo/đẩy nhẹ với cổ trung tính**: seated cable row, face pull (bài Vai) — tăng dần | 24h sạch |
| 4 | **Đẩy overhead tiến dần**: landmine → dumbbell neutral → đầy đủ (nếu cần) | 2 buổi mỗi nấc |

**Chin tuck** là bài vàng cho khách văn phòng: kéo đầu về sau (làm "cằm kép") giữ 5 giây — nó đảo ngược đúng tư thế "đầu nhô tới trước" gây ra vấn đề ban đầu. 10 rep × 3 lần/ngày tại bàn làm việc.`,
    },
    {
      heading: '50% đơn thuốc nằm ngoài phòng gym',
      body: `Với khách đau cổ văn phòng, **tư thế làm việc là "tải thật" lớn hơn bất kỳ buổi tập nào**:

- **Màn hình ngang mắt**: laptop trên bàn + màn hình ngoài — laptop dưới bàn là đầu nhô 45°, tải cổ gấp 3 lần.
- **Giờ 45/15**: mỗi 45 phút làm việc → 60 giây đứng lên, chin tuck, xoay vai. Bộ hẹn giờ điện thoại.
- **Điện thoại ngang mắt**: cầm điện thoại thấp = đầu cúi 60° = ~27 kg tải lên cổ.
- **Đâu nâng?**: Túi xách một bên vai hàng ngày là tải lệch chronic — cân bằng hai bên hoặc đổi balo.

Nếu khách tập 3 buổi/tuần hoàn hảo nhưng 45 giờ/tuần đầu nhô tới trước thì bài gym chỉ là 6% tổng tải — chỉnh workstation trước, tập sau.`,
    },
  ],
  applyBox: `**Gian tập thực hành — 10 phút cổ cho khách văn phòng:**
1. Chin tuck 3 × 10 (giữ 5 giây mỗi rep — làm được tại bàn làm việc).
2. Isometric cổ 6 hướng × 5 giây × 5.
3. Face pull 3 × 15 (dùng cho cả cổ lẫn vai sau).
4. Sau buổi: 2 phút xoay cổ chậm + vai, thở 360° (bài Cơ hô hấp).
5. Checklist workstation: màn hình ngang mắt? giờ 45/15? điện thoại nâng?`,
  safetyBox:
    'Đau cổ kèm: tê yếu tiến triển cả hai tay, khó đi (dáng loạng choạng), rối loạn tiêu tiểu — chuyển hướng bác sĩ NGAY (bài Red flags). Thoát vị cổ chèn tủy khác thoát vị chèn rễ — cần đánh giá y tế.',
  terms: [
    {
      en: 'Cervical radiculopathy',
      vi: 'Bệnh rễ cổ',
      def: 'Rễ thần kinh cổ bị đè (thường do thoát vị đĩa) → đau/tê/yếu chạy xuống theo bản đồ rễ tới vai-tay-ngón.',
    },
    {
      en: 'Chin tuck',
      vi: 'Kéo cằm về sau',
      def: 'Bài đảo ngược "đầu nhô tới trước": kéo cằm thẳng về sau tạo cằm kép, giữ 5 giây — vàng cho khách văn phòng.',
    },
    {
      en: 'Forward head posture',
      vi: 'Tư thế đầu nhô trước',
      def: 'Đầu lệch 15° trước = tải cổ tăng ~12 kg; 45° = ~27 kg — "tải thật" lớn hơn mọi buổi gym.',
    },
    {
      en: 'C5–C7 nerve roots',
      vi: 'Rễ thần kinh C5–C7',
      def: 'Ba rễ hay bị đè nhất: C5 (vai), C6 (ngón cái-trỏ), C7 (ngón giữa) — mỗi rễ có "bản đồ tay" riêng.',
    },
    {
      en: 'Ergonomic load',
      vi: 'Tải công thái học',
      def: 'Tổng tải cổ từ màn hình, điện thoại, túi xách — thường lớn hơn tải gym nhiều lần; chỉnh trước khi tập.',
    },
  ],
  images: [],
  quiz: [
    {
      q: 'Điểm phân biệt CHÍNH giữa thoát vị đĩa đệm cổ và đau cơ cổ căng thông thường?',
      choices: [
        'Thoát vị cổ đau hai bên đối xứng',
        'Thoát vị cổ thường một bên, có tê/ngứa chạy xuống THEO RỄ tới vai-tay-ngón; đau cơ căng không tê',
        'Đau cơ căng luôn có sốt',
        'Không phân biệt được',
      ],
      answer: 1,
      explain:
        'Rễ thần kinh bị đè chiếu theo "bản đồ" cụ thể (C5→vai, C6→ngón cái, C7→ngón giữa) — tê theo dải rõ ràng là dấu hiệu rễ, không phải cơ.',
    },
    {
      q: 'Vì sao barbell back squat bị loại cho khách đau cổ?',
      choices: [
        'Chỉ vì tạ nặng',
        'Thanh đòn đè trực tiếp lên đốt C7 và cơ cổ — tải nén kéo dài trên vùng đang tổn thương',
        'Vì squat làm to chân',
        'Vì thiếu máy',
      ],
      answer: 1,
      explain:
        'Đòn tạ trên vai = lực nén trực tiếp lên cột sống cổ — đúng điều kiện neck_pain của app loại ra khi khai báo.',
    },
    {
      q: 'Bài chin tuck (kéo cằm về sau) có vai trò gì đặc biệt cho khách laptop?',
      choices: [
        'Làm đẹp da mặt',
        'Đảo ngược đúng tư thế "đầu nhô trước" gây ra vấn đề — bài duy nhất làm được tại bàn làm việc',
        'Giảm cân',
        'Thay thế overhead press',
      ],
      answer: 1,
      explain:
        'Chin tuck kéo đầu về đúng trục trên vai — nó "chữa" đúng tư thế gây vấn đề, làm được 10 rep × 3 lần/ngày không cần thiết bị.',
    },
    {
      q: 'Với khách laptop 8 tiếng/ngày, "tải thật" lớn nhất lên cổ là gì?',
      choices: [
        '3 buổi gym mỗi tuần',
        '45 giờ/tuần đầu nhô tới trước màn hình thấp — chiếm >90% tổng tải lên cổ',
        'Túi xách nhẹ',
        'Giấc ngủ',
      ],
      answer: 1,
      explain:
        'Bài gym hoàn hảo 3 tiếng/tuần không thắng được 45 giờ/tuần sai tư thế — chỉnh workstation trước là 50% đơn thuốc.',
    },
    {
      q: 'Red flag của thoát vị CỔ khác thoát vị LƯNG ở chỗ nào?',
      choices: [
        'Không khác gì',
        'Cổ chèn tủy (không chỉ rễ): tê yếu HAI tay, khó đi loạng choạng, rối loạn tiêu tiểu — cấp cứu tủy sống',
        'Cổ chỉ đau nhẹ',
        'Lưng nguy hiểm hơn cổ',
      ],
      answer: 1,
      explain:
        'Thoát vị cổ chèn tủy (myelopathy) nguy hiểm hơn chèn rễ — hai tay cùng yếu + dáng đi thay đổi là tín hiệu cần khám gấp, không "tập thêm xem sao".',
    },
  ],
  related: {
    muscles: ['trapezius', 'levator-scapulae', 'erector-spinae', 'deltoid'],
    exercises: ['face-pull', 'landmine-press', 'seated-cable-row', 'dumbbell-shoulder-press'],
    calculators: [],
    conditions: ['neck_pain', 'shoulder_pain'],
    evidence: [],
  },
  sources: [
    {
      label: 'OpenStax Anatomy & Physiology — The cervical spine (cite-only)',
      url: 'https://openstax.org/books/anatomy-and-physiology/pages/7-3-the-vertebral-column',
      license: 'CC BY-NC-SA 4.0 (cite-only)',
    },
    {
      label: "ACSM's Guidelines — Exercise with cervical spine conditions (cite-only)",
      url: 'https://www.acsm.org/education-resources/books-and-multimedia-resources',
      license: 'cite-only',
    },
    {
      label: 'Dubois & Esculier 2020 — PEACE & LOVE (DOI đã kiểm chứng)',
      url: 'https://doi.org/10.1136/bjsports-2019-101253',
      license: 'cite-only',
    },
  ],
};
