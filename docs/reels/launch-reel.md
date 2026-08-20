# Website launch reel

**The reel is the energetic cut.** `site/scripts/gen-reel-hype.mjs` — 18s,
1080×1920, 30fps, H.264, no audio track (Reels take their audio in the app).
That is the one to post.

The typographic cut (`gen-reel.mjs`) stays in the repo as a fallback for a
quiet, evergreen slot, but it is not the launch post and is not being kept in
step with the copy. Treat it as archived until there is a reason to run it.

```
# Needs the real screens first: home.png (full-page, 430px wide) plus the
# element crops c-score, c-tiers, c-plan, c-tools, c-article — all in one folder.
node scripts/gen-reel-hype.mjs --shots=/path/to/shots --out=../reel-hype.mp4

# single frame, for checking or for the cover image
node scripts/gen-reel-hype.mjs --shots=… --still=1.2 --out=cover.png
```

Needs an ffmpeg with libx264. Playwright's bundled ffmpeg is VP8-only, so pass
`--ffmpeg=` a full build (`npm i ffmpeg-static` gives one).

## Why this angle

The reel sells the one thing a competitor cannot copy this quarter: the prices
are on the website. Everything else on the site is good work, but "we published
our pricing" is a claim most agencies structurally cannot make, because their
sales model depends on the number arriving after a discovery call.

## Scenes

| Time | Phone shows | On screen |
|---|---|---|
| 0.0–3.3 | homepage hero | THE NEW · **clicknlikes.com** · `IS LIVE` |
| 3.3–6.6 | homepage scrolling | **Judge us before you talk to us.** |
| 6.6–9.9 | pricing / plan builder | **Every price, published.** · counter runs to ₹16,000 / mo |
| 9.9–13.0 | tools hub | **12 free checks. On your real site.** · "No demo data. No sales call first." |
| 13.0–15.4 | insights | **Every number sourced.** · "Named, dated, and checkable." |
| 15.4–18.0 | homepage | **clicknlikes.com** · Ahmedabad → worldwide |

## Scenes — archived typographic cut

| Time | On screen |
|---|---|
| 0.0–3.4 | **Most agencies won't show you ~~their prices~~** (coral strike at 1.55s) |
| 3.4–7.0 | **Ours are on the website.** · ₹16,000 – ₹1,24,000 / mo |
| 7.0–10.6 | NOW LIVE · **clicknlikes.com** |
| 10.6–15.4 | Published pricing · 12 free checks · Every statistic sourced |
| 15.4–18.0 | **Run a free check on your own site.** |
| 18.0–20.0 | **clicknlikes.com** · Ahmedabad → worldwide |

## Every claim, and where it comes from

Nothing here is a round number someone liked the sound of.

- **₹16,000 – ₹1,24,000 / mo** — the published Starter and Pro tiers in
  `src/pages/pricing.astro`. If those tiers change, the reel is wrong and has
  to be re-rendered — and the captures retaken.
- **12 free checks** — STALE AS OF AUGUST 2026. The rendered launch reel still
  says 12, but `/tools/` now carries 7 tools plus 7 channel readiness checks,
  so the true count is 14. Re-render before reusing this cut anywhere. The
  original basis was the 5 tools in `src/data/tools.ts` plus the 7 per-service
  checks listed in `src/pages/tools/index.astro`, each of which renders a real
  `GatedTool` at `/services/<slug>/#tool`. It is 12, not 5: counting only the
  hub understates the product.
- **11 signals, checked live** — the Website Health Scan's own description.
- **Ahmedabad → worldwide** — matches the structured data: `address` is
  Ahmedabad only, `areaServed` is the full market list.
- **The screens** are captures of the built site, so the reel cannot
  show a version of the site that does not exist. Re-capture after any visual
  change to the home, pricing, tools or insights pages.

No client names, no result claims, no "we grew X by Y%". A launch reel does not
need them, and using them would need permission we do not have in writing.

## Caption

> Most agencies won't show you their prices. Ours are on the website.
>
> The new clicknlikes.com is live — rebuilt from the ground up around one idea:
> you should be able to judge us before you speak to us.
>
> Published pricing for every service. 12 free checks that run on your real
> site, not a demo. Every statistic on the site named, dated and checkable.
>
> Run a free check on your own site — link in bio.

## Hook variants (test these; the first 3 seconds decide the reel)

1. "The new clicknlikes.com is live." *(in the render — the site is the hook)*
2. "Most agencies won't show you their prices."
3. "Ask an agency what they charge. Watch them book a call instead."
4. "We put our prices on the internet. Here's what happened to the enquiries."
   — only once there is a real answer to that; do not run it before then.

## Posting notes

- Add audio in the app. The cuts land roughly every 2.2s, so a track near
  110 BPM sits on them.
- Cover: `--still=1.2` (the logo slam).
- Copy and artwork live in two fixed, clipped bands, so nothing can overlap and
  nothing sits low enough for Instagram's caption or buttons to cover it.
- Post to Reels and Facebook, and reuse the same file as a LinkedIn video post
  — LinkedIn accepts 9:16 and the audience there is closer to the buyer.
