import { describe, it, expect } from 'vitest';
import {
  MEAL_PLAN_MAX_DAYS,
  addDaysToKey,
  computeDailyTargets,
  cycleIndexForDate,
  daysBetweenKeys,
  mealPlanEndDate,
  mealPlanPhase,
  sumFoods,
  sumMeals,
  validateMealPlanRange,
} from '../../shared/nutrition/mealPlan.js';

describe('meal plan date range', () => {
  it('tính đúng số ngày, tính cả ngày bắt đầu và kết thúc', () => {
    expect(validateMealPlanRange('2026-01-01', '2026-01-07')).toEqual({
      startDate: '2026-01-01',
      endDate: '2026-01-07',
      durationDays: 7,
    });
    expect(validateMealPlanRange('2026-01-01', '2026-03-31').durationDays).toBe(90);
  });

  it('chặn dưới 7 ngày và trên 90 ngày', () => {
    expect(() => validateMealPlanRange('2026-01-01', '2026-01-06')).toThrow('tối thiểu');
    expect(() => validateMealPlanRange('2026-01-01', '2026-04-01')).toThrow('tối đa');
    expect(MEAL_PLAN_MAX_DAYS).toBe(90);
  });

  it('chặn ngày kết thúc trước ngày bắt đầu và ngày không tồn tại', () => {
    expect(() => validateMealPlanRange('2026-01-10', '2026-01-09')).toThrow(
      'sau hoặc bằng',
    );
    expect(() => validateMealPlanRange('2026-02-30', '2026-03-10')).toThrow(
      'không hợp lệ',
    );
  });

  it('cộng ngày qua tháng và năm nhuận', () => {
    expect(addDaysToKey('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDaysToKey('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDaysToKey('2024-02-28', 2)).toBe('2024-03-01');
    expect(daysBetweenKeys('2026-01-08', '2026-01-01')).toBe(7);
    expect(mealPlanEndDate('2026-01-01', 28)).toBe('2026-01-28');
  });
});

describe('meal plan cycle and phase', () => {
  it('lặp lại chu kỳ 7 ngày', () => {
    expect(cycleIndexForDate('2026-01-01', '2026-01-01')).toBe(0);
    expect(cycleIndexForDate('2026-01-01', '2026-01-07')).toBe(6);
    expect(cycleIndexForDate('2026-01-01', '2026-01-08')).toBe(0);
    expect(cycleIndexForDate('2026-01-01', '2025-12-31')).toBeNull();
  });

  it('báo trạng thái sắp bắt đầu, đang chạy, đã kết thúc', () => {
    const upcoming = mealPlanPhase('2026-01-05', '2026-02-03', '2026-01-01');
    expect(upcoming.status).toBe('upcoming');
    expect(upcoming.daysUntilStart).toBe(4);

    const active = mealPlanPhase('2026-01-01', '2026-01-28', '2026-01-15');
    expect(active.status).toBe('active');
    expect(active.daysElapsed).toBe(14);
    expect(active.daysRemaining).toBe(14);
    expect(active.cycleIndex).toBe(0);

    const ended = mealPlanPhase('2026-01-01', '2026-01-28', '2026-01-29');
    expect(ended.status).toBe('ended');
    expect(ended.daysRemaining).toBe(0);
  });
});

describe('meal plan nutrition totals', () => {
  it('cộng macro từ danh sách món', () => {
    const totals = sumFoods([
      { calories: 100, proteinG: 10, carbsG: 5, fatG: 2 },
      { calories: 250, proteinG: 20, carbsG: 30, fatG: 10 },
    ]);
    expect(totals).toEqual({ calories: 350, proteinG: 30, carbsG: 35, fatG: 12 });
  });

  it('cộng tổng bữa từ foods, bỏ qua số tổng do AI tự ghi', () => {
    const totals = sumMeals([
      {
        totals: { calories: 9999, proteinG: 999, carbsG: 999, fatG: 999 },
        foods: [{ calories: 400, proteinG: 30, carbsG: 40, fatG: 10 }],
      },
      {
        foods: [
          { calories: 200, proteinG: 20, carbsG: 10, fatG: 8 },
          { calories: 100, proteinG: 5, carbsG: 12, fatG: 2 },
        ],
      },
    ]);
    expect(totals).toEqual({ calories: 700, proteinG: 55, carbsG: 62, fatG: 20 });
  });

  it('tính mục tiêu calo/protein theo mục tiêu bằng code', () => {
    const cut = computeDailyTargets({ tdee: 2800, weightKg: 80, goal: 'cut' });
    expect(cut.calories).toBe(2380);
    expect(cut.proteinG).toBe(160);
    expect(cut.fatG).toBe(64);
    expect(cut.carbsG).toBe(291);
    expect(cut.calorieRange).toEqual({ min: 2240, max: 2520 });

    const maintain = computeDailyTargets({ tdee: 2800, weightKg: 80, goal: 'maintain' });
    expect(maintain.calories).toBe(2800);
    expect(maintain.proteinG).toBe(144);
    expect(maintain.carbsG).toBe(412);
  });
});
