# S'QB Pictures — Website

A Next.js (App Router) port of the S'QB Pictures Claude Design prototype.

**If you're new here, start with [SETUP.md](./SETUP.md) — it's a step-by-step plain-English guide to running and deploying this site.**

## Pages

- `/` — Home (hero carousel + manifesto + clients + verticals + engine + testimonials + BTS + contact)
- `/work` — Video reel with filters, spinning barrel, Cocoon, vertical cinema marquee
- `/ai-lab` — Animated / Realistic / VFX picker + per-track grids
- `/social` — Creator-as-a-Service blocks (Harkirat, Science & Fun, Appx, Sunstone)

## Stack

- Next.js 14 (App Router) · React 18 · TypeScript
- Plain CSS (ported verbatim from the prototype — see `app/styles.css` and `app/page-styles.css`)
- Resend for transactional email (contact form → server route → Resend)

## Project layout

```
sqb-website/
├── app/
│   ├── layout.tsx           # Root layout + font/script preloads
│   ├── page.tsx             # Home page
│   ├── work/page.tsx        # /work
│   ├── ai-lab/page.tsx      # /ai-lab
│   ├── social/page.tsx      # /social
│   ├── api/contact/route.ts # POST /api/contact → Resend
│   ├── styles.css           # Theme + shared styles
│   └── page-styles.css      # Per-page layout styles
├── components/              # Reusable React components
├── lib/
│   ├── data.ts              # Film catalog, testimonials, creators, logos
│   ├── types.ts             # TypeScript types
│   └── video-utils.ts       # videoSrc / thumbSources / reveal observer
└── public/                  # Logos and static assets
```

## Scripts

- `npm run dev` — Local dev server at `http://localhost:3000`
- `npm run build` — Production build
- `npm run start` — Run the production build locally

## Environment

Create `.env.local` from `.env.example`. Required: `RESEND_API_KEY`. See `SETUP.md` for details.

## Security note

The contact form posts to `/api/contact`, which holds the Resend key server-side. The original prototype shipped the key in browser JavaScript — that was rotated; the new key lives only on the server.

## License

MIT (matching the design prototype).
