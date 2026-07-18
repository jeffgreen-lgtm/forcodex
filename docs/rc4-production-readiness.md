# CosmoScope RC4 — Production Readiness

Status: Implementation in progress

## Locked product baseline

RC2 visual treatment and RC3 conversion flow are approved. RC4 may harden, optimize, and clarify the release experience, but it must not redesign the product or expand paid scope.

## Implemented in this pass

- Production-grade global metadata, canonical URL, Open Graph, Twitter, viewport, and search directives
- Search-engine robots and sitemap routes
- Web app manifest metadata
- Keyboard skip navigation and shared focus-safe production styles
- Branded recoverable route error boundary
- Branded not-found recovery page

## Release gates

- `pnpm --filter @cosmoscope/web typecheck`
- `pnpm --filter @cosmoscope/web build`
- Confirm static export includes `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, and not-found output
- Verify `/`, `/app?mode=signup&source=landing`, `/app?mode=login`, `/reset`, and `/beta-feedback`
- Verify keyboard-only navigation and visible focus states
- Verify reduced-motion behavior
- Verify mobile layouts at 375px and 430px widths
- Verify production API origin and CORS configuration
- Verify signup, login, session restoration, password reset, chart load, and Today’s Brief fallback states
- Verify no secret values or local-only URLs are present in exported assets

## Deployment policy

RC4 remains isolated until the production build and release-gate checks pass. Do not deploy from a dirty working tree. Deploy the exact reviewed commit and record its SHA with the Cloudflare Pages release.
