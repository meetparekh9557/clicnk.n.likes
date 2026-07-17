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
- [ ] Homepage: audit-weapon hero (URL input → live scan moment), 3-steps
      strip, services bento, "How we're different", tools teaser, lead form.
- [ ] GitHub Actions deploy to a preview (build `site/` on push; do NOT touch
      Pages source yet — v1 keeps serving).
- [ ] 7 service pages (template + per-service content ported from v1, founder
      voice pass).
- [ ] Tools migration: port all 9 tools + quote calculator as React islands;
      shared engine (scoring logic copied verbatim from v1); re-run the full
      Playwright suite against the new build. HIGHEST RISK — do not rush.
- [ ] Insights index + 4 article pages (content exists in v1, already in
      founder voice).
- [ ] Work, About, FAQ, Contact, Privacy, Terms pages.
- [ ] Phase 3 polish pass: view transitions, animated calculator totals,
      self-drawing charts component, before/after slider component (for
      Phase 4), aurora hero, full motion audit, `prefers-reduced-motion`.
- [ ] sitemap.xml, robots.txt, per-page JSON-LD, OG images.
- [ ] Full QA: Lighthouse all pages, iPhone-13 Playwright suite, tool parity
      tests, forms end-to-end (Apps Script emails + sheet rows).
- [ ] Founder preview approval → cutover (Pages serves `site/` build; v1
      revert = one merge). Only after founder says go.
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
