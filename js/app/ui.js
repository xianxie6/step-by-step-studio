'use strict';
// 状态与界面：换课、换步骤、播放

/* ================= 状态与界面 ================= */
const S = { piece: 'sketch', step: 1, playing: false, view: 'room', paint: false, guide: false };
let rt = runtime('sketch'), anim = null, playTimer = 0, lastGain = new Set();

const MK = () => rt.def.mk, LAST = {}, KIND_TXT = { still: '静物', land: '风景', head: '头像' };
// 学习进度：上次停在哪节课哪一步、每节课最远学到第几步、每个画种上次开的是哪节课
let PROGRESS = {};
try { PROGRESS = JSON.parse(localStorage.getItem('studio-progress') || '{}'); } catch (e) {}
PROGRESS.best = PROGRESS.best || {}; Object.assign(LAST, PROGRESS.lastByMk);
const saveProgress = () => { PROGRESS.lastByMk = LAST; try { localStorage.setItem('studio-progress', JSON.stringify(PROGRESS)); } catch (e) {} };
function recordStep(key, k) {
  PROGRESS.last = { key, step: k };
  const better = k > (PROGRESS.best[key] || 0);
  if (better) PROGRESS.best[key] = k;
  saveProgress();
  if (better && k === DEFS[key].steps.length - 1) renderCourseUI();
}
// 收起面板：窗口窄的时候默认收起，之后按用户上次的选择
function setFolded(on, save) {
  document.body.classList.toggle('folded', on);
  const b = $('foldBtn'), t = on ? '展开面板' : '收起面板'; b.setAttribute('aria-pressed', on); b.setAttribute('aria-label', t); b.title = `${t}（F）`;
  if (save) try { localStorage.setItem('studio-folded', on ? '1' : '0'); } catch (e) {}
}
function swapPiece(key) {
  const prev = S.piece; S.piece = key; LAST[DEFS[key].mk] = key;
  // 只留当前和上一节课的画稿，其他的释放掉
  for (const k in RT) if (k !== key && k !== prev) delete RT[k];
  rt = runtime(key);
  const def = rt.def;
  sphere.visible = key === 'sketch'; apple.visible = key === 'gouache'; oilGroup.visible = key === 'oil';
  for (const k in LESSON_GROUPS) LESSON_GROUPS[k].visible = false;
  if (def.spec) (LESSON_GROUPS[key] || (LESSON_GROUPS[key] = buildLessonGroup(def))).visible = true;
  backdropM.color.set(def.backdrop); clothM.color.set(def.cloth);
  // 油画的画面有厚度：用画面本身做凹凸贴图，亮的厚涂处会鼓起来、在灯下发亮
  artMat.bumpMap = def.mk === 'oil' ? artTex : null; artMat.bumpScale = 2.5; artMat.roughness = def.mk === 'oil' ? .5 : .95; artMat.needsUpdate = true;
  const tgt = def.kind === 'land' ? [.2, 1.2, -1.42] : def.spec ? def.spec.frame.target : [.2, 1.03, -1.2];
  refCam.fov = def.kind === 'land' ? 30 : def.spec ? Math.min(30, def.spec.frame.fov + 7) : 30; refCam.lookAt(tgt[0], tgt[1], tgt[2]); refCam.updateProjectionMatrix();
  S.knife = false;
  tubes.visible = def.mk !== 'sketch'; oilBottle.visible = def.mk === 'oil';
  scene.updateMatrixWorld(true);
  buildAnnotations(key); buildLabels(key);
  renderCourseUI();
  $('pieceTitle').textContent = def.name; $('pieceSub').textContent = `${def.level} · ${def.sub}`;
  $('stK2').textContent = rt.def.counter.label; $('st2N').textContent = rt.def.counter.items.length;
  const N = rt.def.steps.length - 1; $('stStepN').textContent = N; $('slider').max = N;
  $('ticks').innerHTML = rt.def.steps.map((_, i) => `<button type="button" data-k="${i}" aria-label="第 ${i} 步">${i}</button>`).join('');
  buildPaintTools();
  if (S.paint) exitPaint(true);
  lastGain = new Set();
  idleBake();
}

