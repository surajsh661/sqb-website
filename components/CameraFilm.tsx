'use client';
import { useEffect, useRef } from 'react';

/**
 * The CINEMA × AI camera film. Plain autoPlay/muted on a <video> is unreliable
 * on mobile: React sets the `muted` ATTRIBUTE but not always the `muted`
 * PROPERTY, and iOS refuses to autoplay anything it considers un-muted; iOS also
 * defers autoplay for off-screen elements. So we force the muted property via a
 * ref and (re)call play() once the film scrolls into view.
 */
export default function CameraFilm() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true; // property, not just the attribute — required for iOS autoplay
    v.defaultMuted = true;
    v.setAttribute('webkit-playsinline', 'true'); // older iOS inline-playback flag
    const play = () => { const p = v.play(); if (p) p.catch(() => {}); };
    play();
    v.addEventListener('canplay', play);
    v.addEventListener('loadeddata', play);
    // iOS won't autoplay until the element is on screen — retry on entry.
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) play(); }),
      { threshold: 0.15 },
    );
    io.observe(v);
    return () => {
      io.disconnect();
      v.removeEventListener('canplay', play);
      v.removeEventListener('loadeddata', play);
    };
  }, []);

  return (
    <video
      ref={ref}
      className="mf-cam"
      src="/camera-website-lite.mp4"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
    />
  );
}
