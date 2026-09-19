import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TrustBadgesBar } from '../../../components/TrustBadgesBar';
import { FaqAccordion } from '../../../components/FaqAccordion';
import { DynamicQuoteCalculator as QuoteCalculatorForm } from '../../../components/DynamicQuoteCalculator';
import { JsonLd } from '../../../components/JsonLd';
import dynamic from 'next/dynamic';
import { getLocations, getLocationBySlug } from '../../../lib/api';

const ScrollDepthTracker = dynamic(
  () => import('../../../components/ScrollDepthTracker').then((mod) => mod.ScrollDepthTracker),
  { ssr: false }
);

export const revalidate = 3600; // ISR: 1 hour

export async function generateStaticParams() {
  const locations = await getLocations();
  return (locations || []).map((loc) => ({
    locationSlug: loc.slug,
  }));
}

export async function generateMetadata({ params }: { params: { locationSlug: string } }): Promise<Metadata> {
  const loc = await getLocationBySlug(params.locationSlug);
  if (!loc) return { title: 'Location Not Found | NSE – New Sahyadri Elevator' };
  return {
    title: loc.metaTitle || `${loc.cityName} Lift Maintenance & AMC | NSE`,
    description: loc.metaDescription || `24/7 Lift maintenance and repair in ${loc.cityName}. Call/WhatsApp +91 90499 94679.`,
  };
}

export default async function LocationPage({ params }: { params: { locationSlug: string } }) {
  const loc = await getLocationBySlug(params.locationSlug);

  if (!loc) {
    notFound();
  }

  // Schema.org LocalBusiness JSON-LD for Indian address
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: `NSE – New Sahyadri Elevator - ${loc.cityName}`,
    image: 'https://www.newsahyadrielevator.com/fleet.jpg',
    telephone: loc.branchPhone || '+91 90499 94679',
    priceRange: '₹₹₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: loc.branchAddress,
      addressLocality: loc.cityName,
      addressRegion: loc.state,
      addressCountry: 'IN',
    },
    geo: loc.coordinates
      ? {
          '@type': 'GeoCoordinates',
          latitude: loc.coordinates.latitude,
          longitude: loc.coordinates.longitude,
        }
      : undefined,
    areaServed: (loc.countiesServed || []).map((county: string) => ({
      '@type': 'AdministrativeArea',
      name: county,
    })),
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
  };

  return (
    <div className="w-full bg-slate-50 text-slate-800">
      <ScrollDepthTracker />
      {/* Reusable LocalBusiness Schema Injection */}
      <JsonLd schema={localBusinessSchema} />

      {/* Location Hero Block */}
      <section className="bg-gradient-to-b from-slate-100 via-white to-slate-50 text-slate-900 py-16 sm:py-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <nav aria-label="Breadcrumb" className="mb-4">
                <ol className="flex items-center gap-2 text-xs font-mono text-slate-500">
                  <li><Link href="/" prefetch={true} className="hover:text-slate-900 transition-colors">Home</Link></li>
                  <li aria-hidden="true">/</li>
                  <li><Link href="/locations" prefetch={true} className="hover:text-slate-900 transition-colors">Service Areas</Link></li>
                  <li aria-hidden="true">/</li>
                  <li className="text-slate-900 font-semibold">{loc.cityName}</li>
                </ol>
              </nav>

              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-brand-orange/30 rounded-full">
                <span className="w-2 h-2 rounded-full bg-brand-orange animate-ping" />
                <span className="text-[11px] font-mono font-bold tracking-wider text-brand-orange uppercase">
                  Local Hub Active: {loc.cityName}, {loc.state}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
                Lift Maintenance, AMC &amp; 24/7 Repair in{' '}
                <span className="text-brand-orange">
                  {loc.cityName}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl text-left">
                Experienced lift engineering team serving housing societies, commercial towers, and hospitals across {loc.cityName}. Rapid 24/7 emergency response and comprehensive preventative maintenance.
              </p>

              <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center lg:items-stretch xl:items-center gap-4 pt-4">
                <a
                  href={`tel:${(loc.branchPhone || '+91 90499 94679').replace(/[^0-9+]/g, '')}`}
                  className="min-h-[44px] bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold px-6 py-3.5 rounded-lg text-sm transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>🚨 Call / WhatsApp: {loc.branchPhone || '+91 90499 94679'}</span>
                </a>
                <a
                  href="#local-quote"
                  className="min-h-[44px] bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold px-6 py-3.5 rounded-lg text-sm shadow-xs flex items-center justify-center text-center transition-all cursor-pointer"
                >
                  Request Local AMC Bid
                </a>
              </div>
            </div>

            {/* Right: Local Hub Credentials Card */}
            <div className="lg:col-span-5">
              <div data-card-unit className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-md space-y-4">
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Field Dispatch Office</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{loc.cityName} Hub</h3>
                </div>

                <div className="text-xs space-y-3 font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Office Address:</span>
                    <span className="text-slate-800 font-sans">{loc.branchAddress}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Direct Dispatch Phone:</span>
                    <span className="text-brand-orange font-bold text-sm">{loc.branchPhone || '+91 90499 94679'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Emergency Response:</span>
                    <span className="text-slate-800 font-sans">24/7 Rapid Response Dispatch</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Field Engineering Team:</span>
                    <span className="text-slate-700 font-sans">Stationed Locally in {loc.cityName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Key Corridors Covered:</span>
                    <span className="text-slate-700 font-sans">{(loc.countiesServed || []).join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TrustBadgesBar />

      {/* Local FAQs */}
      {loc.localFaqs && loc.localFaqs.length > 0 && (
        <FaqAccordion
          items={loc.localFaqs}
          title={`Frequently Asked Questions in ${loc.cityName}`}
        />
      )}

      {/* Local Quote Capture */}
      <div id="local-quote">
        <QuoteCalculatorForm />
      </div>
    </div>
  );
}
