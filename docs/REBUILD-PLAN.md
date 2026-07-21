# Premium Rebuild — Working Plan & State

**The roadmap of record. Any session continuing this work: read this file and
`CLAUDE.md` (brand voice) first, then continue from the first unchecked item.
Update checkboxes in this file with every PR.**

## What we're building (agreed vision)

A multi-page Astro + Tailwind + React-islands site replacing the single-file
v1 (`index.html`), which keeps serving until cutover. Premium through
restraint and craft, built around the signature weapon: the site audits a
prospect's website live (Apps Script analyzer, `apps-script.gs` — backend
stays untouched). Founder's voice everywhere (rules in `CLAUDE.md`).
Hard gates: Lighthouse ≥95/page, <2s mobile, zero horizontal overflow at
360px, every tool behavior-identical to v1.

## Design direction (locked with founder)

- **Motion vocabulary from Awwwards references, without their weight:**
  expo/quart easing 600–900ms; staged masked-line hero entrances; Astro View
  Transitions between pages; big display-type scale contrast; staggered
  reveals; section numbering; marquee strips; subtle magnetic hovers.
- **Rejected (founder agreed):** full-screen loaders (except honest tool scan
  states), scroll-hijack/smooth-scroll libs, WebGL, sound, custom cursors,
  click sparks, emoji-as-icons. Use Lucide SVG icons.
- **Aurora/gradient-mesh hero background** (CSS only), one human element
  (founder photo + 2-line note), trust signals beside CTAs.
- Loader verdict: none. Max concession if founder insists after preview: one
  ≤500ms CSS-only first-visit mark reveal, never blocking content.

## Build order (Phase 2 + 3)

- [x] Scaffold `site/` (Astro 5 + Tailwind 4 + React islands), brand tokens,
      Base layout with per-page SEO. Build passing.
- [x] Shared shell: Nav (real links), Footer (contact/socials/legal), button +
      card components, motion utilities (easing tokens, reveal-on-scroll,
      staged hero entrance), Lucide icons. URL scheme locked in
      `site/src/data/site.ts`: services live at `/services/<slug>/`; other
      pages at `/work/`, `/about/`, `/insights/`, `/tools/`, `/faq/`,
      `/contact/`, `/privacy/`, `/terms/`. Footer newsletter form deliberately
      deferred to the forms/Apps Script wiring milestone (nothing ships dead).
      Note: Lucide has no brand icons — Instagram/LinkedIn glyphs are v1's
      inline SVGs.
- [x] Homepage: audit-weapon hero (URL input → live scan moment), 3-steps
      strip, services bento, "How we're different", tools teaser, lead form.
      Hero = compact Live Website Health Scan (URL + email up front, same
      email-before-results gating as every v1 tool; scoring via the shared
      engine below; honest no-score fallback pointing to /tools/).
      v1 engine ported verbatim to `site/src/lib/engine.js` (webhook client,
      analyzer client, report email builder, scoreOnPageHealth) — the tools
      migration must import from there, never re-derive.
- [x] GitHub Actions deploy to a preview (build `site/` on push; do NOT touch
      Pages source yet — v1 keeps serving). `.github/workflows/preview.yml`:
      branch pushes build + artifact; merges to main publish to /preview/
      (noindex, base-aware links via `site/src/lib/url.ts`) so the founder
      can watch pages land at clicknlikes.com/preview/ while v1 serves /.
- [x] 7 service pages (template + per-service content ported from v1, founder
      voice pass). Data-driven template `site/src/pages/services/[slug].astro`
      + `site/src/data/services.ts`; tool/calculator sections marked for the
      tools milestone to embed islands into.
