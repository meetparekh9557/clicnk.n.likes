// Click.n.likes brand tokens, mirrored from site/src/styles/global.css.
// Change a value here and every scene follows.
export const theme = {
  navy: '#1A2B4A',
  navyDeep: '#101D33',
  navyLift: '#22375C',
  teal: '#4ECDC4',
  tealDark: '#33A79F',
  coral: '#FF4757',
  off: '#F7F7F7',
  white: '#FFFFFF',
  display: "'Space Grotesk', system-ui, sans-serif",
  body: "'DM Sans', system-ui, sans-serif",
} as const;

// One rhythm for the whole film. Scenes reference these rather than inventing
// their own timings, so the cut stays even when copy is edited.
export const timing = {
  fps: 30,
  lineStagger: 5,     // frames between staggered lines
  reveal: 16,         // frames a mask reveal takes
  exit: 12,           // frames a scene's copy takes to leave
  overlap: 6,         // frames each scene overlaps the next, so nothing "cuts"
} as const;
