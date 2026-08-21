# Audio spec — 14.7s cold-traffic cut (`GrowthAdShort`)

Voiceover script, music marks and exact sync points for the short Meta ad.
Every timecode below is measured off the rendered file, not estimated.

**The video must still work in silence.** Most Meta feed views are sound-off,
so both the voice and the music are upside only. Never trim on-screen text on
the grounds that the voice covers it.

## What is actually on screen, and when

| Time | On screen |
|---|---|
| 0.1 – 1.8s | YOUR BUSINESS DOESN'T NEED MORE MARKETING. |
| 2.1 – 3.9s | IT NEEDS TO KNOW WHAT'S NOT WORKING. |
| 4.0 – 5.5s | five channels spring in from the edges |
| 4.9 – 6.3s | teal links **draw** between them — the system looks like it works |
| 6.0 – 6.8s | links decay to grey, five ✕ marks punch in as a cascade |
| 6.9 – 7.7s | ⚠ warning draws itself, GROWTH GAP letters stagger in |
| 7.2 – 9.4s | DOING MORE DOESN'T ALWAYS MEAN GROWING MORE. |
| 9.5 – 11.5s | LET'S FIND OUT WHAT IT IS. |
| 11.7 – 14.7s | SEND YOUR INQUIRY, then the wordmark holds |

## Voiceover

Twenty-nine words. Roughly half the film is silent on purpose.

| Time | Line |
|---|---|
| 0.3 – 1.8 | "Your business doesn't need more marketing." |
| 2.2 – 3.9 | "It needs to know what's not working." |
| 4.0 – 7.1 | *(silence — the animation carries it)* |
| 7.2 – 10.1 | "Because doing more doesn't always mean growing more." |
| 10.3 – 11.9 | "Let's find out what it is." |
| 12.1 – 13.4 | "Send your enquiry." |

**The rule that governs it:** the voice either lands on the exact words at the
exact moment, or it says something the screen never says. Never a near-miss
paraphrase — with kinetic typography the viewer is already reading in their own
inner voice, and a line spoken a beat off from the text it matches reads as an
echo. That is worse than no voice at all.

`Because` at the head of the third line is the one addition that is not on
screen. It is doing real work: it turns four statements into one argument, and
it makes the three-second silence before it feel like a considered pause
rather than a gap.

**Delivery:** flat, unhurried, slightly under-energised. The temptation at 14
seconds is to push. Don't — the whole positioning is the calm one in a feed of
shouting.

**No synthetic voice.** A listener who clocks a TTS read discounts every
honesty claim in the ad, and this brand has nothing to fall back on if the
trust positioning goes.

## Music

**Minimal futuristic electronic:** deep clean bass pulse, subtle digital
textures, percussive ticks, a controlled build, and a hard impact at the
pattern interrupt. No lyrics, no vocals.

Avoid: corporate ukulele, generic motivational, cinematic orchestral,
aggressive EDM, trap.

| Time | Music |
|---|---|
| 0 – 2.0s | minimal. Pulse and tick only, sparse |
| 2.1 – 4.0s | same bed, slight lift under the turn |
| 4.0 – 5.9s | **build.** Percussion enters as the channels land and the links draw. The music should sound like something assembling |
| 6.0 – 6.8s | **subtract.** Pull the percussion as the links break. Tension by removal |
| **6.9 – 7.2s** | **the impact.** Bass hit as the warning draws itself. This is the drop |
| 7.2 – 11.5s | driving, confident, forward |
| 11.7 – 14.7s | **simplify.** Strip back so the CTA lands. Let the last second breathe |

### Where the drop goes, and why it is not where you think

The original direction put the beat hit on **MORE MARKETING ≠ MORE GROWTH**.
That beat is in the 39-second film. **It does not exist in this cut** — the
short version is hook, disconnected channels, close, and the inequality scene
was cut with the rest of the argument.

The equivalent moment here is **the warning at 6.9s**, and it is a better hit
than the ≠ ever was: sound landing on a visual event hits harder than sound
landing on a word appearing.

### Two events, not one

The strongest move at 6.0s is **removal, not addition**. The animation has two
distinct beats there — the system fails (6.0–6.8s), then the problem is named
(6.9s). A single smash across both wastes that. Cut the percussion as the links
break, leave a hole, then bring the bass in on the warning. The hole is what
makes the impact land.

### The voice and the music trade off

The 4.0–7.1s VO silence is exactly where the music peaks and drops. That is not
a coincidence to be fixed — it is the interlock. The music owns the middle, the
voice owns the ends, and neither ever competes with the other.

If both are used, duck the music roughly 6–9 dB under every spoken line.

## Practical

**Burn the audio into the file.** Instagram's in-app music library carries
restrictions on branded and commercial use — check the current terms before
relying on it for a paid placement. A track licensed for commercial use from a
stock library (Artlist, Epidemic Sound, Musicbed, Uppbeat and similar) and
mixed into the export avoids the question entirely.

**Cut picture to music, not music to picture.** Once a track is chosen, its
real transient will not sit at exactly 6.9s. Scene durations in
`motion/src/data/script.ts` are plain frame numbers — shifting the middle scene
by a few frames to land the animation on the track's actual hit is a one-line
change and a re-render. Always do that rather than accepting a near-miss.

## Open

- **`INQUIRY` vs `Enquiry`.** The CTA button says `SEND YOUR INQUIRY`; every
  form on the site says **Enquiry**. Pick one. This matters more once the word
  is spoken aloud, not less.
- Line three needs ~2.9s to read and currently has 2.3s of room. Adding about
  20 frames to the middle scene gives it air and takes the film to ~15.3s,
  still well inside cold-traffic range.
