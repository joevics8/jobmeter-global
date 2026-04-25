'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Eye, ArrowRight } from 'lucide-react';
import React from 'react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  category: string | null;
  tags: string[] | null;
  published_at: string;
  view_count: number;
}

interface BlogPostsListProps {
  posts: BlogPost[];
}

export default function BlogPostsList({ posts }: BlogPostsListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post, index) => (
        <React.Fragment key={post.id}>
        <article
          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200 flex flex-col"
        >
          {/* Featured Image */}
          {post.featured_image_url && (
            <Link href={`/resources/${post.slug}`}>
              <div className="relative w-full h-48 bg-gray-200">
                <Image
                  src={post.featured_image_url}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
            </Link>
          )}

          {/* Content */}
          <div className="p-6 flex-1 flex flex-col">
            {/* Category */}
            {post.category && (
              <span className="inline-block text-xs font-semibold text-blue-600 mb-2">
                {post.category}
              </span>
            )}

            {/* Title */}
            <Link href={`/resources/${post.slug}`}>
              <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                {post.title}
              </h3>
            </Link>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                {post.excerpt}
              </p>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{formatDate(post.published_at)}</span>
                </div>
                {post.view_count > 0 && (
                  <div className="flex items-center gap-1">
                    <Eye size={14} />
                    <span>{post.view_count}</span>
                  </div>
                )}
              </div>
              <Link
                href={`/resources/${post.slug}`}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Read more
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </article>
      </React.Fragment>
      ))}
    </div>
  );
}








