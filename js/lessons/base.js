'use strict';
// 三节入门课：素描石膏球体、水粉红苹果、油画青花与柠檬（手写步骤）

/* ================= 作品一：素描 · 石膏球体 ================= */
function defSketch() {
  const CX = 400, CY = 430, R = 205, TE = 540;
  const L = n3([-.62, -.6, .38]), Hn = n3([L[0], L[1], L[2] + 1]), B = n3([.45, .8, .25]);
  const sph = (x, y) => {
    const dx = (x - CX) / R, dy = (y - CY) / R, q = Math.hypot(dx, dy), a = clamp((1 - q) * R / 1.5 + .5, 0, 1);
    const s = q > .999 ? .999 / q : 1, nx = dx * s, ny = dy * s, nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny)), n = [nx, ny, nz];
    return { a, d: dot3(n, L), hl: dot3(n, Hn), rf: dot3(n, B) };
  };
  const shadowE = (x, y) => { const u = x - 560, v = y - 612, c = Math.cos(.12), s = Math.sin(.12); const xr = u * c - v * s, yr = u * s + v * c; return (xr / 232) ** 2 + (yr / 40) ** 2; };
  const M = {}; const mm = (k, f) => M[k] || (M[k] = makeMask(f));
  const G = { grain: .28, tool: 'pencil' };
  return {
    key: 'sketch', name: '石膏球体', sub: '素描 · 光从左上方来', medium: '素描', paper: '#f3f0e8',
    counter: { label: '调子', items: [['高光', '#f4f1ea'], ['灰面', '#b9b4ab'], ['明暗交界线', '#3a3633'], ['反光', '#8a847b'], ['投影', '#55504a']] },
    idleTool: 'pencil',
    steps: [
      { title: '准备工具', tool: '2H · HB · 4B · 8B', cam: 'tools', focus: ['pencils', 'eraser', 'knife'], ann: [], ref: '先看静物',
        text: '素描靠铅笔的软硬来控制深浅：<b>H</b> 前的数字越大，笔芯越硬越浅；<b>B</b> 前的数字越大，越软越黑。再备一块<b>可塑橡皮</b>，它不只用来擦错，还能“画”出反光和高光。',
        tip: '<span>削笔：</span>露出 1.5 厘米左右的长笔芯。侧锋铺调子，笔尖刻细节。' },
      { title: '定位构图', tool: '2H 铅笔', cam: 'easel', focus: ['subject'], ann: ['axis'], ref: '找中心线',
        text: '先用很轻的线定出球体的<b>上、下、左、右</b>四个点和中心十字线。球体放在画面中间略偏上，下方和右边给<b>投影</b>留出位置。',
        tip: '<span>手要轻：</span>这一步只是搭架子，线条轻到随时能擦掉。',
        build: r => [{ ...G, grain: .2, strokes: [
          ...sketchLine(r, CX, CY - R - 40, CX, CY + R + 40, {}), ...sketchLine(r, CX - R - 40, CY, CX + R + 40, CY, {}),
          ...sketchLine(r, CX - R, CY - R, CX + R, CY - R, { a: .3 }), ...sketchLine(r, CX + R, CY - R, CX + R, CY + R, { a: .3 }),
          ...sketchLine(r, CX + R, CY + R, CX - R, CY + R, { a: .3 }), ...sketchLine(r, CX - R, CY + R, CX - R, CY - R, { a: .3 }),
          ...sketchLine(r, CX - 40, CY - R, CX + 40, CY - R, { a: .7, passes: 3, w: 1.6 }), ...sketchLine(r, CX - 40, CY + R, CX + 40, CY + R, { a: .7, passes: 3, w: 1.6 }),
          ...sketchLine(r, CX - R, CY - 40, CX - R, CY + 40, { a: .7, passes: 3, w: 1.6 }), ...sketchLine(r, CX + R, CY - 40, CX + R, CY + 40, { a: .7, passes: 3, w: 1.6 }),
          ...sketchLine(r, 40, TE, W - 40, TE, { a: .35 }),
          ...arcStrokes(r, 560, 612, 232, 40, Math.PI * .55, Math.PI * 2.05, { rot: -.12, c: '#7a756f', a: .3, w: 1.2, pieces: 5 })
        ] }] },
      { title: '切方找形', tool: 'HB 铅笔', cam: 'easel', focus: ['subject'], ann: ['axis'], ref: '圆是切出来的',
        text: '圆不是一笔画出来的。先切出<b>八边形</b>，再把每个角切掉变成<b>十六边形</b>，最后顺着折线修成圆。',
        tip: '<span>用手臂带线：</span>手腕放松，切的次数越多，圆越准。',
        build: r => {
          const S = [];
          for (const [n, a] of [[8, .45], [16, .35]]) {
            const rr = R / Math.cos(Math.PI / n);
            for (let i = 0; i < n; i++) {
              const t0 = i * 2 * Math.PI / n + Math.PI / n, t1 = t0 + 2 * Math.PI / n;
              S.push(...sketchLine(r, CX + Math.cos(t0) * rr, CY + Math.sin(t0) * rr, CX + Math.cos(t1) * rr, CY + Math.sin(t1) * rr, { c: '#55504b', a, w: 1.4, passes: 1, seg: 400 }));
            }
          }
          S.push(...arcStrokes(r, CX, CY, R, R, -Math.PI / 2, Math.PI * 1.5, { pieces: 8, c: '#3c3935', a: .7, w: 1.8 }));
          return [{ ...G, grain: .2, strokes: S }];
        } },
      { title: '明暗交界线', tool: '2B 铅笔', cam: 'still', focus: ['lamp', 'subject'], ann: ['light', 'term'], gain: ['明暗交界线'], ref: '光与交界线',
        text: '光从<b>左上方</b>照来，球上受光和背光的分界是一条弧线，叫<b>明暗交界线</b>。它不在球的正中，而是偏向背光一侧，也是整个球上最暗的地方。',
        tip: '<span>它是一条带：</span>交界线有宽度，两边都要渐变过渡，别画成一根硬线。',
        build: r => [{ ...G, mask: mm('band', (x, y) => { const s = sph(x, y); return s.a * Math.exp(-(((s.d + .1) / .13) ** 2)) * .95; }), strokes: [
          ...hatch(r, { m: M.band, cell: 60, gap: 4, angles: [-.85], w: 1.4, c: '#2b2826', a: .55 }),
          ...hatch(r, { m: M.band, cell: 60, gap: 5, angles: [-.25], w: 1.2, c: '#2b2826', a: .4 })] }] },
      { title: '铺暗部', tool: '4B 铅笔', cam: 'easel', focus: ['subject'], ann: ['light', 'term', 'dark'], ref: '暗部要整体',
        text: '用侧锋把交界线以外的<b>暗部</b>整体铺一遍。先求整体，排线方向统一，暂时不管细节。',
        tip: '<span>排线：</span>两头轻、中间重。线与线之间留一点缝，下一层再交叉补上。',
        build: r => { const m = mm('dark', (x, y) => { const s = sph(x, y); return s.a * sm(.06, -.12, s.d) * .92; });
          return [{ ...G, mask: m, strokes: hatch(r, { m, cell: 80, gap: 5, angles: [-.85], w: 1.8, c: '#2e2b29', a: .5 }) },
                  { ...G, mask: m, strokes: hatch(r, { m, cell: 80, gap: 6, angles: [.3], w: 1.6, c: '#2e2b29', a: .4 }) }]; } },
      { title: '画投影', tool: '4B 铅笔', cam: 'still', focus: ['lamp', 'cloth'], ann: ['light', 'shadow'], gain: ['投影'], ref: '投影的方向',
        text: '投影落在光源的反方向。灯在左前上方，影子就倒向<b>右后方</b>。离球越近的投影越深越实，越远越浅越虚；球和台面<b>接触的地方最黑</b>。',
        tip: '<span>投影边缘：</span>近处硬、远处软。整片投影也比暗部稍浅一点。',
        build: r => { const m = mm('shadow', (x, y) => { const s = sph(x, y), e = shadowE(x, y);
            const base = sm(1, .5, e) * .8 * (1 - .45 * clamp((x - 380) / 450, 0, 1));
            const core = Math.exp(-(((x - 405) / 105) ** 2 + ((y - 632) / 14) ** 2));
            return (1 - s.a) * clamp(base + core * .75, 0, 1); });
          return [{ ...G, mask: m, strokes: hatch(r, { m, box: [180, 540, 800, 700], cell: 64, gap: 4.5, angles: [.05, -.5], w: 1.7, c: '#2c2927', a: .5 }) }]; } },
      { title: '中间调过渡', tool: 'HB 铅笔', cam: 'easel', focus: ['subject'], ann: ['light', 'mid'], gain: ['灰面'], ref: '灰面让球变圆',
        text: '亮部并不是一片白。顺着球的弧度，从交界线往受光一侧一层层减轻，画出<b>灰面</b>。这一步，球才真正“圆”起来。',
        tip: '<span>顺着形体：</span>越靠近亮部，排线越稀越轻，最后几乎看不见。',
        build: r => { const m = mm('mid', (x, y) => { const s = sph(x, y); return s.a * (s.d > 0 ? sm(.55, .02, s.d) * .26 : .3); });
          return [{ ...G, mask: m, strokes: hatch(r, { m, cell: 70, gap: 4.5, angles: [-.9], w: 1.2, c: '#47433f', a: .45 }) },
                  { ...G, mask: m, strokes: hatch(r, { m, cell: 70, gap: 6, angles: [.6], w: 1.1, c: '#47433f', a: .35 }) }]; } },
      { title: '擦出反光', tool: '可塑橡皮', cam: 'easel', focus: ['eraser', 'cloth'], ann: ['refl'], gain: ['反光'], ref: '台面把光弹回来',
        text: '台面会把光反射回球体，所以暗部靠近底边的地方会微微变亮，这就是<b>反光</b>。把可塑橡皮捏尖，顺着球的边缘轻轻提亮。',
        tip: '<span>别太亮：</span>反光再亮也属于暗部，绝不能亮过灰面，否则球会显得“碎”。',
        build: r => { const m = mm('refl', (x, y) => { const s = sph(x, y); return s.a * sm(-.02, -.25, s.d) * sm(.25, .85, s.rf) * .32; });
          return [{ mode: 'erase', tool: 'eraser', mask: m, strokes: hatch(r, { m, cell: 50, gap: 9, angles: [.9], w: 12, c: '#000', a: .45, bow: 14 }) }]; } },
      { title: '高光', tool: '2H 铅笔 + 橡皮', cam: 'still', focus: ['lamp', 'subject'], ann: ['light', 'hl'], gain: ['高光'], ref: '最亮的一点',
        text: '在离光源最近、又正对着我们眼睛的位置留出<b>高光</b>。周围用 2H 铺一层极浅的灰去衬托它，最后用橡皮把高光点干净。',
        tip: '<span>衬出来的亮：</span>高光不是画白的，是靠周围的灰衬出来的。',
        build: r => { const m1 = mm('lite', (x, y) => { const s = sph(x, y); return s.a * sm(-.05, .25, s.d) * (1 - sm(.93, .985, s.hl)) * .13; });
          const m2 = mm('hl', (x, y) => { const s = sph(x, y); return s.a * sm(.955, .995, s.hl) * .95; });
          return [{ ...G, mask: m1, strokes: hatch(r, { m: m1, cell: 70, gap: 5, angles: [-.8], w: 1, c: '#6a6560', a: .35 }) },
                  { mode: 'erase', tool: 'eraser', mask: m2, strokes: hatch(r, { m: m2, cell: 40, gap: 7, angles: [.3], w: 14, c: '#000', a: .55 }) }]; } },
      { title: '整体调整', tool: '8B 铅笔', cam: 'overview', focus: ['subject', 'backdrop'], ann: ['light', 'term', 'shadow', 'refl', 'hl'], ref: '五大调子',
        text: '铺上<b>背景</b>和台面，压深交界线和接触点，把前后空间拉开。退后一步看整体：高光、灰面、明暗交界线、反光、投影，<b>五大调子</b>都齐了。',
        tip: '<span>收：</span>画到最后，最亮和最暗都只该有一处，其余都要给它们让路。',
        build: r => {
          const mb = mm('bg', (x, y) => { const s = sph(x, y), o = 1 - s.a; if (y < TE) return o * (.24 + .22 * x / W - .08 * y / TE) * sm(TE + 1, TE - 5, y); return o * (.02 + .09 * (y - TE) / (H - TE)); });
          const md = mm('deep', (x, y) => { const s = sph(x, y); return s.a * (Math.exp(-(((s.d + .14) / .09) ** 2)) * .75 + Math.exp(-(((y - 630) / 18) ** 2 + ((x - 410) / 90) ** 2)) * .6); });
          return [
            { ...G, mask: mb, strokes: hatch(r, { m: mb, cell: 90, gap: 5, angles: [-1.15, -.35], w: 1.8, c: '#3a3633', a: .42 }) },
            { ...G, mask: md, strokes: hatch(r, { m: md, cell: 60, gap: 3.5, angles: [-.85], w: 1.6, c: '#1f1d1b', a: .6 }) },
            { ...G, grain: .15, strokes: [...sketchLine(r, 0, TE, 228, TE, { c: '#2f2c2a', a: .55, w: 2, passes: 1 }), ...sketchLine(r, 572, TE, W, TE, { c: '#2f2c2a', a: .55, w: 2, passes: 1 }), ...signature(640, 930, '#3a3633')] }
          ];
        } }
    ]
  };
}

