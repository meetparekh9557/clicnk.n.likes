import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { fitText } from '@remotion/layout-utils';
import { theme, timing } from '../data/theme';
import { rampOut, IN_OUT } from './easing';
import { HBlur } from './HBlur';

export type KineticHeadlineProps = {
  lines: readonly string[];
  start?: number;
  exitAt?: number;
  accent?: number;
  /** A single word to accent wherever it appears, instead of a whole line. */
  accentWord?: string;
  dir?: 1 | -1;
  size?: number;
  maxWidth?: number;
  color?: string;
};

// Kinetic typography, animated per WORD rather than per line.
//
// The difference matters more than it sounds. A line that reveals as one block
// is a slide; words that arrive on their own staggered springs read as
// language assembling itself, which is the whole effect the format is after.
// Three things run together on every word:
//
//   1. a mask reveal - the glyphs are already in place and the frame moves,
//   2. a spring, so each word overshoots a little and settles rather than
//      easing to a dead stop,
//   3. rotateX, so the word tips up into place instead of sliding flat.
//
// Words also LEAVE staggered, and in the opposite order to their arrival, so
// the exit has follow-through instead of the block snapping off as one piece.
export const KineticHeadline: React.FC<KineticHeadlineProps> = ({
  lines,
  start = 0,
  exitAt,
  accent,
  accentWord,
  dir = 1,
  size = 108,
  maxWidth = 912,
  color = theme.white,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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

  // Block-level exit, carried on a directional blur so the departure smears
  // along its axis of travel.
  const xAt = (f: number) =>
    exitAt === undefined ? 0 : -(1 - rampOut(f, exitAt, timing.exit, { easing: IN_OUT })) * 1280 * dir;
  const blockX = xAt(frame);
  const blockBlur = Math.min(28, Math.abs(blockX - xAt(frame - 1)) * 0.5);

  let wordIndex = 0;

  return (
    <HBlur amount={blockBlur}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          transform: `translateX(${blockX}px)`,
          perspective: 1200,
        }}
      >
        {lines.map((line, li) => {
          const words = line.split(' ');
          return (
            <div
              key={line + li}
              style={{ display: 'flex', gap: `${fitted * 0.26}px`, overflow: 'hidden',
                       paddingBottom: fitted * 0.08, paddingTop: fitted * 0.04 }}
            >
              {words.map((w, wi) => {
                const i = wordIndex++;
                const delay = start + i * 3.2;
                const s = spring({
                  frame: frame - delay,
                  fps,
                  config: { damping: 15, stiffness: 130, mass: 0.7 },
                });
                // Exit runs in reverse order, so the line unbuilds from its tail.
                const outDelay =
                  exitAt === undefined ? 0 : exitAt + (words.length - wi - 1) * 1.6;
                const out = exitAt === undefined ? 1 : rampOut(frame, outDelay, 10);

                return (
                  <span
                    key={w + wi}
                    style={{
                      display: 'inline-block',
                      fontFamily: theme.display,
                      fontWeight: 700,
                      fontSize: fitted,
                      lineHeight: 1.06,
                      letterSpacing: '-0.035em',
                      whiteSpace: 'pre',
                      color:
                        accent === li || (accentWord && w.replace(/[^A-Z’']/gi, '') === accentWord)
                          ? theme.teal
                          : color,
                      transformOrigin: '50% 100%',
                      transform: `translateY(${(1 - s) * fitted * 1.1}px) rotateX(${(1 - s) * -62}deg)`,
                      opacity: Math.min(1, s * 1.6) * out,
                    }}
                  >
                    {w}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </HBlur>
  );
};
