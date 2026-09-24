"""Local browser regression fixture; business APIs are mocked, no production requests."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.split('?')[0] == '/':
            html = (ROOT / 'app/screen/view/liuyancj/index.html').read_text()
            header = '''<!doctype html><meta charset="utf-8"><title>留言弹幕抽奖 · 隔离预览</title>
<link rel="stylesheet" href="/static/css/screen/style.css"><script src="/static/js/jquery.2.2.4.js"></script>
<script src="/static/js/require.js"></script><script src="/tests/liuyancj-danmaku/harness.js"></script>
<style>body{background:radial-gradient(ellipse at top,#20395b,#111928);}.header{text-align:center;color:white;font-size:26px;padding-top:24px}.full-main{height:800px}</style>
<div class="pc-box"><div class="full-main"><div class="main-box"><header class="header">现场留言 · 幸运时刻</header>'''
            html = html.replace("{include file='common/header' /}", header)
            html = re.sub(r'\{if !empty.*?\{/if\}', '', html, flags=re.S)
            html = html.replace("{include file='common/footer' /}", '''</div><div class="fulldmBox"></div></div></div>
<script id="fulldm-tpl" type="text/html">{{data.nickname}}：{{data.content}}</script>
<script>function fitStage(){const zoom=innerHeight/800;$('.full-main').css({zoom:zoom,width:innerWidth/zoom});}addEventListener('DOMContentLoaded',fitStage);addEventListener('resize',fitStage);</script>''')
            data = html.encode()
            self.send_response(200); self.send_header('Content-Type','text/html; charset=utf-8'); self.end_headers(); self.wfile.write(data)
        else:
            super().do_GET()
    def translate_path(self, path):
        path = path.split('?')[0].lstrip('/')
        return str((ROOT / 'public' / path) if path.startswith('static/') else ROOT / path)

if __name__ == '__main__':
    print('Preview: http://127.0.0.1:8766 (mock APIs only)', flush=True)
    ThreadingHTTPServer(('127.0.0.1',8766), Handler).serve_forever()
