# Website launch reel

Two cuts of the same launch, both 1080×1920, 30fps, H.264, no audio track —
Reels take their audio in the app.

| | Cut A — energetic | Cut B — typographic |
|---|---|---|
| Script | `site/scripts/gen-reel-hype.mjs` | `site/scripts/gen-reel.mjs` |
| Length | 18s | 20s |
| Look | Real site scrolling in a phone, hard cuts, kinetic type | Kinetic type only, calm pacing |
| Post it when | Announcing the launch — people believe a site they can see moving | Evergreen brand/positioning slot |

```
# Cut A needs real screens first: 430px-wide full-page captures named
# home/pricing/tools/insights.png in one folder.
node scripts/gen-reel-hype.mjs --shots=/path/to/shots --out=../reel-hype.mp4
node scripts/gen-reel.mjs --out=../reel.mp4

# single frame, for checking or for a cover image
node scripts/gen-reel-hype.mjs --shots=… --still=0.9 --out=cover.png
```

Both need an ffmpeg with libx264. Playwright's bundled ffmpeg is VP8-only, so
pass `--ffmpeg=` a full build (`npm i ffmpeg-static` gives one).

## Why this angle

The reel sells the one thing a competitor cannot copy this quarter: the prices
are on the website. Everything else on the site is good work, but "we published
our pricing" is a claim most agencies structurally cannot make, because their
sales model depends on the number arriving after a discovery call.

## Cut A — scenes

| Time | Phone shows | On screen |
|---|---|---|
| 0.0–3.3 | homepage hero | THE NEW · **clicknlikes.com** · `IS LIVE` |
| 3.3–6.6 | homepage scrolling | **Judge us before you talk to us.** |
| 6.6–9.9 | pricing / plan builder | **Every price, published.** · counter runs to ₹16,000 / mo |
| 9.9–13.0 | tools hub | **12 free checks. On your real site.** · "No demo data. No sales call first." |
| 13.0–15.4 | insights | **Every number sourced.** · "Named, dated, and checkable." |
| 15.4–18.0 | homepage | **clicknlikes.com** · Ahmedabad → worldwide |

## Cut B — scenes

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
  `src/pages/pricing.astro`. If those tiers change, both reels are wrong and
  have to be re-rendered.
- **12 free checks** — the 5 tools in `src/data/tools.ts` plus the 7 per-service
  checks listed in `src/pages/tools/index.astro`, each of which renders a real
  `GatedTool` at `/services/<slug>/#tool`. It is 12, not 5: counting only the
  hub understates the product.
- **11-signal on-page audit** (Cut B) — the Website Health Scan's own description.
- **Ahmedabad → worldwide** — matches the structured data: `address` is
  Ahmedabad only, `areaServed` is the full market list.
- **The screens in Cut A** are captures of the built site, so the reel cannot
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

1. "Most agencies won't show you their prices." *(Cut B)*
2. "The new clicknlikes.com is live." *(Cut A — the site itself is the hook)*
3. "Ask an agency what they charge. Watch them book a call instead."
4. "We put our prices on the internet. Here's what happened to the enquiries."
   — only once there is a real answer to that; do not run it before then.

## Posting notes

- Add audio in the app. Cut A can take a beat-driven track — the cuts land on
  3.3s intervals, so anything around 109 BPM lines up. Cut B wants something
  calm; a trending drop fights its register.
- Covers: `--still=0.9` for Cut A, `--still=8.7` for Cut B.
- Safe zone holds in both: no text below y≈1250, so Instagram's caption and
  buttons cannot cover anything.
- Post to Reels and Facebook, and reuse the same file as a LinkedIn video post
  — LinkedIn accepts 9:16 and the audience there is closer to the buyer.
