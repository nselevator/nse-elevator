import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import '../globals.css';
import { SiteLayoutManager } from '../components/SiteLayoutManager';
import { JsonLd } from '../components/JsonLd';
import { IntentPrefetchProvider } from '../components/IntentPrefetchProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'optional',
  preload: true,
  adjustFontFallback: true,
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'optional',
  preload: true,
  adjustFontFallback: true,
  variable: '--font-mono',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0B0F19',
};

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const hasGTM = Boolean(
  GTM_ID &&
  !GTM_ID.includes('XXXXXXX') &&
  !GTM_ID.toLowerCase().includes('placeholder')
);

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;
const hasClarity = Boolean(
  CLARITY_ID &&
  !CLARITY_ID.toLowerCase().includes('placeholder') &&
  CLARITY_ID !== 'clarity_placeholder_id'
);

export const metadata: Metadata = {
  title: 'NSE – New Sahyadri Elevator | Lift Maintenance, AMC & Repair in Navi Mumbai & Pune',
  description: 'Trusted partner for high-rise elevator operations — maintenance, repairs, modernization for residential societies and commercial complexes at ~30% lower cost than OEM direct. Call/WhatsApp +91 90499 94679.',
  metadataBase: new URL('https://www.newsahyadrielevator.com'),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'NSE – New Sahyadri Elevator',
  url: 'https://www.newsahyadrielevator.com',
  logo: 'https://www.newsahyadrielevator.com/logo.png',
  email: 'office.pune@nsei.in',
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: '+91-90499-94679',
      contactType: 'emergency dispatch and customer support',
      areaServed: 'IN',
      availableLanguage: ['en', 'mr', 'hi'],
    },
  ],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Airoli',
    addressLocality: 'Navi Mumbai',
    addressRegion: 'Maharashtra',
    postalCode: '400708',
    addressCountry: 'IN',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth overflow-x-hidden ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <head>
        {/* Google Tag Manager container script - non-blocking afterInteractive */}
        {hasGTM && (
          <Script
            id="google-tag-manager"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
            }}
          />
        )}
        {/* Microsoft Clarity session recording & heatmaps */}
        {hasClarity && (
          <Script
            id="microsoft-clarity"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `(function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${CLARITY_ID}");`,
            }}
          />
        )}
      </head>
      <body className={`min-h-full ${inter.className} bg-slate-50 font-sans text-slate-800 antialiased flex flex-col overflow-x-hidden`}>
        {/* Global Intent & Hover Prefetch Provider for 0ms Perceived Latency */}
        <IntentPrefetchProvider />

        {/* Google Tag Manager (noscript) */}
        {hasGTM && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}

        {/* Schema.org Organization Structured Data */}
        <JsonLd schema={organizationSchema} />

        {/* Layout Manager adapts for Guided Elevator cab homepage vs standard subpages */}
        <SiteLayoutManager>
          {children}
        </SiteLayoutManager>
      </body>
    </html>
  );
}
