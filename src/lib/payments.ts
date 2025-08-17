// BookLocal Payment System - Multi-Provider with Escrow
// Supports Stripe, Braintree, Square, and Adyen with intelligent routing

import { loadStripe, Stripe } from '@stripe/stripe-js';

// Types
export interface PaymentProvider {
  id: string;
  name: string;
  isActive: boolean;
  priority: number;
  supportedMethods: string[];
  feePercentage: number;
  fixedFee: number;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'digital_wallet';
  provider: string;
  externalId: string;
  last4: string;
  brand?: string;
  expiresMonth?: number;
  expiresYear?: number;
  isDefault: boolean;
  isVerified: boolean;
}

export interface Transaction {
  id: string;
  bookingId: string;
  customerId: string;
  contractorId: string;
  amount: number;
  currency: string;
  platformFee: number;
  processorFee: number;
  netAmount: number;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'disputed';
  provider: string;
  externalId?: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface EscrowAccount {
  id: string;
  bookingId: string;
  totalAmount: number;
  heldAmount: number;
  releasedAmount: number;
  status: 'created' | 'funded' | 'partial_release' | 'completed' | 'disputed';
  milestones: EscrowMilestone[];
}

export interface EscrowMilestone {
  id: string;
  title: string;
  amount: number;
  status: 'pending' | 'completed' | 'approved' | 'disputed';
  dueDate?: Date;
  completedAt?: Date;
  approvedAt?: Date;
}

// Configuration
const PAYMENT_PROVIDERS: PaymentProvider[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    isActive: true,
    priority: 1,
    supportedMethods: ['card', 'bank_account', 'digital_wallet'],
    feePercentage: 2.9,
    fixedFee: 0.30
  },
  {
    id: 'braintree',
    name: 'Braintree',
    isActive: true,
    priority: 2,
    supportedMethods: ['card', 'digital_wallet'],
    feePercentage: 2.9,
    fixedFee: 0.30
  },
  {
    id: 'square',
    name: 'Square',
    isActive: true,
    priority: 3,
    supportedMethods: ['card'],
    feePercentage: 2.6,
    fixedFee: 0.10
  },
  {
    id: 'adyen',
    name: 'Adyen',
    isActive: false, // Enterprise only
    priority: 4,
    supportedMethods: ['card', 'bank_account', 'digital_wallet'],
    feePercentage: 2.5,
    fixedFee: 0.20
  }
];

// Stripe Setup
let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// Payment Provider Selection
export function selectOptimalProvider(
  amount: number,
  paymentMethod: string,
  riskScore: number = 0
): PaymentProvider {
  const availableProviders = PAYMENT_PROVIDERS
    .filter(p => p.isActive && p.supportedMethods.includes(paymentMethod))
    .sort((a, b) => a.priority - b.priority);

  // For high-risk transactions, prefer providers with better fraud protection
  if (riskScore > 0.7) {
    const braintree = availableProviders.find(p => p.id === 'braintree');
    if (braintree) return braintree;
  }

  // For large amounts, prefer lower-fee providers
  if (amount > 50000) { // $500+
    const adyen = availableProviders.find(p => p.id === 'adyen');
    if (adyen) return adyen;
  }

  // Default to highest priority available provider
  return availableProviders[0] || PAYMENT_PROVIDERS[0];
}

// Fraud Detection
export function calculateRiskScore(transaction: {
  amount: number;
  customerId: string;
  contractorId: string;
  paymentMethodId: string;
  ipAddress?: string;
  userAgent?: string;
}): number {
  let riskScore = 0;

  // Amount-based risk
  if (transaction.amount > 100000) riskScore += 0.3; // $1000+
  if (transaction.amount > 500000) riskScore += 0.4; // $5000+

  // TODO: Add more sophisticated fraud detection
  // - Velocity checks (multiple transactions in short time)
  // - Geographic risk (IP location vs billing address)
  // - Device fingerprinting
  // - Historical behavior analysis
  // - Machine learning model scoring

  return Math.min(riskScore, 1.0);
}

// Escrow Management
export class EscrowManager {
  static async createEscrowAccount(
    bookingId: string,
    totalAmount: number,
    milestones: Omit<EscrowMilestone, 'id' | 'status'>[]
  ): Promise<EscrowAccount> {
    const escrowAccount: EscrowAccount = {
      id: `escrow_${Date.now()}`,
      bookingId,
      totalAmount,
      heldAmount: 0,
      releasedAmount: 0,
      status: 'created',
      milestones: milestones.map((m, index) => ({
        ...m,
        id: `milestone_${index + 1}`,
        status: 'pending'
      }))
    };

    // TODO: Save to database
    console.log('Created escrow account:', escrowAccount);
    return escrowAccount;
  }

