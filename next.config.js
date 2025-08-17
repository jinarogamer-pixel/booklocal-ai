// next.config.js
const isDev = process.env.NODE_ENV !== 'production';

const cspProd = `
  default-src 'self';
  base-uri 'self';
  object-src 'none';
  frame-ancestors 'none';
  img-src 'self' data: blob: https://images.stripe.com https://avatars.githubusercontent.com https://*.vercel-insights.com;
  font-src 'self' https://fonts.gstatic.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  frame-src https://js.stripe.com;
  script-src 'self' https://js.stripe.com https://*.vercel-insights.com;
  connect-src 'self'
    https://*.supabase.co wss://*.supabase.co
    https://api.stripe.com https://js.stripe.com
    https://api.openai.com
    https://*.vercel-insights.com https://vitals.vercel-insights.com
    ${isDev ? "http://localhost:3000 ws://localhost:3000 ws://localhost:3001 blob:" : ""};
  form-action 'self';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

const cspDev = `
  default-src 'self' blob: data:;
  img-src 'self' data: blob:;
  font-src 'self' https://fonts.gstatic.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  connect-src * ws: wss:;
`.replace(/\s{2,}/g, ' ').trim();

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: isDev ? cspDev : cspProd },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'geolocation=(), camera=(), microphone=(), payment=(self)' },
        ],
      },
    ];
  },

  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
  productionBrowserSourceMaps: false,

  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
  },
};

  const { withSentryConfig } = require("@sentry/nextjs");
module.exports = withSentryConfig(nextConfig, {
  org: "booklocal",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: false,
  tunnelRoute: isDev ? "/monitoring" : undefined,
  disableLogger: !isDev,
  automaticVercelMonitors: true,
  hideSourceMaps: true,
  debug: isDev,
});
