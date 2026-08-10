// Schema Markup Generator. Fully client-side (no live fetch, no API key):
// pick a type, fill the fields, get valid JSON-LD built from the shared
// schemaRules.js rules the Schema Validator also uses. Same gate as every
// other tool on the site: fill the form, but the generated code only
// appears once an email is given, and the full code + implementation
// guide + why-it-matters explainer is emailed as the real deliverable.
import { useState } from 'react';
import { OWNER_EMAIL, sendFromClicknlikes, escapeHtml } from '../../lib/engine';
import { SCHEMA_TYPES, buildJsonLd } from '../../lib/schemaRules';

const fieldCls = 'w-full rounded-[10px] border-[1.5px] border-navy/10 bg-white px-4 py-3 text-sm text-navy outline-none focus:border-teal';
const labelCls = 'mb-1.5 block text-[12.5px] font-semibold text-navy';

// `advanced: true` fields are real and still generated into the final JSON-LD,
// they just start collapsed behind "Show more" so the default form only shows
// what a given schema type actually requires (per schemaRules.js) plus the
// one or two fields that make the result genuinely useful. Fewer visible
// fields before the email gate, same capability for anyone who wants it.
const FIELD_DEFS = {
  Organization: [
    { id: 'name', label: 'Organization name', required: true },
    { id: 'url', label: 'Website URL', required: true, placeholder: 'https://yourwebsite.com' },
    { id: 'logo', label: 'Logo URL', placeholder: 'https://yourwebsite.com/logo.png', advanced: true },
    { id: 'description', label: 'Short description', kind: 'textarea', advanced: true },
    { id: 'phone', label: 'Phone', advanced: true },
    { id: 'email', label: 'Contact email', advanced: true },
    { id: 'sameAs', label: 'Social profile URLs (comma-separated)', placeholder: 'https://linkedin.com/company/..., https://instagram.com/...', advanced: true },
  ],
  LocalBusiness: [
    { id: 'name', label: 'Business name', required: true },
    { id: 'street', label: 'Street address', required: true },
    { id: 'city', label: 'City', required: true },
    { id: 'url', label: 'Website URL', advanced: true },
    { id: 'image', label: 'Photo URL', advanced: true },
    { id: 'description', label: 'Short description', kind: 'textarea', advanced: true },
    { id: 'phone', label: 'Phone', advanced: true },
    { id: 'region', label: 'State / region', advanced: true },
    { id: 'postalCode', label: 'Postal code', advanced: true },
    { id: 'country', label: 'Country code', placeholder: 'IN', advanced: true },
    { id: 'priceRange', label: 'Price range', placeholder: '₹₹', advanced: true },
    { id: 'hours', label: 'Opening hours (comma-separated)', placeholder: 'Mon-Fri 10:00-19:00, Sat 10:00-14:00', advanced: true },
    { id: 'sameAs', label: 'Social profile URLs (comma-separated)', advanced: true },
  ],
  Article: [
    { id: 'headline', label: 'Headline', required: true },
    { id: 'image', label: 'Featured image URL', required: true },
    { id: 'datePublished', label: 'Date published', kind: 'date', required: true },
    { id: 'authorName', label: 'Author name', required: true },
    { id: 'dateModified', label: 'Date modified', kind: 'date', advanced: true },
    { id: 'publisherName', label: 'Publisher / business name', advanced: true },
    { id: 'publisherLogo', label: 'Publisher logo URL', advanced: true },
    { id: 'description', label: 'Short description', kind: 'textarea', advanced: true },
  ],
  Product: [
    { id: 'name', label: 'Product name', required: true },
    { id: 'image', label: 'Product image URL' },
    { id: 'price', label: 'Price' },
    { id: 'availability', label: 'Availability', kind: 'select', options: ['InStock', 'OutOfStock', 'PreOrder'] },
    { id: 'description', label: 'Short description', kind: 'textarea', advanced: true },
    { id: 'brand', label: 'Brand name', advanced: true },
    { id: 'sku', label: 'SKU', advanced: true },
    { id: 'priceCurrency', label: 'Currency code', placeholder: 'INR', advanced: true },
    { id: 'ratingValue', label: 'Average rating (optional)', placeholder: 'e.g. 4.5', advanced: true },
    { id: 'reviewCount', label: 'Number of reviews (optional)', placeholder: 'e.g. 128', advanced: true },
  ],
  HowTo: [
    { id: 'name', label: 'How-to title', required: true },
    { id: 'description', label: 'Short description', kind: 'textarea' },
    { id: 'totalTime', label: 'Total time (ISO 8601, optional)', placeholder: 'PT30M = 30 minutes', advanced: true },
  ],
};

