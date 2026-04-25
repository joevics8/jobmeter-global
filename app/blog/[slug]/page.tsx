import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, Eye, Clock, Share2 } from 'lucide-react';
import { ArticleSchema, FAQSchema } from '@/components/seo/StructuredData';
import BlogMarkdownRenderer from '@/components/BlogMarkdownRenderer';
import AdUnit from '@/components/ads/AdUnit';
import BlogViewTracker from '@/components/BlogViewTracker';

// Render once per slug at first visit, cache forever.
// Cloudflare caches the HTML on top indefinitely.
export const revalidate = false;
export const dynamic = 'force-static';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  meta_title: string;
  meta_description: string;
  seo_keywords: string[] | null;
  h1_title: string;
  category: string | null;
  tags: string[] | null;
  author_name: string;
  author_image_url: string | null;
  faqs: any;
  related_posts: string[] | null;
  view_count: number;
  read_time_minutes: number | null;
  published_at: string;
  updated_at: string;
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const params = new URLSearchParams({
      select: '*',
      slug: `eq.${slug}`,
      is_published: 'eq.true',
      limit: '1',
    });

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/blogs?${params.toString()}`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        next: { revalidate: false },
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    return data[0] || null;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

function splitContentAtMidpoint(content: string): [string, string] {
  const mid = Math.floor(content.length / 2);
  const breakIndex = content.indexOf('\n\n', mid);
  if (breakIndex === -1) return [content, ''];
  return [content.slice(0, breakIndex + 2), content.slice(breakIndex + 2)];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getBlogPost(params.slug);
  if (!post) return { title: 'Post Not Found | JobMeter' };

  const keywords = post.seo_keywords?.join(', ') || 'career, jobs, blog';
  const url = `https://jobmeter.app/blog/${post.slug}`;

  return {
    title: post.meta_title,
    description: post.meta_description,
    keywords: keywords.split(',').map(k => k.trim()),
    authors: [{ name: post.author_name }],
    openGraph: {
      title: post.meta_title,
      description: post.meta_description,
      url,
      siteName: 'JobMeter',
      locale: 'en_US',
      type: 'article',
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      images: post.featured_image_url ? [{ url: post.featured_image_url }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.meta_title,
      description: post.meta_description,
      images: post.featured_image_url ? [post.featured_image_url] : [],
    },
    alternates: { canonical: url },
  };
}

export async function generateStaticParams() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/blogs?select=slug&is_published=eq.true`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((post: { slug: string }) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);
  if (!post) notFound();

  // View count is tracked client-side via BlogViewTracker below.
  // Previously incrementViewCount() was called here in the server render,
  // meaning every Cloudflare cache miss fired a Supabase RPC call at Vercel's cost.

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const [contentTop, contentBottom] = splitContentAtMidpoint(post.content);
  const hasMidContent = contentBottom.trim().length > 0;

  return (
    <>
      <ArticleSchema
        headline={post.h1_title}
        description={post.meta_description}
        image={post.featured_image_url || undefined}
        datePublished={post.published_at}
        dateModified={post.updated_at}
        author={{ name: post.author_name }}
        url={`https://jobmeter.app/blog/${post.slug}`}
      />

      {post.faqs && Array.isArray(post.faqs) && post.faqs.length > 0 && (
        <FAQSchema faqs={post.faqs} />
      )}

      {/* Tracks view count in browser — not on server render */}
      <BlogViewTracker slug={params.slug} />

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-blue-600">Blog</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium line-clamp-1">{post.title}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Blog
          </Link>

          {/* Article */}
          <article className="bg-white rounded-lg overflow-hidden">
            {/* Featured Image */}
            {post.featured_image_url && (
              <div className="relative w-full h-64 lg:h-80">
                <Image
                  src={post.featured_image_url}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <div className="p-6 lg:p-8">
              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {post.h1_title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  {post.author_image_url && (
                    <Image
                      src={post.author_image_url}
                      alt={post.author_name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-900">{post.author_name}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>{formatDate(post.published_at)}</span>
                </div>
                {post.read_time_minutes && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock size={16} />
                    <span>{post.read_time_minutes} min read</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Eye size={16} />
                  <span>{post.view_count} views</span>
                </div>
              </div>

              {/* 1. Top Ad */}
              <div className="mb-8 min-h-[280px] flex items-center justify-center bg-gray-50 rounded">
                <AdUnit slot="4198231153" format="auto" />
              </div>

              {/* Article Content — top half */}
              <BlogMarkdownRenderer content={hasMidContent ? contentTop : post.content} />

              {/* 2. Mid-article Ad */}
              {hasMidContent && (
                <>
                  <div className="my-10 min-h-[300px] flex items-center justify-center bg-gray-50 rounded">
                    <AdUnit slot="4690286797" format="fluid" layout="in-article" />
                  </div>
                  <BlogMarkdownRenderer content={contentBottom} />
                </>
              )}

              {/* 3. Ad Before FAQs */}
              <div className="my-10 min-h-[280px] flex items-center justify-center bg-gray-50 rounded">
                <AdUnit slot="9751041788" format="auto" />
              </div>

              {/* FAQs Section */}
              {post.faqs && Array.isArray(post.faqs) && post.faqs.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                    {post.faqs.map((faq: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{faq.question}</h3>
                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Share Section */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Share this article</span>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Share2 size={16} />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* Related Posts */}
          {post.related_posts && post.related_posts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <p className="text-gray-600">Related posts coming soon...</p>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Mobile Anchor Ad */}
        <div
          className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-100"
          style={{ height: '60px', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60px', overflow: 'hidden' }}>
            <AdUnit
              slot="3349195672"
              format="auto"
              style={{ display: 'block', width: '100%', height: '60px', maxHeight: '60px', overflow: 'hidden' }}
            />
          </div>
        </div>
      </div>
    </>
  );
}