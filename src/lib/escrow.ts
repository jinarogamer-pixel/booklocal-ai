import { supabase } from './supabase';
import { loadStripe } from '@stripe/stripe-js';

const stripe = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Types for escrow system
export interface EscrowAccount {
  id: string;
  booking_id: string;
  total_amount: number;
  held_amount: number;
  released_amount: number;
  status: 'created' | 'funded' | 'partial_release' | 'completed' | 'disputed';
  created_at: string;
  updated_at: string;
}

export interface EscrowTransaction {
  id: string;
  escrow_account_id: string;
  type: 'deposit' | 'release' | 'refund' | 'dispute_hold';
  amount: number;
  milestone_id?: string;
  status: 'pending' | 'completed' | 'failed';
  stripe_payment_intent_id?: string;
  description: string;
  created_at: string;
}

export interface PaymentMilestone {
  id: string;
  booking_id: string;
  title: string;
  description: string;
  amount: number;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'approved' | 'disputed';
  completed_at?: string;
  approved_at?: string;
  approved_by?: string;
  sort_order: number;
}

// Main Escrow Service
export class EscrowService {
  private stripeSecretKey: string;

  constructor() {
    this.stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
  }

  /**
   * Create an escrow account for a booking
   */
  async createEscrowAccount(bookingId: string, totalAmount: number): Promise<EscrowAccount> {
    try {
      const { data: escrowAccount, error } = await supabase
        .from('escrow_accounts')
        .insert({
          booking_id: bookingId,
          total_amount: totalAmount,
          held_amount: 0,
          released_amount: 0,
          status: 'created'
        })
        .select()
        .single();

      if (error) throw error;
      return escrowAccount;
    } catch (error) {
      console.error('Error creating escrow account:', error);
      throw error;
    }
  }

