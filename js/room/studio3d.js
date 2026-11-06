'use strict';
// 3D 画室：场景、静物、画架、工具、写生视角、相机

/* ================= 3D 画室 ================= */
const gl = $('gl');
const renderer = new THREE.WebGLRenderer({ canvas: gl, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#18130f'); scene.fog = new THREE.Fog('#18130f', 7, 15);
const camera = new THREE.PerspectiveCamera(40, 1, .05, 40);
const controls = new OrbitControls(camera, gl);
controls.enableDamping = true; controls.minDistance = .45; controls.maxDistance = 6.5; controls.maxPolarAngle = 1.52; controls.autoRotateSpeed = .6;

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .8, ...o });
function mesh(geo, mat, pos, parent = scene, cast = true, recv = true) { const m = new THREE.Mesh(geo, mat); if (pos) m.position.copy(pos); m.castShadow = cast; m.receiveShadow = recv; parent.add(m); return m; }
function rod(a, b, r, mat, parent = scene) { const v = new THREE.Vector3().subVectors(b, a), m = mesh(new THREE.CylinderGeometry(r, r, v.length(), 10), mat, a.clone().addScaledVector(v, .5), parent); m.quaternion.setFromUnitVectors(V(0, 1, 0), v.normalize()); return m; }
function canvasTex(w, h, draw, rep) { const c = mk(w, h); draw(ctx2(c), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } t.anisotropy = 8; return t; }

