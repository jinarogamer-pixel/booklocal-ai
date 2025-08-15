-- BookLocal AI Database Setup for Phase 2 Features
-- Run these commands in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Conversations table for real-time chat
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  booking_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed')),
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  INDEX idx_conversations_client_id (client_id),
  INDEX idx_conversations_provider_id (provider_id),
  INDEX idx_conversations_status (status),
  INDEX idx_conversations_updated_at (updated_at DESC)
);

-- 2. Messages table for chat messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'provider')),
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Indexes for performance
  INDEX idx_messages_conversation_id (conversation_id),
  INDEX idx_messages_sender_id (sender_id),
  INDEX idx_messages_created_at (created_at DESC)
);

-- 3. Analytics events table for tracking
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'booking_created', 'payment_completed', 'message_sent', 'user_signup', 'search_performed')),
  user_id TEXT,
  session_id TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  ip_address INET,
  page_url TEXT,
  
  -- Indexes for analytics queries
  INDEX idx_analytics_events_type (event_type),
  INDEX idx_analytics_events_user_id (user_id),
  INDEX idx_analytics_events_session_id (session_id),
  INDEX idx_analytics_events_timestamp (timestamp DESC)
);

-- 4. Daily metrics cache for dashboard performance
CREATE TABLE IF NOT EXISTS daily_metrics (
  date DATE PRIMARY KEY,
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  bookings INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Subscriptions table for Stripe integration
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_subscriptions_user_id (user_id),
  INDEX idx_subscriptions_stripe_customer_id (stripe_customer_id),
  INDEX idx_subscriptions_status (status)
);

-- 6. Usage tracking for subscription limits
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  feature TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, feature, period_start),
  INDEX idx_usage_tracking_user_id (user_id),
  INDEX idx_usage_tracking_period (period_start, period_end)
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view their own conversations" ON conversations
  FOR SELECT USING (auth.uid()::text = client_id OR auth.uid()::text = provider_id);

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid()::text = client_id OR auth.uid()::text = provider_id);

CREATE POLICY "Users can update their own conversations" ON conversations
  FOR UPDATE USING (auth.uid()::text = client_id OR auth.uid()::text = provider_id);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.client_id = auth.uid()::text OR conversations.provider_id = auth.uid()::text)
    )
  );

CREATE POLICY "Users can send messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    auth.uid()::text = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = conversation_id 
      AND (conversations.client_id = auth.uid()::text OR conversations.provider_id = auth.uid()::text)
    )
  );

-- Analytics events policies (allow authenticated users to insert)
CREATE POLICY "Authenticated users can create analytics events" ON analytics_events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Subscriptions policies
CREATE POLICY "Users can view their own subscription" ON subscriptions
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own subscription" ON subscriptions
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Usage tracking policies
CREATE POLICY "Users can view their own usage" ON usage_tracking
  FOR SELECT USING (auth.uid()::text = user_id);

-- Functions for real-time updates

-- Function to update conversation timestamp when new message is added
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET 
    last_message = NEW.message,
    last_message_at = NEW.created_at,
    updated_at = NOW(),
    unread_count = unread_count + 1
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update conversation when message is inserted
CREATE TRIGGER trigger_update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- Function to reset unread count when messages are read
CREATE OR REPLACE FUNCTION mark_messages_read(p_conversation_id UUID, p_user_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE messages 
  SET read_at = NOW() 
  WHERE conversation_id = p_conversation_id 
    AND sender_id != p_user_id 
    AND read_at IS NULL;
    
  UPDATE conversations 
  SET unread_count = 0 
  WHERE id = p_conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-attachments',
  'message-attachments',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO NOTHING;

-- Storage policy for message attachments
CREATE POLICY "Authenticated users can upload attachments" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'message-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view attachments in their conversations" ON storage.objects
  FOR SELECT USING (bucket_id = 'message-attachments');

-- Insert sample data for testing (optional)
-- Uncomment the following lines if you want sample data

/*
-- Sample conversation
INSERT INTO conversations (id, client_id, provider_id, status) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'client-123', 'provider-456', 'active');

-- Sample messages
INSERT INTO messages (conversation_id, sender_id, sender_name, sender_type, message) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'client-123', 'John Doe', 'client', 'Hi, I need help with my booking'),
  ('550e8400-e29b-41d4-a716-446655440000', 'provider-456', 'Jane Smith', 'provider', 'Hello! I''d be happy to help you with that.');
*/
