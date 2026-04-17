import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

// Load from root .env (monorepo), then fallback to local
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

function getOrGenerateSecret(envName: string): string {
  const existing = process.env[envName];
  if (existing) return existing;
  const generated = crypto.randomBytes(48).toString('hex');
  process.env[envName] = generated;
  console.warn(`${envName} not set — auto-generated for this session. Set it in env to persist across restarts.`);
  return generated;
}

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/apimocker-ai',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim())
    : ['http://localhost:4002'],
  jwtAccessSecret: getOrGenerateSecret('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: getOrGenerateSecret('JWT_REFRESH_SECRET'),
  jwtAccessTtl: process.env.JWT_ACCESS_TTL || '60m',
  jwtRefreshTtl: process.env.JWT_REFRESH_TTL || '7d',
};
