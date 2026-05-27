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
  const [audioOn, setAudioOn] = useState(false);

  useEffect(() => {
    if (!open || !film) return;
    setAudioOn(false);
    requestAnimationFrame(() => {
      if (rootRef.current) rootRef.current.scrollTop = 0;
    });
  }, [open, film?.id]);

  useEffect(() => {
    if (!open || !film || film.type !== 'vm') return;
    const w = window as any;
    if (!w.Vimeo || !w.Vimeo.Player) return;
    const t = setTimeout(() => {
      const f = iframeRef.current;
      if (!f) return;
      try { playerRef.current = new w.Vimeo.Player(f); } catch {}
    }, 120);
    return () => { clearTimeout(t); playerRef.current = null; };
  }, [open, film?.id, audioOn]);

  const toggleMute = () => {
    if (!film) return;
    const next = !audioOn;
    if (next) {
      setAudioOn(true);
    } else {
      if (film.type === 'vm' && playerRef.current) {
        playerRef.current.setMuted(true).catch(() => {});
      } else if (film.type === 'yt') {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'mute', args: [] }),
          '*',
        );
      }
      setAudioOn(false);
    }
  };

  if (!film) return null;
  const idx = films.findIndex((f) => f.id === film.id);
  const next = films[(idx + 1) % films.length];

  let src: string;
  if (film.type === 'vm') {
    src = `https://player.vimeo.com/video/${film.videoId}?autoplay=1&loop=1&muted=${audioOn ? 0 : 1}&controls=0&dnt=1&playsinline=1&title=0&byline=0&portrait=0`;
  } else if (film.type === 'gd') {
    src = `https://drive.google.com/file/d/${film.videoId}/preview`;
  } else {
    const origin = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';
    src = `https://www.youtube-nocookie.com/embed/${film.videoId}?autoplay=1&mute=${audioOn ? 0 : 1}&loop=1&playlist=${film.videoId}&controls=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1&origin=${origin}`;
  }
  const isVertical = (film.genres || []).includes('vertical') || film.aspect === '9:16';

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
            key={film.id + '-' + (audioOn ? 'on' : 'off')}
            src={src}
            title={film.title}
            allow="autoplay; encrypted-media; picture-in-picture"
          />
          {film.type !== 'gd' && (
            <button
              className={'case-mute' + (!audioOn ? ' pulse' : ' on')}
              onClick={toggleMute}
              aria-label={audioOn ? 'Mute' : 'Unmute'}
            >
              {!audioOn ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              )}
              <span className="cm-label">{audioOn ? 'SOUND ON' : 'TAP FOR SOUND'}</span>
            </button>
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
