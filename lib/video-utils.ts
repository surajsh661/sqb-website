import type { Film, VideoType } from './types';

interface VideoLike { type: VideoType; videoId: string }

export function videoSrc(film: VideoLike, opts: { bg?: boolean } = {}): string {
  const bg = opts.bg !== false; // default background mode
  if (film.type === 'vm') {
    if (bg) {
      return `https://player.vimeo.com/video/${film.videoId}?background=1&autoplay=1&loop=1&muted=1&controls=0&dnt=1&autopause=0&playsinline=1&transparent=0`;
    }
    return `https://player.vimeo.com/video/${film.videoId}?autoplay=1&loop=1&muted=1&controls=0&dnt=1&autopause=0&playsinline=1&transparent=0&api=1&player_id=sqb_player`;
  }
  if (film.type === 'gd') return `https://drive.google.com/file/d/${film.videoId}/preview`;
  if (film.type === 'ig') return `https://www.instagram.com/reel/${film.videoId}/embed/`;
  const origin = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';
  return `https://www.youtube-nocookie.com/embed/${film.videoId}?autoplay=1&mute=1&loop=1&playlist=${film.videoId}&controls=0&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&playsinline=1&disablekb=1&enablejsapi=1&origin=${origin}`;
}

export function thumbSources(film: VideoLike): string[] {
  if (film.type === 'yt') {
    return [
      `https://i.ytimg.com/vi/${film.videoId}/maxresdefault.jpg`,
      `https://i.ytimg.com/vi/${film.videoId}/hqdefault.jpg`,
      `https://i.ytimg.com/vi/${film.videoId}/mqdefault.jpg`,
    ];
  }
  if (film.type === 'gd') {
    return [
      `https://drive.google.com/thumbnail?id=${film.videoId}&sz=w1600`,
      `https://drive.google.com/thumbnail?id=${film.videoId}&sz=w800`,
    ];
  }
  if (film.type === 'ig') {
    return [`https://www.instagram.com/p/${film.videoId}/media/?size=l`];
  }
  return [
    `https://vumbnail.com/${film.videoId}_portrait_large.jpg`,
    `https://vumbnail.com/${film.videoId}_large.jpg`,
    `https://vumbnail.com/${film.videoId}_medium.jpg`,
    `https://vumbnail.com/${film.videoId}.jpg`,
  ];
}

export async function fetchVimeoThumb(videoId: string): Promise<string | null> {
  try {
    const r = await fetch(`https://vimeo.com/api/oembed.json?url=https%3A//vimeo.com/${videoId}`);
    const j = await r.json();
    return (j && j.thumbnail_url) || null;
  } catch {
    return null;
  }
}

let __revealSetup = false;
export function setupReveal(): void {
  if (typeof window === 'undefined' || __revealSetup) return;
  __revealSetup = true;
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in'); }),
    { threshold: 0.06, rootMargin: '0px 0px -6% 0px' },
  );
  const wire = () => {
    document
      .querySelectorAll(
        '.section, .engine, .verticals, .bts, .contact, .footer, .stats-section, .testimonials, .manifesto, .work-vision, .work-cap, .work-scale, .work-films, .vertical-cinema, .ailab-section, .ailab-hero, .ai-headline, .ai-track-section, .social-hero, .creator, .trusted-block',
      )
      .forEach((el) => {
        if (!el.classList.contains('reveal')) {
          el.classList.add('reveal');
          io.observe(el);
        }
      });
  };
  wire();
  const mo = new MutationObserver(wire);
  mo.observe(document.body, { childList: true, subtree: true });
}
