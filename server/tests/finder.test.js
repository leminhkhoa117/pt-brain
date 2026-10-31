import { describe, it, expect } from 'vitest';
import { dedupeResults, rankResults, scoreResult } from '../src/services/research/ranker.js';
import { reconstructAbstract } from '../src/services/research/openalex.js';
import { evidenceLevelFromPublicationTypes } from '../src/services/research/evidence.js';
import { researchSearchSchema } from '../src/validation/research.js';

const paper = (overrides = {}) => ({
  title: 'Paper',
  abstract: 'x'.repeat(300),
  authors: [],
  publicationTypes: [],
  evidenceLevel: 5,
  citationCount: 0,
  isOpenAccess: false,
  year: 2024,
  ...overrides,
});

describe('evidenceLevelFromPublicationTypes', () => {
  it('xếp meta-analysis và systematic review ở mức 1', () => {
    expect(evidenceLevelFromPublicationTypes(['Meta-Analysis']).level).toBe(1);
    expect(evidenceLevelFromPublicationTypes(['Systematic Review']).level).toBe(1);
  });

  it('xếp RCT ở mức 2, quan sát mức 3, case report mức 4', () => {
    expect(evidenceLevelFromPublicationTypes(['Randomized Controlled Trial']).level).toBe(2);
    expect(evidenceLevelFromPublicationTypes(['Cohort Study']).level).toBe(3);
    expect(evidenceLevelFromPublicationTypes(['Case Reports']).level).toBe(4);
  });

  it('không rõ -> mức 5', () => {
    expect(evidenceLevelFromPublicationTypes(['Journal Article']).level).toBe(5);
    expect(evidenceLevelFromPublicationTypes([]).level).toBe(5);
  });
});

describe('dedupeResults', () => {
  it('gộp cùng DOI và giữ thông tin tốt hơn', () => {
    const merged = dedupeResults([
      paper({ doi: '10.1/ABC', citationCount: 3, abstract: 'ngắn' }),
      paper({
        doi: '10.1/abc',
        citationCount: 50,
        abstract: 'abstract dài hơn '.repeat(20),
        isOpenAccess: true,
        pmid: '123',
        publicationTypes: ['Randomized Controlled Trial'],
      }),
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0].citationCount).toBe(50);
    expect(merged[0].isOpenAccess).toBe(true);
    expect(merged[0].pmid).toBe('123');
    expect(merged[0].evidenceLevel).toBe(2);
  });

  it('gộp theo PMID khi không có DOI, theo title khi không có cả hai', () => {
    expect(
      dedupeResults([paper({ pmid: '1', title: 'A' }), paper({ pmid: '1', title: 'A2' })]),
    ).toHaveLength(1);
    expect(
      dedupeResults([
        paper({ title: 'Same Title', doi: '' }),
        paper({ title: 'Same Title!', doi: '' }),
      ]),
    ).toHaveLength(1);
  });
});

describe('rankResults', () => {
  it('ưu tiên bằng chứng mạnh hơn', () => {
    const ranked = rankResults([
      paper({ title: 'Case', evidenceLevel: 4, citationCount: 100 }),
      paper({ title: 'Meta', evidenceLevel: 1, year: 2015 }),
    ]);
    expect(ranked[0].title).toBe('Meta');
  });

  it('lọc theo maxLevel và open access', () => {
    const items = [
      paper({ title: 'Meta', evidenceLevel: 1, isOpenAccess: false }),
      paper({ title: 'RCT', evidenceLevel: 2, isOpenAccess: true }),
    ];
    expect(rankResults(items, { maxLevel: 2 })).toHaveLength(2);
    expect(rankResults(items, { maxLevel: 1 })).toHaveLength(1);
    expect(rankResults(items, { openAccessOnly: true })).toHaveLength(1);
  });

  it('điểm cao hơn khi mới, nhiều trích dẫn, open access', () => {
    const old = scoreResult(paper({ year: 2000, citationCount: 0 }), 2026);
    const recent = scoreResult(
      paper({ year: 2026, citationCount: 300, isOpenAccess: true }),
      2026,
    );
    expect(recent).toBeGreaterThan(old);
  });
});

describe('reconstructAbstract', () => {
  it('dựng lại câu từ inverted index', () => {
    const abstract = reconstructAbstract({
      Resistance: [0],
      training: [1],
      'increases': [2],
      strength: [3],
    });
    expect(abstract).toBe('Resistance training increases strength');
  });

  it('trả về rỗng với input rỗng', () => {
    expect(reconstructAbstract(null)).toBe('');
  });
});

describe('researchSearchSchema', () => {
  it('nhận câu hỏi hợp lệ và filter', () => {
    const parsed = researchSearchSchema.parse({
      question: 'Volume tập tối ưu cho hypertrophy là bao nhiêu?',
      filters: { yearFrom: 2015, maxLevel: 2, openAccessOnly: true },
    });
    expect(parsed.filters.maxLevel).toBe(2);
  });

  it('từ chối câu hỏi quá ngắn và năm ngược', () => {
    expect(() => researchSearchSchema.parse({ question: 'hi' })).toThrow();
    expect(() =>
      researchSearchSchema.parse({ question: 'câu hỏi đủ dài', filters: { yearFrom: 2025, yearTo: 2010 } }),
    ).toThrow();
  });
});