/* ================= 作品二：水粉 · 红苹果 ================= */
function defGouache() {
  const ACX = 400, ACY = 545, AR = 195, TE = 610;
  const L = n3([-.5, -.62, .6]), Hn = n3([L[0], L[1], L[2] + 1]), B = n3([.4, .85, .3]);
  const rOf = t => AR * (1 - .08 * Math.sin(t)) - AR * .13 * Math.exp(-(((t + Math.PI / 2) / .33) ** 2)) - AR * .04 * Math.exp(-(((t - Math.PI / 2) / .3) ** 2));
  const ap = (x, y) => {
    const dx = x - ACX, dy = y - ACY, dist = Math.hypot(dx, dy), t = Math.atan2(dy, dx), r = rOf(t), a = clamp((r - dist) / 1.5 + .5, 0, 1);
    const q = Math.min(dist / r, .999), nx = Math.cos(t) * q, ny = Math.sin(t) * q, n = [nx, ny, Math.sqrt(1 - q * q)];
    return { a, d: dot3(n, L), hl: dot3(n, Hn), rf: dot3(n, B), dist, r };
  };
  const C = Object.fromEntries(Object.entries({ white: '#f6f2ea', lemon: '#f2d23c', ochre: '#c8902e', verm: '#e0482a', crim: '#8e1c1a', ultra: '#2f3f8f', umber: '#5a3a26', olive: '#6f7a4a' }).map(([k, v]) => [k, hex(v)]));
  const wallCol = (x, y) => mixc(hex('#58604f'), hex('#a9ab90'), clamp(.78 - x / W * .75 + (1 - y / TE) * .1 - Math.hypot(x - 120, y - 120) / 1500, 0, 1));
  const fold = (x, y) => .5 + .5 * Math.sin((x * .9 + (y - TE) * 1.4) / 60 + Math.sin(x / 140) * 1.6);
  const clothCol = (x, y) => chain([[0, hex('#3d4e6e')], [.5, hex('#6a81a1')], [1, hex('#a0b3ca')]], clamp(.5 - x / W * .35 + (fold(x, y) - .5) * .7, 0, 1));
  const appleCol = (x, y) => chain([[-1, hex('#4a1012')], [-.35, hex('#6b1515')], [-.05, hex('#8f1d18')], [.25, hex('#c2321f')], [.55, hex('#df4f28')], [.85, hex('#ee8a3c')], [1, hex('#f2a64a')]], ap(x, y).d);
  const shadowE = (x, y) => { const u = x - 565, v = y - 690, c = Math.cos(.12), s = Math.sin(.12); const xr = u * c - v * s, yr = u * s + v * c; return (xr / 218) ** 2 + (yr / 40) ** 2; };
  const tangent = (x, y) => Math.atan2(y - ACY, x - ACX) + Math.PI / 2;
  const M = {}; const mm = (k, f) => M[k] || (M[k] = makeMask(f));
  const Bt = { tool: 'brush', grain: .08 };
  return {
    key: 'gouache', name: '红苹果', sub: '水粉 · 暖光下的冷暖', medium: '水粉', paper: '#efe8da',
    counter: { label: '颜色', items: [['熟褐', '#5a3a26'], ['橄榄绿', '#6f7a4a'], ['土黄', '#c8902e'], ['钛白', '#f6f2ea'], ['群青', '#2f3f8f'], ['深红', '#8e1c1a'], ['朱红', '#e0482a'], ['柠檬黄', '#f2d23c']] },
    idleTool: 'brush',
    steps: [
      { title: '准备颜料', tool: '调色盘 · 洗笔桶 · 平头笔', cam: 'tools', focus: ['palette', 'bucket', 'brushes'], ann: [], ref: '先看静物',
        text: '水粉是<b>不透明</b>的颜料，浅色可以盖住深色。先把要用的颜色挤在调色盘边上，按冷暖排好，中间留出调色的地方。',
        tip: '<span>水量：</span>调出来像酸奶一样稠最合适，太稀会透底，太干拖不动笔。' },
      { title: '起稿', tool: '熟褐 · 小号笔', cam: 'easel', focus: ['subject'], ann: ['axis'], gain: ['熟褐'], ref: '找形',
        text: '用加水稀释的<b>熟褐</b>淡淡勾出苹果外形、桌面线和投影的位置。苹果不是正圆：上宽下窄，顶上有一个凹进去的<b>果窝</b>。',
        tip: '<span>颜色要淡：</span>起稿的线最后会被颜色盖住，所以别用铅笔，铅笔灰会把颜色弄脏。',
        build: r => [{ ...Bt, strokes: [
          ...arcStrokes(r, ACX, ACY, 1, 1, -Math.PI / 2 + .25, Math.PI * 1.5 - .25, { pieces: 9, c: '#8a5a3a', a: .65, w: 2.4, rf: t => rOf(t) }),
          ...sketchLine(r, 30, TE, W - 30, TE, { c: '#8a5a3a', a: .45, w: 2, passes: 1 }),
          ...arcStrokes(r, 565, 690, 218, 40, Math.PI * .5, Math.PI * 2.05, { rot: -.12, c: '#8a5a3a', a: .4, w: 1.8, pieces: 5 }),
          { k: 'line', p: [402, 372, 410, 348, 430, 320], w: 3, c: '#8a5a3a', a: .7 }] }] },
      { title: '铺背景', tool: '橄榄绿 · 土黄 · 钛白', cam: 'easel', focus: ['backdrop', 'lamp'], ann: ['warm', 'cool'], gain: ['橄榄绿', '土黄', '钛白'], ref: '背景也有冷暖',
        text: '先画面积最大的<b>背景</b>。左边离灯近，色调偏暖偏亮，多调一点土黄和钛白；右边离灯远，偏冷偏暗。',
        tip: '<span>顺序：</span>从大到小、从深到浅，是水粉最基本的作画顺序。',
        build: r => { const m = mm('wall', (x, y) => (1 - ap(x, y).a) * sm(TE + 3, TE - 3, y));
          return [{ ...Bt, mask: m, strokes: brushes(r, { m, box: [0, 0, W, TE + 20], cell: 26, w: [28, 40], len: [50, 95], dir: (x, y) => Math.sin(x * .031 + y * .017) * 1.1 + Math.sin(y * .05) * .4, col: wallCol }) }]; } },
      { title: '铺衬布', tool: '群青 · 钛白', cam: 'still', focus: ['cloth'], ann: ['fold'], gain: ['群青'], ref: '布的褶皱',
        text: '蓝灰色衬布用群青加钛白，再带一点背景色。顺着<b>褶皱</b>的走向用笔：朝着灯的褶皱面亮一些，背着灯的面暗一些。',
        tip: '<span>笔触方向：</span>跟着布纹走，画出来的布才“软”。',
        build: r => { const m = mm('cloth', (x, y) => (1 - ap(x, y).a) * sm(TE - 3, TE + 3, y));
          return [{ ...Bt, mask: m, strokes: brushes(r, { m, box: [0, TE - 20, W, H], cell: 24, w: [24, 34], len: [50, 90], dir: () => .55, col: clothCol }) }]; } },
      { title: '苹果暗部', tool: '深红 · 群青', cam: 'easel', focus: ['subject'], ann: ['term', 'dark'], gain: ['深红'], ref: '暗部偏冷',
        text: '苹果的暗部用<b>深红</b>加一点点群青，让颜色“沉”下去。笔触顺着球面的弧度绕着走。',
        tip: '<span>先暗后亮：</span>暗部先铺，亮部再压上去，边缘自然就衔接上了。',
        build: r => { const m = mm('adark', (x, y) => { const s = ap(x, y); return s.a * sm(.22, .02, s.d); });
          return [{ ...Bt, mask: m, strokes: brushes(r, { m, box: [180, 330, 620, 760], cell: 18, w: [18, 26], len: [34, 60], dir: tangent, col: appleCol }) }]; } },
      { title: '苹果亮部', tool: '朱红 · 柠檬黄', cam: 'easel', focus: ['subject', 'lamp'], ann: ['light', 'warm2'], gain: ['朱红', '柠檬黄'], ref: '亮部偏暖',
        text: '亮部用<b>朱红</b>，越靠近光源越多加<b>柠檬黄</b>。暖光下，亮部偏暖、暗部偏冷，这就是<b>冷暖对比</b>。',
        tip: '<span>一笔是一笔：</span>水粉别来回涂抹，下笔肯定，笔触本身就是画面的一部分。',
        build: r => { const m = mm('alite', (x, y) => { const s = ap(x, y); return s.a * sm(-.12, .08, s.d); });
          return [{ ...Bt, mask: m, strokes: brushes(r, { m, box: [180, 330, 620, 760], cell: 16, w: [15, 22], len: [30, 54], dir: tangent, col: appleCol }) }]; } },
      { title: '投影与交界线', tool: '群青 · 深红 · 熟褐', cam: 'still', focus: ['cloth', 'subject'], ann: ['shadow', 'term'], ref: '投影不是黑的',
        text: '衬布上的<b>投影</b>不是黑色，而是布本身的颜色加深，再偏冷、偏紫一点。同时压深苹果的<b>明暗交界线</b>。',
        tip: '<span>别用黑：</span>水粉里的黑一碰就“脏”，用深红加群青调出来的深色更透气。',
        build: r => {
          const ms = mm('gshadow', (x, y) => { const s = ap(x, y), e = shadowE(x, y); const core = Math.exp(-(((x - 410) / 110) ** 2 + ((y - 720) / 12) ** 2)); return (1 - s.a) * (y > TE ? 1 : 0) * clamp(sm(1, .55, e) * (1 - .35 * clamp((x - 380) / 420, 0, 1)) + core, 0, 1); });
          const mb = mm('gband', (x, y) => { const s = ap(x, y); return s.a * Math.exp(-(((s.d + .05) / .12) ** 2)) * .8; });
          return [
            { ...Bt, mask: ms, strokes: brushes(r, { m: ms, box: [300, 620, 800, 760], cell: 18, w: [18, 26], len: [40, 70], dir: () => -.12, col: (x, y) => mixc(mixc(clothCol(x, y), [0, 0, 0], .45), hex('#3b2f58'), .35) }) },
            { ...Bt, mask: mb, strokes: brushes(r, { m: mb, box: [180, 330, 620, 760], cell: 14, w: [12, 18], len: [26, 44], dir: tangent, col: () => hex('#64161a') }) }
          ];
        } },
      { title: '环境色', tool: '群青 · 朱红', cam: 'easel', focus: ['cloth', 'subject'], ann: ['refl', 'bounce'], ref: '颜色会互相染',
        text: '物体会互相“染色”。蓝色衬布映到苹果底部，形成带紫的<b>反光</b>；苹果的红也会映到旁边的布上。这就是<b>环境色</b>。',
        tip: '<span>点到为止：</span>环境色很微妙，薄薄一层就够，抢过固有色就假了。',
        build: r => {
          const m1 = mm('grefl', (x, y) => { const s = ap(x, y); return s.a * sm(0, -.25, s.d) * sm(.3, .85, s.rf) * .75; });
          const m2 = mm('bounce', (x, y) => (1 - ap(x, y).a) * (y > TE ? 1 : 0) * Math.exp(-(((x - 470) / 105) ** 2 + ((y - 728) / 22) ** 2)) * .7);
          return [
            { ...Bt, mask: m1, strokes: brushes(r, { m: m1, box: [250, 480, 640, 760], cell: 14, w: [12, 18], len: [24, 40], dir: tangent, col: () => hex('#7a3b55') }) },
            { ...Bt, opacity: .6, mask: m2, strokes: brushes(r, { m: m2, box: [300, 680, 640, 780], cell: 16, w: [14, 20], len: [30, 50], dir: () => 0, col: () => hex('#835670') }) }
          ];
        } },
      { title: '细节与高光', tool: '钛白 · 熟褐 · 勾线笔', cam: 'still', focus: ['subject', 'lamp'], ann: ['hl', 'stem'], ref: '高光与果柄',
        text: '加上<b>果柄</b>、果窝和表皮上的小斑点，衬布的褶皱顶上提几笔亮色。最后用钛白调一点点黄，点出<b>高光</b>。',
        tip: '<span>高光要少：</span>一两笔就够，点多了反而不亮。',
        build: r => {
          const S = [];
          for (let i = 0; i < 26; i++) { let x, y, k = 0; do { x = 40 + r() * 720; y = TE + 20 + r() * 360; k++; } while ((fold(x, y) < .88 || ap(x, y).a > 0 || shadowE(x, y) < 1.2) && k < 60);
            const L2 = 40 + r() * 60; S.push({ k: 'brush', p: [x, y, x + Math.cos(.55) * L2 / 2, y + Math.sin(.55) * L2 / 2, x + Math.cos(.55) * L2, y + Math.sin(.55) * L2], w: 6 + r() * 5, c: '#b9c8da', c2: '#cfdbe8', c3: '#9eb0c6', a: .55, seed: r() * 1e9 | 0 }); }
          S.push({ k: 'line', p: [355, 376, 400, 362, 445, 376], w: 7, c: '#5a1414', a: .55 });
          for (let i = 0; i < 140; i++) { let x, y, s, k = 0; do { x = 200 + r() * 400; y = 350 + r() * 380; s = ap(x, y); k++; } while ((s.a < 1 || s.d < .05) && k < 40); S.push({ k: 'dot', x, y, r: 1.2 + r() * 1.8, c: '#f4c76a', a: .55 }); }
          S.push({ k: 'line', p: [402, 374, 409, 348, 428, 318], w: 8, c: '#4a2e1c', a: .95 }, { k: 'line', p: [399, 372, 405, 350, 423, 320], w: 2.5, c: '#9a7048', a: .8 });
          const hx = ACX + Hn[0] * AR * .98, hy = ACY + Hn[1] * AR * .98;
          S.push({ k: 'brush', p: [hx - 22, hy + 10, hx, hy - 6, hx + 24, hy - 2], w: 24, c: '#f3ab78', c2: '#f7c39a', c3: '#e8955e', a: .45, seed: 3 });
          for (let i = 0; i < 4; i++) S.push({ k: 'brush', p: [hx - 12 + i * 3, hy + 4 - i * 2, hx - 2 + i * 2, hy - 5 - i, hx + 10, hy - 2 + i], w: 9 - i, c: '#fff3e2', c2: '#ffffff', c3: '#f5e2c8', a: .95, seed: i + 9 });
          return [{ ...Bt, grain: 0, strokes: S }];
        } },
      { title: '整体调整', tool: '大号笔 · 签名', cam: 'overview', focus: ['subject', 'backdrop'], ann: ['light', 'term', 'shadow', 'refl', 'hl'], ref: '虚实与空间',
        text: '把苹果背光一侧的边缘和背景<b>融合</b>，受光一侧保持清晰。<b>边缘虚实</b>决定了空间感。最后压深接触点，签上名字。',
        tip: '<span>眯眼看：</span>眯起眼睛看整体，哪里跳出来了，就把哪里收一收。',
        build: r => {
          const me = mm('edge', (x, y) => { const s = ap(x, y), k = Math.abs(s.dist - s.r); return k < 16 ? (1 - k / 16) * sm(.25, -.05, s.d) * .85 : 0; });
          return [
            { ...Bt, mask: me, strokes: brushes(r, { m: me, box: [180, 330, 640, 760], cell: 12, w: [10, 16], len: [22, 36], dir: tangent, col: (x, y) => mixc(y < TE ? wallCol(x, y) : clothCol(x, y), hex('#6b1515'), .5) }) },
            { ...Bt, grain: 0, strokes: [{ k: 'brush', p: [330, 716, 400, 726, 478, 720], w: 9, c: '#2a2030', c2: '#3a2c40', c3: '#1c1520', a: .75, seed: 41 }, ...signature(640, 930, '#e9e1d2', 2.4)] }
          ];
        } }
    ]
  };
}


