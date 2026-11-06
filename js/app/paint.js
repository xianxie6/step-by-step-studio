'use strict';
// 自己动手画

/* ================= 自己动手画 ================= */
const PAINT_TOOLS = {
  sketch: [{ id: '2H', c: '#8a8580', a: .22, w: 1.2 }, { id: 'HB', c: '#55514c', a: .32, w: 1.6 }, { id: '4B', c: '#302d2a', a: .42, w: 2.4 }, { id: '8B', c: '#1a1817', a: .58, w: 3.6 }, { id: '橡皮', erase: true, w: 10 }],
  gouache: [...DEFS.gouache.counter.items.map(([n, c]) => ({ id: n, sw: c })), { id: '画布色', sw: '#efe8da', erase: true }],
  oil: [['钛白', '#f4ede0'], ['柠檬黄', '#f0d030'], ['土黄', '#c8902e'], ['熟赭', '#a8683a'], ['朱红', '#d8452a'], ['群青', '#2b3f8a'], ['熟褐', '#4a2e1c'], ['象牙黑', '#1f1c1a']].map(([n, c]) => ({ id: n, sw: c })).concat([{ id: '刮刀', knife: true }])
};
let ptool = null, CUR_TOOLS = [];
function buildPaintTools() {
  const list = CUR_TOOLS = toolsFor(MK()); ptool = list.find(t => t.id === { sketch: 'HB', gouache: '朱红', oil: '朱红' }[MK()]) || list[0];
  $('tools').innerHTML = list.map((t, i) => t.sw ? `<button type="button" class="tool sw" data-i="${i}" title="${t.id}" aria-label="${t.id}" style="background:${t.sw}"></button>` : `<button type="button" class="tool" data-i="${i}">${t.id}</button>`).join('');
  syncToolBtns();
  $('bsize').value = MK() === 'sketch' ? 3 : 5; S.knife = false;
}
function syncToolBtns() { const list = CUR_TOOLS; [...$('tools').children].forEach((b, i) => b.setAttribute('aria-pressed', list[i] === ptool || !!(list[i].knife && S.knife))); }
$('tools').addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (!b) return; const t = CUR_TOOLS[+b.dataset.i]; if (t.knife) S.knife = !S.knife; else ptool = t; syncToolBtns(); });

