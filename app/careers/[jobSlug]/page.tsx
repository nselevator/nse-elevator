import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TrustBadgesBar } from '../../../components/TrustBadgesBar';
import { JsonLd } from '../../../components/JsonLd';
import { getCareers, getCareerBySlug } from '../../../lib/api';

export const revalidate = 3600; // ISR: 1 hour

export async function generateStaticParams() {
  const jobs = await getCareers();
  return (jobs || []).map((j) => ({
    jobSlug: j.slug,
  }));
}

export async function generateMetadata({ params }: { params: { jobSlug: string } }): Promise<Metadata> {
  const job = await getCareerBySlug(params.jobSlug);
  if (!job) return { title: 'Job Not Found | NSE – New Sahyadri Elevator' };
  return {
    title: `${job.title} | NSE Careers`,
    description: job.description,
  };
}

export default async function JobDetailPage({ params }: { params: { jobSlug: string } }) {
  const job = await getCareerBySlug(params.jobSlug);

  if (!job) {
    notFound();
  }

  // Schema.org JobPosting Structured Data
  const jobPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.datePosted,
    employmentType: job.employmentType,
    hiringOrganization: {
      '@type': 'Organization',
      name: 'NSE – New Sahyadri Elevator',
      sameAs: 'https://www.newsahyadrielevator.com',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        streetAddress: job.location,
        addressLocality: job.city,
        addressRegion: job.state,
        addressCountry: 'IN',
      },
    },
    baseSalary: job.salaryRange
      ? {
          '@type': 'MonetaryAmount',
          currency: 'INR',
          value: {
            '@type': 'QuantitativeValue',
            minValue: job.salaryRange.min,
            maxValue: job.salaryRange.max,
            unitText: 'YEAR',
          },
        }
      : undefined,
  };

  return (
    <div className="w-full bg-surface-50">
      <JsonLd schema={jobPostingSchema} />

      <section className="bg-steel-950 text-white py-16 sm:py-20 border-b border-steel-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-2 text-xs font-mono text-steel-400">
              <li><Link href="/" prefetch={true} className="hover:text-white">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/careers" prefetch={true} className="hover:text-white">Careers</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-steel-200 font-semibold">{job.title}</li>
            </ol>
          </nav>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-emergency-500 block mb-2">
            Career Opportunity • {job.city}, {job.state}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
            {job.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-mono text-steel-300">
            {job.salaryRange && (
              <span>Compensation: <strong className="text-white">{job.salaryRange.display}</strong></span>
            )}
            <span>•</span>
            <span>Location: <strong className="text-white">{job.location}</strong></span>
          </div>
        </div>
      </section>

      <TrustBadgesBar />

      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div data-card-unit className="bg-white border border-steel-300 p-8 rounded-sm shadow-milled space-y-6">
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-steel-950 mb-3">Key Responsibilities:</h2>
              <ul className="space-y-2 text-xs sm:text-sm text-steel-600">
                {job.responsibilities.map((r: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emergency-500 font-bold">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {job.qualifications && job.qualifications.length > 0 && (
            <div className="pt-6 border-t border-steel-200">
              <h2 className="text-base font-bold text-steel-950 mb-3">Qualifications &amp; Experience:</h2>
              <ul className="space-y-2 text-xs sm:text-sm text-steel-600">
                {job.qualifications.map((q: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-safety-500 font-bold">✓</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-6 border-t border-steel-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-steel-900 block">Interested in applying?</span>
              <span className="text-xs text-steel-500">Send resumes confidentially to office.pune@nsei.in</span>
            </div>
            <a
              href="mailto:office.pune@nsei.in?subject=Application%20for%20Role"
              className="bg-emergency-500 hover:bg-emergency-600 text-white font-mono font-bold text-xs px-6 py-3 rounded-sm"
            >
              Submit Application →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