  static async fundEscrow(
    escrowId: string,
    paymentMethodId: string,
    amount: number
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // Create payment intent with escrow hold
      const paymentIntent = await PaymentProcessor.createPaymentIntent({
        amount,
        currency: 'usd',
        paymentMethodId,
        escrowId,
        captureMethod: 'manual' // Hold funds without capturing
      });

      if (paymentIntent.status === 'succeeded') {
        // Update escrow account
        // TODO: Update database
        console.log('Escrow funded successfully');
        return { success: true, transactionId: paymentIntent.id };
      }

      return { success: false, error: 'Payment failed' };
    } catch (error) {
      console.error('Escrow funding error:', error);
      return { success: false, error: 'Payment processing error' };
    }
  }

  static async releaseMilestone(
    escrowId: string,
    milestoneId: string,
    amount: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Transfer funds to contractor
      const transfer = await PaymentProcessor.transferFunds({
        amount,
        destination: 'contractor_account_id', // TODO: Get from contractor profile
        escrowId,
        milestoneId
      });

      if (transfer.success) {
        // Update milestone status
        // TODO: Update database
        console.log('Milestone released successfully');
        return { success: true };
      }

      return { success: false, error: 'Transfer failed' };
    } catch (error) {
      console.error('Milestone release error:', error);
      return { success: false, error: 'Transfer processing error' };
    }
  }

  static async disputeEscrow(
    escrowId: string,
    reason: string,
    evidence: string[]
  ): Promise<{ success: boolean; disputeId?: string; error?: string }> {
    try {
      // Create dispute record
      const dispute = {
        id: `dispute_${Date.now()}`,
        escrowId,
        reason,
        evidence,
        status: 'open',
        createdAt: new Date()
      };

      // TODO: Save dispute to database
      // TODO: Notify admin team
      // TODO: Freeze escrow account

      console.log('Dispute created:', dispute);
      return { success: true, disputeId: dispute.id };
    } catch (error) {
      console.error('Dispute creation error:', error);
      return { success: false, error: 'Dispute processing error' };
    }
  }
}

// Payment Processing
export class PaymentProcessor {
  static async createPaymentIntent(params: {
    amount: number;
    currency: string;
    paymentMethodId: string;
    escrowId?: string;
    captureMethod?: 'automatic' | 'manual';
    description?: string;
  }): Promise<any> {
    const riskScore = calculateRiskScore({
      amount: params.amount,
      customerId: 'customer_id', // TODO: Get from context
      contractorId: 'contractor_id', // TODO: Get from context
      paymentMethodId: params.paymentMethodId
    });

    const provider = selectOptimalProvider(params.amount, 'card', riskScore);

    switch (provider.id) {
      case 'stripe':
        return this.createStripePaymentIntent(params);
      case 'braintree':
        return this.createBraintreeTransaction(params);
      case 'square':
        return this.createSquarePayment(params);
      case 'adyen':
        return this.createAdyenPayment(params);
      default:
        throw new Error(`Unsupported payment provider: ${provider.id}`);
    }
  }