// 地板
const woodT = canvasTex(1024, 1024, (x, w, h) => {
  const r = rngOf(5), rows = 8;
  for (let i = 0; i < rows; i++) {
    let off = r() * w; const y0 = i * h / rows;
    for (let k = -1; k < 3; k++) {
      const c = mixc(hex('#7a5537'), hex('#a27650'), r());
      x.fillStyle = rgb(c); x.fillRect(off + k * w * .6, y0, w * .6, h / rows);
      x.fillStyle = 'rgba(30,18,10,.6)'; x.fillRect(off + k * w * .6, y0, 2, h / rows);
    }
    for (let g = 0; g < 26; g++) { x.strokeStyle = `rgba(50,30,15,${.05 + r() * .08})`; x.lineWidth = 1 + r() * 2; x.beginPath(); const yy = y0 + r() * h / rows; x.moveTo(0, yy); for (let s = 0; s <= w; s += 32) x.lineTo(s, yy + Math.sin(s * .01 + g) * 3); x.stroke(); }
    x.fillStyle = 'rgba(20,12,6,.7)'; x.fillRect(0, y0, w, 2);
  }
}, [3, 3]);
mesh(new THREE.PlaneGeometry(9, 9), std('#ffffff', { map: woodT, roughness: .55 }), V(0, 0, 0), scene, false).rotation.x = -Math.PI / 2;
// 墙
const wallT = canvasTex(512, 512, (x, w, h) => { const r = rngOf(9); x.fillStyle = '#8a7258'; x.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { x.fillStyle = `rgba(${r() < .5 ? '255,240,220' : '40,25,10'},${r() * .05})`; x.fillRect(r() * w, r() * h, 2 + r() * 5, 2 + r() * 5); } }, [3, 1.5]);
const wallM = std('#ffffff', { map: wallT, roughness: .95 });
mesh(new THREE.PlaneGeometry(9, 3.4), wallM, V(0, 1.7, -3), scene, false);
const lw = mesh(new THREE.PlaneGeometry(9, 3.4), wallM, V(-3.3, 1.7, 0), scene, false); lw.rotation.y = Math.PI / 2;
mesh(new THREE.BoxGeometry(9, .12, .03), std('#3a2a1e'), V(0, .06, -2.985), scene, false);
// 窗
const winT = canvasTex(256, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5f7fb8'); g.addColorStop(.7, '#9fb9df'); g.addColorStop(1, '#d9c6a8'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
const win = new THREE.Group(); win.position.set(-3.28, 1.75, -.7); win.rotation.y = Math.PI / 2; scene.add(win);
mesh(new THREE.PlaneGeometry(1.5, 1.3), new THREE.MeshBasicMaterial({ map: winT }), V(0, 0, 0), win, false, false);
for (const [w, h, x, y] of [[1.62, .06, 0, .65], [1.62, .06, 0, -.65], [.06, 1.36, .78, 0], [.06, 1.36, -.78, 0], [.04, 1.3, 0, 0], [1.5, .04, 0, .1]]) mesh(new THREE.BoxGeometry(w, h, .05), std('#2b2119'), V(x, y, .02), win, false);
// 地毯
const rugT = canvasTex(512, 384, (x, w, h) => { x.fillStyle = '#c4ab86'; x.fillRect(0, 0, w, h); const b = [['#6d7a55', 10], ['#c4ab86', 6], ['#a4563a', 6], ['#c4ab86', 10]]; let o = 0; for (const [c, s] of b) { x.strokeStyle = c; x.lineWidth = s; x.strokeRect(o + s / 2, o + s / 2, w - o * 2 - s, h - o * 2 - s); o += s; } const r = rngOf(3); for (let i = 0; i < 4000; i++) { x.fillStyle = `rgba(60,40,20,${r() * .06})`; x.fillRect(r() * w, r() * h, 2, 2); } });
mesh(new THREE.PlaneGeometry(2.6, 1.9), std('#ffffff', { map: rugT, roughness: 1 }), V(-.15, .004, .55), scene, false).rotation.x = -Math.PI / 2;

// 静物台 + 背景板
const stand = mesh(new THREE.BoxGeometry(.7, .9, .6), std('#5c4636', { roughness: .7 }), V(.2, .45, -1.2));
const backdropM = std('#4a4a4c', { roughness: .95 });
const backdrop = mesh(new THREE.BoxGeometry(.95, 1.05, .03), backdropM, V(.2, 1.42, -1.53));
const clothM = std('#bdb6aa', { roughness: .95, side: THREE.DoubleSide });
function makeCloth() {
  const path = [[-1.5, .915], [-1.2, .912], [-.93, .913], [-.885, .88], [-.875, .75], [-.87, .32]];
  const lens = [0]; for (let i = 1; i < path.length; i++) lens.push(lens[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]));
  const total = lens[lens.length - 1], su = 46, sv = 70, pos = [], uv = [], idx = [];
  const at = s => { let i = 1; while (i < lens.length - 1 && lens[i] < s) i++; const t = (s - lens[i - 1]) / (lens[i] - lens[i - 1]); const a = path[i - 1], b = path[i]; const z = lerp(a[0], b[0], t), y = lerp(a[1], b[1], t); const dz = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dz, dy); return [z, y, -dy / l, dz / l, y]; };
  for (let j = 0; j <= sv; j++) { const s = j / sv * total, [z, y, nz, ny] = at(s); const hang = y < .89 ? 1 : .08;
    for (let i = 0; i <= su; i++) { const u = i / su, x = lerp(-.18, .58, u); const f = (Math.sin(u * 15 + s * 4) * .011 + Math.sin(u * 5.3 - s * 2.2) * .016) * hang;
      const b = hang < 1 ? .002 : .018; pos.push(x, y + ny * (f + b), z + nz * (f + b)); uv.push(u, 1 - s / total); } }
  for (let j = 0; j < sv; j++) for (let i = 0; i < su; i++) { const a = j * (su + 1) + i, b = a + su + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
const cloth = mesh(makeCloth(), clothM, null);

// 主体：石膏球 / 苹果
const subjectPos = V(.2, 1.045, -1.2);
const sphere = mesh(new THREE.SphereGeometry(.13, 64, 48), std('#f2efe8', { roughness: .92 }), subjectPos.clone());
const apple = new THREE.Group(); scene.add(apple);
{ const R3 = .12, pts = [];
  for (let i = 0; i <= 48; i++) { const t = i / 48 * Math.PI, s = Math.sin(t), c = -Math.cos(t); const pole = Math.exp(-((s / .28) ** 2)); let y = R3 * c * .9 + (c > 0 ? -R3 * .28 * pole : R3 * .12 * pole); pts.push(new THREE.Vector2(Math.max(.0004, R3 * s * (1 + .08 * c)), y)); }
  const body = mesh(new THREE.LatheGeometry(pts, 64), std('#c3301f', { roughness: .38, metalness: 0 }), V(0, 0, 0), apple);
  body.material.side = THREE.DoubleSide;
  const stem = rod(V(0, .07, 0), V(.012, .13, .004), .0045, std('#4a2e1c'), apple);
  apple.position.set(.2, .913 + R3 * .78, -1.2); apple.rotation.y = .6; apple.userData = { R: R3, stemTip: V(.012, .13, .004) }; }
const oilGroup = new THREE.Group(); oilGroup.position.set(.13, .913, -1.27); scene.add(oilGroup);
const VASE_H = .26, VASE_R = .085, vaseCenter = V(.13, .913 + VASE_H * .38, -1.27), lemonPos = V(.33, .955, -1.08);
{ const rvm = t => (46 + 104 * sm(.2, .58, t) - 60 * sm(.7, 1, t) + 12 * Math.exp(-(((t - .01) / .03) ** 2))) / 150 * VASE_R;
  const pts = [new THREE.Vector2(0, 0)];
  for (let i = 0; i <= 60; i++) { const t = 1 - i / 60; pts.push(new THREE.Vector2(rvm(t), (1 - t) * VASE_H)); }
  pts.push(new THREE.Vector2(rvm(0) * .82, VASE_H - .004), new THREE.Vector2(rvm(0) * .78, VASE_H - .04));
  // 青花纹样：v 从瓶底(0)到瓶口(1)，t = 1 - v
  const vt = canvasTex(512, 256, (x, w, h) => {
    const id = x.createImageData(w, h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const t = j / h * .97, ph = i / w * Math.PI * 2;
      const band = sm(.5, .53, t) * sm(.72, .69, t) * sm(.1, .55, Math.sin(ph * 7 + Math.sin(t * 40) * 1.3));
      const rings = [[.3, .007], [.48, .006], [.74, .006], [.79, .007]].reduce((a, [c, ww]) => a + Math.exp(-(((t - c) / ww) ** 2)), 0);
      const k = clamp(band + rings, 0, 1), c = mixc(hex('#f3efe6'), hex('#24357a'), k), o = (j * w + i) * 4;
      id.data[o] = c[0]; id.data[o + 1] = c[1]; id.data[o + 2] = c[2]; id.data[o + 3] = 255;
    }
    x.putImageData(id, 0, 0);
  });
  mesh(new THREE.LatheGeometry(pts, 72), new THREE.MeshStandardMaterial({ map: vt, roughness: .16, side: THREE.DoubleSide }), V(0, 0, 0), oilGroup);
  const lem = new THREE.Group(); lem.position.copy(lemonPos).sub(oilGroup.position); lem.rotation.y = .35; oilGroup.add(lem);
  const lm = std('#e8c62a', { roughness: .6 });
  mesh(new THREE.SphereGeometry(.045, 40, 28), lm, V(0, 0, 0), lem).scale.set(1.5, .92, 1);
  for (const sgn of [-1, 1]) { const tip = mesh(new THREE.ConeGeometry(.012, .022, 16), lm, V(sgn * .072, 0, 0), lem); tip.rotation.z = -sgn * Math.PI / 2; }
}
oilGroup.visible = false;

// 灯
const lampPos = V(-.52, 1.95, -.52);
const lamp = new THREE.Group(); scene.add(lamp);
{ const blk = std('#1f1b18', { roughness: .5, metalness: .4 });
  for (let i = 0; i < 3; i++) { const a = i * 2.1 + .3; rod(V(lampPos.x + Math.cos(a) * .32, 0, lampPos.z + Math.sin(a) * .32), V(lampPos.x, 1.0, lampPos.z), .011, blk, lamp); }
  rod(V(lampPos.x, 1.0, lampPos.z), V(lampPos.x, 1.88, lampPos.z), .013, blk, lamp);
  const head = new THREE.Group(); head.position.copy(lampPos); lamp.add(head); head.lookAt(subjectPos);
  const shade = mesh(new THREE.CylinderGeometry(.05, .13, .2, 28, 1, true), std('#24201c', { side: THREE.DoubleSide, roughness: .4, metalness: .5 }), V(0, 0, 0), head, true, false); shade.rotation.x = Math.PI / 2;
  mesh(new THREE.SphereGeometry(.045, 16, 12), new THREE.MeshBasicMaterial({ color: '#fff3d6' }), V(0, 0, .02), head, false, false); }
const spot = new THREE.SpotLight('#ffd9a8', 34, 7, .5, .5, 2);
spot.position.copy(lampPos).add(V(.03, -.03, .03)); spot.target.position.copy(subjectPos); scene.add(spot, spot.target);
spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048); spot.shadow.bias = -.0003; spot.shadow.normalBias = .02; spot.shadow.camera.near = .2; spot.shadow.camera.far = 5;
scene.add(new THREE.HemisphereLight('#ffe7c9', '#2a1d14', .5));
const winLight = new THREE.DirectionalLight('#9fb8ff', .9); winLight.position.set(-4, 3, -.4); winLight.target.position.set(0, .6, -.3); scene.add(winLight, winLight.target);
const warm1 = new THREE.PointLight('#ffb36b', 3.2, 6, 2); warm1.position.set(1.1, 2.1, 1.4); scene.add(warm1);
const warm2 = new THREE.PointLight('#ff9d4d', 2.6, 3.5, 2); warm2.position.set(-2.2, 2.3, -2.5); scene.add(warm2);
const easelLamp = new THREE.PointLight('#fff1de', 2.2, 3, 2); easelLamp.position.set(-.15, 1.95, .95); scene.add(easelLamp);

