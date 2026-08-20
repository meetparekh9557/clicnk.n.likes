import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { Fonts } from '../components/Fonts';
import { Bg } from '../components/Bg';
import { BrandMark } from '../components/BrandMark';
import { Sweep } from '../components/Sweep';
import { Scene1Hook } from '../scenes/Scene1Hook';
import { SceneDisconnect } from '../scenes/SceneDisconnect';
import { Scene7CTA } from '../scenes/Scene7CTA';
import { shortCut } from '../data/script';
import { timing } from '../data/theme';

// The cold-traffic cut: ~14.5 seconds. Premise, argument, ask.
//
// The middle scene is the one carrying the weight - five channels switch on,
// links draw between them, the links break, and the gap gets named. The copy
// arrives as the conclusion of that animation rather than as its caption.
//
// Scene changes are handed over by a Sweep rather than a crossfade: a shape
// with direction and weight crosses the frame, which reads as "this became
// that" instead of "two things happened".
const ORDER = [
  { node: <Scene1Hook beats={shortCut.scene1.beats} />, dur: shortCut.scene1.durationInFrames },
  {
    node: (
      <SceneDisconnect
        beats={shortCut.scene2.beats}
        duration={shortCut.scene2.durationInFrames}
      />
    ),
    dur: shortCut.scene2.durationInFrames,
  },
  {
    node: <Scene7CTA beats={shortCut.scene7.beats} showLines={shortCut.scene7.showLines} />,
    dur: shortCut.scene7.durationInFrames,
  },
];

const STARTS = ORDER.reduce<number[]>((acc, _, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + ORDER[i - 1].dur - timing.overlap);
  return acc;
}, []);

export const SHORT_DURATION =
  ORDER.reduce((n, s) => n + s.dur, 0) - timing.overlap * (ORDER.length - 1);

const MARK_FADE = STARTS[ORDER.length - 1] + shortCut.scene7.beats.logoIn - 26;

export const GrowthAdShort: React.FC = () => (
  <AbsoluteFill>
    <Fonts />
    <Bg totalFrames={SHORT_DURATION} />
    {ORDER.map(({ node, dur }, i) => (
      <Sequence
        key={i}
        from={STARTS[i]}
        durationInFrames={dur + (i === ORDER.length - 1 ? 0 : timing.overlap)}
      >
        {node}
      </Sequence>
    ))}
    {/* The band travels one way into the argument and the other way out of it,
        so the film has a shape rather than a direction. */}
    <Sweep at={STARTS[1] - 10} len={20} />
    <Sweep at={STARTS[2] - 10} len={20} flip />
    <BrandMark fadeOutAt={MARK_FADE} />
  </AbsoluteFill>
);
