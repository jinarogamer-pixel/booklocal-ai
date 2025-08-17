// src/lib/featureFlags.ts
export const featureFlags = {
  // AI Features
  semanticSearch: process.env.NEXT_PUBLIC_FEATURE_SEARCH === 'true',
  recommendations: process.env.FEATURE_REC_ENGINE === 'true',
  ragHelp: process.env.FEATURE_RAG_HELP === 'true',
  aiBreif: process.env.FEATURE_AI_BRIEF === 'true',
  moderation: process.env.FEATURE_MODERATION === 'true',
  
  // UI Features  
  enable3D: process.env.NEXT_PUBLIC_ENABLE_3D === 'true',
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
} as const;

export function isFeatureEnabled(feature: keyof typeof featureFlags): boolean {
  return featureFlags[feature] ?? false;
}

// Helper for conditional API calls
export function withFeature<T>(
  feature: keyof typeof featureFlags,
  enabledFn: () => T,
  disabledFn?: () => T
): T {
  if (isFeatureEnabled(feature)) {
    return enabledFn();
  }
  return disabledFn ? disabledFn() : (null as unknown as T);
}
