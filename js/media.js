/* ============================================================
   MAISON AURIELLE — media registry
   DEFAULT: loads every Higgsfield asset straight from the CDN,
   so the experience is complete the instant you open index.html
   (online). Each element also carries a fallback to the other
   source, so nothing ever ends up blank.
   OFFLINE: run ./localize.command (or localize.sh) once — it
   downloads all media into ./assets and writes js/local-assets.js
   (sets AURIELLE_USE_LOCAL=true), flipping every path to local.
   ============================================================ */
window.AURIELLE = (function () {
  var B = "https://d8j0ntlcm91z4.cloudfront.net/user_3E9CPm0AuV3q70Xl4UHu15ShiqX/";
  var W = "https://d2ol7oe51mr4n9.cloudfront.net/user_3E9CPm0AuV3q70Xl4UHu15ShiqX/"; // web-optimized re-encodes (faststart + dense keyframes)

  // local path -> remote CDN url
  var REMOTE = {
    "assets/hero-spark.mp4":           W + "d801240e-1024-4c93-81ba-a9e00d253bff.mp4",
    "assets/craftsmanship-detail.mp4": W + "d7c8ad6c-f5a2-4250-9707-fd4680803b6a.mp4",
    "assets/gift-reveal.mp4":          W + "cc13af38-43f1-4d89-a48e-38dce749844f.mp4",
    "assets/posters/hero.png":  B + "hf_20260706_054146_f60cc815-402b-4ab6-87ec-cec6b55b645a.png",
    "assets/posters/craft.png": B + "hf_20260706_054149_8172c138-5c40-4982-aac7-70fe5ba90f4a.png",
    "assets/posters/gift.png":  B + "hf_20260706_054151_fb9fc71d-e413-43a2-96a2-ff6c2608a2a5.png",
    "assets/products/ring.png":     B + "hf_20260706_054842_0387c4ed-323b-4ac1-9d34-b91ac5818cfb.png",
    "assets/products/necklace.png": B + "hf_20260706_054843_2714f35b-b925-402a-a1cd-acd0a7115ed9.png",
    "assets/products/bracelet.png": B + "hf_20260706_054844_a0623321-330e-419b-ba35-c54224ec5351.png",
    "assets/products/earrings.png": B + "hf_20260706_054846_05e11312-023d-4c97-8137-e10df62ac587.png",
    "assets/products/pendant.png":  B + "hf_20260706_054848_083d3e20-ebee-466c-8a3b-0304d80d8893.png",
    "assets/story/light.png":       B + "hf_20260706_065348_8fb69b83-715a-40ec-8459-dc0d95694580.png",
    "assets/ring/ring.png":         B + "hf_20260706_071121_f35f5d7f-65fb-4ca7-9f0a-d2f31742912e.png",
    "assets/finale.mp4":            W + "4de412ef-67d3-4094-989e-144cee50b5f9.mp4",
    "assets/private-bracelet.mp4":  W + "f3dffac4-1f7c-402d-ac8d-5847d4046fe3.mp4",
    "assets/posters/private.png":   B + "hf_20260828_151459_e26f8fff-b4ca-40de-9b09-88873337626b.png",
    "assets/posters/finale.png":    B + "hf_20260706_054146_f60cc815-402b-4ab6-87ec-cec6b55b645a.png"
  };

  // Touch-device encodes: 1080px, high quality, dense keyframes — sharp on
  // tablets while still decoding fast enough for smooth scroll-scrubbing.
  var MOBILE = {
    "assets/hero-spark.mp4":           W + "1c184008-b1fc-48fd-9ad9-bc5291c4f2bb.mp4",
    "assets/craftsmanship-detail.mp4": W + "909eaf8a-ba78-4eb8-a74d-d2b814eeabe0.mp4",
    "assets/gift-reveal.mp4":          W + "daf1a895-974a-4ada-a414-644e00cf4d19.mp4",
    "assets/finale.mp4":               W + "6da1570c-8140-4ad7-97e8-1dc5961be598.mp4",
    "assets/private-bracelet.mp4":     W + "27a9dd88-58b6-4c1c-a308-97717501900f.mp4"
  };
  var IS_TOUCH = window.matchMedia && window.matchMedia("(hover:none)").matches;

  // localize.sh writes js/local-assets.js which sets this true
  var USE_LOCAL = !!window.AURIELLE_USE_LOCAL;

  // returns { primary, fallback } for a given local path
  function pick(localPath) {
    var remote = REMOTE[localPath];
    // touch devices get the lightweight mobile encode when one exists
    if (IS_TOUCH && MOBILE[localPath]) remote = MOBILE[localPath];
    return USE_LOCAL
      ? { primary: localPath, fallback: remote }
      : { primary: remote || localPath, fallback: localPath };
  }

  var catalog = [
    { id:"ring",     name:"The Aurielle Ring",      desc:"A quiet spark of forever, shaped in gold and light.",   material:"18k gold · 1.8ct · signature stone", price:"$14,200",          img:"assets/products/ring.png" },
    { id:"necklace", name:"The Luma Necklace",      desc:"A single point of brilliance, kept close to the heart.", material:"18k gold · 0.9ct diamond",            price:"$6,800",           img:"assets/products/necklace.png" },
    { id:"bracelet", name:"The Vale Bracelet",      desc:"A line of light that follows every gesture.",           material:"18k gold · pavé diamonds",            price:"$4,950",           img:"assets/products/bracelet.png" },
    { id:"earrings", name:"The Seraphine Earrings", desc:"Two cascades of fire, worn like a whisper.",            material:"18k gold · diamond · sapphire",       price:"$8,400",           img:"assets/products/earrings.png" },
    { id:"pendant",  name:"The Éclat Pendant",      desc:"One stone. An endless weather of colour.",              material:"18k gold · 3.2ct signature stone",    price:"Price on request", img:"assets/products/pendant.png" }
  ];

  // Wire an <img>: load primary, swap to fallback on error.
  function wireImage(img) {
    if (!img || img.__wired) return;
    img.__wired = true;
    var r = pick(img.getAttribute("data-local"));
    img.addEventListener("error", function onerr() {
      img.removeEventListener("error", onerr);
      if (r.fallback && img.src.indexOf(r.fallback) === -1) img.src = r.fallback;
    });
    img.src = r.primary || "";
  }

  function video(key) { return pick("assets/" + ({ hero:"hero-spark.mp4", craft:"craftsmanship-detail.mp4", gift:"gift-reveal.mp4", finale:"finale.mp4", private:"private-bracelet.mp4" }[key])); }
  function poster(key) { return pick("assets/posters/" + key + ".png"); }

  return { REMOTE:REMOTE, USE_LOCAL:USE_LOCAL, catalog:catalog, wireImage:wireImage, video:video, poster:poster, pick:pick };
})();
