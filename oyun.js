/* Şefin Planı – Büşranur'a özel bahçe planı (8×8).
   Parçaları yerleştirdikçe çiçekler birbirine sarmaşıkla bağlanır; satır/sütun dolunca "açar" ve temizlenir. */
(function () {
  "use strict";
  var N = 8, grid = [], score = 0, moves = 0, best = 0, tray = [], selected = -1, cellPx = 36, gap = 3;
  var $ = function (id) { return document.getElementById(id); };
  var board = $("board"), vines = $("vines"), trayEl = $("tray"), msgEl = $("gmsg"), scoreEl = $("score"), bestEl = $("best"), over = $("over");
  var FL = {   /* çiçek: svg anahtarı, adı, en/boy oranı */
    lav:  { key: "lav",  ad: "Lavanta",  w: 0.46, h: 0.96, emo: "💜" },
    peo:  { key: "peo",  ad: "Şakayık",  w: 0.92, h: 0.92, emo: "🌸" },
    lil:  { key: "lil",  ad: "Lilyum",   w: 0.92, h: 0.92, emo: "🌼" },
    pink: { key: "lil2", ad: "Beyaz lilyum", w: 0.92, h: 0.92, emo: "🤍" },
    leaf: { key: "peo3", ad: "Şeftali şakayık", w: 0.92, h: 0.92, emo: "🍑" }
  };
  var COLORS = ["lav", "peo", "lil", "pink", "leaf"];
  var SHAPES = [
    [[0, 0]],
    [[0, 0], [0, 1]], [[0, 0], [1, 0]],
    [[0, 0], [0, 1], [0, 2]], [[0, 0], [1, 0], [2, 0]],
    [[0, 0], [0, 1], [0, 2], [0, 3]], [[0, 0], [1, 0], [2, 0], [3, 0]],
    [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]], [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
    [[0, 0], [0, 1], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
    [[0, 0], [1, 0], [1, 1]], [[0, 0], [0, 1], [1, 0]], [[0, 0], [0, 1], [1, 1]], [[0, 1], [1, 0], [1, 1]],
    [[0, 0], [1, 0], [2, 0], [2, 1]], [[0, 0], [0, 1], [1, 0], [2, 0]], [[0, 0], [0, 1], [1, 1], [2, 1]], [[0, 1], [1, 1], [2, 1], [2, 0]],
    [[0, 0], [0, 1], [0, 2], [1, 1]], [[0, 1], [1, 0], [1, 1], [1, 2]], [[0, 0], [1, 0], [1, 1], [2, 0]], [[0, 1], [1, 0], [1, 1], [2, 1]],
    [[0, 0], [0, 1], [1, 1], [1, 2]], [[0, 1], [0, 2], [1, 0], [1, 1]]
  ];
  var CLEAR = ["açtı, Şef 🏗️", "sırası tamam, mimari onay ✓", "hizaya girdi, statik tuttu 📐", "dizildi; ruhsat çıktı 😅", "tamam, şantiye tertemiz"];
  var NOPE = ["Oraya sığmaz, Şef", "Kolon çakıştı 😅", "Kat planı uymuyor", "Mimar bakışıyla tekrar dene"];
  var PLACE = ["Yerleşti.", "Güzel.", "Tam oturdu.", "Devam, Şef.", "Plan büyüyor."];
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function burst(n) { try { if (window.__burst) window.__burst(n); } catch (e) {} }
  function flowerImg(color, size) {
    var f = FL[color];
    if (!window.__flower) return null;
    var img = window.__flower(f.key, Math.round(size * f.w), Math.round(size * f.h));
    img.className = "fl"; return img;
  }

  try { best = +localStorage.getItem("sef_best") || 0; } catch (e) {}
  bestEl.textContent = best;

  /* ---------- ölçü ---------- */
  function measure() {
    var wrap = board.parentNode, stage = wrap.parentNode;
    var w = Math.min(wrap.clientWidth, 380);
    var byW = Math.floor((w - 12 - gap * (N - 1)) / N);
    /* üst bar + tepsi + mesaj satırı + boşluklar ölçülür; kalan yükseklik plana verilir → tek ekran, kaydırma yok */
    var used = 0;
    try {
      var cs = getComputedStyle(stage), bs = getComputedStyle(document.body);
      used += (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0) + (parseFloat(bs.paddingTop) || 0) + (parseFloat(bs.paddingBottom) || 0);
      var g = parseFloat(cs.rowGap || cs.gap); if (isNaN(g)) g = 10;
      var kids = stage.children, n = 0;
      for (var k = 0; k < kids.length; k++) { n++; if (kids[k] !== wrap) used += kids[k].offsetHeight; }
      used += g * (n - 1);
    } catch (e) { used = 48 + 84 + 40 + 52; }
    var byH = Math.floor((innerHeight - used - 12 - gap * (N - 1)) / N);
    cellPx = Math.max(22, Math.min(byW, byH));
    var inner = cellPx * N + gap * (N - 1);
    board.style.width = (inner + 12) + "px";
    var cells = board.children;
    for (var i = 0; i < cells.length; i++) { cells[i].style.width = cellPx + "px"; cells[i].style.height = cellPx + "px"; }
    vines.setAttribute("viewBox", "0 0 " + inner + " " + inner);
    vines.style.width = inner + "px"; vines.style.height = inner + "px";
  }

  /* ---------- plan ---------- */
  function buildBoard() {
    board.innerHTML = ""; grid = [];
    for (var r = 0; r < N; r++) {
      grid.push([]);
      for (var c = 0; c < N; c++) {
        grid[r].push(0);
        var d = document.createElement("div"); d.className = "cell"; d.dataset.r = r; d.dataset.c = c; d.dataset.v = "";
        board.appendChild(d);
      }
    }
    measure();
  }
  function cellEl(r, c) { return board.children[r * N + c]; }
  function paint() {
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
      var el = cellEl(r, c), v = grid[r][c] || "";
      if (el.dataset.v !== v) {
        el.dataset.v = v; el.innerHTML = "";
        if (v) { var img = flowerImg(v, cellPx); if (img) el.appendChild(img); }
      }
      el.className = "cell" + (v ? " f-" + v + " grown" : "");
    }
    drawVines();
  }
  /* sarmaşık: yan yana duran çiçeklerin arasına sap + yaprak */
  function drawVines() {
    var s = cellPx + gap, half = cellPx / 2, d = "", leaves = "", k = 0.62;   /* sap, çiçeklerin kenarından kenarına */
    function center(r, c) { return [c * s + half, r * s + half]; }
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
      if (!grid[r][c]) continue;
      if (c + 1 < N && grid[r][c + 1]) {
        var a = center(r, c), b = center(r, c + 1), mxh = (a[0] + b[0]) / 2, my = a[1] - half * 0.42;
        d += "M" + (a[0] + half * k) + " " + a[1] + " Q" + mxh + " " + my + " " + (b[0] - half * k) + " " + b[1] + " ";
        leaves += "<ellipse cx='" + mxh + "' cy='" + (my + half * 0.16) + "' rx='" + (half * 0.3) + "' ry='" + (half * 0.15) + "' transform='rotate(-28 " + mxh + " " + (my + half * 0.16) + ")'/>";
      }
      if (r + 1 < N && grid[r + 1][c]) {
        var a2 = center(r, c), b2 = center(r + 1, c), myv = (a2[1] + b2[1]) / 2, mx = a2[0] + half * 0.42;
        d += "M" + a2[0] + " " + (a2[1] + half * k) + " Q" + mx + " " + myv + " " + b2[0] + " " + (b2[1] - half * k) + " ";
        leaves += "<ellipse cx='" + (mx - half * 0.16) + "' cy='" + myv + "' rx='" + (half * 0.15) + "' ry='" + (half * 0.3) + "' transform='rotate(-28 " + (mx - half * 0.16) + " " + myv + ")'/>";
      }
    }
    vines.innerHTML = d ? "<path d='" + d + "' fill='none' stroke='#5f9a70' stroke-width='3' stroke-linecap='round' opacity='.9'/><g fill='#8cc29b' opacity='.95'>" + leaves + "</g>" : "";
  }
  function canPlace(shape, r0, c0) {
    for (var i = 0; i < shape.length; i++) {
      var r = r0 + shape[i][0], c = c0 + shape[i][1];
      if (r < 0 || c < 0 || r >= N || c >= N || grid[r][c]) return false;
    }
    return true;
  }
  function anyFits(shape) {
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) if (canPlace(shape, r, c)) return true;
    return false;
  }
  function preview(shape, r0, c0, ok) {
    clearPreview();
    for (var i = 0; i < shape.length; i++) {
      var r = r0 + shape[i][0], c = c0 + shape[i][1];
      if (r >= 0 && c >= 0 && r < N && c < N) cellEl(r, c).classList.add(ok ? "ok" : "bad");
    }
  }
  function clearPreview() {
    var cells = board.children;
    for (var i = 0; i < cells.length; i++) { cells[i].classList.remove("ok"); cells[i].classList.remove("bad"); }
  }
  /* yerleştirilen parçanın komşularında aynı çiçek varsa sarmaşık bonusu */
  function vineBonus(shape, r0, c0, color) {
    var n = 0, seen = {};
    shape.forEach(function (s) {
      var r = r0 + s[0], c = c0 + s[1];
      [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].forEach(function (q) {
        var k = q[0] + "," + q[1];
        if (q[0] >= 0 && q[1] >= 0 && q[0] < N && q[1] < N && grid[q[0]][q[1]] === color && !seen[k]) { seen[k] = 1; n++; }
      });
    });
    return n;
  }
  function place(idx, r0, c0) {
    var p = tray[idx];
    if (!p || !canPlace(p.shape, r0, c0)) { msg(pick(NOPE)); return false; }
    var bonus = vineBonus(p.shape, r0, c0, p.color);
    for (var i = 0; i < p.shape.length; i++) grid[r0 + p.shape[i][0]][c0 + p.shape[i][1]] = p.color;
    score += p.shape.length + bonus; moves++;
    tray[idx] = null; selected = -1;
    paint(); renderTray();
    var cleared = clearLines();
    if (cleared.n) {
      score += cleared.n * 10 * cleared.n;
      msg(FL[cleared.color].ad + (cleared.n > 1 ? " ×" + cleared.n : "") + " " + pick(CLEAR) + " " + FL[cleared.color].emo);
      burst(14 + cleared.n * 10);
    } else if (bonus) msg("Sarmaşık bağlandı, +" + bonus + " 🌿");
    else if (moves === 1) msg("Yan yana gelen çiçekleri sarmaşık bağlar 🌿");
    else msg(pick(PLACE));
    scoreEl.textContent = score;
    if (!tray[0] && !tray[1] && !tray[2]) fillTray();
    checkOver();
    return true;
  }
  function clearLines() {
    var rows = [], cols = [], r, c, count = {}, top = "peo", topN = 0;
    for (r = 0; r < N; r++) { var full = true; for (c = 0; c < N; c++) if (!grid[r][c]) { full = false; break; } if (full) rows.push(r); }
    for (c = 0; c < N; c++) { var fullc = true; for (r = 0; r < N; r++) if (!grid[r][c]) { fullc = false; break; } if (fullc) cols.push(c); }
    if (!rows.length && !cols.length) return { n: 0 };
    function take(rr, cc) { var v = grid[rr][cc]; if (v) { count[v] = (count[v] || 0) + 1; if (count[v] > topN) { topN = count[v]; top = v; } } grid[rr][cc] = 0; cellEl(rr, cc).classList.add("bloom"); }
    rows.forEach(function (rr) { for (var cc = 0; cc < N; cc++) take(rr, cc); });
    cols.forEach(function (cc) { for (var rr = 0; rr < N; rr++) take(rr, cc); });
    setTimeout(paint, 420);
    return { n: rows.length + cols.length, color: top };
  }
  function checkOver() {
    var any = false;
    tray.forEach(function (p) { if (p && anyFits(p.shape)) any = true; });
    if (any) return;
    if (score > best) { best = score; try { localStorage.setItem("sef_best", String(best)); } catch (e) {} bestEl.textContent = best; }
    $("overScore").textContent = score;
    $("overText").textContent = score > 150 ? "Bu bahçe onaylandı, Şef. Tebrikler 🏗️" : score > 60 ? "Fena değil, mimar gözü belli 😅" : "Isınma turuydu, Şef. Bir daha?";
    over.hidden = false; burst(40);
  }
  function msg(t) { msgEl.textContent = t; }

  /* ---------- tepsi ---------- */
  function newPiece() { return { shape: pick(SHAPES), color: pick(COLORS) }; }
  function fillTray() { tray = [newPiece(), newPiece(), newPiece()]; renderTray(); }
  function pieceNode(p, mini) {
    var rows = 0, cols = 0;
    p.shape.forEach(function (s) { rows = Math.max(rows, s[0] + 1); cols = Math.max(cols, s[1] + 1); });
    var size = mini ? Math.max(16, Math.min(26, Math.floor(cellPx * 0.66))) : cellPx;
    var g = mini ? 2 : gap;
    var el = document.createElement("div"); el.className = "piece";
    el.style.width = (cols * size + (cols - 1) * g) + "px"; el.style.height = (rows * size + (rows - 1) * g) + "px";
    p.shape.forEach(function (s) {
      var d = document.createElement("i"); d.className = "f-" + p.color;
      d.style.width = size + "px"; d.style.height = size + "px"; d.style.left = (s[1] * (size + g)) + "px"; d.style.top = (s[0] * (size + g)) + "px";
      var img = flowerImg(p.color, size); if (img) d.appendChild(img);
      el.appendChild(d);
    });
    return el;
  }
  function renderTray() {
    trayEl.innerHTML = "";
    tray.forEach(function (p, i) {
      var slot = document.createElement("div"); slot.className = "slot" + (i === selected ? " sel" : "");
      if (p) { var node = pieceNode(p, true); node.dataset.i = i; slot.appendChild(node); if (!anyFits(p.shape)) slot.classList.add("dead"); }
      trayEl.appendChild(slot);
    });
  }

  /* ---------- sürükle / dokun ---------- */
  var drag = null;
  function cellFromPoint(x, y) {
    var rect = board.getBoundingClientRect();
    return { r: Math.floor((y - rect.top - 6) / (cellPx + gap)), c: Math.floor((x - rect.left - 6) / (cellPx + gap)) };
  }
  function closestPiece(t) { while (t && t !== trayEl) { if (t.classList && t.classList.contains("piece")) return t; t = t.parentNode; } return null; }
  trayEl.addEventListener("pointerdown", function (e) {
    var node = closestPiece(e.target); if (!node) return;
    e.preventDefault();
    var i = +node.dataset.i, p = tray[i]; if (!p) return;
    var ghost = pieceNode(p, false); ghost.className = "piece ghost";
    document.body.appendChild(ghost);
    drag = { i: i, p: p, ghost: ghost, moved: false, x0: e.clientX, y0: e.clientY, w: parseFloat(ghost.style.width), h: parseFloat(ghost.style.height) };
    moveGhost(e.clientX, e.clientY);
    try { trayEl.setPointerCapture(e.pointerId); } catch (err) {}
  });
  function moveGhost(x, y) {
    var ox = x - drag.w / 2, oy = y - drag.h - 28;   /* parça parmağın üstünde dursun */
    drag.ghost.style.left = ox + "px"; drag.ghost.style.top = oy + "px";
    var cp = cellFromPoint(ox + cellPx / 2, oy + cellPx / 2);
    if (cp.r >= 0 && cp.c >= 0 && cp.r < N && cp.c < N) preview(drag.p.shape, cp.r, cp.c, canPlace(drag.p.shape, cp.r, cp.c)); else clearPreview();
    drag.cp = cp;
  }
  trayEl.addEventListener("pointermove", function (e) {
    if (!drag) return;
    if (Math.abs(e.clientX - drag.x0) > 6 || Math.abs(e.clientY - drag.y0) > 6) drag.moved = true;
    moveGhost(e.clientX, e.clientY);
  });
  function endDrag() {
    if (!drag) return;
    var d = drag; drag = null;
    if (d.ghost.parentNode) d.ghost.parentNode.removeChild(d.ghost);
    clearPreview();
    if (!d.moved) { selected = (selected === d.i) ? -1 : d.i; renderTray(); msg(selected >= 0 ? "Şimdi plana dokun, Şef 👇" : ""); return; }
    var cp = d.cp;
    if (cp && cp.r >= 0 && cp.c >= 0 && cp.r < N && cp.c < N) place(d.i, cp.r, cp.c); else msg("Plana bırak, Şef");
  }
  trayEl.addEventListener("pointerup", endDrag);
  trayEl.addEventListener("pointercancel", endDrag);
  board.addEventListener("click", function (e) {
    if (selected < 0) { msg("Önce tepsiden bir çiçek seç 👇"); return; }
    var t = e.target; while (t && t !== board && !(t.classList && t.classList.contains("cell"))) t = t.parentNode;
    if (!t || t === board) return;
    place(selected, +t.dataset.r, +t.dataset.c);
  });

  /* ---------- başlat ---------- */
  function start() {
    score = 0; moves = 0; scoreEl.textContent = 0; over.hidden = true; selected = -1;
    buildBoard(); fillTray(); drawVines();
    msg("Sürükle ya da seç, sonra plana dokun 🌿");
  }
  $("restart").onclick = start; $("again2").onclick = start;
  function refit() { measure(); paint(); renderTray(); drawVines(); }
  addEventListener("resize", refit);
  addEventListener("orientationchange", function () { setTimeout(refit, 250); });
  /* iOS: araç çubukları yerleşince ölçüyü bir kez daha al */
  addEventListener("load", function () { setTimeout(refit, 300); });
  /* test kancası: oyun.html#test */
  if (location.hash === "#test") {
    window.__sef = {
      fillRow: function (r, n, col) { for (var c = 0; c < n; c++) grid[r][c] = col || "lav"; paint(); },
      fillAll: function () { for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) grid[r][c] = "lav"; paint(); },
      setTray: function (shapes, col) { tray = shapes.map(function (s) { return { shape: s, color: col || "peo" }; }); selected = -1; renderTray(); },
      check: checkOver, score: function () { return score; }, grid: function () { return grid; }
    };
  }
  start();
})();
