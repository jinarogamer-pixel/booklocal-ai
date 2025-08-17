# Engineering Guardrails

- **CSP-safe:** Don't add external fonts/scripts unless added to CSP. Prefer self-hosted.
- **Lazy-load heavy libs:** `dynamic(() => import('three-thing'), { ssr:false })`, same for GSAP.
- **Small components, typed props:** Avoid giant page files. Split into `app/components/*`.
- **No private UIs on landing:** Any admin/provider analytics must be behind auth routes.
- **Type safety:** Fix imports/types before showing patches. Aim for `npx tsc --noEmit` clean.
- **DX:** Explain breaking changes and provide rollback hints in the PR description.
