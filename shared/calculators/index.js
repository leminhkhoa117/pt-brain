/**
 * Các hàm tính chỉ số tập luyện.
 * QUY TẮC: hàm thuần (pure), không phụ thuộc DB/network, ném lỗi rõ ràng khi input sai.
 * Mọi công thức ghi nguồn ngay trong comment.
 */

import {
  ACTIVITY_FACTORS,
  FAT_PER_KG,
  GOAL_CALORIE_ADJUSTMENT,
  PROTEIN_PER_KG,
} from '../config/nutrition.js';

const round = (value, digits = 1) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const isPositive = (v) => typeof v === 'number' && Number.isFinite(v) && v > 0;

export class CalcError extends Error {
  constructor(message, code = 'INVALID_INPUT') {
    super(message);
    this.name = 'CalcError';
    this.code = code;
    this.status = 400;
  }
}

function assertPositive(entries) {
  for (const [name, value] of Object.entries(entries)) {
    if (!isPositive(value)) {
      throw new CalcError(`${name} phải là số dương`);
    }
  }
}

/* ------------------------------------------------------------------ */
/* 1RM                                                                 */
/* ------------------------------------------------------------------ */

export const MAX_RELIABLE_REPS = 10;

/** Epley: 1RM = w × (1 + reps/30) */
export function epley1RM(weightKg, reps) {
  assertPositive({ weightKg });
  if (!Number.isFinite(reps) || reps < 1 || reps > 30) {
    throw new CalcError('reps phải nằm trong khoảng 1-30');
  }
  return weightKg * (1 + reps / 30);
}

/** Brzycki: 1RM = w × 36 / (37 - reps). Chỉ hợp lệ khi reps < 37. */
export function brzycki1RM(weightKg, reps) {
  assertPositive({ weightKg });
  if (!Number.isFinite(reps) || reps < 1 || reps > 30) {
    throw new CalcError('reps phải nằm trong khoảng 1-30');
  }
  return (weightKg * 36) / (37 - reps);
}

/**
 * Ước tính 1RM từ một set.
 * Trả về cả hai công thức + trung bình. Cảnh báo độ chính xác giảm khi reps > 10.
 */
export function estimateOneRepMax({ weightKg, reps }) {
  const epley = epley1RM(weightKg, reps);
  const brzycki = brzycki1RM(weightKg, reps);
  const reliable = reps <= MAX_RELIABLE_REPS;
  return {
    epley: round(epley),
    brzycki: round(brzycki),
    average: round((epley + brzycki) / 2),
    reliable,
    warning: reliable
      ? null
      : 'Số rep > 10 nên 1RM ước tính kém chính xác, chỉ dùng để tham khảo.',
  };
}

/** Bảng %1RM: từ 50% đến 100%, bước 5%, kèm số rep & RIR gợi ý (bảng kinh điển). */
const PERCENT_TABLE = [
  { percent: 100, reps: 1, rir: 0 },
  { percent: 95, reps: 2, rir: 0 },
  { percent: 90, reps: 4, rir: 1 },
  { percent: 85, reps: 6, rir: 1 },
  { percent: 80, reps: 8, rir: 2 },
  { percent: 75, reps: 10, rir: 2 },
  { percent: 70, reps: 12, rir: 3 },
  { percent: 65, reps: 15, rir: 3 },
  { percent: 60, reps: 18, rir: 4 },
  { percent: 55, reps: 20, rir: 4 },
  { percent: 50, reps: 25, rir: 5 },
];

export function percent1RMTable(oneRepMaxKg) {
  assertPositive({ oneRepMaxKg });
  return PERCENT_TABLE.map((row) => ({
    ...row,
    weightKg: round((oneRepMaxKg * row.percent) / 100),
  }));
}

/* ------------------------------------------------------------------ */
/* Năng lượng                                                          */
/* ------------------------------------------------------------------ */

/**
 * BMR - Mifflin-St Jeor:
 * nam: 10W + 6.25H - 5A + 5
 * nữ : 10W + 6.25H - 5A - 161   (W kg, H cm, A tuổi)
 */
