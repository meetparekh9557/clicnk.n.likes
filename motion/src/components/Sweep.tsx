import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { theme } from '../data/theme';
import { OUT, IN_OUT } from './easing';

// The transition device: a slanted band that crosses the frame and hands one
// scene to the next.
//
// A crossfade says "two things happened". A shape travelling through the frame
// says "this became that" - the cut is carried by an object with its own
// weight and direction rather than by an opacity curve. Slanted rather than
// vertical because a diagonal edge reads as motion even in a single frame.
export const Sweep: React.FC<{ at: number; len?: number; flip?: boolean }> = ({
  at,
  len = 22,
  flip = false,
}) => {
  const frame = useCurrentFrame();
  if (frame < at - 2 || frame > at + len + 2) return null;

  const p = interpolate(frame, [at, at + len], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: IN_OUT,
  });
  // The band crosses, and a thin leading edge runs slightly ahead of it - the
  // detail that makes a wipe feel like a physical object rather than a bar.
  const x = interpolate(p, [0, 1], flip ? [1500, -1900] : [-1900, 1500]);
  const edge = interpolate(p, [0, 1], flip ? [1620, -1780] : [-1780, 1620], { easing: OUT });

  return (
    <AbsoluteFill style={{ zIndex: 20, pointerEvents: 'none', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          top: -300,
          bottom: -300,
          left: 0,
          width: 1500,
          transform: `translateX(${x}px) skewX(-11deg)`,
          background: `linear-gradient(90deg, rgba(78,205,196,0) 0%, rgba(78,205,196,0.16) 34%, rgba(78,205,196,0.30) 62%, rgba(78,205,196,0) 100%)`,
          filter: 'blur(2px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: -300,
          bottom: -300,
          left: 0,
          width: 6,
          transform: `translateX(${edge}px) skewX(-11deg)`,
          background: theme.teal,
          boxShadow: `0 0 60px 12px rgba(78,205,196,0.55)`,
          opacity: 0.9,
        }}
      />
    </AbsoluteFill>
  );
};
