/** @type {import('next').NextConfig} */

// ── Security headers (every route) ──────────────────────────────────────────
// Focused on the high-value, zero-breakage protections:
// - HSTS: browsers only ever talk to us over HTTPS (stops SSL-strip MITM).
// - frame-ancestors/X-Frame-Options: nobody can embed sqbpictures.com inside
//   their own page (stops clickjacking / UI-hijack overlays).
// - object-src 'none' + base-uri 'self': blocks legacy plugin embeds and
//   <base>-tag hijacks of relative URLs.
// - form-action 'self': our forms can only ever submit to us.
// - nosniff: browsers can't "guess" a response into an executable type.
// - Referrer-Policy / Permissions-Policy: leak less, allow no camera/mic/etc.
// NOTE: deliberately NOT micromanaging script-src/img-src/frame-src — the site
// embeds Vimeo/YouTube/Drive/Instagram/Cal.com players, and an over-tight CSP
// here is the classic way to silently break them. The directives above carry
// the anti-hijack weight without that risk.
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  {
    key: 'Content-Security-Policy',
    value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self';",
  },
];

const nextConfig = {
  reactStrictMode: true,
  // The site never serves user-uploaded HTML/JS; X-Powered-By only advertises
  // the framework version to attackers scanning for known CVEs.
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'vumbnail.com' },
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: 'i.vimeocdn.com' },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
export default nextConfig;
