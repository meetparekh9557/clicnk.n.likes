// Generic lead form island: v1's handleSimpleForm + FORM_SUCCESS_COPY,
// driven by a field config so Work/About/FAQ/Contact all reuse one
// implementation. One owner notification (logs the sheet row) + one
// visitor confirmation per submission, exactly like v1.
import { useState, useEffect, useRef } from 'react';
import { OWNER_EMAIL, sendFromClicknlikes, trackEvent } from '../../lib/engine';
import CountrySelect from './CountrySelect.jsx';
import PhoneInput from './PhoneInput.jsx';

const fieldCls =
  'w-full rounded-[10px] border-[1.5px] border-navy/10 bg-white px-4 py-3.5 text-sm text-navy transition-colors outline-none focus:border-teal';
const labelCls = 'mb-1.5 block text-[12.5px] font-semibold text-navy';

// Attribution params worth keeping with a lead, for any form on the site -
// not just paid-traffic pages. Read once at module load (not per-render);
// a real page load never changes its own query string underneath it.
const ATTRIBUTION_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'];
const attribution = (() => {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const out = {};
  ATTRIBUTION_KEYS.forEach((k) => {
    const v = params.get(k);
    if (v) out[k] = v;
  });
  return out;
})();

// The page the lead actually came from. Read at submit time rather than
// module load so it is correct even if the island is reused after a
// client-side navigation. Kept out of the visitor's confirmation email -
// it is internal routing information, not something they sent us.
export function currentPagePath() {
  if (typeof window === 'undefined') return '';
  return window.location.pathname || '/';
}

