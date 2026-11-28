let sentry = null;
let loading = null;

/**
 * Opt-in: chỉ tải @sentry/react khi có VITE_SENTRY_DSN. Chunk Sentry được tách
 * riêng, không nằm trong bundle khởi động.
 */
export function initClientMonitoring() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn || loading) return loading;

  loading = import('@sentry/react')
    .then((module) => {
      module.init({
        dsn,
        environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE,
        tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || 0),
      });
      sentry = module;
    })
    .catch(() => {});

  return loading;
}

export function captureClientException(error, extra) {
  if (!sentry) return;
  sentry.captureException(error, extra ? { extra } : undefined);
}
