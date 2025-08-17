import { supabase } from './supabase';

// Types for verification
export interface VerificationDocument {
  id: string;
  user_id: string;
  document_type: 'drivers_license' | 'passport' | 'business_license' | 'insurance_cert' | 'w9' | 'other';
  file_url: string;
  file_name: string;
  verification_status: 'pending' | 'approved' | 'rejected' | 'expired';
  verified_at?: string;
  rejection_reason?: string;
  expires_at?: string;
  metadata: Record<string, any>;
}

export interface BackgroundCheckResult {
  id: string;
  contractor_id: string;
  provider: 'checkr' | 'sterling' | 'certn';
  external_id: string;
  status: 'pending' | 'clear' | 'consider' | 'suspended';
  completed_at?: string;
  expires_at?: string;
  report_url?: string;
  metadata: Record<string, any>;
}

export interface LicenseVerification {
  license_number: string;
  license_type: string;
  license_state: string;
  status: 'active' | 'inactive' | 'suspended' | 'expired';
  expires_at?: string;
  verified_at: string;
  issuing_authority: string;
}

// Jumio ID Verification Service
export class JumioVerification {
  private apiToken: string;
  private apiSecret: string;
  private baseUrl: string;

  constructor() {
    this.apiToken = process.env.JUMIO_API_TOKEN || '';
    this.apiSecret = process.env.JUMIO_API_SECRET || '';
    this.baseUrl = process.env.JUMIO_DATACENTER === 'EU' 
      ? 'https://netverify.com/api/netverify/v2'
      : 'https://netverify.com/api/netverify/v2';
  }

  async initiateVerification(userId: string, userEmail: string, userReference?: string) {
    if (!this.apiToken || !this.apiSecret) {
      console.warn('Jumio credentials not configured, using mock verification');
      return this.mockVerification(userId);
    }

    try {
      const auth = Buffer.from(`${this.apiToken}:${this.apiSecret}`).toString('base64');
      
      const response = await fetch(`${this.baseUrl}/initiateNetverify`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          'User-Agent': 'BookLocal/1.0'
        },
        body: JSON.stringify({
          customerInternalReference: userReference || userId,
          userReference: userId,
          successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/verification/success`,
          errorUrl: `${process.env.NEXT_PUBLIC_APP_URL}/verification/error`,
          callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/jumio`,
          enabledFields: 'idNumber,idFirstName,idLastName,idDob,idExpiry,idUsState,idPersonalNumber',
          authorizationTokenLifetime: 5184000, // 60 days
          merchantIdScanReference: `BL-${userId}-${Date.now()}`,
          customerId: userEmail
        })
      });

      if (!response.ok) {
        throw new Error(`Jumio API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Store verification initiation in database
      await supabase
        .from('verification_documents')
        .insert({
          user_id: userId,
          document_type: 'drivers_license',
          file_url: data.redirectUrl,
          file_name: `jumio-verification-${userId}`,
          verification_status: 'pending',
          metadata: {
            jumio_scan_reference: data.jumioIdScanReference,
            timestamp: data.timestamp,
            provider: 'jumio'
          }
        });

      return {
        success: true,
        redirectUrl: data.redirectUrl,
        scanReference: data.jumioIdScanReference
      };
    } catch (error) {
      console.error('Jumio verification error:', error);
      return this.mockVerification(userId);
    }
  }

  private async mockVerification(userId: string) {
    // Mock verification for development/testing
    const mockScanReference = `MOCK-${userId}-${Date.now()}`;
    
    await supabase
      .from('verification_documents')
      .insert({
        user_id: userId,
        document_type: 'drivers_license',
        file_url: '/mock-verification',
        file_name: `mock-verification-${userId}`,
        verification_status: 'pending',
        metadata: {
          jumio_scan_reference: mockScanReference,
          timestamp: new Date().toISOString(),
          provider: 'jumio_mock',
          note: 'Mock verification for development'
        }
      });

    return {
      success: true,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/verification/mock?ref=${mockScanReference}`,
      scanReference: mockScanReference
    };
  }

