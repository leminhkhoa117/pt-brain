import { describe, expect, it } from 'vitest';
import { buildLandscape } from '../src/services/research/landscape.js';

const works = [
  { title: 'Old low', year: 2010, citationCount: 10, journal: 'J1', authors: ['A', 'B'] },
  { title: 'Old high', year: 2012, citationCount: 300, journal: 'J2', authors: ['A'] },
  { title: 'Recent', year: 2025, citationCount: 5, journal: 'J2', authors: ['C'] },
  { title: 'No year', citationCount: 999, journal: 'J1', authors: ['B'] },
];

describe('buildLandscape', () => {
  it('xếp bài nền tảng theo trích dẫn, chỉ lấy bài cũ >= 5 năm', () => {
    const landscape = buildLandscape(works, { currentYear: 2026 });
    expect(landscape.seminal.map((item) => item.title)).toEqual(['Old high', 'Old low']);
  });

  it('xếp bài mới theo năm rồi trích dẫn', () => {
    const landscape = buildLandscape(works, { currentYear: 2026 });
    expect(landscape.recent.map((item) => item.title)).toEqual(['Recent']);
  });

  it('đếm tạp chí và tác giả', () => {
    const landscape = buildLandscape(works, { currentYear: 2026 });
    expect(landscape.venues[0]).toEqual({ venue: 'J1', count: 2 });
    expect(landscape.authors[0]).toEqual({ author: 'A', count: 2 });
  });

  it('trả mảng rỗng với input rỗng', () => {
    expect(buildLandscape([], { currentYear: 2026 })).toEqual({
      seminal: [],
      recent: [],
      venues: [],
      authors: [],
    });
  });
});
