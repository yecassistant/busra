/* Çiftlik – sesler (Web Audio ile üretilir, dosya yok). cf_ses=0 ile kapanır.
   dokun, ek, hasat, topla, altin, seviye, tavuk, inek, kamyon, uretim, hata, su; arada uzaktan kuş cıvıltısı. */
(function () {
  "use strict";
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) { window.CfSes = { play: function () {}, toggle: function () { return false; }, on: function () { return false; } }; return; }
  var on = true, ctx = null, master = null, touched = false, gurultu = null, sonCal = {};
  try { on = localStorage.getItem("cf_ses") !== "0"; } catch (e) {}
  function init() {
    if (ctx || !on) return;
    try {
      try { ctx = new AC({ latencyHint: "interactive" }); } catch (e1) { ctx = new AC(); }
      var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 5;
      master = ctx.createGain(); master.gain.value = 0.75; master.connect(comp); comp.connect(ctx.destination);
      var n = ctx.sampleRate * 0.6, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0); for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; gurultu = b;
    } catch (e) { ctx = null; }
  }
  function ready() { if (!on || !touched) return false; init(); if (!ctx) return false; if (ctx.state !== "running") { try { ctx.resume(); } catch (e) {} return false; } return true; }
  function tone(type, hz, t, a, peak, dec, glide, hedef) {
    var o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(hz, t);
    if (glide) o.frequency.exponentialRampToValueAtTime(Math.max(30, hz * glide), t + a + dec);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
    o.connect(g); g.connect(hedef || master); o.start(t); o.stop(t + a + dec + 0.05); return o;
  }
  function hisirti(t, sure, f, q, peak, tip) {
    var s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = gurultu;
    fl.type = tip || "bandpass"; fl.frequency.value = f; fl.Q.value = q || 1;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
    s.connect(fl); fl.connect(g); g.connect(master); s.start(t); s.stop(t + sure + 0.05);
  }
  var S = {
    dokun: function () { var t = ctx.currentTime; tone("sine", 620, t, 0.003, 0.05, 0.07, 1.5); },
    ek: function () { var t = ctx.currentTime; tone("triangle", 240, t, 0.002, 0.08, 0.12, 0.7); hisirti(t, 0.08, 900, 0.8, 0.05); },
    hasat: function (o) { var t = ctx.currentTime, k = (o && o.k) || 0, f = 784 * Math.pow(2, [0, 2, 4, 7, 9, 12][k % 6] / 12); hisirti(t, 0.16, 3200, 0.7, 0.07, "highpass"); tone("sine", f, t + 0.02, 0.003, 0.07, 0.22); tone("sine", f * 1.5, t + 0.05, 0.003, 0.03, 0.16); },
    topla: function () { var t = ctx.currentTime; tone("sine", 880, t, 0.003, 0.06, 0.12); tone("sine", 1318.5, t + 0.07, 0.003, 0.06, 0.2); },
    altin: function () { var t = ctx.currentTime; tone("square", 987.8, t, 0.002, 0.035, 0.07); tone("square", 1318.5, t + 0.07, 0.002, 0.04, 0.28); tone("sine", 2637, t + 0.07, 0.002, 0.015, 0.2); },
    seviye: function () { var t = ctx.currentTime; [0, 4, 7, 12, 16, 19].forEach(function (s, i) { tone("triangle", 523.25 * Math.pow(2, s / 12), t + i * 0.09, 0.005, 0.07, 0.5); tone("sine", 1046.5 * Math.pow(2, s / 12), t + i * 0.09, 0.004, 0.02, 0.3); }); hisirti(t + 0.5, 0.6, 6000, 0.5, 0.025, "highpass"); },
    tavuk: function () {
      var t = ctx.currentTime, bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1300; bp.Q.value = 2.5; bp.connect(master);
      [0, 0.13, 0.24].forEach(function (d, i) { tone("sawtooth", 620 + i * 30, t + d, 0.004, 0.09, 0.06, 0.8, bp); });
      tone("sawtooth", 560, t + 0.4, 0.02, 0.1, 0.24, 1.45, bp);
    },
    inek: function () {
      var t = ctx.currentTime, o = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
      o.type = "sawtooth"; o.frequency.setValueAtTime(150, t); o.frequency.linearRampToValueAtTime(128, t + 0.35); o.frequency.linearRampToValueAtTime(104, t + 1.0);
      lfo.frequency.value = 5.5; lg.gain.value = 3; lfo.connect(lg); lg.connect(o.frequency);
      lp.type = "lowpass"; lp.frequency.setValueAtTime(420, t); lp.frequency.linearRampToValueAtTime(900, t + 0.3); lp.frequency.linearRampToValueAtTime(380, t + 1.0); lp.Q.value = 3;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.12); g.gain.setValueAtTime(0.16, t + 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.15);
      o.connect(lp); lp.connect(g); g.connect(master); o.start(t); lfo.start(t); o.stop(t + 1.2); lfo.stop(t + 1.2);
    },
    kamyon: function () { var t = ctx.currentTime; [0, 0.2].forEach(function (d) { tone("square", 349.2, t + d, 0.005, 0.045, 0.12); tone("square", 440, t + d, 0.005, 0.035, 0.12); }); tone("sawtooth", 70, t + 0.3, 0.05, 0.05, 0.7, 1.6); },
    uretim: function () { var t = ctx.currentTime; tone("triangle", 180, t, 0.002, 0.08, 0.1, 0.8); tone("square", 1200, t + 0.06, 0.001, 0.02, 0.03); tone("triangle", 260, t + 0.12, 0.002, 0.06, 0.12); },
    hata: function () { var t = ctx.currentTime; tone("triangle", 196, t, 0.004, 0.07, 0.12, 0.85); tone("triangle", 155, t + 0.12, 0.004, 0.06, 0.16, 0.85); },
    su: function () { var t = ctx.currentTime; tone("sine", 280, t, 0.003, 0.08, 0.12, 3.2); hisirti(t + 0.03, 0.18, 1800, 1.2, 0.03); },
    kus: function () { var t = ctx.currentTime, f = 2400 + Math.random() * 1400; for (var i = 0; i < 2 + Math.floor(Math.random() * 3); i++) tone("sine", f * (1 + i * 0.04), t + i * 0.11, 0.004, 0.012, 0.07, 1.25); }
  };
  var pend = null, keep = null;
  function keepAlive() { if (keep || !ctx) return; try { var o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 30; g.gain.value = 0.0001; o.connect(g); g.connect(ctx.destination); o.start(); keep = o; } catch (e) {} }
  function retry() { [40, 150, 350].forEach(function (d) { setTimeout(function () { if (pend && ctx && ctx.state === "running") { var q = pend; pend = null; if (Date.now() - q.t < 600) try { S[q.n](q.o); } catch (e) {} } }, d); }); }
  function unlock() { touched = true; if (!on) return; init(); if (!ctx) return; keepAlive(); if (ctx.state !== "running") { try { ctx.resume(); var sb = ctx.createBufferSource(); sb.buffer = ctx.createBuffer(1, 1, 22050); sb.connect(ctx.destination); sb.start(0); } catch (e) {} } if (pend) retry(); }
  ["pointerdown", "touchend", "pointerup", "click", "keydown"].forEach(function (ev) { document.addEventListener(ev, unlock, { capture: true, passive: true }); });
  document.addEventListener("visibilitychange", function () { if (document.hidden && ctx) try { ctx.suspend(); } catch (e) {} });
  setInterval(function () { if (on && touched && ctx && ctx.state === "running" && !document.hidden && Math.random() < 0.35) try { S.kus(); } catch (e) {} }, 9000);
  window.CfSes = {
    play: function (n, o) {
      if (!S[n]) return;
      var now = Date.now(); if (sonCal[n] && now - sonCal[n] < (n === "hasat" || n === "ek" ? 45 : 90)) return; sonCal[n] = now;
      if (!ready()) { if (on) { pend = { n: n, o: o, t: now }; retry(); } return; }
      try { S[n](o); } catch (e) {}
    },
    toggle: function () { on = !on; try { localStorage.setItem("cf_ses", on ? "1" : "0"); } catch (e) {} if (on) { touched = true; init(); if (ctx) try { ctx.resume(); } catch (e) {} } return on; },
    on: function () { return on; }
  };
})();
