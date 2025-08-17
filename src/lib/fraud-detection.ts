import { supabase } from './supabase';

// Types
export interface FraudRiskScore {
  score: number; // 0-100, higher = more risky
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: FraudRiskFactor[];
  recommendations: string[];
}

export interface FraudRiskFactor {
  type: string;
  description: string;
  weight: number;
  value: any;
  impact: number; // -100 to +100
}

export interface FraudAlert {
  id: string;
  user_id: string;
  booking_id?: string;
  transaction_id?: string;
  alert_type: 'velocity' | 'pattern' | 'device' | 'payment' | 'behavior' | 'location';
  severity: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  description: string;
  metadata: Record<string, any>;
  status: 'active' | 'investigated' | 'resolved' | 'false_positive';
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
}

export interface UserRiskProfile {
  user_id: string;
  current_risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  total_transactions: number;
  successful_transactions: number;
  failed_transactions: number;
  disputed_transactions: number;
  average_transaction_amount: number;
  account_age_days: number;
  verification_status: 'unverified' | 'partial' | 'verified';
  device_fingerprints: string[];
  ip_addresses: string[];
  location_history: any[];
  behavioral_patterns: Record<string, any>;
  last_risk_assessment: string;
  flags: string[];
  created_at: string;
  updated_at: string;
}

export class FraudDetectionService {
  /**
   * Analyze transaction for fraud risk
   */
  static async analyzeTransaction(params: {
    userId: string;
    bookingId?: string;
    amount: number;
    paymentMethodId: string;
    ipAddress: string;
    userAgent: string;
    deviceFingerprint?: string;
    location?: { lat: number; lng: number };
  }): Promise<FraudRiskScore> {
    try {
      const factors: FraudRiskFactor[] = [];
      let totalScore = 0;

      // Get user risk profile
      const userProfile = await this.getUserRiskProfile(params.userId);
      
      // 1. Velocity Analysis
      const velocityRisk = await this.analyzeVelocity(params.userId, params.amount);
      factors.push(velocityRisk);
      totalScore += velocityRisk.impact;

      // 2. Amount Analysis
      const amountRisk = await this.analyzeAmount(params.userId, params.amount);
      factors.push(amountRisk);
      totalScore += amountRisk.impact;

      // 3. Device/IP Analysis
      const deviceRisk = await this.analyzeDevice(params.userId, params.ipAddress, params.deviceFingerprint);
      factors.push(deviceRisk);
      totalScore += deviceRisk.impact;

      // 4. Location Analysis
      if (params.location) {
        const locationRisk = await this.analyzeLocation(params.userId, params.location);
        factors.push(locationRisk);
        totalScore += locationRisk.impact;
      }

      // 5. Payment Method Analysis
      const paymentRisk = await this.analyzePaymentMethod(params.userId, params.paymentMethodId);
      factors.push(paymentRisk);
      totalScore += paymentRisk.impact;

      // 6. User Behavior Analysis
      const behaviorRisk = await this.analyzeBehavior(params.userId, params.userAgent);
      factors.push(behaviorRisk);
      totalScore += behaviorRisk.impact;

      // 7. Account Age and Verification
      const accountRisk = await this.analyzeAccount(params.userId);
      factors.push(accountRisk);
      totalScore += accountRisk.impact;

      // Normalize score (0-100)
      const normalizedScore = Math.max(0, Math.min(100, 50 + totalScore));
      
      const riskLevel = this.getRiskLevel(normalizedScore);
      const recommendations = this.generateRecommendations(normalizedScore, factors);

      // Log the analysis
      await this.logFraudAnalysis({
        user_id: params.userId,
        booking_id: params.bookingId,
        risk_score: normalizedScore,
        risk_level: riskLevel,
        factors,
        ip_address: params.ipAddress,
        device_fingerprint: params.deviceFingerprint
      });

      return {
        score: normalizedScore,
        level: riskLevel,
        factors,
        recommendations
      };
    } catch (error) {
      console.error('Error analyzing transaction fraud risk:', error);
      return {
        score: 50, // Default medium risk
        level: 'medium',
        factors: [],
        recommendations: ['Manual review recommended due to analysis error']
      };
    }
  }

