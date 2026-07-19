// Competitor Threat Estimator. Fixed weighted matrix ported verbatim from
// v1 (runCompetitorQuiz): publishing 30, ads 40, website 30, max 100, no
// pre-selected answers so an untouched form cannot submit. On-screen badge
// + summary are deterministic from the three answers; an optional email
// unlocks the full report + counter-moves, sent via the shared engine.
import { useState } from 'react';
import { OWNER_EMAIL, autoEmailReady, sendFromClicknlikes, buildReportEmailHtml, fact } from '../../lib/engine';

const QUESTIONS = [
  {
    name: 'cq1', title: 'How often does your main competitor publish content or post on social?',
    options: [{ v: 30, label: 'Daily' }, { v: 15, label: 'Weekly' }, { v: 0, label: 'Rarely' }],
  },
  {
    name: 'cq2', title: 'Are they running paid ads (Google or Meta) right now?',
    options: [{ v: 40, label: 'Yes, constantly' }, { v: 20, label: 'Occasionally' }, { v: 0, label: 'Never' }],
  },
  {
    name: 'cq3', title: 'How does their website compare to yours?',
    options: [{ v: 30, label: 'Much faster / better' }, { v: 15, label: 'About the same' }, { v: 0, label: 'Slower / worse' }],
  },
];

