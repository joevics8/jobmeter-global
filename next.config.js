const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */

// ─── Country slug list (must match COUNTRY_SLUG_MAP display values lowercased) ─
// Used by the redirect regex to distinguish country segments from job slugs.
const KNOWN_COUNTRY_SLUGS = [
  'usa','uk','uae','australia','canada','ireland','germany','france',
  'netherlands','spain','italy','portugal','belgium','switzerland','austria',
  'sweden','norway','denmark','finland','poland','czech-republic','hungary',
  'romania','bulgaria','greece','turkey','ukraine','russia','luxembourg',
  'malta','cyprus','croatia','serbia','slovakia','slovenia','estonia',
  'latvia','lithuania','iceland','saudi-arabia','qatar','kuwait','bahrain',
  'oman','jordan','israel','lebanon','iraq','iran','yemen','india','china',
  'japan','south-korea','indonesia','malaysia','singapore','thailand',
  'vietnam','philippines','pakistan','bangladesh','sri-lanka','nepal',
  'myanmar','cambodia','hong-kong','taiwan','kazakhstan','new-zealand',
  'papua-new-guinea','fiji','nigeria','ghana','kenya','south-africa',
  'ethiopia','tanzania','uganda','rwanda','senegal','ivory-coast','cameroon',
  'egypt','morocco','zambia','zimbabwe','mozambique','angola','namibia',
  'botswana','brazil','argentina','colombia','chile','peru','venezuela',
  'mexico','costa-rica','panama','jamaica','trinidad-and-tobago','barbados',
  'nigeria','guinea','sierra-leone','liberia','togo','benin','gabon',
  'congo','dr-congo','eritrea','djibouti','gambia','guinea-bissau',
  'equatorial-guinea','cape-verde','sao-tome-and-principe','lesotho',
  'eswatini','comoros','burundi','car','south-sudan','sudan','libya',
  'tunisia','algeria','mali','niger','chad','burkina-faso','mauritius',
  'seychelles','somalia','madagascar','malawi','mozambique','global',
];

const countryPattern = KNOWN_COUNTRY_SLUGS.join('|');

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
        // Cache new-style job detail pages: /jobs/[country]/[slug]
        source: '/jobs/:country/:slug',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, stale-while-revalidate=86400',
          },
          { key: 'Vary', value: '' },
        ],
      },
      {
        // Cache old-style job detail pages during redirect transition: /jobs/[slug]
        // Excludes known structural paths like /jobs/Location and /jobs/state
        source: '/jobs/:slug((?!Location|state)[^/]+)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, stale-while-revalidate=86400',
          },
          { key: 'Vary', value: '' },
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

  async redirects() {
    return [
      // ─── Existing redirects ────────────────────────────────────────────────
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

      // ─── Legacy job URL redirect ───────────────────────────────────────────
      // Redirects old /jobs/[slug] URLs (no country segment) to /jobs/global/[slug].
      // Only fires when the first path segment is NOT a known country slug,
      // NOT a structural path (Location, state), and NOT a two-segment path
      // already in the [country]/[slug] format.
      {
        source: `/jobs/:slug((?!(?:${countryPattern})(?:/|$))(?!Location|state)[^/]+)`,
        destination: '/jobs/global/:slug',
        permanent: true,
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