// 画架 + 画纸
const easel = new THREE.Group(); easel.position.set(-.55, 0, .25); easel.rotation.y = .45; scene.add(easel);
const woodM = std('#9c6b42', { roughness: .65 });
rod(V(-.34, 0, .12), V(-.05, 1.78, -.02), .017, woodM, easel); rod(V(.34, 0, .12), V(.05, 1.78, -.02), .017, woodM, easel);
rod(V(0, 0, -.62), V(0, 1.66, -.06), .015, woodM, easel); rod(V(0, .5, -.02), V(0, 1.82, -.035), .019, woodM, easel);
mesh(new THREE.BoxGeometry(.54, .025, .03), woodM, V(0, .55, .065), easel);
const ledge = mesh(new THREE.BoxGeometry(.72, .025, .085), woodM, V(0, .86, .07), easel);
mesh(new THREE.BoxGeometry(.09, .045, .05), woodM, V(0, 1.6, .045), easel);
const artTex = new THREE.CanvasTexture(out); artTex.colorSpace = THREE.SRGBColorSpace; artTex.anisotropy = 8;
const boardSide = std('#d9cdb8', { roughness: .9 });
const artMat = new THREE.MeshStandardMaterial({ map: artTex, roughness: .95, emissive: '#ffffff', emissiveMap: artTex, emissiveIntensity: .32 });
const board = mesh(new THREE.BoxGeometry(.56, .7, .016), [boardSide, boardSide, boardSide, boardSide, artMat, std('#7a6650')], V(0, 1.223, .06), easel);
board.rotation.x = -.075;
const BW = .56, BH = .7;
function boardPoint(u, v, off = .009) { return board.localToWorld(V((u - .5) * BW, (.5 - v) * BH, off)); }

// 边桌 + 工具
const side = new THREE.Group(); side.position.set(.62, 0, .78); side.rotation.y = -.35; scene.add(side);
{ const tm = std('#6b4a33', { roughness: .6 });
  mesh(new THREE.BoxGeometry(.64, .03, .42), tm, V(0, .72, 0), side);
  for (const [x, z] of [[-.29, -.18], [.29, -.18], [-.29, .18], [.29, .18]]) rod(V(x, 0, z), V(x, .71, z), .014, tm, side); }
