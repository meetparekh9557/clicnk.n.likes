# Click.n.likes motion

Remotion project for the kinetic-typography / UI-motion ads. Renders
**1080×1920, 30fps, full bleed** — no letterbox, no bars, every scene paints
the entire canvas.

| Composition | Length | Status |
|---|---|---|
| `GrowthAdShort` | 15.3s | **the live asset** — cold Meta traffic, driving `/growth/` |
| `GrowthAd` | ~39s | **not in use.** Predates the motion-graphics rebuild and the removal of the web address, so it does not match the current work. Kept because it costs nothing and shares every component; it needs a re-render before being used for anything |

The short cut is hook, disconnected channels, close. Everything the long film
had between them — the four problem beats, the inequality, the diagnosis, the
four-step process — is *argument*, and a stranger who did not choose you will
not stay for an argument. Its timings live in the `shortCut` block of
`src/data/script.ts`, and the scenes take beats as props so both cuts share one
set of components.

It is cut to fit a voiceover that does not exist yet; the script and the music
marks are in `docs/reels/growth-ad-14s-audio.md`.

## Running it

```bash
cd motion
npm install

# interactive editor — scrub, tweak, hot reload
npm run studio

# render (see "Browser" below for REMOTION_BROWSER)
export REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
npm run render:short    # the live asset
npm run finish:short    # REQUIRED before delivery — see below
npm run render          # the retired long cut

# one frame, for checking a beat or making a thumbnail
npx remotion still src/index.ts GrowthAdShort out/f.png --frame=250 \
  --browser-executable=$REMOTION_BROWSER
```

### Browser

Remotion normally downloads its own Chrome Headless Shell from `remotion.media`,
which **this environment's network policy blocks**. Playwright already ships a
compatible one, so point `--browser-executable` at it — that is what
`REMOTION_BROWSER` above is for. Plain Chromium will not work: Remotion needs
the old headless mode, which the full Chrome binary no longer has.

A full render takes roughly 10 minutes on 4 cores — the directional-blur
filters are the expensive part — so run it in the background. `--concurrency`
cannot exceed the core count or the render refuses to start.

### Always run `npm run finish` before shipping

Remotion's JPEG frame pipeline tags its output **full-range `yuvj420p`**, and
`--pixel-format=yuv420p` does **not** override it — this was tested, not
assumed. Some Meta decoders shift full-range colour on playback, so a delivery
file needs one normalising pass to limited-range yuv420p with bt709 tags:

```bash
FFMPEG=/path/to/ffmpeg npm run finish
```

It takes well under a minute. Treat it as a required step, not a fallback —
a raw `npm run render` output is not a delivery file.

## Editing

Everything a non-engineer needs to change lives in two files.

- **`src/data/script.ts`** — every word on screen, every scene's length in
  frames, the beat timings inside each scene, and which UI capture each beat
  uses. Change a string or a number, re-render, done. No scene component needs
  touching; not one frame number is hardcoded in a scene file.

  **To slow the cut down**, raise a scene's `durationInFrames` and leave its
  `beats` alone — the last message simply holds on screen for longer. To
  re-time the reveals themselves, move the `beats`, which are frame offsets
  from that scene's own start.
- **`src/data/theme.ts`** — brand colours, fonts, and the shared timing
  rhythm (line stagger, reveal length, scene overlap).

Scene order lives in `src/compositions/GrowthAd.tsx`. Add, remove or reorder a
row in `ORDER` and the film re-times itself; nothing downstream hardcodes a
frame number.

```
src/
  data/        script.ts (all copy + durations), theme.ts (brand tokens)
  components/  Headline, UIPanel, Rail, Chip, Bg, HBlur, Fonts, easing
  scenes/      Scene1Hook … Scene7CTA — one file each, independently editable
  compositions/GrowthAd.tsx — scene order, overlap, total duration
public/
  ui/          the UI captures the panels show
  fonts/       Space Grotesk + DM Sans
```

## Replacing the UI screenshots

The panels show **real captures of the live site** — never mockups. Regenerate
them with the site's own capture script and copy them in:

```bash
npx http-server -p 8899 -s .            # from the repo root
cd site && node scripts/capture-growth-shots.mjs --out=/tmp/shots
cp /tmp/shots/*.png ../motion/public/ui/
```

Then point a beat at a different capture by editing its `art` field in
`script.ts`.

## The motion vocabulary

Five devices do the work. Everything else is timing.

1. **Per-word springs, not per-line slides.** `KineticHeadline` animates each
   word on its own spring with a mask reveal and a `rotateX` tip-up, so a line
   reads as language assembling rather than a block sliding. Words also leave
   staggered, in reverse order, which gives the exit follow-through instead of
   the block snapping off as one piece.
2. **Draw-on strokes.** SVG paths with `pathLength={1}` and an animated
   `strokeDashoffset` let a connector draw itself. This is what makes the
   middle scene an argument: the links FORM in teal before they break, and you
   cannot feel something break unless you first watched it work.
3. **Springs where punch is wanted, eases where calm is.** The break marks and
   the CTA use `spring()` so they overshoot and settle; scene exits use
   bezier eases so they leave cleanly. Mixing the two is the difference
   between "animated" and "designed".
4. **A transition with weight.** `Sweep` crosses the frame as a slanted band
   with a bright leading edge running ahead of it. A crossfade says "two
   things happened"; an object crossing says "this became that". It travels
   one way into the argument and the other way out, so the film has a shape.
5. **Directional blur.** `HBlur` applies an SVG `feGaussianBlur` with zero
   vertical deviation, so fast horizontal travel smears along its axis like a
   real shutter rather than going isotropically soft.

Nothing is ever fully parked: the background drifts across the whole film, the
rig in the middle scene keeps drifting after it lands, and the warning pulses.
A held graphic that stops dead reads as a frozen render.

## Why it reads as one sequence

Three deliberate choices, all easy to break by accident:

1. **`Bg` never cuts.** One background layer spans the whole film and drifts
   continuously underneath every scene.
2. **Scenes overlap by `timing.overlap` frames.** The outgoing copy is still
   sliding out while the next slides in, so a seam is a hand-off, not a cut.
   Every scene therefore needs an `exitAt` on its last headline — without one,
   two scenes' text collide during the overlap.
3. **Movement is horizontal and blurred.** `HBlur` applies an SVG
   `feGaussianBlur` with zero vertical deviation, so fast travel smears along
   its axis like a real shutter rather than going isotropically soft.

### One trap worth knowing

A CSS `filter` makes an element a **containing block for absolutely positioned
descendants**. Anything positioned with `position: absolute; top: 50%` must sit
*outside* `HBlur`, or it resolves against the blur wrapper and lands in the
wrong half of the frame. `UIPanel` and `Rail` are both built that way on
purpose.

## The corner wordmark

`BrandMark` holds the logo top-left for the whole film, then fades out shortly
before the closing scene raises its own large wordmark — two of the same mark
in one frame reads as a mistake. Its position is a compromise between
placements: low enough to clear the Reels/Stories chrome that covers the top
~14% of the frame, high enough to still read as a corner lockup in Facebook
feed where there is no overlay.

## No audio

The file renders silent, deliberately. Reels take their audio in Instagram, and
choosing a licensed track there avoids both a rights problem and a
muted-by-default cut. The cut is built to work with sound off.
