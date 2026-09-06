'use client';
import { useEffect } from 'react';

// Catches the crashes React's error boundaries never see — plain `throw`s in
// event handlers, async failures, and rejected promises — and posts them to
// /api/client-error, which writes them to the Vercel log.
//
// Renders nothing and never throws: a reporter that breaks the page it is
// meant to watch is a net loss.

export function reportCrash(payload: {
  message: string;
  source: string;
  stack?: string;
}) {
  try {
    const body = JSON.stringify({
      ...payload,
      page: typeof location !== 'undefined' ? location.pathname + location.search : '',
    });
    // sendBeacon survives the page being torn down mid-crash; fetch is the
    // fallback for browsers that refuse the beacon (or when it returns false).
    const sent =
      typeof navigator !== 'undefined' &&
      typeof navigator.sendBeacon === 'function' &&
      navigator.sendBeacon('/api/client-error', new Blob([body], { type: 'application/json' }));
    if (!sent) {
      void fetch('/api/client-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch { /* reporting must never throw */ }
}

export default function CrashReporter() {
  useEffect(() => {
    // One report per unique message per page view — a crash inside a render
    // loop or an animation frame can otherwise fire hundreds of times.
    const seen = new Set<string>();
    const once = (key: string) => {
      if (seen.has(key)) return false;
      seen.add(key);
      return seen.size <= 5; // hard ceiling per page view
    };

    const onError = (e: ErrorEvent) => {
      const message = e.message || 'Unknown error';
      if (!once(message)) return;
      reportCrash({ message, source: 'window', stack: e.error?.stack });
    };

    const onRejection = (e: PromiseRejectionEvent) => {
      const r = e.reason;
      const message =
        (r instanceof Error ? r.message : typeof r === 'string' ? r : 'Unhandled promise rejection') ||
        'Unhandled promise rejection';
      if (!once(message)) return;
      reportCrash({ message, source: 'promise', stack: r instanceof Error ? r.stack : undefined });
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  return null;
}
