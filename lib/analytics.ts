/**
 * Google Tag Manager (dataLayer) & Self-Owned MongoDB Analytics Event Dispatcher
 * With Funnel Drop-off, Click IDs (gclid/fbclid), Call/WhatsApp Attribution, and Anonymous Visitor ID
 */

declare global {
  interface Window {
    dataLayer?: Record<string, any>[];
  }
}

export interface AnalyticsEventPayload {
  eventType: string;
  metadata?: Record<string, any>;
  leadId?: string;
  contactMethod?: 'phone' | 'whatsapp';
  stepNumber?: number;
  timeSpentMs?: number;
  scrollDepth?: number;
  approxLocation?: {
    city?: string;
    region?: string;
    country?: string;
    lat?: number;
    lng?: number;
    source: 'ip';
  };
  preciseLocation?: {
    lat: number;
    lng: number;
    source: 'gps';
    consentedAt?: Date;
  };
}

export interface UrlAttribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  gclid?: string;
  fbclid?: string;
}

const ANON_ID_COOKIE = 'nse_anon_id';
const ATTR_STORAGE_KEY = 'nse_url_attribution';

/**
 * Generates a standard UUID v4 string
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Retrieves or initializes a persistent first-party anonymous ID (stored in cookie & localStorage for 1 year)
 */
export function getAnonymousId(): string {
  if (typeof window === 'undefined') return '';

  try {
    // 1. Check first-party cookie
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, val] = cookie.trim().split('=');
      if (name === ANON_ID_COOKIE && val) {
        return decodeURIComponent(val);
      }
    }

    // 2. Check localStorage fallback
    const localId = localStorage.getItem(ANON_ID_COOKIE);
    if (localId) {
      // Re-seed cookie
      document.cookie = `${ANON_ID_COOKIE}=${encodeURIComponent(localId)};path=/;max-age=${365 * 24 * 60 * 60};SameSite=Lax`;
      return localId;
    }

    // 3. Generate new anonymous ID
    const newId = generateUUID();
    localStorage.setItem(ANON_ID_COOKIE, newId);
    document.cookie = `${ANON_ID_COOKIE}=${encodeURIComponent(newId)};path=/;max-age=${365 * 24 * 60 * 60};SameSite=Lax`;
    return newId;
  } catch {
    return '';
  }
}

/**
 * Extracts and caches UTM parameters and Paid Click IDs (gclid, fbclid)
 */
export function getUrlAttribution(): UrlAttribution {
  if (typeof window === 'undefined') return {};

  try {
    const params = new URLSearchParams(window.location.search);
    const hasParams =
      params.has('utm_source') ||
      params.has('utm_medium') ||
      params.has('utm_campaign') ||
      params.has('gclid') ||
      params.has('fbclid');

    if (hasParams) {
      const current: UrlAttribution = {
        utmSource: params.get('utm_source') || undefined,
        utmMedium: params.get('utm_medium') || undefined,
        utmCampaign: params.get('utm_campaign') || undefined,
        utmTerm: params.get('utm_term') || undefined,
        utmContent: params.get('utm_content') || undefined,
        gclid: params.get('gclid') || undefined,
        fbclid: params.get('fbclid') || undefined,
      };
      sessionStorage.setItem(ATTR_STORAGE_KEY, JSON.stringify(current));
      return current;
    }

    // Return cached attribution from session storage if present
    const cached = sessionStorage.getItem(ATTR_STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // fallback
  }

  return {};
}

/**
 * Backwards-compatible helper for UTMs
 */
export function getUtmParams(): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
} {
  const attr = getUrlAttribution();
  return {
    utmSource: attr.utmSource,
    utmMedium: attr.utmMedium,
    utmCampaign: attr.utmCampaign,
  };
}

/**
 * Detects device category based on user agent
 */
export function getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(ua)) return 'mobile';
  return 'desktop';
}

/**
 * Core event tracking function: pushes to GTM dataLayer AND posts to MongoDB /api/events
 */
