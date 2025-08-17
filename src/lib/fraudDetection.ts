import { supabase } from './supabase';

// Types for fraud detection
export interface FraudCheckResult {
  riskScore: number; // 0-100, higher = more risky
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flags: string[];
  recommendations: string[];
  blocked: boolean;
  reason?: string;
}

export interface TransactionData {
  amount: number;
  currency: string;
  customerId: string;
  contractorId?: string;
  paymentMethodId: string;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  billingAddress?: {
    country: string;
    zipCode: string;
    state: string;
  };
}

export interface UserBehaviorData {
  userId: string;
  accountAge: number; // days
  transactionCount: number;
  averageTransactionAmount: number;
  failedTransactionCount: number;
  chargebackCount: number;
  lastTransactionAt?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  identityVerified: boolean;
}

/**
 * Basic Fraud Detection Service
 */
export class FraudDetectionService {
  private riskThresholds = {
    low: 25,
    medium: 50,
    high: 75,
    critical: 90
  };

  /**
   * Analyze transaction for fraud risk
   */
  async analyzeTransaction(transactionData: TransactionData): Promise<FraudCheckResult> {
    const flags: string[] = [];
    const recommendations: string[] = [];
    let riskScore = 0;

    try {
      // Get user behavior data
      const userBehavior = await this.getUserBehaviorData(transactionData.customerId);
      
      // Amount-based risk checks
      const amountRisk = this.checkAmountRisk(transactionData, userBehavior);
      riskScore += amountRisk.score;
      flags.push(...amountRisk.flags);
      
      // Frequency-based risk checks
      const frequencyRisk = await this.checkFrequencyRisk(transactionData);
      riskScore += frequencyRisk.score;
      flags.push(...frequencyRisk.flags);
      
      // User verification risk checks
      const verificationRisk = this.checkVerificationRisk(userBehavior);
      riskScore += verificationRisk.score;
      flags.push(...verificationRisk.flags);
      
      // Payment method risk checks
      const paymentRisk = await this.checkPaymentMethodRisk(transactionData.paymentMethodId);
      riskScore += paymentRisk.score;
      flags.push(...paymentRisk.flags);
      
      // Geographic risk checks
      const geoRisk = await this.checkGeographicRisk(transactionData);
      riskScore += geoRisk.score;
      flags.push(...geoRisk.flags);
      
      // Historical behavior risk
      const behaviorRisk = this.checkBehaviorRisk(userBehavior);
      riskScore += behaviorRisk.score;
      flags.push(...behaviorRisk.flags);

      // Determine risk level and blocking
      const riskLevel = this.getRiskLevel(riskScore);
      const blocked = riskScore >= this.riskThresholds.critical;
      
      // Generate recommendations
      if (riskScore >= this.riskThresholds.medium) {
        recommendations.push('Require additional verification');
      }
      if (riskScore >= this.riskThresholds.high) {
        recommendations.push('Manual review required');
        recommendations.push('Consider requiring phone verification');
      }
      if (blocked) {
        recommendations.push('Transaction blocked - contact customer');
      }

      // Log fraud check
      await this.logFraudCheck(transactionData, riskScore, flags);

      return {
        riskScore: Math.min(riskScore, 100),
        riskLevel,
        flags: flags.filter(Boolean),
        recommendations,
        blocked,
        reason: blocked ? 'High fraud risk detected' : undefined
      };

    } catch (error) {
      console.error('Fraud detection error:', error);
      
      // Fail safe - allow transaction but flag for review
      return {
        riskScore: 50,
        riskLevel: 'medium',
        flags: ['fraud-detection-error'],
        recommendations: ['Manual review - fraud detection system error'],
        blocked: false
      };
    }
  }

  /**
   * Check amount-based risk factors
   */
  private checkAmountRisk(transactionData: TransactionData, userBehavior: UserBehaviorData) {
    const flags: string[] = [];
    let score = 0;

    // Large transaction risk
    if (transactionData.amount > 5000) {
      flags.push('large-transaction');
      score += 20;
    }

    // Unusual amount for user
    if (userBehavior.averageTransactionAmount > 0) {
      const ratio = transactionData.amount / userBehavior.averageTransactionAmount;
      if (ratio > 5) {
        flags.push('unusual-amount-high');
        score += 15;
      } else if (ratio > 3) {
        flags.push('above-average-amount');
        score += 8;
      }
    }

    // Round number amounts (often fraudulent)
    if (transactionData.amount % 100 === 0 && transactionData.amount >= 1000) {
      flags.push('round-amount');
      score += 5;
    }

    return { score, flags };
  }

