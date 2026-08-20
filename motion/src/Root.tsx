import React from 'react';
import { Composition } from 'remotion';
import { GrowthAd, DURATION } from './compositions/GrowthAd';
import { GrowthAdShort, SHORT_DURATION } from './compositions/GrowthAdShort';

// 1080x1920, 30fps, full bleed. No letterbox, no bars: every scene paints the
// entire canvas.
// GrowthAd     - the long cut (~39s), for retargeting and organic.
// GrowthAdShort - the cold-traffic cut (~14s), for the top of the Meta funnel.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="GrowthAd"
      component={GrowthAd}
      durationInFrames={DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="GrowthAdShort"
      component={GrowthAdShort}
      durationInFrames={SHORT_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);
