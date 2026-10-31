import { describe, it, expect } from 'vitest';
import { buildWarnings } from '../../shared/analytics/warnings.js';

const dayKeys = (n, start = '2026-01-01') =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date(`${start}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + i);
    return d.toISOString().slice(0, 10);
  });

describe('buildWarnings', () => {
  it('chưa có dữ liệu -> nhắc nhập', () => {
    const warnings = buildWarnings({ logs: [], profile: {} });
    expect(warnings.map((w) => w.code)).toContain('NO_DATA');
  });

  it('thiếu dữ liệu >= 3 ngày', () => {
    const keys = dayKeys(1);
    const warnings = buildWarnings({
      logs: [{ dateKey: keys[0], weightKg: 80, proteinG: 150 }],
      profile: { goal: 'maintain' },
      todayKey: '2026-01-05',
    });
    expect(warnings.map((w) => w.code)).toContain('MISSING_DATA');
  });

  it('tăng cân quá nhanh khi đang cut', () => {
    const keys = dayKeys(14);
    const logs = keys.map((dateKey, i) => ({
      dateKey,
      weightKg: i < 7 ? 80 : 82,
      proteinG: 150,
    }));
    const warnings = buildWarnings({
      logs,
      profile: { goal: 'cut' },
      todayKey: keys.at(-1),
    });
    expect(warnings.map((w) => w.code)).toContain('WEIGHT_GAIN_TOO_FAST');
  });

  it('giảm cân quá nhanh khi đang cut', () => {
    const keys = dayKeys(14);
    const logs = keys.map((dateKey, i) => ({
      dateKey,
      weightKg: i < 7 ? 82 : 78,
      proteinG: 150,
    }));
    const warnings = buildWarnings({
      logs,
      profile: { goal: 'cut' },
      todayKey: keys.at(-1),
    });
    expect(warnings.map((w) => w.code)).toContain('WEIGHT_LOSS_TOO_FAST');
  });

  it('protein thấp 3 ngày liên tiếp', () => {
    const keys = dayKeys(3);
    const logs = keys.map((dateKey) => ({ dateKey, weightKg: 80, proteinG: 50 }));
    const warnings = buildWarnings({
      logs,
      profile: { goal: 'maintain', sex: 'male' },
      todayKey: keys.at(-1),
    });
    expect(warnings.map((w) => w.code)).toContain('LOW_PROTEIN');
  });

  it('không cảnh báo protein khi đủ 3 ngày và đủ lượng', () => {
    const keys = dayKeys(3);
    const logs = keys.map((dateKey) => ({ dateKey, weightKg: 80, proteinG: 160 }));
    const warnings = buildWarnings({
      logs,
      profile: { goal: 'maintain', sex: 'male' },
      todayKey: keys.at(-1),
    });
    expect(warnings.map((w) => w.code)).not.toContain('LOW_PROTEIN');
  });

  it('ngủ ít 3 ngày liên tiếp', () => {
    const keys = dayKeys(3);
    const logs = keys.map((dateKey) => ({
      dateKey,
      weightKg: 80,
      proteinG: 160,
      sleepHours: 5,
    }));
    const warnings = buildWarnings({
      logs,
      profile: { goal: 'maintain' },
      todayKey: keys.at(-1),
    });
    expect(warnings.map((w) => w.code)).toContain('LOW_SLEEP');
  });
});
