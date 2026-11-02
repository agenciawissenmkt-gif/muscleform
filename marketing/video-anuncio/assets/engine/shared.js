/* eslint-disable no-unused-vars -- classic script: these globals are used by video-expectativa.html and video-coragem.html */
/* Shared engine for the Beauty and self ads (videos 2 and 3).
   Every page is a pure function of time: window.seek(t) draws frame t.
   The page provides the DOM skeleton (see video-expectativa.html) and its own story. */

/* ---------- stage ---------- */
const QS = new URLSearchParams(location.search);
const FMT = (QS.get('format') || 'v').startsWith('h') ? 'h' : 'v';
const V = FMT === 'v';
const W = V ? 1080 : 1920, H = V ? 1920 : 1080;
const $ = (id) => document.getElementById(id);

/* ---------- math ---------- */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  outCubic: (x) => 1 - Math.pow(1 - x, 3),
  inCubic: (x) => x * x * x,
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  outExpo: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  inOutSine: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
  outBack: (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  outBackSoft: (x) => { const c1 = 0.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
};
const ease = (t, a, b, fn = E.outCubic) => fn(prog(t, a, b));
const env = (t, a, din, b, dout, fin = E.outCubic, fout = E.inCubic) => {
  if (t < a || t > b + dout) return 0;
  if (t < a + din) return fin(prog(t, a, a + din));
  if (t > b) return 1 - fout(prog(t, b, b + dout));
  return 1;
};
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const lerpRect = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), w: lerp(a.w, b.w, k), h: lerp(a.h, b.h, k), r: lerp(a.r ?? 0, b.r ?? 0, k) });
function place(el, r) { el.style.left = r.x + 'px'; el.style.top = r.y + 'px'; el.style.width = r.w + 'px'; el.style.height = r.h + 'px'; if (r.r !== undefined) el.style.borderRadius = r.r + 'px'; }
function show(el, o) { el.style.opacity = o; el.style.visibility = o <= 0.001 ? 'hidden' : 'visible'; }
function fade(el, o) { el.style.opacity = o; }
function disp(el, on) { el.style.display = on ? '' : 'none'; }
function cover(w, h, fx = 0.5, fy = 0.45, zoom = 1) {
  const side = Math.max(w, h) * zoom;
  return { x: clamp(w / 2 - fx * side, w - side, 0), y: clamp(h / 2 - fy * side, h - side, 0), w: side, h: side };
}
/* piecewise path: [[t, rect], ...] with eased moves between consecutive keys (hold = same rect twice) */
function pathAt(t, keys, fn = E.inOutCubic) {
  if (t <= keys[0][0]) return { ...keys[0][1] };
  for (let i = 0; i < keys.length - 1; i++) {
    const [ta, ra] = keys[i], [tb, rb] = keys[i + 1];
    if (t < tb) return lerpRect(ra, rb, fn(prog(t, ta, tb)));
  }
  return { ...keys[keys.length - 1][1] };
}

