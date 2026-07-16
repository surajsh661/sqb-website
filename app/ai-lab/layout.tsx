import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Films, VFX & Animation',
  description:
    "The AI Lab at S'QB Pictures — AI films, AI creatives, AI influencers, 2D/3D animation and VFX. Built alongside the rest of the studio's work: live-action ad films, documentaries, web shows, art films and brand content, from a Delhi NCR & Mumbai studio.",
  alternates: { canonical: '/ai-lab' },
  openGraph: {
    title: "Film, AI & Content Production — S'QB Pictures",
    description:
      'Ad films, TVCs, documentaries, web shows, art films and brand content — live-action and AI, including AI creatives, 2D/3D animation and VFX. A full-service film & video production house in Delhi NCR & Mumbai.',
    url: 'https://sqbpictures.com/ai-lab',
  },
};

export default function AiLabLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
