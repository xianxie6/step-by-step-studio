'use strict';
// 通用课程引擎：距离场静物、光线步进、按画种生成步骤

/* ================= 运行时 ================= */

/* ================= 通用课程引擎 =================
   静物和头像：在 3D 里摆好物体，从画家的位置用光线步进“拍”一张参考图（每个像素记下颜色、明暗、投影、高光、物体编号）；
   风景：直接用分层的程序画出参考照片。各画种再按自己的步骤，从这张参考图里取出每一步要画的区域和颜色。 */
const GQ = 4, GW = W / GQ, GH = H / GQ, GN = GW * GH;
const TABLE_Y = .913, BACK_Z = -1.514, FRONT_Z = -.876, STAND = [.2, .913, -1.2];
const EYE = [.24, 1.2, -.12], LAMP = [-.49, 1.92, -.49], SPOT_AXIS = n3([.69, -.875, -.71]), LAMP_D0 = Math.hypot(.69, .875, .71);
const va = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], vs = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const vm = (a, k) => [a[0] * k, a[1] * k, a[2] * k], vl = a => Math.hypot(a[0], a[1], a[2]);
const vc = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const rotY = (v, a) => { const c = Math.cos(a), s = Math.sin(a); return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c]; };
const at = (dx, dy, dz) => [STAND[0] + dx, STAND[1] + dy, STAND[2] + dz];
const smin = (a, b, k) => { const h = clamp(.5 + .5 * (b - a) / k, 0, 1); return lerp(b, a, h) - k * h * (1 - h); };
const ssub = (d, carve, k) => { const h = clamp(.5 - .5 * (d + carve) / k, 0, 1); return lerp(d, -carve, h) + k * h * (1 - h); };
const hash2 = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
const vnoise = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); return lerp(lerp(hash2(xi, yi), hash2(xi + 1, yi), u), lerp(hash2(xi, yi + 1), hash2(xi + 1, yi + 1), u), v); };
const fbm = (x, y) => vnoise(x, y) * .5 + vnoise(x * 2.03, y * 2.03) * .25 + vnoise(x * 4.1, y * 4.1) * .125 + vnoise(x * 8.3, y * 8.3) * .0625;
const pchain = (pts, t) => { if (t <= pts[0][0]) return pts[0][1]; for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) return lerp(pts[i - 1][1], pts[i][1], sm(pts[i - 1][0], pts[i][0], t)); return pts[pts.length - 1][1]; };
const h01 = c => hex(c).map(v => v / 255);
const strHash = s => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) | 0, 7) >>> 0;

/* 距离场基本形 */
const sdSph = (q, c, r) => Math.hypot(q[0] - c[0], q[1] - c[1], q[2] - c[2]) - r;
const sdEll = (q, c, R) => { const x = (q[0] - c[0]) / R[0], y = (q[1] - c[1]) / R[1], z = (q[2] - c[2]) / R[2], k0 = Math.hypot(x, y, z), k1 = Math.hypot(x / R[0], y / R[1], z / R[2]); return k1 < 1e-9 ? -Math.min(R[0], R[1], R[2]) : k0 * (k0 - 1) / k1; };
const sdBox = (q, c, b, rr = 0) => { const x = Math.abs(q[0] - c[0]) - b[0] + rr, y = Math.abs(q[1] - c[1]) - b[1] + rr, z = Math.abs(q[2] - c[2]) - b[2] + rr; return Math.hypot(Math.max(x, 0), Math.max(y, 0), Math.max(z, 0)) + Math.min(Math.max(x, y, z), 0) - rr; };
const sdCyl = (q, c, r, hh) => { const d0 = Math.hypot(q[0] - c[0], q[2] - c[2]) - r, d1 = Math.abs(q[1] - c[1]) - hh; return Math.min(Math.max(d0, d1), 0) + Math.hypot(Math.max(d0, 0), Math.max(d1, 0)); };
const sdCone = (q, c, r1, r2, hh) => {
  const qx = Math.hypot(q[0] - c[0], q[2] - c[2]), qy = q[1] - c[1], k2x = r2 - r1, k2y = 2 * hh;
  const cax = qx - Math.min(qx, qy < 0 ? r1 : r2), cay = Math.abs(qy) - hh;
  const t = clamp(((r2 - qx) * k2x + (hh - qy) * k2y) / (k2x * k2x + k2y * k2y), 0, 1), cbx = qx - r2 + k2x * t, cby = qy - hh + k2y * t;
  return (cbx < 0 && cay < 0 ? -1 : 1) * Math.sqrt(Math.min(cax * cax + cay * cay, cbx * cbx + cby * cby));
};
const sdCap = (q, a, b, r) => { const pa = vs(q, a), ba = vs(b, a), h = clamp(dot3(pa, ba) / dot3(ba, ba), 0, 1); return vl(vs(pa, vm(ba, h))) - r; };

/* 物体零件：sdf 用世界坐标，geo 生成同样形状的 3D 网格 */
const PR = {
  sphere: (c, r) => ({ sdf: p => sdSph(p, c, r), b: [c, r], geo: () => new THREE.SphereGeometry(r, 48, 32).translate(c[0], c[1], c[2]) }),
  ell: (c, R, rot = 0) => ({ sdf: p => sdEll(rotY(vs(p, c), -rot), [0, 0, 0], R), b: [c, Math.max(R[0], R[1], R[2])], geo: () => new THREE.SphereGeometry(1, 48, 32).scale(R[0], R[1], R[2]).rotateY(rot).translate(c[0], c[1], c[2]) }),
  box: (c, hb, rot = 0, rr = .004) => ({ sdf: p => sdBox(rotY(vs(p, c), -rot), [0, 0, 0], hb, rr), b: [c, Math.hypot(hb[0], hb[1], hb[2])], geo: () => new THREE.BoxGeometry(hb[0] * 2, hb[1] * 2, hb[2] * 2).rotateY(rot).translate(c[0], c[1], c[2]) }),
  cyl: (base, r, h) => { const c = va(base, [0, h / 2, 0]); return { sdf: p => sdCyl(p, c, r, h / 2), b: [c, Math.hypot(r, h / 2)], geo: () => new THREE.CylinderGeometry(r, r, h, 48).translate(c[0], c[1], c[2]) }; },
  cone: (base, r, h) => { const c = va(base, [0, h / 2, 0]); return { sdf: p => sdCone(p, c, r, .001, h / 2), b: [c, Math.hypot(r, h / 2)], geo: () => new THREE.ConeGeometry(r, h, 64).translate(c[0], c[1], c[2]) }; },
  lathe: (base, prof, Hh) => {
    let mr = 0; for (let t = 0; t <= 1; t += .02) mr = Math.max(mr, prof(t));
    return { sdf: p => { const q = vs(p, base), t = clamp(q[1] / Hh, 0, 1); return Math.max(Math.hypot(q[0], q[2]) - prof(t), -q[1], q[1] - Hh) * .7; }, b: [va(base, [0, Hh / 2, 0]), Math.hypot(mr, Hh / 2)],
      geo: () => { const pts = [new THREE.Vector2(0, 0)]; for (let i = 0; i <= 64; i++) pts.push(new THREE.Vector2(prof(i / 64), i / 64 * Hh)); pts.push(new THREE.Vector2(prof(1) * .8, Hh - .004), new THREE.Vector2(prof(1) * .75, Hh * .85)); return new THREE.LatheGeometry(pts, 64).translate(base[0], base[1], base[2]); } };
  },
  cap: (a, b, r) => ({ sdf: p => sdCap(p, a, b, r), b: [vm(va(a, b), .5), vl(vs(b, a)) / 2 + r],
    geo: () => { const d = vs(b, a), g = new THREE.CapsuleGeometry(r, vl(d), 8, 16), m = vm(va(a, b), .5); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(d[0], d[1], d[2]).normalize())); return g.translate(m[0], m[1], m[2]); } }),
  handle: (c, R, r, rot = 0) => ({ sdf: p => { const q = rotY(vs(p, c), -rot); return Math.max(Math.hypot(Math.hypot(q[0], q[1]) - R, q[2]) - r, -q[0]); }, b: [c, R + r], geo: () => new THREE.TorusGeometry(R, r, 10, 40, Math.PI).rotateZ(-Math.PI / 2).rotateY(rot).translate(c[0], c[1], c[2]) }),
  custom: (sdf, c, rmax) => ({ sdf, b: [c, rmax], geo: () => radialMesh(sdf, c, null, rmax + .02) }),
  arc: (c, R, r, rot = 0) => ({ sdf: p => { const q = rotY(vs(p, c), -rot); return Math.max(Math.hypot(Math.hypot(q[0], q[1]) - R, q[2]) - r, -q[1]); }, b: [c, R + r], geo: () => new THREE.TorusGeometry(R, r, 10, 40, Math.PI).rotateY(rot).translate(c[0], c[1], c[2]) })
};
function OBJ(name, parts, mat, k = 0) {
  const sdf = parts.length === 1 ? parts[0].sdf : p => { let d = parts[0].sdf(p); for (let i = 1; i < parts.length; i++) { const e = parts[i].sdf(p); d = k ? smin(d, e, k) : Math.min(d, e); } return d; };
  let c = [0, 0, 0]; for (const pt of parts) c = va(c, pt.b[0]); c = vm(c, 1 / parts.length);
  let r = 0; for (const pt of parts) r = Math.max(r, vl(vs(pt.b[0], c)) + pt.b[1]);
  return { name, parts, mat: { ...mat, alb: h01(mat.c) }, sdf, b: [c, r + .004] };
}
const PLASTER = { c: '#eeebe4', ks: .04, shin: 8 };

