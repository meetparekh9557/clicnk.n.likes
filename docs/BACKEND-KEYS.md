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

Three tools that needed a paid/gated API were removed rather than shipped as
dead "coming soon" cards: Reputation (Google Places — needs a billing card),
Rank (SERP — no free, unlimited API exists), and AI visibility (Gemini's free
tier turned out not to be available for this Google account, and we chose not
to put a card on file). The backend can grow any of them back if that changes.

### Free vs paid, at a glance

Both live real-data tools are **free, no card**: Speed (Google PageSpeed) and
Snapshot (your existing Cloudflare keys).

## Honest-degradation behaviour

Every tool is live-safe: if its key isn't set, the backend returns
`not_configured` and the tool shows a calm "this verified check is being
switched on" message pointing to the Website Health scan — never a broken
error and never a fabricated result. So the tools can ship before the keys are
added; each one lights up the moment its key is present and the script is
redeployed.

## Live tools

1. **PageSpeed** — add `PSI_KEY` (optional; works keyless too), paste the
   latest `apps-script.gs`, redeploy. No billing.
2. **Snapshot** — works via the existing Cloudflare keys.
