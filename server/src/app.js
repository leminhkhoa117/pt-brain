import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { generalLimiter } from './middleware/rateLimit.js';
import { csrfGuard } from './middleware/csrf.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import routes from './routes/index.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', env.TRUST_PROXY);
  app.disable('x-powered-by');
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          // Avatar Google (nếu hiển thị) và ảnh xem trước dạng blob.
          'img-src': ["'self'", 'data:', 'blob:', 'https://*.googleusercontent.com'],
          'connect-src': ["'self'"],
          'frame-ancestors': ["'none'"],
        },
      },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN.split(',').map((s) => s.trim().replace(/\/$/, '')),
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser());
  app.use('/api', csrfGuard);
  if (env.NODE_ENV !== 'test') {
    app.use(
      pinoHttp({
        logger,
        autoLogging: { ignore: (req) => req.url === '/api/health' },
        // Không log header/cookie để tránh lộ JWT trong log
        serializers: {
          req(req) {
            return {
              id: req.id,
              method: req.method,
              // Không ghi token đặt lại mật khẩu / OAuth code vào log.
              url: String(req.url || '').replace(
                /([?&](token|code|state)=)[^&]*/gi,
                '$1[redacted]',
              ),
              remoteAddress: req.remoteAddress,
            };
          },
          res(res) {
            return { statusCode: res.statusCode };
          },
        },
      }),
    );
  }

  app.use('/api', generalLimiter, routes);

  // Production: server phục vụ luôn client đã build (SERVE_CLIENT=true)
  if (env.SERVE_CLIENT) {
    const clientDist = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      '../../client/dist',
    );
    // Asset Vite có hash trong tên → cache dài, không cần revalidate.
    app.use(
      '/assets',
      express.static(path.join(clientDist, 'assets'), { immutable: true, maxAge: '1y' }),
    );
    // Model 3D nặng và không đổi tên; cache mạnh sau lần tải đầu.
    app.use(
      '/models',
      express.static(path.join(clientDist, 'models'), { immutable: true, maxAge: '1y' }),
    );
    app.use('/curriculum', express.static(path.join(clientDist, 'curriculum'), { maxAge: '1d' }));
    app.use(
      express.static(clientDist, {
        index: false,
        maxAge: 0,
        setHeaders(res, filePath) {
          // Service worker phải được kiểm tra lại mỗi lần để nhận bản mới.
          if (path.basename(filePath) === 'sw.js') {
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      }),
    );
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.set('Cache-Control', 'no-cache');
      return res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export default createApp;
