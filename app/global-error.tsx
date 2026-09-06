'use client';
import { useEffect } from 'react';

// The last line of defence: a crash in the root layout itself, where app/error
// .tsx can't mount. Next.js replaces the whole document here, so this file must
// render its own <html>/<body> and cannot rely on the site's stylesheets.
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Inlined rather than imported: at this point the app shell is gone, and a
    // failed chunk import would swallow the report we're trying to send.
    try {
      const body = JSON.stringify({
        message: error.message || 'Root layout error',
        source: 'global',
        stack: error.stack,
        page: location.pathname + location.search,
      });
      if (!navigator.sendBeacon?.('/api/client-error', new Blob([body], { type: 'application/json' }))) {
        void fetch('/api/client-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    } catch { /* never throw from the crash handler */ }
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0E0E0E',
          color: '#F4ECDB',
          fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif',
          padding: '24px',
        }}
      >
        <div style={{ maxWidth: 520, textAlign: 'center' }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: '#F5C518',
              marginBottom: 18,
            }}
          >
            Something broke
          </div>
          <h1 style={{ fontSize: 34, lineHeight: 1.1, margin: '0 0 16px', fontWeight: 700 }}>
            We dropped the frame.
          </h1>
          <p style={{ color: '#B5AE9F', fontSize: 15.5, lineHeight: 1.6, margin: '0 0 28px' }}>
            This page failed to load. The fault has been logged on our side.
          </p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '13px 26px',
              borderRadius: 10,
              background: '#F5C518',
              color: '#0E0E0E',
              fontWeight: 700,
              fontSize: 15,
              textDecoration: 'none',
            }}
          >
            Back to sqbpictures.com
          </a>
        </div>
      </body>
    </html>
  );
}
