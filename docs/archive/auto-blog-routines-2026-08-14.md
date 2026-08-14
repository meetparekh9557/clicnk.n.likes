# Archived: the two auto-blog Routines (deleted 2026-08-14)

Both scheduled Routines that published the Insights blog were **deleted on
2026-08-14**. This file preserves their prompts verbatim, and the reasons they
were retired, so the pipeline's tuning is not lost with the trigger configs.

Nothing here is live. It is a record.

## Why they were deleted

The publisher fired on schedule and produced nothing, repeatedly, with no
error surfaced anywhere:

| Scheduled run | Fired | Post landed on `main` |
| --- | --- | --- |
| Fri 2026-08-07 | yes | no — recovered manually Sat 08-08 |
| Tue 2026-08-11 | yes | **no** |
| Fri 2026-08-14 | yes (05:38 UTC) | **no** |

The watchdog, whose entire purpose was to publish the post itself when the
publisher hadn't, fired on 08-11 and 08-14 as well and also produced nothing.
Two consecutive double-failures meant the safety net was failing the same way
the thing it watched was failing, so the arrangement had no remaining
protective value.

The failure was never diagnosed from the runs' own output. Note for whoever
picks this up: **get the failing session's actual error text before theorising**
— that lesson is already written into `/AGENTS.md` and it applied here too.

The replacement model, decided by the founder, removes autonomous publishing
altogether: a draft is prepared, the founder is notified, and the post goes
live only on the founder's explicit say-so.

## What was lost with them

Both prompts encoded fixes for real failures that had already been paid for
once. Any future automation should carry these forward:

- **Fired sessions start with an empty working directory.** No checkout is
  inherited; the session must clone the repo itself. This alone silently broke
  the auto-blog for a week.
- **`site/node_modules` is gitignored**, so a fresh clone has source but no
  toolchain: `npm ci` is mandatory or the featured-image generator finds no
  fonts and `npm run build` dies with `sh: 1: astro: not found`.
- **Never sleep in a Bash call to randomize timing.** The per-call timeout
  (120s default, 600s max) can tear down the entire session with no error
  output. Randomize the commit's author/committer timestamp instead.
- **Pushes need an explicit credential.** Ambient git access proved reliable
  for cloning a public repo but not for pushing.
- **The internal-linking and category conventions** (transactional anchors to
  service pages, informational anchors to sibling posts, most-specific single
  category, numerals in titles) — these live in `/AGENTS.md` and
  `docs/blog-backlog.md` and remain in force for hand-written posts.

---

## Routine 1 — "Weekly auto-blog (Tue + Fri)"

- **ID:** `trig_01KVwdSsuojKMhXkVEGfidYS`
- **Cron:** `30 5 * * 2,5` (UTC) — Tuesday & Friday, 05:30 UTC / 11:00 IST
- **Environment:** `env_01QEgXPoi1hAKwMFMqoa8ZEo`
- **Notifications:** push on, email off
- **Created:** 2026-07-22 · **Last fired:** 2026-08-14T05:38Z

### Prompt (verbatim)

