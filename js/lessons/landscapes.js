'use strict';
// 风景课的三张程序参考照片

/* ================= 风景：三张程序生成的参考照片 ================= */
const L2D = n3([-.6, -.6, .5]);
const blobHit = (x, y, blobs, wob, sy = 1) => { let best = 0, tn = null; for (const [cx, cy, rr] of blobs) { const R = rr * (1 + wob * (fbm(x * .022 + cx, y * .022) - .5)), dx = x - cx, dy = y - cy, q = Math.hypot(dx, dy * sy) / R; if (q < 1 && 1 - q > best) { best = 1 - q; tn = [dx / R, dy / R]; } } return tn; };
const blobD = tn => tn[0] * L2D[0] + tn[1] * L2D[1] + Math.sqrt(Math.max(0, 1 - tn[0] ** 2 - tn[1] ** 2)) * L2D[2];

// 大树与小路（夏天的田野）
const TREE_BLOBS = [[205, 300, 115], [125, 350, 90], [290, 345, 95], [175, 410, 85], [255, 245, 80], [150, 250, 75], [235, 415, 75], [320, 285, 60]];
const BUSHES = [[575, 600, 26], [620, 612, 34], [470, 660, 22], [315, 705, 30], [700, 650, 42]];
function landTree(x, y) {
  const tn = blobHit(x, y, TREE_BLOBS, .32);
  if (tn) { const d = blobD(tn) + (fbm(x * .06, y * .06) - .5) * .5; return { r: 7, c: chain([[-1, hex('#1f2e18')], [-.1, hex('#33482a')], [.35, hex('#58763a')], [.8, hex('#8eac5c')]], d), dir: Math.atan2(tn[1], tn[0]) + Math.PI / 2 }; }
  const tc = 205 + (y - 430) * .03, thw = 12 + Math.max(0, y - 690) * .45;
  if (y > 400 && y < 768 && Math.abs(x - tc) < thw) return { r: 8, c: mixc(hex('#7a644c'), hex('#3a2c20'), sm(-.6, .5, (x - tc) / thw)), dir: Math.PI / 2 };
  const farR = 455 + 32 * Math.sin(x * .007 + .5) + 16 * Math.sin(x * .021 + 2) + (fbm(x * .012, 1.7) - .5) * 30;
  const hillR = 535 + 14 * Math.sin(x * .012 + 1.3) - 26 * fbm(x * .035, 3.1), fieldY = 572 + 5 * Math.sin(x * .01);
  if (y < farR) {
    const cl = fbm(x * .005 + 3, y * .011 + 1);
    if (cl > .57 && y < 380) return { r: 1, c: mixc(hex('#b8c4d4'), hex('#f7f8fa'), clamp((cl - .57) * 6 + .3 - y / 900, 0, 1)), dir: -.1 };
    return { r: 0, c: mixc(hex('#7fa6d6'), hex('#e3ecf3'), clamp((y / farR) ** 1.3, 0, 1)), dir: -.08 };
  }
  if (y < hillR) return { r: 2, c: mixc(hex('#8a98ad'), hex('#aab5c4'), fbm(x * .02, y * .02)), dir: -.2 };
  if (y < fieldY) return { r: 3, c: mixc(hex('#3e5530'), hex('#6b8248'), fbm(x * .04, y * .04)), dir: -.5 };
  for (const [cx, cy, rr] of BUSHES) { const dx = x - cx, dy = y - cy, q = Math.hypot(dx, dy * 1.3) / (rr * (1 + .2 * (fbm(x * .05, y * .05) - .5))); if (q < 1) return { r: 6, c: chain([[-1, hex('#26361e')], [0, hex('#3e5a2c')], [.8, hex('#7a9a4e')]], -(dx / rr) * .6 - (dy / rr) * .6), dir: Math.atan2(dy, dx) + Math.PI / 2 }; }
  const u = (y - 585) / 415, pc = 515 - (y - 585) * .21 + 30 * Math.sin((y - 585) * .009), phw = 3 + Math.pow(Math.max(0, u), 1.25) * 95;
  const se = ((x - 345) / 210) ** 2 + ((y - 782) / 36) ** 2, sh = se < 1 ? sm(1, .6, se) : 0, pd = Math.atan2(y - 585, x - 515);
  if (Math.abs(x - pc) < phw) return { r: 5, c: mixc(hex('#e2d4b0'), hex('#c6b088'), clamp(u + (fbm(x * .05, y * .05) - .5) * .5, 0, 1)).map(v => v * (1 - .38 * sh)), dir: pd, sh };
  return { r: 4, c: mixc(hex('#b4b672'), hex('#7c8a46'), clamp(u * .9 + (fbm(x * .03, y * .08) - .5) * .4, 0, 1)).map(v => v * (1 - .42 * sh)), dir: pd + (fbm(x * .05, y * .05) - .5), sh };
}

