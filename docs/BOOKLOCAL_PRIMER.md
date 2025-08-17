# BookLocal Primer

**Mission:** Dribbble-grade marketplace for local services with AI matching + 3D finish previews.

**Stack:** Next.js 14 (App Router, TS), Tailwind, Supabase (auth/db/realtime), Sentry, Framer Motion, GSAP ScrollTrigger, R3F + drei. Strict CSP.

**Landing MVP (public)**  
- Hero: `TypewriterHeadline`, `TrustMeter`, `RoomViewer` (wood/tile/concrete).  
- CTA opens `PostProjectSheet` → writes to `projects`.  
- Scroll storytelling (GSAP ScrollTrigger) with masked image reveals.  
- Lazy-load 3D/GSAP. No dashboards public.

**Data**  
- `projects` (title, description, category, location, budget_min/max, email/phone, status)  
- `providers`, `provider_materials`, view `provider_trust_scores` (computed score)

**Perf/Security**  
- Respect CSP in `next.config.js`.  
- No external scripts beyond Stripe/Supabase already whitelisted.  
- Defer heavy assets. Pre-render above-the-fold.  
- Sentry for error capture.
