# Maison Aurielle — Cinematic Luxury Jewelry Experience

A scroll-driven, film-grade boutique experience for a fictional fine-jewelry house.
Built as a self-contained site: **open `index.html` in any modern browser.**

> *“Some pieces are worn. Others are remembered.”*

---

## Quick start

1. Double-click **`index.html`**. That's it — the experience runs immediately (an internet
   connection lets it stream the cinematic 1080p footage and product photography).
2. **Optional — make it fully offline & self-contained:** run the localizer once so all media
   lives inside the folder.
   - **macOS:** double-click **`localize.command`**
   - **Any OS / terminal:** `bash localize.sh`

   This downloads the three cinematic sequences, posters and product photos into `assets/`,
   and — if `ffmpeg` is installed — slices the footage into optimized scroll frames under
   `assets/frames/`. After it runs, every asset loads locally with no network needed.

---

## What's inside

| Section | Experience |
|---|---|
| 1 · Cinematic Hero | 1080p macro ring emerging from darkness, floating dust, masked title reveal |
| 2 · The Maison Story | Editorial, slow line-by-line reveals, warm parallax glow |
| 3 · Signature Collection | Five pieces placed one-by-one onto a velvet tray, each with a light glint |
| 4 · Craftsmanship | Scroll-scrubbed macro footage; setting → gold → cut → finishing reveal in sync |
| 5 · The Aurielle Ring | **Interactive 3D ring** — click-drag to rotate a real-time diamond ring (gold band, brilliant solitaire, colour-shifting accents), lit by a procedural boutique environment |
| 6 · The Gift | Scroll-scrubbed box-opening sequence, romance-forward copy |
| 7 · Private Viewing | Invitation card → viewing / consultation / custom-piece requests |
| 8 · Featured Products | Curated, editorial cards — hover shine, price, *View the Piece* |
| 9 · Trust & Care | Certification, ethical sourcing, insured delivery, lifetime care, resizing, secure checkout |
| 10 · Legacy CTA | Ring glowing in a velvet box, dust, closing line, *Discover Maison Aurielle* |
| Cart | Slides in like a **velvet jewelry box** (lid + tray), running subtotal |

## The cinematic assets (AI-generated, Higgsfield · Seedance 2.0 · 1080p)

- `hero-spark` — diamond & gold ring emerging from shadow, gemstone colour-shift
- `craftsmanship-detail` — macro orbit over the setting, prongs and brushed gold
- `gift-reveal` — a jewelry box opening on velvet under champagne light

Each was generated from a bespoke start-frame still (also included as posters), then animated.

## Tech

- **Lenis** smooth scroll · **GSAP + ScrollTrigger** motion & pinning · **Three.js** interactive gem
- Vendored locally in `vendor/` and `fonts/` — **no CDN needed for the code or typography**
- Scroll-scrubbed `<video>` drives the "scroll = camera movement" cinema
- **Reduced-motion** honored throughout · keyboard + `Esc` support · semantic, high-contrast
- Responsive desktop → mobile (swipeable collection tray, simplified motion)
- Graceful degradation: if WebGL is unavailable, the gem falls back to an animated gradient;
  if footage can't load, posters + atmosphere carry the scene

## Structure

```
maison-aurielle/
├── index.html
├── css/styles.css
├── js/ media.js · hero3d.js · main.js
├── vendor/ three · gsap · ScrollTrigger · lenis   (local)
├── fonts/  Cormorant Garamond · Inter             (local)
├── assets/ (populated by localize — videos, posters/, products/, frames/)
├── localize.sh · localize.command
└── manifest.json
```

## Notes

- Prices, copy and the house itself are fictional, created for this concept.
- Default build streams media from the generation CDN so it looks complete the moment you open it;
  run the localizer to cut that dependency entirely.