export function bmrMifflinStJeor({ sex, weightKg, heightCm, age }) {
  if (sex !== 'male' && sex !== 'female') {
    throw new CalcError('sex phải là "male" hoặc "female"');
  }
  assertPositive({ weightKg, heightCm });
  if (!Number.isFinite(age) || age < 14 || age > 100) {
    throw new CalcError('age phải nằm trong khoảng 14-100');
  }
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return round(base + (sex === 'male' ? 5 : -161), 0);
}

export function tdeeFromBmr(bmr, activityLevel) {
  assertPositive({ bmr });
  if (!(activityLevel in ACTIVITY_FACTORS)) {
    throw new CalcError(`activityLevel không hợp lệ: ${activityLevel}`);
  }
  return round(bmr * ACTIVITY_FACTORS[activityLevel], 0);
}

/** Mục tiêu calo theo mục tiêu. Trả về khoảng + giá trị gợi ý (giữa khoảng). */
export function calorieTarget(tdee, goal) {
  assertPositive({ tdee });
  const adjustment = GOAL_CALORIE_ADJUSTMENT[goal];
  if (!adjustment) throw new CalcError(`goal không hợp lệ: ${goal}`);
  const [low, high] = adjustment;
  return {
    goal,
    min: Math.round(tdee * (1 + low)),
    max: Math.round(tdee * (1 + high)),
    recommended: Math.round(tdee * (1 + (low + high) / 2)),
  };
}

/**
 * Macro: protein & fat theo g/kg, phần calo còn lại chia cho carb (4 kcal/g).
 * Trả về null cho carb nếu calo không đủ cho protein + fat tối thiểu.
 */
export function macroSplit({
  weightKg,
  calories,
  proteinPerKg = PROTEIN_PER_KG.default,
  fatPerKg = FAT_PER_KG.default,
}) {
  assertPositive({ weightKg, calories });
  if (proteinPerKg < 0.5 || proteinPerKg > 4) {
    throw new CalcError('proteinPerKg phải trong khoảng 0.5-4');
  }
  if (fatPerKg < 0.2 || fatPerKg > 2) {
    throw new CalcError('fatPerKg phải trong khoảng 0.2-2');
  }
  const proteinG = round(proteinPerKg * weightKg, 0);
  const fatG = round(fatPerKg * weightKg, 0);
  const remaining = calories - proteinG * 4 - fatG * 9;
  const carbG = remaining > 0 ? round(remaining / 4, 0) : 0;
  return {
    proteinG,
    fatG,
    carbG,
    caloriesFromMacros: round(proteinG * 4 + fatG * 9 + carbG * 4, 0),
    feasible: remaining > 0,
    note: remaining > 0 ? null : 'Calo quá thấp so với protein + chất béo tối thiểu, hãy tăng calo.',
  };
}

/* ------------------------------------------------------------------ */
/* Thành phần cơ thể                                                   */
/* ------------------------------------------------------------------ */

/**
 * % mỡ cơ thể - US Navy (đơn vị cm):
 * Nam: 495 / (1.0324 - 0.19077·log10(eo - cổ) + 0.15456·log10(cao)) - 450
 * Nữ : 495 / (1.29579 - 0.35004·log10(eo + mông - cổ) + 0.22100·log10(cao)) - 450
 */
export function navyBodyFat({ sex, heightCm, neckCm, waistCm, hipCm }) {
  if (sex !== 'male' && sex !== 'female') {
    throw new CalcError('sex phải là "male" hoặc "female"');
  }
  assertPositive({ heightCm, neckCm, waistCm });
  let inner;
  if (sex === 'male') {
    if (waistCm <= neckCm) throw new CalcError('Vòng bụng phải lớn hơn vòng cổ');
    inner = 1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm);
  } else {
    if (!isPositive(hipCm)) throw new CalcError('Nữ cần nhập vòng mông (hipCm)');
    if (waistCm + hipCm <= neckCm) throw new CalcError('Vòng bụng + mông phải lớn hơn vòng cổ');
    inner =
      1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.221 * Math.log10(heightCm);
  }
  const result = 495 / inner - 450;
  if (!Number.isFinite(result) || result <= 0 || result > 70) {
    throw new CalcError('Số đo không hợp lý, không tính được % mỡ');
  }
  return round(result);
}

