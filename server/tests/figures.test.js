import { describe, it, expect } from 'vitest';
import {
  extractFigureHints,
  extractFigureHintsFromPages,
  normalizeFigureLabel,
} from '../src/services/research/figures.js';
import { summaryContentSchema } from '../src/validation/summary.js';

const PAGE_WITH_FIGURE = `
Discussion
As shown in fig. 1, the effect was small.

Fig. 1. Age-related change in twins discordant for LEP. LEP dis-
cordance was defined as a difference of >1 SD. * p < 0.05.
Downloaded from karger.com by guest on 30 October 2026.

Table 2. Reduced models for predictors of age related change in cognition
1999 IDsModel 1Model 2
`;

describe('extractFigureHints', () => {
  it('lấy đúng nhãn, trang và chú thích; bỏ dòng footer', () => {
    const hints = extractFigureHintsFromPages([PAGE_WITH_FIGURE]);
    expect(hints).toHaveLength(2);
    expect(hints[0]).toMatchObject({ label: 'Figure 1', kind: 'figure', page: 1 });
    expect(hints[0].caption).toContain('Age-related change');
    expect(hints[0].caption).not.toContain('Downloaded from');
    expect(hints[1]).toMatchObject({ label: 'Table 2', kind: 'table' });
  });

  it('không nhầm câu nhắc tới hình với chú thích', () => {
    const hints = extractFigureHints('We refer to fig. 1 in the text, not a caption.');
    expect(hints).toHaveLength(0);
  });

  it('nguồn không có số trang thì page = 0', () => {
    const hints = extractFigureHints(PAGE_WITH_FIGURE);
    expect(hints.every((hint) => hint.page === 0)).toBe(true);
  });

  it('khử trùng lặp cùng một nhãn', () => {
    const hints = extractFigureHintsFromPages([PAGE_WITH_FIGURE, PAGE_WITH_FIGURE]);
    expect(hints.filter((hint) => hint.label === 'Figure 1')).toHaveLength(1);
  });
});

describe('normalizeFigureLabel', () => {
  it('gộp các cách viết về cùng một khóa', () => {
    expect(normalizeFigureLabel('Fig. 1')).toBe('figure 1');
    expect(normalizeFigureLabel('FIGURE 1')).toBe('figure 1');
    expect(normalizeFigureLabel('Hình 1')).toBe('figure 1');
    expect(normalizeFigureLabel('Bảng 2')).toBe('table 2');
    expect(normalizeFigureLabel('Table 2a')).toBe('table 2a');
  });
});

describe('figures trong summaryContentSchema', () => {
  it('chuẩn hóa object thiếu field và nhận diện bảng', () => {
    const parsed = summaryContentSchema.parse({
      tldr: 'x',
      studyType: 'RCT',
      evidenceLevel: { level: 2 },
      mainResults: [{ finding: 'a', plainMeaning: 'b' }],
      figures: [
        { label: 'Bảng 1', caption: 'Đặc điểm mẫu', explanation: 'Mô tả mẫu.' },
        { label: 'Figure 2', kind: 'figure', page: '9', explanation: 'Hoạt hóa não.' },
      ],
    });
    expect(parsed.figures).toHaveLength(2);
    expect(parsed.figures[0]).toMatchObject({ label: 'Bảng 1', kind: 'table' });
    expect(parsed.figures[1]).toMatchObject({ label: 'Figure 2', kind: 'figure', page: 9 });
    expect(parsed.figures[0].whatToLookFor).toBe('');
  });

  it('mặc định figures rỗng khi AI không trả về', () => {
    const parsed = summaryContentSchema.parse({
      tldr: 'x',
      studyType: 'RCT',
      evidenceLevel: { level: 2 },
      mainResults: [{ finding: 'a', plainMeaning: 'b' }],
    });
    expect(parsed.figures).toEqual([]);
    expect(parsed.resultsOverview).toBe('');
  });
});
