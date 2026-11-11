import { describe, it, expect } from 'vitest';
import {
  estimateCardioCalories,
  CARDIO_ACTIVITIES,
  CARDIO_KEYS,
} from '../../shared/training/cardio.js';

describe('estimateCardioCalories', () => {
  it('chạy bộ 3 km trong 15 phút dùng pace để chọn MET', () => {
    const result = estimateCardioCalories({
      activity: 'running',
      durationMin: 15,
      distanceKm: 3,
      weightKg: 70,
    });
    expect(result.paceMinPerKm).toBe(5);
    expect(result.met).toBe(12.5);
    expect(result.calories).toBe(219);
  });

  it('bơi lội 30 phút dùng MET theo cường độ', () => {
    const result = estimateCardioCalories({
      activity: 'swimming',
      durationMin: 30,
      weightKg: 70,
      intensity: 'moderate',
    });
    expect(result.met).toBe(7);
    expect(result.calories).toBe(245);
  });

  it('có đủ danh sách hoạt động và key duy nhất', () => {
    expect(CARDIO_ACTIVITIES.length).toBeGreaterThanOrEqual(10);
    expect(new Set(CARDIO_KEYS).size).toBe(CARDIO_KEYS.length);
  });

  it('từ chối hoạt động/thời gian không hợp lệ', () => {
    expect(() =>
      estimateCardioCalories({ activity: 'khong-co', durationMin: 30, weightKg: 70 }),
    ).toThrow();
    expect(() =>
      estimateCardioCalories({ activity: 'running', durationMin: 0, weightKg: 70 }),
    ).toThrow();
  });
});
