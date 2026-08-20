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
- **The TITLE must carry the phrase people actually search. The H2s carry
  the conversation.** This is the single biggest thing wrong with the posts
  published up to Aug 2026, and Search Console proves it. Three posts sit on
  page one of Google right now — and earned 1, 2 and 4 impressions in 28 days,
  because the only queries they match are rephrasings of their own titles:

  | Published title | The query it actually ranks for | Impressions |
  | --- | --- | --- |
  | Why does my competitor outrank me on Google Maps when I'm closer? | "why nearby doctors rank above me" | 2 |
  | Service-area business vs. storefront | "storefront business vs. service-area businesses" | 9 |
  | The Google Business Profile mistakes costing you the local pack | "missing local pack test" | 1 |
  | How much should a small business spend on marketing? | (the real head term) | 3, at position 90 |

  Nobody types "why nearby doctors rank above me". The titles were written as
  conversation, and Google matched them to conversation. Keep the founder's
  question-form voice for **H2s** — it is genuinely good for AI citation,
  because an answer engine lifts a question with a direct answer under it —
  but the **title and slug** must contain the phrase a buyer types. "The
  3-second test your website keeps failing" is invented terminology: it reads
  well and it is unsearchable.
- **Aim for the middle band, and know which failure you are avoiding.**
  Topic selection so far has been bimodal and both ends produce nothing:
  ultra-specific phrasings that are winnable but that nobody searches, and
  head terms with real demand where a young domain sits at position 90. A
  topic has to clear BOTH tests, and the demand check below only covers one
  of them unless you deliberately ask the second.
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
- [x] rank-on-maps — Why does my competitor outrank me on Google Maps when I'm closer? `[PHRASING FAIL: ranks position 85 on "why nearby doctors rank above me", 2 impressions/28d. Retitle toward the searched phrasing when next revised.]` — links: hub (local SEO services), siblings `gbp-mistakes` (profile relevance errors), `reviews-that-convert` (review process), `service-area-vs-storefront` (service-area rules) — demand check Aug 2026: strong signal, 8 competitors answering the exact query, ALL small agency sites, no HubSpot/Ahrefs-tier incumbent. Winnable.

## Social Media Growth cluster — hub: `/services/social-media-growth/`

- [x] social-every-day — Does my business really need to post on social media every day?
- [x] social-growth-timeline — What's a realistic timeline to grow a following that actually converts? (written as a staged principle with one clearly-labeled illustrative example, no invented client figures)
- [x] instagram-vs-linkedin-b2b — Instagram vs. LinkedIn: where should a B2B service business actually post? (uses the real, sourced 75–85% B2B-leads-from-LinkedIn figure instead of an invented internal ratio) — replaces the older, vaguer `which-social-platform` topic below

## Website Development cluster — hub: `/services/website-development/`

- [x] 3-second-test — The 3-second test your website keeps failing `[PHRASING FAIL: position 6.25 with 4 impressions/28d. "3-second test" is invented terminology - unsearchable. Retitle toward the real question when next revised.]`
- [x] cheap-website-cost — Why does a good website cost more than the cheap quote I was given?
- [x] website-cost-checklist — What should a website cost, and what should be included? (uses the real, published one-time pricing already live in the Quote Calculator: Starter ₹16,000/5 pages, Growth ₹50,000/12 pages, Pro ₹1,24,000/20 pages, ₹4,500/extra page — this was already public, just not yet written up as its own post)
- [x] slow-speed-costing-leads — How do I know if my site's slow load speed is actually costing me leads? — links: hub (website development), sibling `3-second-test` (reuse its "four leaks" framework for consistency), and `/tools/website-speed/` — ready to write now: reuses the already-sourced Google/SOASTA mobile-speed stat, no new data needed
- [x] website-redesign-worth-it — Is a website redesign worth it, or should I just fix what I have? — links: hub (website development), siblings `slow-speed-costing-leads`, `website-cost-checklist`, `cheap-website-cost`, and `/work/aidbylaw/` — highest commercial intent in this cluster. Demand check Aug 2026: 7 agency posts on the exact question, no major incumbent. Winnable.

## Paid Campaigns cluster — hub: `/services/paid-campaigns/`

