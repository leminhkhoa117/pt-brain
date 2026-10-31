import { describe, it, expect } from 'vitest';
import { buildBodyLogPdf, buildSummaryPdf } from '../src/services/pdf/summaryPdf.js';
import { isMeaningfulTitle } from '../src/services/research/pdf.js';
import { clientCreateSchema } from '../src/validation/client.js';
import { summaryMetaSchema } from '../src/validation/summary.js';

const summary = {
  _id: '507f1f77bcf86cd799439011',
  content: {
    metadata: {
      title: 'Tác động của volume tập đến phì đại cơ',
      authors: ['Nguyễn Văn A'],
      year: 2024,
      journal: 'Journal of Testing',
      doi: '10.1000/test',
    },
    tldr: 'Tăng volume trong khoảng hợp lý giúp tăng khối cơ nhiều hơn.',
    researchQuestion: 'Volume tối ưu là bao nhiêu?',
    studyType: 'Meta-analysis',
    evidenceLevel: { level: 1, explanation: 'Tổng hợp nhiều RCT.' },
    participants: { n: 300, description: 'Nam và nữ, 18-40 tuổi.' },
    design: 'Phân tích gộp 12 RCT.',
    intervention: '10-20 set/tuần so với 5-10 set/tuần.',
    outcomes: 'Khối nạc đo bằng DEXA.',
    mainResults: [
      {
        finding: 'Volume cao hơn tăng khối cơ nhiều hơn',
        numbers: 'ES = 0.24 (95% CI 0.08-0.40), p = 0.003',
        plainMeaning: 'Chênh lệch nhỏ đến vừa.',
      },
    ],
    secondaryResults: [],
    authorsConclusion: 'Nên tăng volume từ từ.',
    limitations: ['Số nghiên cứu còn ít'],
    conflictOfInterest: 'Không nêu trong bài',
    practicalTakeaways: ['Tăng dần volume cho người có nền tảng.'],
    whoItDoesNotApplyTo: 'Người mới tập.',
    glossary: [{ en: 'hypertrophy', vi: 'phì đại cơ', explanation: 'Tăng kích thước cơ.' }],
    confidence: { basedOn: 'fulltext', missingInfo: [] },
  },
};

describe('PDF export', () => {
  it('tạo PDF tóm tắt có magic bytes %PDF và nội dung tiếng Việt', async () => {
    const buffer = await buildSummaryPdf(summary, { title: 'Paper', doi: '10.1000/test' });
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(2000);
    expect(buffer.subarray(0, 5).toString()).toBe('%PDF-');
  });

  it('tạo PDF báo cáo BodyLog với nhiều dòng', async () => {
    const logs = Array.from({ length: 3 }, (_, i) => ({
      dateKey: `2026-10-0${i + 1}`,
      weightKg: 72 + i,
      measurements: { waistCm: 82, neckCm: 38 },
      computed: { bodyFatNavy: 16.2, leanMassKg: 61.2, ffmi: 20 },
      sleepHours: 7.5,
      calories: 2500,
      proteinG: 150,
    }));
    const buffer = await buildBodyLogPdf(logs, { name: 'Người dùng thử' });
    expect(buffer.subarray(0, 5).toString()).toBe('%PDF-');
    expect(buffer.length).toBeGreaterThan(2000);
  });
});

describe('PDF title detection', () => {
  it('loại bỏ title rác kiểu tên file', () => {
    expect(isMeaningfulTitle('GER441029.indd')).toBe(false);
    expect(isMeaningfulTitle('000441029')).toBe(false);
    expect(isMeaningfulTitle('paper.pdf')).toBe(false);
  });

  it('giữ title thật', () => {
    expect(isMeaningfulTitle('Kicking Back Cognitive Ageing in Older Twins')).toBe(true);
  });
});

describe('client validation', () => {
  it('nhận khách hàng hợp lệ', () => {
    const parsed = clientCreateSchema.parse({ name: 'Trần Thị B', email: 'b@example.com' });
    expect(parsed.goal).toBe('maintain');
    expect(parsed.status).toBe('active');
  });

  it('từ chối tên quá ngắn / email sai', () => {
    expect(() => clientCreateSchema.parse({ name: 'A' })).toThrow();
    expect(() => clientCreateSchema.parse({ name: 'Khách A', email: 'sai' })).toThrow();
  });
});

describe('summaryMetaSchema', () => {
  it('nhận favorite và tags', () => {
    const parsed = summaryMetaSchema.parse({ isFavorite: true, tags: ['hypertrophy'] });
    expect(parsed.isFavorite).toBe(true);
  });

  it('từ chối tag quá dài', () => {
    expect(() => summaryMetaSchema.parse({ tags: ['x'.repeat(80)] })).toThrow();
  });
});