/** Khối lượng nạc: LBM = cân nặng × (1 − %mỡ/100) */
export function leanBodyMass(weightKg, bodyFatPct) {
  assertPositive({ weightKg });
  if (!Number.isFinite(bodyFatPct) || bodyFatPct <= 0 || bodyFatPct >= 70) {
    throw new CalcError('bodyFatPct phải trong khoảng 0-70');
  }
  return round(weightKg * (1 - bodyFatPct / 100));
}

/** FFMI = LBM / cao(m)² ; FFMI chuẩn hóa = FFMI + 6.1 × (1.8 − cao(m)) */
export function ffmi(lbmKg, heightCm) {
  assertPositive({ lbmKg, heightCm });
  const heightM = heightCm / 100;
  const raw = lbmKg / heightM ** 2;
  return {
    ffmi: round(raw),
    normalized: round(raw + 6.1 * (1.8 - heightM)),
  };
}

/** BMI = kg / m². Lưu ý: không phân biệt cơ và mỡ. */
export function bmi(weightKg, heightCm) {
  assertPositive({ weightKg, heightCm });
  const value = weightKg / (heightCm / 100) ** 2;
  let category = 'Bình thường';
  if (value < 18.5) category = 'Thiếu cân';
  else if (value >= 25 && value < 30) category = 'Thừa cân';
  else if (value >= 30) category = 'Béo phì';
  return { bmi: round(value), category };
}

/** Gói tính toán thành phần cơ thể từ số đo (dùng cho BodyLog.computed). */
export function bodyComposition({ sex, heightCm, weightKg, neckCm, waistCm, hipCm }) {
  const result = { bmi: bmi(weightKg, heightCm).bmi };
  if (isPositive(neckCm) && isPositive(waistCm) && (sex === 'male' || isPositive(hipCm))) {
    try {
      const bodyFatNavy = navyBodyFat({ sex, heightCm, neckCm, waistCm, hipCm });
      const lbm = leanBodyMass(weightKg, bodyFatNavy);
      result.bodyFatNavy = bodyFatNavy;
      result.leanMassKg = lbm;
      Object.assign(result, ffmi(lbm, heightCm));
    } catch {
      // Số đo chưa đủ/không hợp lý -> bỏ qua phần % mỡ, vẫn giữ BMI
    }
  }
  return result;
}

/* ------------------------------------------------------------------ */
/* Nhịp tim                                                            */
/* ------------------------------------------------------------------ */

const HR_ZONES = [
  { zone: 1, name: 'Rất nhẹ', minPct: 50, maxPct: 60 },
  { zone: 2, name: 'Nhẹ', minPct: 60, maxPct: 70 },
  { zone: 3, name: 'Vừa', minPct: 70, maxPct: 80 },
  { zone: 4, name: 'Nặng', minPct: 80, maxPct: 90 },
  { zone: 5, name: 'Tối đa', minPct: 90, maxPct: 100 },
];

/**
 * Nhịp tim tối đa: Tanaka 208 − 0.7 × tuổi (hoặc nhập tay).
 * Nếu có nhịp tim nghỉ: dùng Karvonen (HRR = max − rest).
 */
export function hrZones({ age, maxHr, restingHr }) {
  let max = maxHr;
  if (!isPositive(max)) {
    if (!Number.isFinite(age) || age < 14 || age > 100) {
      throw new CalcError('Cần age (14-100) hoặc maxHr');
    }
    max = 208 - 0.7 * age;
  }
  if (restingHr != null && !isPositive(restingHr)) {
    throw new CalcError('restingHr phải là số dương');
  }
  if (restingHr && restingHr >= max) {
    throw new CalcError('Nhịp tim nghỉ phải nhỏ hơn nhịp tim tối đa');
  }
  const useKarvonen = Boolean(restingHr);
  const zones = HR_ZONES.map((z) => {
    const calc = (pct) =>
      useKarvonen
        ? Math.round((max - restingHr) * (pct / 100) + restingHr)
        : Math.round((max * pct) / 100);
    return {
      zone: z.zone,
      name: z.name,
      percent: `${z.minPct}-${z.maxPct}%`,
      minBpm: calc(z.minPct),
      maxBpm: calc(z.maxPct),
    };
  });
  return {
    maxHr: Math.round(max),
    method: useKarvonen ? 'Karvonen' : 'Phần trăm nhịp tim tối đa',
    formula: maxHr ? 'Nhập tay' : 'Tanaka',
    restingHr: restingHr ?? null,
    zones,
  };
}

