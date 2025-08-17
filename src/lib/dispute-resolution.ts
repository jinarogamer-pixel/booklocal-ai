import { supabase } from './supabase';
import { EscrowService } from './escrow';

// Types
export interface Dispute {
  id: string;
  booking_id: string;
  escrow_id?: string;
  customer_id: string;
  contractor_id: string;
  dispute_type: 'quality' | 'completion' | 'payment' | 'cancellation' | 'safety' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'investigating' | 'mediation' | 'escalated' | 'resolved' | 'closed';
  amount_disputed: number;
  title: string;
  description: string;
  evidence: DisputeEvidence[];
  timeline: DisputeTimelineEvent[];
  resolution?: DisputeResolution;
  assigned_mediator?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  metadata: Record<string, any>;
}

export interface DisputeEvidence {
  id: string;
  dispute_id: string;
  submitted_by: string;
  evidence_type: 'photo' | 'video' | 'document' | 'message' | 'receipt' | 'other';
  title: string;
  description?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  submitted_at: string;
  verified: boolean;
  metadata: Record<string, any>;
}

export interface DisputeTimelineEvent {
  id: string;
  dispute_id: string;
  event_type: 'created' | 'evidence_added' | 'status_changed' | 'message_sent' | 'resolution_proposed' | 'resolved';
  title: string;
  description: string;
  actor_id: string;
  actor_type: 'customer' | 'contractor' | 'mediator' | 'admin' | 'system';
  created_at: string;
  metadata: Record<string, any>;
}

export interface DisputeResolution {
  id: string;
  dispute_id: string;
  resolution_type: 'full_refund' | 'partial_refund' | 'no_refund' | 'redo_work' | 'compensation' | 'mediated_agreement';
  refund_amount?: number;
  compensation_amount?: number;
  resolution_summary: string;
  terms: string[];
  agreed_by_customer: boolean;
  agreed_by_contractor: boolean;
  customer_agreed_at?: string;
  contractor_agreed_at?: string;
  enforced_by_admin: boolean;
  resolved_by: string;
  resolved_at: string;
  implementation_status: 'pending' | 'in_progress' | 'completed' | 'failed';
  implementation_notes?: string;
  metadata: Record<string, any>;
}

export interface DisputeMessage {
  id: string;
  dispute_id: string;
  sender_id: string;
  sender_type: 'customer' | 'contractor' | 'mediator' | 'admin';
  message: string;
  is_internal: boolean; // Only visible to mediators/admins
  attachments: string[];
  created_at: string;
  read_by: string[]; // Array of user IDs who have read this message
}

