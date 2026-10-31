/** Quy tắc luyện tập thuần (không phụ thuộc DB/AI) — dùng chung server + test. */

export const MUSCLE_GROUPS = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'quads',
  'hamstrings',
  'glutes',
  'calves',
  'core',
];

export const MUSCLE_LABELS_VI = {
  chest: 'Ngực',
  back: 'Lưng',
  shoulders: 'Vai',
  biceps: 'Tay trước',
  triceps: 'Tay sau',
  quads: 'Đùi trước',
  hamstrings: 'Đùi sau',
  glutes: 'Mông',
  calves: 'Bắp chân',
  core: 'Core',
};

export const SPLIT_LABELS = {
  full_body: 'Full body',
  upper_lower: 'Upper / Lower',
  ppl: 'Push / Pull / Legs',
  custom: 'Tự chỉnh',
};

export function suggestSplit(daysPerWeek) {
  const days = Number(daysPerWeek) || 3;
  if (days <= 3) return 'full_body';
  if (days === 4) return 'upper_lower';
  return 'ppl';
}

export function roundToStep(value, step = 2.5) {
  return Math.round(value / step) * step;
}

/**
 * Gợi ý progressive overload theo plan:
 * - mọi set đạt cận trên rep range với RIR <= targetRir -> tăng tạ
 * - còn lại -> giữ tạ, cố tăng rep
 */
export function buildProgressionSuggestion({ lastSets = [], repMin = 8, repMax = 12, targetRir = 2 }) {
  if (!lastSets.length) {
    return {
      action: 'no_data',
      nextWeightKg: null,
      message: `Buổi đầu: chọn mức tạ có thể hoàn thành ${repMin}-${repMax} rep với RIR ${targetRir}.`,
    };
  }

  const heaviest = Math.max(...lastSets.map((s) => Number(s.weightKg) || 0));
  const allAtTop = lastSets.every((s) => Number(s.reps) >= repMax);
  const rirKnown = lastSets.every((s) => s.rir !== undefined && s.rir !== null);
  const rirOnTarget = rirKnown && lastSets.every((s) => Number(s.rir) <= targetRir);
  const workingSets = lastSets.filter((s) => Number(s.reps) > 0);

  if (allAtTop && rirOnTarget) {
    let next = roundToStep(heaviest * 1.025, 2.5);
    if (next <= heaviest) next = heaviest + 2.5;
    return {
      action: 'increase',
      nextWeightKg: Math.round(next * 10) / 10,
      deltaKg: Math.round((next - heaviest) * 10) / 10,
      message: `Tất cả set đạt ${repMax} rep với RIR ≤ ${targetRir}. Tăng lên ${Math.round(next * 10) / 10} kg ở buổi sau.`,
    };
  }

  let reason;
  if (!allAtTop) reason = `Chưa đạt ${repMax} rep ở mọi set`;
  else if (!rirKnown) reason = 'Chưa ghi RIR nên chưa thể xác nhận mức nỗ lực';
  else reason = `RIR còn cao hơn mục tiêu ${targetRir}`;

  return {
    action: 'add_reps',
    nextWeightKg: Math.round(heaviest * 10) / 10,
    deltaKg: 0,
    message: `${reason}. Giữ ${Math.round(heaviest * 10) / 10} kg và cố thêm rep (${repMin}-${repMax}) với RIR ${targetRir} trước khi tăng tạ.`,
    workingSets: workingSets.length,
  };
}

/**
 * Nhắc deload theo số tuần kể từ buổi tập đầu của chương trình.
 * Trả về null nếu chương trình không cấu hình deload.
 */
export function deloadStatus({ firstSessionDate, deloadEveryWeeks, now = new Date() }) {
  if (!deloadEveryWeeks) return null;
  if (!firstSessionDate) {
    return {
      suggested: false,
      weeks: 0,
      message: `Chương trình nhắc deload mỗi ${deloadEveryWeeks} tuần. Chưa có buổi tập nào.`,
    };
  }
  const weeks = Math.floor(
    (new Date(now).getTime() - new Date(firstSessionDate).getTime()) / (7 * 86400000),
  );
  if (weeks >= deloadEveryWeeks) {
    return {
      suggested: true,
      weeks,
      message: `Đã ${weeks} tuần tập liên tục. Cân nhắc deload 1 tuần: giảm 40-50% số set, giữ mức tạ.`,
    };
  }
  return {
    suggested: false,
    weeks,
    message: `Còn ${deloadEveryWeeks - weeks} tuần nữa đến mốc deload (mỗi ${deloadEveryWeeks} tuần).`,
  };
}

/** Cộng số set theo nhóm cơ từ các ngày của giáo án. */
export function volumeFromDays(days = []) {
  const volume = {};
  for (const day of days) {
    for (const exercise of day.exercises || []) {
      const muscle = exercise.muscleGroup;
      if (!muscle) continue;
      volume[muscle] = (volume[muscle] || 0) + (Number(exercise.sets) || 0);
    }
  }
  return volume;
}
