import {
  FALLBACK_SERVICES,
  FALLBACK_LOCATIONS,
  FALLBACK_INDUSTRIES,
  FALLBACK_CASE_STUDIES,
  FALLBACK_BLOG_POSTS,
  FALLBACK_CAREERS,
  FALLBACK_TESTIMONIALS,
} from './fallbackData';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof window !== 'undefined' ? '/api' : 'http://127.0.0.1:3000/api');

// Helper for standard API response unwrapping
async function fetchFromApi<T>(endpoint: string, fallbackData?: T): Promise<T | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 3600 }, // ISR: Revalidate every hour
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      if (res.status === 404) {
        return fallbackData !== undefined ? fallbackData : null;
      }
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }

    const json = await res.json();
    return (json.data as T) ?? (fallbackData !== undefined ? fallbackData : null);
  } catch (error) {
    clearTimeout(timeoutId);
    if (fallbackData !== undefined) {
      return fallbackData;
    }
    console.warn(`[API Client] Could not fetch ${endpoint}, returning fallback.`);
    return null;
  }
}

// 1. Services API
export async function getServices() {
  return fetchFromApi<any[]>('/services', FALLBACK_SERVICES);
}

export async function getServiceBySlug(slug: string) {
  const fallback = FALLBACK_SERVICES.find((s) => s.slug === slug) || null;
  return fetchFromApi<any>(`/services/${slug}`, fallback);
}

// 2. Locations API
export async function getLocations() {
  return fetchFromApi<any[]>('/locations', FALLBACK_LOCATIONS);
}

export async function getLocationBySlug(slug: string) {
  const fallback = FALLBACK_LOCATIONS.find((l) => l.slug === slug) || null;
  return fetchFromApi<any>(`/locations/${slug}`, fallback);
}

// 3. Industries API
export async function getIndustries() {
  return fetchFromApi<any[]>('/industries', FALLBACK_INDUSTRIES);
}

export async function getIndustryBySlug(slug: string) {
  const fallback = FALLBACK_INDUSTRIES.find((i) => i.slug === slug) || null;
  return fetchFromApi<any>(`/industries/${slug}`, fallback);
}

// 4. Case Studies API
export async function getCaseStudies() {
  return fetchFromApi<any[]>('/case-studies', FALLBACK_CASE_STUDIES);
}

export async function getCaseStudyBySlug(slug: string) {
  const fallback = FALLBACK_CASE_STUDIES.find((cs) => cs.slug === slug) || null;
  return fetchFromApi<any>(`/case-studies/${slug}`, fallback);
}

// 5. Blog API
export async function getBlogPosts() {
  return fetchFromApi<any[]>('/blog', FALLBACK_BLOG_POSTS);
}

export async function getBlogPostBySlug(slug: string) {
  const fallback = FALLBACK_BLOG_POSTS.find((b) => b.slug === slug) || null;
  return fetchFromApi<any>(`/blog/${slug}`, fallback);
}

// 6. Careers API
export async function getCareers() {
  return fetchFromApi<any[]>('/careers', FALLBACK_CAREERS);
}

export async function getCareerBySlug(slug: string) {
  const fallback = FALLBACK_CAREERS.find((c) => c.slug === slug) || null;
  return fetchFromApi<any>(`/careers/${slug}`, fallback);
}

// 7. Testimonials API
export async function getTestimonials() {
  return fetchFromApi<any[]>('/testimonials', FALLBACK_TESTIMONIALS);
}

// 8. Lead Capture API
export async function submitLead(leadData: Record<string, any>) {
  const endpoint = typeof window !== 'undefined' ? '/api/leads' : `${API_BASE_URL}/leads`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leadData),
  });
  return res.json();
}
