/* Peki Madem (: — Büşranur'a özel meyve kasesi.
   Meyveyi kaseye bırak; aynı iki meyve değince bir büyüğüne dönüşür (yaban mersini → … → karpuz).
   Kendi hafif fiziği var (daire–daire, daire–kase duvarı), tuval (canvas) üzerinde çizilir; meyveler SVG'den bir kez rasterlenir. */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  /* ---------- meyveler (küçükten büyüğe) ---------- */
  var FRUITS = [
    { id: "yabanmersini", ad: "Yaban mersini", vc: [50, 52, 45], r: 15, d: 0.9,  c: "#5b6bb5", pts: 1,  msg: ["Muffin malzemesi hazır 🧁", "Yaban mersini ikilisi"] },
    { id: "kiraz",        ad: "Kiraz",         vc: [50, 54, 44], r: 20, d: 1.0,  c: "#e0484f", pts: 3,  msg: ["Kiraz birleşti 🍒", "Çift kiraz, tek sap"] },
    { id: "cilek",        ad: "Çilek",         vc: [50, 56, 43], r: 26, d: 0.85, c: "#ec4b5f", pts: 6,  msg: ["Sufle yolda 🍓", "Bol çilekli olsun"] },
    { id: "uzum",         ad: "Beyaz üzüm",    vc: [50, 54, 44], r: 33, d: 0.95, c: "#b9d47f", pts: 10, msg: ["Beyaz üzüm, serin serin 🍇", "Beyaz üzüm çıktı"] },
    { id: "nektarin",     ad: "Nektarin",      vc: [50, 55, 44], r: 40, d: 1.1,  c: "#f28c3b", pts: 15, msg: ["Nektarin: yaz kokusu ☀️", "Nektarin geldi"] },
    { id: "nar",          ad: "Nar",           vc: [50, 56, 43], r: 46, d: 1.25, c: "#b8324a", pts: 21, msg: ["Fatih'te nar suyu gibi 🕌", "Nar çıktı!"] },
    { id: "karpuz",       ad: "Karpuz",        vc: [50, 52, 46], r: 52, d: 1.3,  c: "#3f9d5a", pts: 28, msg: ["Karpuz! Peki madem, kase senin 🍉", "Karpuz çıktı; bilet hâlâ geçerli 🎟️"] },
    /* sürpriz son seviye: zincirde altın "?" olarak görünür, iki karpuz birleşince ortaya çıkar */
    { id: "muffin",       ad: "Yaban mersinli muffin", vc: [50, 56, 44], r: 57, d: 0.7,  c: "#f6c64a", pts: 60, gizli: true, key: "pm_muffin2", msg: ["Sürpriz: yaban mersinli muffin 🧁", "Muffin çıktı! Şef, bu kase artık tarihî 🧁"] },
    /* ikinci sürpriz: iki muffin birleşince atom tost (keşfedilene kadar zincirde "?") */
    { id: "tost",         ad: "Atom tost",     vc: [50, 50, 45], r: 62, d: 0.6,  c: "#e9b96e", pts: 90, gizli: true, key: "pm_tost2", msg: ["Sürpriz: atom tost 🍞 Şaka değil", "Atom tost çıktı, kase resmen menü oldu 🍞"] },
    /* üçüncü sürpriz: iki atom tost birleşince kalp (keşfedilene kadar zincirde "?"). kalp:true → çizimde hafif atış + ara sıra göz kırpma (sadece görsel) */
    { id: "kalp",         ad: "Kalp",          vc: [50, 52, 44], r: 67, d: 0.5,  c: "#f0405c", pts: 130, gizli: true, key: "pm_kalp1", kalp: true, msg: ["Kalp çıktı ❤️ Zincirin sonu, en tatlısı", "Kalp! Kase bu kadar tatlı olmamıştı ❤️"] }
  ];
  var seen = {}; FRUITS.forEach(function (f) { if (f.gizli) { try { seen[f.id] = localStorage.getItem(f.key) === "1"; } catch (e) { seen[f.id] = false; } } });
  var DROP_MAX = 4, DROP_W = [32, 28, 22, 13, 5];  /* bırakılabilen seviyeler ve ağırlıkları */
  var BASE_W = 360;                                /* yarıçaplar bu kase genişliğine göre; dar ekranda oranla küçülür */

  var cv = $("bowl"), ctx = cv.getContext("2d"), wrap = $("bowlwrap"), stageEl = document.querySelector("main");
  var msgEl = $("kmsg"), scoreEl = $("score"), bestEl = $("best"), mergesEl = $("merges"), over = $("over"), nextUse = $("nextUse");
  var W = 360, H = 480, DPR = 1, SC = 1;           /* SC: yarıçap ölçeği */
  var TOP = 48, DANGER = 100, RIM = 108, WARN = 56; /* bırakma yüksekliği, tehlike çizgisi, kase ağzı, uyarı bandı (sadece surat; yanma sınırı DANGER değişmez) */
  var walls = [];                                   /* kase iç sınırı: parça doğrular */
  var bodies = [], fx = [], floats = [], score = 0, best = 0, merges = 0, cur = 0, nxt = 0, hx = 180, canDrop = true, dead = false, lastT = 0, running = false;
  var sprites = {};                                 /* sprites[level][face] = canvas */
  try { best = +localStorage.getItem("pm_best") || 0; } catch (e) {}
  bestEl.textContent = best;
  function burst(n) { if (window.__burst) try { window.__burst(n); } catch (e) {} }
  function msg(t) { msgEl.textContent = t; }

  /* ---------- SVG → sprite ---------- */
  var defsXml = new XMLSerializer().serializeToString($("fruitDefs"));
  defsXml = defsXml.replace(/<symbol[\s\S]*?<\/symbol>/g, "");         /* sembolleri çıkar, yalnız yüz/gradyan kalsın */
  function spriteSvg(level, face) {
    var inner = $("f-" + FRUITS[level].id).innerHTML;
    if (face !== "n") inner = inner.replace(/href="#face"/g, 'href="#face-' + (face === "h" ? "happy" : face === "k" ? "wink" : "worry") + '"');
    return '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" width="100" height="100">' + defsXml + "<g>" + inner + "</g></svg>";
  }
  function buildSprites(done) {
    var left = 0;
    FRUITS.forEach(function (f, L) {
      sprites[L] = {};
      (f.kalp ? ["n", "h", "w", "k"] : ["n", "h", "w"]).forEach(function (face) {   /* k: göz kırpma, sadece kalpte */
        left++;
        var im = new Image(), px = Math.ceil(f.r * SC * DPR * 100 / f.vc[2]) + 2;   /* çizimdeki daire (vc) fizik dairesine birebir oturur */
        im.onload = function () {
          var c = document.createElement("canvas"); c.width = px; c.height = px;
          c.getContext("2d").drawImage(im, 0, 0, px, px); sprites[L][face] = c;
          if (--left === 0) done();
        };
        im.onerror = function () { sprites[L][face] = null; if (--left === 0) done(); };
        im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(spriteSvg(L, face));
      });
    });
  }

  /* ---------- ölçü / kase ---------- */
  function measure() {
    var cs = getComputedStyle(stageEl), bs = getComputedStyle(document.body), used = 0;
    used += (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0) + (parseFloat(bs.paddingTop) || 0) + (parseFloat(bs.paddingBottom) || 0);
    var g = parseFloat(cs.rowGap || cs.gap); if (isNaN(g)) g = 8;
    var kids = stageEl.children, n = 0;
    for (var k = 0; k < kids.length; k++) { n++; if (kids[k] !== wrap) used += kids[k].offsetHeight; }
    used += g * (n - 1);
    W = Math.min(stageEl.clientWidth, 440);
    H = Math.max(230, Math.min(560, innerHeight - used));
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    SC = Math.min(1, W / BASE_W) * (H < 300 ? 0.72 : H < 380 ? 0.86 : H > 470 ? 1.08 : 1);
    WARN = Math.round(30 + 30 * SC);              /* uyarı bandı meyve ölçeğiyle büyür (~50–62 px): tepe tehlike çizgisine bu kadar yaklaşınca surat endişelenir */
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    cv.style.width = W + "px"; cv.style.height = H + "px"; wrap.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildWalls(); bgCache = null;
    if (hx > W - 20) hx = W / 2;
  }
  var inset = 10, curveH = 80;
  function buildWalls() {
    walls = [];
    curveH = Math.min(84, H * 0.22);
    var L = inset, R = W - inset, B = H - 8, cy = B - curveH, rx = (R - L) / 2, cx = W / 2;
    var pts = [[L, -200], [L, cy]];
    for (var i = 1; i < 16; i++) { var a = Math.PI + i * Math.PI / 16; pts.push([cx + rx * Math.cos(a), cy - curveH * Math.sin(a)]); }
    pts.push([R, cy], [R, -200]);
    for (var j = 0; j < pts.length - 1; j++) walls.push({ x1: pts[j][0], y1: pts[j][1], x2: pts[j + 1][0], y2: pts[j + 1][1] });
    wallPath = pts;
  }
  var wallPath = [], bgCache = null;
  function drawBg() {
    var c = document.createElement("canvas"); c.width = cv.width; c.height = cv.height;
    var x = c.getContext("2d"); x.setTransform(DPR, 0, 0, DPR, 0, 0);
    /* cam kase */
    x.beginPath(); x.moveTo(inset, RIM);
    for (var i = 1; i < wallPath.length - 1; i++) x.lineTo(wallPath[i][0], wallPath[i][1]);
    x.lineTo(W - inset, RIM); x.closePath();
    var gr = x.createLinearGradient(0, RIM, 0, H); gr.addColorStop(0, "rgba(255,255,255,.55)"); gr.addColorStop(1, "rgba(239,231,251,.92)");
    x.fillStyle = gr; x.fill();
    x.lineWidth = 3.5; x.strokeStyle = "#dccdf2"; x.stroke();
    /* iç parlama */
    x.beginPath(); x.moveTo(inset + 9, RIM + 10); x.lineTo(inset + 9, H - 8 - curveH); x.quadraticCurveTo(inset + 14, H - 24, W / 2 - 30, H - 14);
    x.lineWidth = 5; x.strokeStyle = "rgba(255,255,255,.75)"; x.lineCap = "round"; x.stroke();
    /* camda lavanta dalı (Büşranur'a özel) */
    x.save(); x.globalAlpha = .32; x.translate(W - 44, H - 26); x.rotate(-0.35);
    x.strokeStyle = "#6f9a5a"; x.lineWidth = 2; x.beginPath(); x.moveTo(0, 0); x.lineTo(0, -46); x.stroke();
    x.fillStyle = "#9b7fd1"; for (var k = 0; k < 7; k++) { x.beginPath(); x.ellipse((k % 2 ? 4 : -4), -16 - k * 4.5, 3.2, 2.4, 0, 0, 6.28); x.fill(); }
    x.restore();
    /* tehlike çizgisi */
    x.setLineDash([4, 6]); x.lineWidth = 1.5; x.strokeStyle = "rgba(236,111,154,.45)"; x.beginPath(); x.moveTo(inset + 6, DANGER); x.lineTo(W - inset - 6, DANGER); x.stroke(); x.setLineDash([]);
    return c;
  }

  /* ---------- gövdeler ---------- */
  function rad(L) { return FRUITS[L].r * SC; }
  function addBody(L, x, y, vx, vy) {
    var r = rad(L), b = { L: L, x: x, y: y, vx: vx || 0, vy: vy || 0, w: 0, r: r, mass: FRUITS[L].d * r * r, a: Math.random() * 6.28, born: now(), over: 0, happy: 0, touch: false, id: Math.random(), wink: now() + 2500 + Math.random() * 4000 };
    bodies.push(b); return b;
  }
  function now() { return performance.now(); }
  function randLevel() { var s = 0, i; for (i = 0; i <= DROP_MAX; i++) s += DROP_W[i]; var r = Math.random() * s; for (i = 0; i <= DROP_MAX; i++) { r -= DROP_W[i]; if (r <= 0) return i; } return 0; }

  /* ---------- fizik ---------- */
  /* Uyku yok: her meyve her karede yerçekimi ve temas kuvvetlerine tabi; altta kalan meyve üsttekilerin baskısıyla kayabilir.
     Titreşimi önleyen şeyler: slop'lu yumuşak konum düzeltmesi, düşük hızda sekme yok, çok küçük hızın sıfırlanması (sürünme yok).
     Dönme: her meyvenin açısal hızı var; sürtünme darbeleri döndürür, zeminde yuvarlanma hızına kilitlenir. */
  var GRAV = 1900, REST = 0.28, MU = 0.10, MUW = 0.08, MUP = 0.4, SLOP = 0.5, ITER = 9, VSTOP = 4;   /* MU 0.18→0.10: yuvarlak meyve kayma değil yuvarlanma sürtünmesi görür; 0.18 kamada kilitleniyordu */
  /* Dinlenme: destekli ve 0.5 sn yavaş kalan meyve "dinlenir" (yerçekimi entegrasyonu durur → sürünme yok).
     Dinlenen meyve yine de itilir: hareketli bir meyve değince, baskıyla itilince ya da komşusu birleşince hemen uyanır ve fizik tam çalışır. */
  function wake(b) { if (b.sleep) { b.sleep = false; } b.win = 0; b.wsp = 0; b.x0 = b.x; b.y0 = b.y; }
  function step(dt) {
    var i, j, b, o, n = bodies.length, pend = [];
    for (i = 0; i < n; i++) { b = bodies[i]; b.touch = false; b.ground = false; b.sup = 0; b.supMax = 0; b.supW = 0; b.ncp = b.nc || 0; b.nc = 0; b.nfp = b.nf || 0; b.nf = 0; b.wallHit = false; b.px = b.x; b.py = b.y; if (b.sleep) continue; b.vy += GRAV * dt; b.x += b.vx * dt; b.y += b.vy * dt; }
    for (var it = 0; it < ITER; it++) {
      var corr = it < 2 ? 0.4 : 0.28;
      /* meyve–meyve */
      for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) {
        b = bodies[i]; o = bodies[j];
        var dx = o.x - b.x, dy = o.y - b.y, d2 = dx * dx + dy * dy, R = b.r + o.r;
        if (d2 >= R * R) continue;
        if (d2 < 0.0001) { dx = 0.01; dy = -0.01; d2 = 0.0002; }
        var d = Math.sqrt(d2), nx = dx / d, ny = dy / d, pen = R - d;
        var mb = b.mass, mo = o.mass, tot = mb + mo;
        var push = Math.max(0, pen - SLOP) * corr;
        var sb = Math.abs(b.vx) + Math.abs(b.vy), so = Math.abs(o.vx) + Math.abs(o.vy);
        if (b.sleep && (so > 30 || push > 1.2)) wake(b);   /* 16→30: çözücünün artık hız titreşimi (~10–15) komşuları uyandırıp yığını sürüklüyordu; <30 px/s sürünme rejimi, uyandırmaz */
        if (o.sleep && (sb > 30 || push > 1.2)) wake(o);
        /* dinlenen meyve darbe hesabında da "sonsuz kütle": konumda sabitken hıza pay almasın (payı sonra sıfırlanıyordu → uyanık meyve yaklaşma hızını tam kaybetmiyor, titreşim/yavaş durma) */
        var ib = b.sleep ? 0 : 1 / mb, io = o.sleep ? 0 : 1 / mo, invM = ib + io;
        /* dinlenen meyve konum düzeltmesinde "sonsuz kütle": uyanık olan açılır; ikisi de dinleniyorsa dokunulmaz (sürünme motoru burasıydı) */
        if (b.sleep && o.sleep) { }
        else if (b.sleep) { o.x += nx * push; o.y += ny * push; }
        else if (o.sleep) { b.x -= nx * push; b.y -= ny * push; }
        else { b.x -= nx * push * (mo / tot); b.y -= ny * push * (mo / tot); o.x += nx * push * (mb / tot); o.y += ny * push * (mb / tot); }
        var rvx = o.vx - b.vx, rvy = o.vy - b.vy, vn = rvx * nx + rvy * ny;
        if (vn < 0 && invM > 0) {
          if (vn < -35) { wake(b); wake(o); ib = 1 / mb; io = 1 / mo; invM = ib + io; }   /* gerçek bir çarpma: ikisi de uyanır */
          var e = vn < -80 ? REST : 0, jn = -(1 + e) * vn / invM;
          b.vx -= jn * nx * ib; b.vy -= jn * ny * ib; o.vx += jn * nx * io; o.vy += jn * ny * io;
          /* yığının içindekiler (çok temas) daha "tutucu", serbest yuvarlananlar kaygan: yığın akmaz, tek meyve yuvarlanır */
          var mu = (b.nfp >= 3 && o.nfp >= 3) ? MUP : MU;   /* ikisi de sıkışmışsa tutucu; biri serbestse (ör. yığının üstündeki tek meyve) yuvarlanabilir */
          var tx = -ny, ty = nx, vt = (o.vx - b.vx) * tx + (o.vy - b.vy) * ty, jt = -vt / invM, lim = mu * Math.abs(jn);
          if (jt > lim) jt = lim; else if (jt < -lim) jt = -lim;
          b.vx -= jt * tx * ib; b.vy -= jt * ty * ib; o.vx += jt * tx * io; o.vy += jt * ty * io;
          b.w -= jt / (mb * b.r) * 0.9; o.w -= jt / (mo * o.r) * 0.9;          /* sürtünme döndürür */
        }
        b.touch = o.touch = true;
        if (ny > 0.75) b.ground = true; if (ny < -0.75) o.ground = true;
        if (it === 0) { b.nc++; o.nc++; b.nf++; o.nf++; if (ny > 0) { b.sup += ny; if (ny > b.supMax) b.supMax = ny; } else { o.sup -= ny; if (-ny > o.supMax) o.supMax = -ny; } }
        if (b.L === o.L && it === 0 && !b.pm && !o.pm) { b.pm = o.pm = true; pend.push([b, o]); }
      }
      /* meyve–kase duvarı */
      for (i = 0; i < n; i++) {
        b = bodies[i];
        for (j = 0; j < walls.length; j++) {
          var w = walls[j], ex = w.x2 - w.x1, ey = w.y2 - w.y1, len2 = ex * ex + ey * ey;
          var t = ((b.x - w.x1) * ex + (b.y - w.y1) * ey) / len2; t = Math.max(0, Math.min(1, t));
          var px = w.x1 + ex * t, py = w.y1 + ey * t, ddx = b.x - px, ddy = b.y - py, dd = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dd >= b.r || dd === 0) continue;
          var wnx = ddx / dd, wny = ddy / dd, wpen = b.r - dd;
          b.x += wnx * Math.max(0, wpen - SLOP * 0.5) * 0.85; b.y += wny * Math.max(0, wpen - SLOP * 0.5) * 0.85;
          var vn2 = b.vx * wnx + b.vy * wny;
          if (vn2 < 0) {
            var e2 = vn2 < -80 ? REST * 0.8 : 0, jn2 = -(1 + e2) * vn2;
            b.vx += jn2 * wnx; b.vy += jn2 * wny;
            var ttx = -wny, tty = wnx, vt2 = b.vx * ttx + b.vy * tty, jt2 = -vt2, lim2 = (b.nfp >= 3 ? MUP : MUW) * Math.abs(jn2);
            if (jt2 > lim2) jt2 = lim2; else if (jt2 < -lim2) jt2 = -lim2;
            b.vx += jt2 * ttx; b.vy += jt2 * tty;
            b.w -= jt2 / b.r * 0.9;
          }
          b.touch = true; if (wny < -0.75) b.ground = true;
          if (it === 0) { if (!b.wallHit) { b.wallHit = true; b.nc++; } if (wny < 0 && -wny > b.supW) b.supW = -wny; }
          if (wny < -0.2) b.w += (((b.mvx || 0) * ttx2(wnx, wny)) / b.r - b.w) * 0.3;   /* eğimde yuvarlanma: açısal hız gerçek (konumdan ölçülen) teğet hıza yaklaşır */
        }
      }
    }
    /* birleşmeler (çarpışma döngüsü bittikten sonra, dizi değişmesin diye) */
    for (i = 0; i < pend.length; i++) { pend[i][0].pm = pend[i][1].pm = false; tryMerge(pend[i][0], pend[i][1]); }
    /* dönüş, dinlenme ve tehlike sayacı */
    var tnow = now();
    for (i = bodies.length - 1; i >= 0; i--) {
      b = bodies[i];
      var sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
      b.mvx = b.px === undefined ? 0 : (b.x - b.px) / dt; b.mvy = b.py === undefined ? 0 : (b.y - b.py) / dt;                        /* gerçek hız (konum farkından): çizim için; çözücünün artık "hayalet hızı" yerinde duran meyveyi döndürmesin */
      if (b.ground) { b.w += ((b.mvx / b.r) - b.w) * 0.5; b.vx *= Math.pow(0.992, dt * 180); }   /* zeminde yuvarlanma + yuvarlanma direnci (dt ölçekli: 60 fps/3 alt adımda eski değer) */
      b.w *= Math.pow(0.985, dt * 180);                                         /* havada/temas yokken yavaşça durur (dt ölçekli) */
      b.a += b.w * dt;
      /* çok küçük hız: sıfırla; destekli ve 0.5 sn boyunca yavaşsa dinlenmeye geç (itilince uyanır) */
      /* destek: tek bir temas neredeyse tam alttan (≈10°) ya da birden çok temasın yukarı bileşenleri yeterliyse (sıkışma).
         Desteksiz meyve (eğimde, yanda duran) durdurulmaz: yerçekimiyle kayar/yuvarlanır → kasenin ortasına iner. */
      var supTot = b.sup + b.supW;
      var supported = b.supW >= 0.9994 || b.supMax >= 0.996 || supTot >= 1.25;   /* tek temasla eğimde "tutulmaz": yuvarlanır */
      if (b.nf >= 2 && !b.sleep && sp < 30) { var dmp = Math.pow(0.95, dt * 180); b.vx *= dmp; b.vy *= dmp; }   /* yığın içinde yalnızca sürünme hızındaki hareket sönümlenir; çarpma tepkileri serbest (dt ölçekli) */
      if (b.sleep) { b.vx = b.vy = 0; b.w = 0; if (b.nc === 0 || b.nc < b.ncS) wake(b); }   /* teması azalan (altı boşalan) dinlenen meyve uyanır, düşer */
      else {
        if (supported && sp < VSTOP) { b.vx = 0; b.vy = Math.min(b.vy, 0); if (Math.abs(b.w) < 0.05) b.w = 0; }
        /* dinlenme kararı konuma göre: 0.5 sn içinde 0.8 px'den az yer değiştiren ve temas hâlindeki meyve dinlenir (sürünme/salınım yok) */
        b.win = (b.win || 0) + dt; if (sp > (b.wsp || 0)) b.wsp = sp;
        if (b.win >= 0.5) {
          var moved = Math.abs(b.x - (b.x0 === undefined ? b.x : b.x0)) + Math.abs(b.y - (b.y0 === undefined ? b.y : b.y0));
          /* en az iki teması olan (sıkışmış) ya da desteklenen meyve: 0.5 sn'de 2 px'den az yer değiştirdiyse (çözücünün "hayalet hızı" ile sürünenler dahil) ya da hep sürünme hızının altında kaldıysa dinlenir (statik sürtünme gibi) */
          if (b.touch && (b.nc >= 2 || supported) && (moved < 2 || b.wsp < 8) && b.x0 !== undefined) { b.sleep = true; b.ncS = b.nc; b.vx = b.vy = 0; b.w = 0; }
          b.x0 = b.x; b.y0 = b.y; b.win = 0; b.wsp = 0;
        }
      }
      if (tnow - b.born > 900 && b.y - b.r < DANGER && sp < 40) { b.over += dt; if (b.over > 1.1 && !dead) gameOver(); } else b.over = 0;
    }
  }
  function ttx2(wnx, wny) { return -wny; }
  function tryMerge(b, o) {
    if (b.dead || o.dead || dead) return;
    var tnow = now(); if (tnow - b.born < 120 || tnow - o.born < 120) return;
    b.dead = o.dead = true;
    var L = b.L, x = (b.x + o.x) / 2, y = (b.y + o.y) / 2, vx = (b.vx + o.vx) / 4, vy = (b.vy + o.vy) / 4;
    bodies = bodies.filter(function (q) { return !q.dead; });
    var R0 = rad(Math.min(L + 1, FRUITS.length - 1));
    for (var k = 0; k < bodies.length; k++) {                     /* komşular uyanır ve "pat" ile hafifçe dışa itilir */
      var q = bodies[k]; wake(q);
      var qx = q.x - x, qy = q.y - y, qd = Math.sqrt(qx * qx + qy * qy) || 1, reach = R0 + q.r + 40;
      if (qd < reach) { var f = (1 - qd / reach) * 240 * Math.min(1.2, (R0 * R0) / q.mass + 0.4); q.vx += qx / qd * f; q.vy += qy / qd * f - 40; }
    }
    merges++; mergesEl.textContent = merges;
    if (L >= FRUITS.length - 1) {                       /* en son seviyeden iki tane: efsane */
      addScore(300, x, y); popFx(x, y, rad(L) * 1.4, "#f6c64a"); burst(70); msg("İki kalp birleşti! Benden büyük boy sufle kazandın :D");
      return;
    }
    var nb = addBody(L + 1, x, y, vx, vy - 60); nb.happy = tnow + 650; nb.pop = tnow;
    addScore(FRUITS[L + 1].pts, x, y - nb.r); popFx(x, y, nb.r, FRUITS[L + 1].c);
    if (FRUITS[L + 1].gizli) {                          /* sürpriz seviye açıldı */
      popFx(x, y, nb.r * 1.3, "#f6c64a"); burst(50); nb.happy = tnow + 2000;
      if (!seen[FRUITS[L + 1].id]) { seen[FRUITS[L + 1].id] = true; try { localStorage.setItem(FRUITS[L + 1].key, "1"); } catch (e) {} drawChain(); }
      msg(FRUITS[L + 1].msg[0]); return;
    }
    if (L + 1 >= 6) burst(22);
    if (Math.random() < 0.55 || L + 1 >= 5) msg(pick(FRUITS[L + 1].msg));
  }
  function addScore(n, x, y) {
    score += n; scoreEl.textContent = score; floats.push({ x: x, y: y, t: now(), txt: "+" + n });
    if (score > best) { best = score; bestEl.textContent = best; try { localStorage.setItem("pm_best", best); } catch (e) {} }
  }

  /* ---------- efektler ---------- */
  function popFx(x, y, r, color) {
    var t = now(), i, n = 8 + Math.min(6, Math.round(r / 10));
    fx.push({ k: "ring", x: x, y: y, r: r, t: t, c: color });
    for (i = 0; i < n; i++) { var a = Math.random() * 6.28, sp = 120 + Math.random() * 180; fx.push({ k: "drop", x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 80, t: t, c: color, s: 2.5 + Math.random() * 3 }); }
    for (i = 0; i < 3; i++) fx.push({ k: "star", x: x + (Math.random() - .5) * r * 2.4, y: y + (Math.random() - .5) * r * 2.4, t: t + Math.random() * 150, c: "#f6b73c", s: 4 + Math.random() * 4 });
    if (fx.length > 90) fx.splice(0, fx.length - 90);
  }
  function drawFx(tnow) {
    var keep = [];
    for (var i = 0; i < fx.length; i++) {
      var e = fx[i], age = (tnow - e.t) / 1000; if (age < 0) { keep.push(e); continue; }
      if (e.k === "ring") { if (age > 0.45) continue; ctx.globalAlpha = (1 - age / 0.45) * 0.8; ctx.lineWidth = 4 * (1 - age / 0.45) + 1; ctx.strokeStyle = e.c; ctx.beginPath(); ctx.arc(e.x, e.y, e.r * (0.7 + age * 2.2), 0, 6.28); ctx.stroke(); }
      else if (e.k === "drop") { if (age > 0.7) continue; var x = e.x + e.vx * age, y = e.y + e.vy * age + 500 * age * age; ctx.globalAlpha = 1 - age / 0.7; ctx.fillStyle = e.c; ctx.beginPath(); ctx.arc(x, y, e.s * (1 - age * 0.6), 0, 6.28); ctx.fill(); }
      else if (e.k === "star") { if (age > 0.5) continue; var s = e.s * (age < 0.2 ? age / 0.2 : 1 - (age - 0.2) / 0.3); ctx.globalAlpha = 0.95; ctx.fillStyle = e.c; ctx.beginPath(); ctx.moveTo(e.x, e.y - s); ctx.lineTo(e.x + s * 0.35, e.y - s * 0.35); ctx.lineTo(e.x + s, e.y); ctx.lineTo(e.x + s * 0.35, e.y + s * 0.35); ctx.lineTo(e.x, e.y + s); ctx.lineTo(e.x - s * 0.35, e.y + s * 0.35); ctx.lineTo(e.x - s, e.y); ctx.lineTo(e.x - s * 0.35, e.y - s * 0.35); ctx.closePath(); ctx.fill(); }
      keep.push(e);
    }
    fx = keep; ctx.globalAlpha = 1;
    var kf = [];
    for (var j = 0; j < floats.length; j++) {
      var f = floats[j], ag = (tnow - f.t) / 1000; if (ag > 0.9) continue;
      ctx.globalAlpha = ag < 0.6 ? 1 : 1 - (ag - 0.6) / 0.3; ctx.fillStyle = "#6e52a8"; ctx.font = "800 15px Nunito, -apple-system, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(f.txt, f.x, f.y - 10 - ag * 40); kf.push(f);
    }
    floats = kf; ctx.globalAlpha = 1;
  }

  /* ---------- çizim ---------- */
  function drawBody(b, tnow) {
    /* endişe yüzü: tehlike çizgisine WARN kadar yaklaşan (ve düşmeyen) meyvede erken başlar; geçiş 300 ms'de yumuşak (wf: 0→1) */
    var wantW = b.over > 0.25 || (b.y - b.r < DANGER + WARN && Math.abs(b.vy) < 40 && tnow - b.born > 900);
    var dtw = b.wt === undefined ? 0 : Math.min(0.1, (tnow - b.wt) / 1000); b.wt = tnow;
    b.wf = Math.max(0, Math.min(1, (b.wf || 0) + (wantW ? dtw : -dtw) / 0.3));
    var face = tnow < b.happy ? "h" : b.wf >= 0.999 ? "w" : "n";
    var s = 1;
    if (FRUITS[b.L].kalp) {                                   /* kalp: sadece görsel — hafif atış (lub-dub) ve ara sıra göz kırpma */
      if (face === "n" && b.wf < 0.001 && tnow >= b.wink) { if (tnow < b.wink + 380) face = "k"; else b.wink = tnow + 3000 + Math.random() * 5000; }
      var ph = ((tnow + b.id * 1000) % 1500) / 1500, beat = ph < 0.12 ? Math.sin(ph / 0.12 * Math.PI) : (ph > 0.16 && ph < 0.3) ? 0.55 * Math.sin((ph - 0.16) / 0.14 * Math.PI) : 0;
      s *= 1 + beat * 0.045;
    }
    var sp = sprites[b.L] && (sprites[b.L][face] || sprites[b.L].n); if (!sp) return;
    if (b.pop) { var p = (tnow - b.pop) / 320; if (p < 1) s *= p < 0.5 ? 0.6 + p * 1.1 : 1.15 - (p - 0.5) * 0.3; else b.pop = 0; }
    var vc = FRUITS[b.L].vc, size = b.r * s * 100 / vc[2], ox = (50 - vc[0]) / 100 * size, oy = (50 - vc[1]) / 100 * size;
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a); ctx.drawImage(sp, -size / 2 + ox, -size / 2 + oy, size, size);
    if (face === "n" && b.wf > 0.001 && sprites[b.L].w) { ctx.globalAlpha = b.wf; ctx.drawImage(sprites[b.L].w, -size / 2 + ox, -size / 2 + oy, size, size); ctx.globalAlpha = 1; }   /* endişe yüzü üstte solarak belirir/kaybolur */
    ctx.restore();
  }
  function render(tnow) {
    if (!bgCache) bgCache = drawBg();
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.drawImage(bgCache, 0, 0, W, H);
    /* kılavuz + eldeki meyve */
    if (!dead) {
      var r = rad(cur), gx = Math.max(inset + r + 2, Math.min(W - inset - r - 2, hx));
      ctx.setLineDash([5, 7]); ctx.strokeStyle = "rgba(236,111,154,.55)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(gx, TOP + r); ctx.lineTo(gx, H - 20); ctx.stroke(); ctx.setLineDash([]);
      var sp = sprites[cur] && sprites[cur].n; if (sp) { var vc = FRUITS[cur].vc, size = r * 100 / vc[2], ox = (50 - vc[0]) / 100 * size, oy = (50 - vc[1]) / 100 * size; ctx.globalAlpha = canDrop ? 1 : 0.55; ctx.drawImage(sp, gx - size / 2 + ox, TOP - size / 2 + oy, size, size); ctx.globalAlpha = 1; }
    }
    for (var i = 0; i < bodies.length; i++) drawBody(bodies[i], tnow);
    drawFx(tnow);
  }

  /* ---------- döngü ---------- */
  function loop(t) {
    if (!running) return;
    var dt = lastT ? Math.min(0.033, (t - lastT) / 1000) : 0.016; lastT = t;
    var sub = 3; for (var s = 0; s < sub; s++) step(dt / sub);
    render(t);
    requestAnimationFrame(loop);
  }
  function start() {
    bodies = []; fx = []; floats = []; score = 0; merges = 0; dead = false; canDrop = true; giftShown = false;
    scoreEl.textContent = 0; mergesEl.textContent = 0; over.hidden = true;
    cur = randLevel(); nxt = randLevel(); showNext(); hx = W / 2;
    msg("Kaseye dokun, meyve düşsün. Aynılar birleşir 🍓");
    if (!running) { running = true; lastT = 0; requestAnimationFrame(loop); }
  }
  function showNext() { nextUse.setAttribute("href", "#f-" + FRUITS[nxt].id); nextUse.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#f-" + FRUITS[nxt].id); }
  function drop() {
    if (!canDrop || dead) return;
    var r = rad(cur), gx = Math.max(inset + r + 2, Math.min(W - inset - r - 2, hx));
    addBody(cur, gx, TOP, 0, 120);
    cur = nxt; nxt = randLevel(); showNext();
    canDrop = false; setTimeout(function () { canDrop = true; }, 520);
  }
  function gameOver() {
    dead = true;
    var t = score >= 600 ? "Kase taştı ama bu puan ciddi. Mimar işi 📐" : score >= 250 ? "Kase taştı ama bilet hâlâ geçerli 🎟️" : "Isınma turuydu. Peki madem, bir daha 🍉";
    $("overScore").textContent = score; $("overText").textContent = t; $("overBest").textContent = "En iyi: " + best + " · Birleşme: " + merges;
    var maxL = bodies.reduce(function (m, b) { return Math.max(m, b.L); }, -1);
    $("overEyebrow").textContent = maxL >= 9 ? "kalbe ulaştın ❤️" : maxL === 8 ? "atom tosta ulaştın 🍞" : maxL === 7 ? "muffine ulaştın 🧁" : maxL === 6 ? "karpuza ulaştın 🍉" : "kase taştı 🍉";
    over.hidden = false;
    showGift();                                       /* sürpriz hediye: yalnızca kalp keşfedildiyse (mevcut yanma akışına eklenti) */
  }

  /* ---------- sürpriz hediye (kalp açıldıysa, kase taşınca) ----------
     Koşul: seen.kalp (kalıcı keşif kaydı) && oyun sonu && hediye daha önce açılmadı (pm_hediye1).
     Oyun içinde hiç görünmez; her oyun sonunda en fazla bir kez tetiklenir; "Evet" ile açılınca bir daha çıkmaz. */
  var giftEl = $("hediye"), giftDone = false, giftShown = false, giftOpening = false;
  try { giftDone = localStorage.getItem("pm_hediye1") === "1"; } catch (e) {}
  function showGift() {
    if (!giftEl || giftShown || giftDone || !seen.kalp || !dead) return;
    giftShown = true; giftEl.hidden = false;
  }
  function openGift() {
    if (giftOpening) return; giftOpening = true;
    var box = $("giftbox"), hNo = $("hNo"), hYes = $("hYes");
    hNo.hidden = true; hYes.disabled = true; $("hHint").textContent = "";
    $("hQ").textContent = "Sıkı bağlamıştım, bir saniye… 🎀";
    box.classList.add("tug");                                                   /* kurdele gerilir, kutu kıpırdar */
    setTimeout(function () { box.classList.add("untie"); }, 1000);              /* kurdele ve fiyonk çözülür */
    setTimeout(function () { box.classList.add("open"); burst(36); $("hQ").textContent = ""; }, 1650);   /* kapak yavaşça açılır, kalp yükselir */
    setTimeout(function () {
      $("hMsg").hidden = false; $("hQ").hidden = true; hYes.hidden = true; $("hDone").hidden = false; burst(70);
      giftDone = true; try { localStorage.setItem("pm_hediye1", "1"); } catch (e) {}
    }, 3200);
  }
  if (giftEl) {
    $("hYes").onclick = openGift;
    $("hDone").onclick = function () { giftEl.hidden = true; };
    if (window.__makeDodger) window.__makeDodger($("hNo"), $("hYes"), $("hHint"),
      ["Emin misin?", "Haydaa", "Bir daha düşün", "Bu buton da bozuk", "Kurdele çok sıkı zaten", "Yakalayamazsın", "Hanımefendi lütfen", "Hediye bekliyor", "Pes et artık", "Lavantalar üzüldü", "Bence belli", "Evet'e bas"],
      ["", "Hayır butonu yine utangaç 😅", "Evet butonu büyüyor, fark ettin mi?", "Bu buton hiçbir sayfada yakalanmadı.", "Bence bu iş belli 🎀"],
      { 5: "Evet, açalım\u00a0🎀", 9: "Evet, açalım\u00a0🎁" },
      "Hayır kaçtı gitti. Geriye bir seçenek kaldı 🎀");
    else $("hNo").hidden = true;                                                 /* kaçma mekanizması yüklenmediyse yalnızca Evet kalır */
  }

  /* ---------- dokunma ---------- */
  var ptrDown = false;
  function px(e) { var r = cv.getBoundingClientRect(); return (e.clientX - r.left) * W / r.width; }
  cv.addEventListener("pointerdown", function (e) { e.preventDefault(); ptrDown = true; hx = px(e); try { cv.setPointerCapture(e.pointerId); } catch (err) {} });
  cv.addEventListener("pointermove", function (e) { if (!ptrDown) return; e.preventDefault(); hx = px(e); });
  function up(e) { if (!ptrDown) return; ptrDown = false; if (e && e.clientX !== undefined) hx = px(e); drop(); }
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", function () { ptrDown = false; });

  /* ---------- zincir (son halka: keşfedilene kadar altın "?") ---------- */
  function drawChain() {
    var c = $("chain"), html = "", n = FRUITS.length;
    var avail = Math.max(200, (c.clientWidth || 300) - 16) - (n - 1) * 9, base = 0;
    for (var k = 0; k < n; k++) base += 1 + k * 0.17;
    var unit = Math.min(26, avail / base);
    FRUITS.forEach(function (f, i) {
      var s = Math.round(unit * (1 + i * 0.17)), hid = f.gizli && !seen[f.id], id = hid ? "gizli" : f.id, cls = hid ? ' class="gizli"' : "";
      html += '<svg' + cls + ' width="' + s + '" height="' + s + '" viewBox="0 0 100 100"><use href="#f-' + id + '" xlink:href="#f-' + id + '"/></svg>' + (i < n - 1 ? "<i>›</i>" : "");
    });
    c.innerHTML = html;
  }
  drawChain();

  $("again2").onclick = start;
  document.addEventListener("visibilitychange", function () { if (document.hidden) { running = false; } else if (!running) { running = true; lastT = 0; requestAnimationFrame(loop); } });
  function refit() { var scale0 = SC; measure(); drawChain(); if (Math.abs(SC - scale0) > 0.001) { bodies.forEach(function (b) { b.r = rad(b.L); b.mass = FRUITS[b.L].d * b.r * b.r; }); buildSprites(function () {}); } }
  addEventListener("resize", refit); addEventListener("orientationchange", function () { setTimeout(refit, 250); });

  /* yapım aşaması anahtarı (kase.html'de): açıkken oyun hiç başlamaz, sadece "olgunlaşıyor" ekranı görünür */
  if (window.PEKI_MADEM_YAPIM) {
    var yp = $("yapim"); if (yp) yp.hidden = false;
    document.querySelector("main").style.visibility = "hidden";
    return;
  }
  measure();
  buildSprites(function () {
    /* ilk açılışta kısa tanıtım kartı; "başla" deyince oyun başlar */
    var intro = $("intro"), go = $("introGo");
    if (intro && go) { intro.hidden = false; render(now()); go.onclick = function () { intro.hidden = true; start(); }; }
    else start();
  });

  /* test kancası: kase.html#test */
  if (location.hash === "#test") {
    window.__pm = {
      drop: function (L, x) { addBody(L, x !== undefined ? x : W / 2, TOP, 0, 40); },
      bodies: function () { return bodies; }, score: function () { return score; }, dead: function () { return dead; },
      geom: function () { return { W: W, H: H, SC: SC, DANGER: DANGER }; }, step: function (n) { for (var i = 0; i < n; i++) step(1 / 180); }, over: gameOver
    };
  }
})();
