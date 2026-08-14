# Blog topic backlog

Queue of buyer-question article topics for the weekly auto-blog task
(2 posts/week — Tuesday + Friday). Each topic is a **real question a buyer
close to a decision would type**, mapped to the service page it supports.
The weekly task picks the **next unchecked topic from the top of whichever
section it's rotating into**, writes the post in the founder's voice (see
`/AGENTS.md`), and ticks the box.

## How the queue works

- **Topic clusters, not a flat list.** Each of the four services flagged as
  under-served (Local SEO, Social Media Growth, Website Development, Paid
  Campaigns) has its own cluster below: one **hub** (the service page) and
  several **spoke** Insights posts. SEO, Content Marketing and AI Search stay
  in the general queue at the bottom until they earn their own cluster.
- **Internal linking follows the hub/spoke split in `/AGENTS.md`:** every
  spoke links up to its hub using the hub's own **transactional** keyword
  (e.g. "local SEO services"), and sideways to sibling spokes using each
  sibling's own **informational** keyword (its actual buyer question) —
  never "click here", never a different phrase for the same target on two
  different pages.
- **Check for cannibalization before writing.** A companion angle on an
  already-published question is fine (e.g. "why reviews matter" vs. "how
  many reviews you need"); a second post chasing the *same* question the
  site already answers is not — retitle, merge into the existing post, or
  drop it.
- **Top-down within a cluster; rotate clusters.** Don't publish two posts
  from the same cluster back-to-back. If the next unchecked topic repeats
  the cluster just published, skip to the next cluster that doesn't, then
  come back.
- **Never invent stats.** Every number in a post must trace to a named,
  checkable source, or a real, agency-verified client figure, or be phrased
  as a range/principle — never a fabricated figure. A topic marked
  `[NEEDS REAL DATA: ...]` is a **hold point**: do not publish it until that
  note is resolved, either by the founder supplying the real figure or by
  finding a genuine named third-party source. When in doubt, leave the
  number out and write the point as a principle instead.
- **Validate real demand before writing, not after.** A topic being on this
  list means someone judged it a plausible buyer question — it does not mean
  anyone checked whether people actually search that exact phrasing. Before
  writing, WebSearch the topic's core question (and 1-2 phrasing variants)
  and look at what comes back:
  - **Real signal:** "People also ask" boxes, Reddit/Quora threads, or
    competitor blog posts already answering the same question. This means
    real people search it — proceed.
  - **Winnable:** the pages currently ranking for it are thin, generic, or
    from low-authority sites, not exclusively page-one incumbents like
    HubSpot, Semrush or Search Engine Land. A young, low-authority domain
    cannot out-rank those on a head term; it can win a specific long-tail
    variant they haven't bothered to answer precisely.
  - **No signal at all** (no related discussion, no "people also ask", the
    query reads like something only an agency would think to ask): don't
    drop the topic, but narrow it to a more specific, clearly-searched
    variant if one surfaces during the check, and note in the backlog entry
    what the check found. Writing into a query nobody types is exactly what
    produces a technically-good post with permanently zero traffic.
  - This check does not require a paid keyword tool, and none is connected
    here — it is a directional real/winnable/narrow judgment call from what
    WebSearch actually returns, not a synthetic search-volume number. Do not
    invent a volume figure to justify a topic; the judgment itself is the
    output.
- **Every new post gets one guaranteed distribution touch, not just an
  organic listing.** On a young, thin-authority domain, waiting on organic
  discovery alone is slow by design. The day a post publishes, it is the
  next LinkedIn company-page Routine's default pick (see that Routine's
  "blog highlight" rotation) rather than one option among three chosen at
  random — a specific, recent post to promote beats a generic rotation slot.
- **Refill:** when fewer than 6 topics remain unchecked across all clusters,
  the task appends fresh buyer-question topics (from sales-call themes,
  "people also ask", and the service pages) before it runs dry. Run the
  demand-validation check above on new topics as they're appended, not only
  at write-time — a topic that fails the check should be marked with a note
  rather than added at face value.

## Column key

`[ ] slug — Title question — internal links: hub / siblings — notes`

## Local SEO cluster — hub: `/services/local-seo/`

