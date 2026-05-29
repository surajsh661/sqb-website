'use client';

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

          {/* Stylised continent silhouettes — minimal blobs, not cartographic,
              just enough to read as "the world". */}
          <g className="sm-land" fill="none" stroke="var(--fg)" strokeOpacity="0.18" strokeWidth="1.2" strokeLinejoin="round">
            {/* North America */}
            <path d="M 130 90 Q 200 70 280 95 Q 310 130 320 170 Q 308 215 280 230 Q 250 235 235 220 Q 225 215 218 230 Q 195 235 175 215 Q 155 180 145 145 Q 138 115 130 90 Z" />
            {/* Central + Caribbean tail */}
            <path d="M 268 235 Q 282 250 290 260" />
            {/* South America */}
            <path d="M 290 260 Q 320 268 328 295 Q 338 340 322 380 Q 305 410 290 405 Q 280 380 282 350 Q 280 305 290 260 Z" />
            {/* Europe */}
            <path d="M 470 110 Q 510 100 545 110 Q 555 130 540 145 Q 525 158 540 170 Q 530 180 510 175 Q 488 168 478 155 Q 465 135 470 110 Z" />
            {/* Africa */}
            <path d="M 490 180 Q 535 175 555 195 Q 568 240 562 290 Q 548 340 525 365 Q 508 372 495 355 Q 478 320 478 280 Q 478 230 490 180 Z" />
            {/* Middle East nub */}
            <path d="M 555 175 Q 580 175 595 195 Q 600 215 585 225 Q 570 220 558 205 Q 552 190 555 175 Z" />
            {/* Asia mainland */}
            <path d="M 565 105 Q 660 90 750 105 Q 830 120 875 155 Q 880 195 855 220 Q 800 235 740 225 Q 690 220 660 235 Q 625 230 605 215 Q 585 195 575 170 Q 565 140 565 105 Z" />
            {/* India peninsula */}
            <path d="M 685 215 Q 700 220 700 235 Q 695 255 685 265 Q 678 255 678 240 Q 678 222 685 215 Z" />
            {/* Southeast Asia / Indonesia */}
            <path d="M 800 240 Q 830 255 850 265 Q 870 280 855 290 Q 820 290 795 280 Q 780 268 800 240 Z" />
            {/* Australia */}
            <path d="M 815 320 Q 855 312 895 325 Q 905 345 880 360 Q 845 365 820 355 Q 810 340 815 320 Z" />
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
