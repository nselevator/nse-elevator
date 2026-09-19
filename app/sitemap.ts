import { MetadataRoute } from 'next';

const BASE_URL = 'https://www.newsahyadrielevator.com';

const serviceSlugs = [
  'elevator-maintenance',
  'elevator-repair',
  'elevator-modernization',
  'safety-inspections-code-compliance',
  'elevator-cab-remodeling',
  'hydraulic-traction-conversions',
  'non-proprietary-elevator-service',
  'elevator-installation',
];

const locationSlugs = [
  'elevator-repair-navi-mumbai',
  'elevator-repair-pune',
];

const industrySlugs = [
  'commercial-office-buildings',
  'residential-high-rises-condos',
  'hospital-healthcare-elevators',
  'hotel-hospitality-elevators',
  'education-campuses',
  'industrial-freight-elevators',
];

const caseStudySlugs = [
  'greenfield-heights-amc-takeover',
  'mayflower-residency-safety-audit',
  'shree-samarth-emergency-rescue',
  'panchsheel-business-square-modernization',
];

const jobSlugs = [
  'senior-elevator-service-mechanic',
  'elevator-modernization-lead-technician',
  'certified-elevator-inspector-qei',
];

const blogSlugs = [
  'why-proprietary-elevator-software-costs-thousands',
  'asme-a17-category-1-vs-category-5-testing-explained',
  'warning-signs-hydraulic-elevator-cylinder-failure',
];

const stateCodeSlugs = [
  'illinois',
  'texas',
  'georgia',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // 1. Static Core Pages (15)
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/emergency-elevator-repair`, lastModified: now, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${BASE_URL}/services`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/locations`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/industries`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE_URL}/case-studies`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/about/team`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE_URL}/about/safety-standards`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/careers`, lastModified: now, changeFrequency: 'weekly', priority: 0.75 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/testimonials`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/contact/request-maintenance-quote`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/contact/schedule-inspection`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE_URL}/resources`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
  ];

  // 2. Service Sub-Pages (8)
  const serviceRoutes: MetadataRoute.Sitemap = serviceSlugs.map((slug) => ({
    url: `${BASE_URL}/services/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // 3. Location Pages (2: Navi Mumbai and Pune)
  const locationRoutes: MetadataRoute.Sitemap = locationSlugs.map((slug) => ({
    url: `${BASE_URL}/locations/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // 4. Industry Pages (6)
  const industryRoutes: MetadataRoute.Sitemap = industrySlugs.map((slug) => ({
    url: `${BASE_URL}/industries/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // 5. Case Studies (3)
  const caseRoutes: MetadataRoute.Sitemap = caseStudySlugs.map((slug) => ({
    url: `${BASE_URL}/case-studies/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  // 6. Active Career Openings (3)
  const careerRoutes: MetadataRoute.Sitemap = jobSlugs.map((slug) => ({
    url: `${BASE_URL}/careers/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // 7. Blog & Knowledge Base Articles (3)
  const blogRoutes: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  // 8. State Code Compliance Guides (3)
  const stateRoutes: MetadataRoute.Sitemap = stateCodeSlugs.map((state) => ({
    url: `${BASE_URL}/resources/elevator-codes-${state}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [
    ...staticRoutes,
    ...serviceRoutes,
    ...locationRoutes,
    ...industryRoutes,
    ...caseRoutes,
    ...careerRoutes,
    ...blogRoutes,
    ...stateRoutes,
  ];
}
