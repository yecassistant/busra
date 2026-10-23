/* Çiftlik – 3D modeller (three.js r149). Her şey ilkel şekillerden (kutu, silindir, koni, çokyüzlü) kurulur ve tek geometride
   birleştirilir: köşe renkleri + düz gölgeleme = alçak poligon görünüm, az çizim çağrısı. Dışarıya window.CfModel verir.
   Yerel eksen: zemin y=0, ön yüz +z. Birimler ~metre (tarla 2,3 m). */
(function () {
  "use strict";
  var T = window.THREE;
  if (!T) return;
  function rng(seed) { var s = (seed >>> 0) || 1; return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

  /* ---------- temel geometriler (indekssiz, önbellekli) ---------- */
  var GEO = {};
  function geo(k, f) { if (!GEO[k]) { var g = f(); GEO[k] = g.index ? g.toNonIndexed() : g; } return GEO[k]; }
  function kutuG() { return geo("kutu", function () { return new T.BoxGeometry(1, 1, 1); }); }
  function silG(rt, rb, seg, acik) { return geo("s" + rt + "_" + rb + "_" + seg + (acik ? "a" : ""), function () { return new T.CylinderGeometry(rt, rb, 1, seg, 1, !!acik); }); }
  function ikoG(d) { return geo("iko" + d, function () { return new T.IcosahedronGeometry(1, d); }); }
  function oktaG() { return geo("okta", function () { return new T.OctahedronGeometry(1, 0); }); }
  function dodG() { return geo("dod", function () { return new T.DodecahedronGeometry(1, 0); }); }
  function kureG(w, h) { return geo("k" + w + "_" + h, function () { return new T.SphereGeometry(1, w, h); }); }
  function yarimKureG(w, h) { return geo("yk" + w + "_" + h, function () { return new T.SphereGeometry(1, w, h, 0, Math.PI * 2, 0, Math.PI / 2); }); }
  function prizmaG() {                                                     /* üçgen prizma: taban -0,5..0,5 (x), tepe y=1, derinlik z */
    return geo("prizma", function () {
      var v = [-0.5, 0, 0.5, 0.5, 0, 0.5, 0, 1, 0.5, 0.5, 0, -0.5, -0.5, 0, -0.5, 0, 1, -0.5,
        -0.5, 0, 0.5, 0, 1, 0.5, 0, 1, -0.5, -0.5, 0, 0.5, 0, 1, -0.5, -0.5, 0, -0.5,
        0.5, 0, 0.5, 0.5, 0, -0.5, 0, 1, -0.5, 0.5, 0, 0.5, 0, 1, -0.5, 0, 1, 0.5,
        -0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0, 0.5];
      var g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(v, 3)); return g;
    });
  }
  var _e = new T.Euler(), _q = new T.Quaternion(), _p = new T.Vector3(), _s = new T.Vector3();
  function M(x, y, z, sx, sy, sz, rx, ry, rz) { _e.set(rx || 0, ry || 0, rz || 0, "YXZ"); _q.setFromEuler(_e); _p.set(x, y, z); _s.set(sx, sy, sz); return new T.Matrix4().compose(_p, _q, _s); }

  /* ---------- kurucu: parçaları toplar, tek geometri verir ---------- */
  function Kur(seed) { this.l = []; this.r = rng(seed || 1); this.T = null; this.yigin = []; }
  Kur.prototype.ekle = function (g, renk, m, titre) { if (this.T) m = new T.Matrix4().multiplyMatrices(this.T, m); this.l.push({ g: g, c: renk, m: m, t: titre || 0 }); return this; };
  Kur.prototype.grup = function (x, y, z, ry, s) { this.yigin.push(this.T); var m = M(x, y, z, s || 1, s || 1, s || 1, 0, ry || 0, 0); this.T = this.T ? new T.Matrix4().multiplyMatrices(this.T, m) : m; return this; };
  Kur.prototype.bitir = function () { this.T = this.yigin.pop() || null; return this; };
  /* kutu: (x, z) merkez, y0 taban; dönüşler kutunun merkezinde */
  Kur.prototype.kutu = function (w, h, d, renk, x, y0, z, ry, rx, rz, titre) { return this.ekle(kutuG(), renk, M(x, y0 + h / 2, z, w, h, d, rx, ry, rz), titre); };
  Kur.prototype.kutuM = function (w, h, d, renk, x, y, z, rx, ry, rz, titre) { return this.ekle(kutuG(), renk, M(x, y, z, w, h, d, rx, ry, rz), titre); };
  Kur.prototype.sil = function (rt, rb, h, seg, renk, x, y0, z, titre) { return this.ekle(silG(rt, rb, seg), renk, M(x, y0 + h / 2, z, 1, h, 1), titre); };
  Kur.prototype.silM = function (rt, rb, h, seg, renk, x, y, z, rx, ry, rz, acik) { return this.ekle(silG(rt, rb, seg, acik), renk, M(x, y, z, 1, h, 1, rx, ry, rz)); };
  Kur.prototype.koni = function (r, h, seg, renk, x, y0, z, titre) { return this.ekle(silG(0, r, seg), renk, M(x, y0 + h / 2, z, 1, h, 1), titre); };
  Kur.prototype.koniM = function (r, h, seg, renk, x, y, z, rx, ry, rz) { return this.ekle(silG(0, r, seg), renk, M(x, y, z, 1, h, 1, rx, ry, rz)); };
  Kur.prototype.top = function (sx, sy, sz, renk, x, y, z, d, titre, rx, ry, rz) { return this.ekle(ikoG(d || 0), renk, M(x, y, z, sx, sy, sz, rx, ry, rz), titre); };
  Kur.prototype.yuvarlak = function (sx, sy, sz, renk, x, y, z, rx, ry, rz) { return this.ekle(kureG(8, 6), renk, M(x, y, z, sx, sy, sz, rx, ry, rz)); };
  Kur.prototype.kubbe = function (r, h, renk, x, y0, z) { return this.ekle(yarimKureG(10, 5), renk, M(x, y0, z, r, h, r)); };
  Kur.prototype.tas = function (sx, sy, sz, renk, x, y, z, ry, titre) { return this.ekle(dodG(), renk, M(x, y, z, sx, sy, sz, 0, ry || 0, 0), titre); };
  Kur.prototype.okta = function (sx, sy, sz, renk, x, y, z, rx, ry, rz) { return this.ekle(oktaG(), renk, M(x, y, z, sx, sy, sz, rx, ry, rz)); };
  Kur.prototype.prizma = function (w, h, d, renk, x, y0, z, ry) { return this.ekle(prizmaG(), renk, M(x, y0, z, w, h, d, 0, ry || 0, 0)); };
  Kur.prototype.torna = function (pts, seg, phi0, phiLen, renk, x, y0, z, ry, titre) {
    if (pts[0][1] > pts[pts.length - 1][1]) pts = pts.slice().reverse();     /* yukarıdan aşağı profil ters yüzlü olur: çevir */
    var g = new T.LatheGeometry(pts.map(function (p) { return new T.Vector2(p[0], p[1]); }), seg || 16, phi0 || 0, phiLen === undefined ? Math.PI * 2 : phiLen);
    g = g.toNonIndexed();
    return this.ekle(g, renk, M(x || 0, y0 || 0, z || 0, 1, 1, 1, 0, ry || 0, 0), titre || 0);
  };
  Kur.prototype.disk = function (rx, rz, h, seg, renk, x, y0, z, titre) { return this.ekle(silG(1, 1, seg), renk, M(x, y0 + h / 2, z, rx, h, rz), titre); };
  /* beşik çatı: mahya z ekseninde; yari = duvar yarı genişliği, yuk = çatı yüksekliği, derin = duvar derinliği */
  Kur.prototype.cati = function (yari, yuk, derin, y0, renk, sacak, kal, mahyaRenk) {
    var th = Math.atan2(yuk, yari), L = Math.hypot(yari, yuk) + sacak, c = Math.cos(th), s = Math.sin(th);
    for (var k = -1; k <= 1; k += 2) {
      var cx = k * (yari / 2) + k * c * sacak / 2 + k * s * kal / 2, cy = y0 + yuk / 2 - s * sacak / 2 + c * kal / 2;
      this.kutuM(L, kal, derin + sacak * 2, renk, cx, cy, 0, 0, 0, -k * th);
    }
    if (mahyaRenk !== undefined) this.kutuM(kal * 2.2, kal * 1.6, derin + sacak * 2 + 0.04, mahyaRenk, 0, y0 + yuk + kal * 0.7, 0);
    return this;
  };
  Kur.prototype.geo = function () { return birlestir(this.l, this.r); };
  Kur.prototype.mesh = function (mat, golge) { var m = new T.Mesh(this.geo(), mat); if (golge !== false) { m.castShadow = true; m.receiveShadow = true; } return m; };

  function birlestir(list, rr) {
    var n = 0; list.forEach(function (p) { n += p.g.attributes.position.count; });
    var P = new Float32Array(n * 3), N = new Float32Array(n * 3), C = new Float32Array(n * 3), o = 0;
    var a = new T.Vector3(), b = new T.Vector3(), c = new T.Vector3(), u = new T.Vector3(), w = new T.Vector3(), col = new T.Color();
    for (var li = 0; li < list.length; li++) {
      var p = list[li], src = p.g.attributes.position.array, cnt = p.g.attributes.position.count;
      col.set(p.c);
      for (var i = 0; i < cnt; i += 3) {
        a.fromArray(src, i * 3).applyMatrix4(p.m); b.fromArray(src, i * 3 + 3).applyMatrix4(p.m); c.fromArray(src, i * 3 + 6).applyMatrix4(p.m);
        u.subVectors(b, a); w.subVectors(c, a); u.cross(w);
        var L = u.length(); if (L < 1e-10) continue;                      /* sıfır alanlı üçgen (koni tepesi) atlanır */
        u.multiplyScalar(1 / L);
        var k = p.t ? 1 + (rr() * 2 - 1) * p.t : 1, cr = Math.min(1, col.r * k), cg = Math.min(1, col.g * k), cb = Math.min(1, col.b * k);
        var vs = [a, b, c];
        for (var j = 0; j < 3; j++) { var q = vs[j]; P[o] = q.x; P[o + 1] = q.y; P[o + 2] = q.z; N[o] = u.x; N[o + 1] = u.y; N[o + 2] = u.z; C[o] = cr; C[o + 1] = cg; C[o + 2] = cb; o += 3; }
      }
    }
    var g = new T.BufferGeometry();
    g.setAttribute("position", new T.BufferAttribute(P.slice(0, o), 3)); g.setAttribute("normal", new T.BufferAttribute(N.slice(0, o), 3)); g.setAttribute("color", new T.BufferAttribute(C.slice(0, o), 3));
    g.computeBoundingSphere(); g.computeBoundingBox();
    return g;
  }

  /* ---------- renkler ---------- */
  var R = {
    cimen: 0x7ec850, cimenK: 0x6cb544, toprak: 0x8d5f35, sirt: 0xa06f42, yol: 0xd9b67c, yolK: 0xb48c55,
    tahta: 0xd39b5a, tahtaK: 0xa8713a, tahtaKK: 0x7d5128, cit: 0xeacfa4, beyaz: 0xfff8ee, tas: 0xb3aca2, tasK: 0x8f877d,
    kirmizi: 0xd64541, kirmiziK: 0xae3434, kiremit: 0xd9644b, mavi: 0x4f86c6, maviA: 0x7fb2e0, krem: 0xfbe7c6, seftali: 0xf6caa2,
    gri: 0x7d8fa0, sari: 0xf2c94c, saman: 0xe8c95a, yaprak: 0x55b552, yaprakK: 0x3e9a46, yaprakA: 0x76c95c, govde: 0x8b5a2b,
    cam: 0xa8dcf0, su: 0x5bc0eb
  };

  /* ---------- tarla ---------- */
  function tarlaToprak() {
    var K = new Kur(11);
    K.kutu(2.36, 0.2, 2.36, 0x7f5430, 0, 0, 0);
    K.kutu(2.2, 0.03, 2.2, R.toprak, 0, 0.2, 0, 0, 0, 0, 0.04);
    for (var i = 0; i < 4; i++) K.kutu(2.08, 0.08, 0.3, R.sirt, 0, 0.21, -0.8 + i * 0.5333, 0, 0, 0, 0.05);
    return K.geo();
  }
  var EKIN_GEO = {};
  var SIRA = [-0.8, -0.2667, 0.2667, 0.8], Y0 = 0.27;
  function ekinGeo(tur, a) {
    var key = tur + a; if (EKIN_GEO[key]) return EKIN_GEO[key];
    var K = new Kur(tur.length * 31 + a), r = K.r, i, j, x, z;
    if (tur === "bugday") {
      for (i = 0; i < 4; i++) for (j = 0; j < 4; j++) {
        x = SIRA[j] + (r() - 0.5) * 0.12; z = SIRA[i] + (r() - 0.5) * 0.08;
        if (a === 1) { for (var b1 = 0; b1 < 3; b1++) K.koniM(0.03, 0.2, 4, 0x8bc34a, x + (b1 - 1) * 0.05, Y0 + 0.1, z, (r() - 0.5) * 0.5, 0, (b1 - 1) * 0.35); continue; }
        var boy = a === 2 ? 0.45 : 0.66, sap = a === 2 ? 0x8fc744 : 0xd9ae45, bas = a === 2 ? 0x9fd256 : 0xf2c94c;
        for (var s = 0; s < 3; s++) {
          var ang = s * 2.1 + r(), ex = Math.cos(ang) * 0.06, ez = Math.sin(ang) * 0.05, egim = (r() - 0.5) * 0.25, h = boy * (0.85 + r() * 0.3);
          K.silM(0.016, 0.022, h, 4, sap, x + ex, Y0 + h / 2, z + ez, egim * 0.5, 0, egim, true);
          K.okta(0.045, a === 2 ? 0.09 : 0.13, 0.045, bas, x + ex + egim * h * -0.5, Y0 + h + 0.05, z + ez + egim * h * 0.25, 0, ang, egim);
        }
      }
    } else if (tur === "misir") {
      var P3 = [-0.7, 0, 0.7];
      for (i = 0; i < 3; i++) for (j = 0; j < 3; j++) {
        x = P3[j] + (r() - 0.5) * 0.12; z = P3[i] + (r() - 0.5) * 0.12;
        if (a === 1) { K.koniM(0.05, 0.22, 4, 0x6dbb45, x - 0.04, Y0 + 0.11, z, 0, 0, 0.4); K.koniM(0.05, 0.26, 4, 0x6dbb45, x + 0.04, Y0 + 0.13, z, 0, 0, -0.35); continue; }
        var h2 = a === 2 ? 0.75 : 1.15, yap = a === 2 ? 0x5fb04a : 0x55a843;
        K.silM(0.035, 0.05, h2, 5, 0x6aa84f, x, Y0 + h2 / 2, z);
        for (var l = 0; l < 4; l++) { var la = l * 1.6 + r(), ly = Y0 + h2 * (0.25 + l * 0.17); K.kutuM(0.38, 0.03, 0.1, yap, x + Math.cos(la) * 0.17, ly + 0.05, z + Math.sin(la) * 0.17, 0, -la, 0.45); }
        if (a === 3) {
          var ca = r() * 6.28;
          K.silM(0.065, 0.055, 0.26, 6, 0xffd54f, x + Math.cos(ca) * 0.1, Y0 + h2 * 0.55, z + Math.sin(ca) * 0.1, Math.sin(ca) * 0.35, 0, -Math.cos(ca) * 0.35);
          K.koniM(0.07, 0.2, 5, 0x8bc34a, x + Math.cos(ca) * 0.1, Y0 + h2 * 0.55 - 0.12, z + Math.sin(ca) * 0.1, Math.PI + Math.sin(ca) * 0.35, 0, -Math.cos(ca) * 0.35);
          K.koniM(0.06, 0.2, 4, 0xe2b648, x, Y0 + h2 + 0.08, z);
        }
      }
    } else if (tur === "havuc") {
      for (i = 0; i < 4; i++) for (j = 0; j < 4; j++) {
        x = SIRA[j] + (r() - 0.5) * 0.1; z = SIRA[i] + (r() - 0.5) * 0.08;
        var n = a === 1 ? 2 : 4, hh = a === 1 ? 0.14 : a === 2 ? 0.28 : 0.36;
        for (var f = 0; f < n; f++) { var fa = f * (6.28 / n) + r(); K.koniM(0.035, hh, 4, a === 3 ? 0x3f9f45 : 0x52b04e, x + Math.cos(fa) * 0.03, Y0 + hh / 2, z + Math.sin(fa) * 0.03, Math.sin(fa) * 0.35, 0, -Math.cos(fa) * 0.35); }
        if (a === 3) K.koniM(0.075, 0.16, 6, 0xf57c00, x, Y0 - 0.02, z, Math.PI, 0, 0);
      }
    } else if (tur === "yabanmersini") {
      var P3y = [-0.7, 0, 0.7];
      for (i = 0; i < 3; i++) for (j = 0; j < 3; j++) {
        x = P3y[j] + (r() - 0.5) * 0.1; z = P3y[i] + (r() - 0.5) * 0.1;
        if (a === 1) { K.top(0.12, 0.1, 0.12, 0x4f9a35, x, Y0 + 0.06, z, 0); continue; }
        var ys = a === 2 ? 0.28 : 0.34;
        K.top(ys, ys * 0.95, ys, 0x3f8a3f, x, Y0 + ys * 0.6, z, 0, 0.07); K.top(ys * 0.7, ys * 0.7, ys * 0.7, 0x4caf50, x + 0.12, Y0 + ys * 0.9, z - 0.08, 0, 0.07);
        for (var yb = 0; yb < (a === 2 ? 4 : 8); yb++) { var ya = yb * 0.8 + r(), yr = ys * (0.75 + r() * 0.3); K.top(0.045, 0.045, 0.045, a === 2 ? 0x9fc9a0 : 0x4356b8, x + Math.cos(ya) * yr, Y0 + ys * 0.55 + Math.sin(yb * 1.7) * ys * 0.4, z + Math.sin(ya) * yr, 0); }
      }
    } else if (tur === "kahve") {
      var P3k = [-0.7, 0, 0.7];
      for (i = 0; i < 3; i++) for (j = 0; j < 3; j++) {
        x = P3k[j] + (r() - 0.5) * 0.1; z = P3k[i] + (r() - 0.5) * 0.1;
        if (a === 1) { K.silM(0.02, 0.025, 0.2, 4, 0x7a4f2a, x, Y0 + 0.1, z); K.top(0.09, 0.06, 0.12, 0x5fb04a, x, Y0 + 0.22, z, 0); continue; }
        var kh = a === 2 ? 0.5 : 0.7;
        K.silM(0.03, 0.04, kh, 5, 0x7a4f2a, x, Y0 + kh / 2, z);
        for (var l2 = 0; l2 < 5; l2++) { var la2 = l2 * 1.3 + r(), ly2 = Y0 + kh * (0.35 + l2 * 0.14); K.kutuM(0.3, 0.025, 0.13, 0x2e7d32, x + Math.cos(la2) * 0.13, ly2, z + Math.sin(la2) * 0.13, 0, -la2, 0.2); }
        if (a === 3) for (var cb = 0; cb < 6; cb++) { var ca2 = cb * 1.05 + r(); K.top(0.035, 0.045, 0.035, cb % 2 ? 0xc62828 : 0x8d4a2a, x + Math.cos(ca2) * 0.08, Y0 + kh * (0.4 + cb * 0.08), z + Math.sin(ca2) * 0.08, 0); }
      }
    } else if (tur === "domates") {
      var P3d = [-0.7, 0, 0.7];
      for (i = 0; i < 3; i++) for (j = 0; j < 3; j++) {
        x = P3d[j] + (r() - 0.5) * 0.1; z = P3d[i] + (r() - 0.5) * 0.1;
        if (a === 1) { K.silM(0.015, 0.02, 0.22, 4, 0x6aa84f, x, Y0 + 0.11, z); K.top(0.08, 0.05, 0.1, 0x5fb04a, x, Y0 + 0.24, z, 0); continue; }
        var dh = a === 2 ? 0.55 : 0.75;
        K.silM(0.02, 0.025, dh, 4, 0x8d6e4f, x, Y0 + dh / 2, z);
        K.silM(0.025, 0.03, dh, 4, 0x5f9a4a, x + 0.04, Y0 + dh / 2, z, 0.08, 0, 0.1);
        for (var l3 = 0; l3 < 4; l3++) { var la3 = l3 * 1.6 + r(); K.top(0.14, 0.05, 0.1, 0x4caf50, x + Math.cos(la3) * 0.13, Y0 + dh * (0.3 + l3 * 0.18), z + Math.sin(la3) * 0.13, 0, 0, 0, la3); }
        if (a === 3) for (var tm = 0; tm < 4; tm++) { var ta = tm * 1.7 + r(); K.top(0.07, 0.065, 0.07, 0xe53935, x + Math.cos(ta) * 0.12, Y0 + dh * (0.35 + tm * 0.15), z + Math.sin(ta) * 0.12, 0); }
        else if (a === 2) for (var tg = 0; tg < 3; tg++) { var tga = tg * 2.1; K.top(0.04, 0.04, 0.04, 0x9ccc65, x + Math.cos(tga) * 0.1, Y0 + dh * (0.4 + tg * 0.15), z + Math.sin(tga) * 0.1, 0); }
      }
    } else if (tur === "lavanta") {
      for (i = 0; i < 4; i++) for (j = 0; j < 4; j++) {
        x = SIRA[j] + (r() - 0.5) * 0.1; z = SIRA[i] + (r() - 0.5) * 0.08;
        var n2 = a === 1 ? 2 : 5, lh = a === 1 ? 0.15 : a === 2 ? 0.32 : 0.42;
        for (var f2 = 0; f2 < n2; f2++) { var fa2 = f2 * (6.28 / n2) + r(), ex2 = Math.cos(fa2) * 0.05, ez2 = Math.sin(fa2) * 0.05; K.silM(0.012, 0.016, lh, 3, 0x7fa66a, x + ex2, Y0 + lh / 2, z + ez2, Math.sin(fa2) * 0.2, 0, -Math.cos(fa2) * 0.2); if (a === 3) K.okta(0.03, 0.11, 0.03, 0x8e7cc3, x + ex2 * 1.6, Y0 + lh + 0.06, z + ez2 * 1.6, 0, fa2, 0); else if (a === 2) K.okta(0.025, 0.07, 0.025, 0xb4a6d6, x + ex2 * 1.6, Y0 + lh + 0.04, z + ez2 * 1.6, 0, fa2, 0); }
      }
    } else if (tur === "kabak") {
      var P2k = [-0.5, 0.5];
      for (i = 0; i < 2; i++) for (j = 0; j < 2; j++) {
        x = P2k[j] + (r() - 0.5) * 0.15; z = P2k[i] + (r() - 0.5) * 0.15;
        if (a === 1) { K.top(0.16, 0.06, 0.16, 0x5fb04a, x, Y0 + 0.04, z, 0); continue; }
        for (var v2 = 0; v2 < 4; v2++) { var va = v2 * 1.57 + r() * 0.5; K.kutuM(0.5, 0.03, 0.05, 0x4caf50, x + Math.cos(va) * 0.3, Y0 + 0.02, z + Math.sin(va) * 0.3, 0, -va, 0); K.top(0.16, 0.05, 0.14, 0x5fb04a, x + Math.cos(va) * 0.5, Y0 + 0.06, z + Math.sin(va) * 0.5, 0, 0, 0, va); }
        if (a === 3) { K.yuvarlak(0.3, 0.22, 0.3, 0xf57c00, x, Y0 + 0.22, z); K.sil(0.04, 0.05, 0.1, 5, 0x6d4c41, x, Y0 + 0.42, z); } else K.yuvarlak(0.14, 0.11, 0.14, 0x8bc34a, x, Y0 + 0.1, z);
      }
    } else if (tur === "cilek") {
      var P3c = [-0.68, 0, 0.68];
      for (i = 0; i < 3; i++) for (j = 0; j < 3; j++) {
        x = P3c[j] + (r() - 0.5) * 0.1; z = P3c[i] + (r() - 0.5) * 0.1;
        if (a === 1) { K.top(0.12, 0.08, 0.12, 0x5fb04a, x, Y0 + 0.05, z, 0); continue; }
        var bs = a === 2 ? 0.2 : 0.25;
        K.top(bs, bs * 0.7, bs, 0x3f9b45, x, Y0 + bs * 0.45, z, 0, 0.06); K.top(bs * 0.75, bs * 0.55, bs * 0.75, 0x4caf50, x + 0.1, Y0 + bs * 0.55, z - 0.06, 0, 0.06);
        for (var e = 0; e < (a === 2 ? 3 : 5); e++) {
          var ea = e * 1.3 + r() * 0.5, er = bs * 0.95;
          if (a === 2) K.top(0.04, 0.025, 0.04, 0xffffff, x + Math.cos(ea) * er * 0.8, Y0 + bs * 0.8, z + Math.sin(ea) * er * 0.8, 0);
          else { K.koniM(0.055, 0.1, 5, 0xe53935, x + Math.cos(ea) * er, Y0 + bs * 0.3, z + Math.sin(ea) * er, Math.PI, 0, 0); K.top(0.045, 0.015, 0.045, 0x2e7d32, x + Math.cos(ea) * er, Y0 + bs * 0.36, z + Math.sin(ea) * er, 0); }
        }
      }
    }
    return (EKIN_GEO[key] = K.geo());
  }

  /* ---------- yapılar (yerel; ön +z) ---------- */
  function ambar() {
    var K = new Kur(21);
    K.kutu(4.5, 0.25, 4.7, R.tas, 0, 0, 0, 0, 0, 0, 0.05);
    K.kutu(4.2, 3.0, 4.4, R.kirmizi, 0, 0.25, 0, 0, 0, 0, 0.03);
    K.prizma(4.2, 1.5, 4.4, R.kirmizi, 0, 3.25, 0);
    K.cati(2.1, 1.5, 4.4, 3.25, 0x8e3b33, 0.35, 0.16, 0x6f2c26);
    [[-2.1, 2.2], [2.1, 2.2], [-2.1, -2.2], [2.1, -2.2]].forEach(function (p) { K.kutu(0.18, 3.0, 0.18, R.beyaz, p[0], 0.25, p[1]); });
    K.kutu(4.3, 0.16, 0.1, R.beyaz, 0, 3.1, 2.22);                       /* saçak bandı */
    K.kutu(2.3, 2.3, 0.08, 0xb8383a, 0, 0.25, 2.22);                      /* büyük kapı */
    [[-1.15, 0.25, 0.14, 2.3], [1.15, 0.25, 0.14, 2.3], [0, 0.25, 0.1, 2.3]].forEach(function (b) { K.kutu(b[2], b[3], 0.12, R.beyaz, b[0], b[1], 2.25); });
    K.kutu(2.44, 0.14, 0.12, R.beyaz, 0, 2.55, 2.25);
    var dl = Math.hypot(1.0, 2.1), da = Math.atan2(2.1, 1.0);
    [-0.575, 0.575].forEach(function (cx) { K.kutuM(dl, 0.1, 0.06, R.beyaz, cx, 1.4, 2.27, 0, 0, da); K.kutuM(dl, 0.1, 0.06, R.beyaz, cx, 1.4, 2.27, 0, 0, -da); });
    K.kutu(1.1, 0.85, 0.08, 0x5a2a20, 0, 3.4, 2.22); K.kutu(0.9, 0.5, 0.1, R.saman, 0, 3.42, 2.24, 0, 0, 0, 0.1);   /* saman penceresi */
    [[0, 3.32, 1.26, 0.1], [0, 4.21, 1.26, 0.1]].forEach(function (b) { K.kutu(b[2], b[3], 0.12, R.beyaz, b[0], b[1], 2.25); });
    K.kutu(0.1, 0.95, 0.12, R.beyaz, -0.6, 3.32, 2.25); K.kutu(0.1, 0.95, 0.12, R.beyaz, 0.6, 3.32, 2.25);
    /* silo */
    K.sil(1.05, 1.05, 4.8, 12, 0xece6d8, 3.55, 0, -0.7, 0.02);
    [1.2, 2.4, 3.6].forEach(function (y) { K.sil(1.08, 1.08, 0.12, 12, 0xcfc6b4, 3.55, y, -0.7); });
    K.kubbe(1.1, 0.9, 0xc0453d, 3.55, 4.8, -0.7); K.sil(0.1, 0.16, 0.25, 6, 0x8e3b33, 3.55, 5.65, -0.7);
    K.kutu(0.5, 0.35, 0.5, R.saman, -1.6, 0.25, 2.8, 0.3, 0, 0, 0.1); K.kutu(0.5, 0.35, 0.5, R.saman, -1.25, 0.25, 3.15, -0.2, 0, 0, 0.1); K.kutu(0.5, 0.35, 0.5, R.saman, -1.45, 0.6, 2.95, 0.1, 0, 0, 0.1);
    return K;
  }
  function ev() {
    var K = new Kur(31);
    K.kutu(4.8, 0.3, 3.8, R.tas, 0, 0, 0, 0, 0, 0, 0.05);
    K.kutu(4.4, 2.4, 3.4, R.krem, 0, 0.3, 0, 0, 0, 0, 0.02);
    K.grup(0, 0, 0, Math.PI / 2); K.prizma(3.4, 1.35, 4.4, R.krem, 0, 2.7, 0); K.cati(1.7, 1.35, 4.4, 2.7, R.mavi, 0.35, 0.15, 0x3c6aa3); K.bitir();
    K.kutu(0.5, 1.4, 0.5, 0xb5523b, 1.3, 3.0, -0.6, 0, 0, 0, 0.05); K.kutu(0.6, 0.12, 0.6, 0x8e3b2e, 1.3, 4.4, -0.6);
    K.kutu(0.95, 1.65, 0.08, 0x8a5a33, 0, 0.3, 1.72); K.kutu(1.15, 0.12, 0.12, R.beyaz, 0, 1.95, 1.74); K.kutu(0.1, 1.65, 0.12, R.beyaz, -0.52, 0.3, 1.74); K.kutu(0.1, 1.65, 0.12, R.beyaz, 0.52, 0.3, 1.74);
    K.top(0.05, 0.05, 0.05, 0xf2c94c, 0.3, 1.1, 1.8);
    [-1.45, 1.45].forEach(function (x) {
      K.kutu(0.85, 0.8, 0.06, R.cam, x, 1.15, 1.71); K.kutu(1.0, 0.1, 0.1, R.beyaz, x, 1.95, 1.73); K.kutu(1.0, 0.1, 0.1, R.beyaz, x, 1.05, 1.73);
      K.kutu(0.08, 0.8, 0.1, R.beyaz, x - 0.46, 1.15, 1.73); K.kutu(0.08, 0.8, 0.1, R.beyaz, x + 0.46, 1.15, 1.73); K.kutu(0.05, 0.8, 0.09, R.beyaz, x, 1.15, 1.74); K.kutu(0.85, 0.05, 0.09, R.beyaz, x, 1.53, 1.74);
      K.kutu(1.0, 0.22, 0.28, R.tahtaK, x, 0.8, 1.86);
      for (var f = 0; f < 4; f++) K.top(0.09, 0.09, 0.09, [0xff8fb3, 0xffd15c, 0xff6b86, 0xffffff][f], x - 0.36 + f * 0.24, 1.08, 1.86, 0);
      K.kutu(0.18, 0.8, 0.06, 0x4f86c6, x - 0.62, 1.15, 1.72); K.kutu(0.18, 0.8, 0.06, 0x4f86c6, x + 0.62, 1.15, 1.72);
    });
    K.kutu(1.5, 0.15, 0.6, R.tasK, 0, 0, 2.15); K.kutu(1.2, 0.15, 0.4, R.tas, 0, 0.15, 2.05);
    return K;
  }
  function yemFabrikasi() {
    var K = new Kur(41);
    K.kutu(3.3, 0.2, 2.9, R.tas, 0, 0, 0, 0, 0, 0, 0.05);
    K.kutu(3.0, 2.3, 2.6, R.tahta, 0, 0.2, 0, 0, 0, 0, 0.04);
    for (var i = 0; i < 7; i++) K.kutu(0.04, 2.3, 0.05, R.tahtaK, -1.3 + i * 0.433, 0.2, 1.31);
    K.prizma(3.0, 1.1, 2.6, R.tahta, 0, 2.5, 0);
    K.cati(1.5, 1.1, 2.6, 2.5, R.gri, 0.3, 0.13, 0x5f6f7f);
    K.kutu(1.3, 1.6, 0.08, R.tahtaKK, 0, 0.2, 1.32); K.kutu(0.07, 1.6, 0.1, R.tahtaK, 0, 0.2, 1.36);
    K.kutu(1.45, 0.12, 0.12, R.tahtaK, 0, 1.8, 1.35);
    /* huni */
    [[1.95, 0.5], [2.95, 0.5], [1.95, -0.5], [2.95, -0.5]].forEach(function (p) { K.kutu(0.1, 2.6, 0.1, R.tahtaKK, p[0], 0, p[1]); });
    K.koniM(0.75, 1.2, 8, 0xe8c547, 2.45, 2.65, 0, Math.PI, 0, 0); K.sil(0.75, 0.75, 0.5, 8, 0xdcb73a, 2.45, 3.25, 0); K.sil(0.12, 0.12, 0.7, 6, 0xb8952e, 2.45, 1.75, 0);
    K.kutu(0.7, 0.25, 0.7, 0xc8a23a, 2.45, 0.0, 0);
    [[-1.05, 1.7, 0.2], [-0.62, 1.75, -0.25], [-0.85, 2.05, 0]].forEach(function (s) { K.top(0.25, 0.3, 0.2, 0xeadcbf, s[0], 0.3, s[1] + 0.2, 0, 0.05, 0, s[2], 0); });
    K.kutu(0.6, 0.12, 0.6, R.tahtaK, -0.85, 0, 1.7);
    return K;
  }
  function yemCark() {                                                     /* üretirken dönen çark (ayrı nesne) */
    var K = new Kur(42);
    K.silM(0.5, 0.5, 0.12, 10, 0x9aa7b2, 0, 0, 0, Math.PI / 2, 0, 0);
    for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4; K.kutuM(0.16, 0.18, 0.12, 0x7d8a95, Math.cos(a) * 0.55, Math.sin(a) * 0.55, 0, 0, 0, a); }
    K.silM(0.12, 0.12, 0.16, 6, 0x5f6b75, 0, 0, 0, Math.PI / 2, 0, 0);
    return K;
  }
  function firin() {
    var K = new Kur(51);
    K.kutu(3.7, 0.2, 3.3, R.tas, 0, 0, 0, 0, 0, 0, 0.05);
    K.kutu(3.4, 0.45, 3.0, 0xc4664a, 0, 0.2, 0, 0, 0, 0, 0.06);
    K.kutu(3.4, 1.95, 3.0, R.seftali, 0, 0.65, 0, 0, 0, 0, 0.02);
    K.grup(0, 0, 0, Math.PI / 2); K.prizma(3.0, 1.2, 3.4, R.seftali, 0, 2.6, 0); K.cati(1.5, 1.2, 3.4, 2.6, R.kiremit, 0.32, 0.14, 0xb24d38); K.bitir();
    K.kutu(0.55, 1.6, 0.55, 0xb5523b, -1.0, 2.4, -0.5, 0, 0, 0, 0.06); K.kutu(0.66, 0.14, 0.66, 0x8e3b2e, -1.0, 4.0, -0.5);
    K.kutu(0.85, 1.5, 0.08, 0x8a5a33, 0.85, 0.2, 1.52); K.kutu(1.0, 0.1, 0.1, R.beyaz, 0.85, 1.7, 1.54);
    K.kutu(1.3, 0.9, 0.06, R.cam, -0.7, 0.95, 1.51); K.kutu(1.45, 0.1, 0.1, R.beyaz, -0.7, 1.85, 1.53); K.kutu(1.45, 0.1, 0.1, R.beyaz, -0.7, 0.88, 1.53);
    for (var b = 0; b < 3; b++) K.top(0.17, 0.09, 0.1, 0xc98a3f, -1.05 + b * 0.35, 1.05, 1.56, 0, 0.05);
    for (var s = 0; s < 8; s++) K.kutuM(0.36, 0.06, 0.62, s % 2 ? R.beyaz : 0xe24b4b, -1.27 + s * 0.363, 2.12, 1.78, 0.55, 0, 0);
    K.silM(0.32, 0.32, 0.08, 10, R.tahta, 0.85, 2.35, 1.6, Math.PI / 2, 0, 0); K.top(0.2, 0.11, 0.06, 0xc98a3f, 0.85, 2.35, 1.66, 0);
    return K;
  }
  function mandira() {
    var K = new Kur(61);
    K.kutu(3.7, 0.2, 3.3, R.tas, 0, 0, 0, 0, 0, 0, 0.05);
    K.kutu(3.4, 0.4, 3.0, R.maviA, 0, 0.2, 0);
    K.kutu(3.4, 1.9, 3.0, 0xfdfdfd, 0, 0.6, 0, 0, 0, 0, 0.015);
    K.prizma(3.4, 1.15, 3.0, 0xfdfdfd, 0, 2.5, 0);
    K.cati(1.7, 1.15, 3.0, 2.5, 0x6aa0d6, 0.3, 0.14, 0x4f86c6);
    K.kutu(0.9, 1.5, 0.08, 0x4f86c6, 0, 0.2, 1.52); K.kutu(1.05, 0.1, 0.1, R.beyaz, 0, 1.7, 1.54);
    [-1.1, 1.1].forEach(function (x) { K.kutu(0.7, 0.7, 0.06, R.cam, x, 1.0, 1.51); K.kutu(0.82, 0.08, 0.09, 0x4f86c6, x, 1.7, 1.53); K.kutu(0.82, 0.08, 0.09, 0x4f86c6, x, 0.95, 1.53); });
    /* çatıdaki dev süt şişesi */
    K.sil(0.42, 0.42, 0.9, 10, 0xffffff, 0, 3.15, 0.95); K.sil(0.43, 0.43, 0.25, 10, 0x6aa0d6, 0, 3.45, 0.95);
    K.sil(0.2, 0.42, 0.35, 10, 0xffffff, 0, 4.05, 0.95); K.sil(0.2, 0.2, 0.15, 10, 0x4f86c6, 0, 4.4, 0.95);
    K.kutu(0.25, 0.65, 0.25, 0xb0bec5, 0, 2.5, 0.95);
    [[1.35, 1.8], [1.65, 1.95]].forEach(function (p) { K.sil(0.16, 0.18, 0.42, 8, 0xd8dde2, p[0], 0.2, p[1]); K.sil(0.08, 0.16, 0.12, 8, 0xd8dde2, p[0], 0.62, p[1]); });
    return K;
  }
  function kafe() {
    var K = new Kur(65);
    K.kutu(3.6, 0.2, 3.0, R.tas, 0, 0, 0, 0, 0, 0, 0.05);
    K.kutu(3.2, 2.2, 2.4, 0xfff1e6, 0, 0.2, -0.2, 0, 0, 0, 0.02);
    K.kutu(3.26, 0.5, 2.46, 0xe85d75, 0, 0.2, -0.2);
    K.kutu(3.3, 0.3, 2.5, 0x8e3b33, 0, 2.4, -0.2); K.kutu(3.0, 0.12, 2.2, 0xffe6a6, 0, 2.7, -0.2);
    K.kutu(3.2, 0.9, 0.5, 0xd9c3a3, 0, 0.2, 1.2, 0, 0, 0, 0.04); K.kutu(3.4, 0.1, 0.65, 0xf6e7cd, 0, 1.1, 1.2);     /* tezgâh */
    for (var s2 = 0; s2 < 9; s2++) K.kutuM(0.4, 0.05, 1.0, s2 % 2 ? 0xfff8ee : 0xe85d75, -1.6 + s2 * 0.4, 2.05, 1.35, 0.42, 0, 0);   /* tente */
    K.kutu(0.08, 2.0, 0.08, 0xfff8ee, -1.62, 0.2, 1.7); K.kutu(0.08, 2.0, 0.08, 0xfff8ee, 1.62, 0.2, 1.7);
    K.kutu(1.4, 0.7, 0.06, R.cam, -0.6, 1.35, 1.0); K.kutu(1.5, 0.08, 0.1, 0xe85d75, -0.6, 2.05, 1.0); K.kutu(0.9, 1.5, 0.06, 0x8a5a33, 0.9, 0.2, 0.99); K.kutu(1.0, 0.1, 0.1, 0xe85d75, 0.9, 1.7, 1.02);
    K.sil(0.16, 0.13, 0.18, 8, 0xffffff, -1.0, 1.2, 1.25); K.sil(0.14, 0.14, 0.03, 8, 0x5a3421, -1.0, 1.36, 1.25);        /* tezgâhta fincan */
    K.sil(0.11, 0.11, 0.14, 8, 0xd9a05a, -0.4, 1.2, 1.3); K.top(0.12, 0.09, 0.12, 0x8b5a2b, -0.4, 1.38, 1.3, 0);          /* muffin */
    K.kutu(0.5, 0.42, 0.18, R.saman, 0.45, 1.2, 1.3, 0.2);                                                              /* tost */
    /* çatıda büyük fincan tabelası */
    K.sil(0.52, 0.42, 0.7, 10, 0xffffff, 0.3, 2.7, -0.3); K.sil(0.5, 0.5, 0.06, 10, 0x5a3421, 0.3, 3.4, -0.3);
    K.silM(0.3, 0.3, 0.12, 10, 0xffffff, 0.98, 3.05, -0.3, Math.PI / 2, 0, Math.PI / 2, true);
    [[0.1, 0.2], [0.3, 0.3], [0.5, 0.15]].forEach(function (b, i) { K.top(0.07, 0.11, 0.07, 0xdddddd, b[0], 3.55 + i * 0.1, -0.3 + b[1] - 0.3, 0); });   /* buhar */
    K.sil(0.9, 0.9, 0.05, 20, 0xe85d75, 0.3, 2.68, -0.3);
    return K;
  }
  function mimarMasasi() {                                                /* çizim masası: eğik tabla, rulo pafta, lamba */
    var K = new Kur(66);
    K.kutu(0.08, 0.8, 0.08, R.tahtaKK, -0.5, 0, 0.3); K.kutu(0.08, 0.95, 0.08, R.tahtaKK, -0.5, 0, -0.3); K.kutu(0.08, 0.8, 0.08, R.tahtaKK, 0.5, 0, 0.3); K.kutu(0.08, 0.95, 0.08, R.tahtaKK, 0.5, 0, -0.3);
    K.kutuM(1.2, 0.06, 0.8, R.tahta, 0, 0.9, 0, -0.35, 0, 0);
    K.kutuM(0.9, 0.012, 0.6, 0x9fc5ff, 0, 0.94, 0.02, -0.35, 0, 0);
    [[-0.3, 0.1], [0.1, -0.1], [0.25, 0.15]].forEach(function (c) { K.kutuM(0.25, 0.006, 0.18, 0xffffff, c[0], 0.955, c[1], -0.35, 0, 0); });
    K.silM(0.06, 0.06, 0.7, 6, 0xf6f1e8, 0.75, 0.6, -0.2, 0, 0, 1.2); K.silM(0.065, 0.065, 0.05, 6, 0x4f86c6, 0.75, 0.6, -0.2, 0, 0, 1.2);
    K.sil(0.03, 0.03, 0.5, 5, 0x333333, -0.45, 0.92, -0.35); K.koniM(0.16, 0.16, 8, 0xf2c94c, -0.35, 1.48, -0.3, Math.PI - 0.5, 0, 0);
    K.sil(0.07, 0.07, 0.1, 6, 0xffffff, 0.35, 0.95, 0.3); K.sil(0.06, 0.06, 0.02, 6, 0x5a3421, 0.35, 1.05, 0.3);
    return K;
  }
  function kumesBina() {
    var K = new Kur(71);
    [[-0.85, 0.55], [0.85, 0.55], [-0.85, -0.55], [0.85, -0.55]].forEach(function (p) { K.kutu(0.12, 0.55, 0.12, R.tahtaKK, p[0], 0, p[1]); });
    K.kutu(2.0, 1.25, 1.4, 0xb5763d, 0, 0.55, 0, 0, 0, 0, 0.04);
    K.grup(0, 0, 0, Math.PI / 2); K.prizma(1.4, 0.7, 2.0, 0xb5763d, 0, 1.8, 0); K.cati(0.7, 0.7, 2.0, 1.8, 0xc0453d, 0.22, 0.1, 0x8e3b33); K.bitir();
    K.kutu(0.45, 0.55, 0.06, 0x4a2c18, 0.45, 0.65, 0.71);
    K.kutuM(0.4, 0.05, 1.1, R.tahtaK, 0.45, 0.32, 1.15, 0.52, 0, 0);
    for (var i = 0; i < 4; i++) K.kutuM(0.36, 0.035, 0.04, R.tahtaKK, 0.45, 0.2 + i * 0.12, 1.42 - i * 0.2, 0.52, 0, 0);
    K.kutu(0.45, 0.35, 0.45, R.saman, -0.6, 0.55, 0.62, 0, 0, 0, 0.1);
    return K;
  }
  function ahirBina() {
    var K = new Kur(81);
    K.kutu(3.2, 0.12, 2.4, 0xb79a6a, 0, 0, 0);
    [[-1.5, 1.1], [1.5, 1.1], [-1.5, -1.1], [1.5, -1.1]].forEach(function (p) { K.kutu(0.16, 2.2, 0.16, R.tahtaK, p[0], 0.1, p[1]); });
    K.kutu(3.2, 1.6, 0.12, R.tahta, 0, 0.1, -1.12, 0, 0, 0, 0.05);
    K.kutuM(3.6, 0.14, 2.9, 0xc0453d, 0, 2.4, 0, -0.18, 0, 0);
    K.kutu(1.4, 0.55, 0.9, R.saman, -0.6, 0.1, -0.4, 0, 0, 0, 0.12); K.kutu(0.9, 0.45, 0.7, R.saman, 0.7, 0.1, -0.5, 0.3, 0, 0, 0.12);
    return K;
  }
  function pano() {
    var K = new Kur(91);
    K.kutu(0.14, 2.0, 0.14, R.tahtaKK, -1.0, 0, 0); K.kutu(0.14, 2.0, 0.14, R.tahtaKK, 1.0, 0, 0);
    K.kutu(2.3, 1.3, 0.12, R.tahta, 0, 0.75, 0, 0, 0, 0, 0.04);
    K.kutu(2.45, 0.1, 0.18, R.tahtaK, 0, 2.05, 0); K.kutuM(2.6, 0.08, 0.5, 0xc0453d, 0, 2.2, 0, -0.35, 0, 0);
    [[-0.65, 0.05], [0, -0.06], [0.65, 0.07]].forEach(function (n, i) { K.kutuM(0.5, 0.62, 0.02, i === 1 ? 0xfff3b0 : 0xffffff, n[0], 1.42, 0.07, 0, 0, n[1]); K.top(0.04, 0.04, 0.02, 0xe53935, n[0], 1.7, 0.09, 0); });
    return K;
  }
  function kamyon() {
    var K = new Kur(101);
    K.kutu(1.25, 1.15, 1.45, 0xe94b3c, 0.95, 0.35, 0, 0, 0, 0, 0.02);
    K.kutu(0.06, 0.5, 1.2, R.cam, 1.59, 0.85, 0); K.kutu(0.9, 0.06, 1.48, 0xffffff, 0.95, 1.5, 0);
    K.kutu(0.6, 0.45, 1.46, 0xc23b2e, 1.6, 0.35, 0, 0, 0, 0, 0.02);
    K.kutu(0.08, 0.14, 0.24, 0xfff3b0, 1.92, 0.6, 0.48); K.kutu(0.08, 0.14, 0.24, 0xfff3b0, 1.92, 0.6, -0.48);
    K.kutu(2.4, 0.2, 1.5, 0x6b4a2a, -0.85, 0.35, 0);
    K.kutu(2.4, 0.6, 0.08, R.tahta, -0.85, 0.55, 0.71); K.kutu(2.4, 0.6, 0.08, R.tahta, -0.85, 0.55, -0.71); K.kutu(0.08, 0.6, 1.5, R.tahta, -2.02, 0.55, 0);
    K.kutu(0.6, 0.45, 0.6, R.saman, -1.2, 0.55, 0.2, 0.2, 0, 0, 0.1); K.kutu(0.5, 0.35, 0.5, 0xeadcbf, -0.45, 0.55, -0.25, -0.1, 0, 0, 0.05);
    return K;
  }
  var TEKER_YER = [[1.1, 0.75], [1.1, -0.75], [-1.3, 0.75], [-1.3, -0.75]];
  function teker() {                                                      /* tek tekerlek (yerel merkez), dönerken ayrı nesne */
    var K = new Kur(102);
    K.silM(0.32, 0.32, 0.22, 10, 0x2f2f33, 0, 0, 0, Math.PI / 2, 0, 0); K.silM(0.15, 0.15, 0.24, 8, 0xc9ced3, 0, 0, 0, Math.PI / 2, 0, 0);
    for (var i = 0; i < 5; i++) { var a = i * Math.PI * 2 / 5; K.kutuM(0.05, 0.14, 0.26, 0x9aa1a8, Math.cos(a) * 0.09, Math.sin(a) * 0.09, 0, 0, 0, a); }
    return K;
  }
  function yelDegirmeni() {                                               /* taş gövde + ahşap üst; kanatlar ayrı */
    var K = new Kur(103);
    K.sil(1.1, 1.35, 0.3, 10, R.tasK, 0, 0, 0, 0.05);
    K.sil(0.85, 1.05, 3.2, 10, R.krem, 0, 0.3, 0, 0.02);
    for (var i = 0; i < 4; i++) K.kutu(0.14, 2.2, 0.08, R.tahtaK, Math.cos(i * 1.57 + 0.78) * 0.93, 0.6, Math.sin(i * 1.57 + 0.78) * 0.93, -(i * 1.57 + 0.78));
    K.sil(0.95, 0.95, 0.22, 10, R.tahtaKK, 0, 3.5, 0);
    K.koni(1.05, 1.1, 10, 0xc0453d, 0, 3.72, 0, 0.04);
    K.kutu(0.5, 0.6, 0.08, 0x4a2c18, 0, 1.6, 0.9); K.kutu(0.6, 0.1, 0.12, R.beyaz, 0, 2.2, 0.92);
    K.kutu(0.6, 0.85, 0.08, 0x5a3a22, 0, 0.3, 0.95); K.kutu(0.7, 0.1, 0.12, R.beyaz, 0, 1.15, 0.97);
    K.silM(0.12, 0.12, 0.9, 6, R.tahtaKK, 0, 3.9, 0.75, Math.PI / 2, 0, 0);
    return K;
  }
  function yelKanat() {                                                   /* 4 kanat, z ekseninde döner (merkez 0,0,0) */
    var K = new Kur(104);
    for (var i = 0; i < 4; i++) {
      var a = i * Math.PI / 2;
      K.kutuM(0.1, 2.6, 0.06, R.tahtaK, Math.cos(a + Math.PI / 2) * 1.3, Math.sin(a + Math.PI / 2) * 1.3, 0, 0, 0, a);
      K.kutuM(0.55, 2.0, 0.03, 0xfff8ee, Math.cos(a + Math.PI / 2) * 1.6 + Math.cos(a) * 0.3, Math.sin(a + Math.PI / 2) * 1.6 + Math.sin(a) * 0.3, 0.05, 0, 0, a);
      for (var j = 0; j < 3; j++) K.kutuM(0.6, 0.04, 0.04, R.tahtaKK, Math.cos(a + Math.PI / 2) * (0.9 + j * 0.6) + Math.cos(a) * 0.3, Math.sin(a + Math.PI / 2) * (0.9 + j * 0.6) + Math.sin(a) * 0.3, 0.07, 0, 0, a);
    }
    K.silM(0.18, 0.18, 0.2, 8, 0x8e3b33, 0, 0, 0.02, Math.PI / 2, 0, 0);
    return K;
  }
  function tabelaDirek() {                                                 /* isim tabelasının ahşap gövdesi; yazı ayrı düzlem */
    var K = new Kur(111);
    K.kutu(0.16, 2.0, 0.16, R.tahtaKK, -1.65, 0, 0); K.kutu(0.16, 2.0, 0.16, R.tahtaKK, 1.65, 0, 0);
    K.kutu(3.6, 1.05, 0.14, R.tahtaK, 0, 0.85, -0.02);
    K.koni(0.12, 0.2, 4, R.tahtaKK, -1.65, 2.0, 0); K.koni(0.12, 0.2, 4, R.tahtaKK, 1.65, 2.0, 0);
    for (var f = 0; f < 6; f++) K.top(0.11, 0.11, 0.11, [0xff8fb3, 0xffd15c, 0xffffff, 0xb79cf2, 0xff6b86, 0xffd15c][f], -1.5 + f * 0.6, 0.1, 0.25, 0);
    K.kutu(3.4, 0.12, 0.3, 0x5ea83e, 0, 0, 0.25);
    return K;
  }
  function insaat() {                                                      /* kilitli yapı yeri */
    var K = new Kur(121);
    K.kutu(3.2, 0.06, 2.8, 0xc9a66b, 0, 0, 0, 0, 0, 0, 0.06);
    [[-1.5, -1.3], [1.5, -1.3], [-1.5, 1.3], [1.5, 1.3]].forEach(function (p) { K.kutu(0.12, 0.7, 0.12, R.tahtaK, p[0], 0, p[1]); });
    K.kutu(3.1, 0.08, 0.06, 0xf2c94c, 0, 0.5, 1.3); K.kutu(3.1, 0.08, 0.06, 0xf2c94c, 0, 0.5, -1.3); K.kutu(0.06, 0.08, 2.7, 0xf2c94c, -1.5, 0.5, 0); K.kutu(0.06, 0.08, 2.7, 0xf2c94c, 1.5, 0.5, 0);
    K.kutu(1.2, 0.18, 0.5, R.tahta, -0.5, 0.06, -0.4, 0.3); K.kutu(1.2, 0.18, 0.5, R.tahta, -0.45, 0.24, -0.35, 0.2); K.kutu(0.6, 0.5, 0.6, R.tahtaK, 0.7, 0.06, 0.2, 0.4);
    return K;
  }

  /* ---------- hayvanlar (tek parça; yerel ön +z) ---------- */
  function tavuk(renk) {
    var K = new Kur(131);
    K.silM(0.018, 0.018, 0.16, 4, 0xf5a623, -0.06, 0.08, 0, 0, 0, 0); K.silM(0.018, 0.018, 0.16, 4, 0xf5a623, 0.06, 0.08, 0, 0, 0, 0);
    K.top(0.2, 0.18, 0.24, renk || 0xfffaf0, 0, 0.32, 0, 1);
    K.top(0.07, 0.11, 0.14, 0xf3ece0, -0.18, 0.33, -0.02, 0, 0, 0, 0, 0.2); K.top(0.07, 0.11, 0.14, 0xf3ece0, 0.18, 0.33, -0.02, 0, 0, 0, 0, -0.2);
    K.koniM(0.1, 0.22, 5, renk || 0xfffaf0, 0, 0.45, -0.22, -0.9, 0, 0);
    K.top(0.12, 0.12, 0.12, renk || 0xfffaf0, 0, 0.55, 0.17, 1);
    K.kutuM(0.03, 0.08, 0.1, 0xe8423f, 0, 0.69, 0.16); K.kutuM(0.03, 0.06, 0.06, 0xe8423f, 0, 0.67, 0.08);
    K.koniM(0.04, 0.09, 4, 0xf5a623, 0, 0.55, 0.31, Math.PI / 2, 0, 0);
    K.top(0.03, 0.045, 0.03, 0xe8423f, 0, 0.48, 0.27, 0);
    K.kutuM(0.02, 0.03, 0.02, 0x222222, -0.075, 0.58, 0.24); K.kutuM(0.02, 0.03, 0.02, 0x222222, 0.075, 0.58, 0.24);
    return K;
  }
  function inek() {
    var K = new Kur(141), r = K.r;
    [[-0.32, 0.5], [0.32, 0.5], [-0.32, -0.5], [0.32, -0.5]].forEach(function (p) { K.kutu(0.17, 0.6, 0.17, 0xf5f5f5, p[0], 0.06, p[1]); K.kutu(0.18, 0.08, 0.18, 0x3b3b3b, p[0], 0, p[1]); });
    K.kutu(0.86, 0.72, 1.45, 0xfbfbfb, 0, 0.6, 0, 0, 0, 0, 0.02);
    [[0.43, 0.95, 0.2, 0.35, 0.3], [-0.43, 0.85, -0.3, 0.4, 0.28], [0.1, 1.32, -0.35, 0.3, 0.35], [-0.43, 1.0, 0.45, 0.3, 0.22]].forEach(function (s) {
      if (Math.abs(s[0]) > 0.4) K.kutu(0.02, s[3], s[4], 0x2b2b2b, s[0] + (s[0] > 0 ? 0.01 : -0.01), s[1] - s[3] / 2, s[2]);
      else K.kutu(s[3], 0.02, s[4], 0x2b2b2b, s[0], s[1], s[2]);
    });
    K.top(0.17, 0.12, 0.17, 0xf4b6c2, 0, 0.55, -0.3, 0);
    K.kutu(0.5, 0.5, 0.5, 0xfbfbfb, 0, 0.95, 0.85, 0, 0, 0, 0.02);
    K.kutu(0.52, 0.26, 0.24, 0xf4b6c2, 0, 0.92, 1.12); K.kutu(0.06, 0.06, 0.02, 0x8a4a5a, -0.12, 1.02, 1.245); K.kutu(0.06, 0.06, 0.02, 0x8a4a5a, 0.12, 1.02, 1.245);
    K.kutu(0.07, 0.08, 0.04, 0x222222, -0.17, 1.24, 1.09); K.kutu(0.07, 0.08, 0.04, 0x222222, 0.17, 1.24, 1.09);
    K.kutuM(0.24, 0.1, 0.14, 0xf0f0f0, -0.34, 1.32, 0.86, 0, 0, 0.3); K.kutuM(0.24, 0.1, 0.14, 0xf0f0f0, 0.34, 1.32, 0.86, 0, 0, -0.3);
    K.koniM(0.05, 0.18, 4, 0xf0e6d2, -0.17, 1.52, 0.82, 0, 0, 0.35); K.koniM(0.05, 0.18, 4, 0xf0e6d2, 0.17, 1.52, 0.82, 0, 0, -0.35);
    K.kutu(0.18, 0.08, 0.3, 0x2b2b2b, 0.08, 1.42, 0.78);
    return K;
  }
  function inek2() {                                                    /* yuvarlak gövdeli, daha sevimli inek */
    var K = new Kur(143);
    [[-0.3, 0.45], [0.3, 0.45], [-0.3, -0.45], [0.3, -0.45]].forEach(function (p) { K.sil(0.09, 0.1, 0.5, 6, 0xfbfbfb, p[0], 0.08, p[1]); K.sil(0.11, 0.1, 0.1, 6, 0x3b3b3b, p[0], 0, p[1]); });
    K.yuvarlak(0.5, 0.46, 0.8, 0xfbfbfb, 0, 0.78, 0);
    K.yuvarlak(0.22, 0.16, 0.26, 0x2b2b2b, 0.3, 0.95, -0.2); K.yuvarlak(0.2, 0.14, 0.2, 0x2b2b2b, -0.28, 0.82, 0.3); K.yuvarlak(0.18, 0.12, 0.22, 0x2b2b2b, 0.1, 1.15, 0.1);
    K.yuvarlak(0.2, 0.14, 0.2, 0xf4b6c2, 0, 0.5, -0.1);
    K.yuvarlak(0.34, 0.32, 0.36, 0xfbfbfb, 0, 1.05, 0.82);
    K.yuvarlak(0.26, 0.16, 0.2, 0xf4b6c2, 0, 0.92, 1.1); K.kutu(0.05, 0.05, 0.02, 0x8a4a5a, -0.09, 1.0, 1.28); K.kutu(0.05, 0.05, 0.02, 0x8a4a5a, 0.09, 1.0, 1.28);
    K.top(0.05, 0.05, 0.03, 0x222222, -0.15, 1.16, 1.14, 0); K.top(0.05, 0.05, 0.03, 0x222222, 0.15, 1.16, 1.14, 0);
    K.yuvarlak(0.12, 0.06, 0.08, 0xf0f0f0, -0.34, 1.22, 0.8, 0, 0, 0.5); K.yuvarlak(0.12, 0.06, 0.08, 0xf0f0f0, 0.34, 1.22, 0.8, 0, 0, -0.5);
    K.koniM(0.04, 0.16, 4, 0xf0e6d2, -0.18, 1.38, 0.78, 0, 0, 0.4); K.koniM(0.04, 0.16, 4, 0xf0e6d2, 0.18, 1.38, 0.78, 0, 0, -0.4);
    K.kutu(0.16, 0.07, 0.28, 0x2b2b2b, 0.06, 1.3, 0.74);
    return K;
  }
  function koyun() {
    var K = new Kur(144);
    [[-0.2, 0.3], [0.2, 0.3], [-0.2, -0.3], [0.2, -0.3]].forEach(function (p) { K.sil(0.06, 0.07, 0.4, 5, 0x3a3230, p[0], 0, p[1]); });
    K.top(0.5, 0.42, 0.62, 0xfaf6ef, 0, 0.66, 0, 1, 0.03);
    K.top(0.3, 0.28, 0.3, 0xfaf6ef, 0.25, 0.8, 0.2, 1, 0.03); K.top(0.3, 0.26, 0.3, 0xfaf6ef, -0.25, 0.78, -0.15, 1, 0.03); K.top(0.28, 0.24, 0.28, 0xfaf6ef, 0, 0.92, -0.25, 1, 0.03);
    K.yuvarlak(0.19, 0.2, 0.26, 0x3a3230, 0, 0.82, 0.6);
    K.top(0.22, 0.14, 0.2, 0xfaf6ef, 0, 0.98, 0.5, 1);
    K.top(0.035, 0.035, 0.02, 0xffffff, -0.09, 0.88, 0.82, 0); K.top(0.035, 0.035, 0.02, 0xffffff, 0.09, 0.88, 0.82, 0);
    K.top(0.018, 0.018, 0.012, 0x111111, -0.09, 0.88, 0.84, 0); K.top(0.018, 0.018, 0.012, 0x111111, 0.09, 0.88, 0.84, 0);
    K.yuvarlak(0.09, 0.05, 0.06, 0x3a3230, -0.2, 0.9, 0.55, 0, 0, 0.6); K.yuvarlak(0.09, 0.05, 0.06, 0x3a3230, 0.2, 0.9, 0.55, 0, 0, -0.6);
    return K;
  }
  function keci() {
    var K = new Kur(145);
    [[-0.17, 0.32], [0.17, 0.32], [-0.17, -0.32], [0.17, -0.32]].forEach(function (p) { K.sil(0.05, 0.06, 0.5, 5, 0xe8d8bf, p[0], 0, p[1]); K.sil(0.06, 0.06, 0.06, 5, 0x5a4a3a, p[0], 0, p[1]); });
    K.yuvarlak(0.3, 0.3, 0.55, 0xf2e6d2, 0, 0.72, 0);
    K.silM(0.1, 0.13, 0.5, 6, 0xf2e6d2, 0, 0.95, 0.5, 0.6, 0, 0);
    K.yuvarlak(0.17, 0.2, 0.26, 0xf2e6d2, 0, 1.2, 0.72);
    K.koniM(0.035, 0.26, 4, 0x8a7a66, -0.08, 1.45, 0.62, -0.6, 0, 0.25); K.koniM(0.035, 0.26, 4, 0x8a7a66, 0.08, 1.45, 0.62, -0.6, 0, -0.25);
    K.yuvarlak(0.06, 0.1, 0.04, 0xf2e6d2, -0.17, 1.22, 0.7, 0, 0, 0.9); K.yuvarlak(0.06, 0.1, 0.04, 0xf2e6d2, 0.17, 1.22, 0.7, 0, 0, -0.9);
    K.top(0.03, 0.035, 0.02, 0x222222, -0.08, 1.24, 0.95, 0); K.top(0.03, 0.035, 0.02, 0x222222, 0.08, 1.24, 0.95, 0);
    K.koniM(0.05, 0.14, 4, 0xe3d3ba, 0, 1.05, 0.9, Math.PI, 0, 0);
    K.silM(0.02, 0.02, 0.2, 4, 0xf2e6d2, 0, 0.9, -0.55, 0.8, 0, 0);
    return K;
  }
  function kedi(renk) {
    var K = new Kur(146), c = renk || 0xf3b562;
    K.yuvarlak(0.16, 0.14, 0.28, c, 0, 0.17, 0);
    [[-0.08, 0.15], [0.08, 0.15], [-0.08, -0.12], [0.08, -0.12]].forEach(function (p) { K.sil(0.035, 0.04, 0.14, 5, c, p[0], 0, p[1]); });
    K.yuvarlak(0.15, 0.14, 0.14, c, 0, 0.36, 0.2);
    K.koniM(0.045, 0.1, 4, c, -0.08, 0.5, 0.17, 0, 0, 0.25); K.koniM(0.045, 0.1, 4, c, 0.08, 0.5, 0.17, 0, 0, -0.25);
    K.top(0.025, 0.03, 0.015, 0x2a7a3a, -0.055, 0.39, 0.33, 0); K.top(0.025, 0.03, 0.015, 0x2a7a3a, 0.055, 0.39, 0.33, 0);
    K.top(0.018, 0.014, 0.012, 0xe8898f, 0, 0.34, 0.345, 0);
    K.silM(0.02, 0.025, 0.36, 4, c, 0.1, 0.3, -0.26, -0.9, 0, 0.3);
    for (var i = 0; i < 3; i++) K.kutu(0.3, 0.02, 0.05, 0xc98a3f, 0, 0.3 + 0.0, -0.1 + i * 0.09);
    return K;
  }
  function kaplumbaga() {
    var K = new Kur(147);
    K.kubbe(0.22, 0.14, 0x3f8a3f, 0, 0.06, 0); K.disk(0.24, 0.24, 0.06, 10, 0x6b8e4e, 0, 0.03, 0);
    for (var i = 0; i < 5; i++) { var a = i * 1.257; K.kutu(0.07, 0.02, 0.07, 0x2f6b2f, Math.cos(a) * 0.12, 0.17, Math.sin(a) * 0.12, a); }
    K.yuvarlak(0.07, 0.06, 0.1, 0x7fbf5a, 0, 0.1, 0.28); K.top(0.015, 0.015, 0.01, 0x111111, -0.035, 0.13, 0.35, 0); K.top(0.015, 0.015, 0.01, 0x111111, 0.035, 0.13, 0.35, 0);
    [[-0.18, 0.12], [0.18, 0.12], [-0.18, -0.12], [0.18, -0.12]].forEach(function (p) { K.yuvarlak(0.06, 0.03, 0.08, 0x7fbf5a, p[0], 0.05, p[1]); });
    return K;
  }
  function meyveAgaci(tur, olgun) {                                       /* elma / kiraz / limon: alçak gövdeli meyve ağacı */
    var K = new Kur(148 + (olgun ? 1 : 0)), r = K.r, MR = { elma: 0xe53935, kiraz: 0xc2185b, limon: 0xffe14d, nar: 0xb71c1c }[tur] || 0xe53935;
    K.sil(0.12, 0.17, 0.9, 6, R.govde, 0, 0, 0);
    K.kutuM(0.5, 0.08, 0.08, R.govde, -0.25, 0.9, 0, 0, 0, 0.6); K.kutuM(0.5, 0.08, 0.08, R.govde, 0.25, 0.9, 0, 0, 0, -0.6);
    var c = tur === "limon" ? 0x4caf50 : R.yaprak;
    K.top(0.8, 0.7, 0.8, c, 0, 1.45, 0, 1, 0.07); K.top(0.5, 0.45, 0.5, c, 0.45, 1.25, 0.2, 1, 0.07); K.top(0.5, 0.45, 0.5, c, -0.42, 1.3, -0.15, 1, 0.07);
    if (olgun) for (var e = 0; e < 11; e++) { var a = r() * 6.28, rr = 0.55 + r() * 0.3, y = 1.1 + r() * 0.7; K.top(tur === "limon" ? 0.09 : 0.07, tur === "limon" ? 0.11 : 0.07, tur === "limon" ? 0.09 : 0.07, MR, Math.cos(a) * rr, y, Math.sin(a) * rr + 0.15, 0); }
    else for (var f = 0; f < 6; f++) { var a2 = r() * 6.28; K.top(0.04, 0.04, 0.04, 0xffffff, Math.cos(a2) * 0.7, 1.2 + r() * 0.6, Math.sin(a2) * 0.7 + 0.1, 0); }
    return K;
  }
  function recelEvi() {
    var K = new Kur(161);
    K.kutu(3.3, 0.2, 2.9, R.tas, 0, 0, 0, 0, 0, 0, 0.05);
    K.kutu(3.0, 2.1, 2.6, 0xf6d6e0, 0, 0.2, 0, 0, 0, 0, 0.02);
    K.prizma(3.0, 1.1, 2.6, 0xf6d6e0, 0, 2.3, 0); K.cati(1.5, 1.1, 2.6, 2.3, 0xc2185b, 0.3, 0.13, 0x8a0f3d);
    K.kutu(0.85, 1.4, 0.08, 0x7a4a52, 0, 0.2, 1.32); K.kutu(1.0, 0.1, 0.1, R.beyaz, 0, 1.6, 1.34);
    K.kutu(1.0, 0.7, 0.06, R.cam, -0.9, 0.9, 1.31); K.kutu(1.1, 0.08, 0.1, R.beyaz, -0.9, 1.6, 1.33); K.kutu(1.1, 0.08, 0.1, R.beyaz, -0.9, 0.86, 1.33);
    [[-1.2, 0xe53935], [-0.9, 0x4356b8], [-0.6, 0xff8e3c]].forEach(function (j) { K.sil(0.12, 0.11, 0.22, 7, j[1], j[0], 0.98, 1.4); K.sil(0.13, 0.13, 0.04, 7, 0xffffff, j[0], 1.2, 1.4); });
    K.sil(0.7, 0.6, 0.9, 10, 0xc2185b, 0.9, 2.9, -0.4); K.sil(0.72, 0.72, 0.1, 10, 0xffffff, 0.9, 3.75, -0.4); K.top(0.3, 0.2, 0.3, 0xe53935, 0.6, 3.95, -0.3, 0); K.top(0.25, 0.18, 0.25, 0xe53935, 1.1, 3.9, -0.5, 0);
    return K;
  }
  function dokuma() {
    var K = new Kur(162);
    K.kutu(3.5, 0.2, 3.0, R.tas, 0, 0, 0, 0, 0, 0, 0.05);
    K.kutu(3.2, 2.2, 2.7, 0xd6c4a8, 0, 0.2, 0, 0, 0, 0, 0.03);
    for (var i = 0; i < 6; i++) K.kutu(0.08, 2.2, 0.08, R.tahtaKK, -1.5 + i * 0.6, 0.2, 1.36);
    K.kutu(3.2, 0.12, 2.7, R.tahtaKK, 0, 2.3, 0);
    K.prizma(3.2, 1.0, 2.7, 0xd6c4a8, 0, 2.42, 0); K.cati(1.6, 1.0, 2.7, 2.42, 0x6d4ae8, 0.3, 0.13, 0x4a2fb5);
    K.kutu(1.2, 1.5, 0.08, 0x5a3a22, 0.6, 0.2, 1.36); K.kutu(1.2, 0.8, 0.06, R.cam, -0.8, 1.0, 1.36);
    for (var y = 0; y < 3; y++) K.sil(0.18, 0.18, 0.24, 8, [0xe85d75, 0x4f86c6, 0xffd93d][y], -1.3 + y * 0.35, 2.42, 1.2);
    K.kutu(0.9, 0.6, 0.5, R.tahtaK, 1.6, 0.2, 1.8); for (var t = 0; t < 5; t++) K.kutu(0.02, 0.5, 0.02, 0xffffff, 1.3 + t * 0.15, 0.8, 1.8);
    return K;
  }
  function smoothieBar() {
    var K = new Kur(163);
    K.kutu(3.3, 0.2, 2.6, R.tas, 0, 0, 0, 0, 0, 0, 0.05);
    K.kutu(3.0, 1.0, 2.2, 0xffffff, 0, 0.2, 0, 0, 0, 0, 0.02);
    K.kutu(3.0, 1.2, 2.2, 0x7cc4ff, 0, 1.2, -0.0, 0, 0, 0, 0.02);
    [[-1.5, 1.1], [1.5, 1.1], [-1.5, -1.1], [1.5, -1.1]].forEach(function (p) { K.kutu(0.1, 2.6, 0.1, 0xffffff, p[0], 0.2, p[1]); });
    for (var s2 = 0; s2 < 9; s2++) K.kutuM(0.36, 0.05, 0.9, s2 % 2 ? 0xffffff : 0x7cc4ff, -1.45 + s2 * 0.36, 2.75, 0.9, 0.3, 0, 0);
    K.kutu(3.2, 0.14, 2.4, 0x3a7bff, 0, 2.6, 0);
    K.sil(0.14, 0.11, 0.4, 8, 0xff7eb3, -0.8, 1.2, 1.2); K.sil(0.14, 0.11, 0.4, 8, 0xffe14d, -0.3, 1.2, 1.2); K.sil(0.14, 0.11, 0.4, 8, 0x5ee6b8, 0.2, 1.2, 1.2);
    K.silM(0.02, 0.02, 0.35, 4, 0xff7eb3, -0.75, 1.65, 1.2, 0.3, 0, 0.2);
    K.sil(0.4, 0.4, 0.5, 8, 0xffffff, 0.9, 1.2, 0.6); K.kutu(0.5, 0.3, 0.5, 0x3a7bff, 0.9, 1.7, 0.6);
    return K;
  }
  /* dekorasyonlar */
  function bank() { var K = new Kur(181); K.kutu(1.6, 0.08, 0.45, R.tahta, 0, 0.45, 0); K.kutuM(1.6, 0.45, 0.07, R.tahta, 0, 0.72, -0.2, -0.2, 0, 0); [[-0.65, 0.12], [0.65, 0.12], [-0.65, -0.14], [0.65, -0.14]].forEach(function (p) { K.kutu(0.08, 0.45, 0.08, R.tahtaKK, p[0], 0, p[1]); }); K.kutu(0.08, 0.5, 0.08, R.tahtaKK, -0.65, 0.5, -0.22, 0, -0.2); K.kutu(0.08, 0.5, 0.08, R.tahtaKK, 0.65, 0.5, -0.22, 0, -0.2); return K; }
  function salincak() { var K = new Kur(182); K.kutuM(0.1, 2.3, 0.1, R.tahtaKK, -1.0, 1.1, 0.3, 0.25, 0, 0); K.kutuM(0.1, 2.3, 0.1, R.tahtaKK, -1.0, 1.1, -0.3, -0.25, 0, 0); K.kutuM(0.1, 2.3, 0.1, R.tahtaKK, 1.0, 1.1, 0.3, 0.25, 0, 0); K.kutuM(0.1, 2.3, 0.1, R.tahtaKK, 1.0, 1.1, -0.3, -0.25, 0, 0); K.kutu(2.3, 0.12, 0.12, R.tahtaKK, 0, 2.15, 0); return K; }
  function salincakOturak() { var K = new Kur(183); K.silM(0.015, 0.015, 1.5, 3, 0x8a7a66, -0.3, -0.75, 0); K.silM(0.015, 0.015, 1.5, 3, 0x8a7a66, 0.3, -0.75, 0); K.kutu(0.8, 0.06, 0.3, 0xe85d75, 0, -1.55, 0); return K; }
  function cesme() { var K = new Kur(184); K.disk(1.1, 1.1, 0.3, 12, R.tasK, 0, 0, 0, 0.05); K.disk(0.95, 0.95, 0.06, 12, R.su, 0, 0.3, 0); K.sil(0.14, 0.18, 0.7, 8, R.tas, 0, 0.3, 0); K.disk(0.45, 0.45, 0.08, 10, R.tasK, 0, 1.0, 0); K.sil(0.08, 0.1, 0.4, 6, R.tas, 0, 1.08, 0); K.top(0.12, 0.12, 0.12, 0x9fd8f5, 0, 1.55, 0, 0); return K; }
  function cicekTarhi() { var K = new Kur(185), r = K.r, CR2 = [0xff8fb3, 0xffd15c, 0xffffff, 0xb79cf2, 0xff6b86]; K.kutu(2.2, 0.18, 1.1, R.tahtaK, 0, 0, 0); K.kutu(2.0, 0.08, 0.9, R.toprak, 0, 0.18, 0); for (var i = 0; i < 16; i++) cicek(K, (r() - 0.5) * 1.8, (r() - 0.5) * 0.7, CR2[i % CR2.length]); return K; }
  function kedievi() { var K = new Kur(186); K.kutu(0.8, 0.6, 0.7, 0xd9a05a, 0, 0, 0); K.prizma(0.8, 0.35, 0.7, 0xd9a05a, 0, 0.6, 0); K.cati(0.4, 0.35, 0.7, 0.6, 0xc0453d, 0.08, 0.05); K.kutu(0.3, 0.35, 0.05, 0x3a2418, 0, 0.1, 0.36); K.kutu(0.3, 0.05, 0.3, 0x4f86c6, 0.6, 0, 0.1); return K; }
  function agilBina() {
    var K = new Kur(164);
    K.kutu(3.2, 0.12, 2.2, 0xb79a6a, 0, 0, 0);
    [[-1.5, 1.0], [1.5, 1.0], [-1.5, -1.0], [1.5, -1.0]].forEach(function (p) { K.kutu(0.16, 2.0, 0.16, R.tahtaK, p[0], 0.1, p[1]); });
    K.kutu(3.2, 1.5, 0.12, R.tahta, 0, 0.1, -1.02, 0, 0, 0, 0.05);
    K.kutuM(3.6, 0.14, 2.7, 0x6d4ae8, 0, 2.2, 0, -0.18, 0, 0);
    K.kutu(1.0, 0.45, 0.8, R.saman, -0.8, 0.1, -0.3, 0, 0, 0, 0.12);
    return K;
  }
  /* ---------- karakter: parçalar ayrı (gövde, kollar, bacaklar) → yürürken sallanır ----------
     Avatar düzenleyici gibi bağımsız alanlar: kiyafet (tam görünüş, alt kısım her zaman var), kafa (açık / şal / uzun şal / şapka / bere),
     sac (kafa açıkken ya da şapka/bere altında görünür), ayakkabi, aksesuar (gozluk, canta, telefon), ten.
     Yerel ölçüler: zemin y=0, kalça ekseni y=0,5 (bacaklar buradan sallanır), omuz ekseni (±0,3; 0,98), kafa merkezi y=1,32.
     Şal tasarımı: Microsoft Fluent Emoji (MIT) "woman with headscarf" referansıyla — başı saran yüksek, yumuşak kubbe; yüz oval bir
     açıklıktan görünür; şal çenenin altından dolanıp omuzlara geniş bir pelerin gibi iner; önde çapraz bir kat. */
  var TEN = [0xf6d3b8, 0xeab896, 0xd9a07a, 0xb8794f, 0x8d5a3a];
  function ton(c, f) { var r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255; if (f < 1) { r *= f; g *= f; b *= f; } else { r += (255 - r) * (f - 1); g += (255 - g) * (f - 1); b += (255 - b) * (f - 1); } return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b); }
  function halkaG(t) { return geo("halka" + t, function () { return new T.TorusGeometry(1, t, 6, 22); }); }
  Kur.prototype.tornaS = function (pts, seg, phi0, phiLen, renk, x, y0, z, sx, sz) {
    if (pts[0][1] > pts[pts.length - 1][1]) pts = pts.slice().reverse();
    var g = new T.LatheGeometry(pts.map(function (p) { return new T.Vector2(p[0], p[1]); }), seg || 16, phi0 || 0, phiLen === undefined ? Math.PI * 2 : phiLen).toNonIndexed();
    return this.ekle(g, renk, M(x || 0, y0 || 0, z || 0, sx || 1, 1, sz || 1, 0, 0, 0));
  };
  Kur.prototype.yuvarlakP = function (sx, sy, sz, renk, x, y, z, rx, ry, rz) { return this.ekle(kureG(16, 12), renk, M(x, y, z, sx, sy, sz, rx, ry, rz)); };
  function yayG() { return geo("yay", function () { return new T.TorusGeometry(1, 0.22, 4, 10, Math.PI); }); }
  var KIYAFETLER = ["uzunelbise", "satenelbise", "ciftlikelbisesi", "gomleketek", "hirka", "mont", "tulum", "gomlekpantolon", "tisort", "yazlikelbise"];
  function karakter(o) {
    var ten = TEN[o.ten || 0] || TEN[0], c1 = o.renk1, c2 = o.renk2, G = {}, B = new Kur(170);
    var k = KIYAFETLER.indexOf(o.kiyafet) >= 0 ? o.kiyafet : "uzunelbise", kafa = o.kafa || "acik";
    var elbise = k === "uzunelbise" || k === "satenelbise" || k === "ciftlikelbisesi" || k === "yazlikelbise";
    var uzunEtek = k === "gomleketek" || k === "hirka";
    var pantolon = k === "gomlekpantolon" || k === "tisort" || k === "mont" || k === "tulum";
    var BEYAZ = 0xf7f3ec;
    /* ---- gövde (üst) ---- */
    var govdeRenk = k === "tulum" ? c2 : k === "hirka" ? BEYAZ : c1;
    B.kutu(0.44, 0.46, 0.26, govdeRenk, 0, 0.56, 0, 0, 0, 0, 0.015);
    var kolRenk = k === "tulum" ? c2 : c1;
    B.yuvarlak(0.1, 0.1, 0.12, kolRenk, -0.24, 0.94, 0); B.yuvarlak(0.1, 0.1, 0.12, kolRenk, 0.24, 0.94, 0);   /* omuz yuvarlakları */
    var ETEK_UZUN = [[0.2, 1.0], [0.225, 0.9], [0.24, 0.74], [0.29, 0.48], [0.355, 0.18], [0.375, 0.06], [0.35, 0.05], [0.0, 0.05]];
    if (elbise) {
      var prof = k === "yazlikelbise" ? [[0.2, 1.0], [0.225, 0.9], [0.235, 0.74], [0.3, 0.52], [0.36, 0.3], [0.34, 0.29], [0.0, 0.29]] : ETEK_UZUN;
      B.torna(prof, 16, 0, Math.PI * 2, c1, 0, 0, 0, 0, 0.012);
      if (k === "satenelbise") { B.torna([[0.245, 0.0], [0.25, 0.0], [0.25, 0.05], [0.245, 0.05]], 16, 0, Math.PI * 2, c2, 0, 0.72, 0); B.yuvarlak(0.045, 0.035, 0.03, c2, 0.08, 0.745, 0.24); }
      if (k === "ciftlikelbisesi") {                                       /* önlük: ön yarım etek + göğüslük + askılar + cep */
        B.torna([[0.236, 0.78], [0.25, 0.7], [0.3, 0.46], [0.35, 0.22], [0.34, 0.21], [0.0, 0.21]], 12, -0.95, 1.9, c2, 0, 0, 0, 0, 0.01);
        B.kutu(0.26, 0.22, 0.02, c2, 0, 0.74, 0.135); B.kutuM(0.04, 0.3, 0.02, c2, -0.1, 0.94, 0.12, 0.2, 0, 0.12); B.kutuM(0.04, 0.3, 0.02, c2, 0.1, 0.94, 0.12, 0.2, 0, -0.12);
        B.kutu(0.12, 0.1, 0.02, ton(c2, 0.85), 0.1, 0.42, 0.315); B.torna([[0.238, 0.0], [0.243, 0.0], [0.243, 0.04], [0.238, 0.04]], 16, 0, Math.PI * 2, c2, 0, 0.76, 0);
      }
      if (k === "yazlikelbise") B.torna([[0.236, 0.0], [0.242, 0.0], [0.242, 0.04], [0.236, 0.04]], 16, 0, Math.PI * 2, ton(c1, 0.8), 0, 0.74, 0);
    }
    if (uzunEtek) B.torna([[0.23, 0.7], [0.25, 0.58], [0.3, 0.36], [0.35, 0.12], [0.365, 0.06], [0.34, 0.05], [0.0, 0.05]], 16, 0, Math.PI * 2, c2, 0, 0, 0, 0, 0.012);
    if (pantolon) B.kutu(0.44, 0.14, 0.26, k === "tulum" ? c1 : c2, 0, 0.46, 0);
    if (k === "gomleketek" || k === "gomlekpantolon") {
      B.kutuM(0.12, 0.08, 0.05, ton(c1, 0.88), -0.08, 0.98, 0.13, 0, 0, 0.55); B.kutuM(0.12, 0.08, 0.05, ton(c1, 0.88), 0.08, 0.98, 0.13, 0, 0, -0.55);
      for (var bt = 0; bt < 3; bt++) B.top(0.016, 0.016, 0.01, ton(c1, 0.6), 0, 0.88 - bt * 0.11, 0.132, 0);
      if (k === "gomlekpantolon") B.kutu(0.45, 0.04, 0.27, 0x3a2a1c, 0, 0.6, 0);
    }
    if (k === "hirka") {
      B.kutu(0.17, 0.5, 0.28, c1, -0.14, 0.52, 0, 0, 0, 0, 0.02); B.kutu(0.17, 0.5, 0.28, c1, 0.14, 0.52, 0, 0, 0, 0, 0.02); B.kutu(0.46, 0.46, 0.2, c1, 0, 0.56, -0.04);
      for (var hb = 0; hb < 3; hb++) B.top(0.014, 0.014, 0.01, ton(c1, 0.7), 0.07, 0.86 - hb * 0.12, 0.142, 0);
    }
    if (k === "mont") {
      for (var mr = 0; mr < 3; mr++) B.kutu(0.5, 0.15, 0.32, mr % 2 ? ton(c1, 0.94) : c1, 0, 0.5 + mr * 0.16, 0, 0, 0, 0, 0.01);
      B.kutu(0.04, 0.5, 0.33, ton(c1, 0.75), 0, 0.5, 0.005); B.torna([[0.17, 0.0], [0.2, 0.0], [0.2, 0.1], [0.17, 0.12]], 12, 0, Math.PI * 2, c1, 0, 0.98, 0);
    }
    if (k === "tulum") {
      B.kutu(0.4, 0.26, 0.28, c1, 0, 0.5, 0); B.kutu(0.24, 0.22, 0.02, c1, 0, 0.74, 0.135); B.kutu(0.12, 0.08, 0.02, ton(c1, 0.85), 0, 0.82, 0.148);
      B.kutuM(0.05, 0.32, 0.02, c1, -0.1, 0.9, 0.125, 0.15, 0, 0.1); B.kutuM(0.05, 0.32, 0.02, c1, 0.1, 0.9, 0.125, 0.15, 0, -0.1);
      B.top(0.02, 0.02, 0.012, 0xf2c94c, -0.1, 0.94, 0.15, 0); B.top(0.02, 0.02, 0.012, 0xf2c94c, 0.1, 0.94, 0.15, 0);
    }
    if (k === "tisort") B.kutu(0.2, 0.06, 0.02, ton(c1, 0.8), 0, 0.82, 0.132);
    /* ---- boyun + kafa ---- */
    B.sil(0.075, 0.08, 0.14, 6, ten, 0, 0.98, 0);
    var ortulu = kafa === "sal" || kafa === "uzunsal";
    var fz = 0, fsx = 0.25, fsy = 0.26, fsz = 0.25, fcz = 0.0;               /* yüz elipsoidi */
    if (ortulu) { fsx = 0.205; fsy = 0.235; fsz = 0.14; fcz = 0.19; }
    B.yuvarlakP(fsx, fsy, fsz, ten, 0, 1.32, fcz);
    function yuzZ(x, y) { var a = x / fsx, b = (y - 1.32) / fsy, q = 1 - a * a - b * b; return fcz + fsz * Math.sqrt(Math.max(0, q)); }
    /* yüz: gözler, parıltı, kaşlar, gülümseme, yanaklar */
    [-1, 1].forEach(function (s) {
      var ex = 0.08 * s, ey = 1.35; B.top(0.03, 0.036, 0.02, 0x2b1d14, ex, ey, yuzZ(ex, ey) - 0.004, 0);
      B.top(0.011, 0.011, 0.01, 0xffffff, ex + 0.012, ey + 0.014, yuzZ(ex, ey) + 0.012, 0);
      B.kutuM(0.085, 0.014, 0.018, 0x3a2416, ex, 1.415, yuzZ(ex, 1.415) - 0.002, -0.2, 0, -0.12 * s);
      B.top(0.042, 0.024, 0.016, 0xeda3a3, 0.14 * s, 1.27, yuzZ(0.14 * s, 1.27) - 0.008, 0);
    });
    B.ekle(yayG(), 0x9a3f3f, M(0, 1.27, yuzZ(0, 1.25) - 0.004, 0.045, 0.035, 0.03, 0, 0, Math.PI));   /* gülümseme: ince yay */
    var hc = o.sacRenk;
    if (ortulu) {
      var oc = o.ortuRenk, ocK = ton(oc, 0.86), ocA = ton(oc, 1.08);
      /* baş kubbesi: başı tamamen sarar, tepesi yüksek ve yumuşak; yüz elipsoidi önünden taşarak oval açıklığı oluşturur */
      B.torna([[0.0, 1.635], [0.1, 1.627], [0.19, 1.6], [0.255, 1.55], [0.295, 1.49], [0.315, 1.41], [0.315, 1.32], [0.3, 1.22], [0.272, 1.13], [0.245, 1.06], [0.23, 1.0], [0.0, 1.0]], 22, 0, Math.PI * 2, oc, 0, 0, 0.0, 0, 0.008);
      /* yüz çerçevesi: şalın yüzü saran yumuşak kenarı */
      B.ekle(halkaG(0.16), ocA, M(0, 1.325, 0.255, 0.175, 0.205, 0.11, -0.12, 0, 0));
      /* çene altından dolanan kat */
      B.yuvarlakP(0.22, 0.1, 0.17, oc, 0, 1.09, 0.08, 0, 0, 0);
      /* omuzlara inen pelerin (önden arkaya basık) */
      var alt = kafa === "uzunsal" ? 0.5 : 0.76;
      B.tornaS([[0.22, 1.13], [0.27, 1.06], [0.33, 1.01], [0.375, 0.96], [0.395, 0.9], [0.39, alt + 0.05], [0.36, alt], [0.0, alt]], 24, 0, Math.PI * 2, oc, 0, 0, -0.01, 1, 0.62);
          } else {
      /* saç: başın arkası + tepe (yüzü kapatmaz) */
      var sac = o.sac || "uzun";
      B.yuvarlakP(0.27, 0.27, 0.27, hc, 0, 1.37, -0.05);
      if (kafa !== "bere") { B.kutuM(0.28, 0.1, 0.1, hc, -0.06, 1.55, 0.15, 0.55, 0, 0.18); B.kutuM(0.2, 0.09, 0.08, hc, 0.1, 1.56, 0.14, 0.6, 0, -0.25); }   /* yana taranmış perçem */
      if (sac === "uzun") { B.kutu(0.5, 0.6, 0.16, hc, 0, 0.82, -0.16, 0, 0, 0, 0.02); B.kutu(0.1, 0.42, 0.12, hc, -0.24, 0.98, 0.04); B.kutu(0.1, 0.42, 0.12, hc, 0.24, 0.98, 0.04); }
      else if (sac === "topuz") B.yuvarlak(0.14, 0.14, 0.14, hc, 0, 1.63, -0.16);
      else if (sac === "atkuyrugu") { B.yuvarlak(0.08, 0.08, 0.08, hc, 0, 1.5, -0.3); B.silM(0.075, 0.04, 0.48, 6, hc, 0, 1.24, -0.36, 0.22, 0, 0); }
      else if (sac === "kivircik") { for (var kk = 0; kk < 10; kk++) { var ka = kk * 0.63 + 0.3; B.top(0.11, 0.11, 0.11, hc, Math.cos(ka) * 0.25, 1.42 + Math.sin(kk * 1.7) * 0.1 - (Math.sin(ka) > 0.3 ? 0.1 : 0), -Math.sin(ka) * 0.2 - 0.06, 0); } }
      else if (sac === "orgu") { B.yuvarlak(0.06, 0.06, 0.06, hc, -0.22, 1.18, 0.0); for (var oe = 0; oe < 5; oe++) B.yuvarlak(0.07, 0.065, 0.07, hc, -0.24 + oe * 0.006, 1.1 - oe * 0.1, 0.06); }
      else if (sac === "kisa") { B.yuvarlakP(0.3, 0.24, 0.29, hc, 0, 1.3, -0.07); }
      if (kafa === "sapka") { B.torna([[0.0, 1.72], [0.2, 1.71], [0.27, 1.64], [0.29, 1.54], [0.45, 1.52], [0.46, 1.49], [0.0, 1.49]], 16, 0, Math.PI * 2, 0xe8c547, 0, 0, -0.04, 0, 0.02); B.torna([[0.287, 1.54], [0.296, 1.54], [0.296, 1.59], [0.287, 1.59]], 16, 0, Math.PI * 2, o.renk2 || 0xe85d75, 0, 0, -0.04, 0); }
      if (kafa === "bere") { B.torna([[0.0, 1.74], [0.18, 1.72], [0.27, 1.63], [0.295, 1.5], [0.29, 1.46], [0.0, 1.46]], 14, 0, Math.PI * 2, o.ortuRenk, 0, 0, -0.04, 0, 0.02); B.torna([[0.29, 1.44], [0.305, 1.44], [0.305, 1.52], [0.29, 1.52]], 14, 0, Math.PI * 2, ton(o.ortuRenk, 0.85), 0, 0, -0.04, 0); B.yuvarlak(0.07, 0.07, 0.07, ton(o.ortuRenk, 1.4), 0, 1.78, -0.04); }
    }
    /* ---- aksesuarlar ---- */
    if (o.gozluk) {                                                         /* başın üstüne kaldırılmış güneş gözlüğü */
      var gy = kafa === "sapka" || kafa === "bere" ? 1.4 : 1.58, gz = kafa === "sapka" || kafa === "bere" ? null : (ortulu ? 0.23 : 0.2);
      if (gz === null) { [-1, 1].forEach(function (s) { B.yuvarlak(0.07, 0.05, 0.02, 0x151515, 0.085 * s, 1.355, yuzZ(0.085 * s, 1.355) + 0.02, 0, 0, 0); }); B.kutuM(0.05, 0.015, 0.02, 0x151515, 0, 1.37, yuzZ(0, 1.37) + 0.02, 0, 0, 0); }
      else { B.kutuM(0.32, 0.025, 0.05, 0x222222, 0, gy, gz, -0.5, 0, 0); [-1, 1].forEach(function (s) { B.yuvarlak(0.075, 0.035, 0.05, 0x111111, 0.09 * s, gy + 0.01, gz + 0.03, -0.5, 0, 0); }); }
    }
    if (o.canta) {                                                          /* zincirli siyah çanta: soldan omuzdan sağ kalçaya çapraz */
      var ax = -0.2, ay = 0.98, az = 0.15, bx = 0.24, by = 0.6, bz = 0.2, L = Math.hypot(bx - ax, by - ay);
      for (var zc = 0; zc < 7; zc++) { var t = (zc + 0.5) / 7; B.top(0.018, 0.018, 0.012, 0xd4af37, ax + (bx - ax) * t, ay + (by - ay) * t, az + (bz - az) * t + (ortulu && t < 0.45 ? 0.17 : 0.0), 0); }
      B.kutu(0.2, 0.15, 0.07, 0x1a1a1a, bx, by - 0.12, bz); B.kutu(0.2, 0.06, 0.08, 0x2a2a2a, bx, by - 0.02, bz + 0.002); B.top(0.022, 0.022, 0.012, 0xd4af37, bx, by - 0.02, bz + 0.045, 0);
      void L;
    }
    G.govde = B;
    /* ---- kollar ---- */
    var kisaKol = k === "tisort" || k === "yazlikelbise", kolR = k === "mont" ? 0.095 : 0.07;
    function kol(sag) {
      var K = new Kur(171);
      K.sil(kolR, kolR * 0.92, kisaKol ? 0.16 : 0.42, 6, kolRenk, 0, kisaKol ? -0.16 : -0.42, 0);
      if (kisaKol) K.sil(0.058, 0.054, 0.28, 6, ten, 0, -0.44, 0);
      if (k === "uzunelbise" || k === "satenelbise") K.sil(0.085, 0.072, 0.07, 6, kolRenk, 0, -0.43, 0);   /* bol kol ağzı */
      if (k === "mont") K.sil(0.075, 0.075, 0.05, 6, ton(c1, 0.75), 0, -0.44, 0);
      K.yuvarlak(0.062, 0.066, 0.062, ten, 0, -0.48, 0);
      if (o.telefon && sag) { K.kutu(0.085, 0.15, 0.022, 0x7a1f2e, 0.0, -0.58, 0.06, 0, 0, 0); K.top(0.026, 0.02, 0.012, 0x4caf50, 0.0, -0.5, 0.074, 0); }
      return K;
    }
    G.solKol = kol(false); G.sagKol = kol(true);
    /* ---- bacaklar + ayakkabı (ayak tabanı y=0'a oturur: kalça ekseni 0,5) ---- */
    var bacakRenk = elbise && k !== "yazlikelbise" ? ton(c1, 0.8) : uzunEtek ? ton(c2, 0.8) : pantolon ? (k === "tulum" ? c1 : c2) : ten;
    var ayak = o.ayakkabi || "bot", ar = o.ayakRenk === undefined ? 0x2a2a2a : o.ayakRenk;
    function bacak() {
      var K = new Kur(172); K.sil(0.08, 0.072, 0.44, 6, bacakRenk, 0, -0.44, 0);
      if (ayak === "cizme") { K.sil(0.088, 0.084, 0.26, 7, ar, 0, -0.44, 0); K.kutu(0.15, 0.08, 0.22, ar, 0, -0.5, 0.03); K.kutu(0.155, 0.02, 0.225, ton(ar, 0.6), 0, -0.5, 0.03); }
      else if (ayak === "spor") { K.kutu(0.15, 0.08, 0.23, ar, 0, -0.49, 0.035); K.kutu(0.156, 0.03, 0.236, 0xffffff, 0, -0.5, 0.035); K.kutu(0.1, 0.012, 0.1, 0xffffff, 0, -0.42, 0.07); }
      else if (ayak === "babet") { K.kutu(0.13, 0.055, 0.21, ar, 0, -0.5, 0.04); K.top(0.016, 0.016, 0.01, 0xf2c94c, 0, -0.46, 0.145, 0); }
      else { K.kutu(0.145, 0.1, 0.21, ar, 0, -0.5, 0.03); K.kutu(0.15, 0.025, 0.215, ton(ar, 0.6), 0, -0.5, 0.03); }
      return K;
    }
    G.solBacak = bacak(); G.sagBacak = bacak();
    return G;
  }
  function kuyruk() { var K = new Kur(142); K.silM(0.025, 0.025, 0.6, 4, 0xf0f0f0, 0, -0.3, 0); K.top(0.07, 0.12, 0.07, 0x2b2b2b, 0, -0.62, 0, 0); return K; }
  function yumurtaMesh() { var K = new Kur(151); K.top(0.07, 0.09, 0.07, 0xfff6e5, 0, 0.09, 0, 1); return K; }
  function sutKovasi() { var K = new Kur(152); K.sil(0.16, 0.13, 0.3, 8, 0xc9ced3, 0, 0, 0); K.sil(0.14, 0.14, 0.02, 8, 0xffffff, 0, 0.28, 0); return K; }

  /* ---------- doğa ---------- */
  function agac(K, x, z, s, tur) {
    var r = K.r;
    if (tur === "cam") {
      K.sil(0.12 * s, 0.16 * s, 0.7 * s, 5, R.govde, x, 0, z);
      for (var i = 0; i < 3; i++) K.koni((1.0 - i * 0.25) * s, (1.2 - i * 0.15) * s, 7, [0x2f8a4a, 0x379a52, 0x44aa5c][i], x, (0.55 + i * 0.6) * s, z, 0.06);
      return;
    }
    K.sil(0.14 * s, 0.2 * s, 1.1 * s, 6, R.govde, x, 0, z, 0.05);
    var c = [R.yaprak, R.yaprakK, R.yaprakA][Math.floor(r() * 3)];
    K.top(0.95 * s, 0.85 * s, 0.95 * s, c, x, 1.65 * s, z, 1, 0.08);
    K.top(0.6 * s, 0.55 * s, 0.6 * s, c, x + 0.45 * s, 1.35 * s, z + 0.2 * s, 1, 0.08);
    K.top(0.55 * s, 0.5 * s, 0.55 * s, c, x - 0.4 * s, 1.4 * s, z - 0.15 * s, 1, 0.08);
    if (r() < 0.3) for (var e = 0; e < 4; e++) K.top(0.07 * s, 0.07 * s, 0.07 * s, 0xe53935, x + (r() - 0.5) * 1.4 * s, (1.3 + r() * 0.8) * s, z + 0.6 * s + r() * 0.3 * s, 0);
  }
  function cali(K, x, z, s) { var c = [R.yaprak, R.yaprakK, R.yaprakA][Math.floor(K.r() * 3)]; K.top(0.5 * s, 0.4 * s, 0.5 * s, c, x, 0.3 * s, z, 1, 0.08); K.top(0.35 * s, 0.3 * s, 0.35 * s, c, x + 0.35 * s, 0.25 * s, z + 0.1 * s, 1, 0.08); }
  function cicek(K, x, z, renk) { K.sil(0.012, 0.012, 0.3, 3, 0x4caf50, x, 0, z); K.top(0.07, 0.05, 0.07, renk, x, 0.32, z, 0); K.top(0.03, 0.03, 0.03, 0xffe082, x, 0.35, z, 0); }
  function kaya(K, x, z, s) { K.tas(0.5 * s, 0.32 * s, 0.42 * s, [R.tas, R.tasK, 0xc4bdb2][Math.floor(K.r() * 3)], x, 0.12 * s, z, K.r() * 6, 0.06); }
  function cit(K, noktalar, kapali, ara) {                                /* çit: köşe noktaları boyunca direk + iki kuşak */
    for (var i = 0; i < noktalar.length - (kapali ? 0 : 1); i++) {
      var a = noktalar[i], b = noktalar[(i + 1) % noktalar.length], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), n = Math.max(1, Math.round(L / (ara || 1.2))), ang = Math.atan2(dx, dz);
      for (var k = 0; k < n; k++) { var t = k / n; K.kutu(0.12, 0.75, 0.12, R.cit, a[0] + dx * t, 0, a[1] + dz * t, ang, 0, 0, 0.04); }
      K.kutuM(0.06, 0.09, L, R.cit, a[0] + dx / 2, 0.55, a[1] + dz / 2, 0, ang, 0); K.kutuM(0.06, 0.09, L, R.cit, a[0] + dx / 2, 0.28, a[1] + dz / 2, 0, ang, 0);
    }
    if (!kapali) { var s = noktalar[noktalar.length - 1]; K.kutu(0.12, 0.75, 0.12, R.cit, s[0], 0, s[1]); }
  }
  function saman(K, x, z, ry) { K.silM(0.42, 0.42, 0.8, 10, R.saman, x, 0.42, z, 0, ry || 0, Math.PI / 2); K.silM(0.43, 0.43, 0.06, 10, 0xd8b84a, x, 0.42, z, 0, ry || 0, Math.PI / 2); }
  function bulut(seed) { var K = new Kur(seed), r = K.r; var n = 4 + Math.floor(r() * 3); for (var i = 0; i < n; i++) K.top(1.2 + r() * 1.0, 0.8 + r() * 0.5, 1.0 + r() * 0.6, 0xffffff, (i - n / 2) * 1.3 + r() * 0.4, r() * 0.5, (r() - 0.5) * 1.2, 1); return K; }

  window.CfModel = {
    Kur: Kur, R: R, rng: rng, M: M,
    tarlaToprak: tarlaToprak, ekinGeo: ekinGeo,
    ambar: ambar, ev: ev, kafe: kafe, mimarMasasi: mimarMasasi, yemFabrikasi: yemFabrikasi, yemCark: yemCark, firin: firin, mandira: mandira, kumesBina: kumesBina, ahirBina: ahirBina,
    pano: pano, kamyon: kamyon, teker: teker, TEKER_YER: TEKER_YER, yelDegirmeni: yelDegirmeni, yelKanat: yelKanat, tabelaDirek: tabelaDirek, insaat: insaat,
    tavuk: tavuk, inek: inek2, inekEski: inek, koyun: koyun, keci: keci, kedi: kedi, kaplumbaga: kaplumbaga, meyveAgaci: meyveAgaci, recelEvi: recelEvi, dokuma: dokuma, smoothieBar: smoothieBar, agilBina: agilBina, karakter: karakter, TEN: TEN, KIYAFETLER: KIYAFETLER, bank: bank, salincak: salincak, salincakOturak: salincakOturak, cesme: cesme, cicekTarhi: cicekTarhi, kedievi: kedievi, kuyruk: kuyruk, yumurtaMesh: yumurtaMesh, sutKovasi: sutKovasi,
    agac: agac, cali: cali, cicek: cicek, kaya: kaya, cit: cit, saman: saman, bulut: bulut
  };
})();
