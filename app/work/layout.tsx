import type { Metadata } from 'next';

// page.tsx is a client component (it can't export metadata), so this server
// layout supplies the per-page SEO for /work.
export const metadata: Metadata = {
  title: 'Video Production House — Ad Films, TVCs & AI Films',
  description:
    "S'QB Pictures is a video production house in Delhi NCR & Mumbai — ad films, TVCs, AI films, music videos and branded series delivered for India's biggest brands.",
  alternates: { canonical: '/work' },
  openGraph: {
    title: "Video Production House — S'QB Pictures",
    description:
      'Ad films, TVCs, AI films, music videos and branded series from a Delhi NCR & Mumbai video production house.',
    url: 'https://sqbpictures.com/work',
  },
};

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