const pencils = new THREE.Group(); pencils.position.set(-.18, .743, .06); side.add(pencils);
const pencilAnchors = [];
['2H', 'HB', '4B', '8B'].forEach((g, i) => { const p = new THREE.Group(); p.position.set(i * .028, 0, 0); pencils.add(p);
  const body = mesh(new THREE.CylinderGeometry(.0045, .0045, .17, 6), std(['#3e6a4b', '#2f5a3c', '#284c34', '#1f3d2a'][i], { roughness: .5 }), V(0, 0, 0), p); body.rotation.x = Math.PI / 2;
  const tip = mesh(new THREE.ConeGeometry(.0045, .02, 6), std('#e3c49a'), V(0, 0, -.095), p); tip.rotation.x = -Math.PI / 2;
  pencilAnchors.push({ text: g, obj: p }); });
const eraserObj = mesh(new THREE.BoxGeometry(.035, .014, .022), std('#9aa0a6', { roughness: .95 }), V(-.05, .744, -.06), side);
const knifeObj = mesh(new THREE.BoxGeometry(.13, .008, .018), std('#e0b030', { roughness: .4 }), V(.0, .741, .14), side);
const palette = new THREE.Group(); palette.position.set(.12, .74, -.02); side.add(palette);
mesh(new THREE.CylinderGeometry(.13, .13, .008, 40), std('#efe7d6', { roughness: .4 }), V(0, 0, 0), palette).scale.set(1.25, 1, .85);
const blobs = DEFS.gouache.counter.items.map(([n, c], i) => { const a = -2.6 + i * .52; const b = mesh(new THREE.SphereGeometry(.016, 14, 10), std(c, { roughness: .35 }), V(Math.cos(a) * .13, .008, Math.sin(a) * .09), palette); b.scale.y = .45; b.visible = false; return b; });
const bucket = mesh(new THREE.CylinderGeometry(.06, .052, .11, 28, 1, true), std('#8aa3b8', { roughness: .3, metalness: .3, side: THREE.DoubleSide }), V(.23, .795, .13), side);
mesh(new THREE.CircleGeometry(.058, 28), std('#5f7b8c', { roughness: .1 }), V(.23, .82, .13), side).rotation.x = -Math.PI / 2;
const brushJar = new THREE.Group(); brushJar.position.set(.25, .74, -.13); side.add(brushJar);
const tubes = new THREE.Group(); tubes.position.set(-.21, .75, -.13); side.add(tubes);
['#f4ede0', '#e0482a', '#2f3f8f', '#f2d23c', '#5a3a26'].forEach((c, i) => { const t = mesh(new THREE.CylinderGeometry(.011, .011, .07, 14), std('#d8d8d8', { metalness: .6, roughness: .3 }), V(i * .026, 0, (i % 2) * .012), tubes); t.rotation.z = Math.PI / 2; t.rotation.y = .3; mesh(new THREE.CylinderGeometry(.0113, .0113, .03, 14), std(c, { roughness: .5 }), V(0, .012, 0), t); });
const oilBottle = new THREE.Group(); oilBottle.position.set(-.08, .74, -.16); side.add(oilBottle);
mesh(new THREE.CylinderGeometry(.022, .024, .09, 20), std('#c8a85a', { roughness: .2, transparent: true, opacity: .85 }), V(0, .045, 0), oilBottle); mesh(new THREE.CylinderGeometry(.01, .01, .02, 12), std('#2a2a2a'), V(0, .1, 0), oilBottle);
mesh(new THREE.CylinderGeometry(.016, .016, .06, 16), std('#a87830', { roughness: .2, transparent: true, opacity: .85 }), V(.045, .03, .01), oilBottle);
mesh(new THREE.CylinderGeometry(.04, .04, .1, 20), std('#4f5b4a', { roughness: .6 }), V(0, .05, 0), brushJar);
for (let i = 0; i < 5; i++) rod(V((i - 2) * .012, .05, (i % 2) * .01), V((i - 2) * .03, .27 + (i % 3) * .02, (i % 2 - .5) * .04), .004, std(i % 2 ? '#a0522d' : '#2a2a2a'), brushJar);

