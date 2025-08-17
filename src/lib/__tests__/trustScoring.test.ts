// src/lib/__tests__/trustScoring.test.ts
import { calculateTrustScore, scoreWithBadges, ProviderMetrics } from '../trustScoring';

describe('trust scoring', () => {
  const sampleProvider: ProviderMetrics = {
    avg_rating: 4.9,
    total_reviews: 200,
    repeat_client_rate: 0.4,
    on_time_percentage: 98,
    cancellation_rate: 0.02,
    years_in_business: 10,
    background_check_status: 'verified',
    insurance_verified: true,
    license_verified: true,
    team_size: 8,
    response_time_hours: 2,
    jobs_completed: 350,
  };

  it('produces a sane 0..100 score for excellent provider', () => {
    const { breakdown } = scoreWithBadges(sampleProvider);
    expect(breakdown.weighted_total).toBeGreaterThan(80);
    expect(breakdown.weighted_total).toBeLessThanOrEqual(100);
  });

  it('generates appropriate badges for excellent provider', () => {
    const { badges } = scoreWithBadges(sampleProvider);
    expect(badges).toContain('Top Rated');
    expect(badges).toContain('Licensed & Insured');
    expect(badges).toContain('On-Time Pro');
    expect(badges).toContain('Customer Favorite');
    expect(badges).toContain('Experienced Team');
  });

  it('handles poor provider metrics gracefully', () => {
    const poorProvider: ProviderMetrics = {
      avg_rating: 2.1,
      total_reviews: 5,
      on_time_percentage: 60,
      years_in_business: 1,
      background_check_status: 'failed',
      insurance_verified: false,
      license_verified: false,
      response_time_hours: 48,
      jobs_completed: 12,
    };

    const { breakdown, badges } = scoreWithBadges(poorProvider);
    expect(breakdown.weighted_total).toBeLessThan(40);
    expect(badges.length).toBe(0); // No badges for poor performance
  });

  it('individual scoring functions work correctly', () => {
    const breakdown = calculateTrustScore(sampleProvider);
    
    expect(breakdown.quality).toBeGreaterThan(80); // High rating + good repeat rate
    expect(breakdown.reliability).toBeGreaterThan(90); // Excellent on-time + low cancellation
    expect(breakdown.responsiveness).toBeGreaterThan(90); // 2h response is excellent
    expect(breakdown.compliance).toBe(100); // All verified
    expect(breakdown.social_proof).toBeGreaterThan(80); // High volume of reviews/jobs
  });
});
