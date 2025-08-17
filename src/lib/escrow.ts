// Real Escrow System for Secure Marketplace Payments
// Handles funds holding, milestone releases, and dispute resolution

import { supabase } from './supabase';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export interface EscrowAccount {
  id: string;
  booking_id: string;
  total_amount: number;
  held_amount: number;
  released_amount: number;
  status: 'created' | 'funded' | 'partial_release' | 'completed' | 'disputed';
  stripe_payment_intent_id?: string;
  stripe_transfer_group?: string;
  created_at: string;
  updated_at: string;
}

export interface MilestoneRelease {
  milestone_id: string;
  amount: number;
  description: string;
  approved_by_customer: boolean;
  released_to_contractor: boolean;
  dispute_reason?: string;
}

export interface EscrowTransaction {
  id: string;
  escrow_account_id: string;
  type: 'deposit' | 'hold' | 'release' | 'refund' | 'dispute_hold';
  amount: number;
  description: string;
  stripe_transaction_id?: string;
  created_at: string;
}

// Main Escrow Service Class
export class EscrowService {
  // Create an escrow account for a booking
  async createEscrowAccount(
    bookingId: string,
    totalAmount: number,
    customerId: string,
    contractorId: string,
    paymentMethodId: string
  ): Promise<{
    success: boolean;
    escrowAccount?: EscrowAccount;
    paymentIntentClientSecret?: string;
    error?: string;
  }> {
    try {
      // Create Stripe Payment Intent with funds on hold
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // Convert to cents
        currency: 'usd',
        customer: customerId,
        payment_method: paymentMethodId,
        confirmation_method: 'manual',
        confirm: true,
        capture_method: 'manual', // This keeps funds on hold
        transfer_group: `booking_${bookingId}`,
        metadata: {
          booking_id: bookingId,
          contractor_id: contractorId,
          type: 'escrow_deposit'
        },
        description: `Escrow deposit for BookLocal booking #${bookingId}`
      });

      if (paymentIntent.status !== 'requires_capture') {
        throw new Error(`Payment intent failed: ${paymentIntent.status}`);
      }

      // Create escrow account in database
      const { data: escrowAccount, error: dbError } = await supabase
        .from('escrow_accounts')
        .insert({
          booking_id: bookingId,
          total_amount: totalAmount,
          held_amount: totalAmount,
          released_amount: 0,
          status: 'funded',
          stripe_payment_intent_id: paymentIntent.id,
          stripe_transfer_group: `booking_${bookingId}`
        })
        .select()
        .single();

