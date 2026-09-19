'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { prefetchPayload } from '../lib/clientCache';

// API mapping for key routes to warm SWR data cache on hover
const ROUTE_API_MAP: Record<string, string> = {
  '/services': '/api/services',
  '/locations': '/api/locations',
  '/industries': '/api/industries',
  '/case-studies': '/api/case-studies',
  '/testimonials': '/api/testimonials',
  '/careers': '/api/careers',
  '/blog': '/api/blog',
};

/**
 * Global Intent & Hover Prefetch Provider
 * Detects pointer hover and keyboard focus on any internal link,
 * immediately prefetching route dynamic chunks and SWR cache payloads
 * ~100-300ms before click completes to eliminate perceived navigation latency.
 */
export function IntentPrefetchProvider() {
  const router = useRouter();
  const prefetchedRoutes = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefetchTarget = (href: string) => {
      if (!href) return;

      // Extract pathname without hash or query
      const cleanPath = href.split('#')[0].split('?')[0];

      // Ignore non-internal or anchor-only links
      if (
        !cleanPath.startsWith('/') ||
        cleanPath.startsWith('//') ||
        cleanPath.startsWith('/api') ||
        cleanPath === '/' || // Homepage is already in memory
        prefetchedRoutes.current.has(cleanPath)
      ) {
        return;
      }

      prefetchedRoutes.current.add(cleanPath);

      // 1. Prefetch Next.js route chunks
      try {
        router.prefetch(cleanPath);
      } catch {
        // Safe fallback
      }

      // 2. Prefetch API payload into SWR cache if matching route
      const apiEndpoint = ROUTE_API_MAP[cleanPath];
      if (apiEndpoint) {
        const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/api\/?$/, '');
        prefetchPayload(`${apiBase}${apiEndpoint}`);
      }
    };

    const handlePointerOrFocus = (e: Event) => {
      try {
        const rawTarget = e.target;
        if (!rawTarget) return;

        // Ensure we are operating on an Element (e.target can be Document, Window, or Text node)
        const element: Element | null =
          rawTarget instanceof Element
            ? rawTarget
            : (rawTarget as Node)?.parentElement instanceof Element
              ? (rawTarget as Node).parentElement
              : null;

        if (!element || typeof element.closest !== 'function') return;

        const link = element.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (href) {
          prefetchTarget(href);
        }
      } catch {
        // Fail-safe to guarantee zero interaction disruption
      }
    };

    // Defer prefetch listeners to avoid main-thread competition during initial paint
    const attachTimer = setTimeout(() => {
      document.addEventListener('pointerenter', handlePointerOrFocus, { passive: true, capture: true });
      document.addEventListener('focusin', handlePointerOrFocus, { passive: true });
      document.addEventListener('pointerdown', handlePointerOrFocus, { passive: true, capture: true });
    }, 1200);

    return () => {
      clearTimeout(attachTimer);
      document.removeEventListener('pointerenter', handlePointerOrFocus, { capture: true } as any);
      document.removeEventListener('focusin', handlePointerOrFocus);
      document.removeEventListener('pointerdown', handlePointerOrFocus, { capture: true } as any);
    };
  }, [router]);

  return null;
}
