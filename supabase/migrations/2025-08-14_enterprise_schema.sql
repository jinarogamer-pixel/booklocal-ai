-- Enterprise schema, RLS, audit logging, functions, triggers, and indexes
-- Run this in staging first. Split into sections when applying in production.

-- =============================================
-- 1. CORE TABLES CREATION
-- =============================================

-- Users table with enterprise fields
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'provider', 'admin')),
  stripe_customer_id TEXT UNIQUE,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  profile_image_url TEXT,
  business_name TEXT,
  business_type TEXT,
  business_license TEXT,
  tax_id TEXT,
  address JSONB,
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  marketing_consent BOOLEAN DEFAULT false,
  terms_accepted_at TIMESTAMP WITH TIME ZONE,
  privacy_accepted_at TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Services table for providers
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  price_type TEXT DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'hourly', 'custom')),
  base_price INTEGER,
  hourly_rate INTEGER,
  duration_minutes INTEGER,
  service_area JSONB,
  availability JSONB,
  requirements TEXT,
  included_items TEXT[],
  additional_fees JSONB,
  images TEXT[],
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  booking_advance_days INTEGER DEFAULT 1,
  cancellation_hours INTEGER DEFAULT 24,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table with enterprise tracking
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  service_name TEXT NOT NULL,
  service_description TEXT,
  scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
  scheduled_end TIMESTAMP WITH TIME ZONE,
  actual_start TIMESTAMP WITH TIME ZONE,
  actual_end TIMESTAMP WITH TIME ZONE,
  location_type TEXT DEFAULT 'customer' CHECK (location_type IN ('customer', 'provider', 'custom')),
  address JSONB,
  special_instructions TEXT,
  base_amount INTEGER NOT NULL,
  additional_fees INTEGER DEFAULT 0,
  discount_amount INTEGER DEFAULT 0,
  tax_amount INTEGER DEFAULT 0,
  total_amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
  payment_intent_id TEXT,
  payment_method_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  confirmation_code TEXT UNIQUE,
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES users(id),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  customer_notes TEXT,
  provider_notes TEXT,
  internal_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_booking_times CHECK (scheduled_end > scheduled_start),
  CONSTRAINT valid_amounts CHECK (total_amount >= 0)
);

-- Reviews and ratings
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reviewed_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  response TEXT,
  response_date TIMESTAMP WITH TIME ZONE,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions for enterprise features
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment records for audit trail
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL,
  payment_method_type TEXT,
  platform_fee INTEGER DEFAULT 0,
  processing_fee INTEGER DEFAULT 0,
  provider_amount INTEGER,
  description TEXT,
  metadata JSONB,
  failure_reason TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. ENTERPRISE AUDIT LOGGING SYSTEM
-- =============================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT,
  user_email TEXT,
  user_role TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  request_id TEXT,
  api_endpoint TEXT,
  http_method TEXT,
  compliance_tags TEXT[],
  retention_period INTERVAL DEFAULT INTERVAL '7 years',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS data_retention (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL,
  retention_period INTERVAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  auto_delete BOOLEAN DEFAULT true,
  legal_hold BOOLEAN DEFAULT false,
  deletion_requested_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS consent_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL,
  consent_method TEXT,
  legal_basis TEXT,
  purpose TEXT NOT NULL,
  data_categories TEXT[],
  third_parties TEXT[],
  retention_period INTERVAL,
  withdrawal_method TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  withdrawn_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 4. CREATE SECURITY POLICIES
-- =============================================

-- USERS POLICIES
CREATE POLICY IF NOT EXISTS "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- SERVICES POLICIES
CREATE POLICY IF NOT EXISTS "Anyone can view active services" ON services
  FOR SELECT USING (is_active = true);

CREATE POLICY IF NOT EXISTS "Providers can manage own services" ON services
  FOR ALL USING (auth.uid() = provider_id);

CREATE POLICY IF NOT EXISTS "Admins can manage all services" ON services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- BOOKINGS POLICIES
CREATE POLICY IF NOT EXISTS "Users can view own bookings" ON bookings
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() = provider_id
  );

CREATE POLICY IF NOT EXISTS "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Participants can update bookings" ON bookings
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    auth.uid() = provider_id
  );

-- REVIEWS POLICIES
CREATE POLICY IF NOT EXISTS "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Reviewers can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY IF NOT EXISTS "Reviewers can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);

-- PAYMENTS POLICIES - Strict security
CREATE POLICY IF NOT EXISTS "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "No client payment modifications" ON payments
  FOR INSERT WITH CHECK (false);

CREATE POLICY IF NOT EXISTS "No client payment updates" ON payments
  FOR UPDATE USING (false);

