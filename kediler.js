/* Mahalle Kedileri – menüye haftada 2–3 gün, habersiz bir sokak kedisi uğrar (sadece Büş'ün menüsünde).
   Kedi boş kabına yürür, koklar, oturup "miyav?" der; "Mama koy"a dokununca mama dökülür, kedi yer ve yürüyüp gider.
   Her dokunuş gerçek bir öğünün sözüdür: kediler/{gYYYYMMDD} = { durum: "bekliyor", isteyen, istendi, gun }.
   Yunus gerçekten bir sokak kedisini besleyince "Besledim" der (fotoğraf, ad, yer isteğe bağlı) → durum "doydu".
   Büş menüyü açınca o kedinin kartı (fotoğrafıyla) çıkar, kedi albüme eklenir. Fotoğraflar ayrı: kedifoto/{id} = { v: dataURL }. */
(function () {
  "use strict";
  var kart = document.getElementById("toKediler");
  if (!kart || !window.Hesap) return;

  var AYLAR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  var db = null, ben = null, benKul = "", kayit = [], basladi = false, fotolar = {}, ziyaretBasladi = false, kartAcik = false, gosterilen = {};
  var azalt = false; try { azalt = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ms(t) { if (!t) return 0; if (typeof t === "number") return t; if (typeof t.toMillis === "function") return t.toMillis(); return 0; }
  function iki(n) { return (n < 10 ? "0" : "") + n; }
  function gunAdi(t) { var d = new Date(t), a = new Date(t), b = new Date(); a.setHours(0, 0, 0, 0); b.setHours(0, 0, 0, 0); var f = Math.round((a - b) / 86400000); return f === 0 ? "bugün" : f === -1 ? "dün" : d.getDate() + " " + AYLAR[d.getMonth()]; }
  function gunKodu(d) { return d.getFullYear() + "-" + iki(d.getMonth() + 1) + "-" + iki(d.getDate()); }
  function bekle(ms_, f) { return setTimeout(f, azalt ? Math.min(ms_, 60) : ms_); }
  function tost(t) {
    var el = $("nkTost"); if (!el) { el = document.createElement("div"); el.id = "nkTost"; el.className = "nktost"; el.setAttribute("role", "status"); document.body.appendChild(el); }
    el.textContent = t; el.classList.add("on"); clearTimeout(tost.z); tost.z = setTimeout(function () { el.classList.remove("on"); }, 3200);
  }

  /* ---------- hangi günler uğrar: her hafta 2 ya da 3 gün (haftaya göre sabit, iki telefonda da aynı) ---------- */
  function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function gunNo(t) { var d = new Date(t); return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) / 86400000); }
  function haftaGunleri(h) {
    var r = rng(h * 7919 + 2411), n = r() < 0.5 ? 2 : 3, g = [0, 1, 2, 3, 4, 5, 6];
    for (var i = g.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), x = g[i]; g[i] = g[j]; g[j] = x; }
    return g.slice(0, n).sort();
  }
  function ziyaretGunuMu(t) { var gn = gunNo(t), h = Math.floor((gn + 3) / 7), hg = (gn + 3) % 7; return haftaGunleri(h).indexOf(hg) >= 0; }   /* hg: 0 = pazartesi */

  /* ---------- çizimler ---------- */
  var RENK = { k: "#f2a65a", ko: "#e8964a", c: "#d9853a", a: "#ffe2c4", g: "#3a2410", p: "#ffb3c7" };
  var YURUYEN = '<svg viewBox="0 0 120 90" class="kdsvg">' +
    '<g class="kdkuyruk"><path d="M86 50c14-2 22-14 20-28" stroke="' + RENK.ko + '" stroke-width="7" fill="none" stroke-linecap="round"/></g>' +
    '<g class="kdbacak b2"><rect x="78" y="56" width="8" height="28" rx="4" fill="' + RENK.ko + '"/></g><g class="kdbacak b1"><rect x="40" y="56" width="8" height="28" rx="4" fill="' + RENK.ko + '"/></g>' +
    '<g class="kdgovde"><path d="M34 52c0-12 10-18 26-18h16c10 0 16 7 16 16s-6 16-16 16H48c-8 0-14-6-14-14z" fill="' + RENK.k + '"/>' +
    '<path d="M58 36l3 9M66 35l2 9M74 35l1 9" stroke="' + RENK.c + '" stroke-width="3" stroke-linecap="round"/><path d="M46 62c8 4 22 4 30 0" stroke="' + RENK.a + '" stroke-width="6" stroke-linecap="round" fill="none"/></g>' +
    '<g class="kdbacak b1"><rect x="72" y="58" width="8" height="27" rx="4" fill="' + RENK.k + '"/><ellipse cx="76" cy="84" rx="5" ry="2.6" fill="' + RENK.a + '"/></g>' +
    '<g class="kdbacak b2"><rect x="34" y="58" width="8" height="27" rx="4" fill="' + RENK.k + '"/><ellipse cx="38" cy="84" rx="5" ry="2.6" fill="' + RENK.a + '"/></g>' +
    '<g class="kdyanbas"><path d="M14 22l2-15 11 9zM34 16l7-12 4 15z" fill="' + RENK.k + '"/><path d="M17 19l1-8 6 5zM36 15l4-7 2 9z" fill="' + RENK.p + '"/>' +
    '<ellipse cx="28" cy="32" rx="19" ry="16" fill="' + RENK.k + '"/><path d="M24 17l1 6M30 16v6" stroke="' + RENK.c + '" stroke-width="2.6" stroke-linecap="round"/>' +
    '<g class="kdgoz"><ellipse cx="20" cy="31" rx="3" ry="3.8" fill="' + RENK.g + '"/><ellipse cx="33" cy="31" rx="3" ry="3.8" fill="' + RENK.g + '"/><circle cx="21" cy="29.6" r="1" fill="#fff"/><circle cx="34" cy="29.6" r="1" fill="#fff"/></g>' +
    '<path d="M25 36h4l-2 2.4z" fill="#ff8fb3"/><path d="M27 38.4q-2.6 3-5 .6M27 38.4q2.6 3 5 .6" stroke="' + RENK.g + '" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
    '<circle cx="15" cy="38" r="3" fill="#ff8fb0" opacity=".5"/><circle cx="38" cy="38" r="3" fill="#ff8fb0" opacity=".5"/></g></svg>';
  var OTURAN = '<svg viewBox="0 0 120 110" class="kdsvg">' +
    '<g class="kdkuyruk2"><path d="M80 98c18 2 24-10 20-22" stroke="' + RENK.ko + '" stroke-width="8" fill="none" stroke-linecap="round"/></g>' +
    '<g class="kdnefes"><path d="M36 100c-4-24 6-44 24-44s28 20 24 44z" fill="' + RENK.k + '"/><ellipse cx="60" cy="84" rx="12" ry="16" fill="' + RENK.a + '"/></g>' +
    '<ellipse cx="50" cy="100" rx="7" ry="4.4" fill="' + RENK.a + '"/><ellipse cx="70" cy="100" rx="7" ry="4.4" fill="' + RENK.a + '"/>' +
    '<g class="kdbas"><g class="kdkulak"><path d="M34 34l3-24 18 14z" fill="' + RENK.k + '"/><path d="M38 29l2-13 10 8z" fill="' + RENK.p + '"/></g>' +
    '<path d="M86 34l-3-24-18 14z" fill="' + RENK.k + '"/><path d="M82 29l-2-13-10 8z" fill="' + RENK.p + '"/>' +
    '<ellipse cx="60" cy="42" rx="28" ry="23" fill="' + RENK.k + '"/><path d="M53 20l2 8M60 19v9M67 20l-2 8" stroke="' + RENK.c + '" stroke-width="3" stroke-linecap="round"/>' +
    '<g class="kdgoz acik"><ellipse cx="49" cy="41" rx="4" ry="5" fill="' + RENK.g + '"/><ellipse cx="71" cy="41" rx="4" ry="5" fill="' + RENK.g + '"/><circle cx="50.4" cy="39.2" r="1.4" fill="#fff"/><circle cx="72.4" cy="39.2" r="1.4" fill="#fff"/></g>' +
    '<g class="kdgoz mutlu"><path d="M45 42q4-5 8 0M67 42q4-5 8 0" stroke="' + RENK.g + '" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>' +
    '<path d="M57 48h6l-3 3.2z" fill="#ff8fb3"/><path d="M60 51q-3.6 4.4-7.4 1M60 51q3.6 4.4 7.4 1" stroke="' + RENK.g + '" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
    '<path class="kddil" d="M58 53.5q2 4 4 0z" fill="#ff7a9c"/>' +
    '<path d="M40 49l-12-2M40 53l-11 3M80 49l12-2M80 53l11 3" stroke="#7a4a20" stroke-width="1.3" stroke-linecap="round" opacity=".6"/>' +
    '<circle cx="42" cy="51" r="4" fill="#ff8fb0" opacity=".5"/><circle cx="78" cy="51" r="4" fill="#ff8fb0" opacity=".5"/></g></svg>';
  var KAP = '<svg viewBox="0 0 70 40" class="kdsvg"><ellipse cx="35" cy="37" rx="28" ry="3" fill="#000" opacity=".1"/>' +
    '<path d="M8 18h54l-6 16a4 4 0 0 1-4 3H18a4 4 0 0 1-4-3z" fill="#8ec9f5"/><ellipse cx="35" cy="18" rx="27" ry="6" fill="#6fb2e6"/><ellipse cx="35" cy="18" rx="22" ry="4" fill="#4f93c9"/>' +
    '<g class="kdmama"><ellipse cx="35" cy="16.5" rx="19" ry="4.6" fill="#b8763a"/><circle cx="29" cy="15" r="1.6" fill="#d39556"/><circle cx="39" cy="16" r="1.4" fill="#d39556"/><circle cx="34" cy="14.4" r="1.2" fill="#d39556"/></g>' +
    '<path d="M28 27c3-3 8-3 11 0-3 3-8 3-11 0zM39 27l4-3v6z" fill="#fff" opacity=".9"/></svg>';
  function oturanResim(cls) { return '<span class="kdillus ' + (cls || "") + '">' + OTURAN + "</span>"; }

  /* ---------- menüdeki ziyaret sahnesi ---------- */
  function bugunId() { return "g" + gunKodu(new Date()).replace(/-/g, ""); }
  function ziyaretVarMi() {
    if (benKul !== "bus" && !/kedi/.test(location.hash)) return false;
    if (!/kedi/.test(location.hash) && !ziyaretGunuMu(Date.now())) return false;
    return !kayit.some(function (k) { return k.id === bugunId(); });
  }
  function ekranBos() { return !$("qmAcilis") && !document.querySelector(".nkkartov") && !document.querySelector(".gkover:not([hidden])"); }
  function ziyaretBaslat() {
    if (ziyaretBasladi || !ziyaretVarMi()) return;
    if (!ekranBos()) { setTimeout(ziyaretBaslat, 700); return; }
    ziyaretBasladi = true;
    var s = document.createElement("div"); s.className = "kdsahne"; s.setAttribute("aria-live", "polite");
    s.innerHTML = '<div class="kdkap">' + KAP + '<i class="kdtane t1"></i><i class="kdtane t2"></i><i class="kdtane t3"></i><i class="kdtane t4"></i><i class="kdtane t5"></i><i class="kdtane t6"></i><i class="kdtane t7"></i></div>' +
      '<div class="kdyuru"><div class="kdyon">' + YURUYEN + "</div></div>" +
      '<div class="kdotur" role="button" tabindex="0" aria-label="Kedi">' + OTURAN + "</div>" +
      '<span class="kdbalon" aria-hidden="true">miyav?</span>' +
      '<button type="button" class="kdmamabtn">🐟 Mama koy</button>' +
      '<span class="kdkalpler" aria-hidden="true"><i>♥</i><i>♥</i><i>♥</i><i>♥</i></span><span class="kdnom" aria-hidden="true"><i>nom</i><i>nom</i><i>nom</i></span>';
    document.body.appendChild(s);
    var balon = s.querySelector(".kdbalon"), btn = s.querySelector(".kdmamabtn"), otur = s.querySelector(".kdotur"), bitti = false, balonT = 0;
    function durum(c) { s.className = "kdsahne " + c; }
    function balonDe(t, sure) { balon.textContent = t; balon.classList.remove("on"); void balon.offsetWidth; balon.classList.add("on"); clearTimeout(balonT); if (sure) balonT = setTimeout(function () { balon.classList.remove("on"); }, sure); }
    /* 1) boş kap konur, 2) kedi sağdan yürüyerek gelir, 3) kabı koklar, 4) oturup bakar */
    durum("kap");
    bekle(650, function () { durum("kap yuru"); });
    bekle(650 + 2700, function () { durum("kap koklar"); });
    bekle(650 + 2700 + 1100, function () {
      durum("kap otur"); balonDe("miyav?");
      bekle(900, function () { if (!bitti) s.classList.add("btnacik"); });
      /* bekledikçe ara ara tekrar miyavlar */
      var tekrar = setInterval(function () { if (bitti || !s.parentNode) { clearInterval(tekrar); return; } balonDe(Math.random() < 0.5 ? "miyav?" : "mrr?", 2600); }, 7000);
    });
    otur.onclick = function () { if (bitti || !/otur/.test(s.className)) return; balonDe("miyav!", 1800); s.classList.remove("selam"); void s.offsetWidth; s.classList.add("selam"); btn.classList.add("nabiz"); };
    btn.onclick = function () {
      if (bitti) return; bitti = true; s.classList.remove("btnacik"); balon.classList.remove("on");
      mamaSozu();
      /* mama dökülür → kedi yer → mırlar → yürüyüp gider */
      durum("kap otur dok");
      bekle(1050, function () { durum("kap otur dolu yer"); });
      bekle(1050 + 2600, function () { durum("kap otur dolu bitti mutlu"); balonDe("mırr 💕", 2600); });
      bekle(1050 + 2600 + 1400, function () {
        var t = document.createElement("div"); t.className = "kdtost"; t.innerHTML = "<b>Afiyet olsun! 🐟</b><span>Bu mama boşa gitmeyecek…</span>";
        s.appendChild(t); void t.offsetWidth; t.classList.add("on");
        bekle(3600, function () { t.classList.remove("on"); });
      });
      bekle(1050 + 2600 + 4400, function () { durum("kap gider bitti"); });
      bekle(1050 + 2600 + 4400 + 2600, function () { s.classList.add("kaybol"); bekle(600, function () { if (s.parentNode) s.parentNode.removeChild(s); }); });
    };
  }
  function mamaSozu() {
    var id = bugunId(), ref = db.collection("kediler").doc(id);
    ref.get().then(function (sn) {
      if (sn.exists) return;
      return ref.set({ durum: "bekliyor", isteyen: ben, istendi: firebase.firestore.FieldValue.serverTimestamp(), gun: gunKodu(new Date()) });
    }).catch(function () {});
  }

  /* ---------- fotoğraf ---------- */
  function fotoAl(id) {
    if (fotolar[id] !== undefined) return Promise.resolve(fotolar[id]);
    return db.collection("kedifoto").doc(id).get().then(function (sn) { fotolar[id] = sn.exists ? (sn.data().v || "") : ""; return fotolar[id]; }, function () { return ""; });
  }
  function kucult(file, cb) {
    var url = URL.createObjectURL(file), img = new Image();
    img.onload = function () {
      var M = 1000, w = img.naturalWidth, h = img.naturalHeight, k = Math.min(1, M / Math.max(w, h)), c = document.createElement("canvas");
      c.width = Math.round(w * k); c.height = Math.round(h * k); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      var q = 0.74, d = c.toDataURL("image/jpeg", q); while (d.length > 650000 && q > 0.35) { q -= 0.1; d = c.toDataURL("image/jpeg", q); }
      cb(d);
    };
    img.onerror = function () { URL.revokeObjectURL(url); cb(null); };
    img.src = url;
  }

  /* ---------- liste yardımcıları ---------- */
  function doyanlar() { return kayit.filter(function (k) { return k.durum === "doydu"; }).sort(function (a, b) { return (ms(a.doydu) || 0) - (ms(b.doydu) || 0); }); }
  function bekleyenler() { return kayit.filter(function (k) { return k.durum === "bekliyor"; }).sort(function (a, b) { return a.id < b.id ? -1 : 1; }); }
  function adOf(k) { var L = doyanlar(), i = L.indexOf(k); return k.ad ? k.ad : "№" + (i + 1); }
  function polaroid(k, buyuk) {
    var foto = k.foto ? '<img alt="" data-foto="' + esc(k.id) + '">' : oturanResim("kdbos");
    return '<figure class="kdpol' + (buyuk ? " buyuk" : "") + '" data-id="' + esc(k.id) + '"><span class="kdbant"></span><span class="kdcerceve">' + foto + "</span>" +
      '<figcaption><b>' + esc(adOf(k)) + "</b><small>" + esc(gunAdi(ms(k.doydu) || Date.now()) + (k.yer ? " · " + k.yer : "")) + "</small></figcaption></figure>";
  }
  function fotolariDoldur(kap) {
    [].forEach.call(kap.querySelectorAll("img[data-foto]"), function (im) {
      var id = im.getAttribute("data-foto");
      fotoAl(id).then(function (v) { if (v) { im.src = v; im.parentNode.classList.add("dolu"); } else { im.parentNode.innerHTML = oturanResim("kdbos"); } });
    });
  }

  /* ---------- Büş'e: bir kedi doydu kartı ---------- */
  function acilisSirasi() {
    if (kartAcik || benKul !== "bus") return;
    if (!ekranBos() || document.querySelector(".kdsahne")) { setTimeout(acilisSirasi, 800); return; }
    var k = doyanlar().filter(function (x) { return !x.gordu && !gosterilen[x.id]; })[0]; if (!k) return;
    gosterilen[k.id] = true; kartAcik = true;
    var bugun = gunAdi(ms(k.doydu) || Date.now()) === "bugün";
    var ov = document.createElement("div"); ov.className = "gkover nkov kdov";
    ov.innerHTML = '<div class="nk nk-kedi kdacilis" role="dialog" aria-label="Mahalle Kedileri">' +
      '<div class="nkduse" aria-hidden="true">' + [8, 22, 38, 56, 70, 86, 14, 62].map(function (x, i) { return '<i class="nkd" style="left:' + x + "%;animation-delay:" + (i * .7).toFixed(1) + "s;-webkit-animation-delay:" + (i * .7).toFixed(1) + "s;animation-duration:" + (7 + i % 3) + "s;-webkit-animation-duration:" + (7 + i % 3) + 's;color:' + ["#ff8fb3", "#ec6f9a", "#ffb3c7"][i % 3] + '">♥</i>'; }).join("") + "</div>" +
      '<p class="kdkick">Mahalle Kedileri 🐾</p>' + polaroid(k, true) +
      '<h2 class="kdbaslik">' + (bugun ? "Bugün bir sokak kedisi doydu" : "Bir sokak kedisi doydu") + "</h2>" +
      '<p class="nkalt">Dokunduğun mama ona gitti 🐟</p><button type="button" class="nkbtn">Tamam 🐾</button></div>';
    document.body.appendChild(ov); fotolariDoldur(ov);
    ov.querySelector(".nkbtn").onclick = function () {
      if (ov.parentNode) ov.parentNode.removeChild(ov); kartAcik = false;
      db.collection("kediler").doc(k.id).set({ gordu: true }, { merge: true }).catch(function () {});
      setTimeout(acilisSirasi, 400);
    };
  }

  /* ---------- menü kartı ---------- */
  function menuyuCiz() {
    var sub = $("kedilerSub"), rozet = $("kedilerBadge"), D = doyanlar(), B = bekleyenler();
    if (benKul === "bus") {
      kart.hidden = !D.length;                                           /* sürpriz: ilk kedi doyana kadar hiç görünmez */
      sub.textContent = D.length === 1 ? "Bir sokak kedisi doydu 🐾" : D.length + " sokak kedisi doydu 🐾";
      rozet.hidden = true; return;
    }
    kart.hidden = false;
    rozet.hidden = !B.length; rozet.textContent = "mama bekliyor";
    sub.textContent = B.length ? (B.length === 1 ? "🐟 Bir kedi mama bekliyor" : "🐟 " + B.length + " kedi mama bekliyor") + (D.length ? " · " + D.length + " kedi doydu" : "")
      : D.length ? D.length + " sokak kedisi doydu 🐾" : "Kedi uğrayıp mama isteyince burada belirir 🐟";
  }

  /* ---------- albüm ---------- */
  function albumAc() {
    var ov = $("kdAlbum");
    if (!ov) {
      ov = document.createElement("div"); ov.className = "gkover nkov"; ov.id = "kdAlbum"; ov.hidden = true;
      ov.innerHTML = '<div class="nkpanel kdpanel" role="dialog" aria-label="Mahalle Kedileri"><h2>Mahalle Kedileri 🐾</h2><div id="kdBekleyen"></div><div class="kdalbum" id="kdGrid"></div>' +
        '<button type="button" class="nkkapat" id="kdAlbumKapat">Kapat</button></div>';
      document.body.appendChild(ov);
      $("kdAlbumKapat").onclick = function () { ov.hidden = true; };
      ov.addEventListener("click", function (e) {
        var b = e.target.closest ? e.target.closest("[data-besle]") : null;
        if (b) { besleAc(b.getAttribute("data-besle")); return; }
        var f = e.target.closest ? e.target.closest(".kdalbum .kdpol") : null;
        if (f) { var k = kayit.filter(function (x) { return x.id === f.getAttribute("data-id"); })[0]; if (k) buyukAc(k); }
      });
    }
    albumCiz(); ov.hidden = false;
  }
  function albumCiz() {
    var g = $("kdGrid"); if (!g) return;
    var B = bekleyenler(), D = doyanlar().slice().reverse();
    $("kdBekleyen").innerHTML = benKul === "bus" || !B.length ? "" : '<div class="kdbek"><p class="kdbekbas">Mama bekleyenler 🐟</p>' + B.map(function (k) {
      var g2 = k.gun ? k.gun.split("-") : null, gun = g2 ? (+g2[2]) + " " + AYLAR[+g2[1] - 1] : "";
      return '<div class="kdbeksatir"><span class="kdbekico">' + oturanResim("kdmini") + '</span><span class="kdbektx"><b>Bir kedi mama bekliyor</b><small>' + esc(gun) + ' istendi</small></span><button type="button" class="kdbesle" data-besle="' + esc(k.id) + '">Besledim 📸</button></div>';
    }).join("") + "</div>";
    g.innerHTML = D.length ? D.map(function (k) { return polaroid(k, false); }).join("") :
      '<p class="nkbos">' + (benKul === "bus" ? "Henüz kimse doymadı." : "Henüz doyan yok. Bir kedi mama isteyip sen besleyince burada birikecekler 🐾") + "</p>";
    fotolariDoldur(g);
  }
  function buyukAc(k) {
    var ov = document.createElement("div"); ov.className = "gkover nkov kdov";
    var duzen = benKul !== "bus" && k.besleyen === ben;
    ov.innerHTML = '<div class="nk nk-kedi kdacilis" role="dialog">' + polaroid(k, true) +
      (duzen ? '<button type="button" class="kdduzen">Adı ya da yeri düzenle</button>' : "") + '<button type="button" class="nkbtn">Kapat</button></div>';
    document.body.appendChild(ov); fotolariDoldur(ov);
    ov.querySelector(".nkbtn").onclick = function () { ov.parentNode.removeChild(ov); };
    if (duzen) ov.querySelector(".kdduzen").onclick = function () { ov.parentNode.removeChild(ov); besleAc(k.id, true); };
  }

  /* ---------- Yunus: besledim (fotoğraf, ad, yer) ---------- */
  function besleAc(id, duzenle) {
    var k = kayit.filter(function (x) { return x.id === id; })[0]; if (!k) return;
    var secilen = null;
    var ov = document.createElement("div"); ov.className = "gkover nkov"; ov.id = "kdBesle";
    ov.innerHTML = '<div class="nkpanel" role="dialog" aria-label="Besledim"><h2>' + (duzenle ? "Kediyi düzenle 🐾" : "Bir kedi doydu mu? 🐾") + "</h2>" +
      '<label class="kdfotosec"><input type="file" accept="image/*" id="kdFotoIn" hidden><span class="kdfotoon" id="kdFotoOn">' + oturanResim("kdbos") + "<b>📸 Fotoğraf ekle</b></span></label>" +
      '<div class="nkbas">Adı (isteğe bağlı)</div><input type="text" class="nksaat kdin" id="kdAd" maxlength="30" placeholder="ör. Pamuk" value="' + esc(k.ad || "") + '">' +
      '<div class="nkbas">Nerede? (isteğe bağlı)</div><input type="text" class="nksaat kdin" id="kdYer" maxlength="40" placeholder="ör. Beylikdüzü sahil" value="' + esc(k.yer || "") + '">' +
      '<p class="nkuyari" id="kdUyari" role="alert"></p><div class="nkbtns"><button type="button" class="nkikinci" id="kdVazgec">Vazgeç</button><button type="button" class="nkana" id="kdKaydet">' + (duzenle ? "Kaydet" : "Besledim 🐟") + "</button></div></div>";
    document.body.appendChild(ov);
    if (k.foto) fotoAl(k.id).then(function (v) { if (v && !secilen) $("kdFotoOn").innerHTML = '<img alt="" src="' + v + '"><b>Değiştir</b>'; });
    $("kdFotoIn").onchange = function () {
      var f = this.files && this.files[0]; if (!f) return;
      $("kdFotoOn").innerHTML = "<b>Hazırlanıyor…</b>";
      kucult(f, function (d) { if (!d) { $("kdUyari").textContent = "Bu fotoğraf açılamadı, başka biri dene."; $("kdFotoOn").innerHTML = oturanResim("kdbos") + "<b>📸 Fotoğraf ekle</b>"; return; } secilen = d; $("kdFotoOn").innerHTML = '<img alt="" src="' + d + '"><b>Değiştir</b>'; });
    };
    $("kdVazgec").onclick = function () { ov.parentNode.removeChild(ov); };
    $("kdKaydet").onclick = function () {
      var b = this; b.disabled = true; b.textContent = "Kaydediliyor…";
      var ad = $("kdAd").value.trim().slice(0, 30), yer = $("kdYer").value.trim().slice(0, 40);
      var once = secilen ? db.collection("kedifoto").doc(id).set({ v: secilen, t: firebase.firestore.FieldValue.serverTimestamp() }) : Promise.resolve();
      once.then(function () {
        var upd = duzenle ? { ad: ad, yer: yer } : { durum: "doydu", besleyen: ben, doydu: firebase.firestore.FieldValue.serverTimestamp(), foto: !!secilen, ad: ad, yer: yer };
        if (duzenle && secilen) upd.foto = true;
        return db.collection("kediler").doc(id).set(upd, { merge: true });
      }).then(function () {
        if (secilen) fotolar[id] = secilen;
        ov.parentNode.removeChild(ov); tost(duzenle ? "Kaydedildi 🐾" : "Kaydedildi 🐾 Büşra menüyü açınca görecek.");
      }, function () { b.disabled = false; b.textContent = duzenle ? "Kaydet" : "Besledim 🐟"; $("kdUyari").textContent = "Kaydedilemedi; internet bağlantına bakıp tekrar dene."; });
    };
  }

  /* ---------- başlat ---------- */
  kart.onclick = function () { if (db) albumAc(); };
  Hesap.izle(function (k) {
    if (!k || !k.kesin || basladi) return; basladi = true;
    ben = k.uid; benKul = k.kul || "";
    Hesap.db().then(function (d) {
      db = d; var ilk = true;
      d.collection("kediler").onSnapshot(function (snap) {
        var L = []; snap.forEach(function (doc) { var x = doc.data(); x.id = doc.id; L.push(x); });
        kayit = L; menuyuCiz(); albumCiz(); acilisSirasi();
        if (ilk) { ilk = false; setTimeout(ziyaretBaslat, 900); }
      }, function () {});
    }).catch(function () {});
  });
  if (location.hash === "#test") window.__kd = { haftaGunleri: haftaGunleri, ziyaretGunuMu: ziyaretGunuMu, gunNo: gunNo };
})();
