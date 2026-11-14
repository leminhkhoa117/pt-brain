import { describe, it, expect } from 'vitest';
import {
  createSummaryInputSchema,
  summaryContentSchema,
} from '../src/validation/summary.js';
import { parseJsonLoose } from '../src/services/ai/client.js';
import { summaryToMarkdown } from '../src/utils/markdown.js';
import { buildCacheKey } from '../src/services/research/reader.js';

const validSummary = {
  metadata: {
    title: 'Resistance training volume and hypertrophy',
    authors: ['Schoenfeld BJ'],
    year: 2017,
    journal: 'Journal of Sports Sciences',
    doi: '10.1080/02640414.2016.1210197',
  },
  tldr: 'Tăng volume tập có liên quan đến tăng khối cơ, nhưng lợi ích tăng chậm dần.',
  researchQuestion: 'Volume tập hằng tuần ảnh hưởng thế nào đến phì đại cơ?',
  studyType: 'Systematic review và meta-analysis',
  evidenceLevel: { level: 1, explanation: 'Tổng hợp nhiều RCT.' },
  participants: { n: 0, description: 'Nam giới tập kháng lực, 8 nghiên cứu.' },
  design: 'Tổng hợp các RCT, thời gian 6-12 tuần.',
  intervention: 'So sánh các mức volume 5-30 set/tuần/nhóm cơ.',
  outcomes: 'Độ dày cơ đo bằng siêu âm, khối nạc bằng DEXA.',
  mainResults: [
    {
      finding: 'Volume cao hơn cho hiệu quả phì đại lớn hơn',
      numbers: 'ES = 0.24 (95% CI 0.08-0.40), p = 0.003',
      plainMeaning: 'Chênh lệch nhỏ đến vừa, có ý nghĩa thống kê.',
    },
  ],
  secondaryResults: [],
  authorsConclusion: 'Volume cao hơn có thể có lợi nhưng cần thêm nghiên cứu.',
  limitations: ['Số nghiên cứu ít', 'Cách đo khối cơ khác nhau (nhận xét thêm)'],
  conflictOfInterest: 'Không nêu trong bài',
  practicalTakeaways: ['Có thể tăng dần volume cho người tập trung cấp.'],
  whoItDoesNotApplyTo: 'Người mới tập chưa có nền tảng.',
  glossary: [{ en: 'hypertrophy', vi: 'phì đại cơ', explanation: 'Tăng kích thước cơ.' }],
  confidence: { basedOn: 'fulltext', missingInfo: [] },
};

describe('summaryContentSchema', () => {
  it('chấp nhận bản tóm tắt hợp lệ', () => {
    const parsed = summaryContentSchema.parse(validSummary);
    expect(parsed.mainResults).toHaveLength(1);
    expect(parsed.confidence.basedOn).toBe('fulltext');
  });

  it('điền default cho field phụ bị thiếu', () => {
    const minimal = {
      tldr: 'x',
      studyType: 'RCT',
      evidenceLevel: { level: 2 },
      mainResults: [{ finding: 'a', plainMeaning: 'b' }],
    };
    const parsed = summaryContentSchema.parse(minimal);
    expect(parsed.metadata.authors).toEqual([]);
    expect(parsed.conflictOfInterest).toBe('Không nêu trong bài');
    expect(parsed.confidence.basedOn).toBe('abstract_only');
  });

  it('từ chối mainResults rỗng', () => {
    expect(() => summaryContentSchema.parse({ ...validSummary, mainResults: [] })).toThrow();
  });

  it('clamp mức bằng chứng sai về 5 thay vì làm hỏng cả bản tóm tắt', () => {
    const parsed = summaryContentSchema.parse({
      ...validSummary,
      evidenceLevel: { level: 9 },
    });
    expect(parsed.evidenceLevel.level).toBe(5);
  });

  it('chuẩn hóa basedOn lạ về abstract_only (an toàn hơn)', () => {
    const parsed = summaryContentSchema.parse({
      ...validSummary,
      confidence: { basedOn: 'guess', missingInfo: [] },
    });
    expect(parsed.confidence.basedOn).toBe('abstract_only');
  });
});

describe('createSummaryInputSchema', () => {
  it('cần ít nhất một trong url/doi/text', () => {
    expect(() => createSummaryInputSchema.parse({})).toThrow();
    expect(createSummaryInputSchema.parse({ doi: '10.1000/xyz' }).doi).toBe('10.1000/xyz');
  });

  it('từ chối text quá ngắn và field lạ', () => {
    expect(() => createSummaryInputSchema.parse({ text: 'quá ngắn' })).toThrow();
    expect(() =>
      createSummaryInputSchema.parse({ doi: '10.1000/xyz', hack: true }),
    ).toThrow();
  });
});