const undo = [];
function enterPaint() {
  if (anim) { anim.start = -1e9; tickAnim(performance.now()); }
  setPlaying(false);
  S.paint = true; document.body.classList.add('painting'); $('paintbar').hidden = false; $('paintBtnText').textContent = '正在画 · 点“完成”回到步骤';
  if (rt.user) octx.drawImage(rt.user, 0, 0);
  S.paintPaper = rt.userPaper || rt.paper; paperPat = null;
  markDirty(); undo.length = 0;
  const g = ctx2($('guide')); g.clearRect(0, 0, W, H); g.drawImage(ensureSnap(rt, rt.def.steps.length - 1), 0, 0);
  $('guide').hidden = !S.guide;
  if (innerWidth > 760 || S.view === 'room') setView('sheet');
  $('view2d').classList.add('painting'); toolKind = MK() === 'sketch' ? 'pencil' : 'brush';
  toast(MK() === 'sketch' ? '选一支铅笔，在画纸上画吧' : '选一个颜色，在画纸上画吧');
}
function exitPaint(silent) {
  S.paint = false; document.body.classList.remove('painting'); $('paintbar').hidden = true; $('paintBtnText').textContent = '自己动手画一张';
  $('guide').hidden = true; $('view2d').classList.remove('painting');
  const c = mk(); ctx2(c).drawImage(out, 0, 0); rt.user = c;
  if (!silent) { octx.drawImage(ensureSnap(rt, S.step), 0, 0); markDirty(); toast('你的画已经收好，下次点“自己动手画”还能接着画'); }
}
function pushUndo() { undo.push(octx.getImageData(0, 0, W, H)); if (undo.length > 20) undo.shift(); }
let paperPat = null;
function paintSeg(x0, y0, x1, y1, pr, st) {
  const t = ptool, size = +$('bsize').value, d = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.ceil(d / 1.2));
  if (t.erase) {
    octx.save(); octx.fillStyle = MK() === 'sketch' ? (paperPat || (paperPat = octx.createPattern(S.paintPaper || rt.paper, 'no-repeat'))) : t.sw;
    const rad = MK() === 'sketch' ? 3 + size * 2.2 : 3 + size * 3;
    octx.globalAlpha = MK() === 'sketch' ? .18 : .9;
    for (let i = 0; i <= n; i += 2) { const u = i / n; octx.beginPath(); octx.arc(lerp(x0, x1, u), lerp(y0, y1, u), rad, 0, 7); octx.fill(); }
    octx.restore(); return;
  }
  if (MK() === 'sketch') {
    const w = t.w * (.6 + size * .25) * (.6 + pr * .8);
    octx.fillStyle = t.c;
    for (let i = 0; i <= n; i++) { const u = i / n, x = lerp(x0, x1, u), y = lerp(y0, y1, u), k = Math.ceil(w * 1.6);
      for (let j = 0; j < k; j++) { octx.globalAlpha = t.a * (.4 + Math.random() * .8); octx.fillRect(x + (Math.random() - .5) * w, y + (Math.random() - .5) * w, 1.3, 1.3); } }
    octx.globalAlpha = 1;
  } else if (MK() === 'oil') {
    // 油画：先落暗边，再铺颜料，压出猪鬃沟，最后在迎光的一侧勾一道亮边；刮刀更宽更平、更厚
    const kn = !!S.knife, w = (5 + size * 4) * (.7 + pr * .5) * (kn ? 1.7 : 1), base = hex(t.sw), dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
    let nx = -dy / L, ny = dx / L; if (nx * -.7 + ny * -.7 < 0) { nx = -nx; ny = -ny; }
    const h = kn ? 1 : .6, seg = (ox, oy, lw, col, a) => { octx.globalAlpha = a; octx.strokeStyle = col; octx.lineWidth = lw; octx.beginPath(); octx.moveTo(x0 + ox, y0 + oy); octx.lineTo(x1 + ox, y1 + oy); octx.stroke(); };
    octx.lineCap = kn ? 'butt' : 'round';
    seg(1.4 * h - nx * w * .12, 1.4 * h - ny * w * .12, w, rgb(base, .6), .4 * h);
    seg(0, 0, w, t.sw, .95);
    if (!kn) st.bristles.forEach(([o, k, lw]) => seg(nx * o * w, ny * o * w, w * lw, rgb(base, k < 1 ? .7 : 1.18), .4));
    seg(nx * w * .38, ny * w * .38, Math.max(1, w * .12), rgb(mixc(base, [255, 250, 235], .55)), .7 * h);
    octx.lineCap = 'round'; octx.globalAlpha = 1;
  } else {
    const w = (4 + size * 4) * (.7 + pr * .5), base = hex(t.sw), dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    octx.lineCap = 'round'; octx.globalAlpha = .92; octx.strokeStyle = t.sw; octx.lineWidth = w;
    octx.beginPath(); octx.moveTo(x0, y0); octx.lineTo(x1, y1); octx.stroke();
    st.bristles.forEach(([o, k, lw]) => { octx.globalAlpha = .35; octx.strokeStyle = rgb(base, k); octx.lineWidth = w * lw; octx.beginPath(); octx.moveTo(x0 + nx * o * w, y0 + ny * o * w); octx.lineTo(x1 + nx * o * w, y1 + ny * o * w); octx.stroke(); });
    octx.globalAlpha = 1;
  }
}
let pstroke = null;
function startStroke(x, y, pr) { pushUndo(); pstroke = { x, y, bristles: Array.from({ length: 5 }, () => [(Math.random() - .5) * .8, Math.random() < .5 ? 1.15 : .82, .06 + Math.random() * .1]) }; paintSeg(x, y, x + .1, y + .1, pr, pstroke); markDirty(); toolTip = [x, y]; toolLift = 0; }
function moveStroke(x, y, pr) { if (!pstroke) return; const l = Math.hypot(x - pstroke.x, y - pstroke.y); if (l > .5) toolDir = [(x - pstroke.x) / l, (y - pstroke.y) / l]; toolLift = 0; paintSeg(pstroke.x, pstroke.y, x, y, pr, pstroke); pstroke.x = x; pstroke.y = y; markDirty(); toolTip = [x, y]; }
function endStroke() { if (!pstroke) return; pstroke = null; toolLift = .8; const c = rt.user || mk(); ctx2(c).drawImage(out, 0, 0); rt.user = c; }
const pr = e => (e.pointerType === 'pen' && e.pressure) ? e.pressure : .6;
const v2pos = e => { const r = view2d.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H]; };
view2d.addEventListener('pointerdown', e => { if (!S.paint) return; view2d.setPointerCapture(e.pointerId); const [x, y] = v2pos(e); startStroke(x, y, pr(e)); });
view2d.addEventListener('pointermove', e => { if (!S.paint) return; const [x, y] = v2pos(e); if (pstroke) moveStroke(x, y, pr(e)); else { toolTip = [x, y]; toolLift = .8; } });
view2d.addEventListener('pointerup', endStroke); view2d.addEventListener('pointercancel', endStroke);
view2d.addEventListener('pointerleave', () => { if (!pstroke) toolTip = null; });
// 在 3D 画架上直接画
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function hitBoard(e) {
  const r = gl.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
  ray.setFromCamera(ndc, camera); const h = ray.intersectObject(board)[0];
  return h && h.face.materialIndex === 4 ? [h.uv.x * W, (1 - h.uv.y) * H] : null;
}
gl.addEventListener('pointerdown', e => { if (!S.paint || S.view !== 'room') return; const p = hitBoard(e); if (!p) return; controls.enabled = false; gl.setPointerCapture(e.pointerId); startStroke(p[0], p[1], pr(e)); }, true);
gl.addEventListener('pointermove', e => { if (!S.paint || S.view !== 'room') return; const p = hitBoard(e); if (pstroke && p) moveStroke(p[0], p[1], pr(e)); else if (!pstroke) { toolTip = p; toolLift = .8; } });
const endGl = () => { if (pstroke) endStroke(); controls.enabled = true; };
gl.addEventListener('pointerup', endGl); gl.addEventListener('pointercancel', endGl);
