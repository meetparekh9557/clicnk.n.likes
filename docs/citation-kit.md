# Citation & Directory Submission Kit

Internal-linking audit + citation kit (task #11). This is the "generate the
kit; a human submits" half of the off-site authority plan in
`RANKING-AUTOMATION.md` — consistent NAP (Name/Address/Phone) copy-paste
material for the directories that feed local search, AI answers, and agency
discovery. Submitting each listing still needs a human (most require account
verification, a phone call, or a postcard) — this file exists so every
submission uses identical wording instead of drifting listing to listing,
which is what actually damages local SEO.

**Keep every field below in sync with `site/src/data/site.ts` (`contact`)
— that file is the single source of truth for NAP data on the site itself.
If you change the phone number, email, or address anywhere, update both.**

## Gap to close before submitting anywhere

**There is no public street address anywhere in the codebase or on the live
site** (`contact.location` is `"Ahmedabad, India · Serving worldwide"` — a
region, not an address). Nothing below invents one. Two real options:

1. **Service-Area Business on Google Business Profile.** GBP supports hiding
   the exact address and instead listing the cities/regions served — the
   correct setup for a remote agency with clients across cities, not a
   storefront. Needs a real address on file with Google (never shown
   publicly) plus phone verification.
2. **Give me a real address** (home office, coworking space, or a
   registered-office address) and I'll fold it into this file and the site's
   `Organization` JSON-LD (`site/src/lib/seo.ts`) the same day.

Until one of those happens, skip any directory that hard-requires a public
street address (most local-pack directories do); the ones below that don't
require one are safe to submit today.

## Core NAP block (copy-paste as-is, every directory)

| Field | Value |
|---|---|
| Business name | Click.n.likes |
| Category (primary) | Digital Marketing Agency / SEO Agency |
| Categories (secondary) | Internet Marketing Service, Social Media Marketing Service, Website Designer, Advertising Agency |
| Phone (WhatsApp) | +91 84691 63322 |
| Email | business@clicknlikes.com |
| Website | https://clicknlikes.com |
| Service area | Ahmedabad & Mumbai, India · serving clients worldwide |
| Founder experience | Nine years building organic growth systems (founder's personal track record, per `about.astro` — **not** the company's incorporation date, which isn't recorded anywhere in the repo; leave any directory's "founded"/"in business since" field blank rather than guessing) |
| LinkedIn | https://www.linkedin.com/company/click-n-likes/ |
| Instagram | https://www.instagram.com/click.n.likes/ |
| Hours | Not yet standardized — confirm before submitting anywhere that requires posted hours (GBP, Bing Places) |

## Business descriptions (three lengths, so every field limit is covered)

**Short (≤ 100 characters — GBP short description, directory taglines)**
> Full-stack organic growth agency: SEO, AI search, content, social & websites.

**Medium (≤ 160 characters — meta-description length, most directory summary fields)**
> Click.n.likes is a full-stack organic growth agency serving Ahmedabad, Mumbai and clients worldwide — SEO, AI search, local SEO, content, social and website builds.

**Long (≤ 750 characters — Clutch, GoodFirms, and other full-profile directories)**
> Click.n.likes is a full-stack organic growth agency built for where search is heading, run on the founder's nine years building organic growth systems. We run SEO, Local SEO, AI Search/AI Overviews optimization, content marketing, social media growth, website development and paid campaigns as one connected system rather than seven disconnected vendors. Every engagement is judged on the numbers we can stand behind — leads, calls, cost per lead and organic traffic — never vanity metrics. Pricing is published on the site rather than gated behind a sales call, and every plan comes with free, honest tools (a live website health scan, speed test, schema generator and more) that run before anyone talks to us. Based in Ahmedabad, serving clients across India and worldwide.

## Target directories

Ordered by what `RANKING-AUTOMATION.md` names explicitly, plus the obvious
agency-discovery complements. None of these are fabricated — these are real,
well-known platforms; whether each is worth the submission effort is your
call.

| Directory | Type | Needs address? | Notes |
|---|---|---|---|
| [Google Business Profile](https://business.google.com/) | Local + Maps | Set up as Service-Area Business (see gap above) | Highest priority — feeds Maps, local pack, and Google's AI Overviews directly |
| [Bing Places](https://www.bingplaces.com/) | Local | Same SAB approach as GBP | Feeds Bing/Copilot answers |
| [Clutch](https://clutch.co/) | Agency directory | No (company profile, not local listing) | B2B-buyer-facing; verified client reviews carry real weight here |
| [GoodFirms](https://www.goodfirms.co/) | Agency directory | No | Same category as Clutch, different audience |
| [DesignRush](https://www.designrush.com/) | Agency directory | No | Common complement to Clutch/GoodFirms for marketing agencies |
| [Sortlist](https://www.sortlist.com/) | Agency directory | No | International agency-matching platform |
| LinkedIn Company Page | Social/professional | No | Already live — confirm the About section matches the medium description above |

## Submission notes

- Use the **exact same** business name capitalization ("Click.n.likes") and
  phone format everywhere — NAP *inconsistency* across listings is the
  specific thing that suppresses local ranking, not any single wrong field.
- For agency directories (Clutch, GoodFirms, DesignRush, Sortlist), the
  real-client review is what matters most for ranking within the directory —
  worth asking the aidbylaw contact (or any client comfortable with it) for a
  short review once one listing is live, rather than treating the submission
  itself as the finish line.
- This file is a living reference — update it the same day the address gap
  closes or contact details change, so it never drifts from `data/site.ts`.
