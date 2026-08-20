import React from 'react';
import { Composition } from 'remotion';
import { GrowthAd, DURATION } from './compositions/GrowthAd';

// 1080x1920, 30fps, full bleed. No letterbox, no bars: every scene paints the
// entire canvas.
export const RemotionRoot: React.FC = () => (
  <Composition
    id="GrowthAd"
    component={GrowthAd}
    durationInFrames={DURATION}
    fps={30}
    width={1080}
    height={1920}
  />
);
