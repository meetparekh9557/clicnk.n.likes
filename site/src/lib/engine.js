/* ============================================================
   SHARED SITE ENGINE - ported verbatim from v1 (index.html).
   Single source of truth for the Apps Script backend client, the
   report-email builder and the deterministic scoring math. Used by
   the hero scan island and every migrated free tool. Scoring must
   stay deterministic and honestly labelled: 'verified' only ever
   means "measured from a live fetch in THIS session".
   ============================================================ */

export const FROM_EMAIL = 'business@clicknlikes.com';
export const OWNER_EMAIL = 'clicknlikes@gmail.com';
export const BUSINESS_NAME = 'Click.n.likes';

/* One Google Apps Script: logs leads to the Sheet, sends branded email
   from the business@clicknlikes.com alias, and serves the single-page
   analyzer (?action=analyze&url=). Source: apps-script.gs at repo root.
   Redeploy via Manage deployments → New version to KEEP this URL. */
export const SHEET_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbxQdW9Wx0Vn2YOpMMWGsrkaKwq9FTYYCM0tmRwEHC1IrCe1h1ba7usmPhFBYl0-7vW_/exec';

export const autoEmailReady = !!SHEET_WEBHOOK_URL && SHEET_WEBHOOK_URL.indexOf('YOUR_') !== 0;

/* Minimum time the scan animation stays visible: just enough for the
   spinner to feel like real, purposeful work rather than an instant
   flash. A real live fetch that takes longer simply runs past it. */
export const TOOL_SCAN_MIN_MS = 900;

/* Fire-and-forget POST to the Apps Script. Never throws, never blocks
   the visitor's submission; no-cors keeps the browser from needing a
   CORS handshake Apps Script doesn't offer. */
export function postToScript(payload) {
  if (!autoEmailReady) return;
  try {
    fetch(SHEET_WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    /* logging/sending must never break a form */
  }
}

/* Appends one row to the lead sheet. */
export function logLeadToSheet(subject, details) {
  postToScript({ subject: subject, details: details });
}

/* Asks the Apps Script to fetch ONE page server-side and hands back
   verifiable on-page facts. Never throws: resolves to
   {available:false, reason} on any failure so every caller can fall
   back to self-reported scoring. */
export async function fetchPageFacts(rawUrl) {
  let target = (rawUrl || '').trim();
  if (!target) return { available: false, reason: 'no_url' };
  if (!autoEmailReady) return { available: false, reason: 'no_backend' };
  try {
    const res = await fetch(SHEET_WEBHOOK_URL + '?action=analyze&url=' + encodeURIComponent(target));
    if (!res.ok) return { available: false, reason: 'http_' + res.status };
    const data = await res.json();
    if (!data || !data.ok || !data.facts) return { available: false, reason: (data && data.reason) || 'fetch_failed' };
    return Object.assign({ available: true }, data.facts);
  } catch (e) {
    return { available: false, reason: 'network_error' };
  }
}

/* Escapes user-typed text before it's interpolated into HTML strings. */
export function escapeHtml(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[c]);
}

/* Turns a tool result into the full emailed deliverable. Inline styles
   only: email clients ignore stylesheets. The Apps Script wraps this in
   the brand shell, so this builds only the inner body. */
