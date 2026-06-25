import mongoose from 'mongoose';
import { env } from '../config/env';

export async function connectDB(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log('Connected to MongoDB');
}
