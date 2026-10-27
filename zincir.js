/* Kelime Zinciri – iki kişilik (zincir/mac, zincir/seri). Ortak altyapı: duello.js. Zincirler: zincir-kelime.js
   mac = { n, v, a, b, baslayan, z: zincir no, gecmis: [son oynanan zincir no'ları], acik: [her kelimede açık harf sayısı], coz: ["-" | "" | uid | "x"], k: sıradaki kelime,
           puan: {uid: n}, sira: uid, son: { u, t: tahmin, d: doğru mu, k, p: puan } | null, bitti, sonuc "zincir"|"pes", kazanan, t }
   Kural: ilk kelime açık; sıradakinin yalnız ilk harfi görünür. Bilen kapalı harf sayısı kadar puan alır ve devam eder; bilemeyen (ya da pas diyen) kelimenin bir harfini açar, sıra geçer.
   Bütün harfleri açılan kelime kimseye puan vermeden geçilir. Zincir bitince puanı çok olan kazanır. */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  var Z = window.ZINCIRLER || [];
  function buyuk(s) { return String(s || "").toLocaleUpperCase("tr-TR").replace(/[^A-ZÇĞİÖŞÜ]/g, ""); }
  function harfler(w) { return Array.from ? Array.from(w) : w.split(""); }
  var D = window.Duello({
    kol: "zincir", sayfa: "zincir", sub: "sub", ses: "SdSes", helpKey: "zincir_help",
    startText: "Üstteki kelime açık; altındakiler onunla bir ikili kurar ama yalnız ilk harfleri görünür. Sırayla bilmeye çalışırız: bilen devam eder, bilemeyince bir harf açılır, sıra geçer.",
    yeniDoc: function (d, ME, OTHER) {
      var baslayan = d && d.baslayan ? (d.baslayan === ME ? OTHER : ME) : ME, gecmis = (d && d.gecmis) || [];
      var adaylar = []; for (var i = 0; i < Z.length; i++) if (gecmis.indexOf(i) < 0) adaylar.push(i);
      if (!adaylar.length) { adaylar = []; for (i = 0; i < Z.length; i++) if (i !== (d && d.z)) adaylar.push(i); gecmis = []; }
      var z = adaylar[Math.floor(Math.random() * adaylar.length)], zn = Z[z], acik = [], coz = [], puan = {};
      for (i = 0; i < zn.length; i++) { acik.push(i === 0 ? harfler(zn[i]).length : 1); coz.push(i === 0 ? "-" : ""); }
      puan[ME] = 0; puan[OTHER] = 0;
      return { a: ME, b: OTHER, baslayan: baslayan, z: z, gecmis: gecmis.concat([z]).slice(-Math.max(1, Z.length - 3)), acik: acik, coz: coz, k: 1, puan: puan, sira: baslayan, son: null };
    },
    onMac: function (d, ilk) { macGeldi(d, ilk); },
    onYok: function () { G = null; $("score").hidden = true; $("alan").hidden = true; $("klavye").hidden = true; $("bResign").hidden = true; },
    bitisGecikme: 900,
    bitis: function (d) {
      var ME = D.me, OTHER = D.other, ad = D.adlar[OTHER] || "Rakip", pm = (d.puan || {})[ME] || 0, po = (d.puan || {})[OTHER] || 0, kazandim = d.kazanan === ME;
      var baslik = d.sonuc === "pes" ? (kazandim ? ad + " pes etti — kazandın" : "Pes ettin") : !d.kazanan ? "Berabere! " + pm + "–" + po : kazandim ? "Zincir senin! " + pm + "–" + po : ad + " kazandı " + po + "–" + pm;
      var zn = Z[d.z] || [];
      return { kick: "Oyun " + d.n + " · zincir bitti", baslik: baslik, metin: zn.join(" → ") + ". Yeni oyunda ilk tahmin " + (d.baslayan === ME ? D.ekIn(ad) : "senin") + "." };
    },
    seriKod: function (d) { return d.sonuc === "pes" ? 99 : Math.min(98, ((d.puan || {})[d.kazanan] || 0)); }
  });
  var G = null, kaydirilan = "", yazilan = [], gonderiyor = false, sonGosterilen = "", ZN = [];
  function snd(n) { if (window.SdSes) try { window.SdSes.play(n); } catch (e) {} }
  function kelime(i) { return harfler(ZN[i] || ""); }
  function kapali(i) { return kelime(i).length - ((G.acik || [])[i] || 0); }
  function renk(uid) { var k = uid === D.me ? ((window.Hesap && Hesap.kim()) || {}).kul : D.kul[uid]; return k === "bus" ? "a" : "b"; }
  function siraBende() { return G && !G.bitti && G.sira === D.me && !gonderiyor; }

  /* ---- çizim ---- */
  function boyut() {
    var en = 1; ZN.forEach(function (w) { en = Math.max(en, harfler(w).length); });
    var w = Math.min($("alan").clientWidth || 360, 520) - 70, k = Math.floor(Math.min(42, Math.max(22, (w - (en - 1) * 4) / en)));
    document.documentElement.style.setProperty("--zc-k", k + "px");
  }
  function ciz() {
    if (!G) return;
    var ME = D.me, OTHER = D.other; $("score").hidden = false; $("alan").hidden = false;
    var html = "";
    ZN.forEach(function (w, i) {
      var L = kelime(i), ac = (G.acik || [])[i] || 0, kim = (G.coz || [])[i] || "", sinif = "zcsat", rozet = "";
      var cozuldu = i === 0 || kim === "x" || (kim && kim !== "-") || ac >= L.length;
      if (i === 0) sinif += " bas";
      else if (kim === "x") { sinif += " acildi"; rozet = '<i class="zcroz x">açıldı</i>'; }
      else if (kim) { sinif += " cozuldu " + renk(kim); rozet = '<i class="zcroz">' + (kim === ME ? "sen" : (D.adlar[kim] || "o")) + "</i>"; }
      else if (i === G.k && !G.bitti) sinif += " simdi" + (siraBende() ? " benim" : "");
      else sinif += " sonra";
      var kutular = L.map(function (h, j) {
        var g = cozuldu || j < ac, yaz = !g && i === G.k && !G.bitti && siraBende() ? yazilan[j - ac] : "";
        return '<span class="zch' + (g ? " acik" : yaz ? " yazi" : "") + (G.bitti && !g ? " bitis" : "") + '">' + (g ? h : yaz || (G.bitti ? h : "")) + "</span>";
      }).join("");
      html += (i ? '<div class="zcbag" aria-hidden="true"><i></i></div>' : "") + '<div class="' + sinif + '" data-i="' + i + '"><div class="zckel">' + kutular + "</div>" + rozet + "</div>";
    });
    var anahtar = html; if ($("zincir").getAttribute("data-h") !== anahtar) { $("zincir").innerHTML = html; $("zincir").setAttribute("data-h", anahtar); var cur = $("zincir").querySelector(".simdi"); if (cur && cur.scrollIntoView && kaydirilan !== G.n + ":" + G.k) try { kaydirilan = G.n + ":" + G.k; cur.scrollIntoView({ block: "nearest", behavior: "smooth" }); } catch (e) { cur.scrollIntoView(false); } }
    /* skor ve sıra */
    var pm = (G.puan || {})[ME] || 0, po = (G.puan || {})[OTHER] || 0;
    $("skorMe").textContent = pm; $("skorOther").textContent = po;
    if (G.bitti) { $("turnTxt").textContent = G.kazanan === ME ? "Kazandın" : G.kazanan ? "Kaybettin" : "Berabere"; $("turnSub").textContent = "zincir bitti"; }
    else if (G.sira === ME) { var kp = kapali(G.k); $("turnTxt").textContent = "Sıra sende"; $("turnSub").textContent = G.k + ". kelime · " + kp + " puan"; }
    else { $("turnTxt").textContent = "Sıra " + (D.adlar[OTHER] ? D.ekDe(D.adlar[OTHER]) : "onda"); $("turnSub").textContent = "bekliyorsun"; }
    $("turn").className = "hdturn" + (siraBende() ? " me" : " ot");
    $("pMe").className = "hdp" + (!G.bitti && G.sira === ME ? " on" : ""); $("pOther").className = "hdp" + (!G.bitti && G.sira === OTHER ? " on" : "");
    $("bResign").hidden = !!G.bitti;
    klavyeCiz();
  }
  function klavyeCiz() {
    var benim = siraBende(); $("klavye").hidden = !G || G.bitti;
    $("klavye").classList.toggle("kapali", !benim);
    var dolu = G && !G.bitti && yazilan.length >= kapali(G.k);
    $("bTahmin").disabled = !benim || !dolu; $("bPas").disabled = !benim; $("bSil").disabled = !benim || !yazilan.length;
    $("klavyeNot").textContent = !G || G.bitti ? "" : benim ? (yazilan.length ? "" : "Kelimeyi yaz, sonra Tahmin et") : (D.adlar[D.other] || "Rakip") + " düşünüyor…";
  }
  /* son hareket bildirimi */
  function sonGoster(ilk) {
    var s = G && G.son; if (!s) return; var k = G.n + ":" + s.u + ":" + s.k + ":" + s.t + ":" + s.d; if (k === sonGosterilen) return; sonGosterilen = k; if (ilk) return;
    var ben = s.u === D.me, ad = ben ? "Sen" : (D.adlar[s.u] || "Rakip");
    if (s.t === "") D.msg(ad + " pas dedi, bir harf açıldı.");
    else if (s.d) { D.msg((ben ? "Bildin! " : ad + " bildi: ") + s.t + " +" + s.p); if (!ben) snd("found"); }
    else { D.msg((ben ? "Olmadı" : ad + " " + s.t + " dedi, olmadı") + " — bir harf açıldı" + (ben ? ", sıra geçti." : ", sıra sende!")); if (!ben) snd("key"); }
    var sat = $("zincir").querySelector('[data-i="' + s.k + '"]');
    if (sat) { sat.classList.remove("titre", "parla"); void sat.offsetWidth; sat.classList.add(s.d ? "parla" : "titre"); }
  }
  function macGeldi(d, ilk) {
    var onceki = G; G = d; ZN = Z[d.z] || [];
    if (!onceki || onceki.n !== d.n || onceki.k !== d.k || onceki.sira !== d.sira) yazilan = [];
    boyut(); ciz(); sonGoster(ilk || !onceki || onceki.n !== d.n);
  }

  /* ---- yazma ---- */
  function bas(h) { if (!siraBende()) return; if (yazilan.length >= kapali(G.k)) return; yazilan.push(h); snd("key"); ciz(); }
  function sil() { if (!siraBende() || !yazilan.length) return; yazilan.pop(); ciz(); }
  var SATIRLAR = ["ERTYUIOPĞÜ", "ASDFGHJKLŞİ", "ZCVBNMÖÇ"];
  (function () {
    var kv = $("tuslar");
    SATIRLAR.forEach(function (sat, r) {
      var row = document.createElement("div"); row.className = "zcsira";
      harfler(sat).forEach(function (h) { var b = document.createElement("button"); b.type = "button"; b.className = "zct"; b.textContent = h; b.setAttribute("data-h", h); row.appendChild(b); });
      if (r === 2) { var s = document.createElement("button"); s.type = "button"; s.className = "zct sil"; s.id = "bSil"; s.setAttribute("aria-label", "Sil"); s.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11v12H9l-6-6z"/><path d="M12.5 9.5l5 5M17.5 9.5l-5 5"/></svg>'; row.appendChild(s); }
      kv.appendChild(row);
    });
    function tus(e) { var b = e.target.closest ? e.target.closest("button") : null; if (!b || b.disabled) return; e.preventDefault(); if (b.id === "bSil") sil(); else if (b.getAttribute("data-h")) bas(b.getAttribute("data-h")); }
    if (window.PointerEvent) kv.addEventListener("pointerdown", tus); else kv.addEventListener("click", tus);   /* basar basmaz: hızlı yazımda harf kaçmasın */
    addEventListener("keydown", function (e) {
      if (!G || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Backspace") { e.preventDefault(); sil(); return; }
      if (e.key === "Enter") { e.preventDefault(); tahmin(); return; }
      var h = buyuk(e.key); if (h.length === 1) bas(h);
    });
  })();
  $("bTahmin").onclick = function () { tahmin(); };
  $("bPas").onclick = function () { if (siraBende()) yaz(null); };
  function tahmin() {
    if (!siraBende() || yazilan.length < kapali(G.k)) return;
    var L = kelime(G.k), ac = G.acik[G.k], t = L.slice(0, ac).join("") + yazilan.join("");
    yaz(t);
  }
  /* tahmin ya da pas: işlemle yaz */
  function yaz(t) {
    var ME = D.me, OTHER = D.other, once = G; gonderiyor = true; klavyeCiz();
    var dogruMu = false, kazandiPuan = 0, bitirdi = false;
    D.db.runTransaction(function (tx) {
      return tx.get(D.ref).then(function (snap) {
        var d = snap.data(); if (!d || d.bitti || d.sira !== ME || d.v !== once.v) throw new Error("sira");
        var zn = Z[d.z], k = d.k, L = harfler(zn[k]), acik = d.acik.slice(), coz = d.coz.slice(), puan = { }; puan[d.a] = (d.puan || {})[d.a] || 0; puan[d.b] = (d.puan || {})[d.b] || 0;
        var dogru = t !== null && buyuk(t) === buyuk(zn[k]), sira = ME, son = { u: ME, t: t === null ? "" : buyuk(t), d: dogru, k: k, p: 0 };
        if (dogru) { var p = Math.max(1, L.length - acik[k]); puan[ME] += p; son.p = p; acik[k] = L.length; coz[k] = ME; k++; dogruMu = true; kazandiPuan = p; }
        else { acik[k] = Math.min(L.length, acik[k] + 1); sira = OTHER; if (acik[k] >= L.length) { coz[k] = "x"; k++; } }
        var upd = { acik: acik, coz: coz, k: k, puan: puan, sira: sira, son: son, v: d.v + 1, t: firebase.firestore.FieldValue.serverTimestamp() };
        if (k >= zn.length) { upd.bitti = true; upd.sonuc = "zincir"; upd.sira = ""; upd.kazanan = puan[ME] > puan[OTHER] ? ME : puan[OTHER] > puan[ME] ? OTHER : null; bitirdi = true; }
        tx.set(D.ref, upd, { merge: true });
      });
    }).then(function () { gonderiyor = false; yazilan = []; if (bitirdi) D.bitirenBenim = true; snd(dogruMu ? "found" : "lock"); if (G) ciz(); })
      .catch(function (e) { gonderiyor = false; klavyeCiz(); D.msg(String(e && e.message) === "sira" ? "Sıra sende değil ya da zincir değişti." : "Bağlantı kurulamadı, tekrar dene."); });
  }
  $("bResign").onclick = function () { if (!G || G.bitti) return; $("confirm").hidden = false; };
  $("confirmNo").onclick = function () { $("confirm").hidden = true; };
  $("confirmYes").onclick = function () {
    $("confirm").hidden = true; if (!G || G.bitti) return; D.bitirenBenim = true;
    D.ref.set({ bitti: true, sonuc: "pes", kazanan: D.other, sira: "", v: (G.v || 0) + 1, t: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true }).catch(function () { D.bitirenBenim = false; D.msg("Olmadı, tekrar dene."); });
  };
  addEventListener("resize", function () { if (G) { boyut(); } });
  if (location.hash === "#test") window.__zc = { state: function () { return { G: G, me: D.me, other: D.other, yazilan: yazilan.slice(), kelimeler: ZN.slice() }; }, yaz: function (s) { yazilan = []; harfler(buyuk(s)).forEach(function (h) { yazilan.push(h); }); ciz(); }, tahmin: tahmin, pas: function () { yaz(null); }, yeni: D.yeniOyun };
})();