export function buildReportEmailHtml(o) {
  const esc = escapeHtml;
  const H = "font-family:'Space Grotesk',Arial,sans-serif;color:#1A2B4A;";
  const chip = (src) =>
    src === 'verified'
      ? '<span style="background:#E5F8F5;color:#1F7A74;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;white-space:nowrap;">Verified live</span>'
      : '<span style="background:#F0F0F0;color:#777;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;white-space:nowrap;">Self-reported</span>';
  const rows = (o.factors || [])
    .map(
      (f) => `<tr>
      <td style="padding:9px 10px;border-bottom:1px solid #eee;font-size:13px;color:#1A2B4A;vertical-align:top;"><b>${esc(f.name)}</b></td>
      <td style="padding:9px 10px;border-bottom:1px solid #eee;font-size:13px;color:#444;vertical-align:top;">${esc(f.found)}</td>
      <td style="padding:9px 10px;border-bottom:1px solid #eee;vertical-align:top;">${chip(f.source)}</td>
      <td style="padding:9px 10px;border-bottom:1px solid #eee;font-size:13px;font-weight:700;vertical-align:top;white-space:nowrap;color:${/^[−-]/.test(f.impact) ? '#FF4757' : '#1F7A74'};">${esc(f.impact)}</td>
    </tr>`
    )
    .join('');
  const steps = (o.nextSteps || []).map((s) => `<li style="margin:0 0 10px;padding-left:4px;">${esc(s)}</li>`).join('');
  return `
    <h2 style="${H}font-size:20px;margin:6px 0 2px;">${esc(o.toolLabel)}: your full report</h2>
    ${o.forLine ? `<p style="margin:2px 0 14px;font-size:13px;color:#777;">${esc(o.forLine)}</p>` : ''}
    <div style="background:#F7F7F7;border:1px solid #e8e8e8;border-radius:12px;padding:16px 18px;margin:10px 0 18px;">
      <div style="${H}font-size:34px;font-weight:700;">${esc(String(o.scoreDisplay))}</div>
      <div style="font-size:12px;color:#777;text-transform:uppercase;letter-spacing:.06em;margin-top:2px;">${esc(o.indexLabel || 'Score')}</div>
      <p style="margin:10px 0 0;font-size:14px;color:#1A2B4A;">${esc(o.interpretation || '')}</p>
    </div>
    ${
      o.liveNote
        ? `<p style="margin:0 0 14px;font-size:13px;color:#1F7A74;"><b>✓ ${esc(o.liveNote)}</b></p>`
        : `<p style="margin:0 0 14px;font-size:13px;color:#777;">This report is built from your self-reported answers: no live page check ran this time. Everything below is labelled accordingly.</p>`
    }
    <h3 style="${H}font-size:15px;margin:18px 0 8px;">Everything we checked</h3>
    <table style="border-collapse:collapse;width:100%;background:#fff;border:1px solid #eee;border-radius:8px;">
      <tr>
        <th style="text-align:left;padding:8px 10px;font-size:11px;color:#777;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid #4ECDC4;">Factor</th>
        <th style="text-align:left;padding:8px 10px;font-size:11px;color:#777;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid #4ECDC4;">What we found</th>
        <th style="text-align:left;padding:8px 10px;font-size:11px;color:#777;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid #4ECDC4;">Source</th>
        <th style="text-align:left;padding:8px 10px;font-size:11px;color:#777;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid #4ECDC4;">Impact</th>
      </tr>
      ${rows}
    </table>
    ${
      (o.factors || []).some((f) => f.source === 'verified')
        ? `<p style="margin:10px 0 0;font-size:12px;color:#777;">"Verified live" = measured directly from the page/data you gave us during this check. "Self-reported" = based on your own answer, which we can't independently confirm.</p>`
        : `<p style="margin:10px 0 0;font-size:12px;color:#777;">Every row above is based on your own answers: nothing in this report was measured from a live page, and we won't label anything as verified unless it genuinely was.</p>`
    }
    ${
      steps
        ? `<h3 style="${H}font-size:15px;margin:22px 0 8px;">Your next steps, in order</h3>
    <ol style="margin:0;padding-left:20px;font-size:14px;color:#1A2B4A;">${steps}</ol>`
        : `<h3 style="${H}font-size:15px;margin:22px 0 8px;">Where to focus next</h3>
    <p style="margin:0;font-size:14px;color:#1A2B4A;line-height:1.6;">No urgent on-page fixes were flagged in this check: your fundamentals are genuinely solid. The next real gains are in content depth, authority and conversion, which is exactly what a strategy call would map out for your specific market.</p>`
    }
    <div style="margin:26px 0 6px;">
      <a href="https://clicknlikes.com" style="background:#1A2B4A;color:#ffffff !important;text-decoration:none;padding:14px 26px;border-radius:100px;font-weight:700;font-size:14px;display:inline-block;">Get an instant quote &rarr;</a>
      <p style="margin:12px 0 0;font-size:13px;color:#777;">Or simply reply to this email: a strategist (not a bot) reads every reply, usually within one business day.</p>
    </div>`;
}

/* Every submission produces exactly one owner-notification email, so
   hooking the sheet log here logs each lead once, with full details,
   independently of whether the emails themselves succeed. Returns a
   mailto fallback link. */
export function sendFromClicknlikes({ toEmail, toName, subject, bodyText, bodyHtml, replyTo }) {
  if (toEmail === OWNER_EMAIL) logLeadToSheet(subject, bodyText);
  postToScript({
    action: 'send',
    to: toEmail,
    toName: toName || '',
    subject: subject,
    body: bodyText,
    html: bodyHtml || '',
    replyTo: replyTo || FROM_EMAIL,
    bcc: toEmail === OWNER_EMAIL ? '' : OWNER_EMAIL,
  });
  return `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
}

