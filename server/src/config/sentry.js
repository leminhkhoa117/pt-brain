import { env } from './env.js';

let sentry = null;

/**
 * Opt-in: chỉ tải @sentry/node khi có SENTRY_DSN. Không cấu hình thì mọi hàm
 * capture đều là no-op, tránh gửi dữ liệu sức khỏe ra ngoài ngoài ý muốn.
 */
export async function initSentry() {
  if (!env.SENTRY_DSN) return false;
  sentry = await import('@sentry/node');
  sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.SENTRY_ENVIRONMENT || env.NODE_ENV,
    tracesSampleRate: env.SENTRY_TRACES_SAMPLE_RATE,
  });
  return true;
}

export function captureException(error, extra) {
  if (!sentry) return;
  sentry.captureException(error, extra ? { extra } : undefined);
}
