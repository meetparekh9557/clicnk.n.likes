import React from 'react';
import { Img, staticFile, useCurrentFrame } from 'remotion';
import { ramp, rampOut, OUT } from './easing';

// The wordmark, held top-left for the whole film so the brand is on screen
// even for a viewer who scrolls away after two seconds.
//
// It sits at y=206, not hard against the edge. Instagram's Reels and Stories
// chrome covers roughly the top 14% of a 1920-tall frame (~269px), so the mark
// is placed to clear the bottom of that band: high enough to read as a corner
// lockup on Facebook feed, low enough to survive the Reels overlay.
//
// It fades out before the closing scene raises its own large wordmark - two of
// the same mark on screen at once reads as a mistake, not as branding.
export const BrandMark: React.FC<{ fadeOutAt: number }> = ({ fadeOutAt }) => {
  const frame = useCurrentFrame();
  const inQ = ramp(frame, 6, 20, { easing: OUT });
  const outQ = rampOut(frame, fadeOutAt, 14);

  return (
    <div
      style={{
        position: 'absolute',
        left: 72,
        top: 206,
        display: 'flex',
        alignItems: 'center',
        opacity: inQ * outQ,
        transform: `translateY(${(1 - inQ) * -16}px)`,
      }}
    >
      <Img src={staticFile('logo-wordmark.png')} style={{ height: 54, display: 'block' }} />
    </div>
  );
};
