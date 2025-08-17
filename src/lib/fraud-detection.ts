import { supabase } from './supabase';

// Types for fraud detection
export interface FraudScore {
  score: number; // 0-100, higher = more suspicious
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  factors: FraudFactor[];
  recommended_action: 'approve' | 'review' | 'decline' | 'block';
}

export interface FraudFactor {
  type: string;
  description: string;
  weight: number;
  value: any;
}

export interface TransactionRisk {
  transaction_id: string;
  user_id: string;
  risk_score: number;
  risk_factors: string[];
  status: 'pending' | 'approved' | 'declined' | 'under_review';
  reviewed_by?: string;
  reviewed_at?: string;
  notes?: string;
}

// Main Fraud Detection Service
export class FraudDetectionService {
  private riskThresholds = {
    low: 25,
    medium: 50,
    high: 75,
    critical: 90
  };

  /**
   * Analyze a transaction for fraud risk
   */
  async analyzeTransaction(transactionData: {
    user_id: string;
    amount: number;
    payment_method_id: string;
    booking_id?: string;
    ip_address?: string;
    user_agent?: string;
    billing_address?: any;
  }): Promise<FraudScore> {
    const factors: FraudFactor[] = [];
    let totalScore = 0;

    try {
      // 1. User History Analysis
      const userHistoryScore = await this.analyzeUserHistory(transactionData.user_id);
      factors.push(...userHistoryScore.factors);
      totalScore += userHistoryScore.score;

      // 2. Transaction Amount Analysis
      const amountScore = await this.analyzeTransactionAmount(transactionData.user_id, transactionData.amount);
      factors.push(...amountScore.factors);
      totalScore += amountScore.score;

      // 3. Payment Method Analysis
      const paymentScore = await this.analyzePaymentMethod(transactionData.payment_method_id, transactionData.user_id);
      factors.push(...paymentScore.factors);
      totalScore += paymentScore.score;

      // 4. Geographic Analysis
      if (transactionData.ip_address) {
        const geoScore = await this.analyzeGeography(transactionData.user_id, transactionData.ip_address);
        factors.push(...geoScore.factors);
        totalScore += geoScore.score;
      }

      // 5. Device/Browser Analysis
      if (transactionData.user_agent) {
        const deviceScore = await this.analyzeDevice(transactionData.user_id, transactionData.user_agent);
        factors.push(...deviceScore.factors);
        totalScore += deviceScore.score;
      }

      // 6. Velocity Analysis (frequency of transactions)
      const velocityScore = await this.analyzeTransactionVelocity(transactionData.user_id);
      factors.push(...velocityScore.factors);
      totalScore += velocityScore.score;

      // 7. Blacklist Check
      const blacklistScore = await this.checkBlacklists(transactionData);
      factors.push(...blacklistScore.factors);
      totalScore += blacklistScore.score;

      // Calculate final score and risk level
      const finalScore = Math.min(100, Math.max(0, totalScore));
      const riskLevel = this.calculateRiskLevel(finalScore);
      const recommendedAction = this.getRecommendedAction(finalScore, factors);

      return {
        score: finalScore,
        risk_level: riskLevel,
        factors,
        recommended_action: recommendedAction
      };
    } catch (error) {
      console.error('Fraud analysis error:', error);
      // Return high risk score on error for safety
      return {
        score: 85,
        risk_level: 'high',
        factors: [{
          type: 'system_error',
          description: 'Unable to complete fraud analysis',
          weight: 85,
          value: error.message
        }],
        recommended_action: 'review'
      };
    }
  }

