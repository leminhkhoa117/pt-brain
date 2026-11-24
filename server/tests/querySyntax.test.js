import { describe, it, expect } from 'vitest';
import { toPlainQuery } from '../src/services/research/querySyntax.js';

describe('toPlainQuery', () => {
  it('bỏ Boolean, ngoặc kép và giữ các từ khóa', () => {
    expect(
      toPlainQuery(
        '("Valsalva maneuver" OR Valsalva) AND (squat OR deadlift OR "resistance exercise")',
      ),
    ).toBe('Valsalva maneuver Valsalva squat deadlift resistance exercise');
  });

  it('bỏ field tag MeSH của PubMed', () => {
    expect(toPlainQuery('"breathing exercises"[MeSH Terms] AND exercise')).toBe(
      'breathing exercises exercise',
    );
  });

  it('trả chuỗi rỗng với input rỗng', () => {
    expect(toPlainQuery('')).toBe('');
    expect(toPlainQuery(null)).toBe('');
  });
});
