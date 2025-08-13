import * as Sentry from '@sentry/nextjs';

export async function logError(error: any) {
  if (!error) {
    Sentry.captureMessage('Undefined/null error caught');
    return;
  }
  try {
    Sentry.captureException(error);
    // Optionally, send to your own API endpoint as well
    await fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || error.toString(), stack: error.stack || null })
    });
  } catch (e) {
    // Retry logic for network errors
    setTimeout(() => {
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: error.message || error.toString(), stack: error.stack || null, retry: true })
      });
    }, 2000);
  }
}
