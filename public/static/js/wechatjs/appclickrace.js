define('appclickrace', ['appsocket', 'wechatcore', 'phaser'], function (appsocket, wechatcore) {
    var appclickrace = {
        rotateid: 0,
        gamephb: 10,
        gamestatus: 0,
        loadtxt: null,
        progresstxt: null,
        coininc: 1,
        boomdec: 1,
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
                    $(".appstartdjs").addClass('hidden');
                    self.showpmbtn = false;
                    self.rotateid = data.rotateid;
                    self.initAudio();
                    self.gametime = data.gametime;
                    self.coininc = data.coininc;
                    self.boomdec = data.boomdec;
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
                var _self = this, loadtxt, progresstxt, voices = ['scorevoice', 'boomvoice'];
                this.init = function () {
                    game.scale.pageAlignHorizontally = true;
                    game.scale.pageAlignVertically = true;
                    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
                    loadtxt = this.game.add.text(game.world.centerX, game.world.centerY, '游戏正在加载中...', { fill: '#fff', fontSize: '28px' });
                    loadtxt.anchor.set(0.5);
                    progresstxt = this.game.add.text(game.world.centerX, game.world.centerY + 50, '0%', { fill: '#fff', fontSize: '32px' });
                    progresstxt.anchor.set(0.5);
                };
                this.preload = function () {
                    this.load.crossOrigin = 'anonymous';
                    this.load.image('title', Gameconfig.gameImgs.title);
                    this.load.spritesheet('gamebg', Gameconfig.gameImgs.gamebg, 640, 1260, 3);
                    this.load.spritesheet('player', Gameconfig.gameImgs.player, 60, 160, 7);
                    this.load.image("box", Gameconfig.gameImgs.box);
                    this.load.image('boom', Gameconfig.gameImgs.boom);
                    this.load.audio('scorevoice', Gameconfig.gameImgs.scorevoice, true);
                    this.load.audio('boomvoice', Gameconfig.gameImgs.boomvoice, true);
                    this.load.image('scorebox', Gameconfig.gameImgs.scorebox);
                    this.load.image('timebox', Gameconfig.gameImgs.timebox);
                    this.load.image('gameover', Gameconfig.gameImgs.gameover);
                    this.load.image('pmbtn', Gameconfig.gameImgs.pmbtn);
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
                this.update = function () {
                    if (this.tiptxt) this.tiptxt.text = self.gametip;
                };
            };
            var menuState = function (game) {
                this.init = function () {
                    if ($("#appbgmusic").length > 0) {
                        wechatcore.playAudio($("#appbgmusic")[0]);
                    }
                };
                this.create = function () {
                    this.title = this.game.add.sprite(this.world.centerX, 0, "title");
                    this.title.y = - 200;
                    this.title.anchor.set(0.5);
                    this.game.add.tween(this.title).to({ y: this.world.centerY - 140 }, 500, Phaser.Easing.Bounce.In, true).onComplete.add(function (obj) {
                        var player = this.game.add.sprite(this.world.centerX, this.world.centerY + 52, 'player', 0);
                        player.anchor.set(0.5);
                        player.animations.add('move');
                        player.animations.play('move', 10, true);
                        this.tiptxt = this.game.add.text(this.world.centerX, this.world.centerY + 240, "游戏还未开始", { fontSize: "36px", fill: "#fff" });
                        this.tiptxt.anchor.set(0.5);
                        this.tiptxt.alpha = 0;
                        this.game.add.tween(this.tiptxt).to({ alpha: 1 }, 500, 'Linear', true, 500);
                    }, this);
                };
                this.update = function () {
                    if (this.tiptxt) this.tiptxt.text = self.gametip;
                };
            };
            var mainState = function (game) {
                var group;
                this.init = function () {
                    this.isplaying = true;
                    this.flag = 1;
                };
                this.create = function () {
                    if ($("#appbgmusic").length > 0) {
                        $("#appbgmusic")[0].pause();
                    }
                    game.physics.startSystem(Phaser.Physics.ARCADE);
                    this.bg = this.add.sprite(0, 0, "gamebg");
                    this.bg.animations.add("bg");
                    this.bg.animations.play("bg", 12, true)

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

                    this.btnLeft = game.add.button(game.world.centerX - 140, game.height - 160, "button", this.runLeft, this, 0, 0, 2);
                    this.btnLeft.anchor.set(0.5);
                    this.btnLeft.scale.set(0.8);
                    this.btnRight = game.add.button(game.world.centerX + 140, game.height - 160, "button", this.runRight, this, 1, 1, 3);
                    this.btnRight.anchor.set(0.5);
                    this.btnRight.scale.set(0.8);

                    this.scorevoice = game.add.audio('scorevoice', 1, false);
                    this.boomvoice = game.add.sound('boomvoice', 1, false);

                    group = this.game.add.group();
                    this.player = group.create(game.world.centerX, game.world.centerY + 220);
                    this.player.b = this.player.addChild(this.game.add.sprite(0, 0, "player"));
                    this.player.b.anchor.set(0.5);
                    this.player.b.scale.set(1.2);
                    this.player.b.enableBody = true;
                    this.player.b.animations.add("run");
                    this.player.b.animations.play("run", 10, true);
                    this.player.txt = this.player.addChild(this.game.add.text(0, -40, "", { fontSize: "24px", fill: "#fff" }));
                    this.player.txt.anchor.set(0.5);
                    game.physics.arcade.enable(this.player);
                    this.onStart();

                };
                this.runLeft = function () {
                    this.flag--;
                    if (this.flag < 0) {
                        this.flag = 0;
                    } else {
                        this.player.x -= 230
                    }
                };
                this.runRight = function () {
                    this.flag++;
                    if (this.flag > 2) {
                        this.flag = 2;
                    } else {
                        this.player.x += 230;
                    }
                };
                this.onStart = function () {

                    this.emitter1 = game.add.emitter(340, 480);
                    this.emitter1.makeParticles('box', 0, 1, true);
                    this.emitter1.setXSpeed(-170, -170);
                    this.emitter1.setYSpeed(120, 120);
                    this.emitter1.setScale(0, 1.6, 0, 1.6, 5000);
                    this.emitter1.setAlpha(0, 1, 2000);
                    this.emitter1.setRotation(0, 0);
                    this.emitter1.start(false, 3000, 500 + this.game.rnd.integerInRange(100, 1000));

                    this.emitter4 = game.add.emitter(340, 480);
                    this.emitter4.makeParticles('boom', 0, 1, true);
                    this.emitter4.setXSpeed(-170, -170);
                    this.emitter4.setYSpeed(120, 120);
                    this.emitter4.setScale(0, 1.6, 0, 1.6, 5000);
                    this.emitter4.setAlpha(0, 1, 2000);
                    this.emitter4.setRotation(0, 0);
                    this.emitter4.start(false, 3000, this.game.rnd.integerInRange(2000, 10000));

                    this.emitter2 = game.add.emitter(320, 480);
                    this.emitter2.makeParticles('box', 0, 1, true);
                    this.emitter2.setXSpeed(0, 0);
                    this.emitter2.setYSpeed(250, 250);
                    this.emitter2.setScale(0, 1.6, 0, 1.6, 5000);
                    this.emitter2.setAlpha(0, 1, 2000);
                    this.emitter2.setRotation(0, 0);
                    this.emitter2.start(false, 3000, 1000 + this.game.rnd.integerInRange(100, 1000));

                    this.emitter5 = game.add.emitter(320, 480);
                    this.emitter5.makeParticles('boom', 0, 1, true);
                    this.emitter5.setXSpeed(0, 0);
                    this.emitter5.setYSpeed(250, 250);
                    this.emitter5.setScale(0, 1.6, 0, 1.6, 5000);
                    this.emitter5.setAlpha(0, 1, 2000);
                    this.emitter5.setRotation(0, 0);
                    this.emitter5.start(false, 3000, this.game.rnd.integerInRange(2000, 6000));

                    this.emitter3 = game.add.emitter(300, 480);
                    this.emitter3.makeParticles('box', 0, 1, true);
                    this.emitter3.setXSpeed(170, 170);
                    this.emitter3.setYSpeed(120, 120);
                    this.emitter3.setScale(0, 1.6, 0, 1.6, 5000);
                    this.emitter3.setAlpha(0, 1, 2000);
                    this.emitter3.setRotation(0, 0);
                    this.emitter3.start(false, 3000, 500 + this.game.rnd.integerInRange(100, 1000));

                    this.emitter6 = game.add.emitter(300, 480);
                    this.emitter6.makeParticles('boom', 0, 1, true);
                    this.emitter6.setXSpeed(170, 170);
                    this.emitter6.setYSpeed(120, 120);
                    this.emitter6.setScale(0, 1.6, 0, 1.6, 5000);
                    this.emitter6.setAlpha(0, 1, 2000);
                    this.emitter6.setRotation(0, 0);
                    this.emitter6.start(false, 3000, this.game.rnd.integerInRange(3000, 8000));

                };
                this.update = function () {
                    if (this.isplaying) {
                        game.physics.arcade.overlap(this.player.b, this.emitter1, this.collectBox, null, this);
                        game.physics.arcade.overlap(this.player.b, this.emitter2, this.collectBox, null, this);
                        game.physics.arcade.overlap(this.player.b, this.emitter3, this.collectBox, null, this);
                        game.physics.arcade.overlap(this.player.b, this.emitter4, this.collectBoom, null, this);
                        game.physics.arcade.overlap(this.player.b, this.emitter5, this.collectBoom, null, this);
                        game.physics.arcade.overlap(this.player.b, this.emitter6, this.collectBoom, null, this);
                    }
                    this.scoretxt.text = self.myscore;
                    this.timetxt.text = self.gametime;
                    if (this.isplaying && self.gamestatus == 3 && self.gametime == 0) {
                        this.gametimeover();
                        if (this.scorevoice.isPlaying) this.scorevoice.stop();
                        if (this.boomvoice.isPlaying) this.boomvoice.stop();
                    }
                    if (this.pmbtn) {
                        self.showpmbtn ? (this.pmbtn.visible = true) : (this.pmbtn.visible = false);
                    }
                };
                this.collectBox = function (player, box) {
                    if (this.isplaying && self.gamestatus == 2 && self.gametime > 0) {
                        box.kill();
                        var addscore = self.coininc || 1;
                        self.myscore += addscore;
                        self.workerdata();
                        this.scorevoice.play();
                        this.player.txt.reset(0, -40);
                        this.player.txt.text = '+' + addscore;
                        this.player.txt.alpha = 1;
                        this.game.add.tween(this.player.txt).to({ y: this.player.txt.y - 100, alpha: 0 }, 800, "Linear", true).onComplete.add(function (txt) {
                            txt.kill();
                        }, this);
                    }
                };
                this.collectBoom = function (player, boom) {
                    if (this.isplaying && self.gamestatus == 2 && self.gametime > 0) {
                        boom.kill();
                        var addscore = self.boomdec || 1;
                        if (addscore > 0) {
                            self.myscore -= addscore;
                            if (self.myscore < 0) {
                                self.myscore = 0;
                            }
                            this.player.txt.reset(0, -40);
                            this.player.txt.text = '-' + addscore;
                            this.player.txt.alpha = 1;
                            this.game.add.tween(this.player.txt).to({ y: this.player.txt.y - 100, alpha: 0 }, 800, "Linear", true).onComplete.add(function (txt) {
                                txt.kill();
                            }, this);
                            self.workerdata();
                        }
                        this.boomvoice.play();

                    }
                };
                this.gametimeover = function () {
                    this.isplaying = false;
                    /*
                    this.emitter1.removeAll();
                    this.emitter2.removeAll();
                    this.emitter3.removeAll();
                    this.emitter4.removeAll();
                    this.emitter5.removeAll();
                    this.emitter6.removeAll();
                    */
                    this.emitter1.destroy();
                    this.emitter2.destroy();
                    this.emitter3.destroy();
                    this.emitter4.destroy();
                    this.emitter5.destroy();
                    this.emitter6.destroy();
                    this.btnLeft.visible = false;
                    this.btnRight.visible = false;
                    this.player.b.animations.stop('run');
                    this.bg.animations.stop('bg');
                    this.overPopup = game.add.group();
                    this.overBox = game.add.image(game.world.centerX, game.world.centerY, 'gameover');
                    this.overBox.scale.set(0.82);
                    this.overBox.anchor.set(0.5);
                    this.overPopup.add(this.overBox);
                    this.scoretip = this.game.add.text(game.world.centerX, game.world.centerY - 30, '您的得分', { fontSize: "32px", fill: "#e8a516" });
                    this.scoretip.anchor.set(0.5);
                    this.overPopup.add(this.scoretip);
                    this.overnum = this.game.add.text(game.world.centerX, game.world.centerY + 52, self.myscore, { fontSize: "64px", fill: "#e8a516" });
                    this.overnum.anchor.set(0.5);
                    this.overPopup.add(this.overnum);
                    this.pmbtn = game.add.sprite(game.world.centerX, game.world.centerY + 152, 'pmbtn');
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
    return appclickrace;
});
