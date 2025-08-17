import { NextRequest, NextResponse } from 'next/server';
import { checkrBackgroundCheck } from '@/lib/verification';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const body = await request.text();
    const headersList = headers();
    
    // Verify Checkr signature if configured
    const checkrSignature = headersList.get('x-checkr-signature');
    if (process.env.CHECKR_WEBHOOK_SECRET && checkrSignature) {
      // Implement signature verification here if needed
      // const expectedSignature = crypto.createHmac('sha256', process.env.CHECKR_WEBHOOK_SECRET)
      //   .update(body)
      //   .digest('hex');
      // if (checkrSignature !== expectedSignature) {
      //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      // }
    }

    const payload = JSON.parse(body);
    
    // Handle the webhook
    const result = await checkrBackgroundCheck.handleWebhook(payload);
    
    if (!result.success) {
      console.error('Checkr webhook handling failed:', result.error);
      return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }

    // Log successful processing
    console.log('Checkr webhook processed successfully:', {
      reportId: payload.id,
      status: result.status
    });

    return NextResponse.json({ 
      success: true, 
      status: result.status 
    });

  } catch (error) {
    console.error('Checkr webhook error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json({ 
    service: 'Checkr Webhook',
    status: 'active',
    timestamp: new Date().toISOString()
  });
}