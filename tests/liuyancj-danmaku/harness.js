/* Only for the local fixture served by serve.py. No real business requests. */
window.errors = [];
addEventListener('error', function (e) { errors.push(e.message); });
addEventListener('unhandledrejection', function (e) { errors.push(String(e.reason)); });
window.XCV3Config = {gametype: 'liuyancj', hdid: 'isolated-danmaku', rhdid: 'mock'};
window.calls = []; window.effects = []; window.pendingReads = []; window.holdReads = false;
window.nextDrawFails = false;
window.testWinners = {A: [1, 2, 3].map(function (id) { return {recordid: id, nickname: '记录用户 ' + id}; }), B: []};
window.demoMessages = ['今天一定要中奖！', '和同事一起留下难忘的夜晚', '现场气氛太棒了 🎉', '好运正在向我走来', '为每一份努力喝彩', '谢谢有你，一路同行', '这份礼物我想带回家', '下一位幸运儿就是我'];
window.testPrizes = [
    {id: 'A', prizenum: 10, onceout: 1, prizename: '幸运礼盒', awardname: '三等奖', prizeimg: '/static/images/sys/prizeimg.png'},
    {id: 'B', prizenum: 5, onceout: 1, prizename: '惊喜大奖', awardname: '二等奖', prizeimg: '/static/images/sys/prizeimg.png'}
];
require.config({baseUrl: '/static/js', paths: {keyboard: 'keyboard/keyboard.min', template: 'template/template', danmuku: 'screenjs/danmuku', jquerytrans: 'screenjs/jquery.transit.min'}});
define('jquery', [], function () { return jQuery; });
define('screensocket', [], function () { return {init: function (p) { window.socketCallback = p.onmessage; }}; });
define('layerBox', [], function () { return {showMsg: function (m) { effects.push(m); }, showConfirm: function (t, m, b, fn) { fn(); }}; });
define('screencore', [], function () {
    return {
        ajaxSubmit: function (url, data) {
            calls.push({url: url, data: data});
            return new Promise(function (resolve) {
                var msg = {}, code = 0;
                if (/initdata$/.test(url)) msg = {prizelist: testPrizes, fromtype: '1', total: 24,
                    list: Array.from({length: 24}, function (_, i) { return {id: String(i + 1), type: '1', nickname: ['小陈', '可可', '星辰', '晨光'][i % 4], content: demoMessages[i % 8]}; })};
                else if (/ajaxlucker$/.test(url)) {
                    msg = {list: testWinners[data.prizeid].map(function (x) { return Object.assign({}, x); })};
                    if (holdReads) { pendingReads.push(function () { resolve({code: 0, msg: msg}); }); return; }
                } else if (/savelucker$/.test(url)) {
                    if (nextDrawFails) { nextDrawFails = false; code = 1; msg = '模拟接口失败'; }
                    else {
                        var list = Array.from({length: data.selnum}, function (_, i) { return {recordid: 100 + testWinners[data.prizeid].length + i, nickname: '后端中奖用户 ' + (i + 1), content: '这条中奖留言由接口返回 ✨'}; });
                        testWinners[data.prizeid].push.apply(testWinners[data.prizeid], list);
                        msg = {list: list, luckerids: list.map(function (x) { return x.recordid; })};
                    }
                } else if (/dellucker$/.test(url)) testWinners[data.prizeid] = testWinners[data.prizeid].filter(function (x) { return x.recordid != data.recordid; });
                else if (/delalllucker$/.test(url)) testWinners[data.prizeid] = [];
                setTimeout(function () { resolve({code: code, msg: msg}); }, 25);
            });
        },
        emoToimg: function (value) { return value; }, hideFootAndQr: function () {},
        bgmusicpause: function () { effects.push('bgmusicpause'); }, bgmusicplay: function () { effects.push('bgmusicplay'); },
        sendLuckerTpl: function (data, cb) { effects.push('sendLuckerTpl'); cb(); }, connectsocket: function () {},
        sendMsg2frame: function () {}, sortBy: function () { return function () { return 0; }; }
    };
});