function renderCourseUI() {
  const m = MK();
  document.querySelectorAll('#mediumSeg [data-mk]').forEach(b => b.setAttribute('aria-pressed', b.dataset.mk === m));
  $('lessons').innerHTML = COURSES[m].map((k, n) => { const d = DEFS[k], N = d.steps.length - 1, b = PROGRESS.best[k] || 0, done = b >= N; return `<button type="button" class="lesson${done ? ' done' : ''}" data-key="${k}" aria-pressed="${k === S.piece}" style="--p:${done ? 0 : b / N}" title="${done ? '已学完' : b ? `学到第 ${b} 步，共 ${N} 步` : '还没开始'}"><span class="ln">${done ? '✓' : n + 1}</span><span class="lname">${d.name}</span><span class="lv" data-lv="${d.level}">${d.level} · ${KIND_TXT[d.kind]}</span></button>`; }).join('');
}
function openLesson(key) {
  setPlaying(false);
  const d = DEFS[key], fresh = !RT[key];
  if (fresh) toast(d.kind === 'land' ? '正在准备风景照片…' : d.kind === 'head' ? '正在摆放头像…' : '正在摆放静物…');
  setTimeout(() => { swapPiece(key); if (S.prep || !prepState(d.mk).seen) openPrep(); else goStep(1, true); }, fresh ? 60 : 0);
}
function gainsUpTo(k) { const g = new Set(); for (let i = 0; i <= k; i++) for (const x of rt.def.steps[i].gain || []) g.add(x); return g; }
function updateUI() {
  const def = rt.def, k = S.step, st = def.steps[k], N = def.steps.length - 1;
  $('stStep').textContent = k;
  const g = gainsUpTo(k); $('st2').textContent = g.size;
  $('stepEyebrow').textContent = k === 0 ? `开画之前 · ${st.title}` : `第 ${k} 步 · ${st.title}`;
  $('stepText').innerHTML = st.text + (k === 0 ? '<div class="step-prep"><button class="pbtn done" type="button" data-prep>打开画材清单</button></div>' : ''); $('stepTip').innerHTML = st.tip;
  $('navTitle').textContent = st.title; $('navSub').textContent = `第 ${k} 步，共 ${N} 步 · ${st.tool}`;
  $('slider').value = k; $('refTitle').textContent = st.ref;
  [...$('ticks').children].forEach((b, i) => { b.className = i === k ? 'cur' : i < k ? 'done' : ''; });
  $('chips').innerHTML = def.counter.items.map(([n, c]) => `<span class="chip${g.has(n) ? ' got' : ''}${g.has(n) && !lastGain.has(n) ? ' new' : ''}"><i style="background:${c}"></i>${n}</span>`).join('');
  lastGain = g;
  if (MK() === 'gouache') blobs.forEach((b, i) => { b.visible = g.has((def.counter.items[i] || [])[0]); });
  else blobs.forEach(b => { b.visible = MK() === 'oil' && k > 0; });
  for (const key in annGroup) annGroup[key].visible = false;
  for (const a of st.ann) if (annGroup[a]) annGroup[a].visible = true;
  $('refLabels').innerHTML = st.ann.map(a => `<span class="ann${ALT.has(a) ? ' alt' : ''}" data-a="${a}">${ANN_TEXT[a]}</span>`).join('');
  for (const l of labels) { const on = st.focus.includes(l.id); l.el.classList.toggle('on', on); l.show = on || ['subject', 'lamp', 'easel'].includes(l.id); }
  updateStrokeCount();
}
let strokesBefore = 0, strokesNow = 0;
function updateStrokeCount() { $('st3').textContent = (strokesBefore + strokesNow).toLocaleString('zh-CN'); }