      if (dbError) {
        // Cancel the payment intent if database insert fails
        await stripe.paymentIntents.cancel(paymentIntent.id);
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Log the escrow creation
      await this.logEscrowTransaction(
        escrowAccount.id,
        'deposit',
        totalAmount,
        `Escrow account created and funded`,
        paymentIntent.id
      );

      // Log security event
      await supabase
        .from('security_logs')
        .insert({
          user_id: customerId,
          event_type: 'escrow_account_created',
          severity: 'medium',
          details: {
            booking_id: bookingId,
            escrow_account_id: escrowAccount.id,
            amount: totalAmount,
            stripe_payment_intent_id: paymentIntent.id
          }
        });

      return {
        success: true,
        escrowAccount,
        paymentIntentClientSecret: paymentIntent.client_secret || undefined
      };

    } catch (error) {
      console.error('Escrow account creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create escrow account'
      };
    }
  }

  // Release funds for a milestone
  async releaseMilestone(
    escrowAccountId: string,
    milestoneId: string,
    amount: number,
    contractorStripeAccountId: string,
    approvedByUserId: string
  ): Promise<{
    success: boolean;
    transfer?: any;
    error?: string;
  }> {
    try {
      // Get escrow account
      const { data: escrowAccount, error: fetchError } = await supabase
        .from('escrow_accounts')
        .select('*')
        .eq('id', escrowAccountId)
        .single();

      if (fetchError || !escrowAccount) {
        throw new Error('Escrow account not found');
      }

      // Validate release amount
      if (amount > escrowAccount.held_amount) {
        throw new Error('Release amount exceeds held funds');
      }

      // Get milestone details
      const { data: milestone, error: milestoneError } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('id', milestoneId)
        .single();

      if (milestoneError || !milestone) {
        throw new Error('Milestone not found');
      }

      // Calculate platform fee (e.g., 10%)
      const platformFeeRate = 0.10;
      const platformFee = Math.round(amount * platformFeeRate);
      const contractorPayout = amount - platformFee;

      // Capture the payment from the original payment intent (partial capture)
      const paymentIntent = await stripe.paymentIntents.capture(
        escrowAccount.stripe_payment_intent_id!,
        {
          amount_to_capture: Math.round(amount * 100) // Convert to cents
        }
      );

      // Transfer funds to contractor (minus platform fee)
      const transfer = await stripe.transfers.create({
        amount: Math.round(contractorPayout * 100),
        currency: 'usd',
        destination: contractorStripeAccountId,
        transfer_group: escrowAccount.stripe_transfer_group!,
        metadata: {
          booking_id: escrowAccount.booking_id,
          milestone_id: milestoneId,
          escrow_account_id: escrowAccountId,
          type: 'milestone_release'
        },
        description: `Milestone payment for booking #${escrowAccount.booking_id}`
      });

      // Update escrow account
      const newHeldAmount = escrowAccount.held_amount - amount;
      const newReleasedAmount = escrowAccount.released_amount + amount;
      const newStatus = newHeldAmount <= 0 ? 'completed' : 'partial_release';

      const { error: updateError } = await supabase
        .from('escrow_accounts')
        .update({
          held_amount: newHeldAmount,
          released_amount: newReleasedAmount,
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', escrowAccountId);

      if (updateError) {
        throw new Error(`Failed to update escrow account: ${updateError.message}`);
      }

      // Update milestone status
      await supabase
        .from('project_milestones')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: approvedByUserId
        })
        .eq('id', milestoneId);

      // Record the transaction
      await this.logEscrowTransaction(
        escrowAccountId,
        'release',
        amount,
        `Milestone ${milestoneId} payment released`,
        transfer.id
      );

      // Log security event
      await supabase
        .from('security_logs')
        .insert({
          user_id: approvedByUserId,
          event_type: 'escrow_milestone_released',
          severity: 'medium',
          details: {
            escrow_account_id: escrowAccountId,
            milestone_id: milestoneId,
            amount,
            contractor_payout: contractorPayout,
            platform_fee: platformFee,
            stripe_transfer_id: transfer.id
          }
        });

      // Send notifications
      await this.sendReleaseNotifications(escrowAccount.booking_id, milestoneId, amount);

      return {
        success: true,
        transfer
      };

    } catch (error) {
      console.error('Milestone release error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to release milestone'
      };
    }
  }

  // Handle dispute and hold funds
  async initiateDispute(
    escrowAccountId: string,
    disputeReason: string,
    initiatedByUserId: string
  ): Promise<{
    success: boolean;
    dispute?: any;
    error?: string;
  }> {
    try {
      // Get escrow account
      const { data: escrowAccount, error: fetchError } = await supabase
        .from('escrow_accounts')
        .select('*')
        .eq('id', escrowAccountId)
        .single();

      if (fetchError || !escrowAccount) {
        throw new Error('Escrow account not found');
      }

      // Update escrow status to disputed
      const { error: updateError } = await supabase
        .from('escrow_accounts')
        .update({
          status: 'disputed',
          updated_at: new Date().toISOString()
        })
        .eq('id', escrowAccountId);

      if (updateError) {
        throw new Error(`Failed to update escrow status: ${updateError.message}`);
      }

      // Create dispute record (this would integrate with a dispute resolution system)
      const { data: dispute, error: disputeError } = await supabase
        .from('booking_disputes')
        .insert({
          booking_id: escrowAccount.booking_id,
          escrow_account_id: escrowAccountId,
          initiated_by: initiatedByUserId,
          reason: disputeReason,
          status: 'open',
          amount_in_dispute: escrowAccount.held_amount,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (disputeError) {
        throw new Error(`Failed to create dispute record: ${disputeError.message}`);
      }

      // Log the dispute transaction
      await this.logEscrowTransaction(
        escrowAccountId,
        'dispute_hold',
        escrowAccount.held_amount,
        `Dispute initiated: ${disputeReason}`,
        undefined
      );

      // Log security event
      await supabase
        .from('security_logs')
        .insert({
          user_id: initiatedByUserId,
          event_type: 'escrow_dispute_initiated',
          severity: 'high',
          details: {
            escrow_account_id: escrowAccountId,
            booking_id: escrowAccount.booking_id,
            dispute_id: dispute.id,
            reason: disputeReason,
            amount_in_dispute: escrowAccount.held_amount
          }
        });

      // Send dispute notifications
      await this.sendDisputeNotifications(escrowAccount.booking_id, dispute.id, disputeReason);

      return {
        success: true,
        dispute
      };

    } catch (error) {
      console.error('Dispute initiation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initiate dispute'
      };
    }
  }

  // Refund funds back to customer
  async processRefund(
    escrowAccountId: string,
    refundAmount: number,
    reason: string,
    processedByUserId: string
  ): Promise<{
    success: boolean;
    refund?: any;
    error?: string;
  }> {
    try {
      // Get escrow account
      const { data: escrowAccount, error: fetchError } = await supabase
        .from('escrow_accounts')
        .select('*')
        .eq('id', escrowAccountId)
        .single();

      if (fetchError || !escrowAccount) {
        throw new Error('Escrow account not found');
      }

      // Validate refund amount
      if (refundAmount > escrowAccount.held_amount) {
        throw new Error('Refund amount exceeds held funds');
      }

      // Process refund through Stripe
      const refund = await stripe.refunds.create({
        payment_intent: escrowAccount.stripe_payment_intent_id!,
        amount: Math.round(refundAmount * 100), // Convert to cents
        reason: 'requested_by_customer',
        metadata: {
          booking_id: escrowAccount.booking_id,
          escrow_account_id: escrowAccountId,
          processed_by: processedByUserId,
          refund_reason: reason
        }
      });

      // Update escrow account
      const newHeldAmount = escrowAccount.held_amount - refundAmount;
      const newStatus = newHeldAmount <= 0 ? 'completed' : escrowAccount.status;

      const { error: updateError } = await supabase
        .from('escrow_accounts')
        .update({
          held_amount: newHeldAmount,
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', escrowAccountId);

      if (updateError) {
        throw new Error(`Failed to update escrow account: ${updateError.message}`);
      }

      // Log the refund transaction
      await this.logEscrowTransaction(
        escrowAccountId,
        'refund',
        refundAmount,
        `Refund processed: ${reason}`,
        refund.id
      );

      // Log security event
      await supabase
        .from('security_logs')
        .insert({
          user_id: processedByUserId,
          event_type: 'escrow_refund_processed',
          severity: 'medium',
          details: {
            escrow_account_id: escrowAccountId,
            booking_id: escrowAccount.booking_id,
            refund_amount: refundAmount,
            reason,
            stripe_refund_id: refund.id
          }
        });

      // Send refund notifications
      await this.sendRefundNotifications(escrowAccount.booking_id, refundAmount, reason);

      return {
        success: true,
        refund
      };

    } catch (error) {
      console.error('Refund processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process refund'
      };
    }
  }

  // Get escrow account status and transaction history
  async getEscrowStatus(escrowAccountId: string): Promise<{
    success: boolean;
    escrowAccount?: EscrowAccount;
    transactions?: EscrowTransaction[];
    error?: string;
  }> {
    try {
      // Get escrow account
      const { data: escrowAccount, error: accountError } = await supabase
        .from('escrow_accounts')
        .select('*')
        .eq('id', escrowAccountId)
        .single();

      if (accountError || !escrowAccount) {
        throw new Error('Escrow account not found');
      }

      // Get transaction history
      const { data: transactions, error: transactionError } = await supabase
        .from('escrow_transactions')
        .select('*')
        .eq('escrow_account_id', escrowAccountId)
        .order('created_at', { ascending: false });

      if (transactionError) {
        throw new Error(`Failed to fetch transactions: ${transactionError.message}`);
      }

      return {
        success: true,
        escrowAccount,
        transactions: transactions || []
      };

    } catch (error) {
      console.error('Escrow status fetch error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch escrow status'
      };
    }
  }

  // Private helper methods

  private async logEscrowTransaction(
    escrowAccountId: string,
    type: 'deposit' | 'hold' | 'release' | 'refund' | 'dispute_hold',
    amount: number,
    description: string,
    stripeTransactionId?: string
  ): Promise<void> {
    await supabase
      .from('escrow_transactions')
      .insert({
        escrow_account_id: escrowAccountId,
        type,
        amount,
        description,
        stripe_transaction_id: stripeTransactionId,
        created_at: new Date().toISOString()
      });
  }

  private async sendReleaseNotifications(
    bookingId: string,
    milestoneId: string,
    amount: number
  ): Promise<void> {
    try {
      // Get booking details
      const { data: booking } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:customer_id(id, first_name, last_name, email),
          contractor:contractor_id(id, user_id, business_name)
        `)
        .eq('id', bookingId)
        .single();

      if (!booking) return;

      // Notify customer
      await supabase
        .from('notifications')
        .insert({
          user_id: booking.customer_id,
          type: 'milestone_payment_released',
          title: 'Payment Released to Contractor',
          content: `$${amount.toFixed(2)} has been released to ${booking.contractor.business_name} for completed milestone.`,
          data: {
            booking_id: bookingId,
            milestone_id: milestoneId,
            amount,
            contractor_name: booking.contractor.business_name
          }
        });

      // Notify contractor
      await supabase
        .from('notifications')
        .insert({
          user_id: booking.contractor.user_id,
          type: 'milestone_payment_received',
          title: 'Payment Received',
          content: `You've received $${amount.toFixed(2)} for completed milestone. Funds will be transferred to your account within 1-2 business days.`,
          data: {
            booking_id: bookingId,
            milestone_id: milestoneId,
            amount
          }
        });

    } catch (error) {
      console.error('Error sending release notifications:', error);
    }
  }

  private async sendDisputeNotifications(
    bookingId: string,
    disputeId: string,
    reason: string
  ): Promise<void> {
    try {
      // Get booking details
      const { data: booking } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:customer_id(id, first_name, last_name, email),
          contractor:contractor_id(id, user_id, business_name)
        `)
        .eq('id', bookingId)
        .single();

      if (!booking) return;

      // Notify both parties
      const notifications = [
        {
          user_id: booking.customer_id,
          type: 'dispute_initiated',
          title: 'Dispute Initiated',
          content: `A dispute has been opened for your booking. Our team will review and contact you within 24 hours.`,
          data: { booking_id: bookingId, dispute_id: disputeId, reason }
        },
        {
          user_id: booking.contractor.user_id,
          type: 'dispute_initiated',
          title: 'Dispute Initiated',
          content: `A dispute has been opened for your booking. Our team will review and contact you within 24 hours.`,
          data: { booking_id: bookingId, dispute_id: disputeId, reason }
        }
      ];

      await supabase
        .from('notifications')
        .insert(notifications);

    } catch (error) {
      console.error('Error sending dispute notifications:', error);
    }
  }

  private async sendRefundNotifications(
    bookingId: string,
    refundAmount: number,
    reason: string
  ): Promise<void> {
    try {
      // Get booking details
      const { data: booking } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:customer_id(id, first_name, last_name, email)
        `)
        .eq('id', bookingId)
        .single();

      if (!booking) return;

      // Notify customer
      await supabase
        .from('notifications')
        .insert({
          user_id: booking.customer_id,
          type: 'refund_processed',
          title: 'Refund Processed',
          content: `Your refund of $${refundAmount.toFixed(2)} has been processed and will appear in your account within 3-5 business days.`,
          data: {
            booking_id: bookingId,
            refund_amount: refundAmount,
            reason
          }
        });

    } catch (error) {
      console.error('Error sending refund notifications:', error);
    }
  }
}

