import type { Metadata } from 'next';
import { SQB_FILMS, HERO_POSTERS } from '@/lib/data';
import { thumbSources } from '@/lib/video-utils';

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

// The films grid renders client-side, so crawlers never see the film titles,
// clients or case copy in the HTML. This server-rendered VideoObject ItemList
// hands Google the whole portfolio as TEXT — titles, brands, descriptions,
// posters — which is also where the client/brand names finally exist as text.
const abs = (u: string) => (u.startsWith('http') ? u : `https://sqbpictures.com${u}`);
const FILMS_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: "S'QB Pictures — Films & Commercials",
  itemListElement: SQB_FILMS.map((f, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'VideoObject',
      name: f.title,
      description:
        f.lede ||
        `${f.category} for ${f.client}${f.talent ? ` featuring ${f.talent}` : ''} — produced by S'QB Pictures.`,
      thumbnailUrl: abs(HERO_POSTERS[f.videoId] || thumbSources(f)[0] || ''),
      uploadDate: `${f.year}-01-01`,
      url: 'https://sqbpictures.com/work',
      sourceOrganization: { '@type': 'Organization', name: "S'QB Pictures" },
      ...(f.client ? { sponsor: { '@type': 'Organization', name: f.client } } : {}),
    },
  })),
};

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FILMS_JSONLD) }}
      />
      {children}
    </>
  );
}
