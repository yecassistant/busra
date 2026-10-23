/* Çiftlik – Hay Day tarzı 3D çiftlik (three.js r149). Kodla açılır (ciftlik.html). Modeller: ciftlik-model.js, sesler: ciftlik-ses.js.
   Döngü: ek → hasat et → yem / ekmek / krema üret → hayvanları besle → siparişleri gönder → altın + XP → seviye atla, yeni ürün ve yapılar açılır.
   Süreler gerçek zamanlı: oyun kapalıyken de ekinler büyür, fırın pişirir. Kayıt: localStorage "cf_kayit" (bu cihazda).
   Dokunma: tarlaya dokun (ek / hasat), olgun tarlaların üstünde parmağını gezdirince hepsi biçilir; ekerken de boş tarlalarda gezdirmek yeter.
   Tek parmak kaydırır, iki parmak yakınlaştırır (bilgisayarda tekerlek). */
(function () {
  "use strict";
  var T = window.THREE, CM = window.CfModel;
  function $(id) { return document.getElementById(id); }
  var cv = $("cv"), renderer = null;
  try { if (!T || !CM) throw 0; renderer = new T.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: "high-performance" }); } catch (e) { renderer = null; }
  if (!renderer) { $("yukle").hidden = true; $("hata").hidden = false; return; }
  var MOBIL = (window.matchMedia && matchMedia("(pointer: coarse)").matches) || innerWidth < 700;
  var AZ_HAREKET = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
  function ses(n, o) { if (window.CfSes) try { window.CfSes.play(n, o); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function sureYaz(ms) { var s = Math.max(0, Math.ceil(ms / 1000)); if (s < 60) return s + " sn"; var d = Math.floor(s / 60), r = s % 60; return d + ":" + (r < 10 ? "0" : "") + r; }
  function sureAd(sn) { return sn < 60 ? sn + " sn" : (sn % 60 ? Math.floor(sn / 60) + " dk " + (sn % 60) + " sn" : sn / 60 + " dk"); }

  /* ================= veriler ================= */
  var URUN = {
    bugday: { ad: "Buğday", ik: "🌾", deger: 3, xp: 1, sv: 1 },
    misir: { ad: "Mısır", ik: "🌽", deger: 5, xp: 1, sv: 2 },
    havuc: { ad: "Havuç", ik: "🥕", deger: 8, xp: 2, sv: 4 },
    cilek: { ad: "Çilek", ik: "🍓", deger: 12, xp: 2, sv: 6 },
    yumurta: { ad: "Yumurta", ik: "🥚", deger: 12, xp: 2, sv: 2 },
    sut: { ad: "Süt", ik: "🥛", deger: 18, xp: 3, sv: 5 },
    tyem: { ad: "Tavuk yemi", ik: "@tyem", deger: 4, xp: 1, sv: 2 },
    iyem: { ad: "İnek yemi", ik: "@iyem", deger: 7, xp: 1, sv: 5 },
    ekmek: { ad: "Ekmek", ik: "🍞", deger: 16, xp: 3, sv: 3 },
    misirekmegi: { ad: "Mısır ekmeği", ik: "🫓", deger: 30, xp: 5, sv: 4 },
    kek: { ad: "Havuçlu kek", ik: "🧁", deger: 48, xp: 7, sv: 6 },
    krema: { ad: "Krema", ik: "@krema", deger: 26, xp: 4, sv: 5 },
    tereyagi: { ad: "Tereyağı", ik: "🧈", deger: 36, xp: 5, sv: 6 },
    pasta: { ad: "Çilekli pasta", ik: "🍰", deger: 80, xp: 10, sv: 7 },
    yabanmersini: { ad: "Yaban mersini", ik: "🫐", deger: 14, xp: 2, sv: 3 },
    kahve: { ad: "Kahve çekirdeği", ik: "@kahve", deger: 10, xp: 2, sv: 4 },
    americano: { ad: "Americano", ik: "@americano", deger: 34, xp: 5, sv: 4, fav: 1 },
    muffin: { ad: "Yaban mersinli muffin", ik: "@muffin", deger: 52, xp: 7, sv: 4, fav: 1 },
    atomtost: { ad: "Atom tost", ik: "🥪", deger: 58, xp: 8, sv: 5, fav: 1 },
    sufle: { ad: "Bol çilekli sufle", ik: "🍮", deger: 110, xp: 14, sv: 6, fav: 1 },
    domates: { ad: "Domates", ik: "🍅", deger: 16, xp: 3, sv: 5 },
    lavanta: { ad: "Lavanta", ik: "💐", deger: 20, xp: 3, sv: 7 },
    kabak: { ad: "Balkabağı", ik: "🎃", deger: 26, xp: 4, sv: 8 },
    elma: { ad: "Elma", ik: "🍎", deger: 9, xp: 2, sv: 4 },
    limon: { ad: "Limon", ik: "🍋", deger: 11, xp: 2, sv: 5 },
    kiraz: { ad: "Kiraz", ik: "🍒", deger: 15, xp: 3, sv: 6 },
    nar: { ad: "Nar", ik: "@nar", deger: 18, xp: 3, sv: 8 },
    yun: { ad: "Yün", ik: "🧶", deger: 20, xp: 3, sv: 6 },
    kecisutu: { ad: "Keçi sütü", ik: "🍶", deger: 24, xp: 4, sv: 7 },
    recel: { ad: "Çilek reçeli", ik: "🫙", deger: 60, xp: 8, sv: 5 },
    ymrecel: { ad: "Yaban mersini reçeli", ik: "@ymrecel", deger: 66, xp: 9, sv: 5 },
    elmarecel: { ad: "Elma reçeli", ik: "@elmarecel", deger: 48, xp: 7, sv: 6 },
    limonata: { ad: "Limonata", ik: "🥤", deger: 40, xp: 6, sv: 5 },
    smoothie: { ad: "Çilekli smoothie", ik: "🍹", deger: 62, xp: 8, sv: 6 },
    ymsmoothie: { ad: "Yaban mersinli smoothie", ik: "@ymsmoothie", deger: 68, xp: 9, sv: 6 },
    ip: { ad: "Yün ipi", ik: "🧵", deger: 46, xp: 6, sv: 6 },
    atki: { ad: "Atkı", ik: "🧣", deger: 110, xp: 14, sv: 6 },
    kazak: { ad: "Kazak", ik: "🧥", deger: 170, xp: 20, sv: 7 },
    peynir: { ad: "Keçi peyniri", ik: "🧀", deger: 64, xp: 9, sv: 7 },
    turta: { ad: "Elmalı turta", ik: "🥧", deger: 72, xp: 10, sv: 6 },
    lavantalatte: { ad: "Lavanta latte", ik: "@latte", deger: 90, xp: 12, sv: 7 },
    corba: { ad: "Balkabağı çorbası", ik: "🍲", deger: 96, xp: 12, sv: 8 }
  };
  var SIRA_URUN = ["bugday", "misir", "havuc", "cilek", "yabanmersini", "kahve", "domates", "lavanta", "kabak", "elma", "limon", "kiraz", "nar", "yumurta", "sut", "yun", "kecisutu", "tyem", "iyem", "ekmek", "misirekmegi", "kek", "turta", "krema", "tereyagi", "peynir", "pasta", "americano", "muffin", "atomtost", "sufle", "lavantalatte", "recel", "ymrecel", "elmarecel", "limonata", "smoothie", "ymsmoothie", "ip", "atki", "kazak", "corba"];
  var FAVORI = ["americano", "muffin", "atomtost", "sufle"];                 /* Büşra'nın favorileri: hepsini bir kez yapınca küçük bir sürpriz */
  var EKINLER = ["bugday", "misir", "yabanmersini", "havuc", "kahve", "domates", "cilek", "lavanta", "kabak"], EKIN_SURE = { bugday: 30, misir: 60, havuc: 120, cilek: 180, yabanmersini: 150, kahve: 240, domates: 200, lavanta: 300, kabak: 360 }, VERIM = 2;
  var BINALAR = ["yem", "firin", "mandira", "kafe", "recel", "smoothie", "dokuma"];
  /* meyve ağaçları: markete gidip fidan alınır, 5 yere dikilir; olgunlaşınca dokununca 3 meyve verir, yeniden büyür */
  var AGAC = { elma: { ad: "Elma ağacı", sv: 4, fiyat: 60, sure: 240, urun: "elma" }, limon: { ad: "Limon ağacı", sv: 5, fiyat: 90, sure: 300, urun: "limon" }, kiraz: { ad: "Kiraz ağacı", sv: 6, fiyat: 120, sure: 360, urun: "kiraz" }, nar: { ad: "Nar ağacı", sv: 8, fiyat: 150, sure: 420, urun: "nar" } };
  var AGAC_YER = [[2.4, 15.6], [5.4, 15.6], [8.4, 15.6], [11.4, 15.6], [14.4, 15.6]], AGAC_VERIM = 3;
  /* dekorasyonlar: marketten alınır, sabit yerlerine konur */
  var DEKOR = { bank: { ad: "Gölet bankı", fiyat: 80, sv: 2, ik: "🪑" }, tarh: { ad: "Çiçek tarhı", fiyat: 60, sv: 2, ik: "🌷" }, salincak: { ad: "Salıncak", fiyat: 140, sv: 3, ik: "🎠" }, cesme: { ad: "Taş çeşme", fiyat: 220, sv: 4, ik: "⛲" }, kedi: { ad: "Kedi (ve kulübesi)", fiyat: 120, sv: 3, ik: "🐈" } };
  var DEKOR_YER = { bank: [3.4, 7.2, 0.6], tarh: [-3.0, -4.2, 0], salincak: [-9.6, 6.4, 0.2], cesme: [12.0, 5.8, 0], kedi: [-9.8, -8.6, -0.2] };
  var BINA = {
    yem: { ad: "Yem Fabrikası", sv: 2, tarif: [{ id: "tyem", adet: 3, gir: { bugday: 2, misir: 1 }, sure: 30 }, { id: "iyem", adet: 3, gir: { misir: 2, havuc: 1 }, sure: 45 }] },
    firin: { ad: "Fırın", sv: 3, tarif: [{ id: "ekmek", adet: 1, gir: { bugday: 3 }, sure: 60 }, { id: "misirekmegi", adet: 1, gir: { misir: 2, yumurta: 1 }, sure: 90 }, { id: "kek", adet: 1, gir: { havuc: 2, yumurta: 1, bugday: 1 }, sure: 120 }, { id: "turta", adet: 1, gir: { elma: 2, bugday: 2, yumurta: 1 }, sure: 150 }, { id: "pasta", adet: 1, gir: { cilek: 2, krema: 1, yumurta: 1 }, sure: 150 }, { id: "corba", adet: 1, gir: { kabak: 2, sut: 1 }, sure: 120 }] },
    mandira: { ad: "Mandıra", sv: 5, tarif: [{ id: "krema", adet: 1, gir: { sut: 1 }, sure: 60 }, { id: "tereyagi", adet: 1, gir: { sut: 2 }, sure: 90 }, { id: "peynir", adet: 1, gir: { kecisutu: 2 }, sure: 120 }] },
    kafe: { ad: "Kafe", sv: 4, tarif: [{ id: "americano", adet: 1, gir: { kahve: 2 }, sure: 45 }, { id: "muffin", adet: 1, gir: { yabanmersini: 2, bugday: 2, yumurta: 1 }, sure: 90 }, { id: "atomtost", adet: 1, gir: { ekmek: 1, sut: 1, yumurta: 1 }, sure: 75 }, { id: "sufle", adet: 1, gir: { cilek: 3, yumurta: 1, tereyagi: 1 }, sure: 180 }, { id: "lavantalatte", adet: 1, gir: { kahve: 2, sut: 1, lavanta: 1 }, sure: 90 }] },
    recel: { ad: "Reçel Evi", sv: 5, tarif: [{ id: "recel", adet: 1, gir: { cilek: 3 }, sure: 90 }, { id: "ymrecel", adet: 1, gir: { yabanmersini: 3 }, sure: 90 }, { id: "elmarecel", adet: 1, gir: { elma: 3 }, sure: 80 }] },
    smoothie: { ad: "Smoothie Bar", sv: 6, tarif: [{ id: "limonata", adet: 1, gir: { limon: 2 }, sure: 45 }, { id: "smoothie", adet: 1, gir: { cilek: 2, sut: 1 }, sure: 60 }, { id: "ymsmoothie", adet: 1, gir: { yabanmersini: 2, sut: 1 }, sure: 60 }] },
    dokuma: { ad: "Dokuma Atölyesi", sv: 6, tarif: [{ id: "ip", adet: 1, gir: { yun: 2 }, sure: 60 }, { id: "atki", adet: 1, gir: { ip: 2 }, sure: 120 }, { id: "kazak", adet: 1, gir: { ip: 3 }, sure: 180 }] }
  };
  var KUYRUK = 3;
  var HAYVAN = {
    tavuk: { ad: "Tavuk", yer: "Kümes", yerId: "kumes", urun: "yumurta", yem: "tyem", sure: 60, sv: 2, ilk: 3, max: 6, fiyat: 50, ses: "tavuk", hiz: 0.8, boy: 0.42, ik: "🐔" },
    inek: { ad: "İnek", yer: "Ahır", yerId: "ahir", urun: "sut", yem: "iyem", sure: 120, sv: 5, ilk: 2, max: 4, fiyat: 140, ses: "inek", hiz: 0.32, boy: 1.25, ik: "🐄" },
    koyun: { ad: "Koyun", yer: "Ağıl", yerId: "agil", urun: "yun", yem: "iyem", sure: 150, sv: 6, ilk: 2, max: 4, fiyat: 120, ses: "koyun", hiz: 0.4, boy: 0.9, ik: "🐑" },
    keci: { ad: "Keçi", yer: "Ağıl", yerId: "agil", urun: "kecisutu", yem: "iyem", sure: 180, sv: 7, ilk: 1, max: 3, fiyat: 160, ses: "keci", hiz: 0.5, boy: 0.8, ik: "🐐" }
  };
  var HAYVANLAR = ["tavuk", "inek", "koyun", "keci"], YERLER = { kumes: ["tavuk"], ahir: ["inek"], agil: ["koyun", "keci"] }, YER_AD = { kumes: "Kümes", ahir: "Ahır", agil: "Ağıl" };
  function yerSv(id) { return Math.min.apply(null, YERLER[id].map(function (t) { return HAYVAN[t].sv; })); }
  var SV_XP = [0, 0, 10, 30, 65, 115, 185, 275, 390, 530, 700, 900];
  function svXp(l) { return l < SV_XP.length ? SV_XP[l] : 900 + (l - 11) * 240; }
  var SLOT = [[1, 1], [1, 2], [0, 1], [0, 2], [1, 0], [0, 0], [1, 3], [0, 3], [2, 1], [2, 2], [2, 0], [2, 3]];
  var SLOT_SV = [1, 1, 1, 1, 2, 2, 3, 3, 5, 5, 7, 7], SLOT_FIYAT = [0, 0, 0, 0, 30, 45, 70, 95, 140, 180, 240, 300];
  function slotYer(i) { var s = SLOT[i]; return [-4.05 + s[1] * 2.7, -2.2 + s[0] * 2.7]; }
  var YER = { ev: [-12.8, -9.7], yem: [-6.3, -10.0], firin: [0, -10.3], mandira: [6.3, -10.0], ambar: [13.0, -9.8], pano: [-5.8, 9.0], gol: [7.4, 8.9], tabela: [-11.0, 10.4], kafe: [14.2, 9.0], masa: [-16.4, -9.6], recel: [-6.3, -16.6], dokuma: [0.2, -16.8], smoothie: [6.6, -16.5], market: [-14.4, 6.8] };
  var KUMES = { x0: -16.2, x1: -9.8, z0: -1.0, z1: 4.2 }, AHIR = { x0: 9.8, x1: 17.2, z0: -1.4, z1: 5.0 }, AGIL = { x0: -24.2, x1: -17.6, z0: -1.4, z1: 4.6 }, YOL_Z = 12.7, PARK_X = -1.8;
  var ALAN = { kumes: { x0: -15.5, x1: -10.5, z0: 1.0, z1: 3.6 }, ahir: { x0: 10.9, x1: 16.1, z0: 1.5, z1: 3.7 }, agil: { x0: -23.5, x1: -18.3, z0: 1.2, z1: 4.0 } };

  var SVG = {
    tyem: '<svg viewBox="0 0 32 32"><path d="M10.5 9c-.3-1.6.8-3 2.4-3h6.2c1.6 0 2.7 1.4 2.4 3l2.6 14.5c.6 3.2-1.8 6-5 6h-6.2c-3.2 0-5.6-2.8-5-6z" fill="#f0e2c0" stroke="#a8875a" stroke-width="1.5"/><path d="M11.8 9.6h8.4" stroke="#a8875a" stroke-width="2.2" stroke-linecap="round"/><g fill="#f2b632" stroke="#b9821b" stroke-width=".8"><ellipse cx="14" cy="19" rx="2" ry="2.8" transform="rotate(-25 14 19)"/><ellipse cx="18.2" cy="19" rx="2" ry="2.8" transform="rotate(25 18.2 19)"/><ellipse cx="16.1" cy="23" rx="2" ry="2.6"/></g></svg>',
    iyem: '<svg viewBox="0 0 32 32"><path d="M10.5 9c-.3-1.6.8-3 2.4-3h6.2c1.6 0 2.7 1.4 2.4 3l2.6 14.5c.6 3.2-1.8 6-5 6h-6.2c-3.2 0-5.6-2.8-5-6z" fill="#e6efd2" stroke="#7f9a5a" stroke-width="1.5"/><path d="M11.8 9.6h8.4" stroke="#7f9a5a" stroke-width="2.2" stroke-linecap="round"/><g fill="#5cb85c" stroke="#3a8a3a" stroke-width=".8"><circle cx="14.2" cy="18.3" r="2.4"/><circle cx="18" cy="18.3" r="2.4"/><circle cx="16.1" cy="21.4" r="2.4"/></g><path d="M16.1 22.5v3.6" stroke="#3a8a3a" stroke-width="1.4" stroke-linecap="round"/></svg>',
    krema: '<svg viewBox="0 0 32 32"><path d="M8 16c0-3.5 3-4 4.5-5.5C14 9 15 6.5 17.5 7c2.2.5 1 3 3 3.8 2.5 1 3.5 2.5 3.5 5.2z" fill="#fffaf0" stroke="#d8cdb8" stroke-width="1.3"/><path d="M4.5 16h23c0 6-5.1 10.5-11.5 10.5S4.5 22 4.5 16z" fill="#7fb2e0" stroke="#4f86c6" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    kahve: '<svg viewBox="0 0 32 32"><ellipse cx="12.5" cy="17" rx="5.5" ry="7.5" transform="rotate(-30 12.5 17)" fill="#7a4a2a" stroke="#4e2d18" stroke-width="1.2"/><path d="M9.5 12.5c3 2 3 6.5 0 9" stroke="#4e2d18" stroke-width="1.4" fill="none"/><ellipse cx="21" cy="15" rx="5.5" ry="7.5" transform="rotate(25 21 15)" fill="#8d5a35" stroke="#4e2d18" stroke-width="1.2"/><path d="M18.5 10.5c3 2 3 6.5 0 9" stroke="#4e2d18" stroke-width="1.4" fill="none"/></svg>',
    americano: '<svg viewBox="0 0 32 32"><path d="M6 11h17l-1.6 13.2A3 3 0 0 1 18.4 27h-7.8a3 3 0 0 1-3-2.8z" fill="#fff" stroke="#8a6a45" stroke-width="1.4"/><path d="M7.2 14h14.6l-.8 6.5H8z" fill="#5a3421"/><path d="M23 13.5h2.5a3 3 0 0 1 0 6H22" fill="none" stroke="#8a6a45" stroke-width="1.6"/><path d="M11 4.5c0 1.5-1.5 2-1.5 3.5M15 4.5c0 1.5-1.5 2-1.5 3.5M19 4.5c0 1.5-1.5 2-1.5 3.5" stroke="#b9a58f" stroke-width="1.4" stroke-linecap="round" fill="none"/></svg>',
    muffin: '<svg viewBox="0 0 32 32"><path d="M8.5 16h15l-1.4 10.5a2 2 0 0 1-2 1.5H11.9a2 2 0 0 1-2-1.5z" fill="#e7b96b" stroke="#a87b3a" stroke-width="1.3"/><path d="M11 17v10M16 17v11M21 17v10" stroke="#c99a4a" stroke-width="1.2"/><path d="M7 15c-1.5-6 4-9 9-7 5-2 10.5 1 9 7z" fill="#d9a05a" stroke="#a87b3a" stroke-width="1.3"/><circle cx="12" cy="11.5" r="1.4" fill="#4356b8"/><circle cx="17.5" cy="9.5" r="1.4" fill="#4356b8"/><circle cx="21" cy="13" r="1.3" fill="#4356b8"/><circle cx="15" cy="13.5" r="1.1" fill="#4356b8"/></svg>',
    nar: '<svg viewBox="0 0 32 32"><circle cx="16" cy="18" r="10.5" fill="#c62828" stroke="#7f1d1d" stroke-width="1.4"/><path d="M12 6.5l2 3h4l2-3-2.5 1.5L16 5l-1.5 3z" fill="#6d4c41"/><circle cx="13" cy="16" r="1.6" fill="#ff8a80"/><circle cx="18" cy="20" r="1.6" fill="#ff8a80"/><circle cx="15" cy="22" r="1.3" fill="#ff8a80"/></svg>',
    ymrecel: '<svg viewBox="0 0 32 32"><rect x="8" y="10" width="16" height="17" rx="4" fill="#4356b8" stroke="#2c3a85" stroke-width="1.4"/><rect x="7" y="6" width="18" height="5" rx="2" fill="#e8d7b5" stroke="#a88a52" stroke-width="1.3"/><rect x="11" y="15" width="10" height="7" rx="1.5" fill="#fff8e6"/></svg>',
    elmarecel: '<svg viewBox="0 0 32 32"><rect x="8" y="10" width="16" height="17" rx="4" fill="#e5a93b" stroke="#9c6b16" stroke-width="1.4"/><rect x="7" y="6" width="18" height="5" rx="2" fill="#e8d7b5" stroke="#a88a52" stroke-width="1.3"/><rect x="11" y="15" width="10" height="7" rx="1.5" fill="#fff8e6"/></svg>',
    ymsmoothie: '<svg viewBox="0 0 32 32"><path d="M9 8h14l-2 19H11z" fill="#5c6bc0" stroke="#2c3a85" stroke-width="1.4"/><path d="M9.5 8h13l-.6 5H10.1z" fill="#c5cae9"/><path d="M18 3l-4 10" stroke="#e85d75" stroke-width="2" stroke-linecap="round"/></svg>',
    latte: '<svg viewBox="0 0 32 32"><path d="M6 11h17l-1.6 13.2A3 3 0 0 1 18.4 27h-7.8a3 3 0 0 1-3-2.8z" fill="#fff" stroke="#8a6a45" stroke-width="1.4"/><path d="M7.2 14h14.6l-.8 6.5H8z" fill="#c9b6e6"/><path d="M23 13.5h2.5a3 3 0 0 1 0 6H22" fill="none" stroke="#8a6a45" stroke-width="1.6"/><circle cx="12" cy="16" r="1.2" fill="#8e7cc3"/><circle cx="17" cy="17" r="1.2" fill="#8e7cc3"/></svg>',
    para: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="12.5" fill="#f7c948" stroke="#b7861b" stroke-width="2"/><circle cx="16" cy="16" r="8.6" fill="none" stroke="#e0a92a" stroke-width="1.6"/><path d="M16 10.5l1.7 3.5 3.8.5-2.8 2.6.7 3.8-3.4-1.8-3.4 1.8.7-3.8-2.8-2.6 3.8-.5z" fill="#fff3c4"/><path d="M9 11.5a8.5 8.5 0 0 1 5-3.6" stroke="#fff6d6" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>'
  };
  function ik(id) { var u = URUN[id], s = u ? u.ik : ""; return '<span class="cfik">' + (s.charAt(0) === "@" ? SVG[s.slice(1)] : s) + "</span>"; }
  var PARA = '<span class="cfik cfpara-ik">' + SVG.para + "</span>";

  /* ================= kayıt ================= */
  var KEY = "cf_kayit", S = null, kirli = false, kayitT = 0;
  function bosBina() { return { k: [], h: [] }; }
  function yeniDurum() {
    var now = Date.now();
    return { v: 1, ad: "Büşra'nın Çiftliği", sv: 1, xp: 0, altin: 30, env: { bugday: 2 },
      tarla: [{ u: "bugday", t: now - 60000, s: 0 }, { u: "bugday", t: now - 60000, s: 0 }, { u: null, t: 0, s: 0 }, { u: null, t: 0, s: 0 }],
      hay: { tavuk: [], inek: [], koyun: [], keci: [] }, bina: { yem: bosBina(), firin: bosBina(), mandira: bosBina(), kafe: bosBina(), recel: bosBina(), smoothie: bosBina(), dokuma: bosBina() }, fav: {}, agac: [], dekor: {}, tezgah: [], kar: null,
      sip: [{ u: { bugday: 2 }, altin: 10, xp: 3 }, { u: { bugday: 3 }, altin: 14, xp: 4 }, { u: { bugday: 4 }, altin: 18, xp: 5 }],
      ist: { hasat: 0, siparis: 0, ekim: 0 }, yeni: true, olus: now };
  }
  function yukleDurum() {
    var d = null; try { d = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { d = null; }
    if (!d || d.v !== 1 || !d.tarla) return yeniDurum();
    d.env = d.env || {}; d.hay = d.hay || {}; HAYVANLAR.forEach(function (h) { d.hay[h] = d.hay[h] || []; }); d.agac = d.agac || []; d.dekor = d.dekor || {}; d.tezgah = d.tezgah || []; if (d.kar === undefined) d.kar = null;
    d.bina = d.bina || {}; BINALAR.forEach(function (b) { d.bina[b] = d.bina[b] || bosBina(); d.bina[b].k = d.bina[b].k || []; d.bina[b].h = d.bina[b].h || []; }); d.fav = d.fav || {};
    d.sip = d.sip || []; d.ist = d.ist || { hasat: 0, siparis: 0, ekim: 0 }; d.yeni = !!d.yeni;
    return d;
  }
  var bulutRef = null, bulutT = 0, bulutBekleyen = false, bulutSon = 0;
  function kaydet() { kirli = false; S.z = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} bulutPlanla(); }
  /* hesap varsa aynı kayıt buluta da gider (ciftlik/{uid}); en son kaydedilen (z) kazanır, böylece her cihazdan aynı çiftlik */
  function bulutPlanla() { if (!bulutRef) return; bulutBekleyen = true; clearTimeout(bulutT); bulutT = setTimeout(bulutYaz, 2500); }
  function bulutYaz() {
    if (!bulutRef || !bulutBekleyen) return; bulutBekleyen = false; bulutSon = S.z;
    try { bulutRef.set(JSON.parse(JSON.stringify(S))).catch(function () { bulutBekleyen = true; }); } catch (e) { bulutBekleyen = true; }
  }
  function degisti() { kirli = true; clearTimeout(kayitT); kayitT = setTimeout(kaydet, 700); hudYaz(); if (sheet.tur) sheetCiz(); ipucuYaz(); balonlariYaz(); }
  addEventListener("pagehide", function () { if (S) { kaydet(); bulutYaz(); } });
  document.addEventListener("visibilitychange", function () { if (document.hidden && S) { kaydet(); bulutYaz(); } });

  /* ================= sahne ================= */
  var scene = new T.Scene(), GOK = 0xa8dcf6;
  scene.background = new T.Color(GOK); scene.fog = new T.Fog(GOK, 62, 125);
  var camera = new T.PerspectiveCamera(36, 1, 0.5, 240);
  scene.add(new T.HemisphereLight(0xfdfbf2, 0x7aa957, 0.44));
  scene.add(new T.AmbientLight(0xffffff, 0.06));
  var gunes = new T.DirectionalLight(0xfff0d4, 0.74); gunes.position.set(16, 30, 14); gunes.castShadow = true;
  var gs = MOBIL ? 1024 : 2048; gunes.shadow.mapSize.set(gs, gs);
  (function () { var c = gunes.shadow.camera; c.left = -27; c.right = 27; c.top = 24; c.bottom = -24; c.near = 5; c.far = 85; c.updateProjectionMatrix(); })();
  gunes.shadow.bias = -0.0006; gunes.shadow.normalBias = 0.03;
  scene.add(gunes); scene.add(gunes.target);

  var matV = new T.MeshLambertMaterial({ vertexColors: true });
  var ruzgar = { value: 0 };
  function ruzgarMat(guc, taban) {
    var m = new T.MeshLambertMaterial({ vertexColors: true });
    m.onBeforeCompile = function (sh) {
      sh.uniforms.uZaman = ruzgar;
      sh.vertexShader = "uniform float uZaman;\n" + sh.vertexShader.replace("#include <begin_vertex>", [
        "#include <begin_vertex>",
        "float rzH = max(transformed.y - " + taban.toFixed(2) + ", 0.0);",
        "vec4 rzW = modelMatrix * vec4(transformed, 1.0);",
        "float rzS = sin(uZaman * 1.7 + rzW.x * 0.8 + rzW.z * 0.6) + 0.45 * sin(uZaman * 3.3 + rzW.x * 2.1 - rzW.z * 1.3);",
        "transformed.x += rzS * " + guc.toFixed(3) + " * rzH;",
        "transformed.z += rzS * " + (guc * 0.6).toFixed(3) + " * rzH;"
      ].join("\n"));
    };
    m.customProgramCacheKey = function () { return "rz" + guc + "_" + taban; };
    return m;
  }
  var matEkin = ruzgarMat(0.075, 0.27), matAgac = ruzgarMat(0.014, 0.9);
  var secilebilir = [], tarlaPick = [];
  function hedefle(obj, h) { obj.userData.hedef = h; secilebilir.push(obj); return obj; }

  /* zemin: hafif dalgalı renkli çimen */
  (function () {
    var g = new T.PlaneGeometry(240, 240, 90, 90); g.rotateX(-Math.PI / 2);
    var p = g.attributes.position, c = new Float32Array(p.count * 3), a = new T.Color(0x6fbb45), b = new T.Color(0x5ca23a), d = new T.Color(0x80c74f), u = new T.Color(0x5a9a3d), t = new T.Color();
    for (var i = 0; i < p.count; i++) {
      var x = p.getX(i), z = p.getZ(i), n = Math.sin(x * 0.33 + z * 0.21) * 0.5 + Math.sin(x * 0.13 - z * 0.41) * 0.5 + Math.sin((x + z) * 0.9) * 0.18;
      t.copy(a).lerp(n > 0 ? d : b, Math.min(1, Math.abs(n) * 0.55));
      var r = Math.hypot(x, z * 1.15); if (r > 38) t.lerp(u, Math.min(0.85, (r - 38) / 45));
      c[i * 3] = t.r; c[i * 3 + 1] = t.g; c[i * 3 + 2] = t.b;
    }
    g.setAttribute("color", new T.BufferAttribute(c, 3));
    var m = new T.Mesh(g, new T.MeshLambertMaterial({ vertexColors: true })); m.receiveShadow = true; scene.add(m);
  })();

  /* doğa ve yollar (tek parça) */
  var R = CM.R;
  (function () {
    var K = new CM.Kur(2026), r = K.r;
    /* yollar: koyu kenar + açık toprak */
    function yol(w, d, x, z) { K.kutu(w + 0.28, 0.025, d + 0.28, R.yolK, x, 0, z, 0, 0, 0, 0.04); K.kutu(w, 0.04, d, R.yol, x, 0, z, 0, 0, 0, 0.035); }
    yol(150, 2.9, 0, YOL_Z); yol(1.9, 7.2, 0, 8.3); yol(1.4, 2.6, 14.2, 11.3); yol(26, 1.4, 0, -13.4); yol(1.4, 2.0, -3.2, -12.0); yol(1.4, 2.0, 3.4, -12.0); yol(1.4, 3.4, -13.4, 8.6); yol(4.4, 1.4, -2.9, 8.3); yol(33, 1.6, 0, -6.7); yol(1.6, 2.4, 0, -4.7); yol(3.6, 1.4, -7.7, 1.5); yol(3.6, 1.4, 7.7, 1.6);
    for (var ys = 0; ys < 46; ys++) { var yx = -23 + ys + r() * 0.6; K.tas(0.12 + r() * 0.1, 0.05, 0.1 + r() * 0.08, 0xcfb07a, yx, 0.045, YOL_Z + (r() - 0.5) * 2.2, r() * 3); }
    /* kümes ve ahır alanları */
    K.kutu(KUMES.x1 - KUMES.x0, 0.03, KUMES.z1 - KUMES.z0, 0xdcc78c, (KUMES.x0 + KUMES.x1) / 2, 0, (KUMES.z0 + KUMES.z1) / 2, 0, 0, 0, 0.05);
    K.kutu(AHIR.x1 - AHIR.x0, 0.025, AHIR.z1 - AHIR.z0, 0x74bb48, (AHIR.x0 + AHIR.x1) / 2, 0, (AHIR.z0 + AHIR.z1) / 2, 0, 0, 0, 0.04);
    var km = (KUMES.z0 + KUMES.z1) / 2, am = (AHIR.z0 + AHIR.z1) / 2;
    CM.cit(K, [[KUMES.x1, km - 0.75], [KUMES.x1, KUMES.z0], [KUMES.x0, KUMES.z0], [KUMES.x0, KUMES.z1], [KUMES.x1, KUMES.z1], [KUMES.x1, km + 0.75]], false, 1.1);
    CM.cit(K, [[AHIR.x0, am + 0.85], [AHIR.x0, AHIR.z1], [AHIR.x1, AHIR.z1], [AHIR.x1, AHIR.z0], [AHIR.x0, AHIR.z0], [AHIR.x0, am - 0.85]], false, 1.2);
    K.kutu(AGIL.x1 - AGIL.x0, 0.025, AGIL.z1 - AGIL.z0, 0x8fc45a, (AGIL.x0 + AGIL.x1) / 2, 0, (AGIL.z0 + AGIL.z1) / 2, 0, 0, 0, 0.04);
    var gm = (AGIL.z0 + AGIL.z1) / 2;
    CM.cit(K, [[AGIL.x1, gm - 0.8], [AGIL.x1, AGIL.z0], [AGIL.x0, AGIL.z0], [AGIL.x0, AGIL.z1], [AGIL.x1, AGIL.z1], [AGIL.x1, gm + 0.8]], false, 1.1);
    K.kutu(1.2, 0.38, 0.5, R.tasK, -19.2, 0, 4.0); K.kutu(1.1, 0.05, 0.4, R.su, -19.2, 0.38, 4.0);
    K.kutu(1.0, 0.25, 0.36, R.tahtaK, -11.2, 0, 0.2); K.kutu(0.9, 0.06, 0.28, R.sari, -11.2, 0.25, 0.2, 0, 0, 0, 0.1);
    K.kutu(1.6, 0.42, 0.6, R.tasK, 11.2, 0, 4.2); K.kutu(1.45, 0.05, 0.48, R.su, 11.2, 0.42, 4.2);
    CM.saman(K, 8.7, -2.6, 0.3); CM.saman(K, 8.1, -3.4, -0.4); CM.saman(K, 16.7, -0.9, 1.2);
    CM.saman(K, 15.7, -7.9, 0.2); CM.saman(K, 16.5, -7.2, 1.0);
    /* gölet kenarı, nilüfer, saz */
    K.disk(3.25, 2.35, 0.05, 26, 0xe2cf98, YER.gol[0], 0.0, YER.gol[1], 0.04);
    [[1.6, 0.6], [-1.3, -0.5], [0.3, 1.1]].forEach(function (p) { K.disk(0.36, 0.36, 0.03, 9, 0x57b157, YER.gol[0] + p[0], 0.085, YER.gol[1] + p[1]); });
    K.top(0.09, 0.07, 0.09, 0xff8fb3, YER.gol[0] + 1.6, 0.14, YER.gol[1] + 0.6, 0);
    for (var s = 0; s < 9; s++) { var sa = 2.3 + s * 0.14, sx = YER.gol[0] + Math.cos(sa) * 3.0, sz = YER.gol[1] + Math.sin(sa) * 2.1; K.sil(0.025, 0.03, 0.9 + r() * 0.4, 4, 0x6aa84f, sx, 0, sz); K.sil(0.05, 0.05, 0.22, 5, 0x7a4f2a, sx, 0.85 + r() * 0.3, sz); }
    [[2.9, -1.4], [3.2, 0.9], [-3.0, 1.3], [-2.6, -1.6]].forEach(function (p) { CM.kaya(K, YER.gol[0] + p[0], YER.gol[1] + p[1], 0.9 + r() * 0.5); });
    /* çiçekler */
    var CR = [0xff8fb3, 0xffd15c, 0xffffff, 0xb79cf2, 0xff6b86, 0xffa94d];
    function tarh(cx, cz, w, d, n) { for (var i = 0; i < n; i++) CM.cicek(K, cx + (r() - 0.5) * w, cz + (r() - 0.5) * d, CR[Math.floor(r() * CR.length)]); }
    tarh(-12.8, -7.2, 4.4, 0.8, 16); tarh(-1.4, 6.2, 0.6, 3, 7); tarh(1.4, 6.2, 0.6, 3, 7); tarh(-11.0, 11.5, 3.6, 0.6, 9); tarh(3.3, 6.9, 1.0, 1.2, 6); tarh(-7.4, -7.6, 1.6, 0.6, 6); tarh(7.6, -7.6, 1.6, 0.6, 6);
    /* çimen tutamları */
    function serbest(x, z) {
      if (x > -5.7 && x < 5.7 && z > -3.8 && z < 4.8) return false;
      if (z > -12.8 && z < -5.7 && x > -16.5 && x < 18.5) return false;
      if (x > -16.6 && x < -9.4 && z > -1.5 && z < 4.7) return false;
      if (x > 9.4 && x < 17.6 && z > -1.9 && z < 5.5) return false;
      if (Math.pow((x - YER.gol[0]) / 3.6, 2) + Math.pow((z - YER.gol[1]) / 2.7, 2) < 1) return false;
      if (z > YOL_Z - 1.8 && z < YOL_Z + 1.8) return false;
      if (Math.abs(x) < 1.3 && z > 4.4 && z < 12) return false;
      if (x > 12 && x < 16.6 && z > 6.8 && z < 12) return false;
      if (x > -17.6 && x < -15.2 && z > -10.6 && z < -8.6) return false;
      if (z < -14.4 && z > -19 && x > -9 && x < 9) return false;
      if (x > -25 && x < -16.5 && z > -2.2 && z < 5.4) return false;
      if (x > 0.6 && x < 16.2 && z > 14 && z < 17.2) return false;
      if (x > -16.6 && x < -12.2 && z > 5.2 && z < 8.6) return false;
      if (x > -7.4 && x < -0.6 && z > 7.4 && z < 9.9) return false;
      if (x > -13.2 && x < -8.8 && z > 9.4 && z < 11.6) return false;
      if (Math.abs(z - 1.55) < 1.0 && Math.abs(Math.abs(x) - 7.7) < 2.0) return false;
      return true;
    }
    var TUT = [0x5aa63b, 0x4f9a35, 0x67b347, 0x76c052];
    for (var tt = 0; tt < 420; tt++) {
      var tx = (r() - 0.5) * 50, tz = (r() - 0.5) * 38; if (!serbest(tx, tz)) continue;
      var tc = TUT[Math.floor(r() * TUT.length)];
      for (var tb = 0; tb < 3; tb++) K.koniM(0.05, 0.22 + r() * 0.2, 3, tc, tx + (tb - 1) * 0.07, 0.12, tz + (r() - 0.5) * 0.08, (r() - 0.5) * 0.4, r() * 3, (tb - 1) * 0.35);
    }
    for (var fc = 0; fc < 70; fc++) { var fx = (r() - 0.5) * 46, fz = (r() - 0.5) * 34; if (serbest(fx, fz)) CM.cicek(K, fx, fz, CR[Math.floor(r() * CR.length)]); }
    /* çalılar, kayalar */
    [[-14.9, -7.1], [-9.4, -7.3], [9.6, -7.2], [17.4, -6.4], [-17, 5.4], [18.2, 6.1], [-8.4, 6.6], [4.6, 5.8], [-3.2, -7.4], [3.2, -7.5]].forEach(function (p) { CM.cali(K, p[0], p[1], 0.9 + r() * 0.5); });
    [[-19.5, 8], [20.5, -3], [-20, -5], [12, 15.6], [-15, 16]].forEach(function (p) { CM.kaya(K, p[0], p[1], 1 + r()); });
    var m = K.mesh(matV); m.castShadow = true; scene.add(m);
    /* ağaçlar (rüzgârda hafifçe sallanır) */
    var A = new CM.Kur(77), ra = A.r;
    function bosMu(x, z) {
      if (Math.abs(x) < 18.6 && z > -19.2 && z < 14.6) return false;                              /* çiftliğin kendisi */
      if (x < -16 && x > -25.5 && z > -2.6 && z < 5.8) return false;                               /* ağıl */
      if (x > 0 && x < 17 && z > 13.8 && z < 17.6) return false;                                    /* fidan yerleri */
      if (z > YOL_Z - 2.2 && z < YOL_Z + 2.2) return false;                                        /* yol */
      return true;
    }
    for (var gx = -34; gx <= 34; gx += 2.7) for (var gz = -26; gz <= 26; gz += 2.7) {
      var x = gx + (ra() - 0.5) * 1.8, z = gz + (ra() - 0.5) * 1.8;
      if (!bosMu(x, z) || ra() < 0.38) continue;
      CM.agac(A, x, z, 0.85 + ra() * 0.5, ra() < 0.28 ? "cam" : "yuvarlak");
    }
    [[-16.8, -12.6], [-9.6, -12.8], [-3.4, -12.9], [3.3, -12.9], [9.7, -12.7], [17.2, -12.4], [-17.6, 6.6], [-19.6, -0.2], [18.4, 7.4], [18.6, -4.4], [-14.2, 15.8], [14.4, 15.9], [4.0, 15.6], [-6.5, 15.7]].forEach(function (p) { CM.agac(A, p[0], p[1], 0.9 + ra() * 0.35, ra() < 0.3 ? "cam" : "yuvarlak"); });
    var am2 = A.mesh(matAgac); am2.castShadow = true; am2.receiveShadow = false; scene.add(am2);
  })();

  /* gölet suyu (dokununca halka) */
  var su = new T.Mesh(new T.CylinderGeometry(1, 1, 0.05, 32), new T.MeshPhongMaterial({ color: 0x5bc0eb, shininess: 90, specular: 0xbfefff, transparent: true, opacity: 0.92 }));
  su.scale.set(2.8, 1, 1.95); su.position.set(YER.gol[0], 0.055, YER.gol[1]); su.receiveShadow = true; scene.add(su); hedefle(su, { tip: "gol" });
  var halkalar = [];

  /* bulutlar */
  var bulutlar = [], bulutMat = new T.MeshLambertMaterial({ color: 0xffffff, emissive: 0x99aabb, emissiveIntensity: 0.25 });
  for (var bi = 0; bi < 7; bi++) { var bm = new T.Mesh(CM.bulut(500 + bi).geo(), bulutMat); bm.position.set(-50 + bi * 15 + Math.random() * 6, 17 + Math.random() * 5, -32 + Math.random() * 40); bm.scale.setScalar(1 + Math.random() * 0.6); scene.add(bm); bulutlar.push({ m: bm, v: 0.5 + Math.random() * 0.4 }); }

  /* ================= metin dokuları ================= */
  function yaziDoku(w, h, ciz) { var c = document.createElement("canvas"); c.width = w; c.height = h; ciz(c.getContext("2d"), w, h); var t = new T.CanvasTexture(c); t.anisotropy = 4; return t; }
  function sigdir(g, metin, max, boy, agirlik) { var b = boy; do { g.font = (agirlik || 900) + " " + b + "px Nunito, system-ui, -apple-system, sans-serif"; b -= 2; } while (g.measureText(metin).width > max && b > 20); }
  function etiket(metin, alt, renk) {
    var tex = yaziDoku(512, 200, function (g, w, h) {
      g.fillStyle = renk || "rgba(255,248,238,.96)"; var x = 10, y = 18, rw = w - 20, rh = alt ? 160 : 120, rr = 34;
      g.beginPath(); g.moveTo(x + rr, y); g.arcTo(x + rw, y, x + rw, y + rh, rr); g.arcTo(x + rw, y + rh, x, y + rh, rr); g.arcTo(x, y + rh, x, y, rr); g.arcTo(x, y, x + rw, y, rr); g.closePath(); g.fill();
      g.lineWidth = 6; g.strokeStyle = "rgba(125,81,40,.55)"; g.stroke();
      g.fillStyle = "#5b3a1a"; g.textAlign = "center"; g.textBaseline = "middle"; sigdir(g, metin, rw - 40, 64);
      g.fillText(metin, w / 2, y + (alt ? 55 : rh / 2 + 2));
      if (alt) { g.fillStyle = "#8a6a45"; sigdir(g, alt, rw - 40, 44, 800); g.fillText(alt, w / 2, y + 118); }
    });
    var sp = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    sp.scale.set(2.6, 1.02, 1); sp.renderOrder = 5; return sp;
  }

  /* ================= isim tabelası ================= */
  var tabela = new T.Group(); tabela.position.set(YER.tabela[0], 0, YER.tabela[1]); tabela.rotation.y = 0.18; scene.add(tabela);
  tabela.add(CM.tabelaDirek().mesh(matV));
  var tabelaYazi = new T.Mesh(new T.PlaneGeometry(3.4, 0.9), new T.MeshLambertMaterial({ color: 0xffffff }));
  tabelaYazi.position.set(0, 1.375, 0.1); tabela.add(tabelaYazi); hedefle(tabelaYazi, { tip: "ev" });
  function tabelaYaz() {
    var ad = (S && S.ad) || "Çiftlik";
    var tex = yaziDoku(1024, 270, function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#d9a265"); gr.addColorStop(1, "#b9803f"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.strokeStyle = "rgba(110,70,30,.35)"; g.lineWidth = 4; for (var y = 68; y < h; y += 68) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
      g.strokeStyle = "#7d5128"; g.lineWidth = 16; g.strokeRect(8, 8, w - 16, h - 16);
      g.textAlign = "center"; g.textBaseline = "middle"; sigdir(g, ad, w - 110, 120);
      g.lineJoin = "round"; g.lineWidth = 14; g.strokeStyle = "#6b4420"; g.strokeText(ad, w / 2, h / 2 - 4); g.fillStyle = "#fff8ee"; g.fillText(ad, w / 2, h / 2 - 4);
      g.font = "900 40px Nunito, system-ui, sans-serif"; g.lineWidth = 5; g.strokeText("est. 24.09", w / 2, h - 46); g.fillStyle = "#fff3c4"; g.fillText("est. 24.09", w / 2, h - 46);
    });
    if (tabelaYazi.material.map) tabelaYazi.material.map.dispose();
    tabelaYazi.material.map = tex; tabelaYazi.material.needsUpdate = true;
  }

  /* ================= yapılar ================= */
  var binaV = {};
  function yapi(id, kurucu, x, z, ry, hedef, ust) {
    var g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = ry || 0; scene.add(g);
    var m = kurucu().mesh(matV); g.add(m); hedefle(m, hedef);
    var v = { grup: g, mesh: m, ust: new T.Vector3(x, ust || 4.4, z), pop: 0 };
    binaV[id] = v; return v;
  }
  yapi("ev", CM.ev, YER.ev[0], YER.ev[1], 0.12, { tip: "ev" }, 4.6);
  yapi("ambar", CM.ambar, YER.ambar[0], YER.ambar[1], -0.12, { tip: "ambar" }, 5.4);
  BINALAR.forEach(function (id) {
    var kur = { yem: CM.yemFabrikasi, firin: CM.firin, mandira: CM.mandira, kafe: CM.kafe, recel: CM.recelEvi, smoothie: CM.smoothieBar, dokuma: CM.dokuma }[id], p = YER[id];
    var v = yapi(id, kur, p[0], p[1], id === "kafe" ? -0.35 : 0, { tip: "bina", id: id }, id === "mandira" ? 5.0 : id === "kafe" ? 4.4 : id === "recel" ? 4.3 : id === "smoothie" ? 3.6 : id === "dokuma" ? 4.0 : 4.6);
    var ins = CM.insaat().mesh(matV); ins.position.set(p[0], 0, p[1]); scene.add(ins); hedefle(ins, { tip: "insaat", id: id });
    v.insaat = ins; v.etiket = etiket(BINA[id].ad, BINA[id].sv + ". seviyede açılır"); v.etiket.position.set(p[0], 2.3, p[1] + 0.6); scene.add(v.etiket);
  });
  var cark = CM.yemCark().mesh(matV); cark.position.set(0, 2.92, 1.34); cark.scale.setScalar(0.8); binaV.yem.grup.add(cark);
  var baca = new T.Vector3(-1.0, 4.25, -0.5).add(binaV.firin.grup.position);
  /* kümes ve ahır binaları (alan çitleri doğada) */
  var kumesB = yapi("kumes", CM.kumesBina, -14.5, -0.1, 0.1, { tip: "yer", yer: "kumes" }, 3.2);
  var ahirB = yapi("ahir", CM.ahirBina, 15.0, -0.3, -0.15, { tip: "yer", yer: "ahir" }, 3.6);
  var agilB = yapi("agil", CM.agilBina, -20.6, -0.3, 0.1, { tip: "yer", yer: "agil" }, 3.4);
  ["kumes", "ahir", "agil"].forEach(function (id) {
    var v = binaV[id], A = { kumes: KUMES, ahir: AHIR, agil: AGIL }[id];
    var cx = (A.x0 + A.x1) / 2, cz = (A.z0 + A.z1) / 2;
    var ins = CM.insaat().mesh(matV); ins.position.set(cx, 0, cz); scene.add(ins); hedefle(ins, { tip: "insaat", id: id });
    v.insaat = ins; v.etiket = etiket(YER_AD[id], yerSv(id) + ". seviyede açılır"); v.etiket.position.set(cx, 2.3, cz + 0.6); scene.add(v.etiket);
    v.ust.set(cx, 3.3, cz);
  });
  /* market tezgâhı (dükkân): tohum, fidan, hayvan, dekor alınır; ürün satılır */
  var marketB = yapi("market", CM.pano, YER.market[0], YER.market[1], 0.3, { tip: "market" }, 3.3);
  (function () { var tb = etiket("Market", "al · sat"); tb.position.set(YER.market[0], 3.1, YER.market[1]); tb.scale.set(1.8, 0.7, 1); scene.add(tb); })();
  var pano = yapi("pano", CM.pano, YER.pano[0], YER.pano[1], 0.15, { tip: "pano" }, 3.3);
  var masa = CM.mimarMasasi().mesh(matV); masa.position.set(YER.masa[0], 0, YER.masa[1]); masa.rotation.y = 0.5; masa.scale.setScalar(1.35); scene.add(masa); hedefle(masa, { tip: "masa" });
  var kamyon = { m: CM.kamyon().mesh(matV), x: PARK_X, v: 0, durum: "park", bekle: 0, teker: [], toz: 0 };
  kamyon.m.position.set(PARK_X, 0, YOL_Z - 0.35); scene.add(kamyon.m); hedefle(kamyon.m, { tip: "pano" });
  (function () { var tg = CM.teker().geo(); CM.TEKER_YER.forEach(function (w) { var t = new T.Mesh(tg, matV); t.castShadow = true; t.position.set(w[0], 0.32, w[1]); kamyon.m.add(t); kamyon.teker.push(t); }); })();
  /* yel değirmeni: ambarın yanında, kanatları rüzgârla döner */
  var yel = new T.Group(); yel.position.set(-19.6, 0, -6.4); yel.rotation.y = 0.85; scene.add(yel);
  yel.add(CM.yelDegirmeni().mesh(matV));
  var kanat = CM.yelKanat().mesh(matV); kanat.position.set(0, 3.9, 1.25); yel.add(kanat);
  function yapilariGoster(anim) {
    BINALAR.concat(["kumes", "ahir", "agil"]).forEach(function (id) {
      var v = binaV[id], sv = YERLER[id] ? yerSv(id) : BINA[id].sv, acik = S.sv >= sv;
      var once = v.grup.visible;
      v.grup.visible = acik; v.mesh.userData.aktif = acik; v.insaat.visible = !acik; v.insaat.userData.aktif = !acik; v.etiket.visible = !acik;
      if (acik && !once && anim) { v.pop = 0.0001; v.grup.scale.setScalar(0.01); }
    });
  }

  /* ================= tarlalar ================= */
  var TOPRAK = CM.tarlaToprak(), tarlaV = [];
  for (var ti = 0; ti < SLOT.length; ti++) {
    var tp = slotYer(ti), tg = new T.Group(); tg.position.set(tp[0], 0, tp[1]); scene.add(tg);
    var top = new T.Mesh(TOPRAK, matV); top.receiveShadow = true; tg.add(top); top.userData.hedef = { tip: "tarla", i: ti };
    var pick = new T.Mesh(new T.BoxGeometry(2.5, 0.3, 2.5), matV); pick.visible = false; pick.position.y = 0.15; tg.add(pick); pick.userData.hedef = { tip: "tarlaAl", i: ti };
    var ekM = new T.Mesh(TOPRAK, matEkin); ekM.castShadow = true; ekM.visible = false; tg.add(ekM);
    tarlaV.push({ grup: tg, toprak: top, pick: pick, ekin: ekM, asama: -1, tur: null, pop: 0, isaret: null });
  }
  function asamaOf(i) {
    var t = S.tarla[i]; if (!t || !t.u) return 0;
    var f = (Date.now() - t.t) / (((t.s || EKIN_SURE[t.u]) * 1000) || 1);
    return f >= 1 ? 3 : f < 0.34 ? 1 : 2;
  }
  function olgun(i) { return asamaOf(i) === 3; }
  function kalanMs(i) { var t = S.tarla[i]; return t && t.u ? t.t + (t.s || EKIN_SURE[t.u]) * 1000 - Date.now() : 0; }
  function tarlalariYaz(anim) {
    var sahip = S.tarla.length;
    for (var i = 0; i < tarlaV.length; i++) {
      var v = tarlaV[i], var_ = i < sahip;
      v.toprak.visible = var_; v.toprak.userData.aktif = var_;
      if (var_ && secilebilir.indexOf(v.toprak) < 0) { secilebilir.push(v.toprak); tarlaPick.push(v.toprak); }
      var siradaki = i === sahip, kilit = siradaki && SLOT_SV[i] > S.sv;
      v.pick.userData.aktif = siradaki && !kilit;
      if (siradaki && secilebilir.indexOf(v.pick) < 0) secilebilir.push(v.pick);
      if (v.isaret) { v.grup.remove(v.isaret); v.isaret.material.map.dispose(); v.isaret.material.dispose(); v.isaret = null; }
      if (siradaki) { v.isaret = etiket(kilit ? "🔒 Yeni tarla" : "+ Yeni tarla", kilit ? SLOT_SV[i] + ". seviyede" : SLOT_FIYAT[i] + " altın", kilit ? "rgba(255,248,238,.82)" : "rgba(255,246,210,.97)"); v.isaret.position.set(0, 1.0, 0); v.isaret.scale.set(2.2, 0.86, 1); v.grup.add(v.isaret); }
      if (var_) tarlaGorsel(i, anim);
      else { v.ekin.visible = false; v.asama = -1; }
    }
  }
  function tarlaGorsel(i, anim) {
    var v = tarlaV[i], t = S.tarla[i], a = asamaOf(i), tur = t && t.u;
    if (a === v.asama && tur === v.tur) return;
    v.asama = a; v.tur = tur;
    if (!a) { v.ekin.visible = false; return; }
    v.ekin.geometry = CM.ekinGeo(tur, a); v.ekin.visible = true;
    if (anim && !AZ_HAREKET) { v.pop = 0.0001; v.ekin.scale.set(1, 0.2, 1); }
  }

  /* ================= hayvanlar ================= */
  var HGEO = { tavuk: CM.tavuk().geo(), inek: CM.inek().geo(), koyun: CM.koyun().geo(), keci: CM.keci().geo() }, KUYRUK_G = CM.kuyruk().geo(), YUMURTA_G = CM.yumurtaMesh().geo(), KOVA_G = CM.sutKovasi().geo();
  var UGEO = { tavuk: YUMURTA_G, inek: KOVA_G, koyun: (function () { var K = new CM.Kur(190); K.top(0.16, 0.14, 0.16, 0xfaf6ef, 0, 0.14, 0, 1, 0.03); K.silM(0.01, 0.01, 0.3, 3, 0xe85d75, 0, 0.14, 0, 0, 0, 1.2); return K.geo(); })(), keci: KOVA_G };
  var hayV = { tavuk: [], inek: [], koyun: [], keci: [] };
  function alanRastgele(A, pay) { return [A.x0 + pay + Math.random() * (A.x1 - A.x0 - pay * 2), A.z0 + pay + Math.random() * (A.z1 - A.z0 - pay * 2)]; }
  function hayvanlariEsitle() {
    HAYVANLAR.forEach(function (tur) {
      var L = S.hay[tur], V = hayV[tur], A = ALAN[HAYVAN[tur].yerId], pay = 0;
      while (V.length > L.length) { var fz = V.pop(); scene.remove(fz.m); scene.remove(fz.urun); var si = secilebilir.indexOf(fz.m); if (si >= 0) secilebilir.splice(si, 1); }
      while (V.length < L.length) {
        var i = V.length, p = alanRastgele(A, pay), m = new T.Mesh(HGEO[tur], matV); m.castShadow = true;
        m.position.set(p[0], 0, p[1]); m.rotation.y = Math.random() * 6.28; scene.add(m); hedefle(m, { tip: "hayvan", tur: tur, i: i });
        var urun = new T.Mesh(UGEO[tur], matV); urun.castShadow = true; urun.visible = false; scene.add(urun);
        var o = { m: m, x: p[0], z: p[1], yon: m.rotation.y, hx: p[0], hz: p[1], bekle: Math.random() * 2, faz: Math.random() * 6, urun: urun, zipla: 0 };
        if (tur === "inek") { var k = new T.Mesh(KUYRUK_G, matV); k.position.set(0, 1.2, -0.72); m.add(k); o.kuyruk = k; }
        V.push(o);
      }
    });
  }

  /* ================= meyve ağaçları ================= */
  var agacV = [], AGAC_GEO = {};
  function agacGeo(tur, olgun) { var k = tur + (olgun ? 1 : 0); if (!AGAC_GEO[k]) AGAC_GEO[k] = CM.meyveAgaci(tur, olgun).geo(); return AGAC_GEO[k]; }
  for (var ai = 0; ai < AGAC_YER.length; ai++) {
    var ag = new T.Mesh(agacGeo("elma", false), matAgac); ag.castShadow = true; ag.visible = false; ag.position.set(AGAC_YER[ai][0], 0, AGAC_YER[ai][1]); ag.rotation.y = ai * 1.3; scene.add(ag); hedefle(ag, { tip: "agac", i: ai });
    var bos = new T.Mesh(new T.CylinderGeometry(0.9, 0.9, 0.06, 12), new T.MeshLambertMaterial({ color: 0x8d5f35 })); bos.position.set(AGAC_YER[ai][0], 0.03, AGAC_YER[ai][1]); scene.add(bos); hedefle(bos, { tip: "agac", i: ai });
    var isaret = etiket("+ Fidan", "markette", "rgba(255,246,210,.97)"); isaret.scale.set(1.5, 0.6, 1); isaret.position.set(AGAC_YER[ai][0], 0.9, AGAC_YER[ai][1]); scene.add(isaret);
    agacV.push({ m: ag, bos: bos, isaret: isaret, tur: null, olgun: null, pop: 0 });
  }
  function agacOlgun(i) { var a = S.agac[i]; return !!(a && Date.now() - a.t >= AGAC[a.tur].sure * 1000); }
  function agaclariYaz(anim) {
    for (var i = 0; i < agacV.length; i++) {
      var v = agacV[i], a = S.agac[i], acik = S.sv >= AGAC.elma.sv;
      v.bos.visible = !a && acik; v.bos.userData.aktif = !a && acik; v.isaret.visible = !a && acik;
      v.m.visible = !!a; v.m.userData.aktif = !!a;
      if (a) { var ol = agacOlgun(i); if (v.tur !== a.tur || v.olgun !== ol) { v.tur = a.tur; v.olgun = ol; v.m.geometry = agacGeo(a.tur, ol); if (anim && !AZ_HAREKET) { v.pop = 0.0001; v.m.scale.setScalar(0.2); } } }
      else { v.tur = null; v.olgun = null; }
    }
  }
  function agacDokun(i) {
    var a = S.agac[i];
    if (!a) { ses("dokun"); sheetAc("agac", i); return; }
    if (!agacOlgun(i)) { ses("dokun"); toast(AGAC[a.tur].ad + " · " + sureYaz(a.t + AGAC[a.tur].sure * 1000 - Date.now()) + " kaldı"); return; }
    var u = AGAC[a.tur].urun; S.env[u] = (S.env[u] || 0) + AGAC_VERIM; a.t = Date.now(); S.ist.hasat++;
    var v3 = new T.Vector3(AGAC_YER[i][0], 1.8, AGAC_YER[i][1]);
    ucanYazi("+" + AGAC_VERIM + " " + ik(u), v3); ucur(u, v3, $("bAmbar"), AGAC_VERIM); ses("hasat", { k: 2 }); xpEkle(URUN[u].xp * 2, v3);
    agacV[i].pop = 0.0001; agacV[i].m.scale.setScalar(0.92);
    agaclariYaz(false); degisti();
  }
  function agacAlHtml(i) {
    return '<div class="cfliste">' + Object.keys(AGAC).map(function (t) { var A = AGAC[t], kilit = S.sv < A.sv, yeter = S.altin >= A.fiyat; return '<button type="button" class="cfsatir' + (kilit ? " kilit" : "") + '" data-a="agacAl" data-i="' + i + '" data-id="' + t + '"' + (kilit || !yeter ? " disabled" : "") + ">" + ik(A.urun) + '<span class="cfsatir-tx"><b>' + A.ad + "</b><small>" + (kilit ? A.sv + ". seviyede açılır" : "her " + sureAd(A.sure) + " · " + AGAC_VERIM + " " + URUN[A.urun].ad.toLocaleLowerCase("tr")) + '</small></span><span class="cfsag">' + (kilit ? "🔒" : "<b>" + A.fiyat + "</b>" + PARA) + "</span></button>"; }).join("") + '</div><p class="cfnot">Fidan dikilir, büyür; meyve verince ağaca dokunursun. Sökmek yok, iyi seç 🙂</p>';
  }
  function agacAl(i, tur) {
    var A = AGAC[tur]; if (!A || S.agac[i] || S.sv < A.sv) return;
    if (S.altin < A.fiyat) { toast(A.fiyat + " altın lazım"); ses("hata"); return; }
    S.altin -= A.fiyat; while (S.agac.length <= i) S.agac.push(null); S.agac[i] = { tur: tur, t: Date.now() };
    sheetKapat(); ses("ek"); ses("altin"); agaclariYaz(true); ucanYazi("Fidan dikildi 🌱", new T.Vector3(AGAC_YER[i][0], 1.5, AGAC_YER[i][1]), "buyuk"); degisti();
  }

  /* ================= dekorasyon + evcil hayvanlar ================= */
  var dekorV = {};
  (function () {
    var sal = new T.Group(); sal.add(CM.salincak().mesh(matV)); var otur = CM.salincakOturak().mesh(matV); otur.position.set(0, 2.15, 0); sal.add(otur);
    var kediG = new T.Group(); kediG.add(CM.kedievi().mesh(matV)); var kd = CM.kedi().mesh(matV); kd.position.set(0.9, 0, 0.5); kd.rotation.y = 0.8; kediG.add(kd);
    var liste = { bank: CM.bank().mesh(matV), tarh: CM.cicekTarhi().mesh(matV), salincak: sal, cesme: CM.cesme().mesh(matV), kedi: kediG };
    for (var id in liste) { var m = liste[id], p = DEKOR_YER[id]; m.position.set(p[0], 0, p[1]); m.rotation.y = p[2]; m.visible = false; scene.add(m); m.traverse(function (c) { if (c.isMesh) { c.castShadow = true; hedefle(c, { tip: "dekor", id: id }); c.userData.aktif = false; } }); dekorV[id] = { m: m, pop: 0 }; }
    dekorV.salincak.otur = otur; dekorV.kedi.kedi = kd;
  })();
  function dekorlariYaz(anim) { for (var id in dekorV) { var v = dekorV[id], var_ = !!S.dekor[id]; if (v.m.visible !== var_) { v.m.visible = var_; v.m.traverse(function (c) { if (c.isMesh) c.userData.aktif = var_; }); if (var_ && anim) { v.pop = 0.0001; v.m.scale.setScalar(0.01); } } } }
  function dekorDokun(id) {
    ses("dokun");
    if (id === "kedi") { var k = dekorV.kedi; k.kediZip = 0.0001; toast(["Mırr… 🐈", "Kedi sana baktı, sonra uyumaya devam etti 🐈", "Kedi kuyruğunu salladı 🐈"][Math.floor(Math.random() * 3)]); return; }
    if (id === "cesme") { ses("su"); return; }
    if (id === "salincak") { dekorV.salincak.salla = 1.5; return; }
    toast(DEKOR[id].ad);
  }
  function dekorAl(id) {
    var D = DEKOR[id]; if (!D || S.dekor[id] || S.sv < D.sv) return;
    if (S.altin < D.fiyat) { toast(D.fiyat + " altın lazım"); ses("hata"); return; }
    S.altin -= D.fiyat; S.dekor[id] = Date.now(); ses("altin"); ses("topla"); dekorlariYaz(true); degisti();
    var p = DEKOR_YER[id]; ucanYazi(D.ad + " ✓", new T.Vector3(p[0], 1.6, p[1]), "buyuk");
  }
  /* gölette her zaman bir kaplumbağa (kılıftaki gibi 🐢) */
  var kaplumbaga = CM.kaplumbaga().mesh(matV); kaplumbaga.position.set(YER.gol[0] - 1.2, 0.06, YER.gol[1] + 0.3); scene.add(kaplumbaga); hedefle(kaplumbaga, { tip: "kaplumbaga" }); var kapT = 0;
  function dekorAnim(dt) {
    kapT += dt; var ka = kapT * 0.25; kaplumbaga.position.set(YER.gol[0] + Math.cos(ka) * 1.4, 0.06 + Math.sin(kapT * 1.5) * 0.01, YER.gol[1] + Math.sin(ka) * 1.0); kaplumbaga.rotation.y = -ka + Math.PI / 2;
    var sal = dekorV.salincak; if (sal.m.visible) { sal.faz = (sal.faz || 0) + dt; if (sal.salla) sal.salla = Math.max(0, sal.salla - dt * 0.4); sal.otur.rotation.x = Math.sin(sal.faz * 2.2) * (0.08 + (sal.salla || 0) * 0.3); }
    var kd = dekorV.kedi; if (kd.m.visible) { if (kd.kediZip) { kd.kediZip += dt; kd.kedi.position.y = Math.sin(Math.min(1, kd.kediZip / 0.35) * Math.PI) * 0.3; if (kd.kediZip > 0.35) { kd.kediZip = 0; kd.kedi.position.y = 0; } } kd.kedi.rotation.y = 0.8 + Math.sin(kapT * 0.4) * 0.3; }
    for (var id in dekorV) { var v = dekorV[id]; if (!v.pop) continue; v.pop += dt; var f = Math.min(1, v.pop / 0.6), e = 1 - Math.pow(1 - f, 3); v.m.scale.setScalar(Math.max(0.01, e * (1 + Math.sin(f * Math.PI) * 0.12))); if (f >= 1) { v.pop = 0; v.m.scale.setScalar(1); } }
    agacV.forEach(function (v) { if (!v.pop) return; v.pop += dt; var f2 = Math.min(1, v.pop / 0.5), e2 = 1 - Math.pow(1 - f2, 3); v.m.scale.setScalar(Math.max(0.05, 0.2 + 0.8 * e2 + Math.sin(f2 * Math.PI) * 0.08)); if (f2 >= 1) { v.pop = 0; v.m.scale.setScalar(1); } });
  }

  /* ================= market: al / sat / tezgâh ================= */
  var TEZGAH_SLOT = 3, TEZGAH_SURE = 120;
  function satFiyat(id) { return Math.max(1, Math.round(URUN[id].deger * 0.7)); }
  function sat(id, n) {
    n = Math.max(1, n || 1); var var_ = adet(id); if (!URUN[id] || var_ < n) { ses("hata"); return; }
    S.env[id] -= n; var k = satFiyat(id) * n; S.altin += k; ses("altin"); S.ist.satis = (S.ist.satis || 0) + n;
    var r = $("altinKutu"); r.classList.remove("hop"); void r.offsetWidth; r.classList.add("hop"); toast("+" + k + " altın · " + n + " " + URUN[id].ad); degisti();
  }
  function tezgahKoy(id) {
    var n = Math.min(adet(id), 5); if (!URUN[id] || n < 1) { ses("hata"); return; }
    var bos = -1; for (var i = 0; i < TEZGAH_SLOT; i++) if (!S.tezgah[i]) { bos = i; break; }
    if (bos < 0) { toast("Tezgâh dolu; satılanları topla"); ses("hata"); return; }
    S.env[id] -= n; S.tezgah[bos] = { u: id, n: n, t: Date.now() + TEZGAH_SURE * 1000, bitti: false }; ses("uretim"); degisti();
  }
  function tezgahAl(i) {
    var t = S.tezgah[i]; if (!t || !t.bitti) return;
    var k = URUN[t.u].deger * t.n; S.altin += k; S.tezgah[i] = null; ses("altin"); S.ist.satis = (S.ist.satis || 0) + t.n;
    xpEkle(Math.max(1, Math.round(URUN[t.u].xp * t.n * 0.5)), binaV.market.ust.clone()); toast("+" + k + " altın · tezgâhtan"); degisti();
  }
  function marketHtml(sek) {
    sek = sek || "sat";
    var h = '<div class="cfsekme">' + [["sat", "💰 Sat"], ["fidan", "🌳 Fidan"], ["hayvan", "🐾 Hayvan"], ["dekor", "🪑 Dekor"]].map(function (x) { return '<button type="button" class="' + (sek === x[0] ? "on" : "") + '" data-a="msekme" data-id="' + x[0] + '">' + x[1] + "</button>"; }).join("") + "</div>";
    if (sek === "sat") {
      h += '<label class="cfetiket">Tezgâh · tam fiyat, ' + sureAd(TEZGAH_SURE) + " sonra satılır</label><div class=\"cfkuyruk\">";
      for (var i = 0; i < TEZGAH_SLOT; i++) { var t = S.tezgah[i]; h += !t ? '<div class="cfslot bos"><span>+</span></div>' : t.bitti ? '<button type="button" class="cfslot satildi" data-a="tezgahAl" data-i="' + i + '">' + ik(t.u) + "<small>" + PARA + " " + (URUN[t.u].deger * t.n) + "</small><b>Al</b></button>" : '<div class="cfslot aktif">' + ik(t.u) + "<b>×" + t.n + '</b><i class="cfbar"><i data-ilerle="' + (t.t - TEZGAH_SURE * 1000) + "," + t.t + '"></i></i><small data-bit="' + t.t + '"></small></div>'; }
      h += "</div>";
      var dolu = SIRA_URUN.filter(function (id) { return adet(id) > 0; });
      if (!dolu.length) h += '<p class="cfbos">Satacak bir şey yok; önce hasat et ya da üret.</p>';
      else h += '<label class="cfetiket">Ambardakiler</label><div class="cfliste">' + dolu.map(function (id) { return '<div class="cfsatir">' + ik(id) + '<span class="cfsatir-tx"><b>' + URUN[id].ad + " <small>×" + adet(id) + '</small></b><small>hemen ' + satFiyat(id) + " · tezgâhta " + URUN[id].deger + " altın/adet</small></span>" + '<button type="button" class="cfkucuk ikinci" data-a="tezgahKoy" data-id="' + id + '" title="Tezgâha koy (en çok 5)">Tezgâh</button><button type="button" class="cfkucuk" data-a="sat" data-id="' + id + '" data-n="1">Sat 1</button>' + (adet(id) > 1 ? '<button type="button" class="cfkucuk" data-a="sat" data-id="' + id + '" data-n="' + adet(id) + '">Hepsi</button>' : "") + "</div>"; }).join("") + "</div>";
    } else if (sek === "fidan") {
      var bosYer = S.sv >= AGAC.elma.sv ? AGAC_YER.filter(function (_, i) { return !S.agac[i]; }).length : 0;
      h += '<p class="cfnot">' + (S.sv < AGAC.elma.sv ? "Meyve ağaçları " + AGAC.elma.sv + ". seviyede açılıyor." : bosYer ? "Yolun altında " + bosYer + " boş fidan yeri var; fidanı oradan dikersin." : "Bütün fidan yerleri dolu.") + "</p>";
      h += '<div class="cfliste">' + Object.keys(AGAC).map(function (t) { var A = AGAC[t], kilit = S.sv < A.sv; return '<div class="cfsatir' + (kilit ? " kilit" : "") + '">' + ik(A.urun) + '<span class="cfsatir-tx"><b>' + A.ad + "</b><small>" + (kilit ? A.sv + ". seviyede açılır" : "her " + sureAd(A.sure) + " · " + AGAC_VERIM + " meyve") + '</small></span><span class="cfsag">' + (kilit ? "🔒" : "<b>" + A.fiyat + "</b>" + PARA) + "</span></div>"; }).join("") + "</div>";
    } else if (sek === "hayvan") {
      h += '<div class="cfliste">' + HAYVANLAR.map(function (t) { var H = HAYVAN[t], L = S.hay[t], kilit = S.sv < H.sv, dolu = L.length >= H.max; return '<div class="cfsatir' + (kilit ? " kilit" : "") + '">' + '<span class="cfik">' + H.ik + "</span>" + '<span class="cfsatir-tx"><b>' + H.ad + " <small>" + L.length + "/" + H.max + '</small></b><small>' + (kilit ? H.sv + ". seviyede açılır" : H.yer + " · " + ik(H.yem) + " yiyince " + sureAd(H.sure) + " sonra " + ik(H.urun)) + "</small></span>" + (kilit ? '<span class="cfsag">🔒</span>' : dolu ? '<span class="cfsag"><small>dolu</small></span>' : '<button type="button" class="cfkucuk" data-a="hayvanAl" data-id="' + t + '"' + (S.altin < H.fiyat ? " disabled" : "") + ">Al · " + H.fiyat + "</button>") + "</div>"; }).join("") + "</div>";
    } else {
      h += '<div class="cfliste">' + Object.keys(DEKOR).map(function (id) { var D = DEKOR[id], kilit = S.sv < D.sv, var_ = !!S.dekor[id]; return '<div class="cfsatir' + (kilit ? " kilit" : "") + '">' + '<span class="cfik">' + D.ik + "</span>" + '<span class="cfsatir-tx"><b>' + D.ad + "</b><small>" + (kilit ? D.sv + ". seviyede açılır" : var_ ? "çiftlikte ✓" : "yerine konur, dokununca tepki verir") + "</small></span>" + (kilit ? '<span class="cfsag">🔒</span>' : var_ ? '<span class="cfsag"><small>var</small></span>' : '<button type="button" class="cfkucuk" data-a="dekorAl" data-id="' + id + '"' + (S.altin < D.fiyat ? " disabled" : "") + ">Al · " + D.fiyat + "</button>") + "</div>"; }).join("") + "</div>";
    }
    return h;
  }

  /* ================= karakter ================= */
  /* ================= karakter: Büşra =================
     Çizilmiş 2D karakter (kar/*.png), sahnede kameraya dönen pano olarak; yürürken yönüne göre önden / yandan / 3/4 / arkadan duruş,
     ekerken sulama, hasatta kasa taşıma, hayvanlarda tavukla ilgilenme, dokununca mutlu duruşu. Seçilebilenler: şal ve önlük rengi. */
  var KAR_SAL = [["Gül", null, 0xb85566], ["Zeytin", 0x6b6b3a], ["Bordo", 0x7a1f2e], ["Gül kurusu", 0xb08a95], ["Siyah", 0x2a2a2e], ["Vizon", 0x9b8572], ["Lila", 0xa58cc8], ["Krem", 0xe6d9c2], ["Lacivert", 0x2f3e66], ["Pudra", 0xe2b5b0], ["Mint", 0x8cc9b0], ["Hardal", 0xc9a03a], ["Gri", 0x8a8f96]];
  var KAR_ONLUK = [["Kahve", null, 0x6e4a30], ["Haki", 0x6b6b3a], ["Yeşil", 0x4f7a45], ["Lacivert", 0x2f3e66], ["Kot", 0x4a6a96], ["Bordo", 0x7a1f2e], ["Siyah", 0x2a2a2a], ["Bej", 0xb59a78], ["Pembe", 0xd77a8a]];
  function karVarsayilan() { return { s: 4, sal: 0, onluk: 0 }; }
  function karDuzelt(o) {                                                   /* eski kayıtlar: şal rengi adıyla eşlenir, gerisi varsayılan */
    if (!o) return null;
    if (o.s === 4) return o;
    var n = karVarsayilan(), ESKI = ["Zeytin", "Bordo", "Gül kurusu", "Siyah", "Haki", "Vizon", "Lila", "Krem", "Gri", "Lacivert", "Pudra", "Mint"];
    var ortulu = o.s ? o.kafa === "sal" || o.kafa === "uzunsal" : !!o.ortu;
    if (ortulu) { var ad = ESKI[o.ortuRenk || 0]; KAR_SAL.forEach(function (x, i) { if (x[0] === ad) n.sal = i; }); }
    return n;
  }
  function karRenk(liste, i) { var x = liste[i] || liste[0]; return x[1]; }
  var kar = { g: new T.Group(), parca: {}, x: -8.5, z: -3.5, hx: -8.5, hz: -3.5, yon: 0, faz: 0, bekle: 2, hedef: null, selam: 0, is: 0, isTur: "" };
  kar.g.position.set(kar.x, 0, kar.z); scene.add(kar.g);
  var KAR_YOL = [[-8.5, -3.5], [-3, -4.7], [3, -4.7], [8, -3.5], [8, 1.5], [1, 6.5], [-1, 6.5], [-7.7, 1.5], [-5, 9.5], [12.5, 11.5], [-9, 11]];
  var karCiz = null, karYedek = false, karVur = new T.Mesh(new T.BoxGeometry(1.0, 2.1, 1.0), new T.MeshBasicMaterial({ visible: false }));
  karVur.position.y = 1.05; kar.g.add(karVur); hedefle(karVur, { tip: "karakter" });
  if (window.CfKar) CfKar.yukle("1020m", function (v) { if (!v) { karYedek = true; karakterKur(); return; } try { karCiz = CfKar.olustur(v); } catch (e) { karCiz = null; karYedek = true; karakterKur(); return; } if (!kar3d) kar.g.add(karCiz.g); karakterKur(); if (!$("karKart").hidden) karakterCiz(); _ip = "\u0000"; try { ipucuYaz(); } catch (e) {} });
  else karYedek = true;
  /* gerçek 3D model (varsa çizim panonun yerine geçer; çizim yüzleri baloncuklarda kalır) */
  var kar3d = null;
  if (window.CfKar3D) CfKar3D.yukle(function (G) {
    if (!G) return;
    try { kar3d = CfKar3D.olustur(G); } catch (e) { kar3d = null; return; }
    if (karCiz && karCiz.g.parent) karCiz.g.parent.remove(karCiz.g);
    for (var i = kar.g.children.length - 1; i >= 0; i--) { var c = kar.g.children[i]; if (c !== karVur) kar.g.remove(c); }
    kar.parca = {}; kar.g.scale.setScalar(1); kar.g.add(kar3d.g); karakterKur();
  });
  function karakterKur() {
    var o = karDuzelt(S.kar) || karVarsayilan(), g = kar.g;
    if (kar3d) kar3d.giydir({ sal: karRenk(KAR_SAL, o.sal), onluk: karRenk(KAR_ONLUK, o.onluk) });
    if (karCiz) { karCiz.giydir({ sal: karRenk(KAR_SAL, o.sal), onluk: karRenk(KAR_ONLUK, o.onluk) }); return; }
    if (kar3d) return;
    if (!karYedek) return;                                                  /* çizim yüklenemezse: basit 3D karakter */
    for (var i = g.children.length - 1; i >= 0; i--) { var c = g.children[i]; if (c === karVur) continue; g.remove(c); if (c.geometry) c.geometry.dispose(); }
    var sr = KAR_SAL[o.sal] || KAR_SAL[0], orr = KAR_ONLUK[o.onluk] || KAR_ONLUK[0];
    var P = CM.karakter({ kiyafet: "ciftlikelbisesi", renk1: 0xf1e6d2, renk2: orr[1] === null ? orr[2] : orr[1], kafa: "sal", ortuRenk: sr[1] === null ? sr[2] : sr[1], ten: 0, ayakkabi: "bot", ayakRenk: 0x5a3a24 });
    var parca = kar.parca = {};
    function ekle(ad, K, x, y, z) { var m = K.mesh(matV); m.position.set(x, y, z); g.add(m); parca[ad] = m; }
    ekle("govde", P.govde, 0, 0, 0); ekle("solKol", P.solKol, -0.3, 0.98, 0); ekle("sagKol", P.sagKol, 0.3, 0.98, 0); ekle("solBacak", P.solBacak, -0.12, 0.5, 0); ekle("sagBacak", P.sagBacak, 0.12, 0.5, 0);
    g.scale.setScalar(1.2);
  }
  function karakterGit(x, z, is, tur) { kar.hedef = [x, z]; kar.is = is || 0; kar.isTur = tur || "hasat"; kar.bekle = 0; }
  var _kp = new T.Vector3();
  function karakterAnim(dt) {
    var k = kar; k.faz += dt;
    if (k.selam > 0) k.selam -= dt;
    var dx = k.hx - k.x, dz = k.hz - k.z, L = Math.hypot(dx, dz), yuruyor = false; k.yol = 0;
    if (k.hedef) { k.hx = k.hedef[0]; k.hz = k.hedef[1]; dx = k.hx - k.x; dz = k.hz - k.z; L = Math.hypot(dx, dz); }
    if (L > 0.08) {
      var hy = Math.atan2(dx, dz), f = Math.atan2(Math.sin(hy - k.yon), Math.cos(hy - k.yon)); k.yon += f * Math.min(1, dt * 6);
      if (Math.abs(f) < 0.8) { var st = Math.min(L, 1.9 * dt); k.x += Math.sin(k.yon) * st; k.z += Math.cos(k.yon) * st; yuruyor = true; k.yol = st; }
    } else if (k.hedef) { k.hedef = null; k.bekle = k.is ? 2.2 : 3 + Math.random() * 4; if (k.is) { k.isT = k.is; k.isAd = k.isTur; } k.is = 0; }
    else { k.bekle -= dt; if (k.bekle <= 0) { var w = KAR_YOL[Math.floor(Math.random() * KAR_YOL.length)]; k.hx = w[0] + (Math.random() - 0.5) * 1.5; k.hz = w[1] + (Math.random() - 0.5) * 1.5; k.bekle = 0; } }
    var calis = k.isT > 0; if (calis) k.isT -= dt;
    if (kar3d) {
      if (k.sevinT > 0) k.sevinT -= dt;
      k.g.position.set(k.x, 0, k.z); k.g.rotation.y = k.yon;
      kar3d.ciz(k.sevinT > 0 ? "sevin" : k.selam > 0 ? "selam" : calis ? k.isAd || "hasat" : yuruyor ? "yuru" : "dur", dt, 1);
      return;
    }
    if (karCiz) {
      k.g.position.set(k.x, 0, k.z); k.g.rotation.y = 0;
      if (k.sevinT > 0) k.sevinT -= dt;
      var durum = k.sevinT > 0 ? "sevin" : k.selam > 0 ? "selam" : calis ? k.isAd || "hasat" : yuruyor ? "yuru" : "dur";
      karCiz.ciz(camera, _kp.set(k.x, 1, k.z), k.yon, durum, dt, k.yol);
      return;
    }
    k.g.position.set(k.x, yuruyor ? Math.abs(Math.sin(k.faz * 9)) * 0.05 : 0, k.z); k.g.rotation.y = k.yon;
    var P = k.parca; if (!P || !P.govde) return;
    var sw = yuruyor && !calis ? Math.sin(k.faz * 9) * 0.6 : 0;
    P.solBacak.rotation.x = sw; P.sagBacak.rotation.x = -sw; P.solKol.rotation.x = -sw * 0.7; P.sagKol.rotation.x = sw * 0.7;
    if (calis) { P.sagKol.rotation.x = -1.2 + Math.sin(k.faz * 10) * 0.6; P.solKol.rotation.x = -0.6 + Math.sin(k.faz * 10 + 1) * 0.3; }
    if (k.selam > 0) { P.sagKol.rotation.z = -2.6 + Math.sin(k.faz * 14) * 0.3; P.sagKol.rotation.x = 0; } else P.sagKol.rotation.z = 0;
    P.govde.position.y = !yuruyor && !calis ? Math.sin(k.faz * 2) * 0.008 : 0;
  }
  var KAR_SOZ = [[0, "Selam! Bugün hava çok güzel 🌤️"], [6, "Hihi, beni mi gıdıkladın? 🙈"], [11, "Taze ürünler her zaman daha güzel :)"], [7, "Bugün ne eksek acaba… 🤔"], [14, "Bu çiftlik benden sorulur 💪"], [1, "Aaa! Yumurtalar hazır mı? 🥚"], [10, "Kafede bir lavanta latte iyi giderdi ☕"], [5, "Biraz yaban mersini eksek mi? 🫐"], [9, "Ohh, güneş ne güzel ısıtıyor ☀️"]];
  var karSozSira = Math.floor(Math.random() * KAR_SOZ.length);
  function karakterDokun() {
    kar.selam = 2.8; kar.hedef = null; kar.hx = kar.x; kar.hz = kar.z; kar.bekle = 4; kar.yon = Math.atan2(camera.position.x - kar.x, camera.position.z - kar.z); ses("dokun");
    var s = KAR_SOZ[karSozSira++ % KAR_SOZ.length];
    if (!karCiz) { toast(s[1]); return; }
    var t = $("toast"); t.innerHTML = '<img class="cfkaryuz" alt="" src="' + karCiz.yuz(s[0]) + '"><span></span>'; t.lastChild.textContent = s[1];
    t.classList.add("acik", "konus"); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("acik"); setTimeout(function () { t.classList.remove("konus"); }, 300); }, 2800);
  }
  /* karakter kartı (oyuna başlarken ve evden): önizleme + şal ve önlük rengi */
  var karTaslak = null, karKam = null;
  function karakterAc() {
    karTaslak = JSON.parse(JSON.stringify(karDuzelt(S.kar) || karVarsayilan()));
    $("karKart").hidden = false; karakterCiz(); karakterOnizle(true);
  }
  function karakterOnizle(ac) {
    if (ac) { if (!karKam) karKam = { h: kam.h.clone(), d: kam.d, yaw: kam.yaw, dmin: DMIN }; kar.hedef = null; kar.hx = kar.x; kar.hz = kar.z; kar.bekle = 999; DMIN = 6; var dik = H > W; kam.yaw = Math.PI / 4; if (dik) { kam.h.set(kar.x + Math.sin(kam.yaw) * 1.6, 0.6, kar.z + Math.cos(kam.yaw) * 1.6); kam.d = 11; } else { kam.h.set(kar.x + Math.cos(kam.yaw) * 1.3, 0.8, kar.z - Math.sin(kam.yaw) * 1.3); kam.d = 7; } kamYerlestir(); kar.yon = Math.PI / 4; }
    else { kar.bekle = 1; if (karKam) { DMIN = karKam.dmin; kam.h.copy(karKam.h); kam.d = karKam.d; kam.yaw = karKam.yaw; kamYerlestir(); karKam = null; } }
  }
  function karakterCiz() {
    var o = karTaslak, h = "";
    function hex(c) { return "#" + ("000000" + c.toString(16)).slice(-6); }
    function seg(ad, key, liste, secili) { return '<div class="cfkrow"><span>' + ad + '</span><div class="cfkseg">' + liste.map(function (x, i) { var c = x[1] === null ? x[2] : x[1]; return '<button type="button" class="renk' + (i === secili ? " on" : "") + '" data-k="' + key + '" data-v="' + i + '" style="background:' + hex(c) + '" title="' + x[0] + '" aria-label="' + x[0] + '"></button>'; }).join("") + "</div></div>"; }
    h += '<div class="cfkon"><canvas id="karOn" width="150" height="250" aria-label="Önizleme"></canvas><div class="cfkonsag">';
    h += seg("Şal", "sal", KAR_SAL, o.sal) + seg("Önlük", "onluk", KAR_ONLUK, o.onluk);
    h += "</div></div>";
    $("karSecenek").innerHTML = h;
    var once = S.kar; S.kar = o; karakterKur(); S.kar = once;
    if (karCiz) karCiz.onizle($("karOn")); else { var c = $("karOn"); if (c) c.hidden = true; }
  }
  $("karSecenek").addEventListener("click", function (e) {
    var b = e.target && e.target.closest ? e.target.closest("button[data-k]") : null; if (!b) return;
    karTaslak[b.getAttribute("data-k")] = +b.getAttribute("data-v");
    ses("dokun"); karakterCiz();
  });
  $("karTamam").onclick = function () { S.kar = karTaslak; $("karKart").hidden = true; karakterKur(); karakterOnizle(false); ses("topla"); kar.selam = 1.4; toast("Hazırım! Hadi çalışalım 🌾"); kaydet(); degisti(); };
  $("karRastgele").onclick = function () {
    var o = karTaslak, a = o.sal, b = o.onluk;
    while (o.sal === a && o.onluk === b) { o.sal = Math.floor(Math.random() * KAR_SAL.length); o.onluk = Math.floor(Math.random() * KAR_ONLUK.length); }
    ses("dokun"); karakterCiz();
  };

  /* ================= demo: kodu olmayan toplam 5 dakika oynar ================= */
  var DEMO_SN = 300, demoSon = 0, demoKalan = DEMO_SN, demoKayitT = 0, demoBitti = false;
  try { var _d = parseFloat(localStorage.getItem("cf_demo")); if (_d >= 0) demoKalan = Math.min(DEMO_SN, _d); } catch (e) {}
  function demoGoster() {
    var el = $("demoSaat"); if (!el) return;
    var k = Math.max(0, Math.ceil(demoKalan)), m = Math.floor(k / 60), sn = k % 60;
    el.hidden = false; el.textContent = "Demo · " + m + ":" + (sn < 10 ? "0" : "") + sn + " kaldı"; el.classList.toggle("az", k <= 30);
  }
  function demoBit() {
    if (demoBitti) return; demoBitti = true;
    try { localStorage.setItem("cf_demo", "0"); } catch (e) {}
    sheetKapat(); ["karKart", "isimKart", "seviyeKart"].forEach(function (id) { var e = $(id); if (e) e.hidden = true; });
    var y = $("demoYuz"); if (y && karCiz) { y.src = karCiz.yuz(6); y.hidden = false; }
    $("demoSaat").hidden = true; $("demoBitti").hidden = false; try { kaydet(); } catch (e) {}
  }
  function demoTik(dt) {
    if (!window.CF_DEMO || demoBitti) return;
    var simdi = Date.now(), gecen = demoSon ? Math.min(1, (simdi - demoSon) / 1000) : 0; demoSon = simdi;   /* gerçek saat: yavaş telefonda da 5 dk */
    if (document.hidden) { demoSon = 0; return; }
    demoKalan -= gecen;
    demoKayitT += dt; if (demoKayitT > 2) { demoKayitT = 0; try { localStorage.setItem("cf_demo", String(Math.max(0, demoKalan))); } catch (e) {} }
    demoGoster();
    if (demoKalan <= 0) demoBit();
  }
  if (window.CF_DEMO) { if (demoKalan <= 0) setTimeout(demoBit, 300); else demoGoster(); }
  document.addEventListener("visibilitychange", function () { if (window.CF_DEMO && !demoBitti) try { localStorage.setItem("cf_demo", String(Math.max(0, demoKalan))); } catch (e) {} });

  /* ================= kamera ================= */
  var DMIN = 12, DMAX = 50, kam = { h: new T.Vector3(0, 0, 1.5), d: 30, yaw: Math.PI / 4, hiz: new T.Vector3() };
  var W = 1, H = 1;
  function kamYerlestir() {
    kam.h.x = Math.max(-21, Math.min(19, kam.h.x)); kam.h.z = Math.max(-15, Math.min(14, kam.h.z)); kam.d = Math.max(DMIN, Math.min(DMAX, kam.d));
    var t = (kam.d - DMIN) / (DMAX - DMIN), pitch = 0.64 + t * 0.34, cp = Math.cos(pitch);
    camera.position.set(kam.h.x + kam.d * cp * Math.sin(kam.yaw), kam.d * Math.sin(pitch), kam.h.z + kam.d * cp * Math.cos(kam.yaw));
    camera.lookAt(kam.h);
  }
  var _boy = "", CR = { left: 0, top: 0, width: 1, height: 1 };
  function boyutla() {
    var pr = Math.min(window.devicePixelRatio || 1, MOBIL ? 2 : 1.75), k = innerWidth + "x" + innerHeight + "@" + pr;
    if (k === _boy) return;                                                 /* klavye açılıp kapanınca boş yere yeniden kurma */
    _boy = k; W = innerWidth; H = innerHeight;
    renderer.setPixelRatio(pr); renderer.setSize(W, H, false);
    cv.style.width = W + "px"; cv.style.height = H + "px";
    camera.aspect = W / H; camera.updateProjectionMatrix(); kamYerlestir();
    var r = cv.getBoundingClientRect(); CR = { left: r.left, top: r.top, width: r.width || 1, height: r.height || 1 };
  }
  addEventListener("resize", boyutla); addEventListener("orientationchange", function () { setTimeout(boyutla, 250); });
  if (window.visualViewport) window.visualViewport.addEventListener("resize", boyutla);

  /* ================= dokunma ================= */
  var ray = new T.Raycaster(), ndc = new T.Vector2(), DUZ = new T.Plane(new T.Vector3(0, 1, 0), 0), _v = new T.Vector3();
  function isin(cx, cy) { var r = CR; ndc.set((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); }
  function zemin(cx, cy, out) { isin(cx, cy); return ray.ray.intersectPlane(DUZ, out || new T.Vector3()); }
  function hedefBul(cx, cy, liste) {
    isin(cx, cy); var h = ray.intersectObjects(liste || secilebilir, false);
    var yedek = null;                                                       /* karakter, arkasındaki tarla/binayı engellemesin: başka hedef yoksa seçilir */
    for (var i = 0; i < h.length; i++) { var o = h[i].object; if (o.userData.aktif === false) continue; if (o.userData.hedef) { if (o.userData.hedef.tip === "karakter") { if (!yedek) yedek = { h: o.userData.hedef, p: h[i].point }; continue; } return { h: o.userData.hedef, p: h[i].point }; } }
    return yedek;
  }
  var PT = {}, jest = null, sonHasat = 0;
  function ptSay() { return Object.keys(PT).length; }
  function orta() { var k = Object.keys(PT), a = PT[k[0]], b = PT[k[1]]; return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, d: Math.hypot(a.x - b.x, a.y - b.y) }; }
  cv.addEventListener("pointerdown", function (e) {
    e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {}
    PT[e.pointerId] = { x: e.clientX, y: e.clientY };
    kam.hiz.set(0, 0, 0);
    if (ptSay() === 2) { var o = orta(); jest = { tur: "pinch", d0: o.d || 1, m0: kam.d, tut: zemin(o.x, o.y) }; return; }
    if (ptSay() > 2) return;
    var h = hedefBul(e.clientX, e.clientY, tarlaPick);
    if (h && h.h.tip === "tarla") {
      var i = h.h.i, t = S.tarla[i];
      if (t && t.u && olgun(i)) { jest = { tur: "hasat", son: i }; hasat(i); return; }
      if (ekmeTur && t && !t.u) { jest = { tur: "ek", son: i }; ek(i, ekmeTur); return; }
    }
    jest = { tur: "pan", tut: zemin(e.clientX, e.clientY), x0: e.clientX, y0: e.clientY, t0: performance.now(), tasidi: false, son: performance.now() };
  }, { passive: false });
  cv.addEventListener("pointermove", function (e) {
    if (!PT[e.pointerId]) return;
    PT[e.pointerId].x = e.clientX; PT[e.pointerId].y = e.clientY;
    if (!jest) return;
    if (jest.tur === "pinch" && ptSay() >= 2) {
      var o = orta(); kam.d = jest.m0 * jest.d0 / Math.max(10, o.d); kamYerlestir();
      if (jest.tut) { var c = zemin(o.x, o.y); if (c) { kam.h.x += jest.tut.x - c.x; kam.h.z += jest.tut.z - c.z; kamYerlestir(); } }
      return;
    }
    if (jest.tur === "hasat" || jest.tur === "ek") {
      if (jest.tur === "ek" && !ekmeTur) return;
      var h = hedefBul(e.clientX, e.clientY, tarlaPick);
      if (h && h.h.tip === "tarla" && h.h.i !== jest.son) { jest.son = h.h.i; if (jest.tur === "hasat") hasat(h.h.i); else ek(h.h.i, ekmeTur); }
      return;
    }
    if (jest.tur === "pan") {
      if (!jest.tasidi && Math.hypot(e.clientX - jest.x0, e.clientY - jest.y0) > 7) jest.tasidi = true;
      if (!jest.tasidi || !jest.tut) return;
      var cur = zemin(e.clientX, e.clientY); if (!cur) return;
      var dx = jest.tut.x - cur.x, dz = jest.tut.z - cur.z, now = performance.now(), dt = Math.max(1, now - jest.son);
      kam.h.x += dx; kam.h.z += dz; kamYerlestir();
      kam.hiz.set(dx / dt * 16.7, 0, dz / dt * 16.7); jest.son = now;
    }
  });
  function birak(e) {
    if (!PT[e.pointerId]) return;
    delete PT[e.pointerId];
    if (!jest) return;
    if (jest.tur === "pinch") { if (ptSay() >= 2) { var o2 = orta(); jest = { tur: "pinch", d0: o2.d || 1, m0: kam.d, tut: zemin(o2.x, o2.y) }; return; } if (ptSay() === 1) { var k = Object.keys(PT)[0]; jest = { tur: "pan", tut: zemin(PT[k].x, PT[k].y), x0: PT[k].x, y0: PT[k].y, t0: 0, tasidi: true, son: performance.now() }; } else jest = null; return; }
    if (jest.tur === "pan") {
      if (!jest.tasidi && performance.now() - jest.t0 < 600 && e.type === "pointerup") dokun(e.clientX, e.clientY);
      if (jest.tasidi && performance.now() - jest.son > 90) kam.hiz.set(0, 0, 0);
    }
    if (jest.tur === "hasat") { ipucuYaz(); }
    jest = ptSay() ? jest : null;
  }
  cv.addEventListener("pointerup", birak); cv.addEventListener("pointercancel", birak);
  cv.addEventListener("wheel", function (e) { e.preventDefault(); kam.d *= Math.exp(e.deltaY * 0.0012); kamYerlestir(); }, { passive: false });
  cv.addEventListener("contextmenu", function (e) { e.preventDefault(); });

  function dokun(cx, cy) {
    var r = hedefBul(cx, cy);
    if (!r) { if (ekmeTur) modBitir(); sheetKapat(); return; }
    var h = r.h;
    if (h.tip !== "tarla" && ekmeTur) modBitir();
    switch (h.tip) {
      case "tarla": tarlaDokun(h.i); break;
      case "tarlaAl": ses("dokun"); tarlaAlSheet(h.i); break;
      case "bina": zipla(h.id); binaDokun(h.id); break;
      case "insaat": ses("dokun"); insaatDokun(h.id); break;
      case "yer": zipla(h.yer); yerDokun(h.yer); break;
      case "market": zipla("market"); ses("dokun"); marketSheet(); break;
      case "agac": agacDokun(h.i); break;
      case "dekor": dekorDokun(h.id); break;
      case "hayvan": hayvanTek(h.tur, h.i); break;
      case "pano": zipla("pano"); ses("dokun"); siparisSheet(); break;
      case "ambar": zipla("ambar"); ses("dokun"); ambarSheet(); break;
      case "ev": zipla("ev"); ses("dokun"); evSheet(); break;
      case "gol": golDokun(r.p); break;
      case "karakter": karakterDokun(); break;
      case "kaplumbaga": ses("su"); toast(["🐢 Kaplumbağa sana baktı", "🐢 Acelesi yok, hiç olmadı", "🐢 Gölette keyif"][Math.floor(Math.random() * 3)]); break;
      case "masa": ses("dokun"); toast(["Çizim masası · burada da bir mimar var 📐", "Pafta hâlâ masada; çiftliğin planı burada çizildi 📐"][Math.floor(Math.random() * 2)]); break;
    }
  }

  /* ================= yardımcılar: ekran konumu, uçan yazılar, baloncuklar ================= */
  function ekran(v3) { _v.copy(v3).project(camera); return { x: (_v.x + 1) / 2 * W, y: (1 - _v.y) / 2 * H, on: _v.z < 1 && _v.x > -1.2 && _v.x < 1.2 && _v.y > -1.2 && _v.y < 1.2 }; }
  function tarlaNokta(i) { var p = slotYer(i); return new T.Vector3(p[0], 0.8, p[1]); }
  function ucanYazi(html, v3, cls) {
    var p = ekran(v3); if (!p.on) return;
    var el = document.createElement("div"); el.className = "cfucan " + (cls || ""); el.innerHTML = html;
    el.style.left = p.x + "px"; el.style.top = p.y + "px"; $("ucanlar").appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1400);
  }
  function ucur(id, v3, hedefEl, n) {
    if (AZ_HAREKET) return;
    var p = ekran(v3); if (!p.on) return;
    var r = hedefEl.getBoundingClientRect();
    for (var k = 0; k < Math.min(n || 1, 4); k++) (function (k) {
      var el = document.createElement("div"); el.className = "cfucur"; el.innerHTML = ik(id);
      var sx = p.x + (k - 1) * 14, sy = p.y - 10;
      el.style.transform = "translate(" + sx + "px," + sy + "px)"; $("ucanlar").appendChild(el);
      setTimeout(function () { el.style.transform = "translate(" + (r.left + r.width / 2) + "px," + (r.top + r.height / 2) + "px) scale(.55)"; el.style.opacity = "0.2"; }, 30 + k * 70);
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); hedefEl.classList.remove("hop"); void hedefEl.offsetWidth; hedefEl.classList.add("hop"); }, 720 + k * 70);
    })(k);
  }
  var BAL = {};
  function balon(key, v3, html, tik, cls) {
    var b = BAL[key];
    if (!b) {
      b = BAL[key] = { yer: document.createElement("div"), el: document.createElement("button"), v3: v3, html: null, tr: "", gor: true };
      b.yer.className = "cfbalon-yer"; b.el.type = "button"; b.el.className = "cfbalon"; b.yer.appendChild(b.el); $("balonlar").appendChild(b.yer);
      b.el.addEventListener("click", function (e) { e.stopPropagation(); if (b.tik) b.tik(); });
    }
    b.v3 = v3; b.tik = tik;
    if (html !== b.html) { b.html = html; b.el.innerHTML = html || ""; }
    var c = "cfbalon" + (cls ? " " + cls : ""); if (b.el.className !== c) b.el.className = c;
    var yc = "cfbalon-yer" + (html ? "" : " yok"); if (b.yer.className !== yc) b.yer.className = yc;
  }
  function balonlariYerlestir() {
    for (var k in BAL) {
      var b = BAL[k]; if (!b.html) continue;
      var p = ekran(b.v3), gor = p.on;
      if (gor !== b.gor) { b.gor = gor; b.yer.style.visibility = gor ? "" : "hidden"; }
      if (!gor) continue;
      var tr = "translate(" + Math.round(p.x) + "px," + Math.round(p.y) + "px)";
      if (tr !== b.tr) { b.tr = tr; b.yer.style.transform = tr; }
    }
  }
  var toastT = 0;
  function toast(m) { var t = $("toast"); t.classList.remove("konus"); t.textContent = m; t.classList.add("acik"); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("acik"); }, 2300); }

  /* ================= oyun eylemleri ================= */
  var ekmeTur = null, hasatSeri = 0, hasatT = 0;
  function ekebilir(tur) { return URUN[tur].sv <= S.sv; }
  function tohumBedeli(tur) { return (S.env[tur] || 0) > 0 || tur === "bugday" ? 0 : URUN[tur].deger; }
  function ek(i, tur) {
    var t = S.tarla[i]; if (!t || t.u || !URUN[tur] || !ekebilir(tur)) return false;
    var bedel = tohumBedeli(tur);
    if (bedel && S.altin < bedel) { toast(URUN[tur].ad + " tohumu için " + bedel + " altın lazım"); ses("hata"); modBitir(); return false; }
    if ((S.env[tur] || 0) > 0) S.env[tur]--; else if (bedel) { S.altin -= bedel; ucanYazi("−" + bedel + " " + PARA, tarlaNokta(i), "eksi"); }
    t.u = tur; t.t = Date.now(); t.s = S.ist.ekim < 2 && tur === "bugday" ? 8 : 0; S.ist.ekim++;
    var sy2 = slotYer(i); karakterGit(sy2[0] + 1.6, sy2[1] + 0.4, 1.8, Math.random() < 0.5 ? "ekim" : "sulama");
    tarlaGorsel(i, true); ses("ek"); degisti(); modYaz();
    return true;
  }
  var kirpintilar = [], KIRP_RENK = { bugday: 0xf2c94c, misir: 0xffd54f, havuc: 0xf57c00, cilek: 0xe53935, yabanmersini: 0x4356b8, kahve: 0x8d4a2a };
  for (var kp = 0; kp < 36; kp++) { var km = new T.Mesh(new T.BoxGeometry(0.16, 0.08, 0.1), new T.MeshLambertMaterial({ color: 0xffffff })); km.visible = false; scene.add(km); kirpintilar.push({ m: km, v: new T.Vector3(), w: 0, t: 0 }); }
  function kirpintiSac(i, tur) {
    if (AZ_HAREKET) return;
    var p = slotYer(i), n = 0;
    for (var k = 0; k < kirpintilar.length && n < 8; k++) {
      var q = kirpintilar[k]; if (q.m.visible) continue; n++;
      q.m.visible = true; q.m.position.set(p[0] + (Math.random() - 0.5) * 1.6, 0.4, p[1] + (Math.random() - 0.5) * 1.6);
      q.m.material.color.set(Math.random() < 0.6 ? KIRP_RENK[tur] || 0xf2c94c : 0x7ec850);
      q.v.set((Math.random() - 0.5) * 2.2, 3 + Math.random() * 2.5, (Math.random() - 0.5) * 2.2); q.w = (Math.random() - 0.5) * 12; q.t = 0;
      q.m.rotation.set(Math.random() * 6, Math.random() * 6, 0);
    }
  }
  function kirpintiAnim(dt) {
    kirpintilar.forEach(function (q) {
      if (!q.m.visible) return; q.t += dt;
      q.v.y -= 11 * dt; q.m.position.addScaledVector(q.v, dt); q.m.rotation.x += q.w * dt; q.m.rotation.z += q.w * 0.7 * dt;
      if (q.m.position.y < 0.05 || q.t > 1.2) q.m.visible = false;
    });
  }
  function zipla(id) { var b = binaV[id]; if (b && !b.pop) { b.pop = 0.0001; b.popTur = "dokun"; } }
  function hasat(i) {
    var t = S.tarla[i]; if (!t || !t.u || !olgun(i)) return;
    var tur = t.u, now = Date.now();
    kirpintiSac(i, tur); var sy = slotYer(i); karakterGit(sy[0] + 1.6, sy[1] + 0.4, 1.9, "hasat");
    hasatSeri = now - hasatT < 900 ? hasatSeri + 1 : 0; hasatT = now;
    S.env[tur] = (S.env[tur] || 0) + VERIM; t.u = null; t.t = 0; t.s = 0; S.ist.hasat++;
    tarlaGorsel(i, false);
    ucanYazi("+" + VERIM + " " + ik(tur), tarlaNokta(i)); ucur(tur, tarlaNokta(i), $("bAmbar"), 1);
    ses("hasat", { k: hasatSeri }); xpEkle(URUN[tur].xp, tarlaNokta(i));
    degisti();
  }
  function tarlaDokun(i) {
    var t = S.tarla[i]; if (!t) return;
    if (!t.u) { if (ekmeTur) ek(i, ekmeTur); else { ses("dokun"); tohumSheet(i); } return; }
    if (olgun(i)) { hasat(i); return; }
    ses("dokun"); toast(URUN[t.u].ad + " · " + sureYaz(kalanMs(i)) + " kaldı");
  }
  function tarlaAl(i) {
    if (i !== S.tarla.length || SLOT_SV[i] > S.sv) return;
    var f = SLOT_FIYAT[i]; if (S.altin < f) { toast(f + " altın lazım, siparişlerle kazanabilirsin"); ses("hata"); return; }
    S.altin -= f; S.tarla.push({ u: null, t: 0, s: 0 }); tarlalariYaz(true); sheetKapat(); ses("altin");
    ucanYazi("Yeni tarla! 🌱", tarlaNokta(i), "buyuk"); degisti();
  }
  function insaatDokun(id) {
    var ad = YER_AD[id] || BINA[id].ad, sv = YERLER[id] ? yerSv(id) : BINA[id].sv;
    toast(ad + " " + sv + ". seviyede açılıyor · şu an " + S.sv + ". seviyedesin");
  }

  /* üretim */
  function tarifOf(id, tarifId) { var l = BINA[id].tarif; for (var i = 0; i < l.length; i++) if (l[i].id === tarifId) return l[i]; return null; }
  function eksikler(gir) { var e = []; for (var k in gir) { var v = S.env[k] || 0; if (v < gir[k]) e.push([k, gir[k] - v]); } return e; }
  function kuyrukIlerlet(id) {
    var q = S.bina[id], now = Date.now(), oldu = false;
    while (q.k.length) { var it = q.k[0], tr = tarifOf(id, it.id); if (!tr || it.t + tr.sure * 1000 > now) break; q.h.push(it.id); q.k.shift(); oldu = true; }
    return oldu;
  }
  function uret(id, tarifId) {
    var tr = tarifOf(id, tarifId), q = S.bina[id]; if (!tr || URUN[tarifId].sv > S.sv || S.sv < BINA[id].sv) return;
    if (q.k.length >= KUYRUK) { toast("Kuyruk dolu, biri bitince ekleyebilirsin"); ses("hata"); return; }
    var e = eksikler(tr.gir);
    if (e.length) { toast("Eksik: " + e.map(function (x) { return x[1] + " " + URUN[x[0]].ad; }).join(", ")); ses("hata"); return; }
    for (var k in tr.gir) S.env[k] -= tr.gir[k];
    var bas = Date.now();
    if (q.k.length) { var son = q.k[q.k.length - 1], st = tarifOf(id, son.id); bas = Math.max(bas, son.t + st.sure * 1000); }
    q.k.push({ id: tarifId, t: bas }); ses("uretim"); degisti();
  }
  function binaTopla(id) {
    var q = S.bina[id]; if (!q.h.length) return false;
    var say = {}, xp = 0;
    q.h.forEach(function (tid) { var tr = tarifOf(id, tid); say[tid] = (say[tid] || 0) + tr.adet; xp += URUN[tid].xp * tr.adet; });
    q.h = [];
    var v3 = binaV[id].ust.clone(), j = 0, favYeni = false;
    for (var ft in say) if (URUN[ft].fav && !S.fav[ft]) { S.fav[ft] = Date.now(); favYeni = true; }
    if (favYeni) setTimeout(favKontrol, 900);
    for (var tid in say) { S.env[tid] = (S.env[tid] || 0) + say[tid]; (function (tid, n, j) { setTimeout(function () { ucanYazi("+" + n + " " + ik(tid), v3.clone().add(new T.Vector3(j * 0.6, -j * 0.4, 0))); ucur(tid, v3, $("bAmbar"), n); }, j * 160); })(tid, say[tid], j); j++; }
    ses("topla"); xpEkle(xp, v3); degisti();
    return true;
  }
  function favSay() { var n = 0; FAVORI.forEach(function (f) { if (S.fav[f]) n++; }); return n; }
  function favKontrol() {
    var n = favSay();
    if (n < FAVORI.length) { toast("Favori defteri: " + n + "/" + FAVORI.length + " ✓ — evde görebilirsin"); return; }
    if (S.ist.favTamam) return;
    S.ist.favTamam = 1; S.altin += 150; xpEkle(25, binaV.ev.ust.clone());
    ses("seviye"); toast("Favorilerin hepsi yapıldı ☕🧁🥪🍮 · +150 altın"); try { if (window.__burst) window.__burst(80); } catch (e) {}
    degisti();
  }
  function binaDokun(id) {
    kuyrukIlerlet(id);
    if (binaTopla(id)) return;
    ses("dokun"); binaSheet(id);
  }

  /* hayvanlar */
  function hayvanDurumlari(tur) {
    var L = S.hay[tur], H = HAYVAN[tur], now = Date.now(), oldu = false;
    L.forEach(function (a) { if (a.d === "yiyor" && now - a.t >= H.sure * 1000) { a.d = "hazir"; oldu = true; } });
    return oldu;
  }
  /* bir barınağa dokununca: önce hazır ürünler toplanır, sonra açlar beslenir, yoksa panel */
  function yerDokun(yer) {
    var turler = YERLER[yer].filter(function (t) { return S.hay[t].length; });
    if (!turler.length) { insaatDokun(yer); return; }
    for (var i = 0; i < turler.length; i++) if (hayvanYer(turler[i], true)) return;
    ses("dokun"); hayvanSheet(turler[0]);
  }
  function hayvanYer(tur, sessiz) {
    var H = HAYVAN[tur], L = S.hay[tur];
    if (!L.length) { if (!sessiz) insaatDokun(H.yerId); return false; }
    hayvanDurumlari(tur);
    var hazir = 0; L.forEach(function (a) { if (a.d === "hazir") hazir++; });
    var merkez = binaV[H.yerId].ust.clone().setY(1.6), AL = ALAN[H.yerId];
    function karGel(tur2) { karakterGit((AL.x0 + AL.x1) / 2 + (Math.random() - 0.5) * 2, AL.z1 + 0.9, 1.6, tur2); }
    if (hazir) { karGel("hasat");
      L.forEach(function (a) { if (a.d === "hazir") { a.d = "ac"; a.t = 0; } });
      S.env[H.urun] = (S.env[H.urun] || 0) + hazir;
      ucanYazi("+" + hazir + " " + ik(H.urun), merkez); ucur(H.urun, merkez, $("bAmbar"), hazir); ses("topla"); ses(H.ses);
      xpEkle(URUN[H.urun].xp * hazir, merkez); degisti(); return true;
    }
    var ac = L.filter(function (a) { return a.d === "ac"; }), yem = S.env[H.yem] || 0;
    if (ac.length && yem) {
      var n = Math.min(ac.length, yem), now = Date.now(); karGel("besle");
      for (var k = 0; k < n; k++) { ac[k].d = "yiyor"; ac[k].t = now; }
      S.env[H.yem] -= n; ses(H.ses); ucanYazi("−" + n + " " + ik(H.yem), merkez, "eksi");
      toast(n === ac.length ? { tavuk: "Tavuklar doydu 🐔", inek: "İnekler doydu 🐄", koyun: "Koyunlar doydu 🐑", keci: "Keçiler doydu 🐐" }[tur] : n + " " + H.ad.toLocaleLowerCase("tr") + " doydu · yem yetmedi");
      degisti(); return true;
    }
    if (!sessiz) { ses("dokun"); hayvanSheet(tur); }
    return false;
  }
  function hayvanTek(tur, i) {
    var o = hayV[tur][i]; if (o) { o.zipla = 0.0001; }
    hayvanYer(tur);
  }
  function hayvanAl(tur) {
    var H = HAYVAN[tur], L = S.hay[tur];
    if (S.sv < H.sv || L.length >= H.max) return;
    if (S.altin < H.fiyat) { toast(H.fiyat + " altın lazım"); ses("hata"); return; }
    S.altin -= H.fiyat; L.push({ d: "ac", t: 0 }); hayvanlariEsitle(); ses(H.ses); ses("altin"); degisti();
  }

  /* siparişler */
  function siparisUret() {
    var r = Math.random, acik = SIRA_URUN.filter(function (id) {
      if (URUN[id].sv > S.sv || id === "tyem" || id === "iyem") return false;
      if (id === "yumurta") return S.hay.tavuk.length > 0;
      if (id === "sut") return S.hay.inek.length > 0;
      if (id === "yun") return S.hay.koyun.length > 0;
      if (id === "kecisutu") return S.hay.keci.length > 0;
      if (AGAC[id === "elma" ? "elma" : id === "limon" ? "limon" : id === "kiraz" ? "kiraz" : id === "nar" ? "nar" : "x"]) return S.agac.some(function (a) { return a && a.tur === id; });
      if (id === "peynir") return S.hay.keci.length > 0;
      if (id === "ip" || id === "atki" || id === "kazak") return S.hay.koyun.length > 0;
      if (id === "turta" || id === "elmarecel") return S.agac.some(function (a) { return a && a.tur === "elma"; });
      if (id === "limonata") return S.agac.some(function (a) { return a && a.tur === "limon"; });
      return true;
    });
    var n = S.sv < 2 ? 1 : S.sv < 4 ? (r() < 0.6 ? 1 : 2) : (r() < 0.35 ? 1 : r() < 0.8 ? 2 : 3);
    n = Math.min(n, acik.length);
    var u = {}, d = 0, x = 0, havuz = acik.slice();
    for (var k = 0; k < n; k++) {
      var top = 0, w = havuz.map(function (id) { var a = URUN[id].sv >= S.sv - 1 ? 2.2 : 1; top += a; return a; }), s = r() * top, j = 0;
      for (; j < havuz.length - 1; j++) { s -= w[j]; if (s <= 0) break; }
      var id = havuz.splice(j, 1)[0], ekin = EKINLER.indexOf(id) >= 0;
      var q = ekin ? 2 + Math.floor(r() * (2 + Math.min(4, S.sv / 2))) : 1 + Math.floor(r() * (1 + Math.min(2, S.sv / 4)));
      u[id] = q; d += URUN[id].deger * q; x += URUN[id].xp * q;
    }
    var sip = { u: u, altin: Math.round(d * 1.3 + 3), xp: Math.max(2, Math.round(x + 1)) };
    var favAcik = FAVORI.filter(function (f) { return URUN[f].sv <= S.sv; });
    if (favAcik.length && r() < 0.22 && !S.sip.some(function (q) { return q && q.kim; })) {        /* arada Yunus'tan sipariş: favorilerden, daha cömert */
      var f = favAcik[Math.floor(r() * favAcik.length)], NOT = { americano: ["Sabah kahvesi senden olsun ☕", "Americano, sütsüz şekersiz. Biliyorsun 🙂"], muffin: ["Yaban mersinli olsun, başka muffin kabul etmem 🧁", "İçi mavi mavi olsun 🫐"], atomtost: ["Atom tost. Ciddiyim 🥪", "Bol kaşarlı, acılı 🔥"], sufle: ["Çileği bol olsun 🍓", "Sufle için her şeyi ekerim 🍫"] }[f];
      var fu = {}; fu[f] = 1; if (r() < 0.4 && favAcik.length > 1) { var f2 = favAcik[Math.floor(r() * favAcik.length)]; fu[f2] = (fu[f2] || 0) + 1; }
      var fd = 0, fx = 0; for (var fk in fu) { fd += URUN[fk].deger * fu[fk]; fx += URUN[fk].xp * fu[fk]; }
      sip = { u: fu, altin: Math.round(fd * 1.7 + 10), xp: Math.max(3, Math.round(fx * 1.5 + 2)), kim: "Yunus", not: NOT[Math.floor(r() * NOT.length)] };
    }
    return sip;
  }
  function siparisleriTazele() {
    var oldu = false, now = Date.now();
    while (S.sip.length < 3) { S.sip.push(siparisUret()); oldu = true; }
    for (var i = 0; i < S.sip.length; i++) if (S.sip[i].bekle && now >= S.sip[i].bekle) { S.sip[i] = siparisUret(); oldu = true; }
    return oldu;
  }
  function siparisTamam(s) { if (!s || s.bekle) return false; for (var k in s.u) if ((S.env[k] || 0) < s.u[k]) return false; return true; }
  function gonder(i) {
    var s = S.sip[i]; if (!siparisTamam(s)) { ses("hata"); return; }
    for (var k in s.u) S.env[k] -= s.u[k];
    S.altin += s.altin; S.ist.siparis++;
    var v3 = new T.Vector3(YER.pano[0], 2.4, YER.pano[1]);
    S.sip[i] = { bekle: Date.now() + 12000 };
    kamyonGit(); ses("kamyon"); setTimeout(function () { ses("altin"); }, 350);
    ucanYazi("+" + s.altin + " " + PARA, v3, "altin"); ucurPara(v3);
    xpEkle(s.xp, v3.clone().add(new T.Vector3(1, -0.6, 0))); degisti();
  }
  function ucurPara(v3) {
    if (AZ_HAREKET) return; var p = ekran(v3); if (!p.on) return; var r = $("altinKutu").getBoundingClientRect();
    for (var k = 0; k < 5; k++) (function (k) {
      var el = document.createElement("div"); el.className = "cfucur"; el.innerHTML = PARA; el.style.transform = "translate(" + (p.x + (k - 2) * 12) + "px," + p.y + "px)"; $("ucanlar").appendChild(el);
      setTimeout(function () { el.style.transform = "translate(" + (r.left + 16) + "px," + (r.top + r.height / 2) + "px) scale(.6)"; }, 40 + k * 60);
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); var a = $("altinKutu"); a.classList.remove("hop"); void a.offsetWidth; a.classList.add("hop"); }, 760 + k * 60);
    })(k);
  }
  function degistir(i) { if (!S.sip[i] || S.sip[i].bekle) return; S.sip[i] = { bekle: Date.now() + 15000 }; ses("dokun"); degisti(); }

  /* XP, seviye */
  var svKuyruk = [];
  function xpEkle(n, v3) {
    if (!n) return;
    S.xp += n; if (v3) setTimeout(function () { ucanYazi("+" + n + " ⭐", v3.clone().add(new T.Vector3(0.6, 0.5, 0)), "xp"); }, 220);
    var once = S.sv;
    while (S.xp >= svXp(S.sv + 1)) { S.sv++; svKuyruk.push(S.sv); }
    if (S.sv !== once) seviyeAtladi();
    hudYaz();
  }
  function acilanlar(l) {
    var a = [];
    SIRA_URUN.forEach(function (id) { if (URUN[id].sv === l) a.push(ik(id) + " " + URUN[id].ad); });
    BINALAR.forEach(function (b) { if (BINA[b].sv === l) a.unshift((b === "kafe" ? "☕ " : "🏠 ") + BINA[b].ad); });
    HAYVANLAR.forEach(function (t) { var H = HAYVAN[t]; if (H.sv === l) a.unshift(H.ik + " " + H.yer + " ve " + H.ilk + " " + H.ad.toLocaleLowerCase("tr")); });
    for (var ag in AGAC) if (AGAC[ag].sv === l) a.push("🌳 " + AGAC[ag].ad + " (markette)");
    for (var dk in DEKOR) if (DEKOR[dk].sv === l) a.push(DEKOR[dk].ik + " " + DEKOR[dk].ad + " (markette)");
    var t = 0; SLOT_SV.forEach(function (s) { if (s === l) t++; }); if (t && l > 1) a.push("🌱 " + t + " yeni tarla yeri");
    return a;
  }
  function seviyeAtladi() {
    HAYVANLAR.forEach(function (tur) { var H = HAYVAN[tur]; if (S.sv >= H.sv && !S.hay[tur].length && !S.ist["ilk_" + tur]) { S.ist["ilk_" + tur] = 1; for (var k = 0; k < H.ilk; k++) S.hay[tur].push({ d: "ac", t: 0 }); } });
    if (S.sv >= 2 && !(S.env.tyem > 0) && !S.ist.hediyeYem) { S.env.tyem = (S.env.tyem || 0) + 3; S.ist.hediyeYem = 1; }
    if (S.sv >= 5 && !(S.env.iyem > 0) && !S.ist.hediyeIyem) { S.env.iyem = (S.env.iyem || 0) + 2; S.ist.hediyeIyem = 1; }
    hayvanlariEsitle(); yapilariGoster(true); tarlalariYaz(false);
    setTimeout(seviyeKartGoster, 500);
  }
  function seviyeKartGoster() {
    if (!svKuyruk.length || !$("seviyeKart").hidden) return;
    var l = svKuyruk.shift();
    $("svYeni").textContent = l;
    var a = acilanlar(l);
    $("svListe").innerHTML = (a.length ? a : ["Yeni siparişler seni bekliyor"]).map(function (x) { return "<li>" + x + "</li>"; }).join("") + (l === 2 ? '<li class="hediye">🎁 Hediye: 3 ' + ik("tyem") + " tavuk yemi</li>" : l === 5 ? '<li class="hediye">🎁 Hediye: 2 ' + ik("iyem") + " inek yemi</li>" : "");
    $("seviyeKart").hidden = false; ses("seviye"); kar.sevinT = 2.6; kar.yon = Math.atan2(camera.position.x - kar.x, camera.position.z - kar.z);
    try { if (window.__burst) window.__burst(90); } catch (e) {}
  }
  $("svTamam").onclick = function () { $("seviyeKart").hidden = true; ses("dokun"); if (svKuyruk.length) setTimeout(seviyeKartGoster, 250); };

  /* ================= alt panel (sheet) ================= */
  var sheet = { tur: null, arg: null, html: "" };
  function sheetAc(tur, arg) { sheet.tur = tur; sheet.arg = arg; sheet.html = ""; sheetCiz(); var s = $("sheet"); s.hidden = false; void s.offsetWidth; s.classList.add("acik"); }
  function sheetKapat() { if (!sheet.tur) return; sheet.tur = null; var s = $("sheet"); s.classList.remove("acik"); setTimeout(function () { if (!sheet.tur) s.hidden = true; }, 220); }
  $("shKapat").onclick = function () { ses("dokun"); sheetKapat(); };
  function sheetCiz() {
    if (!sheet.tur) return;
    if (sheet.tur === "ev" && sheet.html) { $("shBaslik").textContent = S.ad; return; }   /* isim yazılırken kutu sıfırlanmasın */
    var b = "", h = "", a = sheet.arg;
    if (sheet.tur === "tohum") { b = "Ne ekelim?"; h = tohumHtml(a); }
    else if (sheet.tur === "bina") { kuyrukIlerlet(a); b = BINA[a].ad; h = binaHtml(a); }
    else if (sheet.tur === "hayvan") { hayvanDurumlari(a); b = HAYVAN[a].yer; h = hayvanHtml(a); }
    else if (sheet.tur === "siparis") { b = "Siparişler"; h = siparisHtml(); }
    else if (sheet.tur === "ambar") { b = "Ambar"; h = ambarHtml(); }
    else if (sheet.tur === "ev") { b = S.ad; h = evHtml(); }
    else if (sheet.tur === "tarlaAl") { b = "Yeni tarla"; h = tarlaAlHtml(a); }
    else if (sheet.tur === "market") { b = "Market"; h = marketHtml(a); }
    else if (sheet.tur === "agac") { b = "Meyve ağacı yeri"; h = agacAlHtml(a); }
    $("shBaslik").textContent = b;
    if (h !== sheet.html) { var g = $("shIcerik"), st = g.scrollTop; g.innerHTML = h; g.scrollTop = st; sheet.html = h; }
    sayaclar();
  }
  function sayaclar() {
    var now = Date.now();
    [].forEach.call($("shIcerik").querySelectorAll("[data-bit]"), function (el) { el.textContent = sureYaz(+el.getAttribute("data-bit") - now); });
    [].forEach.call($("shIcerik").querySelectorAll("[data-ilerle]"), function (el) { var p = el.getAttribute("data-ilerle").split(","), f = Math.max(0, Math.min(1, (now - p[0]) / (p[1] - p[0]))); el.style.transform = "scaleX(" + f.toFixed(3) + ")"; });
  }
  function adet(k) { return S.env[k] || 0; }
  function girHtml(gir) { var s = ""; for (var k in gir) { var var_ = adet(k), ok = var_ >= gir[k]; s += '<span class="cfgir' + (ok ? "" : " eksik") + '">' + ik(k) + "<b>" + var_ + "/" + gir[k] + "</b></span>"; } return s; }
  function tohumHtml(i) {
    return '<div class="cfliste">' + EKINLER.map(function (id) {
      var kilit = URUN[id].sv > S.sv, bedel = tohumBedeli(id), n = adet(id);
      return '<button type="button" class="cfsatir' + (kilit ? " kilit" : "") + '" data-a="ek" data-id="' + id + '"' + (kilit ? " disabled" : "") + ">" + ik(id) +
        '<span class="cfsatir-tx"><b>' + URUN[id].ad + "</b><small>" + (kilit ? URUN[id].sv + ". seviyede açılır" : sureAd(EKIN_SURE[id]) + " · hasatta " + VERIM + " tane") + "</small></span>" +
        '<span class="cfsag">' + (kilit ? "🔒" : n ? "<b>" + n + "</b><small>elinde</small>" : bedel ? "<b>" + bedel + "</b>" + PARA : "<b>bedava</b>") + "</span></button>";
    }).join("") + '</div><p class="cfnot">Seçince bu tarlaya ekilir; sonra boş tarlalara dokunarak ya da parmağını üzerlerinde gezdirerek devam edebilirsin.</p>';
  }
  function binaHtml(id) {
    var q = S.bina[id], B = BINA[id], now = Date.now(), s = '<div class="cfkuyruk">';
    for (var k = 0; k < KUYRUK; k++) {
      var it = q.k[k];
      if (!it) { s += '<div class="cfslot bos"><span>+</span></div>'; continue; }
      var tr = tarifOf(id, it.id), bit = it.t + tr.sure * 1000, aktif = k === 0;
      s += '<div class="cfslot' + (aktif ? " aktif" : "") + '">' + ik(it.id) + (aktif ? '<i class="cfbar"><i data-ilerle="' + it.t + "," + bit + '"></i></i><small data-bit="' + bit + '"></small>' : "<small>sırada</small>") + "</div>";
    }
    s += "</div>";
    if (q.h.length) { var say = {}; q.h.forEach(function (t) { say[t] = (say[t] || 0) + tarifOf(id, t).adet; }); s += '<button type="button" class="cfana cftopla" data-a="topla" data-id="' + id + '">Topla: ' + Object.keys(say).map(function (t) { return ik(t) + "×" + say[t]; }).join(" ") + "</button>"; }
    s += '<div class="cfliste">' + B.tarif.map(function (tr) {
      var kilit = URUN[tr.id].sv > S.sv, e = eksikler(tr.gir), dolu = q.k.length >= KUYRUK;
      return '<div class="cfsatir' + (kilit ? " kilit" : "") + '">' + ik(tr.id) + '<span class="cfsatir-tx"><b>' + URUN[tr.id].ad + (tr.adet > 1 ? " ×" + tr.adet : "") + "</b><small>" + (kilit ? URUN[tr.id].sv + ". seviyede açılır" : sureAd(tr.sure)) + "</small>" + (kilit ? "" : '<span class="cfgirler">' + girHtml(tr.gir) + "</span>") + "</span>" +
        (kilit ? '<span class="cfsag">🔒</span>' : '<button type="button" class="cfkucuk" data-a="uret" data-id="' + id + '" data-t="' + tr.id + '"' + (e.length || dolu ? " disabled" : "") + ">" + (dolu ? "Dolu" : e.length ? "Eksik" : "Üret") + "</button>") + "</div>";
    }).join("") + "</div>";
    return s;
  }
  function hayvanHtml(tur) {
    var H = HAYVAN[tur], L = S.hay[tur], ac = 0, hz = 0, yiyen = [], turler = YERLER[H.yerId];
    var sekme = turler.length > 1 ? '<div class="cfsekme">' + turler.map(function (t) { var k = HAYVAN[t], kilit = S.sv < k.sv; return '<button type="button" class="' + (t === tur ? "on" : "") + '" data-a="hayvanSekme" data-id="' + t + '"' + (kilit ? " disabled" : "") + ">" + k.ik + " " + k.ad + (kilit ? " 🔒" : "") + "</button>"; }).join("") + "</div>" : "";
    if (!L.length) return sekme + '<p class="cfnot buyuk">' + H.ad + " için " + H.yer.toLocaleLowerCase("tr") + " hazır; ilk " + H.ad.toLocaleLowerCase("tr") + " " + H.sv + ". seviyede geliyor.</p>";
    L.forEach(function (a) { if (a.d === "ac") ac++; else if (a.d === "hazir") hz++; else yiyen.push(a.t + H.sure * 1000); });
    yiyen.sort(function (a, b) { return a - b; });
    var s = '<div class="cfhayvan"><div class="cfdurum"><b>' + L.length + "</b><small>" + H.ad.toLocaleLowerCase("tr") + "</small></div>" +
      '<div class="cfdurum"><b>' + ac + "</b><small>aç</small></div>" +
      '<div class="cfdurum"><b>' + yiyen.length + "</b><small>" + (yiyen.length ? '<span data-bit="' + yiyen[0] + '"></span>' : ({ tavuk: "yumurtluyor", inek: "süt veriyor", koyun: "yün veriyor", keci: "süt veriyor" }[tur])) + "</small></div>" +
      '<div class="cfdurum"><b>' + hz + "</b><small>hazır " + ik(H.urun) + "</small></div></div>";
    if (hz) s += '<button type="button" class="cfana" data-a="hayvanTopla" data-id="' + tur + '">Topla: ' + ik(H.urun) + "×" + hz + "</button>";
    else if (ac) s += '<button type="button" class="cfana" data-a="besle" data-id="' + tur + '"' + (adet(H.yem) ? "" : " disabled") + ">" + (adet(H.yem) ? "Besle · " + ik(H.yem) + " " + adet(H.yem) + " tane var" : ik(H.yem) + " " + URUN[H.yem].ad + " yok") + "</button>";
    if (ac && !adet(H.yem)) s += '<p class="cfnot">' + URUN[H.yem].ad + " Yem Fabrikası'nda yapılıyor: " + girHtml(tarifOf("yem", H.yem).gir) + "</p>";
    s = sekme + s;
    s += L.length < H.max ? '<button type="button" class="cfikinci" data-a="hayvanAl" data-id="' + tur + '"' + (S.altin < H.fiyat ? " disabled" : "") + ">Yeni " + H.ad.toLocaleLowerCase("tr") + " al · " + H.fiyat + " " + PARA + " <small>(" + (S.altin < H.fiyat ? "altın yetmiyor · " : "") + L.length + "/" + H.max + ")</small></button>" : '<p class="cfnot">' + H.yer + " dolu (" + H.max + "/" + H.max + ").</p>";
    return s;
  }
  function siparisHtml() {
    return '<div class="cfsiparisler">' + S.sip.map(function (s, i) {
      if (s.bekle) return '<div class="cfsiparis bekle"><span class="cfkamyon">🚚</span><small>Yeni sipariş geliyor</small><b data-bit="' + s.bekle + '"></b></div>';
      var tamam = siparisTamam(s);
      return '<div class="cfsiparis' + (tamam ? " tamam" : "") + (s.kim ? " ozel" : "") + '">' + (s.kim ? '<div class="cfkim"><b>' + esc(s.kim) + "</b>" + (s.not ? '<span>' + esc(s.not) + "</span>" : "") + "</div>" : "") + '<div class="cfsip-urun">' + Object.keys(s.u).map(function (k) { var ok = adet(k) >= s.u[k]; return '<span class="cfsipu' + (ok ? " ok" : "") + '">' + ik(k) + "<b>" + adet(k) + "/" + s.u[k] + "</b></span>"; }).join("") + "</div>" +
        '<div class="cfodul"><span>' + PARA + "<b>" + s.altin + "</b></span><span>⭐<b>" + s.xp + "</b></span></div>" +
        '<button type="button" class="cfkucuk" data-a="gonder" data-i="' + i + '"' + (tamam ? "" : " disabled") + ">" + (tamam ? "Gönder" : "Eksik var") + "</button>" +
        '<button type="button" class="cfsil" data-a="degistir" data-i="' + i + '" aria-label="Siparişi değiştir">↻</button></div>';
    }).join("") + '</div><p class="cfnot">Siparişi gönderince kamyon yola çıkar, altın ve yıldız gelir. Beğenmediğin siparişi ↻ ile değiştirebilirsin.</p>';
  }
  function ambarHtml() {
    var dolu = SIRA_URUN.filter(function (id) { return adet(id) > 0; });
    if (!dolu.length) return '<p class="cfbos">Ambar boş. Hasat ettiklerin ve ürettiklerin burada birikir.</p>';
    var top = 0; dolu.forEach(function (id) { top += adet(id); });
    return '<div class="cfambar">' + dolu.map(function (id) { return '<div class="cfkutu">' + ik(id) + "<b>" + adet(id) + "</b><small>" + URUN[id].ad + "</small></div>"; }).join("") + '</div><p class="cfnot">Toplam ' + top + " ürün.</p>";
  }
  function evHtml() {
    return '<label class="cfetiket">Çiftliğin adı</label><div class="cfisim"><input type="text" id="evIsim" maxlength="22" value="' + esc(S.ad) + '" autocomplete="off" spellcheck="false"><button type="button" class="cfkucuk" data-a="isim">Kaydet</button></div>' +
      '<div class="cfhayvan"><div class="cfdurum"><b>' + S.sv + "</b><small>seviye</small></div><div class=\"cfdurum\"><b>" + S.ist.hasat + "</b><small>hasat</small></div><div class=\"cfdurum\"><b>" + S.ist.siparis + "</b><small>sipariş</small></div><div class=\"cfdurum\"><b>" + S.tarla.length + "</b><small>tarla</small></div></div>" +
      '<button type="button" class="cfikinci" data-a="karakter">👗 Karakteri değiştir</button>' +
      '<label class="cfetiket">Favori defteri</label><div class="cffav">' + FAVORI.map(function (f) { var ok = !!S.fav[f], kilit = URUN[f].sv > S.sv; return '<div class="cffavk' + (ok ? " ok" : "") + '">' + ik(f) + "<small>" + URUN[f].ad + "</small><i>" + (ok ? "✓" : kilit ? URUN[f].sv + ". sv" : "henüz") + "</i></div>"; }).join("") + "</div>" +
      '<p class="cfnot">' + (S.ist.favTamam ? "Hepsi yapıldı ✓" : "Kafede dördünü de bir kez yapınca küçük bir sürpriz var.") + "</p>" +
      '<p class="cfnot">' + (bulutRef ? "İlerlemen hesabında; her cihazdan aynı çiftlik." : "İlerlemen bu telefonda saklanıyor.") + "</p>";
  }
  function tarlaAlHtml(i) {
    var f = SLOT_FIYAT[i], yeter = S.altin >= f;
    return '<p class="cfnot buyuk">Bu çimenliği sürüp yeni bir tarla açalım mı?</p><button type="button" class="cfana" data-a="tarlaAl" data-i="' + i + '"' + (yeter ? "" : " disabled") + ">" + (yeter ? "Aç · " + f + " " + PARA : f + " altın lazım · sende " + S.altin) + "</button>";
  }
  function tohumSheet(i) { sheetAc("tohum", i); }
  function binaSheet(id) { sheetAc("bina", id); }
  function hayvanSheet(tur) { sheetAc("hayvan", tur); }
  function siparisSheet() { siparisleriTazele(); sheetAc("siparis"); }
  function ambarSheet() { sheetAc("ambar"); }
  function evSheet() { sheetAc("ev"); }
  function tarlaAlSheet(i) { sheetAc("tarlaAl", i); }
  var marketSekme = "sat";
  function marketSheet(sek) { if (sek) marketSekme = sek; sheetAc("market", marketSekme); }
  var sonPanel = { k: "", t: 0 };
  $("shIcerik").addEventListener("click", function (e) {
    var b = e.target && e.target.closest ? e.target.closest("[data-a]") : null; if (!b || b.disabled) return;
    var a = b.getAttribute("data-a"), id = b.getAttribute("data-id"), i = +b.getAttribute("data-i");
    var anahtar = a + "|" + id + "|" + b.getAttribute("data-t") + "|" + i, simdi = Date.now();
    if (anahtar === sonPanel.k && simdi - sonPanel.t < 420) return;        /* panel yenilenince eski düğmenin çift dokunma koruması kayboluyor */
    sonPanel = { k: anahtar, t: simdi };
    if (a === "ek") { var hedefT = sheet.arg; sheetKapat(); ekmeTur = id; if (typeof hedefT === "number") ek(hedefT, id); modYaz(); }
    else if (a === "uret") uret(id, b.getAttribute("data-t"));
    else if (a === "topla") binaTopla(id);
    else if (a === "besle" || a === "hayvanTopla") hayvanYer(id);
    else if (a === "hayvanAl") hayvanAl(id);
    else if (a === "hayvanSekme") { sheet.arg = id; sheet.html = ""; sheetCiz(); }
    else if (a === "msekme") { marketSekme = id; sheet.arg = id; sheet.html = ""; sheetCiz(); }
    else if (a === "sat") sat(id, +b.getAttribute("data-n"));
    else if (a === "tezgahKoy") tezgahKoy(id);
    else if (a === "tezgahAl") tezgahAl(i);
    else if (a === "agacAl") agacAl(i, id);
    else if (a === "dekorAl") dekorAl(id);
    else if (a === "karakter") { sheetKapat(); karakterAc(); }
    else if (a === "gonder") gonder(i);
    else if (a === "degistir") degistir(i);
    else if (a === "tarlaAl") tarlaAl(i);
    else if (a === "isim") { var v = ($("evIsim").value || "").replace(/\s+/g, " ").trim().slice(0, 22); if (v) { S.ad = v; tabelaYaz(); ses("topla"); toast("Tabela yenilendi 🪧"); degisti(); } }
  });
  $("bAmbar").onclick = function () { ses("dokun"); if (sheet.tur === "ambar") sheetKapat(); else ambarSheet(); };
  $("bMarket").onclick = function () { ses("dokun"); if (sheet.tur === "market") sheetKapat(); else marketSheet(); };
  $("bKarakter").onclick = function () { ses("dokun"); sheetKapat(); karakterAc(); };
  /* yatay oynanır: dikeyde nazik bir uyarı (geçilebilir) */
  var donusGecti = false; try { donusGecti = sessionStorage.getItem("cf_dikey") === "1"; } catch (e) {}
  function donusKontrol() { var dikey = innerHeight > innerWidth * 1.05; $("donus").hidden = !(dikey && !donusGecti && acildi); }
  $("donusGec").onclick = function () { donusGecti = true; try { sessionStorage.setItem("cf_dikey", "1"); } catch (e) {} donusKontrol(); };
  addEventListener("resize", donusKontrol); addEventListener("orientationchange", function () { setTimeout(donusKontrol, 300); });
  $("bSiparis").onclick = function () { ses("dokun"); if (sheet.tur === "siparis") sheetKapat(); else siparisSheet(); };
  $("svKutu").onclick = function () { ses("dokun"); var a = svXp(S.sv), b = svXp(S.sv + 1); toast(S.sv + ". seviye · bir sonrakine " + (b - S.xp) + " ⭐ kaldı"); };

  /* ekme modu bandı */
  function modYaz() {
    var m = $("mod");
    if (!ekmeTur) { m.hidden = true; return; }
    m.hidden = false; $("modIk").innerHTML = ik(ekmeTur);
    var bos = 0; S.tarla.forEach(function (t) { if (!t.u) bos++; });
    $("modTxt").textContent = bos ? URUN[ekmeTur].ad + " ekiyorsun · boş tarlalara dokun (" + bos + " boş)" : "Boş tarla kalmadı";
    if (!bos) setTimeout(function () { if (ekmeTur) { var b2 = 0; S.tarla.forEach(function (t) { if (!t.u) b2++; }); if (!b2) modBitir(); } }, 900);
  }
  function modBitir() { ekmeTur = null; modYaz(); }
  $("modBitti").onclick = function () { ses("dokun"); modBitir(); };

  /* ================= gösterge, ipucu, baloncuklar ================= */
  var _hud = "";
  function hudYaz() {
    var a = svXp(S.sv), b = svXp(S.sv + 1), k = S.sv + "|" + S.xp + "|" + S.altin;
    $("sipNokta").hidden = !S.sip.some(siparisTamam);
    if (k === _hud) return; _hud = k;
    $("sv").textContent = S.sv; $("xpBar").style.transform = "scaleX(" + Math.max(0.02, Math.min(1, (S.xp - a) / (b - a))).toFixed(3) + ")";
    $("xpTxt").textContent = (S.xp - a) + "/" + (b - a); $("altin").textContent = S.altin;
  }
  var _ip = "";
  function ipucuYaz() {
    var m = "", olgunVar = false, bos = 0, buyuyen = null;
    S.tarla.forEach(function (t, i) { if (!t.u) bos++; else if (olgun(i)) olgunVar = true; else { var k = kalanMs(i); if (!buyuyen || k < buyuyen[1]) buyuyen = [t.u, k]; } });
    var binaHazir = BINALAR.filter(function (id) { return S.sv >= BINA[id].sv && S.bina[id].h.length; })[0];
    var hayHazir = HAYVANLAR.filter(function (t) { return S.hay[t].some(function (a) { return a.d === "hazir"; }); })[0];
    var hayAc = HAYVANLAR.filter(function (t) { return S.hay[t].some(function (a) { return a.d === "ac"; }); })[0];
    var agacHazir = S.agac.some(function (a, i) { return a && agacOlgun(i); });
    if (olgunVar) m = S.ist.hasat < 3 ? "Buğdaylar olmuş! Tarlaya dokun, hasat et 🌾" : "Hasat zamanı! Parmağını olgun tarlaların üstünden geçir 🌾";
    else if (binaHazir) m = BINA[binaHazir].ad + " hazır, dokunup topla";
    else if (hayHazir) m = { tavuk: "Yumurtalar hazır, kümese dokun 🥚", inek: "Süt hazır, ahıra dokun 🥛", koyun: "Yün hazır, ağıla dokun 🧶", keci: "Keçi sütü hazır, ağıla dokun 🍶" }[hayHazir];
    else if (agacHazir) m = "Meyveler olmuş, ağaca dokun 🍎";
    else if (S.sip.some(siparisTamam)) m = "Bir sipariş hazır! Panoya dokun 🚚";
    else if (bos && !ekmeTur) m = S.ist.ekim < 2 ? "Boş tarlaya dokun, buğday ek 🌱" : bos + " boş tarla var, bir şey ek 🌱";
    else if (hayAc && adet(HAYVAN[hayAc].yem)) m = HAYVAN[hayAc].ad + "lar aç, " + HAYVAN[hayAc].yer.toLocaleLowerCase("tr") + "a dokun " + HAYVAN[hayAc].ik;
    else if (hayAc && S.sv >= BINA.yem.sv) m = URUN[HAYVAN[hayAc].yem].ad + " lazım: Yem Fabrikası'na dokun";
    else if (buyuyen) m = URUN[buyuyen[0]].ad + " büyüyor · " + sureYaz(buyuyen[1]);
    else m = "Siparişlere bak, ne lazımsa onu ek ya da üret";
    if (ekmeTur) m = "";
    if (m !== _ip) { _ip = m; var el = $("ipucu"); el.textContent = m; el.hidden = !m; ipucuYuz(el, m); }
  }
  var IP_YUZ = [0, 5, 11, 1, 10], _ipYuz = "";
  function ipucuYuz(el, m) {                                                /* alttaki bilgi yazısında Büşra'nın yüzü (yazının türüne göre ifade) */
    if (!karCiz || !m) { el.classList.remove("yuzlu"); return; }
    var y = /!|hazır|olmuş|olmuş/.test(m) ? 6 : /lazım|aç,|bak/.test(m) ? 7 : /büyüyor/.test(m) ? 10 : IP_YUZ[(m.length + m.charCodeAt(0)) % IP_YUZ.length];
    var u = karCiz.yuz(y); if (u !== _ipYuz) { _ipYuz = u; el.style.setProperty("--yuz", 'url("' + u + '")'); }
    el.classList.add("yuzlu");
  }
  function balonlariYaz() {
    BINALAR.forEach(function (id) {
      var q = S.bina[id], v = binaV[id], html = "", cls = "";
      if (S.sv >= BINA[id].sv) {
        if (q.h.length) { var say = {}; q.h.forEach(function (t) { say[t] = (say[t] || 0) + tarifOf(id, t).adet; }); var ilk = Object.keys(say)[0]; html = ik(ilk) + "<b>×" + say[ilk] + "</b>" + (Object.keys(say).length > 1 ? "<b>+</b>" : ""); cls = "hazir"; }
        else if (q.k.length) { var tr = tarifOf(id, q.k[0].id); html = ik(q.k[0].id) + '<small data-bit="' + (q.k[0].t + tr.sure * 1000) + '">' + sureYaz(q.k[0].t + tr.sure * 1000 - Date.now()) + "</small>"; cls = "kucuk"; }
      }
      balon(id, v.ust, html, function () { binaDokun(id); }, cls);
    });
    for (var yer in YERLER) (function (yer) {
      var v = binaV[yer], html = "", cls = "", var_ = false;
      YERLER[yer].forEach(function (tur) {
        var L = S.hay[tur], H = HAYVAN[tur], hz = 0, ac = 0; if (L.length) var_ = true;
        L.forEach(function (a) { if (a.d === "hazir") hz++; else if (a.d === "ac") ac++; });
        if (hz && cls !== "hazir") { html = ik(H.urun) + "<b>×" + hz + "</b>"; cls = "hazir"; }
        else if (ac && !cls) { html = ik(H.yem) + "<small>aç</small>"; cls = "kucuk ac"; }
      });
      balon(yer, v.ust, var_ ? html : "", function () { yerDokun(yer); }, cls);
    })(yer);
    S.agac.forEach(function (a, i) { if (!a) return; balon("agac" + i, new T.Vector3(AGAC_YER[i][0], 2.6, AGAC_YER[i][1]), agacOlgun(i) ? ik(AGAC[a.tur].urun) + "<b>×" + AGAC_VERIM + "</b>" : "", function () { agacDokun(i); }, "hazir"); });
    var ok = S.sip.some(siparisTamam);
    balon("pano", binaV.pano.ust, ok ? "📋<b>✓</b>" : "", function () { ses("dokun"); siparisSheet(); }, "hazir");
  }
  function balonSayaclari() { var now = Date.now(); for (var k in BAL) { var s = BAL[k].el.querySelector("[data-bit]"); if (s) { var y = sureYaz(+s.getAttribute("data-bit") - now); if (s.textContent !== y) s.textContent = y; } } }

  /* ================= canlandırmalar ================= */
  function kamyonGit() { if (kamyon.durum === "park") { kamyon.durum = "git"; kamyon.v = 0; } }
  function kamyonAnim(dt) {
    var k = kamyon;
    if (k.durum === "git") { k.v = Math.min(14, k.v + dt * 7); k.x += k.v * dt; if (k.x > 60) { k.durum = "bekle"; k.bekle = 3.5; } }
    else if (k.durum === "bekle") { k.bekle -= dt; if (k.bekle <= 0) { k.durum = "don"; k.x = -60; k.v = 12; } }
    else if (k.durum === "don") { var kal = PARK_X - k.x; k.v = Math.max(1.2, Math.min(12, kal * 1.4)); k.x += k.v * dt; if (k.x >= PARK_X) { k.x = PARK_X; k.durum = "park"; } }
    k.m.position.x = k.x; k.m.position.y = k.durum === "park" ? 0 : Math.abs(Math.sin(k.x * 2.1)) * 0.03;
    if (k.durum !== "park" && k.v) { var don = k.v * dt / 0.32; k.teker.forEach(function (t) { t.rotation.z -= don; }); k.toz -= dt; if (k.toz <= 0 && Math.abs(k.x) < 30) { k.toz = 0.12; tozCik(k.x - 1.4, YOL_Z - 0.35 + (Math.random() - 0.5) * 1.2); } }
    kanat.rotation.z -= dt * 0.9;
  }
  function hayvanAnim(dt, t) {
    HAYVANLAR.forEach(function (tur) {
      var V = hayV[tur], L = S.hay[tur], A = ALAN[HAYVAN[tur].yerId], pay = 0, hiz = HAYVAN[tur].hiz;
      for (var i = 0; i < V.length; i++) {
        var o = V[i], a = L[i], hazir = a && a.d === "hazir", m = o.m;
        if (hazir) { o.urun.visible = true; o.urun.position.set(o.x + Math.sin(o.yon) * (tur === "tavuk" ? -0.28 : 0) + (tur === "inek" ? 0.75 : 0), 0, o.z - Math.cos(o.yon) * (tur === "tavuk" ? 0.28 : 0)); }
        else o.urun.visible = false;
        o.faz += dt;
        var dx = o.hx - o.x, dz = o.hz - o.z, L2 = Math.hypot(dx, dz), yuruyor = false;
        if (o.bekle > 0 || hazir) { o.bekle -= dt; if (o.bekle <= 0 && !hazir) { var p = alanRastgele(A, pay); o.hx = p[0]; o.hz = p[1]; } }
        else if (L2 > 0.05) {
          var hedefYon = Math.atan2(dx, dz), fark = Math.atan2(Math.sin(hedefYon - o.yon), Math.cos(hedefYon - o.yon));
          o.yon += fark * Math.min(1, dt * 5);
          if (Math.abs(fark) < 0.6) { var s = Math.min(L2, hiz * dt); o.x += Math.sin(o.yon) * s; o.z += Math.cos(o.yon) * s; yuruyor = true; }
        } else { o.bekle = (tur === "tavuk" ? 1 : 3) + Math.random() * (tur === "tavuk" ? 2.5 : 5); }
        for (var j = 0; j < V.length; j++) {                               /* üst üste binmesinler */
          if (j === i) continue; var q = V[j], ax = o.x - q.x, az = o.z - q.z, ad = Math.hypot(ax, az), min = HAYVAN[tur].boy;
          if (ad < min && ad > 0.0001 && !hazir) { var it = (min - ad) * 0.5 * Math.min(1, dt * 6); o.x += ax / ad * it; o.z += az / ad * it; }
        }
        o.x = Math.max(A.x0, Math.min(A.x1, o.x)); o.z = Math.max(A.z0, Math.min(A.z1, o.z));
        m.position.x = o.x; m.position.z = o.z; m.rotation.y = o.yon;
        var gagala = !yuruyor && tur === "tavuk" && (a && a.d === "yiyor" ? Math.sin(o.faz * 7) > 0.2 : Math.sin(o.faz * 2.3) > 0.85);
        m.rotation.x = gagala ? 0.45 : 0;
        var zip = 0; if (o.zipla) { o.zipla += dt; zip = Math.sin(Math.min(1, o.zipla / 0.35) * Math.PI) * (tur === "tavuk" ? 0.35 : 0.15); if (o.zipla > 0.35) o.zipla = 0; }
        m.position.y = (yuruyor ? Math.abs(Math.sin(o.faz * (tur === "tavuk" ? 14 : 6))) * (tur === "tavuk" ? 0.05 : 0.03) : 0) + zip + (hazir && tur === "tavuk" ? -0.06 : 0);
        if (o.kuyruk) o.kuyruk.rotation.z = Math.sin(o.faz * 2.2) * 0.35;
      }
    });
  }
  binaV.ev.grup.updateMatrixWorld(true);
  var evBaca = binaV.ev.grup.localToWorld(new T.Vector3(1.3, 4.6, -0.6)), evDuman = 0;
  var dumanlar = [], dumanSay = 0;
  for (var di = 0; di < 16; di++) { var dm = new T.Mesh(new T.IcosahedronGeometry(0.22, 0), new T.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); dm.visible = false; scene.add(dm); dumanlar.push({ m: dm, t: 0, yuk: 0.8, suruk: 0.25, omur: 2.4 }); }
  function dumanCik(p) { for (var i = 0; i < dumanlar.length; i++) if (!dumanlar[i].m.visible) { var d = dumanlar[i]; d.t = 0; d.m.visible = true; d.m.position.copy(p); d.m.material.color.set(0xffffff); d.yuk = 0.8; d.suruk = 0.25; d.omur = 2.4; return; } }
  function tozCik(x, z) { for (var i = 0; i < dumanlar.length; i++) if (!dumanlar[i].m.visible) { var d = dumanlar[i]; d.t = 0; d.m.visible = true; d.m.position.set(x, 0.15, z); d.m.material.color.set(0xd9c39a); d.yuk = 0.5; d.suruk = -0.6; d.omur = 0.9; return; } }
  function dumanAnim(dt) {
    var calisiyor = S.sv >= BINA.firin.sv && S.bina.firin.k.length > 0;
    dumanSay -= dt;
    if (calisiyor && dumanSay <= 0) { dumanSay = 0.55; dumanCik(baca); }
    evDuman -= dt; if (evDuman <= 0) { evDuman = 1.6; dumanCik(evBaca); }
    dumanlar.forEach(function (d) {
      if (!d.m.visible) return; d.t += dt;
      d.m.position.y += dt * d.yuk; d.m.position.x += dt * d.suruk; d.m.scale.setScalar(0.7 + d.t * 1.2);
      d.m.material.opacity = Math.max(0, 0.7 * (1 - d.t / d.omur)); if (d.t > d.omur) d.m.visible = false;
    });
    if (S.sv >= BINA.yem.sv && S.bina.yem.k.length) cark.rotation.z -= dt * 2.2;
  }
  function popAnim(dt) {
    tarlaV.forEach(function (v) { if (!v.pop) return; v.pop += dt; var f = Math.min(1, v.pop / 0.4), s = 1 + Math.sin(f * Math.PI) * 0.12 * (1 - f); v.ekin.scale.set(1, (0.2 + 0.8 * f) * s, 1); if (f >= 1) { v.pop = 0; v.ekin.scale.set(1, 1, 1); } });
    for (var id in binaV) {
      var b = binaV[id]; if (!b.pop) continue; b.pop += dt;
      if (b.popTur === "dokun") { var fd = Math.min(1, b.pop / 0.38), sq = Math.sin(fd * Math.PI) * 0.09 * (1 - fd * 0.5); b.grup.scale.set(1 + sq, 1 - sq * 1.3, 1 + sq); if (fd >= 1) { b.pop = 0; b.popTur = ""; b.grup.scale.setScalar(1); } continue; }
      var f2 = Math.min(1, b.pop / 0.7), e = 1 - Math.pow(1 - f2, 3), os = 1 + Math.sin(f2 * Math.PI) * 0.15; b.grup.scale.setScalar(Math.max(0.01, e * os)); if (f2 >= 1) { b.pop = 0; b.grup.scale.setScalar(1); }
    }
    for (var i = halkalar.length - 1; i >= 0; i--) { var h = halkalar[i]; h.t += dt; h.m.scale.setScalar(0.3 + h.t * 1.8); h.m.material.opacity = Math.max(0, 0.7 * (1 - h.t / 1.2)); if (h.t > 1.2) { scene.remove(h.m); h.m.geometry.dispose(); h.m.material.dispose(); halkalar.splice(i, 1); } }
  }
  /* kelebekler: çiçeklerin üstünde dolaşan küçük kanatlar */
  var kelebekler = [];
  (function () {
    var KR = [0xffb3d1, 0xfff07a, 0xc9b6ff, 0xffffff];
    var kg = new T.BufferGeometry(); kg.setAttribute("position", new T.Float32BufferAttribute([0, 0, 0, 0.16, 0, 0.1, 0.13, 0, -0.1], 3)); kg.computeVertexNormals();
    for (var i = 0; i < 5; i++) {
      var g = new T.Group(), mat = new T.MeshLambertMaterial({ color: KR[i % KR.length], side: T.DoubleSide });
      var sol = new T.Mesh(kg, mat), sag = new T.Mesh(kg, mat); sag.scale.x = -1; g.add(sol); g.add(sag);
      var mx = [-12.8, 3.3, -11, 0, 7.4][i], mz = [-7.2, 6.9, 11.3, 6.2, 8.9][i];
      g.position.set(mx, 1, mz); scene.add(g);
      kelebekler.push({ g: g, sol: sol, sag: sag, mx: mx, mz: mz, f: Math.random() * 10, r: 1.2 + Math.random() * 1.2 });
    }
  })();
  function kelebekAnim(dt) {
    kelebekler.forEach(function (k) {
      k.f += dt; var a = k.f * 0.6, x = k.mx + Math.sin(a) * k.r + Math.sin(a * 2.3) * 0.4, z = k.mz + Math.cos(a * 0.8) * k.r * 0.7, y = 0.9 + Math.sin(k.f * 1.7) * 0.3;
      k.g.rotation.y = Math.atan2(x - k.g.position.x, z - k.g.position.z); k.g.position.set(x, y, z);
      var c = Math.sin(k.f * 18) * 1.1; k.sol.rotation.z = c; k.sag.rotation.z = -c;
    });
  }
  function golDokun(p) {
    ses("su"); if (!p) return;
    for (var k = 0; k < 2; k++) (function (k) { setTimeout(function () { var m = new T.Mesh(new T.RingGeometry(0.4, 0.5, 24), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(p.x, 0.09, p.z); scene.add(m); halkalar.push({ m: m, t: 0 }); }, k * 220); })(k);
  }

  /* ================= zaman ================= */
  var sonTik = 0, sonSaniye = 0;
  function zamanla() {
    var oldu = false;
    for (var i = 0; i < S.tarla.length; i++) { var a = asamaOf(i); if (a !== tarlaV[i].asama) { tarlaGorsel(i, true); if (a === 3) oldu = true; } }
    BINALAR.forEach(function (id) { if (kuyrukIlerlet(id)) oldu = true; });
    HAYVANLAR.forEach(function (t) { if (hayvanDurumlari(t)) oldu = true; });
    if (S.tezgah.some(function (t) { return t && !t.bitti && Date.now() >= t.t; })) { S.tezgah.forEach(function (t) { if (t && !t.bitti && Date.now() >= t.t) t.bitti = true; }); oldu = true; }
    if (siparisleriTazele()) oldu = true;
    if (oldu) degisti();
    var now = Date.now();
    if (now - sonSaniye > 950) { sonSaniye = now; if (sheet.tur) sayaclar(); balonSayaclari(); ipucuYaz(); }
  }

  /* ================= döngü ================= */
  var calis = false, sonT = 0, saat = 0;
  function dongu(t) {
    if (!calis) return;
    requestAnimationFrame(dongu);
    var dt = sonT ? Math.min(0.05, (t - sonT) / 1000) : 0.016; sonT = t; saat += dt;
    ruzgar.value = saat;
    if (!jest && (Math.abs(kam.hiz.x) > 0.0005 || Math.abs(kam.hiz.z) > 0.0005)) { kam.h.x += kam.hiz.x * dt * 60; kam.h.z += kam.hiz.z * dt * 60; kam.hiz.multiplyScalar(Math.pow(0.0025, dt)); kamYerlestir(); }
    hayvanAnim(dt, saat); kamyonAnim(dt); dumanAnim(dt); popAnim(dt); kelebekAnim(dt); kirpintiAnim(dt); dekorAnim(dt); karakterAnim(dt); demoTik(dt);
    bulutlar.forEach(function (b) { b.m.position.x += b.v * dt; if (b.m.position.x > 60) b.m.position.x = -60; });
    su.material.shininess = 80 + Math.sin(saat * 1.3) * 20;
    if (saat - sonTik > 0.25) { sonTik = saat; zamanla(); }
    renderer.render(scene, camera);
    balonlariYerlestir();
  }
  function basla() { if (!calis) { calis = true; sonT = 0; requestAnimationFrame(dongu); } }
  document.addEventListener("visibilitychange", function () { if (document.hidden) calis = false; else basla(); });

  /* ================= açılış ================= */
  S = yukleDurum();
  function seviyeAtladiSessiz() { HAYVANLAR.forEach(function (tur) { var H = HAYVAN[tur]; if (S.sv >= H.sv && !S.hay[tur].length && !S.ist["ilk_" + tur]) { S.ist["ilk_" + tur] = 1; for (var k = 0; k < H.ilk; k++) S.hay[tur].push({ d: "ac", t: 0 }); } }); }
  function durumKur() {
    seviyeAtladiSessiz();
    tarlaV.forEach(function (v) { v.asama = -1; v.tur = null; });
    _hud = ""; _ip = ""; if (sheet.tur) sheet.html = "";
    tabelaYaz(); yapilariGoster(false); tarlalariYaz(false); hayvanlariEsitle(); siparisleriTazele();
    BINALAR.forEach(kuyrukIlerlet); HAYVANLAR.forEach(hayvanDurumlari); agaclariYaz(); dekorlariYaz(); karakterKur();
    hudYaz(); ipucuYaz(); balonlariYaz();
    if (S.yeni) { $("isimIn").value = S.ad; $("isimKart").hidden = false; } else { $("isimKart").hidden = true; if (!S.kar && !acildi) setTimeout(karakterAc, 400); }
  }
  boyutla();
  kam.d = (W / H) < 0.8 ? 31 : (W / H) < 1.3 ? 27 : 24; kamYerlestir();
  $("altinKutu").querySelector(".cfpara").innerHTML = SVG.para;
  $("bSes").classList.toggle("kapali", !(window.CfSes && window.CfSes.on()));
  $("bSes").onclick = function () { var on = window.CfSes ? window.CfSes.toggle() : false; $("bSes").classList.toggle("kapali", !on); if (on) ses("dokun"); };
  $("isimTamam").onclick = function () { var v = ($("isimIn").value || "").replace(/\s+/g, " ").trim().slice(0, 22); S.ad = v || S.ad; S.yeni = false; tabelaYaz(); $("isimKart").hidden = true; ses("topla"); try { $("isimIn").blur(); } catch (e) {} kaydet(); ipucuYaz(); if (!S.kar) setTimeout(karakterAc, 300); };
  $("isimIn").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); $("isimTamam").click(); } });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { tabelaYaz(); tarlalariYaz(false); });
  var acildi = false;
  function ac(bulutMesaj) {
    if (acildi) return; acildi = true;
    durumKur(); $("ust").hidden = false; $("alt").hidden = false; basla(); donusKontrol();
    setTimeout(function () { $("yukle").hidden = true; if (bulutMesaj) toast(bulutMesaj); }, 60);
    kaydet();
  }
  function bulutBagla() {
    var k = window.Hesap && Hesap.kim();
    if (!k || !k.kesin) { ac(); return; }
    var zaman = setTimeout(function () { ac(); }, 6000);
    Hesap.db().then(function (db) {
      bulutRef = db.collection("ciftlik").doc(k.uid);
      return bulutRef.get();
    }).then(function (snap) {
      clearTimeout(zaman);
      var d = snap && snap.exists ? snap.data() : null, mesaj = "";
      if (d && d.v === 1 && d.tarla && (d.z || 0) > (S.z || 0)) {                          /* bulut daha yeni: onu kullan */
        var yerelYeni = S.yeni; try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {}
        S = yukleDurum(); mesaj = yerelYeni ? "Çiftliğin hesabından yüklendi ☁️" : "Diğer cihazdaki ilerleme alındı ☁️";
      } else if (!d || (S.z || 0) > (d.z || 0)) bulutBekleyen = true;                      /* buluttaki eski: bizimkini gönder */
      if (acildi) { if (mesaj) { durumKur(); toast(mesaj); } } else ac(mesaj);
      bulutYaz();
    }).catch(function (e) { try { console.warn("çiftlik bulut:", e && e.message, e && e.stack); } catch (x) {} clearTimeout(zaman); ac(); });
  }
  if (window.Hesap && Hesap.kim()) Hesap.hazir(bulutBagla); else ac();
  if (window.Hesap) Hesap.izle(function (k) { if (acildi && k && k.kesin && !bulutRef) bulutBagla(); });
  if (/[#&]test/.test(location.hash)) window.__cf = {
    S: function () { return S; }, durum: function () { return JSON.parse(JSON.stringify(S)); },
    ileri: function (sn) { var d = sn * 1000; S.tarla.forEach(function (t) { if (t.u) t.t -= d; }); BINALAR.forEach(function (b) { S.bina[b].k.forEach(function (k) { k.t -= d; }); }); HAYVANLAR.forEach(function (h) { S.hay[h].forEach(function (a) { if (a.t) a.t -= d; }); }); S.agac.forEach(function (a) { if (a) a.t -= d; }); S.tezgah.forEach(function (t) { if (t) t.t -= d; }); S.sip.forEach(function (s) { if (s.bekle) s.bekle -= d; }); zamanla(); degisti(); },
    ek: ek, hasat: hasat, uret: uret, topla: binaTopla, hayvan: hayvanYer, gonder: gonder, tarlaAl: tarlaAl, xp: xpEkle,
    ekran: function (x, y, z) { return ekran(new T.Vector3(x, y, z)); }, tarlaEkran: function (i) { return ekran(tarlaNokta(i).setY(0.3)); },
    binaEkran: function (id) { return ekran(binaV[id].ust.clone().setY(1.5)); }, kam: kam, kamYerlestir: kamYerlestir, renderer: renderer, sheet: function () { return sheet.tur; },
    yerelSil: function () { S = null; calis = false; try { localStorage.removeItem(KEY); } catch (e) {} },         /* test: "başka cihaz" taklidi */
    yakin: function (d) { DMIN = d; }, agacAl: agacAl, agacDokun: agacDokun, dekorAl: dekorAl, sat: sat, tezgahKoy: tezgahKoy, tezgahAl: tezgahAl, market: marketSheet, karakterAc: karakterAc, karakterGit: karakterGit, demo: function (k) { if (k !== undefined) demoKalan = k; return demoKalan; }, karKare: function () { return kar3d ? "3d" : karCiz ? karCiz.kareAd() : ""; }, kar: function () { return kar; }
  };
})();