// 凳子、书架、石膏几何体、画框、植物
{ const sm2 = std('#5a3d29', { roughness: .6 });
  const st = new THREE.Group(); st.position.set(-.2, 0, 1.15); scene.add(st);
  mesh(new THREE.CylinderGeometry(.17, .17, .04, 28), sm2, V(0, .5, 0), st);
  for (let i = 0; i < 3; i++) { const a = i * 2.1; rod(V(Math.cos(a) * .17, 0, Math.sin(a) * .17), V(Math.cos(a) * .1, .49, Math.sin(a) * .1), .014, sm2, st); }
  const shelfM = std('#4a3424', { roughness: .7 }), white = std('#eeeae2', { roughness: .9 });
  for (const y of [.7, 1.2, 1.7, 2.2]) mesh(new THREE.BoxGeometry(1.5, .035, .32), shelfM, V(-2.15, y, -2.83));
  for (const x of [-2.88, -1.42]) mesh(new THREE.BoxGeometry(.035, 1.6, .32), shelfM, V(x, 1.45, -2.83));
  mesh(new THREE.BoxGeometry(.16, .16, .16), white, V(-2.6, .8, -2.8)).rotation.y = .5;
  mesh(new THREE.ConeGeometry(.08, .22, 32), white, V(-2.3, .83, -2.8));
  mesh(new THREE.CylinderGeometry(.07, .07, .2, 32), white, V(-2.0, .82, -2.8));
  mesh(new THREE.ConeGeometry(.1, .2, 4), white, V(-1.7, 1.32, -2.8)).rotation.y = .4;
  mesh(new THREE.SphereGeometry(.08, 32, 20), white, V(-2.4, 1.3, -2.8));
  const r = rngOf(4); for (let i = 0; i < 12; i++) { const h = .18 + r() * .1; mesh(new THREE.BoxGeometry(.035 + r() * .02, h, .22), std(rgb(mixc(hex('#6d2c22'), hex('#c9a46a'), r()))), V(-2.8 + i * .05, 1.72 + h / 2, -2.82)); }
  for (let i = 0; i < 8; i++) { const h = .2 + r() * .08; mesh(new THREE.BoxGeometry(.04, h, .22), std(rgb(mixc(hex('#2f4a5c'), hex('#b08a5a'), r()))), V(-2.0 + i * .055, 2.22 + h / 2, -2.82)); }
  const art1 = canvasTex(256, 320, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#e9b06a'); g.addColorStop(.55, '#c8603c'); g.addColorStop(1, '#3d2b3a'); x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = '#f6e3b5'; x.beginPath(); x.arc(w * .62, h * .4, 34, 0, 7); x.fill(); x.fillStyle = '#2b2030'; x.fillRect(0, h * .72, w, h); });
  const art2 = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#efe9dc'; x.fillRect(0, 0, w, h); x.strokeStyle = '#3a3633'; x.lineWidth = 2; x.beginPath(); x.moveTo(70, 100); x.lineTo(140, 70); x.lineTo(200, 100); x.lineTo(130, 130); x.closePath(); x.moveTo(70, 100); x.lineTo(70, 190); x.lineTo(130, 220); x.lineTo(200, 190); x.lineTo(200, 100); x.moveTo(130, 130); x.lineTo(130, 220); x.stroke(); x.fillStyle = 'rgba(40,36,33,.45)'; x.beginPath(); x.moveTo(130, 130); x.lineTo(200, 100); x.lineTo(200, 190); x.lineTo(130, 220); x.fill(); });
  for (const [t, w, h, x, y] of [[art1, .55, .7, .95, 1.75], [art2, .5, .5, 1.75, 1.6]]) { mesh(new THREE.BoxGeometry(w + .06, h + .06, .03), std('#2a1f17'), V(x, y, -2.98), scene, false); mesh(new THREE.PlaneGeometry(w, h), std('#ffffff', { map: t, roughness: .9 }), V(x, y, -2.96), scene, false); }
  const pl = new THREE.Group(); pl.position.set(2.1, 0, -2.4); scene.add(pl);
  mesh(new THREE.CylinderGeometry(.18, .14, .36, 24), std('#b0654a'), V(0, .18, 0), pl);
  const leaf = std('#4f6b3c', { roughness: .7 }); const r2 = rngOf(8);
  for (let i = 0; i < 14; i++) { const l = mesh(new THREE.SphereGeometry(.12, 12, 8), leaf, V((r2() - .5) * .4, .55 + r2() * .7, (r2() - .5) * .4), pl); l.scale.set(.5, 1.2, .2); l.rotation.set(r2() * 2, r2() * 3, r2() - .5); }
}

// 手里的工具：铅笔 / 橡皮 / 画笔（原点 = 笔尖，+Y 指向笔尾）
function makeTool(kind) {
  const g = new THREE.Group();
  if (kind === 'pencil') { mesh(new THREE.ConeGeometry(.0048, .022, 6), std('#e3c49a'), V(0, .011, 0), g, true, false).rotation.x = Math.PI;
    mesh(new THREE.CylinderGeometry(.0048, .0048, .16, 6), std('#2f5a3c', { roughness: .45 }), V(0, .102, 0), g, true, false);
    mesh(new THREE.ConeGeometry(.0016, .006, 6), std('#202020'), V(0, .003, 0), g, false, false).rotation.x = Math.PI; }
  if (kind === 'brush') { mesh(new THREE.ConeGeometry(.007, .03, 12), std('#2a1f18'), V(0, .015, 0), g, true, false).rotation.x = Math.PI;
    mesh(new THREE.CylinderGeometry(.0075, .007, .03, 12), std('#c9c9c9', { metalness: .8, roughness: .3 }), V(0, .045, 0), g, true, false);
    mesh(new THREE.CylinderGeometry(.0045, .007, .19, 12), std('#a0522d', { roughness: .4 }), V(0, .155, 0), g, true, false); }
  if (kind === 'knife') { const steel = std('#cfd2d6', { metalness: .9, roughness: .25 });
    mesh(new THREE.BoxGeometry(.024, .05, .0012), steel, V(0, .025, 0), g, true, false);
    rod(V(0, .05, 0), V(0, .075, .012), .0018, steel, g);
    mesh(new THREE.CylinderGeometry(.006, .005, .1, 12), std('#7a4a2a', { roughness: .45 }), V(0, .125, .012), g, true, false); }
  if (kind === 'eraser') { mesh(new THREE.BoxGeometry(.03, .03, .018), std('#9aa0a6', { roughness: .95 }), V(0, .015, 0), g, true, false); }
  g.scale.setScalar(1.5); g.visible = false; scene.add(g); return g;
}
const TOOLS = { pencil: makeTool('pencil'), brush: makeTool('brush'), eraser: makeTool('eraser'), knife: makeTool('knife') };
let toolKind = 'pencil', toolTip = null, toolTarget = { pos: V(0, 0, 0), q: new THREE.Quaternion() };
// 笔的姿态：toolLift 0 = 笔尖贴纸，1 = 抬起；toolDir = 运笔方向；toolStyle 决定握笔角度
let toolLift = 1, toolDir = [1, 0], toolStyle = 'line', toolColor = '#3a2a1e';
const LEAN = { line: .85, shade: .32, brush: .6, eraser: 1.8, knife: .5 };
// 沿一笔走到 f（0..1）处的点和方向
function pointOn(s, f) {
  if (s.k === 'dot') return [s.x, s.y, 1, 0];
  const p = s.p, segs = []; let tot = 0;
  for (let i = 2; i < p.length; i += 2) { const l = Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1]); segs.push(l); tot += l; }
  let d = f * tot;
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i] || i === segs.length - 1) { const t = segs[i] ? clamp(d / segs[i], 0, 1) : 0, x0 = p[i * 2], y0 = p[i * 2 + 1], x1 = p[i * 2 + 2], y1 = p[i * 2 + 3], l = segs[i] || 1;
      return [lerp(x0, x1, t), lerp(y0, y1, t), (x1 - x0) / l, (y1 - y0) / l]; }
    d -= segs[i];
  }
  return [p[0], p[1], 1, 0];
}

