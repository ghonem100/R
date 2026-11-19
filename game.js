/* =====================================================================
   PROJECT: BESTIE — مطاردة مشمش 🐈
   6 ميني جيمز أكشن + قصة كوميدية + رسالة في الآخر
   ===================================================================== */
(() => {
'use strict';
const C = window.CONFIG || {};
C.player = C.player || {}; C.owner = C.owner || {};

/* ---------------- helpers ---------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const wait = ms => new Promise(r => setTimeout(r, ms));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const NAME = C.player.name || 'صاحبتي', OWNER = C.owner.name || 'أنا';
const T = s => String(s ?? '').replace(/\{name\}/g, NAME).replace(/\{owner\}/g, OWNER);
const eT = s => esc(T(s));
const h = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const DIFF = clamp(Number(C.difficulty) || 1, .6, 1.5);
Object.entries(C.colors || {}).forEach(([k, v]) => document.documentElement.style.setProperty('--' + k, v));

/* ---------------- save ---------------- */
const KEY = 'bestie-chase-v1';
const store = {
  load() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } },
  save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} },
  clear() { try { localStorage.removeItem(KEY); } catch (e) {} }
};
const fresh = () => ({ stage: 0, score: 0, stats: {}, fails: 0 });
let S = fresh();
let soundOn = C.sound !== false;
try { const sv = localStorage.getItem(KEY + '-sound'); if (sv !== null) soundOn = sv === '1'; } catch (e) {}

/* ---------------- sound (Web Audio) ---------------- */
const SILENT_WAV = 'data:audio/wav;base64,UklGRvQHAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdAHAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==';
const SFX = {
  ac: null, nb: null, out: null, html: null,
  init() {
    // iOS: خلي الصوت يشتغل حتى لو الموبايل على الصامت
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    if (!this.html) { try { const a = new Audio(SILENT_WAV); a.loop = true; a.setAttribute('playsinline', ''); a.volume = .01; this.html = a; } catch (e) {} }
    if (this.html && this.html.paused) { const p = this.html.play(); if (p && p.catch) p.catch(() => {}); }
    if (!this.ac) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
        this.ac = new AC();
        const comp = this.ac.createDynamicsCompressor(); comp.threshold.value = -10; comp.ratio.value = 4;
        this.out = this.ac.createGain(); this.out.gain.value = 2.2; this.out.connect(comp); comp.connect(this.ac.destination);
        const b = this.ac.createBuffer(1, this.ac.sampleRate * .6, this.ac.sampleRate), d = b.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; this.nb = b;
      } catch (e) { this.ac = null; return; }
    }
    if (this.ac.state !== 'running') { try { this.ac.resume(); } catch (e) {} }
    try { const b = this.ac.createBuffer(1, 1, 22050), s = this.ac.createBufferSource(); s.buffer = b; s.connect(this.ac.destination); s.start(0); } catch (e) {}
  },
  tone(f, d = .15, type = 'sine', v = .1, slide = 0, delay = 0) {
    if (!this.ac || !soundOn) return;
    if (this.ac.state !== 'running') { try { this.ac.resume(); } catch (e) {} }
    try { const t = this.ac.currentTime + delay, o = this.ac.createOscillator(), g = this.ac.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(g); g.connect(this.out); o.start(t); o.stop(t + d + .03); } catch (e) {}
  },
  noise(d = .2, v = .08, freq = 1200, delay = 0) {
    if (!this.ac || !soundOn || !this.nb) return;
    try { const t = this.ac.currentTime + delay, s = this.ac.createBufferSource(), f = this.ac.createBiquadFilter(), g = this.ac.createGain();
      s.buffer = this.nb; f.type = 'bandpass'; f.frequency.value = freq; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      s.connect(f); f.connect(g); g.connect(this.out); s.start(t); s.stop(t + d); } catch (e) {}
  },
  key() { this.tone(rand(900, 1400), .025, 'square', .018); },
  click() { this.tone(720, .06, 'triangle', .08); },
  ok() { [660, 880, 1175].forEach((f, i) => this.tone(f, .2, 'triangle', .1, 0, i * .08)); },
  bad() { this.tone(170, .32, 'sawtooth', .07, 85); },
  hit() { this.tone(140, .25, 'square', .09, 60); this.noise(.15, .12, 400); },
  jump() { this.tone(380, .16, 'square', .05, 760); },
  flap() { this.tone(520, .09, 'triangle', .06, 780); },
  coin() { this.tone(988, .07, 'square', .05); this.tone(1319, .12, 'square', .05, 0, .06); },
  whack() { this.noise(.08, .2, 900); this.tone(220, .1, 'square', .08, 110); },
  slice() { this.noise(.12, .12, 3500); this.tone(1400, .08, 'sine', .04, 2400); },
  tap(p) { this.tone(300 + p * 500, .05, 'triangle', .05); },
  meow() { this.tone(700, .12, 'sine', .07, 1100); this.tone(1100, .25, 'sine', .07, 600, .12); },
  tick() { this.tone(880, .08, 'square', .06); },
  go() { this.tone(1320, .35, 'square', .07); },
  whoosh() { this.noise(.5, .1, 700); this.tone(200, .5, 'sine', .05, 900); },
  glitch() { for (let i = 0; i < 6; i++) { this.noise(.06, .14, rand(300, 4000), i * .05); this.tone(rand(80, 900), .05, 'square', .04, 0, i * .05); } },
  alarm() { for (let i = 0; i < 3; i++) this.tone(600, .3, 'sawtooth', .05, 1200, i * .32); },
  unlock() { [392, 523, 659, 784, 1047].forEach((f, i) => this.tone(f, .3, 'sine', .1, 0, i * .1)); },
  fanfare() { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => this.tone(f, .35, 'triangle', .09, 0, i * .13)); },
  lose() { [392, 349, 311, 262].forEach((f, i) => this.tone(f, .35, 'sawtooth', .05, 0, i * .22)); }
};

['pointerdown', 'touchend', 'click', 'keydown'].forEach(ev => document.addEventListener(ev, () => { if (soundOn) SFX.init(); }, { capture: true, passive: true }));
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { try { SFX.html && SFX.html.pause(); } catch (e) {} }
  else if (soundOn && SFX.ac) SFX.init();
});

/* ---------------- typewriter (tap to skip) ---------------- */
let skip = false;
document.addEventListener('pointerdown', () => { skip = true; }, true);
async function type(el, text, { speed = 26, sound = true } = {}) {
  skip = false; el.textContent = ''; el.classList.add('typing'); let i = 0;
  for (const ch of [...text]) {
    if (skip) { el.textContent = text; break; }
    el.textContent += ch; if (sound && ch.trim() && i % 2 === 0) SFX.key(); i++;
    await wait(ch === '\n' ? 200 : /[،.؟!…]/.test(ch) ? 110 : speed);
  }
  el.classList.remove('typing');
}

/* ---------------- UI feedback ---------------- */
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 1800); }
function flash(kind) { const f = $('#flash'); f.className = 'flash ' + kind; void f.offsetWidth; f.classList.add('on'); }
function modal({ title = '', body = '', buttons = [{ label: 'تمام', value: true, cls: 'btn-primary' }] }) {
  return new Promise(res => {
    const m = h(`<div class="modal"><div class="panel">${title ? `<h3>${title}</h3>` : ''}<div class="m-body">${body}</div><div class="row"></div></div></div>`);
    const row = $('.row', m);
    buttons.forEach(b => { const btn = h(`<button class="btn ${b.cls || 'btn-ghost'}">${b.label}</button>`); btn.onclick = () => { SFX.click(); m.remove(); res(b.value); }; row.appendChild(btn); });
    document.body.appendChild(m);
  });
}
let cameoT;
function cameo(text) {
  let c = $('#cameo');
  if (!c) { c = h('<div class="cameo" id="cameo"><div class="cat">🐈</div><div class="bubble"></div></div>'); document.body.appendChild(c); }
  $('.bubble', c).textContent = T(text); c.classList.remove('on'); void c.offsetWidth; c.classList.add('on'); SFX.meow();
  clearTimeout(cameoT); cameoT = setTimeout(() => c.classList.remove('on'), 3400);
}

/* ---------------- install as app (PWA) ---------------- */
let deferredPrompt = null;
const isTop = (() => { try { return window.self === window.top; } catch (e) { return false; } })();
const secure = location.protocol === 'https:' || location.hostname === 'localhost';
const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; });
if ('serviceWorker' in navigator && isTop && secure) addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
async function installApp() {
  SFX.click();
  if (deferredPrompt) { deferredPrompt.prompt(); try { const r = await deferredPrompt.userChoice; if (r.outcome === 'accepted') toast('اتنزّلت! هتلاقيها على الشاشة الرئيسية 📲'); } catch (e) {} deferredPrompt = null; return; }
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  await modal({ title: '📲 نزّليها كتطبيق',
    body: ios ? 'من سفاري:\n1️⃣ دوسي على زرار المشاركة <b>⬆️</b>\n2️⃣ اختاري <b>Add to Home Screen</b>\n3️⃣ دوسي <b>Add</b>\n\nوهتلاقي اللعبة جنب باقي التطبيقات 🐈'
      : 'من كروم:\n1️⃣ دوسي على <b>⋮</b> اللي فوق\n2️⃣ اختاري <b>Install app</b> أو <b>Add to Home screen</b>\n\nوهتلاقي اللعبة جنب باقي التطبيقات 🐈',
    buttons: [{ label: 'تمام 👍', value: 1, cls: 'btn-primary' }] });
}

