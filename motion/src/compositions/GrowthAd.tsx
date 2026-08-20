import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { Fonts } from '../components/Fonts';
import { Bg } from '../components/Bg';
import { Scene1Hook } from '../scenes/Scene1Hook';
import { Scene2Disconnected } from '../scenes/Scene2Disconnected';
import { Scene3Problems } from '../scenes/Scene3Problems';
import { Scene4Equation } from '../scenes/Scene4Equation';
import { Scene5Approach } from '../scenes/Scene5Approach';
import { Scene6Process } from '../scenes/Scene6Process';
import { Scene7CTA } from '../scenes/Scene7CTA';
import { script } from '../data/script';
import { timing } from '../data/theme';

// Scene order and length live here. Add, remove or reorder a row and the whole
// film re-times itself - nothing downstream hardcodes a frame number.
const ORDER = [
  { Comp: Scene1Hook, dur: script.scene1.durationInFrames },
  { Comp: Scene2Disconnected, dur: script.scene2.durationInFrames },
  { Comp: Scene3Problems, dur: script.scene3.durationInFrames },
  { Comp: Scene4Equation, dur: script.scene4.durationInFrames },
  { Comp: Scene5Approach, dur: script.scene5.durationInFrames },
  { Comp: Scene6Process, dur: script.scene6.durationInFrames },
  { Comp: Scene7CTA, dur: script.scene7.durationInFrames },
];

// Each scene starts a few frames before the previous one has finished leaving,
// so the seam is a hand-off rather than a cut. This is the single biggest
// reason the result reads as one sequence instead of a slideshow.
export const SCENE_STARTS = ORDER.reduce<number[]>((acc, _, i) => {
  const prev = i === 0 ? 0 : acc[i - 1] + ORDER[i - 1].dur - timing.overlap;
  acc.push(i === 0 ? 0 : prev);
  return acc;
}, []);

export const DURATION =
  ORDER.reduce((n, s) => n + s.dur, 0) - timing.overlap * (ORDER.length - 1);

export const GrowthAd: React.FC = () => (
  <AbsoluteFill>
    <Fonts />
    <Bg totalFrames={DURATION} />
    {ORDER.map(({ Comp, dur }, i) => (
      <Sequence
        key={i}
        from={SCENE_STARTS[i]}
        durationInFrames={dur + (i === ORDER.length - 1 ? 0 : timing.overlap)}
      >
        <Comp />
      </Sequence>
    ))}
  </AbsoluteFill>
);