/* ---------- icons, flower, wordmark (paths from the app's ui.tsx / Flowers.tsx) ---------- */
const ICONS = {
  back: '<path d="M15 5 8 12l7 7"/>',
  camera: '<path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.6l1.3-1.8A2 2 0 0 1 11 3.4h2a2 2 0 0 1 1.6.8L15.9 6h1.6A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z"/><circle cx="12" cy="12.4" r="3.6"/>',
  gallery: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="m20.5 16-4.8-4.6a1.5 1.5 0 0 0-2.1 0L5 19.5"/>',
  scissors: '<circle cx="6.5" cy="6.5" r="2.8"/><circle cx="6.5" cy="17.5" r="2.8"/><path d="M8.6 8.4 20 18.5M8.6 15.6 20 5.5"/>',
  palette: '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.3 0 2-.9 2-1.9 0-1.3-1-1.6-1-2.8 0-1 .8-1.8 1.8-1.8h2.1a3.6 3.6 0 0 0 3.6-3.6C20.5 6.6 16.7 3.5 12 3.5Z"/><circle cx="7.6" cy="11.4" r="1.2" fill="currentColor"/><circle cx="10" cy="7.6" r="1.2" fill="currentColor"/><circle cx="14.6" cy="7.6" r="1.2" fill="currentColor"/>',
  sparkles: '<path d="M11 3.5 12.6 8a3 3 0 0 0 1.9 1.9L19 11.5l-4.5 1.6a3 3 0 0 0-1.9 1.9L11 19.5 9.4 15a3 3 0 0 0-1.9-1.9L3 11.5l4.5-1.6A3 3 0 0 0 9.4 8z"/><path d="M18.5 3v3.5M16.8 4.8h3.5"/>',
  download: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M4.5 16.5v1.5A2 2 0 0 0 6.5 20h11a2 2 0 0 0 2-2v-1.5"/>',
  share: '<path d="M12 15V4M8 7.8 12 4l4 3.8"/><path d="M8 11H6.5A2 2 0 0 0 4.5 13v5A2 2 0 0 0 6.5 20h11a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H16"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.4-4.4"/>',
  switch: '<path d="M4 8a6 6 0 0 1 10-4.5M20 16a6 6 0 0 1-10 4.5M4 8V4M4 8h4M20 16v4M20 16h-4"/>',
  heart: '<path d="M12 20s-7.5-4.6-9.3-8.9C1.4 8 3.3 4.5 6.8 4.5c2 0 3.6 1.1 5.2 3 1.6-1.9 3.2-3 5.2-3 3.5 0 5.4 3.5 4.1 6.6C19.5 15.4 12 20 12 20z"/>',
  bookmark: '<path d="M6.5 4h11v16L12 16.3 6.5 20z"/>',
};
const ic = (name, size = 24, color = 'currentColor', sw = 2) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="flex:none;display:block">${ICONS[name]}</svg>`;
const flowerSVG = (size, petal = '#e879f9', center = '#f6c86b') =>
  `<svg width="${size}" height="${size}" viewBox="0 0 40 40" style="flex:none;display:block">${[0, 72, 144, 216, 288].map((r) => `<ellipse cx="20" cy="10.5" rx="6.2" ry="9.5" fill="${petal}" opacity=".92" transform="rotate(${r} 20 20)"/>`).join('')}<circle cx="20" cy="20" r="5" fill="${center}"/><circle cx="18.6" cy="18.6" r="1.4" fill="#fff" opacity=".7"/></svg>`;
const wordmark = (size, light = false) =>
  `<span class="wm ${light ? '' : 'grad'}" style="font-size:${size}px;${light ? 'color:#fff' : ''}">Beauty <span class="and" style="${light ? 'color:rgba(255,255,255,.75);-webkit-text-fill-color:rgba(255,255,255,.75)' : ''}">and</span> self</span>`;
const logoHTML = (flower, size, light = false) => `<div style="display:flex;align-items:center;gap:8px">${flowerSVG(flower)}${wordmark(size, light)}</div>`;
const starsHTML = (n, size) => `<span style="display:inline-flex;gap:${size * 0.15}px">${[0, 1, 2, 3, 4].map((i) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><path d="M12 2.8l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.6l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" fill="${i < n ? '#f6c86b' : '#e4def0'}"/></svg>`).join('')}</span>`;

/* ---------- assets ---------- */
const lookSrc = (id) => `assets/looks/${id}.jpg`;
const maskSrc = (id) => `assets/looks/${id}-mask.png`;
const cat = (id) => `assets/catalog/${id}.jpg`;

/* ---------- phone geometry (virtual 390x844 screen, like an iPhone) ---------- */
const PH_S = V ? 1.5 : 1.16;
const PH = V ? { x: (W - 410 * 1.5) / 2, y: 545 } : { x: 1300 - (410 * 1.16) / 2, y: (H - 864 * 1.16) / 2 };
const P = (vx, vy) => ({ x: PH.x + (10 + vx) * PH_S, y: PH.y + (10 + vy) * PH_S });
const PR = (vx, vy, vw, vh, vr = 0) => { const p = P(vx, vy); return { x: p.x, y: p.y, w: vw * PH_S, h: vh * PH_S, r: vr * PH_S }; };
const R = {
  camf: PR(0, 111, 390, 520, 0),
  thumb: PR(16, 127, 80, 107, 16),
  gen: PR(59, 143, 272, 363, 32),
  res: PR(16, 201, 358, 477, 28),
};
const SCREEN_TOP = P(0, 0).y, HEADER_BOTTOM = P(0, 111).y, SCREEN_BOTTOM = P(0, 844).y;

/* ---------- background ---------- */
const CORNER_SVG = `<svg viewBox="0 0 220 220" width="100%" height="100%"><path d="M10 210 C 60 160, 80 110, 150 60" stroke="#a78bfa" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M60 165 C 40 150, 30 135, 34 118 C 52 128, 60 145, 60 165Z" fill="#c4b5fd" opacity=".8"/><path d="M95 118 C 110 100, 128 96, 140 102 C 128 118, 112 122, 95 118Z" fill="#c4b5fd" opacity=".8"/><path d="M78 140 C 96 136, 108 142, 114 154 C 98 158, 86 152, 78 140Z" fill="#ddd6fe"/><g transform="translate(128 34)">${[0, 72, 144, 216, 288].map((r) => `<ellipse cx="22" cy="11" rx="8" ry="12" fill="#e879f9" transform="rotate(${r} 22 22)" opacity=".9"/>`).join('')}<circle cx="22" cy="22" r="6.5" fill="#f6c86b"/></g><g transform="translate(30 92) scale(.7)">${[0, 72, 144, 216, 288].map((r) => `<ellipse cx="22" cy="11" rx="8" ry="12" fill="#f9a8d4" transform="rotate(${r} 22 22)" opacity=".95"/>`).join('')}<circle cx="22" cy="22" r="6.5" fill="#f6c86b"/></g><circle cx="160" cy="112" r="5" fill="#c4b5fd"/><circle cx="172" cy="96" r="3.5" fill="#fbcfe8"/></svg>`;
function setupBg() {
  const S = Math.max(W, H);
  for (const [id, k, c] of [['blob1', 0.9, 'rgba(167,139,250,.38)'], ['blob2', 0.8, 'rgba(232,121,249,.28)'], ['blob3', 0.7, 'rgba(251,207,232,.6)']]) {
    const el = $(id); el.style.width = el.style.height = S * k + 'px'; el.style.background = `radial-gradient(circle, ${c} 0%, rgba(255,255,255,0) 65%)`;
  }
  const cs = V ? 380 : 330;
  for (const id of ['corner1', 'corner2']) { const c = $(id); c.innerHTML = CORNER_SVG; c.style.width = c.style.height = cs + 'px'; }
  $('corner1').style.left = (W - cs * 0.78) + 'px'; $('corner1').style.top = (-cs * 0.12) + 'px';
  $('corner2').style.left = (-cs * 0.2) + 'px'; $('corner2').style.top = (H - cs * 0.92) + 'px';
}
/* cool: 0..1 "doubt" grading; corners: 0..1 visibility of the floral corners */
function bgFrame(t, cool, corners) {
  const p = (el, x, y) => { el.style.transform = `translate(${x - parseFloat(el.style.width) / 2}px, ${y - parseFloat(el.style.height) / 2}px)`; };
  p($('blob1'), W * (0.12 + 0.08 * Math.sin(t * 0.35)), H * (0.16 + 0.05 * Math.cos(t * 0.3)));
  p($('blob2'), W * (0.92 + 0.06 * Math.cos(t * 0.28)), H * (0.7 + 0.06 * Math.sin(t * 0.33)));
  p($('blob3'), W * (0.55 + 0.1 * Math.sin(t * 0.2 + 1)), H * (0.5 + 0.08 * Math.cos(t * 0.25)));
  const sway = (k) => `rotate(${4 * Math.sin((t + k) * 2 * Math.PI / 7)}deg)`;
  $('corner1').style.transform = `scaleX(-1) ${sway(0)}`;
  $('corner2').style.transform = `rotate(-8deg) ${sway(2.3)}`;
  $('corner1').style.opacity = 0.75 * corners; $('corner2').style.opacity = 0.75 * corners;
  show($('cool'), cool * 0.9); show($('coolDim'), cool * 0.1);
  const r = rng(Math.floor(t * 30) + 7);
  $('grain').style.transform = `translate(${Math.floor(r() * 200)}px, ${Math.floor(r() * 200)}px)`;
  show($('vignette'), 0.5 + 0.5 * cool);
}

/* ---------- headlines (word by word, like the app's screen-in) ---------- */
const TEXTS = [];
const A = (s) => `<span class="acc grad">${s}</span>`;      // gradient Playfair accent
const AI = (s) => `<span class="acc">${s}</span>`;          // plain Playfair italic accent
function addHead({ id, html, tin, tout, x, y, w, size, align = 'left', stagger = 0.06, groups = null, label = null, color = null }) {
  const el = document.createElement('div');
  el.className = 'head';
  Object.assign(el.style, { left: x + 'px', top: y + 'px', width: w + 'px', fontSize: size + 'px', textAlign: align });
  if (color) el.style.color = color;
  const tmp = document.createElement('div'); tmp.innerHTML = html;
  const words = [];
  const walk = (node, cls) => {
    node.childNodes.forEach((n) => {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(' ')); return; }
          const s = document.createElement('span'); s.className = 'w' + (cls ? ' ' + cls : '');
          s.textContent = part; el.appendChild(s); words.push(s);
        });
      } else if (n.nodeName === 'BR') el.appendChild(document.createElement('br'));
      else walk(n, ((cls ? cls + ' ' : '') + (n.className || '')).trim());
    });
  };
  walk(tmp, '');
  $('textLayer').appendChild(el);
  let lab = null;
  if (label) {
    lab = document.createElement('div'); lab.className = 'label';
    lab.textContent = label.text;
    Object.assign(lab.style, { fontSize: label.size + 'px', left: x + 'px', width: w + 'px', textAlign: align, top: (y - label.size * 2) + 'px' });
    $('textLayer').appendChild(lab);
  }
  TEXTS.push({ id, el, words, tin, tout, stagger, groups, lab });
}
function headsFrame(t) {
  for (const T of TEXTS) {
    const visible = t >= T.tin - 0.01 && t <= T.tout + 0.32;
    T.el.style.visibility = visible ? 'visible' : 'hidden';
    if (T.lab) T.lab.style.visibility = visible ? 'visible' : 'hidden';
    if (!visible) continue;
    const out = ease(t, T.tout, T.tout + 0.3, E.inCubic);
    T.words.forEach((w, i) => {
      const start = T.groups ? T.tin + T.groups[i] : T.tin + i * T.stagger;
      const k = ease(t, start, start + 0.55, E.outExpo);
      w.style.opacity = k * (1 - out);
      w.style.transform = `translateY(${(1 - k) * 46 - out * 24}px)`;
      const blur = (1 - k) * 10 + out * 8;
      w.style.filter = blur > 0.05 ? `blur(${blur}px)` : 'none';
    });
    if (T.lab) {
      const k = ease(t, T.tin - 0.1, T.tin + 0.5, E.outCubic);
      T.lab.style.opacity = k * (1 - out);
      T.lab.style.letterSpacing = (0.16 + (1 - k) * 0.25) + 'em';
    }
  }
}
/* default headline positions per format */
const HV = (o) => ({ x: 60, w: W - 120, align: 'center', size: 80, ...o });
const HH = (o) => ({ x: 120, w: 820, align: 'left', size: 80, ...o });
const HQ = (v, h) => (V ? HV(v || {}) : HH(h || {}));

