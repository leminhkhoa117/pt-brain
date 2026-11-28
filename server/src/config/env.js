import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

const here = path.dirname(fileURLToPath(import.meta.url));
// Ưu tiên .env ở root repo, sau đó .env riêng của server
dotenv.config({ path: path.resolve(here, '../../../.env') });
dotenv.config({ path: path.resolve(here, '../../.env') });

const boolFromEnv = z
  .enum(['true', 'false'])
  .default('false')
  .transform((v) => v === 'true');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z.string().default('info'),
  // Số hop reverse proxy tin cậy. 0 khi chạy trực tiếp (Docker/local), 1 trên Render.
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  MONGO_URI: z.string().default('mongodb://127.0.0.1:27017/pt-brain'),

  // ===== Monitoring (tùy chọn) =====
  SENTRY_DSN: z.string().trim().optional().default(''),
  SENTRY_ENVIRONMENT: z.string().trim().optional().default(''),
  SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0),

  JWT_ACCESS_SECRET: z.string().min(16).default('dev-access-secret-change-me'),
  JWT_REFRESH_SECRET: z.string().min(16).default('dev-refresh-secret-change-me'),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
  // Phiên không chọn "ghi nhớ đăng nhập": cookie phiên + refresh token ngắn hơn.
  SESSION_REFRESH_TTL_HOURS: z.coerce.number().int().positive().default(24),

  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  APP_PUBLIC_URL: z.string().url().optional().or(z.literal('')),
  COOKIE_SECURE: boolFromEnv,
  SERVE_CLIENT: boolFromEnv,

  // ===== Google OAuth =====
  // Tạo OAuth client tại https://console.cloud.google.com/apis/credentials
  // Authorized redirect URI: <CLIENT_ORIGIN>/api/auth/google/callback
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
  GOOGLE_REDIRECT_URI: z.string().url().optional().or(z.literal('')),

  // ===== Email đặt lại mật khẩu =====
  // Nếu có RESEND_API_KEY thì gửi email thật; nếu không, link chỉ được log ở server
  // (và trả về trong response ở môi trường development/test để test được).
  RESEND_API_KEY: z.string().optional().default(''),
  MAIL_FROM: z.string().default('PT Brain <no-reply@ptbrain.local>'),
  PASSWORD_RESET_TTL_MINUTES: z.coerce.number().int().positive().default(30),

  // 'disk' cho local; 'mongo' (GridFS) cho Render free không có ổ đĩa persistent
  STORAGE_DRIVER: z.enum(['disk', 'mongo']).default('disk'),

  AI_PROVIDER: z.string().default('opencode-go'),
  AI_BASE_URL: z.string().url().default('https://opencode.ai/inference/go/openai/v1'),
  AI_API_KEY: z.string().optional().default(''),
  AI_MODEL: z.string().default('deepseek-v4.1-flash'),
  AI_VISION_MODEL: z.string().default('gemini-4-argon'),
  AI_TIMEOUT_MS: z.coerce.number().int().positive().default(180000),
  AI_DAILY_LIMIT_PER_USER: z.coerce.number().int().positive().default(30),

  // Email liên hệ cho Crossref/Unpaywall (polite pool) và User-Agent
  CONTACT_EMAIL: z.string().email().default('dev@example.com'),
  PDF_MAX_MB: z.coerce.number().int().positive().max(100).default(20),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Biến môi trường không hợp lệ:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

if (env.NODE_ENV === 'production') {
  if (env.JWT_ACCESS_SECRET.includes('change-me') || env.JWT_REFRESH_SECRET.includes('change-me')) {
    console.error('❌ Production yêu cầu JWT_ACCESS_SECRET / JWT_REFRESH_SECRET thật (không dùng giá trị mặc định).');
    process.exit(1);
  }
}
