import { describe, it, expect } from 'vitest';
import { computeMealPlanAdherence, mealPlanWeekWindows } from '../../shared/nutrition/mealPlan.js';

function makeCycle(calories = 2000, proteinG = 150) {
  return Array.from({ length: 7 }, (_, index) => ({
    label: `Ngày ${index + 1}`,
    meals: [
      {
        type: 'lunch',
        name: 'Bữa trưa',
        foods: [{ name: 'Cơm gà', calories, proteinG, carbsG: 200, fatG: 60 }],
        totals: { calories, proteinG, carbsG: 200, fatG: 60 },
      },
    ],
    totals: { calories, proteinG, carbsG: 200, fatG: 60 },
  }));
}

function makePlan(overrides = {}) {
  return {
    startDate: '2026-01-01',
    endDate: '2026-01-28',
    cycleDays: makeCycle(),
    ...overrides,
  };
}

function mealOn(dateKey, calories = 2000, proteinG = 150, mealType = 'lunch') {
  return {
    dateKey,
    mealType,
    analysis: { totals: { calories, proteinG, carbsG: 200, fatG: 60 } },
  };
}

describe('meal plan week windows', () => {
  it('chia plan 28 ngày thành 4 tuần đủ 7 ngày', () => {
    const weeks = mealPlanWeekWindows('2026-01-01', '2026-01-28');
    expect(weeks).toHaveLength(4);
    expect(weeks[0]).toMatchObject({
      weekIndex: 0,
      start: '2026-01-01',
      end: '2026-01-07',
      days: 7,
    });
    expect(weeks[3]).toMatchObject({ start: '2026-01-22', end: '2026-01-28', days: 7 });
  });

  it('tuần cuối ngắn hơn khi thời lượng không chia hết cho 7', () => {
    const weeks = mealPlanWeekWindows('2026-01-01', '2026-01-10');
    expect(weeks).toHaveLength(2);
    expect(weeks[1]).toMatchObject({ start: '2026-01-08', end: '2026-01-10', days: 3 });
  });
});

describe('meal plan adherence', () => {
  it('đạt điểm cao khi ăn đúng plan mỗi ngày', () => {
    const plan = makePlan();
    const meals = Array.from({ length: 7 }, (_, index) => mealOn(`2026-01-0${index + 1}`));
    const result = computeMealPlanAdherence({
      plan,
      meals,
      weekStart: '2026-01-01',
      weekEnd: '2026-01-07',
      todayKey: '2026-01-07',
    });
    expect(result.loggedDays).toBe(7);
    expect(result.coveragePct).toBe(100);
    expect(result.score).toBe(100);
    expect(result.grade).toBe('Rất bám plan');
    expect(result.averages.actual).toEqual({
      calories: 2000,
      proteinG: 150,
      carbsG: 200,
      fatG: 60,
    });
  });

  it('không log bữa nào thì 0 điểm nhưng vẫn hiện thực đơn dự kiến', () => {
    const result = computeMealPlanAdherence({
      plan: makePlan(),
      meals: [],
      weekStart: '2026-01-01',
      weekEnd: '2026-01-07',
      todayKey: '2026-01-07',
    });
    expect(result.loggedDays).toBe(0);
    expect(result.missedDays).toBe(7);
    expect(result.coveragePct).toBe(0);
    expect(result.score).toBe(0);
    expect(result.averages.planned.calories).toBe(2000);
    expect(result.rows[0].actual.calories).toBe(0);
  });

  it('chỉ tính các ngày đã tới, bỏ ngày tương lai', () => {
    const result = computeMealPlanAdherence({
      plan: makePlan(),
      meals: [mealOn('2026-01-01')],
      weekStart: '2026-01-01',
      weekEnd: '2026-01-07',
      todayKey: '2026-01-03',
    });
    expect(result.countedDays).toBe(3);
    expect(result.rows).toHaveLength(3);
    expect(result.coveragePct).toBe(33);
    expect(result.score).toBe(73);
  });

  it('lệch calo nhiều bị trừ điểm calo nhưng vẫn giữ điểm protein', () => {
    const result = computeMealPlanAdherence({
      plan: makePlan(),
      meals: [mealOn('2026-01-01', 3000, 150), mealOn('2026-01-02', 3000, 150)],
      weekStart: '2026-01-01',
      weekEnd: '2026-01-07',
      todayKey: '2026-01-07',
    });
    expect(result.loggedDays).toBe(2);
    expect(result.rows[0].calorieDeltaPct).toBe(50);
    expect(result.score).toBeLessThan(100);
    expect(result.mealTypes.find((item) => item.type === 'lunch').actual.calories).toBe(3000);
  });

  it('báo lỗi khi plan thiếu chu kỳ 7 ngày', () => {
    expect(() =>
      computeMealPlanAdherence({
        plan: makePlan({ cycleDays: [] }),
        meals: [],
        weekStart: '2026-01-01',
        weekEnd: '2026-01-07',
        todayKey: '2026-01-07',
      }),
    ).toThrow('7 ngày');
  });
});
