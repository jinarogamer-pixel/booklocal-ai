// Monitoring/logging utility stub
// Replace with real Sentry, Logflare, or Supabase logs integration
export function logError(error: unknown) {
  // TODO: Integrate with Sentry or your logging provider
  // Narrow and print safely
  if (typeof error === 'string') {
    console.error('Logged error:', error);
    return;
  }
  if (error instanceof Error) {
    console.error('Logged error:', error.message, error.stack);
    return;
  }
  try {
    console.error('Logged error:', JSON.stringify(error));
  } catch (_e) {
    console.error('Logged error: [unserializable error]');
  }
}
