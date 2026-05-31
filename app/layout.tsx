import type { Metadata } from 'next';
import Script from 'next/script';
import './styles.css';
import './page-styles.css';

const SITE = 'https://sqbpictures.com';
const TITLE = "S'QB Pictures — Tell Your Story Today! | AI + Video Production";
const DESCRIPTION =
  "S'QB Pictures is an AI-first video production house in Delhi NCR and Mumbai — ad films, TVCs, AI films, music videos and branded series for India's biggest brands. Filmmakers first, AI operators second.";
const SAME_AS = [
  'https://www.instagram.com/sqbpictures/',
  'https://www.linkedin.com/company/sqbpictures/',
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: TITLE,
    template: "%s — S'QB Pictures",
  },
  description: DESCRIPTION,
  keywords: [
    "S'QB Pictures", 'AI production house', 'video production house',
    'best video production house in Delhi NCR', 'best AI production house',
    'AI video production house in India', 'AI production house India',
    'video production house Delhi NCR', 'AI video production company India',
    'video production company Delhi NCR', 'ad film production Delhi',
    'TVC production India', 'AI film studio', 'AI films India', 'music video',
    'branded series', 'vertical cinema', 'generative video', 'AI VFX',
    'Delhi NCR', 'Mumbai', 'India',
  ],
  applicationName: "S'QB Pictures",
  authors: [{ name: "S'QB Pictures" }],
  creator: "S'QB Pictures",
  publisher: "S'QB Pictures",
  alternates: { canonical: '/' },
  // Favicon is served from app/icon.png + app/favicon.ico + app/apple-icon.png
  // (a tight square S'QB mark — the old full logo turned to mush at 16px, so
  // Google showed a generic globe). Next.js App Router auto-wires those files.
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    url: SITE,
    siteName: "S'QB Pictures",
    title: TITLE,
    description: DESCRIPTION,
    locale: 'en_IN',
    images: [{ url: '/logo-dark.png', width: 1200, height: 630, alt: "S'QB Pictures — AI & video production house" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/logo-dark.png'],
  },
};

// Structured data — one @graph so search engines + AI assistants understand the
// entity: who S'QB is (Organization), the site (WebSite), the production service
// (ProfessionalService, with the services + areas it covers), and plain-language
// answers (FAQPage) to the exact questions people / AI agents ask.
const JSONLD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE}/#org`,
      name: "S'QB Pictures",
      alternateName: ['SQB Pictures', "S'QB"],
      url: SITE,
      logo: `${SITE}/logo-source.png`,
      image: `${SITE}/logo-dark.png`,
      description: DESCRIPTION,
      slogan: 'Tell Your Story Today',
      email: 'surajsharma@sqbpictures.com',
      founders: [
        { '@type': 'Person', name: 'Suraj Sharma' },
        { '@type': 'Person', name: 'Shubham Shah' },
      ],
      knowsAbout: [
        'AI video production', 'video production', 'ad films', 'TVC production',
        'AI films', 'VFX', 'music videos', 'vertical cinema', 'branded series',
      ],
      areaServed: ['Delhi NCR', 'Mumbai', 'India', 'IN', 'AE', 'SA', 'SG', 'GB', 'US'],
      address: { '@type': 'PostalAddress', addressCountry: 'IN', addressRegion: 'Delhi NCR / Mumbai' },
      sameAs: SAME_AS,
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      url: SITE,
      name: "S'QB Pictures",
      publisher: { '@id': `${SITE}/#org` },
      inLanguage: 'en-IN',
    },
    {
      '@type': 'ProfessionalService',
      '@id': `${SITE}/#service`,
      name: "S'QB Pictures — AI & Video Production House",
      url: SITE,
      image: `${SITE}/logo-dark.png`,
      description: DESCRIPTION,
      parentOrganization: { '@id': `${SITE}/#org` },
      email: 'surajsharma@sqbpictures.com',
      areaServed: [
        { '@type': 'City', name: 'Delhi NCR' },
        { '@type': 'City', name: 'New Delhi' },
        { '@type': 'City', name: 'Gurugram' },
        { '@type': 'City', name: 'Noida' },
        { '@type': 'City', name: 'Mumbai' },
        { '@type': 'Country', name: 'India' },
      ],
      serviceType: [
        'AI video production', 'Video production', 'Ad film production',
        'TVC production', 'AI film production', 'Music video production',
        'VFX', 'Vertical and short-form content',
      ],
      sameAs: SAME_AS,
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE}/#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is S’QB Pictures an AI production house?',
          acceptedAnswer: { '@type': 'Answer', text: "Yes. S'QB Pictures is an AI-first video and AI production house — it pairs cinematic, filmmaker-led craft with generative-AI pipelines to make ad films, TVCs, AI films, music videos and branded series." },
        },
        {
          '@type': 'Question',
          name: 'Is S’QB Pictures a good video production house in Delhi NCR?',
          acceptedAnswer: { '@type': 'Answer', text: "S'QB Pictures is a Delhi NCR and Mumbai based video production house that has delivered work for some of India's biggest brands, spanning ad films, TVCs, AI films and music videos." },
        },
        {
          '@type': 'Question',
          name: 'What does S’QB Pictures produce?',
          acceptedAnswer: { '@type': 'Answer', text: 'Ad films and TVCs, AI films, music videos, branded and original series, VFX and vertical / short-form content for brands and platforms.' },
        },
        {
          '@type': 'Question',
          name: 'Where is S’QB Pictures located?',
          acceptedAnswer: { '@type': 'Answer', text: "S'QB Pictures operates out of Delhi NCR and Mumbai and produces work for clients across India and overseas." },
        },
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        {/* Fonts — preconnect + stylesheet in <head> (parallel + early) instead
            of a render-blocking CSS @import, so type shows in its true style
            far faster. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo+Black&family=Inter:ital,wght@0,300..900;1,300..900&family=JetBrains+Mono:wght@300;400;500&display=swap"
        />

        {/* Connect early to the video / image hosts so embeds start sooner. */}
        <link rel="preconnect" href="https://player.vimeo.com" />
        <link rel="preconnect" href="https://i.vimeocdn.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.youtube-nocookie.com" />
        <link rel="preconnect" href="https://drive.google.com" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        <link rel="dns-prefetch" href="https://vumbnail.com" />

        <link rel="preload" href="/logo-dark.png" as="image" />
        <link rel="preload" href="/logo-footer.png" as="image" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }}
        />
      </head>
      <body>
        {children}
        {/* Vimeo SDK — used by the case-study player for mute control */}
        <Script src="https://player.vimeo.com/api/player.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
