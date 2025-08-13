import { NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventId = Sentry.captureException(body.error || 'Unknown error');
    return new Response(JSON.stringify({ status: 'logged', eventId }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ status: 'failed', eventId: null, error: e?.toString() }), { status: 500 });
  }
}
