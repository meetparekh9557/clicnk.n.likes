// Schema Workbench: merges what used to be two separate tools (Schema
// Generator, Schema Validator & Score) into one flow, because every
// competitor in this category (TechnicalSEO.com, RankRanger, Nuxt SEO,
// validator.schema.org, Google's own Rich Results Test) splits "check what
// you have" and "build what you need" into two disconnected tools that make
// you re-enter your business details from scratch. Here: paste a URL, see a
// real completeness score with the plain-English cost of every gap (free,
// on screen, no email), answer your business info once, generate exactly
// what's missing pre-filled from what's already on the page. Email only
// gates the ready-to-paste code + implementation guide, not the diagnosis.
import { useState } from 'react';
import { TOOL_SCAN_MIN_MS, OWNER_EMAIL, sendFromClicknlikes, escapeHtml, fetchPageFacts } from '../../lib/engine';
import {
  SCHEMA_TYPES, GENERATABLE_TYPES, buildJsonLd, scoreSchemaObjects,
  parseJsonLdBlocks, bizFromSchema, propCost, TYPE_MISSING_COST,
} from '../../lib/schemaRules';

const fieldCls = 'w-full rounded-[10px] border-[1.5px] border-navy/10 bg-white px-4 py-3 text-sm text-navy outline-none focus:border-teal';
const labelCls = 'mb-1.5 block text-[12.5px] font-semibold text-navy';
const TYPE_LABEL = Object.fromEntries(SCHEMA_TYPES.map((t) => [t.type, t.label]));

// Fields genuinely specific to each type, beyond the shared business-info
// panel below (name, url, phone, logo, address, sameAs). `advanced` fields
// start collapsed; `required` fields block that type's generation until
// filled.
const TYPE_FIELDS = {
  Organization: [
    { id: 'description', label: 'Short description', kind: 'textarea' },
  ],
  LocalBusiness: [
    { id: 'image', label: 'Photo URL' },
    { id: 'description', label: 'Short description', kind: 'textarea', advanced: true },
    { id: 'priceRange', label: 'Price range', placeholder: '₹₹', advanced: true },
    { id: 'hours', label: 'Opening hours (comma-separated)', placeholder: 'Mon-Fri 10:00-19:00, Sat 10:00-14:00', advanced: true },
  ],
  Article: [
    { id: 'headline', label: 'Headline', required: true },
    { id: 'image', label: 'Featured image URL', required: true },
    { id: 'datePublished', label: 'Date published', kind: 'date', required: true },
    { id: 'authorName', label: 'Author name', required: true },
    { id: 'dateModified', label: 'Date modified', kind: 'date', advanced: true },
    { id: 'description', label: 'Short description', kind: 'textarea', advanced: true },
  ],
  Product: [
    { id: 'name', label: 'Product name', required: true },
    { id: 'image', label: 'Product image URL' },
    { id: 'price', label: 'Price' },
    { id: 'availability', label: 'Availability', kind: 'select', options: ['InStock', 'OutOfStock', 'PreOrder'] },
    { id: 'description', label: 'Short description', kind: 'textarea', advanced: true },
    { id: 'sku', label: 'SKU', advanced: true },
    { id: 'priceCurrency', label: 'Currency code', placeholder: 'INR', advanced: true },
    { id: 'ratingValue', label: 'Average rating', placeholder: 'e.g. 4.5', advanced: true },
    { id: 'reviewCount', label: 'Number of reviews', placeholder: 'e.g. 128', advanced: true },
  ],
  FAQPage: [],
  HowTo: [
    { id: 'name', label: 'How-to title', required: true },
    { id: 'description', label: 'Short description', kind: 'textarea' },
    { id: 'totalTime', label: 'Total time (ISO 8601)', placeholder: 'PT30M = 30 minutes', advanced: true },
  ],
};

