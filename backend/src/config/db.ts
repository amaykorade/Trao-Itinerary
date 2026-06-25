import mongoose from 'mongoose';
import { env } from '../config/env';
import { Trip } from '../models/Trip';

async function migrateTripShareTokenIndex(): Promise<void> {
  const collection = mongoose.connection.collection('trips');

  try {
    const indexes = await collection.indexes();
    const legacyShareIndex = indexes.find(
      (idx) => idx.key?.shareToken === 1 && !idx.partialFilterExpression
    );
    if (legacyShareIndex?.name) {
      await collection.dropIndex(legacyShareIndex.name);
      console.log('Dropped legacy shareToken index');
    }
  } catch (err) {
    console.warn('Could not drop legacy shareToken index:', err);
  }

  await Trip.updateMany(
    { $or: [{ shareToken: null }, { shareToken: '' }] },
    { $unset: { shareToken: '' } }
  );

  await Trip.syncIndexes();
}

export async function connectDB(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log('Connected to MongoDB');
  await migrateTripShareTokenIndex();
}