  /**
   * Fund the escrow account with customer payment
   */
  async fundEscrow(escrowAccountId: string, paymentMethodId: string, customerId: string): Promise<{
    success: boolean;
    payment_intent_id?: string;
    client_secret?: string;
    error?: string;
  }> {
    try {
      // Get escrow account details
      const { data: escrowAccount } = await supabase
        .from('escrow_accounts')
        .select('*')
        .eq('id', escrowAccountId)
        .single();

      if (!escrowAccount) {
        throw new Error('Escrow account not found');
      }

      // Create Stripe payment intent
      const stripeInstance = await stripe;
      if (!stripeInstance) throw new Error('Stripe not loaded');

      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(escrowAccount.total_amount * 100), // Convert to cents
          currency: 'usd',
          payment_method: paymentMethodId,
          customer_id: customerId,
          metadata: {
            type: 'escrow_funding',
            escrow_account_id: escrowAccountId,
            booking_id: escrowAccount.booking_id
          }
        })
      });

      const paymentIntent = await response.json();

      if (paymentIntent.error) {
        throw new Error(paymentIntent.error);
      }

      // Record the transaction
      await supabase
        .from('transactions')
        .insert({
          booking_id: escrowAccount.booking_id,
          customer_id: customerId,
          type: 'escrow_hold',
          amount: escrowAccount.total_amount,
          platform_fee: escrowAccount.total_amount * 0.05, // 5% platform fee
          payment_processor_fee: escrowAccount.total_amount * 0.029 + 0.30, // Stripe fees
          net_amount: escrowAccount.total_amount * 0.921 - 0.30,
          status: 'pending',
          provider: 'stripe',
          external_id: paymentIntent.id,
          description: 'Escrow funding for booking'
        });

      return {
        success: true,
        payment_intent_id: paymentIntent.id,
        client_secret: paymentIntent.client_secret
      };
    } catch (error) {
      console.error('Error funding escrow:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Confirm escrow funding after successful payment
   */
  async confirmEscrowFunding(escrowAccountId: string, paymentIntentId: string): Promise<boolean> {
    try {
      // Verify payment with Stripe
      const response = await fetch('/api/payments/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId
        })
      });

      const verification = await response.json();
      
      if (!verification.success || verification.status !== 'succeeded') {
        throw new Error('Payment verification failed');
      }

      // Update escrow account
      const { data: escrowAccount } = await supabase
        .from('escrow_accounts')
        .select('total_amount')
        .eq('id', escrowAccountId)
        .single();

      await supabase
        .from('escrow_accounts')
        .update({
          held_amount: escrowAccount.total_amount,
          status: 'funded',
          updated_at: new Date().toISOString()
        })
        .eq('id', escrowAccountId);

      // Update transaction status
      await supabase
        .from('transactions')
        .update({
          status: 'succeeded',
          processed_at: new Date().toISOString()
        })
        .eq('external_id', paymentIntentId);

      return true;
    } catch (error) {
      console.error('Error confirming escrow funding:', error);
      return false;
    }
  }

  /**
   * Create payment milestones for a booking
   */
  async createMilestones(bookingId: string, milestones: Omit<PaymentMilestone, 'id' | 'booking_id' | 'created_at'>[]): Promise<PaymentMilestone[]> {
    try {
      const milestonesWithBookingId = milestones.map(milestone => ({
        ...milestone,
        booking_id: bookingId
      }));

      const { data: createdMilestones, error } = await supabase
        .from('project_milestones')
        .insert(milestonesWithBookingId)
        .select();

      if (error) throw error;
      return createdMilestones;
    } catch (error) {
      console.error('Error creating milestones:', error);
      throw error;
    }
  }

  /**
   * Release payment for a completed milestone
   */
  async releaseMilestonePayment(milestoneId: string, approvedBy: string): Promise<{
    success: boolean;
    payout_id?: string;
    error?: string;
  }> {
    try {
      // Get milestone and booking details
      const { data: milestone } = await supabase
        .from('project_milestones')
        .select(`
          *,
          bookings (
            id,
            contractor_id,
            customer_id,
            contractor_profiles (
              user_id,
              users (
                email
              )
            )
          )
        `)
        .eq('id', milestoneId)
        .single();

      if (!milestone || milestone.status !== 'completed') {
        throw new Error('Milestone not found or not completed');
      }

      // Get escrow account
      const { data: escrowAccount } = await supabase
        .from('escrow_accounts')
        .select('*')
        .eq('booking_id', milestone.booking_id)
        .single();

      if (!escrowAccount || escrowAccount.held_amount < milestone.amount) {
        throw new Error('Insufficient funds in escrow');
      }

      // Create payout to contractor
      const payoutResponse = await fetch('/api/payments/create-payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(milestone.amount * 100), // Convert to cents
          contractor_id: milestone.bookings.contractor_id,
          milestone_id: milestoneId,
          description: `Payment for milestone: ${milestone.title}`
        })
      });

      const payout = await payoutResponse.json();

      if (!payout.success) {
        throw new Error(payout.error || 'Payout creation failed');
      }

      // Update milestone status
      await supabase
        .from('project_milestones')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: approvedBy
        })
        .eq('id', milestoneId);

      // Update escrow account
      const newHeldAmount = escrowAccount.held_amount - milestone.amount;
      const newReleasedAmount = escrowAccount.released_amount + milestone.amount;
      const newStatus = newHeldAmount === 0 ? 'completed' : 'partial_release';

      await supabase
        .from('escrow_accounts')
        .update({
          held_amount: newHeldAmount,
          released_amount: newReleasedAmount,
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', escrowAccount.id);

      // Record the transaction
      await supabase
        .from('transactions')
        .insert({
          booking_id: milestone.booking_id,
          milestone_id: milestoneId,
          contractor_id: milestone.bookings.contractor_id,
          type: 'escrow_release',
          amount: milestone.amount,
          platform_fee: milestone.amount * 0.05,
          net_amount: milestone.amount * 0.95,
          status: 'succeeded',
          provider: 'stripe',
          external_id: payout.payout_id,
          description: `Milestone payment: ${milestone.title}`,
          processed_at: new Date().toISOString()
        });

      return {
        success: true,
        payout_id: payout.payout_id
      };
    } catch (error) {
      console.error('Error releasing milestone payment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Refund money from escrow back to customer
   */
  async refundEscrow(escrowAccountId: string, amount: number, reason: string): Promise<{
    success: boolean;
    refund_id?: string;
    error?: string;
  }> {
    try {
      // Get escrow account
      const { data: escrowAccount } = await supabase
        .from('escrow_accounts')
        .select('*')
        .eq('id', escrowAccountId)
        .single();

      if (!escrowAccount || escrowAccount.held_amount < amount) {
        throw new Error('Insufficient funds in escrow for refund');
      }

      // Get the original payment intent for refund
      const { data: originalTransaction } = await supabase
        .from('transactions')
        .select('external_id')
        .eq('booking_id', escrowAccount.booking_id)
        .eq('type', 'escrow_hold')
        .eq('status', 'succeeded')
        .single();

      if (!originalTransaction) {
        throw new Error('Original payment not found');
      }

      // Create refund through Stripe
      const refundResponse = await fetch('/api/payments/create-refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_intent_id: originalTransaction.external_id,
          amount: Math.round(amount * 100), // Convert to cents
          reason: reason
        })
      });

      const refund = await refundResponse.json();

      if (!refund.success) {
        throw new Error(refund.error || 'Refund creation failed');
      }

      // Update escrow account
      const newHeldAmount = escrowAccount.held_amount - amount;
      const newStatus = newHeldAmount === 0 ? 'completed' : escrowAccount.status;

      await supabase
        .from('escrow_accounts')
        .update({
          held_amount: newHeldAmount,
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', escrowAccountId);

      // Record the refund transaction
      await supabase
        .from('transactions')
        .insert({
          booking_id: escrowAccount.booking_id,
          type: 'refund',
          amount: amount,
          net_amount: amount,
          status: 'succeeded',
          provider: 'stripe',
          external_id: refund.refund_id,
          description: `Refund: ${reason}`,
          processed_at: new Date().toISOString()
        });

      return {
        success: true,
        refund_id: refund.refund_id
      };
    } catch (error) {
      console.error('Error processing refund:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Handle dispute - freeze funds and initiate resolution
   */
  async initiateDispute(escrowAccountId: string, disputeReason: string, initiatedBy: string): Promise<{
    success: boolean;
    dispute_id?: string;
    error?: string;
  }> {
    try {
      // Update escrow status to disputed
      await supabase
        .from('escrow_accounts')
        .update({
          status: 'disputed',
          updated_at: new Date().toISOString()
        })
        .eq('id', escrowAccountId);

      // Create dispute record
      const { data: dispute } = await supabase
        .from('disputes')
        .insert({
          escrow_account_id: escrowAccountId,
          reason: disputeReason,
          initiated_by: initiatedBy,
          status: 'open',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      // Notify admin team
      await this.notifyDisputeTeam(dispute.id, disputeReason);

      return {
        success: true,
        dispute_id: dispute.id
      };
    } catch (error) {
      console.error('Error initiating dispute:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get escrow account status and transaction history
   */
  async getEscrowStatus(bookingId: string): Promise<{
    escrow_account: EscrowAccount | null;
    milestones: PaymentMilestone[];
    transactions: any[];
  }> {
    try {
      // Get escrow account
      const { data: escrowAccount } = await supabase
        .from('escrow_accounts')
        .select('*')
        .eq('booking_id', bookingId)
        .single();

      // Get milestones
      const { data: milestones } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('booking_id', bookingId)
        .order('sort_order');

      // Get transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false });

      return {
        escrow_account: escrowAccount,
        milestones: milestones || [],
        transactions: transactions || []
      };
    } catch (error) {
      console.error('Error getting escrow status:', error);
      return {
        escrow_account: null,
        milestones: [],
        transactions: []
      };
    }
  }

  /**
   * Calculate platform fees
   */
  calculateFees(amount: number): {
    platform_fee: number;
    stripe_fee: number;
    contractor_payout: number;
  } {
    const platform_fee = amount * 0.05; // 5% platform fee
    const stripe_fee = amount * 0.029 + 0.30; // Stripe's fee structure
    const contractor_payout = amount - platform_fee - stripe_fee;

    return {
      platform_fee: Math.round(platform_fee * 100) / 100,
      stripe_fee: Math.round(stripe_fee * 100) / 100,
      contractor_payout: Math.round(contractor_payout * 100) / 100
    };
  }

  /**
   * Auto-release payment after work completion + grace period
   */
  async autoReleasePayments(): Promise<void> {
    try {
      // Find milestones that are completed but not yet approved after grace period
      const gracePeriodHours = 72; // 3 days
      const cutoffTime = new Date(Date.now() - gracePeriodHours * 60 * 60 * 1000);

      const { data: milestonesForRelease } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('status', 'completed')
        .lt('completed_at', cutoffTime.toISOString());

      if (milestonesForRelease && milestonesForRelease.length > 0) {
        for (const milestone of milestonesForRelease) {
          console.log(`Auto-releasing payment for milestone ${milestone.id}`);
          await this.releaseMilestonePayment(milestone.id, 'system_auto_release');
        }
      }
    } catch (error) {
      console.error('Error in auto-release process:', error);
    }
  }

  private async notifyDisputeTeam(disputeId: string, reason: string): Promise<void> {
    // Implementation would send notification to admin team
    // This could be email, Slack webhook, etc.
    console.log(`Dispute initiated: ${disputeId}, Reason: ${reason}`);
    
    // Example: Send email notification
    // await sendEmail({
    //   to: 'disputes@booklocal.com',
    //   subject: 'New Dispute Initiated',
    //   body: `Dispute ID: ${disputeId}\nReason: ${reason}`
    // });
  }
}

// Utility functions for escrow management
export const escrowUtils = {
  /**
   * Create standard milestone structure for a booking
   */
  createStandardMilestones(totalAmount: number, serviceType: string): Omit<PaymentMilestone, 'id' | 'booking_id' | 'created_at'>[] {
    const milestones = [];
    
    if (totalAmount <= 500) {
      // Small jobs: Single payment on completion
      milestones.push({
        title: 'Project Completion',
        description: 'Payment upon job completion and customer approval',
        amount: totalAmount,
        status: 'pending' as const,
        sort_order: 1
      });
    } else if (totalAmount <= 2000) {
      // Medium jobs: 50% upfront, 50% on completion
      milestones.push(
        {
          title: 'Project Start',
          description: 'Initial payment to begin work',
          amount: totalAmount * 0.5,
          status: 'pending' as const,
          sort_order: 1
        },
        {
          title: 'Project Completion',
          description: 'Final payment upon completion',
          amount: totalAmount * 0.5,
          status: 'pending' as const,
          sort_order: 2
        }
      );
    } else {
      // Large jobs: 30% start, 40% midpoint, 30% completion
      milestones.push(
        {
          title: 'Project Start',
          description: 'Initial payment to begin work',
          amount: totalAmount * 0.3,
          status: 'pending' as const,
          sort_order: 1
        },
        {
          title: 'Midpoint Progress',
          description: 'Payment at 50% project completion',
          amount: totalAmount * 0.4,
          status: 'pending' as const,
          sort_order: 2
        },
        {
          title: 'Project Completion',
          description: 'Final payment upon completion',
          amount: totalAmount * 0.3,
          status: 'pending' as const,
          sort_order: 3
        }
      );
    }
    
    return milestones;
  },

  /**
   * Validate milestone amounts match total
   */
  validateMilestones(milestones: PaymentMilestone[], expectedTotal: number): boolean {
    const totalMilestoneAmount = milestones.reduce((sum, milestone) => sum + milestone.amount, 0);
    return Math.abs(totalMilestoneAmount - expectedTotal) < 0.01; // Allow for small rounding differences
  }
};

// Export the main service instance
export const escrowService = new EscrowService();