// `lockedFields` is a flat object of values fixed by the page rather than
// chosen by the visitor - used by the service pages to stamp the one
// service that page is about, without ever showing a picker listing the
// other services.
export default function SimpleForm({ tag, fields, submitLabel, thankYouHref, footnote, startEventName, submitEventName, lockedFields }) {
  const [sending, setSending] = useState(false);
  const started = useRef(false);
  const onFormFocus = () => {
    if (startEventName && !started.current) {
      started.current = true;
      trackEvent(startEventName, { form_tag: tag });
    }
  };
  // fieldName -> Set of selected options, for 'chips' (multi-select) fields.
  const [chipSel, setChipSel] = useState({});
  const toggleChip = (name, opt) =>
    setChipSel((prev) => {
      const set = new Set(prev[name] || []);
      set.has(opt) ? set.delete(opt) : set.add(opt);
      return { ...prev, [name]: set };
    });

  // Lets a plain <a href="#form-id"> CTA elsewhere on the page pre-check a
  // chip before scrolling here, instead of just dropping the visitor at an
  // empty form (see services/index.astro's per-channel CTAs). This island
  // is client:visible, so a CTA click that scrolls the form into view can
  // fire the click (and the event below) *before* hydration finishes -
  // window.__cnlPreselect is a queue the click handler fills synchronously
  // that this effect drains on mount, so the value survives that race
  // regardless of exactly when hydration lands.
  const applyPreselect = (field, value) => {
    if (!field || !value) return;
    setChipSel((prev) => {
      const set = new Set(prev[field] || []);
      set.add(value);
      return { ...prev, [field]: set };
    });
  };
  useEffect(() => {
    if (window.__cnlPreselect) {
      applyPreselect(window.__cnlPreselect.field, window.__cnlPreselect.value);
      window.__cnlPreselect = null;
    }
    function onPreselect(evt) {
      applyPreselect(evt.detail?.field, evt.detail?.value);
    }
    window.addEventListener('cnl:preselect', onPreselect);
    return () => window.removeEventListener('cnl:preselect', onPreselect);
  }, []);

  function submit(evt) {
    evt.preventDefault();
    const form = evt.target;
    const obj = {};
    new FormData(form).forEach((v, k) => (obj[k] = v));

    const summary = Object.entries(obj)
      .filter(([k]) => !ATTRIBUTION_KEYS.includes(k))
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
    const attributionLines = Object.entries(attribution).map(([k, v]) => `${k}: ${v}`).join('\n');
    const page = currentPagePath();
    sendFromClicknlikes({
      toEmail: OWNER_EMAIL,
      replyTo: obj.email || undefined,
      subject: `New ${tag} lead: ${obj.name || obj.email || 'website visitor'}`,
      bodyText: `New submission from the ${tag} form:\n\nCame from page: ${page}\n\n${summary}${attributionLines ? `\n\nAttribution:\n${attributionLines}` : ''}`,
      // One sheet column per field. `obj` already carries the attribution
      // params too - they're rendered as hidden inputs inside this form,
      // so FormData picks them up with everything else.
      fields: { form: tag, page, ...lockedFields, ...obj },
    });
    if (obj.email) {
      sendFromClicknlikes({
        toEmail: obj.email,
        toName: obj.name,
        subject: 'We got your message: Click.n.likes',
        bodyText: `Hi ${obj.name || ''},\n\nThanks for reaching out to Click.n.likes. We've received your message and will get back to you within one business day.\n\nHere's a copy of what you sent us:\n${summary}\n\nBest,\nClick.n.likes\nbusiness@clicknlikes.com`,
      });
    }
    trackEvent(submitEventName || 'generate_lead', { form_tag: tag });
    setSending(true);
    setTimeout(() => {
      window.location.href = thankYouHref;
    }, 650);
  }

  return (
    <form onSubmit={submit} onFocus={onFormFocus} className="rounded-2xl border border-navy/10 bg-white p-7 text-left shadow-[0_10px_30px_rgba(26,43,74,0.06)]">
      {Object.entries(attribution).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      {Object.entries(lockedFields || {}).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => {
          const id = `${tag}-${f.name}`;
          const label = (
            <label className={labelCls} htmlFor={id}>
              {f.label} {f.optional && <span className="font-normal text-navy/45">({f.optional})</span>}
            </label>
          );
          if (f.type === 'select') {
            return (
              <div key={f.name} className={f.full ? 'sm:col-span-2' : ''}>
                {label}
                <select id={id} name={f.name} className={fieldCls}>
                  {f.options.map((o, i) => (
                    <option key={o} value={f.emptyFirst && i === 0 ? '' : o}>{o}</option>
                  ))}
                </select>
              </div>
            );
          }
          if (f.type === 'chips') {
            const sel = chipSel[f.name] || new Set();
            return (
              <div key={f.name} className="sm:col-span-2">
                {label}
                <div className="flex flex-wrap gap-2">
                  {f.options.map((o) => {
                    const active = sel.has(o);
                    return (
                      <button
                        key={o} type="button" onClick={() => toggleChip(f.name, o)}
                        aria-pressed={active}
                        className={`rounded-full border-[1.5px] px-3.5 py-2 text-[12.5px] font-semibold transition-colors ${active ? 'border-teal bg-teal/10 text-navy' : 'border-navy/10 text-navy/60 hover:border-teal/40'}`}
                      >
                        {o}
                      </button>
                    );
                  })}
                </div>
                <input type="hidden" name={f.name} value={[...sel].join(', ')} />
              </div>
            );
          }
          if (f.type === 'country') {
            return (
              <div key={f.name} className={f.full ? 'sm:col-span-2' : ''}>
                {label}
                <CountrySelect id={id} name={f.name} required={f.required !== false} />
              </div>
            );
          }
          if (f.type === 'phone') {
            return (
              <div key={f.name} className={f.full ? 'sm:col-span-2' : ''}>
                {label}
                <PhoneInput id={id} name={f.name} required={f.required !== false} placeholder={f.placeholder} />
              </div>
            );
          }
          if (f.type === 'textarea') {
            return (
              <div key={f.name} className="sm:col-span-2">
                {label}
                <textarea id={id} name={f.name} required={f.required !== false} rows={f.rows || 4} placeholder={f.placeholder} className={fieldCls} />
              </div>
            );
          }
          return (
            <div key={f.name} className={f.full ? 'sm:col-span-2' : ''}>
              {label}
              <input id={id} type={f.type || 'text'} name={f.name} required={f.required !== false} placeholder={f.placeholder} className={fieldCls} />
            </div>
          );
        })}
      </div>
      <button
        type="submit"
        disabled={sending}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-coral disabled:opacity-60"
      >
        {sending ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
            Sending…
          </>
        ) : (
          <>
            {submitLabel}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </>
        )}
      </button>
      {footnote && <p className="mt-3 text-center text-xs text-navy/50">{footnote}</p>}
    </form>
  );
}
