# High-Impact Tasks

1) Landing polish: micro-interactions (motion springs, magnetic buttons), masked reveals on scroll, headline tint synced to material.
2) Perf guardrails: suspense boundaries; defer 3D; avoid layout shift; only load GSAP when the section enters viewport.
3) Supabase wiring: `/api/estimate` mock → real table flow; `provider_trust_scores` view to TrustMeter; safe error paths.
4) DX: Add scripts `typecheck`, `lint`, `format`; optional pre-commit hook.
