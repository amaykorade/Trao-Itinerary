import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import { env } from '../config/env';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { SafeUser, toSafeUser } from '../types/auth';

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = '7d';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function registerUser(input: unknown): Promise<{ user: SafeUser; token: string }> {
  const data = registerSchema.parse(input);

  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    if (existing.googleId && !existing.passwordHash) {
      throw new AppError(409, 'An account with this email exists. Sign in with Google instead.');
    }
    throw new AppError(409, 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const user = await User.create({
    email: data.email.toLowerCase(),
    passwordHash,
    name: data.name,
  });

  const token = signToken(user._id.toString());
  return { user: toSafeUser(user), token };
}

export async function loginUser(input: unknown): Promise<{ user: SafeUser; token: string }> {
  const data = loginSchema.parse(input);

  const user = await User.findOne({ email: data.email.toLowerCase() });
  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  if (!user.passwordHash) {
    throw new AppError(401, 'This account uses Google sign-in. Please continue with Google.');
  }

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, 'Invalid email or password');
  }

  const token = signToken(user._id.toString());
  return { user: toSafeUser(user), token };
}

const googleAuthSchema = z.object({
  credential: z.string().min(1, 'Google credential is required'),
});

export async function googleAuthUser(
  input: unknown
): Promise<{ user: SafeUser; token: string }> {
  const data = googleAuthSchema.parse(input);
  const profile = await verifyGoogleToken(data.credential);

  let user = await User.findOne({ googleId: profile.googleId });

  if (!user) {
    user = await User.findOne({ email: profile.email });

    if (user) {
      if (user.googleId && user.googleId !== profile.googleId) {
        throw new AppError(409, 'This email is linked to a different Google account');
      }
      user.googleId = profile.googleId;
      if (!user.name && profile.name) user.name = profile.name;
      await user.save();
    } else {
      user = await User.create({
        email: profile.email,
        googleId: profile.googleId,
        name: profile.name,
      });
    }
  }

  const token = signToken(user._id.toString());
  return { user: toSafeUser(user), token };
}

async function verifyGoogleToken(credential: string): Promise<{
  googleId: string;
  email: string;
  name: string;
}> {
  if (!env.GOOGLE_CLIENT_ID) {
    throw new AppError(503, 'Google sign-in is not configured');
  }

  const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) {
      throw new AppError(401, 'Invalid Google token');
    }

    if (!payload.email_verified) {
      throw new AppError(401, 'Google email is not verified');
    }

    return {
      googleId: payload.sub,
      email: payload.email.toLowerCase(),
      name: payload.name || payload.email.split('@')[0],
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(401, 'Invalid or expired Google token');
  }
}

export async function getUserById(userId: string): Promise<SafeUser> {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  return toSafeUser(user);
}

function signToken(userId: string): string {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}
