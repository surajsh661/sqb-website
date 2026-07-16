import type { Metadata } from 'next';
import { getPublicRoles } from '@/lib/careers-store';
import './careers.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Careers — Join the Crew',
  description:
    "We're hiring at S'QB Pictures — a film and video production house in Delhi NCR making ad films, documentaries, web shows, music videos and AI films. Creative and operations roles building original content.",
  alternates: { canonical: '/careers' },
  openGraph: {
    title: "Careers — S'QB Pictures",
    description: 'Open roles at a full-service film & video production house in Delhi NCR.',
    url: 'https://sqbpictures.com/careers',
  },
};

// One JobPosting per OPEN role, read from the live store so Google Jobs always
// matches what the owner has published. Salary is intentionally omitted — it is
// revealed only when a candidate proceeds to apply.
export default async function CareersLayout({ children }: { children: React.ReactNode }) {
  const roles = await getPublicRoles().catch(() => []);
  const jobs = roles.map((r) => ({
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

  return (
    <>
      {jobs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobs) }}
        />
      )}
      {children}
    </>
  );
}
