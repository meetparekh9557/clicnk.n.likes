import React from 'react';
import { Audio, staticFile, interpolate } from 'remotion';
import { audio } from '../data/script';

// Music bed.
//
// `startFrom` on the music is the whole trick. The track's main drop sits at
// 23.2s and the film's impact — the warning drawing itself — is at 6.9s, so
// starting the track 16.3s in puts them on top of each other and the beat
// lands ON a visual event rather than near one. Picture is normally cut to
// music; here the picture was already locked to the voice, so the music moved.
//
// Starting mid-track costs the sparse intro, which the opening volume ramp
// recovers.
export const Score: React.FC = () => (
  <>
    <Audio
      src={staticFile('audio/music.mp3')}
      startFrom={audio.musicStartFrame}
      volume={(f) => {
        const bed = interpolate(
          f,
          [0, 75, audio.fadeOutStart, audio.fadeOutStart + 30],
          [0.30, audio.musicLevel, audio.musicLevel, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        return bed;
      }}
    />
  </>
);
