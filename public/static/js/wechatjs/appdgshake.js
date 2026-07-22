define('appdgshake', ['appsocket', 'jquery.shake', 'wechatcore'], function (appsocket, Shake, wechatcore) {
	var angle = 0, totalAngle = 0, tempAngle = 0;
	var appdgshake = {
		rotateid: 0,
		gamestatus: 0,
		shaketype: -1,
		gameInterval: null,
		gametime: 30,
		myscore: 0,
		maxscore: 120,
		myshakeEvent: null,
		isteam: '2',
		myteam: '0',
		gameteams: [],
		islucker: '2',
		init: function () {
			var self = this;
			var params = {};
			params.onmessage = function (data) {
				if (data.type == 'connected') {
					appsocket.isclose = false;
					wechatcore.connectsocket({ clientid: data.clientid });
				} else if (data.type == 'gameiswait' || data.type == 'gameisrun') {
					self.islucker = '2';
					self.hideMask();//隐藏mask
					$(".appstartdjs").addClass('hidden');
					self.rotateid = data.rotateid;
					self.shaketype = 1;
					self.isteam = data.isteam;
					self.gameteams = data.teams;
					self.myteam = data.team;
					self.initshaketype();
					self.gametime = data.gametime;
					$(".zam-app-gametime span").text(data.gametime);
					self.maxscore = data.maxscore;
					self.initAudio();
					self.bindEvent();
					if (data.type == 'gameiswait') {
						self.gamestatus = 1;
						self.myscore = 0;
						var tips = statustitles[0];
					} else {
						self.gamestatus = 2;
						self.myscore = data.myscore;
						var tips = statustitles[2];
						self.changeCirclImg(1);
					}
					var percent = ((self.myscore / self.maxscore).toFixed(2) * 100) + "%";
					self.setprogress(percent, self.myscore);//设置progress并显示
					self.changetip(tips);
					self.showteambox(data.teaminfo, data.jointype);
				} else if (data.type == 'gameiscountdown') {
					self.gamestatus = 1;
					self.myscore = 0;
					self.hidemyteambox();
					var b = $(".appstartdjs"), e = b.find(".appstartdjsBox"), s = b.find(".startdjsani");
					s.text(data.djs > 0 ? data.djs : 'GO');
					b.removeClass('hidden');
					self.changetip(statustitles[1]);
					wechatcore.playAudio(self.djsaudio);
					if (data.djs == 0) {
						self.changetip(statustitles[2]);
						self.changeCirclImg(1);
					}
				} else if (data.type == 'gameisdjs') {
					if (self.gamestatus == 1) {
						self.changetip(statustitles[2]);
						self.changeCirclImg(1);
					}
					self.gamestatus = 2;
					self.hidemyteambox();
					$(".appstartdjs").addClass('hidden');
					$(".zam-app-gametime span").text(data.djs);
					data.djs == 0 && self.endshake();
				} else if (data.type == 'gamedgshakerefresh' || data.type == 'gameappdgshakerefresh') {
					appsocket.closeClient();
				} else if (data.type == 'gameshowphbbtn') {
					if (self.gamestatus == 3) {
						self.showphbbtn(data.rotateid, data.gamephb, self.myteam);
						self.myteam = '0';
					}
				} else if (data.type == 'gamenoround' || data.type == 'gameislucker') {
					if (data.type == 'gameislucker' && data.withoutscorejoin == '1') {
						self.islucker = '1';
						self.hideMask();//隐藏mask
						self.rotateid = data.rotateid;
						self.shaketype = 1;
						self.initshaketype();
						self.gametime = data.gametime;
						$(".zam-app-gametime span").text(data.gametime);
						self.maxscore = data.maxscore;
						self.initAudio();
						self.bindEvent();
						self.myscore = 0;
						if (data.status == '1') {
							self.gamestatus = 1;
							var tips = statustitles[0];
						} else {
							self.gamestatus = 2;
							var tips = statustitles[2];
							self.changeCirclImg(1);
						}
						var percent = ((self.myscore / self.maxscore).toFixed(2) * 100) + "%";
						self.setprogress(percent, self.myscore);
						self.changetip(tips);
					} else {
						self.gamestatus = 0;
						self.changetip((data.type == 'gamenoround' ? '暂无正在进行的轮次' : XCV3Config.isluckertxt));
						self.shaketype = -1;
						self.initshaketype();
						self.hideProgressBox();
						self.hideMask();
						self.myteam = '0';
						self.hideteamboxs();
					}
				} else if (data.type == 'gamestartnojoin') {
					self.gamestatus = 0;
					self.changetip('本轮游戏已经开始，无法加入');
					self.hideProgressBox();
					self.hideMask();
					self.shaketype = -1;
					self.initshaketype();
					self.myteam = '0';
					self.hideteamboxs();
				} else if (data.type == 'gameneedpay') {
					self.changetip('请先购买参与游戏资格');
					self.hideProgressBox();
					self.hideMask();
					self.shaketype = -1;
					self.initshaketype();
					self.myteam = '0';
					self.hideteamboxs();
					wechatcore.gamePayrotate(data.rotateid, data.fee, function () {
						appsocket.closeClient();
					});
				} else if (data.type == 'numislowerthan') {
					self.changetip(data.tip || '答对题目数量不足，无法参与游戏');
					self.hideProgressBox();
					self.hideMask();
					self.shaketype = -1;
					self.initshaketype();
					self.myteam = '0';
					self.hideteamboxs();
				} else if (data.type == "gamedgshakerotatehadpay") {
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
					self.shaketype = -1;
					self.initshaketype();
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
		initshaketype: function () {
			var self = this;
			$(".zam-app-shake-ing").addClass('hidden');
			if (self.shaketype == 1) {
				$(".zam-app-shake-ing").removeClass('hidden');
			} else {
				self.changeCirclImg();
			}
		},
		bindEvent: function () {
			var self = this;
			if (self.myshakeEvent == null) {
				self.myshakeEvent = new Shake({ threshold: 15 });
			}
			self.myshakeEvent.start();
			$(window).off('shake').on('shake', function () {
				self.shakeEvent();
			});
		},
		shakeEvent: function () {
			var self = this, nowtime = parseInt($(".zam-app-gametime span").text()), playtime = self.gametime - nowtime;
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
			var self = this, teaminfo = teaminfo || '', jointype = jointype || '1';
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
			self.changeCirclImg();
		},
		endshake: function () {//结束
			var self = this;
			self.gamestatus = 3;
			self.changetip(statustitles[3]);
			self.stopShake();
			self.showMask();
			self.myshakeEvent.stop();
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
			self.changetip(khtitles[Math.floor(Math.random() * khtitles.length)]);
			if (self.islucker == '2') {
				self.myscore++;
			}
			if (self.myscore > self.maxscore) {
				self.setprogress("100%", self.maxscore);
			} else {
				self.setprogress(((self.myscore / self.maxscore).toFixed(2) * 100) + "%", self.myscore);
			}
			wechatcore.playAudio(self.shakeaudio);
			if (self.islucker == '2') {
				appsocket.sendgamedata({
					myscore: self.myscore,
					myteam: self.myteam,
					rotateid: self.rotateid,
				});
			} else {
				//self.gamestatus = 0;
				self.changetip(XCV3Config.isluckertxt);
				self.shaketype = -1;
				self.initshaketype();
				self.hideProgressBox();
				self.hideMask();
				self.myteam = '0';
				self.hideteamboxs();
			}
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
		},
		showProgressBox: function () {
			$(".progress-box").removeClass('hidden');
		},
		hideProgressBox: function () {
			$(".progress-box").addClass('hidden');
			$(".zam-app-gametime span").text(0);
		},
		showphbbtn: function (rotateid, gamephb, team) {
			var btn = $(".zam-app-shake-over .phb-btn");
			btn.attr({ 'data-rotateid': rotateid, 'data-gamephb': gamephb, 'data-teamid': team }).removeClass('hidden');
		},
		hidephbbtn: function () {
			var btn = $(".money-tips .phb-btn");
			btn.removeClass('hidden');
		},
		changeCirclImg: function (type) {
			if (type == 1) {
				$(".zam-app-shakehand").addClass('shake');
			} else {
				$(".zam-app-shakehand").removeClass('shake');
			}

		}
	};
	return appdgshake;
});