  /**
   * Analyze transaction velocity (frequency and amounts)
   */
  private static async analyzeVelocity(userId: string, amount: number): Promise<FraudRiskFactor> {
    try {
      const now = new Date();
      const oneHour = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDay = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get recent transactions
      const { data: recentTransactions } = await supabase
        .from('transactions')
        .select('amount, created_at')
        .eq('customer_id', userId)
        .gte('created_at', oneDay.toISOString())
        .order('created_at', { ascending: false });

      const transactions = recentTransactions || [];
      const hourlyTransactions = transactions.filter(t => new Date(t.created_at) >= oneHour);
      const dailyAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
      const hourlyAmount = hourlyTransactions.reduce((sum, t) => sum + t.amount, 0);

      let impact = 0;
      let description = 'Normal transaction velocity';

      // Check for high frequency
      if (hourlyTransactions.length >= 5) {
        impact += 30;
        description = `High frequency: ${hourlyTransactions.length} transactions in last hour`;
      } else if (hourlyTransactions.length >= 3) {
        impact += 15;
        description = `Moderate frequency: ${hourlyTransactions.length} transactions in last hour`;
      }

      // Check for high amounts
      if (dailyAmount + amount > 5000) {
        impact += 25;
        description += `. High daily volume: $${(dailyAmount + amount).toFixed(2)}`;
      } else if (dailyAmount + amount > 2000) {
        impact += 10;
        description += `. Moderate daily volume: $${(dailyAmount + amount).toFixed(2)}`;
      }

      return {
        type: 'velocity',
        description,
        weight: 0.3,
        value: { hourlyCount: hourlyTransactions.length, dailyAmount: dailyAmount + amount },
        impact
      };
    } catch (error) {
      console.error('Error analyzing velocity:', error);
      return {
        type: 'velocity',
        description: 'Velocity analysis failed',
        weight: 0.3,
        value: null,
        impact: 10 // Small penalty for analysis failure
      };
    }
  }

