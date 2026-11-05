define('screenairplane', ['screensocket', 'screencore', 'template', 'layerBox', 'fulldm', 'keyboard', 'phaser'], function (screensocket, screencore, template, layerBox, fulldm, keyboardJS) {
    var screenairplane = {
        gamestatus: 0,
        stopclick: false,
        maxscore: 120,
        autorun: 2,
        autonum: 20,
        gametimererror: true,
        joinInterval: null,
        lineitemRender: null,
        newjoinRender: null,
        pmitemRender: null,
        isteam: '2',
        audio: {},
        init: function () {
            var self = this;
            self.lineitemRender = template('lineItem-tpl');
            self.pmitemRender = template('pmshakeItem-tpl');
            var params = {};
            params.onmessage = function (data) {
                if (data.type == 'connected') {
                    screensocket.isclose = false;
                    screencore.connectsocket({ clientid: data.clientid });
                } else if (data.type == 'gamenoround') {
                    if (self.gamestatus == 0) {
                        self.showLastRoundUser();
                    }
                } else if (data.type == 'gameonline') {
                    self.gamestatus == 1 && self.rushuser(data);
                } else if (data.type == 'gameiswait' || data.type == 'gameisrun') {
                    self.initAudio();
                    self.bindEvent();
                    self.maxscore = data.maxscore;
                    self.isteam = data.isteam;
                    self.createLine(data.type);
                    //隐藏榜单 start
                    if (!$('.rankBox').hasClass("display-none")) {
                        $('.rankBox').addClass("display-none");
                    }
                    if (!$('.banglistBox').hasClass("display-none")) {
                        $('.banglistBox').addClass("display-none");
                    }
                    //隐藏榜单 end

                    if (data.type == 'gameiswait') {
                        if ($('.welcomeBox').hasClass("display-none")) {
                            $('.welcomeBox').removeClass("display-none").animateControl(screencore.anicssArr());
                        }
                        if (!$('.lightfire-wrapper').hasClass("display-none")) {
                            $('.lightfire-wrapper').addClass("display-none");
                        }
                        self.gamestatus = 1;
                        clearInterval(self.joinInterval);
                        self.autorun = data.autorun;
                        self.autonum = data.autonum;
                        if (game.state.current != 'main') {
                            setTimeout(function () {
                                game.state.start('main');
                            }, 200);
                        }
                        screencore.gameSendonline();
                        self.joinInterval = setInterval(function () {
                            screencore.gameSendonline();
                        }, 2e3);
                    } else {
                        if ($('.lightfire-wrapper').hasClass("display-none")) {
                            $(".lightfire-wrapper").removeClass('display-none');
                        }
                        self.gamestatus = 2;
                        if (game.state.current == 'main') {
                            setTimeout(function () {
                                game.state.start('game');
                            }, 200);
                        }
                        self.gametimererror = true;
                        setTimeout(function () {
                            if (self.gamestatus == 2 && self.gametimererror) {
                                screencore.gameTimererror();
                            }
                        }, 2e3);
                    }
                } else if (data.type == 'gameiscountdown') {
                    self.gametimererror = false;
                    if (!$(".welcomeBox").hasClass("display-none")) {
                        $(".welcomeBox").addClass('display-none');
                    }
                    var b = $(".webstartdjs"), e = b.find(".webstartdjsBox"), s = b.find(".startdjsani");
                    s.text(data.djs > 0 ? data.djs : 'GO');
                    b.removeClass('display-none');
                    self.audio.countAudio.play();
                    if (data.djs == 0) {
                        setTimeout(function () {
                            game.state.start('game');
                        }, 200);
                    }
                } else if (data.type == 'gameisdjs') {
                    self.gamestatus = 2;
                    if (self.gamestatus != 3 && game.state.current == 'main') {
                        setTimeout(function () {
                            game.state.start('game');
                        }, 200);
                    }
                    self.gametimererror = false;
                    if ($('.lightfire-wrapper').hasClass("display-none")) {
                        $('.lightfire-wrapper').removeClass("display-none");
                    }
                    $(".welcomeBox,.webstartdjs").addClass('display-none');
                    var b = $(".webgamedjs"), s = b.find(".gamedjsani");
                    s.text(data.djs);
                    b.removeClass('display-none');
                    if (data.djs == 0) {
                        self.gamestatus = 3;
                        b.addClass('display-none');
                        self.audio.overAudio.play();
                        layerBox.showLoading('正在加载排名数据，请稍后...');
                        $(".lightfire-mainbox .lightfire-wrapper").addClass("display-none");
                        game.state.start('over');
                    }
                    self.rushDom(data.list, data.teams);
                } else if (data.type == 'gameshowphbbtn') {
                    layerBox.closeLayer();
                    var btn = $(".rankBox-btns .paiming");
                    btn.attr({ 'data-rotateid': data.rotateid, 'data-gamephb': data.gamephb });
                    screencore.gameEndphb((data.isteam == '1' ? data.teams : data.list), data.endphb);
                    screencore.sendLuckerTpl({ rotateid: data.rotateid });
                } else if (data.type == 'gameairplanerefresh' || data.type == 'gameerrorhaddone') {
                    window.location.reload();
                } else if (data.type == 'gameiserror') {
                    layerBox.showMsg('当前轮次出现异常');
                    setTimeout(function () {
                        window.location.reload();
                    }, 1e3);
                } else if (data.type == 'swingshakeoffline') {
                    screensocket.forceoff = true;
                    layerBox.showMsg('当前游戏不支持多开，当前窗口已经被迫下线', '0');
                } else if (data.type == 'screendm') {
                    var messages = data.messages;
                    if (messages) {
                        if ($.isArray(messages) && messages.length > 0) {
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
            params.onclose = function () {
                screensocket.reconnect();
                clearInterval(self.joinInterval);
            };
            screensocket.init(params);
        },
        initAudio: function () {
            var self = this;
            self.audio.joinAudio = document.getElementById("joinaudio");
            self.audio.countAudio = document.getElementById("countaudio");
            self.audio.overAudio = document.getElementById("overaudio");
        },
        bindEvent: function () {
            var self = this;
            $(".start-btn").off('click').on('click', function () {
                if (screensocket.isclose) return;
                if (parseInt($(".welcomeBox-nums span").text()) == 0) return layerBox.showMsg('当前无用户参与，无法开始游戏');
                if (self.stopclick) return;
                self.stopclick = true;
                $(".welcomeBox").addClass('display-none');
                screencore.hideFootAndQr();
                clearInterval(self.joinInterval);
                screencore.ajaxSubmit("/screen/common/gamestart", { 'gametype': XCV3Config.gametype }).then(function (data) {
                    if (data.code != 0) {
                        layerBox.showMsg(data.msg);
                    }
                }, function () {
                    self.stopclick = false;
                    layerBox.showMsg('网络太差，请稍后重试');
                });
            });
            $(".rankBox .nextround").off('click').on('click', function () {
                screencore.gameautocreate();
            });
            var clickpm = false;
            $(".rankBox .paiming").off('click').on('click', function () {
                var $this = $(this);
                $(".banglistBox-btns").removeAttr("data-nowrotateid");
                if (clickpm) return;
                clickpm = true;
                screencore.ajaxSubmit('/screen/common/gamerotatephb', { 'gametype': XCV3Config.gametype, rotateid: $this.attr('data-rotateid'), gamephb: $this.attr('data-gamephb') }, '正在获取排行榜数据').then(function (data) {
                    clickpm = false;
                    if (data.code == 0) {
                        var pmHtml = "", showphbaward = data.msg.showphbaward || '2';
                        if (data.msg.list.length > 0) {
                            $.each(data.msg.list, function (k, v) {
                                v.showphbaward = showphbaward;
                                v.key = k;
                                pmHtml += self.pmitemRender(v);
                            })
                        }
                        $(".banglist-title").html(template("pmshakeHeader-tpl", { isteam: data.msg.isteam, showphbaward: showphbaward }));
                        $(".banglistBox .banglist").html(pmHtml);
                        $('.banglistBox').removeClass("display-none").animateControl('bounceInUp');
                    } else {
                        layerBox.showMsg(data.msg);
                    }
                }, function () {
                    clickpm = false;
                    layerBox.showMsg('网络太差，请稍后重试');
                });
            });
            $(".banglist-close i").off('click').on('click', function () {
                $('.banglistBox').animateControl('bounceOutDown', function (e) {
                    e.addClass('display-none');
                });
            });
            var clickpn = false;
            $(".banglistBox-btns a").off('click').on('click', function () {
                var $this = $(this);
                if (clickpn) return;
                clickpn = true;
                var isprev = $this.hasClass('banglistBox-btn-prev');
                var rotateid = $this.parent().attr('data-nowrotateid') ? $this.parent().attr('data-nowrotateid') : $(".rankBox-btns .paiming").attr('data-rotateid');
                screencore.ajaxSubmit('/screen/common/gamerotatepnphb', { 'gametype': XCV3Config.gametype, rotateid: rotateid, isprev: isprev ? '1' : '2' }, '正在获取排行榜数据').then(function (data) {
                    clickpn = false;
                    if (data.code == 0) {
                        var pmHtml = "", showphbaward = '2';
                        if (data.msg.list.length > 0) {
                            $.each(data.msg.list, function (k, v) {
                                v.showphbaward = showphbaward;
                                v.key = k;
                                pmHtml += self.pmitemRender(v);
                            })
                        }
                        $(".banglist-title").html(template("pmshakeHeader-tpl", { isteam: data.msg.isteam, showphbaward: showphbaward }));
                        $this.parent().attr('data-nowrotateid', data.msg.rotateid);
                        $(".banglistBox .banglist").html(pmHtml);
                    } else {
                        layerBox.showMsg(data.msg);
                    }
                }, function () {
                    clickpn = false;
                    layerBox.showMsg('网络太差，请稍后重试');
                });
            });
            keyboardJS.off(['space', 'right', 'shift']);
            keyboardJS.bind('space', function (e) {
                if (self.gamestatus == 1) {
                    $(".start-btn").trigger('click');
                }
            });
            keyboardJS.bind('right', function (e) {
                if (self.gamestatus == 2) {
                    layerBox.showConfirm('警告', '当前轮次还未结束，确定要强制结束么?', ['确定', '取消'], function () {
                        $(".welcomeBox").addClass('display-none');
                        screencore.ajaxSubmit("/screen/common/gameend", { 'gametype': XCV3Config.gametype }).then(function (data) { });
                    });
                } else {
                    self.gamestatus != 1 && $(".rankBox .nextround").trigger('click');
                }
            });
            keyboardJS.bind('shift', function (e) {
                if (self.gamestatus == 1 || self.gamestatus == 2) return;
                if (!$(".rankBox").is(":hidden")) {//已经出来了前10排名 
                    if ($(".banglistBox").is(":hidden")) {
                        $(".rankBox .paiming").trigger('click');
                    } else {
                        $(".banglist-close i").trigger('click');
                    }
                }
            });
            $(window).resize(function () {
                self.resize();
            });
        },
        rushDom: function (lists, teams) {
            var self = this, l = $(".lightfire-wrapper ul li");
            l.each(function (i, v) {
                var oneuser = self.isteam == '1' ? teams[i] : lists[i];
                var score = 0, nickname = defaultName, avatar = defaultImg;
                if (oneuser) {
                    var openid = oneuser.openid, notfly = $(v).attr('data-openid') == openid, isintop = l.filter(function (o, i) {
                        return openid == $(i).attr("data-openid")
                    });
                    if (!notfly && isintop.length > 0) {
                        var frompos = isintop[0].getBoundingClientRect(), topos = $(v)[0].getBoundingClientRect(), x = topos.left - frompos.left, y = topos.top - frompos.top;
                        if (x || y) {
                            isintop.css({
                                "transform": "translate(" + x + "px," + y + "px)",
                                "transition": "transform 0.2s",
                            }).on("webkitTransitionEnd transitionend", function () {
                                isintop.removeAttr('style');
                            });
                        }
                    }
                    nickname = oneuser.nickname;
                    avatar = oneuser.avatar;
                    score = oneuser.score;
                    $(v).attr("data-openid", openid);
                } else {
                    $(v).removeAttr("data-openid");
                }
                $(v).find(".avatarbox img").attr('src', avatar);
                $(v).find(".scorebox .username").html(nickname);
                $(v).find(".scorebox .userscore").html(score);
            });
        },
        showLastRoundUser: function () {
            var self = this, tipindex = layerBox.showLoading('无正在进行的轮次，直接显示最后一轮结果');
            screencore.ajaxSubmit('/screen/common/getlastrotatephb', { 'gametype': XCV3Config.gametype }).then(function (data) {
                if (data.code == 0) {
                    if (data.msg == '1') {
                        layerBox.close(tipindex);
                        $(".lightfire-mainbox .emptybox").removeClass("display-none");
                    } else {
                        setTimeout(function () {
                            layerBox.close(tipindex);
                        }, 3e2);
                        self.bindEvent();
                        var btn = $(".rankBox-btns .paiming");
                        btn.attr({ 'data-rotateid': data.msg.rotateid, 'data-gamephb': data.msg.gamephb });
                        screencore.gameEndphb(data.msg.lists, data.msg.endphb);
                    }
                } else {
                    layerBox.close(tipindex);
                    layerBox.showMsg(data.msg);
                }
            }, function () {
                layerBox.close(tipindex);
                layerBox.showMsg('网络太差，请稍后重试');
            });

        },
        createLine: function (gameflag) {
            var self = this, gameflag = gameflag || 'gameiswait', trackHtml = "", maxline = 10;
            if (gameflag == 'gameiswait' || (gameflag != 'gameiswait' && !$('.lightfire-wrapper ul li').length)) {
                for (var i = 0; i < maxline; i++) {
                    trackHtml += self.lineitemRender({ i: i });
                }
                $(".lightfire-wrapper ul").html(trackHtml);
            }
        },
        resize: function () {

        },
        rushuser: function (data) {
            var self = this;
            screencore.gamerushwelcomeusers({
                users: data.user || [],
                isteam: self.isteam || '2',
                count: data.count || '0',
            });
            if (self.autorun == 1) {
                if (self.gamestatus == 1 && data.count >= self.autonum) {
                    self.autostart();
                }
            }
        },
        autostart: function () {
            var self = this;
            clearInterval(self.joinInterval);
            setTimeout(function () {
                $(".start-btn").trigger('click');
            }, 1e3)
        },
        initGame: function () {
            var self = this;
            self.isvideobg = $(".videoBg").length;
            $('.pc-box').append('<div class="game" id="game"></div>');
            game = new Phaser.Game(1920, 1080, Phaser.CANVAS, 'game', null, true);
            game.playMusic = function (sound) {
                var key = sound?.key || '';
                var soundok = key && game.cache.checkSoundKey(key) && game.cache.isSoundDecoded(key);
                if (soundok) {
                    sound.play();
                }
            }
            var states = {
                bootState: {
                    init: function () {
                        this.scale.pagesAlignHorizontally = true;
                        this.scale.pageAlignVertically = true;
                        this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
                    },
                    preload: function () {
                        this.load.crossOrigin = 'anonymous';
                    },
                    create: function () {
                        this.state.start('loader');
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
                        game.load.audio('piuv', Gameconfig.gameImgs.piuv, true);
                        game.load.audio('boomv', Gameconfig.gameImgs.boomv, true);
                        if (!self.isvideobg) {
                            game.load.image('background', Gameconfig.gameImgs.background);
                        }
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
                                this.load.spritesheet('enemyexplode', Gameconfig.gameImgs.enemyexplode, exlodeimg.height, exlodeimg.height, Math.floor(exlodeimg.width / exlodeimg.height));
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
                            game.sound.setDecodedCallback(voices, function () {
                                this.loadtext.destroy();
                                this.progresstxt.destroy();
                                self.init();
                                game.state.start('main');
                            }, this);
                        }, this);
                    },
                },
                mainState: {
                    create: function () {
                        if (!self.isvideobg) {
                            game.add.tileSprite(0, 0, game.width, game.height, 'background');
                        }
                    },
                },
                gameState: {
                    create: function () {
                        game.physics.startSystem(Phaser.Physics.ARCADE);
                        if (!self.isvideobg) {
                            var bg = game.add.tileSprite(0, 0, game.width, game.height, 'background');
                            bg.autoScroll(0, 200);
                        }
                        this.myplane = game.add.sprite(game.world.centerX, game.world.centerY - 50, 'player');
                        this.myplane.anchor.set(0.5, 0.5);
                        this.myplane.scale.set(1);
                        game.physics.arcade.enable(this.myplane);
                        var tween = game.add.tween(this.myplane).to({ y: game.height - 200 }, 800, Phaser.Easing.Sinusoidal.InOut, true);
                        tween.onComplete.add(this.onStart, this);
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
                        Gameconfig.enemylists.forEach((item) => {
                            this[item.pic] = new Enemy(item);
                            this[item.pic].init();
                        });
                        this.minY = this.myplane.height * 1.5;
                        this.maxY = game.height - this.myplane.height / 2;
                        this.minX = this.myplane.width / 2;
                        this.maxX = game.width - this.myplane.width * 2;
                        this.myplane.body.velocity.x = 200;
                        this.myplane.body.velocity.y = 150;

                        this.changeDirectionTimer = game.time.events.loop(Phaser.Timer.SECOND * 1, function () {
                            var newVx = game.rnd.integerInRange(-300, 300);
                            var newVy = game.rnd.integerInRange(-200, 200);

                            this.myplane.body.velocity.x = newVx;
                            this.myplane.body.velocity.y = newVy;

                            if (Math.abs(this.myplane.body.velocity.x) < 100) {
                                this.myplane.body.velocity.x = this.myplane.body.velocity.x > 0 ? 150 : -150;
                            }
                            if (Math.abs(this.myplane.body.velocity.y) < 80) {
                                this.myplane.body.velocity.y = this.myplane.body.velocity.y > 0 ? 120 : -120;
                            }
                        }, this);
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
                        if (this.myplane && this.myplane.alive) {
                            var bounced = false;
                            if (this.myplane.y <= this.minY) {
                                this.myplane.y = this.minY;
                                if (this.myplane.body.velocity.y < 0) {
                                    this.myplane.body.velocity.y = Math.abs(this.myplane.body.velocity.y) * 0.8;
                                    bounced = true;
                                }
                            } else if (this.myplane.y >= this.maxY) {
                                this.myplane.y = this.maxY;
                                if (this.myplane.body.velocity.y > 0) {
                                    this.myplane.body.velocity.y = -Math.abs(this.myplane.body.velocity.y) * 0.8;
                                    bounced = true;
                                }
                            }
                            if (this.myplane.x <= this.minX) {
                                this.myplane.x = this.minX;
                                if (this.myplane.body.velocity.x < 0) {
                                    this.myplane.body.velocity.x = Math.abs(this.myplane.body.velocity.x) * 0.8;
                                    bounced = true;
                                }
                            } else if (this.myplane.x >= this.maxX) {
                                this.myplane.x = this.maxX;
                                if (this.myplane.body.velocity.x > 0) {
                                    this.myplane.body.velocity.x = -Math.abs(this.myplane.body.velocity.x) * 0.8;
                                    bounced = true;
                                }
                            }
                        }
                    },
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
                        }
                    },
                    hitMyplane: function (myplane, bullet) {
                        var bullethitplayer = Gameconfig.playerconfig.bullethitplayer || '1';
                        if (bullethitplayer == '1') {
                            this.myplaneAni(myplane);
                        }
                        bullet.kill();
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
                        if (!self.isvideobg) {
                            game.add.tileSprite(0, 0, game.width, game.height, 'background');
                        }
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
            enemy.life = parseInt(config.life);
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
            var planeImg = game.cache.getImage(config.pic);
            var bulletpic = config.bulletpic || 'enemybullet';
            var bulletImg = game.cache.getImage(bulletpic);
            this.enemys.forEachExists(function (enemy) {
                if (game.time.now > (enemy.bulletTime || 0)) {
                    var bullet = this.enemyBullets.getFirstExists(false);
                    var bulletX = enemy.x;
                    var bulletY = enemy.y + planeImg.height / 2 + bulletImg.height / 2;
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
                    bullet.body.velocity.y = parseInt(config.flyspeed * 2);
                    enemy.bulletTime = game.time.now + parseInt(config.bulletspeed);
                }
            }, this);
        };
        //敌机爆炸
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
    return screenairplane;
});
