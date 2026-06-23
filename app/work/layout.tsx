import type { Metadata } from 'next';
import { SQB_FILMS, HERO_POSTERS } from '@/lib/data';
import { thumbSources } from '@/lib/video-utils';
import type { Film } from '@/lib/types';

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

// Google's player URL for each host — satisfies VideoObject's "embedUrl"
// requirement (the watch surface for the clip).
const embedUrl = (f: Film): string | undefined => {
  switch (f.type) {
    case 'vm': return `https://player.vimeo.com/video/${f.videoId}`;
    case 'yt': return `https://www.youtube.com/embed/${f.videoId}`;
    case 'gd': return `https://drive.google.com/file/d/${f.videoId}/preview`;
    default:   return undefined; // ig has no stable embed player URL
  }
};

// uploadDate must be a full ISO 8601 datetime WITH a time zone, or Google
// rejects it ("not in ISO 8601 format" / "missing a time zone"). We only know
// the year, and some are ranges ("2025–26"), so pull the FIRST 4-digit year
// out of the string and anchor the film to Jan 1, 09:00 IST (+05:30).
const uploadDate = (year: string): string | undefined => {
  const m = /\d{4}/.exec(year || '');
  return m ? `${m[0]}-01-01T09:00:00+05:30` : undefined;
};

// runtime is "M:SS" (e.g. "0:45", "12:00") — convert to an ISO 8601 duration
// (PT#M#S). Anything else ("2 EPS", blank) is skipped, not emitted malformed.
const RUNTIME = /^(\d+):([0-5]\d)$/;
const duration = (rt: string | undefined): string | undefined => {
  const m = RUNTIME.exec((rt || '').trim());
  return m ? `PT${parseInt(m[1], 10)}M${parseInt(m[2], 10)}S` : undefined;
};

const FILMS_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: "S'QB Pictures — Films & Commercials",
  itemListElement: SQB_FILMS.map((f, i) => {
    const embed = embedUrl(f);
    const uploaded = uploadDate(f.year);
    const dur = duration(f.runtime);
    return {
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'VideoObject',
        name: f.title,
        description:
          f.lede ||
          `${f.category} for ${f.client}${f.talent ? ` featuring ${f.talent}` : ''} — produced by S'QB Pictures.`,
        thumbnailUrl: abs(HERO_POSTERS[f.videoId] || thumbSources(f)[0] || ''),
        ...(uploaded ? { uploadDate: uploaded } : {}),
        ...(embed ? { embedUrl: embed } : {}),
        ...(dur ? { duration: dur } : {}),
        url: 'https://sqbpictures.com/work',
        sourceOrganization: { '@type': 'Organization', name: "S'QB Pictures" },
        ...(f.client ? { sponsor: { '@type': 'Organization', name: f.client } } : {}),
      },
    };
  }),
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
