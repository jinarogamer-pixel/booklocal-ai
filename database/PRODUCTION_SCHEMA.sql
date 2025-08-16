-- BookLocal Production Database Schema
-- Version: 1.0 Production
-- Date: January 15, 2025
-- CRITICAL: This schema is LOCKED for production. No changes without migration.

-- =============================================================================
-- EXTENSIONS AND SETUP
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For location services

-- Enable Row Level Security globally
ALTER DATABASE postgres SET row_security = on;

-- =============================================================================
-- CORE USER MANAGEMENT
-- =============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    user_type VARCHAR(20) CHECK (user_type IN ('customer', 'contractor', 'admin')) NOT NULL DEFAULT 'customer',
    status VARCHAR(20) CHECK (status IN ('active', 'suspended', 'pending', 'banned')) NOT NULL DEFAULT 'pending',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    terms_accepted_at TIMESTAMP WITH TIME ZONE,
    privacy_accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- User addresses
CREATE TABLE public.user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(20) CHECK (type IN ('home', 'work', 'billing', 'service')) NOT NULL,
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    country VARCHAR(50) DEFAULT 'US',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- CONTRACTOR MANAGEMENT
-- =============================================================================

-- Contractor profiles
CREATE TABLE public.contractor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    business_name VARCHAR(255),
    business_type VARCHAR(50) CHECK (business_type IN ('individual', 'llc', 'corporation', 'partnership')),
    license_number VARCHAR(100),
    license_type VARCHAR(100),
    license_state VARCHAR(50),
    license_expires_at TIMESTAMP WITH TIME ZONE,
    license_verified BOOLEAN DEFAULT FALSE,
    license_verified_at TIMESTAMP WITH TIME ZONE,
    ein VARCHAR(20), -- Employer Identification Number
    ssn_last_four VARCHAR(4), -- Last 4 digits only for verification
    years_experience INTEGER,
    service_radius INTEGER DEFAULT 25, -- Miles
    hourly_rate DECIMAL(8,2),
    minimum_job_size DECIMAL(10,2),
    bio TEXT,
    website_url TEXT,
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    jobs_completed INTEGER DEFAULT 0,
    response_time_hours INTEGER DEFAULT 24,
    availability_status VARCHAR(20) CHECK (availability_status IN ('available', 'busy', 'unavailable')) DEFAULT 'available',
    background_check_status VARCHAR(20) CHECK (background_check_status IN ('pending', 'passed', 'failed', 'expired')) DEFAULT 'pending',
    background_check_completed_at TIMESTAMP WITH TIME ZONE,
    insurance_verified BOOLEAN DEFAULT FALSE,
    insurance_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Contractor services offered
CREATE TABLE public.contractor_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES public.contractor_profiles(id) ON DELETE CASCADE,
    service_category VARCHAR(100) NOT NULL,
    service_subcategory VARCHAR(100),
    experience_years INTEGER,
    hourly_rate DECIMAL(8,2),
    minimum_charge DECIMAL(8,2),
    description TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contractor availability
CREATE TABLE public.contractor_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES public.contractor_profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- VERIFICATION AND COMPLIANCE
-- =============================================================================

-- Document uploads for verification
CREATE TABLE public.verification_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) CHECK (document_type IN ('drivers_license', 'passport', 'business_license', 'insurance_cert', 'w9', 'other')) NOT NULL,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(100),
    verification_status VARCHAR(20) CHECK (verification_status IN ('pending', 'approved', 'rejected', 'expired')) DEFAULT 'pending',
    verified_by UUID REFERENCES public.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Background check results
CREATE TABLE public.background_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES public.contractor_profiles(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- checkr, sterling, etc.
    external_id VARCHAR(255), -- Provider's ID
    status VARCHAR(20) CHECK (status IN ('pending', 'clear', 'consider', 'suspended')) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    report_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Insurance certificates
CREATE TABLE public.insurance_certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES public.contractor_profiles(id) ON DELETE CASCADE,
    insurance_type VARCHAR(50) CHECK (insurance_type IN ('general_liability', 'workers_comp', 'professional_liability', 'auto')) NOT NULL,
    carrier_name VARCHAR(255) NOT NULL,
    policy_number VARCHAR(100) NOT NULL,
    coverage_amount DECIMAL(12,2),
    effective_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    certificate_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- SERVICE CATEGORIES AND PRICING
-- =============================================================================

-- Service categories
CREATE TABLE public.service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_name VARCHAR(50),
    requires_license BOOLEAN DEFAULT FALSE,
    minimum_insurance_amount DECIMAL(12,2),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service subcategories
CREATE TABLE public.service_subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.service_categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    typical_duration_hours INTEGER,
    typical_price_min DECIMAL(8,2),
    typical_price_max DECIMAL(8,2),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_id, slug)
);

