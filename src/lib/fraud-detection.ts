// BookLocal Fraud Detection System
// Real-time fraud detection and risk assessment

export interface FraudAnalysis {
  riskScore: number; // 0-1, where 1 is highest risk
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flags: FraudFlag[];
  recommendations: string[];
  requiresManualReview: boolean;
  allowTransaction: boolean;
}

export interface FraudFlag {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  score: number;
}

export interface TransactionContext {
  amount: number;
  customerId: string;
  contractorId: string;
  paymentMethodId: string;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  location?: {
    lat: number;
    lng: number;
    country: string;
    state: string;
    city: string;
  };
  timestamp: Date;
}

export interface UserHistory {
  totalTransactions: number;
  totalAmount: number;
  averageAmount: number;
  lastTransactionDate?: Date;
  failedTransactions: number;
  chargebacks: number;
  disputes: number;
  accountAge: number; // days
  verificationLevel: 'none' | 'basic' | 'verified' | 'premium';
}

// Fraud Detection Engine
export class FraudDetector {
  private static readonly RISK_THRESHOLDS = {
    LOW: 0.3,
    MEDIUM: 0.6,
    HIGH: 0.8,
    CRITICAL: 0.9
  };

  private static readonly AMOUNT_THRESHOLDS = {
    SMALL: 10000, // $100
    MEDIUM: 50000, // $500
    LARGE: 200000, // $2000
    VERY_LARGE: 1000000 // $10000
  };

  static async analyzeTransaction(
    context: TransactionContext,
    customerHistory?: UserHistory,
    contractorHistory?: UserHistory
  ): Promise<FraudAnalysis> {
    const flags: FraudFlag[] = [];
    let totalScore = 0;

    // Amount-based analysis
    const amountFlags = this.analyzeAmount(context.amount, customerHistory);
    flags.push(...amountFlags);
    totalScore += amountFlags.reduce((sum, flag) => sum + flag.score, 0);

    // Velocity analysis
    const velocityFlags = await this.analyzeVelocity(context, customerHistory);
    flags.push(...velocityFlags);
    totalScore += velocityFlags.reduce((sum, flag) => sum + flag.score, 0);

    // Geographic analysis
    if (context.location && context.ipAddress) {
      const geoFlags = await this.analyzeGeography(context);
      flags.push(...geoFlags);
      totalScore += geoFlags.reduce((sum, flag) => sum + flag.score, 0);
    }

    // Device and behavior analysis
    if (context.deviceFingerprint) {
      const deviceFlags = await this.analyzeDevice(context);
      flags.push(...deviceFlags);
      totalScore += deviceFlags.reduce((sum, flag) => sum + flag.score, 0);
    }

    // User history analysis
    if (customerHistory) {
      const historyFlags = this.analyzeUserHistory(customerHistory);
      flags.push(...historyFlags);
      totalScore += historyFlags.reduce((sum, flag) => sum + flag.score, 0);
    }

    // Contractor analysis
    if (contractorHistory) {
      const contractorFlags = this.analyzeContractor(contractorHistory);
      flags.push(...contractorFlags);
      totalScore += contractorFlags.reduce((sum, flag) => sum + flag.score, 0);
    }

    // Time-based analysis
    const timeFlags = this.analyzeTimingPatterns(context);
    flags.push(...timeFlags);
    totalScore += timeFlags.reduce((sum, flag) => sum + flag.score, 0);

    // Normalize score (0-1)
    const riskScore = Math.min(totalScore, 1.0);
    
    // Determine risk level
    const riskLevel = this.determineRiskLevel(riskScore);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(flags, riskLevel);
    
    // Determine if manual review is required
    const requiresManualReview = riskScore >= this.RISK_THRESHOLDS.HIGH || 
                                 flags.some(f => f.severity === 'critical');
    
    // Determine if transaction should be allowed
    const allowTransaction = riskScore < this.RISK_THRESHOLDS.CRITICAL && 
                            !flags.some(f => f.type === 'stolen_card' || f.type === 'known_fraud');

    return {
      riskScore,
      riskLevel,
      flags,
      recommendations,
      requiresManualReview,
      allowTransaction
    };
  }

