// src/lib/trustScoring.ts

/**
 * BookLocal Trust Scoring (Node/Next-ready, no external deps)
 * - Deterministic, unit-testable math
 * - Exposes a single calculateTrustScore(...) plus helpful sub-scores + badges
 */

export type ProviderMetrics = {
  // Quality
  avg_rating: number;          // 0..5
  total_reviews: number;       // 0..∞
  repeat_client_rate?: number; // 0..1 (optional)

  // Reliability
  on_time_percentage: number;  // 0..100
  cancellation_rate?: number;  // 0..1 (optional, lower is better)

  // Experience & Compliance
  years_in_business: number;   // 0..∞
  background_check_status?: 'verified'|'pending'|'failed';
  insurance_verified?: boolean;
  license_verified?: boolean;
  team_size?: number;          // optional

  // Responsiveness
  response_time_hours: number; // typical 0.5..48

  // Volume / Social proof
  jobs_completed?: number;     // 0..∞
};

export type ScoreBreakdown = {
  reliability: number;
  quality: number;
  experience: number;
  responsiveness: number;
  compliance: number; // background/license/insurance
  social_proof: number; // reviews volume effect
  weighted_total: number; // 0..100
  weights: typeof WEIGHTS;
};

export type Badge =
  | 'Top Rated'
  | 'Speedy Responder'
  | 'On-Time Pro'
  | 'Licensed & Insured'
  | 'Customer Favorite'
  | 'Experienced Team';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Linear normalize into 0..1 (optionally inverted) */
const norm = (value: number, min: number, max: number, invert = false) => {
  if (Number.isNaN(value)) return 0;
  const n = clamp((value - min) / (max - min || 1), 0, 1);
  return invert ? 1 - n : n;
};

/** Smooth saturation for "counts" like reviews/jobs (0..1) */
const smoothVolume = (count: number, pivot = 50) => {
  // 0 at 0 reviews, ~0.5 at pivot, → 1 as it grows big
  return clamp(count / (count + pivot), 0, 1);
};

/**
 * Weights tuned to your earlier SQL view (close, but practical for app use).
 * Sum doesn't need to be 1; we normalize at the end.
 */
export const WEIGHTS = {
  quality: 0.25,         // rating + repeat clients
  reliability: 0.20,     // on-time + (1 - cancellations)
  responsiveness: 0.10,  // faster replies → higher
  experience: 0.08,      // years + team size
  compliance: 0.18,      // background + insurance + license
  social_proof: 0.19,    // review volume + jobs completed
} as const;

/** Subscores (0..100 each) */
export function calculateQualityScore(m: ProviderMetrics): number {
  const rating = norm(m.avg_rating, 3, 5); // protect low-volume outliers
  const repeats = norm(m.repeat_client_rate ?? 0, 0, 0.6); // 60% repeat is elite
  return 100 * (0.8 * rating + 0.2 * repeats);
}

export function calculateReliabilityScore(m: ProviderMetrics): number {
  const onTime = norm(m.on_time_percentage, 70, 99.5);
  const cancelInv = norm(m.cancellation_rate ?? 0, 0, 0.25, true); // <5% great, >25% poor
  return 100 * (0.7 * onTime + 0.3 * cancelInv);
}

export function calculateResponsivenessScore(m: ProviderMetrics): number {
  // 0.5h → great, 48h → poor
  const fast = norm(m.response_time_hours, 0.5, 48, true);
  return 100 * fast;
}

export function calculateExperienceScore(m: ProviderMetrics): number {
  const years = norm(m.years_in_business, 0, 20);
  const team = norm(m.team_size ?? 1, 1, 20); // cap benefit
  return 100 * (0.8 * years + 0.2 * team);
}

export function calculateComplianceScore(m: ProviderMetrics): number {
  const bg =
    m.background_check_status === 'verified' ? 1 :
    m.background_check_status === 'failed' ? 0 : 0.4; // pending → partial credit
  const ins = m.insurance_verified ? 1 : 0;
  const lic = m.license_verified ? 1 : 0;
  return 100 * (0.45 * bg + 0.3 * ins + 0.25 * lic);
}

export function calculateSocialProofScore(m: ProviderMetrics): number {
  const reviewMass = smoothVolume(m.total_reviews);     // 0..1
  const jobsMass = smoothVolume(m.jobs_completed ?? 0); // 0..1
  return 100 * (0.6 * reviewMass + 0.4 * jobsMass);
}

/** Final score (0..100) + breakdown */
export function calculateTrustScore(m: ProviderMetrics): ScoreBreakdown {
  const quality = calculateQualityScore(m);
  const reliability = calculateReliabilityScore(m);
  const responsiveness = calculateResponsivenessScore(m);
  const experience = calculateExperienceScore(m);
  const compliance = calculateComplianceScore(m);
  const social_proof = calculateSocialProofScore(m);

  const totalWeight = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);

  const weighted_total =
    (
      quality * WEIGHTS.quality +
      reliability * WEIGHTS.reliability +
      responsiveness * WEIGHTS.responsiveness +
      experience * WEIGHTS.experience +
      compliance * WEIGHTS.compliance +
      social_proof * WEIGHTS.social_proof
    ) / totalWeight;

  return {
    quality,
    reliability,
    responsiveness,
    experience,
    compliance,
    social_proof,
    weighted_total: clamp(weighted_total, 0, 100),
    weights: WEIGHTS,
  };
}

/** Badges for UI ribbons / trust meter labels */
export function generateBadges(m: ProviderMetrics, breakdown?: ScoreBreakdown): Badge[] {
  const out: Badge[] = [];

  if (m.avg_rating >= 4.8 && (m.total_reviews ?? 0) >= 40) out.push('Top Rated');
  if (m.response_time_hours <= 2) out.push('Speedy Responder');
  if (m.on_time_percentage >= 95) out.push('On-Time Pro');
  if (m.license_verified && m.insurance_verified) out.push('Licensed & Insured');
  if ((m.repeat_client_rate ?? 0) >= 0.35) out.push('Customer Favorite');
  if (m.years_in_business >= 8 || (m.team_size ?? 1) >= 6) out.push('Experienced Team');

  // De-dupe just in case
  return Array.from(new Set(out));
}

/** Convenience: one-call utility for UI */
export function scoreWithBadges(m: ProviderMetrics) {
  const breakdown = calculateTrustScore(m);
  const badges = generateBadges(m, breakdown);
  return { breakdown, badges };
}