```
Publish one new Insights blog post for Click.n.likes now, fully autonomously. This is a scheduled auto-blog run (runs every Tuesday and Friday). Work on branch `main`.

STEP -1 — GET THE REPOSITORY (do this before everything, and do not skip the check):
Fired sessions in this environment often start with an EMPTY working directory — no clone happens automatically. Verify, then bootstrap if needed:

    ls -a ~ ; git -C ~/clicnk.n.likes rev-parse --show-toplevel 2>/dev/null

If there is no checkout, clone it yourself. The repository is PUBLIC and this session has a git credential proxy for github.com:

    git clone https://github.com/meetparekh9557/clicnk.n.likes.git ~/clicnk.n.likes

Then `cd ~/clicnk.n.likes` and do all work there — every path below is relative to that directory. Confirm you can see `site/`, `docs/` and `CLAUDE.md` before continuing.
If the clone fails, STOP and report the exact command and error, including whether it was a network, auth or proxy failure. Do not guess at other URLs.

STEP 0 — INSTALL DEPENDENCIES:
`cd site && npm ci --no-audit --no-fund`
`site/node_modules` is gitignored, so a fresh clone has the source but no toolchain: the featured-image generator reads its fonts from `node_modules/@fontsource/`, and `npm run build` fails with `sh: 1: astro: not found`. Takes about 12 seconds. If `npm ci` fails on a stale lockfile, use `npm install --no-audit --no-fund`. Never commit `site/node_modules`.

Do NOT sleep or block for more than ~90 seconds in any single command. The Bash tool this session runs on has a hard timeout ceiling (default 120s, max 600s per call), and a command that runs past it can kill the ENTIRE session outright with zero error output — indistinguishable from the run never having happened. Timing randomization for this Routine is handled entirely at commit time (STEP 7), never via a real-time sleep. Do not add one.

FAILURE HANDLING (every step): if a step fails, do NOT continue and do NOT push a half-finished post. Stop, and reply with the exact command and the exact error text. A missing post is recoverable; a broken build on `main` takes the live site down. If the instructions here contradict what you actually observe in the session, believe the session and say so — that is how the last several failures were finally diagnosed. IMPORTANT: this Routine has silently failed at the final push step at least twice recently (confirmed: it completes all the real work — topic, writing, image, build — and dies on `git push` with no commit landing on `main`). If the push fails, do not treat that as a soft/ignorable failure — report the EXACT git error text, and check whether `$GH_TOKEN` is actually set and non-empty (do not print its value) before falling back to a plain push.

STEPS:

1. Read `/CLAUDE.md` (the founder's brand voice, the SEO conventions, AND the internal-linking convention — follow all exactly), `docs/BLOG-AUTOMATION.md` and `docs/RANKING-AUTOMATION.md`. Read `docs/blog-backlog.md` in full — it is organized into topic clusters (one hub service page + several spoke Insights posts per under-served service), plus a general queue at the bottom.

2. CHOOSE THE TOPIC — data-driven first, backlog as fallback:
   a. If BOTH env vars `APPS_SCRIPT_URL` and `SC_TOKEN` are set to real values (not placeholder text like `<your deployed Apps Script /exec URL>` — check for that literal pattern, it has been left unconfigured before), fetch ranking opportunities:
      `curl -s "$APPS_SCRIPT_URL?action=searchconsole&token=$SC_TOKEN&days=28"`
      If the JSON has `ok:true` and a non-empty `opportunities` array, pick the highest-`score` opportunity whose query is NOT already well covered by an existing article in `site/src/data/articles.ts`, and write the post to target THAT query (use it as the title's basis / primary keyword, and link to the `page` it already ranks). Skip opportunities that duplicate an existing post.
      If the call fails, returns `ok:false`, the env vars are unset, OR they're still placeholder text, fall back to (b). This is expected, not an error — do not stop the run over it.
   b. Backlog fallback: pick the FIRST unchecked topic (`- [ ]`) from the top of `docs/blog-backlog.md`, scanning cluster by cluster top to bottom then the general queue. SKIP any topic tagged `[NEEDS REAL DATA: ...]` or `[BLOCKED: ...]` unless you can resolve the note yourself with a genuine named third-party source (use WebSearch and cite it explicitly) or the note says a client example is optional — never invent the missing figure just to unblock a topic. Move to the next unchecked topic instead.
   In BOTH cases, rotate: if the chosen topic covers the same vertical/cluster/tag as the newest article in `articles.ts` (first entry), pick the next best option from a different cluster.
   CANNIBALIZATION CHECK (before committing to a topic): skim `site/src/data/articles.ts` titles/excerpts for the same core buyer question already answered. A companion angle on the same broader subject is fine (the backlog notes each spoke's distinct angle vs. its siblings); re-answering an identical question is duplicate content — pick the next topic instead.

3. VALIDATE REAL DEMAND BEFORE WRITING (see "Validate real demand before writing, not after" in `docs/blog-backlog.md` for the full reasoning — this step is non-negotiable, not optional polish): WebSearch the topic's core question and 1-2 phrasing variants. Look for: (a) real signal — "people also ask" results, Reddit/Quora threads, or competitor posts already answering the same question, meaning real people search it; (b) winnable — the current top-ranking pages are thin/generic/low-authority, not exclusively page-one incumbents like HubSpot, Semrush or Search Engine Land, since a young low-authority domain cannot out-rank those on a head term. If the topic as written shows no real signal at all, narrow it to a more specific long-tail variant that DOES show signal before writing — do not invent a search-volume number to justify it either way, this is a directional judgment call from what the search actually returns, not synthetic data. Note briefly in your final reply what the check found.

4. Read `site/src/data/articles.ts` to match the `Article` interface exactly and mirror the existing posts (~1400–1700 words, "9 min read"). PREPEND a new object to the `articles` array (newest first). Fields: slug (kebab-case), tag, categories, title (a buyer question), excerpt (1 sentence), author: "Click.n.likes team", readTime: "9 min read", date: TODAY in YYYY-MM-DD, body (HTML string), faqs (exactly 5 {q,a}).
   CATEGORIES (read the doc comment on the `Article` interface and follow it): pick from exactly "SEO", "AI Search", "Local SEO", "Content Marketing", "Paid Media", "Websites & Conversion", "Social Media Growth", "Strategy".
   MOST SPECIFIC ONLY — never stack a parent on a child. A Google Business Profile post is ["Local SEO"], NOT ["Local SEO","SEO"]. A post on being cited by AI assistants is ["AI Search"], NOT ["AI Search","SEO"]. A blogging post is ["Content Marketing"], not Content Marketing plus SEO. Reserve "SEO" for organic search work no narrower bucket covers. Most posts need exactly ONE category; use two or three only when the post genuinely spans separate disciplines (a piece weighing ad spend against organic investment is ["Paid Media","SEO","Strategy"]).
   Every category is a filter tab on /insights/ and a badge on the card: if most posts carry "SEO", that tab returns the whole list and the filter stops working. `tag` is the single short badge on the featured image; `categories` drives the filter.
   TITLE RULE (SEO): numbers as NUMERALS, never words — "5 Mistakes", "3-Second Test". Applies to the excerpt too.
   BODY STRUCTURE (non-negotiable): open with a bridge from the old world to the digital present; question-form H2s each answered directly in the first sentence beneath; at least one <ul> with <strong>bold lead-in label:</strong> bullets; name real personas (engineers, procurement managers, clinic owners, founders — never "customers"); one "<strong>Example in Action:</strong>" callout with a concrete but honest illustrative result (NOT a fabricated named-client statistic); a titled "Conclusion: ..." H2; a closing `<div class="article-cta">` with an <h4>, <p>, and a teal button (`class="btn btn-teal magnetic"`) to the mapped service page. Include 2–4 in-content links (root-relative).
   INTERNAL LINKING CONVENTION (non-negotiable — see /AGENTS.md "SEO conventions"): every link this post makes OUT to a service page must use that service page's own TRANSACTIONAL keyword as the anchor text (e.g. link to /services/local-seo/ with anchor text like "local SEO services", not a vague phrase, not the page title verbatim). Every link to a sibling Insights post must use that sibling's own INFORMATIONAL keyword/question phrasing as the anchor text, not "click here" or a one-off paraphrase. Check `docs/blog-backlog.md`'s cluster entry for this topic — it names the hub and sibling(s) this post should link to. Reuse the SAME anchor phrasing for a given target page every time it's linked from anywhere on the site; do not invent a new phrase per post.
   MONEY-KEYWORD LINKING (every post, non-negotiable): work in, naturally (never as a stuffed list), anchor text for our own core positioning terms, each hyperlinked once to the page that should rank for it: "organic growth agency" or "organic growth services" → `/` (the homepage); "SEO agency" or "SEO services" → `/services/seo/`. Only include the ones that fit the post's actual topic without reading forced — a post about Local SEO might naturally use "SEO services" once, not all four terms. Never add a phrase just to hit this rule if no sentence in the post genuinely calls for it; unnatural keyword-stuffing is worse than skipping one.
   SOURCING RULE: every number traces to a real, named, checkable source (use WebSearch to verify before citing one by name), or is written as a principle/range. NEVER invent a statistic or a client metric.

5. Featured image (needs STEP 0):
   `cd site && node scripts/gen-featured.mjs --slug=<slug> --tag="<Tag>" --title="<line1>|<line2>"`
   ("|" is the line break; ~3–5 words per line; second line renders teal). Confirm `site/public/insights/<slug>.png` exists.

6. Tick the backlog topic to `- [x]` in place, inside its cluster section (do not move it out of the cluster list). If fewer than 6 unchecked topics remain across all clusters + the general queue, append 4–6 fresh buyer-question topics — prefer filling out an existing cluster's spokes over starting a new one, following the same `slug — Title — links: ... — notes` format, and run the same demand-validation judgment call on each new one before adding it at face value. (If you used a Search Console opportunity, you may append it as a checked line for the record.)

7. `cd site && npm run build` — must complete with no errors (one more page than before). Then `rm -rf site/dist`.

8. Commit and push. There is no `gh`/GitHub MCP in this session — use git directly:
   `git add site/src/data/articles.ts site/public/insights/<slug>.png docs/blog-backlog.md`
   RANDOMIZE THE COMMIT TIMESTAMP (replaces any real-time sleep — this repo is public, and a commit landing at the exact same minute twice a week, forever, reads as an obvious bot rather than a person publishing): compute a timestamp offset by 1–59 random minutes after 05:30 UTC on today's date, and set it as both the author and committer date, e.g.:
       `OFFSET=$(( (RANDOM % 3480) + 60 )); FAKE_TS=$(date -u -d "@$(( $(date -u -d "$(date -u +%Y-%m-%d) 05:30:00" +%s) + OFFSET ))" +"%Y-%m-%dT%H:%M:%S+00:00"); export GIT_AUTHOR_DATE="$FAKE_TS"; export GIT_COMMITTER_DATE="$FAKE_TS"`
   Then `git commit -m "Auto-blog: <title>"` (the exported env vars apply to this commit only, in this shell session).
   Push with an explicit credential rather than relying on ambient git access, which has not proven reliable for pushes in this environment: if the environment variable `$GH_TOKEN` is set to a real value (not placeholder text), run
       `git -c http.extraheader="AUTHORIZATION: basic $(printf 'x-access-token:%s' "$GH_TOKEN" | base64 -w0)" push origin HEAD:main`
   If `$GH_TOKEN` is unset or looks like placeholder text, fall back to a plain `git push origin HEAD:main` AND explicitly flag in your final reply that `$GH_TOKEN` looks unset/invalid, since that has caused silent push failures before. Retry up to 4× with backoff on network error. If rejected because main moved, `git pull --rebase origin main` and push again (using the same $GH_TOKEN-aware push command).
   Never print the value of `$GH_TOKEN`, never put it in the remote URL (so it can't leak via `git remote -v` or error text), and never commit it.
   Do NOT open a pull request. Do NOT commit any API key, the SC_TOKEN, or GH_TOKEN. Do NOT commit `site/node_modules` or `site/dist`.

9. Reply with the published post title, slug, categories, which cluster/hub it belongs to, whether the topic came from Search Console or the backlog, the demand-validation finding from step 3, and the live URL (https://clicknlikes.com/insights/<slug>/). A few lines. If the run failed, reply instead with the step, the exact command and the exact error — especially if it was the push step, per the FAILURE HANDLING note above.
```

