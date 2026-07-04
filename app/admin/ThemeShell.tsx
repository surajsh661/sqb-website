'use client';
import { useEffect, useState } from 'react';

// Owns the admin console's light/dark theme (persisted) and the toggle. Wraps
// every admin view so the toggle is always available. Purely presentational —
// no effect on auth or the editor.
export default function ThemeShell({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('sqb-admin-theme');
    if (saved === 'light' || saved === 'dark') setTheme(saved);
    else if (window.matchMedia?.('(prefers-color-scheme: light)').matches) setTheme('light');
  }, []);

  const toggle = () =>
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('sqb-admin-theme', next); } catch {}
      return next;
    });

  return (
    <div className={`adm-root ${theme}`}>
      <button
        className="adm-theme-toggle"
        onClick={toggle}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      >
        {theme === 'dark' ? (
          // sun
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" />
          </svg>
        ) : (
          // moon
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 14.5A8 8 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5z" />
          </svg>
        )}
      </button>
      {children}
    </div>
  );
}
