import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

// Phải set trước khi import env.js để app không bật pino/rate limit của dev.
process.env.NODE_ENV = 'test';

const DB_NAME = `pt-brain-test-${process.pid}-${Date.now()}`;
const DB_URI = `mongodb://127.0.0.1:27017/${DB_NAME}`;

let app;
let agent;
let agentTwo;
let models;
let mongoose;
let dirs;
let pdfPathForHash;
let userId;
let createdFiles = [];

async function writeTempFile(dir, filename, contents) {
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, contents);
  createdFiles.push(filePath);
  return filePath;
}

beforeAll(async () => {
  const { connectDb } = await import('../src/config/db.js');
  await connectDb(DB_URI);

  mongoose = (await import('mongoose')).default;
  const { createApp } = await import('../src/app.js');
  const { User } = await import('../src/models/User.js');
  const { BodyLog } = await import('../src/models/BodyLog.js');
  const { Meal } = await import('../src/models/Meal.js');
  const { BodyAssessment } = await import('../src/models/BodyAssessment.js');
  const { Paper } = await import('../src/models/Paper.js');
  const { Summary } = await import('../src/models/Summary.js');
  const { Exercise } = await import('../src/models/Exercise.js');
  const userFiles = await import('../src/services/userFiles.js');
  const pdf = await import('../src/services/research/pdf.js');

  models = { User, BodyLog, Meal, BodyAssessment, Paper, Summary, Exercise };
  dirs = userFiles;
  pdfPathForHash = pdf.pdfPathForHash;
  app = createApp();
});