  async handleWebhook(payload: any) {
    try {
      const { scanReference, verificationStatus, idScanStatus, identityVerification } = payload;
      
      // Find the verification record
      const { data: verification } = await supabase
        .from('verification_documents')
        .select('*')
        .eq('metadata->jumio_scan_reference', scanReference)
        .single();

      if (!verification) {
        throw new Error('Verification record not found');
      }

      let status: 'approved' | 'rejected' | 'pending' = 'pending';
      let rejectionReason: string | undefined;

      if (verificationStatus === 'APPROVED_VERIFIED' && idScanStatus === 'SUCCESS') {
        status = 'approved';
      } else if (verificationStatus === 'DENIED_FRAUD' || idScanStatus === 'ERROR') {
        status = 'rejected';
        rejectionReason = payload.rejectReason || 'Document verification failed';
      }

      // Update verification status
      await supabase
        .from('verification_documents')
        .update({
          verification_status: status,
          verified_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
          metadata: {
            ...verification.metadata,
            verification_result: payload,
            identity_verification: identityVerification
          }
        })
        .eq('id', verification.id);

      return { success: true, status };
    } catch (error) {
      console.error('Jumio webhook error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Checkr Background Check Service
export class CheckrBackgroundCheck {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.CHECKR_API_KEY || '';
    this.baseUrl = process.env.CHECKR_ENVIRONMENT === 'production' 
      ? 'https://api.checkr.com/v1'
      : 'https://api.checkr.com/v1';
  }

  async initiateBackgroundCheck(contractorId: string, candidateData: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    zipcode?: string;
    dob?: string; // YYYY-MM-DD format
    ssn?: string; // Last 4 digits only for initial screening
  }) {
    if (!this.apiKey) {
      console.warn('Checkr API key not configured, using mock background check');
      return this.mockBackgroundCheck(contractorId, candidateData);
    }

    try {
      // Create candidate
      const candidateResponse = await fetch(`${this.baseUrl}/candidates`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: candidateData.email,
          first_name: candidateData.first_name,
          last_name: candidateData.last_name,
          phone: candidateData.phone,
          zipcode: candidateData.zipcode,
          dob: candidateData.dob,
          ssn: candidateData.ssn,
          custom_id: contractorId
        })
      });

      if (!candidateResponse.ok) {
        throw new Error(`Checkr candidate creation failed: ${candidateResponse.status}`);
      }

      const candidate = await candidateResponse.json();

      // Create background check report
      const reportResponse = await fetch(`${this.baseUrl}/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          candidate_id: candidate.id,
          package: 'tasker_standard', // Standard package for gig economy
          tags: ['booklocal', 'contractor']
        })
      });

      if (!reportResponse.ok) {
        throw new Error(`Checkr report creation failed: ${reportResponse.status}`);
      }

      const report = await reportResponse.json();

      // Store background check in database
      await supabase
        .from('background_checks')
        .insert({
          contractor_id: contractorId,
          provider: 'checkr',
          external_id: report.id,
          status: 'pending',
          metadata: {
            candidate_id: candidate.id,
            report_id: report.id,
            package: 'tasker_standard',
            created_at: report.created_at
          }
        });

      return {
        success: true,
        reportId: report.id,
        candidateId: candidate.id,
        status: 'pending'
      };
    } catch (error) {
      console.error('Checkr background check error:', error);
      return this.mockBackgroundCheck(contractorId, candidateData);
    }
  }

  private async mockBackgroundCheck(contractorId: string, candidateData: any) {
    const mockReportId = `MOCK-BGC-${contractorId}-${Date.now()}`;
    
    await supabase
      .from('background_checks')
      .insert({
        contractor_id: contractorId,
        provider: 'checkr',
        external_id: mockReportId,
        status: 'pending',
        metadata: {
          candidate_data: candidateData,
          provider: 'checkr_mock',
          note: 'Mock background check for development'
        }
      });

    return {
      success: true,
      reportId: mockReportId,
      candidateId: `MOCK-CANDIDATE-${contractorId}`,
      status: 'pending'
    };
  }

  async handleWebhook(payload: any) {
    try {
      const { id: reportId, status, result, candidate } = payload;
      
      // Find the background check record
      const { data: backgroundCheck } = await supabase
        .from('background_checks')
        .select('*')
        .eq('external_id', reportId)
        .single();

      if (!backgroundCheck) {
        throw new Error('Background check record not found');
      }

      let checkStatus: 'clear' | 'consider' | 'suspended' = 'consider';
      
      if (status === 'complete') {
        if (result === 'clear') {
          checkStatus = 'clear';
        } else if (result === 'consider') {
          checkStatus = 'consider';
        } else {
          checkStatus = 'suspended';
        }
      }

      // Update background check status
      await supabase
        .from('background_checks')
        .update({
          status: checkStatus,
          completed_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
          metadata: {
            ...backgroundCheck.metadata,
            report_result: payload,
            candidate_info: candidate
          }
        })
        .eq('id', backgroundCheck.id);

      return { success: true, status: checkStatus };
    } catch (error) {
      console.error('Checkr webhook error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Florida License Verification Service
export class FloridaLicenseVerification {
  private dbprApiKey: string;
  private baseUrl: string;

  constructor() {
    this.dbprApiKey = process.env.FLORIDA_DBPR_API_KEY || '';
    this.baseUrl = 'https://www.myfloridalicense.com/api/v1';
  }

  async verifyLicense(licenseNumber: string, licenseType?: string): Promise<LicenseVerification | null> {
    if (!this.dbprApiKey) {
      console.warn('Florida DBPR API key not configured, using mock verification');
      return this.mockLicenseVerification(licenseNumber, licenseType);
    }

    try {
      const response = await fetch(`${this.baseUrl}/license/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.dbprApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          license_number: licenseNumber,
          license_type: licenseType
        })
      });

      if (!response.ok) {
        throw new Error(`DBPR API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        license_number: data.license_number,
        license_type: data.license_type,
        license_state: 'FL',
        status: data.status,
        expires_at: data.expiration_date,
        verified_at: new Date().toISOString(),
        issuing_authority: 'Florida Department of Business and Professional Regulation'
      };
    } catch (error) {
      console.error('Florida license verification error:', error);
      return this.mockLicenseVerification(licenseNumber, licenseType);
    }
  }

  private mockLicenseVerification(licenseNumber: string, licenseType?: string): LicenseVerification {
    // Mock verification for development
    return {
      license_number: licenseNumber,
      license_type: licenseType || 'General Contractor',
      license_state: 'FL',
      status: 'active',
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      verified_at: new Date().toISOString(),
      issuing_authority: 'Florida DBPR (Mock)'
    };
  }
}

// Insurance Verification Service
export class InsuranceVerification {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.INSURANCE_VERIFY_API_KEY || '';
    this.baseUrl = 'https://api.insuranceverify.com/v1';
  }

  async verifyInsurance(contractorId: string, insuranceData: {
    carrier_name: string;
    policy_number: string;
    coverage_type: 'general_liability' | 'workers_comp' | 'professional_liability' | 'auto';
    coverage_amount: number;
    effective_date: string;
    expiration_date: string;
  }) {
    if (!this.apiKey) {
      console.warn('Insurance verification API key not configured, using manual verification');
      return this.manualInsuranceVerification(contractorId, insuranceData);
    }

    try {
      const response = await fetch(`${this.baseUrl}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          carrier_name: insuranceData.carrier_name,
          policy_number: insuranceData.policy_number,
          insured_name: contractorId, // This would be contractor business name
          coverage_type: insuranceData.coverage_type,
          verification_date: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Insurance verification API error: ${response.status}`);
      }

      const result = await response.json();
      
      // Store insurance certificate
      const { data: certificate } = await supabase
        .from('insurance_certificates')
        .insert({
          contractor_id: contractorId,
          insurance_type: insuranceData.coverage_type,
          carrier_name: insuranceData.carrier_name,
          policy_number: insuranceData.policy_number,
          coverage_amount: insuranceData.coverage_amount,
          effective_date: insuranceData.effective_date,
          expiration_date: insuranceData.expiration_date,
          verified: result.verified,
          verified_at: result.verified ? new Date().toISOString() : null
        })
        .select()
        .single();

      return {
        success: true,
        verified: result.verified,
        certificate_id: certificate?.id
      };
    } catch (error) {
      console.error('Insurance verification error:', error);
      return this.manualInsuranceVerification(contractorId, insuranceData);
    }
  }

  private async manualInsuranceVerification(contractorId: string, insuranceData: any) {
    // Store for manual verification
    const { data: certificate } = await supabase
      .from('insurance_certificates')
      .insert({
        contractor_id: contractorId,
        insurance_type: insuranceData.coverage_type,
        carrier_name: insuranceData.carrier_name,
        policy_number: insuranceData.policy_number,
        coverage_amount: insuranceData.coverage_amount,
        effective_date: insuranceData.effective_date,
        expiration_date: insuranceData.expiration_date,
        verified: false // Requires manual verification
      })
      .select()
      .single();

    return {
      success: true,
      verified: false,
      certificate_id: certificate?.id,
      requires_manual_verification: true
    };
  }
}

// Main Verification Service
export class VerificationService {
  private jumio: JumioVerification;
  private checkr: CheckrBackgroundCheck;
  private floridaLicense: FloridaLicenseVerification;
  private insurance: InsuranceVerification;

  constructor() {
    this.jumio = new JumioVerification();
    this.checkr = new CheckrBackgroundCheck();
    this.floridaLicense = new FloridaLicenseVerification();
    this.insurance = new InsuranceVerification();
  }

  async startContractorVerification(contractorId: string, userData: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    zipcode?: string;
    dob?: string;
    license_number?: string;
    license_type?: string;
  }) {
    const results = {
      identity_verification: null as any,
      background_check: null as any,
      license_verification: null as any,
      overall_status: 'pending' as 'pending' | 'approved' | 'rejected'
    };

    try {
      // Start identity verification
      results.identity_verification = await this.jumio.initiateVerification(
        userData.email,
        userData.email,
        contractorId
      );

      // Start background check
      results.background_check = await this.checkr.initiateBackgroundCheck(contractorId, {
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        zipcode: userData.zipcode,
        dob: userData.dob
      });

      // Verify license if provided
      if (userData.license_number) {
        results.license_verification = await this.floridaLicense.verifyLicense(
          userData.license_number,
          userData.license_type
        );
      }

      return {
        success: true,
        verification_id: `VER-${contractorId}-${Date.now()}`,
        results
      };
    } catch (error) {
      console.error('Contractor verification error:', error);
      return {
        success: false,
        error: error.message,
        results
      };
    }
  }

  async getVerificationStatus(contractorId: string) {
    try {
      // Get all verification records for contractor
      const { data: verifications } = await supabase
        .from('verification_documents')
        .select('*')
        .eq('user_id', contractorId);

      const { data: backgroundChecks } = await supabase
        .from('background_checks')
        .select('*')
        .eq('contractor_id', contractorId);

      const { data: insuranceCerts } = await supabase
        .from('insurance_certificates')
        .select('*')
        .eq('contractor_id', contractorId);

      // Calculate overall status
      const hasApprovedId = verifications?.some(v => v.verification_status === 'approved');
      const hasClearBackground = backgroundChecks?.some(b => b.status === 'clear');
      const hasValidInsurance = insuranceCerts?.some(i => 
        i.verified && new Date(i.expiration_date) > new Date()
      );

      let overallStatus = 'pending';
      if (hasApprovedId && hasClearBackground && hasValidInsurance) {
        overallStatus = 'approved';
      } else if (verifications?.some(v => v.verification_status === 'rejected') ||
                 backgroundChecks?.some(b => b.status === 'suspended')) {
        overallStatus = 'rejected';
      }

      return {
        overall_status: overallStatus,
        identity_verified: hasApprovedId,
        background_cleared: hasClearBackground,
        insurance_verified: hasValidInsurance,
        verifications,
        background_checks: backgroundChecks,
        insurance_certificates: insuranceCerts
      };
    } catch (error) {
      console.error('Get verification status error:', error);
      return {
        overall_status: 'error',
        error: error.message
      };
    }
  }
}

// Export instances
export const verificationService = new VerificationService();
export const jumioVerification = new JumioVerification();
export const checkrBackgroundCheck = new CheckrBackgroundCheck();
export const floridaLicenseVerification = new FloridaLicenseVerification();
export const insuranceVerification = new InsuranceVerification();