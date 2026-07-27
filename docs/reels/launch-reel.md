# Website launch reel

Rendered by `site/scripts/gen-reel.mjs`. 1080×1920, 20 seconds, 30fps, H.264,
no audio track — Reels get their audio chosen in the app.

```
cd site && node scripts/gen-reel.mjs --out=../clicknlikes-launch-reel.mp4
node scripts/gen-reel.mjs --still=8.6 --out=/tmp/check.png   # single frame
```

The generator needs an ffmpeg with libx264. Playwright's bundled ffmpeg only
has VP8, so pass `--ffmpeg=` a full build (`npm i ffmpeg-static` gives one).

## Why this angle

The reel sells the one thing a competitor cannot copy this quarter: the prices
are on the website. Everything else on the site is good work, but "we published
our pricing" is a claim most agencies structurally cannot make, because their
sales model depends on the number arriving after a discovery call.

## Script

| Time | On screen |
|---|---|
| 0.0–3.4 | **Most agencies won't show you ~~their prices~~** (coral strike sweeps in at 1.55s) |
| 3.4–7.0 | **Ours are on the website.** · pill: ₹16,000 – ₹1,24,000 / mo · "Every tier published. No call booked just to be told a number." |
| 7.0–10.6 | NOW LIVE · **clicknlikes.com** · "Rebuilt from the ground up: faster, clearer, and honest about the numbers." |
| 10.6–15.4 | WHAT IS DIFFERENT · Published pricing · 5 free tools · Every statistic sourced |
| 15.4–18.0 | **Run a free check on your own site.** · three audit bars fill · "An 11-signal on-page audit, your real mobile speed, and where the funnel leaks." |
| 18.0–20.0 | **clicknlikes.com** · "Full-stack organic growth. Ahmedabad → worldwide." |

## Every claim, and where it comes from

Nothing here is a round number someone liked the sound of.

- **₹16,000 – ₹1,24,000 / mo** — the published Starter and Pro tiers in
  `src/pages/pricing.astro`. If those tiers change, this reel is wrong and has
  to be re-rendered.
- **5 free tools** — the length of `TOOLS` in `src/data/tools.ts`.
- **11-signal on-page audit** — the Website Health Scan's own description.
- **Ahmedabad → worldwide** — matches the structured data: `address` is
  Ahmedabad only, `areaServed` is the full market list.

No client names, no result claims, no "we grew X by Y%". A launch reel does not
need them, and using them would need permission we do not have in writing.

## Caption

> Most agencies won't show you their prices. Ours are on the website.
>
> The new clicknlikes.com is live — rebuilt from the ground up around one idea:
> you should be able to judge us before you speak to us.
>
> Published pricing for every service. 5 free tools that run on your real site,
> not a demo. Every statistic on the site named, dated and checkable.
>
> Run a free check on your own site — link in bio.

## Hook variants (test these; the first 3 seconds decide the reel)

1. "Most agencies won't show you their prices." *(in the render)*
2. "Ask an agency what they charge. Watch them book a call instead."
3. "We put our prices on the internet. Here's what happened to the enquiries."
   — only once there is a real answer to that; do not run it before then.
4. "Free tools, published prices, sourced stats. One of these is rare."

## Posting notes

- Add audio in the app. Something calm and instrumental fits the register far
  better than a trending drop — this is a B2B credibility reel, not a dance.
- Cover frame: `--still=8.7` (the clicknlikes.com reveal) exports a clean cover.
- The safe zone holds: nothing sits below y≈1250, so Instagram's caption and
  action buttons cannot cover any text.
- Post to Reels and Facebook, and reuse the same file as a LinkedIn video post
  — LinkedIn accepts 9:16 and the audience there is closer to the buyer.
