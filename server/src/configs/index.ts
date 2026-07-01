// src/config/index.ts
import dotenv from 'dotenv';
import path from 'path';

// Критичные секреты. Без них сервер не должен стартовать — никаких
// захардкоженных фоллбэков (это болванка под форки).
const REQUIRED_SECRETS = ['JWT_SECRET', 'COOKIE_SECRET'] as const;

export const initEnv = () => {
  // Локально (pnpm run dev / pnpm start) подгружаем .env из корня монорепы.
  // cwd = server/ при обоих запусках, поэтому .env лежит на уровень выше.
  // В докере env уже инжектится через env_file — dotenv не перезаписывает
  // существующие переменные, так что отсутствие файла там безвредно.
  dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

  // Fail-fast: падаем на старте, если хоть один секрет не задан.
  const missing = REQUIRED_SECRETS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required env: ${missing.join(', ')}`);
  }
};