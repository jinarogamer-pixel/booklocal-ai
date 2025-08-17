// Fraud Detection and Risk Management System
// Monitors transactions, user behavior, and identifies suspicious patterns

import { supabase } from './supabase';
import crypto from 'crypto';

export interface FraudRiskScore {
  overall_risk: 'low' | 'medium' | 'high' | 'critical';
  score: number; // 0-100
  factors: FraudRiskFactor[];
  recommended_action: 'approve' | 'review' | 'decline' | 'additional_verification';
  confidence: number; // 0-100
}

export interface FraudRiskFactor {
  type: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  score: number;
  details: any;
}

export interface TransactionAnalysis {
  transaction_id: string;
  user_id: string;
  amount: number;
  risk_score: FraudRiskScore;
  device_fingerprint?: DeviceFingerprint;
  behavioral_analysis?: BehavioralAnalysis;
  external_checks?: ExternalFraudChecks;
  created_at: string;
}

export interface DeviceFingerprint {
  ip_address: string;
  user_agent: string;
  screen_resolution: string;
  timezone: string;
  language: string;
  device_id: string;
  is_mobile: boolean;
  is_tor: boolean;
  is_vpn: boolean;
  geolocation?: {
    country: string;
    region: string;
    city: string;
    lat: number;
    lng: number;
  };
}

export interface BehavioralAnalysis {
  session_duration: number;
  pages_visited: number;
  typing_patterns: any;
  mouse_movements: any;
  time_to_complete: number;
  form_interactions: number;
  suspicious_behaviors: string[];
}

export interface ExternalFraudChecks {
  ip_reputation: 'good' | 'suspicious' | 'bad';
  email_reputation: 'good' | 'suspicious' | 'bad';
  phone_reputation: 'good' | 'suspicious' | 'bad';
  device_reputation: 'good' | 'suspicious' | 'bad';
  blacklist_matches: string[];
  velocity_checks: VelocityCheck[];
}

export interface VelocityCheck {
  type: 'email' | 'ip' | 'device' | 'phone' | 'card';
  count: number;
  timeframe: string;
  threshold: number;
  exceeded: boolean;
}

// Main Fraud Detection Service
export class FraudDetectionService {
  private readonly HIGH_RISK_THRESHOLD = 70;
  private readonly MEDIUM_RISK_THRESHOLD = 40;
  private readonly CRITICAL_RISK_THRESHOLD = 85;

  // Analyze a transaction for fraud risk
  async analyzeTransaction(
    transactionData: {
      user_id: string;
      amount: number;
      payment_method_id?: string;
      booking_id?: string;
      contractor_id?: string;
      device_fingerprint?: DeviceFingerprint;
      behavioral_data?: BehavioralAnalysis;
    }
  ): Promise<TransactionAnalysis> {
    try {
      const riskFactors: FraudRiskFactor[] = [];

      // 1. User-based risk analysis
      const userRiskFactors = await this.analyzeUserRisk(transactionData.user_id);
      riskFactors.push(...userRiskFactors);

      // 2. Transaction amount analysis
      const amountRiskFactors = await this.analyzeTransactionAmount(
        transactionData.user_id,
        transactionData.amount
      );
      riskFactors.push(...amountRiskFactors);

      // 3. Device fingerprint analysis
      if (transactionData.device_fingerprint) {
        const deviceRiskFactors = await this.analyzeDeviceFingerprint(
          transactionData.device_fingerprint,
          transactionData.user_id
        );
        riskFactors.push(...deviceRiskFactors);
      }

      // 4. Behavioral analysis
      if (transactionData.behavioral_data) {
        const behavioralRiskFactors = this.analyzeBehavioralData(
          transactionData.behavioral_data
        );
        riskFactors.push(...behavioralRiskFactors);
      }

      // 5. Velocity checks
      const velocityRiskFactors = await this.performVelocityChecks(
        transactionData.user_id,
        transactionData.device_fingerprint?.ip_address
      );
      riskFactors.push(...velocityRiskFactors);

      // 6. External fraud checks
      const externalChecks = await this.performExternalFraudChecks(
        transactionData.user_id,
        transactionData.device_fingerprint
      );

      // Calculate overall risk score
      const riskScore = this.calculateRiskScore(riskFactors);

      // Store analysis result
      const analysis: TransactionAnalysis = {
        transaction_id: crypto.randomUUID(),
        user_id: transactionData.user_id,
        amount: transactionData.amount,
        risk_score: riskScore,
        device_fingerprint: transactionData.device_fingerprint,
        behavioral_analysis: transactionData.behavioral_data,
        external_checks: externalChecks,
        created_at: new Date().toISOString()
      };

      // Store in database for audit and learning
      await this.storeFraudAnalysis(analysis);

      // Log high-risk transactions
      if (riskScore.overall_risk === 'high' || riskScore.overall_risk === 'critical') {
        await this.logHighRiskTransaction(analysis);
      }

      return analysis;

    } catch (error) {
      console.error('Fraud analysis error:', error);
      
      // Return safe default for errors
      return {
        transaction_id: crypto.randomUUID(),
        user_id: transactionData.user_id,
        amount: transactionData.amount,
        risk_score: {
          overall_risk: 'medium',
          score: 50,
          factors: [{
            type: 'analysis_error',
            description: 'Fraud analysis encountered an error',
            impact: 'medium',
            score: 50,
            details: { error: error instanceof Error ? error.message : 'Unknown error' }
          }],
          recommended_action: 'review',
          confidence: 0
        },
        created_at: new Date().toISOString()
      };
    }
  }

