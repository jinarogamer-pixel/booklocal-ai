import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verificationService, IdentityVerificationRequest, BackgroundCheckRequest, LicenseVerificationRequest } from '@/lib/verification';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      personalInfo,
      licenseInfo,
      insuranceInfo,
      verificationType = 'comprehensive'
    } = body;

    // Validate required fields
    if (!personalInfo || !personalInfo.firstName || !personalInfo.lastName || !personalInfo.dateOfBirth) {
      return NextResponse.json(
        { error: 'Missing required personal information' },
        { status: 400 }
      );
    }

    // Get or create contractor profile
    let { data: contractorProfile, error: profileError } = await supabase
      .from('contractor_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // Not found error
      console.error('Error fetching contractor profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch contractor profile' },
        { status: 500 }
      );
    }

    // Create contractor profile if it doesn't exist
    if (!contractorProfile) {
      const { data: newProfile, error: createError } = await supabase
        .from('contractor_profiles')
        .insert({
          user_id: session.user.id,
          business_name: personalInfo.businessName,
          business_type: personalInfo.businessType || 'individual',
          license_number: licenseInfo?.licenseNumber,
          license_type: licenseInfo?.licenseType,
          license_state: licenseInfo?.licenseState || 'FL',
          ein: personalInfo.ein,
          ssn_last_four: personalInfo.ssn?.slice(-4),
          years_experience: personalInfo.yearsExperience || 0,
          service_radius: personalInfo.serviceRadius || 25,
          bio: personalInfo.bio,
          website_url: personalInfo.websiteUrl,
          verification_status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating contractor profile:', createError);
        return NextResponse.json(
          { error: 'Failed to create contractor profile' },
          { status: 500 }
        );
      }

      contractorProfile = newProfile;
    }

    // Prepare verification requests
    const identityRequest: IdentityVerificationRequest = {
      contractorId: contractorProfile.id,
      firstName: personalInfo.firstName,
      lastName: personalInfo.lastName,
      dateOfBirth: personalInfo.dateOfBirth,
      ssn: personalInfo.ssn?.slice(-4), // Only last 4 digits for identity verification
      address: {
        street: personalInfo.address.street,
        city: personalInfo.address.city,
        state: personalInfo.address.state,
        zipCode: personalInfo.address.zipCode
      },
      phone: personalInfo.phone,
      email: session.user.email || personalInfo.email
    };

    const backgroundRequest: BackgroundCheckRequest = {
      contractorId: contractorProfile.id,
      firstName: personalInfo.firstName,
      lastName: personalInfo.lastName,
      dateOfBirth: personalInfo.dateOfBirth,
      ssn: personalInfo.ssn, // Full SSN for background check
      address: {
        street: personalInfo.address.street,
        city: personalInfo.address.city,
        state: personalInfo.address.state,
        zipCode: personalInfo.address.zipCode
      },
      driverLicenseNumber: personalInfo.driverLicenseNumber,
      driverLicenseState: personalInfo.driverLicenseState || personalInfo.address.state
    };

    let licenseRequest: LicenseVerificationRequest | undefined;
    if (licenseInfo && licenseInfo.licenseNumber) {
      licenseRequest = {
        licenseNumber: licenseInfo.licenseNumber,
        licenseType: licenseInfo.licenseType,
        state: licenseInfo.licenseState || 'FL',
        contractorName: personalInfo.businessName || `${personalInfo.firstName} ${personalInfo.lastName}`
      };
    }

    // Start verification process
    const verificationResults = await verificationService.startComprehensiveVerification(
      identityRequest,
      backgroundRequest,
      licenseRequest,
      insuranceInfo?.certificateUrl
    );

    // Update contractor profile with verification IDs
    const verificationMetadata = {
      verification_started_at: new Date().toISOString(),
      identity_verification_id: verificationResults.identityVerification.externalId,
      background_check_id: verificationResults.backgroundCheck.externalId,
      license_verification_id: verificationResults.licenseVerification?.externalId,
      insurance_verification_id: verificationResults.insuranceVerification?.externalId,
      verification_type: verificationType,
      personal_info: {
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        dateOfBirth: personalInfo.dateOfBirth,
        phone: personalInfo.phone,
        address: personalInfo.address
      }
    };

    const { error: updateError } = await supabase
      .from('contractor_profiles')
      .update({
        verification_status: 'in_progress',
        metadata: verificationMetadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', contractorProfile.id);

    if (updateError) {
      console.error('Error updating contractor profile with verification IDs:', updateError);
    }

    // Log verification initiation
    await supabase
      .from('security_logs')
      .insert({
        user_id: session.user.id,
        event_type: 'verification_initiated',
        severity: 'medium',
        details: {
          contractor_id: contractorProfile.id,
          verification_type: verificationType,
          identity_verification_id: verificationResults.identityVerification.externalId,
          background_check_id: verificationResults.backgroundCheck.externalId,
          license_verification_id: verificationResults.licenseVerification?.externalId,
          providers: ['jumio', 'checkr', licenseInfo ? 'florida_dbpr' : null].filter(Boolean)
        }
      });

    // Send notification to contractor
    await supabase
      .from('notifications')
      .insert({
        user_id: session.user.id,
        type: 'verification_started',
        title: 'Verification Process Started',
        content: 'Your contractor verification process has been initiated. You will receive updates as each verification step is completed.',
        data: {
          contractor_id: contractorProfile.id,
          verification_type: verificationType,
          estimated_completion: '1-3 business days'
        }
      });

    // Prepare response with next steps
    const nextSteps = [];
    
    if (verificationResults.identityVerification.success && verificationResults.identityVerification.details?.clientRedirectUrl) {
      nextSteps.push({
        type: 'identity_verification',
        title: 'Complete Identity Verification',
        description: 'Upload a government-issued ID to verify your identity',
        action_url: verificationResults.identityVerification.details.clientRedirectUrl,
        status: 'pending',
        estimated_time: '15 minutes'
      });
    }

    if (verificationResults.backgroundCheck.success) {
      nextSteps.push({
        type: 'background_check',
        title: 'Background Check in Progress',
        description: 'Your background check has been initiated and is being processed',
        status: 'in_progress',
        estimated_time: '1-3 business days'
      });
    }

    if (licenseRequest && verificationResults.licenseVerification) {
      nextSteps.push({
        type: 'license_verification',
        title: 'License Verification',
        description: 'Your professional license is being verified with Florida DBPR',
        status: verificationResults.licenseVerification.status,
        estimated_time: 'Immediate'
      });
    }

    if (insuranceInfo?.certificateUrl && verificationResults.insuranceVerification) {
      nextSteps.push({
        type: 'insurance_verification',
        title: 'Insurance Certificate Review',
        description: 'Your insurance certificate is being reviewed by our team',
        status: verificationResults.insuranceVerification.status,
        estimated_time: '1-2 business days'
      });
    }

    return NextResponse.json({
      success: true,
      contractor_id: contractorProfile.id,
      verification_status: 'in_progress',
      results: {
        identity_verification: {
          success: verificationResults.identityVerification.success,
          status: verificationResults.identityVerification.status,
          external_id: verificationResults.identityVerification.externalId,
          redirect_url: verificationResults.identityVerification.details?.clientRedirectUrl
        },
        background_check: {
          success: verificationResults.backgroundCheck.success,
          status: verificationResults.backgroundCheck.status,
          external_id: verificationResults.backgroundCheck.externalId,
          estimated_completion: verificationResults.backgroundCheck.estimatedCompletionTime
        },
        license_verification: verificationResults.licenseVerification ? {
          success: verificationResults.licenseVerification.success,
          status: verificationResults.licenseVerification.status,
          external_id: verificationResults.licenseVerification.externalId
        } : null,
        insurance_verification: verificationResults.insuranceVerification ? {
          success: verificationResults.insuranceVerification.success,
          status: verificationResults.insuranceVerification.status,
          external_id: verificationResults.insuranceVerification.externalId
        } : null
      },
      next_steps: nextSteps,
      estimated_completion: '1-3 business days',
      support_contact: 'verification@booklocal.com'
    });

  } catch (error) {
    console.error('Contractor verification error:', error);
    return NextResponse.json(
      { 
        error: 'Verification process failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check verification status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get contractor profile
    const { data: contractorProfile, error: profileError } = await supabase
      .from('contractor_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching contractor profile:', profileError);
      return NextResponse.json(
        { error: 'Contractor profile not found' },
        { status: 404 }
      );
    }

    if (!contractorProfile.metadata?.verification_started_at) {
      return NextResponse.json({
        success: true,
        verification_status: 'not_started',
        message: 'Verification process has not been initiated'
      });
    }

    // Check status of all verification processes
    const verificationIds = {
      identityId: contractorProfile.metadata.identity_verification_id,
      backgroundId: contractorProfile.metadata.background_check_id,
      licenseId: contractorProfile.metadata.license_verification_id,
      insuranceId: contractorProfile.metadata.insurance_verification_id
    };

    const statusResults = await verificationService.checkVerificationStatus(verificationIds);

    // Update contractor profile with latest status
    const { error: updateError } = await supabase
      .from('contractor_profiles')
      .update({
        verification_status: statusResults.overallStatus,
        identity_verification_status: statusResults.identityVerification?.status,
        background_check_status: statusResults.backgroundCheck?.status,
        license_verification_status: statusResults.licenseVerification?.status,
        insurance_verification_status: statusResults.insuranceVerification?.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', contractorProfile.id);

    if (updateError) {
      console.error('Error updating verification status:', updateError);
    }

    return NextResponse.json({
      success: true,
      contractor_id: contractorProfile.id,
      verification_status: statusResults.overallStatus,
      started_at: contractorProfile.metadata.verification_started_at,
      results: {
        identity_verification: statusResults.identityVerification,
        background_check: statusResults.backgroundCheck,
        license_verification: statusResults.licenseVerification,
        insurance_verification: statusResults.insuranceVerification
      },
      progress: calculateVerificationProgress(statusResults)
    });

  } catch (error) {
    console.error('Verification status check error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check verification status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function calculateVerificationProgress(statusResults: any): {
  percentage: number;
  completed_steps: number;
  total_steps: number;
  pending_steps: string[];
} {
  const steps = [
    { name: 'identity_verification', result: statusResults.identityVerification },
    { name: 'background_check', result: statusResults.backgroundCheck },
    { name: 'license_verification', result: statusResults.licenseVerification },
    { name: 'insurance_verification', result: statusResults.insuranceVerification }
  ].filter(step => step.result); // Only count steps that were initiated

  const completedSteps = steps.filter(step => 
    step.result.status === 'approved' || step.result.status === 'rejected'
  ).length;

  const pendingSteps = steps
    .filter(step => step.result.status === 'pending' || step.result.status === 'requires_review')
    .map(step => step.name);

  return {
    percentage: steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0,
    completed_steps: completedSteps,
    total_steps: steps.length,
    pending_steps: pendingSteps
  };
}