import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Chip } from './Chip';
import { HBlur } from './HBlur';

// A row of chips travelling horizontally, looped seamlessly. Four of these at
// different speeds and directions is what sells "lots of activity" without a
// single particle effect.
//
// As in UIPanel, the absolute positioning stays outside HBlur - a filtered
// element becomes the containing block for absolute children.
export const Rail: React.FC<{
  items: readonly string[];
  y: number;
  speed: number;       // px per frame; negative travels left
  scale?: number;
  live?: boolean;
  opacity?: number;
}> = ({ items, y, speed, scale = 1, live = false, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const loop = items.length * 420 * scale;
  const shift = ((frame * speed) % loop) - (speed < 0 ? 0 : loop);

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: '50%',
        width: 4000,
        transform: `translate(${shift}px, ${y}px)`,
        opacity,
      }}
    >
      <HBlur amount={Math.min(14, Math.abs(speed) * 1.1)}>
        <div style={{ display: 'flex', gap: 34 * scale, alignItems: 'center' }}>
          {[...items, ...items, ...items, ...items].map((it, i) => (
            <Chip key={`${it}-${i}`} label={it} live={live} scale={scale} />
          ))}
        </div>
      </HBlur>
    </div>
  );
};
