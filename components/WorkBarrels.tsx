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

  // Single exit point for a drag. Always clears the state/class — never gated
  // on `dragging` — so a missed pointerup can't leave the ring "grabbed".
  const endDrag = (e?: PointerEvent) => {
    const wasDragging = dragging;
    dragging = false;
    lockedAxis = null;
    if (e) { try { stageEl.releasePointerCapture(e.pointerId); } catch {} }
    stageEl.classList.remove('dragging');
    if (wasDragging) { cancelAnimationFrame(raf); raf = requestAnimationFrame(apply); }
  };

  stageEl.addEventListener('pointerdown', (e) => {
    // Only a primary-button press starts a drag (no right/middle click spins).
    if (e.pointerType === 'mouse' && e.button !== 0) return;
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
    // Self-heal: if the mouse button is no longer pressed (release happened
    // outside the window / was swallowed by a native drag), end the drag now —
    // otherwise the ring would track the bare cursor as if still grabbed.
    if (e.pointerType === 'mouse' && e.buttons === 0) { endDrag(e); return; }
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (!lockedAxis && Math.abs(dx) + Math.abs(dy) > 6) {
      lockedAxis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (lockedAxis === 'y') {
        // Vertical intent → this is a page scroll, not a spin. Fully release
        // (including pointer capture) so no half-armed state lingers.
        endDrag(e);
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
  stageEl.addEventListener('pointerup', endDrag);
  stageEl.addEventListener('pointercancel', endDrag);
  stageEl.addEventListener('lostpointercapture', () => endDrag());
  // Backstops for releases the stage never hears about (e.g. mouseup over the
  // browser chrome, tab switch mid-drag).
  window.addEventListener('pointerup', () => endDrag());
  window.addEventListener('blur', () => endDrag());

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
