import * as Sentry from '@sentry/nextjs';

// Initialize Sentry only when a server-side DSN is provided.
// Use the secret SENTRY_DSN on the server and keep tracing disabled in development.
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0,
    environment: process.env.NODE_ENV,
  });
}
