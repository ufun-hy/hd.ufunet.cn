/*
* @Author: 赞木
* @Date:   2022-07-27 13:17:51
* @Last Modified by:   赞木
* @Last Modified time: 2022-12-05 11:27:40
*/
define('screenliuyancjdm', ['screensocket', 'screencore', 'layerBox', 'template', 'keyboard', 'anime', 'fulldm', 'danmuku'], function (screensocket, screencore, layerBox, template, keyboardJS, anime, fulldm, Danmuku) {
    var screenliuyancjdm = {
        fromtype: '1',
        styletype: '1',
        photos: [],
        //弹幕发送时间间隔
        dmSendSpeed: 500,
        //弹幕运行时间
        lowRunSpeed: [8, 10],
        highRunSpeed: [2, 3],
        isstart: '1',
        prizeIndex: 0,
        prizeInfo: [],
        luckerids: [],
        //孔明灯配置
        lanternManager: null,
        lanterntpl: null,
        oldLanterns: [],
        newLanterns: [],
        intervalId: null,
        init: function () {
            var self = this;
            self.initdata(function () {
                self.styletype = styletype || '1';
                self.initprize(true);
                self.initSocket();
                self.bindevent();
                setTimeout(function () {
                    var openqrobj = screencore.getdom('.opendm'), isstop = openqrobj.find('.isstop');
                    if (isstop.is(':hidden')) {
                        openqrobj.trigger('click', 'withouts');
                    }
                }, 1e2)
            });
        },
        initdata: function (fn) {
            var self = this;
            screencore.ajaxSubmit("/screen/liuyancj/initdata", { gametype: XCV3Config.gametype }).then(function (json) {
                if (json.code == 0) {
                    self.prizeInfo = json.msg.prizelist;
                    self.fromtype = json.msg.fromtype;
                    if (self.prizeInfo.length) {
                        var ajaxmsgs = json.msg.list.reverse();
                        self.oldLanterns = ajaxmsgs;
                        fn && fn();
                    } else {
                        $(".liuyancj-mainbox .emptybox").removeClass('hidden');
                    }
                }
            }, function () {
                layerBox.showMsg('加载出错');
            });
        },
        initprize: function (isfirst) {
            isfirst = isfirst || false;
            var self = this, prizeOne = self.prizeInfo[self.prizeIndex];
            if (!prizeOne) return;
            //奖品信息
            $(".liuyancj-header .awardname").text(prizeOne.awardname);
            $(".liuyancj-header .prizename").text(prizeOne.prizename);
            $(".liuyancj-body img").attr('src', prizeOne.prizeimg);
            //底部参数
            $(".liuyancj-footer .active-prize").text(prizeOne.awardname).attr("data-prizeid", prizeOne.id);
            $(".select-box .onceout").val(prizeOne.onceout);
            self.initprizeandluckernum();
            $(".liuyancj-lists").removeClass('hidden');
            if (!isfirst) {
                //self.initprizemsgs(prizeOne.id);
            }
        },
        initprizeandluckernum: function (prizeid) {
            var self = this;
            prizeid = prizeid || self.prizeInfo[self.prizeIndex].id;
            screencore.ajaxSubmit('/screen/liuyancj/ajaxprizeluckernum', { prizeid: prizeid, gametype: XCV3Config.gametype }).then(function (json) {
                if (json.code == 0) {
                    $(".lucker-numbox .prize-num").text(json.msg.prizenum);
                    $(".lucker-numbox .lucker-num").text(json.msg.luckernum);
                } else {
                    layerBox.showMsg(json.msg);
                }
            });
        },
        //切换奖品加载对应
        initprizemsgs: function (prizeid) {
            var self = this;
            screencore.ajaxSubmit('/screen/liuyancj/ajaxprizemsgs', { prizeid: prizeid }).then(function (json) {
                if (json.code != 0) {
                    return layerBox.showMsg(json.msg);
                }
                //self.oldLanterns = ajaxmsgs;
            });
        },
        initSocket: function () {
            var self = this, params = {};
            params.onmessage = function (data) {
                if (data.type == 'connected') {
                    screensocket.isclose = false;
                    screencore.connectsocket({ clientid: data.clientid });
                } else if (data.type == 'liuyancjmsg') {
                    var messages = data.messages;
                    if (messages) {
                        if ($.isArray(messages) && messages.length) {
                            $.each(messages, function (i, val) {
                                if (val.type == '1') {
                                    self.addnewMsg(val);
                                }
                            });
                        }
                    } else {
                        self.addnewMsg(data);
                    }
                } else if (data.type == 'screendm') {
                    var messages = data.messages;
                    if (messages) {
                        if ($.isArray(messages) && messages.length) {
                            $.each(messages, function (i, val) {
                                if (val.type == '1') {
                                    if (data.dmtype == self.fromtype) {
                                        self.addnewMsg(val);
                                    }
                                }
                                fulldm.addBullet(val);
                            });
                        }
                    } else {
                        if (data.dmtype == self.fromtype) {
                            self.addnewMsg(data);
                        }
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
        bindevent: function () {
            var self = this, clickstart = false;
            self.lanterntpl = template(self.styletype == '2' ? 'lantern-tpl' : 'barrage-tpl');
            self.lanternManager = Danmuku.create({
                container: $('.liuyancj-dm')[0],
                width: 150,
                height: 100,
                confusion: (self.styletype == '2' ? '2' : '2'),
                rowGap: (self.styletype == '2' ? 1 : 50),
                direction: (self.styletype == '2' ? 'bottom' : 'right'),
                times: self.lowRunSpeed,
                limit: 500,
                interval: 0.5,
                capacity: 1000,
                hooks: {
                    barrageCreate(barrage, node) {
                        var data = barrage.data;
                        data.scale = 1;
                        if (!data.hasOwnProperty('isnew')) {
                            data.scale = (0.1 + Math.random() * 0.8).toFixed(2);
                        }
                        if (self.styletype == '2') {
                            data.type = screencore.randomInt(1, lanternLen);
                        } else {
                            if (dmstyle.needbg == '1') {
                                data.bgcolor = dmstyle.bgcolor;
                                if (dmstyle.bgcolortype == '2') {
                                    data.bgcolor = self.randColor();
                                }
                            }
                            data.fontcolor = dmstyle.fontcolor;
                            if (dmstyle.fontcolortype == '2') {
                                data.fontcolor = self.randColor();
                            }

                        }
                        if (data.content) {
                            data.content = screencore.emoToimg(data.content);
                        }
                        $(node).html(self.lanterntpl(data)).addClass(self.styletype == '2' ? 'lantern-box' : 'barrage-box');
                    },
                }
            });
            self.lanternManager.start();
            $(window).resize(function () {
                self.lanternManager.resize();
            });
            self.loopSend();
            $(document).on('webkitvisibilitychange mozvisibilitychange visibilitychange', function () {
                if (document.hidden) {
                    clearInterval(self.intervalId);
                    self.intervalId = null;
                    self.lanternManager.clear();
                } else {
                    if (!self.intervalId) {
                        self.lanternManager.clear();
                        self.lanternManager.start();
                        self.loopSend();
                    }
                }
            });
            //键盘与点击事件
            keyboardJS.bind('space', function (e) {
                $(".btn-start").trigger('click');
            });
            $(".btn-start").click(function () {
                var $this = $(this);
                if (self.isstart == '1') {
                    if (clickstart) {
                        return false;
                    }
                    clickstart = true;
                    screencore.ajaxSubmit('/screen/liuyancj/savelucker', {
                        prizeid: $(".active-prize").attr('data-prizeid'),
                        selnum: $(".onceout").val(),
                        gametype: XCV3Config.gametype
                    }).then(function (e) {
                        if (e.code == 0) {
                            self.luckerids = e.msg.luckerids;
                            var html = '';
                            $.each(e.msg.list, function (i, v) {
                                var nickname = '';
                                if (v.showitems.length > 0) {
                                    var bdval = '';
                                    $.each(v.showitems, function (index, val) {
                                        bdval += '<span>' + val + '</span>';
                                    });
                                    nickname += bdval;
                                } else {
                                    nickname += '<span>' + v.nickname + '</span>';
                                }
                                v.nickname = nickname;
                                v.content = screencore.emoToimg(v.content);
                                html += template("lucker-tpl", v);
                            });
                            $(".liuyancj-luckerbox-lists").html(html).removeClass('txtsize1 txtsize2');
                            var num = e.msg.list.length;
                            if (num > 0 && num < 3) {
                                $(".liuyancj-luckerbox-lists").addClass('txtsize1');
                            } else if (num > 2 && num < 5) {
                                $(".liuyancj-luckerbox-lists").addClass('txtsize2');
                            }
                            screencore.hideFootAndQr();
                            setTimeout(function () {
                                if ($(".firevideo1").length) {
                                    $(".firevideo1").show();
                                    $(".firevideo1")[0].play();
                                    $(".firevideo1").unbind('ended').bind('ended', function () {
                                        $(this).hide();
                                    });
                                }
                            }, 50);
                            $(".liuyancj-mainbox").removeClass('isdrawed').addClass('isdrawing');
                            self.isstart = '2';
                            self.resetLanternSpeed('fast')
                            screencore.bgmusicpause();
                            if ($("#cjingmusic").length) {
                                $("#cjingmusic")[0].play();
                            }
                            setTimeout(function () {
                                $this.text('停止');
                                $(".lucker-numbox .prize-num").text(e.msg.prizenum);
                                $(".lucker-numbox .lucker-num").text(e.msg.total);
                            }, 3e3);
                        } else {
                            layerBox.showMsg(e.msg);
                        }
                        setTimeout(function () {
                            clickstart = false;
                        }, 1e3);

                    }, function () {
                        clickstart = false;
                        layerBox.showMsg('出现异常，请稍后重试');
                    })
                } else if (self.isstart == '2') {
                    if ($this.text() == '开始') {
                        return false;
                    }
                    $(".liuyancj-wall").addClass('opacity0');
                    $(".liuyancj-mainbox").removeClass('isdrawing').addClass('isdrawed');
                    $this.text('关闭');
                    if ($(".firevideo2").length) {
                        $(".firevideo2").show();
                        $(".firevideo2")[0].play();
                        $(".firevideo2").unbind('ended').bind('ended', function () {
                            $(this).hide();
                        });
                    }
                    self.isstart = '3';
                    self.resetLanternSpeed('slow');
                    if ($("#cjingmusic").length) {
                        $("#cjingmusic")[0].currentTime = 0;
                        $("#cjingmusic")[0].pause();
                    }
                    if ($("#cjendmusic").length) {
                        $("#cjendmusic")[0].play();
                    }
                    screencore.sendLuckerTpl({ luckerids: self.luckerids }, function () {
                        self.luckerids = [];
                    });
                    if (isautoscroll == '1') {
                        setTimeout(function () {
                            self.initautoScroll('.liuyancj-luckerbox-content');
                        }, 2e3);
                    }
                } else if (self.isstart == '3') {
                    if (isautoscroll == '1') {
                        self.removeautoScroll('.liuyancj-luckerbox-content');
                        setTimeout(function () {
                            $(".liuyancj-mainbox").removeClass('isdrawed');
                        }, 20);
                    } else {
                        $(".liuyancj-mainbox").removeClass('isdrawed');
                    }
                    $this.text('开始');
                    self.isstart = '1';
                    $(".liuyancj-wall").removeClass('opacity0');
                    if ($("#cjendmusic").length) {
                        $("#cjendmusic")[0].currentTime = 0;
                        if (!$("#cjendmusic")[0].paused) {
                            $("#cjendmusic")[0].pause();
                        }
                    }
                    setTimeout(function () {
                        screencore.bgmusicplay();
                    }, 1e3);
                }
            });
            $(".liuyancj-luckerbox-lists").on('click', ".delphoto i", function () {
                var $this = $(this), recordid = $this.attr('data-id');
                layerBox.showConfirm('警告', '删除将无法恢复，确定要删除此中奖用户么?', ['确定', '取消'], function () {
                    screencore.ajaxSubmit('/screen/liuyancj/dellucker', { recordid: recordid, prizeid: self.prizeInfo[self.prizeIndex].id }, '').then(function (json) {
                        if (json.code == 0) {
                            $this.parent().parent().parent().parent().remove();
                            layerBox.showMsg('删除成功');
                            self.initprizeandluckernum();
                            var num = $(".liuyancj-luckerbox-lists li").length;
                            $(".liuyancj-luckerbox-lists").removeClass('txtsize1 txtsize2');
                            if (num > 0 && num < 3) {
                                $(".liuyancj-luckerbox-lists").addClass('txtsize1');
                            } else if (num > 2 && num < 5) {
                                $(".liuyancj-luckerbox-lists").addClass('txtsize2');
                            }
                        } else {
                            layerBox.showMsg(json.msg);
                        }
                    });
                });
            });
            var allluckerclicked = false;
            $(".btn-showalllucker").click(function () {
                var $this = $(this);
                if (self.isstart == '1') {
                    if (allluckerclicked) return false;
                    allluckerclicked = true;
                    self.isstart = '4';
                    self.getprizelucker(self.prizeInfo[self.prizeIndex].id, function (data) {
                        var lucker = data.list, html = '';
                        $.each(lucker, function (i, v) {
                            var nickname = '';
                            if (v.showitems.length > 0) {
                                var bdval = '';
                                $.each(v.showitems, function (index, val) {
                                    bdval += '<span>' + val + '</span>';
                                });
                                nickname += bdval;
                            } else {
                                nickname += '<span>' + v.nickname + '</span>';
                            }
                            v.nickname = nickname;
                            v.content = screencore.emoToimg(v.msgcontent);
                            html += template("lucker-tpl", v);
                        });
                        var bigclass = "txtsize1", bigclass2 = "txtsize2";;
                        if (lucker.length < 3) {
                            $(".liuyancj-luckerbox-lists").html(html).removeClass(bigclass2).addClass(bigclass);
                        } else if (lucker.length > 2 && lucker.length < 5) {
                            $(".liuyancj-luckerbox-lists").html(html).removeClass(bigclass).addClass(bigclass2);
                        } else {
                            $(".liuyancj-luckerbox-lists").html(html).removeClass(bigclass).removeClass(bigclass2);
                        }
                        $(".btn-start").addClass('hidden');
                        $(".btn-close").removeClass('hidden');
                        $(".liuyancj-mainbox").removeClass('isdrawing').addClass('isdrawed');
                        allluckerclicked = false;
                        if (isautoscroll == '1') {
                            setTimeout(function () {
                                self.initautoScroll('.liuyancj-luckerbox-content');
                            }, 2e3);
                        }
                        $(".liuyancj-wall").addClass('opacity0');
                    }, function (errmsg) {
                        self.isstart = '1';
                        layerBox.showMsg(errmsg);
                    });
                } else if (self.isstart == '4') {
                    $(".btn-close").trigger('click');
                }
            });
            $(".btn-close").click(function () {
                self.isstart = '1';
                $(".btn-start").removeClass('hidden');
                if (isautoscroll == '1') {
                    self.removeautoScroll('.liuyancj-luckerbox-content');
                    setTimeout(function () {
                        $(".liuyancj-mainbox").removeClass('isdrawed');
                    }, 20);
                } else {
                    $(".liuyancj-mainbox").removeClass('isdrawed');
                }
                $(this).addClass('hidden');
                $(".liuyancj-wall").removeClass('opacity0');
            });
            keyboardJS.bind('/', function (e) {
                if (self.isstart == '2') return false;
                layerBox.showConfirm('警告', '清空将删除当前奖品的所有中奖用户，并且无法恢复，您确定要清空？', ['确定', '取消'], function () {
                    screencore.ajaxSubmit('/screen/liuyancj/delalllucker', { prizeid: self.prizeInfo[self.prizeIndex].id, gametype: XCV3Config.gametype }, '').then(function (e) {
                        if (e.code == 0) {
                            $(".liuyancj-luckerbox-lists li").remove();
                            self.initprizeandluckernum();
                            layerBox.showMsg('清空成功');
                        } else {
                            layerBox.showMsg(e.msg);
                        }
                    });
                });
            });
            //切换奖品
            $(".liuyancj-footer .prev-prize").click(function () {
                if (self.isstart != '1' || self.prizeInfo.length == 0) return false;
                self.prizeIndex--;
                if (self.prizeIndex < 0) {
                    self.prizeIndex = self.prizeInfo.length - 1;
                }
                self.initprize();
            });
            $(".liuyancj-footer .next-prize").click(function () {
                if (self.isstart != '1' || self.prizeInfo.length == 0) return false;
                self.prizeIndex++;
                if (self.prizeIndex >= self.prizeInfo.length) {
                    self.prizeIndex = 0;
                }
                self.initprize();
            });
            keyboardJS.bind('left', function (e) {
                $(".liuyancj-footer .prev-prize").trigger('click');
            });
            keyboardJS.bind('right', function (e) {
                $(".liuyancj-footer .next-prize").trigger('click');
            });
            keyboardJS.bind('up', function (e) {
                if (self.isstart != '1') return false;
                var denum = parseInt($(".onceout").val());
                denum++;
                if (denum >= self.prizeInfo[self.prizeIndex].prizenum) {
                    denum = self.prizeInfo[self.prizeIndex].prizenum;
                }
                $(".onceout").val(denum);
            });
            keyboardJS.bind('down', function (e) {
                if (self.isstart != '1') return false;
                var denum = parseInt($(".onceout").val());
                if (denum > 1) {
                    denum--;
                } else {
                    denum = 1;
                }
                $(".onceout").val(denum);
            });
            keyboardJS.bind('shift', function (e) {
                $(".btn-showalllucker").trigger('click');
            });
        },
        loopSend: function () {
            var self = this;
            self.intervalId = setInterval(() => {
                var oneLantern = '', isnew = '2';
                if (self.newLanterns.length) {
                    oneLantern = self.newLanterns.shift();
                    if (oneLantern) {
                        oneLantern.isnew = '1';
                        isnew = '1';
                    }
                }
                if (!oneLantern) {
                    if (self.oldLanterns.length) {
                        oneLantern = self.oldLanterns[Math.floor(Math.random() * self.oldLanterns.length)];
                    }
                }
                if (oneLantern) {
                    if (!self.lanternManager.send(oneLantern)) {
                        if (isnew === '1') {
                            var index = self.newLanterns.findIndex((item) => {
                                return item.id === data.id
                            });
                            if (index === -1) {
                                if (oneLantern.hasOwnProperty('isnew')) {
                                    delete oneLantern.isnew;
                                }
                                self.newLanterns.unshift(oneLantern);
                            }
                        }
                    } else {
                        if (isnew === '1') {
                            if (oneLantern.hasOwnProperty('isnew')) {
                                delete oneLantern.isnew;
                            }
                            self.oldLanterns.push(oneLantern);
                        }
                    }
                }
            }, self.dmSendSpeed);
        },
        addnewMsg: function (msg) {
            var self = this;
            if (msg.type == 'screendm') {
                msg.type = msg.msgtype || '1';
            }
            if (msg.type == '2') {
                return false;
            }
            self.newLanterns.push(msg);
        },
        resetAllLantern: function () {
            var self = this;
            self.oldLanterns = [];
            self.newLanterns = [];
            self.lanternManager.clear();
            self.lanternManager.start();
        },
        resetLanternSpeed: function (type) {
            var self = this;
            self.dmSendSpeed = (type == 'fast' ? 50 : 500);
            clearInterval(self.intervalId);
            self.loopSend();

            //重置屏幕上的弹幕的速度
            self.lanternManager.each(barrage => {
                barrage.pause();
                barrage.resume2(type == 'fast' ? self.highRunSpeed : self.lowRunSpeed);
            });
            // if (type == 'fast') {
            //     self.lanternManager.each(barrage => {
            //         barrage.pause();
            //         barrage.resume2(self.highRunSpeed);
            //     });
            // } else {
            //     self.lanternManager.clear();
            //     self.lanternManager.start();
            // }
            //重置后期新弹幕的速度
            self.lanternManager.setOptions({
                interval: (type == 'fast' ? 0.1 : 1),
                times: (type == 'fast' ? self.highRunSpeed : self.lowRunSpeed)
            });
        },
        getprizelucker: function (id, fn, fn2) {
            var self = this;
            screencore.ajaxSubmit('/screen/liuyancj/ajaxlucker', { prizeid: id, gametype: XCV3Config.gametype }, '正在加载中奖记录..').then(function (e) {
                if (e.code == 0) {
                    fn && fn(e.msg);
                } else {
                    fn2 && fn2(e.msg);
                }
            });
        },
        scrollSpeed: 50,
        animescrollobj: null,
        startScrollY: 0,
        scrollReset: false,
        loopScrollcount: 1,
        initautoScroll: function (classname, resettype) {
            var self = this, resettype = resettype || false;
            if ($(classname).length <= 0) {
                return false;
            }
            var animes = anime.running;
            anime.remove(classname);
            var self = this, scrollHeight = $(classname)[0].scrollHeight, height = $(classname).outerHeight(), maxscrollH = Math.ceil(scrollHeight - height);
            if (maxscrollH > 0) {
                if (self.loopScrollcount % 2 === 0) {
                    var duration = (self.startScrollY / self.scrollSpeed) * 1e3;
                    var scrollTop = [self.startScrollY, 0];
                    if (resettype) {
                        duration = (maxscrollH / self.scrollSpeed) * 1e3;
                        scrollTop = [maxscrollH, 0];
                    }
                } else {
                    var duration = ((maxscrollH - self.startScrollY) / self.scrollSpeed) * 1e3;
                    var scrollTop = [self.startScrollY, maxscrollH];
                }
                self.animescrollobj = anime({
                    targets: classname,
                    scrollTop: scrollTop,
                    duration: duration,
                    direction: 'alternate',
                    loop: true,
                    autoplay: true,
                    easing: 'linear',
                    loopComplete: function (anim) {
                        self.startScrollY = 0;
                        self.loopScrollcount++;
                        if (self.scrollReset) {
                            self.initautoScroll(classname, self.loopScrollcount % 2 === 0);
                            self.scrollReset = false;
                        }
                    },
                });
                $(classname).unbind("mouseenter").bind("mouseenter", function () {
                    if (self.animescrollobj) {
                        self.animescrollobj.pause();
                        self.startScrollY = $(classname).scrollTop();
                    }
                });
                $(classname).unbind("mouseleave").bind("mouseleave", function () {
                    self.startScrollY = $(classname).scrollTop();
                    self.scrollReset = true;
                    self.initautoScroll(classname);
                });
            }

        },
        removeautoScroll: function (classname) {
            var self = this;
            if (self.animescrollobj) {
                self.animescrollobj.pause();
                if (classname) {
                    self.animescrollobj.remove(classname);
                    $(classname).scrollTop(0);
                }
                self.animescrollobj = null;
            }
            self.startScrollY = 0;
            self.scrollReset = false;
            self.loopScrollcount = 1;
        },
        randColor: function () {
            var e = 0.9,
                t = ["rgba(141,50,160," + e + ")", "rgba(225,99,15," + e + ")", "rgba(242,73,73," + e + ")", "rgba(18,155,240," + e + ")", "rgba(90,162,12," + e + ")", "rgba(20,185,148," + e + ")"],
                n = Math.floor(6 * Math.random());
            return t[n]
        },
    };
    return screenliuyancjdm;
});