-- =============================================================================
-- BOOKING AND PROJECT MANAGEMENT
-- =============================================================================

-- Service requests/bookings
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    contractor_id UUID REFERENCES public.contractor_profiles(id) ON DELETE SET NULL,
    service_category_id UUID REFERENCES public.service_categories(id),
    service_subcategory_id UUID REFERENCES public.service_subcategories(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    address_id UUID REFERENCES public.user_addresses(id),
    preferred_date DATE,
    preferred_time_start TIME,
    preferred_time_end TIME,
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    urgency VARCHAR(20) CHECK (urgency IN ('low', 'medium', 'high', 'emergency')) DEFAULT 'medium',
    status VARCHAR(30) CHECK (status IN ('draft', 'posted', 'matched', 'accepted', 'in_progress', 'completed', 'cancelled', 'disputed')) DEFAULT 'draft',
    estimated_hours DECIMAL(5,2),
    estimated_cost DECIMAL(10,2),
    final_cost DECIMAL(10,2),
    scheduled_start TIMESTAMP WITH TIME ZONE,
    scheduled_end TIMESTAMP WITH TIME ZONE,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES public.users(id),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Booking quotes from contractors
CREATE TABLE public.booking_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    contractor_id UUID REFERENCES public.contractor_profiles(id) ON DELETE CASCADE,
    quoted_price DECIMAL(10,2) NOT NULL,
    estimated_hours DECIMAL(5,2),
    materials_cost DECIMAL(10,2),
    labor_cost DECIMAL(10,2),
    message TEXT,
    valid_until TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')) DEFAULT 'pending',
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project milestones
CREATE TABLE public.project_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE,
    status VARCHAR(20) CHECK (status IN ('pending', 'in_progress', 'completed', 'approved', 'disputed')) DEFAULT 'pending',
    completed_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES public.users(id),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- =============================================================================
-- PAYMENT AND FINANCIAL
-- =============================================================================

-- Payment methods
CREATE TABLE public.payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(20) CHECK (type IN ('card', 'bank_account', 'digital_wallet')) NOT NULL,
    provider VARCHAR(50) NOT NULL, -- stripe, braintree, etc.
    external_id VARCHAR(255) NOT NULL, -- Provider's payment method ID
    last_four VARCHAR(4),
    brand VARCHAR(50), -- visa, mastercard, etc.
    expires_month INTEGER,
    expires_year INTEGER,
    is_default BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Transactions
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id),
    milestone_id UUID REFERENCES public.project_milestones(id),
    customer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    contractor_id UUID REFERENCES public.contractor_profiles(id),
    payment_method_id UUID REFERENCES public.payment_methods(id),
    type VARCHAR(30) CHECK (type IN ('payment', 'refund', 'payout', 'fee', 'escrow_hold', 'escrow_release')) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    platform_fee DECIMAL(12,2) DEFAULT 0.00,
    payment_processor_fee DECIMAL(12,2) DEFAULT 0.00,
    net_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'disputed')) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    external_id VARCHAR(255), -- Provider's transaction ID
    description TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    failed_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Escrow accounts for secure payments
CREATE TABLE public.escrow_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE UNIQUE,
    total_amount DECIMAL(12,2) NOT NULL,
    held_amount DECIMAL(12,2) DEFAULT 0.00,
    released_amount DECIMAL(12,2) DEFAULT 0.00,
    status VARCHAR(20) CHECK (status IN ('created', 'funded', 'partial_release', 'completed', 'disputed')) DEFAULT 'created',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- REVIEWS AND RATINGS
-- =============================================================================

-- Reviews
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    reviewee_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    reviewer_type VARCHAR(20) CHECK (reviewer_type IN ('customer', 'contractor')) NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    title VARCHAR(255),
    content TEXT,
    quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
    communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
    timeliness_rating INTEGER CHECK (timeliness_rating BETWEEN 1 AND 5),
    value_rating INTEGER CHECK (value_rating BETWEEN 1 AND 5),
    would_recommend BOOLEAN,
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    response_content TEXT, -- Contractor response to review
    response_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review photos
CREATE TABLE public.review_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    caption TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- COMMUNICATION
-- =============================================================================

-- Messages between users
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id),
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) CHECK (message_type IN ('text', 'image', 'file', 'system')) DEFAULT 'text',
    file_url TEXT,
    file_name VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- =============================================================================
-- SECURITY AND AUDIT
-- =============================================================================

