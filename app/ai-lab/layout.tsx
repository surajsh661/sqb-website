import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Production House — AI Films, VFX & Animation',
  description:
    "S'QB Pictures is an AI video production house in India — AI films, AI creatives, AI influencers, 2D/3D animation and VFX built to scale, from a Delhi NCR & Mumbai studio.",
  alternates: { canonical: '/ai-lab' },
  openGraph: {
    title: "AI Production House — S'QB Pictures",
    description:
      'AI films, AI creatives, AI influencers, 2D/3D animation and VFX — an AI video production house in India.',
    url: 'https://sqbpictures.com/ai-lab',
  },
};

export default function AiLabLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
