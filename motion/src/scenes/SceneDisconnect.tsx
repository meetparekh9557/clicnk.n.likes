import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { KineticHeadline } from '../components/KineticHeadline';
import { script } from '../data/script';
import { theme } from '../data/theme';
import { ramp, rampOut, OUT } from '../components/easing';

const s = script.scene2;

type Beats = { readonly [K: string]: number };

// THE ARGUMENT, ANIMATED.
//
// This is the one scene that has to do real work, so it is staged as a
// sequence rather than a slide, and it runs in four movements:
//
//   BUILD    five channels arrive from the edge they belong to, on springs,
//            staggered - so they read as being switched on one at a time.
//   CONNECT  teal links DRAW between them, stroke by stroke. For a moment the
//            system looks like it works. This beat is the whole setup: you
//            cannot feel something break unless you first watched it form.
//   BREAK    the links decay to dashed grey and an X punches onto each one,
//            over-shooting and settling. Staggered, so it reads as a cascade
//            rather than a single switch being thrown.
//   NAME IT  the warning draws itself at the centre the ring encloses, and
//            only then does the copy land - the words are the conclusion of
//            the animation, not its caption.
//
// The five cards match the static ad exactly, so the campaign reads as one
// system across formats.
const ICONS: Record<string, string> = {
  seo: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/>',
  ads: '<path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/><path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14"/>',
  content: '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  social: '<path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/><path d="M7 10v12"/>',
  website: '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M2 8h20"/>',
};

// x/y are on a 980x600 stage; `from` is the edge each card flies in from.
const CARDS = [
  { key: 'seo',     label: 'SEO',     x: 0,   y: 0,   w: 252, rot: -2.6, from: [-620, 0],  d: 0 },
  { key: 'ads',     label: 'ADS',     x: 372, y: -16, w: 236, rot: 1.9,  from: [0, -420],  d: 4 },
  { key: 'content', label: 'CONTENT', x: 726, y: 4,   w: 254, rot: -1.7, from: [640, 0],   d: 8 },
  { key: 'social',  label: 'SOCIAL',  x: 30,  y: 344, w: 252, rot: 2.3,  from: [-460, 300], d: 12 },
  { key: 'website', label: 'WEBSITE', x: 700, y: 356, w: 262, rot: -2.1, from: [520, 320], d: 16 },
];

// Every link, the frame its draw begins, and where its failure is marked.
const LINKS = [
  { d: 'M252 60 L372 44',            draw: 26, brk: [312, 52] },
  { d: 'M608 46 L726 66',            draw: 32, brk: [667, 56] },
  { d: 'M108 128 L142 344',          draw: 38, brk: [125, 236] },
  { d: 'M860 130 L840 356',          draw: 44, brk: [850, 243] },
  { d: 'M290 430 Q490 500 700 432',  draw: 50, brk: [492, 470] },
];

