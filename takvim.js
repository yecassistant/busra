/* Buluşma Takvimi – ikisi de müsait olduğu günleri işaretler; ortak günler öne çıkar.
   Bulut: takvim/{uid} = { g: { "YYYY-MM-DD": true }, t } (herkes kendi dokümanını yazar, ikisi de okur). */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  var AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  var GUNLER = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"], KISA = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  var ME = null, OTHER = null, ADLAR = {}, KUL = {}, db = null, hazirMi = false, benim = {}, onun = {}, benimYuklendi = false, onunYuklendi = false;
  var bugun = new Date(); bugun.setHours(0, 0, 0, 0);
  var gorunenAy = new Date(bugun.getFullYear(), bugun.getMonth(), 1), yazT = 0, snd = function (n) { if (window.TkSes) try { window.TkSes.play(n); } catch (e) {} };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function iso(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function tarih(k) { var p = k.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function uzun(k) { var d = tarih(k); return GUNLER[(d.getDay() + 6) % 7] + " " + d.getDate() + " " + AYLAR[d.getMonth()]; }
  function kacGun(k) { return Math.round((tarih(k) - bugun) / 86400000); }
  function nezaman(k) { var n = kacGun(k); return n === 0 ? "bugün" : n === 1 ? "yarın" : n + " gün sonra"; }
  function ekIn(ad) { var m = String(ad).toLowerCase().match(/[aeıioöuü](?![\s\S]*[aeıioöuü])/), v = m ? m[0] : "a", h = /[aı]/.test(v) ? "ı" : /[ou]/.test(v) ? "u" : /[öü]/.test(v) ? "ü" : "i"; return ad + "'" + (/[aeıioöuü]$/i.test(ad) ? "n" : "") + h + "n"; }

  /* ---- çizim ---- */
  function ortak() { var l = []; for (var k in benim) if (benim[k] && onun[k] && kacGun(k) >= 0) l.push(k); l.sort(); return l; }
  var yon = 0, sonTik = null, ilkCizim = true, oncekiOrtak = null;
  function haftaSonu(n) {                                              /* n=0 bu, n=1 gelecek hafta sonu: [cmt, paz] (geçmiş gün yok) */
    var d = new Date(bugun), gun = (d.getDay() + 6) % 7, l = [];        /* pzt=0 … paz=6 */
    var cmt = new Date(d); cmt.setDate(d.getDate() + (5 - gun) + n * 7); var paz = new Date(cmt); paz.setDate(cmt.getDate() + 1);
    if (cmt >= bugun) l.push(iso(cmt)); if (paz >= bugun) l.push(iso(paz));
    return l;
  }
  function hizliCiz() {
    [].forEach.call($("hizli").children, function (b) {
      var l = haftaSonu(+b.getAttribute("data-h")), hepsi = l.length && l.every(function (k) { return benim[k]; });
      b.className = hepsi ? "on" : ""; b.setAttribute("aria-pressed", hepsi ? "true" : "false"); b.disabled = !ME || !db || !l.length;
    });
  }
  function patlat(el) {                                                /* ortak gün olunca küçük kalp patlaması */
    if (!el || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
    var r = el.getBoundingClientRect(), kap = document.createElement("div"), i, RENK = ["#f2c35b", "#ff8fb0", "#fff", "#9d8cff"];
    kap.className = "tkpatla"; kap.style.left = (r.left + r.width / 2) + "px"; kap.style.top = (r.top + r.height / 2) + "px";
    for (i = 0; i < 12; i++) {
      var a = (i / 12) * 6.283 + Math.random() * 0.4, u = 46 + Math.random() * 40, p = document.createElement("i");
      p.style.setProperty("--dx", Math.round(Math.cos(a) * u) + "px"); p.style.setProperty("--dy", Math.round(Math.sin(a) * u - 18) + "px");
      p.style.color = RENK[i % 4]; p.textContent = i % 3 ? "♥" : "✦"; p.style.fontSize = (10 + Math.random() * 8) + "px";
      kap.appendChild(p);
    }
    document.body.appendChild(kap); setTimeout(function () { if (kap.parentNode) kap.parentNode.removeChild(kap); }, 1100);
  }
  function ciz() {
    var y = gorunenAy.getFullYear(), m = gorunenAy.getMonth();
    $("ay").textContent = AYLAR[m] + " " + y;
    $("geri").disabled = gorunenAy <= new Date(bugun.getFullYear(), bugun.getMonth(), 1);
    var ilk = new Date(y, m, 1), bosluk = (ilk.getDay() + 6) % 7, son = new Date(y, m + 1, 0).getDate(), html = "", i;
    for (i = 0; i < bosluk; i++) html += '<span class="tkd bos"></span>';
    for (i = 1; i <= son; i++) {
      var d = new Date(y, m, i), k = iso(d), gecmis = d < bugun, b = !!benim[k], o = !!onun[k];
      var cls = "tkd" + (k === sonTik ? " tik" : "") + (gecmis ? " gecmis" : "") + (d.getTime() === bugun.getTime() ? " bugun" : "") + (b && o ? " ikisi" : b ? " ben" : o ? " o" : "") + ((d.getDay() === 0 || d.getDay() === 6) ? " hs" : "");
      html += '<button type="button" class="' + cls + '" data-k="' + k + '"' + (gecmis ? " disabled" : "") + ' aria-label="' + esc(uzun(k)) + (b && o ? ", ikimiz de müsaitiz" : b ? ", sen müsaitsin" : o ? ", " + esc(ADLAR[OTHER] || "o") + " müsait" : "") + '"><i>' + i + '</i>' + (b && !o ? '<u class="n ben"></u>' : o && !b ? '<u class="n o"></u>' : "") + (b && o ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-5.2-9.5-10A5.3 5.3 0 0 1 12 6a5.3 5.3 0 0 1 9.5 5c-2 4.8-9.5 10-9.5 10z"/></svg>' : "") + "</button>";
    }
    var grid = $("grid");
    grid.innerHTML = html;
    grid.className = "tkgrid" + (yon > 0 ? " sag" : yon < 0 ? " sol" : ilkCizim && benimYuklendi ? " ilk" : "");
    if (benimYuklendi) ilkCizim = false;
    yon = 0; sonTik = null;
    var ort = ortak(), hero = $("hero"), hg = $("heroGun");
    if (benimYuklendi && ort.length) {
      var od = tarih(ort[0]); $("hgAy").textContent = AYLAR[od.getMonth()].slice(0, 3); $("hgN").textContent = od.getDate(); $("hgG").textContent = KISA[(od.getDay() + 6) % 7];
      if (oncekiOrtak !== ort[0]) { hg.classList.remove("yeni"); void hg.offsetWidth; hg.classList.add("yeni"); }
    }
    hg.hidden = !(benimYuklendi && ort.length); oncekiOrtak = benimYuklendi && ort.length ? ort[0] : null;
    hizliCiz();
    if (!benimYuklendi) { hero.className = "tkhero"; $("heroKick").textContent = "Yaklaşan"; $("heroT").textContent = "Yükleniyor…"; $("heroS").textContent = ""; }
    else if (ort.length) { hero.className = "tkhero var"; $("heroKick").textContent = ort.length === 1 ? "İkimizin de boş olduğu gün" : ort.length + " ortak gün · en yakını"; $("heroT").textContent = uzun(ort[0]); $("heroS").textContent = nezaman(ort[0]); }
    else {
      var benS = 0, onS = 0, k2; for (k2 in benim) if (benim[k2] && kacGun(k2) >= 0) benS++; for (k2 in onun) if (onun[k2] && kacGun(k2) >= 0) onS++;
      hero.className = "tkhero"; $("heroKick").textContent = "Ortak gün";
      $("heroT").textContent = !benS ? "Müsait olduğun günlere dokun" : !onS ? (OTHER ? (ADLAR[OTHER] || "O") + " henüz işaretlemedi" : digerAd + " henüz giriş yapmadı") : "Henüz çakışan gün yok";
      $("heroS").textContent = !benS ? "İkimizin de boş olduğu günler burada görünür." : !onS ? (OTHER ? "O da işaretleyince ortak günler burada görünür." : "Giriş yapıp işaretleyince ortak günler burada görünür.") : "İkimiz de birkaç gün daha işaretleyelim.";
    }
    var list = $("list"), say = $("sayac");
    if (ort.length > 1) { list.hidden = false; list.innerHTML = ort.slice(0, 8).map(function (k, n) { return '<li style="--i:' + n + '"><b>' + esc(uzun(k)) + "</b><span>" + esc(nezaman(k)) + "</span></li>"; }).join(""); }
    else list.hidden = true;
    var bs = 0, os = 0, k3; for (k3 in benim) if (benim[k3] && kacGun(k3) >= 0) bs++; for (k3 in onun) if (onun[k3] && kacGun(k3) >= 0) os++;
    say.innerHTML = '<span class="ben">' + bs + " gün sen</span><span class=\"o\">" + os + " gün " + esc(OTHER ? (ADLAR[OTHER] || "o") : digerAd) + "</span>" + (ort.length ? '<span class="ikisi">' + ort.length + " ortak</span>" : "");
  }
  function ayGit(n) {
    if (n < 0 && $("geri").disabled) return;
    gorunenAy = new Date(gorunenAy.getFullYear(), gorunenAy.getMonth() + n, 1); yon = n; ciz();
  }
  $("geri").onclick = function () { ayGit(-1); };
  $("ileri").onclick = function () { ayGit(1); };
  /* parmakla sağa sola kaydırınca ay değişir */
  var kx = null, ky = 0;
  $("grid").addEventListener("touchstart", function (e) { if (e.touches.length === 1) { kx = e.touches[0].clientX; ky = e.touches[0].clientY; } }, { passive: true });
  $("grid").addEventListener("touchend", function (e) {
    if (kx === null) return; var t = e.changedTouches[0], dx = t.clientX - kx, dy = t.clientY - ky; kx = null;
    if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.6) ayGit(dx < 0 ? 1 : -1);
  }, { passive: true });
  /* hafta sonu kısayolları: iki günü birden işaretler, hepsi işaretliyse kaldırır */
  $("hizli").addEventListener("click", function (e) {
    var b = e.target && e.target.closest ? e.target.closest("button") : null; if (!b || b.disabled || !ME || !db) return;
    var l = haftaSonu(+b.getAttribute("data-h")); if (!l.length) return;
    var hepsi = l.every(function (k) { return benim[k]; }), yeniOrtak = null;
    l.forEach(function (k) { if (hepsi) delete benim[k]; else { if (!benim[k] && onun[k]) yeniOrtak = k; benim[k] = true; } });
    snd(hepsi ? "kapa" : yeniOrtak ? "ortak" : "ac");
    var hd = tarih(l[0]); if (hd.getMonth() !== gorunenAy.getMonth() || hd.getFullYear() !== gorunenAy.getFullYear()) { yon = hd > gorunenAy ? 1 : -1; gorunenAy = new Date(hd.getFullYear(), hd.getMonth(), 1); }
    sonTik = l[0]; ciz();
    if (yeniOrtak) { msg(uzun(yeniOrtak) + " — ikimiz de boşuz!"); patlat($("grid").querySelector('[data-k="' + yeniOrtak + '"]')); }
    l.forEach(function (k) { kaydet(k, !hepsi); });
  });
  $("grid").addEventListener("click", function (e) {
    var b = e.target && e.target.closest ? e.target.closest("button.tkd") : null; if (!b || b.disabled || !ME || !db) return;
    var k = b.getAttribute("data-k"); benim[k] = !benim[k]; if (!benim[k]) delete benim[k];
    snd(benim[k] ? (onun[k] ? "ortak" : "ac") : "kapa");
    sonTik = k; ciz();
    if (benim[k] && onun[k]) { msg(uzun(k) + " — ikimiz de boşuz!"); var el = $("grid").querySelector('[data-k="' + k + '"]'); if (el) { el.classList.add("pat"); setTimeout(function () { el.classList.remove("pat"); }, 700); patlat(el); } }
    kaydet(k, benim[k]);
  });
  function msg(t) { var m = $("msg"); m.textContent = t; clearTimeout(msg.t); msg.t = setTimeout(function () { m.textContent = ""; }, 2800); }

  /* ---- bulut ---- */
  var olayKuyruk = [];
  function kaydet(k, eklendi) {
    clearTimeout(yazT);
    if (eklendi) olayKuyruk.push(k);
    yazT = setTimeout(function () {
      var g = {}, kk; for (kk in benim) if (benim[kk] && kacGun(kk) >= -60) g[kk] = true;      /* 60 günden eskiler düşer */
      db.collection("takvim").doc(ME).set({ g: g, t: firebase.firestore.FieldValue.serverTimestamp() }).then(function () {
        $("tkSub").textContent = "kaydedildi"; setTimeout(function () { $("tkSub").textContent = "canlı"; }, 1500);
        var ekl = olayKuyruk.slice(); olayKuyruk = [];
        ekl.forEach(function (kk) { if (!benim[kk]) return; var d = tarih(kk); db.collection("akis").add({ uid: ME, o: "takvim", k: onun[kk] ? "ortak" : "ekledi", v: d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(), t: firebase.firestore.FieldValue.serverTimestamp() }).catch(function () {}); });
      }).catch(function () { $("tkSub").textContent = "kaydedilemedi"; msg("Kaydedilemedi, bağlantını kontrol et."); });
    }, 900);
  }
  var digerAd = "O", onunDinle = null;
  function basla() {
    var k = Hesap.kim(), ip = null;
    try { ip = JSON.parse(localStorage.getItem("hs_u") || "null"); } catch (e) {}
    if (!k) { if (ip && !Hesap._test().sdkHata && !hazirMi) { $("tkSub").textContent = "bağlanıyor…"; return; } $("gate").hidden = false; $("tkSub").textContent = ""; return; }
    if (!k.kesin || hazirMi) return;
    hazirMi = true; ME = k.uid; ADLAR[ME] = k.ad; KUL[ME] = k.kul; $("gate").hidden = true;
    digerAd = Hesap.gorunenAd(k.kul === "bus" ? "yec" : "bus"); $("legO").textContent = digerAd;
    Hesap.db().then(function (d) {
      db = d;
      db.collection("takvim").doc(ME).onSnapshot(function (s) {
        var g = s.exists ? (s.data().g || {}) : {};
        if (!yazT || !benimYuklendi) { benim = {}; for (var kk in g) if (g[kk]) benim[kk] = true; }   /* yazım beklerken yerel hali koru */
        benimYuklendi = true; $("tkSub").textContent = "canlı"; ciz();
      }, function () { $("tkSub").textContent = "bağlantı yok"; });
      /* öteki: oyuncular koleksiyonunu canlı izle — ilk girişini yaptığı an günleri de dinlenmeye başlar */
      db.collection("oyuncular").onSnapshot(function (snap) {
        var yeni = null;
        snap.forEach(function (doc) { var p = doc.data(); if (doc.id !== ME) { yeni = doc.id; ADLAR[yeni] = (p.kul && Hesap.gorunenAd(p.kul)) || p.ad || "O"; KUL[yeni] = p.kul; } });
        if (yeni && !OTHER) {
          OTHER = yeni; $("legO").textContent = ADLAR[OTHER] || digerAd;
          onunDinle = db.collection("takvim").doc(OTHER).onSnapshot(function (s) {
            var g = s.exists ? (s.data().g || {}) : {}, onceki = ortak().length;
            onun = {}; for (var kk in g) if (g[kk]) onun[kk] = true; onunYuklendi = true; ciz();
            var simdi = ortak(); if (benimYuklendi && simdi.length > onceki) { snd("ortak"); msg((ADLAR[OTHER] || "O") + " da işaretledi: " + uzun(simdi[simdi.length - 1]) + " ortak!"); }
          }, function () {});
        } else if (!OTHER) { onunYuklendi = true; ciz(); }
      }, function () {});
      try { if (localStorage.getItem("tk_help") !== "1") $("help").hidden = false; } catch (e) {}
    }).catch(function () { $("tkSub").textContent = "bağlantı yok"; msg("Bağlantı kurulamadı."); });
  }
  $("bHelp").onclick = function () { $("help").hidden = false; };
  $("helpGo").onclick = function () { $("help").hidden = true; try { localStorage.setItem("tk_help", "1"); } catch (e) {} };
  Hesap.izle(function () { basla(); });
  Hesap.hazir(function () { if (!Hesap.kim()) basla(); });
  ciz();
  if (location.hash === "#test") window.__tk = { state: function () { return { me: ME, other: OTHER, benim: benim, onun: onun, ortak: ortak(), ay: iso(gorunenAy) }; }, ay: function (n) { gorunenAy = new Date(gorunenAy.getFullYear(), gorunenAy.getMonth() + n, 1); ciz(); } };
})();
