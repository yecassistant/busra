/* Peki Madem (: — Büşranur'a özel meyve kasesi.
   Meyveyi kaseye bırak; aynı iki meyve değince bir büyüğüne dönüşür (yaban mersini → … → karpuz).
   Kendi hafif fiziği var (daire–daire, daire–kase duvarı), tuval (canvas) üzerinde çizilir; meyveler SVG'den bir kez rasterlenir. */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  /* ---------- meyveler (küçükten büyüğe) ---------- */
  var FRUITS = [
    { id: "yabanmersini", ad: "Yaban mersini", vc: [50, 52, 45], r: 15, c: "#5b6bb5", pts: 1,  msg: ["Muffin malzemesi hazır 🧁", "Yaban mersini ikilisi, Şef"] },
    { id: "kiraz",        ad: "Kiraz",         vc: [50, 54, 44], r: 20, c: "#e0484f", pts: 3,  msg: ["Kiraz birleşti 🍒", "Çift kiraz, tek sap"] },
    { id: "cilek",        ad: "Çilek",         vc: [50, 56, 43], r: 26, c: "#ec4b5f", pts: 6,  msg: ["Sufle yolda 🍓", "Bol çilekli, Şef"] },
    { id: "uzum",         ad: "Beyaz üzüm",    vc: [50, 54, 44], r: 33, c: "#b9d47f", pts: 10, msg: ["Beyaz üzüm, serin serin 🍇", "Üzüm oldu, Şef"] },
    { id: "nektarin",     ad: "Nektarin",      vc: [50, 55, 44], r: 41, c: "#f28c3b", pts: 15, msg: ["Nektarin: yaz kokusu ☀️", "Nektarin geldi"] },
    { id: "nar",          ad: "Nar",           vc: [50, 56, 43], r: 50, c: "#b8324a", pts: 21, msg: ["Fatih'te nar suyu gibi 🕌", "Nar çıktı, Şef!"] },
    { id: "karpuz",       ad: "Karpuz",        vc: [50, 52, 46], r: 62, c: "#3f9d5a", pts: 28, msg: ["Karpuz! Peki madem, kase senin 🍉", "Karpuz çıktı; bilet hâlâ geçerli 🎟️"] },
    /* sürpriz son seviye: zincirde altın "?" olarak görünür, iki karpuz birleşince ortaya çıkar */
    { id: "muffin",       ad: "Yaban mersinli muffin", vc: [50, 56, 44], r: 74, c: "#f6c64a", pts: 60, gizli: true, msg: ["Sürpriz: yaban mersinli muffin 🧁 Büşranur'a özel", "Muffin çıktı! Şef, bu kase artık tarihî 🧁"] }
  ];
  var muffinSeen = false; try { muffinSeen = localStorage.getItem("pm_muffin") === "1"; } catch (e) {}
  var DROP_MAX = 4, DROP_W = [32, 28, 20, 12, 8];  /* bırakılabilen seviyeler ve ağırlıkları */
  var BASE_W = 360;                                /* yarıçaplar bu kase genişliğine göre; dar ekranda oranla küçülür */

  var cv = $("bowl"), ctx = cv.getContext("2d"), wrap = $("bowlwrap"), stageEl = document.querySelector("main");
  var msgEl = $("kmsg"), scoreEl = $("score"), bestEl = $("best"), mergesEl = $("merges"), over = $("over"), nextUse = $("nextUse");
  var W = 360, H = 480, DPR = 1, SC = 1;           /* SC: yarıçap ölçeği */
  var TOP = 48, DANGER = 100, RIM = 108;           /* bırakma yüksekliği, tehlike çizgisi, kase ağzı */
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
    if (face !== "n") inner = inner.replace(/href="#face"/g, 'href="#face-' + (face === "h" ? "happy" : "worry") + '"');
    return '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" width="100" height="100">' + defsXml + "<g>" + inner + "</g></svg>";
  }
  function buildSprites(done) {
    var left = 0;
    FRUITS.forEach(function (f, L) {
      sprites[L] = {};
      ["n", "h", "w"].forEach(function (face) {
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
    var b = { L: L, x: x, y: y, vx: vx || 0, vy: vy || 0, r: rad(L), a: Math.random() * 6.28, born: now(), over: 0, happy: 0, rest: 0, touch: false, id: Math.random() };
    bodies.push(b); return b;
  }
  function now() { return performance.now(); }
  function randLevel() { var s = 0, i; for (i = 0; i <= DROP_MAX; i++) s += DROP_W[i]; var r = Math.random() * s; for (i = 0; i <= DROP_MAX; i++) { r -= DROP_W[i]; if (r <= 0) return i; } return 0; }

  /* ---------- fizik ---------- */
  /* Hız sönümü yok (yavaş sürünme sorunu buradaydı); temas sürtünmesi Coulomb tipi, dinlenme halinde hız sıfırlanır.
     Konum düzeltmesi: slop'lu, yumuşak; sert çarpmalarda sekme, hafif temaslarda sekme yok (titreme olmasın). */
  var GRAV = 1900, REST = 0.3, MU = 0.38, SLOP = 0.4, ITER = 6;
  function step(dt) {
    var i, j, b, o, n = bodies.length, pend = [];
    for (i = 0; i < n; i++) { b = bodies[i]; b.touch = false; b.ground = false; b.slope = false; if (b.sleep) continue; b.vy += GRAV * dt; b.x += b.vx * dt; b.y += b.vy * dt; }
    for (var it = 0; it < ITER; it++) {
      var corr = it < 2 ? 0.45 : 0.3;
      /* meyve–meyve */
      for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) {
        b = bodies[i]; o = bodies[j];
        var dx = o.x - b.x, dy = o.y - b.y, d2 = dx * dx + dy * dy, R = b.r + o.r;
        if (d2 >= R * R) continue;
        if (d2 === 0) { dx = 0.01; dy = -0.01; d2 = 0.0002; }
        var d = Math.sqrt(d2), nx = dx / d, ny = dy / d, pen = R - d;
        var mb = b.r * b.r, mo = o.r * o.r, tot = mb + mo;
        var push = Math.max(0, pen - SLOP) * corr;
        /* hareketli bir meyve uyuyana değince uyuyan uyanır ve itilir (birbirlerini itsinler) */
        var sb = Math.abs(b.vx) + Math.abs(b.vy), so = Math.abs(o.vx) + Math.abs(o.vy);
        if (b.sleep && (so > 25 || push > 0.6)) { b.sleep = false; b.restT = 0; }
        if (o.sleep && (sb > 25 || push > 0.6)) { o.sleep = false; o.restT = 0; }
        if (b.sleep && !o.sleep) { o.x += nx * push; o.y += ny * push; }
        else if (o.sleep && !b.sleep) { b.x -= nx * push; b.y -= ny * push; }
        else if (!b.sleep) { b.x -= nx * push * (mo / tot); b.y -= ny * push * (mo / tot); o.x += nx * push * (mb / tot); o.y += ny * push * (mb / tot); }
        var rvx = o.vx - b.vx, rvy = o.vy - b.vy, vn = rvx * nx + rvy * ny;
        if (vn < 0) {
          var e = vn < -60 ? REST : 0, invM = 1 / mb + 1 / mo;
          var jn = -(1 + e) * vn / invM;
          if (jn > 12 * Math.min(mb, mo) / 400) { b.sleep = o.sleep = false; }
          b.vx -= jn * nx / mb; b.vy -= jn * ny / mb; o.vx += jn * nx / mo; o.vy += jn * ny / mo;
          var tx = -ny, ty = nx, vt = (o.vx - b.vx) * tx + (o.vy - b.vy) * ty, jt = -vt / invM, lim = MU * Math.abs(jn);
          if (jt > lim) jt = lim; else if (jt < -lim) jt = -lim;
          b.vx -= jt * tx / mb; b.vy -= jt * ty / mb; o.vx += jt * tx / mo; o.vy += jt * ty / mo;
        }
        b.touch = o.touch = true;
        if (ny > 0.75) b.ground = true; if (ny < -0.75) o.ground = true;
        if (b.L === o.L && it === 0 && !b.m && !o.m) { b.m = o.m = true; pend.push([b, o]); }
      }
      /* meyve–duvar */
      for (i = 0; i < n; i++) {
        b = bodies[i];
        for (j = 0; j < walls.length; j++) {
          var w = walls[j], ex = w.x2 - w.x1, ey = w.y2 - w.y1, len2 = ex * ex + ey * ey;
          var t = ((b.x - w.x1) * ex + (b.y - w.y1) * ey) / len2; t = Math.max(0, Math.min(1, t));
          var px = w.x1 + ex * t, py = w.y1 + ey * t, ddx = b.x - px, ddy = b.y - py, dd = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dd >= b.r || dd === 0) continue;
          var wnx = ddx / dd, wny = ddy / dd, wpen = b.r - dd;
          b.x += wnx * Math.max(0, wpen - SLOP * 0.5) * 0.8; b.y += wny * Math.max(0, wpen - SLOP * 0.5) * 0.8;
          var vn2 = b.vx * wnx + b.vy * wny;
          if (vn2 < 0) {
            var e2 = vn2 < -60 ? REST * 0.8 : 0, jn2 = -(1 + e2) * vn2;
            b.vx += jn2 * wnx; b.vy += jn2 * wny;
            var ttx = -wny, tty = wnx, vt2 = b.vx * ttx + b.vy * tty, jt2 = -vt2, lim2 = MU * 1.2 * Math.abs(jn2);
            if (jt2 > lim2) jt2 = lim2; else if (jt2 < -lim2) jt2 = -lim2;
            b.vx += jt2 * ttx; b.vy += jt2 * tty;
          }
          b.touch = true; if (wny < -0.75) b.ground = true; else if (wny < -0.2) b.slope = true;
        }
      }
    }
    /* birleşmeler (çarpışma döngüsü bittikten sonra, dizi değişmesin diye) */
    for (i = 0; i < pend.length; i++) { pend[i][0].m = pend[i][1].m = false; tryMerge(pend[i][0], pend[i][1]); }
    /* dönüş + dinlenme + tehlike sayacı */
    var tnow = now();
    for (i = bodies.length - 1; i >= 0; i--) {
      b = bodies[i];
      var sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
      /* uyku: destekli ve 0.45 sn boyunca yavaşsa tamamen dur (sürünme olmasın); çarpınca uyanır */
      if (b.sleep) { b.vx = b.vy = 0; }
      else if (b.touch && sp < 10) { b.restT = (b.restT || 0) + dt; if (b.restT > 0.6) { b.sleep = true; b.vx = b.vy = 0; } }
      else b.restT = 0;
      if (b.touch) {
        b.a += (b.vx / b.r) * dt;
        /* yuvarlanma direnci + dinlenme: destekli ve yavaşsa dur */
        if (b.ground) { b.vx *= 0.985; if (sp < 14) { b.vx *= 0.8; b.vy *= 0.8; } if (sp < 3) { b.vx = 0; b.vy = Math.min(b.vy, 0); } }
        else if (b.slope) { b.vx *= 0.995; }
      }
      if (tnow - b.born > 900 && b.y - b.r < DANGER && sp < 40) { b.over += dt; if (b.over > 1.1 && !dead) gameOver(); } else b.over = 0;
    }
  }
  function tryMerge(b, o) {
    if (b.dead || o.dead || dead) return;
    var tnow = now(); if (tnow - b.born < 120 || tnow - o.born < 120) return;
    b.dead = o.dead = true;
    var L = b.L, x = (b.x + o.x) / 2, y = (b.y + o.y) / 2, vx = (b.vx + o.vx) / 4, vy = (b.vy + o.vy) / 4;
    bodies = bodies.filter(function (q) { return !q.dead; });
    var R0 = rad(Math.min(L + 1, FRUITS.length - 1));
    for (var k = 0; k < bodies.length; k++) {                     /* komşular uyanır ve "pat" ile hafifçe dışa itilir */
      var q = bodies[k]; q.sleep = false; q.restT = 0;
      var qx = q.x - x, qy = q.y - y, qd = Math.sqrt(qx * qx + qy * qy) || 1, reach = R0 + q.r + 40;
      if (qd < reach) { var f = (1 - qd / reach) * 240 * Math.min(1, (R0 * R0) / (q.r * q.r) + 0.4); q.vx += qx / qd * f; q.vy += qy / qd * f - 40; }
    }
    merges++; mergesEl.textContent = merges;
    if (L >= FRUITS.length - 1) {                       /* iki muffin: efsane */
      addScore(200, x, y); popFx(x, y, rad(L) * 1.4, "#f6c64a"); burst(70); msg("İki muffin birleşti: efsane ✨ Kase senin, Şef.");
      return;
    }
    var nb = addBody(L + 1, x, y, vx, vy - 60); nb.happy = tnow + 650; nb.pop = tnow;
    addScore(FRUITS[L + 1].pts, x, y - nb.r); popFx(x, y, nb.r, FRUITS[L + 1].c);
    if (FRUITS[L + 1].gizli) {                          /* sürpriz açıldı */
      popFx(x, y, nb.r * 1.3, "#f6c64a"); burst(50); nb.happy = tnow + 2000;
      if (!muffinSeen) { muffinSeen = true; try { localStorage.setItem("pm_muffin", "1"); } catch (e) {} drawChain(); }
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
    var face = tnow < b.happy ? "h" : (b.over > 0.25 || (b.y - b.r < DANGER + 18 && Math.abs(b.vy) < 40 && tnow - b.born > 900)) ? "w" : "n";
    var sp = sprites[b.L] && (sprites[b.L][face] || sprites[b.L].n); if (!sp) return;
    var s = 1; if (b.pop) { var p = (tnow - b.pop) / 320; if (p < 1) s = p < 0.5 ? 0.6 + p * 1.1 : 1.15 - (p - 0.5) * 0.3; else b.pop = 0; }
    var vc = FRUITS[b.L].vc, size = b.r * s * 100 / vc[2], ox = (50 - vc[0]) / 100 * size, oy = (50 - vc[1]) / 100 * size;
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a); ctx.drawImage(sp, -size / 2 + ox, -size / 2 + oy, size, size); ctx.restore();
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
    bodies = []; fx = []; floats = []; score = 0; merges = 0; dead = false; canDrop = true;
    scoreEl.textContent = 0; mergesEl.textContent = 0; over.hidden = true;
    cur = randLevel(); nxt = randLevel(); showNext(); hx = W / 2;
    msg("Kaseye dokun, meyve düşsün. Aynılar birleşir, Şef 🍓");
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
    $("overEyebrow").textContent = bodies.some(function (b) { return b.L === FRUITS.length - 1; }) ? "muffine ulaştın 🧁" : bodies.some(function (b) { return b.L === FRUITS.length - 2; }) ? "karpuza ulaştın 🍉" : "kase taştı 🍉";
    over.hidden = false;
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
    var c = $("chain"), html = "";
    FRUITS.forEach(function (f, i) {
      var s = 19 + i * 3.6, id = (f.gizli && !muffinSeen) ? "gizli" : f.id, cls = (f.gizli && !muffinSeen) ? ' class="gizli"' : "";
      html += '<svg' + cls + ' width="' + s + '" height="' + s + '" viewBox="0 0 100 100"><use href="#f-' + id + '" xlink:href="#f-' + id + '"/></svg>' + (i < FRUITS.length - 1 ? "<i>›</i>" : "");
    });
    c.innerHTML = html;
  }
  drawChain();

  $("again2").onclick = start;
  document.addEventListener("visibilitychange", function () { if (document.hidden) { running = false; } else if (!running) { running = true; lastT = 0; requestAnimationFrame(loop); } });
  function refit() { var scale0 = SC; measure(); if (Math.abs(SC - scale0) > 0.001) { bodies.forEach(function (b) { b.r = rad(b.L); }); buildSprites(function () {}); } }
  addEventListener("resize", refit); addEventListener("orientationchange", function () { setTimeout(refit, 250); });

  /* yapım aşaması anahtarı (kase.html'de): açıkken oyun hiç başlamaz, sadece "olgunlaşıyor" ekranı görünür */
  if (window.PEKI_MADEM_YAPIM) {
    var yp = $("yapim"); if (yp) yp.hidden = false;
    document.querySelector("main").style.visibility = "hidden";
    return;
  }
  measure();
  buildSprites(function () { start(); });

  /* test kancası: kase.html#test */
  if (location.hash === "#test") {
    window.__pm = {
      drop: function (L, x) { addBody(L, x !== undefined ? x : W / 2, TOP, 0, 40); },
      bodies: function () { return bodies; }, score: function () { return score; }, dead: function () { return dead; },
      geom: function () { return { W: W, H: H, SC: SC, DANGER: DANGER }; }, step: function (n) { for (var i = 0; i < n; i++) step(1 / 180); }, over: gameOver
    };
  }
})();
