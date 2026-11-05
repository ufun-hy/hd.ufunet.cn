define('appairplane', ['appsocket', 'wechatcore', 'phaser'], function (appsocket, wechatcore) {
    var appairplane = {
        rotateid: 0,
        gamephb: 10,
        gamestatus: 0,
        gametime: 0,
        myscore: 0,
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
                self.closerule = window.localStorage.getItem("closeairplanerule-" + XCV3Config.hdid);
                self.bindEvent();
                wechatcore.bgAudioPlay();
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
                    self.isteam = data.isteam;
                    self.gameteams = data.teams;
                    self.myteam = data.team;
                    if (data.type == 'gameiswait') {
                        self.gamestatus = 1;
                        self.myscore = 0;
                        self.gametip = self.statustip[0];
                        if (game.state.current != 'main') {
                            setTimeout(function () {
                                game.state.start('main');
                            }, 200);
                        }
                    } else {
                        self.gamestatus = 2;
                        self.myscore = data.myscore;
                        if (game.state.current == 'main') {
                            setTimeout(function () {
                                game.state.start('game');
                            }, 200);
                        }
                        self.gametip = self.statustip[2];
                    }
                    self.showteambox(data.teaminfo, data.jointype);
                } else if (data.type == 'gameiscountdown') {
                    self.gamestatus = 1;
                    self.myscore = 0;
                    self.hidemyteambox();
                    var b = $(".appstartdjs"), e = b.find(".appstartdjsBox"), s = b.find(".startdjsani");
                    s.text(data.djs > 0 ? data.djs : 'GO');
                    b.removeClass('hidden');
                    self.gametip = self.statustip[1];
                    wechatcore.audioPlay(self.djsaudio);
                    if (data.djs == 0) {
                        self.gametip = self.statustip[2];
                        setTimeout(function () {
                            game.state.start('game');
                        }, 3e2);
                    }
                } else if (data.type == 'gameisdjs') {
                    self.gamestatus = 2;
                    self.hidemyteambox();
                    if (self.gamestatus != 3 && game.state.current == 'main') {
                        setTimeout(function () {
                            game.state.start('game');
                        }, 200);
                    }
                    $(".appstartdjs").addClass('hidden');
                    self.gametime = data.djs;
                    if (data.djs == 0) {
                        self.endshake();
                    }
                } else if (data.type == 'gameairplanerefresh' || data.type == 'gameappairplanerefresh') {
                    appsocket.closeClient();
                } else if (data.type == 'gameshowphbbtn') {
                    if (self.gamestatus == 3) {
                        self.showphbbtn(data.rotateid, data.gamephb);
                    }
                } else if (data.type == 'gamenoround' || data.type == 'gameislucker') {
                    self.gamestatus = 0;
                    self.myteam = '0';
                    self.hideteamboxs();
                    self.gametip = (data.type == 'gamenoround' ? '暂无正在进行的轮次' : XCV3Config.isluckertxt);
                } else if (data.type == 'gamestartnojoin') {
                    self.gamestatus = 0;
                    self.gametip = '本轮游戏已经开始，无法加入';
                    self.myteam = '0';
                    self.hideteamboxs();
                } else if (data.type == 'gameneedpay') {
                    self.myteam = '0';
                    self.hideteamboxs();
                    self.gametip = '请先购买参与游戏资格';
                    wechatcore.gamePayrotate(data.rotateid, data.fee, function () {
                        appsocket.closeClient();
                    });
                } else if (data.type == "gameairplanerotatehadpay") {
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
                    self.gamestatus = 0;
                    self.gametip = data.message;
                    self.myteam = '0';
                    self.hideteamboxs();
                }
            };
            appsocket.init(params);
        },
        initAudio: function () {
            var self = this;
            self.djsaudio = { audio: wechatcore.autoAudio({ audio: $("#djsaudio")[0] }) };
        },
        bindEvent: function () {
            $(".gamerule a").on('click', function () {
                $('.gamerule').addClass('hidden');
                window.localStorage.setItem("closeairplanerule-" + XCV3Config.hdid, '1');
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
            if (self.gameteams.length) {
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
            game.state.start('over');
        },
        workerdata: function () {
            var self = this;
            if (self.myscore < 0) {
                self.myscore = 0;
            }
            if (self.gamestatus != 2 || (self.isteam == '1' && (self.myteam == '0' || self.myteam == ''))) return;
            if (sendscore == '1') {
                appsocket.sendgamedata({
                    myscore: self.myscore,
                    myteam: self.myteam,
                    rotateid: self.rotateid,
                });
            }
        },
        showphbbtn: function (rotateid, gamephb, team) {
            var self = this;
            self.showpmbtn = true;
            self.rotateid = rotateid;
            self.gamephb = gamephb;
        },
        initGame: function () {
            var self = this;
            game = new Phaser.Game(Gameconfig.gameW, Gameconfig.gameH, Phaser.CANVAS, 'zam-app-mainbox', null, true);
            game.playMusic = function (sound) {
                var key = sound?.key || '';
                var soundok = key && game.cache.checkSoundKey(key) && game.cache.isSoundDecoded(key);
                if (soundok) {
                    wechatcore.audioPlay({ audio: sound });
                }
            }
            var states = {
                bootState: {
                    init: function () {
                        game.scale.pagesAlignHorizontally = true;
                        game.scale.pageAlignVertically = true;
                        // game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
                        game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
                    },
                    preload: function () {
                        game.load.crossOrigin = 'anonymous';
                    },
                    create: function () {
                        game.state.start('loader');
                    }
                },
                loaderState: {
                    init: function () {
                        this.loadtext = game.add.text(game.world.centerX, game.world.centerY, '游戏正在加载中..', { fill: '#fff', fontSize: '50px' });
                        this.loadtext.anchor.set(0.5);
                        this.loadtext.scale.set(0.8);
                        this.progresstxt = game.add.text(game.world.centerX, game.world.centerY + 60, '0%', { fill: '#fff', fontSize: '30px' });
                        this.progresstxt.anchor.set(0.5);
                    },
                    preload: function () {
                        game.load.image('titleimg', Gameconfig.gameImgs.titleimg);
                        game.load.bitmapFont('zimu', Gameconfig.gameImgs.zimu, Gameconfig.gameImgs.zimuxml);
                        game.load.image('scorebox', Gameconfig.gameImgs.scorebox);
                        game.load.image('timebox', Gameconfig.gameImgs.timebox);
                        game.load.image('numbertxt', Gameconfig.gameImgs.numbertxt);
                        game.load.image('overbox', Gameconfig.gameImgs.overbox);
                        game.load.image('pmbtn', Gameconfig.gameImgs.pmbtn);
                        game.load.audio('piuv', Gameconfig.gameImgs.piuv, true);
                        game.load.audio('boomv', Gameconfig.gameImgs.boomv, true);
                        game.load.audio('overv', Gameconfig.gameImgs.overv, true);
                        game.load.image('background', Gameconfig.gameImgs.background);
                        game.load.image('player', Gameconfig.gameImgs.player);
                        game.load.image('bullet', Gameconfig.gameImgs.bullet);
                        game.load.image('enemybullet', Gameconfig.gameImgs.enemybullet);
                        game.load.image('explodeimg', Gameconfig.gameImgs.enemyexplode);
                        Gameconfig.enemylists.forEach((item) => {
                            game.load.image(item.pic, item.img);
                        });
                        game.load.onFileComplete.add(function (progress, key) {
                            if (key == 'explodeimg') {
                                var exlodeimg = this.cache.getImage(key);
                                game.load.spritesheet('enemyexplode', Gameconfig.gameImgs.enemyexplode, exlodeimg.height, exlodeimg.height, Math.floor(exlodeimg.width / exlodeimg.height));
                            }
                            this.progresstxt.text = progress + '%';
                        }, this);
                        game.load.onLoadComplete.add(function () {
                            var voices = [];
                            if (Gameconfig.gameImgs.piuv) {
                                voices.push('piuv');
                            }
                            if (Gameconfig.gameImgs.boomv) {
                                voices.push('boomv');
                            }
                            if (Gameconfig.gameImgs.overv) {
                                voices.push('overv');
                            }
                            game.sound.setDecodedCallback(voices, function () {
                                this.loadtext.destroy();
                                this.progresstxt.destroy();
                                if (self.closerule != '1') {
                                    $(".gamerule").removeClass('hidden');
                                }
                                game.state.start('main');
                                self.initsocket();
                            }, this);
                        }, this);
                    },
                },
                mainState: {
                    create: function () {
                        game.add.tileSprite(0, 0, game.width, game.height, 'background');
                        this.titleImg = game.add.image(game.world.centerX, game.world.centerY - 200, 'titleimg');
                        this.titleImg.anchor.set(0.5);
                        this.myplane = game.add.sprite(game.world.centerX, game.world.centerY, 'player');
                        this.myplane.anchor.set(0.5);
                        this.gametxt = game.add.text(game.world.centerX, game.world.centerY + 200, '111', { fill: '#fff', fontSize: '32px' });
                        this.gametxt.anchor.set(0.5);
                        this.startbutton = game.add.text(game.world.centerX, game.world.centerY + 200, "click to start", { font: "65px Arial", fill: "#ff0044", align: "center" });
                        this.startbutton.anchor.set(0.5);
                        this.startbutton.inputEnabled = true;
                        this.startbutton.visible = false;
                        this.startbutton.events.onInputDown.add(function () {
                            game.state.start('game');
                        }, this);
                    },
                    update: function () {
                        this.gametxt.text = self.gametip;
                    },
                },
                gameState: {
                    create: function () {
                        game.physics.startSystem(Phaser.Physics.ARCADE);
                        var bg = game.add.tileSprite(0, 0, game.width, game.height, 'background');
                        bg.autoScroll(0, 200);
                        this.myplane = game.add.sprite(game.world.centerX, game.world.centerY - 50, 'player');
                        this.myplane.anchor.set(0.5, 0.5);
                        var tween = game.add.tween(this.myplane).to({ y: game.height - 200 }, 800, Phaser.Easing.Sinusoidal.InOut, true);
                        tween.onComplete.add(this.onStart, this);
                        this.showScore = game.add.sprite();
                        this.scoreBox = game.add.sprite(25, 8, 'scorebox');
                        this.showScore.addChild(this.scoreBox);
                        this.score = game.add.retroFont('numbertxt', 32, 62, "0123456789", 10, 0, 0);
                        this.score.setFixedWidth(160, Phaser.RetroFont.ALIGN_RIGHT);
                        this.score.text = "0";
                        this.num = game.add.image(100, 46, this.score);
                        this.num.scale.set(0.8);
                        this.showScore.addChild(this.num);
                        this.showScore.bringToTop();
                        this.showScore.visible = Gameconfig.showscorebox == '1' ? true : false;
                        this.showTime = game.add.sprite();
                        this.timeBox = game.add.sprite(game.width - 270, 8, 'timebox');
                        this.showTime.addChild(this.timeBox);
                        this.gametime = game.add.retroFont('numbertxt', 32, 62, "0123456789", 10, 0, 0);
                        this.gametime.setFixedWidth(160, Phaser.RetroFont.ALIGN_RIGHT);
                        this.gametime.text = "30";
                        this.gamesecond = game.add.image(game.width - 200, 46, this.gametime);
                        this.gamesecond.scale.set(0.8);
                        this.showTime.addChild(this.gamesecond);
                        this.showTime.bringToTop();
                        this.piubgm = game.add.audio('piuv');
                        this.piubgm.volume = 0.8;
                        this.piubgm.allowMultiple = true;
                        this.boombgm = game.add.audio('boomv');
                        this.boombgm.volume = 0.8;
                        this.boombgm.allowMultiple = true;
                    },
                    onStart: function () {
                        this.mybullets = game.add.group();
                        this.myStartFire = true;
                        this.bulletTime = 0;
                        game.physics.arcade.enable(this.myplane);
                        this.myplane.body.collideWorldBounds = true;
                        this.myplane.inputEnabled = true;
                        this.myplane.input.enableDrag(false);
                        this.myplane.events.onDragStart.add(function () {
                            this.myplane.body.moves = false;
                        }, this);
                        this.myplane.events.onDragStop.add(function () {
                            this.myplane.body.moves = true;
                            this.myplane.x = Math.max(this.myplane.width / 2,
                                Math.min(game.width - this.myplane.width / 2, this.myplane.x));
                            this.myplane.y = Math.max(this.myplane.height / 2,
                                Math.min(game.height - this.myplane.height / 2, this.myplane.y));
                        }, this);
                        Gameconfig.enemylists.forEach((item) => {
                            this[item.pic] = new Enemy(item);
                            this[item.pic].init();
                        });
                    },
                    myFireBullet: function () {
                        if (this.myplane.alive && game.time.now > this.bulletTime) {
                            var bullet = this.mybullets.getFirstExists(false);
                            var bulletY = this.myplane.y - game.cache.getImage('player').height / 2;
                            if (bullet) {
                                bullet.reset(this.myplane.x, bulletY);
                            } else {
                                bullet = game.add.sprite(this.myplane.x, bulletY, 'bullet');
                                bullet.outOfBoundsKill = true;
                                bullet.checkWorldBounds = true;
                                bullet.anchor.set(0.5);
                                this.mybullets.addChild(bullet);
                                game.physics.arcade.enable(bullet);
                            }
                            game.playMusic(this.piubgm);
                            bullet.body.velocity.y = -parseInt((Gameconfig.playerconfig.bulletspeed || 400));
                            this.bulletTime = game.time.now + parseInt((Gameconfig.playerconfig.bulletinterval || 300));
                        }
                    },
                    //子弹击中敌机
                    hitEnemy: function (myBullet, enemy, enemys) {
                        myBullet.kill();
                        enemy.life--;
                        if (enemy.life <= 0) {
                            var hitenemyexplode = Gameconfig.playerconfig.hitenemyexplode || '1';
                            if (hitenemyexplode == '1') {
                                enemys.enemyExplosion(enemy);
                            } else {
                                enemy.kill();
                            }
                            self.myscore += enemy.score;
                            self.workerdata();
                        }
                    },
                    hitMyplane: function (myplane, bullet) {
                        var bullethitplayer = Gameconfig.playerconfig.bullethitplayer || '1';
                        if (bullethitplayer == '1') {
                            this.myplaneAni(myplane);
                        }
                        bullet.kill();
                        var bulletscore = bullet.bulletscore;
                        if (bulletscore) {
                            self.myscore -= bulletscore;
                            self.workerdata();
                        }
                    },
                    crashMyplane: function (myplane, enemy, enemys) {
                        var playercrashenemy1 = Gameconfig.playerconfig.playercrashenemy1 || '1';
                        if (playercrashenemy1 == '1') {
                            this.myplaneAni(myplane);
                        }
                        var playercrashenemy2 = Gameconfig.playerconfig.playercrashenemy2 || '1';
                        if (playercrashenemy2 == '1') {
                            enemys.enemyExplosion(enemy);
                        } else {
                            enemy.kill();
                        }
                        var crashscore = enemy.crashscore;
                        if (crashscore) {
                            self.myscore -= crashscore;
                            self.workerdata();
                        }
                    },
                    myplaneAni: function (myplane) {
                        if (!myplane.ishited) {
                            myplane.ishited = true;
                            game.add.tween(myplane).to({ alpha: 0.5 }, 800, Phaser.Easing.Sinusoidal.InOut, true).onComplete.add(function () {
                                myplane.alpha = 1;
                                myplane.ishited = false;
                            }, this);
                        }
                    },
                    update: function () {
                        this.score.text = `${self.myscore}`;
                        this.gametime.text = `${self.gametime}`;
                        if (self.gamestatus == 3 && self.gametime == 0) {
                            this.myStartFire = false;
                        }
                        if (this.myStartFire) {
                            this.myFireBullet();
                            Gameconfig.enemylists.forEach((item) => {
                                if (item.openbullet == '1') {
                                    this[item.pic].enemyFire();
                                }

                                game.physics.arcade.overlap(this.mybullets, this[item.pic].enemys, function (myBullet, enemy) {
                                    this.hitEnemy(myBullet, enemy, this[item.pic]);
                                }, null, this);
                                game.physics.arcade.overlap(this[item.pic].enemyBullets, this.myplane, this.hitMyplane, null, this);
                                game.physics.arcade.overlap(this[item.pic].enemys, this.myplane, function (myplane, enemy) {
                                    this.crashMyplane(myplane, enemy, this[item.pic]);
                                }, null, this);
                            });
                        }
                    }
                },
                overState: {
                    create: function () {
                        game.add.tileSprite(0, 0, game.width, game.height, 'background');
                        this.overPopup = game.add.group();
                        this.overBox = game.add.image(game.world.centerX, game.world.centerY, 'overbox');
                        this.overBox.scale.set(0.7);
                        this.overBox.anchor.set(0.5, 0.5);
                        this.overPopup.add(this.overBox);
                        this.overscore = game.add.retroFont('numbertxt', 32, 62, "0123456789", 10, 0, 0);
                        this.overscore.text = `${self.myscore}`;
                        this.overnum = game.add.image(game.world.centerX + 50, game.world.centerY - 88, this.overscore);
                        this.overnum.scale.set(1);
                        this.overPopup.add(this.overnum);
                        this.pmbtn = game.add.button(game.world.centerX, game.world.centerY + 100, 'pmbtn', function () {
                            this.overbgm.stop();
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
                        this.pmbtn.scale.set(0.7);
                        this.pmbtn.anchor.set(0.5, 0.5);
                        this.pmbtn.visible = false;
                        this.overPopup.add(this.pmbtn);
                        this.overbgm = game.add.audio('overv');
                        game.playMusic(this.overbgm);
                    },
                    update: function () {
                        this.pmbtn.visible = self.showpmbtn;
                    }
                }
            };
            game.state.add('boot', states.bootState);
            game.state.add('loader', states.loaderState);
            game.state.add('main', states.mainState);
            game.state.add('game', states.gameState);
            game.state.add('over', states.overState)
            game.state.start('boot');
        },
    };
    function Enemy(config) {
        this.init = function () {
            this.enemys = game.add.group();
            this.enemyBullets = game.add.group();
            game.time.events.loop(parseInt(config.makespeed), this.generateEnemy, this);
            this.explosions = game.add.group();
        };
        //生产敌机
        this.generateEnemy = function () {
            var planeObj = game.cache.getImage(config.pic);
            var enemyW = planeObj.width;
            var enemyH = planeObj.height;
            var enemy = this.enemys.getFirstExists(false);
            var eX = game.rnd.integerInRange(enemyW, game.width - enemyW);
            var eY = -enemyH / 2;
            if (enemy) {
                enemy.reset(eX, eY);
                if (enemy.tween) {
                    enemy.tween.stop();
                }
            } else {
                enemy = game.add.sprite(eX, eY, config.pic);
                enemy.outOfBoundsKill = true;
                enemy.checkWorldBounds = true;
                enemy.anchor.set(0.5, 0.5);
                this.enemys.addChild(enemy);
                game.physics.arcade.enable(enemy);
            }
            enemy.score = parseInt(config.score);
            enemy.life = parseInt(config.life);
            enemy.crashscore = parseInt(config.crashscore);
            enemy.movetype = config.movetype || '1';
            enemy.body.velocity.y = parseInt(config.flyspeed);
            if (enemy.movetype == '2') {
                enemy.body.velocity.y = 0;
                var targetY = game.world.height + enemyH;
                var path = [];
                var segments = game.rnd.integerInRange(6, 10);
                for (var i = 1; i <= segments; i++) {
                    var yPos = (targetY / segments) * i;
                    var randomOffset = game.rnd.integerInRange(-200, 200);
                    var targetX = eX + randomOffset;
                    targetX = Math.max(enemyW / 2 + 50, Math.min(game.width - enemyW / 2 - 50, targetX));
                    path.push({ x: targetX, y: yPos });
                }
                path[path.length - 1] = { x: eX, y: targetY };
                var flightTime = Math.round(targetY / parseInt(config.flyspeed));
                var baseTime = Math.floor(flightTime * 1000 / path.length);
                enemy.tween = game.add.tween(enemy).to(path[0], baseTime + game.rnd.integerInRange(0, baseTime / 3), Phaser.Easing.Quadratic.InOut);
                for (var j = 1; j < path.length; j++) {
                    enemy.tween = enemy.tween.to(path[j], baseTime + game.rnd.integerInRange(0, baseTime / 3), Phaser.Easing.Quadratic.InOut);
                }
                enemy.tween.onComplete.addOnce(function () {
                    enemy.kill();
                });
                enemy.tween.start();
            }
        };
        this.enemyFire = function () {
            var planeimg = game.cache.getImage(config.pic);
            var bulletpic = config.bulletpic || 'enemybullet';
            var bulletImg = game.cache.getImage(bulletpic);
            this.enemys.forEachAlive(function (enemy) {
                if (game.time.now > (enemy.bulletTime || 0)) {
                    var bullet = this.enemyBullets.getFirstExists(false);
                    var bulletX = enemy.x;
                    var bulletY = enemy.y + planeimg.height / 2 + bulletImg.height / 2;
                    if (bullet) {
                        bullet.reset(bulletX, bulletY);
                    } else {
                        bullet = game.add.sprite(bulletX, bulletY, bulletpic);
                        bullet.outOfBoundsKill = true;
                        bullet.checkWorldBounds = true;
                        bullet.anchor.set(0.5, 0.5);
                        this.enemyBullets.addChild(bullet);
                        game.physics.arcade.enable(bullet);
                    }
                    bullet.bulletscore = parseInt(config.bulletscore);
                    bullet.body.velocity.y = parseInt(config.flyspeed * 2);
                    enemy.bulletTime = game.time.now + parseInt(config.bulletspeed);
                }
            }, this);
        };
        this.enemyExplosion = function (enemy) {
            enemy.kill();
            var currentState = game.state.getCurrentState();
            game.playMusic(currentState.boombgm);
            var explosion = this.explosions.getFirstExists(false);
            var explodepic = config.explodepic || 'enemyexplode';
            if (explosion) {
                explosion.reset(enemy.x, enemy.y);
            } else {
                explosion = game.add.sprite(enemy.x, enemy.y, explodepic);
                explosion.anchor.set(0.5, 0.5);
                explosion.animations.add(explodepic);
                this.explosions.addChild(explosion);
            }
            explosion.play(explodepic, 30, false, true);
        };
    }
    return appairplane;
});
