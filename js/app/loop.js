'use strict';
// 渲染循环与启动

/* ================= 渲染循环 ================= */
function resize() {
  camOff = -1;
  const r = $('stage').getBoundingClientRect(); renderer.setSize(r.width, r.height, false); camera.aspect = r.width / Math.max(1, r.height); camera.updateProjectionMatrix();
  const rr = refCanvas.parentElement.getBoundingClientRect(); refR.setSize(rr.width, rr.height, false); refCam.aspect = rr.width / Math.max(1, rr.height); refCam.updateProjectionMatrix();
}
new ResizeObserver(resize).observe($('stage')); new ResizeObserver(resize).observe(refCanvas.parentElement);
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const tmpV = new THREE.Vector3(), Yup = V(0, 1, 0);
const TOOL_SVG = {
  pencil: () => `<svg viewBox="0 0 24 200" preserveAspectRatio="none"><path d="M4 12h16v8H4z" fill="#1e3a28"/><path d="M4 20h16v146H4z" fill="#2f5a3c"/><path d="M4 20h5v146H4z" fill="#447a55"/><path d="M15 20h5v146h-5z" fill="#234530"/><path d="M4 44h16v3H4z" fill="#d8b04a"/><path d="M4 166h16l-5 25h-6z" fill="#e6c79c"/><path d="M4 166h5l1 25h-1z" fill="#f2dcb8"/><path d="M9 191h6l-3 9z" fill="#2b2b2b"/></svg>`,
  brush: c => `<svg viewBox="0 0 24 260" preserveAspectRatio="none"><path d="M7 0h10l2 170H5z" fill="#a0522d"/><path d="M7 0h3l-1 170H5z" fill="#c27248"/><path d="M5 170h14v36H5z" fill="#c9c9c9"/><path d="M5 170h4v36H5z" fill="#ececec"/><path d="M5 206h14c1 20-3 36-7 54-4-18-8-34-7-54z" fill="#3a2a1e"/><path d="M6.5 236h11c-1 8-3 16-5.5 24-2.5-8-4.5-16-5.5-24z" fill="${c}"/></svg>`,
  knife: c => `<svg viewBox="0 0 30 200" preserveAspectRatio="none"><path d="M11 0h8l1 108H10z" fill="#7a4a2a"/><path d="M11 0h3l-1 108h-3z" fill="#9a6440"/><path d="M9 108h12v12H9z" fill="#b9bcc0"/><path d="M14 120h2l1 32h-2z" fill="#9aa0a6"/><path d="M15 150l11 22-11 28-11-28z" fill="#d6d9dd"/><path d="M15 150l-11 22 11 28z" fill="#eef0f2"/><path d="M11 186l4 14 4-14z" fill="${c}"/></svg>`,
  eraser: () => `<svg viewBox="0 0 40 30" preserveAspectRatio="none"><rect x="1" y="1" width="38" height="28" rx="7" fill="#9aa0a6"/><rect x="1" y="1" width="38" height="11" rx="6" fill="#b7bcc1"/></svg>`
};
const t2 = { x: 0, y: 0, lift: 1, a: 26, key: '' };
const BASE_ANGLE = { line: 24, shade: 52, brush: 30, eraser: 8, knife: 40 };
function updateTool2d() {
  const el = $('tool2d');
  if (S.view !== 'sheet' || !toolTip) { el.hidden = true; t2.key = ''; return; }
  const box = el.parentElement, bw = box.clientWidth, bh = box.clientHeight, kind = toolKind;
  const key = kind + (kind === 'brush' || kind === 'knife' ? toolColor : '');
  const len = kind === 'pencil' ? bh * .34 : kind === 'brush' ? bh * .42 : kind === 'knife' ? bh * .3 : bh * .06, wid = kind === 'eraser' ? len * 1.35 : len * (kind === 'brush' ? .1 : kind === 'knife' ? .16 : .12);
  const bd = el.querySelector('.bd'), sh = el.querySelector('.sh');
  if (t2.key !== key) {
    bd.innerHTML = TOOL_SVG[kind](toolColor); bd.style.width = wid + 'px'; bd.style.height = len + 'px';
    sh.style.width = wid * .8 + 'px'; sh.style.height = len * .9 + 'px';
    if (el.hidden) { t2.x = toolTip[0]; t2.y = toolTip[1]; }
    t2.key = key;
  }
  el.hidden = false;
  const px = t2.x, nx = lerp(t2.x, toolTip[0], .4), ny = lerp(t2.y, toolTip[1], .4);
  t2.x = nx; t2.y = ny; t2.lift = lerp(t2.lift, toolLift, .3);
  const target = (BASE_ANGLE[toolStyle] ?? 26) - clamp((nx - px) * .5, -16, 16) + toolDir[1] * 4;
  t2.a = lerp(t2.a, target, .2);
  const L = t2.lift, X = nx / W * bw, Y = ny / H * bh - L * bh * .018;
  el.style.transform = `translate(${X}px,${Y}px)`;
  bd.style.transform = `translateX(-50%) rotate(${t2.a}deg) scale(${1 + L * .06})`;
  sh.style.transform = `translate(calc(-50% + ${5 + L * 16}px),${4 + L * 12 + bh * .018 * L}px) rotate(${t2.a + 24}deg)`;
  sh.style.opacity = (.42 - L * .22).toFixed(2);
}
let frame = 0;
let camOff = -1;
function loop(now) {
  requestAnimationFrame(loop); frame++;
  tickAnim(now);
  if (camTween) { const t = ease(clamp((now - camTween.s) / camTween.d, 0, 1)); camera.position.lerpVectors(camTween.p0, camTween.p1, t); controls.target.lerpVectors(camTween.t0, camTween.t1, t); if (t >= 1) camTween = null; }
  controls.update();
  tickShowcase();
  { const pw = S.prep && innerWidth > 760 ? $('prep').getBoundingClientRect().width + 16 : 0;
    if (pw !== camOff) { camOff = pw; const w = gl.clientWidth, h = gl.clientHeight; if (pw) camera.setViewOffset(w, h, pw / 2, 0, w, h); else camera.clearViewOffset(); } }
  // 工具跟随笔尖
  if (S.paint) { toolKind = ptool && ptool.erase && MK() === 'sketch' ? 'eraser' : MK() === 'sketch' ? 'pencil' : MK() === 'oil' && S.knife ? 'knife' : 'brush';
    toolStyle = toolKind === 'pencil' ? (/[48]B/.test(ptool.id) ? 'shade' : 'line') : toolKind; if (ptool.sw) toolColor = ptool.sw; }
  const tk = toolTip ? toolKind : rt.def.idleTool, tool = TOOLS[tk];
  for (const k in TOOLS) if (k !== tk) { TOOLS[k].visible = false; TOOLS[k].userData.active = false; }
  const bq = board.getWorldQuaternion(new THREE.Quaternion()), bx = V(1, 0, 0).applyQuaternion(bq), by = V(0, 1, 0).applyQuaternion(bq), bn = V(0, 0, 1).applyQuaternion(bq);
  let back;
  if (toolTip) {
    // 立在纸上：笔尖贴纸，笔杆向外、向上、向右手方向倾斜，并略微拖在运笔方向后面
    toolTarget.pos.copy(boardPoint(toolTip[0] / W, toolTip[1] / H, .002 + toolLift * .035));
    const sd = bx.clone().multiplyScalar(toolDir[0]).addScaledVector(by, -toolDir[1]);
    back = bn.clone().multiplyScalar(LEAN[toolStyle] || .7).addScaledVector(Yup, .45).addScaledVector(bx, .35).addScaledVector(sd, -.25).normalize();
  } else {
    // 不画的时候搁在画架横档上
    toolTarget.pos.copy(easel.localToWorld(V(.1, .879, .085)));
    back = bx.clone();
  }
  toolTarget.q.setFromUnitVectors(Yup, back);
  if (!tool.userData.active) { tool.position.copy(toolTarget.pos); tool.quaternion.copy(toolTarget.q); }
  tool.userData.active = true; tool.visible = true;
  tool.position.lerp(toolTarget.pos, toolTip ? .32 : .12); tool.quaternion.slerp(toolTarget.q, toolTip ? .25 : .12);
  updateTool2d();
  // 作品画面同步
  if (dirty) { if (S.view === 'sheet') { v2.drawImage(out, 0, 0); dirty = false; } }
  renderer.render(scene, camera);
  if (frame % 2 === 0 || !REDUCED) refR.render(scene, refCam);
  // 标签
  if (S.view === 'room') {
    const w = gl.clientWidth, h = gl.clientHeight;
    for (const l of labels) {
      tmpV.copy(l.pos).project(camera);
      const vis = l.show && tmpV.z < 1 && Math.abs(tmpV.x) < 1.05 && Math.abs(tmpV.y) < 1.05;
      l.el.style.opacity = vis ? 1 : 0;
      if (vis) l.el.style.transform = `translate(${(tmpV.x * .5 + .5) * w}px,${(-tmpV.y * .5 + .5) * h}px) translate(-50%,-50%)`;
    }
  }
  const rw = refCanvas.clientWidth, rh = refCanvas.clientHeight;
  for (const el of $('refLabels').children) { const p = ANN_POS[el.dataset.a]; if (!p) continue; tmpV.copy(p).project(refCam); el.style.left = (tmpV.x * .5 + .5) * rw + 'px'; el.style.top = (-tmpV.y * .5 + .5) * rh + 'px'; }
}

let foldPref = null;
try { foldPref = localStorage.getItem('studio-folded'); } catch (e) {}
setFolded(foldPref ? foldPref === '1' : innerWidth > 760 && innerWidth < 1200);
// 有上次的进度就接着学，没有就从第一课开始
const resume = PROGRESS.last && DEFS[PROGRESS.last.key] ? PROGRESS.last : null;
swapPiece(resume ? resume.key : 'sketch');
setCam('overview', true);
resize();
if (resume) { goStep(resume.step, false); toast(`接着上次：${DEFS[resume.key].name} · 第 ${resume.step} 步`); }
else if (prepState('sketch').seen) goStep(1, true); else openPrep();
requestAnimationFrame(loop);
