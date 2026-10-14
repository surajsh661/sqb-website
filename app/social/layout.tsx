import type { Metadata } from 'next';
import { breadcrumbJsonLd } from '@/lib/breadcrumbs';

export const metadata: Metadata = {
  title: { absolute: "YouTube & Creator Content | S'QB Pictures, Delhi NCR" },
  twitter: { card: 'summary_large_image', title: "YouTube & Creator Content | S'QB Pictures, Delhi NCR" },
  description:
    "Content-as-a-Service from S'QB Pictures — original IPs and creator engines behind some of India's biggest YouTube channels, built by a Delhi NCR & Mumbai production house.",
  alternates: { canonical: '/social' },
  openGraph: {
    title: "YouTube & Creator Content | S'QB Pictures, Delhi NCR",
    description:
      "Original IPs and creator engines behind some of India's biggest YouTube channels.",
    url: 'https://sqbpictures.com/social',
  },
};

export default function SocialLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd({ name: 'Social', path: '/social' })),
        }}
      />
      {children}
    </>
  );
}
