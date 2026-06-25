import path from 'path';
import { z } from 'zod';
import dotenv from 'dotenv';
import { parseCorsOrigins } from './cors';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  OPENAI_API_KEY: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const data = parsed.data;

export const env = {
  ...data,
  corsOrigins: parseCorsOrigins(data.CORS_ORIGIN),
};

if (!env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY is not set — itinerary generation will be unavailable');
}

if (!env.GOOGLE_CLIENT_ID) {
  console.warn('Warning: GOOGLE_CLIENT_ID is not set — Google login will be unavailable');
}