/* ---------- look stack: one photo element showing a client look, with sweep reveal / split ---------- */
function makeLooks(container, ids) {
  const map = {};
  for (const id of ids) {
    const wrap = document.createElement('div'); wrap.className = 'look';
    wrap.innerHTML = `<img src="${lookSrc(id)}" alt=""><div class="shine"></div>`;
    const shine = wrap.querySelector('.shine');
    shine.style.webkitMaskImage = shine.style.maskImage = `url(${maskSrc(id)})`;
    container.appendChild(wrap);
    map[id] = { wrap, shine };
  }
  return map;
}
/* state: { base, next, p (0..1 sweep progress), split (divider % or null), zoom } */
function drawLooks(map, r, { base, next = null, p = 0, split = null, zoom = 1, fy = 0.46 }) {
  const cv = cover(r.w, r.h, 0.5, fy, zoom);
  for (const [id, L] of Object.entries(map)) {
    if (id !== base && id !== next) { L.wrap.style.display = 'none'; continue; }
    L.wrap.style.display = 'block';
    place(L.wrap, cv);
    L.wrap.style.zIndex = id === next ? 2 : 1;
    if (id === next && split !== null) {
      // split view: the "after" look is visible to the right of the divider
      const left = (split / 100) * r.w - cv.x;
      L.wrap.style.webkitMaskImage = L.wrap.style.maskImage = 'none';
      L.wrap.style.clipPath = `inset(0 0 0 ${Math.max(0, left)}px)`;
      L.shine.style.opacity = 0;
    } else if (id === next) {
      const k = E.inOutSine(clamp(p)), F = 9, a = lerp(-F - 2, 102, k);
      L.wrap.style.clipPath = 'none';
      L.wrap.style.webkitMaskImage = L.wrap.style.maskImage = `linear-gradient(180deg, #000 0%, #000 ${a}%, transparent ${a + F}%)`;
      L.shine.style.background = `linear-gradient(180deg, rgba(255,240,250,0) ${a - 3}%, rgba(255,226,246,.8) ${a + F * 0.5}%, rgba(255,240,250,0) ${a + F + 1}%)`;
      L.shine.style.opacity = Math.sin(Math.PI * clamp(p)) * 0.75;
    } else {
      L.wrap.style.clipPath = 'none';
      L.wrap.style.webkitMaskImage = L.wrap.style.maskImage = 'none';
      L.shine.style.opacity = 0;
    }
  }
}
/* a sequence of look changes: [{t, to, d}] starting from `first` */
function lookAt(t, first, changes) {
  let base = first, next = null, p = 0;
  for (const c of changes) {
    if (t >= c.t + c.d) base = c.to;
    else if (t >= c.t) { next = c.to; p = (t - c.t) / c.d; break; }
  }
  return { base, next, p };
}

