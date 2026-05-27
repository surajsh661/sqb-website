'use client';
import { useEffect, useRef, useState } from 'react';
import { SQB_TEAM } from '@/lib/data';

const founderRadius = 130;
const founderPositions = [
  { cx: -founderRadius - 8, cy: 0, size: 240 },
  { cx: founderRadius + 8, cy: 0, size: 240 },
];

const teamPositions = [
  { cx: -480, cy: -180, size: 110 },
  { cx: -360, cy: 170, size: 92 },
  { cx: -560, cy: 60, size: 78 },
  { cx: -240, cy: -240, size: 86 },
  { cx: 240, cy: -240, size: 86 },
  { cx: 360, cy: 170, size: 92 },
  { cx: 560, cy: 60, size: 78 },
  { cx: 480, cy: -180, size: 110 },
];

const ENGINE_REACH = 380;

export default function Engine() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [m, setM] = useState({ x: 0.5, y: 0.5 });
  const team = SQB_TEAM.team;

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    let raf: number;
    const target = { x: 0.5, y: 0.5 };
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width;
      target.y = (e.clientY - r.top) / r.height;
    };
    const onLeave = () => { target.x = 0.5; target.y = 0.5; };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    const tick = () => {
      setM((prev) => ({
        x: prev.x + (target.x - prev.x) * 0.08,
        y: prev.y + (target.y - prev.y) * 0.08,
      }));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  const reactive = (cx: number, cy: number) => {
    const mx = (m.x - 0.5) * 1200;
    const my = (m.y - 0.5) * 600;
    const dx = mx - cx, dy = my - cy;
    const d = Math.sqrt(dx * dx + dy * dy);
    const reach = ENGINE_REACH;
    const closeness = Math.max(0, 1 - d / reach);
    const scale = 1 + closeness * 0.55;
    const tx = -dx * closeness * 0.08;
    const ty = -dy * closeness * 0.08;
    return { transform: `translate(calc(-50% + ${cx + tx}px), calc(-50% + ${cy + ty}px)) scale(${scale})` };
  };

  return (
    <section className="engine" data-screen-label="07 The Engine">
      <div className="heading">
        <div className="eyebrow" style={{ justifyContent: 'center' }}>
          <span className="num">07</span> <span>THE PEOPLE</span>
        </div>
        <h2>THE <em>ENGINE</em></h2>
        <div className="sub">FILMMAKERS FIRST · AI OPERATORS SECOND</div>
      </div>
      <div className="stage" ref={stageRef}>
        {founderPositions.map((p, i) => {
          const f = SQB_TEAM.founders[i];
          return (
            <div
              key={'f' + i}
              className="circle founder"
              style={{ width: p.size, height: p.size, top: '50%', left: '50%', ...reactive(p.cx, p.cy) }}
            >
              <div className="ph">
                <span className="role">{f.role}</span>
                {f.name}
              </div>
            </div>
          );
        })}
        {teamPositions.map((p, i) => (
          <div
            key={'t' + i}
            className="circle"
            style={{ width: p.size, height: p.size, top: '50%', left: '50%', ...reactive(p.cx, p.cy) }}
          >
            <div className="ph">
              <span className="role">{team[i]?.name || 'TEAM'}</span>
              IMG
            </div>
          </div>
        ))}
      </div>
      <div className="footnote">
        <div className="rule" />
        <p>
          Two founders. A small core of operators, writers, editors and AI supervisors who can hold a
          camera at 6am and a render queue at midnight.
        </p>
      </div>
    </section>
  );
}
