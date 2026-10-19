/* Hesap – kullanıcı adıyla giriş ve ilerlemenin bulutta eşitlenmesi (Firebase: Authentication + Firestore).
   Her oyun sayfasında oyun scriptlerinden ÖNCE yüklenir; oyunlar hiçbir şey bilmez, eskisi gibi localStorage'a yazar.
   - Girişliyse: sayfa açılırken buluttaki ilerleme yerel kayıtla "en iyisi kalır" kuralıyla birleştirilir, sonra oyun başlar.
   - Oyun bir kayıt yazınca (Storage.prototype.setItem) birkaç saniye içinde bulut da güncellenir (yine birleştirerek).
   - Giriş yoksa ya da Firebase yüklenemezse (internet yok vb.) oyun en geç 4 sn sonra yerel kayıtla başlar; hiçbir şey kaybolmaz.
   Bulut yapısı: oyuncular/{uid} = { kul, ad, d: {anahtar: değer}, dt: {anahtar: ms}, son: {o: oyun, t: zaman}, t }  ·  akis/{id} = { uid, o, k, v, t }
   KALDIRMAK İÇİN: sayfalardaki <script src="hesap.js"> satırı silinir, Hesap.oyun([...]) çağrısı yerine scriptler normal eklenir. */
(function () {
  "use strict";
  var CFG = { apiKey: "AIzaSyBVi410cTJGQIUtIxS7vf1737joQn47f9Q", authDomain: "queen-games-2ecc4.firebaseapp.com", projectId: "queen-games-2ecc4", appId: "1:536657592005:web:5983f916df8028ec54baac" };
  var SDK = "https://www.gstatic.com/firebasejs/12.17.1/", ALAN = "@queengames.app";
  var ADLAR = { bus: "Büşra", yec: "Yec" };                       /* kullanıcı adı → görünen ad */
  var ZAMAN_ASIMI = 4000, DEBOUNCE = 1800, NABIZ = 90000;

  /* ---- eşitlenen anahtarlar ve birleştirme kuralı ----
     max: sayısal, büyük olan · flag: "1" olan kazanır · new: son yazılan · min: küçük olan (tarih)
     stars/best: bölüm başına dizi (yıldız: eleman eleman büyük; süre: eleman eleman küçük) · gun: aynı günse büyük sayı */
  var K = {
    kb_max: "max", kb_lvl: "max", kb_bonus: "max", kb_rozet: "max", kb_hint: "max", kb_done: "flag", kb_end: "flag", kb_new31: "flag", kb_wait: "flag", kb_intro: "flag", kb_state: "new",
    ok_max: "max", ok_lvl: "max", ok_hint: "max", ok_intro: "flag", ok_stars: "stars", ok_best: "best", ok_gun: "gun", ok_state: "new",
    pm_best: "max", pm_sufle: "max", pm_muffin2: "flag", pm_tost2: "flag", pm_kalp1: "flag", pm_hediye1: "flag",
    sef_best: "max", sef_oda: "new", fatih_best: "max",
    fark2_best: "min", fark2_done: "flag", fark2_state: "new", fark3_best: "min", fark3_done: "flag", fark3_state: "new", fark1_intro: "flag",
    gk_start: "min", gk_stat: "new", gk_help: "flag", qg_last: "new"
  };
  function kural(k) { return K[k] || (k.indexOf("gk_d") === 0 ? "new" : null); }   /* gk_d2026-10-19: o günün kelime kaydı */

  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function lsj(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }
  function num(v) { var n = parseFloat(v); return isNaN(n) ? 0 : n; }
  function arr(v) { try { var a = JSON.parse(v); return a instanceof Array ? a : []; } catch (e) { return []; } }
  function now() { return Date.now(); }

  /* iki değeri kurala göre birleştir; ta/tb: yazılma zamanları */
  function birlestir(k, a, ta, b, tb) {
    if (a === null || a === undefined) return b; if (b === null || b === undefined) return a;
    var r = kural(k), i, n, o;
    if (r === "max") return num(b) > num(a) ? b : a;
    if (r === "min") { if (k === "gk_start") return b < a ? b : a; var na = num(a), nb = num(b); return nb > 0 && (na === 0 || nb < na) ? b : a; }
    if (r === "flag") return a === "1" || b === "1" ? "1" : (tb > ta ? b : a);
    if (r === "stars") { var A = arr(a), B = arr(b), n1 = Math.max(A.length, B.length); o = []; for (i = 0; i < n1; i++) o[i] = Math.max(num(A[i]), num(B[i])); return JSON.stringify(o); }
    if (r === "best") { var C = arr(a), D = arr(b), n2 = Math.max(C.length, D.length); o = []; for (i = 0; i < n2; i++) { var x = num(C[i]), y = num(D[i]); o[i] = x > 0 && y > 0 ? Math.min(x, y) : (x || y || 0); } return JSON.stringify(o); }
    if (r === "gun") { try { var g1 = JSON.parse(a), g2 = JSON.parse(b); if (g1 && g2 && g1.d === g2.d) return JSON.stringify({ d: g1.d, n: Math.max(num(g1.n), num(g2.n)) }); if (g1 && g2) return g1.d > g2.d ? a : b; } catch (e) {} return tb > ta ? b : a; }
    return tb > ta ? b : a;                                        /* new */
  }

  /* ---- yerel kayıtların zaman damgası (anahtar → ms); oyunlar yazdıkça güncellenir ---- */
  var T = lsj("hs_t") || {}, dirty = false, dirtyT = 0;
  function damga(k) { T[k] = now(); dirty = true; dirtyT = T[k]; ls("hs_t", JSON.stringify(T)); planla(); }
  try {
    var P = Storage.prototype, _set = P.setItem, _rem = P.removeItem;
    P.setItem = function (k, v) { _set.apply(this, arguments); if (this === localStorage && kural(k) && !sessiz) damga(k); };
    P.removeItem = function (k) { _rem.apply(this, arguments); if (this === localStorage && kural(k) && !sessiz) damga(k); };
  } catch (e) {}
  var sessiz = false;                                              /* buluttan yazarken damga vurma */

  /* ---- yerel anlık görüntü ---- */
  function yerel() { var d = {}, dt = {}, i, k; try { for (i = 0; i < localStorage.length; i++) { k = localStorage.key(i); if (kural(k)) { d[k] = localStorage.getItem(k); dt[k] = T[k] || 0; } } } catch (e) {} return { d: d, dt: dt }; }
  /* bulut + yerel → birleşik */
  function birles(cl, yr) {
    var d = {}, dt = {}, k, keys = {}, c = cl && cl.d || {}, ct = cl && cl.dt || {};
    for (k in c) keys[k] = 1; for (k in yr.d) keys[k] = 1;
    for (k in keys) {
      var v = birlestir(k, c[k], ct[k] || 0, yr.d[k], yr.dt[k] || 0);
      if (v === null || v === undefined) continue;
      d[k] = v; dt[k] = Math.max(ct[k] || 0, yr.dt[k] || 0) || now();
    }
    return { d: d, dt: dt };
  }
  function yerelYaz(m) {                                            /* birleşik veriyi localStorage'a uygula (damgasız) */
    sessiz = true;
    try { for (var k in m.d) { if (ls(k) !== m.d[k]) ls(k, m.d[k]); T[k] = m.dt[k]; } ls("hs_t", JSON.stringify(T)); } catch (e) {}
    sessiz = false;
  }
  function ayni(a, b) { var k; for (k in a) if (a[k] !== b[k]) return false; for (k in b) if (!(k in a)) return false; return true; }

  /* ---- Firebase ---- */
  var fb = null, auth = null, db = null, user = null, hazir = false, hazirCb = [], bulut = null, senk = false, sdkHata = false, oyunKodu = document.body.getAttribute("data-page") || "";
  var ipucu = lsj("hs_u");                                         /* son bilinen hesap (UI hemen gösterebilsin diye): {uid, kul, ad} */
  function script(src) { return new Promise(function (res, rej) { var s = document.createElement("script"); s.src = src; s.async = true; s.onload = res; s.onerror = function () { rej(new Error(src)); }; document.head.appendChild(s); }); }
  function sdkYukle() {
    if (window.firebase && firebase.firestore && firebase.auth) return Promise.resolve();
    return script(SDK + "firebase-app-compat.js").then(function () { return Promise.all([script(SDK + "firebase-auth-compat.js"), script(SDK + "firebase-firestore-compat.js")]); });
  }
  function kur() {
    if (fb) return fb;
    fb = firebase.apps && firebase.apps.length ? firebase.app() : firebase.initializeApp(CFG);
    auth = firebase.auth(); db = firebase.firestore();
    try { db.settings({ experimentalAutoDetectLongPolling: true, merge: true }); } catch (e) {}   /* kısıtlı ağlarda (uygulama içi tarayıcı) canlı bağlantı için */
    try { auth.languageCode = "tr"; } catch (e) {}
    return fb;
  }
  function tms(t) { return t && typeof t.toMillis === "function" ? t.toMillis() : (typeof t === "number" ? t : 0); }
  function kulAdi(u) { return u && u.email ? u.email.split("@")[0] : ""; }
  function gorunenAd(kul) { return ADLAR[kul] || (kul ? kul.charAt(0).toUpperCase() + kul.slice(1) : ""); }

  /* girişte: bulut dokümanını çek, yerelle birleştir, ikisine de yaz */
  function temizle() { sessiz = true; try { var sil = [], i; for (i = 0; i < localStorage.length; i++) if (kural(localStorage.key(i))) sil.push(localStorage.key(i)); sil.forEach(function (k) { localStorage.removeItem(k); }); } catch (e) {} T = {}; ls("hs_t", null); sessiz = false; }
  function esitle() {
    var son = ls("hs_last");                                       /* bu cihaz daha önce başka hesaba bağlandıysa, o hesabın yerel kayıtları karışmasın */
    if (son && son !== user.uid) temizle();
    var ref = db.collection("oyuncular").doc(user.uid), yr = yerel(), ilk = false;
    return ref.get().then(function (snap) {
      var cl = snap.exists ? snap.data() : null; ilk = !cl;
      var m = birles(cl, yr);
      yerelYaz(m); bulut = m;
      var degisti = !cl || !ayni(cl.d || {}, m.d);
      ls("hs_last", user.uid);
      var p = degisti ? ref.set({ kul: kulAdi(user), ad: gorunenAd(kulAdi(user)), d: m.d, dt: m.dt, t: firebase.firestore.FieldValue.serverTimestamp(), son: { o: oyunKodu, t: firebase.firestore.FieldValue.serverTimestamp() } }, { merge: true }).then(function () { if (ilk) return olay("hesap", "ilk", 0); }) : nabiz();
      return p.then(function () { senk = true; });
    }).catch(function (e) { if (!bulut) setTimeout(function () { if (user && !bulut) esitle().then(bitti, bitti); }, 8000); throw e; });
  }
  var planT = 0;
  function planla() { if (!user || !db) return; clearTimeout(planT); planT = setTimeout(gonder, DEBOUNCE); }
  var gonderiyor = false;
  function gonder() {
    if (!user || !db || !bulut || gonderiyor) { if (gonderiyor || (user && !bulut)) planla(); return; }
    var yr = yerel(), onceki = bulut ? bulut.d : {};
    var m = birles(bulut, yr);
    if (ayni(m.d, onceki)) { dirty = false; return; }
    gonderiyor = true; dirty = false;
    var ref = db.collection("oyuncular").doc(user.uid), son = null;
    db.runTransaction(function (tx) {
      return tx.get(ref).then(function (snap) {
        var cl = snap.exists ? snap.data() : null; son = birles(cl, yerel());
        tx.set(ref, { d: son.d, dt: son.dt, t: firebase.firestore.FieldValue.serverTimestamp(), son: { o: oyunKodu, t: firebase.firestore.FieldValue.serverTimestamp() } }, { merge: true });
      });
    }).then(function () { olaylar(onceki, son.d); yerelYaz(son); bulut = son; gonderiyor = false; if (dirty) planla(); })
      .catch(function () { gonderiyor = false; dirty = true; setTimeout(planla, 5000); });
  }
  function nabiz() {                                                /* "şu an oynuyor": hangi sayfada, ne zaman */
    if (!user || !db || document.hidden) return Promise.resolve();
    return db.collection("oyuncular").doc(user.uid).set({ son: { o: oyunKodu, t: firebase.firestore.FieldValue.serverTimestamp() } }, { merge: true }).catch(function () {});
  }
  /* akış: iki anlık görüntü arasındaki farktan olaylar */
  function olay(o, k, v) { if (!user || !db) return Promise.resolve(); return db.collection("akis").add({ uid: user.uid, o: o, k: k, v: v, t: firebase.firestore.FieldValue.serverTimestamp() }).catch(function () {}); }
  function olaylar(a, b) {
    function artti(k) { return num(b[k]) > num(a[k]); }
    if (artti("ok_max")) { var st = arr(b.ok_stars), L = num(b.ok_max); olay("ok", "bolum", L * 10 + Math.min(3, num(st[L - 1]))); }     /* v: bölüm*10 + yıldız */
    if (artti("kb_max")) olay("kelime", "bolum", num(b.kb_max));
    if (artti("kb_rozet")) olay("kelime", "rozet", num(b.kb_rozet));
    if (artti("pm_best")) olay("kase", "rekor", num(b.pm_best));
    if (artti("pm_sufle")) olay("kase", "sufle", num(b.pm_sufle));
    ["pm_muffin2", "pm_tost2", "pm_kalp1"].forEach(function (k) { if (b[k] === "1" && a[k] !== "1") olay("kase", k, 1); });
    if (artti("fatih_best")) olay("tur", "rekor", num(b.fatih_best));
    if (artti("sef_best")) olay("plan", "rekor", num(b.sef_best));
    if (b.fark2_done === "1" && a.fark2_done !== "1") olay("fark", "bitti", 1);
    if (b.fark3_done === "1" && a.fark3_done !== "1") olay("fark", "bitti", 2);
    for (var k in b) if (k.indexOf("gk_d") === 0 && b[k] !== a[k]) { try { var g = JSON.parse(b[k]), g0 = a[k] ? JSON.parse(a[k]) : null; if (g && g.s !== "p" && (!g0 || g0.s === "p")) olay("gunun", g.s === "w" ? "buldu" : "bulamadi", g.g ? g.g.length : 0); } catch (e) {} }
  }

  /* ---- başlat ---- */
  var baslaT = now();
  function bitti() { if (hazir) return; hazir = true; hazirCb.forEach(function (f) { try { f(); } catch (e) {} }); hazirCb = []; }
  function hazirOl(f) { if (hazir) f(); else hazirCb.push(f); }
  setTimeout(bitti, ZAMAN_ASIMI);                                   /* en geç 4 sn: oyun yerel kayıtla başlar, bulut sonra gelirse yine birleşir */
  function baglan() { if (baglandi) return; baglandi = true; sdkYukle().then(function () {
    kur();
    auth.onAuthStateChanged(function (u) {
      user = u;
      if (!u) { bulut = null; senk = false; ls("hs_u", null); ipucu = null; bitti(); durum(); return; }
      ipucu = { uid: u.uid, kul: kulAdi(u), ad: gorunenAd(kulAdi(u)) }; ls("hs_u", JSON.stringify(ipucu)); durum();
      esitle().then(bitti, bitti);
    });
  }).catch(function () { sdkHata = true; bitti(); durum(); }); }
  var baglandi = false;
  if (ipucu || document.body.getAttribute("data-page") === "giris") baglan(); else bitti();   /* hiç giriş yapılmamış cihazda Firebase hiç yüklenmez */
  setInterval(function () { if (dirty) planla(); if (user && !document.hidden) nabiz(); }, NABIZ);
  function flush() { if (dirty && user && db) { clearTimeout(planT); gonder(); } }
  addEventListener("pagehide", flush); document.addEventListener("visibilitychange", function () { if (document.hidden) flush(); });

  /* ---- UI yardımcıları (menü, giriş, tablo sayfaları kullanır) ---- */
  var durumCb = [];
  function durum() { durumCb.forEach(function (f) { try { f(Hesap.kim()); } catch (e) {} }); }
  var Hesap = window.Hesap = {
    kim: function () { return user ? { uid: user.uid, kul: kulAdi(user), ad: gorunenAd(kulAdi(user)), kesin: true } : (ipucu && !hazir && !sdkHata ? { uid: ipucu.uid, kul: ipucu.kul, ad: ipucu.ad, kesin: false } : null); },
    izle: function (f) { durumCb.push(f); f(Hesap.kim()); },
    hazir: hazirOl,
    adlar: ADLAR, gorunenAd: gorunenAd,
    /* oyun scriptlerini eşitleme bitince (ya da zaman aşımında) sırayla yükle */
    oyun: function (list) { hazirOl(function () { (function sira(i) { if (i >= list.length) return; var s = document.createElement("script"); s.src = list[i]; s.onload = s.onerror = function () { sira(i + 1); }; document.body.appendChild(s); })(0); }); },
    /* kullanıcı adı + şifre ile giriş; kullanıcı adı: büş/bus/yec… (Türkçe harfler sadeleşir) */
    giris: function (kul, sifre) {
      var k = String(kul || "").trim().toLowerCase().replace(/ü/g, "u").replace(/ş/g, "s").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c").replace(/ğ/g, "g").replace(/i̇/g, "i").replace(/[^a-z0-9.]/g, "");
      if (!k) return Promise.reject({ code: "bos" });
      baglan();
      return sdkYukle().then(function () { kur(); return auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function () {}); })
        .then(function () { return auth.signInWithEmailAndPassword(k + ALAN, sifre); })
        .then(function () { return new Promise(function (res) { var t0 = now(); var iv = setInterval(function () { if (senk || now() - t0 > 8000) { clearInterval(iv); res(); } }, 100); }); });
    },
    cikis: function () { flush(); baglan(); return sdkYukle().then(function () { kur(); return auth.signOut(); }).then(function () { ls("hs_u", null); ipucu = null; }); },
    db: function () { baglan(); return sdkYukle().then(function () { kur(); return db; }); },
    fb: function () { baglan(); return sdkYukle().then(function () { kur(); return firebase; }); },
    tms: tms, kural: kural, birlestir: birlestir, birles: birles, yerel: yerel,
    senk: function () { return senk; },
    _test: function () { return { hazir: hazir, user: !!user, bulut: bulut, dirty: dirty, sdkHata: sdkHata, senk: senk }; }
  };
})();
