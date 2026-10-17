# Büşranur'un Resmi 🌸

Lavanta, şakayık ve lilyum temalı, sayfa sayfa ilerleyen flörtöz bir davet.

## Sayfalar (sırasıyla)
0. `index.html` – **İkinci aşama (açık bilet):** geçmiş olsun, tarih yok, "Hazırım 🌸" tek dokunuşla WhatsApp'a; "nasılsın" çipleri; "Planı değiştir" eski akışa gider
0b. `oyun.html` + `oyun.js` – **Şefin Planı**: çiçekli blok bulmaca (8×8, sürükle ya da seç-dokun; satır/sütun dolunca temizlenir). Mesajlar "Şef" diye hitap eder.
0e. `kase.html` + `kase.js` – **Peki Madem (:** (meyve kasesi, "karpuz oyunu" mantığı): meyveyi kaseye bırak, aynı iki meyve değince bir büyüğüne dönüşür (yaban mersini › kiraz › çilek › beyaz üzüm › nektarin › nar › karpuz › **gizli:** yaban mersinli muffin › atom tost › kalp; gizliler keşfedilene kadar zincirde altın "?" olarak görünür, iki kalp birleşince +300). Kalp sadece çizimde hafifçe atar ve ara sıra göz kırpar (`kalp:true`, `#face-wink`); fizik dairesi değişmez. **Sürpriz hediye:** kalp keşfedildiyse (`pm_kalp1`) kase taşınca (oyun sonu) `#hediye` kartı çıkar: "Çok sıkı bağladım… Açmak ister misin?"; Hayır `app.js`'teki kaçan buton mekanizmasıyla (`window.__makeDodger`) kaçar, Evet kutuyu yavaşça açar ve "Tatlısın ❤️" gösterir; bir kez açılınca `pm_hediye1` ile bir daha çıkmaz. Oyun sırasında asla görünmez. **Fizik notu:** meyve–meyve sürtünmesi `MU=0.10` (yuvarlanma yerine kayma modeli olduğundan 0.18 kama kilidi yapıyordu); sönümlemeler dt ölçekli; dinlenen meyve darbe hesabında sonsuz kütle; dinlenme kuralı: ≥2 temas/destekli + 0.5 sn'de <2 px ya da hep <8 px/s; komşu uyandırma eşiği 30 px/s; endişe yüzü `WARN` bandında (çizgiye ~50–62 px kala) 300 ms solarak belirir. Kendi hafif fiziği var, tuvalde çizilir; meyveler `kase.html` içindeki SVG sembollerinden rasterlenir. Meyve eklemek/değiştirmek için `kase.html`'e `f-<id>` sembolü, `kase.js`'teki `FRUITS` dizisine `{ id, ad, r, c, pts, msg }` eklemek yeter (sıra = büyüklük). En iyi puan `pm_best`; keşifler `pm_muffin2`, `pm_tost2`, `pm_kalp1`. **Yapım aşaması anahtarı:** `kase.html` başındaki `window.PEKI_MADEM_YAPIM = true;` satırı açıkken oyun yerine "Meyveler olgunlaşıyor" ekranı görünür; oyunu açmak için `true` → `false`.
0f. `kelime.html` + `kelime.js` – **Kelime Bahçesi**: harf çarkı + çapraz bulmaca (Kelime Gezmece / Wordscapes tarzı). 30 bölüm `kelime.js › LEVELS` içinde gömülü: `t` tema kelime, `l` harfler, `w` hedef kelimeler ve ızgara konumları (`x,y,d`), `b` bonus havuzu (Vikisözlük listesinden harf kümesine göre süzülmüş). Sürükleyerek ya da dokunup kelimeye basarak gönderme; bonus kelimeler (`3 bonus = 1 ipucu`), ipucu bir harf açar. Kayıt: `kb_lvl`, `kb_state`, `kb_bonus`, `kb_hint`, `kb_intro`, `kb_done`. Bölüm bitişi: hedeflerin hepsi bulunduysa **veya** bütün hücreler açıldıysa (kesişme/ipucu); açılışta ve 1,5 sn'lik emniyet sayacıyla da kontrol edilir. İpucu ve "Bölümü atla" (✉️ kartında) sihirli sözü ister: `peki madem`. Gizli cümle (2–30. bölümler, karışık sırada): "Çabuk iyileş! ❤️ / Suflen seni / bekliyor." Yeni bölüm eklemek için üretici betik mantığı: hedef kelimeleri seç, ızgarayı çapraz yerleştir, bonusları süz (sohbette `gen.py`).
0g. `yakinda.html` – **Yakında**: ana sayfadaki "Yakında 🌱" butonunun açtığı tanıtım sayfası (filiz animasyonu). Yeni oyun hazır olunca bu sayfa oyunla değiştirilir ya da buton yeni sayfaya yönlendirilir.
0d. `oda.html` + `oda.js` – **Şefin Odası**: çizim tabanlı oda döşeme oyunu (iç mimari). Tepsiden parça ekle (koltuk, halı, pencere, "Resmin aslı" tablosu, lavanta/şakayık/lilyum, kedi, americano, muffin, atom tost…), sürükle, renk/çevir/büyüt, duvar ve zemin seç; "Şef onayı" esprili puan verir (doğru cevap yok). Oda telefonda saklanır (`sef_oda`). "📷" PNG üretir ve iOS paylaşım menüsünü açar (desteklenmiyorsa büyük görsel + basılı tut). Parçalar `oda.js` içindeki `TYPES` nesnesinde SVG olarak tanımlı; yeni parça eklemek için oraya bir giriş ve `ORDER` dizisine adını eklemek yeter.
0c. `fatih.html` + `fatih.js` – **Fatih Turu**: 12 duraklık çoktan seçmeli soru turu (Tarihi Yarımada'nın mimari/tarihi yerleri). Soru bankası `fatih.js` içindeki `BANK` dizisi; her turda 3 seviyeden (ısınma / orta / mimar seviyesi) 4'er soru rastgele seçilir, şıklar karıştırılır. `a[0]` her zaman doğru cevaptır, `n` cevaptan sonra gösterilen bilgi notudur. Soru eklemek için diziye `{ lv, q, a, n }` eklemek yeter. **Fotoğraflar:** `foto/` klasörüne `foto/README.txt`'deki adlarla atılan görseller otomatik kullanılır: metin soruları fotoğrafla gösterilir, `foto: true` olan "Burası neresi?" durakları ise ancak fotoğrafı varsa tura girer (her seviyeden en fazla `FOTO_PER_LEVEL` = 2 tane). İki oyun da telefon ekranına kaydırmasız sığacak şekilde kendini ölçer.
1. `ilk.html` – İlk açılış (Resmin hazır; artık bağlantısız, istersen geri alırsın)
2. `davet.html` – "Bu resim elden teslim edilir… Benimle buluşur musun?" (Hayır butonu kaçar, tıklanamaz)
3. `tercih.html` – Ne yapalım? (Kahve, Yemek, Sinema, Tiyatro, Gezelim, Sürpriz)
4. `secim.html` – Seçilen plana göre çeşit (kahvede kahve + tatlı)
5. `gun.html` – Gün seçimi (önümüzdeki 14 gün + takvimden "Başka bir gün")
6. `saat.html` – Saat seçimi (hazır saatler + "Başka bir saat")
7. `not.html` – Hazır kısa notlar + isteğe bağlı yazı
8. `bilet.html` – Resim açılır ama üstü **çiçek filigranlı** (lavanta, şakayık, lilyum); randevu bileti → "WhatsApp'tan gönder" (numaranla hazır sohbet) ya da "Instagram için kopyala" → DM'e yapıştırır. Bilet sana gelince ona kodu verirsin, kodu girince çiçekler çekilir.

Ortak dosyalar: `style.css` (tasarım), `app.js` (çiçekler, animasyonlar, seçenekler), `resim.jpg` (resim), `onizleme.jpg` (Instagram link önizleme görseli).

## GitHub Pages'te yayınlama
1. GitHub'da yeni repo aç (adı `busranur`), **Public** olsun
2. Bu klasördeki tüm dosyaları repoya yükle (Add file → Upload files)
3. Settings → Pages → Branch: `main` / `(root)` → Save
4. Link: `https://yecassistant.github.io/busranur/`

## Değiştirmek istersen
- **Resim:** `resim.jpg`'yi aynı isimle kendi çizimin ile değiştir (dikey, 3:4 ideal)
- **Seçenekler (kahve, tatlı, yemek, sinema, tiyatro, gezme):** `app.js` → `/* 4 · Menü */` bölümü
- **Saatler:** `app.js` → `/* 6 · Saat */`
- **Hayır butonunun yazıları:** `app.js` → `texts` listesi
- **Link önizleme görseli:** sayfaların `<head>` kısmındaki `og:image` adresi `https://yecassistant.github.io/busranur/onizleme.jpg`. Repo adı farklıysa bu adresi düzelt.
- **Çiçek filigranı kodu:** `app.js` → `var CODE = "5318864491"` satırı (telefon numarası). Büyük/küçük harf, boşluk ve tire fark etmez. Kod hatırlanmaz: sayfa her açıldığında çiçekler yerindedir ve kod yeniden istenir.
- **Açık biletteki plan:** `app.js` → `/* 0 · Açık bilet */` içinde `PLAN = { tur: "kahve", menu: "Americano + …" }` (gönderdiği bileti yazarsan kartta görünür)
- **WhatsApp numarası:** `app.js` → `var PHONE = "905318864491"` (başında 90, + yok)
- **Instagram düğmesi:** `app.js` → `var IG = ""` satırına Instagram kullanıcı adını yazarsan bilette "Instagram'da bana yaz" düğmesi görünür (DM'i açar).
- **Buluşma günleri:** `app.js` → `/* 5 · Gün */` içindeki `START` tarihi (şu an 16 Ekim 2026 Cuma).
