import { describe, it, expect } from 'vitest';
import { reviewFlashcard } from '../../shared/learning/sm2.js';
import { applyChangesToDays } from '../src/services/training/programService.js';

describe('SM-2', () => {
  it('lần đầu trả lời tốt: interval 1 ngày, reps 1', () => {
    const result = reviewFlashcard({ ease: 2.5, intervalDays: 0, reps: 0, lapses: 0 }, 4);
    expect(result.reps).toBe(1);
    expect(result.intervalDays).toBe(1);
    expect(result.ease).toBeGreaterThanOrEqual(2.5);
  });

  it('lần thứ hai: interval 6 ngày', () => {
    const result = reviewFlashcard(
      { ease: 2.5, intervalDays: 1, reps: 1, lapses: 0 },
      5,
    );
    expect(result.reps).toBe(2);
    expect(result.intervalDays).toBe(6);
  });

  it('lần thứ ba nhân với ease', () => {
    const result = reviewFlashcard(
      { ease: 2.5, intervalDays: 6, reps: 2, lapses: 0 },
      4,
    );
    expect(result.reps).toBe(3);
    expect(result.intervalDays).toBeGreaterThanOrEqual(15);
  });

  it('quên (quality < 3) reset reps và tăng lapses', () => {
    const result = reviewFlashcard(
      { ease: 2.5, intervalDays: 20, reps: 4, lapses: 1 },
      1,
    );
    expect(result.reps).toBe(0);
    expect(result.intervalDays).toBe(1);
    expect(result.lapses).toBe(2);
  });

  it('ease không xuống dưới 1.3', () => {
    let card = { ease: 1.3, intervalDays: 1, reps: 1, lapses: 0 };
    for (let i = 0; i < 10; i += 1) {
      card = { ...card, ...reviewFlashcard(card, 0) };
    }
    expect(card.ease).toBe(1.3);
  });

  it('dueDate nằm trong tương lai', () => {
    const now = new Date('2026-01-01T00:00:00Z');
    const result = reviewFlashcard({ ease: 2.5 }, 4, now);
    expect(result.dueDate.getTime()).toBeGreaterThan(now.getTime());
  });
});

describe('applyChangesToDays', () => {
  const makeDays = () => [
    {
      name: 'Upper A',
      exercises: [
        { name: 'Bench press', sets: 4, targetRir: 2, repRange: { min: 6, max: 10 } },
      ],
    },
  ];

  it('áp thay đổi hợp lệ vào đúng bài', () => {
    const days = makeDays();
    const { applied } = applyChangesToDays(days, [
      { dayName: 'Upper A', exerciseName: 'Bench press', field: 'sets', after: 5 },
      { dayName: 'Upper A', exerciseName: 'Bench press', field: 'targetRir', after: 1 },
    ]);
    expect(applied).toHaveLength(2);
    expect(days[0].exercises[0].sets).toBe(5);
    expect(days[0].exercises[0].targetRir).toBe(1);
  });

  it('bỏ qua ngày/bài không tồn tại', () => {
    const { applied, skipped } = applyChangesToDays(makeDays(), [
      { dayName: 'Lower A', exerciseName: 'Squat', field: 'sets', after: 5 },
    ]);
    expect(applied).toHaveLength(0);
    expect(skipped[0].reason).toMatch(/Không tìm thấy/);
  });

  it('bỏ qua giá trị ngoài giới hạn và repMin > repMax', () => {
    const { applied, skipped } = applyChangesToDays(makeDays(), [
      { dayName: 'Upper A', exerciseName: 'Bench press', field: 'sets', after: 50 },
      { dayName: 'Upper A', exerciseName: 'Bench press', field: 'repMin', after: 12 },
    ]);
    expect(applied).toHaveLength(0);
    expect(skipped).toHaveLength(2);
  });
});