/* ---------------- background particles + confetti ---------------- */
const bg = $('#bg'), bctx = bg.getContext('2d'), fx = $('#fx'), fctx = fx.getContext('2d');
let BW, BH; const parts = [];
function sizeBg() { const d = Math.min(devicePixelRatio || 1, 2); BW = innerWidth; BH = innerHeight; [bg, fx].forEach(c => { c.width = BW * d; c.height = BH * d; }); bctx.setTransform(d, 0, 0, d, 0, 0); fctx.setTransform(d, 0, 0, d, 0, 0); }
addEventListener('resize', sizeBg); sizeBg();
for (let i = 0; i < 40; i++) parts.push({ x: Math.random() * BW, y: Math.random() * BH, vx: rand(-.25, .25), vy: rand(-.25, .25), r: rand(.8, 2.2) });
(function bgLoop() {
  if (!document.body.classList.contains('playing')) {
    bctx.clearRect(0, 0, BW, BH);
    for (const p of parts) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > BW) p.vx *= -1; if (p.y < 0 || p.y > BH) p.vy *= -1;
      bctx.fillStyle = 'rgba(34,211,238,.7)'; bctx.beginPath(); bctx.arc(p.x, p.y, p.r, 0, 7); bctx.fill(); }
    for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) {
      const a = parts[i], b = parts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 120) { bctx.strokeStyle = `rgba(139,92,246,${(1 - d / 120) * .35})`; bctx.beginPath(); bctx.moveTo(a.x, a.y); bctx.lineTo(b.x, b.y); bctx.stroke(); }
    }
  }
  requestAnimationFrame(bgLoop);
})();
let confs = [], confRunning = false;
function confetti(n = 120) {
  const cols = ['#8b5cf6', '#22d3ee', '#ff3b6b', '#ffd166', '#34d399', '#ffffff'];
  for (let i = 0; i < n; i++) confs.push({ x: BW / 2 + rand(-60, 60), y: BH * .45, vx: rand(-9, 9), vy: rand(-15, -4), w: rand(5, 10), hh: rand(8, 15), r: rand(0, 6), vr: rand(-.3, .3), c: pick(cols), life: 1 });
  if (!confRunning) { confRunning = true; requestAnimationFrame(confLoop); }
}
function confLoop() {
  fctx.clearRect(0, 0, BW, BH);
  confs = confs.filter(p => p.life > 0 && p.y < BH + 40);
  for (const p of confs) { p.vy += .32; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= .004;
    fctx.save(); fctx.translate(p.x, p.y); fctx.rotate(p.r); fctx.globalAlpha = Math.min(1, p.life * 2); fctx.fillStyle = p.c; fctx.fillRect(-p.w / 2, -p.hh / 2, p.w, p.hh); fctx.restore(); }
  if (confs.length) requestAnimationFrame(confLoop); else { confRunning = false; fctx.clearRect(0, 0, BW, BH); }
}

/* ---------------- emoji sprite cache ---------------- */
const EC = new Map();
function emo(ctx, e, x, y, size, rot = 0, alpha = 1, flip = false) {
  const k = e + '|' + Math.round(size);
  let c = EC.get(k);
  if (!c) {
    const s = Math.ceil(size * 1.35), d = 2; c = document.createElement('canvas'); c.width = c.height = s * d;
    const x2 = c.getContext('2d'); x2.scale(d, d);
    x2.font = `${size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`; x2.textAlign = 'center'; x2.textBaseline = 'middle';
    x2.fillText(e, s / 2, s / 2 + size * .06); c._s = s; EC.set(k, c);
  }
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); if (rot) ctx.rotate(rot); if (flip) ctx.scale(-1, 1);
  ctx.drawImage(c, -c._s / 2, -c._s / 2, c._s, c._s); ctx.restore();
}
function rrect(ctx, x, y, w, hh, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + hh, r); ctx.arcTo(x + w, y + hh, x, y + hh, r); ctx.arcTo(x, y + hh, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

/* ===================================================================
   ARENA — إطار تشغيل الميني جيمز
   =================================================================== */
function runArena(game) { return new Promise(resolve => {
  document.body.classList.add('playing');
  const ar = h(`<div class="arena"><canvas></canvas>
    <div class="g-top"><div class="g-hearts"></div><div class="g-bar"><i></i></div><div class="g-time en"></div></div>
    <div class="g-hint">${esc(game.hint)}</div><div class="g-count"></div></div>`);
  document.body.appendChild(ar);
  const hud = $('#hud'); ar.style.top = hud.getBoundingClientRect().bottom + 'px';
  const cv = $('canvas', ar), ctx = cv.getContext('2d');
  const g = { t: 0, hearts: 3, inv: 0, progress: 0, points: 0, ended: false, running: false, shake: 0, pops: [], parts: [], stats: {}, keys: {}, ptr: { down: false, x: 0, y: 0 }, diff: DIFF };
  const size = () => { const d = Math.min(devicePixelRatio || 1, 2); g.W = ar.clientWidth; g.H = ar.clientHeight; cv.width = g.W * d; cv.height = g.H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  size();
  g.pop = (text, x, y, color = '#fff', sz = 22) => g.pops.push({ text, x, y, color, sz, life: 1 });
  g.burst = (x, y, e, n = 8, spd = 260) => { for (let i = 0; i < n; i++) { const a = rand(0, 6.28), s = rand(.4, 1) * spd; g.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 120, e, life: 1, sz: rand(14, 24), rot: rand(0, 6), vr: rand(-6, 6) }); } };
  g.splat = (x, y, color, n = 10) => { for (let i = 0; i < n; i++) { const a = rand(0, 6.28), s = rand(60, 300); g.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 80, color, life: 1, sz: rand(3, 7) }); } };
  g.hit = msg => {
    if (g.inv > 0 || g.ended) return false;
    g.hearts--; g.inv = 1.3; g.shake = 14; SFX.hit(); flash('bad'); if (navigator.vibrate) try { navigator.vibrate(80); } catch (e) {}
    if (msg) g.pop(msg, g.W / 2, g.H * .3, '#ff8fab', 22);
    renderTop(); if (g.hearts <= 0) end(false); return true;
  };
  g.add = n => { g.points += n; };
  g.stat = (k, n = 1) => { g.stats[k] = (g.stats[k] || 0) + n; };
  g.win = () => end(true);

  const hearts = $('.g-hearts', ar), bar = $('.g-bar i', ar), time = $('.g-time', ar);
  function renderTop() {
    hearts.textContent = '❤️'.repeat(Math.max(0, g.hearts)) + '🖤'.repeat(3 - Math.max(0, g.hearts));
    bar.style.width = clamp(g.progress, 0, 1) * 100 + '%';
    time.textContent = game.dur ? Math.max(0, Math.ceil(game.dur - g.t)) + 's' : game.counter ? game.counter(g) : '';
  }

  const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const pd = e => { e.preventDefault(); const [x, y] = pos(e); g.ptr = { down: true, x, y }; if (g.running) game.down?.(g, x, y); };
  const pm = e => { const [x, y] = pos(e); g.ptr.x = x; g.ptr.y = y; if (g.running) game.move?.(g, x, y); };
  const pu = () => { g.ptr.down = false; if (g.running) game.up?.(g); };
  const kd = e => { g.keys[e.key] = true; if ((e.key === ' ' || e.key === 'ArrowUp') && g.running) { e.preventDefault(); game.down?.(g, g.W / 2, g.H / 2); } };
  const ku = e => { g.keys[e.key] = false; };
  const vis = () => { if (document.hidden) paused = true; else { paused = false; last = performance.now(); } };
  cv.addEventListener('pointerdown', pd); addEventListener('pointermove', pm); addEventListener('pointerup', pu); addEventListener('pointercancel', pu);
  addEventListener('keydown', kd); addEventListener('keyup', ku); document.addEventListener('visibilitychange', vis);
  addEventListener('resize', size);

  game.init(g); renderTop();
  if (location.hash === '#qa') window.__g = g;
  let last = performance.now(), raf, paused = false, topT = 0;
  function frame(now) {
    const dt = Math.min(.033, (now - last) / 1000); last = now;
    if (!paused) {
      if (g.running && !g.ended) {
        g.t += dt; if (g.inv > 0) g.inv -= dt;
        game.update(g, dt);
        if (game.dur && g.t >= game.dur && !g.ended) { if (game.timeUp) end(game.timeUp(g)); else end(true); }
      }
      ctx.clearRect(0, 0, g.W, g.H); ctx.save();
      if (g.shake > 0) { ctx.translate(rand(-g.shake, g.shake), rand(-g.shake, g.shake)); g.shake *= .86; if (g.shake < .4) g.shake = 0; }
      game.draw(g, ctx);
      for (let i = g.parts.length - 1; i >= 0; i--) { const p = g.parts[i]; p.vy += 700 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt * 1.2;
        if (p.e) emo(ctx, p.e, p.x, p.y, p.sz, p.rot += p.vr * dt, Math.max(0, p.life)); else { ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.sz, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
        if (p.life <= 0) g.parts.splice(i, 1); }
      for (let i = g.pops.length - 1; i >= 0; i--) { const p = g.pops[i]; p.y -= 45 * dt; p.life -= dt * .8;
        ctx.globalAlpha = clamp(p.life * 1.5, 0, 1); ctx.font = `700 ${p.sz}px "Readex Pro",sans-serif`; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.55)';
        ctx.strokeText(p.text, p.x, p.y); ctx.fillStyle = p.color; ctx.fillText(p.text, p.x, p.y); ctx.globalAlpha = 1; if (p.life <= 0) g.pops.splice(i, 1); }
      ctx.restore();
      if ((topT += dt) > .1) { topT = 0; renderTop(); }
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  // countdown
  (async () => {
    const cEl = $('.g-count', ar);
    for (const n of ['3', '2', '1']) { cEl.textContent = n; cEl.classList.remove('on'); void cEl.offsetWidth; cEl.classList.add('on'); SFX.tick(); await wait(650); }
    cEl.textContent = 'يلا!'; cEl.classList.remove('on'); void cEl.offsetWidth; cEl.classList.add('on'); SFX.go();
    g.running = true; last = performance.now();
    await wait(600); cEl.textContent = '';
    setTimeout(() => $('.g-hint', ar)?.classList.add('fade'), 2500);
  })();

  function end(won) {
    if (g.ended) return; g.ended = true; g.running = false; renderTop();
    const big = h(`<div class="g-end ${won ? 'win' : 'lose'}">${won ? '🎉 برافو!' : '💀 أوبس!'}</div>`); ar.appendChild(big);
    if (won) { SFX.ok(); confetti(60); } else SFX.lose();
    setTimeout(() => {
      cancelAnimationFrame(raf);
      cv.removeEventListener('pointerdown', pd); removeEventListener('pointermove', pm); removeEventListener('pointerup', pu); removeEventListener('pointercancel', pu);
      removeEventListener('keydown', kd); removeEventListener('keyup', ku); document.removeEventListener('visibilitychange', vis); removeEventListener('resize', size);
      ar.remove(); document.body.classList.remove('playing');
      resolve({ won, stats: g.stats, points: g.points, hearts: g.hearts });
    }, 1300);
  }
}); }

