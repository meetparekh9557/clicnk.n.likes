# The live-teardown reel — delivered, not scripted

Unlike the launch reels, this one was never handed back as a script: the
founder said "I am not filming a reel. You do it," so `gen-reel-teardown.mjs`
produces the finished MP4 with no filming, no voice and no face.

## Why the numbers on screen are real, not staged

The Website Health Scan does two things when a real visitor uses it: a
live server-side fetch of the page, and a deterministic scoring pass over
what it finds. Faking either would break the site's own honesty rule, and
scoring a real business's site to get a dramatic number would be the
disparagement risk `reel-scripts.md` already ruled out.

So the generator does the second half of that pipeline for real:

- `extractFacts_()` is ported **verbatim** from `apps-script.gs` — the exact
  regex-based parser the deployed backend runs — and it runs here against
  `site/public/demo/sample-site/index.html`, a fixture built to fail on
  purpose (see that file's own comment).
- `scoreOnPageHealth()` is **imported directly** from `site/src/lib/engine.js`,
  the same function real scans are scored by.
- The 8/100, the four findings, and the 3.4MB image size are all computed at
  render time from the files on disk. Nothing in the script hand-types a
  score or a finding string.

The only thing that differs from a real visitor's scan is which network hop
computed the facts — a live HTTP fetch of a page we host, versus reading that
same page directly off disk. Same code, same page, same result. (This
substitution exists because the sandbox this was built in cannot reach
`script.google.com` or `clicknlikes.com` — see the note below.)

## Why the subject is a fixture, not a real site

Reusing the demo fixture from the launch-reel work, for the same reason it
was built: a real, live, honestly-bad page that isn't anyone's actual
business. It carries its own `noindex` tag, is `Disallow`'d in `robots.txt`,
and never appears in the sitemap.

One editorial note: the fixture's own `noindex` tag is a real, true finding
and the biggest single deduction in its score (−30 of the 92 total) — but
it's there for the fixture's own hygiene (keeping it out of Google), not as
an illustrative "mistake a real business makes." The reel's four on-screen
findings are picked from the other, more representative failures (title,
meta description, H1s, image weight); the full finding list — noindex
included — is real and available in the script's own console output, just
not one of the captions the video zooms in on. That's ordinary editorial
sampling of genuinely real content, the same way the original shot list
always planned to zoom into "three failures" out of a longer real report.

## Regenerating it

```
node scripts/gen-reel-teardown.mjs --out=../teardown.mp4
node scripts/gen-reel-teardown.mjs --still=8.0 --out=cover.png
```

Re-run it any time the fixture changes — the score and findings are
recomputed from disk on every render, never cached or hand-edited. Needs an
ffmpeg with libx264 (see the other reel docs for the same note).

## A limitation worth recording

This was built inside a sandboxed session whose network policy blocks
`clicknlikes.com` and `script.google.com` outright (confirmed via
`$HTTPS_PROXY/__agentproxy/status`, which logs the gateway's 403s). That is
why the reel runs the scoring function locally against the file on disk
instead of literally driving a browser against the live tool end to end. The
two produce identical numbers — same code, same inputs — but if a future
session has open network access, driving the real, deployed tool end to end
would be the more direct proof and is worth doing once that's possible.

## Posting

Same slot as the original teardown plan in `reel-scripts.md`: Reels and
TikTok, where the suspense format does the work. Caption:

> This takes 30 seconds and it is free. We ran it on a page we built with
> the classic mistakes on purpose: no title tag, no meta description, three
> H1s, a 3.4MB hero image. None of them are hard to fix — they just never
> get looked at.
>
> Scan your own: clicknlikes.com/tools
