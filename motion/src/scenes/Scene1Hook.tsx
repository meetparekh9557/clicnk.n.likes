import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Headline } from '../components/Headline';
import { script } from '../data/script';

const s = script.scene1;

type Beats = { readonly [K in keyof typeof script.scene1.beats]: number };

// The hook. Three lines land, then the whole block leaves to the left while
// the answer arrives from the right - one continuous horizontal move rather
// than a cut, which is the pattern the rest of the film keeps.
export const Scene1Hook: React.FC<{ beats?: Beats }> = ({ beats }) => {
  const b = beats ?? s.beats;
  return (
  <AbsoluteFill style={{ justifyContent: 'center', padding: '0 84px' }}>
    <Headline lines={s.first} start={b.firstIn} exitAt={b.firstOut} size={112} dir={1} />
    <AbsoluteFill style={{ justifyContent: 'center', padding: '0 84px' }}>
      <Headline lines={s.second} start={b.secondIn} exitAt={b.secondOut} accent={s.accentLineIndex} size={104} dir={-1} />
    </AbsoluteFill>
  </AbsoluteFill>
  );
};