/* ---------- phone screens (HTML replicas of the app) ---------- */
const statusHTML = () => `
  <div class="island"></div>
  <div class="status" id="stTime" style="left:34px">9:41</div>
  <div class="status" id="stIcons" style="right:30px;display:flex;gap:6px;align-items:center">
    <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
    <svg width="26" height="12" viewBox="0 0 26 12"><rect x=".5" y=".5" width="22" height="11" rx="3.5" fill="none" stroke="currentColor" opacity=".5"/><rect x="2.5" y="2.5" width="16" height="7" rx="2" fill="currentColor"/></svg>
  </div>`;
const headerHTML = () => `<div class="hdr">
  <div class="iconbtn" style="left:12px;top:55px">${ic('back', 24, '#4c1d95')}</div>
  <div class="ab" style="left:66px;top:67px">${logoHTML(24, 21)}</div>
  <div class="iconbtn" style="left:330px;top:55px;box-shadow:0 0 0 2px #ddd6fe"><div class="brand" style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:17px">M</div></div>
</div>`;
const cameraScreenHTML = () => `<div class="scr" id="scrCam" style="background:#1a0933;color:#fff">
    <div class="iconbtn" style="left:12px;top:55px;background:rgba(255,255,255,.1)">${ic('back', 24, '#fff')}</div>
    <div class="ab" style="left:0;width:390px;top:69px;text-align:center;font-weight:850;font-size:17px;letter-spacing:.01em">Encaixe o rosto no contorno</div>
    <div class="ab" style="left:22px;top:678px;width:80px;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:14px;font-weight:800"><div style="width:56px;height:56px;border-radius:16px;background:rgba(255,255,255,.12);box-shadow:0 0 0 1px rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center">${ic('gallery', 26, '#fff')}</div>Galeria</div>
    <div class="ab" id="camShutter" style="left:153px;top:669px;width:84px;height:84px;border-radius:50%;background:rgba(255,255,255,.2);box-shadow:0 0 0 4px #fff;display:flex;align-items:center;justify-content:center"><div class="brand" style="width:64px;height:64px;border-radius:50%"></div></div>
    <div class="ab" style="left:288px;top:678px;width:80px;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:14px;font-weight:800"><div style="width:56px;height:56px;border-radius:16px;background:rgba(255,255,255,.12);box-shadow:0 0 0 1px rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center">${ic('switch', 26, '#fff')}</div>Virar</div>
    <div class="ab" id="camFlash" style="left:0;top:111px;width:390px;height:520px;background:#fff;opacity:0"></div>
  </div>`;
const generatingScreenHTML = () => `<div class="scr brand" id="scrGen" style="color:#fff">
    <div id="genPetals" class="layer"></div>
    <div class="ab" style="left:0;width:390px;top:64px;display:flex;justify-content:center">${logoHTML(26, 23, true)}</div>
    <div class="ab" style="left:0;width:390px;top:572px;text-align:center;font-size:29px;font-weight:850">Criando seu novo visual</div>
    <div class="ab" id="genMsg" style="left:0;width:390px;top:614px;text-align:center;font-size:18.5px;font-weight:700;color:var(--plum-100)"></div>
    <div class="ab" style="left:24px;top:680px;width:342px;height:12px;border-radius:999px;background:rgba(255,255,255,.2);overflow:hidden"><div id="genBar" style="height:100%;border-radius:999px;background:linear-gradient(90deg,#fbcfe8,#f6c86b)"></div></div>
    <div class="ab" style="left:0;width:390px;top:704px;text-align:center;font-size:14.5px;color:var(--plum-100)">Isso leva alguns segundos. Não feche esta tela.</div>
    <div class="ab" style="left:125px;top:744px;width:140px;height:48px;border-radius:16px;background:rgba(255,255,255,.15);box-shadow:0 0 0 1px rgba(255,255,255,.4);display:flex;align-items:center;justify-content:center;font-weight:850;font-size:16px">Cancelar</div>
  </div>`;
const resultScreenHTML = () => `<div class="scr" id="scrRes" style="background:var(--paper)">
    <div class="ab" id="resContent" style="left:0;top:0;width:390px;height:1100px">
      <div class="ab" style="left:16px;top:131px;display:flex;align-items:center;gap:8px;font-size:25.5px;font-weight:850;color:var(--plum-950)">${flowerSVG(26)}Seu novo visual</div>
      <div class="ab" id="resLabel" style="left:52px;top:168px;font-size:16.5px;font-weight:800;color:var(--plum-600);white-space:nowrap"></div>
      <div class="ab" style="left:16px;top:201px;width:358px;height:477px;border-radius:28px;background:var(--plum-100)"></div>
      <div class="toggles" style="top:694px"><div id="tgAfter" style="left:6px">Depois</div><div id="tgBefore" style="left:123px">Antes</div><div id="tgCompare" style="left:240px">Comparar</div></div>
      <div class="btn brand" style="top:774px;height:64px;color:#fff;font-size:19px;box-shadow:var(--shadow-lift)">${ic('download', 26, '#fff')}Salvar na galeria</div>
      <div class="btn" id="resShare" style="top:850px;height:56px;background:#fff;color:var(--plum-800);font-size:17.5px;box-shadow:0 0 0 2px var(--plum-200), var(--shadow-soft)">${ic('share', 22, '#4c1d95')}Enviar (WhatsApp…)</div>
    </div>
    ${headerHTML()}
  </div>`;
