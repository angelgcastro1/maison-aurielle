/* ============================================================
   MAISON AURIELLE — experience orchestration
   Lenis · GSAP ScrollTrigger · scroll-scrubbed cinema ·
   velvet-box cart · consultation · atmosphere
   ============================================================ */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  var isTouch = window.matchMedia("(hover:none)").matches;
  var hasGSAP = typeof gsap !== "undefined";
  var doc = document.documentElement;

  document.addEventListener("DOMContentLoaded", boot);

  function boot() {
    try { run(); }
    catch (err) {
      // failsafe: never leave the page hidden
      console.error("[Aurielle]", err);
      doc.classList.remove("anim");
      var l = document.getElementById("loader"); if (l) l.classList.add("done");
    }
  }

  function run() {
    wireMedia();
    buildProducts();
    hideLoader();

    if (hasGSAP) {
      gsap.registerPlugin(ScrollTrigger);
      var lenis = initSmooth();
      chrome(lenis);
      if (!reduced) {
        [reveals, heroIntro, heroScene, storyScene, collectionTray, craftScene, giftScene, productReveals, trustReveals, finaleScene, magnetic].forEach(function (fn) {
          try { fn(); } catch (e) { console.error("[Aurielle scene]", e); }
        });
        window.addEventListener("load", function () { ScrollTrigger.refresh(); });
        setTimeout(function () { ScrollTrigger.refresh(); }, 1200);
      }
    } else {
      doc.classList.remove("anim");
    }

    atmosphere();
    gemScene();
    cart();
    consult();
    window.__aurielleReady = true;
  }

  /* ---------------- media wiring (local -> remote) ---------------- */
  function wireMedia() {
    // all static images with data-local
    document.querySelectorAll("img[data-local]").forEach(function (img) { AURIELLE.wireImage(img); });
    // cinematic videos
    setupVideo(document.getElementById("heroVideo"), "hero", { loop: false, autoplay: false });
    setupVideo(document.getElementById("craftVideo"), "craft", { loop: false, autoplay: false });
    setupVideo(document.getElementById("giftVideo"), "gift", { loop: false, autoplay: false });
    setupVideo(document.getElementById("finaleVideo"), "finale", { loop: false, autoplay: false });
  }

  function setupVideo(el, key, opt) {
    if (!el) return;
    var v = AURIELLE.video(key), p = AURIELLE.poster(key);
    el.poster = p.primary; // best effort; scrim covers if absent
    // Only fall back on a genuine load error — never on slowness, so a
    // slow-but-loading source is never abandoned for a possibly-missing one.
    var triedFallback = false;
    el.addEventListener("error", function () {
      if (triedFallback || !v.fallback || el.src.indexOf(v.fallback) !== -1) return;
      triedFallback = true; el.src = v.fallback; el.load();
    }, true);
    el.addEventListener("loadeddata", function () {
      el.classList.add("ready");
      if (opt.autoplay && !reduced) { var pr = el.play(); if (pr && pr.catch) pr.catch(function () {}); }
      else { try { el.pause(); } catch (e) {} }
      if (hasGSAP) ScrollTrigger.refresh();
    });
    el.muted = true; el.loop = !!opt.loop;
    el.src = v.primary; el.load();
  }

  /* ---------------- loader ---------------- */
  function hideLoader() {
    var loader = document.getElementById("loader");
    if (!loader) return;
    var line = loader.querySelector(".loader__line i");
    var pct = loader.querySelector(".loader__pct");
    var done = false;
    function finish() {
      if (done) return; done = true;
      loader.classList.add("done");
      setTimeout(function () { loader.style.display = "none"; }, 1100);
    }
    if (hasGSAP && line && !reduced) {
      var o = { v: 0 };
      gsap.to(line, { scaleX: 1, duration: 1.4, ease: "power2.inOut" });
      gsap.to(o, { v: 100, duration: 1.5, ease: "power1.inOut", onUpdate: function () { if (pct) pct.textContent = ("0" + Math.round(o.v)).slice(-2); },
        onComplete: function () { gsap.delayedCall(0.15, finish); } });
    } else {
      if (pct) pct.textContent = "100";
      setTimeout(finish, reduced ? 300 : 900);
    }
    // hard failsafe
    setTimeout(finish, 4200);
  }

  /* ---------------- smooth scroll ---------------- */
  function initSmooth() {
    if (reduced || typeof Lenis === "undefined") return null;
    var lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true, smoothTouch: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis;
    // anchor links
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href"); if (id.length < 2) return;
        var t = document.querySelector(id); if (!t) return;
        e.preventDefault(); lenis.scrollTo(t, { offset: 0, duration: 1.4 });
      });
    });
    return lenis;
  }

  /* ---------------- chrome: nav + scrollrail ---------------- */
  function chrome(lenis) {
    var nav = document.getElementById("nav");
    var fill = document.getElementById("scrollrailFill");
    var last = 0;
    function upd(y, prog) {
      if (nav) {
        nav.classList.toggle("solid", y > 60);
        if (y > last && y > 700) nav.classList.add("hide"); else nav.classList.remove("hide");
      }
      if (fill) fill.style.transform = "scaleY(" + (prog || 0) + ")";
      last = y;
    }
    if (lenis) { lenis.on("scroll", function (e) { upd(e.scroll || window.scrollY, e.progress || 0); }); }
    else {
      window.addEventListener("scroll", function () {
        var y = window.scrollY, h = document.body.scrollHeight - window.innerHeight;
        upd(y, h > 0 ? y / h : 0);
      }, { passive: true });
    }
  }

  /* ---------------- reveals ---------------- */
  function reveals() {
    gsap.utils.toArray("[data-reveal]").forEach(function (el) {
      if (el.closest("#hero") || el.closest("#craft") || el.closest("#gift")) return; // dedicated scenes
      gsap.fromTo(el, { opacity: 0, y: 24 }, {
        opacity: 1, y: 0, duration: 1.05, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 86%" }
      });
    });
    gsap.utils.toArray(".reveal-mask").forEach(function (mask) {
      if (mask.closest("#hero") || mask.closest("#gift") || mask.closest("#finale")) return;
      var inner = mask.querySelector("[data-reveal-y]"); if (!inner) return;
      gsap.fromTo(inner, { yPercent: 118 }, {
        yPercent: 0, duration: 1.15, ease: "power4.out",
        scrollTrigger: { trigger: mask, start: "top 90%" }
      });
    });
    gsap.utils.toArray("[data-reveal-card]").forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 42, scale: 0.985 }, {
        opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 82%" }
      });
    });
  }

  function heroIntro() {
    var tl = gsap.timeline({ delay: 2.1 });
    var lines = document.querySelectorAll("#hero .reveal-mask [data-reveal-y]");
    var eyebrow = document.querySelector("#hero .eyebrow[data-reveal]");
    var cta = document.querySelector("#hero .hero__cta[data-reveal]");
    if (eyebrow) tl.fromTo(eyebrow, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, 0);
    if (lines.length) tl.fromTo(lines, { yPercent: 120 }, { yPercent: 0, duration: 1.3, ease: "power4.out", stagger: 0.12 }, 0.15);
    if (cta) tl.fromTo(cta, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, 0.7);
  }

  /* ---------------- smooth video scrubbing engine ----------------
     Instead of snapping video.currentTime on every scroll event, we
     track a smoothed ScrollTrigger progress and ease the video toward
     it on a single rAF loop — the footage glides to the scroll position. */
  var _scrubbers = [], _scrubRunning = false;
  function smoothScrub(vid, sec) {
    if (!vid || !sec) return null;
    var st = ScrollTrigger.create({ trigger: sec, start: "top top", end: "bottom bottom", scrub: 0.6 });
    _scrubbers.push({ vid: vid, st: st, cur: 0 });
    if (!_scrubRunning) { _scrubRunning = true; requestAnimationFrame(scrubLoop); }
    return st;
  }
  function scrubLoop() {
    for (var i = 0; i < _scrubbers.length; i++) {
      var s = _scrubbers[i], vid = s.vid;
      if (vid.duration && vid.readyState >= 1) {
        var target = s.st.progress || 0;
        s.cur += (target - s.cur) * 0.16;
        if (Math.abs(target - s.cur) < 0.0006) s.cur = target;
        var tt = Math.min(vid.duration - 0.05, s.cur * vid.duration);
        if (Math.abs(vid.currentTime - tt) > 0.008) { try { vid.currentTime = tt; } catch (e) {} }
      }
    }
    requestAnimationFrame(scrubLoop);
  }

  /* ---------------- hero: scroll-scrubbed cinema ---------------- */
  function heroScene() {
    var sec = document.getElementById("hero");
    var vid = document.getElementById("heroVideo");
    if (!sec) return;
    var content = sec.querySelector(".hero__content");
    var cue = sec.querySelector(".hero__scrollcue");
    var dust = sec.querySelector(".hero__dust");
    smoothScrub(vid, sec);
    ScrollTrigger.create({
      trigger: sec, start: "top top", end: "bottom bottom", scrub: true,
      onUpdate: function (self) {
        var pr = self.progress;
        if (cue) cue.style.opacity = pr > 0.03 ? String(Math.max(0, 1 - (pr - 0.03) * 14)) : "1";
        if (content) content.style.opacity = pr < 0.55 ? "1" : String(Math.max(0, 1 - (pr - 0.55) / 0.33));
        if (dust) dust.style.opacity = String(Math.max(0.15, 1 - pr));
      }
    });
  }

  /* ---------------- story: editorial image parallax ---------------- */
  function storyScene() {
    var img = document.querySelector(".story__img");
    if (!img) return;
    gsap.fromTo(img, { yPercent: -6 }, {
      yPercent: 7, ease: "none",
      scrollTrigger: { trigger: "#story", start: "top bottom", end: "bottom top", scrub: true }
    });
  }

  /* ---------------- collection tray ---------------- */
  function collectionTray() {
    document.querySelectorAll("#tray .piece").forEach(function (piece, i) {
      var imgWrap = piece.querySelector(".piece__img");
      var glint = document.createElement("span"); glint.className = "piece__glint"; if (imgWrap) imgWrap.appendChild(glint);
      var tl = gsap.timeline({ scrollTrigger: { trigger: piece, start: "top 88%" } });
      tl.fromTo(piece, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" })
        .fromTo(glint, { opacity: 0, xPercent: -30 }, { opacity: 1, xPercent: 30, duration: 0.9, ease: "power2.inOut" }, 0.25)
        .to(glint, { opacity: 0, duration: 0.4 }, 0.9);
    });
  }

  /* ---------------- craft: scrub + points ---------------- */
  function craftScene() {
    var sec = document.getElementById("craft");
    var vid = document.getElementById("craftVideo");
    if (!sec) return;
    var points = Array.prototype.map.call(document.querySelectorAll("#craftPoints li"), function (li) {
      return { el: li, at: parseFloat(li.getAttribute("data-at")) || 0 };
    });
    smoothScrub(vid, sec);
    var active = -1;
    ScrollTrigger.create({
      trigger: sec, start: "top top", end: "bottom bottom", scrub: true,
      onUpdate: function (self) {
        var pr = self.progress;
        var idx = -1;
        for (var i = 0; i < points.length; i++) { if (pr >= points[i].at) idx = i; }
        if (pr > 0.94) idx = points.length - 1;
        if (idx !== active) {
          points.forEach(function (p, i) { p.el.classList.toggle("on", i === idx); });
          active = idx;
        }
      }
    });
    // title reveal
    var caps = document.querySelectorAll("#craft .craft__caps [data-reveal]");
    caps.forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: sec, start: "top 40%" } });
    });
  }

  /* ---------------- gift: scrub + reveal ---------------- */
  function giftScene() {
    var sec = document.getElementById("gift");
    var vid = document.getElementById("giftVideo");
    if (!sec) return;
    smoothScrub(vid, sec);
    var lines = sec.querySelectorAll(".reveal-mask [data-reveal-y]");
    var others = sec.querySelectorAll(".eyebrow[data-reveal], .gift__p[data-reveal], .btn");
    var tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top 55%" } });
    if (lines.length) tl.fromTo(lines, { yPercent: 120 }, { yPercent: 0, duration: 1.2, ease: "power4.out", stagger: 0.1 }, 0);
    if (others.length) tl.fromTo(others, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.08 }, 0.5);
  }

  /* ---------------- gemstone (Three.js) ---------------- */
  function gemScene() {
    var canvas = document.getElementById("gemCanvas");
    if (!canvas || !window.AurielleGem) { fallbackTilt(); return; }
    var gem = AurielleGem.init(canvas, { reduced: reduced });
    if (!gem) { fallbackTilt(); return; }
    if ("IntersectionObserver" in window && !reduced) {
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) { if (e.isIntersecting) gem.start(); else gem.stop(); });
      }, { threshold: 0.05 });
      io.observe(document.getElementById("gemstone"));
    } else if (!reduced) { gem.start(); }

    // colour swatches — click to set the stone, click the active one again to resume drift
    var swatches = document.querySelectorAll("#gemstone .gem__swatches li");
    swatches.forEach(function (li) {
      function activate() {
        var wasActive = li.classList.contains("active");
        swatches.forEach(function (s) { s.classList.remove("active"); });
        if (wasActive) { if (gem.setColor) gem.setColor(null); }
        else { li.classList.add("active"); if (gem.setColor) gem.setColor(li.getAttribute("data-color")); }
      }
      li.addEventListener("click", activate);
      li.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); } });
    });
  }
  function fallbackTilt() {
    var stage = document.querySelector(".gem__stage");
    var img = stage && stage.querySelector(".gem__fallback img");
    if (!img || reduced) return;
    stage.addEventListener("pointermove", function (e) {
      var r = stage.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
      img.style.transform = "perspective(820px) rotateY(" + (nx * 24) + "deg) rotateX(" + (-ny * 16) + "deg)";
    });
    stage.addEventListener("pointerleave", function () { img.style.transform = "perspective(820px) rotateY(0deg) rotateX(0deg)"; });
  }

  /* ---------------- products ---------------- */
  function buildProducts() {
    var grid = document.getElementById("productsGrid");
    if (!grid) return;
    grid.innerHTML = AURIELLE.catalog.map(function (p) {
      return '<article class="card" data-id="' + p.id + '" data-reveal-prod>' +
        '<div class="card__media">' +
          '<img alt="' + p.name + '" data-local="' + p.img + '">' +
          '<span class="card__shine"></span>' +
          '<button class="card__view btn btn--ghost" data-add="' + p.id + '">View the Piece</button>' +
        '</div>' +
        '<div class="card__body">' +
          '<h3 class="card__name">' + p.name + '</h3>' +
          '<p class="card__desc">' + p.desc + '</p>' +
          '<div class="card__foot"><span class="card__mat">' + p.material + '</span><span class="card__price">' + p.price + '</span></div>' +
        '</div>' +
      '</article>';
    }).join("");
    grid.querySelectorAll("img[data-local]").forEach(function (img) { AURIELLE.wireImage(img); });
    grid.querySelectorAll("[data-add]").forEach(function (b) {
      b.addEventListener("click", function () { addToCart(b.getAttribute("data-add")); });
    });
  }
  function productReveals() {
    gsap.utils.toArray("[data-reveal-prod]").forEach(function (el, i) {
      gsap.fromTo(el, { opacity: 0, y: 46 }, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" } });
    });
  }

  function trustReveals() {
    gsap.utils.toArray("#trust .trust__grid li").forEach(function (el, i) {
      gsap.fromTo(el, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%" }, delay: (i % 3) * 0.06 });
    });
  }

  function finaleScene() {
    var sec = document.getElementById("finale");
    var vid = document.getElementById("finaleVideo");
    var title = document.querySelectorAll("#finale .reveal-mask [data-reveal-y]");
    var cta = document.querySelector("#finale .btn");
    smoothScrub(vid, sec);
    if (vid && !reduced) {
      gsap.fromTo(vid, { scale: 1 }, {
        scale: 1.16, ease: "power2.in", transformOrigin: "50% 46%",
        scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: 0.6 }
      });
    }
    var tl = gsap.timeline({ scrollTrigger: { trigger: "#finale", start: "top 55%" } });
    if (title.length) tl.fromTo(title, { yPercent: 120 }, { yPercent: 0, duration: 1.3, ease: "power4.out", stagger: 0.14 }, 0);
    if (cta) tl.fromTo(cta, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, 0.8);
  }

  /* ---------------- magnetic buttons ---------------- */
  function magnetic() {
    if (isTouch || reduced) return;
    document.querySelectorAll("[data-magnetic]").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.28;
        var y = (e.clientY - r.top - r.height / 2) * 0.4;
        gsap.to(b, { x: x, y: y, duration: 0.5, ease: "power3.out" });
      });
      b.addEventListener("mouseleave", function () { gsap.to(b, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.4)" }); });
    });
  }

  /* ---------------- 2D atmosphere (hero + finale dust) ---------------- */
  function atmosphere() {
    dust(document.getElementById("heroDust"), { count: reduced ? 26 : 70, warm: true });
    dust(document.getElementById("finaleDust"), { count: reduced ? 20 : 60, warm: true });
  }
  function dust(canvas, opt) {
    if (!canvas) return;
    var ctx = canvas.getContext("2d"); if (!ctx) return;
    var W, H, DPR = Math.min(window.devicePixelRatio || 1, 2), parts = [], raf = 0, vis = true;
    function size() {
      var r = canvas.getBoundingClientRect(); W = r.width; H = r.height;
      canvas.width = W * DPR; canvas.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    function seed() {
      parts = []; for (var i = 0; i < opt.count; i++) parts.push({
        x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.6 + 0.3,
        vx: (Math.random() - 0.5) * 0.12, vy: -(Math.random() * 0.2 + 0.03),
        a: Math.random() * 0.5 + 0.15, tw: Math.random() * Math.PI * 2
      });
    }
    function draw(t) {
      if (!vis) { raf = requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i]; p.x += p.vx; p.y += p.vy; p.tw += 0.02;
        if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W; }
        if (p.x < -4) p.x = W + 4; if (p.x > W + 4) p.x = -4;
        var al = p.a * (0.6 + 0.4 * Math.sin(p.tw));
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = "rgba(" + (opt.warm ? "245,225,180" : "220,225,240") + "," + al + ")";
        ctx.shadowBlur = 6; ctx.shadowColor = "rgba(245,220,170,0.6)"; ctx.fill();
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(draw);
    }
    size(); seed();
    if (reduced) {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) { var p = parts[i]; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fillStyle = "rgba(245,225,180," + p.a + ")"; ctx.fill(); }
      return;
    }
    var io = ("IntersectionObserver" in window) ? new IntersectionObserver(function (e) { vis = e[0].isIntersecting; }, { threshold: 0 }) : null;
    if (io) io.observe(canvas);
    window.addEventListener("resize", function () { size(); seed(); });
    raf = requestAnimationFrame(draw);
  }

  /* ---------------- velvet-box cart ---------------- */
  function cart() {
    var items = [];
    var drawer = document.getElementById("drawer");
    var body = document.getElementById("drawerBody");
    var countEl = document.getElementById("cartCount");
    var totalEl = document.getElementById("drawerTotal");
    var openBtn = document.getElementById("cartOpen");
    var closeBtn = document.getElementById("cartClose");
    var scrim = document.getElementById("drawerScrim");

    window.__addToCart = function (id) {
      var p = AURIELLE.catalog.filter(function (x) { return x.id === id; })[0];
      if (!p) return;
      items.push(p); render(); pop(); toast("Added to your selection — " + p.name);
    };

    function money(v) { var m = String(v).replace(/[^0-9.]/g, ""); return m ? parseFloat(m) : 0; }
    function render() {
      if (countEl) countEl.textContent = items.length;
      if (!body) return;
      if (!items.length) { body.innerHTML = '<p class="drawer__empty">Your velvet tray is empty.</p>'; if (totalEl) totalEl.textContent = "—"; return; }
      body.innerHTML = items.map(function (p, i) {
        return '<div class="citem"><div class="citem__img"><img alt="" data-local="' + p.img + '"></div>' +
          '<div class="citem__info"><h4>' + p.name + '</h4><p>' + p.material + '</p>' +
          '<button class="citem__rm" data-rm="' + i + '">Remove</button></div>' +
          '<div class="citem__price">' + p.price + '</div></div>';
      }).join("");
      body.querySelectorAll("img[data-local]").forEach(function (img) { AURIELLE.wireImage(img); });
      body.querySelectorAll("[data-rm]").forEach(function (b) {
        b.addEventListener("click", function () { items.splice(parseInt(b.getAttribute("data-rm"), 10), 1); render(); });
      });
      var sum = items.reduce(function (a, p) { return a + money(p.price); }, 0);
      var onReq = items.some(function (p) { return money(p.price) === 0; });
      if (totalEl) totalEl.textContent = "$" + sum.toLocaleString("en-US") + (onReq ? " + on request" : "");
    }
    function pop() { if (!countEl) return; countEl.classList.add("pop"); setTimeout(function () { countEl.classList.remove("pop"); }, 400); }
    function open() { if (drawer) { drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); if (window.__lenis) window.__lenis.stop(); } }
    function close() { if (drawer) { drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); if (window.__lenis) window.__lenis.start(); } }
    if (openBtn) openBtn.addEventListener("click", open);
    if (closeBtn) closeBtn.addEventListener("click", close);
    if (scrim) scrim.addEventListener("click", close);
    var co = document.getElementById("checkoutBtn");
    if (co) co.addEventListener("click", function () {
      if (!items.length) { toast("Add a piece to begin."); return; }
      close(); toast("A private advisor will be in touch to complete your order.");
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    render();
    window.__cartOpen = open;
  }
  function addToCart(id) { if (window.__addToCart) window.__addToCart(id); }

  /* ---------------- consultation modal ---------------- */
  function consult() {
    var modal = document.getElementById("consult");
    var title = document.getElementById("consultTitle");
    var form = document.getElementById("consultForm");
    var ok = document.getElementById("consultOk");
    var titles = { viewing: "Reserve a Private Viewing", consultation: "Book a Consultation", custom: "Begin a Custom Piece" };
    function open(kind) { if (title && titles[kind]) title.textContent = titles[kind]; if (ok) ok.hidden = true; if (form) form.reset();
      modal.classList.add("open"); modal.setAttribute("aria-hidden", "false"); if (window.__lenis) window.__lenis.stop(); }
    function close() { modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); if (window.__lenis) window.__lenis.start(); }
    document.querySelectorAll("[data-open-consult]").forEach(function (b) {
      b.addEventListener("click", function () { open(b.getAttribute("data-open-consult")); });
    });
    var sc = document.getElementById("consultScrim"), cc = document.getElementById("consultClose");
    if (sc) sc.addEventListener("click", close); if (cc) cc.addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    if (form) form.addEventListener("submit", function (e) { e.preventDefault(); if (ok) ok.hidden = false; setTimeout(close, 2200); });
  }

  /* ---------------- toast ---------------- */
  var toastEl;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div"); toastEl.className = "toast"; document.body.appendChild(toastEl);
      var st = toastEl.style;
      st.position = "fixed"; st.left = "50%"; st.bottom = "34px"; st.transform = "translate(-50%,20px)";
      st.zIndex = 1800; st.padding = "14px 26px"; st.borderRadius = "3px";
      st.background = "linear-gradient(160deg,#1c150f,#0c0908)"; st.border = "1px solid rgba(200,163,93,.3)";
      st.color = "#f3ecdf"; st.font = "500 .72rem/1 'InterA',sans-serif"; st.letterSpacing = ".14em";
      st.textTransform = "uppercase"; st.opacity = "0"; st.transition = "opacity .5s,transform .5s";
      st.boxShadow = "0 20px 60px -20px rgba(0,0,0,.9)"; st.pointerEvents = "none"; st.maxWidth = "84vw"; st.textAlign = "center";
    }
    toastEl.textContent = msg;
    requestAnimationFrame(function () { toastEl.style.opacity = "1"; toastEl.style.transform = "translate(-50%,0)"; });
    clearTimeout(toastEl.__t);
    toastEl.__t = setTimeout(function () { toastEl.style.opacity = "0"; toastEl.style.transform = "translate(-50%,20px)"; }, 2600);
  }
})();
