/**
 * Hệ số & ngưỡng dinh dưỡng/luyện tập.
 * Tất cả đều nằm ở đây (không hard-code trong code xử lý) để chỉnh một chỗ.
 * Nguồn tham khảo ghi kèm từng mục.
 */

// Hệ số vận động cho TDEE (Mifflin-St Jeor x activity factor)
export const ACTIVITY_FACTORS = {
  sedentary: 1.2, // ít vận động, làm việc văn phòng
  light: 1.375, // tập 1-3 buổi/tuần
  moderate: 1.55, // tập 3-5 buổi/tuần
  very_active: 1.725, // tập 6-7 buổi/tuần
  extra_active: 1.9, // lao động chân tay + tập nặng
};

// Điều chỉnh calo theo mục tiêu: [hệ số thấp, hệ số cao]
export const GOAL_CALORIE_ADJUSTMENT = {
  cut: [-0.2, -0.1], // TDEE - 10..20%
  maintain: [0, 0],
  lean_bulk: [0.05, 0.1], // TDEE + 5..10%
  bulk: [0.1, 0.2], // TDEE + 10..20%
};

// Protein 1.6-2.2 g/kg, chất béo tối thiểu 0.6-1 g/kg (khoảng khuyến nghị phổ biến)
export const PROTEIN_PER_KG = { min: 1.6, max: 2.2, default: 1.8 };
export const FAT_PER_KG = { min: 0.6, max: 1.0, default: 0.8 };

// Ngưỡng tốc độ đổi cân an toàn (% cân nặng / tuần, dựa trên MA7)
export const WEEKLY_RATE_LIMITS = {
  cut: { min: -1.0, max: -0.25 },
  maintain: { min: -0.5, max: 0.5 },
  lean_bulk: { min: 0.1, max: 0.5 },
  bulk: { min: 0.25, max: 1.0 },
};

// Volume khuyến nghị (set làm việc / tuần / nhóm cơ) cho người đã có nền tảng
export const MUSCLE_VOLUME_TARGET = { min: 10, max: 20 };

// Số ngày thiếu dữ liệu thì cảnh báo
export const MISSING_DATA_DAYS = 3;

// Ngưỡng protein tối thiểu (g/kg) để cảnh báo thiếu protein
export const PROTEIN_ALERT_PER_KG = 1.6;