/* 石膏 / 人物头像：局部坐标里头的中心在原点，胸像底座在 y = -0.24 */
function headSDF(q) {
  let d = sdEll(q, [0, .03, -.01], [.074, .086, .092]);
  d = smin(d, sdEll(q, [0, -.035, .025], [.058, .07, .064]), .03);
  d = smin(d, sdSph(q, [0, -.092, .05], .026), .02);
  d = smin(d, sdEll(q, [0, .026, .068], [.05, .013, .022]), .015);
  d = smin(d, sdCap(q, [0, .004, .084], [0, -.026, .103], .011), .012);
  d = smin(d, sdSph(q, [0, -.03, .098], .014), .008);
  for (const sx of [-1, 1]) {
    d = smin(d, sdSph(q, [sx * .012, -.034, .09], .009), .006);
    d = smin(d, sdEll(q, [sx * .04, -.012, .055], [.022, .018, .02]), .02);
    d = smin(d, sdEll(q, [sx * .076, 0, -.005], [.01, .025, .016]), .01);
    d = ssub(d, sdSph(q, [sx * .028, .01, .093], .0145), .01);
    d = smin(d, sdSph(q, [sx * .028, .008, .077], .0135), .006);
  }
  d = smin(d, sdEll(q, [0, -.05, .08], [.022, .007, .012]), .006);
  d = smin(d, sdEll(q, [0, -.06, .077], [.019, .007, .012]), .006);
  d = smin(d, sdCyl(q, [0, -.14, -.01], .037, .06), .02);
  d = smin(d, sdBox(q, [0, -.215, -.01], [.1, .025, .06], .02), .03);
  return d;
}
const hairSDF = q => Math.max(sdEll(q, [0, .036, -.014], [.08, .09, .097]), ((1.2 * q[2] - .022) - q[1]) / 1.562);
const HEAD_MARKS = { top: [0, .118, 0], hairline: [0, .07, .075], brow: [0, .026, .09], noseBase: [0, -.035, .1], chin: [0, -.115, .055], eyeL: [-.028, .008, .092], eyeR: [.028, .008, .092] };
const skinAlb = o => q => {
  const [x, y, z] = q, ax = Math.abs(x);
  if (y < -.165) return o.shirt;
  let c = o.skin;
  c = mixc(c, o.cheek, Math.exp(-(((ax - .038) / .022) ** 2 + ((y + .018) / .02) ** 2)) * .45 * (z > .03 ? 1 : 0));
  c = mixc(c, o.cheek, Math.exp(-((x / .012) ** 2 + ((y + .03) / .012) ** 2)) * .35 * (z > .08 ? 1 : 0));
  c = mixc(c, o.lip, Math.exp(-((x / .02) ** 2 + ((y + .055) / .009) ** 2)) * (z > .068 ? .85 : 0));
  c = mixc(c, o.hair, Math.exp(-(((ax - .03) / .016) ** 2 + ((y - .031) / .0045) ** 2)) * (z > .06 ? .85 : 0));
  const ex = x - Math.sign(x || 1) * .028, ed = Math.hypot(ex, y - .008, z - .078);
  if (ed < .0145 && z > .084) c = Math.hypot(ex, y - .008) < .0065 ? o.iris : [.84, .8, .76];
  return mixc(c, o.chin, sm(-.06, -.11, y) * .35);
};
function radialHit(sdf, c, d, rmax) { let r = rmax; for (let k = 0; k < 160 && r > 0; k++) { const s = sdf(va(c, vm(d, r))); if (s < 4e-4) return r; r -= Math.max(s * .9, 2e-4); } return -1; }
function radialMesh(sdf, c, colorFn, rmax, inner) {
  const g = new THREE.SphereGeometry(1, 150, 110), pos = g.attributes.position, cols = colorFn ? new Float32Array(pos.count * 3) : null;
  for (let i = 0; i < pos.count; i++) {
    const d = n3([pos.getX(i), pos.getY(i), pos.getZ(i)]);
    let r = radialHit(sdf, c, d, rmax);
    if (r < 0 && inner) r = Math.max(0, radialHit(inner, c, d, rmax) - .004);
    const p = va(c, vm(d, Math.max(r, 0))); pos.setXYZ(i, p[0], p[1], p[2]);
    if (cols) { const a = colorFn(p); cols[i * 3] = a[0] ** 2.2; cols[i * 3 + 1] = a[1] ** 2.2; cols[i * 3 + 2] = a[2] ** 2.2; }
  }
  g.computeVertexNormals(); if (cols) g.setAttribute('color', new THREE.BufferAttribute(cols, 3)); return g;
}
function HEAD(name, base, rot, mat, albedo) {
  const toL = p => va(rotY(vs(p, base), -rot), [0, -.24, 0]), sdf = p => headSDF(toL(p)), fn = albedo ? p => albedo(toL(p)) : null;
  const marks = Object.fromEntries(Object.entries(HEAD_MARKS).map(([k, m]) => [k, va(rotY(va(m, [0, .24, 0]), rot), base)]));
  return { name, sdf, b: [va(base, [0, .18, 0]), .205], mat: { ...mat, alb: h01(mat.c || '#eeebe4'), fn }, marks, toL,
    mesh: () => radialMesh(sdf, va(base, [0, .21, 0]), fn, .32) };
}
function HAIR(name, base, rot, color) {
  const toL = p => va(rotY(vs(p, base), -rot), [0, -.24, 0]), sdf = p => hairSDF(toL(p));
  return { name, sdf, b: [va(base, [0, .275, 0]), .11], mat: { c: color, alb: h01(color), ks: .25, shin: 14 },
    mesh: () => radialMesh(sdf, va(base, rotY([0, .27, -.01], rot)), null, .2, p => headSDF(toL(p))) };
}

