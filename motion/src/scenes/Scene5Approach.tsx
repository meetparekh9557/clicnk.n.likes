import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Headline } from '../components/Headline';
import { script } from '../data/script';
import { theme } from '../data/theme';
import { ramp, rampOut, OUT } from '../components/easing';

const s = script.scene5;
const b = s.beats;

// "We start with the problem" - then the six places a problem can hide, with
// the two flagged ones lighting up. It is a diagnosis, shown as one.
export const Scene5Approach: React.FC = () => {
  const frame = useCurrentFrame();
  const wordQ = ramp(frame, b.wordIn, 16, { easing: OUT });
  const ringIn = ramp(frame, b.gridIn, 22, { easing: OUT });
  const headOut = rampOut(frame, b.headOut, 14);
  const gridOut = rampOut(frame, b.gridOut, 12);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 84px' }}>
        <Headline lines={s.first} start={b.firstIn} exitAt={b.firstOut} size={100} dir={1} />
      </AbsoluteFill>

      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 84px', opacity: headOut }}>
        <div style={{ transform: 'translateY(-360px)' }}>
          <Headline lines={s.second} start={b.secondIn} size={98} dir={-1} />
          <div
            style={{
              fontFamily: theme.display, fontWeight: 700, fontSize: 128,
              color: theme.teal, letterSpacing: '-0.04em', lineHeight: 1,
              marginTop: 8,
              opacity: wordQ,
              transform: `translateY(${(1 - wordQ) * 90}px) scale(${0.9 + 0.1 * wordQ})`,
              textShadow: '0 22px 64px rgba(78,205,196,0.32)',
            }}
          >
            {s.accentWord}
          </div>
        </div>
      </AbsoluteFill>

      {/* The six areas, arranged around a centre. Flagged ones read as found. */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 980, height: 620, transform: 'translateY(300px)' }}>
          {s.areas.map((area, i) => {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const q = ramp(frame, b.gridIn + i * 3, 18, { easing: OUT });
            const flagged = (s.flagged as readonly number[]).includes(i);
            const pulse = flagged ? 0.5 + 0.5 * Math.sin((frame - b.gridIn) * 0.22) : 0;
            return (
              <div
                key={area}
                style={{
                  position: 'absolute',
                  left: col * 330,
                  top: row * 190,
                  width: 300,
                  padding: '30px 18px',
                  borderRadius: 20,
                  textAlign: 'center',
                  fontFamily: theme.display, fontWeight: 700, fontSize: 38,
                  letterSpacing: '0.01em',
                  color: flagged ? theme.navy : 'rgba(255,255,255,0.72)',
                  background: flagged
                    ? `rgba(78,205,196,${0.82 + 0.18 * pulse})`
                    : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${flagged ? theme.teal : 'rgba(255,255,255,0.16)'}`,
                  boxShadow: flagged ? `0 20px 54px rgba(78,205,196,${0.24 + 0.2 * pulse})` : 'none',
                  opacity: q * ringIn * gridOut,
                  transform: `translateY(${(1 - q) * 46}px) scale(${0.92 + 0.08 * q})`,
                }}
              >
                {area}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
