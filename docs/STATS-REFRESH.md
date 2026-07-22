# Auto-refreshing the marketing stats (`/why-organic/`)

The per-channel figures on `/why-organic/` live in
`site/src/data/verticalStats.ts` and are refreshed **automatically on a
schedule** by an agent task — no human input required — while keeping the
site's core rule: every published number must trace to a real, named,
checkable source. Nothing is ever invented.

## How it works

A monthly scheduled task (a Claude Code Remote Routine) fires into a fresh
session in this environment and:

1. Opens `site/src/data/verticalStats.ts` (7 verticals × 3 cited stats each).
2. Web-searches each claim for the most current figure from a reputable
   source (Google/Think with Google, BrightEdge, Backlinko, HubSpot,
   DataReportal/GWI, SparkToro, Gartner, Content Marketing Institute,
   WordStream, official company reports, etc.).
3. Updates a value **only** when a clearly more current, reputable figure is
   found; otherwise it leaves the existing sourced stat untouched. It never
   swaps in an unverified number.
4. Bumps `statsLastUpdated` (YYYY-MM), builds the site to confirm no errors,
   commits, and pushes to `main` so the deploy workflow republishes.

## Guardrails (why it's safe to run live)

- **Sourced or nothing:** a stat is only changed if a named, checkable source
  backs the new number. Unverifiable → keep the current one.
- **Scope-locked:** the task edits only `verticalStats.ts` (plus a build fix
  if strictly needed). It never touches copy, layout, tools or pricing.
- **Structure-locked:** exactly 3 stats per vertical, same shape.

## Managing it

- **Pause / stop:** disable or delete the Routine (it's owned by this
  account). Ask Claude to "pause the stats refresh" or manage it from the
  Routines list.
- **Change cadence or sources:** edit the Routine's prompt/schedule.
- **Manual refresh:** trigger the Routine on demand, or just edit
  `verticalStats.ts` by hand and push — the format is plain and self-evident.
