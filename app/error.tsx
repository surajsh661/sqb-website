'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { reportCrash } from '@/components/CrashReporter';
import './not-found.css';

// Route-level crash boundary. Without this a render error shows the visitor a
// blank screen; here they get a branded page, a way out, and the crash is
// logged so it can actually be fixed.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportCrash({
      message: error.message || 'Render error',
      source: 'react',
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="page-shell">
      <main className="nf-wrap">
        <div className="nf-slate">
          <div className="nf-tag">
            <span className="nf-dot" />
            BAD TAKE · SOMETHING BROKE
          </div>
          <h1 className="nf-title">
            WE DROPPED <em>THE FRAME</em>.
          </h1>
          <p className="nf-copy">
            Something on this page failed to load. The fault is logged on our side — try it again,
            or head back to the reel.
          </p>

          <div className="nf-actions">
            <button type="button" className="nf-btn" onClick={reset}>
              Try again
            </button>
            <Link href="/" className="nf-btn ghost">
              Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