/* 衬布：挂在背景上的布（hang），铺在台面上又垂过桌沿的布（table）。褶皱用起伏的高度场表示，光线照上去自然有明暗 */
const wrinkle = (a, b) => vnoise(a * 22, b * 22) * .65 + vnoise(a * 57 + 3, b * 57) * .35 - .5;
const BURLAP = base => { const c0 = h01(base); return (u, v) => { const w = ((Math.sin(u * 820) > 0) !== (Math.sin(v * 820) > 0) ? 1 : .8) * (.9 + vnoise(u * 300, v * 300) * .2); return c0.map(x => x * w); }; };
const bisect = (E, d, F, a, b) => { for (let k = 0; k < 7; k++) { const m = (a + b) / 2; if (F(va(E, vm(d, m))) > 0) a = m; else b = m; } return (a + b) / 2; };
function scanSurf(E, d, t0, t1, F, ok, mkHit) {
  const N = 12; let pt = t0, pf = F(va(E, vm(d, t0)));
  for (let s = 1; s <= N; s++) {
    const t = t0 + (t1 - t0) * s / N, f = F(va(E, vm(d, t)));
    if (pf > 0 && f <= 0) { const tt = bisect(E, d, F, pt, t), p = va(E, vm(d, tt)); if (ok(p)) return mkHit(tt, p); }
    pt = t; pf = f;
  }
  return null;
}
function gridMesh(fn, nu, nv, colAt, tex) {
  const g = new THREE.PlaneGeometry(1, 1, nu, nv), pos = g.attributes.position, cols = tex ? new Float32Array(pos.count * 3) : null;
  for (let i = 0; i < pos.count; i++) {
    const [x, y, z, u, v] = fn(pos.getX(i) + .5, pos.getY(i) + .5); pos.setXYZ(i, x, y, z);
    if (cols) { const c = colAt(u, v); cols[i * 3] = c[0] ** 2.2; cols[i * 3 + 1] = c[1] ** 2.2; cols[i * 3 + 2] = c[2] ** 2.2; }
  }
  g.computeVertexNormals(); if (cols) g.setAttribute('color', new THREE.BufferAttribute(cols, 3)); return g;
}
function makeDrape(o) {
  const albC = h01(o.color), tex = o.tex, colAt = (u, v) => tex ? tex(u, v) : albC, cr = o.crumple || 0;
  if (o.type === 'hang') {
    const A = o.folds.reduce((s, f) => s + f[1], 0) + .006 * cr + .001;
    const off = (x, y) => { let s = 0; const k = .55 + .45 * sm(o.y1, o.y0, y); for (const [lam, amp, ph] of o.folds) s += amp * Math.sin(2 * Math.PI * (x + .02 * Math.sin(y * 5 + ph)) / lam + ph) * k * (.35 + .65 * vnoise(x * 3 / lam + ph * 3, y * 1.6 + ph)); return s + (cr ? wrinkle(x, y) * .012 * cr : 0); };
    const xr = y => { const t = clamp((y - o.y0) / (o.y1 - o.y0), 0, 1); return [lerp(o.x0, o.x0t ?? o.x0, t), lerp(o.x1, o.x1t ?? o.x1, t)]; };
    const F = p => p[2] - (o.z + off(p[0], p[1]));
    const hit = (E, d, tMax) => {
      if (d[2] >= 0) return null;
      const t0 = Math.max((o.z + A - E[2]) / d[2], 0), t1 = Math.min((o.z - A - E[2]) / d[2], tMax);
      if (t1 <= t0) return null;
      return scanSurf(E, d, t0, t1, F, p => { if (p[1] < o.y0 || p[1] > o.y1) return false; const [a, b] = xr(p[1]); return p[0] >= a && p[0] <= b; }, (tt, p) => {
        const e = .0015, ov = off(p[0], p[1]), gx = (off(p[0] + e, p[1]) - off(p[0] - e, p[1])) / (2 * e), gy = (off(p[0], p[1] + e) - off(p[0], p[1] - e)) / (2 * e);
        return { t: tt, n: n3([-gx, -gy, 1]), alb: colAt(p[0], p[1]), ao: clamp(.5 + .5 * ov / A, 0, 1), dir: Math.PI / 2 + clamp(gx * .5, -.3, .3) };
      });
    };
    const mesh = () => [gridMesh((u, v) => { const y = lerp(o.y0, o.y1, v), [a, b] = xr(y), x = lerp(a, b, u); return [x, y, o.z + off(x, y), x, y]; }, 150, 110, colAt, tex)];
    return { id: 0, hit, mesh, color: o.color, tex: !!tex, hang: true };
  }
  const lift = o.lift ?? .006, top = o.top || [], front = o.front || [];
  const Ht = top.reduce((s, f) => s + f[1], 0) + .006 * cr + .001, Af = front.reduce((s, f) => s + f[1], 0) + .01 * cr + .001;
  const zb = o.zb ?? -1.5, ZF = FRONT_Z + .05, yb = o.yb ?? TABLE_Y - .3, ytop = TABLE_Y + lift;
  const hT = (x, z) => { let s = 0; for (const [lam, amp, ph, al] of top) { const u = x * Math.cos(al) + z * Math.sin(al), w = -x * Math.sin(al) + z * Math.cos(al); s += amp * Math.max(0, Math.sin(2 * Math.PI * (u + .025 * Math.sin(w * 11 + ph)) / lam + ph)) ** 2 * sm(.25, .75, vnoise(w * 7 + ph * 5, u * 2 / lam + ph)); } return s + (cr ? (wrinkle(x, z) + .5) * .006 * cr : 0); };
  const cF = (x, y) => { let s = 0; const k = sm(ytop, ytop - .06, y); for (const [lam, amp, ph] of front) s += amp * Math.sin(2 * Math.PI * x / lam + ph + (ytop - y) * 5) * k * (.4 + .6 * vnoise(x * 2.5 / lam + ph * 4, y * 3)); return s + (cr ? wrinkle(x, y) * .01 * cr * k : 0); };
  const xrT = z => { const t = clamp((z - zb) / (ZF - zb), 0, 1); return [lerp(o.x0, o.x0f, t), lerp(o.x1, o.x1f, t)]; };
  const FT = p => p[1] - (ytop + hT(p[0], p[2])), FF = p => p[2] - (ZF + cF(p[0], p[1]));
  const hit = (E, d, tMax) => {
    let best = null;
    if (d[1] < 0) {
      const t0 = Math.max((ytop + Ht - E[1]) / d[1], 0), t1 = Math.min((ytop - .001 - E[1]) / d[1], tMax);
      if (t1 > t0) best = scanSurf(E, d, t0, t1, FT, p => { if (p[2] < zb || p[2] > ZF) return false; const [a, b] = xrT(p[2]); return p[0] >= a && p[0] <= b; }, (tt, p) => {
        const e = .0015, h = hT(p[0], p[2]), gx = (hT(p[0] + e, p[2]) - hT(p[0] - e, p[2])) / (2 * e), gz = (hT(p[0], p[2] + e) - hT(p[0], p[2] - e)) / (2 * e);
        return { t: tt, n: n3([-gx, 1, -gz]), alb: colAt(p[0], p[2]), ao: .82 + .18 * clamp(h / Ht * 2, 0, 1), dir: o.tdir ?? .05 };
      });
    }
    if (d[2] < 0) {
      const t0 = Math.max((ZF + Af - E[2]) / d[2], 0), t1 = Math.min((ZF - Af - E[2]) / d[2], best ? best.t : tMax);
      if (t1 > t0) { const fh = scanSurf(E, d, t0, t1, FF, p => p[1] >= yb && p[1] <= ytop && p[0] >= o.x0f && p[0] <= o.x1f, (tt, p) => {
        const e = .0015, c = cF(p[0], p[1]), gx = (cF(p[0] + e, p[1]) - cF(p[0] - e, p[1])) / (2 * e), gy = (cF(p[0], p[1] + e) - cF(p[0], p[1] - e)) / (2 * e);
        return { t: tt, n: n3([-gx, -gy, 1]), alb: colAt(p[0], p[1]), ao: clamp(.5 + .5 * c / Af, 0, 1), dir: Math.PI / 2 };
      }); if (fh) best = fh; }
    }
    return best;
  };
  const mesh = () => [
    gridMesh((u, v) => { const z = lerp(ZF, zb, v), [a, b] = xrT(z), x = lerp(a, b, u); return [x, ytop + hT(x, z), z, x, z]; }, 140, 80, colAt, tex),
    gridMesh((u, v) => { const y = lerp(yb, ytop, v), x = lerp(o.x0f, o.x1f, u); return [x, y, ZF + cF(x, y), x, y]; }, 140, 60, colAt, tex)
  ];
  return { id: 1, hit, mesh, color: o.color, tex: !!tex };
}
const hangBack = (color, extra = {}) => makeDrape({ type: 'hang', x0: -.3, x1: .7, y0: TABLE_Y - .01, y1: 1.97, z: BACK_Z + .022, folds: [[.13, .006, .4], [.29, .009, 1.7], [.07, .003, 2.2]], crumple: .9, color, ...extra });
function chainEdges(rng, pts, o) {
  const used = new Uint8Array(pts.length), grid = new Map(), A = [], key = (x, y) => (x >> 3) + ',' + (y >> 3);
  pts.forEach((p, i) => { const k = key(p[0], p[1]); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(i); });
  const near = (x, y) => { let best = -1, bd = 11; for (let gx = -1; gx <= 1; gx++) for (let gy = -1; gy <= 1; gy++) { const l = grid.get(((x >> 3) + gx) + ',' + ((y >> 3) + gy)); if (l) for (const i of l) if (!used[i]) { const d = Math.hypot(pts[i][0] - x, pts[i][1] - y); if (d < bd) { bd = d; best = i; } } } return best; };
  for (let s = 0; s < pts.length; s++) {
    if (used[s]) continue;
    const line = []; let cur = s;
    while (cur >= 0) { used[cur] = 1; line.push(pts[cur]); cur = near(pts[cur][0], pts[cur][1]); }
    if (line.length < 5) continue;
    for (let k = 0; k < line.length - 2; k += 10) { const seg = line.slice(k, k + 12).filter((_, j, arr) => j % 2 === 0 || j === arr.length - 1); if (seg.length >= 3) A.push({ k: 'line', p: seg.flatMap(([x, y]) => [x + (rng() - .5) * o.j, y + (rng() - .5) * o.j]), w: o.w * (.85 + rng() * .3), c: o.c, a: o.a * .8 * (.8 + rng() * .3) }); }
  }
  return A;
}
const clothLines = (rng, g, o) => (g.clothEdges || []).flatMap(e => chainEdges(rng, e, o));

