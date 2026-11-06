'use strict';
// 开画之前：准备画材

/* ================= 开画之前：准备画材 =================
   学 Bygga 的“工具 → 零件 → 开始组装”：每个画种先列出必备和“有更好”的画材，
   点开卡片看用途、没有怎么办，还能选规格；选的纸和笔会带进“自己动手画” */
const ICON = {
  pencils: '<path d="M8 38l3-10 18-18 7 7-18 18z"/><path d="M11 28l7 7"/><path d="M16 42l3-10 18-18 7 7-18 18z" opacity=".55"/><path d="M8 38l-1 4 4-1"/>',
  paper: '<path d="M12 6h17l8 8v28H12z"/><path d="M29 6v8h8"/><path d="M17 21h14M17 27h14M17 33h9"/>',
  eraser: '<path d="M11 31c-4-6 2-14 10-12 4-6 14-5 15 3 6 2 6 10 0 12-3 5-11 6-15 2-5 2-9-1-10-5z"/><path d="M18 27c2 2 5 2 7 0" opacity=".6"/>',
  cutter: '<path d="M5 31l19-11h17v9H22z"/><path d="M33 20l7-7M27 25h10"/>',
  board: '<rect x="8" y="11" width="32" height="31" rx="2"/><rect x="17" y="6" width="14" height="8" rx="2"/><path d="M14 20h20" opacity=".5"/>',
  stump: '<path d="M12 37l19-19 5 5-19 19-7 2z"/><path d="M27 14l7 7M10 44l2-7"/>',
  spray: '<rect x="15" y="17" width="16" height="25" rx="3"/><path d="M19 17v-5h8v5M27 9h4"/><path d="M34 6l3-2M34 9h4M34 12l3 2"/>',
  easel: '<rect x="12" y="8" width="24" height="18" rx="1"/><path d="M24 4v4M15 44l9-18 9 18M18 37h12"/>',
  sand: '<rect x="9" y="14" width="30" height="20" rx="2"/><path d="M13 20h22M13 25h22M13 30h22" stroke-dasharray="1.5 3"/>',
  tube: '<path d="M18 9h12v3l4 4v22l-3 5H17l-3-5V16l4-4z"/><path d="M20 4h8v5h-8z"/><path d="M14 27h20"/>',
  brushes: '<path d="M14 4h4v18h-4zM13 22h6v5h-6zM13 27h6l1 13h-8z"/><path d="M30 4h4v20h-4zM29 24h6v4h-6zM29 28h6l-3 14z" opacity=".6"/>',
  palette: '<path d="M24 6C12 6 5 14 6 24c1 10 10 17 20 16 4 0 4-4 2-6s-1-6 3-6h5c6 0 8-4 7-9-2-8-10-13-19-13z"/><circle cx="16" cy="18" r="2.5"/><circle cx="25" cy="13" r="2.5"/><circle cx="33" cy="18" r="2.5"/><circle cx="14" cy="28" r="2.5"/>',
  bucket: '<path d="M7 16h15l-2 24H9zM26 16h15l-2 24H28z"/><path d="M9 23h11M28 23h11"/>',
  sponge: '<rect x="8" y="16" width="32" height="18" rx="5"/><circle cx="16" cy="23" r="1.6"/><circle cx="26" cy="27" r="1.6"/><circle cx="33" cy="22" r="1.6"/><circle cx="20" cy="29" r="1.2"/>',
  mister: '<path d="M18 21h12v19a2 2 0 01-2 2h-8a2 2 0 01-2-2z"/><path d="M20 21v-6h8v6M22 15v-5h10l4 3"/>',
  liner: '<path d="M23 4h2v25h-2z"/><path d="M22 29h4l-2 15z"/>',
  canvas: '<rect x="8" y="8" width="32" height="32"/><path d="M14 14h20v20H14zM8 8l6 6M40 8l-6 6M8 40l6-6M40 40l-6-6"/>',
  can: '<path d="M14 13h20v29H14z"/><path d="M18 13V7h8v6M14 23h20"/>',
  dropper: '<path d="M17 19h14v21a2 2 0 01-2 2H19a2 2 0 01-2-2z"/><path d="M20 19v-4h8v4M22 15V6h4v9"/><path d="M17 29h14" opacity=".5"/>',
  pknife: '<path d="M8 41l5-5M13 36l6-8"/><path d="M19 28c3-9 11-17 21-20-2 9-11 17-21 20z"/>',
  jar: '<path d="M14 11h20v5l-2 4v20H16V20l-2-4z"/><path d="M16 27h16M19 33h10" opacity=".6"/>',
  rag: '<path d="M8 17c6-4 12 4 18 0s10-4 14 0v21c-4-4-8-4-14 0s-12-4-18 0z"/>',
  gloves: '<path d="M16 42V22l-4-6 2-2 4 4V8h3v12h1V6h3v14h1V8h3v12h1v-8h3v18c0 6-4 12-10 12z"/>',
  photo: '<rect x="8" y="10" width="32" height="28" rx="2"/><path d="M8 32l9-9 7 7 5-5 11 11"/><circle cx="31" cy="18" r="3"/>'
};
const PREP = {
  sketch: {
    size: '8 开素描纸', before: { still: ['静物摆在离你 2–3 米的地方，眼睛平视或略高于静物。', '台灯放在左上方，光只从一个方向来。', '画板正对着你，和视线大约垂直，纸夹平。'], land: ['把参考照片放在画板旁边，和画面差不多大最好。', '先眯起眼睛看照片，分清天空、远景、中景、近景。', '画板正对着你，纸夹平。'], head: ['石膏像放在离你 2–3 米的地方，用一盏灯从侧上方照亮。', '先绕着走一圈，选一个四分之三侧面的角度。', '画板正对着你，纸夹平。'] },
    must: [
      { id: 'pencils', icon: 'pencils', name: '素描铅笔', spec: '2H 到 8B，软硬都要有', label: 'pencils', use: 'H 前的数字越大，笔芯越硬越浅；B 前的数字越大，越软越黑。排线用 HB–2B，暗部用 4B–8B。', alt: '只有一支 HB？用力轻重也能分出深浅，暗部多叠几层就行。', opts: ['6 支基础套', '12 支全套', '加一支炭笔'] },
      { id: 'paper', icon: 'paper', name: '素描纸', spec: '8 开，160g 以上，有纹理', label: 'easel', use: '纸面的纹理能“咬住”铅笔粉，排线才有颗粒感。8 开适合练习，4 开适合完整作业。', alt: '复印纸太滑，排线容易发亮。没有素描纸，可以用厚一点的水彩纸背面。', opts: ['白色素描纸', '米黄素描纸', '灰卡纸'], paper: ['#f3f0e8', '#efe4cc', '#c9c6bf'] },
      { id: 'eraser', icon: 'eraser', name: '可塑橡皮', spec: '能捏、能压、能擦', label: 'eraser', use: '捏尖了提高光、擦反光，压平了能整片减淡，不伤纸面。', alt: '普通橡皮会擦伤纸面，只适合擦错；要提亮，还是可塑橡皮好用。' },
      { id: 'cutter', icon: 'cutter', name: '美工刀', spec: '削出 1.5 厘米长的笔芯', label: 'knife', use: '用刀削出长长的笔芯，侧锋才能铺大面积的调子，笔尖用来刻细节。', alt: '卷笔刀削出的笔芯太短，侧锋铺不了大面，最好还是用刀削。' },
      { id: 'board', icon: 'board', name: '画板和夹子', spec: '4 开画板，两个长尾夹', label: 'easel', use: '把纸夹平、立起来，眼睛才能同时看到静物和画面，比例不容易画歪。', alt: '没有画板？用一块硬纸板垫着，四个角贴上胶带。' }
    ],
    nice: [
      { id: 'stump', icon: 'stump', name: '纸笔', spec: '揉出细腻过渡', use: '在灰面上轻轻揉，过渡更柔和，适合画石膏和皮肤。', alt: '纸巾卷成尖头也能用。别用手指揉，手上的油会把纸弄脏。' },
      { id: 'spray', icon: 'spray', name: '定画液', spec: '画完喷一层', use: '把铅笔粉固定在纸上，画放久了、叠在一起也不会蹭花。', alt: '没有定画液，用发胶离远一点喷，效果差不多。' },
      { id: 'easel', icon: 'easel', name: '画架', spec: '让画板立起来', label: 'easel', use: '画板立着，站远就能看整体，这是美术生的标配。', alt: '把画板靠在椅背上，也能立起来。' },
      { id: 'sand', icon: 'sand', name: '砂纸板', spec: '把笔尖磨成斜面', use: '笔尖磨成斜面，侧锋排线更快更均匀。', alt: '一张细砂纸贴在硬纸板上，就是一块砂纸板。' }
    ]
  },
  gouache: {
    size: '8 开水粉纸', before: { still: ['静物摆在离你 2–3 米的地方，台灯放在左上方。', '颜料挤在调色盒边上，按冷暖排好，中间留出调色的地方。', '洗笔桶装好清水，一格洗笔，一格调色。'], land: ['把参考照片放在画板旁边。', '颜料按冷暖挤好，天空要用的蓝和白多挤一点。', '洗笔桶装好清水，一格洗笔，一格调色。'], head: ['模特或头像放在离你 2–3 米的地方，单一光源从侧上方照。', '肤色要用的土黄、朱红、钛白多挤一点。', '洗笔桶装好清水，一格洗笔，一格调色。'] },
    must: [
      { id: 'paints', icon: 'tube', name: '水粉颜料', spec: '12 色起步，钛白买大罐', label: 'tubes', use: '水粉是不透明的，浅色能盖住深色。钛白的用量是其他颜色的好几倍。', alt: '只有几种颜色？熟褐、群青、柠檬黄、朱红、钛白，这 5 个能调出大部分颜色。', opts: ['12 色', '24 色', '罐装'] },
      { id: 'brushes', icon: 'brushes', name: '水粉笔', spec: '大中小号平头笔各一支', label: 'brushes', use: '大号铺背景，中号画物体，小号刻画细节。平头笔的笔触方方正正，最有水粉味。', alt: '没有大号笔？铺背景可以用 1 寸宽的油漆刷。', opts: ['尼龙笔', '狼毫混合笔'] },
      { id: 'palette', icon: 'palette', name: '调色盒', spec: '带格子，能盖上保湿', label: 'palette', use: '格子里放颜料，盖上盖子能保湿好几天；盖子背面就是调色的地方。', alt: '一次性白色纸盘也可以。一定要白色的，才看得准颜色。' },
      { id: 'paper', icon: 'paper', name: '水粉纸', spec: '8 开，吸水、不起毛', label: 'easel', use: '水粉纸厚、吸水，颜料一层层叠上去也不会起皱、起毛。', alt: '素描纸太薄，水一多就会起皱，最好别用。', opts: ['水粉纸', '白卡纸', '浅灰色卡纸'], paper: ['#efe8da', '#f7f5f0', '#cfccc4'] },
      { id: 'bucket', icon: 'bucket', name: '洗笔桶', spec: '两格的最好', label: 'bucket', use: '一格洗笔，一格放干净的水用来调色，颜色才不会脏。', alt: '两个塑料杯就行。' }
    ],
    nice: [
      { id: 'sponge', icon: 'sponge', name: '吸水海绵', spec: '控制笔上的水分', use: '洗完笔在海绵上一按，笔上的水量就刚刚好，颜色不会太稀。', alt: '叠起来的厚纸巾也可以。' },
      { id: 'mister', icon: 'mister', name: '小喷壶', spec: '让颜料保持湿润', use: '调色盒里的颜料干了，喷一点水就能接着用。', alt: '用笔蘸水滴在颜料上。' },
      { id: 'liner', icon: 'liner', name: '勾线笔', spec: '画高光和细节', use: '高光、果柄、瓶口这类小地方，用勾线笔点。', alt: '小号平头笔的笔尖侧过来，也能画细线。' },
      { id: 'board', icon: 'board', name: '画板和夹子', spec: '4 开画板', label: 'easel', use: '纸夹平立起来，颜色干了也不容易卷边。', alt: '用胶带把纸四边贴在硬纸板上。' }
    ]
  },
  oil: {
    size: '40 × 50 cm 画布', before: { still: ['静物摆在离你 2–3 米的地方，台灯放在左上方。', '颜料按冷暖挤在调色板边上，钛白挤得最多。', '打开窗户通风，松节油的气味比较大。'], land: ['把参考照片放在画架旁边。', '颜料按冷暖挤在调色板边上，天空和麦田要用的颜色多挤一点。', '打开窗户通风，松节油的气味比较大。'], head: ['模特坐在侧光里，光从侧上方来。', '肤色要用的土黄、朱红、钛白多挤一点。', '打开窗户通风，松节油的气味比较大。'] },
    must: [
      { id: 'paints', icon: 'tube', name: '油画颜料', spec: '12 色套装，钛白单买大管', label: 'tubes', use: '油画颜料干得慢，可以在画布上反复调和、堆厚。钛白的用量是其他颜色的好几倍。', alt: '入门套装够用；之后哪个颜色用完，再单独补那一支。', opts: ['12 色套装', '18 色套装'] },
      { id: 'brushes', icon: 'brushes', name: '猪鬃笔', spec: '平头、榛形、圆头，4–10 号', label: 'brushes', use: '猪鬃硬，能推得动浓稠的颜料，还会留下笔痕，这就是油画的笔触。', alt: '尼龙笔偏软，适合薄涂和细节；厚涂还是猪鬃好用。', opts: ['猪鬃笔', '尼龙笔'] },
      { id: 'canvas', icon: 'canvas', name: '画布', spec: '40 × 50 cm，已经刷好底', label: 'easel', use: '画布已经刷好底料，颜料不会渗进布里。亚麻布纹理细，棉布便宜，适合练习。', alt: '没有画布？油画纸，或者刷过两层石膏底的硬纸板，也能画。', opts: ['亚麻画布', '棉布画布', '油画板'], paper: ['#d8c9ab', '#ece6d8', '#e8e2d4'], weave: [true, true, false] },
      { id: 'palette', icon: 'palette', name: '调色板', spec: '木质或一次性调色纸', label: 'palette', use: '颜料沿着边挤一圈，中间调色。', alt: '玻璃板下面垫一张灰纸，是很好用的调色板。', opts: ['木调色板', '调色纸'] },
      { id: 'pknife', icon: 'pknife', name: '刮刀', spec: '菱形刀头', label: 'knife', use: '调色、厚涂高光、刮掉画错的地方，都靠它。', alt: '没有刮刀，就只能用笔厚涂，效果会温和一些。' },
      { id: 'turps', icon: 'can', name: '松节油', spec: '稀释颜料、洗笔', label: 'bottle', use: '第一层薄涂要用松节油把颜料调稀；画完用它洗笔。', alt: '怕气味，就用无味稀释剂。不管用哪种，都要开窗通风。' },
      { id: 'medium', icon: 'dropper', name: '调色油', spec: '亚麻仁油或调色油', label: 'bottle', use: '让颜料更顺滑、更有光泽。越往上层加得越多，叫“肥盖瘦”，画干了才不会开裂。', alt: '纯亚麻仁油也可以，只是干得慢一点。' }
    ],
    nice: [
      { id: 'jar', icon: 'jar', name: '洗笔罐', spec: '带滤网和盖子', use: '颜料渣会沉到底下，上面的松节油能反复用。', alt: '带盖的玻璃罐也行。' },
      { id: 'rag', icon: 'rag', name: '棉布抹布', spec: '擦笔、擦画面', use: '洗完笔擦干，画错的地方也能直接擦掉。', alt: '旧 T 恤剪成小块。' },
      { id: 'easel', icon: 'easel', name: '画架', spec: '让画布立起来', label: 'easel', use: '画布立着，退后几步就能看整体。', alt: '把画布靠在墙上或椅背上。' },
      { id: 'gloves', icon: 'gloves', name: '一次性手套', spec: '保护双手', use: '有些颜料含有重金属，最好别直接沾手。', alt: '画完马上用肥皂洗手。' }
    ]
  }
};
const LEVEL_TIME = { 入门: '约 1 小时', 基础: '约 2 小时', 进阶: '约 3 小时', 挑战: '约 4 小时' };
let PREPSEL = {};
try { PREPSEL = JSON.parse(localStorage.getItem('studio-prep') || '{}'); } catch (e) {}
const prepState = mk => (PREPSEL[mk] = PREPSEL[mk] || { have: {}, opt: {}, seen: false });
const savePrep = () => { try { localStorage.setItem('studio-prep', JSON.stringify(PREPSEL)); } catch (e) {} };
let prepOpenId = null;
const prepIcon = k => `<svg viewBox="0 0 48 48" aria-hidden="true">${ICON[k]}</svg>`;
/* 画材模型：同一套模型既渲染成卡片上的图，也在画室里“立起来”展示。单位是米，底部在 y = 0，都是立着的样子 */
const PIG = ['#f4ede0', '#f2d23c', '#e8902a', '#e0482a', '#8e1c1a', '#c8306a', '#2f3f8f', '#5aa0d8', '#3f8a4a', '#6f7a4a', '#9a5a2a', '#5a3a26', '#1f1c1a'];
function pp(g, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = true; m.receiveShadow = true; g.add(m); return m; }
const SILVER = () => std('#d6d8dc', { metalness: .8, roughness: .28 });
// 一支笔：原点在笔杆底端，笔头朝上
function brushProp(len, w, hair, handle, kind = 'flat') {
  const g = new THREE.Group(), hl = len * .66;
  pp(g, new THREE.CylinderGeometry(.0042, .0055, hl, 12), std(handle, { roughness: .35 }), 0, hl / 2);
  if (kind === 'flat') {
    pp(g, new THREE.BoxGeometry(w * .95, .026, .006), SILVER(), 0, hl + .013);
    const b = pp(g, new THREE.BoxGeometry(w, len * .1, .006), std(hair, { roughness: .9 }), 0, hl + .026 + len * .05); b.scale.z = .9;
  } else {
    pp(g, new THREE.CylinderGeometry(.0045, .004, .022, 12), SILVER(), 0, hl + .011);
    pp(g, new THREE.ConeGeometry(.004, len * .12, 12), std(hair, { roughness: .9 }), 0, hl + .022 + len * .06);
  }
  return g;
}
function pencilProp(body, h = .17) {
  const g = new THREE.Group();
  pp(g, new THREE.CylinderGeometry(.0046, .0046, h, 6), std(body, { roughness: .45 }), 0, h / 2);
  pp(g, new THREE.CylinderGeometry(.0047, .0047, .004, 6), std('#d8b04a', { metalness: .5, roughness: .3 }), 0, h * .12);
  pp(g, new THREE.ConeGeometry(.0046, .024, 6), std('#e6c79c'), 0, h + .012);
  pp(g, new THREE.ConeGeometry(.0017, .008, 8), std('#2a2a2a'), 0, h + .02);
  return g;
}
function tubeProp(col, s = 1) {
  const g = new THREE.Group();
  pp(g, new THREE.CylinderGeometry(.0065, .0065, .012, 12), std('#1f1c1a', { roughness: .4 }), 0, .006);
  pp(g, new THREE.CylinderGeometry(.008, .012, .012, 16), SILVER(), 0, .018);
  pp(g, new THREE.CylinderGeometry(.012, .0125, .06, 16), std('#e9e9ea', { metalness: .45, roughness: .32 }), 0, .054);
  pp(g, new THREE.CylinderGeometry(.0124, .0124, .026, 16), std(col, { roughness: .45 }), 0, .05);
  pp(g, new THREE.BoxGeometry(.026, .012, .004), std('#e9e9ea', { metalness: .45, roughness: .32 }), 0, .09);
  g.scale.setScalar(s); return g;
}
function fan(g, items, step, x0 = 0) { items.forEach((it, i) => { it.rotation.z = (i - (items.length - 1) / 2) * step; it.position.x = x0 + (i - (items.length - 1) / 2) * .004; g.add(it); }); }
function makeProp(it, mk, oi = 0) {
  const g = new THREE.Group(), k = it.icon;
  if (k === 'pencils') {
    const n = oi === 1 ? 12 : 6, P = [];
    for (let i = 0; i < n; i++) P.push(pencilProp(rgb(mixc(hex('#5f8a6a'), hex('#14301e'), i / (n - 1))), .17 - Math.abs(i - (n - 1) / 2) * .004));
    fan(g, P, n > 6 ? .05 : .085);
    if (oi === 2) { const c = new THREE.Group(); pp(c, new THREE.CylinderGeometry(.005, .005, .12, 8), std('#141210', { roughness: 1 }), 0, .06); c.position.set(.05, 0, .02); c.rotation.z = -.42; g.add(c); }
  } else if (k === 'paper' || k === 'canvas' || k === 'board') {
    const col = it.paper ? it.paper[oi] : '#f3f0e8', isC = k === 'canvas', isB = k === 'board';
    const W2 = isC ? .3 : isB ? .3 : .27, H2 = isC ? .375 : isB ? .39 : .39, T = isC ? .02 : isB ? .012 : .002;
    const s = new THREE.Group(); s.rotation.x = -.16; g.add(s);
    if (isC) { pp(s, new THREE.BoxGeometry(W2, H2, T), [std('#c8a874'), std('#c8a874'), std('#c8a874'), std('#c8a874'), std(col, { roughness: .95 }), std('#c8a874')], 0, H2 / 2 + .01); }
    else if (isB) { pp(s, new THREE.BoxGeometry(W2, H2, T), std('#c9a77a', { roughness: .7 }), 0, H2 / 2 + .01); pp(s, new THREE.BoxGeometry(W2 * .8, H2 * .62, .002), std('#f3f0e8', { roughness: .95 }), 0, H2 * .55 + .01, .007); for (const x of [-.07, .07]) pp(s, new THREE.BoxGeometry(.03, .022, .014), std('#1f1c1a', { metalness: .4, roughness: .4 }), x, H2 * .86 + .01, .009); }
    else { pp(s, new THREE.BoxGeometry(W2, H2, T), std('#fbfaf6', { roughness: .95 }), .012, H2 / 2 + .01, -.006, 0, .06); pp(s, new THREE.BoxGeometry(W2, H2, T), std(col, { roughness: .95 }), 0, H2 / 2 + .01); }
    pp(g, new THREE.BoxGeometry(W2 * .8, .012, .05), std('#8a5a36', { roughness: .6 }), 0, .006, .02);
  } else if (k === 'eraser') {
    const geo = new THREE.IcosahedronGeometry(.03, 3), pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), n = 1 + .12 * Math.sin(x * 160) * Math.cos(z * 140) + .08 * Math.sin(y * 210); pos.setXYZ(i, x * n * 1.35, y * n * .8 + (y > 0 ? Math.max(0, -Math.abs(x) * 2 + .02) : 0), z * n); }
    geo.computeVertexNormals(); pp(g, geo, std('#8f969c', { roughness: 1 }), 0, .026);
  } else if (k === 'cutter') {
    const s = new THREE.Group(); s.rotation.z = -.3; g.add(s);
    pp(s, new THREE.BoxGeometry(.022, .14, .013), std('#f0b62a', { roughness: .4 }), 0, .07);
    pp(s, new THREE.BoxGeometry(.023, .03, .014), std('#1f1c1a', { roughness: .5 }), 0, .03);
    const b = pp(s, new THREE.BoxGeometry(.016, .05, .0015), SILVER(), .002, .16); b.rotation.z = .12;
  } else if (k === 'stump') {
    [[.13, .006], [.1, .0045]].forEach(([h, r], i) => { const s = new THREE.Group(); s.position.x = i * .022 - .011; s.rotation.z = (i - .5) * .25; pp(s, new THREE.CylinderGeometry(r, r, h, 16), std('#d8d4cc', { roughness: 1 }), 0, h / 2 + .02); pp(s, new THREE.ConeGeometry(r, .02, 16), std('#8a8680', { roughness: 1 }), 0, h + .03); pp(s, new THREE.ConeGeometry(r, .02, 16), std('#d8d4cc'), 0, .01, 0, Math.PI); g.add(s); });
  } else if (k === 'spray') {
    pp(g, new THREE.CylinderGeometry(.03, .03, .16, 28), std('#24426a', { metalness: .5, roughness: .3 }), 0, .08);
    pp(g, new THREE.CylinderGeometry(.0305, .0305, .06, 28), std('#f2efe8', { roughness: .5 }), 0, .09);
    pp(g, new THREE.CylinderGeometry(.026, .03, .02, 28), SILVER(), 0, .17);
    pp(g, new THREE.CylinderGeometry(.009, .009, .016, 12), std('#f2efe8'), 0, .186);
  } else if (k === 'easel') {
    const wm = std('#9c6b42', { roughness: .65 }), s = .55;
    rod(V(-.1 * s, 0, .03), V(-.015, .5 * s, 0), .006, wm, g); rod(V(.1 * s, 0, .03), V(.015, .5 * s, 0), .006, wm, g); rod(V(0, 0, -.12 * s), V(0, .46 * s, -.01), .005, wm, g);
    pp(g, new THREE.BoxGeometry(.13, .006, .02), wm, 0, .12, .025);
    pp(g, new THREE.BoxGeometry(.11, .14, .006), std('#f3f0e8', { roughness: .95 }), 0, .195, .028, -.05);
  } else if (k === 'sand') {
    const s = new THREE.Group(); s.rotation.z = .12; g.add(s);
    pp(s, new THREE.BoxGeometry(.036, .16, .01), std('#c9a77a'), 0, .08);
    pp(s, new THREE.BoxGeometry(.034, .12, .002), std('#c8b48a', { roughness: 1 }), 0, .1, .006);
    for (let i = 0; i < 5; i++) pp(s, new THREE.BoxGeometry(.034, .002, .0025), std('#6a6058'), 0, .045 + i * .025, .0065);
  } else if (k === 'tube') {
    if (mk === 'gouache' && oi === 2) {
      for (let i = 0; i < 6; i++) { const x = (i % 3 - 1) * .05, z = (i < 3 ? -.03 : .03), c = PIG[[0, 1, 3, 6, 9, 11][i]]; pp(g, new THREE.CylinderGeometry(.021, .021, .032, 24), std('#f2efe8', { roughness: .3, transparent: true, opacity: .9 }), x, .016, z); pp(g, new THREE.CylinderGeometry(.019, .019, .024, 24), std(c, { roughness: .5 }), x, .014, z); pp(g, new THREE.CylinderGeometry(.0215, .0215, .008, 24), std(c, { roughness: .4 }), x, .036, z); }
    } else {
      const cols = (oi === 1 ? [1, 2, 3, 4, 5, 6, 7, 8, 10, 11] : [1, 3, 6, 9, 11]).map(i => PIG[i]), T = cols.map((c, i) => { const t = tubeProp(c); t.position.set((i - (cols.length - 1) / 2) * .03, 0, Math.abs(i - (cols.length - 1) / 2) * -.006); return t; });
      T.forEach(t => g.add(t)); const w = tubeProp(PIG[0], 1.45); w.position.set(0, 0, .035); g.add(w);
    }
  } else if (k === 'brushes') {
    const hair = mk === 'oil' ? (oi === 1 ? '#efe6d2' : '#d8c49a') : (oi === 1 ? '#8a6a42' : '#efe6d2'), hand = mk === 'oil' ? '#8a4b2a' : '#262626';
    fan(g, [brushProp(.27, .024, hair, hand), brushProp(.25, .015, hair, hand), brushProp(.23, .008, hair, hand)], .16);
  } else if (k === 'liner') {
    fan(g, [brushProp(.21, .004, '#3a2a1e', '#a83a2a', 'round'), brushProp(.19, .003, '#3a2a1e', '#262626', 'round')], .14);
  } else if (k === 'palette') {
    const s = new THREE.Group(); s.rotation.x = 1.2; s.position.set(0, .08, 0); g.add(s);
    if (mk === 'gouache') {
      pp(s, new THREE.BoxGeometry(.25, .012, .12), std('#f6f4ef', { roughness: .35 }), 0, 0);
      for (let r = 0; r < 2; r++) for (let c = 0; c < 8; c++) pp(s, new THREE.BoxGeometry(.024, .006, .022), std(PIG[(r * 8 + c) % PIG.length], { roughness: .45 }), -.105 + c * .03, .006, -.04 + r * .028);
      pp(s, new THREE.BoxGeometry(.21, .002, .045), std('#ffffff', { roughness: .4 }), 0, .007, .03);
    } else if (oi === 1) {
      pp(s, new THREE.BoxGeometry(.23, .012, .3), std('#fbfaf6', { roughness: .9 }), 0, 0);
      [0, 3, 6, 11].forEach((c, i) => { const b = pp(s, new THREE.SphereGeometry(.014, 14, 10), std(PIG[c], { roughness: .3 }), -.07 + i * .045, .008, -.11); b.scale.y = .4; });
    } else {
      const p = pp(s, new THREE.CylinderGeometry(.13, .13, .008, 48), std('#b08250', { roughness: .5 }), 0, 0); p.scale.set(1.25, 1, .9);
      pp(s, new THREE.CylinderGeometry(.016, .016, .01, 20), std('#3a2a1e'), -.11, 0, .02);
      [0, 1, 2, 3, 4, 6, 11].forEach((c, i) => { const a = -.4 + i * .42, b = pp(s, new THREE.SphereGeometry(.015, 14, 10), std(PIG[c], { roughness: .3 }), Math.cos(a) * .12, .008, Math.sin(a) * .085); b.scale.y = .45; });
    }
  } else if (k === 'bucket') {
    const pl = std('#4a8ab8', { roughness: .35 });
    for (const x of [-.046, .046]) { pp(g, new THREE.CylinderGeometry(.045, .04, .1, 28, 1, true), Object.assign(pl.clone(), { side: THREE.DoubleSide }), x, .05); pp(g, new THREE.CircleGeometry(.043, 28), std('#9fc8de', { roughness: .1 }), x, .08, 0, -Math.PI / 2); pp(g, new THREE.CircleGeometry(.04, 28), pl, x, .001, 0, -Math.PI / 2); }
    const hnd = pp(g, new THREE.TorusGeometry(.07, .003, 8, 40, Math.PI), std('#2a2a2a'), 0, .1); hnd.rotation.x = 0;
  } else if (k === 'sponge') {
    pp(g, new THREE.BoxGeometry(.1, .065, .035), std('#f2c94c', { roughness: 1 }), 0, .0325);
    const r = rngOf(5); for (let i = 0; i < 16; i++) pp(g, new THREE.SphereGeometry(.003 + r() * .003, 8, 6), std('#b88a1e', { roughness: 1 }), (r() - .5) * .09, .006 + r() * .055, .0176);
  } else if (k === 'mister') {
    pp(g, new THREE.CylinderGeometry(.024, .024, .1, 24), std('#cfe3ee', { roughness: .1, transparent: true, opacity: .6 }), 0, .05);
    pp(g, new THREE.CylinderGeometry(.022, .022, .06, 24), std('#7fb4d8', { roughness: .1 }), 0, .03);
    pp(g, new THREE.CylinderGeometry(.012, .016, .02, 20), std('#f2efe8'), 0, .11);
    pp(g, new THREE.BoxGeometry(.02, .028, .03), std('#f2efe8'), 0, .134, .006);
    pp(g, new THREE.BoxGeometry(.006, .026, .008), std('#f2efe8'), 0, .114, .024, .4);
  } else if (k === 'can') {
    pp(g, new THREE.BoxGeometry(.08, .14, .05), std('#c8ccd0', { metalness: .7, roughness: .3 }), 0, .07);
    pp(g, new THREE.BoxGeometry(.081, .07, .051), std('#2f6a4a', { roughness: .5 }), 0, .07);
    pp(g, new THREE.CylinderGeometry(.009, .011, .02, 16), std('#c8ccd0', { metalness: .7, roughness: .3 }), .022, .15);
    pp(g, new THREE.CylinderGeometry(.011, .011, .01, 16), std('#e0482a'), .022, .162);
  } else if (k === 'dropper') {
    pp(g, new THREE.CylinderGeometry(.022, .022, .07, 24), std('#6a3a14', { roughness: .1, transparent: true, opacity: .85 }), 0, .035);
    pp(g, new THREE.CylinderGeometry(.014, .022, .014, 24), std('#6a3a14', { roughness: .1 }), 0, .077);
    pp(g, new THREE.CylinderGeometry(.012, .012, .016, 20), std('#1f1c1a', { roughness: .4 }), 0, .092);
    pp(g, new THREE.SphereGeometry(.01, 16, 12), std('#2a2420', { roughness: .6 }), 0, .108).scale.y = 1.4;
    pp(g, new THREE.BoxGeometry(.044, .03, .001), std('#e9d9a8'), 0, .035, .0222);
  } else if (k === 'pknife') {
    const s = new THREE.Group(); s.rotation.z = -.35; g.add(s);
    pp(s, new THREE.CylinderGeometry(.006, .005, .1, 14), std('#7a4a2a', { roughness: .45 }), 0, .05);
    pp(s, new THREE.CylinderGeometry(.0065, .0065, .012, 14), SILVER(), 0, .106);
    rod(V(0, .112, 0), V(0, .13, .012), .0018, SILVER(), s);
    const bl = pp(s, new THREE.SphereGeometry(1, 4, 2), SILVER(), 0, .17, .012); bl.scale.set(.022, .045, .0015);
  } else if (k === 'jar') {
    pp(g, new THREE.CylinderGeometry(.045, .045, .12, 28), std('#dfeaea', { roughness: .05, transparent: true, opacity: .35 }), 0, .06);
    pp(g, new THREE.CylinderGeometry(.043, .043, .06, 28), std('#c9b98a', { roughness: .1, transparent: true, opacity: .55 }), 0, .03);
    pp(g, new THREE.CylinderGeometry(.047, .047, .014, 28), SILVER(), 0, .127);
    [-.02, .015].forEach((x, i) => { const b = brushProp(.2, .012, '#d8c49a', '#8a4b2a'); b.position.set(x, .02, 0); b.rotation.z = (i - .5) * .3; g.add(b); });
  } else if (k === 'rag') {
    const geo = new THREE.PlaneGeometry(.18, .18, 30, 30), pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), y = pos.getY(i); pos.setZ(i, Math.sin(x * 60) * .006 + Math.sin(y * 45 + x * 20) * .008); }
    geo.computeVertexNormals();
    const m = pp(g, geo, std('#ece6d8', { roughness: 1, side: THREE.DoubleSide }), 0, .09, 0, -.2);
    for (const y of [.05, .13]) pp(g, new THREE.BoxGeometry(.18, .008, .004), std('#6a8ab0', { roughness: 1 }), 0, y, Math.sin(y * 45) * .008 + .003, -.2);
  } else if (k === 'gloves') {
    const gm = std('#5a8ad8', { roughness: .55 });
    pp(g, new THREE.BoxGeometry(.075, .085, .026), gm, 0, .0425);
    [-.027, -.009, .009, .027].forEach((x, i) => pp(g, new THREE.CapsuleGeometry(.0085, [.045, .055, .052, .04][i], 6, 12), gm, x, .085 + [.045, .055, .052, .04][i] / 2 + .006));
    pp(g, new THREE.CapsuleGeometry(.009, .035, 6, 12), gm, -.045, .06, 0, 0, 0, .7);
    pp(g, new THREE.CylinderGeometry(.04, .038, .03, 24), gm, 0, -.01).scale.z = .45;
    g.position.y = .025;
  }
  return g;
}