const cardHTML = (c, x, y, cls = '') => `<div class="card ${cls}" style="left:${x}px;top:${y}px"><div class="ph"><img src="${cat(c.id)}" alt=""></div>${c.sw ? `<span class="sw" style="background:linear-gradient(180deg, ${c.sw.join(', ')})"></span>` : ''}<div class="ck" style="opacity:0">${ic('check', 20, '#fff', 3)}</div><div class="tx"><div class="nm">${c.nm}</div><div class="ds">${c.ds}</div></div></div>`;
const cardPos = (i, top) => ({ x: 16 + (i % 2) * 185, y: top + Math.floor(i / 2) * 269 });
function setCard(card, selected, t, tSel) {
  const k = ease(t, tSel, tSel + 0.3, E.outBack);
  card.style.boxShadow = selected ? '0 0 0 3px #c026d3, var(--shadow-lift)' : '0 0 0 1px var(--plum-100), 0 4px 16px -10px rgb(76 29 149 / .4)';
  const ck = card.querySelector('.ck'); ck.style.opacity = selected ? 1 : 0; ck.style.transform = `scale(${selected ? k : 0})`;
  card.style.transform = `scale(${1 - 0.03 * env(t, tSel - 0.06, 0.06, tSel, 0.15)})`;
}
function setMode(el, on) {
  el.className = 'mode' + (on ? ' brand' : '');
  el.style.color = on ? '#fff' : '#4c1d95';
  el.style.boxShadow = on ? 'var(--shadow-soft)' : 'none';
}
function setGenerateButton(btn, txt, ready, t, tTap) {
  btn.className = 'btn' + (ready ? ' brand' : '');
  btn.style.background = ready ? '' : '#ede9fe';
  btn.style.color = ready ? '#fff' : '#4c1d95';
  btn.style.boxShadow = ready ? 'var(--shadow-lift)' : 'none';
  btn.style.transform = `scale(${1 - 0.03 * env(t, tTap - 0.05, 0.05, tTap, 0.15)})`;
  txt.textContent = ready ? 'Veja sua beleza' : txt.dataset.missing;
}
function setupGenerating() {
  const gp = $('genPetals');
  for (let i = 0; i < 14; i++) {
    const el = document.createElement('div'); el.className = 'petal';
    const size = 10 + ((i * 7) % 12);
    el.innerHTML = `<svg width="${size}" height="${size * 1.3}" viewBox="0 0 10 13"><path d="M5 0 C 9 3, 10 9, 5 13 C 0 9, 1 3, 5 0Z" fill="${['#f9a8d4', '#e879f9', '#c4b5fd', '#fbcfe8'][i % 4]}" opacity=".9"/></svg>`;
    gp.appendChild(el);
  }
  $('bloom').innerHTML = `<g id="bloomG">${[0, 45, 90, 135, 180, 225, 270, 315].map((r, i) => `<ellipse class="bp" cx="60" cy="33" rx="11" ry="24" fill="${i % 2 ? '#e879f9' : '#fbcfe8'}" transform="rotate(${r} 60 60)"/>`).join('')}<circle cx="60" cy="60" r="12" fill="#f6c86b"/><circle cx="56" cy="56" r="3.5" fill="#fff" opacity=".7"/></g>`;
  $('camContour').innerHTML = `<svg viewBox="0 0 300 400" width="100%" height="100%" preserveAspectRatio="none"><defs><mask id="fh"><rect width="300" height="400" fill="white"/><ellipse cx="150" cy="185" rx="92" ry="122" fill="black"/></mask></defs><rect width="300" height="400" fill="rgb(26 9 51 / .45)" mask="url(#fh)"/><ellipse cx="150" cy="185" rx="92" ry="122" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="7 7" opacity=".9"/></svg>`;
}
/* generating screen animation between t0 (in) and t1 (out), messages switch at tMsg */
function generatingFrame(t, t0, t1, msgs, tMsg, phoneOn) {
  const bl = $('bloom'), bp = P(139, 446);
  bl.style.left = bp.x + 'px'; bl.style.top = bp.y + 'px'; bl.style.width = bl.style.height = 112 * PH_S + 'px';
  show(bl, phoneOn * ease(t, t0 + 0.06, t0 + 0.36) * (1 - ease(t, t1 - 0.1, t1)));
  $('bloomG').setAttribute('transform', `rotate(${(t - t0) * 20} 60 60)`);
  $('bloom').querySelectorAll('.bp').forEach((p, i) => {
    const b = 0.55 + 0.45 * E.outBack(clamp((t - t0 - 0.1 - i * 0.06) / 0.5));
    const r = [0, 45, 90, 135, 180, 225, 270, 315][i];
    p.setAttribute('transform', `rotate(${r} 60 60) translate(60 60) scale(${b}) translate(-60 -60)`);
  });
  const m = $('genMsg');
  m.textContent = t < tMsg ? msgs[0] : msgs[1];
  m.style.opacity = t < tMsg ? 1 - ease(t, tMsg - 0.13, tMsg) : ease(t, tMsg, tMsg + 0.15);
  $('genBar').style.width = (4 + 96 * ease(t, t0 + 0.1, t1 - 0.1, (x) => 1 - Math.pow(1 - x, 2))) + '%';
  [...$('genPetals').children].forEach((el, i) => {
    const dur = 7 + (i % 5) * 1.6, delay = -(i * 1.3), left = (i * 37) % 100;
    const ph2 = (((t * 2.2 - delay) % dur) + dur) % dur / dur;
    const drift = ((i % 3) - 1) * 60 * Math.sin(ph2 * Math.PI);
    el.style.transform = `translate(${left * 3.9 + drift}px, ${ph2 * 900 - 30}px) rotate(${ph2 * (i % 2 ? 320 : -280)}deg)`;
  });
}
/* which phone screen is on: [[id, tIn, tOut], ...] — cross-slide like the app's screen-in */
function screensFrame(t, screens) {
  for (const [id, a, b] of screens) {
    const el = $(id);
    const on = ease(t, a, a + 0.2, E.outCubic) * (1 - ease(t, b - 0.08, b, E.inCubic));
    if (on <= 0.001) { el.style.display = 'none'; continue; }
    el.style.display = 'block';
    el.style.opacity = id === 'scrCam' ? 1 : on;
    el.style.transform = id === 'scrCam' ? 'none' : `translateY(${(1 - on) * 14}px)`;
    el.style.zIndex = { scrCam: 1, scrChoose: 2, scrGen: 3, scrRes: 4 }[id] || 2;
  }
}
/* phone fade/scale in & out around the camera frame center */
function phoneFrame(t, tIn, tOut) {
  const ph = $('phone');
  const k = ease(t, tIn, tIn + 0.66, E.outCubic), out = ease(t, tOut, tOut + 0.35, E.inCubic);
  show(ph, k * (1 - out));
  const s = (1.04 - 0.04 * k) * (1 - 0.06 * out);
  const cx = R.camf.x + R.camf.w / 2, cy = R.camf.y + R.camf.h / 2;
  ph.style.left = (cx - (cx - PH.x) * s) + 'px'; ph.style.top = (cy - (cy - PH.y) * s) + 'px';
  ph.style.transform = `scale(${PH_S * s})`;
  return k * (1 - out);
}
/* finger with taps: [{t, x, y}] in phone coordinates; vis = 0..1 */
function fingerFrame(t, taps, vis, ripplePaused = () => false) {
  const f = $('finger'), rp = $('ripple');
  show(f, vis * 0.95);
  let pos = null, pressed = 0;
  for (let i = 0; i < taps.length; i++) {
    const a = taps[i], b = taps[i + 1], sa = P(a.x, a.y);
    if (i === 0 && t < a.t) { const k3 = ease(t, a.t - 0.5, a.t - 0.04, E.inOutCubic); pos = { x: lerp(sa.x + 150, sa.x, k3), y: lerp(sa.y + 240, sa.y, k3) }; break; }
    if (!b) { const k3 = ease(t, a.t + 0.15, a.t + 0.55, E.inOutCubic); pos = { x: sa.x + 130 * k3, y: sa.y + 200 * k3 }; break; }
    if (t < b.t) {
      const sb = P(b.x, b.y);
      const k3 = ease(t, Math.max(a.t + 0.12, b.t - Math.min(0.55, b.t - a.t - 0.12)), b.t - 0.06, E.inOutCubic);
      pos = { x: lerp(sa.x, sb.x, k3), y: lerp(sa.y, sb.y, k3) + Math.sin(Math.PI * k3) * -40 };
      break;
    }
  }
  for (const tp of taps) { const d = t - tp.t; if (d > -0.08 && d < 0.18) pressed = Math.max(pressed, 1 - Math.abs(d - 0.02) / 0.12); }
  if (pos) { f.style.left = pos.x + 'px'; f.style.top = pos.y + 'px'; }
  f.style.transform = `scale(${1 - 0.18 * clamp(pressed)})`;
  let rk = -1, rpos = null;
  for (const tp of taps) { const d = t - tp.t; if (d >= 0 && d < 0.5) { rk = d / 0.5; rpos = P(tp.x, tp.y); } }
  if (rk >= 0 && !ripplePaused(t) && vis > 0) { show(rp, (1 - rk) * 0.9 * vis); rp.style.left = rpos.x + 'px'; rp.style.top = rpos.y + 'px'; rp.style.transform = `scale(${1 + 1.6 * E.outCubic(rk)})`; }
  else show(rp, 0);
}
/* photo overlays: camera contour and generating scan follow a rect */
function photoOverlays(t, r, camWin, genWin) {
  const cc = $('camContour');
  const ck = ease(t, camWin[0], camWin[0] + 0.2) * (1 - ease(t, camWin[1], camWin[1] + 0.15));
  if (ck > 0.001) { place(cc, R.camf); show(cc, ck); } else show(cc, 0);
  const go = $('genOverlay');
  const gk = env(t, genWin[0], 0.3, genWin[1], 0.25);
  if (gk > 0.001 && r) {
    place(go, { ...r }); show(go, gk);
    const ph = (t * 0.9) % 1;
    go.querySelector('.shim').style.background = `linear-gradient(100deg, transparent ${ph * 160 - 60}%, rgba(255,255,255,.55) ${ph * 160 - 30}%, transparent ${ph * 160}%)`;
    go.querySelector('.scan').style.top = (((t * 0.7) % 1) * 150 - 50) + '%';
  } else show(go, 0);
}

