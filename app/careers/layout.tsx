import type { Metadata } from 'next';
import { SQB_ROLES } from '@/lib/careers';
import './careers.css';

export const metadata: Metadata = {
  title: 'Careers — Join the Crew',
  description:
    "We're hiring AI Video Editors, AI Visual Artists, an AI Creative Director and an HR Executive at S'QB Pictures — an AI-first film and production house in Noida, Delhi NCR.",
  alternates: { canonical: '/careers' },
  openGraph: {
    title: "Careers — S'QB Pictures",
    description: 'Open roles at an AI-first film and production house in Noida, Delhi NCR.',
    url: 'https://sqbpictures.com/careers',
  },
};

// One JobPosting per open role. This is what makes the roles eligible for the
// Google Jobs experience. Salary is intentionally omitted — it is revealed only
// when a candidate proceeds to apply.
const JOBS_JSONLD = SQB_ROLES.map((r) => ({
  '@context': 'https://schema.org',
  '@type': 'JobPosting',
  identifier: { '@type': 'PropertyValue', name: "S'QB Pictures", value: r.id },
  title: r.title,
  description: `<p>${r.description}</p><ul>${r.qualifications.map((q) => `<li>${q}</li>`).join('')}</ul>`,
  datePosted: r.datePosted,
  validThrough: r.validThrough,
  employmentType: r.type.toLowerCase().includes('full') ? 'FULL_TIME' : 'CONTRACTOR',
  directApply: true,
  hiringOrganization: {
    '@type': 'Organization',
    name: "S'QB Pictures",
    sameAs: 'https://sqbpictures.com',
    logo: 'https://sqbpictures.com/logo-dark.png',
  },
  jobLocation: {
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Noida',
      addressRegion: 'Uttar Pradesh',
      addressCountry: 'IN',
    },
  },
  industry: 'Film & Video Production',
}));

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JOBS_JSONLD) }}
      />
      {children}
    </>
  );
}
