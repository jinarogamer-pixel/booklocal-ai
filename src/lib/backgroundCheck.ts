import { supabase } from './supabase';

// Types for background check system
export interface ContractorData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string; // YYYY-MM-DD format
  ssn: string; // Last 4 digits for verification
  zipCode: string;
  contractorId: string;
}

export interface BackgroundCheckResult {
  id: string;
  contractor_id: string;
  provider: 'checkr' | 'sterling' | 'manual';
  external_id?: string;
  status: 'pending' | 'clear' | 'consider' | 'suspended' | 'failed';
  completed_at?: string;
  expires_at?: string;
  report_url?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface CheckrCandidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  zipcode: string;
  dob: string;
  ssn?: string;
  created_at: string;
}

export interface CheckrReport {
  id: string;
  candidate_id: string;
  package: string;
  status: 'pending' | 'consider' | 'clear' | 'suspended';
  completed_at?: string;
  turnaround_time?: number;
  due_time?: string;
  adjudication?: string;
  tags?: string[];
}

/**
 * Checkr Background Check Service
 */
export class CheckrService {
  private apiKey: string;
  private baseUrl: string;
  private isProduction: boolean;

  constructor() {
    this.apiKey = process.env.CHECKR_API_KEY || '';
    this.isProduction = process.env.CHECKR_ENVIRONMENT === 'production';
    this.baseUrl = 'https://api.checkr.com/v1';
  }

