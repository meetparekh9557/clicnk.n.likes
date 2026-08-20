// Every word in the film, and how long each scene runs.
//
// This is the single edit point for copy and pacing: change a string here and
// the render follows, no scene component needs touching. Durations are in
// frames at 30fps.
import { staticFile } from 'remotion';

export const ui = (n: string) => staticFile(`ui/${n}.png`);

export const script = {
  scene1: {
    durationInFrames: 96,
    first: ['YOUR BUSINESS', "DOESN'T NEED", 'MORE MARKETING.'],
    second: ['IT NEEDS TO KNOW', "WHAT'S NOT WORKING."],
    accentLineIndex: 1, // second line of `second` takes the accent colour
  },
  scene2: {
    durationInFrames: 96,
    chips: ['SEO', 'ADS', 'CONTENT', 'SOCIAL', 'WEBSITE'],
    lines: ['DOING MORE', "DOESN'T ALWAYS", 'MEAN GROWING MORE.'],
  },
  scene3: {
    durationInFrames: 168,
    pairs: [
      { setup: 'Getting traffic…', payoff: 'but not enough enquiries.', art: 'growth-hero' },
      { setup: 'Running ads…', payoff: "but unsure what's actually working.", art: 'plan-builder' },
      { setup: 'Creating content…', payoff: "but customers aren't finding you.", art: 'tools-grid' },
      { setup: 'Your competitors…', payoff: 'keep showing up first.', art: 'tools-channel' },
    ],
  },
  scene4: {
    durationInFrames: 96,
    top: 'MORE MARKETING',
    symbol: '≠',
    bottom: 'MORE GROWTH',
    after: ['THE FIRST STEP', 'IS FINDING', 'THE GAP.'],
  },
  scene5: {
    durationInFrames: 120,
    first: ["WE DON'T START", 'WITH A SERVICE.'],
    second: ['WE START', 'WITH THE'],
    accentWord: 'PROBLEM.',
    // The six areas a gap can sit in. The two flagged ones light up.
    areas: ['SEARCH', 'CONVERSION', 'CONTENT', 'WEBSITE', 'PAID', 'AI SEARCH'],
    flagged: [0, 3],
  },
  scene6: {
    durationInFrames: 120,
    steps: [
      { label: 'FIND THE GAP.', art: 'sound-familiar' },
      { label: 'PRIORITISE IT.', art: 'how-it-works' },
      { label: 'FIX WHAT MATTERS.', art: 'services' },
      { label: 'MEASURE THE RESULT.', art: 'before-after' },
    ],
  },
  scene7: {
    durationInFrames: 126,
    lines: ['SOMETHING IN YOUR', 'MARKETING MAY BE', 'HOLDING YOUR', 'BUSINESS BACK.'],
    turn: ["LET'S FIND OUT", 'WHAT IT IS.'],
    cta: 'SEND YOUR INQUIRY',
    url: 'clicknlikes.com/growth',
  },
} as const;

export const TOTAL =
  script.scene1.durationInFrames +
  script.scene2.durationInFrames +
  script.scene3.durationInFrames +
  script.scene4.durationInFrames +
  script.scene5.durationInFrames +
  script.scene6.durationInFrames +
  script.scene7.durationInFrames;
