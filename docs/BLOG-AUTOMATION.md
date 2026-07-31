# Auto-blogging (2 posts/week, Tuesday + Friday)

The Insights blog publishes **two posts a week — one Tuesday, one Friday —
fully automatically**, in the founder's calibrated voice (see `/AGENTS.md`),
with an on-brand featured image, no human input required. Every published
post still obeys the site's core rule: any number in it traces to a real,
named, checkable source, or it isn't published as a fact.

## How it works

A scheduled task (a Claude Code Remote Routine) fires into a fresh session in
this environment twice a week and:

1. Opens `docs/blog-backlog.md` and takes the **first unchecked topic** (a
   real buyer question mapped to a service page), rotating verticals so two
   consecutive posts never cover the same one.
2. Writes the article into `site/src/data/articles.ts` by **prepending** a new
   entry to the `articles` array (newest first), matching the `Article`
   interface exactly: `slug, tag, title, excerpt, author, readTime,
   date (today, YYYY-MM-DD), body (HTML string), faqs`.
   - The body follows the house structure: opening bridge from the old world
     to the digital present; question-form H2s answered directly in the first
     sentence; at least one bulleted list with **bold lead-in labels + colon**;
     named personas; an **"Example in Action:"** callout; a titled
     **"Conclusion:"**; and a closing `.article-cta` block. 2–4 in-content
     links to the most relevant service page and sibling articles. 5 FAQs.
   - **Money-keyword linking:** wherever it fits the post's actual topic
     without reading forced, "organic growth agency" / "organic growth
     services" links once to `/`, and "SEO agency" / "SEO services" links
     once to `/services/seo/`. Never all four crammed into one post just to
     hit this rule — a post only uses the phrase(s) a real sentence calls for.
3. Generates the featured image:
   `node site/scripts/gen-featured.mjs --slug=<slug> --tag="<Tag>"
   --title="<line1>|<line2>"` → writes `site/public/insights/<slug>.png`
   (branded 1200×630, real Space Grotesk). The `|` marks the line break; the
   second line renders teal.
4. Ticks the topic's box in `docs/blog-backlog.md`, and if fewer than 6 topics
   remain, appends fresh buyer-question topics so the queue never runs dry.
5. Builds the site (`cd site && npm run build`) to confirm no errors, commits,
   and pushes to `main` so the deploy workflow republishes.

## Push authentication (`GH_TOKEN`)

A Routine's fired session starts with a fresh clone and no guaranteed push
access — the ambient git credential in this environment is reliable for
reading/cloning a public repo but was never confirmed to cover pushing. Both
auto-blog Routines (the weekly post and its watchdog) now push with an
explicit credential instead of assuming that works:

- `GH_TOKEN` = a GitHub **fine-grained personal access token**, scoped to
  only `clicnk.n.likes` (not "All repositories"), with **Contents: Read and
  write** permission and nothing else.
- Give the automation the token without committing it: set `GH_TOKEN` as an
  **environment variable in the Claude Code environment** both Routines run
  in. They read it from `process.env`; if it's absent, the push step falls
  back to a plain `git push origin HEAD:main`.
- The token is never printed, never embedded in the remote URL, and never
  committed — it's injected per-push via a transient `git -c
  http.extraheader=...` flag so it can't leak through `git remote -v`, a
  committed config file, or echoed error text.
- If the token expires or is revoked, the push step falls back to the plain
  (unauthenticated-beyond-ambient) push, which may fail — the watchdog
  Routine three hours behind the weekly post exists exactly to catch that and
  retry the same day.

No `articleMeta` entry is required — `insights/[slug].astro` falls back to the
article's title + excerpt for SEO meta, and the sitemap picks up new articles
automatically. A new post needs only the `articles` entry + the PNG.

## Guardrails (why it's safe to run live)

- **Sourced or nothing:** every stat traces to a named, checkable source, or
  is written as a principle/range — never a fabricated figure.
- **Voice-locked:** the founder's register in `/AGENTS.md` is followed exactly
  (elevated professional B2B, no slang, no fragments, no invented case metrics
  beyond the honest "Example in Action" pattern).
- **Scope-locked:** the task adds one article + one image + a backlog tick per
  run. It never edits layout, tools, pricing or existing posts.
- **Structure-locked:** the `Article` shape and the on-page template are fixed;
  the task only fills content into them.

## Managing it

- **Pause / stop:** disable or delete the Routine (owned by this account).
  Ask Claude to "pause the auto-blog" or manage it from the Routines list.
- **Change topics:** edit `docs/blog-backlog.md` — reorder, add, or remove
  topics. The task always takes the top unchecked one.
- **Change cadence:** the schedule is `30 5 * * 2,5` (UTC) = Tuesday & Friday,
  05:30 UTC (11:00 AM IST), plus a randomized 1–51 minute delay before the
  Routine commits — so the live publish time lands somewhere in the
  11:00 AM–12:00 PM IST window each run rather than the identical minute
  twice a week forever. Edit the Routine's cron to change the start time; the
  watchdog's cron should stay ~3 hours behind it.
- **Write one by hand:** add an entry to `articles.ts`, run the image
  generator, and push. The format is plain and self-evident.
