import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { isCorsOriginAllowed } from './config/cors';
import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes';
import tripRoutes from './routes/trip.routes';
import shareRoutes from './routes/share.routes';
import { errorHandler } from './middleware/errorHandler';
import { generalApiLimiter } from './middleware/rateLimit';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      callback(null, isCorsOriginAllowed(origin, env.corsOrigins));
    },
    credentials: true,
  })
);
app.use(express.json());

app.use('/api', generalApiLimiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/share', shareRoutes);

app.use(errorHandler);

async function start(): Promise<void> {
  await connectDB();
  app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
