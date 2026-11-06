'use strict';
// 每节课的画稿缓存与逐步烘焙

const RT = {};
function runtime(key) {
  if (RT[key]) return RT[key];
  const def = DEFS[key], paper = makePaper(def.paper, { sketch: 11, gouache: 23, oil: 37 }[key] ?? strHash(key) % 997, def.weave);
  const s0 = mk(); ctx2(s0).drawImage(paper, 0, 0);
  return (RT[key] = { def, paper, snaps: [s0], passes: [], user: null });
}
function passesOf(rt, k) {
  if (!rt.passes[k]) { const st = rt.def.steps[k]; rt.passes[k] = st.build ? st.build(rngOf(1000 + k * 97 + ({ sketch: 0, gouache: 5, oil: 9 }[rt.def.key] ?? strHash(rt.def.key) % 89))) : []; }
  return rt.passes[k];
}
const strokesIn = (rt, k) => passesOf(rt, k).reduce((s, p) => s + p.strokes.length, 0);
const L2 = mk(), T2 = mk();
function bakePass(c, pass, paper) { const l = ctx2(L2); l.clearRect(0, 0, W, H); for (const s of pass.strokes) drawStroke(l, s); compositePass(c, pass, L2, T2, paper); }
function ensureSnap(rt, k) {
  for (let i = 1; i <= k; i++) if (!rt.snaps[i]) {
    const c = mk(), x = ctx2(c); x.drawImage(rt.snaps[i - 1], 0, 0);
    for (const p of passesOf(rt, i)) bakePass(x, p, rt.paper);
    rt.snaps[i] = c;
  }
  return rt.snaps[k];
}

const out = mk(), octx = ctx2(out);
const layer = mk(), lctx = ctx2(layer), tmp = mk(), stepBase = mk(), sbctx = ctx2(stepBase);
const view2d = $('view2d'), v2 = ctx2(view2d);
let dirty = true;
function markDirty() { dirty = true; if (artTex) artTex.needsUpdate = true; }
