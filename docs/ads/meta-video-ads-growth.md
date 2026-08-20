# Meta video ads → /growth/

Three video ad scripts for cold Meta traffic landing on
`https://clicknlikes.com/growth/` (`site/src/pages/growth.astro`).

Every line of copy here is derived from that page's own argument. Nothing is
invented, and no number appears that isn't already sourced in
`site/src/data/caseStudies.ts`.

## Framework

`docs/content-frameworks.md` maps ad scripts to **Pixar beats**, with
compressed Hero's Journey as the secondary — the same structures as reels,
under harder time pressure. Ads 1 and 3 use Pixar beats. Ad 2 uses the
compressed Hero's Journey, because its whole job is a before/after turn.

## Register

Spoken and on-screen video copy is the standing exception to the elevated
B2B voice in `AGENTS.md` — see the note in `docs/reels/reel-scripts.md`.
Short sentences, plain words, no fragments-as-style, no hype. The honesty is
unchanged; only the sentence length is.

## Two standing production rules

- **No synthetic voice.** A listener who spots a TTS read discounts every
  honesty claim in the script, and this brand has nothing to fall back on if
  the trust positioning goes. Real voice or no voice.
- **Everything on screen is real.** Real page, real tool output, real
  numbers. No mocked dashboards, no invented metrics, no stock office.

## Specs

| Placement | Ratio | Size | Notes |
|---|---|---|---|
| Reels / Stories | 9:16 | 1080×1920 | Keep text out of the top ~14% and bottom ~35% — platform UI covers it |
| Feed | 4:5 | 1080×1350 | The better-performing feed ratio; more vertical space than 1:1 |

Burn in captions on every cut — most of this is watched with sound off, and
captions are worth 25–40% on watch time. Two lines maximum on screen, 3–5
words per line, heavy sans with a dark outline.

---

# Ad 1 — "Traffic, but no enquiries"

**24 seconds. Pixar beats.** The broadest-audience ad — leads with the single
most common symptom on the page, so the widest slice of cold traffic
self-identifies inside three seconds.

## Beats

| Time | Shot | On screen | Voiceover |
|---|---|---|---|
| 0:00–0:03 | Analytics session graph, real, scrolling | **Traffic: yes.**<br>**Enquiries: no.** | "Your website is getting visitors. It just isn't getting you enquiries." |
| 0:03–0:08 | Hands scrolling a site on a phone, fast, not landing anywhere | Every day, the same gap | "So you buy more. More ads. More content. More posts." |
| 0:08–0:13 | The scroll stops. Cut to the /growth/ hero, held still | **More marketing<br>won't fix it** | "But if the site doesn't convert, more traffic doesn't fix it. If nobody can find you, better design doesn't fix it." |
| 0:13–0:19 | Growth Scan running on a real site, score landing | Find the leak first | "The first step isn't doing more. It's knowing what's already broken." |
| 0:19–0:24 | /growth/ page, form visible | **clicknlikes.com/growth**<br>Free scan. No obligation. | "Run the free scan on your own site. Then decide if you want to talk." |

## Why this one works

It never asks for the sale in the first 15 seconds, and it argues *against*
spending — which is the pattern interrupt. Every competing agency ad in the
feed is asking for more budget. This one opens by telling the viewer their
budget isn't the problem, which is both true and disarming.

## Meta ad copy

**Primary text**
> You're getting website visitors. You're just not getting enough enquiries.
>
> Most businesses respond by buying more marketing. More ads, more content,
> more posts. But if your website doesn't convert, more traffic won't solve
> it. If nobody can find you, better design won't solve it.
>
> The first step isn't doing more. It's knowing what's already broken.
>
> Run our free Growth Scan on your own site — search visibility, speed,
> content, conversion, technical SEO and AI Search visibility. No credit
> card. No obligation.

**Headline:** Traffic But Not Enough Enquiries?
**Description:** Free Growth Scan. No credit card, no obligation.

---

# Ad 2 — "Nobody could find them"

**22 seconds. Compressed Hero's Journey.** Ordinary world → guide →
transformation → reward. The only ad of the three that carries a number, so
it carries the proof load for the whole set.

## Beats

| Time | Shot | On screen | Voiceover |
|---|---|---|---|
| 0:00–0:04 | A one-page site, plain, scrolling | **A one-page website.<br>Built by the owner.** | "A clothing manufacturer in Mumbai built their own website. One page." |
| 0:04–0:09 | Search Console clicks graph, real, flat at the left | 6 clicks a month | "Six clicks a month from search. Nobody could find them." |
| 0:09–0:14 | Same graph, real, climbing | They didn't rebuild it | "They didn't rebuild the site. They didn't start ads. They fixed what search could actually see." |
| 0:14–0:19 | GA4 source breakdown, real | **71%**<br>of new leads now come<br>from organic search | "Now 71% of their new leads come from organic search." |
| 0:19–0:22 | /growth/ hero | **clicknlikes.com/growth** | "Find out what's holding yours back." |

## Sourcing, and one number I would not use

Both figures on screen come from `caseStudies.ts` → `kopa-seamless`, and both
are checkable: **71% of new leads from organic search** (GA4, Oct 2025 –
Jul 2026) and **6 clicks a month** at the September 2025 starting point
(Search Console).

