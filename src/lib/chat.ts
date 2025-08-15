// Real-time chat system with WebSocket support
import { createClient } from '@supabase/supabase-js';

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_type: 'client' | 'provider';
  message: string;
  message_type: 'text' | 'image' | 'file';
  created_at: string;
  read_at?: string;
}

export interface Conversation {
  id: string;
  client_id: string;
  provider_id: string;
  booking_id?: string;
  status: 'active' | 'archived' | 'closed';
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Create a new conversation between client and provider
 */
export async function createConversation(
  clientId: string,
  providerId: string,
  bookingId?: string
): Promise<Conversation> {
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      client_id: clientId,
      provider_id: providerId,
      booking_id: bookingId,
      status: 'active',
      unread_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  senderType: 'client' | 'provider',
  message: string,
  messageType: 'text' | 'image' | 'file' = 'text'
): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      sender_name: senderName,
      sender_type: senderType,
      message,
      message_type: messageType,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  // Update conversation's last message
  await supabase
    .from('conversations')
    .update({
      last_message: message,
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId);

  return data;
}

/**
 * Get messages for a conversation
 */
export async function getMessages(
  conversationId: string,
  limit: number = 50,
  before?: string
): Promise<ChatMessage[]> {
  let query = supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (before) {
    query = query.lt('created_at', before);
  }

  const { data, error } = await query;
  if (error) throw error;
  
  return (data || []).reverse(); // Reverse to show oldest first
}

/**
 * Get conversations for a user
 */
export async function getUserConversations(
  userId: string,
  userType: 'client' | 'provider'
): Promise<Conversation[]> {
  const field = userType === 'client' ? 'client_id' : 'provider_id';
  
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq(field, userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .is('read_at', null);
}

/**
 * Subscribe to real-time messages for a conversation
 */
export function subscribeToMessages(
  conversationId: string,
  onMessage: (message: ChatMessage) => void,
  onError?: (error: Error) => void
) {
  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onMessage(payload.new as ChatMessage);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onMessage(payload.new as ChatMessage);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Subscribed to messages for conversation:', conversationId);
      } else if (status === 'CHANNEL_ERROR') {
        onError?.(new Error('Failed to subscribe to conversation messages'));
      }
    });
}

/**
 * Subscribe to conversation updates
 */
export function subscribeToConversations(
  userId: string,
  userType: 'client' | 'provider',
  onUpdate: (conversation: Conversation) => void,
  onError?: (error: Error) => void
) {
  const field = userType === 'client' ? 'client_id' : 'provider_id';
  
  return supabase
    .channel(`conversations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `${field}=eq.${userId}`,
      },
      (payload) => {
        onUpdate(payload.new as Conversation);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Subscribed to conversations for user:', userId);
      } else if (status === 'CHANNEL_ERROR') {
        onError?.(new Error('Failed to subscribe to conversations'));
      }
    });
}

/**
 * Upload file for message
 */
export async function uploadMessageFile(
  conversationId: string,
  file: File
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${conversationId}/${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('message-attachments')
    .upload(fileName, file);

  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('message-attachments')
    .getPublicUrl(fileName);

  return publicUrl;
}

/**
 * Get typing indicator
 */
export async function setTypingIndicator(
  conversationId: string,
  userId: string,
  isTyping: boolean
): Promise<void> {
  const channel = supabase.channel(`typing:${conversationId}`);
  
  if (isTyping) {
    await channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, isTyping: true },
    });
  } else {
    await channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, isTyping: false },
    });
  }
}

/**
 * Subscribe to typing indicators
 */
export function subscribeToTyping(
  conversationId: string,
  onTypingChange: (userId: string, isTyping: boolean) => void
) {
  return supabase
    .channel(`typing:${conversationId}`)
    .on('broadcast', { event: 'typing' }, (payload) => {
      const { userId, isTyping } = payload.payload;
      onTypingChange(userId, isTyping);
    })
    .subscribe();
}
