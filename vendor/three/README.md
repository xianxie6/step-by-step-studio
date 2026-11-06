# three.js 0.160.0（本地打包）

`three-0.160.0.min.js` 是 three.js 和 OrbitControls 打成的一个普通脚本，加载后挂到全局 `THREE`、`OrbitControls`。
做成普通脚本而不是 ES 模块，是为了直接双击 `index.html` 也能打开（浏览器不允许从 file:// 加载模块）。

重新生成：

```bash
npm i three@0.160.0 esbuild
# entry.js：
#   import * as THREE from 'three';
#   import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
#   window.THREE = THREE; window.OrbitControls = OrbitControls;
npx esbuild entry.js --bundle --minify --format=iife --legal-comments=eof --outfile=three-0.160.0.min.js
```
