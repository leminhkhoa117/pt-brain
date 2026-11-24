import { describe, it, expect } from 'vitest';
import { clampQuery } from '../src/services/ai/queryTranslator.js';

describe('clampQuery', () => {
  it('giữ nguyên truy vấn ngắn', () => {
    const query = '("Valsalva maneuver" OR Valsalva) AND squat';
    expect(clampQuery(query)).toBe(query);
  });

  it('cắt truy vấn dài và giữ ngoặc cân bằng', () => {
    const query = `(${Array.from({ length: 30 }, (_, index) => `"breathing term ${index}"`).join(' OR ')}) AND (${Array.from(
      { length: 30 },
      (_, index) => `"exercise term ${index}"`,
    ).join(' OR ')})`;
    const result = clampQuery(query);
    expect(result.length).toBeLessThanOrEqual(220);
    expect((result.match(/\(/g) || []).length).toBe((result.match(/\)/g) || []).length);
    expect(result).not.toMatch(/\b(AND|OR|NOT)\s*$/i);
  });

  it('không để lại dấu ngoặc kép mở', () => {
    const query = `"${'breathing technique '.repeat(20)}"`;
    const result = clampQuery(query);
    expect((result.match(/"/g) || []).length % 2).toBe(0);
  });
});
