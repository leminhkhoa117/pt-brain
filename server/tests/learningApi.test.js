import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

process.env.NODE_ENV = 'test';

const DB_NAME = `pt-brain-learning-${process.pid}-${Date.now()}`;
const DB_URI = `mongodb://127.0.0.1:27017/${DB_NAME}`;

let app;
let agent;
let mongoose;
let models;
let lessons;

beforeAll(async () => {
  const { connectDb } = await import('../src/config/db.js');
  await connectDb(DB_URI);
  mongoose = (await import('mongoose')).default;
  const { createApp } = await import('../src/app.js');
  const curriculum = await import('../../shared/curriculum/lessons/index.js');
  lessons = curriculum.LESSONS;
  models = {
    LearningEvent: (await import('../src/models/LearningEvent.js')).LearningEvent,
    CurriculumProgress: (await import('../src/models/CurriculumProgress.js')).CurriculumProgress,
  };
  app = createApp();
});

afterAll(async () => {
  if (mongoose) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

async function login() {
  agent = request.agent(app);
  await agent
    .post('/api/auth/register')
    .send({
      name: 'Learning Test',
      email: 'learning-test@example.com',
      password: 'MatKhauLearning123',
    })
    .expect(201);
  await agent
    .patch('/api/me')
    .send({
      profile: {
        goal: 'cut',
        experience: 'beginner',
        healthConditions: ['knee_pain'],
      },
    })
    .expect(200);
}

describe('Learning recommendations API', () => {
  it('đăng ký + cập nhật hồ sơ', async () => {
    await login();
    const me = await agent.get('/api/me').expect(200);
    expect(me.body.data.user.profile.goal).toBe('cut');
  });

  it('gợi ý bài theo surface training.planner và cơ đang chọn', async () => {
    const res = await agent
      .get('/api/learning/recommendations')
      .query({ surface: 'training.planner', muscles: 'quadriceps', limit: 4 })
      .expect(200);
    const recommendations = res.body.data.recommendations;
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations.length).toBeLessThanOrEqual(4);
    expect(recommendations[0].slug).toMatch(/^[a-z]+-\d+-\d+$/);
    expect(recommendations[0].keyTakeaways.length).toBeGreaterThan(0);
    expect(recommendations[0].actions.length).toBeGreaterThan(0);
  });

  it('gợi ý theo xương/mô liên kết dùng anatomyGroup', async () => {
    const res = await agent
      .get('/api/learning/recommendations')
      .query({ surface: 'muscle.atlas', anatomyGroup: 'lower-limb', limit: 3 })
      .expect(200);
    expect(res.body.data.recommendations.length).toBeGreaterThan(0);
    expect(res.body.data.recommendations.some((item) => item.module === 'anat')).toBe(true);
  });

  it('next + summary có dữ liệu tuần và bài tiếp tục', async () => {
    const next = await agent.get('/api/learning/next').expect(200);
    expect(next.body.data.continueLesson.slug).toBeTruthy();
    expect(next.body.data.recommendations.length).toBeGreaterThan(0);
    expect(next.body.data.totals.total).toBe(lessons.length);
    expect(next.body.data.week).toHaveProperty('applies');
  });

  it('apply action ghi mastery + event, summary cập nhật', async () => {
    const slug = lessons.find((lesson) => lesson.slug === 'anat-2-7')?.slug;
    const applied = await agent
      .post(`/api/learning/lessons/${slug}/apply`)
      .send({
        actionType: 'open_training',
        label: 'Mở giáo án để cân bằng đùi trước/sau',
        surface: 'training.planner',
      })
      .expect(201);
    expect(applied.body.data.mastery).toBeGreaterThan(0);
    expect(applied.body.data.progress.appliedActions.length).toBe(1);

    const summary = await agent.get('/api/learning/summary').expect(200);
    expect(summary.body.data.totals.appliedActions).toBeGreaterThanOrEqual(1);
    expect(summary.body.data.week.applies).toBeGreaterThanOrEqual(1);
    expect(summary.body.data.week.appliedLessons.some((item) => item.slug === slug)).toBe(true);
  });

  it('mở bài ghi view, nộp quiz cập nhật mastery', async () => {
    const lesson = lessons.find((item) => item.slug === 'anat-2-1');
    await agent
      .get(`/api/curriculum/lessons/${lesson.slug}`)
      .query({ surface: 'muscle.atlas' })
      .expect(200);

    const answers = lesson.quiz.map((question) => question.answer);
    const quiz = await agent
      .post(`/api/curriculum/lessons/${lesson.slug}/quiz`)
      .send({ answers })
      .expect(200);
    expect(quiz.body.data.score).toBe(100);
    expect(quiz.body.data.mastery).toBeGreaterThan(0);

    const summary = await agent.get('/api/learning/summary').expect(200);
    expect(summary.body.data.week.views).toBeGreaterThanOrEqual(1);
    expect(summary.body.data.week.quizzes).toBeGreaterThanOrEqual(1);
  });

  it('dismiss ẩn bài khỏi recommendation cùng surface', async () => {
    const before = await agent
      .get('/api/learning/recommendations')
      .query({ surface: 'nutrition', limit: 6 })
      .expect(200);
    const target = before.body.data.recommendations[0];
    expect(target).toBeTruthy();

    await agent
      .post('/api/learning/dismiss')
      .send({ lessonSlug: target.slug, surface: 'nutrition' })
      .expect(200);

    const afterRes = await agent
      .get('/api/learning/recommendations')
      .query({ surface: 'nutrition', limit: 6 })
      .expect(200);
    expect(afterRes.body.data.recommendations.some((item) => item.slug === target.slug)).toBe(false);
  });

  it('chặn surface/action không hợp lệ', async () => {
    await agent
      .get('/api/learning/recommendations')
      .query({ surface: 'not-a-surface' })
      .expect(400);
    await agent
      .post('/api/learning/lessons/anat-2-7/apply')
      .send({ actionType: 'rm_rf' })
      .expect(400);
  });

  it('xóa tài khoản dọn sạch progress + event', async () => {
    const beforeEvents = await models.LearningEvent.countDocuments({});
    const beforeProgress = await models.CurriculumProgress.countDocuments({});
    expect(beforeEvents).toBeGreaterThan(0);
    expect(beforeProgress).toBeGreaterThan(0);

    await agent.delete('/api/me').send({ password: 'MatKhauLearning123' }).expect(200);
    expect(await models.LearningEvent.countDocuments({})).toBe(0);
    expect(await models.CurriculumProgress.countDocuments({})).toBe(0);
  });
});