/* 光线步进拍参考图 */
function newG() { const f = () => new Float32Array(GN); return { R: f(), Gc: f(), B: f(), T: f(), D: f(), SH: f(), SP: f(), RF: f(), DIR: f(), EDGE: f(), CL: new Int8Array(GN), id: new Int16Array(GN), objs: [] }; }
function renderG(spec) {
  const objs = spec.objects, drapes = spec.drapes || [], G = newG(), tg = spec.frame.target;
  const f = n3(vs(tg, EYE)), rgt = n3(vc(f, [0, 1, 0])), up = vc(rgt, f), th = Math.tan(spec.frame.fov * Math.PI / 360);
  const bd = h01(spec.backdrop), cl = h01(spec.cloth), wall = [.16, .12, .09];
  G.objs = objs.map(o => ({ name: o.name, edge: [], specPts: [], bbox: [1e9, 1e9, -1e9, -1e9], cx: 0, cy: 0, n: 0 }));
  const softShadow = (p, l, maxT) => {
    const cand = objs.filter(o => { const oc = vs(o.b[0], p), b = dot3(oc, l), c2 = dot3(oc, oc) - o.b[1] * o.b[1]; return b * b - c2 > 0 && b + Math.sqrt(Math.max(0, b * b - c2)) > 0; });
    if (!cand.length) return 1;
    let res = 1, t = .004;
    for (let s = 0; s < 64 && t < maxT; s++) {
      const q = va(p, vm(l, t)); let hmin = 1e9; for (const o of cand) hmin = Math.min(hmin, o.sdf(q));
      if (hmin < 1e-4) return 0; res = Math.min(res, 9 * hmin / t); t += clamp(hmin, .003, .05);
    }
    return clamp(res, 0, 1);
  };
  const shade = (p, n, mat, alb) => {
    const tl = vs(LAMP, p), dist = vl(tl), l = vm(tl, 1 / dist), v = n3(vs(EYE, p)), d = dot3(n, l);
    const inten = sm(Math.cos(.5), Math.cos(.25), -dot3(l, SPOT_AXIS)) * clamp((LAMP_D0 / dist) ** 2, 0, 1.6);
    const vis = d > -.2 ? softShadow(va(p, vm(n, .003)), l, dist) : 0, sh = 1 - vis, wrap = mat && mat.wrap || 0;
    const diff = Math.max(0, (d + wrap) / (1 + wrap)) * vis * inten, amb = (mat ? .16 : .22) + .07 * n[1] + .09 * Math.max(0, -n[0]), bnc = Math.max(0, -n[1]) * .25;
    const hv = n3(va(l, v)), sp = mat ? (mat.ks || 0) * Math.pow(Math.max(0, dot3(n, hv)), mat.shin || 20) * vis * inten : 0;
    let c;
    if (mat && mat.metal) {
      const rr = vs(vm(n, 2 * dot3(n, v)), v), glow = Math.pow(Math.max(0, dot3(n3(rr), l)), 8) * 1.2;
      const env = rr[1] > 0 ? va(vm(bd, .7), [glow, glow * .85, glow * .6]) : vm(cl, .8);
      c = alb.map((a, k) => a * (env[k] * 1.3 + diff * .35 + amb * .25) + sp * [1, .9, .75][k]);
    } else {
      c = alb.map((a, k) => a * (amb + bnc * cl[k] * 1.2 + diff * (mat ? [1.02, .97, .88] : [1, .97, .92])[k]) + sp * [1, .96, .88][k]);
      if (wrap) { c[0] += .06 * diff; c[1] += .015 * diff; }
    }
    return { c: c.map(x => 255 * Math.pow(clamp(x * 1.05, 0, 1), 1 / 1.08)), d, sh, sp, rf: bnc };
  };
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
    const idx = j * GW + i, sx = ((i + .5) / GW * 2 - 1) * th * .8, sy = (1 - (j + .5) / GH * 2) * th;
    const dir = n3([f[0] + rgt[0] * sx + up[0] * sy, f[1] + rgt[1] * sx + up[1] * sy, f[2] + rgt[2] * sx + up[2] * sy]);
    let tH = 1e9, hid = 0, hn = null, alb = wall, mat = null;
    if (dir[1] < 0) { const t = (TABLE_Y - EYE[1]) / dir[1], p = va(EYE, vm(dir, t)); if (p[2] <= FRONT_Z) { tH = t; hid = 1; hn = [0, 1, 0]; alb = cl; } }
    if (hid !== 1 && dir[2] < 0) { const t = (FRONT_Z - EYE[2]) / dir[2], p = va(EYE, vm(dir, t)); if (p[1] < TABLE_Y) { tH = t; hid = 1; hn = [0, 0, 1]; alb = vm(cl, .9); } }
    if (dir[2] < 0) { const t = (BACK_Z - EYE[2]) / dir[2]; if (t < tH) { const p = va(EYE, vm(dir, t)); if (p[1] > TABLE_Y) { tH = t; hid = 0; hn = [0, 0, 1]; alb = Math.abs(p[0] - .2) < .475 && p[1] < 1.945 ? bd : wall; } } }
    // 衬布
    let clI = 0, ao = 1, cdir = 0;
    for (let di = 0; di < drapes.length; di++) { const hh = drapes[di].hit(EYE, dir, tH); if (hh) { tH = hh.t; hid = drapes[di].id; hn = hh.n; alb = hh.alb; clI = di + 1; ao = hh.ao; cdir = hh.dir; } }
    // 物体
    let t0 = 1e9, t1 = 0; const cand = [];
    objs.forEach((o, k) => { const oc = vs(o.b[0], EYE), b = dot3(oc, dir), c2 = dot3(oc, oc) - o.b[1] * o.b[1], disc = b * b - c2; if (disc > 0) { const s = Math.sqrt(disc), tn = b - s, tf = b + s; if (tf > 0 && tn < tH) { cand.push(k); t0 = Math.min(t0, Math.max(tn, 0)); t1 = Math.max(t1, tf); } } });
    let hp = null;
    if (cand.length) {
      let t = t0; const tEnd = Math.min(t1, tH);
      for (let s = 0; s < 160 && t < tEnd; s++) {
        const p = va(EYE, vm(dir, t)); let dm = 1e9, kk = -1;
        for (const k of cand) { const dd = objs[k].sdf(p); if (dd < dm) { dm = dd; kk = k; } }
        if (dm < 2e-4) { hp = p; hid = 2 + kk; clI = 0; break; }
        t += dm;
      }
    }
    let sh0;
    if (hp) {
      const o = objs[hid - 2], e = 4e-4;
      hn = n3([o.sdf(va(hp, [e, 0, 0])) - o.sdf(va(hp, [-e, 0, 0])), o.sdf(va(hp, [0, e, 0])) - o.sdf(va(hp, [0, -e, 0])), o.sdf(va(hp, [0, 0, e])) - o.sdf(va(hp, [0, 0, -e]))]);
      mat = o.mat; alb = mat.fn ? mat.fn(hp) : mat.alb;
      sh0 = shade(hp, hn, mat, alb);
    } else if (hn) sh0 = shade(va(EYE, vm(dir, tH)), hn, null, alb);
    else sh0 = { c: alb.map(x => x * 255 * .4), d: 0, sh: 1, sp: 0, rf: 0 };
    if (clI) sh0.c = sh0.c.map(v => v * (.8 + .2 * ao));
    G.CL[idx] = clI;
    G.R[idx] = sh0.c[0]; G.Gc[idx] = sh0.c[1]; G.B[idx] = sh0.c[2];
    G.T[idx] = (sh0.c[0] * .3 + sh0.c[1] * .59 + sh0.c[2] * .11) / 255;
    G.D[idx] = sh0.d; G.SH[idx] = sh0.sh; G.SP[idx] = sh0.sp; G.RF[idx] = sh0.rf; G.id[idx] = hid;
    G.DIR[idx] = clI ? cdir : hid >= 2 ? Math.atan2(-dot3(hn, up), dot3(hn, rgt)) + Math.PI / 2 : hid === 1 ? .03 + Math.sin(i * .7 + j * .3) * .08 : (Math.sin(i * .31 + j * .17) > 0 ? .55 : -.55);
  }
  // 衬布的边
  G.clothEdges = drapes.map(() => []);
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
    const idx = j * GW + i, c = G.CL[idx]; if (!c) continue;
    const nb = [i > 0 ? idx - 1 : -1, i < GW - 1 ? idx + 1 : -1, j > 0 ? idx - GW : -1, j < GH - 1 ? idx + GW : -1];
    if (nb.some(n => n >= 0 && G.CL[n] !== c && G.id[n] < 2)) G.clothEdges[c - 1].push([(i + .5) * GQ, (j + .5) * GQ]);
  }
  // 物体轮廓、外框、高光点
  const specC = G.objs.map(() => []);
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
    const idx = j * GW + i, k = G.id[idx] - 2; if (k < 0) continue;
    const ob = G.objs[k], x = (i + .5) * GQ, y = (j + .5) * GQ;
    ob.bbox[0] = Math.min(ob.bbox[0], x); ob.bbox[1] = Math.min(ob.bbox[1], y); ob.bbox[2] = Math.max(ob.bbox[2], x); ob.bbox[3] = Math.max(ob.bbox[3], y); ob.cx += x; ob.cy += y; ob.n++;
    const nb = [i > 0 ? G.id[idx - 1] : -9, i < GW - 1 ? G.id[idx + 1] : -9, j > 0 ? G.id[idx - GW] : -9, j < GH - 1 ? G.id[idx + GW] : -9];
    if (nb.some(v => v !== k + 2)) { ob.edge.push([x, y]); G.EDGE[idx] = 1; for (const o2 of [idx - 1, idx + 1, idx - GW, idx + GW]) if (o2 >= 0 && o2 < GN) G.EDGE[o2] = 1; }
    if (G.SP[idx] > .15) specC[k].push([G.SP[idx], x, y]);
  }
  G.objs.forEach((ob, k) => {
    if (ob.n) { ob.cx /= ob.n; ob.cy /= ob.n; }
    specC[k].sort((a, b) => b[0] - a[0]);
    for (const [, x, y] of specC[k]) { if (ob.specPts.length >= 6) break; if (ob.specPts.every(([px, py]) => Math.hypot(px - x, py - y) > 10)) ob.specPts.push([x, y]); }
  });
  const ci = GW >> 1; G.horizon = null;
  for (let j = 1; j < GH; j++) if (G.id[j * GW + ci] === 1 && G.id[(j - 1) * GW + ci] !== 1) { G.horizon = j * GQ; break; }
  // 头像的比例点
  const hd = objs.find(o => o.marks);
  if (hd) { G.marks = {}; for (const [k, P] of Object.entries(hd.marks)) { const v = vs(P, EYE), z = dot3(v, f); G.marks[k] = [(dot3(v, rgt) / z / (th * .8) + 1) / 2 * W, (1 - dot3(v, up) / z / th) / 2 * H]; } }
  return G;
}

/* 风景：分层的程序照片 */
function renderLand(spec) {
  const G = newG(); G.LAYER = new Int8Array(GN);
  const regs = spec.regions.map(r => ({ ...r, edge: r.outline === 'blob' ? [] : null, ridge: r.outline === 'ridge' ? new Array(GW).fill(null) : null, cx: 0, cy: 0, n: 0 }));
  const spc = [];
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
    const idx = j * GW + i, x = (i + .5) * GQ, y = (j + .5) * GQ, o = spec.land(x, y), rg = regs[o.r];
    G.R[idx] = o.c[0]; G.Gc[idx] = o.c[1]; G.B[idx] = o.c[2]; G.T[idx] = (o.c[0] * .3 + o.c[1] * .59 + o.c[2] * .11) / 255;
    G.id[idx] = o.r; G.LAYER[idx] = rg.layer; G.D[idx] = 1; G.SH[idx] = o.sh || 0; G.SP[idx] = o.sp || 0; G.DIR[idx] = o.dir || 0;
    rg.cx += x; rg.cy += y; rg.n++;
    if (rg.ridge && rg.ridge[i] == null) rg.ridge[i] = y;
    if ((o.sp || 0) > .4) spc.push([o.sp, x, y]);
  }
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
    const idx = j * GW + i, rg = regs[G.id[idx]]; if (!rg.edge) continue;
    if ([i > 0 ? G.id[idx - 1] : -9, i < GW - 1 ? G.id[idx + 1] : -9, j > 0 ? G.id[idx - GW] : -9, j < GH - 1 ? G.id[idx + GW] : -9].some(v => v !== G.id[idx])) rg.edge.push([(i + .5) * GQ, (j + .5) * GQ]);
  }
  for (const rg of regs) { if (rg.n) { rg.cx /= rg.n; rg.cy /= rg.n; } if (rg.ridge) rg.ridge = rg.ridge.map((y, i) => [(i + .5) * GQ, y]); }
  spc.sort((a, b) => b[0] - a[0]); G.landSpec = [];
  for (const [, x, y] of spc) { if (G.landSpec.length >= 70) break; if (G.landSpec.every(([px, py]) => Math.hypot(px - x, py - y) > 9)) G.landSpec.push([x, y]); }
  G.regions = regs; G.horizon = spec.horizon;
  return G;
}

