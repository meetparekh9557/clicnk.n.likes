import React from 'react';
import { Img, useCurrentFrame } from 'remotion';
import { ramp, OUT } from './easing';
import { HBlur } from './HBlur';

export type UIPanelProps = {
  src: string;
  /** Where it settles, in px from frame centre. */
  x: number;
  y: number;
  width: number;
  /** Where it enters from, in px from its resting x. Negative = from the left. */
  fromX?: number;
  start?: number;
  len?: number;
  rotate?: number;
  opacity?: number;
  /** Continues drifting after landing, so a held panel never looks frozen. */
  drift?: number;
  /** Crop a tall capture to a window instead of letting it swallow the copy. */
  maxHeight?: number;
};

// A real screenshot of the product, sliding in horizontally. The brief calls
// for UI that supports the copy, so panels always travel on the same axis as
// the text they arrive with.
//
// Positioning deliberately sits OUTSIDE the blur wrapper: a CSS `filter` makes
// an element a containing block for absolutely positioned descendants, so a
// panel nested inside one resolves `top: 50%` against the blur div rather than
// the frame and lands in the wrong place entirely.
export const UIPanel: React.FC<UIPanelProps> = ({
  src, x, y, width, fromX = -900, start = 0, len = 26,
  rotate = 0, opacity = 1, drift = 24, maxHeight,
}) => {
  const frame = useCurrentFrame();
  const at = (f: number) => {
    const q = ramp(f, start, len, { easing: OUT });
    return x + (1 - q) * fromX + q * drift * ((f - start) / Math.max(len, 1)) * 0.4;
  };
  const px = at(frame);
  const blur = Math.min(22, Math.abs(px - at(frame - 1)) * 0.55);
  const q = ramp(frame, start, len, { easing: OUT });

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width,
        marginLeft: -width / 2,
        transform: `translate(${px}px, ${y}px) rotate(${rotate}deg) scale(${0.94 + 0.06 * q})`,
        opacity: opacity * q,
      }}
    >
      <HBlur amount={blur}>
        <div
          style={{
            borderRadius: 22,
            overflow: 'hidden',
            ...(maxHeight ? { height: maxHeight } : null),
            boxShadow: '0 40px 90px rgba(4,10,22,0.55), 0 0 0 1px rgba(255,255,255,0.10)',
          }}
        >
          <Img src={src} style={{ width: '100%', display: 'block' }} />
        </div>
      </HBlur>
    </div>
  );
};
