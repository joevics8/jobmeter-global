const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  transpilePackages: [
    'lucide-react',
    '@radix-ui/react-progress',
    '@radix-ui/react-icons',
    '@radix-ui/react-slot',
    'cmdk',
  ],
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'unsplash.com' },
    ],
  },

  async headers() {
    return [
      {
        // Cache job detail pages at CF edge for 24 hours.
        // Vary: '' strips Next.js RSC vary headers so CF can cache the response.
        // Without this, CF sees vary and marks the response as DYNAMIC (uncacheable).
        // Pattern excludes /jobs/Location and /jobs/state to avoid unintended matches.
        source: '/jobs/:slug((?!Location|state)[^/]+)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, stale-while-revalidate=86400',
          },
          {
            key: 'Vary',
            value: '',
          },
        ],
      },
      {
        // Cache country/location pages at edge for 24 hours
        source: '/jobs/Location/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // Cache resource/category pages at edge for 24 hours
        source: '/resources/:slug',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },

  // Fix 404 bot loops seen in Vercel logs
  async redirects() {
    return [
      {
        source: '/companies',
        destination: '/jobs',
        permanent: true,
      },
      {
        source: '/offline.html',
        destination: '/',
        permanent: false,
      },
    ];
  },

  webpack: (config, { dev, isServer }) => {
    if (!config.resolve.fallback) {
      config.resolve.fallback = {};
    }
    config.resolve.fallback.bufferutil = false;
    config.resolve.fallback['utf-8-validate'] = false;

    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }

    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);