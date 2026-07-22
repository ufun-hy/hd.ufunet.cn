define('appgame', ['appsocket', 'jquery.shake', 'wechatcore'], function (appsocket, Shake, wechatcore) {
	var initialTouch, totalAngle = 0, tempAngle = 0;
	var appgame = {
		rotateid: 0,
		gamestatus: 0,
		playtype: -1,
		statustip: ['游戏还未开始', '正在倒计时，马上开始', '游戏开始了', '游戏已结束'],
		gameInterval: null,
		gametime: 30,
		myscore: 0,
		maxscore: 120,
		myshakeEvent: null,
		appbgmusic: false,
		isteam: '2',
		myteam: '0',
		gameteams: [],
		kh: ['加油啊', '看什么看，速度摇', '别停啊，继续摇', '加油~加油~'],
		init: function () {
			var self = this;
			var params = {};
			params.onmessage = function (data) {
				if (data.type == 'connected') {
					appsocket.isclose = false;
					wechatcore.connectsocket({ clientid: data.clientid });
				} else if (data.type == 'gameiswait' || data.type == 'gameisrun') {
					self.hideMask();
					$(".appstartdjs").addClass('hidden');
					self.rotateid = data.rotateid;
					self.playtype = data.playtype;
					self.isteam = data.isteam;
					self.gameteams = data.teams;
					self.myteam = data.team;
					self.initplaytype();
					self.hidephbbtn();
					self.gametime = data.gametime;
					$(".zam-app-gametime span").text(data.gametime);
					self.maxscore = data.maxscore;
					self.initAudio();
					self.bindEvent();
					if (data.type == 'gameiswait') {
						self.gamestatus = 1;
						self.myscore = 0;
						var tips = self.statustip[0];
					} else {
						self.gamestatus = 2;
						self.myscore = data.myscore;
						var tips = self.statustip[2];
					}
					var percent = ((self.myscore / self.maxscore).toFixed(2) * 100) + "%";
					self.setprogress(percent, self.myscore);
					self.changetip(tips);
					self.showteambox(data.teaminfo, data.jointype);
				} else if (data.type == 'gameiscountdown') {
					self.gamestatus = 1;
					self.myscore = 0;
					self.hidemyteambox();
					var b = $(".appstartdjs"), e = b.find(".appstartdjsBox"), s = b.find(".startdjsani");
					s.text(data.djs > 0 ? data.djs : 'GO');
					b.removeClass('hidden');
					self.changetip(self.statustip[1]);
					wechatcore.playAudio(self.djsaudio);
					data.djs == 0 && self.changetip(self.statustip[2]);
				} else if (data.type == 'gameisdjs') {
					if (self.gamestatus == 1) {
						self.changetip(self.statustip[2]);
					}
					self.gamestatus = 2;
					self.hidemyteambox();
					$(".appstartdjs").addClass('hidden');
					$(".zam-app-gametime span").text(data.djs);
					data.djs == 0 && self.endshake();
				} else if (data.type == 'gameshakerefresh' || data.type == 'gameappshakerefresh') {
					appsocket.closeClient();
				} else if (data.type == 'gameshowphbbtn') {
					if (self.gamestatus == 3) {
						self.showphbbtn(data.rotateid, data.gamephb, self.myteam);
						self.myteam = '0';
					}
				} else if (data.type == 'gamenoround' || data.type == 'gameislucker') {
					self.gamestatus = 0;
					self.changetip((data.type == 'gamenoround' ? '暂无正在进行的轮次' : XCV3Config.isluckertxt));
					self.playtype = -1;
					self.initplaytype();
					self.hideProgressBox();
					self.hideMask();
					self.myteam = '0';
					self.hideteamboxs();
				} else if (data.type == 'gamestartnojoin') {
					self.gamestatus = 0;
					self.myteam = '0';
					self.hideteamboxs();
					self.changetip('本轮游戏已经开始，无法加入');
					self.hideProgressBox();
					self.hideMask();
					self.playtype = -1;
					self.initplaytype();
				} else if (data.type == 'gameneedpay') {
					self.changetip('请先购买参与游戏资格');
					self.hideProgressBox();
					self.hideMask();
					self.playtype = -1;
					self.initplaytype();
					self.myteam = '0';
					self.hideteamboxs();
					wechatcore.gamePayrotate(data.rotateid, data.fee, function (res) {
						appsocket.closeClient();
					}, function (err) {
						appsocket.closeClient();
					});
				} else if (data.type == "gameshakerotatehadpay") {
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
					self.changetip(data.message);
					self.hideProgressBox();
					self.hideMask();
					self.playtype = -1;
					self.initplaytype();
					self.myteam = '0';
					self.hideteamboxs();
				}
			};
			appsocket.init(params);
			if ($("#appbgmusic").length > 0) {
				self.appbgmusic = $("#appbgmusic")[0];
				wechatcore.playAudio(self.appbgmusic);
			}
		},
		initAudio: function () {
			var self = this;
			self.shakeaudio = $('#shakeaudio')[0];
			self.djsaudio = $("#djsaudio")[0];
		},
		initplaytype: function () {
			var self = this;
			$(".zam-app-shake-ing,.zam-app-click-ing,.zam-app-rotate-ing").addClass('hidden');
			if (self.playtype == 1) {
				$(".zam-app-shake-ing").removeClass('hidden');
			} else if (self.playtype == 2) {
				$(".zam-app-rotate-ing").removeClass('hidden');
			} else if (self.playtype == 3) {
				$(".zam-app-click-ing").removeClass('hidden');
			} else {
				$("#rotate").css({ 'transform': 'rotate(0deg)', '-webkit-transform': 'rotate(0deg)' });
				self.gameInterval != null && clearInterval(self.gameInterval);
			}
		},
		bindEvent: function () {
			var self = this;
			if (self.playtype == 1) {
				if (self.myshakeEvent == null) {
					self.myshakeEvent = new Shake({ threshold: 15 });
				}
				self.myshakeEvent.start();
				$(window).off('shake').on('shake', function () {
					self.shakeEvent();
				});
			} else if (self.playtype == 2) {
				self.rotateEvent();
			} else {
				self.clickEvent();
			}
		},
		clickEvent: function () {
			var self = this;
			$('.zam-app-clickimg').off('click').on('click', function () {
				if (self.gamestatus != 2 || (self.isteam == '1' && (self.myteam == '0' || self.myteam == ''))) return;
				$(this).hide();
				$('.zam-app-clickedimg').removeClass('hidden');
				setTimeout(function () {
					$('.zam-app-clickedimg').addClass('hidden');
					$('.zam-app-clickimg').show();
				}, 3e2);
				self.workerdata();
			})
			$('.zam-app-clickedimg').off('click').on('click', function () {
				if (self.gamestatus != 2 || (self.isteam == '1' && (self.myteam == '0' || self.myteam == ''))) return;
				$(this).addClass('hidden');
				$('.zam-app-clickimg').show();
			})
		},
		touchend: true,
		rotateEvent: function () {
			var self = this, rotateImg = $("#rotate");
			if (self.gamestatus == 1) {
				rotateImg.css({ 'transform': 'rotate(0deg)', '-webkit-transform': 'rotate(0deg)' });
			}
			tempAngle = 0;
			totalAngle = 0;
			rotateImg.off('touchstart').on('touchstart', function (e) {
				if (self.gamestatus != 2 || (self.isteam == '1' && (self.myteam == '0' || self.myteam == ''))) return;
				e.preventDefault();
				self.touchend = false;
				initialTouch = e.originalEvent.targetTouches[0];
			});
			rotateImg.off('touchmove').on('touchmove', function (e) {
				if (self.gamestatus != 2 || (self.isteam == '1' && (self.myteam == '0' || self.myteam == ''))) return;
				if (self.touchend) {
					return false;
				}
				var moveTouch = e.originalEvent.targetTouches[0];
				var deltaX = moveTouch.pageX - initialTouch.pageX;
				var deltaY = moveTouch.pageY - initialTouch.pageY;
				var changeAngle = Math.atan(deltaY * -1 / deltaX) * (180 / Math.PI);
				changeAngle = (changeAngle < 0 ? (changeAngle + 180) : changeAngle);
				totalAngle += changeAngle;
				rotateImg.css({ 'transform': `rotate(${totalAngle % 360}deg)`, '-webkit-transform': `rotate(${totalAngle % 360}deg)` });
				initialTouch = moveTouch;
			});
			rotateImg.off('touchend').on('touchend', function (e) {
				self.touchend = true;
				tempAngle = 0;
				totalAngle = 0;
			});
			self.gameInterval != null && clearInterval(self.gameInterval);
			self.gameInterval = setInterval(function () {
				if (self.gamestatus != 2 || (self.isteam == '1' && (self.myteam == '0' || self.myteam == ''))) return;
				if (totalAngle > 0 && tempAngle != totalAngle && totalAngle - tempAngle >= 360) {
					tempAngle = totalAngle;
					self.workerdata();
				}
			}, 300);
		},
		shakeEvent: function () {
			var self = this, nowtime = parseInt($(".zam-app-gametime span").text()), playtime = self.gametime - nowtime;
			if (self.playtype != 1) {
				return false;
			}
			if (self.gamestatus != 2 || (self.isteam == '1' && (self.myteam == '0' || self.myteam == ''))) {
				self.myscore = 0;
				return false;
			}
			if (self.gamestatus == 2 && playtime < 4 && playtime > 0 && self.myscore > 16) {
				self.myscore = 0;
			}
			self.workerdata();
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
		stopShake: function () {
			var self = this;
			if (self.playtype == 1) {
				self.myshakeEvent.stop();
			} else if (self.playtype == 2) {
				$("#rotate").off();
				$("#rotate").css({ 'transform': 'rotate(0deg)', '-webkit-transform': 'rotate(0deg)' });
				self.gameInterval != null && clearInterval(self.gameInterval);
			} else if (self.playtype == 3) {
				$('.zam-app-clickedimg').addClass('hidden');
				$('.zam-app-clickimg').show();
			}
		},
		endshake: function () {
			var self = this;
			self.gamestatus = 3;
			self.changetip(self.statustip[3]);
			self.stopShake();
			self.showMask();
			self.myscore = 0;
			self.hideteamboxs();
		},
		setprogress: function (percent, score) {
			var self = this, p = $(".progress-box"), t = p.find(".totalshakenums"), b = p.find(".progress-bar"), c = p.find(".hadshakenums");
			if (self.gamestatus == 3) return;
			b.css({ "width": percent || "0%" });
			c.text(score || "0");
			t.text(self.maxscore);
			self.showProgressBox();
		},
		workerdata: function () {
			var self = this;
			if (self.gamestatus != 2) {
				self.myscore = 0;
				return false;
			}
			self.changetip(self.kh[Math.floor(Math.random() * self.kh.length)]);
			self.myscore++;
			if (self.myscore > self.maxscore) {
				self.setprogress("100%", self.maxscore);
			} else {
				self.setprogress(((self.myscore / self.maxscore).toFixed(2) * 100) + "%", self.myscore);
			}
			if (self.playtype == 1) {
				wechatcore.playAudio(self.shakeaudio);
				wechatcore.anicss('.zam-app-shakehand', 'shake');
			}
			appsocket.sendgamedata({
				myscore: self.myscore,
				myteam: self.myteam,
				rotateid: self.rotateid,
			});
		},
		changetip: function (tips) {
			$('.zam-app-shaketip').text(tips);
			$(".game-myteambox .game-myteam-status").text(tips);
		},
		showMask: function () {
			$(".zam-app-shake-over").removeClass('hidden');
		},
		hideMask: function () {
			$(".zam-app-shake-over").addClass('hidden');
			$(".rankInfo").remove();
		},
		showProgressBox: function () {
			$(".progress-box").removeClass('hidden');
		},
		hideProgressBox: function () {
			$(".progress-box").addClass('hidden');
			$(".zam-app-gametime span").text(0);
		},
		showphbbtn: function (rotateid, gamephb, team) {
			$(".zam-app-shake-over .phb-btn").attr({ 'data-rotateid': rotateid, 'data-gamephb': gamephb, 'data-teamid': team }).removeClass('hidden');
		},
		hidephbbtn: function () {
			$(".zam-app-shake-over .phb-btn").addClass('hidden');
		}
	};
	return appgame;
});