export function trackEvent({
  eventType,
  metadata = {},
  leadId,
  contactMethod,
  stepNumber,
  timeSpentMs,
  scrollDepth,
  approxLocation,
  preciseLocation,
}: AnalyticsEventPayload): void {
  if (typeof window === 'undefined') return;

  const attr = getUrlAttribution();
  const anonId = getAnonymousId();
  const pageUrl = window.location.pathname + window.location.search;
  const deviceType = getDeviceType();

  // 1. Dispatch to Google Tag Manager dataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventType,
    page_url: pageUrl,
    device_type: deviceType,
    lead_id: leadId,
    anonymous_id: anonId,
    utm_source: attr.utmSource || 'direct',
    utm_medium: attr.utmMedium || 'none',
    utm_campaign: attr.utmCampaign || 'none',
    gclid: attr.gclid,
    fbclid: attr.fbclid,
    contact_method: contactMethod,
    step_number: stepNumber,
    time_spent_ms: timeSpentMs,
    scroll_depth: scrollDepth,
    approx_city: approxLocation?.city,
    has_precise_gps: Boolean(preciseLocation?.lat),
    ...metadata,
    timestamp: new Date().toISOString(),
  });

  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/api\/?$/, '') + '/api';
  const payload = {
    eventType,
    pageUrl,
    utmSource: attr.utmSource || 'direct',
    utmMedium: attr.utmMedium || 'none',
    utmCampaign: attr.utmCampaign || 'none',
    gclid: attr.gclid,
    fbclid: attr.fbclid,
    anonymousId: anonId,
    deviceType,
    contactMethod,
    stepNumber,
    timeSpentMs,
    scrollDepth,
    leadId,
    approxLocation,
    preciseLocation,
    metadata: {
      ...metadata,
      contact_method: contactMethod,
      step_number: stepNumber,
      time_spent_ms: timeSpentMs,
      scroll_depth: scrollDepth,
    },
  };

  fetch(`${apiBase}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    keepalive: true,
    body: JSON.stringify(payload),
  }).catch((err) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Analytics] Failed to send telemetry event:', err);
    }
  });
}

/**
 * Typed Event Helpers
 */

export function trackQuoteFormSubmit(details: {
  leadId?: string;
  quoteType?: string;
  propertyType?: string;
  elevatorCount?: number;
  buildingName?: string;
}) {
  trackEvent({
    eventType: 'quote_form_submit',
    leadId: details.leadId,
    metadata: {
      quote_type: details.quoteType || 'standard',
      property_type: details.propertyType,
      elevator_count: details.elevatorCount,
      building_name: details.buildingName,
    },
  });
}

export function trackQuoteStepViewed(details: {
  stepNumber: number;
  timeSpentMs?: number;
}) {
  trackEvent({
    eventType: 'quote_step_viewed',
    stepNumber: details.stepNumber,
    timeSpentMs: details.timeSpentMs,
    metadata: {
      step_number: details.stepNumber,
      time_spent_ms: details.timeSpentMs,
    },
  });
}

export function trackQuoteStepAbandoned(details: {
  stepNumber: number;
  timeSpentMs: number;
}) {
  trackEvent({
    eventType: 'quote_step_abandoned',
    stepNumber: details.stepNumber,
    timeSpentMs: details.timeSpentMs,
    metadata: {
      step_number: details.stepNumber,
      time_spent_ms: details.timeSpentMs,
    },
  });
}

export function trackPhoneClick(details: {
  location: string;
  phoneNumber: string;
  contactMethod?: 'phone' | 'whatsapp';
}) {
  const method = details.contactMethod || 'phone';
  trackEvent({
    eventType: 'phone_click',
    contactMethod: method,
    metadata: {
      button_location: details.location,
      phone_number: details.phoneNumber,
      contact_method: method,
    },
  });
}

export function trackScrollDepth(depth: 25 | 50 | 75 | 100, pageUrl?: string) {
  trackEvent({
    eventType: 'scroll_depth',
    scrollDepth: depth,
    metadata: {
      scroll_depth: depth,
      target_page: pageUrl,
    },
  });
}

export function trackTimeOnPage(details: { pageUrl: string; seconds: number }) {
  trackEvent({
    eventType: 'time_on_page',
    metadata: {
      page_url: details.pageUrl,
      time_on_page_seconds: details.seconds,
    },
  });
}

export function trackEmergencyCtaClick(details: {
  source: string;
  action: string;
}) {
  trackEvent({
    eventType: 'emergency_cta_click',
    metadata: {
      source_section: details.source,
      action: details.action,
    },
  });
}

export function trackServicePageView(details: {
  serviceSlug: string;
  serviceCategory?: string;
}) {
  trackEvent({
    eventType: 'service_page_view',
    metadata: {
      service_slug: details.serviceSlug,
      service_category: details.serviceCategory,
    },
  });
}

export function trackLeadSourceCapture() {
  const attr = getUrlAttribution();
  trackEvent({
    eventType: 'lead_source_capture',
    metadata: {
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      utm_source: attr.utmSource,
      utm_medium: attr.utmMedium,
      utm_campaign: attr.utmCampaign,
      gclid: attr.gclid,
      fbclid: attr.fbclid,
    },
  });
}

/**
 * Two-Tier Location Tracking Helpers
 */

const LOCATION_STORAGE_KEY = 'nse_approx_location';
const LOCATION_TRACKED_KEY = 'nse_location_tracked';

export interface ApproxLocationData {
  city: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  source: 'ip';
}

/**
 * 1. Silent IP-based approximate location lookup (one request per session, zero browser prompts).
 */
export function initSessionLocation(): void {
  if (typeof window === 'undefined') return;

  try {
    if (sessionStorage.getItem(LOCATION_TRACKED_KEY)) {
      return; // Already resolved in this session
    }

    const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/api\/?$/, '') + '/api';
    const anonId = getAnonymousId();

    fetch(`${apiBase}/events/location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        anonymousId: anonId,
        pageUrl: window.location.pathname,
      }),
      keepalive: true,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data?.approxLocation) {
          sessionStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(json.data.approxLocation));
          sessionStorage.setItem(LOCATION_TRACKED_KEY, 'true');
        }
      })
      .catch(() => {
        // Silently fail to avoid affecting visitor UX
      });
  } catch {
    // Fail silently
  }
}

/**
 * Retrieves the session-cached approximate IP location
 */
export function getApproxLocation(): ApproxLocationData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(LOCATION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * 2. User-initiated, consented GPS precise location capture.
 */
export function trackPreciseLocation(coords: { lat: number; lng: number; context?: string }): void {
  trackEvent({
    eventType: 'precise_location_granted',
    preciseLocation: {
      lat: coords.lat,
      lng: coords.lng,
      source: 'gps',
      consentedAt: new Date(),
    },
    metadata: {
      context: coords.context || 'user_action',
      latitude: coords.lat,
      longitude: coords.lng,
    },
  });
}

// Auto-run silent session location resolution deferred to browser idle time
if (typeof window !== 'undefined') {
  const deferInit = () => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => initSessionLocation(), { timeout: 3000 });
    } else {
      setTimeout(() => initSessionLocation(), 2000);
    }
  };

  if (document.readyState === 'complete') {
    deferInit();
  } else {
    window.addEventListener('load', deferInit, { once: true });
  }
}

