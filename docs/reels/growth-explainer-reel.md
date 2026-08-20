# Growth explainer reel (60s, /growth/)

The one that answers "what do you actually do, how do you help, and where do I
go" in a single scroll-stopping cut. Renders to 1080×1920, 30fps, H.264, no
audio track.

```
# 1. serve the built site from the repo root
npx http-server -p 8899 -s .

# 2. capture the real UI (14 crops)
cd site && node scripts/capture-growth-shots.mjs --out=/tmp/shots

# 3. render
node scripts/gen-reel-growth.mjs --shots=/tmp/shots --out=../reel-growth.mp4 \
  --ffmpeg=/path/to/ffmpeg

# single frame, for checking a beat or making the cover image
node scripts/gen-reel-growth.mjs --shots=/tmp/shots --still=44.5 --out=/tmp/f.png
```

Needs an ffmpeg with libx264 — Playwright's bundled build is VP8 only, so
`npm i ffmpeg-static` and point `--ffmpeg` at it.

## The format, and the one place it was not copied

This follows the letterboxed product-demo pattern that performs well on Meta
right now: a fixed brand-and-hook header that never moves, a light stage where
real UI cards fly in behind kinetic typography, and **no voiceover at all** —
the type carries the message, the music carries the energy. That last part is
deliberate rather than lazy. `reel-scripts.md` rules out synthetic voice for
this brand, and a silent kinetic cut sidesteps the question without asking the
founder to record anything.

Reels built this way are almost always selling software, so every beat can show
a product doing the work. **Click.n.likes has no product UI, and inventing one
would be exactly the quiet dishonesty the positioning cannot survive.** So the
stage shows only things that genuinely exist and are publicly checkable: the
six service cards, the five-step process, the published pricing table, the free
tools grid, the channel checks, the enquiry form, and one real client's
numbers. Fourteen captures, no mockups.

## Scenes

| Time | On screen | Card |
|---|---|---|
| 0.0–4.2 | Most agencies **sell you a service.** | three cards drifting in |
| 4.2–8.6 | We start with **the problem.** | "Sound Familiar?" |
| 8.6–13.0 | wordmark · Full-stack organic growth. | three cards drifting in |
| 13.0–18.4 | Everything your **marketing needs.** | the six service cards |
| 18.4–23.0 | SEO. AI Search. Content. | channel checks |
| 23.0–27.4 | Social. Websites. Paid. | plan builder |
| 27.4–32.6 | We find the leak **before we fix it.** | the five-step process |
| 32.6–37.0 | Diagnose. Prioritise. Execute. Measure. | before/after |
| 37.0–42.4 | A Mumbai manufacturer nobody could find. | Kopa case study |
| 42.4–47.6 | **71% of their leads** now come from search. | Kopa stat row |
| 47.6–52.4 | Every price, **published.** | pricing tiers |
| 52.4–56.6 | 14 free checks. On your real site. | tools grid |
| 56.6–60.0 | Tell us what's not working. **clicknlikes.com/growth** | enquiry form |

Header hook, held for all 60 seconds: **"Your Marketing Isn't Broken. One Part
Of It Is."**

## Every claim, and where it comes from

- **71% of new leads from organic search** — `caseStudies.ts` → `kopa-seamless`,
  GA4, Oct 2025 – Jul 2026. The same entry carries a "12x growth in monthly
  organic clicks"; it is real, and it is deliberately kept off screen, because
  the underlying move is 6 clicks a month to 71 and a viewer who later sees the
  base number feels handled. See `docs/ads/meta-video-ads-growth.md`.
- **14 free checks** — 7 tools in `src/data/tools.ts` plus the 7 channel
  readiness checks on `/tools/`, counted from the rendered page. This number
  grows as tools are added, so re-count before every re-render.
- **Published pricing** — the live tier row on `/pricing/`. The capture is
  currently in **USD**, which is the page's default. For an India-targeted
  campaign, switch the currency selector before capturing and re-render.
- **Six services** — `/growth/` filters out Local SEO, so the card grid shows
  six of the seven. That is the ads page's own editorial choice, not a claim
  that only six exist.

## Before it ships

- **Kopa Seamless must approve**, in writing. Two beats name their business and
  their numbers in paid media, which is a different ask from a case study on
  our own site.
- **Add music in the app.** The file has no audio track on purpose — Reels take
  their audio in Instagram, and a licensed track chosen there avoids both a
  rights problem and a muted-by-default cut.
- **Re-count and re-check every number** at render time. If a tier, a tool or a
  client stat changes, the reel is wrong and gets re-rendered from fresh
  captures.
