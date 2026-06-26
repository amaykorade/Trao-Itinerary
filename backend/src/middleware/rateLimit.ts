import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { env } from '../config/env';
import { AuthRequest } from './auth';

const isDev = env.NODE_ENV === 'development';

function userOrIpKey(req: AuthRequest): string {
  if (req.user?.id) {
    return req.user.id;
  }
  return ipKeyGenerator(req.ip ?? 'unknown');
}

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,
  message: { error: 'Too many auth attempts. Please try again in a few minutes.' },
});

export const aiGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,
  keyGenerator: userOrIpKey,
  message: {
    error: 'AI generation limit reached. You can create or regenerate up to 15 itineraries per hour.',
  },
});

export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,
  keyGenerator: userOrIpKey,
  message: { error: 'Too many requests. Please slow down and try again.' },
});
