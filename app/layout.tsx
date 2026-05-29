import type { Metadata } from 'next';
import Script from 'next/script';
import './styles.css';
import './page-styles.css';

export const metadata: Metadata = {
  title: "S'QB Pictures — Tell Your Story Today",
  description:
    "S'QB Pictures is a Delhi–Mumbai studio building India's most ambitious AI-enabled films, ads and shows for the country's biggest brands.",
  icons: { icon: '/logo-source.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://unpkg.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        <link rel="dns-prefetch" href="https://vumbnail.com" />
        <link rel="preload" href="/logo-dark.png" as="image" />
        <link rel="preload" href="/logo-footer.png" as="image" />
      </head>
      <body>
        {children}
        {/* Vimeo SDK — used by the case-study player for mute control */}
        <Script src="https://player.vimeo.com/api/player.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