  private static async createStripePaymentIntent(params: any): Promise<any> {
    const stripe = await getStripe();
    if (!stripe) throw new Error('Stripe not loaded');

    // This would typically be done on the backend
    const response = await fetch('/api/payments/stripe/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: params.amount,
        currency: params.currency,
        payment_method: params.paymentMethodId,
        capture_method: params.captureMethod || 'automatic',
        metadata: {
          escrow_id: params.escrowId,
          description: params.description
        }
      }),
    });

    const { client_secret } = await response.json();

    const result = await stripe.confirmCardPayment(client_secret);
    
    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.paymentIntent;
  }

  private static async createBraintreeTransaction(params: any): Promise<any> {
    // TODO: Implement Braintree integration
    const response = await fetch('/api/payments/braintree/create-transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    return response.json();
  }

  private static async createSquarePayment(params: any): Promise<any> {
    // TODO: Implement Square integration
    const response = await fetch('/api/payments/square/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    return response.json();
  }

  private static async createAdyenPayment(params: any): Promise<any> {
    // TODO: Implement Adyen integration
    const response = await fetch('/api/payments/adyen/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    return response.json();
  }

  static async transferFunds(params: {
    amount: number;
    destination: string;
    escrowId: string;
    milestoneId: string;
  }): Promise<{ success: boolean; transferId?: string; error?: string }> {
    try {
      // TODO: Implement actual transfer logic
      // This would typically involve:
      // 1. Validate escrow account has sufficient funds
      // 2. Create transfer to contractor's connected account
      // 3. Update escrow and milestone records
      // 4. Send notifications

      const transferId = `transfer_${Date.now()}`;
      console.log('Transfer created:', transferId);
      
      return { success: true, transferId };
    } catch (error) {
      console.error('Transfer error:', error);
      return { success: false, error: 'Transfer failed' };
    }
  }

  static async refundPayment(
    transactionId: string,
    amount?: number,
    reason?: string
  ): Promise<{ success: boolean; refundId?: string; error?: string }> {
    try {
      // TODO: Implement refund logic for each provider
      const refundId = `refund_${Date.now()}`;
      console.log('Refund created:', refundId);
      
      return { success: true, refundId };
    } catch (error) {
      console.error('Refund error:', error);
      return { success: false, error: 'Refund failed' };
    }
  }
}

// Chargeback Protection
export class ChargebackProtection {
  static async analyzeTransaction(transaction: Transaction): Promise<{
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
  }> {
    const riskFactors = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Amount-based risk
    if (transaction.amount > 100000) {
      riskFactors.push('High transaction amount');
      riskLevel = 'medium';
    }

    // TODO: Add more sophisticated analysis
    // - Customer payment history
    // - Geographic risk factors
    // - Device fingerprinting
    // - Velocity checks

    const recommendations = [
      'Verify customer identity',
      'Confirm service delivery',
      'Document all communications',
      'Use delivery confirmation'
    ];

    return { riskLevel, recommendations };
  }

  static async preventChargeback(transactionId: string): Promise<{
    actions: string[];
    evidence: string[];
  }> {
    return {
      actions: [
        'Send delivery confirmation',
        'Document service completion',
        'Collect customer signature',
        'Save all communications'
      ],
      evidence: [
        'Service agreement',
        'Completion photos',
        'Customer communications',
        'Delivery confirmation'
      ]
    };
  }
}

// Dispute Resolution
export class DisputeResolution {
  static async initiateDispute(params: {
    transactionId: string;
    reason: string;
    evidence: string[];
    initiatedBy: 'customer' | 'contractor';
  }): Promise<{ disputeId: string; status: string }> {
    const disputeId = `dispute_${Date.now()}`;
    
    // TODO: Implement dispute workflow
    // 1. Create dispute record
    // 2. Notify all parties
    // 3. Freeze related funds
    // 4. Start resolution process

    console.log('Dispute initiated:', disputeId);
    
    return { disputeId, status: 'open' };
  }

  static async resolveDispute(
    disputeId: string,
    resolution: 'customer_favor' | 'contractor_favor' | 'split',
    amount?: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // TODO: Implement resolution logic
      // 1. Process refunds/transfers based on resolution
      // 2. Update dispute status
      // 3. Notify all parties
      // 4. Release any held funds

      console.log('Dispute resolved:', disputeId, resolution);
      
      return { success: true };
    } catch (error) {
      console.error('Dispute resolution error:', error);
      return { success: false, error: 'Resolution failed' };
    }
  }
}

// Main API Functions
export async function createBookingPayment(params: {
  bookingId: string;
  customerId: string;
  contractorId: string;
  amount: number;
  paymentMethodId: string;
  milestones?: Omit<EscrowMilestone, 'id' | 'status'>[];
}): Promise<{
  success: boolean;
  escrowId?: string;
  transactionId?: string;
  error?: string;
}> {
  try {
    // 1. Create escrow account if milestones provided
    let escrowAccount: EscrowAccount | null = null;
    if (params.milestones && params.milestones.length > 0) {
      escrowAccount = await EscrowManager.createEscrowAccount(
        params.bookingId,
        params.amount,
        params.milestones
      );
    }

    // 2. Create payment intent
    const paymentIntent = await PaymentProcessor.createPaymentIntent({
      amount: params.amount,
      currency: 'usd',
      paymentMethodId: params.paymentMethodId,
      escrowId: escrowAccount?.id,
      captureMethod: escrowAccount ? 'manual' : 'automatic',
      description: `BookLocal booking payment - ${params.bookingId}`
    });

    // 3. Fund escrow if applicable
    if (escrowAccount && paymentIntent.status === 'succeeded') {
      const fundResult = await EscrowManager.fundEscrow(
        escrowAccount.id,
        params.paymentMethodId,
        params.amount
      );

      if (!fundResult.success) {
        return { success: false, error: fundResult.error };
      }
    }

    return {
      success: true,
      escrowId: escrowAccount?.id,
      transactionId: paymentIntent.id
    };
  } catch (error) {
    console.error('Booking payment error:', error);
    return { success: false, error: 'Payment processing failed' };
  }
}

export async function releaseMilestonePayment(
  escrowId: string,
  milestoneId: string
): Promise<{ success: boolean; error?: string }> {
  // TODO: Add authorization checks
  // TODO: Validate milestone completion
  
  return EscrowManager.releaseMilestone(escrowId, milestoneId, 0); // Amount from milestone
}

export async function requestRefund(
  transactionId: string,
  amount?: number,
  reason?: string
): Promise<{ success: boolean; refundId?: string; error?: string }> {
  return PaymentProcessor.refundPayment(transactionId, amount, reason);
}

// Legacy function for backward compatibility
export async function redirectToCheckout(sessionId: string) {
  const stripe = await getStripe();
  if (!stripe) throw new Error('Stripe failed to load');
  await stripe.redirectToCheckout({ sessionId });
}

// Export classes for external use
export { EscrowManager, PaymentProcessor, ChargebackProtection, DisputeResolution };