export function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/* One row of the emailed factor table. source: 'verified' (measured
   directly from the visitor's live page in THIS session) or 'self'
   (their own answer). Never mark 'verified' unless the value genuinely
   came from a live fetch. */
export function fact(name, found, source, impact) {
  return { name, found, source, impact };
}

/* Deterministic on-page health scoring over verified analyzer facts.
   Copied verbatim from v1: same inputs always produce the same result. */
export function scoreOnPageHealth(page) {
  let score = 100;
  const gaps = [];
  const factors = [];
  const nextSteps = [];
  const ded = (pts, gapText) => {
    score -= pts;
    if (gapText) gaps.push(gapText);
    return `−${pts} pts`;
  };

  if (page.noindex) {
    factors.push(fact('Indexability (robots)', 'noindex tag found: this page tells Google NOT to list it', 'verified', ded(30, 'CRITICAL: noindex tag blocks Google entirely')));
    nextSteps.push('URGENT: remove the noindex robots tag: right now this page is explicitly asking Google not to show it at all.');
  } else factors.push(fact('Indexability (robots)', 'Page is indexable', 'verified', 'no deduction'));

  if (!page.hasViewport) {
    factors.push(fact('Mobile viewport tag', 'Missing: Google treats this as a mobile-friendliness fail', 'verified', ded(10, 'No mobile viewport meta tag')));
    nextSteps.push('Add a mobile viewport meta tag: one line of HTML that stops Google treating your site as not mobile-friendly.');
  } else factors.push(fact('Mobile viewport tag', 'Present', 'verified', 'no deduction'));

  const tl = page.titleLength || 0;
  if (tl === 0) {
    factors.push(fact('Title tag', 'Missing entirely', 'verified', ded(10, 'Missing <title> tag')));
    nextSteps.push('Write a title tag (~50-60 characters with your main keyword): it is literally the headline of your Google listing.');
  } else if (tl < 15 || tl > 65) {
    factors.push(fact('Title tag', `"${(page.title || '').slice(0, 60)}" (${tl} chars, outside the 15-65 sweet spot)`, 'verified', ded(5, `Title tag ${tl < 15 ? 'too short' : 'too long'} (${tl} chars)`)));
  } else factors.push(fact('Title tag', `"${(page.title || '').slice(0, 60)}" (${tl} chars)`, 'verified', 'no deduction'));

  const mdMissing = page.metaDescription === null || page.metaDescriptionLength === 0;
  if (mdMissing) {
    factors.push(fact('Meta description', 'Missing: Google is improvising your search snippet', 'verified', ded(8, 'Missing meta description')));
    nextSteps.push('Write a meta description (~150 characters, include a reason to click): yours is missing, so Google writes your snippet for you.');
  } else if (page.metaDescriptionLength > 160) {
    factors.push(fact('Meta description', `${page.metaDescriptionLength} chars: gets cut off in results (~160 max)`, 'verified', ded(4, `Meta description too long (${page.metaDescriptionLength} chars)`)));
  } else factors.push(fact('Meta description', `Present (${page.metaDescriptionLength} chars)`, 'verified', 'no deduction'));

  if (page.h1Count === 0) {
    factors.push(fact('H1 heading', 'No H1 found', 'verified', ded(8, 'No H1 heading')));
    nextSteps.push('Add exactly one H1 heading containing your primary keyword: your page currently has none.');
  } else if (page.h1Count > 1) {
    factors.push(fact('H1 heading', `${page.h1Count} H1s (should be exactly one)`, 'verified', ded(4, `${page.h1Count} H1 headings instead of one`)));
  } else factors.push(fact('H1 heading', `Exactly one: "${(page.h1Text || '').slice(0, 50)}"`, 'verified', 'no deduction'));

  if (page.headingSkips > 0) {
    factors.push(fact('Heading hierarchy', `Skips levels ${page.headingSkips} time(s) (e.g. H1 straight to H3)`, 'verified', ded(4, 'Heading hierarchy skips levels')));
  } else factors.push(fact('Heading hierarchy', 'Clean H1→H2→H3 order', 'verified', 'no deduction'));

  if (page.imgCount > 0 && page.imgMissingAlt > 0) {
    const altPts = Math.min(10, Math.max(2, Math.round((page.imgMissingAlt / page.imgCount) * 10)));
    factors.push(fact('Image alt coverage', `${page.imgMissingAlt} of ${page.imgCount} images missing alt text`, 'verified', ded(altPts, `${page.imgMissingAlt}/${page.imgCount} images missing alt text`)));
    nextSteps.push(`Add alt text to the ${page.imgMissingAlt} images missing it: accessibility, image SEO and Core Web Vitals points in one pass.`);
  } else factors.push(fact('Image alt coverage', page.imgCount === 0 ? 'No images on the page' : 'All images have alt text', 'verified', 'no deduction'));

  if (!page.hasSchema) {
    factors.push(fact('Structured data (schema.org)', 'None found', 'verified', ded(6, 'No schema.org structured data')));
    nextSteps.push('Add JSON-LD structured data (Organization/LocalBusiness at minimum): it feeds Google rich results and AI answers, and costs nothing.');
  } else factors.push(fact('Structured data (schema.org)', `Present: ${(page.schemaTypes || []).slice(0, 4).join(', ')}`, 'verified', 'no deduction'));

  if (!page.hasCanonical) {
    factors.push(fact('Canonical tag', 'Missing: duplicate-URL risk', 'verified', ded(3, 'No canonical tag')));
  } else factors.push(fact('Canonical tag', 'Present', 'verified', 'no deduction'));

  const wc = page.wordCount || 0;
  if (wc < 300) {
    factors.push(fact('Content depth', `${wc.toLocaleString('en-IN')} words of visible text: very thin`, 'verified', ded(8, `Very thin content (${wc} words)`)));
    nextSteps.push("Deepen this page's content: under 300 words rarely answers anyone's search fully, and Google notices.");
  } else if (wc < 600) {
    factors.push(fact('Content depth', `${wc.toLocaleString('en-IN')} words of visible text: on the thin side`, 'verified', ded(4, `Thin content (${wc} words)`)));
  } else factors.push(fact('Content depth', `${wc.toLocaleString('en-IN')} words of visible text`, 'verified', 'no deduction'));

  factors.push(fact('Link structure', `${page.internalLinks} internal / ${page.externalLinks} external links`, 'verified', page.internalLinks < 5 ? ded(3, `Only ${page.internalLinks} internal links`) : 'no deduction'));

  score = Math.max(5, Math.min(100, score));
  return { score, gaps, factors, nextSteps };
}