- [x] seo-or-ads-first — Should you invest in SEO or Google Ads first?
- [x] paid-ads-budget — How much should I actually budget for Google Ads?
- [x] google-ads-learning-phase — Why does my first month of Google Ads look worse than month 4? — links: hub (paid campaigns), sibling `paid-ads-budget` (that post gives the budgeting formula; this one covers the learning-phase timing the formula doesn't), and `/work/aidbylaw/` — ready to write now using AidByLaw's real, already-published numbers: ₹50,000–₹1,50,000/month budget, 20–30 leads/month during the two-month platform learning phase, climbing to 150+ by mid-engagement. Retitled from the brief's original ("How much should I budget for Google Ads in month one?") specifically to avoid duplicating `paid-ads-budget`'s question.
- [ ] cost-per-lead-benchmark — What's a good cost-per-lead benchmark for [category]? — links: hub (paid campaigns), `/tools/funnel-roi/`, sibling `seo-or-ads-first` — `[NEEDS REAL DATA: a named third-party cost-per-lead benchmark by category (e.g. a WordStream-style report), or the agency's own client averages by category — do not publish a single CPL number without one]`

## AI Search cluster — hub: `/services/ai-seo/`

Founded Aug 2026. The hub had almost no supporting content despite AI search
being one of the site's strongest positioning angles.

- [x] ai-search — Why your clinic needs to worry about ChatGPT, not just Google `[PHRASING FAIL: position 4 with 1 impression/28d. Ranking well for a query nobody types.]`
- [x] blog-that-ranks — How to write one blog post that ranks and gets cited by AI
- [x] ai-overview-traffic — Are Google's AI Overviews stealing my website traffic? — links: hub (AI SEO services), siblings `ai-search`, `blog-that-ranks` — uses the real sourced Sistrix 27%→11% CTR figure (via Forbes). Honest differentiator most competitors miss: local/service businesses have largely NOT been hit, because their customers arrive via location searches.

## Hiring-intent cluster — hub: `/services/seo/`

Added Aug 2026 after the Search Console audit above. Every other cluster
targets a buyer diagnosing a *problem*. This one targets a buyer who has
already decided to hire or fire an agency, which is the highest-intent
moment there is — and the SERPs are winnable because they are contested
entirely by other small agencies, not by HubSpot or Ahrefs.

These also suit this site specifically: published transparent pricing and
the no-lock-in refund are exactly the things these posts ask a reader to
demand of an agency, so we can answer our own questions on the page instead
of dodging them the way most agencies writing these posts have to.

- [ ] questions-to-ask-seo-agency — Questions to Ask an SEO Agency Before You Hire One — links: hub (SEO agency), `/pricing/`, sibling `seo-agency-red-flags` — demand check Aug 2026: real signal, 7+ dedicated competitor posts, ALL small agency sites, no page-one incumbent. Winnable and maximum intent. Answer every question on the page with our own real answer (published pricing, who does the work, what the first 90 days are) rather than listing questions abstractly — that is the differentiator no competitor on this SERP can copy.
- [ ] seo-agency-red-flags — SEO Agency Red Flags: How to Tell If Yours Is Actually Working — links: hub (SEO agency), sibling `questions-to-ask-seo-agency`, `/work/aidbylaw/` — demand check Aug 2026: real signal, 6+ competitor posts, all small sites. Highest-intent moment of all: someone searching this is about to fire an agency. Our entire positioning is the inverse of these red flags, so this is written from what we already do, not invented. `[NEEDS REAL DATA: the "75% of businesses switch agencies over misaligned expectations" figure surfaced during the demand check but was not traced to a named primary source — find the original or write the point as a principle.]`
- [ ] what-seo-report-should-show — What Should an SEO Report Actually Show You? — links: hub (SEO agency), siblings `seo-agency-red-flags`, `measure-marketing-roi` — companion to red-flags rather than a duplicate: that post is signals of a bad agency, this one is the specific artefact a client should be receiving monthly. Checklist structure is prime AI-citation material.
- [ ] seo-cost-published-prices — How Much Does SEO Cost? (With Our Actual Published Prices) — links: hub (SEO agency), `/pricing/`, sibling `questions-to-ask-seo-agency` — the head term is competitive, but almost no agency publishes real numbers, and we already do. Real figures are also exactly what an answer engine quotes. Narrow the title to a long-tail variant if the demand check finds page one held by incumbents.
- [ ] get-cited-by-chatgpt — How to Get Your Business Cited by ChatGPT and AI Overviews — links: `/services/ai-seo/` (AI SEO services), siblings `ai-search`, `blog-that-ranks`, `ai-overview-traffic` — emerging topic, so the SERP is thinner than the equivalent classic-SEO query, and demand is growing rather than flat. `[NEEDS REAL DATA: a BrightEdge figure for the share of queries showing AI Overviews surfaced during the demand check (~48%, Feb 2026) — trace it to BrightEdge's own publication before using it.]`

## Industry cluster — leads over volume

Lower search volume than the clusters above, and that is the trade accepted
on purpose: these convert far harder because they name the reader's business.
Only two verticals qualify, because these are the only two with a real,
quantified case study to point at — do not add a third until there is a
client result to back it.

- [ ] seo-for-law-firms — SEO for Law Firms: What Actually Moves the Needle — links: `/services/seo/`, `/work/aidbylaw/` — AidByLaw is the proof: real published figures, paid leads 20-30/mo to 340-390/mo over 13 months, organic 0 to 40/mo.
- [ ] seo-for-manufacturers — SEO for Manufacturers: How Buyers Actually Find Suppliers — links: `/services/seo/`, `/work/kopa-seamless/` — personas are already written into `/AGENTS.md`'s brand voice section (engineers, procurement managers, MRO specialists); Kopa Seamless is the proof.

## General queue (SEO, Content, AI Search — not yet clustered)

- [ ] seo-timeline — How long does SEO really take to show results? (SEO → /services/seo/) — `[DEMAND CHECK FAILED Aug 2026: real signal but NOT winnable — page one is Ahrefs, Search Engine Land, seo.com and Orbit Media. A young domain cannot rank this head term, and the intent is research rather than hiring. Narrow to a specific long-tail variant before writing, or leave it.]`
- [ ] content-vs-ads-manufacturer — Should a manufacturer invest in content or trade-show leads? (Content → /services/content-marketing/)
- [ ] keywords-worth-targeting — How do I know which keywords are actually worth targeting? (SEO → /services/seo/)
- [ ] video-content-necessary — Do I really need to make video content to grow? (Social → /services/social-media-growth/)
- [ ] measure-marketing-roi — How do I actually measure whether my marketing is working? (Content → /services/content-marketing/)
- [ ] local-vs-national-seo — Should a local business target the whole country or just its city? (Local SEO → /services/local-seo/)
- [ ] blog-frequency — How often should my business actually publish blog posts? (Content → /services/content-marketing/)
- [ ] boosting-a-post — Is boosting a Facebook or Instagram post the same as running a real ad campaign? (Paid → /services/paid-campaigns/)
