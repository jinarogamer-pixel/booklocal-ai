// ai/index.ts - Main AI module exports
export { embed, embedBatch } from './search/embed';
export { isAllowedText, getModerationDetails } from './moderation/index';
export { generateProjectBrief } from './assist/brief';
export type { ProviderSearchResult, RecommendationResult, ProjectBrief } from './types';