describe('parseJsonLoose', () => {
  it('bóc JSON trong code fence', () => {
    const value = parseJsonLoose('```json\n{"a":1}\n```');
    expect(value).toEqual({ a: 1 });
  });

  it('bỏ text thừa trước/sau JSON', () => {
    expect(parseJsonLoose('Đây là kết quả: {"a":{"b":2}} hết.')).toEqual({ a: { b: 2 } });
  });

  it('ném lỗi khi không có JSON', () => {
    expect(() => parseJsonLoose('không có gì')).toThrow();
  });

  it('cứu JSON bị cắt cụt', () => {
    expect(parseJsonLoose('{"a":1,"b":"value')).toEqual({ a: 1, b: 'value' });
    expect(parseJsonLoose('{"a":1,"b":')).toEqual({ a: 1, b: null });
    expect(parseJsonLoose('{"a":[1,2,')).toEqual({ a: [1, 2] });
  });
});

describe('summaryToMarkdown', () => {
  it('xuất đủ tiêu đề, số liệu và nhãn nguồn', () => {
    const md = summaryToMarkdown(
      { content: validSummary },
      { title: 'Paper', doi: validSummary.metadata.doi, url: 'https://doi.org/x' },
    );
    expect(md).toContain('# Resistance training volume and hypertrophy');
    expect(md).toContain('ES = 0.24');
    expect(md).toContain('toàn văn');
    expect(md).toContain('hypertrophy');
  });

  it('ghi rõ khi chỉ dựa trên abstract', () => {
    const md = summaryToMarkdown({
      content: {
        ...validSummary,
        confidence: { basedOn: 'abstract_only', missingInfo: ['Thiếu bảng số liệu'] },
      },
    });
    expect(md).toContain('chỉ abstract');
    expect(md).toContain('Thiếu bảng số liệu');
  });

  it('xuất phần đọc nhanh và hình/bảng', () => {
    const md = summaryToMarkdown({
      content: {
        ...validSummary,
        resultsOverview: 'Kết quả chính nghiêng về volume cao hơn.',
        figures: [
          {
            label: 'Figure 1',
            kind: 'figure',
            page: 6,
            title: 'Thay đổi nhận thức',
            caption: 'Age-related change',
            explanation: 'So sánh hai nhóm.',
            whatToLookFor: 'Nhìn dấu *',
          },
        ],
      },
    });
    expect(md).toContain('Đọc nhanh');
    expect(md).toContain('Hình & bảng');
    expect(md).toContain('Figure 1 (trang 6)');
    expect(md).toContain('Cần chú ý');
  });

  it('xuất phụ lục facts để audit', () => {
    const md = summaryToMarkdown({
      content: validSummary,
      facts: {
        study: { design: { value: 'RCT' }, participants: { n: 20 } },
        results: [
          {
            outcome: 'Số lần lặp',
            arms: [{ name: 'A', value: '12.4', sd: '3.1' }],
            p: 'p<0.01',
            page: 4,
            quote: 'the number of repetitions',
          },
        ],
        authors: { conclusion: { value: 'Kết luận gốc' } },
      },
    });
    expect(md).toContain('Phụ lục — Dữ kiện kiểm chứng');
    expect(md).toContain('Số lần lặp');
    expect(md).toContain('Kết luận gốc');
    expect(md).toContain('JSON dữ kiện đầy đủ');
  });
});

describe('buildCacheKey', () => {
  it('ưu tiên DOI và chuẩn hóa lowercase, kèm version', () => {
    expect(buildCacheKey({ paper: { doi: '10.1000/ABC' }, text: 'x' })).toBe(
      'doi:10.1000/abc:v3',
    );
  });

  it('dùng hash PDF khi không có DOI', () => {
    expect(buildCacheKey({ paper: {}, pdfHash: 'abc123', text: 'x' })).toBe('pdf:abc123:v3');
  });

  it('dùng hash text khi không có DOI/PDF/URL', () => {
    const key = buildCacheKey({ paper: {}, text: 'nội dung' });
    expect(key).toMatch(/^text:[a-f0-9]{40}:v3$/);
    expect(buildCacheKey({ paper: {}, text: 'nội dung' })).toBe(key);
  });

  it('đổi prompt version thì đổi cache key', () => {
    const a = buildCacheKey({ paper: { doi: '10.1000/abc' } }, 'v3');
    const b = buildCacheKey({ paper: { doi: '10.1000/abc' } }, 'v4');
    expect(a).not.toBe(b);
  });
});
