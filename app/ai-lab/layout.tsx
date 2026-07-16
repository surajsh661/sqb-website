import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Films, VFX & Animation',
  description:
    "The AI Lab at S'QB Pictures — AI films, AI creatives, AI influencers, 2D/3D animation and VFX, built alongside our ad films, documentaries and web shows from a Delhi NCR & Mumbai studio.",
  alternates: { canonical: '/ai-lab' },
  openGraph: {
    title: "AI Films, VFX & Animation — S'QB Pictures",
    description:
      'AI films, AI creatives, AI influencers, 2D/3D animation and VFX — one part of a full-service film & video production house.',
    url: 'https://sqbpictures.com/ai-lab',
  },
};

export default function AiLabLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
