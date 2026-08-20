import React from 'react';

// Directional (horizontal) blur. CSS `filter: blur()` is isotropic and turns
// fast horizontal motion to mush; an SVG feGaussianBlur with a zero vertical
// deviation smears along the axis of travel the way a real shutter does.
let uid = 0;

export const HBlur: React.FC<{ amount: number; children: React.ReactNode }> = ({
  amount,
  children,
}) => {
  const id = React.useMemo(() => `hb${uid++}`, []);
  if (amount < 0.35) return <>{children}</>;
  return (
    <>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <defs>
          <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={`${amount} 0`} />
          </filter>
        </defs>
      </svg>
      <div style={{ filter: `url(#${id})` }}>{children}</div>
    </>
  );
};