// Export the main service
export const escrowService = new EscrowService();

// Utility functions for escrow management
export function calculatePlatformFee(amount: number, feeRate: number = 0.10): {
  platformFee: number;
  contractorPayout: number;
  processingFee: number;
} {
  const platformFee = Math.round(amount * feeRate * 100) / 100;
  const processingFee = Math.round((amount * 0.029 + 0.30) * 100) / 100; // Stripe fees
  const contractorPayout = amount - platformFee - processingFee;

  return {
    platformFee,
    contractorPayout: Math.max(0, contractorPayout),
    processingFee
  };
}

export function getEscrowStatusDescription(status: string): string {
  switch (status) {
    case 'created':
      return 'Escrow account created, awaiting funding';
    case 'funded':
      return 'Funds secured in escrow, ready for milestone releases';
    case 'partial_release':
      return 'Some milestones completed, partial funds released';
    case 'completed':
      return 'All funds released, escrow account closed';
    case 'disputed':
      return 'Dispute in progress, funds held for resolution';
    default:
      return 'Unknown status';
  }
}

export function validateEscrowAmount(amount: number): {
  valid: boolean;
  error?: string;
} {
  if (amount <= 0) {
    return { valid: false, error: 'Amount must be greater than zero' };
  }

  if (amount < 50) {
    return { valid: false, error: 'Minimum escrow amount is $50' };
  }

  if (amount > 50000) {
    return { valid: false, error: 'Maximum escrow amount is $50,000' };
  }

  return { valid: true };
}