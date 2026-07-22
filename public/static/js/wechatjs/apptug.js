define('apptug', ['appsocket', 'jquery.shake', 'wechatcore'], function (appsocket, Shake, wechatcore) {
	var angle = 0, totalAngle = 0, tempAngle = 0;
	var apptug = {
		rotateid: 0,
		gamestatus: 0,
		statustip: ['游戏还未开始', '正在倒计时，马上开始', '游戏开始了', '游戏已结束'],
		gameInterval: null,
		myscore: 0,
		myteam: 'n',
		maxscore: 120,
		selteamBox: null,
		myteamBox: null,
		myshakeEvent: null,
		kh: ['加油啊', '看什么看，速度了', '别停啊，伙计', '加油~加油'],
		init: function () {
			var self = this;
			self.selteamBox = $(".tug-selteambox");
			self.myteamBox = $(".tug-myteambox");
			var params = {};
			params.onmessage = function (data) {
				if (data.type == 'connected') {
					appsocket.isclose = false;
					wechatcore.connectsocket({ clientid: data.clientid });
				} else if (data.type == 'gameiswait' || data.type == 'gameisrun') {
					self.hideroundStatus();
					self.rotateid = data.rotateid;
					$(".zam-app-gametime span").text(data.gametime);
					self.initAudio();
					self.bindEvent();
					$(".appstartdjs").addClass('hidden');
					if (data.type == 'gameiswait') {
						self.initPage(data, 1);//初始化页面队伍
						self.gamestatus = 1;
						self.myscore = 0;
						var tips = self.statustip[0];
					} else {
						self.initPage(data, 2);//初始化页面队伍
						self.gamestatus = 2;
						self.myscore = data.myscore;
						var tips = self.statustip[2];
					}
					self.setmyscore();
					self.changetip(tips);
				} else if (data.type == 'gameiscountdown') {
					self.gamestatus = 1;
					self.myscore = 0;
					self.hideroundStatus();
					if (self.myteam == 'n') return;
					var b = $(".appstartdjs"), e = b.find(".appstartdjsBox"), s = b.find(".startdjsani");
					s.text(data.djs > 0 ? data.djs : 'GO');
					b.removeClass('hidden');
					self.changetip(self.statustip[1]);
					wechatcore.playAudio(self.djsaudio);
					if (data.djs == 0) {
						self.changetip(self.statustip[2]);
					}
				} else if (data.type == 'gameisdjs') {
					self.hideroundStatus();
					if (self.myteam == 'n') return;
					if (self.gamestatus == 1) {
						self.changetip(self.statustip[2]);
					}
					self.gamestatus = 2;
					self.myteamBox.find(".tug-myteam-myscore").removeClass('hidden');
					self.myteamBox.find(".tug-myteam-tuichu").addClass('hidden');
					$(".appstartdjs").addClass('hidden');
					$(".zam-app-gametime span").text(data.djs);
					data.djs == 0 && self.endshake();
				} else if (data.type == 'gametugrefresh' || data.type == 'gameapptugrefresh') {//roundinfo is chanaged Or create a new round
					appsocket.closeClient();
				} else if (data.type == 'gamenoround' || data.type == 'gameislucker') {
					self.gamestatus = 0;
					self.changetip((data.type == 'gamenoround' ? '暂无正在进行的轮次' : XCV3Config.isluckertxt));
					self.showroundStatus();
					self.selteamBox.addClass('hidden');
					self.myteamBox.addClass('hidden');
				} else if (data.type == 'gamestartnojoin') {
					self.gamestatus = 0;
					self.changetip('本轮游戏已经开始，无法加入');
					self.showroundStatus();
					self.selteamBox.addClass('hidden');
					self.myteamBox.addClass('hidden');
				} else if (data.type == 'gameneedpay') {
					self.changetip('请先购买参与游戏资格');
					self.showroundStatus();
					self.selteamBox.addClass('hidden');
					self.myteamBox.addClass('hidden');
					wechatcore.gamePayrotate(data.rotateid, data.fee, function () {
						appsocket.closeClient();
					});
				} else if (data.type == "gametugrotatehadpay") {
					if (data.userid == XCV3Config.userid) {
						window.location.reload();
					}
				} else if (data.type == 'gamerounderror') {
					//alert('gamerounderror');
				} else if (data.type == 'addblack') {
					data.userid == XCV3Config.userid && WeixinJSBridge.call('closeWindow');
				} else if (data.type == 'goto') {
					wechatcore.goto(data);
				} else if (data.type == 'luckeruserids') {
					wechatcore.layerAsklucker(data);
				} else if (data.type == 'gamejointeam') {
					if (data.userid == XCV3Config.userid && data.gametype == XCV3Config.gametype) {
						self.jointeam(data.data);
					}
				} else if (data.type == 'gameoutteam') {
					if (data.userid == XCV3Config.userid && data.gametype == XCV3Config.gametype) {
						self.outteam(data.data);
					}
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
		bindEvent: function () {
			var self = this;
			self.selteamBox.find('.tug-team').off('click').on('click', function () {
				var $this = $(this), selteam = $this.attr('data-team');
				wechatcore.ajaxSubmit('/wechat/common/tugjointeam', { gametype: XCV3Config.gametype, team: selteam }, '正在加入..').then(function (json) {
					if (json.code == 0) {
						var type = json.msg.type || '1';
						if (type == '1') {
							self.jointeam(json.msg);
						} else {
							wechatcore.msg(json.msg.msg || '队伍人数已满');
							self.selteamBox.find('.r-team .tug-team-join span').text(json.msg.onlineInfo.r || 0);
							self.selteamBox.find('.b-team .tug-team-join span').text(json.msg.onlineInfo.b || 0);
						}
					} else {
						wechatcore.msg(json.msg);
					}
				}, function () {
					wechatcore.msg('网络异常，加入失败');
				});
			});
			self.myteamBox.find('.tug-myteam-tuichu').off('click').on('click', function () {
				wechatcore.ajaxSubmit('/wechat/common/tugoutteam', { gametype: XCV3Config.gametype }, '正在退出..').then(function (json) {
					if (json.code == 0) {
						self.outteam(json.msg);
					} else {
						wechatcore.msg(json.msg);
					}
				}, function () {
					wechatcore.msg('网络异常，退出失败');
				});
			});
			if (self.myshakeEvent == null) {
				self.myshakeEvent = new Shake({ threshold: 15 });
				self.myshakeEvent.start();
				window.addEventListener('shake', function () {
					self.shakeEvent();
				}, false);
			} else {
				self.myshakeEvent.start();
			}
		},
		shakeEvent: function () {
			var self = this;
			if (self.myteam == 'n' || self.gamestatus != 2) {
				self.myscore = 0;
				return false;
			}
			self.changetip(self.kh[Math.floor(Math.random() * self.kh.length)]);
			self.myscore++;
			wechatcore.playAudio(self.shakeaudio);
			self.setmyscore();
			appsocket.sendgamedata({
				myscore: self.myscore,
				myteam: self.myteam,
				rotateid: self.rotateid,
			});
		},
		stopShake: function () {
			var self = this;
		},
		endshake: function () {//结束
			var self = this;
			self.gamestatus = 3;
			self.changetip(self.statustip[3]);
			self.stopShake();
			self.myshakeEvent.stop();
			self.myscore = 0;
		},
		setmyscore: function () {
			var self = this;
			$(".tug-myteam-myscore span").text(self.myscore);
		},
		senddata: function (obj) {
			var senddata = appsocket.senddata;
			senddata.type = 'tuggame';
			$.extend(senddata, obj);
			appsocket.wssend(senddata);
		},
		initPage: function (data, type) {
			var self = this;
			self.myteam = data.team;
			type = type || 1;
			self.selteamBox.find('.r-team .tug-team-join span').text(data.onlineInfo.r);
			self.selteamBox.find('.r-team .tug-team-logo img').attr("src", data.roundparas.redlogo);
			self.selteamBox.find('.r-team .tug-team-name').text(data.roundparas.redname);
			self.selteamBox.find('.b-team .tug-team-join span').text(data.onlineInfo.b);
			self.selteamBox.find('.b-team .tug-team-logo img').attr("src", data.roundparas.bluelogo);
			self.selteamBox.find('.b-team .tug-team-name').text(data.roundparas.bluename);
			if (data.team != 'n') {
				self.selteamBox.addClass('hidden');
				self.myteamBox.find('.tug-myteam .tug-team-logo img').attr("src", data.team == 'r' ? data.roundparas.redlogo : data.roundparas.bluelogo);
				self.myteamBox.find('.tug-myteam .tug-team-name').text(data.team == 'r' ? data.roundparas.redname : data.roundparas.bluename);
				if (type == 1) {
					self.myteamBox.find(".tug-myteam-myscore").addClass('hidden');
					self.myteamBox.find(".tug-myteam-tuichu").removeClass('hidden');
				} else {
					self.myteamBox.find(".tug-myteam-myscore").removeClass('hidden');
					self.myteamBox.find(".tug-myteam-tuichu").addClass('hidden');
				}
				self.myteamBox.removeClass('hidden');
			} else {
				self.selteamBox.removeClass('hidden');
				self.myteamBox.addClass('hidden');
			}
		},
		jointeam: function (data) {
			var self = this;
			self.myteam = data.team;
			self.selteamBox.find('.r-team .tug-team-join span').text(data.onlineInfo.r);
			self.selteamBox.find('.b-team .tug-team-join span').text(data.onlineInfo.b);
			if (data.team != 'n') {
				self.myteamBox.find('.tug-myteam .tug-team-logo img').attr("src", data.team == 'r' ? data.roundparas.redlogo : data.roundparas.bluelogo);
				self.myteamBox.find('.tug-myteam .tug-team-name').text(data.team == 'r' ? data.roundparas.redname : data.roundparas.bluename);
				self.selteamBox.addClass('hidden');
				if (self.gamestatus == 1) {
					self.changetip(self.statustip[0]);
					self.myteamBox.find(".tug-myteam-myscore").addClass('hidden');
					self.myteamBox.find(".tug-myteam-tuichu").removeClass('hidden');
				} else {
					self.changetip(self.statustip[2]);
					self.myteamBox.find(".tug-myteam-myscore").removeClass('hidden');
					self.myteamBox.find(".tug-myteam-tuichu").addClass('hidden');
				}
				self.myteamBox.removeClass('hidden');
			}
		},
		outteam: function (data) {
			var self = this;
			self.myteam = 'n';
			self.selteamBox.find('.r-team .tug-team-join span').text(data.onlineInfo.r);
			self.selteamBox.find('.r-team .tug-team-logo img').attr("src", data.roundparas.redlogo)
			self.selteamBox.find('.r-team .tug-team-name').text(data.roundparas.redname);
			self.selteamBox.find('.b-team .tug-team-join span').text(data.onlineInfo.b);
			self.selteamBox.find('.b-team .tug-team-logo img').attr("src", data.roundparas.bluelogo);
			self.selteamBox.find('.b-team .tug-team-name').text(data.roundparas.bluename);
			self.myteamBox.addClass('hidden');
			self.selteamBox.removeClass('hidden');
		},
		changetip: function (tips) {
			$('.tug-myteam-status').text(tips);
		},
		showroundStatus: function () {
			$(".tug-roundstatus").removeClass('hidden');
		},
		hideroundStatus: function () {
			$(".tug-roundstatus").addClass('hidden');
		},
	};
	return apptug;
});
