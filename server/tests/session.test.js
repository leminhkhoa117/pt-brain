import { afterAll, beforeAll, describe, expect, it } from 'vitest';

process.env.NODE_ENV = 'test';

const DB_NAME = `pt-brain-session-test-${process.pid}-${Date.now()}`;
const DB_URI = `mongodb://127.0.0.1:27017/${DB_NAME}`;

let mongoose;
let User;
let Session;
let authService;
let verifyRefreshToken;
let user;

const creds = { email: 'session-test@example.com', password: 'SessionTest123!' };
const sidOf = (token) => verifyRefreshToken(token).sid;

beforeAll(async () => {
  const { connectDb } = await import('../src/config/db.js');
  await connectDb(DB_URI);
  mongoose = (await import('mongoose')).default;
  User = (await import('../src/models/User.js')).User;
  Session = (await import('../src/models/Session.js')).Session;
  authService = await import('../src/services/authService.js');
  ({ verifyRefreshToken } = await import('../src/services/tokens.js'));

  user = new User({
    email: creds.email,
    name: 'Session Test',
    onboardingRequired: false,
  });
  await user.setPassword(creds.password);
  await user.save();
});

afterAll(async () => {
  if (mongoose) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

describe('multi-device sessions', () => {
  it('đăng nhập máy tính và điện thoại không đá phiên của nhau', async () => {
    const desktop = await authService.loginUser(creds, { userAgent: 'Desktop' });
    const phone = await authService.loginUser(creds, { userAgent: 'Phone' });

    expect(sidOf(desktop.refreshToken)).not.toBe(sidOf(phone.refreshToken));

    const desktop2 = await authService.rotateSession(desktop.refreshToken);
    const phone2 = await authService.rotateSession(phone.refreshToken);
    expect(desktop2.refreshToken).toBeTruthy();
    expect(phone2.refreshToken).toBeTruthy();
  });

  it('token vừa xoay vẫn dùng được trong cửa sổ ân hạn của cùng thiết bị', async () => {
    const device = await authService.loginUser(creds, { userAgent: 'Tablet' });
    const second = await authService.rotateSession(device.refreshToken);
    // Tab thứ hai vẫn cầm token cũ và refresh ngay sau đó
    const third = await authService.rotateSession(device.refreshToken);
    expect(third.refreshToken).toBeTruthy();
    // Token của tab đầu vừa thành "prev" sau lượt của tab hai, vẫn dùng được
    const fourth = await authService.rotateSession(second.refreshToken);
    expect(fourth.refreshToken).toBeTruthy();
  });

  it('token cũ sau ân hạn chỉ thu hồi đúng phiên đó, thiết bị khác vẫn sống', async () => {
    const deviceA = await authService.loginUser(creds, { userAgent: 'A' });
    const deviceB = await authService.loginUser(creds, { userAgent: 'B' });
    const sidA = sidOf(deviceA.refreshToken);

    const a2 = await authService.rotateSession(deviceA.refreshToken);
    await Session.updateOne({ _id: sidA }, { $set: { prevTokenExpiresAt: new Date(Date.now() - 1000) } });

    await expect(authService.rotateSession(deviceA.refreshToken)).rejects.toThrow();
    await expect(authService.rotateSession(a2.refreshToken)).rejects.toThrow();
    await expect(Session.findById(sidA)).resolves.toBeNull();

    const b2 = await authService.rotateSession(deviceB.refreshToken);
    expect(b2.refreshToken).toBeTruthy();
  });

  it('đăng xuất ở một thiết bị không làm mất phiên thiết bị còn lại', async () => {
    const first = await authService.loginUser(creds, { userAgent: 'First' });
    const second = await authService.loginUser(creds, { userAgent: 'Second' });

    await authService.logoutUser(sidOf(first.refreshToken), user._id);

    await expect(authService.rotateSession(first.refreshToken)).rejects.toThrow();
    const alive = await authService.rotateSession(second.refreshToken);
    expect(alive.refreshToken).toBeTruthy();
  });
});
