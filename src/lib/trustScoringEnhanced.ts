/**
 * Enhanced Trust Scoring System with Database-Driven Weights
 * Calculates provider trustworthiness using configurable weighted metrics
 */

export interface TrustWeights {
  avg_rating: number;          // 25% - Customer satisfaction
  completion_rate: number;     // 20% - Job completion reliability  
  on_time_rate: number;       // 15% - Punctuality and deadline adherence
  response_time: number;      // 10% - Communication responsiveness
  experience_years: number;   // 8% - Years in business
  background_verified: number; // 7% - Background check status
  insurance_verified: number; // 6% - Insurance verification
  license_verified: number;   // 5% - License verification  
  cancellation_rate: number;  // 4% - Job cancellation rate (inverted)
  repeat_clients: number;     // 3% - Client retention rate
}

export interface ProviderMetrics {
  avg_rating: number;
  total_reviews: number;
  jobs_completed: number;
  jobs_cancelled: number;
  on_time_deliveries: number;
  response_time_hours: number;
  years_in_business: number;
  background_check_status: 'verified' | 'pending' | 'failed';
  insurance_verified: boolean;
  license_verified: boolean;
  repeat_client_count: number;
  total_client_count: number;
}

export interface TrustScore {
  overall: number;
  breakdown: {
    rating_score: number;
    reliability_score: number;
    experience_score: number;
    verification_score: number;
    communication_score: number;
  };
  badge: 'elite' | 'trusted' | 'verified' | 'new';
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  confidence_interval: [number, number];
}

// Default trust scoring weights (can be overridden from database)
const DEFAULT_WEIGHTS: TrustWeights = {
  avg_rating: 0.25,
  completion_rate: 0.20,
  on_time_rate: 0.15,
  response_time: 0.10,
  experience_years: 0.08,
  background_verified: 0.07,
  insurance_verified: 0.06,
  license_verified: 0.05,
  cancellation_rate: 0.04,
  repeat_clients: 0.03
};

/**
 * Calculate comprehensive trust score using weighted metrics
 */
export function calculateTrustScore(
  metrics: ProviderMetrics, 
  weights: TrustWeights = DEFAULT_WEIGHTS
): TrustScore {
  
  // Normalize individual metrics (0-1 scale)
  const rating_normalized = Math.max(0, (metrics.avg_rating - 1) / 4); // 1-5 scale to 0-1
  const completion_rate = Math.max(0, 1 - (metrics.jobs_cancelled / Math.max(1, metrics.jobs_completed)));
  const on_time_rate = metrics.on_time_deliveries / Math.max(1, metrics.jobs_completed);
  const response_score = Math.max(0, 1 - Math.min(1, metrics.response_time_hours / 24)); // 24hrs = 0, 0hrs = 1
  const experience_score = Math.min(1, metrics.years_in_business / 20); // Cap at 20 years
  const background_score = metrics.background_check_status === 'verified' ? 1 : 0;
  const insurance_score = metrics.insurance_verified ? 1 : 0;
  const license_score = metrics.license_verified ? 1 : 0;
  const cancellation_penalty = 1 - Math.min(0.5, (metrics.jobs_cancelled / Math.max(1, metrics.jobs_completed))); // Max 50% penalty
  const repeat_rate = metrics.repeat_client_count / Math.max(1, metrics.total_client_count);

  // Calculate component scores
  const rating_score = rating_normalized * weights.avg_rating * 100;
  const reliability_score = (
    completion_rate * weights.completion_rate + 
    on_time_rate * weights.on_time_rate + 
    cancellation_penalty * weights.cancellation_rate
  ) * 100;
  
  const experience_component = experience_score * weights.experience_years * 100;
  
  const verification_score = (
    background_score * weights.background_verified +
    insurance_score * weights.insurance_verified +
    license_score * weights.license_verified
  ) * 100;
  
  const communication_score = (
    response_score * weights.response_time +
    repeat_rate * weights.repeat_clients
  ) * 100;

  // Overall weighted score
  const overall = Math.min(100, Math.max(0,
    rating_score +
    reliability_score +
    experience_component +
    verification_score +
    communication_score
  ));

  // Determine badge and tier
  const badge = getBadge(overall, metrics);
  const tier = getTier(overall);
  
  // Calculate confidence interval based on sample size
  const confidence_interval = getConfidenceInterval(overall, metrics.total_reviews);

  return {
    overall: Math.round(overall * 10) / 10, // Round to 1 decimal
    breakdown: {
      rating_score: Math.round(rating_score * 10) / 10,
      reliability_score: Math.round(reliability_score * 10) / 10,
      experience_score: Math.round(experience_component * 10) / 10,
      verification_score: Math.round(verification_score * 10) / 10,
      communication_score: Math.round(communication_score * 10) / 10,
    },
    badge,
    tier,
    confidence_interval
  };
}

/**
 * Determine trust badge based on score and metrics
 */
function getBadge(score: number, metrics: ProviderMetrics): TrustScore['badge'] {
  if (score >= 90 && metrics.jobs_completed >= 50 && metrics.years_in_business >= 5) {
    return 'elite';
  }
  if (score >= 80 && metrics.jobs_completed >= 20) {
    return 'trusted';
  }
  if (score >= 70) {
    return 'verified';
  }
  return 'new';
}

/**
 * Determine tier based on overall score
 */
function getTier(score: number): TrustScore['tier'] {
  if (score >= 90) return 'platinum';
  if (score >= 80) return 'gold';
  if (score >= 70) return 'silver';
  return 'bronze';
}

/**
 * Calculate confidence interval based on sample size
 */
function getConfidenceInterval(score: number, sampleSize: number): [number, number] {
  if (sampleSize < 5) {
    return [Math.max(0, score - 15), Math.min(100, score + 15)];
  }
  if (sampleSize < 20) {
    return [Math.max(0, score - 8), Math.min(100, score + 8)];
  }
  if (sampleSize < 50) {
    return [Math.max(0, score - 5), Math.min(100, score + 5)];
  }
  return [Math.max(0, score - 3), Math.min(100, score + 3)];
}

/**
 * Get trust score display color based on score
 */
export function getTrustScoreColor(score: number): string {
  if (score >= 90) return '#10B981'; // emerald-500
  if (score >= 80) return '#3B82F6'; // blue-500
  if (score >= 70) return '#F59E0B'; // amber-500
  return '#EF4444'; // red-500
}

/**
 * Format trust score for display with appropriate precision
 */
export function formatTrustScore(score: number, showDecimal: boolean = true): string {
  if (showDecimal) {
    return score.toFixed(1);
  }
  return Math.round(score).toString();
}