  // Analyze user-specific risk factors
  private async analyzeUserRisk(userId: string): Promise<FraudRiskFactor[]> {
    const factors: FraudRiskFactor[] = [];

    try {
      // Get user data
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!user) {
        factors.push({
          type: 'user_not_found',
          description: 'User account not found',
          impact: 'high',
          score: 80,
          details: { user_id: userId }
        });
        return factors;
      }

      // Check account age
      const accountAge = Date.now() - new Date(user.created_at).getTime();
      const accountAgeDays = accountAge / (1000 * 60 * 60 * 24);

      if (accountAgeDays < 1) {
        factors.push({
          type: 'new_account',
          description: 'Very new account (less than 1 day old)',
          impact: 'high',
          score: 60,
          details: { account_age_days: accountAgeDays }
        });
      } else if (accountAgeDays < 7) {
        factors.push({
          type: 'recent_account',
          description: 'Recent account (less than 1 week old)',
          impact: 'medium',
          score: 30,
          details: { account_age_days: accountAgeDays }
        });
      }

      // Check email verification
      if (!user.email_verified) {
        factors.push({
          type: 'unverified_email',
          description: 'Email address not verified',
          impact: 'medium',
          score: 25,
          details: {}
        });
      }

      // Check phone verification
      if (!user.phone_verified) {
        factors.push({
          type: 'unverified_phone',
          description: 'Phone number not verified',
          impact: 'medium',
          score: 20,
          details: {}
        });
      }

      // Check user status
      if (user.status === 'suspended' || user.status === 'banned') {
        factors.push({
          type: 'suspended_account',
          description: 'Account is suspended or banned',
          impact: 'high',
          score: 90,
          details: { status: user.status }
        });
      }

      // Check previous fraud incidents
      const { data: fraudIncidents } = await supabase
        .from('security_logs')
        .select('*')
        .eq('user_id', userId)
        .in('event_type', ['fraud_detected', 'chargeback', 'dispute'])
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()); // Last 90 days

      if (fraudIncidents && fraudIncidents.length > 0) {
        factors.push({
          type: 'previous_fraud',
          description: `${fraudIncidents.length} fraud incidents in last 90 days`,
          impact: 'high',
          score: Math.min(80, fraudIncidents.length * 20),
          details: { incident_count: fraudIncidents.length }
        });
      }

      // Check failed login attempts
      const { data: failedLogins } = await supabase
        .from('login_attempts')
        .select('*')
        .eq('email', user.email)
        .eq('success', false)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

