# Fix the laggy scrub — optimize the videos (one time, ~5 min)

**Why it lags:** the generated MP4s store their metadata (`moov`) at the *end* of the file.
Locally that's invisible (the file is already on disk). Over the network, the browser must
download the **entire** video before it can seek a single frame — so scrubbing stalls.

**The fix:** re-encode with `+faststart` (metadata moved to the front) and dense keyframes
(one every ~6 frames) so any frame can be jumped to instantly. This is exactly what real
scroll-scrub sites do. Your scroll-scrubbing behaviour does not change — it just gets smooth.

---

## Do this once, in Terminal

```bash
# 1 · install ffmpeg (once on your Mac)
brew install ffmpeg

# 2 · go to your project folder (the one with index.html)
cd path/to/maison-aurielle

# 3 · download + optimize all media, and switch the site to local files
bash localize.sh
```

`localize.sh` already does the download **and** the optimization. When it finishes you should see
four optimized files:

```bash
ls -lh assets/*.mp4
# hero-spark.mp4  craftsmanship-detail.mp4  gift-reveal.mp4  finale.mp4

cat js/local-assets.js
# → window.AURIELLE_USE_LOCAL = true;
```

If `assets/*.mp4` is empty, stop — the deploy will 404 again (that's what happened last time).

## Then ship it

```bash
git add -A
git commit -m "Bundle + optimize media for smooth scroll-scrubbing"
git push          # Vercel redeploys automatically
```

---

## Verify it worked

After the deploy finishes, load the site and check that a video reports data:

```bash
# should print a duration, not 0
```
Or simply scroll the hero — the ring should now track your scroll instantly.

---

## Manual alternative (if you'd rather not run the script)

Already have the four mp4s in `assets/`? Just optimize them in place:

```bash
cd assets
for f in hero-spark craftsmanship-detail gift-reveal finale; do
  ffmpeg -y -i "$f.mp4" -an -c:v libx264 -preset slow -crf 20 \
    -g 6 -keyint_min 6 -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart \
    "$f.opt.mp4" && mv "$f.opt.mp4" "$f.mp4"
done
```

Then set `js/local-assets.js` to:

```js
window.AURIELLE_USE_LOCAL = true;
```

commit, and push.

---

### What each flag does
| flag | why |
|---|---|
| `-movflags +faststart` | moves `moov` metadata to the front → video is seekable immediately |
| `-g 6 -keyint_min 6 -sc_threshold 0` | a keyframe every 6 frames → any scroll position decodes fast |
| `-crf 20 -preset slow` | high visual quality at a reasonable file size |
| `-an` | drops audio (these are silent cinematic clips) |

### If files feel too large
Add `-vf "scale=1600:-2"` to the ffmpeg command — still sharp full-bleed, noticeably lighter.