/* ================= 作品三：油画 · 青花瓷瓶与柠檬 ================= */
function defOil() {
  const VX = 350, VT = 250, VH = 390, TE = 560, LCX = 578, LCY = 668, LRX = 96, LRY = 58;
  const L = n3([-.6, -.62, .45]), Hn = n3([L[0], L[1], L[2] + 1]), B = n3([.3, .85, .3]);
  const rv = t => 46 + 104 * sm(.2, .58, t) - 60 * sm(.7, 1, t) + 12 * Math.exp(-(((t - .01) / .03) ** 2));
  const vase0 = (x, y) => {
    const t = (y - VT) / VH, tc = clamp(t, 0, 1), r = rv(tc), dx = x - VX;
    const a = clamp((r - Math.abs(dx)) / 1.5 + .5, 0, 1) * clamp(t * VH / 1.5 + .5, 0, 1) * clamp((1 - t) * VH / 1.5 + .5, 0, 1);
    const nx = clamp(dx / r, -.999, .999), nz = Math.sqrt(1 - nx * nx), dr = (rv(clamp(tc + .005, 0, 1)) - rv(clamp(tc - .005, 0, 1))) / (.01 * VH);
    const n = n3([nx, -dr, nz]);
    return { a, t: tc, nx, d: dot3(n, L), hl: dot3(n, Hn), rf: dot3(n, B) };
  };
  const lemon0 = (x, y) => {
    const dx = (x - LCX) / LRX, dy = (y - LCY) / LRY, q = dx * dx + dy * dy, a = clamp((1 - Math.sqrt(q)) * LRY / 1.5 + .5, 0, 1);
    const k = q > .998 ? Math.sqrt(.998 / q) : 1, n = n3([dx * k * .8, dy * k, Math.sqrt(Math.max(0, 1 - q * k * k))]);
    return { a, d: dot3(n, L), hl: dot3(n, Hn), rf: dot3(n, B) };
  };
  // 蒙版都在同一批半分辨率格点上取样，缓存起来，避免每张蒙版重复算一遍形体
  const Q = 4, FW = W / Q, FH = H / Q;
  const field = (f, keys) => {
    let arr = null; const sc = {}, nk = keys.length;
    return (x, y) => {
      if (x % Q !== 2 || y % Q !== 2 || x < 0 || y < 0 || x >= W || y >= H) return f(x, y);
      if (!arr) { arr = keys.map(() => new Float32Array(FW * FH)); for (let j = 0; j < FH; j++) for (let i = 0; i < FW; i++) { const v = f(i * Q + 2, j * Q + 2); for (let n = 0; n < nk; n++) arr[n][j * FW + i] = v[keys[n]]; } }
      const idx = (y >> 2) * FW + (x >> 2); for (let n = 0; n < nk; n++) sc[keys[n]] = arr[n][idx]; return sc;
    };
  };
  const vase = field(vase0, ['a', 't', 'nx', 'd', 'hl', 'rf']), lemon = field(lemon0, ['a', 'd', 'hl', 'rf']);
  const occ = (x, y) => Math.max(vase(x, y).a, lemon(x, y).a);
  const glow = (x, y) => clamp(1 - Math.hypot(x - 170, y - 170) / 650, 0, 1);
  const bgCol = (x, y) => mixc(hex('#1d1914'), hex('#6e5d3d'), Math.pow(glow(x, y), 1.6));
  const tableCol = (x, y) => mixc(hex('#33251a'), hex('#8e6c46'), clamp(.8 - x / W * .55 - (y - TE) / (H - TE) * .35 + Math.sin(y * .09) * .04, 0, 1));
  const blueAmt = s => {
    const band = sm(.5, .53, s.t) * sm(.72, .69, s.t), motif = sm(.1, .55, Math.sin(Math.asin(s.nx) * 7 + Math.sin(s.t * 40) * 1.3));
    const rings = [[.3, .007], [.48, .006], [.74, .006], [.79, .007]].reduce((a, [c, w]) => a + Math.exp(-(((s.t - c) / w) ** 2)), 0);
    return clamp(band * motif + rings, 0, 1);
  };
  const vaseCol = (x, y) => {
    const s = vase(x, y);
    const por = chain([[-1, hex('#3a404e')], [-.3, hex('#5a6172')], [0, hex('#8a8f98')], [.3, hex('#c7c4bb')], [.65, hex('#e9e2d1')], [1, hex('#f6efdf')]], s.d);
    const blu = chain([[-1, hex('#121a38')], [0, hex('#1f2d66')], [.6, hex('#34509a')], [1, hex('#4a68b0')]], s.d);
    let c = mixc(por, blu, blueAmt(s));
    if (s.d < 0) c = mixc(c, hex('#8a6a46'), sm(.3, .85, s.rf) * .35);
    return c;
  };
  const lemonCol = (x, y) => chain([[-1, hex('#3e3a1a')], [-.25, hex('#7a6a1e')], [.1, hex('#c9a326')], [.5, hex('#efcf38')], [.85, hex('#f8e470')], [1, hex('#fbf0a0')]], lemon(x, y).d);
  const vShadowE = (x, y) => { const u = x - 505, v = y - 612, c = Math.cos(.08), s = Math.sin(.08); return ((u * c - v * s) / 175) ** 2 + ((u * s + v * c) / 26) ** 2; };
  const shadowAmt = (x, y) => (y > TE ? 1 : 0) * (1 - occ(x, y)) * clamp(sm(1, .45, vShadowE(x, y)) * .85 + sm(1, .4, ((x - 668) / 100) ** 2 + ((y - 718) / 14) ** 2) * .9 + Math.exp(-(((x - VX) / 95) ** 2 + ((y - 640) / 8) ** 2)) * .8, 0, 1);
  const M = {}; const mm = (k, f) => M[k] || (M[k] = makeMask(f, Q));
  const O = { tool: 'brush', grain: .22, tooth: 'weave' };
  const profile = (side, c, w, a) => { const S = []; for (let k = 0; k < 4; k++) { const p = []; for (let i = 0; i <= 8; i++) { const t = clamp((k + i / 8) / 4, 0, 1); p.push(VX + side * rv(t), VT + t * VH); } S.push({ k: 'line', p, w, c, a }); } return S; };
  return {
    key: 'oil', name: '青花与柠檬', sub: '油画 · 古典静物的厚与薄', medium: '油画', paper: '#d8c9ab', weave: true,
    counter: { label: '技法', items: [['薄涂底色', '#a8683a'], ['单色底稿', '#4a2e1c'], ['湿接湿', '#6e5d3d'], ['厚涂', '#f6efdf'], ['刮刀', '#c9c9c9'], ['罩染', '#6a4a2a']] },
    idleTool: 'brush',
    steps: [
      { title: '准备材料', tool: '亚麻画布 · 猪鬃笔 · 刮刀 · 松节油', cam: 'tools', focus: ['palette', 'knife', 'brushes'], ann: [], ref: '先看静物',
        text: '油画颜料干得慢，可以在画布上反复调和，还能堆得很厚。用<b>松节油</b>稀释可以薄涂，加<b>调色油</b>颜色更润。<b>猪鬃笔</b>硬，会留下笔痕；<b>刮刀</b>能把颜料像抹黄油一样抹上去。',
        tip: '<span>肥盖瘦：</span>下层颜料少放油，越往上层油越多，画干了才不会开裂。' },
      { title: '薄涂底色', tool: '熟赭 + 松节油 · 大号笔', cam: 'easel', focus: ['subject'], ann: [], gain: ['薄涂底色'], ref: '先看大关系',
        text: '用松节油把<b>熟赭</b>调得很稀，薄薄罩满整张画布。白画布会让每块颜色都显得太暗，有了暖色的<b>底色</b>，明暗和冷暖都更好判断。',
        tip: '<span>要薄：</span>薄到能透出亚麻布的纹理，几分钟就干。',
        build: r => { const m = mm('all', () => 1); return [{ ...O, grain: .35, strokes: brushes(r, { m, cell: 70, w: [70, 100], len: [130, 210], dir: () => -.5 + (r() - .5) * .8, col: () => hex('#a8683a'), a: .3, kind: 'oil', h: 0 }) }]; } },
      { title: '单色底稿', tool: '熟褐 · 小号笔', cam: 'easel', focus: ['subject', 'lemon'], ann: ['axis'], gain: ['单色底稿'], ref: '用一个颜色找明暗',
        text: '用<b>熟褐</b>勾出瓷瓶、柠檬和桌面，再用同一个颜色把暗部铺一遍。先只用一个颜色解决<b>素描关系</b>，之后再想颜色。',
        tip: '<span>就是素描：</span>这一步是用油画笔画的单色素描，前面学的五大调子全用得上。',
        build: r => {
          const m = mm('under', (x, y) => { const v = vase(x, y), l = lemon(x, y), o = 1 - occ(x, y);
            return Math.max(v.a * sm(.25, -.1, v.d) * .85, l.a * sm(.2, -.1, l.d) * .7, shadowAmt(x, y) * .8, y < TE ? o * Math.pow(1 - glow(x, y), 1.2) * .7 : o * .25 * (y - TE) / (H - TE)); });
          const c = '#4a2e1c';
          return [
            { ...O, grain: .15, strokes: [...profile(-1, c, 2.6, .75), ...profile(1, c, 2.6, .75),
              ...arcStrokes(r, VX, VT + 2, 56, 12, 0, Math.PI * 2, { c, a: .7, w: 2.4, pieces: 4 }), ...arcStrokes(r, VX, 640, 90, 16, 0, Math.PI, { c, a: .7, w: 2.4, pieces: 3 }),
              ...arcStrokes(r, LCX, LCY, LRX, LRY, 0, Math.PI * 2, { c, a: .7, w: 2.4, pieces: 5 }), ...sketchLine(r, 0, TE, W, TE, { c, a: .55, w: 2.2, passes: 1 })] },
            { ...O, mask: m, strokes: brushes(r, { m, cell: 26, w: [24, 36], len: [40, 80], dir: () => -.7, col: () => hex('#4a2e1c'), a: .55, kind: 'oil', h: 0 }) }
          ];
        } },
      { title: '背景 · 湿接湿', tool: '熟褐 · 土黄 · 象牙黑', cam: 'easel', focus: ['backdrop', 'lamp'], ann: ['warm', 'cool'], gain: ['湿接湿'], ref: '暗背景里的光',
        text: '古典静物常用深色背景：靠近灯的左上方偏亮偏暖，越往右下越暗。趁颜料还湿，一块接一块地画，让相邻的颜色在画布上直接融在一起，这叫<b>湿接湿</b>。',
        tip: '<span>笔触绕着光：</span>背景的笔触顺着光晕打圈，光感会更自然。',
        build: r => { const m = mm('obg', (x, y) => (1 - occ(x, y)) * sm(TE + 3, TE - 3, y));
          return [{ ...O, mask: m, strokes: brushes(r, { m, box: [0, 0, W, TE + 20], cell: 24, w: [30, 46], len: [50, 100], dir: (x, y) => Math.atan2(y - 170, x - 170) + Math.PI / 2, col: bgCol, kind: 'oil', h: .2 }) }]; } },
      { title: '桌面', tool: '熟赭 · 土黄 · 熟褐', cam: 'easel', focus: ['cloth'], ann: [], ref: '平的面横着画',
        text: '桌面受光的左边暖而亮，往右、往前逐渐变暗。横向用笔，才能表现出桌面是<b>平</b>的。',
        tip: '<span>近实远虚：</span>前面的桌沿颜色更饱和，靠墙的部分更灰。',
        build: r => { const m = mm('otable', (x, y) => (1 - occ(x, y)) * sm(TE - 3, TE + 3, y));
          return [{ ...O, mask: m, strokes: brushes(r, { m, box: [0, TE - 20, W, H], cell: 22, w: [24, 36], len: [60, 110], dir: () => .03, col: tableCol, kind: 'oil', h: .25 }) }]; } },
      { title: '青花瓷瓶', tool: '钛白 · 群青 · 象牙黑', cam: 'still', focus: ['subject', 'lamp'], ann: ['light', 'term'], ref: '白瓷不是白的',
        text: '白瓷不是白色：受光面偏暖黄，背光面偏冷灰蓝。<b>青花</b>纹样也跟着明暗走，暗部的蓝要压深，不能一个蓝色画到底。',
        tip: '<span>先大后小：</span>先把瓶子的明暗大关系铺准，花纹顺着瓶身的弧度走。',
        build: r => {
          const md = mm('vdark', (x, y) => { const v = vase(x, y); return v.a * sm(.25, 0, v.d); }), ml = mm('vlite', (x, y) => { const v = vase(x, y); return v.a * sm(-.1, .12, v.d); });
          const dir = (x, y) => .04 + vase(x, y).nx * .3;
          return [
            { ...O, mask: md, strokes: brushes(r, { m: md, box: [180, 230, 520, 660], cell: 12, w: [12, 18], len: [22, 38], dir, col: vaseCol, kind: 'oil', h: .2 }) },
            { ...O, mask: ml, strokes: brushes(r, { m: ml, box: [180, 230, 520, 660], cell: 11, w: [11, 17], len: [20, 34], dir, col: vaseCol, kind: 'oil', h: .3 }) },
            { ...O, grain: 0, strokes: arcStrokes(r, VX, VT + 3, 44, 8, Math.PI * .05, Math.PI * 1.95, { c: '#17130f', a: .9, w: 7, pieces: 3, j: .6 }) }
          ];
        } },
      { title: '柠檬', tool: '柠檬黄 · 土黄 · 熟褐', cam: 'easel', focus: ['lemon'], ann: ['light', 'dark'], ref: '粗糙的表皮',
        text: '柠檬亮部用<b>柠檬黄</b>加一点白；暗部不加黑，用土黄和熟褐，再带一点绿，颜色才不会脏。笔触绕着柠檬的圆走，颜料比画瓷瓶时更厚。',
        tip: '<span>质感对比：</span>短而厚的笔触画柠檬皮，和光滑的瓷器放在一起，两种质感互相衬托。',
        build: r => { const m = mm('olemon', (x, y) => lemon(x, y).a);
          return [{ ...O, mask: m, strokes: brushes(r, { m, box: [470, 600, 690, 740], cell: 11, w: [13, 19], len: [20, 34], dir: (x, y) => Math.atan2((y - LCY) / LRY, (x - LCX) / LRX) + Math.PI / 2, col: lemonCol, kind: 'oil', h: .55 }) }]; } },
      { title: '投影与环境色', tool: '熟褐 · 群青', cam: 'still', focus: ['cloth', 'subject'], ann: ['shadow', 'refl', 'bounce'], ref: '光滑的东西会映色',
        text: '画出瓷瓶和柠檬在桌面上的<b>投影</b>。瓷器表面光滑，会映出周围的颜色：瓶底有桌面暖褐色的<b>反光</b>，靠近柠檬的一侧还会染上一点黄。',
        tip: '<span>越光滑越明显：</span>瓷器上环境色很清楚，粗糙的柠檬上几乎看不到。',
        build: r => {
          const ms = mm('oshadow', shadowAmt), mr = mm('orefl', (x, y) => { const v = vase(x, y); return v.a * sm(0, -.3, v.d) * sm(.2, .8, v.rf) * .8; });
          const mb = mm('obounce', (x, y) => { const v = vase(x, y); return v.a * (v.d < .3 ? 1 : 0) * Math.exp(-(((x - 455) / 45) ** 2 + ((y - 600) / 45) ** 2)) * .7; });
          return [
            { ...O, mask: ms, strokes: brushes(r, { m: ms, box: [240, 580, 800, 740], cell: 16, w: [18, 26], len: [40, 70], dir: () => .03, col: (x, y) => mixc(tableCol(x, y), hex('#160f0a'), .62), kind: 'oil', h: .15 }) },
            { ...O, mask: mr, strokes: brushes(r, { m: mr, box: [250, 420, 520, 650], cell: 12, w: [10, 16], len: [20, 34], dir: () => .1, col: () => hex('#7a5c40'), kind: 'oil', h: .1 }) },
            { ...O, opacity: .6, mask: mb, strokes: brushes(r, { m: mb, box: [380, 520, 520, 660], cell: 12, w: [10, 16], len: [20, 34], dir: () => 1.4, col: () => hex('#a89040'), kind: 'oil', h: .1 }) }
          ];
        } },
      { title: '厚涂高光', tool: '刮刀 · 钛白', cam: 'easel', focus: ['knife', 'subject'], ann: ['light', 'hl'], gain: ['厚涂', '刮刀'], ref: '堆起来的亮',
        text: '用<b>刮刀</b>挑起不加油的浓稠钛白，在瓷瓶的高光处一刀抹上去；柠檬的亮点用笔尖点厚。颜料堆起来的<b>肌理</b>会在真实的光下反光，这是油画独有的质感。',
        tip: '<span>只在亮处厚：</span>亮部厚、暗部薄。暗部堆厚了会反光发亮，空间就乱了。',
        build: r => {
          const S = [], nxh = Hn[0] / Math.hypot(Hn[0], Hn[2]);
          for (const [t0, t1, w] of [[.33, .47, 9], [.5, .63, 13], [.65, .73, 8]]) { const p = []; for (let i = 0; i <= 6; i++) { const t = lerp(t0, t1, i / 6); p.push(VX + rv(t) * nxh + (r() - .5) * 3, VT + t * VH); } S.push(oilS(p, w, hex('#fbf6ea'), .95, 1)); }
          for (let i = 0; i < 5; i++) { const t = .5 + r() * .13, y = VT + t * VH, x = VX + rv(t) * nxh + (r() - .5) * 18; S.push(oilS([x, y, x + 2, y + 6, x + 1, y + 11], 4 + r() * 3, hex('#f3ead8'), .8, .8)); }
          S.push(oilS([VX - 46, VT + 6, VX - 30, VT - 4, VX - 6, VT - 8], 5, hex('#efe6d2'), .9, .8));
          for (let i = 0; i < 4; i++) { const t = .12 + i * .03, y = VT + t * VH, x = VX + rv(t) * nxh; S.push(oilS([x, y, x + 1, y + 8, x, y + 14], 6, hex('#e9e2d1'), .85, .8)); }
          const hx = LCX + Hn[0] * LRX * .72, hy = LCY + Hn[1] * LRY * .72;
          for (let i = 0; i < 7; i++) { const x = hx + (r() - .5) * 22, y = hy + (r() - .5) * 12; S.push(oilS([x, y, x + 5, y - 2, x + 10, y - 1], 6 + r() * 5, hex(i < 2 ? '#fffbe0' : '#fbe98a'), .95, 1)); }
          for (let i = 0; i < 90; i++) { let x, y, l, k = 0; do { x = LCX + (r() - .5) * LRX * 1.8; y = LCY + (r() - .5) * LRY * 1.8; l = lemon(x, y); k++; } while (l.a < 1 && k < 30); S.push({ k: 'dot', x, y, r: 1 + r() * 1.6, c: l.d > .2 ? '#fff2a0' : '#6a5a18', a: .55 }); }
          for (let i = 0; i < 6; i++) { const x = 40 + i * 70 + r() * 30, y = TE + 6 + r() * 6; S.push(oilS([x, y, x + 30, y + 1, x + 60, y], 7, hex('#a88a5e'), .8, .7, 'butt')); }
          return [{ ...O, tool: 'knife', grain: 0, strokes: S }];
        } },
      { title: '罩染与调整', tool: '透明熟赭 · 调色油', cam: 'overview', focus: ['subject', 'backdrop'], ann: ['light', 'term', 'shadow', 'refl', 'hl'], gain: ['罩染'], ref: '暗部更深更透',
        text: '等颜料干透，用调色油把透明颜色调稀，薄薄地<b>罩染</b>在暗部和背景上，暗部会更深、更透、更有光泽。最后签名。',
        tip: '<span>透明色才能罩：</span>熟赭、群青这类透明颜料适合罩染；钛白不透明，不能拿来罩。',
        build: r => {
          const mg = mm('glaze', (x, y) => { const o = 1 - occ(x, y); return clamp(o * (y < TE ? (1 - glow(x, y)) * .8 : .5 * (y - TE) / (H - TE)) + shadowAmt(x, y) * .5, 0, 1); });
          const mc = mm('cglaze', (x, y) => { const v = vase(x, y); return v.a * sm(.1, -.3, v.d) * .8; });
          return [
            { tool: 'brush', blend: 'multiply', mask: mg, strokes: brushes(r, { m: mg, cell: 50, w: [60, 90], len: [100, 180], dir: () => -.4 + (r() - .5) * .6, col: () => hex('#7a5232'), a: .45, kind: 'oil', h: 0 }) },
            { tool: 'brush', blend: 'multiply', mask: mc, strokes: brushes(r, { m: mc, box: [180, 230, 520, 660], cell: 20, w: [20, 30], len: [40, 70], dir: () => 1.5, col: () => hex('#7a88b8'), a: .4, kind: 'oil', h: 0 }) },
            { tool: 'brush', grain: 0, strokes: signature(640, 930, '#c8a060', 2.4) }
          ];
        } }
    ]
  };
}
