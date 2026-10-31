import { describe, it, expect } from 'vitest';
import { addDaysKey, parseDateKey, toDateKey, todayKeyVN } from '../src/utils/date.js';

describe('date utils', () => {
  it('toDateKey trả về YYYY-MM-DD theo UTC', () => {
    expect(toDateKey(new Date('2026-01-05T10:20:30Z'))).toBe('2026-01-05');
  });

  it('parseDateKey trả về Date UTC 00:00', () => {
    expect(parseDateKey('2026-03-01').toISOString()).toBe('2026-03-01T00:00:00.000Z');
  });

  it('ném lỗi với ngày sai định dạng hoặc không tồn tại', () => {
    expect(() => parseDateKey('01/03/2026')).toThrow();
    expect(() => parseDateKey('2026-02-30')).toThrow();
  });

  it('addDaysKey cộng ngày qua tháng', () => {
    expect(addDaysKey('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDaysKey('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('todayKeyVN lệch +7 giờ so với UTC', () => {
    expect(todayKeyVN(new Date('2026-01-01T18:00:00Z'))).toBe('2026-01-02');
  });
});
