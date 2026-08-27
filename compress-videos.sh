#!/usr/bin/env bash
# ============================================================
# Compress the cinematic videos for GitHub + smooth scrubbing
#
#   • shrinks each clip well under GitHub's 25MB web-upload limit
#   • re-encodes with +faststart so it streams and seeks instantly
#   • dense keyframes so any scroll position decodes fast
#
# Run from your project folder:   bash compress-videos.sh
# ============================================================
set -uo pipefail
cd "$(dirname "$0")"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "✗ ffmpeg not found.  Install it first:   brew install ffmpeg"
  exit 1
fi

if [ ! -d assets ] || [ -z "$(ls assets/*.mp4 2>/dev/null)" ]; then
  echo "✗ No videos found in ./assets"
  echo "  Run  bash localize.sh  first to download them."
  exit 1
fi

echo "▸ Compressing videos (720p, faststart, dense keyframes)…"
echo ""

for f in assets/*.mp4; do
  [ -f "$f" ] || continue
  before=$(du -m "$f" | cut -f1)
  ffmpeg -y -i "$f" \
    -an \
    -vf "scale=1280:-2:flags=lanczos" \
    -c:v libx264 -preset slow -crf 28 \
    -g 6 -keyint_min 6 -sc_threshold 0 \
    -pix_fmt yuv420p -movflags +faststart \
    "$f.tmp.mp4" >/dev/null 2>&1
  if [ -f "$f.tmp.mp4" ]; then
    mv "$f.tmp.mp4" "$f"
    after=$(du -m "$f" | cut -f1)
    printf "  ✓ %-28s %sMB → %sMB\n" "$(basename "$f")" "$before" "$after"
  else
    echo "  ✗ failed: $(basename "$f")"
  fi
done

# make sure the site serves these local files
echo 'window.AURIELLE_USE_LOCAL = true;' > js/local-assets.js

echo ""
echo "▸ Final sizes:"
ls -lh assets/*.mp4 | awk '{print "   " $9 "  " $5}'
echo ""
echo "✓ Done. All files should be well under 25MB."
echo "  Now commit and push:"
echo "     git add -A && git commit -m \"Compressed media\" && git push"