  /**
   * Analyze user's historical behavior
   */
  private async analyzeUserHistory(userId: string): Promise<{ score: number; factors: FraudFactor[] }> {
    const factors: FraudFactor[] = [];
    let score = 0;

    try {
      // Get user account age
      const { data: user } = await supabase
        .from('users')
        .select('created_at, status, email_verified, phone_verified')
        .eq('id', userId)
        .single();

      if (user) {
        const accountAge = Date.now() - new Date(user.created_at).getTime();
        const accountAgeDays = accountAge / (1000 * 60 * 60 * 24);

        // New accounts are riskier
        if (accountAgeDays < 1) {
          score += 30;
          factors.push({
            type: 'new_account',
            description: 'Account created less than 24 hours ago',
            weight: 30,
            value: accountAgeDays
          });
        } else if (accountAgeDays < 7) {
          score += 15;
          factors.push({
            type: 'recent_account',
            description: 'Account created less than 7 days ago',
            weight: 15,
            value: accountAgeDays
          });
        }

        // Unverified accounts are riskier
        if (!user.email_verified) {
          score += 20;
          factors.push({
            type: 'unverified_email',
            description: 'Email address not verified',
            weight: 20,
            value: false
          });
        }

        if (!user.phone_verified) {
          score += 10;
          factors.push({
            type: 'unverified_phone',
            description: 'Phone number not verified',
            weight: 10,
            value: false
          });
        }

        // Suspended accounts
        if (user.status === 'suspended' || user.status === 'banned') {
          score += 100;
          factors.push({
            type: 'suspended_account',
            description: 'Account is suspended or banned',
            weight: 100,
            value: user.status
          });
        }
      }

      // Get transaction history
      const { data: transactions } = await supabase
        .from('transactions')
        .select('status, amount, created_at')
        .eq('customer_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (transactions) {
        const failedTransactions = transactions.filter(t => t.status === 'failed').length;
        const totalTransactions = transactions.length;
        
        if (totalTransactions > 0) {
          const failureRate = failedTransactions / totalTransactions;
          
          if (failureRate > 0.5) {
            score += 40;
            factors.push({
              type: 'high_failure_rate',
              description: 'High rate of failed transactions',
              weight: 40,
              value: failureRate
            });
          } else if (failureRate > 0.3) {
            score += 20;
            factors.push({
              type: 'elevated_failure_rate',
              description: 'Elevated rate of failed transactions',
              weight: 20,
              value: failureRate
            });
          }
        }

        // Check for chargebacks
        const chargebacks = transactions.filter(t => t.status === 'disputed').length;
        if (chargebacks > 0) {
          score += chargebacks * 25;
          factors.push({
            type: 'chargeback_history',
            description: 'Previous chargebacks on account',
            weight: chargebacks * 25,
            value: chargebacks
          });
        }
      }

    } catch (error) {
      console.error('User history analysis error:', error);
    }

    return { score, factors };
  }

  /**
   * Analyze transaction amount patterns
   */
  private async analyzeTransactionAmount(userId: string, amount: number): Promise<{ score: number; factors: FraudFactor[] }> {
    const factors: FraudFactor[] = [];
    let score = 0;

    try {
      // Get user's average transaction amount
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('customer_id', userId)
        .eq('status', 'succeeded')
        .limit(20);

      if (transactions && transactions.length > 0) {
        const amounts = transactions.map(t => t.amount);
        const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
        const maxAmount = Math.max(...amounts);

        // Check if this transaction is significantly higher than usual
        if (amount > avgAmount * 5 && amount > 1000) {
          score += 25;
          factors.push({
            type: 'unusual_amount',
            description: 'Transaction amount significantly higher than user average',
            weight: 25,
            value: { amount, avgAmount, ratio: amount / avgAmount }
          });
        }

        // Check if this is the highest amount ever
        if (amount > maxAmount * 2 && amount > 500) {
          score += 15;
          factors.push({
            type: 'highest_amount',
            description: 'Highest transaction amount for this user',
            weight: 15,
            value: { amount, previousMax: maxAmount }
          });
        }
      }

      // High-value transactions are inherently riskier
      if (amount > 5000) {
        score += 20;
        factors.push({
          type: 'high_value',
          description: 'High-value transaction (>$5,000)',
          weight: 20,
          value: amount
        });
      } else if (amount > 2000) {
        score += 10;
        factors.push({
          type: 'elevated_value',
          description: 'Elevated-value transaction (>$2,000)',
          weight: 10,
          value: amount
        });
      }

    } catch (error) {
      console.error('Amount analysis error:', error);
    }

    return { score, factors };
  }

  /**
   * Analyze payment method risk
   */
  private async analyzePaymentMethod(paymentMethodId: string, userId: string): Promise<{ score: number; factors: FraudFactor[] }> {
    const factors: FraudFactor[] = [];
    let score = 0;

    try {
      // Get payment method details
      const { data: paymentMethod } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('id', paymentMethodId)
        .single();

      if (paymentMethod) {
        // New payment methods are riskier
        const methodAge = Date.now() - new Date(paymentMethod.created_at).getTime();
        const methodAgeHours = methodAge / (1000 * 60 * 60);

        if (methodAgeHours < 1) {
          score += 25;
          factors.push({
            type: 'new_payment_method',
            description: 'Payment method added less than 1 hour ago',
            weight: 25,
            value: methodAgeHours
          });
        } else if (methodAgeHours < 24) {
          score += 10;
          factors.push({
            type: 'recent_payment_method',
            description: 'Payment method added less than 24 hours ago',
            weight: 10,
            value: methodAgeHours
          });
        }

        // Unverified payment methods
        if (!paymentMethod.is_verified) {
          score += 15;
          factors.push({
            type: 'unverified_payment_method',
            description: 'Payment method not verified',
            weight: 15,
            value: false
          });
        }

        // Check if this payment method has been used by multiple accounts
        const { data: usageCount } = await supabase
          .from('payment_methods')
          .select('user_id')
          .eq('external_id', paymentMethod.external_id);

        if (usageCount && usageCount.length > 1) {
          const uniqueUsers = new Set(usageCount.map(pm => pm.user_id));
          if (uniqueUsers.size > 1) {
            score += 30;
            factors.push({
              type: 'shared_payment_method',
              description: 'Payment method used by multiple accounts',
              weight: 30,
              value: uniqueUsers.size
            });
          }
        }
      }

    } catch (error) {
      console.error('Payment method analysis error:', error);
    }

    return { score, factors };
  }

