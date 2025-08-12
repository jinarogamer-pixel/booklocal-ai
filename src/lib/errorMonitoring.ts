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
  error: any,
  context?: Record<string, any> & { user?: { id?: string; email?: string } },
  fingerprint?: string[]
): Promise<string | undefined> {
  // 5. Security & privacy: redact sensitive fields
  function redact(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    const SENSITIVE = ['password', 'token', 'accessToken', 'refreshToken', 'secret'];
    return Object.fromEntries(Object.entries(obj).map(([k, v]) =>
      SENSITIVE.includes(k) ? [k, '[REDACTED]'] : [k, typeof v === 'object' ? redact(v) : v]
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
  if (isProd && typeof window !== "undefined" && (window as any).Sentry) {
    try {
      const eventId = (window as any).Sentry.captureException(error, {
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
    const res = await fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: typeof error === "string" ? error : (error?.message || JSON.stringify(error)),
        context,
        env: isProd ? "production" : "development",
        timestamp: new Date().toISOString(),
        fingerprint,
      })
    });
    if (res.ok) {
      const data = await res.json().catch(() => undefined);
      return data?.eventId;
    }
  } catch (err) {
    // If even this fails, log to console as fallback
    console.error("[captureError] Failed to report error:", err);
  }
  return undefined;
}

/**
 * Utility: Extract eventId from error and show to user for support reference.
 * Usage: Show eventId in error UI if available.
 */
export function getErrorEventId(err: unknown): string | undefined {
  if (!err) return undefined;
  if (typeof err === 'object' && 'eventId' in err && typeof (err as any).eventId === 'string') {
    return (err as any).eventId;
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
