import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Rail } from '../components/Rail';
import { Headline } from '../components/Headline';
import { script } from '../data/script';
import { ramp, rampOut } from '../components/easing';

const s = script.scene2;

type Beats = { readonly [K in keyof typeof script.scene2.beats]: number };

// Five channels, all busy, all travelling on separate tracks that never meet.
// The rails keep moving under the copy - activity continues while the point
// lands, which is the point.
export const Scene2Disconnected: React.FC<{ beats?: Beats; duration?: number }> = ({
  beats,
  duration = script.scene2.durationInFrames,
}) => {
  const b = beats ?? s.beats;
  const frame = useCurrentFrame();
  // Rails dim as the copy arrives, so the type always wins the contrast fight.
  // They then fade out over the hand-off - without this the Sequence simply
  // ends and a row of faint chips disappears on a hard cut.
  const dim = (1 - ramp(frame, b.dimAt, 18) * 0.62) * rampOut(frame, duration - 16, 16);

  return (
    <AbsoluteFill>
      <Rail items={s.chips} y={-620} speed={-7.5} scale={0.92} opacity={dim} />
      <Rail items={[...s.chips].reverse()} y={-430} speed={5.2} scale={0.8} opacity={dim * 0.8} />
      <Rail items={s.chips} y={520} speed={6.4} scale={0.86} opacity={dim * 0.9} />
      <Rail items={[...s.chips].reverse()} y={710} speed={-4.4} scale={0.74} opacity={dim * 0.7} />
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 84px' }}>
        <Headline lines={s.lines} start={b.copyIn} exitAt={b.copyOut} size={106} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