The case study also carries a **"12x growth in monthly organic clicks."**
It is true, and I'd still keep it out of the ad. Twelve-times sounds like a
scale story; the actual movement is 6 clicks a month to 71. Anyone who
later sees the base number feels handled, and this brand cannot afford a
prospect who feels handled — the entire positioning is that our numbers
survive being checked. The 71% figure is the honest one to lead with,
because it doesn't get smaller when you look at it.

**Kopa Seamless must approve this before it runs.** It names their business
and their numbers in paid media, which is a different thing from a case
study on our own site.

## Meta ad copy

**Primary text**
> A seamless apparel manufacturer in Mumbai built their own one-page website
> and came to us for SEO only — not a rebuild.
>
> At the start: 6 organic clicks a month. Nobody searching could find them.
>
> We didn't rebuild the site or start ads. We fixed what search could
> actually see.
>
> Today 71% of their new leads come from organic search (GA4, Oct 2025 –
> Jul 2026), and they rank in the top 8 for their core business keywords.
>
> Every number here is checkable. That's the point.

**Headline:** 71% Of Their New Leads Now Come From Search
**Description:** See what's holding your site back — free scan.

---

# Ad 3 — "We may not be right for you"

**18 seconds. Pixar beats, inverted.** A disqualifier. The lowest-reach and
highest-quality ad of the three — it will cost more per click and less per
qualified enquiry.

## Beats

| Time | Shot | On screen | Voiceover |
|---|---|---|---|
| 0:00–0:03 | Black. Text only. | **We're probably not<br>the right agency<br>for you.** | "We're probably not the right agency for you." |
| 0:03–0:09 | Each line strikes through as it's said | ~~Guaranteed rankings~~<br>~~Cheap monthly packages~~<br>~~Followers for the numbers~~ | "If you want guaranteed rankings, cheap monthly packages, or followers for the sake of numbers — that isn't us." |
| 0:09–0:13 | Hold on the last line | ~~An agency that says yes<br>to everything~~ | "If you want an agency that says yes to everything you ask for, definitely not us." |
| 0:13–0:18 | /growth/ hero, then the form | **But if you want the whole<br>picture, honestly:**<br>clicknlikes.com/growth | "But if you want someone to look at the whole picture and tell you what actually deserves attention — tell us what's not working." |

## Why this is the one I'd test hardest

Negation stops a scroll better than a promise, because it violates the
format: an ad that opens by rejecting the viewer reads as information rather
than advertising, and gets processed before the ad filter engages. It also
does the qualifying work up front, so the enquiries that arrive have already
agreed to the terms. The people it repels were never going to buy published
pricing and a "here's what's actually wrong" report.

The risk is real and worth stating: it will look like a smaller campaign on
a reach dashboard. Judge it on cost per qualified enquiry, not CPM.

## Meta ad copy

**Primary text**
> We're probably not the right agency for you.
>
> If you're looking for guaranteed rankings, instant results, cheap monthly
> packages, thousands of followers for the sake of numbers, or an agency that
> says yes to everything you ask for — we're not a fit, and we'd rather say
> so now.
>
> But if you want someone to look at the entire picture and tell you what
> actually deserves attention, that's the whole job.
>
> Tell us what's not working. No generic pitch. No obligation to hire us.

**Headline:** We May Not Be The Right Agency For You
**Description:** Tell us what's not working. We'll take it from there.

---

# Which CTA, and where the traffic should land

The page carries two: **Send My Enquiry** and **Run My Free Growth Scan**.
They are not interchangeable, and the split should follow temperature.

- **Cold traffic → the Growth Scan.** A stranger three seconds into a video
  will not fill in a nine-field enquiry form. The scan asks for an email
  against an immediate, useful, self-serve result. It is the lower-friction
  ask and it produces a warm list.
- **Retargeting → Send My Enquiry.** Anyone who has already run a scan or
  spent time on the page has done the qualifying. Ask directly.

Ads 1 and 2 point at the scan. Ad 3 points at the enquiry form, deliberately:
its whole function is filtering, so the friction is the feature.

# Production

Faceless is fully achievable here — every shot is a screen, a graph, or a
pair of hands, which is the approach `docs/reels/reel-scripts.md` already
argues for. The repo can render these: `site/scripts/gen-reel-hype.mjs` and
`gen-reel-teardown.mjs` produce 1080×1920 H.264 from real captures, and
`crop-shot.mjs` takes the element crops.

It is worth repeating what `docs/reels/on-camera-scripts.md` already
concluded, because it applies with more force to paid media than to organic:
a real face and a real voice would outperform any of this. Ad 3 in
particular is a piece of direct address, and it lands differently spoken by
the person who has to honour it. If the founder is willing to shoot one, that
is the version to spend budget behind.

# Before any of this runs

- Kopa Seamless approves Ad 2, in writing.
- The `/growth/` page is `noindex` by design — confirm that's still intended,
  since it means these ads are the only route to it.
- Every claim re-checked against the page and `caseStudies.ts` at render
  time. If a tier, stat or tool count changes, the ad is wrong and gets
  re-rendered.