/* 课程的 3D 静物与参考照片 */
const LESSON_GROUPS = {};
function buildLessonGroup(def) {
  const g = new THREE.Group(); scene.add(g);
  if (def.kind === 'land') {
    const G = def.getG(), c = mk(GW, GH), x = ctx2(c), id = x.createImageData(GW, GH);
    for (let i = 0; i < GN; i++) { id.data[i * 4] = G.R[i]; id.data[i * 4 + 1] = G.Gc[i]; id.data[i * 4 + 2] = G.B[i]; id.data[i * 4 + 3] = 255; }
    x.putImageData(id, 0, 0);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const PW = .44, PH = .55, b = new THREE.Group(); b.position.set(.2, TABLE_Y + PH / 2 + .03, -1.42); b.rotation.x = -.1; g.add(b);
    mesh(new THREE.BoxGeometry(PW + .04, PH + .04, .02), std('#2a1f17'), V(0, 0, -.012), b);
    g.userData = { PW, PH, photo: mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshStandardMaterial({ map: t, roughness: .6, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: .25 }), V(0, 0, 0), b, false, true) };
  } else for (const o of def.spec.objects) {
    const m = o.mat, mt = new THREE.MeshStandardMaterial({ color: m.fn ? '#ffffff' : m.c, vertexColors: !!m.fn, roughness: m.metal ? .32 : m.ks > .8 ? .14 : m.ks > .3 ? .38 : .85, metalness: m.metal ? .55 : 0 });
    if (o.mesh) mesh(o.mesh(), mt, null, g); else for (const pt of o.parts) { const geo = pt.geo(); if (m.fn) colorize(geo, m.fn); mesh(geo, mt, null, g); }
  }
  if (def.spec.drapes) for (const d of def.spec.drapes) for (const geo of d.mesh()) mesh(geo, new THREE.MeshStandardMaterial({ color: d.tex ? '#ffffff' : d.color, vertexColors: d.tex, roughness: .95, side: THREE.DoubleSide }), null, g, !d.hang, true);
  g.visible = false; return g;
}
function colorize(geo, fn) {
  const pos = geo.attributes.position, cols = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) { const c = fn([pos.getX(i), pos.getY(i), pos.getZ(i)]); cols[i * 3] = c[0] ** 2.2; cols[i * 3 + 1] = c[1] ** 2.2; cols[i * 3 + 2] = c[2] ** 2.2; }
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
}
const photoPoint = (grp, u, v) => grp.userData.photo.localToWorld(V((u - .5) * grp.userData.PW, (.5 - v) * grp.userData.PH, .004));
function genericLabels(def) {
  const L = [], wp = o => o.getWorldPosition(V(0, 0, 0));
  if (def.kind === 'land') L.push(['photo', '参考照片', V(.2, 1.55, -1.45)]);
  else for (const o of def.spec.objects) if (!o.quiet) L.push(['subject', o.name, V(o.b[0][0], o.b[0][1] + Math.min(o.b[1], .15) + .05, o.b[0][2])]);
  L.push(['cloth', '衬布', V(.4, .7, -.86)], ['backdrop', '背景板', V(.2, 1.85, -1.5)], ['lamp', '台灯 · 主光源', lampPos.clone().add(V(0, .16, 0))], ['easel', '画架', boardPoint(.5, -.12)]);
  if (def.mk === 'sketch') { pencilAnchors.forEach((p, i) => L.push(['pencils', p.text, wp(p.obj).add(V(0, .03 + (i % 2) * .035, 0))])); L.push(['eraser', '可塑橡皮', wp(eraserObj).add(V(0, .04, 0))]); }
  else L.push(['palette', '调色盘', wp(palette).add(V(0, .05, 0))], ['brushes', def.mk === 'oil' ? '猪鬃笔' : '平头笔', wp(brushJar).add(V(0, .33, 0))], def.mk === 'oil' ? ['knife', '刮刀', wp(knifeObj).add(V(0, .03, 0))] : ['bucket', '洗笔桶', wp(bucket).add(V(0, .1, 0))]);
  return L;
}

