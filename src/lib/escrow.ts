import { supabase } from './supabase';
import { PaymentProcessor } from './payments';

// Types
export interface EscrowAccount {
  id: string;
  booking_id: string;
  customer_id: string;
  contractor_id: string;
  total_amount: number;
  held_amount: number;
  released_amount: number;
  platform_fee: number;
  status: 'created' | 'funded' | 'partial_release' | 'completed' | 'disputed' | 'refunded';
  payment_intent_id?: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export interface EscrowMilestone {
  id: string;
  escrow_id: string;
  title: string;
  description?: string;
  amount: number;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'approved' | 'disputed' | 'released';
  completed_at?: string;
  approved_at?: string;
  approved_by?: string;
  released_at?: string;
  sort_order: number;
  created_at: string;
  metadata: Record<string, any>;
}

export interface EscrowTransaction {
  id: string;
  escrow_id: string;
  milestone_id?: string;
  type: 'fund' | 'release' | 'refund' | 'fee';
  amount: number;
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled';
  payment_intent_id?: string;
  transfer_id?: string;
  failure_reason?: string;
  processed_at?: string;
  created_at: string;
  metadata: Record<string, any>;
}

export class EscrowService {
  /**
   * Create a new escrow account for a booking
   */
  static async createEscrowAccount(params: {
    bookingId: string;
    customerId: string;
    contractorId: string;
    totalAmount: number;
    platformFeePercentage?: number;
    milestones?: Array<{
      title: string;
      description?: string;
      amount: number;
      dueDate?: string;
    }>;
  }): Promise<{ success: boolean; escrow?: EscrowAccount; error?: string }> {
    try {
      const platformFeePercentage = params.platformFeePercentage || 10; // 10% default
      const platformFee = Math.round(params.totalAmount * (platformFeePercentage / 100));

      // Create escrow account
      const { data: escrow, error: escrowError } = await supabase
        .from('escrow_accounts')
        .insert({
          booking_id: params.bookingId,
          customer_id: params.customerId,
          contractor_id: params.contractorId,
          total_amount: params.totalAmount,
          held_amount: 0,
          released_amount: 0,
          platform_fee: platformFee,
          status: 'created',
          metadata: {
            created_by: 'system',
            platform_fee_percentage: platformFeePercentage
          }
        })
        .select()
        .single();

      if (escrowError) throw escrowError;

      // Create milestones if provided
      if (params.milestones && params.milestones.length > 0) {
        const milestones = params.milestones.map((milestone, index) => ({
          escrow_id: escrow.id,
          title: milestone.title,
          description: milestone.description,
          amount: milestone.amount,
          due_date: milestone.dueDate,
          status: 'pending' as const,
          sort_order: index + 1,
          metadata: {}
        }));

        const { error: milestonesError } = await supabase
          .from('escrow_milestones')
          .insert(milestones);

        if (milestonesError) throw milestonesError;
      }

      // Log the creation
      await this.logEscrowActivity(escrow.id, 'created', {
        total_amount: params.totalAmount,
        platform_fee: platformFee,
        milestones_count: params.milestones?.length || 0
      });

      return { success: true, escrow };
    } catch (error) {
      console.error('Error creating escrow account:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Fund an escrow account by creating a payment intent
   */
  static async fundEscrow(params: {
    escrowId: string;
    paymentMethodId: string;
    customerId: string;
  }): Promise<{ success: boolean; paymentIntentId?: string; error?: string }> {
    try {
      // Get escrow account
      const { data: escrow, error: escrowError } = await supabase
        .from('escrow_accounts')
        .select('*')
        .eq('id', params.escrowId)
        .single();

      if (escrowError) throw escrowError;
      if (escrow.status !== 'created') {
        throw new Error('Escrow account is not in created status');
      }

      // Create payment intent with manual capture (hold funds)
      const paymentResult = await PaymentProcessor.createPaymentIntent({
        amount: escrow.total_amount,
        currency: 'usd',
        paymentMethodId: params.paymentMethodId,
        customerId: params.customerId,
        captureMethod: 'manual',
        description: `Escrow funding for booking ${escrow.booking_id}`,
        metadata: {
          escrow_id: params.escrowId,
          booking_id: escrow.booking_id,
          type: 'escrow_funding'
        }
      });

      if (!paymentResult.success || !paymentResult.paymentIntent) {
        throw new Error(paymentResult.error || 'Payment intent creation failed');
      }

      // Update escrow account
      const { error: updateError } = await supabase
        .from('escrow_accounts')
        .update({
          status: 'funded',
          held_amount: escrow.total_amount,
          payment_intent_id: paymentResult.paymentIntent.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.escrowId);

      if (updateError) throw updateError;

      // Create escrow transaction record
      await supabase
        .from('escrow_transactions')
        .insert({
          escrow_id: params.escrowId,
          type: 'fund',
          amount: escrow.total_amount,
          status: 'succeeded',
          payment_intent_id: paymentResult.paymentIntent.id,
          processed_at: new Date().toISOString(),
          metadata: {
            payment_method_id: params.paymentMethodId,
            customer_id: params.customerId
          }
        });

      // Log the activity
      await this.logEscrowActivity(params.escrowId, 'funded', {
        amount: escrow.total_amount,
        payment_intent_id: paymentResult.paymentIntent.id
      });

      return { success: true, paymentIntentId: paymentResult.paymentIntent.id };
    } catch (error) {
      console.error('Error funding escrow:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Release a milestone payment to the contractor
   */
  static async releaseMilestone(params: {
    escrowId: string;
    milestoneId: string;
    approvedBy: string;
    contractorStripeAccountId: string;
  }): Promise<{ success: boolean; transferId?: string; error?: string }> {
    try {
      // Get escrow and milestone
      const { data: escrow, error: escrowError } = await supabase
        .from('escrow_accounts')
        .select('*')
        .eq('id', params.escrowId)
        .single();

      if (escrowError) throw escrowError;

      const { data: milestone, error: milestoneError } = await supabase
        .from('escrow_milestones')
        .select('*')
        .eq('id', params.milestoneId)
        .eq('escrow_id', params.escrowId)
        .single();

      if (milestoneError) throw milestoneError;

      // Validate milestone can be released
      if (milestone.status !== 'approved') {
        throw new Error('Milestone must be approved before release');
      }

      if (escrow.held_amount < milestone.amount) {
        throw new Error('Insufficient funds in escrow');
      }

      // Calculate transfer amount (milestone amount minus platform fee)
      const platformFeeAmount = Math.round(milestone.amount * (escrow.metadata.platform_fee_percentage || 10) / 100);
      const transferAmount = milestone.amount - platformFeeAmount;

      // Create transfer to contractor
      const transferResult = await PaymentProcessor.transferFunds({
        amount: transferAmount,
        destination: params.contractorStripeAccountId,
        description: `Milestone payment: ${milestone.title}`,
        metadata: {
          escrow_id: params.escrowId,
          milestone_id: params.milestoneId,
          booking_id: escrow.booking_id,
          platform_fee: platformFeeAmount
        }
      });

      if (!transferResult.success) {
        throw new Error(transferResult.error || 'Transfer failed');
      }

      // Update milestone status
      await supabase
        .from('escrow_milestones')
        .update({
          status: 'released',
          released_at: new Date().toISOString()
        })
        .eq('id', params.milestoneId);

      // Update escrow account
      const newHeldAmount = escrow.held_amount - milestone.amount;
      const newReleasedAmount = escrow.released_amount + milestone.amount;
      const newStatus = newHeldAmount === 0 ? 'completed' : 'partial_release';

      await supabase
        .from('escrow_accounts')
        .update({
          held_amount: newHeldAmount,
          released_amount: newReleasedAmount,
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.escrowId);

      // Create transaction record
      await supabase
        .from('escrow_transactions')
        .insert({
          escrow_id: params.escrowId,
          milestone_id: params.milestoneId,
          type: 'release',
          amount: milestone.amount,
          status: 'succeeded',
          transfer_id: transferResult.transferId,
          processed_at: new Date().toISOString(),
          metadata: {
            transfer_amount: transferAmount,
            platform_fee: platformFeeAmount,
            approved_by: params.approvedBy
          }
        });

      // Log the activity
      await this.logEscrowActivity(params.escrowId, 'milestone_released', {
        milestone_id: params.milestoneId,
        milestone_title: milestone.title,
        amount: milestone.amount,
        transfer_amount: transferAmount,
        platform_fee: platformFeeAmount
      });

      return { success: true, transferId: transferResult.transferId };
    } catch (error) {
      console.error('Error releasing milestone:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Refund escrow funds back to customer
   */
  static async refundEscrow(params: {
    escrowId: string;
    amount?: number; // If not provided, refunds all held amount
    reason: string;
    refundedBy: string;
  }): Promise<{ success: boolean; refundId?: string; error?: string }> {
    try {
      // Get escrow account
      const { data: escrow, error: escrowError } = await supabase
        .from('escrow_accounts')
        .select('*')
        .eq('id', params.escrowId)
        .single();

      if (escrowError) throw escrowError;

      if (escrow.held_amount === 0) {
        throw new Error('No funds available for refund');
      }

      const refundAmount = params.amount || escrow.held_amount;
      if (refundAmount > escrow.held_amount) {
        throw new Error('Refund amount exceeds held amount');
      }

      // Create refund
      const refundResult = await PaymentProcessor.refundPayment({
        paymentIntentId: escrow.payment_intent_id,
        amount: refundAmount,
        reason: params.reason,
        metadata: {
          escrow_id: params.escrowId,
          booking_id: escrow.booking_id,
          refunded_by: params.refundedBy
        }
      });

      if (!refundResult.success) {
        throw new Error(refundResult.error || 'Refund failed');
      }

      // Update escrow account
      const newHeldAmount = escrow.held_amount - refundAmount;
      const newStatus = newHeldAmount === 0 ? 'refunded' : escrow.status;

      await supabase
        .from('escrow_accounts')
        .update({
          held_amount: newHeldAmount,
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.escrowId);

      // Create transaction record
      await supabase
        .from('escrow_transactions')
        .insert({
          escrow_id: params.escrowId,
          type: 'refund',
          amount: refundAmount,
          status: 'succeeded',
          payment_intent_id: refundResult.refundId,
          processed_at: new Date().toISOString(),
          metadata: {
            reason: params.reason,
            refunded_by: params.refundedBy
          }
        });

      // Log the activity
      await this.logEscrowActivity(params.escrowId, 'refunded', {
        amount: refundAmount,
        reason: params.reason,
        refunded_by: params.refundedBy
      });

      return { success: true, refundId: refundResult.refundId };
    } catch (error) {
      console.error('Error refunding escrow:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Approve a milestone for release
   */
  static async approveMilestone(params: {
    milestoneId: string;
    approvedBy: string;
    notes?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('escrow_milestones')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: params.approvedBy,
          metadata: {
            approval_notes: params.notes,
            approved_timestamp: new Date().toISOString()
          }
        })
        .eq('id', params.milestoneId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error approving milestone:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Dispute an escrow account
   */
  static async disputeEscrow(params: {
    escrowId: string;
    disputedBy: string;
    reason: string;
    description?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      // Update escrow status to disputed
      const { error: escrowError } = await supabase
        .from('escrow_accounts')
        .update({
          status: 'disputed',
          updated_at: new Date().toISOString(),
          metadata: {
            dispute_reason: params.reason,
            dispute_description: params.description,
            disputed_by: params.disputedBy,
            disputed_at: new Date().toISOString()
          }
        })
        .eq('id', params.escrowId);

      if (escrowError) throw escrowError;

      // Log the dispute
      await this.logEscrowActivity(params.escrowId, 'disputed', {
        disputed_by: params.disputedBy,
        reason: params.reason,
        description: params.description
      });

      // TODO: Create dispute record in disputes table
      // TODO: Notify admin/support team

      return { success: true };
    } catch (error) {
      console.error('Error disputing escrow:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get escrow account with milestones
   */
  static async getEscrowAccount(escrowId: string): Promise<{
    success: boolean;
    escrow?: EscrowAccount & { milestones: EscrowMilestone[] };
    error?: string;
  }> {
    try {
      const { data: escrow, error: escrowError } = await supabase
        .from('escrow_accounts')
        .select(`
          *,
          milestones:escrow_milestones(*)
        `)
        .eq('id', escrowId)
        .single();

      if (escrowError) throw escrowError;

      return { success: true, escrow };
    } catch (error) {
      console.error('Error getting escrow account:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get escrow transactions
   */
  static async getEscrowTransactions(escrowId: string): Promise<{
    success: boolean;
    transactions?: EscrowTransaction[];
    error?: string;
  }> {
    try {
      const { data: transactions, error } = await supabase
        .from('escrow_transactions')
        .select('*')
        .eq('escrow_id', escrowId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, transactions };
    } catch (error) {
      console.error('Error getting escrow transactions:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Log escrow activity for audit trail
   */
  private static async logEscrowActivity(
    escrowId: string,
    activity: string,
    details: Record<string, any>
  ): Promise<void> {
    try {
      await supabase
        .from('escrow_activity_logs')
        .insert({
          escrow_id: escrowId,
          activity,
          details,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging escrow activity:', error);
      // Don't throw - logging errors shouldn't break main functionality
    }
  }

  /**
   * Calculate platform fees
   */
  static calculatePlatformFee(amount: number, feePercentage: number = 10): number {
    return Math.round(amount * (feePercentage / 100));
  }

  /**
   * Get escrow statistics for admin dashboard
   */
  static async getEscrowStats(): Promise<{
    success: boolean;
    stats?: {
      total_escrows: number;
      total_volume: number;
      held_amount: number;
      released_amount: number;
      disputed_count: number;
    };
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('escrow_accounts')
        .select('total_amount, held_amount, released_amount, status');

      if (error) throw error;

      const stats = data.reduce((acc, escrow) => {
        acc.total_escrows++;
        acc.total_volume += escrow.total_amount;
        acc.held_amount += escrow.held_amount;
        acc.released_amount += escrow.released_amount;
        if (escrow.status === 'disputed') acc.disputed_count++;
        return acc;
      }, {
        total_escrows: 0,
        total_volume: 0,
        held_amount: 0,
        released_amount: 0,
        disputed_count: 0
      });

      return { success: true, stats };
    } catch (error) {
      console.error('Error getting escrow stats:', error);
      return { success: false, error: error.message };
    }
  }
}

export default EscrowService;