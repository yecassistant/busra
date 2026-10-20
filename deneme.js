/* Deneme modu – iki kişilik oyunları tek başına, buluta ve hesaplara dokunmadan denemek için.
   Açılış: sayfaya ?deneme=1 ile girilir (deneme.html'den). hesap.js bu bayrağı görünce kendini kapatır; burası onun yerine
   tarayıcı içinde sahte bir "bulut" (localStorage) ve iki sahte oyuncu (Yunus / Büşra) sunar. Rol üstteki çubuktan değiştirilir;
   iki ayrı sekmede iki ayrı rolle oynanırsa hamleler sekmeler arası canlı akar (storage olayı). Gerçek Firebase'e hiç bağlanmaz. */
(function () {
  "use strict";
  if (!/[?&]deneme/.test(location.search)) return;
  var OYUNCU = { yec: { uid: "deneme-yunus", kul: "yec", ad: "Yunus" }, bus: { uid: "deneme-busra", kul: "bus", ad: "Büşra" } };
  var rol = "yec"; try { rol = sessionStorage.getItem("dn_rol") === "bus" ? "bus" : "yec"; } catch (e) {}
  var ben = OYUNCU[rol], oyunKodu = document.body.getAttribute("data-page") || "";
  var KEY = "dn_store";
  function oku() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function yaz(st) { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  function kopya(v) { return JSON.parse(JSON.stringify(v)); }
  function birles(a, b) { for (var k in b) { if (b[k] && typeof b[k] === "object" && !(b[k] instanceof Array) && a[k] && typeof a[k] === "object" && !(a[k] instanceof Array)) birles(a[k], b[k]); else a[k] = kopya(b[k]); } return a; }
  var dinleyiciler = [], bildirimT = 0;
  function bildir() { clearTimeout(bildirimT); bildirimT = setTimeout(function () { dinleyiciler.slice().forEach(function (f) { try { f(); } catch (e) {} }); }, 0); }
  addEventListener("storage", function (e) { if (e.key === KEY) bildir(); });
  /* ilk kurulum: iki oyuncu dokümanı */
  (function () {
    var st = oku(); st.oyuncular = st.oyuncular || {};
    ["yec", "bus"].forEach(function (k) { var o = OYUNCU[k]; if (!st.oyuncular[o.uid]) st.oyuncular[o.uid] = { kul: o.kul, ad: o.ad, d: {}, dt: {}, son: { o: "", t: 0 }, t: Date.now() }; });
    st.oyuncular[ben.uid].son = { o: oyunKodu, t: Date.now() };
    yaz(st);
  })();
  function snap(col, id) { var st = oku(), d = st[col] && st[col][id]; return { id: id, exists: !!d, data: function () { return d ? kopya(d) : undefined; } }; }
  function docRef(col, id) {
    return {
      id: id,
      get: function () { return Promise.resolve(snap(col, id)); },
      set: function (data, opts) { var st = oku(); st[col] = st[col] || {}; if (opts && opts.merge && st[col][id]) birles(st[col][id], data); else st[col][id] = kopya(data); yaz(st); bildir(); return Promise.resolve(); },
      onSnapshot: function (cb, err) { var f = function () { cb(snap(col, id)); }; dinleyiciler.push(f); setTimeout(f, 0); return function () { var i = dinleyiciler.indexOf(f); if (i >= 0) dinleyiciler.splice(i, 1); }; }
    };
  }
  function sorgu(col, order, dir, lim) {
    function al() {
      var st = oku(), items = [], c = st[col] || {}, k;
      for (k in c) items.push({ id: k, data: c[k] });
      if (order) items.sort(function (a, b) { var x = a.data[order] || 0, y = b.data[order] || 0; return dir === "desc" ? y - x : x - y; });
      if (lim) items = items.slice(0, lim);
      return { size: items.length, forEach: function (fn) { items.forEach(function (it) { fn({ id: it.id, exists: true, data: function () { return kopya(it.data); } }); }); } };
    }
    var q = {
      orderBy: function (f, d) { return sorgu(col, f, d || "asc", lim); }, limit: function (n) { return sorgu(col, order, dir, n); },
      get: function () { return Promise.resolve(al()); },
      onSnapshot: function (cb) { var f = function () { cb(al()); }; dinleyiciler.push(f); setTimeout(f, 0); return function () { var i = dinleyiciler.indexOf(f); if (i >= 0) dinleyiciler.splice(i, 1); }; },
      doc: function (id) { return docRef(col, id); },
      add: function (data) { var id = "dn" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); return docRef(col, id).set(data).then(function () { return docRef(col, id); }); }
    };
    return q;
  }
  var db = {
    collection: function (c) { return sorgu(c, null, "asc", 0); },
    runTransaction: function (fn) { var ops = []; var tx = { get: function (ref) { return ref.get(); }, set: function (ref, data, opts) { ops.push(function () { return ref.set(data, opts); }); } }; return Promise.resolve(fn(tx)).then(function (r) { return ops.reduce(function (p, op) { return p.then(op); }, Promise.resolve()).then(function () { return r; }); }); }
  };
  window.firebase = window.firebase || { firestore: { FieldValue: { serverTimestamp: function () { return Date.now(); } } } };
  var ADLAR = { bus: "Büşra", yec: "Yunus" };
  window.Hesap = {
    kim: function () { return { uid: ben.uid, kul: ben.kul, ad: ben.ad, kesin: true }; },
    izle: function (f) { f(window.Hesap.kim()); }, hazir: function (f) { f(); },
    db: function () { return Promise.resolve(db); }, fb: function () { return Promise.resolve(window.firebase); },
    tms: function (t) { return t && typeof t.toMillis === "function" ? t.toMillis() : (typeof t === "number" ? t : 0); },
    gorunenAd: function (kul) { return ADLAR[kul] || (kul ? kul.charAt(0).toUpperCase() + kul.slice(1) : ""); }, adlar: ADLAR,
    senk: function () { return true; }, _test: function () { return { hazir: true, user: true, sdkHata: false, senk: true, deneme: true }; },
    kural: function () { return null; },
    oyun: function (list) { (function sira(i) { if (i >= list.length) return; var s = document.createElement("script"); s.src = list[i]; s.onload = s.onerror = function () { sira(i + 1); }; document.body.appendChild(s); })(0); },
    giris: function () { return Promise.resolve(); }, cikis: function () { try { sessionStorage.removeItem("dn_rol"); } catch (e) {} return Promise.resolve(); },
    deneme: { rol: rol, oyuncular: OYUNCU, sifirla: function () { try { localStorage.removeItem(KEY); } catch (e) {} }, store: oku }
  };
  /* nabız: "şu an oynuyor" noktası için */
  setInterval(function () { var st = oku(); if (st.oyuncular && st.oyuncular[ben.uid]) { st.oyuncular[ben.uid].son = { o: oyunKodu, t: Date.now() }; yaz(st); } }, 30000);
  /* köşe rozeti: sol altta küçük "D"; dokununca rol/sıfırla/çık açılır (oyun düğmelerinin üstüne oturmasın diye) */
  function cubuk() {
    var b = document.createElement("div"); b.className = "dnbar"; b.setAttribute("role", "status");
    b.innerHTML = '<button type="button" id="dnBadge" aria-label="Deneme modu">D</button><div class="dnp"><b>DENEME</b><span>' + ben.ad + ' olarak</span><button type="button" id="dnRol">' + (rol === "yec" ? "Büşra'ya geç" : "Yunus'a geç") + '</button><button type="button" id="dnSifir">Sıfırla</button><a href="deneme.html">Çık</a></div>';
    document.body.appendChild(b);
    var acikT = 0;
    b.querySelector("#dnBadge").onclick = function () { b.classList.toggle("open"); clearTimeout(acikT); if (b.classList.contains("open")) acikT = setTimeout(function () { b.classList.remove("open"); }, 6000); };
    b.querySelector("#dnRol").onclick = function () { try { sessionStorage.setItem("dn_rol", rol === "yec" ? "bus" : "yec"); } catch (e) {} location.reload(); };
    b.querySelector("#dnSifir").onclick = function () { if (confirm("Deneme verisi silinsin mi? (Gerçek hesaplara dokunmaz)")) { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); } };
    var css = document.createElement("style");
    css.textContent = ".dnbar{position:fixed;left:10px;bottom:max(10px,env(safe-area-inset-bottom));z-index:9999;display:flex;align-items:center;gap:8px;font:700 12px/1 Nunito,system-ui,sans-serif}" +
      ".dnbar #dnBadge{width:36px;height:36px;border-radius:50%;border:0;background:#f2c35b;color:#3b2a08;font:900 14px Nunito,system-ui,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.4),inset 0 0 0 2px rgba(255,255,255,.5);cursor:pointer}" +
      ".dnbar .dnp{display:none;align-items:center;gap:8px;padding:6px 10px;border-radius:999px;background:#1b1020;color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.45),inset 0 0 0 1px rgba(255,255,255,.18);white-space:nowrap}" +
      ".dnbar.open .dnp{display:flex}.dnbar b{color:#f2c35b;letter-spacing:.08em;font-size:10px}.dnbar span{color:#e9dcff}" +
      ".dnbar .dnp button,.dnbar .dnp a{border:0;border-radius:999px;padding:6px 10px;background:#f2c35b;color:#3b2a08;font:800 12px Nunito,system-ui,sans-serif;cursor:pointer;text-decoration:none}.dnbar .dnp a,.dnbar #dnSifir{background:rgba(255,255,255,.14);color:#fff}";
    document.head.appendChild(css);
  }
  if (document.body) cubuk(); else addEventListener("DOMContentLoaded", cubuk);
})();
