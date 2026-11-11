import { describe, it, expect } from 'vitest';
import { buildBodyLogPdf, buildSummaryPdf } from '../src/services/pdf/summaryPdf.js';
import { isMeaningfulTitle } from '../src/services/research/pdf.js';
import { summaryMetaSchema } from '../src/validation/summary.js';
import { quizSchema } from '../src/services/ai/quizGenerator.js';

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

describe('summaryMetaSchema', () => {
  it('nhận favorite và tags', () => {
    const parsed = summaryMetaSchema.parse({ isFavorite: true, tags: ['hypertrophy'] });
    expect(parsed.isFavorite).toBe(true);
  });

  it('từ chối tag quá dài', () => {
    expect(() => summaryMetaSchema.parse({ tags: ['x'.repeat(80)] })).toThrow();
  });
});

describe('quizSchema', () => {
  const valid = {
    title: 'Quiz',
    questions: [
      {
        question: 'Volume tối ưu?',
        options: ['5-10 set', '10-20 set', '30-40 set', 'Không rõ'],
        correctIndex: 1,
        explanation: 'Tóm tắt nêu 10-20 set/tuần.',
      },
      {
        question: 'Thiết kế?',
        options: ['RCT', 'Meta-analysis', 'Case report', 'Ý kiến'],
        correctIndex: 1,
        explanation: 'Là meta-analysis.',
      },
      {
        question: 'Mức bằng chứng?',
        options: ['1', '2', '3', '4'],
        correctIndex: 0,
        explanation: 'Mức 1.',
      },
    ],
  };

  it('nhận quiz hợp lệ', () => {
    const parsed = quizSchema.parse(valid);
    expect(parsed.questions).toHaveLength(3);
    expect(parsed.questions[0].options).toHaveLength(4);
  });

  it('từ chối khi không đủ 4 lựa chọn hoặc correctIndex sai', () => {
    expect(() =>
      quizSchema.parse({
        ...valid,
        questions: [{ ...valid.questions[0], options: ['A', 'B'] }],
      }),
    ).toThrow();

    expect(() =>
      quizSchema.parse({
        ...valid,
        questions: [{ ...valid.questions[0], correctIndex: 9 }],
      }),
    ).toThrow();
  });
});
