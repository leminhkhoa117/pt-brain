import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

// Phải set trước khi import env.js để app không bật pino/rate limit của dev.
process.env.NODE_ENV = 'test';

const DB_NAME = `pt-brain-test-${process.pid}-${Date.now()}`;
const DB_URI = `mongodb://127.0.0.1:27017/${DB_NAME}`;

let app;
let agent;
let agentTwo;
let mongoose;
let lessonSlug;
let lessonQuiz;

beforeAll(async () => {
  const { connectDb } = await import('../src/config/db.js');
  await connectDb(DB_URI);

  mongoose = (await import('mongoose')).default;
  const { createApp } = await import('../src/app.js');
  const { LESSONS } = await import('../../shared/curriculum/lessons/index.js');

  lessonSlug = LESSONS[0].slug;
  lessonQuiz = LESSONS[0].quiz;

  app = createApp();
});

afterAll(async () => {
  if (mongoose) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

describe('Curriculum API integration', () => {
  it('chặn khi chưa đăng nhập', async () => {
    await request(app).get('/api/curriculum').expect(401);
  });

  it('đăng ký user test', async () => {
    agent = request.agent(app);
    const res = await agent
      .post('/api/auth/register')
      .send({
        name: 'PT Test',
        email: 'curriculum-test@example.com',
        password: 'mat-khau-rat-dai-123',
      })
      .expect(201);
    expect(res.body.data.user.email).toBe('curriculum-test@example.com');
  });

  it('GET /api/curriculum trả cây 5 module + tiến độ rỗng', async () => {
    const res = await agent.get('/api/curriculum').expect(200);
    const { modules, overall, continueLesson, disclaimer } = res.body.data;

    expect(modules).toHaveLength(6);
    expect(modules.map((m) => m.key)).toEqual(['anat', 'phys', 'nutr', 'fit', 'rehab', 'case']);
    expect(overall.totalLessons).toBeGreaterThanOrEqual(2);
    expect(overall.completed).toBe(0);
    expect(overall.percent).toBe(0);
    expect(continueLesson).toBeTruthy();
    expect(disclaimer).toContain('không thay thế');

    // Chưa học gì: gợi ý tiếp tục là bài đầu tiên theo thứ tự cây.
    const firstLesson = modules[0].chapters[0].lessons[0];
    expect(continueLesson).toBe(firstLesson.slug);
    expect(firstLesson.status).toBe('new');
  });

  it('GET /api/curriculum/lessons/:slug trả nội dung + ảnh có url', async () => {
    const res = await agent.get(`/api/curriculum/lessons/${lessonSlug}`).expect(200);
    const { lesson, progress } = res.body.data;

    expect(lesson.slug).toBe(lessonSlug);
    expect(lesson.sections.length).toBeGreaterThanOrEqual(2);
    expect(lesson.quiz.length).toBeGreaterThanOrEqual(4);
    // Mở bài ghi nhận view -> bài chuyển sang "reading" ngay.
    expect(progress.status).toBe('reading');

    const withImage = lesson.sections.find((s) => s.imageUrl);
    if (withImage) {
      expect(withImage.imageUrl).toMatch(/^\/curriculum\/images\//);
    }
    lesson.related.muscles.forEach((slug) => {
      expect(slug).toMatch(/^[a-z-]+$/);
    });
  });

  it('GET bài không tồn tại → 404', async () => {
    await agent.get('/api/curriculum/lessons/khong-ton-tai').expect(404);
  });

  it('PUT progress đánh dấu hoàn thành, tree phản ánh đúng', async () => {
    const reading = await agent
      .put(`/api/curriculum/progress/${lessonSlug}`)
      .send({ status: 'reading' })
      .expect(200);
    expect(reading.body.data.progress.status).toBe('reading');

    const res = await agent
      .put(`/api/curriculum/progress/${lessonSlug}`)
      .send({ status: 'completed' })
      .expect(200);
    expect(res.body.data.progress.status).toBe('completed');
    expect(res.body.data.progress.completedAt).toBeTruthy();

    const tree = await agent.get('/api/curriculum').expect(200);
    expect(tree.body.data.overall.completed).toBe(1);
    const anat = tree.body.data.modules.find((m) => m.key === 'anat');
    const completedLesson = anat.chapters
      .flatMap((c) => c.lessons)
      .find((l) => l.slug === lessonSlug);
    expect(completedLesson.status).toBe('completed');
  });

  it('POST quiz chấm bằng code và lưu quizBest', async () => {
    const answers = lessonQuiz.map((q) => q.answer);
    const res = await agent
      .post(`/api/curriculum/lessons/${lessonSlug}/quiz`)
      .send({ answers })
      .expect(200);

    expect(res.body.data.score).toBe(100);
    expect(res.body.data.correctCount).toBe(res.body.data.total);
    expect(res.body.data.quizBest).toBe(100);
    expect(res.body.data.results[0].explain.length).toBeGreaterThan(0);

    const wrongAnswers = lessonQuiz.map((q, index) =>
      index === 0 ? (q.answer + 1) % 4 : q.answer,
    );
    const second = await agent
      .post(`/api/curriculum/lessons/${lessonSlug}/quiz`)
      .send({ answers: wrongAnswers })
      .expect(200);
    expect(second.body.data.score).toBeLessThan(100);
    expect(second.body.data.quizBest).toBe(100);
    expect(second.body.data.quizAttempts).toBe(2);
  });

  it('POST quiz sai số lượng đáp án → 400', async () => {
    await agent
      .post(`/api/curriculum/lessons/${lessonSlug}/quiz`)
      .send({ answers: [0, 1] })
      .expect(400);
  });

  it('user khác không thấy tiến độ của user đầu', async () => {
    agentTwo = request.agent(app);
    await agentTwo
      .post('/api/auth/register')
      .send({
        name: 'PT Test 2',
        email: 'curriculum-test-2@example.com',
        password: 'mat-khau-rat-dai-123',
      })
      .expect(201);

    const res = await agentTwo.get('/api/curriculum').expect(200);
    expect(res.body.data.overall.completed).toBe(0);

    const lesson = await agentTwo.get(`/api/curriculum/lessons/${lessonSlug}`).expect(200);
    expect(lesson.body.data.progress.status).toBe('reading');
    expect(lesson.body.data.progress.quizBest).toBe(0);
  });

  it('xóa tài khoản xóa sạch tiến độ giáo trình', async () => {
    const { CurriculumProgress } = await import('../src/models/CurriculumProgress.js');
    const before = await CurriculumProgress.countDocuments({});
    expect(before).toBeGreaterThan(0);

    await agent.delete('/api/me').send({ password: 'mat-khau-rat-dai-123' }).expect(200);
    await agentTwo.delete('/api/me').send({ password: 'mat-khau-rat-dai-123' }).expect(200);

    const after = await CurriculumProgress.countDocuments({});
    expect(after).toBe(0);
  });
});
