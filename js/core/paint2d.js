'use strict';
// 2D 作画引擎：纸、笔触、合成

/* ================= 2D 作画引擎 ================= */
const W = 800, H = 1000, MW = W / 2, MH = H / 2;
function mk(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
const ctx2 = c => c.getContext('2d', { willReadFrequently: false });

const linen = (i, j) => (Math.sin(i * 1.15) > .55 ? 1 : 0) * .55 + (Math.sin(j * 1.15 + (Math.floor(i / 5.46) % 2) * 1.6) > .55 ? 1 : 0) * .45;
function makePaper(baseHex, seed, weave) {
  const c = mk(), x = ctx2(c), id = x.createImageData(W, H), b = hex(baseHex), r = rngOf(seed);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    let n = (r() - .5) * 9 + Math.sin(i * .05 + Math.sin(j * .02) * 3) * 1.2 + Math.sin(j * .37 + i * .013) * .8;
    if (weave) n += -linen(i, j) * 16 + Math.sin(i * .21 + j * .003) * 3;
    const o = (j * W + i) * 4;
    id.data[o] = b[0] + n; id.data[o + 1] = b[1] + n; id.data[o + 2] = b[2] + n * .9; id.data[o + 3] = 255;
  }
  x.putImageData(id, 0, 0);
  const g = x.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .78);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(70,45,10,.07)');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  return c;
}
const grain = (() => {
  const c = mk(), x = ctx2(c), id = x.createImageData(W, H), r = rngOf(77);
  for (let i = 0; i < W * H; i++) { const v = r(); id.data[i * 4 + 3] = v < .45 ? (.45 - v) / .45 * 255 : 0; }
  x.putImageData(id, 0, 0); return c;
})();

// 亚麻布纹：油画颜料在布纹的凹处会薄一点
const weave = (() => {
  const c = mk(), x = ctx2(c), id = x.createImageData(W, H), r = rngOf(31);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) id.data[(j * W + i) * 4 + 3] = clamp(linen(i, j) * (.7 + r() * .5), 0, 1) * 255;
  x.putImageData(id, 0, 0); return c;
})();

function makeMask(fn, q = 2) {
  const mw = W / q, mh = H / q, h = q / 2 | 0, c = mk(mw, mh), x = ctx2(c), id = x.createImageData(mw, mh), a = new Float32Array(mw * mh);
  for (let j = 0; j < mh; j++) for (let i = 0; i < mw; i++) {
    const v = clamp(fn(i * q + h, j * q + h), 0, 1); a[j * mw + i] = v; id.data[(j * mw + i) * 4 + 3] = v * 255;
  }
  x.putImageData(id, 0, 0);
  c.sample = (px, py) => a[clamp(py / q | 0, 0, mh - 1) * mw + clamp(px / q | 0, 0, mw - 1)];
  return c;
}

