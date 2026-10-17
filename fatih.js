/* Fatih Turu — Tarihi Yarımada'nın mimari ve tarihi durakları üzerine 12 duraklık soru turu.
   Her tur: 3 seviyeden 4'er soru (ısınma → orta → mimar seviyesi), şıklar her seferinde karışık. */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* Soru bankası: a[0] her zaman doğru cevap (gösterilirken karıştırılır). lv: 1 ısınma, 2 orta, 3 mimar seviyesi. */
  var BANK = [
    /* ---- 1 · ısınma ---- */
    { lv: 1, img: "ayasofya.jpg", q: "Ayasofya hangi Bizans imparatorunun emriyle yapıldı?", a: ["I. Justinianus", "Büyük Konstantin", "II. Theodosius", "Herakleios"],
      n: "Ayasofya 537'de açıldı. Justinianus'un içeri girince \"Süleyman, seni geçtim!\" dediği anlatılır." },
    { lv: 1, img: "sultanahmet.jpg", q: "Turistler Sultanahmet Camii'ne neden \"Mavi Cami\" der?", a: ["İçindeki mavi İznik çinileri", "Kubbesinin mavi boyalı olması", "Marmara'ya bakması", "Halılarının mavi olması"],
      n: "İçeride 20 binden fazla İznik çinisi var. Mimarı Sedefkâr Mehmed Ağa; 1609–1616 arasında yapıldı." },
    { lv: 1, img: "suleymaniye.jpg", q: "Mimar Sinan, Süleymaniye Camii için hangi ifadeyi kullandı?", a: ["Kalfalık eserim", "Çıraklık eserim", "Ustalık eserim", "Son eserim"],
      n: "Sinan'ın üçlemesi: çıraklık Şehzade (Fatih'te), kalfalık Süleymaniye, ustalık Edirne'deki Selimiye." },
    { lv: 1, img: "yerebatan.jpg", q: "Yerebatan Sarnıcı'nda kaç sütun var?", a: ["336", "1001", "100", "52"],
      n: "12 sıra, 28'er sütun: 336. İkisinin altında biri ters, biri yan duran Medusa başları var." },
    { lv: 1, img: "kapalicarsi.jpg", q: "Kapalıçarşı'nın yapımını hangi padişah başlattı?", a: ["Fatih Sultan Mehmet", "Kanuni Sultan Süleyman", "Yavuz Sultan Selim", "II. Abdülhamid"],
      n: "1461'de Cevahir Bedesteni'yle başladı. Bugün 60'tan fazla sokağı ve binlerce dükkânı var." },
    { lv: 1, img: "topkapi.jpg", q: "Padişahlar Topkapı Sarayı'ndan sonra hangi saraya taşındı?", a: ["Dolmabahçe", "Yıldız", "Beylerbeyi", "Çırağan"],
      n: "Topkapı, 1856'da Dolmabahçe'ye taşınana kadar yaklaşık 400 yıl boyunca yönetim merkeziydi." },
    { lv: 1, q: "Hangisi Fatih ilçesi sınırlarında DEĞİL?", a: ["Galata Kulesi", "Süleymaniye Camii", "Kapalıçarşı", "Yerebatan Sarnıcı"],
      n: "Galata, Haliç'in karşı yakasında, Beyoğlu'nda. Fatih = surların içi, yani Tarihi Yarımada." },
    { lv: 1, img: "hipodrom.jpg", q: "Sultanahmet'teki Hipodrom, Bizans'ta ne için kullanılıyordu?", a: ["At arabası yarışları", "Gladyatör dövüşleri", "Pazar yeri", "Askeri tören"],
      n: "Yarış pistinin ortasında Dikilitaş, Yılanlı Sütun ve Örme Sütun hâlâ ayakta." },

    /* ---- 2 · orta ---- */
    { lv: 2, img: "bozdogan.jpg", q: "Atatürk Bulvarı'nın üstünden geçen Bozdoğan Kemeri ne işe yarıyordu?", a: ["Şehre su taşıyordu", "Surların parçasıydı", "Tören yoluydu", "Haliç'e köprüydü"],
      n: "Bozdoğan Kemeri 4. yüzyılda İmparator Valens döneminde bitti; ayakta kalan kısmı yaklaşık 1 km." },
    { lv: 2, img: "hipodrom.jpg", q: "Sultanahmet Meydanı'ndaki Dikilitaş aslen nereden getirildi?", a: ["Mısır'dan", "Roma'dan", "Yunanistan'dan", "İran'dan"],
      n: "Firavun III. Tutmosis'in dikilitaşı; 390'da I. Theodosius Hipodrom'a diktirdi. Yaklaşık 3.500 yaşında." },
    { lv: 2, img: "kariye.jpg", q: "Kariye (Chora) en çok neyiyle ünlü?", a: ["Mozaik ve freskleriyle", "Minaresinin yüksekliğiyle", "Sarnıcıyla", "Çinileriyle"],
      n: "Kariye'nin 14. yüzyıl mozaik ve freskleri geç Bizans sanatının zirvesi sayılır." },
    { lv: 2, img: "misircarsisi.jpg", q: "Mısır Çarşısı hangi caminin külliyesinin parçası olarak yapıldı?", a: ["Yeni Cami", "Süleymaniye", "Fatih Camii", "Beyazıt Camii"],
      n: "Mısır Çarşısı 1660'larda bitti; dükkân gelirleri Yeni Cami'ye akardı. Adı Mısır'dan gelen mallardan." },
    { lv: 2, img: "sirkeci.jpg", q: "Sirkeci Garı hangi ünlü trenin son durağıydı?", a: ["Orient Express", "Trans-Sibirya", "Hicaz Demiryolu", "Bağdat Ekspresi"],
      n: "Sirkeci Garı 1890'da açıldı; mimarı August Jasmund. Paris'ten kalkan Orient Express burada bitiyordu." },
    { lv: 2, img: "zeyrek.jpg", q: "Zeyrek Camii Bizans döneminde neydi?", a: ["Pantokrator Manastırı'nın kilisesi", "Bir saray", "Bir sarnıç", "Bir hamam"],
      n: "12. yüzyıl Komnenos dönemi. Ayasofya'dan sonra ayakta kalan en büyük Bizans dini yapısı." },
    { lv: 2, img: "cemberlitas.jpg", q: "Çemberlitaş adını nereden alıyor?", a: ["Sütunu saran demir çemberlerden", "Yuvarlak meydanından", "Mimarının adından", "Çember şeklindeki havuzdan"],
      n: "330'da Konstantin diktirdi; yangın ve depremlerden sonra demir çemberlerle sarıldı. Şehrin en eski anıtlarından." },
    { lv: 2, img: "fatihcamii.jpg", q: "Fatih Camii'nin ilk mimarı kimdi?", a: ["Atik Sinan", "Mimar Sinan", "Sedefkâr Mehmed Ağa", "Davud Ağa"],
      n: "Fatih Camii 1470'te bitti; 1766 depreminde yıkılınca III. Mustafa döneminde yeniden yapıldı." },
    { lv: 2, img: "fener.jpg", q: "Fener'deki Rum Ortodoks Patrikhanesi'nin kilisesi hangisi?", a: ["Aya Yorgi", "Aya İrini", "Aya Triada", "Aya Nikola"],
      n: "Patrikhane 1601'den beri Fener'de. Balat'ın rengârenk evleriyle birlikte yürüyüş için en güzel rota." },

    /* ---- 3 · mimar seviyesi ---- */
    { lv: 3, img: "ayasofya.jpg", q: "Ayasofya'da yuvarlak kubbeyi kare plana bağlayan geçiş elemanı?", a: ["Pandantif", "Tromp", "Kasnak", "Tonoz"],
      n: "Pandantif: küresel üçgenler. Ayasofya'nın kubbesi yaklaşık 31 m çapında ve 1.500 yıldır ayakta." },
    { lv: 3, img: "kucukayasofya.jpg", q: "Küçük Ayasofya Camii'nin özelliği ne?", a: ["Ayasofya'dan önce yapıldı", "Mimar Sinan eseri", "19. yüzyıl yapısı", "Eski bir sarnıç"],
      n: "Sergios ve Bakhos Kilisesi, 527–536. Ayasofya'nın bir tür provası sayılır." },
    { lv: 3, img: "rustempasa.jpg", q: "Rüstem Paşa Camii'ni diğer Sinan camilerinden ayıran ne?", a: ["Dükkânların üstünde yükselmesi ve çinileri", "Altı minaresi", "Ahşap olması", "Kubbesiz olması"],
      n: "Tahtakale'de, 1563. Dükkân kiraları camiyi geçindirirdi; en zengin İznik çinili camilerden biri." },
    { lv: 3, img: "nuruosmaniye.jpg", q: "Nuruosmaniye Camii mimarlık tarihinde neyle anılır?", a: ["İlk Osmanlı Barok camisi", "Sinan'ın son eseri", "En büyük Osmanlı camisi", "İlk çinili cami"],
      n: "1755'te bitti. Oval avlusu ve kıvrımlı hatlarıyla klasik düzenden ilk ciddi kopuş." },
    { lv: 3, img: "buyukpostane.jpg", q: "Sirkeci'deki Büyük Postane'nin mimarı kim?", a: ["Vedat Tek", "Mimar Kemaleddin", "Alexandre Vallaury", "Raimondo D'Aronco"],
      n: "Büyük Postane 1909'da açıldı; Birinci Ulusal Mimarlık akımının en bilinen örneklerinden." },
    { lv: 3, img: "tekfur.jpg", q: "Tekfur Sarayı hangi dönemden kalma?", a: ["Geç Bizans", "Erken Osmanlı", "Roma", "Cumhuriyet"],
      n: "Edirnekapı'da, surlara bitişik. Ayakta kalan nadir Bizans saraylarından; 18. yüzyılda çini atölyesi de oldu." },
    { lv: 3, img: "yedikule.jpg", q: "Yedikule Hisarı'nı kim yaptırdı?", a: ["Fatih Sultan Mehmet", "II. Theodosius", "Kanuni Sultan Süleyman", "Konstantin"],
      n: "1458. Bizans'ın tören kapısı Altın Kapı'yı da içine alır; adını yedi kulesinden alır." },
    { lv: 3, img: "sehzade.jpg", q: "Şehzade Camii hangi şehzade için yapıldı?", a: ["Şehzade Mehmed", "Şehzade Mustafa", "Şehzade Bayezid", "Şehzade Cem"],
      n: "Kanuni'nin 22 yaşında ölen oğlu için, 1548. Sinan'ın \"çıraklık eserim\" dediği cami." },
    { lv: 3, img: "hurremhamami.jpg", q: "Haseki Hürrem Sultan Hamamı'nın planını özel kılan ne?", a: ["Kadın ve erkek bölümleri aynı eksende art arda", "Kubbesiz olması", "İki katlı olması", "Deniz suyuyla çalışması"],
      n: "Mimar Sinan, 1556. Ayasofya ile Sultanahmet'in tam ortasında; 75 metrelik tek eksende iki hamam." },
    { lv: 3, img: "arkeoloji.jpg", q: "İstanbul Arkeoloji Müzeleri'nin ana binasını kim tasarladı?", a: ["Alexandre Vallaury", "Vedat Tek", "Mimar Kemaleddin", "August Jasmund"],
      n: "1891'de açıldı; Osman Hamdi Bey kurdu. İskender Lahdi burada." },
    { lv: 3, img: "ayasofya.jpg", q: "Ayasofya'ya payanda ekleyip iki minaresini yapan Osmanlı mimarı kim?", a: ["Mimar Sinan", "Atik Sinan", "Davud Ağa", "Mehmed Tahir Ağa"],
      n: "16. yüzyılda Sinan'ın güçlendirmeleri, yapının bugüne ulaşmasında pay sahibi sayılır." },
    /* ---- fotoğraf durakları: fotoğraf sorunun kendisi (foto/ klasöründe dosya yoksa tura girmez) ---- */
    { lv: 1, foto: true, pin: true, img: "ivybalat.jpg", q: "Balat'taki bu dükkân kimin? 📷", a: ["Yunus'un abisinin", "Ünlü bir tasarımcının", "Belediyenin", "Bir dizi setinin"],
      n: "Hatırlıyorsunnn :) Ivy Butik, Balat. Abimin dükkânı." },
    { lv: 1, foto: true, img: "ayasofya.jpg", q: "Burası neresi? 📷", a: ["Ayasofya", "Sultanahmet Camii", "Süleymaniye Camii", "Fatih Camii"],
      n: "Ayasofya, 537. Dört minaresi üç ayrı dönemde eklendi; batıdaki ikisi Mimar Sinan'ın." },
    { lv: 1, foto: true, img: "sultanahmet.jpg", q: "Burası neresi? 📷", a: ["Sultanahmet Camii", "Süleymaniye Camii", "Yeni Cami", "Fatih Camii"],
      n: "Altı minare, 1616. Sedefkâr Mehmed Ağa'nın eseri; Ayasofya'nın tam karşısında." },
    { lv: 1, foto: true, img: "kapalicarsi.jpg", q: "Bu çarşı hangisi? 📷", a: ["Kapalıçarşı", "Mısır Çarşısı", "Arasta Çarşısı", "Sahaflar Çarşısı"],
      n: "Kapalıçarşı: 1461'den beri. Boyalı tonozlu sokakları, binlerce dükkânı; kaybolmak serbest." },
    { lv: 1, foto: true, img: "balat.jpg", q: "Bu rengârenk sokak hangi mahallede? 📷", a: ["Balat", "Kuzguncuk", "Cihangir", "Arnavutköy"],
      n: "Balat, Haliç kıyısında; cumbalı rengârenk evleri ve dik sokaklarıyla Fatih'in en çok fotoğraflanan mahallesi." },
    { lv: 1, foto: true, img: "yerebatan.jpg", q: "Burası neresi? 📷", a: ["Yerebatan Sarnıcı", "Binbirdirek Sarnıcı", "Kariye", "Tekfur Sarayı"],
      n: "Yerebatan: 6. yüzyıl, 336 sütun, iki Medusa başı. Yazın şehrin en serin yeri." },
    { lv: 1, foto: true, img: "gulhane.jpg", q: "Bu park hangisi? 📷", a: ["Gülhane Parkı", "Emirgan Korusu", "Yıldız Parkı", "Fethi Paşa Korusu"],
      n: "Gülhane, Topkapı'nın dış bahçesiydi; 1912'de halka açıldı. Lale zamanı ayrı güzel." },
    { lv: 2, foto: true, img: "suleymaniye.jpg", q: "Bu cami hangisi? 📷", a: ["Süleymaniye Camii", "Sultanahmet Camii", "Yeni Cami", "Fatih Camii"],
      n: "Süleymaniye, Haliç'e hâkim tepede; 1557. Sinan'ın kendi türbesi de külliyenin köşesinde." },
    { lv: 2, foto: true, img: "bozdogan.jpg", q: "Burası neresi? 📷", a: ["Bozdoğan Kemeri", "Yedikule Hisarı", "Theodosius Surları", "Mağlova Kemeri"],
      n: "Bozdoğan (Valens) Kemeri, 368. Atatürk Bulvarı'nın üstünden geçen su kemeri; 1.600 yıldır ayakta." },
    { lv: 2, foto: true, img: "misircarsisi.jpg", q: "Bu çarşı hangisi? 📷", a: ["Mısır Çarşısı", "Kapalıçarşı", "Arasta Çarşısı", "Sahaflar Çarşısı"],
      n: "Mısır Çarşısı: L planlı, 1660'lar. Baharat kokusu Eminönü'ne kadar gelir." },
    { lv: 2, foto: true, img: "sirkeci.jpg", q: "Bu bina hangisi? 📷", a: ["Sirkeci Garı", "Haydarpaşa Garı", "Büyük Postane", "Sepetçiler Kasrı"],
      n: "Sirkeci Garı, 1890; mimarı August Jasmund. Oryantalist cephesiyle Orient Express'in son durağı." },
    { lv: 2, foto: true, img: "kariye.jpg", q: "Bu mozaikler nerede? 📷", a: ["Kariye", "Ayasofya", "Fethiye Camii", "Zeyrek Camii"],
      n: "Kariye'nin 14. yüzyıl mozaik ve freskleri; Edirnekapı'da, geç Bizans sanatının zirvesi." },
    { lv: 2, foto: true, img: "yedikule.jpg", q: "Burası neresi? 📷", a: ["Yedikule Hisarı", "Rumeli Hisarı", "Anadolu Hisarı", "Tekfur Sarayı"],
      n: "Yedikule, 1458. Bizans'ın Altın Kapı'sını da içine alan yedi kuleli hisar." },
    { lv: 2, foto: true, img: "almancesmesi.jpg", q: "Bu çeşme hangisi? 📷", a: ["Alman Çeşmesi", "III. Ahmet Çeşmesi", "Tophane Çeşmesi", "Bezmiâlem Valide Çeşmesi"],
      n: "Kayzer II. Wilhelm'in hediyesi, 1901. Parçaları Almanya'da yapılıp Hipodrom'da birleştirildi." },
    { lv: 2, foto: true, img: "fenerrumlisesi.jpg", q: "Bu kırmızı bina hangisi? 📷", a: ["Fener Rum Lisesi", "Galatasaray Lisesi", "İstanbul Erkek Lisesi", "Fener Rum Patrikhanesi"],
      n: "\"Kırmızı Mektep\", 1883; mimarı Konstantinos Dimadis. Fener'in siluetine hâkim." },
    { lv: 3, foto: true, img: "rustempasa.jpg", q: "Bu çiniler hangi camiden? 📷", a: ["Rüstem Paşa Camii", "Sultanahmet Camii", "Sokollu Mehmed Paşa Camii", "Yeni Cami"],
      n: "Rüstem Paşa, 1563, Mimar Sinan. Duvarları baştan aşağı İznik çinisi; dükkânların üstünde yükselir." },
    { lv: 3, foto: true, img: "zeyrek.jpg", q: "Bu yapı hangisi? 📷", a: ["Zeyrek Camii", "Kariye", "Fethiye Camii", "Küçük Ayasofya Camii"],
      n: "Zeyrek (Pantokrator), 12. yüzyıl. Üç kilisenin birleştiği, Haliç'e bakan tuğla kütle." },
    { lv: 3, foto: true, img: "tekfur.jpg", q: "Burası neresi? 📷", a: ["Tekfur Sarayı", "Bukoleon Sarayı", "Yedikule Hisarı", "Anemas Zindanları"],
      n: "Tekfur Sarayı, geç Bizans; Edirnekapı'da surlara bitişik. Tuğla-taş işçiliğiyle cephesi hâlâ ayakta." },
    { lv: 3, foto: true, img: "buyukpostane.jpg", q: "Bu bina hangisi? 📷", a: ["Büyük Postane", "Sirkeci Garı", "IV. Vakıf Han", "Arkeoloji Müzesi"],
      n: "Büyük Postane, 1909, Vedat Tek. Birinci Ulusal Mimarlık'ın Sirkeci'deki yüzü." },
    { lv: 3, foto: true, img: "cinilikosk.jpg", q: "Bu köşk hangisi? 📷", a: ["Çinili Köşk", "Topkapı Harem", "Tekfur Sarayı", "Sepetçiler Kasrı"],
      n: "Çinili Köşk, 1472, Fatih dönemi. İstanbul'un en eski Osmanlı sivil yapılarından; bugün Çini Müzesi." },
    { lv: 3, foto: true, img: "ahmetcesmesi.jpg", q: "Bu çeşme hangisi? 📷", a: ["III. Ahmet Çeşmesi", "Alman Çeşmesi", "Tophane Çeşmesi", "Mihrişah Sultan Çeşmesi"],
      n: "III. Ahmet Çeşmesi, 1728, Lale Devri. Topkapı'nın kapısı önünde; meydan çeşmelerinin en süslüsü." },
    { lv: 3, foto: true, img: "kadirhas.jpg", q: "Eski tütün fabrikası olan bu bina bugün ne? 📷", a: ["Kadir Has Üniversitesi", "Feshane", "Haliç Tersanesi", "Rahmi Koç Müzesi"],
      n: "Cibali Tütün Fabrikası (1884), 2002'de üniversite oldu; dönüşümü Europa Nostra ödülü aldı." },
    { lv: 3, foto: true, img: "hurremhamami.jpg", q: "Bu hamam hangisi? 📷", a: ["Haseki Hürrem Sultan Hamamı", "Çemberlitaş Hamamı", "Cağaloğlu Hamamı", "Kılıç Ali Paşa Hamamı"],
      n: "Hürrem Sultan Hamamı, 1556, Mimar Sinan. Ayasofya ile Sultanahmet'in arasında, tek eksende çift hamam." },
    { lv: 3, foto: true, img: "universitekapisi.jpg", q: "Bu kapı hangisi? 📷", a: ["İstanbul Üniversitesi (Beyazıt) kapısı", "Topkapı Bâb-ı Hümâyun", "Dolmabahçe Sarayı kapısı", "Yıldız Sarayı kapısı"],
      n: "1866'da Seraskerlik (Harbiye) kapısı olarak yapıldı; bugün Beyazıt Meydanı'nın simgesi." }
  ];
  var PER_LEVEL = 4, FOTO_PER_LEVEL = 2, LEVELS = { 1: "ısınma turu", 2: "orta durak", 3: "mimar seviyesi" };
  var FOTO_DIR = "foto/";
  var RIGHT = ["Doğru!", "Kesinlikle.", "Mimar gibi.", "Tam isabet.", "Rehber sensin."];
  var WRONG = ["Olmadı.", "Yakındı.", "Mimar tahmini ama değil 😅", "Bu durağı yerinde görürüz."];

  var main = document.querySelector("main"), route = $("route"), card = $("qcard"), opts = $("qopts"), foot = $("qfoot"), over = $("over");
  var tour = [], at = 0, ok = 0, answered = false, best = 0;
  try { best = +localStorage.getItem("fatih_best") || 0; } catch (e) {}
  var LETTERS = ["A", "B", "C", "D"];

  /* fotoğraflar: hangileri gerçekten var? (foto/ klasörüne atılanlar). Olmayan fotoğraf = o fotoğraf durağı tura girmez,
     metin sorusu ise fotoğrafsız gösterilir. */
  /* Görseller: sadece turdaki 12 görsel yüklenir (hepsi değil). Yüklenemeyen fotoğraf durağı başka bir durakla değiştirilir,
     metin sorusu ise fotoğrafsız gösterilir. IMG_OK: 1 var, 0 yok, undefined henüz bilinmiyor. */
  var IMG_OK = {};
  function makeTour() {
    var t = [];
    [1, 2, 3].forEach(function (lv) {
      var pool = BANK.filter(function (b) { return b.lv === lv && !(b.foto && IMG_OK[b.img] === 0); });
      var fotos = pool.filter(function (b) { return b.foto; });
      fotos = fotos.filter(function (b) { return b.pin; }).concat(shuffle(fotos.filter(function (b) { return !b.pin; }))).slice(0, FOTO_PER_LEVEL);
      var texts = shuffle(pool.filter(function (b) { return !b.foto; })).slice(0, PER_LEVEL - fotos.length);
      t = t.concat(shuffle(fotos.concat(texts)));
    });
    /* sabit duraklar (pin) ilk soru olmasın: 5., 6. ya da 7. durağa (şansa) taşı */
    var pinnedQ = t.filter(function (q) { return q.pin; });
    if (pinnedQ.length) {
      t = t.filter(function (q) { return !q.pin; });
      pinnedQ.forEach(function (q, i) { t.splice(Math.min(4 + i + Math.floor(Math.random() * 3), t.length), 0, q); });
    }
    return t;
  }
  function verify(t, cb, depth) {
    depth = depth || 0;
    var pending = 0, broken = false, finished = false;
    function finish() {
      if (finished) return; finished = true;
      if (broken && depth < 3) verify(makeTour(), cb, depth + 1); else cb(t);
    }
    t.forEach(function (q) {
      if (!q.img || IMG_OK[q.img] !== undefined) return;
      pending++;
      var im = new Image();
      im.onload = function () { IMG_OK[q.img] = 1; if (--pending <= 0) finish(); };
      im.onerror = function () { IMG_OK[q.img] = 0; if (q.foto) broken = true; if (--pending <= 0) finish(); };
      im.src = FOTO_DIR + q.img;
    });
    if (!pending) finish(); else setTimeout(finish, 6000); /* yavaş bağlantı: bekletme, kalanlar sayfada yüklenir */
  }
  function imgHtml(q, peek) {
    if (!q.img || IMG_OK[q.img] === 0) return "";
    var src = FOTO_DIR + q.img;
    return '<div class="qimg' + (peek ? " peek" : "") + '"><img class="bg" src="' + src + '" alt="" aria-hidden="true"><img class="ph" src="' + src + '" alt=""></div>';
  }
  function burst(n) { if (window.__burst) try { window.__burst(n); } catch (e) {} }

  /* ---------- tek ekrana sığdır ---------- */
  function fit() {
    main.classList.remove("fit1", "fit2", "fit3", "fit4");
    for (var i = 1; i <= 4; i++) {
      if (document.documentElement.scrollHeight <= innerHeight + 1) break;
      main.classList.add("fit" + i);
    }
  }

  /* ---------- rota (12 nokta) ---------- */
  function drawRoute() {
    route.innerHTML = "";
    for (var i = 0; i < tour.length; i++) {
      var d = document.createElement("i");
      if (tour[i].r === true) d.className = "ok"; else if (tour[i].r === false) d.className = "no"; else if (i === at) d.className = "now";
      route.appendChild(d);
    }
  }
  function header() {
    $("qNo").textContent = Math.min(at + 1, tour.length) + "/" + tour.length; $("qOk").textContent = ok;
  }

  /* ---------- ekranlar ---------- */
  function showStart() {
    at = 0; ok = 0; answered = false; tour = [];
    over.hidden = true; route.innerHTML = ""; $("qNo").textContent = "1/12"; $("qOk").textContent = 0;
    card.innerHTML = '<div class="qlevel start">12 durak · Tarihi Yarımada</div>' +
      '<h2 class="qtitle">Fatih <em>Turu</em></h2>' +
      '<p class="qintro">Her durakta bir soru. Önce ısınma, sonra orta, en sonda mimar seviyesi. Rehber: Yunus (rehber değil) 😅</p>';
    opts.innerHTML = ""; opts.hidden = true;
    foot.innerHTML = '<button type="button" class="btn pink" id="startBtn">Tura başla 🚶</button>';
    $("startBtn").onclick = function () {
      this.disabled = true; this.textContent = "Rota çiziliyor…";
      verify(makeTour(), function (t) { tour = t; at = 0; showQuestion(); });
    };
    fit();
  }
  function showQuestion() {
    var q = tour[at]; answered = false;
    drawRoute(); header();
    card.innerHTML = imgHtml(q, !!q.foto) + '<div class="qlevel lv' + q.lv + '">' + (q.foto ? "fotoğraf durağı" : LEVELS[q.lv]) + ' · durak ' + (at + 1) + '</div><h2 class="qtext">' + q.q + '</h2>';
    hookImg();
    opts.hidden = false; opts.innerHTML = "";
    var order = shuffle(q.a);
    order.forEach(function (text, i) {
      var b = document.createElement("button"); b.type = "button"; b.className = "qopt";
      b.innerHTML = '<i>' + LETTERS[i] + '</i><span></span>'; b.lastChild.textContent = text; b.dataset.t = text;
      b.onclick = function () { answer(b, text === q.a[0]); };
      opts.appendChild(b);
    });
    foot.innerHTML = '<p class="qhint">Şıklardan birini seç 👇</p>';
    fit();
  }
  function answer(btn, right) {
    if (answered) return; answered = true;
    var q = tour[at]; q.r = right; if (right) ok++;
    var list = opts.children;
    for (var i = 0; i < list.length; i++) {
      list[i].disabled = true;
      if (list[i].dataset.t === q.a[0]) list[i].classList.add("right"); else if (list[i] === btn) list[i].classList.add("wrong"); else list[i].classList.add("dim");
    }
    card.innerHTML = imgHtml(q, false) + '<div class="qlevel ' + (right ? "good" : "bad") + '">' + (right ? "✓ " + pick(RIGHT) : "✗ " + pick(WRONG)) + '</div><p class="qnote">' + q.n + '</p>';
    hookImg();
    foot.innerHTML = '<button type="button" class="btn lav" id="nextBtn">' + (at + 1 < tour.length ? "Sonraki durak →" : "Turu bitir 🏁") + '</button>';
    $("nextBtn").onclick = next;
    drawRoute(); header();
    if (right) burst(12);
    fit();
  }
  function hookImg() {
    var box = card.querySelector(".qimg"), im = box && box.querySelector("img.ph");
    if (!im) return;
    function tallCheck() { if (im.naturalWidth && im.naturalHeight > im.naturalWidth * 0.8) box.classList.add("tall"); }
    if (im.complete && im.naturalWidth) tallCheck(); else im.onload = tallCheck;
    im.onerror = function () { if (box.parentNode) box.parentNode.removeChild(box); fit(); };
  }
  var lastNext = 0;
  function next() {
    var now = Date.now(); if (now - lastNext < 450) return; lastNext = now;
    at++;
    if (at >= tour.length) finish(); else showQuestion();
  }
  function finish() {
    var n = tour.length, t;
    if (ok === n) t = "Tam puan. Turu sen anlatacaksın, ben dinleyeceğim 😅";
    else if (ok >= 10) t = "Mimar seviyesi. Fatih'te rehbere gerek yok, sen varsın 📐";
    else if (ok >= 7) t = "Gayet iyi. Kaçan durakları yerinde telafi ederiz ☕";
    else if (ok >= 4) t = "Isınma turu sayılır. Gerçeği yerinde görünce oturur 🚶";
    else t = "Sorular zormuş, kabul ediyorum. Çözüm belli: yerinde görmek 🌸";
    if (ok > best) { best = ok; try { localStorage.setItem("fatih_best", best); } catch (e) {} }
    $("overScore").textContent = ok; $("overTot").textContent = n; $("overText").textContent = t;
    $("overBest").textContent = "En iyi turun: " + best + "/" + n;
    over.hidden = false; burst(30 + ok * 3);
  }

  $("again2").onclick = showStart;
  addEventListener("resize", fit);
  addEventListener("orientationchange", function () { setTimeout(fit, 250); });
  addEventListener("load", function () { setTimeout(fit, 300); });
  showStart();

  /* test kancası: fatih.html#test */
  if (location.hash === "#test") {
    window.__tur = { tour: function () { return tour; }, at: function () { return at; }, ok: function () { return ok; }, bank: BANK };
  }
})();
