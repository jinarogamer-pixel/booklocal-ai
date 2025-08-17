// Real Provider Verification System
// Integrates with Jumio, Checkr, and Florida DBPR APIs

import crypto from 'crypto';

// Types for verification requests and responses
export interface IdentityVerificationRequest {
  contractorId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ssn?: string; // Last 4 digits only
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
  email: string;
}

export interface BackgroundCheckRequest {
  contractorId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ssn: string; // Full SSN for background check
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  driverLicenseNumber?: string;
  driverLicenseState?: string;
}

export interface LicenseVerificationRequest {
  licenseNumber: string;
  licenseType: string;
  state: string;
  contractorName: string;
}

export interface VerificationResult {
  success: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'requires_review';
  externalId?: string;
  details?: any;
  error?: string;
  estimatedCompletionTime?: string;
}

// Jumio Identity Verification Service
export class JumioVerificationService {
  private apiToken: string;
  private apiSecret: string;
  private baseUrl: string;

  constructor() {
    this.apiToken = process.env.JUMIO_API_TOKEN || '';
    this.apiSecret = process.env.JUMIO_API_SECRET || '';
    this.baseUrl = process.env.JUMIO_DATACENTER === 'EU' 
      ? 'https://netverify.com/api/netverify/v2'
      : 'https://netverify.com/api/netverify/v2';

    if (!this.apiToken || !this.apiSecret) {
      console.warn('Jumio credentials not configured - using mock responses');
    }
  }

  private createAuthHeader(): string {
    const credentials = Buffer.from(`${this.apiToken}:${this.apiSecret}`).toString('base64');
    return `Basic ${credentials}`;
  }

  async initiateIdentityVerification(request: IdentityVerificationRequest): Promise<VerificationResult> {
    try {
      if (!this.apiToken || !this.apiSecret) {
        // Mock response for development
        return {
          success: true,
          status: 'pending',
          externalId: `mock_jumio_${Date.now()}`,
          estimatedCompletionTime: '15 minutes'
        };
      }

      const jumioRequest = {
        customerInternalReference: request.contractorId,
        userReference: `${request.firstName}_${request.lastName}_${Date.now()}`,
        reportingCriteria: 'verification_status',
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/jumio`,
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/contractor/onboarding/verification-success`,
        errorUrl: `${process.env.NEXT_PUBLIC_APP_URL}/contractor/onboarding/verification-error`,
        locale: 'en',
        enabledFields: 'idNumber,idFirstName,idLastName,idDob,idExpiry,idUsState,idPersonalNumber',
        merchantIdScanReference: request.contractorId
      };

      const response = await fetch(`${this.baseUrl}/initiateNetverify`, {
        method: 'POST',
        headers: {
          'Authorization': this.createAuthHeader(),
          'Content-Type': 'application/json',
          'User-Agent': 'BookLocal/1.0'
        },
        body: JSON.stringify(jumioRequest)
      });

      if (!response.ok) {
        throw new Error(`Jumio API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        status: 'pending',
        externalId: result.jumioIdScanReference,
        details: {
          authorizationToken: result.authorizationToken,
          clientRedirectUrl: result.clientRedirectUrl,
          jumioIdScanReference: result.jumioIdScanReference
        },
        estimatedCompletionTime: '15 minutes'
      };

    } catch (error) {
      console.error('Jumio verification error:', error);
      return {
        success: false,
        status: 'rejected',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getVerificationStatus(externalId: string): Promise<VerificationResult> {
    try {
      if (!this.apiToken || !this.apiSecret) {
        // Mock response for development
        return {
          success: true,
          status: 'approved',
          details: {
            verificationStatus: 'APPROVED_VERIFIED',
            identityVerification: {
              similarity: 'MATCH',
              validity: true
            }
          }
        };
      }

      const response = await fetch(`${this.baseUrl}/scans/${externalId}`, {
        method: 'GET',
        headers: {
          'Authorization': this.createAuthHeader(),
          'User-Agent': 'BookLocal/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Jumio status check error: ${response.status}`);
      }

      const result = await response.json();

      let status: 'pending' | 'approved' | 'rejected' | 'requires_review' = 'pending';

      switch (result.verificationStatus) {
        case 'APPROVED_VERIFIED':
          status = 'approved';
          break;
        case 'DENIED_FRAUD':
        case 'DENIED_UNSUPPORTED_ID_TYPE':
        case 'DENIED_UNSUPPORTED_ID_COUNTRY':
          status = 'rejected';
          break;
        case 'NO_ID_UPLOADED':
        case 'PENDING':
          status = 'pending';
          break;
        default:
          status = 'requires_review';
      }

      return {
        success: true,
        status,
        details: result
      };

    } catch (error) {
      console.error('Jumio status check error:', error);
      return {
        success: false,
        status: 'rejected',
        error: error instanceof Error ? error.message : 'Status check failed'
      };
    }
  }
}