/* 写生视角（小窗） */
const refCanvas = $('refgl');
const refR = new THREE.WebGLRenderer({ canvas: refCanvas, antialias: true });
refR.setPixelRatio(Math.min(devicePixelRatio, 2)); refR.shadowMap.enabled = true; refR.shadowMap.type = THREE.PCFSoftShadowMap;
refR.toneMapping = THREE.ACESFilmicToneMapping; refR.toneMappingExposure = 1.1;
const refCam = new THREE.PerspectiveCamera(30, 4 / 3, .05, 20);
refCam.position.set(.24, 1.2, -.12); refCam.lookAt(.2, 1.03, -1.2); refCam.layers.enable(1);

const ACC = new THREE.Color('#e8a63f'), BLUE = new THREE.Color('#8fb3e0');
const annGroup = {};
function onLayer1(o) { o.traverse(c => c.layers.set(1)); scene.add(o); o.visible = false; return o; }
function arrow(from, to, color) {
  const g = new THREE.Group(), dir = new THREE.Vector3().subVectors(to, from), len = dir.length(); dir.normalize();
  const m = new THREE.MeshBasicMaterial({ color, depthTest: false, transparent: true });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.004, .004, len - .04, 8), m); shaft.position.copy(from).addScaledVector(dir, (len - .04) / 2); shaft.quaternion.setFromUnitVectors(V(0, 1, 0), dir);
  const head = new THREE.Mesh(new THREE.ConeGeometry(.014, .04, 12), m); head.position.copy(to).addScaledVector(dir, -.02); head.quaternion.setFromUnitVectors(V(0, 1, 0), dir);
  g.add(shaft, head); g.renderOrder = 10; return g;
}
let ANN_POS = {};
function buildAnnotations(key) {
  for (const k in annGroup) { scene.remove(annGroup[k]); }
  for (const k in annGroup) delete annGroup[k];
  const def = DEFS[key];
  if (def.kind === 'land') { const grp = LESSON_GROUPS[key]; ANN_POS = {}; for (const [k, [x, y, t]] of Object.entries(def.spec.annPts)) { ANN_POS[k] = photoPoint(grp, x / W, y / H); ANN_TEXT[k] = t; } return; }
  const S = def.spec ? V(...def.spec.annS) : key === 'sketch' ? subjectPos.clone() : key === 'oil' ? vaseCenter.clone() : apple.position.clone().add(V(0, .01, 0)), r = def.spec ? def.spec.annR : { sketch: .13, gouache: .12, oil: VASE_R }[key];
  const Lw = new THREE.Vector3().subVectors(spot.position, S).normalize(), Vw = new THREE.Vector3().subVectors(refCam.position, S).normalize();
  const on = d => S.clone().addScaledVector(d.clone().normalize(), r * 1.02);
  annGroup.light = onLayer1(arrow(S.clone().addScaledVector(Lw, r * 3.4), S.clone().addScaledVector(Lw, r * 1.25), ACC));
  // 明暗交界线：垂直于光线方向的大圆
  const U = new THREE.Vector3().crossVectors(Lw, V(0, 1, 0)).normalize(), W2 = new THREE.Vector3().crossVectors(Lw, U).normalize(), pts = [];
  for (let i = 0; i < 96; i++) { const a = i / 96 * Math.PI * 2; pts.push(S.clone().addScaledVector(U, Math.cos(a) * r * 1.012).addScaledVector(W2, Math.sin(a) * r * 1.012).addScaledVector(Lw, -r * .1)); }
  annGroup.term = onLayer1(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 120, .0022, 6, true), new THREE.MeshBasicMaterial({ color: ACC })));
  const hlP = on(Lw.clone().add(Vw));
  annGroup.hl = onLayer1(new THREE.Mesh(new THREE.TorusGeometry(.016, .0018, 8, 32), new THREE.MeshBasicMaterial({ color: ACC, depthTest: false })));
  annGroup.hl.position.copy(hlP); annGroup.hl.lookAt(refCam.position);
  const reflTo = on(Lw.clone().multiplyScalar(-1).add(V(0, -.7, 0)).add(Vw.clone().multiplyScalar(.7)));
  annGroup.refl = onLayer1(arrow(S.clone().add(V(r * 1.6, -r * .95, r * .5)), reflTo, BLUE));
  annGroup.bounce = annGroup.refl;
  const ax = new THREE.Group(); ax.position.copy(S); ax.lookAt(refCam.position);
  const lm = new THREE.MeshBasicMaterial({ color: ACC, transparent: true, opacity: .9, depthTest: false });
  ax.add(new THREE.Mesh(new THREE.TorusGeometry(r * 1.0, .0016, 6, 80), lm));
  for (const rot of [0, Math.PI / 2]) { const l = new THREE.Mesh(new THREE.BoxGeometry(.0025, r * 2.5, .0025), lm); l.rotation.z = rot; ax.add(l); }
  annGroup.axis = onLayer1(ax);
  const horiz = V(-Lw.x, 0, -Lw.z).normalize();
  ANN_POS = {
    light: S.clone().addScaledVector(Lw, r * 2.6), term: on(Vw.clone().sub(Lw.clone().multiplyScalar(Vw.dot(Lw) - .1))), hl: hlP.clone().add(V(0, .03, 0)),
    shadow: V(S.x, .915, S.z).addScaledVector(horiz, r * 1.9), refl: reflTo, dark: on(Lw.clone().multiplyScalar(-1.1).add(Vw).add(V(0, -.5, 0))), mid: on(Lw.clone().multiplyScalar(.45).add(Vw)),
    axis: S.clone().add(V(0, r * 1.45, 0)), fold: V(S.x - .22, .92, S.z + .22), warm: V(S.x - .3, 1.55, -1.5), cool: V(S.x + .33, 1.55, -1.5),
    bounce: key === 'oil' ? lemonPos.clone().add(V(-.02, .06, 0)) : V(S.x + .2, .92, S.z + .08), stem: S.clone().add(V(.02, r * 1.15, 0)), warm2: on(Lw.clone().add(Vw.clone().multiplyScalar(.5)))
  };
}
const ANN_TEXT = { light: '光源方向', term: '明暗交界线', hl: '高光', shadow: '投影', refl: '反光', dark: '暗部', mid: '灰面', axis: '中心线', fold: '褶皱', warm: '暖 · 亮', cool: '冷 · 暗', bounce: '环境色', stem: '果柄', warm2: '暖色亮部' };
const ALT = new Set(['refl', 'bounce', 'cool', 'dark']);

