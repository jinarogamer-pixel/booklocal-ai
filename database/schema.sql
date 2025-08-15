-- BookLocal Provider Tables Schema with Material Categories

-- Main providers table
CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Basic Info
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    business_name TEXT,
    license_number TEXT,
    
    -- Location
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    service_radius INTEGER DEFAULT 25, -- miles
    
    -- Categories & Specialties
    primary_category TEXT NOT NULL, -- flooring, painting, furniture, etc.
    specialties TEXT[], -- array of specialties within category
    material_expertise TEXT[], -- picks/floor/wall/sofa materials they work with
    
    -- Trust Metrics
    avg_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    jobs_completed INTEGER DEFAULT 0,
    on_time_percentage DECIMAL(5,2) DEFAULT 0,
    response_time_hours DECIMAL(5,2) DEFAULT 24,
    background_check_status TEXT DEFAULT 'pending', -- verified, pending, failed
    insurance_verified BOOLEAN DEFAULT FALSE,
    license_verified BOOLEAN DEFAULT FALSE,
    
    -- Business Metrics
    years_in_business INTEGER DEFAULT 0,
    team_size INTEGER DEFAULT 1,
    cancellation_rate DECIMAL(5,2) DEFAULT 0,
    repeat_client_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Pricing & Availability
    hourly_rate_min DECIMAL(10,2),
    hourly_rate_max DECIMAL(10,2),
    booking_lead_time_days INTEGER DEFAULT 7,
    accepts_weekend_work BOOLEAN DEFAULT TRUE,
    accepts_emergency_calls BOOLEAN DEFAULT FALSE,
    
    -- Status
    status TEXT DEFAULT 'active', -- active, inactive, suspended
    verified_at TIMESTAMP WITH TIME ZONE,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material specializations for room customization
CREATE TABLE IF NOT EXISTS provider_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Material Categories (for our 3D room)
    category TEXT NOT NULL, -- 'flooring', 'wall', 'furniture', 'lighting'
    material_type TEXT NOT NULL, -- 'hardwood', 'tile', 'carpet', 'paint', 'wallpaper', 'leather', 'fabric'
    expertise_level TEXT DEFAULT 'advanced', -- basic, intermediate, advanced, expert
    
    -- Specific materials they work with
    brand_names TEXT[], -- ['Shaw', 'Mohawk', 'Pergo']
    style_specialties TEXT[], -- ['modern', 'rustic', 'contemporary', 'traditional']
    color_expertise TEXT[], -- ['dark', 'light', 'bold', 'neutral']
    
    -- Installation/work capabilities
    installation_offered BOOLEAN DEFAULT TRUE,
    repair_offered BOOLEAN DEFAULT TRUE,
    custom_work_offered BOOLEAN DEFAULT FALSE,
    warranty_months INTEGER DEFAULT 12,
    
    UNIQUE(provider_id, category, material_type)
);

