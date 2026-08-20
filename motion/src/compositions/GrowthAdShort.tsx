import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { Fonts } from '../components/Fonts';
import { Bg } from '../components/Bg';
import { BrandMark } from '../components/BrandMark';
import { Scene1Hook } from '../scenes/Scene1Hook';
import { Scene2Disconnected } from '../scenes/Scene2Disconnected';
import { Scene7CTA } from '../scenes/Scene7CTA';
import { shortCut } from '../data/script';
import { timing } from '../data/theme';

// The cold-traffic cut: ~14 seconds, three scenes, same components as the long
// film with the timings in `shortCut` instead of `script`.
//
// What was dropped and why: the four problem beats, the inequality and the
// four-step process are all *argument*. A stranger who did not choose you will
// not stay for an argument - they get the premise and the ask. The long cut is
// the retargeting and organic asset, for people who already clicked once.
const ORDER = [
  { node: <Scene1Hook beats={shortCut.scene1.beats} />, dur: shortCut.scene1.durationInFrames },
  {
    node: (
      <Scene2Disconnected
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
    <BrandMark fadeOutAt={MARK_FADE} />
  </AbsoluteFill>
);
