// Server Component Schemas (for use in Server Components)
// Use these in app directory pages that are Server Components

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobmeter.app';

// =============================================
// SITE-WIDE SCHEMAS (Homepage, etc.)
// =============================================

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'JobMeter',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description:
      'AI-powered job discovery and matching platform connecting job seekers with employment opportunities worldwide.',
    sameAs: [
      'https://twitter.com/jobmeterapp',
      'https://www.linkedin.com/company/jobmeter',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'help.jobpilot@gmail.com',
      contactType: 'Customer Support',
      availableLanguage: 'English',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

interface SearchAction {
  target: string;
  queryInput: string;
}

export function WebSiteSchema({ searchAction }: { searchAction?: SearchAction } = {}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'JobMeter',
    url: siteUrl,
    description:
      'Find your dream job with AI-powered job matching. Search thousands of jobs, get personalized recommendations, and apply with confidence.',
    ...(searchAction && {
      potentialAction: {
        '@type': 'SearchAction',
        target: searchAction.target,
        'query-input': searchAction.queryInput,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbListSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

// ===========================================================
// REMOVED: ❌ JobPostingSchema (you already generate this in mapJobToSchema.ts)
// ===========================================================

// =============================================
// BLOG ARTICLE SCHEMA
// =============================================

interface ArticleSchemaProps {
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author: {
    name: string;
    url?: string;
  };
  publisher?: {
    name: string;
    logo?: string;
  };
  url: string;
}

export function ArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author,
  publisher = {
    name: 'JobMeter',
    logo: `${siteUrl}/logo.png`,
  },
  url,
}: ArticleSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    image: image || `${siteUrl}/logo.png`,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: author.name,
      ...(author.url && { url: author.url }),
    },
    publisher: {
      '@type': 'Organization',
      name: publisher.name,
      logo: {
        '@type': 'ImageObject',
        url: publisher.logo,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

// =============================================
// BLOG LISTING SCHEMA
// =============================================

export function BlogSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'JobMeter Career Blog',
    description: 'Expert career advice, salary guides, and job search tips for Nigerian professionals',
    url: `${siteUrl}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'JobMeter',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

// =============================================
// COMPANY SCHEMA
// =============================================

interface CompanySchemaProps {
  name: string;
  description: string;
  url?: string;
  logo?: string;
  address?: string;
  sameAs?: string[];
}

export function CompanySchema({
  name,
  description,
  url,
  logo,
  address,
  sameAs,
}: CompanySchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    description,
    url: url || siteUrl,
    logo: logo || `${siteUrl}/logo.png`,
    ...(address && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: address,
      },
    }),
    ...(sameAs && sameAs.length > 0 && { sameAs }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

// =============================================
// ITEM LIST SCHEMA
// =============================================

interface ItemListSchemaProps {
  name: string;
  description: string;
  numberOfItems: number;
  url: string;
  itemType?: 'Organization' | 'Article';
  items?: Array<{
    name: string;
    url: string;
  }>;
}

export function ItemListSchema({
  name,
  description,
  numberOfItems,
  url,
  itemType = 'Organization',
  items = [],
}: ItemListSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    numberOfItems,
    url,
    itemListElement: items.slice(0, 10).map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': itemType,
        name: item.name,
        url: item.url,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

// =============================================
// FAQ SCHEMA
// =============================================

interface FAQ {
  question: string;
  answer: string;
}

export function FAQSchema({ faqs }: { faqs: FAQ[] }) {
  if (!faqs || faqs.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}
