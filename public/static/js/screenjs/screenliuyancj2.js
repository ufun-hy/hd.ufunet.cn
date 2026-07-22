define('screenliuyancj2', ['screensocket', 'screencore', 'template', 'layerBox', 'fulldm', 'keyboard', 'anime'], function (screensocket, screencore, template, layerBox, fulldm, keyboardJS, anime) {
    var screenliuyancj2 = {
        txt: '虚位以待',
        fromtype: '1',
        msgtpl: null,
        oldmsg: [],
        onepage: 4,
        prizeInfo: [],
        luckerids: [],
        init: function () {
            var self = this;
            self.shapeTime = rotatesecond * 1e3;
            self.loadMsg();
        },
        loadMsg: function () {
            var self = this;
            self.msgtpl = template('msg-tpl');
            screencore.ajaxSubmit("/screen/liuyancj/initdata", { gametype: XCV3Config.gametype }).then(function (json) {
                if (json.code == 0) {
                    self.prizeInfo = json.msg.prizelist;
                    self.fromtype = json.msg.fromtype;
                    if (self.prizeInfo.length > 0) {
                        var ajaxmsgs = json.msg.list.reverse(), msglen = ajaxmsgs.length;
                        for (var i = 0; i < msglen; i++) {
                            var one = ajaxmsgs[i % msglen];
                            one.content = screencore.emoToimg(one.content);
                            $(".liuyan-messagelist").append(self.msgtpl(one));
                        }
                        self.oldmsg = ajaxmsgs;
                        $(".liuyan-joinnum span").text(json.msg.total);
                        self.bindEvent();
                    } else {
                        $(".emptybox").removeClass('display-none');
                    }
                }
                setTimeout(function () {
                    self.loopRun();
                }, 200);
            }, function () {
                layerBox.showMsg('加载出错');
            });
        },
        loopDuration: 2e3,
        loopDelay: 0,
        animeObj: null,
        loopRun: function () {
            var self = this;
            var contentsbox = $('.liuyan-messageBox');
            var contentbox = $('.liuyan-messagelist');
            if (contentbox.outerHeight() >= contentsbox.outerHeight()) {
                var firstdom = contentbox.find('li').first(), scrollH = firstdom.outerHeight(true);
                self.animeObj = anime({
                    targets: contentbox.get(0),
                    translateY: [0, -scrollH],
                    easing: 'linear',
                    duration: self.loopDuration,
                    delay: self.loopDelay,
                    complete: function () {
                        var one = self.oldmsg.shift();
                        self.oldmsg.push(one);
                        one.content = screencore.emoToimg(one.content);
                        contentbox.append(self.msgtpl(one));
                        firstdom.remove();
                        self.loopRun();
                    },
                });
            } else {
                setTimeout(function () {
                    self.loopRun();
                }, 200);
            }
        },
        loadjoinnum: function () {
            screencore.ajaxSubmit('/screen/liuyancj/dmusercount', {}).then(function (e) {
                if (e.code == 0) {
                    $(".liuyan-joinnum span").text(e.msg);
                }
            });
        },
        initprize: function () {
            var self = this, selprizeobj = $(".liuyan-selprize"), selnumobj = $(".liuyan-selnum input"), showprize = self.prizeInfo[0], html = '';
            selprizeobj.find('.selaward').attr({
                "data-prizeid": showprize.id,
                "data-num": showprize.prizenum,
                "data-onceout": showprize.onceout
            }).text(showprize.prizename);
            selnumobj.val(showprize.onceout);
            $.each(self.prizeInfo, function (i, v) {
                html += '<li class="limitbox' + (i == 0 ? ' active' : '') + '" data-prizeid="' + v.id + '" data-nums="' + v.prizenum + '" data-onceout="' + v.onceout + '">' + v.prizename + '</li>';
            });
            selprizeobj.find('.liuyan-awardlist').html(html);
            $(".liuyan-welcomeBox").removeClass('display-none');
        },
        bindEvent: function () {
            var self = this;
            self.initprize();
            self.initSocket();
            setInterval(function () {
                self.loadjoinnum();
            }, 4e3);
            $(".liuyan-selprize span").on('click', function () {
                $(".liuyan-awardlist").toggleClass('display-none');
            });
            $(".liuyan-awardlist li").on('click', function () {
                var prizeid = $(this).attr("data-prizeid");
                $(".liuyan-selprize .selaward").text($(this).text());
                $(".liuyan-selprize .selaward").attr({ "data-prizeid": prizeid, "data-nums": $(this).attr("data-nums") });
                $(".liuyan-selnum input").val($(this).attr("data-onceout"));
                $(".liuyan-awardlist").addClass('display-none');
                $(this).addClass("active").siblings().removeClass("active");
                screencore.ajaxSubmit('/screen/liuyancj/ajaxlucker', { prizeid: prizeid, gametype: XCV3Config.gametype }, '').then(function (e) {
                    if (e.code == 0) {
                        var lucker = e.msg.list, rightlucktpl = template('rightlucker-tpl'), html = '';
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
                            html += rightlucktpl(v);
                        });
                        $(".liuyancj-right ul").html(html);
                    }
                });
            });
            var contentbox = $('.liuyan-messagelist');
            var firstdom = contentbox.find('li').first(), scrollH = firstdom.outerHeight(true);
            var clickstatus = '1';
            $(".liuyan-startbtn").click(function () {
                var $this = $(this);
                if (clickstatus == '1') {
                    var prizeid = $(".liuyan-selprize .selaward").attr('data-prizeid'), onceout = $(".liuyan-selnum input").val();
                    if (prizeid == '' || prizeid == null) return layerBox.showMsg('请选择奖品');
                    if (onceout == '' || parseInt(onceout) <= 0) return layerBox.showMsg('请设置正确的奖品抽取人数');
                    if ($(".liuyancj-right li").length >= $(".liuyan-selprize .selaward").attr('data-nums')) return layerBox.showMsg($(".liuyan-selprize .selaward").text() + '人数已抽满');
                    screencore.ajaxSubmit('/screen/liuyancj/savelucker', { prizeid: prizeid, selnum: onceout, gametype: XCV3Config.gametype }).then(function (e) {
                        if (e.code == 0) {
                            self.luckerids = e.msg.luckerids;
                            var html = '', oHtml = '';
                            var layusertpl = template('layuser-tpl');
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
                                html += self.msgtpl(v);
                                oHtml += layusertpl(v);
                            });
                            $(".liuyan-popBox ul").html(html);
                            $(".liuyan-output-main ul").html(oHtml);
                            clickstatus = '2';
                            $this.text('停止抽奖');
                            screencore.hideFootAndQr();
                            //停止前面的滚动
                            self.animeObj.pause();
                            self.loopDuration = 50;
                            self.loopDelay = 0;
                            //重新开始滚动
                            self.animeObj = anime({
                                targets: contentbox.get(0),
                                translateY: [0, -scrollH],
                                easing: 'linear',
                                duration: self.loopDuration,
                                delay: self.loopDelay,
                                complete: function (par) {
                                    var one = self.oldmsg.shift();
                                    self.oldmsg.push(one);
                                    one.content = screencore.emoToimg(one.content);
                                    contentbox.append(self.msgtpl(one));
                                    firstdom.remove();
                                    self.loopRun();
                                },
                            });
                        } else {
                            layerBox.showMsg(e.msg);
                        }
                    }, function () {
                        layerBox.showMsg('网络异常');
                    });
                } else if (clickstatus == '2') {
                    self.loopDuration = 2e3;
                    self.loopDelay = 0;
                    self.animeObj.pause();
                    contentbox.css('transform', 'translateY(0)');
                    clickstatus = '3';
                    $(".liuyan-popBox").removeClass('display-none');
                    $this.text('开始抽奖');
                    setTimeout(function () {
                        $(".liuyan-output").removeClass('display-none');
                        $(".liuyan-output-main").animateControl("bounceInDown", function () {
                            $(".liuyan-popBox").addClass('display-none').find('ul').empty();
                            self.animeObj.play();
                        });
                        screencore.sendLuckerTpl({ luckerids: self.luckerids }, function () {
                            self.luckerids = [];
                        });
                    }, 2e3);
                }
            });
            $(".liuyan-output-close").on('click', function () {
                $(".liuyan-output-main").animateControl("bounceOutDown", function () {
                    $(".liuyan-output").addClass('display-none');
                    clickstatus = '1';
                });
            });
            $(".liuyan-luckerlist").on('click', ".right-luckerdel", function () {
                var $this = $(this), prizeid = $(".liuyan-selprize .selaward").attr('data-prizeid'), recordid = $this.attr('data-id');
                layerBox.showConfirm('警告', '删除将无法恢复，确定要删除此中奖用户么?', ['确定', '取消'], function () {
                    screencore.ajaxSubmit('/screen/liuyancj/dellucker', { recordid: recordid, prizeid: prizeid }, '').then(function (e) {
                        if (e.code == 0) {
                            $this.parent().remove();
                            layerBox.showMsg('删除成功');
                        } else {
                            layerBox.showMsg(e.msg);
                        }
                    });
                });
            });
            keyboardJS.bind('space', function (e) {
                if ($(".liuyan-output").is(':hidden')) {
                    $(".liuyan-startbtn").trigger('click');
                } else {
                    $(".liuyan-output-close").trigger('click');
                }
            });
            keyboardJS.bind('/', function (e) {
                var selprize = $(".liuyan-selprize .selaward"), prizeid = selprize.attr("data-prizeid");
                if (prizeid == '' || prizeid == null) return;
                layerBox.showConfirm('警告', '清空将删除' + selprize.text() + '所有中奖用户，并且无法恢复，您确定要清空？', ['确定', '取消'], function () {
                    screencore.ajaxSubmit('/screen/liuyancj/delalllucker', { prizeid: prizeid, gametype: XCV3Config.gametype }, '').then(function (e) {
                        if (e.code == 0) {
                            $(".liuyancj-right ul").empty();
                            layerBox.showMsg('清空成功');
                        } else {
                            layerBox.showMsg(e.msg);
                        }
                    });
                });
            });
            keyboardJS.bind('left', function (e) {
                var activeli = $(".liuyan-awardlist li.active"), prevli = activeli.prev();
                if (activeli.length <= 0 || prevli.length <= 0) return;
                prevli.trigger('click');
            });
            keyboardJS.bind('right', function (e) {
                var activeli = $(".liuyan-awardlist li.active"), nextli = activeli.next();
                if (activeli.length <= 0 || nextli.length <= 0) return;
                nextli.trigger('click');
            });
            keyboardJS.bind('up', function (e) {
                var activeli = $(".liuyan-awardlist li.active");
                if (activeli.length <= 0) return;
                var selnum = $(".liuyan-selnum input").val();
                if (selnum == '' || selnum == null) {
                    selnum = 1;
                }
                selnum++;
                if (selnum > activeli.attr("data-nums")) selnum = activeli.attr("data-nums");
                $(".liuyan-selnum input").val(selnum);
            });
            keyboardJS.bind('down', function (e) {
                var selnum = $(".liuyan-selnum input").val();
                if (selnum && parseInt(selnum) > 1) {
                    selnum--;
                    $(".liuyan-selnum input").val(selnum);
                }
            });
            $(".liuyan-awardlist li.active").trigger('click');//加载第一个奖品的中奖用户
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
                        if ($.isArray(messages) && messages.length > 0) {
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
                        if ($.isArray(messages) && messages.length > 0) {
                            $.each(messages, function (i, val) {
                                if (val.type == '1') {
                                    if (data.dmtype == self.fromtype) self.addnewMsg(val);
                                }
                                fulldm.addBullet(val);
                            });
                        }
                    } else {
                        if (data.dmtype == self.fromtype) self.addnewMsg(data);
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
        addnewMsg: function (msg) {
            var self = this;
            if (msg.type == 'screendm') {
                msg.type = msg.msgtype || '1';
            }
            if (msg.type == '2') {
                return false;
            }
            self.oldmsg.push(msg);
            var contentsbox = $('.liuyan-messageBox');
            var contentbox = $('.liuyan-messagelist');
            if (contentbox.outerHeight() < contentsbox.outerHeight()) {
                msg.content = screencore.emoToimg(msg.content);
                contentbox.append(self.msgtpl(msg));
            }
            var replaceAll = $(".liuyan-rolldmmain .card-needreplace");
            if (replaceAll.length <= 0) {
                var replaceone = $(".liuyan-rolldmmain li").eq(Math.floor((Math.random() * $(".liuyan-rolldmmain li").length)));
            } else {
                var replaceone = replaceAll.eq(0);
            }
            replaceone.find(".card-avatar img").attr("src", msg.avatar);
            replaceone.find(".card-content").html(screencore.emoToimg(msg.content));
            replaceone.removeClass('card-needreplace');
        },
    };
    return screenliuyancj2;
})