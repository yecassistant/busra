/* Emoji sohbeti: 2 kişilik oyunlarda ve menüde sağ kenarda küçük bir sekme.
   Firestore: sohbet/{uid} = { e: emoji, o: sayfa, n: sayaç, t: zaman, ad }  — her kişinin tek belgesi, karşı tarafınkini dinleriz.
   Hangi oyunda olursak olalım, gönderilen emoji öbürünün açık sayfasında uçar. Sonra yazı da eklenebilir (alan: y). */
(function () {
  "use strict";
  if (window.__sohbet) return; window.__sohbet = true;
  var EMOJI = ["🫣", "🫠", "😬", "😁", "😅", "🥲", "🙃", "🥰", "😵‍💫", "😵", "😂", "😘", "🔥", "👏", "☕"];
  var SAYFA = { oyunlar: "menüden", hafiza: "Hafıza'dan", sayi: "Sayı Düellosu'ndan", xox: "XOX'tan", tepe: "Tepe Savaşı'ndan", satranc: "Satranç'tan", amiral: "Amiral Battı'dan", asmaca: "Adam Asmaca'dan", zincir: "Kelime Zinciri'nden", uno: "UNO'dan", dort: "Dört Taş'tan", ciz: "Çiz Bil'den" };
  var sayfa = document.body.getAttribute("data-page") || "";
  var me = null, other = null, db = null, sayac = 0, sonGonder = 0, gorulen = 0, kurulu = false;
  try { gorulen = +localStorage.getItem("sh_gorulen") || 0; } catch (e) {}

  /* ---- arayüz ---- */
  var kok = document.createElement("div"); kok.className = "shkok"; kok.hidden = true;
  kok.innerHTML = '<button type="button" class="shsekme" aria-label="Emoji gönder" aria-expanded="false"><span class="shsimge">💬</span><i class="shnokta" hidden></i></button>' +
    '<div class="shtepsi" role="menu" hidden>' + EMOJI.map(function (e) { return '<button type="button" class="shem" role="menuitem">' + e + '</button>'; }).join("") + '</div>';
  var sekme = kok.querySelector(".shsekme"), tepsi = kok.querySelector(".shtepsi"), nokta = kok.querySelector(".shnokta");
  var yy = 0.58; try { var k0 = parseFloat(localStorage.getItem("sh_y")); if (k0 > 0.1 && k0 < 0.9) yy = k0; } catch (e) {}
  function yer() { kok.style.top = Math.round(yy * innerHeight) + "px"; }
  function ac(a) { tepsi.hidden = !a; sekme.setAttribute("aria-expanded", a ? "true" : "false"); kok.classList.toggle("acik", a); if (a) nokta.hidden = true; }

  /* sekme yukarı-aşağı sürüklenebilir (oyunun düğmesine denk gelirse çekip kenara alırsın) */
  var bas = null, kaydi = false;
  sekme.addEventListener("pointerdown", function (e) { bas = { y: e.clientY, yy: yy }; kaydi = false; try { sekme.setPointerCapture(e.pointerId); } catch (x) {} });
  sekme.addEventListener("pointermove", function (e) {
    if (!bas) return; var d = e.clientY - bas.y; if (!kaydi && Math.abs(d) < 8) return;
    kaydi = true; ac(false); yy = Math.max(0.12, Math.min(0.88, bas.yy + d / innerHeight)); yer();
  });
  sekme.addEventListener("pointerup", function () { if (kaydi) { try { localStorage.setItem("sh_y", yy.toFixed(3)); } catch (x) {} } bas = null; });
  sekme.addEventListener("pointercancel", function () { bas = null; });
  sekme.addEventListener("click", function () { if (kaydi) { kaydi = false; return; } ac(tepsi.hidden); });
  document.addEventListener("pointerdown", function (e) { if (!tepsi.hidden && !kok.contains(e.target)) ac(false); }, true);
  [].forEach.call(kok.querySelectorAll(".shem"), function (b) { b.addEventListener("click", function () { gonder(b.textContent); }); });
  addEventListener("resize", yer);

  function ucur(emo, benden) {
    var r = sekme.getBoundingClientRect(), n = benden ? 1 : 5;
    for (var i = 0; i < n; i++) (function (i) {
      var u = document.createElement("span"); u.className = "shucan" + (benden ? " ben" : ""); u.textContent = emo;
      u.style.left = (r.left - 10 - (benden ? 0 : Math.random() * 90)) + "px"; u.style.top = (r.top + (benden ? 0 : Math.random() * 30 - 15)) + "px";
      u.style.animationDelay = (i * 0.12) + "s";
      if (!benden && i === 0) u.classList.add("ilk");
      document.body.appendChild(u); setTimeout(function () { if (u.parentNode) u.parentNode.removeChild(u); }, 2200 + i * 120);
    })(i);
  }
  function balon(metin) {
    var b = document.createElement("div"); b.className = "shbalon"; b.textContent = metin;
    var rr = sekme.getBoundingClientRect(); b.style.top = (rr.bottom + 46 > innerHeight ? rr.top - 52 : rr.bottom + 8) + "px";
    document.body.appendChild(b); setTimeout(function () { b.classList.add("git"); }, 2600); setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 3100);
  }

  /* ---- gönder / dinle ---- */
  function gonder(emo) {
    if (!db || !me) return; var simdi = Date.now(); if (simdi - sonGonder < 900) return; sonGonder = simdi;
    sayac++; ucur(emo, true); ac(false);
    var k = Hesap.kim() || {};
    db.collection("sohbet").doc(me).set({ e: emo, o: sayfa, n: sayac, t: simdi, ad: k.ad || "" }).catch(function () { balon("Gönderilemedi, bağlantıya bak."); });
  }
  function geldi(d) {
    if (!d || !d.n || !d.e) return;
    var yeni = d.n !== gorulen && Math.abs(Date.now() - (d.t || 0)) < 45000;
    gorulen = d.n; try { localStorage.setItem("sh_gorulen", String(d.n)); } catch (e) {}
    if (!yeni) return;
    ucur(d.e, false);
    var nereden = d.o && d.o !== sayfa && SAYFA[d.o] ? " · " + SAYFA[d.o] : "";
    balon((d.ad || "O") + " " + d.e + nereden);
    if (tepsi.hidden) nokta.hidden = false;
    try { if (navigator.vibrate) navigator.vibrate(30); } catch (e) {}
  }
  function kur(k) {
    if (kurulu || !k || !k.uid) return; kurulu = true; me = k.uid;
    Hesap.db().then(function (d) {
      db = d;
      d.collection("sohbet").doc(me).get().then(function (s) { var v = s.exists ? s.data() : null; if (v && v.n > sayac) sayac = v.n; }).catch(function () {});
      d.collection("oyuncular").get().then(function (snap) {
        snap.forEach(function (doc) { if (doc.id !== me) other = doc.id; });
        if (!other) return;
        document.body.appendChild(kok); kok.hidden = false; yer();
        d.collection("sohbet").doc(other).onSnapshot(function (s) { geldi(s.exists ? s.data() : null); }, function () {});
      }).catch(function () {});
    }).catch(function () {});
  }
  function basla() { if (window.Hesap) Hesap.izle(function (k) { if (k && k.kesin) kur(k); }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", basla); else basla();
  if (location.hash === "#test") window.__sh = { gonder: gonder, durum: function () { return { me: me, other: other, sayac: sayac, gorulen: gorulen, gorunur: !kok.hidden }; } };
})();
