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
  MONGO_URI: z.string().default('mongodb://127.0.0.1:27017/pt-brain'),

  JWT_ACCESS_SECRET: z.string().min(16).default('dev-access-secret-change-me'),
  JWT_REFRESH_SECRET: z.string().min(16).default('dev-refresh-secret-change-me'),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),

  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  COOKIE_SECURE: boolFromEnv,
  SERVE_CLIENT: boolFromEnv,

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
