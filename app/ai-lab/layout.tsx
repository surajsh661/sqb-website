import type { Metadata } from 'next';
import { breadcrumbJsonLd } from '@/lib/breadcrumbs';

export const metadata: Metadata = {
  title: { absolute: "AI Films, AI VFX & Animation | S'QB Pictures, Delhi NCR" },
  twitter: { card: 'summary_large_image', title: "AI Films, AI VFX & Animation | S'QB Pictures, Delhi NCR" },
  description:
    "AI micro dramas, AI cinematic films, AI ad films, AI VFX and animation from S'QB Pictures, a film and video production house in Delhi NCR and Mumbai.",
  alternates: { canonical: '/ai-lab' },
  openGraph: {
    title: "AI Films, AI VFX & Animation | S'QB Pictures, Delhi NCR",
    description:
      "AI micro dramas, AI cinematic films, AI ad films, AI VFX and animation from S'QB Pictures, a film and video production house in Delhi NCR and Mumbai.",
    url: 'https://sqbpictures.com/ai-lab',
  },
};

export default function AiLabLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd({ name: 'AI Lab', path: '/ai-lab' })),
        }}
      />
      {children}
    </>
  );
}
