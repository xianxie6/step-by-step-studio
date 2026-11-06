'use strict';
// 按钮与键盘事件

/* ================= 事件 ================= */
$('mediumSeg').addEventListener('click', e => { const b = e.target.closest('[data-mk]'); if (!b || b.dataset.mk === MK()) return; openLesson(LAST[b.dataset.mk] || COURSES[b.dataset.mk][0]); });
$('lessons').addEventListener('click', e => { const b = e.target.closest('[data-key]'); if (b && b.dataset.key !== S.piece) openLesson(b.dataset.key); });
$('viewSeg').addEventListener('click', e => { const b = e.target.closest('[data-view]'); if (b) setView(b.dataset.view); });
$('prev').onclick = () => { setPlaying(false); goStep(S.step - 1, true); };
$('next').onclick = () => { setPlaying(false); goStep(S.step + 1, true); };
$('play').onclick = () => setPlaying(!S.playing);
$('foldBtn').onclick = () => setFolded(!document.body.classList.contains('folded'), true);
$('slider').addEventListener('input', e => { setPlaying(false); goStep(+e.target.value, false); });
$('ticks').addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) { setPlaying(false); goStep(+b.dataset.k, true); } });
$('orbit').onclick = () => { controls.autoRotate = !controls.autoRotate; $('orbit').setAttribute('aria-pressed', controls.autoRotate); };
$('resetCam').onclick = () => setCam(rt.def.steps[S.step].cam);
$('helpBtn').onclick = () => { $('help').hidden = false; $('helpClose').focus(); };
$('helpClose').onclick = () => { $('help').hidden = true; };
$('help').addEventListener('click', e => { if (e.target.id === 'help') $('help').hidden = true; });
$('paintBtn').onclick = () => S.paint ? exitPaint() : enterPaint();
$('exitPaint').onclick = () => exitPaint();
$('undoBtn').onclick = () => { const d = undo.pop(); if (d) { octx.putImageData(d, 0, 0); markDirty(); const c = rt.user || mk(); ctx2(c).drawImage(out, 0, 0); rt.user = c; } else toast('没有可以撤销的笔画了'); };
$('newBtn').onclick = () => { pushUndo(); S.paintPaper = rt.userPaper = chosenPaper(); octx.drawImage(S.paintPaper, 0, 0); paperPat = null; markDirty(); toast('换好新纸了，用的是你在准备页选的纸'); };
$('guideBtn').onclick = () => { S.guide = !S.guide; $('guideBtn').setAttribute('aria-pressed', S.guide); $('guide').hidden = !S.guide; $('guideBtn').style.borderColor = S.guide ? 'var(--accent)' : ''; };
addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || !$('help').hidden) { if (e.key === 'Escape') $('help').hidden = true; return; }
  if (e.key === 'ArrowRight') { setPlaying(false); goStep(S.step + 1, true); }
  else if (e.key === 'ArrowLeft') { setPlaying(false); goStep(S.step - 1, true); }
  else if (e.key === ' ' && e.target.tagName !== 'BUTTON') { e.preventDefault(); setPlaying(!S.playing); }
  else if ((e.key === 'f' || e.key === 'F') && !e.metaKey && !e.ctrlKey && innerWidth > 760) setFolded(!document.body.classList.contains('folded'), true);
});
