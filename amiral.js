/* Amiral Battı – iki kişilik (amiral/mac, amiral/seri). Ortak altyapı: duello.js.
   mac = { n, v, a, b, baslayan, yer: {uid: karıştırılmış diziliş JSON}, hazir: {uid: bool}, atis: {uid: [{c: kare 0-99, v: vurdu, b: batan gemi id|""}]}, sira: uid|"", bitti, sonuc "batti"|"pes", kazanan, t }
   Diziliş: [{id, r, c, d:"h"|"v"}]. Vuran bir daha atar. */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  var GEMI = [{ id: "u", ad: "Uçak gemisi", n: 5 }, { id: "z", ad: "Zırhlı", n: 4 }, { id: "k", ad: "Kruvazör", n: 3 }, { id: "d", ad: "Denizaltı", n: 3 }, { id: "m", ad: "Muhrip", n: 2 }];
  var TOPLAM = 17, HARF = "ABCDEFGHIJ";
  var D = window.Duello({
    kol: "amiral", sayfa: "amiral", sub: "sub", ses: "AbSes",
    startText: "İkiniz de gemilerinizi yerleştirirsiniz, sonra sırayla atış. Vuran bir daha atar; ilk atış sırası oyun oyun değişir.",
    yeniDoc: function (d, ME, OTHER) {
      var baslayan = d && d.baslayan ? (d.baslayan === ME ? OTHER : ME) : ME, yer = {}, hazir = {}, atis = {};
      yer[ME] = ""; yer[OTHER] = ""; hazir[ME] = false; hazir[OTHER] = false; atis[ME] = []; atis[OTHER] = [];
      return { a: ME, b: OTHER, baslayan: baslayan, yer: yer, hazir: hazir, atis: atis, sira: "" };
    },
    onMac: onMac, onYok: function () { G = null; $("score").hidden = true; dugmeler(); },
    bitis: function (d) {
      var ME = D.me, OTHER = D.other, ad = D.adlar[OTHER] || "Rakip", kazandim = d.kazanan === ME, am = (d.atis[ME] || []), ao = (d.atis[OTHER] || []);
      var vm = am.filter(function (x) { return x.v; }).length, vo = ao.filter(function (x) { return x.v; }).length;
      var baslik = d.sonuc === "pes" ? (kazandim ? ad + " pes etti — kazandın" : "Pes ettin") : kazandim ? "Amiral battı! Kazandın" : ad + " filonu batırdı";
      return { kick: "Oyun " + d.n + " bitti", baslik: baslik, metin: "Sen " + am.length + " atışta " + vm + " vurdun, " + ad + " " + ao.length + " atışta " + vo + ". Yeni oyunda ilk atış " + (d.baslayan === ME ? D.ekIn(ad) : "senin") + "." };
    },
    seriKod: function (d) { return d.sonuc === "pes" ? 99 : Math.min(98, (d.atis[d.kazanan] || []).length); },
    bitisGecikme: function () { return (kuyruk.length + (oynatiyor ? 1 : 0)) * 760 + 400; }
  });
  var G = null, yerel = null, secili = -1, gonderiyor = false, kuyruk = [], oynatiyor = false, gosterilen = 0;
  function seenOku(n) { try { var j = JSON.parse(localStorage.getItem("ab_seen") || "null"); return j && j.n === n ? j.k | 0 : 0; } catch (e) { return 0; } }
  function seenYaz(n, k) { try { localStorage.setItem("ab_seen", JSON.stringify({ n: n, k: k })); } catch (e) {} }
  function snd(n) { if (window.AbSes) try { window.AbSes.play(n); } catch (e) {} }
  function kareAd(c) { return HARF.charAt(Math.floor(c / 10)) + (c % 10 + 1); }
  function hucreler(g) { var out = [], n = gemiN(g.id); for (var i = 0; i < n; i++) out.push(g.d === "h" ? g.r * 10 + g.c + i : (g.r + i) * 10 + g.c); return out; }
  function gemiN(id) { for (var i = 0; i < GEMI.length; i++) if (GEMI[i].id === id) return GEMI[i].n; return 0; }
  function gemiAd(id) { for (var i = 0; i < GEMI.length; i++) if (GEMI[i].id === id) return GEMI[i].ad; return "gemi"; }
  function sigar(g, digerleri) {
    var n = gemiN(g.id); if (g.r < 0 || g.c < 0) return false;
    if (g.d === "h" ? g.c + n > 10 : g.r + n > 10) return false;
    var h = hucreler(g), dolu = {};
    digerleri.forEach(function (o) { if (o !== g && o.id !== g.id) hucreler(o).forEach(function (c) { dolu[c] = 1; }); });
    for (var i = 0; i < h.length; i++) if (dolu[h[i]]) return false;
    return true;
  }
  function rastgele() {
    var out = [];
    GEMI.forEach(function (gm) {
      for (var dene = 0; dene < 500; dene++) {
        var g = { id: gm.id, r: Math.floor(Math.random() * 10), c: Math.floor(Math.random() * 10), d: Math.random() < 0.5 ? "h" : "v" };
        if (sigar(g, out)) { out.push(g); return; }
      }
    });
    return out.length === GEMI.length ? out : rastgele();
  }
  function dizilis(d, uid) { if (!d.yer || !d.yer[uid]) return null; try { var j = JSON.parse(D.coz(d.yer[uid], "amiral" + d.n + uid)); return j && j.length === 5 ? j : null; } catch (e) { return null; } }
  function gemiHaritasi(diz) { var m = {}; (diz || []).forEach(function (g) { hucreler(g).forEach(function (c) { m[c] = g.id; }); }); return m; }

  /* ---- ızgaralar ---- */
  var grid = $("grid"), mini = $("mini"), K = [], KM = [];
  for (var i = 0; i < 100; i++) {
    var b = document.createElement("button"); b.type = "button"; b.className = "abc"; b.setAttribute("data-c", i); grid.appendChild(b); K.push(b);
    var s = document.createElement("span"); s.className = "abc"; s.setAttribute("data-c", i); mini.appendChild(s); KM.push(s);
  }
  function fit() {
    var vh = (window.visualViewport && window.visualViewport.height) || innerHeight;
    var bs = getComputedStyle(document.body), pt = parseFloat(bs.paddingTop) || 0, pb = parseFloat(bs.paddingBottom) || 0;
    $("stage").style.height = Math.max(340, vh - pt - pb) + "px";
    var wrap = $("wrap"), w = wrap.clientWidth, h = wrap.clientHeight;
    var yan = w >= 560;                                                /* geniş ekranda yan yana */
    wrap.classList.toggle("yan", yan);
    var k = yan ? Math.floor(Math.min((w - 200) / 10, (h - 24) / 10)) : Math.floor(Math.min((w - 4) / 10, (h - 72) / 15));
    k = Math.max(20, Math.min(40, k));
    document.documentElement.style.setProperty("--ab-k", k + "px");
  }
  addEventListener("resize", fit); addEventListener("orientationchange", function () { setTimeout(fit, 250); });
  if (window.visualViewport) window.visualViewport.addEventListener("resize", fit);
  fit();
  function asama() { if (!G) return "kur"; if (G.bitti) return "bitti"; if (!G.hazir || !G.hazir[D.me]) return "yer"; if (!G.hazir[D.other]) return "bekle"; return "oyun"; }

  function ciz() {
    var ME = D.me, OTHER = D.other, a = asama(); if (!G) return;
    if ($("score").hidden) { $("score").hidden = false; fit(); }
    var am = (G.atis && G.atis[ME]) || [], ao = ((G.atis && OTHER && G.atis[OTHER]) || []).slice(0, gosterilen);
    var benimDiz = a === "yer" ? yerel : dizilis(G, ME), onunDiz = G.bitti ? dizilis(G, OTHER) : null;
    var benimH = gemiHaritasi(benimDiz), onunH = gemiHaritasi(onunDiz);
    /* ana ızgara: yerleştirme aşamasında benim filom; oyunda rakip suları */
    var vurMe = {}, batanOnun = {}; am.forEach(function (x) { vurMe[x.c] = x.v ? 2 : 1; if (x.b) batanOnun[x.b] = 1; });
    var vurOt = {}, batanBenim = {}; ao.forEach(function (x) { vurOt[x.c] = x.v ? 2 : 1; if (x.b) batanBenim[x.b] = 1; });
    var onunBatanH = {}; if (onunDiz) onunDiz.forEach(function (g) { if (batanOnun[g.id]) hucreler(g).forEach(function (c) { onunBatanH[c] = 1; }); });
    for (var c = 0; c < 100; c++) {
      var cls = "abc", t = "";
      if (a === "yer" || a === "bekle") { if (benimH[c]) cls += " gemi" + (a === "yer" ? " sec" : ""); }
      else {
        if (vurMe[c] === 2) cls += " vur"; else if (vurMe[c] === 1) cls += " iska";
        if (onunH[c] && (G.bitti || batanOnun[onunH[c]])) cls += " gemi";
        if (c === secili && a === "oyun") cls += " nisan";
      }
      if (c % 10 === 0) t += '<i class="cr">' + HARF.charAt(c / 10) + "</i>"; if (c < 10) t += '<i class="cf">' + (c + 1) + "</i>";
      if (K[c].className !== cls) K[c].className = cls;
      if (K[c].getAttribute("data-h") !== t) { K[c].innerHTML = t; K[c].setAttribute("data-h", t); }
      K[c].disabled = !(a === "oyun" && G.sira === ME && !gonderiyor && !oynatiyor && !vurMe[c]) && a !== "yer";
      /* mini: benim filom + onun atışları */
      var cm = "abc" + (benimH[c] ? " gemi" : "") + (vurOt[c] === 2 ? " vur" : vurOt[c] === 1 ? " iska" : "");
      if (KM[c].className !== cm) KM[c].className = cm;
    }
    $("mainLbl").textContent = a === "yer" ? "Gemilerini yerleştir" : a === "bekle" ? "Filon hazır" : (D.adlar[OTHER] ? D.ekIn(D.adlar[OTHER]) : "Rakibin") + " suları";
    $("miniLbl").textContent = a === "oyun" || a === "bitti" ? "Senin filon" : "";
    mini.hidden = !(a === "oyun" || a === "bitti");
    /* gemi listesi: oyunda rakibin batan gemileri; yerleştirmede kendi gemilerim */
    var gl = $("ships");
    if (a === "oyun" || a === "bitti") gl.innerHTML = GEMI.map(function (g) { return "<li" + (batanOnun[g.id] ? ' class="batti"' : "") + "><i>" + g.n + "</i>" + g.ad + (batanOnun[g.id] ? " ✓" : "") + "</li>"; }).join("");
    else gl.innerHTML = GEMI.map(function (g) { return "<li><i>" + g.n + "</i>" + g.ad + "</li>"; }).join("");
    gl.hidden = a === "bekle";
    /* skor ve sıra */
    $("skorMe").textContent = am.filter(function (x) { return x.v; }).length; $("skorOther").textContent = ao.filter(function (x) { return x.v; }).length;
    if (a === "bitti") { $("turnTxt").textContent = G.kazanan === ME ? "Kazandın" : "Kaybettin"; $("turnSub").textContent = "oyun bitti"; }
    else if (a === "yer") { $("turnTxt").textContent = "Yerleştir"; $("turnSub").textContent = "gemiye dokun: döner"; }
    else if (a === "bekle") { $("turnTxt").textContent = (D.adlar[OTHER] || "Rakip") + " bekleniyor"; $("turnSub").textContent = "filosunu diziyor"; }
    else if (oynatiyor) { $("turnTxt").textContent = D.adlar[OTHER] || "Rakip"; $("turnSub").textContent = "atışları gösteriliyor"; }
    else if (G.sira === ME) { $("turnTxt").textContent = "Sıra sende"; $("turnSub").textContent = secili >= 0 ? kareAd(secili) + " nişanda" : (TOPLAM - $("skorMe").textContent) + " kare kaldı"; }
    else { $("turnTxt").textContent = "Sıra " + (D.adlar[OTHER] ? D.ekDe(D.adlar[OTHER]) : "onda"); $("turnSub").textContent = "bekliyorsun"; }
    $("turn").className = "hdturn" + ((a === "oyun" && G.sira === ME && !oynatiyor) || a === "yer" ? " me" : " ot");
    $("pMe").className = "hdp" + (a === "oyun" && G.sira === ME ? " on" : ""); $("pOther").className = "hdp" + (a === "oyun" && G.sira === OTHER ? " on" : "");
    dugmeler();
  }
  function dugmeler() {
    var a = asama(), ME = D.me;
    $("bFire").hidden = !(a === "oyun" && G && G.sira === ME && !oynatiyor); $("bFire").disabled = secili < 0 || gonderiyor;
    $("bShuffle").hidden = a !== "yer"; $("bLock").hidden = a !== "yer"; $("bLock").disabled = gonderiyor;
    $("bResign").hidden = !(a === "oyun" || a === "bekle");
  }

  /* ---- yerleştirme ---- */
  grid.addEventListener("click", function (e) {
    var b = e.target && e.target.closest ? e.target.closest("button.abc") : null; if (!b || b.disabled) return;
    var c = +b.getAttribute("data-c"), a = asama();
    if (a === "yer") { dondur(c); return; }
    if (a === "oyun" && G.sira === D.me) { secili = secili === c ? -1 : c; snd("select"); ciz(); }
  });
  function dondur(c) {
    var h = gemiHaritasi(yerel), id = h[c]; if (!id) return;
    var g = null; yerel.forEach(function (x) { if (x.id === id) g = x; });
    var yeni = { id: g.id, r: g.r, c: g.c, d: g.d === "h" ? "v" : "h" };
    /* dönmezse biraz kaydırarak dene */
    var denemeler = [[0, 0], [0, -1], [-1, 0], [0, -2], [-2, 0], [0, -3], [-3, 0], [0, -4], [-4, 0]], ok = false;
    for (var i = 0; i < denemeler.length && !ok; i++) { var t = { id: yeni.id, r: yeni.r + denemeler[i][0], c: yeni.c + denemeler[i][1], d: yeni.d }; if (sigar(t, yerel)) { yeni = t; ok = true; } }
    if (!ok) { D.msg(gemiAd(id) + " burada dönemiyor."); return; }
    yerel = yerel.map(function (x) { return x.id === id ? yeni : x; }); snd("select"); ciz();
  }
  $("bShuffle").onclick = function () { yerel = rastgele(); snd("select"); ciz(); };
  $("bLock").onclick = function () {
    if (asama() !== "yer" || gonderiyor) return; gonderiyor = true; dugmeler();
    var ME = D.me, OTHER = D.other, diz = yerel;
    D.db.runTransaction(function (tx) {
      return tx.get(D.ref).then(function (snap) {
        var d = snap.data(); if (!d || d.bitti || d.n !== G.n) throw new Error("oyun");
        var upd = { yer: {}, hazir: {}, t: firebase.firestore.FieldValue.serverTimestamp() };
        upd.yer[ME] = D.gizle(JSON.stringify(diz), "amiral" + d.n + ME); upd.hazir[ME] = true;
        if (d.hazir && d.hazir[OTHER]) upd.sira = d.baslayan;
        tx.set(D.ref, upd, { merge: true });
      });
    }).then(function () { gonderiyor = false; D.msg("Filon kilitlendi."); }).catch(function () { gonderiyor = false; dugmeler(); D.msg("Kaydedilemedi, tekrar dene."); });
  };

  /* ---- atış ---- */
  $("bFire").onclick = function () {
    if (asama() !== "oyun" || G.sira !== D.me || secili < 0 || gonderiyor) return;
    var ME = D.me, OTHER = D.other, c = secili, onun = dizilis(G, OTHER);
    if (!onun) { D.msg("Rakibin dizilişi okunamadı."); return; }
    var h = gemiHaritasi(onun), vurdu = !!h[c], batan = "", am = (G.atis[ME] || []);
    if (vurdu) { var vurulan = {}; am.forEach(function (x) { if (x.v) vurulan[x.c] = 1; }); vurulan[c] = 1; var g = null; onun.forEach(function (x) { if (x.id === h[c]) g = x; }); if (hucreler(g).every(function (q) { return vurulan[q]; })) batan = g.id; }
    var toplamVur = am.filter(function (x) { return x.v; }).length + (vurdu ? 1 : 0), bitti = toplamVur >= TOPLAM, bitirdi = false;
    gonderiyor = true; dugmeler();
    D.db.runTransaction(function (tx) {
      return tx.get(D.ref).then(function (snap) {
        var d = snap.data(); if (!d || d.bitti || d.sira !== ME || d.v !== G.v) throw new Error("sira");
        var liste = (d.atis[ME] || []).slice(); for (var i = 0; i < liste.length; i++) if (liste[i].c === c) throw new Error("ayni");
        liste.push({ c: c, v: vurdu, b: batan });
        var upd = { atis: {}, v: d.v + 1, t: firebase.firestore.FieldValue.serverTimestamp() }; upd.atis[ME] = liste;
        if (bitti) { upd.bitti = true; upd.sonuc = "batti"; upd.kazanan = ME; upd.sira = ""; bitirdi = true; }
        else upd.sira = vurdu ? ME : OTHER;
        tx.set(D.ref, upd, { merge: true });
      });
    }).then(function () {
      gonderiyor = false; secili = -1;
      snd(batan ? "sunk" : vurdu ? "hit" : "miss");
      D.msg(bitti ? "Amiral battı!" : batan ? "Batırdın: " + gemiAd(batan) + "! Bir daha at." : vurdu ? "Vurdun! Bir daha at." : "Iskaladın, sıra " + (D.adlar[OTHER] ? D.ekDe(D.adlar[OTHER]) : "onda") + ".");
      if (bitirdi) D.bitirenBenim = true;
    }).catch(function (e) { gonderiyor = false; dugmeler(); D.msg(String(e && e.message) === "sira" ? "Sıra sende değil ya da tahta değişti." : String(e && e.message) === "ayni" ? "Oraya zaten attın." : "Bağlantı kurulamadı, tekrar dene."); });
  };
  $("bResign").onclick = function () { if (!G || G.bitti) return; $("confirm").hidden = false; };
  $("confirmNo").onclick = function () { $("confirm").hidden = true; };
  $("confirmYes").onclick = function () {
    $("confirm").hidden = true; if (!G || G.bitti) return; D.bitirenBenim = true;
    D.ref.set({ bitti: true, sonuc: "pes", kazanan: D.other, sira: "", v: (G.v || 0) + 1, t: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true }).catch(function () { D.bitirenBenim = false; D.msg("Olmadı, tekrar dene."); });
  };

  /* ---- rakibin atışları: tek tek göster (başka zaman yapılanlar da girince sırayla) ---- */
  function oynat() {
    if (!kuyruk.length) { oynatiyor = false; ciz(); return; }
    oynatiyor = true; var x = kuyruk.shift(), kalan = kuyruk.length;
    gosterilen++; seenYaz(G.n, gosterilen);
    KM[x.c].classList.add("yeni"); setTimeout(function () { KM[x.c].classList.remove("yeni"); }, 600);
    snd(x.b ? "sunk" : x.v ? "hit" : "miss");
    D.msg((D.adlar[D.other] || "Rakip") + " " + kareAd(x.c) + (x.b ? " — " + gemiAd(x.b) + " battı!" : x.v ? " — vurdu" : " — ıska") + (kalan ? "  (" + kalan + " atış daha)" : ""), true);
    ciz(); $("turnTxt").textContent = D.adlar[D.other] || "Rakip"; $("turnSub").textContent = "atışları gösteriliyor";
    setTimeout(oynat, 750);
  }
  var siraDuzelt = -1;
  function baslat(d) {                                                  /* ikisi hazır ama sıra boş (aynı anda kilit): başlayanla doldur */
    if (d.bitti || d.sira || !d.hazir || !d.hazir[D.me] || !D.other || !d.hazir[D.other] || siraDuzelt === d.n) return;
    siraDuzelt = d.n; D.ref.set({ sira: d.baslayan, t: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true }).catch(function () {});
  }
  function onMac(d, ilk) {
    var ME = D.me, OTHER = D.other, oncekiG = G; G = d; baslat(d);
    var ao = (d.atis && OTHER && d.atis[OTHER]) || [];
    if (ilk) { yerel = (!d.hazir || !d.hazir[ME]) ? rastgele() : null; secili = -1; kuyruk = []; oynatiyor = false; gosterilen = Math.min(ao.length, seenOku(d.n)); }
    if (ao.length > gosterilen + kuyruk.length) {
      for (var i = gosterilen + kuyruk.length; i < ao.length; i++) kuyruk.push(ao[i]);
      if (!oynatiyor) { if (ilk && kuyruk.length > 1) D.msg((D.adlar[OTHER] || "Rakip") + " sen yokken " + kuyruk.length + " atış yaptı.", true); oynat(); }
      return;
    }
    if (!ilk && oncekiG && oncekiG.hazir && !oncekiG.hazir[OTHER] && d.hazir[OTHER] && d.hazir[ME]) D.msg((D.adlar[OTHER] || "Rakip") + " filosunu dizdi. " + (d.sira === ME ? "İlk atış senin!" : "İlk atış onun."));
    ciz();
  }
  if (location.hash === "#test") window.__ab = { state: function () { return { G: G, me: D.me, other: D.other, asama: asama(), yerel: yerel, secili: secili, oynatiyor: oynatiyor, benim: G ? dizilis(G, D.me) : null, onun: G ? dizilis(G, D.other) : null }; }, sec: function (c) { secili = c; ciz(); }, ates: function () { $("bFire").onclick(); }, kilit: function () { $("bLock").onclick(); }, yeni: D.yeniOyun, hucreler: hucreler, yerle: function (diz) { yerel = diz; ciz(); } };
})();
