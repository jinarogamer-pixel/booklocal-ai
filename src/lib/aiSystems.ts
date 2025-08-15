// AI Systems for BookLocal
// Priority order: Impact vs Effort analysis

export interface AISystem {
  name: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  effort: 'LOW' | 'MEDIUM' | 'HIGH';
  timeToValue: string;
  description: string;
  implementation: string[];
}

export const AI_SYSTEMS: AISystem[] = [
  {
    name: 'Instant Quote Estimator',
    priority: 'HIGH',
    impact: 'HIGH',
    effort: 'MEDIUM',
    timeToValue: '1-2 weeks',
    description: 'Rule-based + ML hybrid for instant price ranges on project posts',
    implementation: [
      'Build lookup tables by category/location',
      'Train gradient boosting model on historical pricing',
      'Create API endpoint for real-time estimates',
      'A/B test against manual estimates'
    ]
  },
  {
    name: 'Provider Trust Score',
    priority: 'HIGH',
    impact: 'HIGH',
    effort: 'LOW',
    timeToValue: '3-5 days',
    description: 'Weighted scoring: on-time rate + dispute-free + repeat customers + response time',
    implementation: [
      'Create provider_metrics table',
      'Build scoring algorithm (weighted)',
      'Update UI components (cards, hero)',
      'Add real-time updates'
    ]
  },
  {
    name: 'Smart Matching Engine',
    priority: 'HIGH',
    impact: 'HIGH',
    effort: 'MEDIUM',
    timeToValue: '1-2 weeks',
    description: 'Rank providers by skills + geo + availability + price history, nudge top 5',
    implementation: [
      'Provider skill tagging system',
      'Location/radius matching logic',
      'Availability calendar integration',
      'SMS/Push notification system'
    ]
  },
  {
    name: 'Fraud Detection Guard',
    priority: 'HIGH',
    impact: 'MEDIUM',
    effort: 'LOW',
    timeToValue: '2-3 days',
    description: 'Rules + scoring for VPN, geo anomalies, card fails, copy-paste descriptions',
    implementation: [
      'IP geolocation checks',
      'Device fingerprinting',
      'Text similarity detection',
      'Risk scoring dashboard'
    ]
  },
  {
    name: 'Dispute Triage Assistant',
    priority: 'MEDIUM',
    impact: 'HIGH',
    effort: 'MEDIUM',
    timeToValue: '1-2 weeks',
    description: 'Classify severity, recommend resolution paths, flag patterns',
    implementation: [
      'Dispute classification model',
      'Resolution workflow automation',
      'Pattern detection alerts',
      'Escalation triggers'
    ]
  },
  {
    name: 'Permit Requirements RAG',
    priority: 'MEDIUM',
    impact: 'MEDIUM',
    effort: 'MEDIUM',
    timeToValue: '2-3 weeks',
    description: 'Local permit FAQ retrieval + cost/time estimates',
    implementation: [
      'Scrape local government permit data',
      'Build vector embeddings for search',
      'Create permit cost database',
      'Integration with quote flow'
    ]
  },
  {
    name: 'Price Optimization Coach',
    priority: 'MEDIUM',
    impact: 'MEDIUM',
    effort: 'MEDIUM',
    timeToValue: '2-4 weeks',
    description: 'Suggest optimal pricing/timing based on demand patterns',
    implementation: [
      'Historical demand analysis',
      'Seasonal pricing models',
      'Real-time market conditions',
      'Provider coaching dashboard'
    ]
  },
  {
    name: 'Review Sentiment Analysis',
    priority: 'LOW',
    impact: 'MEDIUM',
    effort: 'LOW',
    timeToValue: '1 week',
    description: 'Auto-categorize review themes, surface improvement areas',
    implementation: [
      'Sentiment analysis API integration',
      'Theme extraction from reviews',
      'Provider feedback dashboard',
      'Alert system for negative trends'
    ]
  }
];

export function getHighPriorityAISystems(): AISystem[] {
  return AI_SYSTEMS.filter(system => system.priority === 'HIGH');
}

export function getQuickWinsAISystems(): AISystem[] {
  return AI_SYSTEMS.filter(system => 
    system.impact === 'HIGH' && system.effort === 'LOW'
  );
}
