import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TrustBadgesBar } from '../../../components/TrustBadgesBar';
import { FaqAccordion } from '../../../components/FaqAccordion';
import { JsonLd } from '../../../components/JsonLd';
import { getBlogPosts, getBlogPostBySlug } from '../../../lib/api';

export const revalidate = 3600; // ISR: 1 hour

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return (posts || []).map((p) => ({
    postSlug: p.slug,
  }));
}

export async function generateMetadata({ params }: { params: { postSlug: string } }): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.postSlug);
  if (!post) return { title: 'Article Not Found | NSE – New Sahyadri Elevator' };
  return {
    title: `${post.title} | NSE Technical Resource`,
    description: post.metaDescription,
  };
}

export default async function BlogPostPage({ params }: { params: { postSlug: string } }) {
  const post = await getBlogPostBySlug(params.postSlug);

  if (!post) {
    notFound();
  }

  // Schema.org Article
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    author: {
      '@type': 'Person',
      name: post.author,
      jobTitle: post.authorTitle,
    },
    publisher: {
      '@type': 'Organization',
      name: 'NSE – New Sahyadri Elevator',
      url: 'https://www.newsahyadrielevator.com',
    },
    datePublished: post.publishedAt || post.datePublished,
    dateModified: post.updatedAt || post.dateModified,
    mainEntityOfPage: `https://www.newsahyadrielevator.com/blog/${params.postSlug}`,
  };

  return (
    <div className="w-full bg-surface-50">
      <JsonLd schema={articleSchema} />

      <section className="bg-steel-950 text-white py-16 sm:py-24 border-b border-steel-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-2 text-xs font-mono text-steel-400">
              <li><Link href="/" prefetch={true} className="hover:text-white">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/blog" prefetch={true} className="hover:text-white">Blog</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-steel-200 font-semibold">{post.category}</li>
            </ol>
          </nav>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emergency-500 bg-emergency-500/10 px-2.5 py-0.5 rounded-sm">
              {post.category}
            </span>
            <span className="text-xs font-mono text-steel-400">{post.readingTime || '6 Min Read'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 mt-6 pt-6 border-t border-steel-800 text-xs font-mono text-steel-400">
            <span>Written by: <strong className="text-white">{post.author}</strong></span>
            <span>•</span>
            <span>{post.authorTitle}</span>
          </div>
        </div>
      </section>

      <TrustBadgesBar />

      <article className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div data-card-unit className="bg-white border border-steel-300 p-8 sm:p-12 rounded-sm shadow-milled space-y-8">
          {post.lead && (
            <p className="text-base sm:text-lg text-steel-800 font-medium leading-relaxed border-l-4 border-emergency-500 pl-4 text-justify">
              {post.lead}
            </p>
          )}

          {post.sections && (
            <div className="space-y-8 text-sm text-steel-600 leading-relaxed pt-4 border-t border-steel-100">
              {post.sections.map((sec: any, idx: number) => (
                <div key={idx} className="space-y-2">
                  <h2 className="text-lg font-bold text-steel-950">{sec.heading}</h2>
                  <p className="text-justify">{sec.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </article>

      {/* Automated FAQ Accordion */}
      {post.faqs && post.faqs.length > 0 && (
        <FaqAccordion items={post.faqs} title="Key Takeaways &amp; Questions Answered" />
      )}
    </div>
  );
}
