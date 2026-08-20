import React from 'react';
import { useCurrentFrame } from 'remotion';
import { fitText } from '@remotion/layout-utils';
import { theme, timing } from '../data/theme';
import { ramp, rampOut, OUT } from './easing';
import { HBlur } from './HBlur';

export type HeadlineProps = {
  lines: readonly string[];
  /** Frame the first line starts revealing. */
  start?: number;
  /** Frame the block starts leaving; omit to keep it on screen. */
  exitAt?: number;
  /** Index of the line that takes the accent colour. */
  accent?: number;
  /** Direction the block travels on entry and exit. */
  dir?: 1 | -1;
  /** Ceiling for the type size; lines shrink below it rather than overflow. */
  size?: number;
  /** Usable width. Any line wider than this is scaled down to fit. */
  maxWidth?: number;
  align?: 'left' | 'center';
  color?: string;
};

// A stack of lines, each revealed behind its own mask rather than faded in.
// The mask is what makes it read as kinetic typography instead of a fade: the
// glyphs are already in place and the frame is what moves.
export const Headline: React.FC<HeadlineProps> = ({
  lines,
  start = 0,
  exitAt,
  accent,
  dir = 1,
  size = 108,
  maxWidth = 912,
  align = 'left',
  color = theme.white,
}) => {
  const frame = useCurrentFrame();

  // Nothing in a 1080-wide frame may run off the edge. Measure every line and
  // take the smallest size that fits them all, so the block stays optically
  // even instead of one line shrinking on its own.
  const fitted = React.useMemo(() => {
    const sizes = lines.map(
      (line) =>
        fitText({
          text: line,
          withinWidth: maxWidth,
          fontFamily: theme.display,
          fontWeight: 700,
          letterSpacing: '-0.035em',
        }).fontSize
    );
    return Math.min(size, ...sizes);
  }, [lines, maxWidth, size]);

  // Position as a function of frame, so velocity (and therefore the shutter
  // blur) falls out of the same curve rather than being guessed at.
  const xAt = (f: number) =>
    exitAt === undefined ? 0 : -(1 - rampOut(f, exitAt, timing.exit)) * 1250 * dir;
  const blockX = xAt(frame);
  const blockBlur = Math.min(26, Math.abs(blockX - xAt(frame - 1)) * 0.5);
  const exitP = exitAt === undefined ? 0 : 1 - rampOut(frame, exitAt, timing.exit);

  return (
    <HBlur amount={blockBlur}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: align === 'center' ? 'center' : 'flex-start',
          textAlign: align,
          transform: `translateX(${blockX}px)`,
          opacity: 1 - exitP * 0.25,
        }}
      >
        {lines.map((line, i) => {
          const d = start + i * timing.lineStagger;
          const q = ramp(frame, d, timing.reveal, { easing: OUT });
          return (
            <div key={line} style={{ overflow: 'hidden', paddingBottom: fitted * 0.06 }}>
              <div
                style={{
                  fontFamily: theme.display,
                  fontWeight: 700,
                  fontSize: fitted,
                  lineHeight: 1.04,
                  letterSpacing: '-0.035em',
                  color: accent === i ? theme.teal : color,
                  whiteSpace: 'nowrap',
                  transform: `translateY(${(1 - q) * fitted * 1.05}px)`,
                }}
              >
                {line}
              </div>
            </div>
          );
        })}
      </div>
    </HBlur>
  );
};
