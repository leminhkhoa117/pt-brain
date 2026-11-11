/**
 * Ước tính calo cho vận động không dùng tạ (chạy, bơi, đạp xe...).
 *
 * Công thức: kcal = MET × cân nặng (kg) × thời gian (giờ).
 * MET lấy theo bảng hoạt động thể lực thông dụng; khi có quãng đường chạy,
 * dùng pace (phút/km) để chọn MET sát hơn thay vì chỉ dựa vào cường độ.
 *
 * Đây là ước lượng để theo dõi xu hướng, không phải phép đo chính xác.
 */

export const CARDIO_INTENSITIES = ['light', 'moderate', 'vigorous'];

export const CARDIO_INTENSITY_LABELS = {
  light: 'Nhẹ',
  moderate: 'Vừa',
  vigorous: 'Mạnh',
};

export const CARDIO_ACTIVITIES = [
  {
    key: 'running',
    label: 'Chạy bộ',
    met: { light: 7, moderate: 9.8, vigorous: 12 },
    usesDistance: true,
    distanceLabel: 'Quãng đường (km)',
  },
  {
    key: 'walking',
    label: 'Đi bộ',
    met: { light: 3, moderate: 3.8, vigorous: 4.8 },
    usesDistance: true,
    distanceLabel: 'Quãng đường (km)',
  },
  {
    key: 'cycling',
    label: 'Đạp xe',
    met: { light: 4, moderate: 6.8, vigorous: 10 },
    usesDistance: true,
    distanceLabel: 'Quãng đường (km)',
  },
  {
    key: 'swimming',
    label: 'Bơi lội',
    met: { light: 5, moderate: 7, vigorous: 9.8 },
    usesDistance: true,
    distanceLabel: 'Quãng đường (km)',
  },
  {
    key: 'rowing',
    label: 'Chèo thuyền / rowing',
    met: { light: 4.5, moderate: 7, vigorous: 10 },
    usesDistance: true,
    distanceLabel: 'Quãng đường (km)',
  },
  {
    key: 'hiking',
    label: 'Đi bộ đường dài',
    met: { light: 4.5, moderate: 6, vigorous: 8 },
    usesDistance: true,
    distanceLabel: 'Quãng đường (km)',
  },
  {
    key: 'jump_rope',
    label: 'Nhảy dây',
    met: { light: 8.8, moderate: 11, vigorous: 12.3 },
    usesDistance: false,
  },
  {
    key: 'elliptical',
    label: 'Máy elliptical',
    met: { light: 4, moderate: 5, vigorous: 7 },
    usesDistance: false,
  },
  {
    key: 'yoga',
    label: 'Yoga / giãn cơ',
    met: { light: 2, moderate: 2.5, vigorous: 3.3 },
    usesDistance: false,
  },
  {
    key: 'dancing',
    label: 'Khiêu vũ / aerobic',
    met: { light: 3.5, moderate: 5, vigorous: 7 },
    usesDistance: false,
  },
  {
    key: 'other',
    label: 'Vận động khác',
    met: { light: 3.5, moderate: 5, vigorous: 7 },
    usesDistance: false,
  },
];

export const CARDIO_KEYS = CARDIO_ACTIVITIES.map((item) => item.key);

export const CARDIO_BY_KEY = Object.fromEntries(
  CARDIO_ACTIVITIES.map((item) => [item.key, item]),
);

/** MET cho chạy bộ dựa trên pace; pace càng nhanh MET càng cao. */
function runningMetFromPace(paceMinPerKm) {
  if (paceMinPerKm <= 4) return 14;
  if (paceMinPerKm <= 5) return 12.5;
  if (paceMinPerKm <= 6) return 11;
  if (paceMinPerKm <= 7) return 9.8;
  if (paceMinPerKm <= 8) return 8.3;
  return 7;
}

/**
 * @param {object} input
 * @param {string} input.activity - key trong CARDIO_ACTIVITIES
 * @param {number} input.durationMin - thời gian vận động (phút)
 * @param {number} [input.distanceKm] - quãng đường nếu có
 * @param {number} input.weightKg - cân nặng dùng để ước tính
 * @param {'light'|'moderate'|'vigorous'} [input.intensity]
 * @returns {{calories:number, met:number, paceMinPerKm:number|null, activityLabel:string}}
 */
export function estimateCardioCalories({
  activity,
  durationMin,
  distanceKm,
  weightKg,
  intensity = 'moderate',
}) {
  const item = CARDIO_BY_KEY[activity];
  if (!item) throw new Error(`Loại vận động không hợp lệ: ${activity}`);

  const minutes = Number(durationMin);
  const weight = Number(weightKg);
  if (!Number.isFinite(minutes) || minutes <= 0) {
    throw new Error('Thời gian vận động phải lớn hơn 0 phút');
  }
  if (!Number.isFinite(weight) || weight <= 0) {
    throw new Error('Cần cân nặng để ước tính calo');
  }

  const level = CARDIO_INTENSITIES.includes(intensity) ? intensity : 'moderate';
  const distance = Number(distanceKm);
  const paceMinPerKm =
    item.usesDistance && Number.isFinite(distance) && distance > 0
      ? Math.round((minutes / distance) * 10) / 10
      : null;

  const met =
    activity === 'running' && paceMinPerKm
      ? runningMetFromPace(paceMinPerKm)
      : item.met[level];

  return {
    activityLabel: item.label,
    met,
    paceMinPerKm,
    calories: Math.round(met * weight * (minutes / 60)),
  };
}
