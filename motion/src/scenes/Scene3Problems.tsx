import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { UIPanel } from '../components/UIPanel';
import { script, ui } from '../data/script';
import { theme } from '../data/theme';
import { ramp, rampOut, OUT } from '../components/easing';

const s = script.scene3;
const EACH = Math.floor(s.durationInFrames / s.pairs.length);

// Setup line, then the turn. The panel slides in on the setup and slides out
// under the payoff, so the UI is always moving while the sentence completes.
const Pair: React.FC<{ setup: string; payoff: string; art: string; flip: boolean }> = ({
  setup, payoff, art, flip,
}) => {
  const frame = useCurrentFrame();
  const out = rampOut(frame, EACH - 9, 9);
  const setupQ = ramp(frame, 0, 12, { easing: OUT });
  const payoffQ = ramp(frame, 15, 14, { easing: OUT });

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <UIPanel
        src={ui(art)}
        x={flip ? 250 : -250}
        y={330}
        width={760}
        fromX={flip ? 1100 : -1100}
        start={4}
        len={26}
        rotate={flip ? 2.5 : -2.5}
        opacity={0.92}
        maxHeight={620}
      />
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 84px' }}>
        <div style={{ transform: `translateY(${-260}px)` }}>
          <div
            style={{
              fontFamily: theme.display,
              fontWeight: 500,
              fontSize: 74,
              color: 'rgba(255,255,255,0.62)',
              letterSpacing: '-0.02em',
              opacity: setupQ,
              transform: `translateX(${(1 - setupQ) * -70}px)`,
            }}
          >
            {setup}
          </div>
          <div
            style={{
              fontFamily: theme.display,
              fontWeight: 700,
              fontSize: 92,
              color: theme.white,
              letterSpacing: '-0.035em',
              lineHeight: 1.06,
              marginTop: 18,
              maxWidth: 900,
              opacity: payoffQ,
              transform: `translateX(${(1 - payoffQ) * 90}px)`,
            }}
          >
            {payoff}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Scene3Problems: React.FC = () => (
  <AbsoluteFill>
    {s.pairs.map((p, i) => (
      <Sequence key={p.setup} from={i * EACH} durationInFrames={EACH}>
        <Pair {...p} flip={i % 2 === 1} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
