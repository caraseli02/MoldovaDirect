#!/usr/bin/env bash

set -euo pipefail

# Generate .webm and poster.jpg assets for each hero-*.mp4 in public/videos/hero.

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
VIDEO_DIR="$ROOT_DIR/public/videos/hero"
FFMPEG_BIN="${FFMPEG_BIN:-ffmpeg}"

if ! command -v "$FFMPEG_BIN" >/dev/null 2>&1; then
  echo "ffmpeg is required but not installed. Install ffmpeg or set FFMPEG_BIN to its path, then rerun." >&2
  exit 1
fi

shopt -s nullglob
mp4_files=("$VIDEO_DIR"/hero-*.mp4)

if [[ ${#mp4_files[@]} -eq 0 ]]; then
  echo "No hero-*.mp4 files found in $VIDEO_DIR"
  exit 0
fi

for mp4 in "${mp4_files[@]}"; do
  base="${mp4%.mp4}"
  webm="${base}.webm"
  poster="${base}-poster.jpg"

  echo "Processing ${mp4##*/}"; echo "----------------------"

  if [[ ! -f "$webm" ]]; then
    echo "Creating ${webm##*/}..."
    "$FFMPEG_BIN" -y -i "$mp4" -c:v libvpx-vp9 -b:v 2M -vf "scale=1920:-2" -an "$webm"
  else
    echo "Skipping ${webm##*/} (already exists)"
  fi

  if [[ ! -f "$poster" ]]; then
    echo "Creating ${poster##*/}..."
    "$FFMPEG_BIN" -y -i "$mp4" -ss 00:00:01 -frames:v 1 -q:v 2 -update 1 "$poster"
  else
    echo "Skipping ${poster##*/} (already exists)"
  fi

  echo
done

echo "Done. Assets are in $VIDEO_DIR"
