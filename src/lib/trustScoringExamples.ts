// Example usage of the new trustScoring module
// This would typically go in your search results or provider profile components

import { scoreWithBadges, ProviderMetrics } from '@/lib/trustScoring';

// Example: Convert a Supabase provider row to ProviderMetrics
export function rowToMetrics(row: Record<string, unknown>): ProviderMetrics {
  return {
    avg_rating: (row.avg_rating as number) ?? 0,
    total_reviews: (row.total_reviews as number) ?? 0,
    repeat_client_rate: (row.repeat_client_rate as number) ?? undefined,
    on_time_percentage: (row.on_time_percentage as number) ?? 0,
    cancellation_rate: (row.cancellation_rate as number) ?? undefined,
    years_in_business: (row.years_in_business as number) ?? 0,
    background_check_status: (row.background_check_status as 'verified' | 'pending' | 'failed') ?? 'pending',
    insurance_verified: !!(row.insurance_verified),
    license_verified: !!(row.license_verified),
    team_size: (row.team_size as number) ?? 1,
    response_time_hours: (row.response_time_hours as number) ?? 24,
    jobs_completed: (row.jobs_completed as number) ?? 0,
  };
}

// Example: Process search results with trust scores
export function enhanceProvidersWithTrustScores(providers: Array<Record<string, unknown>>) {
  return providers.map((row) => {
    const { breakdown, badges } = scoreWithBadges(rowToMetrics(row));
    return { 
      ...row, 
      trustScore: Math.round(breakdown.weighted_total), 
      trustBadges: badges,
      scoreBreakdown: breakdown 
    };
  });
}

// Example component usage:
/* 
function ProviderCard({ provider }) {
  const { trustScore, trustBadges } = provider;
  
  return (
    <div className="provider-card">
      <h3>{provider.business_name}</h3>
      <div className="trust-meter">
        <span className="score">{trustScore}/100</span>
        <div className="badges">
          {trustBadges.map(badge => (
            <span key={badge} className="badge">{badge}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
*/
