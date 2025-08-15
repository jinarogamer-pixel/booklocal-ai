// Instant Quote Estimator - Rule + ML Hybrid
// High priority, high impact system

export interface QuoteRequest {
  category: string;
  location: string;
  projectSize: 'small' | 'medium' | 'large' | 'xl';
  description: string;
  urgency: 'standard' | 'urgent';
}

export interface QuoteEstimate {
  min: number;
  max: number;
  confidence: number; // 0-1
  factors: string[];
  timeline: string;
}

// Base pricing lookup tables (start with these, then ML enhance)
const BASE_PRICING = {
  lawn_care: { small: [80, 120], medium: [120, 200], large: [200, 350], xl: [350, 600] },
  handyman: { small: [100, 180], medium: [180, 320], large: [320, 550], xl: [550, 900] },
  plumbing: { small: [150, 250], medium: [250, 450], large: [450, 750], xl: [750, 1200] },
  electrical: { small: [180, 300], medium: [300, 520], large: [520, 850], xl: [850, 1400] },
  cleaning: { small: [60, 100], medium: [100, 160], large: [160, 280], xl: [280, 450] },
  painting: { small: [200, 350], medium: [350, 600], large: [600, 1000], xl: [1000, 1800] },
  roofing: { small: [500, 800], medium: [800, 1500], large: [1500, 3000], xl: [3000, 6000] },
  flooring: { small: [300, 500], medium: [500, 1000], large: [1000, 2000], xl: [2000, 4000] },
};

// Location multipliers (zip-based, expand with real data)
const LOCATION_MULTIPLIERS = {
  high_cost: 1.3, // SF, NYC, Seattle
  medium_cost: 1.1, // Austin, Denver, Boston
  standard: 1.0,   // Most areas
  low_cost: 0.8,   // Rural, low COL areas
};

// Urgency multipliers
const URGENCY_MULTIPLIERS = {
  standard: 1.0,
  urgent: 1.25,
};

// Project size detection from description (simple keyword matching)
function detectProjectSize(description: string, category: string): QuoteRequest['projectSize'] {
  const desc = description.toLowerCase();
  
  // Size keywords
  const smallKeywords = ['small', 'minor', 'quick', 'simple', 'touch up', 'repair'];
  const largeKeywords = ['large', 'major', 'complete', 'full', 'entire', 'whole house'];
  const xlKeywords = ['mansion', 'commercial', 'office building', 'warehouse', 'multiple'];
  
  if (xlKeywords.some(kw => desc.includes(kw))) return 'xl';
  if (largeKeywords.some(kw => desc.includes(kw))) return 'large';
  if (smallKeywords.some(kw => desc.includes(kw))) return 'small';
  
  // Category-specific defaults
  if (['cleaning', 'lawn_care'].includes(category)) return 'medium';
  if (['roofing', 'flooring'].includes(category)) return 'large';
  
  return 'medium'; // Default
}

// Location cost tier detection (enhance with real zip code data)
function getLocationTier(location: string): keyof typeof LOCATION_MULTIPLIERS {
  const loc = location.toLowerCase();
  
  // High cost areas
  if (['san francisco', 'sf', '94102', '94103', 'new york', 'nyc', '10001', 'seattle', '98101'].some(area => loc.includes(area))) {
    return 'high_cost';
  }
  
  // Medium cost areas  
  if (['austin', 'denver', 'boston', 'chicago'].some(area => loc.includes(area))) {
    return 'medium_cost';
  }
  
  // Rural/low cost indicators
  if (['rural', 'small town', 'county'].some(indicator => loc.includes(indicator))) {
    return 'low_cost';
  }
  
  return 'standard';
}

export function generateQuote(request: QuoteRequest): QuoteEstimate {
  const { category, location, description, urgency } = request;
  
  // Auto-detect project size if not provided
  const projectSize = request.projectSize || detectProjectSize(description, category);
  
  // Get base pricing
  const basePricing = BASE_PRICING[category as keyof typeof BASE_PRICING] || BASE_PRICING.handyman;
  const [baseMin, baseMax] = basePricing[projectSize];
  
  // Apply multipliers
  const locationMultiplier = LOCATION_MULTIPLIERS[getLocationTier(location)];
  const urgencyMultiplier = URGENCY_MULTIPLIERS[urgency];
  
  const totalMultiplier = locationMultiplier * urgencyMultiplier;
  
  const min = Math.round(baseMin * totalMultiplier);
  const max = Math.round(baseMax * totalMultiplier);
  
  // Build factors explanation
  const factors: string[] = [];
  if (locationMultiplier > 1.0) factors.push(`Higher cost area (+${Math.round((locationMultiplier - 1) * 100)}%)`);
  if (locationMultiplier < 1.0) factors.push(`Lower cost area (${Math.round((1 - locationMultiplier) * 100)}% discount)`);
  if (urgencyMultiplier > 1.0) factors.push(`Urgent timeline (+${Math.round((urgencyMultiplier - 1) * 100)}%)`);
  factors.push(`${projectSize.charAt(0).toUpperCase() + projectSize.slice(1)} project scope`);
  
  // Timeline estimation
  const timelineMap = {
    small: '1-2 days',
    medium: '2-5 days', 
    large: '1-2 weeks',
    xl: '2-4 weeks'
  };
  
  // Confidence based on how well we can price this category
  const confidenceMap = {
    lawn_care: 0.9,
    handyman: 0.85,
    cleaning: 0.9,
    plumbing: 0.8,
    electrical: 0.8,
    painting: 0.85,
    roofing: 0.75,
    flooring: 0.8,
  };
  
  const confidence = confidenceMap[category as keyof typeof confidenceMap] || 0.7;
  
  return {
    min,
    max,
    confidence,
    factors,
    timeline: timelineMap[projectSize]
  };
}

// API endpoint helper
export async function handleQuoteRequest(
  category: string, 
  location: string, 
  description: string, 
  urgency: 'standard' | 'urgent' = 'standard'
): Promise<QuoteEstimate> {
  const request: QuoteRequest = {
    category,
    location, 
    description,
    projectSize: detectProjectSize(description, category),
    urgency
  };
  
  return generateQuote(request);
}
