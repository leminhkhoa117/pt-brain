import { createApp } from './app.js';
import { connectDb, disconnectDb } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { resumeInterruptedSummaries } from './services/research/reader.js';

async function main() {
  await connectDb();
  const resumed = await resumeInterruptedSummaries().catch((error) => {
    logger.warn({ err: error }, 'Không khôi phục được job tóm tắt sau khởi động lại');
    return { resumed: 0, failed: 0 };
  });
  if (resumed.resumed) {
    logger.info({ count: resumed.resumed }, 'Đã khôi phục job tóm tắt sau khởi động lại');
  }
  if (resumed.failed) {
    logger.warn({ count: resumed.failed }, 'Một số job tóm tắt không thể khôi phục, đã đánh dấu failed');
  }
  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`✅ PT Brain API đang chạy tại http://localhost:${env.PORT}/api`);
  });

  const shutdown = async (signal) => {
    logger.info({ signal }, 'Đang tắt server...');
    server.close(async () => {
      await disconnectDb();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', (err) => {
    logger.error({ err }, 'Unhandled promise rejection');
  });
  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught exception, thoát process');
    process.exit(1);
  });
}

main().catch((err) => {
  logger.error({ err }, 'Không khởi động được server');
  process.exit(1);
});