/* ---------- before/after card that becomes the app icon ---------- */
function setupBA(before, after) {
  $('baBefore').src = lookSrc(before);
  $('baAfterImg').src = lookSrc(after);
  $('labAntes').style.left = '26px';
  $('labDepois').style.right = '26px';
  $('baFlower').innerHTML = `<g id="baFlowerG" transform="translate(32 32)">${[0, 72, 144, 216, 288].map((r) => `<ellipse class="fp" cx="0" cy="-12" rx="7.5" ry="12" fill="#fbcfe8" opacity=".95" transform="rotate(${r})"/>`).join('')}<circle id="fpC" r="6.5" fill="#f6c86b"/><circle cx="-2" cy="-2" r="1.8" fill="#fff" opacity=".7"/></g>`;
}
/* o: { t0 (visible from), rect (card), logo {cx, cy, s}, tMorph, divider(t) -> % or null, uiWin [in, out] } */
function baFrame(t, o) {
  const ba = $('ba');
  if (t < o.t0) { disp(ba, false); return; }
  disp(ba, true);
  const m = ease(t, o.tMorph, o.tMorph + 0.6, E.inOutCubic);
  const L = o.logo;
  const icon = { x: L.cx - L.s / 2, y: L.cy - L.s / 2, w: L.s, h: L.s, r: L.s * 0.25 };
  const r = lerpRect(o.rect, icon, m);
  place(ba, r);
  ba.style.transform = `scale(${1 + 0.02 * Math.sin((t - o.tMorph - 0.7) * 2.2) * ease(t, o.tMorph + 1.3, o.tMorph + 1.9)})`;
  const cv = cover(r.w, r.h, 0.5, 0.46, 1);
  place($('baBefore'), cv); place($('baAfterImg'), cv);
  const D = o.divider ? o.divider(t) : 0;
  $('baAfter').style.clipPath = `inset(0 0 0 ${D}%)`;
  const ui = o.divider ? ease(t, o.uiWin[0], o.uiWin[0] + 0.2) * (1 - ease(t, o.uiWin[1], o.uiWin[1] + 0.2, E.inCubic)) : 0;
  $('baLine').style.left = D + '%'; fade($('baLine'), ui);
  const kn = $('baKnob'); kn.style.left = D + '%'; kn.style.top = '52%'; fade(kn, ui); kn.style.transform = `scale(${0.6 + 0.4 * ui})`;
  fade($('labAntes'), ui * clamp((D - 8) / 10)); fade($('labDepois'), ui * clamp((92 - D) / 10));
  fade($('baTint'), ease(t, o.tMorph + 0.12, o.tMorph + 0.48, E.inOutSine));
  ba.style.boxShadow = `0 ${40 - 18 * m}px ${90 - 40 * m}px -30px rgb(46 16 101 / ${0.5 - 0.1 * m})`;
  const fl = $('baFlower');
  fade(fl, ease(t, o.tMorph + 0.4, o.tMorph + 0.65));
  fl.querySelectorAll('.fp').forEach((p, i) => {
    const k = E.outBack(clamp((t - o.tMorph - 0.5 - i * 0.07) / 0.45));
    p.setAttribute('transform', `rotate(${[0, 72, 144, 216, 288][i]}) scale(${Math.max(0.001, k)})`);
  });
  $('fpC').setAttribute('r', 6.5 * E.outBack(clamp((t - o.tMorph - 0.75) / 0.35)));
  $('baFlowerG').setAttribute('transform', `translate(32 32) rotate(${(t - o.tMorph - 0.5) * 8})`);
}

