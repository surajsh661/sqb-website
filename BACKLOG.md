# Website build list

Running list of site work — what's shipped, what's queued, and what's blocked
waiting on info. Newest items near the top.

---

## ✅ Done

### Consolidate www vs non-www (canonical host fix)
**Shipped.** Both `https://sqbpictures.com` and `https://www.sqbpictures.com`
were serving the site, so Google indexed them separately and split the ranking.
We picked **non-www (`sqbpictures.com`)** as the single canonical — it ranks
better (avg position ~3.6 vs www's ~6.6) and every external listing (Google,
Clutch, Crunchbase) already uses it.

What the code does now (`next.config.mjs` → `redirects()`):
- Any `www.sqbpictures.com` request → **permanent redirect** to the same path
  on `sqbpictures.com` (308, which Google treats the same as a 301 and passes
  all ranking signals). Path + query string are preserved.
- `http://` → `https://` is enforced by Vercel + the HSTS header.
- Canonical tags, sitemap URLs, `og:url`, and the robots host were already all
  non-www, so everything now points to one address.

**After it deploys — one manual step (Suraj):** in Google Search Console, the
www URLs will gradually drop out and consolidate onto non-www over a few weeks.
Nothing to do unless we want to nudge it (we can request validation).

> Note: this redirect runs at the app (Vercel) level. It works because both
> www and apex currently reach the site. If we ever want it enforced one hop
> earlier (at Cloudflare), it can also be added there as a Bulk Redirect —
> not required, the app-level rule already handles it.

---

## ⏳ Blocked — waiting on details from Suraj

### "Dhokebaaz Dilruba" show page
People are searching the show by name — "cast", "actress name", "lead actress",
"episodes" — and landing on nothing. A dedicated page would catch traffic we're
already earning. Built to rank for those exact searches: headline, synopsis,
cast section (with photos), watch link, SEO title + description.

**Need from Suraj before writing:**
1. **Cast list** — actor names + the character each one plays. (The
   "cast name with photo" searches are literally people wanting this.)
2. **Where it streams** — YouTube / which platform + a link.
3. **Synopsis** — one or two lines of story.
4. **Genre + episode count** — e.g. "vertical drama, X episodes".
5. *(Optional)* cast photos, or I'll pull stills/posters if you point me to them.

Once these land, the page goes straight onto the site.
