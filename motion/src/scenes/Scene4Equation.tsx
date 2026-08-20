import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { Headline } from '../components/Headline';
import { script } from '../data/script';
import { theme } from '../data/theme';
import { ramp, rampOut, BACK, OUT } from '../components/easing';

const s = script.scene4;

// The pattern interrupt. The two halves arrive from opposite sides and the
// inequality punches between them - the only overshoot in the film, saved for
// the one frame that has to stop a thumb.
export const Scene4Equation: React.FC = () => {
  const frame = useCurrentFrame();
  const topQ = ramp(frame, 0, 14, { easing: OUT });
  const botQ = ramp(frame, 6, 14, { easing: OUT });
  const symQ = ramp(frame, 16, 16, { easing: BACK });
  const eqOut = rampOut(frame, 42, 12);

  // Six loose points pulled to one centre as the closing line lands.
  const pull = ramp(frame, 52, 26, { easing: OUT });
  const dotsOut = rampOut(frame, 84, 10);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: eqOut }}>
        <div
          style={{
            fontFamily: theme.display, fontWeight: 700, fontSize: 96,
            color: theme.white, letterSpacing: '-0.035em',
            opacity: topQ, transform: `translateX(${(1 - topQ) * -260}px)`,
          }}
        >
          {s.top}
        </div>
        <div
          style={{
            fontFamily: theme.display, fontWeight: 700, fontSize: 190,
            color: theme.coral, lineHeight: 1, margin: '10px 0',
            opacity: symQ, transform: `scale(${0.4 + 0.6 * symQ})`,
            textShadow: '0 24px 70px rgba(255,71,87,0.45)',
          }}
        >
          {s.symbol}
        </div>
        <div
          style={{
            fontFamily: theme.display, fontWeight: 700, fontSize: 96,
            color: theme.white, letterSpacing: '-0.035em',
            opacity: botQ, transform: `translateX(${(1 - botQ) * 260}px)`,
          }}
        >
          {s.bottom}
        </div>
      </AbsoluteFill>

      {/* Scattered points converging - the visual argument for "find the gap". */}
      <AbsoluteFill style={{ opacity: (pull > 0 ? 1 : 0) * dotsOut }}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i / 6) * Math.PI * 2 + 0.4;
          const r = interpolate(pull, [0, 1], [700, 0]);
          return (
            <div
              key={i}
              style={{
                position: 'absolute', left: '50%', top: '50%',
                width: 20, height: 20, marginLeft: -10, marginTop: -10,
                borderRadius: '50%', background: theme.teal,
                transform: `translate(${Math.cos(a) * r}px, ${Math.sin(a) * r * 0.8}px)`,
                opacity: 0.35 + 0.65 * pull,
                boxShadow: `0 0 ${26 * pull}px rgba(78,205,196,0.8)`,
              }}
            />
          );
        })}
      </AbsoluteFill>

      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 84px' }}>
        <Headline lines={s.after} start={52} exitAt={86} size={102} accent={2} dir={1} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