/* ===================================================================
   GAME 1 — المطاردة (Runner)
   =================================================================== */
const OBST = [
  { e: '🗑️', w: 40, h: 46, s: 46, m: 'مين حاطط الزبالة دي هنا؟! 🗑️' },
  { e: '🐕', w: 46, h: 40, s: 48, m: 'الكلب كان عايز يلعب بس 🐕' },
  { e: '🛵', w: 62, h: 50, s: 58, m: 'دليفري مستعجل!! 🛵💨' },
  { e: '🧱', w: 38, h: 40, s: 42, m: 'آه يا رجلي 🦶😭' },
  { e: '🛒', w: 50, h: 46, s: 50, m: 'عربية سوبر ماركت؟! 🛒' },
  { e: '🌵', w: 34, h: 52, s: 52, m: 'صبّارة!! ليه؟!! 🌵' }
];
const G_RUN = {
  key: 'run', en: 'THE CHASE', ar: 'المطاردة', icon: '🏃‍♀️', dur: 32, hint: '👆 دوسي = نطّة · دوسي تاني في الهوا = نطّة مزدوجة',
  how: 'مشمش بتجري بالملف في الشارع!\nدوسي في أي حتة علشان تنطّي فوق العقبات،\nودوسي تاني وإنتي في الهوا علشان نطّة مزدوجة.\nوالشوكولاتة 🍫 اللي في السكة… خديها طبعًا.',
  goal: 'كمّلي جري لحد ما العداد يخلص',
  taunt: '😼 هتلحقيني؟ إنتي؟ هههه',
  fail: ['مشمش وقفت تستناكي… وبعدين ضحكت ومشيت 😹', 'الكلب ساب اللعب وجه يطمّن عليكي 🐕', 'الدليفري سألك: «إنتي كويسة؟ ولا أجيبلك حاجة؟» 🛵'],
  init(g) {
    g.gy = g.H * .76; g.p = { x: g.W * .74, y: g.gy, vy: 0, j: 0 }; g.ob = []; g.co = []; g.os = 1; g.cs = .7; g.bx = 0; g.tauntT = 4;
    g.bld = Array.from({ length: 14 }, (_, i) => ({ x: i * 90, w: rand(50, 85), h: rand(.18, .42) * g.H, c: pick(['#1b1640', '#221a4d', '#16123a']) }));
  },
  down(g) { if (g.p.j < 2) { g.p.vy = -g.H * (g.p.j ? 1.05 : 1.2); g.p.j++; g.stat('jumps'); SFX.jump(); if (g.p.j === 2) g.burst(g.p.x, g.p.y, '💨', 4, 120); } },
  update(g, dt) {
    g.progress = g.t / this.dur;
    const sp = g.W * .55 * (1 + g.t / 45) * g.diff; g.bx += sp * dt;
    const p = g.p; p.vy += g.H * 3.3 * dt; p.y += p.vy * dt; if (p.y >= g.gy) { p.y = g.gy; p.vy = 0; p.j = 0; }
    if ((g.os -= dt) <= 0) { const o = pick(OBST); g.ob.push({ ...o, x: -50 }); g.os = Math.max(.75, rand(1.05, 1.75) / (1 + g.t / 70) / g.diff); }
    if ((g.cs -= dt) <= 0) { g.co.push({ x: -30, y: g.gy - rand(70, g.H * .3) }); g.cs = rand(.9, 1.8); }
    for (const o of g.ob) o.x += sp * dt;
    for (const c of g.co) c.x += sp * dt;
    g.ob = g.ob.filter(o => o.x < g.W + 80); g.co = g.co.filter(c => c.x < g.W + 40 && !c.got);
    for (const o of g.ob) if (!o.done && Math.abs(o.x - p.x) < o.w / 2 + 14 && p.y > g.gy - o.h + 6) { o.done = true; g.hit(o.m); }
    for (const c of g.co) if (Math.hypot(c.x - p.x, c.y - (p.y - 28)) < 38) { c.got = true; g.add(10); g.stat('choco'); SFX.coin(); g.pop('+🍫', c.x, c.y - 10, '#ffd166', 20); }
    if ((g.tauntT -= dt) <= 0) { g.tauntT = rand(5, 8); g.pop(pick(['😹 بطيئة!', 'مياو باي 👋', '🐟 هتلحقيني؟', 'الملف معايا 📁😼', 'إنتي لسه هنا؟']), 90, g.gy - 120, '#fff', 18); SFX.meow(); }
  },
  draw(g, ctx) {
    const sky = ctx.createLinearGradient(0, 0, 0, g.H); sky.addColorStop(0, '#1a0f3a'); sky.addColorStop(.7, '#3a1850'); sky.addColorStop(1, '#14082a');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, g.W, g.H);
    emo(ctx, '🌙', g.W * .2, g.H * .12, 40);
    const span = g.bld.length * 90;
    for (const b of g.bld) { const x = ((b.x + g.bx * .25) % span) - 90; ctx.fillStyle = b.c; ctx.fillRect(x, g.gy - b.h, b.w, b.h);
      ctx.fillStyle = 'rgba(255,209,102,.5)'; for (let wy = g.gy - b.h + 12; wy < g.gy - 14; wy += 22) for (let wx = x + 8; wx < x + b.w - 10; wx += 18) if ((wx * 7 + wy * 3) % 5 < 2) ctx.fillRect(wx, wy, 7, 9); }
    ctx.fillStyle = '#0c0820'; ctx.fillRect(0, g.gy, g.W, g.H - g.gy);
    ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 3; ctx.shadowColor = '#8b5cf6'; ctx.shadowBlur = 12; ctx.beginPath(); ctx.moveTo(0, g.gy); ctx.lineTo(g.W, g.gy); ctx.stroke(); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(34,211,238,.4)'; for (let x = (g.bx % 60) - 60; x < g.W; x += 60) ctx.fillRect(x, g.gy + 30, 30, 4);
    // cat ahead
    const cy = g.gy - 22 - Math.abs(Math.sin(g.t * 9)) * 14;
    emo(ctx, '🐈', 60, cy, 46); emo(ctx, '📁', 60, cy - 32, 22, Math.sin(g.t * 9) * .3);
    for (const c of g.co) emo(ctx, '🍫', c.x, c.y + Math.sin(g.t * 5 + c.x) * 4, 30);
    for (const o of g.ob) emo(ctx, o.e, o.x, g.gy - o.h / 2, o.s);
    const p = g.p; if (!(g.inv > 0 && Math.floor(g.t * 14) % 2)) emo(ctx, '🏃‍♀️', p.x, p.y - 28, 54, p.j ? -.15 : Math.sin(g.t * 18) * .06);
  }
};

/* ===================================================================
   GAME 2 — اضربي مشمش (Whack)
   =================================================================== */
const G_WHACK = {
  key: 'whack', en: 'WHACK-A-CAT', ar: 'اضربي مشمش', icon: '🔨', dur: 30, target: 18, hint: '👆 اضربي القطط بس… مش تيتة!',
  how: 'مشمش استخبّت هي وإخواتها في الحُفر!\nأول ما قطة تطلع… اضربيها 🔨\nالقطة الدهب 😹 بـ 3\nبس اوعي تضربي تيتة 👵 أو الكلب 🐶',
  goal: 'اضربي 18 قطة قبل ما الوقت يخلص',
  taunt: '😼 يا إخواتي!!! 🐈🐈🐈',
  fail: ['تيتة زعلانة منك وقالت «مكانش العشم» 👵💔', 'مشمش وإخواتها عاملين حفلة دلوقتي 🎉🐈', 'القطط اتجمعت وعملت عليكي بلوك جماعي 🚫'],
  counter: g => `${g.hits}/18`,
  init(g) {
    g.hits = 0; g.st = .6; g.ham = null;
    const cols = 3, rows = 3, top = g.H * .14, bot = g.H * .93, cw = g.W / cols, rh = (bot - top) / rows;
    g.r = Math.min(cw, rh) * .34;
    g.holes = []; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) g.holes.push({ x: cw * (c + .5), y: top + rh * (r + .62), it: null });
  },
  update(g, dt) {
    if ((g.st -= dt) <= 0) {
      const empty = g.holes.filter(hh => !hh.it); if (empty.length) {
        const hh = pick(empty), r = Math.random();
        const kind = r < .6 ? 'cat' : r < .68 ? 'gold' : r < .84 ? 'granny' : 'dog';
        hh.it = { kind, e: { cat: pick(['😼', '🐱', '😾']), gold: '😹', granny: '👵', dog: '🐶' }[kind], t: 0, life: rand(.85, 1.35) / g.diff * Math.max(.7, 1 - g.t / 80), bonk: 0 };
      }
      g.st = rand(.3, .62) / g.diff;
    }
    for (const hh of g.holes) { const it = hh.it; if (!it) continue; it.t += dt;
      if (it.bonk) { it.bonk += dt; if (it.bonk > .35) hh.it = null; }
      else if (it.t > it.life) { if ((it.kind === 'cat' || it.kind === 'gold') && Math.random() < .3) g.pop(pick(['هربت 😹', 'مياو 😛', 'بطيئة!']), hh.x, hh.y - g.r * 1.6, '#ccc', 15); hh.it = null; } }
    g.progress = g.hits / this.target; if (g.hits >= this.target) g.win();
    if (g.ham) { g.ham.t += dt; if (g.ham.t > .25) g.ham = null; }
  },
  timeUp(g) { return g.hits >= this.target; },
  down(g, x, y) {
    g.ham = { x, y, t: 0 };
    for (const hh of g.holes) { const it = hh.it; if (!it || it.bonk) continue;
      if (Math.hypot(x - hh.x, y - (hh.y - g.r * .7)) < g.r * 1.15) {
        it.bonk = .001;
        if (it.kind === 'cat' || it.kind === 'gold') { const n = it.kind === 'gold' ? 3 : 1; g.hits += n; g.add(10 * n); g.stat('cats', n); SFX.whack(); g.burst(hh.x, hh.y - g.r, '💥', 3, 150); g.burst(hh.x, hh.y - g.r, '⭐', 4, 200);
          g.pop(it.kind === 'gold' ? '+3 😹✨' : pick(['بوم!', '💥', 'مياو؟!', 'آخد دي!', 'طاخ!']), hh.x, hh.y - g.r * 1.8, '#ffd166'); }
        else if (it.kind === 'granny') { g.stat('granny'); g.hit('إنتي ضربتي تيتة؟!! 😱👵'); }
        else { g.stat('dog'); g.hit('الكلب ماله؟! 🐶😢'); }
        return;
      }
    }
    SFX.tone(300, .05, 'sine', .04);
  },
  draw(g, ctx) {
    ctx.fillStyle = '#1a1433'; ctx.fillRect(0, 0, g.W, g.H);
    const t = 46; for (let y = 0; y < g.H; y += t) for (let x = 0; x < g.W; x += t) { if (((x + y) / t) % 2 === 0) { ctx.fillStyle = '#211a40'; ctx.fillRect(x, y, t, t); } }
    for (const hh of g.holes) {
      const r = g.r;
      ctx.fillStyle = '#05030c'; ctx.beginPath(); ctx.ellipse(hh.x, hh.y, r * 1.1, r * .42, 0, 0, 7); ctx.fill();
      const it = hh.it;
      if (it) {
        const up = it.bonk ? Math.max(0, 1 - it.bonk * 4) : Math.min(1, it.t / .14) * (it.t > it.life - .14 ? Math.max(0, (it.life - it.t) / .14) : 1);
        ctx.save(); ctx.beginPath(); ctx.rect(hh.x - r * 1.5, hh.y - r * 3, r * 3, r * 3); ctx.clip();
        emo(ctx, it.e, hh.x, hh.y + r * .2 - up * r * 1.05, r * 1.35, it.bonk ? .4 : 0);
        if (it.bonk && (it.kind === 'cat' || it.kind === 'gold')) emo(ctx, '💫', hh.x, hh.y - r * 1.5, r * .6, g.t * 6);
        ctx.restore();
      }
      ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 3; ctx.shadowColor = '#8b5cf6'; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.ellipse(hh.x, hh.y, r * 1.1, r * .42, 0, 0, Math.PI); ctx.stroke(); ctx.shadowBlur = 0;
      ctx.fillStyle = '#2b2150'; ctx.beginPath(); ctx.ellipse(hh.x, hh.y + 2, r * 1.12, r * .44, 0, 0, Math.PI); ctx.lineTo(hh.x - r * 1.12, hh.y + r * .5); ctx.fill();
    }
    if (g.ham) emo(ctx, '🔨', g.ham.x + 14, g.ham.y - 14, 48, -1.1 + g.ham.t * 6);
  }
};