function initTypeFields(type) {
  if (type === 'FAQPage') return { qas: [{ q: '', a: '' }, { q: '', a: '' }] };
  if (type === 'HowTo') return { steps: [{ name: '', text: '' }, { name: '', text: '' }], name: '', description: '', totalTime: '', showAdvanced: false };
  const defaults = { showAdvanced: false };
  (TYPE_FIELDS[type] || []).forEach((f) => { defaults[f.id] = ''; });
  return defaults;
}

// Merges the shared business-info panel into each type's field set, so
// answering "who are you" once fills Organization, LocalBusiness, Article's
// publisher, and Product's brand automatically.
function fieldsForType(type, biz, extra) {
  const same = biz.sameAs;
  if (type === 'Organization') return { name: biz.name, url: biz.url, logo: biz.logo, phone: biz.phone, sameAs: same, ...extra };
  if (type === 'LocalBusiness') return { name: biz.name, url: biz.url, phone: biz.phone, street: biz.street, city: biz.city, region: biz.region, postalCode: biz.postalCode, country: biz.country, sameAs: same, ...extra };
  if (type === 'Article') return { ...extra, publisherName: biz.name, publisherLogo: biz.logo };
  if (type === 'Product') return { ...extra, brand: biz.name };
  if (type === 'FAQPage') return { qas: extra.qas || [] };
  if (type === 'HowTo') return { ...extra, steps: extra.steps || [] };
  return extra;
}

const IMPL_GUIDE_HTML = `
  <h3 style="font-family:'Space Grotesk',Arial,sans-serif;color:#1A2B4A;font-size:15px;margin:22px 0 8px;">How to add this to your site</h3>
  <ol style="margin:0;padding-left:20px;font-size:14px;color:#1A2B4A;line-height:1.7;">
    <li style="margin-bottom:8px;"><b>Directly in your HTML:</b> wrap each block in a <code>&lt;script type="application/ld+json"&gt;</code> tag and paste it just before the closing <code>&lt;/head&gt;</code> tag on the relevant page.</li>
    <li style="margin-bottom:8px;"><b>Google Tag Manager:</b> New Tag → Custom HTML → paste the same script block → trigger on the relevant page(s) → Publish.</li>
    <li style="margin-bottom:8px;"><b>WordPress:</b> most schema/SEO plugins (Rank Math, Yoast's custom schema, or a header/footer injector plugin) have a field to paste raw JSON-LD directly.</li>
    <li>After publishing, re-run this tool on the live URL, or validate with Google's own <a href="https://search.google.com/test/rich-results" style="color:#1F7A74;">Rich Results Test</a>.</li>
  </ol>
`;

