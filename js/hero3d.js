/* ============================================================
   MAISON AURIELLE — interactive signature ring (Three.js)
   A real-time 3D diamond ring: polished gold band, brilliant-cut
   diamond and two colour-shifting accent stones. Click / touch and
   drag to rotate it in the light. Self-contained, works offline.
   Public API kept as AurielleGem.init(canvas, opts) -> {start,stop,...}
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
    renderer.toneMappingExposure = 1.18;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 5.4);

    // ---- procedural boutique environment ----
    function makeEnv() {
      var c = document.createElement("canvas"); c.width = 128; c.height = 64;
      var g = c.getContext("2d");
      var grd = g.createLinearGradient(0, 0, 0, 64);
      grd.addColorStop(0, "#33271a"); grd.addColorStop(0.45, "#0b0a0d"); grd.addColorStop(1, "#10151f");
      g.fillStyle = grd; g.fillRect(0, 0, 128, 64);
      function glow(x, y, r, col) { var rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, col); rg.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = rg; g.fillRect(0, 0, 128, 64); }
      glow(94, 12, 40, "rgba(255,228,175,0.98)");  // warm key
      glow(26, 46, 30, "rgba(150,190,235,0.7)");   // cool rim
      glow(64, 62, 34, "rgba(226,168,175,0.4)");   // soft bounce
      var tex = new THREE.CanvasTexture(c);
      tex.mapping = THREE.EquirectangularReflectionMapping;
      if ("colorSpace" in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
      else tex.encoding = THREE.sRGBEncoding;
      var pmrem = new THREE.PMREMGenerator(renderer); pmrem.compileEquirectangularShader();
      var env = pmrem.fromEquirectangular(tex).texture; tex.dispose(); pmrem.dispose(); return env;
    }
    var envMap = makeEnv();
    scene.environment = envMap;

    // ---- materials ----
    var goldMat = new THREE.MeshPhysicalMaterial({
      color: 0xdcb878, metalness: 1.0, roughness: 0.17,
      envMap: envMap, envMapIntensity: 1.7, clearcoat: 0.5, clearcoatRoughness: 0.25
    });
    var diamondMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0, roughness: 0.02,
      transmission: 1.0, ior: 2.4, thickness: 0.6,
      envMap: envMap, envMapIntensity: 2.2, clearcoat: 1.0, clearcoatRoughness: 0.05,
      iridescence: 0.7, iridescenceIOR: 1.4, specularIntensity: 1.0, flatShading: true,
      attenuationColor: new THREE.Color(0xffffff), attenuationDistance: 3.0
    });
    function accentMat() {
      return new THREE.MeshPhysicalMaterial({
        color: 0xffffff, metalness: 0, roughness: 0.03, transmission: 1.0, ior: 2.2,
        thickness: 0.4, envMap: envMap, envMapIntensity: 2.0, clearcoat: 1.0,
        attenuationColor: new THREE.Color(0xefe0c2), attenuationDistance: 0.8, flatShading: true
      });
    }

    // ---- brilliant-cut gem builder (crown + pavilion) ----
    function brilliant(size, mat) {
      var grp = new THREE.Group();
      var crownH = size * 0.5, pavH = size * 1.25;
      var crown = new THREE.Mesh(new THREE.CylinderGeometry(size * 0.55, size, crownH, 8), mat);
      crown.position.y = crownH / 2;
      var girdle = new THREE.Mesh(new THREE.CylinderGeometry(size, size, size * 0.08, 8), mat);
      var pav = new THREE.Mesh(new THREE.ConeGeometry(size, pavH, 8), mat);
      pav.rotation.x = Math.PI; pav.position.y = -pavH / 2;
      grp.add(crown); grp.add(girdle); grp.add(pav);
      return grp;
    }

    // ---- the ring ----
    var ring = new THREE.Group();
    var bandR = 1.05;
    var band = new THREE.Mesh(new THREE.TorusGeometry(bandR, 0.135, 30, 150), goldMat);
    ring.add(band);

    // main diamond, sitting at the top of the band (12 o'clock), table facing out
    var main = brilliant(0.34, diamondMat);
    main.position.set(0, bandR + 0.30, 0);
    ring.add(main);

    // little gold setting/bezel under the main stone
    var bezel = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.22, 0.20, 12), goldMat);
    bezel.position.set(0, bandR + 0.06, 0);
    ring.add(bezel);

    // two colour-shifting accent stones flanking the main stone
    var accents = [];
    [ -26, 26 ].forEach(function (deg) {
      var a = deg * Math.PI / 180;
      var s = brilliant(0.15, accentMat());
      s.position.set(Math.sin(a) * (bandR + 0.14), Math.cos(a) * (bandR + 0.14), 0);
      s.rotation.z = -a;
      ring.add(s); accents.push(s);
    });

    ring.position.y = -0.35;
    ring.scale.setScalar(1.12);
    scene.add(ring);

    // ---- lights ----
    scene.add(new THREE.AmbientLight(0x141018, 0.7));
    var key = new THREE.DirectionalLight(0xffe2ac, 2.6); key.position.set(4, 5, 4); scene.add(key);
    var rim = new THREE.DirectionalLight(0x9fc7ea, 1.9); rim.position.set(-5, -1, -4); scene.add(rim);
    var spark = new THREE.PointLight(0xffffff, 1.3, 40); spark.position.set(0, 2, 5); scene.add(spark);

    // ---- floating dust ----
    var dust = null;
    if (!reduced) {
      var N = 240, dg = new THREE.BufferGeometry(), dp = new Float32Array(N * 3);
      for (var i = 0; i < N; i++) { dp[i*3] = (Math.random()-0.5)*9; dp[i*3+1] = (Math.random()-0.5)*7; dp[i*3+2] = (Math.random()-0.5)*5 - 1; }
      dg.setAttribute("position", new THREE.BufferAttribute(dp, 3));
      dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xf0e0c2, size: 0.03, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }));
      scene.add(dust);
    }

    // ---- colour moods for accents / sparkle ----
    var moods = [0xefe0c2, 0x9fc7ea, 0x79b89b, 0xb39ad8, 0xe2a8af, 0x5170b2].map(function (h) { return new THREE.Color(h); });
    var cA = new THREE.Color(), cB = new THREE.Color(), cCur = new THREE.Color();
    var locked = null; // when set, the stones hold this colour instead of auto-drifting

    // ---- interaction: click / touch + drag to rotate ----
    var tRot = { x: -0.32, y: -0.5 }, cRot = { x: -0.32, y: -0.5 };
    var vel = { x: 0, y: 0 }, dragging = false, lastX = 0, lastY = 0, moved = false;
    canvas.style.touchAction = "pan-y";
    canvas.style.cursor = "grab";

    function down(e) { dragging = true; moved = false; lastX = e.clientX; lastY = e.clientY; canvas.style.cursor = "grabbing"; if (canvas.setPointerCapture) try { canvas.setPointerCapture(e.pointerId); } catch (x) {} }
    function move(e) {
      if (!dragging) return;
      var dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY;
      if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
      tRot.y += dx * 0.008; vel.y = dx * 0.008;
      if (e.pointerType !== "touch") { tRot.x += dy * 0.007; tRot.x = Math.max(-1.1, Math.min(1.1, tRot.x)); vel.x = dy * 0.007; }
      spark.position.x = (e.clientX / window.innerWidth - 0.5) * 8;
      if (reduced) renderOnce();
    }
    function up() { dragging = false; canvas.style.cursor = "grab"; }
    canvas.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);

    // ---- sizing ----
    function resize() {
      var w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    var ro = ("ResizeObserver" in window) ? new ResizeObserver(function () { resize(); renderOnce(); }) : null;
    if (ro) ro.observe(stage); else window.addEventListener("resize", resize);
    resize();

    // ---- loop ----
    var running = false, raf = 0, t0 = performance.now();
    function frame(now) {
      if (!running) return;
      var t = (now - t0) / 1000;
      if (!dragging) {
        tRot.y += (reduced ? 0 : 0.0026) + vel.y; // gentle idle spin + inertia
        tRot.x += vel.x;
        vel.y *= 0.94; vel.x *= 0.9;
      }
      cRot.x += (tRot.x - cRot.x) * 0.1;
      cRot.y += (tRot.y - cRot.y) * 0.1;
      ring.rotation.x = cRot.x; ring.rotation.y = cRot.y;

      // colour drift on accents (only when not locked to a chosen colour)
      if (!locked) {
        var phase = (t * 0.12) % 1; var seg = phase * moods.length; var idx = Math.floor(seg), fr = seg - idx;
        cA.copy(moods[idx % moods.length]); cB.copy(moods[(idx + 1) % moods.length]); cCur.copy(cA).lerp(cB, fr);
        for (var k = 0; k < accents.length; k++) {
          accents[k].children.forEach(function (m) { if (m.material.attenuationColor) m.material.attenuationColor.copy(cCur); });
        }
      }
      diamondMat.iridescenceIOR = 1.3 + Math.sin(t * 0.6) * 0.15;
      if (dust) dust.rotation.y = t * 0.02;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }
    function renderOnce() { resize(); renderer.render(scene, camera); }
    function start() { if (running) return; running = true; t0 = performance.now(); raf = requestAnimationFrame(frame); }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); }

    // set the signature stone (main solitaire + accents) to a chosen colour,
    // or pass null to resume the automatic colour drift.
    function setColor(hex) {
      if (hex === null || hex === undefined || hex === false) {
        locked = null;
        diamondMat.color.set(0xffffff); diamondMat.attenuationColor.set(0xffffff);
        diamondMat.attenuationDistance = 3.0; diamondMat.emissive.set(0x000000); diamondMat.envMapIntensity = 2.2;
        for (var j = 0; j < accents.length; j++) {
          accents[j].children.forEach(function (m) {
            if (!m.material) return;
            m.material.color.set(0xffffff); if (m.material.attenuationColor) m.material.attenuationColor.set(0xefe0c2);
            m.material.emissive.set(0x000000); m.material.envMapIntensity = 2.0;
          });
        }
        if (!running) renderOnce();
        return;
      }
      var c = new THREE.Color(hex);
      locked = c;
      // strong, obvious tint: body colour + attenuation + a soft self-glow, and cut the warm env wash
      diamondMat.color.copy(c); diamondMat.attenuationColor.copy(c); diamondMat.attenuationDistance = 0.5;
      diamondMat.emissive.copy(c).multiplyScalar(0.22); diamondMat.envMapIntensity = 1.05;
      for (var k = 0; k < accents.length; k++) {
        accents[k].children.forEach(function (m) {
          if (!m.material) return;
          m.material.color.copy(c); if (m.material.attenuationColor) m.material.attenuationColor.copy(c);
          m.material.attenuationDistance = 0.35; m.material.emissive.copy(c).multiplyScalar(0.25); m.material.envMapIntensity = 1.0;
        });
      }
      if (!running) renderOnce();
    }

    if (reduced) renderOnce();
    return { start: start, stop: stop, renderOnce: renderOnce, resize: resize, setColor: setColor };
  }
  return { init: init };
})();
