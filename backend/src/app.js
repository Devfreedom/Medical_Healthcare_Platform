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

// Render terminates TLS and forwards to this service, so every request arrives
// from the proxy rather than the patient. Trust exactly one hop so `req.ip`
// resolves to the real client from X-Forwarded-For and the rate limiters count
// per person. This must stay a number: `true` would let any client spoof that
// header and bypass the limits entirely.
app.set('trust proxy', 1);

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

// Credential endpoints get their own, much lower budgets than the general auth
// router. These are comfortably above normal use but still bound online
// guessing; the shared limiters below keep a hard ceiling.
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Try again later.' },
});

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many sign-in attempts. Try again in a few minutes.' },
});

const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many accounts created from this address. Try again later.' },
});

app.use('/api/auth/login', loginRateLimiter);
app.use('/api/auth/register', registerRateLimiter);
app.use('/api/auth', authRateLimiter);

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/messages', messagesRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
