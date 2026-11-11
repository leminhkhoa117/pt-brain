/**
 * Bệnh nền / chấn thương thường gặp và quy tắc an toàn khi lập giáo án.
 *
 * - `rules`: hướng dẫn đưa vào prompt của AI.
 * - `avoidEn`: mảnh tên tiếng Anh (Exercise.nameEn, lowercase) cần loại khỏi
 *   giáo án vì nén/gập cột sống hoặc tải lên vùng đang tổn thương.
 *
 * Danh sách cố ý ngắn và thận trọng: chỉ loại các bài có rủi ro rõ ràng,
 * phần còn lại để AI cá nhân hoá theo mục tiêu/trình độ.
 */
export const HEALTH_CONDITIONS = [
  {
    key: 'herniated_disc',
    vi: 'Thoát vị đĩa đệm',
    group: 'Cột sống',
    rules:
      'Tránh nén dọc cột sống nặng và gập/xoay cột sống có tải. Ưu tiên máy hỗ trợ, hip hinge nhẹ, core isometric (plank, dead bug), giữ cột sống trung tính; giảm 30-40% volume bài trục thân. Không tập khi đau lan xuống chân.',
    avoidEn: [
      'barbell back squat',
      'front squat',
      'conventional deadlift',
      'stiff-leg deadlift',
      'rack pull',
      'barbell row',
      't-bar row',
      'good morning',
      'cable crunch',
      'hanging leg raise',
    ],
  },
  {
    key: 'low_back_pain',
    vi: 'Đau lưng dưới',
    group: 'Cột sống',
    rules:
      'Hạn chế deadlift/row tạ đòn nặng và gập bụng có tải. Ưu tiên chest-supported row, hip thrust, leg press, core ổn định; tăng tải từ từ và dừng khi đau tăng.',
    avoidEn: [
      'conventional deadlift',
      'stiff-leg deadlift',
      'barbell row',
      't-bar row',
      'good morning',
      'cable crunch',
      'hanging leg raise',
    ],
  },
  {
    key: 'neck_pain',
    vi: 'Đau cổ / thoát vị cổ',
    group: 'Cột sống',
    rules:
      'Tránh đặt đòn tạ lên vai/cổ và ép vai quá mức. Ưu tiên máy, tạ đơn, bài tập giữ cổ trung tính; không nhún vai nặng.',
    avoidEn: ['barbell back squat', 'barbell shrug', 'overhead press'],
  },
  {
    key: 'shoulder_pain',
    vi: 'Đau vai / chấn thương vai',
    group: 'Vai',
    rules:
      'Tránh đẩy qua đầu và dip khi còn đau. Ưu tiên landmine press, máy có tựa, tay cầm trung tính (neutral grip); kiểm soát biên độ, không ép vai ra sau quá mức.',
    avoidEn: ['overhead press', 'parallel bar dips', 'arnold press'],
  },
  {
    key: 'knee_pain',
    vi: 'Đau gối / chấn thương gối',
    group: 'Gối',
    rules:
      'Giới hạn gập gối sâu và bài nhảy/tiếp đất; ưu tiên box squat, leg press biên độ an toàn, Romanian deadlift, bài hip-dominant. Tăng tải chậm, dừng khi đau > 3/10.',
    avoidEn: [],
  },
  {
    key: 'wrist_pain',
    vi: 'Đau cổ tay',
    group: 'Tay',
    rules:
      'Tránh chống tay lòng bàn tay duỗi tối đa (push-up) và đòn tạ đè cổ tay. Ưu tiên tay cầm trung tính, dumbbell/machine, wrist wrap nếu cần.',
    avoidEn: ['push-up', 'barbell bench press', 'front squat', 'ez-bar skull crusher'],
  },
  {
    key: 'hypertension',
    vi: 'Tăng huyết áp',
    group: 'Toàn thân',
    rules:
      'Tránh nín thở gắng sức (Valsalva) và set 1RM; giữ RIR 2-3, thở đều khi gắng sức, nghỉ đủ. Nếu huyết áp chưa kiểm soát, cần bác sĩ đồng ý trước khi tập nặng.',
    avoidEn: [],
  },
  {
    key: 'pregnancy',
    vi: 'Mang thai',
    group: 'Toàn thân',
    rules:
      'Tránh nằm ngửa kéo dài (sau 3 tháng đầu) và nín thở/gắng sức; giảm tải trục thân, ưu tiên máy, ghế tựa, bài nhẹ - vừa. Cần bác sĩ/bác sĩ sản khoa đồng ý trước khi tập.',
    avoidEn: ['cable crunch', 'hanging leg raise', 'conventional deadlift', 'barbell back squat'],
  },
  {
    key: 'other',
    vi: 'Khác (ghi rõ bên dưới)',
    group: 'Khác',
    rules: 'Có tình trạng sức khỏe khác do người dùng ghi rõ; hãy thận trọng và nêu rõ giới hạn trong cautions.',
    avoidEn: [],
  },
];

export const HEALTH_CONDITION_KEYS = HEALTH_CONDITIONS.map((item) => item.key);

export const HEALTH_CONDITION_MAP = Object.fromEntries(
  HEALTH_CONDITIONS.map((item) => [item.key, item]),
);

export const healthConditionLabel = (key) => HEALTH_CONDITION_MAP[key]?.vi || key;

/** Bài tập có nằm trong danh sách cần tránh với bệnh nền đã chọn không. */
export function isExerciseAvoided(nameEn = '', nameVi = '', conditionKeys = []) {
  const haystack = `${nameEn || ''} ${nameVi || ''}`.toLowerCase();
  return (conditionKeys || []).some((key) =>
    (HEALTH_CONDITION_MAP[key]?.avoidEn || []).some((fragment) => haystack.includes(fragment)),
  );
}