// 湖边夕照
const LAKE_BLOBS = [[660, 330, 70], [610, 380, 60], [700, 395, 62], [640, 450, 55], [690, 270, 50], [600, 300, 45]];
function landLake(x, y) {
  const HZ = 545, SX = 520, SY = 468;
  const skyAt = yy => chain([[0, hex('#2c376a')], [.35, hex('#69588c')], [.62, hex('#cf786a')], [.84, hex('#f0a45e')], [1, hex('#f8cf86')]], clamp(yy / HZ, 0, 1));
  const ridge = 492 + 28 * Math.sin(x * .006 + 1) + 14 * Math.sin(x * .02) + (fbm(x * .015, 2) - .5) * 20, treeTop = 530 - 16 * fbm(x * .06, 5);
  const tn = blobHit(x, y, LAKE_BLOBS, .35);
  if (tn) { const rim = sm(.5, .95, -tn[0] * .85 - tn[1] * .15); return { r: 7, c: mixc(hex('#1e1a26'), hex('#b05a40'), rim * .85), dir: Math.atan2(tn[1], tn[0]) + Math.PI / 2 }; }
  const tc = 655 - (y - 300) * .02;
  if (y > 330 && y < 830 && Math.abs(x - tc) < 9 + Math.max(0, y - 760) * .2) return { r: 8, c: hex('#1a1620'), dir: Math.PI / 2 };
  if (y < HZ) {
    if (y > treeTop) return { r: 4, c: hex('#2a2236'), dir: 0 };
    if (y > ridge) return { r: 3, c: mixc(hex('#4e4066'), hex('#a6788a'), Math.exp(-Math.abs(x - SX) / 220) * .7 + (y - ridge) / 120 * .2), dir: -.1 };
    const ds = Math.hypot(x - SX, y - SY);
    if (ds < 34) return { r: 2, c: mixc(hex('#fff6d8'), hex('#ffd890'), ds / 34), dir: 0, sp: .9 };
    const cl = fbm(x * .0035, y * .028 + 3);
    if (cl > .58 && y > 120 && y < 430) return { r: 1, c: mixc(mixc(hex('#5a4a7a'), hex('#f09a78'), clamp((y - 150) / 280, 0, 1)), hex('#ffd0a0'), Math.exp(-ds / 160) * .6), dir: (fbm(x * .01, y * .01) - .5) * .3 };
    return { r: 0, c: mixc(skyAt(y), hex('#ffd89a'), Math.exp(-ds / 110) * .7), dir: (fbm(x * .01, y * .02) - .5) * .2 };
  }
  const bank = 790 + 14 * Math.sin(x * .011) + (fbm(x * .03, 7) - .5) * 20;
  if (x < 330 && y > 690) { const k = Math.floor(x / 5); if (y > 690 + hash2(k, 3) * 90 && hash2(k, 9) > .45 && Math.abs((x % 5) - 2.5) < 1.3) return { r: 9, c: hex('#1c1a18'), dir: Math.PI / 2 - .1 }; }
  if (y > bank) return { r: 6, c: mixc(hex('#5a4430'), hex('#1e1c18'), clamp((y - bank) / 120, 0, 1)), dir: -.1 };
  const my = HZ - (y - HZ) * 1.15;
  let c = y < HZ + 12 ? hex('#231d2e') : my > ridge ? mixc(hex('#3a3050'), hex('#6a5070'), Math.exp(-Math.abs(x - SX) / 220) * .6) : skyAt(my).map(v => v * .8);
  c = c.map(v => v * (1 + Math.sin(y * .45 + fbm(x * .01, y * .06) * 7) * .07));
  const colw = Math.exp(-(((x - SX) / (14 + (y - HZ) * .35)) ** 2)), glit = colw * (fbm(x * .09, y * .55) > .52 ? 1 : .25);
  return { r: 5, c: mixc(c, hex('#ffe4a8'), glit * .85), dir: 0, sp: glit };
}

