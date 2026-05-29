'use client';
import { WORLD_PATH } from '@/lib/world-path';

// Poster-style service-area map. Inspired by Terraink/MapToPoster: deep navy
// canvas, thin amber outlines, title block at the bottom. Service regions
// are marked by small pulsing dots with dashed great-circle arcs sweeping
// from India out to every international destination.

interface Location {
  name: string;
  lat: number;
  lng: number;
  hub?: boolean;
}

const LOCATIONS: Location[] = [
  { name: 'India',     lat: 22.0,  lng:  79.0,  hub: true },
  { name: 'Nepal',     lat: 28.4,  lng:  84.1 },
  { name: 'Sri Lanka', lat:  6.9,  lng:  79.9 },
  { name: 'UAE',       lat: 24.4,  lng:  54.4 },
  { name: 'Dubai',     lat: 25.2,  lng:  55.3 },
  { name: 'Saudi',     lat: 24.7,  lng:  46.7 },
  { name: 'Singapore', lat:  1.4,  lng: 103.8 },
  { name: 'London',    lat: 51.5,  lng:  -0.1 },
  { name: 'Canada',    lat: 53.0,  lng:-106.0 },
  { name: 'USA',       lat: 38.0,  lng: -97.0 },
];

const W = 1000;
const H = 500;

function project(lat: number, lng: number) {
  return {
    x: ((lng + 180) / 360) * W,
    y: ((90 - lat) / 180) * H,
  };
}

function arcPath(a: { x: number; y: number }, b: { x: number; y: number }) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const lift = Math.min(140, dist * 0.28);
  const cx = mx;
  const cy = my - lift;
  return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
}

export default function ServiceMap() {
  const hub = LOCATIONS.find((l) => l.hub)!;
  const hubPt = project(hub.lat, hub.lng);

  return (
    <div className="service-poster">
      <div className="sp-frame">
        <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <radialGradient id="smHubGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#ffd54a" stopOpacity="0.95" />
              <stop offset="55%"  stopColor="#ffd54a" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#ffd54a" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="smDotGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#ffd54a" stopOpacity="0.85" />
              <stop offset="60%"  stopColor="#ffd54a" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#ffd54a" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Poster background — deeper navy than the section gradient so
              the frame reads as a separate canvas. */}
          <rect x={0} y={0} width={W} height={H} fill="#08132c" />

          {/* Continents — thin amber outlines only, no fill. Pure poster style. */}
          <g className="sp-land">
            <path
              d={WORLD_PATH}
              fillRule="evenodd"
              fill="none"
              stroke="rgba(255, 213, 74, 0.75)"
              strokeWidth="0.5"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>

          {/* Great-circle arcs from India out to every international destination. */}
          <g className="sp-arcs" fill="none" stroke="#ffd54a" strokeWidth="0.8" strokeLinecap="round" strokeOpacity="0.55">
            {LOCATIONS.filter((l) => !l.hub).map((l) => {
              const p = project(l.lat, l.lng);
              return <path key={l.name} d={arcPath(hubPt, p)} />;
            })}
          </g>

          {/* Glow halos behind each dot. */}
          <g className="sp-halos">
            {LOCATIONS.map((l) => {
              const p = project(l.lat, l.lng);
              const r = l.hub ? 32 : 18;
              return (
                <circle
                  key={'h' + l.name}
                  cx={p.x}
                  cy={p.y}
                  r={r}
                  fill={l.hub ? 'url(#smHubGlow)' : 'url(#smDotGlow)'}
                  className={l.hub ? 'sp-halo hub' : 'sp-halo'}
                />
              );
            })}
          </g>

          {/* The dots themselves. */}
          <g className="sp-dots">
            {LOCATIONS.map((l) => {
              const p = project(l.lat, l.lng);
              const r = l.hub ? 4.5 : 2.8;
              return (
                <circle
                  key={'d' + l.name}
                  cx={p.x}
                  cy={p.y}
                  r={r}
                  fill="#ffd54a"
                  className={l.hub ? 'sp-dot hub' : 'sp-dot'}
                />
              );
            })}
          </g>
        </svg>

        {/* Poster title block at the bottom — the visual hook from MapToPoster /
            Terraink: spaced caps + accent rule + coordinate fact. */}
        <div className="sp-title">
          <div className="sp-title-main">S &nbsp; Q &nbsp; B &nbsp; · &nbsp; W O R L D W I D E</div>
          <div className="sp-rule" />
          <div className="sp-title-sub">PAN-INDIA · UAE · SAUDI · DUBAI · SINGAPORE · NEPAL · SRI LANKA · LONDON · CANADA · USA</div>
          <div className="sp-title-coord">22.3511° N / 78.6677° E &nbsp; — HUB STUDIOS · DELHI &amp; MUMBAI</div>
        </div>
      </div>
    </div>
  );
}