/* ===================================================================
   GAME 3 — مطر من فوق التلاجة (Dodge & Catch)
   =================================================================== */
const JUNK = { '🩴': 'شبشب طاير!!! 🩴', '🧦': 'شراب مين ده؟! 🤢', '🍳': 'طاسة؟! يا مشمش!! 🍳', '🥫': 'علبة فول على راسي 🥫', '📦': 'كرتونة كاملة؟!! 📦', '🥚': 'بيضة… على شعري 🥚😭', '🧅': 'بصلة… عيّطت 🧅😭', '🧀': 'جبنة رومي طايرة 🧀' };
const G_RAIN = {
  key: 'rain', en: 'FRIDGE STORM', ar: 'مطر من فوق التلاجة', icon: '🧺', dur: 40, target: 15, hint: '👈 اسحبي صباعك يمين وشمال 👉',
  how: 'مشمش طلعت فوق التلاجة وبترمي عليكي كل اللي فيها!\nحرّكي السلة بصباعك يمين وشمال\nواجمعي ورق الملف 📄\nواتفادي الشبشب والطاسة والبيض و… كل حاجة تانية.',
  goal: 'اجمعي 15 ورقة من الملف',
  taunt: '😾 ضربتي إخواتي؟! ماشي… هرمي عليكي التلاجة كلها.',
  fail: ['الشبشب كسب. الشبشب دايمًا بيكسب 🩴', 'إنتي دلوقتي متغطية بيض وبصل وجبنة رومي 🥚🧅🧀', 'مشمش بتصورك من فوق التلاجة 📸😹'],
  counter: g => `${g.pages}/15`,
  init(g) { g.bx = g.W / 2; g.tx = g.W / 2; g.by = g.H * .86; g.items = []; g.st = .5; g.pages = 0; g.cx = g.W / 2; g.cv = 1; },
  down(g, x) { g.tx = x; }, move(g, x) { if (g.ptr.down) g.tx = x; },
  update(g, dt) {
    if (g.keys.ArrowLeft) g.tx -= g.W * 1.4 * dt; if (g.keys.ArrowRight) g.tx += g.W * 1.4 * dt;
    g.tx = clamp(g.tx, 40, g.W - 40); g.bx += (g.tx - g.bx) * Math.min(1, dt * 16);
    g.cx += g.cv * g.W * .35 * dt; if (g.cx < 60 || g.cx > g.W - 60) g.cv *= -1;
    if ((g.st -= dt) <= 0) {
      const page = Math.random() < .42, e = page ? '📄' : pick(Object.keys(JUNK));
      g.items.push({ e, page, x: clamp(g.cx + rand(-60, 60), 30, g.W - 30), y: g.H * .2, vy: g.H * (.26 + rand(0, .16) + g.t / 160) * g.diff, vx: rand(-40, 40), r: rand(-2, 2), rr: 0 });
      g.st = rand(.42, .7) / g.diff;
    }
    for (const it of g.items) { it.y += it.vy * dt; it.x = clamp(it.x + it.vx * dt, 20, g.W - 20); it.rr += it.r * dt;
      if (!it.done && Math.abs(it.x - g.bx) < 48 && it.y > g.by - 44 && it.y < g.by + 10) { it.done = true;
        if (it.page) { g.pages++; g.add(15); g.stat('pages'); SFX.coin(); g.pop('+📄', it.x, g.by - 60, '#34d399'); }
        else { g.stat('junk'); if (!g.hit(JUNK[it.e])) g.pop('😮‍💨', it.x, g.by - 60); g.splat(it.x, g.by - 30, '#ffd166', 6); } } }
    g.items = g.items.filter(it => !it.done && it.y < g.H + 40);
    g.progress = g.pages / this.target; if (g.pages >= this.target) g.win();
  },
  timeUp(g) { return g.pages >= this.target; },
  draw(g, ctx) {
    const bgG = ctx.createLinearGradient(0, 0, 0, g.H); bgG.addColorStop(0, '#20183f'); bgG.addColorStop(1, '#100b22'); ctx.fillStyle = bgG; ctx.fillRect(0, 0, g.W, g.H);
    ctx.fillStyle = 'rgba(255,255,255,.03)'; for (let x = 0; x < g.W; x += 40) ctx.fillRect(x, 0, 1, g.H);
    // fridge top
    rrect(ctx, 20, g.H * .08, g.W - 40, g.H * .1, 12); ctx.fillStyle = '#d9e4f5'; ctx.fill(); ctx.fillStyle = '#b7c4dc'; ctx.fillRect(30, g.H * .17, g.W - 60, 5);
    emo(ctx, '🐈', g.cx, g.H * .07, 46, Math.sin(g.t * 10) * .15, 1, g.cv > 0);
    for (const it of g.items) emo(ctx, it.e, it.x, it.y, it.page ? 34 : 38, it.rr);
    ctx.fillStyle = '#0a0718'; ctx.fillRect(0, g.by + 34, g.W, g.H);
    const blink = g.inv > 0 && Math.floor(g.t * 14) % 2;
    if (!blink) { emo(ctx, '🙆‍♀️', g.bx, g.by - 34, 46); emo(ctx, '🧺', g.bx, g.by + 4, 58); }
  }
};

/* ===================================================================
   GAME 4 — المطاردة الجوية (Flappy)
   =================================================================== */
