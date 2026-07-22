define('appjjb', ['appsocket', 'wechatcore', 'phaser'], function (appsocket, wechatcore) {
	var appjjb = {
		rotateid: 0,
		gamephb: 10,
		gamestatus: 0,
		loadtxt: null,
		progresstxt: null,
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
				self.closerule = window.localStorage.getItem("closejjbrule-" + XCV3Config.hdid);
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
					alldrops[0].score = data.boomdec;
					alldrops[1].score = data.coininc;
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
					data.djs == 0 && self.endshake();
				} else if (data.type == 'gamejjbrefresh' || data.type == 'gameappjjbrefresh') {
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
				} else if (data.type == "gamejjbrotatehadpay") {
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
			self.djsaudio = $("#djsaudio")[0];
		},
		bindEvent: function () {
			var self = this;
			$(".gamerule a").on('click', function () {
				$('.gamerule').addClass('hidden');
				window.localStorage.setItem("closejjbrule-" + XCV3Config.hdid, '1');
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
		showphbbtn: function (rotateid, gamephb, team) {
			var self = this;
			self.showpmbtn = true;
			self.rotateid = rotateid;
			self.gamephb = gamephb;
		},
		initGame: function () {
			var self = this;
			game = new Phaser.Game(Gameconfig.gameW, Gameconfig.gameH, Phaser.CANVAS, 'zam-app-mainbox', null, true);
			game.playAudio = function (audio) {
				wechatcore.playAudio(audio, '2');
			};

			game.States = {
				bootState: {
					init: function () {
						game.musicPause = false;
						game.scale.pagesAlignHorizontally = true;
						game.scale.pageAlignVertically = true;
						game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
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
						self.loadtext = game.add.text(game.world.centerX, game.world.centerY, '游戏正在加载中..', { fill: '#fff', fontSize: '50px' });
						self.loadtext.anchor.set(0.5);
						self.loadtext.scale.set(0.8);
						self.progresstxt = game.add.text(game.world.centerX, game.world.centerY + 50, '0%', { fill: '#fff', fontSize: '30px' });
						self.progresstxt.anchor.set(0.5);
					},
					preload: function () {
						game.load.image('titleimg', Gameconfig.gameImgs.titleimg);
						game.load.image('player', Gameconfig.gameImgs.player);
						game.load.image('coin', Gameconfig.gameImgs.coin);
						alldrops.forEach(function (item) {
							if (!['boom', 'coin'].includes(item.dkey)) game.load.image(item.dkey, Gameconfig.gameImgs[item.dkey]);
						})
						game.load.image('boom', Gameconfig.gameImgs.boom);
						game.load.image('boomed', Gameconfig.gameImgs.boomed);
						game.load.bitmapFont('zimu', Gameconfig.gameImgs.zimu, Gameconfig.gameImgs.zimuxml);
						game.load.image('scorebox', Gameconfig.gameImgs.scorebox);
						game.load.image('timebox', Gameconfig.gameImgs.timebox);
						game.load.image('numbertxt', Gameconfig.gameImgs.numbertxt);
						game.load.image('overbox', Gameconfig.gameImgs.overbox);
						game.load.image('pmbtn', Gameconfig.gameImgs.pmbtn);
						game.load.audio('coinv', Gameconfig.gameImgs.coinv, true);
						game.load.audio('boomv', Gameconfig.gameImgs.boomv, true);
						game.load.audio('overv', Gameconfig.gameImgs.overv, true);
						if (Gameconfig.gameImgs.bgv) {
							game.load.audio('bgv', Gameconfig.gameImgs.bgv, true);
						}
						game.load.onFileComplete.add(function (progress) {
							self.progresstxt.text = progress + '%';
						});
						game.load.onLoadComplete.add(function () {
							var voices = ['coinv', 'boomv', 'overv'];
							if (Gameconfig.gameImgs.bgv) {
								voices.push('bgv');
							}
							game.sound.setDecodedCallback(voices, function () {
								self.loadtext.destroy();
								self.progresstxt.destroy();
								self.closerule != '1' && $(".gamerule").removeClass('hidden');
								game.state.start('main');
								self.initsocket();
							}, this);
						});
					},
				},
				mainState: {
					create: function () {
						var titleImg = game.add.image(game.world.centerX, 360, 'titleimg');
						titleImg.scale.set(0.7);
						titleImg.anchor.set(0.5, 0.5);
						this.gametxt = game.add.text(game.world.centerX, 650, '111', { fill: '#fff', fontSize: '32px' });
						this.gametxt.anchor.set(0.5);
						this.player = game.add.sprite(game.world.centerX, game.height - 128, 'player');
						this.player.anchor.set(0.5, 1);
						this.player.scale.set(0.9);
						if (!game.musicPause && $("#bgm").length > 0) {
							wechatcore.playAudio($("#bgm")[0]);
							game.musicPause = true;
						}
					},
					update: function () {
						this.gametxt.text = self.gametip;
					},
				},
				gameState: {
					create: function () {
						game.physics.startSystem(Phaser.Physics.ARCADE);
						this.player = game.add.sprite(game.world.centerX, game.height - 178, 'player');
						this.player.anchor.set(0.5, 1);
						this.player.scale.set(0.9);
						game.physics.arcade.enable(this.player);
						this.player.body.collideWorldBounds = true;
						this.player.body.bounce.set(0);
						this.onStart();
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
						this.coinbgm = game.add.audio('coinv', 0.2, false);
						this.boombgm = game.add.audio('boomv', 0.2, false);
						this.overbgm = game.add.audio('overv', 0.2, false);
						this.overPopup = game.add.group();
						this.overBox = game.add.image(game.world.centerX, game.world.centerY, 'overbox');
						this.overBox.scale.set(0.7);
						this.overBox.anchor.set(0.5, 0.5);
						this.overPopup.add(this.overBox);
						this.overscore = game.add.retroFont('numbertxt', 32, 62, "0123456789", 10, 0, 0);
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
						this.overPopup.visible = false;
					},
					onStart: function () {
						var _this = this;
						game.time.events.start();
						this.player.inputEnabled = true;
						this.player.input.enableDrag(false);
						this.player.input.allowVerticalDrag = false;
						alldrops.forEach(function (item) {
							var key = item.dkey;
							_this[key] = new Drop(item);
							_this[key].init();
						})
					},
					showOverPopup: function () {
						var _this = this;
						setTimeout(function () {
							_this.overPopup.visible = true;
							game.playAudio(_this.overbgm);
						}, 400);
					},
					stopGame: function () {
						var _this = this;
						this.player.inputEnabled = false;
						game.time.events.stop(false);
						alldrops.forEach(function (item) {
							var key = item.dkey;
							_this[key].drops.setAll('body.velocity.y', 0);
							_this[key].drops.setAll('body.acceleration.y', 0);
							_this[key].hideDrops();
						})
						this.showOverPopup();
						this.overscore.text = "" + self.myscore;
					},
					setLevel: function () {
						var _this = this;
						if (self.gametime >= 60) {
							self.level = 50;
						} else if (self.gametime < 60 && self.gametime >= 50) {
							self.level = 100;
							alldrops.forEach(function (item, index) {
								var key = item.dkey;
								if (key == 'boom') {
									_this[key].loopevent.delay = 800;
								} else {
									_this[key].loopevent.delay = 500;
								}
							})
						} else if (self.gametime < 50 && self.gametime >= 40) {
							self.level = 150;
							alldrops.forEach(function (item, index) {
								var key = item.dkey;
								if (key == 'boom') {
									_this[key].loopevent.delay = 700;
								} else {
									_this[key].loopevent.delay = 400;
								}
							})
						} else if (self.gametime < 40 && self.gametime >= 30) {
							self.level = 200;
							alldrops.forEach(function (item, index) {
								var key = item.dkey;
								if (key == 'boom') {
									_this[key].loopevent.delay = 600;
								} else {
									_this[key].loopevent.delay = 300;
								}
							})
						} else if (self.gametime < 30 && self.gametime >= 20) {
							self.level = 250;
							alldrops.forEach(function (item, index) {
								var key = item.dkey;
								if (key == 'boom') {
									_this[key].loopevent.delay = 500;
								} else {
									_this[key].loopevent.delay = 200;
								}
							})
						} else if (self.gametime < 10 && self.gametime >= 5) {
							self.level = 300;
							alldrops.forEach(function (item, index) {
								var key = item.dkey;
								if (key == 'boom') {
									_this[key].loopevent.delay = 400;
								} else {
									_this[key].loopevent.delay = 100;
								}
							})
						} else if (self.gametime < 5 && self.gametime >= 0) {
							self.level = 350;
							alldrops.forEach(function (item, index) {
								var key = item.dkey;
								if (key == 'boom') {
									_this[key].loopevent.delay = 300;
								} else {
									_this[key].loopevent.delay = 100;
								}
							})
						}
					},
					crashDrops: function (player, drop) {
						if (self.gamestatus == 2) {
							var dkeys = alldrops.map(function (item) {
								return item.dkey
							});
							if (dkeys.includes(drop.key)) {
								var one = alldrops.find(function (item) {
									return item.dkey == drop.key
								}), scoretype = one.type || '1', onescore = one.score || '0';
								if (onescore > 0) {
									/*
									if (drop.key === "boom") {
										game.playAudio(this.boombgm);
									}else {
										game.playAudio(this.coinbgm);
									}
									*/
									if (scoretype == '1') {
										game.playAudio(this.coinbgm);
										self.myscore += parseInt(onescore);
									} else {
										game.playAudio(this.boombgm);
										self.myscore -= parseInt(onescore);
									}
									if (self.myscore < 0) {
										self.myscore = 0;
									}
									this.getCoinsAni(drop, scoretype, onescore);
									drop.kill();
									self.workerdata();
								}
							}
						}
					},
					getCoinsAni: function (drop, scoretype, onescore) {
						if (drop.key === "boom") {
							var goal = game.add.image(drop.x, drop.y, 'boomed');
							var goalImg = game.cache.getImage('boomed');
							goal.width = drop.width;
							goal.height = goal.width / (goalImg.width / goalImg.height);
							goal.alpha = 0;
							goal.anchor.set(0.5, 0.5);
							goal.scale.set(0.6);
						} else {
							var goal = game.add.bitmapText(drop.x, drop.y, 'zimu', (scoretype == '1' ? '+' : '-') + onescore, 90);
							goal.alpha = 0;
							goal.anchor.set(0.5);
						}
						var showTween = game.add.tween(goal).to({
							alpha: 1,
							y: goal.y - 20
						}, 100, Phaser.Easing.Linear.None, true, 0, 0, false);
						showTween.onComplete.add(function () {
							var hideTween = game.add.tween(goal).to({
								alpha: 0,
								y: goal.y - 20
							}, 100, Phaser.Easing.Linear.None, true, 200, 0, false);
							hideTween.onComplete.add(function () {
								goal.kill();
							});
						});
					},
					gameEnd: function () {
						this.coinbgm.stop();
						this.boombgm.stop();
						this.stopGame();
					},
					update: function () {
						var _this = this;
						alldrops.forEach(function (item, index) {
							var key = item.dkey;
							if (_this[key]) {
								game.physics.arcade.overlap(_this[key].drops, _this.player, _this.crashDrops, null, _this);
							}
						})
						this.setLevel();
						this.score.text = "" + self.myscore;
						this.gametime.text = "" + self.gametime;
						if (this.player.inputEnabled && self.gamestatus == 3 && self.gametime == 0) {
							this.gameEnd();
						}
						self.showpmbtn ? (this.pmbtn.visible = true) : (this.pmbtn.visible = false);
					}
				}
			};
			game.state.add('boot', game.States.bootState);
			game.state.add('loader', game.States.loaderState);
			game.state.add('main', game.States.mainState);
			game.state.add('game', game.States.gameState);
			game.state.start('boot');
			function Drop(config) {
				this.init = function () {
					this.drops = game.add.group();
					this.drops.enableBody = true;
					this.drops.createMultiple(config.count, config.dkey);
					this.drops.setAll('outOfBoundsKill', true);
					this.drops.setAll('checkWorldBounds', true);
					this.maxWidth = game.width - 115;
					this.loopevent = game.time.events.loop(Phaser.Timer.SECOND * config.seconds, this.generateDrop, this);
				};
				this.generateDrop = function () {
					var e = this.drops.getFirstExists(false);
					if (e) {
						e.reset(game.rnd.integerInRange(20, this.maxWidth), -game.cache.getImage(config.dkey).height);
						e.body.velocity.y = config.vel + self.level;
						e.body.acceleration.y = config.acc;
					}
				};
				this.hideDrops = function () {
					var e = this.drops;
					e.visible = false;
				};
			}
		},
	};
	return appjjb;
});
