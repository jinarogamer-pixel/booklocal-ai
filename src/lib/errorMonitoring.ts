// Enhanced error monitoring system with Sentry integration
import * as Sentry from '@sentry/nextjs';

// Initialize Sentry (this should be called once in your app)
export function initErrorMonitoring() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      // Performance monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      // Release tracking
      release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
      // Error filtering
      beforeSend(event) {
        // Filter out development errors
        if (process.env.NODE_ENV === 'development') {
          console.log('Sentry Event:', event);
        }
        return event;
      },
    });
  }
}

/**
 * Capture an error with context
 */
export function captureError(error: Error, context?: Record<string, unknown>): void {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext('errorContext', context);
      }
      Sentry.captureException(error);
    });
  } else {
    console.error('Error captured:', error, context);
  }
}

/**
 * Measure performance of a function
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  return Sentry.startSpan({ name }, () => {
    try {
      const result = fn();
      return result;
    } catch (error) {
      throw error;
    }
  });
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, data?: Record<string, unknown>): void {
  Sentry.addBreadcrumb({
    message,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Set user context
 */
export function setUserContext(user: { id: string; email?: string; username?: string }): void {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

/**
 * Set tags for filtering
 */
export function setTags(tags: Record<string, string>): void {
  Sentry.setTags(tags);
}

/**
 * Capture a message
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  Sentry.captureMessage(message, level);
}
