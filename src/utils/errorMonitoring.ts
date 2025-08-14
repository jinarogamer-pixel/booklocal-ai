import * as Sentry from '@sentry/nextjs';

export async function logError(error: unknown) {
  if (!error) {
    Sentry.captureMessage('Undefined/null error caught');
    return;
  }

  const normalized = getErrorMessageAndStack(error);

  try {
    Sentry.captureException(error);
    // Optionally, send to your own API endpoint as well
    await fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: normalized.message, stack: normalized.stack })
    });
  } catch (e) {
    // Retry logic for network errors
    setTimeout(() => {
      try {
        fetch('/api/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: normalized.message, stack: normalized.stack, retry: true })
        });
      } catch (_err) {
        // Last resort: swallow to avoid crashing the app
         
        console.error('Failed to send error to /api/log-error on retry', _err);
      }
    }, 2000);
  }
}

function getErrorMessageAndStack(err: unknown): { message: string; stack?: string | null } {
  if (!err) return { message: 'Unknown error', stack: null };
  if (typeof err === 'string') return { message: err, stack: null };
  if (err instanceof Error) return { message: err.message, stack: err.stack ?? null };
  try {
    return { message: JSON.stringify(err), stack: null };
  } catch (_e) {
    return { message: 'Unserializable error', stack: null };
  }
}
