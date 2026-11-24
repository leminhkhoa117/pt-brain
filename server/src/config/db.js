import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export async function connectDb(uri = env.MONGO_URI) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });

  // Migration nhẹ, idempotent cho tài khoản tạo trước khi có cột hasPassword/
  // googleLinked. Chạy mỗi lần khởi động nhưng chỉ update document còn thiếu.
  const { User } = await import('../models/User.js');
  await User.updateMany(
    { passwordHash: { $exists: true }, hasPassword: { $ne: true } },
    { $set: { hasPassword: true } },
  ).catch(() => {});
  await User.updateMany(
    { googleId: { $exists: true }, googleLinked: { $ne: true } },
    { $set: { googleLinked: true } },
  ).catch(() => {});

  logger.info({ db: mongoose.connection.name }, 'MongoDB connected');
  return mongoose.connection;
}


export async function disconnectDb() {
  await mongoose.disconnect();
}
