import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

// Checkr webhook handler for background check results
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const signature = request.headers.get('x-checkr-signature');
    
    // Verify webhook signature (if configured)
    if (process.env.CHECKR_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.CHECKR_WEBHOOK_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');
      
      if (signature !== expectedSignature) {
        console.error('Invalid Checkr webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const {
      id: reportId,
      object,
      status,
      result,
      adjudication,
      candidate,
      package: packageType,
      created_at,
      completed_at,
      tags
    } = payload;

    console.log('Checkr webhook received:', {
      reportId,
      object,
      status,
      result,
      adjudication
    });

    // Extract contractor ID from tags or candidate custom_id
    const contractorId = tags?.find((tag: string) => tag.startsWith('contractor_'))?.replace('contractor_', '') ||
                        candidate?.custom_id;

    if (!contractorId) {
      console.error('No contractor ID found in Checkr webhook payload');
      return NextResponse.json({ error: 'Contractor ID not found' }, { status: 400 });
    }

    // Determine verification status based on Checkr results
    let verificationStatus: 'pending' | 'approved' | 'rejected' | 'requires_review' = 'pending';
    let rejectionReason: string | undefined;

    if (status === 'complete') {
      if (result === 'clear') {
        verificationStatus = 'approved';
      } else if (result === 'consider') {
        verificationStatus = 'requires_review';
        rejectionReason = 'Background check requires manual review';
      } else {
        verificationStatus = 'rejected';
        rejectionReason = 'Background check failed';
      }
    } else if (status === 'pending') {
      verificationStatus = 'pending';
    } else if (status === 'canceled' || status === 'suspended') {
      verificationStatus = 'rejected';
      rejectionReason = `Background check ${status}`;
    } else {
      verificationStatus = 'requires_review';
    }

    // Update contractor profile with background check results
    const { error: updateError } = await supabase
      .from('contractor_profiles')
      .update({
        background_check_status: verificationStatus,
        background_check_completed_at: completed_at || (status !== 'pending' ? new Date().toISOString() : null),
        updated_at: new Date().toISOString(),
        metadata: {
          checkr_background_check: {
            reportId,
            status,
            result,
            adjudication,
            packageType,
            candidateId: candidate?.id,
            completedAt: completed_at,
            rejectionReason,
            screenings: payload.screenings || [],
            tags
          }
        }
      })
      .eq('id', contractorId);

    if (updateError) {
      console.error('Error updating contractor profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update contractor profile' },
        { status: 500 }
      );
    }

    // Store detailed background check record
    const { error: insertError } = await supabase
      .from('background_checks')
      .insert({
        contractor_id: contractorId,
        provider: 'checkr',
        external_id: reportId,
        status: verificationStatus,
        completed_at: completed_at,
        expires_at: completed_at ? new Date(new Date(completed_at).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString() : null, // 1 year
        report_url: payload.report_url,
        metadata: {
          checkr_report: payload,
          candidate: candidate,
          screenings: payload.screenings || []
        }
      });

    if (insertError) {
      console.error('Error inserting background check record:', insertError);
    }

    // Log security event
    await supabase
      .from('security_logs')
      .insert({
        user_id: contractorId,
        event_type: 'background_check_result',
        severity: verificationStatus === 'rejected' ? 'high' : 'medium',
        details: {
          provider: 'checkr',
          reportId,
          status: verificationStatus,
          result,
          adjudication,
          rejectionReason
        }
      });

    // Send notification to contractor
    await supabase
      .from('notifications')
      .insert({
        user_id: contractorId,
        type: 'verification_update',
        title: getNotificationTitle(verificationStatus),
        content: getNotificationContent(verificationStatus, rejectionReason),
        data: {
          verificationType: 'background_check',
          status: verificationStatus,
          provider: 'checkr',
          reportId
        }
      });

    console.log(`Background check updated for contractor ${contractorId}: ${verificationStatus}`);

    return NextResponse.json({ 
      success: true,
      status: 'processed',
      contractorId,
      verificationStatus,
      reportId
    });

  } catch (error) {
    console.error('Checkr webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

function getNotificationTitle(status: string): string {
  switch (status) {
    case 'approved':
      return 'Background Check Approved ✅';
    case 'rejected':
      return 'Background Check Issues Found ❌';
    case 'requires_review':
      return 'Background Check Under Review 🔍';
    default:
      return 'Background Check Update';
  }
}

function getNotificationContent(status: string, rejectionReason?: string): string {
  switch (status) {
    case 'approved':
      return 'Great news! Your background check has been completed successfully. You are now eligible to receive booking requests.';
    case 'rejected':
      return `Your background check revealed issues that prevent approval. ${rejectionReason ? `Details: ${rejectionReason}` : ''} Please contact support if you believe this is an error.`;
    case 'requires_review':
      return 'Your background check requires additional review. Our team will review your results and contact you within 2-3 business days.';
    default:
      return 'Your background check status has been updated. Please check your contractor dashboard for details.';
  }
}

// Handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json({ 
    service: 'checkr-webhook',
    status: 'active',
    timestamp: new Date().toISOString()
  });
}