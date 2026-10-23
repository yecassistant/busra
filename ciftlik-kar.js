/* Çiftlik – Büşra karakteri: çizilmiş 2D karakter (çizim seti: kar/kar.webp), 3D sahnede kameraya dönen pano olarak, kare kare animasyonla.
   Yürüyüş: önden, yandan, arkadan, arka-çapraz (her biri 7–10 kare). Durma: nefes alan önden duruş; uzun durunca kahve, defter, düşünme,
   göz kırpma, kasaya oturma gibi küçük anlar. İş: eğilip toplama, fidan dikme, sulama, kasa taşıma. Dokununca konuşma + baloncukta yüz.
   kar-m.png / yuz-m.png maskeleri: kırmızı kanal = şal, yeşil kanal = önlük; renk değişirken kumaşın ışık-gölgesi korunur. window.CfKar verir. */
(function () {
  "use strict";
  var T = window.THREE;
  if (!T) return;
  var KARE = {"yuru_on":[[1449,935,80,198,37.0,194],[866,935,86,202,42.0,198],[252,935,86,203,41.0,199],[340,935,82,203,38.5,199],[1054,723,84,206,39.5,202],[1140,723,83,206,40.0,202],[457,723,83,207,41.0,203]],"yuru_yan":[[1285,935,81,201,42.0,197],[424,935,95,203,40.5,199],[1891,723,84,204,39.5,200],[0,935,84,204,36.0,200],[954,935,84,202,43.5,198],[521,935,85,203,48.5,199],[1312,723,84,205,45.0,201],[542,723,83,207,43.5,203],[1225,723,85,206,40.0,202],[627,723,89,207,44.0,203]],"yuru_arka":[[1040,935,79,202,37.5,198],[1398,723,80,205,38.5,201],[718,723,82,207,40.0,203],[608,935,81,203,39.5,199],[1480,723,81,205,39.5,201],[1563,723,79,205,39.0,201],[86,935,83,204,40.5,200]],"yuru_arkayan":[[691,935,81,203,35.5,199],[198,723,82,209,38.5,205],[774,935,90,203,41.5,199],[1121,935,77,202,35.5,198],[802,723,76,207,38.0,203],[1644,723,88,205,43.5,201],[1734,723,78,205,35.0,201],[880,723,82,207,43.0,203],[1200,935,83,202,42.5,198],[171,935,79,204,36.5,200]],"dur_on":[[318,1141,79,192,39.5,188],[399,1141,78,192,38.0,188],[1927,935,72,194,29.5,190],[1685,935,70,195,28.0,191],[245,1141,71,193,33.0,189],[0,1141,72,194,35.0,190]],"egil":[[732,1141,98,183,45.0,179],[74,1141,95,194,50.0,190],[553,1141,84,190,50.0,186],[639,1141,91,189,43.0,185],[1531,935,83,197,32.0,193]],"konus":[[1757,935,78,195,40.0,191],[171,1141,72,194,33.5,190],[1616,935,67,196,30.0,192],[1837,935,88,195,30.0,191]],"dur_arka":[[1467,386,79,213,34.5,209],[1381,386,84,214,38.0,210],[1814,723,75,205,38.0,201],[1776,386,97,210,37.0,206],[1875,386,84,210,35.0,206],[1548,386,74,211,31.0,207]],"anlat":[[282,723,97,209,43.5,205],[964,723,88,207,35.0,203],[381,723,74,208,36.5,204],[0,723,116,210,51.0,206]],"sevin":[[1624,386,150,211,74.5,207]],"konus2":[[1292,386,87,215,39.5,211],[1368,935,79,200,38.0,196],[118,723,78,210,40.5,206],[479,1141,72,191,37.0,187]],"p_on":[[248,0,135,382,59.0,378]],"p_ucdort":[[1204,0,142,377,59.0,373]],"p_yan":[[974,0,113,379,58.5,375]],"p_arka":[[385,0,148,382,71.5,378]],"p_arkayan":[[0,0,122,384,53.5,380]],"p_goz":[[822,0,150,380,76.5,376]],"p_kasa":[[263,386,163,330,54.0,326]],"p_yuru34":[[1648,0,183,338,88.5,334]],"p_zipla":[[0,386,261,335,130.0,331]],"p_dusun":[[1833,0,133,336,53.5,332]],"p_defter":[[1492,0,154,339,81.5,335]],"p_otur":[[584,386,197,283,89.0,279]],"p_dik":[[1094,386,196,255,104.5,251]],"p_sula":[[912,386,180,263,87.5,259]],"p_kahve":[[783,386,127,272,53.5,268]],"p_yuru2":[[428,386,154,286,74.5,282]],"g_on_govde":[[535,0,135,382,59.0,378]],"g_on_a0":[[995,1141,30,36,29,344]],"g_on_a1":[[920,1141,36,38,57,342]],"g_ucdort_govde":[[1348,0,142,377,59.0,373]],"g_ucdort_a0":[[1027,1141,35,36,43,339]],"g_ucdort_a1":[[1187,1141,27,34,76,339]],"g_yan_govde":[[1089,0,113,379,58.5,375]],"g_yan_a0":[[1064,1141,58,36,12,340]],"g_yan_a1":[[832,1141,41,40,68,333]],"g_arkayan_govde":[[124,0,122,384,53.5,380]],"g_arkayan_a0":[[875,1141,43,39,29,342]],"g_arkayan_a1":[[1157,1141,28,35,70,345]],"g_arka_govde":[[672,0,148,382,71.5,378]],"g_arka_a0":[[1124,1141,31,36,38,344]],"g_arka_a1":[[958,1141,35,37,80,343]]};                                       /* grup: [[x, y, w, h, başOrtaX, ayakY], …] */
  var PPM_YURU = 97, PPM_POZ = 184;                          /* piksel/metre: ayakta boy ≈ 2,05 m */
  var SAGA = { yuru_yan: 1, yuru_arkayan: 1, egil: 1, konus: 1, konus2: 1, p_ucdort: 1, p_kasa: 1, p_yuru34: 1, p_defter: 1, p_otur: 1, p_dik: 1, p_sula: 1, p_dusun: 1 };
  var FPS = { yuru_on: 11, yuru_yan: 13, yuru_arka: 11, yuru_arkayan: 13, dur_on: 3.2, egil: 9, konus: 6, konus2: 6 };
  var GIDIP = { dur_on: 1, egil: 1, konus: 1, konus2: 1 };   /* ileri-geri oynayan döngüler */
  var BOS_AN = ["p_kahve", "p_defter", "p_dusun", "p_goz", "p_otur", "konus2"];
  var veri = null, bekleyen = [];
  function resim(src, ok, hata) { var i = new Image(); i.decoding = "async"; i.onload = function () { ok(i); }; i.onerror = hata; i.src = src; }
  function yukle(v, cb) {
    if (veri) { cb(veri); return; }
    bekleyen.push(cb); if (bekleyen.length > 1) return;
    var G = window.CF_KAR_VERI, l = G ? [G.kar, G.karM, G.yuz, G.yuzM] : ["kar/kar.webp?v=" + v, "kar/kar-m.png?v=" + v, "kar/yuz.webp?v=" + v, "kar/yuz-m.png?v=" + v], r = [], n = 0, bozuk = false;
    l.forEach(function (s, i) { resim(s, function (im) { r[i] = im; if (++n === l.length && !bozuk) { veri = { kar: r[0], karM: r[1], yuz: r[2], yuzM: r[3] }; bitir(veri); } }, function () { if (!bozuk) { bozuk = true; bitir(null); } }); });
    function bitir(x) { var b = bekleyen; bekleyen = []; b.forEach(function (f) { f(x); }); }
  }

  /* ---------- boyama ---------- */
  function veriAl(img) { var c = document.createElement("canvas"); c.width = img.width; c.height = img.height; var x = c.getContext("2d"); x.drawImage(img, 0, 0); var d = null; try { d = x.getImageData(0, 0, c.width, c.height); } catch (e) {} return { c: c, d: d }; }
  function boya(kaynak, maske, renkler, hedef) {                            /* renkler: [şal, önlük] (null = özgün) */
    var s = kaynak.d.data, m = maske.d.data, x = hedef.getContext("2d"), out = x.createImageData(kaynak.d.width, kaynak.d.height), o = out.data; o.set(s);
    for (var k = 0; k < 2; k++) {
      var hc = renkler[k]; if (hc === null || hc === undefined) continue;
      var R = (hc >> 16) & 255, G = (hc >> 8) & 255, B = hc & 255, top = 0, say = 0, i;
      for (i = 0; i < s.length; i += 4) if (m[i + k] > 128 && s[i + 3] > 128) { top += s[i] + s[i + 1] + s[i + 2]; say++; }
      if (!say) continue;
      var ort = top / say, koyu = (R + G + B) < 150;
      for (i = 0; i < s.length; i += 4) {
        var a = m[i + k] / 255; if (a <= 0.02) continue;
        var f = (s[i] + s[i + 1] + s[i + 2]) / ort; if (koyu) f = 1 + (f - 1) * 0.6;
        o[i] = o[i] * (1 - a) + Math.min(255, R * f) * a; o[i + 1] = o[i + 1] * (1 - a) + Math.min(255, G * f) * a; o[i + 2] = o[i + 2] * (1 - a) + Math.min(255, B * f) * a;
      }
    }
    x.putImageData(out, 0, 0);
  }

  function olustur(V) {
    var K = veriAl(V.kar), KM = veriAl(V.karM), Y = veriAl(V.yuz), YM = veriAl(V.yuzM);
    if (!K.d || !KM.d) throw new Error("çizim okunamadı");
    var tuval = document.createElement("canvas"); tuval.width = K.c.width; tuval.height = K.c.height;
    var yuzTuval = document.createElement("canvas"); yuzTuval.width = Y.c.width; yuzTuval.height = Y.c.height;
    var W = tuval.width, H = tuval.height, dokular = [];
    function doku() { var t = new T.CanvasTexture(tuval); t.encoding = T.LinearEncoding; t.anisotropy = 4; t.minFilter = T.LinearMipmapLinearFilter; dokular.push(t); return t; }
    function malzeme(t) { var m = new T.MeshBasicMaterial({ map: t, color: 0xf6f3ee, transparent: true, alphaTest: 0.1, side: T.DoubleSide }); m.toneMapped = false; return m; }
    var geoAlt = new T.PlaneGeometry(1, 1); geoAlt.translate(0, 0.5, 0);      /* alt orta = ayak noktası */
    var geoOrta = new T.PlaneGeometry(1, 1);
    /* 1) kare kare duruşlar (iş, konuşma, boş anlar) */
    var texP = doku(), pano = new T.Mesh(geoAlt, malzeme(texP)); pano.renderOrder = 2;
    /* 2) yürüyüş düzeneği: gövde + iki ayakkabı ayrı parça; ayaklar gövdenin arkasında, eteğin altından adım atar */
    var texG = doku(), texA = doku(), texB = doku();
    var govde = new T.Mesh(geoAlt, malzeme(texG)), ayakA = new T.Mesh(geoOrta, malzeme(texA)), ayakB = new T.Mesh(geoOrta, malzeme(texB));
    govde.renderOrder = 3; ayakA.renderOrder = 2; ayakB.renderOrder = 2;
    var duzen = new T.Group(); duzen.add(ayakA); duzen.add(ayakB); duzen.add(govde);
    var dondur = new T.Group(); dondur.add(pano); dondur.add(duzen);
    var golge = new T.Mesh(new T.CircleGeometry(0.5, 24), new T.MeshBasicMaterial({ color: 0x1d3310, transparent: true, opacity: 0.24, depthWrite: false }));
    golge.rotation.x = -Math.PI / 2; golge.position.y = 0.03; golge.scale.set(0.95, 0.55, 1);
    var g = new T.Group(); g.add(golge); g.add(dondur);
    function uv(t, f) { t.repeat.set(f[2] / W, f[3] / H); t.offset.set(f[0] / W, 1 - (f[1] + f[3]) / H); }
    var simdi = "";
    function kare(grup, i, ayna) {
      var L = KARE[grup] || KARE.p_on, f = L[Math.max(0, Math.min(L.length - 1, i))], p = grup.charAt(0) === "p" ? PPM_POZ : PPM_YURU, k = grup + i + (ayna ? "-" : "");
      if (k === simdi) return; simdi = k;
      uv(texP, f);
      var ax = (f[4] - f[2] / 2) / p;
      pano.scale.set(f[2] / p * (ayna ? -1 : 1), f[3] / p, 1); pano.position.set(ayna ? ax : -ax, -(f[3] - 1 - f[5]) / p, 0);
    }
    var duzenAd = "";
    function duzenKur(ad) {                                                  /* ad: on | ucdort | yan | arkayan | arka */
      if (ad === duzenAd) return; duzenAd = ad;
      var G = KARE["g_" + ad + "_govde"][0], A = KARE["g_" + ad + "_a0"][0], B = KARE["g_" + ad + "_a1"][0], p = PPM_POZ, cx = G[4], alt = G[5];
      uv(texG, G); uv(texA, A); uv(texB, B);
      govde.scale.set(G[2] / p, G[3] / p, 1); govde.position.set(-(cx - G[2] / 2) / p, -(G[3] - 1 - alt) / p, 0);
      [[ayakA, A], [ayakB, B]].forEach(function (x) { var m = x[0], f = x[1]; m.scale.set(f[2] / p, f[3] / p, 1); m.userData.x = (f[4] + f[2] / 2 - cx) / p; m.userData.y = (alt - (f[5] + f[3] / 2)) / p; m.position.set(m.userData.x, m.userData.y, -0.012); });
    }
    function karesi(grup, t) {
      var n = (KARE[grup] || [0]).length; if (n < 2) return 0;
      var s = Math.floor(t * (FPS[grup] || 8));
      if (GIDIP[grup]) { var p = 2 * n - 2; s = s % p; return s < n ? s : p - s; }
      return s % n;
    }
    /* yön → çizim: 8 yön (aynalı). Sınırlarda takılıp titrememesi için küçük bir pay bırakılır. */
    var YONLER = [["on", 0.39], ["ucdort", 1.18], ["yan", 1.96], ["arkayan", 2.75], ["arka", 9]];
    var SAG_BAKAN = { ucdort: 1, arkayan: 1 }, SOL_BAKAN = { yan: 1 };
    var an = { durum: "", t: 0, bos: 0, bosAn: null, bosT: 0, sonBos: "", faz: 0, genlik: 0, yon: "on", ayna: false, donus: 0, hedefYon: null, hedefAyna: false };
    function yonSec(d) {
      var m = Math.abs(d), i, cur = -1;
      for (i = 0; i < YONLER.length; i++) if (YONLER[i][0] === an.yon) cur = i;
      var yeni = 0; while (m > YONLER[yeni][1]) yeni++;
      if (cur >= 0 && yeni !== cur) { var sinir = YONLER[Math.min(yeni, cur)][1]; if (Math.abs(m - sinir) < 0.12) yeni = cur; }
      var ad = YONLER[yeni][0], ayna = SAG_BAKAN[ad] ? d < 0 : SOL_BAKAN[ad] ? d > 0 : false;
      return [ad, ayna];
    }
    function ciz(kamera, dunyaPos, yon, durum, dt, yol) {
      var dx = kamera.position.x - dunyaPos.x, dz = kamera.position.z - dunyaPos.z, yaw = Math.atan2(dx, dz), pitch = Math.atan2(kamera.position.y - dunyaPos.y, Math.hypot(dx, dz));
      dondur.rotation.set(-pitch * 0.5, yaw, 0, "YXZ");
      if (durum !== an.durum) { an.durum = durum; an.t = 0; if (durum !== "dur") { an.bos = 0; an.bosAn = null; } }
      an.t += dt;
      var d = Math.atan2(Math.sin(yon - yaw), Math.cos(yon - yaw)), t = an.t, grup = null, bob = 0, sy = 1, egim = 0;
      var duzenli = durum === "yuru" || (durum === "dur" && !an.bosAn);
      if (durum === "dur") {
        an.bos += dt;
        if (an.bosAn) { grup = an.bosAn; if ((an.bosT -= dt) <= 0) { an.bosAn = null; an.bos = 0; an.t = 0; duzenli = true; grup = null; } }
        else if (an.bos > 6) { do { an.bosAn = BOS_AN[Math.floor(Math.random() * BOS_AN.length)]; } while (an.bosAn === an.sonBos); an.sonBos = an.bosAn; an.bosT = an.bosAn === "p_otur" ? 6 : 3.6; grup = an.bosAn; an.t = 0; duzenli = false; }
      }
      else if (durum === "selam") grup = t < 1.9 ? "konus" : "p_goz";
      else if (durum === "sevin") { grup = "p_zipla"; bob = Math.abs(Math.sin(t * 6)) * 0.18; }
      else if (durum === "ekim") grup = t < 0.55 ? "egil" : "p_dik";
      else if (durum === "sulama") grup = "p_sula";
      else if (durum === "hasat") grup = t < 0.75 ? "egil" : "p_kasa";
      else if (durum === "besle") grup = "egil";
      /* --- yürüyüş düzeneği --- */
      if (duzenli) {
        var yuruyor = durum === "yuru", hedef = yuruyor ? yonSec(d) : ["on", false];
        if (!yuruyor && an.genlik > 0.15) hedef = [an.yon, an.ayna];            /* durarken önce adımı bitir */
        /* dönüş: kart gibi kısa bir çevrilme (ince → yeni yön) */
        if ((hedef[0] !== an.yon || hedef[1] !== an.ayna) && an.donus <= 0) { an.donus = 0.16; an.hedefYon = hedef[0]; an.hedefAyna = hedef[1]; }
        var sx = 1;
        if (an.donus > 0) {
          an.donus -= dt; var k = Math.max(0, an.donus) / 0.16;              /* 1 → 0 */
          if (k < 0.5 && an.hedefYon) { an.yon = an.hedefYon; an.ayna = an.hedefAyna; an.hedefYon = null; }
          sx = Math.max(0.12, Math.abs(k * 2 - 1));
        }
        duzenKur(an.yon);
        an.genlik += ((yuruyor ? 1 : 0) - an.genlik) * Math.min(1, dt * (yuruyor ? 10 : 7));
        an.faz += (yol || 0) * (Math.PI * 2 / 1.15);                          /* bir tam döngü ≈ 1,15 m: ayak kaymaz */
        if (!yuruyor && an.genlik < 0.15) an.faz += (Math.round(an.faz / Math.PI) * Math.PI - an.faz) * Math.min(1, dt * 8);
        var A = an.genlik, f = an.faz, yan = an.yon === "yan" ? 1 : an.yon === "ucdort" || an.yon === "arkayan" ? 0.8 : 0, ileri = an.yon === "yan" ? -1 : 1;
        [[ayakA, 0], [ayakB, Math.PI]].forEach(function (x) {
          var m = x[0], ph = f + x[1], sw = Math.sin(ph), kaldir = Math.max(0, sw) * (yan === 1 ? 0.075 : 0.095) * A, adim = -Math.cos(ph) * 0.11 * A;
          var on = an.yon === "on" ? 1 : an.yon === "arka" ? -1 : an.yon === "ucdort" ? 0.5 : an.yon === "arkayan" ? -0.5 : 0;
          m.position.x = m.userData.x + adim * yan * ileri;
          m.position.y = m.userData.y + kaldir - (on > 0 ? Math.max(0, -Math.cos(ph)) * 0.05 * A * on : 0);
          var olc = 1 + adim * on * 0.35, fr = KARE["g_" + an.yon + (x[1] ? "_a1" : "_a0")][0]; m.scale.set(fr[2] / PPM_POZ * olc, fr[3] / PPM_POZ * olc, 1);
        });
        bob = Math.abs(Math.cos(f)) * 0.035 * A; egim = Math.sin(f) * 0.03 * A + (an.yon === "yan" ? 0.04 * A * (an.ayna ? 1 : -1) * -1 : 0);
        if (!yuruyor) sy = 1 + Math.sin(an.t * 2.2) * 0.006;
        duzen.visible = true; pano.visible = false;
        duzen.scale.set(an.ayna ? -1 : 1, 1, 1);
        dondur.position.y = bob; duzen.position.x = yan < 1 ? Math.sin(f) * 0.018 * A : 0; dondur.rotation.z = egim; dondur.scale.set(sx, sy, 1);
        return;
      }
      /* --- kare kare duruşlar --- */
      an.genlik = 0; an.donus = 0;
      if (grup.charAt(0) === "p" && durum !== "sevin") sy = 1 + Math.sin(t * 3) * 0.008;
      var ayna2 = !!SAGA[grup] && d < 0;
      kare(grup, karesi(grup, t), ayna2);
      duzen.visible = false; pano.visible = true;
      dondur.position.y = bob; dondur.rotation.z = 0; dondur.scale.set(1, sy, 1);
    }
    function giydir(o) { boya(K, KM, [o.sal, o.onluk], tuval); dokular.forEach(function (t) { t.needsUpdate = true; }); boya(Y, YM, [o.sal, null], yuzTuval); yuzOn = {}; }
    var yuzOn = {};
    function yuz(i) {
      if (yuzOn[i]) return yuzOn[i];
      var c = document.createElement("canvas"); c.width = c.height = 128; var x = c.getContext("2d");
      x.drawImage(yuzTuval, (i % 15) * 200, 0, 200, 200, 0, 0, 128, 128);
      try { yuzOn[i] = c.toDataURL("image/png"); } catch (e) { yuzOn[i] = ""; }
      return yuzOn[i];
    }
    function onizle(cv) {
      var f = KARE.p_on[0], x = cv.getContext("2d"), s = Math.min(cv.width / f[2], (cv.height - 6) / f[3]);
      x.clearRect(0, 0, cv.width, cv.height); x.imageSmoothingQuality = "high";
      x.drawImage(tuval, f[0], f[1], f[2], f[3], (cv.width - f[2] * s) / 2, cv.height - 4 - f[3] * s, f[2] * s, f[3] * s);
    }
    duzenKur("on");
    return { g: g, giydir: giydir, ciz: ciz, yuz: yuz, onizle: onizle, kareAd: function () { return duzen.visible ? "duzen_" + an.yon + (an.ayna ? "-" : "") : simdi; } };
  }
  window.CfKar = { yukle: yukle, olustur: olustur };
})();
