import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { KineticHeadline } from '../components/KineticHeadline';
import { script } from '../data/script';
import { theme } from '../data/theme';
import { ramp, rampOut, OUT } from '../components/easing';

const s = script.scene7;

type Beats = { readonly [K in keyof typeof script.scene7.beats]: number };

// The pace drops here on purpose. Everything before this was moving; the close
// stops, so the address has somewhere quiet to land and two full seconds to be
// read and typed.
// `showLines` drops the four-line build-up. The long cut earns it; the short
// cut opens straight on the turn.
export const Scene7CTA: React.FC<{ beats?: Beats; showLines?: boolean }> = ({
  beats,
  showLines = true,
}) => {
  const b = beats ?? s.beats;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const turnOut = rampOut(frame, b.turnOut, 12);
  // A spring rather than an ease: the button dips, overshoots and settles, so
  // the final object in the film arrives with weight instead of fading up.
  const btnQ = spring({
    frame: frame - b.btnIn,
    fps,
    config: { damping: 11, stiffness: 150, mass: 0.8 },
  });
  const logoQ = ramp(frame, b.logoIn, 16, { easing: OUT });

  return (
    <AbsoluteFill>
      {showLines ? (
        <AbsoluteFill style={{ justifyContent: 'center', padding: '0 84px' }}>
          <KineticHeadline lines={s.lines} start={b.linesIn} exitAt={b.linesOut} size={94} dir={1} />
        </AbsoluteFill>
      ) : null}

      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 84px', opacity: turnOut }}>
        <KineticHeadline lines={s.turn} start={b.turnIn} size={106} accent={1} dir={-1} />
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 26,
            background: theme.teal,
            color: theme.navy,
            fontFamily: theme.display,
            fontWeight: 700,
            fontSize: 52,
            letterSpacing: '-0.01em',
            padding: '30px 62px 30px 34px',
            borderRadius: 999,
            whiteSpace: 'nowrap',
            opacity: Math.min(1, btnQ * 2),
            transform: `translateY(${(1 - btnQ) * 70}px) scale(${0.84 + 0.16 * btnQ})`,
            boxShadow: '0 30px 80px rgba(78,205,196,0.36)',
          }}
        >
          <span
            style={{
              width: 62, height: 62, borderRadius: '50%', background: theme.navy,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
            }}
          >
            <svg viewBox="0 0 24 24" width={30} height={30} fill="none" stroke={theme.teal}
              strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: `translateX(${(1 - btnQ) * -10}px)` }}>
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </span>
          {s.cta}
        </div>
        <Img
          src={staticFile('logo-wordmark.png')}
          style={{
            marginTop: 78,
            height: 86,
            opacity: logoQ,
            transform: `translateY(${(1 - logoQ) * 24}px)`,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
