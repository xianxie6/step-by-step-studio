'use strict';
// 课程登记：把所有课程汇总成 DEFS，按画种排出 COURSES

for (const sp of LESSON_SPECS) {
  if (sp.objects) {
    const main = sp.objects[0], hd = main.marks;
    sp.annS = hd ? va(main.marks.top, [0, -.118, 0]) : main.b[0]; sp.annR = hd ? .09 : Math.min(main.b[1] * .75, .12);
  }
}
const DEFS = { sketch: BASE.sketch, gouache: BASE.gouache, oil: BASE.oil };
Object.assign(BASE.sketch, { mk: 'sketch', kind: 'still', level: '入门', backdrop: '#4a4a4c', cloth: '#bdb6aa' });
Object.assign(BASE.gouache, { mk: 'gouache', kind: 'still', level: '入门', backdrop: '#7d8470', cloth: '#6f86a3' });
Object.assign(BASE.oil, { mk: 'oil', kind: 'still', level: '入门', backdrop: '#2e2822', cloth: '#7a5f3e' });
for (const sp of LESSON_SPECS) DEFS[sp.key] = genericDef(sp);
const COURSES = { sketch: ['sketch', 'sk-geo', 'sk-bowl', 'sk-land', 'sk-head'], gouache: ['gouache', 'gc-teapot', 'gc-bottle', 'gc-lake', 'gc-head'], oil: ['oil', 'oil-jug', 'oil-pumpkin', 'oil-wheat', 'oil-rembrandt'] };
