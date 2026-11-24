import { describe, it, expect } from 'vitest';
import { buildExpandedQueries } from '../src/services/research/queryExpand.js';

describe('buildExpandedQueries', () => {
  it('ghép concept chính với từng concept phụ', () => {
    const queries = buildExpandedQueries([
      { terms: ['breathing technique', 'breathing pattern'] },
      { terms: ['resistance training', 'squat'] },
      { terms: ['exercise performance'] },
    ]);
    expect(queries).toHaveLength(2);
    expect(queries[0]).toBe(
      '("breathing technique" OR "breathing pattern") AND ("resistance training" OR "squat")',
    );
    expect(queries[1]).toContain('"exercise performance"');
  });

  it('không mở rộng khi thiếu concept', () => {
    expect(buildExpandedQueries([])).toEqual([]);
    expect(buildExpandedQueries([{ terms: ['breathing'] }])).toEqual([]);
  });

  it('giới hạn độ dài truy vấn', () => {
    const queries = buildExpandedQueries([
      { terms: Array.from({ length: 10 }, (_, index) => `breathing term ${index}`) },
      { terms: Array.from({ length: 10 }, (_, index) => `exercise term ${index}`) },
    ]);
    expect(queries.length).toBeGreaterThan(0);
    expect(queries.every((query) => query.length <= 220)).toBe(true);
  });
});
