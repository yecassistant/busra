/* 7 Farkı Bul – oda bölümü
   İki fotoğraf piksel piksel aynı, yalnızca aşağıdaki 7 dikdörtgende farklı (koordinatlar 0–1, resim genişliği/yüksekliğine göre).
   Dokunma: üstteki ya da alttaki resim; iki parmakla yakınlaştırma, tek parmakla kaydırma (iki resim birlikte hareket eder).
   Kayıt: fark2_state (bulunanlar, yanlışlar, ipucu, süre), fark2_best, fark1_intro. (fark1_* ilk, kolay sürümdendi)
   Resimler: fark/oda-a.jpg (asıl) ve fark/oda-b.jpg (Photoshop'ta 7 fark işlenmiş). D: farkların resim üzerindeki yerleri (0–1 oran).
   DEMO = true yapılırsa oyun yine demo moduna döner (odaya bakılır, fark aranmaz). */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var DEMO = false;
  var NS = "http://www.w3.org/2000/svg", VW = 1000, VH = 805.5, ASPECT = 1600 / 1289, KEY = "fark2_state";
  var D = [
    { ad: "Masanın orta ayağı", x0: 0.5369, y0: 0.8681, x1: 0.5825, y1: 0.9387 },
    { ad: "Kupanın içi", x0: 0.4919, y0: 0.7184, x1: 0.5419, y1: 0.7502 },
    { ad: "Sağdaki kitabın sırtı", x0: 0.9800, y0: 0.4290, x1: 0.9990, y1: 0.5361 },
    { ad: "Muffindeki yaban mersini", x0: 0.6625, y0: 0.7642, x1: 0.6869, y1: 0.7936 },
    { ad: "Saatin ortasındaki yazı", x0: 0.9300, y0: 0.1086, x1: 0.9606, y1: 0.1350 },
    { ad: "Bileklikteki boncuk", x0: 0.7588, y0: 0.2746, x1: 0.7806, y1: 0.3018 },
    { ad: "Kedinin sağ gözü", x0: 0.3269, y0: 0.6152, x1: 0.3488, y1: 0.6424 }
  ];
  var found = [], wrong = 0, hints = 1, usedHints = 0, tBefore = 0, tStart = Date.now(), done = false, streak = [], waitUntil = 0;
  var picA = $("picA"), picB = $("picB"), pics = [picA, picB], layers = [picA.firstChild, picB.firstChild];
  var marks = [picA.querySelector(".fkmarks"), picB.querySelector(".fkmarks")];
  var Z = { s: 1, tx: 0, ty: 0 }, dispW = 300, dispH = 240;

  function snd(n) { if (window.FkSes) try { window.FkSes.play(n); } catch (e) {} }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function el(tag, a, p) { var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function fmt(ms) { var s = Math.round(ms / 1000), m = Math.floor(s / 60); return m + ":" + pad(s % 60); }
  var msgT = null, msgOn = false;
  function idleMsg() { var m = $("msg"); m.className = "fkmsg"; m.textContent = Z.s > 1.01 ? "Tek parmakla kaydır." : DEMO ? "Demo · odaya göz atabilirsin." : "İki parmakla yakınlaştırabilirsin."; }
  function msg(t, bad) { var m = $("msg"); m.textContent = t; m.className = "fkmsg" + (bad ? " bad" : ""); msgOn = true; clearTimeout(msgT); msgT = setTimeout(function () { msgOn = false; idleMsg(); }, 2200); }

  /* ---- kayıt ---- */
  function save() { if (DEMO) return; try { localStorage.setItem(KEY, JSON.stringify({ f: found, w: wrong, h: hints, u: usedHints, t: elapsed(), d: done })); } catch (e) {} }
  function elapsed() { return tBefore + (done ? 0 : Date.now() - tStart); }
  (function load() {
    try {
      var st = JSON.parse(localStorage.getItem(KEY) || "null");
      if (st && !st.d) { found = (st.f || []).filter(function (i) { return i >= 0 && i < D.length; }); wrong = st.w | 0; hints = Math.max(0, Math.min(1, st.h === undefined ? 1 : st.h | 0)); usedHints = st.u | 0; tBefore = +st.t || 0; }
    } catch (e) {}
  })();

  /* ---- yerleşim: iki resim alt alta, ekrana sığacak en büyük boy ---- */
  function fit() {
    var vh = (window.visualViewport && window.visualViewport.height) || innerHeight;
    var bs = getComputedStyle(document.body), pt = parseFloat(bs.paddingTop) || 0, pb = parseFloat(bs.paddingBottom) || 0;
    var st = $("stage"); st.style.height = Math.max(380, vh - pt - pb) + "px";
    var box = $("pics"), W = box.clientWidth, H = box.clientHeight, gap = 10;
    var h = Math.min((H - gap) / 2, W / ASPECT), w = h * ASPECT;
    dispW = Math.floor(w); dispH = Math.floor(h);
    pics.forEach(function (p) { p.style.width = dispW + "px"; p.style.height = dispH + "px"; });
    clampZ(); applyZ();
  }
  function clampZ() { Z.s = Math.max(1, Math.min(4, Z.s)); Z.tx = Math.min(0, Math.max(dispW * (1 - Z.s), Z.tx)); Z.ty = Math.min(0, Math.max(dispH * (1 - Z.s), Z.ty)); }
  function applyZ() {
    var t = "translate(" + Z.tx + "px," + Z.ty + "px) scale(" + Z.s + ")";
    layers.forEach(function (l) { l.style.webkitTransform = t; l.style.transform = t; });
    $("bZoom").hidden = Z.s < 1.02;
    if (!msgOn) idleMsg();
  }

  /* ---- işaretler ---- */
  function center(d) { return [(d.x0 + d.x1) / 2 * VW, (d.y0 + d.y1) / 2 * VH]; }
  function radius(d) { var w = (d.x1 - d.x0) * VW, h = (d.y1 - d.y0) * VH; return Math.max(18, Math.sqrt(w * w + h * h) / 2 + 8); }
  function drawFound(i, anim) {
    var d = D[i], c = center(d), r = radius(d);
    marks.forEach(function (m) {
      var g = el("g", { "class": "fkring" + (anim ? " pop" : "") }, m);
      el("ellipse", { cx: c[0], cy: c[1], rx: Math.max(r, (d.x1 - d.x0) * VW / 2 + 10), ry: Math.max(r * 0.7, (d.y1 - d.y0) * VH / 2 + 10), "class": "o" }, g);
      el("ellipse", { cx: c[0], cy: c[1], rx: Math.max(r, (d.x1 - d.x0) * VW / 2 + 10), ry: Math.max(r * 0.7, (d.y1 - d.y0) * VH / 2 + 10), "class": "i" }, g);
    });
  }
  function drawMiss(m, x, y) {
    var g = el("g", { "class": "fkmiss" }, m), s = 11;
    el("path", { d: "M" + (x - s) + " " + (y - s) + "L" + (x + s) + " " + (y + s) + "M" + (x + s) + " " + (y - s) + "L" + (x - s) + " " + (y + s) }, g);
    setTimeout(function () { if (g.parentNode) g.parentNode.removeChild(g); }, 700);
  }
  function drawDots() {
    var h = ""; for (var i = 0; i < D.length; i++) h += '<i class="' + (i < found.length ? "on" : "") + '"></i>';
    $("dots").innerHTML = h; $("foundNo").textContent = found.length; $("hintNo").textContent = hints;
    $("bHint").disabled = hints <= 0 || done;
  }

  /* ---- dokunma → resim koordinatı ---- */
  function hitTest(pic, cx, cy) {
    var r = pic.getBoundingClientRect(), lx = (cx - r.left - Z.tx) / Z.s, ly = (cy - r.top - Z.ty) / Z.s;
    var u = lx / dispW, v = ly / dispH;
    if (u < 0 || v < 0 || u > 1 || v > 1) return;
    if (DEMO) { msg("Demo: farklar yakında eklenecek."); return; }
    if (done) return;
    if (Date.now() < waitUntil) return;
    var tol = 14 / (dispW * Z.s), tolV = 14 / (dispH * Z.s), best = -1, bd = 1e9;
    for (var i = 0; i < D.length; i++) {
      var d = D[i], dx = u < d.x0 ? d.x0 - u : u > d.x1 ? u - d.x1 : 0, dy = v < d.y0 ? d.y0 - v : v > d.y1 ? v - d.y1 : 0;
      if (dx <= tol && dy <= tolV) { var dd = dx + dy; if (dd < bd) { bd = dd; best = i; } }
    }
    if (best >= 0 && found.indexOf(best) < 0) {
      found.push(best); drawFound(best, true); drawDots(); snd("found"); streak = [];
      msg(D[best].ad + " ✓");
      if (navigator.vibrate) try { navigator.vibrate(12); } catch (e) {}
      save();
      if (found.length === D.length) win();
    } else if (best >= 0) {
      msg("Onu zaten buldun.");
    } else {
      wrong++; snd("wrong"); drawMiss(pic.querySelector(".fkmarks"), u * VW, v * VH); save();
      var now = Date.now(); streak = streak.filter(function (t) { return now - t < 8000; }); streak.push(now);
      if (streak.length >= 3) { streak = []; penalty(); } else msg("Orada fark yok.", true);
    }
  }
  function penalty() {
    waitUntil = Date.now() + 10000; var w = $("wait"); w.hidden = false;
    (function tick() { var left = Math.ceil((waitUntil - Date.now()) / 1000); $("waitNo").textContent = Math.max(0, left); if (left > 0) setTimeout(tick, 200); else w.hidden = true; })();
  }

  /* ---- yakınlaştırma / kaydırma (iki resim birlikte) ---- */
  var P = {}, pinch = null, drag = null;
  function pts() { return Object.keys(P).map(function (k) { return P[k]; }); }
  pics.forEach(function (pic) {
    pic.addEventListener("pointerdown", function (e) {
      e.preventDefault(); try { pic.setPointerCapture(e.pointerId); } catch (er) {}
      P[e.pointerId] = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t: Date.now(), pic: pic, moved: false };
      var p = pts();
      if (p.length === 2) {
        var r = pic.getBoundingClientRect();
        pinch = { d: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) || 1, s: Z.s, tx: Z.tx, ty: Z.ty, cx: (p[0].x + p[1].x) / 2 - r.left, cy: (p[0].y + p[1].y) / 2 - r.top };
        p.forEach(function (q) { q.moved = true; });
      } else if (p.length === 1) drag = { tx: Z.tx, ty: Z.ty };
    });
    pic.addEventListener("pointermove", function (e) {
      var q = P[e.pointerId]; if (!q) return; e.preventDefault();
      q.x = e.clientX; q.y = e.clientY;
      if (Math.abs(q.x - q.x0) + Math.abs(q.y - q.y0) > 8) q.moved = true;
      var p = pts();
      if (p.length >= 2 && pinch) {
        var d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), s = Math.max(1, Math.min(4, pinch.s * d / pinch.d));
        /* parmakların ortasındaki nokta yerinde kalsın */
        var ix = (pinch.cx - pinch.tx) / pinch.s, iy = (pinch.cy - pinch.ty) / pinch.s;
        Z.s = s; Z.tx = pinch.cx - ix * s; Z.ty = pinch.cy - iy * s; clampZ(); applyZ();
      } else if (p.length === 1 && drag && q.moved && Z.s > 1.01) {
        Z.tx = drag.tx + (q.x - q.x0); Z.ty = drag.ty + (q.y - q.y0); clampZ(); applyZ();
      }
    });
    function up(e) {
      var q = P[e.pointerId]; if (!q) return; delete P[e.pointerId];
      var left = pts().length;
      if (!q.moved && !pinch && Date.now() - q.t < 600) hitTest(q.pic, q.x, q.y);
      if (left === 0) { pinch = null; drag = null; } else if (left === 1) { var o = pts()[0]; o.x0 = o.x; o.y0 = o.y; o.moved = true; drag = { tx: Z.tx, ty: Z.ty }; pinch = null; }
    }
    pic.addEventListener("pointerup", up); pic.addEventListener("pointercancel", function (e) { delete P[e.pointerId]; if (!pts().length) { pinch = null; drag = null; } });
  });
  $("bZoom").onclick = function () { Z = { s: 1, tx: 0, ty: 0 }; applyZ(); };

  /* ---- ipucu: hak görünür ama verilmez; "Bence sana gerek yok :)" (ŞAKA = false yapılırsa gerçek ipucu: yaklaşık bölge) ---- */
  var SAKA = true, sakaN = 0, SAKA_MSG = ["Bence sana gerek yok :)", "Cidden, sana gerek yok :)", "Puzzle canavarı ipucu mu ister?", "Hakkın duruyor, kullanmana gerek yok :)"];
  $("bHint").onclick = function () {
    if (done || hints <= 0) return;
    if (SAKA) { snd("hint"); msg(SAKA_MSG[sakaN++ % SAKA_MSG.length]); return; }   /* hak hiç azalmaz, yıldız da gitmez */
    var left = D.map(function (d, i) { return i; }).filter(function (i) { return found.indexOf(i) < 0; });
    if (!left.length) return;
    var i = left[Math.floor(Math.random() * left.length)], c = center(D[i]), R = 120;
    var ox = (Math.random() - 0.5) * 80, oy = (Math.random() - 0.5) * 60, hx = Math.max(R, Math.min(VW - R, c[0] + ox)), hy = Math.max(R * 0.6, Math.min(VH - R * 0.6, c[1] + oy));
    hints--; usedHints++; drawDots(); save(); snd("hint");
    marks.forEach(function (m) { var g = el("ellipse", { cx: hx, cy: hy, rx: R, ry: R * 0.75, "class": "fkhintring" }, m); setTimeout(function () { if (g.parentNode) g.parentNode.removeChild(g); }, 2600); });
    msg("Bu civarda bir fark var.");
  };

  /* ---- bitiş ---- */
  function starSvg(on) { return '<svg viewBox="0 0 24 24" class="' + (on ? "on" : "") + '"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z"/></svg>'; }
  function win() {
    done = true; var t = elapsed(); tBefore = t;
    var stars = Math.max(1, 3 - (wrong > 3 ? 1 : 0) - (usedHints > 0 ? 1 : 0)), best = +ls("fark2_best") || 0;
    if (!best || t < best) { best = t; ls("fark2_best", t); }
    save(); try { localStorage.setItem("fark2_done", "1"); } catch (e) {}
    $("doneTitle").textContent = stars === 3 ? "Hepsini buldun. Kartal göz." : stars === 2 ? "Hepsini buldun." : "Bitti, hem de hepsi.";
    $("doneStars").innerHTML = starSvg(true) + starSvg(stars >= 2) + starSvg(stars >= 3);
    $("doneStats").innerHTML = "<span><small>Süre</small><b>" + fmt(t) + "</b></span><span><small>En iyi</small><b>" + fmt(best) + "</b></span><span><small>Yanlış</small><b>" + wrong + "</b></span>";
    setTimeout(function () { snd("win"); $("done").hidden = false; }, 700);
  }
  function reset() {
    found = []; wrong = 0; hints = 1; usedHints = 0; tBefore = 0; tStart = Date.now(); done = false; streak = []; waitUntil = 0;
    marks.forEach(function (m) { m.innerHTML = ""; }); Z = { s: 1, tx: 0, ty: 0 }; applyZ(); drawDots(); save(); $("done").hidden = true;
  }
  $("doneAgain").onclick = reset;

  /* ---- başlat ---- */
  if (DEMO) {
    /* demo: sayaç yerine "Demo", ipucu yok, giriş kartı her girişte kısa bilgi verir */
    document.body.classList.add("fkdemo");
    var dots = ""; for (var di = 0; di < D.length; di++) dots += "<i></i>"; $("dots").innerHTML = dots;
    var cnt = document.querySelector(".fkcount"); cnt.className = "fkcount demo"; cnt.innerHTML = "<b>Demo</b>";
    $("bHint").hidden = true;
    var ic = $("intro").querySelector(".fkcard");
    ic.innerHTML = '<div class="fkintroart" aria-hidden="true"><span></span><span></span></div>' +
      '<div class="fkkick">Demo</div><h2>7 Farkı Bul</h2>' +
      '<p>Bu oyun şimdilik demo. Asıl resimler hazırlanıyor; hazır olunca burada iki resim arasındaki 7 farkı arayacaksın.</p>' +
      '<p>Şimdilik odaya göz atabilir, iki parmakla yakınlaştırabilirsin.</p>' +
      '<div class="fkbtns"><button type="button" class="fkprimary" id="introGo">Göz at</button><a class="fkghost" href="oyunlar.html">Menü</a></div>';
    $("intro").hidden = false;
    $("introGo").onclick = function () { $("intro").hidden = true; };
  } else {
    found.forEach(function (i) { drawFound(i, false); });
    drawDots();
  }
  addEventListener("resize", fit); addEventListener("orientationchange", function () { setTimeout(fit, 250); });
  if (window.visualViewport) window.visualViewport.addEventListener("resize", fit);
  addEventListener("pageshow", function () { setTimeout(fit, 60); });
  addEventListener("pagehide", save);
  document.addEventListener("visibilitychange", function () { if (document.hidden) { tBefore = elapsed(); save(); } else tStart = Date.now(); });
  fit();
  if (!DEMO && ls("fark1_intro") !== "1") { $("intro").hidden = false; $("introGo").onclick = function () { $("intro").hidden = true; ls("fark1_intro", "1"); tStart = Date.now(); }; }

  if (location.hash === "#test") window.__fk = { D: D, demo: DEMO, state: function () { return { found: found.slice(), wrong: wrong, hints: hints, done: done, Z: Z, dispW: dispW, dispH: dispH, wait: Date.now() < waitUntil }; }, reset: reset };
})();
