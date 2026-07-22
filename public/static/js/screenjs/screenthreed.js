define('screenthreed', ['screencore', 'layerBox', 'template', 'keyboard', 'snabbt'], function (screencore, layerBox, template, keyboardJS) {
    var screenthreed = {
        qdusers: [],
        oldloaded: false,
        newqdusers: [],
        maxid: 0,
        avatartype: Threeconfig.avatartype,
        animations: Threeconfig.animations,
        countDownAnimations: [],
        tempAnimations: Threeconfig.animations,
        stageObj: $(".three3d ul"),
        shape: '',
        prevshape: '',
        changeStartTime: 0,
        defaultAvatar: Threeconfig.defaultAvatar,
        ajaxtime: Threeconfig.ajaxtime,
        loopTime: Threeconfig.loopTime,
        shapeTime: 15e3,
        showCount: false,
        shapeCount: 0,
        Utils: {},
        Stage: {},
        Control: {},
        Card: {},
        wall: {},
        sphere: {},
        wall2: {},
        cylinder: {},
        cube: {},
        cube2: {},
        screw: {},
        deg: function (o) {
            return Math.PI / 180 * o
        },
        checkloaded: null,
        textloaded: false,
        textshapes: [],
        logoloaded: false,
        logoshapes: [],
        djsendAnimations: [],
        posfrom: [
            [800, -800, 3e3],
            [800, 800, 3e3],
            [-800, 800, 3e3],
            [-800, -800, 3e3],
        ],
        init: function () {
            var self = this;
            self.Configinit();
            self.Utils = self.makeUtils();
            self.Stage = self.makeStage();
            self.Control = self.makeControl();
            self.wall = self.makeWall();
            self.sphere = self.makeSphere();
            self.wall2 = self.makeWall2();
            self.sphere = self.makeSphere();
            self.cylinder = self.makeCylinder();
            self.cube = self.makeCube();
            self.cube2 = self.makeCube2();
            self.screw = self.makeScrew();
            self.tours = self.makeTours();
            self.signRender = template('sign-tpl');
            self.logoBox = self.makeLogoImg();
            self.getolduser();
            self.checkloaded = setInterval(function () {
                if (self.oldloaded && self.logoloaded && self.textloaded) {
                    clearInterval(self.checkloaded);
                    self.Card = self.makeCard();
                    self.changeMode();
                    setTimeout(function () {
                        self.getNewuser();
                        self.showUser();
                    }, 3000);
                }
            }, 50)
        },
        Configinit: function () {
            var e = this;
            if (e.animations.length > 0) {
                var shapes = Threeconfig.shapes;
                for (var jj = 0; jj < shapes.length; jj++) {
                    var shapetype = shapes[jj].shape || '';
                    if (shapetype == 'text') {
                        e.textshapes.push(shapes[jj]);
                    } else if (shapetype == 'logo') {
                        e.logoshapes.push(shapes[jj]);
                    }
                }
            }
            if (Threeconfig.djsCount > 0 && Threeconfig.djsOn == 1) {
                e.countDownAnimations = [];
                for (var c = Threeconfig.djsCount; c > 0; c--) {
                    e.countDownAnimations.push('countDown' + c);
                    e['countDown' + c] = e.makeCDown(c);
                }
                keyboardJS.bind('space', function () {
                    if (e.showCount) {
                        return layerBox.showMsg('倒计时进行中，请勿重复点击', 1e3);
                    }
                    if (e.isShowOnlyLogo) {
                        layerBox.showConfirm('温馨提醒', '倒计时已结束，您确定要重新播放图形列表动画吗？', ['确定', '取消'], function () {
                            e.isShowOnlyLogo = false;
                            e.animations = e.tempAnimations;
                            if (e.bgmusicisPlaying == '1') {
                                $('#bgmusic')[0].play();
                                screencore.getdom('.openmusic').attr('data-open', '1').find('div').addClass('display-none');
                            }
                            e.changeMode(false, '1');
                        });
                    } else {
                        e.startCountDown();
                    }
                });
            }

            e.makeAllImg(function () {
                e.logoloaded = true;
                e.makeAllText(function () {
                    var endlogoani = Threeconfig.djsEndLogo.ani || '1';
                    var endlogo = Threeconfig.djsEndLogo.shapelogo || '';
                    if (Threeconfig.djsCount > 0 && Threeconfig.djsOn == 1 && endlogoani == '2' && endlogo != '') {
                        var endlogoconfig = Object.assign(Threeconfig.djsEndLogo, { shapename: 'logoend', isend: '1' });
                        endlogoconfig.shapelogo = e.LogoUrl(endlogoconfig.shapelogo);
                        e.getLogoDots(endlogoconfig, function (dots) {
                            if (dots.length === 0 || dots === 'fail') {
                                layerBox.showMsg('倒计时结束logo图片加载出现异常，请刷新重试', -1);
                                clearInterval(e.checkloaded);
                            } else {
                                e[endlogoconfig.shapename] = e.makeLogo(dots, endlogoconfig);
                                e.djsendAnimations.push(endlogoconfig.shapename);
                                e.textloaded = true;
                                $("#threedCanvas").remove();
                            }
                        })
                        var enterlogo = Threeconfig.djsEndLogo.enterlogo || '2';
                        enterlogo == '1' && keyboardJS.bind('enter', function () {
                            e.showDjsEndShape();
                        });
                    } else {
                        e.textloaded = true;
                        $("#threedCanvas").remove();
                    }
                });
            });
        },
        makeAllImg: function (callback) {
            var self = this, one = self.logoshapes.shift();
            if (one) {
                one.shapelogo = self.LogoUrl(one.shapelogo);
                self.getLogoDots(one, function (dots) {
                    if (dots.length === 0 || dots === 'fail') {
                        layerBox.showMsg('部分图形内的图片加载出现异常，请刷新重试', -1);
                        clearInterval(self.checkloaded);
                    } else {
                        self[one.shapename] = self.makeLogo(dots, one);
                        self.makeAllImg(callback);
                    }
                })
            } else {
                callback();
            }
        },
        makeAllText: function (callback) {
            var self = this, one = self.textshapes.shift();
            if (one) {
                self.getTextdots(one, function (dots) {
                    self[one.shapename] = self.makeText(dots, one);
                    self.makeAllText(callback);
                });
            } else {
                callback();
            }
        },
        getLogoDots: function (imgobj, callback) {
            var shapetype = imgobj.shapetype || '1', isstable = imgobj.shapestable || '2', b = document.getElementById('threedCanvas');
            if (isstable == '1') {
                return callback && callback(imgobj.shapelogo)
            }
            var jd = shapetype == '1' ? 6 : 5;
            var g = 360 * jd;
            var c = 120 * jd;
            b.width = g;
            b.height = c;
            ctx = b.getContext('2d', { willReadFrequently: true });
            width = b.width;
            height = b.height;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            var logo = new Image();
            logo.src = imgobj.shapelogo;
            logo.onload = function () {
                var n;
                var G;
                var I = 0;
                var K = 0;
                var D = logo.width / logo.height;
                if (D > 3) {
                    G = g;
                    n = g / D;
                    K = (c - n) / 2
                } else {
                    n = c;
                    G = n * D;
                    I = (g - G) / 2
                }
                ctx.drawImage(logo, I, K, G, n);
                var imgdata = ctx.getImageData(0, 0, width, height).data;
                ctx.clearRect(0, 0, g, c);
                var dots = [];
                if (shapetype == '1') {
                    var imgjd = +imgobj.jd;
                    if (imgjd <= 0) {
                        imgjd = 13;
                    }
                    for (var x = 0; x < width; x += imgjd) {
                        for (var y = 0; y < height; y += imgjd) {
                            var i = (y * width + x) * 4;
                            if (imgdata[i + 3] > 128) {
                                dots.push({
                                    x: x - width / 2,
                                    y: y - height / 2,
                                });
                            }
                        }
                    }
                } else {
                    var j = [];
                    for (var o = 0; o < height; o++) {
                        for (var s = 0; s < width; s++) {
                            if (s == 0) {
                                j.push([0])
                            } else {
                                j[o].push(0)
                            }
                        }
                    }
                    for (var o = 0; o < height; o += 1) {
                        for (var s = 0; s < width * 4; s += 4) {
                            var p = (o * width * 4) + s;
                            var C = imgdata[p]
                                , m = imgdata[p + 1]
                                , k = imgdata[p + 2]
                                , i = imgdata[p + 3];
                            if (C != 0 || m != 0 || k != 0 || i != 0) {
                                j[o][s / 4] = 1
                            }
                        }
                    }
                    var q = jd;
                    var b = height / q
                        , h = width / q;
                    var F = [];
                    for (var o = 0; o < b; o++) {
                        for (var s = 0; s < h; s++) {
                            var x = 0;
                            var H = o * q
                                , J = s * q;
                            var v = 0;
                            j[H][J] && v++,
                                j[H + 1][J] && v++,
                                j[H][J + 1] && v++,
                                j[H + 1][J + 1] && v++;
                            if (v > 2) {
                                x = 1
                            }
                            if (s == 0) {
                                F.push([x])
                            } else {
                                F[o].push(x)
                            }
                        }
                    }
                    var l = [];
                    for (var o = 0; o < height / q; o++) {
                        for (var s = 0; s < 100; s++) {
                            if (s == 0) {
                                l.push([F[o][s + 20]])
                            } else {
                                l[o].push(F[o][s + 20])
                            }
                        }
                    }
                    var r = function (a, c, d) {
                        if ((a + d) < b && (c + d) < h) {
                            for (var f = d - 1; f >= 0; f--) {
                                for (var e = d - 1; e >= 0; e--) {
                                    if (F[a + e][c + f] != 1) {
                                        return false
                                    }
                                }
                            }
                            return true
                        } else {
                            return false
                        }
                    }
                    var u = 0;
                    for (var s = 0; s < h - 1; s++) {
                        for (var o = 0; o < b - 1; o++) {
                            if (F[o][s] == 1) {
                                if (u == 0) {
                                    u = s
                                }
                                var A = 1;
                                for (var t = 2; t <= 8; t++) {
                                    if (r(o, s, t)) {
                                        A = t
                                    } else {
                                        break
                                    }
                                }
                                if (A > 1 && A < 10) {
                                    for (var w = 0; w < A; w++) {
                                        for (var B = 0; B < A; B++) {
                                            F[o + w][s + B] = A * 10 + 1
                                        }
                                    }
                                    F[o][s] = A
                                }
                            }
                            if (F[o][s] >= 1 && F[o][s] < 10) {
                                dots.push({
                                    t: F[o][s],
                                    x: s * 6 - 3 * h,
                                    y: o * 6 - h
                                })
                            }
                        }
                    }
                }
                callback && callback(dots)
            };
            logo.onerror = function () {
                callback && callback('fail')
            };
        },
        makeLogo: function (e, one) {
            var self = this, shapetype = one.shapetype || '1', isstable = ("string" == typeof e), isrotatable = one.shaperotate || '1';
            var o = [];
            if (isstable) {
                o.push({
                    position: [0, 0, 0],
                    rotation: [0, 0, 0],
                });
            } else {
                if (shapetype == '2') {
                    e = self.shuffleArr(e);
                }
                var len = e.length;
                for (var a = 0; a < len; a++) {
                    var dot = {
                        position: [e[a].x, e[a].y, 0],
                        rotation: [0, 0, 0],
                    };
                    if (shapetype == '2') {
                        dot.type = e[a].t;
                    }
                    o.push(dot);
                }
            }
            return {
                card: {
                    count: o.length,
                    allCard: o,
                    perspective: 2e3,
                    src: (isstable ? one.shapelogo : '')
                },
                stage: function (c) {
                    var b = function () {
                        if (!one.isend) {
                            if (isrotatable === '2') {
                                self.stageObj.snabbt({
                                    fromRotation: [0, 0, 0],
                                    rotation: [0, 0, 0],
                                    duration: 0,
                                    delay: self.shapeTime,
                                    complete: function () {
                                        c();
                                    }
                                });
                            } else {
                                self.stageObj.snabbt({
                                    fromRotation: [0, 0, 0],
                                    position: [0, 0, 0],
                                    rotation: [0, Math.PI * 2, 0],
                                    duration: self.shapeTime * 0.2,
                                    delay: self.shapeTime * 0.25
                                }).snabbt({
                                    position: [0, 0, 0],
                                    rotation: [0, Math.PI * 4, 0],
                                    delay: self.shapeTime * 0.2,
                                    duration: self.shapeTime * 0.25,
                                }).snabbt({
                                    fromRotation: [0, 0, 0],
                                    rotation: [0, 0, 0],
                                    duration: self.shapeTime * 0.1,
                                    complete: function () {
                                        c()
                                    }
                                });
                            }
                        }
                    }
                    return b;
                }
            }
        },
        Build: function () {
            var self = this;
            var o = self[self.shape];
            if (o) {
                var i = o.stage,
                    n = o.card,
                    e = function () { };
                if (i && n) {
                    if ("function" == typeof i) {
                        e = i(self.Control.next);
                    } else {
                        e = self.Stage.default(i, self.Control.next);
                    }
                    self.Card.reset();
                    var shapeInType = self.shape.indexOf('countDown') != -1 ? '-1' : (Threeconfig.shapes[self.shapeCount].shapein || '1');
                    if (self.shape.indexOf('logoend') != -1) {
                        shapeInType = Threeconfig.djsEndLogo.shapein || '1';
                    }
                    for (var r = 0, b = 0; b < n.count; b++) {
                        var m = self.Card.next();
                        if (m) {
                            m.css({ opacity: 0 });
                            m.addClass("activate");
                            var q = n.allCard[b];
                            q.type && m.addClass('dot' + q.type);
                            Object.keys(q).forEach(function (o) {
                                m.data("data-" + o, q[o])
                            });
                            var c = {
                                rotation: q.rotation,
                                position: q.position,
                                scale: q.scale || [1, 1],
                                complete: function () {
                                    ++r;
                                    if (r == n.count) {
                                        self.changeStartTime = Date.now();
                                        if ($.inArray(self.shape, Threeconfig.transformShape) != -1 && $.inArray(self.shape, ['wall', 'wall2']) === -1) {
                                            self.logoBox.showLogo();
                                        }
                                        e();
                                    }
                                }
                            };
                            if (self.shape.indexOf('countDown') == -1) {
                                c.fromPosition = self.startEndPosition(shapeInType);
                                c.fromRotation = [0, 0, 0];
                                c.fromScale = [0, 0];
                                c.fromOpacity = 0;
                                c.opacity = 1;
                                c.duration = self.isShowOnlyLogo ? Math.random() * 1000 : Math.random() * 3000;
                                c.easing = 'easeOut';
                                c.delay = Math.random() * 600;
                            } else {
                                c.fromPosition = self.startEndPosition(shapeInType);
                                c.fromOpacity = 0;
                                c.opacity = 1;
                                c.duration = 500;
                                c.easing = 'easeOut';
                                c.delay = Math.random() * 200;
                            }
                            q.skew || (q.skew = [0, 0]), c.skew = q.skew, m.snabbt(c)
                        }
                    }

                }
            }
        },
        getTextdots: function (textobj, callback) {
            var text = textobj.shapetext || '', shapetype = textobj.shapetype || '1';
            if ($.trim(textobj.shapetext) == '') {
                text = '文字';
            }
            var i = document.getElementById('threedCanvas');
            var width = shapetype === '1' ? $('.main-box').width() : 240;
            var height = shapetype === '1' ? $('.main-box').height() : 80;
            i.width = width;
            i.height = height;
            ctx = i.getContext('2d', { willReadFrequently: true });
            var dots = [];
            if (shapetype == '1') {
                var fontSize = (text.length < 5 ? 330 : (text.length == 5 ? 280 : (text.length == 6 ? 230 : (text.length == 7 ? 200 : 170))));
                ctx.font = fontSize + "px bold";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(text, width / 2, height / 2);
                var imgdata = ctx.getImageData(0, 0, width, height).data;
                ctx.clearRect(0, 0, width, height);
                var textjd = +textobj.jd;
                if (textjd <= 0) {
                    textjd = 13
                }
                for (var x = 0; x < width; x += textjd) {
                    for (var y = 0; y < height; y += textjd) {
                        var i = (y * width + x) * 4;
                        if (imgdata[i + 3] > 128) {
                            dots.push({
                                x: x - width / 2,
                                y: y - height / 2,
                            });
                        }
                    }
                }
            } else {
                var fontSize = 50;
                if (text.length == 8) {
                    fontSize = 28;
                } else if (text.length == 7) {
                    fontSize = 32;
                } else if (text.length == 6) {
                    fontSize = 38;
                } else if (text.length == 5) {
                    fontSize = 40;
                } else if (text.length == 4) {
                    fontSize = 56;
                }
                ctx.fillStyle = '#FF0000';
                ctx.font = fontSize + 'px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(text, width / 2, (height / 2) + 3, width);
                var imgdata = ctx.getImageData(0, 0, width, height).data;
                ctx.clearRect(0, 0, width, height);
                var C = [];
                for (var l = 0; l < height; l++) {
                    for (var p = 0; p < width; p++) {
                        if (p == 0) {
                            C.push([0])
                        } else {
                            C[l].push(0)
                        }
                    }
                }
                var d = height
                    , f = width;
                for (var l = 0; l < height; l++) {
                    for (var p = 0; p < width * 4; p += 4) {
                        var m = (l * width * 4) + p;
                        var A = imgdata[m]
                            , j = imgdata[m + 1]
                            , h = imgdata[m + 2]
                            , g = imgdata[m + 3];
                        if (A != 0 || j != 0 || h != 0 || g != 0) {
                            C[l][p / 4] = 1
                        }
                    }
                }
                var t = 0;
                var o = function (a, b, c) {
                    if ((a + c) < d && (b + c) < f) {
                        for (var g = c - 1; g >= 0; g--) {
                            for (var e = c - 1; e >= 0; e--) {
                                if (C[a + e][b + g] != 1) {
                                    return false
                                }
                            }
                        }
                        return true
                    } else {
                        return false
                    }
                }
                for (var l = 0; l < height - 1; l++) {
                    for (var p = 0; p < width - 1; p++) {
                        if (C[l][p] == 1) {
                            if (t == 0) {
                                t = p
                            }
                            var y = 1;
                            for (var q = 2; q <= 8; q++) {
                                if (o(l, p, q)) {
                                    y = q
                                } else {
                                    break
                                }
                            }
                            if (y > 1 && y < 11) {
                                for (var v = 0; v < y; v++) {
                                    for (var z = 0; z < y; z++) {
                                        C[l + v][p + z] = y * 10 + 1
                                    }
                                }
                                C[l][p] = y
                            }
                        }
                        if (C[l][p] >= 1 && C[l][p] < 11) {
                            dots.push({
                                t: C[l][p],
                                x: p * 6 - width * 3,
                                y: l * 6 - width
                            })
                        }
                    }
                }
            }
            callback && callback(dots)
        },
        makeText: function (e, one) {
            var self = this, shapetype = one.shapetype || '1', rotatable = one.shaperotate || '1';
            var o = [], len = e.length;
            for (var a = 0; a < len; a++) {
                var dot = {
                    position: [e[a].x, e[a].y, 0],
                    rotation: [0, 0, 0],
                }
                if (shapetype == '2') {
                    dot.type = e[a].t;
                }
                o.push(dot);
            }
            return {
                card: {
                    count: o.length,
                    allCard: o,
                    perspective: 1e3
                },
                stage: function (c) {
                    var b = function () {
                        if (rotatable === '2') {
                            self.stageObj.snabbt({
                                fromRotation: [0, 0, 0],
                                rotation: [0, 0, 0],
                                duration: 0,
                                delay: self.shapeTime,
                                complete: function () {
                                    c();
                                }
                            });
                        } else {
                            self.stageObj.snabbt({
                                fromRotation: [0, 0, 0],
                                position: [0, 0, 0],
                                rotation: [0, Math.PI * 2, 0],
                                duration: self.shapeTime * 0.2,
                                delay: self.shapeTime * 0.25
                            }).snabbt({
                                position: [0, 0, 0],
                                rotation: [0, Math.PI * 4, 0],
                                delay: self.shapeTime * 0.2,
                                duration: self.shapeTime * 0.25,
                            }).snabbt({
                                fromRotation: [0, 0, 0],
                                rotation: [0, 0, 0],
                                duration: self.shapeTime * 0.1,
                                complete: function () {
                                    c()
                                }
                            });
                        }
                    }
                    return b;
                }
            }
        },
        makeWall: function () {
            var self = this;
            for (var o = [], i = h = 50 * Math.sqrt(2), n = self.Utils.height / h | 0, e = self.Utils.width / i | 0, s = 0; s < n; s++)
                for (var a = 0; a < e; a++) {
                    var l = (e - 1) / 2 - a,
                        r = (n - 1) / 2 - s;
                    o.push({
                        position: [l * i, r * h, 0],
                        rotation: [0, 0, Math.PI / 4]
                    })
                }
            return {
                card: {
                    count: o.length,
                    allCard: o,
                    perspective: 3500
                },
                stage: {
                    position: [0, 0, 0],
                    duration: self.shapeTime
                }
            }
        },
        makeWall2: function () {
            var self = this;
            for (var o = [], i = h = 55 * Math.sqrt(2), n = 17, e = 20, s = 0; s < n; s++)
                for (var a = 0; a < e; a++) {
                    var l = (e - 1) / 2 - a,
                        r = (n - 1) / 2 - s,
                        c = 0;
                    s % 2 == 0 && (c = h / 2), o.push({
                        position: [l * i + c, r * h / 2, 0],
                        rotation: [0, 0, Math.PI / 4]
                    })
                }
            return {
                card: {
                    count: o.length,
                    allCard: o,
                    perspective: 3500
                },
                stage: {
                    position: [0, 0, 0],
                    duration: self.shapeTime
                }
            }
        },
        makeSphere: function () {
            var l = this;
            for (
                var g = [], m = 380, e = 16, k = 30, b = {}, f = (e / 2) | 0, j = 0; j < e; j++
            ) {
                var c = ((Math.sin((Math.PI / (e - 1)) * j) * k) | 0) + 1;
                b[j] = c;
            }
            return (
                Object.keys(b).forEach(function (q) {
                    for (var t = f - q, s = b[q], c = 0; c < s; c++) {
                        var r = 180 / e * t
                            , u = 360 / s * c;
                        1 == s && (r = r > 0 ? 90 : -90);
                        var j = q * l.deg(180 / (e - 1))
                            , k = c * l.deg(360 / s)
                            , p = m * Math.sin(j) * Math.cos(k)
                            , o = m * Math.sin(j) * Math.sin(k)
                            , v = 0.9 * m * Math.cos(j);
                        g.push({
                            rotation: [-l.deg(r), -l.deg(u), 0],
                            position: [o, -v, p],
                            delay: 200 * (16 - q) + Math.random() * 100
                        })
                    }
                }), {
                    card: {
                        count: g.length,
                        allCard: g,
                        perspective: 2000
                    },
                    stage: function (c) {
                        var b = function () {
                            l.stageObj.snabbt({
                                fromPosition: [0, 0, 0],
                                fromRotation: [0, 0, 0],
                                rotation: [0, -Math.PI / 2, 0],
                                duration: l.shapeTime / 6,
                            }).snabbt({
                                rotation: [0, -Math.PI, 0],
                                position: [0, 0, 700],
                                duration: l.shapeTime / 6,
                            }).snabbt({
                                rotation: [0, -Math.PI * 1.5, -20 / 180 * Math.PI],
                                duration: l.shapeTime / 6,
                            }).snabbt({
                                rotation: [0, -Math.PI * 2.5, 0],
                                position: [0, 0, 0],
                                duration: l.shapeTime / 3,
                            }).snabbt({
                                rotation: [0, -Math.PI * 3, 0],
                                duration: l.shapeTime / 6,
                                complete: function () {
                                    c()
                                }
                            })
                            $(".logoImg").length && $('.logoImg').snabbt({
                                fromPosition: [0, 0, 0],
                                fromRotation: [0, 0, 0],
                                duration: l.shapeTime / 6,
                            }).snabbt({
                                position: [0, 0, 400],
                                rotation: [0, Math.PI * 2, 0],
                                duration: l.shapeTime / 6,
                            }).snabbt({
                                position: [0, 0, 0],
                                delay: l.shapeTime / 6,
                                duration: l.shapeTime / 3
                            })
                        };
                        return b
                    }
                }
            );
        },
        makeTours: function () {
            var q = this;
            var l = [];
            var f = function (b) {
                return (Math.PI / 180) * b;
            };
            var g = 360;
            var p = 10;
            var b = 15;
            var k = q.Utils.width / (b * 6);
            var o = 360 / b;
            for (var c = 0; c < p; c++) {
                for (var r = 0; r < b; r++) {
                    var m = (p / 2) | 0,
                        e = (b / 2) | 0,
                        j = f(o * r),
                        s = g * Math.cos(j),
                        u = g * Math.sin(j),
                        v = (c - m) * b * k + (r - e) * k;
                    l.push({
                        position: [s, u, v],
                        rotation: [0, 0, 0]
                    });
                }
            }
            return {
                card: {
                    count: l.length,
                    allCard: l,
                    perspective: 100
                },
                stage: function (c) {
                    var b = function () {
                        q.Stage.snabbt({
                            fromRotation: [0, 0, 0],
                            rotation: [0, 0, 2 * Math.PI],
                            duration: q.shapeTime,
                            complete: function () {
                                c();
                            }
                        });
                    };
                    return b;
                }
            };
        },
        makeCylinder: function () {
            var r = this;
            for (
                var m = [],
                k = 500,
                s = 500,
                f = 7,
                q = 45,
                b = (s / f) | 0,
                l = (f / 2) | 0,
                p = 0; p < f; p++
            ) {
                for (var c = 360 / q, o = 0; o < q; o++) {
                    var u = 0,
                        e = 0,
                        g = 0,
                        j = 0;
                    (u = k * Math.sin(r.deg(o * c))),
                        (e = (p - l) * b),
                        (g = k * Math.cos(r.deg(o * c))),
                        (j = o * c),
                        m.push({
                            position: [u, e, g],
                            rotation: [0, -r.deg(j), 0]
                        });
                }
            }
            return {
                card: {
                    count: m.length,
                    allCard: m,
                    perspective: 3500
                },
                stage: function (c) {
                    var b = function () {
                        r.stageObj.snabbt({
                            rotation: [0, Math.PI / 2, 0],
                            position: [0, 0, 0],
                            duration: r.shapeTime / 5,
                        }).snabbt({
                            rotation: [0, Math.PI, 0],
                            duration: r.shapeTime / 5,
                            position: [0, 0, 600],
                        }).snabbt({
                            rotation: [0, Math.PI * 5 / 4, 0],
                            duration: r.shapeTime / 5,
                        }).snabbt({
                            rotation: [0, Math.PI * (1.25 + 0.5), 0],
                            position: [0, 0, 0],
                            duration: r.shapeTime / 5,
                        }).snabbt({
                            rotation: [0, Math.PI * (1.25 + 1), 0],
                            duration: r.shapeTime / 5,
                            complete: function () {
                                c()
                            }
                        });
                        $('.logoImg').length && $('.logoImg').snabbt({
                            fromPosition: [0, 0, 0],
                            fromRotation: [0, 0, 0],
                            duration: r.shapeTime / 4,
                        }).snabbt({
                            position: [0, 0, 600],
                            rotation: [0, Math.PI * 2, 0],
                            duration: r.shapeTime / 4,
                        }).snabbt({
                            position: [0, 0, 0],
                            delay: r.shapeTime / 8,
                            duration: r.shapeTime / 4,
                        });
                    };
                    return b;
                }
            };
        },
        makeCube: function () {
            var p = this;
            for (var k = [], f = (h = d = 100), q = 5, j = 9, e = 8, o = 0; o < e; o++) {
                for (var b = 0; b < q; b++) {
                    for (var g = 0; g < j; g++) {
                        var m = (j - 1) / 2 - g,
                            c = (q - 1) / 2 - b,
                            l = (e - 1) / 2 - o;
                        k.push({
                            position: [m * f, c * h, l * d],
                            rotation: [0, 0, 0]
                        });
                    }
                }
            }
            return {
                card: {
                    count: k.length,
                    allCard: k,
                    perspective: 3500
                },
                stage: function (c) {
                    var b = function () {
                        p.Stage.snabbt({
                            fromRotation: [0, 0, 0],
                            rotation: [0, 2 * Math.PI, 0],
                            duration: p.shapeTime,
                            complete: function () {
                                c();
                            }
                        });
                        p.logoBox.run();
                    };
                    return b
                }
            };
        },
        makeCube2: function () {
            var r = this;
            var q = 0.7;
            for (
                var l = [], g = 9, k = 65, f = (length / 2, []), p = [], b = [], j = 0; j < g; j++
            ) {
                for (var o = 0; o < g; o++) {
                    var c = (g - 1) / 2,
                        m = (c - j) * k,
                        s = (c - o) * k,
                        e = c * k + k / 2;
                    f.push({
                        position: [m, s, e],
                        rotation: [0, 0, 0],
                        scale: [q, q]
                    }),
                        f.push({
                            position: [m, s, -e],
                            rotation: [Math.PI, 0, 0],
                            scale: [q, q]
                        }),
                        p.push({
                            position: [-e, m, s],
                            rotation: [0, Math.PI / 2, 0],
                            scale: [q, q]
                        }),
                        p.push({
                            position: [e, m, s],
                            rotation: [0, (-Math.PI / 2) * 3, Math.PI],
                            scale: [q, q]
                        }),
                        b.push({
                            position: [s, -e, m],
                            rotation: [(Math.PI / 2) * 3, 0, 0],
                            scale: [q, q]
                        }),
                        b.push({
                            position: [s, e, m],
                            rotation: [Math.PI / 2, 0, 0],
                            scale: [q, q]
                        });
                }
            }
            return (
                (l = f.concat(p, b)), {
                    card: {
                        count: l.length,
                        allCard: l,
                        perspective: 3500
                    },
                    stage: function (c) {
                        var b = function () {
                            r.Stage.snabbt({
                                fromRotation: [0, 0, 0],
                                rotation: [2 * Math.PI, 2 * Math.PI, 0],
                                duration: r.shapeTime,
                                complete: function () {
                                    c()
                                }
                            });
                        };
                        return b;
                    }
                }
            );
        },
        makeScrew: function () {
            var u = this;
            for (
                var p = [],
                g = 300,
                s = 7,
                b = 25,
                m = u.Utils.width / s / b,
                r = 360 / b,
                e = 0; e < s; e++
            ) {
                for (var q = (s / 2) | 0, v = 0; v < b; v++) {
                    var f = (b / 2) | 0,
                        j = u.deg(r * v),
                        l = (e - q) * b * m + (v - f) * m,
                        k = g * Math.sin(j),
                        w = g * Math.cos(j),
                        o = j,
                        c = 0,
                        x = 0;
                    p.push({
                        position: [l, k, w],
                        rotation: [o, c, x],
                        skew: [0, u.deg(6)]
                    });
                }
            }
            return {
                card: {
                    count: p.length,
                    allCard: p,
                    perspective: 3500
                },
                stage: function (c) {
                    var b = function () {
                        u.stageObj.snabbt({
                            fromRotation: [0, 0, 0],
                            rotation: [Math.PI * 0.25, 0, 0],
                            duration: u.shapeTime * 0.2,
                        }).snabbt({
                            rotation: [Math.PI * 0.75, 0, 0],
                            position: [0, 0, 500],
                            duration: u.shapeTime * 0.2,

                        }).snabbt({
                            rotation: [Math.PI, 0, 0],
                            duration: u.shapeTime * 0.2,
                        }).snabbt({
                            rotation: [Math.PI * 1.5, 0, 0],
                            position: [0, 0, 0],
                            duration: u.shapeTime * 0.2,
                        }).snabbt({
                            rotation: [Math.PI * 2, 0, 0],
                            duration: u.shapeTime * 0.2,
                            complete: function () {
                                c();
                            }
                        });
                        $('.logoImg').length && $('.logoImg').snabbt({
                            fromPosition: [0, 0, 0],
                            fromRotation: [0, 0, 0],
                            duration: u.shapeTime / 4,
                        }).snabbt({
                            position: [0, 0, 500],
                            rotation: [0, Math.PI * 2, 0],
                            duration: u.shapeTime / 4,
                        }).snabbt({
                            position: [0, 0, 0],
                            delay: u.shapeTime / 8,
                            duration: u.shapeTime / 4,
                        });
                    };
                    return b;
                }
            };
        },
        makeCDown: function (g) {
            var o = this;
            var c = [];
            if (g > 9) {
                var j = Math.floor(g / 10);
                var k = g % 10;
                var e = o.creatDownPos(j, -1);
                var f = o.creatDownPos(k, 1);
                c = e.concat(f);
            } else {
                c = o.creatDownPos(g, 0);
            }
            var l = [];
            var m = 1;
            for (var b = 0; b < c.length; b++) {
                l.push({
                    position: [c[b]['p'][0], c[b]['p'][1], c[b]['p'][2]],
                    rotation: [c[b]['r'][0], c[b]['r'][1], c[b]['r'][2]],
                    scale: [m, m]
                });
            }
            return (
                l, {
                    card: {
                        count: l.length,
                        allCard: l,
                        perspective: 3500
                    },
                    stage: function (e) {
                        var c = function () {
                            o.stageObj.snabbt({
                                rotation: [0, 0, 0],
                                position: [0, 0, 0],
                                duration: 1000,
                                complete: function () {
                                    e();
                                }
                            });
                        };
                        return c;
                    }
                }
            );
        },
        creatDownPos: function (c, k) {
            var o = this;
            var g = [];
            var f = [],
                e = 50,
                p = [],
                q = [];
            switch (c) {
                case 1:
                    for (var j = 0; j < 10; j++) {
                        if (j == 0) {
                            for (var b = 3; b < 5; b++) {
                                g.push([b, j, 0]);
                                g.push([b, j, 1]);
                            }
                        } else {
                            if (j == 1) {
                                for (var b = 2; b < 5; b++) {
                                    g.push([b, j, 0]);
                                    g.push([b, j, 1]);
                                }
                            } else {
                                if (j == 2) {
                                    for (var b = 1; b < 5; b++) {
                                        g.push([b, j, 0]);
                                        g.push([b, j, 1]);
                                    }
                                } else {
                                    if (j <= 7) {
                                        for (var b = 3; b < 5; b++) {
                                            g.push([b, j, 0]);
                                            g.push([b, j, 1]);
                                        }
                                    } else {
                                        for (var b = 1; b < 7; b++) {
                                            g.push([b, j, 0]);
                                            g.push([b, j, 1]);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    break;
                case 2:
                    for (var j = 0; j < 10; j++) {
                        if ([1, 8, 9].indexOf(j) != -1) {
                            for (var b = 0; b < 8; b++) {
                                g.push([b, j, 0]);
                                g.push([b, j, 1]);
                            }
                        } else {
                            if (j == 0) {
                                for (var b = 1; b < 7; b++) {
                                    g.push([b, j, 0]);
                                    g.push([b, j, 1]);
                                }
                            } else {
                                if (j == 2) {
                                    for (var b = 0; b < 2; b++) {
                                        g.push([b, j, 0]);
                                        g.push([b, j, 1]);
                                        g.push([7 - b, j, 0]);
                                        g.push([7 - b, j, 1]);
                                    }
                                } else {
                                    for (var b = 5; b < 8; b++) {
                                        g.push([b - (j - 3), j, 0]);
                                        g.push([b - (j - 3), j, 1]);
                                    }
                                }
                            }
                        }
                    }
                    break;
                case 3:
                    for (var j = 0; j < 10; j++) {
                        if ([1, 8].indexOf(j) != -1) {
                            for (var b = 0; b < 8; b++) {
                                g.push([b, j, 0]);
                                g.push([b, j, 1]);
                            }
                        } else {
                            if (j == 0 || j == 9) {
                                for (var b = 1; b < 7; b++) {
                                    g.push([b, j, 0]);
                                    g.push([b, j, 1]);
                                }
                            } else {
                                if (j == 2 || j == 7) {
                                    for (var b = 0; b < 2; b++) {
                                        g.push([b, j, 0]);
                                        g.push([b, j, 1]);
                                        g.push([7 - b, j, 0]);
                                        g.push([7 - b, j, 1]);
                                    }
                                } else {
                                    if (j == 3 || j == 6) {
                                        for (var b = 6; b < 8; b++) {
                                            g.push([b, j, 0]);
                                            g.push([b, j, 1]);
                                        }
                                    } else {
                                        for (var b = 3; b < 7; b++) {
                                            g.push([b, j, 0]);
                                            g.push([b, j, 1]);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    break;
                case 4:
                    for (var j = 0; j < 10; j++) {
                        if ([6, 7].indexOf(j) != -1) {
                            for (var b = 0; b < 8; b++) {
                                g.push([b, j, 0]);
                                g.push([b, j, 1]);
                            }
                        } else {
                            if (j == 0) {
                                for (var b = 4; b < 7; b++) {
                                    g.push([b, j, 0]);
                                    g.push([b, j, 1]);
                                }
                            } else {
                                if (j == 1) {
                                    for (var b = 3; b < 7; b++) {
                                        g.push([b, j, 0]);
                                        g.push([b, j, 1]);
                                    }
                                } else {
                                    if (j == 2 || j == 3 || j == 4) {
                                        for (var b = 2; b < 5; b++) {
                                            g.push([b - (j - 2), j, 0]);
                                            g.push([b - (j - 2), j, 1]);
                                        }
                                        for (var b = 5; b < 7; b++) {
                                            g.push([b, j, 0]);
                                            g.push([b, j, 1]);
                                        }
                                    } else {
                                        if (j == 5) {
                                            for (var b = 0; b < 2; b++) {
                                                g.push([b, j, 0]);
                                                g.push([b, j, 1]);
                                            }
                                            for (var b = 5; b < 7; b++) {
                                                g.push([b, j, 0]);
                                                g.push([b, j, 1]);
                                            }
                                        } else {
                                            for (var b = 5; b < 7; b++) {
                                                g.push([b, j, 0]);
                                                g.push([b, j, 1]);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    break;
                case 5:
                    for (var j = 0; j < 10; j++) {
                        if ([0, 1, 5, 8].indexOf(j) != -1) {
                            for (var b = 0; b < 8; b++) {
                                g.push([b, j, 0]);
                                g.push([b, j, 1]);
                            }
                        } else {
                            if (j == 4 || j == 9) {
                                for (var b = 0; b < 7; b++) {
                                    g.push([b, j, 0]);
                                    g.push([b, j, 1]);
                                }
                            } else {
                                if (j == 2 || j == 3) {
                                    for (var b = 0; b < 2; b++) {
                                        g.push([b, j, 0]);
                                        g.push([b, j, 1]);
                                    }
                                } else {
                                    if (j == 6 || j == 7) {
                                        for (var b = 6; b < 8; b++) {
                                            g.push([b, j, 0]);
                                            g.push([b, j, 1]);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    break;
                case 0:
                    for (var j = 0; j < 10; j++) {
                        if ([0, 9].indexOf(j) != -1) {
                            for (var b = 1; b < 7; b++) {
                                g.push([b, j, 0]);
                                g.push([b, j, 1]);
                            }
                        } else {
                            if (j == 1 || j == 8) {
                                for (var b = 0; b < 8; b++) {
                                    g.push([b, j, 0]);
                                    g.push([b, j, 1]);
                                }
                            } else {
                                for (var b = 0; b < 2; b++) {
                                    g.push([b, j, 0]);
                                    g.push([b, j, 1]);
                                }
                                for (var b = 6; b < 8; b++) {
                                    g.push([b, j, 0]);
                                    g.push([b, j, 1]);
                                }
                            }
                        }
                    }
                    break;
                case 6:
                    for (var j = 0; j < 10; j++) {
                        if ([1, 4, 5, 8].indexOf(j) != -1) {
                            for (var b = 0; b < 8; b++) {
                                g.push([b, j, 0]);
                                g.push([b, j, 1]);
                            }
                        } else {
                            if (j == 9) {
                                for (var b = 0; b < 7; b++) {
                                    g.push([b, j, 0]);
                                    g.push([b, j, 1]);
                                }
                            } else {
                                if (j == 0) {
                                    for (var b = 1; b < 8; b++) {
                                        g.push([b, j, 0]);
                                        g.push([b, j, 1]);
                                    }
                                } else {
                                    if (j == 2 || j == 3) {
                                        for (var b = 0; b < 2; b++) {
                                            g.push([b, j, 0]);
                                            g.push([b, j, 1]);
                                        }
                                    } else {
                                        if (j == 6 || j == 7) {
                                            for (var b = 0; b < 2; b++) {
                                                g.push([b, j, 0]);
                                                g.push([b, j, 1]);
                                                g.push([7 - b, j, 0]);
                                                g.push([7 - b, j, 1]);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    break;
                case 7:
                    for (var j = 0; j < 10; j++) {
                        if ([0, 1].indexOf(j) != -1) {
                            for (var b = 0; b < 8; b++) {
                                g.push([b, j, 0]);
                                g.push([b, j, 1]);
                            }
                        } else {
                            if (j == 2) {
                                for (var b = 6; b < 8; b++) {
                                    g.push([b, j, 0]);
                                    g.push([b, j, 1]);
                                }
                            } else {
                                if (j == 9) {
                                    for (var b = 0; b < 2; b++) {
                                        g.push([b, j, 0]);
                                        g.push([b, j, 1]);
                                    }
                                } else {
                                    for (var b = 5; b < 8; b++) {
                                        g.push([b - j + 3, j, 0]);
                                        g.push([b - j + 3, j, 1]);
                                    }
                                }
                            }
                        }
                    }
                    break;
                case 8:
                    for (var j = 0; j < 10; j++) {
                        if ([0, 4, 5, 9].indexOf(j) != -1) {
                            for (var b = 1; b < 7; b++) {
                                g.push([b, j, 0]);
                                g.push([b, j, 1]);
                            }
                        } else {
                            if (j == 1 || j == 8) {
                                for (var b = 0; b < 8; b++) {
                                    g.push([b, j, 0]);
                                    g.push([b, j, 1]);
                                }
                            } else {
                                for (var b = 0; b < 2; b++) {
                                    g.push([b, j, 0]);
                                    g.push([b, j, 1]);
                                    g.push([7 - b, j, 0]);
                                    g.push([7 - b, j, 1]);
                                }
                            }
                        }
                    }
                    break;
                case 9:
                    for (var j = 0; j < 10; j++) {
                        if ([1, 4, 8].indexOf(j) != -1) {
                            for (var b = 0; b < 8; b++) {
                                g.push([b, j, 0]);
                                g.push([b, j, 1]);
                            }
                        } else {
                            if (j == 9) {
                                for (var b = 0; b < 7; b++) {
                                    g.push([b, j, 0]);
                                    g.push([b, j, 1]);
                                }
                            } else {
                                if (j == 0) {
                                    for (var b = 1; b < 7; b++) {
                                        g.push([b, j, 0]);
                                        g.push([b, j, 1]);
                                    }
                                } else {
                                    if (j == 5) {
                                        for (var b = 1; b < 8; b++) {
                                            g.push([b, j, 0]);
                                            g.push([b, j, 1]);
                                        }
                                    } else {
                                        if (j == 2 || j == 3) {
                                            for (var b = 0; b < 2; b++) {
                                                g.push([b, j, 0]);
                                                g.push([b, j, 1]);
                                                g.push([7 - b, j, 0]);
                                                g.push([7 - b, j, 1]);
                                            }
                                        } else {
                                            if (j == 6 || j == 7) {
                                                for (var b = 6; b < 8; b++) {
                                                    g.push([b, j, 0]);
                                                    g.push([b, j, 1]);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    break;
            }
            g.forEach(function (c) {
                var b = o.creatMinBox(c[0], c[1], c[2], g);
                f = f.concat(b);
            });
            f = o.newArr(f);
            var e = 50;
            var l = -4;
            var m = -4;
            if (k == -1) {
                var l = -8.5;
            }
            if (k == 1) {
                var l = 0.5;
            }
            f.forEach(function (b) {
                b['p'][0] += e * l;
                b['p'][1] += e * m;
            });
            return f;
        },
        creatMinBox: function (g, j, k, e) {
            var f = this;
            var b = [];
            var c = 50;
            if (!f.getBoxDatabyPos(g + 1, j, k, e)) {
                b.push({
                    p: [(g + 0.5) * c, j * c, k * c],
                    r: [0, 1.57, 0]
                });
            }
            if (!f.getBoxDatabyPos(g - 1, j, k, e)) {
                b.push({
                    p: [(g - 0.5) * c, j * c, k * c],
                    r: [0, 1.57, 0]
                });
            }
            if (!f.getBoxDatabyPos(g, j + 1, k, e)) {
                b.push({
                    p: [g * c, (j + 0.5) * c, k * c],
                    r: [1.57, 0, 0]
                });
            }
            if (!f.getBoxDatabyPos(g, j - 1, k, e)) {
                b.push({
                    p: [g * c, (j - 0.5) * c, k * c],
                    r: [1.57, 0, 0]
                });
            }
            if (!f.getBoxDatabyPos(g, j, k + 1, e)) {
                b.push({
                    p: [g * c, j * c, (k + 0.5) * c],
                    r: [0, 0, 0]
                });
            }
            if (!f.getBoxDatabyPos(g, j, k - 1, e)) {
                b.push({
                    p: [g * c, j * c, (k - 0.5) * c],
                    r: [0, 0, 0]
                });
            }
            return b;
        },
        getBoxDatabyPos: function (f, g, j, e) {
            var c = e.length;
            for (var b = c - 1; b >= 0; b--) {
                if (f == e[b][0] && g == e[b][1] && j == e[b][2]) {
                    return true;
                }
            }
            return false;
        },
        newArr: function (b) {
            var c = [];
            for (var f = 0; f < b.length; f++) {
                if (c.length > 0) {
                    var e = false;
                    for (var g = 0; g < c.length; g++) {
                        var j = c[g]['p'];
                        var k = b[f]['p'];
                        if (j[0] == k[0] && j[1] == k[1] && j[2] == k[2]) {
                            e = true;
                            break;
                        }
                    }
                    if (e) {
                        continue;
                    }
                    c.push(b[f]);
                } else {
                    c.push(b[f]);
                }
            }
            return c;
        },
        makeStage: function () {
            var self = this;
            var o = {
                fromRotation: [0, 0, 0],
                rotation: [0, 2 * Math.PI, 0],
                duration: 35e3,
                complete: function () {
                    i()
                }
            };
            var i = function () {
                self.Stage.stop();
                self.Stage.snabbt(o)
            };
            return {
                default: function (n, e) {
                    var f = function () {
                        if (!n.transformOrigin) {
                            n.transformOrigin = [0, 0, 0];
                        }
                        if (!n.duration) {
                            n.duration = self.shapeTime;
                        }
                        Object.keys(n).forEach(function (k) {
                            o[k] = n[k]
                        });
                        o.complete = e;

                        self.Stage.snabbt({
                            position: [0, 0, 0],
                            rotation: [0, 0, 0],
                            duration: 400,
                            complete: i
                        });
                    };
                    return f;
                },
                snabbt: self.stageObj.snabbt.bind(self.stageObj),
                stop: function () {
                    self.stageObj.snabbt("stop");
                    self.logoBox.stop()
                },
                reset: function (o) {
                    self.stageObj.css("transform", "")
                }
            }
        },
        makeControl: function () {
            var self = this;
            var nextshape = function () {
                var shape = self.shape;
                if (shape == 'countDown1') {
                    self.showCount = false;
                    shape = false;
                    if (!self.djsendAnimations.length) {
                        self.animations = self.tempAnimations;
                        if (self.bgmusicisPlaying == '1') {
                            $('#bgmusic')[0].play();
                            screencore.getdom('.openmusic').attr('data-open', '1').find('div').addClass('display-none');
                        }
                    } else {
                        self.isShowOnlyLogo = false;
                        return self.showDjsEndShape();
                    }
                }
                if (!shape) {
                    self.changeMode(shape, '1');
                } else {
                    self.shapeCount++;
                    if (shape.indexOf('countDown') != -1) {
                        self.changeCDownMode(self.animations[self.shapeCount]);
                    } else {
                        self.changeMode(self.animations[self.shapeCount])
                    }
                }
            };
            return {
                next: nextshape
            }
        },
        makeLogoImg: function () {
            var self = this, l = false;
            if (Threeconfig.logoUrl != '') {
                l = $('<img class="logoImg" />');
                l.attr('src', Threeconfig.logoUrl);
                $('.three3d').append('<div class="logobox zam-app-flex-ajCenter2"></div>');
                $('.three3d .logobox').append(l);
                l.hide();
            }
            return {
                l: l,
                showLogo: function () {
                    if (!this.l) return;
                    this.l.fadeIn()
                },
                hideLogo: function () {
                    if (!this.l) return;
                    this.l.fadeOut();
                    this.stop()
                },
                run: function () {
                    if (!this.l) return;
                    this.l.snabbt({
                        fromRotation: [0, 0, 0],
                        rotation: [0, Math.PI * 2, 0],
                        duration: self.shapeTime
                    })
                },
                stop: function () {
                    if (!this.l) return;
                    this.l.snabbt({
                        rotation: [0, 0, 0],
                        position: [0, 0, 0],
                        duration: 0,
                        delay: 0
                    }).snabbt('stop');
                }
            }
        },
        makeUtils: function () {
            var self = this;
            var o = $(".main-box").width(),
                i = $(".main-box").height(),
                n = [],
                e = 0,
                s = function () {
                    if (n.length && e < 2) {
                        ++e;
                        var k = n.shift();
                        var f = k.item;
                        var l = k.url;
                        var c = new Image;
                        c.onload = function () {
                            f.append(c);
                            $(c).fadeIn();
                            --e;
                            setTimeout(s, 100);
                        };
                        c.onerror = function () {
                            --e, setTimeout(s, 100)
                        };
                        c.src = l;
                        setTimeout(s, 150);
                    }
                };
            return {
                width: o,
                height: i,
                shapeIn: function () {
                    $(".new-sign").hide();
                    self.stageObj.snabbt({
                        position: [0, 0, 0],
                        rotation: [0, 0, 0],
                        duration: 100,
                    });
                },
                shapeLeave: function (leaveaniType) {
                    $(".new-sign").hide();
                    var o = $.Deferred(),
                        lis = self.stageObj.find("li"),
                        lilen = lis.length;
                    if (lilen) {
                        for (var l = 0, b = 0; b < lilen; b++) {
                            var e = lis.eq(b);
                            if (e) {
                                e.snabbt({
                                    fromOpacity: 1,
                                    fromSkew: [0, 0],
                                    position: self.startEndPosition(leaveaniType),
                                    opacity: 0,
                                    duration: 3000 * Math.random(),
                                    delay: 600 * Math.random(),
                                    easing: 'easeIn',
                                    complete: function () {
                                        e.removeClass('activate');
                                        l++;
                                        if (l == lilen) {
                                            o.resolve();
                                        }

                                    }
                                });
                            }
                        }
                    } else {
                        o.resolve();
                    }
                    return o.promise();
                },
                countDownIn: function () {
                    $(".new-sign").hide();
                    self.stageObj.snabbt({
                        position: [0, 0, -200],
                        rotation: [-0.3, 0.8, -0.05],
                        duration: 100,
                    });
                },
                countDownLeave: function (leaveaniType) {
                    $('.new-sign').hide();
                    self.Stage.stop();
                    var o = $.Deferred(), lis = self.stageObj.find('li'), lilen = lis.length;
                    if (lilen) {
                        for (var l = 0, b = 0; b < lilen; b++) {
                            var e = lis.eq(b);
                            if (e) {
                                e.snabbt({
                                    fromOpacity: 1,
                                    position: self.startEndPosition(leaveaniType),
                                    opacity: 0,
                                    scale: [0, 0],
                                    duration: 500,
                                    delay: 200 * Math.random(),
                                    easing: 'easeOut',
                                    complete: function () {
                                        l++;
                                        if (l == lilen) {
                                            o.resolve();
                                        }

                                    }
                                });
                            }
                        }
                    } else {
                        o.resolve();
                    }
                    return o.promise();
                },
                loadImg: function (o) {
                    n.push(o), s()
                }
            }
        },
        makeCard: function () {
            var self = this;
            var o = -1,
                i = [],
                n = function (key, url) {
                    var item = $('<li class="card"></li>')
                    var userlen = self.qdusers.length;
                    var user = self.qdusers[key] || '';
                    var avatar = user.avatar || self.defaultAvatar;
                    if (self.avatartype == 1 && userlen) {
                        avatar = self.qdusers[Math.floor(Math.random() * userlen)].avatar;
                    }
                    self.Utils.loadImg({
                        item: item,
                        url: url || avatar
                    });
                    i.push(item);
                    self.stageObj.append(item);
                    if (user) {
                        item.attr({ "data-has": '1' });
                    }
                };
            return {
                count: function () {
                    return i.length;
                },
                init: function (o) {
                    var t = o - i.length;
                    if (t > 0) {
                        var logoUrl = '';
                        if (o === 1 && self.shape.indexOf('logo') > -1) {
                            logoUrl = self[self.shape].card.src || '';
                        }
                        for (var e = i.length; e < o; e++) {
                            n(e, logoUrl);
                        }
                    }
                },
                reset: function () {
                    o = -1;
                    $('li.card').removeClass('activate dot1 dot2 dot3 dot4 dot5 dot6 dot7 dot8');
                },
                next: function () {
                    if (++o, i[o]) return i[o]
                }
            }
        },
        changeMode: function (shape, isCountDownEnd) {
            var self = this, flag = flag || '2';
            if (!shape) {
                self.shapeCount = 0;
                shape = self.animations[self.shapeCount];
            }
            self.shapeTime = (Threeconfig.shapes[self.shapeCount].shapeseconds || 15) * 1e3;
            self.changeStartTime = 0;
            self.logoBox.hideLogo();
            self.Stage.stop();
            self.stageObj.snabbt({
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                duration: 0,
            });
            if (isCountDownEnd == '1') {
                var leaveType = 'countDownLeave';
                var leaveaniType = '-1';
            } else {
                var leaveType = 'shapeLeave';
                var leaveaniType = Threeconfig.shapes[(self.shapeCount == 0 ? 0 : (self.shapeCount - 1))].shapeout;
            }
            self.Utils[leaveType](leaveaniType).then(function () {
                self.prevshape = self.shape;
                if (self.prevshape.indexOf('logo') != -1) {
                    var prevlogosrc = self[self.prevshape].card.src || '';
                    if (prevlogosrc != '') {
                        $(".signthreed-wall-block ul li").eq(0).find('img').attr('src', self.qdusers.length > 0 ? self.qdusers[Math.floor(Math.random() * self.qdusers.length)].avatar : self.defaultAvatar);
                    }
                }
                self.shape = shape;
                var i = self[shape];
                self.Card.init(i.card.count);
                self.stageObj.removeClass(self.prevshape).addClass(self.shape);
                self.Utils.shapeIn();
                self.Build();
                if (self.shape.indexOf('logo') != -1) {
                    var logosrc = self[self.shape].card.src || '';
                    if (logosrc != '') {
                        $(".signthreed-wall-block ul li").eq(0).find('img').attr('src', logosrc);
                    }
                }

            })
        },
        changeCDownMode: function (o) {
            var self = this;
            self.logoBox.hideLogo();
            if (!o) {
                self.shapeCount = 0;
                o = self.animations[0];
            }
            self.changeStartTime = 0;
            self.Utils.countDownLeave('-1').then(function () {
                self.stageObj.removeClass(self.shape);
                self.shape = o;
                self.stageObj.addClass(self.shape);
                var i = self[self.shape];
                $("#countaudio")[0].play();
                self.Card.init(i.card.count);
                self.Utils.countDownIn();
                self.Build();
            });
        },
        bgmusicisPlaying: '2',
        startCountDown: function () {
            var self = this;
            self.logoBox.hideLogo();
            if (!self.showCount) {
                self.showCount = true;
                $('.new-sign').hide();
                self.animations = self.countDownAnimations;
                self.Stage.stop();
                var bgmusicbtn = screencore.getdom('.openmusic'), bgmusic = $('#bgmusic');
                if (bgmusicbtn.length > 0 && bgmusic.length && bgmusicbtn.attr('data-open') == '1') {
                    bgmusic.get(0).currentTime = 0;
                    bgmusic.get(0).pause();
                    self.bgmusicisPlaying = '1';
                    bgmusicbtn.attr('data-open', '2').find('div').removeClass('display-none');
                }
                self.changeCDownMode();
            }
        },
        getolduser: function () {
            var self = this;
            screencore.ajaxSubmit('/screen/threed/historysign', {}, '正在加载历史签到数据').then(function (data) {
                if (data.code == 0) {
                    if (data.msg.list.length > 0) {
                        self.maxid = data.msg.list[0].id;
                        self.qdusers = data.msg.list.reverse();
                        $(".joinPeople").html('<span>' + data.msg.total + '</span>人签到');
                    } else {
                        $(".joinPeople").html('<span>0</span>人签到');
                    }
                    self.oldloaded = true;
                } else {
                    layerBox.showMsg(data.msg);
                }
            }, function () {

            });
        },
        getNewuser: function () {
            var self = this;
            screencore.ajaxSubmit('/screen/threed/newsign', {
                maxid: self.maxid
            }).then(function (data) {
                if (data.code == 0) {
                    var list = data.msg.list || [];
                    if (list.length) {
                        var list = list.reverse();
                        self.maxid = list[list.length - 1].id;
                        self.qdusers = self.qdusers.concat(list);
                        self.newqdusers = self.newqdusers.concat(list);
                    }
                    $(".joinPeople").html('<span>' + data.msg.total + '</span>人签到');
                }
                setTimeout(function () {
                    self.getNewuser();
                }, self.ajaxtime);
            }, function () {
                setTimeout(function () {
                    self.getNewuser();
                }, self.ajaxtime);
            });
        },
        showUser: function () {
            var self = this;
            if (self.isShowOnlyLogo) {
                return;
            }
            var qdlen = self.qdusers.length;
            var newqdlen = self.newqdusers.length;
            if (!qdlen && !newqdlen) {
                return setTimeout(function () {
                    self.showUser()
                }, self.loopTime);
            }
            var lis = $(".three3d li.activate").filter(function (o, i) {
                return '1' != $(i).attr("data-has")
            });
            if (!lis.length) {
                lis = $(".three3d li.activate");
            }
            if (!lis.length) {
                return setTimeout(function () {
                    self.showUser()
                }, self.loopTime);
            }
            var liObj = lis.eq(Math.floor(Math.random() * lis.length)), userdata = self.newqdusers.shift(), isnew = '1';
            if (!userdata) {
                userdata = self.qdusers[Math.floor(Math.random() * qdlen)];
                isnew = '2';
            }
            var avatar = userdata.avatar || self.defaultAvatar, nickname = userdata.nickname || '', bdname = '';
            if ($.isArray(nickname)) {
                var fontsize = nickname.length < 3 ? 40 : 30;
                if (nickname.length > 1) {
                    $.each(nickname, function (key, val) {
                        bdname += `<span style="font-size:${fontsize}px">${val}</span>`;
                    });
                } else {
                    bdname += `<div>${nickname[0] || ''}</div>`;
                }
            } else {
                bdname += `<div>${nickname}</div>`;
            }
            var allowpop = Threeconfig.allowpop, n = Date.now(), callback = function () {
                var logosrc = self[self.shape].card.src || '';
                if (logosrc == '') {
                    liObj.html(`<img src="${avatar}">`);
                }
                if (isnew == '1') {
                    liObj.attr({ "data-has": '1' });
                }
                setTimeout(function () {
                    self.showUser()
                }, self.loopTime);
            };
            if (allowpop == '1' && (n - self.changeStartTime < 3000 || self.changeStartTime + self.shapeTime - n < 3000)) {
                allowpop = '2';
            }
            if (allowpop == '1') {
                var id = "signthreed" + (new Date).getTime();
                $(".threedb-mainbox").append(self.signRender({ id: id, avatar: avatar, nickname: bdname }));
                $("#" + id).snabbt({
                    fromPosition: self.posfrom[Math.floor(Math.random() * self.posfrom.length)],
                    fromScale: [2, 2],
                    // posotion: [0, 0, 2e3],
                    // position: [600, 200, 0],
                    scale: [1, 1],
                    duration: 1e3,
                    easing: "easeOut",
                    complete: function () {
                        $("#" + id).snabbt({
                            position: liObj.data().dataPosition,
                            //position:[600, 200, 0],
                            rotation: liObj.data().dataRotation,
                            duration: 600,
                            scale: [.25, .25],
                            easing: "easeIn",
                            delay: 500,
                            complete: function () {
                                $("#" + id).remove(), callback();
                            }
                        })
                    }
                })
            } else {
                callback();
            }
        },
        random: function (begin, end) {
            var num = Math.round(Math.random() * (end - begin) + begin);
            return num;
        },
        startEndPosition: function (type) {
            var self = this;
            type = +(type || '1');
            if (type == 1) {
                var pos = [self.random(-self.Utils.width, self.Utils.width), self.random(-self.Utils.height, self.Utils.height), 2000];
            } else if (type == 2) {
                var pos = [self.random(-self.Utils.width / 2, self.Utils.width / 2), self.random(-self.Utils.height / 2, self.Utils.height / 2), -2000];
            } else if (type == 3) {
                var pos = [self.Utils.width, self.random(-self.Utils.height, self.Utils.height), 0];
            } else if (type == 4) {
                var pos = [-self.Utils.width, self.random(-self.Utils.height, self.Utils.height), 0];
            } else if (type == 5) {
                var pos = [self.random(-self.Utils.width, self.Utils.width), -self.Utils.height, 0];
            } else if (type == 6) {
                var pos = [self.random(-self.Utils.width, self.Utils.width), self.Utils.height, 0];
            } else {
                var pos = [self.random(-self.Utils.width, self.Utils.width), self.random(-self.Utils.height, self.Utils.height), 0];
            }
            return pos;
        },
        isNotLogo: function (shape) {
            var self = this;
            let logolen = self.animations.reduce((len, item) => {
                return len + (item.indexOf('logo') != -1 ? 1 : 0);
            }, 0);
            if (logolen < 1 || logolen == self.animations.length) {
                return false;
            }
            if (shape.indexOf('logo') != -1) {
                self.shapeCount++;
                shape = self.animations[self.shapeCount];
                if (!shape) {
                    self.shapeCount = 0;
                    shape = self.animations[self.shapeCount];
                }
                return this.isNotLogo(shape);
            } else {
                return shape;
            }
        },
        LogoUrl: function (url) {
            if ($.trim(url) === '') {
                return '';
            }
            return url.substring(0, 4) === 'http' ? url : (url.indexOf('/') === 0 ? url : '/' + url);
        },
        shuffleArr: function (b) {
            for (var e, f, c = b.length; c; e = parseInt(Math.random() * c), f = b[--c], b[c] = b[e], b[e] = f) {

            }
            return b;
        },
        isShowOnlyLogo: false,
        showDjsEndShape: function () {
            var self = this;
            if (self.showCount || self.isShowOnlyLogo) {
                return;
            }
            if (!self.isShowOnlyLogo) {
                self.isShowOnlyLogo = true;
                self.animations = self.djsendAnimations;
                $('.new-sign').hide();
                self.changeMode(false, '1');
                var bgmusic = $("#bgmusic");
                if (bgmusic.length && !bgmusic[0].paused) {
                    $(".control-normal-list .openmusic").trigger('click');
                }
                try {
                    $("#endaudio").length && $("#endaudio")[0].play();
                } catch (error) {

                }

            }
        },
    };
    return screenthreed;
});