-- Trust scoring weight configuration
CREATE TABLE IF NOT EXISTS trust_weights (
    id SERIAL PRIMARY KEY,
    component TEXT UNIQUE NOT NULL,
    weight DECIMAL(4,3) NOT NULL,
    min_threshold DECIMAL(5,2),
    max_threshold DECIMAL(5,2),
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert trust scoring weights
INSERT INTO trust_weights (component, weight, min_threshold, max_threshold, description) VALUES
('avg_rating', 0.250, 1.0, 5.0, 'Average customer rating (25% of trust score)'),
('completion_rate', 0.200, 0.0, 1.0, 'Job completion rate (20% of trust score)'),
('on_time_rate', 0.150, 0.0, 1.0, 'On-time delivery rate (15% of trust score)'),
('response_time', 0.100, 0.5, 48.0, 'Average response time in hours (10% of trust score)'),
('experience_years', 0.080, 0.0, 25.0, 'Years in business (8% of trust score)'),
('background_verified', 0.070, 0.0, 1.0, 'Background check status (7% of trust score)'),
('insurance_verified', 0.060, 0.0, 1.0, 'Insurance verification (6% of trust score)'),
('license_verified', 0.050, 0.0, 1.0, 'License verification (5% of trust score)'),
('cancellation_rate', 0.040, 0.0, 0.5, 'Job cancellation rate (4% - inverted)'),
('repeat_clients', 0.030, 0.0, 1.0, 'Repeat client rate (3% of trust score)')
ON CONFLICT (component) DO UPDATE SET
    weight = EXCLUDED.weight,
    min_threshold = EXCLUDED.min_threshold,
    max_threshold = EXCLUDED.max_threshold,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Sample provider data with material expertise
INSERT INTO providers (
    name, email, primary_category, specialties, material_expertise,
    avg_rating, total_reviews, jobs_completed, on_time_percentage,
    response_time_hours, years_in_business, hourly_rate_min, hourly_rate_max
) VALUES 
(
    'Elite Flooring Solutions', 'contact@eliteflooring.com', 'flooring',
    ARRAY['hardwood', 'luxury_vinyl', 'tile'], 
    ARRAY['oak', 'maple', 'porcelain', 'ceramic', 'vinyl_plank'],
    4.8, 127, 89, 94.5, 2.3, 8, 85.00, 150.00
),
(
    'Modern Wall Studio', 'hello@modernwall.com', 'painting',
    ARRAY['interior_paint', 'decorative_finishes', 'wallpaper'],
    ARRAY['benjamin_moore', 'sherwin_williams', 'designer_wallpaper'],
    4.6, 203, 156, 91.2, 3.7, 12, 65.00, 120.00
),
(
    'Custom Furniture Co', 'info@customfurniture.com', 'furniture',
    ARRAY['upholstery', 'custom_builds', 'restoration'],
    ARRAY['leather', 'fabric', 'wood_stain', 'metal_finish'],
    4.9, 89, 67, 96.8, 4.2, 15, 95.00, 200.00
)
ON CONFLICT (email) DO NOTHING;

-- Sample material specializations
INSERT INTO provider_materials (provider_id, category, material_type, expertise_level, brand_names, style_specialties, color_expertise) 
SELECT 
    p.id,
    'flooring',
    'hardwood',
    'expert',
    ARRAY['Shaw', 'Bruce', 'Mohawk', 'Armstrong'],
    ARRAY['modern', 'traditional', 'rustic'],
    ARRAY['dark', 'medium', 'light']
FROM providers p WHERE p.primary_category = 'flooring'
ON CONFLICT (provider_id, category, material_type) DO NOTHING;

INSERT INTO provider_materials (provider_id, category, material_type, expertise_level, brand_names, style_specialties, color_expertise) 
SELECT 
    p.id,
    'wall',
    'paint',
    'expert',
    ARRAY['Benjamin Moore', 'Sherwin Williams', 'Behr'],
    ARRAY['modern', 'contemporary', 'traditional'],
    ARRAY['neutral', 'bold', 'accent']
FROM providers p WHERE p.primary_category = 'painting'
ON CONFLICT (provider_id, category, material_type) DO NOTHING;

INSERT INTO provider_materials (provider_id, category, material_type, expertise_level, brand_names, style_specialties, color_expertise) 
SELECT 
    p.id,
    'furniture',
    'upholstery',
    'expert',
    ARRAY['Leather Craft', 'Sunbrella', 'Crypton'],
    ARRAY['modern', 'mid-century', 'contemporary'],
    ARRAY['neutral', 'dark', 'bold']
FROM providers p WHERE p.primary_category = 'furniture'
ON CONFLICT (provider_id, category, material_type) DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_providers_category ON providers(primary_category);
CREATE INDEX IF NOT EXISTS idx_providers_location ON providers(city, state, zip_code);
CREATE INDEX IF NOT EXISTS idx_providers_rating ON providers(avg_rating DESC);
CREATE INDEX IF NOT EXISTS idx_providers_trust_score ON providers(avg_rating, on_time_percentage, jobs_completed);
CREATE INDEX IF NOT EXISTS idx_provider_materials_category ON provider_materials(category, material_type);
CREATE INDEX IF NOT EXISTS idx_provider_materials_expertise ON provider_materials(expertise_level, category);

-- Views for common queries
CREATE OR REPLACE VIEW provider_trust_scores AS
SELECT 
    p.id,
    p.name,
    p.primary_category,
    p.avg_rating,
    p.jobs_completed,
    p.on_time_percentage,
    p.response_time_hours,
    p.years_in_business,
    -- Calculate weighted trust score
    LEAST(100, GREATEST(0,
        (p.avg_rating / 5.0 * (SELECT weight FROM trust_weights WHERE component = 'avg_rating') * 100) +
        (LEAST(p.jobs_completed, 100) / 100.0 * (SELECT weight FROM trust_weights WHERE component = 'completion_rate') * 100) +
        (p.on_time_percentage / 100.0 * (SELECT weight FROM trust_weights WHERE component = 'on_time_rate') * 100) +
        (GREATEST(0, 1 - (p.response_time_hours / 24.0)) * (SELECT weight FROM trust_weights WHERE component = 'response_time') * 100) +
        (LEAST(p.years_in_business, 20) / 20.0 * (SELECT weight FROM trust_weights WHERE component = 'experience_years') * 100) +
        (CASE WHEN p.background_check_status = 'verified' THEN (SELECT weight FROM trust_weights WHERE component = 'background_verified') * 100 ELSE 0 END) +
        (CASE WHEN p.insurance_verified THEN (SELECT weight FROM trust_weights WHERE component = 'insurance_verified') * 100 ELSE 0 END) +
        (CASE WHEN p.license_verified THEN (SELECT weight FROM trust_weights WHERE component = 'license_verified') * 100 ELSE 0 END)
    )) AS trust_score
FROM providers p
WHERE p.status = 'active';

-- Material expertise query view
CREATE OR REPLACE VIEW provider_material_expertise AS
SELECT 
    p.id as provider_id,
    p.name,
    p.primary_category,
    pm.category as material_category,
    pm.material_type,
    pm.expertise_level,
    pm.brand_names,
    pm.style_specialties,
    pm.color_expertise,
    pts.trust_score
FROM providers p
JOIN provider_materials pm ON p.id = pm.provider_id
JOIN provider_trust_scores pts ON p.id = pts.id
WHERE p.status = 'active'
ORDER BY pts.trust_score DESC, p.avg_rating DESC;
