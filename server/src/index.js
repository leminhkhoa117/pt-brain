import { createApp } from './app.js';
import { connectDb, disconnectDb } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { markStaleSummariesFailed } from './services/research/reader.js';

async function main() {
  await connectDb();
  const stale = await markStaleSummariesFailed(30).catch(() => 0);
  if (stale) logger.warn({ count: stale }, 'Đã đánh dấu các job tóm tắt bị kẹt là failed');
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
}

main().catch((err) => {
  logger.error({ err }, 'Không khởi động được server');
  process.exit(1);
});
