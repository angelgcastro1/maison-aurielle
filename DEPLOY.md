# Deploy Maison Aurielle — GitHub + Vercel (self-hosted media)

Prepared for you: `vercel.json` and a `.gitignore` set to commit the media. It's a
**static site — no build step.** Run these on your Mac (with your own GitHub + Vercel
accounts).

> **Tip:** unzip `maison-aurielle.zip` and work from that folder — it's clean, with no
> pre-existing git state. Open Terminal and `cd` into it.

---

## 1. Bundle the media (self-hosted)

This downloads the cinematic videos + photography into `assets/` and switches the site to
use local files (my build sandbox can't reach the media CDN, so this runs on your machine):

```bash
bash localize.sh
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
