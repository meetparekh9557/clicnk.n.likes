# Ranking & lead automation

How Click.n.likes ranks and generates leads on autopilot — what actually
runs itself, what needs one setup click, and the honest line we do not
cross (nothing that risks a Google penalty on our own domain).

## The machine (six inputs)

| Input | Status | Automated by |
| --- | --- | --- |
| Content targeting real buyer questions | ✅ live | Tue/Fri auto-blog (`docs/BLOG-AUTOMATION.md`) |
| Technical + on-page SEO (schema, sitemap, meta, speed) | ✅ live | build pipeline; new pages inherit it |
| Freshness | ✅ live | auto-blog + monthly stats refresh (`docs/STATS-REFRESH.md`) |
| Lead capture | ✅ live | every tool gates on email → Apps Script logs to Sheet + sends branded email |
| Data-driven topic selection (Search Console loop) | 🔧 needs 1 setup | Apps Script `searchconsole` endpoint → auto-blog |
| Off-site authority (links, reviews) | ⚠️ partly — see below | link-worthy assets automated; the links themselves are earned, never faked |

## The Search Console feedback loop

Instead of guessing topics, the blog aims at the queries the site **already
ranks #5–#20 for** — the "so close to page one" terms where one good post
converts impressions into clicks. The Apps Script backend reads this directly
(it runs as the Google account that owns the property, so no key file, nothing
secret in the public repo), and the auto-blog writes to the biggest
opportunity first, falling back to the topic backlog when there's no data yet.

### One-time setup (the only part a human must do)

1. **Verify `clicknlikes.com` in Google Search Console**, signed in as the
   **same Google account that owns the Apps Script** (clicknlikes@gmail.com).
   Prefer a **Domain property** (`sc-domain:clicknlikes.com`) — add the one
   TXT record it gives you at your domain registrar. This is "the access."
   *(Data takes days-to-weeks to accumulate; until then the blog uses the
   backlog automatically — nothing breaks.)*
2. In the Apps Script editor: **Project Settings → tick "Show appsscript.json
   manifest"**, open it, and add to `oauthScopes`:
   `"https://www.googleapis.com/auth/webmasters.readonly"`
3. **Set two Script Properties** (Project Settings → Script Properties):
   - `SC_SITE` = `sc-domain:clicknlikes.com` (or your URL-prefix property)
   - `SC_TOKEN` = any long random string (the caller must match it)
4. Run **`testSearchConsole`** once from the editor and approve the new
   permission. It logs the top opportunities as proof.
5. Redeploy the web app (**Manage deployments → edit → New version**).
6. Give the automation the token without committing it: set `SC_TOKEN` (and
   `APPS_SCRIPT_URL`) as **environment variables in the Claude Code
   environment** the weekly Routine runs in. The Routine reads them from
   `process.env`; if absent, it silently uses the backlog.

## Off-site authority — what we automate and what we refuse

Links and reviews are the biggest ranking forces **and** the ones no honest
system can fabricate. The only way to "automate" a real site linking to you is
to buy or spam links — which is exactly what triggers Google spam actions and
de-ranks a domain. We do not do that to our own site. What we automate is the
machine that *earns* authority:

- **Automated internal linking (safe, live-ready):** every new post is linked
  from related posts and to the service page it supports, so authority flows
  to the pages that sell. Fully automatable, zero risk.
- **Link-worthy assets (automated creation):** the live tools, the stats hub,
  and original data are things journalists and bloggers cite *naturally*. We
  automate producing more of them (e.g. an original data report); the links
  arrive because the asset is genuinely worth citing.
- **Legitimate citations / directories (semi-automated):** consistent NAP
  listings on real industry and local directories (Google Business Profile,
  Bing Places, Clutch, GoodFirms, industry bodies). Safe, and it feeds local
  + AI answers. We generate the submission kit; a human submits.
- **Unlinked-mention reclamation + outreach drafts (semi-automated):** find
  places that mention the brand without linking, and draft the ask. A human
  sends it — because a real editorial link comes from a real relationship.

**We will not build:** PBNs, paid links, comment/forum spam, link exchanges at
scale, or article-spinning link farms. Each violates Google's spam policies and
risks a manual action. Honest authority compounds; faked authority gets caught.

## Managing it

- Pause the blog / stats refresh: disable the relevant Routine.
- Change the ranking window or thresholds: edit `searchConsole_` in
  `apps-script.gs` (position band 4.5–20.5, min 20 impressions).
- Turn the loop off: clear `SC_TOKEN` — the endpoint returns `not_configured`
  and the blog reverts to the backlog.
