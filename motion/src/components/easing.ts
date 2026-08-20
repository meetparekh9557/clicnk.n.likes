import { Easing, interpolate } from 'remotion';

// One easing vocabulary for the whole film. `out` is the workhorse: fast
// departure, soft landing, which is what makes a fast cut still read.
export const OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const BACK = Easing.bezier(0.34, 1.4, 0.64, 1);

type Opts = { easing?: (n: number) => number };

/** 0→1 ramp starting at `delay`, lasting `len` frames. */
export const ramp = (frame: number, delay: number, len: number, o: Opts = {}) =>
  interpolate(frame, [delay, delay + len], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: o.easing ?? OUT,
  });

/** 1→0 ramp, for exits. */
export const rampOut = (frame: number, start: number, len: number, o: Opts = {}) =>
  interpolate(frame, [start, start + len], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: o.easing ?? IN_OUT,
  });

/** Frame-to-frame velocity of a value, used to drive directional blur. */
export const velocity = (fn: (f: number) => number, frame: number) =>
  Math.abs(fn(frame) - fn(frame - 1));