- [x] Tools migration: all tools + quote calculator ported as React islands
      (Website Health Scan, Funnel Leak & ROI, Competitor Threat, Instant
      Quote, and the 7 per-channel gated checks). Scorers copied verbatim from
      v1's TOOL_LOGIC via `lib/toolScorers.js`; email-gated with honest
      verified/self-reported labels; each service page runs its own check at
      `#tool`. Verified in-browser (exact v1 math). Merged in PRs #21-#23.
      (Web Dev's live Google PageSpeed blend is the one deferred item.)
- [x] Insights index + 4 article pages (content exists in v1, already in
      founder voice). Bodies ported verbatim into `site/src/data/articles.ts`
      (internal links rebased via withBase); newsletter island reuses v1's
      blog-newsletter email/log behavior.
- [x] Work, About, FAQ, Contact, Privacy, Terms pages, plus the Tools hub
      shell (flagship live Website Health Scan runs for real; per-channel
      interactive checks land in the tools milestone above). About carries the
      founder's real story; every page has unique meta, multi-industry framing,
      a mid-page InlineCta, the per-page-aware WhatsApp chat button, and the
      even client-logo grid. Privacy discloses the new Google Analytics use.
- [x] Phase 3 polish pass: Astro View Transitions (`ClientRouter` in Base,
      `fallback="swap"`; every inline/DOM script already re-inits on
      `astro:page-load`). Animated calculator totals via the shared
      `lib/useCountUp.js` hook — Instant Quote and Funnel ROI tally on drag,
      Custom Quote counts up from zero on reveal. Self-drawing charts:
      `FirstPageCliff` columns + multiplier, `CtrChart` bars, and StatTile
      numbers now count up from zero on scroll-in (guarded so ranges like
      "4-6 months" stay static). Hero motion is the `HeroFunnel` convergence
      streaks funnelling into the live audit card (the aurora hero was tried
      and rejected by the founder — kept the clean white look). Full motion
      audit done: every animation honours `prefers-reduced-motion` (snap to
      final state, no motion). Before/after slider is deferred to Phase 4
      (needs real case-study imagery).
- [x] SEO plumbing: dynamic `sitemap.xml` (21 URLs, built from the single
      route list in `lib/seo.ts` so it never drifts) and `robots.txt`
      endpoints (production allows + points to the sitemap; the /preview/
      build disallows all, belt-and-braces with the per-page noindex).
      Site-wide Organization + WebSite JSON-LD from the Base layout, plus
      per-page schema via a `jsonLd` prop: Service + BreadcrumbList on service
      pages, BlogPosting + BreadcrumbList on articles (real datePublished added
      to `articles.ts`), Blog on the Insights index, FAQPage on FAQ,
      OfferCatalog (the three tier prices) on Pricing, breadcrumbs on the top
      pages. Branded 1200x630 OG share image (`public/og-default.png`,
      rendered in the real brand type — Space Grotesk + DM Sans) wired site-
      wide with Open Graph + Twitter summary_large_image tags; articles use
      og:type=article. All structured data emits absolute production URLs and
      validates; verified across the production and preview builds.
- [x] Full QA: iPhone-13 Playwright suite passes (no horizontal overflow and
      zero console errors across home, pricing, services, tools, work, about,
      insights, article and contact; view-transition nav and count-ups
      verified). Tool scoring is ported verbatim from v1 and previously
      verified in-browser. Lighthouse now runs in-sandbox (installed locally,
      driven against the production build over the pre-installed Chromium):
      after the perf/a11y pass — home Perf 91, Pricing 99, SEO service 99,
      Tools 100, article 89; Accessibility 94-100; Best-Practices 96; SEO 100
      across the board. Home Total Blocking Time went 1,050ms -> 70ms by
      driving AuditDemo's count-up imperatively (no per-frame React re-render)
      and idle-deferring the decorative hero canvas. The one gate the founder
      still owns is forms end-to-end: a real send lands a live email + Sheet
      row on the founder's account, so the founder does that live smoke test.
- [x] Founder preview approval → cutover: DONE. The production build now
      publishes to the repo root (Pages "deploy from branch main / root") with
      a /preview/ mirror, CNAME + .nojekyll preserved. Site is LIVE on
      clicknlikes.com; reverting to v1 is a single revert of the publish job.
- [ ] Phase 4: case-study template + founder's real material (numbers +
      client permissions — founder is gathering).

## Protocols (learned the hard way)

1. **Merge race discipline:** after creating a PR, never push to its branch
   until the founder confirms merge; after merge, verify the commit is in
   `origin/main` before proceeding.
2. Every UI change: Playwright test at iPhone-13 viewport + overflow check
   before push.
3. Tool scoring must stay deterministic and honestly labelled
   (verified vs self-reported) — non-negotiable.
4. Small PRs, merged often. Update this file's checkboxes in the same PR.

## Waiting on founder (not blocking build)

- Feedback round results (6 questions from SCOPE doc, sent to circle +
  clients) → shapes Phase 3 emphasis.
- Case-study raw material + client permissions → fills Phase 4.

## Infra facts (so no session rediscovers them)

- Backend: one Apps Script (`apps-script.gs`), URL in `index.html` as
  `SHEET_WEBHOOK_URL`; sends mail as business@clicknlikes.com alias, logs to
  Sheet, `?action=analyze&url=` returns page facts JSON. Deployed + working.
- Hosting: GitHub Pages, domain clicknlikes.com via CNAME, DNS at Hostinger.
- 21st.dev Magic MCP configured in `.mcp.json` (key = env var
  `TWENTY_FIRST_API_KEY`, also in untracked `.claude/settings.local.json`).
- Design skills installed in `.claude/skills/` (ui-ux-pro-max suite).
- Whatsapp +91 84691 63322 · instagram.com/click.n.likes ·
  linkedin.com/company/click-n-likes
