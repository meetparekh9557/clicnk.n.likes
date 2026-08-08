# Content frameworks playbook

Six storytelling frameworks, mapped to where each genuinely helps across
Click.n.likes' content, not applied uniformly everywhere. Each vertical below
names which framework(s) fit and why, tied to real assets in this repo.
Frameworks not listed for a vertical were considered and rejected for that
use, not overlooked — see the reasoning in each section.

## The six frameworks (quick reference)

1. **Hero's Journey** — 10-stage arc (call to adventure → mentor → threshold →
   trials → reward → return). Built for content someone chooses to spend
   minutes on.
2. **Golden Circle** — Why → How → What (Sinek). Leads with purpose, not
   deliverables. Only works on an audience that's already opted in to listen.
3. **What, So What, Now What** — a fact, why it matters, what to do next.
   Strips emotion, forces clarity and a next action.
4. **Freytag's Pyramid** — exposition → conflict → rising action → climax →
   falling action → resolution. Classic struggle-then-resolution arc.
5. **Origin Story** — Before → Turning Point → Now. Compact enough to fit
   almost anywhere, from a two-line proof point to a full founder post.
6. **Pixar Framework** — "Once upon a time… every day… but one day… because
   of that… because of that… and finally… ever since then…" Fill-in-the-blank
   beats built for short attention spans.

---

## Cold emails (business@clicknlikes.com outreach)

**Primary: What, So What, Now What.** This is the structure the current
locked template already follows: a real fact about the recipient (What), the
specific gap it creates (So What), a direct ask (Now What). Confirmed through
iteration, not imposed after the fact — the template converged here before
the framework was named.

**Secondary: Origin Story, compressed, for the proof paragraph.** State the
case study as Before (the client's starting problem) → Turning Point (what
we changed) → Now (the result), rather than dropping an end-state number in
isolation. Gives the reader a "before" to see themselves in.

**Explicitly not used:** Golden Circle. Leading with why we exist inverts the
one rule that's held up through every revision — the email has to lead with
the recipient, not us. A stranger deciding whether to open a cold email
hasn't opted in to hear our purpose yet.

---

## Case studies (`/work/[slug]/`, `site/src/data/caseStudies.ts`)

**Primary: Freytag's Pyramid — already partially in use, worth making
deliberate.** The existing structure (`overview` → `challenge` → `approach`
→ `results` → `summary`) is this arc, just not written with rising tension on
purpose. Sharpen the `challenge` field for future case studies (and revisit
existing ones) so it reads as real stakes — "generic template site, zero SEO,
fully ad-dependent" rather than a flat fact — before the `results` land.

**This matters beyond the page itself:** every cold email now links to a
case study page. A flatter challenge section converts worse at the link-click
stage, which feeds directly back into reply/close rate.

**Secondary: Origin Story** for the `overview`/`challenge` framing on a
website-only build with no lead-volume stats to report (see Adamas Films) —
Before/Turning Point/Now still works even without a stats-driven Results
section.

---

## Website content (homepage, About, service pages)

**Primary: Golden Circle.** This is where "why Click.n.likes exists" belongs
— an About-page visitor or someone reading service-page copy has already
chosen to be there. Frame the honesty-over-hype positioning (verified vs.
self-reported labelling, transparent pricing) as the Why, ahead of How
(the actual services) and What (deliverables).

**Secondary: Freytag's Pyramid**, inherited from linked case studies — the
homepage's "Work" teaser and service-page proof sections point at case
studies, so the case-study rigor above compounds here.

---

## LinkedIn — personal (Meet)

**Primary: Origin Story.** "Before I started Click.n.likes, I was X. Then Y
happened. Now I do Z, and here's why it matters" is one of the
best-performing personal LinkedIn shapes there is — specific, a little
vulnerable, not promotional. Needs Meet's real inputs (see the open questions
from the prior turn) — never invented.

**Secondary: Golden Circle**, shaping what the Origin Story post leads with —
the actual frustration or belief behind starting the agency, not a services
list.

**Why personal over company page:** LinkedIn's algorithm favors personal
profiles, and for a solo-founder agency, trust in Meet *is* trust in the
agency. This also indirectly supports cold-email reply rates — a prospect who
searches the sender before replying finds a real person, not a void.

---

## LinkedIn / social media — company posts, general audience-building

**Primary: What, So What, Now What** for insight/opinion posts (industry
takes, data call-outs) — same clarity-forcing shape as the emails, adapted to
a public audience.

**Secondary: Pixar Framework** for any narrative-style company post
(client wins, before/after reveals) shortened to a few beats.

---

## Reels / short-form video (own brand + client deliverables)

**Primary: Pixar Framework.** The fill-in-blank beats map directly onto a
15–60 second script: routine → disruption → consequence → resolution. Works
for Click.n.likes' own Instagram/LinkedIn video and, since Social Media
Growth is a sold service line, doubles as a teachable, demonstrable method in
sales conversations — "here's exactly how we structure content" beats "we'll
post for you."

**Secondary: Hero's Journey, compressed**, for longer promotional reels or
the next teardown/launch-reel format specifically — ordinary world (invisible
online) → guide (the audit) → transformation → reward (the fixed site).

---

## Ad scripts (Google/Meta — Paid Campaigns service, own + client)

**Same as reel scripts, tighter.** Pixar beats or a compressed Hero's Journey
inside 15–30 seconds. Paid video ads and organic reels share the same
attention-economics problem (stop the scroll in under 3 seconds), so the same
frameworks apply, just under harder time pressure.

---

## Blog / Insights posts (`insights/`)

**Primary: What, So What, Now What** for argument-driven posts (the existing
"3-Second Test", "SEO or Ads First" posts already loosely follow this —
worth tightening deliberately going forward).

**Secondary: Freytag's Pyramid** for any post built around a real narrative
(a client's journey, a mistake-to-fix story) rather than a straight argument.

---

## Sales calls / pitch materials

**Primary: Golden Circle**, live — leading a discovery call with why before
what services cost builds alignment before the pricing conversation starts.

**Secondary: Origin Story**, for the founder-narrative moment on a call when
a prospect asks "why should I trust you," same real inputs as the LinkedIn
use, reused live.

---

## What's explicitly out of scope everywhere

**Hero's Journey and Freytag's Pyramid, full-length, anywhere text-based.**
Both are 6–10 beat arcs built for content someone commits minutes to. No
Click.n.likes text format (email, LinkedIn post, blog post) earns that much
attention up front — they only apply compressed, or to video, where the
format itself asks for sustained attention.
