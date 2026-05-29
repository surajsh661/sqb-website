'use client';
import { WORLD_PATH } from '@/lib/world-path';

// Service-area world map. Equirectangular projection (lat/lng → x/y on a
// 1000×500 viewBox). Glowing dots mark each region we ship into; subtle
// arcs sweep from India out to every international market.

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

// Quadratic-bezier arc from A to B with control point lifted halfway and pulled
// up by ~25% of the chord length — gives the great-circle "globe" feel.
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
    <section className="service-map" data-screen-label="05 Reach">
      <div className="sm-head">
        <div className="eyebrow"><span className="num">05</span> <span>WHERE WE SHIP</span></div>
        <h2>PAN-INDIA. <em>WORLD-WIDE.</em></h2>
        <p className="sm-blurb">
          We deliver for brands and creators across India and into the UAE, Saudi, Dubai,
          Singapore, Nepal, Sri Lanka, London, Canada and the USA. Wherever the brief lands,
          we&apos;ve probably already shot in that timezone.
        </p>
      </div>

      <div className="sm-canvas">
        <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <radialGradient id="smHubGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.95" />
              <stop offset="55%" stopColor="var(--accent)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="smDotGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.85" />
              <stop offset="60%" stopColor="var(--accent)" stopOpacity="0.10" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Real continent outlines from Natural Earth 110m (simplified). */}
          <g className="sm-land">
            <path
              d={WORLD_PATH}
              fillRule="evenodd"
              fill="rgba(120, 160, 220, 0.10)"
              stroke="rgba(120, 160, 220, 0.55)"
              strokeWidth="0.6"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>

          {/* Arcs from India to every international destination */}
          <g className="sm-arcs" fill="none" stroke="var(--accent)" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.6">
            {LOCATIONS.filter((l) => !l.hub).map((l) => {
              const p = project(l.lat, l.lng);
              return <path key={l.name} d={arcPath(hubPt, p)} />;
            })}
          </g>

          {/* Glow halos behind each dot */}
          <g className="sm-halos">
            {LOCATIONS.map((l) => {
              const p = project(l.lat, l.lng);
              const r = l.hub ? 38 : 22;
              return (
                <circle
                  key={'h' + l.name}
                  cx={p.x}
                  cy={p.y}
                  r={r}
                  fill={l.hub ? 'url(#smHubGlow)' : 'url(#smDotGlow)'}
                  className={l.hub ? 'sm-halo hub' : 'sm-halo'}
                />
              );
            })}
          </g>

          {/* The dots themselves */}
          <g className="sm-dots">
            {LOCATIONS.map((l) => {
              const p = project(l.lat, l.lng);
              const r = l.hub ? 5.5 : 3.5;
              return (
                <g key={'d' + l.name} className={l.hub ? 'sm-dot hub' : 'sm-dot'}>
                  <circle cx={p.x} cy={p.y} r={r} fill="var(--accent)" />
                </g>
              );
            })}
          </g>

          {/* Labels */}
          <g className="sm-labels" fill="var(--fg)" fontFamily="'JetBrains Mono', monospace" fontSize="11" letterSpacing="0.18em">
            {LOCATIONS.map((l) => {
              const p = project(l.lat, l.lng);
              // Push labels above the dot, with a small horizontal lift if it'd
              // overlap a neighbour (UAE / Dubai / Saudi cluster + India / Nepal).
              const dyMap: Record<string, number> = {
                Nepal: -14, India: 22, Dubai: -14, UAE: 8, Saudi: -14,
              };
              return (
                <text
                  key={'l' + l.name}
                  x={p.x}
                  y={p.y + (dyMap[l.name] ?? -12)}
                  textAnchor="middle"
                >
                  {l.name.toUpperCase()}
                </text>
              );
            })}
          </g>
        </svg>
      </div>

      <ul className="sm-list" aria-label="Service regions">
        <li>PAN-INDIA</li>
        <li>UAE</li>
        <li>DUBAI</li>
        <li>SAUDI</li>
        <li>SINGAPORE</li>
        <li>NEPAL</li>
        <li>SRI LANKA</li>
        <li>LONDON</li>
        <li>CANADA</li>
        <li>USA</li>
      </ul>
    </section>
  );
}
