import { supabase } from './supabase';
import { escrowService } from './escrow';

// Types for dispute resolution
export interface Dispute {
  id: string;
  booking_id: string;
  escrow_account_id?: string;
  customer_id: string;
  contractor_id: string;
  initiated_by: 'customer' | 'contractor';
  type: 'payment' | 'quality' | 'timeline' | 'communication' | 'cancellation' | 'other';
  status: 'open' | 'in_mediation' | 'escalated' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  amount_disputed?: number;
  title: string;
  description: string;
  evidence: DisputeEvidence[];
  resolution?: DisputeResolution;
  mediator_id?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  metadata: Record<string, any>;
}

export interface DisputeEvidence {
  id: string;
  dispute_id: string;
  submitted_by: string;
  type: 'photo' | 'document' | 'message' | 'receipt' | 'video' | 'other';
  file_url?: string;
  description: string;
  submitted_at: string;
}

export interface DisputeResolution {
  id: string;
  dispute_id: string;
  resolution_type: 'full_refund' | 'partial_refund' | 'no_refund' | 'redo_work' | 'partial_payment' | 'mediated_agreement';
  refund_amount?: number;
  payment_release_amount?: number;
  resolution_details: string;
  agreed_by_customer: boolean;
  agreed_by_contractor: boolean;
  enforced_by_admin: boolean;
  resolved_by: string;
  resolved_at: string;
}

export interface DisputeMessage {
  id: string;
  dispute_id: string;
  sender_id: string;
  sender_type: 'customer' | 'contractor' | 'mediator' | 'system';
  message: string;
  is_internal: boolean; // Internal notes visible only to mediators/admins
  created_at: string;
}

export interface MediationSession {
  id: string;
  dispute_id: string;
  mediator_id: string;
  scheduled_at: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  meeting_link?: string;
  notes?: string;
  outcome?: 'resolved' | 'escalated' | 'no_agreement';
}