/* 卡片上的画材图：用一个小渲染器把模型拍成图片，按画种和规格缓存 */
let TR = null; const THUMB = {};
function propThumb(it, mk, oi) {
  const key = `${mk}:${it.id}:${oi}`;
  if (THUMB[key]) return THUMB[key];
  if (!TR) {
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    r.setPixelRatio(2); r.setSize(240, 160); r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
    const sc = new THREE.Scene(); sc.add(new THREE.HemisphereLight('#fff4e4', '#9a8a76', 1.6));
    const dl = new THREE.DirectionalLight('#ffffff', 2.4); dl.position.set(-1, 2, 2); sc.add(dl);
    const fl = new THREE.DirectionalLight('#ffd9b0', .9); fl.position.set(2, 1, -1); sc.add(fl);
    TR = { r, sc, cam: new THREE.PerspectiveCamera(26, 240 / 160, .005, 10) };
  }
  const g = makeProp(it, mk, oi); TR.sc.add(g); g.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(g), c = box.getCenter(V(0, 0, 0)), rad = box.getSize(V(0, 0, 0)).length() / 2;
  TR.cam.position.copy(c).addScaledVector(V(.5, .38, 1).normalize(), rad / Math.sin(THREE.MathUtils.degToRad(13)) * .9); TR.cam.lookAt(c);
  TR.r.render(TR.sc, TR.cam); THUMB[key] = TR.r.domElement.toDataURL('image/png');
  TR.sc.remove(g); g.traverse(o => { if (o.geometry) o.geometry.dispose(); });
  return THUMB[key];
}