  /**
   * Analyze transaction amount patterns
   */
  private static async analyzeAmount(userId: string, amount: number): Promise<FraudRiskFactor> {
    try {
      // Get user's transaction history
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('customer_id', userId)
        .eq('status', 'succeeded')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!transactions || transactions.length === 0) {
        // First transaction - higher risk
        return {
          type: 'amount',
          description: 'First transaction for user',
          weight: 0.2,
          value: { amount, isFirst: true },
          impact: amount > 1000 ? 25 : 10
        };
      }

      const amounts = transactions.map(t => t.amount);
      const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
      const maxAmount = Math.max(...amounts);

      let impact = 0;
      let description = 'Amount within normal range';

      // Check if amount is significantly higher than usual
      if (amount > avgAmount * 3) {
        impact += 20;
        description = `Amount ${amount} is 3x higher than average ${avgAmount.toFixed(2)}`;
      } else if (amount > avgAmount * 2) {
        impact += 10;
        description = `Amount ${amount} is 2x higher than average ${avgAmount.toFixed(2)}`;
      }

      // Check for round numbers (common in fraud)
      if (amount % 100 === 0 && amount >= 500) {
        impact += 5;
        description += '. Round number amount';
      }

      return {
        type: 'amount',
        description,
        weight: 0.2,
        value: { amount, avgAmount, maxAmount },
        impact
      };
    } catch (error) {
      console.error('Error analyzing amount:', error);
      return {
        type: 'amount',
        description: 'Amount analysis failed',
        weight: 0.2,
        value: { amount },
        impact: 5
      };
    }
  }

  /**
   * Analyze device and IP patterns
   */
  private static async analyzeDevice(userId: string, ipAddress: string, deviceFingerprint?: string): Promise<FraudRiskFactor> {
    try {
      // Get user's device history
      const { data: securityLogs } = await supabase
        .from('security_logs')
        .select('ip_address, details')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
        .order('created_at', { ascending: false });

      let impact = 0;
      let description = 'Known device/IP';

      if (!securityLogs || securityLogs.length === 0) {
        impact += 15;
        description = 'New user with no history';
      } else {
        const knownIPs = [...new Set(securityLogs.map(log => log.ip_address))];
        const isNewIP = !knownIPs.includes(ipAddress);

        if (isNewIP) {
          impact += 10;
          description = 'New IP address';
        }

        // Check for device fingerprint if available
        if (deviceFingerprint) {
          const knownFingerprints = securityLogs
            .map(log => log.details?.device_fingerprint)
            .filter(fp => fp);
          
          const isNewDevice = !knownFingerprints.includes(deviceFingerprint);
          if (isNewDevice) {
            impact += 10;
            description += isNewIP ? ' and new device' : 'New device';
          }
        }
      }

      // Check for suspicious IP patterns (VPN, Tor, etc.)
      // This would integrate with IP intelligence services
      const ipRisk = await this.checkIPReputation(ipAddress);
      impact += ipRisk.impact;
      if (ipRisk.impact > 0) {
        description += `. ${ipRisk.description}`;
      }

      return {
        type: 'device',
        description,
        weight: 0.25,
        value: { ipAddress, deviceFingerprint },
        impact
      };
    } catch (error) {
      console.error('Error analyzing device:', error);
      return {
        type: 'device',
        description: 'Device analysis failed',
        weight: 0.25,
        value: { ipAddress, deviceFingerprint },
        impact: 10
      };
    }
  }

  /**
   * Analyze location patterns
   */
  private static async analyzeLocation(userId: string, location: { lat: number; lng: number }): Promise<FraudRiskFactor> {
    try {
      // Get user's recent locations
      const { data: recentBookings } = await supabase
        .from('bookings')
        .select(`
          address_id,
          user_addresses!inner(latitude, longitude)
        `)
        .eq('customer_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .limit(10);

      let impact = 0;
      let description = 'Location within normal range';

      if (!recentBookings || recentBookings.length === 0) {
        impact += 5;
        description = 'First location for user';
      } else {
        // Calculate distance from recent locations
        const distances = recentBookings
          .filter(booking => booking.user_addresses?.latitude && booking.user_addresses?.longitude)
          .map(booking => {
            const addr = booking.user_addresses;
            return this.calculateDistance(
              location.lat, location.lng,
              addr.latitude, addr.longitude
            );
          });

        if (distances.length > 0) {
          const minDistance = Math.min(...distances);
          const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;

          // Check for unusual distance from normal locations
          if (minDistance > 500) { // More than 500 miles
            impact += 20;
            description = `Location ${minDistance.toFixed(0)} miles from usual area`;
          } else if (minDistance > 100) { // More than 100 miles
            impact += 10;
            description = `Location ${minDistance.toFixed(0)} miles from usual area`;
          }
        }
      }

      return {
        type: 'location',
        description,
        weight: 0.15,
        value: location,
        impact
      };
    } catch (error) {
      console.error('Error analyzing location:', error);
      return {
        type: 'location',
        description: 'Location analysis failed',
        weight: 0.15,
        value: location,
        impact: 5
      };
    }
  }

  /**
   * Analyze payment method patterns
   */
  private static async analyzePaymentMethod(userId: string, paymentMethodId: string): Promise<FraudRiskFactor> {
    try {
      // Get payment method details
      const { data: paymentMethod } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('id', paymentMethodId)
        .single();

      let impact = 0;
      let description = 'Payment method verified';

      if (!paymentMethod) {
        impact += 25;
        description = 'Payment method not found';
      } else {
        // Check if payment method is verified
        if (!paymentMethod.is_verified) {
          impact += 15;
          description = 'Unverified payment method';
        }

        // Check if this is a new payment method
        const { data: userPaymentMethods } = await supabase
          .from('payment_methods')
          .select('id, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: true });

        if (userPaymentMethods && userPaymentMethods.length > 0) {
          const isNewest = userPaymentMethods[userPaymentMethods.length - 1].id === paymentMethodId;
          const methodAge = new Date().getTime() - new Date(paymentMethod.created_at).getTime();
          const ageHours = methodAge / (1000 * 60 * 60);

          if (isNewest && ageHours < 1) {
            impact += 15;
            description = 'Payment method added less than 1 hour ago';
          } else if (isNewest && ageHours < 24) {
            impact += 8;
            description = 'Payment method added less than 24 hours ago';
          }
        }
      }

      return {
        type: 'payment_method',
        description,
        weight: 0.2,
        value: { paymentMethodId, verified: paymentMethod?.is_verified },
        impact
      };
    } catch (error) {
      console.error('Error analyzing payment method:', error);
      return {
        type: 'payment_method',
        description: 'Payment method analysis failed',
        weight: 0.2,
        value: { paymentMethodId },
        impact: 10
      };
    }
  }

  /**
   * Analyze user behavior patterns
   */
  private static async analyzeBehavior(userId: string, userAgent: string): Promise<FraudRiskFactor> {
    try {
      // Get user's behavior history
      const { data: securityLogs } = await supabase
        .from('security_logs')
        .select('user_agent, event_type, created_at')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
        .order('created_at', { ascending: false });

      let impact = 0;
      let description = 'Normal behavior pattern';

      if (!securityLogs || securityLogs.length === 0) {
        impact += 10;
        description = 'No behavior history';
      } else {
        // Check for user agent consistency
        const knownUserAgents = [...new Set(securityLogs.map(log => log.user_agent))];
        const isNewUserAgent = !knownUserAgents.includes(userAgent);

        if (isNewUserAgent && knownUserAgents.length > 0) {
          impact += 8;
          description = 'New browser/device detected';
        }

        // Check for rapid actions (bot-like behavior)
        const recentActions = securityLogs.filter(log => 
          new Date().getTime() - new Date(log.created_at).getTime() < 60 * 60 * 1000 // Last hour
        );

        if (recentActions.length > 20) {
          impact += 20;
          description = 'Unusually high activity (possible bot)';
        } else if (recentActions.length > 10) {
          impact += 10;
          description = 'High activity level';
        }
      }

      return {
        type: 'behavior',
        description,
        weight: 0.15,
        value: { userAgent, activityLevel: securityLogs?.length || 0 },
        impact
      };
    } catch (error) {
      console.error('Error analyzing behavior:', error);
      return {
        type: 'behavior',
        description: 'Behavior analysis failed',
        weight: 0.15,
        value: { userAgent },
        impact: 5
      };
    }
  }

  /**
   * Analyze account age and verification status
   */
  private static async analyzeAccount(userId: string): Promise<FraudRiskFactor> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('created_at, email_verified, phone_verified, user_type')
        .eq('id', userId)
        .single();

      let impact = 0;
      let description = 'Established account';

      if (!user) {
        impact += 30;
        description = 'User not found';
      } else {
        const accountAge = new Date().getTime() - new Date(user.created_at).getTime();
        const ageDays = accountAge / (1000 * 60 * 60 * 24);

        // Account age risk
        if (ageDays < 1) {
          impact += 25;
          description = 'Account created less than 1 day ago';
        } else if (ageDays < 7) {
          impact += 15;
          description = 'Account created less than 1 week ago';
        } else if (ageDays < 30) {
          impact += 8;
          description = 'Account created less than 1 month ago';
        }

        // Verification status
        if (!user.email_verified) {
          impact += 15;
          description += '. Email not verified';
        }
        if (!user.phone_verified) {
          impact += 10;
          description += '. Phone not verified';
        }
      }

      return {
        type: 'account',
        description,
        weight: 0.2,
        value: { 
          ageDays: user ? (new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24) : 0,
          emailVerified: user?.email_verified,
          phoneVerified: user?.phone_verified
        },
        impact
      };
    } catch (error) {
      console.error('Error analyzing account:', error);
      return {
        type: 'account',
        description: 'Account analysis failed',
        weight: 0.2,
        value: null,
        impact: 15
      };
    }
  }

  /**
   * Check IP reputation using external services
   */
  private static async checkIPReputation(ipAddress: string): Promise<{ impact: number; description: string }> {
    try {
      // This would integrate with IP reputation services like:
      // - MaxMind GeoIP2
      // - IPQualityScore
      // - AbuseIPDB
      // For now, we'll do basic checks

      // Check for private/local IPs
      if (this.isPrivateIP(ipAddress)) {
        return { impact: 5, description: 'Private IP address' };
      }

      // Check for known VPN/proxy ranges (simplified)
      // In production, you'd use a proper IP intelligence service
      const suspiciousRanges = [
        '10.0.0.0/8',
        '172.16.0.0/12',
        '192.168.0.0/16'
      ];

      // This is a simplified check - in production you'd use proper CIDR matching
      for (const range of suspiciousRanges) {
        if (ipAddress.startsWith(range.split('/')[0].substring(0, 3))) {
          return { impact: 10, description: 'Potentially suspicious IP range' };
        }
      }

      return { impact: 0, description: 'IP appears clean' };
    } catch (error) {
      console.error('Error checking IP reputation:', error);
      return { impact: 5, description: 'IP reputation check failed' };
    }
  }

  /**
   * Get or create user risk profile
   */
  private static async getUserRiskProfile(userId: string): Promise<UserRiskProfile | null> {
    try {
      const { data: profile } = await supabase
        .from('user_risk_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      return profile;
    } catch (error) {
      // Profile doesn't exist, create one
      return await this.createUserRiskProfile(userId);
    }
  }

  /**
   * Create initial user risk profile
   */
  private static async createUserRiskProfile(userId: string): Promise<UserRiskProfile | null> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('created_at, email_verified, phone_verified')
        .eq('id', userId)
        .single();

      if (!user) return null;

      const accountAge = (new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24);
      
      const { data: profile, error } = await supabase
        .from('user_risk_profiles')
        .insert({
          user_id: userId,
          current_risk_score: 50, // Start with medium risk
          risk_level: 'medium',
          total_transactions: 0,
          successful_transactions: 0,
          failed_transactions: 0,
          disputed_transactions: 0,
          average_transaction_amount: 0,
          account_age_days: accountAge,
          verification_status: user.email_verified && user.phone_verified ? 'verified' : 
                             user.email_verified || user.phone_verified ? 'partial' : 'unverified',
          device_fingerprints: [],
          ip_addresses: [],
          location_history: [],
          behavioral_patterns: {},
          last_risk_assessment: new Date().toISOString(),
          flags: []
        })
        .select()
        .single();

      if (error) throw error;
      return profile;
    } catch (error) {
      console.error('Error creating user risk profile:', error);
      return null;
    }
  }

  /**
   * Update user risk profile after transaction
   */
  static async updateUserRiskProfile(userId: string, transactionResult: {
    success: boolean;
    amount: number;
    disputed?: boolean;
  }): Promise<void> {
    try {
      const profile = await this.getUserRiskProfile(userId);
      if (!profile) return;

      const updates = {
        total_transactions: profile.total_transactions + 1,
        successful_transactions: transactionResult.success ? 
          profile.successful_transactions + 1 : profile.successful_transactions,
        failed_transactions: !transactionResult.success ? 
          profile.failed_transactions + 1 : profile.failed_transactions,
        disputed_transactions: transactionResult.disputed ? 
          profile.disputed_transactions + 1 : profile.disputed_transactions,
        average_transaction_amount: (
          (profile.average_transaction_amount * profile.total_transactions) + transactionResult.amount
        ) / (profile.total_transactions + 1),
        last_risk_assessment: new Date().toISOString()
      };

      // Calculate new risk score based on success rate
      const successRate = updates.successful_transactions / updates.total_transactions;
      const disputeRate = updates.disputed_transactions / updates.total_transactions;
      
      let newRiskScore = 50; // Base score
      newRiskScore -= (successRate - 0.8) * 50; // Adjust for success rate
      newRiskScore += disputeRate * 100; // Increase for disputes
      newRiskScore = Math.max(0, Math.min(100, newRiskScore));

      updates.current_risk_score = newRiskScore;
      updates.risk_level = this.getRiskLevel(newRiskScore);

      await supabase
        .from('user_risk_profiles')
        .update(updates)
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error updating user risk profile:', error);
    }
  }

  /**
   * Create fraud alert
   */
  static async createFraudAlert(params: {
    userId: string;
    bookingId?: string;
    transactionId?: string;
    alertType: FraudAlert['alert_type'];
    severity: FraudAlert['severity'];
    riskScore: number;
    description: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      await supabase
        .from('fraud_alerts')
        .insert({
          user_id: params.userId,
          booking_id: params.bookingId,
          transaction_id: params.transactionId,
          alert_type: params.alertType,
          severity: params.severity,
          risk_score: params.riskScore,
          description: params.description,
          metadata: params.metadata || {},
          status: 'active'
        });

      // If critical alert, notify admin team immediately
      if (params.severity === 'critical') {
        await this.notifyAdminTeam(params);
      }
    } catch (error) {
      console.error('Error creating fraud alert:', error);
    }
  }

  /**
   * Get risk level from score
   */
  private static getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  /**
   * Generate recommendations based on risk factors
   */
  private static generateRecommendations(score: number, factors: FraudRiskFactor[]): string[] {
    const recommendations: string[] = [];

    if (score >= 80) {
      recommendations.push('BLOCK TRANSACTION - Critical risk detected');
      recommendations.push('Require manual verification');
      recommendations.push('Contact user via verified phone number');
    } else if (score >= 60) {
      recommendations.push('Hold transaction for manual review');
      recommendations.push('Require additional verification');
      recommendations.push('Limit transaction amount');
    } else if (score >= 40) {
      recommendations.push('Monitor transaction closely');
      recommendations.push('Consider additional verification');
    } else {
      recommendations.push('Proceed with transaction');
      recommendations.push('Standard monitoring');
    }

    // Add specific recommendations based on factors
    factors.forEach(factor => {
      if (factor.impact > 15) {
        switch (factor.type) {
          case 'velocity':
            recommendations.push('Implement velocity limits');
            break;
          case 'device':
            recommendations.push('Verify device ownership');
            break;
          case 'location':
            recommendations.push('Confirm location with user');
            break;
          case 'payment_method':
            recommendations.push('Verify payment method');
            break;
        }
      }
    });

    return [...new Set(recommendations)]; // Remove duplicates
  }

  /**
   * Log fraud analysis
   */
  private static async logFraudAnalysis(params: {
    user_id: string;
    booking_id?: string;
    risk_score: number;
    risk_level: string;
    factors: FraudRiskFactor[];
    ip_address: string;
    device_fingerprint?: string;
  }): Promise<void> {
    try {
      await supabase
        .from('fraud_analysis_logs')
        .insert({
          user_id: params.user_id,
          booking_id: params.booking_id,
          risk_score: params.risk_score,
          risk_level: params.risk_level,
          factors: params.factors,
          ip_address: params.ip_address,
          device_fingerprint: params.device_fingerprint,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging fraud analysis:', error);
    }
  }

  /**
   * Notify admin team of critical alerts
   */
  private static async notifyAdminTeam(alert: {
    userId: string;
    severity: string;
    description: string;
    riskScore: number;
  }): Promise<void> {
    try {
      // This would integrate with notification services like:
      // - SendGrid for email
      // - Slack webhooks
      // - PagerDuty for critical alerts
      
      console.log('CRITICAL FRAUD ALERT:', {
        userId: alert.userId,
        severity: alert.severity,
        description: alert.description,
        riskScore: alert.riskScore,
        timestamp: new Date().toISOString()
      });

      // TODO: Implement actual notification system
      // await sendSlackAlert(alert);
      // await sendEmailAlert(alert);
    } catch (error) {
      console.error('Error notifying admin team:', error);
    }
  }

  /**
   * Utility functions
   */
  private static isPrivateIP(ip: string): boolean {
    return ip.startsWith('192.168.') || 
           ip.startsWith('10.') || 
           ip.startsWith('172.16.') ||
           ip === '127.0.0.1' ||
           ip === 'localhost';
  }

  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

export default FraudDetectionService;