-- SUBSCRIPTIONS POLICIES
CREATE POLICY IF NOT EXISTS "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- AUDIT LOGS POLICIES - Admin only
CREATE POLICY IF NOT EXISTS "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- CONSENT RECORDS POLICIES
CREATE POLICY IF NOT EXISTS "Users can view own consent records" ON consent_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create consent records" ON consent_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 5. ENTERPRISE FUNCTIONS
-- =============================================

-- Secure booking creation with payment validation
CREATE OR REPLACE FUNCTION create_secure_booking(
  p_provider_id UUID,
  p_service_id UUID,
  p_scheduled_start TIMESTAMP WITH TIME ZONE,
  p_scheduled_end TIMESTAMP WITH TIME ZONE,
  p_total_amount INTEGER,
  p_location_data JSONB DEFAULT NULL,
  p_special_instructions TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking_id UUID;
  v_user_id UUID;
  v_service_record services%ROWTYPE;
  v_confirmation_code TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  SELECT * INTO v_service_record 
  FROM services 
  WHERE id = p_service_id AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Service not found or inactive';
  END IF;
  IF v_user_id = p_provider_id THEN
    RAISE EXCEPTION 'Cannot book own service';
  END IF;
  v_confirmation_code := upper(substr(md5(random()::text), 1, 8));
  INSERT INTO bookings (
    user_id,
    provider_id,
    service_id,
    service_name,
    service_description,
    scheduled_start,
    scheduled_end,
    total_amount,
    address,
    special_instructions,
    confirmation_code,
    status
  ) VALUES (
    v_user_id,
    p_provider_id,
    p_service_id,
    v_service_record.name,
    v_service_record.description,
    p_scheduled_start,
    p_scheduled_end,
    p_total_amount,
    p_location_data,
    p_special_instructions,
    v_confirmation_code,
    'pending'
  ) RETURNING id INTO v_booking_id;
  PERFORM log_user_action(
    'CREATE_BOOKING',
    'bookings',
    v_booking_id,
    jsonb_build_object(
      'provider_id', p_provider_id,
      'service_id', p_service_id,
      'amount', p_total_amount
    )
  );
  RETURN v_booking_id;
END;
$$;

-- Audit logging function
CREATE OR REPLACE FUNCTION log_user_action(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_new_values JSONB DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_user_record users%ROWTYPE;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NOT NULL THEN
    SELECT * INTO v_user_record FROM users WHERE id = v_user_id;
  END IF;
  INSERT INTO audit_logs (
    user_id,
    user_email,
    user_role,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    ip_address,
    timestamp
  ) VALUES (
    v_user_id,
    COALESCE(v_user_record.email, 'system'),
    COALESCE(v_user_record.role, 'system'),
    p_action,
    p_entity_type,
    p_entity_id,
    p_old_values,
    p_new_values,
    inet_client_addr(),
    NOW()
  );
END;
$$;

-- GDPR data deletion function
CREATE OR REPLACE FUNCTION gdpr_delete_user_data(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM data_retention 
    WHERE user_id = p_user_id AND legal_hold = true
  ) THEN
    RAISE EXCEPTION 'Cannot delete data: legal hold active';
  END IF;
  UPDATE users SET
    email = 'deleted-' || id::text || '@gdpr.local',
    phone = NULL,
    name = 'Deleted User',
    profile_image_url = NULL,
    business_name = NULL,
    business_license = NULL,
    tax_id = NULL,
    address = NULL,
    deleted_at = NOW()
  WHERE id = p_user_id;
  UPDATE reviews SET
    comment = '[Comment deleted by user request]'
  WHERE reviewer_id = p_user_id;
  PERFORM log_user_action('GDPR_DELETE', 'users', p_user_id, 
    jsonb_build_object('deletion_type', 'gdpr_request'));
END;
$$;

-- =============================================
-- 6. AUTOMATED TRIGGERS
-- =============================================

CREATE OR REPLACE FUNCTION audit_table_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_TABLE_NAME = 'audit_logs' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  PERFORM log_user_action(
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply audit triggers
CREATE TRIGGER users_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

CREATE TRIGGER bookings_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

CREATE TRIGGER payments_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

-- =============================================
-- 7. PERFORMANCE INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

CREATE INDEX IF NOT EXISTS idx_services_provider ON services(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- =============================================
-- 8. ENTERPRISE PERMISSIONS (Granting minimal access to roles)
-- =============================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON services TO authenticated;
GRANT SELECT, INSERT, UPDATE ON bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON reviews TO authenticated;
GRANT SELECT ON subscriptions TO authenticated;
GRANT SELECT ON payments TO authenticated;
GRANT SELECT, INSERT ON consent_records TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;

-- End of migration