  /**
   * Analyze geographic patterns
   */
  private async analyzeGeography(userId: string, ipAddress: string): Promise<{ score: number; factors: FraudFactor[] }> {
    const factors: FraudFactor[] = [];
    let score = 0;

    try {
      // Get IP geolocation (would need a service like MaxMind)
      // For now, we'll use a simple check
      
      // Get user's previous IP addresses
      const { data: loginAttempts } = await supabase
        .from('login_attempts')
        .select('ip_address, created_at')
        .eq('email', userId) // This should be email, need to adjust
        .eq('success', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (loginAttempts && loginAttempts.length > 0) {
        const recentIPs = loginAttempts.map(attempt => attempt.ip_address);
        
        // Check if this is a new IP address
        if (!recentIPs.includes(ipAddress)) {
          score += 15;
          factors.push({
            type: 'new_ip_address',
            description: 'Transaction from new IP address',
            weight: 15,
            value: ipAddress
          });
        }
      }

      // Check against known high-risk IP ranges (VPNs, proxies, etc.)
      // This would require a database of known risky IPs
      if (await this.isHighRiskIP(ipAddress)) {
        score += 35;
        factors.push({
          type: 'high_risk_ip',
          description: 'Transaction from high-risk IP address (VPN/Proxy)',
          weight: 35,
          value: ipAddress
        });
      }

    } catch (error) {
      console.error('Geography analysis error:', error);
    }

    return { score, factors };
  }

  /**
   * Analyze device and browser patterns
   */
  private async analyzeDevice(userId: string, userAgent: string): Promise<{ score: number; factors: FraudFactor[] }> {
    const factors: FraudFactor[] = [];
    let score = 0;

    try {
      // Simple user agent analysis
      const isBot = /bot|crawler|spider|scraper/i.test(userAgent);
      if (isBot) {
        score += 50;
        factors.push({
          type: 'bot_user_agent',
          description: 'Request from automated bot/crawler',
          weight: 50,
          value: userAgent
        });
      }

      // Check for suspicious user agents
      const suspiciousPatterns = [
        /curl/i,
        /wget/i,
        /python/i,
        /postman/i
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(userAgent)) {
          score += 25;
          factors.push({
            type: 'suspicious_user_agent',
            description: 'Suspicious user agent detected',
            weight: 25,
            value: userAgent
          });
          break;
        }
      }

    } catch (error) {
      console.error('Device analysis error:', error);
    }

    return { score, factors };
  }

  /**
   * Analyze transaction velocity (frequency)
   */
  private async analyzeTransactionVelocity(userId: string): Promise<{ score: number; factors: FraudFactor[] }> {
    const factors: FraudFactor[] = [];
    let score = 0;

    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Count transactions in the last hour
      const { data: recentTransactions } = await supabase
        .from('transactions')
        .select('id')
        .eq('customer_id', userId)
        .gte('created_at', oneHourAgo.toISOString());

      if (recentTransactions && recentTransactions.length > 3) {
        score += 30;
        factors.push({
          type: 'high_velocity_hour',
          description: 'Multiple transactions in the last hour',
          weight: 30,
          value: recentTransactions.length
        });
      }

      // Count transactions in the last day
      const { data: dailyTransactions } = await supabase
        .from('transactions')
        .select('id')
        .eq('customer_id', userId)
        .gte('created_at', oneDayAgo.toISOString());

      if (dailyTransactions && dailyTransactions.length > 10) {
        score += 20;
        factors.push({
          type: 'high_velocity_day',
          description: 'Many transactions in the last 24 hours',
          weight: 20,
          value: dailyTransactions.length
        });
      }

    } catch (error) {
      console.error('Velocity analysis error:', error);
    }

