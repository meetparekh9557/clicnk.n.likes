// AI-search visibility check. The buyer's real question goes to a real LLM
// this session, and we report the verbatim answer plus whether the business
// was named in it. This is deliberately honest about its own limits: it is
// ONE query at ONE moment, and AI answers vary between runs and engines, so
// we never sell it as a fixed "ranking" - we show exactly what the model
// said and let the founder read it. Email-gated like every tool; degrades
// to an honest "coming soon" until the backend AI key is set.
import { useState } from 'react';
import {
  OWNER_EMAIL,
  fetchAiVisibility,
  buildReportEmailHtml,
  sendFromClicknlikes,
  fact,
} from '../../lib/engine';

const STEPS = [
  'Sending your buyer’s question to the AI, verbatim…',
  'Reading the full answer back…',
  'Checking whether your business was named…',
];

export default function AiVisibilityCheck({ toolsHref }) {
  const [query, setQuery] = useState('');
  const [brand, setBrand] = useState('');
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | asking | done | failed | soon
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);

  async function run(evt) {
    evt.preventDefault();
    if (phase === 'asking') return;
    setPhase('asking');
    setStep(0);
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 1400);
    const r = await fetchAiVisibility(query, brand);
    clearInterval(timer);

    if (!r.available) {
      if (r.reason === 'not_configured' || r.reason === 'bad_request') { setPhase('soon'); return; }
      sendFromClicknlikes({
        toEmail: OWNER_EMAIL, replyTo: email,
        subject: `🔔 New AI-visibility lead: ${email}`,
        bodyText: `New AI-visibility lead:\n\nEmail: ${email}\nBrand: ${brand}\nQuery: ${query}\nResult: AI call FAILED (${r.reason}).`,
      });
      setPhase('failed');
      return;
    }

    const mentioned = r.mentioned === true;
    const modelLabel = `${r.provider === 'openai' ? 'OpenAI' : 'Anthropic'} (${r.model})`;
    const interpretation = mentioned
      ? `Your business WAS named when we asked ${modelLabel} "${query}" just now. That is real AI-search visibility, but it is one answer at one moment: AI engines vary run to run, so the job is to be cited consistently, everywhere, not just this once.`
      : `Your business was NOT named when we asked ${modelLabel} "${query}" just now. Today, buyers ask an AI this exact kind of question and act on the names it gives back. If you are not in the answer, you are invisible at the moment of decision, and that is fixable with content structured to be quoted.`;

    const factors = [
      fact('Question asked (verbatim)', query, 'verified', 'the buyer’s real query'),
      fact('AI engine', modelLabel, 'verified', 'asked live this session'),
      fact('Your business named?', mentioned ? 'YES - you appeared in the answer' : 'NO - you were absent from the answer', 'verified', mentioned ? 'cited' : 'not cited'),
    ];
    const nextSteps = mentioned
      ? [
          'Lock in the citation: keep the pages the AI is drawing from answer-first, factual and schema-marked so you stay in the answer as models update.',
          'Expand coverage: repeat this for every buyer question and every city you serve. Being named for one query is not the same as owning the category.',
          'Add first-hand proof (data, named authors, real cases): models increasingly favour content with genuine expertise signals.',
        ]
      : [
          'Publish an answer-first page for this exact question: lead with a direct, quotable answer in the first two sentences, then the detail.',
          'Add structured data (FAQ, Organization/LocalBusiness) so AI engines can parse and trust who you are and what you do.',
          'Build citable proof: original data, named experts and clear entity signals are what get a brand pulled into AI answers.',
        ];

    const answerText = r.answer || '';
    const bodyText = `Hi,\n\nYour AI-search visibility check:\n\nWe asked ${modelLabel} this exact question just now:\n"${query}"\n\nYour business (${brand || 'your brand'}) was ${mentioned ? 'NAMED ✅' : 'NOT named ❌'} in the answer.\n\n${interpretation}\n\n--- The AI's full answer ---\n${answerText}\n---\n\nYour next steps:\n${nextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nWant to be the name AI recommends in your category? Reply to this email or grab a quote at clicknlikes.com.\n\nBest,\nClick.n.likes\nbusiness@clicknlikes.com`;
    const bodyHtml = buildReportEmailHtml({
      toolLabel: 'AI-Search Visibility Check',
      forLine: `Asked ${modelLabel} · ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      scoreDisplay: mentioned ? 'Named ✅' : 'Not named ❌',
      indexLabel: 'Were you in the AI answer?',
      interpretation,
      liveNote: `Asked ${modelLabel} "${query}" live this session`,
      factors,
      nextSteps,
    });
    sendFromClicknlikes({ toEmail: email, subject: mentioned ? 'You showed up in the AI answer ✅' : 'You were missing from the AI answer', bodyText, bodyHtml });
    sendFromClicknlikes({
      toEmail: OWNER_EMAIL, replyTo: email,
      subject: `🔔 New AI-visibility lead: ${email} (${mentioned ? 'named' : 'NOT named'})`,
      bodyText: `New AI-visibility lead:\n\nEmail: ${email}\nBrand: ${brand}\nQuery: ${query}\nModel: ${modelLabel}\nNamed: ${mentioned ? 'YES' : 'NO'}\n\nAnswer:\n${answerText}`,
    });
    setResult({ mentioned, answer: answerText, brand, modelLabel });
    setPhase('done');
  }

  if (phase === 'done' && result) {
    const { mentioned, answer, brand: b, modelLabel } = result;
    // Highlight the brand inside the verbatim answer.
    let html = answer.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    if (b) {
      const esc = b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp(esc, 'gi'), (m) => `<mark class="bg-teal/30 text-navy rounded px-0.5">${m}</mark>`);
    }
    return (
      <div className="rounded-2xl border border-teal/40 bg-white p-6 shadow-[0_18px_44px_rgba(26,43,74,0.10)] sm:p-8">
        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${mentioned ? 'bg-teal/10 text-teal-dark' : 'bg-coral/10 text-coral'}`}>
          {mentioned ? '✅ You were named in the AI answer' : '❌ You were NOT named in the AI answer'}
        </div>
        <p className="mt-4 text-sm text-navy/75">
          We asked <b>{modelLabel}</b> your question live. Here is its full answer{b ? <>, with <mark className="bg-teal/30 rounded px-0.5">{b}</mark> highlighted</> : ''}:
        </p>
        <div
          className="mt-3 max-h-72 overflow-y-auto rounded-xl border border-navy/10 bg-off/60 p-4 text-sm leading-relaxed text-navy/80 whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <p className="mt-4 text-xs text-navy/60">
          This is one AI, one question, one moment: answers vary between engines and over time. That is exactly why consistent AI-search presence is work, not luck.
        </p>
        <p className="mt-2 text-xs text-teal-dark">✓ Your full report and the verbatim answer were emailed to {email}.</p>
      </div>
    );
  }

  return (
    <form onSubmit={run} aria-label="AI-search visibility check">
      <div className="grid gap-3">
        <input
          type="text" required value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="What would your customer ask? e.g. best SEO agency in Ahmedabad"
          aria-label="The question your customer would ask an AI"
          className="w-full rounded-[12px] border-[1.5px] border-teal/40 bg-teal/5 px-5 py-3.5 text-sm text-navy outline-none transition-colors focus:border-teal"
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text" required value={brand} onChange={(e) => setBrand(e.target.value)}
            placeholder="Your business name" aria-label="Your business name"
            className="w-full rounded-full border-[1.5px] border-navy/15 bg-white px-5 py-3.5 text-sm text-navy outline-none transition-colors focus:border-teal sm:flex-1"
          />
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@business.com" aria-label="Your email (your full report is sent here)"
            className="w-full rounded-full border-[1.5px] border-navy/15 bg-white px-5 py-3.5 text-sm text-navy outline-none transition-colors focus:border-teal sm:flex-1"
          />
        </div>
        <button
          type="submit" disabled={phase === 'asking'}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-coral disabled:opacity-60"
        >
          {phase === 'asking' ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
              Asking the AI…
            </>
          ) : 'Check if AI names me'}
        </button>
      </div>
      {phase === 'asking' && (
        <p className="mt-3 text-sm text-teal-dark" role="status" aria-live="polite">{STEPS[step]}</p>
      )}
      {phase === 'soon' && (
        <p className="mt-3 text-sm text-navy/70" role="status">
          Our live AI-search check is being switched on. In the meantime, the{' '}
          <a href={toolsHref} className="text-teal-dark underline">Website Health scan</a> runs a real live check of your page right now.
        </p>
      )}
      {phase === 'failed' && (
        <p className="mt-3 text-sm text-navy/70" role="status">
          The AI didn't answer just now, and we never fake a result. Please try again in a moment.
        </p>
      )}
      {phase !== 'asking' && phase !== 'failed' && phase !== 'soon' && (
        <p className="mt-3 text-xs text-navy/60">
          We ask a real AI your customer's question live and show you the verbatim answer, and whether you were in it. One honest snapshot, emailed in full.
        </p>
      )}
    </form>
  );
}
