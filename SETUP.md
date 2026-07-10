# S'QB Pictures — Setup Guide (Plain English)

This is your studio website. It has four pages:

- **Home** — the cinematic hero, manifesto, clients, verticals, the team "engine", testimonials, BTS, contact form.
- **Video** — full reel with filters, the spinning "barrel" widget, Cocoon flagship section, vertical-cinema tickets.
- **AI Lab** — three-pane Animated / Realistic / VFX picker with deep-dive sections.
- **Social** — Creator-as-a-Service blocks for Harkirat, Science & Fun, Appx, Sunstone.

You'll never have to touch code to run it. Just follow these steps.

---

## 1. One-time setup (~10 minutes)

### Install Node.js

Node is the runtime that powers the site.

1. Go to <https://nodejs.org/>.
2. Click the big green button labeled **LTS** (currently 20.x).
3. Run the installer. Defaults are fine. Click through.

To check it worked, open **Terminal** (press Cmd+Space on Mac, type "Terminal", hit enter) and type:

```
node -v
```

You should see something like `v20.17.0`. If you do, you're done with this step.

### Install the website's dependencies

In Terminal, navigate to the project folder:

```
cd ~/Downloads/sqb-website
```

Then run:

```
npm install
```

This downloads everything the site needs into a folder called `node_modules`. Takes about 1–2 minutes. You only have to do this once (and again if you ever change `package.json`).

### Set up your Resend API key

This is what makes the contact form actually send you emails.

1. Go to <https://resend.com> and sign up (free tier is plenty).
2. Add and verify your domain `sqbpictures.com` (Resend will tell you exactly which DNS records to add — you do this once with your domain registrar). Until then, you can test using their built-in `onboarding@resend.dev` sender.
3. Go to <https://resend.com/api-keys> and click **Create API Key**. Name it something like "S'QB Website". Copy the key — it starts with `re_`.
4. In the project folder (`~/Downloads/sqb-website`), create a new file named exactly `.env.local`. The easiest way: in Terminal, run

   ```
   cp .env.example .env.local
   open -e .env.local
   ```

   That opens it in TextEdit. Replace the placeholder values:

   ```
   RESEND_API_KEY=re_your_api_key_here
   CONTACT_TO=hello@sqbpictures.com
   CONTACT_FROM=S'QB Site <hello@sqbpictures.com>
   ```

   > ⚠️ **Never paste a real key into this file.** `SETUP.md` is committed to a
   > public repo — anything written here is visible to the world (and to bots
   > that scan GitHub for API keys). Real values belong only in `.env.local`
   > (which is gitignored) and in the Vercel dashboard.

   (If your domain isn't verified in Resend yet, leave `CONTACT_FROM` as `S'QB Site <onboarding@resend.dev>`.)

   Save and close.

Important: the file is called `.env.local`. The leading dot matters. This file stays on your computer (and on your hosting server) — it's never published to the public website. The API key is safe.

---

## 2. Running the site locally

Whenever you want to see the site on your own machine:

```
cd ~/Downloads/sqb-website
npm run dev
```

You'll see a line like `Local: http://localhost:3000`. Open that in your browser. The site is live. Edit any file and it'll refresh automatically.

When you're done, go back to Terminal and press **Ctrl+C** to stop it.

---

## 3. Deploying to the internet (Vercel — recommended)

Vercel is the company that makes Next.js. They host Next.js sites for free, and the setup takes about 5 minutes.

1. Push the project folder to GitHub:
   - Create an account at <https://github.com> if you don't have one.
   - Create a new repository called `sqb-website`.
   - In Terminal:
     ```
     cd ~/Downloads/sqb-website
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/surajsh661/sqb-website.git
     git push -u origin main
     ```
2. Sign up at <https://vercel.com> using your GitHub account.
3. Click **Add New → Project**, pick the `sqb-website` repo, click **Import**.
4. On the setup screen, expand **Environment Variables** and add:
   - `RESEND_API_KEY` — paste your Resend key
   - `CONTACT_TO` — `hello@sqbpictures.com`
   - `CONTACT_FROM` — `S'QB Site <hello@sqbpictures.com>` (or the `onboarding@resend.dev` fallback)
5. Click **Deploy**. Wait ~2 minutes. You'll get a URL like `sqb-website.vercel.app`.
6. To use your real domain (`sqbpictures.com`): Vercel → Project → Settings → Domains → add your domain. They'll tell you which DNS records to point at them.

That's it. Every time you push a change to GitHub's `main` branch, Vercel rebuilds and re-deploys automatically.

---

## 4. Where things live (in case you want to tweak)

- `app/page.tsx` — the homepage layout. Add/remove sections here.
- `app/work/page.tsx`, `app/ai-lab/page.tsx`, `app/social/page.tsx` — the three sub-pages.
- `app/styles.css` and `app/page-styles.css` — all the visual styling. Edit colors, spacing, fonts here.
- `lib/data.ts` — the film catalog, client logos, testimonials, creator list. **This is where you update content most often.**
- `components/` — the reusable building blocks (Hero, Topbar, CaseStudy, etc.).
- `public/` — images. Drop your client logos here under `public/clients/` and the data file will pick them up.
- `app/api/contact/route.ts` — the server code that handles the contact form. Don't usually need to touch.

---

## 5. Common gotchas

- **The contact form says "Try again"** — usually means the `RESEND_API_KEY` is wrong or `CONTACT_FROM` uses a domain you haven't verified in Resend. Easiest fix: switch `CONTACT_FROM` to `S'QB Site <onboarding@resend.dev>` to confirm Resend is working, then go back and verify your domain.
- **Logos show as text** — that's the fallback. You need to put your logo PNGs in `public/clients/` with the filenames listed in `lib/data.ts` (`haldiram.png`, `subway.png`, etc.).
- **Video thumbnails don't load** — Vimeo and Drive videos need to be set to public/embed-allowed. For Drive, share → Anyone with the link.
- **"command not found: node"** after installing — close and re-open Terminal. The PATH only refreshes on a new session.

---

## 6. The Resend key — why it's safe now

In the original prototype, the API key was hardcoded into the browser JavaScript. That meant anyone visiting the site could open the developer tools, read your key, and send emails as you (or rack up your bill). That's now fixed.

What this codebase does instead:

1. The contact form on the website sends its data to `/api/contact` — a small program on your server.
2. That server program reads `RESEND_API_KEY` from the secret `.env.local` file (or, in production, from Vercel's environment variables).
3. The server forwards the email through Resend.

The browser never sees the key. If someone inspects the site, they'll only see `fetch('/api/contact', ...)` — completely safe.

If your old key was already public, you should **revoke it**: Resend dashboard → API Keys → delete it → create a new one. Anyone who copied the old one no longer has access.

---

Questions? The whole site is contained in this folder. Nothing depends on anything outside it.
