/* Jöle – sayılı jöleleri kutuya fırlat; aynı sayılar değince birleşir (1+1=2 … 2048 ve ötesi). Kutu dolarsa biter.
   Yumuşak gövde: her jöle bir nokta halkası (Verlet). Şekil eşleme halkayı toplar; duvarlara, tümseklere ve birbirine çarpınca ezilir, sallanır.
   Üstteki raydan bir jöleyi parmakla tut → sürükle → bırak ya da fırlat. Rekor: jl_best (hesapla eşitlenir), en büyük jöle: jl_max. */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  var cv = $("kutu"), ctx = cv.getContext("2d"), wrap = $("kutuwrap");
  var W = 360, H = 600, RAY_Y = 44, CIZGI = 104, PAH = 34, TUM_Y = 330, TUM_R = 24;
  var G = 1500, DT = 1 / 180, SURT = 0.996, SEKIL = 0.055, AT_MAX = 1150;
  var RENK = { 1: "#ff5468", 2: "#ffd84a", 4: "#4fd772", 8: "#2fe3b4", 16: "#3f8cff", 32: "#9d63ff", 64: "#ff4fae", 128: "#ff8c33", 256: "#d9f43c", 512: "#ff9fc8", 1024: "#35f0ff", 2048: "#ffd36b", 4096: "#c9b3ff", 8192: "#ffffff" };
  function renk(v) { return RENK[v] || "#ffffff"; }
  function yaricap(v) { return 15 + Math.log(v) / Math.LN2 * 6.1; }
  function koyu(hex, k) { var n = parseInt(hex.slice(1), 16), r = n >> 16, g = n >> 8 & 255, b = n & 255; return "rgb(" + Math.round(r * k) + "," + Math.round(g * k) + "," + Math.round(b * k) + ")"; }
  var azalt = false; try { azalt = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

  /* ---------- ses (Web Audio, ilk dokunuşta açılır) ---------- */
  var ac = null, sesAcik = true;
  try { sesAcik = localStorage.getItem("jl_ses") !== "0"; } catch (e) {}
  function sesHazir() { if (!ac) { var A = window.AudioContext || window.webkitAudioContext; if (A) try { ac = new A(); } catch (e) {} } if (ac && ac.state !== "running") try { ac.resume(); } catch (e) {} }
  function ton(f1, f2, sure, vol, tip, gec) {
    if (!sesAcik || !ac) return;
    try {
      var t = ac.currentTime + (gec || 0), o = ac.createOscillator(), g = ac.createGain();
      o.type = tip || "sine"; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + sure);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + sure + 0.03);
    } catch (e) {}
  }
  var ses = {
    tut: function () { ton(420, 640, 0.09, 0.07); },
    birak: function () { ton(300, 180, 0.12, 0.05); },
    birles: function (v) { var k = Math.log(v) / Math.LN2, f = 200 * Math.pow(2, k / 6); ton(f, f * 1.9, 0.16, 0.11); ton(f * 1.5, f * 2.6, 0.12, 0.05, "triangle", 0.03); },
    bitti: function () { ton(520, 330, 0.3, 0.08); ton(390, 220, 0.4, 0.07, "sine", 0.18); }
  };

  /* ---------- jöle ---------- */
  function Jole(v, x, y, olcek) {
    var r = yaricap(v), n = Math.max(12, Math.min(30, Math.round(Math.PI * 2 * r / 8.5)));
    this.v = v; this.r = r; this.n = n; this.p = []; this.rest = []; this.olcek = olcek || 1; this.buyu = 1; this.tut = false; this.yas = 0; this.aci = 0; this.cx = x; this.cy = y; this.R = r; this.pat = 0;
    for (var i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2, ox = Math.cos(a) * r, oy = Math.sin(a) * r;
      this.rest.push(ox, oy);
      this.p.push({ x: x + ox * this.olcek, y: y + oy * this.olcek, px: x + ox * this.olcek, py: y + oy * this.olcek });
    }
  }
  Jole.prototype.merkez = function () {
    var sx = 0, sy = 0, P = this.p, n = this.n, R = 0;
    for (var i = 0; i < n; i++) { sx += P[i].x; sy += P[i].y; }
    this.cx = sx / n; this.cy = sy / n;
    for (i = 0; i < n; i++) { var dx = P[i].x - this.cx, dy = P[i].y - this.cy, d = dx * dx + dy * dy; if (d > R) R = d; }
    this.R = Math.sqrt(R);
  };
  Jole.prototype.hiz = function () { var s = 0, P = this.p; for (var i = 0; i < this.n; i++) s += Math.abs(P[i].x - P[i].px) + Math.abs(P[i].y - P[i].py); return s / this.n / DT; };
  Jole.prototype.icinde = function (x, y) {
    var P = this.p, n = this.n, ic = false;
    for (var i = 0, j = n - 1; i < n; j = i++) { var a = P[i], b = P[j]; if (((a.y > y) !== (b.y > y)) && (x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x)) ic = !ic; }
    return ic;
  };
  Jole.prototype.sekil = function (k) {
    /* 1) zayıf şekil eşleme: kimliğini ve dönüşünü korur ama ezilebilir */
    this.merkez();
    var P = this.p, n = this.n, rs = this.rest, s = this.olcek * this.buyu, a = 0, b = 0, i, q, w;
    for (i = 0; i < n; i++) { var qx = P[i].x - this.cx, qy = P[i].y - this.cy, rx = rs[2 * i], ry = rs[2 * i + 1]; a += rx * qx + ry * qy; b += rx * qy - ry * qx; }
    var th = Math.atan2(b, a), c = Math.cos(th), si = Math.sin(th); this.aci = th;
    for (i = 0; i < n; i++) {
      var tx = this.cx + (rs[2 * i] * c - rs[2 * i + 1] * si) * s, ty = this.cy + (rs[2 * i] * si + rs[2 * i + 1] * c) * s;
      P[i].x += (tx - P[i].x) * k; P[i].y += (ty - P[i].y) * k;
    }
    /* 2) kenar yayları: noktalar eşit aralıklı kalsın, sivri uç olmasın */
    var L0 = 2 * Math.PI * this.r * s / n * 0.985;
    for (i = 0; i < n; i++) {
      q = P[i]; w = P[(i + 1) % n]; var dx = w.x - q.x, dy = w.y - q.y, d = Math.sqrt(dx * dx + dy * dy) || 0.001, f = (d - L0) / d * 0.5 * 0.6;
      q.x += dx * f; q.y += dy * f; w.x -= dx * f; w.y -= dy * f;
    }
    /* 3) hacim (alan) korunur: jöle ezilince yanlara taşar, sönmez */
    var alan = 0, cevre = 0;
    for (i = 0; i < n; i++) { q = P[i]; w = P[(i + 1) % n]; alan += q.x * w.y - w.x * q.y; cevre += Math.sqrt((w.x - q.x) * (w.x - q.x) + (w.y - q.y) * (w.y - q.y)); }
    alan *= 0.5; var hedef = Math.PI * this.r * this.r * s * s * 0.985, fark = (hedef - alan) / (cevre || 1) * 0.9;
    for (i = 0; i < n; i++) {
      var o = P[(i + n - 1) % n], nx2 = P[(i + 1) % n], ex = nx2.y - o.y, ey = -(nx2.x - o.x), el = Math.sqrt(ex * ex + ey * ey) || 1;
      P[i].x += ex / el * fark; P[i].y += ey / el * fark;
    }
  };

  /* ---------- oyun durumu ---------- */
  var jl = [], ray = [], fx = [], yazi = [], tutulan = null, isaret = null, puan = 0, best = 0, enBuyuk = 0, best0 = 0, rekorDendi = false, bitti = false, tasma = 0, birlesme = 0, son = 0, birikim = 0, salla = 0, calisiyor = false;
  try { best = +localStorage.getItem("jl_best") || 0; enBuyuk = +localStorage.getItem("jl_max") || 0; } catch (e) {}
  var puanEl = $("puan"), bestEl = $("best"), buyukEl = $("buyuk"), msgEl = $("jmsg");
  bestEl.textContent = best;

  /* ---------- ray: üstte bekleyen 4 jöle ---------- */
  var RAY_N = 4, sira = 0;
  function rayDeger() {
    var m = 2; jl.forEach(function (j) { if (j.v > m) m = j.v; });
    var L = [[1, 25], [2, 28], [4, 24], [8, 14]]; if (m >= 128) L.push([16, 7]); if (m >= 512) L.push([32, 4]);
    var top = 0; L.forEach(function (x) { top += x[1]; }); var r = Math.random() * top;
    for (var i = 0; i < L.length; i++) { r -= L[i][1]; if (r < 0) return L[i][0]; } return 1;
  }
  function raySlot(i) { return 52 + i * ((W - 104) / (RAY_N - 1)); }
  function rayDoldur(ilk) {
    while (ray.length < RAY_N) { var i = ray.length; ray.push({ v: rayDeger(), x: ilk ? raySlot(i) : W + 40, gir: ilk ? 1 : 0, faz: Math.random() * 6, id: ++sira }); if (!ilk) kapiParla = 1; }
  }
  var kapiParla = 0;
  function rayBoy(v) { var r = Math.min(yaricap(v), 30); return { w: Math.max(40, r * 2.2), h: Math.max(24, r * 1.15) }; }

  /* ---------- dokunma ---------- */
  var olcek = 1, ofx = 0, ofy = 0, iz = [];
  function dunya(e) { var b = cv.getBoundingClientRect(); return { x: (e.clientX - b.left) / olcek, y: (e.clientY - b.top) / olcek }; }
  cv.addEventListener("pointerdown", function (e) {
    sesHazir();
    if (bitti || tutulan) return;
    var q = dunya(e), hedef = -1, enYakin = 1e9;
    ray.forEach(function (p, i) { var bx = rayBoy(p.v), dx = q.x - p.x, dy = q.y - RAY_Y; if (Math.abs(dx) < bx.w / 2 + 14 && Math.abs(dy) < bx.h / 2 + 26 && Math.abs(dx) < enYakin) { enYakin = Math.abs(dx); hedef = i; } });
    if (hedef < 0) { if (q.y < CIZGI + 40) mesaj("Üstteki jölelerden birini tut 👆"); return; }
    e.preventDefault();
    var p = ray.splice(hedef, 1)[0];
    var j = new Jole(p.v, p.x, RAY_Y, 0.55); j.tut = true; j.buyu = 1; jl.push(j); tutulan = j;
    isaret = { x: q.x, y: q.y, id: e.pointerId }; iz = [{ x: q.x, y: q.y, t: performance.now() }];
    try { cv.setPointerCapture(e.pointerId); } catch (er) {}
    ses.tut(); mesaj("");
    setTimeout(function () { if (!bitti) rayDoldur(false); }, 380);
  });
  cv.addEventListener("pointermove", function (e) {
    if (!tutulan || !isaret || e.pointerId !== isaret.id) return;
    var q = dunya(e); isaret.x = q.x; isaret.y = q.y;
    var t = performance.now(); iz.push({ x: q.x, y: q.y, t: t }); while (iz.length > 2 && t - iz[0].t > 110) iz.shift();
  });
  function birak(e) {
    if (!tutulan || !isaret || (e && e.pointerId !== isaret.id)) return;
    var j = tutulan, vx = 0, vy = 0;
    if (iz.length > 1) { var a = iz[0], b = iz[iz.length - 1], dt = Math.max(16, b.t - a.t) / 1000; vx = (b.x - a.x) / dt; vy = (b.y - a.y) / dt; }
    var sp = Math.sqrt(vx * vx + vy * vy); if (sp > AT_MAX) { vx *= AT_MAX / sp; vy *= AT_MAX / sp; }
    j.tut = false; j.yas = 0;
    j.p.forEach(function (q) { q.px = q.x - vx * DT; q.py = q.y - vy * DT; });
    tutulan = null; isaret = null; ses.birak();
  }
  cv.addEventListener("pointerup", birak); cv.addEventListener("pointercancel", birak);

  /* ---------- fizik adımı ---------- */
  function duvar(q) {
    var vx = q.x - q.px, vy = q.y - q.py;
    if (q.x < 0) { q.x = 0; q.py += vy * 0.25; }
    else if (q.x > W) { q.x = W; q.py += vy * 0.25; }
    if (q.y > H) { q.y = H; q.px += vx * 0.35; }
    var d = (q.x + (H - q.y) - PAH) / Math.SQRT2; if (d < 0) { q.x -= d / Math.SQRT2; q.y += d / Math.SQRT2; q.px += vx * 0.2; }
    d = ((W - q.x) + (H - q.y) - PAH) / Math.SQRT2; if (d < 0) { q.x += d / Math.SQRT2; q.y += d / Math.SQRT2; q.px += vx * 0.2; }
    for (var s = 0; s < 2; s++) { var cx = s ? W : 0, dx = q.x - cx, dy = q.y - TUM_Y, dd = dx * dx + dy * dy; if (dd < TUM_R * TUM_R && dd > 0.0001) { var l = Math.sqrt(dd), k = (TUM_R - l) / l; q.x += dx * k; q.y += dy * k; } }
    if (q.y < -260) q.y = -260;
  }
  var temas = [];
  function carpis(A, B) {
    /* A'nın B'nin içine giren noktalarını dışarı it (tutulan jöle hareket etmez) */
    var P = A.p, Q = B.p, n = B.n, R2 = (B.R + 2) * (B.R + 2), oldu = false;
    for (var i = 0; i < A.n; i++) {
      var p = P[i], dx0 = p.x - B.cx, dy0 = p.y - B.cy; if (dx0 * dx0 + dy0 * dy0 > R2) continue;
      if (!B.icinde(p.x, p.y)) continue;
      var en = 1e9, ej = 0, et = 0, eqx = 0, eqy = 0;
      for (var j = 0; j < n; j++) {
        var a = Q[j], b = Q[(j + 1) % n], ex = b.x - a.x, ey = b.y - a.y, L = ex * ex + ey * ey, t = L > 0 ? ((p.x - a.x) * ex + (p.y - a.y) * ey) / L : 0;
        t = t < 0 ? 0 : t > 1 ? 1 : t; var qx = a.x + ex * t, qy = a.y + ey * t, d = (qx - p.x) * (qx - p.x) + (qy - p.y) * (qy - p.y);
        if (d < en) { en = d; ej = j; et = t; eqx = qx; eqy = qy; }
      }
      var mx = eqx - p.x, my = eqy - p.y, pa = A.tut ? 0 : B.tut ? 1 : 0.5, pb = 1 - pa;
      p.x += mx * pa; p.y += my * pa;
      if (pb > 0) { var qa = Q[ej], qb = Q[(ej + 1) % n]; qa.x -= mx * pb * (1 - et); qa.y -= my * pb * (1 - et); qb.x -= mx * pb * et; qb.y -= my * pb * et; }
      if (!A.tut) { p.px += (p.x - p.px) * 0.06; p.py += (p.y - p.py) * 0.06; }
      oldu = true;
    }
    return oldu;
  }
  function adim() {
    var i, j, A, B, q;
    for (i = 0; i < jl.length; i++) {
      A = jl[i]; A.yas += DT;
      if (A.buyu < 1) A.buyu = Math.min(1, A.buyu + DT * 2.2);
      if (A.olcek < 1) A.olcek = Math.min(1, A.olcek + DT * 4.5);
      if (A.tut) {
        /* tutulan jöle parmağı biraz gecikmeyle izler: sürüklerken salınır */
        var hx = Math.max(A.r * 0.6, Math.min(W - A.r * 0.6, isaret ? isaret.x : A.cx)), hy = Math.min(H - A.r, isaret ? isaret.y : A.cy);
        A.merkez(); var mx = (hx - A.cx) * 0.22, my = (hy - A.cy) * 0.22;
        for (j = 0; j < A.n; j++) { q = A.p[j]; q.x += mx; q.y += my; q.px = q.x; q.py = q.y; }
        continue;
      }
      for (j = 0; j < A.n; j++) {
        q = A.p[j]; var vx = (q.x - q.px) * SURT, vy = (q.y - q.py) * SURT;
        q.px = q.x; q.py = q.y; q.x += vx; q.y += vy + G * DT * DT;
      }
    }
    temas.length = 0;
    for (var it = 0; it < 3; it++) {
      for (i = 0; i < jl.length; i++) { A = jl[i]; A.sekil(A.tut ? 0.5 : SEKIL); if (!A.tut) for (j = 0; j < A.n; j++) duvar(A.p[j]); A.merkez(); }
      for (i = 0; i < jl.length; i++) for (j = i + 1; j < jl.length; j++) {
        A = jl[i]; B = jl[j];
        var dx = A.cx - B.cx, dy = A.cy - B.cy, rr = A.R + B.R + 2; if (dx * dx + dy * dy > rr * rr) continue;
        /* derin iç içe geçme (birleşme büyümesi, hızlı çarpma): merkezleri ayır ki halkalar dolanmasın */
        var dd = Math.sqrt(dx * dx + dy * dy) || 0.01, minD = (A.r * A.olcek * A.buyu + B.r * B.olcek * B.buyu) * 0.62;
        if (dd < minD) {
          var it2 = (minD - dd) / dd * 0.5, wa = A.tut ? 0 : B.tut ? 1 : B.r * B.r / (A.r * A.r + B.r * B.r), wb = A.tut ? 1 : B.tut ? 0 : 1 - wa, k2;
          for (k2 = 0; k2 < A.n; k2++) { A.p[k2].x += dx * it2 * wa * 2; A.p[k2].y += dy * it2 * wa * 2; }
          for (k2 = 0; k2 < B.n; k2++) { B.p[k2].x -= dx * it2 * wb * 2; B.p[k2].y -= dy * it2 * wb * 2; }
          A.merkez(); B.merkez();
        }
        var t1 = carpis(A, B), t2 = carpis(B, A);
        if ((t1 || t2) && A.v === B.v && !A.tut && !B.tut) temas.push([A, B]);
      }
    }
    for (i = 0; i < temas.length; i++) birlestir(temas[i][0], temas[i][1]);
  }
  function birlestir(A, B) {
    if (jl.indexOf(A) < 0 || jl.indexOf(B) < 0) return;
    A.merkez(); B.merkez();
    var wa = A.r * A.r, wb = B.r * B.r, x = (A.cx * wa + B.cx * wb) / (wa + wb), y = (A.cy * wa + B.cy * wb) / (wa + wb);
    var vx = 0, vy = 0; A.p.concat(B.p).forEach(function (q) { vx += q.x - q.px; vy += q.y - q.py; }); vx /= (A.n + B.n); vy /= (A.n + B.n);
    jl.splice(jl.indexOf(A), 1); jl.splice(jl.indexOf(B), 1);
    var v = A.v * 2, Y = new Jole(v, x, y, 1); Y.buyu = 0.62; Y.pat = 1; Y.yas = 0.3;
    Y.p.forEach(function (q, k) { var ox = Y.rest[2 * k] * 0.62, oy = Y.rest[2 * k + 1] * 0.62; q.x = x + ox; q.y = y + oy; q.px = q.x - vx * 0.5; q.py = q.y - vy * 0.5 + 1.2; });
    jl.push(Y);
    birlesme++; puan += v; puanEl.textContent = puan; puanEl.parentNode.classList.remove("zipla"); void puanEl.offsetWidth; puanEl.parentNode.classList.add("zipla");
    var yeniRekor = false;
    if (puan > best) { best = puan; bestEl.textContent = best; try { localStorage.setItem("jl_best", String(best)); } catch (e) {} if (!rekorDendi && best0 > 0) { rekorDendi = true; yeniRekor = true; } }
    if (v > enBuyuk) { enBuyuk = v; try { localStorage.setItem("jl_max", String(enBuyuk)); } catch (e) {} buyukCiz(); if (v >= 64) mesaj(v + " jölesi ilk kez! 🎉"); }
    if (yeniRekor) mesaj("Yeni rekor! 🏆");
    ses.birles(v); if (navigator.vibrate && v >= 32) try { navigator.vibrate(12); } catch (e) {}
    var c = renk(v), k;
    fx.push({ t: 0, x: x, y: y, r: Y.r, c: c, halka: true });
    for (k = 0; k < Math.min(18, 6 + Math.log(v) / Math.LN2 * 1.2); k++) { var a = Math.random() * Math.PI * 2, s = 120 + Math.random() * 220; fx.push({ t: 0, x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 80, r: 2.5 + Math.random() * 4, c: c }); }
    yazi.push({ t: 0, x: x, y: y - Y.r * 0.4, s: "+" + v, c: c });
    if (v >= 256 && !azalt) salla = Math.min(1, 0.35 + v / 4096);
    if (window.Hesap && Hesap.planla) try { Hesap.planla(); } catch (e) {}
  }

  /* ---------- taşma: çizginin üstünde duran jöle 2 sn kalırsa biter ---------- */
  function tasmaBak(dt) {
    var uyari = false;
    for (var i = 0; i < jl.length; i++) {
      var A = jl[i]; if (A.tut || A.yas < 1.4) continue;
      var ust = 1e9; for (var j = 0; j < A.n; j++) if (A.p[j].y < ust) ust = A.p[j].y;
      if (ust < CIZGI && A.hiz() < 70) { uyari = true; break; }
    }
    tasma = uyari ? tasma + dt : Math.max(0, tasma - dt * 2);
    if (tasma > 2.1) oyunBitti();
  }

  /* ---------- çizim ---------- */
  function yol(A) {
    var P = A.p, n = A.n; ctx.beginPath();
    var m0x = (P[n - 1].x + P[0].x) / 2, m0y = (P[n - 1].y + P[0].y) / 2; ctx.moveTo(m0x, m0y);
    for (var i = 0; i < n; i++) { var a = P[i], b = P[(i + 1) % n]; ctx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2); }
    ctx.closePath();
  }
  function joleCiz(A, zaman) {
    var c = renk(A.v);
    yol(A);
    var gr = ctx.createRadialGradient(A.cx - A.r * 0.35, A.cy - A.r * 0.45, A.r * 0.1, A.cx, A.cy, A.r * 1.25);
    gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.22, c); gr.addColorStop(1, koyu(c, 0.78));
    ctx.fillStyle = gr; ctx.fill();
    ctx.lineWidth = 2.2; ctx.strokeStyle = koyu(c, 0.62); ctx.stroke();
    /* parlama */
    ctx.globalAlpha = 0.32; ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(A.cx - A.r * 0.3, A.cy - A.r * 0.42, A.r * 0.3, A.r * 0.13, -0.5, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    /* sayı */
    var s = String(A.v), fs = A.r * (s.length <= 1 ? 0.78 : s.length === 2 ? 0.66 : s.length === 3 ? 0.52 : 0.42);
    /* sayı jöleyle döner ama baş aşağı olmaz: açı ±35°'de kalır */
    var ya = A.aci; while (ya > Math.PI) ya -= Math.PI * 2; while (ya < -Math.PI) ya += Math.PI * 2;
    if (A.yaziAci === undefined) A.yaziAci = 0; var hedefA = Math.max(-0.6, Math.min(0.6, ya)); A.yaziAci += (hedefA - A.yaziAci) * 0.2;
    ctx.save(); ctx.translate(A.cx, A.cy); ctx.rotate(A.yaziAci);
    var pk = A.pat > 0 ? 1 + Math.sin(A.pat * Math.PI) * 0.18 : 1; ctx.scale(pk, pk);
    ctx.font = "900 " + fs.toFixed(1) + "px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(24,14,36,.82)"; ctx.fillText(s, 0, fs * 0.06);
    ctx.restore();
  }
  function hap(x, y, w, h, c, v, kx, ky) {
    ctx.save(); ctx.translate(x, y); ctx.scale(kx, ky);
    var r = h / 2; ctx.beginPath(); ctx.moveTo(-w / 2 + r, -r); ctx.lineTo(w / 2 - r, -r); ctx.arc(w / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2); ctx.lineTo(-w / 2 + r, r); ctx.arc(-w / 2 + r, 0, r, Math.PI / 2, Math.PI * 1.5); ctx.closePath();
    var gr = ctx.createLinearGradient(0, -r, 0, r); gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.25, c); gr.addColorStop(1, koyu(c, 0.75));
    ctx.fillStyle = gr; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = koyu(c, 0.6); ctx.stroke();
    ctx.font = "900 " + (h * 0.58).toFixed(1) + "px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "rgba(24,14,36,.82)"; ctx.fillText(String(v), 0, h * 0.04);
    ctx.restore();
  }
  function kutuYolu(ic) {
    var e = ic ? 0 : 5; ctx.beginPath();
    ctx.moveTo(-e, -18); ctx.lineTo(-e, H - PAH + e * 0.4); ctx.lineTo(PAH - e * 0.4, H + e); ctx.lineTo(W - PAH + e * 0.4, H + e); ctx.lineTo(W + e, H - PAH + e * 0.4); ctx.lineTo(W + e, -18);
  }
  /* değişmeyen katmanlar (zemin, tümsekler / çerçeve) bir kez çizilir, her karede kopyalanır */
  var zemin = null, cerceve = null;
  function katmanlar() {
    var dpr = cv.width / (W * olcek), k = dpr * olcek, i;
    function yeni() { var c = document.createElement("canvas"); c.width = cv.width; c.height = cv.height; var x = c.getContext("2d"); x.setTransform(k, 0, 0, k, 0, 0); return [c, x]; }
    var z = yeni(), c0 = ctx; ctx = z[1];
    kutuYolu(true); ctx.lineTo(0, -18); ctx.closePath();
    var bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#1b1430"); bg.addColorStop(0.3, "#120d22"); bg.addColorStop(1, "#0b0816"); ctx.fillStyle = bg; ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.035)"; ctx.fillRect(0, RAY_Y - 30, W, 60);
    ctx.fillStyle = "rgba(255,255,255,.18)"; for (i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(raySlot(i), 6, 2.2, 0, Math.PI * 2); ctx.fill(); }
    for (var s2 = 0; s2 < 2; s2++) {
      var cx = s2 ? W : 0; ctx.beginPath(); ctx.arc(cx, TUM_Y, TUM_R, s2 ? Math.PI / 2 : -Math.PI / 2, s2 ? Math.PI * 1.5 : Math.PI / 2); ctx.closePath();
      var tg = ctx.createRadialGradient(cx, TUM_Y, 4, cx, TUM_Y, TUM_R); tg.addColorStop(0, "#7d7398"); tg.addColorStop(1, "#4a4262"); ctx.fillStyle = tg; ctx.fill();
      ctx.fillStyle = "#c9c2dc"; ctx.beginPath(); ctx.arc(cx + (s2 ? -9 : 9), TUM_Y, 2.6, 0, Math.PI * 2); ctx.fill();
    }
    zemin = z[0];
    var f = yeni(); ctx = f[1];
    kutuYolu(false); ctx.lineJoin = "round"; ctx.lineWidth = 9; ctx.strokeStyle = "#3a3152"; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = "rgba(255,255,255,.12)"; ctx.stroke();
    cerceve = f[0]; ctx = c0;
  }
  function ciz(zaman) {
    var dpr = cv.width / (W * olcek);
    if (!zemin || zemin.width !== cv.width || zemin.height !== cv.height) katmanlar();
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    var sx = 0, sy = 0; if (salla > 0) { sx = (Math.random() - 0.5) * 7 * salla; sy = (Math.random() - 0.5) * 7 * salla; }
    ctx.drawImage(zemin, sx * dpr * olcek, sy * dpr * olcek);
    ctx.setTransform(dpr * olcek, 0, 0, dpr * olcek, 0, 0);
    ctx.save(); ctx.translate(sx, sy);
    /* taşma çizgisi */
    var tehlike = Math.min(1, tasma / 2.1);
    ctx.save(); ctx.setLineDash([8, 9]); ctx.lineWidth = 2;
    ctx.strokeStyle = tehlike > 0 ? "rgba(255," + Math.round(120 - tehlike * 90) + "," + Math.round(140 - tehlike * 100) + "," + (0.35 + 0.5 * Math.abs(Math.sin(zaman / 120))) + ")" : "rgba(255,255,255,.12)";
    ctx.beginPath(); ctx.moveTo(6, CIZGI); ctx.lineTo(W - 6, CIZGI); ctx.stroke(); ctx.restore();
    /* jöleler */
    for (var i = 0; i < jl.length; i++) if (!jl[i].tut) joleCiz(jl[i], zaman);
    /* efektler */
    for (i = 0; i < fx.length; i++) {
      var f = fx[i];
      if (f.halka) { ctx.globalAlpha = Math.max(0, 1 - f.t / 0.45); ctx.lineWidth = 4 * (1 - f.t / 0.45) + 1; ctx.strokeStyle = f.c; ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (0.7 + f.t * 1.6), 0, Math.PI * 2); ctx.stroke(); }
      else { ctx.globalAlpha = Math.max(0, 1 - f.t / 0.7); ctx.fillStyle = f.c; ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (1 - f.t * 0.6), 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    for (i = 0; i < yazi.length; i++) {
      var y = yazi[i]; ctx.globalAlpha = Math.max(0, 1 - y.t / 0.9); ctx.font = "900 20px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.lineWidth = 4; ctx.strokeStyle = "rgba(10,6,20,.8)";
      ctx.strokeText(y.s, y.x, y.y - y.t * 46); ctx.fillStyle = y.c; ctx.fillText(y.s, y.x, y.y - y.t * 46);
    }
    ctx.globalAlpha = 1;
    /* ray: bekleyen jöleler, hafif salınım */
    for (i = 0; i < ray.length; i++) {
      var p = ray[i], b = rayBoy(p.v), dal = Math.sin(zaman / 420 + p.faz) * 0.05;
      hap(p.x, RAY_Y + Math.sin(zaman / 610 + p.faz) * 1.5, b.w, b.h, renk(p.v), p.v, 1 + dal, 1 - dal);
    }
    /* sağ kapı: yeni jöle girerken parlar */
    ctx.fillStyle = "rgba(255,255,255," + (0.25 + kapiParla * 0.75) + ")"; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(W - 5, RAY_Y - 20, 4, 40, 2) : ctx.rect(W - 5, RAY_Y - 20, 4, 40); ctx.fill();
    /* tutulan jöle en üstte + parmak izi */
    if (tutulan) {
      /* tutulan jölenin arkasında yumuşak bir hale: sayıyı kapatmaz */
      tutulan.merkez(); var hr = tutulan.R + 10 + Math.sin(zaman / 160) * 2;
      var hg = ctx.createRadialGradient(tutulan.cx, tutulan.cy, tutulan.R * 0.6, tutulan.cx, tutulan.cy, hr + 8);
      hg.addColorStop(0, "rgba(255,255,255,.28)"); hg.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(tutulan.cx, tutulan.cy, hr + 8, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.setLineDash([4, 7]); ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(tutulan.cx, tutulan.cy + tutulan.R + 4); ctx.lineTo(tutulan.cx, H - 6); ctx.stroke(); ctx.restore();
      joleCiz(tutulan, zaman);
    }
    ctx.restore();
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(cerceve, sx * dpr * olcek, sy * dpr * olcek);
  }

  /* ---------- döngü ---------- */
  function kare(t) {
    if (!calisiyor) return;
    requestAnimationFrame(kare);
    var dt = son ? Math.min(0.05, (t - son) / 1000) : 1 / 60; son = t;
    if (!bitti) {
      birikim += dt; var adet = 0;
      while (birikim >= DT && adet < 7) { adim(); birikim -= DT; adet++; }
      if (adet >= 7) birikim = 0;
      tasmaBak(dt);
    }
    /* ray kayması */
    for (var i = 0; i < ray.length; i++) { var h = raySlot(i); ray[i].x += (h - ray[i].x) * Math.min(1, dt * 7); }
    kapiParla = Math.max(0, kapiParla - dt * 2.2);
    for (i = fx.length - 1; i >= 0; i--) { var f = fx[i]; f.t += dt; if (!f.halka) { f.vy += 700 * dt; f.x += f.vx * dt; f.y += f.vy * dt; } if (f.t > (f.halka ? 0.45 : 0.7)) fx.splice(i, 1); }
    for (i = yazi.length - 1; i >= 0; i--) { yazi[i].t += dt; if (yazi[i].t > 0.9) yazi.splice(i, 1); }
    for (i = 0; i < jl.length; i++) if (jl[i].pat > 0) jl[i].pat = Math.max(0, jl[i].pat - dt * 3);
    salla = Math.max(0, salla - dt * 2.5);
    ciz(t);
  }
  function boyutla() {
    var bw = wrap.clientWidth, bh = wrap.clientHeight; if (!bw || !bh) return;
    olcek = Math.min(bw / W, bh / H);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.style.width = Math.round(W * olcek) + "px"; cv.style.height = Math.round(H * olcek) + "px";
    cv.width = Math.round(W * olcek * dpr); cv.height = Math.round(H * olcek * dpr);
  }
  addEventListener("resize", boyutla);
  document.addEventListener("visibilitychange", function () { if (document.hidden) { son = 0; birak(); } });

  /* ---------- arayüz ---------- */
  function mesaj(t) { msgEl.textContent = t; clearTimeout(mesaj.z); if (t) mesaj.z = setTimeout(function () { msgEl.textContent = ""; }, 2600); }
  function buyukCiz() { var v = enBuyuk || 0; buyukEl.textContent = v || "–"; buyukEl.style.background = v ? renk(v) : ""; buyukEl.parentNode.classList.toggle("var", !!v); }
  function basla() {
    jl = []; ray = []; fx = []; yazi = []; tutulan = null; isaret = null; puan = 0; tasma = 0; birlesme = 0; bitti = false; best0 = best; rekorDendi = false;
    puanEl.textContent = 0; $("over").hidden = true; rayDoldur(true); mesaj("Bir jöleyi tut, kutuya fırlat 👆");
  }
  function oyunBitti() {
    if (bitti) return; bitti = true; birak(); ses.bitti();
    var rek = puan > best0 && best0 > 0;
    $("overPuan").textContent = puan;
    var enIyiJ = 0; jl.forEach(function (j) { if (j.v > enIyiJ) enIyiJ = j.v; });
    $("overText").textContent = rek ? "Yeni rekor! 🏆" : enIyiJ >= 1024 ? "Kutuda " + enIyiJ + " vardı, efsane 🌟" : enIyiJ >= 256 ? "Kutuda " + enIyiJ + " vardı, fena değil 😌" : "Kutu doldu, bir daha?";
    $("overBest").textContent = "En iyi: " + best + " · " + birlesme + " birleşme";
    setTimeout(function () { $("over").hidden = false; }, 650);
    if (window.Hesap && Hesap.planla) try { Hesap.planla(); } catch (e) {}
  }
  $("tekrar").onclick = function () { sesHazir(); basla(); };
  $("sesBtn").onclick = function () { sesAcik = !sesAcik; try { localStorage.setItem("jl_ses", sesAcik ? "1" : "0"); } catch (e) {} this.textContent = sesAcik ? "🔊" : "🔈"; sesHazir(); };
  $("sesBtn").textContent = sesAcik ? "🔊" : "🔈";
  $("yardimBtn").onclick = function () { $("intro").hidden = false; };
  $("introGo").onclick = function () { sesHazir(); $("intro").hidden = true; try { localStorage.setItem("jl_intro", "1"); } catch (e) {} };
  try { if (localStorage.getItem("jl_intro") !== "1") $("intro").hidden = false; } catch (e) {}
  buyukCiz(); boyutla(); basla();
  calisiyor = true; requestAnimationFrame(kare);
  setTimeout(boyutla, 60);

  /* test kancaları */
  if (location.hash === "#test") window.__jl = {
    ekle: function (v, x, y, vx, vy) { var j = new Jole(v, x, y, 1); if (vx || vy) j.p.forEach(function (q) { q.px = q.x - (vx || 0) * DT; q.py = q.y - (vy || 0) * DT; }); jl.push(j); return j; },
    durum: function () { return { n: jl.length, puan: puan, bitti: bitti, tasma: tasma, ray: ray.map(function (r) { return r.v; }), jole: jl.map(function (j) { j.merkez(); return { v: j.v, x: Math.round(j.cx), y: Math.round(j.cy), r: Math.round(j.r) }; }) }; },
    olcek: function () { return olcek; }, bitir: oyunBitti, basla: basla,
    olc: function () { var t0 = performance.now(), i; for (i = 0; i < 60; i++) adim(); var t1 = performance.now(); for (i = 0; i < 20; i++) ciz(performance.now()); var t2 = performance.now(); return { adim: (t1 - t0) / 60, ciz: (t2 - t1) / 20 }; }
  };
})();
