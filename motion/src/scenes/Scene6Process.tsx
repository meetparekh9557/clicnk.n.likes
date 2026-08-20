import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { UIPanel } from '../components/UIPanel';
import { script, ui } from '../data/script';
import { theme } from '../data/theme';
import { ramp, rampOut, OUT } from '../components/easing';

const s = script.scene6;
const EACH = Math.floor(s.durationInFrames / s.steps.length);

// Four steps, each one a real screen travelling across the frame under its
// label. Panels alternate direction so the eye is handed left-right-left and
// never has time to settle - that is the "continuous" the brief asks for.
const Step: React.FC<{ label: string; art: string; index: number }> = ({ label, art, index }) => {
  const frame = useCurrentFrame();
  const q = ramp(frame, 2, 13, { easing: OUT });
  const out = rampOut(frame, EACH - 11, 11);
  const flip = index % 2 === 1;

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <UIPanel
        src={ui(art)}
        x={flip ? -190 : 190}
        y={300}
        width={820}
        fromX={flip ? -1250 : 1250}
        start={0}
        len={24}
        rotate={flip ? -2 : 2}
        opacity={0.95}
        maxHeight={600}
      />
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 84px' }}>
        <div style={{ transform: 'translateY(-300px)' }}>
          <div
            style={{
              fontFamily: theme.body, fontWeight: 700, fontSize: 34,
              letterSpacing: '0.22em', color: theme.teal, marginBottom: 22,
              opacity: q,
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </div>
          <div
            style={{
              fontFamily: theme.display, fontWeight: 700, fontSize: 104,
              color: theme.white, letterSpacing: '-0.035em', lineHeight: 1.04,
              opacity: q,
              transform: `translateX(${(1 - q) * (flip ? 110 : -110)}px)`,
            }}
          >
            {label}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Scene6Process: React.FC = () => (
  <AbsoluteFill>
    {s.steps.map((st, i) => (
      <Sequence key={st.label} from={i * EACH} durationInFrames={EACH}>
        <Step label={st.label} art={st.art} index={i} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