  private static analyzeAmount(amount: number, history?: UserHistory): FraudFlag[] {
    const flags: FraudFlag[] = [];

    // Very large amount flag
    if (amount > this.AMOUNT_THRESHOLDS.VERY_LARGE) {
      flags.push({
        type: 'large_amount',
        severity: 'high',
        description: `Transaction amount (${amount / 100}) is unusually large`,
        score: 0.4
      });
    }

    // Amount vs history analysis
    if (history && history.averageAmount > 0) {
      const ratio = amount / history.averageAmount;
      
      if (ratio > 10) {
        flags.push({
          type: 'amount_anomaly',
          severity: 'medium',
          description: `Amount is ${ratio.toFixed(1)}x larger than user's average`,
          score: 0.3
        });
      } else if (ratio > 20) {
        flags.push({
          type: 'amount_anomaly',
          severity: 'high',
          description: `Amount is ${ratio.toFixed(1)}x larger than user's average`,
          score: 0.5
        });
      }
    }

    // First-time large purchase
    if (history && history.totalTransactions === 0 && amount > this.AMOUNT_THRESHOLDS.MEDIUM) {
      flags.push({
        type: 'first_large_purchase',
        severity: 'medium',
        description: 'Large first-time purchase from new user',
        score: 0.25
      });
    }

    return flags;
  }

  private static async analyzeVelocity(
    context: TransactionContext,
    history?: UserHistory
  ): Promise<FraudFlag[]> {
    const flags: FraudFlag[] = [];

    // TODO: Implement actual velocity checks
    // This would require database queries to check:
    // - Transactions in last hour/day/week
    // - Multiple payment methods used recently
    // - Rapid-fire transaction attempts

    // Simulated velocity check
    if (history && history.lastTransactionDate) {
      const timeSinceLastTransaction = Date.now() - history.lastTransactionDate.getTime();
      const minutesSinceLastTransaction = timeSinceLastTransaction / (1000 * 60);

      if (minutesSinceLastTransaction < 5) {
        flags.push({
          type: 'high_velocity',
          severity: 'medium',
          description: 'Multiple transactions within 5 minutes',
          score: 0.3
        });
      }
    }

    return flags;
  }

  private static async analyzeGeography(context: TransactionContext): Promise<FraudFlag[]> {
    const flags: FraudFlag[] = [];

    if (!context.location) return flags;

    // High-risk countries (simplified list)
    const highRiskCountries = ['NG', 'GH', 'PK', 'BD', 'ID'];
    
    if (highRiskCountries.includes(context.location.country)) {
      flags.push({
        type: 'high_risk_country',
        severity: 'medium',
        description: `Transaction from high-risk country: ${context.location.country}`,
        score: 0.3
      });
    }

    // TODO: Implement more sophisticated geo analysis
    // - IP geolocation vs billing address mismatch
    // - Impossible travel (user in different countries within hours)
    // - VPN/proxy detection
    // - Known fraud hotspots

    return flags;
  }

  private static async analyzeDevice(context: TransactionContext): Promise<FraudFlag[]> {
    const flags: FraudFlag[] = [];

    // TODO: Implement device fingerprinting analysis
    // - Known fraudulent devices
    // - Device spoofing detection
    // - Browser/OS inconsistencies
    // - Multiple accounts from same device

    return flags;
  }

  private static analyzeUserHistory(history: UserHistory): FraudFlag[] {
    const flags: FraudFlag[] = [];

    // High chargeback rate
    if (history.totalTransactions > 5 && history.chargebacks / history.totalTransactions > 0.1) {
      flags.push({
        type: 'high_chargeback_rate',
        severity: 'high',
        description: `High chargeback rate: ${((history.chargebacks / history.totalTransactions) * 100).toFixed(1)}%`,
        score: 0.6
      });
    }

    // High dispute rate
    if (history.totalTransactions > 3 && history.disputes / history.totalTransactions > 0.15) {
      flags.push({
        type: 'high_dispute_rate',
        severity: 'medium',
        description: `High dispute rate: ${((history.disputes / history.totalTransactions) * 100).toFixed(1)}%`,
        score: 0.4
      });
    }

    // High failure rate
    if (history.totalTransactions > 3 && history.failedTransactions / history.totalTransactions > 0.3) {
      flags.push({
        type: 'high_failure_rate',
        severity: 'medium',
        description: `High transaction failure rate: ${((history.failedTransactions / history.totalTransactions) * 100).toFixed(1)}%`,
        score: 0.3
      });
    }

    // New account with no verification
    if (history.accountAge < 1 && history.verificationLevel === 'none') {
      flags.push({
        type: 'unverified_new_account',
        severity: 'medium',
        description: 'New account with no identity verification',
        score: 0.25
      });
    }

    return flags;
  }

  private static analyzeContractor(history: UserHistory): FraudFlag[] {
    const flags: FraudFlag[] = [];

    // New contractor with large booking
    if (history.accountAge < 30 && history.totalTransactions < 5) {
      flags.push({
        type: 'new_contractor',
        severity: 'low',
        description: 'New contractor with limited transaction history',
        score: 0.15
      });
    }

    return flags;
  }