// Main Dispute Resolution Service
export class DisputeResolutionService {
  /**
   * Create a new dispute
   */
  async createDispute(disputeData: {
    booking_id: string;
    initiated_by: 'customer' | 'contractor';
    initiator_id: string;
    type: Dispute['type'];
    title: string;
    description: string;
    amount_disputed?: number;
    evidence?: Omit<DisputeEvidence, 'id' | 'dispute_id' | 'submitted_at'>[];
  }): Promise<{ success: boolean; dispute_id?: string; error?: string }> {
    try {
      // Get booking details
      const { data: booking } = await supabase
        .from('bookings')
        .select(`
          *,
          contractor_profiles (
            id,
            user_id
          )
        `)
        .eq('id', disputeData.booking_id)
        .single();

      if (!booking) {
        return { success: false, error: 'Booking not found' };
      }

      // Determine priority based on amount and type
      const priority = this.calculateDisputePriority(
        disputeData.amount_disputed || booking.final_cost || booking.estimated_cost,
        disputeData.type
      );

      // Check if there's an existing open dispute for this booking
      const { data: existingDispute } = await supabase
        .from('disputes')
        .select('id')
        .eq('booking_id', disputeData.booking_id)
        .in('status', ['open', 'in_mediation', 'escalated'])
        .single();

      if (existingDispute) {
        return { success: false, error: 'An active dispute already exists for this booking' };
      }

      // Get escrow account if exists
      const { data: escrowAccount } = await supabase
        .from('escrow_accounts')
        .select('id')
        .eq('booking_id', disputeData.booking_id)
        .single();

      // Create the dispute
      const { data: dispute, error } = await supabase
        .from('disputes')
        .insert({
          booking_id: disputeData.booking_id,
          escrow_account_id: escrowAccount?.id,
          customer_id: booking.customer_id,
          contractor_id: booking.contractor_profiles.user_id,
          initiated_by: disputeData.initiated_by,
          type: disputeData.type,
          status: 'open',
          priority,
          amount_disputed: disputeData.amount_disputed,
          title: disputeData.title,
          description: disputeData.description,
          evidence: [],
          metadata: {
            booking_amount: booking.final_cost || booking.estimated_cost,
            booking_status: booking.status
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Add evidence if provided
      if (disputeData.evidence && disputeData.evidence.length > 0) {
        await this.addEvidence(dispute.id, disputeData.evidence);
      }

      // Freeze escrow if applicable
      if (escrowAccount && disputeData.type === 'payment') {
        await escrowService.initiateDispute(
          escrowAccount.id,
          disputeData.title,
          disputeData.initiator_id
        );
      }

      // Send notifications
      await this.sendDisputeNotifications(dispute.id, 'created');

      // Auto-assign to mediation if high priority
      if (priority === 'urgent' || priority === 'high') {
        await this.assignMediator(dispute.id);
      }

      return { success: true, dispute_id: dispute.id };
    } catch (error) {
      console.error('Error creating dispute:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add evidence to a dispute
   */
  async addEvidence(disputeId: string, evidence: Omit<DisputeEvidence, 'id' | 'dispute_id' | 'submitted_at'>[]): Promise<boolean> {
    try {
      const evidenceWithTimestamp = evidence.map(e => ({
        ...e,
        dispute_id: disputeId,
        submitted_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('dispute_evidence')
        .insert(evidenceWithTimestamp);

      if (error) throw error;

      // Update dispute evidence array
      const { data: existingEvidence } = await supabase
        .from('dispute_evidence')
        .select('*')
        .eq('dispute_id', disputeId);

      await supabase
        .from('disputes')
        .update({
          evidence: existingEvidence || [],
          updated_at: new Date().toISOString()
        })
        .eq('id', disputeId);

      return true;
    } catch (error) {
      console.error('Error adding evidence:', error);
      return false;
    }
  }

  /**
   * Add a message to a dispute
   */
  async addMessage(disputeId: string, messageData: {
    sender_id: string;
    sender_type: DisputeMessage['sender_type'];
    message: string;
    is_internal?: boolean;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('dispute_messages')
        .insert({
          dispute_id: disputeId,
          sender_id: messageData.sender_id,
          sender_type: messageData.sender_type,
          message: messageData.message,
          is_internal: messageData.is_internal || false,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update dispute timestamp
      await supabase
        .from('disputes')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', disputeId);

      return true;
    } catch (error) {
      console.error('Error adding message:', error);
      return false;
    }
  }

  /**
   * Attempt automated resolution
   */
  async attemptAutomatedResolution(disputeId: string): Promise<{
    success: boolean;
    resolution?: DisputeResolution;
    requires_mediation: boolean;
  }> {
    try {
      // Get dispute details
      const { data: dispute } = await supabase
        .from('disputes')
        .select(`
          *,
          bookings (
            *,
            reviews (rating, content)
          )
        `)
        .eq('id', disputeId)
        .single();

      if (!dispute) {
        return { success: false, requires_mediation: true };
      }

      // Simple automated resolution rules
      const autoResolution = this.analyzeForAutoResolution(dispute);

      if (autoResolution.canResolve) {
        const resolution = await this.createResolution(disputeId, {
          resolution_type: autoResolution.resolution_type,
          refund_amount: autoResolution.refund_amount,
          payment_release_amount: autoResolution.payment_release_amount,
          resolution_details: autoResolution.details,
          resolved_by: 'system',
          agreed_by_customer: true,
          agreed_by_contractor: true,
          enforced_by_admin: false
        });

        if (resolution) {
          await this.executeResolution(disputeId);
          return { success: true, resolution, requires_mediation: false };
        }
      }

      // If auto-resolution fails, move to mediation
      await this.escalateToMediation(disputeId);
      return { success: false, requires_mediation: true };

    } catch (error) {
      console.error('Error in automated resolution:', error);
      return { success: false, requires_mediation: true };
    }
  }

  /**
   * Escalate dispute to human mediation
   */
  async escalateToMediation(disputeId: string): Promise<boolean> {
    try {
      // Update dispute status
      await supabase
        .from('disputes')
        .update({
          status: 'in_mediation',
          updated_at: new Date().toISOString()
        })
        .eq('id', disputeId);

      // Assign mediator if not already assigned
      await this.assignMediator(disputeId);

      // Send notifications
      await this.sendDisputeNotifications(disputeId, 'escalated');

      return true;
    } catch (error) {
      console.error('Error escalating to mediation:', error);
      return false;
    }
  }

  /**
   * Assign a mediator to a dispute
   */
  async assignMediator(disputeId: string): Promise<boolean> {
    try {
      // Get available mediators (in a real system, this would be more sophisticated)
      const { data: mediators } = await supabase
        .from('users')
        .select('id, first_name, last_name')
        .eq('user_type', 'admin')
        .eq('status', 'active')
        .limit(5);

      if (!mediators || mediators.length === 0) {
        console.warn('No available mediators found');
        return false;
      }

      // Simple round-robin assignment (in production, consider workload balancing)
      const selectedMediator = mediators[Math.floor(Math.random() * mediators.length)];

      await supabase
        .from('disputes')
        .update({
          mediator_id: selectedMediator.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', disputeId);

      // Add system message about mediator assignment
      await this.addMessage(disputeId, {
        sender_id: 'system',
        sender_type: 'system',
        message: `Mediator ${selectedMediator.first_name} ${selectedMediator.last_name} has been assigned to this dispute.`,
        is_internal: false
      });

      return true;
    } catch (error) {
      console.error('Error assigning mediator:', error);
      return false;
    }
  }

  /**
   * Create a dispute resolution
   */
  async createResolution(disputeId: string, resolutionData: Omit<DisputeResolution, 'id' | 'dispute_id' | 'resolved_at'>): Promise<DisputeResolution | null> {
    try {
      const { data: resolution, error } = await supabase
        .from('dispute_resolutions')
        .insert({
          dispute_id: disputeId,
          ...resolutionData,
          resolved_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Update dispute status
      await supabase
        .from('disputes')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolution: resolution,
          updated_at: new Date().toISOString()
        })
        .eq('id', disputeId);

      return resolution;
    } catch (error) {
      console.error('Error creating resolution:', error);
      return null;
    }
  }

  /**
   * Execute the dispute resolution (process refunds, release payments, etc.)
   */
  async executeResolution(disputeId: string): Promise<boolean> {
    try {
      const { data: dispute } = await supabase
        .from('disputes')
        .select('*, dispute_resolutions(*)')
        .eq('id', disputeId)
        .single();

      if (!dispute || !dispute.dispute_resolutions) {
        return false;
      }

      const resolution = dispute.dispute_resolutions;

      // Process refund if applicable
      if (resolution.refund_amount && resolution.refund_amount > 0) {
        if (dispute.escrow_account_id) {
          await escrowService.refundEscrow(
            dispute.escrow_account_id,
            resolution.refund_amount,
            `Dispute resolution: ${resolution.resolution_details}`
          );
        }
      }

      // Release payment if applicable
      if (resolution.payment_release_amount && resolution.payment_release_amount > 0) {
        // Find the milestone or create a completion milestone
        const { data: milestones } = await supabase
          .from('project_milestones')
          .select('*')
          .eq('booking_id', dispute.booking_id)
          .eq('status', 'completed')
          .limit(1);

        if (milestones && milestones.length > 0) {
          await escrowService.releaseMilestonePayment(
            milestones[0].id,
            resolution.resolved_by
          );
        }
      }

      // Update booking status if needed
      if (resolution.resolution_type === 'redo_work') {
        await supabase
          .from('bookings')
          .update({ status: 'in_progress' })
          .eq('id', dispute.booking_id);
      } else if (resolution.resolution_type === 'full_refund') {
        await supabase
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('id', dispute.booking_id);
      } else {
        await supabase
          .from('bookings')
          .update({ status: 'completed' })
          .eq('id', dispute.booking_id);
      }

      // Send resolution notifications
      await this.sendDisputeNotifications(disputeId, 'resolved');

      return true;
    } catch (error) {
      console.error('Error executing resolution:', error);
      return false;
    }
  }

  /**
   * Get dispute details with all related data
   */
  async getDisputeDetails(disputeId: string): Promise<{
    dispute: Dispute | null;
    messages: DisputeMessage[];
    evidence: DisputeEvidence[];
    resolution: DisputeResolution | null;
  }> {
    try {
      // Get dispute
      const { data: dispute } = await supabase
        .from('disputes')
        .select(`
          *,
          bookings (
            id,
            title,
            description,
            status,
            estimated_cost,
            final_cost
          ),
          users!disputes_customer_id_fkey (
            id,
            first_name,
            last_name,
            email
          ),
          contractor_users:users!disputes_contractor_id_fkey (
            id,
            first_name,
            last_name,
            email
          ),
          mediator:users!disputes_mediator_id_fkey (
            id,
            first_name,
            last_name
          )
        `)
        .eq('id', disputeId)
        .single();

      // Get messages
      const { data: messages } = await supabase
        .from('dispute_messages')
        .select(`
          *,
          sender:users (
            id,
            first_name,
            last_name
          )
        `)
        .eq('dispute_id', disputeId)
        .order('created_at');

      // Get evidence
      const { data: evidence } = await supabase
        .from('dispute_evidence')
        .select(`
          *,
          submitter:users (
            id,
            first_name,
            last_name
          )
        `)
        .eq('dispute_id', disputeId)
        .order('submitted_at');

      // Get resolution
      const { data: resolution } = await supabase
        .from('dispute_resolutions')
        .select('*')
        .eq('dispute_id', disputeId)
        .single();

      return {
        dispute,
        messages: messages || [],
        evidence: evidence || [],
        resolution
      };
    } catch (error) {
      console.error('Error getting dispute details:', error);
      return {
        dispute: null,
        messages: [],
        evidence: [],
        resolution: null
      };
    }
  }

  /**
   * Get all disputes for a user
   */
  async getUserDisputes(userId: string, userType: 'customer' | 'contractor'): Promise<Dispute[]> {
    try {
      const column = userType === 'customer' ? 'customer_id' : 'contractor_id';
      
      const { data: disputes } = await supabase
        .from('disputes')
        .select(`
          *,
          bookings (
            id,
            title,
            status
          )
        `)
        .eq(column, userId)
        .order('created_at', { ascending: false });

      return disputes || [];
    } catch (error) {
      console.error('Error getting user disputes:', error);
      return [];
    }
  }

  /**
   * Calculate dispute priority
   */
  private calculateDisputePriority(amount: number, type: Dispute['type']): Dispute['priority'] {
    // High-value disputes get higher priority
    if (amount > 5000) return 'urgent';
    if (amount > 2000) return 'high';
    
    // Payment disputes get higher priority
    if (type === 'payment') return 'high';
    
    // Quality and timeline disputes are medium priority
    if (type === 'quality' || type === 'timeline') return 'medium';
    
    return 'low';
  }

  /**
   * Analyze dispute for automatic resolution
   */
  private analyzeForAutoResolution(dispute: any): {
    canResolve: boolean;
    resolution_type?: DisputeResolution['resolution_type'];
    refund_amount?: number;
    payment_release_amount?: number;
    details: string;
  } {
    // Simple auto-resolution rules
    
    // If it's a small amount cancellation within 24 hours
    if (dispute.type === 'cancellation' && 
        dispute.amount_disputed < 500 &&
        this.isWithin24Hours(dispute.created_at)) {
      return {
        canResolve: true,
        resolution_type: 'full_refund',
        refund_amount: dispute.amount_disputed,
        details: 'Automatic full refund for cancellation within 24 hours of small amount booking'
      };
    }

    // If contractor has very low ratings and it's a quality dispute
    if (dispute.type === 'quality' && 
        dispute.bookings?.reviews?.length > 0) {
      const avgRating = dispute.bookings.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / dispute.bookings.reviews.length;
      
      if (avgRating < 2.5) {
        return {
          canResolve: true,
          resolution_type: 'partial_refund',
          refund_amount: dispute.amount_disputed * 0.5,
          details: 'Automatic partial refund due to consistently poor contractor ratings'
        };
      }
    }

    // Default: requires human mediation
    return {
      canResolve: false,
      details: 'Dispute requires human mediation for fair resolution'
    };
  }

  /**
   * Check if timestamp is within 24 hours
   */
  private isWithin24Hours(timestamp: string): boolean {
    const now = new Date();
    const disputeTime = new Date(timestamp);
    const diffHours = (now.getTime() - disputeTime.getTime()) / (1000 * 60 * 60);
    return diffHours <= 24;
  }

  /**
   * Send notifications about dispute status changes
   */
  private async sendDisputeNotifications(disputeId: string, event: 'created' | 'escalated' | 'resolved'): Promise<void> {
    try {
      const { data: dispute } = await supabase
        .from('disputes')
        .select(`
          *,
          customer:users!disputes_customer_id_fkey (email, first_name),
          contractor:users!disputes_contractor_id_fkey (email, first_name),
          mediator:users!disputes_mediator_id_fkey (email, first_name)
        `)
        .eq('id', disputeId)
        .single();

      if (!dispute) return;

      // Create notifications
      const notifications = [];

      switch (event) {
        case 'created':
          notifications.push({
            user_id: dispute.customer_id,
            type: 'dispute_created',
            title: 'Dispute Created',
            content: `Your dispute "${dispute.title}" has been created and is being reviewed.`,
            data: { dispute_id: disputeId }
          });
          
          notifications.push({
            user_id: dispute.contractor_id,
            type: 'dispute_created',
            title: 'Dispute Filed Against You',
            content: `A dispute has been filed regarding your work: "${dispute.title}"`,
            data: { dispute_id: disputeId }
          });
          break;

        case 'escalated':
          notifications.push({
            user_id: dispute.customer_id,
            type: 'dispute_escalated',
            title: 'Dispute Escalated to Mediation',
            content: `Your dispute "${dispute.title}" has been assigned to a mediator.`,
            data: { dispute_id: disputeId }
          });
          
          notifications.push({
            user_id: dispute.contractor_id,
            type: 'dispute_escalated',
            title: 'Dispute Escalated to Mediation',
            content: `The dispute "${dispute.title}" has been assigned to a mediator.`,
            data: { dispute_id: disputeId }
          });
          break;

        case 'resolved':
          notifications.push({
            user_id: dispute.customer_id,
            type: 'dispute_resolved',
            title: 'Dispute Resolved',
            content: `Your dispute "${dispute.title}" has been resolved.`,
            data: { dispute_id: disputeId }
          });
          
          notifications.push({
            user_id: dispute.contractor_id,
            type: 'dispute_resolved',
            title: 'Dispute Resolved',
            content: `The dispute "${dispute.title}" has been resolved.`,
            data: { dispute_id: disputeId }
          });
          break;
      }

      // Insert notifications
      if (notifications.length > 0) {
        await supabase
          .from('notifications')
          .insert(notifications);
      }

      // TODO: Send email notifications
      // await this.sendEmailNotifications(dispute, event);

    } catch (error) {
      console.error('Error sending dispute notifications:', error);
    }
  }

  /**
   * Get dispute statistics for admin dashboard
   */
  async getDisputeStatistics(): Promise<{
    total_disputes: number;
    open_disputes: number;
    resolved_disputes: number;
    average_resolution_time_hours: number;
    resolution_types: Record<string, number>;
    dispute_types: Record<string, number>;
  }> {
    try {
      // Get total counts
      const { data: totalDisputes } = await supabase
        .from('disputes')
        .select('id');

      const { data: openDisputes } = await supabase
        .from('disputes')
        .select('id')
        .in('status', ['open', 'in_mediation', 'escalated']);

      const { data: resolvedDisputes } = await supabase
        .from('disputes')
        .select('created_at, resolved_at')
        .eq('status', 'resolved')
        .not('resolved_at', 'is', null);

      // Calculate average resolution time
      let avgResolutionTime = 0;
      if (resolvedDisputes && resolvedDisputes.length > 0) {
        const totalResolutionTime = resolvedDisputes.reduce((sum, dispute) => {
          const created = new Date(dispute.created_at);
          const resolved = new Date(dispute.resolved_at);
          return sum + (resolved.getTime() - created.getTime());
        }, 0);
        avgResolutionTime = totalResolutionTime / resolvedDisputes.length / (1000 * 60 * 60); // Convert to hours
      }

      // Get resolution types
      const { data: resolutions } = await supabase
        .from('dispute_resolutions')
        .select('resolution_type');

      const resolutionTypes: Record<string, number> = {};
      resolutions?.forEach(r => {
        resolutionTypes[r.resolution_type] = (resolutionTypes[r.resolution_type] || 0) + 1;
      });

      // Get dispute types
      const { data: allDisputes } = await supabase
        .from('disputes')
        .select('type');

      const disputeTypes: Record<string, number> = {};
      allDisputes?.forEach(d => {
        disputeTypes[d.type] = (disputeTypes[d.type] || 0) + 1;
      });

      return {
        total_disputes: totalDisputes?.length || 0,
        open_disputes: openDisputes?.length || 0,
        resolved_disputes: resolvedDisputes?.length || 0,
        average_resolution_time_hours: avgResolutionTime,
        resolution_types: resolutionTypes,
        dispute_types: disputeTypes
      };
    } catch (error) {
      console.error('Error getting dispute statistics:', error);
      return {
        total_disputes: 0,
        open_disputes: 0,
        resolved_disputes: 0,
        average_resolution_time_hours: 0,
        resolution_types: {},
        dispute_types: {}
      };
    }
  }
}

// Export the main service instance
export const disputeResolutionService = new DisputeResolutionService();