/* 从参考图里生成线条 */
function contourFrom(rng, edge, cx, cy, o) {
  const A = [], pts = edge.map(([x, y]) => [x, y, Math.atan2(y - cy, x - cx)]).sort((a, b) => a[2] - b[2]);
  let seg = [];
  const flush = () => { if (seg.length >= 3) { const p = []; for (const [x, y] of seg) p.push(x + (rng() - .5) * o.j, y + (rng() - .5) * o.j); A.push({ k: 'line', p, w: o.w * (.85 + rng() * .3), c: o.c, a: o.a * (.8 + rng() * .3) }); } seg = []; };
  for (let i = 0; i < pts.length; i += 2) {
    const q = pts[i];
    if (seg.length && Math.hypot(q[0] - seg[seg.length - 1][0], q[1] - seg[seg.length - 1][1]) > 26) flush();
    seg.push(q);
    if (seg.length >= 12) { const last = seg[seg.length - 1]; flush(); seg.push(last); }
  }
  flush(); return A;
}
const contours = (rng, g, o) => g.objs.flatMap(ob => contourFrom(rng, ob.edge, ob.cx, ob.cy, o));
function guideLines(rng, g, o) {
  const A = [], L = (x0, y0, x1, y1, a) => A.push(...sketchLine(rng, x0, y0, x1, y1, { c: o.c, a, w: 1.3 }));
  if (g.horizon) L(30, g.horizon, W - 30, g.horizon, o.a * .8);
  if (!o.onlyHorizon) for (const ob of g.objs) { const [x0, y0, x1, y1] = ob.bbox; if (x1 < x0) continue; L(x0, y0, x1, y0, o.a * .6); L(x1, y0, x1, y1, o.a * .6); L(x1, y1, x0, y1, o.a * .6); L(x0, y1, x0, y0, o.a * .6); L(ob.cx, y0 - 14, ob.cx, y1 + 14, o.a); }
  if (g.marks) {
    const m = g.marks; L(m.top[0], m.top[1] - 10, m.chin[0], m.chin[1] + 24, o.a);
    for (const k of ['hairline', 'brow', 'noseBase', 'chin']) L(m[k][0] - 80, m[k][1], m[k][0] + 80, m[k][1], o.a * .9);
    const dx = m.eyeR[0] - m.eyeL[0], dy = m.eyeR[1] - m.eyeL[1]; L(m.eyeL[0] - dx * .9, m.eyeL[1] - dy * .9, m.eyeR[0] + dx * .9, m.eyeR[1] + dy * .9, o.a * .9);
  }
  return A;
}
function landGuides(rng, g, o) {
  const A = [], L = (x0, y0, x1, y1, a) => A.push(...sketchLine(rng, x0, y0, x1, y1, { c: o.c, a, w: 1.3 }));
  if (g.horizon) L(20, g.horizon, W - 20, g.horizon, o.a);
  for (const t of [1 / 3, 2 / 3]) { L(W * t, 40, W * t, H - 40, o.a * .35); L(40, H * t, W - 40, H * t, o.a * .35); }
  for (const rg of g.regions) {
    if (rg.ridge) {
      let seg = [];
      const flush = () => { for (let s = 0; s + 2 < seg.length; s += 8) { const part = seg.slice(s, s + 9); A.push({ k: 'line', p: part.flatMap(([x, y]) => [x + (rng() - .5) * 1.5, y + (rng() - .5) * 1.5]), w: 1.6, c: o.c, a: o.a }); } seg = []; };
      for (const [x, y] of rg.ridge) { if (y == null) { flush(); continue; } if (seg.length && Math.abs(seg[seg.length - 1][1] - y) > 24) flush(); seg.push([x, y]); }
      flush();
    }
    if (rg.edge) A.push(...contourFrom(rng, rg.edge, rg.cx, rg.cy, { c: o.c, a: o.a, w: 1.6, j: 1.2 }));
  }
  return A;
}
function specDabs(rng, g, kind, h) {
  const A = [], pts = g.objs.length ? g.objs.flatMap(o => o.specPts) : (g.landSpec || []);
  for (const [x, y] of pts) {
    const i = clamp(y / GQ | 0, 0, GH - 1) * GW + clamp(x / GQ | 0, 0, GW - 1), base = mixc([g.R[i], g.Gc[i], g.B[i]], [255, 250, 238], .6), a = g.DIR[i] + (rng() - .5) * .4, L = 8 + rng() * 10;
    const p = [x - Math.cos(a) * L / 2, y - Math.sin(a) * L / 2, x, y + (rng() - .5) * 2, x + Math.cos(a) * L / 2, y + Math.sin(a) * L / 2];
    A.push(kind === 'oil' ? oilS(p, 5 + rng() * 5, base, .95, h || 1) : { k: 'brush', p, w: 5 + rng() * 5, c: rgb(base), c2: rgb(base, 1.08), c3: rgb(base, .9), a: .95, seed: rng() * 1e9 | 0 });
  }
  return A;
}

/* 参考图上的判断 */
const isO = (i, g) => g.id[i] >= 2 ? 1 : 0;
const dkf = (i, g) => clamp((.93 - g.T[i]) / .85, 0, 1);
const fdf = (i, g) => sm(.06, -.1, g.D[i] - g.SH[i] * .25);
const csf = (i, g) => g.SH[i] * (g.D[i] > 0 ? 1 : 0);
const bandf = (i, g) => Math.exp(-(((g.D[i] + .04) / .11) ** 2));
const SKG = { grain: .28, tool: 'pencil' }, GBR = { tool: 'brush', grain: .08 }, OBR = { tool: 'brush', grain: .22, tooth: 'weave' };
const BASE = { sketch: defSketch(), gouache: defGouache(), oil: defOil() };
const SIGN = { sketch: '#3a3633', gouache: '#6a3a2a', oil: '#c8a060' };