const G_FLY = {
  key: 'fly', en: 'BALLOON CHASE', ar: 'المطاردة الجوية', icon: '🎈', dur: 0, target: 10, hint: '👆 دوسي = طيري لفوق',
  how: 'مشمش ربطت نفسها في بالونات… وطارت! 🎈🐈\nدوسي علشان تطيري لفوق، وسيبي علشان تنزلي.\nعدّي من بين العماير ومتخبطيش.',
  goal: 'عدّي من 10 فتحات',
  taunt: '😹 باي باي! إلا لو بتعرفي تطيري؟',
  fail: ['البالونة فرقعت… بالراحة الحمد لله 🎈💥', 'سكان العمارة طلّوا من الشباك وسألوا «إنتي مين؟» 🏢', 'حمامة عدّت جنبك وضحكت 🕊️'],
  counter: g => `${g.passed}/10`,
  init(g) { g.p = { x: g.W * .72, y: g.H * .42, vy: 0 }; g.pp = []; g.passed = 0; g.sp = g.W * .3 * g.diff + 60; g.gap = clamp(g.H * .34, 175, 270) / Math.sqrt(g.diff); g.st = .3; g.clouds = Array.from({ length: 6 }, () => ({ x: rand(0, g.W), y: rand(0, g.H * .8), s: rand(.4, 1) })); },
  down(g) { g.p.vy = -g.H * .6; SFX.flap(); g.stat('flaps'); },
  update(g, dt) {
    const p = g.p; p.vy += g.H * 1.5 * dt; p.y += p.vy * dt;
    if (p.y < 30) { p.y = 30; p.vy = 0; }
    if (p.y > g.H - 20) { g.hit('وقعتي على الأرض 😵'); p.y = g.H * .42; p.vy = -g.H * .3; g.pp = g.pp.filter(q => Math.abs(q.x - p.x) > 200); }
    if ((g.st -= dt) <= 0) { g.pp.push({ x: -50, gy: rand(g.gap / 2 + 50, g.H - g.gap / 2 - 50), w: 66 }); g.st = (g.W * .55) / g.sp; }
    for (const q of g.pp) { q.x += g.sp * dt;
      const inX = Math.abs(q.x - p.x) < q.w / 2 + 18, inGap = Math.abs(p.y - q.gy) < g.gap / 2 - 18;
      if (inX && !inGap && !q.hitDone) { q.hitDone = true; g.hit(pick(['خبطتي في عمارة 🏢😵', 'دش الستالايت ضربك 📡', 'غسيل الجيران لفّ عليكي 👕'])); }
      if (!q.passed && q.x - q.w / 2 > p.x + 18) { q.passed = true; if (!q.hitDone) { g.passed++; g.add(20); SFX.coin(); g.pop(pick(['عدّت! ✨', 'بيلوت محترفة ✈️', 'حلوة!', 'ولا مصر للطيران 😎']), p.x - 30, p.y - 40, '#ffd166', 18); } else { g.passed++; } } }
    g.pp = g.pp.filter(q => q.x < g.W + 80);
    for (const c of g.clouds) { c.x += g.sp * .3 * c.s * dt; if (c.x > g.W + 60) c.x = -60; }
    g.progress = g.passed / this.target; if (g.passed >= this.target) g.win();
  },
  draw(g, ctx) {
    const sky = ctx.createLinearGradient(0, 0, 0, g.H); sky.addColorStop(0, '#ff9e6e'); sky.addColorStop(.55, '#a8487a'); sky.addColorStop(1, '#3b1f5c'); ctx.fillStyle = sky; ctx.fillRect(0, 0, g.W, g.H);
    for (const c of g.clouds) { ctx.globalAlpha = .35 * c.s; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(c.x, c.y, 50 * c.s, 16 * c.s, 0, 0, 7); ctx.ellipse(c.x + 24 * c.s, c.y - 8 * c.s, 30 * c.s, 13 * c.s, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
    for (const q of g.pp) {
      const x = q.x - q.w / 2, t1 = q.gy - g.gap / 2, b1 = q.gy + g.gap / 2;
      for (const [y0, hh] of [[0, t1], [b1, g.H - b1]]) {
        ctx.fillStyle = '#2a1846'; ctx.fillRect(x, y0, q.w, hh); ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2; ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 8; ctx.strokeRect(x, y0, q.w, hh); ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,209,102,.55)'; for (let wy = y0 + 10; wy < y0 + hh - 10; wy += 22) for (let wx = x + 9; wx < x + q.w - 12; wx += 18) if (((wx | 0) + (wy | 0)) % 3) ctx.fillRect(wx, wy, 8, 10);
      }
    }
    // cat flying ahead
    const cy = g.H * .3 + Math.sin(g.t * 2) * 40; emo(ctx, '🎈', 55, cy - 40, 36); emo(ctx, '🎈', 75, cy - 46, 30); emo(ctx, '🐈', 62, cy, 40);
    const p = g.p, rot = clamp(p.vy / (g.H * 1.2), -.4, .5);
    if (!(g.inv > 0 && Math.floor(g.t * 14) % 2)) { emo(ctx, '🎈', p.x, p.y - 36, 40, rot * .5); emo(ctx, '🙋‍♀️', p.x, p.y + 4, 40, rot); }
  }
};

/* ===================================================================
   GAME 5 — نينجا الخضار (Slice)
   =================================================================== */
const VEG = { '🍅': '#ff4d4d', '🥒': '#7bd65b', '🍆': '#a35bd6', '🥕': '#ff9a3c', '🥔': '#e8c37a', '🌽': '#ffe066', '🥦': '#4caf50', '🍉': '#ff5c7a', '🫑': '#5bd66b' };
const G_SLICE = {
  key: 'slice', en: 'VEGGIE NINJA', ar: 'نينجا الخضار', icon: '🔪', dur: 35, target: 25, hint: '☝️ اسحبي صباعك على الخضار وقطّعيه',
  how: 'مشمش بتحاربك بسلاحها السري… الخضار 🥒🍅\nاسحبي صباعك على الشاشة علشان تقطّعي.\nبس اوعي تقطعي المنبه ⏰ أو تونة مشمش 🐟',
  goal: 'قطّعي 25 حاجة',
  taunt: '😼 جهّزتلك السلاح السري… الخضار. 🥒🍅🍆',
  fail: ['المنبه رن… ودي أسوأ نهاية ممكنة لأي حد ⏰', 'الخضار انتصر. كارثة غذائية 🥒🏆', 'مشمش عملت سلطة باللي فاضل وأكلتها قدامك 🥗😼'],
  counter: g => `${g.cut}/25`,
  init(g) { g.items = []; g.halves = []; g.trail = []; g.st = .4; g.cut = 0; g.combo = []; },
  down(g, x, y) { g.trail = [{ x, y, t: g.t }]; },
  move(g, x, y) {
    if (!g.ptr.down) return; const lastP = g.trail[g.trail.length - 1] || { x, y };
    g.trail.push({ x, y, t: g.t }); if (g.trail.length > 18) g.trail.shift();
    for (const it of g.items) if (!it.cutDone && segDist(it.x, it.y, lastP.x, lastP.y, x, y) < 34) this.slice(g, it, x - lastP.x, y - lastP.y);
  },
  up(g) { },
  slice(g, it, dx, dy) {
    it.cutDone = true;
    if (it.bad) { g.stat('alarm'); g.hit(it.e === '⏰' ? 'منبه الساعة 7 الصبح!!! ⏰😱' : 'دي تونة مشمش!! 😾 هتنتقم'); g.burst(it.x, it.y, it.e === '⏰' ? '💥' : '😾', 4, 200); return; }
    g.cut++; g.add(8); g.stat('cut'); SFX.slice();
    const ang = Math.atan2(dy, dx);
    g.halves.push({ e: it.e, x: it.x, y: it.y, vx: it.vx - 120, vy: it.vy, rot: ang, vr: -3, side: -1, life: 1.2 }, { e: it.e, x: it.x, y: it.y, vx: it.vx + 120, vy: it.vy, rot: ang, vr: 3, side: 1, life: 1.2 });
    g.splat(it.x, it.y, VEG[it.e] || '#ff8', 12);
    g.combo.push(g.t); g.combo = g.combo.filter(t => g.t - t < .35);
    if (g.combo.length >= 3) { g.add(10); g.pop(`كومبو ×${g.combo.length} 🔥`, it.x, it.y - 50, '#ffd166', 24); g.combo = []; }
  },
  update(g, dt) {
    if ((g.st -= dt) <= 0) {
      const n = Math.random() < .35 ? 3 : Math.random() < .6 ? 2 : 1;
      for (let i = 0; i < n; i++) { const bad = Math.random() < .14 + g.t / 400; const x = rand(g.W * .15, g.W * .85);
        g.items.push({ e: bad ? pick(['⏰', '🐟']) : pick(Object.keys(VEG)), bad, x, y: g.H + 30, vx: (g.W / 2 - x) * rand(.3, .8), vy: -rand(g.H * 1.05, g.H * 1.32), r: 0, vr: rand(-4, 4) }); }
      g.st = rand(.75, 1.25) / g.diff;
    }
    const grav = g.H * 1.25;
    for (const it of g.items) { it.vy += grav * dt; it.x += it.vx * dt; it.y += it.vy * dt; it.r += it.vr * dt; }
    g.items = g.items.filter(it => !it.cutDone && it.y < g.H + 60);
    for (const hf of g.halves) { hf.vy += grav * dt; hf.x += hf.vx * dt; hf.y += hf.vy * dt; hf.rot += hf.vr * dt; hf.life -= dt; }
    g.halves = g.halves.filter(hf => hf.life > 0 && hf.y < g.H + 60);
    g.trail = g.trail.filter(p => g.t - p.t < .14);
    g.progress = g.cut / this.target; if (g.cut >= this.target) g.win();
  },
  timeUp(g) { return g.cut >= this.target; },
  draw(g, ctx) {
    const bgG = ctx.createLinearGradient(0, 0, g.W, g.H); bgG.addColorStop(0, '#5a3720'); bgG.addColorStop(1, '#3a2213'); ctx.fillStyle = bgG; ctx.fillRect(0, 0, g.W, g.H);
    ctx.strokeStyle = 'rgba(0,0,0,.15)'; ctx.lineWidth = 2; for (let y = 10; y < g.H; y += 26) { ctx.beginPath(); ctx.moveTo(0, y); for (let x = 0; x <= g.W; x += 40) ctx.lineTo(x, y + Math.sin(x * .02 + y) * 4); ctx.stroke(); }
    emo(ctx, '🐈', 46, 74, 44, Math.sin(g.t * 3) * .1); emo(ctx, '👩‍🍳', 30, 52, 24);
    for (const it of g.items) emo(ctx, it.e, it.x, it.y, 52, it.r);
    for (const hf of g.halves) { ctx.save(); ctx.globalAlpha = clamp(hf.life, 0, 1); ctx.translate(hf.x, hf.y); ctx.rotate(hf.rot); ctx.beginPath(); ctx.rect(hf.side < 0 ? -40 : 0, -40, 40, 80); ctx.clip(); ctx.rotate(-hf.rot); emo(ctx, hf.e, 0, 0, 52); ctx.restore(); }
    if (g.trail.length > 1) { ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (let i = 1; i < g.trail.length; i++) { const a = g.trail[i - 1], b = g.trail[i], k = i / g.trail.length;
        ctx.strokeStyle = `rgba(255,255,255,${k})`; ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 14; ctx.lineWidth = 2 + k * 8; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      ctx.shadowBlur = 0; }
  }
};
function segDist(px, py, ax, ay, bx, by) { const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy; let t = l ? ((px - ax) * dx + (py - ay) * dy) / l : 0; t = clamp(t, 0, 1); return Math.hypot(px - (ax + t * dx), py - (ay + t * dy)); }

/* ===================================================================
   GAME 6 — شد الحبل (Final boss)
   =================================================================== */
const G_TUG = {
  key: 'tug', en: 'FINAL BOSS', ar: 'شد الحبل', icon: '💪', dur: 30, hint: '👆👆👆 دوسي بسرعة جدًا!!',
  how: 'المواجهة الأخيرة!\nمشمش ماسكة الملف من ناحية… وإنتي من الناحية التانية.\nدوسي بأسرع ما يمكن علشان تشدّي الحبل لناحيتك 👆👆👆\nوخلي بالك… مشمش بتاكل تونة في النص وتقوى 😼',
  goal: 'اسحبي الملف لحد ناحيتك',
  taunt: '😼 آخر فرصة. شد الحبل. اللي يكسب ياخد الملف.',
  fail: ['مشمش شدّتك في الطين 😹🟫', 'قطة وزنها 4 كيلو غلبتك… هنتكلم في الموضوع ده بعدين.', 'مشمش عملت رقصة النصر قدامك 💃🐈'],
  init(g) { g.pos = 0; g.boost = 0; g.nextBoost = 5; g.pulse = 0; },
  down(g, x, y) {
    g.pos += .05 / Math.sqrt(g.diff); g.stat('taps'); g.pulse = 1; SFX.tap((g.pos + 1) / 2);
    if (Math.random() < .25) g.pop(pick(['💪', 'شدّي!', '🔥', 'يلااا']), x + rand(-20, 20), y - 20, '#fff', 18);
  },
  update(g, dt) {
    const pull = (.2 + g.t * .005) * g.diff * (g.boost > 0 ? 2.3 : 1);
    g.pos -= pull * dt; g.pulse = Math.max(0, g.pulse - dt * 5);
    if (g.boost > 0) g.boost -= dt;
    if ((g.nextBoost -= dt) <= 0) { g.boost = 1.4; g.nextBoost = rand(5, 7); SFX.meow(); g.pop(pick(['😼 أكلت تونة! قوة مضاعفة!', '😼 مياااااااو!!!', '😼 استدعيت إخواتي!', '😼 ده أنا متدربة جيم!']), g.W / 2, g.H * .22, '#ff8fab', 20); }
    if (g.pos >= 1) { g.pos = 1; g.win(); }
    if (g.pos <= -1) { g.hit('مشمش شدّتك!! 😹'); g.pos = 0; }
    g.progress = (g.pos + 1) / 2;
  },
  timeUp(g) { return g.pos > 0; },
  draw(g, ctx) {
    const bgG = ctx.createLinearGradient(0, 0, 0, g.H); bgG.addColorStop(0, '#2a0f30'); bgG.addColorStop(1, '#0d0618'); ctx.fillStyle = bgG; ctx.fillRect(0, 0, g.W, g.H);
    for (let i = 0; i < 2; i++) { const sx = i ? g.W * .8 : g.W * .2, gr = ctx.createRadialGradient(sx, 0, 10, sx, g.H * .5, g.H * .6); gr.addColorStop(0, 'rgba(255,209,102,.18)'); gr.addColorStop(1, 'rgba(255,209,102,0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, g.W, g.H); }
    const ry = g.H * .55, mid = g.W / 2;
    ctx.fillStyle = '#4a2c14'; ctx.beginPath(); ctx.ellipse(mid, ry + 50, g.W * .16, 18, 0, 0, 7); ctx.fill(); emo(ctx, '🟫', mid, ry + 50, 1);
    ctx.font = '600 13px "Readex Pro",sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.textAlign = 'center'; ctx.fillText('حفرة طين 🟫', mid, ry + 88);
    ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(mid, ry - 80); ctx.lineTo(mid, ry + 40); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(52,211,153,.12)'; ctx.fillRect(g.W * .88, 0, g.W * .12, g.H); ctx.fillStyle = 'rgba(255,59,107,.12)'; ctx.fillRect(0, 0, g.W * .12, g.H);
    const off = g.pos * g.W * .36, wig = Math.sin(g.t * 30) * (g.boost > 0 ? 4 : 1.5);
    ctx.strokeStyle = '#c99a5b'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(40, ry + wig); ctx.quadraticCurveTo(mid + off, ry + 10 + wig, g.W - 40, ry - wig); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 2; for (let x = 50; x < g.W - 50; x += 14) { ctx.beginPath(); ctx.moveTo(x, ry - 3); ctx.lineTo(x + 6, ry + 3); ctx.stroke(); }
    emo(ctx, '📁', mid + off, ry - 22, 38, Math.sin(g.t * 8) * .1); emo(ctx, '🎀', mid + off, ry + 4, 22);
    const cs = 74 + (g.boost > 0 ? Math.sin(g.t * 30) * 6 : 0);
    emo(ctx, g.boost > 0 ? '😾' : '😼', 50 + off * .25, ry - 10, cs);
    if (g.boost > 0) emo(ctx, '🐟', 90 + off * .25, ry - 60, 30, g.t * 5);
    emo(ctx, g.pulse > .3 ? '😤' : '🙋‍♀️', g.W - 52 + off * .25, ry - 14, 70 + g.pulse * 10);
    ctx.font = `900 ${28 + g.pulse * 8}px "Lalezar","Readex Pro",sans-serif`; ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
    ctx.globalAlpha = .55 + Math.sin(g.t * 10) * .3; ctx.fillText('دوسي!! 👆', mid, g.H * .85); ctx.globalAlpha = 1;
  }
};

const GAMES = [G_RUN, G_WHACK, G_RAIN, G_FLY, G_SLICE, G_TUG];

/* ===================================================================
   STORY — المشاهد بين الألعاب
   =================================================================== */
const N = ['🎙️', 'الراوي'], CAT = ['🐈', 'مشمش'], SYS = ['📺', 'خبر عاجل'];
const SCENES = {
  prologue: [
    [SYS, '🚨🚨🚨 خبر عاجل 🚨🚨🚨'],
    [N, 'القطة «مشمش» سرقت «الملف الأخير» من خزنة الوكالة… وهربت!'],
    [N, 'المعلومات المتاحة: الملف ده جواه رسالة مهمة جدًا جدًا… لـ{name}.'],
    [CAT, 'مياو. الملف معايا 📁😼\nولو عايزاه… تعالي خديه.'],
    [CAT, 'بس أنا سريعة… وذكية… وقطة.\nوإنتي… إنتي.'],
    [N, 'المهمة: امسكي مشمش. بأي طريقة. 🏃‍♀️💨']
  ],
  after: [
    [[CAT, 'ماشي… طلعتي سريعة شوية 😾'], [CAT, 'بس أنا مش لوحدي.\nيا إخواتيييي!!! 🐈🐈🐈']],
    [[CAT, 'ضربتي إخواتي؟!! 😾\nماما هتعرف بالكلام ده.'], [CAT, 'ماشي… هطلع فوق التلاجة وهرمي عليكي كل اللي فيها.\nحتى الشبشب. خصوصًا الشبشب.']],
    [[N, 'مشمش اتزنقت… فربطت نفسها في بالونات… وطارت 🎈🐈'], [CAT, 'باي باي 😹 إلا لو بتعرفي تطيري؟'], [N, 'لحسن الحظ… الوكالة عندها بالونات برضه.']],
    [[CAT, 'إزاي لحقتيني؟! 😾 ده أنا كنت فوق العماير!'], [CAT, 'خلاص… هستخدم السلاح السري.'], [CAT, 'الخضار. 🥒🍅🍆']],
    [[CAT, 'خلّصتي الخضار كله؟! 😿 ده كان غدايا…'], [CAT, 'آخر فرصة.\nشد الحبل. واللي يكسب ياخد الملف. 😼💪']],
    [[CAT, 'خلاص… خلاص… استسلمت 😿🏳️\nخدي الملف.'], [N, 'بس قبل ما تفتحيه… سؤال أخير يا مشمش: إنتي سرقتيه ليه أصلًا؟'],
      [CAT, 'حد إداني علبة تونة 🐟… وقالي: «خليها تجري وراكي شوية قبل ما توصل للملف»'], [N, 'ومين اللي إداكي التونة؟'], [CAT, '…'], [CAT, '…{owner}. 😼']]
  ]
};

async function playScene(lines, btnLabel = 'يلا! ➜') {
  const stage = $('#stage');
  stage.innerHTML = `<section><div class="panel chat pop-in" id="chat"></div><div class="row"><button class="btn btn-primary btn-lg hidden" id="go">${btnLabel}</button></div></section>`;
  const chat = $('#chat');
  for (const [[av, who], text] of lines) {
    const kind = who === 'مشمش' ? 'cat' : av === '📺' ? 'sys' : '';
    const m = h(`<div class="msg ${kind}"><div class="ava">${av}</div><div class="bub"><div class="who">${esc(who)}</div><div class="txt"><span class="dots-typing"><i></i><i></i><i></i></span></div></div></div>`);
    chat.appendChild(m); m.scrollIntoView({ behavior: 'smooth', block: 'end' });
    if (kind === 'cat') SFX.meow(); if (kind === 'sys') SFX.alarm();
    await wait(skip ? 120 : 550); await type($('.txt', m), T(text), { speed: 28 });
    await wait(skip ? 150 : 500 + Math.min(1400, text.length * 10));
  }
  const b = $('#go'); b.classList.remove('hidden'); b.classList.add('pop-in'); b.scrollIntoView({ behavior: 'smooth', block: 'end' });
  return new Promise(r => { b.onclick = () => { SFX.click(); r(); }; });
}

/* ---------------- HUD ---------------- */
const STAGES = [...GAMES.map(g => ({ en: g.en, ar: g.ar })), { en: 'THE FILE', ar: 'الملف' }];
const code = i => 'LEVEL ' + String(i + 1).padStart(2, '0');
function updateHUD() {
  const i = Math.min(S.stage, STAGES.length - 1);
  $('#hudCode').textContent = code(i); $('#hudTitle').textContent = STAGES[i].en; $('#score').textContent = S.score;
  $('#progress').innerHTML = STAGES.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'now' : ''}"></i>`).join('');
  $('#soundBtn').textContent = soundOn ? '🔊' : '🔇';
}
function bumpScore(n) { S.score += n; updateHUD(); const hs = $('#hudScore'); hs.classList.remove('bump'); void hs.offsetWidth; hs.classList.add('bump'); }
$('#soundBtn').onclick = () => { soundOn = !soundOn; try { localStorage.setItem(KEY + '-sound', soundOn ? '1' : '0'); } catch (e) {} SFX.init(); updateHUD(); if (soundOn) SFX.click(); toast(soundOn ? 'الصوت اشتغل 🔊' : 'الصوت اتقفل 🔇'); };
$('#menuBtn').onclick = async () => {
  if (document.body.classList.contains('playing')) { toast('خلّصي الجولة الأول 😅'); return; }
  const v = await modal({ title: 'القائمة', body: `إنتي في <b dir="ltr">${code(Math.min(S.stage, 6))}</b> ومعاكي <b>${S.score}</b> نقطة.\nالتقدّم بيتحفظ لوحده بعد كل لعبة.`,
    buttons: [{ label: '▶ كمّلي', value: 'go', cls: 'btn-primary' }, { label: soundOn ? '🔇 اقفلي الصوت' : '🔊 شغّلي الصوت', value: 'snd' }, { label: '🔁 ابدئي من الأول', value: 'reset' }] });
  if (v === 'snd') $('#soundBtn').click();
  if (v === 'reset') { const ok = await modal({ title: 'متأكدة؟ 😳', body: 'كل النقط والتقدّم هيتمسحوا.', buttons: [{ label: 'أيوه، من الأول', value: true, cls: 'btn-red' }, { label: 'لأ', value: false }] }); if (ok) { store.clear(); S = fresh(); boot(); } }
};

/* ---------------- level intro ---------------- */
async function levelIntro(i) {
  const el = $('#intro'); $('#introCode').textContent = code(i); $('#introTitle').textContent = STAGES[i].en; $('#introAr').textContent = STAGES[i].ar;
  el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); SFX.whoosh(); await wait(1900); el.classList.remove('on');
}

/* ===================================================================
   FLOW
   =================================================================== */
let flowId = 0;
function boot() {
  flowId++;
  document.body.dataset.level = 'boot'; document.body.classList.remove('playing');
  const saved = store.load(); const canResume = saved && saved.stage > 0;
  $('#stage').innerHTML = `<section class="boot fade-in">
    <div class="boot-cat">🐈<span>📁</span></div>
    <div class="classified en">TOP SECRET</div>
    <div class="logo"><span class="p">PROJECT:</span><span class="b glitch" data-text="BESTIE">BESTIE</span></div>
    <div class="subtitle-ar">مطاردة مشمش 🐾</div>
    <div class="actions">
      ${canResume ? `<button class="btn btn-primary btn-lg" id="resumeBtn">▶ كمّلي · <span class="en" style="font-size:.8em">${code(Math.min(saved.stage, 6))}</span></button>
        <button class="btn btn-ghost" id="newBtn">ابدئي من الأول</button>`
        : `<button class="btn btn-primary btn-lg" id="newBtn">▶ ابدئي المهمة</button>`}
      <button class="btn btn-ghost" id="bootSnd">${soundOn ? '🔊 الصوت شغال' : '🔇 الصوت مقفول'}</button>
      ${isTop && !standalone() && secure ? '<button class="btn btn-ghost" id="installBtn">📲 نزّليها كتطبيق</button>' : ''}
    </div>
    <div class="note">🎧 الصوت بيفرق… شغّليه · 📱 اللعبة معمولة للموبايل</div>
    <div class="disclaimer">⚠️ تحذير: اللعبة دي ممكن تسبب ضحك مفاجئ، وصوابع تعبانة، وكره مؤقت للقطط.<br>مفيش أي قطة اتأذت أثناء تصوير اللعبة. مشمش بس اللي اتأذت نفسيًا.</div>
  </section>`;
  $('#bootSnd').onclick = () => { soundOn = !soundOn; try { localStorage.setItem(KEY + '-sound', soundOn ? '1' : '0'); } catch (e) {} SFX.init(); $('#bootSnd').textContent = soundOn ? '🔊 الصوت شغال' : '🔇 الصوت مقفول'; SFX.click(); };
  if ($('#installBtn')) $('#installBtn').onclick = installApp;
  $('#newBtn').onclick = () => { SFX.init(); SFX.click(); store.clear(); S = fresh(); start(0, true); };
  if (canResume) $('#resumeBtn').onclick = () => { SFX.init(); SFX.click(); S = Object.assign(fresh(), saved); start(S.stage, false); };
}

async function start(i, withPrologue) {
  const my = ++flowId;
  document.body.dataset.level = 'play'; updateHUD();
  if (withPrologue) { S.stage = 0; updateHUD(); await playScene(SCENES.prologue, 'يلا نمسكها! 🏃‍♀️💨'); if (my !== flowId) return; }
  for (let k = i; k < GAMES.length; k++) {
    if (my !== flowId) return;
    S.stage = k; store.save(S); updateHUD();
    await levelIntro(k); if (my !== flowId) return;
    let fails = 0, res;
    while (true) {
      const go = await preGame(GAMES[k], fails); if (my !== flowId) return;
      if (go === 'skip') { res = { won: true, stats: {}, points: 0, hearts: 0, skipped: true }; break; }
      res = await runArena(GAMES[k]); if (my !== flowId) return;
      Object.entries(res.stats || {}).forEach(([a, b]) => { S.stats[a] = (S.stats[a] || 0) + b; });
      if (res.won) break;
      fails++; S.fails++; store.save(S);
      await failScreen(GAMES[k], fails); if (my !== flowId) return;
    }
    if (!res.skipped) { const gain = 150 + res.points + res.hearts * 50; await winScreen(GAMES[k], res, gain); bumpScore(gain); }
    S.stage = k + 1; store.save(S); updateHUD();
    if (my !== flowId) return;
    await playScene(SCENES.after[k], k < GAMES.length - 1 ? 'كمّلي المطاردة ➜' : 'افتحي الملف 📁');
  }
  if (my !== flowId) return;
  finale(my);
}

function preGame(g, fails) { return new Promise(res => {
  $('#stage').innerHTML = `<section><div class="panel pre pop-in">
    <div class="pre-icon">${g.icon}</div>
    <div class="en pre-en">${esc(g.en)}</div>
    <h2 class="lv-title">${esc(g.ar)}</h2>
    <p class="pre-how">${esc(T(g.how))}</p>
    <div class="pre-goal">🎯 الهدف: ${esc(g.goal)}</div>
    <div class="pre-lives">معاكي ❤️❤️❤️ · كل خبطة بقلب</div>
    <div class="row"><button class="btn btn-primary btn-lg" id="play">${fails ? '🔁 تاني!' : 'ابدئي 🔥'}</button>
    ${fails >= 2 ? '<button class="btn btn-ghost" id="skip">⏭ عدّيها (مشمش زهقت)</button>' : ''}</div>
  </div></section>`;
  $('#play').onclick = () => { SFX.click(); res('play'); };
  if ($('#skip')) $('#skip').onclick = () => { SFX.click(); toast('مشمش: «خلاص عدّي… صعبتي عليا» 😿'); res('skip'); };
  if (!fails) setTimeout(() => cameo(g.taunt), 900);
}); }

function failScreen(g, fails) { return new Promise(res => {
  $('#stage').innerHTML = `<section><div class="panel lose pop-in">
    <div class="emo">😹</div><div class="big-en">OOPS!</div>
    <h2 class="lv-title" style="margin-top:.3rem">${esc(pick(g.fail))}</h2>
    <p style="color:var(--muted)">${fails >= 2 ? 'ومشمش قالت إنها ممكن تعدّيكي المرة دي… لو عايزة 😼' : 'متقلقيش، المحاولة الجاية هي اللي هتجيبها 💪'}</p>
    <div class="row"><button class="btn btn-primary btn-lg" id="ok">${fails >= 2 ? 'تمام ➜' : 'تاني 🔁'}</button></div>
  </div></section>`;
  $('#ok').onclick = () => { SFX.click(); res(); };
}); }

function winScreen(g, r, gain) { return new Promise(res => {
  const stars = r.hearts >= 3 ? '⭐⭐⭐' : r.hearts === 2 ? '⭐⭐' : '⭐';
  $('#stage').innerHTML = `<section><div class="panel win pop-in">
    <div class="stars">${stars}</div><div class="big-en glow" style="font-size:clamp(1.6rem,8vw,2.6rem)">CLEARED!</div>
    <h2 class="lv-title">${esc(pick(['عظمة على عظمة 👏', 'إنتي نار 🔥', 'مشمش مصدومة 😾', 'الوكالة فخورة بيكي 🫡', 'ولا غلطة… تقريبًا 😎']))}</h2>
    <div class="win-pts"><span class="en">+${gain}</span> نقطة</div>
    <div class="row"><button class="btn btn-primary btn-lg" id="ok">كمّلي ➜</button></div>
  </div></section>`;
  $('#ok').onclick = () => { SFX.click(); res(); };
}); }

/* ===================================================================
   FINALE — الملف + الرسالة
   =================================================================== */
async function finale(my) {
  S.stage = 6; store.save(S); updateHUD(); document.body.dataset.level = 'final';
  await levelIntro(6); if (my !== flowId) return;
  const stage = $('#stage');
  stage.innerHTML = `<section class="final">
    <div class="reveal panel pop-in" id="rv"><div class="eq en">THE TUNA GIVER</div><div class="who-name" id="wn"></div><p class="rv-sub" id="rvs"></p></div>
    <div class="vault hidden" id="vault"><div class="vault-light"></div><div class="vault-door"><div class="wheel"></div></div></div>
    <div class="treasure hidden" id="treasure">
      <div class="big-en glow">THE FILE<br>IS YOURS</div>
      <p class="sub">مشمش سلّمت الملف… ده اللي كان جواه 💎</p>
      <div class="panel letter"><div class="letter-to">إلى ${eT('{name}')}،</div><div class="letter-body" id="lb"></div><div class="sig" id="sig">— ${esc(OWNER)}</div></div>
      <div class="awards-head"><span class="en">OFFICIAL AWARDS</span><h3>حفل توزيع الجوايز 🏆</h3><p>تكريم رسمي على مجهودك في مطاردة قطة… جملة مكناش متخيلين نقولها</p></div>
      <div class="memories" id="mems"></div>
      <div class="panel final-stats" id="fs"></div>
      <div class="final-actions"><button class="btn btn-primary" id="again">💌 اقري الرسالة تاني</button><button class="btn btn-ghost" id="restart">🔁 العبي من الأول</button></div>
    </div></section>`;
  // reveal
  await wait(400);
  const wn = $('#wn'), glyphs = [...'█▓▒░#$%&@*?!ابتثجحخدذرزسشصضطظعغفقكلمنهوي'];
  for (let f = 0; f <= 26; f++) { wn.textContent = [...OWNER].map((c, i) => f > 8 + i * 3 ? c : pick(glyphs)).join(''); if (f % 3 === 0) SFX.noise(.04, .08, rand(800, 3000)); await wait(55); }
  wn.textContent = OWNER; SFX.fanfare(); confetti(70);
  await type($('#rvs'), 'أيوه أنا 😅 كان لازم الرسالة دي تتعب فيها شوية… علشان تعرفي إنها مهمة.\n(ومشمش أخدت تونة كتير أوي على فكرة 🐟)', { speed: 30 });
  await wait(1800); if (my !== flowId) return;
  $('#rv').classList.add('hidden');
  const v = $('#vault'); v.classList.remove('hidden');
  await wait(300); v.classList.add('spin'); SFX.tone(120, 1.2, 'sawtooth', .05, 60);
  await wait(1400); v.classList.add('open'); SFX.unlock(); SFX.whoosh(); await wait(1000); v.classList.add('gone'); await wait(500); v.remove();
  if (my !== flowId) return;
  $('#treasure').classList.remove('hidden'); $('#treasure').classList.add('fade-in'); SFX.fanfare(); confetti(200); setTimeout(() => confetti(120), 900);

  const st = S.stats, aw = [];
  const n = (v, one, two, many) => v === 1 ? one : v === 2 ? two : `${v} ${many}`;
  if (st.jumps) aw.push(['🏃‍♀️', 'أسرع رجلين في الوكالة', `نطّت ${n(st.jumps, 'نطّة واحدة', 'نطّتين', 'نطّة')} وهي بتجري ورا قطة.`]);
  if (st.choco) aw.push(['🍫', 'جامعة الشوكولاتة', `لمّت ${n(st.choco, 'حتة واحدة', 'حتتين', 'حتة')} وهي بتجري. أولويات.`]);
  aw.push(st.granny ? ['👵', 'جايزة «ضربت تيتة»', `${n(st.granny, 'مرة واحدة', 'مرتين', 'مرات')}. تيتة مسامحة… تقريبًا.`] : ['😇', 'جايزة الأخلاق', 'ولا مرة ضربت تيتة. تربية.']);
  if (st.cats) aw.push(['🔨', 'المطرقة الذهبية', `ضربت ${n(st.cats, 'قطة واحدة', 'قطتين', 'قطة')}. مشمش بتفكر ترفع قضية.`]);
  aw.push(st.junk ? ['🩴', 'جايزة الشبشب', `اتخبطت بحاجات من التلاجة ${n(st.junk, 'مرة', 'مرتين', 'مرات')}. الشبشب بيسلّم عليكي.`] : ['🧺', 'سلة ذهبية', 'ولا حاجة من التلاجة لمستها. نينجا.']);
  if (st.flaps) aw.push(['🎈', 'بيلوت الوكالة', `${n(st.flaps, 'رفرفة واحدة', 'رفرفتين', 'رفرفة')} في الهوا. مصر للطيران بتكلمك.`]);
  if (st.cut) aw.push(['🔪', 'شيف الوكالة', `قطّعت ${n(st.cut, 'حتة خضار واحدة', 'حتتين خضار', 'حتة خضار')}.${st.alarm ? ` وصحّت المنبه ${n(st.alarm, 'مرة', 'مرتين', 'مرات')} 😱` : ''}`]);
  if (st.taps) aw.push(['👆', 'أسرع صوابع في الشرق الأوسط', `${n(st.taps, 'ضغطة واحدة', 'ضغطتين', 'ضغطة')} في شد الحبل. الشاشة محتاجة إجازة.`]);
  aw.push(S.fails ? ['🔁', 'جايزة الإصرار', `خسرت ${n(S.fails, 'مرة', 'مرتين', 'مرات')} ورجعت تاني. ده الكلام.`] : ['🏆', 'ولا خسارة', 'خلّصت كل حاجة من غير ما تخسر ولا مرة. أسطورة.']);
  aw.push(['🐈', 'جايزة خاصة من مشمش', 'مياو. (الترجمة: «إنتي جامدة… بس التونة بتاعتي»)']);
  $('#mems').innerHTML = aw.map((a, i) => `<div class="mem award" style="animation-delay:${.2 + i * .12}s"><div class="ic">${a[0]}</div><h4>${esc(a[1])}</h4><p>${esc(a[2])}</p></div>`).join('');
  const rank = S.score >= 2400 ? 'صايدة قطط أسطورية 🏆' : S.score >= 1800 ? 'عميلة نخبة 🥇' : 'عميلة جامدة… ومشمش عارفة كده 😎';
  $('#fs').innerHTML = `<div class="rank">${rank}</div>
    <div class="stat"><div class="v">${S.score}</div><div class="l">النقط</div></div>
    <div class="stat"><div class="v">${(st.cats || 0) + (st.cut || 0) + (st.pages || 0)}</div><div class="l">حاجات اتمسكت واتقطعت</div></div>
    <div class="stat"><div class="v">${S.fails}</div><div class="l">مرات خسارة</div></div>`;
  const letter = async () => { $('#sig').classList.remove('on'); await type($('#lb'), T(C.finalMessage || ''), { speed: 38 }); $('#sig').classList.add('on'); setTimeout(() => cameo('😼 حلو الكلام ده… بس التونة لسه عليك يا {owner}'), 2500); };
  $('#again').onclick = () => { SFX.click(); $('.letter').scrollIntoView({ behavior: 'smooth', block: 'center' }); letter(); };
  $('#restart').onclick = async () => { const ok = await modal({ title: 'مطاردة جديدة؟', body: 'هتبدأي من الأول والنقط هتتصفّر.', buttons: [{ label: 'يلا 🔁', value: true, cls: 'btn-primary' }, { label: 'لأ', value: false }] }); if (ok) { store.clear(); S = fresh(); boot(); } };
  await wait(1200); if (my !== flowId) return;
  $('.letter').scrollIntoView({ behavior: 'smooth', block: 'center' }); await wait(500); letter();
}

/* ===================================================================
   GATE — الباسورد (عيد ميلاد {owner})
   =================================================================== */
const digitsOf = v => String(v ?? '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/\D/g, '');
const PASS = (() => { const parts = String(C.password || '30/11').split(/\D+/).filter(Boolean); return { d: +parts[0], m: +parts[1] }; })();
function passOk(v) {
  const t = String(v ?? '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  const parts = t.split(/\D+/).filter(Boolean);
  if (parts.length >= 2) return +parts[0] === PASS.d && +parts[1] === PASS.m;
  const g = digitsOf(t), dd = String(PASS.d), mm = String(PASS.m), d2 = dd.padStart(2, '0'), m2 = mm.padStart(2, '0');
  return [dd + mm, d2 + m2, dd + m2, d2 + mm].some(x => g === x || (g.startsWith(x) && (g.length === x.length + 2 || g.length === x.length + 4)));
}
const GATE_KEY = KEY + '-unlocked';
const unlocked = () => { try { return localStorage.getItem(GATE_KEY) === '1'; } catch (e) { return false; } };
const WRONG_PASS = [
  'غلط 😏 الباسورد مع {owner} بس',
  'برضه غلط… التخمين مش هينفع، اسأليه 😂',
  'مشمش بتقولك: «اسأليه بقى بدل ما تتعبي صوابعك» 🐈',
  'تلميح: هو تاريخ… تاريخ مهم أوي لحد معيّن 🎂',
  'تلميح أكبر: هو يوم/شهر… وقرّب أوي على فكرة 📅',
  'إنتي لسه بتخمّني؟! 😭 ابعتيله رسالة وخلاص',
  'الوكالة بتقترح عليكي تكلّمي {owner}. فورًا. 📞'
];
function gate() {
  flowId++;
  document.body.dataset.level = 'boot'; document.body.classList.remove('playing');
  let tries = 0;
  $('#stage').innerHTML = `<section class="gate fade-in">
    <div class="lock-ic" id="lk">🔐</div>
    <div class="classified en">ACCESS RESTRICTED</div>
    <h2 class="lv-title">الملف ده متقفل بباسورد</h2>
    <p class="gate-sub">الباسورد مع ${esc(OWNER)} بس 😏<br>عايزاه؟ <b>اسأليه.</b></p>
    <form class="gate-form" id="gf" autocomplete="off">
      <input class="inp gate-inp" id="gi" inputmode="numeric" placeholder="؟؟ / ؟؟" maxlength="12" autocomplete="off" aria-label="الباسورد">
      <button class="btn btn-primary" type="submit">افتحي 🔓</button>
    </form>
    <div class="gate-msg" id="gm"></div>
    <button class="btn btn-ghost" id="dunno">🥺 مش عارفة الباسورد</button>
  </section>`;
  const inp = $('#gi'), msg = $('#gm');
  $('#gf').onsubmit = async e => {
    e.preventDefault(); SFX.init();
    const v = inp.value.trim(); if (!v) { shakeEl(inp); return; }
    tries++;
    if (passOk(v)) {
      try { localStorage.setItem(GATE_KEY, '1'); } catch (e2) {}
      inp.disabled = true; $('#lk').textContent = '🔓'; $('#lk').classList.add('open');
      SFX.unlock(); flash('ok'); confetti(120);
      msg.className = 'gate-msg ok';
      msg.textContent = T(tries === 1 ? 'من أول مرة؟! 🥹 إنتي فاكرة عيد ميلاد {owner}… سجّلنا ده.' : '🎂 صح! ده عيد ميلاد {owner}… يعني إنتي كلّمتيه 😏 برافو.');
      await wait(2600); boot(); return;
    }
    SFX.bad(); flash('bad'); shakeEl(inp); inp.value = '';
    msg.className = 'gate-msg bad'; msg.textContent = T(WRONG_PASS[Math.min(tries - 1, WRONG_PASS.length - 1)]);
    if (tries === 3) setTimeout(() => cameo('😼 اسأليه بقى… أنا زهقت'), 600);
  };
  $('#dunno').onclick = async () => {
    SFX.init(); SFX.click();
    await modal({ title: '🔐 الباسورد فين؟', body: T('الباسورد ده تاريخ يخص <b>{owner}</b> 🎂\nلو مش عارفاه… دي فرصة حلوة تكلّميه وتسأليه 😏\n\n(أيوه، اللعبة اتعملت كده عن قصد)'), buttons: [{ label: 'هسأله 😅', value: 1, cls: 'btn-primary' }] });
    inp.focus();
  };
}
function shakeEl(el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }

/* ---------------- start ---------------- */
updateHUD();
if (unlocked()) boot(); else gate();
})();