const IMPL_GUIDE_HTML = `
  <h3 style="font-family:'Space Grotesk',Arial,sans-serif;color:#1A2B4A;font-size:15px;margin:22px 0 8px;">How to add this to your site</h3>
  <ol style="margin:0;padding-left:20px;font-size:14px;color:#1A2B4A;line-height:1.7;">
    <li style="margin-bottom:8px;"><b>Directly in your HTML:</b> wrap the code above in a <code>&lt;script type="application/ld+json"&gt;</code> tag and paste it just before the closing <code>&lt;/head&gt;</code> tag on the relevant page.</li>
    <li style="margin-bottom:8px;"><b>Google Tag Manager:</b> New Tag → Custom HTML → paste the same script block → trigger on the relevant page(s) → Publish.</li>
    <li style="margin-bottom:8px;"><b>WordPress:</b> most schema/SEO plugins (Rank Math, Yoast's custom schema, or a header/footer injector plugin) have a field to paste raw JSON-LD directly.</li>
    <li>After publishing, validate it with Google's own <a href="https://search.google.com/test/rich-results" style="color:#1F7A74;">Rich Results Test</a>.</li>
  </ol>
  <h3 style="font-family:'Space Grotesk',Arial,sans-serif;color:#1A2B4A;font-size:15px;margin:22px 0 8px;">Why this matters</h3>
  <p style="margin:0 0 10px;font-size:14px;color:#1A2B4A;line-height:1.7;">Schema markup doesn't change what a visitor sees on the page. It's a structured, machine-readable description of that same content, written for search engines and AI answer engines rather than people. Google's own Search Central documentation is explicit that several rich-result types, star ratings, FAQ dropdowns, breadcrumbs, product pricing, simply will not appear without the matching schema present, no matter how well the page itself is written.</p>
  <h3 style="font-family:'Space Grotesk',Arial,sans-serif;color:#1A2B4A;font-size:15px;margin:22px 0 8px;">The positives</h3>
  <ul style="margin:0;padding-left:20px;font-size:14px;color:#1A2B4A;line-height:1.7;">
    <li style="margin-bottom:6px;"><b>Eligibility for rich results:</b> stars, FAQ accordions, breadcrumbs and pricing that make your listing physically larger in search results.</li>
    <li style="margin-bottom:6px;"><b>Better raw material for AI answers:</b> ChatGPT, Perplexity and Google AI Overviews all parse structured data to understand and correctly cite a business, product or article.</li>
    <li style="margin-bottom:6px;"><b>A clearer signal to Google</b> about exactly what your page is, useful for correct categorization independent of ranking factors.</li>
    <li><b>Zero cost, zero visual change:</b> nothing about how the page looks or performs changes for a visitor.</li>
  </ul>
`;

