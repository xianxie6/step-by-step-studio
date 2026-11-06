#!/usr/bin/env python3
"""重新生成 fonts/ 里的本地字体。

扫描 index.html、css/、js/ 里出现过的所有字符，从 Google Fonts 下载完整字体，
裁剪成只含这些字的 woff2。课程里加了新的字之后运行一次：

    pip3 install fonttools brotli
    python3 tools/subset_fonts.py
"""
import pathlib, re, subprocess, sys, tempfile, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
CSS_URL = ('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700'
           '&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@700;900')

def used_chars():
    files = [ROOT / 'index.html', *ROOT.glob('css/*.css'), *ROOT.glob('js/**/*.js')]
    text = ''.join(f.read_text(encoding='utf-8') for f in files)
    chars = {c for c in text if ord(c) > 127} | {chr(i) for i in range(32, 127)}
    return ''.join(sorted(chars | set('，。、；：？！“”‘’（）《》—…·「」【】–')))

def main():
    # 不带浏览器标识请求时，Google Fonts 给的是每个字重一个完整的 ttf
    css = urllib.request.urlopen(CSS_URL).read().decode()
    faces = re.findall(r"font-family: '([^']+)';.*?font-weight: (\d+);.*?url\(([^)]+)\)", css, re.S)
    out = ROOT / 'fonts'; out.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        chars = pathlib.Path(tmp, 'chars.txt'); chars.write_text(used_chars(), encoding='utf-8')
        for family, weight, url in faces:
            name = f"{family.replace(' ', '')}-{weight}"
            ttf = pathlib.Path(tmp, name + '.ttf')
            print('下载', name); urllib.request.urlretrieve(url, ttf)
            subprocess.run([sys.executable, '-m', 'fontTools.subset', str(ttf), f'--text-file={chars}',
                            '--flavor=woff2', '--layout-features=*', f'--output-file={out / (name + ".woff2")}'], check=True)
    print('完成：', len(faces), '个字体文件已写入 fonts/')

if __name__ == '__main__':
    main()