export const SceneDisconnect: React.FC<{ beats?: Beats; duration?: number }> = ({
  beats,
  duration = 150,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const copyIn = beats?.copyIn ?? 92;

  // The whole rig drifts a little the entire time, so nothing is ever truly
  // parked. Held graphics that stop dead look like a frozen render.
  const drift = interpolate(frame, [0, duration], [10, -14]);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: 'flex-start', padding: '346px 84px 0' }}>
        <KineticHeadline lines={s.lines} start={copyIn} size={78} />
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            position: 'relative',
            width: 980,
            height: 600,
            transform: `translateY(${104 + drift}px)`,
          }}
        >
          <svg viewBox="0 0 980 600" style={{ position: 'absolute', inset: 0, overflow: 'visible' }} fill="none">
            {LINKS.map((l, i) => {
              // CONNECT: the link draws itself in teal.
              const drawn = ramp(frame, l.draw, 20, { easing: OUT });
              // BREAK: it decays to a dashed grey remnant.
              const decay = ramp(frame, l.draw + 30, 14);
              return (
                <g key={i}>
                  <path
                    d={l.d}
                    pathLength={1}
                    stroke={theme.teal}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeDasharray={1}
                    strokeDashoffset={1 - drawn}
                    opacity={(1 - decay) * 0.95}
                    style={{ filter: 'drop-shadow(0 0 10px rgba(78,205,196,0.6))' }}
                  />
                  <path
                    d={l.d}
                    stroke="rgba(255,255,255,0.26)"
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    strokeDasharray="10 13"
                    opacity={decay}
                  />
                </g>
              );
            })}
          </svg>

          {CARDS.map((c) => {
            // BUILD: each card springs in from its own edge.
            const sp = spring({
              frame: frame - c.d,
              fps,
              config: { damping: 16, stiffness: 120, mass: 0.9 },
            });
            const tx = (1 - sp) * c.from[0];
            const ty = (1 - sp) * c.from[1];
            return (
              <div
                key={c.key}
                style={{
                  position: 'absolute',
                  left: c.x,
                  top: c.y,
                  width: c.w,
                  padding: '20px 22px 18px',
                  borderRadius: 20,
                  background:
                    'linear-gradient(150deg,rgba(255,255,255,0.10),rgba(255,255,255,0.045))',
                  border: '1.5px solid rgba(255,255,255,0.17)',
                  boxShadow: '0 26px 54px rgba(4,10,22,0.46)',
                  opacity: Math.min(1, sp * 1.8),
                  transform: `translate(${tx}px, ${ty}px) rotate(${c.rot * sp}deg) scale(${0.9 + 0.1 * sp})`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <svg
                    viewBox="0 0 24 24" width={30} height={30} fill="none" stroke={theme.teal}
                    strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                    dangerouslySetInnerHTML={{ __html: ICONS[c.key] }}
                  />
                  <span style={{ fontFamily: theme.display, fontWeight: 700, fontSize: 27, color: '#fff' }}>
                    {c.label}
                  </span>
                </div>
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ height: 8, width: '76%', borderRadius: 4, background: 'rgba(255,255,255,0.20)' }} />
                  <span style={{ height: 8, width: '52%', borderRadius: 4, background: 'rgba(255,255,255,0.20)' }} />
                </div>
              </div>
            );
          })}

          {/* BREAK: each X punches in on its own spring, staggered. */}
          {LINKS.map((l, i) => {
            const sp = spring({
              frame: frame - (l.draw + 34),
              fps,
              config: { damping: 9, stiffness: 190, mass: 0.6 },
            });
            return (
              <div
                key={`b${i}`}
                style={{
                  position: 'absolute',
                  left: l.brk[0],
                  top: l.brk[1],
                  width: 36,
                  height: 36,
                  margin: '-18px 0 0 -18px',
                  opacity: Math.min(1, sp * 2),
                  transform: `scale(${0.3 + 0.7 * sp}) rotate(${(1 - sp) * -50}deg)`,
                }}
              >
                <svg viewBox="0 0 24 24" width={36} height={36} fill="none" stroke={theme.coral}
                  strokeWidth={3.4} strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 12px rgba(255,71,87,0.6))' }}>
                  <path d="M5 5 19 19" /><path d="M19 5 5 19" />
                </svg>
              </div>
            );
          })}

          {/* NAME IT: the warning draws itself, then breathes. */}
          <Warning frame={frame} at={88} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Warning: React.FC<{ frame: number; at: number }> = ({ frame, at }) => {
  const draw = ramp(frame, at, 24, { easing: OUT });
  const pop = ramp(frame, at + 8, 16, { easing: OUT });
  // A slow pulse once it has arrived - a held alarm that is perfectly still
  // stops reading as an alarm.
  const pulse = 0.5 + 0.5 * Math.sin((frame - at) * 0.13);
  const letters = 'GROWTH GAP'.split('');

  return (
    <div
      style={{
        position: 'absolute',
        left: 490,
        top: 250,
        width: 340,
        margin: '-96px 0 0 -170px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <svg viewBox="0 0 24 24" width={82} height={82} fill="none" stroke={theme.coral}
        strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
        style={{
          filter: `drop-shadow(0 0 ${16 + 12 * pulse}px rgba(255,71,87,${0.45 + 0.25 * pulse}))`,
          transform: `scale(${0.72 + 0.28 * pop})`,
          opacity: pop,
        }}>
        <path
          d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
          pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw}
        />
        <path d="M12 9v4" opacity={pop} /><path d="M12 17h.01" opacity={pop} />
      </svg>
      <div style={{ display: 'flex', marginTop: 14 }}>
        {letters.map((ch, i) => {
          const q = ramp(frame, at + 16 + i * 1.8, 12, { easing: OUT });
          return (
            <span
              key={i}
              style={{
                fontFamily: theme.display,
                fontWeight: 700,
                fontSize: 36,
                letterSpacing: '0.10em',
                color: theme.coral,
                opacity: q,
                transform: `translateY(${(1 - q) * 16}px)`,
                whiteSpace: 'pre',
                textShadow: `0 8px 30px rgba(255,71,87,${0.30 + 0.2 * pulse})`,
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
    </div>
  );
};