      if (failedLogins && failedLogins.length >= 5) {
        factors.push({
          type: 'excessive_failed_logins',
          description: `${failedLogins.length} failed login attempts in last 24 hours`,
          impact: 'medium',
          score: Math.min(40, failedLogins.length * 5),
          details: { failed_login_count: failedLogins.length }
        });
      }

    } catch (error) {
      console.error('User risk analysis error:', error);
      factors.push({
        type: 'user_analysis_error',
        description: 'Error analyzing user risk',
        impact: 'low',
        score: 10,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }

    return factors;
  }

  // Analyze transaction amount patterns
  private async analyzeTransactionAmount(
    userId: string,
    amount: number
  ): Promise<FraudRiskFactor[]> {
    const factors: FraudRiskFactor[] = [];

    try {
      // Get user's transaction history
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, created_at')
        .eq('customer_id', userId)
        .eq('status', 'succeeded')
        .order('created_at', { ascending: false })
        .limit(50);

      if (transactions && transactions.length > 0) {
        // Calculate average transaction amount
        const avgAmount = transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length;
        const maxAmount = Math.max(...transactions.map(t => t.amount));

        // Check if current amount is significantly higher than average
        if (amount > avgAmount * 5) {
          factors.push({
            type: 'unusual_amount_high',
            description: `Transaction amount (${amount}) is ${Math.round(amount / avgAmount)}x higher than user's average`,
            impact: 'high',
            score: Math.min(60, Math.round((amount / avgAmount) * 10)),
            details: { amount, average_amount: avgAmount, multiplier: amount / avgAmount }
          });
        }

        // Check if amount is highest ever for this user
        if (amount > maxAmount * 2) {
          factors.push({
            type: 'highest_amount_ever',
            description: 'Transaction amount is significantly higher than any previous transaction',
            impact: 'medium',
            score: 35,
            details: { amount, previous_max: maxAmount }
          });
        }
      }

      // Check for very high amounts
      if (amount > 10000) {
        factors.push({
          type: 'very_high_amount',
          description: `Very high transaction amount: $${amount}`,
          impact: 'medium',
          score: 30,
          details: { amount }
        });
      }

      // Check for round numbers (potential test transactions)
      if (amount % 100 === 0 && amount >= 1000) {
        factors.push({
          type: 'round_number_amount',
          description: 'Transaction amount is a round number, potentially suspicious',
          impact: 'low',
          score: 10,
          details: { amount }
        });
      }

    } catch (error) {
      console.error('Amount analysis error:', error);
    }

    return factors;
  }

  // Analyze device fingerprint for suspicious patterns
  private async analyzeDeviceFingerprint(
    fingerprint: DeviceFingerprint,
    userId: string
  ): Promise<FraudRiskFactor[]> {
    const factors: FraudRiskFactor[] = [];

    try {
      // Check for VPN/Tor usage
      if (fingerprint.is_tor) {
        factors.push({
          type: 'tor_usage',
          description: 'Transaction originated from Tor network',
          impact: 'high',
          score: 70,
          details: { ip_address: fingerprint.ip_address }
        });
      }

      if (fingerprint.is_vpn) {
        factors.push({
          type: 'vpn_usage',
          description: 'Transaction originated from VPN',
          impact: 'medium',
          score: 30,
          details: { ip_address: fingerprint.ip_address }
        });
      }

      // Check for IP address changes
      const { data: recentTransactions } = await supabase
        .from('fraud_analyses')
        .select('device_fingerprint')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(10);

      if (recentTransactions && recentTransactions.length > 0) {
        const uniqueIPs = new Set(
          recentTransactions
            .map(t => t.device_fingerprint?.ip_address)
            .filter(Boolean)
        );
        
        uniqueIPs.add(fingerprint.ip_address);

        if (uniqueIPs.size > 3) {
          factors.push({
            type: 'multiple_ip_addresses',
            description: `${uniqueIPs.size} different IP addresses used in last 24 hours`,
            impact: 'medium',
            score: Math.min(50, uniqueIPs.size * 8),
            details: { unique_ip_count: uniqueIPs.size }
          });
        }
      }

      // Check geolocation consistency
      if (fingerprint.geolocation) {
        const { data: userAddresses } = await supabase
          .from('user_addresses')
          .select('*')
          .eq('user_id', userId)
          .eq('is_primary', true)
          .single();

        if (userAddresses && userAddresses.latitude && userAddresses.longitude) {
          const distance = this.calculateDistance(
            fingerprint.geolocation.lat,
            fingerprint.geolocation.lng,
            userAddresses.latitude,
            userAddresses.longitude
          );

          if (distance > 500) { // More than 500 miles from registered address
            factors.push({
              type: 'location_mismatch',
              description: `Transaction location is ${Math.round(distance)} miles from registered address`,
              impact: 'medium',
              score: Math.min(40, Math.round(distance / 100)),
              details: { 
                distance_miles: distance,
                transaction_location: fingerprint.geolocation,
                registered_location: { lat: userAddresses.latitude, lng: userAddresses.longitude }
              }
            });
          }
        }
      }

      // Check for suspicious user agent patterns
      if (this.isSuspiciousUserAgent(fingerprint.user_agent)) {
        factors.push({
          type: 'suspicious_user_agent',
          description: 'Suspicious or automated user agent detected',
          impact: 'medium',
          score: 35,
          details: { user_agent: fingerprint.user_agent }
        });
      }

    } catch (error) {
      console.error('Device fingerprint analysis error:', error);
    }

    return factors;
  }

  // Analyze behavioral data for suspicious patterns
  private analyzeBehavioralData(behavioral: BehavioralAnalysis): FraudRiskFactor[] {
    const factors: FraudRiskFactor[] = [];

    // Check for very fast completion (potential bot)
    if (behavioral.time_to_complete < 30) { // Less than 30 seconds
      factors.push({
        type: 'very_fast_completion',
        description: 'Transaction completed unusually quickly (potential automation)',
        impact: 'medium',
        score: 40,
        details: { completion_time: behavioral.time_to_complete }
      });
    }

    // Check for very slow completion (potential fraud)
    if (behavioral.time_to_complete > 1800) { // More than 30 minutes
      factors.push({
        type: 'very_slow_completion',
        description: 'Transaction took unusually long to complete',
        impact: 'low',
        score: 15,
        details: { completion_time: behavioral.time_to_complete }
      });
    }

    // Check for minimal interaction
    if (behavioral.form_interactions < 5) {
      factors.push({
        type: 'minimal_interaction',
        description: 'Very few form interactions detected',
        impact: 'medium',
        score: 25,
        details: { interaction_count: behavioral.form_interactions }
      });
    }

    // Check for suspicious behaviors
    if (behavioral.suspicious_behaviors.length > 0) {
      factors.push({
        type: 'suspicious_behaviors',
        description: `${behavioral.suspicious_behaviors.length} suspicious behaviors detected`,
        impact: 'high',
        score: Math.min(60, behavioral.suspicious_behaviors.length * 15),
        details: { behaviors: behavioral.suspicious_behaviors }
      });
    }

    return factors;
  }

  // Perform velocity checks
  private async performVelocityChecks(
    userId: string,
    ipAddress?: string
  ): Promise<FraudRiskFactor[]> {
    const factors: FraudRiskFactor[] = [];

    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Check transaction velocity for user
      const { data: userTransactions } = await supabase
        .from('transactions')
        .select('created_at')
        .eq('customer_id', userId)
        .gte('created_at', oneHourAgo.toISOString());

      if (userTransactions && userTransactions.length > 3) {
        factors.push({
          type: 'high_user_velocity',
          description: `${userTransactions.length} transactions in last hour`,
          impact: 'high',
          score: Math.min(70, userTransactions.length * 15),
          details: { transaction_count: userTransactions.length, timeframe: '1 hour' }
        });
      }

      // Check IP velocity if available
      if (ipAddress) {
        const { data: ipTransactions } = await supabase
          .from('fraud_analyses')
          .select('created_at')
          .eq('device_fingerprint->ip_address', ipAddress)
          .gte('created_at', oneHourAgo.toISOString());

        if (ipTransactions && ipTransactions.length > 5) {
          factors.push({
            type: 'high_ip_velocity',
            description: `${ipTransactions.length} transactions from IP in last hour`,
            impact: 'high',
            score: Math.min(60, ipTransactions.length * 10),
            details: { transaction_count: ipTransactions.length, timeframe: '1 hour', ip_address: ipAddress }
          });
        }
      }

    } catch (error) {
      console.error('Velocity check error:', error);
    }

    return factors;
  }

  // Perform external fraud checks
  private async performExternalFraudChecks(
    userId: string,
    fingerprint?: DeviceFingerprint
  ): Promise<ExternalFraudChecks> {
    const checks: ExternalFraudChecks = {
      ip_reputation: 'good',
      email_reputation: 'good',
      phone_reputation: 'good',
      device_reputation: 'good',
      blacklist_matches: [],
      velocity_checks: []
    };

    try {
      // Get user data
      const { data: user } = await supabase
        .from('users')
        .select('email, phone')
        .eq('id', userId)
        .single();

      if (!user) return checks;

      // Check email reputation (this would integrate with external services)
      if (user.email) {
        const emailReputation = await this.checkEmailReputation(user.email);
        checks.email_reputation = emailReputation;
      }

      // Check IP reputation
      if (fingerprint?.ip_address) {
        const ipReputation = await this.checkIPReputation(fingerprint.ip_address);
        checks.ip_reputation = ipReputation;
      }

      // Check blacklists
      const blacklistMatches = await this.checkBlacklists(user.email, fingerprint?.ip_address);
      checks.blacklist_matches = blacklistMatches;

    } catch (error) {
      console.error('External fraud checks error:', error);
    }

    return checks;
  }

  // Calculate overall risk score
  private calculateRiskScore(factors: FraudRiskFactor[]): FraudRiskScore {
    if (factors.length === 0) {
      return {
        overall_risk: 'low',
        score: 0,
        factors: [],
        recommended_action: 'approve',
        confidence: 100
      };
    }

    // Calculate weighted score
    let totalScore = 0;
    let totalWeight = 0;

    factors.forEach(factor => {
      const weight = factor.impact === 'high' ? 3 : factor.impact === 'medium' ? 2 : 1;
      totalScore += factor.score * weight;
      totalWeight += weight;
    });

    const averageScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    const finalScore = Math.min(100, Math.round(averageScore));

    // Determine risk level and recommended action
    let overallRisk: 'low' | 'medium' | 'high' | 'critical';
    let recommendedAction: 'approve' | 'review' | 'decline' | 'additional_verification';

    if (finalScore >= this.CRITICAL_RISK_THRESHOLD) {
      overallRisk = 'critical';
      recommendedAction = 'decline';
    } else if (finalScore >= this.HIGH_RISK_THRESHOLD) {
      overallRisk = 'high';
      recommendedAction = 'additional_verification';
    } else if (finalScore >= this.MEDIUM_RISK_THRESHOLD) {
      overallRisk = 'medium';
      recommendedAction = 'review';
    } else {
      overallRisk = 'low';
      recommendedAction = 'approve';
    }

    // Calculate confidence based on number and quality of factors
    const highImpactFactors = factors.filter(f => f.impact === 'high').length;
    const confidence = Math.min(100, 60 + (factors.length * 5) + (highImpactFactors * 10));

    return {
      overall_risk: overallRisk,
      score: finalScore,
      factors,
      recommended_action: recommendedAction,
      confidence
    };
  }

  // Store fraud analysis result
  private async storeFraudAnalysis(analysis: TransactionAnalysis): Promise<void> {
    try {
      await supabase
        .from('fraud_analyses')
        .insert({
          id: analysis.transaction_id,
          user_id: analysis.user_id,
          amount: analysis.amount,
          risk_score: analysis.risk_score.score,
          risk_level: analysis.risk_score.overall_risk,
          recommended_action: analysis.risk_score.recommended_action,
          confidence: analysis.risk_score.confidence,
          risk_factors: analysis.risk_score.factors,
          device_fingerprint: analysis.device_fingerprint,
          behavioral_analysis: analysis.behavioral_analysis,
          external_checks: analysis.external_checks,
          created_at: analysis.created_at
        });
    } catch (error) {
      console.error('Error storing fraud analysis:', error);
    }
  }

  // Log high-risk transactions
  private async logHighRiskTransaction(analysis: TransactionAnalysis): Promise<void> {
    try {
      await supabase
        .from('security_logs')
        .insert({
          user_id: analysis.user_id,
          event_type: 'high_risk_transaction',
          severity: analysis.risk_score.overall_risk === 'critical' ? 'critical' : 'high',
          details: {
            transaction_id: analysis.transaction_id,
            risk_score: analysis.risk_score.score,
            risk_level: analysis.risk_score.overall_risk,
            recommended_action: analysis.risk_score.recommended_action,
            amount: analysis.amount,
            top_risk_factors: analysis.risk_score.factors
              .sort((a, b) => b.score - a.score)
              .slice(0, 3)
              .map(f => ({ type: f.type, score: f.score, impact: f.impact }))
          }
        });
    } catch (error) {
      console.error('Error logging high-risk transaction:', error);
    }
  }

  // Helper methods

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /requests/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  private async checkEmailReputation(email: string): Promise<'good' | 'suspicious' | 'bad'> {
    // This would integrate with external email reputation services
    // For now, return mock implementation
    
    // Check for disposable email domains
    const disposableDomains = [
      '10minutemail.com',
      'guerrillamail.com',
      'mailinator.com',
      'tempmail.org',
      'throwaway.email'
    ];

    const domain = email.split('@')[1];
    if (disposableDomains.includes(domain.toLowerCase())) {
      return 'bad';
    }

    // Check for suspicious patterns
    if (email.includes('+') || email.match(/\d{4,}/)) {
      return 'suspicious';
    }

    return 'good';
  }

  private async checkIPReputation(ipAddress: string): Promise<'good' | 'suspicious' | 'bad'> {
    // This would integrate with external IP reputation services
    // For now, return mock implementation
    
    try {
      // Check if IP is in our internal blacklist
      const { data: blockedIP } = await supabase
        .from('blocked_ips')
        .select('*')
        .eq('ip_address', ipAddress)
        .single();

      if (blockedIP) {
        return 'bad';
      }

      // Mock external reputation check
      return 'good';
    } catch (error) {
      return 'good';
    }
  }

  private async checkBlacklists(email?: string, ipAddress?: string): Promise<string[]> {
    const matches: string[] = [];

    try {
      // Check email blacklist
      if (email) {
        const { data: emailBlacklist } = await supabase
          .from('fraud_blacklist')
          .select('*')
          .eq('type', 'email')
          .eq('value', email)
          .single();

        if (emailBlacklist) {
          matches.push(`email_blacklist:${emailBlacklist.reason}`);
        }
      }

      // Check IP blacklist
      if (ipAddress) {
        const { data: ipBlacklist } = await supabase
          .from('fraud_blacklist')
          .select('*')
          .eq('type', 'ip')
          .eq('value', ipAddress)
          .single();

        if (ipBlacklist) {
          matches.push(`ip_blacklist:${ipBlacklist.reason}`);
        }
      }
    } catch (error) {
      console.error('Blacklist check error:', error);
    }

    return matches;
  }
}

// Export the main service
export const fraudDetectionService = new FraudDetectionService();

// Utility functions for fraud management
export function shouldBlockTransaction(riskScore: FraudRiskScore): boolean {
  return riskScore.overall_risk === 'critical' || 
         (riskScore.overall_risk === 'high' && riskScore.confidence > 80);
}

export function shouldRequireAdditionalVerification(riskScore: FraudRiskScore): boolean {
  return riskScore.overall_risk === 'high' || 
         (riskScore.overall_risk === 'medium' && riskScore.score > 50);
}

export function getFraudRiskDescription(riskLevel: string): string {
  switch (riskLevel) {
    case 'low':
      return 'Low fraud risk - transaction can proceed normally';
    case 'medium':
      return 'Medium fraud risk - additional monitoring recommended';
    case 'high':
      return 'High fraud risk - additional verification required';
    case 'critical':
      return 'Critical fraud risk - transaction should be blocked';
    default:
      return 'Unknown risk level';
  }
}

export function getTopRiskFactors(riskScore: FraudRiskScore, count: number = 3): FraudRiskFactor[] {
  return riskScore.factors
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}