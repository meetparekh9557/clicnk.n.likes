import React from 'react';
import { Audio, staticFile, interpolate } from 'remotion';
import { audio } from '../data/script';

// The music bed.
//
// `startFrom` is the whole trick. The track's main drop sits at 23.2s, and the
// film's impact - the warning drawing itself - is at 6.9s. Starting the track
// 16.3s in puts those on top of each other, so the beat lands on a visual
// event rather than near one. Picture cut to music is the usual rule; here the
// picture was already locked, so the music moves instead.
//
// Starting mid-track costs the sparse intro, so the opening is recovered with
// a volume ramp: the bed comes up over the first ~2.5s, which reads as the
// same "minimal and intriguing" open the direction asked for.
export const Score: React.FC = () => (
  <Audio
    src={staticFile('audio/music.mp3')}
    startFrom={audio.musicStartFrame}
    volume={(f) =>
      interpolate(
        f,
        [0, 75, audio.fadeOutStart, audio.fadeOutStart + 30],
        [0.30, audio.musicLevel, audio.musicLevel, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    }
  />
);
