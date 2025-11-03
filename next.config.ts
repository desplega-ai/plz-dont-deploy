import type { NextConfig } from "next";
// Temporarily disabled due to Prisma bundling issue in Next.js 16
// See SETUP.md for details
// import { withWorkflow } from "workflow/next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  output: 'standalone',
  // Use webpack instead of Turbopack for Prisma compatibility
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("@prisma/client", "prisma");
    }
    return config;
  },
  // Empty turbopack config to acknowledge we're using webpack
  turbopack: {},

  // Security headers for production
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          // Content Security Policy
          // Note: Adjust this based on your actual needs, especially for AI features
          // Current policy allows:
          // - Inline styles (for Tailwind)
          // - External scripts from unpkg.com (Leaflet)
          // - External images and data URIs
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://unpkg.com",
              "style-src 'self' 'unsafe-inline' https://unpkg.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.vercel.ai https://*.openai.com https://*.anthropic.com https://*.openstreetmap.org",
              "frame-src 'self' https://*.openstreetmap.org",
              "frame-ancestors 'self'",
            ].join('; ')
          }
        ],
      },
    ];
  },
};

// export default withWorkflow(nextConfig);
export default nextConfig;
