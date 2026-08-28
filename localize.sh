#!/usr/bin/env bash
# ============================================================
# MAISON AURIELLE — localize media
# Downloads every cinematic sequence, poster and product photo
# into ./assets so the site becomes fully self-contained and
# offline-ready, then slices the footage into optimized scroll
# frames (requires ffmpeg; skipped gracefully if not installed).
#
# Run once, on your own machine:  bash localize.sh
# ============================================================
set -uo pipefail
cd "$(dirname "$0")"

BASE="https://d8j0ntlcm91z4.cloudfront.net/user_3E9CPm0AuV3q70Xl4UHu15ShiqX"
mkdir -p assets/posters assets/products assets/story assets/ring assets/frames/hero assets/frames/craft assets/frames/gift

dl () { # url  dest
  if command -v curl >/dev/null 2>&1; then curl -fL --retry 3 "$1" -o "$2" && echo "  ✓ $2";
  elif command -v wget >/dev/null 2>&1; then wget -q "$1" -O "$2" && echo "  ✓ $2";
  else echo "  ✗ need curl or wget"; exit 1; fi
}

echo "▸ Cinematic sequences (1080p)…"
dl "$BASE/hf_20260706_054637_61033e62-c94b-460a-8144-d0883a867b3c.mp4" assets/hero-spark.mp4
dl "$BASE/hf_20260706_054640_dd2c15c0-9351-4835-a855-85136937024e.mp4" assets/craftsmanship-detail.mp4
dl "$BASE/hf_20260706_054642_58167eed-fc97-47f4-b8ff-893ca980da5b.mp4" assets/gift-reveal.mp4
dl "$BASE/hf_20260827_163615_301d5343-0635-48b4-bfd4-d379b364aa98.mp4" assets/finale.mp4

echo "▸ Posters…"
dl "$BASE/hf_20260706_054146_f60cc815-402b-4ab6-87ec-cec6b55b645a.png" assets/posters/hero.png
dl "$BASE/hf_20260706_054149_8172c138-5c40-4982-aac7-70fe5ba90f4a.png" assets/posters/craft.png
dl "$BASE/hf_20260706_054151_fb9fc71d-e413-43a2-96a2-ff6c2608a2a5.png" assets/posters/gift.png
dl "$BASE/hf_20260706_054146_f60cc815-402b-4ab6-87ec-cec6b55b645a.png" assets/posters/finale.png

echo "▸ Story image…"
dl "$BASE/hf_20260706_065348_8fb69b83-715a-40ec-8459-dc0d95694580.png" assets/story/light.png

echo "▸ Signature ring (interactive fallback)…"
dl "$BASE/hf_20260706_071121_f35f5d7f-65fb-4ca7-9f0a-d2f31742912e.png" assets/ring/ring.png

echo "▸ Product photography…"
dl "$BASE/hf_20260706_054842_0387c4ed-323b-4ac1-9d34-b91ac5818cfb.png" assets/products/ring.png
dl "$BASE/hf_20260706_054843_2714f35b-b925-402a-a1cd-acd0a7115ed9.png" assets/products/necklace.png
dl "$BASE/hf_20260706_054844_a0623321-330e-419b-ba35-c54224ec5351.png" assets/products/bracelet.png
dl "$BASE/hf_20260706_054846_05e11312-023d-4c97-8137-e10df62ac587.png" assets/products/earrings.png
dl "$BASE/hf_20260706_054848_083d3e20-ebee-466c-8a3b-0304d80d8893.png" assets/products/pendant.png
dl "$BASE/hf_20260828_154030_1eb472f8-96cb-4478-abfa-e82aed90806f.png" assets/products/band.png

echo "▸ Optimizing videos for smooth scroll-scrubbing (faststart + dense keyframes)…"
if command -v ffmpeg >/dev/null 2>&1; then
  optimize () { # file
    [ -f "$1" ] || return
    ffmpeg -y -i "$1" -an -c:v libx264 -preset slow -crf 20 \
      -g 6 -keyint_min 6 -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart \
      "$1.tmp.mp4" >/dev/null 2>&1 && mv "$1.tmp.mp4" "$1" \
      && echo "  ✓ $(basename "$1")  ($(du -h "$1" | cut -f1))"
  }
  optimize assets/hero-spark.mp4
  optimize assets/craftsmanship-detail.mp4
  optimize assets/gift-reveal.mp4
  optimize assets/finale.mp4
  echo "  → metadata now loads instantly and every ~6th frame is a keyframe, so seeking is fast."
else
  echo "  ✗ ffmpeg NOT found — without it the videos scrub poorly over the web."
  echo "    Install it, then re-run this script:   macOS →  brew install ffmpeg"
fi

echo "▸ Switching site to local assets…"
echo 'window.AURIELLE_USE_LOCAL = true;' > js/local-assets.js
echo "  ✓ js/local-assets.js"

echo ""
echo "✓ Done. Maison Aurielle is now fully self-contained and offline. Open index.html."
