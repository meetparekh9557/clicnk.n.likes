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
| `AI_KEY` | "Does AI name your business?" | Required for that tool | Anthropic or OpenAI console. Set `AI_PROVIDER` = `anthropic` (default) or `openai`, and optionally `AI_MODEL` |
| `PLACES_KEY` | Your Google reputation (rating + reviews) | Required for that tool | Google Cloud Console → enable **Places API** → create API key (billing must be enabled) |
| `SERP_KEY` | Where do you actually rank? | Required for that tool | A SERP provider, default **serper.dev** (set `SERP_PROVIDER` = `serper`). Paid usage |

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
