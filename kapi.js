/* Kapı – henüz açılmamış ("geliyor") oyunlar.
   Listedeki oyun ACILIS saatine kadar menüde tıklanmaz (tanıtım kartı açılır), sayfası doğrudan açılmaz (yakinda.html'e gider),
   skor tablosunda satırı ve akış haberleri görünmez. Saat gelince kendiliğinden açılır; menü o an açıksa sayfa yenilenir.
   Kapı yalnızca deneme modunda (?deneme=1) ya da bu cihaz ?acik=1 ile açılmışsa (?acik=0 kapatır) önceden aşılır.
   SAATİ DEĞİŞTİRMEK İÇİN: ACILIS satırını düzelt. HEMEN AÇMAK İÇİN: GELIYOR listesini boşalt. */
(function () {
  var GELIYOR = ["stilobat", "sayi", "amiral"];
  var ACILIS = Date.parse("2026-10-20T20:00:00+03:00");               /* 20 Ekim 2026, 20:00 (Türkiye saati) */
  var ALIAS = { plan: "oyun", tur: "fatih" };                             /* menü anahtarı → dosya adı */
  var q = location.search, m = /[?&]acik=([01])/.exec(q);
  if (m) try { if (m[1] === "1") localStorage.setItem("kapi_acik", "1"); else localStorage.removeItem("kapi_acik"); } catch (e) {}
  var acik = /[?&]deneme/.test(q) || Date.now() >= ACILIS; try { acik = acik || localStorage.getItem("kapi_acik") === "1"; } catch (e) {}
  window.GELIYOR = GELIYOR; window.kapiAcik = acik; window.kapiSaat = ACILIS;
  window.geliyorMu = function (o) { return !acik && (GELIYOR.indexOf(o) >= 0 || GELIYOR.indexOf(ALIAS[o] || "") >= 0); };
  /* "20:00'de açılıyor" / "yarın 20:00" gibi kısa metin */
  window.kapiMetin = function () {
    var d = new Date(ACILIS), n = new Date(), hh = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    var g0 = new Date(n.getFullYear(), n.getMonth(), n.getDate()), g1 = new Date(d.getFullYear(), d.getMonth(), d.getDate()), fark = Math.round((g1 - g0) / 86400000);
    return fark <= 0 ? hh : fark === 1 ? "yarın " + hh : d.getDate() + "." + (d.getMonth() + 1) + " " + hh;
  };
  var sayfa = (location.pathname.split("/").pop() || "").replace(/\.html$/, "");
  if (window.geliyorMu(sayfa)) { location.replace("yakinda.html?o=" + sayfa); return; }
  /* menü / yakında sayfası açıkken saat gelirse yenile */
  if (!acik && GELIYOR.length && (sayfa === "oyunlar" || sayfa === "yakinda")) {
    var kalan = ACILIS - Date.now();
    if (kalan > 0 && kalan < 864e5) setTimeout(function () { location.reload(); }, kalan + 1500);
  }
})();