/* 各画种的步骤流程 */
const PIPE = {
  sketch: ({ mm, getG, names, spec }) => [
    { ...BASE.sketch.steps[0] },
    { title: '构图定位', tool: '2H 铅笔', cam: 'easel', focus: ['subject'], ann: ['axis'], ref: '先看整体',
      text: `先眯起眼睛，看${names}合在一起是什么形状。用很轻的线定出整组物体的上下左右边界，再标出每个物体的位置、中线和桌面线。`,
      tip: '<span>构图要稳：</span>整组物体略偏离画面中心，上面留的空比下面少一点，画面才不会往下“掉”。',
      build: r => [{ ...SKG, grain: .2, strokes: guideLines(r, getG(), { c: '#6c6761', a: .42 }) }] },
    { title: '起形', tool: 'HB 铅笔', cam: 'easel', focus: ['subject'], ann: ['axis'], ref: '切出外形',
      text: `用长直线切出${names}的外轮廓，先方后圆，再一点点修准。前面的物体会挡住后面的，被挡住的部分不用画。`,
      tip: '<span>多比较：</span>拿铅笔比一比，物体之间的高矮、宽窄、距离对不对。',
      build: r => [{ ...SKG, grain: .2, strokes: [...contours(r, getG(), { c: '#3c3935', a: .65, w: 1.6, j: 1.6 }), ...clothLines(r, getG(), { c: '#5a5652', a: .5, w: 1.3, j: 1.4 })] }] },
    { title: '明暗交界线', tool: '2B 铅笔', cam: 'still', focus: ['lamp', 'subject'], ann: ['light', 'term'], gain: ['明暗交界线'], ref: '找交界线',
      text: `光从左上方照来，每个物体上都有一条受光和背光的分界线。${spec.termNote || '圆的物体交界线是渐变的弧线，方的物体交界线就是那条转折的棱。'}`,
      tip: '<span>比一比：</span>几条交界线里哪条最深？通常离光最近、对比最强的那条最深。',
      build: r => { const m = mm('band', (i, g) => isO(i, g) * bandf(i, g) * clamp(dkf(i, g) * 1.4, 0, 1) * .95); return [{ ...SKG, mask: m, strokes: [...hatch(r, { m, cell: 50, gap: 4, angles: [-.85], w: 1.4, c: '#2b2826', a: .55 }), ...hatch(r, { m, cell: 50, gap: 5, angles: [-.25], w: 1.2, c: '#2b2826', a: .4 })] }]; } },
    { title: '铺暗部', tool: '4B 铅笔', cam: 'easel', focus: ['subject'], ann: ['light', 'term', 'dark'], ref: '暗部要整体',
      text: `把${names}的背光面整体铺一遍。${spec.darkNote || '同一个物体的暗部用统一方向的排线，先求整体，不抠细节。'}`,
      tip: '<span>排线：</span>两头轻、中间重，线和线之间留一点缝，下一层再交叉补上。',
      build: r => { const m = mm('dark', (i, g) => isO(i, g) * fdf(i, g) * clamp(dkf(i, g) * 1.25, 0, 1) * .9); return [{ ...SKG, mask: m, strokes: hatch(r, { m, cell: 70, gap: 5, angles: [-.85], w: 1.8, c: '#2e2b29', a: .5 }) }, { ...SKG, mask: m, strokes: hatch(r, { m, cell: 70, gap: 6, angles: [.3], w: 1.6, c: '#2e2b29', a: .4 }) }]; } },
    { title: '画投影', tool: '4B 铅笔', cam: 'still', focus: ['lamp', 'cloth'], ann: ['light', 'shadow'], gain: ['投影'], ref: '投影的方向',
      text: `画出物体落在台面上、也落在彼此身上的投影。投影倒向灯的反方向，离物体越近越深越实。${spec.shadowNote || ''}`,
      tip: '<span>投影有形：</span>投影落在别的物体上，会顺着那个物体的形体弯曲。',
      build: r => { const m = mm('cast', (i, g) => csf(i, g) * clamp(dkf(i, g) * 1.3, 0, 1) * .92); return [{ ...SKG, mask: m, strokes: hatch(r, { m, cell: 60, gap: 4.5, angles: [.05, -.5], w: 1.7, c: '#2c2927', a: .5 }) }]; } },
    { title: '灰面', tool: 'HB 铅笔', cam: 'easel', focus: ['subject'], ann: ['light', 'mid'], gain: ['灰面'], ref: '让形体转起来',
      text: `从交界线往受光面一层层减轻，画出灰面，每个物体才会“转”过来。${spec.midNote || ''}`,
      tip: '<span>固有色：</span>颜色深的东西，亮部也比白色物体的亮部深，要整体压一层灰。',
      build: r => { const m = mm('mid', (i, g) => isO(i, g) * (g.D[i] > 0 ? 1 : .4) * clamp((dkf(i, g) - .04) * 1.5, 0, 1) * .55); return [{ ...SKG, mask: m, strokes: hatch(r, { m, cell: 60, gap: 4.5, angles: [-.9], w: 1.2, c: '#47433f', a: .45 }) }, { ...SKG, mask: m, strokes: hatch(r, { m, cell: 60, gap: 6, angles: [.6], w: 1.1, c: '#47433f', a: .35 }) }]; } },
    { title: '反光与高光', tool: '可塑橡皮', cam: 'easel', focus: ['eraser', 'subject'], ann: ['refl', 'hl'], gain: ['反光', '高光'], ref: '提亮',
      text: `用可塑橡皮在暗部靠近台面的地方提出反光，再在最亮的地方擦出高光。${spec.hlNote || '光滑的东西高光小而亮，粗糙的东西高光大而柔。'}`,
      tip: '<span>反光不能太亮：</span>反光属于暗部，永远比灰面暗。',
      build: r => { const m1 = mm('refl', (i, g) => isO(i, g) * fdf(i, g) * sm(.06, .2, g.RF[i]) * .35), m2 = mm('hl', (i, g) => isO(i, g) * sm(.12, .5, g.SP[i]) * .9);
        return [{ mode: 'erase', tool: 'eraser', mask: m1, strokes: hatch(r, { m: m1, cell: 44, gap: 9, angles: [.9], w: 11, c: '#000', a: .45, bow: 12 }) }, { mode: 'erase', tool: 'eraser', mask: m2, strokes: hatch(r, { m: m2, cell: 36, gap: 7, angles: [.3], w: 12, c: '#000', a: .55 }) }]; } },
    { title: '背景与整体', tool: '8B 铅笔', cam: 'overview', focus: ['subject', 'backdrop'], ann: ['light', 'term', 'shadow', 'refl', 'hl'], ref: '拉开空间',
      text: `铺上背景和台面，压深最暗的投影和交界线，把前后空间拉开。${spec.endNote || ''}`,
      tip: '<span>退后看：</span>站远一点眯眼看，哪里跳出来了，就把哪里收一收。',
      build: r => { const mb = mm('bg', (i, g) => (1 - isO(i, g)) * (1 - csf(i, g)) * clamp(dkf(i, g) * 1.1, 0, 1) * .75), md = mm('deep', (i, g) => clamp((dkf(i, g) - .55) * 2, 0, 1) * .7);
        return [{ ...SKG, mask: mb, strokes: hatch(r, { m: mb, cell: 80, gap: 5, angles: [-1.15, -.35], w: 1.8, c: '#3a3633', a: .42 }) }, { ...SKG, mask: md, strokes: hatch(r, { m: md, cell: 50, gap: 3.5, angles: [-.85], w: 1.6, c: '#1f1d1b', a: .6 }) }, { ...SKG, grain: .15, strokes: signature(640, 930, SIGN.sketch) }]; } }
  ],
  gouache: ({ mm, getG, names, spec, col, dirAt, big, colS }) => [
    { ...BASE.gouache.steps[0] },
    { title: '起稿', tool: '熟褐 · 小号笔', cam: 'easel', focus: ['subject'], ann: ['axis'], gain: ['熟褐'], ref: '找形',
      text: `用加水稀释的熟褐，淡淡勾出${names}的外形、桌面线和投影的位置。`,
      tip: '<span>颜色要淡：</span>起稿的线最后会被颜色盖住。别用铅笔，铅笔灰会把颜色弄脏。',
      build: r => [{ ...GBR, strokes: [...guideLines(r, getG(), { c: '#8a5a3a', a: .32, onlyHorizon: true }), ...contours(r, getG(), { c: '#8a5a3a', a: .65, w: 2.4, j: 1.5 }), ...clothLines(r, getG(), { c: '#8a5a3a', a: .5, w: 2, j: 1.4 })] }] },
    { title: '铺背景', tool: '橄榄绿 · 土黄 · 钛白', cam: 'easel', focus: ['backdrop', 'lamp'], ann: ['warm', 'cool'], gain: ['橄榄绿', '土黄', '钛白'], ref: '背景也有冷暖',
      text: `先画面积最大的背景。${spec.bgNote || '靠近灯的一边偏暖偏亮，远离灯的一边偏冷偏暗。'}`,
      tip: '<span>顺序：</span>从大到小、从深到浅，是水粉最基本的作画顺序。',
      build: r => { const m = mm('wall', (i, g) => g.id[i] === 0 ? 1 : 0); return [{ ...GBR, mask: m, strokes: [...big(r, m), ...brushes(r, { m, cell: 26, w: [24, 36], len: [50, 95], dir: dirAt, col })] }]; } },
    { title: '铺台面', tool: '群青 · 钛白', cam: 'still', focus: ['cloth'], ann: ['fold'], gain: ['群青'], ref: '台面与投影',
      text: `铺台面和衬布。${spec.clothNote || '受光的一侧亮一些，靠后和背光的地方暗一些，横向用笔表现台面是平的。'}`,
      tip: '<span>投影一起铺：</span>台面上的投影这一步先按颜色铺出来，后面再加深。',
      build: r => { const m = mm('table', (i, g) => g.id[i] === 1 ? 1 : 0); return [{ ...GBR, mask: m, strokes: [...big(r, m), ...brushes(r, { m, cell: 24, w: [20, 30], len: [50, 90], dir: dirAt, col })] }]; } },
    { title: '物体暗部', tool: '深红 · 群青', cam: 'easel', focus: ['subject'], ann: ['term', 'dark'], gain: ['深红'], ref: '暗部偏冷',
      text: `先铺${names}的暗部。${spec.darkNote || '暗部颜色要“沉”下去、偏冷，几个物体的暗部之间要有联系。'}`,
      tip: '<span>先暗后亮：</span>暗部先铺，亮部再压上去，边缘自然就接上了。',
      build: r => { const m = mm('odark', (i, g) => isO(i, g) * sm(.25, .05, g.D[i] * (1 - g.SH[i]))); return [{ ...GBR, mask: m, strokes: [...brushes(r, { m, cell: 22, w: [24, 34], len: [40, 70], dir: dirAt, col: colS }), ...brushes(r, { m, cell: 15, w: [14, 22], len: [26, 46], dir: dirAt, col })] }]; } },
    { title: '物体亮部', tool: '朱红 · 柠檬黄', cam: 'easel', focus: ['subject', 'lamp'], ann: ['light', 'warm2'], gain: ['朱红', '柠檬黄'], ref: '亮部偏暖',
      text: `铺${names}的亮部，越靠近光的地方越暖越亮。${spec.litNote || ''}`,
      tip: '<span>一笔是一笔：</span>水粉别来回涂抹，下笔肯定，笔触本身就是画面的一部分。',
      build: r => { const m = mm('olit', (i, g) => isO(i, g) * sm(-.02, .12, g.D[i] * (1 - g.SH[i]))); return [{ ...GBR, mask: m, strokes: [...brushes(r, { m, cell: 20, w: [22, 30], len: [36, 60], dir: dirAt, col: colS }), ...brushes(r, { m, cell: 13, w: [12, 19], len: [22, 40], dir: dirAt, col })] }]; } },
    { title: '投影与交界线', tool: '群青 · 深红 · 熟褐', cam: 'still', focus: ['cloth', 'subject'], ann: ['shadow', 'term'], ref: '投影不是黑的',
      text: `压深投影和每个物体的明暗交界线。${spec.shadowNote || '投影不是黑色，而是台面本身的颜色加深，再偏冷、偏紫一点。'}`,
      tip: '<span>别用黑：</span>用深红加群青调出来的深色，比黑色透气。',
      build: r => { const ms = mm('cast', (i, g) => csf(i, g) * .85), mb = mm('band', (i, g) => isO(i, g) * bandf(i, g) * .7), dk = (x, y) => mixc(col(x, y), [40, 34, 70], .3).map(v => v * .82);
        return [{ ...GBR, mask: ms, strokes: brushes(r, { m: ms, cell: 16, w: [16, 24], len: [36, 64], dir: dirAt, col: dk }) }, { ...GBR, mask: mb, strokes: brushes(r, { m: mb, cell: 12, w: [10, 16], len: [22, 38], dir: dirAt, col: dk }) }]; } },
    { title: '环境色', tool: '群青 · 朱红', cam: 'easel', focus: ['cloth', 'subject'], ann: ['refl', 'bounce'], ref: '颜色会互相染',
      text: `物体会互相“染色”：台面的颜色映到物体暗部的底边，形成反光。${spec.envNote || '相邻物体的颜色也会映到彼此身上。'}`,
      tip: '<span>点到为止：</span>环境色很微妙，薄薄一层就够。',
      build: r => { const m = mm('refl', (i, g) => isO(i, g) * fdf(i, g) * sm(.06, .2, g.RF[i]) * .7), clc = hex(spec.cloth); return [{ ...GBR, mask: m, strokes: brushes(r, { m, cell: 12, w: [10, 16], len: [20, 34], dir: dirAt, col: (x, y) => mixc(col(x, y), clc, .35) }) }]; } },
    { title: '细节与高光', tool: '钛白 · 勾线笔', cam: 'still', focus: ['subject', 'lamp'], ann: ['hl'], ref: '高光要少',
      text: `刻画细节，最后用钛白调一点暖色，点出高光。${spec.hlNote || '光滑的东西高光又小又亮，粗糙的东西高光大而柔和。'}`,
      tip: '<span>高光要少：</span>一两笔就够，点多了反而不亮。',
      build: r => [{ ...GBR, grain: 0, strokes: specDabs(r, getG(), 'brush', 0) }] },
    { title: '整体调整', tool: '大号笔 · 签名', cam: 'overview', focus: ['subject', 'backdrop'], ann: ['light', 'term', 'shadow', 'refl', 'hl'], ref: '虚实与空间',
      text: `把物体背光一侧的边缘和背景融合，受光一侧保持清晰，边缘虚实决定了空间感。${spec.endNote || '最后压深接触点，签上名字。'}`,
      tip: '<span>眯眼看：</span>眯起眼睛看整体，哪里跳出来了，就把哪里收一收。',
      build: r => { const m = mm('edge', (i, g) => g.EDGE[i] * (g.D[i] < .2 ? .8 : 0)); return [{ ...GBR, mask: m, strokes: brushes(r, { m, cell: 10, w: [9, 14], len: [18, 30], dir: dirAt, col }) }, { ...GBR, grain: 0, strokes: signature(640, 930, SIGN.gouache, 2.4) }]; } }
  ],
  oil: ({ mm, getG, names, spec, col, dirAt, big, colS }) => [
    { ...BASE.oil.steps[0] },
    { ...BASE.oil.steps[1], focus: ['subject'] },
    { title: '单色底稿', tool: '熟褐 · 小号笔', cam: 'easel', focus: ['subject'], ann: ['axis'], gain: ['单色底稿'], ref: '用一个颜色找明暗',
      text: `用熟褐勾出${names}和桌面，再用同一个颜色把暗部铺一遍。先只用一个颜色解决素描关系，之后再想颜色。`, tip: BASE.oil.steps[2].tip,
      build: r => { const m = mm('under', (i, g) => clamp((dkf(i, g) - .25) * 1.3, 0, 1) * .8); return [{ ...OBR, grain: .15, strokes: [...guideLines(r, getG(), { c: '#4a2e1c', a: .4, onlyHorizon: true }), ...contours(r, getG(), { c: '#4a2e1c', a: .75, w: 2.6, j: 1.5 }), ...clothLines(r, getG(), { c: '#4a2e1c', a: .55, w: 2.2, j: 1.4 })] }, { ...OBR, mask: m, strokes: brushes(r, { m, cell: 26, w: [24, 36], len: [40, 80], dir: () => -.7, col: () => hex('#4a2e1c'), a: .55, kind: 'oil', h: 0 }) }]; } },
    { title: '背景 · 湿接湿', tool: '熟褐 · 土黄 · 象牙黑', cam: 'easel', focus: ['backdrop', 'lamp'], ann: ['warm', 'cool'], gain: ['湿接湿'], ref: '背景里的光',
      text: `背景趁湿一块接一块地画，让相邻的颜色在画布上直接融在一起，这叫湿接湿。${spec.bgNote || '靠近灯的一侧偏亮偏暖，越远越暗。'}`, tip: BASE.oil.steps[3].tip,
      build: r => { const m = mm('wall', (i, g) => g.id[i] === 0 ? 1 : 0); return [{ ...OBR, mask: m, strokes: [...big(r, m, 'oil', .2), ...brushes(r, { m, cell: 24, w: [26, 40], len: [50, 100], dir: dirAt, col, kind: 'oil', h: .2 })] }]; } },
    { title: '台面', tool: '熟赭 · 土黄 · 熟褐', cam: 'easel', focus: ['cloth'], ann: [], ref: '平的面横着画',
      text: `铺台面和衬布，投影也先按颜色铺出来。${spec.clothNote || '台面受光的左边暖而亮，往右、往前逐渐变暗，横向用笔表现台面是平的。'}`, tip: BASE.oil.steps[4].tip,
      build: r => { const m = mm('table', (i, g) => g.id[i] === 1 ? 1 : 0); return [{ ...OBR, mask: m, strokes: [...big(r, m, 'oil', .25), ...brushes(r, { m, cell: 22, w: [22, 34], len: [60, 110], dir: dirAt, col, kind: 'oil', h: .25 })] }]; } },
    { title: '物体暗部', tool: '熟褐 · 群青 · 象牙黑', cam: 'still', focus: ['subject'], ann: ['term', 'dark'], ref: '暗部要薄',
      text: `铺${names}的暗部，颜料要薄。${spec.darkNote || '暗部薄、亮部厚，这是油画的老规矩。'}`,
      tip: '<span>薄而透：</span>暗部的颜料薄，底色才能透上来，暗而不死。',
      build: r => { const m = mm('odark', (i, g) => isO(i, g) * sm(.25, .05, g.D[i] * (1 - g.SH[i]))); return [{ ...OBR, mask: m, strokes: brushes(r, { m, cell: 13, w: [12, 18], len: [22, 38], dir: dirAt, col, kind: 'oil', h: .15 }) }]; } },
    { title: '物体亮部', tool: '钛白 · 土黄 · 柠檬黄', cam: 'easel', focus: ['subject', 'lamp'], ann: ['light', 'warm2'], ref: '亮部要厚',
      text: `铺${names}的亮部，颜料比暗部厚。${spec.litNote || ''}`,
      tip: '<span>顺着形体：</span>笔触绕着物体的形走，形体就跟着笔触转起来。',
      build: r => { const m = mm('olit', (i, g) => isO(i, g) * sm(-.02, .12, g.D[i] * (1 - g.SH[i]))); return [{ ...OBR, mask: m, strokes: brushes(r, { m, cell: 11, w: [11, 17], len: [20, 34], dir: dirAt, col, kind: 'oil', h: .35 }) }]; } },
    { title: '投影与环境色', tool: '熟褐 · 群青', cam: 'still', focus: ['cloth', 'subject'], ann: ['shadow', 'refl', 'bounce'], ref: '光滑的东西会映色',
      text: `压深物体在台面上的投影。${spec.envNote || '物体暗部的底边会映出台面的颜色，越光滑的物体映得越清楚。'}`, tip: BASE.oil.steps[7].tip,
      build: r => { const ms = mm('cast', (i, g) => csf(i, g) * .8), mr = mm('refl', (i, g) => isO(i, g) * fdf(i, g) * sm(.06, .2, g.RF[i]) * .7), clc = hex(spec.cloth);
        return [{ ...OBR, mask: ms, strokes: brushes(r, { m: ms, cell: 16, w: [18, 26], len: [40, 70], dir: dirAt, col: (x, y) => col(x, y).map(v => v * .85), kind: 'oil', h: .15 }) }, { ...OBR, mask: mr, strokes: brushes(r, { m: mr, cell: 12, w: [10, 16], len: [20, 34], dir: dirAt, col: (x, y) => mixc(col(x, y), clc, .3), kind: 'oil', h: .1 }) }]; } },
    { title: '厚涂高光', tool: '刮刀 · 钛白', cam: 'easel', focus: ['knife', 'subject'], ann: ['light', 'hl'], gain: ['厚涂', '刮刀'], ref: '堆起来的亮',
      text: `用刮刀挑起浓稠的钛白，在最亮的地方抹上去，颜料堆起来的肌理会在真实的光下反光。${spec.hlNote || ''}`, tip: BASE.oil.steps[8].tip,
      build: r => { const m = mm('imp', (i, g) => isO(i, g) * sm(.15, .5, g.SP[i])); return [{ ...OBR, tool: 'knife', grain: 0, mask: m, strokes: brushes(r, { m, cell: 10, w: [7, 12], len: [14, 26], dir: dirAt, col: (x, y) => mixc(col(x, y), [255, 250, 238], .55), kind: 'oil', h: 1 }) }, { ...OBR, tool: 'knife', grain: 0, strokes: specDabs(r, getG(), 'oil', 1) }]; } },
    { title: '罩染与调整', tool: '透明熟赭 · 调色油', cam: 'overview', focus: ['subject', 'backdrop'], ann: ['light', 'term', 'shadow', 'refl', 'hl'], gain: ['罩染'], ref: '暗部更深更透',
      text: `等颜料干透，用调色油把透明颜色调稀，薄薄地罩染在暗部和背景上，暗部会更深、更透、更有光泽。${spec.endNote || '最后签名。'}`, tip: BASE.oil.steps[9].tip,
      build: r => { const mg = mm('glaze', (i, g) => clamp((dkf(i, g) - .45) * 1.4, 0, 1) * .8);
        return [{ tool: 'brush', blend: 'multiply', mask: mg, strokes: brushes(r, { m: mg, cell: 44, w: [50, 80], len: [90, 160], dir: () => -.4 + (r() - .5) * .6, col: () => hex('#7a5232'), a: .45, kind: 'oil', h: 0 }) }, { tool: 'brush', grain: 0, strokes: signature(640, 930, SIGN.oil, 2.4) }]; } }
  ],
  sketchLand: ({ mm, getG, spec }) => {
    const L = (key, ls) => mm(key, (i, g) => ls.includes(g.LAYER[i]) ? clamp(dkf(i, g) * 1.2, 0, 1) * .9 : 0);
    const H_ = (r, m, cell, angles, w = 1.4, c = '#33302d', a = .5) => hatch(r, { m, cell, gap: 4.5, angles, w, c, a });
    return [
      { ...BASE.sketch.steps[0] },
      { title: '构图', tool: '2H 铅笔', cam: 'easel', focus: ['photo'], ann: ['horizon'], build: r => [{ ...SKG, grain: .2, strokes: landGuides(r, getG(), { c: '#6c6761', a: .45 }) }] },
      { title: '天空', tool: '2H 铅笔', cam: 'easel', focus: ['photo'], ann: ['sky'], gain: ['天空'], build: r => { const m = L('l0', [0]); return [{ ...SKG, mask: m, strokes: H_(r, m, 80, [-.12], 1.1, '#55514c', .4) }]; } },
      { title: '远景', tool: 'HB 铅笔', cam: 'easel', focus: ['photo'], ann: ['far'], gain: ['远景'], build: r => { const m = L('l1', [1]); return [{ ...SKG, mask: m, strokes: H_(r, m, 60, [-.3], 1.2, '#4a4642', .45) }]; } },
      { title: '中景', tool: '2B 铅笔', cam: 'easel', focus: ['photo'], ann: ['midl'], gain: ['中景'], build: r => { const m = L('l2', [2]); return [{ ...SKG, mask: m, strokes: H_(r, m, 50, [-.6, .25]) }]; } },
      { title: '近景', tool: '4B 铅笔', cam: 'easel', focus: ['photo'], ann: ['near'], gain: ['近景'], build: r => { const m = L('l3', [3]); return [{ ...SKG, mask: m, strokes: H_(r, m, 60, [.35, -.6], 1.6) }]; } },
      { title: '主体', tool: '6B 铅笔', cam: 'easel', focus: ['photo'], ann: ['main'], gain: ['主体'], build: r => { const m = L('l4', [4]); return [{ ...SKG, mask: m, strokes: H_(r, m, 44, [-1.2, -.5], 1.6, '#2a2725', .55) }]; } },
      { title: '光影', tool: '8B 铅笔 + 可塑橡皮', cam: 'easel', focus: ['photo'], ann: ['sun', 'main'],
        build: r => { const md = mm('ldeep', (i, g) => clamp((dkf(i, g) - .5) * 1.8, 0, 1) * .75), me = mm('llite', (i, g) => sm(.84, .95, g.T[i]) * .5);
          return [{ ...SKG, mask: md, strokes: H_(r, md, 44, [-.85], 1.6, '#1f1d1b', .6) }, { mode: 'erase', tool: 'eraser', mask: me, strokes: hatch(r, { m: me, cell: 40, gap: 8, angles: [.2], w: 12, c: '#000', a: .5 }) }]; } },
      { title: '整体', tool: 'HB 铅笔', cam: 'overview', focus: ['photo'], ann: ['horizon', 'far', 'near', 'main'],
        build: r => { const m = mm('lall', (i, g) => clamp((dkf(i, g) - .3) * .8, 0, 1) * .35); return [{ ...SKG, mask: m, strokes: H_(r, m, 70, [-.7], 1.2, '#3a3633', .4) }, { ...SKG, grain: .15, strokes: signature(640, 930, SIGN.sketch) }]; } }
    ];
  },
  gouacheLand: ({ mm, getG, col, dirAt, spec }) => {
    const L = (key, ls) => mm(key, (i, g) => ls.includes(g.LAYER[i]) ? 1 : 0);
    const B_ = (r, m, cell, w, len, kind = 'brush', h = 0) => brushes(r, { m, cell, w, len, dir: dirAt, col, kind, h });
    return [
      { ...BASE.gouache.steps[0] },
      { title: '起稿', tool: '熟褐 · 小号笔', cam: 'easel', focus: ['photo'], ann: ['horizon'], build: r => [{ ...GBR, strokes: landGuides(r, getG(), { c: '#8a5a3a', a: .55 }) }] },
      { title: '天空', tool: '大号笔', cam: 'easel', focus: ['photo'], ann: ['sky', 'sun'], build: r => { const m = L('l0', [0]); return [{ ...GBR, mask: m, strokes: B_(r, m, 26, [30, 44], [60, 110]) }]; } },
      { title: '远景', tool: '中号笔', cam: 'easel', focus: ['photo'], ann: ['far'], build: r => { const m = L('l1', [1]); return [{ ...GBR, mask: m, strokes: B_(r, m, 16, [18, 28], [40, 80]) }]; } },
      { title: '中景', tool: '中号笔', cam: 'easel', focus: ['photo'], ann: ['midl'], build: r => { const m = L('l2', [2]); return [{ ...GBR, mask: m, strokes: B_(r, m, 15, [16, 24], [36, 70]) }]; } },
      { title: '近景', tool: '大号笔', cam: 'easel', focus: ['photo'], ann: ['near'], build: r => { const m = L('l3', [3]); return [{ ...GBR, mask: m, strokes: B_(r, m, 18, [20, 30], [40, 80]) }]; } },
      { title: '主体', tool: '小号笔', cam: 'easel', focus: ['photo'], ann: ['main'], build: r => { const m = L('l4', [4]); return [{ ...GBR, mask: m, strokes: B_(r, m, 10, [9, 15], [18, 34]) }]; } },
      { title: '光影', tool: '深色 · 亮色', cam: 'easel', focus: ['photo'], ann: ['sun', 'main'],
        build: r => { const md = mm('ldeep', (i, g) => sm(.55, .78, dkf(i, g)) * .8), ml = mm('llite', (i, g) => sm(.78, .93, g.T[i]) * .8);
          return [{ ...GBR, mask: md, strokes: brushes(r, { m: md, cell: 14, w: [12, 20], len: [26, 48], dir: dirAt, col: (x, y) => col(x, y).map(v => v * .86) }) }, { ...GBR, mask: ml, strokes: brushes(r, { m: ml, cell: 12, w: [8, 14], len: [20, 36], dir: dirAt, col: (x, y) => col(x, y).map(v => Math.min(255, v * 1.06)) }) }]; } },
      { title: '细节高光', tool: '钛白 · 勾线笔', cam: 'easel', focus: ['photo'], ann: ['sun'], build: r => [{ ...GBR, grain: 0, strokes: specDabs(r, getG(), 'brush', 0) }] },
      { title: '整体', tool: '大号笔 · 签名', cam: 'overview', focus: ['photo'], ann: ['horizon', 'far', 'near', 'main'], build: r => [{ ...GBR, grain: 0, strokes: signature(640, 930, '#e9e1d2', 2.4) }] }
    ];
  },
  oilLand: ({ mm, getG, col, dirAt, spec }) => {
    const L = (key, ls) => mm(key, (i, g) => ls.includes(g.LAYER[i]) ? 1 : 0);
    const O_ = (r, m, cell, w, len, h) => brushes(r, { m, cell, w, len, dir: dirAt, col, kind: 'oil', h });
    return [
      { ...BASE.oil.steps[0] },
      { ...BASE.oil.steps[1], focus: ['photo'] },
      { title: '起稿', tool: '熟褐 · 小号笔', cam: 'easel', focus: ['photo'], ann: ['horizon'], gain: ['单色底稿'],
        build: r => { const m = mm('under', (i, g) => clamp((dkf(i, g) - .3) * 1.3, 0, 1) * .75); return [{ ...OBR, grain: .15, strokes: landGuides(r, getG(), { c: '#4a2e1c', a: .6 }) }, { ...OBR, mask: m, strokes: brushes(r, { m, cell: 26, w: [24, 36], len: [40, 80], dir: () => -.7, col: () => hex('#4a2e1c'), a: .5, kind: 'oil', h: 0 }) }]; } },
      { title: '天空', tool: '群青 · 钛白', cam: 'easel', focus: ['photo'], ann: ['sky'], gain: ['湿接湿'], build: r => { const m = L('l0', [0]); return [{ ...OBR, mask: m, strokes: O_(r, m, 22, [26, 40], [40, 80], .3) }]; } },
      { title: '远景', tool: '群青 · 土绿', cam: 'easel', focus: ['photo'], ann: ['far'], build: r => { const m = L('l1', [1]); return [{ ...OBR, mask: m, strokes: O_(r, m, 14, [14, 22], [30, 56], .15) }]; } },
      { title: '中近景', tool: '土黄 · 柠檬黄 · 朱红', cam: 'easel', focus: ['photo'], ann: ['midl', 'near'], build: r => { const m = L('l23', [2, 3]); return [{ ...OBR, mask: m, strokes: O_(r, m, 13, [12, 20], [24, 44], .4) }]; } },
      { title: '主体', tool: '深绿 · 普蓝', cam: 'easel', focus: ['photo'], ann: ['main'], build: r => { const m = L('l4', [4]); return [{ ...OBR, mask: m, strokes: O_(r, m, 10, [9, 15], [20, 36], .35) }]; } },
      { title: '厚涂光感', tool: '刮刀 · 钛白', cam: 'easel', focus: ['knife', 'photo'], ann: ['sun'], gain: ['厚涂', '刮刀'],
        build: r => { const m = mm('limp', (i, g) => sm(.8, .95, g.T[i]) * .9), A = [];
          for (let k = 0; k < (spec.dots || []).length; k++) { const [x, y, c] = spec.dots[k]; A.push(oilS([x - 4, y, x, y - 3, x + 5, y + 1], 7 + r() * 4, hex(c), .95, 1)); }
          return [{ ...OBR, tool: 'knife', grain: 0, mask: m, strokes: brushes(r, { m, cell: 12, w: [8, 14], len: [16, 30], dir: dirAt, col: (x, y) => mixc(col(x, y), [255, 250, 238], .35), kind: 'oil', h: 1 }) }, { ...OBR, tool: 'knife', grain: 0, strokes: [...specDabs(r, getG(), 'oil', 1), ...A] }]; } },
      { title: '罩染与整体', tool: '透明熟赭 · 调色油', cam: 'overview', focus: ['photo'], ann: ['horizon', 'far', 'near', 'main'], gain: ['罩染'],
        build: r => { const mg = mm('glaze', (i, g) => g.LAYER[i] >= 3 ? clamp((dkf(i, g) - .3) * 1.2, 0, 1) * .7 : 0);
          return [{ tool: 'brush', blend: 'multiply', mask: mg, strokes: brushes(r, { m: mg, cell: 44, w: [50, 80], len: [90, 160], dir: () => -.3, col: () => hex('#8a5a32'), a: .4, kind: 'oil', h: 0 }) }, { tool: 'brush', grain: 0, strokes: signature(640, 930, SIGN.oil, 2.4) }]; } }
    ];
  }
};
const LAND_COUNTER = { label: '层次', items: [['天空', '#c9d6e4'], ['远景', '#a7b3c2'], ['中景', '#6e7f5e'], ['近景', '#4e5a38'], ['主体', '#2c3f22']] };
function genericDef(spec) {
  let G = null; const getG = () => G || (G = spec.kind === 'land' ? renderLand(spec) : renderG(spec));
  const gi = (x, y) => clamp(y / GQ | 0, 0, GH - 1) * GW + clamp(x / GQ | 0, 0, GW - 1);
  const col = (x, y) => { const g = getG(), i = gi(x, y); return [g.R[i], g.Gc[i], g.B[i]]; };
  const dirAt = (x, y) => getG().DIR[gi(x, y)];
  const colS = (x, y) => { const a = [0, 0, 0]; for (const [u, v] of [[0, 0], [-10, -10], [10, -10], [-10, 10], [10, 10]]) { const c = col(x + u, y + v); a[0] += c[0] / 5; a[1] += c[1] / 5; a[2] += c[2] / 5; } return a; };
  const big = (r, m, kind = 'brush', h = 0) => brushes(r, { m, cell: 38, w: [50, 72], len: [90, 160], dir: (x, y) => dirAt(x, y) + (r() - .5) * .5, col: colS, kind, h: h * .5 });
  const M = {}; const mm = (k, f) => M[k] || (M[k] = makeMask((x, y) => clamp(f(gi(x, y), getG()), 0, 1), GQ));
  const names = spec.objects ? spec.objects.filter(o => !o.quiet).map(o => o.name).join('、') : '';
  const steps = PIPE[spec.mk + (spec.kind === 'land' ? 'Land' : '')]({ spec, getG, col, dirAt, mm, names, big, colS });
  for (const [k, o] of Object.entries(spec.t || {})) Object.assign(steps[k], o);
  for (const st of steps) st.ref = st.ref || st.title;
  const counter = spec.counter || (spec.kind === 'land' && spec.mk === 'sketch' ? LAND_COUNTER : BASE[spec.mk].counter);
  if (spec.gains) spec.gains.forEach((g, k) => { if (steps[k]) steps[k].gain = g; });
  return { key: spec.key, mk: spec.mk, kind: spec.head ? 'head' : spec.kind, level: spec.level, name: spec.name, sub: spec.sub, medium: { sketch: '素描', gouache: '水粉', oil: '油画' }[spec.mk],
    paper: BASE[spec.mk].paper, weave: spec.mk === 'oil', counter, idleTool: spec.mk === 'sketch' ? 'pencil' : 'brush', steps, spec, getG, backdrop: spec.backdrop, cloth: spec.cloth };
}
