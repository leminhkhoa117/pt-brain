import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

process.env.NODE_ENV = 'test';

const DB_NAME = `pt-brain-auth-security-${process.pid}-${Date.now()}`;
const DB_URI = `mongodb://127.0.0.1:27017/${DB_NAME}`;

let app;
let mongoose;
let User;

const password = 'MatKhauCu1234';
const newPassword = 'MatKhauMoi5678';

function cookieHeader(response) {
  const cookies = response.headers['set-cookie'] || [];
  return cookies.map((item) => item.split(';')[0]).join('; ');
}

function register(agent, email, overrides = {}) {
  return agent
    .post('/api/auth/register')
    .send({ name: 'Security Test', email, password, ...overrides });
}

beforeAll(async () => {
  const { connectDb } = await import('../src/config/db.js');
  await connectDb(DB_URI);
  mongoose = (await import('mongoose')).default;
  ({ User } = await import('../src/models/User.js'));
  const { createApp } = await import('../src/app.js');
  app = createApp();
});

afterAll(async () => {
  if (mongoose) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

describe('auth security', () => {
  it('công bố provider Google và không lộ cấu hình bí mật', async () => {
    const res = await request(app).get('/api/auth/providers').expect(200);
    expect(res.body.data).toHaveProperty('google');
    expect(JSON.stringify(res.body)).not.toContain('GOOGLE_CLIENT_SECRET');
  });

  it('chặn request ghi từ Origin lạ (CSRF)', async () => {
    await request(app)
      .post('/api/auth/login')
      .set('Origin', 'https://evil.example')
      .send({ email: 'nobody@example.com', password: 'whatever123' })
      .expect(403);
  });

  it('remember=false tạo cookie phiên, remember=true tạo cookie có hạn', async () => {
    const sessionAgent = request.agent(app);
    const sessionRes = await register(sessionAgent, 'remember-false@example.com', {
      remember: false,
    });
    expect(sessionRes.status).toBe(201);
    const sessionCookies = sessionRes.headers['set-cookie'] || [];
    expect(sessionCookies.some((cookie) => /Max-Age|Expires/i.test(cookie))).toBe(false);

    const persistentAgent = request.agent(app);
    const persistentRes = await register(persistentAgent, 'remember-true@example.com', {
      remember: true,
    });
    expect(persistentRes.status).toBe(201);
    const persistentCookies = persistentRes.headers['set-cookie'] || [];
    expect(persistentCookies.some((cookie) => /Max-Age/i.test(cookie))).toBe(true);
  });

  it('khóa tạm tài khoản sau nhiều lần sai mật khẩu', async () => {
    const agent = request.agent(app);
    await register(agent, 'lockout@example.com').expect(201);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await agent
        .post('/api/auth/login')
        .send({ email: 'lockout@example.com', password: 'SaiMatKhau123' })
        .expect(401);
    }
    const locked = await agent
      .post('/api/auth/login')
      .send({ email: 'lockout@example.com', password })
      .expect(401);
    expect(locked.body.error.message).toBe('Email hoặc mật khẩu không đúng');

    const stored = await User.findOne({ email: 'lockout@example.com' }).select('+lockedUntil');
    expect(stored.lockedUntil.getTime()).toBeGreaterThan(Date.now());
  });

  it('đổi mật khẩu thu hồi access token của thiết bị khác ngay lập tức', async () => {
    const deviceA = request.agent(app);
    await register(deviceA, 'change-password@example.com').expect(201);
    const loginB = await request(app)
      .post('/api/auth/login')
      .send({ email: 'change-password@example.com', password })
      .expect(200);
    const cookieB = cookieHeader(loginB);
    await request(app).get('/api/me').set('Cookie', cookieB).expect(200);

    await deviceA
      .post('/api/me/password')
      .send({ currentPassword: 'SaiHienTai123', newPassword })
      .expect(400);

    const changed = await deviceA
      .post('/api/me/password')
      .send({ currentPassword: password, newPassword })
      .expect(200);
    expect(changed.body.data.user.hasPassword).toBe(true);

    // Phiên B bị xóa -> access token cũ hết hiệu lực ngay, không chờ 15 phút.
    await request(app).get('/api/me').set('Cookie', cookieB).expect(401);

    await request(app)
      .post('/api/auth/login')
      .send({ email: 'change-password@example.com', password })
      .expect(401);
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'change-password@example.com', password: newPassword })
      .expect(200);
  });

  it('liệt kê và thu hồi phiên thiết bị', async () => {
    const primary = request.agent(app);
    await register(primary, 'sessions@example.com').expect(201);
    const second = await request(app)
      .post('/api/auth/login')
      .send({ email: 'sessions@example.com', password })
      .expect(200);
    const secondCookie = cookieHeader(second);

    const list = await primary.get('/api/me/sessions').expect(200);
    expect(list.body.data.sessions.length).toBeGreaterThanOrEqual(2);
    const current = list.body.data.sessions.find((session) => session.current);
    expect(current).toBeTruthy();
    const other = list.body.data.sessions.find((session) => !session.current);
    expect(other.id).toBeTruthy();

    await primary.delete(`/api/me/sessions/${other.id}`).expect(200);
    await request(app).get('/api/me').set('Cookie', secondCookie).expect(401);

    const after = await primary.get('/api/me/sessions').expect(200);
    expect(after.body.data.sessions).toHaveLength(1);
  });

  it('đặt lại mật khẩu bằng token một lần, đăng xuất mọi phiên', async () => {
    const agent = request.agent(app);
    await register(agent, 'reset-password@example.com').expect(201);

    const forgot = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'reset-password@example.com' })
      .expect(200);
    const resetUrl = forgot.body.data.devResetUrl;
    expect(resetUrl).toBeTruthy();
    const token = new URL(resetUrl).searchParams.get('token');
    expect(token).toBeTruthy();

    await request(app)
      .post('/api/auth/reset-password')
      .send({ token, newPassword })
      .expect(200);

    await request(app)
      .post('/api/auth/reset-password')
      .send({ token, newPassword: 'MatKhauKhac9999' })
      .expect(400);

    await request(app)
      .post('/api/auth/login')
      .send({ email: 'reset-password@example.com', password })
      .expect(401);
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'reset-password@example.com', password: newPassword })
      .expect(200);
  });

  it('không cho đăng nhập mật khẩu với tài khoản Google-only', async () => {
    await User.create({
      email: 'google-only@example.com',
      name: 'Google Only',
      googleId: 'google-sub-test',
      googleLinked: true,
      emailVerified: true,
      hasPassword: false,
    });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'google-only@example.com', password: 'BatKyMatKhau123' })
      .expect(401);
    expect(res.body.error.message).toBe('Email hoặc mật khẩu không đúng');
  });

  it('xóa tài khoản yêu cầu mật khẩu xác nhận', async () => {
    const agent = request.agent(app);
    await register(agent, 'delete-account@example.com').expect(201);
    await agent.delete('/api/me').expect(400);
    await agent.delete('/api/me').send({ password: 'SaiMatKhau123' }).expect(400);
    await agent.delete('/api/me').send({ password }).expect(200);
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'delete-account@example.com', password })
      .expect(401);
  });
});
