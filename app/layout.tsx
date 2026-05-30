import type { Metadata } from 'next';
import Script from 'next/script';
import './styles.css';
import './page-styles.css';

const SITE = 'https://sqbpictures.com';
const DESCRIPTION =
  "S'QB Pictures is a Delhi–Mumbai film studio building India's most ambitious AI-enabled films, ads and shows for the country's biggest brands. Filmmakers first, AI operators second.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "S'QB Pictures — Tell Your Story Today",
    template: "%s — S'QB Pictures",
  },
  description: DESCRIPTION,
  keywords: [
    "S'QB Pictures", 'AI film studio', 'AI films India', 'branded series',
    'TVC production', 'music video', 'docu-series', 'Delhi', 'Mumbai',
    'video production studio', 'generative video', 'AI VFX',
  ],
  applicationName: "S'QB Pictures",
  authors: [{ name: "S'QB Pictures" }],
  creator: "S'QB Pictures",
  publisher: "S'QB Pictures",
  alternates: { canonical: '/' },
  icons: { icon: '/logo-source.png' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    url: SITE,
    siteName: "S'QB Pictures",
    title: "S'QB Pictures — Tell Your Story Today",
    description: DESCRIPTION,
    locale: 'en_IN',
    images: [{ url: '/logo-dark.png', width: 1200, height: 630, alt: "S'QB Pictures" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "S'QB Pictures — Tell Your Story Today",
    description: DESCRIPTION,
    images: ['/logo-dark.png'],
  },
};

const ORG_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: "S'QB Pictures",
  url: SITE,
  logo: `${SITE}/logo-source.png`,
  description: DESCRIPTION,
  email: 'surajsharma@sqbpictures.com',
  areaServed: ['IN', 'AE', 'SA', 'SG', 'GB', 'US'],
  address: { '@type': 'PostalAddress', addressCountry: 'IN', addressRegion: 'Delhi / Mumbai' },
  sameAs: [
    'https://www.instagram.com/sqbpictures/',
    'https://www.linkedin.com/company/sqbpictures/',
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }}
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
