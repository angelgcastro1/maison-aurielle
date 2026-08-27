# Deploy Maison Aurielle — GitHub + Vercel (self-hosted media)

Prepared for you: `vercel.json` and a `.gitignore` set to commit the media. It's a
**static site — no build step.** Run these on your Mac (with your own GitHub + Vercel
accounts).

> **Tip:** unzip `maison-aurielle.zip` and work from that folder — it's clean, with no
> pre-existing git state. Open Terminal and `cd` into it.

---

## 1. Bundle + optimize the media  ← REQUIRED (skipping this = 404s + laggy scrub)

First install ffmpeg — it re-encodes the videos so they stream and seek smoothly on the web:

```bash
brew install ffmpeg      # macOS
```

Then download + optimize all media into `assets/` (this also flips the site to local files):

```bash
bash localize.sh
```

Verify before committing — you should see four mp4s and the local flag set:

```bash
ls -lh assets/*.mp4                 # hero-spark, craftsmanship-detail, gift-reveal, finale
cat js/local-assets.js              # → window.AURIELLE_USE_LOCAL = true;
```

## 2. Create the repo & commit

```bash
git init
git add -A
git commit -m "Maison Aurielle — cinematic jewelry experience"
```

## 3. Push to GitHub

**GitHub CLI (fastest):**
```bash
gh repo create maison-aurielle --public --source=. --remote=origin --push
```

**Or manually** — create an empty repo at https://github.com/new (name `maison-aurielle`,
no README), then:
```bash
git remote add origin https://github.com/<your-username>/maison-aurielle.git
git push -u origin main
```

## 4. Deploy to Vercel

**Dashboard (easiest):**
1. https://vercel.com/new → **Import** the `maison-aurielle` repo.
2. Framework Preset: **Other** · Build Command: *(empty)* · Output Directory: `.`
3. **Deploy** → live `*.vercel.app` URL in ~20s. Every push to `main` auto-deploys.

**Or Vercel CLI:**
```bash
npm i -g vercel
vercel          # accept defaults, no build
vercel --prod
```

---

### Notes
- After step 1, `js/local-assets.js` is set to `AURIELLE_USE_LOCAL = true` and all media is
  served from your host — nothing depends on the generation CDN.
- The video files add a few MB to the repo; that's fine for GitHub and Vercel.
- `vercel.json` sets clean URLs + long-cache headers for `/vendor` and `/fonts`.
- Pure static — no env vars, no server code.
