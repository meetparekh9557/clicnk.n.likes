import React from 'react';
import { staticFile } from 'remotion';
import { theme } from '../data/theme';

// Remotion inlines nothing for us, so the faces are declared once here and the
// component is mounted at the top of every composition.
export const Fonts: React.FC = () => (
  <style>{`
    @font-face{font-family:'Space Grotesk';font-weight:700;font-display:block;
      src:url(${staticFile('fonts/space-grotesk-latin-700-normal.woff2')}) format('woff2')}
    @font-face{font-family:'Space Grotesk';font-weight:500;font-display:block;
      src:url(${staticFile('fonts/space-grotesk-latin-500-normal.woff2')}) format('woff2')}
    @font-face{font-family:'DM Sans';font-weight:700;font-display:block;
      src:url(${staticFile('fonts/dm-sans-latin-700-normal.woff2')}) format('woff2')}
    @font-face{font-family:'DM Sans';font-weight:500;font-display:block;
      src:url(${staticFile('fonts/dm-sans-latin-500-normal.woff2')}) format('woff2')}
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:${theme.navy}}
  `}</style>
);
