import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { Headline } from '../components/Headline';
import { script } from '../data/script';
import { theme } from '../data/theme';
import { ramp, rampOut, OUT, BACK } from '../components/easing';

const s = script.scene7;

// The pace drops here on purpose. Everything before this was moving; the close
// stops, so the address has somewhere quiet to land and two full seconds to be
// read and typed.
export const Scene7CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const turnOut = rampOut(frame, 74, 12);
  const btnQ = ramp(frame, 80, 18, { easing: BACK });
  const urlQ = ramp(frame, 88, 16, { easing: OUT });
  const logoQ = ramp(frame, 94, 16, { easing: OUT });

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 84px' }}>
        <Headline lines={s.lines} start={2} exitAt={44} size={94} dir={1} />
      </AbsoluteFill>

      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 84px', opacity: turnOut }}>
        <Headline lines={s.turn} start={52} size={106} accent={1} dir={-1} />
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            background: theme.teal,
            color: theme.navy,
            fontFamily: theme.display,
            fontWeight: 700,
            fontSize: 56,
            letterSpacing: '-0.01em',
            padding: '38px 78px',
            borderRadius: 999,
            whiteSpace: 'nowrap',
            opacity: btnQ,
            transform: `translateY(${(1 - btnQ) * 60}px) scale(${0.86 + 0.14 * btnQ})`,
            boxShadow: '0 30px 80px rgba(78,205,196,0.36)',
          }}
        >
          {s.cta}
        </div>
        <div
          style={{
            marginTop: 42,
            fontFamily: theme.body,
            fontWeight: 700,
            fontSize: 48,
            color: 'rgba(255,255,255,0.92)',
            letterSpacing: '0.01em',
            opacity: urlQ,
            transform: `translateY(${(1 - urlQ) * 30}px)`,
          }}
        >
          {s.url}
        </div>
        <Img
          src={staticFile('logo-wordmark.png')}
          style={{
            marginTop: 92,
            height: 86,
            opacity: logoQ,
            transform: `translateY(${(1 - logoQ) * 24}px)`,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
