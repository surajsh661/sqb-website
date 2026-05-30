import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Social & Creator Content — CAAS',
  description:
    "Content-as-a-Service from S'QB Pictures — original IPs and creator engines behind some of India's biggest YouTube channels, built by a Delhi NCR & Mumbai production house.",
  alternates: { canonical: '/social' },
  openGraph: {
    title: "Social & Creator Content — S'QB Pictures",
    description:
      "Original IPs and creator engines behind some of India's biggest YouTube channels.",
    url: 'https://sqbpictures.com/social',
  },
};

export default function SocialLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