  private static analyzeTimingPatterns(context: TransactionContext): FraudFlag[] {
    const flags: FraudFlag[] = [];

    const hour = context.timestamp.getHours();
    
    // Unusual hours (3 AM - 6 AM)
    if (hour >= 3 && hour <= 6) {
      flags.push({
        type: 'unusual_hours',
        severity: 'low',
        description: 'Transaction during unusual hours (3-6 AM)',
        score: 0.1
      });
    }

    return flags;
  }

  private static determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= this.RISK_THRESHOLDS.CRITICAL) return 'critical';
    if (score >= this.RISK_THRESHOLDS.HIGH) return 'high';
    if (score >= this.RISK_THRESHOLDS.MEDIUM) return 'medium';
    return 'low';
  }

  private static generateRecommendations(
    flags: FraudFlag[],
    riskLevel: string
  ): string[] {
    const recommendations: string[] = [];

    if (riskLevel === 'critical') {
      recommendations.push('Block transaction immediately');
      recommendations.push('Flag account for investigation');
      recommendations.push('Require identity verification');
    } else if (riskLevel === 'high') {
      recommendations.push('Require manual review');
      recommendations.push('Request additional verification');
      recommendations.push('Limit transaction amount');
    } else if (riskLevel === 'medium') {
      recommendations.push('Monitor closely');
      recommendations.push('Consider additional verification');
      recommendations.push('Set velocity limits');
    }

    // Specific recommendations based on flags
    if (flags.some(f => f.type === 'large_amount')) {
      recommendations.push('Verify large amount with customer');
    }

    if (flags.some(f => f.type === 'high_velocity')) {
      recommendations.push('Implement velocity controls');
    }

    if (flags.some(f => f.type === 'high_risk_country')) {
      recommendations.push('Enhanced due diligence for high-risk geography');
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }
}

// Machine Learning-Inspired Scoring
export class MLFraudScoring {
  // Simplified ML-inspired scoring based on feature weights
  private static readonly FEATURE_WEIGHTS = {
    amount_ratio: 0.15,
    velocity_score: 0.20,
    geo_risk: 0.10,
    device_risk: 0.15,
    history_score: 0.25,
    time_risk: 0.05,
    verification_level: 0.10
  };

  static calculateMLScore(context: TransactionContext, history?: UserHistory): number {
    let score = 0;

    // Amount ratio feature
    if (history && history.averageAmount > 0) {
      const amountRatio = Math.min(context.amount / history.averageAmount, 10) / 10;
      score += amountRatio * this.FEATURE_WEIGHTS.amount_ratio;
    }

    // Velocity feature (simplified)
    const velocityScore = 0.3; // TODO: Calculate based on recent transactions
    score += velocityScore * this.FEATURE_WEIGHTS.velocity_score;

    // Geographic risk
    const geoRisk = context.location?.country === 'US' ? 0.1 : 0.5;
    score += geoRisk * this.FEATURE_WEIGHTS.geo_risk;

    // History score
    if (history) {
      const chargebackRate = history.totalTransactions > 0 ? 
        history.chargebacks / history.totalTransactions : 0;
      const historyScore = Math.min(chargebackRate * 10, 1);
      score += historyScore * this.FEATURE_WEIGHTS.history_score;
    }

    // Verification level
    const verificationScore = history?.verificationLevel === 'premium' ? 0 :
                             history?.verificationLevel === 'verified' ? 0.2 :
                             history?.verificationLevel === 'basic' ? 0.5 : 1;
    score += verificationScore * this.FEATURE_WEIGHTS.verification_level;

    return Math.min(score, 1.0);
  }
}

// Real-time Monitoring
export class FraudMonitoring {
  static async logFraudEvent(
    analysis: FraudAnalysis,
    context: TransactionContext,
    action: 'allowed' | 'blocked' | 'manual_review'
  ): Promise<void> {
    const fraudEvent = {
      timestamp: new Date(),
      transactionId: `txn_${Date.now()}`,
      customerId: context.customerId,
      contractorId: context.contractorId,
      amount: context.amount,
      riskScore: analysis.riskScore,
      riskLevel: analysis.riskLevel,
      flags: analysis.flags,
      action,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent
    };

    // TODO: Save to fraud database
    console.log('Fraud event logged:', fraudEvent);

    // TODO: Send alerts for high-risk events
    if (analysis.riskLevel === 'critical') {
      await this.sendFraudAlert(fraudEvent);
    }
  }

  private static async sendFraudAlert(event: any): Promise<void> {
    // TODO: Implement alerting system
    // - Send to fraud team
    // - Create ticket in admin system
    // - Send real-time notifications
    console.log('FRAUD ALERT:', event);
  }

  static async updateFraudStats(): Promise<void> {
    // TODO: Update fraud statistics
    // - Calculate fraud rates
    // - Update ML model features
    // - Generate fraud reports
  }
}

// Export main functions
export { FraudDetector, MLFraudScoring, FraudMonitoring };