1// Example error monitoring abstraction (Sentry, etc.)
//
// 1. Integrate with a real monitoring provider:
//    - For Sentry, set NEXT_PUBLIC_SENTRY_DSN in your .env file for frontend, and SENTRY_DSN for backend.
//    - Initialize Sentry in _app.tsx (frontend) and in your API handler (backend) as needed.
//    - See: https://docs.sentry.io/platforms/javascript/guides/nextjs/

/**
 * Capture and report errors to your monitoring provider (e.g., Sentry).
 * Always logs to console in development. Optionally add user/session context.
 * Supports async error reporting and returns eventId if available.
 * @param error - The error object or message
 * @param context - Additional context (user, request, etc)
 * @returns eventId (if available from Sentry or backend), else undefined
 */
/**
 * Capture and report errors to your monitoring provider (e.g., Sentry).
 * Always logs to console in development. Optionally add user/session context.
 * Supports async error reporting and returns eventId if available.
 *
 * Security: Sensitive fields (e.g., password, token) are redacted before sending.
 *
 * Usage:
 *   const eventId = await captureError(err, { user: { id, email }, ...context });
 *   // Optionally show eventId to user for support reference
 *
 * Observability: Set up dashboards/alerts in your Sentry or provider dashboard for critical errors.
 *
 * @param error - The error object or message
 * @param context - Additional context (user, request, etc)
 * @param fingerprint - Optional array for error fingerprinting
 * @returns eventId (if available from Sentry or backend), else undefined
 */
export async function captureError(
  error: unknown,
  context?: Record<string, unknown> & { user?: { id?: string; email?: string } },
  fingerprint?: string[]
): Promise<string | undefined> {
  // Handle undefined/null errors by creating a meaningful error object
  if (error === undefined || error === null) {
    error = new Error(`Undefined/null error captured. Context: ${JSON.stringify(context || {})}`);
    if (!fingerprint) {
      fingerprint = ['undefined-error'];
    }
  }
  // 5. Security & privacy: redact sensitive fields
  function redact(obj: Record<string, unknown>): Record<string, unknown> {
    if (!obj || typeof obj !== 'object') return obj;
    const SENSITIVE = ['password', 'token', 'accessToken', 'refreshToken', 'secret'];
    return Object.fromEntries(Object.entries(obj).map(([k, v]) =>
      SENSITIVE.includes(k) ? [k, '[REDACTED]'] : [k, typeof v === 'object' ? redact(v as Record<string, unknown>) : v]
    ));
  }
  if (context) context = redact(context);
  const isProd = process.env.NODE_ENV === "production";
  // Always log to console in dev
  if (!isProd) {
    console.error("[DEV] Captured error:", error, context);
    return;
  }

  // In production, try Sentry (browser)
  if (isProd && typeof window !== "undefined" && typeof (window as unknown as { Sentry?: { captureException: (error: unknown, context?: Record<string, unknown>) => string } }).Sentry !== 'undefined') {
    try {
      const eventId = (window as unknown as { Sentry: { captureException: (error: unknown, context?: Record<string, unknown>) => string } }).Sentry.captureException(error, {
        extra: context,
        user: context?.user,
        fingerprint,
      });
      return eventId;
    } catch (err) {
      // Fallback to backend logging
      console.error("[captureError] Sentry browser logging failed:", err);
    }
  }
  // In production, on server or if Sentry not available, send to backend endpoint
  try {
    // Add timeout and retry logic for network resilience
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const res = await fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: typeof error === "string"
          ? error
          : (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: string }).message === 'string')
            ? (error as { message: string }).message
            : JSON.stringify(error),
        context,
        env: isProd ? "production" : "development",
        timestamp: new Date().toISOString(),
        fingerprint,
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json().catch(() => undefined);
      return data?.eventId;
    } else {
      console.error("[captureError] Backend error reporting failed with status:", res.status);
    }
  } catch (err) {
    // Handle specific network errors
    if (err && typeof err === 'object' && 'name' in err) {
      if ((err as { name: string }).name === 'AbortError') {
        console.error("[captureError] Error reporting timed out");
      } else if ((err as { code?: string }).code === 'ECONNRESET') {
        console.error("[captureError] Connection reset during error reporting");
      } else {
        console.error("[captureError] Failed to report error:", err);
      }
    } else {
      console.error("[captureError] Failed to report error:", err);
    }
  }
  return undefined;
}

/**
 * Utility: Extract eventId from error and show to user for support reference.
 * Usage: Show eventId in error UI if available.
 */
export function getErrorEventId(err: unknown): string | undefined {
  if (!err) return undefined;
  if (typeof err === 'object' && err && 'eventId' in err && typeof (err as { eventId?: string }).eventId === 'string') {
    return (err as { eventId: string }).eventId;
  }
  return undefined;
}

// 3. Automated testing: test scaffold (see __tests__/errorMonitoring.test.ts)
// import { captureError } from "../lib/errorMonitoring";
// describe('captureError', () => {
//   it('should log error in dev', async () => {
//     const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
//     await captureError('test error', { foo: 'bar', password: 'secret' });
//     expect(spy).toHaveBeenCalledWith(expect.stringContaining('Captured error'), 'test error', expect.anything());
//     spy.mockRestore();
//   });
// });
