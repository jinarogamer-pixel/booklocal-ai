// ai/types.ts
export interface ProviderSearchResult {
  id: string;
  name: string;
  primary_category: string;
  city: string;
  state: string;
  description: string;
  similarity: number;
}

export interface RecommendationResult {
  id: string;
  name: string;
  primary_category: string;
  city: string;
  state: string;
  avg_rating: number;
  total_reviews: number;
  recommendation_score: number;
}

export interface ProjectBrief {
  scope: string;
  materials: string[];
  timeline_weeks: number;
  budget_low: number;
  budget_high: number;
  questions: string[];
}
