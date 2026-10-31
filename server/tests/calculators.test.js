import { describe, it, expect } from 'vitest';
import {
  bmi,
  bmrMifflinStJeor,
  bodyComposition,
  brzycki1RM,
  calorieTarget,
  epley1RM,
  estimateOneRepMax,
  ffmi,
  hrZones,
  leanBodyMass,
  macroSplit,
  movingAverage7,
  navyBodyFat,
  percent1RMTable,
  setsByMuscle,
  tdeeFromBmr,
  tonnage,
  volumeByMuscle,
  volumeStatus,
  weeklyWeightRate,
} from '../../shared/calculators/index.js';

const logsFromWeights = (weights, start = '2026-01-01') =>
  weights.map((weightKg, i) => {
    const d = new Date(`${start}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + i);
    return { dateKey: d.toISOString().slice(0, 10), weightKg };
  });

describe('1RM', () => {
  it('Epley: 100kg x 5 = 116.7', () => {
    expect(epley1RM(100, 5)).toBeCloseTo(116.67, 2);
  });

  it('Brzycki: 100kg x 5 = 112.5', () => {
    expect(brzycki1RM(100, 5)).toBeCloseTo(112.5, 2);
  });

  it('1 rep: Brzycki trả về đúng mức tạ', () => {
    expect(brzycki1RM(100, 1)).toBeCloseTo(100, 5);
  });

  it('trả về 2 công thức + trung bình và cảnh báo khi reps > 10', () => {
    const result = estimateOneRepMax({ weightKg: 100, reps: 5 });
    expect(result.epley).toBeCloseTo(116.7, 1);
    expect(result.brzycki).toBeCloseTo(112.5, 1);
    expect(result.average).toBeCloseTo(114.6, 1);
    expect(result.reliable).toBe(true);
    expect(result.warning).toBeNull();

    const highReps = estimateOneRepMax({ weightKg: 60, reps: 15 });
    expect(highReps.reliable).toBe(false);
    expect(highReps.warning).toMatch(/kém chính xác/);
  });

  it('ném lỗi với reps = 0 hoặc tạ âm', () => {
    expect(() => estimateOneRepMax({ weightKg: 100, reps: 0 })).toThrow();
    expect(() => estimateOneRepMax({ weightKg: -5, reps: 5 })).toThrow();
    expect(() => estimateOneRepMax({ weightKg: 100, reps: 31 })).toThrow();
  });

  it('bảng %1RM có 11 dòng từ 50% đến 100%', () => {
    const table = percent1RMTable(100);
    expect(table).toHaveLength(11);
    expect(table[0]).toMatchObject({ percent: 100, weightKg: 100, reps: 1 });
    expect(table.at(-1)).toMatchObject({ percent: 50, weightKg: 50 });
    expect(table.at(-1).reps).toBeGreaterThan(table[0].reps);
  });
});

describe('BMR / TDEE / calo / macro', () => {
  it('Mifflin-St Jeor nam: 80kg, 180cm, 30 tuổi = 1780', () => {
    expect(bmrMifflinStJeor({ sex: 'male', weightKg: 80, heightCm: 180, age: 30 })).toBe(1780);
  });

  it('Mifflin-St Jeor nữ = 1614', () => {
    expect(bmrMifflinStJeor({ sex: 'female', weightKg: 80, heightCm: 180, age: 30 })).toBe(1614);
  });

  it('ném lỗi khi sex sai hoặc tuổi ngoài khoảng', () => {
    expect(() =>
      bmrMifflinStJeor({ sex: 'other', weightKg: 80, heightCm: 180, age: 30 }),
    ).toThrow();
    expect(() =>
      bmrMifflinStJeor({ sex: 'male', weightKg: 80, heightCm: 180, age: 10 }),
    ).toThrow();
  });

  it('TDEE = BMR x hệ số vận động', () => {
    expect(tdeeFromBmr(1780, 'moderate')).toBe(2759);
    expect(tdeeFromBmr(1780, 'sedentary')).toBe(2136);
    expect(() => tdeeFromBmr(1780, 'unknown')).toThrow();
  });

  it('mục tiêu calo: cut giảm 10-20%, lean bulk tăng 5-10%', () => {
    const cut = calorieTarget(2500, 'cut');
    expect(cut.min).toBe(2000);
    expect(cut.max).toBe(2250);
    expect(cut.recommended).toBe(2125);

    const leanBulk = calorieTarget(2500, 'lean_bulk');
    expect(leanBulk.min).toBe(2625);
    expect(leanBulk.max).toBe(2750);

    expect(calorieTarget(2500, 'maintain')).toMatchObject({ min: 2500, max: 2500 });
    expect(() => calorieTarget(2500, 'sai')).toThrow();
  });

  it('macro: 80kg, 2500 kcal, 1.8g protein, 0.8g fat -> 144P / 64F / 337C', () => {
    const macros = macroSplit({ weightKg: 80, calories: 2500, proteinPerKg: 1.8, fatPerKg: 0.8 });
    expect(macros.proteinG).toBe(144);
    expect(macros.fatG).toBe(64);
    expect(macros.carbG).toBe(337);
    expect(macros.feasible).toBe(true);
  });

  it('calo quá thấp: carb = 0 và có cảnh báo', () => {
    const macros = macroSplit({ weightKg: 100, calories: 700, proteinPerKg: 2.2, fatPerKg: 0.8 });
    expect(macros.carbG).toBe(0);
    expect(macros.feasible).toBe(false);
    expect(macros.note).toBeTruthy();
  });

  it('từ chối proteinPerKg ngoài khoảng', () => {
    expect(() =>
      macroSplit({ weightKg: 80, calories: 2500, proteinPerKg: 5, fatPerKg: 0.8 }),
    ).toThrow();
  });
});

describe('Thành phần cơ thể', () => {
  it('% mỡ Navy nam: 180cm, cổ 40, bụng 85 -> ~14.5%', () => {
    expect(navyBodyFat({ sex: 'male', heightCm: 180, neckCm: 40, waistCm: 85 })).toBeCloseTo(
      14.5,
      1,
    );
  });

  it('% mỡ Navy nữ: 170cm, cổ 32, bụng 70, mông 95 -> ~23.6%', () => {
    expect(
      navyBodyFat({ sex: 'female', heightCm: 170, neckCm: 32, waistCm: 70, hipCm: 95 }),
    ).toBeCloseTo(23.6, 1);
  });

  it('ném lỗi khi bụng <= cổ hoặc nữ thiếu vòng mông', () => {
    expect(() =>
      navyBodyFat({ sex: 'male', heightCm: 180, neckCm: 40, waistCm: 40 }),
    ).toThrow();
    expect(() =>
      navyBodyFat({ sex: 'female', heightCm: 170, neckCm: 32, waistCm: 70 }),
    ).toThrow();
  });

  it('LBM = cân nặng x (1 - %mỡ)', () => {
    expect(leanBodyMass(80, 20)).toBe(64);
    expect(() => leanBodyMass(80, 0)).toThrow();
    expect(() => leanBodyMass(80, 80)).toThrow();
  });

  it('FFMI và FFMI chuẩn hóa', () => {
    const at180 = ffmi(64, 180);
    expect(at180.ffmi).toBeCloseTo(19.8, 1);
    expect(at180.normalized).toBeCloseTo(19.8, 1);

    const at170 = ffmi(64, 170);
    expect(at170.ffmi).toBeCloseTo(22.1, 1);
    expect(at170.normalized).toBeGreaterThan(at170.ffmi);
  });

  it('BMI kèm phân loại', () => {
    expect(bmi(80, 180)).toEqual({ bmi: 24.7, category: 'Bình thường' });
    expect(bmi(50, 180).category).toBe('Thiếu cân');
    expect(bmi(90, 180).category).toBe('Thừa cân');
    expect(bmi(100, 180).category).toBe('Béo phì');
  });

  it('bodyComposition bỏ qua phần mỡ khi thiếu số đo', () => {
    const result = bodyComposition({
      sex: 'male',
      heightCm: 180,
      weightKg: 80,
      neckCm: undefined,
      waistCm: undefined,
    });
    expect(result.bmi).toBe(24.7);
    expect(result.bodyFatNavy).toBeUndefined();
  });
});

describe('Nhịp tim & volume', () => {
  it('Tanaka: 30 tuổi -> max 187, 5 vùng', () => {
    const result = hrZones({ age: 30 });
    expect(result.maxHr).toBe(187);
    expect(result.zones).toHaveLength(5);
    expect(result.zones[0].minBpm).toBe(94);
    expect(result.zones.at(-1).maxBpm).toBe(187);
  });

  it('Karvonen khi có nhịp tim nghỉ', () => {
    const result = hrZones({ age: 30, restingHr: 60 });
    expect(result.method).toBe('Karvonen');
    expect(result.zones[0].minBpm).toBe(124);
  });

  it('ném lỗi khi thiếu tuổi và maxHr, hoặc restingHr >= maxHr', () => {
    expect(() => hrZones({})).toThrow();
    expect(() => hrZones({ maxHr: 180, restingHr: 180 })).toThrow();
  });

  it('tonnage = tổng weight x reps', () => {
    expect(
      tonnage([
        { weightKg: 100, reps: 5 },
        { weightKg: 80, reps: 10 },
      ]),
    ).toBe(1300);
    expect(tonnage([])).toBe(0);
    expect(() => tonnage([{ weightKg: -1, reps: 5 }])).toThrow();
  });

  it('setsByMuscle & volumeByMuscle', () => {
    const sets = [
      { muscleGroup: 'chest' },
      { muscleGroup: 'chest' },
      { muscleGroup: 'back' },
    ];
    expect(setsByMuscle(sets)).toEqual({ chest: 2, back: 1 });
    expect(
      volumeByMuscle([{ sets: sets }, { sets: [{ muscleGroup: 'chest' }] }]),
    ).toEqual({ chest: 3, back: 1 });
  });

  it('volumeStatus đánh dấu low/ok/high', () => {
    const status = volumeStatus({ chest: 5, back: 15, legs: 25 });
    expect(status.find((s) => s.muscle === 'chest').status).toBe('low');
    expect(status.find((s) => s.muscle === 'back').status).toBe('ok');
    expect(status.find((s) => s.muscle === 'legs').status).toBe('high');
  });
});

describe('Xu hướng cân nặng', () => {
  it('MA7 = trung bình 7 ngày gần nhất', () => {
    const logs = logsFromWeights([80, 81, 82, 83, 84, 85, 86]);
    const result = movingAverage7(logs);
    expect(result).toHaveLength(7);
    expect(result[0].ma7).toBe(80);
    expect(result.at(-1).ma7).toBe(83);
  });

  it('MA7 dùng trung bình cộng dồn khi chưa đủ 7 ngày', () => {
    const result = movingAverage7(logsFromWeights([80, 82]));
    expect(result[1].ma7).toBe(81);
  });

  it('tốc độ đổi cân %/tuần từ 2 tuần dữ liệu', () => {
    const logs = logsFromWeights([...Array(7).fill(80), ...Array(7).fill(82)]);
    const rate = weeklyWeightRate(logs);
    expect(rate.weeklyRatePct).toBeCloseTo(2.5, 1);
    expect(rate.weeklyRateKg).toBe(2);
  });

  it('trả về null khi chưa đủ dữ liệu', () => {
    expect(weeklyWeightRate([])).toBeNull();
    expect(weeklyWeightRate(logsFromWeights([80]))).toBeNull();
  });
});
