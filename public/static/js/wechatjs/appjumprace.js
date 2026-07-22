define('appjumprace', ['appsocket', 'wechatcore', 'phaser'], function (appsocket, wechatcore) {
    var appjumprace = {
        rotateid: 0,
        gamephb: 10,
        gamestatus: 0,
        loadtxt: null,
        progresstxt: null,
        jumpinc: 1,
        jump2inc: 2,
        faildec: 1,
        gametime: 0,
        myscore: 0,
        level: 0,
        showpmbtn: false,
        gametip: '',
        isteam: '2',
        myteam: '0',
        gameteams: [],
        statustip: ['游戏还未开始', '正在倒计时，马上开始', '游戏开始了', '游戏已结束'],
        init: function () {
            var self = this;
            wechatcore.gameInit(function () {
                self.initGame();
                self.closerule = window.localStorage.getItem("closejumpracerule-" + XCV3Config.hdid);
                self.bindEvent();
            });
        },
        initsocket: function () {
            var self = this;
            var params = {};
            params.onmessage = function (data) {
                if (data.type == 'connected') {
                    appsocket.isclose = false;
                    wechatcore.connectsocket({ clientid: data.clientid });
                } else if (data.type == 'gameiswait' || data.type == 'gameisrun') {
                    wechatcore.closeall();
                    $(".rankInfo").remove();
                    $(".appstartdjs").addClass('hidden');
                    self.showpmbtn = false;
                    self.rotateid = data.rotateid;
                    self.initAudio();
                    self.gametime = data.gametime;
                    self.jumpinc = data.jumpinc;
                    self.jump2inc = data.jump2inc;
                    self.faildec = data.faildec;
                    if (data.type == 'gameiswait') {
                        self.gamestatus = 1;
                        self.myscore = 0;
                        self.isteam = data.isteam;
                        self.gameteams = data.teams;
                        self.myteam = data.team;
                        self.gametip = self.statustip[0];
                        if (game.state.current != 'menu') {
                            setTimeout(function () {
                                game.state.start('menu');
                            }, 200);
                        }
                    } else {
                        self.gamestatus = 2;
                        self.myscore = data.myscore;
                        if (game.state.current == 'menu') {
                            setTimeout(function () {
                                game.state.start('main');
                            }, 200);
                        }
                        self.gametip = self.statustip[2];
                    }
                    self.showteambox(data.teaminfo, data.jointype);
                } else if (data.type == 'gameiscountdown') {
                    if ($("#bgm").length > 0 && game.musicPause) {
                        if (!$("#bgm")[0].paused) $("#bgm")[0].pause();
                        game.musicPause = false;
                    }
                    self.gamestatus = 1;
                    self.myscore = 0;
                    self.hidemyteambox();
                    var b = $(".appstartdjs"), e = b.find(".appstartdjsBox"), s = b.find(".startdjsani");
                    s.text(data.djs > 0 ? data.djs : 'GO');
                    b.removeClass('hidden');
                    self.gametip = self.statustip[1];
                    wechatcore.playAudio(self.djsaudio);
                    if (data.djs == 0) {
                        self.gametip = self.statustip[2];
                        setTimeout(function () {
                            game.state.start('main');
                        }, 3e2);
                    }
                } else if (data.type == 'gameisdjs') {
                    self.gamestatus = 2;
                    self.hidemyteambox();
                    if (self.gamestatus != 3 && game.state.current == 'menu') {
                        setTimeout(function () {
                            game.state.start('main');
                        }, 200);
                    }
                    $(".appstartdjs").addClass('hidden');
                    self.gametime = data.djs;
                    data.djs == 0 && self.endshake();
                } else if (data.type == 'gamejumpracerefresh' || data.type == 'gameappjumpracerefresh') {
                    appsocket.closeClient();
                } else if (data.type == 'gameshowphbbtn') {
                    self.gamestatus == 3 && self.showphbbtn(data.rotateid, data.gamephb);
                } else if (data.type == 'gamenoround' || data.type == 'gameislucker') {
                    self.gamestatus = 0;
                    self.gametip = (data.type == 'gamenoround' ? '暂无正在进行的轮次' : XCV3Config.isluckertxt);
                    self.myteam = '0';
                    self.hideteamboxs();
                } else if (data.type == 'gamestartnojoin') {
                    self.gamestatus = 0;
                    self.gametip = '本轮游戏已经开始，无法加入';
                    self.myteam = '0';
                    self.hideteamboxs();
                } else if (data.type == 'gameneedpay') {
                    self.gametip = '请先购买参与游戏资格';
                    self.myteam = '0';
                    self.hideteamboxs();
                    wechatcore.gamePayrotate(data.rotateid, data.fee, function () {
                        appsocket.closeClient();
                    });
                } else if (data.type == "gamejumpracerotatehadpay") {
                    if (data.userid == XCV3Config.userid) {
                        window.location.reload();
                    }
                } else if (data.type == 'gameiserror') {
                    self.myteam = '0';
                    self.hideteamboxs();
                    appsocket.closeClient();
                } else if (data.type == 'addblack') {
                    data.userid == XCV3Config.userid && WeixinJSBridge.call('closeWindow');
                } else if (data.type == 'goto') {
                    wechatcore.goto(data);
                } else if (data.type == 'luckeruserids') {
                    wechatcore.layerAsklucker(data);
                } else if (data.type == 'gamejointeam') {
                    if (data.userid == XCV3Config.userid && data.gametype == XCV3Config.gametype) {
                        self.jointeam(data.team);
                    }
                } else if (data.type == 'gameoutteam') {
                    if (data.userid == XCV3Config.userid && data.gametype == XCV3Config.gametype) {
                        self.outteam();
                    }
                } else if (data.type == 'gameteamcannotjoin') {
                    self.gametip = data.message;
                    self.myteam = '0';
                    self.hideteamboxs();
                }
            };
            appsocket.init(params);
        },
        initAudio: function () {
            var self = this;
            self.djsaudio = $("#djsaudio")[0];
        },
        bindEvent: function () {
            var self = this;
            $(".gamerule a").on('click', function () {
                $('.gamerule').addClass('hidden');
                window.localStorage.setItem("closejumpracerule-" + XCV3Config.hdid, '1');
            });
        },
        teamEvent: function () {
            var self = this;
            $(".game-selteambox").off('click').on('click', '.game-team', function () {
                var $this = $(this);
                if ($this.hasClass('issel')) {
                    $this.removeClass('issel');
                    $this.find('.checkbox').addClass('hidden');
                } else {
                    $this.addClass('issel').siblings().removeClass('issel');
                    $(".game-selteambox .checkbox").addClass('hidden')
                    $this.find('.checkbox').removeClass('hidden');
                }
            });
            $(".game-team-join .btn").off('click').on('click', function () {
                var selteamobj = $(".game-selteambox .game-team.issel");
                if (selteamobj.length == 0) {
                    return wechatcore.msg('请选择一个团队');
                }
                wechatcore.ajaxSubmit('/wechat/common/gamejointeam', { gametype: XCV3Config.gametype, team: selteamobj.attr('data-team') }, '正在加入..').then(function (json) {
                    if (json.code != 0) {
                        wechatcore.msg(json.msg);
                    }
                });
            });
            $(".game-myteam-tuichu .btn").off('click').on('click', function () {
                wechatcore.ajaxSubmit('/wechat/common/gameoutteam', { gametype: XCV3Config.gametype }, '正在退出..').then(function (json) {
                    if (json.code != 0) {
                        wechatcore.msg(json.msg);
                    }
                });
            });
        },
        initteams: function () {
            var self = this, teamhtml = '';
            if (self.gameteams.length > 0) {
                $.each(self.gameteams, function (i, v) {
                    teamhtml += wechatcore.tpl($("#team-tpl"), v);
                });
            }
            $(".game-selteambox .game-teams").html(teamhtml == '' ? '<p>本轮暂无团队，请先添加团队</p>' : teamhtml);
            self.teamEvent();
        },
        showteambox: function (teaminfo, jointype) {
            var self = this, teaminfo = teaminfo || '';
            if (self.isteam == '2') {
                $(".game-selteambox,.game-myteambox").addClass('hidden');
                return;
            }
            if (jointype == '3') {
                $(".game-myteambox .game-myteam-tuichu").addClass('hidden');
            } else {
                $(".game-myteambox .game-myteam-tuichu").removeClass('hidden');
            }
            self.initteams();
            if (self.myteam != '' && self.myteam != '0' && teaminfo != '') {
                $(".game-selteambox").addClass('hidden');
                var myteambox = $('.game-myteambox');
                myteambox.find('.game-myteam-logo img').attr('src', teaminfo.teamlogo || '');
                myteambox.find('.game-myteam-name').text(teaminfo.teamname || '');
                if (self.gamestatus == 1) {
                    myteambox.removeClass('hidden');
                } else {
                    myteambox.addClass('hidden');
                }
            } else {
                $('.game-myteambox').addClass('hidden');
                $(".game-selteambox").removeClass('hidden');
            }
        },
        jointeam: function (jointeam) {
            var self = this, selteambox = $('.game-selteambox');
            selteambox.find('.game-team').removeClass('issel');
            selteambox.find('.checkbox').addClass('hidden');
            selteambox.addClass('hidden');
            var myteambox = $('.game-myteambox');
            myteambox.find('.game-myteam-logo img').attr('src', jointeam.teamlogo);
            myteambox.find('.game-myteam-name').text(jointeam.teamname);
            if (self.gamestatus == 1) {
                myteambox.removeClass('hidden');
            } else {
                myteambox.addClass('hidden');
            }
            self.myteam = jointeam.id;
        },
        outteam: function () {
            var self = this, myteambox = $('.game-myteambox');
            myteambox.find('.game-myteam-logo img').attr('src', '');
            myteambox.find('.game-myteam-name').text('');
            myteambox.addClass('hidden');
            var selteambox = $('.game-selteambox');
            selteambox.find('.game-team').removeClass('issel');
            selteambox.find('.checkbox').addClass('hidden');
            selteambox.removeClass('hidden');
            self.myteam = '0';
        },
        hideteamboxs: function () {
            $(".game-selteambox,.game-myteambox").addClass('hidden');
        },
        hidemyteambox: function () {
            $(".game-myteambox").addClass('hidden');
        },
        endshake: function () {
            var self = this;
            self.gamestatus = 3;
            self.gametip = self.statustip[3];
            self.hideteamboxs();
        },
        workerdata: function () {
            var self = this;
            if (self.gamestatus != 2 || (self.isteam == '1' && (self.myteam == '0' || self.myteam == ''))) return;
            if (sendscore == '1') {
                appsocket.sendgamedata({
                    myscore: self.myscore,
                    myteam: self.myteam,
                    rotateid: self.rotateid,
                });
            }
        },
        showphbbtn: function (rotateid, gamephb) {
            var self = this;
            self.showpmbtn = true;
            self.rotateid = rotateid;
            self.gamephb = gamephb;
        },
        initGame: function () {
            var self = this;
            var loaderState = function (game) {
                var _self = this, loadtxt, progresstxt, voices = ['jump', 'fall', 'score', 'score2'];
                this.init = function () {
                    game.scale.pagesAlignHorizontally = true;
                    game.scale.pageAlignVertically = true;
                    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
                    loadtxt = this.game.add.text(game.world.centerX, game.world.centerY, '游戏正在加载中...', { fill: '#fff', fontSize: '24px' });
                    loadtxt.anchor.set(0.5);
                    loadtxt.scale.set(0.8);
                    progresstxt = this.game.add.text(game.world.centerX, game.world.centerY + 50, '0%', { fill: '#fff', fontSize: '24px' });
                    progresstxt.anchor.set(0.5);
                };
                this.preload = function () {
                    game.load.crossOrigin = 'anonymous';
                    this.load.image('title', Gameconfig.gameImgs.title);
                    this.load.spritesheet("cloud", Gameconfig.gameImgs.cloud, 64, 32);
                    for (var i = 0; i < platesWidths.length; i++) {
                        this.load.image('plate' + i, Gameconfig.gameImgs['plate' + i]);
                    }
                    this.load.audio('jump', Gameconfig.gameImgs.jump, true);
                    this.load.audio('fall', Gameconfig.gameImgs.fall, true);
                    this.load.audio('score', Gameconfig.gameImgs.score, true);
                    this.load.audio('score2', Gameconfig.gameImgs.score2, true);
                    this.load.image('player', Gameconfig.gameImgs.player);
                    this.load.image('effect', Gameconfig.gameImgs.effect);
                    this.load.image('scorebox', Gameconfig.gameImgs.scorebox);
                    this.load.image('timebox', Gameconfig.gameImgs.timebox);
                    this.load.image('gameover', Gameconfig.gameImgs.gameover);
                    this.load.onFileComplete.add(function (progress) {
                        progresstxt.text = progress + '%';
                    });
                    this.load.onLoadComplete.add(function () {
                        if (voices.length > 0) {
                            game.sound.setDecodedCallback(voices, function () {
                                _self._startmenu();
                            }, this);
                        } else {
                            _self._startmenu();
                        }
                    });
                };
                this._startmenu = function () {
                    loadtxt.destroy();
                    progresstxt.destroy();
                    self.closerule != '1' && $(".gamerule").removeClass('hidden');
                    game.state.start('menu');
                    self.initsocket();
                };
            };
            var menuState = function (game) {
                this.init = function () {
                    if ($("#appbgmusic").length > 0) {
                        wechatcore.playAudio($("#appbgmusic")[0]);
                    }
                };
                this.create = function () {
                    for (var i = 0; i < 3; i++) {
                        var firstX = this.game.rnd.between(20, this.game.width - 20);
                        var firstTime = Math.floor((20000 - 3000 * i) * (firstX + 150) / (this.game.width + 200));
                        var cloud = this.game.add.sprite(firstX, this.game.height - 250 + 50 * i, "cloud", this.game.rnd.integerInRange(0, 2));
                        cloud.scale.set(1 + 0.5 * i);
                        cloud.alpha = 0.9;
                        this.game.add.tween(cloud).to({ x: -150 }, firstTime, "Linear", true).onComplete.add(function (obj, tw, twTime) {
                            obj.x = this.game.width + 50;
                            obj.frame = this.game.rnd.integerInRange(0, 2);
                            this.game.add.tween(obj).to({ x: -150 }, twTime, "Linear", true, 0, -1).onLoop.add(function (obj) {
                                obj.frame = this.game.rnd.integerInRange(0, 2);
                            }, this);

                        }, this, 0, 20000 - 3000 * i);
                    }
                    this.title = this.game.add.sprite(this.world.centerX, 200, "title");
                    this.title.y = -100;
                    this.title.anchor.set(0.5);
                    this.title.scale.set(0.5);
                    this.game.add.tween(this.title).to({ y: 100 }, 500, Phaser.Easing.Bounce.In, true).onComplete.add(function (obj) {
                        for (var i = 0; i < 4; i++) {
                            var direction = (i == 0 || i == 2) ? 1 : -1;
                            var x = this.world.centerX - 50 * direction, y = this.world.height - 100 - 100 * i;
                            var plate = this.game.add.sprite(x, y, "plate" + i);
                            plate.alpha = 1;
                            plate.anchor.set(0.5);
                            plate.scale.set(0.3);
                            this.game.add.tween(plate).from({ y: -200, alpha: 0 }, 1000, Phaser.Easing.Bounce.Out, true, 500 * i);
                        }
                        this.tiptxt = this.game.add.text(this.world.centerX, 220, "游戏还未开始", { fontSize: "24px", fill: "#e8a516" });
                        this.tiptxt.anchor.set(0.5);
                        this.tiptxt.alpha = 0;
                        this.game.add.tween(this.tiptxt).to({ alpha: 1 }, 500, 'Linear', true, 1.5e3);
                    }, this);
                };
                this.update = function () {
                    if (this.tiptxt) this.tiptxt.text = self.gametip;
                };
            };
            var mainState = function (game) {
                var group, player, effect, point, moving, holding, holdTime;
                this.pArr = platesWidths;
                this.init = function () {
                    moving = true;
                    holding = false;
                    holdTime = 0;
                    this.lastX = 80;
                    this.lastY = 40;
                    this.lastD = 1;
                    this.lastP = 0;
                    this.myscore = 0;
                    this.objplate = false;
                    this.isplaying = true;
                };
                this.create = function () {
                    if ($("#appbgmusic").length > 0) {
                        $("#appbgmusic")[0].pause();
                    }
                    this.jumpbgm = this.game.add.audio('jump', 1, false);
                    this.fallbgm = this.game.add.audio('fall', 1, false);
                    this.scorebgm = this.game.add.audio('score', 1, false);
                    this.score2bgm = this.game.add.audio('score2', 1, false);

                    this.showScore = game.add.sprite(10, 10);
                    this.scoreBox = game.add.sprite(0, 0, 'scorebox');
                    this.scoreBox.scale.set(0.5);
                    this.showScore.addChild(this.scoreBox);

                    this.scoretxt = this.game.add.text(78, 36, "0", { fontSize: "26px", fill: "#e8a516" });
                    this.scoretxt.anchor.set(0.5);
                    this.showScore.addChild(this.scoretxt);
                    this.showScore.visible = Gameconfig.showscorebox == '1' ? true : false;
                    this.showTime = game.add.sprite(this.game.width - 133, 10);
                    this.timeBox = game.add.sprite(0, 0, 'timebox');
                    this.timeBox.scale.set(0.5);
                    this.showTime.addChild(this.timeBox);
                    this.timetxt = this.game.add.text(80, 32, "0", { fontSize: "26px", fill: "#e8a516" });
                    this.timetxt.anchor.set(0.5);
                    this.showTime.addChild(this.timetxt);

                    for (var i = 0; i < 3; i++) {
                        var firstX = this.game.rnd.between(20, this.game.width - 20);
                        var firstTime = Math.floor((20000 - 3000 * i) * (firstX + 150) / (this.game.width + 200));
                        var cloud = this.game.add.sprite(firstX, this.game.height - 250 + 50 * i, "cloud", this.game.rnd.integerInRange(0, 2));
                        cloud.scale.set(1 + 0.5 * i);
                        cloud.alpha = 0.3;
                        this.game.add.tween(cloud).to({ x: -150 }, firstTime, "Linear", true).onComplete.add(function (obj, tw, twTime) {
                            obj.x = this.game.width + 50;
                            this.game.add.tween(obj).to({ x: -150 }, twTime, "Linear", true, 0, -1).onLoop.add(function (obj) {
                                obj.frame = this.game.rnd.integerInRange(0, 2);
                            }, this);
                        }, this, 0, 20000 - 3000 * i);
                    }
                    group = this.game.add.group();
                    this.plate1 = group.create(this.world.centerX - this.lastX, this.world.centerY + this.lastY, "plate" + this.lastP);
                    this.plate1.anchor.set(0.5);
                    this.plate1.scale.set(0.5);
                    this.plate1.showscaleY = '1';
                    this.game.add.tween(this.plate1).from({ y: this.plate1.y - 50, alpha: 0 }, 200, "Linear", true).onComplete.add(function () {
                        this.plate2 = group.create(this.world.centerX + this.lastX, this.world.centerY - this.lastY, "plate" + this.lastP);
                        this.plate2.anchor.set(0.5);
                        this.plate2.scale.set(0.5);
                        this.plate2.showscaleY = '2';
                        this.plate2.sendToBack();
                        this.game.add.tween(this.plate2).from({ y: this.plate2.y - 50, alpha: 0 }, 200, "Linear", true).onComplete.add(function () {
                            effect = group.create(this.world.centerX - this.lastX, this.world.centerY + this.lastY, "effect");
                            effect.anchor.set(0.5);
                            effect.scale.set(1);
                            effect.y = effect.y - (this.plate1.height - this.pArr[this.lastP] / 2) / 2;
                            effect.visible = false;
                            player = group.create(this.world.centerX - this.lastX, this.world.centerY + this.lastY);
                            player.b = player.addChild(this.game.add.sprite(0, 0, "player"));
                            player.b.anchor.set(0.5);
                            player.b.scale.set(0.5);
                            player.b.animations.add("delay", [0], 10, false);
                            player.y = player.y - (this.plate1.height - this.pArr[this.lastP] / 2) / 2 - player.b.height / 2 + player.b.width / 2;
                            player.txt = player.addChild(this.game.add.text(0, -30, "", { fontSize: "18px", fill: "#fff" }));
                            player.txt.anchor.set(0.5);
                            this.game.add.tween(player).from({ y: player.y - 100, alpha: 0 }, 200, "Linear", true).onComplete.add(function () {
                                moving = false;
                            }, this);
                        }, this);
                    }, this);

                    this.game.input.onDown.add(function () {
                        if (this.isplaying && !moving && !holding) {
                            group.forEachAlive(function (plate) {
                                if (plate.showscaleY == '1') this.objplate = plate;
                            }, this);
                            holding = true;
                            holdTime = this.game.time.now;
                            game.playAudio(this.jumpbgm);
                        }
                    }, this);
                    this.game.input.onUp.add(this.jumpplate, this);
                };
                this.update = function () {
                    if (holding) {
                        var power = Math.min(Math.floor((this.game.time.now - holdTime) / 8), 350);
                        player.scale.y = 1 - (power > 100 ? 0.1 : 0.1 * power / 100);
                        if (this.objplate) this.objplate.scale.y = 0.5 - (power > 100 ? 0.02 : 0.02 * power / 350);
                    }
                    this.scoretxt.text = self.myscore;
                    this.timetxt.text = self.gametime;
                    if (this.isplaying && self.gamestatus == 3 && self.gametime == 0) {
                        this.gametimeover();
                    }
                    if (this.pmbtn) {
                        self.showpmbtn ? (this.pmbtn.visible = true) : (this.pmbtn.visible = false);
                    }
                };
                this.jumpplate = function () {
                    if (!moving && holding) {
                        this.jumpbgm.stop();
                        moving = true;
                        holding = false;
                        player.scale.y = 1;
                        if (this.objplate) this.objplate.scale.y = 0.5;
                        var power = Math.min(Math.floor((this.game.time.now - holdTime) / 8), 350);
                        var jumpX = this.world.centerX - this.lastX + this.lastD * power * 2;
                        var jumpY = this.world.centerY + this.lastY - (this.objplate.height - this.pArr[this.lastP] / 2) / 2 - player.b.height / 2 + player.b.width / 2 - power;
                        var jumpTime = 360;
                        this.game.add.tween(player).to({ x: jumpX, y: jumpY }, jumpTime, "Linear", true).onComplete.add(function (obj) {
                            if (this.checkdroppos()) {
                                if (this.objplate) this.objplate.showscaleY = '3';
                                group.forEachAlive(function (plate) {
                                    if (plate.showscaleY == '2') plate.showscaleY = '1';
                                }, this);
                                obj.b.animations.play("delay", 10).onComplete.addOnce(this.makeplate, this);
                            } else {
                                obj.b.animations.play("delay", 10).onComplete.addOnce(this.dropout, this);
                            }
                        }, this);
                        player.b.y = -100;
                        player.b.angle = -this.lastD * 360;
                        this.game.add.tween(player.b).to({ angle: -this.lastD * 260, x: this.lastD * 5, y: -150 }, jumpTime * 0.2, 'Linear', false).to({ angle: -this.lastD * 160, x: this.lastD * 10, y: -100 }, jumpTime * 0.2, 'Linear', false).to({ angle: -this.lastD * 80, x: this.lastD * 20, y: -80 }, jumpTime * 0.2, 'Linear', false).to({ angle: 0, x: 0, y: 0 }, jumpTime * 0.4, 'Linear', true);
                    }
                };
                this.checkdroppos = function () {

                    if (Math.abs(player.x - this.plate2.x) <= (this.pArr[this.lastP] / 4 - player.b.width / 4)) {
                        var getscore = self.jumpinc || 1;
                        if (Math.abs(player.x - this.plate2.x) <= this.pArr[this.lastP] / 30) {
                            getscore = self.jump2inc || 2;
                            effect.reset(this.plate2.x, this.plate2.y - (this.plate2.height - this.pArr[this.lastP] / 2) / 2);
                            effect.anchor.set(0.5);
                            effect.visible = true;
                            effect.alpha = 1;
                            this.game.add.tween(effect.scale).to({ x: 3, y: 3 }, 800, Phaser.Easing.Cubic.Out, true);
                            this.game.add.tween(effect).to({ alpha: 0 }, 800, Phaser.Easing.Cubic.Out, true).onComplete.add(function (obj) {
                                obj.visible = false;
                                obj.scale.set(1);
                            }, this);
                            game.playAudio(this.score2bgm);
                        } else {
                            game.playAudio(this.scorebgm);
                        }
                        if (this.isplaying && self.gamestatus == 2 && self.gametime > 0) {
                            self.myscore += getscore;
                            self.workerdata();
                        }
                        player.txt.reset(0, -30);
                        player.txt.text = '+' + getscore;
                        player.txt.alpha = 1;
                        this.game.add.tween(player.txt).to({ y: player.txt.y - 50, alpha: 0 }, 800, "Linear", true).onComplete.add(function (txt) {
                            txt.kill();
                        }, this);
                        return true;
                    } else {
                        return false;
                    }

                };
                this.dropout = function () {

                    player.y > this.plate2.y ? player.sendToBack() : this.plate2.sendToBack();
                    if (Math.abs(player.x - this.plate2.x) - this.pArr[this.lastP] / 4 < player.b.width / 2) {
                        player.angle = (player.y < this.plate2.y && this.lastD > 0) || (player.y > this.plate2.y && this.lastD < 0) ? 30 : -30;
                    }
                    this.game.add.tween(player).to({ y: player.y + 100, alpha: 0 }, 500, "Linear", true).onComplete.add(function () {
                        player.x = this.world.centerX - this.lastX;
                        player.y = this.world.centerY + this.lastY - 100;
                        player.angle = 0;
                        player.bringToTop();
                        this.game.add.tween(player).to({ y: player.y - (this.objplate.height - this.pArr[this.objplate.key.replace('plate', '')] / 2) / 2 - player.b.height / 2 + player.b.width / 2 + 100, alpha: 1 }, 200, "Linear", true).onComplete.add(function () {
                            moving = false;
                        }, this);
                        if (this.isplaying && self.gamestatus == 2 && self.gametime > 0) {
                            var faildec = self.faildec || 1;
                            if (faildec > 0) {
                                self.myscore -= faildec;
                                if (self.myscore < 0) {
                                    self.myscore = 0;
                                }
                                self.workerdata();
                            }
                        }
                    }, this);
                    game.playAudio(this.fallbgm);

                };
                this.makeplate = function (sprite, anim) {
                    moving = false;
                    var newRange = this.game.rnd.integerInRange(40, 50);
                    var newD = this.game.rnd.sign();
                    var newX = newD * newRange * 2;
                    var newY = newRange;
                    this.lastP = this.game.rnd.between(0, this.pArr.length - 1);
                    this.plate2 = group.getFirstDead(true, this.world.centerX + this.lastX + newX * 2, this.world.centerY - this.lastY - newY * 2, "plate" + this.lastP);
                    this.plate2.anchor.set(0.5);
                    this.plate2.scale.set(0.5);
                    this.plate2.showscaleY = '2';
                    this.plate2.sendToBack();
                    this.game.add.tween(this.plate2).from({ y: this.plate2.y - 80, alpha: 0 }, 200, Phaser.Easing.Quadratic.Out, true).onComplete.add(function () {
                        group.forEachAlive(this.tweenani, this, newX, newY);
                        this.lastX = newX;
                        this.lastY = newY;
                        this.lastD = newD;
                    }, this);

                };
                this.tweenani = function (plate, newX, newY) {
                    this.game.add.tween(plate).to({ x: plate.x - this.lastX - newX, y: plate.y + this.lastY + newY }, 300, "Linear", true).onComplete.add(function (plate) {
                        if (!plate.inWorld && plate != player) {
                            plate.kill();
                        }
                    }, this);
                };
                this.gametimeover = function () {
                    this.isplaying = false;
                    if (this.jumpbgm.isPlaying) this.jumpbgm.stop();
                    if (this.scorebgm.isPlaying) this.scorebgm.stop();
                    if (this.score2bgm.isPlaying) this.score2bgm.stop();
                    if (this.fallbgm.isPlaying) this.fallbgm.stop();
                    this.overPopup = game.add.group();
                    this.overBox = game.add.image(game.world.centerX, game.world.centerY, 'gameover');
                    this.overBox.scale.set(0.68);
                    this.overBox.anchor.set(0.5);
                    this.overPopup.add(this.overBox);
                    this.overnum = this.game.add.text(game.world.centerX, game.world.centerY - 10, self.myscore, { fontSize: "62px", fill: "#e8a516" });
                    this.overnum.anchor.set(0.5);
                    this.overPopup.add(this.overnum);
                    this.pmbtn = game.add.text(game.world.centerX, game.world.centerY + 132, '查看排行榜', { fontSize: "32px", fill: "#fff" });
                    this.pmbtn.anchor.set(0.5);
                    this.pmbtn.inputEnabled = true;
                    this.pmbtn.visible = false;
                    this.pmbtn.events.onInputDown.add(function () {
                        wechatcore.ajaxSubmit('/wechat/common/getphbdata', { gametype: XCV3Config.gametype, rotateid: self.rotateid, gamephb: self.gamephb, teamid: self.myteam }, '正在获取排行榜数据').then(function (data) {
                            if (data.code == 0) {
                                if (data.msg.list.length > 0) {
                                    $("body").append(wechatcore.tpl($("#phb-tpl"), { list: data.msg.list, myrank: data.msg.myrank }));
                                    $("body .rank-close").click(function () {
                                        $(this).parent().parent().remove();
                                    });
                                } else {
                                    wechatcore.msg('暂无数据');
                                }
                            } else {
                                wechatcore.msg(data.msg);
                            }
                        }, function () {
                            wechatcore.msg('网络太差，请稍后重试');
                        });
                    }, this);
                    this.overPopup.add(this.pmbtn);
                    this.game.add.tween(this.overPopup).from({ y: -500, alpha: 0 }, 500, Phaser.Easing.Bounce.Out, true);
                    moving = true;
                    holding = false;
                };
            };
            game = new Phaser.Game(Gameconfig.gameW, Gameconfig.gameH, Phaser.CANVAS, 'zam-app-mainbox', null, true);
            game.playAudio = function (audio) {
                wechatcore.playAudio(audio, '2');
            };
            game.state.add('loader', loaderState);
            game.state.add("menu", menuState);
            game.state.add("main", mainState);
            game.state.start('loader');
        },
    };
    return appjumprace;
});
