import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { theme } from '../data/theme';

// The one layer that never cuts. It spans the whole film underneath every
// scene and drifts continuously, which is most of why the result reads as one
// sequence rather than seven slides. Full bleed - no bars, ever.
export const Bg: React.FC<{ totalFrames: number }> = ({ totalFrames }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const p = frame / totalFrames;

  // Two glows crossing the frame on different paths, plus a grid that creeps
  // sideways. Slow enough to feel like depth, not like an animated wallpaper.
  const gx = interpolate(p, [0, 1], [0.22, 0.78]) * width;
  const gy = interpolate(p, [0, 1], [0.30, 0.72]) * height;
  const cx = interpolate(p, [0, 1], [0.85, 0.15]) * width;
  const cy = interpolate(p, [0, 1], [0.78, 0.26]) * height;
  const gridShift = (frame * 0.55) % 96;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.navy }}>
      <AbsoluteFill
        style={{
          background: `linear-gradient(168deg, ${theme.navyLift} 0%, ${theme.navy} 46%, ${theme.navyDeep} 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)`,
          backgroundSize: '96px 96px',
          transform: `translateX(${-gridShift}px)`,
          opacity: 0.85,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(760px 620px at ${gx}px ${gy}px, rgba(78,205,196,0.28), transparent 70%)`,
          filter: 'blur(28px)',
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(600px 520px at ${cx}px ${cy}px, rgba(255,71,87,0.13), transparent 72%)`,
          filter: 'blur(34px)',
        }}
      />
      {/* Vignette keeps type off the brightest part of the glow. */}
      <AbsoluteFill
        style={{ background: 'radial-gradient(120% 78% at 50% 50%, transparent 42%, rgba(8,16,30,0.55) 100%)' }}
      />
    </AbsoluteFill>
  );
};
