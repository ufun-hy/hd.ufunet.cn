define('appshuqian', ['appsocket', 'wechatcore'], function (appsocket, wechatcore) {
	var appshuqian = {
		rotateid: 0,
		gametime: 30,
		gamestatus: 0,
		shaketype: 1,
		statustip: ['游戏还未开始', '正在倒计时，马上开始', '游戏开始了', '游戏已结束'],
		gameInterval: null,
		myscore: 0,
		maxscore: 120,
		onemoney: 100,
		myshakeEvent: null,
		closerule: '2',
		isteam: '2',
		myteam: '0',
		gameteams: [],
		islucker: '2',
		kh: ['加油啊', '看什么看，速度了', '别停啊，伙计', '加油~加油'],
		init: function () {
			var self = this;
			self.onemoney = powernum;
			var params = {};
			params.onmessage = function (data) {
				if (data.type == 'connected') {
					appsocket.isclose = false;
					wechatcore.connectsocket({ clientid: data.clientid });
				} else if (data.type == 'gameiswait' || data.type == 'gameisrun') {
					self.islucker = '2';
					$(".appstartdjs").addClass('hidden');
					self.closerule = window.localStorage.getItem("closeshuqianrule2-" + XCV3Config.hdid);
					self.rotateid = data.rotateid;
					self.shaketype = data.shaketype;
					self.isteam = data.isteam;
					self.gameteams = data.teams;
					self.myteam = data.team;
					self.gametime = data.gametime || 30;
					$(".gametimeremain span").text(data.gametime);
					self.maxscore = data.maxscore;
					self.initAudio();
					self.bindEvent();
					if (data.type == 'gameiswait') {
						self.gamestatus = 1;
						self.myscore = 0;
						var tips = self.statustip[0];
						self.changetip(tips);
						self.hidephbbtn();
						self.onlygametip();
						//self.closerule!='1' && self.showgametip();
					} else {
						self.gamestatus = 2;
						self.myscore = data.myscore;
						var tips = self.statustip[2];
						self.changetip(tips);
						self.onlygamestatus();
						self.hidetip();
					}
					self.setprogress(self.myscore);
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
					self.hidetip();
					if (data.djs == 0) {
						self.changetip(self.statustip[2]);
						self.myscore = 0;
					}
				} else if (data.type == 'gameisdjs') {
					if (self.gamestatus == 1) {
						self.changetip(self.statustip[2]);
					}
					if (self.islucker == '2') self.hidetip();
					self.gamestatus = 2;
					self.hidemyteambox();
					$(".appstartdjs").addClass('hidden');
					$(".gametimeremain span").text(data.djs);
					if (data.djs == 0) {
						self.endshake();
					}
				} else if (data.type == 'gameshuqianrefresh' || data.type == 'gameappshuqianrefresh') {
					appsocket.closeClient();
				} else if (data.type == 'gameshowphbbtn') {
					if (self.gamestatus == 3) {
						self.showphbbtn(data.rotateid, data.gamephb, self.myteam);
						self.myteam = '0';
					}
				} else if (data.type == 'gamenoround' || data.type == 'gameislucker') {
					if (data.type == 'gameislucker' && data.withoutscorejoin == '1') {
						self.islucker = '1';
						self.closerule = window.localStorage.getItem("closeshuqianrule2-" + XCV3Config.hdid);
						self.rotateid = data.rotateid;
						//self.shaketype = data.shaketype;
						//self.isteam = data.isteam;
						//self.gameteams = data.teams;
						//self.myteam = data.team;
						$(".gametimeremain span").text(data.gametime);
						self.maxscore = data.maxscore;
						self.initAudio();
						self.bindEvent();
						self.myscore = 0;
						if (data.status == '1') {
							self.gamestatus = 1;
							var tips = self.statustip[0];
							self.changetip(tips);
							self.hidephbbtn();
							self.onlygametip();
							//self.closerule!='1' && self.showgametip();
						} else {
							self.gamestatus = 2;
							var tips = self.statustip[2];
							self.changetip(tips);
							self.onlygamestatus();
							self.hidetip();
						}
						self.setprogress(self.myscore);
					} else {
						self.gamestatus = 0;
						self.changetip((data.type == 'gamenoround' ? '暂无正在进行的轮次' : XCV3Config.isluckertxt));
						self.onlygamestatus();
						$('.ri').hide();
						$(".gametimeremain span").text(0);
						self.setprogress(0);
						self.myteam = '0';
						self.hideteamboxs();
					}
				} else if (data.type == 'gamestartnojoin') {
					self.gamestatus = 0;
					self.changetip('本轮游戏已经开始，无法加入');
					self.onlygamestatus();
					self.setprogress(0);
					$('.ri').hide();
					$(".gametimeremain span").text(0);
					self.myteam = '0';
					self.hideteamboxs();
				} else if (data.type == 'gameneedpay') {
					self.changetip('请先购买参与游戏资格');
					self.onlygamestatus();
					$(".gametimeremain span").text(0);
					self.setprogress(0);
					$('.ri').hide();
					self.myteam = '0';
					self.hideteamboxs();
					wechatcore.gamePayrotate(data.rotateid, data.fee, function () {
						appsocket.closeClient();
					});
				} else if (data.type == "gameshuqianrotatehadpay") {
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
					self.changetip(data.message);
					self.onlygamestatus();
					self.setprogress(0);
					$('.ri').hide();
					$(".gametimeremain span").text(0);
					self.myteam = '0';
					self.hideteamboxs();
				}
			};
			appsocket.init(params);
			wechatcore.gameInit(function () {
				if ($("#appbgmusic").length > 0) {
					wechatcore.playAudio($("#appbgmusic")[0]);
				}
			});
			function getHiddenProp() {
				var prefixes = ['webkit', 'moz', 'ms', 'o'];
				// if 'hidden' is natively supported just return it
				if ('hidden' in document) return 'hidden';
				// otherwise loop over all the known prefixes until we find one
				for (var i = 0; i < prefixes.length; i++) {
					if ((prefixes[i] + 'Hidden') in document)
						return prefixes[i] + 'Hidden';
				}
				// otherwise it's not supported
				return null;
			}
			var visProp = getHiddenProp();
			if (visProp) {
				var evtname = visProp.replace(/[H|h]idden/, '') + 'visibilitychange';
				document.addEventListener(evtname, function () {
					self.touchID = null;
				}, false);
			}
		},
		initAudio: function () {
			var self = this;
			self.shakeaudio = $('#shakeaudio')[0];
			self.djsaudio = $("#djsaudio")[0];
		},
		touchID: null,
		processEvent: function (event) {
			if (event.originalEvent.changedTouches) {
				var currentTouch = null;
				if (event.type == "touchstart") {
					// 假如当前无触摸点，则新建一个
					if (this.touchID == null) {
						this.touchID = event.originalEvent.changedTouches[0].identifier;
						currentTouch = event.originalEvent.changedTouches[0];
					} else {
						return false;
					}
				} else if (event.type == "touchmove") {
					// 判断触发当前事件的触摸点中是否有touchID对应的触摸点
					for (let i = 0; i < event.originalEvent.changedTouches.length; i++) {
						if (event.originalEvent.changedTouches[i].identifier == this.touchID) {
							currentTouch = event.originalEvent.changedTouches[i];
							break;
						}
					}
					if (!currentTouch) {
						return false;
					}
				} else if (event.type == "touchend" || event.type == "touchcancel") {
					// 判断触发当前事件的触摸点中是否有touchID对应的触摸点
					for (let i = 0; i < event.originalEvent.changedTouches.length; i++) {
						if (event.originalEvent.changedTouches[i].identifier == this.touchID) {
							currentTouch = event.originalEvent.changedTouches[i];
							break;
						}
					}
					if (currentTouch) {
						this.touchID = null;
					} else {
						return false;
					}
				}
				return true;
			}
			return false;
		},
		errtimes: 0,
		bindEvent: function () {
			var self = this, moneyBox = $(".money_box");
			let startY = 0;
			let hasScored = false;
			$(".body").one('click', function () {
				wechatcore.howlerPlay(self.shakeaudio);
			});
			moneyBox.off('touchstart').on('touchstart', function (event) {
				if (self.gamestatus != 2 || (self.isteam == '1' && (self.myteam == '0' || self.myteam == ''))) return;
				const touches = event.originalEvent.touches;
				if (touches.length > 1) {
					return false;
				}
				startY = touches[0].clientY;
				hasScored = false;
			});
			moneyBox.off('touchmove').on('touchmove', function (event) {
				event.preventDefault();
				var $this = $(this), moneyimg = $this.find('.money');
				if (self.gamestatus != 2 || (self.isteam == '1' && (self.myteam == '0' || self.myteam == ''))) return;
				moneyimg.show();
				const touches = event.originalEvent.touches;
				if (touches.length > 1) {
					return false;
				}
				const moveY = touches[0].clientY;
				if (startY - moveY > 50 && !hasScored) {
					hasScored = true;
					$('.ri').show();
					setTimeout(function () {
						$this.append('<div class="money"></div>');
					}, 100);
					wechatcore.howlerPlay(self.shakeaudio);
					moneyimg.animate({
						"bottom": "110%"
					}, 400, function () {
						$(this).remove();
						self.workerdata();
					});
					startY = moveY;
				}
			});
			moneyBox.off('touchend').on('touchend', function () {
				if (self.gamestatus != 2 || (self.isteam == '1' && (self.myteam == '0' || self.myteam == ''))) return;
				startY = 0;
				hasScored = false;
			});
			//var self = this, moneyBox = $(".money_box"), startY = 0, moveEndY = 0;
			/*
			moneyBox.off("touchstart").on("touchstart", function (e) {
				var flag = self.processEvent(e);
				if (!flag) {
					self.errtimes++;
					if (self.errtimes > 1) {
						self.touchID = null;
						self.errtimes = 0;
					}
					return;
				}
				if (self.gamestatus != 2 || (self.isteam == '1' && (self.myteam == '0' || self.myteam == ''))) return;
				if (e.cancelable) {
					if (!e.defaultPrevented) {
						e.preventDefault();
					}
				}
				startY = e.originalEvent.changedTouches[0].pageY;
			});
			moneyBox.off("touchend").on("touchend", function (e) {
				var flag = self.processEvent(e);
				if (!flag) return;
				if (self.gamestatus != 2 || (self.isteam == '1' && (self.myteam == '0' || self.myteam == ''))) return;
				moneyBox.find('.money').show();
				if (e.cancelable) {
					if (!e.defaultPrevented) {
						e.preventDefault();
					}
				}
				moveEndY = e.originalEvent.changedTouches[0].pageY;
				if (moveEndY - startY < -50) {
					$('.ri').show();
					wechatcore.howlerPlay(self.shakeaudio);
					moneyBox.find('.money').animate({
						"bottom": "110%"
					}, 400, function () {
						$(this).remove();
						self.workerdata();
					});
					setTimeout(function () {
						moneyBox.append('<div class="money"></div>');
					}, 100)
				}
			});
			*/
			$(".money-tips").off('click').on('click', function () {
				self.onlygamestatus();
			});
			$(".money-tips").off("touchstart").on("touchstart", function (e) {
				self.onlygamestatus();
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
			self.myscore = 0;
			$('.ri').hide();
			self.changetip(self.statustip[3]);
			self.onlygamestatus();
			self.hideteamboxs();
		},
		setprogress: function (score) {
			var self = this, p = $(".money_count");
			p.find(".money_add span").html(score * self.onemoney);
		},
		workerdata: function () {
			var self = this;
			if (self.gamestatus != 2) return;
			if (self.islucker == '2') {
				var checkscore = false, maxscore = self.gametime * 15;
				if (checkscore && self.myscore >= maxscore) {
					self.myscore = maxscore;
				} else {
					self.myscore++;
				}
				appsocket.sendgamedata({
					myscore: self.myscore,
					myteam: self.myteam,
					rotateid: self.rotateid,
				});
				self.setprogress(self.myscore);
			} else {
				self.gamestatus = 0;
				self.changetip(XCV3Config.isluckertxt);
				self.onlygamestatus();
				$('.ri').hide();
				//$(".gametimeremain span").text(0);
				self.setprogress(0);
				self.myteam = '0';
				self.hideteamboxs();
			}
		},
		onlygamestatus: function () {
			var self = this;
			self.hidegametip();
			window.localStorage.setItem("closeshuqianrule2-" + XCV3Config.hdid, '1');
			self.showgamestatus();
			self.showtip();
			self.gamestatus != 3 && self.hidephbbtn();
		},
		onlygametip: function () {
			var self = this;
			self.hidegamestatus();
			if (self.closerule != '1') {
				self.showgametip();
			} else {
				self.showgamestatus();
			}
			self.showtip();
		},
		changetip: function (tips) {
			$('.money-tips .gamestatus').html(tips);
			$(".game-myteambox .game-myteam-status").text(tips);
		},
		showtip: function () {
			$('.money-tips').removeClass('hidden');
		},
		hidetip: function () {
			$('.money-tips').addClass('hidden');
		},
		showgamestatus: function () {
			$('.money-tips .gamestatus').removeClass('hidden');
		},
		hidegamestatus: function () {
			$('.money-tips .gamestatus').addClass('hidden');
		},
		showgametip: function () {
			$('.money-tips .gametip').removeClass('hidden');
		},
		hidegametip: function () {
			$('.money-tips .gametip').addClass('hidden');
		},
		showphbbtn: function (rotateid, gamephb, team) {
			var btn = $(".money-tips .phb-btn");
			btn.attr({ 'data-rotateid': rotateid, 'data-gamephb': gamephb, 'data-teamid': team }).removeClass('hidden');
		},
		hidephbbtn: function () {
			var btn = $(".money-tips .phb-btn");
			btn.addClass('hidden');
			$(".rankInfo").remove();
		}
	};
	return appshuqian;
});
