import React from 'react';
import { theme } from '../data/theme';

// A marketing channel as a pill. Live (teal) or inert (outlined) - the whole
// point of scene 2 is that activity and results are different things.
export const Chip: React.FC<{ label: string; live?: boolean; scale?: number }> = ({
  label, live = false, scale = 1,
}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 16 * scale,
      padding: `${20 * scale}px ${40 * scale}px`,
      borderRadius: 999,
      fontFamily: theme.display,
      fontWeight: 700,
      fontSize: 40 * scale,
      letterSpacing: '0.02em',
      whiteSpace: 'nowrap',
      color: live ? theme.navy : 'rgba(255,255,255,0.82)',
      background: live ? theme.teal : 'rgba(255,255,255,0.06)',
      border: `2px solid ${live ? theme.teal : 'rgba(255,255,255,0.20)'}`,
      boxShadow: live ? `0 18px 44px rgba(78,205,196,0.32)` : 'none',
    }}
  >
    <span
      style={{
        width: 14 * scale,
        height: 14 * scale,
        borderRadius: '50%',
        background: live ? theme.navy : theme.teal,
        opacity: live ? 1 : 0.75,
      }}
    />
    {label}
  </div>
);