  /**
   * Check frequency-based risk factors
   */
  private async checkFrequencyRisk(transactionData: TransactionData) {
    const flags: string[] = [];
    let score = 0;

    try {
      // Check transactions in last hour
      const { data: recentTransactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('customer_id', transactionData.customerId)
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

      if (recentTransactions && recentTransactions.length > 0) {
        if (recentTransactions.length >= 5) {
          flags.push('high-frequency');
          score += 25;
        } else if (recentTransactions.length >= 3) {
          flags.push('multiple-transactions');
          score += 15;
        }

        // Check for rapid succession
        const totalAmount = recentTransactions.reduce((sum, t) => sum + t.amount, 0);
        if (totalAmount > 2000) {
          flags.push('high-volume-short-time');
          score += 20;
        }
      }

    } catch (error) {
      console.error('Frequency check error:', error);
    }

    return { score, flags };
  }

  /**
   * Check user verification risk factors
   */
  private checkVerificationRisk(userBehavior: UserBehaviorData) {
    const flags: string[] = [];
    let score = 0;

    // Account age risk
    if (userBehavior.accountAge < 1) {
      flags.push('new-account');
      score += 20;
    } else if (userBehavior.accountAge < 7) {
      flags.push('young-account');
      score += 10;
    }

    // Verification status risk
    if (!userBehavior.emailVerified) {
      flags.push('email-unverified');
      score += 15;
    }
    if (!userBehavior.phoneVerified) {
      flags.push('phone-unverified');
      score += 10;
    }
    if (!userBehavior.identityVerified) {
      flags.push('identity-unverified');
      score += 20;
    }

    return { score, flags };
  }

  /**
   * Check payment method risk factors
   */
  private async checkPaymentMethodRisk(paymentMethodId: string) {
    const flags: string[] = [];
    let score = 0;

    try {
      const { data: paymentMethod } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('id', paymentMethodId)
        .single();

      if (paymentMethod) {
        // New payment method risk
        const createdAt = new Date(paymentMethod.created_at);
        const ageHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
        
        if (ageHours < 1) {
          flags.push('new-payment-method');
          score += 15;
        }

        // Unverified payment method
        if (!paymentMethod.is_verified) {
          flags.push('unverified-payment-method');
          score += 10;
        }
      }

    } catch (error) {
      console.error('Payment method check error:', error);
    }

    return { score, flags };
  }

  /**
   * Check geographic risk factors
   */
  private async checkGeographicRisk(transactionData: TransactionData) {
    const flags: string[] = [];
    let score = 0;

    // High-risk countries (basic implementation)
    const highRiskCountries = ['CN', 'RU', 'NG', 'PK'];
    
    if (transactionData.billingAddress?.country && 
        highRiskCountries.includes(transactionData.billingAddress.country)) {
      flags.push('high-risk-country');
      score += 25;
    }

    // TODO: Add IP geolocation checks
    // TODO: Add VPN/proxy detection

    return { score, flags };
  }

  /**
   * Check behavioral risk factors
   */
  private checkBehaviorRisk(userBehavior: UserBehaviorData) {
    const flags: string[] = [];
    let score = 0;

    // High failure rate
    if (userBehavior.transactionCount > 0) {
      const failureRate = userBehavior.failedTransactionCount / userBehavior.transactionCount;
      if (failureRate > 0.5) {
        flags.push('high-failure-rate');
        score += 20;
      } else if (failureRate > 0.3) {
        flags.push('elevated-failure-rate');
        score += 10;
      }
    }

    // Chargeback history
    if (userBehavior.chargebackCount > 0) {
      flags.push('chargeback-history');
      score += 30;
    }

    // No transaction history (first transaction)
    if (userBehavior.transactionCount === 0) {
      flags.push('first-transaction');
      score += 10;
    }

    return { score, flags };
  }

  /**
   * Get user behavior data
   */
  private async getUserBehaviorData(userId: string): Promise<UserBehaviorData> {
    try {
      // Get user info
      const { data: user } = await supabase
        .from('users')
        .select('created_at, email_verified, phone_verified')
        .eq('id', userId)
        .single();

      // Get transaction history
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, status')
        .eq('customer_id', userId);

      const accountAge = user ? 
        Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;

      const transactionCount = transactions?.length || 0;
      const failedTransactionCount = transactions?.filter(t => t.status === 'failed').length || 0;
      const averageTransactionAmount = transactionCount > 0 ? 
        transactions!.reduce((sum, t) => sum + t.amount, 0) / transactionCount : 0;

      // TODO: Get chargeback count from payment processor
      const chargebackCount = 0;

      return {
        userId,
        accountAge,
        transactionCount,
        averageTransactionAmount,
        failedTransactionCount,
        chargebackCount,
        emailVerified: user?.email_verified || false,
        phoneVerified: user?.phone_verified || false,
        identityVerified: false // TODO: Check verification status
      };

    } catch (error) {
      console.error('Error getting user behavior data:', error);
      return {
        userId,
        accountAge: 0,
        transactionCount: 0,
        averageTransactionAmount: 0,
        failedTransactionCount: 0,
        chargebackCount: 0,
        emailVerified: false,
        phoneVerified: false,
        identityVerified: false
      };
    }
  }

  /**
   * Determine risk level from score
   */
  private getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= this.riskThresholds.critical) return 'critical';
    if (score >= this.riskThresholds.high) return 'high';
    if (score >= this.riskThresholds.medium) return 'medium';
    return 'low';
  }

  /**
   * Log fraud check for analysis
   */
  private async logFraudCheck(transactionData: TransactionData, riskScore: number, flags: string[]) {
    try {
      await supabase
        .from('fraud_checks')
        .insert({
          customer_id: transactionData.customerId,
          contractor_id: transactionData.contractorId,
          amount: transactionData.amount,
          risk_score: riskScore,
          flags: flags,
          ip_address: transactionData.ipAddress,
          user_agent: transactionData.userAgent,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to log fraud check:', error);
    }
  }

  /**
   * Report false positive (for machine learning improvement)
   */
  async reportFalsePositive(transactionId: string, feedback: string) {
    try {
      await supabase
        .from('fraud_feedback')
        .insert({
          transaction_id: transactionId,
          feedback_type: 'false_positive',
          feedback: feedback,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to report false positive:', error);
    }
  }

  /**
   * Report confirmed fraud (for machine learning improvement)
   */
  async reportConfirmedFraud(transactionId: string, fraudType: string, details: string) {
    try {
      await supabase
        .from('fraud_feedback')
        .insert({
          transaction_id: transactionId,
          feedback_type: 'confirmed_fraud',
          fraud_type: fraudType,
          feedback: details,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to report confirmed fraud:', error);
    }
  }
}

// Export singleton instance
export const fraudDetectionService = new FraudDetectionService();

// Export types
export type {
  FraudCheckResult,
  TransactionData,
  UserBehaviorData
};
