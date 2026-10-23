/* Çiftlik – Büşra 3D karakteri (Meshy ile çizimden üretildi, iskeletli; veri: ciftlik-kar3d-veri.js).
   Yürüyüş gerçek iskelet animasyonu (Walking_Woman). Durma, iş (eğilip toplama), selam ve sevinç: yürüyüşten seçilen ayakları
   birleşik duruşun üstüne kemik döndürmeleriyle eklenir. Şal ve önlük rengi doku üzerinde maskeyle boyanır (ışık-gölge korunur).
   Dışarıya window.CfKar3D verir: yukle(cb) → olustur(gltf) → { g, giydir, ciz }. */
(function () {
  "use strict";
  var T = window.THREE;
  if (!T || !T.GLTFLoader) return;
  function b64(s) { var b = atob(s), n = b.length, u = new Uint8Array(n); for (var i = 0; i < n; i++) u[i] = b.charCodeAt(i); return u.buffer; }
  var veri = null, bekleyen = [];
  function yukle(cb) {
    if (veri) { cb(veri); return; }
    bekleyen.push(cb); if (bekleyen.length > 1) return;
    function bit(x) { veri = x; var l = bekleyen; bekleyen = []; l.forEach(function (f) { f(x); }); }
    var V = window.CF_KAR3D; if (!V) { bit(null); return; }
    try {
      new T.GLTFLoader().parse(b64(V.glb), "", function (g) {
        var m = new Image(); m.onload = function () { g.maske = m; bit(g); }; m.onerror = function () { bit(g); }; m.src = V.maske;
      }, function () { bit(null); });
    } catch (e) { bit(null); }
  }
  function olustur(G) {
    var kok = G.scene, mesh = null, kemik = {};
    kok.traverse(function (o) { if (o.isSkinnedMesh || o.isMesh) mesh = mesh || o; if (o.isBone) kemik[o.name.replace(/^mixamorig:?/, "")] = o; });
    if (!mesh) throw new Error("model yok");
    /* malzeme: sahnenin geri kalanı gibi Lambert; doku boyanabilir tuvale alınır */
    var kaynakImg = mesh.material.map && mesh.material.map.image, tuval = document.createElement("canvas"), kaynak = null, maske = null;
    tuval.width = kaynakImg ? kaynakImg.width : 4; tuval.height = kaynakImg ? kaynakImg.height : 4;
    var x = tuval.getContext("2d");
    if (kaynakImg) { x.drawImage(kaynakImg, 0, 0); try { kaynak = x.getImageData(0, 0, tuval.width, tuval.height); } catch (e) {} }
    if (G.maske && kaynak) { var mc = document.createElement("canvas"); mc.width = tuval.width; mc.height = tuval.height; var mx2 = mc.getContext("2d"); mx2.drawImage(G.maske, 0, 0, tuval.width, tuval.height); try { maske = mx2.getImageData(0, 0, tuval.width, tuval.height); } catch (e) {} }
    var tex = new T.CanvasTexture(tuval); tex.flipY = false; tex.encoding = T.LinearEncoding; tex.anisotropy = 4;
    mesh.material = new T.MeshLambertMaterial({ map: tex, side: T.FrontSide, emissive: 0x2a2420 });
    mesh.castShadow = true; mesh.receiveShadow = false; mesh.frustumCulled = false;
    var g = new T.Group(); kok.scale.setScalar(1.12); g.add(kok);
    var golge = new T.Mesh(new T.CircleGeometry(0.5, 24), new T.MeshBasicMaterial({ color: 0x1d3310, transparent: true, opacity: 0.22, depthWrite: false }));
    golge.rotation.x = -Math.PI / 2; golge.position.y = 0.03; golge.scale.set(0.8, 0.6, 1); g.add(golge);
    /* animasyonlar */
    var mixer = new T.AnimationMixer(kok), klip = {};
    G.animations.forEach(function (a) { klip[a.name] = a; });
    var yuru = klip.Walking_Woman || klip.Walking || G.animations[0];
    /* duruş: yürüyüşte ayakların en yakın olduğu an (iki ayak yan yana) */
    var aL = kemik.LeftFoot, aR = kemik.RightFoot, enIyi = 0, enAz = 1e9, pa = new T.Vector3(), pb = new T.Vector3();
    var yAct = mixer.clipAction(yuru); yAct.play();
    for (var i = 0; i < 40; i++) { var t = yuru.duration * i / 40; mixer.setTime(t); kok.updateMatrixWorld(true); if (aL && aR) { aL.getWorldPosition(pa); aR.getWorldPosition(pb); var d = Math.abs(pa.z - pb.z); if (d < enAz) { enAz = d; enIyi = t; } } }
    yAct.stop();
    /* duruş klibi: her izden o anki değer (tek kare) — her kemik her karede yeniden yazılsın, ek dönüşler birikmesin */
    var durKlip = new T.AnimationClip("dur", 1, yuru.tracks.map(function (tr) {
      var v = Array.prototype.slice.call(tr.createInterpolant().evaluate(enIyi));
      return new tr.constructor(tr.name, [0], v);
    }));
    var aYuru = mixer.clipAction(yuru), aDur = mixer.clipAction(durKlip);
    aDur.play(); aYuru.play(); aYuru.setEffectiveWeight(0); aDur.setEffectiveWeight(1);
    var agirlik = 0;                                                         /* 0 dur … 1 yürü */
    var e = new T.Euler(), q = new T.Quaternion();
    var degisen = [];
    function dondur(ad, rx, ry, rz) { var b = kemik[ad]; if (!b) return; if (!b.userData.ekli) { b.userData.ekli = true; b.userData.taban = (b.userData.taban || new T.Quaternion()).copy(b.quaternion); degisen.push(b); } e.set(rx, ry, rz); q.setFromEuler(e); b.quaternion.multiply(q); }
    function geriAl() { for (var i = 0; i < degisen.length; i++) { var b = degisen[i]; b.quaternion.copy(b.userData.taban); b.userData.ekli = false; } degisen.length = 0; }
    var an = { durum: "", t: 0, k: 0 };
    function ciz(durum, dt, hiz) {
      if (durum !== an.durum) { an.durum = durum; an.t = 0; }
      an.t += dt;
      var yuruyor = durum === "yuru";
      agirlik += ((yuruyor ? 1 : 0) - agirlik) * Math.min(1, dt * 8);
      aYuru.setEffectiveWeight(agirlik); aDur.setEffectiveWeight(1 - agirlik);
      aYuru.timeScale = 0.9 + (hiz || 0) * 0.25;
      geriAl();                                                            /* önceki karenin ek dönüşlerini geri al (karıştırıcı değişmeyen değeri yeniden yazmaz) */
      mixer.update(dt);
      /* ek hareketler (kemik dönüşleri; yumuşak giriş-çıkış) */
      var is = durum === "hasat" || durum === "ekim" || durum === "besle" || durum === "sulama", sev = durum === "sevin" || durum === "selam";
      an.k += ((is || sev ? 1 : 0) - an.k) * Math.min(1, dt * 6);
      var k = an.k, t = an.t;
      if (!yuruyor) { var nefes = Math.sin(t * 2.2) * 0.012; dondur("Spine1", nefes, 0, 0); }   /* çok hafif nefes; boyun sabit */
      if (is && k > 0.01) {                                                /* sakin uzanıp toplama: yavaş bir eğil-doğrul döngüsü */
        var p = (1 - Math.cos(t * Math.PI * 2 / 1.3)) / 2;
        dondur("Spine", (0.12 + 0.22 * p) * k, 0, 0); dondur("Spine1", (0.08 + 0.12 * p) * k, 0, 0);
        dondur("RightArm", (0.45 + 0.45 * p) * k, 0, 0.12 * k); dondur("RightForeArm", 0.25 * k, 0, 0);
        dondur("LeftArm", 0.25 * k, 0, -0.08 * k);
      }
      if (sev && k > 0.01) {
        var z = Math.sin(t * 12) * 0.3;
        if (durum === "sevin") { dondur("RightArm", 0.4 * k, 0, (-2.5 + z) * k); dondur("LeftArm", 0.4 * k, 0, (2.5 + z) * k); }
        else dondur("RightArm", 0.6 * k, 0, (-2.7 + z) * k);                /* el sallama */
      }
      kok.position.y = durum === "sevin" ? Math.abs(Math.sin(t * 6)) * 0.12 : 0;
    }
    function boya(sal, onluk) {
      if (!kaynak) return;
      var out = x.createImageData(tuval.width, tuval.height), o = out.data, s = kaynak.data; o.set(s);
      if (maske) {
        var m = maske.data, R = [sal, onluk];
        for (var kk = 0; kk < 2; kk++) {
          var hc = R[kk]; if (hc === null || hc === undefined) continue;
          var r = (hc >> 16) & 255, gg = (hc >> 8) & 255, bb = hc & 255, top = 0, say = 0, i2;
          for (i2 = 0; i2 < s.length; i2 += 4) if (m[i2 + kk] > 128) { top += s[i2] + s[i2 + 1] + s[i2 + 2]; say++; }
          if (!say) continue;
          var ort = top / say, koyu = (r + gg + bb) < 150;
          for (i2 = 0; i2 < s.length; i2 += 4) {
            var a = m[i2 + kk] / 255; if (a <= 0.02) continue;
            var f = (s[i2] + s[i2 + 1] + s[i2 + 2]) / ort; if (koyu) f = 1 + (f - 1) * 0.6;
            o[i2] = o[i2] * (1 - a) + Math.min(255, r * f) * a; o[i2 + 1] = o[i2 + 1] * (1 - a) + Math.min(255, gg * f) * a; o[i2 + 2] = o[i2 + 2] * (1 - a) + Math.min(255, bb * f) * a;
          }
        }
      }
      x.putImageData(out, 0, 0); tex.needsUpdate = true;
    }
    return { g: g, ciz: ciz, giydir: function (o) { boya(o.sal, o.onluk); } };
  }
  window.CfKar3D = { yukle: yukle, olustur: olustur };
})();
