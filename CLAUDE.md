# Click.n.likes — Project Notes for Claude

Single-file website (`index.html`) for Click.n.likes, a full-stack organic
growth agency (Ahmedabad & Mumbai, serving worldwide). Hosted on GitHub Pages
at clicknlikes.com. Backend is one Google Apps Script (source: `apps-script.gs`)
that logs leads to a Google Sheet, sends branded email via Gmail
(business@clicknlikes.com alias), and serves the single-page analyzer used by
the free tools. Never commit API keys: the repo is public.

## Brand voice (calibrated from the founder's own writing — follow for ALL copy)

The founder's register is **elevated professional B2B**: authoritative,
complete, metaphor-forward. Not casual, not punchy, no fragments, no jokes.

Rules:
1. **Open with a bridge from the old world to the digital present.** ("In the
   past, a manufacturer's success was forged on the factory floor… the path
   your most valuable customers take has irrevocably shifted.")
2. **Question-form H2s, answered directly in the first paragraph beneath
   them.** The direct answer comes first; elaboration follows.
3. **Bulleted lists use bold lead-in labels with a colon**, e.g.
   "**Schema Markup for Products & Specifications:** This is a high-impact
   tactic…"
4. **Name the personas precisely** — "engineers, procurement managers, and MRO
   specialists", never just "customers" or "people".
5. **Flowing, formal sentences.** Medium-long, comma-rich, no sentence
   fragments, minimal em-dashes. Vocabulary: "non-negotiable", "paramount",
   "high-impact", "frictionless", "votes of confidence", "24/7 lead generation
   engine", "not just vanity metrics".
6. **Frame stakes as business transformation**: expenses become assets,
   websites become engines, visibility becomes revenue. ("…transforms from a
   line-item expense into your most powerful lead generation asset.")
7. **Conclusions carry a title** ("Conclusion: Your Path to …") and reframe
   the topic as a foundational investment, ending on long-term growth.
8. **Case references use an "Example in Action:" callout** with a concrete
   metric.
9. Persuasion through completeness and authority, never through hype or
   slang. Second person ("you/your") for the reader; the agency appears in
   third person or first-person plural sparingly.

## Engineering conventions

- All tool scoring must be deterministic and honestly labelled: anything shown
  as "verified" must come from a live fetch in that session; self-reported
  answers are always labelled self-reported, on screen and in emails.
- Email gating stays: every tool requires an email before results.
- Test with Playwright at iPhone-13 viewport before pushing UI changes; check
  for horizontal overflow on every page touched.
- The premium rebuild scope (4 phases) is the roadmap of record; Phase 2 is an
  Astro + Tailwind + React-islands rebuild with real per-page URLs.

## Continuing the rebuild

The premium rebuild's live plan, state, design decisions and protocols are in
`docs/REBUILD-PLAN.md`. Read it before any rebuild work; continue from the
first unchecked milestone; update its checkboxes in every PR.