  /**
   * Check if Checkr is properly configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Create a candidate in Checkr
   */
  async createCandidate(contractorData: ContractorData): Promise<CheckrCandidate> {
    if (!this.isConfigured()) {
      throw new Error('Checkr API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/candidates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'BookLocal/1.0'
        },
        body: JSON.stringify({
          first_name: contractorData.firstName,
          last_name: contractorData.lastName,
          email: contractorData.email,
          phone: contractorData.phone,
          dob: contractorData.dateOfBirth,
          ssn: contractorData.ssn,
          zipcode: contractorData.zipCode,
          driver_license_number: '', // Optional
          driver_license_state: 'FL' // Default to Florida
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Checkr API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const candidate = await response.json();
      return candidate;

    } catch (error) {
      console.error('Checkr candidate creation failed:', error);
      throw error;
    }
  }

  /**
   * Create a background check report
   */
  async createReport(candidateId: string, packageType: string = 'standard'): Promise<CheckrReport> {
    if (!this.isConfigured()) {
      throw new Error('Checkr API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'BookLocal/1.0'
        },
        body: JSON.stringify({
          candidate_id: candidateId,
          package: packageType
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Checkr report creation error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const report = await response.json();
      return report;

    } catch (error) {
      console.error('Checkr report creation failed:', error);
      throw error;
    }
  }

  /**
   * Get report status
   */
  async getReport(reportId: string): Promise<CheckrReport> {
    if (!this.isConfigured()) {
      throw new Error('Checkr API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/reports/${reportId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'BookLocal/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Checkr API error: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Checkr report retrieval failed:', error);
      throw error;
    }
  }

  /**
   * Cancel a report
   */
  async cancelReport(reportId: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('Checkr API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'BookLocal/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Checkr cancellation error: ${response.status}`);
      }

    } catch (error) {
      console.error('Checkr report cancellation failed:', error);
      throw error;
    }
  }
}

/**
 * Main Background Check Service
 */
export class BackgroundCheckService {
  private checkrService: CheckrService;

  constructor() {
    this.checkrService = new CheckrService();
  }

  /**
   * Initiate background check for contractor
   */
  async initiateBackgroundCheck(contractorData: ContractorData): Promise<BackgroundCheckResult> {
    try {
      // Try Checkr first if configured
      if (this.checkrService.isConfigured()) {
        return await this.initiateCheckrBackgroundCheck(contractorData);
      } else {
        console.warn('Checkr not configured, using manual verification');
        return await this.initiateManualBackgroundCheck(contractorData);
      }

    } catch (error) {
      console.error('Background check initiation failed:', error);
      
      // Fallback to manual process
      console.log('Falling back to manual background check');
      return await this.initiateManualBackgroundCheck(contractorData);
    }
  }

  /**
   * Initiate Checkr background check
   */
  private async initiateCheckrBackgroundCheck(contractorData: ContractorData): Promise<BackgroundCheckResult> {
    try {
      // Create candidate
      const candidate = await this.checkrService.createCandidate(contractorData);
      
      // Create report
      const report = await this.checkrService.createReport(candidate.id, 'standard');

      // Store in database
      const { data: bgCheck, error } = await supabase
        .from('background_checks')
        .insert({
          contractor_id: contractorData.contractorId,
          provider: 'checkr',
          external_id: report.id,
          status: 'pending',
          metadata: {
            candidate_id: candidate.id,
            report_id: report.id,
            package: 'standard',
            checkr_candidate: candidate,
            checkr_report: report
          }
        })
        .select()
        .single();

      if (error) throw error;

      return bgCheck;

    } catch (error) {
      console.error('Checkr background check failed:', error);
      throw error;
    }
  }

  /**
   * Initiate manual background check
   */
  private async initiateManualBackgroundCheck(contractorData: ContractorData): Promise<BackgroundCheckResult> {
    try {
      // Store manual verification request
      const { data: bgCheck, error } = await supabase
        .from('background_checks')
        .insert({
          contractor_id: contractorData.contractorId,
          provider: 'manual',
          status: 'pending',
          metadata: {
            contractor_data: contractorData,
            verification_type: 'manual',
            notes: 'Automated background check unavailable - requires manual verification',
            priority: 'high'
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Add to manual verification queue
      await this.addToManualQueue(bgCheck.id, contractorData);

      return bgCheck;

    } catch (error) {
      console.error('Manual background check initiation failed:', error);
      throw error;
    }
  }

  /**
   * Add to manual verification queue
   */
  private async addToManualQueue(backgroundCheckId: string, contractorData: ContractorData): Promise<void> {
    try {
      await supabase
        .from('manual_verification_queue')
        .insert({
          background_check_id: backgroundCheckId,
          contractor_id: contractorData.contractorId,
          verification_type: 'background_check',
          status: 'pending',
          priority: 'high',
          assigned_to: null,
          notes: `Manual background check required for ${contractorData.firstName} ${contractorData.lastName}`,
          metadata: {
            contractor_data: contractorData,
            requested_at: new Date().toISOString()
          }
        });

    } catch (error) {
      console.error('Failed to add to manual queue:', error);
      throw error;
    }
  }

  /**
   * Update background check status (called by webhook)
   */
  async updateBackgroundCheckStatus(
    externalId: string,
    status: 'clear' | 'consider' | 'suspended',
    reportData: any
  ): Promise<BackgroundCheckResult> {
    try {
      const { data: bgCheck, error } = await supabase
        .from('background_checks')
        .update({
          status,
          completed_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
          metadata: {
            ...reportData,
            updated_at: new Date().toISOString()
          }
        })
        .eq('external_id', externalId)
        .select()
        .single();

      if (error) throw error;

      // Update contractor profile
      await this.updateContractorBackgroundStatus(bgCheck.contractor_id, status);

      return bgCheck;

    } catch (error) {
      console.error('Background check status update failed:', error);
      throw error;
    }
  }

  /**
   * Update contractor profile with background check status
   */
  private async updateContractorBackgroundStatus(
    contractorId: string,
    status: 'clear' | 'consider' | 'suspended'
  ): Promise<void> {
    try {
      await supabase
        .from('contractor_profiles')
        .update({
          background_check_status: status === 'clear' ? 'passed' : status === 'consider' ? 'pending' : 'failed',
          background_check_completed_at: new Date().toISOString()
        })
        .eq('id', contractorId);

    } catch (error) {
      console.error('Contractor background status update failed:', error);
      throw error;
    }
  }

  /**
   * Get background check by contractor ID
   */
  async getBackgroundCheck(contractorId: string): Promise<BackgroundCheckResult | null> {
    try {
      const { data, error } = await supabase
        .from('background_checks')
        .select('*')
        .eq('contractor_id', contractorId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;

    } catch (error) {
      console.error('Background check retrieval failed:', error);
      return null;
    }
  }

  /**
   * Check if background check is required
   */
  async isBackgroundCheckRequired(contractorId: string): Promise<boolean> {
    const existingCheck = await this.getBackgroundCheck(contractorId);
    
    if (!existingCheck) return true;
    
    // Check if existing check is expired or failed
    if (existingCheck.status === 'failed' || existingCheck.status === 'suspended') {
      return true;
    }

    // Check if check is expired (older than 1 year)
    if (existingCheck.expires_at && new Date(existingCheck.expires_at) < new Date()) {
      return true;
    }

    return false;
  }

  /**
   * Get all pending manual verifications
   */
  async getPendingManualVerifications(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('manual_verification_queue')
        .select(`
          *,
          background_checks!inner(*)
        `)
        .eq('verification_type', 'background_check')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Failed to get pending manual verifications:', error);
      return [];
    }
  }
}

// Export singleton instance
export const backgroundCheckService = new BackgroundCheckService();

// Export types
export type {
  ContractorData,
  BackgroundCheckResult,
  CheckrCandidate,
  CheckrReport
};