/* ------------------------------------------------------------------ */
/* Khối lượng tập (volume / tonnage)                                   */
/* ------------------------------------------------------------------ */

/** Tonnage = tổng (weight × reps) của các set. */
export function tonnage(sets = []) {
  if (!Array.isArray(sets)) throw new CalcError('sets phải là mảng');
  return round(
    sets.reduce((sum, s) => {
      const w = Number(s.weightKg) || 0;
      const r = Number(s.reps) || 0;
      if (w < 0 || r < 0) throw new CalcError('weightKg và reps không được âm');
      return sum + w * r;
    }, 0),
    0,
  );
}

/** Số set làm việc theo từng nhóm cơ. */
export function setsByMuscle(sets = []) {
  if (!Array.isArray(sets)) throw new CalcError('sets phải là mảng');
  const map = {};
  for (const s of sets) {
    if (!s.muscleGroup) continue;
    map[s.muscleGroup] = (map[s.muscleGroup] || 0) + 1;
  }
  return map;
}

/** Gộp volume nhiều buổi tập theo nhóm cơ. */
export function volumeByMuscle(sessions = []) {
  const total = {};
  for (const session of sessions) {
    const map = session.setsByMuscle || setsByMuscle(session.sets || []);
    for (const [muscle, count] of Object.entries(map)) {
      total[muscle] = (total[muscle] || 0) + count;
    }
  }
  return total;
}

/** So volume tuần với khoảng khuyến nghị, trả về trạng thái từng nhóm cơ. */
export function volumeStatus(volume, target = { min: 10, max: 20 }) {
  return Object.entries(volume).map(([muscle, sets]) => ({
    muscle,
    sets,
    status: sets < target.min ? 'low' : sets > target.max ? 'high' : 'ok',
  }));
}

/* ------------------------------------------------------------------ */
/* Xu hướng cân nặng                                                   */
/* ------------------------------------------------------------------ */

/** Trung bình trượt 7 điểm (tối đa 7 ngày gần nhất) cho từng log. */
export function movingAverage7(logs = []) {
  if (!Array.isArray(logs)) throw new CalcError('logs phải là mảng');
  const sorted = [...logs]
    .filter((l) => Number.isFinite(Number(l.weightKg)))
    .sort((a, b) => String(a.dateKey).localeCompare(String(b.dateKey)));
  return sorted.map((log, index) => {
    const window = sorted.slice(Math.max(0, index - 6), index + 1);
    const average = window.reduce((s, l) => s + Number(l.weightKg), 0) / window.length;
    return { dateKey: log.dateKey, weightKg: Number(log.weightKg), ma7: round(average, 2) };
  });
}

/**
 * Tốc độ đổi cân (%/tuần): so trung bình 7 ngày gần nhất với 7 ngày trước đó.
 * Cần tối thiểu 10 ngày dữ liệu mới trả về số (nếu không -> null).
 */
export function weeklyWeightRate(logs = []) {
  if (!Array.isArray(logs) || logs.length < 2) return null;
  const sorted = [...logs]
    .filter((l) => Number.isFinite(Number(l.weightKg)))
    .sort((a, b) => String(a.dateKey).localeCompare(String(b.dateKey)));
  const lastDate = new Date(`${sorted.at(-1).dateKey}T00:00:00Z`);
  const recent = sorted.filter((l) => {
    const d = new Date(`${l.dateKey}T00:00:00Z`);
    return (lastDate - d) / 86400000 <= 6;
  });
  const previous = sorted.filter((l) => {
    const diff = (lastDate - new Date(`${l.dateKey}T00:00:00Z`)) / 86400000;
    return diff >= 7 && diff <= 13;
  });
  if (!recent.length || !previous.length) return null;
  const avg = (arr) => arr.reduce((s, l) => s + Number(l.weightKg), 0) / arr.length;
  const recentAvg = avg(recent);
  const previousAvg = avg(previous);
  if (!previousAvg) return null;
  return {
    recentAvg: round(recentAvg, 2),
    previousAvg: round(previousAvg, 2),
    weeklyRatePct: round(((recentAvg - previousAvg) / previousAvg) * 100, 2),
    weeklyRateKg: round(recentAvg - previousAvg, 2),
  };
}
