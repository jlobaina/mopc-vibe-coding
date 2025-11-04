/** @type {import('next').NextConfig} */
const nextConfig = {
  // Move @prisma/client to serverExternalPackages for Next.js 15
  serverExternalPackages: ['@prisma/client'],
  // Enable React strict mode for better error handling
  reactStrictMode: true,
  // Handle proper module resolution
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude server-only modules from client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Configure headers for security
  async headers() {
    const headers = [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];

    // Add CORS headers for API routes only in production
    if (process.env.NODE_ENV === 'production') {
      headers.push({
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.ALLOWED_ORIGIN || process.env.NEXTAUTH_URL || process.env.APP_URL,
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, x-csrf-token, x-requested-with',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400', // 24 hours
          },
        ],
      });
    }

    return headers;
  },
};

module.exports = nextConfig;