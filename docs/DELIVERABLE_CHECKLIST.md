# Deliverable Checklist (Max Effort)

- [ ] `app/page.tsx` mounts RoomViewer (Finish-Swap), TypewriterHeadline, 3x TrustMeter, PostProjectSheet CTA.
- [ ] 3D & GSAP loaded via `next/dynamic` (no SSR).
- [ ] ScrollTrigger section with masked images + staggered copy.
- [ ] One TrustMeter live-wired to `provider_trust_scores` if Supabase envs exist; otherwise mocked but switchable.
- [ ] Lighthouse: no major CLS; verify LCP ok; images optimized.
- [ ] CSP passes in prod; no external scripts beyond allowed.
- [ ] `npm run typecheck` & `npm run lint` clean.
- [ ] Minimal unit test for trust scoring formatter + API guarded (rate limit or simple token).
