/* Jöle – sayılı jöleleri kutuya fırlat; aynı sayılar değince birleşir (1+1=2 … 2048 ve ötesi). Kutu dolarsa biter.
   Yumuşak gövde: her jöle bir nokta halkası (Verlet). Şekil eşleme halkayı toplar; duvarlara, tümseklere ve birbirine çarpınca ezilir, sallanır.
   Üstteki raydan bir jöleyi parmakla tut → sürükle → bırak ya da fırlat. Rekor: jl_best (hesapla eşitlenir), en büyük jöle: jl_max. */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  var cv = $("kutu"), ctx = cv.getContext("2d"), wrap = $("kutuwrap"), yigin = $("kutuYigin"), arka = $("kutuArka"), on = $("kutuOn");
  var W = 360, H = 600, RAY_Y = 44, CIZGI = 104, PAH = 34, TUM_Y = 330, TUM_R = 24;
  /* jöle fiziği: ağır ve ağır ağır hareket eder (hava sürtünmesi gövdeye), içi ise uzun süre titrer (iç hareket az sönümlenir);
     zemine ve birbirine yapışkan (yüksek sürtünme), sekmez, yayılır; fırlatma hızı sınırlı */
  var G = 2100, DT = 1 / 120, SURT = 0.9975, HAVA = 0.0025, SEKIL = 0.0078, AT_MAX = 760, AT_KAT = 0.8;
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
    pit: function (v, guc) { var k = Math.log(v) / Math.LN2, f = 520 / Math.pow(1.13, k); ton(f * 1.25, f * 0.62, 0.09, Math.min(0.09, 0.025 + guc * 0.07), "sine"); },
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
      q = P[i]; w = P[(i + 1) % n]; var dx = w.x - q.x, dy = w.y - q.y, d = Math.sqrt(dx * dx + dy * dy) || 0.001, f = (d - L0) / d * 0.5 * (d < L0 ? 0.45 : 0.04);   /* sıkışmaya karşı sert, uzamaya karşı gevşek: jöle yayılabilsin */
      q.x += dx * f; q.y += dy * f; w.x -= dx * f; w.y -= dy * f;
    }
    /* 3) hacim (alan) korunur: jöle ezilince yanlara taşar, sönmez */
    var alan = 0, cevre = 0;
    for (i = 0; i < n; i++) { q = P[i]; w = P[(i + 1) % n]; alan += q.x * w.y - w.x * q.y; cevre += Math.sqrt((w.x - q.x) * (w.x - q.x) + (w.y - q.y) * (w.y - q.y)); }
    alan *= 0.5; var hedef = Math.PI * this.r * this.r * s * s * 0.97, fark = (hedef - alan) / (cevre || 1) * 0.55;
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
    ray.forEach(function (p, i) { if (p.bos) return; var bx = rayBoy(p.v), dx = q.x - p.x, dy = q.y - RAY_Y; if (Math.abs(dx) < bx.w / 2 + 14 && Math.abs(dy) < bx.h / 2 + 26 && Math.abs(dx) < enYakin) { enYakin = Math.abs(dx); hedef = i; } });
    if (hedef < 0) { if (q.y < CIZGI + 40) mesaj("Üstteki jölelerden birini tut 👆"); return; }
    e.preventDefault();
    /* tutulan jölenin yeri boş kalır (diğerleri kaymasın, alttan aynı sayı kayıp kendiliğinden birleşmesin); bırakınca kapanır */
    var p = ray[hedef]; ray[hedef] = { bos: true, x: p.x, id: ++sira };
    var j = new Jole(p.v, p.x, RAY_Y, 0.55); j.tut = true; j.buyu = 1; j.yuva = ray[hedef]; jl.push(j); tutulan = j;
    isaret = { x: q.x, y: q.y, id: e.pointerId }; iz = [{ x: q.x, y: q.y, t: performance.now() }];
    try { cv.setPointerCapture(e.pointerId); } catch (er) {}
    ses.tut(); mesaj("");
  });
  function yuvaKapat(j) {
    var k = ray.indexOf(j.yuva); if (k >= 0) ray.splice(k, 1); j.yuva = null;
    setTimeout(function () { if (!bitti) rayDoldur(false); }, 260);
  }
  cv.addEventListener("pointermove", function (e) {
    if (!tutulan || !isaret || e.pointerId !== isaret.id) return;
    var q = dunya(e); isaret.x = q.x; isaret.y = q.y;
    var t = performance.now(); iz.push({ x: q.x, y: q.y, t: t }); while (iz.length > 2 && t - iz[0].t > 110) iz.shift();
  });
  function birak(e) {
    if (!tutulan || !isaret || (e && e.pointerId !== isaret.id)) return;
    /* bırakınca jöle kendi hızıyla devam eder ama ağırdır: hızı kısılır ve sınırlanır, mermi gibi uçmaz */
    var j = tutulan, vx = 0, vy = 0;
    if (iz.length > 1) { var a = iz[0], b = iz[iz.length - 1], dt = Math.max(16, b.t - a.t) / 1000; vx = (b.x - a.x) / dt * AT_KAT; vy = (b.y - a.y) / dt * AT_KAT; }
    var sp = Math.sqrt(vx * vx + vy * vy); if (sp > AT_MAX) { vx *= AT_MAX / sp; vy *= AT_MAX / sp; }
    var gvx = 0, gvy = 0; j.p.forEach(function (q) { gvx += q.x - q.px; gvy += q.y - q.py; }); gvx /= j.n; gvy /= j.n;
    j.tut = false; j.yas = 0;
    j.p.forEach(function (q) { var ix = q.x - q.px - gvx, iy = q.y - q.py - gvy; q.px = q.x - vx * DT - ix; q.py = q.y - vy * DT - iy; });
    yuvaKapat(j); tutulan = null; isaret = null; ses.birak();
  }
  cv.addEventListener("pointerup", birak); cv.addEventListener("pointercancel", birak);

  /* ---------- fizik adımı ---------- */
  function duvar(q) {
    var vx = q.x - q.px, vy = q.y - q.py;
    if (q.x < 0) { q.x = 0; q.py += vy * 0.4; }
    else if (q.x > W) { q.x = W; q.py += vy * 0.4; }
    if (q.y > H) { q.y = H; q.px += vx * 0.6; }
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
      if (!A.tut) { p.px += (p.x - p.px) * 0.15; p.py += (p.y - p.py) * 0.15; }
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
      if (A.kaynas > 0) A.kaynas = Math.max(0, A.kaynas - DT * 1.6);
      /* gövde hızı (ağırlık merkezi) hava sürtünmesiyle yavaşlar; iç titreşim az sönümlenir → jöle gibi sallanır */
      var gvx = 0, gvy = 0;
      for (j = 0; j < A.n; j++) { q = A.p[j]; gvx += q.x - q.px; gvy += q.y - q.py; }
      gvx /= A.n; gvy /= A.n;
      var ic = A.tut ? 0.985 : SURT, hv = A.tut ? 0.06 : HAVA;
      for (j = 0; j < A.n; j++) {
        q = A.p[j]; var vx = (q.x - q.px - gvx) * ic + gvx * (1 - hv), vy = (q.y - q.py - gvy) * ic + gvy * (1 - hv);
        q.px = q.x; q.py = q.y; q.x += vx; q.y += vy + G * DT * DT;
      }
      if (A.tut) {
        /* parmakla tutulan jöle üst kısmından çekilir: alt kısmı geriden gelir, sarkar ve sallanır */
        var hx = Math.max(A.r * 0.6, Math.min(W - A.r * 0.6, isaret ? isaret.x : A.cx)), hy = Math.max(RAY_Y - 6, Math.min(CIZGI - A.r * 0.45, isaret ? isaret.y : A.cy)) + A.r * 0.2;
        var sc = A.olcek * A.buyu;
        for (j = 0; j < A.n; j++) {
          q = A.p[j]; var ry = A.rest[2 * j + 1], w = ry < -A.r * 0.3 ? 0.11 : ry < A.r * 0.3 ? 0.06 : 0.03;
          q.x += (hx + A.rest[2 * j] * sc - q.x) * w; q.y += (hy + ry * sc - q.y) * w;
        }
      }
    }
    /* çarpma algısı: gövde hızı bir adımda sert düştüyse jöle bir yere çarpmıştır */
    for (i = 0; i < jl.length; i++) { A = jl[i]; A.oncekiV = A.gV || 0; }
    temas.length = 0;
    for (var it = 0; it < 3; it++) {
      for (i = 0; i < jl.length; i++) { A = jl[i]; A.sekil(A.tut ? 0.045 : A.kaynas > 0 ? SEKIL + 0.03 * A.kaynas : SEKIL); for (j = 0; j < A.n; j++) duvar(A.p[j]); A.merkez(); }
      for (i = 0; i < jl.length; i++) for (j = i + 1; j < jl.length; j++) {
        A = jl[i]; B = jl[j];
        var dx = A.cx - B.cx, dy = A.cy - B.cy, rr = A.R + B.R + 2;
        if (it === 0 && A.v === B.v && !A.tut && !B.tut) {
          var ce = (A.r + B.r) * 1.35, d2 = dx * dx + dy * dy;
          if (d2 < ce * ce && d2 > 1) { var dl = Math.sqrt(d2), ck = 0.045 * (1 - dl / ce) / dl, k3; for (k3 = 0; k3 < A.n; k3++) { A.p[k3].x -= dx * ck; A.p[k3].y -= dy * ck; } for (k3 = 0; k3 < B.n; k3++) { B.p[k3].x += dx * ck; B.p[k3].y += dy * ck; } }
        }
        if (dx * dx + dy * dy > rr * rr) continue;
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
    for (i = 0; i < jl.length; i++) {
      A = jl[i]; var sx2 = 0, sy2 = 0; for (j = 0; j < A.n; j++) { sx2 += A.p[j].x - A.p[j].px; sy2 += A.p[j].y - A.p[j].py; }
      var gv = Math.sqrt(sx2 * sx2 + sy2 * sy2) / A.n / DT; A.gV = gv; if (A.pitBekle > 0) A.pitBekle -= DT;
      var dus = (A.oncekiV || 0) - gv;
      if (!A.tut && dus > 260 && !(A.pitBekle > 0)) { A.pitBekle = 0.22; carpti(A, Math.min(1, dus / 900)); }
    }
  }
  function birlestir(A, B) {
    if (jl.indexOf(A) < 0 || jl.indexOf(B) < 0) return;
    A.merkez(); B.merkez();
    var wa = A.r * A.r, wb = B.r * B.r, x = (A.cx * wa + B.cx * wb) / (wa + wb), y = (A.cy * wa + B.cy * wb) / (wa + wb);
    var hep = A.p.concat(B.p), vx = 0, vy = 0; hep.forEach(function (q) { vx += q.x - q.px; vy += q.y - q.py; }); vx /= hep.length; vy /= hep.length;
    jl.splice(jl.indexOf(A), 1); jl.splice(jl.indexOf(B), 1);
    var v = A.v * 2, Y = new Jole(v, x, y, 1); Y.pat = 1; Y.yas = 0.3; Y.kaynas = 1;
    /* her yön için iki jölenin o yöndeki en uzak kenarını bul: yeni jöle bu hatla başlar */
    var aci = hep.map(function (q) { return Math.atan2(q.y - y, q.x - x); }), uz = hep.map(function (q) { return Math.sqrt((q.x - x) * (q.x - x) + (q.y - y) * (q.y - y)); });
    var pen = Math.PI * 2 / Y.n * 1.3, sinir = [];
    for (var k = 0; k < Y.n; k++) {
      var th = Math.atan2(Y.rest[2 * k + 1], Y.rest[2 * k]), en = -1;
      for (var m = 0; m < hep.length; m++) { var fa = Math.abs(((aci[m] - th + Math.PI * 3) % (Math.PI * 2)) - Math.PI); if (fa < pen && uz[m] > en) en = uz[m]; }
      sinir.push(en);
    }
    for (k = 0; k < Y.n; k++) if (sinir[k] < 0) { var a2 = sinir[(k + Y.n - 1) % Y.n], b2 = sinir[(k + 1) % Y.n]; sinir[k] = Math.max(a2, b2, Math.min(A.r, B.r)); }
    /* başlangıç hattı duvar/zemin dışına taşmasın; taşarsa düzeltme hıza dönüşüp jöleyi zıplatmasın diye önce düzeltilir, sonra hız verilir */
    Y.p.forEach(function (q, k) { var th = Math.atan2(Y.rest[2 * k + 1], Y.rest[2 * k]), d = sinir[k] * 0.96; q.x = x + Math.cos(th) * d; q.y = y + Math.sin(th) * d; q.px = q.x; q.py = q.y; duvar(q); q.px = q.x - vx; q.py = q.y - vy; });
    jl.push(Y);
    kazan(v, x, y, Y.r);
    if (window.Hesap && Hesap.planla) try { Hesap.planla(); } catch (e) {}
  }

  function carpti(A, guc) {
    ses.pit(A.v, guc);
    if (guc > 0.45 && navigator.vibrate) try { navigator.vibrate(6); } catch (e) {}
    var en = -1e9, ex = A.cx; for (var i = 0; i < A.n; i++) if (A.p[i].y > en) { en = A.p[i].y; ex = A.p[i].x; }
    fx.push({ t: 0, x: ex, y: en, r: A.r * 0.7, c: renk(A.v), ezil: true, g: guc });
  }
  /* birleşme ödülü: puan, rekor, en büyük, ses, efekt (kutuda da rayda da) */
  function kazan(v, x, y, rr) {
    birlesme++; puan += v; puanEl.textContent = puan; puanEl.parentNode.classList.remove("zipla"); void puanEl.offsetWidth; puanEl.parentNode.classList.add("zipla");
    var yeniRekor = false;
    if (puan > best) { best = puan; bestEl.textContent = best; try { localStorage.setItem("jl_best", String(best)); } catch (e) {} if (!rekorDendi && best0 > 0) { rekorDendi = true; yeniRekor = true; } }
    if (v > enBuyuk) { enBuyuk = v; try { localStorage.setItem("jl_max", String(enBuyuk)); } catch (e) {} buyukCiz(); if (v >= 64) mesaj(v + " jölesi ilk kez! 🎉"); }
    if (yeniRekor) mesaj("Yeni rekor! 🏆");
    ses.birles(v); if (navigator.vibrate && v >= 32) try { navigator.vibrate(12); } catch (e) {}
    var c = renk(v), k;
    fx.push({ t: 0, x: x, y: y, r: rr, c: c, halka: true });
    for (k = 0; k < Math.min(18, 6 + Math.log(v) / Math.LN2 * 1.2); k++) { var a = Math.random() * Math.PI * 2, s = 120 + Math.random() * 220; fx.push({ t: 0, x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 80, r: 2.5 + Math.random() * 4, c: c }); }
    yazi.push({ t: 0, x: x, y: y - rr * 0.4, s: "+" + v, c: c });
    if (v >= 256 && !azalt) salla = Math.min(1, 0.35 + v / 4096);
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
  function yol(A, ox, oy) {
    var P = A.p, n = A.n; ctx.beginPath();
    ctx.moveTo((P[n - 1].x + P[0].x) / 2 - ox, (P[n - 1].y + P[0].y) / 2 - oy);
    for (var i = 0; i < n; i++) { var a = P[i], b = P[(i + 1) % n]; ctx.quadraticCurveTo(a.x - ox, a.y - oy, (a.x + b.x) / 2 - ox, (a.y + b.y) / 2 - oy); }
    ctx.closePath();
  }
  /* her sayı için bir kez hazırlanır: renk geçişi (jölenin merkezine göre), kenar rengi ve sayının resmi */
  var boya = {};
  function acik(hex, k) { var n = parseInt(hex.slice(1), 16), r = n >> 16, g = n >> 8 & 255, b = n & 255; return "rgb(" + Math.round(r + (255 - r) * k) + "," + Math.round(g + (255 - g) * k) + "," + Math.round(b + (255 - b) * k) + ")"; }
  function boyaAl(v) {
    var b = boya[v]; if (b) return b;
    var c = renk(v), r = yaricap(v), k = (cv.width / W) || 2, s = String(v), fs = r * (s.length <= 1 ? 0.78 : s.length === 2 ? 0.66 : s.length === 3 ? 0.52 : 0.42);
    /* jöle: içi açık ve ışık geçiren, kenara doğru koyulaşan renk */
    var gr = ctx.createRadialGradient(-r * 0.12, -r * 0.2, r * 0.05, 0, 0, r * 1.15);
    gr.addColorStop(0, acik(c, 0.45)); gr.addColorStop(0.55, c); gr.addColorStop(0.9, koyu(c, 0.8)); gr.addColorStop(1, koyu(c, 0.66));
    var yc = document.createElement("canvas"), x = yc.getContext("2d"), w = Math.ceil(fs * s.length * 0.75 + fs * 0.6), h = Math.ceil(fs * 1.3);
    yc.width = Math.ceil(w * k); yc.height = Math.ceil(h * k); x.scale(k, k);
    x.font = "900 " + fs.toFixed(1) + "px Nunito, system-ui, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = "rgba(24,14,36,.78)"; x.fillText(s, w / 2, h / 2 + fs * 0.06);
    b = boya[v] = { gr: gr, kenar: koyu(c, 0.55), yazi: yc, yw: w, yh: h };
    return b;
  }
  var KABARCIK = [[0.38, 0.3, 0.07], [0.5, -0.05, 0.045], [-0.42, 0.38, 0.055]];
  function joleCiz(A, zaman) {
    var b = boyaAl(A.v), cx = A.cx, cy = A.cy, r = A.r, i;
    ctx.save(); ctx.translate(cx, cy);
    yol(A, cx, cy);
    ctx.globalAlpha = 0.9; ctx.fillStyle = b.gr; ctx.fill();
    ctx.globalAlpha = 0.85; ctx.lineWidth = 2; ctx.strokeStyle = b.kenar; ctx.stroke(); ctx.globalAlpha = 1;
    /* ıslak parıltı: üst kenara yakın ince bir yay + küçük bir nokta */
    ctx.save(); ctx.rotate(A.aci * 0.25);
    ctx.globalAlpha = 0.55; ctx.strokeStyle = "#fff"; ctx.lineCap = "round"; ctx.lineWidth = Math.max(2, r * 0.09);
    ctx.beginPath(); ctx.arc(0, 0, r * 0.68, Math.PI * 1.08, Math.PI * 1.42); ctx.stroke();
    ctx.globalAlpha = 0.7; ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(-r * 0.2, -r * 0.62, Math.max(1.4, r * 0.055), 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    /* jölenin içindeki küçük kabarcıklar jöleyle birlikte döner */
    ctx.save(); ctx.rotate(A.aci); ctx.globalAlpha = 0.28; ctx.fillStyle = "#fff";
    for (i = 0; i < KABARCIK.length; i++) { var kb = KABARCIK[i]; ctx.beginPath(); ctx.arc(kb[0] * r, kb[1] * r, Math.max(1.2, kb[2] * r), 0, Math.PI * 2); ctx.fill(); }
    ctx.restore(); ctx.globalAlpha = 1;
    /* sayı jöleyle döner ama baş aşağı olmaz: açı ±35°'de kalır */
    var ya = A.aci; while (ya > Math.PI) ya -= Math.PI * 2; while (ya < -Math.PI) ya += Math.PI * 2;
    if (A.yaziAci === undefined) A.yaziAci = 0; var hedefA = Math.max(-0.6, Math.min(0.6, ya)); A.yaziAci += (hedefA - A.yaziAci) * 0.2;
    ctx.rotate(A.yaziAci);
    var pk = A.pat > 0 ? 1 + Math.sin(A.pat * Math.PI) * 0.18 : 1;
    ctx.drawImage(b.yazi, -b.yw / 2 * pk, -b.yh / 2 * pk, b.yw * pk, b.yh * pk);
    ctx.restore();
  }
  var hapBoya = {};
  function hap(x, y, w, h, c, v, kx, ky) {
    ctx.save(); ctx.translate(x, y); ctx.scale(kx, ky);
    var r = h / 2; ctx.beginPath(); ctx.moveTo(-w / 2 + r, -r); ctx.lineTo(w / 2 - r, -r); ctx.arc(w / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2); ctx.lineTo(-w / 2 + r, r); ctx.arc(-w / 2 + r, 0, r, Math.PI / 2, Math.PI * 1.5); ctx.closePath();
    var hb = hapBoya[v + ":" + h]; if (!hb) { var gr = ctx.createLinearGradient(0, -r, 0, r); gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.25, c); gr.addColorStop(1, koyu(c, 0.75)); hb = hapBoya[v + ":" + h] = { gr: gr, k: koyu(c, 0.6) }; }
    ctx.fillStyle = hb.gr; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = hb.k; ctx.stroke();
    ctx.font = "900 " + (h * 0.58).toFixed(1) + "px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "rgba(24,14,36,.82)"; ctx.fillText(String(v), 0, h * 0.04);
    ctx.restore();
  }
  function kutuYolu(ic) {
    var e = ic ? 0 : 5; ctx.beginPath();
    ctx.moveTo(-e, -18); ctx.lineTo(-e, H - PAH + e * 0.4); ctx.lineTo(PAH - e * 0.4, H + e); ctx.lineTo(W - PAH + e * 0.4, H + e); ctx.lineTo(W + e, H - PAH + e * 0.4); ctx.lineTo(W + e, -18);
  }
  /* değişmeyen katmanlar (zemin + tümsekler arkada, çerçeve önde) ayrı tuvallere bir kez çizilir; her karede sadece jöleler çizilir */
  var katmanHazir = false, sallaVar = false;
  function katmanlar() {
    var dpr = cv.width / (W * olcek), k = dpr * olcek, i, c0 = ctx;
    [arka, on].forEach(function (c) { c.width = cv.width; c.height = cv.height; c.style.width = cv.style.width; c.style.height = cv.style.height; });
    ctx = arka.getContext("2d"); ctx.setTransform(k, 0, 0, k, 0, 0);
    kutuYolu(true); ctx.lineTo(0, -18); ctx.closePath();
    var bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#1b1430"); bg.addColorStop(0.3, "#120d22"); bg.addColorStop(1, "#0b0816"); ctx.fillStyle = bg; ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.035)"; ctx.fillRect(0, RAY_Y - 30, W, 60);
    ctx.fillStyle = "rgba(255,255,255,.18)"; for (i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(raySlot(i), 6, 2.2, 0, Math.PI * 2); ctx.fill(); }
    for (var s2 = 0; s2 < 2; s2++) {
      var cx = s2 ? W : 0; ctx.beginPath(); ctx.arc(cx, TUM_Y, TUM_R, s2 ? Math.PI / 2 : -Math.PI / 2, s2 ? Math.PI * 1.5 : Math.PI / 2); ctx.closePath();
      var tg = ctx.createRadialGradient(cx, TUM_Y, 4, cx, TUM_Y, TUM_R); tg.addColorStop(0, "#7d7398"); tg.addColorStop(1, "#4a4262"); ctx.fillStyle = tg; ctx.fill();
      ctx.fillStyle = "#c9c2dc"; ctx.beginPath(); ctx.arc(cx + (s2 ? -9 : 9), TUM_Y, 2.6, 0, Math.PI * 2); ctx.fill();
    }
    ctx = on.getContext("2d"); ctx.setTransform(k, 0, 0, k, 0, 0);
    kutuYolu(false); ctx.lineJoin = "round"; ctx.lineWidth = 9; ctx.strokeStyle = "#3a3152"; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = "rgba(255,255,255,.12)"; ctx.stroke();
    ctx = c0; katmanHazir = true;
  }
  function ciz(zaman) {
    var dpr = cv.width / (W * olcek);
    if (!katmanHazir || arka.width !== cv.width || arka.height !== cv.height) katmanlar();
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    /* sallanma: üç katman birlikte, ekran kartında (çizim maliyeti yok) */
    if (salla > 0) { yigin.style.transform = "translate(" + ((Math.random() - 0.5) * 7 * salla * olcek).toFixed(1) + "px," + ((Math.random() - 0.5) * 7 * salla * olcek).toFixed(1) + "px)"; sallaVar = true; }
    else if (sallaVar) { yigin.style.transform = ""; sallaVar = false; }
    ctx.setTransform(dpr * olcek, 0, 0, dpr * olcek, 0, 0);
    ctx.save();
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
      if (f.ezil) { var ek = f.t / 0.35; ctx.globalAlpha = Math.max(0, (1 - ek) * 0.35 * f.g + 0.05 * (1 - ek)); ctx.strokeStyle = f.c; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(f.x, f.y - 2, f.r * (0.6 + ek * 0.9), f.r * 0.16 * (1 - ek * 0.5), 0, 0, Math.PI * 2); ctx.stroke(); }
      else if (f.halka) { ctx.globalAlpha = Math.max(0, 1 - f.t / 0.45); ctx.lineWidth = 4 * (1 - f.t / 0.45) + 1; ctx.strokeStyle = f.c; ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (0.7 + f.t * 1.6), 0, Math.PI * 2); ctx.stroke(); }
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
      var p = ray[i]; if (p.bos) continue; var b = rayBoy(p.v), dal = Math.sin(zaman / 420 + p.faz) * 0.05;
      var pp = p.pat > 0 ? 1 + Math.sin(p.pat * Math.PI) * 0.22 : 1;
      hap(p.x, RAY_Y + Math.sin(zaman / 610 + p.faz) * 1.5, b.w, b.h, renk(p.v), p.v, (1 + dal) * pp, (1 - dal) * pp);
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
  }

  /* ---------- döngü ---------- */
  function kare(t) {
    if (!calisiyor) return;
    requestAnimationFrame(kare);
    if (son) akicilikBak(t - son);
    var dt = son ? Math.min(0.05, (t - son) / 1000) : 1 / 60; son = t;
    if (!bitti) {
      birikim += dt; var adet = 0;
      while (birikim >= DT && adet < 5) { adim(); birikim -= DT; adet++; }
      if (adet >= 5) birikim = 0;
      tasmaBak(dt);
    }
    /* rayda birleştirme: tuttuğun jöleyi raydaki aynı sayının üstüne getirirsen orada birleşirler */
    if (tutulan && !bitti) {
      var T = tutulan; T.merkez();
      for (var ri = 0; ri < ray.length; ri++) {
        var rp = ray[ri]; if (rp.bos) continue; var rb = rayBoy(rp.v);
        if (rp.v === T.v && Math.abs(T.cx - rp.x) < rb.w / 2 + T.r * 0.3 && Math.abs(T.cy - RAY_Y) < rb.h / 2 + T.r * 0.45) {
          jl.splice(jl.indexOf(T), 1); yuvaKapat(T); tutulan = null; isaret = null;
          rp.v *= 2; rp.pat = 1; kazan(rp.v, rp.x, RAY_Y + 34, rayBoy(rp.v).h * 0.8);
          mesaj("Rayda birleşti: " + rp.v + " 🫧");
          break;
        }
      }
    }
    /* ray kayması */
    for (var i = 0; i < ray.length; i++) { var h = raySlot(i); ray[i].x += (h - ray[i].x) * Math.min(1, dt * 7); if (ray[i].pat > 0) ray[i].pat = Math.max(0, ray[i].pat - dt * 3); }
    kapiParla = Math.max(0, kapiParla - dt * 2.2);
    for (i = fx.length - 1; i >= 0; i--) { var f = fx[i]; f.t += dt; if (!f.halka && !f.ezil) { f.vy += 700 * dt; f.x += f.vx * dt; f.y += f.vy * dt; } if (f.t > (f.ezil ? 0.35 : f.halka ? 0.45 : 0.7)) fx.splice(i, 1); }
    for (i = yazi.length - 1; i >= 0; i--) { yazi[i].t += dt; if (yazi[i].t > 0.9) yazi.splice(i, 1); }
    for (i = 0; i < jl.length; i++) if (jl[i].pat > 0) jl[i].pat = Math.max(0, jl[i].pat - dt * 3);
    salla = Math.max(0, salla - dt * 2.5);
    ciz(t);
  }
  /* uyarlanır çözünürlük: telefon zorlanırsa (kareler uzarsa) tuvalin piksel yoğunluğu adım adım düşer, oyun akıcı kalır */
  var cozunurluk = 2, ortKare = 16.7, yavasSure = 0;
  function akicilikBak(dtMs) {
    if (dtMs <= 0 || dtMs > 250) return;
    ortKare = ortKare * 0.94 + dtMs * 0.06;
    yavasSure = ortKare > 21 ? yavasSure + dtMs : 0;
    if (yavasSure > 1500 && cozunurluk > 1.2 && (window.devicePixelRatio || 1) > 1.2) { cozunurluk = Math.max(1.2, Math.min(cozunurluk, window.devicePixelRatio || 1) - 0.3); yavasSure = 0; ortKare = 16.7; boyutla(); }
  }
  function boyutla() {
    var bw = wrap.clientWidth, bh = wrap.clientHeight; if (!bw || !bh) return;
    olcek = Math.min(bw / W, bh / H);
    var dpr = Math.min(window.devicePixelRatio || 1, cozunurluk);
    cv.style.width = Math.round(W * olcek) + "px"; cv.style.height = Math.round(H * olcek) + "px";
    cv.width = Math.round(W * olcek * dpr); cv.height = Math.round(H * olcek * dpr); boya = {}; hapBoya = {}; katmanHazir = false;
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
    durum: function () { return { n: jl.length, puan: puan, bitti: bitti, tasma: tasma, ray: ray.map(function (r) { return r.bos ? 0 : r.v; }), jole: jl.map(function (j) { j.merkez(); return { v: j.v, x: Math.round(j.cx), y: Math.round(j.cy), r: Math.round(j.r) }; }) }; },
    olcek: function () { return olcek; }, coz: function () { return cozunurluk; },
    oranlar: function () { return jl.map(function (j) { var a = 1e9, b = -1e9, c = 1e9, d = -1e9; j.p.forEach(function (q) { a = Math.min(a, q.x); b = Math.max(b, q.x); c = Math.min(c, q.y); d = Math.max(d, q.y); }); return j.v + ":" + ((b - a) / (d - c)).toFixed(2); }); },
    rayKur: function (L) { ray = L.map(function (v, i) { return { v: v, x: raySlot(i), gir: 1, faz: i, id: ++sira }; }); }, tutulanY: function () { if (!tutulan) return null; tutulan.merkez(); return Math.round(tutulan.cy); }, bitir: oyunBitti, basla: basla,
    olc: function () { var t0 = performance.now(), i; for (i = 0; i < 60; i++) adim(); var t1 = performance.now(); for (i = 0; i < 20; i++) ciz(performance.now()); var t2 = performance.now(); return { adim: (t1 - t0) / 60, ciz: (t2 - t1) / 20 }; }
  };
})();
