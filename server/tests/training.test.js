import { describe, it, expect } from 'vitest';
import {
  buildProgressionSuggestion,
  deloadStatus,
  roundToStep,
  suggestSplit,
  volumeFromDays,
} from '../../shared/training/planner.js';
import { computeSession } from '../src/services/training/workoutService.js';

describe('suggestSplit', () => {
  it('<=3 ngày dùng full body', () => {
    expect(suggestSplit(1)).toBe('full_body');
    expect(suggestSplit(3)).toBe('full_body');
  });

  it('4 ngày dùng upper/lower', () => {
    expect(suggestSplit(4)).toBe('upper_lower');
  });

  it('>=5 ngày dùng PPL', () => {
    expect(suggestSplit(5)).toBe('ppl');
    expect(suggestSplit(6)).toBe('ppl');
  });
});

describe('buildProgressionSuggestion', () => {
  it('chưa có dữ liệu -> hướng dẫn chọn tạ', () => {
    const result = buildProgressionSuggestion({ lastSets: [], repMin: 8, repMax: 12 });
    expect(result.action).toBe('no_data');
    expect(result.nextWeightKg).toBeNull();
  });

  it('tất cả set đạt cận trên + RIR mục tiêu -> tăng tạ', () => {
    const result = buildProgressionSuggestion({
      lastSets: [
        { weightKg: 100, reps: 12, rir: 2 },
        { weightKg: 100, reps: 12, rir: 2 },
        { weightKg: 100, reps: 13, rir: 1 },
      ],
      repMin: 8,
      repMax: 12,
      targetRir: 2,
    });
    expect(result.action).toBe('increase');
    expect(result.nextWeightKg).toBeGreaterThan(100);
  });

  it('chưa đạt cận trên -> giữ tạ, thêm rep', () => {
    const result = buildProgressionSuggestion({
      lastSets: [
        { weightKg: 100, reps: 10, rir: 2 },
        { weightKg: 100, reps: 9, rir: 3 },
      ],
      repMin: 8,
      repMax: 12,
      targetRir: 2,
    });
    expect(result.action).toBe('add_reps');
    expect(result.nextWeightKg).toBe(100);
  });

  it('đạt rep nhưng thiếu RIR -> chưa tăng tạ', () => {
    const result = buildProgressionSuggestion({
      lastSets: [
        { weightKg: 60, reps: 12 },
        { weightKg: 60, reps: 12 },
      ],
      repMin: 8,
      repMax: 12,
      targetRir: 2,
    });
    expect(result.action).toBe('add_reps');
  });

  it('bài bodyweight đạt rep -> thêm rep, không cộng 2,5 kg', () => {
    const result = buildProgressionSuggestion({
      lastSets: [
        { weightKg: 0, reps: 15, rir: 2 },
        { weightKg: 0, reps: 15, rir: 2 },
      ],
      repMin: 10,
      repMax: 15,
      targetRir: 2,
    });
    expect(result.action).toBe('add_reps');
    expect(result.nextWeightKg).toBe(0);
    expect(result.message).toContain('biến thể khó hơn');
  });
});

describe('roundToStep', () => {
  it('làm tròn theo bước 2.5 kg', () => {
    expect(roundToStep(101.2)).toBe(100);
    expect(roundToStep(102.6)).toBe(102.5);
  });
});

describe('deloadStatus', () => {
  it('nhắc deload khi đủ số tuần', () => {
    const first = new Date('2026-01-01T00:00:00Z');
    const now = new Date('2026-02-20T00:00:00Z');
    const result = deloadStatus({ firstSessionDate: first, deloadEveryWeeks: 6, now });
    expect(result.suggested).toBe(true);
    expect(result.weeks).toBeGreaterThanOrEqual(6);
  });

  it('chưa đủ tuần thì không nhắc', () => {
    const result = deloadStatus({
      firstSessionDate: new Date('2026-01-01T00:00:00Z'),
      deloadEveryWeeks: 6,
      now: new Date('2026-01-15T00:00:00Z'),
    });
    expect(result.suggested).toBe(false);
  });
});

describe('volumeFromDays', () => {
  it('cộng set theo nhóm cơ qua các ngày', () => {
    const volume = volumeFromDays([
      { exercises: [{ muscleGroup: 'chest', sets: 4 }, { muscleGroup: 'back', sets: 4 }] },
      { exercises: [{ muscleGroup: 'chest', sets: 3 }] },
    ]);
    expect(volume).toEqual({ chest: 7, back: 4 });
  });
});

describe('computeSession', () => {
  it('tính tonnage, set theo nhóm cơ và 1RM tốt nhất', () => {
    const computed = computeSession([
      { exercise: 'Bench Press', muscleGroup: 'chest', weightKg: 100, reps: 5 },
      { exercise: 'Bench Press', muscleGroup: 'chest', weightKg: 90, reps: 10 },
      { exercise: 'Row', muscleGroup: 'back', weightKg: 60, reps: 10 },
    ]);
    expect(computed.tonnage).toBe(500 + 900 + 600);
    expect(computed.setsByMuscle).toEqual({ chest: 2, back: 1 });
    expect(computed.estimated1RMs['Bench Press']).toBeGreaterThan(110);
  });

  it('bỏ qua set 0 rep', () => {
    const computed = computeSession([
      { exercise: 'Squat', muscleGroup: 'quads', weightKg: 100, reps: 0 },
    ]);
    expect(computed.tonnage).toBe(0);
    expect(computed.estimated1RMs).toEqual({});
  });
});
