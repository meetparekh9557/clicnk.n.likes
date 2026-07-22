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
| `AI_KEY` | "Does AI name your business?" | Required for that tool | **Free: Google Gemini** — get a key at [aistudio.google.com](https://aistudio.google.com) (free tier). Default `AI_PROVIDER` is `gemini` (`AI_MODEL` defaults to `gemini-2.0-flash`). Also supports `openai` / `anthropic` (paid) if you prefer |

The paid-only Reputation (Google Places) and Rank (SERP) tools were removed:
they can't return real data without a billing card / paid provider, so they
were dropped rather than shipped as dead "coming soon" cards. The backend can
grow them back later if that changes.

### Free vs paid, at a glance

Every live tool is now **free**: Speed (PageSpeed), Snapshot (your existing
Cloudflare keys), and **AI visibility via Gemini** (Google AI Studio free tier).
No card required for any of them.

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
3. **AI visibility** — add `AI_KEY` (a free Google AI Studio / Gemini key).
   `AI_PROVIDER` defaults to `gemini`, so the key alone is enough. Re-paste
   `apps-script.gs` and redeploy.
