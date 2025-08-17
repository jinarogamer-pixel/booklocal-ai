// src/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    // Public Supabase
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;

    // Private/Optional
    SUPABASE_SERVICE_ROLE_KEY?: string;
    SUPABASE_DB_URL?: string;
    SUPABASE_PROJECT?: string;

    // AI Services
    OPENAI_API_KEY?: string;
    ANTHROPIC_API_KEY?: string;

    // 3rd-party services
    NEXT_PUBLIC_SENTRY_DSN?: string;
    UPSTASH_REDIS_REST_TOKEN?: string;
    UPSTASH_REDIS_REST_URL?: string;

    // Feature flags
    NEXT_PUBLIC_ENABLE_3D?: 'true' | 'false';
    NEXT_PUBLIC_DEMO_MODE?: 'true' | 'false';
    NEXT_PUBLIC_FEATURE_SEARCH?: 'true' | 'false';
    FEATURE_REC_ENGINE?: 'true' | 'false';
    FEATURE_RAG_HELP?: 'true' | 'false';
    FEATURE_AI_BRIEF?: 'true' | 'false';
    FEATURE_MODERATION?: 'true' | 'false';

    // Other environment config
    NODE_ENV: 'development' | 'production' | 'test';
    VERCEL_ENV?: string;
  }
}
export {};
