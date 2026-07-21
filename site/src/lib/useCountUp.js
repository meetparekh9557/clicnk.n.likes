// Small shared count-up hook for the calculator totals. Given a target
// number, it eases the displayed value from wherever it currently sits up
// (or down) to the new target over ~640ms on an ease-out-quart curve, so a
// slider drag reads as a live tally rather than a jumpy relabel. The raw
// integer it returns is formatted by the caller (e.g. through formatMoney),
// so currency and locale formatting stay in one place. Under
// prefers-reduced-motion it snaps straight to the target with no animation.
import { useEffect, useRef, useState } from 'react';

const DURATION = 640;
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

export function useCountUp(target) {
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef(0);

  useEffect(() => {
    if (reduce || target === fromRef.current) {
      fromRef.current = target;
      setValue(target);
      return;
    }
    const from = fromRef.current;
    const delta = target - from;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / DURATION);
      const next = Math.round(from + delta * easeOutQuart(t));
      setValue(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, reduce]);

  return value;
}
