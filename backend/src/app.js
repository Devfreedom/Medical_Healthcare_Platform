import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import appointmentsRoutes from './routes/appointments.js';
import messagesRoutes from './routes/messages.js';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin / non-browser clients with no Origin header.
      if (!origin) return callback(null, true);
      if (env.clientOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('CORS origin not allowed.'));
    },
  }),
);

app.use(express.json({ limit: '100kb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Try again later.' },
});

app.use('/api/auth', authLimiter);

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/messages', messagesRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