export default function CompetitorThreat() {
  const [answers, setAnswers] = useState({});
  const [industry, setIndustry] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  function submit(evt) {
    evt.preventDefault();
    if ([QUESTIONS[0], QUESTIONS[1], QUESTIONS[2]].some((q) => answers[q.name] === undefined)) {
      setError('Answer all three questions first: the score only means something if it reflects real answers.');
      return;
    }
    setError('');
    const points = answers.cq1 + answers.cq2 + answers.cq3;
    let status, tone, summary;
    if (points >= 80) {
      status = 'Market Dominator'; tone = 'coral';
      summary = `Status: Market Dominator. Your competitor's digital footprint scores ${points}/100 on our weighted matrix. To close this gap you need an aggressive, sustained counter-strategy across content and paid.`;
    } else if (points >= 40) {
      status = 'Rising Threat'; tone = 'amber';
      summary = `Status: Rising Threat. Your competitor is building momentum but hasn't run away with the category yet. This is the window to close the gap before it becomes expensive.`;
    } else {
      status = 'Vulnerable'; tone = 'teal';
      summary = `Status: Vulnerable. Your competitor's digital presence is weak right now. A focused organic push could let you take the category lead.`;
    }

    if (email) {
      const q1Label = { 30: 'Daily', 15: 'Weekly', 0: 'Rarely' }[answers.cq1];
      const q2Label = { 40: 'Yes, constantly', 20: 'Occasionally', 0: 'Never' }[answers.cq2];
      const q3Label = { 30: 'Much faster', 15: 'About the same', 0: 'Slower' }[answers.cq3];
      const factors = [
        fact('Competitor publishing frequency', q1Label, 'self', `+${answers.cq1} of 30 pts`),
        fact('Competitor paid ads presence', q2Label, 'self', `+${answers.cq2} of 40 pts`),
        fact('Competitor website vs. yours', q3Label, 'self', `+${answers.cq3} of 30 pts`),
      ];
      const nextSteps = [];
      nextSteps.push(answers.cq1 >= 15
        ? 'Match their publishing rhythm strategically, not volume-for-volume: one deeply useful piece per week in your niche beats their daily generic posts within 3-4 months.'
        : 'They barely publish: this is an open goal. A consistent weekly content cadence could make you the category authority before they notice.');
      nextSteps.push(answers.cq2 >= 20
        ? "They're buying attention: don't out-spend them, out-rank them. Their ad spend stops working the day they pause it, your organic rankings don't."
        : "They're not running ads: organic plus a small, precise paid budget would give you share of voice they aren't contesting.");
      nextSteps.push(answers.cq3 >= 15
        ? 'Their faster site is silently winning ties: when a searcher opens both of you, the faster, cleaner site gets the enquiry. A speed-focused rebuild pays back in weeks.'
        : 'Your site is at least as good as theirs: press the advantage with conversion polish (clear CTA, trust signals) so head-to-head visits break your way.');
      nextSteps.push(`Run our free Website Health scan on your own site next: knowing your competitor's threat level matters most when you know your own numbers${industry ? ' in ' + industry : ''}.`);

      const interpretation = `${points}/100 on a fixed weighted matrix (publishing 30, ads 40, website 30). ${points >= 80 ? 'A dominator score means every month of waiting raises the cost of catching up.' : points >= 40 ? 'A rising threat is the cheapest moment to respond: the gap is real but still closeable with focused organic work.' : 'A vulnerable competitor is an opportunity: the category lead is available to whoever moves first.'}`;
      const bodyText = `Hi,\n\nHere is your Competitor Threat report from Click.n.likes:\n\n${summary}\n\nHow their ${points}/100 was scored:\n${factors.map((f) => `• ${f.name}: ${f.found} (${f.impact})`).join('\n')}\n\nYour counter-moves:\n${nextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nWant the 90-day organic framework built for ${industry || 'your industry'}? Reply to this email or grab a quote at clicknlikes.com.\n\nBest,\nClick.n.likes\nbusiness@clicknlikes.com`;
      const bodyHtml = buildReportEmailHtml({
        toolLabel: 'Competitor Threat Estimator',
        forLine: `${industry ? 'Industry: ' + industry + ' · ' : ''}${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
        scoreDisplay: `${points}/100`, indexLabel: `Threat level: ${status}`, interpretation, liveNote: null, factors, nextSteps,
      });
      sendFromClicknlikes({ toEmail: email, subject: `Your Competitor Threat report: ${status}`, bodyText, bodyHtml });
      sendFromClicknlikes({
        toEmail: OWNER_EMAIL, replyTo: email,
        subject: `New Competitor Quiz lead: ${email}`,
        bodyText: `New Competitor Threat Estimator lead:\n\nProspect Industry: ${industry || 'Not specified'}\nEmail: ${email}\nScore: ${points}/100\nStatus: ${status}\nAnswers: publishing=${q1Label}, ads=${q2Label}, website=${q3Label}`,
      });
    }
    setResult({ points, status, tone, summary, emailed: !!email });
  }

  const toneCls = { coral: 'bg-coral/10 text-coral', amber: 'bg-amber-400/15 text-amber-600', teal: 'bg-teal/15 text-teal-dark' };

  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-[0_10px_30px_rgba(26,43,74,0.06)] sm:p-8">
      <form onSubmit={submit} className="space-y-6">
        {QUESTIONS.map((q, qi) => (
          <fieldset key={q.name}>
            <legend className="text-[14px] font-semibold text-navy">{qi + 1}. {q.title}</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {q.options.map((o) => {
                const selected = answers[q.name] === o.v;
                return (
                  <label key={o.label} className={`flex cursor-pointer items-center gap-2 rounded-xl border-[1.5px] px-4 py-3 text-[13.5px] font-medium transition-colors ${selected ? 'border-teal bg-teal/10 text-navy' : 'border-navy/10 text-navy/70 hover:border-teal/40'}`}>
                    <input type="radio" name={q.name} value={o.v} checked={selected} onChange={() => setAnswers((a) => ({ ...a, [q.name]: o.v }))} className="accent-teal" />
                    {o.label}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}

        <div className="grid gap-3 sm:grid-cols-2">
          <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Your industry (optional)" className="rounded-[10px] border-[1.5px] border-navy/10 bg-white px-4 py-3 text-sm outline-none focus:border-teal" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email for the full report (optional)" aria-label="Your email" className="rounded-[10px] border-[1.5px] border-navy/10 bg-white px-4 py-3 text-sm outline-none focus:border-teal" />
        </div>

        {error && <p className="text-sm font-medium text-coral">{error}</p>}

        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-coral">
          Score my competitor
        </button>
      </form>

      {result && (
        <div className="mt-7 border-t border-navy/10 pt-6">
          <span className={`inline-block rounded-full px-4 py-1.5 text-sm font-bold ${toneCls[result.tone]}`}>{result.status}: {result.points}/100</span>
          <p className="mt-3 text-[15px] leading-relaxed text-navy/75">{result.summary}</p>
          <p className="mt-3 text-[13px] text-navy/55">
            {result.emailed
              ? (autoEmailReady ? <>✓ Full report and counter-moves emailed to <b>{email}</b>.</> : 'Your details are logged with us and a strategist will follow up.')
              : <>Scored from your answers with a fixed weighted matrix (max 100), not scraped competitor data. Add your email above to get the full counter-move plan.</>}
          </p>
        </div>
      )}
    </div>
  );
}