/* 主画面标签 */
const LABEL_SETS = {
  sketch: () => [['subject', '石膏球体', subjectPos.clone().add(V(0, .2, 0))], ['cloth', '衬布', V(.4, .7, -.86)], ['backdrop', '背景板', V(.2, 1.85, -1.5)], ['lamp', '台灯 · 主光源', lampPos.clone().add(V(0, .16, 0))], ['easel', '画架', boardPoint(.5, -.12)],
    ...pencilAnchors.map((p, i) => ['pencils', p.text, p.obj.getWorldPosition(V(0, 0, 0)).add(V(0, .03 + (i % 2) * .035, 0))]), ['eraser', '可塑橡皮', eraserObj.getWorldPosition(V(0, 0, 0)).add(V(0, .04, 0))], ['knife', '美工刀', knifeObj.getWorldPosition(V(0, 0, 0)).add(V(0, .03, 0))]],
  oil: () => [['subject', '青花瓷瓶', vaseCenter.clone().add(V(0, .2, 0))], ['lemon', '柠檬', lemonPos.clone().add(V(0, .09, 0))], ['cloth', '桌布', V(.4, .7, -.86)], ['backdrop', '背景板', V(.2, 1.85, -1.5)], ['lamp', '台灯 · 主光源', lampPos.clone().add(V(0, .16, 0))], ['easel', '画架', boardPoint(.5, -.12)],
    ['palette', '调色盘', palette.getWorldPosition(V(0, 0, 0)).add(V(0, .05, 0))], ['knife', '刮刀', knifeObj.getWorldPosition(V(0, 0, 0)).add(V(0, .03, 0))], ['brushes', '猪鬃笔', brushJar.getWorldPosition(V(0, 0, 0)).add(V(0, .33, 0))]],
  gouache: () => [['subject', '苹果', apple.position.clone().add(V(0, .2, 0))], ['cloth', '蓝灰衬布', V(.4, .7, -.86)], ['backdrop', '背景板', V(.2, 1.85, -1.5)], ['lamp', '台灯 · 主光源', lampPos.clone().add(V(0, .16, 0))], ['easel', '画架', boardPoint(.5, -.12)],
    ['palette', '调色盘', palette.getWorldPosition(V(0, 0, 0)).add(V(0, .05, 0))], ['bucket', '洗笔桶', bucket.getWorldPosition(V(0, 0, 0)).add(V(0, .1, 0))], ['brushes', '平头笔', brushJar.getWorldPosition(V(0, 0, 0)).add(V(0, .33, 0))]]
};
let labels = [];
function buildLabels(key) {
  const box = $('labels'); box.innerHTML = ''; scene.updateMatrixWorld(true);
  const list = LABEL_SETS[key] ? LABEL_SETS[key]() : genericLabels(DEFS[key]), mk0 = DEFS[key].mk, wp = o => o.getWorldPosition(V(0, 0, 0));
  if (mk0 !== 'sketch') list.push(['tubes', '颜料', wp(tubes).add(V(.05, .04, 0))]);
  if (mk0 === 'oil') list.push(['bottle', '松节油 · 调色油', wp(oilBottle).add(V(0, .14, 0))]);
  if (mk0 === 'sketch' && !list.some(l => l[0] === 'knife')) list.push(['knife', '美工刀', wp(knifeObj).add(V(0, .03, 0))]);
  labels = list.map(([id, text, pos]) => { const el = document.createElement('div'); el.className = 'tag'; el.textContent = text; box.appendChild(el); return { id, el, pos }; });
}

/* 相机机位 */
scene.updateMatrixWorld(true);
const CAMS = {
  overview: { p: V(2.25, 1.85, 2.95), t: V(-.2, .95, -.45) },
  tools: { p: V(1.35, 1.32, 1.75), t: V(.5, .76, .7) },
  prep: { p: V(1.22, 1.5, 1.66), t: V(.68, .76, .6) },
  easel: { p: V(.3, 1.52, 1.75), t: V(-.6, 1.12, .05) },
  still: { p: V(1.15, 1.45, .55), t: V(-.05, 1.0, -.95) }
};
let camTween = null;
function setCam(name, instant) {
  const c = CAMS[name] || CAMS.easel;
  if (instant || REDUCED) { camera.position.copy(c.p); controls.target.copy(c.t); camTween = null; return; }
  camTween = { p0: camera.position.clone(), t0: controls.target.clone(), p1: c.p.clone(), t1: c.t.clone(), s: performance.now(), d: 1500 };
}
controls.addEventListener('start', () => { camTween = null; });
