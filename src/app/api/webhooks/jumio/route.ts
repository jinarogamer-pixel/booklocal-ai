import { NextRequest, NextResponse } from 'next/server';
import { jumioVerification } from '@/lib/verification';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const body = await request.text();
    const headersList = headers();
    
    // Verify Jumio signature if configured
    const jumioSignature = headersList.get('x-jumio-signature');
    if (process.env.JUMIO_WEBHOOK_SECRET && jumioSignature) {
      // Implement signature verification here if needed
      // const expectedSignature = crypto.createHmac('sha256', process.env.JUMIO_WEBHOOK_SECRET)
      //   .update(body)
      //   .digest('hex');
      // if (jumioSignature !== expectedSignature) {
      //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      // }
    }

    const payload = JSON.parse(body);
    
    // Handle the webhook
    const result = await jumioVerification.handleWebhook(payload);
    
    if (!result.success) {
      console.error('Jumio webhook handling failed:', result.error);
      return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }

    // Log successful processing
    console.log('Jumio webhook processed successfully:', {
      scanReference: payload.scanReference,
      status: result.status
    });

    return NextResponse.json({ 
      success: true, 
      status: result.status 
    });

  } catch (error) {
    console.error('Jumio webhook error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json({ 
    service: 'Jumio Webhook',
    status: 'active',
    timestamp: new Date().toISOString()
  });
}