function goStep(k, animate) {
  if (S.prep && k !== 0) { S.prep = false; $('prep').hidden = true; document.body.classList.remove('prepping'); $('prepBtn').setAttribute('aria-pressed', 'false'); }
  const N = rt.def.steps.length - 1; k = clamp(k, 0, N);
  if (S.paint) exitPaint(true);
  S.step = k; clearTimeout(playTimer); recordStep(S.piece, k);
  strokesBefore = 0; for (let i = 1; i < k; i++) strokesBefore += strokesIn(rt, i);
  const passes = passesOf(rt, k), total = passes.reduce((s, p) => s + p.strokes.length, 0);
  if (!animate || !total || REDUCED) {
    octx.drawImage(ensureSnap(rt, k), 0, 0); anim = null; strokesNow = total; markDirty(); toolTip = null;
    if (S.playing) schedNext(900);
  } else {
    sbctx.drawImage(ensureSnap(rt, k - 1), 0, 0); lctx.clearRect(0, 0, W, H);
    octx.drawImage(stepBase, 0, 0); markDirty();
    anim = { passes, total, pi: 0, si: 0, drawn: 0, start: performance.now(), dur: clamp(1500 + total * 2.4, 2000, 5600) };
    strokesNow = 0;
  }
  setCam(rt.def.steps[k].cam);
  updateUI();
}
function tickAnim(now) {
  if (!anim) return;
  const p = clamp((now - anim.start) / anim.dur, 0, 1), target = Math.floor((1 - Math.pow(1 - p, 1.4)) * anim.total);
  let changed = false;
  while (anim.drawn < target && anim.pi < anim.passes.length) {
    const pass = anim.passes[anim.pi], s = pass.strokes[anim.si];
    drawStroke(lctx, s); anim.drawn++; anim.si++; changed = true;
    if (anim.si >= pass.strokes.length) { compositePass(sbctx, pass, layer, tmp, rt.paper); lctx.clearRect(0, 0, W, H); anim.pi++; anim.si = 0; }
  }
  if (anim.pi < anim.passes.length) {
    const pass = anim.passes[anim.pi], s = pass.strokes[anim.si];
    if (s) {
      const frac = clamp((1 - Math.pow(1 - p, 1.4)) * anim.total - anim.drawn, 0, 1), [x, y, dx, dy] = pointOn(s, frac);
      const rate = anim.total / anim.dur * 1000;
      toolKind = pass.tool || 'pencil'; toolStyle = toolKind === 'pencil' ? (pass.mask ? 'shade' : 'line') : toolKind;
      toolTip = [x, y]; toolDir = [dx, dy]; if (s.c && toolKind !== 'pencil') toolColor = s.c;
      toolLift = (1 - sm(0, .15, frac) * sm(1, .85, frac)) * clamp(9 / rate, .12, 1);
    }
  }
  if (changed) {
    octx.drawImage(stepBase, 0, 0);
    if (anim.pi < anim.passes.length && anim.si > 0) compositePass(octx, anim.passes[anim.pi], layer, tmp, rt.paper);
    strokesNow = anim.drawn; updateStrokeCount(); markDirty();
  }
  if (p >= 1) {
    if (!rt.snaps[S.step]) { const c = mk(); ctx2(c).drawImage(stepBase, 0, 0); rt.snaps[S.step] = c; }
    octx.drawImage(rt.snaps[S.step], 0, 0); markDirty();
    anim = null; toolTip = null; strokesNow = strokesIn(rt, S.step); updateStrokeCount();
    if (S.playing) schedNext(1100);
  }
}
function schedNext(ms) {
  clearTimeout(playTimer);
  playTimer = setTimeout(() => { if (!S.playing) return; const N = rt.def.steps.length - 1; if (S.step >= N) { setPlaying(false); return; } goStep(S.step + 1, true); }, ms);
}
function setPlaying(on) {
  S.playing = on;
  $('playIcon').innerHTML = on ? '<path d="M8 5v14M16 5v14"/>' : '<path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/>';
  $('play').setAttribute('aria-label', on ? '暂停' : '自动播放');
  if (on) { const N = rt.def.steps.length - 1; if (S.step >= N) goStep(0, true); else if (!anim) goStep(S.step + 1, true); }
  else clearTimeout(playTimer);
}
let bakeTimer = 0;
// 空闲时在后台把当前课程一步一步预先画好；正在播放或正在画时先让路
function idleBake() {
  clearTimeout(bakeTimer);
  const tick = () => {
    if (anim || pstroke || S.playing) { bakeTimer = setTimeout(tick, 500); return; }
    const r = rt;
    if (r.snaps.length < r.def.steps.length) { ensureSnap(r, r.snaps.length); bakeTimer = setTimeout(tick, 120); }
  };
  bakeTimer = setTimeout(tick, 700);
}

function setView(v) {
  if (v === 'sheet' && S.prep) closePrep(false);
  S.view = v; $('vRoom').setAttribute('aria-pressed', v === 'room'); $('vSheet').setAttribute('aria-pressed', v === 'sheet');
  $('sheet').hidden = v !== 'sheet'; $('labels').hidden = v !== 'room'; dirty = true;
}
