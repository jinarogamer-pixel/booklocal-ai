const reportOnly = false; // enforce CSP immediately

const csp = `
  default-src 'self';
  base-uri 'self';
  object-src 'none';
  frame-ancestors 'none';
  img-src 'self' data: blob: https://images.stripe.com https://avatars.githubusercontent.com https://*.vercel-insights.com;
  font-src 'self' https://fonts.gstatic.com;
  style-src 'self' https://fonts.googleapis.com;
  frame-src 'self' https://js.stripe.com;
  script-src 'self' https://js.stripe.com https://*.vercel-insights.com;
  connect-src 'self' https://*.supabase.co https://*.supabase.in https://api.stripe.com https://js.stripe.com https://*.vercel-insights.com https://vitals.vercel-insights.com;
  form-action 'self';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

const headerName = reportOnly
  ? 'Content-Security-Policy-Report-Only'
  : 'Content-Security-Policy';

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: headerName, value: csp },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'geolocation=(), camera=(), microphone=(), payment=(self)' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // API-specific security headers
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },

  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },

  // Production optimizations and privacy
  productionBrowserSourceMaps: false,

  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
  },
};

module.exports = nextConfig;


// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  module.exports,
  {
    org: "booklocal",
    project: "javascript-nextjs",
    silent: !process.env.CI,
    widenClientFileUpload: false,
    tunnelRoute: process.env.NODE_ENV === 'development' ? "/monitoring" : undefined,
    disableLogger: process.env.NODE_ENV === 'production',
    automaticVercelMonitors: true,
    hideSourceMaps: true,
    debug: process.env.NODE_ENV === 'development',
  }
);
