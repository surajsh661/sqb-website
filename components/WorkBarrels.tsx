'use client';
import { useEffect, useRef } from 'react';
import HeroThumb from './HeroThumb';
import type { Film } from '@/lib/types';

function wireBarrel(stageEl: HTMLElement) {
  if (!stageEl || stageEl.dataset.wired) return;
  stageEl.dataset.wired = '1';
  const inner = stageEl.querySelector<HTMLElement>('.ws-barrel');
  if (!inner) return;
  const n = inner.children.length;
  const sectorDeg = 360 / n;
  let rot = 0;
  let velocity = 0;
  let dragging = false;
  let lockedAxis: 'x' | 'y' | null = null;
  let startX = 0, startY = 0, lastX = 0, lastT = 0;
  let raf = 0;

  const isCardFrontal = (cardEl: Element) => {
    const i = parseInt((cardEl as HTMLElement).dataset.i || '0', 10);
    const cardDeg = i * sectorDeg + rot;
    let normalized = ((cardDeg % 360) + 360) % 360;
    if (normalized > 180) normalized -= 360;
    return Math.abs(normalized) < 70;
  };

  const apply = () => {
    rot += velocity;
    if (Math.abs(velocity) > 0.01) velocity *= 0.94;
    else velocity = 0;
    inner.style.setProperty('--barrel-rot', rot + 'deg');
    [...inner.children].forEach((c) => c.classList.toggle('frontal', isCardFrontal(c)));
    if (Math.abs(velocity) > 0.01 || dragging) raf = requestAnimationFrame(apply);
  };

  [...inner.children].forEach((c, i) => {
    (c as HTMLElement).dataset.i = String(i);
  });

  // Kill the browser's native image-drag inside the stage (a drag started on a
  // card's <img> "picks up" a ghost thumbnail and steals the pointer events, so
  // the ring stops spinning mid-gesture).
  stageEl.addEventListener('dragstart', (e) => e.preventDefault());

  stageEl.addEventListener('pointerdown', (e) => {
    dragging = true;
    lockedAxis = null;
    startX = e.clientX; startY = e.clientY;
    lastX = e.clientX; lastT = performance.now();
    velocity = 0;
    try { stageEl.setPointerCapture(e.pointerId); } catch {}
    stageEl.classList.add('dragging');
    cancelAnimationFrame(raf); raf = requestAnimationFrame(apply);
  });
  stageEl.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (!lockedAxis && Math.abs(dx) + Math.abs(dy) > 6) {
      lockedAxis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (lockedAxis === 'y') {
        dragging = false;
        stageEl.classList.remove('dragging');
        return;
      }
    }
    if (lockedAxis !== 'x') return;
    e.preventDefault();
    const r = stageEl.getBoundingClientRect();
    const instDx = e.clientX - lastX;
    const now = performance.now();
    const dt = Math.max(1, now - lastT);
    const degPerPx = 200 / r.width;
    rot += instDx * degPerPx;
    velocity = (instDx * degPerPx) * (16 / dt);
    lastX = e.clientX; lastT = now;
    inner.style.setProperty('--barrel-rot', rot + 'deg');
    [...inner.children].forEach((c) => c.classList.toggle('frontal', isCardFrontal(c)));
  });
  const release = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    try { stageEl.releasePointerCapture(e.pointerId); } catch {}
    stageEl.classList.remove('dragging');
    cancelAnimationFrame(raf); raf = requestAnimationFrame(apply);
  };
  stageEl.addEventListener('pointerup', release);
  stageEl.addEventListener('pointercancel', release);

  [...inner.children].forEach((c) => c.classList.toggle('frontal', isCardFrontal(c)));
}

export default function WorkBarrels({ films }: { films: Film[] }) {
  const upperRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLDivElement | null>(null);

  const goodFilms = films.filter(
    (f) => !(f.genres || []).includes('vertical') && (f.type === 'vm' || f.type === 'yt'),
  );
  const setA = goodFilms.slice(0, 8);
  const setB = goodFilms.slice(8, 16);

  useEffect(() => {
    if (upperRef.current) wireBarrel(upperRef.current);
    if (mainRef.current) wireBarrel(mainRef.current);
  }, []);

  return (
    <div className="ws-barrels">
      {setB.length > 0 && (
        <div className="ws-barrel-stage upper" ref={upperRef}>
          <div className="ws-barrel">
            {setB.map((f, i) => (
              <div
                className="ws-barrel-card"
                key={f.id}
                style={{ ['--i' as any]: i, ['--n' as any]: setB.length }}
              >
                <HeroThumb film={f} />
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="ws-barrel-stage main" ref={mainRef}>
        <div className="ws-barrel">
          {setA.map((f, i) => (
            <div
              className="ws-barrel-card"
              key={f.id}
              style={{ ['--i' as any]: i, ['--n' as any]: setA.length }}
            >
              <HeroThumb film={f} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
