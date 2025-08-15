/** @type {import('next').NextConfig} */

const reportOnly = false; // flip to true if you want to test first

// Allow Next.js inline styles/scripts used for hydration/runtime,
// Supabase (https + wss), Stripe, Google Fonts, Vercel analytics.
// Keep images open to blob/data for Next/Image and OGs.
const csp = `
  default-src 'self';
  base-uri 'self';
  object-src 'none';
  frame-ancestors 'none';

  img-src 'self' blob: data: https://images.stripe.com https://avatars.githubusercontent.com https://*.vercel-insights.com *;

  font-src 'self' https://fonts.gstatic.com;

  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;

  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.vercel-insights.com;

  connect-src 'self'
    https://*.supabase.co wss://*.supabase.co
    https://*.supabase.in wss://*.supabase.in
    https://api.stripe.com https://js.stripe.com
    https://*.vercel-insights.com https://vitals.vercel-insights.com
    https://*.vercel.app https://*.vercel.dev;

  frame-src 'self' https://js.stripe.com;

  form-action 'self';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

const headerName = reportOnly
  ? 'Content-Security-Policy-Report-Only'
  : 'Content-Security-Policy';

const nextConfig = {
  typescript: {
    // Allow production builds to successfully complete even with TypeScript errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow production builds to successfully complete even with ESLint errors
    ignoreDuringBuilds: true,
  },
  
  async headers() {
    return [
      // Global security headers (no Cache-Control here; set per-static assets below)
      {
        source: '/:path*',
        headers: [
          { key: headerName, value: csp },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'geolocation=(), camera=(), microphone=(), payment=(self)' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
        ],
      },
      // Long-cache only for build output & public assets, not HTML
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/(.*).(css|js|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      // API responses should not be cached
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },

  productionBrowserSourceMaps: false,

  experimental: {
    optimizeCss: true,
  },
};

// ---- Sentry (keep as wrapper of the final config) ----
const { withSentryConfig } = require('@sentry/nextjs');
module.exports = withSentryConfig(nextConfig, {
  org: 'booklocal',
  project: 'javascript-nextjs',
  silent: !process.env.CI,
  widenClientFileUpload: false,
  tunnelRoute: process.env.NODE_ENV === 'development' ? '/monitoring' : undefined,
  disableLogger: process.env.NODE_ENV === 'production',
  automaticVercelMonitors: true,
  hideSourceMaps: true,
  debug: process.env.NODE_ENV === 'development',
});

export default nextConfig;
