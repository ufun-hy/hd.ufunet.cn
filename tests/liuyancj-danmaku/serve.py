"""Local browser regression fixture; business APIs are mocked, no production requests."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import re
import json
from urllib.parse import urlparse, parse_qs

ROOT = Path(__file__).resolve().parents[2]
def render_danmaku(config):
    """Evaluate only this checked-in template's server tags; keep art-template tags intact."""
    source = (ROOT / 'app/screen/view/common/footer_fulldm.html').read_text()
    def expression(expr):
        expr = expr.strip().removesuffix('/').strip()
        expr = expr.replace('!empty($dmconfig)', 'True')
        expr = re.sub(r"\$dmconfig\['([^']+)'\](?:\?\?('.*?'|\d+))?",
                      lambda m: repr(config.get(m[1], (m[2] or '').strip("'"))), expr)
        expr = re.sub(r"'(\d+)'", r"\1", expr)
        return eval(expr.replace('&&', ' and ').replace('||', ' or '), {'__builtins__': {}}, {})
    active, stack, output, pos = True, [], [], 0
    pattern = r"(?<!\{)\{(if [^{}]+|elseif [^{}]+|else(?: /)?|/if|\$dmconfig[^{}]+)\}(?!\})"
    for m in re.finditer(pattern, source):
        if active: output.append(source[pos:m.start()])
        tag = m[1]
        if tag.startswith('if '):
            condition = bool(expression(tag[3:]))
            stack.append([active, condition]); active = active and condition
        elif tag.startswith('elseif '):
            parent, taken = stack[-1]
            condition = not taken and bool(expression(tag[7:]))
            active = parent and condition; stack[-1][1] = taken or condition
        elif tag.startswith('else'):
            parent, taken = stack[-1]; active = parent and not taken; stack[-1][1] = True
        elif tag == '/if': active = stack.pop()[0]
        elif active: output.append(str(expression(tag)))
        pos = m.end()
    output.append(source[pos:])
    assert not stack
    return ''.join(output)

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
            params = parse_qs(urlparse(self.path).query)
            config = dict(dmtype='1', dmrolltype='1', dmpos='1', dmspeed='2', ismiji='1',
                          needavatar='1', neednickname='1', needbg='2', bgcolortype='1',
                          bgcolor='#9b2537', fontcolortype='1', fontcolor='#ffdf87', fontsize='32',
                          vwidth='270', clickdel='2', hoverstop='2', opendm='1', isloop='1', loadhistory='2')
            for key in config:
                if key in params: config[key] = params[key][0]
            footer = '</div>' + render_danmaku(config) + '</div></div>'
            footer += '<script>window.fixtureConfig=' + json.dumps(config) + ';'
            footer += "require(['fulldm'],function(f){setTimeout(function(){f.init($('.fulldmBox'),fixtureConfig);}," + str(int(params.get('configDelay', ['0'])[0])) + ");});</script>"
            footer += "<script>function fitStage(){const zoom=innerHeight/800;$('.full-main').css({zoom:zoom,width:innerWidth/zoom});}addEventListener('DOMContentLoaded',fitStage);addEventListener('resize',fitStage);</script>"
            html = html.replace("{include file='common/footer' /}", footer)
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