/* ---------- end card ---------- */
function setupEnd(L, tagHTML) {
  const word = $('word');
  word.innerHTML = '';
  for (const [txt, cls] of [['Beauty', ''], [' ', ''], ['and', 'and'], [' ', ''], ['self', '']]) for (const ch of txt) {
    const s = document.createElement('span'); s.className = 'c' + (cls ? ' and' : '');
    s.textContent = ch === ' ' ? ' ' : ch; word.appendChild(s);
  }
  word.className = 'wm';
  const letters = [...word.children], nn = letters.length;
  letters.forEach((c, i) => {
    if (c.classList.contains('and')) return;
    const k = i / (nn - 1), a = [0x5b, 0x21, 0xb6], b = [0xc0, 0x26, 0xd3];
    c.style.color = `rgb(${a.map((v, j) => Math.round(v + (b[j] - v) * k)).join(',')})`;
  });
  word.style.fontSize = (V ? 112 : 104) + 'px'; word.style.width = W + 'px';
  word.style.top = (L.cy + L.s / 2 + (V ? 44 : 32)) + 'px';
  const tg = $('tagline');
  tg.style.width = W + 'px'; tg.style.top = (L.cy + L.s / 2 + (V ? 196 : 166)) + 'px';
  tg.style.font = `850 ${V ? 60 : 54}px var(--sans)`; tg.style.color = 'var(--plum-950)'; tg.style.letterSpacing = '-0.015em';
  tg.innerHTML = tagHTML;
  const sb = $('sub');
  sb.style.width = W + 'px'; sb.style.top = (L.cy + L.s / 2 + (V ? 292 : 250)) + 'px';
  sb.style.font = `700 ${V ? 34 : 30}px/1.35 var(--sans)`; sb.style.color = 'var(--ink-soft)';
  sb.innerHTML = V ? 'Provador virtual de cortes e cores<br>com IA, feito para salões de beleza' : 'Provador virtual de cortes e cores com IA, feito para salões de beleza';
  const cta = $('cta');
  cta.style.fontSize = (V ? 34 : 30) + 'px'; cta.style.padding = V ? '26px 52px' : '22px 46px';
  cta.style.top = (L.cy + L.s / 2 + (V ? 430 : 330)) + 'px';
}
/* t0 = moment the icon flower starts blooming */
function endFrame(t, t0) {
  const word = $('word');
  word.style.visibility = t >= t0 + 0.1 ? 'visible' : 'hidden';
  const chars = [...word.children], n = chars.length;
  const sh = prog(t, t0 + 1.85, t0 + 2.75);
  chars.forEach((c, i) => {
    const a = t0 + 0.2 + i * 0.04, k = ease(t, a, a + 0.6, E.outExpo);
    c.style.opacity = k; c.style.transform = `translateY(${(1 - k) * 50}px)`;
    c.style.filter = k < 0.98 ? `blur(${(1 - k) * 10}px)` : 'none';
    const pos = lerp(-0.3, 1.3, E.inOutSine(sh));
    const f = sh > 0 && sh < 1 ? Math.exp(-Math.pow((i / (n - 1) - pos) / 0.14, 2)) : 0;
    c.style.textShadow = f > 0.01 ? `0 0 ${24 * f}px rgba(232,121,249,${0.9 * f})` : 'none';
  });
  const tg = $('tagline'), tk = ease(t, t0 + 0.8, t0 + 1.35, E.outExpo);
  show(tg, tk); tg.style.transform = `translateY(${(1 - tk) * 40}px)`; tg.style.filter = tk < 0.98 ? `blur(${(1 - tk) * 8}px)` : 'none';
  const sb = $('sub'), sk = ease(t, t0 + 1.15, t0 + 1.65, E.outExpo);
  show(sb, sk); sb.style.transform = `translateY(${(1 - sk) * 30}px)`;
  const cta = $('cta'), ck = ease(t, t0 + 1.45, t0 + 1.95, E.outBack);
  show(cta, clamp(ck * 1.5));
  cta.style.left = (W / 2) + 'px';
  cta.style.transform = `translateX(-50%) scale(${0.6 + 0.4 * ck})`;
}