export default function SchemaWorkbench() {
  const [mode, setMode] = useState('url'); // 'url' | 'paste'
  const [url, setUrl] = useState('');
  const [pasteContent, setPasteContent] = useState('');
  const [analyzePhase, setAnalyzePhase] = useState('idle'); // idle | analyzing | analyzed
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  const [biz, setBiz] = useState({ name: '', url: '', phone: '', logo: '', street: '', city: '', region: '', postalCode: '', country: '', sameAs: '' });
  const [bizDetected, setBizDetected] = useState(false);
  const [queueTypes, setQueueTypes] = useState([]);
  const [typeFields, setTypeFields] = useState({});

  const [email, setEmail] = useState('');
  const [genPhase, setGenPhase] = useState('idle'); // idle | generating | done
  const [genResults, setGenResults] = useState(null);
  const [copiedType, setCopiedType] = useState('');

  const setBizField = (id, v) => setBiz((p) => ({ ...p, [id]: v }));
  const setTypeField = (type, id, v) => setTypeFields((p) => ({ ...p, [type]: { ...p[type], [id]: v } }));

  async function analyze(evt) {
    evt.preventDefault();
    setError('');
    if (mode === 'url' && !url.trim()) { setError('Enter your page URL, or switch to pasting JSON-LD directly.'); return; }
    if (mode === 'paste' && !pasteContent.trim()) { setError('Paste your JSON-LD, or switch to checking a live URL.'); return; }

    setAnalyzePhase('analyzing');
    const minDelay = new Promise((r) => setTimeout(r, TOOL_SCAN_MIN_MS));

    if (mode === 'url') {
      const [, page] = await Promise.all([minDelay, fetchPageFacts(url.trim())]);
      if (!page || !page.available) {
        setAnalyzePhase('idle');
        setError("Couldn't fetch that page live right now. Double-check the URL, or paste your JSON-LD directly instead.");
        return;
      }
      const objs = page.schemaObjects || [];
      const scored = scoreSchemaObjects(objs);
      const detected = bizFromSchema(objs);
      if (detected && detected.name) {
        setBiz((p) => ({ ...p, ...Object.fromEntries(Object.entries(detected).filter(([, v]) => v)) }));
        setBizDetected(true);
      } else if (page.ogSiteName || page.ogImage) {
        setBiz((p) => ({ ...p, name: p.name || page.ogSiteName || '', url: p.url || url.trim(), logo: p.logo || page.ogImage || '' }));
        setBizDetected(false);
      } else {
        setBiz((p) => ({ ...p, url: p.url || url.trim() }));
      }
      setAnalysis({
        ...scored,
        liveNote: `Read live from ${url.trim()}, just now`,
        og: { siteName: page.ogSiteName, image: page.ogImage, description: page.ogDescription },
        fromExistingSchema: !!(detected && detected.name),
      });
      setAnalyzePhase('analyzed');
    } else {
      await minDelay;
      const { objs, errors } = parseJsonLdBlocks(pasteContent);
      if (!objs.length) {
        setAnalyzePhase('idle');
        setError(`Could not parse this as valid JSON-LD${errors[0] ? `: ${errors[0]}` : ''}.`);
        return;
      }
      const scored = scoreSchemaObjects(objs);
      const detected = bizFromSchema(objs);
      if (detected && detected.name) {
        setBiz((p) => ({ ...p, ...Object.fromEntries(Object.entries(detected).filter(([, v]) => v)) }));
        setBizDetected(true);
      }
      setAnalysis({ ...scored, liveNote: 'Parsed directly from what you pasted, this session', og: null, fromExistingSchema: !!(detected && detected.name) });
      setAnalyzePhase('analyzed');
    }
  }

  function toggleQueue(type) {
    setQueueTypes((qt) => (qt.includes(type) ? qt.filter((t) => t !== type) : [...qt, type]));
    setTypeFields((tf) => (tf[type] ? tf : { ...tf, [type]: initTypeFields(type) }));
  }

  function validateQueue() {
    for (const type of queueTypes) {
      const defs = TYPE_FIELDS[type] || [];
      const tf = typeFields[type] || {};
      const missing = defs.filter((f) => f.required && !String(tf[f.id] || '').trim());
      if (missing.length) return `${TYPE_LABEL[type]}: fill in ${missing.map((f) => f.label).join(', ')}.`;
      if (type === 'LocalBusiness' && (!biz.street.trim() || !biz.city.trim())) return 'Local Business needs a street address and city in the business info panel below.';
      if (type === 'FAQPage' && (tf.qas || []).filter((q) => q.q.trim() && q.a.trim()).length === 0) return 'Add at least one complete FAQ question and answer.';
      if (type === 'HowTo' && (tf.steps || []).filter((s) => s.name.trim()).length < 2) return 'How-To needs at least two steps.';
    }
    if (['Organization', 'LocalBusiness'].some((t) => queueTypes.includes(t)) && !biz.name.trim()) return 'Enter your business name in the business info panel below.';
    return '';
  }

  async function generate(evt) {
    evt.preventDefault();
    if (!email.trim()) { setError('Enter your email: your code and implementation guide are sent there.'); return; }
    if (queueTypes.length === 0) { setError('Pick at least one thing to generate above.'); return; }
    const v = validateQueue();
    if (v) { setError(v); return; }
    setError('');
    setGenPhase('generating');

    const results = queueTypes.map((type) => {
      const merged = fieldsForType(type, biz, typeFields[type] || {});
      const jsonLd = buildJsonLd(type, merged);
      return { type, label: TYPE_LABEL[type], code: JSON.stringify(jsonLd, null, 2) };
    });

    const bodyText = `Hi,\n\nHere is your schema markup from Click.n.likes, ready to paste in:\n\n${results.map((r) => `--- ${r.label} ---\n${r.code}`).join('\n\n')}\n\nHow to add this to your site:\n1. Directly in HTML: wrap each block in a <script type="application/ld+json"> tag, paste before </head>.\n2. Google Tag Manager: New Tag > Custom HTML > paste the block > publish.\n3. WordPress: most SEO plugins (Rank Math, Yoast, or a header/footer injector) accept raw JSON-LD.\n4. Validate after publishing at search.google.com/test/rich-results\n\nWant it professionally implemented and validated across your whole site? Reply to this email or grab an instant quote at clicknlikes.com.\n\nBest,\nClick.n.likes\nbusiness@clicknlikes.com`;
    const bodyHtml = `
      <h2 style="font-family:'Space Grotesk',Arial,sans-serif;color:#1A2B4A;font-size:20px;margin:6px 0 2px;">Your schema markup</h2>
      <p style="margin:2px 0 14px;font-size:13px;color:#777;">Generated ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · ready to paste in</p>
      ${results.map((r) => `<p style="margin:18px 0 4px;font-size:13px;font-weight:700;color:#33A79F;text-transform:uppercase;letter-spacing:0.05em;">${escapeHtml(r.label)}</p><pre style="background:#0F1B2E;color:#E5F8F5;padding:16px;border-radius:10px;font-size:12px;line-height:1.6;overflow-x:auto;white-space:pre-wrap;word-break:break-word;">${escapeHtml(r.code)}</pre>`).join('')}
      ${IMPL_GUIDE_HTML}
      <div style="margin:26px 0 6px;">
        <a href="https://clicknlikes.com" style="background:#1A2B4A;color:#ffffff !important;text-decoration:none;padding:14px 26px;border-radius:100px;font-weight:700;font-size:14px;display:inline-block;">Get it professionally implemented &rarr;</a>
      </div>`;
    sendFromClicknlikes({ toEmail: email, subject: `Your schema markup (${results.map((r) => r.label).join(', ')}) + implementation guide`, bodyText, bodyHtml });
    sendFromClicknlikes({
      toEmail: OWNER_EMAIL, replyTo: email,
      subject: `New Schema Workbench lead: ${email}`,
      bodyText: `New Schema Workbench lead:\n\nEmail: ${email}\nSource: ${mode === 'url' ? url : 'pasted JSON-LD'}\nOverall score at analysis: ${analysis ? analysis.overall : 'n/a'}/100\nGenerated types: ${results.map((r) => r.label).join(', ')}\n\nBusiness info given:\n${Object.entries(biz).filter(([, v]) => v).map(([k, v]) => `  ${k}: ${v}`).join('\n')}`,
    });

    setGenResults(results);
    setGenPhase('done');
  }

  function copyCode(type, code) {
    navigator.clipboard?.writeText(code).then(() => { setCopiedType(type); setTimeout(() => setCopiedType(''), 2000); });
  }

  function renderTypeField(type, f) {
    const tf = typeFields[type] || {};
    if (f.kind === 'select') {
      return (
        <div key={f.id}>
          <label className={labelCls}>{f.label}</label>
          <select value={tf[f.id] || f.options[0]} onChange={(e) => setTypeField(type, f.id, e.target.value)} className={fieldCls}>
            {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      );
    }
    if (f.kind === 'textarea') {
      return (
        <div key={f.id} className="sm:col-span-2">
          <label className={labelCls}>{f.label} {!f.required && <span className="font-normal text-navy/45">(optional)</span>}</label>
          <textarea value={tf[f.id] || ''} onChange={(e) => setTypeField(type, f.id, e.target.value)} rows={2} placeholder={f.placeholder} className={fieldCls} />
        </div>
      );
    }
    return (
      <div key={f.id}>
        <label className={labelCls}>{f.label} {!f.required && <span className="font-normal text-navy/45">(optional)</span>}</label>
        <input type={f.kind === 'date' ? 'date' : 'text'} value={tf[f.id] || ''} onChange={(e) => setTypeField(type, f.id, e.target.value)} placeholder={f.placeholder} className={fieldCls} />
      </div>
    );
  }

  function renderQueuedForm(type) {
    const defs = TYPE_FIELDS[type] || [];
    const primary = defs.filter((f) => !f.advanced);
    const advanced = defs.filter((f) => f.advanced);
    const tf = typeFields[type] || {};

    if (type === 'FAQPage') {
      const qas = tf.qas || [{ q: '', a: '' }, { q: '', a: '' }];
      return (
        <div className="space-y-3">
          {qas.map((row, i) => (
            <div key={i} className="rounded-xl border border-navy/10 p-4">
              <label className={labelCls}>Question {i + 1}</label>
              <input value={row.q} onChange={(e) => setTypeField(type, 'qas', qas.map((q, qi) => (qi === i ? { ...q, q: e.target.value } : q)))} placeholder="e.g. How long does implementation take?" className={fieldCls} />
              <label className={labelCls + ' mt-3'}>Answer</label>
              <textarea value={row.a} onChange={(e) => setTypeField(type, 'qas', qas.map((q, qi) => (qi === i ? { ...q, a: e.target.value } : q)))} rows={2} placeholder="The full answer text" className={fieldCls} />
            </div>
          ))}
          <div className="flex gap-3">
            {qas.length < 8 && <button type="button" onClick={() => setTypeField(type, 'qas', [...qas, { q: '', a: '' }])} className="text-sm font-semibold text-teal-dark hover:text-navy">+ Add another question</button>}
            {qas.length > 1 && <button type="button" onClick={() => setTypeField(type, 'qas', qas.slice(0, -1))} className="text-sm font-semibold text-navy/50 hover:text-coral">Remove last</button>}
          </div>
        </div>
      );
    }

    if (type === 'HowTo') {
      const steps = tf.steps || [{ name: '', text: '' }, { name: '', text: '' }];
      return (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">{primary.map((f) => renderTypeField(type, f))}</div>
          {steps.map((row, i) => (
            <div key={i} className="rounded-xl border border-navy/10 p-4">
              <label className={labelCls}>Step {i + 1} name</label>
              <input value={row.name} onChange={(e) => setTypeField(type, 'steps', steps.map((s, si) => (si === i ? { ...s, name: e.target.value } : s)))} placeholder="e.g. Audit your current site" className={fieldCls} />
              <label className={labelCls + ' mt-3'}>Step detail (optional)</label>
              <textarea value={row.text} onChange={(e) => setTypeField(type, 'steps', steps.map((s, si) => (si === i ? { ...s, text: e.target.value } : s)))} rows={2} placeholder="Extra detail for this step" className={fieldCls} />
            </div>
          ))}
          <div className="flex gap-3">
            {steps.length < 10 && <button type="button" onClick={() => setTypeField(type, 'steps', [...steps, { name: '', text: '' }])} className="text-sm font-semibold text-teal-dark hover:text-navy">+ Add another step</button>}
            {steps.length > 2 && <button type="button" onClick={() => setTypeField(type, 'steps', steps.slice(0, -1))} className="text-sm font-semibold text-navy/50 hover:text-coral">Remove last</button>}
          </div>
          {advanced.length > 0 && (
            <div>
              <button type="button" onClick={() => setTypeField(type, 'showAdvanced', !tf.showAdvanced)} className="text-sm font-semibold text-teal-dark hover:text-navy">
                {tf.showAdvanced ? '− Hide optional fields' : `+ Add ${advanced.length} more optional field${advanced.length === 1 ? '' : 's'}`}
              </button>
              {tf.showAdvanced && <div className="mt-4 grid gap-4 rounded-xl border border-navy/10 bg-off p-4 sm:grid-cols-2">{advanced.map((f) => renderTypeField(type, f))}</div>}
            </div>
          )}
        </div>
      );
    }

    if (primary.length === 0 && advanced.length === 0) {
      return <p className="text-sm text-navy/55">Uses your business info below, no extra fields needed.</p>;
    }

    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">{primary.map((f) => renderTypeField(type, f))}</div>
        {advanced.length > 0 && (
          <div>
            <button type="button" onClick={() => setTypeField(type, 'showAdvanced', !tf.showAdvanced)} className="text-sm font-semibold text-teal-dark hover:text-navy">
              {tf.showAdvanced ? '− Hide optional fields' : `+ Add ${advanced.length} more optional field${advanced.length === 1 ? '' : 's'}`}
            </button>
            {tf.showAdvanced && <div className="mt-4 grid gap-4 rounded-xl border border-navy/10 bg-off p-4 sm:grid-cols-2">{advanced.map((f) => renderTypeField(type, f))}</div>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-[0_10px_30px_rgba(26,43,74,0.06)] sm:p-8">
      {/* Step 1: analyze */}
      <form onSubmit={analyze} className="space-y-4">
        <div className="flex gap-2">
          <button type="button" onClick={() => setMode('url')} className={`rounded-full border-[1.5px] px-4 py-2 text-[13px] font-semibold transition-colors ${mode === 'url' ? 'border-teal bg-teal/10 text-navy' : 'border-navy/10 text-navy/60 hover:border-teal/40'}`}>Check a live URL</button>
          <button type="button" onClick={() => setMode('paste')} className={`rounded-full border-[1.5px] px-4 py-2 text-[13px] font-semibold transition-colors ${mode === 'paste' ? 'border-teal bg-teal/10 text-navy' : 'border-navy/10 text-navy/60 hover:border-teal/40'}`}>Paste JSON-LD</button>
        </div>
        {mode === 'url' ? (
          <div>
            <label className={labelCls}>Your page URL</label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="yourwebsite.com" className={fieldCls + ' sm:flex-1'} />
              <button type="submit" disabled={analyzePhase === 'analyzing'} className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold whitespace-nowrap text-white transition-all duration-300 hover:bg-coral disabled:opacity-60">
                {analyzePhase === 'analyzing' ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />Reading your page…</> : 'Check my schema'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <label className={labelCls}>Paste your JSON-LD (or the full &lt;script&gt; tag)</label>
            <textarea value={pasteContent} onChange={(e) => setPasteContent(e.target.value)} rows={5} placeholder='<script type="application/ld+json">{ "@context": "https://schema.org", ... }</script>' className={fieldCls} />
            <button type="submit" disabled={analyzePhase === 'analyzing'} className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold whitespace-nowrap text-white transition-all duration-300 hover:bg-coral disabled:opacity-60">
              {analyzePhase === 'analyzing' ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />Checking…</> : 'Check my schema'}
            </button>
          </div>
        )}
        {error && analyzePhase !== 'analyzed' && <p className="text-sm font-medium text-coral">{error}</p>}
      </form>

      {/* Step 2: free diagnosis */}
      {analyzePhase === 'analyzed' && analysis && (
        <div className="mt-8 border-t border-navy/10 pt-7">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal-dark">Schema completeness</span>
            <span className="text-xs font-semibold text-teal-dark">✓ {analysis.liveNote}</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-5xl font-bold text-navy">{analysis.hasAny ? analysis.overall : 0}</span>
            <span className="text-sm text-navy/55">/100</span>
          </div>
          {!analysis.hasAny && <p className="mt-2 text-sm text-navy/70">No schema markup found at all yet, so there's nothing pulling extra weight in your search results right now.</p>}
          {analysis.hasAny && analysis.missingTypes.length > 0 && (
            <p className="mt-2 text-[13px] leading-snug text-navy/55">This scores the one URL you gave us. Different schema types belong on different pages, Local Business on a contact or location page, Article on a blog post, not necessarily here, so "not present" below means not on this page, not a gap across your whole site.</p>
          )}

          <div className="mt-5 space-y-3">
            {analysis.results.filter((r) => r.known).map((r) => (
              <div key={r.type} className="rounded-xl border border-navy/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-display text-[15px] font-semibold text-navy">{TYPE_LABEL[r.type] || r.type} <span className="font-body font-normal text-navy/50">— {r.pct}%</span></p>
                  {GENERATABLE_TYPES.includes(r.type) && (
                    <button type="button" onClick={() => toggleQueue(r.type)} className={`rounded-full border-[1.5px] px-3 py-1 text-xs font-semibold transition-colors ${queueTypes.includes(r.type) ? 'border-teal bg-teal/10 text-navy' : 'border-navy/15 text-navy/60 hover:border-teal/40'}`}>
                      {queueTypes.includes(r.type) ? '✓ Queued to fix' : '+ Complete this'}
                    </button>
                  )}
                </div>
                {r.requiredMissing.length > 0 && (
                  <ul className="mt-2 space-y-1.5">
                    {r.requiredMissing.map((p) => (
                      <li key={p} className="text-[13px] leading-snug text-navy/75"><span className="font-semibold text-coral">Missing required: {p}.</span> {propCost(p)}.</li>
                    ))}
                  </ul>
                )}
                {r.recommendedMissing.length > 0 && (
                  <ul className="mt-1.5 space-y-1.5">
                    {r.recommendedMissing.map((p) => (
                      <li key={p} className="text-[13px] leading-snug text-navy/55"><span className="font-semibold text-navy/70">Recommended: {p}.</span> {propCost(p)}.</li>
                    ))}
                  </ul>
                )}
                {r.requiredMissing.length === 0 && r.recommendedMissing.length === 0 && <p className="mt-2 text-[13px] text-teal-dark">All required and recommended properties present.</p>}
              </div>
            ))}

            {analysis.missingTypes.map((type) => (
              <div key={type} className="rounded-xl border border-dashed border-navy/15 bg-off p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-display text-[15px] font-semibold text-navy">{TYPE_LABEL[type]} <span className="font-body font-normal text-navy/45">— not present</span></p>
                  <button type="button" onClick={() => toggleQueue(type)} className={`rounded-full border-[1.5px] px-3 py-1 text-xs font-semibold transition-colors ${queueTypes.includes(type) ? 'border-teal bg-teal/10 text-navy' : 'border-navy/15 text-navy/60 hover:border-teal/40'}`}>
                    {queueTypes.includes(type) ? '✓ Queued to generate' : '+ Generate this'}
                  </button>
                </div>
                <p className="mt-2 text-[13px] leading-snug text-navy/70">{TYPE_MISSING_COST[type]}</p>
              </div>
            ))}
          </div>

          {/* Step 3: shared business info + per-type fields, only once something is queued */}
          {queueTypes.length > 0 && (
            <div className="mt-7 border-t border-navy/10 pt-6">
              <p className="font-display text-base font-semibold text-navy">Your business info</p>
              <p className="mt-1 text-[13px] text-navy/55">{bizDetected ? 'Pre-filled from the schema already on your page, verified from what you actually published, edit anything that\'s changed.' : 'Answer once, every type below reuses it automatically.'}</p>
              <div className="mt-4 grid gap-4 rounded-xl border border-navy/10 bg-off p-4 sm:grid-cols-2">
                <div><label className={labelCls}>Business / organization name</label><input value={biz.name} onChange={(e) => setBizField('name', e.target.value)} className={fieldCls} /></div>
                <div><label className={labelCls}>Website URL</label><input value={biz.url} onChange={(e) => setBizField('url', e.target.value)} placeholder="https://yourwebsite.com" className={fieldCls} /></div>
                <div><label className={labelCls}>Phone <span className="font-normal text-navy/45">(optional)</span></label><input value={biz.phone} onChange={(e) => setBizField('phone', e.target.value)} className={fieldCls} /></div>
                <div><label className={labelCls}>Logo URL <span className="font-normal text-navy/45">(optional)</span></label><input value={biz.logo} onChange={(e) => setBizField('logo', e.target.value)} placeholder="https://yourwebsite.com/logo.png" className={fieldCls} /></div>
                {queueTypes.includes('LocalBusiness') && (
                  <>
                    <div><label className={labelCls}>Street address</label><input value={biz.street} onChange={(e) => setBizField('street', e.target.value)} className={fieldCls} /></div>
                    <div><label className={labelCls}>City</label><input value={biz.city} onChange={(e) => setBizField('city', e.target.value)} className={fieldCls} /></div>
                    <div><label className={labelCls}>State / region <span className="font-normal text-navy/45">(optional)</span></label><input value={biz.region} onChange={(e) => setBizField('region', e.target.value)} className={fieldCls} /></div>
                    <div><label className={labelCls}>Postal code <span className="font-normal text-navy/45">(optional)</span></label><input value={biz.postalCode} onChange={(e) => setBizField('postalCode', e.target.value)} className={fieldCls} /></div>
                    <div><label className={labelCls}>Country code <span className="font-normal text-navy/45">(optional)</span></label><input value={biz.country} onChange={(e) => setBizField('country', e.target.value)} placeholder="IN" className={fieldCls} /></div>
                  </>
                )}
                <div className="sm:col-span-2"><label className={labelCls}>Social profile URLs <span className="font-normal text-navy/45">(optional, comma-separated)</span></label><input value={biz.sameAs} onChange={(e) => setBizField('sameAs', e.target.value)} placeholder="https://linkedin.com/company/..., https://instagram.com/..." className={fieldCls} /></div>
              </div>

              <div className="mt-6 space-y-6">
                {queueTypes.map((type) => (
                  <div key={type}>
                    <div className="flex items-center justify-between">
                      <p className="font-display text-[15px] font-semibold text-navy">{TYPE_LABEL[type]}</p>
                      <button type="button" onClick={() => toggleQueue(type)} className="text-xs font-semibold text-navy/50 hover:text-coral">Remove</button>
                    </div>
                    <div className="mt-3">{renderQueuedForm(type)}</div>
                  </div>
                ))}
              </div>

              <form onSubmit={generate} className="mt-6 border-t border-navy/10 pt-5">
                <label className={labelCls}>Email (for your code + implementation guide)</label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" className={fieldCls + ' sm:flex-1'} />
                  <button type="submit" disabled={genPhase === 'generating'} className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold whitespace-nowrap text-white transition-all duration-300 hover:bg-coral disabled:opacity-60">
                    {genPhase === 'generating' ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />Generating…</> : `Generate ${queueTypes.length > 1 ? `${queueTypes.length} schema blocks` : 'my schema'}`}
                  </button>
                </div>
                {error && <p className="mt-2 text-sm font-medium text-coral">{error}</p>}
                <p className="mt-2 text-[11px] text-navy/45">Your JSON-LD code appears here and is emailed with a plain-English implementation guide, no call required.</p>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Step 4: results */}
      {genPhase === 'done' && genResults && (
        <div className="mt-7 space-y-5 border-t border-navy/10 pt-6">
          {genResults.map((r) => (
            <div key={r.type}>
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal-dark">{r.label}, ready to paste in</span>
                <button type="button" onClick={() => copyCode(r.type, r.code)} className="rounded-full border-[1.5px] border-navy/15 px-4 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-teal hover:text-teal-dark">{copiedType === r.type ? '✓ Copied' : 'Copy code'}</button>
              </div>
              <pre className="mt-3 max-h-96 overflow-auto rounded-xl bg-navy p-4 text-[12px] leading-relaxed text-teal/90 whitespace-pre-wrap">{r.code}</pre>
            </div>
          ))}
          <p className="text-xs text-teal-dark">✓ This code, plus a step-by-step implementation guide, was emailed to {email}.</p>
        </div>
      )}
    </div>
  );
}
