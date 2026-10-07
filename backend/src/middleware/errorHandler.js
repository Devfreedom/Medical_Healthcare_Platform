import { env } from '../config/env.js';

// Centralized error handler. Never leak stack traces in production.
export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const status = Number(error.status || error.statusCode || 500);
  const message = status === 500 ? 'Something went wrong.' : error.message || 'Request failed.';

  if (!env.isProduction) {
    // eslint-disable-next-line no-console
    console.error(error);
  }

  return res.status(status).json({ message });
}

export function notFound(req, res) {
  return res.status(404).json({ message: 'Not found.' });
}
