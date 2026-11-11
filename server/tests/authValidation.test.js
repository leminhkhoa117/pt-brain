import { describe, it, expect } from 'vitest';
import { profileSchema, updateMeSchema } from '../src/validation/auth.js';

function birthDateYearsAgo(years) {
  const date = new Date();
  date.setUTCFullYear(date.getUTCFullYear() - years);
  return date.toISOString().slice(0, 10);
}

describe('profileSchema birthDate', () => {
  it('nhận ngày sinh cho tuổi hợp lệ', () => {
    const parsed = profileSchema.parse({ birthDate: birthDateYearsAgo(30) });
    expect(parsed.birthDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('bỏ trống ngày sinh', () => {
    const parsed = profileSchema.parse({ birthDate: '' });
    expect(parsed.birthDate).toBeUndefined();
  });

  it('từ chối ngày sinh tương lai hoặc quá nhỏ', () => {
    expect(() => profileSchema.parse({ birthDate: birthDateYearsAgo(10) })).toThrow();
    expect(() => profileSchema.parse({ birthDate: birthDateYearsAgo(-1) })).toThrow();
  });

  it('updateMeSchema áp dụng cùng quy tắc', () => {
    expect(() =>
      updateMeSchema.parse({ profile: { birthDate: birthDateYearsAgo(120) } }),
    ).toThrow();
  });
});