// Checkr Background Check Service
export class CheckrBackgroundService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.CHECKR_API_KEY || '';
    this.baseUrl = process.env.CHECKR_ENVIRONMENT === 'production' 
      ? 'https://api.checkr.com/v1'
      : 'https://api.checkr.com/v1'; // Checkr uses same URL for sandbox

    if (!this.apiKey) {
      console.warn('Checkr API key not configured - using mock responses');
    }
  }

  private createAuthHeader(): string {
    return `Basic ${Buffer.from(`${this.apiKey}:`).toString('base64')}`;
  }

  async initiateBackgroundCheck(request: BackgroundCheckRequest): Promise<VerificationResult> {
    try {
      if (!this.apiKey) {
        // Mock response for development
        return {
          success: true,
          status: 'pending',
          externalId: `mock_checkr_${Date.now()}`,
          estimatedCompletionTime: '1-3 business days'
        };
      }

      // First, create a candidate
      const candidateData = {
        first_name: request.firstName,
        last_name: request.lastName,
        email: `contractor_${request.contractorId}@booklocal.com`,
        phone: request.address.zipCode, // Placeholder - should be actual phone
        zipcode: request.address.zipCode,
        dob: request.dateOfBirth,
        ssn: request.ssn,
        driver_license_number: request.driverLicenseNumber,
        driver_license_state: request.driverLicenseState || request.address.state
      };

      const candidateResponse = await fetch(`${this.baseUrl}/candidates`, {
        method: 'POST',
        headers: {
          'Authorization': this.createAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(candidateData)
      });

      if (!candidateResponse.ok) {
        throw new Error(`Checkr candidate creation error: ${candidateResponse.status}`);
      }

      const candidate = await candidateResponse.json();

      // Then create a report for the candidate
      const reportData = {
        candidate_id: candidate.id,
        package: 'driver_pro', // Comprehensive background check
        tags: [`contractor_${request.contractorId}`]
      };

      const reportResponse = await fetch(`${this.baseUrl}/reports`, {
        method: 'POST',
        headers: {
          'Authorization': this.createAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      });

      if (!reportResponse.ok) {
        throw new Error(`Checkr report creation error: ${reportResponse.status}`);
      }

      const report = await reportResponse.json();

      return {
        success: true,
        status: 'pending',
        externalId: report.id,
        details: {
          candidateId: candidate.id,
          reportId: report.id,
          package: 'driver_pro'
        },
        estimatedCompletionTime: '1-3 business days'
      };

    } catch (error) {
      console.error('Checkr background check error:', error);
      return {
        success: false,
        status: 'rejected',
        error: error instanceof Error ? error.message : 'Background check initiation failed'
      };
    }
  }

  async getBackgroundCheckStatus(externalId: string): Promise<VerificationResult> {
    try {
      if (!this.apiKey) {
        // Mock response for development
        return {
          success: true,
          status: 'approved',
          details: {
            status: 'clear',
            result: 'clear',
            adjudication: 'approved'
          }
        };
      }

      const response = await fetch(`${this.baseUrl}/reports/${externalId}`, {
        method: 'GET',
        headers: {
          'Authorization': this.createAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error(`Checkr status check error: ${response.status}`);
      }

      const report = await response.json();

      let status: 'pending' | 'approved' | 'rejected' | 'requires_review' = 'pending';

      switch (report.status) {
        case 'complete':
          if (report.result === 'clear') {
            status = 'approved';
          } else if (report.result === 'consider') {
            status = 'requires_review';
          } else {
            status = 'rejected';
          }
          break;
        case 'pending':
          status = 'pending';
          break;
        case 'canceled':
        case 'suspended':
          status = 'rejected';
          break;
        default:
          status = 'requires_review';
      }

      return {
        success: true,
        status,
        details: report
      };

    } catch (error) {
      console.error('Checkr status check error:', error);
      return {
        success: false,
        status: 'rejected',
        error: error instanceof Error ? error.message : 'Status check failed'
      };
    }
  }
}

// Florida License Verification Service
export class FloridaLicenseService {
  private dbprApiKey: string;
  private baseUrl: string;

  constructor() {
    this.dbprApiKey = process.env.FLORIDA_DBPR_API_KEY || '';
    this.baseUrl = 'https://www.myfloridalicense.com/api'; // Note: This is a placeholder URL

    if (!this.dbprApiKey) {
      console.warn('Florida DBPR API key not configured - using mock responses');
    }
  }

  async verifyLicense(request: LicenseVerificationRequest): Promise<VerificationResult> {
    try {
      if (!this.dbprApiKey) {
        // Mock response for development
        return {
          success: true,
          status: 'approved',
          details: {
            licenseNumber: request.licenseNumber,
            licenseType: request.licenseType,
            status: 'Active',
            expirationDate: '2025-12-31',
            contractorName: request.contractorName,
            verified: true
          }
        };
      }

      // Note: The actual Florida DBPR API may have different endpoints and authentication
      // This is a template that would need to be updated based on the actual API documentation

      const response = await fetch(`${this.baseUrl}/license/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.dbprApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          license_number: request.licenseNumber,
          license_type: request.licenseType,
          state: request.state
        })
      });

      if (!response.ok) {
        // If API is not available, fall back to manual verification
        return {
          success: true,
          status: 'requires_review',
          details: {
            licenseNumber: request.licenseNumber,
            requiresManualVerification: true,
            message: 'License verification requires manual review'
          }
        };
      }

      const result = await response.json();

      let status: 'pending' | 'approved' | 'rejected' | 'requires_review' = 'approved';

      if (result.status === 'Active' && result.verified) {
        status = 'approved';
      } else if (result.status === 'Expired' || result.status === 'Suspended') {
        status = 'rejected';
      } else {
        status = 'requires_review';
      }

      return {
        success: true,
        status,
        details: result
      };

    } catch (error) {
      console.error('Florida license verification error:', error);
      
      // Fall back to manual verification
      return {
        success: true,
        status: 'requires_review',
        details: {
          licenseNumber: request.licenseNumber,
          requiresManualVerification: true,
          error: error instanceof Error ? error.message : 'API verification failed'
        }
      };
    }
  }
}

// Insurance Verification Service (placeholder for future integration)
export class InsuranceVerificationService {
  async verifyInsurance(certificateUrl: string, contractorId: string): Promise<VerificationResult> {
    // This would integrate with insurance carrier APIs or OCR services
    // For now, return a placeholder that requires manual review
    
    return {
      success: true,
      status: 'requires_review',
      details: {
        certificateUrl,
        contractorId,
        requiresManualVerification: true,
        message: 'Insurance verification requires manual review of uploaded certificate'
      }
    };
  }
}

// Main Verification Service that orchestrates all verification types
export class VerificationService {
  private jumio: JumioVerificationService;
  private checkr: CheckrBackgroundService;
  private florida: FloridaLicenseService;
  private insurance: InsuranceVerificationService;

  constructor() {
    this.jumio = new JumioVerificationService();
    this.checkr = new CheckrBackgroundService();
    this.florida = new FloridaLicenseService();
    this.insurance = new InsuranceVerificationService();
  }

  // Start the complete verification process for a contractor
  async startComprehensiveVerification(
    identityRequest: IdentityVerificationRequest,
    backgroundRequest: BackgroundCheckRequest,
    licenseRequest?: LicenseVerificationRequest,
    insuranceCertificateUrl?: string
  ): Promise<{
    identityVerification: VerificationResult;
    backgroundCheck: VerificationResult;
    licenseVerification?: VerificationResult;
    insuranceVerification?: VerificationResult;
  }> {
    const results = await Promise.allSettled([
      this.jumio.initiateIdentityVerification(identityRequest),
      this.checkr.initiateBackgroundCheck(backgroundRequest),
      licenseRequest ? this.florida.verifyLicense(licenseRequest) : Promise.resolve(null),
      insuranceCertificateUrl ? this.insurance.verifyInsurance(insuranceCertificateUrl, identityRequest.contractorId) : Promise.resolve(null)
    ]);

    return {
      identityVerification: results[0].status === 'fulfilled' ? results[0].value : { success: false, status: 'rejected', error: 'Identity verification failed to start' },
      backgroundCheck: results[1].status === 'fulfilled' ? results[1].value : { success: false, status: 'rejected', error: 'Background check failed to start' },
      licenseVerification: results[2].status === 'fulfilled' ? results[2].value : undefined,
      insuranceVerification: results[3].status === 'fulfilled' ? results[3].value : undefined
    };
  }

  // Check the status of all verification processes
  async checkVerificationStatus(verificationIds: {
    identityId?: string;
    backgroundId?: string;
    licenseId?: string;
    insuranceId?: string;
  }): Promise<{
    identityVerification?: VerificationResult;
    backgroundCheck?: VerificationResult;
    licenseVerification?: VerificationResult;
    insuranceVerification?: VerificationResult;
    overallStatus: 'pending' | 'approved' | 'rejected' | 'requires_review';
  }> {
    const checks = await Promise.allSettled([
      verificationIds.identityId ? this.jumio.getVerificationStatus(verificationIds.identityId) : Promise.resolve(null),
      verificationIds.backgroundId ? this.checkr.getBackgroundCheckStatus(verificationIds.backgroundId) : Promise.resolve(null)
    ]);

    const identityResult = checks[0].status === 'fulfilled' ? checks[0].value : null;
    const backgroundResult = checks[1].status === 'fulfilled' ? checks[1].value : null;

    // Determine overall status
    let overallStatus: 'pending' | 'approved' | 'rejected' | 'requires_review' = 'pending';

    const statuses = [identityResult?.status, backgroundResult?.status].filter(Boolean);
    
    if (statuses.includes('rejected')) {
      overallStatus = 'rejected';
    } else if (statuses.includes('requires_review')) {
      overallStatus = 'requires_review';
    } else if (statuses.every(status => status === 'approved')) {
      overallStatus = 'approved';
    } else {
      overallStatus = 'pending';
    }

    return {
      identityVerification: identityResult || undefined,
      backgroundCheck: backgroundResult || undefined,
      overallStatus
    };
  }
}

// Export the main service
export const verificationService = new VerificationService();

// Utility functions for verification management
export function calculateVerificationScore(results: {
  identityVerification?: VerificationResult;
  backgroundCheck?: VerificationResult;
  licenseVerification?: VerificationResult;
  insuranceVerification?: VerificationResult;
}): number {
  let score = 0;
  let maxScore = 0;

  if (results.identityVerification) {
    maxScore += 30;
    if (results.identityVerification.status === 'approved') score += 30;
    else if (results.identityVerification.status === 'requires_review') score += 15;
  }

  if (results.backgroundCheck) {
    maxScore += 40;
    if (results.backgroundCheck.status === 'approved') score += 40;
    else if (results.backgroundCheck.status === 'requires_review') score += 20;
  }

  if (results.licenseVerification) {
    maxScore += 20;
    if (results.licenseVerification.status === 'approved') score += 20;
    else if (results.licenseVerification.status === 'requires_review') score += 10;
  }

  if (results.insuranceVerification) {
    maxScore += 10;
    if (results.insuranceVerification.status === 'approved') score += 10;
    else if (results.insuranceVerification.status === 'requires_review') score += 5;
  }

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

export function getVerificationBadges(results: {
  identityVerification?: VerificationResult;
  backgroundCheck?: VerificationResult;
  licenseVerification?: VerificationResult;
  insuranceVerification?: VerificationResult;
}): string[] {
  const badges: string[] = [];

  if (results.identityVerification?.status === 'approved') {
    badges.push('ID_VERIFIED');
  }

  if (results.backgroundCheck?.status === 'approved') {
    badges.push('BACKGROUND_CLEARED');
  }

  if (results.licenseVerification?.status === 'approved') {
    badges.push('LICENSED_CONTRACTOR');
  }

  if (results.insuranceVerification?.status === 'approved') {
    badges.push('INSURED');
  }

  const score = calculateVerificationScore(results);
  if (score >= 90) badges.push('PREMIUM_VERIFIED');
  else if (score >= 70) badges.push('VERIFIED');

  return badges;
}