/* ---------- sparkles, petals, light leaks ---------- */
const SPARK_POOL = [];
function setupSparks() {
  const fills = ['#ffffff', '#f6c86b', '#f9a8d4', '#e879f9'];
  for (let i = 0; i < 64; i++) {
    const el = document.createElement('div'); el.className = 'spark';
    el.innerHTML = `<svg viewBox="0 0 40 40" width="40" height="40"><path d="M20 0 C21.5 13 27 18.5 40 20 C27 21.5 21.5 27 20 40 C18.5 27 13 21.5 0 20 C13 18.5 18.5 13 20 0Z" fill="${fills[i % 4]}"/></svg>`;
    $('sparkLayer').appendChild(el); SPARK_POOL.push(el);
  }
  for (let i = 0; i < 18; i++) {
    const el = document.createElement('div'); el.className = 'petal';
    const size = (V ? 22 : 18) + ((i * 7) % 16);
    el.innerHTML = `<svg width="${size}" height="${size * 1.3}" viewBox="0 0 10 13"><path d="M5 0 C 9 3, 10 9, 5 13 C 0 9, 1 3, 5 0Z" fill="${['#f9a8d4', '#e879f9', '#c4b5fd', '#fbcfe8'][i % 4]}" opacity=".85"/></svg>`;
    $('petalLayer').appendChild(el);
  }
}
function sparksFrame(t, bursts, petalsFrom) {
  let used = 0;
  for (const b of bursts) {
    if (t < b.t - 0.01 || t > b.t + 1.6) continue;
    const r = rng(b.seed * 7919);
    for (let i = 0; i < b.n && used < SPARK_POOL.length; i++) {
      let px = r(), py = r();
      if (b.edge) { const side = Math.floor(r() * 4); if (side === 0) py = r() * 0.15; else if (side === 1) py = 0.85 + r() * 0.15; else if (side === 2) px = r() * 0.12; else px = 0.88 + r() * 0.12; }
      const delay = r() * 0.6, life = 0.6 + r() * 0.5, size = 0.5 + r() * 0.9, spin = (r() - 0.5) * 180;
      const lt = (t - b.t - delay) / life;
      if (lt < 0 || lt > 1) continue;
      const el = SPARK_POOL[used++];
      el.style.visibility = 'visible'; el.style.opacity = Math.min(1, Math.sin(Math.PI * lt) * 1.4);
      el.style.left = (b.x + px * b.w) + 'px'; el.style.top = (b.y + py * b.h - lt * 20) + 'px';
      el.style.transform = `scale(${Math.sin(Math.PI * lt) * size}) rotate(${spin * lt}deg)`;
    }
  }
  for (let i = used; i < SPARK_POOL.length; i++) SPARK_POOL[i].style.visibility = 'hidden';
  const pk = ease(t, petalsFrom, petalsFrom + 0.8);
  [...$('petalLayer').children].forEach((el, i) => {
    if (pk <= 0) { el.style.visibility = 'hidden'; return; }
    el.style.visibility = 'visible';
    const dur = 5 + (i % 5) * 0.9, left = ((i * 37) % 100) / 100;
    const ph2 = ((t - petalsFrom + i * 0.37) % dur) / dur;
    const x = left * W + ((i % 3) - 1) * 70 * Math.sin(ph2 * Math.PI * 1.5);
    el.style.opacity = pk * 0.85 * Math.sin(Math.PI * ph2);
    el.style.transform = `translate(${x}px, ${ph2 * (H + 80) - 60}px) rotate(${ph2 * (i % 2 ? 300 : -260)}deg)`;
  });
}
function leakFrame(t, leaks) {
  const el = $('leak'), S = Math.max(W, H) * 1.6;
  el.style.width = S + 'px'; el.style.height = S * 0.5 + 'px';
  let on = null;
  for (const L of leaks) if (t >= L.t && t <= L.t + L.d) on = L;
  if (!on) { el.style.visibility = 'hidden'; return; }
  const k = (t - on.t) / on.d;
  el.style.visibility = 'visible';
  el.style.background = 'linear-gradient(90deg, rgba(240,200,255,0) 0%, rgba(232,121,249,.45) 35%, rgba(251,207,232,.75) 50%, rgba(196,181,253,.45) 65%, rgba(240,200,255,0) 100%)';
  el.style.opacity = Math.sin(Math.PI * k) * 0.5;
  el.style.transform = `translate(${lerp(-S * 0.75, W - S * 0.2, E.inOutSine(k))}px, ${H / 2 - S * 0.25}px) rotate(-24deg)`;
  el.style.filter = 'blur(30px)';
}

/* ---------- boot ---------- */
async function boot(duration, setup, seekFn, maskIds) {
  $('stage').style.width = W + 'px';
  $('stage').style.height = H + 'px';
  setup();
  await document.fonts.ready;
  await Promise.all([...document.images].map((im) => (im.complete && im.naturalWidth ? Promise.resolve() : im.decode().catch(() => {}))));
  await Promise.all(maskIds.map((id) => new Promise((res) => { const im = new Image(); im.onload = im.onerror = res; im.src = maskSrc(id); })));
  const seek = (t) => seekFn(clamp(t, 0, duration));
  window.seek = seek;
  window.DURATION = duration;
  window.FORMAT = { W, H, FMT };
  seek(0);
  window.__ready = true;
  if (QS.get('play')) {
    const t0 = performance.now();
    const loop = () => { seek(((performance.now() - t0) / 1000) % duration); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
}
