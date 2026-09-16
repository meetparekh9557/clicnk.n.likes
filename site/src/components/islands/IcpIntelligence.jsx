/**
 * ICP Intelligence: the tool's interface.
 *
 * This component renders a questionnaire and a report. It contains no
 * intelligence of its own, on purpose: every question comes from
 * lib/icp/questions.js and every conclusion from lib/icp/analyze.js, so the
 * reasoning can be tested without a browser and swapped without touching a
 * single element here.
 *
 * Three deliberate product decisions, each of which the code enforces:
 *
 *  - The analysis runs entirely in the browser. No request is made to score
 *    anything, which is what makes the tool free to run and keeps working
 *    when our backend does not.
 *  - Results are never gated. Email is offered after the report is on screen,
 *    as a way to keep a copy, and the report stays fully readable if it is
 *    ignored. A diagnostic that holds its answer hostage is a lead form
 *    wearing a costume.
 *  - Skipping a question is a first-class answer. Nothing punishes a blank
 *    field; it lowers confidence, which the report states out loud.
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { steps, visibleFields, missingRequired } from '../../lib/icp/questions';
import { analyzeIcp, DIMENSION_LABELS } from '../../lib/icp/analyze';
import { VALUE_BANDS } from '../../lib/icp/normalize';
import {
  trackEvent, sendFromClicknlikes, mailtoFallback, OWNER_EMAIL, TOOL_LEADS_TAB,
} from '../../lib/engine';

/* Shared styling, matching the existing tool islands so this does not read as
   a different product bolted onto the site. */
const field = 'w-full rounded-[10px] border-[1.5px] border-navy/10 bg-white px-4 py-3 text-[15px] text-navy outline-none transition-colors focus:border-teal focus-visible:ring-2 focus-visible:ring-teal/40';
const labelCls = 'mb-1.5 block text-[13.5px] font-semibold text-navy';
const hintCls = 'mt-1 text-[12.5px] leading-relaxed text-navy/50';
const card = 'rounded-2xl border border-navy/10 bg-white p-5 sm:p-7';
const btn = 'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[15px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40';
const btnPrimary = `${btn} bg-navy text-white hover:bg-teal-dark`;
const btnGhost = `${btn} border-[1.5px] border-navy/15 text-navy hover:border-teal hover:text-teal-dark`;

const INR = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

