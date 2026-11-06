'use strict';
// 新课共用的器物形状和肤色；LESSON_SPECS 由各画种文件往里添加

/* ================= 12 节新课 ================= */
const CHAMP = t => pchain([[0, .043], [.45, .045], [.6, .04], [.72, .026], [.82, .017], [.93, .016], [.95, .019], [.98, .019], [1, .017]], t);
const PITCHER = t => pchain([[0, .04], [.1, .05], [.45, .055], [.8, .05], [1, .056]], t);
const POT = t => pchain([[0, .045], [.15, .07], [.45, .082], [.75, .07], [.9, .05], [1, .04]], t);
const JUG = t => pchain([[0, .052], [.1, .06], [.45, .065], [.65, .055], [.8, .03], [.92, .018], [1, .019]], t);
const JAR3 = t => pchain([[0, .06], [.1, .068], [.5, .072], [.7, .066], [.82, .05], [.9, .04], [1, .042]], t);
const ROUNDJAR = t => pchain([[0, .045], [.15, .07], [.45, .085], [.75, .07], [.88, .035], [.95, .032], [1, .036]], t);
const BOWL = t => pchain([[0, .035], [.3, .06], [1, .088]], t);
const apple3 = (name, c, R, color) => OBJ(name, [PR.ell(c, R), PR.cap(va(c, [0, R[1] * .85, 0]), va(c, [.004, R[1] + .012, 0]), .0028)], { c: color, ks: .3, shin: 30 }, .005);
const quiet = o => ({ ...o, quiet: true });
function PUMPKIN(name, c, R) {
  const sdf = p => { const q = vs(p, c), th = Math.atan2(q[2], q[0]), g = 1 - Math.abs(Math.sin(5 * th)), fall = clamp(1 - (q[1] / (R * .6)) ** 2, 0, 1); return (sdEll(q, [0, 0, 0], [R, R * .6, R]) + R * .07 * g ** 3 * fall) * .85; };
  const fn = p => p[1] > c[1] + R * .5 ? h01('#5a4a2c') : mixc(h01('#e0641a'), h01('#f2b232'), sm(.38, .66, fbm(p[0] * 70 + 5, p[2] * 70 + p[1] * 50)));
  return OBJ(name, [PR.custom(sdf, c, R), PR.cap(va(c, [0, R * .5, 0]), va(c, [.006, R * .78, .004]), .006)], { c: '#e8801e', ks: .35, shin: 30, fn }, .004);
}
const FLOWERS = (() => {
  const r = rngOf(9), base = at(.07, .18, -.08), tips = [at(-.04, .37, -.06), at(.01, .41, -.075), at(.1, .4, -.08)], heads = [];
  for (const t of tips) for (const f of [1, .78]) { const c = va(base, vm(vs(t, base), f)); for (let k = 0; k < (f === 1 ? 7 : 4); k++) heads.push(PR.sphere(va(c, [(r() - .5) * .028, (r() - .3) * .02, (r() - .5) * .02]), .0065 + r() * .002)); }
  return { stems: tips.map(t => PR.cap(base, t, .0025)), heads };
})();
const LAND_REG = {
  tree: [{ name: '天空', layer: 0 }, { name: '云', layer: 0 }, { name: '远山', layer: 1, outline: 'ridge' }, { name: '树林', layer: 2, outline: 'ridge' }, { name: '田野', layer: 3 }, { name: '小路', layer: 3, outline: 'blob' }, { name: '灌木', layer: 3, outline: 'blob' }, { name: '大树', layer: 4, outline: 'blob' }, { name: '树干', layer: 4, outline: 'blob' }],
  lake: [{ name: '天空', layer: 0 }, { name: '晚霞', layer: 0 }, { name: '太阳', layer: 0, outline: 'blob' }, { name: '远山', layer: 1, outline: 'ridge' }, { name: '对岸树林', layer: 2, outline: 'ridge' }, { name: '湖面', layer: 2 }, { name: '近岸', layer: 3, outline: 'ridge' }, { name: '树', layer: 4, outline: 'blob' }, { name: '树干', layer: 4 }, { name: '芦苇', layer: 4 }],
  wheat: [{ name: '天空', layer: 0 }, { name: '积云', layer: 0, outline: 'blob' }, { name: '远山', layer: 1, outline: 'ridge' }, { name: '远处麦田', layer: 2, outline: 'ridge' }, { name: '小路', layer: 3, outline: 'blob' }, { name: '近处麦田', layer: 3 }, { name: '', layer: 3 }, { name: '柏树', layer: 4, outline: 'blob' }]
};
const TX = (text, tip, ref, title) => ({ text, tip: tip && `<span>${tip[0]}</span>${tip[1]}`, ...(ref ? { ref } : {}), ...(title ? { title } : {}) });
const SKIN = { skin: [.86, .66, .55], cheek: [.84, .52, .46], lip: [.7, .37, .35], hair: [.22, .15, .11], iris: [.22, .15, .12], chin: [.74, .6, .56], shirt: [.36, .42, .5] };
const SKIN_WARM = { ...SKIN, skin: [.84, .6, .44], cheek: [.82, .46, .36], chin: [.66, .5, .42], shirt: [.16, .13, .11], hair: [.14, .1, .08] };
const LESSON_SPECS = [];
