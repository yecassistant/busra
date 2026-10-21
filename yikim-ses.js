/* Yıkım – ses efektleri (ayrı modül). yk_ses=0 ile kapanır.
   Kırılma sesleri 3 aile: cam (ince, parlak), ahşap (tok marimba), baloncuk (kayan "pop"). Aynı aile art arda gelmez;
   tek basışta kırılan her kat pentatonik dizide bir nota yukarı çıkar (seri büyüdükçe melodi yükselir, bırakınca başa döner).
   Ateş modunda kırılmalar daha dolgun ve alçak. Siyaha çarpma: tok çatlama + düşüş. Seviye bitişi: kısa arpej. */
(function () {
  "use strict";
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) { window.YkSes = { play: function () {}, toggle: function () { return false; }, on: function () { return false; } }; return; }
  var on = true, ctx = null, master = null, touched = false, sonAile = -1, sonCal = 0;
  try { on = localStorage.getItem("yk_ses") !== "0"; } catch (e) {}
  function init() { if (ctx || !on) return; try { try { ctx = new AC({ latencyHint: "interactive" }); } catch (e1) { ctx = new AC(); } var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 6; master = ctx.createGain(); master.gain.value = 0.8; master.connect(comp); comp.connect(ctx.destination); } catch (e) { ctx = null; } }
  function ready() { if (!on || !touched) return false; init(); if (!ctx) return false; if (ctx.state !== "running") { try { ctx.resume(); } catch (e) {} return false; } return true; }
  function tone(type, hz, t, a, peak, dec, glide) { var o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(hz, t); if (glide) o.frequency.exponentialRampToValueAtTime(Math.max(30, hz * glide), t + a + dec); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); o.connect(g); g.connect(master); o.start(t); o.stop(t + a + dec + 0.05); }
  var PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
  var AILE = [
    function (hz, t, guc) { tone("sine", hz * 2, t, 0.002, 0.07 * guc, 0.16, 0.97); tone("triangle", hz * 4.02, t, 0.001, 0.025 * guc, 0.07); tone("sine", hz * 6.1, t + 0.004, 0.001, 0.012 * guc, 0.05); },          /* cam */
    function (hz, t, guc) { tone("sine", hz, t, 0.002, 0.1 * guc, 0.15); tone("sine", hz * 4, t, 0.001, 0.02 * guc, 0.05); tone("triangle", 1300 + hz * 0.4, t, 0.001, 0.03 * guc, 0.012); },                        /* ahşap */
    function (hz, t, guc) { tone("sine", hz * 1.6, t, 0.003, 0.09 * guc, 0.09, 0.55); tone("sine", hz * 3.2, t + 0.01, 0.002, 0.02 * guc, 0.05, 0.7); }                                                                /* baloncuk */
  ];
  var S = {
    kir: function (o) {
      var t = ctx.currentTime, seri = Math.max(0, (o && o.seri) || 0), atesli = o && o.ates, aile;
      do { aile = Math.floor(Math.random() * AILE.length); } while (aile === sonAile && AILE.length > 1);
      sonAile = aile;
      var hz = 392 * Math.pow(2, PENTA[seri % PENTA.length] / 12) * (seri >= PENTA.length ? 2 : 1) * (0.99 + Math.random() * 0.02);
      if (atesli) { hz *= 0.5; tone("sine", 70, t, 0.003, 0.09, 0.18, 0.6); }
      AILE[aile](hz, t, 1);
    },
    sek: function () { var t = ctx.currentTime; tone("sine", 180, t, 0.003, 0.05, 0.08, 0.8); },
    olum: function () { var t = ctx.currentTime; tone("square", 140, t, 0.002, 0.06, 0.08, 0.5); tone("sine", 90, t, 0.004, 0.14, 0.35, 0.6); tone("sine", 392, t + 0.12, 0.01, 0.05, 0.3); tone("sine", 311, t + 0.3, 0.01, 0.05, 0.35); tone("sine", 233, t + 0.5, 0.01, 0.05, 0.6); },
    ates: function () { var t = ctx.currentTime; tone("sawtooth", 120, t, 0.05, 0.04, 0.5, 3.2); tone("sine", 240, t, 0.05, 0.05, 0.45, 2.5); },
    seviye: function () { var t = ctx.currentTime; [0, 4, 7, 12, 16].forEach(function (s, i) { tone("sine", 523.25 * Math.pow(2, s / 12), t + i * 0.09, 0.005, 0.07, 0.45); tone("triangle", 1046.5 * Math.pow(2, s / 12), t + i * 0.09, 0.003, 0.015, 0.2); }); },
    rekor: function () { var t = ctx.currentTime; [0, 7, 12, 19].forEach(function (s, i) { tone("triangle", 659.25 * Math.pow(2, s / 12), t + i * 0.1, 0.005, 0.05, 0.5); }); }
  };
  var pend = null, keep = null;
  function keepAlive() { if (keep || !ctx) return; try { var o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 30; g.gain.value = 0.0001; o.connect(g); g.connect(ctx.destination); o.start(); keep = o; } catch (e) {} }
  function retry() { [40, 150, 350].forEach(function (d) { setTimeout(function () { if (pend && ctx && ctx.state === "running") { var q = pend; pend = null; if (Date.now() - q.t < 600) try { S[q.n](q.o); } catch (e) {} } }, d); }); }
  function unlock() { touched = true; if (!on) return; init(); if (!ctx) return; keepAlive(); if (ctx.state !== "running") { try { ctx.resume(); var sb = ctx.createBufferSource(); sb.buffer = ctx.createBuffer(1, 1, 22050); sb.connect(ctx.destination); sb.start(0); } catch (e) {} } if (pend) retry(); }
  ["pointerdown", "touchend", "pointerup", "click", "keydown"].forEach(function (ev) { document.addEventListener(ev, unlock, { capture: true, passive: true }); });
  document.addEventListener("visibilitychange", function () { if (document.hidden && ctx) try { ctx.suspend(); } catch (e) {} });
  window.YkSes = {
    play: function (n, o) {
      if (!S[n]) return;
      if (n === "kir") { var now = Date.now(); if (now - sonCal < 38) return; sonCal = now; }              /* çok hızlı kırılmada sesler üst üste binmesin */
      if (!ready()) { if (on) { pend = { n: n, o: o, t: Date.now() }; retry(); } return; }
      try { S[n](o); } catch (e) {}
    },
    toggle: function () { on = !on; try { localStorage.setItem("yk_ses", on ? "1" : "0"); } catch (e) {} if (on) { touched = true; init(); if (ctx) try { ctx.resume(); } catch (e) {} } return on; },
    on: function () { return on; }
  };
})();