function Chip({ selected, onClick, children, disabled }) {
  return (
    <button
      type="button" onClick={onClick} disabled={disabled} aria-pressed={selected}
      className={`rounded-full border-[1.5px] px-3.5 py-2 text-[13.5px] font-medium transition-colors ${
        selected ? 'border-teal bg-teal/12 text-navy' : 'border-navy/12 text-navy/70 hover:border-teal/50'
      } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
    >
      {selected ? '✓ ' : ''}{children}
    </button>
  );
}

function Field({ f, value, onChange }) {
  const id = `icp-${f.id}`;
  const described = f.hint ? `${id}-hint` : undefined;

  const control = () => {
    switch (f.type) {
      case 'select':
        return (
          <select id={id} className={field} value={value ?? ''} aria-describedby={described}
            onChange={(e) => onChange(f.id, e.target.value)}>
            <option value="">{f.required ? 'Choose one' : 'Not sure / skip'}</option>
            {f.options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        );
      case 'multiselect': {
        const arr = Array.isArray(value) ? value : [];
        const full = f.max && arr.length >= f.max;
        return (
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby={`${id}-label`} aria-describedby={described}>
            {f.options.map((o) => (
              <Chip key={o.v} selected={arr.includes(o.v)} disabled={full && !arr.includes(o.v)}
                onClick={() => onChange(f.id, arr.includes(o.v) ? arr.filter((x) => x !== o.v) : [...arr, o.v])}>
                {o.l}
              </Chip>
            ))}
          </div>
        );
      }
      case 'textarea':
        return <textarea id={id} rows={3} className={field} value={value ?? ''} placeholder={f.placeholder}
          aria-describedby={described} onChange={(e) => onChange(f.id, e.target.value)} />;
      case 'number': case 'money':
        return <input id={id} type="number" inputMode="numeric" min="0" className={field} value={value ?? ''}
          placeholder={f.placeholder} aria-describedby={described} onChange={(e) => onChange(f.id, e.target.value)} />;
      case 'percent':
        return (
          <div className="relative">
            <input id={id} type="number" inputMode="numeric" min="0" max="100" className={`${field} pr-10`}
              value={value ?? ''} aria-describedby={described} onChange={(e) => onChange(f.id, e.target.value)} />
            <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-navy/40">%</span>
          </div>
        );
      default:
        return <input id={id} type={f.type === 'url' ? 'url' : 'text'} className={field} value={value ?? ''}
          placeholder={f.placeholder} aria-describedby={described} onChange={(e) => onChange(f.id, e.target.value)} />;
    }
  };

  return (
    <div>
      <label className={labelCls} htmlFor={f.type === 'multiselect' ? undefined : id} id={`${id}-label`}>
        {f.label}
        {!f.required && <span className="ml-1.5 font-normal text-navy/40">optional</span>}
      </label>
      {control()}
      {f.hint && <p className={hintCls} id={`${id}-hint`}>{f.hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------- Report bits */
const Section = ({ title, children, kicker }) => (
  <section className="border-t border-navy/10 pt-8">
    {kicker && <p className="text-[11.5px] font-semibold tracking-[0.14em] text-teal-dark uppercase">{kicker}</p>}
    <h3 className="mt-1.5 font-display text-[clamp(1.15rem,2.2vw,1.5rem)] leading-tight font-bold text-navy">{title}</h3>
    <div className="mt-4">{children}</div>
  </section>
);

const Bullets = ({ items }) => (
  <ul className="space-y-2.5">
    {items.map((t, i) => (
      <li key={i} className="flex gap-2.5 text-[14.5px] leading-relaxed text-navy/75">
        <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
        <span>{t}</span>
      </li>
    ))}
  </ul>
);

function ScoreBadge({ score, alignment, size = 'lg' }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`grid shrink-0 place-items-center rounded-2xl bg-navy text-white ${size === 'lg' ? 'h-16 w-16' : 'h-12 w-12'}`}>
        <span className={`font-display font-bold ${size === 'lg' ? 'text-2xl' : 'text-lg'}`}>{score}</span>
      </div>
      <div>
        <p className="font-display text-[15px] font-bold text-navy">{alignment}</p>
        <p className="text-[12.5px] text-navy/55">Alignment score, {score} out of 100</p>
      </div>
    </div>
  );
}

function SegmentBlock({ seg, kicker, note }) {
  if (!seg) return null;
  return (
    <div className={card}>
      <p className="text-[11.5px] font-semibold tracking-[0.14em] text-teal-dark uppercase">{kicker}</p>
      <h4 className="mt-2 font-display text-lg font-bold text-navy">{seg.name}</h4>
      <p className="mt-2 text-[14.5px] leading-relaxed text-navy/70">{seg.summary}</p>
      {note && <p className="mt-3 rounded-xl bg-off/70 p-3 text-[13.5px] leading-relaxed text-navy/70">{note}</p>}
      <div className="mt-4"><ScoreBadge score={seg.score} alignment={seg.alignment} size="sm" /></div>
    </div>
  );
}

/* ----------------------------------------------------------------- Report */
function Report({ result, answers, onRestart }) {
  const [email, setEmail] = useState('');
  const [sendState, setSendState] = useState('idle'); // idle | sending | sent | failed
  const [copied, setCopied] = useState(false);
  const r = result;

  const plainText = useMemo(() => buildPlainText(r), [r]);
  const reportRef = useRef(null);

  // CSS cannot open a collapsed <details>, so the methodology is expanded
  // before the print dialog opens and left that way. Someone printing the
  // report wants the working, and a printed page has no disclosure triangle
  // to click.
  useEffect(() => {
    const expand = () => {
      if (!reportRef.current) return;
      reportRef.current.querySelectorAll('details').forEach((d) => { d.open = true; });
    };
    window.addEventListener('beforeprint', expand);
    return () => window.removeEventListener('beforeprint', expand);
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      trackEvent('icp_results_copied');
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      setCopied(false);
    }
  }

  function print() {
    trackEvent('icp_results_printed');
    window.print();
  }

  async function emailCopy(evt) {
    evt.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setSendState('invalid'); return; }
    setSendState('sending');
    trackEvent('icp_lead_submitted');
    const subject = `Your ICP Intelligence report: ${r.primary.name}`;
    const owner = await sendFromClicknlikes({
      toEmail: OWNER_EMAIL, replyTo: email,
      subject: `New ICP Intelligence lead: ${email}`,
      bodyText: `Primary ICP: ${r.primary.name} (${r.primary.score}/100)\nGoal: ${r.generatedFor.goal}\nIndustry: ${r.generatedFor.industry}\nConfidence: ${r.confidence.label}\n\n${plainText}`,
      leadTab: TOOL_LEADS_TAB,
      fields: {
        tool: 'ICP Intelligence', email,
        primaryIcp: r.primary.name, score: r.primary.score,
        goal: r.generatedFor.goal, industry: r.generatedFor.industry,
        confidence: r.confidence.label,
      },
    });
    const mine = await sendFromClicknlikes({ toEmail: email, subject, bodyText: plainText });
    setSendState(owner.ok || mine.ok ? 'sent' : 'failed');
  }

  return (
    <div className="icp-report" ref={reportRef}>
      {/* 1. Overview */}
      <div className="rounded-2xl border border-navy/10 bg-gradient-to-br from-off to-white p-6 sm:p-8">
        <p className="text-[11.5px] font-semibold tracking-[0.14em] text-teal-dark uppercase">Your ICP analysis</p>
        <h2 className="mt-2 font-display text-[clamp(1.5rem,3.4vw,2.2rem)] leading-tight font-bold text-navy">
          {r.primary.name}
        </h2>
        <p className="mt-3 max-w-2xl text-[15.5px] leading-relaxed text-navy/75">{r.primary.summary}</p>
        <div className="mt-6 flex flex-wrap items-center gap-6">
          <ScoreBadge score={r.primary.score} alignment={r.primary.alignment} />
          <div className="rounded-xl border border-navy/10 bg-white px-4 py-3">
            <p className="text-[12px] font-semibold tracking-wide text-navy/50 uppercase">Confidence</p>
            <p className="mt-0.5 font-display text-[15px] font-bold text-navy">{r.confidence.label}</p>
          </div>
          <div className="rounded-xl border border-navy/10 bg-white px-4 py-3">
            <p className="text-[12px] font-semibold tracking-wide text-navy/50 uppercase">Scored against</p>
            <p className="mt-0.5 font-display text-[15px] font-bold text-navy">{r.generatedFor.goal}</p>
          </div>
        </div>
        <p className="mt-5 text-[13px] leading-relaxed text-navy/55">
          This is an alignment score, not a prediction. It describes how well each customer segment matches the
          business you described. It makes no claim about how likely anyone is to buy.
        </p>
      </div>

      <div className="mt-10 space-y-9">
        {/* 2. The challenge, when there is one. Placed high on purpose: if the
            analysis disagrees with the user, burying it would be cowardly. */}
        {r.challenge && r.challenge.kind === 'conflicts' && (
          <section className="rounded-2xl border-[1.5px] border-coral/40 bg-coral/5 p-5 sm:p-7">
            <p className="text-[11.5px] font-semibold tracking-[0.14em] text-coral uppercase">Your assumption, checked</p>
            <h3 className="mt-1.5 font-display text-[clamp(1.15rem,2.2vw,1.45rem)] font-bold text-navy">
              Your own numbers point somewhere else
            </h3>
            <p className="mt-3 text-[14.5px] leading-relaxed text-navy/80">{r.challenge.detail}</p>
            <ul className="mt-4 space-y-3">
              {r.challenge.weakest.map((w) => (
                <li key={w.dimension} className="rounded-xl bg-white/80 p-4">
                  <p className="font-display text-[14px] font-bold text-navy">
                    {DIMENSION_LABELS[w.dimension]}: {w.statedScore} against {w.topScore}
                  </p>
                  {w.reasons.map((x, i) => (
                    <p key={i} className="mt-1.5 text-[13.5px] leading-relaxed text-navy/70">{x.detail}</p>
                  ))}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[13px] leading-relaxed text-navy/60">{r.challenge.caveat}</p>
          </section>
        )}
        {r.challenge && ['agrees', 'close'].includes(r.challenge.kind) && (
          <section className="rounded-2xl border border-teal/40 bg-teal/5 p-5">
            <p className="text-[11.5px] font-semibold tracking-[0.14em] text-teal-dark uppercase">Your assumption, checked</p>
            <p className="mt-2 text-[14.5px] leading-relaxed text-navy/80">{r.challenge.detail}</p>
          </section>
        )}

        {/* 3. Why this ICP */}
        <Section kicker="The reasoning" title="Why this segment came first">
          <ul className="space-y-4">
            {r.primary.whyThis.map((w) => (
              <li key={w.dimension} className="rounded-xl border border-navy/10 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-display text-[14.5px] font-bold text-navy">{w.dimension}</p>
                  <p className="text-[12.5px] text-navy/50">scored {w.score}, weighted &times;{w.weight}</p>
                </div>
                {w.reasons.map((x, i) => (
                  <p key={i} className="mt-2 text-[14px] leading-relaxed text-navy/70">
                    <b className="font-semibold text-navy">{x.label}.</b> {x.detail}
                  </p>
                ))}
              </li>
            ))}
          </ul>
          {r.primary.negatives.length > 0 && (
            <div className="mt-5 rounded-xl border border-coral/30 bg-coral/5 p-4">
              <p className="font-display text-[14px] font-bold text-navy">Counting against it</p>
              {r.primary.negatives.map((n) => (
                <p key={n.id} className="mt-2 text-[13.5px] leading-relaxed text-navy/75">
                  <b className="font-semibold text-navy">{n.label}.</b> {n.detail}
                </p>
              ))}
            </div>
          )}
        </Section>

        {/* 4. What would change it */}
        <Section kicker="Sensitivity" title="What would change this recommendation">
          <Bullets items={r.primary.whatWouldChangeThis} />
        </Section>

        {/* 5. Buyer profile */}
        <Section kicker="The buyer" title="Who you are actually selling to">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Who they are', r.primary.buyer.who],
              ['Seniority and authority', r.primary.buyer.seniority],
              ['What they are responsible for', r.primary.buyer.responsibilities],
              ['How they evaluate you', r.primary.buyer.evaluates],
              ['Where they get information', r.primary.buyer.sources],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-navy/10 p-4">
                <p className="text-[12px] font-semibold tracking-wide text-navy/50 uppercase">{k}</p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-navy/75">{v}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 6. Pains, 7. triggers, 8. objections */}
        <Section kicker="Motivation" title="What this buyer is actually struggling with">
          <Bullets items={r.primary.pains} />
        </Section>
        <Section kicker="Timing" title="What makes them start looking">
          <Bullets items={r.primary.triggers} />
        </Section>
        <Section kicker="Resistance" title="What they say, and what they mean">
          <ul className="space-y-3">
            {r.primary.objections.map((o, i) => (
              <li key={i} className="rounded-xl border border-navy/10 p-4">
                <p className="font-display text-[14.5px] font-bold text-navy">&ldquo;{o.says}&rdquo;</p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-navy/70">
                  <span className="font-semibold text-teal-dark">What it means: </span>{o.means}
                </p>
              </li>
            ))}
          </ul>
        </Section>

        {/* 9. Low fit */}
        {r.lowFit && (
          <Section kicker="Avoid" title="Low-fit customer profile">
            <div className="rounded-2xl border border-navy/10 bg-off/60 p-5">
              <h4 className="font-display text-lg font-bold text-navy">{r.lowFit.name}</h4>
              <p className="mt-2 text-[14.5px] leading-relaxed text-navy/70">{r.lowFit.summary}</p>
              <p className="mt-3 text-[13px] text-navy/55">Alignment {r.lowFit.score} out of 100, the lowest of the segments scored.</p>
              <ul className="mt-4 space-y-2.5">
                {r.lowFit.whyLowFit.map((w, i) => (
                  <li key={i} className="text-[14px] leading-relaxed text-navy/75">
                    <b className="font-semibold text-navy">{w.label}.</b> {w.detail}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[13px] leading-relaxed text-navy/55">
                This is a reading of the inputs you gave, not a rule. It means pursuing this group would cost more
                than it returns as the business stands today, which can change when the business does.
              </p>
            </div>
          </Section>
        )}

        {/* 10. Channels */}
        <Section kicker="Where to find them" title="Acquisition channels, and why each one">
          <div className="space-y-3">
            {r.channels.recommended.map((c) => (
              <div key={c.id} className="rounded-xl border border-navy/10 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-[14.5px] font-bold text-navy">{c.name}</p>
                  {c.status === 'already-working' && (
                    <span className="rounded-full bg-teal/15 px-2.5 py-0.5 text-[11.5px] font-semibold text-teal-dark">
                      already producing customers
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-[14px] leading-relaxed text-navy/70">{c.why}</p>
                {c.note && <p className="mt-1.5 text-[13px] leading-relaxed text-navy/55">{c.note}</p>}
              </div>
            ))}
          </div>
          {r.channels.withheld.length > 0 && (
            <div className="mt-4 rounded-xl bg-off/70 p-4">
              <p className="font-display text-[13.5px] font-bold text-navy">Not recommended yet</p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-navy/65">
                {r.channels.withheld.map((w) => w.name).join(', ')}. These suit this buyer but need sustained budget
                you told us you do not have. Recommending them now would be advice you cannot act on.
              </p>
            </div>
          )}
          {r.channels.keepRunning.length > 0 && (
            <div className="mt-3 rounded-xl border border-teal/30 bg-teal/5 p-4">
              <p className="font-display text-[13.5px] font-bold text-navy">Keep running regardless</p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-navy/70">
                {r.channels.keepRunning.map((k) => k.name).join(', ')} {r.channels.keepRunning.length === 1 ? 'is' : 'are'} already
                producing customers for you. Judge {r.channels.keepRunning.length === 1 ? 'it' : 'them'} on your own numbers, not on this analysis.
              </p>
            </div>
          )}
        </Section>

        {/* 11. Messaging */}
        <Section kicker="What to say" title="Message-market fit">
          <div className="space-y-3">
            {[
              ['Primary pain to lead with', r.messaging.primaryPain],
              ['The outcome they want', r.messaging.desiredOutcome],
              ['Core positioning', r.messaging.positioning],
              ['Messaging angle', r.messaging.angle],
              ['Offer angle', r.messaging.offerAngle],
              ['Call to action', r.messaging.cta],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-navy/10 p-4">
                <p className="text-[12px] font-semibold tracking-wide text-navy/50 uppercase">{k}</p>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-navy/80">{v}</p>
              </div>
            ))}
          </div>
          {r.messaging.proofPoints.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-[12px] font-semibold tracking-wide text-navy/50 uppercase">Proof this buyer needs</p>
              <Bullets items={r.messaging.proofPoints} />
            </div>
          )}
        </Section>

        {/* 12. Content */}
        <Section kicker="What to publish" title="Content opportunities">
          {[['Awareness', r.content.awareness], ['Consideration', r.content.consideration], ['Decision', r.content.decision]].map(([stage, items]) => (
            <div key={stage} className="mt-4 first:mt-0">
              <p className="mb-2 text-[12px] font-semibold tracking-wide text-navy/50 uppercase">{stage} stage</p>
              <ul className="space-y-2.5">
                {items.map((c, i) => (
                  <li key={i} className="rounded-xl border border-navy/10 p-3.5">
                    <p className="text-[14px] font-semibold text-navy">{c.topic}</p>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-navy/65">{c.why}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-off/70 p-4">
              <p className="text-[12px] font-semibold tracking-wide text-navy/50 uppercase">Search opportunities</p>
              <ul className="mt-2 space-y-1.5">{r.content.seo.map((s, i) => <li key={i} className="text-[13.5px] leading-relaxed text-navy/70">{s}</li>)}</ul>
            </div>
            <div className="rounded-xl bg-off/70 p-4">
              <p className="text-[12px] font-semibold tracking-wide text-navy/50 uppercase">Social themes</p>
              <ul className="mt-2 space-y-1.5">{r.content.social.map((s, i) => <li key={i} className="text-[13.5px] leading-relaxed text-navy/70">{s}</li>)}</ul>
            </div>
          </div>
          <div className="mt-3 rounded-xl bg-off/70 p-4">
            <p className="text-[12px] font-semibold tracking-wide text-navy/50 uppercase">Lead magnet ideas</p>
            <ul className="mt-2 space-y-2">
              {r.content.magnets.map((m, i) => (
                <li key={i} className="text-[13.5px] leading-relaxed text-navy/70">
                  <b className="font-semibold text-navy">{m.name}.</b> {m.why}
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* 13/14. Secondary and expansion */}
        {(r.secondary || r.expansion) && (
          <Section kicker="Other segments worth knowing about" title="Secondary and expansion">
            <div className="grid gap-4 sm:grid-cols-2">
              <SegmentBlock seg={r.secondary} kicker="Secondary ICP"
                note="A genuinely different bet from your primary, included because it scores well on a different set of dimensions rather than because it came second." />
              <SegmentBlock seg={r.expansion} kicker="Expansion ICP"
                note="Not the next-best segment today. This is the one with the most room to grow into as capacity, pricing or reach change." />
            </div>
          </Section>
        )}

        {/* 15. Confidence and assumptions */}
        <Section kicker="How much to trust this" title="Confidence, assumptions and contradictions">
          <div className="rounded-xl border border-navy/10 p-4">
            <p className="font-display text-[15px] font-bold text-navy">{r.confidence.label}</p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-navy/70">{r.confidence.summary}</p>
          </div>
          {r.assumptions.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-[12px] font-semibold tracking-wide text-navy/50 uppercase">Assumptions made, and why</p>
              <ul className="space-y-2.5">
                {r.assumptions.map((x) => (
                  <li key={x.id} className="rounded-xl bg-off/70 p-3.5">
                    <p className="text-[14px] font-semibold text-navy">{x.assumed}</p>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-navy/65">{x.basis}</p>
                    <p className="mt-1 text-[12.5px] text-navy/50">Affects: {x.affects}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {r.contradictions.length > 0 && (
            <div className="mt-4 rounded-xl border border-coral/30 bg-coral/5 p-4">
              <p className="mb-2 text-[12px] font-semibold tracking-wide text-coral uppercase">Your answers disagree with each other</p>
              <ul className="space-y-2.5">
                {r.contradictions.map((c) => (
                  <li key={c.id} className="text-[14px] leading-relaxed text-navy/75">{c.detail}</li>
                ))}
              </ul>
            </div>
          )}
          {r.primary.unscored.length > 0 && (
            <div className="mt-4 rounded-xl bg-off/70 p-4">
              <p className="mb-2 text-[12px] font-semibold tracking-wide text-navy/50 uppercase">Not scored, and not guessed</p>
              <ul className="space-y-2">
                {r.primary.unscored.map((u) => (
                  <li key={u.dimension} className="text-[13.5px] leading-relaxed text-navy/65">
                    <b className="font-semibold text-navy">{DIMENSION_LABELS[u.dimension]}.</b> {u.why}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <details className="mt-4 rounded-xl border border-navy/10 p-4">
            <summary className="cursor-pointer text-[14px] font-semibold text-navy">How the score was calculated</summary>
            <p className="mt-3 text-[13.5px] leading-relaxed text-navy/70">{r.methodology.scoreMeaning}</p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-navy/70">{r.methodology.dataSources}</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-[13.5px]">
                <thead><tr className="border-b border-navy/10 text-navy/50">
                  <th className="py-2 font-semibold">Dimension</th><th className="py-2 font-semibold">Weight for your goal</th>
                </tr></thead>
                <tbody>
                  {r.methodology.dimensions.map((d) => (
                    <tr key={d.key} className="border-b border-navy/5">
                      <td className="py-2 text-navy/75">{d.label}</td>
                      <td className="py-2 text-navy/60">&times;{d.weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-navy/55">
              Deal-size bands used: {VALUE_BANDS.map((b) => `${b.band} = ${b.label.replace(/^[A-Za-z ]+\(/, '').replace(/\)$/, '')}`).join('; ')}.
              These are this tool's own definitions, not market data.
            </p>
          </details>
        </Section>

        {/* 16. Next steps */}
        <Section kicker="What to do next" title="Recommended next steps">
          <ol className="space-y-3">
            {r.nextSteps.map((s, i) => (
              <li key={i} className="flex gap-3 text-[14.5px] leading-relaxed text-navy/75">
                <span aria-hidden="true" className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-teal/15 text-[12.5px] font-bold text-teal-dark">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </Section>
      </div>

      {/* Actions. Email sits here, after the entire report, and is optional. */}
      <div className="icp-noprint mt-10 border-t border-navy/10 pt-8">
        <div className="flex flex-wrap gap-3">
          <button type="button" className={btnGhost} onClick={copy}>{copied ? 'Copied' : 'Copy results'}</button>
          <button type="button" className={btnGhost} onClick={print}>Print or save as PDF</button>
          <button type="button" className={btnGhost} onClick={onRestart}>Start again</button>
        </div>
        <p aria-live="polite" className="sr-only">{copied ? 'Results copied to clipboard' : ''}</p>

        <form onSubmit={emailCopy} className="mt-6 rounded-2xl border border-navy/10 bg-off/60 p-5">
          <p className="font-display text-[15px] font-bold text-navy">Want a copy by email?</p>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-navy/65">
            Entirely optional. Your report is already complete above, and nothing here is hidden behind this.
          </p>
          <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
            <label className="sr-only" htmlFor="icp-email">Your email address</label>
            <input id="icp-email" type="email" className={`${field} sm:flex-1`} placeholder="you@company.com"
              value={email} onChange={(e) => { setEmail(e.target.value); setSendState('idle'); }} />
            <button type="submit" className={btnPrimary} disabled={sendState === 'sending'}>
              {sendState === 'sending' ? 'Sending' : 'Email it to me'}
            </button>
          </div>
          <p aria-live="polite" className="mt-2 text-[13px] leading-relaxed">
            {sendState === 'invalid' && <span className="text-coral">That does not look like a valid email address.</span>}
            {sendState === 'sent' && <span className="text-teal-dark">Sent. Check your inbox, and your spam folder if it is not there.</span>}
            {sendState === 'failed' && (
              <span className="text-navy/70">
                We could not send it just now. Nothing is lost: use Copy results or Print above, or{' '}
                <button type="button" className="font-semibold text-teal-dark underline"
                  onClick={() => mailtoFallback(`ICP Intelligence report: ${r.primary.name}`, plainText)}>
                  open it in your email app
                </button>.
              </span>
            )}
          </p>
        </form>

        <div className="mt-6 rounded-2xl border border-navy/10 bg-navy p-6 text-white sm:p-8">
          <p className="font-display text-[clamp(1.1rem,2.2vw,1.4rem)] leading-tight font-bold">
            Your ICP is defined. The harder part is building the acquisition around it.
          </p>
          <p className="mt-2.5 max-w-xl text-[14.5px] leading-relaxed text-white/75">
            If you want the channels, messaging and content above turned into something that actually runs, that is
            the work we do. Pricing is published, so you can check the numbers before you talk to anyone.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="/contact/" className={`${btn} bg-white text-navy hover:bg-teal hover:text-white`}
              onClick={() => trackEvent('icp_cta_clicked', { cta: 'contact' })}>Talk to Click.n.likes</a>
            <a href="/pricing/" className={`${btn} border-[1.5px] border-white/25 text-white hover:border-white`}
              onClick={() => trackEvent('icp_cta_clicked', { cta: 'pricing' })}>See our pricing</a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Plain-text version, used for copy, for the email body, and as the thing a
   screen reader user can grab in one go. */
function buildPlainText(r) {
  const L = [];
  const rule = () => L.push('', '-'.repeat(58), '');
  L.push('ICP INTELLIGENCE REPORT', `Generated by Click.n.likes, clicknlikes.com/tools/icp-intelligence/`);
  rule();
  L.push(`PRIMARY ICP: ${r.primary.name}`, `Alignment: ${r.primary.score}/100 (${r.primary.alignment})`,
    `Scored against your goal: ${r.generatedFor.goal}`, `Confidence: ${r.confidence.label}`, '', r.primary.summary);
  L.push('', 'This is an alignment score, not a prediction of who will buy.');
  rule();
  L.push('WHY THIS SEGMENT');
  r.primary.whyThis.forEach((w) => {
    L.push(`* ${w.dimension} (scored ${w.score}, weighted x${w.weight})`);
    w.reasons.forEach((x) => L.push(`    ${x.label}. ${x.detail}`));
  });
  if (r.primary.negatives.length) {
    L.push('', 'COUNTING AGAINST IT');
    r.primary.negatives.forEach((n) => L.push(`* ${n.label}. ${n.detail}`));
  }
  rule();
  L.push('WHAT WOULD CHANGE THIS');
  r.primary.whatWouldChangeThis.forEach((s) => L.push(`* ${s}`));
  rule();
  if (r.challenge && r.challenge.kind === 'conflicts') {
    L.push('YOUR ASSUMPTION, CHECKED', r.challenge.detail, '');
    r.challenge.weakest.forEach((w) => {
      L.push(`* ${DIMENSION_LABELS[w.dimension]}: ${w.statedScore} against ${w.topScore}`);
      w.reasons.forEach((x) => L.push(`    ${x.detail}`));
    });
    L.push('', r.challenge.caveat);
    rule();
  }
  L.push('THE BUYER');
  L.push(`Who: ${r.primary.buyer.who}`, `Authority: ${r.primary.buyer.seniority}`,
    `Responsible for: ${r.primary.buyer.responsibilities}`, `Evaluates on: ${r.primary.buyer.evaluates}`,
    `Information sources: ${r.primary.buyer.sources}`);
  rule();
  L.push('PAIN POINTS');
  r.primary.pains.forEach((p) => L.push(`* ${p}`));
  L.push('', 'BUYING TRIGGERS');
  r.primary.triggers.forEach((t) => L.push(`* ${t}`));
  L.push('', 'OBJECTIONS');
  r.primary.objections.forEach((o) => L.push(`* "${o.says}" -> ${o.means}`));
  rule();
  if (r.lowFit) {
    L.push(`LOW-FIT CUSTOMER PROFILE: ${r.lowFit.name} (${r.lowFit.score}/100)`);
    r.lowFit.whyLowFit.forEach((w) => L.push(`* ${w.label}. ${w.detail}`));
    rule();
  }
  L.push('ACQUISITION CHANNELS');
  r.channels.recommended.forEach((c) => L.push(`* ${c.name}${c.status === 'already-working' ? ' (already producing customers)' : ''}: ${c.why}`));
  if (r.channels.withheld.length) L.push('', `Not recommended yet (needs budget you do not have): ${r.channels.withheld.map((w) => w.name).join(', ')}`);
  rule();
  L.push('MESSAGING');
  L.push(`Lead with: ${r.messaging.primaryPain}`, `Outcome they want: ${r.messaging.desiredOutcome}`,
    `Positioning: ${r.messaging.positioning}`, `Angle: ${r.messaging.angle}`,
    `Offer: ${r.messaging.offerAngle}`, `CTA: ${r.messaging.cta}`);
  if (r.messaging.proofPoints.length) { L.push('', 'Proof needed:'); r.messaging.proofPoints.forEach((p) => L.push(`* ${p}`)); }
  rule();
  L.push('CONTENT');
  [['Awareness', r.content.awareness], ['Consideration', r.content.consideration], ['Decision', r.content.decision]]
    .forEach(([s, items]) => { L.push(`${s}:`); items.forEach((c) => L.push(`* ${c.topic} -- ${c.why}`)); L.push(''); });
  L.push('Search opportunities:'); r.content.seo.forEach((s) => L.push(`* ${s}`));
  rule();
  if (r.secondary) L.push(`SECONDARY ICP: ${r.secondary.name} (${r.secondary.score}/100) -- ${r.secondary.summary}`, '');
  if (r.expansion) L.push(`EXPANSION ICP: ${r.expansion.name} (${r.expansion.score}/100) -- ${r.expansion.summary}`, '');
  rule();
  L.push('CONFIDENCE AND ASSUMPTIONS', r.confidence.summary);
  if (r.assumptions.length) { L.push('', 'Assumptions:'); r.assumptions.forEach((x) => L.push(`* ${x.assumed} (${x.basis})`)); }
  if (r.contradictions.length) { L.push('', 'Contradictions in your answers:'); r.contradictions.forEach((c) => L.push(`* ${c.detail}`)); }
  rule();
  L.push('NEXT STEPS');
  r.nextSteps.forEach((s, i) => L.push(`${i + 1}. ${s}`));
  rule();
  L.push(r.methodology.dataSources);
  return L.join('\n');
}

/* ------------------------------------------------------------------ Shell */
export default function IcpIntelligence() {
  const [answers, setAnswers] = useState({ currency: 'INR' });
  const [stepIndex, setStepIndex] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [result, setResult] = useState(null);
  const [phase, setPhase] = useState('intro'); // intro | form | analysing | done
  const headingRef = useRef(null);
  const startedSteps = useRef(new Set());

  const step = steps[stepIndex];
  const fields = step ? visibleFields(step, answers) : [];
  const missing = step ? missingRequired(step, answers) : [];
  const progress = Math.round(((stepIndex) / steps.length) * 100);

  const set = (id, v) => setAnswers((prev) => ({ ...prev, [id]: v }));

  useEffect(() => {
    if (phase === 'form' && headingRef.current) headingRef.current.focus();
    if (phase === 'form' && step && !startedSteps.current.has(step.id)) {
      startedSteps.current.add(step.id);
      trackEvent('icp_step_started', { step: step.id, index: stepIndex + 1 });
    }
  }, [stepIndex, phase]);

  function begin() {
    setPhase('form');
    trackEvent('icp_tool_opened');
  }

  function next() {
    if (missing.length) { setShowErrors(true); return; }
    setShowErrors(false);
    trackEvent('icp_step_completed', { step: step.id, index: stepIndex + 1 });
    if (stepIndex < steps.length - 1) { setStepIndex(stepIndex + 1); return; }
    run();
  }

  function run() {
    setPhase('analysing');
    trackEvent('icp_tool_completed', { goal: answers.primaryGoal });
    // A short, honest pause: the work is instant, but a result that appears
    // in the same frame as the click reads as canned rather than computed.
    setTimeout(() => {
      const r = analyzeIcp(answers);
      setResult(r);
      setPhase('done');
      if (r.ok) {
        trackEvent('icp_generated', {
          primary_icp: r.primary.segmentId, score: r.primary.score,
          confidence: r.confidence.level, goal: answers.primaryGoal,
        });
      }
      requestAnimationFrame(() => headingRef.current && headingRef.current.focus());
    }, 700);
  }

  function restart() {
    setAnswers({ currency: 'INR' });
    setStepIndex(0);
    setResult(null);
    setShowErrors(false);
    startedSteps.current = new Set();
    setPhase('form');
  }

  if (phase === 'intro') {
    return (
      <div className={card}>
        <h2 className="font-display text-[clamp(1.25rem,2.6vw,1.7rem)] leading-tight font-bold text-navy">
          Find the customer segment your business should actually be targeting
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-navy/70">
          Nine short steps about how your business actually works: what you sell, what it earns, who already buys,
          what you can deliver, and what you are trying to achieve. The analysis then scores real customer segments
          against those answers and shows its working.
        </p>
        <ul className="mt-5 space-y-2.5">
          {[
            'It runs entirely in your browser. Nothing is sent anywhere to produce the result.',
            'Your results are not gated. Email is offered afterwards, only if you want a copy.',
            'Skip anything you do not track. Missing answers lower confidence, they do not block the analysis.',
            'It will disagree with you if your numbers point somewhere else than you expect.',
          ].map((t) => (
            <li key={t} className="flex gap-2.5 text-[14.5px] leading-relaxed text-navy/75">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <button type="button" className={`${btnPrimary} mt-6`} onClick={begin}>Find your ICP</button>
        <p className="mt-3 text-[13px] text-navy/50">Around 4 minutes. No account, no card, no call.</p>
      </div>
    );
  }

  if (phase === 'analysing') {
    return (
      <div className={`${card} text-center`} role="status" aria-live="polite">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-[3px] border-teal/25 border-t-teal" />
        <p className="mt-4 font-display text-[16px] font-bold text-navy">Scoring segments against your answers</p>
        <p className="mt-1.5 text-[14px] text-navy/60">Weighting every dimension against your objective.</p>
      </div>
    );
  }

  if (phase === 'done' && result) {
    if (!result.ok) {
      return (
        <div className={card}>
          <h2 tabIndex={-1} ref={headingRef} className="font-display text-lg font-bold text-navy">We could not complete the analysis</h2>
          <p className="mt-2 text-[14.5px] leading-relaxed text-navy/70">{result.message}</p>
          <button type="button" className={`${btnGhost} mt-5`} onClick={restart}>Go back and change your answers</button>
        </div>
      );
    }
    return (
      <div>
        <h2 tabIndex={-1} ref={headingRef} className="sr-only">Your ICP Intelligence report</h2>
        <Report result={result} answers={answers} onRestart={restart} />
      </div>
    );
  }

  return (
    <div className={card}>
      {/* Progress. Announced as text as well as drawn, so it is not colour-only. */}
      <div className="mb-6">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[12.5px] font-semibold tracking-wide text-navy/50 uppercase">
            Step {stepIndex + 1} of {steps.length}
          </p>
          <p className="text-[12.5px] text-navy/50">{progress}% complete</p>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-navy/10"
          role="progressbar" aria-valuenow={stepIndex + 1} aria-valuemin={1} aria-valuemax={steps.length}
          aria-label={`Step ${stepIndex + 1} of ${steps.length}`}>
          <div className="h-full rounded-full bg-teal transition-[width] duration-500" style={{ width: `${Math.max(progress, 4)}%` }} />
        </div>
      </div>

      <h2 tabIndex={-1} ref={headingRef} className="font-display text-[clamp(1.2rem,2.4vw,1.55rem)] leading-tight font-bold text-navy outline-none">
        {step.title}
      </h2>
      <p className="mt-2 text-[14.5px] leading-relaxed text-navy/65">{step.blurb}</p>

      <div className="mt-6 space-y-5">
        {fields.map((f) => <Field key={f.id} f={f} value={answers[f.id]} onChange={set} />)}
      </div>

      <p aria-live="polite" className="mt-4 text-[13.5px]">
        {showErrors && missing.length > 0 && (
          <span className="text-coral">
            Before continuing, answer: {missing.map((m) => m.label).join(', ')}.
          </span>
        )}
      </p>

      <div className="mt-6 flex flex-wrap gap-3 border-t border-navy/10 pt-6">
        <button type="button" className={btnGhost} onClick={() => { setShowErrors(false); setStepIndex(Math.max(0, stepIndex - 1)); }}
          disabled={stepIndex === 0}>Back</button>
        <button type="button" className={btnPrimary} onClick={next}>
          {stepIndex === steps.length - 1 ? 'Analyse my business' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
