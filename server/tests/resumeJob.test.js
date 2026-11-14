import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

process.env.NODE_ENV = 'test';

vi.mock('../src/services/ai/paperSummarizer.js', () => ({
  PROMPT_VERSION: 'test',
  summarizePaper: vi.fn(async () => ({
    content: {
      metadata: { title: 'Resume test', authors: [], year: 2026, journal: '', doi: '' },
      tldr: 'Job resumed successfully',
      mainResults: [],
      confidence: { basedOn: 'fulltext', missingInfo: [] },
    },
    usage: { input: 10, output: 5, cost: 0 },
    model: 'test-model',
    promptVersion: 'test',
  })),
}));

const DB_NAME = `pt-brain-resume-test-${process.pid}-${Date.now()}`;
const DB_URI = `mongodb://127.0.0.1:27017/${DB_NAME}`;

let mongoose;
let models;
let reader;
let userId;

async function waitForStatus(summaryId, expected, timeoutMs = 3000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const summary = await models.Summary.findById(summaryId).lean();
    if (summary?.status === expected) return summary;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return models.Summary.findById(summaryId).lean();
}

beforeAll(async () => {
  const { connectDb } = await import('../src/config/db.js');
  await connectDb(DB_URI);
  mongoose = (await import('mongoose')).default;
  models = {
    User: (await import('../src/models/User.js')).User,
    Paper: (await import('../src/models/Paper.js')).Paper,
    Summary: (await import('../src/models/Summary.js')).Summary,
    SummaryJobLock: (await import('../src/models/SummaryJobLock.js')).SummaryJobLock,
  };
  reader = await import('../src/services/research/reader.js');

  const user = await models.User.create({
    email: 'resume-test@example.com',
    name: 'Resume Test',
    passwordHash: 'test-only',
  });
  userId = user._id;
});

afterAll(async () => {
  if (mongoose) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

describe('resumeInterruptedSummaries', () => {
  it('chạy lại job processing từ sourceText và giải phóng khóa', async () => {
    const paper = await models.Paper.create({ userId, title: 'Resume paper' });
    const summary = await models.Summary.create({
      userId,
      paperId: paper._id,
      inputType: 'text',
      basedOn: 'fulltext',
      content: { tldr: 'Đang xử lý...', mainResults: [] },
      sourceText: 'Nội dung nguồn đủ dài để chạy lại job tóm tắt sau khi restart.',
      sourceKind: 'user_text',
      cacheKey: 'resume-job-1',
      status: 'processing',
      progress: 'Đang đọc...',
    });

    const result = await reader.resumeInterruptedSummaries();
    expect(result.resumed).toBe(1);

    const finished = await waitForStatus(summary._id, 'ready');
    expect(finished.status).toBe('ready');
    expect(finished.content.tldr).toBe('Job resumed successfully');
    expect(
      await models.SummaryJobLock.countDocuments({ userId, cacheKey: 'resume-job-1' }),
    ).toBe(0);
  });

  it('hai request cùng nội dung chỉ tạo một job và một Summary', async () => {
    const { summarizePaper } = await import('../src/services/ai/paperSummarizer.js');
    summarizePaper.mockClear();
    const user = await models.User.findById(userId);
    const text =
      'Nghiên cứu này kiểm tra hiệu quả của việc tăng dần khối lượng tập luyện ở người mới, ' +
      'với thời gian can thiệp 12 tuần và kết quả chính là khối cơ đo bằng DEXA.';

    const [first, second] = await Promise.all([
      reader.createSummaryForUser(user, { text }),
      reader.createSummaryForUser(user, { text }),
    ]);

    expect(String(first.summary._id)).toBe(String(second.summary._id));
    await waitForStatus(first.summary._id, 'ready');
    expect(summarizePaper).toHaveBeenCalledTimes(1);
    expect(
      await models.Summary.countDocuments({ userId, cacheKey: first.summary.cacheKey }),
    ).toBe(1);
  }, 15000);

  it('job lỗi được đánh dấu failed và vẫn giải phóng khóa', async () => {
    const { summarizePaper } = await import('../src/services/ai/paperSummarizer.js');
    summarizePaper.mockRejectedValueOnce(new Error('AI boom'));

    const paper = await models.Paper.create({ userId, title: 'Resume paper fail' });
    const summary = await models.Summary.create({
      userId,
      paperId: paper._id,
      inputType: 'text',
      basedOn: 'fulltext',
      content: { tldr: 'Đang xử lý...', mainResults: [] },
      sourceText: 'Nội dung nguồn để test job lỗi và giải phóng khóa sau khi thất bại.',
      cacheKey: 'resume-job-fail',
      status: 'processing',
    });

    await reader.resumeInterruptedSummaries();
    const current = await waitForStatus(summary._id, 'failed');
    expect(current.status).toBe('failed');
    expect(current.error).toContain('AI boom');
    expect(
      await models.SummaryJobLock.countDocuments({ userId, cacheKey: 'resume-job-fail' }),
    ).toBe(0);
  });

  it('job thiếu nguồn bị đánh dấu failed thay vì treo processing', async () => {
    const paper = await models.Paper.create({ userId, title: 'Resume paper 2' });
    const summary = await models.Summary.create({
      userId,
      paperId: paper._id,
      inputType: 'text',
      basedOn: 'fulltext',
      content: { tldr: 'Đang xử lý...', mainResults: [] },
      sourceText: '',
      cacheKey: 'resume-job-2',
      status: 'processing',
    });

    await reader.resumeInterruptedSummaries();
    const current = await models.Summary.findById(summary._id).lean();
    expect(current.status).toBe('failed');
    expect(current.error).toContain('thiếu nội dung nguồn');
  });
});