-- Security logs (from existing schema)
CREATE TABLE public.security_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin audit logs
CREATE TABLE public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Failed login attempts
CREATE TABLE public.login_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255),
    ip_address INET NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blocked IPs
CREATE TABLE public.blocked_ips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address INET UNIQUE NOT NULL,
    reason VARCHAR(255),
    blocked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================

-- User notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- User indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_user_type ON public.users(user_type);
CREATE INDEX idx_users_status ON public.users(status);
CREATE INDEX idx_users_created_at ON public.users(created_at);

-- Contractor indexes
CREATE INDEX idx_contractor_profiles_user_id ON public.contractor_profiles(user_id);
CREATE INDEX idx_contractor_profiles_license_number ON public.contractor_profiles(license_number);
CREATE INDEX idx_contractor_profiles_rating ON public.contractor_profiles(rating DESC);
CREATE INDEX idx_contractor_profiles_availability ON public.contractor_profiles(availability_status);

-- Booking indexes
CREATE INDEX idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX idx_bookings_contractor_id ON public.bookings(contractor_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_created_at ON public.bookings(created_at DESC);
CREATE INDEX idx_bookings_service_category ON public.bookings(service_category_id);

-- Location indexes (PostGIS)
CREATE INDEX idx_user_addresses_location ON public.user_addresses USING GIST(ST_MakePoint(longitude, latitude));

-- Transaction indexes
CREATE INDEX idx_transactions_customer_id ON public.transactions(customer_id);
CREATE INDEX idx_transactions_contractor_id ON public.transactions(contractor_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX idx_transactions_booking_id ON public.transactions(booking_id);

-- Security indexes
CREATE INDEX idx_security_logs_user_id ON public.security_logs(user_id);
CREATE INDEX idx_security_logs_event_type ON public.security_logs(event_type);
CREATE INDEX idx_security_logs_created_at ON public.security_logs(created_at DESC);
CREATE INDEX idx_login_attempts_ip_address ON public.login_attempts(ip_address);
CREATE INDEX idx_login_attempts_created_at ON public.login_attempts(created_at DESC);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.background_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Contractors can view and update their own profiles
CREATE POLICY "Contractors can view own profile" ON public.contractor_profiles
    FOR ALL USING (auth.uid() = user_id);

-- Customers can view contractor profiles (public info only)
CREATE POLICY "Public can view contractor profiles" ON public.contractor_profiles
    FOR SELECT USING (true);

-- Bookings policies
CREATE POLICY "Users can view own bookings" ON public.bookings
    FOR SELECT USING (
        auth.uid() = customer_id OR 
        auth.uid() IN (SELECT user_id FROM public.contractor_profiles WHERE id = contractor_id)
    );

CREATE POLICY "Customers can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update own bookings" ON public.bookings
    FOR UPDATE USING (
        auth.uid() = customer_id OR 
        auth.uid() IN (SELECT user_id FROM public.contractor_profiles WHERE id = contractor_id)
    );

-- Payment methods - users can only see their own
CREATE POLICY "Users can manage own payment methods" ON public.payment_methods
    FOR ALL USING (auth.uid() = user_id);

-- Transactions - users can see their own transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (
        auth.uid() = customer_id OR 
        auth.uid() IN (SELECT user_id FROM public.contractor_profiles WHERE id = contractor_id)
    );

-- Reviews - public read, restricted write
CREATE POLICY "Public can view reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their bookings" ON public.reviews
    FOR INSERT WITH CHECK (
        auth.uid() = reviewer_id AND
        EXISTS (
            SELECT 1 FROM public.bookings 
            WHERE id = booking_id AND 
            (customer_id = auth.uid() OR contractor_id IN (
                SELECT id FROM public.contractor_profiles WHERE user_id = auth.uid()
            ))
        )
    );

-- Messages - users can see messages they sent or received
CREATE POLICY "Users can view their messages" ON public.messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Notifications - users can see their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contractor_profiles_updated_at BEFORE UPDATE ON public.contractor_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_quotes_updated_at BEFORE UPDATE ON public.booking_quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate contractor rating
CREATE OR REPLACE FUNCTION calculate_contractor_rating(contractor_user_id UUID)
RETURNS VOID AS $$
DECLARE
    avg_rating DECIMAL(3,2);
    review_cnt INTEGER;
BEGIN
    SELECT AVG(rating), COUNT(*)
    INTO avg_rating, review_cnt
    FROM public.reviews r
    WHERE r.reviewee_id = contractor_user_id
    AND r.reviewer_type = 'customer';
    
    UPDATE public.contractor_profiles
    SET rating = COALESCE(avg_rating, 0.00),
        review_count = COALESCE(review_cnt, 0)
    WHERE user_id = contractor_user_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update contractor rating when review is added/updated
CREATE OR REPLACE FUNCTION update_contractor_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM calculate_contractor_rating(NEW.reviewee_id);
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        PERFORM calculate_contractor_rating(OLD.reviewee_id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contractor_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION update_contractor_rating();

-- Function to clean up old security logs (data retention)
CREATE OR REPLACE FUNCTION cleanup_old_security_logs()
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.security_logs 
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    DELETE FROM public.login_attempts 
    WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- INITIAL DATA SETUP
-- =============================================================================

-- Insert default service categories
INSERT INTO public.service_categories (name, slug, description, requires_license, minimum_insurance_amount) VALUES
('Plumbing', 'plumbing', 'Water, sewer, and gas line services', true, 500000.00),
('Electrical', 'electrical', 'Electrical wiring, outlets, and lighting', true, 500000.00),
('HVAC', 'hvac', 'Heating, ventilation, and air conditioning', true, 500000.00),
('Handyman', 'handyman', 'General repairs and maintenance', false, 300000.00),
('Painting', 'painting', 'Interior and exterior painting services', false, 300000.00),
('Flooring', 'flooring', 'Installation, repair, and refinishing', false, 300000.00),
('Roofing', 'roofing', 'Roof repair, replacement, and maintenance', true, 1000000.00),
('Landscaping', 'landscaping', 'Lawn care, gardening, and outdoor design', false, 300000.00);

-- Insert subcategories for plumbing
INSERT INTO public.service_subcategories (category_id, name, slug, description, typical_duration_hours, typical_price_min, typical_price_max) VALUES
((SELECT id FROM public.service_categories WHERE slug = 'plumbing'), 'Leak Repair', 'leak-repair', 'Fix leaking pipes, faucets, and fixtures', 2, 150.00, 400.00),
((SELECT id FROM public.service_categories WHERE slug = 'plumbing'), 'Drain Cleaning', 'drain-cleaning', 'Clear clogged drains and pipes', 1, 100.00, 300.00),
((SELECT id FROM public.service_categories WHERE slug = 'plumbing'), 'Water Heater', 'water-heater', 'Install or repair water heaters', 4, 500.00, 2000.00),
((SELECT id FROM public.service_categories WHERE slug = 'plumbing'), 'Toilet Repair', 'toilet-repair', 'Fix or replace toilets', 2, 150.00, 500.00);

-- =============================================================================
-- SCHEMA VALIDATION AND CONSTRAINTS
-- =============================================================================

-- Ensure email uniqueness across the system
CREATE UNIQUE INDEX idx_users_email_unique ON public.users(LOWER(email));

-- Ensure phone uniqueness when provided
CREATE UNIQUE INDEX idx_users_phone_unique ON public.users(phone) WHERE phone IS NOT NULL;

-- Ensure contractor license uniqueness per state
CREATE UNIQUE INDEX idx_contractor_license_unique ON public.contractor_profiles(license_number, license_state) 
WHERE license_number IS NOT NULL;

-- Ensure one primary address per user per type
CREATE UNIQUE INDEX idx_user_addresses_primary_unique ON public.user_addresses(user_id, type) 
WHERE is_primary = true;

-- Ensure one default payment method per user
CREATE UNIQUE INDEX idx_payment_methods_default_unique ON public.payment_methods(user_id) 
WHERE is_default = true;

-- =============================================================================
-- FINAL VALIDATION
-- =============================================================================

-- Verify all tables were created
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name NOT IN ('spatial_ref_sys'); -- Exclude PostGIS system table
    
    IF table_count < 20 THEN
        RAISE EXCEPTION 'Schema creation incomplete. Expected at least 20 tables, found %', table_count;
    END IF;
    
    RAISE NOTICE 'Schema validation complete. Created % tables successfully.', table_count;
END;
$$;

-- =============================================================================
-- SCHEMA LOCK NOTICE
-- =============================================================================

-- Create a schema version table to track changes
CREATE TABLE public.schema_version (
    version VARCHAR(10) PRIMARY KEY,
    description TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    applied_by TEXT DEFAULT current_user
);

INSERT INTO public.schema_version (version, description) VALUES 
('1.0.0', 'Initial production schema - LOCKED FOR PRODUCTION');

-- Add comment to indicate this schema is locked
COMMENT ON SCHEMA public IS 'BookLocal Production Schema v1.0.0 - LOCKED - No changes without proper migration process';

-- Final success message
SELECT 'BookLocal Production Database Schema v1.0.0 successfully created and locked for production deployment!' as status;