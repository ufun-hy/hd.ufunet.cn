/*
* @Author: 赞木
* @Date:   2022-04-02 20:42:30
* @Last Modified by:   赞木
* @Last Modified time: 2023-06-26 21:38:30
*/
define('screenshakestart', ['screensocket', 'screencore', 'template', 'layerBox', 'fulldm', 'keyboard', 'snabbt', 'threejs', 'pxPreload', 'anime'], function (screensocket, screencore, template, layerBox, fulldm, keyboardJS, snabbt, THREE, pxPreload, anime) {
    THREE.CSS3DObject = function (a) { THREE.Object3D.call(this); this.element = a; this.element.style.position = "absolute"; this.addEventListener("removed", function () { if (this.element.parentNode !== null) { this.element.parentNode.removeChild(this.element) } }) }; THREE.CSS3DObject.prototype = Object.create(THREE.Object3D.prototype); THREE.CSS3DObject.prototype.constructor = THREE.CSS3DObject; THREE.CSS3DSprite = function (a) { THREE.CSS3DObject.call(this, a) }; THREE.CSS3DSprite.prototype = Object.create(THREE.CSS3DObject.prototype); THREE.CSS3DSprite.prototype.constructor = THREE.CSS3DSprite; THREE.CSS3DRenderer = function () { console.log("THREE.CSS3DRenderer", THREE.REVISION); var d, g; var n, l; var m = new THREE.Matrix4(); var a = { camera: { fov: 0, style: "" }, objects: {} }; var i = document.createElement("div"); i.style.overflow = "hidden"; this.domElement = i; var j = document.createElement("div"); j.style.WebkitTransformStyle = "preserve-3d"; j.style.MozTransformStyle = "preserve-3d"; j.style.transformStyle = "preserve-3d"; i.appendChild(j); var c = /Trident/i.test(navigator.userAgent); this.setClearColor = function () { }; this.getSize = function () { return { width: d, height: g } }; this.setSize = function (q, p) { d = q; g = p; n = d / 2; l = g / 2; i.style.width = q + "px"; i.style.height = p + "px"; j.style.width = q + "px"; j.style.height = p + "px" }; function o(p) { return Math.abs(p) < 1e-10 ? 0 : p } function k(p) { var q = p.elements; return "matrix3d(" + o(q[0]) + "," + o(-q[1]) + "," + o(q[2]) + "," + o(q[3]) + "," + o(q[4]) + "," + o(-q[5]) + "," + o(q[6]) + "," + o(q[7]) + "," + o(q[8]) + "," + o(-q[9]) + "," + o(q[10]) + "," + o(q[11]) + "," + o(q[12]) + "," + o(-q[13]) + "," + o(q[14]) + "," + o(q[15]) + ")" } function f(p, s) { var q = p.elements; var r = "matrix3d(" + o(q[0]) + "," + o(q[1]) + "," + o(q[2]) + "," + o(q[3]) + "," + o(-q[4]) + "," + o(-q[5]) + "," + o(-q[6]) + "," + o(-q[7]) + "," + o(q[8]) + "," + o(q[9]) + "," + o(q[10]) + "," + o(q[11]) + "," + o(q[12]) + "," + o(q[13]) + "," + o(q[14]) + "," + o(q[15]) + ")"; if (c) { return "translate(-50%,-50%)translate(" + n + "px," + l + "px)" + s + r } return "translate(-50%,-50%)" + r } function b(q, v, w) { if (q instanceof THREE.CSS3DObject) { var u; if (q instanceof THREE.CSS3DSprite) { m.copy(v.matrixWorldInverse); m.transpose(); m.copyPosition(q.matrixWorld); m.scale(q.scale); m.elements[3] = 0; m.elements[7] = 0; m.elements[11] = 0; m.elements[15] = 1; u = f(m, w) } else { u = f(q.matrixWorld, w) } var s = q.element; var t = a.objects[q.id] && a.objects[q.id].style; if (t === undefined || t !== u) { s.style.WebkitTransform = u; s.style.MozTransform = u; s.style.transform = u; a.objects[q.id] = { style: u }; if (c) { a.objects[q.id].distanceToCameraSquared = e(v, q) } } if (s.parentNode !== j) { j.appendChild(s) } } for (var r = 0, p = q.children.length; r < p; r++) { b(q.children[r], v, w) } } var e = function () { var q = new THREE.Vector3(); var p = new THREE.Vector3(); return function (s, r) { q.setFromMatrixPosition(s.matrixWorld); p.setFromMatrixPosition(r.matrixWorld); return q.distanceToSquared(p) } }(); function h(r) { var p = Object.keys(a.objects).sort(function (t, s) { return a.objects[t].distanceToCameraSquared - a.objects[s].distanceToCameraSquared }); var q = p.length; r.traverse(function (t) { var s = p.indexOf(t.id + ""); if (s !== -1) { t.element.style.zIndex = q - s } }) } this.render = function (s, r) { var p = r.projectionMatrix.elements[5] * l; if (a.camera.fov !== p) { i.style.WebkitPerspective = p + "px"; i.style.MozPerspective = p + "px"; i.style.perspective = p + "px"; a.camera.fov = p } s.updateMatrixWorld(); if (r.parent === null) { r.updateMatrixWorld() } var t = "translateZ(" + p + "px)" + k(r.matrixWorldInverse); var q = t + "translate(" + n + "px," + l + "px)"; if (a.camera.style !== q && !c) { j.style.WebkitTransform = q; j.style.MozTransform = q; j.style.transform = q; a.camera.style = q } b(s, r, t); if (c) { h(s) } } };
    var screenshakestart = {
        startUpStatus: '1',
        djslocalkey: '',
        init: function () {
            var self = this;
            self.initAll();
        },
        iserror: true,
        newUserTimer: null,
        showUserStatus: false,
        phbnum: 10,
        initsocket: function () {
            var self = this;
            var params = {};
            params.onmessage = function (data) {
                if (data.type == 'connected') {
                    screensocket.isclose = false;
                    screencore.connectsocket({ clientid: data.clientid });
                } else if (data.type == 'gameiswait') {
                    clearInterval(self.newUserTimer);
                    if (showjoin == '1') {
                        self.newUserTimer = setInterval(function () {
                            if (self.newjoinarr.length) {
                                if (!self.showUserStatus) {
                                    var newshow = self.newjoinarr.shift();
                                    self.showUserStatus = true;
                                    self.showNewuser(newshow.avatar, newshow.nickname);
                                }
                            } else if (self.oldjoinarr.length) {
                                if (!self.showUserStatus) {
                                    var newshow = self.oldjoinarr[Math.floor((Math.random() * self.oldjoinarr.length))];
                                    self.showUserStatus = true;
                                    self.showNewuser(newshow.avatar, newshow.nickname);
                                }
                            }
                        }, 2e3);
                    }
                    self.oldjoinarr = data.oldusers;
                    localStorage.removeItem(self.djslocalkey);
                } else if (data.type == 'gameisrun') {
                    if (self.startUpStatus == '2') {
                        return false;
                    }
                    self.oldjoinarr = data.oldusers;
                    self.startUpStatus = '2';
                    self.startopen('1');
                } else if (data.type == 'gameisend') {
                    if (self.startUpStatus != '3') {
                        self.endstart('1');
                    }
                } else if (data.type == 'gameisdjs') {
                    self.iserror = false;
                    self.updatePercent(data);
                } else if (data.type == 'gamescore') {
                    self.updatePercent(data);
                } else if (data.type == 'gamejoin') {
                    if (data.wxuser) {
                        var wxuser = data.wxuser;
                        if (self.oldjoinarr.length) {
                            var openids = self.oldjoinarr.map(function (v) {
                                return v.openid;
                            });
                            if ($.inArray(wxuser.openid, openids) === -1) {
                                self.oldjoinarr.push({ openid: wxuser.openid, avatar: wxuser.avatar, nickname: wxuser.nickname });
                                self.newjoinarr.push({ openid: wxuser.openid, avatar: wxuser.avatar, nickname: wxuser.nickname });
                            }
                        } else {
                            self.oldjoinarr.push({ openid: wxuser.openid, avatar: wxuser.avatar, nickname: wxuser.nickname });
                            self.newjoinarr.push({ openid: wxuser.openid, avatar: wxuser.avatar, nickname: wxuser.nickname });
                        }
                    }
                } else if (data.type == 'shakestartrepeatdl') {
                    var dllogo = $('.dllogos').find(`.dllogo${data.userid}`);
                    if (dllogo.length) {
                        dllogo.removeClass('active');
                        setTimeout(function () {
                            dllogo.addClass('active');
                        }, 1e3);
                    }
                } else if (data.type == 'gameshakestartrefresh') {
                    //后台重置则重新开始游戏
                    window.location.reload();
                } else if (data.type == 'screendm') {
                    var messages = data.messages;
                    if (messages) {
                        if ($.isArray(messages) && messages.length) {
                            $.each(messages, function (i, val) {
                                fulldm.addBullet(val);
                            });
                        }
                    } else {
                        fulldm.addBullet(data);
                    }
                } else if (data.type == 'screendeldm') {
                    if (!$.isArray(data.msgid)) {
                        fulldm.delBullet(data.msgid);
                    } else {
                        $.each(data.msgid, function (index, val) {
                            fulldm.delBullet(val);
                        });
                    }
                } else if (data.type == 'screenresetdm') {
                    fulldm.resetBullet();
                }
            };
            screensocket.init(params);
        },
        initAll: function () {
            var self = this;
            self.phbnum = phbnum;
            self.djslocalkey = XCV3Config.hdid + 'currentTime';
            if (showstars == '1') {
                self.initstar();
            }
            if (showflower == '1' && flowertype == '1') {
                self.initpaper();
            }
            self.preloadAll(function (result) {
                $(".loading-box .load-percent").text('100%');
                $(".load-progress span").css('width', '100%');
                $(".loading-box").remove();
                result = result || {};
                var djsvideo = result.djsvideo || '', startbgvideo = result.startbgvideo || '', endbgvideo = result.endbgvideo || '';
                if (djsvideo != '') {
                    if (djsvideo.status == '2') {
                        return layerBox.showMsg('倒计时视频文件加载错误，请刷新重试', '0');
                    }
                    var muted = '';
                    if ($("#djsaudio").length) {
                        muted = 'muted';
                    }
                    $(".videosbox").append('<video ' + muted + ' class="djsvideo hidden" src="' + djsvideo.src + '" dir="' + djsvideo.dir + '" width="' + djsvideo.w + '" height="' + djsvideo.h + '" time="' + djsvideo.duration + '"></video>');
                }
                if (startbgvideo != '') {
                    if (startbgvideo.status == '2') {
                        return layerBox.showMsg('启动中背景视频文件加载错误，请刷新重试');
                    }
                    var muted = '';
                    if ($("#startaudio").length) {
                        muted = 'muted';
                    }
                    $(".videosbox").append('<video ' + muted + ' class="startvideo hidden" src="' + startbgvideo.src + '" dir="' + startbgvideo.dir + '" width="' + startbgvideo.w + '" height="' + startbgvideo.h + '" time="' + startbgvideo.duration + '" loop="loop"></video>');
                }
                if (endbgvideo != '') {
                    if (startbgvideo.status == '2') {
                        return layerBox.showMsg('启动后背景视频文件加载错误，请刷新重试');
                    }
                    var muted = '';
                    if ($("#overaudio").length) {
                        muted = 'muted';
                    }
                    $(".videosbox").append('<video ' + muted + ' class="endvideo hidden" src="' + endbgvideo.src + '" dir="' + endbgvideo.dir + '" width="' + endbgvideo.w + '" height="' + endbgvideo.h + '" time="' + endbgvideo.duration + '" loop="loop"></video>');
                }
                self.rankrender = template('rank-tpl');
                self.initevent();
                self.initsocket();
            });
            if (scanqrfly == '1' || showavatars == '1') {
                self.stageInit();
            }
        },
        showNewuser: function (avatar, nickname) {
            var self = this;
            var posfrom = [
                [800, -800, 3e3],
                [800, 800, 3e3],
                [-800, 800, 3e3],
                [-800, -800, 3e3],
            ];
            //var e =  nickname || '木木';
            var l = "UserShakstart" + (new Date).getTime();
            var r = `<div id="${l}" class="new-sign zam-app-flex-ajCenter">
            <img src="${avatar}" class="avatar"></a>
            <p class="nickname limitbox">${nickname}</p>
            </div>`;
            $("body").append(r);
            $("#" + l).snabbt({
                fromPosition: posfrom[Math.floor(Math.random() * posfrom.length)],
                fromRotation: [0, 2 * Math.PI, 0],
                fromScale: [2, 2],
                posotion: [0, 0, 2e3],
                scale: [1, 1],
                rotation: [0, 0, 0],
                duration: 1000,
                easing: "easeOut",
                complete: function () {
                    $("#" + l).snabbt({
                        position: [0, 0, 0],
                        rotation: [0, 0, 0],
                        duration: 500,
                        scale: [.25, .25],
                        easing: "easeIn",
                        delay: 200,
                        complete: function () {
                            $("#" + l).remove(), self.showUserStatus = false;
                        }
                    })
                }
            })
        },
        isopenreset: false,
        scanqrtimer: null,
        initevent: function () {
            var self = this;
            if ($(".videoBg").length) {
                $(".videoBg").addClass('isplaying');
            }
            $(window).on('resize', function () {
                var resizev = $(".videosbox video:not(.hidden)");
                if (resizev.length) {
                    screencore.videofullScreen(resizev.get(0), screencore.getvideoData(resizev.get(0)));
                }
            });
            if (startstatus === '1') {
                var tipclosed = localStorage.getItem(`starttip-closed-${XCV3Config.hdid}`);
                if (tipclosed != '1') {
                    $(".shakestart-tip").removeClass('hidden');
                }
                $(".shakestart-tip i").click(function () {
                    $(this).parent().remove();
                    localStorage.setItem(`starttip-closed-${XCV3Config.hdid}`, '1');
                });
            }
            keyboardJS.bind('space', function (e) {
                if (screensocket.isclose) return false;
                if (self.startUpStatus == '1') {
                    if (scanqropen == '1') {
                        //展示扫码
                        if (scanqrfly == '1') {
                            self.stageStop = false;
                        }
                        $(".scanqrbox").removeClass('hidden');
                        screencore.ajaxSubmit("/screen/shakestart/gameusercount", {}).then(function (data) {
                            if (data.code == 0) {
                                screencore.animatenum(data.msg + '');
                            }
                        });
                        self.scanqrtimer = setInterval(function () {
                            screencore.ajaxSubmit("/screen/shakestart/gameusercount", {}).then(function (data) {
                                if (data.code == 0) {
                                    $(".animateNum").text(data.msg);
                                }
                            });
                        }, 2e3);
                        scanqropen = '2';
                        if (self.newUserTimer != null) {
                            clearInterval(self.newUserTimer);
                            $(".new-sign").addClass('hidden');
                        }
                    } else {
                        $(".scanqrbox").addClass('hidden');
                        if (scanqrfly == '1') {
                            $('.threeBox').addClass('hidden');
                            self.stageStop = true;
                        }
                        if (self.scanqrtimer != null) {
                            clearInterval(self.scanqrtimer);
                        }
                        self.startUpStatus = '2';
                        if (self.newUserTimer != null) {
                            clearInterval(self.newUserTimer);
                            $(".new-sign").addClass('hidden');
                        }
                        screencore.ajaxSubmit("/screen/shakestart/gamestart", { 'status': '2' }).then(function (data) {
                            if (data.code != 0) {
                                self.startUpStatus = '1';
                                layerBox.showMsg(data.msg);
                            } else {
                                var canopentimer = setInterval(function () {
                                    clearInterval(canopentimer);
                                    self.startopen();
                                }, 10);
                            }
                        }, function () {
                            self.startUpStatus = '1';
                            layerBox.showMsg('网络太差，请稍后重试');
                        });
                    }
                } else if (self.startUpStatus == '2') {
                    //时间启动或正在播放倒计时 按空格无效
                    if ($(".djsvideo").length && !$(".djsvideo").hasClass("hidden")) {
                        return false;
                    }
                    if (starttype == '1') {
                        return false;
                    }
                    if (self.isforceopen) {
                        return false;
                    }
                    self.isforceopen = true;
                    clearInterval(self.scoretimer);
                    //成绩启动
                    if (starttype == '2') {
                        self.percentData = 100;
                    } else {
                        //未点亮的logo
                        var notdllogos = $(".dllogos li:not(.active)");
                        //logo全部已点亮或者logo不可见
                        if ($('.dluserbox').hasClass('hidden') || !notdllogos.length) {
                            self.percentData = 100;
                        } else {
                            self.waitendstart = true;
                            var max = notdllogos.length;
                            for (var i = 0; i < max; i++) {
                                (function (t, data) {
                                    setTimeout(function () {
                                        data.addClass('active');
                                        if (t == (max - 1)) {
                                            setTimeout(function () {
                                                self.calcPercentData(($(".dllogos .active").length / $('.dllogos li').length));
                                            }, 1e3)
                                        } else {
                                            self.calcPercentData(($(".dllogos .active").length / $('.dllogos li').length));
                                        }
                                    }, 1000 * t);
                                })(i, notdllogos.eq(i))
                            }
                        }
                    }
                } else {
                    if (self.isopenreset) {
                        return false;
                    }
                    self.isopenreset = true;
                    layerBox.showConfirm('警告', '重置启动状态为未开始，将导致摇一摇启动用户数据被删除，您确定要重置么?', ['确定', '取消'], function () {
                        screencore.ajaxSubmit("/screen/shakestart/gamereset", { 'status': '1' }).then(function (data) {
                            if (data.code != 0) {
                                self.isopenreset = false;
                                layerBox.showMsg(data.msg);
                            } else {
                                layerBox.showMsg('操作成功');
                                setTimeout(function () {
                                    window.location.reload();
                                }, 1e3);
                            }
                        }, function () {
                            self.isopenreset = false;
                            layerBox.showMsg('网络太差，请稍后重试');
                        });
                    }, function () {
                        self.isopenreset = false;
                    });
                }
            });
            keyboardJS.bind('.', function (e) {
                if (self.startUpStatus == '1') {
                    var videoobj = $('.videoBg.isplaying');
                    if (videoobj.length) {
                        if (videoobj[0].paused) {
                            videoobj[0].play();
                        } else {
                            videoobj[0].pause();
                        }
                    }
                } else if (self.startUpStatus == '2') {
                    var videoobj = $('.startvideo.isplaying');
                    if (videoobj.length) {
                        if (videoobj[0].paused) {
                            videoobj[0].play();
                        } else {
                            videoobj[0].pause();
                        }
                    }
                } else {
                    var videoobj = $('.endvideo.isplaying');
                    if (!videoobj.length) {
                        videoobj = $('.startvideo.isplaying');
                    }
                    if (videoobj.length) {
                        if (videoobj[0].paused) {
                            videoobj[0].play();
                        } else {
                            videoobj[0].pause();
                        }
                    }
                }
            });
            var isajaxpm = false;
            keyboardJS.bind(',', function (e) {
                if (self.showphb == 2 || self.startUpStatus != '3') {
                    return false;
                }
                if (!$(".rankBox").length) {
                    if (!self.rankTen.length) {
                        if (isajaxpm) {
                            return false;
                        }
                        isajaxpm = true;
                        screencore.ajaxSubmit("/screen/shakestart/gamepm", {}, '正在加载排名...').then(function (data) {
                            if (data.code == 0) {
                                //self.rankTen = data.msg;
                                self.gameEndphb(data.msg, self.phbnum);
                            } else {
                                layerBox.showMsg(data.msg);
                            }
                            isajaxpm = false;
                        }, function () {
                            isajaxpm = false;
                            layerBox.showMsg('加载出现异常，请刷新重试');
                        });
                    } else {
                        self.gameEndphb(self.rankTen, self.phbnum);
                    }
                } else {
                    $(".rankBox").remove();
                }
            })
        },
        isforceopen: false,
        waitendstart: false,
        isdjstimer: null,
        startopen: function (type) {
            if (!$(".shakestart-tip").is(':hidden')) {
                $(".shakestart-tip").addClass('hidden');
            }
            var self = this, type = type || '2', djsvideo = $(".videosbox .djsvideo"), playcurrent = localStorage.getItem(self.djslocalkey), videotime = parseInt(djsvideo.attr('time'));
            if (playcurrent != null && playcurrent != "null") {
                currentTime = playcurrent;
            } else {
                currentTime = 0;
            }
            if ($("#bgmusic").length && !$("#bgmusic")[0].paused) {
                $("#bgmusic")[0].pause();
            }
            if ($(".videoBg").length) {
                $(".videoBg").addClass('hidden').removeClass('isplaying');
                $(".videoBg")[0].pause();
            }
            if (djsvideo.length && currentTime != -1) {
                screencore.videofullScreen(".videosbox .djsvideo", screencore.getvideoData(djsvideo[0]));
                djsvideo.removeClass('hidden');
                if (currentTime > 0 && currentTime < videotime) {
                    djsvideo[0].currentTime = currentTime;
                }
                if ($("#djsaudio").length) {
                    djsvideo[0].play();
                    $("#djsaudio")[0].play();
                } else {
                    djsvideo[0].play().then(() => {

                    }).catch(err => {
                        djsvideo[0].volume = 0;
                        djsvideo[0].play();
                    });
                }
                self.isdjstimer = setInterval(function () {
                    screencore.ajaxSubmit("/screen/shakestart/gameiscountdown", {}).then(function (data) { });
                }, 1e3);
                djsvideo.unbind('ended').bind('ended', function () {
                    clearInterval(self.isdjstimer);
                    localStorage.setItem(self.djslocalkey, -1);
                    if ($("#djsaudio").length && !$("#djsaudio")[0].paused) {
                        $("#djsaudio")[0].pause();
                    }
                    self.confirmStart(type);
                });
                djsvideo.unbind('timeupdate').bind("timeupdate", function () {
                    localStorage.setItem(self.djslocalkey, Math.floor(djsvideo[0].currentTime));
                });
            } else {
                self.confirmStart(type);
            }
            screencore.hideFootAndQr();
        },
        scoretimer: null,
        confirmStart: function (type) {
            var self = this, startvideo = $(".videosbox .startvideo");
            if (self.isdjstimer != null) {
                clearInterval(self.isdjstimer);
            }
            if (startvideo.length) {
                screencore.videofullScreen(".videosbox .startvideo", screencore.getvideoData(startvideo[0]));
                startvideo.removeClass('hidden').addClass('isplaying');
                if ($("#startaudio").length) {
                    startvideo[0].play();
                } else {
                    startvideo[0].play().then(() => {
                    }).catch(err => {
                        startvideo[0].volume = 0;
                        startvideo[0].play();
                    });
                }
            } else {
                $(".main-bg").css({ "background-image": "url(" + $(".videosbox .startimg").attr("src") + ")" });
            }
            setTimeout(function () {
                $(".videosbox .djsvideo").addClass('hidden');
            }, 2e2);
            $(".ballBox").removeClass('hidden');
            if (showpercent == '1') {
                $(".ballpercent").removeClass('hidden');
            }
            if (showavatars == '1') {
                self.stageStop = false;
            }
            if ($("#djsaudio").length && !$("#djsaudio")[0].paused) {
                $("#djsaudio")[0].pause();
            }
            if ($("#startaudio").length) {
                $("#startaudio")[0].play();
            }
            if ($(".ballscore").length) {
                $(".ballscore").removeClass('hidden');
            }
            if (starttype == '1') {
                //时间助力
                if (type == '2') {
                    screencore.ajaxSubmit("/screen/shakestart/gameconfirmstart", { starttype: starttype, totaltime: totaltime }).then(function (data) { });
                } else {
                    //检查是否有倒计时发过来 有则无需再次转变游戏已经开始
                    setTimeout(function () {
                        if (self.iserror && self.startUpStatus == '2') {
                            self.percentData = 0;
                            screencore.ajaxSubmit("/screen/shakestart/gameconfirmstart", { starttype: starttype, totaltime: totaltime }).then(function (data) { });
                        }
                    }, 15e2);
                }
            } else {
                //成绩助力
                if ($(".dluserbox li").length) {
                    $(".dluserbox").removeClass('hidden');
                }
                if (type == '2') {
                    screencore.ajaxSubmit("/screen/shakestart/gameconfirmstart", { starttype: starttype }).then(function (data) { });
                }
                //发起定时获取用户成绩
                clearInterval(self.scoretimer);
                self.scoretimer = setInterval(function () {
                    screencore.ajaxSubmit("/screen/shakestart/gamescore", { starttype: starttype }).then(function (data) { });
                }, 1e3);
            }
            clearInterval(self.drawptimer);
            self.drawptimer = setInterval(function () {
                var ballH = ballsize * (1 - self.percentData / 100);
                $(".ballBox .inner .wave").css("background-position-y", `${ballH}px`);
                if (self.percentData >= 100) {
                    clearInterval(self.drawptimer);
                    clearInterval(self.scoretimer);
                    anime.remove('.ballpercent');
                    $(".ballpercent").html('100.00%');
                    setTimeout(function () {
                        screencore.ajaxSubmit("/screen/shakestart/gameend", { status: '3' }).then(function (data) {
                            if (data.code == 0) {
                                $(".dluserbox").addClass('hidden');
                                self.rankTen = data.msg;
                                self.endstart();
                            } else {
                                layerBox.showMsg(data.msg);
                            }
                        }, function () {
                            layerBox.showMsg('网络太差，请稍后重试');
                        });
                    }, 1e3);
                }
            }, 10);
        },
        percentData: 0,
        calcPercentData: function (percent,) {
            var self = this, percent = ((percent * 10000) / 100);
            if (percent > 100) {
                percent = 100;
            }
            self.percentData = percent.toFixed(2);
        },
        drawPercent: function (data) {
            anime({
                targets: $(".ballpercent")[0],
                innerHTML: data,
                easing: 'steps(11)',
                round: 100,
                update: function (anim) {
                    var p = $(".ballpercent").text();
                    p = p.replace('%', '');
                    if (!p.includes('.') || !/^\-?\d+(\.\d{2})?$/.test(p)) {
                        $(".ballpercent").text(`${parseFloat(p).toFixed(2)}%`);
                    }
                },
            });
        },
        drawScore: function (score) {
            var score = score || 0;
            if ($(".ballscore").length) {
                $(".ballscore span").text(score);
            }
        },
        //成绩模式
        updatePercent: function (data) {
            var self = this, startType = data.starttype || '1', oldPer = self.percentData;
            if (startType == '1') {
                self.calcPercentData(((totaltime - data.djs) / totaltime));
                self.drawPercent([oldPer, self.percentData]);
                //更新点数
                self.drawScore(data.allscore || 0);
            } else if (startType == '2') {
                self.calcPercentData(data.allscore / maxscore);
                self.drawPercent([oldPer, self.percentData]);
            } else if (startType == '3') {
                var dlcount = 0, len = $('.dllogos li').length;
                if (self.isforceopen) {
                    return false;
                }
                var lists = data.lists || [];
                if (lists.length) {
                    $.each(lists, function (i, v) {
                        if (v.status == '1') {
                            dlcount++;
                        }
                        var onelogo = $(`.dllogos .dllogo${v.id}`);
                        if (onelogo.length) {
                            if (v.status == '1') {
                                onelogo.addClass('active');
                            } else {
                                onelogo.removeClass('active');
                            }
                        }
                    });
                }
                if (len) {
                    self.calcPercentData(dlcount / len);
                } else {
                    self.percentData = 0;
                }
                self.drawPercent([oldPer, self.percentData]);
            }
        },
        rankTen: [],
        endstart: function (type) {
            var self = this, type = type || '2';
            localStorage.removeItem(self.djslocalkey);
            self.stageStop = true;
            $(".threeBox").empty();
            $(".ballpercent").addClass('hidden');
            $(".ballBox").addClass('hidden');
            if (showlogo == '1' && $(".logoBox img").attr('src') != '' && !$(".ballscore").length) {
                $(".logoBox").removeClass('hidden');
                $(".logoBox img").addClass('animated ' + logoani);
            }
            if ($(".ballscore").length) {
                $(".ballscore span").addClass('scalebig');
            }
            setTimeout(function () {
                if (showstars == '1' && showflower == '1') {
                    self.starcanvas.play(function () {
                        if (flowertype == '1') {
                            self.papercanvas.play(function () { });
                        } else {
                            self.flowerstart();
                        }
                    });
                } else if (showstars == '1' && showflower == '2') {
                    self.starcanvas.play(function () { });
                } else if (showstars == '2' && showflower == '1') {
                    if (flowertype == '1') {
                        self.papercanvas.play(function () { });
                    } else {
                        self.flowerstart();
                    }
                }
            }, 1e3);
            self.startUpStatus = '3';
            if (type == '1' && $(".videoBg").length) {
                $(".videoBg").addClass('hidden').removeClass('isplaying');
                if (!$(".videoBg")[0].paused) {
                    $(".videoBg")[0].pause();
                }
            }
            var endvideo = $(".videosbox .endvideo"), endimg = $(".videosbox .endimg");
            //有启动后视频或者图片
            if (endvideo.length || endimg.length) {
                //正常结束需先停止启动中的视频
                if (type == '2') {
                    if ($(".videosbox .startvideo").length) {
                        $(".videosbox .startvideo").addClass('hidden').removeClass('isplaying');
                        $(".videosbox .startvideo")[0].pause();
                    }
                }
                //有启动后视频
                if (endvideo.length) {
                    screencore.videofullScreen(".videosbox .endvideo", screencore.getvideoData(endvideo[0]));
                    endvideo.removeClass('hidden').addClass('isplaying');
                    //无论有无启动后音频先暂停启动中音频
                    //停止背景音频和启动中的音频
                    if ($("#bgmusic").length && !$("#bgmusic")[0].paused) {
                        $("#bgmusic")[0].pause();
                    }
                    if ($("#startaudio").length && !$("#startaudio")[0].paused) {
                        $("#startaudio")[0].pause();
                    }
                    if ($("#overaudio").length) {
                        endvideo.prop('muted', true);
                        endvideo[0].play();
                        if (endpausevideo == '1') {
                            endvideo[0].loop = false;
                            endvideo[0].addEventListener('ended', function () {
                                endvideo[0].pause();
                            });
                        }
                        $("#overaudio")[0].play();
                    } else {
                        endvideo[0].play().then(() => {
                        }).catch(err => {
                            endvideo.prop('muted', true);
                            endvideo[0].play();
                        });
                        if (endpausevideo == '1') {
                            endvideo[0].loop = false;
                            endvideo[0].addEventListener('ended', function () {
                                endvideo[0].pause();
                            });
                        }
                    }
                } else {
                    //启动后是图片
                    $(".main-bg").css({ "background-image": "url(" + endimg.attr("src") + ")" });
                    //有启动后音频则暂停背景音频和启动中的音频
                    if ($("#overaudio").length) {
                        if ($("#bgmusic").length && !$("#bgmusic")[0].paused) {
                            $("#bgmusic")[0].pause();
                        }
                        if ($("#startaudio").length && !$("#startaudio")[0].paused) {
                            $("#startaudio")[0].pause();
                        }
                        $("#overaudio")[0].play();
                    } else {
                        if (type == '1') {
                            if ($("#bgmusic").length && !$("#bgmusic")[0].paused) {
                                $("#bgmusic")[0].pause();
                            }
                            if ($("#startaudio").length) {
                                $("#startaudio")[0].play();
                            }
                        }
                    }
                }
            } else {
                //有结束的音频则停止背景音频和启动中的音频
                if ($("#overaudio").length) {
                    if ($("#bgmusic").length && !$("#bgmusic")[0].paused) {
                        $("#bgmusic")[0].pause();
                    }
                    if ($("#startaudio").length && !$("#startaudio")[0].paused) {
                        $("#startaudio")[0].pause();
                    }
                    $("#overaudio")[0].play();
                } else {
                    if (type == '1') {
                        if ($("#bgmusic").length && !$("#bgmusic")[0].paused) {
                            $("#bgmusic")[0].pause();
                        }
                        if ($("#startaudio").length) {
                            $("#startaudio")[0].play();
                        }
                    }
                }
                if (type == '1') {
                    var startvideo = $(".videosbox .startvideo");
                    if (startvideo.length) {
                        screencore.videofullScreen(".videosbox .startvideo", screencore.getvideoData(startvideo[0]));
                        startvideo.removeClass('hidden').addClass('isplaying');
                        startvideo[0].play();
                    } else {
                        $(".main-bg").css({ "background-image": "url(" + $(".videosbox .startimg").attr("src") + ")" });
                    }
                }
            }
            if (type == '1') {
                layerBox.showMsg('启动已完成，可通过键盘空格键重置', '0');
            }
        },
        starr: 0,
        stara: 0,
        staro: 0,
        stars: 12,
        staru: [],
        starl: [],
        initstar: function () {
            var self = this;
            self.starcanvas = $(".stars")[0];
            self.starctx = self.starcanvas.getContext('2d');
            self.starcanvas.resize = function () {
                self.starcanvas.width = window.innerWidth;
                self.starcanvas.height = window.innerHeight;
            };
            self.starcanvas.play = function (e) {
                !function (e) {
                    $(".stars").removeClass('hidden');
                    requestAnimationFrame(function () {
                        self.starcanvas.width = window.innerWidth;
                        self.starcanvas.height = window.innerHeight;
                        requestAnimationFrame(e)
                    })
                }(function () {
                    self.starcanvas.callback = e,
                        self.staru = [],
                        self.stari = 0,
                        self.starr = self.starcanvas.height,
                        self.starl = [],
                        self.stara = self.starcanvas.width,
                        self.staro = self.starcanvas.height,
                        requestAnimationFrame(self.starchange);
                })
            };
            self.starcanvas.reset = function () {
                self.starctx.clearRect(0, 0, self.starcanvas.width, self.starcanvas.height);
                $(".stars").addClass('hidden');
            };
        },
        starchange: function () {
            var self = screenshakestart;
            self.starctx.clearRect(0, 0, self.starcanvas.width, self.starcanvas.height);
            var e = self.starconfig(self.staru, self.stari, self.starr);
            t = self.starconfig(self.starl, self.stara, self.staro);
            self.stari += self.stars;
            self.stara -= self.stars;
            self.staro = self.starr -= Math.round(self.starcanvas.height / self.starcanvas.width * self.stars);
            var n = e && e.x > self.starcanvas.width && e.y < 0 && t && t.x < 0 && e.y < 0;
            if (!n) return requestAnimationFrame(self.starchange);
            self.starctx.clearRect(0, 0, self.starcanvas.width, self.starcanvas.height),
                $(".stars").addClass('hidden');
            requestAnimationFrame(self.starcanvas.callback);
        },
        starconfig: function (e, t, n) {
            var self = this, i;
            e.push(new
                function (e, t) {
                    var r = {
                        rgb: (n = ["213,117,240", "126,201,231", "143,214,166", "255,224,102", "255,105,102"], n[Math.floor(Math.random() * n.length)]),
                        //rgb: (n = ["210,180,71"], n[Math.floor(Math.random() * n.length)]),
                        alp: 1,
                        r: 5,
                        x: e,
                        y: t,
                        vx: i(),
                        vy: i(),
                        draw: function () {
                            self.starctx.fillStyle = "rgba(" + r.rgb + "," + r.alp + ")";
                            var e, t, n = 2 * Math.PI / 2.5;
                            self.starctx.beginPath();
                            for (var i = 0; i < 5; i++) e = Math.round(r.x + r.r * Math.cos(n * i)),
                                t = Math.round(r.y + r.r * Math.sin(n * i)),
                                self.starctx.lineTo(e, t);
                            self.starctx.closePath(),
                                self.starctx.fill(),
                                r.x += r.vx,
                                r.y += r.vy,
                                r.r += 1;
                        }
                    };
                    var n;
                    return r;
                    function i() {
                        return (.5 < Math.random() ? 1 : -1) * Math.round(2 * Math.random())
                    }
                }(t, n)),
                e.length > 80 && (i = e.shift());
            for (var r = 0; r < e.length; r++) a(e[r]);
            return i;
            function a(e) {
                e.alp -= 1.01 / 80,
                    e.draw()
            }
        },
        initpaper: function () {
            var self = this;
            self.papercanvas = $(".papers")[0];
            self.paperctx = self.papercanvas.getContext("2d");
            self.papercanvas.arr = [];
            for (var e = 0; e < 100; e++) {
                self.papercanvas.arr.push(self.makepapers());
            }
            self.papercanvas.resize = function () {
                self.papercanvas.width = window.innerWidth;
                self.papercanvas.height = window.innerHeight;
                self.papergetContext.clearRect(0, 0, self.papercanvas.width, self.papercanvas.height);
                self.papercanvas.arr.forEach(function (e) {
                    e.reset(1)
                });
            };
            self.papercanvas.play = function (e) {
                !function (e) {
                    $(".papers").removeClass('hidden');
                    requestAnimationFrame(function () {
                        self.papercanvas.width = window.innerWidth;
                        self.papercanvas.height = window.innerHeight;
                        self.paperctx.clearRect(0, 0, self.papercanvas.width, self.papercanvas.height);
                        self.papercanvas.arr.forEach(function (e) {
                            e.reset(1)
                        })
                        requestAnimationFrame(e)
                    })
                }(function () {
                    self.paperreplay();
                    requestAnimationFrame(e)
                })
            };
            self.papercanvas.reset = function () {
                self.paperctx.clearRect(0, 0, self.papercanvas.width, self.papercanvas.height);
                $(".papers").addClass('hidden');
            };
        },
        paperreplay: function () {
            var self = this;
            self.paperctx.clearRect(0, 0, self.papercanvas.width, self.papercanvas.height);
            self.papercanvas.arr.forEach(function (e) {
                e.draw()
            });
            requestAnimationFrame(self.paperreplay.bind(this));
        },
        makepapers: function () {
            var self = screenshakestart, i = self.papercanvas, r = {
                w: 18,
                h: 10,
                x: 0,
                y: 0,
                vx: 0,
                vy: 2,
                rotate: 0,
                color: "",
                angleX: 0,
                points: [],
                reset: e,
                draw: function () {
                    if (r.x += r.vx, r.y += r.vy, r.y > i.height + r.w / 2) return e();
                    if (r.y < -r.w / 2) return;
                    if (r.x < -r.w / 2 || r.x > i.width + r.w / 2) return;
                    r.points.forEach(function (e, t) {
                        e.rotateX(r.angleX)
                    }),
                        self.paperctx.fillStyle = r.color,
                        self.paperctx.save(),
                        self.paperctx.translate(r.x, r.y),
                        self.paperctx.rotate(r.rotate),
                        self.paperctx.beginPath(),
                        self.paperctx.moveTo(r.points[0].getScreenX(), r.points[0].getScreenY()),
                        r.points.forEach(function (e, t) {
                            t && self.paperctx.lineTo(e.getScreenX(), e.getScreenY())
                        }),
                        self.paperctx.closePath(),
                        self.paperctx.fill(),
                        self.paperctx.restore()
                }
            };
            return r;
            function e(e) {
                var t;
                r.x = Math.round(Math.random() * i.width),
                    r.y = e ? Math.round(Math.random() * i.height - i.height - r.w / 2) : -r.w / 2,
                    r.vx = a(1 * Math.random()),
                    r.rotate = a(Math.random() * Math.PI / 3),
                    r.color = (t = ["#00aecc", "#0079bf", "#b04632", "#d29034", "#89609e", "#519839", "#4bbf6b", "#cd5a91", "#428bca", "#5cb85c", "#5bc0de", "#f0ad4e", "#d9534f", "#6f5499"])[Math.floor(Math.random() * t.length)],
                    //r.color = (t = ["#d2b447"])[Math.floor(Math.random() * t.length)],
                    r.angleX = a(Math.random() * Math.PI / 20);
                var n = [];
                n.push(self.paperrotate(- r.w / 2, -r.h / 2)),
                    n.push(self.paperrotate(r.w / 2, -r.h / 2)),
                    n.push(self.paperrotate(r.w / 2, r.h / 2)),
                    n.push(self.paperrotate(- r.w / 2, r.h / 2)),
                    r.points = n
            }
            function a(e) {
                return !e && (e = 1), (Math.round(Math.random()) ? 1 : -1) * e
            }
        },
        paperrotate: function (e, t, n) {
            var a = {
                x: e || 0,
                y: t || 0,
                z: n || 0,
                fl: 500,
                vpX: 0,
                vpY: 0,
                cX: 0,
                cY: 0,
                cZ: 0,
                setVanishingPoint: function (e, t) {
                    a.vpX = e,
                        a.vpY = t
                },
                setCenter: function (e, t, n) {
                    a.cX = e,
                        a.cY = t,
                        a.cZ = n
                },
                rotateX: function (e) {
                    var t = Math.cos(e),
                        n = Math.sin(e),
                        i = a.y * t - a.z * n,
                        r = a.z * t + a.y * n;
                    a.y = i,
                        a.z = r
                },
                rotateY: function (e) {
                    var t = Math.cos(e),
                        n = Math.sin(e),
                        i = a.x * t - a.z * n,
                        r = a.z * t + a.x * n;
                    a.x = i,
                        a.z = r
                },
                rotateZ: function (e) {
                    var t = Math.cos(e),
                        n = Math.sin(e),
                        i = a.x * t - a.y * n,
                        r = a.y * t + a.x * n;
                    a.x = i,
                        a.y = r
                },
                getScreenX: function () {
                    var e = a.fl / (a.fl + a.z + a.cZ);
                    return a.vpX + (a.cX + a.x) * e
                },
                getScreenY: function () {
                    var e = a.fl / (a.fl + a.z + a.cZ);
                    return a.vpY + (a.cY + a.y) * e
                }
            };
            return a;
        },
        flowerstart: function () {
            var self = this, container = document.getElementById('leafContainer');
            for (var i = 0; i < 30; i++) {
                container.appendChild(self.createALeaf());
            }
        },
        randomInteger: function (low, high) {
            return low + Math.floor(Math.random() * (high - low));
        },
        randomFloat: function (low, high) {
            return low + Math.random() * (high - low);
        },
        pixelValue: function (value) {
            return value + 'px';
        },
        durationValue: function (value) {
            return value + 's';
        },
        createALeaf: function () {
            var self = this, leafDiv = document.createElement('div'), image = document.createElement('img');
            // image.src = PATH_URL+'realLeaf' + randomInteger(1, 5) + '.png';
            image.src = flowerimg;
            leafDiv.style.top = "-100px";
            leafDiv.style.left = self.pixelValue(self.randomInteger(0, window.screen.width));
            var spinAnimationName = (Math.random() < 0.5) ? 'clockwiseSpin' : 'counterclockwiseSpinAndFlip';
            leafDiv.style.webkitAnimationName = 'fade, drop';
            image.style.webkitAnimationName = spinAnimationName;
            var fadeAndDropDuration = self.durationValue(self.randomFloat(5, 11));
            var spinDuration = self.durationValue(self.randomFloat(4, 8));
            leafDiv.style.webkitAnimationDuration = fadeAndDropDuration + ', ' + fadeAndDropDuration;
            var leafDelay = self.durationValue(self.randomFloat(0, 5));
            leafDiv.style.webkitAnimationDelay = leafDelay + ', ' + leafDelay;
            image.style.webkitAnimationDuration = spinDuration;
            leafDiv.appendChild(image);
            return leafDiv;
        },
        oldjoinarr: [],
        newjoinarr: [],
        total: 36,
        onceshow: false,
        showopenids: [],
        stageStop: true,
        speed: 300,
        cards: [],
        stageInit: function () {
            var self = this, zoom = (window.innerHeight / 800).toFixed(4);
            self.speed = avatarspeed == '1' ? 100 : avatarspeed == '2' ? 300 : 500;
            self.camera = new THREE.PerspectiveCamera(40, window.innerWidth / zoom / 800, 1000, 10000);
            self.camera.position.z = 20000;
            self.scene = new THREE.Scene();
            var k = document.createElement("img");
            k.className = "headImg";
            var s, h = Math.sqrt(self.total), u = Math.floor(h / 2);
            for (var p = 0; p < self.total; p++) {
                var x = Math.floor(p / h) % h;
                var j = (p % h);
                if (x == u && j == u) {
                    continue
                }
                var o = k.cloneNode();
                o.style.display = 'none';
                var m = new THREE.CSS3DSprite(o);
                var w = window.innerWidth / zoom / h,
                    q = 800 / h;
                var g = w / q;
                var l = 300,
                    t = l * g;
                m.position.x = (j * w - window.innerWidth / zoom / 2 + w / 2) + (j - 2) * t;
                m.position.y = (x * q - 800 / 2 + q / 2) * -1 - (x - 2) * l;
                m.position.z = -10000;
                self.scene.add(m);
                self.cards.push(m);
            }
            self.renderer = new THREE.CSS3DRenderer();
            self.renderer.setSize(window.innerWidth / zoom, 800);
            self.renderer.domElement.style.position = "absolute";
            $(".threeBox")[0].appendChild(self.renderer.domElement);
            self.animate();
        },

        animate: function () {
            var self = this;
            requestAnimationFrame(function () {
                self.animate()
            });
            if (self.stageStop) {
                return;
            } else {
                $('.threeBox').removeClass('hidden');
            }
            self.speed -= 1;
            if (self.speed < 200) {
                self.speed = 200
            }
            for (var j = 0; j < self.cards.length; j++) {
                var h = self.cards[j];
                h.position.z -= self.speed;
                if (h.position.z < -10000) {
                    h.element.style.display = "none";
                    var l = false;
                    if (!self.onceshow) {
                        if (self.newjoinarr.length) {
                            l = self.newjoinarr.shift();
                        } else if (self.oldjoinarr.length) {
                            l = self.oldjoinarr[Math.floor((Math.random() * self.oldjoinarr.length))];
                        }
                    } else {
                        if (self.oldjoinarr.length) {
                            var one = self.oldjoinarr.shift();
                            if ($.inArray(one.openid, self.showopenids) === -1) {
                                l = one;
                                self.showopenids.push(l.openid);
                            }
                        }
                    }
                    if (l) {
                        h.element.src = l.avatar;
                        h.element.style.display = "block";
                        h.position.z = h.element.src === '' ? screencore.randomInt(1000, 2000) : screencore.randomInt(20000, 40000);
                    }
                }
            }
            self.renderer.render(self.scene, self.camera);
        },
        totalLenth: 0,
        loadedLenth: 0,
        preloadAll: function (fuc) {
            var self = this, result = {};
            pxPreload.start({
                filelists: fileLists,
                progress: function (data) {
                    data = data || false;
                    if (data) {
                        result[data.key] = data;
                        var percent = (Math.round(data.load / data.total * 10000) / 100);
                        $(".load-percent").html(percent + '%');
                        $(".load-progress span").css('width', percent + '%');
                    }
                },
                complete: function () {
                    fuc && fuc(result);
                },
            });
        },
        preloadVideos: function (data) {
            var self = this;
            data.onError = data.onError || function () { }
            data.noSupport = data.noSupport || function () { }
            data.onFail = data.onFail || function () { }
            data.onLoad = data.onLoad || function () { }
            data.onComplete = data.onComplete || function () { }
            var videoList = data.src || preloadall.videos, len = videoList.length;
            if (len == 0) {
                return data.onComplete([], 0);
            }
            var yesnum = 0, nonum = 0, result = [];
            for (var x = 0; x < len; x++) {
                var video = document.createElement('video');
                video.src = videoList[x];
                video.style.display = 'none';
                video.load();
                document.body.appendChild(video);
                video.addEventListener('canplaythrough', function () {
                    var dir = self.getData(this);
                    dir.name = videoList[(yesnum + nonum)];
                    result.push(dir);
                    $(this).remove();
                    yesnum++;
                    self.loadedLenth++;
                    var percent = (Math.round(self.loadedLenth / self.totalLenth * 10000) / 100);
                    $(".load-percent").html(percent + '%');
                    $(".load-progress span").css('width', percent + '%');
                    if (result.length >= len) {
                        return data.onComplete(result, nonum);
                    }
                });
                video.addEventListener('error', function () {
                    var dir = { dir: 1, width: 0, height: 0, time: 0, name: videoList[(yesnum + nonum)] };
                    result.push(dir);
                    $(this).remove();
                    nonum++;
                    self.loadedLenth++;
                    var percent = (Math.round(self.loadedLenth / self.totalLenth * 10000) / 100);
                    $(".load-percent").html(percent + '%');
                    $(".load-progress span").css('width', percent + '%');
                    if (result.length >= len) {
                        return data.onComplete(result, nonum);
                    }
                });
            }
        },
        getId: function () {
            return ('Video' + Math.random() + new Date().getTime()).replace('.', '');
        },
        getData: function (video) {
            video = video.length ? video[0] : video;
            var videoW = video.videoWidth;
            var videoH = video.videoHeight;
            var dir = videoW / videoH;
            var time = parseInt(video.duration);
            return { dir: dir, width: videoW, height: videoH, time: time }
        },
        preloadImages: function (data) {
            var self = this;
            data.onComplete = data.onComplete || function () { }
            var src = preloadall.imgs || [];
            var len = src.length;
            if (len == 0) {
                return data.onComplete();
            }
            var index = 0;
            for (var x = 0; x < len; x++) {
                var img = new Image();
                img.onload = img.onerror = function () {
                    index++;
                    self.loadedLenth++;
                    var percent = (Math.round(self.loadedLenth / self.totalLenth * 10000) / 100);
                    $(".load-percent").html(percent + '%');
                    $(".load-progress span").css('width', percent + '%');
                    if (index == len) {
                        data.onComplete();
                    }
                    this.onload = this.onerror = null;
                }
                img.src = src[x];
            }
        },
        gameEndphb: function (list, num) {
            var self = this, num = num || 10;
            $("body").append(self.rankrender({}));
            var r = $(".rankBox"), o = $(".rank-others li"), oo = $(".rank-others2 li");
            for (var i = 0, j = list.length; i < j; i++) {
                if (i < 3) {
                    if (i < num && list[i]) {
                        var box = i == 0 ? r.find('.rank-item-first') : i == 1 ? r.find('.rank-item-second') : r.find('.rank-item-third');
                        box.find('img').attr('src', list[i].avatar);
                        box.find('p').text(list[i].nickname);
                    }
                } else {
                    if (i < num && list[i]) {
                        if (i > 9) {
                            oo.eq((i - 10)).find('img').attr('src', list[i].avatar);
                            oo.eq((i - 10)).find('p span').text(list[i].nickname);
                        } else {
                            o.eq((i - 3)).find('img').attr('src', list[i].avatar);
                            o.eq((i - 3)).find('p span').text(list[i].nickname);
                        }
                    }
                }
            }
            r.removeClass('display-none');
            if (num <= 3) {
                $(".rank-others").remove();
                num >= 1 && $(".rankfirst-second-third .rank-item-first").removeClass('opacity-hide').animateControl('bounceInDown');
                num >= 2 && $(".rankfirst-second-third .rank-item-second").removeClass('opacity-hide').animateControl('bounceInDown');
                num == 3 && $(".rankfirst-second-third .rank-item-third").removeClass('opacity-hide').animateControl('bounceInDown');
                setTimeout(function () {
                    //$('.rankBox-btns').removeClass('opacity-hide');
                }, 1e3);
            } else {
                if (num < 11) {
                    $(".rank-others2").remove();
                }
                $(".rankfirst-second-third .rank-item").removeClass('opacity-hide');
                $('.rank-item-first').animateControl('bounceInDown');
                $('.rank-item-second').animateControl('bounceInDown');
                $('.rank-item-third').animateControl('bounceInDown');
                setTimeout(function () {
                    if ($(".rank-others .rank-others-item:gt(" + (num - 4) + ")").length) {
                        $(".rank-others .rank-others-item:gt(" + (num - 4) + ")").remove();
                    }
                    $('.rank-others').removeClass('opacity-hide').animateControl('bounceInUp', function () {
                        if (num > 10) {
                            if ($(".rank-others2 .rank-others-item:gt(" + (num - 11) + ")").length) {
                                $(".rank-others2 .rank-others-item:gt(" + (num - 11) + ")").remove();
                            }
                            $('.rank-others2').removeClass('opacity-hide').animateControl('bounceInUp', function () {
                                //$('.rankBox-btns').removeClass('opacity-hide');
                            });
                        } else {
                            //$('.rankBox-btns').removeClass('opacity-hide');
                        }
                    });
                }, 6e2);
            }
        },
    };
    return screenshakestart;
});