afterAll(async () => {
  await Promise.all(createdFiles.map((file) => fs.unlink(file).catch(() => {})));
  if (mongoose) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

describe('PT Brain API integration', () => {
  it('health check trả ok và trạng thái Mongo', async () => {
    const res = await request(app).get('/api/health').expect(200);
    expect(res.body.data.ok).toBe(true);
    expect(res.body.data.db).toBe('up');

    const live = await request(app).get('/api/health/live').expect(200);
    expect(live.body.data.ok).toBe(true);
  });

  it('chặn truy cập /me khi chưa đăng nhập', async () => {
    await request(app).get('/api/me').expect(401);
  });

  it('validate đăng ký yếu và đăng ký thành công', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'A', email: 'bad', password: '123' })
      .expect(400);

    agent = request.agent(app);
    const res = await agent
      .post('/api/auth/register')
      .send({
        name: 'Người Dùng Test',
        email: 'api-test@example.com',
        password: 'mat-khau-rat-dai-123',
      })
      .expect(201);

    userId = res.body.data.user._id;
    expect(res.body.data.user.email).toBe('api-test@example.com');
    expect(res.body.data.user.onboardingRequired).toBe(true);
    expect(res.body.data.user).not.toHaveProperty('passwordHash');
    expect(res.body.data.user).not.toHaveProperty('refreshTokenHash');
  });

  it('khóa job tóm tắt là atomic: request thứ hai không lấy được khóa', async () => {
    const { acquireSummaryLock, releaseSummaryLock } = await import(
      '../src/services/research/summaryLock.js'
    );
    const key = 'api-test-lock';
    expect(await acquireSummaryLock(userId, key)).toBe(true);
    expect(await acquireSummaryLock(userId, key)).toBe(false);
    await releaseSummaryLock(userId, key);
    expect(await acquireSummaryLock(userId, key)).toBe(true);
    await releaseSummaryLock(userId, key);
  });

  it('đăng nhập, refresh token và lấy hồ sơ', async () => {
    await agent.post('/api/auth/login').send({
      email: 'api-test@example.com',
      password: 'mat-khau-rat-dai-123',
    }).expect(200);

    const me = await agent.get('/api/me').expect(200);
    expect(me.body.data.user._id).toBe(userId);

    await agent.post('/api/auth/refresh').expect(200);
    await agent.get('/api/me').expect(200);

    const usage = await agent.get('/api/me/ai-usage').expect(200);
    expect(usage.body.data.summarize).toBe(0);
    expect(usage.body.data.limit).toBeGreaterThan(0);

    const seen = await agent.post('/api/me/welcome-seen').expect(200);
    expect(seen.body.data.user.onboardingRequired).toBe(false);
    const meAfter = await agent.get('/api/me').expect(200);
    expect(meAfter.body.data.user.onboardingRequired).toBe(false);
  });

  it('lưu và đọc BodyLog, summary metrics', async () => {
    const dateKey = '2026-11-11';
    await agent
      .put(`/api/metrics/${dateKey}`)
      .send({
        weightKg: 72.5,
        measurements: { waistCm: 80, neckCm: 38 },
        sleepHours: 7,
        calories: 2200,
      })
      .expect(200);

    const log = await agent.get(`/api/metrics/${dateKey}`).expect(200);
    expect(log.body.data.log.weightKg).toBe(72.5);

    const summary = await agent.get('/api/metrics/summary?days=30').expect(200);
    expect(summary.body.data.latest.dateKey).toBe(dateKey);
    expect(summary.body.data.count).toBe(1);
  });

  it('lưu được set bodyweight với tạ 0', async () => {
    const res = await agent
      .post('/api/workouts')
      .send({
        date: '2026-11-11',
        sets: [{ exercise: 'Pull-up', muscleGroup: 'back', weightKg: 0, reps: 10, rir: 2 }],
      })
      .expect(201);

    expect(res.body.data.workout.computed.tonnage).toBe(0);
    expect(res.body.data.workout.computed.setsByMuscle).toEqual({ back: 1 });
  });

  it('lưu giáo án có ngày cardio-only và trả cardio trong suggestions', async () => {
    const created = await agent
      .post('/api/programs')
      .send({
        name: 'Giáo án cardio Chủ nhật',
        goal: 'maintain',
        daysPerWeek: 1,
        split: 'custom',
        days: [
          {
            name: 'Chủ nhật chạy bộ',
            exercises: [],
            cardio: [
              { activity: 'running', durationMin: 30, distanceKm: 5, intensity: 'moderate' },
            ],
          },
        ],
      })
      .expect(201);

    const programId = created.body.data.program._id;
    const suggestions = await agent
      .get(`/api/programs/${programId}/suggestions?dayName=${encodeURIComponent('Chủ nhật chạy bộ')}`)
      .expect(200);

    expect(suggestions.body.data.cardio).toHaveLength(1);
    expect(suggestions.body.data.cardio[0].activity).toBe('running');
  });

  it('ước tính calo cardio và cho phép nhập calo thủ công', async () => {
    const estimated = await agent
      .post('/api/workouts')
      .send({
        date: '2026-11-11',
        kind: 'cardio',
        activity: 'running',
        durationMin: 30,
        distanceKm: 5,
      })
      .expect(201);

    expect(estimated.body.data.workout.kind).toBe('cardio');
    expect(estimated.body.data.workout.caloriesBurned).toBeGreaterThan(0);
    expect(estimated.body.data.workout.caloriesSource).toBe('estimated');
    expect(estimated.body.data.workout.computed.met).toBeGreaterThan(0);

    const manual = await agent
      .post('/api/workouts')
      .send({
        date: '2026-11-11',
        kind: 'cardio',
        activity: 'swimming',
        durationMin: 40,
        caloriesBurned: 321,
      })
      .expect(201);

    expect(manual.body.data.workout.caloriesBurned).toBe(321);
    expect(manual.body.data.workout.caloriesSource).toBe('manual');

    await agent
      .post('/api/workouts')
      .send({ date: '2026-11-11', kind: 'cardio', activity: 'running' })
      .expect(400);
  });

  it('validate query ngày của meals và workouts', async () => {
    await agent.get('/api/meals?date=not-a-date').expect(400);
    await agent.get('/api/workouts?from=2026-99-99').expect(400);
    await agent.get('/api/workouts?from=2026-11-12&to=2026-11-11').expect(400);
  });

  it('gợi ý giáo án chỉ dùng dụng cụ bodyweight', async () => {
    const res = await agent
      .post('/api/programs/suggest')
      .send({
        goal: 'maintain',
        experience: 'beginner',
        daysPerWeek: 2,
        equipment: ['bodyweight'],
        sessionMinutes: 45,
      })
      .expect(200);

    const names = (res.body.data.days || []).flatMap((day) =>
      (day.exercises || []).map((exercise) => exercise.name),
    );
    expect(names.length).toBeGreaterThan(0);

    const selected = await models.Exercise.find({ nameVi: { $in: names } }).lean();
    expect(selected).toHaveLength(names.length);
    for (const exercise of selected) {
      expect(exercise.equipment).toContain('bodyweight');
    }
  });

  it('thư viện báo đúng tổng số khi có hơn 100 bản ghi', async () => {
    const paper = await models.Paper.create({
      userId,
      title: 'Bài kiểm tra thống kê thư viện',
      doi: '10.9999/api-test',
    });

    const docs = Array.from({ length: 101 }, (_, index) => ({
      userId,
      paperId: paper._id,
      inputType: 'doi',
      basedOn: 'abstract_only',
      content: {
        metadata: { title: `Bài ${index}` },
        tldr: `Tóm tắt ${index}`,
        mainResults: [],
        confidence: { basedOn: 'abstract_only', missingInfo: [] },
      },
      status: 'ready',
      cacheKey: `api-test-${index}`,
      isFavorite: index < 3,
    }));
    await models.Summary.insertMany(docs);

    const res = await agent.get('/api/summaries').expect(200);
    expect(res.body.data.stats.total).toBe(101);
    expect(res.body.data.stats.favorites).toBe(3);
    expect(res.body.data.summaries).toHaveLength(100);
    expect(res.body.data.page.hasMore).toBe(true);

    const search = await agent.get('/api/summaries?q=B%C3%A0i%20100').expect(200);
    expect(search.body.data.stats.filtered).toBe(1);
    expect(search.body.data.summaries).toHaveLength(1);

    const target = search.body.data.summaries[0];
    const patched = await agent
      .patch(`/api/summaries/${target.id}`)
      .send({ tags: ['hypertrophy'], isFavorite: true })
      .expect(200);
    expect(patched.body.data.summary.tags).toContain('hypertrophy');

    const favorites = await agent.get('/api/summaries?favorite=true').expect(200);
    expect(favorites.body.data.summaries).toHaveLength(4);

    const nextPage = await agent.get('/api/summaries?limit=10&offset=100').expect(200);
    expect(nextPage.body.data.summaries).toHaveLength(1);
    expect(nextPage.body.data.page.hasMore).toBe(false);

    await agent.get('/api/summaries?limit=101').expect(400);
  });

  it('xóa tài khoản dọn sạch ảnh, PDF và dữ liệu DB', async () => {
    agentTwo = request.agent(app);
    const created = await agentTwo
      .post('/api/auth/register')
      .send({
        name: 'Người Dùng Xóa',
        email: 'delete-test@example.com',
        password: 'mat-khau-rat-dai-456',
      })
      .expect(201);
    const userIdTwo = created.body.data.user._id;

    const photoName = `test-${crypto.randomUUID()}.jpg`;
    const mealName = `test-${crypto.randomUUID()}.png`;
    const assessmentName = `test-${crypto.randomUUID()}.webp`;
    const photoPath = await writeTempFile(
      dirs.PHOTO_DIR,
      photoName,
      Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
    );
    const mealPath = await writeTempFile(
      dirs.MEAL_IMAGE_DIR,
      mealName,
      Buffer.from([0x89, 0x50, 0x4e, 0x47]),
    );
    const assessmentPath = await writeTempFile(
      dirs.ASSESSMENT_IMAGE_DIR,
      assessmentName,
      Buffer.from('RIFF0000WEBP'),
    );

    const pdfHash = crypto.randomBytes(32).toString('hex');
    const pdfPath = pdfPathForHash(pdfHash);
    await writeTempFile(path.dirname(pdfPath), path.basename(pdfPath), '%PDF-1.4 test');

    await models.BodyLog.create({
      userId: userIdTwo,
      date: new Date('2026-11-11T00:00:00.000Z'),
      dateKey: '2026-11-11',
      weightKg: 70,
      photos: [{ filename: photoName }],
    });
    await models.Meal.create({
      userId: userIdTwo,
      dateKey: '2026-11-11',
      image: { filename: mealName },
      analysis: { totals: { calories: 500, proteinG: 30, carbsG: 40, fatG: 15 } },
    });
    await models.BodyAssessment.create({
      userId: userIdTwo,
      dateKey: '2026-11-11',
      images: [{ filename: assessmentName, view: 'front' }],
      analysis: { overall: 'test' },
    });
    const paper = await models.Paper.create({
      userId: userIdTwo,
      title: 'Bài có PDF',
      doi: '10.9999/delete-test',
    });
    await models.Summary.create({
      userId: userIdTwo,
      paperId: paper._id,
      inputType: 'pdf',
      basedOn: 'fulltext',
      content: { metadata: { title: 'Bài có PDF' }, tldr: 'x', mainResults: [] },
      status: 'ready',
      pdfHash,
      cacheKey: 'delete-test',
    });

    await agentTwo.delete('/api/me').expect(200);

    expect(await models.User.findById(userIdTwo)).toBeNull();
    expect(await models.BodyLog.countDocuments({ userId: userIdTwo })).toBe(0);
    expect(await models.Meal.countDocuments({ userId: userIdTwo })).toBe(0);
    expect(await models.BodyAssessment.countDocuments({ userId: userIdTwo })).toBe(0);
    expect(await models.Summary.countDocuments({ userId: userIdTwo })).toBe(0);

    await expect(fs.access(photoPath)).rejects.toThrow();
    await expect(fs.access(mealPath)).rejects.toThrow();
    await expect(fs.access(assessmentPath)).rejects.toThrow();
    await expect(fs.access(pdfPath)).rejects.toThrow();
  });
});