// 麦田与云
const CLOUD_BLOBS = [[250, 225, 85], [335, 190, 105], [435, 232, 92], [330, 285, 95], [560, 165, 68], [625, 192, 58], [150, 262, 58], [515, 215, 60]];
function landWheat(x, y) {
  const HZ = 480, cu = (y - 110) / 660;
  if (cu > 0 && cu < 1) { const cx = 175 + Math.sin(cu * 5) * 8, hw = 62 * Math.pow(cu, .55) * (1 - Math.pow(cu, 8)) * (1 + .25 * (fbm(x * .03, y * .02) - .5)), u = (x - cx) / Math.max(hw, 1);
    if (Math.abs(u) < 1) return { r: 7, c: chain([[-1, hex('#0f2018')], [0, hex('#1f3a28')], [.6, hex('#3e6a3a')], [1, hex('#6a8a46')]], -u * .8 + (fbm(x * .05, y * .03) - .5) * .8), dir: Math.PI / 2 + Math.sin(y * .05 + x * .02) * .6 }; }
  if (y < HZ) {
    const tn = blobHit(x, y, CLOUD_BLOBS, .3, 1.1);
    if (tn) { const d = blobD(tn); return { r: 1, c: chain([[-1, hex('#7f8ca8')], [0, hex('#b4bccf')], [.5, hex('#eef0f2')], [1, hex('#fffdf6')]], d), dir: Math.atan2(tn[1], tn[0]) + Math.PI / 2, sp: sm(.6, .95, d) }; }
    const ridge = 452 + 18 * Math.sin(x * .01 + 2) + (fbm(x * .02, 4) - .5) * 16;
    if (y > ridge) return { r: 2, c: mixc(hex('#5d7f84'), hex('#88a6a6'), fbm(x * .03, y * .05)), dir: -.15 };
    return { r: 0, c: chain([[0, hex('#2f5ea8')], [.6, hex('#6a96cc')], [1, hex('#b9d0e6')]], y / HZ), dir: (fbm(x * .008, y * .008) - .5) * 1.2 };
  }
  const u = (y - HZ) / (H - HZ), pc = 470 + (y - HZ) * .18 + 40 * Math.sin(u * 3), phw = 2 + Math.pow(u, 1.3) * 80, pd = Math.atan2(y - HZ, x - 470);
  if (Math.abs(x - pc) < phw) return { r: 4, c: mixc(hex('#d8c49a'), hex('#b49a6a'), clamp(u + (fbm(x * .06, y * .06) - .5) * .4, 0, 1)), dir: pd };
  const wave = Math.sin(y * .05 + x * .012 + fbm(x * .01, y * .01) * 4) * .5 + .5;
  const c = mixc(mixc(hex('#e6c45a'), hex('#c48a28'), clamp(u * 1.1, 0, 1)), hex('#f4dc80'), wave * .35 * (1 - u * .5));
  return { r: u < .3 ? 3 : 5, c: c.map(v => v * (.92 + (fbm(x * .08, y * .2) - .5) * .25)), dir: pd + (fbm(x * .04, y * .04) - .5) * .8 - .3, sp: wave > .9 && u < .6 ? (wave - .9) * 6 : 0 };
}
const WHEAT_DOTS = (() => { const r = rngOf(17), A = []; while (A.length < 34) { const x = 40 + r() * 720, y = 760 + r() * 220; if (Math.abs(x - (470 + (y - 480) * .18 + 40 * Math.sin((y - 480) / 520 * 3))) > 90 && x > 260) A.push([x, y, r() < .8 ? '#c8321e' : '#e05a2a']); } return A; })();
