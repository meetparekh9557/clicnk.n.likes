#!/usr/bin/env bash
# Normalise a Remotion render for Meta delivery.
#
# Remotion's JPEG frame pipeline tags its output full-range `yuvj420p`, and
# --pixel-format=yuv420p does NOT override it - verified, not assumed. Some
# Meta decoders shift full-range colour on playback, so every render gets this
# pass before it ships. Fast (well under a minute); it is a required step, not
# a fallback.
#
#   ./scripts-finish.sh out/growth-ad.mp4 out/growth-ad-delivery.mp4
set -euo pipefail
IN="${1:?usage: scripts-finish.sh <in.mp4> <out.mp4>}"
OUT="${2:?usage: scripts-finish.sh <in.mp4> <out.mp4>}"
FFMPEG="${FFMPEG:-ffmpeg}"
"$FFMPEG" -y -v error -i "$IN" \
  -c:v libx264 -preset slow -crf 18 \
  -pix_fmt yuv420p -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a copy -movflags +faststart "$OUT"
echo "wrote $OUT"