function tracePath(c, p, ox = 0, oy = 0) {
  c.beginPath(); c.moveTo(p[0] + ox, p[1] + oy);
  if (p.length === 4) { c.lineTo(p[2] + ox, p[3] + oy); return; }
  for (let i = 2; i < p.length - 2; i += 2) {
    c.quadraticCurveTo(p[i] + ox, p[i + 1] + oy, (p[i] + p[i + 2]) / 2 + ox, (p[i + 1] + p[i + 3]) / 2 + oy);
  }
  c.lineTo(p[p.length - 2] + ox, p[p.length - 1] + oy);
}
function drawStroke(c, s) {
  c.lineCap = 'round'; c.lineJoin = 'round';
  if (s.k === 'dot') { c.globalAlpha = s.a; c.fillStyle = s.c; c.beginPath(); c.arc(s.x, s.y, s.r, 0, 7); c.fill(); c.globalAlpha = 1; return; }
  const p = s.p;
  if (s.k === 'oil') { drawOil(c, s); return; }
  // 水粉的大笔触用平头笔：方头，不留一排圆点
  if (s.k === 'brush' && s.w > 9) c.lineCap = 'butt';
  c.globalAlpha = s.a; c.strokeStyle = s.c; c.lineWidth = s.w; tracePath(c, p); c.stroke();
  if (s.k === 'brush') {
    const dx = p[p.length - 2] - p[0], dy = p[p.length - 1] - p[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, r = rngOf(s.seed);
    for (let b = 0; b < 5; b++) {
      const off = (r() - .5) * s.w * .85;
      c.globalAlpha = s.a * (.25 + r() * .25); c.strokeStyle = r() < .5 ? s.c2 : s.c3; c.lineWidth = s.w * (.07 + r() * .12);
      tracePath(c, p, nx * off, ny * off); c.stroke();
    }
  }
  c.globalAlpha = 1;
}
// 油画笔触：颜料有厚度。光从左上来，所以每一笔左上边缘亮、右下边缘落一道暗边，中间是猪鬃留下的沟
function drawOil(c, s) {
  const p = s.p, h = s.h || 0, dx = p[p.length - 2] - p[0], dy = p[p.length - 1] - p[1], L = Math.hypot(dx, dy) || 1;
  let nx = -dy / L, ny = dx / L; if (nx * -.7 + ny * -.7 < 0) { nx = -nx; ny = -ny; }
  const r = rngOf(s.seed);
  c.lineCap = s.cap || 'round';
  if (h > 0) { c.globalAlpha = s.a * .5 * h; c.strokeStyle = s.c3; c.lineWidth = s.w; tracePath(c, p, -nx * s.w * .12 + 1.4 * h, -ny * s.w * .12 + 1.4 * h); c.stroke(); }
  c.globalAlpha = s.a; c.strokeStyle = s.c; c.lineWidth = s.w; tracePath(c, p); c.stroke();
  for (let b = 0; b < 5; b++) {
    const off = (r() - .5) * s.w * .85, dark = b % 2 === 0;
    c.globalAlpha = s.a * (dark ? .32 + h * .25 : .22 + h * .3); c.strokeStyle = dark ? s.c3 : s.c2; c.lineWidth = s.w * (.04 + r() * .08);
    tracePath(c, p, nx * off, ny * off); c.stroke();
  }
  if (h > 0) { c.globalAlpha = s.a * .7 * h; c.strokeStyle = s.c4 || s.c2; c.lineWidth = Math.max(1, s.w * .12); tracePath(c, p, nx * s.w * .36, ny * s.w * .36); c.stroke(); }
  c.lineCap = 'round'; c.globalAlpha = 1;
}
const oilS = (p, w, col, a, h, cap) => ({ k: 'oil', p, w, c: rgb(col), c2: rgb(col, 1.15), c3: rgb(col, .7), c4: rgb(mixc(col, [255, 250, 235], .55)), a, h, cap, seed: (p[0] * 131 + p[1] * 71) | 0 });
function strokeEnd(s) { return s.k === 'dot' ? [s.x, s.y] : [s.p[s.p.length - 2], s.p[s.p.length - 1]]; }

// 把一层笔触按蒙版合成到目标画布上
function compositePass(dst, pass, lay, tmp, paper) {
  const t = ctx2(tmp);
  t.globalCompositeOperation = 'copy'; t.drawImage(lay, 0, 0);
  if (pass.mask) { t.globalCompositeOperation = 'destination-in'; t.drawImage(pass.mask, 0, 0, W, H); }
  if (pass.grain) { t.globalCompositeOperation = 'destination-out'; t.globalAlpha = pass.grain; t.drawImage(pass.tooth === 'weave' ? weave : grain, 0, 0); t.globalAlpha = 1; }
  if (pass.mode === 'erase') { t.globalCompositeOperation = 'source-in'; t.drawImage(paper, 0, 0); }
  t.globalCompositeOperation = 'source-over';
  dst.globalAlpha = pass.opacity ?? 1; dst.globalCompositeOperation = pass.blend || 'source-over'; dst.drawImage(tmp, 0, 0); dst.globalAlpha = 1; dst.globalCompositeOperation = 'source-over';
}

/* 笔触生成器 */
function hatch(rng, o) {
  const { m, box = [0, 0, W, H], cell = 80, gap = 5, angles = [-.8], w = 1.3, c = '#2a2826', a = .5, bow = 6, thr = .03 } = o;
  const S = [], cells = [];
  for (let y = box[1]; y < box[3]; y += cell) for (let x = box[0]; x < box[2]; x += cell) {
    const cx = x + cell / 2, cy = y + cell / 2, h = cell * .6;
    let mx = 0;
    for (const [u, v] of [[0, 0], [-h, -h], [h, -h], [-h, h], [h, h], [-h, 0], [h, 0], [0, -h], [0, h]]) mx = Math.max(mx, m.sample(cx + u, cy + v));
    if (mx > thr) cells.push([cx, cy, cy + rng() * cell * 1.6]);
  }
  cells.sort((p, q) => p[2] - q[2]);
  for (const [cx, cy] of cells) for (const ang of angles) {
    const dx = Math.cos(ang), dy = Math.sin(ang), px = -dy, py = dx, n = Math.ceil(cell * 1.25 / gap);
    for (let i = 0; i < n; i++) {
      const off = (i - n / 2) * gap + (rng() - .5) * gap * .5, L = cell * (.95 + rng() * .5);
      const sx = cx + px * off - dx * L / 2 + (rng() - .5) * 8, sy = cy + py * off - dy * L / 2 + (rng() - .5) * 8;
      const ex = sx + dx * L, ey = sy + dy * L, b = (rng() - .5) * bow;
      S.push({ k: 'line', p: [sx, sy, (sx + ex) / 2 + px * b, (sy + ey) / 2 + py * b, ex, ey], w: w * 1.3 * (.8 + rng() * .4), c, a: Math.min(1, a * 1.8 * (.7 + rng() * .5)) });
    }
  }
  return S;
}
function brushes(rng, o) {
  const { m, box = [0, 0, W, H], cell = 24, w = [20, 30], len = [40, 80], dir, col, a = .95, thr = .04, per = 1, kind = 'brush', h = 0 } = o;
  const S = [], cells = [];
  for (let y = box[1]; y < box[3]; y += cell) for (let x = box[0]; x < box[2]; x += cell) {
    const cx = x + cell / 2 + (rng() - .5) * cell * .6, cy = y + cell / 2 + (rng() - .5) * cell * .6;
    const h = cell * .7;
    const mx = Math.max(m.sample(cx, cy), m.sample(cx - h, cy), m.sample(cx + h, cy), m.sample(cx, cy - h), m.sample(cx, cy + h));
    if (mx > thr) cells.push([cx, cy, cy + rng() * cell * 3]);
  }
  cells.sort((p, q) => p[2] - q[2]);
  for (const [cx, cy] of cells) for (let k = 0; k < per; k++) {
    const ang = dir(cx, cy) + (rng() - .5) * .5, L = lerp(len[0], len[1], rng()), dx = Math.cos(ang), dy = Math.sin(ang);
    const sx = cx - dx * L / 2 + (rng() - .5) * cell * .4, sy = cy - dy * L / 2 + (rng() - .5) * cell * .4, b = (rng() - .5) * L * .2;
    const base = col(cx, cy), j = 1 + (rng() - .5) * .1;
    S.push({ k: kind, h, p: [sx, sy, sx + dx * L / 2 - dy * b, sy + dy * L / 2 + dx * b, sx + dx * L, sy + dy * L], w: lerp(w[0], w[1], rng()), c: rgb(base, j), c2: rgb(base, j * 1.14), c3: rgb(base, j * (kind === 'oil' ? .7 : .82)), c4: rgb(mixc(base, [255, 250, 235], .5)), a, seed: rng() * 1e9 | 0 });
  }
  return S;
}
function sketchLine(rng, x0, y0, x1, y1, o) {
  const { w = 1.3, c = '#6c6761', a = .45, passes = 2, j = 2.2, seg = 170 } = o;
  const S = [], L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.round(L / seg));
  for (let p = 0; p < passes; p++) for (let i = 0; i < n; i++) {
    const t0 = Math.max(0, i / n - .03), t1 = Math.min(1, (i + 1) / n + .03), tm = (t0 + t1) / 2;
    const P = t => [lerp(x0, x1, t) + (rng() - .5) * j, lerp(y0, y1, t) + (rng() - .5) * j];
    S.push({ k: 'line', p: [...P(t0), ...P(tm), ...P(t1)], w: w * (.85 + rng() * .3), c, a: a * (.75 + rng() * .4) });
  }
  return S;
}
function arcStrokes(rng, cx, cy, rx, ry, a0, a1, o) {
  const { w = 1.5, c = '#3e3a36', a = .6, pieces = 6, j = 1.8, rot = 0, rf = null } = o;
  const S = [], cr = Math.cos(rot), sr = Math.sin(rot);
  for (let i = 0; i < pieces; i++) {
    const t0 = a0 + (a1 - a0) * (i / pieces) - .04, t1 = a0 + (a1 - a0) * ((i + 1) / pieces) + .04, p = [];
    for (let k = 0; k <= 6; k++) {
      const t = lerp(t0, t1, k / 6), rr = rf ? rf(t) : 1;
      const ex = Math.cos(t) * rx * rr, ey = Math.sin(t) * ry * rr;
      p.push(cx + ex * cr - ey * sr + (rng() - .5) * j, cy + ex * sr + ey * cr + (rng() - .5) * j);
    }
    S.push({ k: 'line', p, w: w * (.85 + rng() * .3), c, a: a * (.8 + rng() * .3) });
  }
  return S;
}
function signature(x, y, c, w = 2) {
  const p = [];
  for (let i = 0; i <= 36; i++) { const t = i / 36; p.push(x + t * 90 + Math.sin(t * 22) * 6, y + Math.cos(t * 22) * 9 * (1 - t * .5) - t * 8); }
  return [{ k: 'line', p, w, c, a: .8 }, { k: 'line', p: [x - 4, y + 16, x + 50, y + 13, x + 100, y + 10], w: w * .8, c, a: .6 }];
}
