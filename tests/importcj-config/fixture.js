/* Render the real configuration templates with synthetic data and inert upload widgets.
 * This small test renderer is NOT a PHP/ThinkPHP compatibility or server-save test. */
(async function () {
    'use strict';
    var common = '/app/common/tpl/web/themes/default/common/';
    var query = new URLSearchParams(location.search), mode = query.get('mode') === 'web' ? 'web' : 'activity';
    var entry = mode === 'web' ? '/app/web/view/hdconfig/importcj/index.html' : '/app/hdmanage/view/configimportcj/index.html';
    var fields = ['座位号', '姓名', '部门', '编号'].map(function (fieldname) {
        return { fieldname: fieldname, fieldcolor: '#223344', fieldsecret: '2', lefthand: 1, righthand: 1 };
    });
    var config = {
        title: '配置检查', bgtype: '1', bgimg: '', bgvideo: '', bgmusicoff: '2', bgmusic: '', openstatus: '1',
        iscjingmusic: 'draw.mp3', iscjendmusic: 'end.mp3', autoscroll: '1', fieldconfig: fields,
        styleconfig: {
            flytype: query.get('flytype') || '1', flysphereballw: 1234, flyspherespeed: 88,
            danmakudensity: 'dense', danmakucolormode: 'fixed', color: '#123456', danmakucolor: '#58e6ff',
            resultmainfield: '2', resultextra1: '1', resultextra2: '3', resultextra3: '4',
            resultcardmode: 'custom', resultcardcolor: '#abcdef', resultfieldscale1: 85,
            topbg: 'top.png', prizebg: 'prize.png', bottombg: 'bottom.png', btn: 'button.png',
            hidevideo: 'start.mp4', baozhavideo: 'end.mp4', listname: '历史名单'
        }
    };
    function escape(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
            return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
        });
    }
    function input(name, value) {
        return '<input class="form-control" name="' + escape(name) + '" value="' + escape(value) + '">';
    }
    var env = {
        config: config, hdid: 1, gametype: 'importcj', realhdid: mode === 'activity',
        styles: ['随机滚动', '单个飞出', '矩阵', '球体'].map(function (name, i) {
            return { val: String(i + 1), name: name, img: '/static/images/sys/style/importcj/' + (i + 1) + '.jpg' };
        }),
        isset: function (x) { return x != null; }, empty: function (x) { return !x; },
        in_array: function (x, a) { return a.indexOf(x) >= 0; },
        max: Math.max, min: Math.min, intval: function (x) { return parseInt(x, 10); },
        tomedia: function (x) { return x; }, goopenscreen: function () { return '#'; },
        tpl_color: input, tpl_audio: input, tpl_video: input, tpl_image_one: input,
        tpl_switch: function (name, value) { return '<input type="hidden" name="' + escape(name) + '" value="' + escape(value) + '"><span>模拟开关：' + escape(value) + '</span>'; },
        entries: function (value) { return Array.isArray(value) ? value.map(function (v, i) { return [i, v]; }) : Object.entries(value); },
        escape: escape
    };
    function expression(value) {
        return value.replace(/request\(\)->realhdid/g, 'realhdid').replace(/\$(\w+)/g, '$1').replace(/'\s*\.\s*\(/g, "' + (");
    }
    async function expand(source) {
        var re = /\{include file=['"]\$Wpath\/common\/([^'"]+)['"]\s*\/?\}/g;
        var out = '', cursor = 0, match;
        while ((match = re.exec(source))) {
            out += source.slice(cursor, match.index);
            var response = await fetch(common + match[1] + '.html');
            if (!response.ok) throw new Error('Missing template ' + match[1]);
            out += await expand(await response.text());
            cursor = re.lastIndex;
        }
        return out + source.slice(cursor);
    }
    function render(source) {
        var re = /\{(?:foreach\b|\/foreach|if\b|elseif\b|else\s*\/?|\/if|:|\$)[\s\S]*?\}/g;
        var code = 'var out="";\n', cursor = 0, match;
        while ((match = re.exec(source))) {
            code += 'out+=' + JSON.stringify(source.slice(cursor, match.index)) + ';\n';
            var token = match[0].slice(1, -1);
            if (token.indexOf('foreach ') === 0) {
                var loop = token.match(/^foreach (.+) as \$(\w+)\s*=>\s*\$(\w+)$/);
                if (!loop) throw new Error('Unsupported fixture loop: ' + token);
                code += 'for(var ['+loop[2]+','+loop[3]+'] of entries('+expression(loop[1])+')){\n';
            } else if (token === '/foreach' || token === '/if') code += '}\n';
            else if (token.indexOf('if ') === 0) code += 'if('+expression(token.slice(3))+'){\n';
            else if (token.indexOf('elseif ') === 0) code += '}else if('+expression(token.slice(7))+'){\n';
            else if (/^else/.test(token)) code += '}else{\n';
            else if (token[0] === ':') code += 'out+=('+expression(token.slice(1))+') ?? "";\n';
            else code += 'out+=escape('+expression(token)+');\n';
            cursor = re.lastIndex;
        }
        code += 'out+=' + JSON.stringify(source.slice(cursor)) + ';return out;';
        return Function.apply(null, Object.keys(env).concat(code)).apply(null, Object.values(env));
    }
    try {
        var source = await (await fetch(entry)).text();
        source = source.slice(source.indexOf('<form'), source.indexOf('</form>') + 7);
        var html = render(await expand(source)).replace(/\/static\//g, '/public/static/');
        window.fixtureUploadCalls = 0;
        window.tpl_image_one = function () { window.fixtureUploadCalls++; };
        $('#preview').html(html);
        $('#formBox').on('submit', function (event) { event.preventDefault(); });
        // Use the production serializer against actual jQuery serializeArray, without loading business APIs.
        var webcore = await (await fetch('/public/static/js/webcore.js')).text();
        var body = webcore.slice(webcore.indexOf('serializeObject: function (obj) {') + 'serializeObject: function (obj) {'.length);
        body = body.slice(0, body.indexOf('\n\t\t},'));
        window.fixtureSerialize = new Function('obj', body);
        $(function () { window.fixtureReady = { mode: mode, flytype: config.styleconfig.flytype }; });
    } catch (error) {
        window.fixtureError = String(error.stack || error);
        document.getElementById('preview').textContent = window.fixtureError;
    }
})();