/* 选中的画材在边桌上“立起来”：从桌面升起一个小展台，画材放大、慢慢转 */
const showcase = new THREE.Group(); showcase.position.set(-.02, .735, .02); side.add(showcase); showcase.visible = false;
const showPed = mesh(new THREE.CylinderGeometry(.1, .108, 1, 48).translate(0, .5, 0), std('#efe7d8', { roughness: .55 }), V(0, 0, 0), showcase, true, true);
const showRing = mesh(new THREE.TorusGeometry(.11, .0035, 8, 72), new THREE.MeshBasicMaterial({ color: '#e8a63f' }), V(0, .002, 0), showcase, false, false); showRing.rotation.x = Math.PI / 2;
const showLight = new THREE.PointLight('#ffe2b8', 0, 1.2, 2); showLight.position.set(.08, .5, .2); showcase.add(showLight);
let showProp = null, showA = 0, showOn = false, showKey = '';
function showItem(it, mk, oi) {
  const key = it ? `${mk}:${it.id}:${oi}` : '';
  if (key === showKey) return; showKey = key;
  if (showProp) { showcase.remove(showProp); showProp = null; }
  showOn = !!it; if (!it) return;
  const g = makeProp(it, mk, oi), box = new THREE.Box3().setFromObject(g), sz = box.getSize(V(0, 0, 0)), c = box.getCenter(V(0, 0, 0));
  const s = .2 / Math.max(sz.x, sz.y, sz.z * 1.4);
  g.position.set(-c.x, -box.min.y, -c.z);
  showProp = new THREE.Group(); showProp.add(g); showProp.userData.s = s; showProp.scale.setScalar(.001); showcase.add(showProp);
  showcase.visible = true;
}
function tickShowcase() {
  showA += ((showOn && S.prep ? 1 : 0) - showA) * .12;
  if (showA < .005 && !showOn) { showcase.visible = false; return; }
  const h = .05 * showA; showPed.scale.y = Math.max(h, .0001);
  showRing.material.opacity = showA; showLight.intensity = 1.6 * showA;
  if (showProp) { const e = 1 + 2.4 * Math.pow(showA - 1, 3) + 1.4 * Math.pow(showA - 1, 2); showProp.scale.setScalar(showProp.userData.s * Math.max(.001, e)); showProp.position.y = h + .003; showProp.rotation.y = Math.sin(performance.now() / 1400) * .55; }
}
function showCamFor() { const C = showcase.localToWorld(V(0, .13, 0)); CAMS.show = { p: C.clone().add(V(.06, .26, .8)), t: C.clone().add(V(0, -.03, 0)) }; }
function syncShow(camMove) {
  const mk = MK(), it = prepOpenId && [...PREP[mk].must, ...PREP[mk].nice].find(x => x.id === prepOpenId);
  showItem(it, mk, it ? (prepState(mk).opt[it.id] ?? 0) : 0);
  if (camMove) { if (it) { showCamFor(); setCam('show'); } else setCam(innerWidth > 760 ? 'prep' : 'tools'); }
}
function renderPrep() {
  const def = rt.def, mk = def.mk, P = PREP[mk], st = prepState(mk), kind = def.kind === 'head' ? 'head' : def.kind === 'land' ? 'land' : 'still';
  const card = it => {
    const have = !!st.have[it.id], open = prepOpenId === it.id, oi = st.opt[it.id] ?? 0;
    return `<div class="kit${have ? ' have' : ''}${open ? ' open' : ''}" data-id="${it.id}">
      <button type="button" class="kit-main" data-act="open" aria-expanded="${open}"><span class="ico"><img src="${propThumb(it, mk, oi)}" alt="" width="240" height="160"></span><span class="kit-t"><b>${it.name}</b><span class="spec">${it.opts ? it.opts[oi] + ' · ' : ''}${it.spec}</span></span></button>
      <button type="button" class="chk" data-act="have" aria-pressed="${have}" aria-label="${have ? '取消勾选' : '我已经有了'}：${it.name}"><svg viewBox="0 0 24 24"><path d="M6 12.5l4 4 8-9"/></svg></button>
      ${open ? `<div class="kit-more"><p>${it.use}</p>${it.opts ? `<div class="opts" role="group" aria-label="选择${it.name}">${it.opts.map((o, i) => `<button type="button" class="opt" data-act="opt" data-i="${i}" aria-pressed="${i === oi}">${it.paper ? `<i style="background:${it.paper[i]}"></i>` : ''}${o}</button>`).join('')}</div>` : ''}<p class="alt"><span>没有怎么办：</span>${it.alt}</p></div>` : ''}
    </div>`;
  };
  const got = P.must.filter(it => st.have[it.id]).length;
  $('prepBody').innerHTML = `
    <div class="prep-eyebrow">开画之前 · ${def.medium} · ${def.name}</div>
    <h2>准备画材</h2>
    <p class="prep-sub">缺了哪样？点开卡片看替代办法。勾上你已经有的。</p>
    <div class="prep-facts"><div><span class="fk">时间</span><span class="fv">${LEVEL_TIME[def.level] || '约 2 小时'}</span></div><div><span class="fk">画纸</span><span class="fv">${P.size}</span></div><div><span class="fk">难度</span><span class="fv">${def.level}</span></div></div>
    <div class="prep-h3"><span>开画前先做好</span></div>
    <ol class="prep-before">${P.before[kind].map(t => `<li>${t}</li>`).join('')}</ol>
    <div class="prep-h3"><span>必备</span><span>${got} / ${P.must.length}</span></div>
    <div class="kits">${P.must.map(card).join('')}</div>
    <div class="prep-h3"><span>有更好</span></div>
    <div class="kits">${P.nice.map(card).join('')}</div>`;
  $('prepCount').textContent = got === P.must.length ? '必备画材都齐了' : `必备画材 ${got} / ${P.must.length}`;
  $('prepBar').style.width = (got / P.must.length * 100) + '%';
  $('prepGo').textContent = got === P.must.length ? '准备好了，开始画' : '先看看怎么画';
}
function prepFocus(id) {
  const it = id && [...PREP[MK()].must, ...PREP[MK()].nice].find(x => x.id === id), ids = new Set([...PREP[MK()].must, ...PREP[MK()].nice].map(x => x.label).filter(Boolean));
  for (const l of labels) { const on = !!it && it.label === l.id; l.el.classList.toggle('on', on); l.show = ids.has(l.id) || on; }
}
function openPrep() {
  if (S.paint) exitPaint(true);
  setPlaying(false); S.prep = true; prepOpenId = null;
  if (S.step !== 0) goStep(0, false);
  setView('room'); setCam(innerWidth > 760 ? 'prep' : 'tools');
  $('prep').hidden = false; document.body.classList.add('prepping'); $('prepBtn').setAttribute('aria-pressed', 'true');
  renderPrep(); prepFocus(null); syncShow(false); $('prepBody').scrollTop = 0;
}
function closePrep(start) {
  S.prep = false; $('prep').hidden = true; document.body.classList.remove('prepping'); $('prepBtn').setAttribute('aria-pressed', 'false');
  prepOpenId = null; showItem(null);
  prepState(MK()).seen = true; savePrep(); buildPaintTools();
  if (start) goStep(1, true); else updateUI();
}
$('prepBody').addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const id = b.closest('.kit').dataset.id, st = prepState(MK());
  if (b.dataset.act === 'open') { prepOpenId = prepOpenId === id ? null : id; prepFocus(prepOpenId); }
  else if (b.dataset.act === 'have') { st.have[id] = !st.have[id]; savePrep(); }
  else if (b.dataset.act === 'opt') { st.opt[id] = +b.dataset.i; st.have[id] = true; savePrep(); }
  renderPrep(); syncShow(b.dataset.act === 'open');
  const el = $('prepBody').querySelector(`.kit[data-id="${id}"] [data-act="${b.dataset.act}"]${b.dataset.act === 'opt' ? `[data-i="${b.dataset.i}"]` : ''}`); if (el) el.focus();
});
$('prepGo').onclick = () => closePrep(true);
$('stepText').addEventListener('click', e => { if (e.target.closest('[data-prep]')) openPrep(); });
$('prepSkip').onclick = () => closePrep(true);
$('prepClose').onclick = () => closePrep(false);
$('prepBtn').onclick = () => S.prep ? closePrep(false) : openPrep();
// 自己画用的纸：按准备页里选的纸
const PAPER_CACHE = {};
function chosenPaper() {
  const mk = MK(), it = PREP[mk].must.find(x => x.paper), i = prepState(mk).opt[it.id] ?? 0, key = mk + i;
  return PAPER_CACHE[key] || (PAPER_CACHE[key] = makePaper(it.paper[i], 101 + i, it.weave ? it.weave[i] : false));
}
// 自己画用的笔和颜色：按准备页里选的套装
const EXTRA_TOOLS = {
  sketch: { 1: [{ id: '6H', c: '#a29d97', a: .18, w: 1, at: 0 }, { id: '2B', c: '#45413d', a: .38, w: 2, at: 3 }, { id: '6B', c: '#24221f', a: .5, w: 3, at: 5 }], 2: [{ id: '炭笔', c: '#141210', a: .7, w: 4.6, at: 4 }] },
  gouache: { 1: [['中绿', '#3f8a4a'], ['天蓝', '#5aa0d8'], ['玫红', '#c8306a'], ['赭石', '#9a5a2a']].map(([n, c]) => ({ id: n, sw: c, at: -1 })) },
  oil: { 1: [['土绿', '#6a7a4a'], ['镉橙', '#e8742a'], ['茜素红', '#8a1a3a'], ['普蓝', '#1f2a4a']].map(([n, c]) => ({ id: n, sw: c, at: -1 })) }
};
function toolsFor(mk) {
  const base = PAINT_TOOLS[mk].slice(), key = mk === 'sketch' ? 'pencils' : 'paints', extra = (EXTRA_TOOLS[mk] || {})[prepState(mk).opt[key] ?? 0] || [];
  for (const t of extra) { const at = t.at >= 0 ? t.at : base.findIndex(x => x.erase || x.knife); base.splice(at < 0 ? base.length : at, 0, t); }
  return base;
}

let toastT = 0;
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600); }
