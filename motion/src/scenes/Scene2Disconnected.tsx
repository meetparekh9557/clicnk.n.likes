import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Rail } from '../components/Rail';
import { Headline } from '../components/Headline';
import { script } from '../data/script';
import { ramp } from '../components/easing';

const s = script.scene2;

// Five channels, all busy, all travelling on separate tracks that never meet.
// The rails keep moving under the copy - activity continues while the point
// lands, which is the point.
export const Scene2Disconnected: React.FC = () => {
  const frame = useCurrentFrame();
  // Rails dim as the copy arrives, so the type always wins the contrast fight.
  const dim = 1 - ramp(frame, 26, 18) * 0.62;

  return (
    <AbsoluteFill>
      <Rail items={s.chips} y={-620} speed={-7.5} scale={0.92} opacity={dim} />
      <Rail items={[...s.chips].reverse()} y={-430} speed={5.2} scale={0.8} opacity={dim * 0.8} />
      <Rail items={s.chips} y={520} speed={6.4} scale={0.86} opacity={dim * 0.9} />
      <Rail items={[...s.chips].reverse()} y={710} speed={-4.4} scale={0.74} opacity={dim * 0.7} />
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 84px' }}>
        <Headline lines={s.lines} start={26} exitAt={86} size={106} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
