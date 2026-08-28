/* ============================================================
   MAISON AURIELLE — interactive ring atelier (Three.js)
   Three realistic ring designs you can flip between with arrows:
     I   The Aurielle Solitaire — 4-prong brilliant + shoulder stones
     II  The Éclat Halo         — halo of diamonds + pavé band
     III The Vale Trilogy       — three stones across the shoulder
   Drag in any direction (mouse or touch) to turn the active ring.
   API: AurielleGem.init(canvas, opts) ->
        { start, stop, renderOnce, resize, setColor, next, prev, name }
   ============================================================ */
window.AurielleGem = (function () {
  function init(canvas, opts) {
    opts = opts || {};
    var stage = canvas.parentElement;
    if (typeof THREE === "undefined") { stage.classList.add("nowebgl"); return null; }

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch (e) { stage.classList.add("nowebgl"); return null; }
    if (!renderer.getContext()) { stage.classList.add("nowebgl"); return null; }

    var reduced = opts.reduced || false;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    if ("outputColorSpace" in renderer && THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
    else renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0.15, 6.2);

    /* ---- jewelry-studio environment ---- */
    function makeEnv() {
      var c = document.createElement("canvas"); c.width = 512; c.height = 256;
      var g = c.getContext("2d");
      var grd = g.createLinearGradient(0, 0, 0, 256);
      grd.addColorStop(0, "#2b2117"); grd.addColorStop(0.5, "#090810"); grd.addColorStop(1, "#141019");
      g.fillStyle = grd; g.fillRect(0, 0, 512, 256);
      function soft(x, y, w, h, col, blur) {
        g.save(); g.filter = "blur(" + blur + "px)"; g.fillStyle = col;
        g.beginPath(); g.ellipse(x, y, w, h, 0, 0, 6.283); g.fill(); g.restore();
      }
      soft(390, 46, 90, 26, "rgba(255,232,186,0.95)", 12);
      soft(120, 70, 130, 10, "rgba(210,228,248,0.85)", 8);
      soft(300, 200, 100, 12, "rgba(240,205,150,0.5)", 10);
      soft(60, 190, 60, 22, "rgba(226,168,175,0.35)", 14);
      var tex = new THREE.CanvasTexture(c);
      tex.mapping = THREE.EquirectangularReflectionMapping;
      if ("colorSpace" in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
      else tex.encoding = THREE.sRGBEncoding;
      var pmrem = new THREE.PMREMGenerator(renderer); pmrem.compileEquirectangularShader();
      var env = pmrem.fromEquirectangular(tex).texture; tex.dispose(); pmrem.dispose(); return env;
    }
    var envMap = makeEnv();
    scene.environment = envMap;

    /* ---- shared materials ---- */
    var goldMat = new THREE.MeshPhysicalMaterial({
      color: 0xd9b26a, metalness: 1.0, roughness: 0.12,
      envMap: envMap, envMapIntensity: 1.6, clearcoat: 0.6, clearcoatRoughness: 0.2
    });
    var goldSoftMat = new THREE.MeshPhysicalMaterial({
      color: 0xcfa75f, metalness: 1.0, roughness: 0.28, envMap: envMap, envMapIntensity: 1.3
    });
    var diamondMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0, roughness: 0.015,
      transmission: 1.0, ior: 2.417, thickness: 0.55,
      envMap: envMap, envMapIntensity: 2.4, clearcoat: 1.0, clearcoatRoughness: 0.03,
      iridescence: 0.55, iridescenceIOR: 1.35, specularIntensity: 1.0, flatShading: true,
      attenuationColor: new THREE.Color(0xffffff), attenuationDistance: 3.0
    });
    function shiftMat() { // colour-shifting stone material (one instance per stone group)
      return new THREE.MeshPhysicalMaterial({
        color: 0xffffff, metalness: 0, roughness: 0.02, transmission: 1.0, ior: 2.3,
        thickness: 0.4, envMap: envMap, envMapIntensity: 2.1, clearcoat: 1.0, clearcoatRoughness: 0.04,
        attenuationColor: new THREE.Color(0xefe0c2), attenuationDistance: 0.7, flatShading: true
      });
    }

    /* ---- faceted brilliant-cut stone ---- */
    function brilliant(size, mat, segs) {
      segs = segs || 16;
      var grp = new THREE.Group();
      var c1 = new THREE.Mesh(new THREE.CylinderGeometry(size * 0.55, size * 0.82, size * 0.20, segs, 1), mat); c1.position.y = size * 0.30;
      var c2 = new THREE.Mesh(new THREE.CylinderGeometry(size * 0.82, size, size * 0.20, segs, 1), mat); c2.position.y = size * 0.10;
      var gd = new THREE.Mesh(new THREE.CylinderGeometry(size, size, size * 0.06, segs, 1), mat); gd.position.y = -size * 0.03;
      var pv = new THREE.Mesh(new THREE.ConeGeometry(size, size * 1.15, segs), mat); pv.rotation.x = Math.PI; pv.position.y = -size * 0.635;
      grp.add(c1); grp.add(c2); grp.add(gd); grp.add(pv);
      return grp;
    }
    var prongGeo = (typeof THREE.CapsuleGeometry === "function")
      ? new THREE.CapsuleGeometry(0.032, 0.30, 4, 8)
      : new THREE.CylinderGeometry(0.032, 0.038, 0.34, 8);

    var BAND_R = 1.05;

    /* ============ Design I — The Aurielle Solitaire ============ */
    function buildSolitaire() {
      var g = new THREE.Group(), stones = [];
      g.add(new THREE.Mesh(new THREE.TorusGeometry(BAND_R, 0.105, 42, 160), goldMat));
      g.add(new THREE.Mesh(new THREE.TorusGeometry(BAND_R, 0.085, 30, 120), goldSoftMat));
      var headY = BAND_R + 0.13;
      var seat = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.14, 0.16, 16), goldMat); seat.position.y = headY + 0.02; g.add(seat);
      var rail = new THREE.Mesh(new THREE.TorusGeometry(0.205, 0.028, 12, 40), goldMat); rail.rotation.x = Math.PI / 2; rail.position.y = headY + 0.10; g.add(rail);
      var main = brilliant(0.30, diamondMat, 16); main.position.y = headY + 0.27; g.add(main);
      for (var p = 0; p < 4; p++) {
        var a = Math.PI / 4 + p * Math.PI / 2;
        var prong = new THREE.Mesh(prongGeo, goldMat);
        prong.position.set(Math.cos(a) * 0.282, headY + 0.24, Math.sin(a) * 0.282);
        prong.rotation.z = -Math.cos(a) * 0.22; prong.rotation.x = Math.sin(a) * 0.22;
        g.add(prong);
      }
      [-30, 30].forEach(function (deg) {
        var a = deg * Math.PI / 180;
        var s = brilliant(0.13, shiftMat(), 12);
        s.position.set(Math.sin(a) * (BAND_R + 0.10), Math.cos(a) * (BAND_R + 0.10), 0); s.rotation.z = -a;
        g.add(s); stones.push(s);
        var bz = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.06, 0.10, 10), goldMat);
        bz.position.set(Math.sin(a) * (BAND_R + 0.02), Math.cos(a) * (BAND_R + 0.02), 0); bz.rotation.z = -a; g.add(bz);
      });
      return { group: g, stones: stones, name: "The Aurielle Solitaire" };
    }

    /* ============ Design II — The Éclat Halo ============ */
    function buildHalo() {
      var g = new THREE.Group(), stones = [];
      g.add(new THREE.Mesh(new THREE.TorusGeometry(BAND_R, 0.085, 40, 150), goldMat));
      var headY = BAND_R + 0.10;
      var seat = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.12, 0.14, 16), goldMat); seat.position.y = headY + 0.02; g.add(seat);
      // halo plate
      var plate = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.045, 12, 44), goldMat);
      plate.rotation.x = Math.PI / 2; plate.position.y = headY + 0.16; g.add(plate);
      // centre stone (colour-shifting — the Éclat signature)
      var centre = brilliant(0.22, shiftMat(), 16); centre.position.y = headY + 0.26; g.add(centre); stones.push(centre);
      // halo of small diamonds
      for (var i = 0; i < 12; i++) {
        var a = i / 12 * Math.PI * 2;
        var s = brilliant(0.055, diamondMat, 10);
        s.position.set(Math.cos(a) * 0.34, headY + 0.20, Math.sin(a) * 0.34);
        g.add(s);
      }
      // pavé along the shoulders
      [-38, -26, -14, 14, 26, 38].forEach(function (deg) {
        var a = deg * Math.PI / 180;
        var s = brilliant(0.048, diamondMat, 10);
        s.position.set(Math.sin(a) * (BAND_R + 0.085), Math.cos(a) * (BAND_R + 0.085), 0); s.rotation.z = -a;
        g.add(s);
      });
      return { group: g, stones: stones, name: "The Éclat Halo" };
    }

    /* ============ Design III — The Vale Trilogy ============ */
    function buildTrilogy() {
      var g = new THREE.Group(), stones = [];
      g.add(new THREE.Mesh(new THREE.TorusGeometry(BAND_R, 0.115, 42, 160), goldMat));
      g.add(new THREE.Mesh(new THREE.TorusGeometry(BAND_R, 0.09, 30, 120), goldSoftMat));
      // three stones: bright centre + two colour-shifting sides
      var defs = [ { deg: 0, size: 0.24, shift: false }, { deg: -21, size: 0.165, shift: true }, { deg: 21, size: 0.165, shift: true } ];
      defs.forEach(function (d) {
        var a = d.deg * Math.PI / 180;
        var r = BAND_R + 0.10 + d.size * 0.9;
        var seat = new THREE.Mesh(new THREE.CylinderGeometry(d.size * 0.62, d.size * 0.4, 0.14, 12), goldMat);
        seat.position.set(Math.sin(a) * (BAND_R + 0.07), Math.cos(a) * (BAND_R + 0.07), 0); seat.rotation.z = -a; g.add(seat);
        var s = brilliant(d.size, d.shift ? shiftMat() : diamondMat, 16);
        s.position.set(Math.sin(a) * r, Math.cos(a) * r, 0); s.rotation.z = -a;
        g.add(s); if (d.shift) stones.push(s);
      });
      return { group: g, stones: stones, name: "The Vale Trilogy" };
    }

    /* ---- carousel state ---- */
    var designs = [buildSolitaire, buildHalo, buildTrilogy];
    var built = [null, null, null];
    var idx = 0, active = null, mountScale = 1.0;
    function getDesign(i) { if (!built[i]) built[i] = designs[i](); return built[i]; }
    function fitScale() {
      // portrait stages (tablet/mobile) get a smaller ring, raised in frame,
      // so it never collides with the carousel controls
      var w = stage.clientWidth || 1, h = stage.clientHeight || 1;
      return (h > w * 0.95) ? 0.88 : 1.0;
    }
    function mount(i) {
      active = getDesign(i);
      mountScale = fitScale();
      active.group.position.y = 0.16; // lifted — the controls tuck just beneath
      active.group.scale.setScalar(mountScale);
      scene.add(active.group);
      if (locked) applyColor(locked);
    }
    mount(0);

    var introT = 0; // 0..1 intro progress for the incoming ring (self-animated)
    function switchTo(dir) {
      // Bulletproof: swap immediately, animate only the intro of the new ring.
      // No external callbacks — nothing can leave the carousel stuck.
      try {
        scene.remove(active.group);
        idx = (idx + dir + designs.length) % designs.length;
        mount(idx);
        introT = 0; // frame() eases it to 1 (scale-up + settle spin)
        tRot.y = cRot.y - dir * 0.7; // slight turn-in from the travel direction
        if (!running) renderOnce();
      } catch (e) { /* keep the stage alive no matter what */ }
      return active ? active.name : "";
    }

    /* ---- lights ---- */
    scene.add(new THREE.AmbientLight(0x14121a, 0.65));
    var key = new THREE.DirectionalLight(0xffe3ae, 2.4); key.position.set(4, 5, 4); scene.add(key);
    var rim = new THREE.DirectionalLight(0xa6c9e8, 1.7); rim.position.set(-5, -1, -4); scene.add(rim);
    var spark = new THREE.PointLight(0xffffff, 1.25, 40); spark.position.set(0, 2, 5); scene.add(spark);

    /* ---- floating dust ---- */
    var dust = null;
    if (!reduced) {
      var N = 220, dg = new THREE.BufferGeometry(), dp = new Float32Array(N * 3);
      for (var i = 0; i < N; i++) { dp[i*3] = (Math.random()-0.5)*9; dp[i*3+1] = (Math.random()-0.5)*7; dp[i*3+2] = (Math.random()-0.5)*5 - 1; }
      dg.setAttribute("position", new THREE.BufferAttribute(dp, 3));
      dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xf0e0c2, size: 0.03, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }));
      scene.add(dust);
    }

    /* ---- colour moods ---- */
    var moods = [0xefe0c2, 0x9fc7ea, 0x79b89b, 0xb39ad8, 0xe2a8af, 0x5170b2].map(function (h) { return new THREE.Color(h); });
    var cA = new THREE.Color(), cB = new THREE.Color(), cCur = new THREE.Color();
    var locked = null;

    var _white = new THREE.Color(0xffffff), _tmp = new THREE.Color();
    function tintStones(color, vivid) {
      if (!active) return;
      for (var k = 0; k < active.stones.length; k++) {
        active.stones[k].children.forEach(function (m) {
          var mat = m.material;
          if (!mat.attenuationColor) return;
          mat.attenuationColor.copy(color);
          if (vivid) {
            mat.attenuationDistance = 0.3;
            mat.color.copy(_tmp.copy(_white).lerp(color, 0.5));       // body takes the hue
            if (mat.emissive) mat.emissive.copy(color).multiplyScalar(0.42); // inner glow
          } else {
            mat.attenuationDistance = 0.7;
            mat.color.copy(_white);
            if (mat.emissive) mat.emissive.setRGB(0, 0, 0);
          }
        });
      }
    }
    function applyColor(color) { tintStones(color, true); }

    /* ---- interaction: free drag, mouse AND touch ---- */
    var tRot = { x: -0.30, y: -0.5 }, cRot = { x: -0.30, y: -0.5 };
    var vel = { x: 0, y: 0 }, dragging = false, lastX = 0, lastY = 0;
    canvas.style.touchAction = "none";
    canvas.style.cursor = "grab";
    function down(e) { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.style.cursor = "grabbing"; if (canvas.setPointerCapture) try { canvas.setPointerCapture(e.pointerId); } catch (x) {} }
    function move(e) {
      if (!dragging) return;
      var dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY;
      tRot.y += dx * 0.008; vel.y = dx * 0.008;
      tRot.x += dy * 0.007; tRot.x = Math.max(-1.2, Math.min(1.2, tRot.x)); vel.x = dy * 0.007;
      spark.position.x = (e.clientX / window.innerWidth - 0.5) * 8;
      if (reduced) renderOnce();
    }
    function up() { dragging = false; canvas.style.cursor = "grab"; }
    canvas.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);

    /* ---- sizing ---- */
    function resize() {
      var w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
      if (active) {
        mountScale = fitScale();
        if (introT >= 1) active.group.scale.setScalar(mountScale);
      }
    }
    var ro = ("ResizeObserver" in window) ? new ResizeObserver(function () { resize(); renderOnce(); }) : null;
    if (ro) ro.observe(stage); else window.addEventListener("resize", resize);
    resize();

    /* ---- loop ---- */
    var running = false, raf = 0, t0 = performance.now();
    function frame(now) {
      if (!running) return;
      var t = (now - t0) / 1000;
      if (!dragging) {
        tRot.y += (reduced ? 0 : 0.0024) + vel.y;
        tRot.x += vel.x;
        vel.y *= 0.94; vel.x *= 0.9;
      }
      cRot.x += (tRot.x - cRot.x) * 0.1;
      cRot.y += (tRot.y - cRot.y) * 0.1;
      if (active) {
        active.group.rotation.x = cRot.x;
        active.group.rotation.y = cRot.y;
        if (introT < 1) { // self-contained arrival animation for a new design
          introT = Math.min(1, introT + 0.055);
          var e = 1 - Math.pow(1 - introT, 3); // ease-out cubic
          active.group.scale.setScalar(mountScale * (0.55 + 0.45 * e));
        }
      }

      if (!locked) {
        var phase = (t * 0.12) % 1; var seg = phase * moods.length; var mi = Math.floor(seg), fr = seg - mi;
        cA.copy(moods[mi % moods.length]); cB.copy(moods[(mi + 1) % moods.length]); cCur.copy(cA).lerp(cB, fr);
        tintStones(cCur);
      }
      diamondMat.iridescenceIOR = 1.28 + Math.sin(t * 0.6) * 0.12;
      if (dust) dust.rotation.y = t * 0.02;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }
    function renderOnce() { resize(); renderer.render(scene, camera); }
    function start() { if (running) return; running = true; t0 = performance.now(); raf = requestAnimationFrame(frame); }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); }

    function setColor(hex) {
      if (hex === null || hex === undefined || hex === false) {
        locked = null;
        diamondMat.attenuationColor.set(0xffffff); diamondMat.attenuationDistance = 3.0;
        diamondMat.color.set(0xffffff);
        if (diamondMat.emissive) diamondMat.emissive.setRGB(0, 0, 0);
        tintStones(cCur || _white, false);
        if (!running) renderOnce();
        return;
      }
      locked = new THREE.Color(hex);
      // main diamonds take the hue strongly so the change reads on every design
      diamondMat.attenuationColor.copy(locked); diamondMat.attenuationDistance = 0.5;
      diamondMat.color.copy(_tmp.copy(_white).lerp(locked, 0.45));
      if (diamondMat.emissive) diamondMat.emissive.copy(locked).multiplyScalar(0.35);
      applyColor(locked);
      if (!running) renderOnce();
    }

    if (reduced) renderOnce();
    return {
      start: start, stop: stop, renderOnce: renderOnce, resize: resize, setColor: setColor,
      next: function () { return switchTo(1); },
      prev: function () { return switchTo(-1); },
      name: function () { return active ? active.name : ""; }
    };
  }
  return { init: init };
})();