- [x] gbp-mistakes — The Google Business Profile mistakes costing you the local pack
- [x] reviews-that-convert — How do I get more Google reviews without begging for them?
- [ ] review-count-threshold — How many reviews do I actually need to rank in the local pack? — links: hub (local SEO services), sibling `gbp-mistakes` (review cadence) — `[NEEDS REAL DATA: a named third-party study or a real agency client example correlating review count vs. rating with local-pack rank — do not publish the "40 reviews at 4.6 beats 90 at 4.1" framing until one is found/confirmed]`
- [x] service-area-vs-storefront — Service-area business vs. storefront: does local SEO work differently? — links: hub (local SEO services), sibling `gbp-mistakes` (expand its service-area paragraph rather than repeat it) — client example optional, can ship without one

## Social Media Growth cluster — hub: `/services/social-media-growth/`

- [x] social-every-day — Does my business really need to post on social media every day?
- [x] social-growth-timeline — What's a realistic timeline to grow a following that actually converts? (written as a staged principle with one clearly-labeled illustrative example, no invented client figures)
- [x] instagram-vs-linkedin-b2b — Instagram vs. LinkedIn: where should a B2B service business actually post? (uses the real, sourced 75–85% B2B-leads-from-LinkedIn figure instead of an invented internal ratio) — replaces the older, vaguer `which-social-platform` topic below

## Website Development cluster — hub: `/services/website-development/`

- [x] 3-second-test — The 3-second test your website keeps failing
- [x] cheap-website-cost — Why does a good website cost more than the cheap quote I was given?
- [x] website-cost-checklist — What should a website cost, and what should be included? (uses the real, published one-time pricing already live in the Quote Calculator: Starter ₹16,000/5 pages, Growth ₹50,000/12 pages, Pro ₹1,24,000/20 pages, ₹4,500/extra page — this was already public, just not yet written up as its own post)
- [x] slow-speed-costing-leads — How do I know if my site's slow load speed is actually costing me leads? — links: hub (website development), sibling `3-second-test` (reuse its "four leaks" framework for consistency), and `/tools/website-speed/` — ready to write now: reuses the already-sourced Google/SOASTA mobile-speed stat, no new data needed

## Paid Campaigns cluster — hub: `/services/paid-campaigns/`

- [x] seo-or-ads-first — Should you invest in SEO or Google Ads first?
- [x] paid-ads-budget — How much should I actually budget for Google Ads?
- [x] google-ads-learning-phase — Why does my first month of Google Ads look worse than month 4? — links: hub (paid campaigns), sibling `paid-ads-budget` (that post gives the budgeting formula; this one covers the learning-phase timing the formula doesn't), and `/work/aidbylaw/` — ready to write now using AidByLaw's real, already-published numbers: ₹50,000–₹1,50,000/month budget, 20–30 leads/month during the two-month platform learning phase, climbing to 150+ by mid-engagement. Retitled from the brief's original ("How much should I budget for Google Ads in month one?") specifically to avoid duplicating `paid-ads-budget`'s question.
- [ ] cost-per-lead-benchmark — What's a good cost-per-lead benchmark for [category]? — links: hub (paid campaigns), `/tools/funnel-roi/`, sibling `seo-or-ads-first` — `[NEEDS REAL DATA: a named third-party cost-per-lead benchmark by category (e.g. a WordStream-style report), or the agency's own client averages by category — do not publish a single CPL number without one]`

## General queue (SEO, Content, AI Search — not yet clustered)

- [ ] seo-timeline — How long does SEO really take to show results? (SEO → /services/seo/)
- [ ] content-vs-ads-manufacturer — Should a manufacturer invest in content or trade-show leads? (Content → /services/content-marketing/)
- [ ] rank-on-maps — Why does my competitor outrank me on Google Maps when I'm closer? (Local SEO → /services/local-seo/)
- [ ] ai-overview-traffic — Are Google's AI Overviews stealing my website traffic? (AI SEO → /services/ai-seo/)
- [ ] keywords-worth-targeting — How do I know which keywords are actually worth targeting? (SEO → /services/seo/)
- [ ] website-redesign-worth-it — Is a website redesign worth it, or should I just fix what I have? (Websites → /services/website-development/)
- [ ] video-content-necessary — Do I really need to make video content to grow? (Social → /services/social-media-growth/)
- [ ] measure-marketing-roi — How do I actually measure whether my marketing is working? (Content → /services/content-marketing/)
- [ ] local-vs-national-seo — Should a local business target the whole country or just its city? (Local SEO → /services/local-seo/)
- [ ] blog-frequency — How often should my business actually publish blog posts? (Content → /services/content-marketing/)
- [ ] boosting-a-post — Is boosting a Facebook or Instagram post the same as running a real ad campaign? (Paid → /services/paid-campaigns/)