---

## Routine 2 — "Auto-blog watchdog (Tue + Fri)"

- **ID:** `trig_01NXh8Shszvd6qQ7LMY2Cy6k`
- **Cron:** `30 8 * * 2,5` (UTC) — three hours behind the publisher
- **Environment:** `env_01QEgXPoi1hAKwMFMqoa8ZEo`
- **Notifications:** push on, email off
- **Created:** 2026-07-28 · **Last fired:** 2026-08-14T09:03Z

### Prompt (verbatim)

```
You are the watchdog for the Click.n.likes weekly auto-blog. The publishing Routine runs at 05:30 UTC every Tuesday and Friday (plus a randomized 1–51 minute delay before it commits, so the actual push time varies within the 11:00 AM–12:00 PM IST window); you run three hours after the cron start to confirm it worked, and to publish the post yourself if it did not. The rule you enforce: a scheduled post is never carried over to another day.

STEP -1 — GET THE REPOSITORY (before anything else; do not skip the check):
Fired sessions in this environment often start with an EMPTY working directory — no clone happens automatically, and that alone has caused failed runs before. Verify, then bootstrap:

    ls -a ~ ; git -C ~/clicnk.n.likes rev-parse --show-toplevel 2>/dev/null

If there is no checkout, clone it yourself. The repository is PUBLIC and this session has a git credential proxy for github.com:

    git clone https://github.com/meetparekh9557/clicnk.n.likes.git ~/clicnk.n.likes

Then `cd ~/clicnk.n.likes` and do all work there — every path below is relative to it. Confirm `site/`, `docs/` and `CLAUDE.md` are visible before continuing.
If the clone fails, STOP and report the exact command and error, and say whether it was a network, auth or proxy failure. Do not guess at other URLs.

CHECK — do no work until you know whether it is needed:

1. `git fetch origin main && git checkout -B watchdog origin/main`
2. Read the FIRST entry of the `articles` array in `site/src/data/articles.ts` (newest first) and read its `date`.
3. Compare to today's UTC date.
   - If it IS today: the scheduled run already succeeded. Do NOTHING else. Reply with one line — the post's title and slug, and that no action was needed. Push nothing.
   - If it is NOT today: the run failed or never happened. Continue to RECOVER.

RECOVER — publish today's post yourself, following `docs/BLOG-AUTOMATION.md` and the brand voice, SEO conventions, and internal-linking convention in `/CLAUDE.md`:

0. `cd site && npm ci --no-audit --no-fund`. `site/node_modules` is gitignored, so a fresh clone has source but no toolchain: the image generator reads its fonts from `node_modules/@fontsource/` and `npm run build` fails with `sh: 1: astro: not found`. ~12 seconds. If `npm ci` fails on a stale lockfile, use `npm install --no-audit --no-fund`.
1. Read `docs/blog-backlog.md` in full — it is organized into topic clusters (one hub service page + several spoke Insights posts per under-served service), plus a general queue at the bottom. Pick the FIRST unchecked topic (`- [ ]`) from the top, scanning cluster by cluster then the general queue. SKIP any topic tagged `[NEEDS REAL DATA: ...]` or `[BLOCKED: ...]` unless you can resolve the note yourself with a genuine named third-party source (cite it explicitly) or the note says a client example is optional — never invent the missing figure to unblock it; move to the next unchecked topic instead. Rotate verticals/clusters: if it covers the same ground as the newest existing article, take the next one from a different cluster. CANNIBALIZATION CHECK: skim existing article titles/excerpts for the same core buyer question already answered — a companion angle is fine, re-answering an identical question is not; pick the next topic instead. (Do not attempt the Search Console feed; its absence is not an error.)
2. VALIDATE REAL DEMAND BEFORE WRITING (see "Validate real demand before writing, not after" in `docs/blog-backlog.md` — non-negotiable, not optional polish): WebSearch the topic's core question and 1-2 phrasing variants. Look for real signal ("people also ask", Reddit/Quora threads, competitor posts already answering it) and winnability (current top results thin/generic/low-authority, not exclusively HubSpot/Semrush/Search Engine Land-tier incumbents a young domain can't out-rank). If there's no real signal at all, narrow to a more specific long-tail variant that does show signal before writing. Never invent a volume number either way — this is a directional judgment call from what the search actually returns. Note briefly in your final reply what it found.
3. PREPEND a new object to the `articles` array in `site/src/data/articles.ts`, matching the `Article` interface exactly and mirroring the existing posts: ~1400–1700 words, `readTime: "9 min read"`, `author: "Click.n.likes team"`, `date` = TODAY (YYYY-MM-DD), a buyer-question title, a one-sentence excerpt, exactly 5 faqs.
   CATEGORIES: read the doc comment on the `Article` interface and follow it. Pick from exactly "SEO", "AI Search", "Local SEO", "Content Marketing", "Paid Media", "Websites & Conversion", "Strategy". MOST SPECIFIC ONLY — never stack a parent on a child (a Google Business Profile post is ["Local SEO"], not ["Local SEO","SEO"]). Most posts need one category.
   TITLE RULE: numbers as numerals, never words, because the title becomes the meta title.
   INTERNAL LINKING CONVENTION (non-negotiable — see /AGENTS.md "SEO conventions"): every link this post makes OUT to a service page must use that service page's own TRANSACTIONAL keyword as anchor text (e.g. "local SEO services" for /services/local-seo/, not a vague phrase or the page title verbatim). Every link to a sibling Insights post must use that sibling's own INFORMATIONAL keyword/question phrasing as anchor text, not "click here". Check the backlog's cluster entry for this topic — it names the hub and siblings to link to. Reuse the same anchor phrasing for a given target page everywhere it's linked; never a different phrase per post.
   MONEY-KEYWORD LINKING (every post, non-negotiable): work in, naturally (never as a stuffed list), anchor text for our own core positioning terms, each hyperlinked once to the page that should rank for it: "organic growth agency" or "organic growth services" → `/` (the homepage); "SEO agency" or "SEO services" → `/services/seo/`. Only include the ones that fit the post's actual topic without reading forced. Never add a phrase just to hit this rule if no sentence genuinely calls for it; unnatural keyword-stuffing is worse than skipping one.
   SOURCING RULE: every number traces to a real, named, checkable source, or is written as a principle or range. Never invent a statistic or a client metric.
4. `cd site && node scripts/gen-featured.mjs --slug=<slug> --tag="<Tag>" --title="<line1>|<line2>"`. Confirm `site/public/insights/<slug>.png` exists.
5. Tick the backlog topic to `- [x]` in place inside its cluster section (do not move it out). If fewer than 6 unchecked topics remain across all clusters + the general queue, append 4–6 fresh buyer-question topics in the same format, preferring to fill out an existing cluster's spokes, and run the same demand-validation judgment call on each new one before adding it at face value.
6. `cd site && npm run build` — must complete with no errors. Then `rm -rf site/dist`.
7. `git add site/src/data/articles.ts site/public/insights/<slug>.png docs/blog-backlog.md`, commit as `Auto-blog (watchdog recovery): <title>`. Push with an explicit credential rather than relying on ambient git access, which has not proven reliable for pushes in this environment: if `$GH_TOKEN` is set to a real value (not placeholder text like `<the token you set in Script Properties>` — check for that literal pattern, it has been left unconfigured before), run
       `git -c http.extraheader="AUTHORIZATION: basic $(printf 'x-access-token:%s' "$GH_TOKEN" | base64 -w0)" push origin HEAD:main`
   If `$GH_TOKEN` is unset or looks like placeholder text, fall back to a plain `git push origin HEAD:main` AND explicitly flag in your final reply that it looks unset/invalid — this exact failure mode (all the work done, then a silent death on push) has happened at least twice before. Retry network failures up to 4 times with backoff. Never print the value of `$GH_TOKEN`, never put it in the remote URL, never commit it. Never commit `site/node_modules`, `site/dist`, or any API key or token.

IF ANYTHING FAILS: stop immediately, push nothing, and reply with the step, the exact command and the exact error text. If these instructions contradict what you actually observe in the session, believe the session and say so — that is exactly how the empty-working-directory failure was finally diagnosed, after two wrong theories.

REPLY: a few lines. Either "no action needed" with the existing post's title, or the recovered post's title, slug, categories, cluster/hub, the demand-validation finding from step 2, and live URL (https://clicknlikes.com/insights/<slug>/), or the failure report — flag explicitly if `$GH_TOKEN` looked unset or placeholder.
```
