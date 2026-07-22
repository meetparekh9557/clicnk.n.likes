# Backend keys & setup (Apps Script Script Properties)

The live-data tools call external APIs **server-side** from the Google Apps
Script backend (`apps-script.gs`), so no key is ever committed to this public
repo. Keys live only in the Apps Script project, as **Script Properties**.

## How to add a key

1. Open the Apps Script project (the one behind the `/exec` URL the site uses).
2. **Project Settings** (gear icon) → **Script Properties** → **Add script property**.
3. Enter the property name (left) and your key (right). Save.
4. **Deploy → Manage deployments → Edit → Version: New version → Deploy** so the
   change goes live. (Editing `apps-script.gs` code also requires this redeploy.)

> Any time you paste a new `apps-script.gs` from this repo into the editor, you
> must redeploy for it to take effect. The site pipeline does **not** deploy the
> Apps Script.

## The properties

| Property | Powers | Required? | Where to get it |
|---|---|---|---|
| `PSI_KEY` | Live Speed & Core Web Vitals | Optional (works keyless at low volume; a key raises the quota) | Google Cloud Console → enable **PageSpeed Insights API** → create API key |
| `CF_ACCOUNT_ID`, `CF_BROWSER_TOKEN` | First-impression snapshot **and** JS-page rendering in the health scan | Already in use | Cloudflare dashboard → Browser Rendering |
| `AI_KEY` | "Does AI name your business?" | Required for that tool | **Free: Google Gemini** — get a key at [aistudio.google.com](https://aistudio.google.com) (free tier). Default `AI_PROVIDER` is now `gemini` (`AI_MODEL` defaults to `gemini-2.0-flash`). Also supports `openai` / `anthropic` (paid) if you prefer |
| `PLACES_KEY` | Your Google reputation (rating + reviews) | Required for that tool | Google Cloud Console → enable **Places API** → API key. **Effectively free within Google's $200/month credit** (~6,000 lookups), but a billing account/card must be on file |
| `SERP_KEY` | Where do you actually rank? | Required for that tool | **serper.dev** — 2,500 free searches on signup, then paid (set `SERP_PROVIDER` = `serper`). Or SerpApi (100 free/month). No sustainable card-free option |

### Free vs paid, at a glance

- **Free, no card:** Speed (PageSpeed), Snapshot (your existing Cloudflare keys), and **AI visibility via Gemini** (Google AI Studio free tier).
- **Free within a credit, card required:** Reputation (Google Places, $200/month credit covers normal volume).
- **Free at low volume, then paid:** Rank (serper.dev's 2,500 free searches, or SerpApi 100/month). Scraping Google directly is against its terms and gets blocked — not a real option.

## Honest-degradation behaviour

Every tool is live-safe: if its key isn't set, the backend returns
`not_configured` and the tool shows a calm "this verified check is being
switched on" message pointing to the Website Health scan — never a broken
error and never a fabricated result. So the tools can ship before the keys are
added; each one lights up the moment its key is present and the script is
redeployed.

## Suggested go-live order

1. **PageSpeed** — add `PSI_KEY`, paste the latest `apps-script.gs`, redeploy.
   Works immediately, no billing.
2. **Snapshot** — already works (reuses the existing Cloudflare keys).
3. **AI visibility** — add `AI_KEY` (+ `AI_PROVIDER`) when ready.
4. **Reputation** — add `PLACES_KEY` once Places API billing is enabled.
5. **Rank** — pick/fund a SERP provider, add `SERP_KEY`.
