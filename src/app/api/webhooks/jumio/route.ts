import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

// Jumio webhook handler for identity verification results
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const signature = request.headers.get('x-jumio-signature');
    
    // Verify webhook signature (if configured)
    if (process.env.JUMIO_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.JUMIO_WEBHOOK_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');
      
      if (signature !== expectedSignature) {
        console.error('Invalid Jumio webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const {
      scanReference,
      customerInternalReference: contractorId,
      verificationStatus,
      idScanStatus,
      identityVerification,
      document,
      transaction
    } = payload;

    console.log('Jumio webhook received:', {
      scanReference,
      contractorId,
      verificationStatus,
      idScanStatus
    });

    // Determine verification status
    let status: 'pending' | 'approved' | 'rejected' | 'requires_review' = 'pending';
    let rejectionReason: string | undefined;

    if (verificationStatus === 'APPROVED_VERIFIED' && idScanStatus === 'SUCCESS') {
      status = 'approved';
    } else if (
      verificationStatus === 'DENIED_FRAUD' ||
      verificationStatus === 'DENIED_UNSUPPORTED_ID_TYPE' ||
      verificationStatus === 'DENIED_UNSUPPORTED_ID_COUNTRY' ||
      idScanStatus === 'ERROR'
    ) {
      status = 'rejected';
      rejectionReason = payload.rejectReason || 'Document verification failed';
    } else if (verificationStatus === 'NO_ID_UPLOADED' || idScanStatus === 'PENDING') {
      status = 'pending';
    } else {
      status = 'requires_review';
    }

    // Update contractor profile with verification results
    if (contractorId) {
      const { error: updateError } = await supabase
        .from('contractor_profiles')
        .update({
          identity_verification_status: status,
          identity_verification_completed_at: status !== 'pending' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
          metadata: {
            jumio_verification: {
              scanReference,
              verificationStatus,
              idScanStatus,
              identityVerification,
              document: document ? {
                type: document.type,
                country: document.country,
                firstName: document.firstName,
                lastName: document.lastName,
                dob: document.dob,
                issuingCountry: document.issuingCountry
              } : null,
              completedAt: new Date().toISOString(),
              rejectionReason
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

      // Log security event
      await supabase
        .from('security_logs')
        .insert({
          user_id: contractorId,
          event_type: 'identity_verification_result',
          severity: status === 'rejected' ? 'high' : 'medium',
          details: {
            provider: 'jumio',
            scanReference,
            status,
            verificationStatus,
            idScanStatus,
            rejectionReason
          }
        });

      // Send notification to contractor
      await supabase
        .from('notifications')
        .insert({
          user_id: contractorId,
          type: 'verification_update',
          title: getNotificationTitle(status),
          content: getNotificationContent(status, rejectionReason),
          data: {
            verificationType: 'identity',
            status,
            provider: 'jumio'
          }
        });

      console.log(`Identity verification updated for contractor ${contractorId}: ${status}`);
    }

    return NextResponse.json({ 
      success: true,
      status: 'processed',
      contractorId,
      verificationStatus: status
    });

  } catch (error) {
    console.error('Jumio webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

function getNotificationTitle(status: string): string {
  switch (status) {
    case 'approved':
      return 'Identity Verification Approved ✅';
    case 'rejected':
      return 'Identity Verification Rejected ❌';
    case 'requires_review':
      return 'Identity Verification Under Review 🔍';
    default:
      return 'Identity Verification Update';
  }
}

function getNotificationContent(status: string, rejectionReason?: string): string {
  switch (status) {
    case 'approved':
      return 'Great news! Your identity has been successfully verified. You can now proceed with the next steps in your contractor onboarding.';
    case 'rejected':
      return `Your identity verification was not successful. ${rejectionReason ? `Reason: ${rejectionReason}` : ''} Please contact support for assistance.`;
    case 'requires_review':
      return 'Your identity verification requires manual review. Our team will review your submission and get back to you within 1-2 business days.';
    default:
      return 'Your identity verification status has been updated. Please check your contractor dashboard for details.';
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