    return { score, factors };
  }

  /**
   * Check various blacklists
   */
  private async checkBlacklists(transactionData: any): Promise<{ score: number; factors: FraudFactor[] }> {
    const factors: FraudFactor[] = [];
    let score = 0;

    try {
      // Check if user is on internal blacklist
      const { data: blockedUser } = await supabase
        .from('blocked_users')
        .select('reason')
        .eq('user_id', transactionData.user_id)
        .single();

      if (blockedUser) {
        score += 100;
        factors.push({
          type: 'blacklisted_user',
          description: 'User is on internal blacklist',
          weight: 100,
          value: blockedUser.reason
        });
      }

      // Check if IP is blocked
      if (transactionData.ip_address) {
        const { data: blockedIP } = await supabase
          .from('blocked_ips')
          .select('reason')
          .eq('ip_address', transactionData.ip_address)
          .single();

        if (blockedIP) {
          score += 80;
          factors.push({
            type: 'blacklisted_ip',
            description: 'IP address is blocked',
            weight: 80,
            value: blockedIP.reason
          });
        }
      }

    } catch (error) {
      console.error('Blacklist check error:', error);
    }

    return { score, factors };
  }

  /**
   * Calculate risk level based on score
   */
  private calculateRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= this.riskThresholds.critical) return 'critical';
    if (score >= this.riskThresholds.high) return 'high';
    if (score >= this.riskThresholds.medium) return 'medium';
    return 'low';
  }

  /**
   * Get recommended action based on score and factors
   */
  private getRecommendedAction(score: number, factors: FraudFactor[]): 'approve' | 'review' | 'decline' | 'block' {
    // Check for critical factors that require immediate blocking
    const criticalFactors = factors.filter(f => 
      f.type === 'blacklisted_user' || 
      f.type === 'suspended_account' ||
      f.weight >= 80
    );

    if (criticalFactors.length > 0) return 'block';

    if (score >= this.riskThresholds.critical) return 'decline';
    if (score >= this.riskThresholds.high) return 'review';
    if (score >= this.riskThresholds.medium) return 'review';
    return 'approve';
  }

  /**
   * Check if IP is from a high-risk source
   */
  private async isHighRiskIP(ipAddress: string): Promise<boolean> {
    // This would integrate with services like:
    // - MaxMind GeoIP2
    // - IPQualityScore
    // - VirusTotal
    // For now, return false
    return false;
  }

  /**
   * Record fraud analysis result
   */
  async recordFraudAnalysis(transactionId: string, userId: string, fraudScore: FraudScore): Promise<void> {
    try {
      await supabase
        .from('fraud_analyses')
        .insert({
          transaction_id: transactionId,
          user_id: userId,
          risk_score: fraudScore.score,
          risk_level: fraudScore.risk_level,
          recommended_action: fraudScore.recommended_action,
          risk_factors: fraudScore.factors.map(f => ({
            type: f.type,
            description: f.description,
            weight: f.weight,
            value: f.value
          })),
          analyzed_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error recording fraud analysis:', error);
    }
  }

  /**
   * Handle chargeback notification
   */
  async handleChargeback(chargebackData: {
    payment_intent_id: string;
    amount: number;
    reason: string;
    status: string;
  }): Promise<void> {
    try {
      // Find the transaction
      const { data: transaction } = await supabase
        .from('transactions')
        .select('*')
        .eq('external_id', chargebackData.payment_intent_id)
        .single();

      if (transaction) {
        // Update transaction status
        await supabase
          .from('transactions')
          .update({
            status: 'disputed',
            metadata: {
              ...transaction.metadata,
              chargeback: chargebackData
            }
          })
          .eq('id', transaction.id);

        // Increase user's risk score
        await this.increaseUserRiskScore(transaction.customer_id, 50);

        // Notify admin team
        await this.notifyChargebackTeam(transaction, chargebackData);

        // If this user has multiple chargebacks, consider blocking
        const { data: userChargebacks } = await supabase
          .from('transactions')
          .select('id')
          .eq('customer_id', transaction.customer_id)
          .eq('status', 'disputed');

        if (userChargebacks && userChargebacks.length >= 3) {
          await this.blockUser(transaction.customer_id, 'Multiple chargebacks');
        }
      }
    } catch (error) {
      console.error('Chargeback handling error:', error);
    }
  }

  /**
   * Increase user's risk score
   */
  private async increaseUserRiskScore(userId: string, points: number): Promise<void> {
    try {
      const { data: riskProfile } = await supabase
        .from('user_risk_profiles')
        .select('risk_score')
        .eq('user_id', userId)
        .single();

      const newScore = (riskProfile?.risk_score || 0) + points;

      await supabase
        .from('user_risk_profiles')
        .upsert({
          user_id: userId,
          risk_score: Math.min(100, newScore),
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating user risk score:', error);
    }
  }

  /**
   * Block a user
   */
  private async blockUser(userId: string, reason: string): Promise<void> {
    try {
      await supabase
        .from('blocked_users')
        .insert({
          user_id: userId,
          reason,
          blocked_at: new Date().toISOString()
        });

      await supabase
        .from('users')
        .update({ status: 'banned' })
        .eq('id', userId);
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  }

  private async notifyChargebackTeam(transaction: any, chargebackData: any): Promise<void> {
    // Implementation would send notification to admin team
    console.log(`Chargeback received for transaction ${transaction.id}:`, chargebackData);
  }
}

// Export the main service instance
export const fraudDetectionService = new FraudDetectionService();