export class DisputeResolutionService {
  /**
   * Create a new dispute
   */
  static async createDispute(params: {
    bookingId: string;
    customerId: string;
    contractorId: string;
    disputeType: Dispute['dispute_type'];
    title: string;
    description: string;
    amountDisputed: number;
    evidence?: Array<{
      evidenceType: DisputeEvidence['evidence_type'];
      title: string;
      description?: string;
      fileUrl?: string;
      fileName?: string;
    }>;
  }): Promise<{ success: boolean; dispute?: Dispute; error?: string }> {
    try {
      // Check if there's already an open dispute for this booking
      const { data: existingDispute } = await supabase
        .from('disputes')
        .select('id, status')
        .eq('booking_id', params.bookingId)
        .in('status', ['open', 'investigating', 'mediation', 'escalated'])
        .single();

      if (existingDispute) {
        return { success: false, error: 'A dispute is already open for this booking' };
      }

      // Get booking details
      const { data: booking } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', params.bookingId)
        .single();

      if (!booking) {
        return { success: false, error: 'Booking not found' };
      }

      // Determine priority based on amount and type
      const priority = this.calculatePriority(params.amountDisputed, params.disputeType);

      // Create dispute
      const { data: dispute, error: disputeError } = await supabase
        .from('disputes')
        .insert({
          booking_id: params.bookingId,
          customer_id: params.customerId,
          contractor_id: params.contractorId,
          dispute_type: params.disputeType,
          priority,
          status: 'open',
          amount_disputed: params.amountDisputed,
          title: params.title,
          description: params.description,
          evidence: [],
          timeline: [],
          created_by: params.customerId,
          metadata: {
            booking_amount: booking.estimated_cost || 0,
            booking_status: booking.status
          }
        })
        .select()
        .single();

      if (disputeError) throw disputeError;

      // Add initial timeline event
      await this.addTimelineEvent({
        disputeId: dispute.id,
        eventType: 'created',
        title: 'Dispute Created',
        description: `Dispute created by customer: ${params.title}`,
        actorId: params.customerId,
        actorType: 'customer',
        metadata: { dispute_type: params.disputeType, amount: params.amountDisputed }
      });

      // Add evidence if provided
      if (params.evidence && params.evidence.length > 0) {
        for (const evidence of params.evidence) {
          await this.addEvidence({
            disputeId: dispute.id,
            submittedBy: params.customerId,
            evidenceType: evidence.evidenceType,
            title: evidence.title,
            description: evidence.description,
            fileUrl: evidence.fileUrl,
            fileName: evidence.fileName
          });
        }
      }

      // Freeze escrow if exists
      const { data: escrow } = await supabase
        .from('escrow_accounts')
        .select('id')
        .eq('booking_id', params.bookingId)
        .single();

      if (escrow) {
        await EscrowService.disputeEscrow({
          escrowId: escrow.id,
          disputedBy: params.customerId,
          reason: params.title,
          description: params.description
        });

        // Update dispute with escrow ID
        await supabase
          .from('disputes')
          .update({ escrow_id: escrow.id })
          .eq('id', dispute.id);
      }

      // Notify all parties
      await this.notifyDisputeParties(dispute.id, 'created');

      // Auto-assign mediator if high priority
      if (priority === 'high' || priority === 'urgent') {
        await this.assignMediator(dispute.id);
      }

      return { success: true, dispute };
    } catch (error) {
      console.error('Error creating dispute:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add evidence to a dispute
   */
  static async addEvidence(params: {
    disputeId: string;
    submittedBy: string;
    evidenceType: DisputeEvidence['evidence_type'];
    title: string;
    description?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
  }): Promise<{ success: boolean; evidence?: DisputeEvidence; error?: string }> {
    try {
      const { data: evidence, error } = await supabase
        .from('dispute_evidence')
        .insert({
          dispute_id: params.disputeId,
          submitted_by: params.submittedBy,
          evidence_type: params.evidenceType,
          title: params.title,
          description: params.description,
          file_url: params.fileUrl,
          file_name: params.fileName,
          file_size: params.fileSize,
          verified: false,
          metadata: {}
        })
        .select()
        .single();

      if (error) throw error;

      // Add timeline event
      await this.addTimelineEvent({
        disputeId: params.disputeId,
        eventType: 'evidence_added',
        title: 'Evidence Added',
        description: `New evidence submitted: ${params.title}`,
        actorId: params.submittedBy,
        actorType: await this.getUserType(params.submittedBy),
        metadata: { evidence_type: params.evidenceType, evidence_id: evidence.id }
      });

      // Notify other parties
      await this.notifyDisputeParties(params.disputeId, 'evidence_added', params.submittedBy);

      return { success: true, evidence };
    } catch (error) {
      console.error('Error adding evidence:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send a message in a dispute
   */
  static async sendMessage(params: {
    disputeId: string;
    senderId: string;
    message: string;
    isInternal?: boolean;
    attachments?: string[];
  }): Promise<{ success: boolean; message?: DisputeMessage; error?: string }> {
    try {
      const senderType = await this.getUserType(params.senderId);
      
      const { data: message, error } = await supabase
        .from('dispute_messages')
        .insert({
          dispute_id: params.disputeId,
          sender_id: params.senderId,
          sender_type: senderType,
          message: params.message,
          is_internal: params.isInternal || false,
          attachments: params.attachments || [],
          read_by: [params.senderId] // Sender has read it
        })
        .select()
        .single();

      if (error) throw error;

      // Add timeline event
      await this.addTimelineEvent({
        disputeId: params.disputeId,
        eventType: 'message_sent',
        title: 'Message Sent',
        description: `Message from ${senderType}: ${params.message.substring(0, 100)}${params.message.length > 100 ? '...' : ''}`,
        actorId: params.senderId,
        actorType: senderType,
        metadata: { message_id: message.id, is_internal: params.isInternal }
      });

      // Notify other parties (unless internal)
      if (!params.isInternal) {
        await this.notifyDisputeParties(params.disputeId, 'message_sent', params.senderId);
      }

      return { success: true, message };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update dispute status
   */
  static async updateDisputeStatus(params: {
    disputeId: string;
    newStatus: Dispute['status'];
    updatedBy: string;
    notes?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current dispute
      const { data: dispute } = await supabase
        .from('disputes')
        .select('status, assigned_mediator')
        .eq('id', params.disputeId)
        .single();

      if (!dispute) {
        return { success: false, error: 'Dispute not found' };
      }

      // Validate status transition
      const validTransition = this.isValidStatusTransition(dispute.status, params.newStatus);
      if (!validTransition) {
        return { success: false, error: `Invalid status transition from ${dispute.status} to ${params.newStatus}` };
      }

      // Update dispute
      const updates: any = {
        status: params.newStatus,
        updated_at: new Date().toISOString()
      };

      // Auto-assign mediator if moving to mediation
      if (params.newStatus === 'mediation' && !dispute.assigned_mediator) {
        const mediator = await this.assignMediator(params.disputeId);
        if (mediator) {
          updates.assigned_mediator = mediator.id;
        }
      }

      // Set resolved_at if resolving
      if (params.newStatus === 'resolved' || params.newStatus === 'closed') {
        updates.resolved_at = new Date().toISOString();
      }

      await supabase
        .from('disputes')
        .update(updates)
        .eq('id', params.disputeId);

      // Add timeline event
      await this.addTimelineEvent({
        disputeId: params.disputeId,
        eventType: 'status_changed',
        title: `Status Changed to ${params.newStatus}`,
        description: params.notes || `Dispute status updated to ${params.newStatus}`,
        actorId: params.updatedBy,
        actorType: await this.getUserType(params.updatedBy),
        metadata: { old_status: dispute.status, new_status: params.newStatus }
      });

      // Notify parties
      await this.notifyDisputeParties(params.disputeId, 'status_changed');

      return { success: true };
    } catch (error) {
      console.error('Error updating dispute status:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Propose a resolution
   */
  static async proposeResolution(params: {
    disputeId: string;
    proposedBy: string;
    resolutionType: DisputeResolution['resolution_type'];
    refundAmount?: number;
    compensationAmount?: number;
    resolutionSummary: string;
    terms: string[];
  }): Promise<{ success: boolean; resolution?: DisputeResolution; error?: string }> {
    try {
      // Check if dispute is in a state that allows resolution proposals
      const { data: dispute } = await supabase
        .from('disputes')
        .select('status, amount_disputed, customer_id, contractor_id')
        .eq('id', params.disputeId)
        .single();

      if (!dispute) {
        return { success: false, error: 'Dispute not found' };
      }

      if (!['investigating', 'mediation', 'escalated'].includes(dispute.status)) {
        return { success: false, error: 'Dispute is not in a state that allows resolution proposals' };
      }

      // Validate resolution amounts
      if (params.refundAmount && params.refundAmount > dispute.amount_disputed) {
        return { success: false, error: 'Refund amount cannot exceed disputed amount' };
      }

      // Create resolution proposal
      const { data: resolution, error } = await supabase
        .from('dispute_resolutions')
        .insert({
          dispute_id: params.disputeId,
          resolution_type: params.resolutionType,
          refund_amount: params.refundAmount,
          compensation_amount: params.compensationAmount,
          resolution_summary: params.resolutionSummary,
          terms: params.terms,
          agreed_by_customer: false,
          agreed_by_contractor: false,
          enforced_by_admin: false,
          resolved_by: params.proposedBy,
          resolved_at: new Date().toISOString(),
          implementation_status: 'pending',
          metadata: {}
        })
        .select()
        .single();

      if (error) throw error;

      // Update dispute with resolution
      await supabase
        .from('disputes')
        .update({ resolution: resolution.id })
        .eq('id', params.disputeId);

      // Add timeline event
      await this.addTimelineEvent({
        disputeId: params.disputeId,
        eventType: 'resolution_proposed',
        title: 'Resolution Proposed',
        description: `${params.resolutionType} resolution proposed: ${params.resolutionSummary}`,
        actorId: params.proposedBy,
        actorType: await this.getUserType(params.proposedBy),
        metadata: { 
          resolution_type: params.resolutionType,
          refund_amount: params.refundAmount,
          compensation_amount: params.compensationAmount
        }
      });

      // Notify parties to review resolution
      await this.notifyDisputeParties(params.disputeId, 'resolution_proposed');

      return { success: true, resolution };
    } catch (error) {
      console.error('Error proposing resolution:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Accept or reject a resolution proposal
   */
  static async respondToResolution(params: {
    disputeId: string;
    resolutionId: string;
    userId: string;
    accepted: boolean;
    notes?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      // Get dispute and resolution details
      const { data: dispute } = await supabase
        .from('disputes')
        .select('customer_id, contractor_id')
        .eq('id', params.disputeId)
        .single();

      if (!dispute) {
        return { success: false, error: 'Dispute not found' };
      }

      // Determine user role
      const isCustomer = params.userId === dispute.customer_id;
      const isContractor = params.userId === dispute.contractor_id;

      if (!isCustomer && !isContractor) {
        return { success: false, error: 'User is not a party to this dispute' };
      }

      // Update resolution
      const updates: any = {};
      if (isCustomer) {
        updates.agreed_by_customer = params.accepted;
        if (params.accepted) updates.customer_agreed_at = new Date().toISOString();
      }
      if (isContractor) {
        updates.agreed_by_contractor = params.accepted;
        if (params.accepted) updates.contractor_agreed_at = new Date().toISOString();
      }

      const { data: resolution, error } = await supabase
        .from('dispute_resolutions')
        .update(updates)
        .eq('id', params.resolutionId)
        .select()
        .single();

      if (error) throw error;

      // Add timeline event
      const action = params.accepted ? 'accepted' : 'rejected';
      const userType = isCustomer ? 'customer' : 'contractor';
      
      await this.addTimelineEvent({
        disputeId: params.disputeId,
        eventType: 'resolution_proposed', // We can add more specific event types
        title: `Resolution ${action}`,
        description: `Resolution ${action} by ${userType}${params.notes ? `: ${params.notes}` : ''}`,
        actorId: params.userId,
        actorType: userType,
        metadata: { 
          resolution_id: params.resolutionId,
          action,
          notes: params.notes
        }
      });

      // Check if both parties have agreed
      if (resolution.agreed_by_customer && resolution.agreed_by_contractor) {
        await this.implementResolution(params.disputeId, params.resolutionId);
      } else if (!params.accepted) {
        // If rejected, escalate or request new proposal
        await this.updateDisputeStatus({
          disputeId: params.disputeId,
          newStatus: 'escalated',
          updatedBy: 'system',
          notes: `Resolution rejected by ${userType}`
        });
      }

      // Notify other party
      await this.notifyDisputeParties(params.disputeId, 'resolution_response', params.userId);

      return { success: true };
    } catch (error) {
      console.error('Error responding to resolution:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Implement an agreed resolution
   */
  private static async implementResolution(disputeId: string, resolutionId: string): Promise<void> {
    try {
      const { data: resolution } = await supabase
        .from('dispute_resolutions')
        .select('*')
        .eq('id', resolutionId)
        .single();

      if (!resolution) return;

      const { data: dispute } = await supabase
        .from('disputes')
        .select('escrow_id, booking_id')
        .eq('id', disputeId)
        .single();

      if (!dispute) return;

      // Update implementation status
      await supabase
        .from('dispute_resolutions')
        .update({ implementation_status: 'in_progress' })
        .eq('id', resolutionId);

      let implementationSuccess = true;
      const implementationNotes: string[] = [];

      // Handle refunds
      if (resolution.refund_amount && resolution.refund_amount > 0) {
        if (dispute.escrow_id) {
          const refundResult = await EscrowService.refundEscrow({
            escrowId: dispute.escrow_id,
            amount: resolution.refund_amount,
            reason: 'Dispute resolution refund',
            refundedBy: resolution.resolved_by
          });

          if (refundResult.success) {
            implementationNotes.push(`Refunded $${resolution.refund_amount} to customer`);
          } else {
            implementationSuccess = false;
            implementationNotes.push(`Failed to refund: ${refundResult.error}`);
          }
        } else {
          // Handle refund without escrow (direct payment processor refund)
          implementationNotes.push(`Manual refund required: $${resolution.refund_amount}`);
        }
      }

      // Handle compensation
      if (resolution.compensation_amount && resolution.compensation_amount > 0) {
        // This would typically involve creating a separate payment to the customer
        implementationNotes.push(`Compensation payment required: $${resolution.compensation_amount}`);
      }

      // Update booking status if needed
      if (resolution.resolution_type === 'redo_work') {
        await supabase
          .from('bookings')
          .update({ status: 'in_progress' })
          .eq('id', dispute.booking_id);
        implementationNotes.push('Booking reset for redo work');
      }

      // Update resolution implementation status
      await supabase
        .from('dispute_resolutions')
        .update({
          implementation_status: implementationSuccess ? 'completed' : 'failed',
          implementation_notes: implementationNotes.join('; ')
        })
        .eq('id', resolutionId);

      // Update dispute status
      if (implementationSuccess) {
        await this.updateDisputeStatus({
          disputeId,
          newStatus: 'resolved',
          updatedBy: 'system',
          notes: 'Resolution successfully implemented'
        });
      } else {
        await this.updateDisputeStatus({
          disputeId,
          newStatus: 'escalated',
          updatedBy: 'system',
          notes: 'Resolution implementation failed - manual intervention required'
        });
      }

      // Add timeline event
      await this.addTimelineEvent({
        disputeId,
        eventType: 'resolved',
        title: implementationSuccess ? 'Resolution Implemented' : 'Resolution Implementation Failed',
        description: implementationNotes.join('; '),
        actorId: 'system',
        actorType: 'system',
        metadata: { 
          resolution_id: resolutionId,
          implementation_status: implementationSuccess ? 'completed' : 'failed'
        }
      });

    } catch (error) {
      console.error('Error implementing resolution:', error);
      
      // Mark implementation as failed
      await supabase
        .from('dispute_resolutions')
        .update({
          implementation_status: 'failed',
          implementation_notes: `Implementation error: ${error.message}`
        })
        .eq('id', resolutionId);
    }
  }

  /**
   * Get dispute with all related data
   */
  static async getDispute(disputeId: string): Promise<{
    success: boolean;
    dispute?: Dispute & {
      evidence: DisputeEvidence[];
      timeline: DisputeTimelineEvent[];
      messages: DisputeMessage[];
      resolution?: DisputeResolution;
    };
    error?: string;
  }> {
    try {
      const { data: dispute, error: disputeError } = await supabase
        .from('disputes')
        .select(`
          *,
          evidence:dispute_evidence(*),
          timeline:dispute_timeline(*),
          messages:dispute_messages(*),
          resolution:dispute_resolutions(*)
        `)
        .eq('id', disputeId)
        .single();

      if (disputeError) throw disputeError;

      return { success: true, dispute };
    } catch (error) {
      console.error('Error getting dispute:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get disputes for a user
   */
  static async getUserDisputes(userId: string, userType: 'customer' | 'contractor'): Promise<{
    success: boolean;
    disputes?: Dispute[];
    error?: string;
  }> {
    try {
      const column = userType === 'customer' ? 'customer_id' : 'contractor_id';
      
      const { data: disputes, error } = await supabase
        .from('disputes')
        .select('*')
        .eq(column, userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, disputes };
    } catch (error) {
      console.error('Error getting user disputes:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Assign a mediator to a dispute
   */
  private static async assignMediator(disputeId: string): Promise<{ id: string; name: string } | null> {
    try {
      // Get available mediators (this would be more sophisticated in production)
      const { data: mediators } = await supabase
        .from('users')
        .select('id, first_name, last_name')
        .eq('user_type', 'admin') // Assuming admins can mediate
        .eq('status', 'active')
        .limit(1);

      if (!mediators || mediators.length === 0) {
        return null;
      }

      const mediator = mediators[0];

      // Assign mediator
      await supabase
        .from('disputes')
        .update({ assigned_mediator: mediator.id })
        .eq('id', disputeId);

      // Add timeline event
      await this.addTimelineEvent({
        disputeId,
        eventType: 'status_changed',
        title: 'Mediator Assigned',
        description: `${mediator.first_name} ${mediator.last_name} assigned as mediator`,
        actorId: 'system',
        actorType: 'system',
        metadata: { mediator_id: mediator.id }
      });

      return {
        id: mediator.id,
        name: `${mediator.first_name} ${mediator.last_name}`
      };
    } catch (error) {
      console.error('Error assigning mediator:', error);
      return null;
    }
  }

  /**
   * Add timeline event
   */
  private static async addTimelineEvent(params: {
    disputeId: string;
    eventType: DisputeTimelineEvent['event_type'];
    title: string;
    description: string;
    actorId: string;
    actorType: DisputeTimelineEvent['actor_type'];
    metadata: Record<string, any>;
  }): Promise<void> {
    try {
      await supabase
        .from('dispute_timeline')
        .insert({
          dispute_id: params.disputeId,
          event_type: params.eventType,
          title: params.title,
          description: params.description,
          actor_id: params.actorId,
          actor_type: params.actorType,
          metadata: params.metadata
        });
    } catch (error) {
      console.error('Error adding timeline event:', error);
    }
  }

  /**
   * Notify dispute parties
   */
  private static async notifyDisputeParties(
    disputeId: string, 
    eventType: string, 
    excludeUserId?: string
  ): Promise<void> {
    try {
      // Get dispute details
      const { data: dispute } = await supabase
        .from('disputes')
        .select('customer_id, contractor_id, assigned_mediator, title')
        .eq('id', disputeId)
        .single();

      if (!dispute) return;

      // Collect recipients
      const recipients = [dispute.customer_id, dispute.contractor_id];
      if (dispute.assigned_mediator) {
        recipients.push(dispute.assigned_mediator);
      }

      // Remove excluded user
      const filteredRecipients = recipients.filter(id => id !== excludeUserId);

      // Create notifications
      const notifications = filteredRecipients.map(userId => ({
        user_id: userId,
        type: `dispute_${eventType}`,
        title: `Dispute Update: ${dispute.title}`,
        content: this.getNotificationContent(eventType),
        data: {
          dispute_id: disputeId,
          event_type: eventType
        }
      }));

      if (notifications.length > 0) {
        await supabase
          .from('notifications')
          .insert(notifications);
      }

      // TODO: Send email/SMS notifications
      // await sendEmailNotifications(notifications);
      // await sendSMSNotifications(notifications);

    } catch (error) {
      console.error('Error notifying dispute parties:', error);
    }
  }

  /**
   * Utility functions
   */
  private static calculatePriority(amount: number, disputeType: Dispute['dispute_type']): Dispute['priority'] {
    // High priority for safety issues or large amounts
    if (disputeType === 'safety' || amount > 5000) {
      return 'urgent';
    }
    if (amount > 2000 || disputeType === 'quality') {
      return 'high';
    }
    if (amount > 500) {
      return 'medium';
    }
    return 'low';
  }

  private static isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
    const validTransitions: Record<string, string[]> = {
      'open': ['investigating', 'closed'],
      'investigating': ['mediation', 'resolved', 'escalated', 'closed'],
      'mediation': ['resolved', 'escalated', 'closed'],
      'escalated': ['resolved', 'closed'],
      'resolved': ['closed'],
      'closed': [] // Final state
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  private static async getUserType(userId: string): Promise<DisputeTimelineEvent['actor_type']> {
    try {
      if (userId === 'system') return 'system';

      const { data: user } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', userId)
        .single();

      if (user?.user_type === 'admin') return 'admin';
      if (user?.user_type === 'contractor') return 'contractor';
      return 'customer';
    } catch (error) {
      return 'customer'; // Default fallback
    }
  }

  private static getNotificationContent(eventType: string): string {
    const messages = {
      'created': 'A new dispute has been created',
      'evidence_added': 'New evidence has been added to the dispute',
      'message_sent': 'A new message has been posted in the dispute',
      'status_changed': 'The dispute status has been updated',
      'resolution_proposed': 'A resolution has been proposed for the dispute',
      'resolution_response': 'A party has responded to the resolution proposal'
    };

    return messages[eventType] || 'There has been an update to your dispute';
  }

  /**
   * Get dispute statistics for admin dashboard
   */
  static async getDisputeStats(): Promise<{
    success: boolean;
    stats?: {
      total_disputes: number;
      open_disputes: number;
      resolved_disputes: number;
      average_resolution_time_hours: number;
      disputes_by_type: Record<string, number>;
      disputes_by_status: Record<string, number>;
    };
    error?: string;
  }> {
    try {
      const { data: disputes, error } = await supabase
        .from('disputes')
        .select('dispute_type, status, created_at, resolved_at');

      if (error) throw error;

      const stats = {
        total_disputes: disputes.length,
        open_disputes: disputes.filter(d => ['open', 'investigating', 'mediation', 'escalated'].includes(d.status)).length,
        resolved_disputes: disputes.filter(d => d.status === 'resolved').length,
        average_resolution_time_hours: 0,
        disputes_by_type: {} as Record<string, number>,
        disputes_by_status: {} as Record<string, number>
      };

      // Calculate average resolution time
      const resolvedDisputes = disputes.filter(d => d.resolved_at);
      if (resolvedDisputes.length > 0) {
        const totalResolutionTime = resolvedDisputes.reduce((sum, dispute) => {
          const created = new Date(dispute.created_at).getTime();
          const resolved = new Date(dispute.resolved_at).getTime();
          return sum + (resolved - created);
        }, 0);
        
        stats.average_resolution_time_hours = totalResolutionTime / (resolvedDisputes.length * 1000 * 60 * 60);
      }

      // Group by type and status
      disputes.forEach(dispute => {
        stats.disputes_by_type[dispute.dispute_type] = (stats.disputes_by_type[dispute.dispute_type] || 0) + 1;
        stats.disputes_by_status[dispute.status] = (stats.disputes_by_status[dispute.status] || 0) + 1;
      });

      return { success: true, stats };
    } catch (error) {
      console.error('Error getting dispute stats:', error);
      return { success: false, error: error.message };
    }
  }
}

export default DisputeResolutionService;