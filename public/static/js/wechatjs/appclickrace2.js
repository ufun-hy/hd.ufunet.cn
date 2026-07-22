define('appclickrace', ['appsocket', 'wechatcore', 'phaser'], function (appsocket, wechatcore) {
    var appclickrace = {
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
                self.closerule = window.localStorage.getItem("closeclickracerule-" + XCV3Config.hdid);
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
                } else if (data.type == 'gameclickracerefresh' || data.type == 'gameappclickracerefresh') {
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
                } else if (data.type == "gameclickracerotatehadpay") {
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
                window.localStorage.setItem("closeclickracerule-" + XCV3Config.hdid, '1');
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
                wechatcore.ajaxSubmit('/wechat/common/gamejointeam', { gametype: XCV3Config.gametype, team: selteamobj.attr('data-team') }).then(function (json) {
                    if (json.code != 0) {
                        wechatcore.msg(json.msg);
                    }
                });
            });
            $(".game-myteam-tuichu .btn").off('click').on('click', function () {
                wechatcore.ajaxSubmit('/wechat/common/gameoutteam', { gametype: XCV3Config.gametype }).then(function (json) {
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
            function prefixInteger(str, length) {
                return Array(length + 1).join("0").split("").concat(String(str).split(""))
                    .slice(-length).join("");
            }
            var self = this, isGameOver = false;
            var loaderState = function (game) {
                var _self = this, loadtxt, progresstxt, voices = ['scorevoice', 'boomvoice'];
                this.init = function () {
                    loadtxt = this.game.add.text(game.world.centerX, game.world.centerY, '游戏正在加载中...', { fill: '#fff', fontSize: '24px' });
                    loadtxt.anchor.set(0.5);
                    loadtxt.scale.set(0.8);
                    progresstxt = this.game.add.text(game.world.centerX, game.world.centerY + 50, '0%', { fill: '#fff', fontSize: '24px' });
                    progresstxt.anchor.set(0.5);
                };
                this.preload = function () {
                    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
                    this.scale.pageAlignHorizontally = true;
                    this.scale.pageAlignVertically = true;
                    this.scale.refresh();

                    this.load.crossOrigin = 'anonymous';
                    this.load.image('title', Gameconfig.gameImgs.title);
                    this.load.image('topbg', Gameconfig.gameImgs.topbg);
                    this.load.image('bottombg', Gameconfig.gameImgs.bottombg);
                    this.load.image("box", Gameconfig.gameImgs.box);
                    this.load.image('boom', Gameconfig.gameImgs.boom);
                    this.load.audio('scorevoice', Gameconfig.gameImgs.scorevoice, true);
                    this.load.audio('boomvoice', Gameconfig.gameImgs.boomvoice, true);
                    this.load.spritesheet('buddy', Gameconfig.gameImgs.player, 240, 310, 4);
                    this.load.image('scorebox', Gameconfig.gameImgs.scorebox);
                    this.load.image('timebox', Gameconfig.gameImgs.timebox);
                    this.load.image('gameover', Gameconfig.gameImgs.gameover);
                    this.load.spritesheet('button', Gameconfig.gameImgs.buttons, 190, 200, 4);
                    this.load.bitmapFont('txtfont', Gameconfig.gameImgs.fontpng, Gameconfig.gameImgs.fontxml);
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
                    this.title = this.game.add.sprite(this.world.centerX, 200, "title");
                    this.title.y = -100;
                    this.title.anchor.set(0.5);
                    this.title.scale.set(0.5);
                    this.game.add.tween(this.title).to({ y: 240 }, 500, Phaser.Easing.Bounce.In, true).onComplete.add(function (obj) {
                        this.tiptxt = this.game.add.text(this.world.centerX, 320, "游戏还未开始", { fontSize: "24px", fill: "#e8a516" });
                        this.tiptxt.anchor.set(0.5);
                        this.tiptxt.alpha = 0;
                        this.game.add.tween(this.tiptxt).to({ alpha: 1 }, 500, 'Linear', true, 1.5e3);
                        var badi = this.game.add.sprite(this.world.centerX, 480, 'buddy', 0);
                        badi.anchor.set(0.5);
                        badi.scale.set(0.5);
                        badi.animations.add('move');
                        badi.animations.play('move', 10, true);
                        badi.inputEnabled = true;
                        badi.events.onInputDown.add(function () {
                            game.state.start('main');
                        }, this);
                    }, this);
                };
                this.update = function () {
                    if (this.tiptxt) this.tiptxt.text = self.gametip;
                };
            };
            var mainState = function (game) {
                this.create = function () {
                    if ($("#appbgmusic").length > 0) {
                        $("#appbgmusic")[0].pause();
                    }
                    isGameOver = false;
                    this.startTime = Date.now();
                    gameSpeed = 10;
                    // 物理系统
                    game.physics.startSystem(Phaser.Physics.ARCADE);
                    // 背景
                    this.bg = game.add.tileSprite(0, 0, game.cache.getImage('topbg').width, game.cache.getImage('topbg').height, 'topbg');
                    this.groundH = game.cache.getImage('bottombg').height;
                    this.ground = game.add.tileSprite(0, game.height - this.groundH, game.width, this.groundH, 'bottombg');


                    this.showScore = game.add.sprite(10, 10);
                    this.scoreBox = game.add.sprite(0, 0, 'scorebox');
                    this.scoreBox.scale.set(0.9);
                    this.showScore.addChild(this.scoreBox);
                    this.scoretxt = game.add.bitmapText(this.scoreBox.width / 2 + 20, this.scoreBox.height / 2 + 5, 'txtfont', '0', 36);
                    this.scoretxt.anchor.set(0.5);
                    this.showScore.addChild(this.scoretxt);
                    this.showScore.visible = Gameconfig.showscorebox == '1' ? true : false;

                    this.timeBox = game.add.sprite(0, 0, 'timebox');
                    this.timeBox.scale.set(0.9);
                    this.showTime = game.add.sprite(this.game.width - this.timeBox.width, 10);
                    this.showTime.addChild(this.timeBox);
                    this.timetxt = game.add.bitmapText(this.timeBox.width / 2 + 20, this.timeBox.height / 2 + 5, 'txtfont', '0', 36);
                    this.timetxt.anchor.set(0.5);
                    this.showTime.addChild(this.timetxt);

                    this.btnLeft = game.add.button(game.world.centerX - 140, game.height - this.groundH / 4, "button", this.runLeft, this, 2, 2, 0);
                    this.btnLeft.anchor.set(0.5);
                    this.btnRight = game.add.button(game.world.centerX + 140, game.height - this.groundH / 4, "button", this.runRight, this, 3, 3, 1)
                    this.btnRight.anchor.set(0.5);
                    //voice
                    this.scorevoice = game.add.sound('scorevoice');
                    this.boomvoice = game.add.sound('boomvoice');
                    //player
                    this._buddy = game.add.sprite(100, 0, "buddy");
                    this._buddy.scale.set(0.4);
                    this._buddy.anchor.set(0.5);
                    this._buddyPos = game.height - this.ground.height / 2 - this.ground.height / 2 * 3 / 4;// - this._buddy.height/2;
                    this._buddy.y = this._buddyPos;
                    this._buddy.animations.add('move');
                    this._buddy.animations.play('move', gameSpeed, true);

                    //  宝贝
                    this.boxGroup = game.add.group();
                    this.boxGroup.enableBody = true;
                    //  障碍物
                    this.hinderGroup = game.add.group();
                    this.hinderGroup.enableBody = true;

                    game.physics.arcade.enable(this._buddy);
                    game.physics.arcade.enable(this.ground);
                    game.physics.arcade.enable(this.boxGroup);

                    this._buddy.body.collideWorldBounds = true;
                    // 动画
                    game.add.tween(this._buddy).to({
                        x: (game.width - this._buddy.width) / 3
                    }, 1000, Phaser.Easing.Sinusoidal.InOut, true).onComplete.add(this.onStart, this);
                    //搞个定时器循环生产障碍或者宝箱
                    game.time.events.loop(Phaser.Timer.SECOND * 0.5, this.makeBox, this);
                    game.time.events.loop(Phaser.Timer.SECOND * 1.8, this.makeBoom, this);
                };

                this.update = function () {
                    if (!isGameOver) {
                        this.updateTime();
                    }
                    game.physics.arcade.collide(this._buddy, this.boxGroup, this.collectBox, null, this);
                    game.physics.arcade.collide(this._buddy, this.hinderGroup, this.collectBoom, null, this);
                    game.physics.arcade.collide(this.boxGroup, this.hinderGroup, this.boxboom, null, this);
                };
                this.runLeft = function () {
                    this._buddyPos = game.height - this.groundH / 2 - this.groundH / 2 * 3 / 4;
                    this._buddy.y = this._buddyPos;
                };
                this.runRight = function () {
                    this._buddyPos = game.height - this.groundH / 2 - this.groundH / 8
                    this._buddy.y = this._buddyPos;
                };
                this.onStart = function () {
                    this.score = 0;
                    this._buddy.body.velocity.x = 1;
                    this.bg.autoScroll(-gameSpeed * 15, 0);
                    this.ground.autoScroll(-gameSpeed * 30, 0);
                    this.startTime = Date.now();
                    game.time.events.start();
                };
                this.makeBox = function () {
                    var toppos = this.game.rnd.integerInRange(0, 10) > 5 ? this.groundH / 2 / 4 : this.groundH / 2 * 3 / 4;
                    var box = this.boxGroup.create(game.width + this.game.rnd.integerInRange(0, 10), game.height - this.groundH / 2 - toppos, "box");
                    box.scale.set(0.9);
                    box.anchor.set(0.5);
                    box.body.velocity.x = -gameSpeed * 30;
                    box.checkWorldBounds = true;
                    box.outOfBoundsKill = true;
                };
                this.makeBoom = function () {
                    var toppos = this.game.rnd.integerInRange(0, 10) > 5 ? this.groundH / 2 / 4 : this.groundH / 2 * 3 / 4;
                    var boom = this.hinderGroup.create(game.width + this.game.rnd.integerInRange(0, 10), game.height - this.groundH / 2 - toppos, "boom");
                    boom.scale.set(0.9);
                    boom.anchor.set(0.5);
                    boom.body.velocity.x = -gameSpeed * 30;
                    boom.checkWorldBounds = true;
                    boom.outOfBoundsKill = true;
                    game.add.tween(this._buddy).to({
                        x: (game.width - this._buddy.width) / 3
                    }, 1000, Phaser.Easing.Sinusoidal.InOut, true);
                    this._buddy.animations.add('move');
                    this._buddy.animations.play('move', gameSpeed, true);
                };
                this.boxboom = function (box, boom) {
                    boom.kill();
                };
                this.collectBox = function (player, box) {
                    box.kill();
                    var addscore = 1;
                    this.score += addscore;
                    if (this.score < 0) {
                        this.score = 0;
                    }
                    this.scoretxt.text = this.score;
                    this._buddy.body.velocity.x = 1;
                    this.scorevoice.play();
                };
                this.collectBoom = function (player, box) {
                    box.kill();
                    var addscore = 1;
                    this.score -= addscore;
                    if (this.score < 0) {
                        this.score = 0;
                    }
                    this.scoretxt.text = this.score;
                    this._buddy.body.velocity.x = 1;
                    this.boomvoice.play();
                };
                this.updateTime = function () {
                    if (!isGameOver) {
                        var str = prefixInteger(Date.now() - this.startTime, 6), text = str.substr(0, 3);
                        this.timetxt.text = text;
                        countTime = text;
                        var inttime = parseInt(text);
                        if (inttime > 20 && inttime < 30) {
                            gameSpeed = 24;

                            this._buddy.body.velocity.x = 2;
                            this.boxGroup.setAll('body.velocity.x', -gameSpeed * 30);
                            this.hinderGroup.setAll('body.velocity.x', -gameSpeed * 30);
                            this.bg.stopScroll();
                            this.ground.stopScroll();
                            this.bg.autoScroll(-gameSpeed * 15, 0);
                            this.ground.autoScroll(-gameSpeed * 30, 0);

                        } else if (inttime > 30 && inttime <= 40) {
                            gameSpeed = 36;
                            this._buddy.body.velocity.x = 3;
                            this.boxGroup.setAll('body.velocity.x', -gameSpeed * 30);
                            this.hinderGroup.setAll('body.velocity.x', -gameSpeed * 30);
                            this.bg.stopScroll();
                            this.ground.stopScroll();
                            this.bg.autoScroll(-gameSpeed * 15, 0);
                            this.ground.autoScroll(-gameSpeed * 30, 0);

                        } else if (inttime > 40) {
                            this.gameover();
                        }
                    }
                };
                this.gameover = function () {
                    isGameOver = true;

                    this._buddy.animations.stop('move');
                    this._buddy.animations.stop();
                    this.bg.autoScroll(0, 0);
                    this.ground.autoScroll(0, 0);
                    this._buddy.body.velocity = 0;
                    //停止单个定时器
                    //game.time.events.remove(this.boxtimer);
                    game.time.events.stop(false);
                    this.boxGroup.setAll('body.velocity.x', 0);
                    this.hinderGroup.setAll('body.velocity.x', 0);
                    this.boxGroup.visible = false;
                    this.hinderGroup.visible = false;
                    this.btnLeft.visible = false;
                    this.btnRight.visible = false;
                    var tip = game.add.text(game.world.centerX, game.world.centerY, 'GAMEOVER', { fill: '#fff', fontSize: '50px' });
                    tip.anchor.set(0.5);
                    tip.inputEnabled = true;
                    tip.events.onInputDown.add(function () {
                        game.state.start('menu');
                    }, this);
                };
            };
            game = new Phaser.Game(Gameconfig.gameW, Gameconfig.gameH, Phaser.CANVAS, '', null, true);
            game.playAudio = function (audio) {
                wechatcore.playAudio(audio, '2');
            };
            game.state.add('loader', loaderState);
            game.state.add("menu", menuState);
            game.state.add("main", mainState);
            game.state.start('loader');
        },
    };
    return appclickrace;
});
