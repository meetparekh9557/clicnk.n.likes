// Every word in the film, and every timing that shapes it.
//
// This is the single edit point for copy and pacing: change a string or a
// number here and the render follows - no scene component needs touching.
// All timings are in frames at 30fps.
//
// `beats` are frame offsets measured from the START of that scene. Raising a
// scene's durationInFrames without moving its beats simply holds the last
// message on screen for longer, which is the usual way to slow the cut down.
import { staticFile } from 'remotion';

export const ui = (n: string) => staticFile(`ui/${n}.png`);

export const script = {
  scene1: {
    durationInFrames: 144,
    first: ['YOUR BUSINESS', "DOESN'T NEED", 'MORE MARKETING.'],
    second: ['IT NEEDS TO KNOW', "WHAT'S NOT WORKING."],
    accentLineIndex: 1,
    beats: { firstIn: 2, firstOut: 66, secondIn: 74, secondOut: 132 },
  },
  scene2: {
    durationInFrames: 132,
    chips: ['SEO', 'ADS', 'CONTENT', 'SOCIAL', 'WEBSITE'],
    lines: ['DOING MORE', "DOESN'T ALWAYS", 'MEAN GROWING MORE.'],
    beats: { copyIn: 26, copyOut: 118, dimAt: 26 },
  },
  scene3: {
    durationInFrames: 252,
    pairs: [
      { setup: 'Getting traffic…', payoff: 'but not enough enquiries.', art: 'growth-hero' },
      { setup: 'Running ads…', payoff: "but unsure what's actually working.", art: 'plan-builder' },
      { setup: 'Creating content…', payoff: "but customers aren't finding you.", art: 'tools-grid' },
      { setup: 'Your competitors…', payoff: 'keep showing up first.', art: 'tools-channel' },
    ],
    // Offsets within each pair's own slot (slot = duration / pairs.length).
    beats: { setupIn: 0, payoffIn: 16, panelIn: 5, outBefore: 12 },
  },
  scene4: {
    durationInFrames: 144,
    top: 'MORE MARKETING',
    symbol: '≠',
    bottom: 'MORE GROWTH',
    after: ['THE FIRST STEP', 'IS FINDING', 'THE GAP.'],
    beats: { topIn: 0, bottomIn: 6, symbolIn: 16, eqOut: 68, pullIn: 78, afterIn: 80, afterOut: 132 },
  },
  scene5: {
    durationInFrames: 180,
    first: ["WE DON'T START", 'WITH A SERVICE.'],
    second: ['WE START', 'WITH THE'],
    accentWord: 'PROBLEM.',
    areas: ['SEARCH', 'CONVERSION', 'CONTENT', 'WEBSITE', 'PAID', 'AI SEARCH'],
    flagged: [0, 3],
    beats: { firstIn: 2, firstOut: 52, secondIn: 60, wordIn: 76, gridIn: 88, headOut: 150, gridOut: 164 },
  },
  scene6: {
    durationInFrames: 174,
    steps: [
      { label: 'FIND THE GAP.', art: 'sound-familiar' },
      { label: 'PRIORITISE IT.', art: 'how-it-works' },
      { label: 'FIX WHAT MATTERS.', art: 'services' },
      { label: 'MEASURE THE RESULT.', art: 'before-after' },
    ],
    beats: { labelIn: 2, outBefore: 12 },
  },
  scene7: {
    durationInFrames: 192,
    lines: ['SOMETHING IN YOUR', 'MARKETING MAY BE', 'HOLDING YOUR', 'BUSINESS BACK.'],
    turn: ["LET'S FIND OUT", 'WHAT IT IS.'],
    cta: 'SEND YOUR INQUIRY',
    beats: { linesIn: 2, linesOut: 64, turnIn: 72, turnOut: 108, btnIn: 114, logoIn: 124 },
  },
} as const;

// THE SHORT CUT - the one that runs on cold Meta traffic.
//
// Same three components as the long film, retimed: hook, disconnected
// channels, close. Everything in the middle (the four problem beats, the
// inequality, the diagnosis, the four-step process) is argument, and a
// stranger who did not choose you will not stay for an argument. They get the
// premise and the ask; the long cut is for people who already clicked.
//
// scene7 runs with `showLines` off here, so the close opens straight on the
// turn instead of building to it - there is no time to build.
export const shortCut = {
  scene1: {
    durationInFrames: 126,
    beats: { firstIn: 2, firstOut: 54, secondIn: 62, secondOut: 116 },
  },
  scene2: {
    // 188, not 168: the third voiceover line needs ~2.9s to read and only had
    // 2.3s of room. Picture is cut to the voice, never the reverse.
    durationInFrames: 188,
    // The animated build runs on its own internal clock (cards, links, breaks,
    // warning); `copyIn` is the only beat here because the words are the
    // conclusion of that sequence and must not arrive before it resolves.
    beats: { copyIn: 96, copyOut: 182, dimAt: 96 },
  },
  scene7: {
    durationInFrames: 156,
    showLines: false,
    beats: { linesIn: 0, linesOut: 0, turnIn: 4, turnOut: 62, btnIn: 68, logoIn: 82 },
  },
} as const;

// Audio marks. Both source files live in public/audio/ and are deliberately
// NOT committed: they are licensed third-party assets and this repo is public,
// so committing them would be redistribution.
export const audio = {
  // The track's main drop is at 23.2s. The film's impact — the warning drawing
  // itself — is at 6.9s. Starting the track 16.3s in puts them on top of each
  // other, so the beat lands ON a visual event rather than near one.
  musicStartFrame: Math.round(16.3 * 30),
  musicLevel: 0.85,
  // The film is 458 frames; start the fade a second before the end.
  fadeOutStart: 458 - 30,
} as const;