export default function SchemaGenerator() {
  const [type, setType] = useState('Organization');
  const [fields, setFields] = useState({});
  const [qas, setQas] = useState([{ q: '', a: '' }, { q: '', a: '' }]);
  const [steps, setSteps] = useState([{ name: '', text: '' }, { name: '', text: '' }]);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | done
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const set = (id, v) => setFields((p) => ({ ...p, [id]: v }));
  const defs = FIELD_DEFS[type] || [];
  const primaryDefs = defs.filter((f) => !f.advanced);
  const advancedDefs = defs.filter((f) => f.advanced);

  function switchType(t) {
    setType(t);
    setFields({});
    setShowAdvanced(false);
    setError('');
    setPhase('idle');
    setResult(null);
  }

  function submit(evt) {
    evt.preventDefault();
    if (!email) { setError('Enter your email: your code and implementation guide are sent there.'); return; }
    const missing = defs.filter((f) => f.required && !String(fields[f.id] || '').trim());
    if (missing.length) { setError(`Fill in: ${missing.map((f) => f.label).join(', ')}.`); return; }
    if (type === 'FAQPage' && qas.filter((q) => q.q.trim() && q.a.trim()).length === 0) { setError('Add at least one complete question and answer.'); return; }
    if (type === 'HowTo' && steps.filter((s) => s.name.trim()).length < 2) { setError('Add at least two steps.'); return; }
    setError('');

    const jsonLd = buildJsonLd(type, type === 'FAQPage' ? { qas } : type === 'HowTo' ? { ...fields, steps } : fields);
    const code = JSON.stringify(jsonLd, null, 2);
    const label = (SCHEMA_TYPES.find((t) => t.type === type) || {}).label || type;

    const bodyText = `Hi,\n\nHere is your ${label} schema markup from Click.n.likes, ready to paste in:\n\n${code}\n\nHow to add this to your site:\n1. Directly in HTML: wrap it in a <script type="application/ld+json"> tag, paste before </head>.\n2. Google Tag Manager: New Tag > Custom HTML > paste the same block > publish.\n3. WordPress: most SEO plugins (Rank Math, Yoast, or a header/footer injector) accept raw JSON-LD.\n4. Validate after publishing at search.google.com/test/rich-results\n\nWhy it matters: this doesn't change what visitors see, it tells Google and AI answer engines exactly what your page is, in a structured format several rich-result types require to appear at all.\n\nThe positives: eligibility for rich results (stars, FAQ dropdowns, breadcrumbs), better material for AI answers to cite you correctly, a clearer signal to Google, and zero cost or visual change.\n\nWant it professionally implemented and validated across your whole site? Reply to this email or grab an instant quote at clicknlikes.com.\n\nBest,\nClick.n.likes\nbusiness@clicknlikes.com`;
    const bodyHtml = `
      <h2 style="font-family:'Space Grotesk',Arial,sans-serif;color:#1A2B4A;font-size:20px;margin:6px 0 2px;">Your ${escapeHtml(label)} schema markup</h2>
      <p style="margin:2px 0 14px;font-size:13px;color:#777;">Generated ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · ready to paste in</p>
      <pre style="background:#0F1B2E;color:#E5F8F5;padding:16px;border-radius:10px;font-size:12px;line-height:1.6;overflow-x:auto;white-space:pre-wrap;word-break:break-word;">${escapeHtml(code)}</pre>
      ${IMPL_GUIDE_HTML}
      <div style="margin:26px 0 6px;">
        <a href="https://clicknlikes.com" style="background:#1A2B4A;color:#ffffff !important;text-decoration:none;padding:14px 26px;border-radius:100px;font-weight:700;font-size:14px;display:inline-block;">Get it professionally implemented &rarr;</a>
      </div>`;
    sendFromClicknlikes({ toEmail: email, subject: `Your ${label} schema markup + implementation guide`, bodyText, bodyHtml });
    sendFromClicknlikes({
      toEmail: OWNER_EMAIL, replyTo: email,
      subject: `New Schema Generator lead: ${email}`,
      bodyText: `New Schema Generator lead:\n\nEmail: ${email}\nType generated: ${label}\n\nFields:\n${Object.entries(fields).map(([k, v]) => `  ${k}: ${String(v).slice(0, 200)}`).join('\n')}`,
    });

    setResult({ code, label });
    setPhase('done');
  }

  function copyCode() {
    if (!result) return;
    navigator.clipboard?.writeText(result.code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  function renderField(f) {
    if (f.kind === 'select') {
      return (
        <div key={f.id}>
          <label className={labelCls}>{f.label}</label>
          <select value={fields[f.id] || f.options[0]} onChange={(e) => set(f.id, e.target.value)} className={fieldCls}>
            {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      );
    }
    if (f.kind === 'textarea') {
      return (
        <div key={f.id} className="sm:col-span-2">
          <label className={labelCls}>{f.label} {!f.required && <span className="font-normal text-navy/45">(optional)</span>}</label>
          <textarea value={fields[f.id] || ''} onChange={(e) => set(f.id, e.target.value)} rows={2} placeholder={f.placeholder} className={fieldCls} />
        </div>
      );
    }
    return (
      <div key={f.id}>
        <label className={labelCls}>{f.label} {!f.required && <span className="font-normal text-navy/45">(optional)</span>}</label>
        <input type={f.kind === 'date' ? 'date' : 'text'} value={fields[f.id] || ''} onChange={(e) => set(f.id, e.target.value)} placeholder={f.placeholder} className={fieldCls} />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-[0_10px_30px_rgba(26,43,74,0.06)] sm:p-8">
      <div className="flex flex-wrap gap-2">
        {SCHEMA_TYPES.map((t) => (
          <button key={t.type} type="button" onClick={() => switchType(t.type)}
            className={`rounded-full border-[1.5px] px-4 py-2 text-[13px] font-semibold transition-colors ${type === t.type ? 'border-teal bg-teal/10 text-navy' : 'border-navy/10 text-navy/60 hover:border-teal/40'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-5">
        {type !== 'FAQPage' && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">{primaryDefs.map(renderField)}</div>
            {advancedDefs.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced((v) => !v)}
                  className="text-sm font-semibold text-teal-dark hover:text-navy"
                >
                  {showAdvanced ? '− Hide optional fields' : `+ Add ${advancedDefs.length} more optional field${advancedDefs.length === 1 ? '' : 's'}`}
                </button>
                {showAdvanced && (
                  <div className="mt-4 grid gap-4 rounded-xl border border-navy/10 bg-off p-4 sm:grid-cols-2">{advancedDefs.map(renderField)}</div>
                )}
              </div>
            )}
          </>
        )}

        {type === 'FAQPage' && (
          <div className="space-y-4">
            {qas.map((row, i) => (
              <div key={i} className="rounded-xl border border-navy/10 p-4">
                <label className={labelCls}>Question {i + 1}</label>
                <input value={row.q} onChange={(e) => setQas((qs) => qs.map((q, qi) => qi === i ? { ...q, q: e.target.value } : q))} placeholder="e.g. How long does implementation take?" className={fieldCls} />
                <label className={labelCls + ' mt-3'}>Answer</label>
                <textarea value={row.a} onChange={(e) => setQas((qs) => qs.map((q, qi) => qi === i ? { ...q, a: e.target.value } : q))} rows={2} placeholder="The full answer text" className={fieldCls} />
              </div>
            ))}
            <div className="flex gap-3">
              {qas.length < 8 && <button type="button" onClick={() => setQas((qs) => [...qs, { q: '', a: '' }])} className="text-sm font-semibold text-teal-dark hover:text-navy">+ Add another question</button>}
              {qas.length > 1 && <button type="button" onClick={() => setQas((qs) => qs.slice(0, -1))} className="text-sm font-semibold text-navy/50 hover:text-coral">Remove last</button>}
            </div>
          </div>
        )}

        {type === 'HowTo' && (
          <div className="space-y-4">
            {steps.map((row, i) => (
              <div key={i} className="rounded-xl border border-navy/10 p-4">
                <label className={labelCls}>Step {i + 1} name</label>
                <input value={row.name} onChange={(e) => setSteps((ss) => ss.map((s, si) => si === i ? { ...s, name: e.target.value } : s))} placeholder="e.g. Audit your current site" className={fieldCls} />
                <label className={labelCls + ' mt-3'}>Step detail (optional)</label>
                <textarea value={row.text} onChange={(e) => setSteps((ss) => ss.map((s, si) => si === i ? { ...s, text: e.target.value } : s))} rows={2} placeholder="Extra detail for this step" className={fieldCls} />
              </div>
            ))}
            <div className="flex gap-3">
              {steps.length < 10 && <button type="button" onClick={() => setSteps((ss) => [...ss, { name: '', text: '' }])} className="text-sm font-semibold text-teal-dark hover:text-navy">+ Add another step</button>}
              {steps.length > 2 && <button type="button" onClick={() => setSteps((ss) => ss.slice(0, -1))} className="text-sm font-semibold text-navy/50 hover:text-coral">Remove last</button>}
            </div>
          </div>
        )}

        <div className="border-t border-navy/10 pt-5">
          <label className={labelCls}>Email (for your code + implementation guide)</label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" className={fieldCls + ' sm:flex-1'} />
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold whitespace-nowrap text-white transition-all duration-300 hover:bg-coral">
              Generate my schema
            </button>
          </div>
          {error && <p className="mt-2 text-sm font-medium text-coral">{error}</p>}
          <p className="mt-2 text-[11px] text-navy/45">Your JSON-LD code appears here and is emailed with a plain-English implementation guide, no call required.</p>
        </div>
      </form>

      {phase === 'done' && result && (
        <div className="mt-7 border-t border-navy/10 pt-6">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal-dark">{result.label} schema, ready to paste in</span>
            <button type="button" onClick={copyCode} className="rounded-full border-[1.5px] border-navy/15 px-4 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-teal hover:text-teal-dark">{copied ? '✓ Copied' : 'Copy code'}</button>
          </div>
          <pre className="mt-4 max-h-96 overflow-auto rounded-xl bg-navy p-4 text-[12px] leading-relaxed text-teal/90 whitespace-pre-wrap">{result.code}</pre>
          <p className="mt-4 text-xs text-teal-dark">✓ This code, plus a step-by-step implementation guide and why it matters, was emailed to {email}.</p>
        </div>
      )}
    </div>
  );
}
