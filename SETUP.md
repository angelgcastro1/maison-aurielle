# Maison Aurielle — main project folder

This is the complete, self-contained site. Everything (code, fonts, libraries,
video, photography) lives inside this folder.

## 1. Add the media

Download **maison-aurielle-assets.zip** (link provided in chat), unzip it, and
drop the resulting `assets` folder **inside this folder**, merging with the
existing one. When done you should have:

```
maison-aurielle/
├── index.html
├── css/styles.css
├── js/  media.js · main.js · hero3d.js · local-assets.js
├── vendor/  three · gsap · ScrollTrigger · lenis
├── fonts/   Cormorant · Inter
└── assets/
    ├── hero-spark.mp4  craftsmanship-detail.mp4  gift-reveal.mp4
    ├── finale.mp4      private-bracelet.mp4      private-bracelet-m.mp4
    ├── posters/   hero.png craft.png gift.png finale.png private.png
    ├── products/  ring necklace bracelet earrings pendant band (.png)
    ├── story/     light.png
    └── ring/      ring.png
```

## 2. Open it

Double-click `index.html`. The site now runs entirely from these files —
no internet required, nothing depends on an external CDN.

## 3. Deploy (optional)

Push the whole folder to GitHub and import it on Vercel (Framework: **Other**,
no build command, output directory `.`). Every future change: edit here, commit,
push — Vercel redeploys automatically.

## Notes
- `js/local-assets.js` sets `AURIELLE_USE_LOCAL = true`, which makes the site use
  these local files. If any file is missing it quietly falls back to the original
  CDN copy, so nothing ever breaks.
- Keep this folder as your master copy — it is the backup.
