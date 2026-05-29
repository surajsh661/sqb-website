'use client';
import { WORLD_PATH } from '@/lib/world-path';

// Poster-style service-area map.
//
// Visual approach: solid dark-warm continent silhouettes against a slightly
// lighter dark frame, with each service region marked by a small bright-yellow
// dot that emits a radar-pulse ring outward. No connecting arcs — the rings
// carry the "live signal" feel without crisscrossing the map.

interface Location {
  name: string;
  lat: number;
  lng: number;
  hub?: boolean;
}

const LOCATIONS: Location[] = [
  { name: 'India',     lat: 22.0,  lng:  79.0,  hub: true },
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

export default function ServiceMap() {
  return (
    <div className="service-poster">
      <div className="sp-frame">
        <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <radialGradient id="smHubGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="var(--accent)" stopOpacity="0.95" />
              <stop offset="55%"  stopColor="var(--accent)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="smDotGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="var(--accent)" stopOpacity="0.85" />
              <stop offset="60%"  stopColor="var(--accent)" stopOpacity="0.10" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Poster background plate — slightly lifted off the page, neutral
              grey tone so the site's yellow accent pops without competing
              with any warm brown. */}
          <rect x={0} y={0} width={W} height={H} fill="#141414" />

          {/* Continents — solid grey silhouettes, no outline. */}
          <g className="sp-land">
            <path
              d={WORLD_PATH}
              fillRule="evenodd"
              fill="#2c2c2c"
              stroke="none"
            />
          </g>

          {/* Radar-pulse rings — one set per location. Three concentric circles
              expand outward and fade, staggered so each location feels alive. */}
          <g className="sp-pulses">
            {LOCATIONS.map((l) => {
              const p = project(l.lat, l.lng);
              const cls = l.hub ? 'sp-pulse hub' : 'sp-pulse';
              return (
                <g key={'p' + l.name} transform={`translate(${p.x} ${p.y})`} className={cls}>
                  <circle cx={0} cy={0} r={0} fill="none" stroke="var(--accent)" strokeWidth="1.4" />
                  <circle cx={0} cy={0} r={0} fill="none" stroke="var(--accent)" strokeWidth="1.4" />
                  <circle cx={0} cy={0} r={0} fill="none" stroke="var(--accent)" strokeWidth="1.4" />
                </g>
              );
            })}
          </g>

          {/* Static glow halos behind each dot for body. */}
          <g className="sp-halos">
            {LOCATIONS.map((l) => {
              const p = project(l.lat, l.lng);
              const r = l.hub ? 30 : 16;
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
              const r = l.hub ? 5 : 3;
              return (
                <circle
                  key={'d' + l.name}
                  cx={p.x}
                  cy={p.y}
                  r={r}
                  fill="var(--accent)"
                  className={l.hub ? 'sp-dot hub' : 'sp-dot'}
                />
              );
            })}
          </g>
        </svg>

        {/* Poster title block — kept clean. No coordinates. */}
        <div className="sp-title">
          <div className="sp-title-main">S &nbsp; Q &nbsp; B &nbsp; · &nbsp; W O R L D W I D E</div>
          <div className="sp-rule" />
          <div className="sp-title-sub">PAN-INDIA · UAE · SAUDI · DUBAI · SINGAPORE · SRI LANKA · LONDON · CANADA · USA</div>
        </div>
      </div>
    </div>
  );
}
