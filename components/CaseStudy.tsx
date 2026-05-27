'use client';
import { useEffect, useRef, useState } from 'react';
import type { Film } from '@/lib/types';

interface Props {
  film: Film | null;
  films: Film[];
  open: boolean;
  onClose: () => void;
  onPick: (f: Film) => void;
}

export default function CaseStudy({ film, films, open, onClose, onPick }: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<any>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  // Audio ON by default — the user's click on the hero counts as a fresh
  // gesture, so browsers normally allow programmatic unmute through this path.
  const [audioOn, setAudioOn] = useState(true);
  const [paused, setPaused] = useState(false);

  // Reset audio + scroll-to-top when opening / switching films
  useEffect(() => {
    if (!open || !film) return;
    setAudioOn(true);
    setPaused(false);
    requestAnimationFrame(() => {
      if (rootRef.current) rootRef.current.scrollTop = 0;
    });
  }, [open, film?.id]);

  // After the iframe mounts, wire up the player API and unmute via SDK /
  // postMessage. The src URL stays muted so the initial frame is guaranteed
  // to autoplay; we only flip the audio bit through the API. That avoids the
  // restart-on-mute-toggle problem.
  useEffect(() => {
    if (!open || !film) return;

    if (film.type === 'vm') {
      const w = window as any;
      if (!w.Vimeo || !w.Vimeo.Player) return;
      const t = setTimeout(() => {
        const f = iframeRef.current;
        if (!f) return;
        try {
          const player = new w.Vimeo.Player(f);
          playerRef.current = player;
          player.setMuted(false)
            .then(() => player.play())
            .catch(() => {
              // Browser blocked unmute — reflect that in the UI so the icon
              // matches reality and the user can tap to enable.
              setAudioOn(false);
            });
        } catch {
          setAudioOn(false);
        }
      }, 150);
      return () => { clearTimeout(t); playerRef.current = null; };
    }

    if (film.type === 'yt') {
      const t = setTimeout(() => {
        const f = iframeRef.current;
        if (!f || !f.contentWindow) { setAudioOn(false); return; }
        try {
          f.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'unMute', args: [] }),
            '*',
          );
          f.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
            '*',
          );
        } catch {
          setAudioOn(false);
        }
      }, 800);
      return () => clearTimeout(t);
    }
  }, [open, film?.id]);

  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!film) return;
    const next = !audioOn;
    if (film.type === 'vm' && playerRef.current) {
      playerRef.current.setMuted(!next).catch(() => {});
      setAudioOn(next);
      return;
    }
    if (film.type === 'yt') {
      const f = iframeRef.current;
      f?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: next ? 'unMute' : 'mute', args: [] }),
        '*',
      );
      setAudioOn(next);
      return;
    }
    // Drive can't be controlled via API — flip state for UI only.
    setAudioOn(next);
  };

  const togglePlayPause = () => {
    if (!film) return;
    const goingToPause = !paused;
    if (film.type === 'vm' && playerRef.current) {
      if (goingToPause) playerRef.current.pause().catch(() => {});
      else playerRef.current.play().catch(() => {});
    } else if (film.type === 'yt') {
      const f = iframeRef.current;
      f?.contentWindow?.postMessage(
        JSON.stringify({
          event: 'command',
          func: goingToPause ? 'pauseVideo' : 'playVideo',
          args: [],
        }),
        '*',
      );
    } else {
      // Drive previews don't expose play/pause via postMessage.
      return;
    }
    setPaused(goingToPause);
  };

  if (!film) return null;
  const idx = films.findIndex((f) => f.id === film.id);
  const next = films[(idx + 1) % films.length];

  // Build the iframe src ONCE per film (no audio in the URL — we drive that
  // through the SDK / postMessage so the iframe never reloads on toggle).
  let src: string;
  if (film.type === 'vm') {
    src = `https://player.vimeo.com/video/${film.videoId}?autoplay=1&loop=1&muted=1&controls=0&dnt=1&playsinline=1&title=0&byline=0&portrait=0`;
  } else if (film.type === 'gd') {
    src = `https://drive.google.com/file/d/${film.videoId}/preview`;
  } else {
    const origin = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';
    src = `https://www.youtube-nocookie.com/embed/${film.videoId}?autoplay=1&mute=1&loop=1&playlist=${film.videoId}&controls=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1&origin=${origin}`;
  }
  const isVertical = (film.genres || []).includes('vertical') || film.aspect === '9:16';
  const canControl = film.type !== 'gd';

  return (
    <div
      ref={rootRef}
      className={'case-study' + (open ? ' open' : '')}
      data-screen-label={`Case ${film.id}`}
    >
      <button className="case-back prominent" onClick={onClose}>
        <span className="cb-arrow">←</span> BACK
      </button>

      <section className={'case-hero' + (isVertical ? ' vertical' : '')}>
        <div className="bg">
          <iframe
            ref={iframeRef}
            key={film.id}
            src={src}
            title={film.title}
            allow="autoplay; encrypted-media; picture-in-picture"
          />
          {canControl && (
            <>
              {/* Invisible click capture for play/pause toggle. */}
              <button
                className="case-tap"
                onClick={togglePlayPause}
                aria-label={paused ? 'Play' : 'Pause'}
              >
                {paused && (
                  <span className="case-tap-glyph" aria-hidden="true">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                )}
              </button>

              <button
                className={'case-mute' + (audioOn ? ' on' : '')}
                onClick={toggleMute}
                aria-label={audioOn ? 'Mute' : 'Unmute'}
                title={audioOn ? 'Mute' : 'Unmute'}
              >
                {audioOn ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                )}
              </button>
            </>
          )}
        </div>
        <div className="content">
          <div className="eyebrow"><span className="num">CASE</span> <span>{film.category}</span></div>
          <h1>{film.title}</h1>
          <div className="case-meta">
            <div><span className="label">CLIENT</span>{film.client}</div>
            <div><span className="label">YEAR</span>{film.year}</div>
            <div><span className="label">RUNTIME</span>{film.runtime}</div>
            <div><span className="label">IMPACT</span>{film.impact}</div>
          </div>
        </div>
      </section>

      <div className="case-body">
        <div className="left">
          <div className="item"><div className="label">CLIENT</div><div className="val">{film.client}</div></div>
          <div className="item"><div className="label">TALENT</div><div className="val">{film.talent}</div></div>
          <div className="item"><div className="label">CATEGORY</div><div className="val">{film.category}</div></div>
          <div className="item"><div className="label">YEAR</div><div className="val">{film.year}</div></div>
          <div className="item"><div className="label">RUNTIME</div><div className="val">{film.runtime}</div></div>
          <div className="item">
            <div className="label">IMPACT</div>
            <div className="val" style={{ fontFamily: 'Anton, sans-serif', fontSize: 28, color: 'var(--accent)' }}>{film.impact}</div>
          </div>
        </div>
        <div className="right">
          <p className="lede">{film.lede}</p>
          {film.brief && (<p><strong style={{ color: 'var(--accent)' }}>BRIEF — </strong>{film.brief}</p>)}
          {film.solution && (<p><strong style={{ color: 'var(--accent)' }}>SOLUTION — </strong>{film.solution}</p>)}
          <p>{film.body}</p>
          {film.timeline && (
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, letterSpacing: '0.12em', color: 'var(--fg-dim)' }}>
              TIMELINE — {film.timeline}
            </p>
          )}
          {film.release && (
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, letterSpacing: '0.12em', color: 'var(--fg-dim)' }}>
              RELEASE — {film.release}
            </p>
          )}
          <div className="credits-grid">
            {film.credits.map((c, i) => (
              <div className="credit" key={i}>
                <div className="role">{c.role}</div>
                <div className="name">{c.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {film.episodes && film.episodes.length > 0 && (
        <section className="case-episodes">
          <div className="ce-head">
            <div>
              <div className="ce-eyebrow">SERIES CATALOG</div>
              <h3 className="ce-title">EPISODE <em>INDEX</em></h3>
              <div className="ce-sub">
                {film.episodes.length} episodes · click any tile to watch on YouTube
              </div>
            </div>
            {film.playlistId && (
              <a
                className="ce-watchall"
                href={`https://www.youtube.com/playlist?list=${film.playlistId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                WATCH FULL PLAYLIST ↗
              </a>
            )}
          </div>
          {(() => {
            const eps = film.episodes;
            const half = Math.ceil(eps.length / 2);
            const rows = [eps.slice(0, half), eps.slice(half)];
            const renderCard = (ep: { id: string; label: string }, key: string) => (
              <a
                className="ce-card"
                key={key}
                href={`https://www.youtube.com/watch?v=${ep.id}${film.playlistId ? '&list=' + film.playlistId : ''}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="ce-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://i.ytimg.com/vi/${ep.id}/hqdefault.jpg`}
                    alt={ep.label}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="ce-shade" />
                  <div className="ce-play" aria-hidden="true">▶</div>
                </div>
                <div className="ce-label">{ep.label}</div>
              </a>
            );
            return (
              <div className="ce-rows">
                {rows.map((row, ri) => (
                  // Two passes of the row run side-by-side so the CSS animation
                  // can translate exactly -50% and loop seamlessly. Hover pauses.
                  <div className={'ce-row' + (ri === 1 ? ' reverse' : '')} key={ri}>
                    <div className="ce-track">
                      {row.map((ep) => renderCard(ep, 'a-' + ep.id))}
                      {row.map((ep) => renderCard(ep, 'b-' + ep.id))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </section>
      )}

      <div className="case-next" onClick={() => onPick(next)}>
        <div>
          <div className="next-label">NEXT FEATURE — {next.category}</div>
          <div className="next-title">{next.title}</div>
        </div>
        <div className="arrow-big">→</div>
      </div>
    </div>
  );
}
